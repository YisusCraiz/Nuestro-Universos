'use strict';
(() => {
 const welcomeModule=()=>import('./dev/yuki-welcome.js?v=2');
 const entry=['yuki','✧','Primer aniversario'];menus.push(entry);
 let eventState=null,viewerId=null,loading=null,host=null,dispose=null,revision=0,roomDispose=null,chatDispose=null,roomRevision=0,nextTab=null;
 const visibleKey=()=>`nuestro-universo.yuki.visible.${state.profile?.id}`;
 const avatarVisible=()=>{try{return localStorage.getItem(visibleKey())!=='false'}catch{return true}};
 const owner=()=>state.profile?.handle==='jesus';
 const allowed=()=>!state.demo && (owner() || (JJSections.values?.yuki===true && eventState?.unlocked===true));
 function label(){return eventState?.unlocked?'Yuki':say('Primer aniversario','First anniversary');}
 function paintLabel(){
  const text=label();entry[2]=text;
  document.querySelectorAll('[data-nav="yuki"]').forEach(el=>{if(el.dataset.yukiLabel!==text){el.dataset.yukiLabel=text;el.replaceChildren();const icon=document.createElement('span');icon.className='icon';icon.textContent='✧';el.append(icon,text);}});
 }
 async function loadEvent(force=false){
  const id=state.profile?.id;if(!id||state.demo)return null;
  if(loading?.id===id)return loading.promise;
  if(!force && viewerId===id && eventState)return eventState;
  const request=++revision;
  const promise=(async()=>{try{const data=await rpc('yuki_event');if(request===revision&&state.profile?.id===id){eventState=data;viewerId=id;paintLabel();sync();}return data;}catch{if(request===revision){eventState=null;viewerId=id;sync();}return null;}})();
  loading={id,promise};try{return await promise}finally{if(loading?.promise===promise)loading=null}
 }
 function sync(){
  const id=state.profile?.id;
  if(viewerId!==id){eventState=null;viewerId=id;if(id&&!state.demo)loadEvent(true);}
  const show=id && state.page!=='yuki' && allowed() && avatarVisible() && document.getElementById('primary-nav');
  if(host&&(!show || !host.isConnected || host.dataset.owner!==id)){dispose?.();dispose=null;host.remove();host=null;}
  if(!show||host)return;
  const current=document.createElement('div');current.dataset.owner=id;host=current;document.body.append(current);
  import('./dev/yuki-avatar.js?v=room-5').then(({mountYuki})=>{if(host===current&&state.profile?.id===id&&allowed())dispose=mountYuki(current);}).catch(()=>{if(host===current){current.remove();host=null;}});
 }
 function closeRoom(){roomRevision++;roomDispose?.();roomDispose=null;chatDispose?.();chatDispose=null;}
 async function roomChat(){
  if(chatDispose||!allowed())return;
  const id=state.profile.id,version=roomRevision,current=document.createElement('div');document.body.append(current);
  let cleanup;const close=()=>{cleanup?.();current.remove();if(chatDispose===close)chatDispose=null;};chatDispose=close;
  try{const {mountYuki}=await import('./dev/yuki-avatar.js?v=room-5');if(roomRevision!==version||state.profile?.id!==id||!current.isConnected){close();return;}cleanup=mountYuki(current);current.shadowRoot.querySelector('aside').hidden=true;current.shadowRoot.querySelector('dialog').addEventListener('close',close,{once:true});current.openYuki();}catch{close();}
 }
 async function showRoom(target,v,initialTab='room'){
  const version=roomRevision;
  try{const {mountRoom}=await import('./dev/yuki-room.js?v=room-10');if(v!==state.version||version!==roomRevision)return;const cleanup=await mountRoom(target,{initialTab,onChat:roomChat,preview:!eventState?.unlocked});if(v!==state.version||version!==roomRevision)cleanup();else roomDispose=cleanup;}
  catch{if(v===state.version){target.textContent=say('No se pudo abrir el cuarto. Vuelve a intentarlo.','Could not open the room. Please try again.');}}
 }
 function shopEntry(){
  if(state.page!=='shop'||!allowed()||document.getElementById('yuki-shop-entry'))return;
  const card=document.createElement('section');card.id='yuki-shop-entry';card.className='game-panel';
  const h=document.createElement('h2');h.textContent=say('Yuki · ropa y decoración','Yuki · outfits and decor');
  const p=document.createElement('p');p.textContent=say('Un nuevo look y un rincón acogedor. Usa tus monedas JJ para ampliar tu colección.','A new look and a cozy corner. Use your JJ coins to grow your collection.');
  const b=document.createElement('button');b.className='btn';b.textContent=say('Visitar la tienda de Yuki','Visit Yuki’s shop');b.onclick=()=>{nextTab='shop';navigate('yuki')};card.append(h,p,b);$('#main').prepend(card);
 }
 window.YukiHub={sync};
 const previousProfile=profilePage;
 profilePage=async function(v){
  await previousProfile(v);if(v!==state.version||state.demo||(!owner()&&!sectionAllowed('yuki')))return;
  await loadEvent(true);if(v!==state.version)return;
  const card=document.createElement('section');card.className='game-panel';card.id='yuki-profile-controls';
  const title=document.createElement('h2');title.textContent='✧ '+say('Yuki y el primer aniversario','Yuki and the first anniversary');
  const text=document.createElement('p');text.textContent=say('Controla la presencia de Yuki y prepara su bienvenida.','Choose when Yuki appears and prepare her welcome.');
  const toggle=document.createElement('button');toggle.className='btn secondary';
  const caption=()=>toggle.textContent=avatarVisible()?say('Ocultar mi avatar de Yuki','Hide my Yuki avatar'):say('Mostrar mi avatar de Yuki','Show my Yuki avatar');caption();
  toggle.onclick=()=>{try{localStorage.setItem(visibleKey(),String(!avatarVisible()))}catch{}caption();sync();};
  card.append(title,text,toggle);
  if(owner()){
   const row=document.createElement('label');row.className='row';row.style.margin='18px 0';const box=document.createElement('input');box.type='checkbox';box.checked=JJSections.values?.yuki===true;
   const msg=document.createElement('p');msg.setAttribute('role','status');
   row.append(box,say('Mostrar Primer aniversario / Yuki a Julie','Show First anniversary / Yuki to Julie'));card.append(row,msg);
   box.onchange=async()=>{box.disabled=true;try{JJSections.values=await rpc('jj_sections',{p_section:'yuki',p_visible:box.checked});await loadEvent(true);document.querySelectorAll('[data-section-toggle="yuki"]').forEach(el=>el.checked=box.checked);msg.textContent=say('Guardado. Julie verá el cambio en unos segundos.','Saved. Julie will see the change shortly.');}catch{box.checked=!box.checked;msg.textContent=say('No se guardó. Inténtalo de nuevo.','Could not save. Please try again.');}finally{box.disabled=false;}};
  }
  const open=document.createElement('button');open.className='btn';open.textContent=eventState?.unlocked?say('Abrir Yuki','Open Yuki'):say('Ver Primer aniversario','Open First anniversary');open.onclick=()=>navigate('yuki');card.append(open);
  if(owner()&&!eventState?.unlocked){const prepare=document.createElement('button');prepare.className='btn secondary';prepare.textContent=say('Preparar mi cuarto de Yuki','Prepare my Yuki room');prepare.onclick=()=>{nextTab='room';navigate('yuki')};card.append(prepare);}
  if(owner())welcomeModule().then(({welcomeEditor})=>{if(v===state.version&&card.isConnected)card.append(welcomeEditor());}).catch(()=>{});
  if(eventState?.unlocked){
   const replay=document.createElement('button');replay.className='btn secondary';
   replay.textContent=say('Ver la bienvenida de Yuki','See Yuki’s welcome');
   replay.onclick=()=>renderEvent($('#main'),eventState,v);
   card.append(replay);
  }
  $('#main').prepend(card);
 };
 const previousNavigate=navigate;
 navigate=async function(page){
  closeRoom();
  if(page!=='yuki'){nextTab=null;await previousNavigate(page);sync();if(page==='shop'){await loadEvent();shopEntry();}return;}
  if(!state.profile)return;
  await loadSections();if(!sectionAllowed('yuki'))return previousNavigate('home');
  jjCleanup();clearTimers();state.page='yuki';const v=++state.version;
  const data=await loadEvent(true);if(v!==state.version)return;
  rememberRoute(historyRoute('yuki'));shell();window.scrollTo(0,0);paintLabel();
  if(!data){$('#main').innerHTML='<p role="status"></p>';$('#main p').textContent=say('No se pudo cargar. Vuelve a abrir este apartado.','Could not load. Please reopen this section.');return;}
  const requestedTab=nextTab;nextTab=null;
  if(data.unlocked||(owner()&&requestedTab)){await showRoom($('#main'),v,requestedTab||'room');}else renderEvent($('#main'),data,v);
 };
 function renderEvent(target,data,v,preview=false){
  let step=preview?0:data.step, letters='', busy=false, sparks=0;
  const rehearsal=preview||(owner()&&!data.visible&&!data.unlocked);
  target.innerHTML=`<style>.yuki-event{max-width:760px;margin:20px auto;padding:clamp(24px,6vw,54px);border:1px solid #d0b5f440;border-radius:32px;background:radial-gradient(ellipse at top,#58417590,transparent 65%),#171326;color:#f4edf9;text-align:center;box-shadow:0 22px 80px #0003}.yuki-event h1{font-size:clamp(30px,6vw,48px);line-height:1.1}.yuki-event p{line-height:1.8;color:#d4c5df}.yuki-lights{display:flex;justify-content:center;gap:24px;margin:30px 0;font-size:34px}.yuki-lights span{color:#766084;transition:color .3s,text-shadow .3s}.yuki-lights .lit{color:#ffe0a2;text-shadow:0 0 24px #ffc978}.yuki-event button{margin:8px;min-height:48px}.yuki-event .choices{display:grid;gap:10px}.yuki-event .choices button{padding:16px;border-radius:18px}.yuki-event .letters button{font-size:23px;width:58px}.yuki-event output{display:block;font-size:30px;letter-spacing:.3em;min-height:48px}.yuki-event small{color:#d4b5eb}</style><section class="yuki-event"><small></small><h1></h1><div class="yuki-lights" aria-label="${say('Luces encendidas','Lights lit')}"><span>✦</span><span>✦</span><span>✦</span></div><div class="event-content"></div><p class="event-status" role="status"></p></section>`;
  target.insertAdjacentHTML('afterbegin', '<style>.yuki-comic-gift{margin:16px 0}.yuki-comic-reader{width:min(94vw,690px);max-height:90dvh;overflow:auto;padding:12px;color:#f4edf9;background:#20182e;border:1px solid #b98bbd;border-radius:16px}.yuki-comic-reader::backdrop{background:#10091bda}.yuki-comic-reader nav{position:sticky;top:0;display:flex;gap:5px;flex-wrap:wrap;background:#20182e;padding:5px;z-index:1}.yuki-comic-reader nav button{padding:6px 8px;min-height:36px}.yuki-comic-reader img{display:block;width:100%;height:auto;margin:auto}.yuki-comic-reader img[hidden]{display:none}</style>');
  const root=target.querySelector('.yuki-event'),content=root.querySelector('.event-content'),status=root.querySelector('.event-status');
  const button=(text,fn)=>{const b=document.createElement('button');b.className='btn secondary';b.textContent=text;b.onclick=fn;return b;};
  async function advance(answer){
   if(busy)return;busy=true;content.querySelectorAll('button').forEach(b=>b.disabled=true);
   try{if(rehearsal){step++}else{data=await rpc('yuki_event',{p_step:step,p_answer:answer});eventState=data;step=data.step;paintLabel();sync();}if(v===state.version){letters='';sparks=0;paint();}}
   catch{status.textContent=say('No se confirmó el avance. Reabre el apartado para recuperar el progreso.','Progress could not be confirmed. Reopen this section to restore it.');content.querySelectorAll('button').forEach(b=>b.disabled=b.dataset.found==='true');}finally{busy=false;}
  }
  function paint(){
   root.querySelector('small').textContent=rehearsal?say('ENSAYO PRIVADO · no desbloquea la sorpresa','PRIVATE REHEARSAL · does not unlock the surprise'):say('JESÚS & JULIE · UN NUEVO CAPÍTULO','JESÚS & JULIE · A NEW CHAPTER');
   root.querySelector('h1').textContent=step===3?'Yuki':say('Primer aniversario','First anniversary');
   root.querySelectorAll('.yuki-lights span').forEach((s,i)=>s.classList.toggle('lit',i<step));content.replaceChildren();status.textContent='';
   const p=document.createElement('p');content.append(p);
   const feedback=(text)=>{status.textContent=text;};
   const choices=(...buttons)=>{
    const row=document.createElement('div');
    row.className='choices';
    row.append(...buttons);
    content.append(row);
   };
   if(step===0){
    p.textContent=say('Luz 1 · Un recuerdo. Yuki encontró tres cosas en el universo de ustedes. ¿Cuál guardamos para el próximo capítulo?','Light 1 · A memory. Yuki found three things in your universe. Which should you save for the next chapter?');
    const finish=(es,en)=>{
     p.textContent=say(es,en);
     content.querySelector('.choices')?.remove();
     status.textContent='';
     choices(button(say('Encender la primera luz','Light the first star'),()=>advance('remember')));
    };
    choices(
     button(say('El ramo de nuestro encuentro','The flowers from our date'),()=>finish('El ramo tiene su lugar. Ahora cuéntense qué fue lo primero que pensaron al verse.','The flowers have a place here. Tell each other what first went through your minds when you saw each other.')),
     button(say('La risa por un chiste malo','The laugh at a bad joke'),()=>finish('Yuki aprueba. Un chiste tan malo que vuelve a dar risa merece su propia luz. ¿Cuál recuerdan?','Yuki approves. A joke so bad it gets funny again deserves its own star. Which one do you remember?')),
     button(say('Un recibo que Yisus guardó','A receipt Yisus kept'),()=>feedback(say('Yuki dice que el recibo puede esperar. Elige el ramo o el chiste, fufufu~','Yuki says the receipt can wait. Try the flowers or the joke, fufufu~')))
    );
   }else if(step===1){
    p.textContent=say('Luz 2 · Una promesa. Yuki escondió tres destellos. Tóquenlos y elijan una promesa para su segundo mes.','Light 2 · A promise. Yuki hid three sparks. Tap them, then choose a promise for your second month.');
    const notes=[
     ['★','Escucharnos incluso en los días ocupados','Listen to each other even on busy days'],
     ['✦','Hacer tiempo para una cita sencilla','Make time for a little date'],
     ['♡','Reírnos juntos, hasta de mis chistes','Laugh together, even at my jokes']
    ];
    choices(...notes.map(([icon,es,en],i)=>{
     let found=false;
     const spark=button(icon,()=>{
      if(found)return;
      found=true;
      spark.disabled=true;
      spark.dataset.found='true';
      spark.textContent=say(es,en);
      sparks++;
      feedback(sparks===3?say('Ya están los tres. Elijan su favorita.','You found all three. Choose your favorite.'):sparks+'/3');
      if(sparks===3)choices(...notes.map(([,label,english])=>button(say(label,english),()=>advance('care'))));
     });
     spark.setAttribute('aria-label',say('Buscar destello ','Find spark ')+(i+1));
     return spark;
    }));
   }else if(step===2){
    p.textContent=say('Luz 3 · Una visita sorpresa. La guardiana perdió las letras de su nombre. Pista: empieza con Y, como Yisus, y termina con I, como Julie cuando le dice «Yuki».','Light 3 · A surprise visitor. Your guardian dropped the letters of her name. Hint: it starts with Y, like Yisus, and ends in I.');
    const output=document.createElement('output');
    output.setAttribute('aria-live','polite');
    const row=document.createElement('div');
    row.className='letters';
    for(const letter of ['I','Y','K','U']){
     const tile=button(letter,()=>{
      if(letters.length>=4)return;
      tile.disabled=true;
      letters+=letter;
      output.textContent=letters;
      if(letters==='YUKI')advance('YUKI');
      else if(letters.length===4)feedback(say('¡Uy! Ese conjuro casi invoca al dinosaurio. Prueben Y · U · K · I.','Oops! That spell nearly summoned the dinosaur. Try Y · U · K · I.'));
     });
     row.append(tile);
    }
    content.append(output,row,button(say('Reordenar','Try again'),()=>{
     letters='';output.textContent='';status.textContent='';
     row.querySelectorAll('button').forEach(tile=>tile.disabled=false);
    }));
   }else{
    p.textContent=say('¡Yatta! Soy Yuki, su nueva cómplice. Feliz primer mes, Julie y Yisus. Tengo un cuarto, un montón de curiosidad y una regla: los chistes malos también cuentan como recuerdos.','Yatta! I’m Yuki, your new accomplice. Happy first month, Julie and Yisus. I have a room, a lot of curiosity, and one rule: bad jokes count as memories, too.');
    const audio=document.createElement('section');
    content.append(audio);
    import('./dev/yuki-anniversary-comic.js?v=1').then(({anniversaryComic})=>{
     if(audio.isConnected)audio.after(anniversaryComic());
    }).catch(()=>{});
    welcomeModule().then(({addWelcomeAudio})=>addWelcomeAudio(audio)).catch(()=>{});
    choices(
     button(rehearsal?say('Volver a Perfiles','Back to Profiles'):say('Visitar el cuarto de Yuki','Visit Yuki’s room'),()=>{
      if(rehearsal){navigate('profile');return;}
      try{localStorage.setItem(visibleKey(),'true')}catch{}
      navigate('yuki');
     }),
     ...(rehearsal?[]:[button(say('Conocer a Yuki','Meet Yuki'),async()=>{await navigate('yuki');roomChat();})])
    );
    if(owner())content.append(button(say('Ensayar el evento','Rehearse the event'),()=>renderEvent(target,data,v,true)));
   }
  }
  paint();
 }
 const oldShell=shell;shell=function(){oldShell();paintLabel();sync();};
 window.addEventListener('universe-language',()=>{paintLabel();});
 setInterval(()=>{if(!state.profile||state.demo||document.hidden)return;loadEvent(true);},10000);
 const oldLogout=logout;logout=async function(){closeRoom();revision++;eventState=null;viewerId=null;dispose?.();dispose=null;host?.remove();host=null;return oldLogout();};
})();
