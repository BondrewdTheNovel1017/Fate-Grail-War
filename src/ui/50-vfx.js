/* ===================== VISUAL EFFECTS ===================== */
var cracks = [], V = [], puffs = [], ghosts = [], flashes = [], band = { t: 0, text: '', col: '#ffd36b' }, slowT = 0, ghostT = 0;
function rgbOf(h) { var n = parseInt(h.slice(1), 16); return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }
function vfx(life, draw) { V.push({ t: 0, life: life, draw: draw }); }
function ringFx(x, y, r0, r1, col, life, w, delay) {
  var dl = delay || 0;
  vfx(life + dl, function (g, p, t) { var tt = (t - dl) / life; if (tt <= 0 || tt >= 1) return; var e = 1 - Math.pow(1 - tt, 3); g.beginPath(); g.arc(x, y, Math.max(1, r0 + (r1 - r0) * e), 0, 6.283); g.strokeStyle = col; g.globalAlpha = 1 - tt; g.lineWidth = Math.max(1, w * (1 - tt)); g.stroke(); g.globalAlpha = 1; });
}
function raysFx(x, y, n, r0, r1, col, life, w) {
  var ph = Math.random() * 6.283;
  vfx(life, function (g, p) { var e = 1 - Math.pow(1 - p, 2); g.strokeStyle = col; g.globalAlpha = 1 - p; g.lineWidth = w * (1 - p) + 1; g.lineCap = 'round'; for (var i = 0; i < n; i++) { var a = ph + i * 6.283 / n; g.beginPath(); g.moveTo(x + Math.cos(a) * (r0 + (r1 - r0) * e * 0.4), y + Math.sin(a) * (r0 + (r1 - r0) * e * 0.4)); g.lineTo(x + Math.cos(a) * (r0 + (r1 - r0) * e), y + Math.sin(a) * (r0 + (r1 - r0) * e)); g.stroke(); } g.globalAlpha = 1; });
}
function crackFx(x, y, n, minL, maxL, col, life) {
  var lines = [];
  for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, L = minL + Math.random() * (maxL - minL), pts = [[x, y]], cx = x, cy = y; for (var k = 1; k <= 4; k++) { a += (Math.random() - 0.5) * 0.7; cx += Math.cos(a) * L / 4; cy += Math.sin(a) * L / 4; pts.push([cx, cy]); } lines.push(pts); }
  vfx(life, function (g, p) { g.strokeStyle = col; g.globalAlpha = Math.min(1, (1 - p) * 1.5); g.lineWidth = 3; g.lineJoin = 'round'; lines.forEach(function (pts) { var m = Math.min(pts.length, 2 + Math.floor(Math.min(1, p * 5) * 3)); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var j = 1; j < m; j++) g.lineTo(pts[j][0], pts[j][1]); g.stroke(); }); g.globalAlpha = 1; });
}
function puffFx(x, y, n, rgb, spread, size, life) { for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = Math.random() * spread; puffs.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: size * (0.6 + Math.random() * 0.8), t: 0, life: life * (0.7 + Math.random() * 0.6), rgb: rgb }); } }
function crackScreen(x, y, life) {
  var lines = [], n = 13;
  for (var i = 0; i < n; i++) { var a = i / n * 6.283 + (Math.random() - 0.5) * 0.4, L = 120 + Math.random() * 420, pts = [[0, 0]], px = 0, py = 0, seg = 9 + Math.floor(Math.random() * 5);
    for (var k = 1; k <= seg; k++) { a += (Math.random() - 0.5) * 0.5; px += Math.cos(a) * L / seg; py += Math.sin(a) * L / seg; pts.push([px, py]); if (Math.random() < 0.18 && k > 2) { var b = a + (Math.random() < 0.5 ? 0.7 : -0.7), bx = px, by = py, br = [[bx, by]]; for (var m = 0; m < 4; m++) { b += (Math.random() - 0.5) * 0.5; bx += Math.cos(b) * L / seg * 0.8; by += Math.sin(b) * L / seg * 0.8; br.push([bx, by]); } lines.push(br); } }
    lines.push(pts); }
  cracks.push({ x: x, y: y, t: 0, life: life || 1.8, lines: lines, rings: [{ r: 60, n: 18 }, { r: 150, n: 26 }, { r: 270, n: 34 }] });
}
function bolt(g, x0, y0, x1, y1, segs, jit) {
  g.beginPath(); g.moveTo(x0, y0);
  for (var i = 1; i < segs; i++) { var k = i / segs, nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1, off = (Math.random() - 0.5) * jit; g.lineTo(x0 + (x1 - x0) * k + nx / L * off, y0 + (y1 - y0) * k + ny / L * off); }
  g.lineTo(x1, y1);
}
function runeCircle(g, x, y, r, col, rot, al) {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = 2;
  g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.stroke(); g.beginPath(); g.arc(0, 0, r * 0.78, 0, 6.283); g.stroke();
  g.beginPath(); for (var i = 0; i <= 6; i++) { var a = i * 2.094 * 1.5; if (i === 0) g.moveTo(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78); else g.lineTo(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78); } g.stroke();
  for (var j = 0; j < 12; j++) { var b = j * 0.5236; g.beginPath(); g.moveTo(Math.cos(b) * r * 0.82, Math.sin(b) * r * 0.82); g.lineTo(Math.cos(b) * r * 0.96, Math.sin(b) * r * 0.96); g.stroke(); }
  g.restore(); g.globalAlpha = 1;
}
function beamFx(f, x, y, sc, life) { var fa2 = f.face, gold = f.def && f.def.id === 'caerwyn', C1 = gold ? '255,170,40' : '170,200,255', C2 = gold ? '255,200,90' : '190,215,255', C3 = gold ? '255,235,170' : '230,240,255', C4 = gold ? '255,250,225' : '255,255,255'; vfx(life, function (g, p, tt) {
        var bp = null; for (var bi = 0; bi < G.proj.length; bi++) if (G.proj[bi].owner === f && G.proj[bi].a.beam) bp = G.proj[bi];
        var hx, hy; if (bp) { hx = bp.x; hy = bp.y; } else if (f.beamEnd && G.time - f.beamEnd.t < 1.5) { hx = f.beamEnd.x; hy = f.beamEnd.y; } else return;
        var sx0 = x + Math.cos(fa2) * 34, sy0 = y + Math.sin(fa2) * 34, L = Math.hypot(hx - sx0, hy - sy0), an = Math.atan2(hy - sy0, hx - sx0);
        var env = tt < 0.08 ? tt / 0.08 : tt < 0.7 ? 1 : Math.max(0, 1 - (tt - 0.7) / 0.45), wd = 96 * sc * env * (0.92 + 0.08 * Math.sin(tt * 60));
        g.save(); g.translate(sx0, sy0); g.rotate(an); g.globalCompositeOperation = 'lighter';
        var bg = g.createLinearGradient(0, -wd, 0, wd);
        bg.addColorStop(0, 'rgba(' + C1 + ',0)'); bg.addColorStop(0.25, 'rgba(' + C2 + ',' + (0.35 * env) + ')'); bg.addColorStop(0.42, 'rgba(' + C3 + ',' + (0.8 * env) + ')');
        bg.addColorStop(0.5, 'rgba(' + C4 + ',' + env + ')'); bg.addColorStop(0.58, 'rgba(' + C3 + ',' + (0.8 * env) + ')'); bg.addColorStop(0.75, 'rgba(' + C2 + ',' + (0.35 * env) + ')'); bg.addColorStop(1, 'rgba(' + C1 + ',0)');
        g.fillStyle = bg; g.fillRect(0, -wd, L, wd * 2);
        for (var k = 0; k < 18; k++) { var px = ((tt * 1500 + k * 131) % Math.max(60, L)), py = Math.sin(k * 7.7 + tt * 9) * wd * 0.55; g.fillStyle = 'rgba(' + C4 + ',' + (0.6 * env) + ')'; g.fillRect(px, py, 22, 1.6); }
        [[L, 0.8], [0, 0.6]].forEach(function (c) { var rg = g.createRadialGradient(c[0], 0, 2, c[0], 0, wd * c[1] * 1.4); rg.addColorStop(0, 'rgba(' + C4 + ',' + (0.9 * env) + ')'); rg.addColorStop(1, 'rgba(' + C2 + ',0)'); g.fillStyle = rg; g.beginPath(); g.arc(c[0], 0, wd * c[1] * 1.4, 0, 6.283); g.fill(); });
        g.restore();
        if (tt < 0.75 && Math.random() < 0.5) FX.shake(4 * sc);
      }); }
