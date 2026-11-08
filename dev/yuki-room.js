import {home,updateHome,skin,phrase} from './yuki-life.js?v=room-1';
import {keepsakes} from './yuki-room-art.js?v=2';
import {roomBackdrop,sceneStyles} from './yuki-room-scene.js?v=2';
const drawings={
 ...keepsakes,
 rug:'<ellipse cx="50" cy="64" rx="47" ry="26" fill="#b49bcc"/><ellipse cx="50" cy="64" rx="40" ry="20" fill="none" stroke="#e8d3f5" stroke-width="2"/><path d="M56 49a16 16 0 1 0 0 30 14 14 0 0 1 0-30" fill="#f9e1a4"/>',
 plant:'<path d="M50 75V29M50 56L29 39M50 49l21-20" stroke="#5b8067" stroke-width="4" fill="none"/><path d="M48 35C18 19 41 5 49 17 63 4 78 25 48 35M30 47C5 32 25 20 30 29 44 18 53 37 30 47M71 38C48 23 64 13 71 22 87 11 98 29 71 38" fill="#86b298"/><path d="M31 68h38l-6 27H37z" fill="#d698a4"/><rect x="28" y="65" width="44" height="8" rx="3" fill="#edb9c2"/>',
 lamp:'<ellipse cx="50" cy="94" rx="24" ry="4" fill="#655178"/><path d="M50 40v50" stroke="#d2ad79" stroke-width="5"/><path d="M31 12h38l16 35H15z" fill="#ffe2ab"/><ellipse cx="50" cy="47" rx="35" ry="5" fill="#ffedc9"/>',
 shelf:'<rect x="10" y="6" width="80" height="88" rx="5" fill="#ad8292"/><path d="M16 12h68v76H16z" fill="#654f69"/><path d="M14 48h72M14 88h72" stroke="#d9acb4" stroke-width="5"/><path d="M22 19h10v26H22zM34 22h9v23h-9zM47 16h12v29H47zM62 25h10v20H62z" fill="#c0acdc"/><path d="M22 57h10v28H22zM37 61h11v24H37zM53 55h12v30H53zM69 62h9v23h-9z" fill="#ecc8a5"/>',
 window:'<rect x="8" y="4" width="84" height="90" rx="35" fill="#e9d7e9"/><rect x="15" y="11" width="70" height="76" rx="30" fill="#34294f"/><path d="M60 22a19 19 0 1 0 0 36 17 17 0 0 1 0-36" fill="#ffe6af"/><path d="M28 31h5m-2-3v6M68 65h6m-3-3v6M24 68h6m-3-3v6" stroke="#fff1cf" stroke-width="2"/><path d="M13 54h74M50 11v76" stroke="#e9d7e9" stroke-width="4"/>',
 stars:'<path d="M4 20Q50 68 96 20" stroke="#d9bc8c" stroke-width="2" fill="none"/><path d="m20 31 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1zM50 43l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1zM80 31l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="#ffe3a0"/>'
};
let artInstance=0;
function art(id){
 const prefix='yr-item-'+(++artInstance)+'-';
 const drawing=(drawings[id]||'').replaceAll('@paint-',prefix);
 return '<svg aria-hidden="true" viewBox="0 0 100 100">'+drawing+'</svg>';
}
const styles=`.yr{width:100%;min-width:0;margin-inline:auto;color:#eee5f7}.yr h1{margin:0;font-size:34px}.yr-header{display:flex;justify-content:space-between;gap:16px;align-items:center;margin:18px 0}.yr-balance{white-space:nowrap;border:1px solid #c9a7dd55;border-radius:24px;padding:9px 14px}.yr-scene{position:relative;overflow:hidden;border-radius:28px;border:1px solid #c5a3cd70}.yr-room-title{position:absolute;top:16px;left:20px;color:#fff5ff;font-size:12px;letter-spacing:.12em;text-transform:uppercase}.yr-decor{position:absolute;pointer-events:none;z-index:1}.yr-decor svg{width:100%;height:100%}.yr-actor{position:absolute;left:45%;padding:0!important;border:0!important;background:transparent!important;z-index:3;cursor:pointer}.yr-pose{display:block;background-size:400% 300%;background-repeat:no-repeat;animation:yr-idle 5.6s steps(1) infinite}.yr-actor[data-walking] .yr-pose{background-position-y:50%!important;animation:yr-walk .8s steps(1) infinite}.yr-actor[data-left] .yr-pose{transform:scaleX(-1)}.yr-bubble{padding:16px 20px;margin:14px 0;border-radius:18px;background:#2e223e;color:#f0e6f5;min-height:64px;font-size:14px;line-height:1.6}.yr-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}.yr-tabs button,.yr button.yr-action{background:#51405e;border:1px solid #ba98ca44;color:#f5eafc;border-radius:14px;padding:12px 16px;min-height:44px;cursor:pointer}.yr-tabs button[aria-selected=true]{background:#b88cc7;color:#25182f}.yr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:14px}.yr-card{background:#241c31;border:1px solid #b794ca30;border-radius:20px;padding:16px;text-align:center}.yr-card h3{font-size:16px;margin:8px 0}.yr-card p{color:#cbb9d7}.yr-preview{height:145px;display:grid;place-items:center}.yr-preview svg{width:110px;height:110px}.yr-outfit{width:96px;height:128px;background-size:400% 300%;background-repeat:no-repeat}.yr-confirm{padding:18px;border:1px solid #e5c096;border-radius:16px;background:#382a3e;margin:16px 0}.yr-confirm button{margin:8px}.yr-empty{padding:24px;border:1px dashed #b391c060;border-radius:18px;color:#c9b7d5}.yr-note{color:#c3afcc;font-size:13px;line-height:1.6}.yr [hidden]{display:none!important}.yr button:disabled{opacity:.45;cursor:default}@keyframes yr-idle{0%,68%,100%{background-position-x:0%}74%{background-position-x:33.333333%}80%{background-position-x:66.666667%}86%{background-position-x:100%}}@keyframes yr-walk{0%,100%{background-position-x:0%}25%{background-position-x:33.333333%}50%{background-position-x:66.666667%}75%{background-position-x:100%}}@media(max-width:500px){.yr h1{font-size:27px}}@media(prefers-reduced-motion:reduce){.yr-pose{animation:none!important}}`;
export async function mountRoom(target,{initialTab='room',onChat,preview=false}={}){
 const owner=state.profile?.id;let alive=true,data,tab=initialTab,busy=false,pending=null,staged=null,generation=0,travel=null,moveTimer,phraseTimer;
 const current=()=>alive&&target.isConnected&&state.profile?.id===owner;
 target.innerHTML='<style>'+styles+sceneStyles+'</style><section class="yr"><header class="yr-header"><div><small>YUKI · '+say('TU PEQUEÑO HOGAR','YOUR LITTLE HOME')+'</small><h1>'+say('El cuarto de Yuki','Yuki’s room')+'</h1></div><span class="yr-balance"></span></header><p class="yr-note">'+(preview?say('Preparación privada. El evento real sigue intacto. Las compras de esta tienda sí usan tus JJ.','Private preparation. The real event stays unchanged. Shop purchases still use your JJ.'):say('Ropa y decoración guardadas para tu perfil.','Outfits and decoration saved to your profile.'))+'</p><div class="yr-stage"><div class="yr-scene">'+roomBackdrop+'<span class="yr-room-title">'+say('Un rincón para quedarse','A place to stay')+'</span><div class="yr-furniture"></div><p class="yr-preview-label" role="status" hidden></p><button class="yr-actor" aria-label="'+say('Escuchar a Yuki','Hear from Yuki')+'"><span class="yr-pose"></span></button></div></div><p class="yr-bubble" aria-live="polite"></p><div class="yr-tabs" role="tablist"></div><div class="yr-confirm" hidden></div><div class="yr-panel"></div><p class="yr-status" role="status"></p></section>';
 const root=target.querySelector('.yr'),actor=root.querySelector('.yr-actor'),pose=root.querySelector('.yr-pose'),scene=root.querySelector('.yr-scene'),status=root.querySelector('.yr-status'),panel=root.querySelector('.yr-panel'),confirm=root.querySelector('.yr-confirm');
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 function speak(){if(current()&&!document.hidden)root.querySelector('.yr-bubble').textContent=phrase();}
 function stop(){clearTimeout(moveTimer);travel?.cancel();travel=null;delete actor.dataset.walking;}
 function move(){
  if(!current()||document.hidden||media.matches)return;
  const width=scene.clientWidth;
  if(!width)return;
  const x=(.16+Math.random()*.54)*(1-actor.offsetWidth/width)*100;
  const depth=Math.random(), bottom=9+depth*15, scale=1-depth*.21;
  actor.dataset.walking='true';
  actor.toggleAttribute('data-left',x*width/100<actor.offsetLeft);
  const style=getComputedStyle(actor);
  travel=actor.animate([{left:style.left,bottom:style.bottom,scale:style.scale},{left:x+'%',bottom:bottom+'%',scale}],{duration:4200,easing:'ease-in-out',fill:'forwards'});
  travel.onfinish=()=>{
   if(!current())return;
   Object.assign(actor.style,{left:x+'%',bottom:bottom+'%',scale});
   travel?.cancel();travel=null;delete actor.dataset.walking;
   moveTimer=setTimeout(move,1800);
  };
 }
 function paintFurniture(){
  const decor={...data.decor};
  if(staged)decor[staged.slot]=staged.id;
  const furniture=root.querySelector('.yr-furniture');
  furniture.replaceChildren(...Object.entries(decor).filter(([,id])=>Object.hasOwn(drawings,id)).map(([slot,id])=>{
   const item=document.createElement('div');
   item.className='yr-decor';item.dataset.slot=slot;item.dataset.item=id;
   item.toggleAttribute('data-preview',staged?.id===id);
   item.innerHTML=art(id);
   return item;
  }));
  const label=root.querySelector('.yr-preview-label');
  label.hidden=!staged;
  label.textContent=staged?say('Vista previa · ','Preview · ')+say(staged.es,staged.en):'';
 }
 function resume(){stop();if(!document.hidden&&!media.matches)moveTimer=setTimeout(move,800);}
 actor.onclick=speak;document.addEventListener('visibilitychange',resume);media.addEventListener('change',resume);phraseTimer=setInterval(speak,22000);speak();resume();
 function paint(){if(!current()||!data)return;const gen=++generation;root.querySelector('.yr-balance').textContent=data.coins+' JJ';paintFurniture();skin(data.outfit).then(url=>{if(current()&&gen===generation)pose.style.backgroundImage='url("'+url+'")'});
 const tabs=[['room','Habitación','Room'],['wardrobe','Vestidor','Wardrobe'],['decor','Decorar','Decorate'],['shop','Tienda','Shop']];root.querySelector('.yr-tabs').replaceChildren(...tabs.map(([id,es,en])=>{const b=document.createElement('button');b.textContent=say(es,en);b.setAttribute('role','tab');b.setAttribute('aria-selected',String(tab===id));b.disabled=busy;b.onclick=()=>{tab=id;pending=null;staged=null;paint()};return b}));
 panel.replaceChildren();confirm.hidden=!pending;
 if(pending){confirm.replaceChildren();const p=document.createElement('p');p.textContent=say('Comprar ','Buy ')+say(pending.es,pending.en)+' · '+pending.price+' JJ · '+say('Saldo después: ','Balance afterwards: ')+(data.coins-pending.price)+' JJ';const yes=document.createElement('button');yes.className='yr-action';yes.textContent=say('Confirmar compra','Confirm purchase');yes.disabled=busy||data.coins<pending.price;yes.onclick=()=>mutate('buy',pending.id);const no=document.createElement('button');no.className='yr-action';no.textContent=say('Cancelar','Cancel');no.disabled=busy;no.onclick=()=>{pending=null;paint()};confirm.append(p,yes,no);}
 if(tab==='room'){const p=document.createElement('p');p.className='yr-note';p.textContent=say('Toca a Yuki para escuchar otra frase. Vístela y coloca tus accesorios desde las pestañas de abajo.','Tap Yuki for another phrase. Dress her and place your accessories using the tabs.');const chat=document.createElement('button');chat.className='yr-action';chat.textContent=say('Conversar con Yuki','Talk to Yuki');chat.onclick=onChat;panel.append(p,chat);return;}
 const list=data.catalog.filter(c=>tab==='shop'||(data.owned.includes(c.id)&&(tab==='wardrobe'?c.kind==='outfit':c.kind==='decor')));
 if(!list.length){const p=document.createElement('p');p.className='yr-empty';p.textContent=say('Todavía no tienes decoraciones. Encontrarás las primeras en Tienda.','No decorations yet. Find your first ones in Shop.');panel.append(p);return;}
 const grid=document.createElement('div');grid.className='yr-grid';panel.append(grid);
 list.forEach(c=>{const owned=data.owned.includes(c.id),equipped=c.kind==='outfit'?data.outfit===c.id:data.decor?.[c.slot]===c.id;const card=document.createElement('article');card.className='yr-card';const pic=document.createElement('div');pic.className='yr-preview';if(c.kind==='decor')pic.innerHTML=art(c.id);else{const doll=document.createElement('div');doll.className='yr-outfit';pic.append(doll);skin(c.id).then(url=>{if(current()&&gen===generation)doll.style.backgroundImage='url("'+url+'")'});}const h=document.createElement('h3');h.textContent=say(c.es,c.en);const p=document.createElement('p');p.textContent=owned?say('En tu colección','In your collection'):c.price+' JJ';const b=document.createElement('button');b.className='yr-action';b.dataset.item=c.id;b.textContent=!owned?say('Comprar','Buy'):equipped?(c.kind==='decor'?say('Retirar','Remove'):say('En uso','Equipped')):say('Usar','Use');b.disabled=busy||(equipped&&c.kind==='outfit');b.onclick=()=>{if(!owned){pending=c;paint();confirm.scrollIntoView({block:'nearest',behavior:'smooth'})}else mutate(equipped?'remove':'equip',c.id)};card.append(pic,h,p,b);
 if(c.kind==='decor'&&!equipped){
  const previewButton=document.createElement('button');
  previewButton.className='yr-action';
  previewButton.textContent=say('Probar','Try');
  previewButton.setAttribute('aria-label',say('Probar ','Try ')+say(c.es,c.en));
  previewButton.setAttribute('aria-pressed',String(staged?.id===c.id));
  previewButton.disabled=busy;
  previewButton.onclick=()=>{
   staged=staged?.id===c.id?null:c;
   grid.querySelectorAll('[aria-pressed="true"]').forEach(button=>button.setAttribute('aria-pressed','false'));
   previewButton.setAttribute('aria-pressed',String(!!staged));
   paintFurniture();
   if(staged)scene.scrollIntoView({block:'nearest',behavior:media.matches?'instant':'smooth'});
  };
  card.append(previewButton);
 }
 grid.append(card)});
 }
 async function mutate(action,id){if(busy||!current())return;busy=true;paint();try{const {data:result,error}=await db.rpc('yuki_hub',{p_action:action,p_item:id});if(error)throw error;if(!current())return;data=result;pending=null;staged=null;updateHome(data);window.dispatchEvent(new CustomEvent('jj-wallet-update',{detail:{owner,coins:data.coins}}));if(typeof JJ!=='undefined')JJ.dashboard=null;status.textContent=action==='buy'?say('Compra guardada. Ya puedes usarla desde tu colección.','Purchase saved. You can now use it from your collection.'):say('Guardado.','Saved.');}catch(e){if(current())status.textContent=String(e.message).includes('INSUFFICIENT')?say('No tienes suficientes monedas JJ.','Not enough JJ coins.'):say('No se confirmó. Reintenta; el mismo artículo no se cobra dos veces.','Not confirmed. Retry; the same item is not charged twice.');}finally{busy=false;paint();}}
 function cleanup(){alive=false;stop();clearInterval(phraseTimer);document.removeEventListener('visibilitychange',resume);media.removeEventListener('change',resume);}
 try{data=await home(true);paint();}catch{if(current()){status.textContent=say('No se pudo cargar. Vuelve a abrir este apartado para reintentar.','Could not load. Reopen this section to retry.');}}
 return cleanup;
}
