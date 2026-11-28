/* ---- truce zones you can see: a pale ring on the ground around every place where no one may fight ---- */
function truceRings() {
  var out = [], E = G.event, L = G.lastSchool;
  if (E && E.kind === 'horror' && E.boss && !E.boss.dead) out.push({ x: E.boss.x, y: E.boss.y, r: EVT.horror.truceR });
  if (L && G.time < L.truceEnd) out.push({ x: L.x, y: L.y, r: L.r + 200 });
  (G.tasks || []).forEach(function (k) { if (k.kind === 'banquet' || k.kind === 'summons') out.push({ x: k.x, y: k.y, r: k.r + 120 }); });
  return out;
}
var truceGfx0 = drawGroundFx;
drawGroundFx = function (g) {
  if (G && G.mode === 'war') {
    var rs = truceRings(), t = G.time;
    rs.forEach(function (z) {
      if (VIEWR && (z.x + z.r < VIEWR.x0 || z.x - z.r > VIEWR.x1 || z.y + z.r < VIEWR.y0 || z.y - z.r > VIEWR.y1)) return;
      g.save();
      g.globalAlpha = 0.05; g.fillStyle = '#bfe2ff'; g.beginPath(); g.arc(z.x, z.y, z.r, 0, 6.2832); g.fill();
      g.globalAlpha = 0.55; g.strokeStyle = '#cfe8ff'; g.lineWidth = 4; g.setLineDash([26, 18]); g.lineDashOffset = -t * 18;
      g.beginPath(); g.arc(z.x, z.y, z.r, 0, 6.2832); g.stroke();
      g.globalAlpha = 0.22; g.lineWidth = 12; g.setLineDash([]); g.beginPath(); g.arc(z.x, z.y, z.r - 8, 0, 6.2832); g.stroke();
      g.restore();
    });
  }
  truceGfx0(g);
};
