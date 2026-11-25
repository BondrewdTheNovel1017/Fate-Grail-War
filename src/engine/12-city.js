/* ---- Fuyuki City: the full war map ----
   Built from data: roads (axis-aligned, with kinds), ground zones, landmark buildings, procedurally filled
   city blocks, trees, estate plots for masters, and walk-in interiors placed in a strip east of the city
   (x > cityW) and reached through doors. Buildings collide as rectangles (MAP.rects); trees and posts as circles. */
MAPS.city = (function () {
  var CW = 12000, CH = 8000, IX = 12400;                 // city size; interiors live at x >= IX
  var v = 20241125; function R() { v = (v * 1664525 + 1013904223) >>> 0; return v / 4294967296; }
  var roads = [], zones = [], b = [], o = [], labels = [], doors = [], rooms = [], reserved = [], lamps = [];
  function road(kind, x0, y0, x1, y1, w, name) { roads.push({ kind: kind, x0: Math.min(x0, x1), y0: Math.min(y0, y1), x1: Math.max(x0, x1), y1: Math.max(y0, y1), w: w, h: y0 === y1, name: name }); }
  function zone(kind, x0, y0, x1, y1) { zones.push({ kind: kind, x0: x0, y0: y0, x1: x1, y1: y1 }); }
  function B(x, y, w, h, k, o2) { var q = { x: x, y: y, w: w, h: h, k: k }; if (o2) for (var key in o2) q[key] = o2[key]; b.push(q); return q; }
  function T(x, y, r, k) { o.push({ x: Math.round(x), y: Math.round(y), r: Math.round(r), k: k || 'tree' }); }
  function reserve(x0, y0, x1, y1) { reserved.push([x0, y0, x1, y1]); }
  function roadRect(r) { var hw = r.w / 2; return r.h ? [r.x0, r.y0 - hw, r.x1, r.y0 + hw] : [r.x0 - hw, r.y0, r.x0 + hw, r.y1]; }
  function hits(x0, y0, x1, y1, pad) {
    pad = pad || 0;
    for (var i = 0; i < reserved.length; i++) { var q = reserved[i]; if (x1 + pad > q[0] && x0 - pad < q[2] && y1 + pad > q[1] && y0 - pad < q[3]) return true; }
    for (var j = 0; j < roads.length; j++) { var rr = roadRect(roads[j]), sp = roads[j].kind === 'path' || roads[j].kind === 'stairs' ? 10 : 34; if (x1 + pad > rr[0] - sp && x0 - pad < rr[2] + sp && y1 + pad > rr[1] - sp && y0 - pad < rr[3] + sp) return true; }
    return false;
  }

  /* ---------- water: the Mion River and the bay ---------- */
  var RX0 = 5700, RX1 = 6300, SEA = 7300;
  zone('water', RX0, 0, RX1, SEA); zone('water', 0, SEA, CW, CH);
  [[0, 2270], [2530, 3930], [4070, 5490], [5710, SEA]].forEach(function (s) { B(6000, (s[0] + s[1]) / 2, RX1 - RX0, s[1] - s[0], 'water', { nb: true, hide: true }); });
  B(CW / 2, (SEA + CH) / 2 + 40, CW, CH - SEA - 80, 'water', { nb: true, hide: true });

  /* ---------- roads ---------- */
  // avenues
  road('avenue', 200, 2400, 9800, 2400, 220, 'Fuyuki Bridge');
  road('avenue', 200, 5600, 9800, 5600, 190, 'Mion Bridge');
  road('avenue', 3000, 900, 3000, 6900, 190);
  road('avenue', 8100, 300, 8100, 6600, 210);
  road('avenue', 6400, 6650, 11800, 6650, 170);
  // Miyama streets
  road('street', 2600, 1250, 5400, 1250, 120);
  road('street', 200, 3600, 5500, 3600, 130);
  road('street', 200, 4700, 5500, 4700, 130);
  road('street', 200, 6450, 5500, 6450, 130);
  road('street', 1300, 2400, 1300, 6900, 130);
  road('street', 4400, 1250, 4400, 6900, 130);
  // Shinto streets
  road('street', 6550, 300, 6550, 6650, 120);
  road('street', 7300, 300, 7300, 6650, 150);
  road('street', 8950, 300, 8950, 6650, 150);
  road('street', 9800, 300, 9800, 6650, 160);
  road('street', 6550, 1300, 9800, 1300, 140);
  road('street', 6550, 3300, 9800, 3300, 140);
  road('street', 6550, 4600, 9800, 4600, 140);
  // paths, stairs and the railway (all walkable)
  road('stairs', 1500, 1480, 1500, 2400, 110, 'Ryuudou stairs');
  road('path', 1500, 1060, 1500, 1480, 90);
  road('path', 1100, 2400, 1100, 2760, 90);
  road('path', 5350, 2400, 5350, 6950, 80);
  road('path', 3550, 830, 3550, 1250, 70);
  road('path', 5000, 830, 5000, 1250, 70);
  road('path', 2700, 1800, 3000, 1800, 60);
  road('path', 2050, 4700, 2050, 4920, 70);
  road('path', 9800, 2400, 11000, 2400, 110, 'Einzbern forest road');
  road('path', 11000, 1760, 11000, 2400, 110);
  road('path', 9800, 5250, 11700, 5250, 80);
  road('path', 10750, 4600, 10750, 6650, 80);
  road('rail', 4300, 4050, 11800, 4050, 120, 'Railway');
  zone('railbridge', RX0 - 40, 3990, RX1 + 40, 4110);

  /* ---------- ground zones (drawn under everything) ---------- */
  zone('forest', 0, 0, 2450, 2290);              // Mount Enzou
  zone('temple', 700, 250, 2300, 1460);          // Ryuudou Temple grounds
  zone('hill', 2450, 0, RX0, 2290);              // foreigners' district on the hill
  zone('churchyard', 250, 2510, 2900, 3530);     // church hill and cemetery
  zone('schoolyard', 3100, 2510, 5000, 3530);    // Homurahara Academy
  zone('park', 5000, 2510, RX0, 6950);           // riverside park (west bank)
  zone('sand', 0, 6960, RX0, SEA);               // Fuyuki beach
  zone('plaza', 6650, 3700, 8900, 3970);         // station plaza
  zone('park', 9050, 4700, 11800, 6560);         // Central Park
  zone('forest', 9900, 0, CW, 3980);             // Einzbern forest
  zone('castle', 10300, 600, 11700, 1760);       // castle courtyard
  zone('harbor', 6400, 6760, CW, SEA);           // cargo harbor apron
  zone('emiya', 1500, 4850, 2600, 5450);         // Emiya residence yard
  zone('garden', 3150, 330, 3950, 1110);         // Tohsaka garden
  zone('garden', 4600, 330, 5400, 1110);         // Matou grounds

  /* ---------- landmarks ---------- */
  // Ryuudou Temple
  B(1500, 650, 760, 260, 'temple', { name: 'Ryuudou Temple' }); B(950, 900, 200, 160, 'temple2'); B(2050, 900, 200, 160, 'temple2'); B(1080, 1220, 120, 120, 'belltower');
  B(1500, 1470, 360, 30, 'gate_jp'); reserve(700, 250, 2300, 1500);
  [[1180, 1350], [1820, 1350], [1180, 1100], [1820, 1100]].forEach(function (p) { T(p[0], p[1], 14, 'lantern'); });
  T(1950, 1250, 46, 'pine'); T(1060, 450, 44, 'pine'); T(2120, 450, 40, 'pine');
  // Foreigners' district
  B(3550, 650, 460, 320, 'mansion_w', { name: 'Tohsaka Mansion', home: 'tohsaka' }); reserve(3150, 330, 3950, 1110);
  B(3550, 335, 800, 18, 'fence'); B(3150, 720, 18, 780, 'fence'); B(3950, 720, 18, 780, 'fence'); B(3300, 1105, 300, 18, 'fence'); B(3800, 1105, 300, 18, 'fence');
  B(5000, 650, 420, 320, 'mansion_d', { name: 'Matou Residence', home: 'matou' }); reserve(4600, 330, 5400, 1110);
  B(5000, 335, 800, 18, 'fence'); B(4600, 720, 18, 780, 'fence'); B(5400, 720, 18, 780, 'fence'); B(4750, 1105, 300, 18, 'fence'); B(5250, 1105, 300, 18, 'fence');
  B(2600, 1800, 220, 170, 'house_w', { name: 'Mackenzie House', home: 'mackenzie' }); reserve(2440, 1680, 2760, 1930);
  [[3250, 450], [3850, 450], [3250, 1000], [3850, 1000], [4700, 450], [5300, 450]].forEach(function (p) { T(p[0], p[1], 36); });
  // Fuyuki Church and the foreign cemetery
  B(1100, 2960, 420, 360, 'church', { name: 'Fuyuki Church', home: 'church' }); reserve(820, 2740, 1380, 3180);
  for (var gx = 0; gx < 7; gx++) for (var gy = 0; gy < 3; gy++) B(1650 + gx * 150, 2760 + gy * 140, 50, 26, 'grave');
  reserve(1600, 2720, 2700, 3110);
  [[500, 2700], [500, 3300], [1700, 3350], [2300, 3350], [2800, 2700]].forEach(function (p) { T(p[0], p[1], 40); });
  // Homurahara Academy
  B(4050, 2700, 1300, 220, 'school', { name: 'Homurahara Academy' }); B(4850, 3250, 300, 260, 'gym'); B(3400, 3300, 260, 120, 'dojo_s');
  reserve(3100, 2510, 5000, 3530);
  // Emiya residence (walled compound)
  B(1900, 5060, 560, 230, 'house_jpL', { name: 'Emiya Residence', home: 'emiya' }); B(2380, 5280, 300, 200, 'dojo'); B(1640, 5350, 170, 120, 'storehouse');
  B(1530, 5150, 20, 620, 'wall'); B(2620, 5150, 20, 620, 'wall'); B(2060, 5440, 1100, 20, 'wall'); B(1765, 4850, 490, 20, 'wall'); B(2370, 4850, 520, 20, 'wall');
  reserve(1500, 4830, 2650, 5470); T(1700, 4950, 32); T(2500, 4980, 30);
  // Mount Miyama shopping street (covered arcade along H5)
  for (var sx = 3170; sx <= 4250; sx += 135) { B(sx, 4580, 120, 110, 'shop'); B(sx, 4820, 120, 110, 'shop'); }
  zone('arcade', 3100, 4630, 4300, 4770);
  reserve(3100, 4520, 4300, 4880);
  // Shinto: Hyatt hotel, Center Building, Verde, station
  B(7700, 850, 560, 460, 'hotel', { name: 'Hyatt Hotel', home: 'hyatt' }); reserve(7400, 600, 8000, 1220);
  B(8525, 1850, 620, 620, 'center', { name: 'Center Building' }); reserve(8200, 1450, 8850, 2270);
  B(8525, 2850, 640, 380, 'mall', { name: 'Verde' }); reserve(8200, 2530, 8850, 3200);
  B(7700, 3550, 1000, 230, 'station', { name: 'Fuyuki Station' }); reserve(6650, 3400, 8900, 3990);
  B(4880, 3880, 300, 120, 'station_s', { name: 'Miyama Station' }); reserve(4700, 3800, 5100, 3970);
  // Central Park and the civic hall
  zone('pond', 10150, 5650, 10600, 6050);
  B(10380, 5850, 520, 340, 'water', { nb: true, hide: true });
  B(10150, 4880, 460, 260, 'civic', { name: 'Fuyuki Civic Hall' }); reserve(9050, 4700, 11800, 6560);
  // Einzbern Castle
  B(11000, 1150, 980, 620, 'castle', { name: 'Einzbern Castle', home: 'einzbern' });
  B(10560, 980, 220, 220, 'castletower'); B(11440, 980, 220, 220, 'castletower');
  B(11000, 610, 1400, 26, 'castlewall'); B(10300, 1180, 26, 1160, 'castlewall'); B(11700, 1180, 26, 1160, 'castlewall');
  B(10600, 1760, 600, 26, 'castlewall'); B(11400, 1760, 600, 26, 'castlewall');
  reserve(10280, 590, 11720, 1780);
  [[10600, 1550], [11400, 1550]].forEach(function (p) { T(p[0], p[1], 18, 'fountain'); });
  // harbor: warehouses, containers, cranes
  for (var wx = 6700; wx <= 9500; wx += 700) B(wx, 7000, 560, 260, 'warehouse');
  for (var cx = 9900; cx <= 11600; cx += 260) { B(cx, 6880, 220, 80, ['box1', 'box2', 'box3'][Math.floor(R() * 3)]); B(cx, 7050, 220, 80, ['box2', 'box3', 'box1'][Math.floor(R() * 3)]); }
  [7050, 7750, 8450, 9150, 9850, 10550, 11250].forEach(function (x) { T(x, 7230, 26, 'crane'); });
  reserve(6400, 6760, CW, SEA);
  // beach
  T(4700, 7150, 30, 'lighthouse'); reserve(0, 6960, RX0, SEA);
  // riverside park and beach trees
  for (var py = 2600; py < 6900; py += 230) { if (Math.abs(py - 4050) < 120 || Math.abs(py - 5600) < 140 || Math.abs(py - 3600) < 90 || Math.abs(py - 4700) < 90 || Math.abs(py - 6450) < 90) continue; T(5120 + R() * 60, py, 30 + R() * 10); T(5580 + R() * 40, py + 100, 28 + R() * 10); }
  reserve(5000, 2510, RX0, 6960);

  /* ---------- estate plots: where duplicate family houses and safehouses can appear ---------- */
  var plots = [[2700, 600], [4000, 1800], [4950, 1820], [700, 4150], [3700, 6050], [7700, 5100], [9380, 2850], [10450, 3300], [6950, 2850], [700, 6050]];
  plots.forEach(function (p) { reserve(p[0] - 260, p[1] - 190, p[0] + 260, p[1] + 190); });

  /* ---------- fill city blocks with buildings ---------- */
  function fill(x0, y0, x1, y1, style, lotW, lotH, gap) {
    for (var x = x0; x + 60 < x1; x += lotW + gap) for (var y = y0; y + 60 < y1; y += lotH + gap) {
      var lw = Math.min(lotW, x1 - x), lh = Math.min(lotH, y1 - y); if (lw < lotW * 0.55 || lh < lotH * 0.55) continue;
      var w = Math.round(lw * (0.72 + R() * 0.22)), h = Math.round(lh * (0.7 + R() * 0.24)), bx = x + lw / 2, by = y + lh / 2;
      if (hits(bx - w / 2, by - h / 2, bx + w / 2, by + h / 2, 6)) continue;
      var st = typeof style === 'function' ? style() : style; B(Math.round(bx), Math.round(by), w, h, st);
      if (st === 'house_jp' && R() < 0.35) T(bx + (R() < 0.5 ? -1 : 1) * (w / 2 + 22), by + (R() - 0.5) * h * 0.5, 20 + R() * 8);
    }
  }
  var jp = function () { var q = R(); return q < 0.78 ? 'house_jp' : q < 0.9 ? 'house_w' : 'apt_s'; };
  var biz = function () { var q = R(); return q < 0.55 ? 'tower' : q < 0.8 ? 'office' : 'shop_big'; };
  var mid = function () { var q = R(); return q < 0.5 ? 'apt' : q < 0.75 ? 'shop_big' : 'office'; };
  // Miyama residential
  fill(300, 3700, 1200, 4600, jp, 230, 190, 40); fill(1400, 3700, 2900, 4600, jp, 230, 190, 40); fill(3100, 3700, 4300, 4470, jp, 230, 190, 40);
  fill(300, 4800, 1200, 5480, jp, 230, 190, 40); fill(1400, 4800, 2900, 5480, jp, 230, 190, 40); fill(3100, 4920, 4300, 5480, jp, 230, 190, 40);
  fill(300, 5720, 1200, 6340, jp, 230, 190, 40); fill(1400, 5720, 2900, 6340, jp, 230, 190, 40); fill(3100, 5720, 4300, 6340, jp, 230, 190, 40);
  fill(300, 6560, 1200, 6900, jp, 230, 160, 40); fill(1400, 6560, 2900, 6900, jp, 230, 160, 40); fill(3100, 6560, 4300, 6900, jp, 230, 160, 40);
  fill(4500, 3700, 5000, 6900, jp, 210, 190, 40);
  fill(2500, 2510, 2900, 3530, 'house_w', 200, 200, 50);
  // the hill: a few western houses
  fill(2500, 1350, 4300, 2280, function () { return R() < 0.7 ? 'house_w' : 'mansion_s'; }, 280, 230, 70); fill(4500, 1350, 5600, 2280, function () { return R() < 0.7 ? 'house_w' : 'mansion_s'; }, 280, 230, 70);
  fill(2500, 120, 3050, 800, 'house_w', 260, 230, 60);
  // Shinto business district
  fill(6650, 400, 7200, 3200, biz, 260, 330, 50); fill(7400, 400, 8000, 3200, biz, 280, 320, 50);
  fill(8220, 400, 8850, 3200, biz, 300, 320, 50); fill(9050, 400, 9700, 3200, biz, 280, 320, 50);
  // Shinto south: apartments, shops (Semina Apartments among them)
  fill(6650, 4150, 7200, 6540, mid, 240, 280, 50); fill(7400, 4150, 8000, 6540, mid, 260, 280, 50); fill(8220, 4150, 8850, 6540, mid, 260, 280, 50);
  B(7700, 4850, 300, 300, 'apt', { name: 'Semina Apartments' });
  // forests
  function forest(x0, y0, x1, y1, step, keepOut) {
    for (var fx = x0; fx < x1; fx += step) for (var fy = y0; fy < y1; fy += step * 0.92) {
      var tx = fx + (R() - 0.5) * step * 0.6, ty = fy + (R() - 0.5) * step * 0.6, tr = 26 + R() * 18;
      if (hits(tx - tr, ty - tr, tx + tr, ty + tr, 8)) continue;
      if (keepOut && keepOut(tx, ty)) continue;
      T(tx, ty, tr, R() < 0.5 ? 'pine' : 'tree');
    }
  }
  forest(60, 60, 2450, 2290, 170);
  forest(9950, 60, CW - 60, 3950, 160, function (x, y) { return Math.abs(y - 2400) < 120 && x < 11060 || Math.abs(x - 11000) < 110 && y > 1700 && y < 2450; });
  // street trees along the avenues
  [[3000, 2600, 6800, 'v'], [8100, 500, 6500, 'v']].forEach(function (s) { for (var t = s[1]; t < s[2]; t += 300) { [-1, 1].forEach(function (side) { var x = s[0] + side * 128, y = t; if (!hits(x - 14, y - 14, x + 14, y + 14, -40)) T(x, y, 16, 'street'); }); } });

  /* ---------- labels ---------- */
  labels.push(['MOUNT ENZOU', 900, 2000], ['RYUUDOU TEMPLE', 1500, 220], ['TOHSAKA MANSION', 3550, 280], ['MATOU RESIDENCE', 5000, 280], ['FUYUKI CHURCH', 1100, 2600],
    ['HOMURAHARA ACADEMY', 4050, 2560], ['MIYAMA', 2200, 4250], ['EMIYA RESIDENCE', 2060, 4800], ['MOUNT MIYAMA SHOPPING STREET', 3700, 4480], ['FUYUKI BRIDGE', 6000, 2180],
    ['MION RIVER', 6000, 3300], ['SHINTO', 7300, 2050], ['HYATT HOTEL', 7700, 560], ['CENTER BUILDING', 8525, 1490], ['VERDE', 8525, 2620], ['FUYUKI STATION', 7700, 3400],
    ['CENTRAL PARK', 10400, 4780], ['SEMINA APARTMENTS', 7700, 4660], ['HARBOR', 9300, 6830], ['FUYUKI BEACH', 2500, 7150], ['EINZBERN FOREST', 10800, 3500], ['EINZBERN CASTLE', 11000, 560], ['MION BRIDGE', 6000, 5420]);

  /* ---------- interiors (east of the city) and the doors that lead to them ---------- */
  function room(id, name, x0, y0, w, h, floor) { var r = { id: id, name: name, x0: x0, y0: y0, x1: x0 + w, y1: y0 + h, floor: floor, parts: [] }; rooms.push(r);
    B(x0 + w / 2, y0 + 12, w, 24, 'iwall'); B(x0 + w / 2, y0 + h - 12, w, 24, 'iwall'); B(x0 + 12, y0 + h / 2, 24, h, 'iwall'); B(x0 + w - 12, y0 + h / 2, 24, h, 'iwall'); return r; }
  function iw(x, y, w, h) { B(x, y, w, h, 'iwall'); }
  function part(r, kind, x0, y0, x1, y1) { r.parts.push({ kind: kind, x0: x0, y0: y0, x1: x1, y1: y1 }); }
  function door(id, room, ox, oy, onx, ony, ix, iy, inx, iny) { doors.push({ id: id, room: room, out: { x: ox, y: oy, nx: onx, ny: ony }, in: { x: ix, y: iy, nx: inx, ny: iny } }); }
  // Einzbern Castle: entrance hall, grand staircase, banquet hall, library, chapel
  var c = room('einzbern', 'Einzbern Castle', IX + 200, 200, 2600, 1900, 'marble');
  var cx0 = c.x0, cy0 = c.y0;
  iw(cx0 + 900, cy0 + 600, 24, 1000); iw(cx0 + 1700, cy0 + 600, 24, 1000);            // hall side walls (north part)
  iw(cx0 + 450, cy0 + 1110, 900, 24); iw(cx0 + 2150, cy0 + 1110, 900, 24);           // wings
  iw(cx0 + 900, cy0 + 1560, 24, 420); iw(cx0 + 1700, cy0 + 1560, 24, 420);
  iw(cx0 + 900, cy0 + 1300, 24, 120); iw(cx0 + 1700, cy0 + 1300, 24, 120);
  part(c, 'carpet', cx0 + 1180, cy0 + 300, cx0 + 1420, cy0 + 1880); part(c, 'stairs', cx0 + 1050, cy0 + 120, cx0 + 1550, cy0 + 330);
  part(c, 'wood', cx0 + 30, cy0 + 30, cx0 + 890, cy0 + 1100); part(c, 'wood', cx0 + 1710, cy0 + 30, cx0 + 2570, cy0 + 1100);
  part(c, 'stone', cx0 + 30, cy0 + 1120, cx0 + 890, cy0 + 1870); part(c, 'stone', cx0 + 1710, cy0 + 1120, cx0 + 2570, cy0 + 1870);
  B(cx0 + 460, cy0 + 560, 520, 90, 'table'); for (var ch = 0; ch < 6; ch++) { T(cx0 + 240 + ch * 90, cy0 + 480, 12, 'chair'); T(cx0 + 240 + ch * 90, cy0 + 640, 12, 'chair'); }
  for (var bs = 0; bs < 4; bs++) B(cx0 + 1900 + bs * 170, cy0 + 300, 110, 330, 'shelf'); B(cx0 + 2150, cy0 + 820, 360, 60, 'table');
  for (var pw = 0; pw < 4; pw++) { B(cx0 + 330, cy0 + 1300 + pw * 130, 380, 40, 'pew'); } B(cx0 + 330, cy0 + 1800, 200, 50, 'altar');
  for (var ar = 0; ar < 3; ar++) B(cx0 + 2140, cy0 + 1300 + ar * 200, 500, 60, 'armory');
  [[cx0 + 1080, cy0 + 600], [cx0 + 1520, cy0 + 600], [cx0 + 1080, cy0 + 1000], [cx0 + 1520, cy0 + 1000], [cx0 + 1080, cy0 + 1400], [cx0 + 1520, cy0 + 1400]].forEach(function (p) { T(p[0], p[1], 30, 'column'); });
  door('einzbern', 'einzbern', 11000, 1485, 0, 1, cx0 + 1300, cy0 + 1820, 0, 1);
  // Tohsaka Mansion: foyer, parlor, workshop
  var t = room('tohsaka', 'Tohsaka Mansion', IX + 200, 2400, 1500, 1050, 'wood');
  iw(t.x0 + 540, t.y0 + 360, 24, 640); iw(t.x0 + 960, t.y0 + 360, 24, 640); iw(t.x0 + 270, t.y0 + 680, 520, 24); iw(t.x0 + 1230, t.y0 + 680, 520, 24);
  iw(t.x0 + 540, t.y0 + 900, 24, 200); iw(t.x0 + 960, t.y0 + 900, 24, 200);
  part(t, 'carpet', t.x0 + 560, t.y0 + 30, t.x0 + 940, t.y0 + 1020); part(t, 'workshop', t.x0 + 980, t.y0 + 700, t.x0 + 1470, t.y0 + 1020);
  B(t.x0 + 270, t.y0 + 300, 260, 110, 'sofa'); B(t.x0 + 270, t.y0 + 470, 160, 90, 'table'); for (var ts = 0; ts < 3; ts++) B(t.x0 + 1060 + ts * 140, t.y0 + 140, 100, 200, 'shelf');
  part(t, 'circle', t.x0 + 1165, t.y0 + 810, t.x0 + 1285, t.y0 + 930); B(t.x0 + 1380, t.y0 + 760, 120, 60, 'table');
  door('tohsaka', 'tohsaka', 3550, 835, 0, 1, t.x0 + 750, t.y0 + 975, 0, 1);
  // Matou Residence: dark halls and the worm pit cellar
  var m = room('matou', 'Matou Residence', IX + 1900, 2400, 1500, 1050, 'darkwood');
  iw(m.x0 + 750, m.y0 + 520, 24, 700); iw(m.x0 + 375, m.y0 + 520, 700, 24); iw(m.x0 + 1125, m.y0 + 520, 700, 24); iw(m.x0 + 750, m.y0 + 960, 24, 140);
  part(m, 'pit', m.x0 + 780, m.y0 + 30, m.x0 + 1470, m.y0 + 510); part(m, 'wormpit', m.x0 + 1005, m.y0 + 150, m.x0 + 1245, m.y0 + 390);
  B(m.x0 + 300, m.y0 + 250, 220, 90, 'table'); B(m.x0 + 380, m.y0 + 800, 300, 60, 'shelf');
  door('matou', 'matou', 5000, 835, 0, 1, m.x0 + 560, m.y0 + 975, 0, 1);
  // Fuyuki Church: nave, altar, confessional
  var k = room('church', 'Fuyuki Church', IX + 200, 3700, 1100, 1300, 'stone');
  part(k, 'carpet', k.x0 + 470, k.y0 + 30, k.x0 + 630, k.y0 + 1270);
  for (var pr = 0; pr < 6; pr++) { B(k.x0 + 260, k.y0 + 480 + pr * 120, 330, 40, 'pew'); B(k.x0 + 840, k.y0 + 480 + pr * 120, 330, 40, 'pew'); }
  B(k.x0 + 550, k.y0 + 180, 260, 70, 'altar'); B(k.x0 + 980, k.y0 + 230, 120, 160, 'confessional');
  [[k.x0 + 180, k.y0 + 300], [k.x0 + 920, k.y0 + 300]].forEach(function (p) { T(p[0], p[1], 24, 'column'); });
  door('church', 'church', 1100, 2755, 0, -1, k.x0 + 550, k.y0 + 1225, 0, 1);
  // Emiya Residence: rooms, the dojo, the storehouse where Saber was summoned
  var e = room('emiya', 'Emiya Residence', IX + 1500, 3700, 1600, 1000, 'tatami');
  iw(e.x0 + 600, e.y0 + 280, 24, 520); iw(e.x0 + 1050, e.y0 + 500, 24, 980); iw(e.x0 + 300, e.y0 + 560, 560, 24);
  part(e, 'wood', e.x0 + 1070, e.y0 + 30, e.x0 + 1570, e.y0 + 970); part(e, 'stone', e.x0 + 30, e.y0 + 580, e.x0 + 590, e.y0 + 970);
  B(e.x0 + 300, e.y0 + 250, 220, 120, 'kotatsu'); part(e, 'circle', e.x0 + 230, e.y0 + 730, e.x0 + 370, e.y0 + 870); B(e.x0 + 1320, e.y0 + 90, 380, 30, 'rack');
  door('emiya', 'emiya', 1900, 5200, 0, 1, e.x0 + 820, e.y0 + 925, 0, 1);
  // the gap between city and interiors is solid
  B(CW + 200, CH / 2, 400, CH, 'void', { hide: true });

  /* ---------- homes: where each master's team starts ---------- */
  var homes = {
    tohsaka: { name: 'Tohsaka Mansion', x: 3550, y: 1180, style: 'mansion_w' }, matou: { name: 'Matou Residence', x: 5000, y: 1180, style: 'mansion_d' },
    einzbern: { name: 'Einzbern Castle', x: 11000, y: 1950, style: 'villa_e' }, church: { name: 'Fuyuki Church', x: 1100, y: 2500, style: 'church' },
    hyatt: { name: 'Hyatt Hotel', x: 7700, y: 1220, style: 'hotel' }, mackenzie: { name: 'Mackenzie House', x: 2850, y: 1800, style: 'house_w' },
    emiya: { name: 'Emiya Residence', x: 2050, y: 4620, style: 'house_jpL' }
  };
  return {
    id: 'city', name: 'Fuyuki City', place: 'Miyama and Shinto across the Mion River', blurb: 'The full war map.', theme: 'city', w: IX + 3200, h: CH, cityW: CW, rects: true,
    o: o, b: b, roads: roads, zones: zones, labels: labels, doors: doors, rooms: rooms, homes: homes, plots: plots, haven: { x: 1100, y: 2500, name: 'Fuyuki Church' },
    river: null, spawns: [[2050, 4620], [3550, 1180], [11000, 1950], [1100, 2500], [7700, 1220], [2850, 1800], [5000, 1180]]
  };
})();
