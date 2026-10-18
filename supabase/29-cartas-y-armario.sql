-- After SQL 27. Shared skins retain bb_inventory / bb_equipped, no repurchases.
begin;
insert into public.section_visibility(section,visible) values('shop',true),('cards',true) on conflict do nothing;
create table if not exists public.jj_card_rooms(
 id uuid primary key default gen_random_uuid(),code text unique not null,
 host uuid not null references auth.users(id),guest uuid references auth.users(id),
 rules jsonb not null default '{"hand":7,"target":500,"stack":false,"until":false,"uno":true,"challenge":true}',
 ready boolean not null default false,game jsonb,revision integer not null default 1,
 expires timestamptz not null default now()+interval '4 hours',check(host is distinct from guest)
);
alter table public.jj_card_rooms enable row level security;
revoke all on public.jj_card_rooms from public,anon,authenticated;

create or replace function public.jj_card_shuffle(cards jsonb) returns jsonb language sql volatile set search_path='' as $$
 select coalesce(jsonb_agg(value order by random()),'[]'::jsonb) from jsonb_array_elements(cards);
$$;
create or replace function public.jj_card_deck() returns jsonb language plpgsql volatile set search_path='' as $$
declare cards jsonb:='[]';c text;v text;i int;
begin
 foreach c in array array['r','y','g','b'] loop
  cards:=cards||jsonb_build_array(c||'0:0');
  foreach v in array array['1','2','3','4','5','6','7','8','9','s','r','d'] loop
   for i in 1..2 loop cards:=cards||jsonb_build_array(c||v||':'||i);end loop;
  end loop;
 end loop;
 for i in 1..4 loop cards:=cards||jsonb_build_array('wc:'||i,'w4:'||i);end loop;
 return public.jj_card_shuffle(cards);
end $$;
create or replace function public.jj_card_legal(card text,top_card text,color text) returns boolean language sql immutable set search_path='' as $$
 select left(card,1)='w' or left(card,1)=color or (left(top_card,1)<>'w' and substr(card,2,1)=substr(top_card,2,1));
$$;
create or replace function public.jj_card_draw(s jsonb,player int,n int) returns jsonb language plpgsql volatile set search_path='' as $$
declare deck jsonb:=s->'deck';pile jsonb:=s->'pile';hand jsonb:=s->'hands'->player;i int;card text;
begin
 for i in 1..n loop
  if jsonb_array_length(deck)=0 then
   if jsonb_array_length(pile)<=1 then raise exception 'DECK_EXHAUSTED';end if;
   deck:=public.jj_card_shuffle(pile-(jsonb_array_length(pile)-1));pile:=jsonb_build_array(pile->(jsonb_array_length(pile)-1));
  end if;
  card:=deck->>0;deck:=deck-0;hand:=hand||jsonb_build_array(card);
 end loop;
 s:=jsonb_set(s,'{deck}',deck);s:=jsonb_set(s,'{pile}',pile);s:=jsonb_set(s,array['hands',player::text],hand);
 return s||jsonb_build_object('last_draw',card);
end $$;
create or replace function public.jj_card_round(rules jsonb,scores jsonb default '[0,0]',round_no int default 1) returns jsonb language plpgsql volatile set search_path='' as $$
declare deck jsonb;s jsonb;top_card text;i int;
begin
 deck:=public.jj_card_deck();s:=jsonb_build_object('deck',deck,'pile','[]'::jsonb,'hands','[[],[]]'::jsonb,'turn',round_no%2,'pending',0,'pending_kind','','drawn',null,'uno_pending',null,'winner',null,'finished',false,'scores',scores,'round',round_no,'notice','started','needs_color',false,'w4_offender',null,'w4_illegal',false);
 s:=public.jj_card_draw(s,0,(rules->>'hand')::int);s:=public.jj_card_draw(s,1,(rules->>'hand')::int);
 deck:=s->'deck';
 -- A starting +4 is put back and the draw pile reshuffled.
 while left(deck->>0,2)='w4' loop deck:=public.jj_card_shuffle(deck);end loop;
 top_card:=deck->>0;s:=s||jsonb_build_object('deck',deck-0,'pile',jsonb_build_array(top_card),'color',left(top_card,1));
 if left(top_card,2)='wc' then s:=s||'{"needs_color":true}'::jsonb;
 elsif substr(top_card,2,1) in ('s','r') then s:=s||jsonb_build_object('turn',1-(s->>'turn')::int);
 elsif substr(top_card,2,1)='d' then s:=s||'{"pending":2,"pending_kind":"d"}'::jsonb;end if;
 return s;
