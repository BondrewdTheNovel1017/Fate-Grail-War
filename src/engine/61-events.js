/* ---- events. At most one per night and one per day, each with a clear headline on screen.
   Each war shuffles a night deck and a day deck and never repeats an event. Lore first: if the canon
   character is in the war, they host or cause it and the event comes up sooner; if not, a stand-in does.
   Nights: the Challenge, the Church's Bounty, the Horror in the River, the Assassin's False Death,
   Berserker Unchained. Days (about 60%): the Sealed School, the King's Banquet, the Overseer's Summons.
   The final night: the Grail descends on one of Fuyuki's three ley lines, pure or corrupted. ---- */
var EVT = {
  nightAt: 45, dayAt: 35, dayChance: 1, quietChance: 0.35,
  challenge: { x: 9300, y: 6640, r: 620, dur: 170, accept: 0.65, acceptHp: 0.6 },
  school: { x: 4050, y: 3020, r: 760, dur: 200, circles: [[3520, 3010], [4580, 2960], [4050, 3380]], need: 9, drainM: 0.5, drainS: 1.0, floor: 10, mobMax: 7, mobEvery: 7, mobHp: 24, contest: 95 },
  banquet: { x: 11000, y: 1820, r: 320, need: 20 },
  summons: { x: 1450, y: 3220, r: 280, need: 20 },
  horror: { hp: 1400, r: 110, path: [[6000, 4300], [6000, 2620]], spd: 70, slamEvery: 2.1, slamR: 125, slamDmg: 16, truceR: 1100 },
  berserk: { dur: 90, dmg: 1.3, drain: 0.01, floor: 0.25 },
  grail: { at: 60, r0: 4200, r1: 750, shrink: 330, dmg: 3, dmgC: 5, heal: 2, poolEvery: 3.5 }
};
var GRAIL_SITES = [{ x: 1500, y: 1060, name: 'Ryuudou Temple' }, { x: 1300, y: 3080, name: 'the Fuyuki Church hill' }, { x: 10450, y: 5050, name: 'the Fuyuki Civic Hall' }];
var NIGHT_DECK = { challenge: 'diarmuid', bounty: 'gilles', horror: 'gilles', falsedeath: 'hassan', berserk: ['heracles', 'lancelot'], demo: 'kiritsugu', shadow: null }, DAY_DECK = { school: 'medusa', banquet: 'iskandar', summons: null, festival: null };
function eventsOn() { return clockOn() && !G.quick && MAP.cityW; }
function evAlive(id) { return G.f.filter(function (f) { return f.def.id === id && f.st !== 'dead'; })[0]; }
function loreHost(ids) { if (!ids) return null; ids = [].concat(ids); for (var i = 0; i < ids.length; i++) { var f = evAlive(ids[i]); if (f) return f; } return null; }
function buildDecks() {
  function deal(D) { return Object.keys(D).map(function (k) { return { k: k, s: rnd() + (loreHost(D[k]) ? 0.7 : 0) }; }).sort(function (a, b) { return b.s - a.s; }).map(function (q) { return q.k; }); }
  G.deck = { night: deal(NIGHT_DECK), day: deal(DAY_DECK) };
  if (G.forceSchool) G.deck.day = ['school'].concat(G.deck.day.filter(function (k) { return k !== 'school'; }));
}
function grailSite() { if (!G.grailSite) { var cv = cavernSite(); G.grailSite = cv && rnd() < EVT2.cavern.chance ? cv : GRAIL_SITES[Math.floor(rnd() * GRAIL_SITES.length)]; } return G.grailSite; }
function servantsAlive() { return G.f.filter(function (f) { return f.st !== 'dead' && !f.def.isMaster; }); }
function canRun(k) {
  var sv = servantsAlive(), teams = {}; sv.forEach(function (f) { teams[f.team] = 1; }); var n = Object.keys(teams).length;
  if (k === 'bounty' || k === 'challenge') return n >= 3;
  if (k === 'shadow') return shadowOk();
  if (k === 'demo') return n >= 2 && G.fields && Object.keys(G.fields).some(function (t) { return G.fields[t].lvl > 0 && !G.fields[t].backup; });
  return n >= 2;
}
function eventsTick(dt) {
  if (!eventsOn()) return;
  var c = G.clock, E = G.event;
  if (!E && !c.evDone && c.pending) {
    if (c.phase === 'night' && c.final && c.t >= EVT.grail.at) startGrail();
    else if (c.phase === 'night' && !c.final && c.t >= EVT.nightAt) startNight(c.pending);
    else if (c.phase === 'day' && c.pending === 'school' && c.t >= EVT.dayAt) startSchool();
  }
  E = G.event; if (!E) return;
  E.t += dt;
  if (E.kind === 'challenge') challengeTick(E, dt);
  else if (E.kind === 'bounty' && !G.f.some(function (f) { return f.team === E.team && f.st !== 'dead' && !f.def.isMaster; })) endEvent(null);
  else if (E.kind === 'horror') horrorTick(E, dt);
  else if (E.kind === 'berserk') berserkTick(E, dt);
  else if (E.kind === 'demo') demoTick(E, dt);
  else if (E.kind === 'shadow') shadowTick(E, dt);
  else if (E.kind === 'school') schoolTick(E, dt);
  else if (E.kind === 'grail') grailTick(E, dt);
}
// a phase begins: the night or day draws its event from the deck
function newPhaseEvents() {
  var c = G.clock; if (!c) return; if (!G.deck) buildDecks();
  if (G.event && G.event.kind !== 'grail') { if (G.event.kind === 'horror') horrorDawn(G.event); endEvent(null); }
  c.evDone = false; c.pending = null; G.festival = false;
  if (c.phase === 'night') {
    if (c.final) { c.pending = 'grail'; return; }
    // a long war may have one still night in the middle: a breather before the next storm
    if (c.nights >= 5 && c.n >= 2 && !c.hadQuiet && rnd() < EVT.quietChance) { c.hadQuiet = true; c.evDone = true; FX.event('quiet', {}); return; }
    c.pending = draw('night'); return;
  }
  if (rnd() < EVT.dayChance || G.forceSchool) {
    var k = draw('day'); if (!k) return;
    if (k === 'school') c.pending = 'school';
    else if (k === 'banquet') startBanquet();
    else if (k === 'summons') startSummons();
    else if (k === 'festival') startFestival();
  }
}
function draw(which) { var D = G.deck[which]; for (var i = 0; i < D.length; i++) if (canRun(D[i])) return D.splice(i, 1)[0]; return null; }
function startNight(k) {
  if (k === 'challenge') startChallenge(); else if (k === 'bounty') startBounty(); else if (k === 'horror') startHorror(); else if (k === 'falsedeath') startFalseDeath(); else if (k === 'berserk') startBerserk(); else if (k === 'demo') startDemolition(); else if (k === 'shadow') startShadow();
  if (!G.event) G.clock.evDone = true;
}
function endEvent(msg) { var E = G.event; if (!E) return; G.event = null; if (G.clock) G.clock.evDone = true; G.mobs = (G.mobs || []).filter(function (m) { return m.exec || m.keep; }); if (E.kind === 'berserk' && E.f) E.f.rampT = 0; FX.event('end', E, msg); }
function masterOf(team) { return G.f.filter(function (f) { return f.team === team && f.def.isMaster && f.st !== 'dead'; })[0]; }
function regainSeal(team) {
  var m = masterOf(team); if (!m) return false;
  if (sealsLeft(m) < SEALS) { m.seals = sealsLeft(m) + 1; FX.text(m, 'COMMAND SEAL RESTORED'); FX.fx('seal', m.x, m.y, m); }
  else { m.manaBonus = (m.manaBonus || 0) + 40; FX.text(m, 'MANA GRANTED'); }
  return true;
}
function teamKills(t) { return G.f.filter(function (f) { return f.st === 'dead' && f.killer && f.killer.team === t; }).length; }
/* ---- the Challenge: one servant calls out the others from the docks ---- */
function startChallenge() {
  var C = EVT.challenge, h = loreHost('diarmuid');
  if (!h) { var pool = servantsAlive().filter(function (f) { return masterOf(f.team); }), pref = pool.filter(function (f) { return /Saber|Lancer|Rider/.test(f.def.cls); }); pool = pref.length ? pref : pool; h = pool[Math.floor(rnd() * pool.length)]; }
  if (!h) return;
  var E = { kind: 'challenge', host: h, team: h.team, x: C.x, y: C.y, r: C.r, dur: C.dur, t: 0, accepted: false, goers: {} };
  servantsAlive().forEach(function (f) { if (f.team !== h.team && G.ai[f.idx] && f.hp > f.def.hp * C.acceptHp && rnd() < C.accept) E.goers[f.idx] = true; });
  G.event = E; FX.event('challenge', E);
}
function challengeTick(E, dt) {
  var h = E.host, inside = function (f) { return f.st !== 'dead' && f.x < MAP.cityW && Math.hypot(f.x - E.x, f.y - E.y) < E.r; };
  if (h.st === 'dead') { endEvent('The challenger has fallen elsewhere. The docks fall quiet.'); return; }
  if (!E.accepted && inside(h) && servantsAlive().some(function (f) { return f.team !== h.team && inside(f) && f.spirit !== 2; })) { E.accepted = true; FX.event('accepted', E); }
  if (E.t >= E.dur) { if (!E.accepted && inside(h)) { regainSeal(h.team); FX.event('unanswered', E); } endEvent(E.accepted ? 'The challenge ends without a victor.' : null); }
}
function challengeKill(f) {
  var E = G.event; if (!E || E.kind !== 'challenge' || f.def.isMaster || !f.killer || f.killer.def.isMaster) return;
  if (Math.hypot(f.x - E.x, f.y - E.y) > E.r + 200) return;
  var w = f.killer.team; regainSeal(w); endEvent(null); FX.event('challengeWon', { team: w, loser: f });
}
/* ---- the Church's Bounty ---- */
function startBounty() {
  var ids = {}; servantsAlive().forEach(function (f) { ids[f.team] = 1; }); ids = Object.keys(ids).map(Number);
  var gil = evAlive('gilles'), t = gil ? gil.team : ids.sort(function (a, b) { return (G.expo[b] || 0) - (G.expo[a] || 0) || (teamKills(b) - teamKills(a)); })[0];
  G.event = { kind: 'bounty', team: t, t: 0 }; G.reveal[t] = G.time + CLOCK.night; FX.event('bounty', G.event);
}
function bountyKill(f) {
  var E = G.event; if (!E || E.kind !== 'bounty' || f.team !== E.team || f.def.isMaster || !f.killer || f.killer.team === E.team) return;
  regainSeal(f.killer.team); FX.event('bountyWon', { team: f.killer.team, loser: f }); G.reveal[E.team] = 0; endEvent(null);
}
/* ---- the Horror in the River: a giant familiar rises in the Mion and climbs toward the Fuyuki Bridge.
   Every team near it is in truce. Bring it down before dawn, or the whole city sees it. ---- */
