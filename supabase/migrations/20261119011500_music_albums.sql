begin;

create function public.jj_music_album_tracks_valid(tracks jsonb)
returns boolean
language sql
immutable
strict
set search_path = ''
as $$
  select case when jsonb_typeof(tracks) <> 'array' then false else
    jsonb_array_length(tracks) between 1 and 100
    and (
      select count(*) = count(distinct (track->>'source', track->>'id'))
        and bool_and(coalesce(
          jsonb_typeof(track) = 'object'
          and length(btrim(track->>'title')) between 1 and 300
          and length(coalesce(track->>'artist', '')) <= 300
          and case track->>'source'
            when 'local' then track->>'id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            when 'spotify' then track->>'id' ~ '^[A-Za-z0-9]{22}$'
            else false
          end, false))
      from jsonb_array_elements(tracks) as t(track)
    )
  end;
$$;

create table public.jj_music_albums (
  id uuid primary key,
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 100),
  description text not null default '' check (length(description) <= 1000),
  cover_path text check (cover_path like author_id::text || '/%'),
  tracks jsonb not null check (octet_length(tracks::text) <= 150000 and public.jj_music_album_tracks_valid(tracks)),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now()
);

create index jj_music_albums_created_idx on public.jj_music_albums (created_at desc, id desc);
create index jj_music_albums_author_idx on public.jj_music_albums (author_id);
alter table public.jj_music_albums enable row level security;
revoke all on public.jj_music_albums from public, anon, authenticated;
grant select on public.jj_music_albums to authenticated;
grant insert (id, title, description, cover_path, tracks),
      update (title, description, cover_path, tracks, revision)
      on public.jj_music_albums to authenticated;
revoke execute on function public.jj_music_album_tracks_valid(jsonb) from public, anon;
grant execute on function public.jj_music_album_tracks_valid(jsonb) to authenticated;

create policy music_albums_read on public.jj_music_albums
  for select to authenticated using ((select public.is_member()));
create policy music_albums_create on public.jj_music_albums
  for insert to authenticated with check ((select public.is_member()) and author_id = (select auth.uid()));
create policy music_albums_edit on public.jj_music_albums
  for update to authenticated
  using ((select public.is_member()) and author_id = (select auth.uid()))
  with check ((select public.is_member()) and author_id = (select auth.uid()));

commit;
