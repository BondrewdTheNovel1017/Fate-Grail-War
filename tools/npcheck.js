// Noble Phantasm report: in servant duels (every pair, sides alternating), how often each servant's NP is started,
// how many are cancelled before they fire, and the damage each fired NP deals on average. usage: node tools/npcheck.js [runs per pair]
const { loadEngine } = require('../tests/engine.js');
const R = +(process.argv[2] || 4); const E0 = loadEngine(); const ids = E0.ORDER; const S = {};
ids.forEach((i) => { S[i] = { tr: 0, fi: 0, dmg: 0, win: 0, n: 0 }; });
for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) for (let r = 0; r < R; r++) {
  const E = loadEngine(); const [x, y] = r % 2 ? [ids[b], ids[a]] : [ids[a], ids[b]];
  const G = E.newGame(E.SERV_DUEL[x], E.SERV_DUEL[y], { map: 'arena' }); G.f.forEach((f, i) => { G.ai[i] = E.mkAI(f, E.DIFF.knight); });
  for (let i = 0; i < 60 * 150 && !G.over; i++) E.simStep(E.STEP);
  G.f.forEach((f) => { const s = S[f.def.id]; s.tr += f.stat.npTry || 0; s.fi += f.stat.npFire || 0; s.dmg += f.stat.npDmg || 0; s.n++; });
  const [A, B] = G.f; const w = B.st === 'dead' && A.st !== 'dead' ? A : A.st === 'dead' && B.st !== 'dead' ? B : (A.hp / A.def.hp >= B.hp / B.def.hp ? A : B); S[w.def.id].win++;
}
let T = { tr: 0, fi: 0, dmg: 0 };
console.log('servant     tries/duel  cancelled  dmg per fired NP  win%');
ids.forEach((i) => { const s = S[i]; T.tr += s.tr; T.fi += s.fi; T.dmg += s.dmg; console.log(i.padEnd(11), (s.tr / s.n).toFixed(2).padStart(9), ((s.tr ? 100 * (s.tr - s.fi) / s.tr : 0).toFixed(0) + '%').padStart(10), (s.fi ? s.dmg / s.fi : 0).toFixed(1).padStart(17), (100 * s.win / s.n).toFixed(0).padStart(5)); });
console.log('ALL'.padEnd(11), '', ((100 * (T.tr - T.fi) / T.tr).toFixed(0) + '% cancelled').padStart(20), (T.dmg / T.fi).toFixed(1).padStart(10), 'avg dmg per fired NP');
