#!/usr/bin/env node
// Base spacing: where the homes are, and how close rival bases start in random wars.
// usage: node tools/basecheck.js [wars] [teams]
'use strict';
const { loadEngine } = require('../tests/engine.js');
const N = +process.argv[2] || 200, T = +process.argv[3] || 7;
const E = loadEngine(); const M = E.MAPS.city;
E.newWar(E.warTeams('richard', 'rin', 2), { nights: 3 });
const canon = Object.keys(M.homes).map((k) => [k, M.homes[k].x, M.homes[k].y]);
console.log('canon homes:', canon.map((c) => c[0] + '@' + c[1] + ',' + c[2]).join('  '));
console.log('plots:', M.plots.map((p) => p.join(',')).join('  '));
const all = canon.map((c) => ({ n: c[0], x: c[1], y: c[2] })).concat(M.plots.map((p, i) => ({ n: 'plot' + i, x: p[0], y: p[1] + 120 })));
const pairs = []; for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) pairs.push([all[i].n + '-' + all[j].n, Math.round(Math.hypot(all[i].x - all[j].x, all[i].y - all[j].y))]);
pairs.sort((a, b) => a[1] - b[1]); console.log('closest possible pairs:', pairs.slice(0, 8).map((p) => p[0] + ' ' + p[1]).join(' | '));
let minSum = 0, close = 0, worst = 1e9; const near = {};
for (let w = 0; w < N; w++) {
  const E2 = loadEngine(); const ids = E2.ORDER.slice().sort(() => Math.random() - 0.5), ms = E2.MASTER_ORDER.slice().sort(() => Math.random() - 0.5);
  const G = E2.newWar(ids.slice(0, T).map((s, i) => ({ servant: E2.SERV[s], master: E2.MASTERS[ms[i % ms.length]] })), { nights: 3 });
  const H = G.homes; let mn = 1e9;
  for (let i = 0; i < H.length; i++) for (let j = i + 1; j < H.length; j++) { const d = Math.hypot(H[i].x - H[j].x, H[i].y - H[j].y); if (d < mn) mn = d; if (d < 1600) { const k = [H[i].name, H[j].name].sort().join(' + '); near[k] = (near[k] || 0) + 1; } }
  minSum += mn; if (mn < 1600) close++; worst = Math.min(worst, mn);
}
console.log(`wars ${N}, ${T} teams: closest rival bases average ${Math.round(minSum / N)}, worst ${Math.round(worst)}; wars with two bases under 1600 apart: ${close}/${N}`);
console.log('most common close pairs:', Object.entries(near).sort((a, b) => b[1] - a[1]).slice(0, 6).map((e) => e[0] + ' x' + e[1]).join(' | '));
