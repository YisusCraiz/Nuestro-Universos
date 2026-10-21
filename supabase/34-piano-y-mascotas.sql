-- Apply after 33. Pets and piano use the existing JJ wallet and shared reward limits.
begin;
insert into public.section_visibility(section,visible) values('piano',true) on conflict do nothing;
create table if not exists public.jj_pet_catalog(id text primary key,price int not null check(price>0),skin text not null references public.bb_skins(id));
insert into public.jj_pet_catalog values('cat',60,'cat'),('shark',80,'shark'),('kitsune',100,'kitsune'),('bunny',120,'witch') on conflict do nothing;
create table if not exists public.jj_pet_inventory(user_id uuid not null references auth.users(id),pet text not null references public.jj_pet_catalog(id),paid int not null,primary key(user_id,pet));
create table if not exists public.jj_pet_equipped(user_id uuid primary key references auth.users(id),pet text references public.jj_pet_catalog(id));
alter table public.jj_pet_catalog enable row level security;
alter table public.jj_pet_inventory enable row level security;
alter table public.jj_pet_equipped enable row level security;
revoke all on public.jj_pet_catalog,public.jj_pet_inventory,public.jj_pet_equipped from public,anon,authenticated;
-- Pet purchases are reflected in every existing consumer of the shared wallet.
do $$begin if to_regprocedure('public.jj_dashboard_legacy34()') is null then alter function public.jj_dashboard() rename to jj_dashboard_legacy34;end if;end $$;
revoke all on function public.jj_dashboard_legacy34() from public,anon,authenticated;
create or replace function public.jj_dashboard() returns jsonb language plpgsql security definer set search_path='' as $$declare d jsonb;begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 d:=public.jj_dashboard_legacy34();return d||jsonb_build_object('coins',(d->>'coins')::bigint-(select coalesce(sum(paid),0) from public.jj_pet_inventory where user_id=auth.uid()));end $$;
create or replace function public.jj_pets(p_action text default 'read',p_pet text default null) returns jsonb language plpgsql security definer set search_path='' as $$declare cost int;begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,25));
 if p_action in('buy','equip') then
  if p_pet is not null then
   select price into cost from public.jj_pet_catalog where id=p_pet;if cost is null then raise exception 'BAD_PET';end if;
   if not exists(select 1 from public.jj_pet_inventory where user_id=auth.uid() and pet=p_pet) then
    if p_action<>'buy' then raise exception 'NOT_OWNED';end if;
    if (public.bb_shop()->>'coins')::bigint<cost then raise exception 'INSUFFICIENT_COINS';end if;
    insert into public.jj_pet_inventory values(auth.uid(),p_pet,cost);
   end if;
  elsif p_action='buy' then raise exception 'BAD_PET';end if;
  insert into public.jj_pet_equipped values(auth.uid(),p_pet) on conflict(user_id) do update set pet=excluded.pet;
 elsif p_action<>'read' then raise exception 'BAD_ACTION';end if;
 return jsonb_build_object('coins',(public.bb_shop()->>'coins')::bigint,'equipped',(select pet from public.jj_pet_equipped where user_id=auth.uid()),'owned',coalesce((select jsonb_agg(pet) from public.jj_pet_inventory where user_id=auth.uid()),'[]'::jsonb),'catalog',(select jsonb_object_agg(id,jsonb_build_object('price',price,'skin',skin)) from public.jj_pet_catalog));end $$;
