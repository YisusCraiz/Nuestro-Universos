-- Lobby without preloading audio, editable host settings, presence and optional JJ wagers.
alter table public.jj_piano_rooms alter column host_run drop not null;
alter table public.jj_piano_rooms alter column settings set default '{}'::jsonb;
alter table public.jj_piano_rooms add column if not exists lobby_v50 boolean not null default false;
alter table public.jj_piano_rooms add column if not exists id uuid not null default gen_random_uuid();
alter table public.jj_piano_rooms add column if not exists revision int not null default 0;
alter table public.jj_piano_rooms add column if not exists host_ready boolean not null default false;
alter table public.jj_piano_rooms add column if not exists host_seen timestamptz;
alter table public.jj_piano_rooms add column if not exists guest_seen timestamptz;
alter table public.jj_piano_rooms add column if not exists wager uuid references public.bb_wagers(id);
create schema if not exists jj_piano_private;
revoke all on schema jj_piano_private from public,anon;
grant usage on schema jj_piano_private to authenticated;

create or replace function jj_piano_private.pay(w public.bb_wagers,who uuid) returns void language plpgsql set search_path='' as $$
begin
 if w.state<>'running' then return;end if;
 if who is null then update public.bb_wagers set state='refunded' where id=w.id;return;end if;
 if who not in(w.host,w.guest) then raise exception 'BAD_WINNER';end if;
 update public.bb_wagers set state='paid',winner=who where id=w.id;
 insert into public.bb_coin_transfers(wager_id,user_id,delta) values(w.id,w.host,case when who=w.host then w.amount else -w.amount end),(w.id,w.guest,case when who=w.guest then w.amount else -w.amount end) on conflict do nothing;
end $$;
revoke all on function jj_piano_private.pay(public.bb_wagers,uuid) from public,anon,authenticated;

