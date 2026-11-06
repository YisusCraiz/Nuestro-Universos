create or replace function public.yuki_chat_memories() returns table(body text)
language sql stable security invoker set search_path='' as $$
select m.body from public.yuki_memories m
where public.is_member() and (m.owner_id=(select auth.uid()) or m.visibility='shared')
order by m.approved_at desc,m.id desc limit 40;
$$;
