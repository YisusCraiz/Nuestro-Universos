create table public.yuki_chat_usage (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  day date not null, used integer not null check (used between 1 and 10),
  primary key(owner_id, day)
);
alter table public.yuki_chat_usage enable row level security;
revoke all on public.yuki_chat_usage from public, anon, authenticated;
create function public.yuki_reserve_chat_turn() returns boolean
language plpgsql security definer set search_path='' as $$
begin
  if not coalesce(public.is_jesus(),false) then return false; end if;
  insert into public.yuki_chat_usage as u values (auth.uid(), (now() at time zone 'America/Matamoros')::date, 1)
  on conflict(owner_id, day) do update set used=u.used+1 where u.used<10;
  return found;
end $$;
revoke all on function public.yuki_reserve_chat_turn() from public, anon, authenticated;
grant execute on function public.yuki_reserve_chat_turn() to authenticated;