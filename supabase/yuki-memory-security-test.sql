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
begin
 select id into strict jesus_id from public.profiles where handle='jesus';
 select id into strict julie_id from public.profiles where handle='julisa';
 perform set_config('request.jwt.claim.sub',jesus_id::text,true);
 execute 'set local role authenticated';
 insert into public.yuki_memory_proposals(owner_id,memory_text,visibility,status)
 values (jesus_id,'TEMP ISOLATION TEST','private','pending') returning id into memory_id;
 update public.yuki_memory_proposals set status='approved' where id=memory_id;
 select approved_at into approved_time from public.yuki_memory_proposals where id=memory_id;
 if approved_time is null then raise exception 'Approval timestamp missing'; end if;
 update public.yuki_memory_proposals set approved_at='2000-01-01'::timestamptz where id=memory_id;
 select approved_at into new_time from public.yuki_memory_proposals where id=memory_id;
 if new_time is distinct from approved_time then raise exception 'Client changed approval timestamp'; end if;
 begin
  update public.yuki_memory_proposals set owner_id=julie_id where id=memory_id;
 exception when others then transfer_denied := true;
 end;
 if not transfer_denied then raise exception 'Memory ownership transfer allowed'; end if;
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
 raise notice 'PASS: cross-account isolation, insert spoofing, ownership lock, timestamp protection and edit revocation';
end $$;
rollback;
