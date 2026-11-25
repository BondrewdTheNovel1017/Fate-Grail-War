/* ---- 3b-3: events. At most one per night and one per day, each with a clear headline.
   Odd nights: a challenge rings out from the harbor. Even nights: the Church posts a bounty.
   Days: sometimes a bounded field seals Homurahara Academy (the school event); if Iskandar lives,
   he may hold the King's Banquet. The final night: the Grail descends on Ryuudou Temple and draws
   everyone in. ---- */
var EVT = {
  harbor: { x: 9300, y: 6640, r: 620, dur: 160, at: 45 },
  bounty: { at: 30 },
  school: { x: 4050, y: 3020, r: 760, dur: 200, at: 35, chance: 0.35, circles: [[3520, 3010], [4580, 2960], [4050, 3380]], need: 9, drainM: 0.5, drainS: 1.0, floor: 10, mobMax: 9, mobEvery: 5.5 },
  banquet: { x: 11000, y: 1820, r: 320, need: 20, chance: 0.6 },
  grail: { x: 1500, y: 1060, at: 60, r0: 4200, r1: 750, shrink: 330, dmg: 3 }
};
function eventsOn() { return clockOn() && !G.quick && MAP.cityW; }
function evAlive(id) { return G.f.filter(function (f) { return f.def.id === id && f.st !== 'dead'; })[0]; }
function eventsTick(dt) {
  if (!eventsOn()) return;
  var c = G.clock, E = G.event;
  // schedule
  if (!E && !c.evDone) {
    if (c.phase === 'night' && c.final && c.t >= EVT.grail.at) startGrail();
    else if (c.phase === 'night' && !c.final && c.n % 2 === 1 && c.t >= EVT.harbor.at) startHarbor();
    else if (c.phase === 'night' && !c.final && c.n % 2 === 0 && c.t >= EVT.bounty.at) startBounty();
    else if (c.phase === 'day' && c.t >= EVT.school.at && c.schoolRoll) startSchool();
  }
  E = G.event; if (!E) return;
  E.t += dt;
  if (E.kind === 'harbor' && (E.t >= E.dur || c.phase !== 'night')) endEvent('The harbor falls quiet.');
  else if (E.kind === 'bounty' && (c.phase !== 'night' || !G.f.some(function (f) { return f.team === E.team && f.st !== 'dead' && !f.def.isMaster; }))) endEvent(null);
  else if (E.kind === 'school') schoolTick(E, dt);
  else if (E.kind === 'grail') grailTick(E, dt);
}
function newPhaseEvents() {
  var c = G.clock; if (!c) return;
  if (G.event && G.event.kind !== 'grail') endEvent(null);
  c.evDone = false; c.schoolRoll = false;
  if (c.phase === 'day') {
    c.schoolRoll = rnd() < EVT.school.chance || (G.forceSchool ? true : false);
    var isk = evAlive('iskandar');
    if (isk && !c.banquetHeld && (rnd() < EVT.banquet.chance || c.n >= c.nights)) { c.banquetHeld = true; G.tasks.push({ kind: 'banquet', x: EVT.banquet.x, y: EVT.banquet.y, r: EVT.banquet.r, name: 'The King’s Banquet', need: EVT.banquet.need, prog: {}, done: {}, host: isk.team }); FX.event('banquet', { host: isk.team }); }
  }
}
function endEvent(msg) { var E = G.event; if (!E) return; G.event = null; if (G.clock) G.clock.evDone = true; G.mobs = []; FX.event('end', E, msg); }
function regainSeal(team) {
  var m = G.f.filter(function (f) { return f.team === team && f.def.isMaster && f.st !== 'dead'; })[0]; if (!m) return false;
  var k = ['warp', 'heal', 'np'].filter(function (q) { return m.sealUsed[q]; })[0];
  if (k) { m.sealUsed[k] = false; m.seals = sealsLeft(m); FX.text(m, 'COMMAND SEAL RESTORED'); FX.fx('seal', m.x, m.y, m); }
  else { m.manaBonus = (m.manaBonus || 0) + 40; FX.text(m, 'MANA GRANTED'); }
  return true;
}
/* ---- the harbor challenge ---- */
function startHarbor() { G.event = { kind: 'harbor', x: EVT.harbor.x, y: EVT.harbor.y, r: EVT.harbor.r, dur: EVT.harbor.dur, t: 0 }; fightNoise(EVT.harbor.x, EVT.harbor.y, 20000); FX.event('harbor', G.event); }
function harborKill(f) {
  var E = G.event; if (!E || E.kind !== 'harbor' || f.def.isMaster || !f.killer) return;
  if (Math.hypot(f.x - E.x, f.y - E.y) > E.r + 200) return;
  var w = f.killer.team; regainSeal(w); E.winner = w; endEvent(null); FX.event('harborWon', { team: w, loser: f });
}
/* ---- the Church's bounty ---- */
function startBounty() {
  var teams = {}; G.f.forEach(function (f) { if (f.st !== 'dead' && !f.def.isMaster) teams[f.team] = f; });
  var ids = Object.keys(teams).map(Number); if (ids.length < 3) { G.clock.evDone = true; return; }
  var gil = evAlive('gilles'), t;
  if (gil) t = gil.team;
  else t = ids.sort(function (a, b) { return (G.expo[b] || 0) - (G.expo[a] || 0) || (teamKills(b) - teamKills(a)); })[0];
  G.event = { kind: 'bounty', team: t, t: 0 }; G.reveal[t] = G.time + CLOCK.night; FX.event('bounty', G.event);
}
function teamKills(t) { return G.f.filter(function (f) { return f.st === 'dead' && f.killer && f.killer.team === t; }).length; }
function bountyKill(f) {
  var E = G.event; if (!E || E.kind !== 'bounty' || f.team !== E.team || f.def.isMaster || !f.killer || f.killer.team === E.team) return;
  regainSeal(f.killer.team); FX.event('bountyWon', { team: f.killer.team, loser: f }); G.reveal[E.team] = 0; endEvent(null);
}
/* ---- the school: a bounded field drains everyone inside; skeleton familiars rise; three circles hold it up ---- */
function startSchool() {
  var S = EVT.school, med = evAlive('medusa'), culprit = med && med.partner && med.partner.st !== 'dead' ? med.team : -1;
  var E = { kind: 'school', x: S.x, y: S.y, r: S.r, dur: S.dur, t: 0, culprit: culprit, circles: S.circles.map(function (p) { return { x: p[0], y: p[1], r: 75, prog: {}, up: true, by: -1 }; }), allowed: {}, broken: {}, mobT: 2, students: [] };
  G.f.forEach(function (f) { if (f.st !== 'dead' && (Math.hypot(f.x - E.x, f.y - E.y) < E.r || f.team === culprit)) E.allowed[f.idx] = true; });
  for (var i = 0; i < 26; i++) { var a = rnd() * 6.283, d = 120 + rnd() * (E.r - 220); E.students.push({ x: E.x + Math.cos(a) * d, y: E.y + Math.sin(a) * d * 0.7, down: 0, id: i }); }
  G.mobs = []; G.event = E; FX.event('school', E);
}
function inSchool(f) { var E = G.event; return !!(E && E.kind === 'school' && f.x < MAP.cityW && Math.hypot(f.x - E.x, f.y - E.y) < E.r); }
function schoolTick(E, dt) {
  // servants who were not inside when it rose cannot enter, even in spirit form; masters may come and go
  G.f.forEach(function (f) {
    if (f.st === 'dead' || f.def.isMaster || E.allowed[f.idx] || f.x > MAP.cityW) return;
    var d = Math.hypot(f.x - E.x, f.y - E.y); if (d < E.r + 6) { var a = Math.atan2(f.y - E.y, f.x - E.x); f.x = E.x + Math.cos(a) * (E.r + 8); f.y = E.y + Math.sin(a) * (E.r + 8); f.kx = f.ky = 0; if (!(f.barT > G.time)) { f.barT = G.time + 4; FX.text(f, 'THE FIELD HOLDS YOU OUT'); } }
  });
  // the drain: never kills, but it wears everyone down
  G.f.forEach(function (f) { if (f.st === 'dead' || f.team === E.culprit || !inSchool(f) || f.spirit === 2) return; var k = f.def.isMaster ? EVT.school.drainM : EVT.school.drainS; if (f.hp > EVT.school.floor) f.hp = Math.max(EVT.school.floor, f.hp - k * dt); });
  E.students.forEach(function (s, i) { if (E.t > 12 + i * 6) s.down = Math.min(1, s.down + dt); });
  if (E.culprit >= 0) { var cm = G.f.filter(function (f) { return f.team === E.culprit && f.def.isMaster && f.st !== 'dead'; })[0]; if (cm && cm.manaMax) cm.mana = Math.min(cm.manaMax, cm.mana + 1.5 * dt); }
  // familiars rise from the circles that still stand
  E.mobT -= dt; var up = E.circles.filter(function (c) { return c.up; });
  if (E.mobT <= 0 && up.length) { E.mobT = EVT.school.mobEvery; var live = G.mobs.filter(function (m) { return !m.dead; }).length; for (var n = 0; n < up.length && live < EVT.school.mobMax; n++, live++) { var c = up[n]; G.mobs.push({ x: c.x + (rnd() - 0.5) * 80, y: c.y + (rnd() - 0.5) * 80, hp: 34, atkT: 1, t: 0, dead: false, vx: 0, vy: 0 }); } }
  mobsTick(E, dt);
  // breaking the circles: stand in one, uncontested by familiars, until it shatters; a hit sets you back a little
  E.circles.forEach(function (c) {
    if (!c.up) return;
    G.f.forEach(function (f) {
      if (f.st === 'dead' || f.team === E.culprit || f.spirit === 2 || Math.hypot(f.x - c.x, f.y - c.y) > c.r) return;
      if (G.mobs.some(function (m) { return !m.dead && Math.hypot(m.x - c.x, m.y - c.y) < 140; })) return;
      if (G.time - (f.lastHitT || -99) < 0.6) return;
      c.prog[f.team] = (c.prog[f.team] || 0) + dt;
      if (c.prog[f.team] >= EVT.school.need) { c.up = false; c.by = f.team; FX.event('circle', { team: f.team, c: c, left: E.circles.filter(function (q) { return q.up; }).length }); var m = G.f.filter(function (q) { return q.team === f.team && q.def.isMaster && q.st !== 'dead'; })[0]; if (m) { m.mana = m.manaMax; } G.expo[f.team] = Math.max(0, (G.expo[f.team] || 0) - 30); }
    });
  });
  if (!E.circles.some(function (c) { return c.up; })) { E.truceEnd = G.time + 20; endSchool(E, true); return; }
  if (E.t >= E.dur) endSchool(E, false);
}
function endSchool(E, broken) {
  G.lastSchool = { truceEnd: G.time + 20, x: E.x, y: E.y, r: E.r, betray: {} };
  G.f.forEach(function (f) { if (G.ai[f.idx] && rnd() < 0.15) G.lastSchool.betray[f.team] = true; });
  if (!broken && E.culprit >= 0) expose(E.culprit, 100);
  endEvent(broken ? 'The bounded field shatters. The students will wake.' : 'The students are taken to hospital. ' + (E.culprit >= 0 ? 'The Church knows who did this.' : 'Whoever did this got away.'));
}
function mobsTick(E, dt) {
  G.mobs.forEach(function (m) {
    if (m.dead) return; m.t += dt; m.atkT -= dt;
    var tg = null, bd = 900; G.f.forEach(function (f) { if (f.st === 'dead' || f.team === E.culprit || f.spirit === 2 || !inSchool(f)) return; var d = Math.hypot(f.x - m.x, f.y - m.y); if (d < bd) { bd = d; tg = f; } });
    if (!tg) { m.vx = m.vy = 0; return; }
    var a = Math.atan2(tg.y - m.y, tg.x - m.x); m.face = a;
    if (bd > 34) { m.x += Math.cos(a) * 140 * dt; m.y += Math.sin(a) * 140 * dt; m.vx = Math.cos(a); m.vy = Math.sin(a); rectsIn(m.x - 14, m.y - 14, m.x + 14, m.y + 14).forEach(function (r) { pushOutRect(m, r, 12); }); }
    else if (m.atkT <= 0) { m.atkT = 1.2; m.swing = G.time; hurt(null, tg, { dmg: 5, power: 1, stag: 0.12, kind: 'melee', key: 'mob', hs: 0.03 }, 1, { x: m.x, y: m.y }); }
  });
  G.mobs = G.mobs.filter(function (m) { return !m.dead; });
}
// fighters' blows and shots also strike familiars
function hitMobsArc(f, a, mult) { if (!G.mobs || !G.mobs.length) return; G.mobs.forEach(function (m) { if (!m.dead && Math.hypot(m.x - f.x, m.y - f.y) <= (a.reach || 60) + 20) mobHurt(m, a.dmg * (mult || 1) * f.def.dmg); }); }
function hitMobsAt(x, y, r, dmg) { if (!G.mobs || !G.mobs.length) return false; var hit = false; G.mobs.forEach(function (m) { if (!m.dead && Math.hypot(m.x - x, m.y - y) <= r + 16) { mobHurt(m, dmg); hit = true; } }); return hit; }
function mobHurt(m, d) { m.hp -= Math.max(4, d); FX.spark(m.x, m.y, '#e8e2d0', 5); if (m.hp <= 0) { m.dead = true; FX.fx('mobDie', m.x, m.y, null); } }
/* ---- truce: while the school is sealed (and for a moment after), and at the King's Banquet ---- */
function truceZone(f) {
  var E = G.event;
  if (E && E.kind === 'school' && inSchool(f)) return 'school';
  var L = G.lastSchool; if (L && G.time < L.truceEnd && f.x < MAP.cityW && Math.hypot(f.x - L.x, f.y - L.y) < L.r + 200 && !L.betray[f.team]) return 'school';
  if (G.tasks) for (var i = 0; i < G.tasks.length; i++) { var k = G.tasks[i]; if (k.kind === 'banquet' && Math.hypot(f.x - k.x, f.y - k.y) < k.r + 120) return 'banquet'; }
  return null;
}
function inTruce(a, b) { if (!eventsOn() || !a || !b || a.team === b.team || (G.oath && (G.oath[a.team] || G.oath[b.team]))) return false; var za = truceZone(a); return !!za && za === truceZone(b); }
// returns true if the blow is stopped by the truce; a human who strikes anyway breaks it, and pays
function truceStops(att, def) {
  if (!att || !inTruce(att, def)) return false;
  if (G.ai[att.idx]) return true;
  G.oath = G.oath || {}; G.oath[att.team] = true; expose(att.team, 60); G.reveal[att.team] = G.time + 60; FX.event('oath', { team: att.team });
  return false;
}
/* ---- the King's Banquet: whoever sits at the table learns the others' true names, and gives up their own ---- */
function banquetDone(t, k) {
  var here = {}; G.f.forEach(function (f) { if (f.st !== 'dead' && Math.hypot(f.x - k.x, f.y - k.y) < k.r + 120) here[f.team] = 1; });
  G.f.forEach(function (s) { if (s.st === 'dead' || s.def.isMaster) return; for (var q in here) if (+q !== s.team) learnName(+q, s, 'banquet'); });
}
/* ---- the final night: the Grail descends on Ryuudou Temple ---- */
function startGrail() { var g = EVT.grail; G.event = { kind: 'grail', x: g.x, y: g.y, r: g.r0, t: 0 }; G.clock.evDone = true; FX.event('grail', G.event); }
function grailTick(E, dt) {
  var g = EVT.grail; E.r = g.r1 + (g.r0 - g.r1) * Math.max(0, 1 - E.t / g.shrink);
  G.f.forEach(function (f) { if (f.st === 'dead' || f.x > MAP.cityW || f.inM) return; if (Math.hypot(f.x - E.x, f.y - E.y) > E.r) { f.hp -= g.dmg * dt; f.stat.taken += g.dmg * dt; if (f.hp <= 0) { f.cause = 'grail'; kill(f, true); } } });
}
function grailPull(f) { var E = G.event; if (!E || E.kind !== 'grail') return null; return { x: E.x, y: E.y, r: E.r }; }
