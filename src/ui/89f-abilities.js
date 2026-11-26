/* ---- the ability pass: how every skill and Noble Phantasm looks and sounds when it lands.
   Ground decals (craters, scorches, cuts) that fade where blows fell, tumbling rock debris, and per-character
   overlays: Heracles' storm of blows, Kojirou's cuts, Iskandar's thundering chariot, Diarmuid's twin roses,
   Hassan's cursed arm, the Hot Gates' shield wall, Lancelot's seized arms, and each master's own magecraft.
   Everything hangs off FX calls the engine already sends (so guests see it too) or off fighter state. ---- */

/* -- decals: marks on the ground that fade over a few seconds -- */
var DECALS = [];
function decal(kind, x, y, o) { if (!FX.near(x, y)) return; o = o || {}; o.kind = kind; o.x = x; o.y = y; o.t0 = G.time; o.life = o.life || 6; o.seed = Math.random() * 1000; DECALS.push(o); if (DECALS.length > 46) DECALS.shift(); }
function drng(s) { var x = Math.sin(s * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); }
function drawDecals(g) {
  if (!DECALS.length || !G) return;
  DECALS = DECALS.filter(function (d) { return G.time - d.t0 < d.life && G.time >= d.t0 - 0.1; });
  DECALS.forEach(function (d) {
    var age = G.time - d.t0, a = Math.min(1, (d.life - age) / 1.5), grow = Math.min(1, age / 0.12), s = d.seed;
    g.save(); g.globalAlpha = Math.max(0, a);
    if (d.kind === 'crater') {
      var R = d.r * grow;
      var cg = g.createRadialGradient(d.x, d.y, 2, d.x, d.y, R); cg.addColorStop(0, 'rgba(14,10,8,.72)'); cg.addColorStop(0.55, 'rgba(30,22,16,.5)'); cg.addColorStop(1, 'rgba(40,30,20,0)');
      g.fillStyle = cg; g.beginPath(); g.arc(d.x, d.y, R, 0, 6.283); g.fill();
      // the rim: broken stone pushed out
      g.strokeStyle = 'rgba(120,100,80,.45)'; g.lineWidth = 3; g.beginPath(); g.arc(d.x, d.y, R * 0.62, 0, 6.283); g.stroke();
      // cracks running out from the impact: jagged, tapering, each forking once
      g.lineJoin = 'round'; g.lineCap = 'round';
      var n = d.n || 9;
      for (var i = 0; i < n; i++) {
        var an = i / n * 6.283 + (drng(s + i) - 0.5) * 0.6, L = R * (0.55 + drng(s + i * 3) * 0.75) * Math.min(1, age / 0.18 + 0.3), px = d.x + Math.cos(an) * R * 0.25, py = d.y + Math.sin(an) * R * 0.25;
        for (var k = 1; k <= 6; k++) {
          var ox = px, oy = py; an += (drng(s + i * 7 + k) - 0.5) * 0.9; px += Math.cos(an) * L / 6; py += Math.sin(an) * L / 6;
          g.strokeStyle = 'rgba(18,12,8,' + (0.75 * (1 - k / 7)) + ')'; g.lineWidth = 2.6 * (1 - k / 8); g.beginPath(); g.moveTo(ox, oy); g.lineTo(px, py); g.stroke();
          g.strokeStyle = 'rgba(150,130,110,' + (0.25 * (1 - k / 7)) + ')'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(ox + 1, oy + 1); g.lineTo(px + 1, py + 1); g.stroke();
          if (k === 3 && drng(s + i * 13) < 0.6) { var fa = an + (drng(s + i) < 0.5 ? 0.9 : -0.9); g.strokeStyle = 'rgba(18,12,8,.4)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(fa) * L * 0.22, py + Math.sin(fa) * L * 0.22); g.stroke(); }
        }
      }
      // rubble left lying in the hole
      for (var r = 0; r < 10; r++) { var ra = drng(s + r * 11) * 6.283, rr = R * (0.2 + drng(s + r * 5) * 0.75), rs = 2.5 + drng(s + r) * 4; g.fillStyle = r % 2 ? '#5a5048' : '#3c342e'; g.beginPath(); g.moveTo(d.x + Math.cos(ra) * rr - rs, d.y + Math.sin(ra) * rr); g.lineTo(d.x + Math.cos(ra) * rr, d.y + Math.sin(ra) * rr - rs); g.lineTo(d.x + Math.cos(ra) * rr + rs, d.y + Math.sin(ra) * rr + rs * 0.4); g.closePath(); g.fill(); }
      if (d.glow && age < 1.2) { g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,90,60,' + (0.6 * (1 - age / 1.2)) + ')'; g.lineWidth = 1.5; g.beginPath(); g.arc(d.x, d.y, R * 0.3, 0, 6.283); g.stroke(); }
    } else if (d.kind === 'gouge') {
      // a short furrow torn by a blow
      g.translate(d.x, d.y); g.rotate(d.ang); g.fillStyle = 'rgba(16,12,10,.6)'; g.beginPath(); g.ellipse(0, 0, d.len * grow / 2, d.w || 5, 0, 0, 6.283); g.fill();
      g.strokeStyle = 'rgba(130,110,90,.4)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-d.len / 2, -(d.w || 5) - 1); g.lineTo(d.len / 2, -(d.w || 5) * 0.4); g.stroke();
    } else if (d.kind === 'cut') {
      // a clean sword cut in the ground
      g.translate(d.x, d.y); g.rotate(d.ang); var L2 = d.len * grow;
      g.strokeStyle = 'rgba(8,8,12,.75)'; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-L2 / 2, 0); g.quadraticCurveTo(0, d.bend || 0, L2 / 2, 0); g.stroke();
      if (age < 0.6) { g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(' + (d.rgb || '255,230,240') + ',' + (0.7 * (1 - age / 0.6)) + ')'; g.lineWidth = 1.2; g.stroke(); }
    } else if (d.kind === 'scorch') {
      var sr = d.r * grow, sg = g.createRadialGradient(d.x, d.y, 1, d.x, d.y, sr); sg.addColorStop(0, 'rgba(12,8,6,.55)'); sg.addColorStop(1, 'rgba(12,8,6,0)'); g.fillStyle = sg; g.beginPath(); g.arc(d.x, d.y, sr, 0, 6.283); g.fill();
      if (d.ember && age < 2) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(' + d.ember + ',' + (0.5 * (1 - age / 2)) + ')'; g.beginPath(); g.arc(d.x, d.y, sr * 0.35, 0, 6.283); g.fill(); }
    } else if (d.kind === 'track') {
      // chariot wheel ruts
      g.translate(d.x, d.y); g.rotate(d.ang); g.fillStyle = 'rgba(14,10,8,.5)'; g.fillRect(-12, -36, 24, 6); g.fillRect(-12, 30, 24, 6);
      if (age < 0.7) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(150,200,255,' + (0.5 * (1 - age / 0.7)) + ')'; g.fillRect(-12, -35, 24, 3); g.fillRect(-12, 31, 24, 3); }
    } else if (d.kind === 'blood') {
      for (var b = 0; b < 6; b++) { var ba = drng(s + b) * 6.283, br = 4 + drng(s + b * 3) * 14; g.fillStyle = 'rgba(110,10,18,.55)'; g.beginPath(); g.arc(d.x + Math.cos(ba) * br, d.y + Math.sin(ba) * br, 2 + drng(s + b * 9) * 4, 0, 6.283); g.fill(); }
    }
    g.restore();
  });
}

/* -- debris: chunks of stone thrown into the air, tumbling and landing -- */
function rocks(x, y, n, spd, col, size) {
  if (!FX.near(x, y)) return;
  for (var i = 0; i < n; i++) (function () {
    var a = Math.random() * 6.283, s = spd * (0.4 + Math.random() * 0.8), vz = 260 + Math.random() * 340, sz = (size || 6) * (0.6 + Math.random() * 0.8), rot0 = Math.random() * 6, spin = (Math.random() - 0.5) * 18, life = 0.55 + Math.random() * 0.35, c = col || (Math.random() < 0.5 ? '#6b625a' : '#8a8076');
    vfx(life, function (g, p, t) {
      var px = x + Math.cos(a) * s * t, py = y + Math.sin(a) * s * t, z = Math.max(0, vz * t - 900 * t * t);
      g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(px, py + 3, sz, sz * 0.5, 0, 0, 6.283); g.fill();
      g.save(); g.translate(px, py - z); g.rotate(rot0 + spin * t); g.fillStyle = c; g.strokeStyle = '#1a1612'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(-sz, -sz * 0.4); g.lineTo(-sz * 0.2, -sz); g.lineTo(sz, -sz * 0.3); g.lineTo(sz * 0.6, sz * 0.8); g.lineTo(-sz * 0.7, sz * 0.6); g.closePath(); g.fill(); g.stroke(); g.restore();
    });
  })();
}
// a low ring of dust rolling outward along the ground
function dustRing(x, y, r, rgb, life) { if (!FX.near(x, y)) return; for (var i = 0; i < 22; i++) { var a = i / 22 * 6.283 + Math.random() * 0.2, s = r / (life || 0.6) * (0.8 + Math.random() * 0.4); puffs.push({ x: x + Math.cos(a) * 20, y: y + Math.sin(a) * 20, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 10 + Math.random() * 8, t: 0, life: (life || 0.6) * (0.8 + Math.random() * 0.5), rgb: rgb || '130,110,90' }); } }
// a crescent slash drawn in the air
function slashFx(x, y, ang, len, bend, rgb, life, w) {
  vfx(life, function (g, p) {
    var e = Math.min(1, p * 4), L = len * e, a2 = 1 - p;
    g.save(); g.translate(x, y); g.rotate(ang); g.lineCap = 'round';
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = 'rgba(' + rgb + ',' + (0.5 * a2) + ')'; g.lineWidth = (w || 10) * a2 + 2; g.beginPath(); g.moveTo(-L / 2, 0); g.quadraticCurveTo(0, bend, L / 2, 0); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,' + (0.95 * a2) + ')'; g.lineWidth = 2 * a2 + 0.8; g.stroke();
    g.restore();
  });
}
// a jagged lightning bolt that flickers for a moment
function zap(x0, y0, x1, y1, life, rgb) { vfx(life, function (g, p) { bolt(g, x0, y0, x1, y1, 8, 22); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(' + (rgb || '170,210,255') + ',' + (0.9 * (1 - p)) + ')'; g.lineWidth = 3; g.shadowColor = 'rgb(' + (rgb || '170,210,255') + ')'; g.shadowBlur = 10; g.stroke(); g.strokeStyle = 'rgba(255,255,255,' + (1 - p) + ')'; g.lineWidth = 1.2; g.stroke(); g.restore(); }); }
function petals(x, y, n, cols, spread) { if (!FX.near(x, y)) return; for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = 40 + Math.random() * (spread || 160); parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, t: 0, life: 0.6 + Math.random() * 0.6, col: cols[i % cols.length] }); } }

