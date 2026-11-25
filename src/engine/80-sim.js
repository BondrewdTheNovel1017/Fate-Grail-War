function simStep(dt) {
  if (G.hitstop > 0) { G.hitstop -= dt; return; }
  G.time += dt; if (G.clock) clockTick(dt); if (G.dimT > 0) G.dimT -= dt; if (G.marble) { G.marble.t += dt; if (G.mode === 'war' && (G.marble.t > G.marble.life || G.marble.owner.st === 'dead')) endMarble(null, false); }
  G.f.forEach(function (f) { if (f.st !== 'dead' && (!f.foe || f.foe.st === 'dead' || G.f.length > 2)) pickTarget(f); });
  for (var i = 0; i < G.f.length; i++) if (G.ai[i]) { if (G.mode === 'war') aiWar(G.ai[i], dt); else aiTick(G.ai[i], dt); }
  for (var k = 0; k < G.f.length; k++) stepF(G.f[k], dt);
  stepProj(dt); stepZones(dt); separate();
}
