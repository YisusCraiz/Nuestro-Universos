-- Apply after 31. Virtual coins only. Existing balances and inventory are preserved.
begin;
insert into public.section_visibility(section,visible) values('vs',true),('casino',true),('pool',true) on conflict do nothing;
create table if not exists public.jj_money_log(
 user_id uuid not null references auth.users(id),request uuid not null,kind text not null,data jsonb not null,
 jj integer not null default 0,jxj integer not null default 0,result jsonb not null,created_at timestamptz not null default now(),
 primary key(user_id,request)
);
create index if not exists jj_money_history on public.jj_money_log(user_id,kind,created_at);
create unique index if not exists jj_poker_draw_once on public.jj_money_log(user_id,(data->>'deal')) where kind='poker_draw';
alter table public.jj_money_log enable row level security;
revoke all on public.jj_money_log from public,anon,authenticated;
do $$begin
 if to_regprocedure('public.jj_dashboard_legacy32()') is null then alter function public.jj_dashboard() rename to jj_dashboard_legacy32;end if;
 if to_regprocedure('public.record_game_once_legacy32(text,integer,uuid)') is null then alter function public.record_game_once(text,integer,uuid) rename to record_game_once_legacy32;end if;
end $$;
revoke all on function public.jj_dashboard_legacy32(),public.record_game_once_legacy32(text,integer,uuid) from public,anon,authenticated;
create or replace function public.jj_dashboard() returns jsonb language plpgsql security definer set search_path='' as $$
declare d jsonb;begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 d:=public.jj_dashboard_legacy32();return d||jsonb_build_object('coins',(d->>'coins')::bigint+(select coalesce(sum(jj),0) from public.jj_money_log where user_id=auth.uid()));
end $$;
create or replace function public.jj_casino(p_action text default 'read',p_request uuid default null,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare previous public.jj_money_log;balance bigint;available bigint;n int;stake int;gain int:=0;dj int:=0;dx int:=0;bonus int:=0;roll int;chosen int;cards jsonb;held jsonb;deck jsonb;counts int[];ranks int[];suits int[];c int;i int;j int;flush boolean;straight boolean;category text;mult int;result jsonb:='{}';
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
 if p_action<>'read' then insert into public.jj_money_log values(auth.uid(),p_request,p_action,p_data,dj,dx,result,now());end if;
 return result||jsonb_build_object('jj',available+dj,'jxj',balance+dx,'pending',(select jsonb_build_object('deal',d.request,'cards',d.result->'cards','stake',d.data->'stake') from public.jj_money_log d where d.user_id=auth.uid() and d.kind='poker_deal' and not exists(select 1 from public.jj_money_log f where f.user_id=d.user_id and f.kind='poker_draw' and f.data->>'deal'=d.request::text) limit 1));
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
 select coalesce(sum(jj),0) into earned from public.jj_money_log where user_id=auth.uid() and kind='arcade' and created_at>=((now() at time zone 'America/Matamoros')::date::timestamp at time zone 'America/Matamoros');
 if old is not null and (case when low then p_score<old else p_score>old end) then extra:=2;end if;
 -- Ten rewarded finishes/day; record bonus within a total daily allowance of 20 JJ.
 if (select count(*) from public.jj_money_log where user_id=auth.uid() and kind='arcade' and jj>0 and created_at>=((now() at time zone 'America/Matamoros')::date::timestamp at time zone 'America/Matamoros'))<10 then award:=least(1+extra,greatest(0,20-earned));end if;
 insert into public.jj_money_log values(auth.uid(),p_attempt,'arcade',jsonb_build_object('game',p_game,'score',p_score),award,0,jsonb_build_object('reward',award,'record',extra>0),now());return saved_best;
end $$;
create or replace function public.jj_arcade_reward(p_attempt uuid) returns jsonb language sql security definer set search_path='' as $$select result from public.jj_money_log where user_id=auth.uid() and request=p_attempt and kind='arcade' and public.is_member()$$;
revoke all on function public.jj_dashboard(),public.jj_casino(text,uuid,jsonb),public.record_game_once(text,integer,uuid),public.jj_arcade_reward(uuid) from public,anon;
grant execute on function public.jj_dashboard(),public.jj_casino(text,uuid,jsonb),public.record_game_once(text,integer,uuid),public.jj_arcade_reward(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
