BEGIN;
CREATE SCHEMA IF NOT EXISTS jj_guest_duel;
REVOKE ALL ON SCHEMA jj_guest_duel FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA jj_guest_duel TO anon, authenticated;

CREATE TABLE jj_guest_duel.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  invite bytea NOT NULL,
  pin_hash bytea NOT NULL,
  guest_key bytea,
  guest_seen timestamptz,
  failed_claims integer NOT NULL DEFAULT 0,
  expires timestamptz NOT NULL DEFAULT clock_timestamp()+interval '20 minutes',
  closed boolean NOT NULL DEFAULT false,
  chart jsonb NOT NULL,
  song_url text NOT NULL,
  title text NOT NULL,
  difficulty integer NOT NULL,
  duration integer NOT NULL,
  starts_at timestamptz,
  guest_ready boolean NOT NULL DEFAULT false,
  host_score integer,
  guest_score integer
);
ALTER TABLE jj_guest_duel.rooms ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON jj_guest_duel.rooms FROM PUBLIC,anon,authenticated;

CREATE FUNCTION jj_guest_duel.tally(chart jsonb, difficulty integer, seconds integer, events jsonb)
RETURNS integer LANGUAGE plpgsql SET search_path='' AS $$
DECLARE
  times integer[];
  lanes integer[];
  used boolean[];
  tap jsonb;
  moment integer;
  lane integer;
  previous integer := -1;
  points integer := 0;
  idx integer;
  candidate integer;
  nearest integer;
  distance integer;
  tolerance integer := (ARRAY[180,140,105])[difficulty];
BEGIN
  IF jsonb_typeof(events) IS DISTINCT FROM 'array' OR jsonb_array_length(events)>1500 THEN
    RAISE EXCEPTION 'INVALID_INPUT';
  END IF;
  SELECT array_agg((note->>'t')::integer ORDER BY ordered.idx),array_agg((note->>'l')::integer ORDER BY ordered.idx)
  INTO times,lanes FROM jsonb_array_elements(chart) WITH ORDINALITY AS ordered(note,idx);
  used := array_fill(false,ARRAY[cardinality(times)]);
  FOR tap IN SELECT value FROM jsonb_array_elements(events) LOOP
    IF jsonb_typeof(tap) IS DISTINCT FROM 'array' OR jsonb_array_length(tap)<>2
       OR jsonb_typeof(tap->0) IS DISTINCT FROM 'number' OR jsonb_typeof(tap->1) IS DISTINCT FROM 'number'
    THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
    moment := (tap->>0)::integer;
    lane := (tap->>1)::integer;
    IF moment<greatest(0,previous) OR moment>seconds*1000 OR lane NOT BETWEEN 0 AND 3 THEN
      RAISE EXCEPTION 'INVALID_INPUT';
    END IF;
    previous := moment;
    candidate := 0;
    nearest := tolerance+1;
    FOR idx IN 1..cardinality(times) LOOP
      IF NOT used[idx] AND lanes[idx]=lane THEN
        distance := abs(times[idx]-moment);
        IF distance<nearest THEN nearest:=distance;candidate:=idx;END IF;
      END IF;
    END LOOP;
    IF candidate=0 THEN points:=points-10;
    ELSE
      used[candidate]:=true;
      points:=points+CASE WHEN nearest<=tolerance/2 THEN 100 ELSE 70 END;
    END IF;
  END LOOP;
  RETURN greatest(0,points);
