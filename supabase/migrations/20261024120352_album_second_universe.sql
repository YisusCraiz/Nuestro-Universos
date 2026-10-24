-- Additive expansion; preserve ownership, balances, discoveries and the visibility setting.
insert into jj_collect.catalog(id,data) values('nu-031','{"id": "nu-031", "number": 31, "name_es": "Receta para sonreír", "name_en": "A Recipe for Smiles", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Si la receta sale mal, todavía nos queda reírnos juntos.", "dedication_en": "If the recipe goes wrong, we can still laugh together.", "art": 0, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-032','{"id": "nu-032", "number": 32, "name_es": "Una canción para ti", "name_en": "A Song for You", "character": "jesus", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "A veces una melodía encuentra lo que mis palabras todavía están buscando.", "dedication_en": "Sometimes a melody finds what my words are still searching for.", "art": 1, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-033','{"id": "nu-033", "number": 33, "name_es": "Entre tus páginas", "name_en": "Between Your Pages", "character": "julisa", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Me gusta descubrir las historias que te hacen detenerte un poquito más.", "dedication_en": "I love discovering the stories that make you linger a little longer.", "art": 2, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-034','{"id": "nu-034", "number": 34, "name_es": "Domingo bajo el cielo", "name_en": "Sunday Under the Sky", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Un lugar tranquilo y algo que compartir: contigo eso ya es un buen plan.", "dedication_en": "A quiet place and something to share: with you, that is already a lovely plan.", "art": 3, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-035','{"id": "nu-035", "number": 35, "name_es": "El instante que guardo", "name_en": "The Moment I Keep", "character": "jesus", "theme": "recuerdos", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Hay sonrisas tuyas que quisiera guardar incluso cuando no tengo una cámara.", "dedication_en": "There are smiles of yours I wish I could keep even without a camera.", "art": 4, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-036','{"id": "nu-036", "number": 36, "name_es": "Mi compañera de equipo", "name_en": "My Teammate", "character": "julisa", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Me gusta cuando hacemos equipo, aunque la partida termine en nuestras bromas.", "dedication_en": "I love when we team up, even when the game ends in laughter.", "art": 5, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-037','{"id": "nu-037", "number": 37, "name_es": "Un océano de colores", "name_en": "An Ocean of Colors", "character": "duo", "theme": "recuerdos", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Todavía hay tantas cosas bonitas que me ilusiona descubrir contigo.", "dedication_en": "There are still so many beautiful things I am excited to discover with you.", "art": 6, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-038','{"id": "nu-038", "number": 38, "name_es": "Arriba del mundo", "name_en": "Above the World", "character": "duo", "theme": "recuerdos", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Entre tantas vueltas, qué bonito coincidir contigo en esta.", "dedication_en": "Among all of life’s turns, how lovely to share this one with you.", "art": 7, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-039','{"id": "nu-039", "number": 39, "name_es": "Girasoles para tu día", "name_en": "Sunflowers for Your Day", "character": "jesus", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Si pudiera regalarte un pedacito de sol, lo dejaría cerca de tu sonrisa.", "dedication_en": "If I could give you a little sunshine, I would leave it near your smile.", "art": 8, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-040','{"id": "nu-040", "number": 40, "name_es": "Tu sabor favorito", "name_en": "Your Favorite Flavor", "character": "julisa", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "También quiero conocer tus pequeñas preferencias: ahí vive mucho de ti.", "dedication_en": "I want to know your little preferences too: they hold so much of who you are.", "art": 9, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-041','{"id": "nu-041", "number": 41, "name_es": "Las piezas que encontramos", "name_en": "The Pieces We Find", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "No hace falta tener todo resuelto para disfrutar lo que vamos armando.", "dedication_en": "We do not need everything figured out to enjoy what we are putting together.", "art": 10, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-042','{"id": "nu-042", "number": 42, "name_es": "Una película más", "name_en": "One More Movie", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Compartir un rato tranquilo contigo también puede ser mi parte favorita del día.", "dedication_en": "A quiet moment with you can be my favorite part of the day too.", "art": 11, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-043','{"id": "nu-043", "number": 43, "name_es": "Capitán del cielo nocturno", "name_en": "Captain of the Night Sky", "character": "jesus", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "En un mapa lleno de aventuras, siempre dejaría espacio para un viaje contigo.", "dedication_en": "On a map full of adventures, I would always leave room for a journey with you.", "art": 12, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-044','{"id": "nu-044", "number": 44, "name_es": "Princesa de las mareas", "name_en": "Princess of the Tides", "character": "julisa", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Imaginarte entre perlas y mareas es otra forma de celebrar tu luz.", "dedication_en": "Imagining you among pearls and tides is another way to celebrate your light.", "art": 13, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-045','{"id": "nu-045", "number": 45, "name_es": "Donde vuelan los sueños", "name_en": "Where Dreams Fly", "character": "duo", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Me gusta inventar mundos donde podamos sorprendernos otra vez.", "dedication_en": "I love imagining worlds where we can surprise each other all over again.", "art": 14, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-046','{"id": "nu-046", "number": 46, "name_es": "El inventor de instantes", "name_en": "The Inventor of Moments", "character": "jesus", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Si pudiera inventar algo perfecto, empezaría por un ratito sin prisas contigo.", "dedication_en": "If I could invent something perfect, I would start with an unhurried moment with you.", "art": 15, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-047','{"id": "nu-047", "number": 47, "name_es": "Arquera del bosque vivo", "name_en": "Archer of the Living Forest", "character": "julisa", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "En esta historia tienes tu propia aventura, y me encanta verte protagonizarla.", "dedication_en": "In this story you have your own adventure, and I love watching you lead it.", "art": 16, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-048','{"id": "nu-048", "number": 48, "name_es": "La biblioteca imposible", "name_en": "The Impossible Library", "character": "duo", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "De todos los capítulos inventados, todavía me emociona el que escribimos de verdad.", "dedication_en": "Of all our imagined chapters, the one we are truly writing still excites me.", "art": 17, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-049','{"id": "nu-049", "number": 49, "name_es": "Calabazas y travesuras", "name_en": "Pumpkins and Mischief", "character": "duo", "theme": "temporadas", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Un poco de misterio, unas cuantas bromas y otro recuerdo para nosotros.", "dedication_en": "A little mystery, a few jokes and another memory for us.", "art": 18, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-050','{"id": "nu-050", "number": 50, "name_es": "Luces de diciembre", "name_en": "December Lights", "character": "duo", "theme": "temporadas", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Me hace ilusión imaginar las pequeñas tradiciones que podríamos compartir.", "dedication_en": "I love imagining the little traditions we might share.", "art": 19, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-051','{"id": "nu-051", "number": 51, "name_es": "Guardián de constelaciones", "name_en": "Guardian of Constellations", "character": "jesus", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "No necesito saber el nombre de cada estrella para disfrutar el cielo contigo.", "dedication_en": "I do not need to know every star’s name to enjoy the sky with you.", "art": 20, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-052','{"id": "nu-052", "number": 52, "name_es": "Reina de las auroras", "name_en": "Queen of Auroras", "character": "julisa", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Te inventé una corona de luces porque este álbum también quiere celebrar tus colores.", "dedication_en": "I imagined a crown of lights for you because this album wants to celebrate your colors too.", "art": 21, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-053','{"id": "nu-053", "number": 53, "name_es": "Nuestra órbita pequeña", "name_en": "Our Little Orbit", "character": "duo", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Hasta en un universo enorme, un momento compartido puede sentirse cercano.", "dedication_en": "Even in an enormous universe, a shared moment can feel close.", "art": 22, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-054','{"id": "nu-054", "number": 54, "name_es": "El baile que imaginamos", "name_en": "The Dance We Imagine", "character": "duo", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Si nos perdemos en los pasos, prometo que al menos nos vamos a divertir.", "dedication_en": "If we lose track of the steps, I promise we will at least have fun.", "art": 23, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-055','{"id": "nu-055", "number": 55, "name_es": "Renacer en compañía", "name_en": "Beginning Again Together", "character": "duo", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Me gusta pensar que también podemos acompañarnos cuando toca empezar de nuevo.", "dedication_en": "I love thinking we can keep each other company when it is time to begin again.", "art": 24, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-056','{"id": "nu-056", "number": 56, "name_es": "Cuando florece el cielo", "name_en": "When the Sky Blossoms", "character": "duo", "theme": "temporadas", "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "Hay encuentros que vuelven distinto hasta el paisaje más sencillo.", "dedication_en": "Some meetings make even the simplest scenery feel different.", "art": 25, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-057','{"id": "nu-057", "number": 57, "name_es": "El sueño que compartimos", "name_en": "The Dream We Share", "character": "duo", "theme": "fantasia", "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "Soñar contigo me ilusiona; conocerte en la vida real me importa todavía más.", "dedication_en": "Dreaming with you makes me happy; knowing you in real life matters even more.", "art": 26, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-058','{"id": "nu-058", "number": 58, "name_es": "Un mañana imaginado", "name_en": "An Imagined Tomorrow", "character": "duo", "theme": "fantasia", "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "Esta escena es un sueño bonito, no una prisa: me gusta ir descubriendo nuestro camino.", "dedication_en": "This scene is a lovely dream, never a rush: I love discovering our path as we go.", "art": 27, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-059','{"id": "nu-059", "number": 59, "name_es": "Jesús.EXE · bosque de código", "name_en": "Jesus.EXE · Forest of Code", "character": "jesus", "theme": "alternativo", "rarity": 4, "sell": 650, "scrap": 90, "craft": 500, "dedication_es": "Si me convierto en un montón de píxeles, espero conservar mi forma de hacerte reír.", "dedication_en": "If I turn into a bunch of pixels, I hope I keep my way of making you laugh.", "art": 28, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-060','{"id": "nu-060", "number": 60, "name_es": "Julissa.EXE · tiempo dorado", "name_en": "Julissa.EXE · Golden Time", "character": "julisa", "theme": "alternativo", "rarity": 4, "sell": 650, "scrap": 90, "craft": 500, "dedication_es": "Ni mil efectos especiales se comparan con una conversación real contigo.", "dedication_en": "Not even a thousand special effects compare to a real conversation with you.", "art": 29, "collection": "segundo-universo"}'::jsonb) on conflict(id) do nothing;
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
    if total is null or total not in(10,20,30,40,50,60) then raise exception 'BAD_MILESTONE';end if;
    if (select count(*) from jj_collect.discoveries where user_id=me)<total then raise exception 'NOT_COMPLETE';end if;
    insert into jj_collect.claims values(me,total) on conflict do nothing;
    get diagnostics counted=row_count;
    if counted=0 then raise exception 'ALREADY_CLAIMED';end if;
    bonus:=case total when 10 then 40 when 20 then 100 when 30 then 250 when 40 then 180 when 50 then 260 else 400 end;
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
