'use strict';

const albumFields = 'id,author_id,title,description,cover_path,tracks,revision,profiles(display_name,avatar_path)';
let albumShelf = null;

function albumArt(path, artwork) {
  const url = /^https:\/\/i\.scdn\.co\/image\/[a-z0-9]+$/i.test(artwork || '') ? artwork : '';
  return `<span class="album-artwork" aria-hidden="true"><span>♫</span>${path
    ? `<img data-album-image="${esc(path)}" alt="" loading="lazy">`
    : url ? `<img src="${esc(url)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}</span>`;
}

function albumCover(album, tracks = []) {
  if (album.cover_path) return `<div class="album-cover">${albumArt(album.cover_path)}</div>`;
  const art = tracks.filter(track => track.image_path || track.artwork).slice(0, 4);
  const tiles = art.length === 4 ? art : art.slice(0, 1);
  return `<div class="album-cover ${tiles.length === 4 ? 'album-collage' : ''}">${tiles.length
    ? tiles.map(track => albumArt(track.image_path, track.artwork)).join('')
    : albumArt()}</div>`;
}

function loadAlbumImages(root) {
  root.querySelectorAll('.album-artwork img').forEach(img => {
    img.onerror = () => img.remove();
    if (img.complete && !img.naturalWidth && img.getAttribute('src')) img.remove();
    if (img.dataset.albumImage) {
      mediaUrl(img.dataset.albumImage).then(url => {
        if (img.isConnected) img.src = url;
      }).catch(() => img.remove());
    }
  });
}

function albumTracks(album, songs) {
  return album.tracks.map(track => {
    if (track.source === 'spotify') return track;
    const song = songs.get(track.id);
    return {...track, title: song?.title || track.title, audio_path: song?.audio_path, image_path: song?.image_path, unavailable: !song?.audio_path};
  });
}

function albumTrackCount(count) {
  return count === 1 ? bi('1 canción', '1 song') : bi(`${count} canciones`, `${count} songs`);
}

function albumTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '';
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

async function musicAlbumsPage(version) {
  const main = $('#main');
  const shelf = {version, albums: [], songs: new Map()};
  albumShelf = shelf;
  main.innerHTML = `<p class="loading">${bi('Cargando álbumes…', 'Loading albums…')}</p>`;
  try {
    const [result, songs] = await Promise.all([
      state.demo ? {data: []} : db.from('jj_music_albums').select(albumFields)
        .order('created_at', {ascending: false}).order('id', {ascending: false}),
      allSongs()
    ]);
    if (result.error) throw result.error;
    if (version !== state.version) return;
    shelf.albums = result.data;
    shelf.songs = new Map(songs.map(song => [song.id, song]));
    paintAlbumShelf(shelf);
  } catch (error) {
    if (version !== state.version) return;
    console.error(error);
    main.innerHTML = `<section class="page-heading"><h1>${bi('Álbumes', 'Albums')}</h1>
      <p role="status">${bi('No se pudieron cargar los álbumes. Revisa tu conexión e inténtalo de nuevo.', 'Could not load the albums. Check your connection and try again.')}</p>
      ${jjButton('album-retry', 'Reintentar', 'Retry')}</section>`;
    $('#album-retry').onclick = () => navigate('musicalbums');
  }
}

function paintAlbumShelf(shelf) {
  const main = $('#main');
  main.innerHTML = `
    <section class="page-heading music-hero album-heading">
      <button class="text-button" id="album-music-back">${bi('‹ Música', '‹ Music')}</button>
      <div class="row spaced"><h1>${bi('Álbumes', 'Albums')}</h1>${jjButton('album-create', '+ Crear álbum', '+ Create album')}</div>
      <p>${bi('Reúne tus canciones en un álbum con su propia portada y orden.', 'Collect songs in an album with its own cover and track order.')}</p>
    </section>
    <div class="album-shelf">${shelf.albums.map((album, index) => `
      <button class="album-card" data-album-index="${index}">
        ${albumCover(album, albumTracks(album, shelf.songs))}
        <strong translate="no">${esc(album.title)}</strong>
        <small><span translate="no">${esc(album.profiles?.display_name || '')}</span> · ${albumTrackCount(album.tracks.length)}</small>
      </button>`).join('') || `<p class="empty">${bi('Todavía no hay álbumes. Crea uno para escucharlo juntos.', 'There are no albums yet. Create one to listen together.')}</p>`}</div>`;
  $('#album-music-back').onclick = () => navigate('musicas');
  $('#album-create').onclick = () => musicAlbumEditor(shelf);
  main.querySelectorAll('[data-album-index]').forEach(button => {
    button.onclick = () => openMusicAlbum(shelf.albums[Number(button.dataset.albumIndex)].id);
  });
  loadAlbumImages(main);
}

