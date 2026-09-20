// English (default). 다른 언어를 추가하려면 이 파일을 복사해 locales/<code>.js 로 만들고
// index.html 의 <script> 목록에 추가하면 된다. 없는 키는 영어로 대체된다.
window.DBD_LOCALES = window.DBD_LOCALES || {};
window.DBD_LOCALES.en = {
  name: 'English',
  strings: {
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
    'surv.dwight': 'Dwight',
    'surv.meg': 'Meg',
    'surv.jake': 'Jake',
    'surv.claudette': 'Claudette',

    'ui.rules': 'Rules',
    'ui.items': 'Items',
    'ui.tapToClose': 'Tap to close',
    'ui.revealTiles': 'Reveal tiles',
    'ui.bp': 'Bloodpoints',
    'ui.tapToRoll': 'Tap to roll the movement die',
    'ui.tapToDraw': 'Tap to draw a movement card',
    'ui.interactionPriority': 'Interaction priority',
    'ui.survivorPowers': 'Automa Survivor powers',
    'ui.undo': 'Undo',
    'ui.undone': 'Undid {card}',
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
    'ui.tapAgainDraw': 'Tap to draw the next card',
    'ui.remaining': '{n} left',
    'ui.rerollHint': 'No matching path or same as previous turn? Roll again.',

    'card.vault': 'Vault',
    'card.crouch': 'Crouch',
    'card.sneak': 'Sneak',
    'card.sprint': 'Sprint',
    'card.wait': 'Wait',
    'card.vaultSub': 'yellow · one-way path',
    'card.crouchSub': 'red path',
    'card.sneakSub': 'blue path',
    'card.sprintSub': 'green path',
    'card.waitSub': 'stay and interact here',
    'result.power': 'Use power instead of moving and interacting',

    'surv.forcedMove': '<b>Before revealing the card:</b> if a connected space has a <b>hooked Survivor</b> or a <b>powered Exit Gate</b>, ignore the card and move there.',

    'power.trapper': '<p>All Survivors in spaces connected to a path with a <b>bear trap</b> become wounded.</p><p>Then place 1 bear trap on a connected path that has no pallet or other component.</p><p>If all 4 bear traps are already on the board, gain <b>2 BP</b> instead.</p>',
    'power.nurse': '<p>Spend <b>3 BP</b> to <b>Hunt</b> (extra move + interaction, see Rules).</p><p>During this Hunt she may move against one-way paths and ignores pallets and breakable walls.</p><p>If she has fewer than 3 BP, gain <b>1 BP</b> instead.</p>',
    'power.huntress': '<p>One Survivor in a <b>connected space</b> becomes wounded.</p><p>If there is no Survivor in a connected space, gain <b>1 BP</b> instead.</p>',
    'power.hillbilly': '<p>Gain <b>1 BP</b>. Roll a skill check die and move along the matching path (reroll on 4 or 5).</p><p>One Survivor in the destination space becomes wounded.</p><p>No interaction after this move.</p>',
    'power.note': 'The Automa Killer may use its power any number of times per round. It never uses the perks, power or passive printed on its board.',

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

    'kp.1': 'Wounded Survivor',
    'kp.1s': 'Pick up',
    'kp.1n': 'Not a Survivor wounded this round',
    'kp.1more': 'Pick-up procedure ▾',
    'kp.1list': `<li>Prefer a Survivor who still holds their sacrifice token.</li>
<li>Empty hook in this space → sacrifice immediately.</li>
<li>Otherwise head for the <b>closest revealed empty hook</b>; the Survivor rolls that many skill check dice. Any great success → escapes.</li>
<li>No revealed hook → declare <b>4 dice</b> and move along the path that reveals the most <b>red tiles</b>; stop at the first hook revealed.</li>
<li>First time a Survivor is hooked, add their sacrifice token to the track.</li>`,
    'kp.2': 'Survivor',
    'kp.2s': 'Attack (wound)',
    'kp.3': 'Generator with progress',
    'kp.3s': 'Damage — remove all progress',
    'kp.4': 'Hex Totem',
    'kp.4s': 'Venerate — BP +2',
    'kp.5': 'Crow',
    'kp.5s': 'Remove tile — BP +1',
    'kp.6': 'Occupied locker',
    'kp.6s': 'Search',
    'kp.6list': '<li>The hidden Survivor rolls a skill check.</li><li>Failure → picked up, wounded or not.</li><li>Success → remove the locker tile.</li>',
    'kp.7': 'Nothing above',
    'kp.7s': 'Use power',
    'kp.8': 'Ties: compare move → interaction → tile priority.',

    'spower.dwight': 'Every Survivor adds 1 progress to a generator in their own space.',
    'spower.meg': 'Takes an extra bonus turn (draw a card, move, reveal, interact).',
    'spower.jake': 'Remove one face-up empty hook anywhere. If none, refund 3 BP.',
    'spower.claudette': 'Every Survivor in her space and connected spaces (herself included) is healed. If nobody was wounded, refund 3 BP.',
    'spower.note': 'At the end of a Survivor\'s turn, if they have <b>4+ BP</b>, they spend 4 BP and use their power. Automa Survivors never use the perks on their boards.',

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

    'sp.1': 'Hooked Survivor',
    'sp.1s': 'Rescue — BP +1. Put an Entity token on the hook (the Killer cannot use it this round; removed at round end)',
    'sp.1n': 'Both may then move 1 path (draw to choose), no interaction',
    'sp.2': 'Generator',
    'sp.2s': 'Repair — skill check (+1 / great +2)',
    'sp.2skip': 'skip once the gates are powered',
    'sp.3': 'Exit Gate',
    'sp.3s': 'Open — skill check (+1 only)',
    'sp.3skip': 'skip until powered',
    'sp.4': 'Wounded Survivor',
    'sp.4s': 'Heal — skill check (success removes the wound)',
    'sp.5': 'Chest',
    'sp.5s': 'Draw an item. Remove the chest tile',
    'sp.5skip': 'skip if holding an item',
    'sp.6': 'Pallet',
    'sp.6s': 'Drop on a connected path',
    'sp.7': 'Locker',
    'sp.7s': 'Hide (everyone treats this Survivor as absent)',
    'sp.8': 'Nothing above',
    'sp.8s': 'BP +1',
    'sp.9': 'Ties: draw cards to choose a path; then higher interaction priority; then the Killer player decides.',

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
<p class="muted">Items are kept face up and used the moment their condition is met.</p>`,
  },
};
