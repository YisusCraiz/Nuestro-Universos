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
begin
 select id into strict jesus_id from public.profiles where handle='jesus';
 select id into strict julie_id from public.profiles where handle='julisa';
 perform set_config('request.jwt.claim.sub',jesus_id::text,true);
 execute 'set local role authenticated';
 insert into public.yuki_memory_proposals(owner_id,memory_text,visibility,status)
 values (jesus_id,'TEMP ISOLATION TEST','private','pending') returning id into memory_id;
 update public.yuki_memory_proposals set status='approved' where id=memory_id;
 update public.yuki_memory_proposals set memory_text='TEMP ISOLATION EDIT' where id=memory_id;
 select status into current_status from public.yuki_memory_proposals where id=memory_id;
 if current_status <> 'pending' then raise exception 'Edit did not revoke approval'; end if;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub',julie_id::text,true);
 execute 'set local role authenticated';
 select count(*) into visible_count from public.yuki_memory_proposals where id=memory_id;
 if visible_count <> 0 then raise exception 'Cross-account read allowed'; end if;
 update public.yuki_memory_proposals set memory_text='UNAUTHORIZED' where id=memory_id;
 get diagnostics changed_count = row_count;
 if changed_count <> 0 then raise exception 'Cross-account update allowed'; end if;
 delete from public.yuki_memory_proposals where id=memory_id;
 get diagnostics changed_count = row_count;
 if changed_count <> 0 then raise exception 'Cross-account delete allowed'; end if;
 raise notice 'PASS: isolation, mutation denial and reapproval';
end $$;
rollback;
