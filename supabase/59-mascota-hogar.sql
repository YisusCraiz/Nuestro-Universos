-- Pet home: server time, shared wallet lock, per-pet levels and idempotent requests.
begin;
insert into public.section_visibility(section,visible) values('pets',true) on conflict do nothing;
create table public.jj_pet_levels(user_id uuid references auth.users(id) not null,pet text references public.jj_pet_catalog(id) not null,level int not null default 1 check(level between 1 and 10),primary key(user_id,pet));
create table public.jj_pet_income(user_id uuid primary key references auth.users(id),pet text references public.jj_pet_catalog(id),checked_at timestamptz not null default now(),online_until timestamptz not null default now(),pending numeric not null default 0 check(pending>=0),claimed bigint not null default 0);
alter table public.jj_pet_levels enable row level security;
alter table public.jj_pet_income enable row level security;
revoke all on public.jj_pet_levels,public.jj_pet_income from public,anon,authenticated;
create function public.jj_pet_settle() returns void language plpgsql security definer set search_path='' as $$
declare s public.jj_pet_income; t timestamptz:=clock_timestamp(); rate numeric; seconds numeric; active numeric;
begin
 if auth.uid() is null or not public.is_member() then raise exception 'NOT_MEMBER';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,25));
 insert into public.jj_pet_income(user_id,pet) values(auth.uid(),(select pet from public.jj_pet_equipped where user_id=auth.uid())) on conflict do nothing;
 select * into s from public.jj_pet_income where user_id=auth.uid() for update;
 if s.pet is not null then
  select greatest(1,round(c.price/30.0,2))*(1+0.15*(coalesce(l.level,1)-1)) into rate from public.jj_pet_catalog c left join public.jj_pet_levels l on l.pet=c.id and l.user_id=auth.uid() where c.id=s.pet;
  seconds:=greatest(0,least(43200,extract(epoch from t-s.checked_at)));
  active:=greatest(0,least(seconds,extract(epoch from least(t,s.online_until)-s.checked_at)));
  update public.jj_pet_income set pending=least(greatest(s.pending,rate*24),s.pending+rate*(seconds+3*active)/14400.0) where user_id=auth.uid();
 end if;
 update public.jj_pet_income set checked_at=t where user_id=auth.uid();
end $$;
revoke all on function public.jj_pet_settle() from public,anon,authenticated;
alter function public.jj_pets(text,text) rename to jj_pets_legacy59;
revoke all on function public.jj_pets_legacy59(text,text) from public,anon,authenticated;
create function public.jj_pets(p_action text default 'read',p_pet text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare d jsonb;
begin
 perform public.jj_pet_settle();
 d:=public.jj_pets_legacy59(p_action,p_pet);
 update public.jj_pet_income set pet=d->>'equipped' where user_id=auth.uid();
 return d;
end $$;
revoke all on function public.jj_pets(text,text) from public,anon;
grant execute on function public.jj_pets(text,text) to authenticated;
create function public.jj_pet_hub(p_action text default 'read',p_pet text default null,p_request uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare d jsonb;s public.jj_pet_income;lv int;price int;cost int;amount int;prev public.jj_money_log;rate numeric;
begin
 if auth.uid() is null or not public.is_member() then raise exception 'NOT_MEMBER';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,25));
 if p_action not in('read','heartbeat','claim','upgrade') or p_action is null then raise exception 'BAD_ACTION';end if;
 d:=public.jj_pets();
 if p_action in('claim','upgrade') then
  if p_request is null then raise exception 'REQUEST_REQUIRED';end if;
  select * into prev from public.jj_money_log where user_id=auth.uid() and request=p_request;
  if found then
   if prev.kind<>'pet_'||p_action or prev.data->>'pet' is distinct from p_pet then raise exception 'REQUEST_MISMATCH';end if;
   return public.jj_pet_hub('read')||jsonb_build_object('receipt',prev.result,'replayed',true);
  end if;
 end if;
 select * into s from public.jj_pet_income where user_id=auth.uid();
 if p_action='heartbeat' then
  update public.jj_pet_income set online_until=clock_timestamp()+interval '65 seconds' where user_id=auth.uid();
 elsif p_action='claim' then
  amount:=floor(s.pending);
  update public.jj_pet_income set pending=pending-amount,claimed=claimed+amount where user_id=auth.uid();
  insert into public.jj_money_log values(auth.uid(),p_request,'pet_claim',jsonb_build_object('pet',p_pet),amount,0,jsonb_build_object('amount',amount),now());
 elsif p_action='upgrade' then
  if not exists(select 1 from public.jj_pet_inventory where user_id=auth.uid() and pet=p_pet) then raise exception 'NOT_OWNED';end if;
  select c.price,coalesce(l.level,1) into price,lv from public.jj_pet_catalog c left join public.jj_pet_levels l on l.pet=c.id and l.user_id=auth.uid() where c.id=p_pet;
  if lv>=10 then raise exception 'MAX_LEVEL';end if;
  cost:=ceil(price*0.35*power(1.6,lv-1));
  if (d->>'coins')::bigint<cost then raise exception 'INSUFFICIENT_COINS';end if;
  insert into public.jj_pet_levels values(auth.uid(),p_pet,lv+1) on conflict(user_id,pet) do update set level=excluded.level;
  insert into public.jj_money_log values(auth.uid(),p_request,'pet_upgrade',jsonb_build_object('pet',p_pet),-cost,0,jsonb_build_object('cost',cost,'level',lv+1),now());
 end if;
 d:=public.jj_pets();
 select * into s from public.jj_pet_income where user_id=auth.uid();
 select greatest(1,round(c.price/30.0,2))*(1+0.15*(coalesce(l.level,1)-1)) into rate from public.jj_pet_catalog c left join public.jj_pet_levels l on l.pet=c.id and l.user_id=auth.uid() where c.id=s.pet;
 return d||jsonb_build_object('income',jsonb_build_object('pending',s.pending,'claimed',s.claimed,'online_rate',coalesce(rate,0),'offline_rate',coalesce(rate,0)/4,'capacity',coalesce(rate,0)*24),'levels',coalesce((select jsonb_object_agg(c.id,jsonb_build_object('level',coalesce(l.level,1),'next_cost',case when coalesce(l.level,1)<10 then ceil(c.price*0.35*power(1.6,coalesce(l.level,1)-1)) end,'online_rate',greatest(1,round(c.price/30.0,2))*(1+0.15*(coalesce(l.level,1)-1)))) from public.jj_pet_catalog c left join public.jj_pet_levels l on l.pet=c.id and l.user_id=auth.uid()),'{}'::jsonb));
end $$;
revoke all on function public.jj_pet_hub(text,text,uuid) from public,anon;
grant execute on function public.jj_pet_hub(text,text,uuid) to authenticated;
commit;
