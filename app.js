/* DbD Board Game Automa Helper — plain JS, no build step. */
(() => {
  'use strict';

  /* ---------------------------------------------------------------- i18n */
  const I18N = {
    en: {
      'app.title': 'DbD Board Game Automa Helper',
      'app.sub': 'Dice, cards and reminders for solo play',
      'app.foot': 'Dead by Daylight™: The Board Game — Level 99 Games / Behaviour Interactive. Fan-made helper.',
      'home.killer': 'Automa Killer',
      'home.killerSub': 'You play the 4 Survivors',
      'home.survivors': 'Automa Survivors',
      'home.survivorsSub': 'You play the Killer',
      'select.killerPrompt': 'Choose the Automa Killer',
      'killer.trapper': 'The Trapper',
      'killer.nurse': 'The Nurse',
      'killer.huntress': 'The Huntress',
      'killer.hillbilly': 'The Hillbilly',
      'surv.dwight': 'Dwight', 'surv.meg': 'Meg', 'surv.jake': 'Jake', 'surv.claudette': 'Claudette',
      'ui.rules': 'Rules', 'ui.items': 'Items', 'ui.tapToClose': 'Tap to close', 'ui.revealTiles': 'Reveal tiles',
      'ui.bp': 'Bloodpoints', 'ui.sacrifice': 'Sacrifice track',
      'ui.sacrificeHint': 'Start: place 0–3 tokens (more = harder)',
      'ui.tapToRoll': 'Tap to roll the movement die',
      'ui.tapToDraw': 'Tap to draw a movement card',
      'ui.interactionPriority': 'Interaction priority',
      'ui.survivorPowers': 'Automa Survivor powers',
      'ui.drawAgain': 'Path unavailable → draw another',
      'ui.resetDeck': 'Reset deck',
      'ui.deckReshuffled': 'Discard pile reshuffled into a new deck',
      'ui.deckReset': 'Deck reset (16 cards)',
      'ui.power': 'Power',
      'ui.powerReady': 'BP ≥ 4 → use power!',
      'ui.huntReady': 'BP ≥ 4 after 2nd turn → Hunt!',
      'ui.skillCheck': 'Skill check',
      'ui.roll': 'Roll',
      'ui.scFail': 'Failure ×{n} → Killer +{n} BP',
      'ui.scGreat': 'Great success ×{n}',
      'ui.scEscape': ' (carried Survivor escapes)',
      'ui.scOk': 'All succeeded',
      'ui.bpPlus': 'BP +1',
      'ui.tapAgain': 'Tap again to roll again',
      'ui.tapAgainDraw': 'Tap to draw the next card',
      'ui.remaining': '{n} left',
      'ui.rerollHint': 'No matching path or same as previous turn? Roll again.',
      'card.vault': 'Vault', 'card.crouch': 'Crouch', 'card.sneak': 'Sneak', 'card.sprint': 'Sprint', 'card.wait': 'Wait',
      'card.vaultSub': 'yellow · one-way path', 'card.crouchSub': 'red path', 'card.sneakSub': 'blue path', 'card.sprintSub': 'green path',
      'card.waitSub': 'stay and interact here',
      'result.power': 'Use power instead of moving and interacting',
      'surv.forcedMove': '<b>Before revealing the card:</b> if a connected space has a <b>hooked Survivor</b> or a <b>powered Exit Gate</b>, ignore the card and move there.',
      /* killer power texts */
      'power.trapper': '<p>All Survivors in spaces connected to a path with a <b>bear trap</b> become wounded.</p><p>Then place 1 bear trap on a connected path that has no pallet or other component.</p><p>If all 4 bear traps are already on the board, gain <b>2 BP</b> instead.</p>',
      'power.nurse': '<p>Spend <b>3 BP</b> to <b>Hunt</b> (extra move + interaction, see Rules).</p><p>During this Hunt she may move against one-way paths and ignores pallets and breakable walls.</p><p>If she has fewer than 3 BP, gain <b>1 BP</b> instead.</p>',
      'power.huntress': '<p>One Survivor in a <b>connected space</b> becomes wounded.</p><p>If there is no Survivor in a connected space, gain <b>1 BP</b> instead.</p>',
      'power.hillbilly': '<p>Gain <b>1 BP</b>. Roll a skill check die and move along the matching path (reroll on 4 or 5).</p><p>One Survivor in the destination space becomes wounded.</p><p>No interaction after this move.</p>',
      'power.note': 'The Automa Killer may use its power any number of times per round. It never uses the perks, power or passive printed on its board.',
      /* killer rules panel */
      'krules': `
<h3>Automa Killer rules</h3>
<h4>Reroll</h4>
<ul>
<li>If there is no path of that colour from this space → roll again.</li>
<li>If the result is the same as the previous turn this round → roll again.</li>
<li>A 0 (Vault) also gives the Killer <b>+1 BP</b>, as a failed roll.</li>
</ul>
<h4>Notes</h4>
<ul>
<li>Several paths of the same colour → take the one whose destination offers the higher interaction priority.</li>
<li><b>Pallet</b> on the path: remove the pallet, stay in place, no interaction this turn.</li>
<li><b>Breakable wall</b> on the path: remove the wall and move normally.</li>
<li>Reveal one face-down tile in the new space: <b>red → green → yellow → blue</b>.</li>
</ul>
<h4>Hunt (bonus turn)</h4>
<ul>
<li>After the 2nd turn, if the Killer has <b>4+ BP</b>, it spends 4 BP and Hunts.</li>
<li>Look at all connected spaces and move to the one offering the <b>highest interaction priority</b>, then interact there.</li>
<li>Once per round (the Nurse's power is a separate 3-BP Hunt).</li>
</ul>
<h4>Ties</h4>
<ul><li>Compare move → interaction → tile priority. Still tied → you decide.</li></ul>
<h4>Setup</h4>
<ul><li>Killer starts with 4 BP and 0–3 sacrifice tokens on the track (more = harder).</li></ul>`,
      /* killer priority */
      'kp.1': 'Wounded Survivor', 'kp.1s': 'Pick up', 'kp.1n': 'Not a Survivor wounded this round',
      'kp.1more': 'Pick-up procedure ▾',
      'kp.1list': `<li>Prefer a Survivor who still holds their sacrifice token.</li>
<li>Empty hook in this space → sacrifice immediately.</li>
<li>Otherwise head for the <b>closest revealed empty hook</b>; the Survivor rolls that many skill check dice. Any great success → escapes.</li>
<li>No revealed hook → declare <b>4 dice</b> and move along the path that reveals the most <b>red tiles</b>; stop at the first hook revealed.</li>
<li>First time a Survivor is hooked, add their sacrifice token to the track.</li>`,
      'kp.2': 'Survivor', 'kp.2s': 'Attack (wound)',
      'kp.3': 'Generator with progress', 'kp.3s': 'Damage — remove all progress',
      'kp.4': 'Hex Totem', 'kp.4s': 'Venerate — BP +2',
      'kp.5': 'Crow', 'kp.5s': 'Remove tile — BP +1',
      'kp.6': 'Occupied locker', 'kp.6s': 'Search',
      'kp.6list': `<li>The hidden Survivor rolls a skill check.</li><li>Failure → picked up, wounded or not.</li><li>Success → remove the locker tile.</li>`,
      'kp.7': 'Nothing above', 'kp.7s': 'Use power',
      'kp.8': 'Ties: compare move → interaction → tile priority.',
      /* survivor powers */
      'spower.dwight': '<b>Dwight</b> — Every Survivor adds 1 progress to a generator in their own space.',
      'spower.meg': '<b>Meg</b> — Takes an extra bonus turn (draw a card, move, reveal, interact).',
      'spower.jake': '<b>Jake</b> — Remove one face-up empty hook anywhere. If none, refund 3 BP.',
      'spower.claudette': '<b>Claudette</b> — Every Survivor in her space and connected spaces (herself included) is healed. If nobody was wounded, refund 3 BP.',
      'spower.note': 'At the end of a Survivor\'s turn, if they have <b>4+ BP</b>, they spend 4 BP and use their power. Automa Survivors never use the perks on their boards.',
      /* survivor rules */
      'srules': `
<h3>Automa Survivor rules</h3>
<h4>Movement</h4>
<ul>
<li>Each Survivor draws 1 card face down in the planning phase (hooked Survivors draw none).</li>
<li><b>Forced move:</b> a connected space with a hooked Survivor or a powered Exit Gate → ignore the card and go there.</li>
<li>No path of that colour → keep drawing until a valid card appears; discard the rest. Survivors never lose a turn to a bad card.</li>
<li>Survivors walk over pallets freely. Breakable walls block them.</li>
<li>Reveal one face-down tile in the new space: <b>yellow → blue → green → red</b>.</li>
</ul>
<h4>Power</h4>
<ul><li>End of turn with <b>4+ BP</b> → spend 4 BP and use the Survivor's power.</li></ul>
<h4>Ties</h4>
<ul>
<li>When a Survivor must choose a path, draw cards until a valid path appears.</li>
<li>Same-colour paths → the destination with the higher interaction priority. Still tied → the Killer player decides.</li>
</ul>
<h4>Setup</h4>
<ul>
<li>Dwight, Meg, Jake, Claudette. Each starts with 0–4 BP (more = harder).</li>
<li>Deck: Vault, Crouch, Sneak, Sprint ×4 each = 16 cards. Reshuffle the discard pile when empty.</li>
<li>Automa Survivors ignore Crows and Hex Totems.</li>
</ul>`,
      /* survivor priority */
      'sp.1': 'Hooked Survivor', 'sp.1s': 'Sabotage the hook (rescue) — BP +1', 'sp.1n': 'Both may then move 1 path (draw to choose), no interaction',
      'sp.2': 'Generator', 'sp.2s': 'Repair — skill check (+1 / great +2)', 'sp.2skip': 'skip once the gates are powered',
      'sp.3': 'Exit Gate', 'sp.3s': 'Open — skill check (+1 only)', 'sp.3skip': 'skip until powered',
      'sp.4': 'Wounded Survivor', 'sp.4s': 'Heal — skill check',
      'sp.5': 'Chest', 'sp.5s': 'Rummage — draw an item', 'sp.5skip': 'skip if holding an item',
      'sp.6': 'Pallet', 'sp.6s': 'Drop on a connected path',
      'sp.7': 'Locker', 'sp.7s': 'Hide',
      'sp.8': 'Nothing above', 'sp.8s': 'BP +1',
      'sp.9': 'Ties: draw cards to choose a path; then higher interaction priority; then the Killer player decides.',
      /* items */
      'items': `
<table>
<tr><td>Broken Key</td><td>Discard at once. BP +1.</td></tr>
<tr><td>Dull Key</td><td>Discard at once. BP +2.</td></tr>
<tr><td>Skeleton Key</td><td>Discard at once. BP +3.</td></tr>
<tr><td>Firecracker</td><td>When the Killer would move into this Survivor's space: the move is prevented.</td></tr>
<tr><td>Med-Kit</td><td>As soon as a wounded Survivor is in this space: heal them.</td></tr>
<tr><td>Flashlight</td><td>When the Killer would interact in this Survivor's space: the interaction is prevented.</td></tr>
<tr><td>Map</td><td>Use at once: draw another item.</td></tr>
<tr><td>Rainbow Map</td><td>Use at once: reveal 3 face-down tiles anywhere (Survivor tile priority).</td></tr>
<tr><td>Toolbox</td><td>As soon as a generator is in this space: +1 progress.</td></tr>
<tr><td>Large Toolbox</td><td>As soon as a generator is in this space: +1 progress, then draw another item.</td></tr>
</table>
<p style="color:#a1958f;font-size:13px;margin:8px 0 0">Items are kept face up and used the moment their condition is met.</p>`,
    },
    ko: {
      'app.title': '데바데 보드게임 오토마 헬퍼',
      'app.sub': '1인 플레이용 주사위·카드·규칙 알림',
      'app.foot': 'Dead by Daylight™: The Board Game — Level 99 Games / Behaviour Interactive. 팬 제작 도우미.',
      'home.killer': '오토마 살인마',
      'home.killerSub': '내가 생존자 4명을 조종',
      'home.survivors': '오토마 생존자',
      'home.survivorsSub': '내가 살인마를 조종',
      'select.killerPrompt': '오토마 살인마를 고르세요',
      'killer.trapper': '트래퍼',
      'killer.nurse': '너스',
      'killer.huntress': '헌트리스',
      'killer.hillbilly': '힐빌리',
      'surv.dwight': '드와이트', 'surv.meg': '메그', 'surv.jake': '제이크', 'surv.claudette': '클로뎃',
      'ui.rules': '규칙', 'ui.items': '아이템', 'ui.tapToClose': '터치하면 닫힘', 'ui.revealTiles': '타일 공개',
      'ui.bp': '블러드 포인트', 'ui.sacrifice': '희생 진척',
      'ui.sacrificeHint': '시작 시 토큰 0~3개 배치 (많을수록 어려움)',
      'ui.tapToRoll': '터치해서 이동 주사위 굴리기',
      'ui.tapToDraw': '터치해서 이동 카드 뽑기',
      'ui.interactionPriority': '상호작용 우선순위',
      'ui.survivorPowers': '오토마 생존자 고유 능력',
      'ui.drawAgain': '경로 없음 → 1장 더',
      'ui.resetDeck': '더미 초기화',
      'ui.deckReshuffled': '버린 더미를 섞어 새 더미를 만들었습니다',
      'ui.deckReset': '더미를 초기화했습니다 (16장)',
      'ui.power': '고유 능력',
      'ui.powerReady': 'BP 4 이상 → 고유 능력!',
      'ui.huntReady': '2차례 후 BP 4 이상 → 탐색!',
      'ui.skillCheck': '스킬 체크',
      'ui.roll': '굴리기',
      'ui.scFail': '실패 ×{n} → 살인마 BP +{n}',
      'ui.scGreat': '대성공 ×{n}',
      'ui.scEscape': ' (업힌 생존자 탈출)',
      'ui.scOk': '모두 성공',
      'ui.bpPlus': 'BP +1',
      'ui.tapAgain': '다시 터치하면 다시 굴림',
      'ui.tapAgainDraw': '터치하면 다음 카드',
      'ui.remaining': '{n}장 남음',
      'ui.rerollHint': '해당 경로가 없거나 이전 차례와 같은 눈이면 다시 굴리세요.',
      'card.vault': '뛰어내리기', 'card.crouch': '웅크리기', 'card.sneak': '살금살금', 'card.sprint': '전력 질주', 'card.wait': '대기하기',
      'card.vaultSub': '노란색 · 단방향 경로', 'card.crouchSub': '빨간색 경로', 'card.sneakSub': '파란색 경로', 'card.sprintSub': '초록색 경로',
      'card.waitSub': '이동 없이 제자리에서 상호작용',
      'result.power': '이동·상호작용 대신 고유 능력 발동',
      'surv.forcedMove': '<b>카드를 공개하기 전에:</b> 연결된 장소에 <b>갈고리에 걸린 생존자</b>나 <b>전원이 들어온 출구</b>가 있으면 카드를 무시하고 그곳으로 이동.',
      'power.trapper': '<p><b>곰 덫</b>이 놓인 경로에 연결된 장소의 모든 생존자가 부상.</p><p>그 후 판자·다른 구성물이 없는 연결 경로에 곰 덫 1개 설치.</p><p>곰 덫 4개가 이미 모두 보드에 있으면 대신 <b>BP 2</b> 획득.</p>',
      'power.nurse': '<p><b>BP 3</b>을 내고 <b>탐색</b>(추가 이동 + 상호작용, 규칙 참조).</p><p>이 탐색 중에는 단방향 경로를 역방향으로 갈 수 있고 판자·부서지는 문을 무시.</p><p>BP가 3 미만이면 대신 <b>BP 1</b> 획득.</p>',
      'power.huntress': '<p><b>연결된 장소</b>의 생존자 1명이 부상.</p><p>연결된 장소에 생존자가 없으면 대신 <b>BP 1</b> 획득.</p>',
      'power.hillbilly': '<p><b>BP 1</b> 획득. 스킬 체크 주사위를 굴려 그 색 경로로 이동(4·5는 재굴림).</p><p>도착 장소의 생존자 1명이 부상.</p><p>이 이동 후에는 상호작용하지 않음.</p>',
      'power.note': '오토마 살인마는 고유 능력을 한 라운드에 몇 번이든 쓸 수 있습니다. 개인 보드의 전승 기술·고유 능력·지속 효과는 사용하지 않습니다.',
      'krules': `
<h3>오토마 살인마 규칙</h3>
<h4>재굴림 조건</h4>
<ul>
<li>나온 색의 경로가 이 장소에 없으면 다시 굴린다.</li>
<li>이번 라운드 이전 차례에 이동한 결과와 같은 눈이면 다시 굴린다.</li>
<li>0(뛰어내리기)은 실패 눈이므로 살인마가 <b>BP +1</b>도 얻는다.</li>
</ul>
<h4>일러두기</h4>
<ul>
<li>같은 색 경로가 여럿이면 목적지에서 할 수 있는 상호작용 순위가 높은 쪽으로 이동.</li>
<li><b>판자</b>가 놓인 경로: 판자 타일 제거 후 제자리. 이 차례 상호작용 없음.</li>
<li><b>부서지는 문</b>: 문 토큰 제거 후 정상 이동.</li>
<li>새 장소의 뒷면 타일 1개 공개: <b>빨 → 초 → 노 → 파</b>.</li>
</ul>
<h4>탐색 (보너스 차례)</h4>
<ul>
<li>2차례가 끝났을 때 <b>BP 4 이상</b>이면 BP 4를 내고 탐색.</li>
<li>연결된 모든 장소 중 <b>상호작용 순위가 가장 높은 곳</b>으로 이동해 상호작용.</li>
<li>라운드당 1회 (너스 고유 능력은 별도의 BP 3 탐색).</li>
</ul>
<h4>동률</h4>
<ul><li>이동 → 상호작용 → 타일 우선순위 순으로 비교. 그래도 같으면 플레이어가 결정.</li></ul>
<h4>준비</h4>
<ul><li>살인마 BP 4로 시작, 희생 진척 토큰 0~3개를 트랙에 미리 배치(많을수록 어려움).</li></ul>`,
      'kp.1': '부상당한 생존자', 'kp.1s': '둘러업기', 'kp.1n': '이번 라운드에 부상 입은 생존자는 제외',
      'kp.1more': '둘러업기 절차 ▾',
      'kp.1list': `<li>희생 진척 토큰을 아직 가진 생존자를 우선.</li>
<li>같은 장소에 빈 갈고리 → 즉시 희생.</li>
<li>없으면 <b>가장 가까운 공개된 빈 갈고리</b>로. 그 칸 수만큼 생존자가 스킬 체크 주사위를 굴려 대성공이 하나라도 나오면 탈출.</li>
<li>공개된 갈고리가 없으면 <b>주사위 4개</b>를 선언하고 <b>빨간 타일</b>을 가장 많이 공개하는 경로로 이동, 처음 공개된 갈고리에서 멈춤.</li>
<li>생존자가 처음 희생될 때 그 생존자의 희생 진척 토큰을 트랙에 추가.</li>`,
      'kp.2': '생존자', 'kp.2s': '공격 (부상)',
      'kp.3': '수리가 진행된 발전기', 'kp.3s': '손상 — 수리 토큰 모두 제거',
      'kp.4': '저주 토템', 'kp.4s': '숭배 — BP +2',
      'kp.5': '까마귀', 'kp.5s': '타일 제거 — BP +1',
      'kp.6': '생존자가 숨은 사물함', 'kp.6s': '탐색',
      'kp.6list': `<li>숨은 생존자가 스킬 체크.</li><li>실패 → 부상 여부와 무관하게 둘러업기.</li><li>성공 → 사물함 타일 제거.</li>`,
      'kp.7': '위 항목이 없음', 'kp.7s': '고유 능력 발동',
      'kp.8': '동률이면 이동 → 상호작용 → 타일 우선순위 순서로 비교.',
      'spower.dwight': '<b>드와이트</b> — 생존자 4명 각자가 자기 장소의 발전기에 수리 토큰 1개 추가.',
      'spower.meg': '<b>메그</b> — 추가 보너스 차례 (카드 뽑기 → 이동 → 타일 공개 → 상호작용).',
      'spower.jake': '<b>제이크</b> — 보드 어디든 앞면 빈 갈고리 1개 제거. 없으면 BP 3 환급.',
      'spower.claudette': '<b>클로뎃</b> — 클로뎃의 장소와 연결된 장소의 모든 생존자(본인 포함) 치료. 부상자가 없었으면 BP 3 환급.',
      'spower.note': '생존자 차례가 끝났을 때 <b>BP 4 이상</b>이면 BP 4를 내고 고유 능력을 씁니다. 오토마 생존자는 개인 보드의 전승 기술을 사용하지 않습니다.',
      'srules': `
<h3>오토마 생존자 규칙</h3>
<h4>이동</h4>
<ul>
<li>계획 단계에 생존자마다 카드 1장을 뒷면으로 뽑는다(갈고리에 걸린 생존자는 제외).</li>
<li><b>강제 이동:</b> 연결된 장소에 걸린 생존자나 전원이 들어온 출구가 있으면 카드를 무시하고 그곳으로.</li>
<li>그 색 경로가 없으면 유효한 카드가 나올 때까지 계속 뽑고 나머지는 버린다. 이동 실패로 차례를 잃지 않는다.</li>
<li>판자는 자유롭게 통과. 부서지는 문은 통과 불가.</li>
<li>새 장소의 뒷면 타일 1개 공개: <b>노 → 파 → 초 → 빨</b>.</li>
</ul>
<h4>고유 능력</h4>
<ul><li>차례 종료 시 <b>BP 4 이상</b> → BP 4를 내고 그 생존자의 고유 능력.</li></ul>
<h4>동률</h4>
<ul>
<li>생존자가 경로를 골라야 하면 유효한 경로가 나올 때까지 카드를 뽑는다.</li>
<li>같은 색 경로 → 상호작용 순위가 높은 목적지. 그래도 같으면 살인마 플레이어가 결정.</li>
</ul>
<h4>준비</h4>
<ul>
<li>드와이트·메그·제이크·클로뎃. 각 BP 0~4로 시작(많을수록 어려움).</li>
<li>더미: 뛰어내리기·웅크리기·살금살금·전력 질주 각 4장 = 16장. 비면 버린 더미를 섞는다.</li>
<li>오토마 생존자는 까마귀·저주 토템을 무시한다.</li>
</ul>`,
      'sp.1': '갈고리에 걸린 생존자', 'sp.1s': '갈고리 파괴(구출) — BP +1', 'sp.1n': '둘 다 경로 1칸 이동 가능(카드로 결정), 상호작용 없음',
      'sp.2': '발전기', 'sp.2s': '수리 — 스킬 체크 (+1 / 대성공 +2)', 'sp.2skip': '출구 활성화 후 건너뜀',
      'sp.3': '출구', 'sp.3s': '개방 — 스킬 체크 (+1만)', 'sp.3skip': '활성화 전 건너뜀',
      'sp.4': '부상당한 생존자', 'sp.4s': '치료 — 스킬 체크',
      'sp.5': '상자', 'sp.5s': '뒤적거리기 — 아이템 획득', 'sp.5skip': '아이템 보유 시 건너뜀',
      'sp.6': '판자', 'sp.6s': '연결 경로에 내리기',
      'sp.7': '사물함', 'sp.7s': '숨기',
      'sp.8': '위 항목이 없음', 'sp.8s': 'BP +1',
      'sp.9': '동률이면 카드를 뽑아 경로 결정 → 상호작용 순위 → 살인마 플레이어가 결정.',
      'items': `
<table>
<tr><td>부러진 열쇠</td><td>즉시 버리고 BP +1.</td></tr>
<tr><td>무딘 열쇠</td><td>즉시 버리고 BP +2.</td></tr>
<tr><td>만능 열쇠</td><td>즉시 버리고 BP +3.</td></tr>
<tr><td>폭죽</td><td>살인마가 이 생존자의 장소로 이동하려 할 때: 그 이동을 막는다.</td></tr>
<tr><td>구급상자</td><td>이 장소에 부상자가 있는 순간: 치료.</td></tr>
<tr><td>손전등</td><td>살인마가 이 생존자의 장소에서 상호작용하려 할 때: 그 상호작용을 막는다.</td></tr>
<tr><td>지도</td><td>즉시 사용: 아이템 1장 더 뽑기.</td></tr>
<tr><td>무지개 지도</td><td>즉시 사용: 보드 아무 곳의 뒷면 타일 3개 공개(생존자 타일 우선순위).</td></tr>
<tr><td>공구상자</td><td>이 장소에 발전기가 있는 순간: 수리 토큰 +1.</td></tr>
<tr><td>대형 공구상자</td><td>이 장소에 발전기가 있는 순간: 수리 토큰 +1 후 아이템 1장 더 뽑기.</td></tr>
</table>
<p style="color:#a1958f;font-size:13px;margin:8px 0 0">아이템은 앞면으로 두고 조건이 충족되는 순간 즉시 사용합니다.</p>`,
    },
  };

  let lang = 'en';
  try { lang = localStorage.getItem('dbd-lang') === 'ko' ? 'ko' : 'en'; } catch (e) { /* ignore */ }
  const t = (k, vars) => {
    let s = (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k;
    if (vars) Object.keys(vars).forEach(v => { s = s.split('{' + v + '}').join(vars[v]); });
    return s;
  };

  /* ---------------------------------------------------------------- data */
  const KILLERS = ['trapper', 'nurse', 'huntress', 'hillbilly'];
  const SURVIVORS = ['dwight', 'meg', 'jake', 'claudette'];
  const MOVE_FACES = ['vault', 'crouch', 'sneak', 'sprint', 'wait', 'power'];
  const TILE = {
    red: 'resource/tile-hook.png', green: 'resource/tile-pallet.png',
    yellow: 'resource/tile-generator.png', blue: 'resource/tile-chest.png',
  };
  const KILLER_TILE_ORDER = ['red', 'green', 'yellow', 'blue'];
  const SURVIVOR_TILE_ORDER = ['yellow', 'blue', 'green', 'red'];

  const state = {
    screen: 'home',
    killer: 'trapper',
    deck: [], discard: [],
    rolling: false,
  };

  const $ = id => document.getElementById(id);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------------------------------------------------------------- render helpers */
  function applyI18n() {
    document.documentElement.lang = lang;
    qsa('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    qsa('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    qsa('.lang-btn').forEach(b => { b.textContent = lang === 'en' ? '한국어' : 'EN'; });
    renderTilePriority();
    renderKillerPower();
    renderKillerRules();
    renderKillerPriority();
    renderSurvivorPanels();
    renderSurvivorPriority();
    renderSurvivorCounters();
    renderSkillChecks();
    updateDeckCount();
    updateNotes();
  }

  function renderTilePriority() {
    const mk = order => order.map((c, i) =>
      `<img src="${TILE[c]}" alt="${c}">${i < order.length - 1 ? '<span class="gt">&gt;</span>' : ''}`).join('');
    $('killer-tile-priority').innerHTML = mk(KILLER_TILE_ORDER);
    $('survivor-tile-priority').innerHTML = mk(SURVIVOR_TILE_ORDER);
  }

  function renderKillerPower() {
    $('killer-portrait').src = `resource/killer-${state.killer}.png`;
    $('killer-name').textContent = t('killer.' + state.killer);
    $('killer-power-title').textContent = `${t('killer.' + state.killer)} — ${t('ui.power')}`;
    $('killer-power-body').innerHTML = t('power.' + state.killer) +
      `<p style="color:#a1958f;font-size:13px;margin-top:8px">${t('power.note')}</p>`;
  }

  function renderKillerRules() { $('killer-rules-body').innerHTML = t('krules'); }

  function prioRow(num, img, title, sub, extraHtml, opts) {
    const o = opts || {};
    return `<div class="prio">
      <div class="prio-num">${num}</div>
      ${img ? `<img src="${img}" alt="" class="${o.round ? 'round' : ''}">` : ''}
      <div class="prio-body"><b>${title}${o.skip ? `<span class="skip">${o.skip}</span>` : ''}</b>${sub ? `<span>${sub}</span>` : ''}${o.note ? `<br><small>${o.note}</small>` : ''}${extraHtml || ''}</div>
    </div>`;
  }

  function renderKillerPriority() {
    const rows = [
      prioRow(1, 'resource/icon-pickup.png', t('kp.1'), t('kp.1s'),
        `<button class="prio-more" data-action="toggle" data-panel="kp1more">${t('kp.1more')}</button><ul class="sub-list hidden" id="panel-kp1more">${t('kp.1list')}</ul>`,
        { note: t('kp.1n') }),
      prioRow(2, 'resource/icon-attack.png', t('kp.2'), t('kp.2s')),
      prioRow(3, 'resource/tile-generator.png', t('kp.3'), t('kp.3s')),
      prioRow(4, 'resource/tile-totem.png', t('kp.4'), t('kp.4s')),
      prioRow(5, 'resource/tile-crow.png', t('kp.5'), t('kp.5s')),
      prioRow(6, 'resource/tile-locker.png', t('kp.6'), t('kp.6s'), `<ul class="sub-list">${t('kp.6list')}</ul>`),
      prioRow(7, `resource/killer-${state.killer}.png`, t('kp.7'), t('kp.7s'), '', { round: true }),
      `<div class="prio note">${t('kp.8')}</div>`,
    ];
    $('panel-killer-priority-body').innerHTML = rows.join('');
  }

  function renderSurvivorPanels() {
    $('survivor-power-body').innerHTML = SURVIVORS.map(s =>
      `<div class="prio"><img src="resource/survivor-${s}.png" class="round" alt=""><div class="prio-body">${t('spower.' + s)}</div></div>`).join('') +
      `<p style="color:#a1958f;font-size:13px;margin:10px 0 0">${t('spower.note')}</p>`;
    $('survivor-items-body').innerHTML = t('items');
    $('survivor-rules-body').innerHTML = t('srules');
  }

  function renderSurvivorPriority() {
    const rows = [
      prioRow(1, 'resource/tile-hook.png', t('sp.1'), t('sp.1s'), '', { note: t('sp.1n') }),
      prioRow(2, 'resource/tile-generator.png', t('sp.2'), t('sp.2s'), '', { skip: t('sp.2skip') }),
      prioRow(3, 'resource/tile-exit.png', t('sp.3'), t('sp.3s'), '', { skip: t('sp.3skip') }),
      prioRow(4, 'resource/icon-attack.png', t('sp.4'), t('sp.4s')),
      prioRow(5, 'resource/tile-chest.png', t('sp.5'), t('sp.5s'), '', { skip: t('sp.5skip') }),
      prioRow(6, 'resource/tile-pallet.png', t('sp.6'), t('sp.6s')),
      prioRow(7, 'resource/tile-locker.png', t('sp.7'), t('sp.7s')),
      prioRow(8, 'resource/icon-bp.png', t('sp.8'), t('sp.8s')),
      `<div class="prio note">${t('sp.9')}</div>`,
    ];
    $('panel-survivor-priority-body').innerHTML = rows.join('');
  }

  const survivorBP = { dwight: 0, meg: 0, jake: 0, claudette: 0 };
  let survivorTouched = false;
  function renderSurvivorCounters() {
    $('survivor-counters').innerHTML = SURVIVORS.map(s => `
      <div class="counter ${survivorBP[s] >= 4 ? 'power-ready' : ''}" id="counter-surv-${s}">
        <div class="counter-label"><img class="round" src="resource/survivor-${s}.png" alt=""><span>${t('surv.' + s)}</span></div>
        <div class="counter-ctl">
          <button class="ctl-btn" data-action="count" data-counter="surv-${s}" data-delta="-1">&minus;</button>
          <input class="ctl-val" type="number" inputmode="numeric" min="0" max="6" value="${survivorBP[s]}" data-counter="surv-${s}">
          <button class="ctl-btn plus ${survivorTouched ? '' : 'blink'}" data-action="count" data-counter="surv-${s}" data-delta="1">+</button>
        </div>
        <div class="counter-note ${survivorBP[s] >= 4 ? 'power' : ''}">${survivorBP[s] >= 4 ? t('ui.powerReady') : '&nbsp;'}</div>
      </div>`).join('');
  }

  function updateNotes() {
    const bp = +$('counter-killer-bp').querySelector('.ctl-val').value || 0;
    const note = $('killer-bp-note');
    note.textContent = bp >= 4 ? t('ui.huntReady') : '';
    note.classList.toggle('power', bp >= 4);
  }

  /* ---------------------------------------------------------------- skill check widget */
  const sc = { killer: { n: 1 }, survivor: { n: 1 } };
  function renderSkillChecks() {
    ['killer', 'survivor'].forEach(who => {
      const box = $(`${who}-skillcheck`);
      const n = sc[who].n;
      box.innerHTML = `
        <div class="sc-row">
          <span class="sc-title">${t('ui.skillCheck')}</span>
          <div class="sc-count">${[1, 2, 3, 4].map(i => `<button class="${i === n ? 'on' : ''}" data-action="sc-count" data-who="${who}" data-n="${i}">${i}</button>`).join('')}</div>
          <button class="sc-roll" data-action="sc-roll" data-who="${who}">${t('ui.roll')}</button>
        </div>
        <div class="sc-dice" id="${who}-sc-dice"></div>
        <div class="sc-summary" id="${who}-sc-summary"></div>`;
    });
  }

  function rollSkillCheck(who) {
    const n = sc[who].n;
    const dice = $(`${who}-sc-dice`);
    const sum = $(`${who}-sc-summary`);
    const results = Array.from({ length: n }, () => Math.floor(Math.random() * 6));
    dice.innerHTML = results.map(() => `<div class="sc-die rolling">?</div>`).join('');
    sum.textContent = '';
    setTimeout(() => {
      dice.innerHTML = results.map(r => {
        if (r === 0) return `<div class="sc-die fail flip-in"><img src="resource/icon-skull.png" alt="0"></div>`;
        if (r === 5) return `<div class="sc-die great flip-in"><img src="resource/icon-claw.png" alt="5"></div>`;
        return `<div class="sc-die flip-in">${r}</div>`;
      }).join('');
      const fails = results.filter(r => r === 0).length;
      const greats = results.filter(r => r === 5).length;
      const parts = [];
      if (fails) parts.push(`<span class="fail">${t('ui.scFail', { n: fails })}</span>`);
      if (greats) parts.push(`<span class="great">${t('ui.scGreat', { n: greats })}${n > 1 ? t('ui.scEscape') : ''}</span>`);
      if (!fails && !greats) parts.push(t('ui.scOk'));
      sum.innerHTML = parts.join(' · ');
      if (fails && who === 'killer') pulse('killer-bp');
    }, 500);
  }

  /* ---------------------------------------------------------------- killer movement roll */
  function rollMove() {
    if (state.rolling) return;
    state.rolling = true;
    const stage = $('killer-stage');
    const idle = $('killer-stage-idle');
    const res = $('killer-stage-result');
    res.classList.add('hidden');
    idle.classList.remove('hidden');
    stage.classList.add('stage-rolling');
    setTimeout(() => {
      stage.classList.remove('stage-rolling');
      const face = Math.floor(Math.random() * 6);
      const key = MOVE_FACES[face];
      let html = '';
      if (key === 'power') {
        html = `<div class="power-result flip-in">
          <img src="resource/killer-${state.killer}.png" alt="">
          <h3>${face} — ${t('killer.' + state.killer)} · ${t('ui.power')}</h3>
          <span class="badge warn">${t('result.power')}</span>
          <div style="text-align:left;font-size:15px;line-height:1.5">${t('power.' + state.killer)}</div>
        </div>`;
      } else {
        html = `<div class="card-wrap flip-in"><img src="resource/card-${key}.png" alt=""><div class="card-title">${t('card.' + key)}</div></div>
          <div class="card-label">${face} — ${t('card.' + key)}<small>${t('card.' + key + 'Sub')}</small></div>
          ${key === 'vault' ? `<span class="badge bp"><img src="resource/icon-bp.png" alt="">${t('ui.bpPlus')}</span>` : ''}
          <div class="result-hint">${t('ui.rerollHint')}</div>`;
      }
      res.innerHTML = html;
      idle.classList.add('hidden');
      res.classList.remove('hidden');
      if (key === 'vault') pulse('killer-bp');
      state.rolling = false;
    }, 650);
  }

  /* ---------------------------------------------------------------- survivor deck */
  function newDeck() {
    const d = [];
    ['vault', 'crouch', 'sneak', 'sprint'].forEach(c => { for (let i = 0; i < 4; i++) d.push(c); });
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
    return d;
  }
  function resetDeck(silent) {
    state.deck = newDeck(); state.discard = [];
    updateDeckCount();
    if (!silent) toast(t('ui.deckReset'));
  }
  function updateDeckCount() {
    const el = $('deck-count'); if (el) el.textContent = t('ui.remaining', { n: state.deck.length });
  }
  function drawCard() {
    if (state.rolling) return;
    state.rolling = true;
    const stage = $('survivor-stage');
    const idle = $('survivor-stage-idle');
    const res = $('survivor-stage-result');
    res.classList.add('hidden');
    idle.classList.remove('hidden');
    stage.classList.add('stage-rolling');
    setTimeout(() => {
      stage.classList.remove('stage-rolling');
      if (state.deck.length === 0) { state.deck = newDeck.call(null); state.discard = []; toast(t('ui.deckReshuffled')); }
      const key = state.deck.pop();
      state.discard.push(key);
      res.innerHTML = `<div class="card-wrap flip-in"><img src="resource/card-${key}.png" alt=""><div class="card-title">${t('card.' + key)}</div></div>
        <div class="card-label">${t('card.' + key)}<small>${t('card.' + key + 'Sub')}</small></div>
        <div class="result-hint">${t('ui.remaining', { n: state.deck.length })} · ${t('ui.tapAgainDraw')}</div>`;
      idle.classList.add('hidden');
      res.classList.remove('hidden');
      updateDeckCount();
      state.rolling = false;
    }, 600);
  }

  /* ---------------------------------------------------------------- counters */
  function counterInput(name) { return document.querySelector(`.ctl-val[data-counter="${name}"]`); }
  function setCounter(name, val) {
    const inp = counterInput(name); if (!inp) return;
    const min = +inp.min, max = +inp.max;
    val = Math.max(min, Math.min(max, isNaN(val) ? min : val));
    inp.value = val;
    if (name.startsWith('surv-')) {
      survivorBP[name.slice(5)] = val;
      survivorTouched = true;
      renderSurvivorCounters();
    } else if (name === 'sacrifice') {
      qsa('#counter-sacrifice .ctl-btn.plus').forEach(b => b.classList.remove('blink'));
    } else if (name === 'killer-bp') {
      updateNotes();
    }
  }
  function pulse(name) {
    const btn = document.querySelector(`.ctl-btn.plus[data-counter="${name}"]`);
    if (!btn) return;
    btn.classList.remove('pulse'); void btn.offsetWidth; btn.classList.add('pulse');
  }

  /* ---------------------------------------------------------------- navigation */
  function show(screen) {
    state.screen = screen;
    qsa('.screen').forEach(s => s.classList.toggle('hidden', s.id !== 'screen-' + screen));
    qsa('.panel').forEach(p => p.classList.add('hidden'));
    qsa('.text-btn.active').forEach(b => b.classList.remove('active'));
    window.scrollTo(0, 0);
  }
  function go(screen) {
    history.pushState({ s: screen }, '');
    show(screen);
  }
  window.addEventListener('popstate', e => {
    show((e.state && e.state.s) || 'home');
  });
  window.addEventListener('beforeunload', e => {
    if (state.screen === 'home') return;
    e.preventDefault(); e.returnValue = '';
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r')) { e.preventDefault(); }
  });

  /* ---------------------------------------------------------------- toast */
  let toastTimer = 0;
  function toast(msg) {
    const el = $('toast'); el.textContent = msg; el.classList.remove('hidden');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
  }

  /* ---------------------------------------------------------------- events */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const a = el.dataset.action;
    if (a === 'lang') {
      lang = lang === 'en' ? 'ko' : 'en';
      try { localStorage.setItem('dbd-lang', lang); } catch (err) { /* ignore */ }
      applyI18n();
      // refresh visible result texts by clearing results
      qsa('.stage-result').forEach(r => { r.classList.add('hidden'); r.innerHTML = ''; });
      qsa('.stage-idle').forEach(r => r.classList.remove('hidden'));
      return;
    }
    if (a === 'go') { go(el.dataset.screen); return; }
    if (a === 'back') { history.back(); return; }
    if (a === 'pick-killer') {
      state.killer = el.dataset.killer;
      renderKillerPower(); renderKillerPriority();
      $('killer-stage-result').classList.add('hidden'); $('killer-stage-result').innerHTML = '';
      $('killer-stage-idle').classList.remove('hidden');
      go('killer'); return;
    }
    if (a === 'toggle') {
      const panel = $('panel-' + el.dataset.panel);
      if (!panel) return;
      // clicking inside a panel body that is itself the toggle target closes it
      const nowHidden = panel.classList.toggle('hidden');
      if (el.classList.contains('text-btn')) el.classList.toggle('active', !nowHidden);
      if (el.classList.contains('acc-head')) el.classList.toggle('open', !nowHidden);
      if (!nowHidden && el.classList.contains('text-btn')) {
        // only one top panel open at a time
        qsa('.panel').forEach(p => { if (p !== panel) p.classList.add('hidden'); });
        qsa('.text-btn.active').forEach(b => { if (b !== el) b.classList.remove('active'); });
      }
      e.stopPropagation();
      return;
    }
    if (a === 'count') {
      const inp = counterInput(el.dataset.counter);
      setCounter(el.dataset.counter, (+inp.value || 0) + (+el.dataset.delta));
      return;
    }
    if (a === 'roll-move') { if (!e.target.closest('.panel')) rollMove(); return; }
    if (a === 'draw-card') { drawCard(); return; }
    if (a === 'draw-again') { drawCard(); return; }
    if (a === 'reset-deck') { resetDeck(false); $('survivor-stage-result').classList.add('hidden'); $('survivor-stage-idle').classList.remove('hidden'); return; }
    if (a === 'sc-count') { sc[el.dataset.who].n = +el.dataset.n; renderSkillChecks(); return; }
    if (a === 'sc-roll') { rollSkillCheck(el.dataset.who); return; }
  });

  document.addEventListener('change', e => {
    const inp = e.target.closest('.ctl-val'); if (!inp) return;
    setCounter(inp.dataset.counter, parseInt(inp.value, 10));
  });
  document.addEventListener('focusin', e => { const inp = e.target.closest('.ctl-val'); if (inp) inp.select(); });

  /* ---------------------------------------------------------------- init */
  history.replaceState({ s: 'home' }, '');
  resetDeck(true);
  applyI18n();
  show('home');
})();
