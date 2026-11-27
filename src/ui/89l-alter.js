/* ---- Alter: a servant the Grail's mud has swallowed (the Grail's Taint) is drawn darkened, veined with red, in a black-red haze ---- */
function drawAlterAura(f) {
  var t = G.time; ctx.save();
  var rg = ctx.createRadialGradient(f.x, f.y, 10, f.x, f.y, 64); rg.addColorStop(0, 'rgba(60,0,12,.5)'); rg.addColorStop(1, 'rgba(20,0,6,0)');
  ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(f.x, f.y, 64, 0, 6.283); ctx.fill();
  // mud dripping off and red lines pulsing over the body
  ctx.strokeStyle = 'rgba(220,30,50,' + (0.55 + 0.3 * Math.sin(t * 5)) + ')'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (var i = 0; i < 5; i++) { var a = i * 1.257 + t * 0.4, r0 = 8, r1 = 24 + 4 * Math.sin(t * 3 + i); ctx.beginPath(); ctx.moveTo(f.x + Math.cos(a) * r0, f.y + Math.sin(a) * r0); ctx.quadraticCurveTo(f.x + Math.cos(a + 0.4) * (r1 * 0.6), f.y + Math.sin(a + 0.4) * (r1 * 0.6), f.x + Math.cos(a + 0.2) * r1, f.y + Math.sin(a + 0.2) * r1); ctx.stroke(); }
  ctx.fillStyle = 'rgba(14,2,6,.85)';
  for (var j = 0; j < 4; j++) { var ph = (t * 0.8 + j * 0.25) % 1, aa = j * 1.6 + 0.5; ctx.beginPath(); ctx.ellipse(f.x + Math.cos(aa) * 20, f.y + Math.sin(aa) * 20 + ph * 14, 3 * (1 - ph) + 1, 4 * (1 - ph) + 1, 0, 0, 6.283); ctx.fill(); }
  ctx.restore();
}
var drawFighterA0 = drawFighter;
drawFighter = function (f, i, ar) {
  var alter = f.alterT > G.time && f.st !== 'dead';
  if (alter) { drawAlterAura(f); ctx.save(); ctx.filter = 'brightness(0.42) saturate(0.5) contrast(1.2)'; }
  drawFighterA0(f, i, ar);
  if (alter) ctx.restore();
};
