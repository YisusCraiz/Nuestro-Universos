-- Fourth additive chapter. Preserve existing catalog, inventory, wallet, claims and visibility.
insert into jj_collect.catalog(id,data) values('nu-091','{"id": "nu-091", "number": 91, "name_es": "Una pizca de nosotros", "name_en": "A Pinch of Us", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Si ponemos cariño y alguna que otra broma, la tarde ya tiene buenos ingredientes.", "dedication_en": "With a little care and a joke or two, the afternoon already has good ingredients.", "art": 0, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-092','{"id": "nu-092", "number": 92, "name_es": "Un cielo para explorar", "name_en": "A Sky to Explore", "character": "jesus", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Me gusta encontrar algo nuevo y pensar en cómo te lo contaría.", "dedication_en": "I love finding something new and imagining how I would tell you about it.", "art": 1, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-093','{"id": "nu-093", "number": 93, "name_es": "Flores a tu manera", "name_en": "Flowers Your Way", "character": "julisa", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Hay detalles que se vuelven tuyos por la forma en que eliges hacerlos.", "dedication_en": "Some little things become yours through the way you choose to make them.", "art": 2, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-094','{"id": "nu-094", "number": 94, "name_es": "Darle forma al momento", "name_en": "Shaping the Moment", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "No importa si queda imperfecto: me gusta lo que aprendemos mientras lo intentamos.", "dedication_en": "It does not have to turn out perfect: I love what we learn while we try.", "art": 3, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-095','{"id": "nu-095", "number": 95, "name_es": "Aprender entre risas", "name_en": "Learning Through Laughter", "character": "jesus", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "A veces perder un poquito el equilibrio también nos regala una buena historia.", "dedication_en": "Sometimes losing our balance a little gives us a good story too.", "art": 4, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-096','{"id": "nu-096", "number": 96, "name_es": "Tu mirada en una foto", "name_en": "Your View in a Photo", "character": "julisa", "theme": "recuerdos", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Me daría curiosidad mirar el mundo a través de las cosas que tú decides guardar.", "dedication_en": "I would love to see the world through the things you choose to keep.", "art": 5, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-097','{"id": "nu-097", "number": 97, "name_es": "La pista que compartimos", "name_en": "The Clue We Share", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "No siempre tenemos la respuesta, pero me gusta pensar las cosas contigo.", "dedication_en": "We do not always have the answer, but I love figuring things out with you.", "art": 6, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-098','{"id": "nu-098", "number": 98, "name_es": "Un refugio entre pinos", "name_en": "A Shelter Among Pines", "character": "duo", "theme": "recuerdos", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Imaginar una noche tranquila contigo ya le pone algo bonito a este pequeño mundo.", "dedication_en": "Imagining a quiet night with you already brings something lovely to this little world.", "art": 7, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-099','{"id": "nu-099", "number": 99, "name_es": "Alas de papel", "name_en": "Paper Wings", "character": "jesus", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Hay formas pequeñas de decir algo bonito sin necesitar un discurso enorme.", "dedication_en": "There are little ways to say something lovely without a grand speech.", "art": 8, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-100','{"id": "nu-100", "number": 100, "name_es": "Lo que deseas en silencio", "name_en": "What You Quietly Wish For", "character": "julisa", "theme": "temporadas", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "No tengo que conocer todos tus deseos para querer que encuentres alegría al buscarlos.", "dedication_en": "I do not have to know all your wishes to hope you find joy in following them.", "art": 9, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-101','{"id": "nu-101", "number": 101, "name_es": "Una jugada inesperada", "name_en": "An Unexpected Play", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Si la bola toma otro camino, todavía podemos celebrar lo divertido del intento.", "dedication_en": "If the ball takes another path, we can still enjoy the fun of trying.", "art": 10, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-102','{"id": "nu-102", "number": 102, "name_es": "Otra ficha, otra aventura", "name_en": "Another Token, Another Adventure", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Mi parte favorita del juego puede ser la risa que aparece entre una partida y otra.", "dedication_en": "My favorite part of the game might be the laughter between rounds.", "art": 11, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-103','{"id": "nu-103", "number": 103, "name_es": "El pulso de la tormenta", "name_en": "The Pulse of the Storm", "character": "jesus", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "En este mundo de truenos también hay espacio para una voz tranquila.", "dedication_en": "Even in this world of thunder, there is room for a calm voice.", "art": 12, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-104','{"id": "nu-104", "number": 104, "name_es": "La ternura de la luna", "name_en": "The Moon’s Tenderness", "character": "julisa", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Me gusta inventarte aventuras donde la ternura también pueda ser una fuerza.", "dedication_en": "I love imagining adventures for you where tenderness can be a strength too.", "art": 13, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-105','{"id": "nu-105", "number": 105, "name_es": "Un pueblo que camina", "name_en": "A Village That Walks", "character": "duo", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Si la aventura avanza despacio, tendremos más tiempo para mirar alrededor.", "dedication_en": "If the adventure moves slowly, we will have more time to look around.", "art": 14, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-106','{"id": "nu-106", "number": 106, "name_es": "Magia entre hongos", "name_en": "Magic Among Mushrooms", "character": "jesus", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "A veces la mejor sorpresa de un camino es esa que no sabíamos buscar.", "dedication_en": "Sometimes the best surprise on a path is the one we did not know to look for.", "art": 15, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-107','{"id": "nu-107", "number": 107, "name_es": "Relojera de instantes", "name_en": "Clockmaker of Moments", "character": "julisa", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Cada momento que compartes conmigo tiene su valor, aunque no dure mucho.", "dedication_en": "Every moment you share with me has value, even when it does not last long.", "art": 16, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-108','{"id": "nu-108", "number": 108, "name_es": "Más arriba del frío", "name_en": "Above the Cold", "character": "duo", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Podemos inventar un horizonte distinto sin perder las ganas de disfrutar el presente.", "dedication_en": "We can imagine a different horizon while still enjoying the present.", "art": 17, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-109','{"id": "nu-109", "number": 109, "name_es": "La cosecha de un recuerdo", "name_en": "Harvesting a Memory", "character": "duo", "theme": "temporadas", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Me hace ilusión pensar en todos los recuerdos sencillos que todavía podemos cultivar.", "dedication_en": "I love thinking of all the simple memories we can still grow.", "art": 18, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-110','{"id": "nu-110", "number": 110, "name_es": "Colores de primavera", "name_en": "Colors of Spring", "character": "duo", "theme": "temporadas", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "No hace falta que pintemos igual para que la mesa se llene de colores.", "dedication_en": "We do not have to paint the same way for the table to fill with color.", "art": 19, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-111','{"id": "nu-111", "number": 111, "name_es": "El tren de medianoche", "name_en": "The Midnight Train", "character": "jesus", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Si inventamos un viaje imposible, llevaré conmigo las ganas de escuchar tus ideas.", "dedication_en": "If we imagine an impossible journey, I will bring my eagerness to hear your ideas.", "art": 20, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-112','{"id": "nu-112", "number": 112, "name_es": "Una melodía de cristal", "name_en": "A Melody of Crystal", "character": "julisa", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Hay cosas delicadas que merecen atención, como lo que te entusiasma y lo que sientes.", "dedication_en": "Some delicate things deserve care, like what excites you and how you feel.", "art": 21, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-113','{"id": "nu-113", "number": 113, "name_es": "Navegantes del infinito", "name_en": "Sailors of Infinity", "character": "duo", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Este universo crece porque todavía nos quedan muchas formas de imaginar juntos.", "dedication_en": "This universe grows because we still have so many ways to imagine together.", "art": 22, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-114','{"id": "nu-114", "number": 114, "name_es": "Detrás del antifaz", "name_en": "Behind the Mask", "character": "duo", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Entre disfraces y escenarios, me sigue gustando conocerte tal como eres.", "dedication_en": "Among costumes and stages, I still love getting to know you as you are.", "art": 23, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-115','{"id": "nu-115", "number": 115, "name_es": "El faro que encontramos", "name_en": "The Lighthouse We Find", "character": "duo", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Si el día se complica, ojalá podamos ofrecernos un poco de calma.", "dedication_en": "When the day gets difficult, I hope we can offer each other a little calm.", "art": 24, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-116','{"id": "nu-116", "number": 116, "name_es": "Las cuatro estaciones", "name_en": "The Four Seasons", "character": "duo", "theme": "fantasia", "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "Cada estación trae algo distinto; me ilusiona seguir descubriendo cuáles nos gustan más.", "dedication_en": "Every season brings something different; I am excited to keep discovering which ones we love most.", "art": 25, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-117','{"id": "nu-117", "number": 117, "name_es": "Nieve y fuego", "name_en": "Snow and Fire", "character": "duo", "theme": "fantasia", "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "No necesitamos parecernos en todo para compartir algo que valga la pena cuidar.", "dedication_en": "We do not need to be alike in every way to share something worth caring for.", "art": 26, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-118','{"id": "nu-118", "number": 118, "name_es": "Donde cae el cielo", "name_en": "Where the Sky Falls", "character": "duo", "theme": "fantasia", "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "Aunque aquí inventemos paisajes imposibles, lo bonito empieza con querer compartirlos contigo.", "dedication_en": "Even when we imagine impossible landscapes, the beauty begins with wanting to share them with you.", "art": 27, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-119','{"id": "nu-119", "number": 119, "name_es": "Jesús.EXE · vuelo escarlata", "name_en": "Jesus.EXE · Scarlet Flight", "character": "jesus", "theme": "alternativo", "rarity": 4, "sell": 650, "scrap": 90, "craft": 500, "dedication_es": "Si las ideas se vuelven pájaros de papel, guardaré alguna para sorprenderte otro día.", "dedication_en": "If ideas become paper birds, I will save one to surprise you another day.", "art": 28, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-120','{"id": "nu-120", "number": 120, "name_es": "Julissa.EXE · luz de perla", "name_en": "Julissa.EXE · Pearl Light", "character": "julisa", "theme": "alternativo", "rarity": 4, "sell": 650, "scrap": 90, "craft": 500, "dedication_es": "Este brillo es inventado; mi alegría de conocerte un poquito más no lo es.", "dedication_en": "This glow is imaginary; my happiness in getting to know you a little better is not.", "art": 29, "collection": "cuarto-universo"}'::jsonb) on conflict(id) do nothing;
create or replace function jj_collect.api(p_action text,p_request uuid,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
    if total is null or total not in(10,20,30,40,50,60,70,80,90,100,110,120) then raise exception 'BAD_MILESTONE';end if;
    if (select count(*) from jj_collect.discoveries where user_id=me)<total then raise exception 'NOT_COMPLETE';end if;
    insert into jj_collect.claims values(me,total) on conflict do nothing;
    get diagnostics counted=row_count;
    if counted=0 then raise exception 'ALREADY_CLAIMED';end if;
    bonus:=case total when 10 then 40 when 20 then 100 when 30 then 250 when 40 then 180 when 50 then 260 when 60 then 400 when 70 then 300 when 80 then 400 when 90 then 600 when 100 then 450 when 110 then 550 else 800 end;
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
