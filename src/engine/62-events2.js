/* ---- second batch of events: the Demolition, the Shadow, the Festival; and the Great Cavern as a fourth final site ---- */
var EVT2 = {
  demo: { charges: 3, ring: 230, plant: 4, disarm: 5, dur: 150, fuse: 20, need: 2, blastR: 460, blastDmg: 45 },
  shadow: { spd: 150, touch: 70, drain: 20, swallow: 0.15, sense: 2000, minNight: 2, minDead: 2 },
  festival: { x: 3700, y: 4700, r: 720, crowd: 45, mult: 3, relicNeed: 15, relicDmg: 1.08 },
  cavern: { chance: 0.15, r0: 1150, r1: 450, grace: 75 }
};
function rebuildRects() { RECTS = []; MAP.b.forEach(function (b) { if (!b.walk) RECTS.push({ x0: b.x - b.w / 2, y0: b.y - b.h / 2, x1: b.x + b.w / 2, y1: b.y + b.h / 2, nb: !!b.nb, b: b }); }); buildRectGrid(); }
/* ---- the Demolition: a mage killer comes to blow up a rival's home. Lore: Kiritsugu and the Hyatt.
   The attacking master plants the charges by hand; the defenders disarm them. If the house goes up,
   it is rubble, and the team starts again at a level 1 backup base. ---- */
