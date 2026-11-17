CREATE OR REPLACE FUNCTION jj_rank.read()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 -- Use the same award/settlement path as the wallet before reading totals.
 perform public.jj_dashboard();
 return jsonb_build_object('updated_at',now(),'players',(
 select coalesce(jsonb_agg(jsonb_build_object('handle',p.handle,'name',p.display_name,
 'jj',greatest(0,
 (select coalesce(sum(coins),0) from public.mission_awards where user_id=p.id)
 +(select coalesce(sum(coins),0) from public.daily_awards where user_id=p.id)
 +(select coalesce(sum(coins),0) from public.game_rewards where user_id=p.id)
 +(select coalesce(sum(jj),0) from public.jj_money_log where user_id=p.id)
 +(select coalesce(sum(delta),0) from public.bb_coin_transfers where user_id=p.id)
 -(select coalesce(sum(paid),0) from public.jj_pet_inventory where user_id=p.id)
 -(select coalesce(sum(paid),0) from public.bb_inventory where user_id=p.id)
 -(select coalesce(sum(paid),0) from public.universe_title_inventory where user_id=p.id)
 -(select coalesce(sum(paid),0) from public.yuki_inventory where user_id=p.id)
 -(select coalesce(sum(paid),0) from jj_golf.inventory where user_id=p.id)
 +(select coalesce(sum(case
     when w.state='paid' then case when w.winner=p.id then w.stake else -w.stake end
     when w.expires>now() and (w.state='playing' or (w.state='offer' and w.host=p.id)) then -w.stake
     else 0 end),0) from jj_golf.wagers w where p.id in (w.host,w.guest))
 -(select coalesce(sum(amount),0) from public.bb_wagers where state in('offered','running') and expires>now() and ((host=p.id and host_ok) or (guest=p.id and guest_ok)))),
 'jxj',(select coalesce(sum(jxj),0) from public.jj_money_log where user_id=p.id),
 -- Count stakes once, including winning bets. Poker is charged only at deal.
 'casino_spent',(select coalesce(sum((data->>'stake')::bigint),0) from public.jj_money_log where user_id=p.id and kind in('slots','roulette','horse','poker_deal'))
 ) order by p.handle),'[]'::jsonb) from public.profiles p));
end $function$
;
