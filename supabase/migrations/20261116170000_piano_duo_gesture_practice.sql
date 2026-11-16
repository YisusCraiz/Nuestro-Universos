BEGIN;
ALTER TABLE public.jj_piano_runs ADD COLUMN gesture_practice boolean NOT NULL DEFAULT false;
ALTER TABLE public.jj_piano_rooms ADD CONSTRAINT jj_piano_practice_no_wager
  CHECK ((settings->'gesture_practice') IS DISTINCT FROM 'true'::jsonb OR wager IS NULL);
ALTER FUNCTION public.jj_piano(text, uuid, jsonb) RENAME TO jj_piano_ranked;
REVOKE ALL ON FUNCTION public.jj_piano_ranked(text, uuid, jsonb) FROM PUBLIC, anon, authenticated;

CREATE FUNCTION jj_piano_private.run(action text, run_id uuid, data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  owner_id uuid := auth.uid();
  entry public.jj_piano_runs;
  payload jsonb;
  practice boolean := coalesce(data->'gesture_practice' = 'true'::jsonb, false);
BEGIN
  IF owner_id IS NULL OR NOT public.is_member() THEN RAISE EXCEPTION 'NOT_MEMBER'; END IF;
  IF action IN ('start', 'finish') THEN
    PERFORM pg_advisory_xact_lock(hashtextextended(run_id::text, 34));
    SELECT * INTO entry FROM public.jj_piano_runs WHERE id = run_id FOR UPDATE;
    IF FOUND AND entry.user_id <> owner_id THEN RAISE EXCEPTION 'NOT_YOUR_RUN'; END IF;
  END IF;
  IF action = 'start' THEN
    IF entry.id IS NOT NULL AND entry.gesture_practice <> practice THEN RAISE EXCEPTION 'REQUEST_MISMATCH'; END IF;
    payload := public.jj_piano_ranked(action, run_id, data);
    IF practice THEN UPDATE public.jj_piano_runs SET gesture_practice = true WHERE id = run_id; END IF;
    RETURN payload;
  END IF;
  IF action = 'finish' AND entry.gesture_practice THEN
    IF NOT practice THEN RAISE EXCEPTION 'PRACTICE_CLIENT_REQUIRED'; END IF;
    IF entry.state = 'finished' THEN RETURN entry.result; END IF;
    IF entry.state <> 'playing' OR entry.started < clock_timestamp() - interval '1 hour' OR NOT EXISTS (
      SELECT 1 FROM public.jj_piano_rooms
      WHERE (host_run = run_id OR guest_run = run_id)
        AND starts_at IS NOT NULL AND NOT closed AND settings->'gesture_practice' = 'true'::jsonb
    ) THEN RAISE EXCEPTION 'RUN_EXPIRED'; END IF;
    IF clock_timestamp() < entry.started + (entry.duration - 1) * interval '1 second' THEN
      RAISE EXCEPTION 'RUN_TOO_EARLY';
    END IF;
    payload := '{"practice":true}'::jsonb;
    UPDATE public.jj_piano_runs SET state = 'finished', result = payload WHERE id = run_id;
    RETURN payload;
  END IF;
  RETURN public.jj_piano_ranked(action, run_id, data);
END;
$$;
REVOKE ALL ON FUNCTION jj_piano_private.run(text, uuid, jsonb) FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA jj_piano_private TO authenticated;
GRANT EXECUTE ON FUNCTION jj_piano_private.run(text, uuid, jsonb) TO authenticated;
CREATE FUNCTION public.jj_piano(p_action text, p_id uuid, p_data jsonb DEFAULT '{}')
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  SELECT jj_piano_private.run(p_action, p_id, p_data);
$$;
REVOKE ALL ON FUNCTION public.jj_piano(text, uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.jj_piano(text, uuid, jsonb) TO authenticated;
COMMIT;
