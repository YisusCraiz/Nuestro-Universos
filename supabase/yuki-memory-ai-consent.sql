-- Separate per-profile permission to send individually approved memories to Gemini.
-- OFF by default. Owner can revoke at any moment; clients never see other owners' consent.
create table if not exists public.yuki_memory_ai_consent (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.yuki_memory_ai_consent enable row level security;
revoke all on public.yuki_memory_ai_consent from anon;
grant select,insert,update,delete on public.yuki_memory_ai_consent to authenticated;
drop policy if exists yuki_ai_owner_select on public.yuki_memory_ai_consent;
create policy yuki_ai_owner_select on public.yuki_memory_ai_consent
 for select to authenticated using ((select auth.uid())=owner_id);
drop policy if exists yuki_ai_owner_insert on public.yuki_memory_ai_consent;
create policy yuki_ai_owner_insert on public.yuki_memory_ai_consent
 for insert to authenticated with check ((select auth.uid())=owner_id);
drop policy if exists yuki_ai_owner_update on public.yuki_memory_ai_consent;
create policy yuki_ai_owner_update on public.yuki_memory_ai_consent
 for update to authenticated using ((select auth.uid())=owner_id)
 with check ((select auth.uid())=owner_id);
drop policy if exists yuki_ai_owner_delete on public.yuki_memory_ai_consent;
create policy yuki_ai_owner_delete on public.yuki_memory_ai_consent
 for delete to authenticated using ((select auth.uid())=owner_id);
create or replace function public.yuki_memory_ai_consent_timestamp()
returns trigger language plpgsql set search_path = '' as $$
begin
 if new.owner_id is distinct from old.owner_id then raise exception 'Cannot transfer consent'; end if;
 new.updated_at=now();
 return new;
end $$;
revoke all on function public.yuki_memory_ai_consent_timestamp() from public,anon,authenticated;
drop trigger if exists yuki_memory_ai_consent_timestamp on public.yuki_memory_ai_consent;
create trigger yuki_memory_ai_consent_timestamp before update on public.yuki_memory_ai_consent
 for each row execute function public.yuki_memory_ai_consent_timestamp();