function openMusicAlbum(id) {
  const shelf = albumShelf;
  if (shelf?.version !== state.version || state.page !== 'musicalbums') return;
  const album = shelf.albums.find(item => item.id === id);
  if (!album) return;
  rememberRoute(historyRoute('musicalbums', 'album:' + id));
  const main = $('#main');
  const tracks = albumTracks(album, shelf.songs);
  const queue = tracks.filter(track => !track.unavailable);
  const total = tracks.every(track => Number.isFinite(track.duration)) ? albumTime(tracks.reduce((sum, track) => sum + track.duration, 0)) : '';
  main.innerHTML = `
    <article class="album-detail">
      <header class="album-detail-head">
        <div class="album-toolbar">
          <button class="text-button" id="album-shelf-back">${bi('‹ Álbumes', '‹ Albums')}</button>
          ${album.author_id === state.profile.id ? jjButton('album-edit', 'Editar álbum', 'Edit album', 'btn secondary') : ''}
        </div>
        <div class="album-hero-body">
          ${albumCover(album, tracks)}
          <div class="album-details">
            <h1 translate="no">${esc(album.title)}</h1>
            ${album.description ? `<p class="album-description" translate="no">${esc(album.description)}</p>` : ''}
            <div class="album-byline">${albumArt(album.profiles?.avatar_path)}
              <strong translate="no">${esc(album.profiles?.display_name || '')}</strong>
              <span>${albumTrackCount(tracks.length)}${total ? ' · ' + total : ''}</span>
            </div>
            <div class="album-actions">
              <button class="btn album-play" id="album-play" ${queue.length ? '' : 'disabled'}>▶ ${bi('Reproducir', 'Play')}</button>
              <button class="btn secondary" id="album-shuffle" ${queue.length > 1 ? '' : 'disabled'}>${bi('Aleatorio', 'Shuffle')}</button>
            </div>
          </div>
        </div>
      </header>
      <ol class="album-tracklist" aria-label="${say('Canciones del álbum', 'Album tracks')}">
        ${tracks.map((track, index) => `
          <li><button class="album-track" data-album-track="${index}" ${track.unavailable ? 'disabled' : ''}>
            <span class="album-track-number">${index + 1}</span>
            ${albumArt(track.image_path, track.artwork)}
            <span class="album-track-info"><strong translate="no">${esc(track.title)}</strong>
              <small>${track.unavailable ? bi('Canción no disponible', 'Song unavailable')
                : track.artist ? `<span translate="no">${esc(track.artist)}</span>`
                : track.source === 'spotify' ? 'Spotify' : bi('Nuestra música', 'Our music')}</small>
            </span>
            <span class="album-track-length">${track.unavailable ? '' : albumTime(track.duration) || '▶'}</span>
          </button></li>`).join('')}
      </ol>
    </article>`;
  $('#album-shelf-back').onclick = () => goJJBack();
  if ($('#album-edit')) $('#album-edit').onclick = () => musicAlbumEditor(shelf, album);
  $('#album-play').onclick = () => startJJQueue(queue);
  $('#album-shuffle').onclick = () => {
    const shuffled = [...queue];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    startJJQueue(shuffled);
  };
  main.querySelectorAll('[data-album-track]:enabled').forEach(button => {
    button.onclick = () => startJJQueue(queue, queue.indexOf(tracks[Number(button.dataset.albumTrack)]));
  });
  loadAlbumImages(main);
  updateBackButton();
  window.scrollTo(0, 0);
}

