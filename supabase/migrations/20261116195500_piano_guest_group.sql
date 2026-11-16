BEGIN;
CREATE TABLE jj_guest_duel.group_rooms (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL,
 chart jsonb NOT NULL, song_url text NOT NULL, title text NOT NULL,
 difficulty integer NOT NULL, duration integer NOT NULL,
 expires timestamptz NOT NULL DEFAULT clock_timestamp()+interval '20 minutes',
 starts_at timestamptz, closed boolean NOT NULL DEFAULT false, score integer
);
CREATE TABLE jj_guest_duel.group_seats (
 room_id uuid REFERENCES jj_guest_duel.group_rooms(id) ON DELETE CASCADE,
 name text NOT NULL CHECK(name IN ('Julie','Sani','Tobey')),
 invite bytea NOT NULL, pin_hash bytea NOT NULL, guest_key bytea, seen timestamptz,
 failed integer NOT NULL DEFAULT 0, ready boolean NOT NULL DEFAULT false,
 left_room boolean NOT NULL DEFAULT false, score integer,
 PRIMARY KEY(room_id,name), UNIQUE(room_id,invite), UNIQUE(room_id,guest_key)
);
ALTER TABLE jj_guest_duel.group_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE jj_guest_duel.group_seats ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON jj_guest_duel.group_rooms,jj_guest_duel.group_seats FROM PUBLIC,anon,authenticated;

