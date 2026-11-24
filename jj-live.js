'use strict';
menus.push(['live','◉','En vivo contigo']);
const JJLive={user:null,data:null,busy:false,seen:null,error:null};
function liveUrls(d){if(d?.guest_url){try{const u=new URL(d.guest_url);if(u.origin==='https://vdo.ninja'&&u.pathname==='/'&&!u.username&&!u.password&&!u.searchParams.has('push')&&!u.searchParams.has('director'))return {view:u.href};}catch{}}if(!d?.stream_id)return {};const base='https://vdo.ninja/?',secret='#p='+encodeURIComponent(d.password);return {view:base+'view='+encodeURIComponent(d.stream_id)+secret,push:base+'push='+encodeURIComponent(d.stream_id)+secret,room:d.room_id?base+'room='+encodeURIComponent(d.room_id)+secret:''};}
function parseLiveLink(value){const u=new URL(value);if(u.origin!=='https://vdo.ninja'||u.pathname!=='/'||u.username||u.password)throw Error('BAD_LINK');const p=u.searchParams,fragment=new URLSearchParams(u.hash.slice(1));if(p.has('push')||p.has('director')||p.has('room'))throw Error('VIEW_ONLY');const id=p.get('view'),password=fragment.get('p')||fragment.get('password')||p.get('password')||p.get('p')||p.get('pw')||p.get('pass');if(!/^[A-Za-z0-9_-]{1,64}$/.test(id||'')||!/^[A-Za-z0-9]{8,49}$/.test(password||''))throw Error('BAD_LINK');return {stream_id:id,password};}
function liveError(e){const code=e?.message||'';if(code.includes('LIVE_TIMEOUT'))return say('La conexión tardó demasiado. Actualiza el estado antes de reintentar: el aviso podría haberse guardado.','Connection timed out. Refresh before retrying: the announcement may have been saved.');if(code.includes('SECTION_HIDDEN'))return say('Activa En vivo contigo en Perfiles antes de anunciarlo.','Enable Live with you in Profiles before announcing it.');if(code.includes('STOP_FIRST'))return say('Pulsa Terminé antes de cambiar el enlace.','Press I am done before changing the link.');if(code.includes('BAD_LINK')||code.includes('VIEW_ONLY'))return say('Usa un enlace https://vdo.ninja/?view=… con contraseña de 8 a 49 letras o números, o genera tus enlaces.','Use an https://vdo.ninja/?view=… link with an 8–49 letter/number password, or generate your links.');if(code.includes('NEED_LINK'))return say('Guarda primero tus enlaces.','Save your links first.');return say('No se pudo confirmar. Comprueba tu conexión y pulsa Actualizar estado.','Could not confirm. Check your connection and press Refresh status.');}
async function liveRequest(args={}){let timer;try{return await Promise.race([rpc('jj_live',args),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('LIVE_TIMEOUT')),12000);})]);}finally{clearTimeout(timer);}}
async function readLive(){if(!state.profile||state.demo||JJLive.busy)return;const user=state.profile.id;JJLive.busy=true;try{const d=await liveRequest();JJLive.error=null;if(state.profile?.id!==user)return;if(JJLive.user!==user){JJLive.user=user;JJLive.data=null;JJLive.seen=null;}if(!JJLive.data||d.revision>=JJLive.data.revision)JJLive.data=d;paintLiveBanner();if(state.profile.handle==='julisa'&&d.live&&JJLive.seen!==d.session){JJLive.seen=d.session;toast(say('Jesús te invita a ver su transmisión ♡','Jesús invites you to watch his stream ♡'));}window.dispatchEvent(new Event('jj-live-state'));}catch(e){if(state.profile?.id===user){JJLive.user=user;JJLive.error=e;window.dispatchEvent(new Event('jj-live-state'));}}finally{JJLive.busy=false;}}
function paintLiveBanner(){const old=$('#jj-live-banner');if(!state.profile||state.page!=='home'||!JJLive.data?.live||JJLive.user!==state.profile.id){old?.remove();return;}if(old)return;const b=document.createElement('button');b.id='jj-live-banner';b.className='live-banner';b.innerHTML=bi('◉ Jesús anunció una transmisión · Ver juntos','◉ Jesús announced a stream · Watch together');b.onclick=()=>navigate('live');$('#main')?.prepend(b);}
async function livePageRoute(){if(!state.profile)return;if(typeof sectionAllowed==='function'&&!sectionAllowed('live'))return navigate('home');jjCleanup();clearTimers();state.page='live';const version=++state.version;shell();window.scrollTo(0,0);await livePage(version);}
function liveStudioMarkup() {
  return `<section class="stream-card stream-studio">
    <h2>${bi('Panel de transmisión','Broadcast controls')}</h2>
    <p id="live-setup-status" role="status"></p>
    <div class="stream-tools">${jjButton('live-prepare','Preparar directo','Prepare stream','stream-button')}</div>
    <div class="stream-tools" id="live-owner-links"></div>
    <div class="stream-tools">
      ${jjButton('live-start','Anunciar directo','Announce stream','stream-button stream-primary')}
      ${jjButton('live-stop','Terminé','I am done','stream-button')}
    </div>
    <details><summary>${bi('Configurar enlaces','Set up links')}</summary>
      <p>${bi('Genera enlaces o pega el enlace de espectador de VDO.Ninja. Termina el aviso actual antes de cambiarlos.','Generate links or paste the VDO.Ninja viewer link. End the current announcement before changing them.')}</p>
      ${jjButton('live-generate','Generar enlaces nuevos','Generate new links','stream-button')}
      <form id="live-form" class="stack">
        <label>${bi('Enlace para ver · ?view=','Viewer link · ?view=')}<input name="view" type="url" required autocomplete="off" spellcheck="false"></label>
        <label>${bi('Sala de voz opcional · letras y números','Optional voice room · letters and numbers')}<input name="room" maxlength="49" pattern="[A-Za-z0-9]*" autocomplete="off"></label>
        <button class="stream-button stream-primary">${bi('Guardar enlaces','Save links')}</button>
      </form>
    </details></section>`;
}

