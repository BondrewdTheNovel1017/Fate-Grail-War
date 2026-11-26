/* ---- online play, part 1: the room, the lobby and the match ----
   Everyone opens this page on claude.ai; the claude.ai room relays between them (artifacts cannot open direct
   connections). One player hosts: their page runs the whole war and AI; guests send only their stick and buttons
   and draw what the host sends back (91-netsync). The lobby has a seat for every servant and every master, so two
   friends can share a team, one as the servant and one as the master. Open the page with #localnet to test
   several players in tabs of one browser without claude.ai. */
var NET_V = 3;
var NET = { ns: null, R: null, X: {}, role: null, code: '', self: null, nick: '', game: null, mirror: false, hosting: false, msg: '', err: '', ping: 0, sentAt: {}, prev: {}, cnt: {}, g: 0, h: 0, so: null, lk: -1, req: { slot: -1, id: 'random' }, ready: false, local: /localnet/.test(location.hash), lob: null, joinedAt: 0, lastHostSeen: 0, medAt: 0, lastSeq: 0 };
try { NET.nick = localStorage.getItem('fgw.nick') || ''; } catch (e) {}
/* ---- a stand-in room over BroadcastChannel for testing in one browser: same calls, same 4 KiB limit, a little lag ---- */
function localRoomNs() {
  var me = Math.random().toString(36).slice(2, 10), bc = new BroadcastChannel('fgw-localnet'), rooms = {};
  function mkRoom(name) {
    var R = { name: name, mine: {}, others: {}, subs: [], conn: true, last: 0, timer: null };
    function snapshot() { var arr = [{ peer: me, by: null, isMe: true, sameTab: true, kind: 'viewer', guest: false, presence: R.mine, updatedAt: Date.now() }]; Object.keys(R.others).forEach(function (p) { arr.push(R.others[p].peer); }); return arr; }
    function fire() { var s = snapshot(); R.subs.forEach(function (h) { try { h({ peers: s, joined: [], left: [], updated: [] }); } catch (e) {} }); }
    function send() { R.timer = null; var msg = { room: name, from: me, presence: R.mine, t: Date.now() }; bc.postMessage(msg); }
    R.api = {
      name: name,
      presence: function (patch) { var m = Object.assign({}, R.mine); Object.keys(patch).forEach(function (k) { if (patch[k] === null) delete m[k]; else m[k] = patch[k]; }); if (JSON.stringify(m).length > 4096) return Promise.reject({ code: 'invalid_argument', message: 'presence over 4 KiB' }); R.mine = m; if (!R.timer) R.timer = setTimeout(send, 33); if (!R.fq) { R.fq = true; setTimeout(function () { R.fq = false; fire(); }, 16); } return Promise.resolve(); },
      peers: snapshot, onPeers: function (h) { R.subs.push(h); setTimeout(fire, 0); return function () { R.subs = R.subs.filter(function (x) { return x !== h; }); }; },
      connected: function () { return true; }, onConnection: function (h) { setTimeout(function () { h(true); }, 0); return function () {}; },
      leave: function () { bc.postMessage({ room: name, from: me, leave: true }); delete rooms[name]; return Promise.resolve(); },
      emit: function () { return Promise.resolve(); }, on: function () { return function () {}; }
    };
    setInterval(function () { if (rooms[name]) send(); var now = Date.now(), ch = false; Object.keys(R.others).forEach(function (p) { if (now - R.others[p].seen > 4000) { delete R.others[p]; ch = true; } }); if (ch) fire(); }, 800);
    return R;
  }
  bc.onmessage = function (ev) {
    var m = ev.data, R = rooms[m.room]; if (!R || m.from === me) return;
    setTimeout(function () {
      if (m.leave) { delete R.others[m.from]; } else { var o = R.others[m.from]; var changed = !o || JSON.stringify(o.peer.presence) !== JSON.stringify(m.presence); R.others[m.from] = { seen: Date.now(), peer: { peer: m.from, by: null, isMe: false, sameTab: false, kind: 'viewer', guest: false, presence: changed ? Object.freeze(m.presence) : o.peer.presence, updatedAt: changed ? Date.now() : (o ? o.peer.updatedAt : Date.now()) } }; if (!changed) return; }
      var s = R.api.peers(); R.subs.forEach(function (h) { try { h({ peers: s, joined: [], left: [], updated: [] }); } catch (e) {} });
    }, 35 + Math.random() * 25);
  };
  window.addEventListener('beforeunload', function () { Object.keys(rooms).forEach(function (n) { bc.postMessage({ room: n, from: me, leave: true }); }); });
  return { join: function (name) { if (!rooms[name]) rooms[name] = mkRoom(name); return Promise.resolve(rooms[name].api); }, local: true };
}
(function findRoom(n) {
  if (NET.local) { NET.ns = localRoomNs(); renderNet(); return; }
  if (typeof NET_WS !== 'undefined' && NET_WS && !NET.local) { NET.ns = wsRoomNs((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws/'); renderNet(); return; }
  if (window.claude && window.claude.use) { window.claude.use('room').then(function (ns) { NET.ns = ns || null; if (!ns) NET.err = 'claude.ai did not open the room service for this view (signed out, opened from a public link, or not invited).'; renderNet(); }, function (e) { NET.err = 'Room unavailable: ' + ((e && e.code) || 'error'); renderNet(); }); return; }
  if (n < 40) setTimeout(function () { findRoom(n + 1); }, 100); else { NET.err = 'Not on claude.ai: online play needs the published page, opened while signed in.'; renderNet(); }
})(0);
function netSay(s) { NET.msg = s; renderNet(); }
function netPick() { return {}; }
function netPeers() { return NET.R ? NET.R.peers() : []; }
function netSelfPeer() { var p = netPeers().find(function (q) { return q.isMe && q.sameTab; }); return p ? p.peer : null; }
function netHostPeer() { return netPeers().find(function (p) { return !p.isMe && p.presence && p.presence.role === 'host' && p.presence.v === NET_V; }); }
function netGuests() { return netPeers().filter(function (p) { return !p.isMe && p.presence && p.presence.role === 'client' && p.presence.v === NET_V; }).sort(function (a, b) { return a.peer < b.peer ? -1 : 1; }); }
function netMyPresence(extra) { if (!NET.R) return; var base = { v: NET_V, nick: (NET.nick || 'Player').slice(0, 20), role: NET.role }; NET.R.presence(Object.assign(base, extra || {})).catch(function (e) { NET.err = 'Presence: ' + ((e && e.message) || (e && e.code) || 'error'); }); }
/* ---- joining and leaving ---- */
function netJoin(code, host) {
  if (!NET.ns) { NET.err = NET.err || 'The room is not available in this view.'; renderNet(); return; }
  code = String(code || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8); if (!code) return netSay('Type a room code first.');
  netSay('Connecting…'); NET.err = ''; var tok = NET.joinTok = (NET.joinTok || 0) + 1;
  // a join that never answers is reported instead of leaving the screen silent
  setTimeout(function () { if (NET.joinTok === tok && !NET.R) { netSay(''); NET.err = 'No answer from the room service after 12 seconds. Check that you are signed in to claude.ai and were invited to this page, then reload.'; renderNet(); } }, 12000);
  NET.ns.join('fgw-' + code).then(function (R) { if (NET.joinTok !== tok) { try { R.leave(); } catch (x) {} return; }
    NET.R = R; NET.code = code; NET.role = host ? 'host' : 'client'; NET.joinedAt = Date.now(); NET.req = { slot: -1, id: 'random' }; NET.ready = false;
    if (host) { NET.lob = netDefaultLobby(); netHostResolve(); }
    else netMyPresence({ req: NET.req, ready: false, ing: null, inp: null });
    R.onPeers(function () { netOnPeers(); }, function (e) { NET.err = 'Room closed: ' + e.code; renderNet(); });
    if (R.onConnection) R.onConnection(function (c) { NET.conn = c; renderNet(); });
    // the fast-moving parts of the war travel in rooms of their own
    ['f', 'm', 's0', 's1', 's2', 'c', 'e'].forEach(function (k) { NET.ns.join('fgw-' + code + '-' + k).then(function (X) { NET.X[k] = X; }, function (e) { NET.err = 'Could not open channel ' + k + ' (' + ((e && e.code) || 'error') + ')'; renderNet(); }); });
    netSay(host ? 'Room open. Share the code with your friends.' : 'Joined. Take a seat and wait for the host to begin.');
    if (!host) setTimeout(function () { if (NET.R === R && !netHostPeer()) { NET.err = 'No host in room ' + code.toUpperCase() + '. Check the code, and that the host still has the lobby open. If the host is there, they may be in a different organization: see Share and invites.'; renderNet(); } }, 8000);
  }, function (e) { netSay(''); NET.err = 'Could not join the room (' + ((e && e.code) || 'error') + ').'; renderNet(); });
}
function netLeave() {
  if (running && (NET.mirror || NET.hosting)) endMatch();
  try { if (NET.R) NET.R.leave(); Object.keys(NET.X).forEach(function (k) { NET.X[k].leave(); }); } catch (e) {}
  NET.R = null; NET.X = {}; NET.role = null; NET.game = null; NET.mirror = false; NET.hosting = false; NET.lob = null; MEI = 0; NET.msg = ''; renderNet();
}
/* ---- the lobby: seats for every servant and master ---- */
function netDefaultLobby() { return { kind: CFG.game === 'arena' ? 'arena' : 'war', amode: (CFG.arena && CFG.arena.mode) || 'duel', map: (CFG.arena && CFG.arena.map) || 'bridge', teams: CFG.teams || 7, nights: CFG.nights || 3, diff: CFG.diff, speed: CFG.speed || 1, count: 4, slots: [] }; }
function netSlotLayout(L) {
  var out = [];
  if (L.kind === 'war' || L.amode === 'quickwar') { var T = L.kind === 'war' ? L.teams : 7; for (var t = 0; t < T; t++) { out.push({ t: t, k: 's' }); out.push({ t: t, k: 'm' }); } return out; }
  var D = AR_DEF[L.amode] || AR_DEF.duel, n = L.amode === 'ffa' ? L.count : D.length;
  for (var i = 0; i < n; i++) { var d = D[i] || D[1]; out.push({ t: L.amode === 'teams' ? d.team : L.amode === 'pairs' ? d.team : i, k: d.k }); }
  return out;
}
function netHostResolve() {
  if (NET.role !== 'host' || !NET.lob || NET.resolving) return; NET.resolving = true;
  try { netHostResolve2(); } finally { NET.resolving = false; }
}
function netHostResolve2() {
  var L = NET.lob, lay = netSlotLayout(L), old = L.slots || [];
  L.slots = lay.map(function (s, i) { var o = old[i]; return { t: s.t, k: s.k, id: o && o.k === s.k ? o.id : 'random', p: null }; });
  if (L.amode === 'teams' && L.kind === 'arena') L.slots.forEach(function (s, i) { var o = old[i]; if (o && o.tt !== undefined) s.t = o.tt; });
  var me = netSelfPeer() || 'host';
  var reqs = [{ peer: me, req: NET.req }].concat(netGuests().map(function (p) { return { peer: p.peer, req: p.presence.req || {} }; }));
  reqs.forEach(function (r) {
    var i = r.req && r.req.slot; if (!(i >= 0) || !L.slots[i] || L.slots[i].p) return;
    var s = L.slots[i], T = s.k === 'm' ? MASTERS : SERV, id = T[r.req.id] ? r.req.id : 'random';
    if (id !== 'random' && L.slots.some(function (o) { return o.p && o.k === s.k && o.id === id; })) id = 'random';
    s.p = r.peer; s.id = id;
  });
  netMyPresence({ lob: L, game: NET.game ? netGameInfo() : null });
  renderNet();
}
function netOnPeers() {
  var now = Date.now();
  if (NET.role === 'host') { if (!NET.hosting || !running) netHostResolve(); return; }
  var h = netHostPeer();
  if (h) { NET.lastHostSeen = now; NET.lob = h.presence.lob || null; }
  else if (NET.mirror && now - NET.lastHostSeen > 4000) { endMatch(); netSay('The host left the room.'); }
  var g = h && h.presence.game, me = netSelfPeer();
  if (g && g.id && (!NET.game || g.id !== NET.game.id) && me && g.slots && g.slots[me] !== undefined) netStartGuest(g);
  else if (!g && NET.mirror && running) { endMatch(); netSay('The host ended the game.'); }
  renderNet();
}
/* ---- starting a match ---- */
function netPickIds(L) {
  var S = L.slots, usedS = {}, usedM = {}, usedC = {};
  S.forEach(function (s) { if (s.id !== 'random') { if (s.k === 's') { usedS[s.id] = 1; usedC[SERV[s.id].cls] = 1; } else usedM[s.id] = 1; } });
  var war = L.kind === 'war' || L.amode === 'quickwar';
  return S.map(function (s) {
    if (s.id !== 'random') return s.id;
    if (s.k === 'm') { var mp = MASTER_ORDER.filter(function (id) { return !usedM[id]; }); var mi = mp.length ? mp[Math.floor(Math.random() * mp.length)] : MASTER_ORDER[0]; usedM[mi] = 1; return mi; }
    var pool = ORDER.filter(function (id) { return !usedS[id] && (!war || !usedC[SERV[id].cls]); }); if (!pool.length) pool = ORDER.filter(function (id) { return !usedS[id]; }); if (!pool.length) pool = ORDER;
    var si = pool[Math.floor(Math.random() * pool.length)]; usedS[si] = 1; usedC[SERV[si].cls] = 1; return si;
  });
}
function netGameInfo() { return NET.game; }
function netBuild(g) {
  // the same war on every machine: same teams, same spawns, same homes
  if (g.kind === 'war' || g.amode === 'quickwar' || g.amode === 'pairs') {
    var teams = g.teams.map(function (t) { var d = g.amode === 'pairs' || g.amode === 'quickwar' ? SERV_DUEL : SERV; return { servant: d[t[0]], master: MASTERS[t[1]] }; });
    newWar(teams, { playAs: 'servant', spawnOrder: g.spawn, nights: g.kind === 'war' ? g.nights : undefined, map: g.amode === 'quickwar' ? 'fuyuki' : g.amode === 'pairs' ? g.map : undefined, quick: g.kind !== 'war', plots: g.plots });
  } else {
    var defs = g.defs.map(function (q) { return q[1] === 'm' ? MASTERS[q[0]] : SERV_DUEL[q[0]]; });
    newGame(defs, { map: g.map, mode: g.amode === 'masters' ? 'duel' : g.amode, teams: g.amode === 'teams' ? g.tteams : null });
  }
}
function netStartHost() {
  NET.startedAt = Date.now(); NET.waitSaid = false;
  var L = NET.lob, ids = netPickIds(L), S = L.slots, g = { id: Math.random().toString(36).slice(2, 8), kind: L.kind, amode: L.kind === 'war' ? null : L.amode, nights: L.nights, diff: L.diff, speed: L.speed, slots: {} };
  var war = L.kind === 'war' || L.amode === 'quickwar' || L.amode === 'pairs';
  if (war) {
    var T = 0; S.forEach(function (s) { T = Math.max(T, s.t + 1); });
    g.teams = []; for (var t = 0; t < T; t++) g.teams.push([null, null]);
    S.forEach(function (s, i) { g.teams[s.t][s.k === 's' ? 0 : 1] = ids[i]; });
    g.spawn = L.amode === 'pairs' ? [0, 1] : [0].concat(shuffled([1, 2, 3, 4, 5, 6]));
    g.map = L.amode === 'pairs' ? (L.map === 'random' ? MAP_ORDER.filter(function (m) { return m !== 'arena'; })[Math.floor(Math.random() * (MAP_ORDER.length - 1))] : L.map) : null;
    S.forEach(function (s, i) { if (s.p) g.slots[s.p] = 2 * s.t + (s.k === 's' ? 0 : 1); });
  } else {
    g.defs = S.map(function (s, i) { return [ids[i], s.k]; });
    g.map = L.map === 'random' ? MAP_ORDER.filter(function (m) { return m !== 'arena'; })[Math.floor(Math.random() * (MAP_ORDER.length - 1))] : L.map;
    g.tteams = S.map(function (s) { return s.t; });
    S.forEach(function (s, i) { if (s.p) g.slots[s.p] = i; });
  }
  var me = netSelfPeer() || 'host'; if (g.slots[me] === undefined) { netSay('Take a seat before you begin.'); return; }
  NET.game = g; netBuild(g); if (G.plotOrder) g.plots = G.plotOrder;
  MEI = g.slots[me]; NET.hosting = true; NET.mirror = false; NET.prev = {}; FXLOG = []; FXSEQ = 0; NET.medAt = 0; NET.sentAt = {};
  for (var k = 0; k < G.f.length; k++) G.ai[k] = k === MEI ? null : mkAI(G.f[k], DIFF[L.diff] || DIFF.knight);
  netMarkHumans(g.slots); nsRegistry(); nsWrapFX();
  CFG.speed = L.speed || 1;
  netMyPresence({ lob: L, game: g });
  enterGame(war && g.kind === 'war' ? g.teams.length : 0, g.kind === 'war' ? 'The Holy Grail War' : 'Arena', g.kind === 'war' ? 'Fuyuki City · ' + Object.keys(g.slots).length + ' players' : 'Online · ' + Object.keys(g.slots).length + ' players');
}
function netStartGuest(g) {
  NET.game = g; netBuild(g); MEI = g.slots[netSelfPeer()]; NET.mirror = true; NET.hosting = false; NET.lastSeq = 0; NET.cnt = {}; NET.so = null; NET.lk = -1; NET.mapKey = null; NET.applied = {};
  G.ai = G.ai.map(function () { return null; }); netMarkHumans(g.slots); nsRegistry();
  G.f.forEach(function (f) { f._snap = true; });
  netMyPresence({ req: NET.req, ready: NET.ready, ing: g.id, inp: { mx: 0, my: 0, g: 0, h: 0, c: {}, so: null, lk: -1 } });
  CFG.speed = g.speed || 1;
  enterGame(g.kind === 'war' ? g.teams.length : 0, g.kind === 'war' ? 'The Holy Grail War' : 'Arena', 'Online · hosted by ' + ((netHostPeer() || {}).presence || {}).nick);
}
function netMarkHumans(slots) {
  var n = 1; Object.keys(slots).forEach(function (pe) { var f = G.f[slots[pe]]; if (!f) return; f.humanTag = 'P' + (n++); });
  G.f.forEach(function (f) { if (f.humanTag && f.partner && !f.partner.humanTag) f.partner.isPlayerMate = true; });
}
/* ---- every frame ---- */
function netApplyInputs() {
  if (!NET.hosting || !NET.game) return;
  var byPeer = {}; netPeers().forEach(function (p) { byPeer[p.peer] = p; });
  Object.keys(NET.game.slots).forEach(function (pe) {
    var idx = NET.game.slots[pe], f = G.f[idx], p = byPeer[pe]; if (!f || idx === MEI || f.st === 'dead') return;
    var live = p && p.presence && p.presence.ing === NET.game.id && p.presence.inp;
    if (!live) { if (!G.ai[idx]) { G.ai[idx] = mkAI(f, DIFF[NET.game.diff] || DIFF.knight); } return; }
    if (!(f.turnT > G.time)) G.ai[idx] = null;
    var I = p.presence.inp, pv = NET.prev[pe] || (NET.prev[pe] = {});
    if (f.turnT > G.time) return;
    f.inp.mx = clamp(+I.mx || 0, -1, 1); f.inp.my = clamp(+I.my || 0, -1, 1); f.inp.guard = !!I.g; f.inp.heavy = !!I.h;
    var c = I.c || {}; Object.keys(c).forEach(function (b) { var n = +c[b] || 0; if (pv[b] === undefined) pv[b] = n > 0 ? n - 1 : 0; if (n > pv[b]) { pv[b] = n; if (/^(light|heavy|dodge|skill|np|spirit|target|contract|pact|seal_np|seal_heal|seal_warp)$/.test(b)) doButton(f, b); } });
    if (I.so && f.def.isMaster && f.partner && I.so !== pv.so && STANCES.some(function (q) { return q[0] === I.so; })) { pv.so = I.so; f.partner.stance = I.so; f.partner.anchor = null; }
    if (I.lk !== pv.lk) { pv.lk = I.lk; var t = G.f[I.lk | 0]; f.lock = (I.lk >= 0 && t && t.team !== f.team && t.st !== 'dead') ? t : null; }
    if (I.pt) { NET.pingEcho = NET.pingEcho || {}; NET.pingEcho[pe] = I.pt; }
  });
}
function netHostSend(now) {
  if (!NET.hosting || !NET.game) return;
  function due(k) { if (now - (NET.sentAt[k] || 0) < NS.rate[k.charAt(0)]) return false; NET.sentAt[k] = now; return true; }
  function put(k, d) { var X = NET.X[k]; if (!X) return; X.presence({ d: d }).catch(function (e) { NET.err = 'Send ' + k + ': ' + ((e && e.message) || (e && e.code) || 'error'); }); }
  if (due('f')) put('f', nsFast());
  if (due('e')) put('e', nsEvents());
  if (due('m')) put('m', nsMed());
  if (due('c')) put('c', nsCiv());
  if (due('s')) { var P = nsSlowParts(); put('s0', P[0]); put('s1', P[1]); put('s2', P[2]); }
}
function netRead(k) { var X = NET.X[k]; if (!X) return null; var h = X.peers().find(function (p) { return !p.isMe && p.presence && p.presence.d; }); return h ? h.presence.d : null; }
function netClientFrame(dt) {
  if (!NET.X.f) return;
  var A = NET.applied || (NET.applied = {});
  [['f', nsApplyFast], ['m', nsApplyMed], ['s0', nsApplySlow], ['s1', nsApplySlow], ['s2', nsApplySlow], ['c', nsApplyCiv], ['e', nsApplyEvents]].forEach(function (q) { var d = netRead(q[0]); if (d && d !== A[q[0]]) { A[q[0]] = d; try { q[1](d); } catch (e) { NET.err = 'Apply ' + q[0] + ': ' + e.message; } } });
  G.time += dt;
  G.f.forEach(function (f, i) {
    if (f.nx === undefined) return;
    if (i === MEI && f.st !== 'dead') { nsPredict(f, dt); return; }
    var k = Math.min(1, dt * 12); f.x += (f.nx - f.x) * k; f.y += (f.ny - f.y) * k;
  });
  G.proj.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.trav += Math.hypot(p.vx, p.vy) * dt; });
  G.zones.forEach(function (z) { z.t += dt; }); if (G.marble) G.marble.t += dt;
  (G.civ || []).forEach(function (c) { if (c.nx === undefined) return; var k = Math.min(1, dt * 3); c.x += (c.nx - c.x) * k; c.y += (c.ny - c.y) * k; });
  (G.mobs || []).forEach(function (m) { if (!m || m.nx === undefined) return; var k = Math.min(1, dt * 8); m.x += (m.nx - m.x) * k; m.y += (m.ny - m.y) * k; });
  var me0 = G.f[MEI]; if (me0 && me0.st !== 'dead') pickTarget(me0);
  var mv = readMove(); netMyPresence({ ing: NET.game.id, sum: INTRO ? 1 : 0, inp: { mx: +mv[0].toFixed(2), my: +mv[1].toFixed(2), g: NET.g, h: NET.h, c: NET.cnt, so: NET.so, lk: NET.lk, pt: Math.round(performance.now()) } });
}
function netButton(b, down) {
  if (down) { if (b === 'block') NET.g = 1; else { if (b === 'heavy') NET.h = 1; NET.cnt[b] = (NET.cnt[b] || 0) + 1; } }
  else { if (b === 'block') NET.g = 0; if (b === 'heavy') NET.h = 0; }
}
// guests still watching their summoning (never longer than 45 seconds after the start)
function netGuestsSummoning() {
  if (!NET.hosting || !NET.game || !G || G.mode !== 'war' || G.time > 1 || Date.now() - (NET.startedAt || 0) > 45000) return false;
  return netPeers().some(function (p) { return NET.game.slots[p.peer] !== undefined && p.presence && p.presence.ing === NET.game.id && p.presence.sum === 1; });
}
function netInMatch() { return !!(NET.game && (NET.mirror || NET.hosting)); }
