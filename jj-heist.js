'use strict';
(() => {
  const defaultPrize = 600;
  const rooms = {
    memory: ['Cámara de símbolos', 'Symbol Chamber',
      'Mira los seis símbolos que se iluminan. Cuando termine la secuencia, tócalos en el mismo orden.',
      'Watch six symbols light up. When the sequence ends, tap them in the same order.'],
    lasers: ['Pasillo de láseres', 'Laser Hallway',
      'Usa las flechas para llegar a la puerta superior. Cruza por los huecos de los láseres encendidos, o cuando la línea esté apagada.',
      'Use the arrows to reach the door at the top. Cross through a gap in a live laser, or move across when the beam is off.'],
    dial: ['Caja fuerte', 'The Safe',
      'Cuando la aguja entre en el arco verde, toca Fijar pulso. Acierta tres veces. La aguja acelera en cada ronda.',
      'Tap Lock pulse while the needle is inside the green arc. Land three pulses. The needle speeds up each round.']
  };
  const messages = {
    memory: ['Ese símbolo no iba ahí.', 'That symbol was out of order.'],
    lasers: ['Te cruzaste con un láser encendido.', 'You crossed a live laser.'],
    dial: ['La aguja estaba fuera del arco verde.', 'The needle was outside the green arc.'],
    timeout: ['Se agotaron los 60 segundos.', 'Your 60 seconds ran out.'],
    abandoned: ['Terminaste este intento.', 'You ended this attempt.']
  };
  const symbols = [
    ['☾','Luna','Moon'],['✦','Estrella','Star'],['♄','Saturno','Saturn'],
    ['☀','Sol','Sun'],['⌛','Reloj de arena','Hourglass'],['⚿','Llave','Key'],
    ['◇','Diamante','Diamond'],['⌘','Constelación','Constellation'],['♧','Trébol','Clover']
  ];
  const directions = [['↑','Arriba','Up'],['→','Derecha','Right'],['↓','Abajo','Down'],['←','Izquierda','Left']];
  const dialog = document.createElement('dialog');
  dialog.id = 'jj-heist';
  dialog.setAttribute('aria-labelledby','heist-heading');
  document.body.append(dialog);

  let data, user, origin, clockOffset = 0, pending = false, timer, screen, generation = 0;
  let feedback = null;
  const eligible = () => state.profile?.handle === 'julisa' && !state.demo;
  const active = () => data?.run && !data.run.result ? data.run : null;
  const heistTime = () => Math.round(performance.now() + clockOffset);
  const scoped = selector => dialog.querySelector(selector);
  const art = stage => `<div class="heist-room-art heist-art-${stage}" aria-hidden="true"></div>`;
  const button = (action,es,en,extra = '') => `<button type="button" class="heist-button ${extra}" data-heist-action="${action}">${bi(es,en)}</button>`;
  const attempts = count => bi(`${count} de 3 intentos`, `${count} of 3 attempts`);

  function updateCard(value) {
    const card = document.querySelector('#heist-home');
    if (!card || !eligible() || !value) return;
    card.querySelector('.heist-home-prize').textContent = (value.prize ?? defaultPrize) + ' JJ';
    card.querySelector('.heist-home-status').innerHTML = value.won ? bi('Premio de hoy conseguido','Today’s prize collected')
      : value.run && !value.run.result ? bi('Intento en curso','Attempt in progress') : attempts(value.remaining);
  }

  async function send(action, input) {
    if (pending || !dialog.open || !eligible() || state.profile.id !== user) return;
    const request = generation;
    const before = performance.now();
    const run = active();
    pending = true;
    feedback = null;
    tick();
    try {
      const res = await rpc('jj_heist_play',{
        p_action:action, p_run:run?.id ?? null, p_revision:run?.revision ?? null,
        p_input:input ?? null,p_at:run ? heistTime() : null
      });
      if (generation !== request || state.profile?.id !== user) return;
      clockOffset = res.server_ms - (before + performance.now()) / 2;
      const newWin = res.won && !data?.won && action==='pulse';
      data = res;
      if (res.issue === 'connection') feedback = ['La conexión tardó. Intenta el movimiento en el siguiente ciclo.', 'The connection lagged. Try the move again on the next cycle.'];
      if (res.issue === 'reset') feedback = ['La bóveda cambia de día en unos segundos. Vuelve a abrirla después de medianoche.', 'The vault resets in a few seconds. Open it again after midnight.'];
      updateCard(res);
      if (newWin) document.getElementById('wallet-chip-refresh')?.click();
      paint(action==='status' || action==='start');
    } catch {
      if (generation !== request || !dialog.open) return;
      feedback = ['Se perdió la conexión. Puedes recuperar el intento mientras quede tiempo.', 'Connection lost. You can recover the attempt while there is time left.'];
      paint(!data);
      if (active() && !scoped('[data-heist-action="status"]')) {
        scoped('[data-heist-feedback]').insertAdjacentHTML('afterend',
          `<div class="heist-retry">${button('status','Recuperar intento','Reconnect to attempt','heist-secondary')}</div>`);
      }
    } finally {
      if (generation === request) {
        pending = false;
        tick();
      }
    }
  }

  function overview() {
    const run = data.run;
    const prize = data.prize ?? defaultPrize;
    const lastResult = run?.result === 'funds'
      ? [`El saldo disponible de Yisus bajó de ${prize} JJ. Recuperaste tu intento.`,
         `Yisus’s available balance dropped below ${prize} JJ. Your attempt was restored.`]
      : messages[run?.result];
    const available = data.remaining > 0 && data.funded !== false && !data.won;
    const result = data.won ? `<div class="heist-result heist-win"><div class="heist-win-door" aria-hidden="true">
      <span>✦</span><span>◈</span><span>✧</span></div><strong>+${run?.paid ?? prize} JJ</strong><p>${bi('¡Golpe perfecto! Las monedas ya están en tu saldo.','Perfect heist! The coins are in your balance.')}</p></div>`
      : lastResult ? `<div class="heist-result"><strong>${bi('Último intento','Last attempt')}</strong><p>${bi(...lastResult)}</p></div>`
      : '';
    return `${art('cover')}<div class="heist-rules">
      ${result}
      <p class="heist-summary"><strong>${prize} JJ</strong><span>${attempts(data.remaining)}</span></p>
      <p>${bi('Tienes 60 segundos para superar las tres salas. Un error termina el intento.',
        'You have 60 seconds to clear all three rooms. One mistake ends the attempt.')}</p>
      <ol>${Object.values(rooms).map(([es,en,howEs,howEn]) => `<li><strong>${bi(es,en)}</strong><p>${bi(howEs,howEn)}</p></li>`).join('')}</ol>
      <p>${bi(`Puedes llevarte ${prize} JJ de la cuenta de Yisus una vez al día. Los intentos se reinician a medianoche de Matamoros. El reloj sigue si cierras esta ventana.`,
        `You can take ${prize} JJ from Yisus’s balance once a day. Attempts reset at midnight, Matamoros time. The clock keeps running if you close this window.`)}</p>
      ${data.funded === false ? `<p>${bi(`A la bóveda le faltan monedas. Conservas tus intentos hasta que Yisus tenga ${prize} JJ disponibles.`,
        `The vault is low on coins. Your attempts stay intact until Yisus has ${prize} JJ available.`)}</p>` : ''}
      ${!data.won && data.remaining===0 ? `<p>${bi('Ya usaste los tres intentos. La bóveda vuelve a abrir mañana.',
        'You’ve used all three attempts. The vault opens again tomorrow.')}</p>` : ''}
      ${available ? button('start','Empezar intento','Start attempt') : button('close','Volver a Inicio','Back to Home','heist-secondary')}
    </div>`;
  }

  function game(run) {
    const [es,en,howEs,howEn] = rooms[run.stage];
    const roomNumber = {memory:1,lasers:2,dial:3}[run.stage];
    let controls;
    if (run.stage==='memory') {
      controls = `<div class="heist-symbols">${symbols.map(([glyph,esName,enName],index)=>
        `<button type="button" data-heist-action="tap" data-input="${index}" data-heist-es="${esName}" data-heist-en="${enName}">
         <span aria-hidden="true">${glyph}</span></button>`).join('')}</div>
        <p class="heist-progress" data-heist-progress></p>`;
    } else if (run.stage==='lasers') {
      controls = `<div class="heist-board" role="img" data-heist-board>
        ${Array.from({length:25},(_,index)=>`<span class="heist-tile" data-tile="${index}">${index===2?'✦':''}</span>`).join('')}
      </div>
      <p class="heist-legend">
        <span class="heist-off">${bi('Paso libre','Open')}</span><span class="heist-warning">${bi('Por encenderse','About to turn on')}</span>
        <span class="heist-live">${bi('Láser encendido','Live laser')}</span>
      </p>
      <div class="heist-directions">${directions.map(([glyph,esName,enName],index)=>
        `<button type="button" data-heist-action="move" data-input="${index}" data-heist-es="${esName}" data-heist-en="${enName}">
          <span aria-hidden="true">${glyph}</span></button>`).join('')}</div>`;
    } else {
      controls = `<div class="heist-dial" aria-hidden="true"><div class="heist-dial-inner"></div><div class="heist-needle"></div></div>
      <p class="heist-progress" data-heist-progress></p>${button('pulse','Fijar pulso','Lock pulse')}`;
    }
    return `<div class="heist-game" data-stage="${run.stage}">
      <div class="heist-hud"><strong data-heist-clock>01:00</strong><span>${bi('Sala','Room')} ${roomNumber}/3</span></div>
      <div class="heist-game-layout">${art(run.stage)}<div class="heist-controls">
        <h3 tabindex="-1">${bi(es,en)}</h3><p>${bi(howEs,howEn)}</p>
        ${controls}
      </div></div>
      <details class="heist-end"><summary>${bi('Terminar intento','End attempt')}</summary>
        <p>${bi('Si confirmas, este intento contará como usado.','If you confirm, this attempt will count as used.')}</p>
        ${button('leave','Confirmar fin del intento','Confirm end attempt','heist-secondary')}
      </details>
    </div>`;
  }

  function language() {
    dialog.querySelectorAll('[data-heist-es]').forEach(node => {
      node.setAttribute('aria-label',say(node.dataset.heistEs,node.dataset.heistEn));
    });
    tick();
  }

  function paint(force=false) {
    const run = active();
    const next = run ? run.id+run.stage : data ? 'overview' : 'loading';
    if (screen!==next || force) {
      screen = next;
      dialog.innerHTML = `<header class="heist-header"><div><h2 id="heist-heading">${bi('Robo del Siglo','Heist of the Century')}</h2>
        <p>${bi('La bóveda de Yisus','Yisus’s Vault')}</p></div>
        <button class="heist-close" type="button" data-heist-action="close" data-heist-es="Cerrar" data-heist-en="Close">×</button></header>
        ${run ? game(run) : data ? overview() : `<div class="heist-rules">${feedback ?
          button('status','Reintentar','Try again') : `<p>${bi('Cargando la bóveda…','Loading the vault…')}</p>`}</div>`}
        <p class="heist-feedback" role="status" data-heist-feedback></p>`;
      if (run) {
        dialog.scrollTop = 0;
        scoped('.heist-controls h3')?.focus({preventScroll:true});
      }
    }
    language();
  }

  function tick() {
    if (!dialog.open) return;
    const info = scoped('[data-heist-feedback]');
    const copy = feedback ? say(...feedback) : '';
    if (info && info.textContent!==copy) info.textContent=copy;
    const run = active();
    if (!run || scoped('[data-stage]')?.dataset.stage!==run.stage) {
      if (scoped('[data-heist-action="start"]')) scoped('[data-heist-action="start"]').disabled=pending;
      return;
    }
    const now = heistTime();
    const left = Math.max(0,Math.ceil((run.deadline-now)/1000));
    const clock = scoped('[data-heist-clock]');
    const time = left===60 ? '01:00' : '00:'+String(left).padStart(2,'0');
    if (clock.textContent!==time) clock.textContent=time;
    clock.classList.toggle('heist-urgent',left<=10);
    if (run.stage==='memory') {
      const showing = now<run.stage_ms+5100;
      const interval = Math.floor((now-run.stage_ms-710)/715);
      const glow = showing && (now-run.stage_ms-710)%715<500 ? run.symbols?.[interval] : null;
      dialog.querySelectorAll('[data-heist-action="tap"]').forEach((tile,index) => {
        tile.classList.toggle('heist-glow',index===glow);
        tile.disabled=pending || showing || !left;
      });
      const progress = showing ? say('Memoriza la secuencia','Memorize the sequence') : `${run.step}/6 · ${say('Repite la secuencia','Repeat the sequence')}`;
      if (scoped('[data-heist-progress]').textContent!==progress) scoped('[data-heist-progress]').textContent=progress;
    } else if (run.stage==='lasers') {
      const y = Math.floor(run.pos/5), x = run.pos%5;
      for (const tile of dialog.querySelectorAll('[data-tile]')) {
        const index = Number(tile.dataset.tile), row = Math.floor(index/5), col = index%5;
        tile.classList.toggle('heist-player',index===run.pos);
        if (row===0) continue;
        const phase = (Math.max(0,now-run.stage_ms)+run.shifts[row-1])%2400;
        tile.dataset.beam = col===run.gaps[row-1] ? 'gap' : phase>=1050 ? 'live' : phase>=700 ? 'warning' : 'off';
      }
      scoped('[data-heist-board]').setAttribute('aria-label',say(`Julie en fila ${y+1}, columna ${x+1}`,`Julie at row ${y+1}, column ${x+1}`));
      const blocked = [y===0,x===4,y===4,x===0];
      dialog.querySelectorAll('[data-heist-action="move"]').forEach((move,index) => {move.disabled=pending || !left || blocked[index];});
    } else {
      const rotation = ((Math.max(0,now-run.stage_ms)+run.offset)%run.period)/run.period*360;
      const dial = scoped('.heist-dial');
      dial.style.setProperty('--heist-angle',rotation+'deg');
      dial.style.setProperty('--heist-arc',run.window/run.period*360+'deg');
      scoped('[data-heist-action="pulse"]').disabled=pending || !left || now<run.stage_ms;
      const progress = `${run.step}/3 · ${now<run.stage_ms ? say('Prepárate…','Get ready…') : say('Aciertos','Hits')}`;
      if (scoped('[data-heist-progress]').textContent!==progress) scoped('[data-heist-progress]').textContent=progress;
    }
  }

  function open(cardButton) {
    if (!eligible() || dialog.open) return;
    origin = cardButton;
    generation++;
    user = state.profile.id;
    data = null;
    feedback = null;
    pending = false;
    dialog.showModal();
    paint(true);
    send('status');
    let expirationCheck = 0;
    timer = setInterval(() => {
      if (!eligible() || state.profile.id!==user) {dialog.close();return;}
      tick();
      if (!pending && active() && heistTime()>active().deadline+350 && performance.now()-expirationCheck>2400) {
        expirationCheck = performance.now();
        send('status');
      }
    },35);
  }

  dialog.addEventListener('click', event => {
    const target = event.target.closest('[data-heist-action]');
    if (!target || target.disabled) return;
    const action = target.dataset.heistAction;
    if (action==='close') {dialog.close();return;}
    send(action,target.dataset.input === undefined ? null : Number(target.dataset.input));
  });
  document.addEventListener('keydown',event=>{
    if (!dialog.open || active()?.stage!=='lasers') return;
    const index=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].indexOf(event.key);
    if (index<0) return;
    event.preventDefault();
    scoped(`[data-heist-action="move"][data-input="${index}"]`)?.click();
  });
  dialog.addEventListener('close',() => {
    generation++;
    clearInterval(timer);
    if (origin?.isConnected) origin.focus();
  });
  window.addEventListener('universe-language',() => {if (dialog.open) language();});

  const previousHome = home;
  home = function() {
    previousHome();
    if (!eligible()) return;
    const id = state.profile.id;
    $('.hero')?.insertAdjacentHTML('afterend',`<section id="heist-home">
      ${art('cover')}<div><h2>${bi('Robo del Siglo','Heist of the Century')}</h2>
      <p>${bi('La bóveda de Yisus','Yisus’s Vault')}</p>
      <p class="heist-summary"><strong class="heist-home-prize">${defaultPrize} JJ</strong><span class="heist-home-status">${bi('Hasta 3 intentos al día','Up to 3 attempts a day')}</span></p>
      ${button('open','Entrar a la bóveda','Enter the vault')}</div></section>`);
    const cardButton = $('#heist-home button');
    if (!cardButton) return;
    cardButton.onclick = () => open(cardButton);
    rpc('jj_heist_play').then(value => {
      if (cardButton.isConnected && state.profile?.id===id) updateCard(value);
    }).catch(()=>{});
  };
})();
