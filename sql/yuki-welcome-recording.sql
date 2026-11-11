begin;
create table if not exists public.yuki_welcome_recording (
 part integer primary key check(part between 0 and 2),
 bytes bytea not null
);
alter table public.yuki_welcome_recording enable row level security;
revoke all on public.yuki_welcome_recording from public,anon,authenticated;

create or replace function public.yuki_welcome_recording(p_include_audio boolean default false)
returns jsonb language plpgsql stable security definer set search_path=''
as $recording$
declare result jsonb;
begin
 if not coalesce(public.yuki_access(),false) then
  raise exception 'FORBIDDEN' using errcode='42501';
 end if;
 select jsonb_build_object(
  'embedded',true,
  'subtitle_en',E'Julie, Julie, Julie… Happy first anniversary, my beautiful Julie. I love every moment I spend with you, and I hope we get to share so many more.\n\nI know I go a little crazy sometimes making things just to see you smile. I know, I know, you don’t have to remind me. But I love doing it, just because it’s you. I love you so much.\n\nMaybe you already have an idea of how much I love you from all the things I make for you. But I’ll never get tired of telling you that I love you more than anyone, and I’ll always be here for you.\n\nHappy first anniversary, Julie.',
  'audio',case when p_include_audio then encode(string_agg(bytes,''::bytea order by part),'base64') end
 ) into result from public.yuki_welcome_recording having count(*)=3;
 return result;
end;
$recording$;
revoke all on function public.yuki_welcome_recording(boolean) from public,anon;
grant execute on function public.yuki_welcome_recording(boolean) to authenticated;
commit;
