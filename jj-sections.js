'use strict';
const JJSections={user:null,values:null,request:0,loading:null};
function sectionAllowed(page){return state.profile?.handle==='jesus'||['home','profile'].includes(page)||(page!=='novios'&&JJSections.user===state.profile?.id&&JJSections.values?.[page]===true);}
async function loadSections(){const id=state.profile?.id;if(!id)return;if(JJSections.loading?.id===id)return JJSections.loading.promise;const request=++JJSections.request;const promise=(async()=>{const values=state.demo?Object.fromEntries(menus.map(([key])=>[key,!['gifts','novios'].includes(key)])):await rpc('jj_sections');if(state.profile?.id===id&&request===JJSections.request){JJSections.user=id;JJSections.values=values;}})();JJSections.loading={id,promise};try{await promise;}finally{if(JJSections.loading?.promise===promise)JJSections.loading=null;}}
let yukiHost = null;
let disconnectYuki;
let yukiHiddenFor = null;
function syncMenuYuki() {
  const profile = state.profile;
  const menu = document.getElementById('primary-nav');
  const owner = !!profile?.id && profile.handle === 'jesus' && !state.demo;
  if (!owner) yukiHiddenFor = null;
  if (yukiHost && (!owner || yukiHiddenFor === profile.id || !menu || !yukiHost.isConnected)) {
    disconnectYuki?.();
    disconnectYuki = null;
    yukiHost.remove();
    yukiHost = null;
  }
  if (!owner || !menu || yukiHiddenFor === profile.id || yukiHost) return;
  const host = document.createElement('div');
  yukiHost = host;
  document.getElementById('main').closest('.layout').after(host);
  import('./dev/yuki-avatar.js').then(({mountYuki}) => {
    if (host === yukiHost && host.isConnected && state.profile?.id === profile.id &&
        state.profile.handle === 'jesus' && !state.demo) disconnectYuki = mountYuki(host);
  }).catch(() => { /* The rest of the menu remains usable if loading fails. */ });
}
function paintSectionVisibility(){syncMenuYuki();if(!state.profile)return;document.querySelectorAll('[data-nav],[data-go]').forEach(el=>{const page=el.dataset.nav||el.dataset.go;el.hidden=!sectionAllowed(page);});for(const [id,page] of [['our-memories','memories'],['haunted-play','games']]){const el=document.getElementById(id);if(el)el.hidden=!sectionAllowed(page);}}
const sectionsShell=shell;shell=function(){sectionsShell();paintSectionVisibility();};
const sectionsProfile=profilePage;profilePage=async function(v){await sectionsProfile(v);if(v!==state.version||state.profile?.handle!=='jesus')return;
  if (!state.demo) {
    const preview = document.createElement('a');
    preview.href = 'dev/yuki-preview.html';
    preview.textContent = say('Probar el avatar de Yuki', 'Try the Yuki avatar');
    const toggle = document.createElement('button');
    const label = () => yukiHiddenFor === state.profile.id ? 'Mostrar a Yuki en el menú' : 'Ocultar a Yuki del menú';
    toggle.textContent = label();
    toggle.onclick = () => {
      yukiHiddenFor = yukiHiddenFor === state.profile.id ? null : state.profile.id;
      toggle.textContent = label();
      syncMenuYuki();
    };
    $('#main').append(toggle, preview);
  }
  const box=document.createElement('section');box.className='game-panel section-controls';box.id='section-controls';$('#main').append(box);try{await loadSections();if(v!==state.version)return;box.innerHTML=`<h2>${bi('Apartados que puede ver Julissa','Sections Julissa can see')}</h2><p>${bi('Activa un apartado cuando esté listo. Tú siempre puedes abrirlo para prepararlo. Ocultarlo no borra su contenido.','Enable a section when it is ready. You can always open it to prepare it. Hiding it does not delete its contents.')}</p><p class="hint">${bi('Inicio y Perfiles siempre están disponibles. Novios ahora es un título en los perfiles. Los apartados nuevos comienzan ocultos.','Home and Profiles are always available. Sweethearts is now a profile title. New sections start hidden.')}</p><div class="section-switches">${menus.filter(([id])=>!['home','profile','novios'].includes(id)).map(([id,icon,label])=>`<label class="row"><input type="checkbox" data-section-toggle="${id}" ${JJSections.values?.[id]?'checked':''}><span aria-hidden="true">${icon}</span><span>${esc(label)}</span></label>`).join('')}</div><p id="section-save-status" role="status"></p>`;box.querySelectorAll('[data-section-toggle]').forEach(input=>input.onchange=async()=>{const visible=input.checked;input.disabled=true;const user=state.profile.id;try{if(!ensureLive())throw Error('DEMO');const values=await rpc('jj_sections',{p_section:input.dataset.sectionToggle,p_visible:visible});if(user!==state.profile?.id)return;JJSections.values=values;$('#section-save-status').textContent=say('Guardado. El cambio llegará a Julissa en unos segundos.','Saved. Julissa will receive the change in a few seconds.');}catch{input.checked=!visible;if(input.isConnected)$('#section-save-status').textContent=say('No se guardó. Reintenta y comprueba el SQL 18.','Not saved. Retry and check SQL 18.');}finally{input.disabled=false;}});}catch{box.innerHTML=`<p>${bi('No se pudo cargar la visibilidad. Ejecuta SQL 18 y vuelve a abrir Perfiles.','Could not load section visibility. Apply SQL 18 and reopen Profiles.')}</p>`;}};
const sectionsNavigate=navigate;let sectionNavigation=0;
navigate=async function(page){if(!state.profile)return;const request=++sectionNavigation,user=state.profile.id;try{await loadSections();}catch{if(state.profile?.handle!=='jesus'&&!['home','profile'].includes(page)){toast(say('No se pudo abrir. Comprueba la conexión.','Could not open. Check your connection.'));page='home';}}if(request!==sectionNavigation||state.profile?.id!==user)return;if(!sectionAllowed(page))page='home';await sectionsNavigate(page);if(request===sectionNavigation)paintSectionVisibility();};
// New controls inserted by the existing page modules also inherit the visibility rule.
new MutationObserver(()=>paintSectionVisibility()).observe(document.body,{childList:true,subtree:true});
setInterval(async()=>{if(!state.profile||state.demo||document.hidden||state.profile.handle==='jesus')return;const user=state.profile.id;try{await loadSections();if(state.profile?.id!==user)return;paintSectionVisibility();if(!sectionAllowed(state.page)){if($('#modal').open&&!modalBusy)$('#modal').close();if(typeof stopJJPlayer==='function')stopJJPlayer();await navigate('home');}}catch{/* Keep the last confirmed menu during brief disconnections. */}},4000);
const sectionsLogout=logout;logout=async function(){JJSections.request++;JJSections.user=null;JJSections.values=null;return sectionsLogout();};

