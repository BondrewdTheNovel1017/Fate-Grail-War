/* ---- Caren Hortensia's effects: the Shroud of Magdalene, Sacrament, and the Stigmata opening ---- */
(function () {
  var prev = fxExtra;
  fxExtra = function (n, x, y, f) {
    var id = f && f.def ? f.def.id : '';
    if (id === 'caren' && n === 'skillfire') {
      // the red shroud unwinds from her arm and snaps forward
      var fa = f.face;
      vfx(0.35, function (g, p) { g.save(); g.translate(x, y); g.rotate(fa); g.globalAlpha = 0.9 * (1 - p); g.fillStyle = '#c8283a'; g.beginPath(); g.moveTo(10, -4);
        for (var i = 0; i <= 8; i++) { var u = i / 8; g.lineTo(10 + u * 70 * (0.4 + p), -4 - Math.sin(u * 7 + p * 14) * 6 * u); }
        for (var j = 8; j >= 0; j--) { var v = j / 8; g.lineTo(10 + v * 70 * (0.4 + p), 4 - Math.sin(v * 7 + p * 14) * 6 * v); }
        g.closePath(); g.fill(); g.restore(); });
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
