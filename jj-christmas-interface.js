'use strict';

(() => {
 const mobile=matchMedia('(max-width:760px)');
 const isChristmas=()=>document.documentElement.dataset.season==='christmas';
 const quick=[
  ['games','Juegos','Games','100%','0%','33.333%'],
  ['home','Inicio','Home','0%','0%','33.333%'],
  ['musicas','Música','Music','66.667%','66.667%','100%'],
  ['memories','Recuerdos','Memories','100%','66.667%','100%']
 ];
 const groups=[
  ['⚔','Arena','Arena',['vs','casino','cards']],
  ['▷','Sala multimedia','Media room',['comics','live']],
  ['♡','Nuestro rincón','Our corner',['pets','collection','shop','messages','affection','flowers','gifts','candy','yuki','secret_adventures']],
  ['✦','Novedades y cuenta','News and account',['news','profile','season','missions','calendar','goals','approvals']]
 ];
 let arcade=null;

 function openArcade(trigger){
  const nav=$('#primary-nav');
  if(!nav)return;
  if(arcade?.open)return;
  nav.classList.remove('open');
  const sources=new Map([...nav.querySelectorAll('button[data-nav]')].map(button=>[button.dataset.nav,button]));
  arcade=document.createElement('dialog');
  arcade.id='jj-arcade-menu';
  arcade.setAttribute('aria-labelledby','jj-arcade-title');
  arcade.innerHTML=`
   <header class="arcade-hero"><div><span>✦ JULISSA &amp; JESÚS</span><h2 id="jj-arcade-title">${bi('Juntos en otra aventura','Together on another adventure')}</h2><p>${bi('Aventura arcade · Edición de Navidad','Arcade adventure · Christmas edition')}</p></div>
   <button type="button" class="arcade-close" aria-label="${say('Cerrar menú','Close menu')}">×</button></header>
   <div class="arcade-body"><div class="arcade-quick"></div><h3>${bi('Explora el universo','Explore the universe')}</h3><div class="arcade-groups"></div></div>`;
  const dialog=arcade;
  const makeButton=(route,label,art='')=>{
   const button=document.createElement('button');
   button.type='button';
   button.dataset.arcadeRoute=route;
   button.innerHTML=art+label;
   const source=sources.get(route);
   if(source.getAttribute('aria-current')==='page')button.setAttribute('aria-current','page');
   button.onclick=()=>{
    if(!source.isConnected||source.hidden||!sectionAllowed(route))return;
    dialog.close();
    source.click();
   };
   return button;
  };
  const used=new Set();
  for(const [route,es,en,row,left,right] of quick){
   if(!sources.has(route))continue;
   used.add(route);
   const art=`<span class="arcade-sprites" aria-hidden="true"><span style="background-position:${left} ${row}"></span><span style="background-position:${right} ${row}"></span></span>`;
   const label=route==='games'
    ? `<span class="arcade-card-text"><small>${bi('MISIÓN PRINCIPAL','MAIN QUEST')}</small><strong>${bi('Juega con Julie','Play together')}</strong><span>${bi('Juegos · En pareja o en solitario','Games · Together or solo')}</span></span>`
    : `<span class="arcade-card-text">${bi(es,en)}</span>`;
   dialog.querySelector('.arcade-quick').append(makeButton(route,label,art));
  }
  const addGroup=(symbol,es,en,routes)=>{
   const details=document.createElement('details');
   details.innerHTML=`<summary><span aria-hidden="true">${symbol}</span><span>${bi(es,en)}</span><span aria-hidden="true">⌄</span></summary><div class="arcade-links"></div>`;
   const links=details.querySelector('.arcade-links');
   for(const route of routes){
    if(used.has(route)||!sources.has(route))continue;
    used.add(route);
    links.append(makeButton(route,sources.get(route).innerHTML));
   }
   if(links.children.length)dialog.querySelector('.arcade-groups').append(details);
  };
  for(const [icon,es,en,routes] of groups)addGroup(icon,es,en,routes);
  addGroup('☾','Más apartados','More sections',[...sources.keys()]);

  function sync(){
   if(!nav.isConnected||!isChristmas()||!mobile.matches){dialog.close();return;}
   for(const button of dialog.querySelectorAll('[data-arcade-route]')){
    const hidden=sources.get(button.dataset.arcadeRoute).hidden;
    if(button.hidden!==hidden)button.hidden=hidden;
   }
   for(const group of dialog.querySelectorAll('details')){
    const hidden=!group.querySelector('button:not([hidden])');
    if(group.hidden!==hidden)group.hidden=hidden;
   }
  }
  const observer=new MutationObserver(sync);
  observer.observe(nav,{subtree:true,attributes:true,attributeFilter:['hidden']});
  dialog.querySelector('.arcade-close').onclick=()=>dialog.close();
  dialog.addEventListener('click',event=>{if(event.target===dialog&&event.clientY<dialog.getBoundingClientRect().top)dialog.close();});
  dialog.addEventListener('close',()=>{
   observer.disconnect();
   dialog.remove();
   if(arcade===dialog)arcade=null;
   if(trigger.isConnected){
    trigger.setAttribute('aria-expanded','false');
    if(document.activeElement===document.body)trigger.focus();
   }
  },{once:true});
  document.body.append(dialog);
  sync();
  trigger.setAttribute('aria-expanded','true');
  dialog.showModal();
 }
 document.addEventListener('click',event=>{
  const trigger=event.target.closest('#mobile-menu');
  if(!trigger||!isChristmas()||!mobile.matches)return;
  event.stopImmediatePropagation();
  openArcade(trigger);
 },true);
 mobile.addEventListener('change',()=>arcade?.close());

 const tabs=document.createElement('div');
 tabs.className='christmas-notice-tabs';
 tabs.setAttribute('role','group');
 tabs.setAttribute('aria-label','Actividad / Activity');
 tabs.innerHTML=`<button type="button" aria-controls="jj-inbox" aria-pressed="true">◷ ${bi('Actividad','Activity')}</button>
 <button type="button" aria-controls="jj-push-settings" aria-pressed="false">▯ ${bi('En este teléfono','On this device')}</button>`;
 noticePanel.querySelector('header').after(tabs);
 const [activity,device]=tabs.querySelectorAll('button');
 const previousShowSettings=showNoticeSettings;
 showNoticeSettings=function(show){
  previousShowSettings(show);
  activity.setAttribute('aria-pressed',String(!show));
  device.setAttribute('aria-pressed',String(show));
 };
 activity.onclick=()=>{if(!pushSettings.hidden)pushToggle.click();};
 device.onclick=()=>{if(pushSettings.hidden)pushToggle.click();};
 let season=isChristmas();
 new MutationObserver(()=>{
  if(season===isChristmas())return;
  season=isChristmas();
  arcade?.close();
  if(!noticePanel.hidden)toggleInbox(false);
 }).observe(document.documentElement,{attributes:true,attributeFilter:['data-season']});
})();
