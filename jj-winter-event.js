'use strict';
const WinterEvent = {
  offeredUser:null,reader:null,opening:false,
  async read(){return state.demo?{revealed:false,stage:0,players:[]}:rpc('jj_winter');},
  async comicRows(){
    const data=await this.read();
    if(!data.completed_at)return [];
    return ['es','en'].map(language=>({
      id:'winter-event-'+language,winterEvent:true,owner_id:null,position:0,
      title:language==='es'?'La última luz de Halloween':'The Last Light of Halloween',
      created_at:data.completed_at,pages:['assets/winter-event/page-1.webp'],
      page_text:{__comic_language:{code:language},__comic_cover:{path:'assets/winter-event/page-1.webp'}}
    }));
  }
};
const winterSymbols={moon:'☾',bell:'<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 20a2 2 0 0 0 4 0"/></svg>',star:'✦',snow:'❄'};
const winterNames={
 moon:['Luna','Moon'],bell:['Campana','Bell'],star:['Estrella','Star'],snow:['Copo','Snowflake']
};
function winterObject(value){return '<span aria-hidden="true">'+winterSymbols[value]+'</span> '+bi(...winterNames[value]);}
function winterRoute(stage){
 const stops=[['Castillo','Castle'],['Puente','Bridge'],['Estrella','Star'],['Cómic','Comic']];
 return '<ol class="winter-route" aria-label="'+say('Ruta de la aventura','Adventure route')+'">'+stops.map((label,i)=>{
  const step=i+1,done=stage>step;
  return '<li '+(stage===step?'aria-current="step"':'')+'><span aria-hidden="true">'+(done?'✓':step)+'</span>'+bi(...label)+(done?'<span class="winter-sr">'+bi('Completado','Complete')+'</span>':'')+'</li>';
 }).join('')+'</ol>';
}
function winterMeter(value,total,es,en){
 return '<div class="winter-meter"><div>'+bi(es,en)+' <strong>'+value+' / '+total+'</strong></div><progress max="'+total+'" value="'+value+'" aria-label="'+say(es,en)+'"></progress></div>';
}
function winterTurn(mine,partner){
 return '<div class="winter-turn" data-mine="'+mine+'"><span aria-hidden="true">'+(mine?'✦':'◇')+'</span><strong>'+
  (mine?bi('Tu turno','Your turn'):bi('Comparte la pista con','Share the clue with')+' '+partner)+'</strong></div>';
}
function winterHeading(){return lifeHeading('La última luz de Halloween','The Last Light of Halloween','Una aventura de dos para encender nuestra Navidad.','A two-player adventure to light up our Christmas.');}
function winterError(error){
 const message=String(error?.message||error);
 if(message.includes('PARTNER_TURN'))return say('Esta pista le toca a tu pareja.','This clue is your partner’s turn.');
 if(message.includes('WAIT_PARTNER'))return say('Esperemos a que los dos entren a la aventura.','Wait until both of you have joined.');
 if(message.includes('TRY_BRIDGE'))return say('El puente aún no encaja. Comparen las pistas y cambien las losetas.','The bridge is not ready. Compare clues and swap the tiles.');
 if(message.includes('TRY_AGAIN'))return say('Ese objeto no responde. Pregúntale a tu pareja por la pista.','That object does not respond. Ask your partner about the clue.');
 if(message.includes('EVENT_CHANGED'))return say('El progreso cambió. Ya estoy actualizando la escena.','Progress changed. Refreshing the scene.');
 return say('No se pudo guardar. Tu progreso sigue protegido; reintenta con conexión.','Could not save. Your progress is safe; retry when connected.');
}
flowers=async function(v){
 const owner=state.profile.id,current=()=>state.version===v&&state.profile?.id===owner;
 let data=null,busy=false,polling=false,stopped=false,last='',hint=false,notice='',cancelCharge=()=>{};
 $('#main').innerHTML=winterHeading()+'<p role="status">'+bi('Abriendo la puerta…','Opening the door…')+'</p>';
 JJ.cleanups.push(()=>{stopped=true;cancelCharge();});
 async function refresh(){
  if(stopped||!current()||polling||busy||document.hidden)return;
  polling=true;
  try{
   const next=await WinterEvent.read();
   if(!current()||stopped||busy||(next.revision??0)<(data?.revision??0))return;
   const signature=JSON.stringify(next);
   if(next.stage===5&&data?.stage!==5)await loadSeason();
   if(!current()||stopped)return;
   data=next;
   if(signature!==last){last=signature;paint();}
   if(data.stage===4)offerWinterComic(data);
  }catch(error){
   if(current()&&!data){$('#main').innerHTML=winterHeading()+jjButton('winter-retry','Reintentar','Retry');$('#winter-retry').onclick=refresh;}
  }finally{polling=false;}
 }
 async function act(action,step=null,value=null){
  if(busy||!current())return;
  busy=true;
  $('#winter-status').textContent=say('Guardando…','Saving…');
  $('#winter-event').querySelectorAll('button[data-action]').forEach(b=>b.disabled=true);
  notice='';
  try{
   const next=await rpc('jj_winter',{p_action:action,p_step:step,p_value:value,p_revision:data.revision});
   if(current()){data=next;last=JSON.stringify(data);hint=false;}
  }catch(error){notice=winterError(error);last='';}
  finally{
   busy=false;
   if(current()){paint();if(data?.stage===4)offerWinterComic(data);await refresh();}
  }
 }
 function paint(){
  if(!current()||!data)return;
  const focused=document.activeElement;
  const focusAction=focused?.closest('#winter-event')?focused.dataset.action:null;
  const focusStep=focused?.dataset.step,focusValue=focused?.dataset.value;
  cancelCharge();
  const joined=(data.players||[]).some(p=>p.id===owner),isJesus=state.profile.handle==='jesus';
  const partner=isJesus?'Julissa':'Jesús';
  let body='';
  if(!data.revealed){
   body='<div class="winter-intro"><span class="eyebrow">'+bi('Evento cooperativo · 15–20 min','Cooperative event · 15–20 min')+'</span><h2>'+bi('Las calabazas están soltando nieve.','The pumpkins are leaking snow.')+'</h2><p>'+bi('Sarai encontró una estrella en el castillo. Tobey intentó arreglar el árbol… y ahora tiene colmillos.','Sarai found a star in the castle. Tobey tried fixing the tree… now it has fangs.')+'</p>'+
    (isJesus?'<p>'+bi('Cuando estés listo, abre el evento e invita a Julie a entrar a Eventos desde su perfil.','When you are ready, open the event and invite Julie to Events from her profile.')+'</p><button class="btn" data-action="reveal">'+bi('Abrir evento para los dos','Open event for both of us')+'</button>':'<p>'+bi('La próxima aventura está esperando su momento.','Your next adventure is waiting for its moment.')+'</p>')+'</div>';
  }else if(data.stage===0){
   body='<h2>'+bi('Una estrella, dos investigadores','One star, two investigators')+'</h2><p>'+bi('Cada quien recibe pistas diferentes. Hablen por videollamada y mantengan esta página abierta en sus dos perfiles. Pueden retomar si se desconectan.','Each of you receives different clues. Talk on a video call and keep this page open on both profiles. You can resume if disconnected.')+'</p><ul class="winter-players">'+['jesus','julisa'].map(handle=>'<li data-ready="'+data.players.some(p=>p.handle===handle)+'"><strong>'+esc(names[handle])+'</strong><span>'+ (data.players.some(p=>p.handle===handle)?bi('✓ Listo','✓ Ready'):bi('Esperando','Waiting'))+'</span></li>').join('')+'</ul>'+
    (!joined?'<button class="btn" data-action="join">'+bi('Entrar a la aventura','Join the adventure')+'</button>':'<button class="btn" data-action="start" '+(data.players.length<2?'disabled':'')+'>'+bi('Cruzar la puerta','Enter the castle')+'</button>'+(data.players.length<2?'<p class="winter-wait">'+bi('Esperando a','Waiting for')+' '+partner+'</p>':''));
  }else if(!joined){
   body='<p>'+bi('Tu pareja ya entró. Únete para retomar su progreso.','Your partner has joined. Join to share their progress.')+'</p><button class="btn" data-action="join">'+bi('Unirme','Join')+'</button>';
  }else if(data.stage===1){
   const actor=['jesus','julisa','jesus'][data.hunt],mine=state.profile.handle===actor;
   const clue=[
    ['El farol correcto lleva el símbolo que cambia de forma en el cielo: una luna.','The right lantern bears the shape that changes in the sky: a moon.'],
    ['El libro correcto tiene el símbolo del invierno: un copo de nieve.','The right book bears the symbol of winter: a snowflake.'],
    ['El último escondite tiene un símbolo que suena al moverse: una campana.','The final hiding place has a symbol that rings when moved: a bell.']
   ][data.hunt];
   body='<h2>'+bi('1 · El castillo de las pistas','1 · The castle of clues')+'</h2>'+winterMeter(data.hunt,3,'Objetos recuperados','Objects recovered')+winterTurn(mine,partner)+
    (mine?'<p>'+bi('Busca entre los cuatro símbolos. La pista está en la pantalla de','Search the four symbols. The clue is on the screen of')+' '+partner+'.</p><div class="winter-objects">'+Object.keys(winterSymbols).map(value=>'<button data-action="hunt" data-step="'+data.hunt+'" data-value="'+value+'">'+winterObject(value)+'</button>').join('')+'</div>':
     '<div class="winter-clue"><h3>'+bi('Tu pista para','Your clue for')+' '+partner+'</h3><p>'+bi(...clue)+'</p><small>'+bi('Descríbesela. Tu pareja elige el objeto.','Describe it. Your partner chooses the object.')+'</small></div>');
  }else if(data.stage===2){
   body='<h2>'+bi('2 · El puente de las dos estaciones','2 · The bridge between seasons')+'</h2><p>'+bi('Cambien dos losetas vecinas con las flechas. Cada cambio retira las confirmaciones anteriores.','Use the arrows to swap neighboring tiles. Each swap clears the previous confirmations.')+'</p>'+
    (isJesus?'<p>'+bi('Tú ves los símbolos. Julie tiene las reglas para ordenarlos.','You see the symbols. Julie has the rules to put them in order.')+'</p>':
    '<div class="winter-clue"><p>'+bi('La luna va primero. La campana sigue a la luna. La estrella va antes del copo. El copo cierra el puente.','The moon goes first. The bell follows the moon. The star comes before the snowflake. The snowflake ends the bridge.')+'</p></div>')+
    '<div class="winter-bridge">'+data.bridge.map((value,i)=>'<div class="winter-tile">'+(isJesus?winterObject(value):'<span>'+(i+1)+'</span>')+'</div>'+(i<3?'<button data-action="swap" data-step="'+(i+1)+'" aria-label="'+say('Intercambiar posiciones ','Swap positions ')+(i+1)+' '+(i+2)+'">⇄</button>':'')).join('')+'</div><button class="btn" data-action="bridge_ready" '+(data.bridge_ready.includes(owner)?'disabled':'')+'>'+(data.bridge_ready.includes(owner)?bi('✓ Esperando a tu pareja','✓ Waiting for your partner'):bi('Estoy listo para cruzar','I am ready to cross'))+'</button><p>'+bi('Confirmaciones','Confirmations')+' '+data.bridge_ready.length+'/2</p>';
  }else if(data.stage===3){
   const actor=['jesus','julisa','jesus','julisa','jesus'][data.lights],mine=actor===state.profile.handle;
   const answer=['bell','star','moon','snow','star'][data.lights];
   body='<h2>'+bi('3 · Encender la estrella','3 · Light the star')+'</h2>'+winterMeter(data.lights,5,'Adornos iluminados','Lit ornaments');
   if(data.lights===5){
    body+='<p>'+bi('Los adornos están listos. Cada uno mantenga pulsado el botón dos segundos para cargar la estrella.','The ornaments are ready. Each of you hold the button for two seconds to charge the star.')+'</p><button class="btn winter-charge" id="winter-charge" '+(data.final_ready.includes(owner)?'disabled':'')+'>'+(data.final_ready.includes(owner)?bi('✓ Tu luz está lista','✓ Your light is ready'):bi('Mantén pulsado 2 segundos','Hold for 2 seconds'))+'</button><p>'+bi('Estrella cargada por','Star charged by')+' '+data.final_ready.length+'/2</p>';
   }else body+=winterTurn(mine,partner)+(mine?'<p>'+bi('Te toca. Pídele a','Your turn. Ask')+' '+partner+' '+bi('el siguiente adorno.','for the next ornament.')+'</p><div class="winter-objects">'+Object.keys(winterSymbols).map(value=>'<button data-action="light" data-step="'+data.lights+'" data-value="'+value+'">'+winterObject(value)+'</button>').join('')+'</div>':'<div class="winter-clue"><h3>'+bi('Dile a','Tell')+' '+partner+'</h3><p>'+bi('El siguiente adorno es','The next ornament is')+' '+winterObject(answer)+'.</p></div>');
  }else if(data.stage===4){
   const me=data.players.find(p=>p.id===owner);
   body='<h2>'+bi('La estrella tiene una historia que contar','The star has a story to tell')+'</h2><p>'+bi('Lean el desenlace en su idioma. Cuando ambos terminen, la Navidad se encenderá para los dos.','Read the ending in your own language. When both finish, Christmas lights up for both of you.')+'</p>'+
    (me?.read_at?'<p>'+bi('Tu lectura está lista. Esperando a','You finished reading. Waiting for')+' '+partner+'.</p>':'<button class="btn" id="winter-read">'+bi('Continuar el cómic','Continue the comic')+'</button>');
  }else{
   body='<h2>'+bi('Nuestra primera luz de Navidad','Our first Christmas light')+'</h2><p>'+bi('Lo encendimos juntos.','We lit it together.')+'</p><p>'+new Date(data.completed_at).toLocaleDateString(UniverseI18n.locale())+'</p><button class="btn" id="winter-archive">'+bi('Volver a leer el cómic','Read the comic again')+'</button><p>'+bi('También lo encuentran en Cómics, en español e inglés.','You can also find it in Comics, in Spanish and English.')+'</p>';
  }
  const pet=JJPets.data?.equipped;
  $('#main').innerHTML=winterHeading()+(data.revealed?winterRoute(data.stage):'')+'<section id="winter-event" class="winter-event winter-stage-'+data.stage+'"><div class="winter-scene" aria-hidden="true"></div><div class="winter-content">'+body+'<p id="winter-status" role="status" aria-live="polite">'+esc(notice)+'</p></div></section>'+
   (data.revealed&&data.stage>0&&data.stage<4?'<aside class="winter-guide"><button id="winter-hint" class="btn secondary">'+(pet?petPicture(pet):'✦')+bi('Pedir una pista','Ask for a hint')+'</button><p id="winter-hint-text" '+(hint?'':'hidden')+'>'+bi('Comparen sus pantallas: una tiene la pista y la otra la acción. Pueden reintentar sin perder lo que ya resolvieron.','Compare screens: one has the clue and the other the action. Retry without losing what you have solved.')+'</p></aside>':'');
  document.querySelectorAll('#winter-event [data-action]').forEach(button=>button.onclick=()=>act(button.dataset.action,button.dataset.step?Number(button.dataset.step):null,button.dataset.value||null));
  if(focusAction){
   [...document.querySelectorAll('#winter-event button[data-action]')].find(button=>
    !button.disabled&&button.dataset.action===focusAction&&button.dataset.step===focusStep&&button.dataset.value===focusValue
   )?.focus({preventScroll:true});
  }
  if($('#winter-hint'))$('#winter-hint').onclick=()=>{hint=!hint;$('#winter-hint-text').hidden=!hint;};
  if($('#winter-read'))$('#winter-read').onclick=()=>openWinterComic(data,true);
  if($('#winter-archive'))$('#winter-archive').onclick=()=>openWinterComic(data,false);
  const charge=$('#winter-charge');
  if(charge){
   let timer=null;
   const cancel=()=>{clearTimeout(timer);timer=null;charge.classList.remove('charging');};
   const begin=()=>{if(charge.disabled||timer)return;charge.classList.add('charging');timer=setTimeout(()=>{cancel();act('charge');},2000);};
   charge.onpointerdown=e=>{charge.setPointerCapture(e.pointerId);begin();};
   charge.onpointerup=cancel;charge.onpointercancel=cancel;charge.onlostpointercapture=cancel;
   charge.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();begin();}};
   charge.onkeyup=cancel;charge.onblur=cancel;cancelCharge=cancel;
  }
 }
 const timer=setInterval(refresh,2000);JJ.cleanups.push(()=>clearInterval(timer));await refresh();
};

