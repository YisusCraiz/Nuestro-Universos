create table public.yuki_memories (
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  id uuid not null,
  body text not null check (length(btrim(body)) between 1 and 500),
  approved_at timestamptz not null default now(),
  primary key (owner_id, id)
);
alter table public.yuki_memories enable row level security;
revoke all on public.yuki_memories from public, anon, authenticated;
grant select on public.yuki_memories to authenticated;
grant insert (id, body) on public.yuki_memories to authenticated;
create policy read_own on public.yuki_memories for select to authenticated
using (owner_id = (select auth.uid()));
create policy approve_own on public.yuki_memories for insert to authenticated
with check (owner_id = (select auth.uid()) and exists (
  select 1 from public.profiles where id = (select auth.uid()) and handle = 'jesus'
));