begin;

create table public.jj_live_chat (
  id uuid primary key,
  session_id uuid not null,
  sender uuid not null references public.profiles(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 500),
  builtin integer check (builtin between 0 and 11),
  sticker_id uuid,
  created_at timestamptz not null default now(),
  check ((body <> '' and builtin is null and sticker_id is null)
    or (body = '' and num_nonnulls(builtin, sticker_id) = 1))
);
create index jj_live_chat_recent on public.jj_live_chat (session_id, created_at desc, id desc);
alter table public.jj_live_chat enable row level security;
revoke all on public.jj_live_chat from public, anon, authenticated;

create function public.jj_live_chat_feed(
  p_session uuid, p_id uuid default null, p_body text default '',
  p_builtin integer default null, p_sticker uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
  message text := btrim(coalesce(p_body, ''));
begin
  if not exists (select 1 from public.profiles where id = caller and handle in ('jesus','julisa'))
  then raise exception 'NOT_MEMBER'; end if;
  if not exists (
    select 1 from public.live_stream s join public.section_visibility v on v.section = 'live' and v.visible
    where s.id = 1 and s.session_id = p_session and s.expires_at > now()
  ) then raise exception 'STREAM_CLOSED'; end if;

  if p_id is not null and not exists (
    select 1 from public.jj_live_chat where id = p_id and sender = caller and session_id = p_session
  ) then
    if p_sticker is not null and not exists (select 1 from public.couple_stickers where id = p_sticker)
    then raise exception 'STICKER_MISSING'; end if;
    insert into public.jj_live_chat (id, session_id, sender, body, builtin, sticker_id)
    values (p_id, p_session, caller, message, p_builtin, p_sticker)
    on conflict (id) do nothing;
  end if;

  return coalesce((
    select jsonb_agg(to_jsonb(m) order by m.created_at, m.id)
    from (
      select c.id, c.sender, c.created_at, c.body, c.builtin, c.sticker_id, s.path, s.title, p.handle
      from public.jj_live_chat c
      join public.profiles p on p.id = c.sender
      left join public.couple_stickers s on s.id = c.sticker_id
      where c.session_id = p_session
      order by c.created_at desc, c.id desc
      limit 80
    ) m
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.jj_live_chat_feed(uuid,uuid,text,integer,uuid) from public, anon;
grant execute on function public.jj_live_chat_feed(uuid,uuid,text,integer,uuid) to authenticated;

create table public.jj_streamclips (
  id uuid primary key,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  path text not null unique,
  created_at timestamptz not null default now()
);
alter table public.jj_streamclips enable row level security;
revoke all on public.jj_streamclips from public, anon, authenticated;
grant select on public.jj_streamclips to authenticated;

create function public.jj_streamclips_visible() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and (
      p.handle = 'jesus' or (p.handle = 'julisa' and exists (
        select 1 from public.section_visibility where section in ('music','playlists','videos') and visible
      ))
    )
  );
$$;
revoke all on function public.jj_streamclips_visible() from public, anon;
grant execute on function public.jj_streamclips_visible() to authenticated;
create policy jj_streamclips_read on public.jj_streamclips for select to authenticated
using ((select public.jj_streamclips_visible()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('jj-streamclips', 'jj-streamclips', false, 52428800, array['video/mp4','video/webm']);

create policy jj_streamclips_upload on storage.objects for insert to authenticated
with check (
  bucket_id = 'jj-streamclips'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}[.](mp4|webm)$'
  and exists (select 1 from public.profiles where id = (select auth.uid()) and handle = 'julisa')
);
create policy jj_streamclips_files on storage.objects for select to authenticated
using (
  bucket_id = 'jj-streamclips' and (
    exists (select 1 from public.jj_streamclips c where c.path = objects.name)
    or ((storage.foldername(name))[1] = (select auth.uid())::text
      and exists (select 1 from public.profiles where id = (select auth.uid()) and handle = 'julisa'))
  )
);

create function public.jj_streamclip_save(p_id uuid, p_title text, p_extension text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
  file_path text;
begin
  if not exists (select 1 from public.profiles where id = caller and handle = 'julisa')
  then raise exception 'JULIE_ONLY'; end if;
  if p_id is null or p_extension is null or p_extension not in ('mp4','webm')
  then raise exception 'INVALID_CLIP'; end if;
  file_path := caller::text || '/' || p_id::text || '.' || p_extension;
  if not exists (select 1 from storage.objects where bucket_id = 'jj-streamclips' and name = file_path)
  then raise exception 'CLIP_MISSING'; end if;
  insert into public.jj_streamclips (id, author_id, title, path)
  values (p_id, caller, btrim(p_title), file_path)
  on conflict (id) do nothing;
end;
$$;
revoke all on function public.jj_streamclip_save(uuid,text,text) from public, anon;
grant execute on function public.jj_streamclip_save(uuid,text,text) to authenticated;

commit;
