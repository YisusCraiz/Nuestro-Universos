'use strict';

const streamclipBucket = 'jj-streamclips';
const streamclipLimit = 50 * 1024 * 1024;

function streamclipControls(frame, button, status, valid) {
  let capture = null, recorder = null, timeout, clock, requesting = false, discard = false;
  const label = () => {
    const active = recorder?.state === 'recording';
    button.textContent = active ? say('Terminar clip', 'Finish clip') : say('Grabar clip', 'Record clip');
    const upload = $('#live-upload-clip');
    if (upload) upload.disabled = active;
  };
  const stopCapture = () => {
    clearTimeout(timeout);
    clearInterval(clock);
    if (recorder?.state === 'recording') recorder.stop();
    capture?.getTracks().forEach(track => track.stop());
    capture = null;
  };
  const setStatus = (es, en) => status.textContent = say(es, en);

  button.onclick = async () => {
    if (recorder?.state === 'recording') return stopCapture();
    if (requesting || recorder || !valid()) return;
    if (!navigator.mediaDevices?.getDisplayMedia || !window.MediaRecorder) {
      setStatus('La grabación desde la sala está disponible en navegadores de escritorio compatibles. Puedes subir un archivo.', 'Recording from the room is available in supported desktop browsers. You can upload a file.');
      return;
    }
    requesting = true;
    button.disabled = true;
    let received;
    try {
      received = await navigator.mediaDevices.getDisplayMedia({
        video: {displaySurface: 'browser'}, audio: true, preferCurrentTab: true,
        monitorTypeSurfaces: 'exclude', systemAudio: 'exclude'
      });
      if (!valid() || discard) return;
      const track = received.getVideoTracks()[0];
      if (!track || (track.getSettings().displaySurface && track.getSettings().displaySurface !== 'browser')) {
        throw Error('TAB_REQUIRED');
      }
      if (window.CropTarget && track.cropTo) {
        try {
          await track.cropTo(await window.CropTarget.fromElement(frame));
        } catch {
          throw Error('TAB_REQUIRED');
        }
      }
      if (!valid() || discard || track.readyState === 'ended') return;

      const formats = ['video/mp4','video/webm;codecs=vp8,opus','video/webm'];
      const mimeType = formats.find(type => MediaRecorder.isTypeSupported(type));
      const current = new MediaRecorder(received, {mimeType, videoBitsPerSecond: 4_000_000});
      const chunks = [];
      let bytes = 0;
      current.ondataavailable = ({data}) => {
        if (!data.size) return;
        bytes += data.size;
        if (bytes <= streamclipLimit) chunks.push(data);
        else stopCapture();
      };
      current.onstop = () => {
        recorder = null;
        stopCapture();
        if (discard || !valid()) return;
        button.disabled = false;
        label();
        const mime = current.mimeType.split(';')[0];
        setStatus('', '');
        if (bytes > streamclipLimit || !chunks.length || !['video/mp4','video/webm'].includes(mime)) {
          setStatus('No se pudo crear el clip. Intenta con una grabación más corta o sube un archivo.', 'Could not create the clip. Try a shorter recording or upload a file.');
          return;
        }
        streamclipForm(new Blob(chunks, {type: mime}));
      };
      current.onerror = () => {
        chunks.length = 0;
        stopCapture();
      };
      track.addEventListener('ended', stopCapture, {once:true});
      current.start(500);
      recorder = current;
      capture = received;
      label();
      const start = Date.now();
      const audio = capture.getAudioTracks().length > 0;
      function tick() {
        const seconds = Math.min(30, Math.floor((Date.now() - start) / 1000));
        setStatus(`Grabando · ${seconds}/30 s${audio?'':' · Sin audio compartido'}`, `Recording · ${seconds}/30 s${audio?'':' · No shared audio'}`);
      }
      tick();
      clock = setInterval(tick, 250);
      timeout = setTimeout(stopCapture, 30000);
    } catch (error) {
      if (valid() && !discard) {
        if (error.message === 'TAB_REQUIRED') setStatus('Elige esta pestaña de Nuestro Universo para grabar el directo.', 'Choose this Our Universe tab to record the stream.');
        else setStatus('No se inició la grabación. Vuelve a intentarlo o sube un archivo.', 'Recording did not start. Try again or upload a file.');
      }
    } finally {
      if (received !== capture) received?.getTracks().forEach(track => track.stop());
      requesting = false;
      button.disabled = false;
    }
  };

  return () => {
    discard = true;
    stopCapture();
  };
}

