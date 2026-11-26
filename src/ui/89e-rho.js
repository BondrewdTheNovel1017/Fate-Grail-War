/* ---- Rho Aias, Enkidu and the shields Rule Breaker dissolves, on screen ---- */
SND.rhoCrack = function (o, out, t) { shatter(o, out, t, 0.32); ringS(o, out, t, [2200, 3300], 0.4, 0.06); };
MORE_LINES.emiya.rho = ['Rho Aias. Seven petals. Try them.', 'You aimed at the wrong man.', 'Thrown weapons are my field.'];
MORE_LINES.shirou = MORE_LINES.shirou || {}; MORE_LINES.shirou.rho = ['Trace on... hold, Rho Aias!', 'I can copy this much!'];
LINES.emiya = LINES.emiya || {}; LINES.emiya.rho = MORE_LINES.emiya.rho; LINES.shirou = LINES.shirou || {}; LINES.shirou.rho = MORE_LINES.shirou.rho;
var ENKIDU_LINES = ['Stay down, mongrel.', 'Know your place, mongrel.', 'Kneel, mongrel.', 'Enkidu. Hold them.', 'You came too close, mongrel.'];
var ENKIDU_DIVINE = ['Even the gods kneel to these chains.', 'Struggle, half-god. They only tighten.'];
// a petal: the shape of one layer of the shield
function petal(g, len, w) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.45, -w, len, 0); g.quadraticCurveTo(len * 0.45, w, 0, 0); g.closePath(); }
function drawRho(g, f) {
  var m = rhoMax(f); if (!m || f.st === 'dead') return;
  var left = rhoPetals(f), flash = f.rhoFlash && G.time - f.rhoFlash < 0.35 ? 1 - (G.time - f.rhoFlash) / 0.35 : 0;
  // petals beside the health bar so you can always count them
  if (f === G.f[MEI] || f.guarding) {
    g.save(); for (var i = 0; i < m; i++) { var on = i < Math.ceil(left - 0.01), part = i === Math.floor(left) ? left - Math.floor(left) : 1;
      g.globalAlpha = on ? (i === Math.floor(left) && part < 1 ? 0.35 + 0.5 * part : 0.9) : 0.18; g.fillStyle = on ? '#ffd2dc' : '#6a7486';
      g.save(); g.translate(f.x - (m - 1) * 5 + i * 10, f.y + 40); g.rotate(-Math.PI / 2); petal(g, 9, 4); g.fill(); g.restore(); }
    g.restore();
  }
  if (!f.guarding || left <= 0) return;
  // the flower: open in front while guarding, flaring when struck
  var n = Math.ceil(left - 0.01), R = 56 + flash * 8, cx = f.x + Math.cos(f.face) * 30, cy = f.y + Math.sin(f.face) * 30;
  g.save(); g.translate(cx, cy); g.rotate(f.face);
  g.globalCompositeOperation = 'lighter';
  for (var k = 0; k < m; k++) {
    var alive = k < n, an = (k - (m - 1) / 2) * (1.6 / Math.max(1, m - 1)) * (m > 4 ? 1 : 0.8);
    g.save(); g.rotate(an); g.translate(-6, 0);
    g.globalAlpha = alive ? 0.22 + 0.35 * flash + 0.05 * Math.sin(G.time * 6 + k) : 0.05;
    var gr = g.createLinearGradient(0, 0, R, 0); gr.addColorStop(0, 'rgba(255,220,230,.2)'); gr.addColorStop(1, 'rgba(255,170,195,.9)');
    g.fillStyle = gr; petal(g, R, 13); g.fill();
    g.strokeStyle = 'rgba(255,240,245,.9)'; g.lineWidth = 1.2; g.globalAlpha = alive ? 0.5 + 0.4 * flash : 0.06; petal(g, R, 13); g.stroke();
    g.restore();
  }
  g.restore();
}
function drawChains(g, f) {
  if (!(f.boundT > G.time) || f.st === 'dead') return;
  var k = Math.min(1, (f.boundT - G.time) * 3), o = f.boundBy;
  g.save(); g.globalAlpha = k; g.strokeStyle = '#f2cf6a'; g.lineWidth = 3; g.setLineDash([7, 4]); g.lineDashOffset = -G.time * 30;
  for (var i = 0; i < 3; i++) { g.beginPath(); g.ellipse(f.x, f.y, 30 - i * 3, 16, i * 1.05 + G.time * 0.6, 0, 6.283); g.stroke(); }
  for (var j = 0; j < 2; j++) { var an = (o ? Math.atan2(f.y - o.y, f.x - o.x) : 0) + (j ? 2.1 : -2.1), ax = f.x + Math.cos(an) * 120, ay = f.y + Math.sin(an) * 120;
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(f.x, f.y); g.stroke();
    g.setLineDash([]); g.fillStyle = 'rgba(255,211,107,.25)'; g.beginPath(); g.arc(ax, ay, 14, 0, 6.283); g.fill(); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.stroke(); g.setLineDash([7, 4]); g.strokeStyle = '#f2cf6a'; g.lineWidth = 3; }
  g.restore();
}
(function () {
  var dff0 = drawFighterFx; drawFighterFx = function (g, f) { dff0(g, f); if (!visL(f)) return; drawRho(g, f); drawChains(g, f); };
  var px0 = drawProjX; drawProjX = function (g, p, a) {
    if (p.a.shape !== 'chain') return px0(g, p, a);
    if (!p._o) p._o = { x: p.x - p.vx * 0.016, y: p.y - p.vy * 0.016 };
    g.save(); g.strokeStyle = '#f2cf6a'; g.lineWidth = 3.2; g.setLineDash([8, 4]); g.lineDashOffset = -p.trav * 0.5;
    g.beginPath(); g.moveTo(p._o.x, p._o.y); g.lineTo(p.x, p.y); g.stroke(); g.setLineDash([]);
    g.translate(p.x, p.y); g.rotate(a); g.fillStyle = '#ffe9a8'; g.strokeStyle = '#7a5414'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(12, 0); g.lineTo(-4, -7); g.lineTo(0, 0); g.lineTo(-4, 7); g.closePath(); g.fill(); g.stroke();
    g.restore(); return true;
  };
  var fx0 = fxExtra; fxExtra = function (n, x, y, f) {
    if (n === 'rho') { var ff = f.f; ff.rhoFlash = G.time; if (f.lost > 0 && FX.near(x, y)) for (var s = 0; s < 6 * f.lost; s++) { var an = ff.face + (Math.random() - 0.5) * 1.8, sp = 120 + Math.random() * 200; parts.push({ x: ff.x + Math.cos(ff.face) * 40, y: ff.y + Math.sin(ff.face) * 40, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, t: 0, life: 0.5, col: Math.random() < 0.5 ? '#ffd2dc' : '#ffffff' }); } return true; }
    if (n === 'rhoBreak') { ringFx(x, y, 10, 120, '#ffb6c8', 0.45, 6); FX.spark(x, y, '#ffd2dc', 26); flashFx('#ffd2dc', 0.12, 0.2); return true; }
    return fx0 ? fx0(n, x, y, f) : false;
  };
})();
FX.shieldBroken = function (def, kind, att) {
  if (!G || !FX.near(def.x, def.y)) return;
  ringFx(def.x, def.y, 10, 220, '#c89bff', 0.6, 8); FX.spark(def.x, def.y, '#d6b4ff', 24); flashFx('#c89bff', 0.18, 0.3); FX.shake(9);
  FX.banner('Rules are broken', 'Rule Breaker dissolves ' + (kind === 'rho' ? 'Rho Aias' : 'the Hot Gates') + '.', def);
  if (att) { SAYT[att.idx] = performance.now() / 1000; showBubble(att, kind === 'rho' ? 'Seven layers, and not one is a rule I cannot break.' : 'A wall of shields is still a spell, dear.', 3, true); }
};
FX.enkidu = function (att, def) {
  FX.snd('chain', def);
  if (!G || !FX.near(att.x, att.y)) return;
  var now = performance.now() / 1000; if (SAYT[att.idx] && now - SAYT[att.idx] < 6) return; SAYT[att.idx] = now;
  var L = DIVINE[def.def.id] && Math.random() < 0.6 ? ENKIDU_DIVINE : ENKIDU_LINES;
  showBubble(att, L[Math.floor(Math.random() * L.length)], 2.4, true);
};
