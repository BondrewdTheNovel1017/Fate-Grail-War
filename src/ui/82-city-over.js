/* ---- city details drawn around the buildings: yards, the church hill, doors, summoning circles,
   and the things you walk under (gates, arches, roofs), which are drawn above the fighters ---- */
function hsh2(a, b) { var h = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return h - Math.floor(h); }
function stone(g, x, y, r, col) { g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x + 3, y + 4, r, r * 0.8, 0, 0, 6.283); g.fill(); g.fillStyle = col || '#8a8578'; g.beginPath(); g.ellipse(x, y, r, r * 0.8, 0.3, 0, 6.283); g.fill(); g.strokeStyle = '#2a2824'; g.lineWidth = 1.5; g.stroke(); }
function drawYards(g, vr, t) {
  // the church hill: contour lines climb toward the clearing, so the church reads as standing above the city
  if (vis(vr, 250, 2510, 2900, 3530)) {
    g.save(); g.beginPath(); g.rect(250, 2510, 2650, 1020); g.clip();
    for (var c = 1; c <= 7; c++) { var pad = c * 70; g.strokeStyle = 'rgba(0,0,0,' + (0.16 + c * 0.02) + ')'; g.lineWidth = 7; rrect(g, 1150 - pad, 2790 - pad * 0.7, 610 + pad * 2, 530 + pad * 1.4, 120 + pad); g.stroke(); g.strokeStyle = 'rgba(190,220,170,.09)'; g.lineWidth = 2; rrect(g, 1150 - pad + 4, 2790 - pad * 0.7 + 4, 610 + pad * 2, 530 + pad * 1.4, 120 + pad); g.stroke(); }
    g.restore();
    // the clearing is lit and raised: a lip of rock along its southern and eastern edges
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(1150, 3320, 610, 18); g.fillRect(1760, 2800, 16, 538);
    g.fillStyle = '#6a6558'; g.fillRect(1150, 3316, 610, 6); g.fillRect(1756, 2796, 6, 526);
    // gravel forecourt and a path to the door
    g.fillStyle = '#5e5a4e'; g.fillRect(1380, 3140, 140, 180); g.fillStyle = 'rgba(255,255,255,.05)'; for (var gx = 1385; gx < 1515; gx += 13) for (var gy = 3145; gy < 3315; gy += 11) if (hsh2(gx, gy) < 0.35) g.fillRect(gx, gy, 3, 2);
    // the cemetery: low wall around rows of graves
    g.strokeStyle = '#6e6a60'; g.lineWidth = 8; g.strokeRect(440, 2690, 610, 410);
  }
  // Emiya house: stepping stones from the gate, a bicycle, the engawa, a koi pond, the laundry pole, a path to the storehouse
  if (vis(vr, 1440, 4770, 2870, 5500)) {
    g.fillStyle = '#5d584c'; g.fillRect(1470, 4810, 1370, 125); // raked gravel front yard
    g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 2; for (var ry = 4822; ry < 4932; ry += 12) { g.beginPath(); g.moveTo(1470, ry); g.lineTo(1990, ry); g.moveTo(2110, ry); g.lineTo(2840, ry); g.stroke(); }
    for (var sy = 4820; sy < 4930; sy += 34) stone(g, 2050 + (sy % 68 ? 8 : -8), sy, 17, '#9a958a');
    // Shirou's bicycle by the porch
    g.save(); g.translate(2270, 4900); g.strokeStyle = '#1a1c20'; g.lineWidth = 5; g.beginPath(); g.arc(-22, 0, 11, 0, 6.283); g.arc(22, 0, 11, 0, 6.283); g.stroke(); g.strokeStyle = '#3a6ab8'; g.lineWidth = 4; g.beginPath(); g.moveTo(-22, 0); g.lineTo(0, -4); g.lineTo(22, 0); g.moveTo(16, -10); g.lineTo(28, -10); g.stroke(); g.fillStyle = '#2a2420'; g.fillRect(-8, -9, 12, 6); g.restore();
    // the mailbox by the gate
    g.fillStyle = '#b8322a'; g.fillRect(2140, 4812, 20, 14); g.strokeStyle = '#0b121a'; g.lineWidth = 1.5; g.strokeRect(2140, 4812, 20, 14);
    // back yard: grass, the engawa along the house, stepping stones
    g.fillStyle = '#2f4430'; g.fillRect(1470, 5160, 980, 310);
    for (var bx = 1480; bx < 2440; bx += 60) for (var by = 5170; by < 5460; by += 60) { var hh = hsh2(bx, by); g.fillStyle = hh < 0.5 ? 'rgba(140,190,120,.06)' : 'rgba(0,0,0,.08)'; g.beginPath(); g.arc(bx + hh * 40, by + (1 - hh) * 40, 18 + hh * 16, 0, 6.283); g.fill(); }
    g.fillStyle = '#6a4a2e'; g.fillRect(1690, 5140, 620, 26); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; for (var ex = 1690; ex < 2310; ex += 22) { g.beginPath(); g.moveTo(ex, 5140); g.lineTo(ex, 5166); g.stroke(); }
    [[1690, 5195], [1655, 5235], [1640, 5270]].forEach(function (p) { stone(g, p[0], p[1], 15, '#8f8a7e'); });
    [[2330, 5200], [2390, 5230], [2440, 5270]].forEach(function (p) { stone(g, p[0], p[1], 14, '#8f8a7e'); });
    // koi pond with rocks
    g.fillStyle = '#4c5a44'; g.beginPath(); g.ellipse(2090, 5320, 146, 76, 0, 0, 6.283); g.fill();
    g.fillStyle = '#1e4260'; g.beginPath(); g.ellipse(2090, 5320, 130, 63, 0, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(150,195,230,.18)'; g.lineWidth = 2; for (var wv = 0; wv < 4; wv++) { var wx = 2010 + wv * 50, wy = 5300 + (wv % 2) * 30 + Math.sin(t + wv) * 4; g.beginPath(); g.moveTo(wx, wy); g.quadraticCurveTo(wx + 15, wy - 4, wx + 30, wy); g.stroke(); }
    [[0, '#e8873a'], [2.1, '#eeeae0'], [4.2, '#d8452f']].forEach(function (k) { var a = t * 0.5 + k[0], kx = 2090 + Math.cos(a) * 80, ky = 5320 + Math.sin(a) * 34; g.save(); g.translate(kx, ky); g.rotate(a + 1.57); g.fillStyle = k[1]; g.beginPath(); g.ellipse(0, 0, 4, 10, 0, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(0, 9); g.lineTo(-4, 15); g.lineTo(4, 15); g.fill(); g.restore(); });
    [[1975, 5280, 16], [2205, 5350, 14], [2150, 5262, 10]].forEach(function (p) { stone(g, p[0], p[1], p[2], '#7d786c'); });
    // laundry pole: two posts and a line with a white shirt
    g.fillStyle = '#5a4a3a'; g.fillRect(2245, 5390, 8, 8); g.fillRect(2395, 5390, 8, 8);
    g.strokeStyle = '#c9c3b0'; g.lineWidth = 2; g.beginPath(); g.moveTo(2249, 5394); g.lineTo(2399, 5394); g.stroke();
    g.fillStyle = '#e9e4d3'; g.fillRect(2290, 5390, 26, 18); g.fillStyle = '#c9a43a'; g.fillRect(2340, 5390, 18, 22);
  }
}
function rrect(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath(); }
// each master's summoning circle stays on the ground where the war began, slowly fading
function drawCircles(g, vr, t) {
  if (!G || !G.circles) return;
  G.circles.forEach(function (c) {
    if (!vis(vr, c.x - 120, c.y - 120, c.x + 120, c.y + 120)) return;
    var glow = INTRO && INTRO.c === c ? INTRO.glow : 0, al = INTRO ? 0.55 + glow * 0.45 : clamp(1 - G.time / 90, 0, 1) * 0.8;
    if (al <= 0.01) return;
    if (glow > 0) { var lg = g.createRadialGradient(c.x, c.y, 10, c.x, c.y, 150 + glow * 60); lg.addColorStop(0, rgbaOf(c.col, 0.35 * glow)); lg.addColorStop(1, rgbaOf(c.col, 0)); g.fillStyle = lg; g.fillRect(c.x - 220, c.y - 220, 440, 440); }
    runeCircle(g, c.x, c.y, 88, c.col, t * (0.4 + glow * 2), al);
  });
}
/* ---- doors: a lit, framed door on the outside with a mat and lanterns; inside, a bright opening marked EXIT ---- */
function doorRoom(d) { for (var i = 0; i < MAP.rooms.length; i++) if (MAP.rooms[i].id === d.room) return MAP.rooms[i]; return null; }
function chevrons(g, x, y, ax, ay, col, t) {
  for (var i = 0; i < 3; i++) { var ph = ((t * 1.6 + i / 3) % 1), px = x + ax * (ph * 60 - 30), py = y + ay * (ph * 60 - 30); g.globalAlpha = Math.sin(ph * Math.PI) * 0.9; g.strokeStyle = col; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(px - ay * 14 - ax * 10, py + ax * 14 - ay * 10); g.lineTo(px, py); g.lineTo(px + ay * 14 - ax * 10, py - ax * 14 - ay * 10); g.stroke(); }
  g.globalAlpha = 1; g.lineCap = 'butt';
}
function drawDoors(g) {
  if (!MAP.doors || !G) return;
  var vr = VIEWR, t = G.time + (INTRO ? INTRO.t : 0), me = G.f[MEI], inside = !!roomAt(me.x, me.y);
  MAP.doors.forEach(function (d) {
    var o = d.out, i = d.in, rm = doorRoom(d);
    // outside face, on the building's wall
    if (!inside && vis(vr, o.x - 160, o.y - 160, o.x + 160, o.y + 160)) {
      var ex = o.x - o.nx * 15, ey = o.y - o.ny * 15, tx = -o.ny, ty = o.nx, near = Math.hypot(me.x - o.x, me.y - o.y) < 340;
      var lg = g.createRadialGradient(o.x + o.nx * 20, o.y + o.ny * 20, 4, o.x + o.nx * 20, o.y + o.ny * 20, 130); lg.addColorStop(0, 'rgba(255,205,120,.38)'); lg.addColorStop(1, 'rgba(255,205,120,0)'); g.fillStyle = lg; g.fillRect(o.x - 150, o.y - 150, 300, 300);
      g.save(); g.translate(ex, ey); g.rotate(Math.atan2(ty, tx));
      // mat, frame, double doors, handles: local x runs along the wall, local y points out of the building
      var oy = o.nx * ty - o.ny * tx < 0 ? 1 : -1; // which local y is outward
      g.fillStyle = '#5a3a2a'; g.fillRect(-34, oy > 0 ? 6 : -30, 68, 24);
      g.fillStyle = '#d9c38a'; g.fillRect(-46, -10, 92, 20);
      g.fillStyle = '#6a3a1e'; g.fillRect(-40, -7, 39, 14); g.fillRect(1, -7, 39, 14);
      g.fillStyle = '#f2d78a'; g.beginPath(); g.arc(-6, 0, 2.6, 0, 6.283); g.arc(6, 0, 2.6, 0, 6.283); g.fill();
      g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(-46, -10, 92, 20);
      [-56, 56].forEach(function (lx) { g.fillStyle = '#2a2420'; g.fillRect(lx - 5, -5, 10, 10); g.fillStyle = 'rgba(255,214,140,' + (0.75 + 0.2 * Math.sin(t * 3 + lx)) + ')'; g.beginPath(); g.arc(lx, 0, 4, 0, 6.283); g.fill(); });
      g.restore();
      if (near) { chevrons(g, o.x + o.nx * 50, o.y + o.ny * 50, -o.nx, -o.ny, '#ffe0a0', t); doorLabel(g, o.x + o.nx * 105, o.y + o.ny * 105 + 8, 'ENTER', rm ? rm.name : ''); }
    }
    // inside face: a bright opening in the wall, moonlight spilling in
    if (inside && rm && vis(vr, i.x - 200, i.y - 200, i.x + 200, i.y + 200)) {
      var wx = i.nx > 0 ? rm.x1 : i.nx < 0 ? rm.x0 : i.x, wy = i.ny > 0 ? rm.y1 : i.ny < 0 ? rm.y0 : i.y, nearI = Math.hypot(me.x - i.x, me.y - i.y) < 340;
      var sg = g.createLinearGradient(wx, wy, wx - i.nx * 170, wy - i.ny * 170); sg.addColorStop(0, 'rgba(180,205,240,.38)'); sg.addColorStop(1, 'rgba(180,205,240,0)');
      g.fillStyle = sg; g.beginPath(); g.moveTo(wx - i.ny * 55, wy + i.nx * 55); g.lineTo(wx + i.ny * 55, wy - i.nx * 55); g.lineTo(wx + i.ny * 95 - i.nx * 170, wy - i.nx * 95 - i.ny * 170); g.lineTo(wx - i.ny * 95 - i.nx * 170, wy + i.nx * 95 - i.ny * 170); g.closePath(); g.fill();
      g.save(); g.translate(wx, wy); g.rotate(Math.atan2(i.nx, -i.ny));
      g.fillStyle = '#c9a43a'; g.fillRect(-64, -2, 128, 32); g.fillStyle = '#aebfd6'; g.fillRect(-54, -2, 108, 27); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(-54, -2, 108, 7);
      g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(-64, -2, 128, 32);
      g.restore();
      doorLabel(g, i.x - i.nx * 50, i.y - i.ny * 50 + 8, 'EXIT', '');
      if (nearI) chevrons(g, i.x, i.y, i.nx, i.ny, '#cfe0ff', t);
    }
  });
}
function doorLabel(g, x, y, s, sub) {
  g.save(); g.textAlign = 'center'; g.font = '700 22px "Barlow Condensed", sans-serif'; var w = Math.max(g.measureText(s).width, sub ? g.measureText(sub).width * 0.75 : 0) + 22;
  g.fillStyle = 'rgba(6,10,16,.72)'; rrect(g, x - w / 2, y - 21, w, sub ? 46 : 28, 6); g.fill();
  g.fillStyle = '#ffe9b0'; g.fillText(s, x, y); if (sub) { g.font = '600 16px "Barlow Condensed", sans-serif'; g.fillStyle = 'rgba(233,228,211,.8)'; g.fillText(sub, x, y + 19); }
  g.restore();
}
/* ---- overhead: gates, arches and roofs you walk under. They fade while someone is beneath them. ---- */
function drawOverhead(g) {
  if (!MAP.cityW || !G) return;
  var vz = VIEW.zoom || 1, vr = { x0: VIEW.cx - VW / 2 / vz - 150, y0: VIEW.cy - VH / 2 / vz - 150, x1: VIEW.cx + VW / 2 / vz + 150, y1: VIEW.cy + VH / 2 / vz + 150 };
  MAP.b.forEach(function (b) {
    if (!b.over) return; var x0 = b.x - b.w / 2, y0 = b.y - b.h / 2;
    if (!vis(vr, x0 - 40, y0 - 40, x0 + b.w + 40, y0 + b.h + 40)) return;
    var under = G.f.some(function (f) { return f.st !== 'dead' && visL(f) && f.x > x0 - 16 && f.x < x0 + b.w + 16 && f.y > y0 - 16 && f.y < y0 + b.h + 16; });
    var goal = under ? (b.k === 'arcade_roof' ? 0.25 : 0.42) : 1; b._a = b._a === undefined ? goal : b._a + (goal - b._a) * 0.15;
    g.save(); g.globalAlpha = b._a; overBlock(g, b, x0, y0, b.w, b.h); g.restore();
  });
}
function overBlock(g, b, x0, y0, w, h) {
  var k = b.k;
  // shadow on the ground below, offset like the buildings'
  if (k !== 'bridgearch' && k !== 'arcade_roof') { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x0 + 10, y0 + 14, w, h); }
  if (k === 'gate_jp' || k === 'gate_roof') {
    // a tiled gate roof on four red posts
    var c = k === 'gate_jp' ? '#2f3236' : '#3d434b';
    hipRoof(g, x0 - 14, y0 - 8, w + 28, h + 16, c, true);
    if (k === 'gate_jp') { g.fillStyle = '#9a2a22'; [[x0 + 18, y0 + h / 2], [x0 + w - 18, y0 + h / 2], [b.x - 60, y0 + h / 2], [b.x + 60, y0 + h / 2]].forEach(function (p) { g.fillRect(p[0] - 7, p[1] - 7, 14, 14); }); g.fillStyle = '#c9a43a'; g.fillRect(b.x - 34, y0 + h - 4, 68, 12); g.strokeStyle = '#0b121a'; g.lineWidth = 1.5; g.strokeRect(b.x - 34, y0 + h - 4, 68, 12); }
    else { g.fillStyle = '#5a3a24'; [[x0 + 6, y0 + h / 2], [x0 + w - 6, y0 + h / 2]].forEach(function (p) { g.fillRect(p[0] - 6, p[1] - 6, 12, 12); }); g.fillStyle = '#e9e4d3'; g.fillRect(x0 + w - 32, y0 + h - 2, 22, 10); g.fillStyle = '#2a2420'; g.font = '700 8px serif'; g.textAlign = 'center'; g.fillText('衛宮', x0 + w - 21, y0 + h + 6); }
    return;
  }
  if (k === 'torii_c') {
    // the church hill's iron lych-gate: two stone posts and a wrought arch with a cross at its crown
    g.fillStyle = '#7d7a72'; g.fillRect(x0 - 6, y0, 22, h); g.fillRect(x0 + w - 16, y0, 22, h); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(x0 - 6, y0, 22, h); g.strokeRect(x0 + w - 16, y0, 22, h);
    g.strokeStyle = '#1a1c20'; g.lineWidth = 7; g.beginPath(); g.moveTo(x0 + 5, b.y); g.quadraticCurveTo(b.x, y0 - 30, x0 + w - 5, b.y); g.stroke();
    g.strokeStyle = '#4a4e56'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x0 + 5, b.y); g.quadraticCurveTo(b.x, y0 - 30, x0 + w - 5, b.y); g.stroke();
    g.fillStyle = '#e9e4d3'; g.fillRect(b.x - 3, y0 - 26, 6, 22); g.fillRect(b.x - 9, y0 - 20, 18, 5); return;
  }
  if (k === 'castle_arch') {
    g.fillStyle = '#8a8f98'; g.fillRect(x0, y0, w, h); g.fillStyle = 'rgba(0,0,0,.22)'; for (var mq = 0; mq < w; mq += 24) g.fillRect(x0 + mq, y0, 12, 12);
    g.fillStyle = '#6a6f78'; g.fillRect(x0 + 40, y0 + 14, w - 80, h - 14); g.fillStyle = '#b8322a'; g.fillRect(b.x - 10, y0 + 18, 20, h - 22);
    g.strokeStyle = '#0b121a'; g.lineWidth = 2.5; g.strokeRect(x0, y0, w, h); return;
  }
  if (k === 'arcade_roof') {
    // glass and steel over the shopping street
    g.fillStyle = 'rgba(150,190,215,.22)'; g.fillRect(x0, y0, w, h); g.strokeStyle = '#5c6a76'; g.lineWidth = 5;
    for (var ax = x0; ax <= x0 + w; ax += 80) { g.beginPath(); g.moveTo(ax, y0); g.lineTo(ax, y0 + h); g.stroke(); }
    g.lineWidth = 3; g.beginPath(); g.moveTo(x0, b.y); g.lineTo(x0 + w, b.y); g.stroke(); g.strokeRect(x0, y0, w, h);
    g.fillStyle = 'rgba(255,255,255,.08)'; for (var gx = x0 + 6; gx < x0 + w; gx += 80) g.fillRect(gx, y0 + 6, 30, h / 2 - 10); return;
  }
  if (k === 'bridgearch') { drawBridgeArch(g); return; }
}
function drawBridgeArch(g) {
  var by = 2400, half = 110;
    // the arch ribs, bracing and hangers; the deck rises toward the middle
    var ax0 = 5640, ax1 = 6360, red = '#b8322a', redL = '#e05040';
    for (var i = 0; i < 18; i++) { var u = (i + 0.5) / 18, ux = ax0 + (ax1 - ax0) * u, hg = Math.sin(Math.PI * u); if (hg < 0.35) continue; g.strokeStyle = 'rgba(184,50,42,' + (0.55 + hg * 0.4) + ')'; g.lineWidth = 6; var dx = (ax1 - ax0) / 18; g.beginPath(); g.moveTo(ux - dx / 2, by - half - 10); g.lineTo(ux + dx / 2, by + half + 10); g.moveTo(ux + dx / 2, by - half - 10); g.lineTo(ux - dx / 2, by + half + 10); g.stroke(); }
    [-1, 1].forEach(function (sd) {
      var ry = by + sd * (half + 10);
      g.strokeStyle = '#5e1712'; g.lineWidth = 20; g.beginPath(); g.moveTo(ax0, ry); g.lineTo(ax1, ry); g.stroke();
      g.strokeStyle = red; g.lineWidth = 14; g.beginPath(); g.moveTo(ax0, ry); g.lineTo(ax1, ry); g.stroke();
      g.strokeStyle = redL; g.lineWidth = 4; g.beginPath(); g.moveTo(ax0 + 30, ry - sd * 3); g.lineTo(ax1 - 30, ry - sd * 3); g.stroke();
      g.fillStyle = '#e9e4d3'; for (var hx = ax0 + 40; hx < ax1 - 20; hx += 40) { g.beginPath(); g.arc(hx, ry, 2.5, 0, 6.283); g.fill(); }
    });
    g.strokeStyle = red; g.lineWidth = 10; [ax0, ax1].forEach(function (ex) { g.beginPath(); g.moveTo(ex, by - half - 10); g.lineTo(ex, by + half + 10); g.stroke(); });
}
