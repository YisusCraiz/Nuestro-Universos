begin;
create table if not exists public.yuki_memory_topics (
 owner_id uuid not null,
 memory_id uuid not null,
 topic text not null check(length(topic) between 3 and 80),
 primary key(owner_id,memory_id),
 foreign key(owner_id,memory_id) references public.yuki_memories(owner_id,id) on delete cascade
);
alter table public.yuki_memory_topics enable row level security;
revoke all on public.yuki_memory_topics from public,anon,authenticated;
grant select,delete on public.yuki_memory_topics to authenticated;
create policy yuki_topics_read_own on public.yuki_memory_topics for select to authenticated
 using (owner_id=(select auth.uid()) and (select public.yuki_access()));
create policy yuki_topics_revoke_own on public.yuki_memory_topics for delete to authenticated
 using (owner_id=(select auth.uid()) and (select public.yuki_access()));

create or replace function public.yuki_normalize_topic(p_text text)
returns text language sql immutable set search_path='' as $fn$
 select btrim(regexp_replace(translate(lower(p_text),'áéíóúüñ','aeiouun'),'[^[:alnum:]]+',' ','g'));
$fn$;
revoke all on function public.yuki_normalize_topic(text) from public,anon,authenticated;

create or replace function public.yuki_approve_topic_memory(p_body text,p_topic text,p_turn uuid default null)
returns uuid language plpgsql security definer set search_path='' as $fn$
declare mid uuid; topic_key text:=public.yuki_normalize_topic(p_topic);
begin
 if length(topic_key) not between 3 and 80 or topic_key is null then raise exception 'INVALID_TOPIC';end if;
 mid:=public.yuki_approve_memory(p_body,false,p_turn);
 if not exists(select 1 from public.yuki_memories where owner_id=auth.uid() and id=mid and visibility='private') then
  raise exception 'INVALID_MEMORY';
 end if;
 insert into public.yuki_memory_topics(owner_id,memory_id,topic) values(auth.uid(),mid,topic_key)
 on conflict(owner_id,memory_id) do update set topic=excluded.topic;
 return mid;
end;
$fn$;
revoke all on function public.yuki_approve_topic_memory(text,text,uuid) from public,anon;
grant execute on function public.yuki_approve_topic_memory(text,text,uuid) to authenticated;

-- Only the authenticated chat service sees this Boolean. It never receives the other memory or topic string.
create or replace function public.yuki_partner_topic_match(p_viewer uuid,p_message text)
returns boolean language sql stable security definer set search_path='' as $fn$
 select exists(
  select 1 from public.yuki_memory_topics t
  join public.profiles owner on owner.id=t.owner_id
  join public.profiles viewer on viewer.id=p_viewer
  join public.yuki_memories memory on memory.owner_id=t.owner_id and memory.id=t.memory_id
  where memory.visibility='private' and owner.handle<>viewer.handle
   and owner.handle in('jesus','julisa') and viewer.handle in('jesus','julisa')
   and strpos(' '||public.yuki_normalize_topic(left(p_message,2000))||' ',' '||t.topic||' ')>0
 );
$fn$;
revoke all on function public.yuki_partner_topic_match(uuid,text) from public,anon,authenticated;
grant execute on function public.yuki_partner_topic_match(uuid,text) to service_role;
commit;
