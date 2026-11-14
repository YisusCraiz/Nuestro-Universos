-- Installed in Supabase: immutable ownership and automatic reapproval timestamp.
-- Changes to approved content or privacy revoke approval and return to pending.
create or replace function public.yuki_memory_guard_update()
returns trigger language plpgsql set search_path = '' as $$
begin
 if new.owner_id is distinct from old.owner_id then
  raise exception 'Memory ownership cannot be transferred';
 end if;
 if new.created_at is distinct from old.created_at then
  raise exception 'Memory creation time cannot be modified';
 end if;
 if old.status = 'approved' and
   (new.memory_text is distinct from old.memory_text or new.visibility is distinct from old.visibility) then
  new.status := 'pending';
 end if;
 if new.status = 'approved' then
  if old.status is distinct from 'approved' then
   new.approved_at := now();
  else
   new.approved_at := old.approved_at;
  end if;
 else
  new.approved_at := null;
 end if;
 return new;
end $$;
revoke all on function public.yuki_memory_guard_update() from public, anon, authenticated;
drop trigger if exists yuki_memory_guard_update on public.yuki_memory_proposals;
create trigger yuki_memory_guard_update before update on public.yuki_memory_proposals
for each row execute function public.yuki_memory_guard_update();
