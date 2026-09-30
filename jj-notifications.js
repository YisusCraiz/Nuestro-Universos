'use strict';
const JJActivity={user:null,session:null,data:null,busy:false,seen:new Set(),initial:true,generation:0};
const noticeButton=document.createElement('button');noticeButton.id='jj-notification-button';noticeButton.className='notification-bell';noticeButton.hidden=true;document.body.append(noticeButton);
function noticeText(n){return n.kind==='crown'?bi(`${esc(n.name)} ganó una corona 👑`,`${esc(n.name)} won a crown 👑`):n.kind==='online'?bi(`${esc(n.name)} se conectó`,`${esc(n.name)} came online`):bi(`${esc(n.name)} se desconectó`,`${esc(n.name)} went offline`);}
function noticePlain(n){return n.kind==='crown'?say(`${n.name} ganó una corona 👑`,`${n.name} won a crown 👑`):n.kind==='online'?say(`${n.name} se conectó`,`${n.name} came online`):say(`${n.name} se desconectó`,`${n.name} went offline`);}
function paintBell(){noticeButton.hidden=!state.profile;noticeButton.innerHTML=`🔔 <span>${JJActivity.data?.unread||0}</span>`;noticeButton.setAttribute('aria-label',say('Notificaciones','Notifications'));}
async function activityTick(readThrough=null){
 if(!state.profile||state.demo||!db||document.hidden)return;
 const user=state.profile.id;
 if(JJActivity.user!==user){JJActivity.user=user;try{const key='jj-presence-'+user;JJActivity.session=sessionStorage.getItem(key)||crypto.randomUUID();sessionStorage.setItem(key,JJActivity.session);}catch{JJActivity.session=crypto.randomUUID();}JJActivity.data=null;JJActivity.seen=new Set();JJActivity.initial=true;JJActivity.generation++;JJActivity.busy=false;}
 if(JJActivity.busy)return;const generation=JJActivity.generation;JJActivity.busy=true;
 try{const data=await rpc('jj_activity',{p_session:JJActivity.session,p_action:'ping',p_read_through:readThrough});if(generation!==JJActivity.generation||state.profile?.id!==user)return;
  const fresh=data.notices.filter(n=>!JJActivity.seen.has(n.id)&&!n.read_at);data.notices.forEach(n=>JJActivity.seen.add(n.id));
  const announce=JJActivity.initial?fresh.filter(n=>n.kind==='crown'):fresh;
  if(announce.length)toast(announce.length===1?noticePlain(announce[0]):say(`Tienes ${announce.length} avisos nuevos. Abre la campana.`,`You have ${announce.length} new notices. Open the bell.`));
  JJActivity.initial=false;JJActivity.data=data;paintBell();if($('#jj-inbox'))renderInbox();
 }catch(error){if(generation===JJActivity.generation){JJActivity.data=null;paintBell();if($('#jj-inbox'))renderInbox();}}
 finally{if(generation===JJActivity.generation)JJActivity.busy=false;}
}
function leaveActivity(){const session=JJActivity.session;JJActivity.generation++;JJActivity.user=null;JJActivity.session=null;JJActivity.data=null;JJActivity.busy=false;if(session&&db&&!state.demo)rpc('jj_activity',{p_session:session,p_action:'leave'}).catch(()=>{});}
function renderInbox(){const box=$('#jj-inbox');if(!box)return;const d=JJActivity.data;
 box.innerHTML=state.demo?`<p>${bi('Los avisos compartidos necesitan iniciar sesión en Supabase.','Shared notices require signing in to Supabase.')}</p>`:!d?`<p>${bi('No se pudieron cargar los avisos. Comprueba la conexión y ejecuta la actualización 06 de Supabase.','Could not load notices. Check your connection and apply Supabase update 06.')}</p>${jjButton('retry-notices','Reintentar','Retry')}`:`<div class="presence-list">${d.people.map(p=>`<span><i class="presence-dot ${p.online?'online':''}"></i>${esc(p.name)} · ${p.online?bi('En línea','Online'):bi('Sin conexión','Offline')}</span>`).join('')}</div><p class="hint">${bi('Los cierres inesperados se detectan tras unos 60 segundos. Se guardan los avisos para cuando vuelvas; la hora indica cuándo se detectaron.','Unexpected disconnects are detected after about 60 seconds. Notices are saved for your return; times show when changes were detected.')}</p><div class="notice-list">${d.notices.length?d.notices.map(n=>`<article class="notice ${n.read_at?'':'unread'}"><strong>${noticeText(n)}</strong><time data-date="${esc(n.created_at)}" data-date-style="full">${new Date(n.created_at).toLocaleString(UniverseI18n.locale())}</time>${n.kind==='crown'?`<small>${bi('Período iniciado el','Period starting')} ${jjDate(n.reference)}</small>`:''}</article>`).join(''):`<p>${bi('Todavía no hay notificaciones.','No notifications yet.')}</p>`}</div>${jjButton('read-notices','Marcar como leídas','Mark as read','btn secondary')}`;
 if($('#retry-notices'))$('#retry-notices').onclick=()=>activityTick();if($('#read-notices'))$('#read-notices').onclick=()=>activityTick(d.notices[0]?.id||0);
}
window.addEventListener('universe-language',paintBell);
noticeButton.onclick=async()=>{modal(`<h2>${bi('Notificaciones','Notifications')}</h2><div id="jj-inbox"></div>`);renderInbox();await activityTick();};
const noticeShell=shell;shell=function(){noticeShell();paintBell();activityTick();};
const noticeLogout=logout;logout=async()=>{leaveActivity();await noticeLogout();paintBell();if(state.profile)activityTick();};
setInterval(()=>activityTick(),15000);
// Hidden/closed tabs expire by lease: avoids false disconnects on reload or tab switches.
document.addEventListener('visibilitychange',()=>{if(!document.hidden)activityTick();});
window.addEventListener('online',()=>activityTick());
