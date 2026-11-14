-- Run manually in the SQL editor; all test data is rolled back.
-- Requires profiles handles 'jesus' and 'julisa'.
begin;
do $$
declare
 jesus_id uuid;
 julie_id uuid;
 memory_id uuid;
 visible_count int;
 changed_count int;
 current_status text;
 approved_time timestamptz;
 new_time timestamptz;
 spoof_denied boolean := false;
 transfer_denied boolean := false;
 premature_approval_denied boolean := false;
 timestamp_insert_denied boolean := false;
 created_at_denied boolean := false;
begin
 select id into strict jesus_id from public.profiles where handle='jesus';
 select id into strict julie_id from public.profiles where handle='julisa';
 perform set_config('request.jwt.claim.sub',jesus_id::text,true);
 execute 'set local role authenticated';
 begin
  insert into public.yuki_memory_proposals(owner_id,memory_text,visibility,status,approved_at)
  values (jesus_id,'TEMP APPROVED INSERT TEST','private','approved',now());
 exception when others then premature_approval_denied := true;
 end;
 if not premature_approval_denied then raise exception 'Client inserted an already-approved memory'; end if;
 begin
  insert into public.yuki_memory_proposals(owner_id,memory_text,visibility,status,approved_at)
  values (jesus_id,'TEMP TIMESTAMP INSERT TEST','private','pending',now());
 exception when others then timestamp_insert_denied := true;
 end;
 if not timestamp_insert_denied then raise exception 'Client forged approval timestamp on pending insertion'; end if;
 insert into public.yuki_memory_proposals(owner_id,memory_text,visibility,status)
 values (jesus_id,'TEMP ISOLATION TEST','private','pending') returning id into memory_id;
 update public.yuki_memory_proposals set status='approved' where id=memory_id;
 select approved_at into approved_time from public.yuki_memory_proposals where id=memory_id;
 if approved_time is null then raise exception 'Approval timestamp missing'; end if;
 begin
  update public.yuki_memory_proposals set created_at='2000-01-01'::timestamptz where id=memory_id;
 exception when others then created_at_denied := true;
 end;
 if not created_at_denied then raise exception 'Client forged original creation timestamp'; end if;
 update public.yuki_memory_proposals set approved_at='2000-01-01'::timestamptz where id=memory_id;
 select approved_at into new_time from public.yuki_memory_proposals where id=memory_id;
 if new_time is distinct from approved_time then raise exception 'Client changed approval timestamp'; end if;
 begin
  update public.yuki_memory_proposals set owner_id=julie_id where id=memory_id;
 exception when others then transfer_denied := true;
 end;
 if not transfer_denied then raise exception 'Memory ownership transfer allowed'; end if;
 update public.yuki_memory_proposals set visibility='shared' where id=memory_id;
 select status into current_status from public.yuki_memory_proposals where id=memory_id;
 if current_status <> 'pending' then raise exception 'Privacy change did not revoke approval'; end if;
 select approved_at into new_time from public.yuki_memory_proposals where id=memory_id;
 if new_time is not null then raise exception 'Approval timestamp survived privacy change'; end if;
 update public.yuki_memory_proposals set status='approved' where id=memory_id;
 select status into current_status from public.yuki_memory_proposals where id=memory_id;
 if current_status <> 'approved' then raise exception 'Re-approval after privacy change failed'; end if;
 update public.yuki_memory_proposals set memory_text='TEMP ISOLATION EDIT' where id=memory_id;
 select status into current_status from public.yuki_memory_proposals where id=memory_id;
 if current_status <> 'pending' then raise exception 'Edit did not revoke approval'; end if;
 select approved_at into new_time from public.yuki_memory_proposals where id=memory_id;
 if new_time is not null then raise exception 'Approval timestamp survived an edit'; end if;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub',julie_id::text,true);
 execute 'set local role authenticated';
 begin
  insert into public.yuki_memory_proposals(owner_id,memory_text,visibility,status)
  values (jesus_id,'SPOOF ATTEMPT','private','pending');
 exception when others then spoof_denied := true;
 end;
 if not spoof_denied then raise exception 'Cross-account insert spoofing allowed'; end if;
 select count(*) into visible_count from public.yuki_memory_proposals where id=memory_id;
 if visible_count <> 0 then raise exception 'Cross-account read allowed'; end if;
 update public.yuki_memory_proposals set memory_text='UNAUTHORIZED' where id=memory_id;
 get diagnostics changed_count = row_count;
 if changed_count <> 0 then raise exception 'Cross-account update allowed'; end if;
 delete from public.yuki_memory_proposals where id=memory_id;
 get diagnostics changed_count = row_count;
 if changed_count <> 0 then raise exception 'Cross-account delete allowed'; end if;
 raise notice 'PASS: cross-account isolation, insert spoofing, pending-only insertion, ownership lock, timestamp protection, privacy-change revocation and edit revocation';
end $$;
rollback;
