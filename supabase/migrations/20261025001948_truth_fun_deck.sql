-- Refresh repetitive prompts and add 40 distinct bilingual party cards.
update public.truth_cards set es='¿Qué regla absurda pondrías si fueras dueño de un hotel por un día?',en='What absurd rule would you make if you owned a hotel for a day?' where id='extra-truth-02';
update public.truth_cards set es='¿Qué desastre de cocina tuyo merecería un documental?',en='Which of your kitchen disasters deserves a documentary?' where id='extra-truth-05';
update public.truth_cards set es='¿Qué objeto tuyo parece basura para los demás pero para ti es un tesoro?',en='What possession looks like junk to others but is a treasure to you?' where id='extra-truth-06';
update public.truth_cards set es='¿Qué frase dices tanto que ya podría ser tu eslogan?',en='What do you say so often it could be your catchphrase?' where id='extra-truth-09';
update public.truth_cards set es='Haz el sonido de una notificación inventada y explica qué desastre anuncia.',en='Make up a notification sound and explain what disaster it announces.' where id='extra-dare-07';
update public.truth_cards set es='Describe nuestra próxima cita como una misión de videojuego: objetivo, obstáculo y recompensa absurda.',en='Describe our next date as a video game quest: goal, obstacle and ridiculous reward.' where id='extra-dare-01';
update public.truth_cards set es='Elige un objeto cercano y dale una historia de origen de supervillano en 20 segundos.',en='Give a nearby object a supervillain origin story in 20 seconds.' where id='extra-dare-03';
update public.truth_cards set es='Deja un mensaje de buzón de voz de diez segundos como si quisieras invitarme a salir pero te pusiera nervioso.',en='Leave a ten-second voicemail as if asking me out made you nervous.' where id='extra-flirty-21';
update public.truth_cards set es='Mírame por cámara e intenta decir un cumplido serio sin sonreír. Sin cámara, hazlo con voz solemne.',en='Look at me on camera and try to give a serious compliment without smiling. Without a camera, use a solemn voice.' where id='extra-flirty-24';
update public.truth_cards set es='Inventa el nombre de una poción para enamorar y su efecto secundario más cómico.',en='Name a fictional love potion and its funniest side effect.' where id='extra-flirty-38';
insert into public.truth_cards(id,kind,tier,es,en) values
('fun-gentle-truth-01','truth','gentle','¿Qué mentira pequeñita has dicho para quedarte cinco minutos más en la cama?','What tiny lie have you told to stay in bed five more minutes?'),
('fun-gentle-truth-02','truth','gentle','¿Qué habilidad inútil presumirías en un concurso de talentos?','What useless skill would you show off in a talent contest?'),
('fun-gentle-truth-03','truth','gentle','¿Qué compra defendiste con «lo necesito» aunque sabías que era puro antojo?','What purchase did you call a necessity when it was really just a treat?'),
('fun-gentle-truth-04','truth','gentle','Si fuéramos villanos de caricatura, ¿qué plan nuestro fracasaría por distraernos?','If we were cartoon villains, which plan would fail because we got distracted?'),
('fun-gentle-truth-05','truth','gentle','¿Qué canción cantas con toda la confianza aunque te inventes la mitad de la letra?','Which song do you sing confidently even though you make up half the lyrics?'),
('fun-gentle-truth-06','truth','gentle','¿Qué cosa buscaste en internet que parecía una pregunta de un extraterrestre?','What have you searched online that sounded like a question from an alien?'),
('fun-gentle-truth-07','truth','gentle','¿En qué reality haríamos el ridículo y quién nos eliminaría primero?','Which reality show would we embarrass ourselves on, and who would get us eliminated?'),
('fun-gentle-truth-08','truth','gentle','¿Qué comida defenderías aunque todo el mundo dijera que es una combinación criminal?','What food combination would you defend even if everyone called it a crime?'),
('fun-gentle-truth-09','truth','gentle','¿Qué escena dramática de tu vida merecía una música de telenovela?','Which dramatic moment in your life deserved a soap opera soundtrack?'),
('fun-gentle-truth-10','truth','gentle','Si pudieras ponerme una advertencia de videojuego, ¿qué diría?','If you could give me a video game warning label, what would it say?'),
('fun-gentle-dare-01','dare','gentle','Vende un objeto que tengas cerca como si fuera el invento del siglo. Tienes 20 segundos.','Sell a nearby object as the invention of the century. You have 20 seconds.'),
('fun-gentle-dare-02','dare','gentle','Da el pronóstico del clima de tu día con voz de presentador muy dramático.','Give a weather forecast for your day in a very dramatic newsreader voice.'),
('fun-gentle-dare-03','dare','gentle','Imita durante diez segundos tu cara cuando dices «ya casi llego» y ni has salido.','Act out your face when you say you are almost there but have not left yet, for ten seconds.'),
('fun-gentle-dare-04','dare','gentle','Defiende en 20 segundos por qué una cuchara sería un gran presidente.','Spend 20 seconds arguing why a spoon would make a great president.'),
('fun-gentle-dare-05','dare','gentle','Habla como un personaje secundario de anime que acaba de descubrir nuestro secreto: nos gustan los snacks.','Speak like an anime side character who just discovered our secret: we love snacks.'),
('fun-gentle-dare-06','dare','gentle','Inventa una excusa absurda por llegar tarde a una reunión de pingüinos.','Invent an absurd excuse for being late to a penguin meeting.'),
('fun-gentle-dare-07','dare','gentle','Haz una entrevista de trabajo para el puesto de catador oficial de siestas.','Give a job interview for the position of official nap tester.'),
('fun-gentle-dare-08','dare','gentle','Cuenta cómo preparas cereal como si narraras una final deportiva.','Describe making cereal as if you were commentating on a sports final.'),
('fun-gentle-dare-09','dare','gentle','Representa tres emojis con la cara; la otra persona intenta adivinarlos. También puedes describirlos con la voz.','Act out three emojis with your face for your partner to guess, or describe them with your voice.'),
('fun-gentle-dare-10','dare','gentle','Improvisa una queja formal de tu almohada porque la abandonaste esta mañana.','Improvise a formal complaint from your pillow about being abandoned this morning.'),
('fun-flirty-truth-01','truth','flirty','¿Qué intento mío de hacerme el interesante te ha dado más ternura que misterio?','Which attempt of mine to look mysterious was more adorable than intriguing?'),
('fun-flirty-truth-02','truth','flirty','¿Qué mensaje mío te hizo sonreír y luego fingir que no estaba pasando nada?','Which message from me made you smile and then pretend nothing was happening?'),
('fun-flirty-truth-03','truth','flirty','Si me estuvieras coqueteando en una tienda, ¿qué pretexto inventarías para hablarme?','If you were flirting with me in a store, what excuse would you use to start talking?'),
('fun-flirty-truth-04','truth','flirty','¿Qué me queda mejor: hacerme inocente o admitir que quiero llamar tu atención?','What suits me better: acting innocent or admitting I want your attention?'),
('fun-flirty-truth-05','truth','flirty','¿Qué detalle mío te distraería aunque intentaras ganar una discusión de broma?','What detail about me would distract you during a playful argument?'),
('fun-flirty-truth-06','truth','flirty','Si nuestra química tuviera una reseña, ¿cuántas estrellas le darías y cuál sería la queja más divertida?','If our chemistry had a review, how many stars would you give it and what would the funniest complaint be?'),
('fun-flirty-truth-07','truth','flirty','¿Qué harías para robarme una sonrisa si yo intentara mantenerme muy serio?','What would you do to steal a smile if I tried to keep a straight face?'),
('fun-flirty-truth-08','truth','flirty','¿Qué cumplido mío te gustaría escuchar otra vez, aunque respondieras «ay, ya»?','Which compliment from me would you like to hear again, even if you pretended to brush it off?'),
('fun-flirty-truth-09','truth','flirty','¿Qué momento cotidiano conmigo podría hacer que se te olvidara lo que ibas a decir?','What everyday moment with me could make you forget what you were about to say?'),
('fun-flirty-truth-10','truth','flirty','Si tuvieras un botón para que yo apareciera a tu lado diez minutos, ¿cuándo lo usarías y qué plan propondrías?','If a button could bring me beside you for ten minutes, when would you use it and what would we do?'),
('fun-flirty-dare-01','dare','flirty','Invítame a una cita con la seguridad de un galán… y el presupuesto de dos tacos.','Ask me on a date with movie-star confidence and a two-taco budget.'),
('fun-flirty-dare-02','dare','flirty','Acúsame de un delito romántico inventado y presenta tu prueba más ridícula.','Accuse me of a made-up romantic crime and present your most ridiculous evidence.'),
('fun-flirty-dare-03','dare','flirty','Dime un piropo malísimo a propósito y después intenta salvarlo con uno que sí te salga del corazón.','Give me a deliberately terrible pickup line, then rescue it with a sincere compliment.'),
('fun-flirty-dare-04','dare','flirty','Haz de agente de soporte: mi problema es que sonrío cada vez que me escribes. Propón una solución coqueta.','Be a support agent: my problem is smiling whenever you text me. Offer a flirty solution.'),
('fun-flirty-dare-05','dare','flirty','Durante 15 segundos intenta conquistarme sin decir nada de mi apariencia.','Try to charm me for 15 seconds without mentioning my appearance.'),
('fun-flirty-dare-06','dare','flirty','Narra nuestra próxima entrada al cine como si fuéramos una pareja de espías demasiado obvios.','Narrate our next cinema entrance as a pair of painfully obvious spies.'),
('fun-flirty-dare-07','dare','flirty','Escribe una notificación ficticia de tu corazón cuando ve que estoy llamando.','Write a fake notification from your heart when it sees me calling.'),
('fun-flirty-dare-08','dare','flirty','Pídeme que reserve un baile contigo como si estuvieras negociando el contrato más importante del año.','Ask me to save you a dance as if negotiating the biggest contract of the year.'),
('fun-flirty-dare-09','dare','flirty','Improvisa dos líneas de una telenovela donde el conflicto sea quién extraña más al otro.','Improvise two soap opera lines about who misses the other person more.'),
('fun-flirty-dare-10','dare','flirty','Dime «me gustas» como un villano que intenta ocultar que está completamente enamorado.','Say you like me as a villain trying to hide being completely smitten.')
on conflict(id) do update set kind=excluded.kind,tier=excluded.tier,es=excluded.es,en=excluded.en;

