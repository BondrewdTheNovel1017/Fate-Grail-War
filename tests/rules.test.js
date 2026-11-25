'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { loadEngine, run, aiWar } = require('./engine.js');

function pairWar(E, servA, mastA, servB, mastB) {
  const G = E.newWar([{ servant: E.SERV[servA], master: E.MASTERS[mastA] }, { servant: E.SERV[servB], master: E.MASTERS[mastB] }], { seed: 7 });
  return G;
}

test('roster: every servant and master has a full kit', () => {
  const E = loadEngine();
  for (const id of E.ORDER) { const d = E.SERV[id]; assert.ok(d && d.hp > 0 && d.A.light && d.A.heavy && d.A.skill && d.A.np, id); }
  for (const id of E.MASTER_ORDER) { const d = E.MASTERS[id]; assert.ok(d && d.isMaster && d.A.np && d.A.np.cd > 0, id); }
  for (const c of E.CLASSES) assert.ok(E.ORDER.some((id) => E.SERV[id].cls === c), 'a servant for ' + c);
});

test('full war: one team per class, each with its own master', () => {
  const E = loadEngine();
  const teams = E.warTeams('richard', 'rin', 7);
  assert.strictEqual(teams.length, 7);
  assert.strictEqual(new Set(teams.map((t) => t.servant.cls)).size, 7);
  assert.strictEqual(new Set(teams.map((t) => t.master.id)).size, 7);
});

test('Command Seals: three separate seals, each usable once', () => {
  const E = loadEngine();
  const G = pairWar(E, 'richard', 'rin', 'cu', 'kirei');
  const m = G.f[1], s = G.f[0];
  assert.strictEqual(E.sealsLeft(m), 3);
  s.hp = 100; assert.ok(E.useSeal(m, 'heal')); assert.ok(s.hp > 100, 'heal restores health');
  assert.ok(!E.useSeal(m, 'heal'), 'heal seal is single use');
  s.mom = 0; assert.ok(E.useSeal(m, 'np')); assert.strictEqual(s.mom, 100);
  s.x = m.x + 3000; assert.ok(E.useSeal(m, 'warp')); assert.ok(E.dist(s, m) < 100, 'recall brings the servant');
  assert.strictEqual(E.sealsLeft(m), 0);
});

test('master death: servant fades, Archers last longer', () => {
  const E = loadEngine();
  let G = pairWar(E, 'richard', 'rin', 'cu', 'kirei');
  E.kill(G.f[1]); assert.strictEqual(G.f[0].orphanT, 20);
  G = pairWar(E, 'atalanta', 'rin', 'cu', 'kirei');
  E.kill(G.f[1]); assert.strictEqual(G.f[0].orphanT, 120);
});

test('Origin Bullet burns a master\'s circuits', () => {
  const E = loadEngine();
  const G = pairWar(E, 'richard', 'kiritsugu', 'cu', 'kayneth');
  const kir = G.f[1], kay = G.f[3];
  E.hurt(kir, kay, kir.A.np, 1, kir);
  assert.ok(kay.silenceT > 9, 'silenced for 10 seconds');
});

test('reality marble pulls nearby fighters into a sealed arena and ends', () => {
  const E = loadEngine();
  const G = pairWar(E, 'emiya', 'rin', 'cu', 'kirei');
  const em = G.f[0], cu = G.f[2], far = G.f[3];
  cu.x = em.x + 300; cu.y = em.y; far.x = em.x + 3000;
  E.setMarble('ubw', em);
  assert.ok(em.inM && cu.inM, 'caster and nearby foe are inside');
  assert.ok(!far.inM, 'distant fighters stay in the city');
  assert.ok(!E.enemiesOf(far).includes(em), 'outsiders cannot target those inside');
  G.marble.t = G.marble.life + 1; run(E, 0.05);
  assert.ok(!G.marble && !em.inM && !cu.inM, 'everyone returns when it ends');
});

test('Enuma Elish shatters a reality marble', () => {
  const E = loadEngine();
  const G = pairWar(E, 'emiya', 'rin', 'gilgamesh', 'kirei');
  E.setMarble('ubw', G.f[0]); assert.ok(G.marble);
  E.breakMarble(G.f[2]); assert.ok(!G.marble);
});

test('Shirou learns Trace On at 40 and Unlimited Blade Works at 100', () => {
  const E = loadEngine();
  const G = pairWar(E, 'richard', 'shirou', 'cu', 'kirei');
  const sh = G.f[1];
  sh.mom = 45; run(E, 0.05); assert.strictEqual(sh.traceTier, 1); assert.strictEqual(sh.A.heavy.name, 'Kanshou & Bakuya');
  sh.mom = 100; run(E, 0.05); assert.strictEqual(sh.A.np.kind, 'ubw');
});

test('AI wars finish without errors', () => {
  const E = loadEngine();
  for (let n = 0; n < 2; n++) {
    const G = aiWar(E, E.warTeams(E.ORDER[n * 5], E.MASTER_ORDER[n], 4));
    run(E, 900);
    assert.ok(G.over, 'war ' + n + ' ended');
    for (const f of G.f) assert.ok(Number.isFinite(f.x) && Number.isFinite(f.hp), 'finite state');
  }
});
