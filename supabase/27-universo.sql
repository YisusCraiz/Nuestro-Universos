-- Apply after 26. Existing gifts and posts are preserved.
begin;
insert into public.section_visibility(section,visible) values('comics',true),('news',true) on conflict do nothing;
create table if not exists public.universe_comics (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 owner_handle text not null check(owner_handle in ('jesus','julisa')),
 title text not null check(length(trim(title)) between 1 and 120),
 position integer not null default 1 check(position between 1 and 9999),
 pages text[] not null check(cardinality(pages) between 1 and 100),
 revision integer not null default 1, created_at timestamptz not null default now()
);
alter table public.universe_comics enable row level security;
grant select,insert,update on public.universe_comics to authenticated;
create policy comics_read on public.universe_comics for select to authenticated using(public.is_member());
create policy comics_insert on public.universe_comics for insert to authenticated with check(public.is_member() and owner_id=auth.uid() and owner_handle=(select handle from public.profiles where id=auth.uid()) and not exists(select 1 from unnest(pages) p where p not like auth.uid()::text||'/%'));
create policy comics_update on public.universe_comics for update to authenticated using(public.is_member() and owner_id=auth.uid()) with check(owner_id=auth.uid() and owner_handle=(select handle from public.profiles where id=auth.uid()) and not exists(select 1 from unnest(pages) p where p not like auth.uid()::text||'/%'));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('universe-comics','universe-comics',false,52428800,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy universe_comics_read on storage.objects for select to authenticated using(bucket_id='universe-comics' and public.is_member());
create policy universe_comics_upload on storage.objects for insert to authenticated with check(bucket_id='universe-comics' and public.is_member() and (storage.foldername(name))[1]=auth.uid()::text);
create table if not exists public.universe_title_inventory(user_id uuid not null references auth.users(id),title text not null check(title in ('stargazer','player','moon')),paid integer not null check(paid>0),primary key(user_id,title));
create table if not exists public.universe_equipped_titles(user_id uuid primary key references auth.users(id),title text not null check(title in ('novios','stargazer','player','moon')));
alter table public.universe_title_inventory enable row level security;
alter table public.universe_equipped_titles enable row level security;
revoke all on public.universe_title_inventory,public.universe_equipped_titles from public,anon,authenticated;
create or replace function public.universe_titles(p_action text default 'read',p_title text default 'novios') returns jsonb language plpgsql security definer set search_path='' as $$
declare price integer; wallet jsonb;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,25));
 if p_action='equip' then
  price:=case p_title when 'novios' then 0 when 'stargazer' then 3 when 'player' then 5 when 'moon' then 8 else null end;
  if price is null then raise exception 'BAD_TITLE';end if;
  if price>0 and not exists(select 1 from public.universe_title_inventory where user_id=auth.uid() and title=p_title) then
   wallet:=public.bb_shop();
   if (wallet->>'coins')::bigint<price then raise exception 'INSUFFICIENT_COINS';end if;
   insert into public.universe_title_inventory values(auth.uid(),p_title,price);
  end if;
  insert into public.universe_equipped_titles values(auth.uid(),p_title) on conflict(user_id) do update set title=excluded.title;
 elsif p_action<>'read' then raise exception 'BAD_ACTION';end if;
 wallet:=public.bb_shop();
 return jsonb_build_object('coins',(wallet->>'coins')::bigint,'equipped',coalesce((select title from public.universe_equipped_titles where user_id=auth.uid()),'novios'),'owned',coalesce((select jsonb_agg(title) from public.universe_title_inventory where user_id=auth.uid()),'[]'::jsonb)||'["novios"]'::jsonb,'profiles',coalesce((select jsonb_agg(jsonb_build_object('user_id',user_id,'title',title)) from public.universe_equipped_titles),'[]'::jsonb));
end $$;
revoke all on function public.universe_titles(text,text) from public,anon;
grant execute on function public.universe_titles(text,text) to authenticated;
-- bb_shop replacement follows: titles, skins and wagers share the same wallet lock.
create or replace function public.bb_shop(p_action text default 'read',p_skin text default 'casual') returns jsonb
language plpgsql security definer set search_path='' as $$
declare gross bigint; spent bigint; reserved bigint; price integer;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,25));
 gross:=coalesce((public.jj_dashboard()->>'coins')::bigint,0)+(select coalesce(sum(delta),0) from public.bb_coin_transfers where user_id=auth.uid());
 select coalesce(sum(paid),0) into spent from public.bb_inventory where user_id=auth.uid();
 spent:=spent+(select coalesce(sum(paid),0) from public.universe_title_inventory where user_id=auth.uid());
 select coalesce(sum(amount),0) into reserved from public.bb_wagers where state in ('offered','running') and expires>now() and ((host=auth.uid() and host_ok) or (guest=auth.uid() and guest_ok));
 if p_action in ('buy','equip') then
  select s.price into price from public.bb_skins s where id=p_skin;
  if price is null then raise exception 'BAD_SKIN';end if;
  if p_skin<>'casual' and not exists(select 1 from public.bb_inventory where user_id=auth.uid() and skin=p_skin) then
   if p_action='equip' then raise exception 'NOT_OWNED';end if;
   if gross-spent-reserved<price then raise exception 'INSUFFICIENT_COINS';end if;
   insert into public.bb_inventory(user_id,skin,paid) values(auth.uid(),p_skin,price);spent:=spent+price;
  end if;
  insert into public.bb_equipped values(auth.uid(),p_skin) on conflict(user_id) do update set skin=excluded.skin;
 elsif p_action<>'read' then raise exception 'BAD_ACTION';end if;
 return jsonb_build_object('coins',greatest(0,gross-spent-reserved),'reserved',reserved,'spent',spent,
 'equipped',coalesce((select skin from public.bb_equipped where user_id=auth.uid()),'casual'),
 'owned',coalesce((select jsonb_agg(skin) from public.bb_inventory where user_id=auth.uid()),'[]'::jsonb)||'["casual"]'::jsonb,
 'catalog',(select jsonb_object_agg(id,s.price) from public.bb_skins s));
end $$;
commit;

