/* ---- online play, part 2: replicating the host's war to every guest ----
   The host runs the whole simulation. Its state travels in several named rooms (one presence object each, at most
   4 KiB): F fast (fighters' moving parts, shots, zones; ~15/s), M (every other field of a few fighters at a time,
   rotating), S (the war: clock, fields, events, pacts...; generic), C (civilians and familiars), E (effects and
   sounds, with sequence numbers so each plays once). Guests rebuild the same war at the start and overwrite it
   with what arrives; their own character moves at once and is corrected toward the host. */
var NS = { rate: { f: 66, m: 240, s: 480, c: 380, e: 100 }, max: 3900, reg: [], regMap: null };
var FAST = ['x', 'y', 'face', 'hp', 't', 'curWind', 'windTotal', 'recDur', 'sta', 'mom', 'combo', 'spirit', 'kx', 'ky', 'iframes', 'hit', 'mana', 'hs', 'dodges', 'cd'];
var FAST_FLAGS = ['guarding', 'hid', 'cnc', 'inM'];
var NST2 = ['idle', 'wind', 'act', 'rec', 'stag', 'dodge', 'counter', 'dead', 'move'];
var MED_SKIP = { idx: 1, def: 1, A: 1, inp: 1, buf: 1, nav: 1, patrol: 1, patrolT: 1, hunt: 1, huntT: 1, stat: 1, act: 1, st: 1, key: 1, anchor: 1, home: 1, foe: 0, nx: 1, ny: 1, sface: 1 }; // nx, ny, sface: the guest's own interpolation targets, never sent by the host
FAST.concat(FAST_FLAGS).forEach(function (k) { MED_SKIP[k] = 1; });
var G_SKIP = { f: 1, proj: 1, zones: 1, ai: 1, civ: 1, mobs: 1, noise: 1, seed: 1, homes: 1, circles: 1, marble: 1, time: 1, hitstop: 1, traces: 1, deck: 1, pactHate: 1, pactAsk: 1, pactT: 1, pactCd: 1, pactLog: 1, mode: 1, quick: 1 };
// every attack table the fighters in this war can use gets a number, the same on every machine
function nsRegistry() {
  NS.reg = []; var seen = [];
  function walk(o, d) { if (!o || typeof o !== 'object' || d > 4 || seen.indexOf(o) >= 0) return; seen.push(o); if (o.key || o.kind) NS.reg.push(o); Object.keys(o).forEach(function (k) { var v = o[k]; if (v && typeof v === 'object' && k !== 'def' && k !== 'owner') walk(v, d + 1); }); }
  G.f.forEach(function (f) { [f.def.A, f.def.A1, f.def.A2].forEach(function (A) { walk(A, 0); }); });
}
function nsActId(a) { return a ? NS.reg.indexOf(a) : -1; }
function nsAct(i) { return i >= 0 ? NS.reg[i] || null : null; }
// a generic, reference-aware encoding: fighters, familiars and attacks travel as numbers
function nenc(v, d) {
  if (v === null || v === undefined) return null;
  var t = typeof v;
  if (t === 'number') return isFinite(v) ? Math.round(v * 100) / 100 : 0;
  if (t === 'string' || t === 'boolean') return v;
  if (t !== 'object' || (d || 0) > 5) return null;
  var fi = G.f.indexOf(v); if (fi >= 0) return { $f: fi };
  if (G.mobs) { var mi = G.mobs.indexOf(v); if (mi >= 0) return { $m: mi }; }
  var ai = NS.reg.indexOf(v); if (ai >= 0) return { $a: ai };
  if (Array.isArray(v)) return v.slice(0, 64).map(function (x) { return nenc(x, (d || 0) + 1); });
  var o = {}; for (var k in v) { if (!Object.prototype.hasOwnProperty.call(v, k) || k.charAt(0) === '_' || typeof v[k] === 'function') continue; o[k] = nenc(v[k], (d || 0) + 1); } return o;
}
function ndec(v) {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(ndec);
  if (v.$f !== undefined) return G.f[v.$f] || null;
  if (v.$m !== undefined) { G.mobs = G.mobs || []; if (!G.mobs[v.$m]) G.mobs[v.$m] = { x: -9999, y: -9999, hp: 1, max: 1, r: 20 }; return G.mobs[v.$m]; } // filled in place when the familiars arrive
  if (v.$a !== undefined) return nsAct(v.$a);
  var o = {}; for (var k in v) o[k] = ndec(v[k]); return o;
}
function nsSize(o) { try { return JSON.stringify(o).length; } catch (e) { return 99999; } }
// ---- host: pack ----
function nsFast() {
  var fs = G.f.map(function (f) {
    var a = [NST2.indexOf(f.st), f.key ? f.key : 0, nsActId(f.act)];
    FAST.forEach(function (k) { var v = f[k]; a.push(typeof v === 'number' ? Math.round(v * 100) / 100 : 0); });
    var fl = 0; FAST_FLAGS.forEach(function (k, i) { if (f[k]) fl |= 1 << i; }); a.push(fl);
    return a;
  });
  var pr = G.proj.slice(-40).map(function (p) { return [Math.round(p.x), Math.round(p.y), Math.round(p.vx), Math.round(p.vy), G.f.indexOf(p.owner), nsActId(p.a), Math.round(p.trav || 0)]; });
  var zs = G.zones.slice(-16).map(function (z) { return [Math.round(z.x), Math.round(z.y), Math.round(z.r), Math.round(z.delay * 100) / 100, Math.round(z.t * 100) / 100, G.f.indexOf(z.owner), nsActId(z.a), z.done ? 1 : 0, z.a && z.a.zshape || 0]; });
  var mb = G.marble ? nenc(G.marble) : null;
  var out = { t: Math.round(G.time * 1000) / 1000, h: Math.round((G.hitstop || 0) * 100) / 100, o: G.over ? 1 : 0, w: G.winner ? G.f.indexOf(G.winner) : -1, fs: fs, p: pr, z: zs, mb: mb, pg: NET.pingEcho || null };
  while (nsSize(out) > NS.max && out.p.length) out.p.shift();
  return out;
}
function nsMed() {
  // all the other fields, a few fighters per message, rotating through the war
  var out = { t: Math.round(G.time * 100) / 100, ff: {} }, n = G.f.length, start = NET.medAt || 0, i = 0;
  for (; i < n; i++) {
    var k = (start + i) % n, f = G.f[k], o = {};
    for (var key in f) { if (MED_SKIP[key] || key.charAt(0) === '_' || !Object.prototype.hasOwnProperty.call(f, key)) continue; var v = f[key]; if (v === 0 || v === false || v === null || v === undefined) continue; o[key] = nenc(v, 1); }
    o.st = f.st; out.ff[k] = o;
    if (nsSize(out) > NS.max) { delete out.ff[k]; break; }
  }
  NET.medAt = (start + Math.max(1, i)) % n;
  return out;
}
function nsSlowParts() {
  // the war itself, packed into as many rooms as it needs (up to three)
  var parts = [{}, {}, {}], sz = [0, 0, 0];
  var keys = Object.keys(G).filter(function (k) { return !G_SKIP[k] && typeof G[k] !== 'function'; });
  keys.push('$map'); keys.push('$stat');
  keys.forEach(function (k) {
    var v = k === '$map' ? nsMapMods() : k === '$stat' ? nsStats() : nenc(G[k], 0), s = nsSize(v) + k.length + 4;
    for (var i = 0; i < 3; i++) if (sz[i] + s < NS.max - 60) { parts[i][k] = v; sz[i] += s; return; }
    NET.dropped = k; // too big this time: try again next round
  });
  return parts;
}
function nsStats() { var o = {}; G.f.forEach(function (f, i) { if (f.humanTag || i === MEI) o[i] = f.stat; }); return o; }
// buildings that changed during the war (estates, rubble, backup safehouses) and the doors that go with them
function nsMapMods() {
  if (!MAP.cityW) return null;
  return { b: MAP.b.filter(function (q) { return q.gen || q.ruin; }).map(function (q) { return [q.x, q.y, q.w, q.h, q.k, q.name || '', q.ruin ? 1 : 0, q.gen ? 1 : 0]; }),
    d: MAP.doors.filter(function (d) { return d.gen || d.ruined; }).map(function (d) { return [d.id, d.room, d.out.x, d.out.y, d.in.x, d.in.y, d.ruined ? 1 : 0, d.gen ? 1 : 0]; }) };
}
function nsCiv() {
  var out = { c: (G.civ || []).filter(function (c) { return c.on; }).slice(0, 150).map(function (c) { return [c.id, Math.round(c.x), Math.round(c.y), c.flee > 0 ? 1 : 0]; }), m: (G.mobs || []).map(function (m) { var o = {}; for (var k in m) { if (k.charAt(0) === '_' || typeof m[k] === 'function') continue; o[k] = nenc(m[k], 1); } return o; }) };
  while (nsSize(out) > NS.max && out.m.length) out.m.pop();
  while (nsSize(out) > NS.max && out.c.length) out.c.pop();
  return out;
}
// effects: every FX call the host makes, so guests see and hear the same war
var FXLOG = [], FXSEQ = 0, FXREPLAY = false;
var FX_NET = ['text', 'banner', 'fx', 'snd', 'shake', 'spark', 'slow', 'say', 'duo', 'phase', 'church', 'field', 'truename', 'task', 'event', 'turned', 'unturned', 'hesitate', 'pact', 'shieldBroken', 'enkidu'];
function nsWrapFX() {
  FX_NET.forEach(function (m) {
    var orig = FX[m]; if (!orig || orig._net) return;
    var w = function () {
      if (NET.hosting && !FXREPLAY && G) {
        try { var args = [].slice.call(arguments).map(function (a) { return nenc(a, 1); }); FXLOG.push([++FXSEQ, m, args, Math.round(G.time * 100) / 100, fxPos ? [Math.round(fxPos.x), Math.round(fxPos.y)] : null]); if (FXLOG.length > 160) FXLOG.shift(); } catch (e) {}
      }
      return orig.apply(FX, arguments);
    };
    w._net = true; FX[m] = w;
  });
}
var FX_LOW = { spark: 1, snd: 0, text: 0 };
function nsEvents() {
  var cut = G.time - 1.2, ev = FXLOG.filter(function (e) { return e[3] >= cut; });
  var out = { e: ev };
  while (nsSize(out) > NS.max && out.e.length) { var j = -1; for (var i = 0; i < out.e.length; i++) if (FX_LOW[out.e[i][1]]) { j = i; break; } out.e.splice(j >= 0 ? j : 0, 1); }
  return out;
}
// ---- guest: apply ----
function nsApplyFast(s) {
  if (!s || !G) return;
  NET.hostT = s.t; G.hitstop = s.h || 0; G.over = !!s.o; G.winner = s.w >= 0 ? G.f[s.w] : null;
  s.fs.forEach(function (a, i) {
    var f = G.f[i]; if (!f) return;
    var st = NST2[a[0]] || 'idle';
    if (st === 'dead' && f.st !== 'dead') { f.t = 0; }
    // the guest's predicted attack holds until the host reports it (or the guess runs out)
    var held = i === MEI && NET.pred && performance.now() < NET.pred.until && st === 'idle'; if (i === MEI && NET.pred && (st !== 'idle' || performance.now() >= NET.pred.until)) NET.pred = null;
    if (!held) { f.st = st; f.key = a[1] || null; f.act = nsAct(a[2]); }
    var tnow = performance.now() / 1000, ox = f.nx, oy = f.ny;
    FAST.forEach(function (k, j) { var v = a[3 + j]; if (held && (k === 't' || k === 'curWind' || k === 'windTotal')) return; if (k === 'x') f.nx = v; else if (k === 'y') f.ny = v; else if (k === 'face' && i === MEI && f.st === 'idle') f.sface = v; else f[k] = v; });
    var fl = a[3 + FAST.length]; FAST_FLAGS.forEach(function (k, j) { f[k] = !!(fl & (1 << j)); });
    if (ox !== undefined && f._lt) { var gdt = tnow - f._lt; if (gdt > 0.02) { var vx = (f.nx - ox) / gdt, vy = (f.ny - oy) / gdt; if (Math.hypot(vx, vy) > 1400) { vx = 0; vy = 0; } f._vx = (f._vx || 0) * 0.4 + vx * 0.6; f._vy = (f._vy || 0) * 0.4 + vy * 0.6; } }
    f._lt = tnow;
    if (f.nx !== undefined && (f.x === undefined || Math.hypot(f.x - f.nx, f.y - f.ny) > 260 || f._snap)) { f.x = f.nx; f.y = f.ny; f._snap = false; f._vx = f._vy = 0; }
  });
  G.proj = s.p.map(function (q) { var o = G.f[q[4]], a = nsAct(q[5]); if (!o || !a) return null; return { x: q[0], y: q[1], vx: q[2], vy: q[3], owner: o, a: a, mult: 1, range: 99999, trav: q[6], dead: false }; }).filter(Boolean);
  G.zones = s.z.map(function (q) { var o = G.f[q[5]]; if (!o) return null; var a = nsAct(q[6]) || { zshape: q[8] || undefined, dmg: 0 }; return { x: q[0], y: q[1], r: q[2], delay: q[3], t: q[4], owner: o, a: a, done: !!q[7] }; }).filter(Boolean);
  G.marble = s.mb ? ndec(s.mb) : null;
  var me = netSelfPeer(); if (s.pg && me && s.pg[me] !== undefined) { var rtt = performance.now() - s.pg[me]; if (rtt >= 0 && rtt < 5000) NET.ping = NET.ping ? NET.ping * 0.8 + rtt * 0.2 : rtt; }
  G.time = s.t;
}
function nsApplyMed(s) {
  if (!s || !G) return;
  Object.keys(s.ff).forEach(function (k) {
    var f = G.f[k], o = s.ff[k]; if (!f) return;
    // a field the host no longer sends went back to zero, false or nothing
    for (var key in f) { if (MED_SKIP[key] || key.charAt(0) === '_' || o[key] !== undefined) continue; var cur = f[key]; if (typeof cur === 'number') f[key] = 0; else if (typeof cur === 'boolean') f[key] = false; else if (cur && typeof cur === 'object' && !Array.isArray(cur) && key !== 'sealUsed') f[key] = null; }
    for (var key2 in o) { if (key2 === 'st') continue; f[key2] = ndec(o[key2]); }
    if (f.def.trace) f.A = f.traceTier === 2 ? f.def.A2 : f.traceTier === 1 ? f.def.A1 : f.def.A;
    if (!f.sealUsed) f.sealUsed = {};
  });
}
function nsApplySlow(p) {
  if (!p || !G) return;
  Object.keys(p).forEach(function (k) {
    if (k === '$map') return nsApplyMap(p[k]);
    if (k === '$stat') { Object.keys(p[k] || {}).forEach(function (i) { if (G.f[i] && p[k][i]) G.f[i].stat = p[k][i]; }); return; }
    G[k] = ndec(p[k]);
  });
}
function nsApplyMap(m) {
  if (!m || !MAP.cityW) return;
  var key = JSON.stringify(m); if (key === NET.mapKey) return; NET.mapKey = key;
  MAP.b = MAP.b.filter(function (q) { return !q.gen; });
  m.b.forEach(function (q) {
    if (q[7]) MAP.b.push({ x: q[0], y: q[1], w: q[2], h: q[3], k: q[4], name: q[5], gen: true, ruin: !!q[6] });
    else MAP.b.forEach(function (b) { if (b.x === q[0] && b.y === q[1]) { b.ruin = !!q[6]; b.k = q[4]; } });
  });
  MAP.doors = MAP.doors.filter(function (d) { return !d.gen; });
  m.d.forEach(function (q) {
    if (q[7]) MAP.doors.push({ id: q[0], room: q[1], gen: true, ruined: !!q[6], out: { x: q[2], y: q[3], nx: 0, ny: 1 }, in: { x: q[4], y: q[5], nx: 0, ny: 1 } });
    else MAP.doors.forEach(function (d) { if (d.id === q[0]) d.ruined = !!q[6]; });
  });
  rebuildRects(); if (MAP._cc) MAP._cc = null;
}
function nsApplyCiv(s) {
  if (!s || !G) return;
  var byId = {}; (G.civ || []).forEach(function (c) { byId[c.id] = c; c._seen = false; });
  s.c.forEach(function (q) { var c = byId[q[0]]; if (!c) { c = { id: q[0], x: q[1], y: q[2], on: true, flee: 0, spd: 60 }; G.civ.push(c); byId[q[0]] = c; } c.nx = q[1]; c.ny = q[2]; c.on = true; c.flee = q[3] ? 1 : 0; c._seen = true; if (c.x === undefined) { c.x = q[1]; c.y = q[2]; } });
  (G.civ || []).forEach(function (c) { if (!c._seen) c.on = false; });
  var mobs = ndec(s.m) || [];
  G.mobs = G.mobs || [];
  mobs.forEach(function (m, i) { if (!m) return; var cur = G.mobs[i]; if (cur) { for (var k in m) if (k !== 'x' && k !== 'y') cur[k] = m[k]; cur.nx = m.x; cur.ny = m.y; if (cur.x === undefined || cur.x < -9000 || Math.hypot(cur.x - m.x, cur.y - m.y) > 300) { cur.x = m.x; cur.y = m.y; } } else G.mobs[i] = m; });
  if (G.mobs.length > mobs.length && !(G.event && /horror|school|shadow/.test(G.event.kind || ''))) G.mobs.length = mobs.length;
}
function nsApplyEvents(s) {
  if (!s || !G) return;
  s.e.forEach(function (e) {
    if (e[0] <= (NET.lastSeq || 0)) return; NET.lastSeq = e[0];
    var m = e[1]; if (!FX[m]) return;
    try { if (e[4]) fxPos = { x: e[4][0], y: e[4][1] }; FXREPLAY = true; FX[m].apply(FX, e[2].map(ndec)); } catch (x) {} finally { FXREPLAY = false; }
  });
}
// the guest's own character answers the stick at once; the host's position then pulls it back into line
function nsPredict(f, dt) {
  var mv = readMove(), sp = f.def.spd * (f.guarding ? 0.55 : 1) * (f.spirit === 2 ? 1.3 : f.spirit ? 0.5 : 1);
  if (f.st === 'idle' && !(f.rootT > 0) && !(f.boundT > G.time)) { f.x += mv[0] * sp * dt; f.y += mv[1] * sp * dt; if (Math.hypot(mv[0], mv[1]) > 0.2) f.face = Math.atan2(mv[1], mv[0]); }
  if (RECTS.length) rectsIn(f.x - 60, f.y - 60, f.x + 60, f.y + 60).forEach(function (r) { pushOutRect(f, r, FR); });
  if (f.nx !== undefined) { var k = Math.min(1, dt * (f.st === 'idle' ? 5 : 14)); f.x += (f.nx - f.x) * k; f.y += (f.ny - f.y) * k; }
}
