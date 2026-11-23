'use strict';
// Public game integration: shared inventory, equipped skin and character rendering.
const JJWardrobe={
 async read(){return state.demo?{coins:0,owned:['casual'],equipped:'casual',catalog:Object.fromEntries(BBSkins.map(s=>[s[0],s[3]]))}:rpc('bb_shop');},
 async equip(id){if(!ensureLive())return;const result=await rpc('bb_shop',{p_action:'equip',p_skin:id});window.dispatchEvent(new Event('jj-wardrobe-changed'));return result;},
 draw(canvas,handle,skin){canvas.dataset.skin=skin;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);bbCharacter(ctx,canvas.width/2,canvas.height*.73,canvas.height*.76,handle,skin);},
 async picker(root,onChange){const data=await this.read();if(!root.isConnected)return;root.innerHTML=`<label>${bi('Tu skin para los juegos','Your game skin')}<select id="jj-game-skin">${BBSkins.filter(s=>data.owned.includes(s[0])).map(s=>`<option value="${s[0]}" ${data.equipped===s[0]?'selected':''}>${esc(say(s[1],s[2]))}</option>`).join('')}</select></label><p>${bi('Se aplica también a los demás juegos compatibles.','Also used by other supported games.')}</p>`;root.querySelector('select').onchange=async e=>{const input=e.target;input.disabled=true;try{const saved=await this.equip(input.value);if(saved)onChange?.(saved);}catch{toast(say('No se pudo cambiar la skin. Reintenta.','Could not change skin. Retry.'));input.value=data.equipped;}finally{input.disabled=false;}};}
};
window.JJWardrobe=JJWardrobe;
menus.splice(1,0,['shop','✧','Tienda']);
const wardrobeNavigate=navigate;
navigate=async function(page){if(page!=='shop')return wardrobeNavigate(page);if(!state.profile)return;await loadSections();if(!sectionAllowed('shop'))return wardrobeNavigate('home');jjCleanup();clearTimers();state.page='shop';const v=++state.version;rememberRoute(historyRoute('shop'));shell();window.scrollTo(0,0);await wardrobePage(v);};
async function wardrobePage(v){
 const user=state.profile.id;
 const current=()=>v===state.version&&state.profile?.id===user;
 const newIds=new Set(BBExtraSkins.map(([id])=>id));
 let data, ownedOnly=false, busy=false;
 $('#main').innerHTML=lifeHeading('Tienda y armario','Shop & wardrobe',
  'Prueba un atuendo con los dos personajes antes de equiparlo.',
  'Try an outfit on both characters before equipping it.')
  +`<p id="wardrobe-balance"></p><div class="row">
   ${jjButton('wardrobe-all','Todas las skins','All skins','btn secondary')}
   ${jjButton('wardrobe-owned','Mi armario','My wardrobe','btn secondary')}
   </div><p id="wardrobe-status" role="status"></p><div class="bb-shop" id="wardrobe-grid"></div>`;

 function draw(){
  if(!current())return;
  document.querySelectorAll('[data-wardrobe-preview]').forEach(canvas=>{
   JJWardrobe.draw(canvas,state.profile.handle,canvas.dataset.wardrobePreview);
  });
  document.querySelectorAll('[data-wardrobe-fit]').forEach(canvas=>{
   JJWardrobe.draw(canvas,canvas.dataset.wardrobeFit,canvas.dataset.outfit);
  });
 }
 function paint(){
  if(!current())return;
  $('#wardrobe-balance').textContent=`✦ ${data.coins} JJ · `+say('disponibles','available');
  $('#wardrobe-all').setAttribute('aria-pressed',String(!ownedOnly));
  $('#wardrobe-owned').setAttribute('aria-pressed',String(ownedOnly));
  const outfits=[...BBExtraSkins,...BBSkins.filter(([id])=>!newIds.has(id))]
   .filter(([id])=>(!newIds.has(id)||Object.hasOwn(data.catalog,id))&&(!ownedOnly||data.owned.includes(id)));
  const grid=$('#wardrobe-grid');
  grid.innerHTML=outfits.map(([id,es,en,defaultPrice])=>{
   const equipped=data.equipped===id,owned=data.owned.includes(id),available=owned||seasonalSale(id);
   return `<article class="bb-card" data-equipped="${equipped}">
    <canvas width="220" height="260" data-wardrobe-preview="${id}" aria-label="${esc(say(es,en))}"></canvas>
    <h2>${bi(es,en)}</h2><p>${owned?bi('En tu armario','In your wardrobe'):(data.catalog[id]??defaultPrice)+' JJ'}</p>
    <button class="btn secondary" type="button" data-wardrobe-item="${id}" ${busy||!available||equipped?'disabled':''}>
     ${equipped?bi('Equipada','Equipped'):!available?bi('Fuera de temporada','Out of season'):bi('Vista previa','Preview')}
    </button>
   </article>`;
  }).join('');
  draw();
  grid.querySelectorAll('[data-wardrobe-item]').forEach(button=>{
   button.onclick=()=>preview(BBSkins.find(([id])=>id===button.dataset.wardrobeItem));
  });
 }
 function preview([id,es,en,defaultPrice]){
  const owned=data.owned.includes(id),price=data.catalog[id]??defaultPrice;
  const balance=data.coins>=price?` · ${bi('Saldo después','Balance afterwards')}: ${data.coins-price} JJ`:'';
  const priceDetails=owned?'':`<p>${price} JJ${balance}</p>`;
  const buy=owned?jjButton('wardrobe-equip','Equipar en mi perfil','Equip on my profile')
   :jjButton('wardrobe-buy','Comprar y equipar','Buy and equip');
  modal(`<section class="wardrobe-preview-dialog" aria-labelledby="wardrobe-preview-title">
   <h2 id="wardrobe-preview-title">${bi(es,en)}</h2>
   <div class="wardrobe-fit-grid">
    ${[['jesus','Yisus'],['julisa','Julie']].map(([handle,name])=>`<figure>
     <canvas width="220" height="260" data-wardrobe-fit="${handle}" data-outfit="${id}" aria-hidden="true"></canvas>
     <figcaption>${name}</figcaption>
    </figure>`).join('')}
   </div>${priceDetails}<p id="wardrobe-preview-status" role="status"></p>
   ${buy}
  </section>`);
  draw();
  const confirm=$('#wardrobe-equip')||$('#wardrobe-buy');
  confirm.disabled=!owned&&data.coins<price;
  if(confirm.disabled)$('#wardrobe-preview-status').textContent=say('Te faltan monedas JJ.','Not enough JJ coins.');
  confirm.onclick=()=>save(owned?'equip':'buy',id,price,confirm);
 }
 async function save(action,id,price,confirm){
  if(busy||!ensureLive())return;
  busy=true;
  confirm.disabled=true;
  busyModal(true);
  try{
   data=await rpc('bb_shop',{p_action:action,p_skin:id});
   window.dispatchEvent(new Event('jj-wardrobe-changed'));
   if(current()){
    $('#modal').close();
    $('#wardrobe-status').textContent=say('Skin equipada en tu perfil.','Outfit equipped on your profile.');
   }
  }catch(error){
   if(current())$('#wardrobe-preview-status').textContent=error.message?.includes('INSUFFICIENT')
    ?say('Te faltan monedas JJ.','Not enough JJ coins.')
    :say('No se pudo equipar. Inténtalo de nuevo.','Could not equip the outfit. Try again.');
  }finally{
   busy=false;
   busyModal(false);
   confirm.disabled=action==='buy'&&data.coins<price;
   paint();
  }
 }
 $('#wardrobe-all').onclick=()=>{ownedOnly=false;if(data)paint();};
 $('#wardrobe-owned').onclick=()=>{ownedOnly=true;if(data)paint();};
 const walletUpdate=event=>{
  if(current()&&data&&event.detail?.owner===user){data.coins=event.detail.coins;paint();}
 };
 window.addEventListener('jj-wallet-update',walletUpdate);
 window.addEventListener('bb-art-ready',draw);
 JJ.cleanups.push(()=>{
  window.removeEventListener('bb-art-ready',draw);
  window.removeEventListener('jj-wallet-update',walletUpdate);
 });
 try{
  await loadSeason();
  if(!current())return;
  data=await JJWardrobe.read();
  paint();
 }catch{
  if(current())$('#wardrobe-status').textContent=say('No se pudo abrir el armario. Comprueba la conexión.','Could not open the wardrobe. Check your connection.');
 }
}
const JJRooms={
 entry(prefix){return `<div class="room-paths"><section><span class="room-step" aria-hidden="true">＋</span><h2>${bi('Quiero invitar','I want to invite')}</h2><p>${bi('Crea una sala y comparte el código con tu pareja.','Create a room and share the code with your partner.')}</p><button class="btn" id="${prefix}-create">${bi('Crear sala','Create room')}</button></section><form id="${prefix}-join-form"><span class="room-step" aria-hidden="true">↳</span><h2>${bi('Tengo un código','I have a code')}</h2><label>${bi('Código de 8 caracteres','8-character room code')}<input id="${prefix}-code" maxlength="8" minlength="8" required pattern="[A-Za-z0-9]{8}" placeholder="A1B2C3D4" autocomplete="off" autocapitalize="characters" spellcheck="false"></label><button class="btn secondary" id="${prefix}-join" type="submit">${bi('Unirme','Join room')}</button></form></div>`;},
 async copy(code,game,status){try{const url=new URL(location.href);url.searchParams.set('jj-room',game);url.searchParams.set('code',code);await navigator.clipboard.writeText(url.href);status.textContent=say('Enlace copiado. Compártelo con tu pareja.','Link copied. Share it with your partner.');}catch{status.textContent=say('Copia este código: ','Copy this code: ')+code;}},
 code(game){const url=new URL(location.href);return url.searchParams.get('jj-room')===game?(url.searchParams.get('code')||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8):'';}
};
