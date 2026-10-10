-- Ejecutar después de SQL 22. Conserva regalos y progreso. Se puede ejecutar otra vez.
begin;
alter table public.proposal_gifts add column if not exists playlist_enabled boolean not null default false;
alter table public.proposal_gifts add column if not exists tracks jsonb not null default '[]';
alter table public.proposal_state add column if not exists playlist_solved int[] not null default '{}';
create or replace function public.jj_proposal(p_action text default 'read',p_data jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare s public.proposal_state; owner boolean; n int; a int; b int; t int; result jsonb; gs jsonb; dx int; dy int; px int; py int; level int; found jsonb; stars jsonb; idx int; j int; exp jsonb; k text;
begin
 if not public.is_member() then raise exception 'NOT_MEMBER'; end if;
 owner:=public.is_jesus();
 select * into s from public.proposal_state where id=1 for update;
 if p_action='playlist_solve' then
  n:=(p_data->>'id')::int;
  if owner or not s.live or n is distinct from 2 or not n=any(s.opened) then raise exception 'RECIPIENT_ONLY';end if;
  if not exists(select 1 from public.proposal_gifts where id=n and playlist_enabled) then raise exception 'BAD_PLAYLIST';end if;
  if regexp_replace(upper(coalesce(p_data->>'answer','')),'[^A-Z]','','g')<>'ILOVEYOUJULISSA' then raise exception 'BAD_ANSWER';end if;
  update public.proposal_state set playlist_solved=array(select distinct x from unnest(playlist_solved||array[n]) x order by x) where id=1;
 elsif p_action='comic_visit' then
  j:=(p_data->>'page')::int;
  if owner or not s.live or not 1=any(s.opened) or j is null or j not between 1 and 4 then raise exception 'RECIPIENT_ONLY';end if;
  select experience into exp from public.proposal_gifts where id=1;
  if coalesce(exp->>('page'||j),'')='' then raise exception 'EMPTY_PAGE';end if;
  exp:=coalesce(s.exploration->'1','[]');if not exp @> to_jsonb(array[j]) then exp:=exp||to_jsonb(j);end if;
  update public.proposal_state set exploration=jsonb_set(exploration,array['1'],exp) where id=1;
 elsif p_action='visit' then
  n:=(p_data->>'id')::int;j:=(p_data->>'item')::int;
  if owner or not s.live or n not between 7 and 9 or j not between 1 and 6 or n is null or j is null or not n=any(s.opened) then raise exception 'RECIPIENT_ONLY';end if;
  select experience into exp from public.proposal_gifts where id=n;k:='item'||j;
  if coalesce(exp->>(k||'_title_es'),'')='' then raise exception 'EMPTY_ITEM';end if;
  if coalesce(exp->>(k||'_date'),'')<>'' and (exp->>(k||'_date'))::date>current_date then raise exception 'LOCKED_ENVELOPE';end if;
  exp:=coalesce(s.exploration->n::text,'[]');if not exp @> to_jsonb(array[j]) then exp:=exp||to_jsonb(j);end if;
  update public.proposal_state set exploration=jsonb_set(exploration,array[n::text],exp) where id=1;
 elsif p_action in ('game_move','game_restart') then
  if owner or not s.live or not 6=any(s.opened) then raise exception 'RECIPIENT_ONLY'; end if;
  gs:=s.game;
  if p_action='game_restart' then
   if not coalesce((gs->>'done')::boolean,false) then raise exception 'GAME_NOT_FINISHED'; end if;
   gs:='{"stage":1,"x":1,"y":5,"found":[],"stars":[],"done":false}'::jsonb;
  elsif not (gs->>'done')::boolean then
   dx:=(p_data->>'dx')::int;dy:=(p_data->>'dy')::int;
   if dx is null or dy is null or abs(dx)+abs(dy)<>1 then raise exception 'BAD_MOVE'; end if;
   px:=(gs->>'x')::int+dx;py:=(gs->>'y')::int+dy;level:=(gs->>'stage')::int;
   if px not between 1 and 8 or py not between 1 and 5 then raise exception 'BAD_MOVE'; end if;
   if level=1 and (px::text||','||py::text)=any(array['4,2','4,3','4,4','6,4']) then raise exception 'BAD_MOVE'; end if;
   if level=2 and not (px::text||','||py::text)=any(array['1,5','2,5','2,4','3,4','4,4','4,3','5,3','6,3','6,2','7,2','8,2','8,1']) then raise exception 'BAD_MOVE'; end if;
   if level=3 and (px::text||','||py::text)=any(array['4,3','5,3','4,4','5,4']) then raise exception 'BAD_MOVE'; end if;
   found:=gs->'found';stars:=gs->'stars';idx:=null;
   if level=1 then
    idx:=case when px=2 and py=1 then 0 when px=7 and py=2 then 1 when px=4 and py=5 then 2 else null end;
    if idx is not null and not found @> to_jsonb(array[idx]) then found:=found||to_jsonb(idx); end if;
    if px=8 and py=1 and jsonb_array_length(found)=3 then level:=2;px:=1;py:=5; end if;
   elsif level=2 then
    idx:=case when px=3 and py=4 then 0 when px=5 and py=3 then 1 when px=7 and py=2 then 2 else null end;
    if idx is not null and not stars @> to_jsonb(array[idx]) then stars:=stars||to_jsonb(idx); end if;
    if px=8 and py=1 and jsonb_array_length(stars)=3 then level:=3;px:=1;py:=5; end if;
   end if;
   gs:=jsonb_build_object('stage',level,'x',px,'y',py,'found',found,'stars',stars,'done',level=3 and px=8 and py=2);
  end if;
  update public.proposal_state set game=gs where id=1;
 elsif p_action='save' then
  if not owner or s.live then raise exception 'EDIT_LOCKED'; end if;
  n:=(p_data->>'id')::int;
  if n not between 1 and 9 or n is null then raise exception 'BAD_GIFT'; end if;
  if length(coalesce(p_data->>'title_es',''))>120 or length(coalesce(p_data->>'title_en',''))>120 or length(coalesce(p_data->>'body_es',''))>5000 or length(coalesce(p_data->>'body_en',''))>5000 then raise exception 'TOO_LONG'; end if;
  if coalesce(p_data->>'spotify','')<>'' and (p_data->>'spotify') !~ '^https://open[.]spotify[.]com/(track|playlist)/[A-Za-z0-9]{22}$' then raise exception 'BAD_SPOTIFY'; end if;
  if coalesce(p_data->>'path','')<>'' and not exists(select 1 from storage.objects where bucket_id='jj-gifts' and name=p_data->>'path' and (storage.foldername(name))[1]=auth.uid()::text) then raise exception 'BAD_FILE'; end if;
  if (coalesce(p_data->>'path','')='')<>(coalesce(p_data->>'media','')='') then raise exception 'BAD_MEDIA'; end if;
  if coalesce((p_data->>'ready')::boolean,false) and (length(trim(coalesce(p_data->>'title_es','')))=0 or length(trim(coalesce(p_data->>'title_en','')))=0 or length(trim(coalesce(p_data->>'body_es','')))=0 or length(trim(coalesce(p_data->>'body_en','')))=0) then raise exception 'BOTH_LANGUAGES'; end if;
  if p_data ? 'experience' then
   if jsonb_typeof(p_data->'experience')<>'object' or length((p_data->'experience')::text)>60000 then raise exception 'BAD_EXPERIENCE'; end if;
   for result in select to_jsonb(x) from jsonb_each_text(p_data->'experience') x loop
    if result->>'key' not in ('page1','page2','page3','page4','cover','outro','lines_es','lines_en','destinations_es','destinations_en','memory1_es','memory1_en','memory2_es','memory2_en','memory3_es','memory3_en','night1_es','night1_en','night2_es','night2_en','night3_es','night3_en','final_es','final_en') and result->>'key' !~ '^item[1-6]_(title_es|title_en|body_es|body_en|file|media|date)$' then raise exception 'BAD_EXPERIENCE'; end if;
    if result->>'key' like '%_date' and coalesce(result->>'value','')<>'' then perform (result->>'value')::date;end if;
    if result->>'key' like '%_media' and result->>'value' not in ('','image','audio','video') then raise exception 'BAD_MEDIA';end if;
    if result->>'key' ~ '^item[1-6]_file$' and coalesce(result->>'value','')<>'' and not exists(select 1 from storage.objects where bucket_id='jj-gifts' and name=result->>'value' and (storage.foldername(name))[1]=auth.uid()::text) then raise exception 'BAD_FILE';end if;
    if result->>'key' in ('cover','outro','page1','page2','page3','page4') and coalesce(result->>'value','')<>'' and not exists(select 1 from storage.objects where bucket_id='jj-gifts' and name=result->>'value' and (storage.foldername(name))[1]=auth.uid()::text) then raise exception 'BAD_FILE'; end if;
   end loop;
  end if;
  if n=1 and coalesce((p_data->>'ready')::boolean,false) and coalesce(p_data->'experience'->>'page1','')<>'' then
   for j in 1..4 loop
    if coalesce(p_data->'experience'->>('page'||j),'')='' then raise exception 'FOUR_PAGES';end if;
   end loop;
  end if;
  if n between 7 and 9 and coalesce((p_data->>'ready')::boolean,false) then
   exp:=coalesce(p_data->'experience','{}');a:=0;
   for j in 1..6 loop
    k:='item'||j;
    if coalesce(exp->>(k||'_title_es'),'')<>'' then
     a:=a+1;
     if trim(coalesce(exp->>(k||'_title_en'),''))='' or trim(coalesce(exp->>(k||'_body_es'),''))='' or trim(coalesce(exp->>(k||'_body_en'),''))='' then raise exception 'BOTH_LANGUAGES';end if;
     if (coalesce(exp->>(k||'_file'),'')='')<>(coalesce(exp->>(k||'_media'),'')='') then raise exception 'BAD_MEDIA';end if;
    end if;
   end loop;
   if a=0 then raise exception 'EMPTY_EXPERIENCE';end if;
  end if;
  if p_data ? 'playlist_enabled' then
   if n<>2 then raise exception 'BAD_PLAYLIST';end if;
   if coalesce((p_data->>'playlist_enabled')::boolean,false) then
    if jsonb_typeof(p_data->'tracks') is distinct from 'array' then raise exception 'BAD_PLAYLIST';end if;
    if jsonb_array_length(p_data->'tracks')<>15 then raise exception 'BAD_PLAYLIST';end if;
    for j in 0..14 loop
     exp:=p_data->'tracks'->j;
     if jsonb_typeof(exp) is distinct from 'object' or length(trim(coalesce(exp->>'title','')))=0 or length(trim(coalesce(exp->>'artist','')))=0 or length(exp->>'title')>160 or length(exp->>'artist')>160 then raise exception 'BAD_PLAYLIST';end if;
     if left(translate(upper(trim(exp->>'title')),'ÁÉÍÓÚÜÑ','AEIOUUN'),1)<>substr('ILOVEYOUJULISSA',j+1,1) then raise exception 'BAD_PLAYLIST';end if;
     if coalesce(exp->>'url','')<>'' and (exp->>'url') !~ '^https://open[.]spotify[.]com/(track|playlist)/[A-Za-z0-9]{22}$' then raise exception 'BAD_SPOTIFY';end if;
    end loop;
   end if;
   update public.proposal_gifts set playlist_enabled=coalesce((p_data->>'playlist_enabled')::boolean,false),tracks=case when coalesce((p_data->>'playlist_enabled')::boolean,false) then p_data->'tracks' else '[]'::jsonb end where id=n;
   update public.proposal_state set playlist_solved=array_remove(playlist_solved,n) where id=1;
  end if;
  update public.proposal_gifts set experience=coalesce(p_data->'experience',experience),title_es=coalesce(p_data->>'title_es',''),title_en=coalesce(p_data->>'title_en',''),body_es=coalesce(p_data->>'body_es',''),body_en=coalesce(p_data->>'body_en',''),path=coalesce(p_data->>'path',''),media=coalesce(p_data->>'media',''),spotify=coalesce(p_data->>'spotify',''),ready=coalesce((p_data->>'ready')::boolean,false) where id=n;
 elsif p_action='publish' then
  if not owner then raise exception 'OWNER_ONLY'; end if;
  if (select count(*) from public.proposal_gifts where ready)<>9 then raise exception 'NINE_READY'; end if;
  update public.proposal_state set live=true where id=1;
 elsif p_action='reveal' then
  if not owner then raise exception 'OWNER_ONLY'; end if;
  if not s.live or not s.solved then raise exception 'NOT_SOLVED'; end if;
  update public.proposal_state set revealed=true where id=1;
 elsif p_action in('open','claim','swap') then
  if owner or not s.live then raise exception 'RECIPIENT_ONLY'; end if;
  if p_action in('open','claim') then
   n:=(p_data->>'id')::int;
   if n is null or n not between 1 and 9 then raise exception 'BAD_GIFT'; end if;
   if p_action='open' then
    update public.proposal_state set opened=array(select distinct x from unnest(opened||array[n]) x order by x) where id=1;
   else
    if n=2 and not n=any(s.claimed) and exists(select 1 from public.proposal_gifts where id=n and playlist_enabled) and not n=any(s.playlist_solved) then raise exception 'PLAYLIST_FIRST';end if;
    if n between 7 and 9 then
     select experience into exp from public.proposal_gifts where id=n;
     for j in 1..6 loop
      if coalesce(exp->>('item'||j||'_title_es'),'')<>'' and (coalesce(exp->>('item'||j||'_date'),'')='' or (exp->>('item'||j||'_date'))::date<=current_date) and not coalesce(s.exploration->n::text,'[]') @> to_jsonb(array[j]) then raise exception 'EXPLORE_FIRST';end if;
     end loop;
    end if;
    if n=6 and not n=any(s.claimed) and not (s.game->>'done')::boolean then raise exception 'GAME_NOT_FINISHED'; end if;
    if not n=any(s.opened) then raise exception 'OPEN_FIRST'; end if;
    if n=1 and not n=any(s.claimed) then
     select experience into exp from public.proposal_gifts where id=1;
     for j in 1..4 loop
      if coalesce(exp->>('page'||j),'')<>'' and not coalesce(s.exploration->'1','[]') @> to_jsonb(array[j]) then raise exception 'READ_COMIC_FIRST';end if;
     end loop;
    end if;
    update public.proposal_state set claimed=array(select distinct x from unnest(claimed||array[n]) x order by x) where id=1;
   end if;
  else
   if cardinality(s.claimed)<>9 then raise exception 'NINE_PIECES'; end if;
   if (p_data->>'version')::int is distinct from s.version then raise exception 'STALE_BOARD'; end if;
   a:=(p_data->>'a')::int+1;b:=(p_data->>'b')::int+1;
   if a is null or b is null or a not between 1 and 9 or b not between 1 and 9 or a=b or s.solved then raise exception 'BAD_SWAP'; end if;
   t:=s.board[a];s.board[a]:=s.board[b];s.board[b]:=t;
   update public.proposal_state set board=s.board,version=version+1,solved=(s.board=array[0,1,2,3,4,5,6,7,8]) where id=1;
  end if;
 elsif p_action<>'read' then raise exception 'BAD_ACTION'; end if;
 select * into s from public.proposal_state where id=1;
 select coalesce(jsonb_agg(case when owner or (s.live and id=any(s.opened)) then to_jsonb(g)||jsonb_build_object('experience',public.jj_visible_experience(g.experience,owner)) else jsonb_build_object('id',id) end order by id),'[]') into result from public.proposal_gifts g;
 return jsonb_build_object('playlistSolved',s.playlist_solved,'game',case when owner or (s.live and 6=any(s.opened)) then s.game else null end,'today',current_date,'exploration',s.exploration,'live',s.live,'claimed',s.claimed,'opened',s.opened,'solved',s.solved,'revealed',s.revealed,'version',s.version,'board',case when owner or cardinality(s.claimed)=9 then to_jsonb(s.board) else 'null'::jsonb end,'gifts',result,'question',case when s.revealed then jsonb_build_object('es','¿Puedo ser tu novio?','en','Can I be your boyfriend?') else 'null'::jsonb end);
end $$;
revoke all on function public.jj_proposal(text,jsonb) from public,anon;
grant execute on function public.jj_proposal(text,jsonb) to authenticated;
commit;

