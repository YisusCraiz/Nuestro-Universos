alter table public.yuki_memories add column visibility text not null default 'private' check (visibility in ('private','shared'));
drop policy read_own on public.yuki_memories;
create policy read_authorized on public.yuki_memories for select to authenticated
using (owner_id=(select auth.uid()) or (visibility='shared' and public.is_member()));
create or replace function public.yuki_chat_memories() returns table(body text)
language sql stable security invoker set search_path='' as $$
select m.body from public.yuki_memories m
where public.is_member() and (m.owner_id=(select auth.uid()) or m.visibility='shared')
order by m.approved_at desc,m.id desc limit 10;
$$;