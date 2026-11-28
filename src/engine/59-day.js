/* ---- 3b-2: bounded fields, true names and what teams do by day ----
   Every home is a mage's workshop with a bounded field. Mage families start with stronger fields;
   a Caster servant turns the home into a Temple on top of whatever the master built.
   Any enemy that crosses a field is felt by its owners, spirit form or not. Only an Assassin's
   Presence Concealment slips through. Fields slow intruders and, when strong, fire on them.
   By day each team chooses what to do: fortify the home, draw on a ley line, investigate where
   last night's battles happened (and learn a servant's true name), or, for the students, go to school. */
var FIELD = { baseR: 380, perLvl: 70, slow: [1, 0.9, 0.86, 0.82, 0.78, 0.74], bolt: [0, 0, 0, 4, 3, 2.5], boltPct: [0, 0, 0, 0.04, 0.06, 0.08], home: [1, 1, 1.06, 1.08, 1.12, 1.15], seen: 5, starve: 2, noSpirit: 4 };
// magic resistance by class: how much of a field's bolt reaches a servant (masters take it all)
var FIELD_MR = { Saber: 0.35, Lancer: 0.4, Archer: 0.45, Rider: 0.65, Berserker: 0.7, Caster: 0.9, Assassin: 0.9 };
function fieldResist(e) { return e.def.isMaster ? 1 : (FIELD_MR[e.def.cls] || 0.7); }
var DAYTASK = { fortify: 35, ley: 30, trace: 22, school: 30, contest: 320 };
var LEY = [{ x: 1500, y: 1060, name: 'Ryuudou Temple ley line' }, { x: 1260, y: 3060, name: 'Church hill ley line' }, { x: 10450, y: 5050, name: 'Civic Hall ley line' }];
var SCHOOL = { x: 4050, y: 2720, name: 'Homurahara Academy' }, STUDENTS = { shirou: 1, rin: 1, sakura: 1 };
function initFields() {
  G.fields = {}; G.seenBy = {}; G.tn = {}; G.traces = []; G.tasks = [];
  if (!G.homes || !MAP.cityW) return;
  G.homes.forEach(function (h) {
    var t = h.team, m = G.f.filter(function (f) { return f.team === t && f.def.isMaster; })[0], s = m && m.partner;
    var lvl = m && m.def.type === 'Mage family' ? 2 : 1, max = m && m.def.type === 'Mage family' ? 4 : 3, temple = !!(s && s.def.cls === 'Caster');
    // an Outsider has no magecraft to raise a bounded field: the home still shelters (healing, mana) but guards nothing, unless a Caster builds one
    if (m && m.def.type === 'Outsider' && !temple) { lvl = 0; max = 0; }
    if (temple) { lvl += 1; max += 1; }
    var rooms = (MAP.rooms || []).filter(function (r) { return (h.canon && (r.id === h.key || (h.key === 'emiya' && r.id === 'shed'))) || r.id === h.room; }).map(function (r) { return r.id; });
    G.fields[t] = { team: t, x: h.x, y: h.y, lvl: lvl, max: max, temple: temple, rooms: rooms, boltT: 3, name: h.name, inside: {} };
    G.seenBy[t] = {}; G.tn[t] = {};
  });
  G.f.forEach(function (f) { if (!f.def.isMaster) G.tn[f.team][f.def.id] = true; });
  if (G.clock) newPhaseEvents();
}
function fieldR(F) { return FIELD.baseR + FIELD.perLvl * F.lvl; }
function fieldAlive(F) { return G.f.some(function (f) { return f.team === F.team && f.st !== 'dead' && (f.def.isMaster || f.def.cls === 'Caster'); }); }
function inHomeField(F, f) {
  if (f.x > MAP.cityW) { var rm = roomAt(f.x, f.y); return !!(rm && F.rooms.indexOf(rm.id) >= 0); }
  return Math.hypot(f.x - F.x, f.y - F.y) <= fieldR(F);
}
function concealed(f) { return !!(f.cnc && f.def.cls === 'Assassin'); }
// a field senses mana: a concealed Assassin and an Outsider with no magecraft (Kuzuki) pass unfelt, though the field still drags at them
function unfelt(f) { return concealed(f) || f.def.type === 'Outsider'; }
function fieldAt(f) { if (!G.fields) return null; for (var t in G.fields) { var F = G.fields[t]; if (+t !== f.team && F.lvl > 0 && inHomeField(F, f)) return F; } return null; }
function ownField(f) { var F = G.fields && G.fields[f.team]; return F && F.lvl > 0 && inHomeField(F, f) ? F : null; }
function fieldsTick(dt) {
  if (!G.fields) return;
  for (var t in G.fields) {
    var F = G.fields[t]; if (F.lvl > 0 && !fieldAlive(F)) { F.lvl = 0; FX.field('fade', F, null); }
    if (F.lvl <= 0) continue;
    var intr = [], hostsTruce = fieldHostsTruce(F);
    G.f.forEach(function (e) {
      if (e.team === F.team || pactTeams(e.team, F.team) || e.st === 'dead' || e.inM) { F.inside[e.idx] = false; return; }
      var inside = !hostsTruce && inHomeField(F, e);
      if (inside && !concealed(e) && !truceZone(e)) {
        if (!unfelt(e)) { G.seenBy[F.team][e.idx] = G.time + FIELD.seen; if (!F.inside[e.idx]) FX.field('intrude', F, e); intr.push(e);
          // level 2: the field starves intruders (no mana regeneration, no healing in spirit form); level 4: no slipping into spirit form
          if (F.lvl >= FIELD.starve) e.fieldSup = G.time + 0.3;
          if (F.lvl >= FIELD.noSpirit) e.fieldNoSp = G.time + 0.3; }
        if (FIELD.slow[F.lvl] < 1) { e.fslowT = G.time + 0.3; e.fslowK = FIELD.slow[F.lvl]; }
      }
      if (inside && !F.inside[e.idx] && e.idx !== undefined && !unfelt(e)) FX.field('enter', F, e);
      F.inside[e.idx] = inside && !unfelt(e);
    });
    // a strong field strikes at intruders who are materialized
    var bt = FIELD.bolt[F.lvl];
    if (bt && intr.length) { F.boltT -= dt; if (F.boltT <= 0) { F.boltT = bt; var tg = intr.filter(function (e) { return e.spirit !== 2; }); if (tg.length) { var e = tg[Math.floor(rnd() * tg.length)], bd = e.def.hp * FIELD.boltPct[Math.min(F.lvl, 5)] * fieldResist(e); FX.field('bolt', F, e); hurt(null, e, { dmg: bd, power: 1, stag: 0.15, spell: true, kind: 'proj', key: 'field', hs: 0.04 }, 1, { x: F.x, y: F.y }); } } }
    else F.boltT = Math.max(F.boltT, 1.5);
  }
}
function trueName(team, s) { return !s || s.def.isMaster || !G.tn || !G.tn[team] || !!G.tn[team][s.def.id]; }
function learnName(team, s, how) { if (!G.tn || !G.tn[team] || s.def.isMaster || G.tn[team][s.def.id]) return false; G.tn[team][s.def.id] = true; FX.truename(team, s, how); return true; }
// using a Noble Phantasm where a team can see it gives the servant's identity away
function npSeen(f) {
  if (!G.tn) return;
  var seen = {}; G.f.forEach(function (o) { if (o.st !== 'dead' && o.team !== f.team && sameZone(o, f) && dist(o, f) < 1300) seen[o.team] = 1; });
  for (var t in seen) learnName(+t, f, 'np');
  if (isDay() || !clockOn()) return;
  G.traces.push({ x: f.x, y: f.y, t: G.time, sv: [f.def.id], teams: [f.team] });
}
function traceKill(f) { if (!clockOn() || isDay() || f.x > MAP.cityW) return; var sv = [f, f.killer].filter(function (q) { return q && !q.def.isMaster; }).map(function (q) { return q.def.id; }); var tm = f.killer ? [f.team, f.killer.team] : [f.team]; if (f.partner && !f.partner.def.isMaster) sv.push(f.partner.def.id); G.traces.push({ x: f.x, y: f.y, t: G.time, sv: sv, teams: tm }); }
/* ---- day tasks ---- */
function startDay() {
  G.tasks = [];
  if (!G.fields) return;
  LEY.forEach(function (l) { G.tasks.push({ kind: 'ley', x: l.x, y: l.y, r: 170, name: l.name, need: DAYTASK.ley, prog: {}, done: {} }); });
  G.tasks.push({ kind: 'school', x: SCHOOL.x, y: SCHOOL.y, r: 260, name: SCHOOL.name, need: DAYTASK.school, prog: {}, done: {} });
  var tr = G.traces.slice().reverse(), picked = [];
  tr.forEach(function (q) { if (picked.length < 3 && !picked.some(function (p) { return Math.hypot(p.x - q.x, p.y - q.y) < 900; })) picked.push(q); });
  picked.forEach(function (q, i) { G.tasks.push({ kind: 'trace', x: q.x, y: q.y, r: 170, name: 'Battle site ' + (i + 1), sv: q.sv, need: DAYTASK.trace, prog: {}, done: {} }); });
  for (var t in G.fields) { var F = G.fields[t]; if (F.lvl > 0 && F.lvl < F.max) G.tasks.push({ kind: 'fortify', x: F.x, y: F.y, r: 220, name: 'Fortify ' + F.name, team: +t, need: DAYTASK.fortify, prog: {}, done: {} }); }
  G.traces = [];
  dayActivities(); sendScouts();
}
function taskFor(team, k) {
  if (k.team !== undefined && k.team !== team) return false;
  if (k.done[team]) return false;
  if (k.kind === 'relic' && k.claimed !== undefined) return false;
  if (k.kind === 'school') return G.f.some(function (f) { return f.team === team && f.def.isMaster && f.st !== 'dead' && STUDENTS[f.def.id]; });
  if (k.kind === 'trace') return k.sv.some(function (id) { return !G.tn[team][id] && G.f.some(function (f) { return f.def.id === id && f.team !== team; }); });
  return true;
}
function tasksTick(dt) {
  if (!isDay() || !G.tasks.length) return;
  G.tasks.forEach(function (k) {
    if (dayActiveTick(k, dt)) return;
    // the King's Banquet is a servants' table: nothing happens until at least two servants sit at it
    if (k.kind === 'banquet' && banquetSeated(k) < 2) { k.waiting = true; return; } k.waiting = false;
    var teams = {};
    G.f.forEach(function (f) { if (f.st !== 'dead' && !f.inM && f.x < MAP.cityW && Math.hypot(f.x - k.x, f.y - k.y) < k.r && (f.def.isMaster || k.kind !== 'school')) teams[f.team] = 1; });
    for (var t in teams) {
      t = +t; if (!taskFor(t, k)) continue;
      var contested = G.f.some(function (e) { return e.team !== t && e.st !== 'dead' && e.spirit !== 2 && !concealed(e) && Math.hypot(e.x - k.x, e.y - k.y) < DAYTASK.contest; });
      k.cont = k.cont || {}; k.cont[t] = contested; if (contested) continue;
      k.prog[t] = (k.prog[t] || 0) + dt;
      if (k.prog[t] >= k.need) { k.done[t] = true; finishTask(t, k); }
    }
  });
}
function finishTask(t, k) {
  var m = G.f.filter(function (f) { return f.team === t && f.def.isMaster && f.st !== 'dead'; })[0], note = '';
  if (k.kind === 'fortify') { var F = G.fields[t]; F.lvl = Math.min(F.max, F.lvl + 1); note = 'Bounded field strengthened to level ' + F.lvl; }
  else if (k.kind === 'ley') { if (m) { m.mana = m.manaMax; m.manaBonus = 40; } note = 'Mana overflows: full mana and 40 stored'; }
  else if (k.kind === 'school') { G.expo[t] = Math.max(0, (G.expo[t] || 0) - 35); if (m) m.mana = m.manaMax; note = 'A normal school day: suspicion fades'; }
  else if (k.kind === 'relic') { relicDone(t, k); note = 'The relic is yours. Your servant hits a little harder for the rest of the war'; }
  else if (k.kind === 'summons') { summonsDone(t); note = 'The overseer clears your name, tells you where the Grail will descend, and names a rival'; }
  else if (k.kind === 'banquet') { banquetDone(t, k); note = 'You share the king\u2019s wine, and the names of everyone at the table'; }
  else if (k.kind === 'trace') { var id = k.sv.filter(function (q) { return !G.tn[t][q]; })[0], s = G.f.filter(function (f) { return f.def.id === id; })[0]; if (s) learnName(t, s, 'trace'); note = 'Traces read'; }
  FX.task(t, k, note);
}
// the AI's choice of what to do today
var BANQ_LEAVE = 35; // seconds of daylight left when everyone heads home from the banquet
function aiDayGoal(f) {
  var E = G.event;
  if (E && E.kind === 'school' && E.culprit !== f.team && (inSchool(f) || STUDENTS[f.def.id] || Math.hypot(f.x - E.x, f.y - E.y) < 3500)) { var c = null, cd = 1e9; E.circles.forEach(function (q) { var d = Math.hypot(f.x - q.x, f.y - q.y); if (q.up && d < cd) { cd = d; c = q; } }); if (c) return c; }
  if (!G.tasks || !G.tasks.length) return null;
  // the banquet is safe ground: teams go to it even hurt, and leave in time to be home before dark
  var bq = G.tasks.filter(function (k) { return k.kind === 'banquet' && !(k.done && k.done[f.team]); })[0];
  if (bq && banquetLeft() > BANQ_LEAVE && taskFor(f.team, bq) && !G.f.some(function (e) { return e.team !== f.team && e.st !== 'dead' && !e.def.isMaster && Math.hypot(e.x - f.x, e.y - f.y) < 450 && knows(f, e); })) return bq;
  if (f.hp < f.def.hp * 0.6 || (f.partner && f.partner.hp < f.partner.def.hp * 0.5)) return null;
  var best = null, bs = -1e9;
  G.tasks.forEach(function (k) {
    if (!taskFor(f.team, k)) return;
    if (k.kind === 'banquet' && banquetLeft() <= BANQ_LEAVE) return;
    var v = { fortify: 60, trace: 50, ley: 30, school: 45, banquet: k.host === f.team ? 120 : 40, summons: 45, relic: 55 }[k.kind] + (k.kind === 'fortify' && f.def.type === 'Mage family' ? 25 : 0) + (k.kind === 'school' && (G.expo[f.team] || 0) > 30 ? 30 : 0) - Math.hypot(f.x - k.x, f.y - k.y) / 120;
    if (G.f.some(function (e) { return e.team !== f.team && e.st !== 'dead' && Math.hypot(e.x - k.x, e.y - k.y) < 500 && knows(f, e); })) v -= 60;
    if (v > bs) { bs = v; best = k; }
  });
  return bs > 0 ? best : null;
}
