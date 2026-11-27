/* ---- Excalibur: motes of light gather while she charges; where the beam strikes, a gold circle, then a pillar of light that breaks into motes ---- */
(function () {
  var prev = fxExtra;
  fxExtra = function (n, x, y, f) {
    if (n === 'excalMark') {
      // the gold circle that warns where the pillar will rise
      ringFx(x, y, 20, 130, '#ffd36b', 0.35, 4);
      return true;
    }
    if (n === 'arrowLand' && f && f.a && f.a.zshape === 'excal') {
      var r = f.r || 130;
      flashFx('#fff2c4', 0.3, 0.18); FX.shake(6); decal('scorch', x, y, { r: r * 0.5, life: 8 });
      // the pillar, seen from above: light rising straight up at the viewer, a blinding disc with rays bursting outward, then fading
      vfx(1.1, function (g, p) {
        var al = p < 0.12 ? p / 0.12 : 1 - (p - 0.12) / 0.88, rr = r * (0.55 + 0.45 * Math.min(1, p * 4)) * (1 - 0.25 * p);
        g.save(); g.globalCompositeOperation = 'lighter';
        var rg = g.createRadialGradient(x, y, 0, x, y, rr * 1.35); rg.addColorStop(0, 'rgba(255,255,245,' + (0.95 * al) + ')'); rg.addColorStop(0.35, 'rgba(255,235,170,' + (0.75 * al) + ')'); rg.addColorStop(0.75, 'rgba(255,195,80,' + (0.3 * al) + ')'); rg.addColorStop(1, 'rgba(255,170,40,0)');
        g.fillStyle = rg; g.beginPath(); g.arc(x, y, rr * 1.35, 0, 6.283); g.fill();
        // rays: the column's edge seen end-on, streaking out from the disc and turning slowly
        for (var k = 0; k < 16; k++) {
          var a = k * 0.3927 + p * 0.6, len = rr * (1.2 + 0.5 * Math.sin(k * 1.7)) * (0.8 + 0.6 * p), wd = 0.05 + 0.03 * (k % 3);
          var lg = g.createLinearGradient(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len); lg.addColorStop(0, 'rgba(255,245,210,' + (0.55 * al) + ')'); lg.addColorStop(1, 'rgba(255,200,90,0)');
          g.fillStyle = lg; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a - wd) * len, y + Math.sin(a - wd) * len); g.lineTo(x + Math.cos(a + wd) * len, y + Math.sin(a + wd) * len); g.closePath(); g.fill();
        }
        g.strokeStyle = 'rgba(255,240,200,' + (0.7 * al) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, rr * 0.55, 0, 6.283); g.stroke();
        g.restore();
      });
      // then it breaks into motes of light that drift and fade
      for (var i = 0; i < 26; i++) (function () {
        var a = Math.random() * 6.283, d = Math.random() * r * 0.9, mx = x + Math.cos(a) * d, my = y + Math.sin(a) * d * 0.8, rise = 60 + Math.random() * 140, sw = Math.random() * 6.283, sz = 1.6 + Math.random() * 2.4, life = 1.2 + Math.random() * 0.8, delay = 0.25 + Math.random() * 0.4;
        vfx(life + delay, function (g, p) {
          var q = (p * (life + delay) - delay) / life; if (q < 0) return;
          var al = q < 0.2 ? q / 0.2 : 1 - (q - 0.2) / 0.8, ou = 1 + rise / 260 * q, px = x + (mx - x) * ou + Math.sin(sw + q * 5) * 6, py = y + (my - y) * ou + Math.cos(sw + q * 4) * 6;
          g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,225,140,' + (0.9 * al) + ')'; g.beginPath(); g.arc(px, py, sz, 0, 6.283); g.fill();
          g.fillStyle = 'rgba(255,240,200,' + (0.25 * al) + ')'; g.beginPath(); g.arc(px, py, sz * 3, 0, 6.283); g.fill(); g.restore();
        });
      })();
      return true;
    }
    return prev ? prev(n, x, y, f) : false;
  };
})();
// while she charges Excalibur, motes of light spiral in around her
function drawExcalCharge(f) {
  var p = clamp(f.t / (f.windTotal || f.curWind || 1.8), 0, 1), t = G.time, n = 18;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < n; i++) {
    var ph = (t * 0.7 + i / n) % 1, a = i * 2.4 + t * (1 + p * 2), r = (90 - 60 * ph) * (1 - p * 0.35), al = Math.sin(Math.PI * ph) * (0.4 + 0.6 * p);
    var x = f.x + Math.cos(a) * r, y = f.y + Math.sin(a) * r, sz = 1.4 + 1.8 * p;
    ctx.fillStyle = 'rgba(255,220,130,' + (0.9 * al) + ')'; ctx.beginPath(); ctx.arc(x, y, sz, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,200,' + (0.2 * al) + ')'; ctx.beginPath(); ctx.arc(x, y, sz * 3.2, 0, 6.283); ctx.fill();
  }
  ctx.restore();
}
var drawFighterX0 = drawFighter;
drawFighter = function (f, i, ar) {
  drawFighterX0(f, i, ar);
  if (f.def.id === 'caerwyn' && f.key === 'np' && f.st === 'wind' && !(f.hid && f.team !== (G.f[MEI] || {}).team)) drawExcalCharge(f);
};
