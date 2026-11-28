// NP use in AI wars: tries, cancels, fired, damage per fired, per war
const { loadEngine } = require('../tests/engine.js');
const N = +(process.argv[2] || 6); let tries = 0, fired = 0, dmg = 0, wars = 0, secs = 0;
for (let n = 0; n < N; n++) {
  const E = loadEngine(); const teams = E.warTeams(E.ORDER[n % E.ORDER.length], E.MASTER_ORDER[n % E.MASTER_ORDER.length], 7);
  const G = E.newWar(teams, { nights: 3 }); for (let i = 0; i < G.f.length; i++) G.ai[i] = E.mkAI(G.f[i], E.DIFF.knight);
  let t = 0; while (!G.over && t < 1500) { E.simStep(E.STEP); t += E.STEP; }
  G.f.forEach((f) => { if (!f.def.isMaster) { tries += f.stat.npTry || 0; fired += f.stat.npFire || 0; dmg += f.stat.npDmg || 0; } });
  wars++; secs += t;
}
console.log(JSON.stringify({ wars, minutes: +(secs / wars / 60).toFixed(1), npTriesPerWar: +(tries / wars).toFixed(1), firedPerWar: +(fired / wars).toFixed(1), cancelled: tries ? Math.round(100 * (1 - fired / tries)) + '%' : '-', dmgPerFired: fired ? +(dmg / fired).toFixed(1) : 0 }));