function streamclipForm(recording = null, onSaved) {
  if (state.profile?.handle !== 'julisa' || !ensureLive() || $('#modal').open) return;
  const user = state.profile.id;
  const id = crypto.randomUUID();
  let staged = null;
  const preview = recording ? URL.createObjectURL(recording) : '';
  modal(`<h2>${bi('Guardar en Streamclips','Save to Streamclips')}</h2>
    <form id="streamclip-form" class="stack">
      ${recording ? '<video class="video-screen" controls playsinline preload="metadata"></video>'
        : `<label>${bi('Video MP4 o WebM · hasta 50 MB','MP4 or WebM video · up to 50 MB')}<input name="file" type="file" accept="video/mp4,video/webm,.mp4,.webm" required></label>`}
      <label>${bi('Título del clip','Clip title')}<input name="title" maxlength="100" required></label>
      <p id="streamclip-save-status" role="status"></p>
      <button type="submit" class="btn">${bi('Guardar clip','Save clip')}</button>
    </form>`);
  const form = $('#streamclip-form');
  if (preview) {
    const video = $('video', form);
    video.src = preview;
    $('#modal').addEventListener('close', () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(preview);
    }, {once:true});
  }

  form.onsubmit = async event => {
    event.preventDefault();
    const button = $('button[type=submit]', form);
    if (button.disabled || state.profile?.id !== user) return;
    const status = $('#streamclip-save-status', form);
    const title = form.elements.title.value.trim();
    if (!title) {
      status.textContent = say('Ponle un título al clip.', 'Give the clip a title.');
      return;
    }
    button.disabled = true;
    busyModal(true);
    const input = form.elements.file;
    status.textContent = say('Guardando clip…', 'Saving clip…');
    try {
      if (!staged) {
        const file = recording || input.files[0];
        const type = file?.type || ({mp4:'video/mp4',webm:'video/webm'})[file?.name?.split('.').pop().toLowerCase()];
        if (!file?.size || file.size > streamclipLimit || !['video/mp4','video/webm'].includes(type)) {
          status.textContent = say('Elige un MP4 o WebM de hasta 50 MB.', 'Choose an MP4 or WebM up to 50 MB.');
          return;
        }
        const extension = type === 'video/mp4' ? 'mp4' : 'webm';
        const path = `${user}/${id}.${extension}`;
        const bucket = db.storage.from(streamclipBucket);
        const {error} = await bucket.upload(path, file, {upsert:false, contentType:type});
        if (error && (await bucket.createSignedUrl(path, 30)).error) throw error;
        staged = extension;
        if (input) input.disabled = true;
      }
      if (state.profile?.id !== user) return;
      await rpc('jj_streamclip_save', {p_id:id, p_title:title, p_extension:staged});
      if (state.profile?.id !== user) return;
      $('#modal').close();
      toast(say('Guardado en Música → Streamclips ♡','Saved in Music → Streamclips ♡'));
      onSaved?.();
    } catch {
      status.textContent = say('No se confirmó el guardado. Reintenta aquí para conservar el clip.', 'Saving could not be confirmed. Retry here to keep the clip.');
    } finally {
      busyModal(false);
      button.disabled = false;
    }
  };
}

async function streamclipsPage(version) {
  const user = state.profile.id;
  const valid = () => version === state.version && user === state.profile?.id;
  const canUpload = state.profile.handle === 'julisa' && !state.demo;
  $('#main').innerHTML = `<div class="stream-room stream-archive">
    <header class="stream-mast"><div><button id="streamclips-music" type="button" class="stream-button">${bi('Música','Music')}</button>
    <h1>Streamclips</h1><p>${bi('Los momentos del directo que Julie quiso guardar.','The moments from the stream that Julie wanted to keep.')}</p></div>
    ${canUpload ? jjButton('streamclips-upload','Subir clip','Upload clip','stream-button stream-primary') : ''}</header>
    <div id="streamclips-list" class="stream-clip-grid"><p role="status">${bi('Cargando clips…','Loading clips…')}</p></div></div>`;
  $('#streamclips-music').onclick = () => navigate('musicas');
  if (canUpload) $('#streamclips-upload').onclick = () => streamclipForm(null, () => {
    if (valid()) streamclipsPage(version);
  });
  try {
    const result = state.demo ? {data:[]} : await db.from('jj_streamclips').select('id,title,path,created_at').order('created_at', {ascending:false});
    if (result.error) throw result.error;
    if (!valid()) return;
    const list = $('#streamclips-list');
    list.innerHTML = result.data.map((clip, index) => `<article class="stream-card stream-clip-card">
      <button type="button" class="stream-clip-cover" data-stream-clip="${index}" aria-label="${esc(say('Reproducir ', 'Play ') + clip.title)}">▶</button>
      <div><h2 translate="no">${esc(clip.title)}</h2><time datetime="${esc(clip.created_at)}">${new Date(clip.created_at).toLocaleDateString(UniverseI18n.locale(), {dateStyle:'medium'})}</time></div>
    </article>`).join('') || `<p class="stream-card stream-archive-empty">${bi('Todavía no hay clips guardados.','No clips have been saved yet.')}</p>`;
    list.querySelectorAll('[data-stream-clip]').forEach(button => {
      button.onclick = () => openStreamclip(result.data[Number(button.dataset.streamClip)]);
    });
  } catch {
    if (!valid()) return;
    $('#streamclips-list').innerHTML = `<p role="status">${bi('No se pudieron cargar los clips.','Could not load the clips.')}</p>${jjButton('streamclips-retry','Reintentar','Retry','stream-button')}`;
    $('#streamclips-retry').onclick = () => streamclipsPage(version);
  }
}

async function openStreamclip(clip) {
  modal(`<h2 translate="no">${esc(clip.title)}</h2><video class="video-screen" controls playsinline preload="metadata"></video><p id="streamclip-play-status" role="status"></p>`);
  const video = $('video', $('#modal-body'));
  const status = $('#streamclip-play-status');
  const current = modalVersion;
  const failure = () => {
    status.textContent = say('No se pudo reproducir el clip. Vuelve a abrirlo para reintentar.', 'Could not play this clip. Reopen it to try again.');
  };
  video.onplay = () => {
    JJPlayer.audio?.pause();
    if ($('#jj-player-media iframe')) stopJJPlayer();
  };
  video.onerror = failure;
  $('#modal').addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  }, {once:true});
  try {
    const {data,error} = await db.storage.from(streamclipBucket).createSignedUrl(clip.path, 600);
    if (error) throw error;
    if (current === modalVersion && $('#modal').open) video.src = data.signedUrl;
  } catch {
    if (current === modalVersion && $('#modal').open) failure();
  }
}
