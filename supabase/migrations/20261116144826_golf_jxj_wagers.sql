CREATE TABLE IF NOT EXISTS jj_golf.wagers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 host uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 guest uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 stake integer NOT NULL CHECK(stake BETWEEN 1 AND 1000),
 circuit text NOT NULL CHECK(circuit IN ('A','S','N','H','U')),
 state text NOT NULL DEFAULT 'offer' CHECK(state IN ('offer','playing','paid','draw','cancelled','expired')),
 created timestamptz NOT NULL DEFAULT now(),
 expires timestamptz NOT NULL,
 host_score smallint[], guest_score smallint[],
 host_confirm boolean NOT NULL DEFAULT false, guest_confirm boolean NOT NULL DEFAULT false,
 winner uuid CHECK(winner IN (host,guest)),
 CHECK(host<>guest)
);
CREATE INDEX IF NOT EXISTS golf_wager_host ON jj_golf.wagers(host,created DESC);
CREATE INDEX IF NOT EXISTS golf_wager_guest ON jj_golf.wagers(guest,created DESC);
ALTER TABLE jj_golf.wagers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON jj_golf.wagers FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.jj_dashboard() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE d jsonb; actor uuid:=auth.uid(); golf_delta bigint;
BEGIN
 IF NOT public.is_member() THEN RAISE EXCEPTION 'NOT_MEMBER'; END IF;
 d:=public.jj_dashboard_legacy34();
 SELECT coalesce(sum(CASE
   WHEN state='paid' THEN CASE WHEN winner=actor THEN stake ELSE -stake END
   WHEN expires>now() AND (state='playing' OR (state='offer' AND host=actor)) THEN -stake
   ELSE 0 END),0) INTO golf_delta FROM jj_golf.wagers WHERE host=actor OR guest=actor;
 RETURN d||jsonb_build_object('coins',(d->>'coins')::bigint+golf_delta
   -(SELECT coalesce(sum(paid),0) FROM public.jj_pet_inventory WHERE user_id=actor)
   -(SELECT coalesce(sum(paid),0) FROM jj_golf.inventory WHERE user_id=actor));
END;
$$;
REVOKE ALL ON FUNCTION public.jj_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.jj_dashboard() TO authenticated;

