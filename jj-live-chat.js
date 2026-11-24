'use strict';

function streamSticker(index) {
  if (index >= 0 && index < 12) {
    return {label:say(...stickerNames[index % 6]), markup:chibi(index)};
  }
  const pack = streamStickerPacks.find(p => index >= p.start && index < p.start + p.items.length);
  if (!pack) return null;
  const [es, en, box] = pack.items[index - pack.start];
  const [, , width, height] = box;
  const label = pack.name + ' · ' + say(es, en);
  return {
    label,
    markup:`<svg class="chibi-sticker stream-pack-sticker" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}"><svg width="${width}" height="${height}" viewBox="${box.join(' ')}" overflow="hidden"><image href="${pack.src}" width="${pack.width}" height="${pack.height}"/></svg></svg>`
  };
}

function liveChatMarkup() {
  return `<aside id="stream-chat" class="stream-card stream-chat" aria-labelledby="stream-chat-title" hidden>
    <header><span class="stream-chat-icon" aria-hidden="true">✦</span><h2 id="stream-chat-title">${bi('Chat del directo','Stream chat')}</h2>
      <label class="stream-chat-translate"><input type="checkbox" checked>${bi('Traducir con MyMemory','Translate with MyMemory')}</label>
    </header>
    <div class="stream-chat-log" role="log" aria-labelledby="stream-chat-title"></div>
    <div class="stream-composer">
      <div id="stream-stickers" class="stream-stickers" hidden></div>
      <div class="stream-chat-status" role="status"></div>
      <form>
        <input name="message" maxlength="500" aria-label="${say('Mensaje','Message')}" placeholder="${say('Escribe un mensaje…','Write a message…')}" autocomplete="off">
        <div class="stream-composer-actions">
          <button type="button" class="stream-button" data-stream-stickers aria-expanded="false" aria-controls="stream-stickers">${bi('Stickers','Stickers')}</button>
          <button type="submit" class="stream-button stream-primary">${bi('Enviar','Send')}</button>
        </div>
      </form>
    </div>
  </aside>`;
}

