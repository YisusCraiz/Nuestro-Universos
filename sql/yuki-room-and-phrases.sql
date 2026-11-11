-- Companion room and phrase batches. Applied as yuki_room_catalog_and_phrase_batches.
-- RPC-only storage: RLS without direct policies is intentional; no client table grants.
begin;
create table if not exists public.yuki_catalog(id text primary key,kind text not null check(kind in('outfit','decor')),slot text not null,es text not null,en text not null,price integer not null check(price>=0));
insert into public.yuki_catalog values
('uniform','outfit','outfit','Uniforme','Uniform',0),('pajamas','outfit','outfit','Pijama de estrellas','Starry pajamas',450),
('rug','decor','rug','Alfombra lunar','Moon rug',120),('plant','decor','plant','Planta de corazones','Heart plant',180),
('lamp','decor','light','Lámpara cálida','Warm lamp',220),('shelf','decor','shelf','Estantería de historias','Story bookshelf',350),
('window','decor','wall','Ventana al universo','Universe window',280),('stars','decor','wall','Guirnalda de estrellas','Star garland',140) on conflict do nothing;
create table if not exists public.yuki_inventory(user_id uuid references public.profiles(id) on delete cascade,item text references public.yuki_catalog(id),paid integer not null check(paid>=0),bought_at timestamptz not null default now(),primary key(user_id,item));
create table if not exists public.yuki_home(user_id uuid primary key references public.profiles(id) on delete cascade,outfit text not null default 'uniform' references public.yuki_catalog(id),decor jsonb not null default '{}');
create table if not exists public.yuki_phrase_cache(owner_id uuid references public.profiles(id) on delete cascade,language text check(language in('es','en')),phrases jsonb not null default '[]',generated_at timestamptz,last_attempt timestamptz,day date not null default current_date,attempts integer not null default 0 check(attempts between 0 and 2),primary key(owner_id,language));
alter table public.yuki_catalog enable row level security;
alter table public.yuki_inventory enable row level security;
alter table public.yuki_home enable row level security;
alter table public.yuki_phrase_cache enable row level security;
revoke all on public.yuki_catalog,public.yuki_inventory,public.yuki_home,public.yuki_phrase_cache from public,anon,authenticated;
grant all on public.yuki_phrase_cache to service_role;

CREATE OR REPLACE FUNCTION public.bb_shop(p_action text DEFAULT 'read'::text, p_skin text DEFAULT 'casual'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare gross bigint; spent bigint; reserved bigint; price integer;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,25));
 gross:=coalesce((public.jj_dashboard()->>'coins')::bigint,0)+(select coalesce(sum(delta),0) from public.bb_coin_transfers where user_id=auth.uid());
 select coalesce(sum(paid),0) into spent from public.bb_inventory where user_id=auth.uid();
 spent:=spent+(select coalesce(sum(paid),0) from public.universe_title_inventory where user_id=auth.uid());
 spent:=spent+(select coalesce(sum(paid),0) from public.yuki_inventory where user_id=auth.uid());
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
end $function$

CREATE OR REPLACE FUNCTION public.yuki_hub(p_action text DEFAULT 'read'::text, p_item text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid(); c public.yuki_catalog; balance bigint;
begin
 if not coalesce(public.yuki_access(),false) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,25));
 insert into public.yuki_home(user_id) values(uid) on conflict do nothing;
 if p_action in('buy','equip','remove') then
  select * into c from public.yuki_catalog where id=p_item;
  if not found then raise exception 'BAD_ITEM'; end if;
  if p_action='buy' and c.id<>'uniform' and not exists(select 1 from public.yuki_inventory where user_id=uid and item=c.id) then
   balance:=(public.bb_shop()->>'coins')::bigint;
   if balance<c.price then raise exception 'INSUFFICIENT_COINS'; end if;
   insert into public.yuki_inventory(user_id,item,paid) values(uid,c.id,c.price);
  end if;
  if p_action='equip' then
   if c.id<>'uniform' and not exists(select 1 from public.yuki_inventory where user_id=uid and item=c.id) then raise exception 'NOT_OWNED'; end if;
   if c.kind='outfit' then update public.yuki_home set outfit=c.id where user_id=uid;
   else update public.yuki_home set decor=jsonb_set(decor,array[c.slot],to_jsonb(c.id)) where user_id=uid; end if;
  elsif p_action='remove' then
   if c.kind<>'decor' then raise exception 'BAD_ITEM'; end if;
   update public.yuki_home set decor=decor-c.slot where user_id=uid and decor->>c.slot=c.id;
  end if;
 elsif p_action<>'read' then raise exception 'BAD_ACTION'; end if;
 return jsonb_build_object('coins',(public.bb_shop()->>'coins')::bigint,'outfit',(select outfit from public.yuki_home where user_id=uid),'decor',(select decor from public.yuki_home where user_id=uid),'owned',jsonb_build_array('uniform')||coalesce((select jsonb_agg(item order by item) from public.yuki_inventory where user_id=uid),'[]'),'catalog',(select jsonb_agg(to_jsonb(x) order by kind,price,id) from public.yuki_catalog x));
end $function$

CREATE OR REPLACE FUNCTION public.yuki_phrase_batch(p_language text DEFAULT 'es'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare c public.yuki_phrase_cache; today date:=(now() at time zone 'America/Matamoros')::date;
begin
 if not coalesce(public.yuki_access(),false) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
 if p_language not in('es','en') or p_language is null then raise exception 'BAD_LANGUAGE'; end if;
 insert into public.yuki_phrase_cache(owner_id,language,day) values(auth.uid(),p_language,today) on conflict do nothing;
 select * into c from public.yuki_phrase_cache where owner_id=auth.uid() and language=p_language for update;
 if c.generated_at>now()-interval '6 hours' or c.last_attempt>now()-interval '5 minutes' or (c.day=today and c.attempts>=2) then return jsonb_build_object('generate',false,'phrases',c.phrases); end if;
 update public.yuki_phrase_cache set day=today,attempts=case when c.day=today then c.attempts+1 else 1 end,last_attempt=now() where owner_id=auth.uid() and language=p_language;
 return jsonb_build_object('generate',true,'phrases',c.phrases);
end $function$

revoke all on function public.yuki_hub(text,text),public.yuki_phrase_batch(text) from public,anon;
grant execute on function public.yuki_hub(text,text),public.yuki_phrase_batch(text) to authenticated;
commit;
