create function public.yuki_chat_memories()
returns table (body text)
language sql stable security invoker
set search_path = ''
as $$
  select m.body
  from public.yuki_memories as m
  join public.profiles as p on p.id = m.owner_id
  where m.owner_id = (select auth.uid()) and p.handle = 'jesus'
  order by m.approved_at desc, m.id desc
  limit 10;
$$;
revoke all on function public.yuki_chat_memories() from public, anon, authenticated;
grant execute on function public.yuki_chat_memories() to authenticated;