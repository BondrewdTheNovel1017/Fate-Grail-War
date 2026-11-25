/* ---- city navigation, doors, zones and homes ----
   AI routes along a road graph (intersections, junctions, door approaches and interior waypoints) with A*.
   Doors join the city to the walk-in interiors east of it; walking into a doorway steps through. */
function rectLos(ax, ay, bx, by, pad) {
  var L = rectsIn(ax, ay, bx, by);
  for (var i = 0; i < L.length; i++) { var r = L[i]; if (r.nb && pad === undefined) continue; if (segRect(ax, ay, bx, by, r, pad || 0)) return false; }
  return true;
}
function roomAt(x, y) { if (!MAP.rooms || x < MAP.cityW) return null; for (var i = 0; i < MAP.rooms.length; i++) { var r = MAP.rooms[i]; if (x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1) return r; } return null; }
function zoneOf(f) { if (!MAP.cityW || f.x < MAP.cityW) return 'city'; var r = roomAt(f.x, f.y); return r ? r.id : 'void'; }
function sameZone(a, b) { return !MAP.cityW || zoneOf(a) === zoneOf(b); }

function buildNav(M) {
  var nodes = [];
  function node(x, y, tag) { for (var i = 0; i < nodes.length; i++) if (Math.abs(nodes[i].x - x) < 24 && Math.abs(nodes[i].y - y) < 24) return nodes[i]; var n = { id: nodes.length, x: x, y: y, adj: [], tag: tag }; nodes.push(n); return n; }
  function link(a, b, cost, door) { if (a === b) return; if (a.adj.some(function (e) { return e.to === b.id; })) return; a.adj.push({ to: b.id, cost: cost || Math.hypot(a.x - b.x, a.y - b.y), door: door }); b.adj.push({ to: a.id, cost: cost || Math.hypot(a.x - b.x, a.y - b.y), door: door }); }
  var roads = M.roads; roads.forEach(function (r) { r.pts = []; });
  for (var i = 0; i < roads.length; i++) for (var j = 0; j < roads.length; j++) {
    var h = roads[i], v = roads[j]; if (!h.h || v.h) continue;
    var ix = v.x0, iy = h.y0; if (ix >= h.x0 - 1 && ix <= h.x1 + 1 && iy >= v.y0 - 1 && iy <= v.y1 + 1) { var n = node(ix, iy, 'x'); h.pts.push(n); v.pts.push(n); }
  }
  roads.forEach(function (r) {
    r.pts.push(node(r.x0, r.y0, 'end')); r.pts.push(node(r.h ? r.x1 : r.x0, r.h ? r.y0 : r.y1, 'end'));
    var len = r.h ? r.x1 - r.x0 : r.y1 - r.y0; for (var t = 700; t < len - 300; t += 700) r.pts.push(node(r.h ? r.x0 + t : r.x0, r.h ? r.y0 : r.y0 + t, 'mid'));
    r.pts.sort(function (a, b) { return r.h ? a.x - b.x : a.y - b.y; });
    for (var k = 1; k < r.pts.length; k++) link(r.pts[k - 1], r.pts[k]);
  });
  var roadNodes = nodes.slice();
  function nearestReach(x, y, pool, maxD) {
    var c = pool.map(function (n) { return [n, Math.hypot(n.x - x, n.y - y)]; }).filter(function (q) { return q[1] < (maxD || 1e9); }).sort(function (a, b) { return a[1] - b[1]; });
    var out = []; for (var i2 = 0; i2 < c.length && out.length < 2; i2++) if (rectLos(x, y, c[i2][0].x, c[i2][0].y, 16)) out.push(c[i2][0]);
    if (!out.length && c.length) out.push(c[0][0]); return out;
  }
  // interiors: a loose grid of waypoints in each room, linked where the way is clear
  (M.rooms || []).forEach(function (rm) {
    var pts = [];
    for (var x = rm.x0 + 90; x < rm.x1 - 50; x += 170) for (var y = rm.y0 + 90; y < rm.y1 - 50; y += 170) {
      if (rectsIn(x - 30, y - 30, x + 30, y + 30).some(function (r) { return inRect(r, x, y, 30); })) continue;
      pts.push(node(x, y, rm.id));
    }
    (rm.gaps || []).forEach(function (gp) { pts.push(node(gp.x, gp.y, rm.id)); pts.push(node(gp.x + (gp.v ? -90 : 0), gp.y + (gp.v ? 0 : -90), rm.id)); pts.push(node(gp.x + (gp.v ? 90 : 0), gp.y + (gp.v ? 0 : 90), rm.id)); });
    rm.nodes = pts;
    for (var a = 0; a < pts.length; a++) for (var b2 = a + 1; b2 < pts.length; b2++) { var d = Math.hypot(pts[a].x - pts[b2].x, pts[a].y - pts[b2].y); if (d < 400 && rectLos(pts[a].x, pts[a].y, pts[b2].x, pts[b2].y, 18)) link(pts[a], pts[b2], d); }
  });
  (M.doors || []).forEach(function (d) {
    var o = node(d.out.x + d.out.nx * 70, d.out.y + d.out.ny * 70, 'door'), inn = node(d.in.x - d.in.nx * 70, d.in.y - d.in.ny * 70, 'door');
    d.outNode = o.id; d.inNode = inn.id;
    nearestReach(o.x, o.y, roadNodes, 900).forEach(function (n) { link(o, n); });
    var rm = (M.rooms || []).find(function (r) { return r.id === d.room; });
    nearestReach(inn.x, inn.y, rm ? rm.nodes : [], 600).forEach(function (n) { link(inn, n); });
    link(o, inn, 80, d);
  });
  M.nav = { nodes: nodes, roadNodes: roadNodes };
}
function navAttach(x, y) {
  var N = MAP.nav, rm = roomAt(x, y), pool = rm ? rm.nodes.concat(N.nodes.filter(function (n) { return n.tag === 'door' && Math.hypot(n.x - x, n.y - y) < 600; })) : N.roadNodes.concat(N.nodes.filter(function (n) { return n.tag === 'door' && n.x < MAP.cityW; }));
  var best = null, bd = 1e9, cands = [];
  pool.forEach(function (n) { var d = Math.hypot(n.x - x, n.y - y); cands.push([n, d]); });
  cands.sort(function (a, b) { return a[1] - b[1]; });
  for (var i = 0; i < Math.min(6, cands.length); i++) if (rectLos(x, y, cands[i][0].x, cands[i][0].y, 14)) return cands[i][0];
  return cands.length ? cands[0][0] : null;
}
function navPath(sx, sy, tx, ty) {
  var N = MAP.nav; if (!N) return null;
  var a = navAttach(sx, sy), z = navAttach(tx, ty); if (!a || !z) return null;
  var open = [a.id], g = {}, f = {}, from = {}, closed = {}; g[a.id] = 0; f[a.id] = Math.hypot(a.x - z.x, a.y - z.y);
  var guard = 0;
  while (open.length && guard++ < 4000) {
    var bi = 0; for (var i = 1; i < open.length; i++) if (f[open[i]] < f[open[bi]]) bi = i;
    var cur = open.splice(bi, 1)[0]; if (cur === z.id) break; closed[cur] = true;
    var cn = N.nodes[cur];
    for (var k = 0; k < cn.adj.length; k++) {
      var e = cn.adj[k]; if (closed[e.to]) continue; var ng = g[cur] + e.cost;
      if (g[e.to] === undefined || ng < g[e.to]) { g[e.to] = ng; from[e.to] = { n: cur, door: e.door }; var tn = N.nodes[e.to]; f[e.to] = ng + Math.hypot(tn.x - z.x, tn.y - z.y); if (open.indexOf(e.to) < 0) open.push(e.to); }
    }
  }
  if (g[z.id] === undefined) return null;
  var path = [], c = z.id;
  while (c !== a.id) { var st = from[c], n2 = N.nodes[c]; if (st.door) { var dd = st.door, goingIn = c === dd.inNode; path.unshift({ x: n2.x, y: n2.y }); path.unshift(goingIn ? { x: dd.out.x - dd.out.nx * 40, y: dd.out.y - dd.out.ny * 40, door: dd } : { x: dd.in.x + dd.in.nx * 40, y: dd.in.y + dd.in.ny * 40, door: dd }); } else path.unshift({ x: n2.x, y: n2.y }); c = st.n; }
  path.unshift({ x: a.x, y: a.y });
  return path;
}
// where should f head next on its way to (tx, ty)?
function cityNav(f, tx, ty) {
  var tz = (!MAP.cityW || tx < MAP.cityW) ? 'city' : ((roomAt(tx, ty) || {}).id || 'void'), fz = zoneOf(f);
  if (fz === tz && rectLos(f.x, f.y, tx, ty, FR - 4)) { f.nav = null; return [tx, ty]; }
  var N = f.nav;
  if (!N || Math.hypot(N.gx - tx, N.gy - ty) > 280 || G.time > N.t || N.zone !== fz) { N = f.nav = { gx: tx, gy: ty, t: G.time + 3, zone: fz, path: navPath(f.x, f.y, tx, ty), i: 0 }; }
  var P = N.path; if (!P || !P.length) return [tx, ty];
  while (N.i < P.length - 1) {
    var p = P[N.i]; if (p.door) break;
    var nx = P[N.i + 1];
    if (Math.hypot(p.x - f.x, p.y - f.y) < 90 || (!nx.door && rectLos(f.x, f.y, nx.x, nx.y, FR))) N.i++; else break;
  }
  var w = P[N.i]; if (N.i >= P.length - 1 && Math.hypot(w.x - f.x, w.y - f.y) < 90) return [tx, ty];
  return [w.x, w.y];
}
/* ---- doors: walking into a doorway steps through it ---- */
function doorTick(f, dt) {
  if (!MAP.doors || f.st === 'dead' || f.inM || f.spirit === 1 || f.spirit === 3) return;
  if (f.doorT > 0) { f.doorT -= dt; return; }
  var mx = f.inp.mx, my = f.inp.my; if (Math.hypot(mx, my) < 0.2) return;
  for (var i = 0; i < MAP.doors.length; i++) {
    var d = MAP.doors[i];
    if (f.x < MAP.cityW) { if (Math.hypot(f.x - d.out.x, f.y - d.out.y) < 52 && (mx * -d.out.nx + my * -d.out.ny) > 0.3) { stepDoor(f, d.in.x - d.in.nx * 60, d.in.y - d.in.ny * 60, d, true); return; } }
    else if (Math.hypot(f.x - d.in.x, f.y - d.in.y) < 52 && (mx * d.in.nx + my * d.in.ny) > 0.3) { stepDoor(f, d.out.x + d.out.nx * 60, d.out.y + d.out.ny * 60, d, false); return; }
  }
}
function stepDoor(f, x, y, d, entering) {
  f.x = x; f.y = y; f.kx = f.ky = 0; f.doorT = 0.9; f.nav = null;
  FX.fx('door', x, y, f); FX.snd('whiff', f);
  if (f === G.f[0] || entering) FX.text(f, entering ? d.room === 'einzbern' ? 'EINZBERN CASTLE' : (MAP.rooms.find(function (r) { return r.id === d.room; }) || {}).name.toUpperCase() : 'OUTSIDE');
  G.f.forEach(function (o) { if (o.foe === f || o.lock === f) o.nav = null; });
}
/* ---- homes: each master starts at their family seat; a second member of the same family gets a new estate ---- */
var MASTER_HOME = { rin: 'tohsaka', sakura: 'matou', kariya: 'matou', illya: 'einzbern', irisviel: 'einzbern', kirei: 'church', kayneth: 'hyatt', waver: 'mackenzie', shirou: 'emiya', kiritsugu: null };
var ESTATE_STYLE = { tohsaka: ['mansion_w', 'Tohsaka villa'], matou: ['mansion_d', 'Matou house'], einzbern: ['villa_e', 'Einzbern villa'], church: ['chapel', 'Church annex'], hyatt: ['hotel_s', 'Hotel suite'], mackenzie: ['house_w', 'Rented house'], emiya: ['house_jpL', 'Emiya house'], safe: ['safehouse', 'Safehouse'] };
function assignHomes(teams, rnd) {
  rnd = rnd || Math.random;
  MAP.b = MAP.b.filter(function (q) { return !q.gen; });
  var used = {}, freePlots = shuffled(MAP.plots.map(function (p, i) { return i; }), rnd), out = [];
  teams.forEach(function (t, ti) {
    var key = MASTER_HOME[t.master.id], H0 = key && MAP.homes[key];
    if (H0 && !used[key]) { used[key] = true; out.push({ team: ti, key: key, name: H0.name, x: H0.x, y: H0.y, canon: true }); return; }
    var pi = freePlots.shift(), p = MAP.plots[pi === undefined ? 0 : pi], st = ESTATE_STYLE[key || 'safe'];
    MAP.b.push({ x: p[0], y: p[1] - 30, w: 300, h: 210, k: st[0], gen: true, name: st[1] });
    out.push({ team: ti, key: key || 'safe', name: st[1], x: p[0], y: p[1] + 120, canon: false });
  });
  RECTS = []; MAP.b.forEach(function (b) { if (!b.walk) RECTS.push({ x0: b.x - b.w / 2, y0: b.y - b.h / 2, x1: b.x + b.w / 2, y1: b.y + b.h / 2, nb: !!b.nb, b: b }); }); buildRectGrid();
  return out;
}
function summonSpot(h) {
  if (h.canon && MAP.spots && MAP.spots[h.key]) return MAP.spots[h.key];
  return { x: h.x, y: h.y - 20, name: h.name };
}
