-- Ejecutar después de SQL 25. Monedas JJ virtuales: reserva y reparto sin duplicados.
begin;
create table if not exists public.bb_wagers(
 id uuid primary key default gen_random_uuid(), room_id uuid not null,
 host uuid not null references auth.users(id), guest uuid not null references auth.users(id),
 amount integer not null check(amount>=0), rules jsonb not null,
 host_ok boolean not null default true, guest_ok boolean not null default false,
 state text not null default 'offered' check(state in ('offered','running','paid','refunded')),
 host_result uuid,guest_result uuid,winner uuid,
 created_at timestamptz not null default now(),expires timestamptz not null,
 check(host<>guest),check(host_result is null or host_result in(host,guest)),
 check(guest_result is null or guest_result in(host,guest)),check(winner is null or winner in(host,guest))
);
create unique index if not exists bb_one_wager_per_room on public.bb_wagers(room_id) where state in ('offered','running');
create table if not exists public.bb_coin_transfers(
 wager_id uuid not null references public.bb_wagers(id),user_id uuid not null references auth.users(id),
 delta integer not null,primary key(wager_id,user_id)
);
alter table public.bb_wagers enable row level security;
alter table public.bb_coin_transfers enable row level security;
revoke all on public.bb_wagers,public.bb_coin_transfers from public,anon,authenticated;

create or replace function public.bb_shop(p_action text default 'read',p_skin text default 'casual') returns jsonb
language plpgsql security definer set search_path='' as $$
declare gross bigint; spent bigint; reserved bigint; price integer;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,25));
 gross:=coalesce((public.jj_dashboard()->>'coins')::bigint,0)+(select coalesce(sum(delta),0) from public.bb_coin_transfers where user_id=auth.uid());
 select coalesce(sum(paid),0) into spent from public.bb_inventory where user_id=auth.uid();
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

