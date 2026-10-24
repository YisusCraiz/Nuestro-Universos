CREATE OR REPLACE FUNCTION public.jj_settle()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare p date;
begin
 perform pg_advisory_xact_lock(928210);
 for p in select distinct period_start from public.game_records where period_start<public.jj_period() and period_start not in(select period_start from public.settled_periods) order by period_start loop
  with ranked as (select r.user_id,r.game,dense_rank() over(partition by r.game order by case when c.lower_wins then r.best else -r.best end) rank from public.game_records r join public.game_catalog c using(game) where r.period_start=p),
  points as (select pr.id user_id,(select count(*)::integer from ranked r where r.user_id=pr.id and rank=1) wins,(select count(*)::integer from public.activity_events e where e.user_id=pr.id and e.event='improve' and (e.created_at at time zone 'America/Matamoros')::date>=p and (e.created_at at time zone 'America/Matamoros')::date<p+14) improvements from public.profiles pr),
  final as (select *,dense_rank() over(order by wins desc) place from points)
  insert into public.crown_results(period_start,user_id,first_places,improvements) select p,user_id,wins,improvements from final where place=1 and wins>0 on conflict do nothing;
  insert into public.settled_periods(period_start) values(p) on conflict do nothing;
 end loop;
end;$function$

