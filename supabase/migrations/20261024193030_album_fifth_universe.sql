-- Fifth additive chapter. Preserve previous cards, user balances, inventory, claims and visibility.
insert into jj_collect.catalog(id,data) values('nu-121','{"id": "nu-121", "number": 121, "name_es": "Pequeños motivos dulces", "name_en": "Little Sweet Reasons", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "No hace falta esperar una gran ocasión para compartir algo que nos haga sonreír.", "dedication_en": "We do not have to wait for a big occasion to share something that makes us smile.", "art": 0, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-122','{"id": "nu-122", "number": 122, "name_es": "El robot de las buenas ideas", "name_en": "The Robot of Good Ideas", "character": "jesus", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Me gusta inventar detalles y pensar en la cara que pondrías al descubrirlos.", "dedication_en": "I love dreaming up little surprises and imagining your face when you discover them.", "art": 1, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-123','{"id": "nu-123", "number": 123, "name_es": "Tu música en la ventana", "name_en": "Your Music by the Window", "character": "julisa", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "A veces imagino una canción tranquila que deje espacio para escuchar tu voz.", "dedication_en": "Sometimes I imagine a quiet song that leaves room to hear your voice.", "art": 2, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-124','{"id": "nu-124", "number": 124, "name_es": "Un paseo entre hojas", "name_en": "A Walk Among Leaves", "character": "duo", "theme": "recuerdos", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Todavía hay rincones pequeños donde podríamos encontrar algo que nos sorprenda.", "dedication_en": "There are still little places where we might find something that surprises us.", "art": 3, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-125','{"id": "nu-125", "number": 125, "name_es": "Lo cotidiano también cuenta", "name_en": "Everyday Things Matter Too", "character": "jesus", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Los planes sencillos también pueden convertirse en recuerdos que uno quiere guardar.", "dedication_en": "Simple plans can become memories we want to keep too.", "art": 4, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-126','{"id": "nu-126", "number": 126, "name_es": "Palabras que encuentran casa", "name_en": "Words That Find a Home", "character": "julisa", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Me gusta cuando una conversación nos deja sentir que hay espacio para decir lo que pensamos.", "dedication_en": "I love when a conversation makes us feel there is room to say what we think.", "art": 5, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-127','{"id": "nu-127", "number": 127, "name_es": "Una sonrisa de invierno", "name_en": "A Winter Smile", "character": "duo", "theme": "temporadas", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Si el muñeco queda un poco torcido, tendremos otra razón para reírnos de la foto.", "dedication_en": "If the snowman turns out a little crooked, we will have another reason to laugh at the photo.", "art": 6, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-128','{"id": "nu-128", "number": 128, "name_es": "La suerte de intentarlo", "name_en": "The Luck of Trying", "character": "duo", "theme": "recuerdos", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "A veces lo divertido no es ganar el premio, sino tener con quién celebrar el intento.", "dedication_en": "Sometimes the fun is not winning the prize, but having someone to enjoy the attempt with.", "art": 7, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-129','{"id": "nu-129", "number": 129, "name_es": "Una página sin prisa", "name_en": "An Unhurried Page", "character": "jesus", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "También me gusta imaginar ratitos donde no haya nada urgente que hacer.", "dedication_en": "I love imagining little moments when there is nothing urgent to do too.", "art": 8, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-130','{"id": "nu-130", "number": 130, "name_es": "Cariño en cuatro patitas", "name_en": "Care on Four Little Paws", "character": "julisa", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Hay escenas pequeñas que hacen que este mundo inventado se sienta más cálido.", "dedication_en": "Some little scenes make this imagined world feel warmer.", "art": 9, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-131','{"id": "nu-131", "number": 131, "name_es": "Entre fideos y bromas", "name_en": "Noodles and Jokes", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Hasta aprender a usar los palillos puede volverse una buena excusa para compartir risas.", "dedication_en": "Even learning to use chopsticks can become a lovely excuse to share some laughter.", "art": 10, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-132','{"id": "nu-132", "number": 132, "name_es": "Una casita para imaginar", "name_en": "A Little House for Dreaming", "character": "duo", "theme": "cotidiano", "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Me gusta lo que pasa cuando juntamos una idea tuya y una idea mía.", "dedication_en": "I love what happens when we put one of your ideas together with one of mine.", "art": 11, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-133','{"id": "nu-133", "number": 133, "name_es": "El filo del viento", "name_en": "The Edge of the Wind", "character": "jesus", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "En este viaje de plumas y viento también habría tiempo para detenernos a conversar.", "dedication_en": "On this journey of feathers and wind, there would still be time to stop and talk.", "art": 12, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-134','{"id": "nu-134", "number": 134, "name_es": "La calma del océano", "name_en": "The Ocean’s Calm", "character": "julisa", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Te imaginé rodeada de luces suaves porque también hay belleza en lo tranquilo.", "dedication_en": "I imagined you surrounded by soft lights because quiet things can be beautiful too.", "art": 13, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-135','{"id": "nu-135", "number": 135, "name_es": "Por encima de los tejados", "name_en": "Above the Rooftops", "character": "duo", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Cambiar de perspectiva a veces basta para descubrir algo bonito que no habíamos visto.", "dedication_en": "Sometimes a change of perspective is enough to reveal something lovely we had missed.", "art": 14, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-136','{"id": "nu-136", "number": 136, "name_es": "El guardián del horizonte", "name_en": "The Keeper of the Horizon", "character": "jesus", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "No tengo un mapa de todo lo que viene, pero sí muchas ganas de seguir aprendiendo.", "dedication_en": "I do not have a map of everything ahead, but I do have a great wish to keep learning.", "art": 15, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-137','{"id": "nu-137", "number": 137, "name_es": "Acuarelas que despiertan", "name_en": "Watercolors Awakening", "character": "julisa", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Me encanta imaginar que tus ideas pudieran salir del papel para acompañarte un rato.", "dedication_en": "I love imagining your ideas stepping off the page to keep you company for a while.", "art": 16, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-138','{"id": "nu-138", "number": 138, "name_es": "Té sobre el loto", "name_en": "Tea on the Lotus", "character": "duo", "theme": "fantasia", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Si pudiéramos elegir un lugar imposible para hablar, este sería uno de mis favoritos.", "dedication_en": "If we could choose an impossible place to talk, this would be one of my favorites.", "art": 17, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-139','{"id": "nu-139", "number": 139, "name_es": "El aroma de una tarde", "name_en": "The Scent of an Afternoon", "character": "duo", "theme": "temporadas", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Un aroma, una broma y un poco de tiempo pueden bastar para recordar un día con cariño.", "dedication_en": "A scent, a joke and a little time can be enough to remember a day fondly.", "art": 18, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-140','{"id": "nu-140", "number": 140, "name_es": "Un hilo hacia el cielo", "name_en": "A String Toward the Sky", "character": "duo", "theme": "temporadas", "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Me gusta pensar en aventuras que nos dejen jugar y asombrarnos sin tanta prisa.", "dedication_en": "I love thinking of adventures that let us play and wonder without so much hurry.", "art": 19, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-141','{"id": "nu-141", "number": 141, "name_es": "Rastros de esmeralda", "name_en": "Emerald Trails", "character": "jesus", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "A veces una aventura empieza simplemente por animarnos a dar el siguiente paso.", "dedication_en": "Sometimes an adventure begins simply by daring to take the next step.", "art": 20, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-142','{"id": "nu-142", "number": 142, "name_es": "El baile de las auroras", "name_en": "The Dance of Auroras", "character": "julisa", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Ojalá encuentres muchos espacios donde disfrutar lo que te hace sentir tú.", "dedication_en": "I hope you find many places to enjoy what makes you feel like yourself.", "art": 21, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-143','{"id": "nu-143", "number": 143, "name_es": "Pasajeros de Saturno", "name_en": "Passengers of Saturn", "character": "duo", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "En un tren que rodea un planeta, todavía me gustaría preguntarte cómo te sientes.", "dedication_en": "On a train circling a planet, I would still want to ask how you feel.", "art": 22, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-144','{"id": "nu-144", "number": 144, "name_es": "El dragón de papel", "name_en": "The Paper Dragon", "character": "duo", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Qué bonito que una idea pequeña pueda crecer tanto cuando jugamos a imaginarla.", "dedication_en": "How lovely that a little idea can grow so much when we let ourselves imagine it.", "art": 23, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-145','{"id": "nu-145", "number": 145, "name_es": "Donde cantan los cristales", "name_en": "Where the Crystals Sing", "character": "duo", "theme": "fantasia", "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Hay detalles que solo descubrimos cuando nos detenemos a mirar un poquito más.", "dedication_en": "Some details only appear when we stop to look a little longer.", "art": 24, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-146','{"id": "nu-146", "number": 146, "name_es": "El libro que enciende galaxias", "name_en": "The Book That Lights Galaxies", "character": "duo", "theme": "fantasia", "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "A este álbum todavía le caben muchas historias, pero ninguna necesita apresurarnos.", "dedication_en": "This album still has room for many stories, and none of them needs to rush us.", "art": 25, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-147','{"id": "nu-147", "number": 147, "name_es": "Al otro lado del reflejo", "name_en": "Beyond the Reflection", "character": "duo", "theme": "fantasia", "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "Me gusta ir conociendo las distintas partes de ti, incluso las que aparecen despacito.", "dedication_en": "I love getting to know the different parts of you, even those that appear slowly.", "art": 26, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-148','{"id": "nu-148", "number": 148, "name_es": "Horizontes de arcoíris", "name_en": "Rainbow Horizons", "character": "duo", "theme": "fantasia", "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "Podemos disfrutar lo que tenemos hoy y seguir dejando espacio para lo que soñamos.", "dedication_en": "We can enjoy what we have today while leaving room for what we dream of.", "art": 27, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-149','{"id": "nu-149", "number": 149, "name_es": "Jesús.EXE · sol de píxeles", "name_en": "Jesus.EXE · Pixel Sun", "character": "jesus", "theme": "alternativo", "rarity": 4, "sell": 650, "scrap": 90, "craft": 500, "dedication_es": "Si un mensaje mío pudiera ser un rayito de sol, ojalá te llegue cuando lo necesites.", "dedication_en": "If a message from me could be a little ray of sunshine, I hope it reaches you when you need it.", "art": 28, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-150','{"id": "nu-150", "number": 150, "name_es": "Julissa.EXE · luna amatista", "name_en": "Julissa.EXE · Amethyst Moon", "character": "julisa", "theme": "alternativo", "rarity": 4, "sell": 650, "scrap": 90, "craft": 500, "dedication_es": "Puedo imaginarte entre mil cristales, pero siempre me alegra volver a la conversación contigo.", "dedication_en": "I can imagine you among a thousand crystals, but I am always happy to return to talking with you.", "art": 29, "collection": "quinto-universo"}'::jsonb) on conflict(id) do nothing;
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
    if total is null or total not in(10,20,30,40,50,60,70,80,90,100,110,120,130,140,150) then raise exception 'BAD_MILESTONE';end if;
    if (select count(*) from jj_collect.discoveries where user_id=me)<total then raise exception 'NOT_COMPLETE';end if;
    insert into jj_collect.claims values(me,total) on conflict do nothing;
    get diagnostics counted=row_count;
    if counted=0 then raise exception 'ALREADY_CLAIMED';end if;
    bonus:=case total when 10 then 40 when 20 then 100 when 30 then 250 when 40 then 180 when 50 then 260 when 60 then 400 when 70 then 300 when 80 then 400 when 90 then 600 when 100 then 450 when 110 then 550 when 120 then 800 when 130 then 600 when 140 then 700 else 1000 end;
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
