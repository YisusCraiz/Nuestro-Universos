-- Japanese-themed seventh chapter; preserve prior catalog, wallets, ownership, claims and visibility.
insert into jj_collect.catalog(id,data) values('nu-181','{"id": "nu-181", "number": 181, "name_es": "Triángulos de cariño", "name_en": "Little Triangles of Care", "character": "duo", "theme": "cotidiano", "tags": ["japon"], "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Si aprendemos una receta juntos, también podemos inventarnos una nueva forma de pasar la tarde.", "dedication_en": "If we learn a recipe together, we can also find a new way to spend the afternoon.", "art": 0, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-182','{"id": "nu-182", "number": 182, "name_es": "Una pausa de matcha", "name_en": "A Matcha Pause", "character": "jesus", "theme": "cotidiano", "tags": ["japon"], "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Me gustaría compartir contigo un ratito que no tenga que competir con la prisa.", "dedication_en": "I would love to share a little time with you that does not have to compete with the rush.", "art": 1, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-183','{"id": "nu-183", "number": 183, "name_es": "Tu sonrisa en yukata", "name_en": "Your Smile in a Yukata", "character": "julisa", "theme": "temporadas", "tags": ["japon"], "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Entre tantas luces de festival, me daría ilusión descubrir qué detalle te gustó más.", "dedication_en": "Among all the festival lights, I would love to discover which little detail you liked most.", "art": 2, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-184','{"id": "nu-184", "number": 184, "name_es": "Lluvia entre hortensias", "name_en": "Rain Among Hydrangeas", "character": "duo", "theme": "recuerdos", "tags": ["japon"], "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Si nos sorprende la lluvia, todavía podemos encontrar algo bonito en el paseo.", "dedication_en": "If the rain catches us, we can still find something lovely in the walk.", "art": 3, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-185','{"id": "nu-185", "number": 185, "name_es": "Una jugada por descubrir", "name_en": "A Move to Discover", "character": "jesus", "theme": "cotidiano", "tags": ["japon"], "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Aprender algo nuevo también puede ser una buena excusa para compartir preguntas contigo.", "dedication_en": "Learning something new can be a lovely excuse to share questions with you too.", "art": 4, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-186','{"id": "nu-186", "number": 186, "name_es": "El trazo que eliges", "name_en": "The Stroke You Choose", "character": "julisa", "theme": "cotidiano", "tags": ["japon"], "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Me gusta pensar que siempre queda una página donde puedas probar una idea tuya.", "dedication_en": "I love thinking there is always a page where you can try an idea of your own.", "art": 5, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-187','{"id": "nu-187", "number": 187, "name_es": "Un puesto para dos", "name_en": "A Stall for Two", "character": "duo", "theme": "cotidiano", "tags": ["japon"], "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Podemos compartir un antojo y terminar guardando una historia de toda la tarde.", "dedication_en": "We can share a little treat and end up keeping a story from the whole afternoon.", "art": 6, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-188','{"id": "nu-188", "number": 188, "name_es": "La calma del tatami", "name_en": "The Calm of Tatami", "character": "duo", "theme": "cotidiano", "tags": ["japon"], "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "A veces mi plan favorito sería simplemente sentarme cerca y escucharte sin apuro.", "dedication_en": "Sometimes my favorite plan would simply be sitting nearby and listening without hurry.", "art": 7, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-189','{"id": "nu-189", "number": 189, "name_es": "Un pequeño propósito", "name_en": "A Little Intention", "character": "jesus", "theme": "cotidiano", "tags": ["japon"], "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Me gusta pensar en las cosas que podemos intentar, una a la vez y a nuestro ritmo.", "dedication_en": "I love thinking about what we can try, one thing at a time and at our own pace.", "art": 8, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-190','{"id": "nu-190", "number": 190, "name_es": "Colores en tus manos", "name_en": "Colors in Your Hands", "character": "julisa", "theme": "cotidiano", "tags": ["japon"], "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Hay detalles que llaman mi atención porque me imagino la ilusión con la que los elegirías.", "dedication_en": "Some little things catch my eye because I imagine how happily you might choose them.", "art": 9, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-191','{"id": "nu-191", "number": 191, "name_es": "Paseo entre cortinas", "name_en": "A Walk Among Curtains", "character": "duo", "theme": "recuerdos", "tags": ["japon"], "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "Una calle desconocida puede llenarse de pequeñas cosas que contar si la recorremos juntos.", "dedication_en": "An unfamiliar street can fill with little stories to tell when we explore it together.", "art": 10, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-192','{"id": "nu-192", "number": 192, "name_es": "Reflejos en el estanque", "name_en": "Reflections in the Pond", "character": "duo", "theme": "cotidiano", "tags": ["japon"], "rarity": 0, "sell": 4, "scrap": 1, "craft": 8, "dedication_es": "No todos los momentos bonitos necesitan palabras; también podemos disfrutar de mirar alrededor.", "dedication_en": "Not every lovely moment needs words; we can enjoy looking around too.", "art": 11, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-193','{"id": "nu-193", "number": 193, "name_es": "Ronin del bosque de bambú", "name_en": "Ronin of the Bamboo Forest", "character": "jesus", "theme": "fantasia", "tags": ["japon"], "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "En esta aventura de caminos largos, guardaría una pausa para nuestra conversación.", "dedication_en": "On this adventure of long roads, I would save a pause for our conversation.", "art": 12, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-194','{"id": "nu-194", "number": 194, "name_es": "Guardiana del torii", "name_en": "Guardian of the Torii", "character": "julisa", "theme": "fantasia", "tags": ["japon"], "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Te imaginé en un lugar tranquilo donde cada paso deje espacio para descubrir algo nuevo.", "dedication_en": "I imagined you in a quiet place where every step leaves room to discover something new.", "art": 13, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-195','{"id": "nu-195", "number": 195, "name_es": "El puente del kitsune", "name_en": "The Kitsune Bridge", "character": "duo", "theme": "fantasia", "tags": ["japon"], "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Me gusta que un mundo inventado pueda darnos otro motivo para asombrarnos juntos.", "dedication_en": "I love that an imaginary world can give us another reason to wonder together.", "art": 14, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-196','{"id": "nu-196", "number": 196, "name_es": "Una melodía entre pinos", "name_en": "A Melody Among Pines", "character": "jesus", "theme": "fantasia", "tags": ["japon"], "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Si esta escena tuviera sonido, ojalá dejara espacio para la calma que a veces necesitamos.", "dedication_en": "If this scene had a sound, I hope it would leave room for the calm we sometimes need.", "art": 15, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-197','{"id": "nu-197", "number": 197, "name_es": "El pulso del festival", "name_en": "The Festival’s Beat", "character": "julisa", "theme": "temporadas", "tags": ["japon"], "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Me gusta imaginarte disfrutando algo que te emocione, sin tener que fingir ser otra persona.", "dedication_en": "I love imagining you enjoying something that excites you, without having to pretend to be someone else.", "art": 16, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-198','{"id": "nu-198", "number": 198, "name_es": "Bajo los pétalos de sakura", "name_en": "Under Sakura Petals", "character": "duo", "theme": "temporadas", "tags": ["japon"], "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Si un instante bonito dura poquito, también podemos disfrutarlo sin pedirle que sea eterno.", "dedication_en": "If a lovely moment is brief, we can enjoy it without asking it to last forever.", "art": 17, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-199','{"id": "nu-199", "number": 199, "name_es": "Té entre hojas rojas", "name_en": "Tea Among Red Leaves", "character": "duo", "theme": "temporadas", "tags": ["japon"], "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Hay paisajes que invitan a quedarnos un rato, como esas charlas que no quiero apresurar.", "dedication_en": "Some views invite us to stay a while, like the conversations I never want to rush.", "art": 18, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-200','{"id": "nu-200", "number": 200, "name_es": "Nieve sobre las linternas", "name_en": "Snow on the Lanterns", "character": "duo", "theme": "temporadas", "tags": ["japon"], "rarity": 1, "sell": 35, "scrap": 4, "craft": 24, "dedication_es": "Hasta un jardín silencioso puede tener mucho que compartir si lo miramos con curiosidad.", "dedication_en": "Even a quiet garden can have much to share when we look at it with curiosity.", "art": 19, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-201','{"id": "nu-201", "number": 201, "name_es": "El guardián de la montaña", "name_en": "The Mountain Guardian", "character": "jesus", "theme": "fantasia", "tags": ["japon"], "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Puedo inventar máscaras y armaduras, pero contigo me gusta poder hablar como soy.", "dedication_en": "I can imagine masks and armor, but with you I love being able to speak as myself.", "art": 20, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-202','{"id": "nu-202", "number": 202, "name_es": "La ternura de la nieve", "name_en": "The Tenderness of Snow", "character": "julisa", "theme": "fantasia", "tags": ["japon"], "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Esta versión de invierno lleva algo que me gusta cuidar: la suavidad de un momento sin presión.", "dedication_en": "This winter version holds something I love to care for: the gentleness of a moment without pressure.", "art": 21, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-203','{"id": "nu-203", "number": 203, "name_es": "Grullas sobre el Fuji", "name_en": "Cranes Above Fuji", "character": "duo", "theme": "fantasia", "tags": ["japon"], "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Me ilusiona que una idea de papel pueda llevarnos tan lejos dentro de este álbum.", "dedication_en": "I love that a little paper idea can take us so far within this album.", "art": 22, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-204','{"id": "nu-204", "number": 204, "name_es": "La ciudad del maneki-neko", "name_en": "The Maneki-neko City", "character": "duo", "theme": "fantasia", "tags": ["japon"], "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Si este mundo nos regala una sorpresa, ojalá venga acompañada de una buena risa.", "dedication_en": "If this world brings us a surprise, I hope it comes with a good laugh.", "art": 23, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-205','{"id": "nu-205", "number": 205, "name_es": "Faroles sobre la primavera", "name_en": "Lanterns Above Spring", "character": "duo", "theme": "fantasia", "tags": ["japon"], "rarity": 2, "sell": 80, "scrap": 12, "craft": 70, "dedication_es": "Me gusta inventar viajes que empiecen con una pregunta sencilla: ¿qué te gustaría descubrir?", "dedication_en": "I love imagining journeys that begin with a simple question: what would you like to discover?", "art": 24, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-206','{"id": "nu-206", "number": 206, "name_es": "El sol y la luna nos encuentran", "name_en": "Sun and Moon Find Us", "character": "duo", "theme": "fantasia", "tags": ["japon"], "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "Podemos tener días distintos y aun así buscar una forma bonita de acompañarnos.", "dedication_en": "Our days can be different, and we can still find a lovely way to keep each other company.", "art": 25, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-207','{"id": "nu-207", "number": 207, "name_es": "Un puente para los deseos", "name_en": "A Bridge for Wishes", "character": "duo", "theme": "fantasia", "tags": ["japon"], "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "En esta fantasía de estrellas hay espacio para tus deseos, incluso los que todavía no sé nombrar.", "dedication_en": "In this starry fantasy there is room for your wishes, even those I do not yet know how to name.", "art": 26, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-208','{"id": "nu-208", "number": 208, "name_es": "Un mundo de oro y cerámica", "name_en": "A World of Gold and Ceramic", "character": "duo", "theme": "fantasia", "tags": ["japon"], "rarity": 3, "sell": 220, "scrap": 35, "craft": 200, "dedication_es": "No necesito que cada intento salga perfecto para querer cuidarlo con cariño.", "dedication_en": "I do not need every attempt to turn out perfect to want to care for it gently.", "art": 27, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-209','{"id": "nu-209", "number": 209, "name_es": "Jesús.EXE · ronin de neón", "name_en": "Jesus.EXE · Neon Ronin", "character": "jesus", "theme": "alternativo", "tags": ["japon"], "rarity": 4, "sell": 650, "scrap": 90, "craft": 500, "dedication_es": "Aunque cambiemos los faroles por luces de neón, seguiría buscando una buena historia para contarte.", "dedication_en": "Even if we trade lanterns for neon lights, I would still look for a good story to tell you.", "art": 28, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
insert into jj_collect.catalog(id,data) values('nu-210','{"id": "nu-210", "number": 210, "name_es": "Julissa.EXE · kitsune digital", "name_en": "Julissa.EXE · Digital Kitsune", "character": "julisa", "theme": "alternativo", "tags": ["japon"], "rarity": 4, "sell": 650, "scrap": 90, "craft": 500, "dedication_es": "Entre pétalos y luces imposibles, me sigue haciendo feliz imaginar algo que pueda sorprenderte.", "dedication_en": "Among petals and impossible lights, I still love imagining something that might surprise you.", "art": 29, "collection": "septimo-universo"}'::jsonb) on conflict(id) do nothing;
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
    if total is null or total not in(10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210) then raise exception 'BAD_MILESTONE';end if;
    if (select count(*) from jj_collect.discoveries where user_id=me)<total then raise exception 'NOT_COMPLETE';end if;
    insert into jj_collect.claims values(me,total) on conflict do nothing;
    get diagnostics counted=row_count;
    if counted=0 then raise exception 'ALREADY_CLAIMED';end if;
    bonus:=case total when 10 then 40 when 20 then 100 when 30 then 250 when 40 then 180 when 50 then 260 when 60 then 400 when 70 then 300 when 80 then 400 when 90 then 600 when 100 then 450 when 110 then 550 when 120 then 800 when 130 then 600 when 140 then 700 when 150 then 1000 when 160 then 750 when 170 then 850 when 180 then 1200 when 190 then 900 when 200 then 1000 else 1400 end;
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
