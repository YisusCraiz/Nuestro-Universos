'use strict';
const JJActivity={error:false,user:null,session:null,data:null,busy:false,seen:new Set(),initial:true,generation:0};
const noticeDock=document.createElement('aside');
noticeDock.id='jj-notifications';
noticeDock.hidden=true;
noticeDock.innerHTML=`<button type="button" id="jj-notification-button" class="edge-tab" aria-controls="jj-notice-panel" aria-expanded="false"></button>
<section id="jj-notice-panel" class="edge-panel" aria-labelledby="jj-notice-title" hidden>
 <header><strong id="jj-notice-title"></strong><div class="notice-header-actions">
  <button type="button" class="edge-close" id="jj-push-toggle" aria-controls="jj-push-settings" aria-expanded="false">⚙</button>
  <button type="button" class="edge-close" id="jj-notice-close">✕</button>
 </div></header>
 <div id="jj-inbox" tabindex="0"></div>
 <section id="jj-push-settings" tabindex="0" hidden></section>
</section>`;
document.body.append(noticeDock);
const noticeButton=noticeDock.querySelector('#jj-notification-button');
const noticePanel=noticeDock.querySelector('#jj-notice-panel');
const noticeClose=noticeDock.querySelector('#jj-notice-close');
const fitInbox=fitEdgePanel(noticePanel);
const pushToggle=noticeDock.querySelector('#jj-push-toggle');
const pushSettings=noticeDock.querySelector('#jj-push-settings');
function showNoticeSettings(show){
 noticeDock.querySelector('#jj-inbox').hidden=show;
 pushSettings.hidden=!show;
 pushToggle.setAttribute('aria-expanded',String(show));
 const label=show?say('Volver al historial','Back to notification history'):say('Avisos en este teléfono','Notifications on this device');
 pushToggle.textContent=show?'←':'⚙';
 pushToggle.title=label;
 pushToggle.setAttribute('aria-label',label);
}
function toggleInbox(open){
 if(!open)showNoticeSettings(false);
 noticePanel.hidden=!open;
 fitInbox();
 noticeButton.setAttribute('aria-expanded',String(open));
 if(open){renderInbox();activityTick();}
}
function noticeRoute(n){return ['music','memories','messages'].includes(n.kind)?n.kind:null;}
function noticeText(n){if(noticeRoute(n))return bi(esc(noticePlain(n,'es')),esc(noticePlain(n,'en')));return n.kind==='crown'?bi(`${esc(n.name)} ganó una corona 👑`,`${esc(n.name)} won a crown 👑`):n.kind==='online'?bi(`${esc(n.name)} se conectó`,`${esc(n.name)} came online`):bi(`${esc(n.name)} se desconectó`,`${esc(n.name)} went offline`);}
function noticePlain(n,lang=UniverseI18n.language){const page=noticeRoute(n);if(page){const labels={music:['subió una canción','uploaded a song'],memories:['guardó un recuerdo','saved a memory'],messages:['escribió una cartita','wrote a letter']};return n.name+' '+labels[page][lang==='en'?1:0];}return n.kind==='crown'?say(`${n.name} ganó una corona 👑`,`${n.name} won a crown 👑`):n.kind==='online'?say(`${n.name} se conectó`,`${n.name} came online`):say(`${n.name} se desconectó`,`${n.name} went offline`);}
function paintBell(){
 noticeDock.hidden=!state.profile;
 if(noticeDock.hidden)toggleInbox(false);
 const title=say('Notificaciones','Notifications');
 const unread=JJActivity.data?.unread||0;
 noticeButton.innerHTML=`<span aria-hidden="true">🔔</span>${JJActivity.error||unread?`<b aria-hidden="true">${JJActivity.error?'!':unread}</b>`:''}`;
 noticeButton.setAttribute('aria-label',unread?`${title} (${unread})`:title);
 noticeButton.title=title;
 $('#jj-notice-title').textContent=title;
 showNoticeSettings(!pushSettings.hidden);
 noticeClose.setAttribute('aria-label',say('Cerrar notificaciones','Close notifications'));
}
async function activityTick(readThrough=null){
 if(!state.profile||state.demo||!db||document.hidden)return;
 const user=state.profile.id;
 if(JJActivity.user!==user){JJActivity.user=user;try{const key='jj-presence-'+user;JJActivity.session=sessionStorage.getItem(key)||crypto.randomUUID();sessionStorage.setItem(key,JJActivity.session);}catch{JJActivity.session=crypto.randomUUID();}JJActivity.data=null;JJActivity.error=false;JJActivity.seen=new Set();JJActivity.initial=true;JJActivity.generation++;JJActivity.busy=false;}
 if(JJActivity.busy)return;const generation=JJActivity.generation;JJActivity.busy=true;
 try{const data=await rpc('jj_activity',{p_session:JJActivity.session,p_action:'ping',p_read_through:readThrough});if(generation!==JJActivity.generation||state.profile?.id!==user)return;
  const fresh=data.notices.filter(n=>!JJActivity.seen.has(n.id)&&!n.read_at);data.notices.forEach(n=>JJActivity.seen.add(n.id));
  const announce=JJActivity.initial?fresh.filter(n=>n.kind==='crown'):fresh;
  if(announce.length)toast(announce.length===1?noticePlain(announce[0]):say(`Tienes ${announce.length} avisos nuevos. Abre la campana.`,`You have ${announce.length} new notices. Open the bell.`));
  JJActivity.initial=false;JJActivity.error=false;JJActivity.data=data;paintBell();if(!noticePanel.hidden)renderInbox();
 }catch(error){if(generation===JJActivity.generation){JJActivity.error=true;paintBell();if(!noticePanel.hidden)renderInbox();}}
 finally{if(generation===JJActivity.generation)JJActivity.busy=false;}
}
function leaveActivity(){const session=JJActivity.session;JJActivity.generation++;JJActivity.user=null;JJActivity.session=null;JJActivity.data=null;JJActivity.busy=false;if(session&&db&&!state.demo)rpc('jj_activity',{p_session:session,p_action:'leave'}).catch(()=>{});}
function noticeTime(value){
 const date=new Date(value);
 if(!value||!Number.isFinite(date.valueOf()))return '';
 const locale=UniverseI18n.locale();
 const hour=date.toLocaleTimeString(locale,{hour:'numeric',minute:'2-digit'});
 const day=date.toLocaleDateString(locale,{day:'numeric',month:'short'});
 return `<time datetime="${date.toISOString()}"><b>${esc(hour)}</b><span>${esc(day)}</span></time>`;
}