END;
$$;
REVOKE ALL ON FUNCTION jj_guest_duel.tally(jsonb,integer,integer,jsonb) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION jj_guest_duel.access_room(action text, room_id uuid, secret text, payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  room jj_guest_duel.rooms;
  actor uuid := auth.uid();
  host boolean;
  digest bytea;
  browser_key text := payload->>'browser_key';
  score integer;
  chart_length integer;
  duration_seconds integer;
  difficulty_level integer;
BEGIN
  IF action='create' THEN
    IF actor IS NULL OR public.is_jesus() IS NOT TRUE THEN RAISE EXCEPTION 'HOST_ONLY'; END IF;
    duration_seconds := (payload->>'duration')::integer;
    difficulty_level := (payload->>'difficulty')::integer;
    IF length(coalesce(secret,''))<>64 OR secret !~ '^[0-9a-f]+$'
       OR coalesce(payload->>'pin','') !~ '^[0-9]{6}$'
       OR coalesce(payload->>'url','') !~ '^https://wainkarkdlbfprgytyty\.supabase\.co/storage/v1/object/sign/universe/'
       OR length(coalesce(payload->>'title','')) NOT BETWEEN 1 AND 160
       OR duration_seconds IS NULL OR duration_seconds NOT BETWEEN 20 AND 90
       OR difficulty_level IS NULL OR difficulty_level NOT BETWEEN 1 AND 3
       OR jsonb_typeof(payload->'chart') IS DISTINCT FROM 'array'
    THEN RAISE EXCEPTION 'INVALID_MATCH'; END IF;
    chart_length := jsonb_array_length(payload->'chart');
    IF chart_length NOT BETWEEN 20 AND 600 OR EXISTS (
      SELECT 1 FROM jsonb_array_elements(payload->'chart') AS n(note)
      WHERE jsonb_typeof(note->'t') IS DISTINCT FROM 'number'
         OR jsonb_typeof(note->'l') IS DISTINCT FROM 'number'
         OR (note->>'t')::integer NOT BETWEEN 1000 AND duration_seconds*1000-500
         OR (note->>'l')::integer NOT BETWEEN 0 AND 3
    ) THEN RAISE EXCEPTION 'INVALID_CHART'; END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended(actor::text, 921));
    DELETE FROM jj_guest_duel.rooms WHERE expires < now()-interval '1 day';
    UPDATE jj_guest_duel.rooms SET closed=true WHERE owner_id=actor AND NOT closed;
    INSERT INTO jj_guest_duel.rooms(owner_id,invite,pin_hash,chart,song_url,title,difficulty,duration)
    VALUES(actor,sha256(convert_to(secret,'UTF8')),sha256(convert_to(secret||(payload->>'pin'),'UTF8')),
      payload->'chart',payload->>'url',payload->>'title',difficulty_level,duration_seconds)
    RETURNING * INTO room;
    RETURN jsonb_build_object('id',room.id);
  END IF;

  SELECT * INTO room FROM jj_guest_duel.rooms WHERE id=room_id FOR UPDATE;
  IF NOT FOUND OR room.closed OR room.expires<=clock_timestamp() THEN RETURN '{"denied":true}'; END IF;
  host := actor IS NOT NULL AND actor=room.owner_id;
  IF NOT host THEN
    IF actor IS NOT NULL OR length(coalesce(secret,''))<>64 OR secret !~ '^[0-9a-f]+$' THEN RETURN '{"denied":true}'; END IF;
    digest := sha256(convert_to(secret,'UTF8'));
    IF action='claim' THEN
      IF digest<>room.invite OR room.failed_claims>=15 OR coalesce(browser_key,'') !~ '^[0-9a-f]{64}$'
         OR coalesce(payload->>'pin','') !~ '^[0-9]{6}$' THEN RETURN '{"denied":true}'; END IF;
      IF room.guest_key IS NOT NULL THEN
        IF room.guest_key<>sha256(convert_to(browser_key,'UTF8')) THEN RETURN '{"denied":true}'; END IF;
      ELSIF room.pin_hash<>sha256(convert_to(secret||(payload->>'pin'),'UTF8')) THEN
        UPDATE jj_guest_duel.rooms SET failed_claims=failed_claims+1 WHERE id=room.id;
        RETURN '{"denied":true}';
      ELSE
        room.guest_key := sha256(convert_to(browser_key,'UTF8'));
      END IF;
    ELSIF room.guest_key IS DISTINCT FROM digest THEN
      RETURN '{"denied":true}';
    END IF;
  END IF;

  IF room.guest_seen IS NOT NULL AND room.guest_seen<clock_timestamp()-interval '50 seconds' THEN
    UPDATE jj_guest_duel.rooms SET closed=true WHERE id=room.id;
    RETURN '{"denied":true}';
  END IF;
  IF NOT host THEN
    UPDATE jj_guest_duel.rooms SET guest_key=room.guest_key,guest_seen=clock_timestamp()
    WHERE id=room.id RETURNING * INTO room;
  END IF;

  IF action='leave' THEN
    UPDATE jj_guest_duel.rooms SET closed=true WHERE id=room.id;
    RETURN '{"denied":true}';
  ELSIF action='ready' AND NOT host AND room.starts_at IS NULL THEN
    UPDATE jj_guest_duel.rooms SET guest_ready=true WHERE id=room.id RETURNING * INTO room;
  ELSIF action='start' AND host AND room.guest_ready THEN
    IF room.starts_at IS NULL THEN
      UPDATE jj_guest_duel.rooms SET starts_at=clock_timestamp()+interval '7 seconds'
      WHERE id=room.id RETURNING * INTO room;
    END IF;
  ELSIF action='finish' THEN
    IF room.starts_at IS NULL OR clock_timestamp()<room.starts_at+(room.duration-1)*interval '1 second' THEN
      RAISE EXCEPTION 'TOO_EARLY';
    END IF;
    score := jj_guest_duel.tally(room.chart,room.difficulty,room.duration,payload->'events');
    UPDATE jj_guest_duel.rooms SET
      host_score=CASE WHEN host THEN coalesce(host_score,score) ELSE host_score END,
      guest_score=CASE WHEN host THEN guest_score ELSE coalesce(guest_score,score) END
    WHERE id=room.id RETURNING * INTO room;
  ELSIF action NOT IN ('read','claim') THEN
    RAISE EXCEPTION 'INVALID_ACTION';
  END IF;

  RETURN jsonb_build_object(
    'id',room.id,'guest_joined',room.guest_key IS NOT NULL,'ready',room.guest_ready,
    'starts_at',room.starts_at,'server_now',clock_timestamp(),'chart',room.chart,
    'url',room.song_url,'title',room.title,'difficulty',room.difficulty,'duration',room.duration,
    'host_score',room.host_score,'guest_score',room.guest_score
  );
END;
$$;
REVOKE ALL ON FUNCTION jj_guest_duel.access_room(text,uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION jj_guest_duel.access_room(text,uuid,text,jsonb) TO anon,authenticated;
CREATE FUNCTION public.jj_tobey_duel(p_action text,p_room uuid DEFAULT NULL,p_secret text DEFAULT NULL,p_data jsonb DEFAULT '{}')
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$
  SELECT jj_guest_duel.access_room(p_action,p_room,p_secret,p_data);
$$;
REVOKE ALL ON FUNCTION public.jj_tobey_duel(text,uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.jj_tobey_duel(text,uuid,text,jsonb) TO anon,authenticated;
COMMIT;
