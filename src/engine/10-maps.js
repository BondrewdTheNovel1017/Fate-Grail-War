/* ---- maps: obstacles are circles (o); rectangular blocks (b) are drawn as boxes and collide as a row of hidden circles ---- */
var MAPS = (function () {
  function lcg(seed) { var v = seed >>> 0; return function () { v = (v * 1664525 + 1013904223) >>> 0; return v / 4294967296; }; }
  var forest = [], fr = lcg(77);
  for (var gx = 90; gx < 2000; gx += 160) for (var gy = 90; gy < 1500; gy += 150) {
    var x = gx + (fr() - 0.5) * 90, y = gy + (fr() - 0.5) * 80, r = 26 + fr() * 18;
    if (Math.hypot(x - 1000, (y - 750) * 1.3) < 400) continue;
    if ([[300, 300], [1700, 1200], [300, 1200], [1700, 300]].some(function (s) { return Math.hypot(x - s[0], y - s[1]) < 210; })) continue;
    if (Math.abs(y - 750 - Math.sin(x / 260) * 120) < 70 || Math.abs(x - 1000 - Math.sin(y / 230) * 110) < 64) continue;
    forest.push({ x: Math.round(x), y: Math.round(y), r: Math.round(r), k: 'tree' });
  }
  var graves = []; [[250, 550], [1150, 550]].forEach(function (c) { for (var ix = 0; ix < 4; ix++) for (var iy = 0; iy < 4; iy++) graves.push({ x: c[0] + ix * 100, y: c[1] + 40 + iy * 130, w: 46, h: 24, k: 'grave' }); });
  var girders = []; for (var gxx = 150; gxx <= 2250; gxx += 300) { girders.push({ x: gxx, y: 34, r: 28, k: 'girder' }, { x: gxx, y: 766, r: 28, k: 'girder' }); }
  var bollards = []; for (var bx = 150; bx < 2200; bx += 250) bollards.push({ x: bx, y: 1190, r: 14, k: 'bollard' });
  var schoolTrees = []; for (var tx = 150; tx <= 1650; tx += 250) schoolTrees.push({ x: tx, y: 1236, r: 34, k: 'tree' });
  return {
    arena: { id: 'arena', name: 'Training Hall', place: 'Practice ground', blurb: 'The original arena: open floor and seven stone pillars. Good for learning a servant.', w: 1600, h: 1100, theme: 'arena',
      o: [{ x: 800, y: 550, r: 70, k: 'pillar' }, { x: 560, y: 360, r: 52, k: 'pillar' }, { x: 1040, y: 360, r: 52, k: 'pillar' }, { x: 560, y: 740, r: 52, k: 'pillar' }, { x: 1040, y: 740, r: 52, k: 'pillar' }, { x: 300, y: 550, r: 44, k: 'pillar' }, { x: 1300, y: 550, r: 44, k: 'pillar' }], b: [],
      spawns: [[450, 550], [1150, 550], [800, 250], [800, 850]] },
    bridge: { id: 'bridge', name: 'Fuyuki Bridge', place: 'Over the Mion River', blurb: 'A long red steel bridge at night. A narrow deck, two stalled cars and nowhere to hide from a beam.', w: 2400, h: 800, theme: 'bridge',
      o: girders.concat([{ x: 600, y: 220, r: 16, k: 'lamp' }, { x: 1800, y: 580, r: 16, k: 'lamp' }, { x: 1200, y: 170, r: 16, k: 'lamp' }, { x: 1200, y: 630, r: 16, k: 'lamp' }]),
      b: [{ x: 880, y: 310, w: 150, h: 70, k: 'car' }, { x: 1520, y: 490, w: 150, h: 70, k: 'car' }],
      spawns: [[260, 300], [2140, 500], [260, 500], [2140, 300]] },
    temple: { id: 'temple', name: 'Ryuudou Temple', place: 'Mount Enzou, west Miyama', blurb: 'The mountain temple courtyard: stone lanterns along the path, old pines, and the main hall above the cavern of the Grail.', w: 1800, h: 1300, theme: 'temple',
      o: [{ x: 760, y: 480, r: 20, k: 'lantern' }, { x: 1040, y: 480, r: 20, k: 'lantern' }, { x: 760, y: 680, r: 20, k: 'lantern' }, { x: 1040, y: 680, r: 20, k: 'lantern' }, { x: 760, y: 880, r: 20, k: 'lantern' }, { x: 1040, y: 880, r: 20, k: 'lantern' }, { x: 900, y: 600, r: 30, k: 'burner' },
        { x: 220, y: 700, r: 44, k: 'pine' }, { x: 260, y: 1010, r: 44, k: 'pine' }, { x: 1580, y: 700, r: 44, k: 'pine' }, { x: 1540, y: 1020, r: 44, k: 'pine' }, { x: 500, y: 1160, r: 40, k: 'pine' }, { x: 1300, y: 1160, r: 40, k: 'pine' }, { x: 830, y: 1250, r: 24, k: 'gatepost' }, { x: 970, y: 1250, r: 24, k: 'gatepost' }],
      b: [{ x: 900, y: 170, w: 640, h: 180, k: 'hall' }, { x: 300, y: 330, w: 120, h: 120, k: 'bell' }, { x: 1500, y: 330, w: 160, h: 120, k: 'shed' }],
      spawns: [[420, 620], [1380, 620], [900, 1080], [900, 410]] },
    forest: { id: 'forest', name: 'Einzbern Forest', place: 'Suburbs, around the castle', blurb: 'A dense, moonlit forest with a single clearing. Trees break line of sight and block arrows; winding paths connect the corners.', w: 2000, h: 1500, theme: 'forest',
      o: forest, b: [], spawns: [[300, 300], [1700, 1200], [300, 1200], [1700, 300]] },
    harbor: { id: 'harbor', name: 'Fuyuki Harbor', place: 'Cargo port, Shinto', blurb: 'Stacked shipping containers and cranes on the wharf. Tight corners for ambushes, open lanes for charges.', w: 2200, h: 1300, theme: 'harbor',
      o: [{ x: 1000, y: 190, r: 24, k: 'crane' }, { x: 1200, y: 190, r: 24, k: 'crane' }].concat(bollards),
      b: [{ x: 420, y: 260, w: 230, h: 90, k: 'box1' }, { x: 680, y: 260, w: 230, h: 90, k: 'box2' }, { x: 1520, y: 260, w: 230, h: 90, k: 'box3' }, { x: 1780, y: 260, w: 230, h: 90, k: 'box1' }, { x: 1100, y: 480, w: 90, h: 230, k: 'box2' },
        { x: 500, y: 880, w: 230, h: 90, k: 'box3' }, { x: 1700, y: 880, w: 230, h: 90, k: 'box2' }, { x: 900, y: 1060, w: 230, h: 90, k: 'box1' }, { x: 1300, y: 1060, w: 230, h: 90, k: 'box3' }],
      spawns: [[220, 640], [1980, 640], [1100, 760], [1100, 120]] },
    church: { id: 'church', name: 'Fuyuki Church', place: 'The hill above the city', blurb: 'The Overseer’s church and the foreign cemetery around it. Rows of gravestones give cover on both flanks.', w: 1700, h: 1300, theme: 'church',
      o: [{ x: 850, y: 800, r: 26, k: 'cross' }, { x: 120, y: 420, r: 40, k: 'tree' }, { x: 1580, y: 420, r: 40, k: 'tree' }, { x: 150, y: 1190, r: 40, k: 'tree' }, { x: 1550, y: 1190, r: 40, k: 'tree' }],
      b: [{ x: 850, y: 200, w: 460, h: 260, k: 'church' }].concat(graves),
      spawns: [[700, 520], [1000, 1150], [1000, 520], [700, 1150]] },
    school: { id: 'school', name: 'Homurahara Academy', place: 'Miyama school road', blurb: 'The schoolyard at night: an open running track, the school building on one side and the gym on the other.', w: 2000, h: 1300, theme: 'school',
      o: schoolTrees, b: [{ x: 1000, y: 150, w: 1500, h: 180, k: 'school' }, { x: 1820, y: 800, w: 260, h: 360, k: 'gym' }, { x: 200, y: 720, w: 80, h: 300, k: 'bleacher' }, { x: 520, y: 780, w: 30, h: 110, k: 'goal' }, { x: 1380, y: 780, w: 30, h: 110, k: 'goal' }],
      spawns: [[650, 780], [1250, 780], [950, 520], [950, 1040]] }
  };
})();
MAPS.fuyuki = (function () {
  var b = [], o = [], v = 12345;
  function rnd2() { v = (v * 1664525 + 1013904223) >>> 0; return v / 4294967296; }
  function B(x, y, w, h, k, name) { b.push({ x: x, y: y, w: w, h: h, k: k, name: name }); }
  function T(x, y, r, k) { o.push({ x: x, y: y, r: r, k: k || 'tree' }); }
  // ---- water: the Mion River (two crossings) and the sea
  [[0, 1580], [1820, 4180], [4420, 5760]].forEach(function (sg) { b.push({ x: 4500, y: (sg[0] + sg[1]) / 2, w: 400, h: sg[1] - sg[0], k: 'water', nb: true }); });
  b.push({ x: 4500, y: 5890, w: 9000, h: 260, k: 'water', nb: true });
  // ---- Mount Enzou and Ryuudou Temple (north-west)
  B(1100, 520, 560, 190, 'hall', 'Ryuudou Temple'); B(640, 760, 200, 130, 'shed'); B(1560, 760, 200, 130, 'shed'); B(800, 1020, 110, 110, 'bell');
  T(1040, 1250, 22, 'gatepost'); T(1160, 1250, 22, 'gatepost');
  for (var px = 220; px < 2100; px += 190) for (var py = 160; py < 1650; py += 180) { var x = px + (rnd2() - 0.5) * 90, y = py + (rnd2() - 0.5) * 80; if (x > 520 && x < 1700 && y > 300 && y < 1300) continue; if (Math.abs(x - 1100) < 110 && y > 1200) continue; T(Math.round(x), Math.round(y), 30 + Math.round(rnd2() * 14), 'pine'); }
  // ---- foreigners' district on the hill
  B(2650, 650, 380, 260, 'mansion', 'Tohsaka Mansion'); T(2450, 960, 36); T(2850, 960, 36); T(2380, 420, 34); T(2920, 420, 34);
  B(3650, 620, 340, 280, 'mansion2', 'Matou Residence'); B(3150, 1250, 260, 200, 'mansion3'); B(2560, 1320, 200, 140, 'house', 'Mackenzie House'); B(3600, 1200, 180, 130, 'house'); B(3950, 1200, 180, 130, 'house');
  // ---- Fuyuki Church and the foreign cemetery
  B(1100, 2250, 380, 300, 'church', 'Fuyuki Church');
  for (var gx = 0; gx < 6; gx++) for (var gy = 0; gy < 3; gy++) B(720 + gx * 150, 2640 + gy * 130, 46, 24, 'grave');
  T(600, 2200, 40); T(1600, 2200, 40); T(620, 2950, 38); T(1600, 2950, 38);
  // ---- Homurahara Academy
  B(2900, 2200, 900, 180, 'school', 'Homurahara Academy'); B(3700, 2700, 280, 260, 'gym'); B(2280, 2650, 220, 120, 'shed'); B(2500, 2850, 30, 110, 'goal'); B(3200, 2850, 30, 110, 'goal');
  // ---- Japanese houses and the Emiya residence
  B(1250, 4250, 320, 170, 'house_jp', 'Emiya Residence'); B(1500, 4470, 180, 120, 'dojo'); B(1030, 4480, 80, 70, 'shed');
  for (var hx = 400; hx <= 2500; hx += 260) for (var hy = 3500; hy <= 5100; hy += 230) { if (Math.abs(hx - 1300) < 420 && Math.abs(hy - 4250) < 380) continue; if (Math.abs(hy - 4300) < 120 || Math.abs(hx - 2000) < 90) continue; B(hx, hy, 140 + Math.round(rnd2() * 30), 100 + Math.round(rnd2() * 20), 'house_jp'); }
  // ---- Mount Miyama shopping street
  for (var sx = 2850; sx <= 4050; sx += 150) { B(sx, 3680, 120, 90, 'shop'); B(sx, 3990, 120, 90, 'shop'); }
  // ---- riverside park (west bank)
  for (var ry = 1950; ry <= 4050; ry += 260) T(4180, ry, 34);
  T(3800, 5520, 34, 'lighthouse');
  // ---- Shinto business district
  B(6200, 1350, 440, 440, 'center', 'Center Building'); B(5300, 1100, 380, 320, 'hyatt', 'Hyatt Hotel');
  [[5150, 450], [5650, 450], [6200, 450], [6750, 450], [7200, 450], [5700, 1050], [6750, 1050], [7200, 1100], [5150, 2150], [5650, 2150], [6200, 2150], [7200, 2150]].forEach(function (q, i) { B(q[0], q[1], 260 + (i % 3) * 40, 240 + (i % 2) * 50, 'tower'); });
  B(6800, 2550, 520, 260, 'mall', 'Verde'); B(5250, 2580, 150, 110, 'shop', 'Copenhagen');
  // ---- Fuyuki Station and the railway
  B(5900, 3150, 760, 170, 'station', 'Fuyuki Station');
  // ---- Central Park on the old Civic Center site
  b.push({ x: 7450, y: 3950, w: 260, h: 160, k: 'pond', nb: true });
  [[7000, 3700], [7150, 4200], [7850, 3700], [7800, 4250], [7450, 3550], [7450, 4350], [6900, 4000], [8000, 3980]].forEach(function (q) { T(q[0], q[1], 38); });
  // ---- Semina Apartments and housing blocks
  [[5200, 3800], [6000, 3800], [5200, 4600], [5600, 4600], [6000, 4600]].forEach(function (q) { B(q[0], q[1], 220, 220, 'apt'); }); B(5600, 3800, 240, 240, 'semina', 'Semina Apartments');
  // ---- cargo harbor
  B(5500, 5150, 500, 240, 'warehouse'); B(6300, 5150, 500, 240, 'warehouse', 'Harbor Warehouses');
  for (var cx2 = 7050; cx2 <= 8650; cx2 += 270) { B(cx2, 5000, 230, 90, ['box1', 'box2', 'box3'].at(Math.round(cx2 / 270) % 3)); B(cx2, 5320, 230, 90, ['box2', 'box3', 'box1'].at(Math.round(cx2 / 270) % 3)); }
  [5900, 6700, 7500, 8300].forEach(function (cx3) { T(cx3, 5620, 24, 'crane'); });
  // ---- Einzbern Forest and Castle (east suburbs)
  B(8350, 1450, 460, 360, 'castle', 'Einzbern Castle');
  for (var fx = 7700; fx < 8950; fx += 170) for (var fy = 200; fy < 3050; fy += 160) { var x3 = fx + (rnd2() - 0.5) * 90, y3 = fy + (rnd2() - 0.5) * 80; if (Math.hypot(x3 - 8250, y3 - 1500) < 520) continue; if (Math.abs(y3 - 1500) < 90) continue; T(Math.round(x3), Math.round(y3), 26 + Math.round(rnd2() * 16)); }
  return { id: 'fuyuki', name: 'Fuyuki City', place: 'Miyama and Shinto across the Mion River', blurb: 'The war map.', w: 9000, h: 6000, theme: 'fuyuki', river: { x: 4500, half: 200, bridges: [1700, 4300] },
    o: o, b: b, spawns: [[1250, 4020], [2650, 900], [1100, 860], [7950, 1500], [5300, 1500], [6300, 4870], [5600, 4220]],
    labels: [['RYUUDOU TEMPLE', 1100, 300], ['MOUNT ENZOU', 1100, 1500], ['TOHSAKA MANSION', 2650, 470], ['MATOU RESIDENCE', 3650, 430], ['FUYUKI CHURCH', 1100, 2050], ['FOREIGN CEMETERY', 1100, 3080], ['HOMURAHARA ACADEMY', 2900, 2060], ['EMIYA RESIDENCE', 1250, 4110], ['MIYAMA', 1500, 3350], ['MOUNT MIYAMA SHOPPING STREET', 3450, 3560], ['MION RIVER', 4500, 3000], ['FUYUKI BRIDGE', 4500, 1520], ['SHINTO', 6200, 1820], ['CENTER BUILDING', 6200, 1080], ['HYATT HOTEL', 5300, 900], ['VERDE', 6800, 2370], ['FUYUKI STATION', 5900, 2990], ['CENTRAL PARK', 7450, 3420], ['SEMINA APARTMENTS', 5600, 3620], ['HARBOR', 6800, 5480], ['FUYUKI BEACH', 1900, 5600], ['EINZBERN FOREST', 8300, 300], ['EINZBERN CASTLE', 8350, 1220]] };
})();
var MAP_ORDER = ['bridge', 'temple', 'forest', 'harbor', 'church', 'school', 'arena'];
var MAP = MAPS.arena;
function blockCircles(b) { var r = Math.min(b.w, b.h) / 2, L = Math.max(b.w, b.h), n = Math.max(1, Math.ceil(L / (r * 1.4))), horiz = b.w >= b.h, out = []; for (var i = 0; i < n; i++) { var off = n === 1 ? 0 : -L / 2 + r + i * (L - 2 * r) / (n - 1); out.push({ x: b.x + (horiz ? off : 0), y: b.y + (horiz ? 0 : off), r: r, h: true, nb: b.nb }); } return out; }
var PGRID = null, PCELL = 320;
function buildGrid() { PGRID = {}; PILLARS.forEach(function (p) { for (var gx = Math.floor((p.x - p.r) / PCELL); gx <= Math.floor((p.x + p.r) / PCELL); gx++) for (var gy = Math.floor((p.y - p.r) / PCELL); gy <= Math.floor((p.y + p.r) / PCELL); gy++) { var k = gx + ',' + gy; (PGRID[k] || (PGRID[k] = [])).push(p); } }); }
function pillarsIn(x0, y0, x1, y1) { if (!PGRID) return PILLARS; var out = [], seen = new Set(); for (var gx = Math.floor(Math.min(x0, x1) / PCELL); gx <= Math.floor(Math.max(x0, x1) / PCELL); gx++) for (var gy = Math.floor(Math.min(y0, y1) / PCELL); gy <= Math.floor(Math.max(y0, y1) / PCELL); gy++) { var c = PGRID[gx + ',' + gy]; if (c) for (var i = 0; i < c.length; i++) if (!seen.has(c[i])) { seen.add(c[i]); out.push(c[i]); } } return out; }
function setMap(id) { MAP = MAPS[id] || MAPS.arena; W = MAP.w; H = MAP.h; PILLARS = MAP.o.slice(); MAP.b.forEach(function (b) { PILLARS = PILLARS.concat(blockCircles(b)); }); buildGrid(); }
setMap('arena');
