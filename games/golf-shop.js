'use strict';

let golfShop, golfClient, golfShopBusy=false, golfShopLoaded=false, skinFilter='all';
let golfShopMessage=null;
const skinRarities=[['Común','Common'],['Rara','Rare'],['Épica','Epic']];

function shopMessage(es,en){
 golfShopMessage=[es,en];$('shopStatus').textContent=tr(es,en);
}
async function shopRpc(action='read',skin='classic'){
 const cfg=window.UNIVERSE_CONFIG;
 if(!cfg?.supabaseUrl||!window.supabase)return null;
 golfClient??=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
 const {data:{session}}=await golfClient.auth.getSession();
 if(!session)return null;
 const {data,error}=await golfClient.rpc('jj_golf_shop',{p_action:action,p_skin:skin});
 if(error)throw error;
 return data;
}
async function readGolfShop(){
 if(golfShopBusy)return;
 golfShopBusy=true;renderShop();
 try{golfShop=await shopRpc();golfShopLoaded=true;}
 catch{golfShopLoaded=false;shopMessage('La tienda no está disponible. Cierra y vuelve a abrir para reintentar.','The shop is unavailable. Close and reopen it to retry.');}
 finally{golfShopBusy=false;renderShop();}
}
function skinButton(skin,owned,catalogItem){
 const button=document.createElement('button');
 const equipped=golfShop?.equipped?.[golfShop.handle]===skin.id;
 const available=skin.id==='classic'||catalogItem?.available;
 button.type='button';
 button.textContent=equipped?tr('Equipada','Equipped'):owned?tr('Equipar','Equip'):available?tr('Comprar','Buy'):catalogItem?tr('Fuera de temporada','Out of season'):tr('Vista previa','Preview');
 button.disabled=!golfShopLoaded||!golfShop||golfShopBusy||equipped||(!owned&&(!available||golfShop.coins<catalogItem.price));
 button.onclick=async()=>{
  if(golfShopBusy)return;
  if(!owned&&!window.confirm(tr('¿Comprar '+skin.names[0]+' por '+catalogItem.price+' JJ?','Buy '+skin.names[1]+' for '+catalogItem.price+' JJ?')))return;
  golfShopBusy=true;renderShop();
  try{
   golfShop=await shopRpc(owned?'equip':'buy',skin.id);
   if(golfShop)shopMessage('Bola equipada.','Ball equipped.');
  }catch(error){
   const msg=String(error?.message);
   if(msg.includes('INSUFFICIENT_COINS'))shopMessage('Te faltan monedas JJ.','You need more JJ coins.');
   else if(msg.includes('OUT_OF_SEASON'))shopMessage('Esa skin está fuera de temporada.','That skin is out of season.');
   else shopMessage('No se pudo completar. Vuelve a abrir la tienda para comprobar tu inventario.','Could not finish. Reopen the shop to check your inventory.');
  }finally{golfShopBusy=false;renderShop();}
 };
 return button;
}
function renderShop(){
 if(!$('shop').open)return;
 $('shopWallet').textContent=golfShop?tr('Saldo: ','Balance: ')+golfShop.coins+' JJ':golfShopBusy?tr('Cargando saldo…','Loading balance…'):tr('Entra a tu perfil en Nuestro Universo para comprar.','Sign in to your Our Universe profile to buy.');
 $('shopStatus').textContent=golfShopMessage?tr(...golfShopMessage):'';
 const choices=[['all',['Todas','All']],...worlds.map(w=>[w.id,w.names])];
 $('skinFilters').replaceChildren(...choices.map(([id,label])=>{
  const button=document.createElement('button');button.type='button';button.textContent=tr(...label);
  button.setAttribute('aria-pressed',String(skinFilter===id));button.onclick=()=>{skinFilter=id;renderShop();};
  return button;
 }));
 $('skinGrid').replaceChildren(...ballSkins.filter(skin=>skinFilter==='all'||worlds[skin.world]?.id===skinFilter).map(skin=>{
  const card=document.createElement('article'), ball=document.createElement('span'), title=document.createElement('strong'), meta=document.createElement('small');
  card.className='skin-card rarity-'+skin.rarity;
  ball.className='skin-ball';ball.setAttribute('aria-hidden','true');ball.textContent=skin.mark??'✦';
  const shades=skin.colors??['#fff0f6','#a1cdff','#64629d'];
  ['--l','--m','--d'].forEach((name,i)=>ball.style.setProperty(name,shades[i]));
  title.textContent=tr(...skin.names);
  const owned=skin.id==='classic'||golfShop?.owned?.includes(skin.id), item=golfShop?.catalog?.[skin.id];
  meta.textContent=tr(...skinRarities[skin.rarity])+(!owned&&item?' · '+item.price+' JJ':'');
  card.append(ball,title,meta,skinButton(skin,owned,item));return card;
 }));
}
function openGolfShop(){
 golfShopMessage=null;$('shop').showModal();readGolfShop();
}
