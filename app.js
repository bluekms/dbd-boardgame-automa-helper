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
  const UNDO_DEPTH = 8;
  const SKILL_DIE_FACES = 6;
  const SKILL_DIE_FAIL = 0;
  const SKILL_DIE_GREAT = 5;
  const MAX_SKILL_DICE = 4;
  const POWER_BP = 4;
  const KILLER_BP_START = 4; // index.html 의 살인마 BP 입력 초기값과 같다
  const SURVIVOR_COUNTER_PREFIX = 'surv-';
  // 타일 공개 우선순위 바는 아직 공개되지 않은 타일이므로, 그 색이 될 수 있는
  // 두 타일 중 하나를 대표 아이콘으로 보여준다. 노란색은 발전기/출구 앞면 대신
  // 실제 뒷면 그래픽(tile-back-yellow.png)이 룰북에 있어 그걸 그대로 쓴다.
  const TILE_IMG = {
    red: 'resource/tile-back-red.png',
    green: 'resource/tile-back-green.png',
    yellow: 'resource/tile-back-yellow.png',
    blue: 'resource/tile-back-blue.png',
  };
  const KILLER_TILE_ORDER = ['red', 'green', 'yellow', 'blue'];
  const SURVIVOR_TILE_ORDER = ['yellow', 'blue', 'green', 'red'];
  const ANIM = { roll: 600, draw: 180, skill: 450, skillStagger: 220, skillReset: 160, skillSummary: 320, toast: 2200 };

  const LOCALES = window.DBD_LOCALES || {};
  const $ = id => document.getElementById(id);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const rand = n => Math.floor(Math.random() * n);
  const range = n => Array.from({ length: n }, (_, i) => i + 1);
  const killerPortrait = k => `resource/killer-${k}.png`;
  const survivorPortrait = s => `resource/survivor-${s}.png`;
  const survivorCounterName = s => SURVIVOR_COUNTER_PREFIX + s;
  const survivorOfCounter = name => name.slice(SURVIVOR_COUNTER_PREFIX.length);
  const perSurvivor = value => Object.fromEntries(SURVIVORS.map(s => [s, value]));

  /* ---------------------------------------------------------------- 상태 */
  const state = {
    screen: 'home',
    lang: DEFAULT_LANG,
    killer: KILLERS[0],
    deck: [],
    drawHistory: [],
    busy: false,
    survivorBP: perSurvivor(0),
    survivorTouched: perSurvivor(false),
    survivorSacrifice: perSurvivor(true),
    survivorOrder: SURVIVORS.slice(),
    skillDice: { killer: 1, survivor: 1 },
    skillRollToken: { killer: 0, survivor: 0 },
  };

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function shuffleSurvivorOrder() {
    state.survivorOrder = shuffled(SURVIVORS);
    renderSurvivorCounters();
  }

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
    $('killer-portrait').src = killerPortrait(k);
    $('killer-bp-portrait').src = killerPortrait(k);
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
      prioRow(2, 'resource/icon-claw.png', t('kp.2'), t('kp.2s')),
      prioRow(3, 'resource/tile-generator.png', t('kp.3'), t('kp.3s')),
      prioRow(4, 'resource/tile-totem.png', t('kp.4'), t('kp.4s')),
      prioRow(5, 'resource/tile-crow.png', t('kp.5'), t('kp.5s')),
      prioRow(6, 'resource/tile-locker.png', t('kp.6'), t('kp.6s'), { extra: `<ul class="sub-list">${t('kp.6list')}</ul>` }),
      prioRow(7, killerPortrait(k), t('kp.7'), t('kp.7s'), { round: true }),
      `<div class="prio note">${t('kp.8')}</div>`,
    ].join('');
  }

  function renderSurvivorPanels() {
    $('survivor-power-body').innerHTML = SURVIVORS
      .map(s => `<div class="prio"><img src="${survivorPortrait(s)}" class="round" alt=""><div class="prio-body"><b>${t('surv.' + s)}</b>${t('spower.' + s)}</div></div>`)
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
      prioRow(8, null, t('sp.8'), t('sp.8s')),
      `<div class="prio note">${t('sp.9')}</div>`,
    ].join('');
  }

  function prioRow(num, img, title, sub, opts = {}) {
    const skip = opts.skip ? `<span class="skip">${opts.skip}</span>` : '';
    const note = opts.note ? `<br><small>${opts.note}</small>` : '';
    const icon = img ? `<img src="${img}" alt="" class="${opts.round ? 'round' : ''}">` : '';
    return `<div class="prio">
      <div class="prio-num">${num}</div>
      ${icon}
      <div class="prio-body"><b>${title}${skip}</b><span>${sub}</span>${note}${opts.extra || ''}</div>
    </div>`;
  }

  function survivorCardHtml(s) {
    const bp = state.survivorBP[s];
    const ready = bp >= POWER_BP;
    const hasToken = state.survivorSacrifice[s];
    const counter = survivorCounterName(s);
    return `<div class="counter ${ready ? 'power-ready' : ''}" id="surv-card-${s}">
        <div class="counter-label">
          <button class="sac-token ${hasToken ? '' : 'hidden'}" data-action="hide-sac" data-surv="${s}" aria-label="sacrifice token"><img src="resource/token-sacrifice.png" alt=""></button>
          <button class="portrait-toggle" data-action="show-sac" data-surv="${s}"><img class="round" src="${survivorPortrait(s)}" alt=""></button>
          <span>${t('surv.' + s)}</span>
        </div>
        <div class="counter-ctl">
          <button class="ctl-btn" data-action="count" data-counter="${counter}" data-delta="-1">&minus;</button>
          <input class="ctl-val" type="number" inputmode="numeric" min="0" max="6" value="${bp}" data-counter="${counter}">
          <button class="ctl-btn plus ${state.survivorTouched[s] ? '' : 'blink'}" data-action="count" data-counter="${counter}" data-delta="1">+</button>
        </div>
        <div class="counter-note ${ready ? 'power' : ''}">${ready ? t('ui.powerReady') : '&nbsp;'}</div>
      </div>`;
  }
  // blink 은 CSS에서 5회만 재생되지만, "이미 알렸음" 상태로 남겨두지 않으면 다른 이유로
  // 다시 그려질 때 처음부터 재생된다. 애니메이션이 자연히 끝나는 순간을 감지해 기록한다.
  function watchBlink(btn) {
    if (!btn || !btn.classList.contains('blink')) return;
    btn.addEventListener('animationend', () => {
      state.survivorTouched[survivorOfCounter(btn.dataset.counter)] = true;
    }, { once: true });
  }
  function renderSurvivorCounters() {
    $('survivor-counters').innerHTML = state.survivorOrder.map(survivorCardHtml).join('');
    qsa('.ctl-btn.plus.blink', $('survivor-counters')).forEach(watchBlink);
  }
  // 생존자 한 명의 카드만 다시 그린다. 전체를 innerHTML로 다시 그리면 다른 생존자의
  // 깜빡임(blink)까지 새 DOM으로 교체되어 애니메이션이 처음부터 재생되므로,
  // 건드린 생존자의 카드만 교체해 나머지의 깜빡임 진행을 건드리지 않는다.
  function updateSurvivorCard(s) {
    const el = $(`surv-card-${s}`);
    if (!el) { renderSurvivorCounters(); return; }
    el.outerHTML = survivorCardHtml(s);
    watchBlink(document.querySelector(`#surv-card-${s} .ctl-btn.plus`));
  }
  function setSacToken(s, visible) {
    state.survivorSacrifice[s] = visible;
    // 카드 전체를 다시 그리면(updateSurvivorCard) BP +버튼도 새 DOM으로 바뀌어, 아직 안
    // 건드린 생존자라면 본인의 깜빡임(blink)까지 불필요하게 재시작된다. 토큰 아이콘만 토글한다.
    const btn = document.querySelector(`#surv-card-${s} .sac-token`);
    if (btn) btn.classList.toggle('hidden', !visible);
  }

  function updateKillerBpNote() {
    const ready = counterValue('killer-bp') >= POWER_BP;
    const note = $('killer-bp-note');
    note.textContent = ready ? t('ui.huntReady') : '';
    note.classList.toggle('power', ready);
  }

  function renderSkillChecks() {
    ['killer', 'survivor'].forEach(who => {
      const n = state.skillDice[who];
      const countButtons = range(MAX_SKILL_DICE)
        .map(i => `<button class="${i === n ? 'on' : ''}" data-action="sc-count" data-who="${who}" data-n="${i}">${i}</button>`)
        .join('');
      $(`${who}-skillcheck`).innerHTML = `
        <div class="sc-row">
          <span class="sc-title">${t('ui.skillCheck')}</span>
          <div class="sc-count">${countButtons}</div>
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
    const res = $(`${who}-stage-result`);
    res.classList.add('hidden');
    res.innerHTML = '';
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
  function powerResultHtml(face) {
    const k = state.killer;
    return `<div class="power-result flip-in">
          <img src="${killerPortrait(k)}" alt="">
          <h3>${face} — ${t('killer.' + k)} · ${t('ui.power')}</h3>
          <span class="badge warn">${t('result.power')}</span>
          <div class="power-text">${t('power.' + k)}</div>
        </div>`;
  }
  function moveResultHtml(face, key) {
    // 0(뛰어내리기)은 스킬 체크의 실패 눈이라 룰북이 살인마 BP +1 을 함께 준다
    const bpBadge = key === 'vault'
      ? `<span class="badge bp"><img src="resource/icon-bp.png" alt="">${t('ui.bpPlus')}</span>` : '';
    return cardHtml(key, `${face} — ${t('card.' + key)}`) + bpBadge +
      `<div class="result-hint">${t('ui.rerollHint')}</div>`;
  }
  function rollMove() {
    animateStage('killer', ANIM.roll, () => {
      const face = rand(MOVE_FACES.length);
      const key = MOVE_FACES[face];
      if (key === 'power') {
        showStageResult('killer', powerResultHtml(face));
        return;
      }
      showStageResult('killer', moveResultHtml(face, key));
      if (key === 'vault') pulse('killer-bp');
    });
  }

  /* ---------------------------------------------------------------- 생존자 이동 카드 더미 */
  function newDeck() {
    return shuffled(DECK_CARDS.flatMap(c => Array(COPIES_PER_CARD).fill(c)));
  }
  function resetDeck() {
    state.deck = newDeck();
    state.drawHistory = [];
    updateDeckCount();
  }
  function undoDraw() {
    const prev = state.drawHistory.pop();
    if (!prev) return;
    state.deck = prev.deck;
    updateDeckCount();
    if (prev.html) showStageResult('survivor', prev.html); else resetStage('survivor');
    toast(t('ui.undone', { card: t('card.' + prev.card) }));
  }
  function updateDeckCount() {
    $('deck-count').textContent = t('ui.remaining', { n: state.deck.length });
  }
  function drawCard() {
    // 실수로 뽑았을 때 되돌릴 수 있도록 뽑기 전 더미와 화면을 남겨 둔다
    const snapshot = { deck: state.deck.slice(), html: $('survivor-stage-result').innerHTML };
    animateStage('survivor', ANIM.draw, () => {
      if (state.deck.length === 0) {
        state.deck = newDeck();
        toast(t('ui.deckReshuffled'));
      }
      const key = state.deck.pop();
      snapshot.card = key;
      state.drawHistory.push(snapshot);
      if (state.drawHistory.length > UNDO_DEPTH) state.drawHistory.shift();
      updateDeckCount();
      showStageResult('survivor', cardHtml(key, t('card.' + key), 'flip-card') +
        `<div class="result-hint">${t('ui.remaining', { n: state.deck.length })} · ${t('ui.tapAgainDraw')}</div>`);
    });
  }

  /* ---------------------------------------------------------------- 스킬 체크 주사위 */
  function dieResultClass(r) {
    if (r === SKILL_DIE_FAIL) return 'fail';
    if (r === SKILL_DIE_GREAT) return 'great';
    return '';
  }
  function showRollingDie(el) {
    el.className = 'sc-die rolling';
    el.innerHTML = '<img src="resource/die-black.png" alt="">';
  }
  function showDieFace(el, r) {
    el.className = `sc-die ${dieResultClass(r)} flip-in`;
    el.innerHTML = `<img src="resource/die-face-${r}.png" alt="${r}">`;
  }
  function skillCheckSummaryHtml(who, results) {
    const fails = results.filter(r => r === SKILL_DIE_FAIL).length;
    const greats = results.filter(r => r === SKILL_DIE_GREAT).length;
    const parts = [];
    if (fails) parts.push(`<span class="fail">${t('ui.scFail', { n: fails })}</span>`);
    if (greats) parts.push(`<span class="great">${t('ui.scGreat', { n: greats })}${who === 'killer' ? t('ui.scEscape') : ''}</span>`);
    if (!parts.length) parts.push(t('ui.scOk'));
    return { html: parts.join(' · '), fails };
  }
  function rollSkillCheck(who) {
    const n = state.skillDice[who];
    const dice = $(`${who}-sc-dice`);
    const summary = $(`${who}-sc-summary`);
    const results = Array.from({ length: n }, () => rand(SKILL_DIE_FACES));
    // 이전 굴리기에서 아직 안 끝난 예약(setTimeout)이 새 굴리기의 주사위를 덮어쓰지 않도록 세대 토큰을 발급한다
    const token = ++state.skillRollToken[who];
    const stale = () => state.skillRollToken[who] !== token;
    // 세대가 바뀌었거나 주사위 DOM 이 사라졌으면(개수 변경 등) 아무것도 하지 않는다
    const withDie = (i, fn) => {
      if (stale()) return;
      const el = $(`${who}-sc-die-${i}`);
      if (el) fn(el);
    };

    // 주사위 개수를 바꿨을 때와 똑같이, 먼저 완전히 비운 상태를 한 프레임 그린 뒤에 굴리기 연출을 시작한다
    dice.innerHTML = '';
    summary.textContent = '';
    void dice.offsetWidth; // 리플로우를 강제해 빈 상태가 실제로 화면에 찍히게 한다

    setTimeout(() => {
      if (stale()) return;
      dice.innerHTML = results.map((_, i) => `<div class="sc-die" id="${who}-sc-die-${i}"></div>`).join('');
      // 떨어지는 연출 자체를 슬롯머신처럼 하나씩 시차를 두고 시작한다
      results.forEach((r, i) => {
        const startDelay = i * ANIM.skillStagger;
        setTimeout(() => withDie(i, showRollingDie), startDelay);
        setTimeout(() => withDie(i, el => showDieFace(el, r)), startDelay + ANIM.skill);
      });
      setTimeout(() => {
        if (stale()) return;
        const { html, fails } = skillCheckSummaryHtml(who, results);
        summary.innerHTML = html;
        if (fails && who === 'killer') pulse('killer-bp');
      }, (n - 1) * ANIM.skillStagger + ANIM.skill + ANIM.skillSummary);
    }, ANIM.skillReset);
  }

  /* ---------------------------------------------------------------- 카운터 */
  function counterInput(name) {
    return document.querySelector(`.ctl-val[data-counter="${name}"]`);
  }
  function counterValue(name) {
    return +counterInput(name).value || 0;
  }
  function setCounter(name, value) {
    const inp = counterInput(name);
    if (!inp) return;
    const clamped = Math.max(+inp.min, Math.min(+inp.max, Number.isNaN(value) ? +inp.min : value));
    inp.value = clamped;
    if (name.startsWith(SURVIVOR_COUNTER_PREFIX)) {
      const s = survivorOfCounter(name);
      state.survivorBP[s] = clamped;
      state.survivorTouched[s] = true;
      updateSurvivorCard(s);
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
  function closeLangMenus() {
    qsa('.lang-menu').forEach(m => m.remove());
  }
  function closePanels() {
    qsa('.panel').forEach(p => p.classList.add('hidden'));
    qsa('.text-btn.active').forEach(b => b.classList.remove('active'));
    closeLangMenus();
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
    closeLangMenus();
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

  /* ---------------------------------------------------------------- 화면을 나갈 때 세션 초기화 */
  // 살인마/생존자 플레이 화면에서 뒤로 나가면, 그 사이 기록된 모든 진행 상황(카운터·주사위
  // 선택·덱·굴림 결과)을 지워 다음에 다시 들어왔을 때 항상 처음 상태로 시작하게 한다.
  function resetKillerSession() {
    setCounter('killer-bp', KILLER_BP_START);
    state.skillDice.killer = 1;
    renderSkillChecks();
    resetStage('killer');
  }
  function resetSurvivorSession() {
    state.survivorBP = perSurvivor(0);
    state.survivorSacrifice = perSurvivor(true);
    state.survivorTouched = perSurvivor(false);
    state.skillDice.survivor = 1;
    renderSurvivorCounters();
    renderSkillChecks();
    resetDeck();
    resetStage('survivor');
  }

  /* ---------------------------------------------------------------- 이벤트 */
  const ACTIONS = {
    'lang-menu': toggleLangMenu,
    'set-lang': el => setLang(el.dataset.lang),
    'go': el => {
      if (el.dataset.screen === 'survivors') shuffleSurvivorOrder();
      go(el.dataset.screen);
    },
    'back': () => {
      const guarded = state.screen === 'killer' || state.screen === 'survivors';
      if (guarded && !confirm(t('ui.confirmLeave'))) return;
      if (state.screen === 'killer') resetKillerSession();
      if (state.screen === 'survivors') resetSurvivorSession();
      history.back();
    },
    'pick-killer': el => { state.killer = el.dataset.killer; renderKiller(); resetStage('killer'); go('killer'); },
    'toggle': togglePanel,
    'count': el => {
      const name = el.dataset.counter;
      setCounter(name, counterValue(name) + +el.dataset.delta);
      // 블러드 포인트 증가를 알리던 깜빡임(pulse)은 실제로 증가 버튼을 누르면 바로 종료한다
      el.classList.remove('pulse');
    },
    'roll-move': rollMove,
    'draw-card': drawCard,
    'undo-draw': undoDraw,
    'reset-deck': () => { resetDeck(); resetStage('survivor'); toast(t('ui.deckReset')); },
    'sc-count': el => { state.skillDice[el.dataset.who] = +el.dataset.n; renderSkillChecks(); },
    'sc-roll': el => rollSkillCheck(el.dataset.who),
    'hide-sac': el => setSacToken(el.dataset.surv, false),
    'show-sac': el => setSacToken(el.dataset.surv, true),
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) { closeLangMenus(); return; }
    const handler = ACTIONS[el.dataset.action];
    if (!handler) return;
    // 패널이 스테이지 안에 겹쳐 있을 때 패널 터치가 주사위를 굴리지 않도록 한다
    if (el.dataset.action === 'roll-move' && e.target.closest('.panel')) return;
    handler(el);
    if (el.dataset.action !== 'lang-menu') closeLangMenus();
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
