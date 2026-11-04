create or replace function public.jj_check_seasonal_purchase() returns trigger
language plpgsql set search_path = '' as $$
declare
  item text := to_jsonb(new)->>tg_argv[0];
  stamp text := to_char(now() at time zone 'America/Matamoros','MMDD');
begin
  if item like 'christmas-%' and (stamp not between '1101' and '1231' or not exists(select 1 from public.app_settings where id=1 and season='christmas')) then
    raise exception 'OUT_OF_SEASON';
  end if;
  if (item like 'halloween-%' or (tg_argv[0]='skin' and item in ('ghost','pumpkin','vampire','skeleton','frankenstein','kitsune','witch','devil','zombie'))) and not exists(select 1 from public.app_settings where id=1 and (season='halloween' or (season='auto' and stamp between '0926' and '1031'))) then
    raise exception 'OUT_OF_SEASON';
  end if;
  return new;
end $$;
