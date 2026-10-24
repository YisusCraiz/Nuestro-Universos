-- Virtual rewards only. Preserves existing balances and idempotent requests.
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
  end if;
  reward:=ceil(reward*1.5)::int;
  if grade<>'D' and previous is not null and accuracy>previous then reward:=reward+2;end if;
  select coalesce(sum(jj),0),count(*) filter(where jj>0) into used,counted from public.jj_money_log where user_id=auth.uid() and kind in('arcade','piano') and created_at>=((now() at time zone 'America/Matamoros')::date::timestamp at time zone 'America/Matamoros');
  reward:=case when counted>=12 then 0 else least(reward,greatest(0,45-used)) end;
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
 select r.best into old from public.game_records r where r.game=p_game and r.user_id=auth.uid() and r.period_start=public.jj_period();
 saved_best:=public.record_game_once_legacy32(p_game,p_score,p_attempt);
 select coalesce(sum(jj),0) into earned from public.jj_money_log where user_id=auth.uid() and kind in('arcade','piano') and created_at>=((now() at time zone 'America/Matamoros')::date::timestamp at time zone 'America/Matamoros');
 if old is not null and (case when low then p_score<old else p_score>old end) then extra:=3;end if;
 -- Twelve rewarded finishes/day, shared with piano; at most 45 JJ per local day.
 if (select count(*) from public.jj_money_log where user_id=auth.uid() and kind in('arcade','piano') and jj>0 and created_at>=((now() at time zone 'America/Matamoros')::date::timestamp at time zone 'America/Matamoros'))<12 then award:=least(3+extra,greatest(0,45-earned));end if;
 insert into public.jj_money_log values(auth.uid(),p_attempt,'arcade',jsonb_build_object('game',p_game,'score',p_score),award,0,jsonb_build_object('reward',award,'record',extra>0),now());return saved_best;
end $$;