-- The room lock already serializes draws. Keep history across reconnects and skips.
alter table public.truth_room add column if not exists seen_card_ids text[] not null default '{}';
do $patch$
declare definition text; old_draw text := 'select id into card from public.truth_cards where tier=''gentle'' or both_flirty order by random() limit 1;';
begin
 definition:=pg_get_functiondef('public.truth_action(text,boolean)'::regprocedure);
 if position(old_draw in definition)=0 then
  raise exception 'Unexpected truth_action implementation: review before applying';
 end if;
 definition:=replace(definition,old_draw,$draw$
   select id into card from public.truth_cards
    where (tier='gentle' or both_flirty) and not (id=any(room.seen_card_ids))
    order by random() limit 1;
   if card is null then
    -- Retain ineligible flirty history when playing the gentle deck only.
    update public.truth_room set seen_card_ids=array(
      select c.id from public.truth_cards c
      where c.id=any(room.seen_card_ids) and not (c.tier='gentle' or both_flirty)
    ) where id=1;
    select id into card from public.truth_cards
      where (tier='gentle' or both_flirty)
        and id is distinct from room.seen_card_ids[array_length(room.seen_card_ids,1)]
      order by random() limit 1;
    if card is null then
     select id into card from public.truth_cards where tier='gentle' or both_flirty order by random() limit 1;
    end if;
   end if;
$draw$);
 definition:=replace(definition,
 'set card_id=card,round=round+1,updated_at=now()',
 'set card_id=card,seen_card_ids=array_append(seen_card_ids,card),round=round+1,updated_at=now()');
 execute definition;
end $patch$;
