'use strict';
// Native back traverses sections and game rooms, including in an installed PWA.
const JJHistory={started:false,restoring:false,current:null,exiting:false,guardDialog:false,depth:0};
function historyRoute(page,game=null){return {jjUniverse:true,page,game};}
function rememberRoute(route){
 if(JJHistory.restoring||!state.profile)return;
 if(!JJHistory.started){JJHistory.started=true;JJHistory.depth=0;history.replaceState({...historyRoute('home'),guard:true,jjDepth:0},'');history.pushState({...historyRoute('home'),jjDepth:0},'');JJHistory.current=historyRoute('home');}
 const current=JJHistory.current&&historyRoute(JJHistory.current.page,JJHistory.current.game);
 if(JSON.stringify(route)!==JSON.stringify(current)){history.pushState({...route,jjDepth:++JJHistory.depth},'');JJHistory.current=route;}
}
function goJJBack(){if($('#modal').open){if(!modalBusy)$('#modal').close();return;}if(JJHistory.depth>0)history.back();else if(state.page!=='home')navigate('home');}
function updateBackButton(){const b=$('#jj-page-back');if(b)b.disabled=!JJHistory.depth&&state.page==='home';}
const backShell=shell;shell=function(){backShell();const top=$('.topbar');if(top){const b=document.createElement('button');b.id='jj-page-back';b.className='btn secondary jj-page-back';b.innerHTML=bi('← Atrás','← Back');b.onclick=goJJBack;top.prepend(b);}document.querySelectorAll('[data-logout]').forEach(b=>b.innerHTML=bi('Cerrar sesión','Sign out'));updateBackButton();};

const historyNavigate=navigate;
navigate=async function(page){if(state.profile&&menus.some(m=>m[0]===page)&&!(page==='novios'&&state.profile.handle!=='jesus'))rememberRoute(historyRoute(page));await historyNavigate(page);};
const historySurface=gameSurface;
gameSurface=function(id,...args){const token=historySurface(id,...args);rememberRoute(historyRoute(['wordsearch','maze'].includes(id)?'puzzles':'games',id));return token;};
const historyTtt=tttPage;
tttPage=async function(){rememberRoute(historyRoute('puzzles','tictactoe'));return historyTtt();};
const historyDuo=duoPage;
duoPage=async function(kind,v){if(kind==='wands')rememberRoute(historyRoute('puzzles','wands'));return historyDuo(kind,v);};
window.addEventListener('popstate',async e=>{
 if(JJHistory.exiting||!state.profile||!JJHistory.started)return;
 const route=e.state?.jjUniverse?e.state:{...historyRoute('home'),guard:true};
 if($('#modal').open){const guard=JJHistory.guardDialog;if(!modalBusy)$('#modal').close();if(!guard)history.pushState({...JJHistory.current,jjDepth:JJHistory.depth},'');return;}
 JJHistory.depth=Math.max(0,route.jjDepth||0);
 if(route.guard){JJHistory.restoring=true;try{await navigate('home');JJHistory.current=historyRoute('home');modal(`<h2>${bi('Ya estás en Inicio','You are already at Home')}</h2><p>${bi('¿Quieres quedarte en nuestro universo o salir de la página?','Would you like to stay in our universe or leave the page?')}</p><div class="row">${jjButton('stay-universe','Quedarme aquí','Stay here')}${jjButton('leave-universe','Salir de la página','Leave page','btn secondary')}</div>`);JJHistory.guardDialog=true;let leave=false;$('#modal').addEventListener('close',()=>{JJHistory.guardDialog=false;if(!leave)history.pushState({...JJHistory.current,jjDepth:JJHistory.depth},'');},{once:true});$('#stay-universe').onclick=()=>$('#modal').close();$('#leave-universe').onclick=()=>{leave=true;JJHistory.exiting=true;$('#modal').close();history.back();};}finally{JJHistory.restoring=false;}return;}
 JJHistory.restoring=true;JJHistory.current=route;try{await navigate(route.page);if(state.page!==route.page)return;if(route.game==='tictactoe')await historyTtt();else if(route.game==='wands'){jjCleanup();clearTimers();await historyDuo('wands',++state.version);}else if(route.game&&['wordsearch','maze'].includes(route.game))startPuzzle(route.game);else if(route.game?.startsWith('table:'))await openPlayingTable(route.game.slice(6));else if(route.game)launchGame(route.game);}finally{JJHistory.restoring=false;updateBackButton();}
});
const historyLogout=logout;
logout=async function(){await historyLogout();if(!state.profile){JJHistory.started=false;JJHistory.depth=0;JJHistory.current=null;JJHistory.exiting=false;history.replaceState(null,'');}};
