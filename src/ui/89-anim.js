/* ---- the animation pass: every fighter walks, leans, winds up, recoils, staggers and falls; servants dissolve
   into motes of light when they die. Signature looks: Illya's wire birds, Sakura's shadow, Rin's jewels,
   Kirei's Black Keys, Kariya's worms, Kiritsugu's muzzle flash, Arthur's Strike Air and golden Excalibur. ---- */
var ANIM = {};
function animOf(f) { return ANIM[f.idx] || (ANIM[f.idx] = { px: f.x, py: f.y, spd: 0, ph: f.idx * 1.3, mx: 0, my: 0, lt: performance.now(), dustT: 0 }); }
function fighterXform(f) {
  var A = animOf(f), now = performance.now(), dt = Math.min(0.1, Math.max(0.001, (now - A.lt) / 1000)); A.lt = now;
  var dx = f.x - A.px, dy = f.y - A.py, inst = Math.hypot(dx, dy) / dt; A.px = f.x; A.py = f.y;
  if (inst > 2000) inst = 0; // a door or a teleport
  A.spd += (inst - A.spd) * Math.min(1, dt * 10); if (inst > 5) { A.mx = dx / (Math.hypot(dx, dy) || 1); A.my = dy / (Math.hypot(dx, dy) || 1); }
  var X = { ox: 0, oy: 0, rot: 0, sx: 1, sy: 1, ax: f.face };
  if (f.st === 'dead') {
    var dt2 = f.t || 0;
    if (f.def.isMaster) { X.rot = Math.min(1, dt2 / 0.45) * 1.1; X.sx = X.sy = 1 - Math.min(1, dt2 / 0.45) * 0.08; }
    else { var k = Math.min(1, dt2 / 1.1); X.sx = X.sy = 1 - 0.45 * k; if (dt2 < 1.1 && Math.random() < 0.9 && FX.near(f.x, f.y)) for (var m = 0; m < 2; m++) parts.push({ x: f.x + (Math.random() - 0.5) * 40, y: f.y + (Math.random() - 0.5) * 40, vx: (Math.random() - 0.5) * 30, vy: -60 - Math.random() * 90, t: 0, life: 0.9, col: Math.random() < 0.6 ? '#ffe9a0' : rgbStr(f.def.col) }); }
    return X;
  }
  var mv = Math.min(1, A.spd / 220), spirit = f.spirit === 2;
  // walking: a rhythm of sway and bob, and a lean into the direction of travel
  if (A.spd > 30 && !spirit) { A.ph += dt * A.spd * 0.034; X.rot += Math.sin(A.ph) * 0.07 * mv; X.sx += Math.abs(Math.sin(A.ph)) * 0.035 * mv; X.ox += A.mx * 2.5 * mv; X.oy += A.my * 2.5 * mv; }
  if (spirit) { X.oy += Math.sin(now / 300 + f.idx) * 3; }
  // footfalls kick up a little dust when running hard
  if (A.spd > 190 && !spirit && f.st !== 'dodge') { A.dustT -= dt; if (A.dustT <= 0 && FX.near(f.x, f.y)) { A.dustT = 0.22; puffs.push({ x: f.x - A.mx * 14, y: f.y - A.my * 14 + 6, vx: -A.mx * 20, vy: -A.my * 20, r: 6 + Math.random() * 3, t: 0, life: 0.45, rgb: '150,140,120', a: 0.25 }); } }
  var a = f.act, c = Math.cos(f.face), s = Math.sin(f.face);
  // attacks: draw back on the wind-up, lunge and stretch on the strike, settle on recovery
  if (f.st === 'wind' && a) { var p = clamp(f.t / (f.windTotal || f.curWind || 0.3), 0, 1); X.ox -= c * 5 * p; X.oy -= s * 5 * p; X.sy *= 1 + 0.04 * p; X.sx *= 1 - 0.03 * p; if (f.key === 'np') X.rot += Math.sin(now / 40) * 0.03 * p; }
  else if (f.st === 'act' && a) { var q = clamp(f.t / Math.max(a.act, 0.05), 0, 1); X.ox += c * 7 * (1 - q); X.oy += s * 7 * (1 - q); X.sx *= 1 + 0.09 * (1 - q); X.sy *= 1 - 0.05 * (1 - q); }
  else if (f.st === 'rec' && a) { var r = clamp(f.t / Math.max(f.recDur || 0.3, 0.05), 0, 1); X.ox += c * 3 * (1 - r); X.oy += s * 3 * (1 - r); }
  // dodges stretch along the roll
  if (f.st === 'dodge') { X.ax = Math.atan2(A.my, A.mx); X.sx *= 1.14; X.sy *= 0.88; }
  // hit: knocked back from the blow; staggered: a groggy wobble
  if (f.hit > 0) { var by = f.lastHit && f.lastHit.by, ha = by ? Math.atan2(f.y - by.y, f.x - by.x) : f.face + Math.PI, hk = Math.min(1, f.hit / 0.15); X.ox += Math.cos(ha) * 6 * hk; X.oy += Math.sin(ha) * 6 * hk; X.sx *= 1 - 0.06 * hk; }
  if (f.st === 'stag') X.rot += Math.sin(now / 45) * 0.09;
  if (f.st === 'counter') X.sx *= 1.04;
  return X;
}
function rgbStr(h) { return h; }
// ground effects under the fighters: Noble Phantasm circles, Sakura's shadow
function drawGroundFx(g) {
  var t = G.time;
  G.f.forEach(function (f) {
    if (f.st === 'dead' || !visL(f)) return;
    if (f.def.id === 'sakura' && f.spirit !== 2) { g.save(); g.globalAlpha = 0.55; g.fillStyle = '#140818'; g.beginPath(); for (var i = 0; i <= 18; i++) { var an = i / 18 * 6.283, rr = 34 + 5 * Math.sin(t * 3 + i * 1.9); if (i === 0) g.moveTo(f.x + Math.cos(an) * rr, f.y + 8 + Math.sin(an) * rr * 0.6); else g.lineTo(f.x + Math.cos(an) * rr, f.y + 8 + Math.sin(an) * rr * 0.6); } g.closePath(); g.fill(); g.strokeStyle = 'rgba(200,40,70,.5)'; g.lineWidth = 1.5; g.stroke(); g.restore(); }
    if (f.key === 'np' && f.st === 'wind' && f.act) {
      var p = clamp(f.t / (f.windTotal || f.curWind || 1), 0, 1), col = f.def.id === 'caerwyn' ? '#ffd36b' : f.def.col;
      runeCircle(g, f.x, f.y, (f.def.isMaster ? 45 : 70) + 40 * p, col, t * (2 + 4 * p), 0.35 + 0.5 * p);
      if (Math.random() < 0.6) { var ra = Math.random() * 6.283, rr2 = 60 + Math.random() * 50; parts.push({ x: f.x + Math.cos(ra) * rr2, y: f.y + Math.sin(ra) * rr2, vx: -Math.cos(ra) * 60, vy: -Math.sin(ra) * 60 - 30, t: 0, life: 0.6, col: col }); }
    }
  });
}
// overlays drawn with each fighter: Illya's birds circling her, the wind wrapping back around Arthur's blade
function drawFighterFx(g, f) {
  if (f.st === 'dead') return; var t = G.time;
  if (f.def.id === 'illya' && f.spirit !== 2) for (var b = 0; b < 2; b++) { var ba = t * 2.2 + b * Math.PI, bx = f.x + Math.cos(ba) * 36, by = f.y + Math.sin(ba) * 30 - 6; drawBird(g, bx, by, ba + Math.PI / 2, 0.6, '#eef0f6', t * 18 + b); }
  if (f.def.hiddenReach && f.revealT && G.time > f.revealT && G.time < f.revealT + 0.45) {
    var k = (G.time - f.revealT) / 0.45, gp = locOf(f, 40, 8);
    g.save(); g.globalAlpha = 0.7 * (1 - k); g.strokeStyle = '#eef4f8'; g.lineWidth = 2.5; g.lineCap = 'round';
    for (var w = 0; w < 4; w++) { var st = w * 1.57 + k * 9; g.beginPath(); g.ellipse(gp.x, gp.y, 34 * (1 - k * 0.6), 12, f.face, st, st + 2.2); g.stroke(); }
    g.restore();
  }
}
function drawBird(g, x, y, ang, sc, col, ph) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(sc, sc);
  var fl = Math.sin(ph) * 0.8; g.strokeStyle = col; g.lineWidth = 2.4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-6, -10 - fl * 6, -14, -14 - fl * 10); g.moveTo(0, 0); g.quadraticCurveTo(-6, 10 + fl * 6, -14, 14 + fl * 10); g.stroke();
  g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, 9, 3.5, 0, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(9, 0); g.lineTo(14, -2); g.lineTo(14, 2); g.closePath(); g.fill();
  g.restore();
}
// projectile looks; returns true when it drew the projectile
function drawProjX(g, p, a) {
  var sh = p.a.shape, t = G.time, col = p.a.col || p.owner.def.col;
  if (sh === 'tracer' && !p._mz) { p._mz = true; var o = p.owner, mz = { x: o.x + Math.cos(o.face) * 34, y: o.y + Math.sin(o.face) * 34 }, fa = o.face; if (FX.near(o.x, o.y)) { vfx(0.07, function (gg, q) { gg.save(); gg.translate(mz.x, mz.y); gg.rotate(fa); gg.globalAlpha = 1 - q; gg.fillStyle = '#fff2a8'; gg.beginPath(); gg.moveTo(0, -6); gg.lineTo(22, 0); gg.lineTo(0, 6); gg.lineTo(6, 0); gg.closePath(); gg.fill(); gg.restore(); }); parts.push({ x: o.x + Math.cos(fa + 1.6) * 10, y: o.y + Math.sin(fa + 1.6) * 10, vx: Math.cos(fa + 1.6) * 120, vy: Math.sin(fa + 1.6) * 120, t: 0, life: 0.35, col: '#d9a73a' }); } return false; }
  if (sh === 'wind') {
    // Strike Air: a thin cone of compressed wind
    var L = Math.min(170, p.trav + 40), w = p.a.rad || 26;
    g.save(); g.translate(p.x, p.y); g.rotate(a);
    var cg = g.createLinearGradient(-L, 0, 10, 0); cg.addColorStop(0, 'rgba(238,244,248,0)'); cg.addColorStop(1, 'rgba(238,244,248,.55)');
    g.fillStyle = cg; g.beginPath(); g.moveTo(-L, 0); g.lineTo(8, -w); g.quadraticCurveTo(18, 0, 8, w); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 1.6; for (var i = 0; i < 4; i++) { var yy = (i - 1.5) * w * 0.45, off = ((t * 900 + i * 37) % L); g.beginPath(); g.moveTo(-off, yy * (1 - off / L)); g.lineTo(-off + 26, yy * (1 - (off - 26) / L)); g.stroke(); }
    g.restore(); return true;
  }
  if (sh === 'bird') { drawBird(g, p.x, p.y, a, 1.0, col, t * 25 + p.x * 0.01); g.save(); g.globalAlpha = 0.35; g.fillStyle = col; for (var tr = 1; tr <= 3; tr++) { g.beginPath(); g.arc(p.x - Math.cos(a) * tr * 10, p.y - Math.sin(a) * tr * 10, 2.2, 0, 6.283); g.fill(); } g.restore(); return true; }
  if (sh === 'worm') { g.save(); g.translate(p.x, p.y); g.rotate(a); for (var s = 0; s < 6; s++) { var wy = Math.sin(t * 22 - s * 0.9) * 4; g.fillStyle = s ? '#4a3a5a' : '#6a4a6a'; g.beginPath(); g.arc(-s * 6, wy, 5 - s * 0.5, 0, 6.283); g.fill(); } g.fillStyle = '#d04a6a'; g.beginPath(); g.arc(3, Math.sin(t * 22) * 4, 1.6, 0, 6.283); g.fill(); g.restore(); return true; }
  if (sh === 'shadow') { g.save(); g.lineCap = 'round'; for (var k = 0; k < 2; k++) { g.strokeStyle = k ? 'rgba(200,40,70,.6)' : 'rgba(20,6,24,.9)'; g.lineWidth = k ? 2 : 9; g.beginPath(); for (var j = 0; j <= 8; j++) { var px = p.x - Math.cos(a) * j * 7 + Math.cos(a + 1.57) * Math.sin(t * 16 + j) * 5, py = p.y - Math.sin(a) * j * 7 + Math.sin(a + 1.57) * Math.sin(t * 16 + j) * 5; if (j === 0) g.moveTo(px, py); else g.lineTo(px, py); } g.stroke(); } g.restore(); return true; }
  if (sh === 'gem') { var sz = p.a.size || 8; g.save(); g.translate(p.x, p.y); g.rotate(t * 10); g.fillStyle = col; g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -sz); g.lineTo(sz * 0.8, 0); g.lineTo(0, sz); g.lineTo(-sz * 0.8, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.moveTo(0, -sz); g.lineTo(sz * 0.3, -sz * 0.2); g.lineTo(-sz * 0.3, -sz * 0.2); g.closePath(); g.fill(); g.restore(); if (Math.random() < 0.5) parts.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, t: 0, life: 0.3, col: col }); return true; }
  if (sh === 'key') { g.save(); g.translate(p.x, p.y); g.rotate(a); g.fillStyle = '#dfe6ea'; g.strokeStyle = '#0b121a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-26, -1.8); g.lineTo(12, -1.2); g.lineTo(18, 0); g.lineTo(12, 1.2); g.lineTo(-26, 1.8); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#16181c'; g.fillRect(-30, -5, 4, 10); g.fillRect(-36, -2, 8, 4); g.restore(); return true; }
  if (sh === 'needle') { g.save(); g.translate(p.x, p.y); g.rotate(a); g.strokeStyle = '#d8dde2'; g.lineWidth = 2; g.beginPath(); g.moveTo(-18, 0); g.lineTo(8, 0); g.stroke(); g.fillStyle = '#eef2f6'; g.beginPath(); g.arc(-18, 0, 3, 0, 6.283); g.fill(); g.restore(); return true; }
  return false;
}
// Strike Air leaves Arthur in a burst of pale wind
(function () { var fx0 = fxExtra; fxExtra = function (n, x, y, f) { if (n === 'airRelease') { var fa = f.face, L = 470; vfx(0.32, function (g, q) { g.save(); g.translate(x, y); g.rotate(fa); var cg = g.createLinearGradient(0, 0, L, 0); cg.addColorStop(0, 'rgba(238,244,248,' + (0.55 * (1 - q)) + ')'); cg.addColorStop(1, 'rgba(238,244,248,0)'); g.fillStyle = cg; g.beginPath(); g.moveTo(20, -6); g.lineTo(L * (0.4 + 0.6 * q), -30); g.lineTo(L * (0.4 + 0.6 * q), 30); g.lineTo(20, 6); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,' + (0.7 * (1 - q)) + ')'; g.lineWidth = 1.5; for (var i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(30, i * 4); g.lineTo(L * (0.3 + 0.7 * q), i * 22); g.stroke(); } g.restore(); }); ringFx(x, y, 10, 130, '#eef4f8', 0.35, 4); ringFx(x, y, 6, 80, '#ffffff', 0.25, 3, 0.05); puffFx(x, y, 14, '232,240,246', 170, 10, 0.5); return true; } return fx0 ? fx0(n, x, y, f) : false; }; })();
