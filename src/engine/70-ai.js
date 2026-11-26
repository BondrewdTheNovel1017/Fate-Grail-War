/* ---- AI ---- */
var DIFF = {
  training: { name: 'Training', react: 0.6, skill: 0.1, agg: 0.3, err: 0.12, desc: 'Slow, readable, forgiving.' },
  knight: { name: 'Knight', react: 0.34, skill: 0.45, agg: 0.55, err: 0.09, desc: 'Reacts to what you telegraph.' },
  champion: { name: 'Champion', react: 0.22, skill: 0.8, agg: 0.8, err: 0.05, desc: 'Parries, dodges, and punishes.' }
};
function mkAI(f, cfg) { return { f: f, cfg: cfg, cool: 0.6 + Math.random() * 0.4, orbit: 1, orbitT: 1.5, seen: -1, plan: null, guardUntil: 0, relAt: 0, comboLeft: 0, t: 0, lastX: f.x, lastY: f.y, stuckT: 0 }; }
function losClear(a, b) {
  if (a.inM) return true;
  if (RECTS.length && !rectLos(a.x, a.y, b.x, b.y)) return false;
  var PL = pillarsIn(a.x, a.y, b.x, b.y);
  for (var i = 0; i < PL.length; i++) {
    var p = PL[i]; if (p.nb) continue; var dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
    var t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / L2, 0, 1), cx = a.x + dx * t, cy = a.y + dy * t;
    if (Math.hypot(p.x - cx, p.y - cy) < p.r + 6) return false;
  }
  return true;
}
function navTarget(f, tx, ty) {
  if (MAP.nav && !f.inM) return cityNav(f, tx, ty);
  var rv = MAP.river; if (!rv || f.inM) return [tx, ty];
  var sf = f.x < rv.x ? -1 : 1, st = tx < rv.x ? -1 : 1, onBridge = Math.abs(f.x - rv.x) < rv.half + 40 && rv.bridges.some(function (by) { return Math.abs(f.y - by) < 80; });
  if (sf === st || onBridge) return [tx, ty];
  var by = rv.bridges.reduce(function (a, c) { return Math.abs(c - (f.y + ty) / 2) < Math.abs(a - (f.y + ty) / 2) ? c : a; });
  if (Math.abs(f.y - by) > 50 || Math.abs(f.x - rv.x) > rv.half + 120) return [rv.x + sf * (rv.half + 90), by];
  return [rv.x - sf * (rv.half + 120), by];
}
function steer(f, tx, ty) {
  var nt = navTarget(f, tx, ty); tx = nt[0]; ty = nt[1];
  var dx = tx - f.x, dy = ty - f.y, L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
  var ox = dx, oy = dy, PL = f.inM ? [] : pillarsIn(f.x - 260, f.y - 260, f.x + 260, f.y + 260);
  for (var i = 0; i < PL.length; i++) {
    var p = PL[i], px = p.x - f.x, py = p.y - f.y, pr = px * ox + py * oy;
    if (pr < 0 || pr > Math.min(L, 230)) continue;
    var perp = px * (-oy) + py * ox, need = p.r + FR + 22;
    if (Math.abs(perp) < need) { var s = perp > 0 ? 1 : -1, k = 1.6 * (1.2 - Math.abs(perp) / need); dx += oy * s * k; dy += -ox * s * k; }
  }
  if (RECTS.length && !f.inM) { var RL = rectsIn(f.x - 200, f.y - 200, f.x + 200, f.y + 200); for (var ri = 0; ri < RL.length; ri++) { var rq = RL[ri]; if (!segRect(f.x, f.y, f.x + ox * Math.min(L, 160), f.y + oy * Math.min(L, 160), rq, FR + 8)) continue; var rcx = (rq.x0 + rq.x1) / 2 - f.x, rcy = (rq.y0 + rq.y1) / 2 - f.y, side = (rcx * (-oy) + rcy * ox) > 0 ? 1 : -1; dx += oy * side * 1.1; dy += -ox * side * 1.1; } }
  if (f.x < 90) dx += 0.8; if (f.x > W - 90) dx -= 0.8; if (f.y < 90) dy += 0.8; if (f.y > H - 90) dy -= 0.8;
  var m = Math.hypot(dx, dy) || 1; return [dx / m, dy / m];
}
function aiPressDodge(ai, side) {
  if (ai.f.dodges <= 0) return;
  var f = ai.f, o = f.foe, an = angTo(f, o), s = side || (Math.random() < 0.5 ? 1 : -1), back = Math.random() < 0.35;
  var da = back ? an + Math.PI : an + s * Math.PI / 2;
  f.inp.mx = Math.cos(da); f.inp.my = Math.sin(da); press(f, 'dodge');
}
function threatened(f, e) {
  var a = e.act; if (!a) return false;
  var d = dist(f, e);
  if (a.kind === 'charge') return d < a.dist + 60 && Math.abs(angDiff(e.face, angTo(e, f))) < 0.7;
  if (a.kind === 'pulses') return d < a.r + 90;
  if (a.kind === 'proj') return Math.abs(angDiff(e.face, angTo(e, f))) < 0.35 && d < a.range + 40;
  if (a.kind === 'volley') return Math.abs(angDiff(e.face, angTo(e, f))) < 0.6 && d < a.range + 40;
  if (a.kind === 'rain' || a.kind === 'arm' || a.kind === 'ubw') return false;
  if (a.kind === 'barrage') return Math.abs(angDiff(e.face, angTo(e, f))) < 0.5 && d < a.range + 40;
  if (a.kind === 'wall' || a.kind === 'shadow') return false;
  if (a.kind === 'aoe') return d < a.r + 60;
  return d < (a.reach || 100) + FR + 70;
}
function aiTick(ai, dt) {
  var f = ai.f, o = f.foe, cfg = ai.cfg, A = f.A;
  var inp = f.inp;
  if (f.st === 'dead' || o.st === 'dead' || G.over) { inp.mx = inp.my = 0; inp.guard = false; inp.heavy = false; return; }
  ai.t += dt; ai.cool -= dt; ai.orbitT -= dt;
  if (ai.orbitT <= 0) { ai.orbit = Math.random() < 0.5 ? 1 : -1; ai.orbitT = 1 + Math.random() * 1.6; }
  var d = dist(f, o), toO = angTo(f, o);
  if (inp.heavy && G.time >= ai.relAt) inp.heavy = false;
  if (f.def.cls === 'Assassin' && !f.cnc && f.st === 'idle' && d > 360 && G.time >= (f.cncCd || 0) && !f.isPlayerMate && Math.random() < 0.02) press(f, 'spirit');
  if (concealed(o) && !knowsExact(f, o)) { inp.mx = 0; inp.my = 0; inp.guard = Math.random() < 0.6; turnToward(f, f.face + 0.6, 2, dt); return; }
  inp.guard = G.time < ai.guardUntil;
  // distance from stuck detection
  if (f.st === 'idle') {
    if (Math.hypot(f.x - ai.lastX, f.y - ai.lastY) < 2 * dt * 60 * 0.1) ai.stuckT += dt; else ai.stuckT = 0;
    ai.lastX = f.x; ai.lastY = f.y;
  }
  // --- defence ---
  var e = o;
  if ((e.st === 'wind' || e.st === 'counter') && e.act && e.key !== 'counter' && !e.hidAct && threatened(f, e)) {
    if (ai.seen !== e.atkId) { ai.seen = e.atkId; ai.plan = null; ai.planned = false; }
    if (!ai.planned && e.t >= cfg.react && e.st === 'wind') {
      ai.planned = true;
      var a = e.act, r = Math.random(), sk = cfg.skill;
      var heavyish = a.power >= 2 || a.unblock || a.gb || a.kind === 'charge' || a.kind === 'pulses';
      var P = null;
      if (heavyish) {
        if (r < 0.8 * sk) P = { kind: 'dodge', lead: 0.17 };
        else if (r < 0.9 * sk && !a.unblock) P = { kind: 'parry', lead: 0.07 };
      } else if (a.kind === 'proj' || a.kind === 'volley') {
        if (r < 0.35 + 0.5 * sk) P = { kind: 'guard', lead: 0.7 };
        else if (r < 0.9) P = { kind: 'dodge', lead: 0.12 };
      } else {
        if (r < 0.4 * sk) P = { kind: 'guard', lead: 0.6 };
        else if (r < 0.55 * sk) P = { kind: 'parry', lead: 0.07 };
        else if (r < 0.65 * sk) P = { kind: 'dodge', lead: 0.13 };
      }
      if (P) { P.lead += gauss() * cfg.err; P.side = Math.random() < 0.5 ? 1 : -1; }
      ai.plan = P;
    }
    if (ai.plan && !ai.plan.done) {
      var rem = (e.windTotal || e.curWind || 0.3) - e.t;
      if (e.act.max && e.goal) rem = e.goal - e.t;
      if (rem <= ai.plan.lead) {
        ai.plan.done = true;
        if (f.st === 'idle' || f.st === 'rec') {
          if (ai.plan.kind === 'dodge') aiPressDodge(ai, ai.plan.side);
          else if (ai.plan.kind === 'guard') { ai.guardUntil = G.time + 0.6; inp.guard = true; }
          else if (ai.plan.kind === 'parry') { ai.guardUntil = G.time + 0.35; inp.guard = true; f.lastG = -9; }
          else if (ai.plan.kind === 'counter') press(f, 'skill');
        }
      }
    }
  }
  // dodge incoming arrows
  for (var i = 0; i < G.proj.length; i++) {
    var p = G.proj[i]; if (p.owner === f) continue;
    var pd = Math.hypot(p.x - f.x, p.y - f.y);
    if (pd < 240 && p.trav > cfg.react * 600 * 0.1 && !p.seen) {
      var dir = Math.atan2(p.vy, p.vx), toMe = Math.atan2(f.y - p.y, f.x - p.x);
      if (Math.abs(angDiff(dir, toMe)) < 0.25) { p.seen = true; if (Math.random() < 0.5 * cfg.skill + 0.1 && f.st === 'idle') { if (Math.random() < 0.5) aiPressDodge(ai); else ai.guardUntil = G.time + 0.4; } }
    }
  }
  // zone avoidance
  var flee = null;
  for (var j = 0; j < G.zones.length; j++) { var z = G.zones[j]; if (z.owner !== f && !z.done && Math.hypot(f.x - z.x, f.y - z.y) < z.r + 30 && z.t > cfg.react * 0.6) { flee = z; break; } }
  var mx = 0, my = 0;
  var wantRange = f.def.ranged ? 380 : (((f.armT > 0 && f.arm >= 0 && A.arms) ? A.arms[f.arm].light : A.light).reach + FR - 14);
  if (f.st === 'idle' || f.st === 'rec') {
    if (ai.plantT > 0) ai.plantT -= dt;
    if (flee) { var fa = Math.atan2(f.y - flee.y, f.x - flee.x); mx = Math.cos(fa); my = Math.sin(fa); }
    else if (f.def.field && ai.plantT > 0 && !f.field) { mx = 0; my = 0; }
    else if (f.def.ranged) {
      if (d < 250) { var sv = steer(f, f.x + (f.x - o.x), f.y + (f.y - o.y)); mx = sv[0]; my = sv[1]; if (ai.stuckT > 0.4) { mx = Math.cos(toO + ai.orbit * 1.5); my = Math.sin(toO + ai.orbit * 1.5); } }
      else if (d > 520 || !losClear(f, o)) { var sv2 = steer(f, o.x, o.y); mx = sv2[0] * 0.8; my = sv2[1] * 0.8; }
      else { mx = Math.cos(toO + ai.orbit * 1.5708) * 0.7; my = Math.sin(toO + ai.orbit * 1.5708) * 0.7; }
    } else {
      if (d > wantRange + 12) { var sv3 = steer(f, o.x, o.y); mx = sv3[0]; my = sv3[1]; if (d > (o.def.ranged ? 190 : 320) && f.dodges >= 2 && f.sta > (o.def.ranged ? 45 : 70) && f.st === 'idle' && ai.cool <= 0 && Math.random() < (o.def.ranged ? 0.12 : 0.05) && losClear(f, o) && (o.def.ranged || o.st !== 'wind')) { f.inp.mx = sv3[0]; f.inp.my = sv3[1]; press(f, 'dodge'); ai.cool = 0.4; } }
      else if (d < wantRange - 40) { mx = -Math.cos(toO) * 0.6; my = -Math.sin(toO) * 0.6; }
      else { mx = Math.cos(toO + ai.orbit * 1.5708) * 0.55; my = Math.sin(toO + ai.orbit * 1.5708) * 0.55; }
    }
    if (f.st === 'rec') { mx *= 0.3; my *= 0.3; }
  }
  if (ai.stuckT > 0.7 && (mx || my) && f.st === 'idle') { if (!(G.time < ai.unstickUntil)) { ai.unstickA = Math.atan2(my, mx) + (Math.random() < 0.5 ? 1 : -1) * (1.3 + Math.random()); ai.unstickUntil = G.time + 0.7; ai.stuckT = 0; } }
  if (G.time < ai.unstickUntil) { mx = Math.cos(ai.unstickA); my = Math.sin(ai.unstickA); }
  inp.mx = mx; inp.my = my;
  // --- offence ---
  if (f.st === 'rec' && f.key === 'light' && ai.comboLeft > 0 && f.t >= f.recDur * 0.5) { press(f, 'light'); ai.comboLeft--; }
  if (f.brokenT > 0 && f.st === 'idle') { inp.mx = -Math.cos(toO) * 0.8; inp.my = -Math.sin(toO) * 0.8; }
  if (f.st === 'idle' && ai.cool <= 0 && !flee && f.exh <= 0 && G.time >= ai.guardUntil && f.brokenT <= 0) {
    var np = A.np, r2 = Math.random();
    var canNP = f.mom >= 100 && d >= (np.aiMin || 0) && d <= (np.aiMax || 400) && (np.kind === 'wall' || o.st !== 'dodge') && (losClear(f, o) || np.kind === 'wall');
    var foeOpen = o.st === 'rec' || o.st === 'stag' || o.st === 'wind';
    if (f.hid && d <= wantRange + 60 && Math.random() < 0.5) { press(f, 'light'); ai.comboLeft = Math.floor(Math.random() * f.def.combo); ai.cool = 0.5; return; }
    if (canNP && (foeOpen || r2 < 0.5 || np.kind === 'rain')) { press(f, 'np'); ai.cool = 1.0; return; }
    var sr = A.skill.aiRange;
    if (sr && f.cd <= 0 && d >= sr[0] && d <= sr[1] && losClear(f, o) && Math.random() < 0.04) { press(f, 'skill'); ai.cool = 0.6; return; }
    if (f.def.ranged) {
      if (f.def.field && !f.field && f.stillT <= 0 && d > 260 && d < 560 && o.st !== 'wind' && Math.random() < 0.05) ai.plantT = 1.3;
      if (d < 230 && f.cd <= 0 && Math.random() < 0.6) { press(f, 'skill'); ai.cool = 0.5; return; }
      if (d > 200 && d < 640 && losClear(f, o)) {
        if (r2 < 0.2 * cfg.agg + 0.12 && A.heavy) { press(f, 'heavy'); inp.heavy = true; var g1 = 0.55 + Math.random() * 0.35; ai.relAt = G.time + g1; f.pendGoal = g1; }
        else { press(f, 'light'); ai.comboLeft = Math.floor(Math.random() * (f.def.combo || 2)); }
        ai.cool = (0.5 + Math.random() * 0.8) * (1.5 - cfg.agg);
      }
      return;
    }
    if (d <= wantRange + 40) {
      var gTurtle = 0.1 * (1.2 - cfg.agg);
      if (o.guarding && r2 < 0.45) { press(f, 'heavy'); inp.heavy = true; var g2 = 0.5 + Math.random() * 0.4; ai.relAt = G.time + g2; f.pendGoal = g2; }
      else if (f.def.id === 'caerwyn' && f.cd <= 0 && f.veilT <= 0 && r2 < 0.2) { press(f, 'skill'); }
      else if (f.cd <= 0 && r2 < 0.2 && (f.def.id === 'leonidas' ? o.guarding : (f.def.id !== 'caerwyn')) && !(f.def.arms && f.armT > 0)) { press(f, 'skill'); }
      else if (r2 < 0.55 + 0.1) { press(f, 'light'); ai.comboLeft = Math.floor(Math.random() * f.def.combo); }
      else if (r2 < 0.8) { press(f, 'heavy'); inp.heavy = true; var g3 = 0.5 + Math.random() * 0.45; ai.relAt = G.time + g3; f.pendGoal = g3; }
      else { ai.guardUntil = G.time + 0.6; }
      ai.cool = (0.45 + Math.random() * 0.9) * (1.5 - cfg.agg);
    } else if (f.def.id === 'caerwyn' && f.cd <= 0 && f.veilT <= 0 && d < 420 && Math.random() < 0.02) { press(f, 'skill'); ai.cool = 0.5; }
    else if (f.def.arms && f.cd <= 0 && f.armT <= 0 && d < 460 && Math.random() < 0.04) { press(f, 'skill'); ai.cool = 0.5; }
  }
}
/* attach heavy goals */
var _startAct = startAct;
startAct = function (f, key) {
  var ok = _startAct(f, key);
  if (ok && key === 'heavy' && f.pendGoal) { f.goal = Math.max(f.A.heavy.wind, f.pendGoal); f.windTotal = f.goal; f.pendGoal = 0; }
  return ok;
};
function zoneGap(a, b) { return MAP.cityW && !sameZone(a, b) ? 2500 : 0; }
function nearestEnemyTo(f, pt, maxD) { var b = null, bd = maxD || 1e9; enemiesOf(f).forEach(function (e) { if (!knows(f, e)) return; var d = dist(e, pt) + zoneGap(e, pt.def ? pt : f); if (d < bd) { bd = d; b = e; } }); return b; }
function moveTo(f, x, y, k) {
  var sv = steer(f, x, y), now = G.time;
  if (f._mvT === undefined || now - f._mvT > 0.5) { var moved = f._mvX === undefined ? 99 : Math.hypot(f.x - f._mvX, f.y - f._mvY); f._mvX = f.x; f._mvY = f.y; f._mvT = now; if (moved < 12 && Math.hypot(x - f.x, y - f.y) > 60 && f.st === 'idle' && !(f.rootT > 0)) { f._usA = Math.atan2(sv[1], sv[0]) + (Math.random() < 0.5 ? 1 : -1) * (1.2 + Math.random()); f._usT = now + 0.8; } }
  if (f._usT > now) sv = [Math.cos(f._usA), Math.sin(f._usA)];
  f.inp.mx = sv[0] * (k || 1); f.inp.my = sv[1] * (k || 1);
}
function noOffense(f) { if (f.buf.name && f.buf.name !== 'dodge' && f.buf.name !== 'spirit') f.buf.name = null; f.inp.heavy = false; }
function aiWar(ai, dt) {
  var f = ai.f; if (f.st === 'dead' || G.over) return;
  if (f.def.isMaster) return aiMaster(ai, dt);
  var m = f.partner && f.partner.st !== 'dead' ? f.partner : null, st = f.stance || 'charge';
  var near = nearestEnemyTo(f, f, 1e9), nd = near ? dist(f, near) + zoneGap(f, near) : 1e9;
  if (f.hp < f.def.hp * 0.25 && f.def.id !== 'heracles' && f.orphanT <= 0 && near && near.hp > f.hp * 1.2 && !(f.sealOrder > 0) && !f.isPlayerMate) st = 'retreat';
  if (f.hp < f.def.hp * 0.5 && nd > 900 && f.orphanT <= 0 && !(f.sealOrder > 0)) f.recover = true;
  if (f.recover && (f.hp > f.def.hp * 0.85 || (near && nd < 300))) f.recover = false;
  if (f.recover && st === 'charge' && !f.isPlayerMate) st = 'spirit';
  if (f.sealOrder > 0 && st !== 'charge') st = 'charge';
  if (m && m.fleeing && !f.isPlayerMate && !(f.sealOrder > 0) && st === 'charge') st = 'protect';
  if (f.rampT > G.time && !G.ai[f.idx] === false) { var rt = rampTarget(f); if (f.spirit === 2) press(f, 'spirit'); if (rt) { f.lock = rt; f.foe = rt; if (dist(f, rt) > 380) { moveTo(f, rt.x, rt.y, 1); return; } aiTick(ai, dt); return; } }
  if (shadowNear(f, 480) && !f.isPlayerMate) { var sa = Math.atan2(f.y - G.event.y, f.x - G.event.x); moveTo(f, f.x + Math.cos(sa) * 400, f.y + Math.sin(sa) * 400, 1); noOffense(f); return; }
  var ED = G.event; if (ED && ED.kind === 'demo' && !f.isPlayerMate) {
    if (ED.target === f.team && ED.agg.st !== 'dead' && f.hp > f.def.hp * 0.3) { f.lock = ED.agg; f.foe = ED.agg; if (f.spirit === 2) press(f, 'spirit'); if (dist(f, ED.agg) > 300) { moveTo(f, ED.agg.x, ED.agg.y, 1); return; } aiTick(ai, dt); return; }
    if (ED.team === f.team && m && m === ED.agg && st === 'charge') st = 'protect';
  }
  var EH = G.event; if (EH && EH.kind === 'horror' && !EH.boss.dead && f.team !== EH.culprit && !f.isPlayerMate && f.hp > f.def.hp * 0.45 && Math.hypot(f.x - EH.boss.x, f.y - EH.boss.y) < 3200 && !(near && nd < 300 && !inTruce(f, near))) { if (f.spirit === 2) press(f, 'spirit'); var bx = clamp(EH.boss.x, 5720, 6280), by = EH.boss.y < 3300 ? 2440 : 5560; if (Math.hypot(f.x - bx, f.y - by) > 60) moveTo(f, bx, by, 1); else { f.inp.mx = 0; f.inp.my = 0; } if (f.st === 'idle' && Math.hypot(f.x - EH.boss.x, f.y - EH.boss.y) - EH.boss.r < (f.A.light.reach || 80) + 20) press(f, 'light'); return; }
  var gps = grailPull(f); if (gps && !f.isPlayerMate && Math.hypot(f.x - gps.x, f.y - gps.y) > gps.r - 200 && !(near && nd < 300)) { if (f.spirit === 2) press(f, 'spirit'); moveTo(f, gps.x, gps.y, 1); return; }
  // Church Executors hunting this team: servants cut them down, a master alone runs to the servant
  var exn = G.mobs && G.mobs.length ? execNear(f, 380) : null;
  if (exn && f.spirit !== 2 && !(near && nd < 200)) {
    var sv = f.def.isMaster ? f.partner : null;
    if (sv && sv.st !== 'dead' && dist(f, sv) > 160 && f.hp < f.def.hp * 0.8) { moveTo(f, sv.x, sv.y, 1); noOffense(f); return; }
    var ed = Math.hypot(exn.x - f.x, exn.y - f.y);
    if (ed - 15 > (f.A.light.reach || 80) * 0.85) moveTo(f, exn.x, exn.y, 1); else { f.inp.mx = 0; f.inp.my = 0; f.face = Math.atan2(exn.y - f.y, exn.x - f.x); if (f.st === 'idle') press(f, 'light'); }
    return;
  }
  if (G.mobs && G.mobs.length && f.spirit === 0 && f.st === 'idle' && G.mobs.some(function (m) { return Math.hypot(m.x - f.x, m.y - f.y) - (m.r || 16) < (f.A.light.reach || 80) + 20; })) { press(f, 'light'); }
  if (clockOn() && !finalNight() && !f.isPlayerMate && !f.bold && !(f.sealOrder > 0) && f.hp < f.def.hp * (G.clock.n <= 1 ? CAUTION[0] : CAUTION[1]) && f.def.id !== 'heracles' && f.orphanT <= 0) { st = 'retreat'; f.recover = true; }
  if (isDay() && !f.isPlayerMate && !f.bold && !(f.sealOrder > 0) && !(near && nd < 380 && f.hp > f.def.hp * 0.4)) st = 'spirit';
  // an enemy servant closing on our master: drop everything and go to them (unless this servant is the one at death's door)
  if (clockOn() && m && m.st !== 'dead' && !f.isPlayerMate && st !== 'retreat' && !(f.sealOrder > 0)) {
    var mhT = null, mhD = 650; G.f.forEach(function (e) { if (e.team === f.team || e.def.isMaster || e.st === 'dead' || e.spirit === 2 || pactTeams(e.team, f.team)) return; var d = dist(e, m); if (d < mhD) { mhD = d; mhT = e; } });
    if (mhT) { if (f.spirit === 2 && dist(f, m) < 500) press(f, 'spirit'); if (dist(f, mhT) > 260) { moveTo(f, mhT.x, mhT.y, 1); if (f.spirit === 0 && dist(f, mhT) < 420) { f.lock = mhT; f.foe = mhT; aiTick(ai, dt); } return; } f.lock = mhT; f.foe = mhT; }
  }
  if (G.mode === 'war' && f.orphanT > 0) { var oc = contractCandidate(f); if (oc && (!near || nd > 220)) { if (f.spirit === 2 && dist(f, oc) < 400) press(f, 'spirit'); moveTo(f, oc.x, oc.y, 1); noOffense(f); autoContract(f, oc); return; } }
  if (st === 'spirit' || st === 'retreat') {
    if (f.def.cls === 'Assassin') { if (!f.cnc && f.st === 'idle' && nd > 160 && G.time >= (f.cncCd || 0)) press(f, 'spirit'); }
    else if (f.spirit === 0 && f.st === 'idle' && nd > 160) press(f, 'spirit');
    var hh = f.home || MAP.spawns.at(f.team), home = m || { x: hh[0], y: hh[1] };
    if (st === 'retreat' && near && nd < 400) { var aw = angTo(near, f); moveTo(f, f.x + Math.cos(aw) * 300, f.y + Math.sin(aw) * 300); }
    else if (dist(f, home) > 110) moveTo(f, home.x, home.y, 0.9); else { f.inp.mx = 0; f.inp.my = 0; }
    if (f.spirit === 0 && near && nd < 160) aiTick(ai, dt);
    noOffense(f); return;
  }
  if (f.def.cls === 'Assassin' && !f.cnc && f.st === 'idle' && nd > 320 && G.time >= (f.cncCd || 0) && !f.isPlayerMate) press(f, 'spirit');
  if (f.spirit === 2 && ((near && nd < 420) || (st === 'charge' && f.hp > f.def.hp * 0.7))) press(f, 'spirit');
  if (f.spirit) { if (m) moveTo(f, m.x, m.y, 0.8); noOffense(f); return; }
  if (st === 'protect' && m) {
    var thr = nearestEnemyTo(f, m, 420);
    if (!thr) { f.lock = null; if (dist(f, m) > 150) moveTo(f, m.x, m.y); else { aiTick(ai, dt); noOffense(f); f.inp.mx *= 0.3; f.inp.my *= 0.3; } return; }
    f.lock = thr; aiTick(ai, dt); return;
  }
  if (st === 'hold') {
    if (!f.anchor) f.anchor = { x: f.x, y: f.y };
    var th2 = nearestEnemyTo(f, f.anchor, 340);
    if (!th2) { f.lock = null; if (dist(f, f.anchor) > 60) moveTo(f, f.anchor.x, f.anchor.y); else { f.inp.mx = 0; f.inp.my = 0; } noOffense(f); return; }
    f.lock = th2; aiTick(ai, dt); return;
  }
  if (st === 'passive') { aiTick(ai, dt); noOffense(f); if (m && dist(f, m) > 200) moveTo(f, m.x, m.y); return; }
  f.lock = null;
  // before the final night, a servant that breaks off is let go: no chasing the wounded across the city
  if (near && near.recover && !near.def.isMaster && nd > 260 && clockOn() && !finalNight() && !f.isPlayerMate) { near = null; nd = 1e9; }
  if (!near || nd > 1400) {
    var tgt = near || f.foe; if (m && dist(f, m) > 500) { moveTo(f, m.x, m.y); return; }
    if (G.time < 100 && !f.inM && MAP.haven && !G.quick) { var hs = f.home || MAP.spawns.at(f.team); if (!f.patrol || dist(f, f.patrol) < 90 || G.time > f.patrolT) { var pa = rnd() * 6.283, pr = 250 + rnd() * 650; f.patrol = { x: clamp(hs[0] + Math.cos(pa) * pr, 100, W - 100), y: clamp(hs[1] + Math.sin(pa) * pr, 100, H - 100) }; f.patrolT = G.time + 9; } moveTo(f, f.patrol.x, f.patrol.y, 0.6); return; }
    if (clockOn() && !finalNight() && !near) { var hp2 = huntPoint(f); moveTo(f, hp2.x, hp2.y, 0.85); return; }
    if (tgt) { moveTo(f, tgt.x, tgt.y, 0.85); return; } }
  aiTick(ai, dt);
}
function aiMaster(ai, dt) {
  var f = ai.f, s = f.partner && f.partner.st !== 'dead' ? f.partner : null, inp = f.inp, cfg = ai.cfg, A = f.A;
  ai.cool -= dt; inp.guard = false; if (inp.heavy && G.time >= ai.relAt) inp.heavy = false;
  var thr = null, td = 1e9; enemiesOf(f).forEach(function (e) { if (e.def.isMaster) return; var d = dist(f, e); if (d < td) { td = d; thr = e; } });
  var silenced = f.silenceT > 0, sk = A.skill.kind, np = A.np;
  // keep enough mana for the servant's Noble Phantasm once it is close to ready
  var reserve = (s && s.mom > 55 && !s.sealFree) ? npManaCost(s) : 0, sigOk = canPay(f, MANA.sigCost + reserve), skOk = canPay(f, MANA.skillCost + reserve) || (sk === 'heal' && s && s.hp < s.def.hp * 0.4 && canPay(f, MANA.skillCost));
  // Command Seals
  if (s && sealsLeft(f) > 0) {
    // every seal is also a life before the Grail descends: an AI master keeps the last ones for rescues
    var spare = sealsLeft(f) - (rescueOn() ? (G.clock.n <= 1 ? 2 : 1) : 0);
    if (spare > 0 && s.hp < s.def.hp * 0.3 && s.foe && dist(s, s.foe) < 500 && !(f.sealUsed.heal >= 2)) useSeal(f, 'heal');
    else if (spare > 0 && thr && td < 420 && dist(f, s) > 600) useSeal(f, 'warp');
    // a seal-forced NP when it can end the fight (and, at the Grail, freely)
    else if ((spare > 1 || (!rescueOn() && sealsLeft(f) > 0)) && !s.sealFree && s.foe && !s.foe.def.isMaster && dist(s, s.foe) < 420 && s.mom < 50 && s.hp > s.def.hp * 0.4 && s.foe.hp < s.foe.def.hp * 0.6 && Math.random() < (rescueOn() ? 0.0004 : 0.002)) useSeal(f, 'np');
  }
  if (!s) { var oc = contractCandidate(f); if (oc) { moveTo(f, oc.x, oc.y, 1); autoContract(f, oc); if (!f.toldSeek) { f.toldSeek = true; FX.text(f, 'SEEKING A NEW SERVANT'); } return; }
    var haven = MAP.haven ? MAP.haven : { x: f.home ? f.home[0] : f.x, y: f.home ? f.home[1] : f.y };
    moveTo(f, haven.x, haven.y, 1); if (!f.toldChurch && MAP.haven) { f.toldChurch = true; FX.text(f, 'FLEEING TO THE CHURCH'); } if (dist(f, haven) < 120) { inp.mx = 0; inp.my = 0; } return; }
  // before the final night a wounded master breaks off and runs home; the servant covers the retreat
  // ...and an unguarded master keeps away from enemy servants, running to their own servant if it is near
  var guarded = s && dist(f, s) < 260, hunted = thr && td < 440 && !guarded;
  if (clockOn() && !finalNight() && !f.isPlayerMate) { if (f.hp < f.def.hp * 0.75 || hunted) f.fleeing = true; else if (f.hp > f.def.hp * 0.9 && !(thr && td < 600)) f.fleeing = false; } else f.fleeing = false;
  if (f.fleeing && hunted && s && dist(f, s) < 1400 && dist(s, thr) > td) { var sa2 = angTo(thr, f); moveTo(f, s.x + Math.cos(sa2) * 60, s.y + Math.sin(sa2) * 60, 1); return; }
  if (f.fleeing && f.home) { var hx = f.home[0], hy = f.home[1]; if (thr && td < 300) { var fa = angTo(thr, f); hx = f.x + Math.cos(fa) * 200 + (hx - f.x) * 0.15; hy = f.y + Math.sin(fa) * 200 + (hy - f.y) * 0.15; } if (Math.hypot(f.x - f.home[0], f.y - f.home[1]) > 140 || (thr && td < 300)) moveTo(f, hx, hy, 1); else { inp.mx = 0; inp.my = 0; } return; }
  if (shadowNear(f, 520) && !f.isPlayerMate) { var sm = Math.atan2(f.y - G.event.y, f.x - G.event.x); moveTo(f, f.x + Math.cos(sm) * 400, f.y + Math.sin(sm) * 400, 1); return; }
  var EM = G.event;
  if (EM && EM.kind === 'demo' && !f.isPlayerMate) {
    var tc = null, tcd = 1e9;
    if (EM.agg === f) EM.charges.forEach(function (c) { var d = Math.hypot(f.x - c.x, f.y - c.y); if (!c.planted && d < tcd) { tcd = d; tc = c; } });
    else if (EM.target === f.team) EM.charges.forEach(function (c) { var d = Math.hypot(f.x - c.x, f.y - c.y); if (c.planted && d < tcd) { tcd = d; tc = c; } });
    if (tc && !(thr && td < 200)) { if (tcd > 30) moveTo(f, tc.x, tc.y, 1); else { inp.mx = 0; inp.my = 0; } return; }
  }
  var gpm = grailPull(f); if (gpm && Math.hypot(f.x - gpm.x, f.y - gpm.y) > gpm.r - 200 && !(thr && td < 300)) { moveTo(f, gpm.x, gpm.y, 1); return; }
  // by day a master works on the day's tasks, or goes home to rest, unless an enemy servant is right there
  if (isDay() && !f.isPlayerMate && !(thr && td < 380) && f.home) {
    if (!(f.dayGoalT > G.time)) { f.dayGoal = aiDayGoal(f); f.dayGoalT = G.time + 6; }
    if (G.event && G.event.kind === 'school' && !(f.dayGoalT > G.time + 4)) f.dayGoalT = Math.min(f.dayGoalT, G.time + 1);
    var dg = f.dayGoal && !(f.dayGoal.done && f.dayGoal.done[f.team]) && f.dayGoal.up !== false ? daySpot(f.dayGoal, f) : { x: f.home[0], y: f.home[1], r: 280 };
    if (G.mobs && G.mobs.some(function (m) { return Math.hypot(m.x - f.x, m.y - f.y) - (m.r || 16) < (A.light.reach || 70) + 20; }) && f.st === 'idle' && ai.cool <= 0) { press(f, 'light'); ai.cool = 0.5; }
    if (Math.hypot(f.x - dg.x, f.y - dg.y) > dg.r * 0.45) moveTo(f, dg.x, dg.y, 1); else { inp.mx = 0; inp.my = 0; } return; }
  // skills
  if (!silenced && skOk && f.cd <= 0 && f.st === 'idle') {
    var want = (sk === 'heal' && !A.skill.self && s.hp < s.def.hp * 0.6 && dist(f, s) < A.skill.range) || (sk === 'heal' && A.skill.self && f.hp < f.def.hp * 0.6) || ((sk === 'haste' || sk === 'shield' || sk === 'reinforce') && thr && td < 320) || (sk === 'buff' && s.foe && dist(s, s.foe) < 400) || (sk === 'drain' && s.mom < 80 && f.hp > f.def.hp * 0.75 && s.foe && dist(s, s.foe) < 600);
    if (want) { press(f, 'skill'); return; }
  }
  // Shirou stands in a servant's fight: he joins his servant against a servant it is already fighting, while he is healthy
  if (f.def.fightsServants && (!G.clock || (f.traceTier || 0) >= 1) && thr && dist(s, thr) < 240 && td < 460 && f.hp > f.def.hp * 0.65 && s.hp > s.def.hp * 0.35) { f.lock = thr; f.foe = thr; aiTick(ai, dt); return; }
  if (thr && td < 330) {
    var aw = angTo(thr, f), gx = f.x + Math.cos(aw) * 260, gy = f.y + Math.sin(aw) * 260;
    if (dist(s, thr) > 120) { gx = (gx + s.x) / 2; gy = (gy + s.y) / 2; }
    if (!silenced && sigOk && f.sigCd <= 0 && np.aiUse === 'near' && td < (np.r || np.reach + np.lunge * 0.6) + FR && f.st === 'idle') { press(f, 'np'); return; }
    moveTo(f, gx, gy);
    if (thr.st === 'wind' && thr.foe === f && td < 220 && f.dodges > 0 && Math.random() < 0.08 + 0.2 * cfg.skill) aiPressDodge(ai);
    return;
  }
  // close-quarters masters (Shirou, Kirei) duel enemy masters when no enemy servant is guarding them
  if (A.light.kind === 'melee') {
    var em = null, ed = 1e9; enemiesOf(f).forEach(function (e) { if (e.def.isMaster) { var d4 = dist(f, e); if (d4 < ed) { ed = d4; em = e; } } });
    if (em && ed < (clockOn() && !finalNight() ? 300 : 650) && f.hp > f.def.hp * 0.35) { var guarded = em.partner && em.partner.st !== 'dead' && dist(em.partner, em) < 260 && !(dist(s, em) < 300); if (!guarded) { f.lock = em; f.foe = em; aiTick(ai, dt); return; } }
  }
  var sf = s.foe, bx = s.x, by = s.y;
  if (sf) { var ba = angTo(sf, s); bx = s.x + Math.cos(ba) * 150; by = s.y + Math.sin(ba) * 150; }
  if (dist(f, { x: bx, y: by }) > 70) moveTo(f, bx, by, 0.9); else { inp.mx = 0; inp.my = 0; }
  var tg = sf || f.foe;
  if (np.aiUse === 'origin') { var em = null, ed = 1e9; enemiesOf(f).forEach(function (e) { if (e.def.isMaster) { var d3 = dist(f, e); if (d3 < ed) { ed = d3; em = e; } } }); if (em && ed < 850 && losClear(f, em)) tg = em; }
  if (!silenced && sigOk && f.sigCd <= 0 && f.st === 'idle' && tg) {
    var dT = dist(f, tg);
    if ((np.aiUse === 'ranged' || np.aiUse === 'origin') && dT < (np.range || 600) * 0.85 && losClear(f, tg)) { f.lock = tg; press(f, 'np'); return; }
    if (np.aiUse === 'ally' && sf && dist(s, sf) < 420) { press(f, 'np'); return; }
    if (np.aiUse === 'ubw' && sf && !sf.def.isMaster && dist(f, sf) < 560 && dist(s, sf) < 500) { press(f, 'np'); return; }
  }
  if (tg && f.st === 'idle' && ai.cool <= 0) { var d2 = dist(f, tg); if (d2 < 560 && losClear(f, tg)) { f.lock = tg; if (Math.random() < 0.25 && d2 < 420 && (!f.def.mag || f.ammo >= 20)) { press(f, 'heavy'); inp.heavy = true; ai.relAt = G.time + 0.55; } else press(f, 'light'); ai.cool = (0.7 + Math.random() * 0.9) * (1.6 - cfg.agg); } else f.lock = null; }
}