function homeBlock(h) { var best = null, bd = 1e9; MAP.b.forEach(function (b) { if (b.ruin || b.x > MAP.cityW) return; if (h.canon ? b.home !== h.key : !b.gen) return; var d = Math.hypot(b.x - h.x, b.y - h.y); if (d < bd) { bd = d; best = b; } }); return bd < 600 ? best : null; }
function freeSpot(x, y, ax, ay) { for (var i = 0; i < 12; i++) { if (!rectsIn(x - 30, y - 30, x + 30, y + 30).some(function (r) { return inRect(r, x, y, 30); })) return [x, y]; x += ax * 40; y += ay * 40; } return [x, y]; }
function startDemolition() {
  var D = EVT2.demo, agg = null, tgt = -1, kir = evAlive('kiritsugu');
  if (kir) agg = kir;
  else { var ms = G.f.filter(function (f) { return f.def.isMaster && f.st !== 'dead' && f.partner && f.partner.st !== 'dead'; }).sort(function (a, b) { return teamKills(b.team) - teamKills(a.team) || (rnd() - 0.5); }); agg = ms[0]; }
  if (!agg) return;
  var kay = evAlive('kayneth');
  if (kay && kay.team !== agg.team && G.fields[kay.team] && G.fields[kay.team].lvl > 0) tgt = kay.team;
  else { var c = Object.keys(G.fields).map(Number).filter(function (t) { var F = G.fields[t]; return t !== agg.team && F.lvl > 0 && masterOf(t) && !F.backup; }).sort(function (a, b) { return G.fields[b].lvl - G.fields[a].lvl || (rnd() - 0.5); }); tgt = c.length ? c[0] : -1; }
  if (tgt < 0) return;
  var F = G.fields[tgt], ch = [];
  for (var i = 0; i < D.charges; i++) { var a = i * 6.283 / D.charges + 0.5, p = freeSpot(F.x + Math.cos(a) * D.ring, F.y + Math.sin(a) * D.ring, Math.cos(a), Math.sin(a)); ch.push({ x: p[0], y: p[1], r: 60, planted: false, prog: 0, dis: 0 }); }
  G.event = { kind: 'demo', agg: agg, team: agg.team, target: tgt, x: F.x, y: F.y, charges: ch, t: 0, dur: D.dur, fuse: -1 };
  FX.event('demo', G.event);
}
function demoTick(E, dt) {
  var D = EVT2.demo, a = E.agg;
  // the defenders always know where the attacking master is
  G.f.forEach(function (f) { if (f.team === E.target) G.seenBy[E.target][a.idx] = G.time + 2; });
  if (a.st === 'dead' && E.fuse < 0) { expose(E.team, 30); endEvent('The bomber is down. The house stands.'); return; }
  E.charges.forEach(function (c) {
    if (!c.planted && a.st !== 'dead' && Math.hypot(a.x - c.x, a.y - c.y) < c.r && a.st !== 'stag') { c.prog += dt; if (c.prog >= D.plant * (upg(E.target, 'bulwark') ? 1.5 : 1)) { c.planted = true; c.prog = 0; c.dis = 0; FX.event('charge', E); } }
    if (c.planted) { var def = G.f.some(function (f) { return f.team === E.target && f.st !== 'dead' && f.spirit !== 2 && Math.hypot(f.x - c.x, f.y - c.y) < c.r && G.time - (f.lastHitT || -99) > 0.6; }); if (def) { c.dis += dt; if (c.dis >= D.disarm) { c.planted = false; c.dis = 0; FX.event('disarm', E); } } else c.dis = Math.max(0, c.dis - dt * 0.5); }
  });
  var n = E.charges.filter(function (c) { return c.planted; }).length;
  if (E.fuse < 0 && n === D.charges) { E.fuse = D.fuse; FX.event('fuse', E); }
  if (E.fuse >= 0) { E.fuse -= dt; if (E.fuse <= 0) { if (n >= D.need) demolish(E); else { expose(E.team, 30); grantPerk(E.target, 'ward'); endEvent('Too few charges went off. The house stands.'); } return; } }
  else if (E.t >= E.dur) { expose(E.team, 30); grantPerk(E.target, 'ward'); endEvent('The bomber ran out of time. The house stands.'); }
}
function demolish(E) {
  var D = EVT2.demo, F = G.fields[E.target], h = G.homes.filter(function (q) { return q.team === E.target; })[0];
  G.f.forEach(function (f) { if (f.st !== 'dead' && f.spirit !== 2 && f.x < MAP.cityW && Math.hypot(f.x - F.x, f.y - F.y) < D.blastR) hurt(null, f, { dmg: D.blastDmg, power: 3, stag: 1.0, kind: 'proj', key: 'blast', hs: 0.1, unblock: true }, 1, { x: F.x, y: F.y }); });
  var b = h && homeBlock(h); if (b) { b.ruin = true; b.k = 'rubble'; }
  if (G.upg && G.upg[E.target]) G.upg[E.target].have = {}; // the upgrades were in the house
  (MAP.doors || []).forEach(function (d) { if (F.rooms.indexOf(d.room) >= 0) d.ruined = true; });
  // the backup base: a small safehouse on a free plot
  var used = G.homes.map(function (q) { return [q.x, q.y - 120]; }), free = MAP.plots.filter(function (p) { return !used.some(function (u) { return Math.hypot(u[0] - p[0], u[1] - p[1]) < 300; }) && !MAP.b.some(function (q) { return q.gen && Math.hypot(q.x - p[0], q.y - p[1]) < 200; }); });
  var p = free.sort(function (a2, b2) { return Math.hypot(a2[0] - F.x, a2[1] - F.y) - Math.hypot(b2[0] - F.x, b2[1] - F.y); })[0] || MAP.plots[0];
  MAP.b.push({ x: p[0], y: p[1] - 20, w: 200, h: 150, k: 'safehouse', gen: true, name: 'Backup safehouse' }); rebuildRects();
  if (h) { h.x = p[0]; h.y = p[1] + 110; h.canon = false; h.name = 'Backup safehouse'; }
  var hh = h || {}; if (giveEstate(hh, p[0], p[1] + 80, 'Backup safehouse')) { MAP.nav = null; buildNav(MAP); }
  F.x = p[0]; F.y = p[1] + 110; F.lvl = 1; F.rooms = hh.room ? [hh.room] : []; F.backup = true; F.name = 'Backup safehouse'; F.inside = {};
  G.f.forEach(function (f) { if (f.team === E.target) f.home = [F.x, F.y]; });
  var am = masterOf(E.team); if (am) am.manaBonus = (am.manaBonus || 0) + 40;
  FX.event('demolished', { team: E.target, agg: E.team, x: E.x, y: E.y }); FX.shake(18);
  endEvent(null);
}
/* ---- the Shadow: the Grail's corruption walks the streets. It cannot be fought, only fled.
   It swallows the weakened. Once it has been seen, the Grail will be black. ---- */