let inboxMarkup='';
function renderInbox(){
 const box=$('#jj-inbox'),d=JJActivity.data;
 if(box.hidden)return;
 const markup=state.demo
  ? `<p>${bi('Inicia sesión para ver tus notificaciones.','Sign in to view your notifications.')}</p>`
  : !d
   ? `<p>${JJActivity.error?bi('No se pudieron cargar los avisos.','Could not load notifications.'):bi('Cargando avisos…','Loading notifications…')}</p>${JJActivity.error?jjButton('retry-notices','Reintentar','Retry'):''}`
   : `<div class="presence-list">${d.people.map(p=>`<span><i class="presence-dot ${p.online?'online':''}" aria-hidden="true"></i>${esc(p.name)} · ${p.online?bi('En línea','Online'):bi('Sin conexión','Offline')}</span>`).join('')}</div>
    <div class="notice-list">${d.notices.length?d.notices.map(n=>{
     const route=noticeRoute(n);
     return `<article class="notice ${n.read_at?'':'unread'}">
      <strong><span class="christmas-notice-icon" aria-hidden="true">${n.kind==='online'?'↪':n.kind==='offline'?'↩':n.kind==='crown'?'♛':'♡'}</span>${noticeText(n)}</strong>
      ${noticeTime(n.created_at)}
      ${route?`<button class="btn secondary" data-notice-route="${route}">${bi('Abrir','Open')}</button>`:''}
      ${n.kind==='crown'?`<small>${bi('Período iniciado el','Period starting')} ${jjDate(n.reference)}</small>`:''}
     </article>`;
    }).join(''):`<p>${bi('Todavía no hay notificaciones.','No notifications yet.')}</p>`}</div>
    ${d.unread&&d.notices.length?jjButton('read-notices','Marcar como leídas','Mark as read','btn secondary'):''}`;
 if(markup===inboxMarkup)return;
 const scroll=box.scrollTop;
 inboxMarkup=markup;
 box.innerHTML=markup;
 box.scrollTop=scroll;
 box.querySelectorAll('[data-notice-route]').forEach(b=>b.onclick=()=>{toggleInbox(false);navigate(b.dataset.noticeRoute);});
 if($('#retry-notices'))$('#retry-notices').onclick=()=>activityTick();
 if($('#read-notices'))$('#read-notices').onclick=()=>activityTick(d.notices[0].id);
}
window.addEventListener('universe-language',()=>{paintBell();if(!noticePanel.hidden)renderInbox();});
noticeButton.onclick=()=>toggleInbox(noticePanel.hidden);
noticeClose.onclick=()=>{toggleInbox(false);noticeButton.focus();};
noticeDock.addEventListener('keydown',e=>{if(e.key==='Escape'&&!noticePanel.hidden){toggleInbox(false);noticeButton.focus();}});
document.addEventListener('click',e=>{if(!noticePanel.hidden&&!noticeDock.contains(e.target))toggleInbox(false);},true);
const noticeShell=shell;shell=function(){noticeShell();paintBell();activityTick();};
const noticeLogout=logout;logout=async()=>{toggleInbox(false);leaveActivity();await noticeLogout();paintBell();if(state.profile)activityTick();};
setInterval(()=>activityTick(),15000);
// Hidden/closed tabs expire by lease: avoids false disconnects on reload or tab switches.
document.addEventListener('visibilitychange',()=>{if(!document.hidden)activityTick();});
window.addEventListener('online',()=>activityTick());
