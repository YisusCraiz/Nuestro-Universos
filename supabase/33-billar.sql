-- Apply after 32. Server-authoritative two-player 8-ball (house rules).
begin;
create table if not exists public.jj_pool_rooms(
 id uuid primary key default gen_random_uuid(),code text unique not null,host uuid not null references auth.users(id),guest uuid references auth.users(id),
 rules jsonb not null default '{"wins":3,"stake":0,"call8":false}',ready boolean not null default false,game jsonb,revision int not null default 1,
 expires timestamptz not null default now()+interval '4 hours',check(host is distinct from guest)
);
alter table public.jj_pool_rooms enable row level security;
revoke all on public.jj_pool_rooms from public,anon,authenticated;
create or replace function public.jj_pool_rack(wins jsonb,round_no int) returns jsonb language plpgsql immutable set search_path='' as $$
declare balls jsonb:=jsonb_build_array(jsonb_build_array(250,250,true));rack int[]:=array[1,9,2,10,8,3,11,4,12,5,13,6,14,7,15];positions jsonb:=jsonb_build_object('0',jsonb_build_array(250,250,true));row_no int;j int;n int:=1;begin
 for row_no in 0..4 loop for j in 0..row_no loop positions:=positions||jsonb_build_object(rack[n]::text,jsonb_build_array(650+row_no*20,250+(j-row_no/2.0)*23,true));n:=n+1;end loop;end loop;
 for j in 1..15 loop balls:=balls||jsonb_build_array(positions->j::text);end loop;
 return jsonb_build_object('balls',balls,'turn',(round_no-1)%2,'groups','[0,0]'::jsonb,'wins',wins,'round',round_no,'round_done',false,'finished',false,'inhand',false,'shots',0,'notice','break','frames','[]'::jsonb);
end $$;
create or replace function public.jj_pool_shot(s jsonb,angle double precision,power double precision,called int,call8 boolean) returns jsonb language plpgsql volatile set search_path='' as $$
declare x double precision[];y double precision[];vx double precision[]:=array_fill(0.0::float8,array[16]);vy double precision[]:=array_fill(0.0::float8,array[16]);active boolean[];
 i int;j int;t int;px float8;py float8;dx float8;dy float8;dist float8;dot float8;shift float8;speed float8;balls jsonb;frames jsonb:='[]';pots int[]:='{}';pocket int:=-1;first_hit int:=-1;rail boolean:=false;scratch boolean:=false;me int:=(s->>'turn')::int;other int:=1-me;grp int:=(s->'groups'->>me)::int;left_count int;target8 boolean;foul boolean;own_pot boolean:=false;winner int:=null;groups jsonb:=s->'groups';
