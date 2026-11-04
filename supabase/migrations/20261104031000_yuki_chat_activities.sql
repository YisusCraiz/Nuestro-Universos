create function public.yuki_chat_activities()
returns table (section_id text)
language sql security invoker
set search_path = ''
as $$
  select entry.key
  from jsonb_each(public.jj_sections()) as entry
  where entry.key not in ('home', 'profile', 'novios')
    and (public.is_jesus() or entry.value = 'true'::jsonb)
  order by entry.key;
$$;
revoke all on function public.yuki_chat_activities() from public, anon, authenticated;
grant execute on function public.yuki_chat_activities() to authenticated;