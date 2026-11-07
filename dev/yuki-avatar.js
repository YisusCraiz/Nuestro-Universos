import {home,skin,phrase} from './yuki-life.js?v=room-1';
export function mountYuki(host) {
  const viewer = state.profile;
  const labels = new Map();
  function uiText(es, en) {
    labels.set(es.trim(), [es.trim(), en.trim()]);
    labels.set(en.trim(), [es.trim(), en.trim()]);
    return say(es, en);
  }
  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `<style>[hidden]{display:none!important}*{box-sizing:border-box}:host{font:14px/1.55 system-ui;color:#eee9f6}button,input,textarea{font:inherit}button{border:1px solid #ffffff20;color:#f7f2ff;background:#514064;padding:.65rem 1rem;cursor:pointer;min-height:44px;border-radius:14px}button:hover{background:#67517c}button:focus-visible,summary:focus-visible{outline:2px solid #ddbcff;outline-offset:3px}aside{position:fixed;z-index:45;bottom:22px;right:16px;max-width:min(290px,92vw);display:flex;flex-direction:column;align-items:center;isolation:isolate}#avatar{touch-action:none;background:transparent!important;border:0!important;padding:0;box-shadow:none;outline-offset:5px;position:relative;min-width:44px}#avatar img{width:108px;height:auto;display:block;pointer-events:none;user-select:none;filter:drop-shadow(0 7px 8px #120b2540);animation:float 4s ease-in-out infinite;transform-origin:bottom center}.mini img{width:46px!important}#avatar[data-mood="happy"] img{animation:hello .65s ease-in-out}#avatar[data-mood="curious"] img{transform:rotate(-7deg)}#avatar::after{position:absolute;right:0;top:8px;color:#6f486f;background:#fff8fc;border-radius:50%;font-size:12px;padding:2px 5px}#avatar[data-mood="happy"]::after{content:"♡"}#avatar[data-mood="sleepy"]::after{content:"zZ"}aside[data-dock="left"] #avatar{transform:translateX(-18px)}aside[data-dock="right"] #avatar{transform:translateX(18px)}#size{font-size:10px;padding:2px 7px;min-height:24px;opacity:.8}aside[data-dock] #size{display:none}aside>section{width:260px;max-width:86vw;background:#fff9ff;color:#49394d;border:1px solid #e8d5ed;border-radius:22px 22px 8px 22px;padding:16px;box-shadow:0 12px 40px #140c2440;margin-bottom:8px}aside>section p{margin:8px 0 14px;font-size:14px}aside>section strong{color:#8c508c}aside>section button{width:100%;background:#735080}dialog{width:min(680px,96vw);height:min(760px,92dvh);max-height:92dvh;padding:0;overflow:hidden;border:1px solid #ffffff24;border-radius:26px;color:#f3edf7;background:radial-gradient(ellipse at top right,#463255 0,transparent 55%),#201b2b;box-shadow:0 30px 100px #0008}dialog::backdrop{background:#100a20b8;backdrop-filter:blur(7px)}.room-head{padding:24px 24px 12px;display:flex;align-items:center;gap:14px}.room-head .mark{background:#baa2db24;border:1px solid #d3b3ee40;border-radius:18px;color:#e5c2ee;width:48px;height:48px;display:grid;place-items:center;font-size:24px}.room-head h2{margin:0;font-size:23px;font-weight:650}.room-head small{color:#c5b3ce}.room-head button{margin-left:auto;background:transparent;padding:6px 12px}.tabs{display:flex;gap:5px;padding:8px 18px 14px;border-bottom:1px solid #ffffff12;overflow:auto}.tabs button{flex:1;white-space:nowrap;font-size:12px;border:0;background:transparent;padding:9px 10px;color:#bcadc8}.tabs button[aria-selected="true"]{background:#c8a4df22;color:#ffe8ff;box-shadow:inset 0 -2px #d5a1d9}.room-body{height:calc(100% - 158px);overflow:auto;padding:16px 24px 24px;overscroll-behavior:contain}dialog details{margin:0}dialog details>summary{display:none}dialog p{color:#bcb0c7;font-size:13px}dialog textarea{width:100%;resize:vertical;min-height:78px;max-height:180px;background:#ffffff08;border:1px solid #ccb2dc36;color:#fff;border-radius:15px;padding:12px;outline-color:#d5a1d9;margin-top:7px}dialog label{display:block;color:#d8cce1;font-size:13px}#chat-log{list-style:none;padding:0;margin:10px 0 20px;display:grid;gap:12px;min-height:150px}#chat-log:empty::before{content:attr(data-empty);white-space:normal;text-align:center;align-self:center;color:#baacc8;padding:24px;border:1px dashed #b59ac733;border-radius:20px}#chat-log>li{background:#ffffff08;padding:14px;border-radius:18px;border:1px solid #ffffff0b}#chat-log>li:has(>span){background:#ac82c723;margin-left:32px}#chat-form{position:sticky;bottom:-24px;background:#211c2cf5;padding:14px 0 22px;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end}#chat-form label{font-size:0}#chat-form textarea{font-size:14px;margin:0;min-height:55px;height:55px}#chat-form button{height:55px;background:#ba92ce;color:#23152e;font-weight:700}#approved,#activity-list{list-style:none;padding:0;display:grid;gap:10px}#approved li,#activity-list li{background:#ffffff07;border:1px solid #ffffff10;padding:14px;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere}.memory-scope{display:block;color:#dabbe7;font-size:11px;margin-bottom:5px}#review{padding:16px;background:#ab80c31c;border-radius:16px;margin-top:16px}#draft button{margin-top:10px}#pane-settings label{display:flex;gap:12px;align-items:center;padding:16px 0;border-bottom:1px solid #ffffff12}#pane-settings input{accent-color:#caa0e3;width:18px;height:18px}#energy{display:flex;align-items:center;gap:5px;padding:3px 7px;border-radius:12px;background:#251a35dd;font-size:10px;color:#eee4f6;margin-top:3px}#energy-shell{width:25px;height:11px;border:1px solid currentColor;border-radius:3px;padding:1px}#energy-fill{height:100%;display:block;background:#7cdbb1}#energy[data-level="low"] #energy-fill{background:#ffd275}#energy[data-level="empty"] #energy-fill{background:#ff8a9b}@keyframes float{50%{transform:translateY(-5px) rotate(1deg)}}@keyframes hello{25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}@media(prefers-reduced-motion:reduce){#avatar img{animation:none!important}}@media(max-width:420px){.room-head{padding:18px 16px 8px}.room-head h2{font-size:20px}.room-body{padding:12px 16px 20px}.tabs{padding:8px 10px 12px;gap:0}.tabs button{font-size:11px;padding:9px 7px}}
aside[data-travel="true"]{transition:left 4s ease-in-out,top 4s ease-in-out}
aside[data-dock] #avatar{transform:none;height:44px;overflow:hidden;width:48px;border-radius:24px 24px 10px 10px}
aside[data-dock] #avatar img{width:64px!important;margin-left:-8px;animation:peek 3.8s ease-in-out infinite;transform-origin:50% 25%}
aside[data-dock] #avatar::after{display:none}
#avatar:not(.mini) img{animation:idle-sway 5s ease-in-out infinite}
#avatar[data-mood="happy"] img{animation:hello .65s ease-in-out,float 4s .65s ease-in-out infinite}
#activity-list li{padding:0;overflow:hidden}#activity-list button{width:100%;text-align:left;background:transparent;border:0;padding:16px;display:flex;justify-content:space-between;gap:12px}#activity-list button:hover{background:#c8a4df22}
@keyframes idle-sway{0%,100%{transform:translateY(0) rotate(0)}35%{transform:translateY(-5px) rotate(-2deg)}70%{transform:translateY(-2px) rotate(2deg)}}
@keyframes peek{0%,100%{transform:translateY(12px) rotate(-7deg)}35%,65%{transform:translateY(0) rotate(6deg)}}
@media(prefers-reduced-motion:reduce){aside{transition:none!important}#avatar img{animation:none!important}}

#avatar.mini{width:60px;min-width:60px;padding:0}#avatar.mini img{width:60px!important;height:auto!important;margin:0!important;max-width:none}
aside[data-dock] #avatar{width:60px;height:44px;min-height:44px;overflow:hidden;border-radius:0;transform:none}
aside[data-dock] #avatar img{width:60px!important;margin:0!important;animation:peek-natural 4s ease-in-out infinite;transform-origin:50% 25%}
aside[data-walking] #avatar img{animation:walk-bob .65s ease-in-out infinite}
@keyframes peek-natural{0%,100%{transform:translateY(6px)}50%{transform:translateY(0) rotate(3deg)}}
@keyframes walk-bob{50%{transform:translateY(-4px) rotate(-4deg)}}
#chat-log .memory-prompt{font-size:12px;white-space:normal;border-top:1px solid #ffffff22;margin-top:12px;padding-top:12px}
#chat-log .memory-prompt button{margin-top:8px;font-size:12px}
@media(prefers-reduced-motion:reduce){#avatar img{animation:none!important}}

.yuki-pose{display:none;pointer-events:none}
.sprite-ready #avatar img{display:none!important}
.sprite-ready #avatar{width:120px;min-width:44px;height:160px;padding:0!important;overflow:visible}
.sprite-ready .yuki-pose{display:block;width:120px;height:160px;background-repeat:no-repeat;background-size:400% 300%;background-position:0 0;animation:yuki-idle 5.6s steps(1) infinite,float 4s ease-in-out infinite}
.sprite-ready #avatar.mini{width:76px;height:101.333px}
.sprite-ready #avatar.mini .yuki-pose{width:76px;height:101.333px}
.sprite-ready[data-walking] #avatar .yuki-pose{background-position-y:50%!important;animation:yuki-walk .72s steps(1) infinite}
.sprite-ready[data-walking][data-direction="left"] #avatar{transform:scaleX(-1)}
.sprite-ready[data-dock] #avatar{width:64px!important;height:54px!important;min-height:54px;overflow:hidden;transform:none;border-radius:0}
.sprite-ready[data-dock] #avatar .yuki-pose{width:64px;height:85.333px;background-position-y:100%!important;animation:yuki-peek 4.8s steps(1) infinite}
.sprite-ready[data-dock="right"]{align-items:flex-end}.sprite-ready[data-dock="left"]{align-items:flex-start}
.sprite-ready #avatar::after{display:none}
@keyframes yuki-idle{0%,68%,100%{background-position-x:0%}74%{background-position-x:33.333333%}80%{background-position-x:66.666667%}86%{background-position-x:100%}}
@keyframes yuki-walk{0%,100%{background-position-x:0%}25%{background-position-x:33.333333%}50%{background-position-x:66.666667%}75%{background-position-x:100%}}
@keyframes yuki-peek{0%,70%,100%{background-position-x:0%}75%{background-position-x:33.333333%}81%{background-position-x:66.666667%}91%{background-position-x:100%}}
@media(prefers-reduced-motion:reduce){.sprite-ready #avatar .yuki-pose{animation:none!important}}
</style><aside id="yuki-widget"><section hidden><strong>Yuki</strong><p>${uiText("¡Aquí estoy!", "Here I am!")}</p><button id="open-room" type="button">${uiText("Abrir el rincón de Yuki", "Open Yuki’s corner")}</button></section><button id="avatar" aria-label="${uiText("Abrir o cerrar panel", "Open or close panel")}" aria-expanded="false"><img alt="" src="data:image/webp;base64,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"></button><button id="size">${uiText("Minimizar", "Minimize")}</button><div id="energy" role="status"><span id="energy-shell" aria-hidden="true"><span id="energy-fill"></span></span><span id="energy-text">…</span></div></aside><dialog aria-labelledby="yuki-room-title"><header class="room-head"><span class="mark" aria-hidden="true">✦</span><div><small> NUESTRO UNIVERSO </small><h2 id="yuki-room-title">Yuki</h2></div><button id="close-room" aria-label="${uiText('Cerrar','Close')}">✕</button></header><nav class="tabs" role="tablist" aria-label="${uiText('El rincón de Yuki','Yuki’s corner')}"><button role="tab" id="tab-chat" aria-controls="pane-chat" aria-selected="true" data-pane="chat">${uiText('Conversar','Chat')}</button><button role="tab" id="tab-memories" aria-controls="pane-memories" aria-selected="false" data-pane="memories">${uiText('Recuerdos','Memories')}</button><button role="tab" id="tab-activities" aria-controls="pane-activities" aria-selected="false" data-pane="activities">${uiText('Explorar','Explore')}</button><button role="tab" id="tab-settings" aria-controls="pane-settings" aria-selected="false" data-pane="settings">${uiText('Ajustes','Settings')}</button></nav><div class="room-body"><details open><summary>${uiText("Conversación", "Conversation")}</summary><p>${uiText("Escribe /recuerdos o /actividades para consultar tu perfil. Los demás mensajes van a Yuki. La conversación se guarda para tu perfil.", "Type /memories or /activities to check your profile. Other messages go to Yuki. Your conversation is saved to your profile.")}</p><button id="older-chat" type="button" hidden>${uiText("Cargar mensajes anteriores","Load earlier messages")}</button><p id="chat-status" role="status"></p><ol id="chat-log" role="log" aria-label="${uiText("Mensajes", "Messages")}" style="overflow-wrap:anywhere;white-space:pre-wrap"></ol><form id="chat-form"><label>${uiText("Tu mensaje", "Your message")} <textarea required maxlength="2000" rows="3"></textarea></label><button>${uiText("Enviar", "Send")}</button></form></details><details><summary>${uiText("Recuerdos aprobados", "Approved memories")}</summary><p>${uiText("Solo se guardan los recuerdos que apruebes.", "Only memories you approve are saved.")}</p><form id="draft"><label>${uiText("Proponer un recuerdo", "Suggest a memory")} <textarea required maxlength="450"></textarea></label><button>${uiText("Revisar", "Review")}</button></form><div id="review" hidden><label><input type="checkbox" id="share-memory">${uiText("Compartir este recuerdo con mi pareja","Share this memory with my partner")}</label><strong>${uiText("Revisa tu propuesta", "Review your suggestion")}</strong><p></p><button id="approve">${uiText("Aprobar", "Approve")}</button> <button id="discard">${uiText("Descartar", "Discard")}</button></div><p role="status" id="memory-status">${uiText("Todavía no hay recuerdos aprobados.", "No approved memories yet.")}</p><button id="retry-memories" type="button" hidden>${uiText("Volver a cargar recuerdos", "Reload memories")}</button><ul id="approved"></ul><button id="older" type="button" hidden>${uiText("Ver recuerdos anteriores", "See older memories")}</button></details><details><summary>${uiText("Actividades visibles", "Visible activities")}</summary><p id="activity-note"></p><ul id="activity-list"></ul></details><div id="settings"><label><input id="show-energy" type="checkbox">${uiText('Mostrar batería junto a Yuki','Show battery beside Yuki')}</label><label><input id="auto-dock" type="checkbox" checked>${uiText('Hacerse pequeña al estar inactiva','Shrink when idle')}</label><label><input id="wander" type="checkbox" checked>${uiText('Pasear por la pantalla al estar pequeña','Wander around the screen when small')}</label><p>${uiText('La batería representa los intentos diarios. Se recarga a medianoche de Reynosa.','The battery represents daily attempts. It refills at midnight in Reynosa.')}</p><p id="settings-energy"></p><button id="walk-now" type="button">${uiText("Pasear ahora","Wander now")}</button><p id="motion-note"></p></div></div></dialog>`;

const box=root.querySelector('aside'),panel=root.querySelector('section'),avatar=root.querySelector('#avatar'),size=root.querySelector('#size');
let pinnedEdge=null,pinnedVertical=null;
const layoutKey = 'nuestro-universo.yuki.preview.layout.v1';
function saveLayout() {
  const {left, top} = box.getBoundingClientRect();
  try {
    localStorage.setItem(layoutKey, JSON.stringify({left, top, mini: avatar.classList.contains('mini'),dock:pinnedEdge,corner:pinnedVertical}));
  } catch { /* Storage is optional. */ }
}
function restoreLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(layoutKey));
    if (!saved || typeof saved.mini !== 'boolean' ||
        !Number.isFinite(saved.left) || !Number.isFinite(saved.top)) return;
    avatar.classList.toggle('mini', saved.mini);
    size.textContent = saved.mini ? uiText("Restaurar", "Restore") : uiText("Minimizar", "Minimize");
    refreshMood();
    if(['left','right'].includes(saved.dock)&&['top','bottom'].includes(saved.corner)){pinnedEdge=saved.dock;pinnedVertical=saved.corner;box.dataset.dock=pinnedEdge;avatar.classList.add('mini');}
    place(pinnedEdge?(pinnedEdge==='left'?0:innerWidth):saved.left,pinnedEdge?(pinnedVertical==='top'?0:innerHeight):saved.top);
  } catch { /* Keep the default layout when storage is unavailable. */ }
}
function place(left, top) {
  box.style.right = box.style.bottom = 'auto';
  box.style.left = Math.max(0, Math.min(innerWidth - box.offsetWidth, left)) + 'px';
  box.style.top = Math.max(0, Math.min(innerHeight - box.offsetHeight, top)) + 'px';
}
let start,drag=false;
avatar.onpointerdown=e=>{if(!e.isPrimary || e.button!==0)return;const b=box.getBoundingClientRect();start={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top};drag=false;avatar.setPointerCapture(e.pointerId)};
avatar.onpointermove=e=>{if(start?.id!==e.pointerId)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.hypot(dx,dy)>5)drag=true;if(drag){pinnedEdge=null;pinnedVertical=null;delete box.dataset.dock;panel.hidden=true;avatar.setAttribute('aria-expanded','false');avatar.dataset.mood="curious";place(start.left+dx,start.top+dy)}};
avatar.onpointerup=avatar.onpointercancel=e=>{if(start?.id===e.pointerId){start=null;if(drag){const b=box.getBoundingClientRect();if((b.left<=48 || innerWidth-b.right<=48)&&(b.top<=64 || innerHeight-b.bottom<=64))pinAtEdge(b.left<innerWidth/2?'left':'right',b.top<innerHeight/2?'top':'bottom');else{avatar.classList.add('mini');size.textContent=uiText('Restaurar','Restore');saveLayout();clearTimeout(idleTimer);scheduleWander();}}refreshMood()}};
function pinAtEdge(edge,vertical){
 stopTravel();clearTimeout(idleTimer);pinnedEdge=edge;pinnedVertical=vertical;
 panel.hidden=true;avatar.setAttribute('aria-expanded','false');avatar.classList.add('mini');
 size.textContent=uiText('Restaurar','Restore');box.dataset.dock=edge;
 place(edge==='left'?0:innerWidth,vertical==='top'?0:innerHeight);saveLayout();
}
function refreshMood(){
  if (!panel.hidden) avatar.dataset.mood = 'happy';
  else if (avatar.classList.contains('mini')) avatar.dataset.mood = 'sleepy';
  else delete avatar.dataset.mood;
}
function fit(){const b=box.getBoundingClientRect();if(pinnedEdge){place(pinnedEdge==='left'?0:innerWidth,pinnedVertical==='top'?0:innerHeight);return;}if(b.bottom>innerHeight){box.style.top='auto';box.style.bottom='0'}if(b.right>innerWidth){box.style.left='auto';box.style.right='0'}}
avatar.onclick=e=>{if(!drag||!e.detail){panel.hidden=!panel.hidden;avatar.setAttribute('aria-expanded',String(!panel.hidden));refreshMood();fit()}drag=false};
size.onclick=()=>{panel.hidden=true;avatar.setAttribute('aria-expanded','false');size.textContent=avatar.classList.toggle('mini')?uiText("Restaurar", "Restore"):uiText("Minimizar", "Minimize");refreshMood();fit();saveLayout()};

  const room = root.querySelector('dialog');
  const panes = [...room.querySelectorAll('details'), root.querySelector('#settings')];
  const paneNames = ['chat','memories','activities','settings'];
  panes.forEach((pane,i) => {
    pane.id = 'pane-' + paneNames[i];
    pane.setAttribute('role','tabpanel');
    pane.setAttribute('aria-labelledby','tab-' + paneNames[i]);
    pane.hidden = i !== 0;
    if (pane.tagName === 'DETAILS') pane.open = true;
  });
  function selectPane(name) {
    panes.forEach((pane,i) => pane.hidden = paneNames[i] !== name);
    root.querySelectorAll('[role="tab"]').forEach(tab => {
      tab.setAttribute('aria-selected',String(tab.dataset.pane === name));
      tab.tabIndex = tab.dataset.pane === name ? 0 : -1;
    });
  }
  root.querySelectorAll('[role="tab"]').forEach((tab,i) => {
    tab.onclick = () => selectPane(tab.dataset.pane);
    tab.onkeydown = event => {
      if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (i + (event.key === 'ArrowRight' ? 1 : 3)) % 4;
      selectPane(paneNames[index]);
      root.querySelector('#tab-' + paneNames[index]).focus();
    };
  });
  selectPane('chat');
  root.querySelector('#close-room').onclick = () => room.close();
  const preferencesKey = 'nuestro-universo.yuki.preferences.v1';
  const showEnergy = root.querySelector('#show-energy');
  const autoDock = root.querySelector('#auto-dock');
  const wander = root.querySelector('#wander');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  try {
    const prefs = JSON.parse(localStorage.getItem(preferencesKey));
    showEnergy.checked = prefs?.battery === true;
    autoDock.checked = prefs?.dock !== false;
    wander.checked = prefs?.wander !== false;
  } catch {}
  function savePreferences() {
    root.querySelector('#energy').hidden = !showEnergy.checked;
    try { localStorage.setItem(preferencesKey,JSON.stringify({battery:showEnergy.checked,dock:autoDock.checked,wander:wander.checked})); } catch {}
    wake();
    fit();
  }
  showEnergy.onchange = autoDock.onchange = wander.onchange = savePreferences;
  root.querySelector('#energy').hidden = !showEnergy.checked;
  let idleTimer, wanderTimer, travelFrame;
  let destroyed=false;
  function stopTravel() {
    clearTimeout(wanderTimer);
    delete box.dataset.walking;
    cancelAnimationFrame(travelFrame);
    if (box.dataset.travel) {
      const pos = box.getBoundingClientRect();
      delete box.dataset.travel;
      place(pos.left,pos.top);
    }
  }
  function scheduleWander() {
    clearTimeout(wanderTimer);
    if (!pinnedEdge && wander.checked && !reducedMotion.matches && !document.hidden)
      wanderTimer = setTimeout(wanderStep,650);
  }
  function wanderStep() {
    if (pinnedEdge || destroyed || !host.isConnected || room.open || start || !panel.hidden || !avatar.classList.contains('mini') || document.hidden || reducedMotion.matches || !wander.checked) return;
    const pos=box.getBoundingClientRect();
    delete box.dataset.dock;
    refreshMood();
    const maxX=Math.max(0,innerWidth-box.offsetWidth-8), maxY=Math.max(0,innerHeight-box.offsetHeight-8);
    const x=pos.left < maxX/2 ? maxX*(.6+Math.random()*.4) : Math.random()*maxX*.4;
    const y=8+Math.random()*Math.max(0,maxY-8);
    const origin={x:Math.min(pos.left,maxX),y:Math.min(pos.top,maxY)};
    let began;
    box.dataset.direction=x<origin.x?'left':'right';
    box.dataset.walking='true';
    function frame(time){
      if(destroyed)return;
      began ??= time;
      const t=Math.min(1,(time-began)/3800), smooth=t*t*(3-2*t);
      place(origin.x+(x-origin.x)*smooth,origin.y+(y-origin.y)*smooth);
      if(t<1)travelFrame=requestAnimationFrame(frame);
      else {
        delete box.dataset.walking;
        saveLayout();
        scheduleWander();
      }
    }
    travelFrame=requestAnimationFrame(frame);
  }
  function motionChanged() { stopTravel(); scheduleWander(); }
  function visibilityChanged() { if(document.hidden) stopTravel(); else if(avatar.classList.contains('mini'))scheduleWander();else scheduleRest(); }
  reducedMotion.addEventListener('change',motionChanged);
  document.addEventListener('visibilitychange',visibilityChanged);
  function scheduleRest() {
    clearTimeout(idleTimer);
    if (!pinnedEdge && autoDock.checked) idleTimer = setTimeout(rest,8000);
  }
  function wake() {
    stopTravel();
    if(!pinnedEdge)delete box.dataset.dock;
    scheduleRest();
  }
  function rest() {
    if (pinnedEdge || document.hidden) return;
    if (room.open || start) { scheduleRest(); return; }
    stopTravel();
    panel.hidden = true;
    avatar.setAttribute('aria-expanded','false');
    const pos = box.getBoundingClientRect();
    avatar.classList.add('mini');
    size.textContent = uiText('Restaurar','Restore');
    delete box.dataset.dock;
    place(pos.left,pos.top);saveLayout();
    refreshMood();
    scheduleWander();
  }
  host.addEventListener('pointerdown',wake,true);
  const originalSizeClick = size.onclick;
  size.onclick = () => { pinnedEdge=null;pinnedVertical=null;wake(); originalSizeClick(); if(avatar.classList.contains('mini')) scheduleWander(); };
  const originalClick = avatar.onclick;
  avatar.onclick = event => {
    if (drag && event.detail) { drag=false; return; }
    stopTravel();
    if(pinnedEdge){originalClick(event);if(!panel.hidden)nextPhrase();fit();return;}
    pinnedEdge=null;
    delete box.dataset.dock;
    if (avatar.classList.contains('mini')) {
      avatar.classList.remove('mini');
      size.textContent = uiText('Minimizar','Minimize');
    }
    originalClick(event);
    if (!panel.hidden) nextPhrase();
    fit();saveLayout();
    scheduleRest();
  };
  function nextPhrase() { panel.querySelector('p').textContent = phrase(); }
  root.querySelector('#walk-now').onclick=()=>{
    pinnedEdge=null;pinnedVertical=null;delete box.dataset.dock;room.close(); panel.hidden=true; avatar.classList.add('mini');
    avatar.setAttribute('aria-expanded','false'); stopTravel(); clearTimeout(idleTimer);
    if(reducedMotion.matches){rest();return;}
    wander.checked=true; try{localStorage.setItem(preferencesKey,JSON.stringify({battery:showEnergy.checked,dock:autoDock.checked,wander:true}));}catch{}
    wanderStep();
  };
  root.querySelector('#motion-note').textContent=reducedMotion.matches?uiText('Tu dispositivo tiene activado Reducir movimiento. Desactívalo en sus ajustes para ver los paseos.','Reduced motion is enabled on your device. Turn it off in device settings to see wandering.'):uiText('Se hace pequeña tras 8 segundos y comienza a pasear enseguida.','She shrinks after 8 seconds and soon starts wandering.');
  scheduleRest();
  const chatForm = root.querySelector('#chat-form');
  const messageField = chatForm.querySelector('textarea');
  const messages = root.querySelector('#chat-log');
  messages.dataset.empty = uiText('Tu espacio para hablar, recordar y descubrir juntos.','Your space to talk, remember and explore together.');
  messageField.placeholder = uiText('¿Qué tienes en mente?','What’s on your mind?');
  const energy = root.querySelector('#energy');
  let energyData = null, energyRequest = 0;
  function paintEnergy() {
    const caption = root.querySelector('#energy-text');
    if (!energyData) {
      caption.textContent = uiText('Energía sin conexión', 'Energy unavailable');
      return;
    }
    const {remaining, limit} = energyData;
    const percent = Math.round(100 * remaining / limit);
    energy.dataset.level = percent > 20 ? 'high' : remaining > 0 ? 'low' : 'empty';
    root.querySelector('#energy-fill').style.width = percent + '%';
    caption.textContent = percent + '%';
    root.querySelector('#settings-energy').textContent = remaining + ' / ' + limit + ' · ' + uiText('intentos disponibles','attempts available');
    energy.title = uiText('Cupo diario de Yuki. Se recarga a medianoche de Reynosa.', 'Yuki’s daily allowance. Refills at midnight in Reynosa.');
    energy.setAttribute('aria-label', uiText('Energía de Yuki', 'Yuki energy') + ' ' + percent + '%');
    fit();
  }
  async function refreshEnergy() {
    const request = ++energyRequest;
    try {
      const {data,error} = await db.rpc('yuki_chat_battery');
      if (error || !Number.isFinite(data?.remaining) || !(data?.limit > 0)) throw Error('battery');
      if (request !== energyRequest || !host.isConnected) return;
      energyData = data;
    } catch {
      if (request !== energyRequest || !host.isConnected) return;
      energyData = null;
    }
    paintEnergy();
  }
  const checkEnergy = () => { if (!document.hidden) refreshEnergy(); };
  document.addEventListener('visibilitychange',checkEnergy);
  const energyTimer = setInterval(checkEnergy,60000);
  refreshEnergy();
  let chatSession = 0, historyRequest=0, historyCursor=null, sending=false;
  const chatStatus=root.querySelector('#chat-status'), olderChat=root.querySelector('#older-chat');
  function appendTurn(row,container=messages){
    const message=document.createElement('li'), prefix=document.createElement('span');
    prefix.textContent=(viewer.handle==='jesus'?'Jesús':'Julie')+' · ';
    message.append(prefix,row.message);container.append(message);
    const reply=document.createElement('li');reply.textContent=row.reply||uiText('Respuesta pendiente. Si no llega, vuelve a enviar el mensaje.','Reply pending. If it does not arrive, send your message again.');container.append(reply);
    if(row.suggestion && !row.memory_id){
      const prompt=document.createElement('div');prompt.className='memory-prompt';
      const note=document.createElement('p');note.textContent=uiText('¿Conservamos este recuerdo? ','Keep this memory? ')+row.suggestion;
      const button=document.createElement('button');button.type='button';button.textContent=uiText('Revisar recuerdo','Review memory');
      button.onclick=()=>{proposalTurn=row.id;proposalId=crypto.randomUUID();proposal.textContent=row.suggestion;root.querySelector('#share-memory').checked=false;draft.hidden=true;review.hidden=false;selectPane('memories');approve.focus();};
      prompt.append(note,button);reply.append(prompt);
    }
  }
  async function loadHistory(older=false){
    const request=++historyRequest;
    chatStatus.textContent=uiText('Cargando conversación…','Loading conversation…');
    try{
      let query=db.from('yuki_chat_turns').select('id,message,reply,suggestion,memory_id,created_at').order('created_at',{ascending:false}).order('id',{ascending:false}).limit(31);
      if(older && historyCursor) query=query.or('created_at.lt.'+historyCursor.created_at+',and(created_at.eq.'+historyCursor.created_at+',id.lt.'+historyCursor.id+')');
      const {data,error}=await query;if(error)throw error;
      if(request!==historyRequest || !host.isConnected)return;
      const batch=data.slice(0,30);historyCursor=batch.at(-1);olderChat.hidden=data.length<=30;
      const fragment=document.createDocumentFragment();batch.reverse().forEach(row=>appendTurn(row,fragment));
      if(older)messages.prepend(fragment);else messages.replaceChildren(fragment);
      chatStatus.textContent=uiText('Historial privado de tu perfil. Los recuerdos se guardan solo al aprobarlos.','Private history for your profile. Memories are saved only when you approve them.');
    }catch{if(request===historyRequest)chatStatus.textContent=uiText('No se pudo cargar el historial. Cierra y vuelve a abrir para reintentar.','Could not load history. Close and reopen to retry.');}
  }
  olderChat.onclick=()=>loadHistory(true);
  chatForm.onsubmit=async event=>{
    event.preventDefault();if(sending)return;
    const text=messageField.value.trim();if(!text)return;
    sending=true;chatForm.querySelector('button').disabled=true;
    const requestId=crypto.randomUUID(), session=chatSession;
    chatStatus.textContent=uiText('Yuki está pensando…','Yuki is thinking…');
    try{
      const {data,error}=await db.functions.invoke('yuki-chat',{body:{message:text,language:UniverseI18n.language,requestId}});
      if(error || !data?.reply){
        let code;try{code=(await error.context.clone().json()).code}catch{}
        throw Error(code==='provider_quota'||code==='daily_limit'?'quota':'send');
      }
      if(host.isConnected && session===chatSession){messageField.value='';await loadHistory();}
    }catch(error){if(host.isConnected && session===chatSession)chatStatus.textContent=error.message==='quota'?uiText('Se alcanzó el cupo disponible. Tu mensaje sigue aquí para reintentarlo más tarde.','The available allowance was reached. Your message is still here to try later.'):uiText('No se confirmó la respuesta. Tu texto sigue aquí; el historial se conserva.','The reply could not be confirmed. Your text is still here; history is preserved.');}
    finally{sending=false;chatForm.querySelector('button').disabled=false;if(host.isConnected)refreshEnergy();}
  };
  const draft = root.querySelector('#draft');
  const field = draft.querySelector('textarea');
  const review = root.querySelector('#review');
  const proposal = review.querySelector('p');
  const status = root.querySelector('#memory-status');
  const approve = root.querySelector('#approve');
  const discard = root.querySelector('#discard');
  const retryMemories = root.querySelector('#retry-memories');
  const older = root.querySelector('#older');
  let cursor = null;
  older.onclick = () => loadMemories(cursor);
  retryMemories.onclick = () => loadMemories();
  let proposalId, proposalTurn=null, revision = 0;
  async function loadMemories(after = null) {
    older.hidden = true;
    const request = ++revision;
    retryMemories.hidden = true;
    status.textContent = uiText("Cargando recuerdos…", "Loading memories…");
    try {
      let query = db.from('yuki_memories').select('id,body,approved_at,visibility')
        .order('approved_at',{ascending:false}).order('id',{ascending:false}).limit(101);
      if (after) query = query.or('approved_at.lt.' + after.approved_at +
        ',and(approved_at.eq.' + after.approved_at + ',id.lt.' + after.id + ')');
      const {data,error} = await query;
      if (error) throw error;
      if (request !== revision || !host.isConnected) return;
      const list = root.querySelector('#approved');
      if (!after) list.replaceChildren();
      const batch = data.slice(0,100);
      cursor = batch.at(-1);
      older.hidden = data.length <= 100;
      list.append(...batch.map(row => {
        const item = document.createElement('li');
        const scope = document.createElement('small');
        scope.className = 'memory-scope';
        scope.textContent = row.visibility === 'shared' ? uiText('Compartido','Shared') : uiText('Solo tú','Only you');
        item.append(scope,row.body);
        return item;
      }));
      status.textContent = list.childElementCount ? uiText("Recuerdos aprobados.", "Approved memories.") : uiText("Todavía no hay recuerdos aprobados.", "No approved memories yet.");
    } catch {
      if (request === revision && host.isConnected) {
        status.textContent = uiText("No se pudieron cargar tus recuerdos.", "Your memories couldn’t be loaded.");
        if (after) older.hidden = false;
        else retryMemories.hidden = false;
      }
    }
  }
  draft.onsubmit = event => {
    event.preventDefault();
    if (!field.value.trim()) { field.focus(); return; }
    proposalTurn=null; root.querySelector('#share-memory').checked=false;
    proposalId = crypto.randomUUID();
    proposal.textContent = field.value.trim();
    draft.hidden = true;
    review.hidden = false;
    root.querySelector('#approve').focus();
  };
  function finishReview(message) {
    proposal.textContent = '';
    field.value = '';
    review.hidden = true;
    draft.hidden = false;
    status.textContent = message;
    field.focus();
  }
  approve.onclick = async () => {
    if (!proposal.textContent || approve.disabled) return;
    const id = proposalId;
    approve.disabled = discard.disabled = true;
    try {
      const {error} = await db.rpc('yuki_approve_memory',{p_body:proposal.textContent,p_shared:root.querySelector('#share-memory').checked,p_turn:proposalTurn});
      if (error && error.code !== '23505') throw error;
      if (room.open && host.isConnected) {
        if (id === proposalId) finishReview(uiText("Recuerdo guardado.", "Memory saved."));
        await loadMemories(); await loadHistory();
      }
    } catch {
      if (id === proposalId) status.textContent = uiText("No se confirmó el guardado. Puedes reintentar.", "Saving couldn’t be confirmed. You can try again.");
    } finally { approve.disabled = discard.disabled = false; }
  };
  discard.onclick = () => finishReview(uiText("Propuesta descartada.", "Suggestion discarded."));
  const activities = root.querySelector('#activity-list');
  let activityMenu = document.getElementById('primary-nav');
  function refreshActivities() {
    if (!room.open) return;
    activityMenu=document.getElementById('primary-nav');
    if(!activityMenu)return;
    const items = [];
    const seen = new Set(['home', 'profile']);
    for (const button of activityMenu.querySelectorAll('[data-nav]')) {
      const page = button.dataset.nav;
      if (seen.has(page) || button.hidden || !sectionAllowed(page)) continue;
      const item = document.createElement('li');
      const link = document.createElement('button');
      link.type = 'button';
      link.dataset.destination = page;
      const title = document.createElement('span');
      title.textContent = button.textContent.trim();
      const arrow = document.createElement('span');
      arrow.textContent = '→';
      arrow.setAttribute('aria-hidden','true');
      link.append(title,arrow);
      link.onclick = async () => {
        if (button.hidden || !button.isConnected || !sectionAllowed(page)) { refreshActivities(); return; }
        link.disabled = true;
        try {
          await navigate(page);
          if (room.open) room.close();
        } catch {
          root.querySelector('#activity-note').textContent = uiText('No se pudo abrir. Vuelve a intentarlo.','Could not open. Please try again.');
        } finally { link.disabled = false; }
      };
      item.append(link);
      items.push(item);
      seen.add(page);
    }
    activities.replaceChildren(...items);
    root.querySelector('#activity-note').textContent = items.length
      ? uiText("Apartados disponibles para tu perfil.", "Sections available to your profile.") : uiText("No hay actividades visibles.", "No visible activities.");
  }
  const menuObserver = new MutationObserver(refreshActivities);
  menuObserver.observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['hidden','data-nav']});
  root.querySelector('#open-room').onclick = () => { stopTravel(); clearTimeout(idleTimer); room.showModal(); refreshActivities(); loadMemories(); loadHistory(); refreshEnergy(); };
  room.addEventListener('close', () => {
    chatSession++;
    revision++;
    proposalId = null;
    historyRequest++;
    finishReview(uiText("Todavía no hay recuerdos aprobados.", "No approved memories yet."));
    root.querySelector('#approved').replaceChildren();
    panel.hidden = true;
    avatar.setAttribute('aria-expanded', 'false');
    refreshMood();
    avatar.focus();
    scheduleRest();
  });
  function updateLanguage() {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement.closest('style, textarea, #chat-log, #approved, #review p, #activity-list')) continue;
      const key = node.data.trim();
      const pair = labels.get(key);
      if (pair) node.data = node.data.replace(key, say(...pair));
    }
    for (const el of root.querySelectorAll('[aria-label]')) {
      const pair = labels.get(el.getAttribute('aria-label'));
      if (pair) el.setAttribute('aria-label', say(...pair));
    }
    
    refreshActivities();
    paintEnergy();
    messages.dataset.empty = uiText('Tu espacio para hablar, recordar y descubrir juntos.','Your space to talk, remember and explore together.');
    messageField.placeholder = uiText('¿Qué tienes en mente?','What’s on your mind?');
  }
  window.addEventListener('universe-language', updateLanguage);
  restoreLayout();
  if(avatar.classList.contains('mini'))scheduleWander();
  const observer = new ResizeObserver(fit);
  observer.observe(document.documentElement);
  const pose=document.createElement('span');pose.className='yuki-pose';pose.setAttribute('aria-hidden','true');avatar.append(pose);
  let outfitRequest=0;
  async function dress(outfit){const request=++outfitRequest;try{const url=await skin(outfit);const preload=new Image();preload.src=url;await preload.decode();if(destroyed||!host.isConnected||request!==outfitRequest)return;pose.style.backgroundImage='url("'+url+'")';box.classList.add('sprite-ready');fit();}catch{/* Keep the currently loaded transparent avatar. */}}
  home().then(data=>{if(!destroyed)dress(data.outfit)}).catch(()=>dress('uniform'));
  const customized=e=>{if(e.detail?.owner===viewer.id)dress(e.detail.data.outfit)};
  window.addEventListener('yuki-customized',customized);
  host.openYuki=()=>root.querySelector('#open-room').click();
  return () => { destroyed=true;window.removeEventListener('yuki-customized',customized); historyRequest++; clearTimeout(idleTimer); stopTravel(); reducedMotion.removeEventListener('change',motionChanged); document.removeEventListener('visibilitychange',visibilityChanged); host.removeEventListener('pointerdown',wake,true); energyRequest++; clearInterval(energyTimer); document.removeEventListener('visibilitychange',checkEnergy); window.removeEventListener('universe-language', updateLanguage); observer.disconnect(); menuObserver.disconnect(); };
}