begin
 if angle is null or angle not between -6.284 and 6.284 or power is null or power not between 0.05 and 1 or called is null or called not between -1 and 5 then raise exception 'BAD_SHOT';end if;
 for i in 0..15 loop x:=array_append(x,(s->'balls'->i->>0)::float8);y:=array_append(y,(s->'balls'->i->>1)::float8);active:=array_append(active,(s->'balls'->i->>2)::boolean);end loop;
 select count(*) into left_count from generate_series(1,15) b where b<>8 and (case when grp=1 then b<8 else b>8 end) and active[b+1];target8:=grp<>0 and left_count=0;
 frames:=jsonb_build_array(s->'balls');vx[1]:=cos(angle)*power*1800;vy[1]:=sin(angle)*power*1800;
 for t in 1..1800 loop
  speed:=0;
  for i in 1..16 loop if active[i] then
   x[i]:=x[i]+vx[i]*0.004;y[i]:=y[i]+vy[i]*0.004;
   -- Six pockets, clockwise from top-left: 0,1,2,3,4,5.
   for j in 0..5 loop px:=case when j in(0,5) then 0 when j in(1,4) then 500 else 1000 end;py:=case when j<3 then 0 else 500 end;
    if (x[i]-px)^2+(y[i]-py)^2<27^2 then active[i]:=false;vx[i]:=0;vy[i]:=0;if i=1 then scratch:=true;else pots:=array_append(pots,i-1);end if;if i=9 then pocket:=j;end if;exit;end if;
   end loop;
   if active[i] then
    if x[i]<11 then x[i]:=11;vx[i]:=abs(vx[i])*.9;if first_hit>=0 then rail:=true;end if;end if;
    if x[i]>989 then x[i]:=989;vx[i]:=-abs(vx[i])*.9;if first_hit>=0 then rail:=true;end if;end if;
    if y[i]<11 then y[i]:=11;vy[i]:=abs(vy[i])*.9;if first_hit>=0 then rail:=true;end if;end if;
    if y[i]>489 then y[i]:=489;vy[i]:=-abs(vy[i])*.9;if first_hit>=0 then rail:=true;end if;end if;
   end if;
  end if;end loop;
  for i in 1..15 loop if active[i] then for j in i+1..16 loop if active[j] then
   dx:=x[j]-x[i];dy:=y[j]-y[i];dist:=sqrt(dx*dx+dy*dy);
   if dist<22 and dist>0.00001 then
    dx:=dx/dist;dy:=dy/dist;dot:=(vx[i]-vx[j])*dx+(vy[i]-vy[j])*dy;
    if dot>0 then vx[i]:=vx[i]-dot*dx;vy[i]:=vy[i]-dot*dy;vx[j]:=vx[j]+dot*dx;vy[j]:=vy[j]+dot*dy;if i=1 and first_hit<0 then first_hit:=j-1;end if;end if;
    shift:=(22-dist)/2+0.001;x[i]:=x[i]-dx*shift;y[i]:=y[i]-dy*shift;x[j]:=x[j]+dx*shift;y[j]:=y[j]+dy*shift;
   end if;
  end if;end loop;end if;end loop;
  for i in 1..16 loop vx[i]:=vx[i]*.994;vy[i]:=vy[i]*.994;if abs(vx[i])+abs(vy[i])<3 then vx[i]:=0;vy[i]:=0;end if;speed:=speed+abs(vx[i])+abs(vy[i]);end loop;
  if t%16=0 or speed=0 then balls:='[]';for i in 1..16 loop balls:=balls||jsonb_build_array(jsonb_build_array(round(x[i]::numeric,2),round(y[i]::numeric,2),active[i]));end loop;frames:=frames||jsonb_build_array(balls);end if;
  exit when speed=0;
 end loop;
 foul:=scratch or first_hit<0 or (grp=0 and first_hit=8) or (grp<>0 and (case when target8 then first_hit<>8 else first_hit=8 or (grp=1 and first_hit>8) or (grp=2 and first_hit<8) end)) or (not rail and cardinality(pots)=0);
 if 8=any(pots) then
  if (s->>'shots')::int=0 then
   -- A black on the break is spotted, never an immediate win/loss.
   x[9]:=650;y[9]:=250;active[9]:=true;
   while exists(select 1 from generate_series(1,16) b where b<>9 and active[b] and (x[b]-x[9])^2+(y[b]-y[9])^2<22^2) loop x[9]:=x[9]+23;if x[9]>966 then x[9]:=500;exit;end if;end loop;
  else winner:=case when target8 and not foul and (not call8 or pocket=called) then me else other end;end if;
 end if;
 if grp=0 and not foul then foreach i in array pots loop if i<>8 then grp:=case when i<8 then 1 else 2 end;groups:=jsonb_set(groups,array[me::text],to_jsonb(grp));groups:=jsonb_set(groups,array[other::text],to_jsonb(3-grp));exit;end if;end loop;end if;
 foreach i in array pots loop if i<>8 and ((grp=1 and i<8) or (grp=2 and i>8)) then own_pot:=true;end if;end loop;
 if scratch then x[1]:=250;y[1]:=250;active[1]:=true;end if;
 balls:='[]';for i in 1..16 loop balls:=balls||jsonb_build_array(jsonb_build_array(round(x[i]::numeric,2),round(y[i]::numeric,2),active[i]));end loop;
 return s||jsonb_build_object('balls',balls,'frames',frames,'pots',to_jsonb(pots),'groups',groups,'turn',case when own_pot and not foul then me else other end,'inhand',foul,'shots',(s->>'shots')::int+1,'round_done',winner is not null,'winner',winner,'notice',case when winner is not null then 'round' when foul then 'foul' when own_pot then 'again' else 'turn' end);