/* -- per-fighter memory for trails -- */
var AFX = {};
function afx(f) { return AFX[f.idx] || (AFX[f.idx] = { trail: [], trT: 0 }); }

/* -- the effects themselves -- */
(function () {
  var prev = fxExtra;
  fxExtra = function (n, x, y, f) {
    if (prev && prev(n, x, y, f)) return true;
    var id = f && f.def ? f.def.id : '', fa = f ? f.face : 0, c = Math.cos(fa), s = Math.sin(fa);
    // Heracles: the Stone Slam caves the ground in
    if (n === 'slam') {
      decal('crater', x, y, { r: 120, n: 11, life: 8 }); rocks(x, y, 16, 260, null, 7); dustRing(x, y, 210, '120,100,80', 0.7); FX.shake(9);
      vfx(0.25, function (g, p) { g.save(); g.globalCompositeOperation = 'lighter'; var rg = g.createRadialGradient(x, y, 4, x, y, 150); rg.addColorStop(0, 'rgba(255,200,140,' + (0.5 * (1 - p)) + ')'); rg.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, 150, 0, 6.283); g.fill(); g.restore(); });
      return false;
    }
    // Nine Lives: every blow a short brutal arc, every impact tearing the ground
    if (n === 'nineSwing' || n === 'nineLast') {
      var A = f.A.np, k = Math.floor(f.t / A.interval), dir = k % 2 ? -1 : 1, big = n === 'nineLast';
      var ix = x + c * 95, iy = y + s * 95, R = A.reach * 0.85;
      vfx(big ? 0.4 : 0.2, function (g, p) {
        g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
        var a0 = fa - dir * A.arc, a1 = fa + dir * A.arc * (0.2 + 0.8 * Math.min(1, p * 5));
        g.beginPath(); g.arc(x, y, R, Math.min(a0, a1), Math.max(a0, a1)); g.strokeStyle = 'rgba(226,60,70,' + (0.7 * (1 - p)) + ')'; g.lineWidth = (big ? 34 : 22) * (1 - p) + 3; g.stroke();
        g.strokeStyle = 'rgba(255,230,210,' + (0.9 * (1 - p)) + ')'; g.lineWidth = (big ? 6 : 3.5) * (1 - p) + 1; g.stroke(); g.restore();
      });
      FX.spark(ix, iy, '#ff6a50', big ? 26 : 9); FX.spark(ix, iy, '#d8c8b0', big ? 18 : 6);
      decal('gouge', ix + (Math.random() - 0.5) * 30, iy + (Math.random() - 0.5) * 30, { ang: fa + dir * 0.9 + (Math.random() - 0.5) * 0.6, len: 40 + Math.random() * 30, w: 5, life: 5 });
      rocks(ix, iy, big ? 18 : 4, big ? 320 : 160, null, big ? 8 : 5);
      if (big) {
        decal('crater', ix, iy, { r: 130, n: 12, life: 9, glow: true }); dustRing(ix, iy, 260, '120,95,80', 0.8); flashFx('#ff3040', 0.32, 0.3); ringFx(ix, iy, 20, 220, '#e2515c', 0.55, 14); ringFx(ix, iy, 10, 140, '#ffffff', 0.4, 6, 0.05); raysFx(ix, iy, 16, 30, 200, '#ffd0c0', 0.4, 4);
      } else { ringFx(ix, iy, 8, 60, '#e2515c', 0.18, 5); puffFx(ix, iy, 3, '120,95,70', 60, 9, 0.35); }
      return true;
    }
    if (n === 'npfire' && id === 'heracles') {
      // the roar: a red shockwave, the ground splitting and steam pouring off him
      decal('crater', x, y, { r: 90, n: 8, life: 7 }); dustRing(x, y, 240, '140,90,80', 0.7); rocks(x, y, 8, 200, null, 6);
      for (var h = 0; h < 10; h++) puffs.push({ x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 30, vx: (Math.random() - 0.5) * 60, vy: -60 - Math.random() * 60, r: 9 + Math.random() * 6, t: 0, life: 0.9, rgb: '200,120,120' });
      return false;
    }
    // Kojirou: Tsubame Gaeshi, three cuts from three directions closing on one point
    if (n === 'pulse' && id === 'kojirou') {
      var kA = f.A.np, kk = Math.max(0, Math.min(2, Math.round(f.t / kA.interval) - 1)), tx = x + c * 70, ty = y + s * 70, ang = fa + Math.PI / 2 + kk * 2.094;
      slashFx(tx, ty, ang, 300, kk % 2 ? -36 : 36, '230,170,210', 0.42, 12);
      decal('cut', tx, ty, { ang: ang, len: 240, bend: kk % 2 ? -26 : 26, life: 6, rgb: '255,210,235' });
      FX.spark(tx, ty, '#ffe6f2', 8);
      if (kk === 2) { flashFx('#ffffff', 0.35, 0.18); petals(tx, ty, 18, ['#f4c2d8', '#ffffff', '#e9b8cc'], 200); ringFx(tx, ty, 10, 170, '#f4c2d8', 0.35, 4); }
      return true;
    }
    // Shadow Step: a smear of shadow between where he was and where he lands
    if (n === 'shadowOut') { afx(f).shOut = { x: x, y: y, t: G.time }; return false; }
    if (n === 'shadowIn') { var so = afx(f).shOut; if (so && G.time - so.t < 0.5) { var sx = so.x, sy = so.y; vfx(0.4, function (g, p) { g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(40,24,60,' + (0.7 * (1 - p)) + ')'; g.lineWidth = 26 * (1 - p) + 2; g.beginPath(); g.moveTo(sx, sy); g.lineTo(x, y); g.stroke(); g.strokeStyle = 'rgba(160,120,220,' + (0.5 * (1 - p)) + ')'; g.lineWidth = 2; g.stroke(); g.restore(); }); } for (var e = 0; e < 3; e++) ghosts.push({ id: id, x: x - c * (24 + e * 18), y: y - s * (24 + e * 18), face: fa, t: 0, life: 0.3 + e * 0.08 }); return false; }
    // Zabaniya: the false heart is crushed
    if (n === 'execute') {
      vfx(0.55, function (g, p) { var sq = p < 0.4 ? 1 - p * 1.2 : 0.52 - (p - 0.4) * 0.8; if (sq <= 0) return; g.save(); g.translate(x, y - 34); g.scale(sq, sq); g.fillStyle = 'rgba(200,20,40,' + (1 - p) + ')'; g.strokeStyle = '#2a0408'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 10); g.bezierCurveTo(-22, -6, -12, -22, 0, -10); g.bezierCurveTo(12, -22, 22, -6, 0, 10); g.fill(); g.stroke(); g.restore(); });
      decal('blood', x, y, { life: 8 }); petals(x, y - 30, 14, ['#c0182a', '#7a0f1a'], 140); return false;
    }
    // a skill fires: each servant's own look
    if (n === 'skillfire') {
      if (id === 'kojirou') {
        // Iaido Draw: one razor line, then the glint of the sheath
        var L = f.A.skill.reach + 30;
        vfx(0.3, function (g, p) { g.save(); g.translate(x, y); g.rotate(fa); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(244,194,216,' + (0.6 * (1 - p)) + ')'; g.lineWidth = 14 * (1 - p) + 1; g.lineCap = 'round'; g.beginPath(); g.moveTo(20, 0); g.lineTo(20 + L * Math.min(1, p * 6), 0); g.stroke(); g.strokeStyle = 'rgba(255,255,255,' + (1 - p) + ')'; g.lineWidth = 2; g.stroke(); g.restore(); });
        decal('cut', x + c * (L / 2 + 20), y + s * (L / 2 + 20), { ang: fa, len: L, life: 4 }); flashFx('#ffffff', 0.1, 0.08);
        var gx = x - s * 14, gy = y + c * 14; vfx(0.3, function (g, p) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,255,255,' + (1 - p) + ')'; g.lineWidth = 2; g.beginPath(); g.moveTo(gx - 10 * (1 + p), gy); g.lineTo(gx + 10 * (1 + p), gy); g.moveTo(gx, gy - 10 * (1 + p)); g.lineTo(gx, gy + 10 * (1 + p)); g.stroke(); g.restore(); });
      } else if (id === 'diarmuid') {
        // Gae Buidhe: a yellow thrust that leaves a curse mark where it bites
        var dl = f.A.skill.reach + 40, dx = x + c * dl, dy = y + s * dl;
        vfx(0.3, function (g, p) { g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.strokeStyle = 'rgba(232,190,60,' + (0.7 * (1 - p)) + ')'; g.lineWidth = 12 * (1 - p) + 2; g.beginPath(); g.moveTo(x + c * 30, y + s * 30); g.lineTo(dx, dy); g.stroke(); g.strokeStyle = 'rgba(255,250,220,' + (1 - p) + ')'; g.lineWidth = 2.5; g.stroke(); g.restore(); runeCircle(g, dx, dy, 22 + 14 * p, '#e8be3c', p * 4, 0.8 * (1 - p)); });
        FX.spark(dx, dy, '#e8be3c', 10);
      } else if (id === 'leonidas') {
        // Shield Bash: a bronze shockwave and the dust it throws
        var bx = x + c * 60, by = y + s * 60;
        vfx(0.3, function (g, p) { g.save(); g.globalCompositeOperation = 'lighter'; for (var w = 0; w < 3; w++) { var rr = 30 + (120 + w * 20) * Math.min(1, p * 2 + w * 0.1); g.beginPath(); g.arc(x, y, rr, fa - 0.7, fa + 0.7); g.strokeStyle = 'rgba(232,190,110,' + ((0.7 - w * 0.2) * (1 - p)) + ')'; g.lineWidth = (10 - w * 3) * (1 - p) + 1; g.stroke(); } g.restore(); });
        FX.spark(bx, by, '#ffd36b', 14); puffFx(bx, by, 8, '170,150,110', 90, 10, 0.5); FX.shake(5);
      } else if (id === 'iskandar') {
        // Gordius Wheel: a thunderclap as the chariot appears
        flashFx('#bfe0ff', 0.18, 0.14); for (var z = 0; z < 5; z++) { var za = Math.random() * 6.283; zap(x, y, x + Math.cos(za) * 140, y + Math.sin(za) * 140, 0.2 + Math.random() * 0.15); } dustRing(x, y, 160, '160,140,110', 0.6);
      } else if (id === 'medea') {
        // High-Speed Divine Words: three small circles flash open and fire
        for (var m = 0; m < 3; m++) (function (m) { var ma = fa + (m - 1) * 0.5, mx = x + Math.cos(ma) * 46, my = y + Math.sin(ma) * 46; vfx(0.35, function (g, p) { runeCircle(g, mx, my, 12 + 6 * p, '#9fd4f2', p * 6 + m, 0.9 * (1 - p)); }); })(m);
      } else if (id === 'gilgamesh') {
        vfx(0.4, function (g, p) { for (var q = 0; q < 8; q++) { var qa = q * 0.785 + p * 3; g.fillStyle = 'rgba(255,220,120,' + (1 - p) + ')'; g.fillRect(x + Math.cos(qa) * (20 + 40 * p) - 1.5, y + Math.sin(qa) * (20 + 40 * p) - 1.5, 3, 3); } });
      } else if (id === 'atalanta') {
        var ax0 = x, ay0 = y; vfx(0.35, function (g, p) { g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(122,211,154,' + (0.5 * (1 - p)) + ')'; g.lineWidth = 16 * (1 - p); g.beginPath(); g.moveTo(ax0 + c * 40, ay0 + s * 40); g.lineTo(f.x, f.y); g.stroke(); g.restore(); });
        petals(x, y, 8, ['#7ad39a', '#c8e6a0'], 90);
      } else if (id === 'lancelot') {
        // Seize Arms: black and red veins race over whatever he grabs
        vfx(0.5, function (g, p) { g.save(); g.globalCompositeOperation = 'lighter'; for (var v = 0; v < 7; v++) { var va = fa + (v - 3) * 0.35, vl = 30 + 70 * Math.min(1, p * 3); bolt(g, f.x, f.y, f.x + Math.cos(va) * vl, f.y + Math.sin(va) * vl, 5, 10); g.strokeStyle = 'rgba(220,30,50,' + (0.8 * (1 - p)) + ')'; g.lineWidth = 2; g.stroke(); } g.restore(); });
        puffFx(x, y, 10, '30,20,40', 60, 12, 0.6);
      } else if (id === 'medusa') {
        for (var mm = 0; mm < 3; mm++) parts.push({ x: x + c * 30, y: y + s * 30, vx: c * 200 + (Math.random() - 0.5) * 80, vy: s * 200 + (Math.random() - 0.5) * 80, t: 0, life: 0.3, col: '#d96bb8' });
      }
      // masters: each one's own magecraft
      if (f && f.def && f.def.isMaster) masterSkillFx(f, x, y);
      return true;
    }
    if (n === 'sigfire' && f && f.def && f.def.isMaster) { masterSigFx(f, x, y); return true; }
    // Gae Dearg and Gae Buidhe begin: two spears cross and bloom
    if (n === 'npfire' && id === 'diarmuid') { petals(x, y, 20, ['#c8322a', '#e8be3c', '#8a1a18'], 220); afx(f).trail = []; return false; }
    if (n === 'npfire' && id === 'kojirou') { flashFx('#ffffff', 0.2, 0.12); return false; }
    if (n === 'npfire' && id === 'leonidas') { dustRing(x, y, 200, '170,140,90', 0.8); FX.shake(8); return false; }
    if (n === 'npfire' && id === 'iskandar') { for (var zz = 0; zz < 8; zz++) { var zza = Math.random() * 6.283; zap(x, y, x + Math.cos(zza) * 220, y + Math.sin(zza) * 220, 0.3); } return false; }
    if (n === 'npfire' && id === 'richard') { for (var rf = 0; rf < 7; rf++) decal('scorch', x + c * (60 + rf * 34) + (Math.random() - 0.5) * 80, y + s * (60 + rf * 34) + (Math.random() - 0.5) * 80, { r: 40 + Math.random() * 30, ember: '255,120,40', life: 7 }); return false; }
    if (n === 'npfire' && id === 'gilgamesh') { decal('crater', x, y, { r: 260, n: 16, life: 10, glow: true }); rocks(x, y, 24, 420, '#3a2a2a', 8); return false; }
    if (n === 'npfire' && id === 'caerwyn') { for (var cw = 0; cw < 9; cw++) decal('scorch', x + c * (80 + cw * 110), y + s * (80 + cw * 110), { r: 46, ember: '255,200,90', life: 7 }); return false; }
    if (n === 'npfire' && id === 'hassan') { flashFx('#000000', 0.25, 0.25); return false; }
    if (n === 'explode') { decal('crater', x, y, { r: (f && f.r) ? f.r * 0.7 : 90, n: 9, life: 7, glow: f && f.big }); rocks(x, y, 10, 260, null, 6); return false; }
    if (n === 'arrowLand') { decal('scorch', x, y, { r: 22, life: 4 }); return false; }
    if (n === 'marbleOff') { return false; }
    return false;
  };
})();

/* -- masters: heals, hastes and wards each look like the person casting them -- */
function masterSkillFx(f, x, y) {
  var a = f.A.skill, id = f.def.id, k = a.kind, t0 = G.time;
  if (k === 'haste') {
    // Time Alter: a clock face snaps around him and his outline smears
    vfx(0.6, function (g, p) { g.save(); g.globalAlpha = 1 - p; g.strokeStyle = '#d8dde2'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 50 + 20 * p, 0, 6.283); g.stroke(); for (var i = 0; i < 12; i++) { var an = i * 0.5236; g.beginPath(); g.moveTo(x + Math.cos(an) * (44 + 20 * p), y + Math.sin(an) * (44 + 20 * p)); g.lineTo(x + Math.cos(an) * (50 + 20 * p), y + Math.sin(an) * (50 + 20 * p)); g.stroke(); } var hand = -1.57 + p * 12.6; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(hand) * 40, y + Math.sin(hand) * 40); g.stroke(); g.restore(); });
  } else if (k === 'shield') {
    // Volumen Hydrargyrum: quicksilver pours out and rises into a dome
    vfx(0.7, function (g, p) { g.save(); var r = 20 + 40 * Math.min(1, p * 2); var mg = g.createRadialGradient(x - 10, y - 10, 4, x, y, r); mg.addColorStop(0, 'rgba(240,246,250,' + (0.7 * (1 - p)) + ')'); mg.addColorStop(0.7, 'rgba(160,172,184,' + (0.5 * (1 - p)) + ')'); mg.addColorStop(1, 'rgba(120,130,140,0)'); g.fillStyle = mg; g.beginPath(); for (var i = 0; i <= 20; i++) { var an = i / 20 * 6.283, rr = r * (1 + 0.08 * Math.sin(an * 5 + p * 20)); if (i) g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); else g.moveTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } g.fill(); g.restore(); });
  } else if (k === 'reinforce') {
    // Reinforcement: green circuit lines light up over the body
    vfx(0.7, function (g, p) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(120,230,160,' + (0.85 * (1 - p)) + ')'; g.lineWidth = 1.8; for (var i = 0; i < 8; i++) { var an = i * 0.785 + 0.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * 18, y + Math.sin(an) * 18); g.lineTo(x + Math.cos(an + 0.4) * 30, y + Math.sin(an + 0.4) * 30); g.stroke(); } g.restore(); });
  } else if (k === 'buff') {
    // Strategist: a battle plan unrolls over the servant: arrows and a ring of command
    var pt = f.partner && f.partner.st !== 'dead' ? f.partner : f;
    vfx(0.8, function (g, p) { g.save(); g.strokeStyle = 'rgba(255,211,107,' + (1 - p) + ')'; g.lineWidth = 2.5; g.setLineDash([8, 6]); g.beginPath(); g.arc(pt.x, pt.y, 46 + 10 * p, 0, 6.283); g.stroke(); g.setLineDash([]); for (var i = 0; i < 3; i++) { var an = pt.face + (i - 1) * 0.5, L = 40 + 50 * Math.min(1, p * 3); g.beginPath(); g.moveTo(pt.x + Math.cos(an) * 30, pt.y + Math.sin(an) * 30); g.lineTo(pt.x + Math.cos(an) * (30 + L), pt.y + Math.sin(an) * (30 + L)); g.stroke(); g.beginPath(); var tx = pt.x + Math.cos(an) * (30 + L), ty = pt.y + Math.sin(an) * (30 + L); g.moveTo(tx, ty); g.lineTo(tx - Math.cos(an - 0.5) * 9, ty - Math.sin(an - 0.5) * 9); g.moveTo(tx, ty); g.lineTo(tx - Math.cos(an + 0.5) * 9, ty - Math.sin(an + 0.5) * 9); g.stroke(); } g.restore(); });
  } else if (k === 'drain') {
    // Feed the Servant: worms boil out of him and his life pours toward his servant
    var sv = f.partner; puffFx(x, y, 8, '70,40,80', 50, 9, 0.6); if (sv && sv.st !== 'dead') vfx(0.6, function (g, p) { g.save(); g.strokeStyle = 'rgba(160,60,120,' + (0.7 * (1 - p)) + ')'; g.lineWidth = 3; g.setLineDash([4, 6]); g.lineDashOffset = -p * 80; g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(sv.x, sv.y); g.stroke(); g.restore(); });
  } else if (k === 'siphon') {
    // Imaginary Drain: shadow threads reach out and pull life back to her
    enemiesOf(f).forEach(function (e) { if (dist(f, e) > a.r + FR) return; vfx(0.6, function (g, p) { g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(20,6,24,' + (0.85 * (1 - p)) + ')'; g.lineWidth = 7; g.beginPath(); g.moveTo(e.x, e.y); g.quadraticCurveTo((e.x + f.x) / 2 + Math.sin(p * 9) * 30, (e.y + f.y) / 2, f.x, f.y); g.stroke(); g.strokeStyle = 'rgba(210,50,80,' + (0.7 * (1 - p)) + ')'; g.lineWidth = 1.5; g.stroke(); g.restore(); }); });
  } else if (k === 'heal' || k === 'gift') {
    // healing: Rin's jewel sparks, Kirei's sacrament, the Einzbern silver threads
    var tgt = a.self ? f : (f.partner && f.partner.st !== 'dead' ? f.partner : f), col = id === 'rin' ? '#ff6a6a' : id === 'kirei' ? '#f2e6c0' : (id === 'irisviel' || id === 'illya') ? '#e6eef8' : '#ffd36b';
    vfx(0.8, function (g, p) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - p;
      if (id === 'kirei') { g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.moveTo(tgt.x, tgt.y - 40 - 10 * p); g.lineTo(tgt.x, tgt.y + 10); g.moveTo(tgt.x - 14, tgt.y - 26 - 10 * p); g.lineTo(tgt.x + 14, tgt.y - 26 - 10 * p); g.stroke(); }
      else if (id === 'rin') { for (var i = 0; i < 6; i++) { var an = i * 1.047 + p * 3, r = 20 + 30 * p; g.fillStyle = col; g.beginPath(); g.moveTo(tgt.x + Math.cos(an) * r, tgt.y + Math.sin(an) * r - 5); g.lineTo(tgt.x + Math.cos(an) * r + 4, tgt.y + Math.sin(an) * r); g.lineTo(tgt.x + Math.cos(an) * r, tgt.y + Math.sin(an) * r + 5); g.lineTo(tgt.x + Math.cos(an) * r - 4, tgt.y + Math.sin(an) * r); g.fill(); } }
      else { g.strokeStyle = col; g.lineWidth = 1.2; for (var j = 0; j < 8; j++) { var aj = j * 0.785 + p * 2; g.beginPath(); g.moveTo(tgt.x + Math.cos(aj) * 50 * (1 - p), tgt.y + Math.sin(aj) * 50 * (1 - p)); g.quadraticCurveTo(tgt.x + Math.cos(aj + 0.6) * 30, tgt.y + Math.sin(aj + 0.6) * 30, tgt.x, tgt.y); g.stroke(); } }
      g.restore(); });
  }
}
function masterSigFx(f, x, y) {
  var id = f.def.id, fa = f.face, c = Math.cos(fa), s = Math.sin(fa);
  if (id === 'kirei') { var px = x + c * 50, py = y + s * 50; ringFx(px, py, 6, 90, '#f2e6c0', 0.3, 8); decal('crater', px, py, { r: 50, n: 7, life: 5 }); rocks(px, py, 6, 160, null, 5); FX.shake(8); }
  else if (id === 'kayneth') { vfx(0.5, function (g, p) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(220,230,240,' + (0.9 * (1 - p)) + ')'; g.lineWidth = 10 * (1 - p) + 2; g.lineCap = 'round'; g.beginPath(); g.arc(x, y, 40 + 120 * Math.min(1, p * 2), p * 8, p * 8 + 4.5); g.stroke(); g.restore(); }); }
  else if (id === 'kariya' || id === 'sakura') { puffFx(x, y, 10, id === 'sakura' ? '30,10,40' : '70,40,80', 80, 12, 0.7); }
  else if (id === 'kiritsugu') { flashFx('#fff2a8', 0.12, 0.08); }
}

/* -- overlays drawn with the fighters -- */
var drawGroundFx0 = drawGroundFx;
drawGroundFx = function (g) { drawDecals(g); drawGroundFx0(g); };
var drawFighter0 = drawFighter;
drawFighter = function (f, i, ar) {
  var vis = f.st !== 'dead' && !(f.hid && f.team !== (G.f[MEI] || {}).team);
  if (vis && f.def.id === 'iskandar' && f.act && f.key === 'skill' && (f.st === 'wind' || f.st === 'act' || (f.st === 'rec' && f.t < 0.3))) drawChariot(f);
  drawFighter0(f, i, ar);
  if (!vis) return;
  if (f.def.id === 'hassan' && f.key === 'np' && (f.st === 'wind' || f.st === 'act')) drawCursedArm(f);
  if (f.def.id === 'lancelot' && f.armT > 0 && f.key !== 'np') drawSeizedVeins(f);
  if (f.def.id === 'diarmuid' && f.key === 'np' && f.st === 'act') diarmuidTrail(f);
  if (f.def.id === 'heracles' && f.key === 'np' && f.st === 'act') heraclesRage(f);
};
// Gordius Wheel: two divine bulls, the chariot behind them, thunder at the wheels
function drawChariot(f) {
  var a = f.act, p = f.st === 'wind' ? clamp(f.t / (f.windTotal || a.wind), 0, 1) : f.st === 'act' ? 1 : 1 - f.t / 0.3, t = G.time, run = f.st === 'act';
  ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.face); ctx.scale(1.25, 1.25); ctx.globalAlpha = Math.max(0, Math.min(1, p * 1.4));
  // wheels and car
  [-34, 34].forEach(function (wy) { ctx.fillStyle = '#3a2a1c'; ctx.beginPath(); ctx.ellipse(-8, wy, 18, 6, 0, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#c7954a'; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = 'rgba(230,200,140,.8)'; ctx.lineWidth = 1.5; for (var k = 0; k < 4; k++) { var sx = -8 + Math.cos(t * (run ? 30 : 4) + k * 1.57) * 16; ctx.beginPath(); ctx.moveTo(sx, wy - 5); ctx.lineTo(sx, wy + 5); ctx.stroke(); } });
  ctx.fillStyle = '#7a2a22'; ctx.strokeStyle = '#0b121a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-30, -30); ctx.lineTo(16, -30); ctx.quadraticCurveTo(30, 0, 16, 30); ctx.lineTo(-30, 30); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#d8b25a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-26, -24); ctx.lineTo(12, -24); ctx.quadraticCurveTo(22, 0, 12, 24); ctx.lineTo(-26, 24); ctx.stroke();
  // the pole and the bulls
  ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(70, 0); ctx.stroke();
  [-17, 17].forEach(function (by, j) {
    var bob = Math.sin(t * (run ? 26 : 5) + j * 2) * (run ? 3 : 1), bx = 92 + bob;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(bx - 4, by + 4, 30, 13, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#4a3226'; ctx.strokeStyle = '#0b121a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(bx, by, 28, 12, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(bx + 28, by, 10, 8, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#e8e0c8'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx + 30, by - 6); ctx.quadraticCurveTo(bx + 36, by - 16, bx + 44, by - 13); ctx.moveTo(bx + 30, by + 6); ctx.quadraticCurveTo(bx + 36, by + 16, bx + 44, by + 13); ctx.stroke();
  });
  // thunder crawling over the team
  ctx.globalCompositeOperation = 'lighter';
  for (var z = 0; z < (run ? 5 : 2); z++) { var x0 = -20 + Math.random() * 130, y0 = (Math.random() - 0.5) * 70; bolt(ctx, x0, y0, x0 + (Math.random() - 0.5) * 60, y0 + (Math.random() - 0.5) * 50, 5, 14); ctx.strokeStyle = 'rgba(170,210,255,' + (0.5 + 0.4 * Math.random()) + ')'; ctx.lineWidth = 2; ctx.stroke(); }
  if (run) { var gl = ctx.createRadialGradient(40, 0, 10, 40, 0, 120); gl.addColorStop(0, 'rgba(150,200,255,.25)'); gl.addColorStop(1, 'rgba(150,200,255,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(40, 0, 120, 0, 6.283); ctx.fill(); }
  ctx.restore();
  if (run) { var A2 = afx(f); if (G.time - A2.trT > 0.05) { A2.trT = G.time; decal('track', f.x - Math.cos(f.face) * 10, f.y - Math.sin(f.face) * 10, { ang: f.face, life: 5 }); if (Math.random() < 0.5) zap(f.x, f.y, f.x - Math.cos(f.face) * 80 + (Math.random() - 0.5) * 60, f.y - Math.sin(f.face) * 80 + (Math.random() - 0.5) * 60, 0.15); } }
}
// Zabaniya: the long cursed arm unwinds toward the target
function drawCursedArm(f) {
  var o = f.foe; if (!o) return;
  var a = f.act, p = f.st === 'wind' ? clamp(f.t / (f.windTotal || a.wind), 0, 1) : 1, ext = Math.max(0, (p - 0.25) / 0.75); if (ext <= 0) return;
  var sh = locOf(f, 6, -14), D = f.st === 'act' ? Math.min(dist(f, o), a.reach) : a.reach * 0.55, an = f.st === 'act' ? f.face : angTo(f, o), L = D * (f.st === 'act' ? 1 : 0.35 + 0.45 * ext), ex = sh.x + Math.cos(an) * L, ey = sh.y + Math.sin(an) * L, t = G.time;
  var mx = (sh.x + ex) / 2 - Math.sin(an) * 18 * Math.sin(t * 6), my = (sh.y + ey) / 2 + Math.cos(an) * 18 * Math.sin(t * 6);
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = '#140a10'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
  ctx.strokeStyle = 'rgba(180,30,50,.85)'; ctx.lineWidth = 2; ctx.setLineDash([3, 7]); ctx.lineDashOffset = -t * 40; ctx.stroke(); ctx.setLineDash([]);
  // the clawed hand
  ctx.translate(ex, ey); ctx.rotate(an); ctx.fillStyle = '#140a10'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#140a10'; ctx.lineWidth = 3; for (var k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(4, k * 3); ctx.quadraticCurveTo(14, k * 5, 18, k * 7 + (f.st === 'act' ? -k * 3 : 0)); ctx.stroke(); }
  ctx.restore();
  if (f.st === 'wind' && p > 0.6) { var hb = 0.5 + 0.5 * Math.sin(t * (10 + 20 * p)); ctx.save(); ctx.translate(o.x, o.y - 34); ctx.scale(0.6 + 0.2 * hb, 0.6 + 0.2 * hb); ctx.fillStyle = 'rgba(200,20,40,' + (0.4 + 0.4 * hb) + ')'; ctx.beginPath(); ctx.moveTo(0, 10); ctx.bezierCurveTo(-22, -6, -12, -22, 0, -10); ctx.bezierCurveTo(12, -22, 22, -6, 0, 10); ctx.fill(); ctx.restore(); }
}
// Seize Arms: veins of black and red run along the stolen weapon
function drawSeizedVeins(f) {
  var t = G.time; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var v = 0; v < 4; v++) { var p0 = locOf(f, 24, 9), L = 50 + 30 * Math.sin(t * 3 + v), p1 = locOf(f, 24 + L, 9 + (v - 1.5) * 5); bolt(ctx, p0.x, p0.y, p1.x, p1.y, 6, 6); ctx.strokeStyle = 'rgba(220,30,50,' + (0.3 + 0.3 * Math.sin(t * 9 + v * 2)) + ')'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
  if (Math.random() < 0.15 && FX.near(f.x, f.y)) puffs.push({ x: f.x + (Math.random() - 0.5) * 30, y: f.y + (Math.random() - 0.5) * 30, vx: 0, vy: -20, r: 6, t: 0, life: 0.6, rgb: '30,20,40' });
}
// the twin roses: red and yellow ribbons spiralling behind the charge
function diarmuidTrail(f) {
  var A2 = afx(f); A2.trail.push({ x: f.x, y: f.y }); if (A2.trail.length > 18) A2.trail.shift();
  var tr = A2.trail, t = G.time; if (tr.length < 3) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.globalCompositeOperation = 'lighter';
  [['200,50,40', 0], ['232,190,60', Math.PI]].forEach(function (cc) {
    ctx.beginPath(); for (var i = 0; i < tr.length; i++) { var q = tr[i], nx = -(f.cy || 0), ny = f.cx || 0, off = Math.sin(i * 0.9 - t * 30 + cc[1]) * 16 * (i / tr.length); if (i) ctx.lineTo(q.x + nx * off, q.y + ny * off); else ctx.moveTo(q.x + nx * off, q.y + ny * off); }
    ctx.strokeStyle = 'rgba(' + cc[0] + ',.75)'; ctx.lineWidth = 5; ctx.stroke();
  });
  ctx.restore();
  if (Math.random() < 0.6 && FX.near(f.x, f.y)) parts.push({ x: f.x + (Math.random() - 0.5) * 30, y: f.y + (Math.random() - 0.5) * 30, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, t: 0, life: 0.7, col: Math.random() < 0.5 ? '#c8322a' : '#e8be3c' });
}
// Nine Lives: red steam pours off him while the blows land
function heraclesRage(f) {
  if (Math.random() < 0.7 && FX.near(f.x, f.y)) puffs.push({ x: f.x + (Math.random() - 0.5) * 34, y: f.y + (Math.random() - 0.5) * 34, vx: (Math.random() - 0.5) * 40, vy: -50, r: 8 + Math.random() * 5, t: 0, life: 0.5, rgb: '190,70,70' });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; var rg = ctx.createRadialGradient(f.x, f.y, 6, f.x, f.y, 60); rg.addColorStop(0, 'rgba(255,60,60,.25)'); rg.addColorStop(1, 'rgba(255,40,40,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(f.x, f.y, 60, 0, 6.283); ctx.fill(); ctx.restore();
}
// Thermopylae Enomotia: the three hundred raise their shields in a ring
function drawHotGates(f) {
  var t = G.time, dur = (f.A.np && f.A.np.dur) || 5, el = dur - f.wallT, rise = Math.min(1, el / 0.35), R = 190;
  ctx.save();
  ctx.beginPath(); ctx.arc(f.x, f.y, R, 0, 6.283); ctx.fillStyle = 'rgba(255,211,107,.06)'; ctx.fill();
  // a ring of hoplites: crested helmets behind, a wall of bronze shields facing out, spears levelled between them
  var n = 26;
  for (var i = 0; i < n; i++) {
    var an = i / n * 6.283, r = R * (0.72 + 0.28 * rise), hx = f.x + Math.cos(an) * (r - 22), hy = f.y + Math.sin(an) * (r - 22), sx = f.x + Math.cos(an) * r, sy = f.y + Math.sin(an) * r;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(hx + 2, hy + 3, 9, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#a8763a'; ctx.strokeStyle = '#0b121a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(hx, hy, 8, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#b3242a'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hx - Math.sin(an) * 7, hy + Math.cos(an) * 7); ctx.lineTo(hx + Math.sin(an) * 7, hy - Math.cos(an) * 7); ctx.stroke();
    var sp = 34 * rise; ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(sx + Math.cos(an + 0.12) * sp, sy + Math.sin(an + 0.12) * sp); ctx.stroke();
    ctx.fillStyle = '#e0e6ea'; ctx.beginPath(); ctx.arc(sx + Math.cos(an + 0.12) * sp, sy + Math.sin(an + 0.12) * sp, 2.5, 0, 6.283); ctx.fill();
    // the shield seen from above: a thick curved band of bronze
    var half = 6.283 / n * 0.62;
    ctx.lineCap = 'butt'; ctx.strokeStyle = '#0b121a'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(f.x, f.y, r, an - half, an + half); ctx.stroke();
    ctx.strokeStyle = i % 2 ? '#c8913e' : '#d8a04a'; ctx.lineWidth = 9; ctx.stroke();
    ctx.strokeStyle = '#ffe0a0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(f.x, f.y, r + 3, an - half * 0.8, an + half * 0.8); ctx.stroke();
  }
  if (el < 0.5) { ctx.globalAlpha = 1 - el / 0.5; ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(f.x, f.y, R * (0.6 + 0.8 * el), 0, 6.283); ctx.stroke(); }
  ctx.restore();
}

/* -- sounds for Berserker's storm -- */
SND.nine = function (o, out, t, P) {
  var k = +P.a || 1, last = k >= 9, v = 0.75 + 0.03 * k;
  // the body of the blow: a deep driven thump
  bass(o, out, t, last ? 70 : 88 - k * 2, last ? 18 : 30, last ? 0.9 : 0.24, (last ? 1 : 0.7) * v, last ? 1.6 : 1.3);
  // stone and bone giving way
  noise(o, out, t, 'lowpass', last ? 3000 : 2200, 180, last ? 0.7 : 0.16, (last ? 0.8 : 0.5) * v, 0.002, 0.9);
  noise(o, out, t + 0.004, 'bandpass', 900 + Math.random() * 500, 300, 0.09, 0.45 * v, 0.001, 2.2);
  noise(o, out, t + 0.012, 'highpass', 2600, 5200, 0.04, 0.32 * v, 0.001, 1);
  // the axe-sword's own weight through the air
  noise(o, out, t - 0.002, 'bandpass', 260, 900, 0.07, 0.25, 0.01, 1.4);
  if (last) { tone(o, out, t, 'sawtooth', 62, 30, 0.9, 0.3, 0.01); ringS(o, out, t + 0.02, [140, 210, 330], 0.9, 0.12); noise(o, out, t + 0.08, 'lowpass', 700, 120, 1.2, 0.4, 0.05, 0.7); }
};
// his roar as Nine Lives begins
(function () { var old = SND['npfire:heracles']; SND['npfire:heracles'] = function (o, out, t, P) { if (old) old(o, out, t, P); tone(o, out, t, 'sawtooth', 110, 58, 0.9, 0.22, 0.04); tone(o, out, t, 'square', 82, 46, 0.8, 0.1, 0.05); noise(o, out, t, 'bandpass', 500, 260, 0.9, 0.35, 0.05, 3); }; })();
SND['skill:iskandar'] = function (o, out, t) { noise(o, out, t, 'highpass', 4000, 1200, 0.25, 0.4, 0.001, 0.8); bass(o, out, t + 0.02, 70, 30, 0.9, 0.6, 1.2); noise(o, out, t + 0.05, 'lowpass', 900, 200, 1.2, 0.4, 0.05, 0.8); };
