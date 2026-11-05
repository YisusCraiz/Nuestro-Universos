alter table public.yuki_chat_usage drop constraint yuki_chat_usage_used_check;
alter table public.yuki_chat_usage add constraint yuki_chat_usage_used_check check(used between 1 and 50);
create or replace function public.yuki_reserve_chat_turn() returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if not coalesce(public.is_jesus(),false) then return false; end if;
 insert into public.yuki_chat_usage as u values(auth.uid(),(now() at time zone 'America/Matamoros')::date,1)
 on conflict(owner_id,day) do update set used=u.used+1 where u.used<50;
 return found;
end $$;
create function public.yuki_chat_battery() returns jsonb
language plpgsql security definer set search_path='' as $$
declare today date := (now() at time zone 'America/Matamoros')::date; spent integer;
begin
 if not coalesce(public.is_jesus(),false) then raise exception 'OWNER_ONLY' using errcode='42501'; end if;
 select used into spent from public.yuki_chat_usage where owner_id=auth.uid() and day=today;
 return jsonb_build_object('limit',50,'remaining',greatest(0,50-coalesce(spent,0)),
 'resets_at',(today+1)::timestamp at time zone 'America/Matamoros');
end $$;
revoke all on function public.yuki_chat_battery() from public,anon,authenticated;
grant execute on function public.yuki_chat_battery() to authenticated;