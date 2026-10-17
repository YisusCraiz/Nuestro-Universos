-- Bombitas JJ. Requiere la base existente (is_member, jj_dashboard, profiles).
-- No modifica el historial de monedas: registra gastos y calcula saldo disponible.
begin;
create table if not exists public.bb_settings(id integer primary key check(id=1),visible boolean not null default false);
insert into public.bb_settings(id) values(1) on conflict do nothing;
alter table public.bb_settings enable row level security;
revoke all on public.bb_settings from anon,authenticated;
create or replace function public.bb_visibility(p_visible boolean default null) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 if p_visible is not null then
  if not public.is_jesus() then raise exception 'OWNER_ONLY';end if;
  update public.bb_settings set visible=p_visible where id=1;
 end if;
 return (select visible from public.bb_settings where id=1);
end $$;
revoke all on function public.bb_visibility(boolean) from public,anon;
grant execute on function public.bb_visibility(boolean) to authenticated;
create table if not exists public.bb_skins(id text primary key, price integer not null check(price>=0));
insert into public.bb_skins values ('casual',0),('catshirt',3),('sharkshirt',3),('cat',6),('shark',6),('pajamas',4),('ninja',7),('yukata',8) on conflict(id) do update set price=excluded.price;
create table if not exists public.bb_inventory(user_id uuid not null references auth.users(id) on delete cascade,skin text not null references public.bb_skins(id),paid integer not null check(paid>=0),bought_at timestamptz not null default now(),primary key(user_id,skin));
create table if not exists public.bb_equipped(user_id uuid primary key references auth.users(id) on delete cascade,skin text not null references public.bb_skins(id));
create table if not exists public.bb_rooms(id uuid primary key default gen_random_uuid(),code text unique not null,host uuid not null references auth.users(id),guest uuid references auth.users(id),expires timestamptz not null default now()+interval '4 hours',check(host is distinct from guest));
alter table public.bb_skins enable row level security;
alter table public.bb_inventory enable row level security;
alter table public.bb_equipped enable row level security;
alter table public.bb_rooms enable row level security;
revoke all on public.bb_skins,public.bb_inventory,public.bb_equipped,public.bb_rooms from anon,authenticated;

create or replace function public.bb_shop(p_action text default 'read',p_skin text default 'casual') returns jsonb
language plpgsql security definer set search_path='' as $$
declare gross bigint; spent bigint; price integer; result jsonb;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 -- Serializes purchases even across two phones/tabs. Retries never charge twice.
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,25));
 gross:=coalesce((public.jj_dashboard()->>'coins')::bigint,0);
 select coalesce(sum(paid),0) into spent from public.bb_inventory where user_id=auth.uid();
 if p_action in ('buy','equip') then
  select s.price into price from public.bb_skins s where id=p_skin;
  if price is null then raise exception 'BAD_SKIN';end if;
  if p_skin<>'casual' and not exists(select 1 from public.bb_inventory where user_id=auth.uid() and skin=p_skin) then
   if p_action='equip' then raise exception 'NOT_OWNED';end if;
   if gross-spent<price then raise exception 'INSUFFICIENT_COINS';end if;
   insert into public.bb_inventory(user_id,skin,paid) values(auth.uid(),p_skin,price);
   spent:=spent+price;
  end if;
  insert into public.bb_equipped values(auth.uid(),p_skin) on conflict(user_id) do update set skin=excluded.skin;
 elsif p_action<>'read' then raise exception 'BAD_ACTION';end if;
 select jsonb_build_object('coins',greatest(0,gross-spent),'spent',spent,'equipped',coalesce((select skin from public.bb_equipped where user_id=auth.uid()),'casual'),'owned',coalesce((select jsonb_agg(skin) from public.bb_inventory where user_id=auth.uid()),'[]'::jsonb)||'["casual"]'::jsonb,'catalog',(select jsonb_object_agg(id,s.price) from public.bb_skins s)) into result;
 return result;
end $$;

create or replace function public.bb_room(p_action text default 'read',p_code text default '') returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.bb_rooms; result jsonb;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 if p_action='create' then
  delete from public.bb_rooms where expires<now() or host=auth.uid();
  insert into public.bb_rooms(code,host) values(upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),auth.uid()) returning * into r;
 else
  select * into r from public.bb_rooms where code=upper(trim(p_code)) and expires>now() for update;
  if r.id is null then raise exception 'ROOM_NOT_FOUND';end if;
  if p_action='join' then
   if r.host<>auth.uid() and r.guest is not null and r.guest<>auth.uid() then raise exception 'ROOM_FULL';end if;
   if r.host<>auth.uid() then update public.bb_rooms set guest=auth.uid() where id=r.id returning * into r;end if;
  end if;
  if auth.uid() is distinct from r.host and auth.uid() is distinct from r.guest then raise exception 'NOT_IN_ROOM';end if;
  if p_action='leave' then
   if r.host=auth.uid() then delete from public.bb_rooms where id=r.id;else update public.bb_rooms set guest=null where id=r.id;end if;
   return '{}'::jsonb;
  elsif p_action not in ('read','join') then raise exception 'BAD_ACTION';end if;
 end if;
 select jsonb_build_object('id',r.id,'code',r.code,'host',r.host,'guest',r.guest,'players',(select jsonb_agg(jsonb_build_object('id',p.id,'handle',p.handle,'name',p.display_name,'skin',coalesce(e.skin,'casual')) order by (p.id=r.host) desc) from public.profiles p left join public.bb_equipped e on e.user_id=p.id where p.id=r.host or p.id=r.guest)) into result;
 return result;
end $$;
create or replace function public.bb_channel_allowed(topic text) returns boolean
language sql stable security definer set search_path='' as $$
 select public.is_member() and exists(select 1 from public.bb_rooms r where 'bombitas:'||r.id::text=topic and r.expires>now() and (r.host=auth.uid() or r.guest=auth.uid()));
$$;
drop policy if exists bb_receive on realtime.messages;
create policy bb_receive on realtime.messages for select to authenticated using(extension='broadcast' and public.bb_channel_allowed(realtime.topic()));
drop policy if exists bb_send on realtime.messages;
create policy bb_send on realtime.messages for insert to authenticated with check(extension='broadcast' and public.bb_channel_allowed(realtime.topic()));
revoke all on function public.bb_shop(text,text),public.bb_room(text,text),public.bb_channel_allowed(text) from public,anon;
grant execute on function public.bb_shop(text,text),public.bb_room(text,text),public.bb_channel_allowed(text) to authenticated;
commit;
