-- Apply after 30. Existing inventories, wagers and saved games are retained.
begin;
insert into public.section_visibility(section,visible) values('playingcards',true) on conflict do nothing;
insert into public.bb_skins(id,price) values('ghost',6),('pumpkin',6),('vampire',8),('skeleton',7),('frankenstein',8),('kitsune',10),('witch',8),('devil',8),('zombie',7) on conflict(id) do nothing;
create table if not exists public.jj_table_rooms(
 id uuid primary key default gen_random_uuid(),code text unique not null,host uuid not null references auth.users(id),guest uuid references auth.users(id),
 mode text not null check(mode in('eights','twentyone','highcard')),
 rules jsonb not null default '{"wins":3,"stake":0,"hand":5}',ready boolean not null default false,
 game jsonb,revision integer not null default 1,expires timestamptz not null default now()+interval '4 hours',check(host is distinct from guest)
);
alter table public.jj_table_rooms enable row level security;
revoke all on public.jj_table_rooms from public,anon,authenticated;
create or replace function public.jj_deck52() returns jsonb language sql volatile set search_path='' as $$select public.jj_card_shuffle(jsonb_agg(i)) from generate_series(0,51) i$$;
create or replace function public.jj_value21(cards jsonb) returns integer language plpgsql immutable set search_path='' as $$
declare total int:=0;aces int:=0;c int;r int;begin
 for c in select value::int from jsonb_array_elements_text(cards) loop r:=c%13+1;if r=1 then total:=total+11;aces:=aces+1;else total:=total+least(r,10);end if;end loop;
 while total>21 and aces>0 loop total:=total-10;aces:=aces-1;end loop;return total;
end $$;
create or replace function public.jj_eights_legal(card int,top_card int,suit int) returns boolean language sql immutable set search_path='' as $$select card%13=7 or card/13=suit or (top_card%13<>7 and card%13=top_card%13)$$;
create or replace function public.jj_table_take(s jsonb,player int) returns jsonb language plpgsql volatile set search_path='' as $$
declare deck jsonb:=s->'deck';pile jsonb:=s->'pile';c jsonb;begin
 if jsonb_array_length(deck)=0 and jsonb_array_length(pile)>1 then deck:=public.jj_card_shuffle(pile-(jsonb_array_length(pile)-1));pile:=jsonb_build_array(pile->(jsonb_array_length(pile)-1));end if;
 if jsonb_array_length(deck)=0 then return s||'{"empty":true}'::jsonb;end if;
 c:=deck->0;s:=jsonb_set(s,array['hands',player::text],(s->'hands'->player)||jsonb_build_array(c));return s||jsonb_build_object('deck',deck-0,'pile',pile,'empty',false);
end $$;
create or replace function public.jj_table_end(s jsonb,winner int,goal int) returns jsonb language plpgsql immutable set search_path='' as $$
declare wins jsonb:=s->'wins';n int:=0;begin
 if (s->>'round_done')::boolean then return s;end if;
 if winner in(0,1) then n:=(wins->>winner)::int+1;wins:=jsonb_set(wins,array[winner::text],to_jsonb(n));end if;
 return s||jsonb_build_object('round_done',true,'winner',winner,'wins',wins,'finished',n>=goal);
end $$;
create or replace function public.jj_table_round(mode text,wins jsonb,round_no int,hand_size int) returns jsonb language plpgsql volatile set search_path='' as $$
declare s jsonb;deck jsonb;top_card int;n int;i int;begin
 s:=jsonb_build_object('deck',public.jj_deck52(),'pile','[]'::jsonb,'hands','[[],[]]'::jsonb,'turn',round_no%2,'stand','[false,false]'::jsonb,'flipped','[false,false]'::jsonb,'wins',wins,'round',round_no,'round_done',false,'winner',null,'finished',false,'passes',0,'empty',false);
 n:=case mode when 'eights' then hand_size when 'twentyone' then 2 else 1 end;
 for i in 1..n loop s:=public.jj_table_take(s,0);s:=public.jj_table_take(s,1);end loop;
 if mode='eights' then
  deck:=s->'deck';while (deck->>0)::int%13=7 loop deck:=public.jj_card_shuffle(deck);end loop;top_card:=(deck->>0)::int;
  s:=s||jsonb_build_object('deck',deck-0,'pile',jsonb_build_array(top_card),'suit',top_card/13);
 end if;return s;
