/* ---- second batch on screen: charges and rubble, the Shadow, the festival, the Great Cavern ---- */
(function () {
  var base = FX.event;
  FX.event = function (kind, d, msg) {
    if (!G || !G.f[MEI]) return; var my = G.f[MEI].team;
    if (kind === 'demo') { if (d.team === my) FX.banner('Bring the house down', 'Plant the charges at ' + teamName(d.target).replace('’s team', '’s home') + ' by hand, then hold them until the fuse runs out.'); else if (d.target === my) FX.banner('Your home is under attack', teamName(d.team) + '’s master is planting charges at your house. Stop them, or lose it.'); else FX.banner('A Demolition', teamName(d.team) + ' moves on ' + teamName(d.target).replace('’s team', '’s home') + ' with explosives.'); return; }
    if (kind === 'charge') { if (d.team === my || d.target === my) note('A charge is set (' + d.charges.filter(function (c) { return c.planted; }).length + '/' + d.charges.length + ')', '#f0a85a'); return; }
    if (kind === 'disarm') { if (d.team === my || d.target === my) note('A charge is pulled out.', '#7fc4ee'); return; }
    if (kind === 'fuse') { if (d.team === my || d.target === my) FX.banner('The fuse is lit', EVT2.demo.fuse + ' seconds. ' + (d.target === my ? 'Pull the charges, or get clear!' : 'Keep them off the charges, then get clear of the blast!')); return; }
    if (kind === 'demolished') { FX.snd('boomBig', { x: d.x, y: d.y, idx: -1 }); flashFx('#ffb060', 0.4, 0.5); if (d.team === my) FX.banner('Your home is rubble', 'Start over at a backup safehouse. Its bounded field is back to level 1.'); else FX.banner('A house comes down', teamName(d.team).replace('’s team', '’s home') + ' is rubble.'); return; }
    if (kind === 'shadow') { FX.banner('A Shadow Walks the City', 'Something black moves through Fuyuki. It cannot be fought, only fled. It swallows the wounded.'); FX.snd('bell'); return; }
    if (kind === 'swallowed') { if (d.team === my) FX.banner('Swallowed by the Shadow', ''); else note(knownName(d.f) + ' was swallowed by the Shadow.', '#c0203a'); return; }
    if (kind === 'repelled') { note('A Noble Phantasm drives the Shadow back.'); return; }
    if (kind === 'festival') { FX.banner('The Shopping Street Festival', 'Crowds pack the arcade: fighting there is seen three times over. A stall is selling a strange relic; the first to claim it keeps it.'); return; }
    if (kind === 'relic') { if (d.team === my) FX.banner('The relic is yours', 'Your servant hits a little harder for the rest of the war.'); else note(teamName(d.team) + ' bought the relic.'); return; }
    base(kind, d, msg);
  };
})();
EV_COL.demo = '#f0a85a'; EV_COL.shadow = '#c0203a'; TASK_ICON.relic = 'Relic stall'; TASK_COL.relic = '#e8bf4a';
function drawEvents2Ground(g, vr, t) {
  var E = G && G.event;
  if (G.festival && isDay()) { var Fs = EVT2.festival; g.save(); for (var i = 0; i < 24; i++) { var lx = 3130 + i * 50, ly = 4640 + (i % 2) * 120; g.fillStyle = i % 3 ? '#e04a3a' : '#f0c060'; g.globalAlpha = 0.8 + 0.2 * Math.sin(t * 3 + i); g.beginPath(); g.arc(lx, ly, 8, 0, 6.283); g.fill(); } g.restore(); }
  if (!E || E.kind !== 'demo') return;
  var my = G.f[MEI].team;
  E.charges.forEach(function (c) {
    g.save(); g.translate(c.x, c.y);
    g.strokeStyle = c.planted ? '#ff5a3a' : 'rgba(240,168,90,.7)'; g.lineWidth = 3; g.setLineDash([8, 8]); g.beginPath(); g.arc(0, 0, c.r, 0, 6.283); g.stroke(); g.setLineDash([]);
    if (c.planted) { var bl = Math.sin(t * (E.fuse >= 0 ? 14 : 5)) > 0; g.fillStyle = '#4a4038'; g.fillRect(-14, -10, 28, 20); g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.strokeRect(-14, -10, 28, 20); g.fillStyle = bl ? '#ff3a2a' : '#5a1a14'; g.beginPath(); g.arc(8, -4, 4, 0, 6.283); g.fill(); }
    var p = c.planted ? c.dis / EVT2.demo.disarm : c.prog / EVT2.demo.plant;
    if (p > 0) { g.strokeStyle = c.planted ? '#7fc4ee' : '#f0a85a'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, c.r + 10, -1.571, -1.571 + 6.283 * p); g.stroke(); }
    g.restore();
  });
  if (E.fuse >= 0) { g.save(); g.font = '700 40px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ff5a3a'; g.fillText(Math.ceil(E.fuse), E.x, E.y - 200); g.restore(); }
}
// the Shadow: a black, shifting mass with a ragged edge
function drawShadow(g) {
  var E = G.event; if (!E || E.kind !== 'shadow') return; var t = G.time;
  g.save(); var sg = g.createRadialGradient(E.x, E.y, 10, E.x, E.y, 170); sg.addColorStop(0, 'rgba(0,0,0,.95)'); sg.addColorStop(0.5, 'rgba(20,0,12,.75)'); sg.addColorStop(1, 'rgba(60,0,20,0)'); g.fillStyle = sg; g.fillRect(E.x - 170, E.y - 170, 340, 340);
  g.fillStyle = '#050002'; g.beginPath(); for (var i = 0; i <= 24; i++) { var a = i / 24 * 6.283, r = 58 + 12 * Math.sin(t * 3 + i * 1.7) + 6 * Math.sin(t * 7 + i); if (i === 0) g.moveTo(E.x + Math.cos(a) * r, E.y + Math.sin(a) * r * 0.9); else g.lineTo(E.x + Math.cos(a) * r, E.y + Math.sin(a) * r * 0.9); } g.closePath(); g.fill();
  g.strokeStyle = '#c0203a'; g.lineWidth = 2; g.globalAlpha = 0.6 + 0.3 * Math.sin(t * 5); g.stroke();
  g.fillStyle = '#e0203a'; g.globalAlpha = 1; g.beginPath(); g.arc(E.x - 12, E.y - 8, 3, 0, 6.283); g.arc(E.x + 12, E.y - 8, 3, 0, 6.283); g.fill();
  g.restore();
}
function event2Hud(E) {
  if (E.kind === 'demo') { var n = E.charges.filter(function (c) { return c.planted; }).length; return 'DEMOLITION · ' + n + '/' + E.charges.length + ' charges' + (E.fuse >= 0 ? ' · FUSE ' + Math.ceil(E.fuse) : ' · ' + fmtT(E.dur - E.t)); }
  if (E.kind === 'shadow') return 'THE SHADOW WALKS · UNTIL DAWN';
  return null;
}
