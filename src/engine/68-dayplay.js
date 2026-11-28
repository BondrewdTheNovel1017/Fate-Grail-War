/* ---- daytime activities: things to do, not circles to stand in ----
   Fortify: carry three ward stones from the streets to ward points around your home (a blow or a stagger drops one).
   Ley line: a wisp walks the streets while someone of your team walks with it; leave it and it drifts back.
   Battle site: three clues lie hidden around the site; get close to see a glint, stand over it to read it.
   Scouts: AI masters send a familiar to watch a rival home by day; shoot it down to learn whose it was, or its
   master knows where you are when night falls. The AI walks the same steps (daySpot). */
var DAYP = { carryR: 55, wardR: 75, wispSpd: 125, wispNear: 230, wispBack: 30, clueR: 55, clueT: 1.6, clueSee: 300, scoutHp: 24, scoutSpd: 230, scoutFlee: 240, hopMin: 260, hopMax: 420, hopTired: 3, scoutChance: 0.6, intelT: 75 };
var LEYP = {}; // ley paths (host side only): task name -> { pts, len }
function dayNodes(cx, cy, d0, d1, n, sep) {
  var ns = civNodes().filter(function (q) { var d = Math.hypot(q.x - cx, q.y - cy); return d > d0 && d < d1; }), out = [];
  for (var tries = 0; tries < 200 && out.length < n && ns.length; tries++) { var q = ns[Math.floor(rnd() * ns.length)]; if (out.every(function (o) { return Math.hypot(o.x - q.x, o.y - q.y) > sep; })) out.push({ x: q.x, y: q.y }); }
  return out;
}
function openSpot(cx, cy, d0, d1) {
  for (var i = 0; i < 40; i++) { var a = rnd() * 6.283, d = d0 + rnd() * (d1 - d0), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; if (x < 40 || x > MAP.cityW - 40 || y < 40 || y > H - 40) continue; if (!rectsIn(x - 30, y - 30, x + 30, y + 30).some(function (r) { return inRect(r, x, y, 30); })) return { x: Math.round(x), y: Math.round(y) }; }
  return { x: Math.round(cx), y: Math.round(cy) };
}
// called by startDay: give each task its steps
function dayActivities() {
  G.tasks.forEach(function (k) {
    if (k.kind === 'fortify') {
      // the stones wait inside the workshop, around the summoning circle; the ward points ring the house outside
      var F = G.fields[k.team], wards = dayNodes(F.x, F.y, 200, 800, 3, 260), circ = (G.circles || []).filter(function (q) { return q.team === k.team; })[0];
      // homes off the road network (the Einzbern castle in its forest): ward points on open ground around the field instead
      for (var wt = 0; wards.length < 3 && wt < 40; wt++) { var op = openSpot(F.x, F.y, 320, 760); if (Math.hypot(op.x - F.x, op.y - F.y) > 200 && wards.every(function (o) { return Math.hypot(o.x - op.x, o.y - op.y) > 260; })) wards.push(op); }
      if (wards.length < 3 || !circ) return; // nowhere sensible: it stays a circle
      var stones = [0, 1, 2].map(function (i) { var a = -1.2 + i * 1.2; return { x: Math.round(circ.x + Math.cos(a) * 130), y: Math.round(circ.y + 90 + Math.sin(a) * 50) }; });
      k.act = 'stones'; k.stones = stones.map(function (p, i) { return { x: p.x, y: p.y, c: -1, ok: 0, tx: wards[i].x, ty: wards[i].y }; });
    } else if (k.kind === 'ley') {
      var ends = dayNodes(k.x, k.y, 1300, 2200, 1, 0), e = ends[0]; if (!e) return;
      var p = navPath(k.x, k.y, e.x, e.y); if (!p || p.length < 2) return;
      p = p.filter(function (q) { return q.x < MAP.cityW; }); var len = 0; for (var i = 1; i < p.length; i++) len += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
      if (len < 600) return;
      LEYP[k.name] = { pts: p.map(function (q) { return { x: q.x, y: q.y }; }), len: len };
      k.act = 'wisp'; k.w = {}; k.wp = {}; k.len = Math.round(len); k.ex = Math.round(e.x); k.ey = Math.round(e.y);
    } else if (k.kind === 'school') {
      // lessons are attended in a classroom
      var R = (MAP.rooms || []).filter(function (r) { return r.id === 'school'; })[0]; if (R) { k.x = R.x0 + 924; k.y = R.y0 + 430; k.r = Math.min(k.r, 200); }
    } else if (k.kind === 'trace') {
      k.act = 'clues'; k.clues = [openSpot(k.x, k.y, 120, 380), openSpot(k.x, k.y, 120, 380), openSpot(k.x, k.y, 120, 380)]; k.found = {}; k.exT = {};
    }
  });
}
function leyAt(k, d) {
  var L = LEYP[k.name]; if (!L) return { x: k.x, y: k.y }; var p = L.pts, acc = 0;
  for (var i = 1; i < p.length; i++) { var s = Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y); if (acc + s >= d) { var u = (d - acc) / s; return { x: p[i - 1].x + (p[i].x - p[i - 1].x) * u, y: p[i - 1].y + (p[i].y - p[i - 1].y) * u }; } acc += s; }
  return { x: p[p.length - 1].x, y: p[p.length - 1].y };
}
function teamNear(t, x, y, r, needBody) { return G.f.some(function (f) { return f.team === t && f.st !== 'dead' && !f.inM && f.x < MAP.cityW && (!needBody || f.spirit !== 2) && Math.hypot(f.x - x, f.y - y) < r; }); }
function foesNear(t, x, y, r) { return G.f.some(function (e) { return e.team !== t && !pactTeams(e.team, t) && e.st !== 'dead' && e.spirit !== 2 && !concealed(e) && Math.hypot(e.x - x, e.y - y) < r; }); }
// one step of an active task; returns true when it handled the task (tasksTick then skips the circle)
function dayActiveTick(k, dt) {
  if (!k.act) return false;
  if (k.act === 'stones') {
    var t = k.team; if (k.done[t]) return true;
    k.stones.forEach(function (s) {
      if (s.ok) return;
      if (s.c >= 0) {
        var f = G.f[s.c];
        if (!f || f.st === 'dead' || f.st === 'stag' || f.spirit === 2 || f.resc) { s.c = -1; return; }
        s.x = Math.round(f.x - Math.cos(f.face) * 18); s.y = Math.round(f.y - Math.sin(f.face) * 18);
        if (Math.hypot(s.x - s.tx, s.y - s.ty) < DAYP.wardR) { s.ok = 1; s.c = -1; s.x = s.tx; s.y = s.ty; FX.task(t, k, 'A ward stone is set: ' + k.stones.filter(function (q) { return q.ok; }).length + ' of 3', true); }
        return;
      }
      G.f.forEach(function (f) { if (s.c >= 0 || f.team !== t || f.st === 'dead' || f.spirit === 2 || f.resc || Math.hypot(f.x - s.x, f.y - s.y) > DAYP.carryR) return; if (k.stones.some(function (q) { return q.c === f.idx; })) return; s.c = f.idx; });
    });
    var n = k.stones.filter(function (q) { return q.ok; }).length; k.prog[t] = k.need * n / 3;
    if (n === 3) { k.done[t] = true; finishTask(t, k); }
    return true;
  }
  if (k.act === 'wisp') {
    for (var tt in G.fields) {
      tt = +tt; if (!taskFor(tt, k)) continue;
      var d = k.w[tt] || 0, p = leyAt(k, d), near = teamNear(tt, p.x, p.y, DAYP.wispNear);
      if (near && !foesNear(tt, p.x, p.y, DAYTASK.contest)) d = Math.min(k.len, d + DAYP.wispSpd * dt);
      else if (!near && d > 0) d = Math.max(0, d - DAYP.wispBack * dt);
      k.w[tt] = d; if (d > 0) { var q = leyAt(k, d); k.wp[tt] = [Math.round(q.x), Math.round(q.y)]; } else delete k.wp[tt];
      k.prog[tt] = k.need * d / k.len;
      if (d >= k.len) { k.done[tt] = true; finishTask(tt, k); }
    }
    return true;
  }
  if (k.act === 'clues') {
    for (var t2 in G.fields) {
      t2 = +t2; if (!taskFor(t2, k)) continue;
      var fd = k.found[t2] || (k.found[t2] = [0, 0, 0]), ex = k.exT[t2] || (k.exT[t2] = [0, 0, 0]);
      k.clues.forEach(function (c, i) {
        if (fd[i]) return;
        if (teamNear(t2, c.x, c.y, DAYP.clueR, true) && !foesNear(t2, c.x, c.y, DAYTASK.contest)) { ex[i] += dt; if (ex[i] >= DAYP.clueT) { fd[i] = 1; FX.task(t2, k, 'A clue: ' + fd.filter(Boolean).length + ' of 3', true); } }
        else ex[i] = Math.max(0, ex[i] - dt * 0.5);
      });
      var m = fd.filter(Boolean).length; k.prog[t2] = k.need * m / 3;
      if (m === 3) { k.done[t2] = true; finishTask(t2, k); }
    }
    return true;
  }
  return false;
}
// where the AI should walk for a task right now
function daySpot(k, f) {
  if (!k || !k.act) return k;
  if (k.act === 'stones') {
    var mine = k.stones.filter(function (s) { return s.c === f.idx; })[0]; if (mine) return { x: mine.tx, y: mine.ty, r: 60 };
    var free = k.stones.filter(function (s) { return !s.ok && s.c < 0; }).sort(function (a, b) { return Math.hypot(a.x - f.x, a.y - f.y) - Math.hypot(b.x - f.x, b.y - f.y); })[0];
    return free ? { x: free.x, y: free.y, r: 40 } : { x: k.x, y: k.y, r: k.r };
  }
  if (k.act === 'wisp') { var p = leyAt(k, k.w[f.team] || 0); return { x: p.x, y: p.y, r: 120 }; }
  if (k.act === 'clues') { var fd = k.found[f.team] || [0, 0, 0], c = k.clues.filter(function (q, i) { return !fd[i]; }).sort(function (a, b) { return Math.hypot(a.x - f.x, a.y - f.y) - Math.hypot(b.x - f.x, b.y - f.y); })[0]; return c ? { x: c.x, y: c.y, r: 40 } : k; }
  return k;
}
/* ---- scouts: a familiar watching a rival home ---- */
function sendScouts() {
  if (!G.fields || finalNight()) return;
  var hs = humansAlive();
  Object.keys(G.fields).forEach(function (ts) {
    var t = +ts, m = teamMaster(t); if (!m || !G.ai[m.idx] || rnd() > DAYP.scoutChance) return;
    var rivals = Object.keys(G.fields).map(Number).filter(function (o) { return o !== t && !pactTeams(o, t) && teamFighters(o).length && upg(o, 'veil') < 1; });
    if (!rivals.length) return;
    var hum = rivals.filter(function (o) { return hs.some(function (f) { return f.team === o; }); }), pool = hum.length && rnd() < 0.7 ? hum : rivals, tg = pool[Math.floor(rnd() * pool.length)];
    var F = G.fields[tg]; if (!F) return;
    var perch = openSpot(F.x, F.y, fieldR(F) + 120, fieldR(F) + 320), from = execSpawn(tg) || { x: perch.x, y: 40 };
    G.mobs = G.mobs || []; G.mobs.push({ scout: true, keep: true, team: t, tgt: tg, x: from.x, y: from.y, px: perch.x, py: perch.y, r: 12, hp: DAYP.scoutHp, max: DAYP.scoutHp, t: 0, face: 0, fleeT: 0 });
  });
}
function scoutsTick(dt) {
  if (!G.mobs || !G.mobs.length) return;
  G.mobs.forEach(function (m) {
    if (!m.scout || m.dead) return; m.t += dt;
    var thr = null, td = DAYP.scoutFlee; G.f.forEach(function (f) { if (f.team !== m.tgt || f.st === 'dead' || f.spirit === 2) return; var d = Math.hypot(f.x - m.x, f.y - m.y); if (d < td) { td = d; thr = f; } });
    // spooked, it hops to a new perch a little way off; after a few hops it tires and only flutters
    if (thr && !m.hop && (m.stunT || 0) <= 0) { var tired = (m.hops || 0) >= DAYP.hopTired, a0 = Math.atan2(m.y - thr.y, m.x - thr.x) + (rnd() - 0.5) * 1.2, d0 = tired ? 140 : DAYP.hopMin + rnd() * (DAYP.hopMax - DAYP.hopMin); m.hop = { x: clamp(m.x + Math.cos(a0) * d0, 40, MAP.cityW - 40), y: clamp(m.y + Math.sin(a0) * d0, 40, H - 40), sp: tired ? 150 : DAYP.scoutSpd }; m.hops = (m.hops || 0) + 1; }
    if (m.stunT > 0) { m.stunT -= dt; return; }
    var tx = m.hop ? m.hop.x : m.px, ty = m.hop ? m.hop.y : m.py, sp = (m.hop ? m.hop.sp : DAYP.scoutSpd * 0.7) * dt, dx = tx - m.x, dy = ty - m.y, L = Math.hypot(dx, dy);
    if (L > 6) { m.face = Math.atan2(dy, dx); m.x += dx / L * Math.min(L, sp); m.y += dy / L * Math.min(L, sp); } else if (m.hop) { m.px = m.hop.x; m.py = m.hop.y; m.hop = null; }
    m.x = clamp(m.x, 20, MAP.cityW - 20); m.y = clamp(m.y, 20, H - 20);
  });
  G.mobs.forEach(function (m) {
    if (!m.scout || !m.dead || m.counted) return; m.counted = true;
    var by = -1, bv = 0; Object.keys(m.dmgBy || {}).forEach(function (k) { if (m.dmgBy[k] > bv) { bv = m.dmgBy[k]; by = +k; } });
    // whoever downs it learns who sent it, and where that team lives, for the coming night
    if (by >= 0) { G.intel = G.intel || {}; G.intel[by] = { team: m.team, until: G.time + (isDay() ? (G.clock.len - G.clock.t) : 0) + DAYP.intelT }; }
    FX.event('scoutDown', { team: by, owner: m.team, tgt: m.tgt, x: Math.round(m.x), y: Math.round(m.y) });
  });
  G.mobs = G.mobs.filter(function (m) { return !(m.scout && m.dead); });
}
// at dusk the familiars report: their masters know where the watched team is for a while
function scoutsReport() {
  if (!G.mobs) return; G.intel = G.intel || {};
  G.mobs.forEach(function (m) { if (!m.scout || m.dead) return; G.intel[m.team] = { team: m.tgt, until: G.time + DAYP.intelT }; FX.event('scoutReport', { owner: m.team, tgt: m.tgt }); });
  G.mobs = G.mobs.filter(function (m) { return !m.scout; });
}
function intelOn(f, e) { var I = G.intel && G.intel[f.team]; return !!(I && I.team === e.team && I.until > G.time); }
