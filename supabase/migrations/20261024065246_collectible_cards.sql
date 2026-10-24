-- A private collection. Nothing enables the section for Julissa automatically.
create schema if not exists jj_collect;
revoke all on schema jj_collect from public,anon;
grant usage on schema jj_collect to authenticated;
insert into public.section_visibility(section,visible) values('collection',false) on conflict do nothing;
create table jj_collect.catalog(id text primary key,data jsonb not null);
create table jj_collect.accounts(user_id uuid primary key references auth.users(id),fragments int not null default 0 check(fragments>=0),pity int not null default 0,starter boolean not null default false);
create table jj_collect.offers(id uuid primary key default gen_random_uuid(),sender uuid not null references auth.users(id),recipient uuid not null references auth.users(id),give uuid[] not null,want uuid[] not null,give_jj int not null check(give_jj>=0),want_jj int not null check(want_jj>=0),state text not null default 'pending',details jsonb not null default '{}',parent uuid references jj_collect.offers(id),created_at timestamptz not null default now(),expires timestamptz not null default now()+interval '7 days',check(sender<>recipient));
create table jj_collect.inventory(id uuid primary key default gen_random_uuid(),owner uuid not null references auth.users(id),card text not null references jj_collect.catalog(id),favorite boolean not null default false,reserved uuid references jj_collect.offers(id),state text not null default 'owned',origin text not null,acquired timestamptz not null default now());
create index collect_owner on jj_collect.inventory(owner,state);
create table jj_collect.discoveries(user_id uuid not null references auth.users(id),card text not null references jj_collect.catalog(id),primary key(user_id,card));
create table jj_collect.wishes(user_id uuid not null references auth.users(id),card text not null references jj_collect.catalog(id),primary key(user_id,card));
create table jj_collect.claims(user_id uuid not null references auth.users(id),milestone int not null,primary key(user_id,milestone));
create table jj_collect.requests(user_id uuid not null references auth.users(id),request uuid not null,action text not null,data jsonb not null,result jsonb not null,primary key(user_id,request));
insert into jj_collect.catalog values('nu-001','{"id": "nu-001", "number": 1, "name_es": "Pieza a pieza", "name_en": "Piece by Piece", "character": "jesus", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Contigo aprendí que lo bonito también se construye despacito.", "dedication_en": "With you, I learned that beautiful things can be built one little piece at a time.", "art": 0, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-002','{"id": "nu-002", "number": 2, "name_es": "El regalo que cuida", "name_en": "A Gift That Cares", "character": "julisa", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "No fue solo una billetera: fue darme cuenta de que te fijas en mí.", "dedication_en": "It was more than a wallet: it showed me that you pay attention to me.", "art": 1, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-003','{"id": "nu-003", "number": 3, "name_es": "Nuestra fila del cine", "name_en": "Our Cinema Row", "character": "duo", "theme": "recuerdos", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "De todas las historias de esa pantalla, mi favorita empezaba a mi lado.", "dedication_en": "Of all the stories on that screen, my favorite was beginning beside me.", "art": 2, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-004','{"id": "nu-004", "number": 4, "name_es": "Al mismo paso", "name_en": "In Step", "character": "duo", "theme": "recuerdos", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "No necesito llegar primero; me gusta caminar contigo.", "dedication_en": "I do not need to get there first; I love walking with you.", "art": 3, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-005','{"id": "nu-005", "number": 5, "name_es": "Mi partida favorita", "name_en": "My Favorite Game", "character": "jesus", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Hasta una partida cualquiera se vuelve especial cuando puedo compartirla contigo.", "dedication_en": "Even an ordinary game becomes special when I get to share it with you.", "art": 4, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-006','{"id": "nu-006", "number": 6, "name_es": "Tu mundo en colores", "name_en": "Your World in Color", "character": "julisa", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Me encanta descubrir las cosas que imaginas y cómo miras el mundo.", "dedication_en": "I love discovering what you imagine and how you see the world.", "art": 5, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-007','{"id": "nu-007", "number": 7, "name_es": "Julie, Julie, Julie", "name_en": "Julie, Julie, Julie", "character": "duo", "theme": "recuerdos", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "A veces repito tu nombre porque escuchar tu respuesta me hace sonreír.", "dedication_en": "Sometimes I repeat your name because hearing your answer makes me smile.", "art": 6, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-008','{"id": "nu-008", "number": 8, "name_es": "Un café y nosotros", "name_en": "Coffee and Us", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "No hace falta un plan enorme para que un ratito contigo se quede conmigo.", "dedication_en": "We do not need a grand plan for a little time with you to stay with me.", "art": 7, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-009','{"id": "nu-009", "number": 9, "name_es": "Un futuro entre apuntes", "name_en": "A Future Between Notes", "character": "jesus", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Entre trabajo y tareas, imaginar nuestros próximos momentos me da ilusión.", "dedication_en": "Between work and homework, looking forward to our next moments makes me happy.", "art": 8, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-010','{"id": "nu-010", "number": 10, "name_es": "Tu pausa favorita", "name_en": "Your Favorite Pause", "character": "julisa", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Ojalá este pequeño rincón también te acompañe cuando necesites descansar.", "dedication_en": "I hope this little corner keeps you company whenever you need to rest.", "art": 9, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-011','{"id": "nu-011", "number": 11, "name_es": "Otoño compartido", "name_en": "Our Autumn", "character": "duo", "theme": "temporadas", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Este otoño tiene algo que los otros no tenían: recuerdos contigo.", "dedication_en": "This autumn has something the others did not: memories with you.", "art": 10, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-012','{"id": "nu-012", "number": 12, "name_es": "Cabe otro corazón", "name_en": "Room for One More Heart", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Si el día se pone gris, todavía podemos buscar un lugarcito donde reír.", "dedication_en": "If the day turns gray, we can still find a little place to laugh.", "art": 11, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-013','{"id": "nu-013", "number": 13, "name_es": "Samurái de luna azul", "name_en": "Blue Moon Samurai", "character": "jesus", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "En esta aventura imaginaria, mi lugar favorito sigue siendo a tu lado.", "dedication_en": "In this imaginary adventure, my favorite place is still beside you.", "art": 12, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-014','{"id": "nu-014", "number": 14, "name_es": "Reina de las rosas", "name_en": "Queen of Roses", "character": "julisa", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Hasta vestida de vampira tienes ese poder de hacerme sonreír.", "dedication_en": "Even dressed as a vampire, you have that power to make me smile.", "art": 13, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-015','{"id": "nu-015", "number": 15, "name_es": "Dos hechizos, un encuentro", "name_en": "Two Spells, One Meeting", "character": "duo", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Si lo nuestro fuera magia, empezaría con una conversación que no quiero terminar.", "dedication_en": "If we were magic, it would begin with a conversation I never want to end.", "art": 14, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-016','{"id": "nu-016", "number": 16, "name_es": "Piloto entre estrellas", "name_en": "Pilot Among Stars", "character": "jesus", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Inventaría mil destinos, pero guardaría un asiento para ti.", "dedication_en": "I could dream up a thousand destinations, and I would save you a seat.", "art": 15, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-017','{"id": "nu-017", "number": 17, "name_es": "Guardiana del santuario", "name_en": "Shrine Guardian", "character": "julisa", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Hay una ternura en ti que vuelve especial hasta un mundo inventado.", "dedication_en": "There is a tenderness in you that makes even an imaginary world special.", "art": 16, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-018','{"id": "nu-018", "number": 18, "name_es": "Abrigo de invierno", "name_en": "Winter Warmth", "character": "duo", "theme": "temporadas", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Me hace ilusión pensar en todas las estaciones que nos falta conocer juntos.", "dedication_en": "I love thinking about all the seasons we have yet to discover together.", "art": 17, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-019','{"id": "nu-019", "number": 19, "name_es": "Conversaciones de azotea", "name_en": "Rooftop Conversations", "character": "duo", "theme": "recuerdos", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Cuando hablamos de cualquier cosa, siento que puedo ser yo contigo.", "dedication_en": "When we talk about anything at all, I feel I can be myself with you.", "art": 18, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-020','{"id": "nu-020", "number": 20, "name_es": "Donde florecemos", "name_en": "Where We Bloom", "character": "duo", "theme": "temporadas", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Lo que más quiero cuidar no es una flor: es la confianza que vamos construyendo.", "dedication_en": "What I most want to care for is not a flower, but the trust we are building.", "art": 19, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-021','{"id": "nu-021", "number": 21, "name_es": "Caballero del amanecer", "name_en": "Knight of Dawn", "character": "jesus", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Quiero acompañarte en tus aventuras y alegrarme de verte elegir tu camino.", "dedication_en": "I want to share your adventures and be happy watching you choose your own path.", "art": 20, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-022','{"id": "nu-022", "number": 22, "name_es": "Hechicera lunar", "name_en": "Moon Sorceress", "character": "julisa", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Hay muchas estrellas en este álbum, pero ninguna sustituye tu forma de ser.", "dedication_en": "There are many stars in this album, but none can replace who you are.", "art": 21, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-023','{"id": "nu-023", "number": 23, "name_es": "Palacio de cristal", "name_en": "Crystal Palace", "character": "duo", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Nuestro pequeño mundo se hace más grande con cada recuerdo compartido.", "dedication_en": "Our little world grows bigger with every memory we share.", "art": 22, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-024','{"id": "nu-024", "number": 24, "name_es": "Un reino para dos", "name_en": "A Kingdom for Two", "character": "duo", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Si me regalas un ratito de tu día, ya tengo algo precioso que atesorar.", "dedication_en": "If you share a little of your day with me, I already have something precious to treasure.", "art": 23, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-025','{"id": "nu-025", "number": 25, "name_es": "El hilo que elegimos", "name_en": "The Thread We Choose", "character": "duo", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Me gusta pensar que, además de encontrarnos, seguimos eligiendo conocernos.", "dedication_en": "I love thinking that beyond finding each other, we keep choosing to know each other.", "art": 24, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-026','{"id": "nu-026", "number": 26, "name_es": "Alas de un mismo cielo", "name_en": "Wings Under One Sky", "character": "duo", "theme": "fantasia", "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "Quiero que lo nuestro deje espacio para tus sueños y para los míos.", "dedication_en": "I want what we share to leave room for your dreams and mine.", "art": 25, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-027','{"id": "nu-027", "number": 27, "name_es": "El jardín de las horas", "name_en": "The Garden of Hours", "character": "duo", "theme": "fantasia", "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "No puedo detener el tiempo, pero puedo cuidar cómo lo comparto contigo.", "dedication_en": "I cannot stop time, but I can care for the way I spend it with you.", "art": 26, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-028','{"id": "nu-028", "number": 28, "name_es": "Bajo la misma estrella", "name_en": "Under the Same Star", "character": "duo", "theme": "recuerdos", "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "No sé todo lo que viene; sí sé que me ilusiona seguir descubriéndolo contigo.", "dedication_en": "I do not know everything ahead; I do know I am excited to keep discovering it with you.", "art": 27, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-029','{"id": "nu-029", "number": 29, "name_es": "Jesús.EXE · reinicio dulce", "name_en": "Jesus.EXE · Sweet Reboot", "character": "jesus", "theme": "alternativo", "rarity": 4, "sell": 650, "scrap": 90, "craft": 500, "dedication_es": "Si mi mundo se llena de errores, una risa contigo siempre mejora el día.", "dedication_en": "When my world fills with errors, laughing with you always makes the day better.", "art": 28, "collection": "primer-universo"}'::jsonb);
insert into jj_collect.catalog values('nu-030','{"id": "nu-030", "number": 30, "name_es": "Julissa.EXE · corazón neón", "name_en": "Julissa.EXE · Neon Heart", "character": "julisa", "theme": "alternativo", "rarity": 4, "sell": 650, "scrap": 90, "craft": 500, "dedication_es": "Entre mil universos imposibles, me sigue encantando la Julissa real que voy conociendo.", "dedication_en": "Among a thousand impossible universes, I still love getting to know the real Julissa.", "art": 29, "collection": "primer-universo"}'::jsonb);
do $$ declare t text;begin foreach t in array array['catalog','accounts','offers','inventory','discoveries','wishes','claims','requests'] loop execute format('alter table jj_collect.%I enable row level security',t);execute format('revoke all on jj_collect.%I from public,anon,authenticated',t);end loop;end $$;
create function jj_collect.credit(u uuid,delta int,why text,details jsonb default '{}') returns void language sql set search_path='' as $$
 insert into public.jj_money_log(user_id,request,kind,data,jj,jxj,result) values(u,gen_random_uuid(),'collect_'||why,details,delta,0,details);
