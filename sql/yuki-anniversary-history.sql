create table public.yuki_anniversary (
 id boolean primary key default true check(id),
 step integer not null default 0 check(step between 0 and 3),
 unlocked_at timestamptz
);
insert into public.yuki_anniversary(id) values(true);
alter table public.yuki_anniversary enable row level security;
revoke all on public.yuki_anniversary from public,anon,authenticated;
insert into public.section_visibility(section,visible) values('yuki',false) on conflict do nothing;
create or replace function public.yuki_access() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (public.is_jesus() or (
 exists(select 1 from public.profiles where id=auth.uid() and handle='julisa')
 and exists(select 1 from public.section_visibility where section='yuki' and visible)
 and exists(select 1 from public.yuki_anniversary where id and step=3)));
$$;
revoke all on function public.yuki_access() from public,anon;
grant execute on function public.yuki_access() to authenticated;
create or replace function public.yuki_event(p_step integer default null,p_answer text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare s integer; t timestamptz; owner boolean:=public.is_jesus(); allowed boolean;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and handle in('jesus','julisa')) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
 select coalesce(bool_or(visible),false) into allowed from public.section_visibility where section='yuki';
 if not owner and not allowed then raise exception 'HIDDEN' using errcode='42501'; end if;
 select step,unlocked_at into s,t from public.yuki_anniversary where id for update;
 if p_step is not null then
  if p_step<>s or s>=3 then raise exception 'STALE_STEP'; end if;
  if p_answer is distinct from (array['remember','care','YUKI'])[s+1] then raise exception 'TRY_AGAIN'; end if;
  s:=s+1; if s=3 then t:=now(); end if;
  update public.yuki_anniversary set step=s,unlocked_at=t where id;
 end if;
 return jsonb_build_object('step',s,'unlocked',s=3,'visible',allowed,'owner',owner,'unlocked_at',t);
end $$;
revoke all on function public.yuki_event(integer,text) from public,anon;
grant execute on function public.yuki_event(integer,text) to authenticated;
create table public.yuki_chat_turns (
 id uuid primary key,owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
 message text not null check(length(btrim(message)) between 1 and 2000),
 reply text check(length(reply)<=12000),suggestion text check(length(suggestion)<=500),
 memory_id uuid,created_at timestamptz not null default now()
);
create index yuki_chat_turns_owner_time on public.yuki_chat_turns(owner_id,created_at desc,id desc);
alter table public.yuki_chat_turns enable row level security;
revoke all on public.yuki_chat_turns from public,anon,authenticated;
grant select on public.yuki_chat_turns to authenticated;
grant insert(id,message) on public.yuki_chat_turns to authenticated;
grant all on public.yuki_chat_turns to service_role;
create policy own_history on public.yuki_chat_turns for select to authenticated using(owner_id=(select auth.uid()) and (select public.yuki_access()));
create policy own_message on public.yuki_chat_turns for insert to authenticated with check(owner_id=(select auth.uid()) and (select public.yuki_access()) and reply is null and suggestion is null and memory_id is null);
create or replace function public.yuki_approve_memory(p_body text,p_shared boolean default false,p_turn uuid default null) returns uuid language plpgsql security definer set search_path='' as $$
declare mid uuid; who text;
begin
 if not coalesce(public.yuki_access(),false) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
 if length(btrim(p_body)) not between 1 and 450 or p_body is null then raise exception 'INVALID_MEMORY'; end if;
 if p_turn is not null then
  select memory_id into mid from public.yuki_chat_turns where id=p_turn and owner_id=auth.uid() for update;
  if not found then raise exception 'NOT_YOURS' using errcode='42501'; end if;
  if mid is not null then return mid; end if;
 end if;
 select case when handle='jesus' then 'Jesús' else 'Julie' end into who from public.profiles where id=auth.uid();
 mid:=gen_random_uuid();
 insert into public.yuki_memories(owner_id,id,body,visibility) values(auth.uid(),mid,who||' contó: '||btrim(p_body),case when p_shared then 'shared' else 'private' end);
 if p_turn is not null then update public.yuki_chat_turns set memory_id=mid where id=p_turn and owner_id=auth.uid(); end if;
 return mid;
end $$;
revoke all on function public.yuki_approve_memory(text,boolean,uuid) from public,anon;
grant execute on function public.yuki_approve_memory(text,boolean,uuid) to authenticated;
create or replace function public.yuki_chat_battery() returns jsonb language plpgsql security definer set search_path='' as $$
declare today date := (now() at time zone 'America/Matamoros')::date; spent integer;
begin
 if not coalesce(public.yuki_access(),false) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
 select used into spent from public.yuki_chat_usage where owner_id=auth.uid() and day=today;
 return jsonb_build_object('limit',50,'remaining',greatest(0,50-coalesce(spent,0)),'resets_at',(today+1)::timestamp at time zone 'America/Matamoros');
end $$;
create or replace function public.yuki_reserve_chat_turn() returns boolean language plpgsql security definer set search_path='' as $$
begin
 if not coalesce(public.yuki_access(),false) then return false; end if;
 insert into public.yuki_chat_usage as u values(auth.uid(),(now() at time zone 'America/Matamoros')::date,1)
 on conflict(owner_id,day) do update set used=u.used+1 where u.used<50;
 return found;
end $$;
