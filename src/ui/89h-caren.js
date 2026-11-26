/* ---- Caren Hortensia's effects: the Shroud of Magdalene, Sacrament, and the Stigmata opening ---- */
(function () {
  var prev = fxExtra;
  fxExtra = function (n, x, y, f) {
    var id = f && f.def ? f.def.id : '';
    if (id === 'caren' && n === 'skillfire') {
      // the ribbon around her lashes out: a red flare where it leaves the loop
      var fa = f.face, ox = x + Math.cos(fa) * 34, oy = y + Math.sin(fa) * 34;
      vfx(0.3, function (g, p) { g.save(); g.strokeStyle = 'rgba(200,40,58,' + (0.8 * (1 - p)) + ')'; g.lineWidth = 2.5; g.beginPath(); g.arc(ox, oy, 6 + 22 * p, 0, 6.283); g.stroke(); g.restore(); });
      return true;
    }
    if (id === 'caren' && n === 'sigfire') {
      // Sacrament: a pale gold cross rises over her and her servant, inside a slow ring of light
      [f, f.partner].forEach(function (t) {
        if (!t || t.st === 'dead' || (t !== f && dist(f, t) > f.A.np.range)) return;
        vfx(0.9, function (g, p) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - p; g.strokeStyle = '#f6e2a8'; g.lineWidth = 3;
          g.beginPath(); g.arc(t.x, t.y, 30 + 26 * p, 0, 6.283); g.stroke();
          g.lineWidth = 4; g.beginPath(); g.moveTo(t.x, t.y - 34 - 16 * p); g.lineTo(t.x, t.y + 8 - 16 * p); g.moveTo(t.x - 12, t.y - 22 - 16 * p); g.lineTo(t.x + 12, t.y - 22 - 16 * p); g.stroke(); g.restore(); });
      });
      return true;
    }
    if (n === 'stigmata' && f) {
      // her wounds open: drops of red light and a thin ring that reaches out toward what she felt
      vfx(0.9, function (g, p) { g.save(); g.strokeStyle = 'rgba(200,40,58,' + (0.6 * (1 - p)) + ')'; g.lineWidth = 2; g.setLineDash([3, 7]); g.beginPath(); g.arc(f.x, f.y, 40 + 160 * p, 0, 6.283); g.stroke();
        g.setLineDash([]); g.fillStyle = 'rgba(220,40,60,' + (1 - p) + ')'; [-1, 1].forEach(function (sd) { g.beginPath(); g.arc(f.x + sd * 12, f.y + 6 + 14 * p, 2.4, 0, 6.283); g.fill(); }); g.restore(); });
      return true;
    }
    return prev ? prev(n, x, y, f) : false;
  };
  // the Shroud in flight: a red cloth that ripples as it flies
  var prevP = drawProjX;
  drawProjX = function (g, p, a) {
    if (p.a.shape !== 'shroud') return prevP(g, p, a);
    var t = G.time, L = 46;
    g.save(); g.translate(p.x, p.y); g.rotate(a); g.fillStyle = '#c8283a'; g.strokeStyle = '#5a0c16'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(6, -7);
    for (var i = 0; i <= 8; i++) { var u = i / 8; g.lineTo(6 - u * L, -7 + u * 3 + Math.sin(t * 22 - u * 6) * 5 * u); }
    for (var j = 8; j >= 0; j--) { var v = j / 8; g.lineTo(6 - v * L, 7 - v * 3 + Math.sin(t * 22 - v * 6) * 5 * v); }
    g.closePath(); g.fill(); g.stroke(); g.restore(); return true;
  };
})();

/* the Shroud of Magdalene drifts around her like a dancer's ribbon; when she casts, its leading end unwinds toward her target */
function drawCarenRibbon(f) {
  var t = G.time, base = t * 1.5 + f.idx * 1.7, ext = 0;
  if (f.key === 'skill' && f.act) { if (f.st === 'wind') ext = clamp(f.t / (f.windTotal || f.act.wind || 0.3), 0, 1); else if (f.st === 'act') ext = 1; else if (f.st === 'rec') ext = Math.max(0, 1 - f.t / 0.3); }
  var N = 30, pts = [];
  for (var i = 0; i < N; i++) {
    var u = i / (N - 1), an = base + u * 4.6, r = 31 + 4 * Math.sin(t * 2.6 + u * 6);
    var x = f.x + Math.cos(an) * r, y = f.y + Math.sin(an) * r * 0.88 + Math.sin(u * 9 + t * 4) * 2.5;
    var k = Math.max(0, (u - 0.5) / 0.5) * ext;
    if (k > 0) { var tx = f.x + Math.cos(f.face) * (36 + 90 * k), ty = f.y + Math.sin(f.face) * (36 + 90 * k) + Math.sin(u * 14 + t * 20) * 5 * k; x += (tx - x) * k; y += (ty - y) * k; }
    pts.push([x, y, u]);
  }
  ctx.save(); ctx.lineCap = 'round';
  [['#4a0a14', 2.4], ['#c8283a', 0]].forEach(function (L) {
    ctx.strokeStyle = L[0];
    for (var j = 1; j < pts.length; j++) { var w = 1.4 + 4 * Math.sin(Math.PI * pts[j][2]); ctx.lineWidth = w + L[1]; ctx.beginPath(); ctx.moveTo(pts[j - 1][0], pts[j - 1][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke(); }
  });
  ctx.restore();
}
var drawFighterC0 = drawFighter;
drawFighter = function (f, i, ar) {
  drawFighterC0(f, i, ar);
  if (f.def.id === 'caren' && f.st !== 'dead' && !(f.hid && f.team !== (G.f[MEI] || {}).team)) drawCarenRibbon(f);
};
