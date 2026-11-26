/* ---- multiplayer test: host-authoritative, relayed through the claude.ai room (WebRTC is blocked in artifacts) ---- */
var NET = { ns: null, R: null, role: null, code: '', me: null, game: null, mirror: false, snapAt: 0, sentAt: 0, lastHost: null, seq: 0, ev: [], lastSeq: 0, prev: {}, cnt: {}, g: 0, h: 0, so: null, lk: -1, msg: '' };
var NST = ['idle', 'wind', 'act', 'rec', 'stag', 'dodge', 'counter', 'dead'], NKEY = ['light', 'heavy', 'skill', 'np', 'counter', 'dodge'];
var NNUM = [['t', 100], ['curWind', 100], ['windTotal', 100], ['recDur', 100], ['mom', 1], ['sta', 1], ['spirit', 1], ['combo', 1], ['traceTier', 1], ['ubwT', 10], ['orphanT', 1], ['sigCd', 1], ['silenceT', 1], ['arm', 1], ['armT', 10], ['cd', 10], ['wallT', 10], ['brokenT', 10], ['veilT', 10], ['dodges', 1], ['pull', 100], ['hit', 100]];
(function waitClaude(n) {
  if (window.claude && window.claude.use) { window.claude.use('room').then(function (ns) { NET.ns = ns; renderNet(); }, function () { renderNet(); }); return; }
  if (n < 30) setTimeout(function () { waitClaude(n + 1); }, 100); else renderNet();
})(0);
function netPeers() { return NET.R ? NET.R.peers() : []; }
function netSelf() { var p = netPeers().find(function (q) { return q.isMe && q.sameTab; }); return p ? p.peer : null; }
function netPick() { return { servant: CFG.servant, master: CFG.master, playAs: CFG.playAs }; }
function netSay(s) { NET.msg = s; renderNet(); }
function netJoin(code, host) {
  if (!NET.ns) return netSay('Multiplayer needs this page opened on claude.ai while signed in.');
  code = String(code || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8); if (!code) return netSay('Type a room code first.');
  netSay('Connecting\u2026');
  NET.ns.join('fw-' + code).then(function (R) {
    NET.R = R; NET.code = code; NET.role = host ? 'host' : 'client';
    R.presence(host ? { role: 'host', pick: netPick(), game: null, s: null } : { role: 'client', pick: netPick(), ing: null, inp: null });
    R.onPeers(function () { netOnPeers(); });
    netSay(host ? 'Room open. Share the code; friends join from this same page.' : 'Joined. Waiting for the host to start.');
  }, function (e) { netSay('Could not join the room (' + ((e && e.code) || 'error') + ').'); });
}
function netLeave() { if (NET.mirror) endMatch(); try { if (NET.R) NET.R.leave(); } catch (e) {} NET.R = null; NET.role = null; NET.game = null; NET.mirror = false; MEI = 0; netSay(''); }
function netClients() { return netPeers().filter(function (p) { return !p.isMe && p.presence && p.presence.role === 'client'; }).sort(function (a, b) { return a.peer < b.peer ? -1 : 1; }).slice(0, 3); }
function netHostPeer() { return netPeers().find(function (p) { return !p.isMe && p.presence && p.presence.role === 'host'; }); }
function renderNet() {
  var el = $('#netBox'); if (!el) return;
  var ok = !!NET.ns, inRoom = !!NET.R, html = '';
  $('#netHost').hidden = inRoom; $('#netJoin').hidden = inRoom; $('#netCode').hidden = inRoom; $('#netLeave').hidden = !inRoom;
  $('#netHost').disabled = $('#netJoin').disabled = !ok;
  if (!ok && !NET.msg) NET.msg = 'Multiplayer works on the published page on claude.ai for signed-in people the page is shared with. It is not available in this view.';
  if (inRoom) {
    var list = netPeers().filter(function (p) { return p.presence && p.presence.role; }).map(function (p) { var pk = p.presence.pick || {}, sv = SERV[pk.servant], ma = MASTERS[pk.master]; return '<li>' + (p.presence.role === 'host' ? '<b>Host</b>' : 'Player') + (p.isMe ? ' (you)' : '') + (p.guest ? ' · guest' : '') + ' \u2014 ' + esc(sv ? shortName(sv.name) : '?') + ' with ' + esc(ma ? ma.name : '?') + ', playing the ' + (pk.playAs === 'master' ? 'master' : 'servant') + '</li>'; }).join('');
    html = '<div class="mtag">Room code: <b style="color:var(--bone);font-size:15px;letter-spacing:.2em">' + esc(NET.code.toUpperCase()) + '</b></div><ul class="netlist">' + list + '</ul>';
  }
  el.innerHTML = html + (NET.msg ? '<p class="note">' + esc(NET.msg) + '</p>' : '');
  var go = $('#go'); if (NET.role === 'client') { go.disabled = true; go.textContent = 'Waiting for host'; } else { go.disabled = false; var lb = CFG.game === 'arena' ? 'Start the battle' : 'Begin the war'; go.textContent = NET.role === 'host' ? lb + ' (' + (netClients().length + 1) + ' players)' : lb; }
}
function netOnPeers() {
  renderNet();
  if (NET.role === 'client') {
    var h = netHostPeer(); if (!h) { if (NET.mirror) { endMatch(); netSay('The host left.'); } return; }
    var g = h.presence.game, me = netSelf();
    if (g && g.id !== (NET.game && NET.game.id) && g.slots && me && g.slots[me] !== undefined) startMirror(g);
    else if (!g && NET.mirror) { endMatch(); netSay('The host ended the game.'); }
  }
}
// host: build teams with the human players first, AI filling the remaining classes
function netTeams() {
  var cl = netClients(), teams = [{ servant: SERV[CFG.servant], master: MASTERS[CFG.master] }], slots = {}, usedM = [CFG.master], usedC = [SERV[CFG.servant].cls];
  cl.forEach(function (c) { var pk = c.presence.pick || {}, sv = SERV[pk.servant] || SERV[ORDER[0]], m = pk.master; if (!MASTERS[m] || usedM.indexOf(m) >= 0) m = MASTER_ORDER.find(function (x) { return usedM.indexOf(x) < 0; }); usedM.push(m); usedC.push(sv.cls); var ti = teams.length; teams.push({ servant: sv, master: MASTERS[m] }); slots[c.peer] = 2 * ti + (pk.playAs === 'master' ? 1 : 0); });
  var cls = shuffled(CLASSES.filter(function (c) { return usedC.indexOf(c) < 0; })), ms = shuffled(MASTER_ORDER.filter(function (x) { return usedM.indexOf(x) < 0; }));
  while (teams.length < Math.max(CFG.teams, teams.length) && teams.length < 7 && cls.length) { var c2 = cls.shift(), pool = ORDER.filter(function (id) { return SERV[id].cls === c2; }); teams.push({ servant: SERV[pool[Math.floor(Math.random() * pool.length)]], master: MASTERS[ms.shift() || MASTER_ORDER[0]] }); }
  return { teams: teams, slots: slots };
}
function netMarkHumans(slots) { Object.keys(slots).forEach(function (pe, i) { var f = G.f[slots[pe]]; if (f) { f.humanTag = 'P' + (i + 2); if (f.partner) f.partner.isPlayerMate = true; } }); if (G.f[0]) G.f[0].humanTag = NET.role ? 'P1' : null; }
// ---- host side ----
function netRec(ev) { if (NET.role !== 'host' || !NET.game) return; ev.unshift(++NET.seq); ev.push(+G.time.toFixed(2)); NET.ev.push(ev); if (NET.ev.length > 60) NET.ev.shift(); }
function fRef(o) { return o && o.def && G.f.indexOf(o) >= 0 ? G.f.indexOf(o) : (o && isFinite(o.x) ? [Math.round(o.x), Math.round(o.y)] : -1); }
function aRef(f, a) { if (!a || !a.key) return null; return a.key; }
(function wrapFX() {
  ['text', 'banner', 'fx', 'snd', 'shake', 'spark'].forEach(function (m) { var orig = FX[m]; FX[m] = function () { var r = orig.apply(FX, arguments); try { if (NET.role === 'host' && NET.game) { var A2 = arguments;
    if (m === 'text') netRec(['t', fRef(A2[0]), String(A2[1]).slice(0, 48)]);
    else if (m === 'banner') netRec(['b', String(A2[0] || '').slice(0, 60), String(A2[1] || '').slice(0, 60)]);
    else if (m === 'fx') netRec(['f', A2[0], Math.round(A2[1]), Math.round(A2[2]), fRef(A2[3])]);
    else if (m === 'snd') netRec(['s', A2[0], fRef(A2[1]), aRef(A2[1], A2[2])]);
    else if (m === 'shake') netRec(['k', Math.round(A2[0])]);
    else if (m === 'spark' && (A2[3] || 0) >= 6) netRec(['p', Math.round(A2[0]), Math.round(A2[1]), A2[2], Math.min(14, A2[3] | 0)]);
  } } catch (e) {} return r; }; });
})();
function netApplyInputs() {
  if (NET.role !== 'host' || !NET.game) return;
  var byPeer = {}; netPeers().forEach(function (p) { byPeer[p.peer] = p; });
  Object.keys(NET.game.slots).forEach(function (pe) {
    var idx = NET.game.slots[pe], f = G.f[idx], p = byPeer[pe]; if (!f || f.st === 'dead') return;
    var live = p && p.presence && p.presence.ing === NET.game.id && p.presence.inp;
    if (!live) { if (!G.ai[idx]) G.ai[idx] = mkAI(f, DIFF[CFG.diff]); return; }
    G.ai[idx] = null; var I = p.presence.inp, pv = NET.prev[pe] || (NET.prev[pe] = {});
    f.inp.mx = clamp(+I.mx || 0, -1, 1); f.inp.my = clamp(+I.my || 0, -1, 1); f.inp.guard = !!I.g; f.inp.heavy = !!I.h;
    var c = I.c || {}; Object.keys(c).forEach(function (b) { var n = +c[b] || 0; if (pv[b] === undefined) pv[b] = 0; if (n > pv[b]) { pv[b] = n; if (/^(light|heavy|dodge|skill|np|spirit|target|seal_np|seal_heal|seal_warp)$/.test(b)) doButton(f, b); } });
    if (I.so && f.def.isMaster && f.partner && I.so !== pv.so && STANCES.some(function (q) { return q[0] === I.so; })) { pv.so = I.so; f.partner.stance = I.so; f.partner.anchor = null; }
    if (I.lk !== pv.lk) { pv.lk = I.lk; var t = G.f[I.lk | 0]; f.lock = (I.lk >= 0 && t && t.team !== f.team && t.st !== 'dead') ? t : null; }
  });
}
function r1(v, k) { return Math.round((+v || 0) * k) / (k === 1 ? 1 : 1) ; }
function netSnap() {
  var fs = G.f.map(function (f) {
    if (f.st === 'dead') return [7];
    var a = [NST.indexOf(f.st) >= 0 ? NST.indexOf(f.st) : f.st, f.key ? (NKEY.indexOf(f.key) >= 0 ? NKEY.indexOf(f.key) : f.key) : -1, Math.round(f.x), Math.round(f.y), Math.round(f.face * 100), Math.round(f.hp)];
    NNUM.forEach(function (q) { a.push(Math.round((+f[q[0]] || 0) * q[1])); });
    a.push((f.inM ? 1 : 0) | (f.hid ? 2 : 0) | (f.guarding ? 4 : 0) | (f.sealUsed && f.sealUsed.np ? 8 : 0) | (f.sealUsed && f.sealUsed.heal ? 16 : 0) | (f.sealUsed && f.sealUsed.warp ? 32 : 0) | (f.ubwUsed ? 64 : 0), f.lock ? G.f.indexOf(f.lock) : -1);
    return a;
  });
  var pr = G.proj.slice(-26).map(function (p) { var o = G.f.indexOf(p.owner), k = p.a.key, sub = (p.owner.ubwA && p.a === p.owner.ubwA.sword) ? 1 : (p.owner.A.np && p.a === p.owner.A.np.bullet) ? 2 : 0; return [Math.round(p.x), Math.round(p.y), Math.round(p.vx), Math.round(p.vy), o, NKEY.indexOf(k), sub]; });
  var zs = G.zones.slice(-14).map(function (z) { return [Math.round(z.x), Math.round(z.y), Math.round(z.r), Math.round(z.delay * 100), Math.round(z.t * 100), G.f.indexOf(z.owner), z.a.zshape || '', z.done ? 1 : 0]; });
  var mb = G.marble ? [G.marble.kind, G.f.indexOf(G.marble.owner), Math.round(G.marble.t * 10), Math.round(G.marble.cx), Math.round(G.marble.cy), G.marble.R, G.marble.life] : null;
  var ev = NET.ev.filter(function (e) { return e[e.length - 1] > G.time - 0.6; }).slice(-24);
  var snap = { t: Math.round(G.time * 100), o: G.over ? 1 : 0, w: G.winner ? G.f.indexOf(G.winner) : -1, f: fs, p: pr, z: zs, m: mb, e: ev };
  var js = JSON.stringify(snap); while (js.length > 3500 && (snap.e.length || snap.p.length > 8)) { if (snap.e.length) snap.e.shift(); else snap.p.shift(); js = JSON.stringify(snap); }
  return snap;
}
function netHostSend(now) { if (NET.role !== 'host' || !NET.game || now - NET.sentAt < 50) return; NET.sentAt = now; NET.R.presence({ s: netSnap() }).catch(function () {}); }
// ---- client side ----
function startMirror(g) {
  var teams = g.teams.map(function (t) { return { servant: SERV[t[0]], master: MASTERS[t[1]] }; });
  if (teams.some(function (t) { return !t.servant || !t.master; })) return netSay('This host runs a different version of the page.');
  NET.game = g; NET.mirror = true; NET.cnt = {}; NET.lastSeq = 0; NET.lastHost = null; NET.so = null; NET.lk = -1;
  newWar(teams, { playAs: g.playAs, spawnOrder: g.spawn });
  MEI = g.slots[netSelf()]; netMarkHumans(g.slots); G.f[0].humanTag = 'P1';
  NET.R.presence({ ing: g.id, inp: { mx: 0, my: 0, g: 0, h: 0, c: {}, so: null, lk: -1 } });
  enterGame(teams.length);
}
function netAct(f, key) {
  if (key === 'light') return f.A.lightSeq ? (f.A.lightSeq[f.combo] || f.A.light) : (f.arm >= 0 && f.A.arms ? f.A.arms[f.arm].light : f.A.light);
  if (key === 'heavy') return f.arm >= 0 && f.A.arms ? f.A.arms[f.arm].heavy : f.A.heavy;
  if (key === 'counter') return f.A.skill; return f.A[key] || null;
}
function netApplySnap(s, dt) {
  G.time = s.t / 100; G.over = !!s.o; G.winner = s.w >= 0 ? G.f[s.w] : null;
  s.f.forEach(function (a, i) {
    var f = G.f[i]; if (!f) return;
    if (a[0] === 7) { if (f.st !== 'dead') { f.st = 'dead'; f.t = 0; f.hp = 0; } return; }
    f.st = typeof a[0] === 'number' ? NST[a[0]] : a[0]; f.key = a[1] === -1 ? null : (typeof a[1] === 'number' ? NKEY[a[1]] : a[1]);
    f.nx = a[2]; f.ny = a[3]; if (Math.hypot(f.x - a[2], f.y - a[3]) > 250) { f.x = a[2]; f.y = a[3]; } f.face = a[4] / 100; f.hp = a[5];
    NNUM.forEach(function (q, k) { f[q[0]] = a[6 + k] / q[1]; });
    var fl = a[6 + NNUM.length]; f.inM = !!(fl & 1); f.hid = !!(fl & 2); f.guarding = !!(fl & 4); f.sealUsed = { np: !!(fl & 8), heal: !!(fl & 16), warp: !!(fl & 32) }; f.ubwUsed = !!(fl & 64);
    var lk = a[7 + NNUM.length]; f.lock = lk >= 0 ? G.f[lk] : null; f.foe = f.lock || f.foe;
    if (f.def.trace) f.A = f.traceTier === 2 ? f.def.A2 : f.traceTier === 1 ? f.def.A1 : f.def.A;
    f.act = f.key ? netAct(f, f.key) : null; f.seals = sealsLeft(f);
  });
  G.f.forEach(function (f) { if (f.st !== 'dead' && (!f.foe || f.foe.st === 'dead' || !sameLayer(f, f.foe))) pickTarget(f); });
  G.proj = s.p.map(function (q) { var o = G.f[q[4]]; if (!o) return null; var k = NKEY[q[5]], a = q[6] === 1 ? (o.A.np.sword || (o.ubwA && o.ubwA.sword)) : q[6] === 2 ? o.A.np.bullet : netAct(o, k); if (!a) return null; return { x: q[0], y: q[1], vx: q[2], vy: q[3], owner: o, a: a, mult: 1, range: 2000, trav: 0, dead: false }; }).filter(Boolean);
  G.zones = s.z.map(function (q) { var o = G.f[q[5]]; if (!o) return null; return { x: q[0], y: q[1], r: q[2], delay: q[3] / 100, t: q[4] / 100, owner: o, a: { zshape: q[6] || undefined, dmg: 0 }, done: !!q[7] }; }).filter(Boolean);
  G.marble = s.m ? { kind: s.m[0], owner: G.f[s.m[1]] || G.f[0], t: s.m[2] / 10, cx: s.m[3], cy: s.m[4], R: s.m[5], life: s.m[6], prev: null } : null;
  (s.e || []).forEach(function (e) { if (e[0] <= NET.lastSeq) return; NET.lastSeq = e[0]; netReplay(e); });
}
function fDeref(r) { if (Array.isArray(r)) return { x: r[0], y: r[1], idx: -1 }; return G.f[r] || null; }
function netReplay(e) {
  try {
    var k = e[1];
    if (k === 't') { var f = fDeref(e[2]); if (f) FX.text(f, e[3]); }
    else if (k === 'b') FX.banner(e[2], e[3]);
    else if (k === 'f') FX.fx(e[2], e[3], e[4], fDeref(e[5]) || { x: e[3], y: e[4], idx: -1 });
    else if (k === 's') { var o = fDeref(e[3]); FX.snd(e[2], o || { x: 0, y: 0, idx: -1 }, o && o.A && e[4] ? netAct(o, e[4]) || undefined : undefined); }
    else if (k === 'k') FX.shake(e[2]);
    else if (k === 'p') FX.spark(e[2], e[3], e[4], e[5]);
  } catch (x) {}
}
function netClientFrame(dt) {
  var h = netHostPeer(); if (h && h.presence && h.presence.s && h.presence.s !== NET.lastHost) { NET.lastHost = h.presence.s; netApplySnap(h.presence.s, dt); }
  else { G.time += dt; }
  G.f.forEach(function (f) { if (f.st === 'dead' || f.nx === undefined) return; var k = Math.min(1, dt * 14); f.x += (f.nx - f.x) * k; f.y += (f.ny - f.y) * k; });
  G.proj.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; });
  G.zones.forEach(function (z) { z.t += dt; }); if (G.marble) G.marble.t += dt;
  var mv = readMove(); NET.R.presence({ inp: { mx: +mv[0].toFixed(2), my: +mv[1].toFixed(2), g: NET.g, h: NET.h, c: NET.cnt, so: NET.so, lk: NET.lk } }).catch(function () {});
}
function netButton(b, down) {
  if (down) { if (b === 'block') NET.g = 1; else { if (b === 'heavy') NET.h = 1; NET.cnt[b] = (NET.cnt[b] || 0) + 1; } }
  else { if (b === 'block') NET.g = 0; if (b === 'heavy') NET.h = 0; }
}