create table if not exists public.jj_piano_runs(
 id uuid primary key,user_id uuid not null references auth.users(id),song_id uuid not null,difficulty int not null,duration int not null,notes jsonb not null,
 started timestamptz not null default clock_timestamp(),state text not null default 'playing',result jsonb,transcript jsonb
);
create index if not exists jj_piano_owner on public.jj_piano_runs(user_id,started);
create table if not exists public.jj_piano_bests(user_id uuid not null references auth.users(id),song_id uuid not null,difficulty int not null,accuracy int not null,primary key(user_id,song_id,difficulty));
alter table public.jj_piano_runs enable row level security;alter table public.jj_piano_bests enable row level security;
revoke all on public.jj_piano_runs,public.jj_piano_bests from public,anon,authenticated;
create or replace function public.jj_piano(p_action text,p_id uuid,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.jj_piano_runs;d int;duration int;n int;i int;t int;last_time int:=-1;spacing int;notes jsonb:='[]';ev jsonb;lane int;idx int;delta int;distance int;win int;perfect int:=0;good int:=0;wrong int:=0;combo int:=0;max_combo int:=0;accuracy int;score int;grade text;reward int:=0;previous int;used int;counted int;done boolean[];cursor int:=0;times_arr int[];lanes_arr int[];song uuid;outcome jsonb;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 if p_id is null then raise exception 'REQUEST_REQUIRED';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,34));
 select * into r from public.jj_piano_runs where id=p_id for update;
 if r.id is not null and r.user_id<>auth.uid() then raise exception 'NOT_YOUR_RUN';end if;
 if p_action='start' then
  if r.id is not null then
   if r.song_id is distinct from (p_data->>'song')::uuid or r.difficulty is distinct from (p_data->>'difficulty')::int or r.duration is distinct from (p_data->>'duration')::int then raise exception 'REQUEST_MISMATCH';end if;
   return jsonb_build_object('id',r.id,'notes',r.notes,'state',r.state,'result',r.result);
  end if;
  if not public.is_jesus() and not coalesce((select visible from public.section_visibility where section='piano'),false) then raise exception 'SECTION_HIDDEN';end if;
  song:=(p_data->>'song')::uuid;d:=(p_data->>'difficulty')::int;duration:=(p_data->>'duration')::int;
  if d is null or d not between 1 and 3 or duration is null or duration not between 20 and 600 then raise exception 'BAD_SETTINGS';end if;
  if not exists(select 1 from public.posts where id=song and kind='music' and audio_path is not null) then raise exception 'SONG_UNAVAILABLE';end if;
  if jsonb_typeof(p_data->'times') is distinct from 'array' then raise exception 'BAD_CHART';end if;
  n:=jsonb_array_length(p_data->'times');spacing:=(array[480,290,170])[d];
  if n<greatest(20,(duration*1000-1800)/(array[850,450,300])[d]) or n>least(3000,duration*1000/spacing) then raise exception 'BAD_CHART';end if;
  for i in 0..n-1 loop
   t:=(p_data->'times'->>i)::int;if t is null or t<1000 or t>duration*1000-500 or (i>0 and t-last_time<spacing) then raise exception 'BAD_CHART';end if;
   notes:=notes||jsonb_build_array(jsonb_build_object('t',t,'l',(i*7+i/4)%4));last_time:=t;
  end loop;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,34));
  update public.jj_piano_runs set state='cancelled' where user_id=auth.uid() and state='playing';
  insert into public.jj_piano_runs(id,user_id,song_id,difficulty,duration,notes) values(p_id,auth.uid(),song,d,duration,notes) returning * into r;
 elsif r.id is null then raise exception 'RUN_NOT_FOUND';
 elsif p_action='cancel' then if r.state='playing' then update public.jj_piano_runs set state='cancelled' where id=r.id;end if;return '{}';
 elsif p_action='finish' then
  if r.state='finished' then if r.transcript<>p_data->'events' then raise exception 'REQUEST_MISMATCH';end if;return r.result;end if;
  if r.state<>'playing' or r.started<clock_timestamp()-interval '1 hour' then raise exception 'RUN_EXPIRED';end if;
  if clock_timestamp()<r.started+r.duration*interval '1 second' then raise exception 'TOO_EARLY';end if;
  if jsonb_typeof(p_data->'events') is distinct from 'array' or jsonb_array_length(p_data->'events')>12000 then raise exception 'BAD_INPUT';end if;
  n:=jsonb_array_length(r.notes);select array_agg((value->>'t')::int order by ordinality),array_agg((value->>'l')::int order by ordinality) into times_arr,lanes_arr from jsonb_array_elements(r.notes) with ordinality;done:=array_fill(false,array[n]);win:=(array[180,140,105])[r.difficulty];
  for ev in select value from jsonb_array_elements(p_data->'events') loop
   t:=(ev->>0)::int;lane:=(ev->>1)::int;
   if t is null or lane is null or t<0 or t>r.duration*1000+250 or t<last_time or lane not between 0 and 3 then raise exception 'BAD_INPUT';end if;last_time:=t;
   while cursor<n and times_arr[cursor+1]<t-win loop if not done[cursor+1] then combo:=0;done[cursor+1]:=true;end if;cursor:=cursor+1;end loop;
   idx:=null;distance:=win+1;
   for i in cursor..n-1 loop
    exit when times_arr[i+1]>t+win;
    if not done[i+1] and lanes_arr[i+1]=lane then delta:=abs(t-times_arr[i+1]);if delta<distance then distance:=delta;idx:=i;end if;end if;
   end loop;
   if idx is null then wrong:=wrong+1;combo:=0;
   else done[idx+1]:=true;if distance<=win/2 then perfect:=perfect+1;else good:=good+1;end if;combo:=combo+1;max_combo:=greatest(max_combo,combo);end if;
  end loop;
  score:=greatest(0,perfect*100+good*70-wrong*10);accuracy:=least(10000,score*100/n);grade:=case when accuracy>=9700 then 'S' when accuracy>=9000 then 'A' when accuracy>=7500 then 'B' when accuracy>=6000 then 'C' else 'D' end;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,25));
  select b.accuracy into previous from public.jj_piano_bests b where user_id=auth.uid() and song_id=r.song_id and difficulty=r.difficulty;
  if grade<>'D' then
   reward:=case r.difficulty when 1 then case grade when 'S' then 4 when 'A' then 3 when 'B' then 2 else 1 end when 2 then case grade when 'S' then 7 when 'A' then 5 when 'B' then 3 else 2 end else case grade when 'S' then 10 when 'A' then 8 when 'B' then 5 else 3 end end;
   if previous is not null and accuracy>previous then reward:=reward+1;end if;
  end if;
  select coalesce(sum(jj),0),count(*) filter(where jj>0) into used,counted from public.jj_money_log where user_id=auth.uid() and kind in('arcade','piano') and created_at>=((now() at time zone 'America/Matamoros')::date::timestamp at time zone 'America/Matamoros');
  reward:=case when counted>=10 then 0 else least(reward,greatest(0,20-used)) end;
  insert into public.jj_piano_bests values(auth.uid(),r.song_id,r.difficulty,accuracy) on conflict(user_id,song_id,difficulty) do update set accuracy=greatest(public.jj_piano_bests.accuracy,excluded.accuracy);
  outcome:=jsonb_build_object('score',score,'accuracy',accuracy,'grade',grade,'perfect',perfect,'good',good,'miss',n-perfect-good,'wrong',wrong,'combo',max_combo,'reward',reward,'improved',previous is not null and accuracy>previous);
  insert into public.jj_money_log values(auth.uid(),r.id,'piano',jsonb_build_object('song',r.song_id,'difficulty',r.difficulty),reward,0,outcome,now());
  update public.jj_piano_runs set state='finished',result=outcome,transcript=p_data->'events' where id=r.id;return outcome;
 elsif p_action<>'read' then raise exception 'BAD_ACTION';end if;
 return jsonb_build_object('id',r.id,'notes',r.notes,'state',r.state,'result',r.result);