create or replace function public.jj_casino(p_action text default 'read',p_request uuid default null,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare previous public.jj_money_log;balance bigint;available bigint;n int;stake int;gain int:=0;dj int:=0;dx int:=0;bonus int:=0;win_bonus int:=0;roll int;chosen int;cards jsonb;held jsonb;deck jsonb;counts int[];ranks int[];suits int[];c int;i int;j int;flush boolean;straight boolean;category text;mult int;result jsonb:='{}';
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 if not public.is_jesus() and not coalesce((select visible from public.section_visibility where section='casino'),false) then raise exception 'SECTION_HIDDEN';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,25));
 if p_action<>'read' then
  if p_request is null then raise exception 'REQUEST_REQUIRED';end if;
  select * into previous from public.jj_money_log where user_id=auth.uid() and request=p_request;
  if found then
   if previous.kind<>p_action or previous.data<>p_data then raise exception 'REQUEST_MISMATCH';end if;
   return previous.result||jsonb_build_object('replayed',true,'jj',(public.bb_shop()->>'coins')::bigint,'jxj',(select coalesce(sum(jxj),0) from public.jj_money_log where user_id=auth.uid()),'pending',(select jsonb_build_object('deal',d.request,'cards',d.result->'cards','stake',d.data->'stake') from public.jj_money_log d where d.user_id=auth.uid() and d.kind='poker_deal' and not exists(select 1 from public.jj_money_log f where f.user_id=d.user_id and f.kind='poker_draw' and f.data->>'deal'=d.request::text) limit 1));
  end if;
 end if;
 select coalesce(sum(jxj),0) into balance from public.jj_money_log where user_id=auth.uid();available:=(public.bb_shop()->>'coins')::bigint;
 if p_action in('buy','sell') then
  n:=(p_data->>'amount')::int;if n is null or n not between 1 and 10000 then raise exception 'BAD_AMOUNT';end if;
  if p_action='buy' then dj:=-2*n;dx:=n;if available<2*n then raise exception 'INSUFFICIENT_COINS';end if;
  else
   if balance<n then raise exception 'INSUFFICIENT_JXJ';end if;
   -- One daily exchange bonus prevents repeated tiny conversions from farming coins.
   if not exists(select 1 from public.jj_money_log l where l.user_id=auth.uid() and l.kind='sell' and l.created_at>date_trunc('day',now() at time zone 'America/Matamoros') at time zone 'America/Matamoros' and (l.result->>'bonus')::int>0) and random()<0.05 then bonus:=1;end if;
   dj:=2*n+bonus;dx:=-n;
  end if;result:=jsonb_build_object('bonus',bonus,'deltaJJ',dj,'deltaJXJ',dx);
 elsif p_action in('slots','roulette','horse','poker_deal','poker_draw') then
  if p_action='poker_draw' then
   select * into previous from public.jj_money_log where user_id=auth.uid() and request=(p_data->>'deal')::uuid and kind='poker_deal' for update;
   if previous.request is null then raise exception 'DEAL_NOT_FOUND';end if;
   if exists(select 1 from public.jj_money_log where user_id=auth.uid() and kind='poker_draw' and data->>'deal'=p_data->>'deal') then raise exception 'DEAL_FINISHED';end if;
   cards:=previous.result->'cards';stake:=(previous.data->>'stake')::int;held:=p_data->'hold';
   if jsonb_typeof(held) is distinct from 'array' or jsonb_array_length(held)>5 or exists(select 1 from jsonb_array_elements_text(held) h where h not in('0','1','2','3','4')) then raise exception 'BAD_HOLD';end if;
   deck:=public.jj_deck52();for i in 0..4 loop
    if not held @> to_jsonb(array[i]) then
     j:=0;while (previous.result->'cards') @> jsonb_build_array((deck->>j)::int) or cards @> jsonb_build_array((deck->>j)::int) loop j:=j+1;end loop;
     cards:=jsonb_set(cards,array[i::text],deck->j);deck:=deck-j;
    end if;
   end loop;
   counts:=array_fill(0,array[15]);ranks:='{}';suits:='{}';
   for c in select value::int from jsonb_array_elements_text(cards) loop i:=c%13+1;if i=1 then i:=14;end if;counts[i]:=counts[i]+1;ranks:=array_append(ranks,i);suits:=array_append(suits,c/13);end loop;
   select array_agg(x order by x) into ranks from unnest(ranks) x;flush:=suits[1]=all(suits);straight:=(ranks[5]-ranks[1]=4 and (select count(distinct x) from unnest(ranks) x)=5) or ranks=array[2,3,4,5,14];
   if flush and straight then category:='straight_flush';mult:=50;
   elsif 4=any(counts) then category:='four';mult:=25;
   elsif 3=any(counts) and 2=any(counts) then category:='full_house';mult:=9;
   elsif flush then category:='flush';mult:=6;
   elsif straight then category:='straight';mult:=4;
   elsif 3=any(counts) then category:='three';mult:=3;
   elsif (select count(*) from unnest(counts) x where x=2)=2 then category:='two_pairs';mult:=2;
   elsif counts[11]=2 or counts[12]=2 or counts[13]=2 or counts[14]=2 then category:='jacks';mult:=1;
   else category:='none';mult:=0;end if;
   gain:=stake*mult;dx:=gain;result:=jsonb_build_object('cards',cards,'category',category,'multiplier',mult,'payout',gain,'net',gain-stake);
  else
   stake:=(p_data->>'stake')::int;if stake is null or stake not between 1 and 100 then raise exception 'BAD_STAKE';end if;
   if balance<stake then raise exception 'INSUFFICIENT_JXJ';end if;
   if p_action='slots' then
    cards:=jsonb_build_array(floor(random()*6)::int,floor(random()*6)::int,floor(random()*6)::int);
    mult:=case when cards->0=cards->1 and cards->1=cards->2 then 20 when cards->0=cards->1 or cards->1=cards->2 or cards->0=cards->2 then 1 else 0 end;gain:=stake*mult;result:=jsonb_build_object('reels',cards,'multiplier',mult);
   elsif p_action='roulette' then
    roll:=floor(random()*37)::int;category:=case when roll=0 then 'green' when roll=any(array[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]) then 'red' else 'black' end;
    if p_data->>'bet' in('red','black','even','odd') then mult:=case when (p_data->>'bet'=category or roll>0 and p_data->>'bet'=case when roll%2=0 then 'even' else 'odd' end) then 2 else 0 end;
    elsif p_data->>'bet'='number' and coalesce((p_data->>'number')::int,-1) between 0 and 36 then mult:=case when (p_data->>'number')::int=roll then 36 else 0 end;
    else raise exception 'BAD_BET';end if;gain:=stake*mult;result:=jsonb_build_object('number',roll,'color',category,'multiplier',mult);
   elsif p_action='horse' then
    chosen:=(p_data->>'horse')::int;if chosen is null or chosen not between 0 and 3 then raise exception 'BAD_HORSE';end if;
    roll:=floor(random()*10)::int;i:=case when roll<4 then 0 when roll<7 then 1 when roll<9 then 2 else 3 end;mult:=(array[2,3,4,8])[chosen+1];gain:=case when i=chosen then stake*mult else 0 end;result:=jsonb_build_object('winner',i,'multiplier',case when i=chosen then mult else 0 end);
   else
    -- A single unfinished hand can be resumed after reload; cards are never chosen by the browser.
    if exists(select 1 from public.jj_money_log d where d.user_id=auth.uid() and d.kind='poker_deal' and not exists(select 1 from public.jj_money_log f where f.user_id=d.user_id and f.kind='poker_draw' and f.data->>'deal'=d.request::text)) then raise exception 'FINISH_POKER';end if;
    deck:=public.jj_deck52();cards:='[]';for i in 0..4 loop cards:=cards||jsonb_build_array(deck->i);end loop;result:=jsonb_build_object('cards',cards,'deal',p_request);
   end if;
   dx:=gain-stake;result:=result||jsonb_build_object('payout',gain,'net',dx);
  end if;
 elsif p_action<>'read' then raise exception 'BAD_ACTION';end if;
 -- Small daily bonus only on resolved bets with a positive base net result.
 if p_action in('slots','roulette','horse','poker_draw') and (result->>'net')::int>0 and
 (select count(*) from public.jj_money_log l where l.user_id=auth.uid() and coalesce((l.result->>'casino_bonus')::int,0)>0 and created_at>=((now() at time zone 'America/Matamoros')::date::timestamp at time zone 'America/Matamoros'))<3 then
  win_bonus:=1;dx:=dx+1;
  result:=result||jsonb_build_object('casino_bonus',1,'payout',(result->>'payout')::int+1,'net',(result->>'net')::int+1);
 end if;
 if p_action<>'read' then insert into public.jj_money_log values(auth.uid(),p_request,p_action,p_data,dj,dx,result,now());end if;
 return result||jsonb_build_object('jj',available+dj,'jxj',balance+dx,'pending',(select jsonb_build_object('deal',d.request,'cards',d.result->'cards','stake',d.data->'stake') from public.jj_money_log d where d.user_id=auth.uid() and d.kind='poker_deal' and not exists(select 1 from public.jj_money_log f where f.user_id=d.user_id and f.kind='poker_draw' and f.data->>'deal'=d.request::text) limit 1));
end $$;
