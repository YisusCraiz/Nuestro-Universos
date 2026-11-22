-- Explicit, revocable owner-to-partner grants. No cross-owner SELECT on memory proposals.
-- Grants expire on edit, privacy change, rejection or revocation.
create table if not exists public.yuki_memory_grants(
 memory_id uuid primary key references public.yuki_memory_proposals(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade,
 allow_ai boolean not null default false,
 created_at timestamptz not null default now(),
 constraint yuki_memory_grant_no_self check(owner_id<>recipient_id)
);
alter table public.yuki_memory_grants enable row level security;
revoke all on public.yuki_memory_grants from anon;
grant select,insert,update,delete on public.yuki_memory_grants to authenticated;
create policy yuki_memory_grant_owner_read on public.yuki_memory_grants for select to authenticated
 using((select auth.uid())=owner_id);
create policy yuki_memory_grant_owner_create on public.yuki_memory_grants for insert to authenticated
 with check((select auth.uid())=owner_id);
create policy yuki_memory_grant_owner_change on public.yuki_memory_grants for update to authenticated
 using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
create policy yuki_memory_grant_owner_remove on public.yuki_memory_grants for delete to authenticated
 using((select auth.uid())=owner_id);

create or replace function public.yuki_memory_grant_guard()
returns trigger language plpgsql security definer set search_path='' as $$
declare viewer_handle text; partner_handle text;
begin
 if tg_op='UPDATE' and (new.memory_id is distinct from old.memory_id or new.owner_id is distinct from old.owner_id
   or new.recipient_id is distinct from old.recipient_id or new.created_at is distinct from old.created_at) then
  raise exception 'The memory owner and recipient cannot be changed';
 end if;
 if new.owner_id is distinct from auth.uid() then raise exception 'Only the memory owner may grant access'; end if;
 select handle into viewer_handle from public.profiles where id=new.owner_id;
 select handle into partner_handle from public.profiles where id=new.recipient_id;
 if not ((viewer_handle='jesus' and partner_handle='julisa') or (viewer_handle='julisa' and partner_handle='jesus')) then
  raise exception 'Sharing only allowed between the two verified partners';
 end if;
 if not exists(select 1 from public.yuki_memory_proposals m where m.id=new.memory_id and m.owner_id=new.owner_id
    and m.status='approved' and m.visibility <> 'surprise') then
  raise exception 'Only individually approved non-surprise memories may be shared';
 end if;
 return new;
end $$;
revoke all on function public.yuki_memory_grant_guard() from public,anon,authenticated;
create trigger yuki_memory_grant_guard before insert or update on public.yuki_memory_grants
 for each row execute function public.yuki_memory_grant_guard();

create or replace function public.yuki_memory_revoke_grants_on_change()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.memory_text is distinct from old.memory_text or new.visibility is distinct from old.visibility
    or new.status is distinct from old.status or new.status<>'approved' then
  delete from public.yuki_memory_grants where memory_id=old.id;
 end if;
 return null;
end $$;
revoke all on function public.yuki_memory_revoke_grants_on_change() from public,anon,authenticated;
create trigger yuki_memory_revoke_grants_on_change after update on public.yuki_memory_proposals
 for each row execute function public.yuki_memory_revoke_grants_on_change();

-- SECURE recipient read: caller's JWT determines identity, no arbitrary recipient parameter.
-- No surprise, pending, deleted or unapproved content can be returned.
create or replace function public.yuki_shared_memories_for_me(p_for_ai boolean default false)
returns table(memory_id uuid,owner_id uuid,memory_text text,allow_ai boolean)
language sql stable security definer set search_path='' as $$
 select m.id,m.owner_id,m.memory_text,g.allow_ai
 from public.yuki_memory_grants g join public.yuki_memory_proposals m on m.id=g.memory_id
 where g.recipient_id=(select auth.uid()) and m.status='approved' and m.visibility<>'surprise'
   and m.owner_id=g.owner_id and (not p_for_ai or g.allow_ai=true)
   and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.handle in ('jesus','julisa'))
 order by g.created_at desc,m.id desc limit 20
$$;
revoke all on function public.yuki_shared_memories_for_me(boolean) from public,anon;
grant execute on function public.yuki_shared_memories_for_me(boolean) to authenticated;

create index if not exists yuki_grants_recipient_idx on public.yuki_memory_grants(recipient_id,created_at desc);

-- Resolve the partner's identity server-side; do not trust a recipient UUID provided by the browser.
create or replace function public.yuki_partner_for_sharing()
returns uuid language sql stable security definer set search_path='' as $$
 select target.id from public.profiles viewer
 join public.profiles target on target.handle=case viewer.handle
   when 'jesus' then 'julisa' when 'julisa' then 'jesus' else null end
 where viewer.id=(select auth.uid()) limit 1
$$;
revoke all on function public.yuki_partner_for_sharing() from public,anon;
grant execute on function public.yuki_partner_for_sharing() to authenticated;