end $$;
create or replace function public.jj_pool(p_action text default 'read',p_code text default '',p_revision int default null,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.jj_pool_rooms;s jsonb;w public.bb_wagers;me int;stake int;winner int;u uuid;wallet jsonb;nx float8;ny float8;begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 if p_action='create' then
  if not public.is_jesus() and not coalesce((select visible from public.section_visibility where section='pool'),false) then raise exception 'SECTION_HIDDEN';end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,33));select * into r from public.jj_pool_rooms where host=auth.uid() and expires>now() order by expires desc limit 1 for update;
  if r.id is null then insert into public.jj_pool_rooms(code,host) values(upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),auth.uid()) returning * into r;end if;
 else
  select * into r from public.jj_pool_rooms where code=upper(trim(p_code)) and expires>now() for update;if r.id is null then raise exception 'ROOM_NOT_FOUND';end if;
  if p_action='join' and auth.uid()<>r.host then
   if r.guest is not null and r.guest<>auth.uid() then raise exception 'ROOM_FULL';end if;
   if r.guest is null then update public.jj_pool_rooms set guest=auth.uid(),ready=false,revision=revision+1 where id=r.id returning * into r;end if;
  end if;
  if auth.uid() is distinct from r.host and auth.uid() is distinct from r.guest then raise exception 'NOT_IN_ROOM';end if;
 end if;
 me:=case when auth.uid()=r.host then 0 else 1 end;s:=r.game;stake:=(r.rules->>'stake')::int;
 select * into w from public.bb_wagers where room_id=r.id and rules->>'game'='pool' order by created_at desc limit 1 for update;
 if w.state in('offered','running') and w.expires<=now() then update public.bb_wagers set state='refunded' where id=w.id returning * into w;end if;
 if p_action='leave' then
  if w.state='running' then perform public.jj_cards_pay(w.id,case when me=0 then r.guest else r.host end);elsif w.state='offered' then update public.bb_wagers set state='refunded' where id=w.id;end if;
  if me=0 then delete from public.jj_pool_rooms where id=r.id;else update public.jj_pool_rooms set guest=null,ready=false,game=null,revision=revision+1 where id=r.id;end if;return '{}';
 elsif p_action not in('read','create','join') then
  if p_revision is distinct from r.revision then raise exception 'STALE';end if;
  -- Room -> wager -> both wallets: same lock order as card games and wager settlement.
  for u in select x from unnest(array[r.host,r.guest]) x where x is not null order by x loop perform pg_advisory_xact_lock(hashtextextended(u::text,25));end loop;
  if p_action='rules' then
   if me<>0 or s is not null then raise exception 'RULES_LOCKED';end if;
   if coalesce((p_data->>'wins')::int,0) not between 1 and 20 or coalesce((p_data->>'stake')::int,-1) not between 0 and 1000000 or jsonb_typeof(p_data->'call8') is distinct from 'boolean' then raise exception 'BAD_RULES';end if;
   if w.state='offered' then update public.bb_wagers set state='refunded' where id=w.id;end if;r.rules:=p_data;r.ready:=false;
  elsif p_action='bet' then
   if me<>0 or s is not null or r.guest is null or stake=0 or w.state in('offered','running') then raise exception 'BET_NOT_READY';end if;
   if (public.bb_shop()->>'coins')::bigint<stake then raise exception 'INSUFFICIENT_COINS';end if;
   insert into public.bb_wagers(room_id,host,guest,amount,rules,expires) values(r.id,r.host,r.guest,stake,jsonb_build_object('game','pool','settings',r.rules),r.expires) returning * into w;r.ready:=false;
  elsif p_action='ready' then
   if me<>1 or s is not null then raise exception 'BAD_ACTION';end if;
   if stake>0 then
    if w.id is null or w.state<>'offered' or w.rules->'settings'<>r.rules then raise exception 'BET_NOT_READY';end if;
    if not w.guest_ok and (public.bb_shop()->>'coins')::bigint<stake then raise exception 'INSUFFICIENT_COINS';end if;
    update public.bb_wagers set guest_ok=true where id=w.id;
   end if;r.ready:=true;
  elsif p_action='start' then
   if me<>0 or s is not null or r.guest is null or not r.ready then raise exception 'NOT_READY';end if;
   if stake>0 then if w.state is distinct from 'offered' or not w.guest_ok then raise exception 'BET_NOT_READY';end if;update public.bb_wagers set state='running' where id=w.id;end if;
   s:=public.jj_pool_rack('[0,0]',1);
  elsif p_action='next' then
   if me<>0 or not coalesce((s->>'round_done')::boolean,false) or (s->>'finished')::boolean then raise exception 'MATCH_ACTIVE';end if;s:=public.jj_pool_rack(s->'wins',(s->>'round')::int+1);
  elsif p_action='reset' then
   if me<>0 or not coalesce((s->>'finished')::boolean,false) then raise exception 'MATCH_ACTIVE';end if;s:=null;r.ready:=false;
  elsif p_action in('place','shot') then
   if s is null or (s->>'round_done')::boolean or (s->>'turn')::int<>me then raise exception 'NOT_YOUR_TURN';end if;
   if coalesce((s->>'ready_at')::timestamptz,'-infinity')>clock_timestamp() then raise exception 'BALLS_MOVING';end if;
   if p_action='place' then
    if not (s->>'inhand')::boolean then raise exception 'NO_BALL_IN_HAND';end if;
    nx:=(p_data->>'x')::float8;ny:=(p_data->>'y')::float8;
    if nx is null or ny is null or nx not between 28 and 972 or ny not between 28 and 472 or exists(select 1 from jsonb_array_elements(s->'balls') with ordinality b where ordinality>1 and (value->>2)::boolean and ((value->>0)::float8-nx)^2+((value->>1)::float8-ny)^2<23^2) then raise exception 'BAD_PLACEMENT';end if;
    s:=jsonb_set(s,'{balls,0}',jsonb_build_array(nx,ny,true))||'{"inhand":false,"frames":[]}'::jsonb;
   else
    if (s->>'inhand')::boolean then raise exception 'PLACE_WHITE';end if;
    s:=public.jj_pool_shot(s,(p_data->>'angle')::float8,(p_data->>'power')::float8,coalesce((p_data->>'pocket')::int,-1),(r.rules->>'call8')::boolean);
    s:=s||jsonb_build_object('ready_at',clock_timestamp()+jsonb_array_length(s->'frames')*interval '64 milliseconds');
    if (s->>'round_done')::boolean then winner:=(s->>'winner')::int;s:=jsonb_set(s,array['wins',winner::text],to_jsonb((s->'wins'->>winner)::int+1));s:=s||jsonb_build_object('finished',(s->'wins'->>winner)::int>=(r.rules->>'wins')::int);end if;
   end if;
  else raise exception 'BAD_ACTION';end if;
  if w.state='running' and coalesce((s->>'finished')::boolean,false) then perform public.jj_cards_pay(w.id,case when (s->>'winner')::int=0 then r.host else r.guest end);end if;
  if w.state in('offered','running') then update public.bb_wagers set expires=now()+interval '4 hours' where id=w.id;end if;
  update public.jj_pool_rooms set game=s,rules=r.rules,ready=r.ready,revision=revision+1,expires=now()+interval '4 hours' where id=r.id returning * into r;
 end if;
 select * into w from public.bb_wagers where room_id=r.id and rules->>'game'='pool' order by created_at desc limit 1;wallet:=public.bb_shop();
 return jsonb_build_object('code',r.code,'host',r.host,'guest',r.guest,'me',me,'rules',r.rules,'ready',r.ready,'revision',r.revision,'game',r.game,'coins',wallet->'coins','bet',case when w.id is null then null else jsonb_build_object('amount',w.amount,'state',w.state,'guest_ok',w.guest_ok,'winner',w.winner) end,'players',(select jsonb_agg(jsonb_build_object('id',p.id,'name',p.display_name,'handle',p.handle,'skin',coalesce(e.skin,'casual')) order by (p.id=r.host) desc) from public.profiles p left join public.bb_equipped e on e.user_id=p.id where p.id in(r.host,r.guest)));