create or replace function jj_piano_private.lobby(p_action text,p_code text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid();r public.jj_piano_rooms;h public.jj_piano_runs;g public.jj_piano_runs;w public.bb_wagers;rid uuid;payload jsonb;amount int;winner uuid;late boolean;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 if not public.is_jesus() and not coalesce((select visible from public.section_visibility where section='piano'),false) then raise exception 'SECTION_HIDDEN';end if;
 if p_action='create' then
  perform pg_advisory_xact_lock(hashtextextended(me::text,36));
  select * into r from public.jj_piano_rooms where host=me and not closed and expires>now() order by expires desc limit 1 for update;
  if r.code is null then insert into public.jj_piano_rooms(host,settings,host_seen,lobby_v50) values(me,'{}',clock_timestamp(),true) returning * into r;end if;
 elsif p_action='recover' then
  select * into r from public.jj_piano_rooms where not closed and expires>now() and me in(host,guest) order by expires desc limit 1 for update;
  if r.code is null then raise exception 'ROOM_NOT_FOUND';end if;
 else
  select * into r from public.jj_piano_rooms where code=upper(trim(p_code)) and expires>now() for update;
  if r.code is null then raise exception 'ROOM_NOT_FOUND';end if;
  if p_action='join' and me<>r.host then
   if r.closed or r.starts_at is not null then raise exception 'ROOM_STARTED';end if;
   if r.guest is not null and r.guest<>me then raise exception 'ROOM_FULL';end if;
   update public.jj_piano_rooms set guest=me where code=r.code returning * into r;
  end if;
  if me<>r.host and me is distinct from r.guest then raise exception 'NOT_IN_ROOM';end if;
 end if;
 update public.jj_piano_rooms set lobby_v50=true where code=r.code;
 -- All participating wallets use the same order for reservation/settlement.
 perform pg_advisory_xact_lock(hashtextextended(u::text,25)) from (select distinct u from unnest(array[r.host,r.guest]) u where u is not null order by u) q;
 select * into w from public.bb_wagers where id=r.wager for update;
 select * into h from public.jj_piano_runs where id=r.host_run;
 select * into g from public.jj_piano_runs where id=r.guest_run;
 late:=r.starts_at is not null and clock_timestamp()>r.starts_at+((r.settings->>'duration')::int+60)*interval '1 second';
 if w.state='running' then
  if w.expires<=now() then update public.bb_wagers set state='refunded' where id=w.id;
  elsif h.state='finished' and g.state='finished' then
   winner:=case when (h.result->>'score')::int>(g.result->>'score')::int then r.host when (h.result->>'score')::int<(g.result->>'score')::int then r.guest else null end;
   perform jj_piano_private.pay(w,winner);
  elsif late then
   winner:=case when h.state='finished' then r.host when g.state='finished' then r.guest else null end;
   perform jj_piano_private.pay(w,winner);
  end if;
  select * into w from public.bb_wagers where id=r.wager;
 elsif w.state='offered' and w.expires<=now() then update public.bb_wagers set state='refunded' where id=w.id returning * into w;
 end if;
 if p_action='configure' then
  if me<>r.host then raise exception 'HOST_ONLY';end if;
  if r.closed or r.starts_at is not null then raise exception 'SETTINGS_LOCKED';end if;
  if r.settings=p_data and h.state='playing' and r.host_run is not null then
   update public.jj_piano_rooms set host_ready=true where code=r.code returning * into r;
  else
   if w.state='offered' then update public.bb_wagers set state='refunded' where id=w.id;end if;
   rid:=gen_random_uuid();payload:=public.jj_piano('start',rid,p_data);
   update public.jj_piano_runs set state='cancelled' where id=r.guest_run and state='playing';
   update public.jj_piano_rooms set settings=p_data,host_run=rid,guest_run=null,host_ready=true,revision=revision+1,wager=null where code=r.code returning * into r;
  end if;
 elsif p_action='bet' then
  if me<>r.host then raise exception 'HOST_ONLY';end if;
  if r.closed or r.starts_at is not null or r.guest is null or r.host_run is null then raise exception 'BET_NOT_READY';end if;
  amount:=(p_data->>'amount')::int;if amount is null or amount not between 0 and 1000 then raise exception 'BAD_AMOUNT';end if;
  if (amount=0 and r.wager is null) or (w.state='offered' and w.amount=amount) then null;
  else
   if w.state='offered' then update public.bb_wagers set state='refunded' where id=w.id;end if;
   if amount>0 then
    if (public.bb_shop()->>'coins')::bigint<amount then raise exception 'INSUFFICIENT_COINS';end if;
    insert into public.bb_wagers(room_id,host,guest,amount,rules,expires) values(r.id,r.host,r.guest,amount,jsonb_build_object('game','piano','revision',r.revision),r.expires) returning * into w;
    update public.jj_piano_rooms set wager=w.id where code=r.code returning * into r;
   else update public.jj_piano_rooms set wager=null where code=r.code returning * into r;
   end if;
   update public.jj_piano_runs set state='cancelled' where id=r.guest_run and state='playing';
   update public.jj_piano_rooms set guest_run=null where code=r.code returning * into r;
  end if;
 elsif p_action='ready' then
  if r.closed or r.starts_at is not null or r.host_run is null then raise exception 'NOT_READY';end if;
  if (p_data->>'revision')::int is distinct from r.revision then raise exception 'SETTINGS_CHANGED';end if;
  if w.state='refunded' and r.wager is not null then raise exception 'BET_EXPIRED';end if;
  if me=r.host then update public.jj_piano_rooms set host_ready=true where code=r.code returning * into r;
  else
   if r.wager::text is distinct from p_data->>'bet_id' then raise exception 'BET_CHANGED';end if;
   if w.state='offered' and not w.guest_ok then
    if not coalesce((p_data->>'accept_bet')::boolean,false) then raise exception 'ACCEPT_BET_REQUIRED';end if;
    if (public.bb_shop()->>'coins')::bigint<w.amount then raise exception 'INSUFFICIENT_COINS';end if;
    update public.bb_wagers set guest_ok=true where id=w.id;
   end if;
   if r.guest_run is null then
    rid:=gen_random_uuid();payload:=public.jj_piano('start',rid,r.settings);
    update public.jj_piano_rooms set guest_run=rid where code=r.code returning * into r;
   end if;
  end if;
 elsif p_action='start' then
  if me<>r.host then raise exception 'HOST_ONLY';end if;
  if r.closed or not r.host_ready or r.guest_run is null or r.host_seen is null or r.guest_seen is null or r.guest_seen<clock_timestamp()-interval '15 seconds' then raise exception 'NOT_READY';end if;
  if r.starts_at is null then
   if w.state is not null and (w.state<>'offered' or not w.host_ok or not w.guest_ok) then raise exception 'BET_NOT_READY';end if;
   if exists(select 1 from public.jj_piano_runs where id in(r.host_run,r.guest_run) and state<>'playing') then raise exception 'RUN_EXPIRED';end if;
   update public.jj_piano_rooms set starts_at=clock_timestamp()+interval '8 seconds' where code=r.code returning * into r;
   update public.jj_piano_runs set started=r.starts_at where id in(r.host_run,r.guest_run);
   if w.state='offered' then update public.bb_wagers set state='running',expires=r.starts_at+((r.settings->>'duration')::int+300)*interval '1 second' where id=w.id;end if;
  end if;
 elsif p_action='rematch' then
  if me<>r.host then raise exception 'HOST_ONLY';end if;
  if r.closed or r.starts_at is null or not ((h.state='finished' and g.state='finished') or late) then raise exception 'MATCH_ACTIVE';end if;
  if w.state='running' then raise exception 'MATCH_ACTIVE';end if;
  update public.jj_piano_runs set state='cancelled' where id in(r.host_run,r.guest_run) and state='playing';
  update public.jj_piano_rooms set starts_at=null,host_run=null,guest_run=null,host_ready=false,wager=null,settings='{}',revision=revision+1 where code=r.code returning * into r;
 elsif p_action='leave' then
  if w.state='running' then perform jj_piano_private.pay(w,case when me=r.host then r.guest else r.host end);
  elsif w.state='offered' then update public.bb_wagers set state='refunded' where id=w.id;end if;
  update public.jj_piano_rooms set closed=true where code=r.code returning * into r;
  update public.jj_piano_runs set state='cancelled' where id in(r.host_run,r.guest_run) and state='playing';
 elsif p_action not in('read','create','recover','join') then raise exception 'BAD_ACTION';end if;
 update public.jj_piano_rooms set host_seen=case when me=host then clock_timestamp() else host_seen end,guest_seen=case when me=guest then clock_timestamp() else guest_seen end where code=r.code returning * into r;
 select * into h from public.jj_piano_runs where id=r.host_run;
 select * into g from public.jj_piano_runs where id=r.guest_run;
 select * into w from public.bb_wagers where id=r.wager;
 return jsonb_build_object('code',r.code,'host',r.host,'guest',r.guest,'settings',r.settings,'revision',r.revision,'host_ready',r.host_ready,
 'can_rematch',r.starts_at is not null and ((h.state='finished' and g.state='finished') or late) and coalesce(w.state,'')<>'running','starts_at',r.starts_at,'server_now',clock_timestamp(),'closed',r.closed,'ready',r.host_ready and r.guest_run is not null,
 'run',case when me=r.host then r.host_run else r.guest_run end,'notes',h.notes,'results',jsonb_build_array(h.result,g.result),'states',jsonb_build_array(h.state,g.state),
 'coins',(public.bb_shop()->>'coins')::bigint,
 'bet',case when w.id is null then null else jsonb_build_object('id',w.id,'amount',w.amount,'state',w.state,'guest_ok',w.guest_ok,'winner',w.winner) end,
 'players',(select jsonb_agg(jsonb_build_object('id',p.id,'name',p.display_name,'handle',p.handle,'skin',coalesce(e.skin,'casual'),'online',case when p.id=r.host then r.host_seen else r.guest_seen end>clock_timestamp()-interval '15 seconds','prepared',case when p.id=r.host then r.host_ready else r.guest_run is not null end) order by (p.id=r.host) desc) from public.profiles p left join public.bb_equipped e on e.user_id=p.id where p.id in(r.host,r.guest)));
end $$;
revoke all on function jj_piano_private.lobby(text,text,jsonb) from public,anon;
grant execute on function jj_piano_private.lobby(text,text,jsonb) to authenticated;
create or replace function public.jj_piano_lobby(p_action text default 'read',p_code text default '',p_data jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select jj_piano_private.lobby(p_action,p_code,p_data)$$;
revoke all on function public.jj_piano_lobby(text,text,jsonb) from public,anon;
grant execute on function public.jj_piano_lobby(text,text,jsonb) to authenticated;

create or replace function public.jj_piano_room(p_action text default 'read',p_code text default '',p_data jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.jj_piano_rooms; run jsonb; rid uuid; h public.jj_piano_runs; g public.jj_piano_runs;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 -- Route all legacy actions on new wagered lobbies through the same validation.
 if p_action<>'create' and exists(select 1 from public.jj_piano_rooms where code=upper(trim(p_code)) and lobby_v50) then return jj_piano_private.lobby(p_action,p_code,p_data);end if;
 if p_action='recover' then
  select * into r from public.jj_piano_rooms where host=auth.uid() and not closed and expires>now() order by expires desc limit 1 for update;
  if r.code is null then raise exception 'ROOM_NOT_FOUND';end if;
 elsif p_action='create' then
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,36));
  if exists(select 1 from public.jj_piano_rooms where host=auth.uid() and not closed and expires>now()) then raise exception 'ROOM_ACTIVE';end if;
  rid:=gen_random_uuid();run:=public.jj_piano('start',rid,p_data);
  insert into public.jj_piano_rooms(host,host_run,settings) values(auth.uid(),rid,p_data) returning * into r;
 else
  select * into r from public.jj_piano_rooms where code=upper(trim(p_code)) and expires>now() for update;
  if r.code is null then raise exception 'ROOM_NOT_FOUND';end if;
  if p_action='join' and auth.uid()<>r.host then
   if r.closed or r.starts_at is not null then raise exception 'ROOM_STARTED';end if;
   if r.guest is not null and r.guest<>auth.uid() then raise exception 'ROOM_FULL';end if;
   update public.jj_piano_rooms set guest=auth.uid() where code=r.code returning * into r;
  end if;
  if auth.uid()<>r.host and auth.uid() is distinct from r.guest then raise exception 'NOT_IN_ROOM';end if;
  if p_action='ready' then
   if r.closed or r.starts_at is not null then raise exception 'ROOM_STARTED';end if;
   if auth.uid()=r.guest and r.guest_run is null then
    rid:=gen_random_uuid();run:=public.jj_piano('start',rid,r.settings);
    update public.jj_piano_rooms set guest_run=rid where code=r.code returning * into r;
   end if;
  elsif p_action='start' then
   if auth.uid()<>r.host then raise exception 'HOST_ONLY';end if;
   if r.closed or r.guest_run is null then raise exception 'NOT_READY';end if;
   if r.starts_at is null then
    if exists(select 1 from public.jj_piano_runs where id in(r.host_run,r.guest_run) and state<>'playing') then raise exception 'RUN_EXPIRED';end if;
    update public.jj_piano_rooms set starts_at=clock_timestamp()+interval '8 seconds' where code=r.code returning * into r;
    update public.jj_piano_runs set started=r.starts_at where id in(r.host_run,r.guest_run);
   end if;
  elsif p_action='leave' then
   update public.jj_piano_rooms set closed=true where code=r.code returning * into r;
   update public.jj_piano_runs set state='cancelled' where id in(r.host_run,r.guest_run) and state='playing';
  elsif p_action not in('read','join') then raise exception 'BAD_ACTION';end if;
 end if;
 select * into h from public.jj_piano_runs where id=r.host_run;
 select * into g from public.jj_piano_runs where id=r.guest_run;
 return jsonb_build_object('code',r.code,'host',r.host,'guest',r.guest,'settings',r.settings,
 'starts_at',r.starts_at,'server_now',clock_timestamp(),'closed',r.closed,'ready',r.guest_run is not null,
 'run',case when auth.uid()=r.host then r.host_run else r.guest_run end,'notes',h.notes,
 'results',jsonb_build_array(h.result,g.result),'states',jsonb_build_array(h.state,g.state));
end $$;
revoke all on function public.jj_piano_room(text,text,jsonb) from public,anon;
grant execute on function public.jj_piano_room(text,text,jsonb) to authenticated;
