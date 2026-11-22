'use strict';

(() => {
 const mobile=matchMedia('(max-width:760px)');
 const isChristmas=()=>document.documentElement.dataset.season==='christmas';
 const games=[
  ['vs','⚔','Jugar en pareja','Play together'],
  ['games','♧','Minijuegos','Mini games']
 ];
 const quick=[
  ['home','⌂','Inicio','Home','0%','0%','33.333%'],
  ['memories','▧','Recuerdos','Memories','100%','66.667%','100%'],
  ['musicas','♫','Música','Music','66.667%','66.667%','100%']
 ];
 const groups=[
  ['⚔','Arena','Arena',['vs','cards','casino']],
  ['▷','Sala multimedia','Media room',['musicalbums','comics','live']],
  ['♡','Nuestro rincón','Our corner',['messages','flowers','affection','candy','gifts','regalos-jxj','cartas-3d-jj','pets','collection','shop','yuki','secret_adventures']],
  ['✦','Novedades y cuenta','News and account',['news','profile','season','missions','calendar','goals','approvals']],
  ['☾','Más apartados','More sections',[]]
 ];
 let arcade=null;

 function openArcade(){
  const appRoot=document.getElementById('app');
  if(!appRoot?.querySelector('#primary-nav'))return false;
  if(arcade?.hasAttribute('open'))return true;
  const profileId=state.profile?.id;
  const dialog=document.createElement('dialog');
  const christmas=isChristmas();
  const closeButtonLabel=say('Cerrar menú','Close menu');
  dialog.id='jj-arcade-menu';
  dialog.setAttribute('aria-labelledby','jj-arcade-title');
  dialog.setAttribute('aria-modal','true');
  dialog.innerHTML=`
   <header class="arcade-hero">
    <div>${christmas?'<span class="arcade-eyebrow">✦ JULISSA &amp; JESÚS</span>':''}
    <h2 id="jj-arcade-title">${christmas?bi('Juntos en otra aventura','Together on another adventure'):bi('Nuestro universo','Our universe')}</h2>
    ${christmas?`<p>${bi('Aventura arcade · Edición de Navidad','Arcade adventure · Christmas edition')}</p>`:''}</div>
    <button type="button" class="arcade-close" autofocus aria-label="${closeButtonLabel}">×</button>
   </header>
   <div class="arcade-body">
    <div class="arcade-play"></div>
    <div class="arcade-quick"></div>
    ${christmas?`<h3>${bi('Explora el universo','Explore the universe')}</h3>`:''}
    <nav class="arcade-groups" aria-labelledby="jj-arcade-title"></nav>
   </div>`;

  const shortcuts=new Map();
  function addShortcut(container,[route,icon,es,en,row,left,right]){
   const button=document.createElement('button');
   button.type='button';
   button.dataset.arcadeRoute=route;
   const art=row
    ? `<span class="arcade-sprites" aria-hidden="true"><span style="background-position:${left} ${row}"></span><span style="background-position:${right} ${row}"></span></span>`
    : '';
   button.innerHTML=christmas&&route==='games'
    ? art+`<span class="arcade-card-text"><small>${bi('MISIÓN PRINCIPAL','MAIN QUEST')}</small><strong>${bi('Juega con Julie','Play together')}</strong><span>${bi('Juegos · En pareja o en solitario','Games · Together or solo')}</span></span>`
    : art+`<span class="arcade-card-text"><span aria-hidden="true">${icon}</span> ${bi(es,en)}</span>`;
   container.append(button);
   shortcuts.set(route,button);
  }
  const play=dialog.querySelector('.arcade-play');
  const favorites=dialog.querySelector('.arcade-quick');
  if(christmas)addShortcut(favorites,['games','♧','Minijuegos','Mini games','100%','0%','33.333%']);
  else games.forEach(item=>addShortcut(play,item));
  quick.forEach(item=>addShortcut(favorites,item));

  const list=dialog.querySelector('.arcade-groups');
  const destinations=new Map();
  const panels=groups.map(([icon,es,en,routes])=>{
   const panel=document.createElement('details');
   panel.innerHTML=`<summary><span aria-hidden="true">${icon}</span><span>${bi(es,en)}</span><span class="arcade-chevron" aria-hidden="true">⌄</span></summary><div class="arcade-links"></div>`;
   const links=panel.querySelector('.arcade-links');
   routes.forEach(route=>destinations.set(route,links));
   list.append(panel);
   return panel;
  });
  const other=panels[panels.length-1].querySelector('.arcade-links');
  const linksByRoute=new Map();
  let nav;
  let backdrop;

  function available(source){
   return source&&!source.hidden&&!source.disabled&&sectionAllowed(source.dataset.nav);
  }
  function updateButton(button,source){
   const hidden=!available(source);
   if(button.hidden!==hidden)button.hidden=hidden;
   if(source?.getAttribute('aria-current')==='page')button.setAttribute('aria-current','page');
   else button.removeAttribute('aria-current');
  }
  function update(){
   const currentNav=appRoot.querySelector('#primary-nav');
   if(!currentNav||state.profile?.id!==profileId){closeMenu();return;}
   if(nav!==currentNav){
    nav=currentNav;
    observer.disconnect();
    observer.observe(appRoot,{childList:true});
    observer.observe(nav,{
     subtree:true,childList:true,characterData:true,attributes:true,
     attributeFilter:['hidden','disabled','aria-current','data-nav']
    });
    const currentTrigger=appRoot.querySelector('#mobile-menu');
    currentTrigger?.setAttribute('aria-expanded','true');
   }
   const sources=new Map([...nav.querySelectorAll('button[data-nav]')].map(button=>[button.dataset.nav,button]));
   for(const [route,button] of shortcuts)updateButton(button,sources.get(route));
   for(const [route,link] of linksByRoute){
    if(!sources.has(route)){link.button.remove();linksByRoute.delete(route);}
   }
   // Use the live navigation as the source of routes, permissions and labels.
   // Modules only need to register a primary-nav entry for it to appear here.
   for(const [route,source] of sources){
    if(shortcuts.has(route))continue;
    let link=linksByRoute.get(route);
    if(!link){
     const button=document.createElement('button');
     button.type='button';
     button.dataset.arcadeRoute=route;
     (destinations.get(route)||other).append(button);
     link={button,label:null};
     linksByRoute.set(route,link);
    }
    if(link.label!==source.innerHTML){
     link.label=source.innerHTML;
     link.button.innerHTML=link.label;
    }
    updateButton(link.button,source);
   }
   for(const panel of [play,favorites,...panels]){
    panel.hidden=!panel.querySelector('button:not([hidden])');
   }
  }

  const observer=new MutationObserver(update);
  const closeButton=dialog.querySelector('.arcade-close');
  closeButton.onclick=closeMenu;
  dialog.addEventListener('click',event=>{
   if(event.target===dialog&&event.clientY<dialog.getBoundingClientRect().top){closeMenu();return;}
   const target=event.target.closest('button[data-arcade-route]');
   if(!target)return;
   const liveNav=appRoot.querySelector('#primary-nav');
   const source=[...(liveNav?.querySelectorAll('button[data-nav]')||[])].find(button=>button.dataset.nav===target.dataset.arcadeRoute);
   if(state.profile?.id!==profileId||!available(source)){update();return;}
   closeMenu();
   source.click();
  });
  function closeMenu(){
   if(!dialog.hasAttribute('open'))return;
   if(backdrop)finish();
   else dialog.close();
  }
  function dismissFallback(event){
   if(event.key==='Escape'){
    event.preventDefault();
    closeMenu();
   }
  }
  function closeOnDesktop(){
   if(!mobile.matches)closeMenu();
  }
  function finish(){
   observer.disconnect();
   window.removeEventListener('resize',closeOnDesktop);
   document.removeEventListener('keydown',dismissFallback);
   if(backdrop){
    backdrop.remove();
    appRoot.inert=false;
   }
   dialog.remove();
   if(arcade!==dialog)return;
   arcade=null;
   const currentTrigger=appRoot.querySelector('#mobile-menu');
   currentTrigger?.setAttribute('aria-expanded','false');
   if(document.activeElement===document.body)currentTrigger?.focus();
  }

  arcade=dialog;
  dialog.addEventListener('close',finish,{once:true});
  window.addEventListener('resize',closeOnDesktop);
  document.body.append(dialog);
  update();
  if(typeof dialog.showModal==='function')dialog.showModal();
  else{
   backdrop=document.createElement('div');
   backdrop.className='arcade-backdrop';
   backdrop.onclick=closeMenu;
   dialog.before(backdrop);
   dialog.classList.add('arcade-fallback');
   dialog.setAttribute('open','');
   appRoot.inert=true;
   document.addEventListener('keydown',dismissFallback);
   closeButton.focus();
  }
  return true;
 }
 window.JJMobileMenu={open:openArcade};

 document.addEventListener('DOMContentLoaded',()=>{
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
   if(!noticePanel.hidden)toggleInbox(false);
  }).observe(document.documentElement,{attributes:true,attributeFilter:['data-season']});
 },{once:true});
})();
