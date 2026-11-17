'use strict';

(()=>{
 const root=document.createElement('aside');
 root.id='jj-wallet-chip';
 root.hidden=true;
 root.innerHTML=`
  <section class="wallet-chip-panel" id="wallet-chip-panel" hidden>
   <h2>${bi('Mis monedas','My coins')}</h2>
   <p><strong>JJ</strong> · ${bi('Saldo disponible para tiendas, Golf y otros juegos de Nuestro Universo.','Available for shops, Golf and other Our Universe games.')}</p>
   <p><strong>JXJ</strong> · ${bi('Monedas del casino.','Casino coins.')}</p>
   <p id="wallet-chip-status" role="status"></p>
   <button type="button" id="wallet-chip-refresh">${bi('Actualizar saldo','Refresh balance')}</button>
  </section>
  <button type="button" id="wallet-chip-toggle" aria-expanded="false" aria-controls="wallet-chip-panel" aria-label="Mis monedas / My coins">
   <span aria-hidden="true">◈</span>
   <span><b id="wallet-chip-jj">—</b> JJ</span>
   <span><b id="wallet-chip-jxj">—</b> JXJ</span>
  </button>`;
 document.body.append(root);
 const find=id=>root.querySelector('#wallet-chip-'+id);
 const toggle=find('toggle'),panel=find('panel'),status=find('status');
 let owner=null, demo=false, balance=null, checked=0, request=null, revision=0, stale=false;

 function showPanel(open){
  panel.hidden=!open;
  toggle.setAttribute('aria-expanded',String(open));
 }
 function paint(){
  for(const currency of ['jj','jxj']){
   find(currency).textContent=balance?Number(balance[currency]).toLocaleString(UniverseI18n.locale()):'—';
  }
  status.innerHTML=demo?bi('Vista de prueba','Demo mode'):stale?
   bi('No se pudo actualizar. Comprueba tu conexión.','Could not refresh. Check your connection.'):
   balance?'':bi('Consultando saldo…','Checking balance…');
  toggle.setAttribute('aria-label',(balance?'Saldo / Balance: '+find('jj').textContent+' JJ, '+find('jxj').textContent+' JXJ':'Mis monedas / My coins'));
 }
 function sync(){
  const profile=state.profile?.id??null,nextDemo=Boolean(state.demo);
  if(profile!==owner||nextDemo!==demo){
   owner=profile;demo=nextDemo;revision++;request=null;checked=0;stale=false;
   balance=demo?{jj:0,jxj:0}:null;showPanel(false);paint();
  }
  root.hidden=!owner;
 }
 async function refresh(force=false){
  sync();
  if(!owner||demo||document.hidden||request||(!force&&Date.now()-checked<20000))return;
  const current=revision, handle=state.profile.handle;
  const active=rpc('jj_rankings');request=active;
  try{
   const data=await active;
   if(current!==revision||owner!==state.profile?.id)return;
   const mine=data.players?.find(player=>player.handle===handle);
   if(!mine||![mine.jj,mine.jxj].every(value=>typeof value==='number'&&Number.isFinite(value)))throw Error('Missing wallet');
   balance={jj:mine.jj,jxj:mine.jxj};stale=false;checked=Date.now();paint();
  }catch{
   if(current===revision&&owner===state.profile?.id){stale=true;paint();}
  }finally{if(request===active)request=null;}
 }
 toggle.onclick=()=>{const open=panel.hidden;showPanel(open);if(open)refresh(true);};
 find('refresh').onclick=()=>refresh(true);
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){showPanel(false);toggle.focus();}});
 document.addEventListener('pointerdown',event=>{if(!panel.hidden&&!root.contains(event.target))showPanel(false);});
 const prevShell=shell;
 shell=function(...args){const result=prevShell.apply(this,args);refresh();return result;};
 const prevLogout=logout;
 logout=async function(...args){try{return await prevLogout.apply(this,args);}finally{sync();}};
 window.addEventListener('jj-wallet-update',()=>refresh(true));
 window.addEventListener('focus',()=>refresh(true));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(true);});
 setInterval(refresh,25000);
 refresh();
})();