CREATE FUNCTION jj_guest_duel.access_group(action text, target uuid, secret text, payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
 room jj_guest_duel.group_rooms;
 seat jj_guest_duel.group_seats;
 actor uuid:=auth.uid();
 host boolean;
 digest bytea;
 entry jsonb;
 token text;
 pin text;
 browser_key text:=payload->>'browser_key';
 minutes integer;
 difficulty integer;
 points integer;
BEGIN
 IF action='create' THEN
  IF actor IS NULL OR public.is_jesus() IS NOT TRUE THEN RAISE EXCEPTION 'HOST_ONLY'; END IF;
  minutes:=(payload->>'duration')::integer;
  difficulty:=(payload->>'difficulty')::integer;
  IF minutes IS NULL OR minutes NOT BETWEEN 20 AND 90 OR difficulty IS NULL OR difficulty NOT BETWEEN 1 AND 3
     OR length(coalesce(payload->>'title','')) NOT BETWEEN 1 AND 160
     OR coalesce(payload->>'url','') !~ '^https://wainkarkdlbfprgytyty\.supabase\.co/storage/v1/object/sign/universe/'
     OR jsonb_typeof(payload->'chart') IS DISTINCT FROM 'array'
     OR jsonb_typeof(payload->'invites') IS DISTINCT FROM 'object'
  THEN RAISE EXCEPTION 'INVALID_MATCH'; END IF;
  IF jsonb_array_length(payload->'chart') NOT BETWEEN 20 AND 600 OR EXISTS (
   SELECT 1 FROM jsonb_array_elements(payload->'chart') AS n(note)
   WHERE jsonb_typeof(note->'t') IS DISTINCT FROM 'number' OR jsonb_typeof(note->'l') IS DISTINCT FROM 'number'
      OR (note->>'t')::integer NOT BETWEEN 1000 AND minutes*1000-500
      OR (note->>'l')::integer NOT BETWEEN 0 AND 3
  ) THEN RAISE EXCEPTION 'INVALID_CHART'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(actor::text,922));
  DELETE FROM jj_guest_duel.group_rooms WHERE expires<now()-interval '1 day';
  UPDATE jj_guest_duel.group_rooms SET closed=true WHERE owner_id=actor AND NOT closed;
  INSERT INTO jj_guest_duel.group_rooms(owner_id,chart,song_url,title,difficulty,duration)
  VALUES(actor,payload->'chart',payload->>'url',payload->>'title',difficulty,minutes) RETURNING * INTO room;
  FOR entry IN SELECT jsonb_build_object('name',n,'invite',payload->'invites'->n)
    FROM unnest(ARRAY['Julie','Sani','Tobey']) AS names(n) LOOP
   token:=entry->'invite'->>'token'; pin:=entry->'invite'->>'pin';
   IF coalesce(token,'') !~ '^[0-9a-f]{64}$' OR coalesce(pin,'') !~ '^[0-9]{6}$' THEN
    RAISE EXCEPTION 'INVALID_INVITE';
   END IF;
   INSERT INTO jj_guest_duel.group_seats(room_id,name,invite,pin_hash)
   VALUES(room.id,entry->>'name',sha256(convert_to(token,'UTF8')),sha256(convert_to(token||pin,'UTF8')));
  END LOOP;
  RETURN jsonb_build_object('id',room.id);
 END IF;

 SELECT * INTO room FROM jj_guest_duel.group_rooms WHERE id=target FOR UPDATE;
 IF NOT FOUND OR room.closed OR room.expires<=clock_timestamp() THEN RETURN '{"denied":true}'; END IF;
 host:=actor IS NOT NULL AND actor=room.owner_id;
 IF NOT host THEN
  IF actor IS NOT NULL OR coalesce(secret,'') !~ '^[0-9a-f]{64}$' THEN RETURN '{"denied":true}'; END IF;
  digest:=sha256(convert_to(secret,'UTF8'));
  IF action='claim' THEN
   SELECT * INTO seat FROM jj_guest_duel.group_seats WHERE room_id=target AND invite=digest;
   IF NOT FOUND OR seat.left_room OR seat.failed>=15 OR coalesce(browser_key,'') !~ '^[0-9a-f]{64}$'
      OR coalesce(payload->>'pin','') !~ '^[0-9]{6}$' THEN RETURN '{"denied":true}'; END IF;
   IF seat.guest_key IS NOT NULL THEN
    IF seat.guest_key<>sha256(convert_to(browser_key,'UTF8')) THEN RETURN '{"denied":true}'; END IF;
   ELSIF seat.pin_hash<>sha256(convert_to(secret||(payload->>'pin'),'UTF8')) THEN
    UPDATE jj_guest_duel.group_seats SET failed=failed+1 WHERE room_id=target AND name=seat.name;
    RETURN '{"denied":true}';
   ELSE
    seat.guest_key:=sha256(convert_to(browser_key,'UTF8'));
   END IF;
  ELSE
   SELECT * INTO seat FROM jj_guest_duel.group_seats WHERE room_id=target AND guest_key=digest;
   IF NOT FOUND OR seat.left_room THEN RETURN '{"denied":true}'; END IF;
  END IF;
 END IF;
 UPDATE jj_guest_duel.group_seats SET left_room=true
 WHERE room_id=target AND seen<clock_timestamp()-interval '50 seconds' AND NOT left_room;
 IF NOT host THEN
  IF EXISTS(SELECT 1 FROM jj_guest_duel.group_seats WHERE room_id=target AND name=seat.name AND left_room)
  THEN RETURN '{"denied":true}'; END IF;
  UPDATE jj_guest_duel.group_seats SET guest_key=seat.guest_key,seen=clock_timestamp()
  WHERE room_id=target AND name=seat.name;
 END IF;

 IF action='leave' THEN
  IF host THEN UPDATE jj_guest_duel.group_rooms SET closed=true WHERE id=target;
  ELSE UPDATE jj_guest_duel.group_seats SET left_room=true WHERE room_id=target AND name=seat.name;
  END IF;
  RETURN '{"denied":true}';
 ELSIF action='ready' AND NOT host AND room.starts_at IS NULL THEN
  UPDATE jj_guest_duel.group_seats SET ready=true WHERE room_id=target AND name=seat.name;
 ELSIF action='start' AND host THEN
  IF room.starts_at IS NULL THEN
   IF EXISTS(SELECT 1 FROM jj_guest_duel.group_seats WHERE room_id=target AND (NOT ready OR left_room))
   THEN RAISE EXCEPTION 'NOT_READY'; END IF;
   UPDATE jj_guest_duel.group_rooms SET starts_at=clock_timestamp()+interval '7 seconds'
   WHERE id=target RETURNING * INTO room;
  END IF;
 ELSIF action='finish' THEN
  IF room.starts_at IS NULL OR clock_timestamp()<room.starts_at+(room.duration-1)*interval '1 second'
  THEN RAISE EXCEPTION 'TOO_EARLY'; END IF;
  points:=jj_guest_duel.tally(room.chart,room.difficulty,room.duration,payload->'events');
  IF host THEN UPDATE jj_guest_duel.group_rooms SET score=coalesce(score,points) WHERE id=target RETURNING * INTO room;
  ELSE UPDATE jj_guest_duel.group_seats SET score=coalesce(score,points) WHERE room_id=target AND name=seat.name;
  END IF;
 ELSIF action NOT IN ('read','claim') THEN RAISE EXCEPTION 'INVALID_ACTION';
 END IF;

 RETURN jsonb_build_object(
  'id',room.id,'your_seat',seat.name,'starts_at',room.starts_at,'server_now',clock_timestamp(),
  'chart',room.chart,'url',room.song_url,'title',room.title,'difficulty',room.difficulty,'duration',room.duration,
  'host_score',room.score,
  'seats',(SELECT jsonb_agg(jsonb_build_object('name',s.name,'joined',s.guest_key IS NOT NULL,'ready',s.ready,'left',s.left_room,'score',s.score) ORDER BY s.name)
           FROM jj_guest_duel.group_seats s WHERE s.room_id=target)
 );
END;
$$;
REVOKE ALL ON FUNCTION jj_guest_duel.access_group(text,uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION jj_guest_duel.access_group(text,uuid,text,jsonb) TO anon,authenticated;
CREATE FUNCTION public.jj_piano_guest_group(p_action text,p_room uuid DEFAULT NULL,p_secret text DEFAULT NULL,p_data jsonb DEFAULT '{}')
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$
 SELECT jj_guest_duel.access_group(p_action,p_room,p_secret,p_data);
$$;
REVOKE ALL ON FUNCTION public.jj_piano_guest_group(text,uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.jj_piano_guest_group(text,uuid,text,jsonb) TO anon,authenticated;
COMMIT;
