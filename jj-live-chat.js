'use strict';

function liveChatMarkup() {
  return `<aside id="stream-chat" class="stream-card stream-chat" aria-labelledby="stream-chat-title" hidden>
    <header><span class="stream-chat-icon" aria-hidden="true">✦</span><h2 id="stream-chat-title">${bi('Chat del directo','Stream chat')}</h2></header>
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
  const buttons = () => [...form.querySelectorAll('button'), ...stickers.querySelectorAll('button')];
  const notify = (es, en) => status.textContent = say(es, en);
  let session, reading, sending, signature, pending, updates = 0, pickerVersion = 0;
  const current = id => valid() && id && id === session;
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
        const text = document.createElement('p');
        text.textContent = message.body;
        item.append(text);
      } else if (message.builtin != null) {
        item.insertAdjacentHTML('beforeend', chibi(message.builtin));
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
    if (!current(id) || reading === id || sending === id || document.hidden || state.demo) return;
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
  selector.onclick = async () => {
    if (!stickers.hidden) return closeStickers();
    const id = session;
    if (!current(id) || pending) return;
    stickers.hidden = false;
    const picker = ++pickerVersion;
    selector.setAttribute('aria-expanded', 'true');
    stickers.innerHTML = Array.from({length:12}, (_, index) => `<button type="button" data-builtin="${index}" title="${esc(say(...stickerNames[index%6]))}">${chibi(index)}</button>`).join('');
    stickers.querySelectorAll('[data-builtin]').forEach(button => {
      button.onclick = () => send({p_builtin:Number(button.dataset.builtin)});
    });
    try {
      const data = await affectionCall();
      if (!current(id) || picker !== pickerVersion) return;
      for (const sticker of data.stickers) {
        const button = document.createElement('button');
        button.type = 'button';
        button.title = sticker.title;
        button.disabled = !!sending;
        appendSticker(button, sticker);
        button.onclick = () => send({p_sticker:sticker.id});
        stickers.append(button);
      }
    } catch {
      if (current(id) && picker === pickerVersion && !sending) notify('No se pudieron cargar los stickers subidos.','Could not load uploaded stickers.');
    }
  };

  const timer = setInterval(read, 2200);
  return {
    update(id) {
      if (session === id) return;
      session = id;
      root.hidden = !id;
      signature = undefined;
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
      clearInterval(timer);
    }
  };
}
