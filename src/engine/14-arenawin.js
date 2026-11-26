/* ---- Arena battlefields are windows onto Fuyuki itself ----
   Each Arena map (except the Training Hall) is a rectangle cut from MAPS.city: the same ground, roads, buildings
   and trees, drawn by the same renderer, so the Arena and the war look like one city. Blocks and trees are copied
   into the window's own coordinates (0..w, 0..h) for collisions; the UI draws the city floor shifted by `win`.
   Spawns are picked automatically on open ground. */
var ARENA_WIN = {
  bridge: { x0: 4900, y0: 2060, w: 2200, h: 700, blurb: 'The avenue over the Mion River, from the Miyama bank to the first crossroads of Shinto. A long open deck with water on both sides.' },
  temple: { x0: 600, y0: 150, w: 1800, h: 1300, blurb: 'The temple courtyard on Mount Enzou: the main hall, side halls and lanterns, with the forest closing in around the walls.' },
  forest: { x0: 9950, y0: 2150, w: 2000, h: 1500, blurb: 'Deep in the Einzbern forest, south of the castle road: trees everywhere, and little room to swing.' },
  harbor: { x0: 8600, y0: 5950, w: 2200, h: 1300, blurb: 'The harbor road and the docks: warehouses, stacked containers and the bay beyond the quay.' },
  church: { x0: 520, y0: 2560, w: 1700, h: 1300, blurb: 'Kotomine Church on its hill: the graveyard, the chapel and the wooded slope down to the Miyama street.' },
  school: { x0: 3100, y0: 2420, w: 2000, h: 1300, blurb: 'Homurahara Academy after dark: the school building, the running track and the gym, between two streets.' }
};
(function () {
  var C = MAPS.city; if (!C) return;
  Object.keys(ARENA_WIN).forEach(function (id) {
    var old = MAPS[id] || {}, R = ARENA_WIN[id], x0 = R.x0, y0 = R.y0, w = R.w, h = R.h;
    var touches = function (x, y, hw, hh) { return x + hw > x0 - 60 && x - hw < x0 + w + 60 && y + hh > y0 - 60 && y - hh < y0 + h + 60; };
    var b = C.b.filter(function (q) { return q.x < C.cityW && !q.over && touches(q.x, q.y, q.w / 2, q.h / 2); }).map(function (q) { return Object.assign({}, q, { x: q.x - x0, y: q.y - y0, ci: C.b.indexOf(q) }); });
    var o = C.o.filter(function (q) { return q.x < C.cityW && touches(q.x, q.y, q.r, q.r); }).map(function (q) { return Object.assign({}, q, { x: q.x - x0, y: q.y - y0 }); });
    // open ground for spawns: away from walls, water and trees, spread to the four sides
    var free = function (x, y) {
      if (x < 140 || y < 140 || x > w - 140 || y > h - 140) return false;
      for (var i = 0; i < b.length; i++) { var q = b[i]; if (q.walk) continue; if (x > q.x - q.w / 2 - 80 && x < q.x + q.w / 2 + 80 && y > q.y - q.h / 2 - 80 && y < q.y + q.h / 2 + 80) return false; }
      for (var j = 0; j < o.length; j++) if (Math.hypot(o[j].x - x, o[j].y - y) < o[j].r + 70) return false;
      return true;
    };
    var cand = []; for (var gx = 140; gx <= w - 140; gx += 40) for (var gy = 140; gy <= h - 140; gy += 40) if (free(gx, gy)) cand.push([gx, gy]);
    var near = function (tx, ty) { var best = null, bd = 1e9; cand.forEach(function (c) { var d = Math.hypot(c[0] - tx, c[1] - ty); if (d < bd) { bd = d; best = c; } }); return best || [tx, ty]; };
    var sp = [near(w * 0.22, h / 2), near(w * 0.78, h / 2), near(w / 2, h * 0.22), near(w / 2, h * 0.78)];
    MAPS[id] = { id: id, name: old.name, place: old.place, blurb: R.blurb || old.blurb, w: w, h: h, theme: 'citywin', win: { x0: x0, y0: y0 }, rects: true, b: b, o: o, spawns: sp };
  });
})();
