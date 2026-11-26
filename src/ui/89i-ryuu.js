/* ---- Ryuunosuke's effects (knife cuts, Fade into the Crowd, Masterpiece, the harm he feeds on),
   and two shared status looks: fire on a burning fighter, and the bind on a bound one ---- */
(function () {
  var prev = fxExtra;
  fxExtra = function (n, x, y, f) {
    var id = f && f.def ? f.def.id : '';
    if (id === 'ryuunosuke' && n === 'skillfire') return true; // the fade itself draws, or the "no crowd" text says why not
    if (n === 'fade' && f) {
      // the street seems to close around him: faint figures pass between him and everyone else
      for (var i = 0; i < 5; i++) (function (k) { var a0 = k * 1.257 + Math.random(), r = 50 + Math.random() * 30; vfx(1.1, function (g, p) { var a = a0 + p * 1.2, al = 0.7 * Math.sin(Math.PI * p); g.save(); g.globalAlpha = al; g.fillStyle = '#6a7280'; g.beginPath(); g.arc(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r, 14, 0, 6.283); g.fill(); g.fillStyle = '#9aa2ae'; g.beginPath(); g.arc(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r, 7.5, 0, 6.283); g.fill(); g.restore(); }); })(i);
      return true;
    }
    if (id === 'ryuunosuke' && n === 'sigfire') {
      // Masterpiece: the light seems to dip, then two quick red cuts cross in front of him
      var fa = f.face, cx = x + Math.cos(fa) * 60, cy = y + Math.sin(fa) * 60;
      flashFx('#1a0408', 0.25, 0.35);
      slashFx(cx, cy, fa + 0.8, 70, 0.25, '200,30,50', 0.35, 5);
      setTimeout(function () { slashFx(cx, cy, fa - 0.8, 70, -0.25, '200,30,50', 0.35, 5); }, 70);
      return true;
    }
    if (n === 'harm' && f) {
      // the harm he does flows back to him: dark red motes drawn inward
      for (var j = 0; j < 7; j++) (function (k) { var a0 = Math.random() * 6.283, r0 = 70 + Math.random() * 40; vfx(0.7, function (g, p) { var r = r0 * (1 - p), a = a0 + p * 2; g.save(); g.globalAlpha = 0.8 * (1 - p * 0.6); g.fillStyle = '#8e1424'; g.beginPath(); g.arc(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r, 3, 0, 6.283); g.fill(); g.restore(); }); })(j);
      return true;
    }
    return prev ? prev(n, x, y, f) : false;
  };
})();

