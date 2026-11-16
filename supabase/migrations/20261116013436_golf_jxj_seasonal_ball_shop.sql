CREATE SCHEMA IF NOT EXISTS jj_golf;
REVOKE ALL ON SCHEMA jj_golf FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS jj_golf.skins (
  id text PRIMARY KEY,
  season text NOT NULL CHECK (season IN ('permanent', 'christmas', 'halloween')),
  price integer NOT NULL CHECK (price > 0)
);

INSERT INTO jj_golf.skins (id, season, price) VALUES
  ('sakura', 'permanent', 35), ('koi', 'permanent', 75), ('torii', 'permanent', 125),
  ('snow', 'christmas', 35), ('gift', 'christmas', 75), ('aurora', 'christmas', 125),
  ('pumpkin', 'halloween', 35), ('ghost', 'halloween', 75), ('eclipse', 'halloween', 125),
  ('polaris', 'permanent', 35), ('pinkmoon', 'permanent', 75), ('jxj', 'permanent', 125)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS jj_golf.inventory (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skin text NOT NULL REFERENCES jj_golf.skins(id),
  paid integer NOT NULL CHECK (paid > 0),
  PRIMARY KEY (user_id, skin)
);

CREATE TABLE IF NOT EXISTS jj_golf.equipped (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  skin text,
  FOREIGN KEY (user_id, skin) REFERENCES jj_golf.inventory(user_id, skin)
);
ALTER TABLE jj_golf.skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE jj_golf.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE jj_golf.equipped ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA jj_golf FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.jj_dashboard() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  dashboard jsonb;
  owner_id uuid := auth.uid();
BEGIN
  IF NOT public.is_member() THEN RAISE EXCEPTION 'NOT_MEMBER'; END IF;
  dashboard := public.jj_dashboard_legacy34();
  RETURN dashboard || jsonb_build_object(
    'coins', (dashboard->>'coins')::bigint
      - (SELECT coalesce(sum(paid), 0) FROM public.jj_pet_inventory WHERE user_id = owner_id)
      - (SELECT coalesce(sum(paid), 0) FROM jj_golf.inventory WHERE user_id = owner_id)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.jj_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.jj_dashboard() TO authenticated;

CREATE OR REPLACE FUNCTION public.jj_golf_shop(p_action text DEFAULT 'read', p_skin text DEFAULT 'classic')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  owner_id uuid := auth.uid();
  owner_handle text;
  selected jj_golf.skins%ROWTYPE;
  available_seasons text[] := ARRAY['permanent'];
  configured_season text;
  stamp text := to_char(now() AT TIME ZONE 'America/Matamoros', 'MMDD');
BEGIN
  IF NOT public.is_member() THEN RAISE EXCEPTION 'NOT_MEMBER'; END IF;
  SELECT handle INTO owner_handle FROM public.profiles WHERE id = owner_id;
  IF owner_handle IS NULL OR owner_handle NOT IN ('jesus', 'julisa') THEN RAISE EXCEPTION 'NOT_MEMBER'; END IF;
  SELECT season INTO configured_season FROM public.app_settings WHERE id = 1;
  IF configured_season = 'christmas' AND stamp BETWEEN '1101' AND '1231' THEN
    available_seasons := array_append(available_seasons, 'christmas');
  END IF;
  IF configured_season = 'halloween' OR (configured_season = 'auto' AND stamp BETWEEN '0926' AND '1031') THEN
    available_seasons := array_append(available_seasons, 'halloween');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(owner_id::text, 25));
  IF p_action IN ('buy', 'equip') THEN
    IF p_skin IS NULL THEN RAISE EXCEPTION 'INVALID_SKIN'; END IF;
    IF p_skin <> 'classic' THEN
      SELECT * INTO selected FROM jj_golf.skins WHERE id = p_skin;
      IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_SKIN'; END IF;
      IF NOT EXISTS (SELECT 1 FROM jj_golf.inventory WHERE user_id = owner_id AND skin = p_skin) THEN
        IF p_action = 'equip' THEN RAISE EXCEPTION 'NOT_OWNED'; END IF;
        IF NOT (selected.season = ANY(available_seasons)) THEN RAISE EXCEPTION 'OUT_OF_SEASON'; END IF;
        IF (public.bb_shop()->>'coins')::bigint < selected.price THEN RAISE EXCEPTION 'INSUFFICIENT_COINS'; END IF;
        INSERT INTO jj_golf.inventory (user_id, skin, paid) VALUES (owner_id, p_skin, selected.price);
      END IF;
    END IF;
    INSERT INTO jj_golf.equipped (user_id, skin) VALUES (owner_id, nullif(p_skin, 'classic'))
    ON CONFLICT (user_id) DO UPDATE SET skin = excluded.skin;
  ELSIF p_action IS DISTINCT FROM 'read' THEN
    RAISE EXCEPTION 'INVALID_ACTION';
  END IF;

  RETURN jsonb_build_object(
    'handle', owner_handle,
    'coins', (public.bb_shop()->>'coins')::bigint,
    'owned', coalesce((SELECT jsonb_agg(skin ORDER BY skin) FROM jj_golf.inventory WHERE user_id = owner_id), '[]'::jsonb),
    'equipped', (SELECT jsonb_object_agg(p.handle, coalesce(e.skin, 'classic'))
      FROM public.profiles p LEFT JOIN jj_golf.equipped e ON e.user_id = p.id WHERE p.handle IN ('jesus', 'julisa')),
    'catalog', (SELECT jsonb_object_agg(id, jsonb_build_object('price', price, 'available', season = ANY(available_seasons))) FROM jj_golf.skins)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.jj_golf_shop(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.jj_golf_shop(text, text) TO authenticated;
