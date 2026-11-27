'use strict';
(() => {
  const frames = [
    ['classic', 'Clásico', 'Classic'],
    ['navy', 'Azul medianoche', 'Midnight blue'],
    ['gold', 'Órbita dorada', 'Golden orbit'],
    ['aurora', 'Aurora', 'Aurora']
  ];
  const taskCopy = {
    letter: ['Cartitas', 'Letters', 'Deja una carta en el buzón.', 'Leave a letter in the mailbox.'],
    letters3: ['Cartitas', 'Letters', 'Escribe tres cartitas nuevas.', 'Write three new letters.'],
    song: ['Música', 'Music', 'Comparte una canción nueva.', 'Share a new song.'],
    playlist: ['Playlists', 'Playlists', 'Crea una playlist nueva.', 'Create a new playlist.'],
    photo: ['Recuerdos', 'Memories', 'Guarda un recuerdo nuevo.', 'Save a new memory.'],
    memories3: ['Recuerdos', 'Memories', 'Guarda tres recuerdos nuevos.', 'Save three new memories.'],
    games3: ['Minijuegos', 'Minigames', 'Termina tres partidas registradas.', 'Finish three tracked rounds.'],
    variety: ['Minijuegos', 'Minigames', 'Completa partidas en tres juegos diferentes.', 'Finish rounds in three different games.'],
    puzzle: ['Rompecabezas', 'Puzzles', 'Resuelve una sopa de letras o un laberinto.', 'Solve a word search or maze.'],
    together: ['Verdad o reto', 'Truth or dare', 'Completen una tarjeta juntos.', 'Complete a card together.'],
    together3: ['Verdad o reto', 'Truth or dare', 'Completen tres tarjetas juntos.', 'Complete three cards together.'],
    album_card: ['Álbum JJ', 'JJ Album', 'Abre un sobre de la máquina del álbum.', 'Open a pack from the album machine.']
  };
  const selectedTabs = new Map();
  const hub = (action, args = {}) => rpc('jj_profile_hub', {p_action: action, ...args});

  function openTab(tab) {
    selectedTabs.set(state.profile.id, tab);
    return navigate('profile');
  }

  function styleCard(card, style = {}) {
    if (!card) return;
    card.querySelector('.profile-large').dataset.frame = style.frame || 'classic';
    const bio = card.querySelector('.profile-bio') || document.createElement('p');
    bio.className = 'profile-bio';
    bio.translate = false;
    bio.textContent = style.bio || '';
    if (!bio.isConnected) card.append(bio);
    bio.hidden = !style.bio;
    const medals = card.querySelector('.profile-medal-list') || document.createElement('ul');
    medals.className = 'profile-medal-list';
    medals.replaceChildren(...(style.medals || []).map(name => {
      const medal = document.createElement('li');
      medal.textContent = name;
      return medal;
    }));
    if (!medals.isConnected) card.append(medals);
    medals.hidden = !style.medals?.length;
  }

  function appearance(panel, card, style, available) {
    panel.insertAdjacentHTML('beforeend', `<form id="profile-style-form" class="game-panel stack">
      <h2>${bi('Descripción y marco','Bio and frame')}</h2>
      <label>${bi('Descripción','Bio')}<textarea name="bio" maxlength="240" rows="3" ${available ? '' : 'disabled'}>${esc(style.bio || '')}</textarea></label>
      <label>${bi('Marco de tu avatar','Avatar frame')}<select name="frame" ${available ? '' : 'disabled'}>${frames.map(([id, es, en]) =>
        `<option value="${id}" ${(style.frame || 'classic') === id ? 'selected' : ''}>${say(es,en)}</option>`).join('')}</select></label>
      <button class="btn" ${available ? '' : 'disabled'}>${bi('Guardar apariencia','Save appearance')}</button>
      <p role="status">${available ? '' : bi('La apariencia no está disponible por ahora.','Appearance settings are currently unavailable.')}</p>
    </form>
    <section class="game-panel"><h2>${bi('Medallas','Medals')}</h2><p>${style.medals?.length ?
      bi('Tus medallas aparecen en tu tarjeta de perfil.','Your medals appear on your profile card.') :
      bi('Aquí aparecerán tus medallas cuando las consigas.','Your medals will appear here once you earn them.')}</p></section>`);
    const form = panel.querySelector('#profile-style-form');
    const frame = form.elements.frame;
    const preview = card?.querySelector('.profile-large');
    frame.onchange = () => { if (preview) preview.dataset.frame = frame.value; };
    form.onsubmit = async event => {
      event.preventDefault();
      if (!available || !ensureLive()) return;
      const button = form.querySelector('button');
      const status = form.querySelector('[role="status"]');
      const bio = form.elements.bio.value.trim();
      const chosenFrame = frame.value;
      button.disabled = true;
      try {
        await rpc('jj_save_profile_style', {p_bio: bio, p_frame: chosenFrame});
        if (!form.isConnected) return;
        styleCard(card, {...style, bio, frame: chosenFrame});
        if (preview) preview.dataset.frame = frame.value;
        status.textContent = say('Apariencia guardada.','Appearance saved.');
      } catch {
        status.textContent = say('No se pudo guardar. Inténtalo otra vez.','Could not save. Please try again.');
      } finally {
        button.disabled = false;
      }
    };
  }

  function discountTitles(panel, coupons) {
    const buttons = [...panel.querySelectorAll('[data-title-buy]')];
    const available = coupons.filter(coupon => !coupon.used_at);
    if (!buttons.length || !available.length) return;
    const originals = new Map(buttons.map(button => [button, button.innerHTML]));
    const purchases = buttons.filter(button => button.hasAttribute('data-title-purchase'));
    if (!purchases.length) return;
    const field = document.createElement('div');
    field.className = 'stack profile-coupon-picker';
    field.innerHTML = `<label>${bi('Cupón para esta compra','Coupon for this purchase')}
      <select id="profile-coupon-picker"><option value="">${say('Sin cupón','No coupon')}</option>
      ${available.map(coupon => `<option value="${esc(coupon.id)}">${coupon.percent}% · ${jjDate(coupon.week_start)}</option>`).join('')}</select></label>
      <p class="hint">${bi('El ahorro se redondea en monedas JJ enteras, con un mínimo de 1 JJ de ahorro y 1 JJ de precio.','Savings round to whole JJ coins, with a minimum of 1 JJ saved and a price of at least 1 JJ.')}</p>`;
    panel.querySelector('h2').after(field);
    const select = field.querySelector('select');
    const selected = () => available.find(coupon => coupon.id === select.value);
    select.onchange = () => {
      for (const button of purchases) {
        const coupon = selected();
        const [,es,en,price] = UniverseTitles.find(([id]) => id === button.dataset.titleBuy);
        const cost = coupon ? Math.max(1, price - Math.max(1, Math.round(price * coupon.percent / 100))) : price;
        button.innerHTML = coupon ? `${bi(es,en)} · ${cost} JJ` : originals.get(button);
      }
    };
    for (const button of purchases) {
      button.addEventListener('click', async event => {
        const coupon = selected();
        if (!coupon) return;
        event.stopImmediatePropagation();
        if (!ensureLive()) return;
        const previousDisabled = buttons.map(b => b.disabled);
        buttons.forEach(b => { b.disabled = true; });
        select.disabled = true;
        const status = panel.querySelector('#title-status');
        try {
          await hub('redeem', {p_coupon: coupon.id, p_title: button.dataset.titleBuy});
          if (!panel.isConnected) return;
          toast(say('Título equipado. Cupón canjeado.','Title equipped. Coupon redeemed.'));
          await openTab('mine');
        } catch (error) {
          if (error.message === 'COUPON_UNAVAILABLE' || error.message === 'TITLE_NOT_ELIGIBLE') {
            if (panel.isConnected) await openTab('mine');
            return;
          }
          status.textContent = say('No se pudo canjear. Comprueba tu saldo e inténtalo otra vez.','Redemption failed. Check your balance and try again.');
        } finally {
          buttons.forEach((b, i) => { b.disabled = previousDisabled[i]; });
          select.disabled = false;
        }
      }, true);
    }
  }

  function warehouse(panel, coupons, canRedeem) {
    if (!coupons) {
      panel.insertAdjacentHTML('beforeend', `<p role="status">${bi('No pudimos cargar tus cupones. Vuelve a abrir el perfil para reintentar.','Could not load your coupons. Reopen your profile to retry.')}</p>`);
      return;
    }
    panel.insertAdjacentHTML('beforeend', `<section class="game-panel"><h2>${bi('Espacio interdimensional','Interdimensional space')}</h2>
      <p>${bi('Tus cupones de las misiones semanales se quedan aquí hasta que los uses. Cada cupón sirve para una compra elegible y no vence.','Your weekly mission coupons stay here until used. Each coupon is valid for one eligible purchase and never expires.')}</p>
      <div class="profile-coupons">${coupons.map(coupon => {
        const title = UniverseTitles.find(([id]) => id === coupon.used_title);
        return `<article class="profile-coupon"><strong>${coupon.percent}%</strong>
          <p>${coupon.used_at ? bi('Usado','Used') : bi('Disponible','Available')}${title ? ` · ${bi(title[1],title[2])}` : ''}</p>
          <small>${bi('Semana del','Week of')} ${jjDate(coupon.week_start)}</small></article>`;
      }).join('') || `<p>${bi('Todavía no tienes cupones. Completa tu ruta semanal para ganar el primero.','You don’t have any coupons yet. Complete your weekly route to earn your first one.')}</p>`}</div>
      <div class="profile-hub-links">
        ${sectionAllowed('missions') ? jjButton('profile-open-missions','Ir a misiones','Open missions','btn secondary') : ''}
        ${canRedeem ? jjButton('profile-open-titles','Canjear en títulos','Redeem in titles') : ''}
      </div></section>`);
    panel.querySelector('#profile-open-missions')?.addEventListener('click', () => navigate('missions'));
    panel.querySelector('#profile-open-titles')?.addEventListener('click', () => {
      $('#main [data-profile-tab="mine"]').click();
      document.getElementById('profile-titles')?.scrollIntoView({block: 'start'});
      document.getElementById('profile-coupon-picker')?.focus({preventScroll:true});
    });
  }

  const previousProfilePage = profilePage;
  profilePage = async function(version) {
    const user = state.profile.id;
    const styleRequest = state.demo ? Promise.resolve([]) : lifeRows('jj_profile_style');
    const couponRequest = state.demo ? Promise.resolve([]) : hub('coupons');
    const partnerRequest = state.demo ? Promise.resolve(null) : hub('partner');
    const profileData = Promise.allSettled([styleRequest, couponRequest, partnerRequest]);
    await previousProfilePage(version);
    if (version !== state.version || state.profile?.id !== user) return;
    const root = $('#main');
    const pair = root.querySelector('.profile-pair');
    if (!pair) return;
    const [styles, coupons, matches] = await profileData;
    if (version !== state.version || state.profile?.id !== user) return;

    const cards = [...pair.children];
    const mineCard = cards.find(card => card.dataset.titleOwner === user);
    const partnerCard = cards.find(card => card.dataset.titleOwner !== user);
    const partner = LIFE.profiles.find(profile => profile.id !== user);
    const tabs = [
      ['mine','Mi perfil','My profile'],
      ['partner',partner?.display_name || 'Su perfil',partner?.display_name || 'Their profile'],
      ['menus','Menús y ajustes','Menus & settings'],
      ['warehouse','Espacio interdimensional','Interdimensional space']
    ];
    const navigation = document.createElement('nav');
    navigation.className = 'profile-hub-tabs';
    navigation.setAttribute('aria-label', say('Menú de perfiles','Profile menu'));
    navigation.innerHTML = tabs.map(([id, es, en]) =>
      `<button type="button" data-profile-tab="${id}" aria-pressed="false" aria-controls="profile-panel-${id}">${bi(esc(es),esc(en))}</button>`).join('');
    const heading = root.querySelector('.page-heading');
    if (heading) {
      heading.querySelector('h1').innerHTML = bi('Perfiles','Profiles');
      heading.querySelector('p')?.remove();
    }
    const panels = Object.fromEntries(tabs.map(([id]) => {
      const panel = document.createElement('section');
      panel.id = 'profile-panel-' + id;
      panel.className = 'profile-hub-panel';
      panel.hidden = true;
      root.append(panel);
      return [id,panel];
    }));
    if (mineCard) panels.mine.append(mineCard);
    if (partnerCard) panels.partner.append(partnerCard);
    const connectionPanels = [...root.querySelectorAll('.translation-settings,.spotify-profile,#yuki-profile-controls,#anniversary-profile,#section-controls')];
    for (const panel of connectionPanels) panels.menus.append(panel);
    const photoForm = root.querySelector('#profile-form');
    const titles = root.querySelector('#profile-titles');
    if (photoForm) panels.mine.append(photoForm);
    const mineStyle = styles.value?.find(style => style.user_id === user) || {};
    const partnerStyle = styles.value?.find(style => style.user_id === partner?.id) || {};
    styleCard(mineCard, mineStyle);
    styleCard(partnerCard, partnerStyle);
    appearance(panels.mine, mineCard, mineStyle, styles.status === 'fulfilled' && !state.demo);
    if (titles) {
      panels.mine.append(titles);
      discountTitles(titles, coupons.value || []);
    }
    if (partner && !state.demo) {
      const result = matches.value;
      panels.partner.insertAdjacentHTML('beforeend', `<section class="game-panel">
        <h2>${bi('Resultados VS','VS results')}</h2>
        <p>${bi('Partidas con apuesta registradas entre ustedes.','Recorded wager matches between you two.')}</p>
        ${result ? `<dl class="profile-match-stats">
          <div><dt>${bi('Ganadas','Won')}</dt><dd>${result.wins}</dd></div>
          <div><dt>${bi('Perdidas','Lost')}</dt><dd>${result.losses}</dd></div>
          <div><dt>${bi('Empates','Ties')}</dt><dd>${result.draws}</dd></div>
        </dl>` : `<p role="status">${bi('No pudimos cargar los resultados.','Could not load match results.')}</p>`}</section>`);
    }
    if (!panels.menus.querySelector('#section-controls')) {
      panels.menus.insertAdjacentHTML('afterbegin', `<section class="game-panel"><h2>${bi('Tus menús visibles','Your visible menus')}</h2><ul class="profile-visible-menus">${menus.filter(([id]) =>
        sectionAllowed(id) && !['musicalbums','streamclips','puzzles','secretpuzzle','truth','bombitas','music','playlists','videos'].includes(id)
      ).map(([id,,label]) => {
        const name = UniverseI18n.language === 'en' ? (document.querySelector('[data-nav="' + CSS.escape(id) + '"] .lang-en')?.textContent || label) : label;
        return `<li><button class="btn secondary" type="button" data-profile-route="${esc(id)}">${esc(name)}</button></li>`;
      }).join('')}</ul></section>`);
      panels.menus.querySelectorAll('[data-profile-route]').forEach(button => {
        button.onclick = () => navigate(button.dataset.profileRoute);
      });
    }
    warehouse(panels.warehouse, coupons.value, !!titles?.querySelector('#profile-coupon-picker'));
    pair.replaceWith(navigation);
    function selectTab(tab) {
      selectedTabs.set(user, tab);
      for (const [id, panel] of Object.entries(panels)) panel.hidden = id !== tab;
      navigation.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.profileTab === tab)));
    }
    navigation.querySelectorAll('button').forEach(button => {
      button.onclick = () => selectTab(button.dataset.profileTab);
    });
    selectTab(selectedTabs.get(user) || 'mine');
  };

  const previousMissionPage = missionPage;
  missionPage = async function(version) {
    const user = state.profile.id;
    const weekly = state.demo ? Promise.resolve(null) : hub('weekly').catch(() => null);
    await previousMissionPage(version);
    const data = await weekly;
    if (version !== state.version || state.profile?.id !== user) return;
    const root = $('#main');
    const section = document.createElement('section');
    section.className = 'game-panel weekly-route';
    root.querySelector('.page-heading').after(section);
    const paint = route => {
      section.innerHTML = `<h2>${bi('Ruta semanal','Weekly route')}</h2>${route ? `
        <p>${route.required ? bi('Completa ' + route.required + ' retos de distintos apartados para ganar un cupón sorpresa.','Complete ' + route.required + ' challenges in different sections to earn a surprise coupon.') :
          bi('Por ahora no hay retos disponibles para tu perfil.','There are no available challenges for your profile yet.')}</p>
        <p><strong>${Math.min(route.completed,route.required)} / ${route.required}</strong> · ${bi('Próxima ruta','Next route')} ${jjDate(route.week_end)}</p>
        <div class="weekly-tasks">${route.tasks.map(task => {
          const copy = taskCopy[task.id];
          if (!copy) return '';
          const done = task.progress >= task.target;
          return `<article class="weekly-task"><h3>${bi(copy[0],copy[1])}</h3><p>${bi(copy[2],copy[3])}</p>
            <progress aria-label="${esc(say(copy[0],copy[1]))}" max="${task.target}" value="${Math.min(task.target,task.progress)}"></progress>
            <div><span>${Math.min(task.target,task.progress)} / ${task.target}</span>
            ${done ? `<strong>${bi('Completado','Complete')}</strong>` : `<button class="btn secondary" type="button" data-weekly-route="${esc(task.route)}">${bi('Ir al reto','Open challenge')}</button>`}</div></article>`;
        }).join('')}</div>
        <div class="profile-hub-links">${route.percent ?
          `<strong>${route.percent}% · ${bi('Cupón conseguido','Coupon earned')}</strong>` :
          route.required && route.completed >= route.required ? jjButton('weekly-claim','Revelar cupón','Reveal coupon') : ''}
        ${jjButton('weekly-warehouse','Ver mis cupones','See my coupons','btn secondary')}</div>
        ${route.required && !route.percent ? `<p class="hint">${bi('Revela tu cupón antes de que cambie la semana. Una vez guardado, nunca vence.','Reveal your coupon before the week changes. Once saved, it never expires.')}</p>` : ''}
        <p role="status"></p>` : `<p>${bi(state.demo ? 'Juega desde tu perfil para ganar cupones.' : 'No pudimos cargar la ruta semanal. Vuelve a abrir Misiones para reintentar.',
        state.demo ? 'Play from your account to earn coupons.' : 'Could not load the weekly route. Reopen Missions to retry.')}</p>`}`;
      section.querySelectorAll('[data-weekly-route]').forEach(button => {
        button.onclick = () => navigate(button.dataset.weeklyRoute);
      });
      section.querySelector('#weekly-warehouse')?.addEventListener('click', () => openTab('warehouse'));
      const claim = section.querySelector('#weekly-claim');
      if (claim) claim.onclick = async () => {
        claim.disabled = true;
        try {
          const result = await hub('claim');
          if (section.isConnected) paint(result);
        } catch {
          section.querySelector('[role="status"]').textContent = say('No se pudo revelar el cupón. Actualiza el progreso e inténtalo de nuevo.','Could not reveal the coupon. Refresh your progress and try again.');
          claim.disabled = false;
        }
      };
    };
    paint(data);
  };
})();
