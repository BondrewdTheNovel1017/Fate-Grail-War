/* ---- Rho Aias, Enkidu and the shields Rule Breaker dissolves, on screen ---- */
SND.rhoCrack = function (o, out, t) { shatter(o, out, t, 0.32); ringS(o, out, t, [2200, 3300], 0.4, 0.06); };
MORE_LINES.emiya.rho = ['Rho Aias. Seven petals. Try them.', 'You aimed at the wrong man.', 'Thrown weapons are my field.'];
MORE_LINES.shirou = MORE_LINES.shirou || {}; MORE_LINES.shirou.rho = ['Trace on... hold, Rho Aias!', 'I can copy this much!'];
LINES.emiya = LINES.emiya || {}; LINES.emiya.rho = MORE_LINES.emiya.rho; LINES.shirou = LINES.shirou || {}; LINES.shirou.rho = MORE_LINES.shirou.rho;
var ENKIDU_LINES = ['Stay down, mongrel.', 'Know your place, mongrel.', 'Kneel, mongrel.', 'Enkidu. Hold them.', 'You came too close, mongrel.'];
var ENKIDU_DIVINE = ['Even the gods kneel to these chains.', 'Struggle, half-god. They only tighten.'];
// a petal: the shape of one leaf (kept for other effects)
function petal(g, len, w) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.45, -w, len, 0); g.quadraticCurveTo(len * 0.45, w, 0, 0); g.closePath(); }
// Rho Aias: purple-pink shields stacked in layers, a five-lobed flower in front and round layers behind.
// They stand upright facing the attack, so from above each layer is a thin lens across the line of fire.
var RHO_LOOK = { W: 55, sq: 0.26, out: 40, gap: 3.5, open: 0.15, core: '180,92,224', rim: '255,154,216' };
function rhoPath(g, R, lobes, sq) {
  g.beginPath();
  for (var i = 0; i <= 60; i++) { var th = i / 60 * 6.2832, r = lobes ? R * (0.8 + 0.2 * Math.cos(lobes * th)) : R; g.lineTo(Math.cos(th) * r * sq, Math.sin(th) * r); }
  g.closePath();
}
function rhoPip(g, x, y, flower) { g.beginPath(); for (var i = 0; i <= 30; i++) { var th = i / 30 * 6.2832, r = flower ? 4.6 * (0.72 + 0.28 * Math.cos(5 * th)) : 3.4; g.lineTo(x + Math.cos(th - 1.5708) * r, y + Math.sin(th - 1.5708) * r); } g.closePath(); }
function drawRho(g, f) {
  var m = rhoMax(f); if (!m || f.st === 'dead') return;
  var L = RHO_LOOK, left = rhoPetals(f), flash = f.rhoFlash && G.time - f.rhoFlash < 0.35 ? 1 - (G.time - f.rhoFlash) / 0.35 : 0;
  var n = Math.ceil(left - 0.01);
  if (f._rhoN !== undefined && n < f._rhoN) f._rhoBrk = { t: G.time, flower: f._rhoN === m, k: f._rhoN };
  f._rhoN = n;
  // the counter beside the health bar: round pips, the flower pip last (it breaks first)
  if (f === G.f[MEI] || f.guarding) {
    g.save(); for (var i = 0; i < m; i++) { var on = i < n, part = i === Math.floor(left) ? left - Math.floor(left) : 1;
      g.globalAlpha = on ? (i === Math.floor(left) && part < 1 ? 0.35 + 0.5 * part : 0.95) : 0.2;
      g.fillStyle = on ? (i === m - 1 ? 'rgb(' + L.rim + ')' : 'rgb(' + L.core + ')') : '#5a5f70';
      rhoPip(g, f.x - (m - 1) * 5 + i * 10, f.y + 40, i === m - 1); g.fill(); }
    g.restore();
  }
  var brk = f._rhoBrk && G.time - f._rhoBrk.t < 0.3 ? f._rhoBrk : null;
  if (!f.guarding || (left <= 0 && !brk)) return;
  var open = Math.min(1, (f.guardT || 0) / L.open), cs = Math.cos(f.face), sn = Math.sin(f.face);
  g.save(); g.translate(f.x, f.y); g.rotate(f.face); g.globalCompositeOperation = 'lighter';
  // back to front; layer j counts from the front (0 is the front one)
  for (var j = n - 1; j >= 0; j--) {
    var show = Math.max(0, Math.min(1, open * n - j)); if (show <= 0) continue;
    var flower = j === 0 && n === m, front = j === 0, R = L.W * (0.6 + 0.4 * show) * (front ? 1 + flash * 0.08 : 1 - j * 0.02);
    g.save(); g.translate(L.out - j * L.gap + (front ? flash * 3 : 0), 0);
    var fade = (front ? 1 : 0.75 - j * 0.06) * show, sh = 0.05 * Math.sin(G.time * 5 + j);
    var gr = g.createLinearGradient(0, -R, 0, R); gr.addColorStop(0, 'rgba(' + L.rim + ',.55)'); gr.addColorStop(0.5, 'rgba(' + L.core + ',.85)'); gr.addColorStop(1, 'rgba(' + L.rim + ',.55)');
    g.globalAlpha = (0.16 + 0.25 * flash + sh) * fade; g.fillStyle = gr; rhoPath(g, R, flower ? 5 : 0, L.sq); g.fill();
    g.globalAlpha = (0.55 + 0.4 * flash) * fade; g.strokeStyle = front ? 'rgba(255,240,250,.95)' : 'rgba(' + L.rim + ',.9)'; g.lineWidth = front ? 1.6 : 1.1; rhoPath(g, R, flower ? 5 : 0, L.sq); g.stroke();
    if (flower) { g.globalAlpha = 0.35 * fade; g.lineWidth = 1; g.beginPath(); for (var p = 0; p < 5; p++) { var th = p / 5 * 6.2832; g.moveTo(0, 0); g.lineTo(Math.cos(th) * R * L.sq, Math.sin(th) * R); } g.stroke(); }
    g.restore();
  }
  // the layer that just broke: cracks white, then gone
  if (brk) {
    var u = (G.time - brk.t) / 0.3, R2 = L.W * (1 + u * 0.15);
    g.save(); g.translate(L.out + 4 + u * 10, 0); g.globalAlpha = 0.8 * (1 - u); g.strokeStyle = '#ffffff'; g.lineWidth = 1.4;
    rhoPath(g, R2, brk.flower ? 5 : 0, L.sq); g.stroke();
    g.beginPath(); for (var c = 0; c < 6; c++) { var y0 = (c / 5 - 0.5) * R2 * 1.6; g.moveTo(0, y0 * 0.2); g.lineTo(((c % 2) ? 1 : -1) * R2 * L.sq * 0.8, y0); } g.stroke();
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
    if (n === 'rho') { var ff = f.f; ff.rhoFlash = G.time; if (f.lost > 0 && FX.near(x, y)) for (var s = 0; s < 6 * f.lost; s++) { var an = ff.face + (Math.random() - 0.5) * 1.8, sp = 120 + Math.random() * 200; parts.push({ x: ff.x + Math.cos(ff.face) * 40, y: ff.y + Math.sin(ff.face) * 40, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, t: 0, life: 0.5, col: Math.random() < 0.4 ? '#b45ce0' : Math.random() < 0.6 ? '#ff9ad8' : '#ffffff' }); } return true; }
    if (n === 'rhoBreak') { ringFx(x, y, 10, 120, '#ff9ad8', 0.45, 6); FX.spark(x, y, '#c77ae6', 26); flashFx('#e7b0f0', 0.12, 0.2); return true; }
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
