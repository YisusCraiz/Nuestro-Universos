-- All data is synthetic and rolled back. Test the real auth/RLS sharing contract.
begin;
do $$
declare a uuid;b uuid;m uuid;seen int;changed int;receiver text;
begin
 select id into strict a from public.profiles where handle='jesus';
 select id into strict b from public.profiles where handle='julisa';
 perform set_config('request.jwt.claim.sub',a::text,true);
 execute 'set local role authenticated';
 select public.yuki_partner_for_sharing()::text into receiver;
 if receiver<>b::text then raise exception 'Wrong authorized partner';end if;
 insert into public.yuki_memory_proposals(owner_id,memory_text,visibility,status)
 values(a,'SYNTHETIC PARTNER MEMORY TEST','private','pending') returning id into m;
 begin
  insert into public.yuki_memory_grants(memory_id,owner_id,recipient_id,allow_ai)
  values(m,a,b,false);
  raise exception 'Pending memory was shared';
 exception when others then
  if sqlerrm='Pending memory was shared' then raise;end if;
 end;
 update public.yuki_memory_proposals set status='approved' where id=m;
 insert into public.yuki_memory_grants(memory_id,owner_id,recipient_id,allow_ai)
 values(m,a,b,false);
 execute 'reset role';
 perform set_config('request.jwt.claim.sub',b::text,true);
 execute 'set local role authenticated';
 select count(*) into seen from public.yuki_shared_memories_for_me(false) where memory_id=m;
 if seen<>1 then raise exception 'Julie cannot read explicitly granted private memory';end if;
 select count(*) into seen from public.yuki_shared_memories_for_me(true) where memory_id=m;
 if seen<>0 then raise exception 'Gemini received unapproved partner sharing';end if;
 select count(*) into seen from public.yuki_memory_proposals where id=m;
 if seen<>0 then raise exception 'Direct proposal SELECT leaked';end if;
 update public.yuki_memory_grants set allow_ai=true where memory_id=m;
 get diagnostics changed=row_count;
 if changed<>0 then raise exception 'Julie changed owner grant';end if;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub',a::text,true);
 execute 'set local role authenticated';
 update public.yuki_memory_grants set allow_ai=true where memory_id=m;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub',b::text,true);
 execute 'set local role authenticated';
 select count(*) into seen from public.yuki_shared_memories_for_me(true) where memory_id=m;
 if seen<>1 then raise exception 'Explicit Gemini grant not effective';end if;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub',a::text,true);
 execute 'set local role authenticated';
 update public.yuki_memory_proposals set memory_text='SYNTHETIC REVISED TEST' where id=m;
 select count(*) into seen from public.yuki_memory_grants where memory_id=m;
 if seen<>0 then raise exception 'Editing retained shared grant';end if;
 update public.yuki_memory_proposals set status='approved' where id=m;
 select count(*) into seen from public.yuki_memory_grants where memory_id=m;
 if seen<>0 then raise exception 'Reapproval resurrected revoked grant';end if;
 raise notice 'PASS: explicit sharing, private recipient access, AI opt-in, no direct SELECT, no recipient edits, edit revoke';
end $$;
rollback;