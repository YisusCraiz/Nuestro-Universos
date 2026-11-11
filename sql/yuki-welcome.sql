begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('yuki-welcome','yuki-welcome',false,10485760,array['audio/mpeg','audio/mp4','audio/x-m4a','audio/m4a','audio/wav','audio/x-wav','audio/ogg','audio/webm','audio/aac'])
on conflict(id) do nothing;

create table if not exists public.yuki_welcome_audio (
 singleton boolean primary key default true check(singleton),
 path text not null,
 subtitle_en text not null check(char_length(subtitle_en)<=1800)
);
alter table public.yuki_welcome_audio enable row level security;
revoke all on public.yuki_welcome_audio from public,anon,authenticated;

create policy yuki_welcome_upload on storage.objects for insert to authenticated
with check (bucket_id='yuki-welcome' and public.is_jesus() and name ~ '^[0-9a-f-]{36}[.](mp3|m4a|wav|ogg|webm|aac)$');

create policy yuki_welcome_listen on storage.objects for select to authenticated
using (bucket_id='yuki-welcome' and public.yuki_access());

create policy yuki_welcome_remove on storage.objects for delete to authenticated
using (bucket_id='yuki-welcome' and public.is_jesus());

create or replace function public.yuki_welcome(p_path text default null,p_subtitle_en text default null)
returns jsonb language plpgsql security definer set search_path=''
as $welcome$
declare result jsonb;
begin
 if not coalesce(public.yuki_access(),false) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
 if p_path is not null then
  if not public.is_jesus() then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if p_path !~ '^[0-9a-f-]{36}[.](mp3|m4a|wav|ogg|webm|aac)$'
   or not exists(select 1 from storage.objects where bucket_id='yuki-welcome' and name=p_path)
   or char_length(coalesce(p_subtitle_en,''))>1800 then raise exception 'BAD_AUDIO'; end if;
  insert into public.yuki_welcome_audio(singleton,path,subtitle_en)
  values(true,p_path,coalesce(p_subtitle_en,''))
  on conflict(singleton) do update set path=excluded.path,subtitle_en=excluded.subtitle_en;
 end if;
 select jsonb_build_object('path',path,'subtitle_en',subtitle_en) into result from public.yuki_welcome_audio where singleton;
 return result;
end;
$welcome$;
revoke all on function public.yuki_welcome(text,text) from public,anon;
grant execute on function public.yuki_welcome(text,text) to authenticated;
commit;
