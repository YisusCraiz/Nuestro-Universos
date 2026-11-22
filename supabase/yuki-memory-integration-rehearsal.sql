-- Integration rehearsal against the actual RLS policies and approval trigger.
-- All inserted synthetic records are rolled back, never persisted.
begin;
do $$
declare
 owner_id uuid;
 partner_id uuid;
 approved_private uuid;
 approved_shared uuid;
 protected_surprise uuid;
 unreviewed uuid;
 selected_texts text[];
 readable_count integer;
 approved_count integer;
 changed_count integer;
begin
 select id into strict owner_id from public.profiles where handle='jesus';
 select id into strict partner_id from public.profiles where handle='julisa';
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 execute 'set local role authenticated';
 insert into public.yuki_memory_proposals(owner_id,memory_text,visibility,status)
 values(owner_id,'E2E SYNTHETIC PRIVATE','private','pending') returning id into approved_private;
 insert into public.yuki_memory_proposals(owner_id,memory_text,visibility,status)
 values(owner_id,'E2E SYNTHETIC SHARED','shared','pending') returning id into approved_shared;
 insert into public.yuki_memory_proposals(owner_id,memory_text,visibility,status)
 values(owner_id,'E2E SYNTHETIC SURPRISE','surprise','pending') returning id into protected_surprise;
 insert into public.yuki_memory_proposals(owner_id,memory_text,visibility,status)
 values(owner_id,'E2E SYNTHETIC PENDING','private','pending') returning id into unreviewed;
 update public.yuki_memory_proposals set status='approved'
 where id in (approved_private,approved_shared,protected_surprise);
 select array_agg(memory_text order by memory_text) into selected_texts
 from public.yuki_memory_proposals
 where owner_id=owner_id and id in (approved_private,approved_shared,protected_surprise,unreviewed)
   and status='approved' and visibility in ('private','shared');
 if selected_texts is distinct from array['E2E SYNTHETIC PRIVATE','E2E SYNTHETIC SHARED']::text[] then
  raise exception 'Approved retrieval included an unreviewed or surprise memory: %',selected_texts;
 end if;
 update public.yuki_memory_proposals set status='pending' where id=approved_private;
 select count(*) into approved_count from public.yuki_memory_proposals
 where id=approved_private and status='approved';
 if approved_count<>0 then raise exception 'Revoked memory still selected as approved'; end if;
 update public.yuki_memory_proposals set status='approved' where id=approved_private;
 update public.yuki_memory_proposals set memory_text='E2E SYNTHETIC MODIFIED' where id=approved_private;
 select count(*) into approved_count from public.yuki_memory_proposals
 where id=approved_private and status='approved';
 if approved_count<>0 then raise exception 'Edited memory remained approved'; end if;
 delete from public.yuki_memory_proposals where id=approved_shared;
 get diagnostics changed_count = row_count;
 if changed_count<>1 then raise exception 'Owner deletion failed'; end if;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub',partner_id::text,true);
 execute 'set local role authenticated';
 select count(*) into readable_count from public.yuki_memory_proposals
 where id in (approved_private,approved_shared,protected_surprise,unreviewed);
 if readable_count<>0 then raise exception 'Partner could read synthetic owner memories'; end if;
 update public.yuki_memory_proposals set status='approved' where id=unreviewed;
 get diagnostics changed_count = row_count;
 if changed_count<>0 then raise exception 'Partner could approve owner memory'; end if;
 raise notice 'PASS: real RLS and trigger rehearsal, approve/read, exclude surprise and pending, revoke, edit, delete, partner isolation';
end $$;
rollback;