function albumTrackData(track) {
  return {
    source: track.source,
    id: track.id,
    title: (track.trackTitle || track.title).slice(0, 300),
    artist: (track.artist || '').slice(0, 300),
    artwork: /^https:\/\/i\.scdn\.co\/image\/[a-z0-9]+$/i.test(track.artwork || '') ? track.artwork : null,
    duration: Number.isFinite(track.duration) && track.duration > 0 ? track.duration : null
  };
}

function musicAlbumEditor(shelf, album) {
  if (!ensureLive()) return;
  const id = album?.id || crypto.randomUUID();
  const selected = (album?.tracks || []).map(albumTrackData);
  const uploaded = new Map();
  modal(`
    <h2>${album ? bi('Editar álbum', 'Edit album') : bi('Crear álbum', 'Create album')}</h2>
    <form class="stack album-editor" id="album-editor">
      <label>${bi('Nombre del álbum', 'Album name')}<input name="title" required maxlength="100" value="${esc(album?.title || '')}"></label>
      <label>${bi('Descripción (opcional)', 'Description (optional)')}<textarea name="description" rows="2" maxlength="1000">${esc(album?.description || '')}</textarea></label>
      <label>${bi('Elegir portada (opcional)', 'Choose artwork (optional)')}<input name="cover" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label>
      ${album?.cover_path ? `<label class="album-remove-cover"><input name="removeCover" type="checkbox"> ${bi('Quitar la portada actual', 'Remove the current artwork')}</label>` : ''}
      <p class="hint">${bi('Si dejas la portada en blanco, se genera con las imágenes de las canciones disponibles.', 'Leave the artwork blank to use the available song covers.')}</p>
      <div class="album-editor-preview" aria-hidden="true"></div>
      <section><h3>${bi('Añadir canciones', 'Add songs')}</h3><div class="album-picker"></div></section>
      <section><h3>${bi('Orden del álbum', 'Album order')} <span class="album-selected-count"></span></h3>
        <div class="album-selection"></div><p class="hint album-selection-status" role="status"></p></section>
      <p class="error album-editor-error" role="status"></p>
      <button class="btn" type="submit">${bi('Guardar álbum', 'Save album')}</button>
    </form>`);
  const form = $('#album-editor');
  const coverInput = form.elements.cover;
  const preview = $('.album-editor-preview', form);
  const status = $('.album-selection-status', form);
  const selection = $('.album-selection', form);
  let previewUrl;
  function previewCover() {
    preview.innerHTML = albumCover({cover_path: form.elements.removeCover?.checked ? null : album?.cover_path},
      albumTracks({tracks: selected}, shelf.songs));
    if (previewUrl) {
      preview.innerHTML = `<div class="album-cover"><span class="album-artwork"><img alt=""></span></div>`;
      $('img', preview).src = previewUrl;
    }
    loadAlbumImages(preview);
  }
  coverInput.onchange = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = coverInput.files[0] ? URL.createObjectURL(coverInput.files[0]) : null;
    previewCover();
  };
  if (form.elements.removeCover) form.elements.removeCover.onchange = previewCover;
  $('#modal').addEventListener('close', () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, {once: true});
  function paintSelection() {
    $('.album-selected-count', form).textContent = selected.length + ' / 100';
    selection.innerHTML = selected.map((track, index) => `
      <div class="album-selected-track">
        <strong translate="no">${index + 1}. ${esc(track.title)}</strong>
        <div class="album-order-actions">
          <button type="button" class="text-button" data-album-order="-1" data-index="${index}" ${index === 0 ? 'disabled' : ''}
            aria-label="${say('Subir canción', 'Move track up')}">↑</button>
          <button type="button" class="text-button" data-album-order="1" data-index="${index}" ${index + 1 === selected.length ? 'disabled' : ''}
            aria-label="${say('Bajar canción', 'Move track down')}">↓</button>
          <button type="button" class="text-button" data-album-remove="${index}">${bi('Quitar', 'Remove')}</button>
        </div>
      </div>`).join('') || `<p class="hint">${bi('Añade al menos una canción.', 'Add at least one song.')}</p>`;
    previewCover();
  }
  selection.onclick = event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.dataset.albumRemove !== undefined) {
      selected.splice(Number(button.dataset.albumRemove), 1);
      paintSelection();
      const remaining = [...selection.querySelectorAll('[data-album-remove]')];
      (remaining[Number(button.dataset.albumRemove)] || remaining.at(-1) || $('.local-search', form))?.focus();
      return;
    }
    const index = Number(button.dataset.index);
    const next = index + Number(button.dataset.albumOrder);
    [selected[index], selected[next]] = [selected[next], selected[index]];
    paintSelection();
    const moved = selection.querySelectorAll(`[data-index="${next}"]:enabled`);
    ([...moved].find(control => control.dataset.albumOrder === button.dataset.albumOrder) || moved[0])?.focus();
  };
  paintSelection();
  mountMusicPicker($('.album-picker', form), track => {
    if (selected.some(item => item.source === track.source && item.id === track.id)) {
      status.textContent = say('Esa canción ya está en el álbum.', 'That song is already in the album.');
    } else if (selected.length >= 100) {
      status.textContent = say('El máximo es de 100 canciones.', 'The limit is 100 songs.');
    } else {
      selected.push(albumTrackData(track));
      paintSelection();
      status.textContent = say('Canción añadida. ', 'Song added. ') + track.title;
      toast(say('Canción añadida al álbum', 'Song added to the album'));
    }
  }, {songs: [...shelf.songs.values()].filter(song => song.audio_path)});
  form.onsubmit = async event => {
    event.preventDefault();
    const errorLabel = $('.album-editor-error', form);
    const values = new FormData(form);
    const title = values.get('title').trim();
    if (!title || !selected.length) {
      errorLabel.textContent = !title ? say('Escribe un nombre.', 'Enter a name.') : say('Añade al menos una canción.', 'Add at least one song.');
      return;
    }
    const file = coverInput.files[0];
    if (file && (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 10 * 1024 * 1024)) {
      errorLabel.textContent = say('Elige una imagen JPG, PNG, WebP o GIF de hasta 10 MB.', 'Choose a JPG, PNG, WebP or GIF image up to 10 MB.');
      return;
    }
    const owner = state.profile.id;
    const fields = [...form.querySelectorAll('button, input, textarea')].filter(field => !field.disabled);
    fields.forEach(field => { field.disabled = true; });
    busyModal(true);
    errorLabel.textContent = say('Guardando álbum…', 'Saving album…');
    try {
      let path = values.has('removeCover') ? null : album?.cover_path || null;
      if (file) {
        if (!uploaded.has(file)) uploaded.set(file, await upload(file, 'image', []));
        path = uploaded.get(file);
      }
      if (owner !== state.profile?.id || shelf.version !== state.version) return;
      const payload = {title, description: values.get('description').trim(), cover_path: path, tracks: selected};
      const request = album
        ? db.from('jj_music_albums').update({...payload, revision: album.revision + 1}).eq('id', id).eq('revision', album.revision)
        : db.from('jj_music_albums').insert({id, ...payload});
      let {data, error} = await request.select(albumFields).maybeSingle();
      if (error || !data) {
        const check = await db.from('jj_music_albums').select(albumFields).eq('id', id).maybeSingle();
        const saved = check.data;
        const same = saved && saved.author_id === owner && saved.title === title
          && saved.description === payload.description && saved.cover_path === path
          && JSON.stringify(saved.tracks.map(albumTrackData)) === JSON.stringify(selected);
        if (!same) {
          errorLabel.textContent = saved && album && saved.revision !== album.revision
            ? say('Este álbum cambió en otra pestaña. Vuelve a abrirlo para editar la versión más reciente.', 'This album changed in another tab. Reopen it to edit the latest version.')
            : say('No se pudo guardar. Tu selección sigue aquí. Inténtalo de nuevo.', 'Could not save. Your selection is still here. Try again.');
          return;
        }
        data = saved;
      }
      if (album) shelf.albums[shelf.albums.findIndex(item => item.id === id)] = data;
      else shelf.albums.unshift(data);
      if (form.isConnected) {
        $('#modal').close();
        openMusicAlbum(id);
        toast(say('Álbum guardado', 'Album saved'));
      }
    } catch (error) {
      console.error(error);
      errorLabel.textContent = say('No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.', 'Could not save. Check your connection and try again.');
    } finally {
      busyModal(false);
      fields.forEach(field => { field.disabled = false; });
    }
  };
}
