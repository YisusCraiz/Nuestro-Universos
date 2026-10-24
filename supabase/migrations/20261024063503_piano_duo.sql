-- Two-player rooms reuse server-validated piano runs and rewards. No client scores accepted.
create table if not exists public.jj_piano_rooms (
 code text primary key default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
 host uuid not null references auth.users(id), guest uuid references auth.users(id),
 host_run uuid not null references public.jj_piano_runs(id), guest_run uuid references public.jj_piano_runs(id),
 settings jsonb not null, starts_at timestamptz, closed boolean not null default false,
 expires timestamptz not null default now()+interval '1 hour', check(host is distinct from guest)
);
alter table public.jj_piano_rooms enable row level security;
revoke all on public.jj_piano_rooms from public,anon,authenticated;
create or replace function public.jj_piano_room(p_action text default 'read',p_code text default '',p_data jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.jj_piano_rooms; run jsonb; rid uuid; h public.jj_piano_runs; g public.jj_piano_runs;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 if p_action='create' then
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
