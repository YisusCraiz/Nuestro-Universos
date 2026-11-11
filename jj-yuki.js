'use strict';
(() => {
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
  let step=preview?0:data.step, letters='', busy=false;
  const rehearsal=preview||(owner()&&!data.visible&&!data.unlocked);
  target.innerHTML=`<style>.yuki-event{max-width:760px;margin:20px auto;padding:clamp(24px,6vw,54px);border:1px solid #d0b5f440;border-radius:32px;background:radial-gradient(ellipse at top,#58417590,transparent 65%),#171326;color:#f4edf9;text-align:center;box-shadow:0 22px 80px #0003}.yuki-event h1{font-size:clamp(30px,6vw,48px);line-height:1.1}.yuki-event p{line-height:1.8;color:#d4c5df}.yuki-lights{display:flex;justify-content:center;gap:24px;margin:30px 0;font-size:34px}.yuki-lights span{color:#766084;transition:color .3s,text-shadow .3s}.yuki-lights .lit{color:#ffe0a2;text-shadow:0 0 24px #ffc978}.yuki-event button{margin:8px;min-height:48px}.yuki-event .choices{display:grid;gap:10px}.yuki-event .choices button{padding:16px;border-radius:18px}.yuki-event .letters button{font-size:23px;width:58px}.yuki-event output{display:block;font-size:30px;letter-spacing:.3em;min-height:48px}.yuki-event small{color:#d4b5eb}</style><section class="yuki-event"><small></small><h1></h1><div class="yuki-lights" aria-label="${say('Luces encendidas','Lights lit')}"><span>✦</span><span>✦</span><span>✦</span></div><div class="event-content"></div><p class="event-status" role="status"></p></section>`;
  const root=target.querySelector('.yuki-event'),content=root.querySelector('.event-content'),status=root.querySelector('.event-status');
  const button=(text,fn)=>{const b=document.createElement('button');b.className='btn secondary';b.textContent=text;b.onclick=fn;return b;};
  async function advance(answer){
   if(busy)return;busy=true;content.querySelectorAll('button').forEach(b=>b.disabled=true);
   try{if(rehearsal){step++}else{data=await rpc('yuki_event',{p_step:step,p_answer:answer});eventState=data;step=data.step;paintLabel();sync();}if(v===state.version){letters='';paint();}}
   catch{status.textContent=say('No se confirmó el avance. Reabre el apartado para recuperar el progreso.','Progress could not be confirmed. Reopen this section to restore it.');content.querySelectorAll('button').forEach(b=>b.disabled=false);}finally{busy=false;}
  }
  function paint(){
   root.querySelector('small').textContent=rehearsal?say('ENSAYO PRIVADO · no desbloquea la sorpresa','PRIVATE REHEARSAL · does not unlock the surprise'):say('JESÚS & JULIE · UN NUEVO CAPÍTULO','JESÚS & JULIE · A NEW CHAPTER');
   root.querySelector('h1').textContent=step===3?'Yuki':say('Primer aniversario','First anniversary');
   root.querySelectorAll('.yuki-lights span').forEach((s,i)=>s.classList.toggle('lit',i<step));content.replaceChildren();status.textContent='';
   const p=document.createElement('p');content.append(p);
   if(step===0){p.textContent=say('La luz de lo vivido. Piensen en un momento que quieran conservar. ¿Qué merece llevarse al siguiente capítulo?','The light of your memories. Think of a moment you want to keep. What belongs in your next chapter?');const choices=document.createElement('div');choices.className='choices';choices.append(button(say('Los momentos que nos hicieron sentir cerca','The moments that made us feel close'),()=>advance('remember')),button(say('La cantidad de puntos que conseguimos','The number of points we earned'),()=>{status.textContent=say('Esta luz no cuenta puntos. Busca algo que puedan sentir.','This light does not count points. Find something you can feel.')}));content.append(choices);}
   else if(step===1){p.textContent=say('La luz de lo que viene. Díganse una pequeña promesa: escuchar, hacer espacio o compartir una risa. Cuando estén listos, enciendan esta luz.','The light of what comes next. Share a small promise: to listen, make time, or share a laugh. When you are ready, light this star.');content.append(button(say('Elegimos cuidarnos','We choose to care for each other'),()=>advance('care')));}
   else if(step===2){p.textContent=say('Una pequeña guardiana ha seguido sus luces. Su nombre es Yuki. Ordenen las letras para darle la bienvenida.','A little guardian has followed your lights. Her name is Yuki. Arrange the letters to welcome her.');const output=document.createElement('output');output.setAttribute('aria-live','polite');const row=document.createElement('div');row.className='letters';for(const letter of ['I','Y','K','U'])row.append(button(letter,()=>{if(letters.includes(letter)||letters.length>=4)return;letters+=letter;output.textContent=letters;if(letters.length===4){if(letters==='YUKI')advance('YUKI');else status.textContent=say('Casi. Prueben con Y · U · K · I.','Almost. Try Y · U · K · I.')}}));content.append(output,row,button(say('Reordenar','Try again'),()=>{letters='';output.textContent='';status.textContent=''}));}
   else{p.textContent=rehearsal?say('Así será su bienvenida. El ensayo ha terminado y el evento real sigue intacto.','This is how her welcome will look. Rehearsal is complete; the real event is unchanged.'):say('¡Yatta! Soy Yuki, su nueva cómplice. Sus conversaciones tendrán un lugar aquí y ustedes decidirán qué recuerdos quieren conservar.','Yatta! I am Yuki, your new accomplice. Your conversations have a home here, and you decide which memories to keep.');content.append(button(rehearsal?say('Volver a Perfiles','Back to Profiles'):say('Entrar al cuarto de Yuki','Enter Yuki’s room'),()=>{if(rehearsal){navigate('profile');return;}try{localStorage.setItem(visibleKey(),'true')}catch{}navigate('yuki')}));if(owner())content.append(button(say('Ensayar el evento','Rehearse the event'),()=>renderEvent(target,data,v,true)));}
  }
  paint();
 }
 const oldShell=shell;shell=function(){oldShell();paintLabel();sync();};
 window.addEventListener('universe-language',()=>{paintLabel();});
 setInterval(()=>{if(!state.profile||state.demo||document.hidden)return;loadEvent(true);},10000);
 const oldLogout=logout;logout=async function(){closeRoom();revision++;eventState=null;viewerId=null;dispose?.();dispose=null;host?.remove();host=null;return oldLogout();};
})();