function mountLiveChat(root, user, valid) {
  const log = $('.stream-chat-log', root);
  const form = $('form', root);
  const status = $('.stream-chat-status', root);
  const stickers = $('#stream-stickers', root);
  const selector = $('[data-stream-stickers]', root);
  const translate = $('.stream-chat-translate input', root);
  translate.checked = liveTranslationPreference();
  const buttons = () => [...form.querySelectorAll('button'), ...stickers.querySelectorAll('button')];
  const notify = (es, en) => status.textContent = say(es, en);
  let session, reading, sending, signature, pending, updates = 0, pickerVersion = 0, lastRows = [], visible = true;
  const current = id => valid() && id && id === session;
  const translation = mountLiveTranslation(log, () => translate.checked, () => current(session));
  const closeStickers = () => {
    pickerVersion++;
    stickers.hidden = true;
    selector.setAttribute('aria-expanded', 'false');
  };

  async function render(rows, id) {
    if (!current(id)) return;
    const key = rows.map(m => [m.id,m.path]).join(',');
    if (key === signature) return;
    signature = key;
    lastRows = rows;
    translation.beforeRender();
    const fragment = document.createDocumentFragment();
    for (const message of rows) {
      const item = document.createElement('article');
      if (message.sender === user) item.classList.add('is-mine');
      const label = document.createElement('strong');
      label.textContent = message.handle === 'julisa' ? 'Julie' : 'Jesús';
      const time = document.createElement('time');
      time.dateTime = message.created_at;
      time.textContent = new Date(message.created_at).toLocaleTimeString(UniverseI18n.locale(), {hour:'2-digit', minute:'2-digit'});
      item.append(label, time);
      if (message.body) {
        translation.decorate(item, message);
      } else if (message.builtin != null) {
        const sticker = streamSticker(message.builtin);
        if (sticker) item.insertAdjacentHTML('beforeend', sticker.markup);
        else item.append(say('Sticker no disponible','Sticker unavailable'));
      } else if (message.path) {
        appendSticker(item, message);
      } else {
        item.append(say('Sticker no disponible','Sticker unavailable'));
      }
      fragment.append(item);
    }
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 60;
    if (rows.length) log.replaceChildren(fragment);
    else log.textContent = say('Aquí empieza el chat entre ustedes.','Your chat starts here.');
    if (atBottom) log.scrollTop = log.scrollHeight;
  }

  function appendSticker(item, sticker) {
    const image = document.createElement('img');
    image.alt = sticker.title || say('Sticker personalizado','Custom sticker');
    item.append(image);
    mediaUrl(sticker.path).then(url => image.src = url).catch(() => {
      image.replaceWith(document.createTextNode(say('Sticker no disponible','Sticker unavailable')));
    });
  }

  async function read() {
    const id = session;
    if (!visible || !current(id) || reading === id || sending === id || document.hidden || state.demo) return;
    reading = id;
    const update = updates;
    try {
      const rows = await rpc('jj_live_chat_feed', {p_session:id});
      if (updates === update && sending !== id) await render(rows, id);
      if (current(id) && sending !== id && !pending) notify('','');
    } catch {
      if (current(id) && !pending) notify('Reconectando el chat…','Reconnecting chat…');
    } finally {
      if (reading === id) reading = null;
    }
  }

  async function send(message) {
    const id = session;
    if (!current(id) || sending || !ensureLive()) return;
    pending ??= {p_session:id, p_id:crypto.randomUUID(), ...message};
    sending = id;
    updates++;
    buttons().forEach(button => button.disabled = true);
    form.elements.message.disabled = true;
    notify('Enviando…','Sending…');
    try {
      const rows = await rpc('jj_live_chat_feed', pending);
      if (!current(id)) return;
      if (pending.p_body) form.reset();
      pending = null;
      closeStickers();
      await render(rows, id);
      log.scrollTop = log.scrollHeight;
      notify('','');
    } catch (error) {
      if (!current(id)) return;
      if (error.message?.includes('STICKER_MISSING')) {
        pending = null;
        closeStickers();
        notify('Ese sticker ya no está disponible.','That sticker is no longer available.');
      } else notify('Pulsa Enviar para reintentar.','Press Send to try again.');
    } finally {
      if (current(id)) {
        sending = null;
        buttons().forEach(button => button.disabled = false);
        form.elements.message.disabled = !!pending;
      }
    }
  }

  form.onsubmit = event => {
    event.preventDefault();
    const text = form.elements.message.value.trim();
    if (text || pending) send({p_body:text});
  };
  selector.onclick = () => {
    if (!stickers.hidden) return closeStickers();
    if (!current(session) || pending) return;
    stickers.hidden = false;
    selector.setAttribute('aria-expanded', 'true');
    stickers.innerHTML = `<div class="stream-sticker-packs" role="group" aria-label="${say('Colecciones de stickers','Sticker collections')}">
      ${streamStickerPacks.map(pack => `<button type="button" data-pack="${pack.start}">${pack.name}</button>`).join('')}
      <button type="button" data-pack="0">${bi('Más stickers','More stickers')}</button>
    </div><div class="stream-sticker-grid"></div>`;
    showPack(state.profile.handle === 'julisa' ? 22 : 12);
  };

  stickers.onclick = event => {
    const button = event.target.closest('button');
    if (!button || pending || sending) return;
    if (button.dataset.pack != null) showPack(Number(button.dataset.pack));
    else if (button.dataset.builtin != null) send({p_builtin:Number(button.dataset.builtin)});
    else if (button.dataset.custom) send({p_sticker:button.dataset.custom});
  };

  async function showPack(start) {
    const id = session;
    const picker = ++pickerVersion;
    const grid = $('.stream-sticker-grid', stickers);
    stickers.querySelectorAll('[data-pack]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.pack) === start)));
    const pack = streamStickerPacks.find(p => p.start === start);
    const count = pack?.items.length ?? 12;
    grid.innerHTML = Array.from({length:count}, (_, offset) => {
      const index = start + offset;
      const {label, markup} = streamSticker(index);
      return `<button type="button" data-builtin="${index}" title="${esc(label)}" aria-label="${esc(label)}">${markup}</button>`;
    }).join('');
    grid.scrollTop = 0;
    if (pack) return;
    try {
      const data = await affectionCall();
      if (!current(id) || picker !== pickerVersion) return;
      for (const sticker of data.stickers) {
        const button = document.createElement('button');
        button.type = 'button';
        button.title = sticker.title;
        button.setAttribute('aria-label', sticker.title);
        button.dataset.custom = sticker.id;
        button.disabled = !!sending;
        appendSticker(button, sticker);
        grid.append(button);
      }
    } catch {
      if (current(id) && picker === pickerVersion && !sending) notify('No se pudieron cargar los stickers subidos.','Could not load uploaded stickers.');
    }
  }

  function refreshLanguage() {
    translation.reset();
    signature = undefined;
    form.elements.message.placeholder = say('Escribe un mensaje…','Write a message…');
    form.elements.message.setAttribute('aria-label', say('Mensaje','Message'));
    render(lastRows, session);
  }
  translate.onchange = () => {
    try { localStorage.setItem('jj-live-translate', translate.checked ? 'on' : 'off'); } catch {}
    refreshLanguage();
  };
  window.addEventListener('universe-language', refreshLanguage);

  const timer = setInterval(read, 2200);
  return {
    setVisible(next) {
      if (visible === next) return;
      visible = next;
      root.hidden = !visible || !session;
      if (visible) read();
    },
    update(id) {
      if (session === id) return;
      session = id;
      root.hidden = !id || !visible;
      signature = undefined;
      lastRows = [];
      translation.reset();
      pending = null;
      sending = null;
      stickers.replaceChildren();
      closeStickers();
      form.reset();
      form.elements.message.disabled = false;
      buttons().forEach(button => button.disabled = false);
      log.textContent = '';
      notify('','');
      if (id) read();
    },
    close() {
      session = null;
      translation.reset();
      window.removeEventListener('universe-language', refreshLanguage);
      clearInterval(timer);
    }
  };
}