end $$;
create or replace function public.record_game_once(p_game text,p_score integer,p_attempt uuid) returns integer language plpgsql security definer set search_path='' as $$
declare saved_best int;old int;low boolean;award int:=0;extra int:=0;earned int;begin
 if not public.is_member() or p_attempt is null then raise exception 'NOT_MEMBER';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,25));
 perform pg_advisory_xact_lock(hashtext('jj-score-'||p_game));
 if exists(select 1 from public.game_submissions where attempt=p_attempt) then return public.record_game_once_legacy32(p_game,p_score,p_attempt);end if;
 select lower_wins into low from public.game_catalog where game=p_game;
 select r.best into old from public.game_records r where r.game=p_game and r.period_start=public.jj_period() order by case when low then r.best else -r.best end limit 1;
 saved_best:=public.record_game_once_legacy32(p_game,p_score,p_attempt);
 select coalesce(sum(jj),0) into earned from public.jj_money_log where user_id=auth.uid() and kind in('arcade','piano') and created_at>=((now() at time zone 'America/Matamoros')::date::timestamp at time zone 'America/Matamoros');
 if old is not null and (case when low then p_score<old else p_score>old end) then extra:=2;end if;
 -- Ten rewarded finishes/day; record bonus within a total daily allowance of 20 JJ.
 if (select count(*) from public.jj_money_log where user_id=auth.uid() and kind in('arcade','piano') and jj>0 and created_at>=((now() at time zone 'America/Matamoros')::date::timestamp at time zone 'America/Matamoros'))<10 then award:=least(1+extra,greatest(0,20-earned));end if;
 insert into public.jj_money_log values(auth.uid(),p_attempt,'arcade',jsonb_build_object('game',p_game,'score',p_score),award,0,jsonb_build_object('reward',award,'record',extra>0),now());return saved_best;
end $$;

revoke all on function public.jj_dashboard(),public.jj_pets(text,text),public.jj_piano(text,uuid,jsonb) from public,anon;
grant execute on function public.jj_dashboard(),public.jj_pets(text,text),public.jj_piano(text,uuid,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