end $$;
create or replace function public.jj_table(p_action text default 'read',p_code text default '',p_revision int default null,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.jj_table_rooms;s jsonb;w public.bb_wagers;me int;other int;stake int;c int;idx int;top_card int;suit int;a int;b int;winner int;result jsonb;wallet jsonb;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 if p_action='create' then
  if p_data->>'mode' is null or p_data->>'mode' not in('eights','twentyone','highcard') then raise exception 'BAD_MODE';end if;
  if not public.is_jesus() and not coalesce((select visible from public.section_visibility where section='playingcards'),false) then raise exception 'SECTION_HIDDEN';end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,31));
  select * into r from public.jj_table_rooms where host=auth.uid() and mode=p_data->>'mode' and expires>now() order by expires desc limit 1 for update;
  if r.id is null then insert into public.jj_table_rooms(code,host,mode) values(upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),auth.uid(),p_data->>'mode') returning * into r;end if;
 else
  select * into r from public.jj_table_rooms where code=upper(trim(p_code)) and expires>now() for update;
  if r.id is null then raise exception 'ROOM_NOT_FOUND';end if;
  if p_action='join' and auth.uid()<>r.host then
   if r.guest is not null and r.guest<>auth.uid() then raise exception 'ROOM_FULL';end if;
   if r.guest is null then update public.jj_table_rooms set guest=auth.uid(),ready=false,revision=revision+1 where id=r.id returning * into r;end if;
  end if;
  if auth.uid() is distinct from r.host and auth.uid() is distinct from r.guest then raise exception 'NOT_IN_ROOM';end if;
 end if;
 me:=case when auth.uid()=r.host then 0 else 1 end;other:=1-me;s:=r.game;stake:=(r.rules->>'stake')::int;
 select * into w from public.bb_wagers where room_id=r.id and rules->>'game'='playingcards' order by created_at desc limit 1 for update;
 if w.state in('offered','running') and w.expires<=now() then update public.bb_wagers set state='refunded' where id=w.id returning * into w;end if;
 if p_action='leave' then
  if w.state='running' then perform public.jj_cards_pay(w.id,case when me=0 then r.guest else r.host end);
  elsif w.state='offered' then update public.bb_wagers set state='refunded' where id=w.id;end if;
  if me=0 then delete from public.jj_table_rooms where id=r.id;else update public.jj_table_rooms set guest=null,ready=false,game=null,revision=revision+1 where id=r.id;end if;return '{}'::jsonb;
 elsif p_action not in('read','create','join') then
  if p_revision is null or (p_revision<>r.revision and not (p_action='flip' and r.mode='highcard' and coalesce((p_data->>'round')::int,-1)=coalesce((s->>'round')::int,-2))) then raise exception 'STALE';end if;
  if p_action='rules' then
   if me<>0 or s is not null then raise exception 'RULES_LOCKED';end if;
   if coalesce((p_data->>'wins')::int,0) not between 1 and 20 or coalesce((p_data->>'stake')::int,-1) not between 0 and 1000000 or coalesce((p_data->>'hand')::int,0) not between 3 and 10 then raise exception 'BAD_RULES';end if;
   if w.state='offered' then update public.bb_wagers set state='refunded' where id=w.id returning * into w;end if;
   r.rules:=jsonb_build_object('wins',(p_data->>'wins')::int,'stake',(p_data->>'stake')::int,'hand',(p_data->>'hand')::int);r.ready:=false;
  elsif p_action='bet' then
   if me<>0 or s is not null or r.guest is null or stake<=0 then raise exception 'BET_NOT_READY';end if;
   if w.state in('offered','running') then raise exception 'BET_ALREADY_RESERVED';end if;
   if (public.bb_shop()->>'coins')::bigint<stake then raise exception 'INSUFFICIENT_COINS';end if;
   insert into public.bb_wagers(room_id,host,guest,amount,rules,expires) values(r.id,r.host,r.guest,stake,jsonb_build_object('game','playingcards','mode',r.mode,'settings',r.rules),r.expires) returning * into w;r.ready:=false;
  elsif p_action='ready' then
   if me<>1 or s is not null then raise exception 'BAD_ACTION';end if;
   if stake>0 then
    if w.id is null or w.state<>'offered' or w.guest<>auth.uid() or w.rules->'settings'<>r.rules then raise exception 'BET_NOT_READY';end if;
    if not w.guest_ok then
     if (public.bb_shop()->>'coins')::bigint<stake then raise exception 'INSUFFICIENT_COINS';end if;
     update public.bb_wagers set guest_ok=true where id=w.id returning * into w;
    end if;
   end if;r.ready:=true;
  elsif p_action in('start','next','reset') then
   if me<>0 or r.guest is null then raise exception 'HOST_ONLY';end if;
   if p_action='reset' then
    if not coalesce((s->>'finished')::boolean,false) then raise exception 'MATCH_ACTIVE';end if;s:=null;r.ready:=false;
   else
    if p_action='start' and (s is not null or not r.ready) then raise exception 'NOT_READY';end if;
    if p_action='next' and (s is null or not (s->>'round_done')::boolean or (s->>'finished')::boolean) then raise exception 'MATCH_ACTIVE';end if;
    if p_action='start' and stake>0 then
     if w.id is null or w.state<>'offered' or not w.host_ok or not w.guest_ok or w.rules->'settings'<>r.rules then raise exception 'BET_NOT_READY';end if;
     update public.bb_wagers set state='running' where id=w.id returning * into w;
    end if;
    s:=public.jj_table_round(r.mode,case when p_action='next' then s->'wins' else '[0,0]'::jsonb end,case when p_action='next' then (s->>'round')::int+1 else 1 end,(r.rules->>'hand')::int);
   end if;
  else
   if s is null or (s->>'round_done')::boolean then raise exception 'NOT_PLAYING';end if;
   if r.mode='highcard' then
    if p_action<>'flip' or (s->'flipped'->>me)::boolean then raise exception 'BAD_ACTION';end if;
    s:=jsonb_set(s,array['flipped',me::text],'true'::jsonb);
    if (s->'flipped'->>0)::boolean and (s->'flipped'->>1)::boolean then
     a:=(s->'hands'->0->>0)::int%13+1;b:=(s->'hands'->1->>0)::int%13+1;if a=1 then a:=14;end if;if b=1 then b:=14;end if;
     s:=public.jj_table_end(s,case when a=b then 2 when a>b then 0 else 1 end,(r.rules->>'wins')::int);
    end if;
   else
    if (s->>'turn')::int<>me then raise exception 'NOT_YOUR_TURN';end if;
    if r.mode='twentyone' then
     if (s->'stand'->>me)::boolean then raise exception 'ALREADY_STOOD';end if;
     if p_action='hit' then s:=public.jj_table_take(s,me);if (s->>'empty')::boolean then raise exception 'DECK_EMPTY';end if;
     elsif p_action<>'stand' then raise exception 'BAD_ACTION';end if;
     if p_action='stand' or public.jj_value21(s->'hands'->me)>=21 then s:=jsonb_set(s,array['stand',me::text],'true'::jsonb);s:=s||jsonb_build_object('turn',other);end if;
     if (s->'stand'->>0)::boolean and (s->'stand'->>1)::boolean then
      a:=public.jj_value21(s->'hands'->0);b:=public.jj_value21(s->'hands'->1);if a>21 then a:=-1;end if;if b>21 then b:=-1;end if;
      s:=public.jj_table_end(s,case when a=b then 2 when a>b then 0 else 1 end,(r.rules->>'wins')::int);
     end if;
    else
     top_card:=(s->'pile'->>(jsonb_array_length(s->'pile')-1))::int;
     if p_action='play' then
      c:=(p_data->>'card')::int;select ordinality::int-1 into idx from jsonb_array_elements_text(s->'hands'->me) with ordinality where value::int=c;
      if idx is null or not public.jj_eights_legal(c,top_card,(s->>'suit')::int) then raise exception 'ILLEGAL_CARD';end if;
      suit:=case when c%13=7 then (p_data->>'suit')::int else c/13 end;if suit is null or suit not between 0 and 3 then raise exception 'CHOOSE_SUIT';end if;
      s:=jsonb_set(s,array['hands',me::text],(s->'hands'->me)-idx);s:=s||jsonb_build_object('pile',(s->'pile')||jsonb_build_array(c),'suit',suit,'turn',other,'passes',0);
      if jsonb_array_length(s->'hands'->me)=0 then s:=public.jj_table_end(s,me,(r.rules->>'wins')::int);end if;
     elsif p_action='draw' then s:=public.jj_table_take(s,me);if not (s->>'empty')::boolean then s:=s||'{"passes":0}'::jsonb;end if;
     elsif p_action='pass' then
      if jsonb_array_length(s->'deck')>0 or jsonb_array_length(s->'pile')>1 or exists(select 1 from jsonb_array_elements_text(s->'hands'->me) h where public.jj_eights_legal(h::int,top_card,(s->>'suit')::int)) then raise exception 'DRAW_OR_PLAY';end if;
      s:=s||jsonb_build_object('passes',(s->>'passes')::int+1,'turn',other);
      if (s->>'passes')::int>=2 then a:=jsonb_array_length(s->'hands'->0);b:=jsonb_array_length(s->'hands'->1);s:=public.jj_table_end(s,case when a=b then 2 when a<b then 0 else 1 end,(r.rules->>'wins')::int);end if;
     else raise exception 'BAD_ACTION';end if;
    end if;
   end if;
  end if;
  if w.state='running' and coalesce((s->>'finished')::boolean,false) then perform public.jj_cards_pay(w.id,case when (s->>'winner')::int=0 then r.host else r.guest end);end if;
  if w.state in('offered','running') then update public.bb_wagers set expires=now()+interval '4 hours' where id=w.id;end if;
  update public.jj_table_rooms set rules=r.rules,ready=r.ready,game=s,revision=revision+1,expires=now()+interval '4 hours' where id=r.id returning * into r;
 end if;
 select * into w from public.bb_wagers where room_id=r.id and rules->>'game'='playingcards' order by created_at desc limit 1;wallet:=public.bb_shop();
 result:=jsonb_build_object('code',r.code,'mode',r.mode,'me',me,'host',r.host,'guest',r.guest,'rules',r.rules,'ready',r.ready,'revision',r.revision,'coins',(wallet->>'coins')::bigint,'bet',case when w.id is null then null else jsonb_build_object('amount',w.amount,'state',w.state,'host_ok',w.host_ok,'guest_ok',w.guest_ok,'winner',w.winner) end,'players',(select jsonb_agg(jsonb_build_object('id',p.id,'handle',p.handle,'name',p.display_name,'skin',coalesce(e.skin,'casual')) order by (p.id=r.host) desc) from public.profiles p left join public.bb_equipped e on e.user_id=p.id where p.id in(r.host,r.guest)));
 if r.game is not null then s:=r.game;result:=result||jsonb_build_object('game',(s-array['deck','pile','hands'])||jsonb_build_object('hand',case when r.mode='highcard' and not (s->'flipped'->>me)::boolean then '[]'::jsonb else s->'hands'->me end,'counts',jsonb_build_array(jsonb_array_length(s->'hands'->0),jsonb_array_length(s->'hands'->1)),'shown',case when (s->>'round_done')::boolean then s->'hands' else null end,'value',case when r.mode='twentyone' then public.jj_value21(s->'hands'->me) else null end,'top',s->'pile'->(jsonb_array_length(s->'pile')-1),'deck_count',jsonb_array_length(s->'deck'),'can_draw',jsonb_array_length(s->'deck')>0 or jsonb_array_length(s->'pile')>1));end if;return result;
