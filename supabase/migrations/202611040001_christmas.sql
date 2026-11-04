begin;
alter table public.app_settings drop constraint app_settings_season_check;
alter table public.app_settings add constraint app_settings_season_check check (season in ('auto','halloween','september','classic','christmas'));
insert into public.bb_skins(id,price) values ('christmas-santa',8),('christmas-reindeer',8) on conflict do nothing;
insert into public.jj_pet_catalog(id,price,skin) values ('christmas-fox',200,'christmas-santa'),('christmas-owl',220,'christmas-reindeer') on conflict do nothing;

create or replace function public.jj_check_seasonal_purchase() returns trigger
language plpgsql set search_path = '' as $$
declare
  item text := to_jsonb(new)->>tg_argv[0];
  stamp text := to_char(now() at time zone 'America/Matamoros','MMDD');
begin
  if item like 'christmas-%' and (stamp not between '1101' and '1231' or not exists(select 1 from public.app_settings where id=1 and season='christmas')) then
    raise exception 'OUT_OF_SEASON';
  end if;
  if (item like 'halloween-%' or (tg_argv[0]='skin' and item in ('ghost','pumpkin','vampire','skeleton','frankenstein','kitsune','witch','devil','zombie'))) and stamp not between '0926' and '1031' then
    raise exception 'OUT_OF_SEASON';
  end if;
  return new;
end $$;
drop trigger if exists jj_skin_season on public.bb_inventory;
create trigger jj_skin_season before insert on public.bb_inventory for each row execute function public.jj_check_seasonal_purchase('skin');
drop trigger if exists jj_pet_season on public.jj_pet_inventory;
create trigger jj_pet_season before insert on public.jj_pet_inventory for each row execute function public.jj_check_seasonal_purchase('pet');
commit;
