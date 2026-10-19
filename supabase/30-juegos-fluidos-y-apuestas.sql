-- After 29 (and the existing wagers from 26). No purchases or balances are reset.
begin;
alter table public.jj_card_rooms alter column rules set default '{"hand":7,"mode":"rounds","wins":3,"target":500,"stake":0,"stack":false,"until":false,"uno":true,"challenge":true}';
update public.jj_card_rooms set rules=rules||'{"mode":"rounds","wins":3,"stake":0}'::jsonb,ready=false,revision=revision+1 where game is null and not (rules ? 'mode');
create or replace function public.jj_cards_pay(p_id uuid,p_winner uuid) returns void language plpgsql set search_path='' as $$
declare w public.bb_wagers;u uuid;
begin
 select * into w from public.bb_wagers where id=p_id for update;
 if w.id is null or w.rules->>'game'<>'cards' or w.state<>'running' then return;end if;
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
 if p_rules->>'game'='cards' or exists(select 1 from public.bb_wagers where id=p_id and rules->>'game'='cards') then raise exception 'CARD_WAGER_USE_GAME';end if;
 return public.bb_wager_legacy30(p_action,p_code,p_id,p_amount,p_rules,p_winner);
end $$;
create or replace function public.jj_card_finish(s jsonb,rules jsonb) returns jsonb language plpgsql set search_path='' as $$
declare winner int;points int;total int;wins jsonb;won int;
begin
 if s->'winner'<>'null'::jsonb then return s;end if;
 if jsonb_array_length(s->'hands'->0)=0 then winner:=0;
 elsif jsonb_array_length(s->'hands'->1)=0 then winner:=1;
 else return s;end if;
 select coalesce(sum(case when left(value,1)='w' then 50 when substr(value,2,1) in ('s','r','d') then 20 else substr(value,2,1)::int end),0) into points from jsonb_array_elements_text(s->'hands'->(1-winner));
 total:=(s->'scores'->>winner)::int+points;s:=jsonb_set(s,array['scores',winner::text],to_jsonb(total));
 wins:=coalesce(s->'round_wins','[0,0]'::jsonb);won:=(wins->>winner)::int+1;wins:=jsonb_set(wins,array[winner::text],to_jsonb(won));
 return s||jsonb_build_object('round_wins',wins,'winner',winner,'points',points,'finished',case when rules->>'mode'='rounds' then won>=coalesce((rules->>'wins')::int,3) else (rules->>'target')::int=0 or total>=(rules->>'target')::int end,'notice','round_won');
end $$;

