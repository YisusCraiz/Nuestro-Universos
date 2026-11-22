CREATE TABLE IF NOT EXISTS jj_golf.presence (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, session_id)
);
ALTER TABLE jj_golf.presence ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON jj_golf.presence FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.jj_golf_presence(p_session uuid, p_action text DEFAULT 'read')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid := auth.uid();
BEGIN
  IF NOT public.is_member() OR NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id=actor AND handle IN ('jesus','julisa')
  ) THEN RAISE EXCEPTION 'NOT_MEMBER'; END IF;
  IF p_session IS NULL THEN RAISE EXCEPTION 'INVALID_SESSION'; END IF;
  IF p_action='ping' THEN
    DELETE FROM jj_golf.presence WHERE user_id=actor AND seen_at<now()-interval '1 minute';
    INSERT INTO jj_golf.presence(user_id,session_id) VALUES(actor,p_session)
    ON CONFLICT(user_id,session_id) DO UPDATE SET seen_at=now();
  ELSIF p_action='leave' THEN
    DELETE FROM jj_golf.presence WHERE user_id=actor AND session_id=p_session;
  ELSIF p_action IS DISTINCT FROM 'read' THEN
    RAISE EXCEPTION 'INVALID_ACTION';
  END IF;
  RETURN coalesce((SELECT jsonb_object_agg(p.handle,jsonb_build_object(
    'online', EXISTS(SELECT 1 FROM jj_golf.presence s WHERE s.user_id=p.id AND s.seen_at>now()-interval '1 minute'),
    'outfit', coalesce(o.skin,'casual')
  )) FROM public.profiles p LEFT JOIN public.bb_equipped o ON o.user_id=p.id WHERE p.handle IN ('jesus','julisa')), '{}'::jsonb);
END;
$$;
REVOKE ALL ON FUNCTION public.jj_golf_presence(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.jj_golf_presence(uuid,text) TO authenticated;
