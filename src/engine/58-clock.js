/* ---- nights and days (Milestone 3b) ----
   A city war runs Night 1, Day 2, Night 2, Day 3 ... and ends on a final night that has no time limit.
   Night: dark streets, short sight, few people about. Day: crowded streets, teams rest at home.
   Civilians are witnesses, never targets: fighting where they can see raises the team's exposure,
   and the Church answers with rumors, a warning, and finally a sanction that shows the team to everyone. */
var HOME_WARD = 0.5, MASTER_GUARD = 0.75, CAUTION = [0.55, 0.4]; // servants break off at this share of health: night 1, later regular nights
var CLOCK = { night: 300, day: 150, nights: 3, fade: 18 };
var CIV = { day: 140, night: 22, walk: 62, run: 210, seeN: 380, seeD: 700, cool: 8 };
var EXPO = { rumor: 35, warn: 70, max: 100, decay: 0.15, sanction: 50, perN: 1.2, perD: 2.6, after: 30 };
var BUSY = [[3700, 4700], [7700, 3400], [8525, 1450], [4050, 2650], [10400, 4780], [6000, 2400], [9300, 6600], [2050, 4880]];
function clockOn() { return !!(G && G.clock); }
function isDay() { return clockOn() && G.clock.phase === 'day'; }
function finalNight() { return clockOn() && G.clock.final; }
// 0 in full day, 1 in full night, with dawn and dusk in between
function darkness() {
  if (!clockOn()) return 0; var c = G.clock, F = CLOCK.fade;
  if (c.phase === 'night') return c.fromDay ? clamp(c.t / F, 0, 1) : 1;
  return Math.max(clamp(1 - c.t / F, 0, 1), clamp(1 - (c.len - c.t) / F, 0, 1));
}
function senseRange() { return 1500 - 800 * darkness(); }
function initClock(opts) {
  var n = opts.nights === undefined ? CLOCK.nights : opts.nights;
  G.expo = {}; G.reveal = {};
  if (!n || G.quick || !MAP.cityW) { G.clock = null; G.civ = []; return; }
  G.clock = { phase: 'night', n: 1, t: 0, len: CLOCK.night, nights: n, final: n <= 1, fromDay: false };
  initCivs();
}
function skipDay() { var c = G.clock; if (c && c.phase === 'day' && c.t < c.len - CLOCK.fade) c.t = c.len - CLOCK.fade; }
// inside one's own house counts as home: the rooms behind its door
function inOwnHome(f) { var F = G.fields && G.fields[f.team]; return !!(F && F.rooms && F.rooms.indexOf(zoneOf(f)) >= 0); }
function clockTick(dt) {
  var c = G.clock; if (!c) return;
  c.t += dt;
  if (!c.final && c.t >= c.len) {
    if (c.phase === 'night') { c.phase = 'day'; c.n++; c.t = 0; c.len = CLOCK.day; startDay(); newPhaseEvents(); FX.phase('day', c.n, false); }
    else { c.phase = 'night'; c.t = 0; c.len = CLOCK.night; c.fromDay = true; scoutsReport(); G.tasks = []; c.final = c.n >= c.nights; newPhaseEvents(); FX.phase('night', c.n, c.final); }
    civShift();
  }
  // resting at home by day: wounds close, mana returns
  if (c.phase === 'day') G.f.forEach(function (f) { if (f.st === 'dead' || !f.home || (Math.hypot(f.x - f.home[0], f.y - f.home[1]) > 700 && !inOwnHome(f))) return; f.hp = Math.min(f.def.hp, f.hp + f.def.hp * 0.012 * dt); if (f.manaMax) f.mana = Math.min(f.manaMax, f.mana + f.manaRegen * dt); });
  for (var t in G.expo) G.expo[t] = Math.max(0, G.expo[t] - EXPO.decay * dt);
  civTick(dt); tasksTick(dt); execTick(dt); scoutsTick(dt); rescueTick(dt);
}
/* ---- what a fighter knows: at night only what is close, what hit them, what rumor or the Church reveals ---- */
function knowsExact(f, e) {
  if (!e || !f || e.team === f.team) return true;
  // an Assassin in Presence Concealment is found only up close, or by the one it just struck
  if (concealed(e) && !(sameZone(f, e) && dist(f, e) < 120) && !(f.lastHit && f.lastHit.by === e && G.time - (f.lastHitT || -99) < 3)) return false;
  if (G.ghost && ghosted(f, e)) return false;
  if (G.seenBy && G.seenBy[f.team] && G.seenBy[f.team][e.idx] > G.time) return true;
  if (G.intel && intelOn(f, e)) return true;
  if (!clockOn() || G.clock.final) return true;
  if (G.reveal[e.team] > G.time) return true;
  var r = senseRange();
  if (sameZone(f, e) && dist(f, e) < r) return true;
  var p = f.partner; if (p && p.st !== 'dead' && sameZone(p, e) && dist(p, e) < r) return true;
  if (G.pacts && G.pacts.length && pactSees(f, e, r)) return true;
  if (f.lastHit && f.lastHit.by === e && G.time - (f.lastHitT || -99) < 8) return true;
  return false;
}
// rumor: the AI knows roughly where an exposed team is and goes there; the player sees an area on the map
function knows(f, e) { return knowsExact(f, e) || (clockOn() && (G.expo[e.team] || 0) >= EXPO.rumor && dist(f, e) < 4000); }
function rumored(team) { return clockOn() && !G.clock.final && (G.expo[team] || 0) >= EXPO.rumor; }
// where an AI goes looking when it knows of nobody: landmarks, rival homes, busy places
function huntPoint(f) {
  var E = G.event;
  if (E && E.kind === 'challenge' && (E.host === f || E.goers[f.idx])) return { x: E.x, y: E.y };
  if (E && E.kind === 'horror' && !f.def.isMaster && f.team !== E.culprit && f.hp > f.def.hp * 0.5) return { x: E.boss.x, y: 2430 };
  var nz = null, nd = 1e9; (G.noise || []).forEach(function (q) { var d = Math.hypot(q.x - f.x, q.y - f.y); if (G.time - q.t < 15 && d < q.r && d < nd && d > 150) { nd = d; nz = q; } });
  if (nz) { f.hunt = { x: nz.x, y: nz.y }; f.huntT = G.time + 20; return f.hunt; }
  if (f.hunt && G.time < f.huntT && dist(f, f.hunt) > 220) return f.hunt;
  var c = BUSY.map(function (p) { return { x: p[0], y: p[1] }; });
  (G.homes || []).forEach(function (h) { if (h.team !== f.team) c.push({ x: h.x, y: h.y }); });
  var best = null, bd = 1e9; for (var i = 0; i < 3; i++) { var q = c[Math.floor(rnd() * c.length)], d = dist(f, q); if (d > 300 && d < bd) { bd = d; best = q; } }
  f.hunt = best || c[0]; f.huntT = G.time + 40; return f.hunt;
}
/* ---- exposure ---- */
function expose(team, v) {
  if (!clockOn() || team === undefined || v <= 0) return;
  var o = G.expo[team] || 0, n = Math.min(EXPO.max, o + v); G.expo[team] = n;
  var quiet = G.expoQuiet; // a killing says it all in one notice
  if (o < EXPO.rumor && n >= EXPO.rumor && !quiet) FX.church('rumor', team);
  if (o < EXPO.warn && n >= EXPO.warn && !quiet) FX.church('warn', team);
  if (n >= EXPO.max) { G.reveal[team] = G.time + EXPO.sanction; G.expo[team] = EXPO.after; if (!quiet) FX.church('sanction', team); churchHeat(team, CHURCH.sanctionHeat); }
}
// a fight at (x, y): civilians close enough see it, flee, and each one counts once
function witness(x, y, teams, k) {
  if (!clockOn() || x > MAP.cityW) return 0;
  var day = isDay(), R = (day ? CIV.seeD : CIV.seeN) * (k > 1 ? 1.7 : 1), n = 0;
  G.civ.forEach(function (c) {
    if (!c.on || Math.abs(c.x - x) > R || Math.abs(c.y - y) > R || Math.hypot(c.x - x, c.y - y) > R) return;
    if (c.flee <= 0) { c.flee = 4 + rnd() * 2; c.fx = x; c.fy = y; }
    if (G.time - c.saw > CIV.cool) { c.saw = G.time; n++; }
  });
  if (n) { var v = n * (day ? EXPO.perD : EXPO.perN) * k * (inFestival(x, y) ? EVT2.festival.mult : 1); teams.forEach(function (t, i) { expose(t, i ? v * 0.5 : v); }); }
  return n;
}
function witnessHit(att, def, a) { if (!clockOn() || !att || att.inM || def.inM) return; if (witness(def.x, def.y, [att.team, def.team], a.power >= 3 ? 3 : 1)) churchDayFight(att); fightNoise(def.x, def.y, a.key === 'np' ? 4500 : 2400); }
// the clash of a fight carries: AI teams within earshot that know of nobody else come to look
function fightNoise(x, y, r) {
  if (!clockOn()) return; G.noise = G.noise || [];
  for (var i = 0; i < G.noise.length; i++) { var q = G.noise[i]; if (G.time - q.t < 3 && Math.abs(q.x - x) < 400 && Math.abs(q.y - y) < 400) { q.r = Math.max(q.r, r); return; } }
  G.noise.push({ x: x, y: y, t: G.time, r: r }); if (G.noise.length > 24) G.noise.shift();
}
/* ---- civilians: walkers on the road graph ---- */
function civNodes() {
  if (MAP._civ) return MAP._civ;
  var rails = MAP.roads.filter(function (r) { return r.kind === 'rail'; });
  var ok = MAP.nav.roadNodes.filter(function (n) { return n.x < MAP.cityW && !rails.some(function (r) { return r.h ? Math.abs(n.y - r.y0) < 10 && n.x >= r.x0 - 5 && n.x <= r.x1 + 5 : Math.abs(n.x - r.x0) < 10 && n.y >= r.y0 - 5 && n.y <= r.y1 + 5; }); });
  var set = {}; ok.forEach(function (n) { set[n.id] = 1; });
  ok.forEach(function (n) { n.cadj = n.adj.filter(function (e) { return set[e.to] && !e.door; }).map(function (e) { return e.to; }); });
  MAP._civ = ok.filter(function (n) { return n.cadj.length; }); return MAP._civ;
}
function civSpawnNode() {
  var ok = civNodes();
  if (rnd() < 0.8) { var b = BUSY[Math.floor(rnd() * BUSY.length)], near = ok.filter(function (n) { return Math.abs(n.x - b[0]) < 900 && Math.abs(n.y - b[1]) < 900; }); if (near.length) return near[Math.floor(rnd() * near.length)]; }
  return ok[Math.floor(rnd() * ok.length)];
}
function initCivs() {
  G.civ = [];
  for (var i = 0; i < CIV.day; i++) { var n = civSpawnNode(); G.civ.push({ id: i, x: n.x + (rnd() - 0.5) * 60, y: n.y + (rnd() - 0.5) * 60, node: n.id, to: -1, off: (rnd() - 0.5) * 70, flee: 0, saw: -99, on: i < CIV.night, onT: -99, spd: CIV.walk * (0.8 + rnd() * 0.4), wait: 0 }); }
}
function civShift() {
  // at dusk most people walk to the nearest doorway and go inside; at dawn they come back out of one
  var want = isDay() ? CIV.day : CIV.night;
  G.civ.forEach(function (c, i) {
    if (c.dead) return; var on = i < want;
    if (on && !c.on) { var n = civSpawnNode(), dp = civDoorway(n.x, n.y); c.x = dp.x; c.y = dp.y; c.node = n.id; c.to = -1; c.onT = G.time; c.going = null; c.out = { x: n.x, y: n.y }; c.on = true; }
    else if (!on && c.on && !c.going) { c.going = civDoorway(c.x, c.y); c.goT = G.time + 28; }
    c.flee = 0;
  });
}
// a point just outside the nearest building wall: where someone steps in or out of a house
function civDoorway(x, y) {
  var rs = rectsIn(x - 420, y - 420, x + 420, y + 420), best = null, bd = 1e9;
  rs.forEach(function (r) { if (r.x1 - r.x0 < 50 || r.y1 - r.y0 < 50) return; var cx = clamp(x, r.x0 + 12, r.x1 - 12), cy = clamp(y, r.y0 + 12, r.y1 - 12), d0 = [cx - r.x0, r.x1 - cx, cy - r.y0, r.y1 - cy], m = Math.min.apply(null, d0), px = cx, py = cy;
    if (m === d0[0]) px = r.x0 - 10; else if (m === d0[1]) px = r.x1 + 10; else if (m === d0[2]) py = r.y0 - 10; else py = r.y1 + 10;
    var d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = { x: px, y: py }; } });
  return best || { x: x, y: y };
}
function civTick(dt) {
  var N = MAP.nav.nodes;
  for (var i = 0; i < G.civ.length; i++) {
    var c = G.civ[i]; if (!c.on) continue;
    if (c.going) { var gx = c.going.x - c.x, gy = c.going.y - c.y, gd = Math.hypot(gx, gy); if (gd < 14 || G.time > c.goT) { c.on = false; c.offT = G.time; c.going = null; continue; } var gs = Math.min(gd, CIV.walk * 1.3 * dt) / gd; c.x += gx * gs; c.y += gy * gs; c.vx = gx / gd; c.vy = gy / gd; rectsIn(c.x - 12, c.y - 12, c.x + 12, c.y + 12).forEach(function (r) { pushOutRect(c, r, 8); }); continue; }
    if (c.out) { var ox = c.out.x - c.x, oy = c.out.y - c.y, od = Math.hypot(ox, oy); if (od < 20) c.out = null; else { var os = Math.min(od, c.spd * dt) / od; c.x += ox * os; c.y += oy * os; c.vx = ox / od; c.vy = oy / od; continue; } }
    if (c.flee > 0) {
      c.flee -= dt; var a = Math.atan2(c.y - c.fy, c.x - c.fx), sp = CIV.run * dt; c.x += Math.cos(a) * sp; c.y += Math.sin(a) * sp; c.vx = Math.cos(a); c.vy = Math.sin(a);
      rectsIn(c.x - 12, c.y - 12, c.x + 12, c.y + 12).forEach(function (r) { pushOutRect(c, r, 8); });
      c.x = clamp(c.x, 20, MAP.cityW - 20); c.y = clamp(c.y, 20, H - 20);
      if (c.flee <= 0) { var best = null, bd = 1e9; civNodes().forEach(function (n) { var d = Math.abs(n.x - c.x) + Math.abs(n.y - c.y); if (d < bd) { bd = d; best = n; } }); c.node = best.id; c.to = -1; }
      continue;
    }
    if (c.wait > 0) { c.wait -= dt; c.vx = c.vy = 0; continue; }
    var from = N[c.node];
    if (c.to < 0) { var adj = from.cadj || []; if (!adj.length) { c.to = c.node; } else { c.to = adj[Math.floor(rnd() * adj.length)]; if (c.fest && G.festival) { var bx = EVT2.festival.x, by = EVT2.festival.y, bn = adj.slice().sort(function (p, q) { return Math.hypot(N[p].x - bx, N[p].y - by) - Math.hypot(N[q].x - bx, N[q].y - by); })[0]; if (Math.hypot(from.x - bx, from.y - by) > 550) c.to = bn; } } }
    var to = N[c.to], dx = to.x - from.x, dy = to.y - from.y, L = Math.hypot(dx, dy) || 1, tx = to.x - dy / L * c.off, ty = to.y + dx / L * c.off;
    var mx = tx - c.x, my = ty - c.y, md = Math.hypot(mx, my);
    if (md < 8) { c.node = c.to; c.to = -1; if (rnd() < 0.15) c.wait = 1 + rnd() * 4; continue; }
    var s = Math.min(md, c.spd * dt); c.x += mx / md * s; c.y += my / md * s; c.vx = mx / md; c.vy = my / md;
    if ((i + Math.floor(G.time * 60)) % 4 === 0) rectsIn(c.x - 12, c.y - 12, c.x + 12, c.y + 12).forEach(function (r) { pushOutRect(c, r, 8); });
  }
}