const winterStory=[
 {
  title:['La calabaza que nevaba','The pumpkin that snowed'],
  narration:['La última noche del castillo se resistía a terminar. Dentro de una calabaza, una estrella llevaba semanas esperando a que alguien escuchara sus campanas.','The castle’s final night refused to end. Inside a pumpkin, a star had waited for weeks for someone to hear its bells.'],
  lines:[
   ['Jesús','¿Desde cuándo guardamos el invierno en una calabaza?','Since when do we keep winter in a pumpkin?'],
   ['Julissa','Desde que alguien dijo: «Aquí seguro no se pierde».','Since someone said, “We definitely won’t lose it here.”'],
   ['Estrella / Star','Llévenme a la plaza. Todavía podemos encender nuestra Navidad.','Take me to the square. We can still light up our Christmas.']
  ]
 },
 {
  title:['Un puente para dos','A bridge for two'],
  narration:['Los símbolos se ordenaron con dos voces. El puente apareció donde acababan las hojas de otoño y empezaba la primera nieve.','Two voices put the symbols in order. A bridge appeared where autumn leaves ended and the first snow began.'],
  lines:[
   ['Jesús','Si me resbalo, salva la estrella.','If I slip, save the star.'],
   ['Julissa','Puedo salvar las dos cosas. Dame la mano.','I can save both. Give me your hand.'],
   ['Jesús','Ese plan me gusta bastante más.','I like that plan a lot better.']
  ]
 },
 {
  title:['Decoración experimental','Experimental decorations'],
  narration:['Sarai y Tobey habían preparado el árbol. Las telarañas eran resistentes, económicas y bastante difíciles de quitar. El fantasma de la punta había empezado a cobrar por hora.','Sarai and Tobey had prepared the tree. Cobwebs were sturdy, affordable and surprisingly hard to remove. The ghost on top had started charging by the hour.'],
  lines:[
   ['Tobey','La idea era que la estrella pareciera flotar.','The idea was to make the star look like it was floating.'],
   ['Sarai','Pusiste un fantasma y le dijiste que brillara.','You put a ghost up there and told it to glow.'],
   ['Julissa','Tiene derecho a una bufanda. Lleva rato trabajando.','It deserves a scarf. It’s been working for a while.']
  ]
 },
 {
  title:['El transporte ya está resuelto','Transportation is handled'],
  narration:['La estrella por fin tenía luz. Faltaba llevarla al centro de la plaza. Tobey encontró un trineo y anunció su solución con una confianza peligrosa.','The star finally had its light. They only needed to carry it to the center of the square. Tobey found a sleigh and announced his solution with dangerous confidence.'],
  lines:[
   ['Tobey','¡Listo! Ya tenemos transporte.','Done! We have transportation.'],
   ['Sarai','Y vestuario. Muy importante el vestuario.','And costumes. Costumes are very important.'],
   ['Jesús','¿Por qué esas dos bolsas tienen cuernos?','Why do those two bags have antlers?']
  ]
 },
 {
  title:['Las decisiones de la estrella','The star’s decisions'],
  narration:['Julissa y Sarai encontraron capas de Santa. Jesús y Tobey encontraron dos trajes de reno sospechosamente de su talla. Nadie pudo localizar el recibo.','Julissa and Sarai found Santa coats. Jesús and Tobey found two reindeer suits suspiciously close to their sizes. Nobody could find the receipt.'],
  lines:[
   ['Jesús','¿Quién decidió nuestros papeles?','Who decided our roles?'],
   ['Julissa','La estrella. Yo respeto mucho sus decisiones.','The star. I have great respect for its decisions.'],
   ['Tobey','Por lo menos el mío tiene bolsillos.','At least mine has pockets.'],
   ['Sarai','Perfecto. Guarda ahí tu dignidad mientras llegamos.','Perfect. Keep your dignity in there until we arrive.']
  ]
 },
 {
  title:['Nuestra primera luz','Our first light'],
  narration:['En la plaza, la estrella encontró su lugar. Halloween dejó una última chispa en las luces del árbol. La primera nieve cayó sobre los cuatro.','In the square, the star found its place. Halloween left one last spark in the tree’s lights. The first snow fell over all four friends.'],
  lines:[
   ['Julissa','Ya llegamos.','We made it.'],
   ['Jesús','Sí. Y quiero quedarme un rato contigo.','We did. And I want to stay here with you a little longer.'],
   ['Sarai','¿Foto antes de que se quiten los cuernos?','Photo before they take the antlers off?'],
   ['Tobey','Ahora ya me encariñé con los bolsillos.','I’ve grown attached to the pockets now.']
  ]
 }
];
function offerWinterComic(data){
 const me=data.players?.find(p=>p.id===state.profile?.id);
 if(data.stage!==4||!me||me.read_at||WinterEvent.reader||WinterEvent.offeredUser===state.profile.id)return;
 WinterEvent.offeredUser=state.profile.id;
 openWinterComic(data,true);
}
async function openWinterComic(initial,live=false,language=UniverseI18n.language){
 if(WinterEvent.reader||WinterEvent.opening)return;
 const owner=state.profile?.id;
 WinterEvent.opening=true;
 let data=initial;
 try{if(live)data=await WinterEvent.read();}
 catch(error){toast(winterError(error));return;}
 finally{WinterEvent.opening=false;}
 if(owner!==state.profile?.id)return;
 let page=live?(data.players.find(p=>p.id===owner)?.page||0):0,busy=false;
 let lang=language==='en'?'en':'es';
 const dialog=document.createElement('dialog');dialog.className='winter-reader';
 dialog.setAttribute('aria-label',lang==='es'?'La última luz de Halloween':'The Last Light of Halloween');
 WinterEvent.reader=dialog;document.body.append(dialog);
 function close(){clearInterval(timer);dialog.close();dialog.remove();WinterEvent.reader=null;}
 function render(){
  const t=winterStory[page],l=lang==='en'?1:0,me=data.players?.find(p=>p.id===owner);
  const finished=live&&!!me?.read_at;
  dialog.innerHTML='<div class="winter-reader-bar"><span>'+ (lang==='es'?'La última luz de Halloween':'The Last Light of Halloween')+'</span><div><button data-language-choice="es" aria-pressed="'+(lang==='es')+'">ES</button><button data-language-choice="en" aria-pressed="'+(lang==='en')+'">EN</button><button id="winter-close" aria-label="'+(lang==='es'?'Cerrar y retomar después':'Close and resume later')+'">×</button></div></div>'+
   '<article class="winter-comic-page"><div class="winter-comic-art"><img src="'+(page===5?'assets/christmas/plaza.webp':'assets/winter-event/page-'+(page+1)+'.webp')+'" alt="'+esc(t.title[l])+'"><h2>'+esc(t.title[l])+'</h2></div><div class="winter-comic-script"><p class="winter-narrator">'+esc(t.narration[l])+'</p>'+t.lines.map(line=>'<p class="winter-speech"><strong>'+esc(line[0])+'</strong><span>'+esc(line[l+1])+'</span></p>').join('')+'</div></article>'+
   '<footer class="winter-reader-footer"><button id="winter-prev" '+(page===0||busy?'disabled':'')+'>'+(lang==='es'?'Anterior':'Previous')+'</button><span class="winter-reader-count">'+(page+1)+' / 6<progress max="6" value="'+(page+1)+'" aria-label="'+(lang==='es'?'Progreso del cómic':'Comic progress')+'"></progress></span>'+
   (page<5?'<button id="winter-next" '+(busy?'disabled':'')+'>'+(lang==='es'?'Siguiente':'Next')+'</button>':
    live?'<button id="winter-finish" '+(busy||finished?'disabled':'')+'>'+(finished?(lang==='es'?'Lectura terminada':'Reading complete'):(lang==='es'?'Encender nuestra Navidad':'Light up our Christmas'))+'</button>':'<button id="winter-end">'+(lang==='es'?'Cerrar cómic':'Close comic')+'</button>')+'</footer><p id="winter-reader-status" role="status">'+
    (finished?(data.stage===5?(lang==='es'?'Navidad encendida para los dos. El cómic ya está en Cómics.':'Christmas is on for both of you. The story is now in Comics.'):(lang==='es'?'Esperando a tu pareja. Tu lectura ya quedó guardada.':'Waiting for your partner. Your reading is saved.')):'')+'</p>';
  $('#winter-close',dialog).onclick=close;
  dialog.querySelectorAll('[data-language-choice]').forEach(button=>button.onclick=()=>{lang=button.dataset.languageChoice;render();});
  $('#winter-prev',dialog).onclick=()=>{page--;render();$('.winter-comic-page',dialog).scrollTop=0;};
  if($('#winter-next',dialog))$('#winter-next',dialog).onclick=async()=>{
   busy=true;render();
   try{
    if(live)data=await rpc('jj_winter',{p_action:'page',p_step:page+1});
    page++;busy=false;render();$('.winter-comic-page',dialog).scrollTop=0;
   }catch(error){$('#winter-reader-status',dialog).textContent=winterError(error);}
   finally{busy=false;$('#winter-next',dialog)?.removeAttribute('disabled');$('#winter-prev',dialog).disabled=page===0;}
  };
  if($('#winter-finish',dialog))$('#winter-finish',dialog).onclick=async()=>{
   if(busy)return;busy=true;
   try{
    data=await rpc('jj_winter',{p_action:'finish'});
    if(data.stage===5){await loadSeason();if(state.profile?.id===owner)await navigate('flowers');}
    render();
   }catch(error){$('#winter-reader-status',dialog).textContent=winterError(error);}
   finally{busy=false;}
  };
  if($('#winter-end',dialog))$('#winter-end',dialog).onclick=close;
 }
 const timer=setInterval(async()=>{
  if(!live||busy||document.hidden||!dialog.open)return;
  if(state.profile?.id!==owner){close();return;}
  try{
   const next=await WinterEvent.read(),changed=next.stage!==data.stage;
   data=next;
   if(changed&&next.stage===5){await loadSeason();if(state.profile?.id===owner&&state.page==='flowers')await navigate('flowers');render();}
  }catch{}
 },2000);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 render();dialog.showModal();
}
const winterShell=shell;
shell=function(){
 winterShell();
 if(!state.demo&&state.profile){
  const owner=state.profile.id;
  WinterEvent.read().then(data=>{if(state.profile?.id===owner)offerWinterComic(data);}).catch(()=>{});
 }
};
const winterLogout=logout;
logout=async function(){WinterEvent.reader?.dispatchEvent(new Event('cancel',{cancelable:true}));WinterEvent.offeredUser=null;return winterLogout();};
