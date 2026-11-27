'use strict';
(() => {
  const eventPage = 'anniversary-jxj';
  const shortsPage = 'shorts-jxj';
  const previewPage = 'anniversary-preview';
  const isOwner = () => state.profile?.handle === 'jesus';
  const isCouple = () => ['jesus', 'julisa'].includes(state.profile?.handle);
  const button = (action, es, en, value = '', disabled = false) =>
    `<button type="button" class="btn" data-anniversary-action="${action}" data-value="${value}" ${disabled ? 'disabled' : ''}>${bi(es,en)}</button>`;
  const branches = {
    horror: {
      label: ['Peli de terror', 'Horror movie'],
      ending: ['El guardián del sillón', 'Guardian of the couch'],
      story: ['Algo raspa del otro lado de la puerta. Jesús promete investigar desde una distancia prudente: debajo de la cobija. Julie abre la puerta y encuentra una bolsa de botanas que se cayó.',
        'Something scrapes at the door. Jesús promises to investigate from a safe distance: under the blanket. Julie opens the door and finds a bag of snacks that fell over.']
    },
    dance: {
      label: ['Bailar', 'Dance'],
      ending: ['La vuelta inventada', 'The freestyle spin'],
      story: ['Julie da una vuelta. Jesús da dos y termina mirando a la pared. «Era la coreografía», dice, y Julie vuelve a dar el paso para que puedan terminar juntos.',
        'Julie spins once. Jesús spins twice and ends up facing the wall. “That was choreography,” he says. Julie does the step again so they can finish together.']
    },
    both: {
      label: ['Las dos', 'Both'],
      ending: ['El susto con coreografía', 'The choreographed scare'],
      story: ['Ponen la película y practican un paso mientras carga. El primer susto cae justo en el giro. Los dos saltan a la vez y le ponen nombre al paso nuevo: el brinquito JxJ.',
        'They start the movie and practice a move while it loads. The first jump scare lands right on the spin. They both jump in sync and name their new move the JxJ Hop.']
    }
  };
  const comic = [
    ['¿Una pregunta antes de dormir?', 'One question before we sleep?'],
    ['Una pregunta se convirtió en otra.', 'One question turned into another.'],
    ['Y luego perdimos la noción de la hora.', 'And then we lost track of time.'],
    ['Nos quedamos dormidos con la llamada abierta.', 'We fell asleep with the call still open.'],
    ['La primera luz entró por la ventana.', 'The first light came through the window.'],
    ['Y al despertar, seguimos hablando.', 'And when we woke up, we kept talking.']
  ];
  const symbols = [
    ['☾', 'Luna', 'Moon'], ['✦', 'Estrella', 'Star'], ['♡', 'Corazón', 'Heart'], ['◇', 'Rombo', 'Diamond']
  ];
  const correctTiles = [4,1,5,2,6,3];
  const shortTitle = ['La sorpresa menos secreta', 'The worst-kept surprise'];
  const sprites = (pajamas = false) => ['jesus', 'julisa'].map(handle => pajamas
    ? `<img alt="" class="ann-sprite ann-${handle}" src="assets/bombitas/matching-pajamas-v2-${handle}.webp">`
    : `<span class="ann-sprite ann-${handle} ann-atlas"></span>`).join('');
  let unlocked = null;

  menus.push([eventPage, '✦', 'Nuestro aniversario'], [shortsPage, '▸', 'Shorts JxJ'], [previewPage, '▧', 'Vista previa del aniversario']);
  const previousAllowed = sectionAllowed;
  sectionAllowed = function(page) {
    if (page === eventPage) return isCouple() && previousAllowed('flowers');
    if (page === previewPage) return isOwner();
    if (page === shortsPage) return isCouple() && previousAllowed('flowers') && unlocked === state.profile.id;
    return previousAllowed(page);
  };
  const previousVisibility = paintSectionVisibility;
  paintSectionVisibility = function() {
    previousVisibility();
    const card = $('#anniversary-home');
    if (card) card.hidden = !sectionAllowed(eventPage);
    for (const route of [eventPage,previewPage]) {
      const link = document.querySelector(`[data-nav="${route}"]`);
      if (link) link.hidden = true;
    }
  };

  const read = async (action = 'read', value = null, round = null) => {
    const sentAt = Date.now();
    const data = await rpc('jj_anniversary', {p_action:action, p_value:value, p_round:round});
    return {data, offset: (data.server_time ?? Date.now()) - (sentAt + Date.now()) / 2};
  };
  function refreshShorts(owner, data) {
    if (state.profile?.id !== owner) return;
    if (data.unlocked_at) unlocked = owner;
    paintSectionVisibility();
  }
  const previousShell = shell;
  shell = function() {
    previousShell();
    if (isCouple() && !state.demo && unlocked !== state.profile.id) {
      const owner = state.profile.id;
      read().then(({data}) => refreshShorts(owner, data)).catch(() => {});
    }
  };
  const previousFlowers = flowers;
  flowers = async function(version) {
    const pending = previousFlowers(version);
    if (isCouple()) {
      const main = $('#main');
      const append = () => {
        if (state.version !== version || !main.isConnected || $('#anniversary-event-card',main)) return;
        main.insertAdjacentHTML('beforeend', `<article class="ann-panel ann-event-card" id="anniversary-event-card">
          <h2>${bi('Nuestro aniversario','Our anniversary')}</h2>
          <p>${bi('Hasta que salga el sol','Until the sun comes up')}</p>
          ${button('open','Abrir aniversario','Open anniversary')}</article>`);
        $('#anniversary-event-card button', main).onclick = () => navigate(eventPage);
      };
      const observer = new MutationObserver(append);
      observer.observe(main,{childList:true});
      JJ.cleanups.push(() => observer.disconnect());
      append();
    }
    await pending;
  };

  const previousHome = home;
  home = function() {
    previousHome();
    if (!isCouple() || state.demo || (isOwner() && localStorage.getItem('jj-show-anniversary-home') !== 'yes')) return;
    const welcome = $('.welcome');
    welcome.insertAdjacentHTML('afterend', `<section id="anniversary-home" ${sectionAllowed(eventPage) ? '' : 'hidden'} class="ann-panel ann-entry">
      <div><h2>${bi('Nuestro aniversario','Our anniversary')}</h2>
      <p>${bi('Una aventura para jugar juntos.','An adventure to play together.')}</p></div>
      ${button('enter','Abrir aniversario','Open anniversary')}</section>`);
    $('#anniversary-home button').onclick = () => navigate(eventPage);
  };

  const previousProfile = profilePage;
  profilePage = async function(version) {
    await previousProfile(version);
    if (version !== state.version || !isOwner()) return;
    const main = $('#main');
    const heading = main.querySelector('.page-heading');
    (heading || main).insertAdjacentHTML(heading?'afterend':'afterbegin', `<section class="ann-panel" id="anniversary-profile">
      <h2>${bi('Nuestro aniversario','Our anniversary')}</h2>
      <div class="ann-actions">${button('preview','Ver vista previa','Open preview')} ${button('enter','Abrir aniversario','Open anniversary')}</div>
      <label><input type="checkbox" id="ann-show-home" ${localStorage.getItem('jj-show-anniversary-home')==='yes'?'checked':''}> ${bi('Mostrar en mi Inicio','Show on my Home screen')}</label>
      <p>${bi('Explora todas las escenas desde tu perfil.','Explore every scene from your profile.')}</p></section>`);
    $('#ann-show-home').onchange = event => localStorage.setItem('jj-show-anniversary-home',event.target.checked?'yes':'no');
    $('#anniversary-profile [data-anniversary-action="preview"]').onclick = () => navigate(previewPage);
    $('#anniversary-profile [data-anniversary-action="enter"]').onclick = () => navigate(eventPage);
  };

  const previousNavigate = navigate;
  navigate = async function(page) {
    if (![eventPage,shortsPage,previewPage].includes(page)) return previousNavigate(page);
    if (!isCouple() || (page === previewPage && !isOwner())) return previousNavigate('home');
    if (!isOwner() && !previousAllowed('flowers')) return previousNavigate('home');
    jjCleanup();
    clearTimers();
    state.page = page;
    const version = ++state.version, owner = state.profile.id;
    const current = () => state.version === version && state.profile?.id === owner;
    rememberRoute(historyRoute(page));
    shell();
    window.scrollTo(0,0);
    const root = $('#main');
    root.innerHTML = `<section class="ann-panel"><p role="status">${bi('Cargando…','Loading…')}</p></section>`;
    try {
      if (page !== shortsPage) await eventRoom(root,current,owner,page===previewPage);
      else {
        const {data} = await read();
        if (!current()) return;
        refreshShorts(owner,data);
        root.innerHTML = `<section class="ann-panel"><h1>Shorts JxJ</h1>${data.unlocked_at
          ? `<h2>${bi(...shortTitle)}</h2><div class="ann-scene ann-cover" aria-hidden="true">${sprites()}<span class="ann-bouquet">💐</span><span class="ann-gift">🎁</span></div>${button('play','Ver episodio','Play episode')}`
          : `<p>${bi('Resuelvan el rompecabezas del aniversario para abrir este apartado.','Solve the anniversary puzzle together to open this section.')}</p>`}
          ${button('back','Volver al aniversario','Back to the anniversary')}</section>`;
        root.querySelector('[data-anniversary-action="play"]')?.addEventListener('click', () => playShort(root,current));
        root.querySelector('[data-anniversary-action="back"]').onclick = () => navigate(eventPage);
      }
    } catch (error) {
      if (!current()) return;
      console.error(error);
      root.innerHTML = `<section class="ann-panel"><p>${bi('No pudimos cargar el aniversario.','Could not load the anniversary.')}</p>${button('retry','Reintentar','Try again')}</section>`;
      root.querySelector('button').onclick = () => navigate(page);
    }
  };

  const readout = (es,en) => `<p>${bi(es,en)}</p>`;
  function comicPage(page) {
    return `<figure class="ann-comic"><div class="ann-scene ann-comic-frame ann-frame-${page}" aria-hidden="true">
      <div class="ann-call">${sprites(true)}</div></div>
      <figcaption>${bi(...comic[page])}</figcaption></figure>`;
  }
  function tile(piece) {
    return `<span class="ann-tile ann-tile-${correctTiles.indexOf(piece)}" aria-hidden="true"><span class="ann-scene ann-comic-frame ann-frame-5"><span class="ann-call">${sprites(true)}</span></span></span>`;
  }

  function rehearsal() {
    const sequences = ['2013','3102'];
    let data;
    function select(stage) {
      data = {available:true,stage,joined:['jesus','julisa'],route:'both',revision:0,sequence_round:0,
        clue:sequences[0],dance_ready:[],dance_round:0,dance_start:null,submitted:false,
        comic_read:[],tiles:[0,0,0,0,0,0],puzzle_ready:[],unlocked_at:null};
    }
    select(0);
    async function request(action='read',value=null) {
      switch (action) {
        case 'route':
          data.route=value;
          data.stage=1;
          break;
        case 'sequence':
          if (value!==data.clue) throw Error('TRY_SEQUENCE');
          data.clue=sequences[++data.sequence_round];
          if (data.sequence_round===2) data.stage=2;
          break;
        case 'dance_ready':
          data.dance_round++;
          data.dance_start=Date.now()+3500;
          break;
        case 'dance_score':
          if ([...value].filter(c=>c==='1').length>=3) data.stage=3;
          data.dance_start=null;
          break;
        case 'dance_retry':
          data.dance_start=null;
          break;
        case 'comic':
          data.stage=4;
          break;
        case 'place': {
          const [piece,slot]=value.split(':').map(Number);
          if (data.tiles[slot-1] && data.tiles[slot-1]!==piece) throw Error('OCCUPIED');
          data.tiles=data.tiles.map((id,i)=>i===slot-1?piece:id===piece?0:id);
          break;
        }
        case 'remove':
          data.tiles=data.tiles.map(id=>id===Number(value)?0:id);
          break;
        case 'confirm':
          if (data.tiles.some((id,i)=>id!==correctTiles[i])) throw Error('TRY_PUZZLE');
          data.stage=5;
          break;
      }
      if (action!=='read') data.revision++;
      return {data:{...data},offset:0};
    }
    return {select,request};
  }

  async function eventRoom(root,current,owner,preview=false) {
    const header = `<h1>${bi('Hasta que salga el sol','Until the sun comes up')}</h1>`;
    if (state.demo && !preview) {
      root.innerHTML = `<section class="ann-panel">${header}${readout('Entren con sus perfiles para jugar juntos.','Sign in with your profiles to play together.')}</section>`;
      return;
    }
    const me = state.profile.handle;
    const isJesus = me === 'jesus';
    const trial = preview ? rehearsal() : null;
    const request = trial?.request || read;
    let {data,offset} = await request();
    if (!current()) return;
    if (!preview) refreshShorts(owner,data);
    if (!data.available) {
      root.innerHTML = `<section class="ann-panel">${header}${readout('Disponible el 11 de diciembre.','Opens December 11.')}</section>`;
      return;
    }

    let busy = false, polling = false, notice = '', digits = '', piece = 0, page = 0;
    let comicReview = false, endingReview = null, activeRound = 0, beatMask = [0,0,0,0], scoreSending = false, lastPulse;
    const context = value => JSON.stringify({...value,server_time:undefined});
    const status = (waitingEs,waitingEn) => readout(waitingEs,waitingEn);
    const symbol = digit => `<span aria-hidden="true">${symbols[digit][0]}</span> ${bi(...symbols[digit].slice(1))}`;

    function storyOptions(review = false) {
      return Object.entries(branches).map(([key,branch]) => button(review?'ending-preview':'route',...branch.label,key,busy)).join('');
    }
    function ending(key) {
      const branch = branches[key];
      return `<h2>${bi(...branch.ending)}</h2>${readout(...branch.story)}`;
    }
    function sequence() {
      const clue = data.clue;
      const round = data.sequence_round + 1;
      return `<h2>${bi('¿De dónde vino el ruido?','Where did that noise come from?')} · ${round}/2</h2>`
        + (clue ? readout(...(preview ? ['Marca los símbolos en este orden.','Enter the symbols in this order.']
          : ['Lee estos símbolos en orden a tu pareja.','Read these symbols to your partner in order.']))
          + `<ol class="ann-clue">${[...clue].map(d => `<li>${symbol(d)}</li>`).join('')}</ol>` : '')
        + ((!clue || preview)
          ? (preview ? '' : readout('Tu pareja tiene la pista. Marca los cuatro símbolos en orden.','Your partner has the clue. Enter the four symbols in order.')) +
          `<p class="ann-selection" aria-live="polite">${[...digits].map(d => symbols[d][0]).join(' ') || '· · · ·'} (${digits.length}/4)</p>
          <div class="ann-actions">${symbols.map(([glyph,es,en],i) => button('symbol',glyph+' '+es,glyph+' '+en,i,busy || digits.length>=4)).join('')}
          ${button('erase','Borrar último','Undo last','',busy || !digits.length)}
          ${button('sequence','Comprobar','Check',digits,busy || digits.length!==4)}</div>` : '');
    }

    function rhythm() {
      const line = data.dance_start
        ? `<p id="ann-beat-label" role="status"></p><div class="ann-beats" aria-hidden="true">${'<i></i>'.repeat(4)}</div>
          ${button('beat','Marcar pulso','Tap the beat','',data.submitted)}
          <button type="button" class="btn secondary" data-anniversary-action="dance_retry" hidden>${bi('Repetir ronda','Retry round')}</button>`
        : button('dance_ready','Estoy listo','I’m ready','',busy || data.dance_ready.includes(me)) +
          (data.dance_ready.includes(me) ? status('Esperando a tu pareja.','Waiting for your partner.') : '');
      return `<h2>${bi('A la cuenta de tres','On the count of three')}</h2>${readout('Cuando se encienda cada luz, pulsa el botón. Necesitan acertar las mismas tres de cuatro.','Tap the button when each light comes on. You need to hit the same three out of four.')}${line}`;
    }

    function puzzle() {
      const deck = preview ? [1,2,3,4,5,6] : isJesus ? [1,2,3] : [4,5,6];
      const board = data.tiles.map((id,i) => `<button type="button" data-anniversary-action="slot" data-value="${i+1}"
        aria-label="${say('Casilla','Slot')} ${i+1}${id ? ', '+say('ocupada','occupied') : ''}" ${busy?'disabled':''}>${id?tile(id):i+1}</button>`).join('');
      return `<h2>${bi('La foto del amanecer','The sunrise picture')}</h2>
        ${readout('Toca una de tus piezas y luego una casilla. Toca una pieza tuya del tablero para retirarla.','Tap one of your pieces, then a slot. Tap one of your pieces on the board to remove it.')}
        <div class="ann-puzzle">${board}</div><div class="ann-deck">${deck.map(id => `<button type="button" data-anniversary-action="piece" data-value="${id}"
          aria-label="${say('Pieza','Piece')} ${id}" aria-pressed="${piece===id}" ${busy||data.tiles.includes(id)?'disabled':''}>${tile(id)}</button>`).join('')}</div>
        ${button('confirm','Confirmar imagen','Confirm picture','',busy || data.puzzle_ready.includes(me))}
        ${data.puzzle_ready.includes(me) ? status('Esperando la confirmación de tu pareja.','Waiting for your partner to confirm.') : ''}`;
    }

    function paint() {
      if (!current()) return;
      let body;
      if (!data.joined.includes(me)) body = button('join','Entrar con mi perfil','Join with my profile','',busy);
      else if (data.joined.length < 2) body = status('Esperando a que tu pareja entre desde Eventos.','Waiting for your partner to join from Events.');
      else if (data.stage === 0) body = `<h2>${bi('El plan perfecto… según quién','The perfect plan… depending on who you ask')}</h2>
        ${readout('En el chat del Airbnb, Sani vuelve a revisar el plan. De todas las ideas de comida quedan tres. Julie mira la lista y pregunta: «¿Y después qué hacemos?»',
          'In the Airbnb group chat, Sani goes over the plan again. The big food list is down to three ideas. Julie looks at it and asks, “So what do we do after?”')}
        <div class="ann-actions">${storyOptions()}</div>`;
      else if (data.stage === 1) body = (data.sequence_round === 0 ? ending(data.route) : '') + sequence();
      else if (data.stage === 2) body = rhythm();
      else if (data.stage === 3 || comicReview) body = `<h2>${bi('Cinco minutos más','Five more minutes')}</h2>${comicPage(page)}
        <div class="ann-actions">${button('prev','Anterior','Previous','',page===0)} <span>${page+1} / ${comic.length}</span>
        ${page < comic.length-1 ? button('next','Siguiente','Next')
          : comicReview ? button('close-comic','Cerrar cómic','Close comic')
            : button('comic','Terminé de leer','I finished reading','',busy || data.comic_read.includes(me))}</div>
        ${data.stage===3 && data.comic_read.includes(me) ? status('Esperando a que tu pareja termine.','Waiting for your partner to finish.') : ''}`;
      else if (data.stage === 4) body = puzzle();
      else body = `<h2>${bi('Shorts JxJ desbloqueado','Shorts JxJ unlocked')}</h2>
        ${button('short','Ver el episodio','Watch the episode')} ${button('review-comic','Volver a leer el cómic','Read the comic again')}
        <details ${endingReview?'open':''}><summary>${bi('Ver los otros finales','See the other endings')}</summary>
        <div class="ann-actions">${storyOptions(true)}</div>${endingReview?ending(endingReview):''}</details>`;
      const focused = document.activeElement?.dataset.anniversaryAction;
      const currentValue = document.activeElement?.dataset.value;
      const previewControls = preview ? `<div class="ann-preview">
        ${readout('Vista previa · Tu avance aquí es de ensayo.','Preview · This is a practice run.')}
        <div class="ann-actions">${[
          ['Historia','Story'],['Símbolos','Symbols'],['Ritmo','Rhythm'],['Cómic','Comic'],['Rompecabezas','Puzzle'],['Corto','Short']
        ].map(([es,en],stage)=>button('preview-stage',es,en,stage)).join('')}</div></div>` : '';
      root.innerHTML = `<section class="ann-panel">${header}${previewControls}${body}
        <p class="ann-status" role="status" aria-live="polite">${esc(notice)}</p>
        ${preview ? button('profile','Volver a Perfiles','Back to Profiles') : button('events','Volver a Eventos','Back to Events')}</section>`;
      if (focused) [...root.querySelectorAll('button')].find(b => !b.disabled && b.dataset.anniversaryAction===focused && b.dataset.value===currentValue)?.focus({preventScroll:true});
      lastPulse = undefined;
    }

    function update(next) {
      if (next.data.revision < data.revision) return;
      if (next.data.sequence_round !== data.sequence_round) digits = '';
      if (next.data.stage !== data.stage) notice = '';
      const changed = context(next.data) !== context(data);
      ({data,offset} = next);
      if (!preview) refreshShorts(owner,data);
      if (changed) paint();
    }
    async function refresh() {
      if (!current() || document.hidden || busy || polling) return;
      polling = true;
      try {
        const next = await request();
        if (current() && !busy) update(next);
      } catch { /* Preserve the current scene while reconnecting. */ }
      finally { polling = false; }
    }
    async function act(action,value = null,round = null) {
      if (busy || !current()) return;
      busy = true;
      notice = '';
      try {
        const next = await request(action,value,round);
        if (current()) {
          if (action === 'place') piece = 0;
          if (action === 'dance_score' && next.data.stage === 2 && !next.data.dance_start) {
            notice = say('Casi. Vamos otra vez.','Close. Let’s go again.');
          }
          update(next);
        }
      } catch (error) {
        if (!current()) return;
        const messages = {
          TRY_SEQUENCE:['La secuencia no coincide. Prueben de nuevo.','The sequence doesn’t match. Try again.'],
          OCCUPIED:['Retiren primero la pieza de esa casilla.','Remove the piece in that slot first.'],
          TRY_PUZZLE:['Todavía hay piezas fuera de lugar.','Some pieces are still out of place.'],
          EVENT_CHANGED:['La ronda cambió. Actualizando…','The round changed. Refreshing…']
        };
        notice = say(...(messages[error.message] || ['Comprueba la conexión y vuelve a intentar.','Check your connection and try again.']));
        if (error.message === 'TRY_SEQUENCE') digits = '';
      } finally {
        busy = false;
        if (current()) { paint(); void refresh(); }
      }
    }
    function rhythmClock() {
      if (!current() || data.stage !== 2 || !data.dance_start) return;
      if (activeRound !== data.dance_round) {
        activeRound = data.dance_round;
        beatMask = [0,0,0,0];
      }
      const elapsed = Date.now() + offset - data.dance_start;
      const pulse = elapsed<0 ? -1 : Math.min(4,Math.floor(elapsed/900));
      if (pulse!==lastPulse) {
        lastPulse = pulse;
        root.querySelectorAll('.ann-beats i').forEach((light,i) => light.classList.toggle('lit',pulse===i));
      }
      const label = root.querySelector('#ann-beat-label');
      const text = elapsed < 0 ? String(Math.ceil(-elapsed/1000))
        : elapsed < 3150 ? say('¡Ahora!','Now!')
        : say('Comprobando la ronda…','Checking the round…');
      if (label && label.textContent !== text) label.textContent = text;
      if (elapsed > 3500 && !data.submitted && !scoreSending && !busy && !document.hidden) {
        scoreSending = true;
        act('dance_score',beatMask.join(''),activeRound).finally(() => { scoreSending = false; });
      }
      const retry = root.querySelector('[data-anniversary-action="dance_retry"]');
      if (retry) retry.hidden = elapsed < 10300;
    }

    root.onclick = async event => {
      const target = event.target.closest('[data-anniversary-action]');
      if (!target || !current()) return;
      const {anniversaryAction:action,value} = target.dataset;
      if (action === 'events') return navigate('flowers');
      if (action === 'profile') return navigate('profile');
      if (action === 'short' || (action === 'preview-stage' && value === '5')) {
        if (!preview) return navigate(shortsPage);
        clearInterval(clock);
        root.onclick = null;
        return playShort(root,current,previewPage);
      }
      if (busy) return;
      if (action === 'preview-stage') {
        trial.select(Number(value));
        const next = await request();
        data = next.data;
        offset = next.offset;
        notice = digits = '';
        piece = page = activeRound = 0;
        endingReview = null;
        comicReview = false;
        return paint();
      }
      if (action === 'symbol') { digits += value; return paint(); }
      if (action === 'erase') { digits = digits.slice(0,-1); return paint(); }
      if (action === 'next' || action === 'prev') { page += action==='next'?1:-1; return paint(); }
      if (action === 'review-comic' || action === 'close-comic') { comicReview = action==='review-comic'; page = 0; return paint(); }
      if (action === 'ending-preview') { endingReview = value; return paint(); }
      if (action === 'piece') { piece = Number(value); return paint(); }
      if (action === 'slot') {
        const occupant = data.tiles[Number(value)-1];
        if (piece) return act('place',`${piece}:${value}`);
        if (occupant && (preview || (occupant <= 3) === isJesus)) return act('remove',String(occupant));
        return;
      }
      if (action === 'beat') {
        const elapsed = Date.now()+offset-data.dance_start;
        const beat = Math.round(elapsed/900);
        if (beat>=0 && beat<4 && Math.abs(elapsed-beat*900)<=380) {
          beatMask[beat]=1;
          root.querySelectorAll('.ann-beats i')[beat]?.classList.add('hit');
        }
        return;
      }
      const round = action==='sequence' ? data.sequence_round : action==='dance_retry' ? data.dance_round : null;
      return act(action,value || null,round);
    };
    const poll = preview ? null : setInterval(refresh,1200);
    const clock = setInterval(rhythmClock,50);
    JJ.cleanups.push(() => { clearInterval(poll); clearInterval(clock); root.onclick = null; });
    paint();
  }

  const captions = [
    [7200,'julisa','What are you hiding?'], [11000,'jesus','Nothing.'],
    [15500,'julisa','Then why is “nothing” in your hair?'], [20700,'jesus','And what’s that?'],
    [25200,'julisa','Also nothing.'], [32400,'jesus','Happy anniversary, Julie.'],
    [35100,'julisa','Happy anniversary, Jesús.']
  ];
  function playShort(root,current,returnPage=shortsPage) {
    root.innerHTML = `<section class="ann-panel">
      <h1>${bi(...shortTitle)}</h1><div class="ann-scene ann-short" aria-label="${say('Corto animado','Animated short')}">
        <div class="ann-film-frame" aria-hidden="true"></div><p class="ann-bubble" lang="en" translate="no" aria-live="polite" hidden></p></div>
      <div class="ann-actions">${button('pause','Pausar','Pause')} ${button('replay','Repetir','Replay')} ${returnPage===previewPage ? button('list','Volver a la vista previa','Back to preview') : button('list','Volver a Shorts JxJ','Back to Shorts JxJ')}</div></section>`;
    const scene = root.querySelector('.ann-short'), bubble = scene.querySelector('.ann-bubble');
    const pause = root.querySelector('[data-anniversary-action="pause"]');
    let elapsed = 0, previous = performance.now(), paused = false, frame, lastCaption;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function tick(now) {
      if (!current() || !scene.isConnected) return;
      if (!paused && !document.hidden) elapsed = Math.min(38000,elapsed+Math.min(now-previous,100));
      previous = now;
      const starts = [0,7200,11000,20700,25200,32400,38000];
      const shot = Math.min(5,starts.findLastIndex(start => elapsed >= start));
      const fraction = (elapsed-starts[shot])/(starts[shot+1]-starts[shot]);
      const artwork = scene.querySelector('.ann-film-frame');
      artwork.style.backgroundPosition = (shot%2)*100+'% '+Math.floor(shot/2)*50+'%';
      if (!reduceMotion) artwork.style.transform = 'scale('+(1.015+fraction*.055)+')';
      let caption = captions.findLast(line => line[0]<=elapsed && elapsed-line[0]<4400);
      if (elapsed>=38000) caption = captions.at(-1);
      if (caption!==lastCaption) {
        lastCaption=caption;
        bubble.hidden=!caption;
        if (caption) {
          bubble.dataset.speaker=caption[1];
          bubble.setAttribute('aria-label',`${caption[1]==='jesus'?'Jesús':'Julie'}: ${caption[2]}`);
          bubble.textContent=caption[2];
        }
      }
      if (elapsed<38000) frame=requestAnimationFrame(tick);
      else pause.disabled=true;
    }
    pause.onclick = () => {
      paused=!paused;
      pause.innerHTML = paused ? bi('Continuar','Resume') : bi('Pausar','Pause');
    };
    root.querySelector('[data-anniversary-action="replay"]').onclick = () => {
      cancelAnimationFrame(frame);
      playShort(root,current,returnPage);
    };
    root.querySelector('[data-anniversary-action="list"]').onclick = () => navigate(returnPage);
    frame=requestAnimationFrame(tick);
    JJ.cleanups.push(() => cancelAnimationFrame(frame));
  }
})();