function startHorror() {
  var H = EVT.horror, cul = loreHost('gilles') || loreHost('medea'), m = { boss: true, x: H.path[0][0], y: H.path[0][1], r: H.r, hp: H.hp, max: H.hp, t: 0, leg: 1, slamT: 3, slams: [], dmgBy: {}, team: cul ? cul.team : undefined };
  G.mobs = (G.mobs || []).filter(function (q) { return q.exec || q.keep; }).concat([m]); G.event = { kind: 'horror', boss: m, culprit: cul ? cul.team : -1, t: 0 }; fightNoise(m.x, m.y, 20000); FX.event('horror', G.event);
}
function horrorTick(E, dt) {
  var H = EVT.horror, m = E.boss;
  if (m.dead) {
    var best = -1, bd = 0; for (var t in m.dmgBy) if (m.dmgBy[t] > bd) { bd = m.dmgBy[t]; best = +t; }
    for (var q in m.dmgBy) { var mm = masterOf(+q); if (mm) mm.mana = mm.manaMax; G.expo[+q] = Math.max(0, (G.expo[+q] || 0) - 30); }
    if (best >= 0) regainSeal(best);
    FX.event('horrorDown', { team: best }); endEvent(null); return;
  }
  m.t += dt;
  var goal = H.path[Math.min(m.leg, H.path.length - 1)], d = Math.hypot(goal[0] - m.x, goal[1] - m.y);
  if (d > 6) { m.x += (goal[0] - m.x) / d * H.spd * dt; m.y += (goal[1] - m.y) / d * H.spd * dt; }
  else { m.x = 6000 + Math.sin(m.t * 0.3) * 200; }
  if (E.culprit >= 0) { var cm = masterOf(E.culprit); if (cm && cm.manaMax) cm.mana = Math.min(cm.manaMax, cm.mana + 1.2 * dt); }
  // the horror slams at whoever is in reach: a marked circle, then the blow
  m.slamT -= dt;
  if (m.slamT <= 0) { m.slamT = H.slamEvery; var tg = G.f.filter(function (f) { return f.st !== 'dead' && f.spirit !== 2 && f.team !== E.culprit && Math.hypot(f.x - m.x, f.y - m.y) < m.r + 260; }); if (tg.length) { var v = tg[Math.floor(rnd() * tg.length)]; m.slams.push({ x: v.x, y: v.y, t: 0 }); } }
  m.slams.forEach(function (s) { s.t += dt; if (!s.hit && s.t >= 0.9) { s.hit = true; G.f.forEach(function (f) { if (f.st !== 'dead' && f.spirit !== 2 && f.team !== E.culprit && Math.hypot(f.x - s.x, f.y - s.y) < H.slamR + FR) hurt(null, f, { dmg: H.slamDmg, power: 2, stag: 0.5, kind: 'melee', key: 'horror', hs: 0.06 }, 1, { x: s.x, y: s.y }); }); FX.shake(5); } });
  m.slams = m.slams.filter(function (s) { return s.t < 1.4; });
}
function horrorDawn(E) { if (E.boss.dead) return; for (var t in G.fields) if (+t !== E.culprit) expose(+t, 40); if (E.culprit >= 0) expose(E.culprit, 100); FX.event('horrorDawn', E); }
// a Noble Phantasm fired near the horror always finds it
function npHitsBoss(f, a) { if (!G.mobs) return; G.mobs.forEach(function (m) { if (m.boss && !m.dead && Math.hypot(m.x - f.x, m.y - f.y) < 700) mobHurt(m, (a.dmg || 30) * 2.5 * f.def.dmg, f.team); }); }
/* ---- the Assassin's False Death: the world sees them die, and forgets them ---- */
function startFalseDeath() {
  var h = loreHost('hassan') || servantsAlive().filter(function (f) { return f.def.cls === 'Assassin' && masterOf(f.team); })[0];
  if (!h) { var pool = servantsAlive().filter(function (f) { return masterOf(f.team); }); h = pool[Math.floor(rnd() * pool.length)]; }
  if (!h) return;
  var t = h.team, until = G.time + (G.clock.len - G.clock.t);
  G.ghost = G.ghost || {}; G.ghost[t] = until; G.expo[t] = 0; G.reveal[t] = 0;
  for (var q in G.tn) if (+q !== t) delete G.tn[q][h.def.id];
  for (var s in G.seenBy) if (+s !== t) G.f.forEach(function (f) { if (f.team === t) delete G.seenBy[s][f.idx]; });
  G.f.forEach(function (f) { if (f.team !== t && f.lock && f.lock.team === t) f.lock = null; });
  G.event = { kind: 'falsedeath', team: t, f: h, t: 0, until: until }; FX.event('falsedeath', G.event);
}
function ghosted(f, e) { return !!(G.ghost && G.ghost[e.team] > G.time && !(sameZone(f, e) && dist(f, e) < 220) && !(f.lastHit && f.lastHit.by && f.lastHit.by.team === e.team && G.time - (f.lastHitT || -99) < 4)); }
/* ---- Berserker Unchained: a master loses control, and the servant runs wild ---- */
function startBerserk() {
  var B = EVT.berserk, h = loreHost(['heracles', 'lancelot']);
  if (h && !masterOf(h.team)) h = null;
  if (!h) { var pool = servantsAlive().filter(function (f) { return masterOf(f.team); }).sort(function (a, b) { var ma = masterOf(a.team), mb = masterOf(b.team); return ma.hp / ma.def.hp - mb.hp / mb.def.hp; }); h = pool[0]; }
  if (!h) return;
  h.rampT = G.time + B.dur; G.reveal[h.team] = h.rampT; if (h.spirit) h.spirit = 0;
  G.event = { kind: 'berserk', f: h, team: h.team, t: 0, dur: B.dur }; FX.event('berserk', G.event);
}
function berserkTick(E, dt) {
  var f = E.f, B = EVT.berserk;
  if (f.st === 'dead' || E.t >= E.dur) { endEvent(f.st === 'dead' ? 'The rampage is over.' : 'Its master regains control.'); return; }
  if (f.hp > f.def.hp * B.floor) f.hp = Math.max(f.def.hp * B.floor, f.hp - f.def.hp * B.drain * dt);
}
function rampTarget(f) { var best = null, bv = -1; servantsAlive().forEach(function (e) { if (e.team === f.team || e.spirit === 2) return; var d = dist(f, e); if (d > 3200) return; var v = e.hp - d * 0.05; if (v > bv) { bv = v; best = e; } }); return best; }
/* ---- the school: a bounded field drains everyone inside; skeleton familiars rise; three circles hold it up ---- */
function startSchool() {
  var S = EVT.school, med = evAlive('medusa'), culprit = med && med.partner && med.partner.st !== 'dead' ? med.team : -1, R = schoolRoom();
  var cx = R ? (R.x0 + R.x1) / 2 : S.x, cy = R ? (R.y0 + R.y1) / 2 : S.y;
  // the seal's circles stand in the three classrooms
  var circ = R ? [[R.x0 + 324, R.y0 + 420], [R.x0 + 924, R.y0 + 420], [R.x0 + 1524, R.y0 + 420]] : S.circles;
  var E = { kind: 'school', x: Math.round(cx), y: Math.round(cy), r: R ? Math.round(Math.hypot(R.x1 - R.x0, R.y1 - R.y0) / 2) : S.r, dur: S.dur, t: 0, culprit: culprit, door: { x: 4050, y: 2840 }, circles: circ.map(function (p) { return { x: p[0], y: p[1], r: 75, prog: {}, up: true, by: -1 }; }), allowed: {}, broken: {}, mobT: 2, students: [] };
  G.f.forEach(function (f) { if (f.st !== 'dead' && (zoneOf(f) === 'school' || f.team === culprit)) E.allowed[f.idx] = true; });
  for (var i = 0; i < 26; i++) { var cr = i % 3, sx = R ? R.x0 + 60 + cr * 600 + rnd() * 480 : E.x, sy = R ? R.y0 + 180 + rnd() * 520 : E.y; E.students.push({ x: sx, y: sy, down: 0, id: i }); }
  G.mobs = (G.mobs || []).filter(function (m) { return m.exec || m.keep; }); G.event = E; FX.event('school', E);
}
function inSchool(f) { var E = G.event; return !!(E && E.kind === 'school' && zoneOf(f) === 'school'); }
function schoolRoom() { return (MAP.rooms || []).filter(function (r) { return r.id === 'school'; })[0]; }
// the blood seal keeps out servants who were not inside when it rose (masters may come and go)
function schoolBars(f, d) { var E = G.event; if (!E || E.kind !== 'school' || d.room !== 'school' || f.def.isMaster || E.allowed[f.idx]) return false; if (!(f.barT > G.time)) { f.barT = G.time + 3; FX.text(f, 'THE BLOOD SEAL BARS THE WAY'); } f.doorT = 0.5; return true; }
function schoolTick(E, dt) {
  // servants who were not inside when it rose cannot enter, even in spirit form; masters may come and go
  G.f.forEach(function (f) {
    if (f.st === 'dead' || f.def.isMaster || E.allowed[f.idx] || zoneOf(f) !== 'school') return;
    { f.x = E.door.x; f.y = E.door.y + 90; f.kx = f.ky = 0; if (!(f.barT > G.time)) { f.barT = G.time + 4; FX.text(f, 'THE FIELD HOLDS YOU OUT'); } }
  });
  // the drain: never kills, but it wears everyone down
  G.f.forEach(function (f) { if (f.st === 'dead' || f.team === E.culprit || !inSchool(f) || f.spirit === 2) return; var k = f.def.isMaster ? EVT.school.drainM : EVT.school.drainS; if (f.hp > EVT.school.floor) f.hp = Math.max(EVT.school.floor, f.hp - k * dt); });
  E.students.forEach(function (s, i) { if (E.t > 12 + i * 6) s.down = Math.min(1, s.down + dt); });
  if (E.culprit >= 0) { var cm = G.f.filter(function (f) { return f.team === E.culprit && f.def.isMaster && f.st !== 'dead'; })[0]; if (cm && cm.manaMax) cm.mana = Math.min(cm.manaMax, cm.mana + 1.5 * dt); }
  // familiars rise from the circles that still stand
  E.mobT -= dt; var up = E.circles.filter(function (c) { return c.up; });
  if (E.mobT <= 0 && up.length) { E.mobT = EVT.school.mobEvery; var live = G.mobs.filter(function (m) { return !m.dead; }).length; for (var n = 0; n < up.length && live < EVT.school.mobMax; n++, live++) { var c = up[n]; G.mobs.push({ x: c.x + (rnd() - 0.5) * 80, y: c.y + (rnd() - 0.5) * 80, hp: EVT.school.mobHp, atkT: 1, t: 0, dead: false, vx: 0, vy: 0 }); } }
  mobsTick(E, dt);
  // breaking the circles: stand in one, uncontested by familiars, until it shatters; a hit sets you back a little
  E.circles.forEach(function (c) {
    if (!c.up) return;
    G.f.forEach(function (f) {
      if (f.st === 'dead' || f.team === E.culprit || f.spirit === 2 || Math.hypot(f.x - c.x, f.y - c.y) > c.r) return;
      if (G.mobs.some(function (m) { return !m.dead && Math.hypot(m.x - c.x, m.y - c.y) < EVT.school.contest; })) return;
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
    if (m.dead || m.boss || m.exec || m.keep) return; m.t += dt; m.atkT -= dt;
    var tg = null, bd = 900; G.f.forEach(function (f) { if (f.st === 'dead' || f.team === E.culprit || f.spirit === 2 || !inSchool(f)) return; var d = Math.hypot(f.x - m.x, f.y - m.y); if (d < bd) { bd = d; tg = f; } });
    if (!tg) { m.vx = m.vy = 0; return; }
    var a = Math.atan2(tg.y - m.y, tg.x - m.x); m.face = a;
    if (bd > 34) { m.x += Math.cos(a) * 140 * dt; m.y += Math.sin(a) * 140 * dt; m.vx = Math.cos(a); m.vy = Math.sin(a); rectsIn(m.x - 14, m.y - 14, m.x + 14, m.y + 14).forEach(function (r) { pushOutRect(m, r, 12); }); }
    else if (m.atkT <= 0) { m.atkT = 1.2; m.swing = G.time; hurt(null, tg, { dmg: 5, power: 1, stag: 0.12, kind: 'melee', key: 'mob', hs: 0.03 }, 1, { x: m.x, y: m.y }); }
  });
  G.mobs = G.mobs.filter(function (m) { return !m.dead || m.exec || m.keep; });
}
// fighters' blows and shots also strike familiars
function hitMobsArc(f, a, mult) { if (!G.mobs || !G.mobs.length) return; G.mobs.forEach(function (m) { if (!m.dead && Math.hypot(m.x - f.x, m.y - f.y) - (m.r || 16) <= (a.reach || 60) + 20) mobHurt(m, a.dmg * (mult || 1) * f.def.dmg * (f.def.isMaster ? 2 : 1), f.team); }); }
function hitMobsAt(x, y, r, dmg, team) { if (!G.mobs || !G.mobs.length) return false; var hit = false; G.mobs.forEach(function (m) { if (!m.dead && Math.hypot(m.x - x, m.y - y) <= r + (m.r || 16)) { mobHurt(m, dmg, team); hit = true; } }); return hit; }
function mobHurt(m, d, team) { if (m.team !== undefined && m.team === team) return; d = Math.max(4, d); m.hp -= d; if (m.scout) m.stunT = 0.9; if (team !== undefined) { m.dmgBy = m.dmgBy || {}; m.dmgBy[team] = (m.dmgBy[team] || 0) + d; } FX.spark(m.x, m.y, m.boss ? '#7a3a8a' : '#e8e2d0', 5); if (m.hp <= 0) { m.dead = true; FX.fx(m.boss ? 'bossDie' : 'mobDie', m.x, m.y, null); } }
/* ---- truce: the sealed school (and a moment after), the horror in the river, the banquet table, the Church's summons ---- */
function truceZone(f) {
  var E = G.event;
  if (E && E.kind === 'school' && inSchool(f)) return 'school';
  if (E && E.kind === 'horror' && !E.boss.dead && f.team !== E.culprit && f.x < MAP.cityW && Math.hypot(f.x - E.boss.x, f.y - E.boss.y) < EVT.horror.truceR) return 'horror';
  var L = G.lastSchool; if (L && G.time < L.truceEnd && f.x < MAP.cityW && Math.hypot(f.x - L.x, f.y - L.y) < L.r + 200 && !L.betray[f.team]) return 'school';
  if (G.tasks) for (var i = 0; i < G.tasks.length; i++) { var k = G.tasks[i]; if ((k.kind === 'banquet' || k.kind === 'summons') && (k.kind === 'banquet' || f.x < MAP.cityW) && Math.hypot(f.x - k.x, f.y - k.y) < k.r + 120) return k.kind; }
  return null;
}
function inTruce(a, b) { if (!eventsOn() || !a || !b || a.team === b.team || (G.oath && (G.oath[a.team] || G.oath[b.team]))) return false; var za = truceZone(a); return !!za && za === truceZone(b); }
// returns true if the blow is stopped by the truce; a human who strikes anyway breaks it, and pays
function truceStops(att, def) {
  if (!att || !inTruce(att, def)) return false;
  if (G.ai[att.idx]) return true;
  G.oath = G.oath || {}; G.oath[att.team] = true; expose(att.team, 60); churchHeat(att.team, CHURCH.sendAt); G.reveal[att.team] = G.time + 60; FX.event('oath', { team: att.team });
  return false;
}
/* ---- the King's Banquet: Iskandar hosts if he lives, else the most kingly servant; with no king left, the Church holds a meeting instead ---- */
var KINGS = ['iskandar', 'gilgamesh', 'caerwyn', 'richard', 'leonidas'];
function startBanquet() {
  var host = loreHost(KINGS); if (!host) { startSummons(); return; }
  // the table is set on the castle roof, up the grand staircase
  var roof = (MAP.rooms || []).filter(function (r) { return r.id === 'einroof'; })[0], bx = roof ? roof.x0 + 700 : EVT.banquet.x, by = roof ? roof.y0 + 470 : EVT.banquet.y;
  G.tasks.push({ kind: 'banquet', x: bx, y: by, r: EVT.banquet.r, name: 'The King’s Banquet', need: EVT.banquet.need, prog: {}, done: {}, host: host.team, hostF: host });
  FX.event('banquet', { host: host.team, f: host });
}
function banquetDone(t, k) {
  var here = {}; G.f.forEach(function (f) { if (f.st !== 'dead' && Math.hypot(f.x - k.x, f.y - k.y) < k.r + 120) here[f.team] = 1; });
  G.f.forEach(function (s) { if (s.st === 'dead' || s.def.isMaster) return; for (var q in here) if (+q !== s.team) learnName(+q, s, 'banquet'); });
}
/* ---- the Overseer's Summons: masters are called to the Church under truce ---- */
function startSummons() {
  G.tasks.push({ kind: 'summons', x: EVT.summons.x, y: EVT.summons.y, r: EVT.summons.r, name: 'The Overseer’s Summons', need: EVT.summons.need, prog: {}, done: {} });
  FX.event('summons', {});
}
function summonsDone(t) {
  G.expo[t] = 0; G.grailKnown = G.grailKnown || {}; G.grailKnown[t] = true; grailSite();
  var un = servantsAlive().filter(function (s) { return s.team !== t && !G.tn[t][s.def.id]; }); if (un.length) learnName(t, un[Math.floor(rnd() * un.length)], 'church');
}
/* ---- the final night: the Grail descends on one of the three ley lines. Pure, it heals those at its heart;
   corrupted, its mud wells up inside the ring and maddens the servants near its center ---- */
function startGrail() {
  var g = EVT.grail, site = grailSite(), dead = G.f.filter(function (f) { return f.st === 'dead' && !f.def.isMaster; }).length;
  var corrupt = site.cavern || G.shadowSeen || rnd() < Math.min(0.75, 0.25 + 0.04 * dead);
  G.event = { kind: 'grail', x: site.x, y: site.y, name: site.name, r: site.cavern ? EVT2.cavern.r0 : g.r0, t: 0, corrupt: corrupt, pools: [], poolT: 3, cavern: !!site.cavern }; G.clock.evDone = true; FX.event('grail', G.event);
}
function grailTick(E, dt) {
  var g = EVT.grail, r0 = E.cavern ? EVT2.cavern.r0 : g.r0, r1 = E.cavern ? EVT2.cavern.r1 : g.r1; E.r = r1 + (r0 - r1) * Math.max(0, 1 - E.t / g.shrink);
  G.f.forEach(function (f) {
    if (f.st === 'dead' || f.inM) return;
    if (E.cavern) { if (!inCavern(f)) { if (E.t > EVT2.cavern.grace) { var kc = g.dmgC * dt; f.hp -= kc; f.stat.taken += kc; if (f.hp <= 0) { f.cause = 'grail'; kill(f, true); } } return; } }
    else if (f.x > MAP.cityW) return;
    var d = Math.hypot(f.x - E.x, f.y - E.y);
    if (d > E.r) { var k = (E.corrupt ? g.dmgC : g.dmg) * dt; f.hp -= k; f.stat.taken += k; if (f.hp <= 0) { f.cause = 'grail'; kill(f, true); } return; }
    if (!E.corrupt && d < 280 && f.spirit !== 2) f.hp = Math.min(f.def.hp, f.hp + g.heal * dt);
    if (E.corrupt && d < 450 && !f.def.isMaster && f.hp > f.def.hp * 0.2) f.hp -= 0.8 * dt;
  });
  if (!E.corrupt) return;
  E.poolT -= dt;
  if (E.poolT <= 0) { E.poolT = g.poolEvery; var a = rnd() * 6.283, rr = Math.pow(rnd(), 1.6) * Math.min(E.r * 0.8, E.cavern ? 900 : 1400); E.pools.push({ x: E.x + Math.cos(a) * rr, y: E.y + Math.sin(a) * rr, r: 120, t: 0 }); }
  E.pools.forEach(function (p) { p.t += dt; if (p.t < 1.2) return; G.f.forEach(function (f) { if (f.st === 'dead' || f.spirit === 2 || f.inM || (E.cavern && !inCavern(f)) || Math.hypot(f.x - p.x, f.y - p.y) > p.r) return; f.hp -= 7 * dt; f.stat.taken += 7 * dt; if (f.hp <= 0) { f.cause = 'grail'; kill(f, true); } }); });
  E.pools = E.pools.filter(function (p) { return p.t < 7.2; });
}
function grailPull(f) { var E = G.event; if (!E || E.kind !== 'grail') return null; return { x: E.x, y: E.y, r: E.r }; }
function grailMad(f) { var E = G.event; return !!(E && E.kind === 'grail' && E.corrupt && !f.def.isMaster && Math.hypot(f.x - E.x, f.y - E.y) < 450); }