function shadowOk() { var c = G.clock; return c.n >= EVT2.shadow.minNight && G.f.filter(function (f) { return f.st === 'dead' && !f.def.isMaster; }).length >= EVT2.shadow.minDead; }
function startShadow() {
  var ok = civNodes().filter(function (n) { return G.f.every(function (f) { return f.st === 'dead' || f.x > MAP.cityW || Math.hypot(f.x - n.x, f.y - n.y) > 1500; }); }), n = ok.length ? ok[Math.floor(rnd() * ok.length)] : civNodes()[0];
  G.shadowSeen = true;
  G.event = { kind: 'shadow', x: n.x, y: n.y, t: 0, stun: 0, wand: null, wandT: 0 }; FX.event('shadow', G.event);
}
function shadowTick(E, dt) {
  var S = EVT2.shadow;
  if (E.stun > 0) { E.stun -= dt; return; }
  var tg = null, bd = S.sense;
  G.f.forEach(function (f) { if (f.st === 'dead' || f.x > MAP.cityW || f.spirit === 2) return; var d = Math.hypot(f.x - E.x, f.y - E.y), weak = f.hp < f.def.hp * 0.5; if ((weak && d < bd) || (d < 900 && d < bd * 0.5)) { bd = weak ? d : d * 2; tg = f; } });
  var gx, gy;
  if (tg) { gx = tg.x; gy = tg.y; } else { if (!E.wand || E.wandT < G.time || Math.hypot(E.x - E.wand.x, E.y - E.wand.y) < 80) { var q = BUSY[Math.floor(rnd() * BUSY.length)]; E.wand = { x: q[0], y: q[1] }; E.wandT = G.time + 20; } gx = E.wand.x; gy = E.wand.y; }
  var d = Math.hypot(gx - E.x, gy - E.y); if (d > 5) { E.x += (gx - E.x) / d * S.spd * dt; E.y += (gy - E.y) / d * S.spd * dt; }
  G.f.forEach(function (f) {
    if (f.st === 'dead' || f.x > MAP.cityW || f.spirit === 2 || Math.hypot(f.x - E.x, f.y - E.y) > S.touch + FR) return;
    f.hp -= S.drain * dt; f.stat.taken += S.drain * dt; f.lastHitT = G.time;
    if (f.hp < f.def.hp * S.swallow || f.hp <= 0) { f.cause = 'shadow'; FX.event('swallowed', { f: f, team: f.team }); kill(f, true); }
  });
  G.civ.forEach(function (c) { if (c.on && Math.hypot(c.x - E.x, c.y - E.y) < 500 && c.flee <= 0) { c.flee = 4; c.fx = E.x; c.fy = E.y; } });
}
// a Noble Phantasm cannot hurt the Shadow, but it can drive it back
function npRepelsShadow(f) { var E = G.event; if (!E || E.kind !== 'shadow' || Math.hypot(f.x - E.x, f.y - E.y) > 600) return; var a = Math.atan2(E.y - f.y, E.x - f.x); E.x += Math.cos(a) * 260; E.y += Math.sin(a) * 260; E.stun = 3; FX.event('repelled', E); }
function shadowNear(f, r) { var E = G.event; return !!(E && E.kind === 'shadow' && f.x < MAP.cityW && Math.hypot(f.x - E.x, f.y - E.y) < (r || 500)); }
/* ---- the Festival: the shopping street is packed. Fighting there is seen by everyone, and a relic is for sale ---- */
function startFestival() {
  var Fs = EVT2.festival, ns = civNodes().filter(function (n) { return Math.hypot(n.x - Fs.x, n.y - Fs.y) < 650; }), extra = 0;
  if (ns.length) G.civ.forEach(function (c) { if (extra >= Fs.crowd || c.on) return; var n = ns[Math.floor(rnd() * ns.length)]; c.on = true; c.onT = G.time; c.x = n.x; c.y = n.y; c.node = n.id; c.to = -1; c.fest = true; extra++; });
  G.festival = true;
  G.tasks.push({ kind: 'relic', x: Fs.x, y: Fs.y, r: 120, name: 'The relic stall', need: Fs.relicNeed, prog: {}, done: {} });
  FX.event('festival', {});
}
function inFestival(x, y) { return !!(G.festival && isDay() && Math.hypot(x - EVT2.festival.x, y - EVT2.festival.y) < EVT2.festival.r); }
function relicDone(t, k) { k.claimed = t; var s = G.f.filter(function (f) { return f.team === t && !f.def.isMaster && f.st !== 'dead'; })[0] || masterOf(t); if (s) { s.relic = true; FX.text(s, 'RELIC CLAIMED'); } FX.event('relic', { team: t }); }
/* ---- the Great Cavern: the rarest final site, always corrupted. The fight happens underground ---- */
function cavernSite() { var rm = (MAP.rooms || []).filter(function (r) { return r.id === 'cavern'; })[0]; return rm ? { x: (rm.x0 + rm.x1) / 2, y: (rm.y0 + rm.y1) / 2 + 100, name: 'the Great Cavern beneath Ryuudou Temple', cavern: true, room: rm } : null; }
function inCavern(f) { var rm = roomAt(f.x, f.y); return !!(rm && rm.id === 'cavern'); }