$$;
revoke all on function jj_collect.credit(uuid,int,text,jsonb) from public,anon,authenticated;
create function jj_collect.api(p_action text,p_request uuid,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid();peer uuid;u record;o jj_collect.offers;item jj_collect.inventory;account jj_collect.accounts;previous jj_collect.requests;obj jsonb;payload jsonb:='{}';cards jsonb:='[]';r int;roll int;cid text;i int;total int:=0;ids uuid[];give_ids uuid[];want_ids uuid[];give_coins int;want_coins int;new_offer uuid;parent_id uuid;counted int;bonus int;had_high boolean:=false;forced boolean:=false;
begin
 if me is null or not public.is_member() then raise exception 'NOT_MEMBER';end if;
 if not public.is_jesus() and not coalesce((select visible from public.section_visibility where section='collection'),false) then raise exception 'SECTION_HIDDEN';end if;
 -- All wallet operations use the same lock as the existing shop, in deterministic user order.
 for u in select id from public.profiles where handle in('jesus','julisa') order by id loop perform pg_advisory_xact_lock(hashtextextended(u.id::text,25));end loop;
 select id into peer from public.profiles where id<>me and handle in('jesus','julisa') limit 1;
 insert into jj_collect.accounts(user_id) values(me) on conflict do nothing;
 select * into account from jj_collect.accounts where user_id=me for update;
 for o in select * from jj_collect.offers where state='pending' and expires<=now() and me in(sender,recipient) for update loop
  update jj_collect.offers set state='expired' where id=o.id;
  update jj_collect.inventory set reserved=null where reserved=o.id;
  if o.give_jj>0 then perform jj_collect.credit(o.sender,o.give_jj,'refund',jsonb_build_object('offer',o.id));end if;
 end loop;
 if p_action<>'read' then
  if p_request is null or jsonb_typeof(p_data) is distinct from 'object' then raise exception 'REQUEST_REQUIRED';end if;
  select * into previous from jj_collect.requests where user_id=me and request=p_request;
  if found then
   if previous.action<>p_action or previous.data<>p_data then raise exception 'REQUEST_MISMATCH';end if;
   payload:=previous.result;
  else
   if p_action in('pack','starter') then
    if p_action='starter' and account.starter then raise exception 'ALREADY_CLAIMED';end if;
    if p_action='pack' then
     if (public.bb_shop()->>'coins')::bigint<30 then raise exception 'INSUFFICIENT_COINS';end if;
     perform jj_collect.credit(me,-30,'pack');
    end if;
    for i in 1..3 loop
     roll:=floor(random()*10000)::int;
     r:=case when roll<7000 then 0 when roll<9000 then 1 when roll<9800 then 2 when roll<9970 then 3 else 4 end;
     if i=3 and account.pity>=9 and not had_high and r<2 then r:=2;forced:=true;end if;
     had_high:=had_high or r>=2;
     select id into cid from jj_collect.catalog where (data->>'rarity')::int=r order by random() limit 1;
     insert into jj_collect.inventory(owner,card,origin) values(me,cid,p_action) returning * into item;
     insert into jj_collect.discoveries values(me,cid) on conflict do nothing;
     cards:=cards||jsonb_build_array(jsonb_build_object('id',item.id,'card',cid));
    end loop;
    update jj_collect.accounts set starter=starter or p_action='starter',pity=case when had_high then 0 else pity+1 end where user_id=me;
    payload:=jsonb_build_object('cards',cards,'cost',case when p_action='pack' then 30 else 0 end,'guaranteed',forced);
   elsif p_action in('sell','recycle','favorite') then
    select * into item from jj_collect.inventory where id=(p_data->>'id')::uuid and owner=me and state='owned' for update;
    if item.id is null then raise exception 'NOT_OWNED';end if;
    if item.reserved is not null then raise exception 'CARD_RESERVED';end if;
    if p_action='favorite' then update jj_collect.inventory set favorite=coalesce((p_data->>'value')::boolean,false) where id=item.id;
    else
     if item.favorite then raise exception 'CARD_FAVORITE';end if;
     select data into obj from jj_collect.catalog where id=item.card;
     update jj_collect.inventory set state=case when p_action='sell' then 'sold' else 'recycled' end where id=item.id;
     if p_action='sell' then total:=(obj->>'sell')::int;perform jj_collect.credit(me,total,'sale',jsonb_build_object('card',item.card,'copy',item.id));
     else total:=(obj->>'scrap')::int;update jj_collect.accounts set fragments=fragments+total where user_id=me;end if;
     payload:=jsonb_build_object('amount',total);
    end if;
   elsif p_action='craft' then
    cid:=p_data->>'card';select data into obj from jj_collect.catalog where id=cid;
    if obj is null then raise exception 'BAD_CARD';end if;
    total:=(obj->>'craft')::int;
    if account.fragments<total then raise exception 'INSUFFICIENT_FRAGMENTS';end if;
    update jj_collect.accounts set fragments=fragments-total where user_id=me;
    insert into jj_collect.inventory(owner,card,origin) values(me,cid,'craft') returning * into item;
    insert into jj_collect.discoveries values(me,cid) on conflict do nothing;
    payload:=jsonb_build_object('cards',jsonb_build_array(jsonb_build_object('id',item.id,'card',cid)));
   elsif p_action='wish' then
    cid:=p_data->>'card';if not exists(select 1 from jj_collect.catalog where id=cid) then raise exception 'BAD_CARD';end if;
    if coalesce((p_data->>'value')::boolean,false) then insert into jj_collect.wishes values(me,cid) on conflict do nothing;
    else delete from jj_collect.wishes where user_id=me and card=cid;end if;
   elsif p_action='claim' then
    total:=(p_data->>'milestone')::int;
    if total is null or total not in(10,20,30) then raise exception 'BAD_MILESTONE';end if;
    if (select count(*) from jj_collect.discoveries where user_id=me)<total then raise exception 'NOT_COMPLETE';end if;
    insert into jj_collect.claims values(me,total) on conflict do nothing;
    get diagnostics counted=row_count;
    if counted=0 then raise exception 'ALREADY_CLAIMED';end if;
    bonus:=case total when 10 then 40 when 20 then 100 else 250 end;
    perform jj_collect.credit(me,bonus,'album',jsonb_build_object('milestone',total));payload:=jsonb_build_object('amount',bonus);
   elsif p_action in('offer','counter','accept','cancel','reject') then
    if peer is null then raise exception 'PARTNER_UNAVAILABLE';end if;
    if p_action in('counter','accept','cancel','reject') then
     select * into o from jj_collect.offers where id=(p_data->>'offer')::uuid and me in(sender,recipient) for update;
     if o.id is null then raise exception 'OFFER_NOT_FOUND';end if;
     if o.state<>'pending' then raise exception 'OFFER_CLOSED';end if;
     if p_action='cancel' and o.sender<>me or p_action in('counter','accept','reject') and o.recipient<>me then raise exception 'NOT_YOUR_OFFER';end if;
     if p_action='accept' then
      if (public.bb_shop()->>'coins')::bigint<o.want_jj then raise exception 'INSUFFICIENT_COINS';end if;
      if (select count(*) from jj_collect.inventory where id=any(o.give) and owner=o.sender and state='owned' and reserved=o.id)<>cardinality(o.give) then raise exception 'OFFER_CHANGED';end if;
      if (select count(*) from jj_collect.inventory where id=any(o.want) and owner=me and state='owned' and reserved is null and not favorite)<>cardinality(o.want) then raise exception 'OFFER_CHANGED';end if;
      update jj_collect.inventory set owner=me,reserved=null,origin='trade',acquired=now() where id=any(o.give);
      update jj_collect.inventory set owner=o.sender,origin='trade',acquired=now() where id=any(o.want);
      insert into jj_collect.discoveries select me,card from jj_collect.inventory where id=any(o.give) on conflict do nothing;
      insert into jj_collect.discoveries select o.sender,card from jj_collect.inventory where id=any(o.want) on conflict do nothing;
      if o.want_jj>0 then perform jj_collect.credit(me,-o.want_jj,'trade',jsonb_build_object('offer',o.id));perform jj_collect.credit(o.sender,o.want_jj,'trade',jsonb_build_object('offer',o.id));end if;
      if o.give_jj>0 then perform jj_collect.credit(me,o.give_jj,'trade',jsonb_build_object('offer',o.id));end if;
      update jj_collect.offers set state='accepted' where id=o.id;
     else
      update jj_collect.offers set state=case p_action when 'cancel' then 'cancelled' when 'counter' then 'countered' else 'rejected' end where id=o.id;
      update jj_collect.inventory set reserved=null where reserved=o.id;
      if o.give_jj>0 then perform jj_collect.credit(o.sender,o.give_jj,'refund',jsonb_build_object('offer',o.id));end if;
      parent_id:=o.id;
     end if;
    end if;
    if p_action in('offer','counter') then
     if (select count(*) from jj_collect.offers where sender=me and state='pending')>=20 then raise exception 'TOO_MANY_OFFERS';end if;
     if jsonb_typeof(p_data->'give') is distinct from 'array' or jsonb_typeof(p_data->'want') is distinct from 'array' then raise exception 'BAD_OFFER';end if;
     select coalesce(array_agg(value::uuid),'{}') into give_ids from jsonb_array_elements_text(p_data->'give');
     select coalesce(array_agg(value::uuid),'{}') into want_ids from jsonb_array_elements_text(p_data->'want');
     give_coins:=coalesce((p_data->>'give_jj')::int,0);want_coins:=coalesce((p_data->>'want_jj')::int,0);
     if cardinality(give_ids)>5 or cardinality(want_ids)>5 or give_coins not between 0 and 1000000 or want_coins not between 0 and 1000000 or cardinality(give_ids)+cardinality(want_ids)+give_coins+want_coins=0 then raise exception 'BAD_OFFER';end if;
     if (select count(distinct x) from unnest(give_ids) x)<>cardinality(give_ids) or (select count(distinct x) from unnest(want_ids) x)<>cardinality(want_ids) then raise exception 'BAD_OFFER';end if;
     if (select count(*) from jj_collect.inventory where id=any(give_ids) and owner=me and state='owned' and reserved is null and not favorite)<>cardinality(give_ids) then raise exception 'CARD_UNAVAILABLE';end if;
     if (select count(*) from jj_collect.inventory where id=any(want_ids) and owner=peer and state='owned' and reserved is null and not favorite)<>cardinality(want_ids) then raise exception 'CARD_UNAVAILABLE';end if;
     if (public.bb_shop()->>'coins')::bigint<give_coins then raise exception 'INSUFFICIENT_COINS';end if;
     insert into jj_collect.offers(sender,recipient,give,want,give_jj,want_jj,parent,details) values(me,peer,give_ids,want_ids,give_coins,want_coins,parent_id,jsonb_build_object('give',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'card',card)),'[]') from jj_collect.inventory where id=any(give_ids)),'want',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'card',card)),'[]') from jj_collect.inventory where id=any(want_ids)))) returning id into new_offer;
     update jj_collect.inventory set reserved=new_offer where id=any(give_ids);
     if give_coins>0 then perform jj_collect.credit(me,-give_coins,'reserve',jsonb_build_object('offer',new_offer));end if;
     payload:=jsonb_build_object('offer',new_offer);
    end if;
   else raise exception 'BAD_ACTION';end if;
   insert into jj_collect.requests values(me,p_request,p_action,p_data,payload);
  end if;
 end if;
 return jsonb_build_object('coins',(public.bb_shop()->>'coins')::bigint,'account',(select to_jsonb(a)-'user_id' from jj_collect.accounts a where user_id=me),'catalog',(select jsonb_agg(data order by (data->>'number')::int) from jj_collect.catalog),'inventory',coalesce((select jsonb_agg(to_jsonb(t) order by acquired desc,id) from jj_collect.inventory t where owner=me and state='owned'),'[]'),'partner_inventory',coalesce((select jsonb_agg(jsonb_build_object('id',id,'card',card,'favorite',favorite,'reserved',reserved)) from jj_collect.inventory where owner=peer and state='owned'),'[]'),'discoveries',coalesce((select jsonb_agg(card) from jj_collect.discoveries where user_id=me),'[]'),'wishes',coalesce((select jsonb_agg(card) from jj_collect.wishes where user_id=me),'[]'),'partner_wishes',coalesce((select jsonb_agg(card) from jj_collect.wishes where user_id=peer),'[]'),'claims',coalesce((select jsonb_agg(milestone) from jj_collect.claims where user_id=me),'[]'),'offers',coalesce((select jsonb_agg(to_jsonb(t) order by created_at desc) from(select * from jj_collect.offers where me in(sender,recipient) order by created_at desc limit 60)t),'[]'),'history',coalesce((select jsonb_agg(to_jsonb(t)) from(select kind,jj,data,created_at from public.jj_money_log where user_id=me and kind like 'collect_%' order by created_at desc limit 40)t),'[]'),'payload',payload);
end $$;
revoke all on function jj_collect.api(text,uuid,jsonb) from public,anon;
grant execute on function jj_collect.api(text,uuid,jsonb) to authenticated;
create or replace function public.jj_collection(p_action text default 'read',p_request uuid default null,p_data jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$ select jj_collect.api(p_action,p_request,p_data); $$;
revoke all on function public.jj_collection(text,uuid,jsonb) from public,anon;
grant execute on function public.jj_collection(text,uuid,jsonb) to authenticated;
