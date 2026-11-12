-- Yuki memory approval queue. Apply only after reviewing existing auth integration.
-- No memory is readable by other users or Gemini from the browser.
create table if not exists public.yuki_memory_proposals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  memory_text text not null check (char_length(memory_text) between 1 and 4000),
  visibility text not null check (visibility in ('private','shared','surprise')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint approval_timestamp_consistent check (
    (status = 'approved' and approved_at is not null) or
    (status <> 'approved' and approved_at is null)
  )
);
alter table public.yuki_memory_proposals enable row level security;
revoke all on public.yuki_memory_proposals from anon;
grant select, insert, update, delete on public.yuki_memory_proposals to authenticated;
create policy "owner_reads_own_proposals" on public.yuki_memory_proposals
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy "owner_inserts_own_proposals" on public.yuki_memory_proposals
  for insert to authenticated with check ((select auth.uid()) = owner_id and status = 'pending' and approved_at is null);
create policy "owner_updates_own_proposals" on public.yuki_memory_proposals
  for update to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "owner_deletes_own_proposals" on public.yuki_memory_proposals
  for delete to authenticated using ((select auth.uid()) = owner_id);
create index if not exists yuki_memory_owner_status_idx on public.yuki_memory_proposals(owner_id,status,created_at desc);
-- IMPORTANT: No cross-user SELECT policy. Shared memories must be served by a
-- separate authorized backend after verifying both parties' permissions.