async function livePage(v) {
  const user = state.profile.id;
  const owner = state.profile.handle === 'jesus';
  const julie = state.profile.handle === 'julisa' && !state.demo;
  const valid = () => state.version === v && state.profile?.id === user;
  let frameKey, publisherLinks, acting = false, endRecording, fillInitialLinks;
  $('#main').innerHTML = `<div class="stream-room">
    <header class="stream-mast">
      <div><p class="stream-channel">J & J <span aria-hidden="true">✦</span> ${bi('Para Julie','For Julie')}</p>
      <h1>${bi('En vivo contigo','Live with you')}</h1></div>
      <div class="stream-tools">
        ${typeof sectionAllowed !== 'function' || sectionAllowed('streamclips') ? jjButton('live-go-clips','Streamclips','Streamclips','stream-button') : ''}
        ${jjButton('live-refresh','Actualizar estado','Refresh status','stream-button')}
      </div>
    </header>
    <div class="stream-stage">
      <section class="stream-card stream-player">
        <div id="live-view"></div>
        <div class="stream-program"><div class="stream-host" aria-hidden="true">J</div><div id="live-state" role="status"></div></div>
        <p id="live-error" role="status"></p>
      </section>
      ${liveChatMarkup()}
    </div>
    ${owner ? liveStudioMarkup() : ''}
  </div>`;
  const chat = mountLiveChat($('#stream-chat'), user, valid);
  const clips = $('#live-go-clips');
  if (clips) clips.onclick = () => navigate('streamclips');

  function paint() {
    if (!valid()) return;
    const d = JJLive.user === user ? JJLive.data : null;
    const urls = liveUrls(d);
    const session = d?.live ? d.session : null;
    chat.update(session || null);
    const status = $('#live-state');
    const statusKey = String(d?.live);
    if (status.dataset?.state !== statusKey) {
      status.innerHTML = `<span class="stream-badge ${d?.live?'is-live':''}">${d?.live
        ? bi('Directo anunciado','Stream announced') : d ? bi('Fuera de línea','Offline') : bi('Consultando estado…','Checking status…')}</span>
        <h2>${bi('El directo de Jesús','Jesús’s stream')}</h2>`;
      if (status.dataset) status.dataset.state = statusKey;
    }
    const key = JSON.stringify([d?.live, session, urls.view, urls.room]);
    if (key !== frameKey) {
      frameKey = key;
      endRecording?.();
      endRecording = null;
      paintViewer(d?.live ? urls : {}, key);
    }
    $('#live-error').textContent = JJLive.error ? liveError(JJLive.error) : '';
    if (!owner) return;
    const publisher = urls.push ? `<a class="stream-button" href="${esc(urls.push)}" target="_blank" rel="noopener noreferrer">${bi('Abrir cámara / OBS','Open camera / OBS')}</a>
      <a class="stream-button" href="${esc(urls.push.replace('#','&screenshare#'))}" target="_blank" rel="noopener noreferrer">${bi('Compartir pantalla','Share screen')}</a>` : '';
    const links = publisher + (urls.room ? `<a class="stream-button" href="${esc(urls.room)}" target="_blank" rel="noopener noreferrer">${bi('Sala de voz','Voice room')}</a>` : '');
    if (links !== publisherLinks) {
      $('#live-owner-links').innerHTML = links;
      publisherLinks = links;
    }
    $('#live-start').innerHTML = d?.live ? bi('Renovar aviso','Renew announcement') : bi('Anunciar directo','Announce stream');
    $('#live-start').disabled = acting || !urls.view || !d?.enabled || !!JJLive.error;
    $('#live-prepare').disabled = acting || !d || !!urls.view || !!d.live || !!JJLive.error;
    $('#live-stop').disabled = acting;
    $('#live-generate').disabled = acting || !!d?.live;
    $('#live-form').querySelector('button').disabled = acting || !!d?.live;
    $('#live-setup-status').textContent = acting ? say('Guardando…','Saving…') : urls.view
      ? say('Abre el emisor y anuncia el directo cuando tu señal esté lista.','Open the publisher and announce the stream when your feed is ready.')
      : say('Prepara tus enlaces para poder emitir.','Prepare your links to start streaming.');
    if (d && !d.enabled) $('#live-error').textContent = liveError({message:'SECTION_HIDDEN'});
  }

  function paintViewer(urls, key) {
    $('#live-view').innerHTML = `<div id="live-screen" class="stream-screen">
      <div class="stream-placeholder"><span aria-hidden="true">${urls.view?'▶':'✦'}</span>
        <p>${urls.view ? bi('El directo está listo para abrir','The stream is ready to open') : bi('Te esperamos en el próximo directo','See you at the next stream')}</p>
      </div></div>
      ${urls.view ? `<div class="stream-view-controls">
        <div class="stream-tools">
          ${jjButton('live-watch','Ver aquí','Watch here','stream-button stream-primary')}
          <a class="stream-button" href="${esc(urls.view)}" target="_blank" rel="noopener noreferrer">${bi('Abrir VDO.Ninja','Open VDO.Ninja')}</a>
          ${urls.room ? `<a class="stream-button" href="${esc(urls.room)}" target="_blank" rel="noopener noreferrer">${bi('Sala de voz','Voice room')}</a>` : ''}
        </div>
        ${julie ? `<div class="stream-tools">
          ${jjButton('live-record','Grabar clip','Record clip','stream-button stream-clip-action')}
          ${jjButton('live-upload-clip','Subir clip','Upload clip','stream-button')}
        </div><p id="live-clip-status" role="status"></p>` : ''}
        <details><summary>${bi('Ayuda de reproducción','Playback help')}</summary>
          <p>${bi('Si falta el sonido, toca el video. Si el directo sigue cargando, comprueba que el emisor esté abierto y prueba Volver a cargar video.','If there is no sound, tap the video. If the stream keeps loading, check that the publisher is open and try Reload video.')}</p>
          ${jjButton('live-reload-page','Recargar Nuestro Universo','Reload Our Universe','stream-button')}
        </details>
      </div>` : ''}`;
    if (!urls.view) return;
    const screen = $('#live-screen');
    const watch = $('#live-watch');
    const record = julie ? $('#live-record') : null;
    let frame;
    function play() {
      endRecording?.();
      stopJJPlayer();
      frame = document.createElement('iframe');
      frame.title = say('Transmisión de Jesús en VDO.Ninja','Jesús’s stream on VDO.Ninja');
      frame.src = urls.view;
      frame.allow = 'autoplay; fullscreen; picture-in-picture; camera; microphone; display-capture';
      frame.referrerPolicy = 'no-referrer';
      frame.className = 'live-screen';
      screen.replaceChildren(frame);
      watch.textContent = say('Volver a cargar video','Reload video');
      watch.classList?.remove('stream-primary');
      if (!record) return;
      record.disabled = false;
      record.textContent = say('Grabar clip','Record clip');
      const hint = $('#live-clip-status');
      hint.textContent = say('Graba hasta 30 s desde ahora. Elige esta pestaña y activa Compartir audio. Si el navegador no puede recortar el video, se grabará la pestaña completa.','Record up to 30 s from now. Choose this tab and enable Share audio. If your browser cannot crop the video, the whole tab will be recorded.');
      endRecording = streamclipControls(screen, record, hint, () => valid() && frameKey === key && !$('#modal').open);
    }
    watch.onclick = play;
    $('#live-reload-page').onclick = () => window.location.reload();
    if (record) {
      record.disabled = true;
      $('#live-upload-clip').onclick = () => streamclipForm();
    }
  }

  async function send(action, payload = {}) {
    if (acting || !ensureLive()) return;
    acting = true;
    paint();
    try {
      const d = await liveRequest({p_action:action,p_data:payload});
      if (!valid()) return;
      JJLive.user = user;
      if (!JJLive.data || d.revision >= JJLive.data.revision) JJLive.data = d;
      JJLive.error = null;
      paintLiveBanner();
    } catch (e) {
      if (valid()) JJLive.error = e;
    } finally {
      acting = false;
      if (valid()) paint();
    }
  }

  $('#live-refresh').onclick = () => readLive();
  if (owner) {
    const generate = () => {
      const random = () => crypto.randomUUID().replaceAll('-', '');
      return {stream_id:'JJ'+random(),password:random(),room_id:'JJVoice'+random()};
    };
    const form = $('#live-form');
    const showLinks = d => {
      form.elements.view.value = liveUrls(d).view || '';
      form.elements.room.value = d?.room_id || '';
    };
    $('#live-prepare').onclick = () => send('save', generate());
    $('#live-start').onclick = () => send('start');
    $('#live-stop').onclick = () => send('stop');
    $('#live-generate').onclick = () => showLinks(generate());
    form.onsubmit = e => {
      e.preventDefault();
      try {
        const d = parseLiveLink(form.elements.view.value);
        d.room_id = form.elements.room.value.trim();
        send('save', d);
      } catch (error) {
        $('#live-error').textContent = liveError(error);
      }
    };
    fillInitialLinks = () => {
      if (JJLive.user === user && !form.elements.view.value && !form.elements.room.value) showLinks(JJLive.data);
    };
    fillInitialLinks();
  }
  window.addEventListener('jj-live-state', paint);
  JJ.cleanups.push(() => {
    window.removeEventListener('jj-live-state', paint);
    endRecording?.();
    chat.close();
  });
  paint();
  await readLive();
  if (valid()) {
    paint();
    fillInitialLinks?.();
  }
}
const liveNavigate=navigate;navigate=async function(page){if(page==='live')return livePageRoute();await liveNavigate(page);if(state.profile){paintLiveBanner();readLive();}};
setInterval(()=>{if(!document.hidden)readLive();},8000);
const liveLogout = logout;
logout = async function() {
  const onLivePage = state.page === 'live';
  await liveLogout();
  if (!state.profile) {
    if (onLivePage) jjCleanup();
    JJLive.user = null;
    JJLive.data = null;
    JJLive.seen = null;
  }
};
