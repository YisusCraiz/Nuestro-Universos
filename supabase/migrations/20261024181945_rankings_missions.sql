-- Additive update: preserves crowns, awarded missions, purchases and all balances.
create schema if not exists jj_rank;
revoke all on schema jj_rank from public,anon;
grant usage on schema jj_rank to authenticated;

create or replace function jj_rank.read() returns jsonb language plpgsql security definer set search_path='' as $$
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
 -(select coalesce(sum(amount),0) from public.bb_wagers where state in('offered','running') and expires>now() and ((host=p.id and host_ok) or (guest=p.id and guest_ok)))),
 'jxj',(select coalesce(sum(jxj),0) from public.jj_money_log where user_id=p.id),
 -- Count stakes once, including winning bets. Poker is charged only at deal.
 'casino_spent',(select coalesce(sum((data->>'stake')::bigint),0) from public.jj_money_log where user_id=p.id and kind in('slots','roulette','horse','poker_deal'))
 ) order by p.handle),'[]'::jsonb) from public.profiles p));
end $$;
revoke all on function jj_rank.read() from public,anon;
grant execute on function jj_rank.read() to authenticated;
create or replace function public.jj_rankings() returns jsonb language sql security invoker set search_path='' as $$select jj_rank.read()$$;
revoke all on function public.jj_rankings() from public,anon;
grant execute on function public.jj_rankings() to authenticated;

create or replace function public.jj_missions() returns table(mission text,progress integer,target integer) language sql stable security definer set search_path='' as $$
 with events as (select event,reference from public.activity_events where user_id=auth.uid() and week_start=public.jj_week()),
 counts as (select event,count(*)::int n from events group by event),
 games as (select count(distinct split_part(reference,':',1))::int n from events where event='game')
 select v.id,case when v.ev='variety' then (select n from games) else coalesce((select n from counts where event=v.ev),0) end,v.goal
 from (values
 ('visit','visit',1),('letter','messages',1),('letters3','messages',3),('photo','memories',1),('song','music',1),('comment','comment',1),('playlist','playlist',1),('game1','game',1),('games3','game',3),('variety','variety',3),('leader','leader',1),('improve','improve',1),('puzzle','puzzle',1),('together','truth',1),
 ('visits3','visit',3),('visits5','visit',5),('letters5','messages',5),('comments3','comment',3),('memories3','memories',3),('games10','game',10),('variety5','variety',5),('together3','truth',3)
 ) v(id,ev,goal) where public.is_member();
$$;
create or replace function public.jj_daily() returns table(mission text,progress integer,target integer) language sql stable security definer set search_path='' as $$
 with counts as (select event,count(*)::int n from public.activity_events where user_id=auth.uid() and (created_at at time zone 'America/Matamoros')::date=(now() at time zone 'America/Matamoros')::date group by event)
 select v.id,coalesce((select n from counts where event=v.ev),0),1
 from (values ('visit','visit'),('letter','messages'),('comment','comment'),('game','game'),('together','truth'),('puzzle','puzzle'),('improve','improve')) v(id,ev) where public.is_member();
$$;
revoke all on function public.jj_missions(),public.jj_daily() from public,anon;
grant execute on function public.jj_missions(),public.jj_daily() to authenticated;