end $$;
-- Keep settlement private and protect billar wagers from the public Bombitas RPC.
create or replace function public.jj_cards_pay(p_id uuid,p_winner uuid) returns void language plpgsql set search_path='' as $$
declare w public.bb_wagers;u uuid;begin
 select * into w from public.bb_wagers where id=p_id for update;
 if w.id is null or w.rules->>'game' not in('cards','playingcards','pool') or w.state<>'running' then return;end if;
 if p_winner is null or p_winner not in(w.host,w.guest) then raise exception 'BAD_WINNER';end if;
 for u in select x from unnest(array[w.host,w.guest]) x order by x loop perform pg_advisory_xact_lock(hashtextextended(u::text,25));end loop;
 insert into public.bb_coin_transfers values(w.id,w.host,case when p_winner=w.host then w.amount else -w.amount end),(w.id,w.guest,case when p_winner=w.guest then w.amount else -w.amount end) on conflict do nothing;
 update public.bb_wagers set state='paid',winner=p_winner,host_result=p_winner,guest_result=p_winner where id=w.id;
end $$;
create or replace function public.bb_wager(p_action text default 'read',p_code text default '',p_id uuid default null,p_amount integer default 0,p_rules jsonb default '{}',p_winner uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 if p_rules->>'game' in('cards','playingcards','pool') or exists(select 1 from public.bb_wagers where id=p_id and rules->>'game' in('cards','playingcards','pool')) then raise exception 'CARD_WAGER_USE_GAME';end if;
 return public.bb_wager_legacy30(p_action,p_code,p_id,p_amount,p_rules,p_winner);end $$;
revoke all on function public.jj_pool_rack(jsonb,int),public.jj_pool_shot(jsonb,float8,float8,int,boolean),public.jj_pool(text,text,int,jsonb),public.jj_cards_pay(uuid,uuid) from public,anon,authenticated;
grant execute on function public.jj_pool(text,text,int,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