end $$;
revoke all on function public.jj_deck52(),public.jj_value21(jsonb),public.jj_eights_legal(int,int,int),public.jj_table_take(jsonb,int),public.jj_table_end(jsonb,int,int),public.jj_table_round(text,jsonb,int,int),public.jj_table(text,text,int,jsonb) from public,anon,authenticated;
grant execute on function public.jj_table(text,text,int,jsonb) to authenticated;

create or replace function public.jj_cards_pay(p_id uuid,p_winner uuid) returns void language plpgsql set search_path='' as $$
declare w public.bb_wagers;u uuid;
begin
 select * into w from public.bb_wagers where id=p_id for update;
 if w.id is null or w.rules->>'game' not in('cards','playingcards') or w.state<>'running' then return;end if;
 if p_winner is null or p_winner not in(w.host,w.guest) then raise exception 'BAD_WINNER';end if;
 for u in select x from unnest(array[w.host,w.guest]) x order by x loop perform pg_advisory_xact_lock(hashtextextended(u::text,25));end loop;
 insert into public.bb_coin_transfers(wager_id,user_id,delta) values(w.id,w.host,case when p_winner=w.host then w.amount else -w.amount end),(w.id,w.guest,case when p_winner=w.guest then w.amount else -w.amount end) on conflict do nothing;
 update public.bb_wagers set state='paid',winner=p_winner,host_result=p_winner,guest_result=p_winner where id=w.id;
end $$;
-- The Bombitas RPC cannot cancel or settle a server-validated card wager.
do $$begin if to_regprocedure('public.bb_wager_legacy30(text,text,uuid,integer,jsonb,uuid)') is null then alter function public.bb_wager(text,text,uuid,integer,jsonb,uuid) rename to bb_wager_legacy30;end if;end $$;
revoke all on function public.bb_wager_legacy30(text,text,uuid,integer,jsonb,uuid) from public,anon,authenticated;
create or replace function public.bb_wager(p_action text default 'read',p_code text default '',p_id uuid default null,p_amount integer default 0,p_rules jsonb default '{}',p_winner uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 if p_rules->>'game' in('cards','playingcards') or exists(select 1 from public.bb_wagers where id=p_id and rules->>'game' in('cards','playingcards')) then raise exception 'CARD_WAGER_USE_GAME';end if;
 return public.bb_wager_legacy30(p_action,p_code,p_id,p_amount,p_rules,p_winner);
end $$;

revoke all on function public.jj_cards_pay(uuid,uuid),public.bb_wager(text,text,uuid,integer,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.bb_wager(text,text,uuid,integer,jsonb,uuid) to authenticated;
commit;
