/* ---- the Church keeps the war hidden ----
   Civilians can be struck down, and it costs: a killing is seen, the team is exposed and shown to everyone, and
   the Church's patience (G.church.heat) runs out. Fighting in daylight in front of witnesses wears it down too.
   When a team's heat reaches CHURCH.sendAt, Executors leave Kotomine Church (or come in from the edge of the city
   when a player is near the Church) and walk the roads to hunt that team, masters first. They never appear in
   sight of a player. Executors are mobs (G.mobs, exec: true), so blows, shots and online sync already reach them. */
var CHURCH = {
  civExpo: 45, civReveal: 60, civHeat: 4, dayHeat: 1, dayHeatCd: 4, sanctionHeat: 4, execKillHeat: 2, sendAt: 4,
  cd: 70, squad: 2, squadMax: 4, liveMax: 8,
  hp: 130, spd: 238, r: 15, reach: 50, dmg: 10, swing: 0.95, throwR: 460, throwCd: 3.0, keyDmg: 7, keySpd: 950, keyN: 3, keySpread: 0.07,
  servantMul: 0.5, seeR: 650, repath: 2.5, track: 2, leaveAfter: 260, farFromHumans: 1500, bodyT: 90
};
function churchSt() { if (!G.church) G.church = { heat: {}, cd: {}, waves: {}, kills: {}, dayT: {}, keys: [], sent: 0, slain: 0 }; return G.church; }
function churchOn() { return clockOn() && G.mode === 'war' && !G.quick && !!MAP.cityW; }
/* ---- civilians struck down ---- */
function civStruck(c, f) {
  if (!c || c.dead || !c.on || !churchOn()) return;
  var C = churchSt(), t = f.team, before = C.waves[t] || 0;
  c.dead = true; c.on = false; c.offT = G.time; c.flee = 0; c.going = null;
  G.bodies = G.bodies || []; G.bodies.push({ x: Math.round(c.x), y: Math.round(c.y), a: Math.round((c.vx || 0) * 100) / 100, id: c.id, t: Math.round(G.time) }); if (G.bodies.length > 30) G.bodies.shift();
  C.kills[t] = (C.kills[t] || 0) + 1;
  G.expoQuiet = true; witness(c.x, c.y, [t], 3); fightNoise(c.x, c.y, 2600);
  expose(t, CHURCH.civExpo * (C.kills[t] > 1 ? 1.5 : 1)); G.expoQuiet = false;
  G.reveal[t] = Math.max(G.reveal[t] || 0, G.time + CHURCH.civReveal);
  G.expoQuiet = true; churchHeat(t, CHURCH.civHeat * (C.kills[t] > 1 ? 1.5 : 1)); G.expoQuiet = false;
  FX.church('civKill', t, { x: Math.round(c.x), y: Math.round(c.y), n: C.kills[t], sent: (C.waves[t] || 0) > before ? 1 : 0 });
}
// a melee blow sweeps its arc; shots and blasts strike where they land
function hitCivsArc(f, a) {
  if (!G.civ || !churchOn() || f.inM || f.x > MAP.cityW) return;
  var R = (a.reach || 60) + 14, half = (a.arc || 1.2) / 2 + 0.35;
  for (var i = 0; i < G.civ.length; i++) {
    var c = G.civ[i]; if (!c.on || c.dead || Math.abs(c.x - f.x) > R || Math.abs(c.y - f.y) > R) continue;
    if (Math.hypot(c.x - f.x, c.y - f.y) > R) continue;
    var d = Math.atan2(c.y - f.y, c.x - f.x) - f.face; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) <= half) civStruck(c, f);
  }
}
function hitCivsAt(x, y, r, owner) {
  if (!G.civ || !owner || !churchOn() || owner.inM || x > MAP.cityW) return false; var hit = false;
  for (var i = 0; i < G.civ.length; i++) { var c = G.civ[i]; if (!c.on || c.dead || Math.abs(c.x - x) > r + 10 || Math.abs(c.y - y) > r + 10) continue; if (Math.hypot(c.x - x, c.y - y) <= r + 10) { civStruck(c, owner); hit = true; } }
  return hit;
}
/* ---- the Church's patience ---- */
function churchHeat(t, v) {
  if (!churchOn() || t === undefined || t < 0 || v <= 0 || finalNight()) return;
  var C = churchSt(); C.heat[t] = (C.heat[t] || 0) + v;
  if (C.heat[t] >= CHURCH.sendAt && (C.cd[t] || 0) <= G.time && teamFighters(t).length) sendExecutors(t);
}
// a fight seen in daylight: the Church notices, a little at a time
function churchDayFight(att) {
  if (!att || !isDay() || !churchOn()) return; var C = churchSt();
  if ((C.dayT[att.team] || 0) > G.time) return; C.dayT[att.team] = G.time + CHURCH.dayHeatCd;
  churchHeat(att.team, CHURCH.dayHeat);
}
function humansAlive() { return G.f.filter(function (f) { return !G.ai[f.idx] && f.st !== 'dead'; }); }
function churchEntrances() {
  var out = [], d = (MAP.doors || []).filter(function (q) { return q.room === 'church' && !q.ruined; })[0];
  if (d) out.push({ x: d.out.x, y: d.out.y + 40, from: 'church' });
  var ns = civNodes(); if (ns.length) {
    var by = function (k, s) { return ns.slice().sort(function (p, q) { return s * (p[k] - q[k]); })[0]; };
    [[by('x', 1), 'west'], [by('x', -1), 'east'], [by('y', 1), 'north'], [by('y', -1), 'south']].forEach(function (q) { out.push({ x: q[0].x, y: q[0].y, from: q[1] }); });
  }
  return out;
}
// Executors set out from a place no player can see, the Church first, as close to their quarry as that allows
function execSpawn(t) {
  var hs = humansAlive(), tf = teamFighters(t), tx = tf.length ? tf[0].x : MAP.cityW / 2, ty = tf.length ? tf[0].y : H / 2;
  var far = function (p) { var m = 1e9; hs.forEach(function (f) { m = Math.min(m, Math.hypot(f.x - p.x, f.y - p.y)); }); return m; };
  var cand = churchEntrances(); if (!cand.length) return null;
  var ok = cand.filter(function (p) { return far(p) > CHURCH.farFromHumans; });
  if (ok.length) { var ch = ok.filter(function (p) { return p.from === 'church'; })[0]; if (ch) return ch; return ok.sort(function (p, q) { return Math.hypot(p.x - tx, p.y - ty) - Math.hypot(q.x - tx, q.y - ty); })[0]; }
  return cand.sort(function (p, q) { return far(q) - far(p); })[0];
}
function liveExecs(t) { return (G.mobs || []).filter(function (m) { return m.exec && !m.dead && (t === undefined || m.tgt === t); }); }
function sendExecutors(t) {
  var C = churchSt(); if (liveExecs(t).length >= CHURCH.squadMax || liveExecs().length >= CHURCH.liveMax) return;
  var p = execSpawn(t); if (!p) return;
  var n = Math.min(CHURCH.squadMax - liveExecs(t).length, CHURCH.squad + Math.min(2, C.waves[t] || 0));
  G.mobs = G.mobs || [];
  for (var i = 0; i < n; i++) G.mobs.push({ exec: true, team: -2, tgt: t, x: p.x + (i - (n - 1) / 2) * 34, y: p.y + (i % 2) * 20, r: CHURCH.r, hp: CHURCH.hp, max: CHURCH.hp, t: 0, face: 0, atkT: 0.5, thrT: 1 + i * 0.7, path: null, pathT: 0, tx: p.x, ty: p.y, trackT: 0, born: G.time, home: { x: p.x, y: p.y }, zone: 0 });
  C.waves[t] = (C.waves[t] || 0) + 1; C.cd[t] = G.time + CHURCH.cd; C.heat[t] = 0; C.sent += n;
  if (!G.expoQuiet) FX.church('dispatch', t, { x: Math.round(p.x), y: Math.round(p.y), from: p.from, n: n, wave: C.waves[t] });
}
/* ---- the hunt ---- */
function execQuarry(m) {
  var tf = teamFighters(m.tgt).filter(function (f) { return f.spirit !== 2; }); if (!tf.length) return null;
  var ms = tf.filter(function (f) { return f.def.isMaster; })[0], best = null, bd = 1e9;
  tf.forEach(function (f) { var d = Math.hypot(f.x - m.x, f.y - m.y) - (f === ms ? 400 : 0); if (d < bd) { bd = d; best = f; } });
  return best;
}
function execTick(dt) {
  if (!G.mobs || !G.mobs.length) return; var C = churchSt();
  G.mobs.forEach(function (m) {
    if (!m.exec || m.dead) return; m.t += dt; m.atkT -= dt; m.thrT -= dt;
    var q = execQuarry(m);
    if (!q || G.time - m.born > CHURCH.leaveAfter || finalNight()) { m.leaving = true; }
    if (m.leaving) { execWalk(m, m.home.x, m.home.y, dt, 0.8); if (Math.hypot(m.x - m.home.x, m.y - m.home.y) < 60) { m.dead = true; m.gone = true; } return; }
    // the Church's informants keep them close behind their quarry
    m.trackT -= dt; if (m.trackT <= 0) { m.trackT = CHURCH.track; m.tx = q.x; m.ty = q.y; }
    var d = Math.hypot(q.x - m.x, q.y - m.y), sees = d < CHURCH.seeR && (m.x > MAP.cityW) === (q.x > MAP.cityW) && !segBlocked(m.x, m.y, q.x, q.y);
    var mul = q.def.isMaster ? 1 : CHURCH.servantMul;
    if (sees) {
      m.face = Math.atan2(q.y - m.y, q.x - m.x);
      if (d > CHURCH.reach + 22) execStep(m, m.face, CHURCH.spd * dt);
      else if (m.atkT <= 0) { m.atkT = CHURCH.swing; m.swing = G.time; hurt(null, q, { dmg: CHURCH.dmg, power: 1, stag: 0.25, kind: 'melee', key: 'exec', hs: 0.04 }, mul, { x: m.x, y: m.y }); }
      if (d > 130 && d < CHURCH.throwR && m.thrT <= 0) { m.thrT = CHURCH.throwCd; execThrow(m, q); }
    } else execWalk(m, m.tx, m.ty, dt, 1);
  });
  // executors keep a little apart
  var ex = G.mobs.filter(function (m) { return m.exec && !m.dead; });
  for (var i = 0; i < ex.length; i++) for (var j = i + 1; j < ex.length; j++) { var a = ex[i], b = ex[j], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy); if (L > 0 && L < 30) { var k = (30 - L) / 2 / L; a.x -= dx * k; a.y -= dy * k; b.x += dx * k; b.y += dy * k; } }
  keysTick(dt);
  // the fallen are counted, and whoever cut them down pays for it
  G.mobs.forEach(function (m) {
    if (!m.exec || !m.dead || m.counted || m.gone) return; m.counted = true; C.slain++;
    var by = -1, bv = 0; Object.keys(m.dmgBy || {}).forEach(function (k) { if (m.dmgBy[k] > bv) { bv = m.dmgBy[k]; by = +k; } });
    if (by >= 0) { expose(by, 10); churchHeat(by, CHURCH.execKillHeat); }
    FX.church('execDown', m.tgt, { x: Math.round(m.x), y: Math.round(m.y), by: by });
  });
  G.mobs = G.mobs.filter(function (m) { return !(m.exec && m.dead && (m.counted || m.gone)); });
}
function segBlocked(ax, ay, bx, by) { var rs = rectsIn(Math.min(ax, bx), Math.min(ay, by), Math.max(ax, bx), Math.max(ay, by)); for (var i = 0; i < rs.length; i++) if (segRect(ax, ay, bx, by, rs[i], 4)) return true; return false; }
function execStep(m, a, s) {
  m.x += Math.cos(a) * s; m.y += Math.sin(a) * s; m.vx = Math.cos(a); m.vy = Math.sin(a);
  rectsIn(m.x - 18, m.y - 18, m.x + 18, m.y + 18).forEach(function (r) { pushOutRect(m, r, 13); });
}
// along the road graph (doors included) to where their quarry was last reported
function execWalk(m, tx, ty, dt, k) {
  m.pathT -= dt;
  if (!m.path || m.pathT <= 0 || Math.hypot((m.pgx || 0) - tx, (m.pgy || 0) - ty) > 300) { m.path = navPath(m.x, m.y, tx, ty) || []; m.pathT = CHURCH.repath; m.pgx = tx; m.pgy = ty; m.pi = 0;
    // a new route starts at the nearest road node, often behind: skip what is already passed
    var P0 = m.path; while (m.pi < P0.length - 1 && !P0[m.pi].door && Math.hypot(P0[m.pi + 1].x - m.x, P0[m.pi + 1].y - m.y) <= Math.hypot(P0[m.pi + 1].x - P0[m.pi].x, P0[m.pi + 1].y - P0[m.pi].y) + 30) m.pi++; }
  var p = m.path, sp = CHURCH.spd * k * dt;
  while (p.length && m.pi < p.length && Math.hypot(p[m.pi].x - m.x, p[m.pi].y - m.y) < 36) {
    var cur = p[m.pi], nx = p[m.pi + 1];
    // a door joins the street and a room far apart on the map: step through it
    if (nx && Math.hypot(nx.x - cur.x, nx.y - cur.y) > 900) { m.x = nx.x; m.y = nx.y; m.pi++; }
    m.pi++;
  }
  var goal = m.pi < p.length ? p[m.pi] : { x: tx, y: ty }, a = Math.atan2(goal.y - m.y, goal.x - m.x);
  if (Math.hypot(goal.x - m.x, goal.y - m.y) > 8) { m.face = a; execStep(m, a, sp); }
}
// three Black Keys in a tight line; the UI draws their flight from the executor's last throw
function execThrow(m, q) {
  var a = Math.atan2(q.y - m.y, q.x - m.x); m.face = a; m.thA = Math.round(a * 1000) / 1000; m.thX = Math.round(m.x); m.thY = Math.round(m.y); m.thT = G.time;
  var C = churchSt(); for (var i = 0; i < CHURCH.keyN; i++) { var b = a + (i - (CHURCH.keyN - 1) / 2) * CHURCH.keySpread; C.keys.push({ x: m.x, y: m.y, vx: Math.cos(b) * CHURCH.keySpd, vy: Math.sin(b) * CHURCH.keySpd, life: CHURCH.throwR / CHURCH.keySpd + 0.1, tgt: m.tgt }); }
}
function keysTick(dt) {
  var C = churchSt(); if (!C.keys.length) return;
  C.keys.forEach(function (k) {
    k.life -= dt; if (k.life <= 0) { k.dead = true; return; }
    k.x += k.vx * dt; k.y += k.vy * dt;
    if (rectsIn(k.x - 2, k.y - 2, k.x + 2, k.y + 2).some(function (r) { return inRect(r, k.x, k.y); })) { k.dead = true; return; }
    for (var i = 0; i < G.f.length; i++) { var f = G.f[i]; if (f.team !== k.tgt || f.st === 'dead' || f.spirit === 2 || Math.hypot(f.x - k.x, f.y - k.y) > FR + 4) continue; hurt(null, f, { dmg: CHURCH.keyDmg, power: 1, stag: 0.15, kind: 'proj', key: 'exec' }, f.def.isMaster ? 1 : CHURCH.servantMul, { x: k.x - k.vx * 0.02, y: k.y - k.vy * 0.02 }); k.dead = true; return; }
  });
  C.keys = C.keys.filter(function (k) { return !k.dead; });
}
// nearest executor hunting this fighter's team (the AI turns to face them)
function execNear(f, r) { var best = null, bd = r; (G.mobs || []).forEach(function (m) { if (!m.exec || m.dead || m.tgt !== f.team) return; var d = Math.hypot(m.x - f.x, m.y - f.y); if (d < bd) { bd = d; best = m; } }); return best; }