create or replace function public.jj_cards(p_action text default 'read',p_code text default '',p_revision int default null,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.jj_card_rooms;s jsonb;me int;other int;idx int;card text;top_card text;color text;hand jsonb;debt int;illegal boolean;result jsonb;count_drawn int;w public.bb_wagers;stake int;wallet jsonb;u uuid;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 if p_action='create' then
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,29));
  if not public.is_jesus() and not coalesce((select visible from public.section_visibility where section='cards'),false) then raise exception 'SECTION_HIDDEN';end if;
  select * into r from public.jj_card_rooms where host=auth.uid() and expires>now() order by expires desc limit 1 for update;
  if r.id is null then insert into public.jj_card_rooms(code,host) values(upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),auth.uid()) returning * into r;end if;
 else
  select * into r from public.jj_card_rooms where code=upper(trim(p_code)) and expires>now() for update;
  if r.id is null then raise exception 'ROOM_NOT_FOUND';end if;
  if p_action='join' and r.host<>auth.uid() then
   if r.guest is not null and r.guest<>auth.uid() then raise exception 'ROOM_FULL';end if;
   if r.guest is null then update public.jj_card_rooms set guest=auth.uid(),ready=false,revision=revision+1 where id=r.id returning * into r;end if;
  end if;
  if auth.uid() is distinct from r.host and auth.uid() is distinct from r.guest then raise exception 'NOT_IN_ROOM';end if;
 end if;
 me:=case when auth.uid()=r.host then 0 else 1 end;other:=1-me;s:=r.game;
 select * into w from public.bb_wagers where room_id=r.id and rules->>'game'='cards' order by created_at desc limit 1 for update;
 if w.state in ('offered','running') and w.expires<=now() then update public.bb_wagers set state='refunded' where id=w.id returning * into w;end if;
 stake:=coalesce((r.rules->>'stake')::int,0);
 if p_action='leave' then
  if w.state='running' and s is not null and not coalesce((s->>'finished')::boolean,false) then perform public.jj_cards_pay(w.id,case when me=0 then r.guest else r.host end);
  elsif w.state='offered' then update public.bb_wagers set state='refunded' where id=w.id;end if;
  if me=0 then delete from public.jj_card_rooms where id=r.id;else update public.jj_card_rooms set guest=null,ready=false,game=null,revision=revision+1 where id=r.id;end if;
  return '{}'::jsonb;
 elsif p_action not in ('read','join','create') then
  if p_revision is null or p_revision<>r.revision then raise exception 'STALE';end if;
  if s is not null then s:=s-array['challenge_reveal','challenge_viewer'];end if;
  if p_action='bet' then
   if me<>0 or s is not null or r.guest is null or stake<=0 then raise exception 'BET_NOT_READY';end if;
   if w.state in ('offered','running') then raise exception 'BET_ALREADY_RESERVED';end if;
   if (public.bb_shop()->>'coins')::bigint<stake then raise exception 'INSUFFICIENT_COINS';end if;
   insert into public.bb_wagers(room_id,host,guest,amount,rules,expires) values(r.id,r.host,r.guest,stake,jsonb_build_object('game','cards','settings',r.rules),r.expires) returning * into w;r.ready:=false;
  elsif p_action='rules' then
   if me<>0 or s is not null then raise exception 'RULES_LOCKED';end if;
   if jsonb_typeof(p_data) is distinct from 'object' or jsonb_typeof(p_data->'hand') is distinct from 'number' or jsonb_typeof(p_data->'target') is distinct from 'number' or (p_data->>'hand')::int not between 3 and 15 or (p_data->>'target')::int not in(0,100,300,500) or not p_data ?& array['hand','target','stack','until','uno','challenge'] or jsonb_typeof(p_data->'stack') is distinct from 'boolean' or jsonb_typeof(p_data->'until') is distinct from 'boolean' or jsonb_typeof(p_data->'uno') is distinct from 'boolean' or jsonb_typeof(p_data->'challenge') is distinct from 'boolean' then raise exception 'BAD_RULES';end if;
   if coalesce(p_data->>'mode','points') not in ('points','rounds') or coalesce((p_data->>'wins')::int,3) not between 1 and 20 or coalesce((p_data->>'stake')::int,0) not between 0 and 1000000 then raise exception 'BAD_RULES';end if;
   if w.state='offered' then update public.bb_wagers set state='refunded' where id=w.id returning * into w;end if;
   r.rules:=jsonb_build_object('mode',coalesce(p_data->>'mode','points'),'wins',coalesce((p_data->>'wins')::int,3),'stake',coalesce((p_data->>'stake')::int,0),'hand',(p_data->>'hand')::int,'target',(p_data->>'target')::int,'stack',(p_data->>'stack')::boolean,'until',(p_data->>'until')::boolean,'uno',(p_data->>'uno')::boolean,'challenge',(p_data->>'challenge')::boolean);r.ready:=false;
  elsif p_action='ready' then
   if me<>1 or s is not null then raise exception 'BAD_ACTION';end if;
   if stake>0 then
    if w.id is null or w.state<>'offered' or w.guest<>auth.uid() or w.rules->'settings'<>r.rules then raise exception 'BET_NOT_READY';end if;
    if not w.guest_ok then
     if (public.bb_shop()->>'coins')::bigint<stake then raise exception 'INSUFFICIENT_COINS';end if;
     update public.bb_wagers set guest_ok=true where id=w.id returning * into w;
    end if;
   end if;
   r.ready:=coalesce((p_data->>'ready')::boolean,true);
  elsif p_action in ('start','next','reset') then
   if me<>0 or r.guest is null then raise exception 'HOST_ONLY';end if;
   if p_action='reset' then
    if not coalesce((s->>'finished')::boolean,false) then raise exception 'MATCH_ACTIVE';end if;s:=null;r.ready:=false;
   else
    if p_action='start' and (s is not null or not r.ready) then raise exception 'NOT_READY';end if;
    if p_action='next' and (s is null or s->'winner'='null'::jsonb or (s->>'finished')::boolean) then raise exception 'MATCH_ACTIVE';end if;
    if p_action='start' and stake>0 then
     if w.id is null or w.state<>'offered' or not w.host_ok or not w.guest_ok or w.rules->'settings'<>r.rules then raise exception 'BET_NOT_READY';end if;
     update public.bb_wagers set state='running' where id=w.id returning * into w;
    end if;
    s:=public.jj_card_round(r.rules,case when p_action='next' then s->'scores' else '[0,0]'::jsonb end,case when p_action='next' then (s->>'round')::int+1 else 1 end);
    s:=s||jsonb_build_object('round_wins',case when p_action='next' then coalesce(r.game->'round_wins','[0,0]'::jsonb) else '[0,0]'::jsonb end);
   end if;
  else
   if s is null or s->'winner'<>'null'::jsonb then raise exception 'NOT_PLAYING';end if;
   if p_action='uno' then
    if jsonb_array_length(s->'hands'->me)<>1 or s->>'uno_pending' is distinct from me::text then raise exception 'NO_UNO';end if;s:=s||'{"uno_pending":null,"notice":"uno"}'::jsonb;
   elsif p_action='catch' then
    if s->>'uno_pending' is distinct from other::text then raise exception 'NO_UNO';end if;s:=public.jj_card_draw(s,other,2)||'{"uno_pending":null,"notice":"caught"}'::jsonb;
   else
    if (s->>'turn')::int<>me then raise exception 'NOT_YOUR_TURN';end if;
    top_card:=s->'pile'->>(jsonb_array_length(s->'pile')-1);debt:=(s->>'pending')::int;
    if (s->>'needs_color')::boolean then
     if p_action<>'color' or coalesce(p_data->>'color','') not in('r','y','g','b') then raise exception 'CHOOSE_COLOR';end if;
     s:=s||jsonb_build_object('color',p_data->>'color','needs_color',false);
    elsif p_action='challenge' then
     if debt<>4 or s->>'pending_kind'<>'4' or not (r.rules->>'challenge')::boolean or s->'w4_offender'='null'::jsonb then raise exception 'NO_CHALLENGE';end if;
     s:=s||jsonb_build_object('challenge_reveal',s->'w4_hand','challenge_viewer',me);
     if (s->>'w4_illegal')::boolean then s:=s||jsonb_build_object('turn',other,'pending',4,'pending_kind','challenge','penalty_started',true,'notice','challenge_won');
     else s:=s||jsonb_build_object('pending',6,'pending_kind','challenge','penalty_started',true,'notice','challenge_lost');end if;
     s:=s||'{"w4_offender":null,"uno_pending":null}'::jsonb;
    elsif p_action='draw' then
     if s->'drawn'<>'null'::jsonb then raise exception 'ALREADY_DREW';end if;
     s:=s||'{"uno_pending":null}'::jsonb;
     if debt>0 then
      s:=public.jj_card_draw(s,me,1)||jsonb_build_object('pending',debt-1,'penalty_started',true,'uno_pending',null,'notice','penalty_card');
      if debt=1 then s:=s||jsonb_build_object('pending_kind','','turn',other,'penalty_started',false,'w4_offender',null,'notice','penalty');s:=public.jj_card_finish(s,r.rules);end if;
     else
      s:=public.jj_card_draw(s,me,1);card:=s->>'last_draw';
      if public.jj_card_legal(card,top_card,s->>'color') then s:=s||jsonb_build_object('drawn',card,'notice','draw_play_or_pass');
      elsif (r.rules->>'until')::boolean then s:=s||jsonb_build_object('drawn',null,'drawing',true,'notice','keep_drawing');
      else s:=s||jsonb_build_object('turn',other,'drawn',null,'notice','drew');end if;
     end if;
    elsif p_action='pass' then
     if s->'drawn'='null'::jsonb then raise exception 'DRAW_FIRST';end if;s:=s||jsonb_build_object('turn',other,'drawn',null,'drawing',false,'uno_pending',null,'notice','passed');
    elsif p_action='play' then
     card:=p_data->>'card';hand:=s->'hands'->me;
     select ordinality::int-1 into idx from jsonb_array_elements_text(hand) with ordinality where value=card;
     if idx is null then raise exception 'NOT_YOUR_CARD';end if;
     if (coalesce((s->>'drawing')::boolean,false) and s->'drawn'='null'::jsonb) or (s->'drawn'<>'null'::jsonb and card<>s->>'drawn') then raise exception 'DRAWN_CARD_ONLY';end if;
     if debt>0 and (coalesce((s->>'penalty_started')::boolean,false) or not ((r.rules->>'stack')::boolean and s->>'pending_kind'='d' and substr(card,2,1)='d')) then raise exception 'DRAW_PENALTY';end if;
     if debt=0 and not public.jj_card_legal(card,top_card,s->>'color') then raise exception 'ILLEGAL_CARD';end if;
     color:=case when left(card,1)='w' then p_data->>'color' else left(card,1) end;
     if color is null or color not in('r','y','g','b') then raise exception 'CHOOSE_COLOR';end if;
     select exists(select 1 from jsonb_array_elements_text(hand) x where left(x,1)=s->>'color') into illegal;
     if left(card,2)='w4' and not (r.rules->>'challenge')::boolean and illegal then raise exception 'ILLEGAL_DRAW_FOUR';end if;
     hand:=hand-idx;s:=jsonb_set(s,array['hands',me::text],hand);
     s:=s||jsonb_build_object('pile',(s->'pile')||jsonb_build_array(card),'color',color,'turn',case when substr(card,2,1) in('s','r') then me else other end,'drawn',null,'drawing',false,'uno_pending',case when jsonb_array_length(hand)=1 and (r.rules->>'uno')::boolean and not coalesce((p_data->>'uno')::boolean,false) then me else null end,'notice',case when jsonb_array_length(hand)=1 and coalesce((p_data->>'uno')::boolean,false) then 'uno' else 'played' end);
     if substr(card,2,1)='d' then s:=s||jsonb_build_object('pending',debt+2,'pending_kind','d');
     elsif left(card,2)='w4' then s:=s||jsonb_build_object('pending',4,'pending_kind','4','w4_offender',me,'w4_illegal',illegal,'w4_hand',hand);end if;
     -- Even a final +2 remains answerable while stacking is enabled. Penalties are collected one click at a time.
     if (s->>'pending')::int=0 then s:=public.jj_card_finish(s,r.rules);end if;
    else raise exception 'BAD_ACTION';end if;
   end if;
  end if;
  if w.state='running' and coalesce((s->>'finished')::boolean,false) then perform public.jj_cards_pay(w.id,case when (s->>'winner')::int=0 then r.host else r.guest end);end if;
  if w.state in ('offered','running') then update public.bb_wagers set expires=now()+interval '4 hours' where id=w.id;end if;
  update public.jj_card_rooms set rules=r.rules,ready=r.ready,game=s,revision=revision+1,expires=now()+interval '4 hours' where id=r.id returning * into r;
 end if;
 select * into w from public.bb_wagers where room_id=r.id and rules->>'game'='cards' order by created_at desc limit 1;
 wallet:=public.bb_shop();
 result:=jsonb_build_object('coins',(wallet->>'coins')::bigint,'bet',case when w.id is null then null else jsonb_build_object('id',w.id,'amount',w.amount,'state',w.state,'host_ok',w.host_ok,'guest_ok',w.guest_ok,'winner',w.winner) end,'code',r.code,'host',r.host,'guest',r.guest,'me',me,'rules',r.rules,'ready',r.ready,'revision',r.revision,'players',(select jsonb_agg(jsonb_build_object('id',p.id,'name',p.display_name,'handle',p.handle,'skin',coalesce(e.skin,'casual')) order by (p.id=r.host) desc) from public.profiles p left join public.bb_equipped e on e.user_id=p.id where p.id in(r.host,r.guest)));
 if r.game is not null then
  s:=r.game;result:=result||jsonb_build_object('game',(s-array['deck','hands','pile','last_draw','w4_illegal','w4_hand','challenge_reveal','challenge_viewer'])||jsonb_build_object('hand',s->'hands'->me,'reveal',case when (s->>'challenge_viewer')::int=me then s->'challenge_reveal' else 'null'::jsonb end,'drawn',case when (s->>'turn')::int=me then s->'drawn' else 'null'::jsonb end,'counts',jsonb_build_array(jsonb_array_length(s->'hands'->0),jsonb_array_length(s->'hands'->1)),'top',s->'pile'->(jsonb_array_length(s->'pile')-1),'deck_count',jsonb_array_length(s->'deck')));
 end if;
 return result;
end $$;
revoke all on function public.jj_cards_pay(uuid,uuid),public.jj_card_finish(jsonb,jsonb),public.jj_cards(text,text,int,jsonb),public.bb_wager(text,text,uuid,integer,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.jj_cards(text,text,int,jsonb),public.bb_wager(text,text,uuid,integer,jsonb,uuid) to authenticated;
commit;
