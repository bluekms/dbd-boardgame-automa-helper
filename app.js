(() => {
  'use strict';

  /* ---------------------------------------------------------------- 상수 */
  const DEFAULT_LANG = 'en';
  const LANG_STORAGE_KEY = 'dbd-lang';
  const KILLERS = ['trapper', 'nurse', 'huntress', 'hillbilly'];
  const SURVIVORS = ['dwight', 'meg', 'jake', 'claudette'];
  const MOVE_FACES = ['vault', 'crouch', 'sneak', 'sprint', 'wait', 'power'];
  const DECK_CARDS = ['vault', 'crouch', 'sneak', 'sprint'];
  const COPIES_PER_CARD = 4;
  const SKILL_DIE_FAIL = 0;
  const SKILL_DIE_GREAT = 5;
  const POWER_BP = 4;
  const TILE_IMG = {
    red: 'resource/tile-hook.png',
    green: 'resource/tile-pallet.png',
    yellow: 'resource/tile-generator.png',
    blue: 'resource/tile-chest.png',
  };
  const KILLER_TILE_ORDER = ['red', 'green', 'yellow', 'blue'];
  const SURVIVOR_TILE_ORDER = ['yellow', 'blue', 'green', 'red'];
  const ANIM = { roll: 600, draw: 550, skill: 450, toast: 2200 };

  const LOCALES = window.DBD_LOCALES || {};
  const $ = id => document.getElementById(id);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const rand = n => Math.floor(Math.random() * n);

  /* ---------------------------------------------------------------- 상태 */
  const state = {
    screen: 'home',
    lang: DEFAULT_LANG,
    killer: KILLERS[0],
    deck: [],
    busy: false,
    survivorBP: Object.fromEntries(SURVIVORS.map(s => [s, 0])),
    survivorTouched: false,
    skillDice: { killer: 1, survivor: 1 },
  };

  /* ---------------------------------------------------------------- i18n */
  function loadLang() {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && LOCALES[saved]) state.lang = saved;
    } catch (e) { /* 저장소를 못 쓰는 환경이면 기본 언어 */ }
  }
  function saveLang() {
    try { localStorage.setItem(LANG_STORAGE_KEY, state.lang); } catch (e) { /* ignore */ }
  }
  function t(key, vars) {
    const cur = LOCALES[state.lang] && LOCALES[state.lang].strings;
    const base = LOCALES[DEFAULT_LANG] && LOCALES[DEFAULT_LANG].strings;
    let s = (cur && cur[key]) ?? (base && base[key]);
    if (s === undefined) { console.warn('[i18n] missing key:', key); s = key; }
    if (vars) Object.keys(vars).forEach(v => { s = s.split('{' + v + '}').join(vars[v]); });
    return s;
  }
  function setLang(code) {
    if (!LOCALES[code]) return;
    state.lang = code;
    saveLang();
    render();
    resetStage('killer');
    resetStage('survivor');
  }

  /* ---------------------------------------------------------------- 렌더 */
  function render() {
    document.documentElement.lang = state.lang;
    qsa('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    qsa('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    qsa('.lang-btn').forEach(b => { b.textContent = state.lang.toUpperCase(); });
    renderTilePriority();
    renderKiller();
    renderSurvivorPanels();
    renderSurvivorPriority();
    renderSurvivorCounters();
    renderSkillChecks();
    updateDeckCount();
    updateKillerBpNote();
  }

  function renderTilePriority() {
    const bar = order => order
      .map(c => `<img src="${TILE_IMG[c]}" alt="${c}">`)
      .join('<span class="gt">&gt;</span>');
    $('killer-tile-priority').innerHTML = bar(KILLER_TILE_ORDER);
    $('survivor-tile-priority').innerHTML = bar(SURVIVOR_TILE_ORDER);
  }

  function renderKiller() {
    const k = state.killer;
    $('killer-portrait').src = `resource/killer-${k}.png`;
    $('killer-name').textContent = t('killer.' + k);
    $('killer-power-title').textContent = `${t('killer.' + k)} — ${t('ui.power')}`;
    $('killer-power-body').innerHTML = t('power.' + k) + `<p class="muted">${t('power.note')}</p>`;
    $('killer-rules-body').innerHTML = t('krules');
    $('panel-killer-priority-body').innerHTML = [
      prioRow(1, 'resource/icon-pickup.png', t('kp.1'), t('kp.1s'), {
        note: t('kp.1n'),
        extra: `<button class="prio-more" data-action="toggle" data-panel="kp1more">${t('kp.1more')}</button>` +
               `<ul class="sub-list hidden" id="panel-kp1more">${t('kp.1list')}</ul>`,
      }),
      prioRow(2, 'resource/icon-attack.png', t('kp.2'), t('kp.2s')),
      prioRow(3, 'resource/tile-generator.png', t('kp.3'), t('kp.3s')),
      prioRow(4, 'resource/tile-totem.png', t('kp.4'), t('kp.4s')),
      prioRow(5, 'resource/tile-crow.png', t('kp.5'), t('kp.5s')),
      prioRow(6, 'resource/tile-locker.png', t('kp.6'), t('kp.6s'), { extra: `<ul class="sub-list">${t('kp.6list')}</ul>` }),
      prioRow(7, `resource/killer-${k}.png`, t('kp.7'), t('kp.7s'), { round: true }),
      `<div class="prio note">${t('kp.8')}</div>`,
    ].join('');
  }

  function renderSurvivorPanels() {
    $('survivor-power-body').innerHTML = SURVIVORS
      .map(s => `<div class="prio"><img src="resource/survivor-${s}.png" class="round" alt=""><div class="prio-body"><b>${t('surv.' + s)}</b>${t('spower.' + s)}</div></div>`)
      .join('') + `<p class="muted">${t('spower.note')}</p>`;
    $('survivor-items-body').innerHTML = t('items');
    $('survivor-rules-body').innerHTML = t('srules');
  }

  function renderSurvivorPriority() {
    $('panel-survivor-priority-body').innerHTML = [
      prioRow(1, 'resource/tile-hook.png', t('sp.1'), t('sp.1s'), { note: t('sp.1n') }),
      prioRow(2, 'resource/tile-generator.png', t('sp.2'), t('sp.2s'), { skip: t('sp.2skip') }),
      prioRow(3, 'resource/tile-exit.png', t('sp.3'), t('sp.3s'), { skip: t('sp.3skip') }),
      prioRow(4, 'resource/icon-attack.png', t('sp.4'), t('sp.4s')),
      prioRow(5, 'resource/tile-chest.png', t('sp.5'), t('sp.5s'), { skip: t('sp.5skip') }),
      prioRow(6, 'resource/tile-pallet.png', t('sp.6'), t('sp.6s')),
      prioRow(7, 'resource/tile-locker.png', t('sp.7'), t('sp.7s')),
      prioRow(8, 'resource/icon-bp.png', t('sp.8'), t('sp.8s')),
      `<div class="prio note">${t('sp.9')}</div>`,
    ].join('');
  }

  function prioRow(num, img, title, sub, opts = {}) {
    const skip = opts.skip ? `<span class="skip">${opts.skip}</span>` : '';
    const note = opts.note ? `<br><small>${opts.note}</small>` : '';
    return `<div class="prio">
      <div class="prio-num">${num}</div>
      <img src="${img}" alt="" class="${opts.round ? 'round' : ''}">
      <div class="prio-body"><b>${title}${skip}</b><span>${sub}</span>${note}${opts.extra || ''}</div>
    </div>`;
  }

  function renderSurvivorCounters() {
    $('survivor-counters').innerHTML = SURVIVORS.map(s => {
      const bp = state.survivorBP[s];
      const ready = bp >= POWER_BP;
      return `<div class="counter ${ready ? 'power-ready' : ''}">
        <div class="counter-label"><img class="round" src="resource/survivor-${s}.png" alt=""><span>${t('surv.' + s)}</span></div>
        <div class="counter-ctl">
          <button class="ctl-btn" data-action="count" data-counter="surv-${s}" data-delta="-1">&minus;</button>
          <input class="ctl-val" type="number" inputmode="numeric" min="0" max="6" value="${bp}" data-counter="surv-${s}">
          <button class="ctl-btn plus ${state.survivorTouched ? '' : 'blink'}" data-action="count" data-counter="surv-${s}" data-delta="1">+</button>
        </div>
        <div class="counter-note ${ready ? 'power' : ''}">${ready ? t('ui.powerReady') : '&nbsp;'}</div>
      </div>`;
    }).join('');
  }

  function updateKillerBpNote() {
    const bp = +counterInput('killer-bp').value || 0;
    const note = $('killer-bp-note');
    note.textContent = bp >= POWER_BP ? t('ui.huntReady') : '';
    note.classList.toggle('power', bp >= POWER_BP);
  }

  function renderSkillChecks() {
    ['killer', 'survivor'].forEach(who => {
      const n = state.skillDice[who];
      $(`${who}-skillcheck`).innerHTML = `
        <div class="sc-row">
          <span class="sc-title">${t('ui.skillCheck')}</span>
          <div class="sc-count">${[1, 2, 3, 4].map(i =>
            `<button class="${i === n ? 'on' : ''}" data-action="sc-count" data-who="${who}" data-n="${i}">${i}</button>`).join('')}</div>
          <button class="sc-roll" data-action="sc-roll" data-who="${who}">${t('ui.roll')}</button>
        </div>
        <div class="sc-dice" id="${who}-sc-dice"></div>
        <div class="sc-summary" id="${who}-sc-summary"></div>`;
    });
  }

  /* ---------------------------------------------------------------- 스테이지 (중앙 결과 영역) */
  function showStageResult(who, html) {
    $(`${who}-stage-idle`).classList.add('hidden');
    const res = $(`${who}-stage-result`);
    res.innerHTML = html;
    res.classList.remove('hidden');
  }
  function resetStage(who) {
    $(`${who}-stage-result`).classList.add('hidden');
    $(`${who}-stage-result`).innerHTML = '';
    $(`${who}-stage-idle`).classList.remove('hidden');
  }
  function animateStage(who, ms, done) {
    if (state.busy) return;
    state.busy = true;
    resetStage(who);
    const stage = $(`${who}-stage`);
    stage.classList.add('stage-rolling');
    setTimeout(() => {
      stage.classList.remove('stage-rolling');
      done();
      state.busy = false;
    }, ms);
  }
  function cardHtml(key, footer, anim = 'flip-in') {
    return `<div class="card-wrap ${anim}"><img src="resource/card-${key}.png" alt=""><div class="card-title">${t('card.' + key)}</div></div>
      <div class="card-label">${footer}<small>${t('card.' + key + 'Sub')}</small></div>`;
  }

  /* ---------------------------------------------------------------- 살인마 이동 주사위 */
  function rollMove() {
    animateStage('killer', ANIM.roll, () => {
      const face = rand(MOVE_FACES.length);
      const key = MOVE_FACES[face];
      if (key === 'power') {
        showStageResult('killer', `<div class="power-result flip-in">
          <img src="resource/killer-${state.killer}.png" alt="">
          <h3>${face} — ${t('killer.' + state.killer)} · ${t('ui.power')}</h3>
          <span class="badge warn">${t('result.power')}</span>
          <div class="power-text">${t('power.' + state.killer)}</div>
        </div>`);
        return;
      }
      // 0(뛰어내리기)은 스킬 체크의 실패 눈이라 룰북이 살인마 BP +1 을 함께 준다
      const bpBadge = key === 'vault'
        ? `<span class="badge bp"><img src="resource/icon-bp.png" alt="">${t('ui.bpPlus')}</span>` : '';
      showStageResult('killer', cardHtml(key, `${face} — ${t('card.' + key)}`) + bpBadge +
        `<div class="result-hint">${t('ui.rerollHint')}</div>`);
      if (key === 'vault') pulse('killer-bp');
    });
  }

  /* ---------------------------------------------------------------- 생존자 이동 카드 더미 */
  function newDeck() {
    const deck = DECK_CARDS.flatMap(c => Array(COPIES_PER_CARD).fill(c));
    for (let i = deck.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
  function resetDeck() {
    state.deck = newDeck();
    updateDeckCount();
  }
  function updateDeckCount() {
    $('deck-count').textContent = t('ui.remaining', { n: state.deck.length });
  }
  function drawCard() {
    animateStage('survivor', ANIM.draw, () => {
      if (state.deck.length === 0) {
        resetDeck();
        toast(t('ui.deckReshuffled'));
      }
      const key = state.deck.pop();
      updateDeckCount();
      showStageResult('survivor', cardHtml(key, t('card.' + key), 'flip-card') +
        `<div class="result-hint">${t('ui.remaining', { n: state.deck.length })} · ${t('ui.tapAgainDraw')}</div>`);
    });
  }

  /* ---------------------------------------------------------------- 스킬 체크 주사위 */
  function rollSkillCheck(who) {
    const n = state.skillDice[who];
    const dice = $(`${who}-sc-dice`);
    const summary = $(`${who}-sc-summary`);
    const results = Array.from({ length: n }, () => rand(6));
    dice.innerHTML = results.map(() => '<div class="sc-die rolling">?</div>').join('');
    summary.textContent = '';
    setTimeout(() => {
      dice.innerHTML = results.map(r => {
        if (r === SKILL_DIE_FAIL) return '<div class="sc-die fail flip-in"><img src="resource/icon-skull.png" alt="0"></div>';
        if (r === SKILL_DIE_GREAT) return '<div class="sc-die great flip-in"><img src="resource/icon-claw.png" alt="5"></div>';
        return `<div class="sc-die flip-in">${r}</div>`;
      }).join('');
      const fails = results.filter(r => r === SKILL_DIE_FAIL).length;
      const greats = results.filter(r => r === SKILL_DIE_GREAT).length;
      const parts = [];
      if (fails) parts.push(`<span class="fail">${t('ui.scFail', { n: fails })}</span>`);
      if (greats) parts.push(`<span class="great">${t('ui.scGreat', { n: greats })}${n > 1 ? t('ui.scEscape') : ''}</span>`);
      if (!parts.length) parts.push(t('ui.scOk'));
      summary.innerHTML = parts.join(' · ');
      if (fails && who === 'killer') pulse('killer-bp');
    }, ANIM.skill);
  }

  /* ---------------------------------------------------------------- 카운터 */
  function counterInput(name) {
    return document.querySelector(`.ctl-val[data-counter="${name}"]`);
  }
  function setCounter(name, value) {
    const inp = counterInput(name);
    if (!inp) return;
    const clamped = Math.max(+inp.min, Math.min(+inp.max, Number.isNaN(value) ? +inp.min : value));
    inp.value = clamped;
    if (name.startsWith('surv-')) {
      state.survivorBP[name.slice(5)] = clamped;
      state.survivorTouched = true;
      renderSurvivorCounters();
    } else if (name === 'sacrifice') {
      qsa('#counter-sacrifice .blink').forEach(b => b.classList.remove('blink'));
    } else if (name === 'killer-bp') {
      updateKillerBpNote();
    }
  }
  function pulse(name) {
    const btn = document.querySelector(`.ctl-btn.plus[data-counter="${name}"]`);
    if (!btn) return;
    btn.classList.remove('pulse');
    void btn.offsetWidth;
    btn.classList.add('pulse');
  }

  /* ---------------------------------------------------------------- 화면 전환 */
  function show(screen) {
    state.screen = screen;
    qsa('.screen').forEach(s => s.classList.toggle('hidden', s.id !== 'screen-' + screen));
    closePanels();
    window.scrollTo(0, 0);
  }
  function go(screen) {
    history.pushState({ s: screen }, '');
    show(screen);
  }
  function closePanels() {
    qsa('.panel').forEach(p => p.classList.add('hidden'));
    qsa('.text-btn.active').forEach(b => b.classList.remove('active'));
    qsa('.lang-menu').forEach(m => m.remove());
  }
  function togglePanel(btn) {
    const panel = $('panel-' + btn.dataset.panel);
    if (!panel) return;
    const opened = panel.classList.toggle('hidden') === false;
    if (btn.classList.contains('acc-head')) btn.classList.toggle('open', opened);
    if (btn.classList.contains('text-btn')) {
      // 상단 패널(규칙·아이템)은 한 번에 하나만 연다
      qsa('.panel').forEach(p => { if (p !== panel) p.classList.add('hidden'); });
      qsa('.text-btn.active').forEach(b => b.classList.remove('active'));
      btn.classList.toggle('active', opened);
    }
  }
  function toggleLangMenu(btn) {
    const existing = btn.parentElement.querySelector('.lang-menu');
    if (existing) { existing.remove(); return; }
    qsa('.lang-menu').forEach(m => m.remove());
    const menu = document.createElement('div');
    menu.className = 'lang-menu';
    menu.innerHTML = Object.keys(LOCALES).map(code =>
      `<button data-action="set-lang" data-lang="${code}" class="${code === state.lang ? 'on' : ''}">${LOCALES[code].name}</button>`).join('');
    btn.parentElement.appendChild(menu);
  }

  /* ---------------------------------------------------------------- 토스트 */
  let toastTimer = 0;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), ANIM.toast);
  }

  /* ---------------------------------------------------------------- 이벤트 */
  const ACTIONS = {
    'lang-menu': el => toggleLangMenu(el),
    'set-lang': el => setLang(el.dataset.lang),
    'go': el => go(el.dataset.screen),
    'back': () => history.back(),
    'pick-killer': el => { state.killer = el.dataset.killer; renderKiller(); resetStage('killer'); go('killer'); },
    'toggle': el => togglePanel(el),
    'count': el => setCounter(el.dataset.counter, (+counterInput(el.dataset.counter).value || 0) + +el.dataset.delta),
    'roll-move': () => rollMove(),
    'draw-card': () => drawCard(),
    'draw-again': () => drawCard(),
    'reset-deck': () => { resetDeck(); resetStage('survivor'); toast(t('ui.deckReset')); },
    'sc-count': el => { state.skillDice[el.dataset.who] = +el.dataset.n; renderSkillChecks(); },
    'sc-roll': el => rollSkillCheck(el.dataset.who),
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) { qsa('.lang-menu').forEach(m => m.remove()); return; }
    const handler = ACTIONS[el.dataset.action];
    if (!handler) return;
    // 패널이 스테이지 안에 겹쳐 있을 때 패널 터치가 주사위를 굴리지 않도록 한다
    if (el.dataset.action === 'roll-move' && e.target.closest('.panel')) return;
    handler(el);
    if (el.dataset.action !== 'lang-menu') qsa('.lang-menu').forEach(m => m.remove());
  });
  document.addEventListener('change', e => {
    const inp = e.target.closest('.ctl-val');
    if (inp) setCounter(inp.dataset.counter, parseInt(inp.value, 10));
  });
  document.addEventListener('focusin', e => {
    const inp = e.target.closest('.ctl-val');
    if (inp) inp.select();
  });

  // 브라우저 뒤로가기는 앱 내 화면 이동으로만 동작시키고, 플레이 중 새로고침·닫기는 확인을 거친다
  window.addEventListener('popstate', e => show((e.state && e.state.s) || 'home'));
  window.addEventListener('beforeunload', e => {
    if (state.screen === 'home') return;
    e.preventDefault();
    e.returnValue = '';
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r')) e.preventDefault();
  });

  /* ---------------------------------------------------------------- 시작 */
  history.replaceState({ s: 'home' }, '');
  loadLang();
  resetDeck();
  render();
  show('home');
})();
