function simStep(dt) {
  if (G.hitstop > 0) { G.hitstop -= dt; return; }
  G.time += dt; if (G.clock) clockTick(dt); if (G.fields) fieldsTick(dt); if (G.clock) eventsTick(dt); if (G.pacts) pactTick(dt); if (G.dimT > 0) G.dimT -= dt; if (G.marble) marbleTick(dt);
  G.f.forEach(function (f) { if (f.st !== 'dead' && (!f.foe || f.foe.st === 'dead' || G.f.length > 2)) pickTarget(f); });
  turnTick();
  for (var i = 0; i < G.f.length; i++) if (G.ai[i]) { if (G.ai[i].f.trueTeam !== undefined) aiTurned(G.ai[i], dt); else if (G.mode === 'war') aiWar(G.ai[i], dt); else aiTick(G.ai[i], dt); }
  for (var k = 0; k < G.f.length; k++) stepF(G.f[k], dt);
  stepProj(dt); stepZones(dt); separate();
}
