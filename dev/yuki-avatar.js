export function mountYuki(host) {
  const labels = new Map();
  function uiText(es, en) {
    labels.set(es.trim(), [es.trim(), en.trim()]);
    labels.set(en.trim(), [es.trim(), en.trim()]);
    return say(es, en);
  }
  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `<style>:host{color:white;font:1rem system-ui}aside{z-index:40;position:fixed;bottom:12px;right:12px;max-width:90vw}button{cursor:pointer;padding:.5rem;border-radius:1rem}#avatar{touch-action:none;background:#352e49}img{display:block;width:96px;pointer-events:none}.mini img{width:36px}section{background:#403651;padding:1rem;border-radius:1rem}button{min-height:44px;min-width:44px}img{pointer-events:none;user-select:none}#avatar{position:relative}#avatar::after{position:absolute;right:2px;top:2px;color:white;background:#503665;border-radius:1em;padding:0 .3em}#avatar[data-mood="happy"]::after{content:"♥"}#avatar[data-mood="curious"]::after{content:"?"}#avatar[data-mood="sleepy"]::after{content:"zZ"}dialog{box-sizing:border-box;width:min(32rem,92vw);max-height:85dvh;overflow:auto;border:1px solid #80688e;border-radius:1.25rem;background:#292135;color:#fff;padding:1.5rem}dialog::backdrop{background:#171020c9}dialog h2{margin-top:0}dialog details{margin:1rem 0}dialog summary{cursor:pointer;padding:.6rem 0}</style><aside id="yuki-widget"><section hidden><strong>Yuki</strong><p>${uiText("¡Aquí estoy, Yisus!", "Here I am, Yisus!")}</p><button id="open-room" type="button">${uiText("Abrir el rincón de Yuki", "Open Yuki’s corner")}</button></section><button id="avatar" aria-label="${uiText("Abrir o cerrar panel", "Open or close panel")}" aria-expanded="false"><img alt="" src="data:image/webp;base64,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"></button><button id="size">${uiText("Minimizar", "Minimize")}</button></aside><dialog aria-labelledby="yuki-room-title"><h2 id="yuki-room-title">${uiText("El rincón de Yuki", "Yuki’s corner")}</h2><p>${uiText("Bienvenido, Yisus. ¿Qué quieres explorar hoy?", "Welcome, Yisus. What would you like to explore today?")}</p><details><summary>${uiText("Conversación", "Conversation")}</summary><p>${uiText("Escribe /recuerdos o /actividades para consultar tu perfil. Los demás mensajes van a Yuki. Al cerrar se borra el chat.", "Type /memories or /activities to check your profile. Other messages go to Yuki. Closing the corner clears the chat.")}</p><ol id="chat-log" role="log" aria-label="${uiText("Mensajes", "Messages")}" style="overflow-wrap:anywhere;white-space:pre-wrap"></ol><form id="chat-form"><label>${uiText("Tu mensaje", "Your message")} <textarea required maxlength="2000" rows="3"></textarea></label><button>${uiText("Enviar", "Send")}</button></form></details><details><summary>${uiText("Recuerdos aprobados", "Approved memories")}</summary><p>${uiText("Solo se guardan los recuerdos que apruebes.", "Only memories you approve are saved.")}</p><form id="draft"><label>${uiText("Proponer un recuerdo", "Suggest a memory")} <textarea required maxlength="500"></textarea></label><button>${uiText("Revisar", "Review")}</button></form><div id="review" hidden><strong>${uiText("Revisa tu propuesta", "Review your suggestion")}</strong><p></p><button id="approve">${uiText("Aprobar", "Approve")}</button> <button id="discard">${uiText("Descartar", "Discard")}</button></div><p role="status" id="memory-status">${uiText("Todavía no hay recuerdos aprobados.", "No approved memories yet.")}</p><button id="retry-memories" type="button" hidden>${uiText("Volver a cargar recuerdos", "Reload memories")}</button><ul id="approved"></ul><button id="older" type="button" hidden>${uiText("Ver recuerdos anteriores", "See older memories")}</button></details><details><summary>${uiText("Actividades visibles", "Visible activities")}</summary><p id="activity-note"></p><ul id="activity-list"></ul></details><form method="dialog"><button autofocus>${uiText("Volver al menú", "Back to the menu")}</button></form></dialog>`;

const box=root.querySelector('aside'),panel=root.querySelector('section'),avatar=root.querySelector('#avatar'),size=root.querySelector('#size');
const layoutKey = 'nuestro-universo.yuki.preview.layout.v1';
function saveLayout() {
  const {left, top} = box.getBoundingClientRect();
  try {
    localStorage.setItem(layoutKey, JSON.stringify({left, top, mini: avatar.classList.contains('mini')}));
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
    place(saved.left, saved.top);
  } catch { /* Keep the default layout when storage is unavailable. */ }
}
function place(left, top) {
  box.style.right = box.style.bottom = 'auto';
  box.style.left = Math.max(0, Math.min(innerWidth - box.offsetWidth, left)) + 'px';
  box.style.top = Math.max(0, Math.min(innerHeight - box.offsetHeight, top)) + 'px';
}
let start,drag=false;
avatar.onpointerdown=e=>{if(!e.isPrimary || e.button!==0)return;const b=box.getBoundingClientRect();start={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top};drag=false;avatar.setPointerCapture(e.pointerId)};
avatar.onpointermove=e=>{if(start?.id!==e.pointerId)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.hypot(dx,dy)>5)drag=true;if(drag){avatar.dataset.mood="curious";place(start.left+dx,start.top+dy)}};
avatar.onpointerup=avatar.onpointercancel=e=>{if(start?.id===e.pointerId){start=null;refreshMood();if(drag)saveLayout()}};
function refreshMood(){
  if (!panel.hidden) avatar.dataset.mood = 'happy';
  else if (avatar.classList.contains('mini')) avatar.dataset.mood = 'sleepy';
  else delete avatar.dataset.mood;
}
function fit(){const b=box.getBoundingClientRect();if(b.bottom>innerHeight){box.style.top='auto';box.style.bottom='0'}if(b.right>innerWidth){box.style.left='auto';box.style.right='0'}}
avatar.onclick=e=>{if(!drag||!e.detail){panel.hidden=!panel.hidden;avatar.setAttribute('aria-expanded',String(!panel.hidden));refreshMood();fit()}drag=false};
size.onclick=()=>{panel.hidden=true;avatar.setAttribute('aria-expanded','false');size.textContent=avatar.classList.toggle('mini')?uiText("Restaurar", "Restore"):uiText("Minimizar", "Minimize");refreshMood();fit();saveLayout()};

  const room = root.querySelector('dialog');
  const chatForm = root.querySelector('#chat-form');
  const messageField = chatForm.querySelector('textarea');
  const messages = root.querySelector('#chat-log');
  let chatSession = 0;
  chatForm.onsubmit = async event => {
    event.preventDefault();
    const text = messageField.value.trim();
    if (!text) { messageField.focus(); return; }
    const message = document.createElement('li');
    const prefix = document.createElement('span');
    prefix.textContent = uiText('Tú · ', 'You · ');
    message.append(prefix, text);
    messages.append(message);
    chatForm.reset();
    messageField.focus();
    const command = text.toLowerCase();
    const memories = ['/recuerdos', '/memories'].includes(command);
    const generalChat = !memories && !['/actividades', '/activities'].includes(command);
    const session = chatSession;
    const reply = document.createElement('li');
    reply.textContent = uiText('Consultando tu perfil…', 'Checking your profile…');
    messages.append(reply);
    try {
      if (generalChat) {
        const {data,error} = await db.functions.invoke('yuki-chat',{body:{message:text,language:UniverseI18n.language}});
        if (session !== chatSession || !host.isConnected || !room.open) return;
        let errorCode;
        if (error?.context?.json) {
          try { errorCode = (await error.context.clone().json()).code; } catch {}
          if (session !== chatSession || !host.isConnected || !room.open) return;
        }
        if (errorCode === 'provider_quota') {
          reply.textContent = uiText('Gemini alcanzó su cuota disponible. Inténtalo más tarde.', 'Gemini has reached its available quota. Try again later.');
          return;
        }
        if (errorCode === 'missing_gemini_key' || errorCode === 'provider_configuration' || errorCode === 'invalid_model') {
          reply.textContent = uiText('Falta completar la configuración de Gemini.', 'Gemini setup needs to be completed.');
          return;
        }
        if (error?.context?.status === 429) {
          reply.textContent = uiText('Has llegado al límite diario de Yuki.', 'You’ve reached Yuki’s daily limit.');
          return;
        }
        if (error || !data?.reply) throw new Error('Chat unavailable');
        reply.textContent = data.reply;
        return;
      }
      const {data, error} = await db.rpc(memories ? 'yuki_chat_memories' : 'yuki_chat_activities');
      if (error) throw error;
      if (session !== chatSession || !host.isConnected || !room.open) return;
      const visible = new Map(Array.from(activityMenu.querySelectorAll('[data-nav]'))
        .filter(button => !button.hidden && sectionAllowed(button.dataset.nav))
        .map(button => [button.dataset.nav, button.textContent.trim()]));
      const values = memories ? data.map(row => row.body) : data.map(row => visible.get(row.section_id)).filter(Boolean);
      const list = document.createElement('ul');
      for (const value of values) {
        const item = document.createElement('li');
        item.textContent = value;
        list.append(item);
      }
      reply.textContent = memories ? uiText('Tus recuerdos aprobados', 'Your approved memories') : uiText('Tus actividades visibles', 'Your visible activities');
      if (values.length) reply.append(list);
      else reply.append(' · ', uiText('Sin resultados', 'No results'));
    } catch {
      if (session === chatSession && room.open) reply.textContent = uiText('No se pudo consultar tu perfil. Vuelve a enviar el comando.', 'Your profile could not be loaded. Send the command again.');
    }
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
  let proposalId, revision = 0;
  async function loadMemories(after = null) {
    older.hidden = true;
    const request = ++revision;
    retryMemories.hidden = true;
    status.textContent = uiText("Cargando recuerdos…", "Loading memories…");
    try {
      let query = db.from('yuki_memories').select('id,body,approved_at')
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
        item.textContent = row.body;
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
      const {error} = await db.from('yuki_memories').insert({id, body:proposal.textContent});
      if (error && error.code !== '23505') throw error;
      if (room.open && host.isConnected) {
        if (id === proposalId) finishReview(uiText("Recuerdo guardado.", "Memory saved."));
        await loadMemories();
      }
    } catch {
      if (id === proposalId) status.textContent = uiText("No se confirmó el guardado. Puedes reintentar.", "Saving couldn’t be confirmed. You can try again.");
    } finally { approve.disabled = discard.disabled = false; }
  };
  discard.onclick = () => finishReview(uiText("Propuesta descartada.", "Suggestion discarded."));
  const activities = root.querySelector('#activity-list');
  const activityMenu = document.getElementById('primary-nav');
  function refreshActivities() {
    if (!room.open) return;
    const items = [];
    const seen = new Set(['home', 'profile']);
    for (const button of activityMenu.querySelectorAll('[data-nav]')) {
      const page = button.dataset.nav;
      if (seen.has(page) || button.hidden || !sectionAllowed(page)) continue;
      const item = document.createElement('li');
      item.textContent = button.textContent.trim();
      items.push(item);
      seen.add(page);
    }
    activities.replaceChildren(...items);
    root.querySelector('#activity-note').textContent = items.length
      ? uiText("Apartados disponibles para tu perfil.", "Sections available to your profile.") : uiText("No hay actividades visibles.", "No visible activities.");
  }
  const menuObserver = new MutationObserver(refreshActivities);
  menuObserver.observe(activityMenu, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['hidden','data-nav']});
  root.querySelector('#open-room').onclick = () => { room.showModal(); refreshActivities(); loadMemories(); };
  room.addEventListener('close', () => {
    chatSession++;
    revision++;
    proposalId = null;
    messages.replaceChildren();
    chatForm.reset();
    finishReview(uiText("Todavía no hay recuerdos aprobados.", "No approved memories yet."));
    root.querySelector('#approved').replaceChildren();
    panel.hidden = true;
    avatar.setAttribute('aria-expanded', 'false');
    refreshMood();
    avatar.focus();
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
    for (const prefix of messages.querySelectorAll('span')) prefix.textContent = uiText('Tú · ', 'You · ');
    refreshActivities();
  }
  window.addEventListener('universe-language', updateLanguage);
  restoreLayout();
  const observer = new ResizeObserver(fit);
  observer.observe(document.documentElement);
  return () => { window.removeEventListener('universe-language', updateLanguage); observer.disconnect(); menuObserver.disconnect(); };
}
