/* ---- drawing Fuyuki City: ground, roads, bridges, buildings, interiors ----
   Top-down at night, light from the upper left: roofs get a lit and a shaded side, taller buildings cast longer shadows. */
var CITY_PAL = {
  miyama: '#2f3530', shinto: '#2c2f34', forest: '#1d3022', temple: '#57524a', hill: '#2c382b', churchyard: '#2b382c', schoolyard: '#54473a', park: '#2a4430',
  sand: '#8a7c5c', plaza: '#45484e', harbor: '#3a3e44', castle: '#4a4b48', emiya: '#474d3e', garden: '#2b472f', arcade: '#4a4646', water: '#1b3a55', pond: '#1e4260', churchhill: '#26362a', clearing: '#3b4637', cemetery: '#2c3a2e'
};
function cityCache(m) {
  if (m._cc) return m._cc;
  var cc = { ix: [], lamps: [] }, R = m.roads;
  R.forEach(function (h) { if (!h.h || (h.kind !== 'avenue' && h.kind !== 'street')) return; R.forEach(function (v) { if (v.h || (v.kind !== 'avenue' && v.kind !== 'street')) return; if (v.x0 >= h.x0 && v.x0 <= h.x1 && h.y0 >= v.y0 && h.y0 <= v.y1) cc.ix.push({ x: v.x0, y: h.y0, hw: h.w, vw: v.w, endH: v.x0 === h.x0 || v.x0 === h.x1, endV: h.y0 === v.y0 || h.y0 === v.y1 }); }); });
  R.forEach(function (r) { if (r.kind !== 'avenue' && r.kind !== 'street') return; var len = r.h ? r.x1 - r.x0 : r.y1 - r.y0, step = r.kind === 'avenue' ? 280 : 360, off = r.w / 2 + 10;
    for (var t = 140; t < len; t += step) { var x = r.h ? r.x0 + t : r.x0, y = r.h ? r.y0 : r.y0 + t; if (r.h && x > 5640 && x < 6360) continue; if (!r.h && y > 0 && false) continue; cc.lamps.push(r.h ? [x, y - off] : [x - off, y]); cc.lamps.push(r.h ? [x + step / 2, y + off] : [x + off, y + step / 2]); } });
  m._cc = cc; return cc;
}
function vis(vr, x0, y0, x1, y1) { return !vr || (x1 > vr.x0 && x0 < vr.x1 && y1 > vr.y0 && y0 < vr.y1); }
function drawCity(g, m) {
  var vr = VIEWR, cc = cityCache(m), t = G ? G.time : 0, CW = m.cityW;
  g.fillStyle = '#050608'; g.fillRect(vr ? vr.x0 : 0, vr ? vr.y0 : 0, vr ? vr.x1 - vr.x0 : m.w, vr ? vr.y1 - vr.y0 : m.h);
  g.fillStyle = CITY_PAL.miyama; g.fillRect(0, 0, 5700, 7300); g.fillStyle = CITY_PAL.shinto; g.fillRect(6300, 0, CW - 6300, 7300);
  m.zones.forEach(function (z) {
    if (!vis(vr, z.x0, z.y0, z.x1, z.y1)) return;
    if (z.kind === 'water' || z.kind === 'railbridge') return;
    if (z.kind === 'pond') { g.fillStyle = CITY_PAL.pond; g.beginPath(); g.ellipse((z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2, (z.x1 - z.x0) / 2 + 30, (z.y1 - z.y0) / 2 + 20, 0, 0, 6.283); g.fill(); g.strokeStyle = '#4c5a44'; g.lineWidth = 10; g.stroke(); return; }
    g.fillStyle = CITY_PAL[z.kind] || '#333'; g.fillRect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0);
    zoneTexture(g, z, vr);
  });
  // water: river and bay
  m.zones.forEach(function (z) {
    if (z.kind !== 'water' || !vis(vr, z.x0, z.y0, z.x1, z.y1)) return;
    var x0 = Math.max(z.x0, vr ? vr.x0 : z.x0), x1 = Math.min(z.x1, vr ? vr.x1 : z.x1), y0 = Math.max(z.y0, vr ? vr.y0 : z.y0), y1 = Math.min(z.y1, vr ? vr.y1 : z.y1);
    g.fillStyle = CITY_PAL.water; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.strokeStyle = 'rgba(150,195,230,.16)'; g.lineWidth = 2;
    for (var wy = y0 - (y0 % 54); wy < y1; wy += 54) for (var wx = x0 - (x0 % 150); wx < x1; wx += 150) { var ph = Math.sin(t * 1.3 + wx * 0.01 + wy * 0.03) * 6; g.beginPath(); g.moveTo(wx + ph, wy); g.quadraticCurveTo(wx + 40 + ph, wy - 6, wx + 80 + ph, wy); g.stroke(); }
  });
  // embankments
  g.fillStyle = '#4a4d4f'; g.fillRect(5680, 0, 22, 7300); g.fillRect(6298, 0, 22, 7300); g.fillRect(0, 7290, CW, 14);
  // roads: sidewalks, asphalt, markings
  var order = { lane: 0, path: 0, stairs: 1, rail: 2, street: 3, avenue: 4 };
  m.roads.slice().sort(function (a, b) { return order[a.kind] - order[b.kind]; }).forEach(function (r) { drawRoad(g, r, vr); });
  cc.ix.forEach(function (q) { if (vis(vr, q.x - 200, q.y - 200, q.x + 200, q.y + 200)) drawIntersection(g, q); });
  drawBridges(g, m, vr, t);
  // street lamps (pools of light)
  cc.lamps.forEach(function (l) { if (!vis(vr, l[0] - 90, l[1] - 90, l[0] + 90, l[1] + 90)) return; var lg = g.createRadialGradient(l[0], l[1], 2, l[0], l[1], 90); lg.addColorStop(0, 'rgba(255,214,140,.20)'); lg.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = lg; g.fillRect(l[0] - 90, l[1] - 90, 180, 180); g.fillStyle = '#c9c3b0'; g.beginPath(); g.arc(l[0], l[1], 4, 0, 6.283); g.fill(); });
  drawYards(g, vr, t);
  // interiors
  m.rooms.forEach(function (rm) { if (vis(vr, rm.x0, rm.y0, rm.x1, rm.y1)) drawRoom(g, rm, t); });
  drawCircles(g, vr, t); drawFields(g, vr, t); drawTasks(g, vr, t); drawEventsGround(g, vr, t);
  if (m.labels) { g.save(); g.textAlign = 'center'; g.font = '700 58px "Barlow Condensed", sans-serif'; g.fillStyle = 'rgba(233,228,211,.10)'; m.labels.forEach(function (lb) { if (vis(vr, lb[1] - 600, lb[2] - 70, lb[1] + 600, lb[2] + 20)) g.fillText(lb[0], lb[1], lb[2]); }); g.restore(); }
}
function zoneTexture(g, z, vr) {
  var x0 = Math.max(z.x0, vr ? vr.x0 : z.x0), x1 = Math.min(z.x1, vr ? vr.x1 : z.x1), y0 = Math.max(z.y0, vr ? vr.y0 : z.y0), y1 = Math.min(z.y1, vr ? vr.y1 : z.y1), k = z.kind;
  if (x1 <= x0 || y1 <= y0) return;
  g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
  if (k === 'forest' || k === 'park' || k === 'hill' || k === 'garden' || k === 'churchyard' || k === 'churchhill' || k === 'cemetery') {
    for (var gx = x0 - (x0 % 90); gx < x1; gx += 90) for (var gy = y0 - (y0 % 90); gy < y1; gy += 90) { var h = Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453; h -= Math.floor(h); g.fillStyle = h < 0.5 ? 'rgba(120,170,110,.07)' : 'rgba(0,0,0,.10)'; g.beginPath(); g.arc(gx + h * 60, gy + (1 - h) * 60, 26 + h * 30, 0, 6.283); g.fill(); }
    if (k === 'park' || k === 'garden') { g.strokeStyle = 'rgba(160,200,140,.05)'; g.lineWidth = 30; for (var sx = x0 - (x0 % 120); sx < x1; sx += 120) { g.beginPath(); g.moveTo(sx, y0); g.lineTo(sx, y1); g.stroke(); } }
  } else if (k === 'temple' || k === 'castle' || k === 'emiya') {
    g.strokeStyle = k === 'temple' ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.18)'; g.lineWidth = 2;
    if (k === 'temple') { for (var ry = y0 - (y0 % 18); ry < y1; ry += 18) { g.beginPath(); g.moveTo(x0, ry); g.lineTo(x1, ry); g.stroke(); } }
    else for (var cy = y0 - (y0 % 40); cy < y1; cy += 40) for (var cx = x0 - (x0 % 60) + (cy / 40 % 2) * 30; cx < x1; cx += 60) g.strokeRect(cx, cy, 60, 40);
  } else if (k === 'schoolyard') {
    g.fillStyle = '#6a5640'; g.beginPath(); g.ellipse(3950, 3170, 640, 250, 0, 0, 6.283); g.fill(); g.fillStyle = '#365234'; g.beginPath(); g.ellipse(3950, 3170, 520, 160, 0, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(240,240,240,.5)'; g.lineWidth = 3; [580, 545, 510].forEach(function (rx, i) { g.beginPath(); g.ellipse(3950, 3170, rx, 225 - i * 12, 0, 0, 6.283); g.stroke(); });
  } else if (k === 'plaza' || k === 'arcade' || k === 'harbor') {
    g.strokeStyle = k === 'harbor' ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.05)'; g.lineWidth = 2; var st = k === 'harbor' ? 160 : 50;
    for (var px = x0 - (x0 % st); px < x1; px += st) { g.beginPath(); g.moveTo(px, y0); g.lineTo(px, y1); g.stroke(); } for (var py = y0 - (y0 % st); py < y1; py += st) { g.beginPath(); g.moveTo(x0, py); g.lineTo(x1, py); g.stroke(); }
    if (k === 'harbor') { g.strokeStyle = '#d9a73a'; g.lineWidth = 6; g.setLineDash([36, 22]); g.beginPath(); g.moveTo(x0, 7260); g.lineTo(x1, 7260); g.stroke(); g.setLineDash([]); }
    if (k === 'arcade') { g.fillStyle = 'rgba(180,210,230,.08)'; for (var ax = 3110; ax < 4300; ax += 80) g.fillRect(ax, 4632, 70, 136); }
  } else if (k === 'sand') {
    for (var bx = x0 - (x0 % 70); bx < x1; bx += 70) for (var by = y0 - (y0 % 50); by < y1; by += 50) { var hh = Math.sin(bx * 3.1 + by * 7.7) * 999; hh -= Math.floor(hh); if (hh < 0.3) { g.fillStyle = 'rgba(255,240,200,.08)'; g.fillRect(bx, by, 6, 3); } }
  }
  g.restore();
}
function drawRoad(g, r, vr) {
  var hw = r.w / 2, x0 = r.h ? r.x0 : r.x0 - hw, y0 = r.h ? r.y0 - hw : r.y0, w = r.h ? r.x1 - r.x0 : r.w, h = r.h ? r.w : r.y1 - r.y0;
  if (!vis(vr, x0 - 40, y0 - 40, x0 + w + 40, y0 + h + 40)) return;
  var k = r.kind;
  if (k === 'path') { g.fillStyle = '#5e5a4c'; g.fillRect(x0, y0, w, h); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.strokeRect(x0, y0, w, h); g.fillStyle = 'rgba(255,255,255,.04)'; for (var s = 0; s < (r.h ? w : h); s += 34) { if (r.h) g.fillRect(x0 + s, y0 + 3, 30, h - 6); else g.fillRect(x0 + 3, y0 + s, w - 6, 30); } return; }
  if (k === 'lane') { g.fillStyle = '#4c4e50'; g.fillRect(x0 - 8, y0 - 8, w + 16, h + 16); g.fillStyle = '#383a3d'; g.fillRect(x0, y0, w, h); g.strokeStyle = 'rgba(200,200,190,.28)'; g.lineWidth = 2; g.strokeRect(x0 + 4, y0 + 4, w - 8, h - 8); return; }
  if (k === 'stairs') { g.fillStyle = '#6e6a5e'; g.fillRect(x0, y0, w, h); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (var st = y0; st < y0 + h; st += 16) { g.beginPath(); g.moveTo(x0, st); g.lineTo(x0 + w, st); g.stroke(); } g.fillStyle = '#4a463c'; g.fillRect(x0 - 10, y0, 10, h); g.fillRect(x0 + w, y0, 10, h); return; }
  if (k === 'rail') {
    var a0 = Math.max(x0, vr ? vr.x0 : x0), a1 = Math.min(x0 + w, vr ? vr.x1 : x0 + w);
    g.fillStyle = '#3a3530'; g.fillRect(a0, y0, a1 - a0, h); g.strokeStyle = '#5a4634'; g.lineWidth = 7;
    for (var tx = a0 - (a0 % 26); tx < a1; tx += 26) { [r.y0 - 30, r.y0 + 30].forEach(function (cy) { g.beginPath(); g.moveTo(tx, cy - 22); g.lineTo(tx, cy + 22); g.stroke(); }); }
    g.strokeStyle = '#a6adb5'; g.lineWidth = 3; [r.y0 - 46, r.y0 - 14, r.y0 + 14, r.y0 + 46].forEach(function (ry) { g.beginPath(); g.moveTo(a0, ry); g.lineTo(a1, ry); g.stroke(); });
    return;
  }
  var side = k === 'avenue' ? 26 : 18;
  g.fillStyle = '#585c61'; if (r.h) g.fillRect(x0 - side, y0 - side, w + side * 2, h + side * 2); else g.fillRect(x0 - side, y0 - side, w + side * 2, h + side * 2);
  g.fillStyle = 'rgba(255,255,255,.05)'; var seg = r.h ? w : h; for (var q = 0; q < seg; q += 40) { if (r.h) { g.fillRect(x0 + q, y0 - side, 1.5, side); g.fillRect(x0 + q, y0 + h, 1.5, side); } else { g.fillRect(x0 - side, y0 + q, side, 1.5); g.fillRect(x0 + w, y0 + q, side, 1.5); } }
  g.fillStyle = k === 'avenue' ? '#303338' : '#36393e'; g.fillRect(x0, y0, w, h);
  g.strokeStyle = '#7a7e83'; g.lineWidth = 3; g.strokeRect(x0, y0, w, h);
  g.save(); g.lineWidth = 3;
  if (k === 'avenue') {
    g.strokeStyle = '#c9a43a'; [-5, 5].forEach(function (o) { g.beginPath(); if (r.h) { g.moveTo(x0, r.y0 + o); g.lineTo(x0 + w, r.y0 + o); } else { g.moveTo(r.x0 + o, y0); g.lineTo(r.x0 + o, y0 + h); } g.stroke(); });
    g.strokeStyle = 'rgba(225,225,225,.55)'; g.setLineDash([40, 40]); [-hw / 2, hw / 2].forEach(function (o) { g.beginPath(); if (r.h) { g.moveTo(x0, r.y0 + o); g.lineTo(x0 + w, r.y0 + o); } else { g.moveTo(r.x0 + o, y0); g.lineTo(r.x0 + o, y0 + h); } g.stroke(); });
  } else { g.strokeStyle = 'rgba(225,225,225,.5)'; g.setLineDash([34, 30]); g.beginPath(); if (r.h) { g.moveTo(x0, r.y0); g.lineTo(x0 + w, r.y0); } else { g.moveTo(r.x0, y0); g.lineTo(r.x0, y0 + h); } g.stroke(); }
  g.restore();
}
function drawIntersection(g, q) {
  var hw = q.vw / 2, hh = q.hw / 2;
  g.fillStyle = '#33363b'; g.fillRect(q.x - hw, q.y - hh, q.vw, q.hw);
  g.fillStyle = 'rgba(232,232,232,.55)';
  function zebra(cx, cy, len, across, horiz) { for (var s = -len / 2 + 6; s < len / 2 - 6; s += 18) { if (horiz) g.fillRect(cx + s, cy - across / 2, 9, across); else g.fillRect(cx - across / 2, cy + s, across, 9); } }
  if (!q.endV) { zebra(q.x, q.y - hh - 22, q.vw, 28, true); zebra(q.x, q.y + hh + 22, q.vw, 28, true); }
  if (!q.endH) { zebra(q.x - hw - 22, q.y, q.hw, 28, false); zebra(q.x + hw + 22, q.y, q.hw, 28, false); }
}
function drawBridges(g, m, vr, t) {
  // Fuyuki Bridge: red steel arch over the Mion, deck at y 2400
  var by = 2400, x0 = 5560, x1 = 6440, half = 110;
  if (vis(vr, x0 - 100, by - 400, x1 + 100, by + 400)) {
    g.fillStyle = 'rgba(0,0,0,.35)'; for (var s = 0; s <= 1; s += 0.02) { var hgt = Math.sin(Math.PI * s) * 150, sx = x0 + 60 + (x1 - x0 - 120) * s; g.fillRect(sx + hgt * 0.35, by - half - 6 + hgt * 0.6, 22, 14); g.fillRect(sx + hgt * 0.35, by + half - 8 + hgt * 0.6, 22, 14); }
    g.fillStyle = '#3c3f44'; g.fillRect(x0, by - half - 18, x1 - x0, half * 2 + 36);
    g.fillStyle = '#303338'; g.fillRect(x0, by - half, x1 - x0, half * 2);
    g.strokeStyle = '#c9a43a'; g.lineWidth = 3; [-5, 5].forEach(function (o) { g.beginPath(); g.moveTo(x0, by + o); g.lineTo(x1, by + o); g.stroke(); });
    g.strokeStyle = 'rgba(225,225,225,.5)'; g.setLineDash([40, 40]); [-55, 55].forEach(function (o) { g.beginPath(); g.moveTo(x0, by + o); g.lineTo(x1, by + o); g.stroke(); }); g.setLineDash([]);
    // piers
    g.fillStyle = '#5b5f66'; [5700, 6300].forEach(function (px) { g.fillRect(px - 30, by - half - 40, 60, 24); g.fillRect(px - 30, by + half + 16, 60, 24); });
    // lamps on the walkways
    for (var lx = x0 + 40; lx < x1; lx += 120) [-1, 1].forEach(function (sd) { var ly = by + sd * (half + 6), lg = g.createRadialGradient(lx, ly, 2, lx, ly, 70); lg.addColorStop(0, 'rgba(255,214,140,.25)'); lg.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = lg; g.fillRect(lx - 70, ly - 70, 140, 140); });
  }
  // Mion Bridge: concrete girder bridge at y 5600
  var my = 5600, mh = 95;
  if (vis(vr, 5600, my - 200, 6400, my + 200)) {
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(5700 + 18, my - mh - 14 + 26, 600, mh * 2 + 28);
    g.fillStyle = '#6a6e74'; g.fillRect(5640, my - mh - 16, 720, mh * 2 + 32); g.fillStyle = '#303338'; g.fillRect(5640, my - mh, 720, mh * 2);
    g.strokeStyle = '#c9a43a'; g.lineWidth = 3; [-5, 5].forEach(function (o) { g.beginPath(); g.moveTo(5640, my + o); g.lineTo(6360, my + o); g.stroke(); });
    g.strokeStyle = '#9aa0a8'; g.lineWidth = 4; [-1, 1].forEach(function (sd) { g.beginPath(); g.moveTo(5640, my + sd * (mh + 10)); g.lineTo(6360, my + sd * (mh + 10)); g.stroke(); for (var px = 5650; px < 6360; px += 30) { g.fillStyle = '#9aa0a8'; g.fillRect(px, my + sd * (mh + 10) - 3, 4, 6); } });
  }
  // railway bridge: steel truss at y 4050
  if (vis(vr, 5600, 3950, 6400, 4150)) {
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(5720, 4000, 600, 130);
    g.strokeStyle = '#7f8791'; g.lineWidth = 6; [-58, 58].forEach(function (o) { g.beginPath(); g.moveTo(5660, 4050 + o); g.lineTo(6340, 4050 + o); g.stroke(); });
    g.lineWidth = 3; g.beginPath(); for (var zx = 5660, up = 1; zx < 6340; zx += 40, up = -up) { g.moveTo(zx, 4050 - 58); g.lineTo(zx + 40, 4050 + 58); } g.stroke();
  }
}
/* ---- buildings ---- */
var ROOF_JP = ['#4a4f58', '#55504a', '#3f4a52', '#574d55', '#465049', '#4d4a42'], ROOF_W = ['#7d4636', '#6a4038', '#566070', '#7a5a48', '#5f4a40'];
var BHEIGHT = { house_jp: 8, house_jpL: 9, house_w: 9, mansion_w: 14, mansion_d: 14, mansion_s: 11, villa_e: 14, safehouse: 9, apt: 22, apt_s: 12, tower: 34, office: 26, shop_big: 12, shop: 8, hotel: 44, hotel_s: 18, center: 52, mall: 20, station: 14, station_s: 10, civic: 18, school: 16, gym: 16, dojo: 10, dojo_s: 9, storehouse: 9, temple: 16, temple2: 10, belltower: 12, gate_jp: 8, church: 22, chapel: 14, castle: 30, castletower: 40, castlewall: 10, warehouse: 14, box1: 8, box2: 8, box3: 8, grave: 2, fence: 2, wall: 5 };
function shade(hex, k) { var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255; function c(v) { return Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); } return 'rgb(' + c(r) + ',' + c(gg) + ',' + c(b) + ')'; }
function hipRoof(g, x0, y0, w, h, col, tiles) {
  var x1 = x0 + w, y1 = y0 + h, horiz = w >= h, d = Math.min(w, h) / 2;
  var poly = function (pts, c) { g.fillStyle = c; g.beginPath(); g.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };
  if (horiz) { var cy = y0 + h / 2; poly([x0, y0, x1, y0, x1 - d, cy, x0 + d, cy], shade(col, 0.18)); poly([x0, y1, x1, y1, x1 - d, cy, x0 + d, cy], shade(col, -0.25)); poly([x0, y0, x0 + d, cy, x0, y1], shade(col, 0.05)); poly([x1, y0, x1 - d, cy, x1, y1], shade(col, -0.12)); }
  else { var cx = x0 + w / 2; poly([x0, y0, x0, y1, cx, y1 - d, cx, y0 + d], shade(col, 0.12)); poly([x1, y0, x1, y1, cx, y1 - d, cx, y0 + d], shade(col, -0.22)); poly([x0, y0, cx, y0 + d, x1, y0], shade(col, 0.22)); poly([x0, y1, cx, y1 - d, x1, y1], shade(col, -0.3)); }
  if (tiles) { g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.2; if (horiz) for (var ty = y0 + 6; ty < y1; ty += 7) { g.beginPath(); g.moveTo(x0, ty); g.lineTo(x1, ty); g.stroke(); } else for (var tx = x0 + 6; tx < x1; tx += 7) { g.beginPath(); g.moveTo(tx, y0); g.lineTo(tx, y1); g.stroke(); } g.restore(); }
  g.strokeStyle = shade(col, -0.45); g.lineWidth = 3; g.beginPath(); if (horiz) { g.moveTo(x0 + d, y0 + h / 2); g.lineTo(x1 - d, y0 + h / 2); } else { g.moveTo(x0 + w / 2, y0 + d); g.lineTo(x0 + w / 2, y1 - d); } g.stroke();
  g.strokeStyle = '#0b121a'; g.lineWidth = 2.5; g.strokeRect(x0, y0, w, h);
}
function gableRoof(g, x0, y0, w, h, col) {
  var horiz = w >= h; g.fillStyle = shade(col, 0.15); if (horiz) g.fillRect(x0, y0, w, h / 2); else g.fillRect(x0, y0, w / 2, h); g.fillStyle = shade(col, -0.22); if (horiz) g.fillRect(x0, y0 + h / 2, w, h / 2); else g.fillRect(x0 + w / 2, y0, w / 2, h);
  g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 1; g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); if (horiz) for (var tx = x0 + 8; tx < x0 + w; tx += 9) { g.beginPath(); g.moveTo(tx, y0); g.lineTo(tx, y0 + h); g.stroke(); } else for (var ty = y0 + 8; ty < y0 + h; ty += 9) { g.beginPath(); g.moveTo(x0, ty); g.lineTo(x0 + w, ty); g.stroke(); } g.restore();
  g.strokeStyle = shade(col, -0.5); g.lineWidth = 3; g.beginPath(); if (horiz) { g.moveTo(x0, y0 + h / 2); g.lineTo(x0 + w, y0 + h / 2); } else { g.moveTo(x0 + w / 2, y0); g.lineTo(x0 + w / 2, y0 + h); } g.stroke();
  g.strokeStyle = '#0b121a'; g.lineWidth = 2.5; g.strokeRect(x0, y0, w, h);
}
function flatRoof(g, x0, y0, w, h, col, i, extra) {
  g.fillStyle = col; g.fillRect(x0, y0, w, h); g.strokeStyle = shade(col, 0.25); g.lineWidth = 6; g.strokeRect(x0 + 5, y0 + 5, w - 10, h - 10);
  g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1; g.strokeRect(x0 + 10, y0 + 10, w - 20, h - 20);
  var hsh = Math.sin(i * 91.7) * 1000; hsh -= Math.floor(hsh);
  var n = 2 + Math.floor(hsh * 4); for (var k = 0; k < n; k++) { var ux = x0 + 18 + ((hsh * 997 * (k + 1)) % 1) * (w - 60), uy = y0 + 18 + ((hsh * 613 * (k + 3)) % 1) * (h - 50); g.fillStyle = '#6f757c'; g.fillRect(ux, uy, 30, 22); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(ux + 4, uy + 22, 30, 5); g.strokeStyle = '#2a2e33'; g.lineWidth = 1.5; g.beginPath(); g.arc(ux + 15, uy + 11, 7, 0, 6.283); g.stroke(); }
  if (extra === 'tank' && w > 160) { g.fillStyle = '#58606a'; g.beginPath(); g.arc(x0 + w - 40, y0 + 40, 20, 0, 6.283); g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.stroke(); }
  if (extra === 'heli') { var cx = x0 + w / 2, cy = y0 + h / 2, r = Math.min(w, h) * 0.28; g.strokeStyle = '#e9d36a'; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.stroke(); g.fillStyle = '#e9d36a'; g.font = '700 ' + Math.round(r) + 'px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillText('H', cx, cy + r * 0.36); }
  g.strokeStyle = '#0b121a'; g.lineWidth = 2.5; g.strokeRect(x0, y0, w, h);
}
function drawCityBlock(g, b, i) {
  if (b.hide || b.over) return;
  var k = b.k, x0 = b.x - b.w / 2, y0 = b.y - b.h / 2, w = b.w, h = b.h, sh = BHEIGHT[k] === undefined ? 10 : BHEIGHT[k];
  if (sh > 2 && k !== 'iwall') { g.fillStyle = 'rgba(0,0,0,.38)'; g.beginPath(); g.moveTo(x0 + w, y0); g.lineTo(x0 + w + sh * 0.7, y0 + sh); g.lineTo(x0 + w + sh * 0.7, y0 + h + sh); g.lineTo(x0 + sh * 0.7, y0 + h + sh); g.lineTo(x0, y0 + h); g.closePath(); g.fill(); }
  switch (k) {
    case 'house_jp': hipRoof(g, x0, y0, w, h, ROOF_JP[i % ROOF_JP.length], true); break;
    case 'house_jpL': g.fillStyle = '#7a5a3a'; g.fillRect(x0, y0 + h - 14, w, 14); hipRoof(g, x0, y0, w, h - 14, '#3d434b', true); break;
    case 'house_w': gableRoof(g, x0, y0, w, h, ROOF_W[i % ROOF_W.length]); g.fillStyle = '#5a4a44'; g.fillRect(x0 + w * 0.7, y0 + h * 0.18, 16, 16); g.strokeStyle = '#0b121a'; g.lineWidth = 1.5; g.strokeRect(x0 + w * 0.7, y0 + h * 0.18, 16, 16); break;
    case 'mansion_w': case 'mansion_d': case 'mansion_s': case 'villa_e':
      var mc = k === 'mansion_w' ? '#7a3e34' : k === 'mansion_d' ? '#3a3444' : k === 'villa_e' ? '#cfd3da' : '#5e5560';
      hipRoof(g, x0 + w * 0.22, y0, w * 0.56, h * 0.8, mc, true); hipRoof(g, x0, y0 + h * 0.15, w * 0.26, h * 0.85, mc, true); hipRoof(g, x0 + w * 0.74, y0 + h * 0.15, w * 0.26, h * 0.85, mc, true);
      if (k === 'mansion_d' || k === 'villa_e') [[x0 + 10, y0 + h * 0.15 + 10], [x0 + w - 10, y0 + h * 0.15 + 10], [x0 + w / 2, y0 + 6]].forEach(function (p) { g.fillStyle = k === 'villa_e' ? '#9fa8b5' : '#251f2c'; g.beginPath(); g.arc(p[0], p[1], 14, 0, 6.283); g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.stroke(); });
      if (k === 'mansion_w') { g.fillStyle = '#d9c38a'; g.beginPath(); g.arc(x0 + w / 2, y0 + h * 0.4, 5, 0, 6.283); g.fill(); }
      break;
    case 'safehouse': flatRoof(g, x0, y0, w, h, '#4f545b', i); break;
    case 'chapel': hipRoof(g, x0, y0, w, h, '#5b6270', true); g.fillStyle = '#e9e4d3'; g.fillRect(b.x - 4, b.y - 20, 8, 40); g.fillRect(b.x - 14, b.y - 8, 28, 8); break;
    case 'hotel_s': flatRoof(g, x0, y0, w, h, '#606670', i, 'tank'); break;
    case 'tower': flatRoof(g, x0, y0, w, h, ['#4c5560', '#535a63', '#46505c', '#5a5e66'][i % 4], i, 'tank'); break;
    case 'office': flatRoof(g, x0, y0, w, h, '#5d636b', i); g.fillStyle = 'rgba(160,200,230,.15)'; g.fillRect(x0 + 16, b.y - 10, w - 32, 20); break;
    case 'shop_big': flatRoof(g, x0, y0, w, h, '#57565a', i); g.fillStyle = ['#a8452f', '#2f6fa8', '#3a8a5a', '#a88a2f'][i % 4]; g.fillRect(x0, y0 + h - 12, w, 12); break;
    case 'apt': case 'apt_s': flatRoof(g, x0, y0, w, h, '#5c5f66', i); g.fillStyle = '#6c7078'; g.fillRect(x0 + w * 0.4, y0 + h * 0.35, w * 0.22, h * 0.25); g.strokeStyle = '#0b121a'; g.lineWidth = 1.5; g.strokeRect(x0 + w * 0.4, y0 + h * 0.35, w * 0.22, h * 0.25); g.strokeStyle = 'rgba(255,255,255,.12)'; for (var bl = x0 + 10; bl < x0 + w - 10; bl += 24) { g.beginPath(); g.moveTo(bl, y0 + h - 8); g.lineTo(bl + 16, y0 + h - 8); g.stroke(); } break;
    case 'shop': flatRoof(g, x0, y0, w, h, '#5a5655', i); g.fillStyle = ['#b04a3a', '#3a78b0', '#d0a040', '#4a9a6a', '#9a4ab0'][i % 5]; var awY = b.y < 4700 ? y0 + h - 16 : y0; for (var aw = 0; aw < 4; aw++) { g.globalAlpha = aw % 2 ? 0.95 : 0.55; g.fillRect(x0 + aw * w / 4, awY, w / 4, 16); } g.globalAlpha = 1; break;
    case 'hotel': flatRoof(g, x0, y0, w, h, '#646a74', i, 'heli'); break;
    case 'center': flatRoof(g, x0, y0, w, h, '#5a6878', i); g.strokeStyle = '#9fc0de'; g.lineWidth = 4; g.strokeRect(x0 + 40, y0 + 40, w - 80, h - 80); g.beginPath(); g.moveTo(x0 + 40, y0 + 40); g.lineTo(x0 + w - 40, y0 + h - 40); g.moveTo(x0 + w - 40, y0 + 40); g.lineTo(x0 + 40, y0 + h - 40); g.stroke(); g.fillStyle = '#ff4d4d'; [[x0 + 20, y0 + 20], [x0 + w - 20, y0 + 20], [x0 + 20, y0 + h - 20], [x0 + w - 20, y0 + h - 20]].forEach(function (p) { g.globalAlpha = 0.5 + 0.5 * Math.sin((G ? G.time : 0) * 3); g.beginPath(); g.arc(p[0], p[1], 5, 0, 6.283); g.fill(); }); g.globalAlpha = 1; break;
    case 'mall': flatRoof(g, x0, y0, w, h, '#5f6a58', i); g.fillStyle = 'rgba(150,200,230,.35)'; for (var gp = 0; gp < 6; gp++) g.fillRect(x0 + 60 + gp * (w - 120) / 6, y0 + h / 2 - 50, (w - 120) / 6 - 8, 100); break;
    case 'station': case 'station_s': flatRoof(g, x0, y0, w, h, '#6a6f78', i); g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 2; for (var sl = x0 + 30; sl < x0 + w; sl += 30) { g.beginPath(); g.moveTo(sl, y0 + 8); g.lineTo(sl, y0 + h - 8); g.stroke(); } break;
    case 'civic': flatRoof(g, x0, y0, w, h, '#6b6a66', i); g.fillStyle = '#8a8f99'; g.beginPath(); g.arc(b.x, b.y, Math.min(w, h) * 0.3, 0, 6.283); g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.stroke(); for (var rl = 0; rl < 12; rl++) { var ra = rl * 0.5236; g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x + Math.cos(ra) * Math.min(w, h) * 0.3, b.y + Math.sin(ra) * Math.min(w, h) * 0.3); g.stroke(); } break;
    case 'school': flatRoof(g, x0, y0, w, h, '#7d8288', i, 'tank'); g.fillStyle = '#c9c3b0'; g.fillRect(b.x - 30, y0 - 4, 60, 18); g.fillStyle = '#e9e4d3'; g.beginPath(); g.arc(b.x, y0 + 5, 7, 0, 6.283); g.fill(); break;
    case 'gym': g.fillStyle = '#3d6a9a'; g.fillRect(x0, y0, w, h); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x0, y0, w / 2, h); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 2; for (var gr = y0 + 16; gr < y0 + h; gr += 18) { g.beginPath(); g.moveTo(x0, gr); g.lineTo(x0 + w, gr); g.stroke(); } g.strokeStyle = '#0b121a'; g.lineWidth = 2.5; g.strokeRect(x0, y0, w, h); break;
    case 'dojo': case 'dojo_s': case 'storehouse': case 'temple2': hipRoof(g, x0, y0, w, h, k === 'storehouse' ? '#5a554e' : '#3d3a36', true); if (k === 'storehouse') { g.fillStyle = '#d8d2c2'; g.fillRect(x0 + 6, y0 + h - 10, w - 12, 6); } break;
    case 'temple': hipRoof(g, x0, y0, w, h, '#34363a', true); g.fillStyle = '#c9a43a'; [[x0 + h / 2, b.y], [x0 + w - h / 2, b.y]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 8, 0, 6.283); g.fill(); }); break;
    case 'belltower': hipRoof(g, x0, y0, w, h, '#3a3632', true); g.fillStyle = '#a98446'; g.beginPath(); g.arc(b.x, b.y, 18, 0, 6.283); g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.stroke(); break;
    case 'gate_jp': g.fillStyle = '#6a2a22'; g.fillRect(x0, y0, w, h); g.fillStyle = '#2a2420'; g.fillRect(x0 - 10, y0 - 6, w + 20, 10); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(x0, y0, w, h); break;
    case 'church':
      var nave = [x0 + w * 0.32, y0, w * 0.36, h], tr = [x0, y0 + h * 0.35, w, h * 0.3];
      gableRoof(g, nave[0], nave[1], nave[2], nave[3], '#59606c'); gableRoof(g, tr[0], tr[1], tr[2], tr[3], '#59606c');
      g.fillStyle = '#4a505a'; g.fillRect(b.x - 34, y0 - 10, 68, 68); g.strokeStyle = '#0b121a'; g.lineWidth = 2.5; g.strokeRect(b.x - 34, y0 - 10, 68, 68);
      g.fillStyle = '#e9e4d3'; g.fillRect(b.x - 5, y0 + 2, 10, 44); g.fillRect(b.x - 16, y0 + 14, 32, 9); break;
    case 'castle':
      hipRoof(g, x0 + w * 0.3, y0, w * 0.4, h, '#4e5868', true); hipRoof(g, x0, y0 + h * 0.25, w * 0.32, h * 0.6, '#4e5868', true); hipRoof(g, x0 + w * 0.68, y0 + h * 0.25, w * 0.32, h * 0.6, '#4e5868', true);
      g.fillStyle = '#c8ccd4'; g.fillRect(b.x - 70, y0 + h - 26, 140, 26); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(b.x - 70, y0 + h - 26, 140, 26);
      g.fillStyle = '#d9d4c8'; g.beginPath(); g.arc(b.x, b.y - 30, 26, 0, 6.283); g.fill(); g.stroke(); break;
    case 'castletower': g.fillStyle = '#7a8290'; g.beginPath(); g.arc(b.x, b.y, w / 2, 0, 6.283); g.fill(); g.strokeStyle = '#0b121a'; g.lineWidth = 3; g.stroke(); for (var cr = 0; cr < 16; cr++) { var ca = cr * 0.3927; g.strokeStyle = cr % 2 ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.15)'; g.lineWidth = 2; g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x + Math.cos(ca) * w / 2, b.y + Math.sin(ca) * w / 2); g.stroke(); } g.fillStyle = '#c9a43a'; g.beginPath(); g.arc(b.x, b.y, 6, 0, 6.283); g.fill(); break;
    case 'castlewall': case 'wall': g.fillStyle = k === 'castlewall' ? '#8a8f98' : '#8b857a'; g.fillRect(x0, y0, w, h); g.fillStyle = 'rgba(0,0,0,.25)'; var hz = w >= h; for (var mq = 0; mq < (hz ? w : h); mq += 24) { if (hz) g.fillRect(x0 + mq, y0, 12, h * 0.4); else g.fillRect(x0, y0 + mq, w * 0.4, 12); } g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(x0, y0, w, h); break;
    case 'fence': g.strokeStyle = '#1a1c20'; g.lineWidth = 4; g.beginPath(); if (w >= h) { g.moveTo(x0, b.y); g.lineTo(x0 + w, b.y); } else { g.moveTo(b.x, y0); g.lineTo(b.x, y0 + h); } g.stroke(); g.fillStyle = '#2a2d33'; for (var fp = 0; fp <= (w >= h ? w : h); fp += 40) { if (w >= h) g.fillRect(x0 + fp - 4, b.y - 4, 8, 8); else g.fillRect(b.x - 4, y0 + fp - 4, 8, 8); } break;
    case 'warehouse': flatRoof(g, x0, y0, w, h, '#56656e', i); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; for (var wq = x0 + 14; wq < x0 + w; wq += 14) { g.beginPath(); g.moveTo(wq, y0 + 4); g.lineTo(wq, y0 + h - 4); g.stroke(); } break;
    case 'cross_m': g.fillStyle = '#7d7a72'; g.fillRect(x0, y0, w, h); g.fillStyle = '#d6d2c6'; g.fillRect(b.x - 4, y0 + 4, 8, h - 8); g.fillRect(x0 + 6, b.y - 8, w - 12, 7); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(x0, y0, w, h); break;
    case 'woodpile': for (var wr = 0; wr < 3; wr++) for (var wc = 0; wc < 5; wc++) { g.fillStyle = wr % 2 ? '#7a5434' : '#8a6040'; g.beginPath(); g.arc(x0 + 8 + wc * (w - 16) / 4, y0 + 8 + wr * (h - 16) / 2, 7, 0, 6.283); g.fill(); g.strokeStyle = '#2a1a10'; g.lineWidth = 1.5; g.stroke(); g.fillStyle = '#c9a074'; g.beginPath(); g.arc(x0 + 8 + wc * (w - 16) / 4, y0 + 8 + wr * (h - 16) / 2, 3, 0, 6.283); g.fill(); } break;
    case 'crate': g.fillStyle = '#6a4a2c'; g.fillRect(x0, y0, w, h); g.strokeStyle = '#3a2616'; g.lineWidth = 4; g.strokeRect(x0 + 5, y0 + 5, w - 10, h - 10); g.beginPath(); g.moveTo(x0 + 5, y0 + 5); g.lineTo(x0 + w - 5, y0 + h - 5); g.stroke(); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(x0, y0, w, h); break;
    // interior furniture and walls
    case 'iwall': g.fillStyle = '#16130f'; g.fillRect(x0, y0, w, h); g.fillStyle = '#3d362d'; g.fillRect(x0 + 3, y0 + 3, w - 6, h - 6); g.fillStyle = 'rgba(255,240,210,.07)'; g.fillRect(x0 + 3, y0 + 3, w - 6, 3); break;
    case 'table': g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x0 + 6, y0 + 8, w, h); g.fillStyle = '#5a3e28'; g.fillRect(x0, y0, w, h); g.fillStyle = '#d6d0c2'; g.fillRect(x0 + 8, y0 + 8, w - 16, h - 16); g.fillStyle = '#c9a43a'; for (var cd = x0 + 40; cd < x0 + w - 20; cd += 90) { g.beginPath(); g.arc(cd, b.y, 5, 0, 6.283); g.fill(); } g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(x0, y0, w, h); break;
    case 'shelf': g.fillStyle = '#3e2b1c'; g.fillRect(x0, y0, w, h); for (var bk = 0; bk < (w > h ? w : h); bk += 9) { g.fillStyle = ['#7a2a2a', '#2a4a7a', '#5a6a2a', '#6a5a3a', '#4a2a5a'][Math.floor(bk / 9) % 5]; if (w > h) g.fillRect(x0 + bk, y0 + 4, 7, h - 8); else g.fillRect(x0 + 4, y0 + bk, w - 8, 7); } g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(x0, y0, w, h); break;
    case 'pew': g.fillStyle = '#4a3220'; g.fillRect(x0, y0, w, h); g.fillStyle = '#6a4a30'; g.fillRect(x0, y0, w, h * 0.4); g.strokeStyle = '#0b121a'; g.lineWidth = 1.5; g.strokeRect(x0, y0, w, h); break;
    case 'altar': g.fillStyle = '#d6d0c2'; g.fillRect(x0, y0, w, h); g.fillStyle = '#c9a43a'; g.fillRect(b.x - 4, y0 + 6, 8, h - 12); g.fillRect(b.x - 14, y0 + h * 0.35, 28, 7); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(x0, y0, w, h); break;
    case 'armory': g.fillStyle = '#2c2a28'; g.fillRect(x0, y0, w, h); g.strokeStyle = '#b8c0c8'; g.lineWidth = 3; for (var sw = x0 + 14; sw < x0 + w; sw += 26) { g.beginPath(); g.moveTo(sw, y0 + 6); g.lineTo(sw + 10, y0 + h - 6); g.stroke(); } break;
    case 'sofa': g.fillStyle = '#6a1e22'; g.fillRect(x0, y0, w, h); g.fillStyle = '#8a2a30'; g.fillRect(x0 + 10, y0 + 14, w - 20, h - 24); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(x0, y0, w, h); break;
    case 'kotatsu': g.fillStyle = '#8a3a2a'; g.fillRect(x0 - 10, y0 - 10, w + 20, h + 20); g.fillStyle = '#7a5a3a'; g.fillRect(x0, y0, w, h); g.fillStyle = '#e08a2a'; [[x0 + 40, y0 + 40], [x0 + w - 50, y0 + h - 40]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 9, 0, 6.283); g.fill(); }); break;
    case 'rack': g.fillStyle = '#5a3e28'; g.fillRect(x0, y0, w, h); g.strokeStyle = '#c9b48a'; g.lineWidth = 3; for (var bo = x0 + 20; bo < x0 + w; bo += 40) { g.beginPath(); g.moveTo(bo, y0 - 6); g.lineTo(bo + 8, y0 + h + 10); g.stroke(); } break;
    case 'confessional': g.fillStyle = '#3a2618'; g.fillRect(x0, y0, w, h); g.strokeStyle = '#c9a43a'; g.lineWidth = 2; g.strokeRect(x0 + 6, y0 + 6, w - 12, h - 12); break;
    default:
      if (k.indexOf('box') === 0 || k === 'grave' || k === 'goal') return drawBlock0(g, b, i);
      flatRoof(g, x0, y0, w, h, '#555a60', i);
  }
}
function drawRoom(g, rm, t) {
  var F = { marble: ['#7e7a72', '#6e6a62'], wood: ['#4f3826', '#46321f'], darkwood: ['#2f2328', '#271d22'], stone: ['#4e4b45', '#45423d'], tatami: ['#7a7a52', '#6e6e48'] }[rm.floor] || ['#444', '#3a3a3a'];
  var w = rm.x1 - rm.x0, h = rm.y1 - rm.y0;
  g.fillStyle = F[0]; g.fillRect(rm.x0, rm.y0, w, h);
  if (rm.floor === 'marble') { g.fillStyle = F[1]; for (var tx = rm.x0; tx < rm.x1; tx += 80) for (var ty = rm.y0 + ((tx - rm.x0) / 80 % 2) * 80; ty < rm.y1; ty += 160) g.fillRect(tx, ty, 80, 80); }
  else if (rm.floor === 'tatami') { g.strokeStyle = '#3a3a24'; g.lineWidth = 3; for (var mx = rm.x0; mx < rm.x1; mx += 180) for (var my = rm.y0; my < rm.y1; my += 90) g.strokeRect(mx + ((my - rm.y0) / 90 % 2) * 90, my, 180, 90); }
  else { g.strokeStyle = F[1]; g.lineWidth = 2; for (var py = rm.y0; py < rm.y1; py += rm.floor === 'stone' ? 70 : 24) { g.beginPath(); g.moveTo(rm.x0, py); g.lineTo(rm.x1, py); g.stroke(); } }
  rm.parts.forEach(function (p) {
    var pw = p.x1 - p.x0, ph = p.y1 - p.y0, cx = (p.x0 + p.x1) / 2, cy = (p.y0 + p.y1) / 2;
    if (p.kind === 'carpet') { g.fillStyle = '#5a1a1e'; g.fillRect(p.x0, p.y0, pw, ph); g.strokeStyle = '#c9a43a'; g.lineWidth = 4; g.strokeRect(p.x0 + 10, p.y0 + 10, pw - 20, ph - 20); }
    else if (p.kind === 'wood' || p.kind === 'stone') { g.fillStyle = p.kind === 'wood' ? '#4f3826' : '#4e4b45'; g.fillRect(p.x0, p.y0, pw, ph); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; for (var ly = p.y0; ly < p.y1; ly += p.kind === 'wood' ? 24 : 70) { g.beginPath(); g.moveTo(p.x0, ly); g.lineTo(p.x1, ly); g.stroke(); } }
    else if (p.kind === 'stairs') { g.fillStyle = '#6e6a62'; g.fillRect(p.x0, p.y0, pw, ph); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; for (var sy = p.y0; sy < p.y1; sy += 20) { g.beginPath(); g.moveTo(p.x0, sy); g.lineTo(p.x1, sy); g.stroke(); } g.fillStyle = '#5a1a1e'; g.fillRect(cx - 60, p.y0, 120, ph); }
    else if (p.kind === 'workshop' || p.kind === 'pit') { g.fillStyle = p.kind === 'pit' ? '#1e1622' : '#2c2b33'; g.fillRect(p.x0, p.y0, pw, ph); }
    else if (p.kind === 'circle') { runeCircle(g, cx, cy, pw / 2, p.kind === 'circle' && rm.id === 'emiya' ? '#7fc4ee' : '#e04a5a', t * 0.4, 0.75); }
    else if (p.kind === 'wormpit') { g.fillStyle = '#120c14'; g.beginPath(); g.arc(cx, cy, pw / 2, 0, 6.283); g.fill(); g.strokeStyle = '#4a3458'; g.lineWidth = 4; for (var wk = 0; wk < 14; wk++) { var wa = wk * 0.45 + t * 0.6, wr = pw / 2 * (0.3 + 0.6 * ((wk * 37) % 10) / 10); g.beginPath(); g.arc(cx + Math.cos(wa) * wr, cy + Math.sin(wa) * wr, 10, wa, wa + 3); g.stroke(); } }
  });
  var vg = g.createRadialGradient((rm.x0 + rm.x1) / 2, (rm.y0 + rm.y1) / 2, Math.min(w, h) * 0.2, (rm.x0 + rm.x1) / 2, (rm.y0 + rm.y1) / 2, Math.max(w, h) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = vg; g.fillRect(rm.x0, rm.y0, w, h);
}
// cover what this viewer cannot see: the interiors while outside, everything but the current room while inside
function zoneMask(g) {
  if (!MAP.cityW || !G || !G.f[MEI]) return;
  drawDoors(g);
  var me = G.f[MEI], vr = VIEWR || { x0: 0, y0: 0, x1: MAP.w, y1: MAP.h }, rm = roomAt(me.x, me.y);
  g.fillStyle = '#050608';
  if (!rm) { if (vr.x1 > MAP.cityW) g.fillRect(MAP.cityW, vr.y0 - 10, vr.x1 - MAP.cityW + 10, vr.y1 - vr.y0 + 20); return; }
  g.fillRect(vr.x0 - 10, vr.y0 - 10, vr.x1 - vr.x0 + 20, rm.y0 - vr.y0 + 10); g.fillRect(vr.x0 - 10, rm.y1, vr.x1 - vr.x0 + 20, vr.y1 - rm.y1 + 10);
  g.fillRect(vr.x0 - 10, rm.y0, rm.x0 - vr.x0 + 10, rm.y1 - rm.y0); g.fillRect(rm.x1, rm.y0, vr.x1 - rm.x1 + 10, rm.y1 - rm.y0);
  g.fillStyle = 'rgba(233,228,211,.12)'; g.font = '700 46px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillText(rm.name.toUpperCase(), (rm.x0 + rm.x1) / 2, rm.y0 - 20);
}