/* ---- the emergency Command Seal: before the final night, the first killing blow on a servant whose master lives and
   still holds a seal is cheated: the master spends a seal and the servant is pulled home at the brink of death ---- */
function sealRescue(sv) {
  if (!sv || sv.def.isMaster || !clockOn() || finalNight() || G.quick || sv.rescued) return false;
  var m = sv.partner; if (!m || m.st === 'dead' || !m.sealUsed) return false;
  var k = ['warp', 'heal', 'np'].filter(function (q) { return !m.sealUsed[q]; })[0]; if (!k) return false;
  sv.rescued = true; m.sealUsed[k] = true;
  // home to the summoning circle (the master's workshop), or to the master if the master is already there
  var circ = (G.circles || []).filter(function (q) { return q.team === m.team; })[0], hx = circ ? circ.x : m.x, hy = circ ? circ.y : m.y;
  if (!circ || inOwnHome(m)) { hx = m.x; hy = m.y; }
  FX.fx('spiritOut', sv.x, sv.y, sv);
  sv.hp = Math.max(1, sv.def.hp * 0.12); sv.x = hx + 50; sv.y = hy; sv.kx = sv.ky = 0; sv.st = 'idle'; sv.t = 0; sv.act = null; sv.iframes = 1.5; sv.spirit = 0; sv.lock = null; sv.recover = true;
  FX.church('rescue', m.team, { s: sv.idx, k: k });
  return true;
}
