/* ---- the dev menu: jump straight to any moment, for reviewing updates without playing for an hour ----
   Only in the preview build (DEV_BUILD), never in the main game or the site, and never in an online match.
   The backquote key or the DEV button opens it. */
var DEVON = typeof DEV_BUILD !== 'undefined' && DEV_BUILD;
var DEVST = { open: false, god: false, frozen: null, iv: null };
var DEV_EVENTS = [
  ['night', 'challenge', 'Challenge at the docks'], ['night', 'bounty', 'Church Bounty'], ['night', 'horror', 'Horror in the River'],
  ['night', 'falsedeath', 'False Death'], ['night', 'berserk', 'Berserker Unchained / Taint'], ['night', 'demo', 'Demolition'], ['night', 'shadow', 'The Shadow'],
  ['day', 'school', 'Sealed School'], ['day', 'banquet', "King's Banquet"], ['day', 'summons', "Overseer's Summons"], ['day', 'festival', 'Festival']
];
var DEV_PLACES = [
  ['home', 'My home'], ['rival', 'Nearest rival home'], ['church', 'Fuyuki Church'], ['docks', 'The docks'], ['river', 'The river (Horror path)'],
  ['school', 'Homurahara Academy'], ['temple', 'Ryuudou Temple'], ['civic', 'Civic Hall']
];
function devOnline() { if (typeof netInMatch === 'function' && netInMatch()) { devSay('The dev menu is off in online matches.'); return true; } return false; }
function devMe() { return G && G.f ? G.f[MEI] : null; }
function devSay(t) { if (typeof note === 'function' && running) note(t); var s = $('#devMsg'); if (s) s.textContent = t; }
function devInWar() { if (!G || !running) { devSay('Start a war first (Quick war).'); return false; } if (G.mode !== 'war' || !G.clock) { devSay('This needs a Grail War with nights and days.'); return false; } return true; }
function devPhase(ph, n) {
  if (devOnline()) return;
  if (!devInWar()) return; var c = G.clock;
  if (G.event && G.event.kind !== 'grail') endEvent(null);
  G.event = null; c.t = 0; c.midnight = false; c.final = false;
  if (ph === 'day') { c.phase = 'day'; c.n = Math.max(2, n || 2); c.len = CLOCK.day; startDay(); }
  else if (ph === 'night') { c.phase = 'night'; c.n = Math.max(1, Math.min(n || 1, c.nights)); c.len = c.n >= c.nights ? CLOCK.lastNight : CLOCK.night; G.tasks = []; }
  else { c.phase = 'night'; c.n = c.nights; c.final = true; c.midnight = true; G.tasks = []; }
  c.pending = ph === 'grail' ? 'grail' : null; c.evDone = ph !== 'grail';
  if (typeof civShift === 'function') civShift();
  FX.phase(ph === 'grail' ? 'grail' : ph, c.n, ph === 'grail');
  devSay(ph === 'grail' ? 'Midnight: the Grail descends.' : (ph === 'day' ? 'Day ' : 'Night ') + c.n + ', no event dealt. Start one below.');
}
function devEvent(k) {
  if (devOnline()) return;
  if (!devInWar()) return; var c = G.clock, row = DEV_EVENTS.filter(function (e) { return e[1] === k; })[0];
  if (row[0] === 'day' && (c.phase !== 'day' || c.final)) devPhase('day', c.n + (c.phase === 'night' ? 1 : 0));
  if (row[0] === 'night' && (c.phase !== 'night' || c.final)) devPhase('night', Math.min(c.n, c.nights - 1) || 1);
  if (G.event) endEvent(null);
  var fn = { challenge: startChallenge, bounty: startBounty, horror: startHorror, falsedeath: startFalseDeath, berserk: startBerserk, demo: startDemolition, shadow: startShadow, school: startSchool, banquet: startBanquet, summons: startSummons, festival: startFestival }[k];
  try { fn(); } catch (e) { devSay(row[2] + ' failed: ' + e.message); return; }
  c.pending = null;
  var on = G.event || (k === 'festival' && G.festival) || (G.tasks || []).some(function (t) { return t.kind === k; });
  devSay(on ? row[2] + ' started.' : row[2] + " could not start now (it needs conditions this war doesn't have yet).");
}
function devGoTo(where) {
  if (devOnline()) return;
  if (!devInWar()) return; var me = devMe(), p = null, i;
  if (where === 'home') p = me.home ? { x: me.home[0], y: me.home[1] } : null;
  else if (where === 'rival') {
    var best = null, bd = 1e9; G.f.forEach(function (o) { if (o.team === me.team || !o.home || o.st === 'dead' || (G.pacts && pactTeams(o.team, me.team))) return; var d = Math.hypot(o.home[0] - me.x, o.home[1] - me.y); if (d < bd) { bd = d; best = o; } });
    p = best ? { x: best.home[0], y: best.home[1] } : null;
  }
  else if (where === 'church') { var sk = (G.tasks || []).filter(function (t) { return t.kind === 'summons'; })[0]; p = sk ? openSpot(sk.x, sk.y + 120, 0, 120) : openSpot(MAP.haven.x, MAP.haven.y + 260, 0, 120); }
  else if (where === 'docks') p = openSpot(EVT.challenge.x, EVT.challenge.y, 0, 200);
  else if (where === 'river') p = openSpot(EVT.horror.path[0][0] - 500, EVT.horror.path[0][1], 0, 150);
  else if (where === 'school') p = openSpot(EVT.school.x, EVT.school.y + 500, 0, 200);
  else if (where === 'temple') p = openSpot(GRAIL_SITES[0].x, GRAIL_SITES[0].y, 0, 220);
  else if (where === 'civic') p = openSpot(GRAIL_SITES[2].x, GRAIL_SITES[2].y, 0, 220);
  if (!p) { devSay('Nowhere to go for that.'); return; }
  var us = [me]; if (me.partner && me.partner.st !== 'dead') us.push(me.partner);
  us.forEach(function (f, j) { f.x = p.x + (j ? 50 : 0); f.y = p.y + (j ? 20 : 0); f.kx = f.ky = 0; f.st = f.st === 'dead' ? 'dead' : 'idle'; f.act = null; f.inM = false; });
  cam.x = me.x; cam.y = me.y; devSay('Moved to ' + DEV_PLACES.filter(function (q) { return q[0] === where; })[0][1] + '.');
}
function devMine() { var me = devMe(); return me ? [me].concat(me.partner && me.partner.st !== 'dead' ? [me.partner] : []) : []; }
function devDo(k) {
  if (devOnline()) return;
  if (k === 'quick') { if (running) endMatch(); CFG.game = 'war'; startMatch(); if (INTRO) skipIntro(); devSay('Quick war started.'); return; }
  if (k === 'skip') { if (INTRO) { skipIntro(); devSay('Intro skipped.'); } return; }
  if (k === 'speed') { speedMul = speedMul > 1 ? CFG.speed || 1 : 3; devRender(); devSay('Game speed x' + speedMul + '.'); return; }
  if (!G || !running) { devSay('Start a war first (Quick war).'); return; }
  var us = devMine();
  if (k === 'heal') { us.forEach(function (f) { f.hp = f.def.hp; }); devSay('Healed.'); }
  else if (k === 'np') { us.forEach(function (f) { f.mom = 100; }); devSay('NP bars full.'); }
  else if (k === 'mana') { us.forEach(function (f) { if (f.manaMax) f.mana = f.manaMax; f.sta = 100; f.exh = 0; }); devSay('Mana and stamina full.'); }
  else if (k === 'seals') { us.forEach(function (f) { if (f.def.isMaster) { f.seals = SEALS; f.sealUsed = { np: 0, heal: 0, warp: 0 }; } }); document.querySelectorAll('.b.seal').forEach(function (el) { el.classList.remove('used'); }); devSay('Command Seals restored.'); }
  else if (k === 'god') { DEVST.god = !DEVST.god; devRender(); devSay(DEVST.god ? 'You and your partner cannot fall.' : 'Normal damage again.'); }
  else if (k === 'freeze') {
    if (DEVST.frozen) { G.ai = DEVST.frozen; DEVST.frozen = null; devRender(); devSay('AI moving again.'); }
    else { DEVST.frozen = G.ai.slice(); G.ai = G.ai.map(function () { return null; }); G.f.forEach(function (f, i) { if (i !== MEI && !(DEVST.frozen[i] === null)) { f.inp = { mx: 0, my: 0 }; f.buf = { name: null, t: 0 }; } }); devRender(); devSay('AI frozen in place.'); }
  }
  else if (k === 'rival2me') {
    var me2 = devMe(), rb = null, rd = 1e9;
    G.f.forEach(function (o) { if (o.team === me2.team || o.st === 'dead' || (G.pacts && pactTeams(o.team, me2.team))) return; var d = Math.hypot(o.x - me2.x, o.y - me2.y); if (d < rd) { rd = d; rb = o; } });
    if (!rb) { devSay('No rival left.'); return; }
    G.f.filter(function (o) { return o.team === rb.team && o.st !== 'dead'; }).forEach(function (o, j) { o.x = me2.x + 110 + j * 50; o.y = me2.y + (j ? 40 : -20); o.kx = o.ky = 0; o.inM = me2.inM; o.spirit = 0; });
    devSay('A rival team now stands beside you. Start an event with a truce (Horror, Banquet, Summons) to test it.');
  }
  else if (k === 'rivalSpirit') {
    var me3 = devMe(), sv = null, sd = 1e9;
    G.f.forEach(function (o) { if (o.team === me3.team || o.st === 'dead' || o.def.isMaster || o.def.cls === 'Assassin') return; var d = Math.hypot(o.x - me3.x, o.y - me3.y); if (d < sd) { sd = d; sv = o; } });
    if (!sv) { devSay('No rival servant left.'); return; }
    sv.x = me3.x + 220; sv.y = me3.y; sv.kx = sv.ky = 0; sv.spirit = 2; sv.spiritAt = G.time; sv.inM = me3.inM;
    devSay(knownName(sv) + ' waits in spirit form beside you. A servant of yours within 300 sees its shimmer; step away and it vanishes.');
  }
  else if (k === 'pick') { grantPick(devMe().team); devSay('A base upgrade pick added. Go home and tap ✦ under your health bars.'); }
  else if (k === 'field3') {
    var me = devMe(), best = null, bd = 1e9;
    for (var t in G.fields) { if (+t === me.team) continue; var o = G.f.filter(function (x) { return x.team === +t && x.home; })[0]; if (!o) continue; var d = Math.hypot(o.home[0] - me.x, o.home[1] - me.y); if (d < bd) { bd = d; best = t; } }
    if (best === null) { devSay('No rival field.'); return; } var F = G.fields[best]; F.max = Math.max(F.max || 0, 3); F.lvl = Math.max(F.lvl || 0, 3); devSay('The nearest rival field is now level ' + F.lvl + '. Use "Nearest rival home" to walk in.');
  }
}
function devLab() { var id = $('#devLabId').value, key = $('#devLabKey').value, foe = $('#devLabFoe').value; if (running) endMatch(); $('#setup').style.display = 'none'; window.__duel.fxLab(id, key === '-' ? null : key, foe, 230); devSay('Effects lab: ' + id + (key === '-' ? '' : ' ' + key) + '. Use "Again" to repeat.'); }
function devRender() {
  var el = $('#devPanel'); if (!el) return; var m0 = $('#devMsg'), msg = m0 ? m0.textContent : 'Jump to any moment. Changes only this game.';
  var ids = Object.keys(SERV).concat(Object.keys(MASTERS)), opt = function (sel) { return ids.map(function (i) { return '<option' + (i === sel ? ' selected' : '') + '>' + i + '</option>'; }).join(''); };
  var b = function (k, t, on) { return '<button data-dv="' + k + '"' + (on ? ' class="on"' : '') + '>' + t + '</button>'; };
  el.innerHTML = '<div class="dvh"><b>Dev scenarios</b><button data-dv="close" aria-label="Close">✕</button></div><div id="devMsg" class="dvm">' + esc(msg) + '</div>' +
    '<h4>Start</h4>' + b('quick', 'Quick war (no intro)') + b('skip', 'Skip intro') + b('speed', 'Speed x3', speedMul > 1) + b('freeze', 'Freeze AI', !!DEVST.frozen) +
    '<h4>Clock</h4>' + ['night|1|Night 1', 'day|2|Day 2', 'night|2|Night 2', 'day|3|Day 3', 'night|3|Night 3', 'grail|0|The Grail (midnight)'].map(function (s) { var p = s.split('|'); return '<button data-dvp="' + p[0] + '" data-n="' + p[1] + '">' + p[2] + '</button>'; }).join('') +
    '<h4>Events now</h4>' + DEV_EVENTS.map(function (e) { return '<button data-dve="' + e[1] + '">' + e[2] + '</button>'; }).join('') +
    '<h4>You and your partner</h4>' + b('heal', 'Full health') + b('np', 'Full NP bar') + b('mana', 'Full mana and stamina') + b('seals', 'Restore seals') + b('god', 'Cannot fall', DEVST.god) +
    '<h4>Go to</h4>' + DEV_PLACES.map(function (q) { return '<button data-dvg="' + q[0] + '">' + q[1] + '</button>'; }).join('') + b('pick', 'Give me an upgrade pick') + b('field3', 'Nearest rival field to level 3') + b('rival2me', 'Bring the nearest rival to me') + b('rivalSpirit', 'Rival servant in spirit form beside me') +
    '<h4>Effects lab</h4><div class="dvl"><select id="devLabId">' + opt('caerwyn') + '</select><select id="devLabKey"><option>light</option><option>heavy</option><option>skill</option><option selected>np</option><option>-</option></select><select id="devLabFoe">' + opt('leonidas') + '</select>' + b('lab', 'Stage it') + '</div>';
}
function devToggle(on) {
  DEVST.open = on === undefined ? !DEVST.open : on; var el = $('#devPanel'); if (!el) return;
  el.hidden = !DEVST.open; if (DEVST.open) devRender();
}
function devInit() {
  if (!DEVON || $('#devBtn')) return;
  var btn = document.createElement('button'); btn.id = 'devBtn'; btn.textContent = 'DEV'; btn.title = 'Dev scenarios (`)'; document.body.appendChild(btn);
  var el = document.createElement('div'); el.id = 'devPanel'; el.hidden = true; document.body.appendChild(el);
  btn.addEventListener('click', function () { devToggle(); });
  el.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return; e.stopPropagation();
    if (t.dataset.dv === 'close') return devToggle(false);
    if (t.dataset.dv === 'lab') return devLab();
    if (t.dataset.dv) return devDo(t.dataset.dv);
    if (t.dataset.dvp) return devPhase(t.dataset.dvp, +t.dataset.n);
    if (t.dataset.dve) return devEvent(t.dataset.dve);
    if (t.dataset.dvg) return devGoTo(t.dataset.dvg);
  });
  ['keydown', 'keyup', 'pointerdown', 'touchstart'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.stopPropagation(); }); });
  document.addEventListener('keydown', function (e) { if (e.key === '`') { devToggle(); e.preventDefault(); } });
  DEVST.iv = setInterval(function () { if (!DEVST.god || !G || !running) return; devMine().forEach(function (f) { if (f.st !== 'dead') f.hp = Math.max(f.hp, f.def.hp * 0.9); }); }, 100);
}
// "Cannot fall": a killing blow on you or your partner leaves them standing at full health
var devKill0 = kill;
kill = function (f, noRevive) { if (DEVON && DEVST.god && devMine().indexOf(f) >= 0) { f.hp = f.def.hp; return; } return devKill0(f, noRevive); };
devInit();
