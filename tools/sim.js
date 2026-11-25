#!/usr/bin/env node
// Balance report: runs many all-AI wars and summarises who wins, how fighters die and how the
// mana and contract systems are used. Usage: node tools/sim.js [wars=20] [teams=7]
'use strict';
const { loadEngine, run, aiWar } = require('../tests/engine.js');

const WARS = +(process.argv[2] || 20), TEAMS = +(process.argv[3] || 7), LIMIT = 1800;
const E = loadEngine();
const S = {}, M = {}, cause = { servant: {}, master: {} };
const tot = { ended: 0, len: [], contracts: 0, marbles: 0, nps: 0, noMana: 0, seals: { np: 0, heal: 0, warp: 0 } };
const row = (T, id) => T[id] || (T[id] = { games: 0, wins: 0, kills: 0, deaths: 0, alive: 0 });
let noMana = 0; const text0 = E.FX.text; E.FX.text = function (f, s) { if (s === 'NO MANA') noMana++; return text0.apply(this, arguments); };
const t0 = Date.now();
for (let n = 0; n < WARS; n++) {
  const my = E.ORDER[n % E.ORDER.length], mm = E.MASTER_ORDER[(n * 3) % E.MASTER_ORDER.length];
  const G = aiWar(E, E.warTeams(my, mm, TEAMS));
  const start = G.f.map((f) => ({ f, id: f.def.id }));
  let marble = null; noMana = 0;
  for (let i = 0; i < LIMIT * 60 && !G.over; i++) { E.simStep(E.STEP); if (G.marble && G.marble !== marble) { marble = G.marble; tot.marbles++; } }
  tot.noMana += noMana;
  if (G.over) { tot.ended++; tot.len.push(G.time); }
  tot.contracts += G.contracts || 0;
  const winTeam = G.winner ? G.winner.team : -1;
  for (const { f, id } of start) {
    const T = f.def.isMaster ? M : S, r = row(T, id);
    r.games++; tot.nps += f.def.isMaster ? 0 : f.stat.nps;
    if (f.team === winTeam && f.st !== 'dead') r.wins++;
    if (f.st === 'dead') { r.deaths++; const c = f.cause || 'other', C = cause[f.def.isMaster ? 'master' : 'servant']; C[c] = (C[c] || 0) + 1; if (f.killer) row(f.killer.def.isMaster ? M : S, f.killer.def.id).kills++; } else r.alive++;
    if (f.def.isMaster) for (const k in f.sealUsed) if (f.sealUsed[k]) tot.seals[k]++;
  }
}
const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
const avg = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
function table(title, T) {
  console.log('\n' + title);
  console.log('  ' + 'name'.padEnd(12) + 'games'.padStart(6) + 'win%'.padStart(7) + 'kills/g'.padStart(9) + 'death%'.padStart(8));
  Object.keys(T).sort((a, b) => T[b].wins / T[b].games - T[a].wins / T[a].games).forEach((id) => { const r = T[id]; console.log('  ' + id.padEnd(12) + String(r.games).padStart(6) + pct(r.wins, r.games).padStart(7) + (r.kills / r.games).toFixed(2).padStart(9) + pct(r.deaths, r.games).padStart(8)); });
}
console.log(`Balance report: ${WARS} wars of ${TEAMS} teams (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
console.log(`  finished ${tot.ended}/${WARS}, length avg ${(avg(tot.len) / 60).toFixed(1)} min (min ${(Math.min(...tot.len) / 60).toFixed(1)}, max ${(Math.max(...tot.len) / 60).toFixed(1)})`);
console.log(`  per war: ${(tot.nps / WARS).toFixed(1)} NPs, ${(tot.noMana / WARS).toFixed(1)} blocked for mana, ${(tot.contracts / WARS).toFixed(2)} contracts, ${(tot.marbles / WARS).toFixed(2)} marbles`);
console.log(`  seals used per war: NP ${(tot.seals.np / WARS).toFixed(1)}, heal ${(tot.seals.heal / WARS).toFixed(1)}, recall ${(tot.seals.warp / WARS).toFixed(1)}`);
console.log('  servant deaths: ' + JSON.stringify(cause.servant) + '   master deaths: ' + JSON.stringify(cause.master));
table('Servants', S); table('Masters', M);
