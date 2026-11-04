-- Entire flow rolls back. No real event or season is changed.
begin;
do $$
declare j uuid;u uuid;s jsonb;slot int;rev int;stamp timestamptz;
begin
 select id into j from public.profiles where handle='jesus';
 select id into u from public.profiles where handle='julisa';
 perform set_config('request.jwt.claim.sub',u::text,true);
 s:=public.jj_winter();
 if (s->>'revealed')::boolean then raise exception 'Event should start hidden';end if;
 begin
  perform public.jj_winter('reveal');
  raise exception 'Julie must not reveal the event';
 exception when others then if sqlerrm not like '%OWNER_ONLY%' then raise;end if;end;
 perform set_config('request.jwt.claim.sub',j::text,true);
 perform public.jj_winter('reveal');
 perform public.jj_winter('join');
 begin
  perform public.jj_winter('start');
  raise exception 'Must wait for second player';
 exception when others then if sqlerrm not like '%WAIT_PARTNER%' then raise;end if;end;
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform public.jj_winter('join');
 perform public.jj_winter('start');
 begin
  perform public.jj_winter('hunt',0,'moon');
  raise exception 'Wrong actor was accepted';
 exception when others then if sqlerrm not like '%PARTNER_TURN%' then raise;end if;end;
 perform set_config('request.jwt.claim.sub',j::text,true);
 perform public.jj_winter('hunt',0,'moon');
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform public.jj_winter('hunt',1,'snow');
 perform set_config('request.jwt.claim.sub',j::text,true);
 s:=public.jj_winter('hunt',2,'bell');
 begin
  perform public.jj_winter('bridge_ready',null,null,(s->>'revision')::int);
  raise exception 'Incorrect bridge was accepted';
 exception when others then if sqlerrm not like '%TRY_BRIDGE%' then raise;end if;end;
 foreach slot in array array[1,3,2] loop
  s:=public.jj_winter();s:=public.jj_winter('swap',slot,null,(s->>'revision')::int);
 end loop;
 s:=public.jj_winter('bridge_ready',null,null,(s->>'revision')::int);
 if (s->>'stage')::int<>2 then raise exception 'Bridge should wait';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 s:=public.jj_winter('bridge_ready',null,null,(s->>'revision')::int);
 if (s->>'stage')::int<>3 then raise exception 'Bridge not complete';end if;
 for slot in 0..4 loop
  perform set_config('request.jwt.claim.sub',(case when slot%2=0 then j else u end)::text,true);
  s:=public.jj_winter('light',slot,(array['bell','star','moon','snow','star'])[slot+1]);
 end loop;
 perform public.jj_winter('charge');
 perform set_config('request.jwt.claim.sub',u::text,true);
 s:=public.jj_winter('charge');
 if (s->>'stage')::int<>4 then raise exception 'Comic not unlocked';end if;
 perform set_config('request.jwt.claim.sub',j::text,true);
 perform public.jj_winter('page',5);
 perform public.jj_winter('finish');
 if exists(select 1 from public.jj_winter_players where user_id=j and read_at is not null) then raise exception 'Skipped pages accepted';end if;
 for slot in 1..5 loop perform public.jj_winter('page',slot);end loop;
 s:=public.jj_winter('finish');
 if (s->>'stage')::int<>4 then raise exception 'Must wait for partner reading';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 for slot in 1..5 loop perform public.jj_winter('page',slot);end loop;
 s:=public.jj_winter('finish');
 if (s->>'stage')::int<>5 or (select season from public.app_settings where id=1)<>'christmas' then raise exception 'Christmas did not activate';end if;
 stamp:=(s->>'completed_at')::timestamptz;
 s:=public.jj_winter('finish');
 if stamp is distinct from (s->>'completed_at')::timestamptz then raise exception 'Completion was not idempotent';end if;
end $$;
select 'Two-player event, permissions, resume, comic and activation verified' as result;
rollback;