create or replace function public.bb_wager(p_action text default 'read',p_code text default '',p_id uuid default null,p_amount integer default 0,p_rules jsonb default '{}',p_winner uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.bb_rooms; w public.bb_wagers; available bigint; u uuid; seconds int; wins int; wallet jsonb;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 -- Always lock the room/wager first, then wallets in deterministic order.
 if p_action='propose' then
  if p_id is null or p_amount is null or p_amount<0 then raise exception 'BAD_AMOUNT';end if;
  seconds:=(p_rules->>'seconds')::int;wins:=(p_rules->>'wins')::int;
  if seconds is null or seconds not between 30 and 600 or wins is null or wins not between 1 and 10 then raise exception 'BAD_RULES';end if;
  select * into r from public.bb_rooms where code=upper(trim(p_code)) and expires>now() for update;
  if r.id is null then raise exception 'ROOM_NOT_FOUND';end if;
  if auth.uid()<>r.host or r.guest is null then raise exception 'HOST_AND_GUEST_REQUIRED';end if;
  select * into w from public.bb_wagers where id=p_id for update;
  if w.id is not null then
   if w.room_id<>r.id or w.host<>auth.uid() or w.amount<>p_amount or w.rules<>p_rules then raise exception 'REQUEST_MISMATCH';end if;
  else
   if exists(select 1 from public.bb_wagers where room_id=r.id and state='running' and expires>now()) then raise exception 'WAGER_RUNNING';end if;
   update public.bb_wagers set state='refunded' where room_id=r.id and state in ('offered','running');
   available:=(public.bb_shop()->>'coins')::bigint;
   if available<p_amount then raise exception 'INSUFFICIENT_COINS';end if;
   insert into public.bb_wagers(id,room_id,host,guest,amount,rules,expires)
   values(p_id,r.id,r.host,r.guest,p_amount,p_rules,r.expires) returning * into w;
  end if;
 else
  if p_id is not null then select * into w from public.bb_wagers where id=p_id for update;
  else
   select * into r from public.bb_rooms where code=upper(trim(p_code)) and expires>now();
   if r.id is null or (auth.uid() is distinct from r.host and auth.uid() is distinct from r.guest) then raise exception 'NOT_IN_ROOM';end if;
   select * into w from public.bb_wagers where room_id=r.id order by created_at desc limit 1 for update;
  end if;
  if w.id is not null and auth.uid()<>w.host and auth.uid()<>w.guest then raise exception 'NOT_IN_WAGER';end if;
  if w.id is null and p_action<>'read' then raise exception 'WAGER_NOT_FOUND';end if;
 end if;
 if w.id is not null then
  if w.state in ('offered','running') and w.expires<=now() then
   update public.bb_wagers set state='refunded' where id=w.id returning * into w;
  end if;
  if p_action='accept' then
   if not exists(select 1 from public.bb_rooms where id=w.room_id and host=w.host and guest=w.guest and expires>now()) then raise exception 'ROOM_CHANGED';end if;
   if w.state<>'offered' then raise exception 'WAGER_NOT_OPEN';end if;
   if not (case when auth.uid()=w.host then w.host_ok else w.guest_ok end) then
    available:=(public.bb_shop()->>'coins')::bigint;
    if available<w.amount then raise exception 'INSUFFICIENT_COINS';end if;
    update public.bb_wagers set host_ok=host_ok or auth.uid()=host,guest_ok=guest_ok or auth.uid()=guest where id=w.id returning * into w;
   end if;
  elsif p_action='start' then
   if auth.uid()<>w.host then raise exception 'HOST_ONLY';end if;
   if not exists(select 1 from public.bb_rooms where id=w.room_id and host=w.host and guest=w.guest and expires>now()) then raise exception 'ROOM_CHANGED';end if;
   if w.rules<>p_rules then raise exception 'RULES_CHANGED';end if;
   if w.state not in ('offered','running') or not w.host_ok or not w.guest_ok then raise exception 'BOTH_MUST_ACCEPT';end if;
   -- Accepted stakes are already reserved; the shop cannot spend them.
   update public.bb_wagers set state='running' where id=w.id returning * into w;
  elsif p_action='result' then
   if w.state='running' then
    if p_winner is null or p_winner not in(w.host,w.guest) then raise exception 'BAD_WINNER';end if;
    if (auth.uid()=w.host and w.host_result is not null and w.host_result<>p_winner) or (auth.uid()=w.guest and w.guest_result is not null and w.guest_result<>p_winner) then raise exception 'RESULT_ALREADY_RECORDED';end if;
    update public.bb_wagers set host_result=case when auth.uid()=host then p_winner else host_result end,guest_result=case when auth.uid()=guest then p_winner else guest_result end where id=w.id returning * into w;
    if w.host_result is not null and w.guest_result is not null then
     if w.host_result=w.guest_result then
      for u in select x from unnest(array[w.host,w.guest]) x order by x loop perform pg_advisory_xact_lock(hashtextextended(u::text,25));end loop;
      insert into public.bb_coin_transfers values(w.id,w.host,case when w.host_result=w.host then w.amount else -w.amount end),(w.id,w.guest,case when w.host_result=w.guest then w.amount else -w.amount end);
      update public.bb_wagers set state='paid',winner=w.host_result where id=w.id returning * into w;
     else update public.bb_wagers set state='refunded' where id=w.id returning * into w;
     end if;
    end if;
   end if;
  elsif p_action='cancel' then
   if w.state in ('offered','running') and w.host_result is null and w.guest_result is null then
    update public.bb_wagers set state='refunded' where id=w.id returning * into w;
   end if;
  elsif p_action not in ('read','propose') then raise exception 'BAD_ACTION';
  end if;
 end if;
 wallet:=public.bb_shop();
 return jsonb_build_object('enabled',true,'coins',(wallet->>'coins')::bigint,'reserved',(wallet->>'reserved')::bigint,'wager',case when w.id is null then null else to_jsonb(w) end);
end $$;
revoke all on function public.bb_shop(text,text),public.bb_wager(text,text,uuid,integer,jsonb,uuid) from public,anon;
grant execute on function public.bb_shop(text,text),public.bb_wager(text,text,uuid,integer,jsonb,uuid) to authenticated;
commit;
