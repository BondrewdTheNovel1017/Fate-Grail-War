#!/usr/bin/env node
// City map audit: buildings (solid blocks) on roads, blocks overlapping each other, trees on roads or in buildings,
// and doors whose outside point is inside a wall. Usage: node tools/mapcheck.js [--json]
'use strict';
const { engineSource } = require('./build.js');
const E = new Function(engineSource() + '\nreturn { MAPS: MAPS, setMap: setMap, get MAP() { return MAP; } };')();
E.setMap('city'); const M = E.MAP, W = M.cityW;
const out = { roadBlocks: [], overlaps: [], treesOnRoad: [], treesInBlocks: [], doorsInWalls: [] };
const rect = (b) => ({ x0: b.x - b.w / 2, y0: b.y - b.h / 2, x1: b.x + b.w / 2, y1: b.y + b.h / 2 });
const roadRect = (r) => r.h ? { x0: r.x0, y0: r.y0 - r.w / 2, x1: r.x1, y1: r.y0 + r.w / 2 } : { x0: r.x0 - r.w / 2, y0: r.y0, x1: r.x0 + r.w / 2, y1: r.y1 };
const ov = (a, b, pad) => Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > (pad || 0) && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > (pad || 0);
const area = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const solid = M.b.filter((b) => !b.walk && b.x < W);
const roads = M.roads.filter((r) => r.x0 < W && r.kind !== 'rail' && r.kind !== 'river');
solid.forEach((b) => { const R = rect(b); roads.forEach((r) => { const RR = roadRect(r); if (ov(R, RR, 4)) out.roadBlocks.push({ block: b.k + '@' + b.x + ',' + b.y + ' ' + b.w + 'x' + b.h, road: (r.name || r.kind) + ' ' + r.x0 + ',' + r.y0 + '-' + r.x1 + ',' + r.y1, overlap: Math.round(area(R, RR)) }); }); });
for (let i = 0; i < solid.length; i++) for (let j = i + 1; j < solid.length; j++) { const a = rect(solid[i]), b = rect(solid[j]); if (ov(a, b, 3)) out.overlaps.push(solid[i].k + '@' + solid[i].x + ',' + solid[i].y + ' x ' + solid[j].k + '@' + solid[j].x + ',' + solid[j].y); }
(M.o || []).filter((o) => o.x < W).forEach((o) => {
  const c = { x0: o.x - o.r, y0: o.y - o.r, x1: o.x + o.r, y1: o.y + o.r };
  roads.forEach((r) => { if (ov(c, roadRect(r), 6)) out.treesOnRoad.push((o.k || 'tree') + '@' + o.x + ',' + o.y + ' on ' + (r.name || r.kind)); });
  solid.forEach((b) => { if (ov(c, rect(b), 8)) out.treesInBlocks.push((o.k || 'tree') + '@' + o.x + ',' + o.y + ' in ' + b.k + '@' + b.x + ',' + b.y); });
});
(M.doors || []).forEach((d) => { const p = d.out; solid.forEach((b) => { const R = rect(b); if (p.x > R.x0 + 2 && p.x < R.x1 - 2 && p.y > R.y0 + 2 && p.y < R.y1 - 2) out.doorsInWalls.push(d.id + ' (' + d.room + ') outside point in ' + b.k + '@' + b.x + ',' + b.y); }); });
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
else Object.keys(out).forEach((k) => { console.log(k + ': ' + out[k].length); out[k].slice(0, 60).forEach((x) => console.log('  ' + (typeof x === 'string' ? x : JSON.stringify(x)))); });