function flashFx(col, a, life) { flashes.push({ col: col, a: a, t: 0, life: life }); }
FX.slow = function (s) { if (fxPos && !FX.near(fxPos.x, fxPos.y)) return; slowT = Math.max(slowT, s); };
FX.snd = playSnd;
FX.banner = function (s, sub, who) { if (!s) return; if (who && G && G.mode === 'war' && who.team !== (G.f[MEI] || {}).team && !(viewDist(who.x, who.y) < 1700 && (!MAP.cityW || zoneOfXY(who.x, who.y) === viewZone()))) return; var c = '#ffd36b'; if (G) G.f.forEach(function (f) { if (f.key === 'np' && f.st === 'wind') c = f.def.col; }); var d = sub ? Math.min(5, 2.4 + sub.length / 60) : 2.2; band = { t: d, d: d, text: s, sub: sub || '', col: c }; };
function npfireGen(f, x, y) {
  var A = f.A.np, c = f.def.col, fa = f.face;
  if (A.kind === 'charge') {
    var L = A.dist, wd = 2 * (20 + A.reach);
    flashFx(c, 0.22, 0.2);
    vfx(0.6, function (g, p) { g.save(); g.translate(x, y); g.rotate(fa); var gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, rgbaOf(c, 0.55)); gr.addColorStop(1, rgbaOf(c, 0)); g.globalAlpha = 1 - p; g.fillStyle = gr; g.fillRect(0, -wd / 2, L, wd); g.strokeStyle = '#fff'; g.lineWidth = 3; for (var i = 0; i < 7; i++) { var yy = (-0.45 + i * 0.15) * wd, ll = 120 + (i * 53 % 160), xx = (i * 97) % (L - 160) + p * 200; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + ll, yy); g.stroke(); } g.restore(); g.globalAlpha = 1; });
  } else if (A.kind === 'aoe') {
    flashFx(c, 0.45, 0.4); ringFx(x, y, 20, A.r + 20, c, 0.7, 14); ringFx(x, y, 10, A.r * 0.7, '#ffffff', 0.55, 8, 0.06); ringFx(x, y, 10, A.r * 0.4, c, 0.5, 6, 0.12); raysFx(x, y, 24, 30, A.r, '#ffffff', 0.5, 4); crackFx(x, y, 12, 60, A.r * 0.8, c, 0.8); FX.spark(x, y, c, 40);
  } else if (A.kind === 'pulses') {
    flashFx(c, 0.3, 0.2); for (var k = 0; k < 3; k++) { (function (k) { var ang = fa + (k - 1) * 1.0; vfx(0.3 + k * 0.07, function (g, p) { g.save(); g.translate(x, y); g.rotate(ang); g.strokeStyle = '#ffffff'; g.globalAlpha = 1 - p; g.lineWidth = 6 * (1 - p) + 1; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, 0); g.lineTo(30 + A.r * (0.4 + 1.1 * p), 0); g.stroke(); g.restore(); g.globalAlpha = 1; }); })(k); }
    ringFx(x, y, 10, A.r, c, 0.4, 6);
  } else if (A.kind === 'melee') {
    flashFx(c, 0.3, 0.22); vfx(0.4, function (g, p) { g.beginPath(); g.arc(x, y, 50 + (A.reach - 40) * p, fa - A.arc, fa + A.arc); g.strokeStyle = '#ffffff'; g.globalAlpha = 1 - p; g.lineWidth = 22 * (1 - p) + 2; g.lineCap = 'round'; g.stroke(); g.strokeStyle = c; g.lineWidth = 10 * (1 - p); g.stroke(); g.globalAlpha = 1; }); ringFx(x, y, 10, 100, c, 0.4, 6); FX.shake(10);
  } else if (A.kind === 'rain') {
    flashFx(c, 0.2, 0.2); ringFx(x, y, 10, 90, c, 0.4, 6);
  } else {
    flashFx(c, 0.25, 0.2); ringFx(x, y, 8, 80, c, 0.4, 6); raysFx(x, y, 10, 10, 80, '#fff', 0.3, 3);
  }
}
function rgbaOf(h, a) { return 'rgba(' + rgbOf(h) + ',' + a + ')'; }
var fxExtra = null;
FX.fx = function (name, x, y, f) {
  fxPos = { x: x, y: y }; if (fxExtra && fxExtra(name, x, y, f)) return;
  var col = f && f.def ? f.def.col : '#fff', id = f && f.def ? f.def.id : '';
  switch (name) {
    case 'parry': ringFx(x, y, 8, 72, '#ffffff', 0.3, 6); raysFx(x, y, 8, 14, 64, '#ffffff', 0.24, 3); break;
    case 'gbreak': ringFx(x, y, 10, 96, '#f08a3b', 0.4, 9); FX.spark(x, y, '#f08a3b', 18); break;
    case 'counter': ringFx(x, y, 8, 95, '#ffd36b', 0.42, 8); ringFx(x, y, 8, 55, '#ffffff', 0.3, 4, 0.04); raysFx(x, y, 12, 10, 84, '#ffd36b', 0.32, 3); flashFx('#ffd36b', 0.16, 0.16); break;
    case 'stance': ringFx(x, y, 60, 18, '#ffd36b', 0.35, 4); break;
    case 'fieldOn': ringFx(x, y, 20, 230, col, 0.7, 6); ringFx(x, y, 10, 150, '#ffffff', 0.5, 3, 0.08); flashFx(col, 0.1, 0.18); break;
    case 'fieldOff': ringFx(x, y, 230, 250, col, 0.4, 3); FX.spark(x, y, col, 14); break;
    case 'hide': puffFx(x, y, 8, '120,130,140', 34, 8, 0.5); break;
    case 'dodge': puffFx(x, y, 7, '200,220,230', 40, 9, 0.4); break;
    case 'dodgeHit': ringFx(x, y, 10, 48, '#7ad39a', 0.26, 3); break;
    case 'heavySwing': puffFx(x + Math.cos(f.face) * 55, y + Math.sin(f.face) * 55, 4, '170,180,190', 40, 8, 0.3); break;
    case 'slam': ringFx(x, y, 20, 172, '#f0a93b', 0.46, 12); ringFx(x, y, 10, 120, '#ffffff', 0.3, 5, 0.05); crackFx(x, y, 11, 50, 170, '#2a1a10', 0.9); puffFx(x, y, 16, '120,95,70', 100, 16, 0.65); FX.spark(x, y, '#8a6a40', 24); flashFx('#f0a93b', 0.14, 0.15); break;
    case 'pulse': ringFx(x, y, 25, 168, '#e2515c', 0.28, 7); puffFx(x, y, 3, '120,95,70', 60, 10, 0.35); break;
    case 'bash': (function () { var fa = f.face, bc = f.def.col; vfx(0.26, function (g, p) { g.beginPath(); g.arc(x, y, 40 + 110 * p, fa - 0.7, fa + 0.7); g.strokeStyle = bc; g.globalAlpha = 1 - p; g.lineWidth = 16 * (1 - p) + 2; g.stroke(); g.globalAlpha = 1; }); })(); break;
    case 'shadowOut': puffFx(x, y, 14, '70,55,95', 55, 14, 0.55); ringFx(x, y, 6, 50, '#8a6cc8', 0.3, 4); break;
    case 'shadowIn': puffFx(x, y, 14, '70,55,95', 55, 14, 0.55); raysFx(x, y, 10, 8, 56, '#b9a3e8', 0.3, 3); break;
    case 'arm': ringFx(x, y, 8, 80, '#cfd8de', 0.3, 5); ringFx(x, y, 6, 50, '#d0303c', 0.26, 3, 0.04); FX.spark(x, y, '#cfd8de', 10); break;
    case 'miniBeam': flashFx('#ffffff', 0.18, 0.18); ringFx(x, y, 10, 80, '#ffffff', 0.35, 6); raysFx(x, y, 8, 14, 70, '#ffffff', 0.26, 2); beamFx(f, x, y, 0.45, 0.8); FX.shake(6); break;
    case 'swordBreak': FX.spark(x, y, '#cfd8de', 18); ringFx(x, y, 6, 50, '#cfd8de', 0.3, 3); break;
    case 'explode': (function () { var r = f.r || 140, big = f.big; flashFx(big ? '#ff3040' : '#ffd8a0', big ? 0.35 : 0.2, 0.22); ringFx(x, y, 10, r + 30, big ? '#ff2a3a' : '#ffb347', 0.5, 12); ringFx(x, y, 10, r * 0.7, '#ffffff', 0.35, 6, 0.04); puffFx(x, y, 22, big ? '120,40,40' : '110,90,70', r * 0.9, 22, 0.9); FX.spark(x, y, big ? '#ff3040' : '#ffb347', 30); crackFx(x, y, 9, 30, r * 0.8, '#1a0c08', 0.9); vfx(0.45, function (g, p) { var gr = g.createRadialGradient(x, y, 4, x, y, r * (0.5 + 0.6 * p)); gr.addColorStop(0, 'rgba(255,255,230,' + (0.9 * (1 - p)) + ')'); gr.addColorStop(0.5, big ? 'rgba(255,60,50,' + (0.7 * (1 - p)) + ')' : 'rgba(255,150,50,' + (0.7 * (1 - p)) + ')'); gr.addColorStop(1, 'rgba(80,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * (0.5 + 0.6 * p), 0, 6.283); g.fill(); }); })(); break;
    case 'marbleOn': (function () { var k = G.marble && G.marble.kind, c = k === 'ubw' ? '#ff7a3a' : '#ffe2a0'; flashFx(c, 0.5, 0.6); ringFx(x, y, 20, Math.max(W, H), c, 0.9, 30); ringFx(x, y, 10, 600, '#ffffff', 0.7, 8, 0.1); if (k === 'ionioi') { puffFx(x, y, 40, '230,200,140', 700, 30, 1.3); } else { for (var i = 0; i < 40; i++) parts.push({ x: x + (Math.random() - 0.5) * 300, y: y + (Math.random() - 0.5) * 300, vx: (Math.random() - 0.5) * 300, vy: (Math.random() - 0.5) * 300, t: 0, life: 1, col: '#ff8a3a' }); } })(); break;
    case 'marbleOff': flashFx('#ffffff', 0.55, 0.5); crackScreen(x, y, 1.3); break;
    case 'heal': ringFx(x, y, 6, 60, '#7ad39a', 0.4, 4); FX.spark(x, y, '#7ad39a', 10); break;
    case 'seal': flashFx('#c0182a', 0.25, 0.25); ringFx(x, y, 8, 120, '#e2313c', 0.6, 8); raysFx(x, y, 10, 20, 110, '#ff6a70', 0.4, 3); break;
    case 'spiritIn': puffFx(x, y, 14, '170,210,240', 60, 10, 0.7); ringFx(x, y, 40, 8, '#9fd4f2', 0.5, 3); break;
    case 'spiritOut': puffFx(x, y, 14, '170,210,240', 60, 10, 0.7); ringFx(x, y, 8, 50, '#9fd4f2', 0.5, 3); break;
    case 'wallBlock': ringFx(x, y, 10, 90, '#ffd36b', 0.4, 8); raysFx(x, y, 14, 20, 100, '#ffffff', 0.35, 3); FX.spark(x, y, '#ffd36b', 16); flashFx('#ffd36b', 0.12, 0.15); break;
    case 'gate': ringFx(x, y, 6, 30, '#ffd36b', 0.26, 4); ringFx(x, y, 3, 16, '#ffffff', 0.18, 2); FX.spark(x, y, '#ffd36b', 5); break;
    case 'hop': puffFx(x, y, 7, '130,200,150', 35, 8, 0.4); FX.spark(x, y, '#7ad39a', 8); break;
    case 'arrowLand': ringFx(x, y, 6, f.r + 10, f.owner.def.col, 0.3, 5); puffFx(x, y, 6, '150,150,120', 45, 8, 0.4); FX.spark(x, y, f.owner.def.col, 10); break;
    case 'execute': flashFx('#ff2030', 0.7, 0.45); ringFx(x, y, 10, 165, '#ff4050', 0.5, 10); crackFx(x, y, 10, 30, 120, '#ff2030', 0.6); break;
    case 'godhand': flashFx('#ffd36b', 0.5, 0.4); ringFx(x, y, 14, 200, '#ffd36b', 0.7, 12); ringFx(x, y, 10, 130, '#ffffff', 0.5, 6, 0.06); raysFx(x, y, 18, 20, 170, '#ffd36b', 0.5, 4); FX.spark(x, y, '#ffd36b', 30); break;
    case 'veil': ringFx(x, y, 8, 110, '#f4f8fc', 0.5, 5); ringFx(x, y, 8, 70, '#dfeaf4', 0.4, 4, 0.05); puffFx(x, y, 14, '244,248,252', 90, 12, 0.6); break;
    case 'kill': flashFx('#ffffff', 0.6, 0.35); ringFx(x, y, 10, 230, '#ffffff', 0.6, 8); ringFx(x, y, 10, 150, '#ffd36b', 0.5, 5, 0.08); break;
    case 'npHit': flashFx('#ffffff', 0.55, 0.28); ringFx(x, y, 10, 135, '#ffffff', 0.4, 10); ringFx(x, y, 10, 210, '#ffd36b', 0.55, 6, 0.05); raysFx(x, y, 16, 20, 150, '#ffffff', 0.36, 4); FX.spark(x, y, '#ffd36b', 34); crackFx(x, y, 6, 30, 95, '#ffffff', 0.4); break;
    case 'npcast': (function () {
      var w = f.A.np.wind, fo = f.foe;
      vfx(w, function (g, p) {
        if (!(f.st === 'wind' && f.key === 'np')) return;
        var r = 210 * (1 - p) + 24;
        g.beginPath(); g.arc(f.x, f.y, r, 0, 6.283); g.strokeStyle = f.def.col; g.globalAlpha = 0.25 + 0.6 * p; g.lineWidth = 3 + 4 * p; g.stroke();
        for (var i = 0; i < 10; i++) { var a = G.time * 2 + i * 0.628; g.beginPath(); g.moveTo(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r); g.lineTo(f.x + Math.cos(a) * (r + 14), f.y + Math.sin(a) * (r + 14)); g.stroke(); }
        g.globalAlpha = 0.18 + 0.3 * p; var gr = g.createRadialGradient(f.x, f.y, 4, f.x, f.y, 70); gr.addColorStop(0, f.def.col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(f.x, f.y, 70, 0, 6.283); g.fill(); g.globalAlpha = 1;
        if (id === 'leonidas') { for (var s = 0; s < 10; s++) { var sa = -G.time * 1.2 + s * 0.628; g.beginPath(); g.arc(f.x + Math.cos(sa) * 80, f.y + Math.sin(sa) * 80, 7, 0, 6.283); g.fillStyle = '#c7954a'; g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.fill(); g.stroke(); } }
        if (id === 'atalanta') { for (var q = 0; q < 6; q++) { var qa = G.time * 1.5 + q * 1.047; g.save(); g.translate(f.x + Math.cos(qa) * 56, f.y + Math.sin(qa) * 56); g.rotate(qa + Math.PI); g.strokeStyle = '#e9e4d3'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-12, 0); g.lineTo(10, 0); g.stroke(); g.fillStyle = '#e9e4d3'; g.beginPath(); g.moveTo(10, -3); g.lineTo(17, 0); g.lineTo(10, 3); g.fill(); g.restore(); } }
        if (id === 'caerwyn') { var wl = 1100, ww = 2 * (34 + 30); g.save(); g.translate(f.x, f.y); g.rotate(f.face); g.globalAlpha = 0.18 + 0.3 * p; var lg = g.createLinearGradient(0, 0, wl, 0); lg.addColorStop(0, '#ffd36b'); lg.addColorStop(1, 'rgba(255,211,107,0)'); g.fillStyle = lg; g.fillRect(0, -ww / 2 * p, wl, ww * p); g.globalAlpha = 1; for (var rn = 0; rn < 6; rn++) { var rx = ((G.time * 260 + rn * 160) % 960); g.beginPath(); g.arc(rx, 0, 22 * p + 4, -1, 1); g.strokeStyle = 'rgba(255,240,190,' + (0.7 * (1 - rx / 960)) + ')'; g.lineWidth = 3; g.stroke(); } g.restore(); for (var cm = 0; cm < 8; cm++) { var cam = G.time * 2.2 + cm * 0.785, cr = 90 * (1 - p) + 22; g.beginPath(); g.arc(f.x + Math.cos(cam) * cr, f.y + Math.sin(cam) * cr, 3.5, 0, 6.283); g.fillStyle = '#ffe9a0'; g.fill(); } }
        if (id === 'hassan') { var per = 0.55 - 0.3 * p, ph = (G.time % per) / per; g.beginPath(); g.arc(fo.x, fo.y, 14 + 56 * ph, 0, 6.283); g.strokeStyle = '#c0182a'; g.globalAlpha = (1 - ph) * 0.9; g.lineWidth = 5; g.stroke(); g.globalAlpha = 1; }
        if (id === 'gilgamesh') {
          var R = f.A.np.r, gr2 = g.createRadialGradient(f.x, f.y, 4, f.x, f.y, R);
          gr2.addColorStop(0, 'rgba(0,0,0,' + (0.25 + 0.4 * p) + ')'); gr2.addColorStop(0.7, 'rgba(90,0,10,' + (0.12 + 0.2 * p) + ')'); gr2.addColorStop(1, 'rgba(120,0,10,0)');
          g.fillStyle = gr2; g.beginPath(); g.arc(f.x, f.y, R, 0, 6.283); g.fill();
          g.save(); g.setLineDash([22, 12]); g.lineDashOffset = -G.time * 90 * (1 + 3 * p); g.strokeStyle = 'rgba(220,30,40,' + (0.35 + 0.5 * p) + ')'; g.lineWidth = 4; g.beginPath(); g.arc(f.x, f.y, R, 0, 6.283); g.stroke(); g.restore();
          var nb = 3 + Math.floor(9 * p);
          for (var bi = 0; bi < nb; bi++) {
            var a0 = Math.random() * 6.283, a1 = a0 + (Math.random() - 0.5) * 2.2, r0 = Math.random() * R * 0.4, r1 = R * (0.55 + Math.random() * 0.45);
            var bx0 = f.x + Math.cos(a0) * r0, by0 = f.y + Math.sin(a0) * r0, bx1 = f.x + Math.cos(a1) * r1, by1 = f.y + Math.sin(a1) * r1;
            bolt(g, bx0, by0, bx1, by1, 9, 46); g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 6; g.stroke();
            g.shadowColor = '#ff1e30'; g.shadowBlur = 14; g.strokeStyle = 'rgba(255,40,50,.95)'; g.lineWidth = 2; g.stroke(); g.shadowBlur = 0;
          }
          for (var ei = 0; ei < 3; ei++) { var ea = G.time * (3 + 6 * p) + ei * 2.094; g.save(); g.translate(f.x, f.y); g.rotate(ea); g.fillStyle = 'rgba(30,0,4,.85)'; g.strokeStyle = 'rgba(255,60,60,.8)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(26, 0, 22, 5, 0, 0, 6.283); g.fill(); g.stroke(); g.restore(); }
        }
        if (id === 'richard') {
          g.save(); g.globalCompositeOperation = 'lighter';
          for (var fi = 0; fi < 14; fi++) { var fa3 = G.time * 2.5 + fi * 0.449, fr3 = 40 + 30 * Math.sin(G.time * 3 + fi) * p + 30 * (1 - p); g.beginPath(); g.arc(f.x + Math.cos(fa3) * fr3, f.y + Math.sin(fa3) * fr3, 7 + 6 * p, 0, 6.283); g.fillStyle = 'rgba(255,' + (90 + (fi * 37) % 110) + ',30,' + (0.18 + 0.3 * p) + ')'; g.fill(); }
          g.restore(); runeCircle(g, f.x, f.y, 70 + 20 * p, '#ff9a3a', G.time * 1.2, 0.3 + 0.5 * p);
          if (Math.random() < 0.6) parts.push({ x: f.x + (Math.random() - 0.5) * 70, y: f.y + (Math.random() - 0.5) * 70, vx: (Math.random() - 0.5) * 30, vy: -80 - Math.random() * 80, t: 0, life: 0.6, col: Math.random() < 0.5 ? '#ffb347' : '#ff6a2a' });
        }
        if (id === 'medea') runeCircle(g, f.x, f.y, 60 + 30 * p, '#9fd4f2', -G.time * 1.6, 0.3 + 0.6 * p);
        if (id === 'gilles') { runeCircle(g, f.x, f.y, 80 + 30 * p, '#6fe3c8', G.time * 0.8, 0.25 + 0.5 * p); for (var ti2 = 0; ti2 < 5; ti2++) { var ta2 = ti2 * 1.2566 + G.time * 0.5, tr2 = 110 * p + 30; g.beginPath(); g.arc(f.x + Math.cos(ta2) * tr2, f.y + Math.sin(ta2) * tr2, 14 * p + 3, 0, 6.283); g.fillStyle = 'rgba(30,70,60,' + (0.4 * p) + ')'; g.fill(); } }
        if (id === 'cu') { runeCircle(g, f.x, f.y, 54, '#e2515c', G.time * 3, 0.3 + 0.5 * p); g.save(); g.translate(f.x, f.y); g.rotate(f.face); for (var ci = 0; ci < 6; ci++) { var cx2 = 30 + ((G.time * 260 + ci * 40) % 240) * (1 - p * 0.5); g.globalAlpha = 0.6 * p; g.fillStyle = '#e2515c'; g.fillRect(cx2, -2, 14, 4); } g.restore(); g.globalAlpha = 1; }
        if (id === 'diarmuid') { for (var di = 0; di < 2; di++) { var da = G.time * (4 + 6 * p) + di * Math.PI; g.beginPath(); g.arc(f.x, f.y, 46, da, da + 1.4); g.strokeStyle = di ? 'rgba(217,178,58,.85)' : 'rgba(200,50,40,.85)'; g.lineWidth = 4; g.stroke(); } }
        if (id === 'iskandar') { for (var ii = 0; ii < 3; ii++) { var ir = ((G.time * 120 + ii * 60) % 180) * (0.5 + p); g.beginPath(); g.arc(f.x, f.y, ir, 0, 6.283); g.strokeStyle = 'rgba(200,170,120,' + (0.4 * (1 - ir / 270)) + ')'; g.lineWidth = 3; g.stroke(); } }
        if (id === 'medusa') { for (var mi = 0; mi < 8; mi++) { var ma = G.time * 2 + mi * 0.785, mr = 50 + 20 * p; g.save(); g.translate(f.x + Math.cos(ma) * mr, f.y + Math.sin(ma) * mr); g.rotate(ma + 1.57); g.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.5 * p) + ')'; g.beginPath(); g.ellipse(0, 0, 10, 3, 0, 0, 6.283); g.fill(); g.restore(); } }
        if (id === 'kojirou') { for (var ki = 0; ki < 3; ki++) { if (Math.random() < 0.25 * p) { var ka = f.face + (ki - 1) * 1.0; g.save(); g.translate(f.x, f.y); g.rotate(ka); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(30, 0); g.lineTo(150, 0); g.stroke(); g.restore(); } } }
        if (id === 'lancelot') { if (Math.random() < 0.5) parts.push({ x: f.x + Math.cos(f.face) * 60 + (Math.random() - 0.5) * 10, y: f.y + Math.sin(f.face) * 60 + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 40, vy: -40 - Math.random() * 40, t: 0, life: 0.4, col: '#9aa0aa' }); }
        if (id === 'heracles') { g.beginPath(); g.arc(f.x, f.y, 160, 0, 6.283); g.setLineDash([10, 10]); g.strokeStyle = 'rgba(226,81,92,' + (0.2 + 0.5 * p) + ')'; g.lineWidth = 3; g.stroke(); g.setLineDash([]); }
      });
    })(); break;
    case 'npfire':
      if (id === 'cid_unused') { var fa = f.face, L = f.A.np.dist; vfx(0.6, function (g, p) { g.save(); g.translate(x, y); g.rotate(fa); var gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, 'rgba(255,211,107,0.55)'); gr.addColorStop(1, 'rgba(255,211,107,0)'); g.globalAlpha = 1 - p; g.fillStyle = gr; g.fillRect(0, -70, L, 140); g.strokeStyle = '#fff'; g.lineWidth = 3; for (var i = 0; i < 7; i++) { var yy = -60 + i * 20, ll = 120 + (i * 53 % 160), xx = (i * 97) % (L - 160) + p * 200; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + ll, yy); g.stroke(); } g.restore(); g.globalAlpha = 1; }); flashFx('#ffd36b', 0.2, 0.2); }
      else if (id === 'leonidas') { ringFx(x, y, 20, 205, '#ffd36b', 0.62, 12); ringFx(x, y, 10, 150, '#c7954a', 0.48, 7, 0.1); flashFx('#ffd36b', 0.2, 0.22); }
      else if (id === 'atalanta') { flashFx('#aef2c4', 0.25, 0.18); ringFx(x, y, 10, 125, '#7ad39a', 0.4, 6); }
      else if (id === 'heracles') { ringFx(x, y, 30, 185, '#e2515c', 0.5, 12); flashFx('#e2515c', 0.25, 0.25); crackFx(x, y, 8, 40, 120, '#3a1a1a', 0.8); }
      else if (id === 'gilgamesh') {
        flashFx('#000000', 0.7, 0.35); flashFx('#ff1e30', 0.35, 0.6); crackScreen(x, y, 1.9); FX.shake(26);
        ringFx(x, y, 20, f.A.np.r + 40, '#ff2a3a', 0.8, 16); ringFx(x, y, 10, f.A.np.r * 0.8, '#000000', 0.7, 22, 0.05); ringFx(x, y, 10, f.A.np.r * 0.5, '#ffffff', 0.5, 6, 0.1);
        crackFx(x, y, 16, 80, f.A.np.r, '#120004', 1.4); FX.spark(x, y, '#ff2a3a', 50); FX.spark(x, y, '#000000', 30);
        var Rr = f.A.np.r; vfx(0.9, function (g, p) { for (var i = 0; i < 14 * (1 - p) + 2; i++) { var a0 = Math.random() * 6.283, r1 = Rr * (0.6 + Math.random() * 0.6); bolt(g, x, y, x + Math.cos(a0) * r1, y + Math.sin(a0) * r1, 10, 60); g.globalAlpha = 1 - p; g.strokeStyle = '#000'; g.lineWidth = 7; g.stroke(); g.shadowColor = '#ff1e30'; g.shadowBlur = 16; g.strokeStyle = '#ff3040'; g.lineWidth = 2.5; g.stroke(); g.shadowBlur = 0; } g.globalAlpha = 1; });
      }
      else if (id === 'iskandar') {
        npfireGen(f, x, y); var A1 = f.A.np, spd = A1.dist / A1.act, fa4 = f.face, troops = [];
        for (var ti = 0; ti < 46; ti++) troops.push({ lat: (Math.random() - 0.5) * 2 * (A1.reach + 30), back: 30 + Math.random() * 300, cav: Math.random() < 0.35, ph: Math.random() * 6 });
        vfx(A1.act + 0.9, function (g, p, tt) { var adv = spd * Math.min(tt, A1.act) + Math.max(0, tt - A1.act) * spd * 0.3, fade = tt < A1.act + 0.3 ? 1 : Math.max(0, 1 - (tt - A1.act - 0.3) / 0.6); g.save(); g.translate(x, y); g.rotate(fa4); g.globalAlpha = fade;
          troops.forEach(function (s0) { var tx = adv - s0.back + Math.sin(tt * 18 + s0.ph) * 2, ty = s0.lat; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(tx - 3, ty + 4, s0.cav ? 20 : 10, s0.cav ? 10 : 8, 0, 0, 6.283); g.fill();
            if (s0.cav) { g.fillStyle = '#6b4a2c'; g.strokeStyle = '#0b121a'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(tx, ty, 18, 8, 0, 0, 6.283); g.fill(); g.stroke(); g.beginPath(); g.ellipse(tx + 18, ty, 7, 4, 0, 0, 6.283); g.fill(); g.stroke(); }
            g.beginPath(); g.arc(tx, ty, 7, 0, 6.283); g.fillStyle = '#a8302a'; g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 1.5; g.stroke(); g.beginPath(); g.arc(tx + 1, ty, 4, 0, 6.283); g.fillStyle = '#c7954a'; g.fill();
            g.strokeStyle = '#5a3a22'; g.lineWidth = 2; g.beginPath(); g.moveTo(tx - 6, ty + 4); g.lineTo(tx + 26, ty + 4); g.stroke(); g.fillStyle = '#cfd8de'; g.beginPath(); g.moveTo(tx + 26, ty + 1.5); g.lineTo(tx + 32, ty + 4); g.lineTo(tx + 26, ty + 6.5); g.fill(); });
          g.restore(); g.globalAlpha = 1; });
        puffFx(x, y, 30, '220,190,140', 260, 24, 1.1);
      }
      else if (id === 'richard') {
        var fr0 = f.face, A0 = f.A.np; flashFx('#ff8a3a', 0.3, 0.3); FX.shake(12);
        vfx(0.75, function (g, p) {
          var R = 40 + (A0.reach + 20) * Math.min(1, p * 2.2), gr = g.createRadialGradient(x, y, 10, x, y, R);
          gr.addColorStop(0, 'rgba(255,240,180,' + (0.85 * (1 - p)) + ')'); gr.addColorStop(0.45, 'rgba(255,140,40,' + (0.7 * (1 - p)) + ')'); gr.addColorStop(1, 'rgba(200,30,20,0)');
          g.save(); g.globalCompositeOperation = 'lighter'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, R, fr0 - A0.arc, fr0 + A0.arc); g.closePath(); g.fillStyle = gr; g.fill();
          for (var i = 0; i < 18; i++) { var aa = fr0 + (Math.random() - 0.5) * 2 * A0.arc, rr = R * (0.4 + Math.random() * 0.6); g.beginPath(); g.arc(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr, 10 + Math.random() * 14, 0, 6.283); g.fillStyle = 'rgba(255,' + Math.floor(80 + Math.random() * 120) + ',30,' + (0.35 * (1 - p)) + ')'; g.fill(); }
          g.restore();
        });
        puffFx(x + Math.cos(fr0) * 140, y + Math.sin(fr0) * 140, 18, '255,140,60', 160, 18, 0.9);
      }
      else if (id === 'caerwyn') { var fa2 = f.face; flashFx('#fff2c4', 0.4, 0.25); ringFx(x, y, 14, 150, '#ffd36b', 0.5, 10); ringFx(x, y, 8, 95, '#fff2c4', 0.34, 5, 0.04); raysFx(x, y, 12, 16, 130, '#ffe9a0', 0.34, 3); beamFx(f, x, y, 1, 1.15); FX.shake(12); }
      else if (id === 'hassan') { flashFx('#7a0f1a', 0.35, 0.3); ringFx(x + Math.cos(f.face) * 60, y + Math.sin(f.face) * 60, 6, 70, '#c0182a', 0.35, 6); }
      else npfireGen(f, x, y);
      break;
  }
};
FX.spark = function (x, y, col, n) { fxPos = { x: x, y: y }; for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = 80 + Math.random() * 220; parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, life: 0.25 + Math.random() * 0.25, col: col }); } };

