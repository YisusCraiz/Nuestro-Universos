BEGIN;

CREATE SCHEMA IF NOT EXISTS jj_piano_private;
REVOKE ALL ON SCHEMA jj_piano_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA jj_piano_private TO authenticated;

CREATE UNIQUE INDEX IF NOT EXISTS jj_piano_skin_purchase_once
  ON public.jj_money_log (user_id, (data->>'skin'))
  WHERE kind = 'piano_skin';

CREATE OR REPLACE FUNCTION jj_piano_private.shop(action text, skin text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  owner_id uuid := auth.uid();
  catalog jsonb := '{"neon-pulse":90,"midnight-blue":120,"starlight":150}'::jsonb;
  price integer;
BEGIN
  IF owner_id IS NULL OR NOT public.is_member() THEN RAISE EXCEPTION 'NOT_MEMBER'; END IF;
  IF NOT public.is_jesus() AND NOT coalesce(
    (SELECT visible FROM public.section_visibility WHERE section = 'piano'), false
  ) THEN RAISE EXCEPTION 'SECTION_HIDDEN'; END IF;

  IF action = 'buy' THEN
    price := (catalog->>skin)::integer;
    IF price IS NULL THEN RAISE EXCEPTION 'INVALID_SKIN'; END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended(owner_id::text, 25));
    IF NOT EXISTS (
      SELECT 1 FROM public.jj_money_log
      WHERE user_id = owner_id AND kind = 'piano_skin' AND data->>'skin' = skin
    ) THEN
      IF coalesce((public.bb_shop()->>'coins')::bigint, 0) < price
      THEN RAISE EXCEPTION 'INSUFFICIENT_COINS'; END IF;

      INSERT INTO public.jj_money_log (user_id, request, kind, data, jj, result)
      VALUES (owner_id, gen_random_uuid(), 'piano_skin', jsonb_build_object('skin', skin), -price, '{}'::jsonb);
    END IF;
  ELSIF action IS DISTINCT FROM 'read' THEN
    RAISE EXCEPTION 'INVALID_ACTION';
  END IF;

  RETURN jsonb_build_object(
    'coins', (public.bb_shop()->>'coins')::bigint,
    'catalog', catalog,
    'owned', coalesce((
      SELECT jsonb_agg(data->>'skin' ORDER BY data->>'skin')
      FROM public.jj_money_log WHERE user_id = owner_id AND kind = 'piano_skin'
    ), '[]'::jsonb)
  );
END;
$$;
REVOKE ALL ON FUNCTION jj_piano_private.shop(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION jj_piano_private.shop(text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.jj_piano_shop(p_action text DEFAULT 'read', p_skin text DEFAULT NULL)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  SELECT jj_piano_private.shop(p_action, p_skin);
$$;
REVOKE ALL ON FUNCTION public.jj_piano_shop(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.jj_piano_shop(text, text) TO authenticated;

COMMIT;