CREATE OR REPLACE FUNCTION public.jj_golf_wager(
 p_action text DEFAULT 'read', p_id uuid DEFAULT NULL, p_stake integer DEFAULT NULL,
 p_circuit text DEFAULT NULL, p_scores smallint[] DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
 actor uuid:=auth.uid(); peer uuid; actor_handle text; w jj_golf.wagers;
 old_scores smallint[]; host_total integer; guest_total integer; result_winner uuid; wallet_owner uuid;
BEGIN
 IF NOT public.is_member() THEN RAISE EXCEPTION 'NOT_MEMBER'; END IF;
 SELECT p.handle INTO actor_handle FROM public.profiles p WHERE p.id=actor AND p.handle IN ('jesus','julisa');
 IF actor_handle IS NULL THEN RAISE EXCEPTION 'NOT_MEMBER'; END IF;
 SELECT p.id INTO peer FROM public.profiles p WHERE p.handle=CASE WHEN actor_handle='jesus' THEN 'julisa' ELSE 'jesus' END;
 IF peer IS NULL THEN RAISE EXCEPTION 'NO_PARTNER'; END IF;
 -- Serialize match transitions before entering the shared wallet's per-user locks.
 PERFORM pg_advisory_xact_lock(hashtextextended('jj-golf-wager', 0));
 IF p_action='offer' THEN
  IF p_id IS NULL OR p_stake IS NULL OR p_stake NOT BETWEEN 1 AND 1000 OR p_circuit IS NULL OR p_circuit NOT IN ('A','S','N','H','U') THEN
   RAISE EXCEPTION 'BAD_OFFER';
  END IF;
  SELECT * INTO w FROM jj_golf.wagers WHERE id=p_id;
  IF FOUND THEN
   IF w.host<>actor OR w.stake<>p_stake OR w.circuit<>p_circuit THEN RAISE EXCEPTION 'OFFER_MISMATCH'; END IF;
  ELSE
   IF EXISTS(SELECT 1 FROM jj_golf.wagers WHERE expires>now() AND state IN ('offer','playing') AND
    ((host=actor AND guest=peer) OR (host=peer AND guest=actor))) THEN RAISE EXCEPTION 'WAGER_OPEN'; END IF;
   IF (public.bb_shop()->>'coins')::bigint<p_stake THEN RAISE EXCEPTION 'INSUFFICIENT_COINS'; END IF;
   INSERT INTO jj_golf.wagers(id,host,guest,stake,circuit,expires) VALUES(p_id,actor,peer,p_stake,p_circuit,now()+interval '10 minutes') RETURNING * INTO w;
  END IF;
 ELSIF p_action='read' THEN
  SELECT * INTO w FROM jj_golf.wagers WHERE host=actor OR guest=actor
  ORDER BY (expires>now() AND state IN ('offer','playing')) DESC,created DESC LIMIT 1;
 ELSE
  SELECT * INTO w FROM jj_golf.wagers WHERE id=p_id AND (host=actor OR guest=actor);
  IF NOT FOUND THEN RAISE EXCEPTION 'NO_WAGER'; END IF;
  IF w.expires<=now() AND w.state IN ('offer','playing') THEN RAISE EXCEPTION 'WAGER_EXPIRED'; END IF;
  IF p_action='accept' AND actor=w.guest AND w.state IN ('offer','playing') THEN
   IF w.state='offer' THEN
    IF (public.bb_shop()->>'coins')::bigint<w.stake THEN RAISE EXCEPTION 'INSUFFICIENT_COINS'; END IF;
    UPDATE jj_golf.wagers SET state='playing',expires=now()+interval '2 hours' WHERE id=w.id RETURNING * INTO w;
   END IF;
  ELSIF p_action='cancel' AND w.state IN ('offer','playing','cancelled') THEN
   UPDATE jj_golf.wagers SET state='cancelled' WHERE id=w.id RETURNING * INTO w;
  ELSIF p_action='submit' AND w.state='playing' THEN
   IF p_scores IS NULL OR array_ndims(p_scores)<>1 OR cardinality(p_scores)<>(CASE WHEN w.circuit='A' THEN 12 ELSE 3 END)
    OR EXISTS(SELECT 1 FROM unnest(p_scores) AS score WHERE score IS NULL OR score NOT BETWEEN 1 AND 10) THEN RAISE EXCEPTION 'BAD_SCORE'; END IF;
   old_scores:=CASE WHEN w.host=actor THEN w.host_score ELSE w.guest_score END;
   IF old_scores IS NOT NULL AND old_scores IS DISTINCT FROM p_scores THEN RAISE EXCEPTION 'SCORE_ALREADY_SENT'; END IF;
   IF w.host=actor THEN UPDATE jj_golf.wagers SET host_score=p_scores WHERE id=w.id RETURNING * INTO w;
   ELSE UPDATE jj_golf.wagers SET guest_score=p_scores WHERE id=w.id RETURNING * INTO w; END IF;
  ELSIF p_action='confirm' AND w.state IN ('playing','paid','draw') AND w.host_score IS NOT NULL AND w.guest_score IS NOT NULL THEN
   IF w.state='playing' THEN
    IF w.host=actor THEN UPDATE jj_golf.wagers SET host_confirm=true WHERE id=w.id RETURNING * INTO w;
    ELSE UPDATE jj_golf.wagers SET guest_confirm=true WHERE id=w.id RETURNING * INTO w; END IF;
    IF w.host_confirm AND w.guest_confirm THEN
     FOR wallet_owner IN SELECT uid FROM unnest(ARRAY[w.host,w.guest]) uid ORDER BY uid LOOP
      PERFORM pg_advisory_xact_lock(hashtextextended(wallet_owner::text,25));
     END LOOP;
     IF w.expires<=clock_timestamp() THEN RAISE EXCEPTION 'WAGER_EXPIRED'; END IF;
     SELECT sum(s) INTO host_total FROM unnest(w.host_score) s;
     SELECT sum(s) INTO guest_total FROM unnest(w.guest_score) s;
     result_winner:=CASE WHEN host_total<guest_total THEN w.host WHEN guest_total<host_total THEN w.guest ELSE NULL END;
     UPDATE jj_golf.wagers SET winner=result_winner,state=CASE WHEN result_winner IS NULL THEN 'draw' ELSE 'paid' END WHERE id=w.id RETURNING * INTO w;
    END IF;
   END IF;
  ELSE RAISE EXCEPTION 'BAD_ACTION'; END IF;
 END IF;
 RETURN jsonb_build_object('coins',(public.bb_shop()->>'coins')::bigint,'me',actor_handle,'match',
  CASE WHEN w.id IS NULL THEN NULL ELSE jsonb_build_object(
   'id',w.id,'stake',w.stake,'circuit',w.circuit,'expires',w.expires,
   'state',CASE WHEN w.expires<=now() AND w.state IN ('offer','playing') THEN 'expired' ELSE w.state END,
   'host',CASE WHEN w.host=actor THEN actor_handle WHEN actor_handle='jesus' THEN 'julisa' ELSE 'jesus' END,
   'mine',CASE WHEN w.host=actor THEN w.host_score ELSE w.guest_score END,
   'theirs',CASE WHEN w.host=actor THEN w.guest_score ELSE w.host_score END,
   'confirmed',CASE WHEN w.host=actor THEN w.host_confirm ELSE w.guest_confirm END,
   'winner',CASE WHEN w.winner=actor THEN actor_handle WHEN w.winner=peer THEN CASE WHEN actor_handle='jesus' THEN 'julisa' ELSE 'jesus' END END
  ) END);
END;
$$;
REVOKE ALL ON FUNCTION public.jj_golf_wager(text,uuid,integer,text,smallint[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.jj_golf_wager(text,uuid,integer,text,smallint[]) TO authenticated;
