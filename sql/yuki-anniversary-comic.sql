begin;
create table if not exists public.yuki_anniversary_comic (
 page integer primary key check(page between -1 and 10),
 image bytea not null
);
alter table public.yuki_anniversary_comic enable row level security;
revoke all on public.yuki_anniversary_comic from public,anon,authenticated;

create or replace function public.yuki_anniversary_page(p_page integer)
returns text language plpgsql stable security definer set search_path=''
as $comic$
begin
 if not coalesce(public.yuki_access(),false) then
  raise exception 'FORBIDDEN' using errcode='42501';
 end if;
 return (select encode(image,'base64') from public.yuki_anniversary_comic where page=p_page);
end;
$comic$;
revoke all on function public.yuki_anniversary_page(integer) from public,anon;
grant execute on function public.yuki_anniversary_page(integer) to authenticated;
commit;