end $$;
create or replace function public.jj_card_finish(s jsonb,rules jsonb) returns jsonb language plpgsql set search_path='' as $$
declare winner int;points int;total int;
begin
 if s->'winner'<>'null'::jsonb then return s;end if;
 if jsonb_array_length(s->'hands'->0)=0 then winner:=0;
 elsif jsonb_array_length(s->'hands'->1)=0 then winner:=1;
 else return s;end if;
 select coalesce(sum(case when left(value,1)='w' then 50 when substr(value,2,1) in ('s','r','d') then 20 else substr(value,2,1)::int end),0) into points from jsonb_array_elements_text(s->'hands'->(1-winner));
 total:=(s->'scores'->>winner)::int+points;s:=jsonb_set(s,array['scores',winner::text],to_jsonb(total));
 return s||jsonb_build_object('winner',winner,'points',points,'finished',(rules->>'target')::int=0 or total>=(rules->>'target')::int,'notice','round_won');
end $$;

create or replace function public.jj_cards(p_action text default 'read',p_code text default '',p_revision int default null,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.jj_card_rooms;s jsonb;me int;other int;idx int;card text;top_card text;color text;hand jsonb;debt int;illegal boolean;result jsonb;count_drawn int;
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
 if p_action='leave' then
  if me=0 then delete from public.jj_card_rooms where id=r.id;else update public.jj_card_rooms set guest=null,ready=false,game=null,revision=revision+1 where id=r.id;end if;
  return '{}'::jsonb;
 elsif p_action not in ('read','join','create') then
  if p_revision is null or p_revision<>r.revision then raise exception 'STALE';end if;
  if s is not null then s:=s-array['challenge_reveal','challenge_viewer'];end if;
  if p_action='rules' then
   if me<>0 or s is not null then raise exception 'RULES_LOCKED';end if;
   if jsonb_typeof(p_data) is distinct from 'object' or jsonb_typeof(p_data->'hand') is distinct from 'number' or jsonb_typeof(p_data->'target') is distinct from 'number' or (p_data->>'hand')::int not between 3 and 15 or (p_data->>'target')::int not in(0,100,300,500) or not p_data ?& array['hand','target','stack','until','uno','challenge'] or jsonb_typeof(p_data->'stack') is distinct from 'boolean' or jsonb_typeof(p_data->'until') is distinct from 'boolean' or jsonb_typeof(p_data->'uno') is distinct from 'boolean' or jsonb_typeof(p_data->'challenge') is distinct from 'boolean' then raise exception 'BAD_RULES';end if;
   r.rules:=jsonb_build_object('hand',(p_data->>'hand')::int,'target',(p_data->>'target')::int,'stack',(p_data->>'stack')::boolean,'until',(p_data->>'until')::boolean,'uno',(p_data->>'uno')::boolean,'challenge',(p_data->>'challenge')::boolean);r.ready:=false;
  elsif p_action='ready' then if me<>1 or s is not null then raise exception 'BAD_ACTION';end if;r.ready:=coalesce((p_data->>'ready')::boolean,true);
  elsif p_action in ('start','next','reset') then
   if me<>0 or r.guest is null then raise exception 'HOST_ONLY';end if;
   if p_action='reset' then
    if not coalesce((s->>'finished')::boolean,false) then raise exception 'MATCH_ACTIVE';end if;s:=null;r.ready:=false;
   else
    if p_action='start' and (s is not null or not r.ready) then raise exception 'NOT_READY';end if;
    if p_action='next' and (s is null or s->'winner'='null'::jsonb or (s->>'finished')::boolean) then raise exception 'MATCH_ACTIVE';end if;
    s:=public.jj_card_round(r.rules,case when p_action='next' then s->'scores' else '[0,0]'::jsonb end,case when p_action='next' then (s->>'round')::int+1 else 1 end);
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
     if (s->>'w4_illegal')::boolean then s:=public.jj_card_draw(s,(s->>'w4_offender')::int,4)||jsonb_build_object('notice','challenge_won');
     else s:=public.jj_card_draw(s,me,6)||jsonb_build_object('turn',other,'notice','challenge_lost');end if;
     s:=s||'{"pending":0,"pending_kind":"","w4_offender":null,"uno_pending":null}'::jsonb;s:=public.jj_card_finish(s,r.rules);
    elsif p_action='draw' then
     if s->'drawn'<>'null'::jsonb then raise exception 'ALREADY_DREW';end if;
     s:=s||'{"uno_pending":null}'::jsonb;
     if debt>0 then s:=public.jj_card_draw(s,me,debt)||jsonb_build_object('pending',0,'pending_kind','','turn',other,'w4_offender',null,'notice','penalty');s:=public.jj_card_finish(s,r.rules);
     else
      count_drawn:=0;
      loop
       s:=public.jj_card_draw(s,me,1);count_drawn:=count_drawn+1;card:=s->>'last_draw';
       exit when not (r.rules->>'until')::boolean or public.jj_card_legal(card,top_card,s->>'color') or count_drawn>=108;
      end loop;
      if public.jj_card_legal(card,top_card,s->>'color') then s:=s||jsonb_build_object('drawn',card,'notice','draw_play_or_pass');
      else s:=s||jsonb_build_object('turn',other,'drawn',null,'notice','drew');end if;
     end if;
    elsif p_action='pass' then
     if s->'drawn'='null'::jsonb then raise exception 'DRAW_FIRST';end if;s:=s||jsonb_build_object('turn',other,'drawn',null,'uno_pending',null,'notice','passed');
    elsif p_action='play' then
     card:=p_data->>'card';hand:=s->'hands'->me;
     select ordinality::int-1 into idx from jsonb_array_elements_text(hand) with ordinality where value=card;
     if idx is null then raise exception 'NOT_YOUR_CARD';end if;
     if s->'drawn'<>'null'::jsonb and card<>s->>'drawn' then raise exception 'DRAWN_CARD_ONLY';end if;
     if debt>0 and not ((r.rules->>'stack')::boolean and s->>'pending_kind'='d' and substr(card,2,1)='d') then raise exception 'DRAW_PENALTY';end if;
     if debt=0 and not public.jj_card_legal(card,top_card,s->>'color') then raise exception 'ILLEGAL_CARD';end if;
     color:=case when left(card,1)='w' then p_data->>'color' else left(card,1) end;
     if color is null or color not in('r','y','g','b') then raise exception 'CHOOSE_COLOR';end if;
     select exists(select 1 from jsonb_array_elements_text(hand) x where left(x,1)=s->>'color') into illegal;
     if left(card,2)='w4' and not (r.rules->>'challenge')::boolean and illegal then raise exception 'ILLEGAL_DRAW_FOUR';end if;
     hand:=hand-idx;s:=jsonb_set(s,array['hands',me::text],hand);
     s:=s||jsonb_build_object('pile',(s->'pile')||jsonb_build_array(card),'color',color,'turn',case when substr(card,2,1) in('s','r') then me else other end,'drawn',null,'uno_pending',case when jsonb_array_length(hand)=1 and (r.rules->>'uno')::boolean and not coalesce((p_data->>'uno')::boolean,false) then me else null end,'notice',case when jsonb_array_length(hand)=1 and coalesce((p_data->>'uno')::boolean,false) then 'uno' else 'played' end);
     if substr(card,2,1)='d' then s:=s||jsonb_build_object('pending',debt+2,'pending_kind','d');
     elsif left(card,2)='w4' then s:=s||jsonb_build_object('pending',4,'pending_kind','4','w4_offender',me,'w4_illegal',illegal,'w4_hand',hand);end if;
     -- A finishing +2 is paid before scoring. A finishing +4 can still be challenged.
     if jsonb_array_length(hand)=0 and (s->>'pending')::int>0 and (s->>'pending_kind'<>'4' or not (r.rules->>'challenge')::boolean) then
      s:=public.jj_card_draw(s,other,(s->>'pending')::int)||'{"pending":0,"pending_kind":""}'::jsonb;
     end if;
     if (s->>'pending')::int=0 then s:=public.jj_card_finish(s,r.rules);end if;
    else raise exception 'BAD_ACTION';end if;
   end if;
  end if;
  update public.jj_card_rooms set rules=r.rules,ready=r.ready,game=s,revision=revision+1,expires=now()+interval '4 hours' where id=r.id returning * into r;
 end if;
 result:=jsonb_build_object('code',r.code,'host',r.host,'guest',r.guest,'me',me,'rules',r.rules,'ready',r.ready,'revision',r.revision,'players',(select jsonb_agg(jsonb_build_object('id',p.id,'name',p.display_name,'handle',p.handle,'skin',coalesce(e.skin,'casual')) order by (p.id=r.host) desc) from public.profiles p left join public.bb_equipped e on e.user_id=p.id where p.id in(r.host,r.guest)));
 if r.game is not null then
  s:=r.game;result:=result||jsonb_build_object('game',(s-array['deck','hands','pile','last_draw','w4_illegal','w4_hand','challenge_reveal','challenge_viewer'])||jsonb_build_object('hand',s->'hands'->me,'reveal',case when (s->>'challenge_viewer')::int=me then s->'challenge_reveal' else 'null'::jsonb end,'drawn',case when (s->>'turn')::int=me then s->'drawn' else 'null'::jsonb end,'counts',jsonb_build_array(jsonb_array_length(s->'hands'->0),jsonb_array_length(s->'hands'->1)),'top',s->'pile'->(jsonb_array_length(s->'pile')-1),'deck_count',jsonb_array_length(s->'deck')));
 end if;
 return result;
end $$;
revoke all on function public.jj_card_shuffle(jsonb),public.jj_card_deck(),public.jj_card_legal(text,text,text),public.jj_card_draw(jsonb,int,int),public.jj_card_round(jsonb,jsonb,int),public.jj_card_finish(jsonb,jsonb),public.jj_cards(text,text,int,jsonb) from public,anon,authenticated;
grant execute on function public.jj_cards(text,text,int,jsonb) to authenticated;
commit;