// a knife's quick cut: a thin pale arc in front of him on each light and heavy strike
var fxKnifeSeen = {};
function ryuKnifeTrail(f) {
  if (!f.act || (f.key !== 'light' && f.key !== 'heavy') || f.st !== 'act') { fxKnifeSeen[f.idx] = null; return; }
  var tag = f.key + ':' + f.combo; if (fxKnifeSeen[f.idx] === tag) return; fxKnifeSeen[f.idx] = tag;
  var fa = f.face, side = (f.combo || 0) % 2 ? 1 : -1;
  slashFx(f.x + Math.cos(fa) * 46, f.y + Math.sin(fa) * 46, fa + side * 1.2, f.key === 'heavy' ? 90 : 56, side * 0.35, '235,238,242', 0.22, f.key === 'heavy' ? 4 : 2.5);
}
// fire licking at a burning fighter (Tokiomi's flames)
function drawBurning(f) {
  var t = G.time, n = 6; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < n; i++) {
    var a = i * 6.283 / n + t * 1.3, ph = (t * 3.2 + i * 0.37) % 1, r = 18 + 4 * Math.sin(i * 2.1), bx = f.x + Math.cos(a) * r, by = f.y + Math.sin(a) * r;
    var h = 10 + 12 * Math.sin(Math.PI * ph), w = 5 + 2 * Math.sin(t * 9 + i);
    var lg = ctx.createLinearGradient(bx, by, bx, by - h); lg.addColorStop(0, 'rgba(255,90,20,' + (0.7 * (1 - ph * 0.5)) + ')'); lg.addColorStop(1, 'rgba(255,210,90,0)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(bx - w, by); ctx.quadraticCurveTo(bx - w * 0.3, by - h * 0.6, bx + Math.sin(t * 7 + i) * 3, by - h); ctx.quadraticCurveTo(bx + w * 0.3, by - h * 0.6, bx + w, by); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// the bind on a bound fighter, in the look of whoever bound them
function drawBound(f) {
  var t = G.time, by = f.rootBy || '', fade = Math.min(1, f.rootT * 3);
  ctx.save(); ctx.globalAlpha = fade; ctx.lineCap = 'round';
  if (by === 'caren') {
    // the red shroud wound round them
    ctx.strokeStyle = '#4a0a14'; ctx.lineWidth = 7; for (var k = 0; k < 2; k++) { ctx.beginPath(); ctx.ellipse(f.x, f.y + (k - 0.5) * 10, 24, 10, 0.3 + k * 0.5, 0, 6.283); ctx.stroke(); }
    ctx.strokeStyle = '#c8283a'; ctx.lineWidth = 4.5; for (var k2 = 0; k2 < 2; k2++) { ctx.beginPath(); ctx.ellipse(f.x, f.y + (k2 - 0.5) * 10, 24, 10, 0.3 + k2 * 0.5, 0, 6.283); ctx.stroke(); }
    ctx.fillStyle = '#c8283a'; ctx.beginPath(); ctx.moveTo(f.x + 20, f.y - 4); ctx.quadraticCurveTo(f.x + 34, f.y - 10 + Math.sin(t * 6) * 4, f.x + 42, f.y - 2); ctx.lineTo(f.x + 22, f.y + 2); ctx.fill();
  } else if (by === 'sakura' || by === 'kariya') {
    // shadow or worms clinging from the ground
    ctx.strokeStyle = by === 'sakura' ? 'rgba(20,6,24,.9)' : 'rgba(74,58,90,.9)'; ctx.lineWidth = 5;
    for (var i = 0; i < 5; i++) { var a = i * 1.257 + 0.3, r0 = 30; ctx.beginPath(); ctx.moveTo(f.x + Math.cos(a) * r0, f.y + Math.sin(a) * r0); ctx.quadraticCurveTo(f.x + Math.cos(a + 0.5) * 16, f.y + Math.sin(a + 0.5) * 16 + Math.sin(t * 5 + i) * 3, f.x + Math.cos(a + 1.1) * 8, f.y + Math.sin(a + 1.1) * 8); ctx.stroke(); }
  } else {
    // silver wire (Irisviel) and every other bind: thin bright loops pulled tight
    ctx.strokeStyle = by === 'irisviel' || by === 'illya' ? 'rgba(230,238,248,.9)' : 'rgba(210,220,240,.75)'; ctx.lineWidth = 1.4;
    for (var j = 0; j < 4; j++) { ctx.beginPath(); ctx.ellipse(f.x, f.y, 22 + j * 2, 9 + j * 2, j * 0.8 + t * 0.4, 0, 6.283); ctx.stroke(); }
  }
  ctx.restore();
}
var drawFighterR0 = drawFighter;
drawFighter = function (f, i, ar) {
  var vis = f.st !== 'dead' && !(f.hid && f.team !== (G.f[MEI] || {}).team);
  var faded = vis && f.fadeT > 0;
  if (faded) { ctx.save(); ctx.globalAlpha = f.team === (G.f[MEI] || {}).team ? 0.55 : 0.35; }
  drawFighterR0(f, i, ar);
  if (faded) ctx.restore();
  if (!vis) return;
  if (f.def.id === 'ryuunosuke') ryuKnifeTrail(f);
  if (f.bleedT > 0 && f.burnFx) drawBurning(f);
  if (f.rootT > 0) drawBound(f);
};
