-- Rollback-only security rehearsal for independent Gemini consent.
begin;
do $$
declare jesus_uuid uuid;julie_uuid uuid; visible integer;written integer;
begin
 select id into strict jesus_uuid from public.profiles where handle='jesus';
 select id into strict julie_uuid from public.profiles where handle='julisa';
 perform set_config('request.jwt.claim.sub',jesus_uuid::text,true);
 execute 'set local role authenticated';
 insert into public.yuki_memory_ai_consent(owner_id,enabled) values(jesus_uuid,true)
 on conflict(owner_id) do update set enabled=excluded.enabled;
 select count(*) into visible from public.yuki_memory_ai_consent where owner_id=jesus_uuid and enabled=true;
 if visible<>1 then raise exception 'Owner could not enable own consent';end if;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub',julie_uuid::text,true);
 execute 'set local role authenticated';
 select count(*) into visible from public.yuki_memory_ai_consent where owner_id=jesus_uuid;
 if visible<>0 then raise exception 'Julie can read Jesus consent';end if;
 update public.yuki_memory_ai_consent set enabled=false where owner_id=jesus_uuid;
 get diagnostics written=row_count;
 if written<>0 then raise exception 'Julie could revoke Jesus consent';end if;
 insert into public.yuki_memory_ai_consent(owner_id,enabled) values(julie_uuid,true)
 on conflict(owner_id) do update set enabled=excluded.enabled;
 select count(*) into visible from public.yuki_memory_ai_consent where owner_id=julie_uuid and enabled=true;
 if visible<>1 then raise exception 'Julie could not enable her own consent';end if;
 update public.yuki_memory_ai_consent set enabled=false where owner_id=julie_uuid;
 select count(*) into visible from public.yuki_memory_ai_consent where owner_id=julie_uuid and enabled=false;
 if visible<>1 then raise exception 'Julie cannot revoke her own consent';end if;
 raise notice 'PASS: independent consent, partner isolation, and revocation';
end $$;
rollback;
