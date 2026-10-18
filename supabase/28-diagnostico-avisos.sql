-- Requires SQL 14. Only the current user's device delivery metadata is returned.
create or replace function public.universe_push_status(p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 return coalesce((select jsonb_build_object('created_at',q.created_at,'delivered_at',q.delivered_at,'attempts',q.attempts,'last_error',q.last_error) from public.push_deliveries q join public.push_devices d on d.id=q.device_id where d.id=p_id and d.user_id=auth.uid() and q.event_key like 'test-%' order by q.created_at desc limit 1),'{}'::jsonb);
end $$;
revoke all on function public.universe_push_status(uuid) from public,anon;
grant execute on function public.universe_push_status(uuid) to authenticated;
