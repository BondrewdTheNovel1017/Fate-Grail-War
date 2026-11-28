/* ---- drawing ---- */
function wedge(f, rad, half, fill, stroke) {
  ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.arc(f.x, f.y, rad, f.face - half, f.face + half); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
}
function telCol(a) { return a.unblock ? [179, 108, 240] : (a.gb || a.power >= 2) ? [240, 138, 59] : [226, 81, 92]; }
function drawField(f) {
  var c = rgbOf(f.def.col), fl = f.field;
  if (fl) {
    var pulse = 0.5 + 0.5 * Math.sin(G.time * 2.4), ap = Math.min(1, fl.t / 0.5);
    ctx.save(); ctx.beginPath(); ctx.arc(fl.x, fl.y, fl.r * ap, 0, 6.283); ctx.fillStyle = 'rgba(' + c + ',' + (0.07 + 0.03 * pulse) + ')'; ctx.fill();
    ctx.strokeStyle = 'rgba(' + c + ',.75)'; ctx.lineWidth = 3; ctx.setLineDash([18, 10]); ctx.lineDashOffset = -G.time * 14; ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(' + c + ',.32)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(fl.x, fl.y, fl.r * 0.62 * ap, 0, 6.283); ctx.stroke();
    for (var i = 0; i < 6; i++) { var an = G.time * 0.35 + i * 1.0472, r1 = fl.r * 0.62 * ap, r2 = fl.r * ap; ctx.beginPath(); ctx.moveTo(fl.x + Math.cos(an) * r1, fl.y + Math.sin(an) * r1); ctx.lineTo(fl.x + Math.cos(an + 0.5) * r2, fl.y + Math.sin(an + 0.5) * r2); ctx.stroke(); }
    ctx.restore();
  } else if (f.def.field && f.stillT > 0.12 && f.st !== 'dead') {
    var pr = clamp(f.stillT / f.def.field.still, 0, 1);
    ctx.save(); ctx.beginPath(); ctx.arc(f.x, f.y, f.def.field.r * pr, 0, 6.283); ctx.strokeStyle = 'rgba(' + c + ',' + (0.2 + 0.4 * pr) + ')'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.stroke(); ctx.restore();
  }
}
function drawGates(f, p, q, r) {
  var a = f.act; if (!a || !(f.st === 'wind' || f.st === 'act' || f.st === 'rec') || a.kind === 'counter') return;
  var n = a.kind === 'volley' ? a.count : (a.kind === 'proj' ? 1 : 0); if (!n) return;
  var al = f.st === 'wind' ? p : f.st === 'act' ? 1 : 1 - r;
  ctx.save();
  for (var i = 0; i < n; i++) {
    var g0 = gatePos(f, a.kind === 'volley' ? i : f.combo);
    ctx.save(); ctx.translate(g0.x, g0.y); ctx.rotate(f.face); ctx.globalAlpha = clamp(al, 0, 1);
    var sc = 0.4 + 0.6 * clamp(f.st === 'wind' ? p : 1, 0, 1);
    ctx.shadowColor = '#ffd36b'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.ellipse(0, 0, 7 * sc, 17 * sc, 0, 0, 6.283); ctx.fillStyle = 'rgba(255,211,107,.3)'; ctx.fill();
    ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 3; ctx.stroke(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.ellipse(0, 0, 3.4 * sc, 9 * sc, 0, 0, 6.283); ctx.strokeStyle = '#fff0b0'; ctx.lineWidth = 1.5; ctx.stroke();
    if (f.st === 'wind') { ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(2 + 20 * p, 0); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
}
function drawTelegraph(f) {
  var a = f.act; if (!a || f.st !== 'wind' || f.hidAct) return;
  var tot = f.windTotal || f.curWind || 0.3, prog = clamp(f.t / tot, 0, 1), c = telCol(a), rgb = c.join(',');
  var fill = 'rgba(' + rgb + ',' + (0.1 + 0.3 * prog) + ')', st = 'rgba(' + rgb + ',' + (0.35 + 0.5 * prog) + ')';
  if (a.kind === 'melee' || a.kind === 'grab') wedge(f, a.reach + FR, a.arc, fill, st);
  else if (a.kind === 'proj' && a.wave) { var wl = Math.min(a.range, 1100), ww = 2 * (FR + 34); ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.face); ctx.fillStyle = fill; ctx.fillRect(0, -ww / 2, wl, ww); ctx.strokeStyle = st; ctx.strokeRect(0, -ww / 2, wl, ww); ctx.restore(); }
  else if (a.kind === 'volley') { ctx.strokeStyle = st; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); for (var tv = 0; tv < a.count; tv++) { var tan = f.face + (tv - (a.count - 1) / 2) * a.spread; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(tan) * Math.min(a.range, 700), f.y + Math.sin(tan) * Math.min(a.range, 700)); ctx.stroke(); } ctx.setLineDash([]); }
  else if (a.kind === 'proj') { ctx.strokeStyle = st; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(f.face) * Math.min(a.range, 700), f.y + Math.sin(f.face) * Math.min(a.range, 700)); ctx.stroke(); ctx.setLineDash([]); }
  else if (a.kind === 'barrage') wedge(f, Math.min(a.range, 700), a.spread + 0.06, fill, st);
  else if (a.kind === 'aoe' || a.kind === 'pulses') { ctx.beginPath(); ctx.arc(f.x, f.y, a.r || 150, 0, 6.283); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = st; ctx.lineWidth = 2; ctx.stroke(); }
  else if (a.kind === 'charge') { var wd = 2 * (FR + a.reach), L = a.dist; ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.face); ctx.fillStyle = fill; ctx.fillRect(0, -wd / 2, L, wd); ctx.strokeStyle = st; ctx.strokeRect(0, -wd / 2, L, wd); ctx.restore(); }
  else if (a.kind === 'wall') { ctx.beginPath(); ctx.arc(f.x, f.y, 190, 0, 6.283); ctx.strokeStyle = 'rgba(255,211,107,' + (0.2 + 0.5 * prog) + ')'; ctx.lineWidth = 3; ctx.stroke(); }
  if (a.power >= 2 || a.unblock) { ctx.fillStyle = 'rgba(' + rgb + ',0.95)'; ctx.font = '700 22px "Barlow Condensed", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', f.x, f.y - 34); }
  ctx.beginPath(); ctx.arc(f.x, f.y, FR + 6 + 8 * (1 - prog), 0, 6.283 * prog); ctx.strokeStyle = 'rgba(' + rgb + ',0.95)'; ctx.lineWidth = 3; ctx.stroke();
}
function chainLine(x0, y0, x1, y1) {
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = '#0b121a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = '#b4bdc8'; ctx.lineWidth = 2.8; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.restore();
}
function locOf(f, x, y) { var c = Math.cos(f.face), sn = Math.sin(f.face); return { x: f.x + c * x - sn * y, y: f.y + sn * x + c * y }; }
function weaponOK(I) { return I.im.complete && I.im.naturalWidth > 0; }
function putW(f, I, x, y, rot, k, flip) {
  ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.face); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, flip ? -k : k);
  if (weaponOK(I)) ctx.drawImage(I.im, I.x, I.y, I.w, I.h);
  ctx.restore();
}
function drawWeapon(f) {
  var d = f.def, I = IMG[d.id].weapon, g = GRIP[d.id], a = f.act, wp = d.wpn, p = 0, q = 0, r = 0, shown = !!d.hiddenReach && (f.revealT > G.time || (f.key === 'np' && (f.st === 'wind' || f.st === 'act'))), veil = d.hiddenReach ? !shown : false, shine = shown;
  if (f.st === 'wind' && a) p = clamp(f.t / (f.windTotal || f.curWind || 0.3), 0, 1);
  if (f.st === 'act' && a) q = clamp(f.t / Math.max(a.act, 0.05), 0, 1);
  if (f.st === 'rec' && a) r = clamp(f.t / Math.max(f.recDur || 0.3, 0.05), 0, 1);
  if (d.id === 'lancelot') {
    if (f.key === 'np' && (f.st === 'wind' || f.st === 'act' || f.st === 'rec')) { I = IMG.lancelot_gun.weapon; g = GRIP.lancelot_gun; wp = 'gun'; }
    else if (f.armT > 0 && f.arm >= 0) { var am = d.arms[f.arm]; I = (IMG['lancelot_' + am.id + '_dark'] || IMG['lancelot_' + am.id]).weapon; g = GRIP['lancelot_' + am.id]; wp = am.wpn; }
    else wp = 'fist';
  }
  if (d.id === 'kiritsugu' && f.key === 'light' && a && (f.st === 'wind' || f.st === 'act' || f.st === 'rec')) { I = IMG.kiritsugu_knife.weapon; g = GRIP.kiritsugu_knife; wp = 'sword'; }
  if (d.id === 'emiya' && f.key === 'skill' && a && (f.st === 'wind' || f.st === 'act' || (f.st === 'rec' && f.t < f.recDur * 0.6))) { I = IMG.emiya_bow.weapon; g = GRIP.emiya_bow; wp = 'bow'; }
  if (d.id === 'cu' && (G.proj.some(function (pr) { return pr.owner === f && pr.a.key === 'np'; }) || (f.key === 'np' && (f.st === 'act' || f.st === 'rec')))) return;
  var inAtk = (f.st === 'wind' || f.st === 'act' || f.st === 'rec') && a && a.kind !== 'counter';
  var sweeps = a && (a.kind === 'melee' || a.kind === 'aoe' || a.kind === 'grab' || a.kind === 'pulses' || a.kind === 'charge' || a.wave);
  if (wp === 'gate') { drawGates(f, p, q, r); return; }
  if (veil) ctx.globalAlpha = 0.22;
  if (shine) { ctx.shadowColor = '#ffd36b'; ctx.shadowBlur = 22 + 6 * Math.sin(G.time * 12); }
  if (wp === 'sword' || wp === 'club') {
    var rest = 0.2, rot = rest;
    if (f.guarding || f.st === 'counter') rot = -0.9;
    else if (f.st === 'wind' && sweeps) rot = rest + 1.3 * p;
    else if (f.st === 'act' && sweeps) rot = 1.5 - 3.1 * q;
    else if (f.st === 'rec' && sweeps) rot = -1.6 * (1 - r) + rest * r;
    var sw9 = a && a.swings && f.st === 'act';
    if (sw9) { var ph9 = f.t / a.interval, n9 = Math.floor(ph9), q9 = Math.min(1, (ph9 - n9) * 1.7); rot = (n9 % 2 ? -1 : 1) * (1.5 - 3.1 * q9); }
    if (sweeps && !sw9 && a.kind !== 'charge' && (f.st === 'act' || (f.st === 'rec' && r < 0.35))) {
      var tr = (a.reach || 110) * 0.92, aCur = f.st === 'act' ? 1.5 - 3.1 * q : -1.6, tal = f.st === 'act' ? 0.55 : 0.55 * (1 - r / 0.35);
      ctx.save(); ctx.globalAlpha = tal; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(f.x, f.y, tr, f.face + aCur, f.face + 1.5); ctx.strokeStyle = shine ? 'rgba(255,224,140,.9)' : rgbaOf(d.col, 0.55); ctx.lineWidth = 14; ctx.stroke();
      ctx.beginPath(); ctx.arc(f.x, f.y, tr, f.face + aCur, f.face + Math.min(1.5, aCur + 0.9)); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 4; ctx.stroke();
      ctx.restore(); ctx.globalAlpha = veil ? 0.22 : 1;
    }
    if (f.brokenT > 0) { ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.face); ctx.translate(g.x, g.y); ctx.rotate(rot); ctx.scale(g.k, g.k); ctx.beginPath(); ctx.rect(-30, -30, 52, 60); ctx.clip(); if (weaponOK(I)) ctx.drawImage(I.im, I.x, I.y, I.w, I.h); ctx.restore(); if (Math.random() < 0.15) { var bt = locOf(f, g.x + 22 * g.k, g.y); parts.push({ x: bt.x, y: bt.y, vx: (Math.random() - 0.5) * 40, vy: -30 - Math.random() * 30, t: 0, life: 0.4, col: '#e8f0ff' }); } }
    else putW(f, I, g.x, g.y, rot, g.k, false);
  } else if (wp === 'spear') {
    var ext = 0;
    if (f.guarding) ext = -6;
    else if (f.st === 'wind' && sweeps) ext = -26 * p;
    else if (f.st === 'act' && sweeps) ext = -26 + 70 * Math.sin(Math.min(1, q * 1.2) * 1.4);
    else if (f.st === 'rec' && sweeps) ext = 44 * (1 - r);
    if (sweeps && f.st === 'act' && a.kind !== 'charge') { var ty = (g.pair && a.key === 'light' && f.combo % 2 === 1) ? -g.y : g.y, s0 = locOf(f, g.x + 20, ty), s1 = locOf(f, Math.min(a.reach, g.x + ext + 120), ty); ctx.save(); ctx.globalAlpha = 0.5 * (1 - q); ctx.lineCap = 'round'; ctx.strokeStyle = rgbaOf(d.col, 0.7); ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
    if (g.pair && IMG[g.pair]) {
      // two spears, one per hand: the light chain alternates them, everything else thrusts the long red one
      var alt = a && a.key === 'light' && f.combo % 2 === 1, e2 = f.guarding ? -6 : 0;
      putW(f, IMG[g.pair].weapon, g.x + (alt ? ext : e2), -g.y, f.guarding ? 0.15 : -0.04, g.k, false);
      putW(f, I, g.x + (alt ? e2 : ext), g.y, f.guarding ? -0.15 : 0.04, g.k, false);
    } else putW(f, I, g.x + ext, g.y, f.guarding ? -0.15 : 0.04, g.k, false);
  } else if (wp === 'bow') {
    var rc = f.st === 'act' ? -5 * (1 - q) : 0;
    putW(f, I, g.x + rc, 0, 0, g.k, false);
    if (f.st === 'wind' && a && a.shape === 'drill') { var dq = locOf(f, g.x + 6 - 14 * p, 0), dq2 = locOf(f, g.x + 52, 0); ctx.save(); ctx.strokeStyle = 'rgba(160,210,255,' + (0.4 + 0.6 * p) + ')'; ctx.shadowColor = '#9fd4ff'; ctx.shadowBlur = 8 + 18 * p; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(dq.x, dq.y); ctx.lineTo(dq2.x, dq2.y); ctx.stroke(); ctx.restore(); }
    else if (f.st === 'wind' && a && (a.kind === 'proj' || a.key === 'heavy')) {
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.face);
      var ax = g.x + 8 - 16 * p; ctx.strokeStyle = '#e9e4d3'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(g.x + 40, 0); ctx.stroke();
      ctx.fillStyle = '#e9e4d3'; ctx.beginPath(); ctx.moveTo(g.x + 40, -3.5); ctx.lineTo(g.x + 48, 0); ctx.lineTo(g.x + 40, 3.5); ctx.fill(); ctx.restore();
    }
  } else if (wp === 'fist') {
    [-1, 1].forEach(function (sd) {
      var mine = !inAtk ? false : (a.key === 'light' ? ((f.combo % 2 === 0) === (sd === -1)) : true);
      var ex = 0, yy = 9 * sd;
      if (f.guarding) { ex = 6; yy = 5 * sd; }
      else if (inAtk && mine && sweeps) {
        if (f.st === 'wind') ex = -10 * p;
        else if (f.st === 'act') { ex = -10 + (a.reach * 0.6 + 10) * Math.sin(Math.min(1, q * 1.1) * 1.4) / Math.sin(1.4); yy = 9 * sd * (1 - 0.6 * Math.min(1, q)); }
        else ex = a.reach * 0.18 * (1 - r);
      }
      var fp = locOf(f, 24 + ex, yy);
      ctx.beginPath(); ctx.arc(fp.x, fp.y, 7.5, 0, 6.283); ctx.fillStyle = '#1f2128'; ctx.fill(); ctx.strokeStyle = '#0b121a'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(fp.x + Math.cos(f.face) * 3, fp.y + Math.sin(f.face) * 3, 3.2, f.face - 1.2, f.face + 1.2); ctx.strokeStyle = '#a3262f'; ctx.lineWidth = 2; ctx.stroke();
    });
  } else if (wp === 'gun') {
    var jit = f.st === 'act' ? (Math.random() - 0.5) * 3 : 0;
    putW(f, I, g.x - (f.st === 'act' ? 3 : 0), g.y + jit, 0, g.k, false);
    if (f.st === 'act') { var mz = locOf(f, g.x + 74, g.y + jit); ctx.beginPath(); ctx.arc(mz.x, mz.y, 5 + Math.random() * 7, 0, 6.283); ctx.fillStyle = 'rgba(255,225,130,.9)'; ctx.fill(); ctx.beginPath(); ctx.arc(mz.x, mz.y, 3, 0, 6.283); ctx.fillStyle = '#fff'; ctx.fill(); }
  } else if (wp === 'tome') {
    var npC = f.key === 'np' && (f.st === 'wind' || f.st === 'act'), pw = f.st === 'wind' ? p : 1;
    var glow = npC ? 0.6 + 0.4 * pw : (inAtk && f.st !== 'rec' ? (f.st === 'wind' ? p : 1) : 0.15);
    var bob = Math.sin(G.time * 3 + f.idx) * 1.2, tsc = g.k * (npC ? 1 + 0.7 * pw : 1);
    ctx.shadowColor = '#6fe3c8'; ctx.shadowBlur = 6 + 24 * glow;
    putW(f, I, g.x + (npC ? 20 * pw : 5 * glow), g.y * (npC ? 1 - 0.8 * pw : 1) + bob, npC ? 0.25 * Math.sin(G.time * 5) : -0.1 * glow, tsc, false);
    ctx.shadowBlur = 0;
    if (npC) { var tc = locOf(f, g.x + 20 * pw + 16, 0); ctx.save(); ctx.strokeStyle = 'rgba(111,227,200,' + (0.25 + 0.4 * pw) + ')'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -G.time * 30; ctx.beginPath(); ctx.arc(tc.x, tc.y, 26 + 8 * pw, 0, 6.283); ctx.stroke(); ctx.restore(); }
  } else if (wp === 'chain') {
    var hand = locOf(f, g.x, g.y), th = 0.5, L = 26;
    var out = f.pull > 0 || G.proj.some(function (pr) { return pr.owner === f && pr.a.pull; });
    if (f.guarding) { th = -0.3; L = 20; }
    else if (f.st === 'wind' && a && a.key === 'skill') { th = 0.5 + 12 * p; L = 28; }
    else if (f.st === 'wind' && sweeps) { th = 0.5 + 1.8 * p; L = 26 + 8 * p; }
    else if (f.st === 'act' && sweeps) { th = 2.3 - 3.8 * q; L = 30 + (a.reach * 0.85 - 30) * Math.sin(Math.PI * Math.min(1, q)); }
    else if (f.st === 'rec' && sweeps) { th = -1.5 * (1 - r) + 0.5 * r; L = 30 - 4 * r; }
    if (!out) {
      var lx = g.x + Math.cos(th) * L, ly = g.y + Math.sin(th) * L, pw2 = locOf(f, lx, ly);
      chainLine(hand.x, hand.y, pw2.x, pw2.y);
      putW(f, I, lx, ly, th, g.k, false);
    }
  } else if (wp === 'staff') {
    var rc2 = f.st === 'act' ? -4 * (1 - q) : 0;
    putW(f, I, g.x + rc2, g.y, f.st === 'wind' ? -0.2 * p : 0, g.k, false);
  } else if (wp === 'dagger') {
    var side = d.single ? [1] : [-1, 1]; // one blade (Hassan, Ryuunosuke) or a pair (EMIYA)
    side.forEach(function (sd) {
      var mine = (!a || a.key !== 'light' || d.single) ? true : ((f.combo % 2 === 0) === (sd === -1));
      var rest = 0.35, rt = rest, ex = 0;
      if (inAtk && mine && sweeps) {
        if (f.st === 'wind') rt = rest + 0.9 * p; else if (f.st === 'act') rt = 1.25 - 2.4 * q; else rt = -1.15 * (1 - r) + rest * r;
        if (a.kind === 'grab') ex = f.st === 'act' ? 14 : 0;
      }
      putW(f, (sd === 1 && d.id === 'emiya' && IMG.emiya_white) ? IMG.emiya_white.weapon : I, g.x + ex, g.y * sd, sd * rt, g.k, sd === -1);
    });
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  if (veil) { ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.face + (f.st === 'wind' ? 0.2 : 0.2)); ctx.strokeStyle = 'rgba(244,248,252,.65)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.setLineDash([16, 14]); ctx.lineDashOffset = -G.time * 120; for (var vi = -1; vi <= 1; vi++) { ctx.beginPath(); ctx.moveTo(g.x + 10, vi * 5 + g.y); ctx.quadraticCurveTo(g.x + 50, vi * 9 + g.y + Math.sin(G.time * 9 + vi) * 4, g.x + 95, vi * 3 + g.y); ctx.stroke(); } ctx.setLineDash([]); ctx.restore(); }
  var trail = 0, tq = q;
  if (a && a.kind === 'melee') { if (f.st === 'act') trail = 1 - q * 0.35; else if (f.st === 'rec' && r < 0.45) { trail = 0.65 * (1 - r / 0.45); tq = 1; } }
  if (trail > 0) {
    var Rr = a.reach + FR * 0.4;
    if (wp === 'spear') { ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 * trail) + ')'; ctx.lineWidth = 10 * trail + 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(f.x + Math.cos(f.face) * 30, f.y + Math.sin(f.face) * 30); ctx.lineTo(f.x + Math.cos(f.face) * Rr, f.y + Math.sin(f.face) * Rr); ctx.stroke(); }
    else { var a0 = f.face + a.arc, a1 = f.face + a.arc * (1 - 2 * tq); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(f.x, f.y, Rr * 0.82, Math.min(a0, a1), Math.max(a0, a1)); ctx.strokeStyle = 'rgba(255,255,255,' + (0.6 * trail) + ')'; ctx.lineWidth = 14 * trail + 3; ctx.stroke(); ctx.beginPath(); ctx.arc(f.x, f.y, Rr * 0.82, Math.min(a0, a1), Math.max(a0, a1)); ctx.strokeStyle = d.col; ctx.globalAlpha = 0.65 * trail; ctx.lineWidth = 5; ctx.stroke(); ctx.globalAlpha = 1; }
  }
}
function drawPegasus(f) {
  var a = f.act, p = f.st === 'wind' ? clamp(f.t / (f.windTotal || 1), 0, 1) : 1, act = f.st === 'act', sc = 1.5 + 0.3 * p + (act ? 0.1 : 0), flap = f.st === 'wind' ? Math.sin(G.time * 14) : -0.6;
  ctx.save(); ctx.translate(f.x + 14 * p, f.y + 22 * p); ctx.rotate(f.face); ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.ellipse(-4, 0, 44 * sc, 22 * sc, 0, 0, 6.283); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.face); ctx.scale(sc, sc);
  if (act) { var tg = ctx.createLinearGradient(-200, 0, -20, 0); tg.addColorStop(0, 'rgba(255,255,255,0)'); tg.addColorStop(1, 'rgba(255,255,255,.7)'); ctx.fillStyle = tg; ctx.fillRect(-200, -26, 180, 52); }
  ctx.strokeStyle = '#0b121a'; ctx.lineWidth = 2;
  [-1, 1].forEach(function (sd) { ctx.save(); ctx.scale(1, sd); ctx.rotate(-0.25 * flap - (act ? 0.6 : 0)); ctx.beginPath(); ctx.moveTo(-6, 6); ctx.quadraticCurveTo(-10, 40, -34, 62); ctx.quadraticCurveTo(-20, 56, -18, 46); ctx.quadraticCurveTo(-30, 50, -40, 48); ctx.quadraticCurveTo(-22, 34, -16, 8); ctx.closePath(); ctx.fillStyle = '#f4f6fa'; ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(150,170,200,.6)'; ctx.beginPath(); ctx.moveTo(-10, 14); ctx.lineTo(-28, 52); ctx.moveTo(-14, 12); ctx.lineTo(-36, 46); ctx.stroke(); ctx.strokeStyle = '#0b121a'; ctx.restore(); });
  ctx.beginPath(); ctx.ellipse(-6, 0, 36, 15, 0, 0, 6.283); ctx.fillStyle = '#eef1f6'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.quadraticCurveTo(-56, -6, -62, 4); ctx.strokeStyle = '#d8dde6'; ctx.lineWidth = 6; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#0b121a';
  ctx.beginPath(); ctx.ellipse(36, 0, 14, 8, 0, 0, 6.283); ctx.fillStyle = '#eef1f6'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(22, -6); ctx.lineTo(28, -12); ctx.moveTo(22, 6); ctx.lineTo(28, 12); ctx.stroke();
  ctx.strokeStyle = '#e8c06a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(34, -7); ctx.quadraticCurveTo(12, -10, 4, -6); ctx.moveTo(34, 7); ctx.quadraticCurveTo(12, 10, 4, 6); ctx.stroke();
  ctx.restore(); ctx.globalAlpha = 1;
}
function drawFighter(f) {
  if (f.st === 'dead' && f !== G.f[MEI] && G.f.length > 2) { ctx.globalAlpha = Math.max(0, 1 - f.t); if (f.t > 1) { ctx.globalAlpha = 1; return; } }
  var d = f.def, base = teamCol(f), I = IMG[d.id].body, ally = f.team === G.f[MEI].team;
  var sa = 0; if (f.spirit === 2 && !ally) { if (!spiritSensed(f)) return; sa = 0.13 + 0.07 * Math.sin(G.time * 9); ctx.globalAlpha = sa; }
  if (f.orphanT > 0) { ctx.globalAlpha = Math.max(0.25, Math.min(1, f.orphanT / 6)); }
  if (d.id === 'medusa' && f.key === 'np' && (f.st === 'wind' || f.st === 'act' || (f.st === 'rec' && f.t < 0.35))) drawPegasus(f);
  ctx.beginPath(); ctx.ellipse(f.x, f.y + 6, FR + 6, FR - 2, 0, 0, 6.283); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
  ctx.beginPath(); ctx.arc(f.x, f.y, FR + 5, 0, 6.283); ctx.strokeStyle = base; ctx.globalAlpha = sa || 0.85; ctx.lineWidth = 3; ctx.stroke(); ctx.globalAlpha = sa || 1;
  if (f.wallT > 0) drawHotGates(f);
  if (f.iframes > 0) ctx.globalAlpha = 0.45; else if (f.hid) ctx.globalAlpha = ally ? 0.55 : 0.28;
  if (f.spirit) ctx.globalAlpha = f.spirit === 2 ? (ally ? 0.32 : sa) : 0.6 + 0.3 * Math.sin(G.time * 20);
  if (weaponOK(I)) { var br = (d.isMaster ? 0.8 : 1) * (f.spirit === 2 ? 1.05 : 1) + (f.st === 'idle' ? 0.018 * Math.sin(G.time * 3.2 + f.idx * 1.7) : 0) + (f.st === 'wind' && f.key === 'np' ? 0.05 * clamp(f.t / (f.windTotal || 1), 0, 1) : 0); ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.face); ctx.scale(br, br); ctx.drawImage(I.im, I.x, I.y, I.w, I.h); ctx.restore(); }
  else { ctx.beginPath(); ctx.arc(f.x, f.y, FR, 0, 6.283); ctx.fillStyle = d.col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = base; ctx.stroke(); }
  ctx.globalAlpha = 1;
  if (f.hit > 0) { ctx.beginPath(); ctx.arc(f.x, f.y, FR + 4, 0, 6.283); ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.6, f.hit * 4) + ')'; ctx.fill(); }
  else if (f.st === 'stag') { ctx.beginPath(); ctx.arc(f.x, f.y, FR + 3, 0, 6.283); ctx.fillStyle = 'rgba(120,130,140,.45)'; ctx.fill(); }
  if (f.guarding) {
    ctx.beginPath(); ctx.arc(f.x, f.y, FR + 12, f.face - 1.2, f.face + 1.2); ctx.strokeStyle = (f.parryOk && f.guardT <= PARRY) ? '#ffffff' : '#9ec4d8'; ctx.lineWidth = (f.parryOk && f.guardT <= PARRY) ? 6 : 4; ctx.stroke();
  }
  if (f.st === 'counter') { ctx.beginPath(); ctx.arc(f.x, f.y, FR + 14, f.face - 1.4, f.face + 1.4); ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 5; ctx.stroke(); }
  if (f.exh > 0) { ctx.fillStyle = '#ffd36b'; ctx.font = '600 14px "Barlow Condensed", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('EXHAUSTED', f.x, f.y - 40); }
  if (f.crit > 0) { ctx.beginPath(); ctx.arc(f.x, f.y, FR + 8, 0, 6.283); ctx.strokeStyle = '#d6dde3'; ctx.lineWidth = 2; ctx.stroke(); }
  if (f.ripo > 0) { ctx.beginPath(); ctx.arc(f.x, f.y, FR + 8, 0, 6.283); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.setLineDash([4, 5]); ctx.stroke(); ctx.setLineDash([]); }
  if (f.ubwT > 0) { for (var ui = 0; ui < 6; ui++) { var ua = G.time * 1.6 + ui * 1.047, ux = f.x + Math.cos(ua) * 52, uy = f.y + Math.sin(ua) * 52, ut = f.foe ? Math.atan2(f.foe.y - uy, f.foe.x - ux) : ua; ctx.save(); ctx.translate(ux, uy); ctx.rotate(ut); ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 10; ctx.fillStyle = '#e8edf2'; ctx.strokeStyle = '#0b121a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-8, -3); ctx.lineTo(-8, 3); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#7a1f2a'; ctx.fillRect(-12, -6, 4, 12); ctx.restore(); } }
  if (f === G.f[MEI] && f.lock && f.lock.st !== 'dead') { ctx.save(); ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 2.5; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -G.time * 20; ctx.beginPath(); ctx.arc(f.lock.x, f.lock.y, FR + 16, 0, 6.283); ctx.stroke(); ctx.restore(); }
  if (G.mode === 'war' && f !== G.f[MEI] && G.f[MEI] && contractable(G.f[MEI], f)) { ctx.fillStyle = '#9fe6b0'; ctx.font = '700 13px "Barlow Condensed", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.def.isMaster ? 'NEEDS A SERVANT \u00B7 CONTRACT (F)' : 'NEEDS A MASTER \u00B7 CONTRACT (F)', f.x, f.y - 58); }
  if (f.orphanT > 0) { ctx.fillStyle = '#ffd36b'; ctx.font = '600 13px "Barlow Condensed", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('FADING ' + Math.ceil(f.orphanT), f.x, f.y - 44); }
  if (f.humanTag && f.st !== 'dead') { ctx.fillStyle = f === G.f[MEI] ? '#7fe3f0' : '#ffd36b'; ctx.font = '700 13px "Barlow Condensed", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f === G.f[MEI] ? 'YOU' : f.humanTag, f.x, f.y - FR - 22); }
  if (f.def.isMaster) { ctx.fillStyle = 'rgba(233,228,211,.7)'; ctx.font = '600 11px "Barlow Condensed", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('MASTER', f.x, f.y + FR + 32); }
  if (f.pull > 0) chainLine(f.x, f.y, f.foe.x, f.foe.y);
  if (f.hid) ctx.globalAlpha = ally ? 0.55 : 0.28;
  if (f.spirit === 2) ctx.globalAlpha = ally ? 0.32 : sa;
  drawWeapon(f); ctx.globalAlpha = 1;
  if (f.hid && f.idx === 0) { ctx.fillStyle = 'rgba(200,215,225,.85)'; ctx.font = '600 13px "Barlow Condensed", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('HIDDEN', f.x, f.y - 40); }
  var bw = 48; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(f.x - bw / 2, f.y + FR + 14, bw, 5);
  ctx.fillStyle = base; ctx.fillRect(f.x - bw / 2, f.y + FR + 14, bw * clamp(f.hp / d.hp, 0, 1), 5); ctx.globalAlpha = 1;
  if (d.mag && f.ammo !== undefined && f.st !== 'dead') { var am = f.reloadT > 0 ? 1 - f.reloadT / d.mag.reload : f.ammo / d.mag.size; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(f.x - bw / 2, f.y + FR + 21, bw, 3); ctx.fillStyle = f.reloadT > 0 ? '#8a94a0' : '#ffd36b'; ctx.fillRect(f.x - bw / 2, f.y + FR + 21, bw * clamp(am, 0, 1), 3); }
}
var THEME = {
  fuyuki: { floor: '#2a333b', block: '#5a6470', obs: '#2f5a33' },
  arena: { floor: '#16293a', block: '#34495a', obs: '#34495a' }, bridge: { floor: '#2b3038', block: '#6d7480', obs: '#b8322a' }, temple: { floor: '#545047', block: '#3a3f3a', obs: '#8a867a' },
  forest: { floor: '#17231a', block: '#2a3a2a', obs: '#24432a' }, harbor: { floor: '#373c42', block: '#a8452f', obs: '#d9a73a' }, church: { floor: '#21342a', block: '#c9c2b4', obs: '#8e9198' }, school: { floor: '#5c4d3a', block: '#8a8f94', obs: '#2f5a33' }
};
function mapNoise(m, n, seed) { if (m['_n' + seed]) return m['_n' + seed]; var v = seed >>> 0, out = []; for (var i = 0; i < n; i++) { v = (v * 1664525 + 1013904223) >>> 0; var a = v / 4294967296; v = (v * 1664525 + 1013904223) >>> 0; var b = v / 4294967296; v = (v * 1664525 + 1013904223) >>> 0; out.push([a * m.w, b * m.h, v / 4294967296]); } m['_n' + seed] = out; return out; }
var VIEWR = null;
// servants sense each other: an enemy in spirit form shimmers when a servant of your side stands within SPIRIT.sense
function spiritSensed(f) { var me = G.f[MEI]; if (!me) return false; var mine = [me, me.partner]; for (var i = 0; i < 2; i++) { var s = mine[i]; if (s && s.st !== 'dead' && !s.def.isMaster && dist(s, f) <= SPIRIT.sense) return true; } return G.mode !== 'war' && dist(f, me) <= SPIRIT.sense; }
function drawFloor(g, m) {
  if (m.theme === 'city') { drawCity(g, m); return; }
  var th = m.theme, w = m.w, h = m.h;
  g.fillStyle = THEME[th].floor; g.fillRect(0, 0, w, h);
  if (th === 'fuyuki') {
    var vw = VIEWR || { x0: 0, y0: 0, x1: w, y1: h }, inV = function (x0, y0, x1, y1) { return x1 > vw.x0 && x0 < vw.x1 && y1 > vw.y0 && y0 < vw.y1; };
    // districts
    g.fillStyle = '#2d3830'; g.fillRect(0, 0, 4300, h); g.fillStyle = '#30363e'; g.fillRect(4700, 0, w - 4700, h);
    g.fillStyle = '#1f3a26'; g.fillRect(0, 0, 2150, 1660); g.fillStyle = '#1c3624'; g.fillRect(7620, 0, w - 7620, 3100);
    g.fillStyle = '#3a3a33'; g.beginPath(); g.ellipse(8300, 1500, 560, 420, 0, 0, 6.283); g.fill();
    g.fillStyle = '#343a35'; g.fillRect(560, 330, 1100, 900); // temple grounds
    g.fillStyle = '#2a4a2e'; g.fillRect(2300, 330, 1900, 1200); // foreigners' hill lawns
    g.fillStyle = '#2b4a30'; g.fillRect(3920, 1850, 380, 2300); // riverside park
    g.fillStyle = '#2a4730'; g.beginPath(); g.ellipse(7450, 3950, 720, 520, 0, 0, 6.283); g.fill(); // central park
    g.fillStyle = '#2f4532'; g.fillRect(560, 2520, 1100, 520); // cemetery
    g.fillStyle = '#6a5a42'; g.beginPath(); g.ellipse(2850, 2850, 480, 260, 0, 0, 6.283); g.fill(); g.fillStyle = '#3d5a36'; g.beginPath(); g.ellipse(2850, 2850, 380, 170, 0, 0, 6.283); g.fill(); // school track
    g.strokeStyle = 'rgba(240,240,240,.45)'; g.lineWidth = 3; g.beginPath(); g.ellipse(2850, 2850, 430, 215, 0, 0, 6.283); g.stroke();
    g.fillStyle = '#857a5c'; g.fillRect(0, 5520, 4300, 240); g.fillStyle = '#a59870'; g.fillRect(0, 5640, 4300, 120); // Fuyuki Beach
    g.fillStyle = '#3c4148'; g.fillRect(4700, 4880, w - 4700, 880); // harbor apron
    g.strokeStyle = '#e0b040'; g.lineWidth = 6; g.setLineDash([30, 20]); g.beginPath(); g.moveTo(4700, 5740); g.lineTo(w, 5740); g.stroke(); g.setLineDash([]);
    // roads
    g.fillStyle = '#3d4249';
    [[0, 1670, w, 64], [0, 4270, w, 64], [0, 3290, 4300, 56], [2140, 0, 60, 5520], [4700, 2860, w - 4700, 56], [5870, 0, 60, 3080], [4700, 600, 3000, 50], [2300, 1520, 2000, 44], [7520, 1480, 330, 44]].forEach(function (r) { g.fillRect(r[0], r[1], r[2], r[3]); });
    g.fillStyle = '#4a4f57'; g.fillRect(2760, 3780, 1460, 110); // shopping street arcade
    g.fillStyle = '#6a665c'; g.fillRect(1060, 1240, 80, 440); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; for (var st2 = 1250; st2 < 1680; st2 += 18) { g.beginPath(); g.moveTo(1060, st2); g.lineTo(1140, st2); g.stroke(); } // Ryuudou stairs
    g.strokeStyle = 'rgba(230,200,90,.32)'; g.lineWidth = 3; g.setLineDash([40, 30]); [1702, 4302].forEach(function (yy) { g.beginPath(); g.moveTo(vw.x0, yy); g.lineTo(vw.x1, yy); g.stroke(); }); g.setLineDash([]);
    // railway into Fuyuki Station
    if (inV(4700, 3260, w, 3360)) { g.fillStyle = '#2a2622'; g.fillRect(4700, 3270, w - 4700, 80); g.strokeStyle = '#5a4a3a'; g.lineWidth = 6; for (var rx = Math.max(4700, vw.x0 - vw.x0 % 30); rx < Math.min(w, vw.x1); rx += 30) { g.beginPath(); g.moveTo(rx, 3274); g.lineTo(rx, 3346); g.stroke(); } g.strokeStyle = '#9aa3ad'; g.lineWidth = 4; [3288, 3332].forEach(function (ry) { g.beginPath(); g.moveTo(4700, ry); g.lineTo(w, ry); g.stroke(); }); }
    // the Mion River and the sea
    if (inV(4280, 0, 4720, h)) { var wg = g.createLinearGradient(4300, 0, 4700, 0); wg.addColorStop(0, '#1d3d58'); wg.addColorStop(0.5, '#25507a'); wg.addColorStop(1, '#1d3d58'); g.fillStyle = wg; g.fillRect(4300, 0, 400, 5760);
      g.strokeStyle = 'rgba(160,200,230,.18)'; g.lineWidth = 2; for (var wy = Math.max(0, vw.y0 - vw.y0 % 46); wy < Math.min(h, vw.y1); wy += 46) { g.beginPath(); g.moveTo(4320, wy); g.quadraticCurveTo(4500, wy + 14 + Math.sin((G ? G.time : 0) + wy) * 6, 4680, wy); g.stroke(); } }
    g.fillStyle = '#1d3a52'; g.fillRect(0, 5760, w, h - 5760);
    if (inV(0, 5740, w, h)) { g.strokeStyle = 'rgba(160,200,230,.2)'; g.lineWidth = 2; for (var sx3 = Math.max(0, vw.x0 - vw.x0 % 120); sx3 < Math.min(w, vw.x1); sx3 += 120) { g.beginPath(); g.moveTo(sx3, 5800 + Math.sin(sx3 + (G ? G.time : 0)) * 8); g.lineTo(sx3 + 70, 5800 + Math.sin(sx3 + (G ? G.time : 0)) * 8); g.stroke(); } }
    // bridges: Fuyuki Bridge (red arches) and the southern road bridge
    [[1700, '#a8302a'], [4300, '#6a7480']].forEach(function (bq) { g.fillStyle = '#3c424b'; g.fillRect(4270, bq[0] - 110, 460, 220); g.strokeStyle = bq[1]; g.lineWidth = 12; g.beginPath(); g.moveTo(4270, bq[0] - 110); g.lineTo(4730, bq[0] - 110); g.moveTo(4270, bq[0] + 110); g.lineTo(4730, bq[0] + 110); g.stroke(); if (bq[0] === 1700) { g.lineWidth = 5; for (var ax = 4300; ax <= 4700; ax += 50) { g.beginPath(); g.moveTo(ax, bq[0] - 110); g.lineTo(4500, bq[0] - 60); g.moveTo(ax, bq[0] + 110); g.lineTo(4500, bq[0] + 60); g.stroke(); } } });
    // Ryuudou's pond and the harbor piers
    g.fillStyle = '#25507a'; g.beginPath(); g.ellipse(1450, 1050, 110, 70, 0, 0, 6.283); g.fill();
    g.fillStyle = '#4a4f57'; [5300, 6100, 6900, 7700, 8500].forEach(function (px) { g.fillRect(px, 5760, 70, 180); });
    if (m.labels) { g.save(); g.textAlign = 'center'; g.font = '700 54px "Barlow Condensed", sans-serif'; g.fillStyle = 'rgba(233,228,211,.11)'; m.labels.forEach(function (lb) { if (inV(lb[1] - 500, lb[2] - 60, lb[1] + 500, lb[2] + 20)) g.fillText(lb[0], lb[1], lb[2]); }); g.restore(); }
  }
  else if (th === 'arena') { g.strokeStyle = 'rgba(120,160,190,.09)'; g.lineWidth = 1; for (var x = 0; x <= w; x += 100) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (var y = 0; y <= h; y += 100) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.beginPath(); g.arc(800, 550, 220, 0, 6.283); g.strokeStyle = 'rgba(240,169,59,.12)'; g.lineWidth = 3; g.stroke(); }
  else if (th === 'bridge') { g.fillStyle = '#3c424b'; g.fillRect(0, 0, w, 96); g.fillRect(0, h - 96, w, 96); g.strokeStyle = '#b8322a'; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 8); g.lineTo(w, 8); g.moveTo(0, h - 8); g.lineTo(w, h - 8); g.stroke();
    g.strokeStyle = 'rgba(240,200,80,.6)'; g.lineWidth = 4; g.setLineDash([60, 40]); g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke(); g.strokeStyle = 'rgba(230,230,230,.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, h / 2 - 150); g.lineTo(w, h / 2 - 150); g.moveTo(0, h / 2 + 150); g.lineTo(w, h / 2 + 150); g.stroke(); g.setLineDash([]);
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; for (var bx = 0; bx < w; bx += 150) { g.beginPath(); g.moveTo(bx, 96); g.lineTo(bx, h - 96); g.stroke(); } }
  else if (th === 'temple') { mapNoise(m, 900, 11).forEach(function (q) { g.fillStyle = q[2] < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.12)'; g.fillRect(q[0], q[1], 4, 4); }); g.fillStyle = '#77736a'; g.fillRect(820, 260, 160, h - 260); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 2; for (var ty = 300; ty < h; ty += 60) { g.beginPath(); g.moveTo(820, ty); g.lineTo(980, ty); g.stroke(); }
    g.fillStyle = '#9b2a22'; g.fillRect(800, h - 66, 200, 14); }
  else if (th === 'forest') { mapNoise(m, 160, 23).forEach(function (q) { g.beginPath(); g.arc(q[0], q[1], 30 + q[2] * 60, 0, 6.283); g.fillStyle = q[2] < 0.5 ? 'rgba(40,70,40,.35)' : 'rgba(0,0,0,.25)'; g.fill(); }); g.beginPath(); g.ellipse(1000, 750, 380, 290, 0, 0, 6.283); g.fillStyle = 'rgba(70,100,70,.35)'; g.fill();
    g.strokeStyle = 'rgba(120,110,80,.25)'; g.lineWidth = 60; g.lineCap = 'round'; g.beginPath(); for (var px = 0; px <= w; px += 40) { var py = 750 + Math.sin(px / 260) * 120; if (px === 0) g.moveTo(px, py); else g.lineTo(px, py); } g.stroke(); g.beginPath(); for (var qy = 0; qy <= h; qy += 40) { var qx = 1000 + Math.sin(qy / 230) * 110; if (qy === 0) g.moveTo(qx, qy); else g.lineTo(qx, qy); } g.stroke(); g.lineCap = 'butt'; }
  else if (th === 'harbor') { g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 2; for (var hx = 0; hx <= w; hx += 200) { g.beginPath(); g.moveTo(hx, 0); g.lineTo(hx, h); g.stroke(); } for (var hy = 0; hy <= h; hy += 200) { g.beginPath(); g.moveTo(0, hy); g.lineTo(w, hy); g.stroke(); }
    g.fillStyle = '#1d3a52'; g.fillRect(0, h - 24, w, 24); g.strokeStyle = '#e0b040'; g.lineWidth = 6; g.setLineDash([30, 20]); g.beginPath(); g.moveTo(0, h - 40); g.lineTo(w, h - 40); g.stroke(); g.setLineDash([]);
    g.strokeStyle = 'rgba(160,160,170,.25)'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 620); g.lineTo(w, 620); g.moveTo(0, 660); g.lineTo(w, 660); g.stroke(); }
  else if (th === 'church') { mapNoise(m, 500, 31).forEach(function (q) { g.fillStyle = q[2] < 0.5 ? 'rgba(80,120,80,.18)' : 'rgba(0,0,0,.14)'; g.fillRect(q[0], q[1], 6, 3); }); g.fillStyle = '#5a564c'; g.fillRect(780, 320, 140, h - 320); g.fillRect(0, 760, w, 80); g.beginPath(); g.arc(850, 800, 90, 0, 6.283); g.fill(); }
  else if (th === 'school') { g.fillStyle = '#4f4231'; g.fillRect(0, 0, w, 300); g.beginPath(); g.ellipse(950, 780, 560, 330, 0, 0, 6.283); g.fillStyle = '#6e5a42'; g.fill(); g.beginPath(); g.ellipse(950, 780, 450, 230, 0, 0, 6.283); g.fillStyle = '#3d5a36'; g.fill();
    g.strokeStyle = 'rgba(240,240,240,.55)'; g.lineWidth = 3; [560, 520, 480].forEach(function (rx, k) { g.beginPath(); g.ellipse(950, 780, rx, 330 - k * 40, 0, 0, 6.283); g.stroke(); }); g.beginPath(); g.moveTo(950, 560); g.lineTo(950, 1000); g.stroke(); g.beginPath(); g.arc(950, 780, 70, 0, 6.283); g.stroke(); }
}
function drawBlock(g, b, i, m) { if ((m || MAP).theme === 'city' || b.gen) return drawCityBlock(g, b, i); return drawBlock0(g, b, i); }
function drawBlock0(g, b, i) {
  var x0 = b.x - b.w / 2, y0 = b.y - b.h / 2, k = b.k;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x0 + 6, y0 + 8, b.w, b.h);
  if (k === 'water') return;
  if (k === 'pond') { g.fillStyle = '#25507a'; g.beginPath(); g.ellipse(b.x, b.y, b.w / 2 + 20, b.h / 2 + 14, 0, 0, 6.283); g.fill(); g.strokeStyle = '#3a5a3a'; g.lineWidth = 6; g.stroke(); return; }
  var col = { house: ['#6a4a3a', '#4a5a6a', '#5a4a5a', '#3a4a3a'].at(i % 4), mansion: '#7a3a3a', mansion2: '#4a3a5a', tower: ['#4f6276', '#5c6670', '#475a6c'].at(i % 3), mall: '#6a8a5a', station: '#6a6f78', car: ['#7a2a2a', '#2a4a7a'].at(i % 2), hall: '#3b443d', bell: '#4a3a2a', shed: '#5a4532', box1: '#a8452f', box2: '#2f6fa8', box3: '#3a8a5a', church: '#cfc8ba', grave: '#8e9198', school: '#8a8f94', gym: '#3d6a9a', bleacher: '#6a6f75', goal: '#e6e6e6', mansion3: '#5a5a6a', house_jp: ['#454b55', '#4e4a44', '#3f4a50', '#514b52'].at(i % 4), dojo: '#5a4532', shop: ['#7a5a3a', '#5a6a7a', '#7a4a4a', '#4a6a5a'].at(i % 4), center: '#5c6f84', hyatt: '#6f6a5e', apt: '#5e6168', semina: '#6a5e70', warehouse: '#56656e', castle: '#8a8f9a' }[k] || '#555';
  g.fillStyle = col; g.strokeStyle = '#0b121a'; g.lineWidth = 3;
  if (k === 'grave') { g.beginPath(); g.roundRect(x0, y0, b.w, b.h, 6); g.fill(); g.stroke(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(b.x - 8, b.y); g.lineTo(b.x + 8, b.y); g.moveTo(b.x, b.y - 7); g.lineTo(b.x, b.y + 7); g.stroke(); return; }
  if (k === 'goal') { g.strokeStyle = '#e6e6e6'; g.lineWidth = 4; g.strokeRect(x0, y0, b.w, b.h); g.strokeStyle = 'rgba(230,230,230,.3)'; g.lineWidth = 1; for (var gy = y0; gy < y0 + b.h; gy += 10) { g.beginPath(); g.moveTo(x0, gy); g.lineTo(x0 + b.w, gy); g.stroke(); } return; }
  g.beginPath(); g.roundRect(x0, y0, b.w, b.h, k === 'car' ? 16 : 4); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 2;
  if (k === 'car') { g.fillStyle = 'rgba(160,200,230,.55)'; g.fillRect(b.x + b.w * 0.12, y0 + 10, b.w * 0.18, b.h - 20); g.fillRect(b.x - b.w * 0.34, y0 + 12, b.w * 0.12, b.h - 24); }
  else if (k.indexOf('box') === 0) { var hz = b.w > b.h; for (var r = 1; r < 9; r++) { g.beginPath(); if (hz) { g.moveTo(x0 + r * b.w / 9, y0 + 4); g.lineTo(x0 + r * b.w / 9, y0 + b.h - 4); } else { g.moveTo(x0 + 4, y0 + r * b.h / 9); g.lineTo(x0 + b.w - 4, y0 + r * b.h / 9); } g.stroke(); } }
  else if (k === 'house' || k === 'mansion' || k === 'mansion2') { g.strokeStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.moveTo(x0 + 4, b.y); g.lineTo(x0 + b.w - 4, b.y); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.12)'; for (var hr = 1; hr < 6; hr++) { g.beginPath(); g.moveTo(x0 + 4, y0 + hr * b.h / 6); g.lineTo(x0 + b.w - 4, y0 + hr * b.h / 6); g.stroke(); } }
  else if (k === 'house_jp' || k === 'dojo') { g.strokeStyle = 'rgba(0,0,0,.3)'; var hz2 = b.w >= b.h; for (var tq = 1; tq < 10; tq++) { g.beginPath(); if (hz2) { g.moveTo(x0 + 3, y0 + tq * b.h / 10); g.lineTo(x0 + b.w - 3, y0 + tq * b.h / 10); } else { g.moveTo(x0 + tq * b.w / 10, y0 + 3); g.lineTo(x0 + tq * b.w / 10, y0 + b.h - 3); } g.stroke(); } g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 5; g.beginPath(); if (hz2) { g.moveTo(x0 + 8, b.y); g.lineTo(x0 + b.w - 8, b.y); } else { g.moveTo(b.x, y0 + 8); g.lineTo(b.x, y0 + b.h - 8); } g.stroke(); }
  else if (k === 'shop') { for (var aw = 0; aw < 6; aw++) { g.fillStyle = aw % 2 ? 'rgba(240,235,220,.5)' : 'rgba(0,0,0,.15)'; g.fillRect(x0 + aw * b.w / 6, b.y > 3835 ? y0 : y0 + b.h - 16, b.w / 6, 16); } }
  else if (k === 'warehouse' || k === 'mansion3') { for (var wq = 1; wq < 8; wq++) { g.beginPath(); g.moveTo(x0 + wq * b.w / 8, y0 + 4); g.lineTo(x0 + wq * b.w / 8, y0 + b.h - 4); g.stroke(); } }
  else if (k === 'castle') { g.fillStyle = '#6f7480'; [[x0, y0], [x0 + b.w, y0], [x0, y0 + b.h], [x0 + b.w, y0 + b.h]].forEach(function (c) { g.beginPath(); g.arc(c[0], c[1], 46, 0, 6.283); g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#4a5068'; g.beginPath(); g.arc(c[0], c[1], 24, 0, 6.283); g.fill(); g.fillStyle = '#6f7480'; }); g.fillStyle = '#4a5068'; g.fillRect(b.x - 90, b.y - 70, 180, 140); g.strokeStyle = '#0b121a'; g.strokeRect(b.x - 90, b.y - 70, 180, 140); }
  else if (k === 'center' || k === 'hyatt' || k === 'apt' || k === 'semina' || k === 'tower' || k === 'mall' || k === 'station') { g.strokeStyle = 'rgba(180,210,240,.12)'; for (var wx2 = x0 + 14; wx2 < x0 + b.w - 10; wx2 += 22) for (var wy2 = y0 + 14; wy2 < y0 + b.h - 10; wy2 += 22) { g.strokeRect(wx2, wy2, 10, 10); } }
  else if (k === 'hall' || k === 'shed' || k === 'bell' || k === 'school' || k === 'gym') { var lines = k === 'school' ? 30 : 14; for (var q = 1; q < lines; q++) { g.beginPath(); g.moveTo(x0 + q * b.w / lines, y0 + 3); g.lineTo(x0 + q * b.w / lines, y0 + b.h - 3); g.stroke(); } g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0 + 6, b.y); g.lineTo(x0 + b.w - 6, b.y); g.stroke(); if (k === 'bell') { g.beginPath(); g.arc(b.x, b.y, 22, 0, 6.283); g.fillStyle = '#a98446'; g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.stroke(); } }
  else if (k === 'church') { g.fillStyle = '#4a4f5a'; g.beginPath(); g.moveTo(x0 + 10, y0 + 10); g.lineTo(b.x, b.y); g.lineTo(x0 + b.w - 10, y0 + 10); g.lineTo(x0 + b.w - 10, y0 + b.h - 10); g.lineTo(b.x, b.y); g.lineTo(x0 + 10, y0 + b.h - 10); g.closePath(); g.fill(); g.fillStyle = '#e9e4d3'; g.fillRect(b.x - 5, b.y - 30, 10, 60); g.fillRect(b.x - 20, b.y - 14, 40, 10); }
  else if (k === 'bleacher') { for (var s2 = 1; s2 < 5; s2++) { g.beginPath(); g.moveTo(x0 + s2 * b.w / 5, y0 + 3); g.lineTo(x0 + s2 * b.w / 5, y0 + b.h - 3); g.stroke(); } }
}
function drawObs(g, p) {
  if (p.h) return;
  var k = p.k || 'pillar';
  g.beginPath(); g.arc(p.x + 4, p.y + 7, p.r, 0, 6.283); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
  if (k === 'street') { g.beginPath(); g.arc(p.x, p.y, p.r + 6, 0, 6.283); g.fillStyle = '#2a4a2e'; g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.stroke(); g.beginPath(); g.arc(p.x - 4, p.y - 4, p.r * 0.6, 0, 6.283); g.fillStyle = '#3a6a40'; g.fill(); return; }
  if (k === 'fountain') { g.beginPath(); g.arc(p.x, p.y, p.r * 2.4, 0, 6.283); g.fillStyle = '#8a8f98'; g.fill(); g.beginPath(); g.arc(p.x, p.y, p.r * 2, 0, 6.283); g.fillStyle = '#2a5a80'; g.fill(); g.beginPath(); g.arc(p.x, p.y, p.r * 0.6, 0, 6.283); g.fillStyle = '#c8ccd4'; g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.stroke(); return; }
  if (k === 'column') { g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fillStyle = '#b8b2a6'; g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 2.5; g.stroke(); g.beginPath(); g.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.45, 0, 6.283); g.fillStyle = 'rgba(255,255,255,.2)'; g.fill(); return; }
  if (k === 'chair') { g.fillStyle = '#5a3e28'; g.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); g.strokeStyle = '#0b121a'; g.lineWidth = 1.5; g.strokeRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); return; }
  if (k === 'tree' || k === 'pine') { g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fillStyle = k === 'pine' ? '#1f3d2a' : '#24432a'; g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 2.5; g.stroke(); g.beginPath(); g.arc(p.x - p.r * 0.25, p.y - p.r * 0.25, p.r * 0.6, 0, 6.283); g.fillStyle = k === 'pine' ? '#2c5238' : '#335e39'; g.fill(); g.beginPath(); g.arc(p.x - p.r * 0.35, p.y - p.r * 0.38, p.r * 0.25, 0, 6.283); g.fillStyle = 'rgba(160,210,140,.18)'; g.fill(); return; }
  if (k === 'rock') { g.beginPath(); g.ellipse(p.x, p.y, p.r, p.r * 0.85, 0.4, 0, 6.283); g.fillStyle = '#4a443c'; g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 2.5; g.stroke(); g.beginPath(); g.ellipse(p.x - p.r * 0.2, p.y - p.r * 0.25, p.r * 0.5, p.r * 0.35, 0.4, 0, 6.283); g.fillStyle = '#5e574c'; g.fill(); return; }
  if (k === 'persimmon') { g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fillStyle = '#3a4a26'; g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 2.5; g.stroke(); g.beginPath(); g.arc(p.x - p.r * 0.2, p.y - p.r * 0.2, p.r * 0.65, 0, 6.283); g.fillStyle = '#4e5e30'; g.fill(); g.fillStyle = '#e8823a'; for (var pk = 0; pk < 9; pk++) { var pa = pk * 2.4, pr = p.r * (0.3 + (pk % 3) * 0.22); g.beginPath(); g.arc(p.x + Math.cos(pa) * pr, p.y + Math.sin(pa) * pr, 4, 0, 6.283); g.fill(); } return; }
  if (k === 'lantern') { g.save(); g.translate(p.x, p.y); g.rotate(0.785); g.fillStyle = '#8a867a'; g.strokeStyle = '#0b121a'; g.lineWidth = 2.5; g.fillRect(-p.r * 0.8, -p.r * 0.8, p.r * 1.6, p.r * 1.6); g.strokeRect(-p.r * 0.8, -p.r * 0.8, p.r * 1.6, p.r * 1.6); g.restore(); g.beginPath(); g.arc(p.x, p.y, 6, 0, 6.283); g.fillStyle = 'rgba(255,200,110,.85)'; g.fill(); return; }
  if (k === 'lamp') { var lg = g.createRadialGradient(p.x, p.y, 2, p.x, p.y, 120); lg.addColorStop(0, 'rgba(255,220,140,.22)'); lg.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = lg; g.beginPath(); g.arc(p.x, p.y, 120, 0, 6.283); g.fill(); }
  var fill = { pillar: '#34495a', lighthouse: '#e8e4d8', girder: '#a8302a', lamp: '#4a4f58', burner: '#7a6238', gatepost: '#a8302a', crane: '#d9a73a', bollard: '#2a2e33', cross: '#8e9198' }[k] || '#34495a';
  g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fillStyle = fill; g.fill(); g.strokeStyle = k === 'pillar' ? '#51697c' : '#0b121a'; g.lineWidth = k === 'pillar' ? 4 : 3; g.stroke();
  if (k === 'pillar') { g.beginPath(); g.arc(p.x, p.y, p.r * 0.6, 0, 6.283); g.strokeStyle = 'rgba(81,105,124,.5)'; g.lineWidth = 2; g.stroke(); }
  if (k === 'girder' || k === 'crane') { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(p.x - p.r * 0.6, p.y - p.r * 0.6); g.lineTo(p.x + p.r * 0.6, p.y + p.r * 0.6); g.moveTo(p.x + p.r * 0.6, p.y - p.r * 0.6); g.lineTo(p.x - p.r * 0.6, p.y + p.r * 0.6); g.stroke(); }
  if (k === 'lighthouse') { g.beginPath(); g.arc(p.x, p.y, p.r * 0.55, 0, 6.283); g.fillStyle = '#c43d3d'; g.fill(); var lb2 = g.createRadialGradient(p.x, p.y, 2, p.x, p.y, 160); lb2.addColorStop(0, 'rgba(255,240,180,.25)'); lb2.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = lb2; g.beginPath(); g.arc(p.x, p.y, 160, 0, 6.283); g.fill(); }
  if (k === 'cross') { g.fillStyle = '#e9e4d3'; g.fillRect(p.x - 4, p.y - 16, 8, 32); g.fillRect(p.x - 12, p.y - 8, 24, 7); }
  if (k === 'burner') { g.beginPath(); g.arc(p.x, p.y, p.r * 0.5, 0, 6.283); g.fillStyle = 'rgba(255,170,90,.5)'; g.fill(); }
}
function drawMapPreview(c, m) {
  var g = c.getContext('2d'), k = c.width / m.w; g.save(); g.scale(k, k);
  drawFloor(g, m); var obs = m.o; m.b.forEach(function (b, i) { drawBlock(g, b, i, m); }); obs.forEach(function (p) { drawObs(g, p); });
  g.fillStyle = '#ffffff'; m.spawns.forEach(function (sp, i) { g.beginPath(); g.arc(sp[0], sp[1], 26, 0, 6.283); g.fillStyle = FFA_COL.at(i); g.fill(); });
  g.restore();
}
function marbleNoise(n, seed) { var key = '_m' + seed + '_' + W + 'x' + H; if (MAP[key]) return MAP[key]; var v = seed >>> 0, out = []; for (var i = 0; i < n; i++) { v = (v * 1664525 + 1013904223) >>> 0; var a = v / 4294967296; v = (v * 1664525 + 1013904223) >>> 0; var b = v / 4294967296; v = (v * 1664525 + 1013904223) >>> 0; out.push([a * W, b * H, v / 4294967296]); } MAP[key] = out; return out; }
function drawMarble(g, kind, al) {
  g.save(); g.globalAlpha = al;
  if (kind === 'ionioi') {
    var sg = g.createLinearGradient(0, 0, W, H); sg.addColorStop(0, '#e6c27a'); sg.addColorStop(1, '#c39455'); g.fillStyle = sg; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(150,100,50,.25)'; g.lineWidth = 6; for (var dy = 60; dy < H; dy += 140) { g.beginPath(); for (var dx = 0; dx <= W; dx += 40) { var yy = dy + Math.sin(dx / 180 + dy) * 30; if (dx === 0) g.moveTo(dx, yy); else g.lineTo(dx, yy); } g.stroke(); }
    var sun = g.createRadialGradient(W * 0.2, H * 0.1, 10, W * 0.2, H * 0.1, Math.max(W, H) * 0.7); sun.addColorStop(0, 'rgba(255,250,220,.35)'); sun.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = sun; g.fillRect(0, 0, W, H);
    var per = 2 * (W + H), n = Math.floor(per / 34);
    for (var i = 0; i < n; i++) { for (var row = 0; row < 2; row++) { var d = i * 34 + row * 17, x, y, inset = 18 + row * 26; if (d < W) { x = d; y = inset; } else if (d < W + H) { x = W - inset; y = d - W; } else if (d < 2 * W + H) { x = 2 * W + H - d; y = H - inset; } else { x = inset; y = per - d; }
      g.beginPath(); g.arc(x, y, 8, 0, 6.283); g.fillStyle = row ? '#8e2626' : '#a8302a'; g.fill(); g.beginPath(); g.arc(x, y, 4, 0, 6.283); g.fillStyle = '#c7954a'; g.fill(); if (i % 6 === 0 && row === 1) { g.strokeStyle = '#5a3a22'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 30); g.stroke(); g.fillStyle = '#c43d3d'; g.fillRect(x, y - 30, 16, 10); } } }
  } else if (kind === 'ubw') {
    var ug = g.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, Math.max(W, H) * 0.7); ug.addColorStop(0, '#7d4e33'); ug.addColorStop(1, '#4a2a1c'); g.fillStyle = ug; g.fillRect(0, 0, W, H);
    marbleNoise(60, 5).forEach(function (q) { g.strokeStyle = 'rgba(30,12,6,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0] + 40 * Math.cos(q[2] * 6.28), q[1] + 40 * Math.sin(q[2] * 6.28)); g.lineTo(q[0] + 70 * Math.cos(q[2] * 6.28 + 0.6), q[1] + 70 * Math.sin(q[2] * 6.28 + 0.6)); g.stroke(); });
    g.save(); g.globalAlpha = al * 0.12; g.strokeStyle = '#ffcf7a'; g.lineWidth = 10; [[W * 0.25, H * 0.3, 220], [W * 0.75, H * 0.7, 300], [W * 0.8, H * 0.15, 160]].forEach(function (c, ci) { g.save(); g.translate(c[0], c[1]); g.rotate(G.time * (ci % 2 ? -0.1 : 0.12)); g.beginPath(); g.arc(0, 0, c[2], 0, 6.283); g.stroke(); for (var t2 = 0; t2 < 16; t2++) { g.save(); g.rotate(t2 * 0.3927); g.fillStyle = '#ffcf7a'; g.fillRect(c[2] - 6, -12, 34, 24); g.restore(); } g.restore(); }); g.restore();
    marbleNoise(170, 9).forEach(function (q) { var x = q[0], y = q[1], tilt = (q[2] - 0.5) * 0.6; g.save(); g.translate(x, y); g.rotate(tilt); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(2, -2, 10, 6); g.strokeStyle = '#0b121a'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -34); g.stroke(); g.strokeStyle = q[2] < 0.3 ? '#9aa3ad' : '#c9d0d6'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -34); g.stroke(); g.strokeStyle = q[2] < 0.5 ? '#7a1f2a' : '#4a3a2a'; g.lineWidth = 4; g.beginPath(); g.moveTo(-8, -34); g.lineTo(8, -34); g.stroke(); g.restore(); });
    if (Math.random() < 0.8) parts.push({ x: MOX + Math.random() * W, y: MOY + Math.random() * H, vx: (Math.random() - 0.5) * 20, vy: -30 - Math.random() * 40, t: 0, life: 1.2, col: Math.random() < 0.5 ? '#ffb347' : '#ff7a3a' });
  }
  g.restore();
}
var MOX = 0, MOY = 0;
function visL(o) { if (INTRO && o.def && !o.def.isMaster && !INTRO.shown) return false; if (o.def && o.cnc && G.f[MEI] && o.team !== G.f[MEI].team && !knowsExact(G.f[MEI], o)) return false; if (MAP.cityW && G.f[MEI] && !sameZone(o.def ? o : (o.owner || o), G.f[MEI])) return false; return G.mode !== 'war' || !G.marble || !!o.inM === !!G.f[MEI].inM; }
function drawWorld() {
  var g = ctx, mb = G.marble, mal = mb ? Math.min(1, mb.t / 0.9) : 0;
  var vz = VIEW.zoom || 1, vr = { x0: VIEW.cx - VW / 2 / vz - 150, y0: VIEW.cy - VH / 2 / vz - 150, x1: VIEW.cx + VW / 2 / vz + 150, y1: VIEW.cy + VH / 2 / vz + 150 }; VIEWR = vr;
  var warM = mb && G.mode === 'war', pin = warM && !!G.f[MEI].inM;
  if (warM) {
    if (!pin || mal < 1) { mb = null; drawFloor(g, MAP); if (!mb) { MAP.b.forEach(function (b, i) { if (b.x + b.w / 2 > vr.x0 && b.x - b.w / 2 < vr.x1 && b.y + b.h / 2 > vr.y0 && b.y - b.h / 2 < vr.y1) drawBlock(g, b, i); }); PILLARS.forEach(function (p) { if (!p.h && p.x + p.r > vr.x0 && p.x - p.r < vr.x1 && p.y + p.r > vr.y0 && p.y - p.r < vr.y1) drawObs(g, p); }); }
      mb = G.marble; }
    zoneMask(g); VIEWR = null;
    if (pin) {
      g.save(); g.globalAlpha = mal; g.fillStyle = '#05070a'; g.fillRect(vr.x0 - 400, vr.y0 - 400, vr.x1 - vr.x0 + 800, vr.y1 - vr.y0 + 800); g.globalAlpha = 1;
      g.beginPath(); g.arc(mb.cx, mb.cy, mb.R, 0, 6.283); g.clip();
      var sW = W, sH = H; g.translate(mb.cx - mb.R, mb.cy - mb.R); W = H = mb.R * 2; MOX = mb.cx - mb.R; MOY = mb.cy - mb.R;
      try { drawMarble(g, mb.kind, mal); } finally { W = sW; H = sH; MOX = 0; MOY = 0; }
      g.restore();
      var left = Math.max(0, mb.life - mb.t); g.beginPath(); g.arc(mb.cx, mb.cy, mb.R, 0, 6.283); g.strokeStyle = mb.kind === 'ubw' ? 'rgba(255,150,70,.7)' : 'rgba(255,226,160,.7)'; g.lineWidth = 10; g.stroke();
      g.beginPath(); g.arc(mb.cx, mb.cy, mb.R + 14, -Math.PI / 2, -Math.PI / 2 + 6.283 * left / mb.life); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 5; g.stroke();
    } else {
      var pulse = 0.5 + 0.5 * Math.sin(G.time * 3); g.save(); g.beginPath(); g.arc(mb.cx, mb.cy, MARBLE_PULL, 0, 6.283); g.fillStyle = mb.kind === 'ubw' ? 'rgba(255,120,50,' + (0.08 + 0.05 * pulse) + ')' : 'rgba(255,220,140,' + (0.08 + 0.05 * pulse) + ')'; g.fill();
      g.setLineDash([24, 16]); g.lineDashOffset = -G.time * 40; g.strokeStyle = mb.kind === 'ubw' ? 'rgba(255,140,70,.8)' : 'rgba(255,226,160,.8)'; g.lineWidth = 6; g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(255,240,220,.8)'; g.font = '700 30px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillText((mb.kind === 'ubw' ? 'UNLIMITED BLADE WORKS' : 'IONIOI HETAIROI') + ' \u00B7 ' + Math.ceil(Math.max(0, mb.life - mb.t)) + 's', mb.cx, mb.cy - MARBLE_PULL - 16); g.restore();
    }
  } else {
  if (!mb || mal < 1) { drawFloor(g, MAP); if (!mb) { MAP.b.forEach(function (b, i) { if (b.x + b.w / 2 > vr.x0 && b.x - b.w / 2 < vr.x1 && b.y + b.h / 2 > vr.y0 && b.y - b.h / 2 < vr.y1) drawBlock(g, b, i); }); PILLARS.forEach(function (p) { if (!p.h && p.x + p.r > vr.x0 && p.x - p.r < vr.x1 && p.y + p.r > vr.y0 && p.y - p.r < vr.y1) drawObs(g, p); }); } }
  zoneMask(g); VIEWR = null;
  if (mb) drawMarble(g, mb.kind, mal);
  }
  g.strokeStyle = '#5a7388'; g.lineWidth = 8; g.strokeRect(0, 0, W, H);
  G.zones.forEach(function (z) {
    if (!visL(z.owner)) return;
    var p = clamp(z.t / z.delay, 0, 1), zs = z.a.zshape || 'arrow', zc = (zs === 'flame' || zs === 'pillar') ? '255,140,60' : zs === 'excal' ? '255,210,110' : rgbOf(z.owner.def.col);
    g.beginPath(); g.arc(z.x, z.y, z.r, 0, 6.283); g.fillStyle = z.done ? 'rgba(' + zc + ',.5)' : 'rgba(' + zc + ',' + (0.08 + 0.2 * p) + ')'; g.fill();
    g.strokeStyle = 'rgba(' + zc + ',.9)'; g.lineWidth = 2; g.stroke();
    if (!z.done) {
      g.beginPath(); g.arc(z.x, z.y, z.r * p, 0, 6.283); g.strokeStyle = 'rgba(' + zc + ',.6)'; g.stroke();
      if (zs === 'arrow' && p > 0.2) { var hx = z.x + (1 - p) * 110, hy = z.y - (1 - p) * 320; g.strokeStyle = '#e9e4d3'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx + 18, hy - 56); g.lineTo(hx, hy); g.stroke(); g.fillStyle = '#e9e4d3'; g.beginPath(); g.arc(hx, hy, 3.5, 0, 6.283); g.fill(); }
      if (zs === 'sword' && p > 0.15) { var hy2 = z.y - (1 - p) * 300; g.strokeStyle = '#d8dde2'; g.lineWidth = 4; g.beginPath(); g.moveTo(z.x, hy2 - 40); g.lineTo(z.x, hy2); g.stroke(); g.strokeStyle = '#7a1f2a'; g.lineWidth = 5; g.beginPath(); g.moveTo(z.x - 9, hy2 - 40); g.lineTo(z.x + 9, hy2 - 40); g.stroke(); }
      if (zs === 'excal') runeCircle(g, z.x, z.y, z.r * (0.6 + 0.35 * p), '#ffd36b', G.time * 2, 0.4 + 0.5 * p);
      if (zs === 'pillar') runeCircle(g, z.x, z.y, z.r * (0.5 + 0.45 * p), '#ff8a3a', G.time * 3, 0.4 + 0.5 * p);
      if (zs === 'flame' || zs === 'pillar') { for (var fi = 0; fi < 6; fi++) { var fa = fi * 1.047 + G.time * 3, fr = z.r * 0.55 * p; g.beginPath(); g.arc(z.x + Math.cos(fa) * fr, z.y + Math.sin(fa) * fr, 6 + 6 * p, 0, 6.283); g.fillStyle = 'rgba(255,' + Math.round(150 + 60 * Math.sin(G.time * 9 + fi)) + ',60,' + (0.4 + 0.4 * p) + ')'; g.fill(); } g.beginPath(); g.moveTo(z.x - 14, z.y + 10); g.lineTo(z.x + 14, z.y - 10); g.moveTo(z.x + 14, z.y + 10); g.lineTo(z.x - 14, z.y - 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 3; g.stroke(); }
      if (zs === 'tentacle') { g.strokeStyle = 'rgba(' + zc + ',.9)'; g.lineCap = 'round'; for (var ti = 0; ti < 4; ti++) { var ta = ti * 1.571 + G.time * 1.5, tl = z.r * 0.6 * p; g.lineWidth = 7 * p + 2; g.beginPath(); g.moveTo(z.x, z.y); g.quadraticCurveTo(z.x + Math.cos(ta) * tl * 0.5 + Math.sin(G.time * 7 + ti) * 6, z.y + Math.sin(ta) * tl * 0.5, z.x + Math.cos(ta) * tl, z.y + Math.sin(ta) * tl); g.stroke(); } }
    } else if (zs === 'tentacle') { g.strokeStyle = 'rgba(' + zc + ',.95)'; g.lineCap = 'round'; g.lineWidth = 12; for (var tj = 0; tj < 4; tj++) { var tb = tj * 1.571 + 0.4; g.beginPath(); g.moveTo(z.x, z.y); g.lineTo(z.x + Math.cos(tb) * z.r * 0.7, z.y + Math.sin(tb) * z.r * 0.7); g.stroke(); } }
    else if (zs === 'flame') { g.beginPath(); g.arc(z.x, z.y, z.r * 0.8, 0, 6.283); g.fillStyle = 'rgba(255,140,50,.55)'; g.fill(); }
  });
  ghosts.forEach(function (gh) { var I = IMG[gh.id].body; if (!weaponOK(I)) return; g.save(); g.globalAlpha = 0.4 * (1 - gh.t / gh.life); g.translate(gh.x, gh.y); g.rotate(gh.face); g.drawImage(I.im, I.x, I.y, I.w, I.h); g.restore(); });
  puffs.forEach(function (p) { var pp = p.t / p.life; g.beginPath(); g.arc(p.x, p.y, p.r * (1 + 1.8 * pp), 0, 6.283); g.fillStyle = 'rgba(' + p.rgb + ',' + (0.45 * (1 - pp)) + ')'; g.fill(); });
  drawCivs(g); drawMobs(g); drawShadow(g); G.f.forEach(function (f) { if (visL(f)) drawRampAura(g, f); });
  drawGroundFx(g);
  G.f.forEach(function (f, i, ar) { if (visL(f)) drawField(f, i, ar); });
  G.f.forEach(function (f, i, ar) { if (visL(f)) drawTelegraph(f, i, ar); });
  // a fighter frozen by their own hit-stop shudders in place when they are the one hit
  G.f.forEach(function (f, i, ar) {
    if (!visL(f)) return; var sh = f.hs > 0 && f.hit > 0, X = fighterXform(f);
    ctx.save(); ctx.translate(f.x + X.ox + (sh ? (Math.random() - 0.5) * 6 : 0), f.y + X.oy + (sh ? (Math.random() - 0.5) * 6 : 0));
    ctx.rotate(X.ax); ctx.scale(X.sx, X.sy); ctx.rotate(-X.ax + X.rot); ctx.translate(-f.x, -f.y);
    var ra = f.resc ? rescueAlpha(f) : 1; if (ra < 1) { ctx.globalAlpha = ra; ctx.translate(f.x, f.y); ctx.translate(0, -(1 - ra) * 26); ctx.translate(-f.x, -f.y); }
    drawFighter(f, i, ar); drawFighterFx(ctx, f);
    if (f.resc) { ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'lighter'; var rg = ctx.createRadialGradient(f.x, f.y, 4, f.x, f.y, 52); rg.addColorStop(0, 'rgba(255,60,80,' + (0.55 * Math.max(0.3, ra)) + ')'); rg.addColorStop(1, 'rgba(255,40,60,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(f.x, f.y, 52, 0, 6.283); ctx.fill(); }
    ctx.restore();
  });
  drawRescues(g);
  G.proj.forEach(function (p) { if (!visL(p.owner)) return; var a = Math.atan2(p.vy, p.vx); if (drawProjX(g, p, a)) return; var gld = p.owner.def.id === 'caerwyn' && p.a.key === 'np'; if (p.a.beam) { g.save(); g.translate(p.x, p.y); g.rotate(a); var bl = g.createLinearGradient(-170, 0, 0, 0); bl.addColorStop(0, gld ? 'rgba(255,200,80,0)' : 'rgba(255,255,255,0)'); bl.addColorStop(1, gld ? 'rgba(255,236,170,.95)' : 'rgba(255,255,255,.95)'); var bs = p.a.bw || 1; g.fillStyle = bl; g.fillRect(-170 * bs, -26 * bs, 170 * bs, 52 * bs); g.restore(); return; }
    if (p.a.shape === 'spear') { g.save(); g.translate(p.x, p.y); g.rotate(a); var sg = g.createLinearGradient(-160, 0, 0, 0); sg.addColorStop(0, 'rgba(220,40,50,0)'); sg.addColorStop(1, 'rgba(220,40,50,.7)'); g.fillStyle = sg; g.fillRect(-160, -7, 160, 14); g.shadowColor = '#ff3040'; g.shadowBlur = 16; g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.fillStyle = '#7a1a1a'; g.fillRect(-70, -2.5, 72, 5); g.strokeRect(-70, -2.5, 72, 5); g.fillStyle = '#c33a30'; g.beginPath(); g.moveTo(2, -6); g.lineTo(26, 0); g.lineTo(2, 6); g.lineTo(8, 0); g.closePath(); g.fill(); g.stroke(); g.restore(); return; }
    if (p.a.shape === 'drill') { g.save(); g.translate(p.x, p.y); g.rotate(a); for (var dk = 0; dk < 6; dk++) { g.beginPath(); g.arc(-18 - dk * 16, Math.sin(G.time * 40 + dk) * 5, 5 - dk * 0.6, 0, 6.283); g.fillStyle = 'rgba(160,210,255,' + (0.5 - dk * 0.07) + ')'; g.fill(); } g.shadowColor = '#9fd4ff'; g.shadowBlur = 18; g.fillStyle = '#e6f4ff'; g.strokeStyle = '#0b121a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(22, 0); g.lineTo(-14, -6); g.lineTo(-8, 0); g.lineTo(-14, 6); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = 'rgba(90,140,200,.8)'; g.beginPath(); g.moveTo(16, -1); g.lineTo(-6, 3); g.moveTo(8, -3); g.lineTo(-10, 1); g.stroke(); g.restore(); return; }
    if (p.a.shape === 'tracer') { g.save(); g.translate(p.x, p.y); g.rotate(a); g.shadowColor = '#ffd36b'; g.shadowBlur = 8; g.strokeStyle = '#ffe08a'; g.lineWidth = 2.8; g.lineCap = 'round'; g.beginPath(); g.moveTo(-18, 0); g.lineTo(2, 0); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-8, 0); g.lineTo(2, 0); g.stroke(); g.restore(); return; }
    if (p.a.shape === 'rondel') { chainLine(p.owner.x, p.owner.y, p.x, p.y); g.save(); g.translate(p.x, p.y); g.rotate(a); g.strokeStyle = '#0b121a'; g.lineWidth = 1.8; g.fillStyle = '#8c95a0'; g.beginPath(); g.arc(-6, 0, 6, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#f4f7fa'; g.beginPath(); g.moveTo(-2, -3); g.lineTo(30, 0); g.lineTo(-2, 3); g.closePath(); g.fill(); g.stroke(); g.restore(); return; }
    if (p.a.shape === 'orb') { g.save(); g.translate(p.x, p.y); var oc = p.a.col || p.owner.def.col, os = p.a.size || 8; g.globalAlpha = 0.35; g.beginPath(); g.arc(-os * 1.7, 0, os * 1.1, 0, 6.283); g.fillStyle = oc; g.fill(); g.globalAlpha = 1; g.beginPath(); g.arc(0, 0, os, 0, 6.283); g.fillStyle = oc; g.shadowColor = oc; g.shadowBlur = 14 + os; g.fill(); g.shadowBlur = 0; g.beginPath(); g.arc(0, 0, os * 0.42, 0, 6.283); g.fillStyle = '#ffffff'; g.fill(); g.restore(); return; }
    if (p.a.shape === 'blade') { g.save(); g.translate(p.x, p.y); g.rotate(a); g.shadowColor = p.owner.def.col; g.shadowBlur = 10; g.fillStyle = '#f3f8fb'; g.strokeStyle = '#0b121a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(16, 0); g.lineTo(-8, -4); g.lineTo(-12, 0); g.lineTo(-8, 4); g.closePath(); g.fill(); g.stroke(); g.shadowBlur = 0; g.fillStyle = p.owner.def.col; g.fillRect(-14, -6, 4, 12); g.globalAlpha = 0.3; g.fillStyle = p.owner.def.col; g.fillRect(-46, -2, 34, 4); g.restore(); return; }
    if (p.a.wave) { g.save(); g.translate(p.x, p.y); g.rotate(a); for (var tr = 3; tr >= 0; tr--) { g.globalAlpha = 0.16 * (4 - tr); g.beginPath(); g.arc(-26 - tr * 30, 0, 42, -0.95, 0.95); g.strokeStyle = gld ? '#ffd36b' : '#dfeaf4'; g.lineWidth = 12 - tr * 2; g.lineCap = 'round'; g.stroke(); } g.globalAlpha = 0.55; g.beginPath(); g.arc(-8, 0, 44, -1.05, 1.05); g.strokeStyle = gld ? '#ffd36b' : '#dfeaf4'; g.lineWidth = 20; g.stroke(); g.globalAlpha = 1; g.beginPath(); g.arc(-8, 0, 44, -1.0, 1.0); g.strokeStyle = gld ? '#fff2c4' : '#ffffff'; g.lineWidth = 7; g.stroke(); g.restore(); return; } g.save(); g.translate(p.x, p.y); g.rotate(a); g.strokeStyle = '#e9e4d3'; g.lineWidth = 3; g.beginPath(); g.moveTo(-22, 0); g.lineTo(6, 0); g.stroke(); g.fillStyle = '#e9e4d3'; g.beginPath(); g.moveTo(6, -4); g.lineTo(14, 0); g.lineTo(6, 4); g.fill(); g.restore(); });
  drawOverhead(g); drawEventsOver(g);
  V.forEach(function (v) { g.save(); v.draw(g, clamp(v.t / v.life, 0, 1), v.t); g.restore(); });
  parts.forEach(function (p) { g.globalAlpha = clamp(1 - p.t / p.life, 0, 1); g.fillStyle = p.col; g.fillRect(p.x - 2, p.y - 2, 4, 4); }); g.globalAlpha = 1;
  texts.forEach(function (t) { g.globalAlpha = clamp(1 - t.t / 0.9, 0, 1); g.fillStyle = t.col; g.font = (t.big ? '700 20px' : '700 16px') + ' "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillText(t.s, t.x, t.y - t.t * 40); }); g.globalAlpha = 1;
}
var SAFE = { top: 80, topR: 50, bottom: 200 }, safeAt = 0;
function measureSafe() {
  var now = performance.now(); if (now - safeAt < 400) return; safeAt = now;
  var cr = cv.getBoundingClientRect(), h = $('#hud').getBoundingClientRect(), tp = document.querySelector('#duel .top').getBoundingClientRect(), pd = document.querySelector('#duel .pad').getBoundingClientRect(), mi = document.querySelector('#duel .minis').getBoundingClientRect();
  SAFE.top = Math.max(h.bottom, tp.bottom) - cr.top; SAFE.topR = tp.bottom - cr.top + 8; SAFE.bottom = cr.bottom - Math.min(pd.top + 30, mi.top);
}
function draw() {
  measureSafe();
  var dpr = Math.min(window.devicePixelRatio || 1, 2), cw = cv.clientWidth;
  var chh = cv.clientHeight || Math.round(cw * 0.625); VW = Math.max(1, cw); VH = Math.max(1, chh);
  if (cv.width !== Math.round(VW * dpr) || cv.height !== Math.round(VH * dpr)) { cv.width = Math.round(VW * dpr); cv.height = Math.round(VH * dpr); }
  var k = cv.width / VW; ctx.setTransform(k, 0, 0, k, 0, 0);
  var a = G.f[MEI], b = aimFoe(a) || (G.mode === 'war' ? a : G.f[1]), dd = Math.max(1, dist(a, b)), wb = a.st === 'dead' ? 1 : Math.min(G.mode === 'war' ? 0.3 : 0.38, (G.mode === 'war' ? 200 : 260) / dd), tx = a.x + (b.x - a.x) * wb, ty = a.y + (b.y - a.y) * wb;
  if (INTRO) { tx = INTRO.c.x; ty = INTRO.c.y + 20; }
  cam.x += (tx - cam.x) * 0.14; cam.y += (ty - cam.y) * 0.14;
  var zoom = clamp(Math.min(VW, VH) / (G.mode === 'war' ? 900 : 640), 0.55, 1.4), np = G.f.filter(function (f) { return f.key === 'np' && (f.st === 'act'); })[0]; if (np) zoom *= 1.12; if (INTRO) zoom *= 1.35;
  var cx = clamp(cam.x, VW / 2 / zoom, W - VW / 2 / zoom), cy = clamp(cam.y, VH / 2 / zoom, H - VH / 2 / zoom); VIEW.cx = cx; VIEW.cy = cy; VIEW.zoom = zoom;
  var sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;
  ctx.fillStyle = '#0b141d'; ctx.fillRect(0, 0, VW, VH);
  ctx.save(); ctx.translate(VW / 2 + sx, VH / 2 + sy); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy);
  drawWorld();
  if (G.dimT > 0) { /* spotlight on the caster */ }
  ctx.restore();
  drawNight(cx, cy, zoom);
  if (G.dimT > 0) { var gr = ctx.createRadialGradient(VW / 2, VH / 2, 120, VW / 2, VH / 2, 460); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,' + Math.min(0.6, G.dimT * 0.8) + ')'); ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH); }
  if (G.dimT > 0) { var cc = G.f.filter(function (f) { return f.key === 'np' && (f.st === 'wind' || f.st === 'act'); })[0]; if (cc) { ctx.globalAlpha = 0.1; ctx.fillStyle = cc.def.col; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = 1; } }
  flashes.forEach(function (fl) { ctx.globalAlpha = fl.a * (1 - fl.t / fl.life); ctx.fillStyle = fl.col; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = 1; });
  cracks.forEach(function (ck) {
    var px = (ck.x - cx) * zoom + VW / 2, py = (ck.y - cy) * zoom + VH / 2, fade = ck.t < ck.life - 0.5 ? 1 : (ck.life - ck.t) / 0.5, grow = Math.min(1, ck.t / 0.08);
    ctx.save(); ctx.translate(px, py); ctx.globalAlpha = clamp(fade, 0, 1); ctx.lineJoin = 'miter';
    ck.lines.forEach(function (ln) {
      var n = Math.max(2, Math.ceil(ln.length * grow));
      ctx.beginPath(); ctx.moveTo(ln[0][0], ln[0][1]); for (var i = 1; i < n; i++) ctx.lineTo(ln[i][0], ln[i][1]);
      ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 4; ctx.stroke(); ctx.strokeStyle = 'rgba(255,240,240,.9)'; ctx.lineWidth = 1.4; ctx.stroke();
    });
    ck.rings.forEach(function (rr) { ctx.beginPath(); for (var i = 0; i <= rr.n; i++) { var aa = i / rr.n * 6.283, q = rr.r * (0.9 + 0.2 * Math.sin(i * 7.3 + rr.r)); if (i === 0) ctx.moveTo(Math.cos(aa) * q, Math.sin(aa) * q); else ctx.lineTo(Math.cos(aa) * q, Math.sin(aa) * q); } ctx.strokeStyle = 'rgba(255,230,230,.55)'; ctx.lineWidth = 1.2; ctx.stroke(); });
    ctx.restore(); ctx.globalAlpha = 1;
  });
  if (a.hp < a.def.hp * 0.3 && a.st !== 'dead') { var lv = 0.25 + 0.15 * Math.sin(G.time * 6), vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VW * 0.62); vg.addColorStop(0, 'rgba(180,20,30,0)'); vg.addColorStop(1, 'rgba(180,20,30,' + lv + ')'); ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH); }
  if (band.t > 0) drawBanner();
  drawBubbles(cx, cy, zoom);
  if (INTRO) { drawIntro(); return; }
  // off-screen foe pointer
  var f0 = G.f[MEI], f1 = aimFoe(f0) || f0, sxp = (f1.x - cx) * zoom + VW / 2, syp = (f1.y - cy) * zoom + VH / 2;
  if ((sxp < 20 || sxp > VW - 20 || syp < 20 || syp > VH - 20) && f1 !== f0 && knowsExact(f0, f1)) {
    var ang = Math.atan2(f1.y - f0.y, f1.x - f0.x), px = clamp(sxp, 24, VW - 24), py = clamp(syp, SAFE.top + 16, Math.max(SAFE.top + 40, VH - SAFE.bottom - 16));
    ctx.save(); ctx.translate(px, py); ctx.rotate(ang); ctx.fillStyle = '#e2515c'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, -9); ctx.lineTo(-8, 9); ctx.fill(); ctx.restore();
  }
  drawDayArrow(cx, cy, zoom);
  // minimap (the city only, never the interiors strip)
  var MW = MAP.cityW || W;
  var my0 = SAFE.topR, mw = Math.max(70, Math.min(clamp(VW * 0.18, VW < 560 ? 112 : 120, 240), (VH - SAFE.bottom - my0 - 10) * MW / H)), mh = mw * H / MW, mx0 = VW - mw - 10;
  ctx.fillStyle = 'rgba(8,14,20,.7)'; ctx.fillRect(mx0, my0, mw, mh); ctx.strokeStyle = '#2a4157'; ctx.lineWidth = 1; ctx.strokeRect(mx0, my0, mw, mh);
  if (!G.marble || (G.mode === 'war' && !G.f[MEI].inM)) { var mm = miniMap(mw, mh); ctx.drawImage(mm, mx0, my0, mw, mh); }
  if (G.marble && G.mode === 'war') { ctx.beginPath(); ctx.arc(mx0 + G.marble.cx / MW * mw, my0 + G.marble.cy / H * mh, (G.f[MEI].inM ? G.marble.R : MARBLE_PULL) / MW * mw, 0, 6.283); ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1; ctx.strokeRect(mx0 + (cx - VW / 2 / zoom) / MW * mw, my0 + (cy - VH / 2 / zoom) / H * mh, VW / zoom / MW * mw, VH / zoom / H * mh);
  if (G.homes) G.homes.forEach(function (hm) { var tf = G.f.find(function (f) { return f.team === hm.team; }); ctx.fillStyle = tf ? teamCol(tf) : '#fff'; ctx.globalAlpha = 0.85; ctx.fillRect(mx0 + hm.x / MW * mw - 3, my0 + hm.y / H * mh - 3, 6, 6); ctx.globalAlpha = 1; ctx.strokeStyle = '#0b121a'; ctx.lineWidth = 1; ctx.strokeRect(mx0 + hm.x / MW * mw - 3, my0 + hm.y / H * mh - 3, 6, 6); });
  drawRumors(mx0, my0, mw, mh, MW);
  G.f.forEach(function (f) { if (f.st === 'dead' || !visL(f) || (MAP.cityW && f.x > MAP.cityW) || !knowsExact(f0, f)) return; ctx.beginPath(); ctx.arc(mx0 + f.x / MW * mw, my0 + f.y / H * mh, 3.5, 0, 6.283); ctx.fillStyle = teamCol(f); ctx.fill(); if (f === f0) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke(); } });
  drawClockHud(mx0, my0, mw, mh);
}

// the announcement plate: compact, under the health bars and clear of the minimap, its text wrapped to fit
function wrapText(c, s, w) { var words = s.split(' '), lines = [], cur = ''; words.forEach(function (wd) { var t = cur ? cur + ' ' + wd : wd; if (c.measureText(t).width > w && cur) { lines.push(cur); cur = wd; } else cur = t; }); if (cur) lines.push(cur); return lines; }
function drawBanner() {
  var D = band.d || 2, bp = 1 - band.t / D, bs = bp < 0.08 ? bp / 0.08 : bp > 0.85 ? (1 - bp) / 0.15 : 1, small = VW < 700 || VH < 520;
  var mmL = VW - Math.max(120, Math.min(240, VW * 0.18)) - 20, side = VH < 520 && G && G.clock, areaW = side ? Math.max(220, mmL - 262) : Math.min(small ? mmL - 16 : 640, VW - 32), cxp = side ? 12 + areaW / 2 : small ? Math.max(areaW / 2 + 12, mmL / 2) : VW / 2; // on short screens the clock column sits left of the minimap: the plate takes the space before it
  var c = ctx, tf = small ? 19 : 25, sf = small ? 12.5 : 15;
  c.save(); c.globalAlpha = clamp(bs, 0, 1);
  c.font = '400 ' + tf + 'px "Marcellus SC", "Times New Roman", serif'; while (c.measureText(band.text).width > areaW - 28 && tf > 14) { tf -= 1; c.font = '400 ' + tf + 'px "Marcellus SC", "Times New Roman", serif'; }
  c.font = 'italic 400 ' + sf + 'px "Times New Roman", serif'; var lines = band.sub ? wrapText(c, band.sub, areaW - 32).slice(0, small ? 2 : 3) : [];
  var h = tf + 18 + lines.length * (sf + 4), y0 = SAFE.top + 8 + (1 - bs) * -10, x0 = cxp - areaW / 2;
  c.fillStyle = 'rgba(6,10,16,.78)'; if (c.roundRect) { c.beginPath(); c.roundRect(x0, y0, areaW, h, 8); c.fill(); } else c.fillRect(x0, y0, areaW, h);
  c.fillStyle = band.col; c.fillRect(x0 + 10, y0, areaW - 20, 2);
  c.textAlign = 'center'; c.fillStyle = '#e9e4d3'; c.shadowColor = band.col; c.shadowBlur = 8; c.font = '400 ' + tf + 'px "Marcellus SC", "Times New Roman", serif'; c.fillText(band.text, cxp, y0 + tf + 6); c.shadowBlur = 0;
  c.fillStyle = band.col; c.font = 'italic 400 ' + sf + 'px "Times New Roman", serif'; lines.forEach(function (L, i) { c.fillText(L, cxp, y0 + tf + 12 + (i + 1) * (sf + 4)); });
  c.restore();
}
