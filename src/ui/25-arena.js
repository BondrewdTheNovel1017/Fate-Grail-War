/* ---- Arena mode: quick fights on the themed Fuyuki maps ---- */
var ARENA_MODES = [
  ['duel', 'Duel', 'Servant against servant, one on one.'],
  ['ffa', 'Free-for-all', 'Three or four servants, everyone for themselves.'],
  ['teams', 'Teams', 'Two servants against two. Pick a team for each slot.'],
  ['masters', 'Master duel', 'Master against master: magecraft, Black Keys and bullets.'],
  ['pairs', 'Master and servant', 'Your master and servant against another pair, with Command Seals and mana.'],
  ['quickwar', 'Quick Grail War', 'A full seven-team war on the compact Fuyuki map, wrapped up in a few minutes.']
];
var AR_DEF = {
  duel: [{ k: 's', id: 'richard' }, { k: 's', id: 'random' }],
  ffa: [{ k: 's', id: 'richard' }, { k: 's', id: 'random' }, { k: 's', id: 'random' }, { k: 's', id: 'random' }],
  teams: [{ k: 's', id: 'richard', team: 0 }, { k: 's', id: 'random', team: 1 }, { k: 's', id: 'random', team: 0 }, { k: 's', id: 'random', team: 1 }],
  masters: [{ k: 'm', id: 'kirei' }, { k: 'm', id: 'random' }],
  pairs: [{ k: 's', id: 'richard', team: 0 }, { k: 'm', id: 'rin', team: 0 }, { k: 's', id: 'random', team: 1 }, { k: 'm', id: 'random', team: 1 }],
  quickwar: [{ k: 's', id: 'richard', team: 0 }, { k: 'm', id: 'rin', team: 0 }]
};
function arenaCfg() {
  var A = CFG.arena;
  if (!A || typeof A !== 'object') A = CFG.arena = {};
  if (!ARENA_MODES.some(function (m) { return m[0] === A.mode; })) A.mode = 'duel';
  if (!A.slots || typeof A.slots !== 'object') A.slots = {};
  Object.keys(AR_DEF).forEach(function (k) { var s = A.slots[k]; if (!Array.isArray(s) || s.length !== AR_DEF[k].length) A.slots[k] = JSON.parse(JSON.stringify(AR_DEF[k])); A.slots[k].forEach(function (sl, i) { sl.k = AR_DEF[k][i].k; var T = sl.k === 'm' ? MASTERS : SERV; if (sl.id !== 'random' && !T[sl.id]) sl.id = AR_DEF[k][i].id; }); });
  if (A.count !== 3) A.count = 4; if (!(A.active >= 0)) A.active = 0; if (A.map !== 'random' && !MAPS[A.map]) A.map = 'bridge'; if (A.playAs !== 'master') A.playAs = 'servant';
  return A;
}
function arenaN(A) { return A.mode === 'ffa' ? A.count : AR_DEF[A.mode].length; }
function arenaSlotCol(A, i) {
  var sl = A.slots[A.mode][i];
  if (A.mode === 'teams' || A.mode === 'pairs') return sl.team === A.slots[A.mode][0].team ? '#3fb3c4' : '#cf4a52';
  return A.mode === 'ffa' ? FFA_COL.at(i) : (i ? '#cf4a52' : '#3fb3c4');
}
function arenaRole(A, i) {
  if (A.mode === 'pairs' || A.mode === 'quickwar') return (i < 2 ? 'Your ' : 'Rival ') + (i % 2 ? 'master' : 'servant') + (i < 2 && ((i === 0) === (A.playAs === 'servant')) ? ' (you)' : '');
  return i === 0 ? 'You' : 'CPU ' + i;
}
function renderArena() {
  var A = arenaCfg(), n = arenaN(A), S = A.slots[A.mode]; if (A.active >= n) A.active = 0;
  $('#amodes').innerHTML = ARENA_MODES.map(function (m) { return '<button type="button" class="mode" data-amode="' + m[0] + '" aria-pressed="' + (A.mode === m[0]) + '"><b>' + m[1] + '</b><small>' + m[2] + '</small></button>'; }).join('');
  $('#acount').innerHTML = A.mode === 'ffa' ? [3, 4].map(function (c) { return '<button type="button" class="chip" data-acount="' + c + '" aria-pressed="' + (n === c) + '">' + c + ' fighters</button>'; }).join('') :
    A.mode === 'pairs' || A.mode === 'quickwar' ? [['servant', 'Play as the servant'], ['master', 'Play as the master']].map(function (q) { return '<button type="button" class="chip" data-aplay="' + q[0] + '" aria-pressed="' + (A.playAs === q[0]) + '">' + q[1] + '</button>'; }).join('') : '';
  var h = '';
  for (var i = 0; i < n; i++) {
    var sl = S[i], T = sl.k === 'm' ? MASTERS : SERV, d = T[sl.id];
    h += '<div class="slot" role="button" tabindex="0" data-aslot="' + i + '" aria-pressed="' + (A.active === i) + '" style="--tc:' + arenaSlotCol(A, i) + '"><span class="th">' + (d ? thumb(d.id, 96) : '<svg viewBox="0 0 96 48" width="96" height="48"><text x="48" y="31" text-anchor="middle" font-size="22" fill="#8fa3b5" font-family="serif">?</text></svg>') + '</span>' +
      '<span class="role">' + arenaRole(A, i) + '</span><b>' + (d ? esc(shortName(d.name)) : 'Random ' + (sl.k === 'm' ? 'master' : 'servant')) + '</b>' +
      (A.mode === 'teams' ? '<button type="button" class="tbtn" data-ateam="' + i + '">' + (sl.team === 0 ? 'Blue team' : 'Red team') + '</button>' : '<small>' + (d ? (sl.k === 'm' ? esc(d.type) : d.cls) : 'Any') + '</small>') + '</div>';
  }
  $('#aslots').innerHTML = h;
  var cur = S[A.active];
  $('#aroster').innerHTML = entityRosterHTML(cur.k, cur.id, 'data-apick', A.active > 0);
  $('#adetail').innerHTML = entityDetailHTML(cur.k, cur.id, arenaRole(A, A.active).toLowerCase());
  $('#amaps').closest('.step').hidden = A.mode === 'quickwar';
  $('#amaps').innerHTML = MAP_ORDER.map(function (id) { var m = MAPS[id]; return '<button type="button" class="mapc" data-amap="' + id + '" aria-pressed="' + (A.map === id) + '"><canvas width="240" height="' + Math.round(240 * m.h / m.w) + '" data-prev="' + id + '"></canvas><span class="pl">' + esc(m.place) + '</span><b>' + esc(m.name) + '</b><small>' + esc(m.blurb) + '</small></button>'; }).join('') +
    '<button type="button" class="mapc" data-amap="random" aria-pressed="' + (A.map === 'random') + '"><span class="pl">Any location</span><b>Random battlefield</b><small>One of the arena maps, drawn when the battle starts.</small></button>';
  document.querySelectorAll('canvas[data-prev]').forEach(function (c) { drawMapPreview(c, MAPS[c.dataset.prev]); });
  $('#adiff').innerHTML = $('#diff').innerHTML; $('#aspd').innerHTML = $('#spd').innerHTML;
  var names = []; for (var k = 0; k < n; k++) { var s2 = S[k], d2 = (s2.k === 'm' ? MASTERS : SERV)[s2.id]; names.push(d2 ? shortName(d2.name) : 'Random'); }
  var vs = A.mode === 'quickwar' ? names[0] + ' + ' + names[1] + ' against six rival teams' : A.mode === 'teams' ? (function () { var X = [], Y = []; for (var q = 0; q < 4; q++) (S[q].team === S[0].team ? X : Y).push(names[q]); return X.join(' + ') + ' vs ' + Y.join(' + '); })() : A.mode === 'pairs' ? names[0] + ' + ' + names[1] + ' vs ' + names[2] + ' + ' + names[3] : names.join(' vs ');
  $('#summary').innerHTML = '<b>Arena &middot; ' + ARENA_MODES.find(function (m) { return m[0] === A.mode; })[1] + '</b> &middot; ' + esc(vs) + ' &middot; ' + esc(A.mode === 'quickwar' ? 'Compact Fuyuki' : A.map === 'random' ? 'Random battlefield' : MAPS[A.map].name);
}
document.addEventListener('click', function (e) {
  var t = e.target, el, A = CFG.arena; if (!t.closest || !A) return;
  if ((el = t.closest('[data-ateam]'))) { var ti = +el.dataset.ateam; A.slots.teams[ti].team = 1 - A.slots.teams[ti].team; A.active = ti; saveCfg(); renderSetup(); return; }
  if ((el = t.closest('[data-amode]'))) { A.mode = el.dataset.amode; A.active = 0; saveCfg(); renderSetup(); return; }
  if ((el = t.closest('[data-acount]'))) { A.count = +el.dataset.acount; saveCfg(); renderSetup(); return; }
  if ((el = t.closest('[data-aplay]'))) { A.playAs = el.dataset.aplay; saveCfg(); renderSetup(); return; }
  if ((el = t.closest('[data-aslot]'))) { A.active = +el.dataset.aslot; saveCfg(); renderSetup(); return; }
  if ((el = t.closest('[data-apick]'))) { A.slots[A.mode][A.active].id = el.dataset.apick; saveCfg(); renderSetup(); return; }
  if ((el = t.closest('[data-amap]'))) { A.map = el.dataset.amap; saveCfg(); renderSetup(); return; }
});
document.addEventListener('keydown', function (e) { var el = e.target.closest && e.target.closest('[data-aslot]'); if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); CFG.arena.active = +el.dataset.aslot; saveCfg(); renderSetup(); } });
function pickRandom(kind, taken) { var ids = (kind === 'm' ? MASTER_ORDER : ORDER).filter(function (id) { return taken.indexOf(id) < 0; }); if (!ids.length) ids = kind === 'm' ? MASTER_ORDER : ORDER; return ids[Math.floor(Math.random() * ids.length)]; }
function startArena() {
  var A = arenaCfg(), n = arenaN(A), S = A.slots[A.mode].slice(0, n), map = A.map === 'random' ? MAP_ORDER.filter(function (m) { return m !== 'arena'; })[Math.floor(Math.random() * (MAP_ORDER.length - 1))] : A.map;
  var taken = [], ids = S.map(function (sl) { var id = sl.id === 'random' ? pickRandom(sl.k, taken) : sl.id; taken.push(id); return id; });
  MEI = 0; NET.mirror = false;
  if (A.mode === 'quickwar') {
    var qt = warTeams(ids[0], ids[1], 7).map(function (t) { return { servant: SERV_DUEL[t.servant.id], master: t.master }; });
    newWar(qt, { map: 'fuyuki', quick: true, playAs: A.playAs, spawnOrder: [0].concat(shuffled([1, 2, 3, 4, 5, 6])) });
  } else if (A.mode === 'pairs') {
    newWar([{ servant: SERV_DUEL[ids[0]], master: MASTERS[ids[1]] }, { servant: SERV_DUEL[ids[2]], master: MASTERS[ids[3]] }], { map: map, quick: true, playAs: A.playAs });
  } else {
    var defs = ids.map(function (id, i) { return S[i].k === 'm' ? MASTERS[id] : SERV_DUEL[id]; });
    newGame(defs, { map: map, mode: A.mode === 'masters' ? 'duel' : A.mode, teams: A.mode === 'teams' ? S.map(function (sl) { return sl.team; }) : null });
  }
  for (var k = 0; k < G.f.length; k++) if (k !== MEI) G.ai[k] = mkAI(G.f[k], DIFF[CFG.diff]);
  enterGame(0, A.mode === 'quickwar' ? 'Quick Grail War' : 'Arena', MAP.name + ' · ' + ARENA_MODES.find(function (m) { return m[0] === A.mode; })[1]);
}
