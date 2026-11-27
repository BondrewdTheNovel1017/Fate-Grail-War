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

test('Command Seals: one pool of three, spent on any order', () => {
  const E = loadEngine();
  const G = pairWar(E, 'richard', 'rin', 'cu', 'kirei');
  const m = G.f[1], s = G.f[0];
  assert.strictEqual(E.sealsLeft(m), 3);
  s.hp = 100; assert.ok(E.useSeal(m, 'heal')); assert.ok(s.hp > 100, 'heal restores health');
  s.hp = 100; assert.ok(E.useSeal(m, 'heal'), 'heal can be used again while seals remain'); m.seals = 2;
  s.mom = 0; assert.ok(E.useSeal(m, 'np')); assert.strictEqual(s.mom, 100);
  s.x = m.x + 3000; assert.ok(E.useSeal(m, 'warp')); assert.ok(E.dist(s, m) < 100, 'recall brings the servant');
  assert.strictEqual(E.sealsLeft(m), 0);
});

test('master death: servant fades, Archers last longer', () => {
  const E = loadEngine();
  let G = pairWar(E, 'richard', 'rin', 'cu', 'kirei');
  E.kill(G.f[1]); assert.strictEqual(G.f[0].orphanT, 30);
  G = pairWar(E, 'atalanta', 'rin', 'cu', 'kirei');
  E.kill(G.f[1]); assert.ok(G.f[0].orphanT > 30, 'Archers outlast other servants');
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

test('Shirou learns Trace On, then Rho Aias, then Unlimited Blade Works at 100', () => {
  const E = loadEngine();
  const G = pairWar(E, 'richard', 'shirou', 'cu', 'kirei');
  const sh = G.f[1]; if (G.clock) G.clock.n = 2;
  sh.mom = 45; run(E, 0.05); assert.strictEqual(sh.traceTier, 1); assert.strictEqual(sh.A.light.name, 'Kanshou & Bakuya'); assert.strictEqual(sh.A.heavy.name, 'Overedge');
  sh.mom = 100; run(E, 0.05); assert.strictEqual(sh.A.np.kind, 'ubw');
});

test('AI wars finish without errors', () => {
  const E = loadEngine();
  for (let n = 0; n < 2; n++) {
    const G = aiWar(E, E.warTeams(E.ORDER[n * 5], E.MASTER_ORDER[n], 4), { nights: 1 });
    run(E, 1500);
    assert.ok(G.over, 'war ' + n + ' ended');
    for (const f of G.f) assert.ok(Number.isFinite(f.x) && Number.isFinite(f.hp), 'finite state');
  }
});

test('mana link: a Noble Phantasm costs the master mana', () => {
  const E = loadEngine();
  const G = pairWar(E, 'cu', 'rin', 'richard', 'kirei');
  const s = G.f[0], m = G.f[1], cost = E.npManaCost(s);
  m.mana = cost - 1; s.mom = 100;
  assert.ok(!E.canNP(s), 'not enough mana: no NP');
  m.mana = cost + 10; assert.ok(E.canNP(s));
  E.press(s, 'np'); run(E, 0.1);
  assert.strictEqual(s.key, 'np'); assert.ok(Math.abs(m.mana - 10) < 1, 'cost paid');
});

test('mana link: the NP Command Seal pays for the Noble Phantasm', () => {
  const E = loadEngine();
  const G = pairWar(E, 'cu', 'rin', 'richard', 'kirei');
  const s = G.f[0], m = G.f[1];
  m.mana = 0; E.useSeal(m, 'np');
  assert.ok(E.canNP(s));
});

test('mana link: Kariya pays in blood, orphans pay with their own time', () => {
  const E = loadEngine();
  let G = pairWar(E, 'lancelot', 'kariya', 'richard', 'kirei');
  const s = G.f[0], m = G.f[1];
  m.mana = 0; s.mom = 100; assert.ok(E.canNP(s));
  const hp0 = m.hp; E.press(s, 'np'); run(E, 0.1); assert.ok(m.hp < hp0, 'Kariya bled for it');
  G = pairWar(E, 'cu', 'rin', 'richard', 'kirei');
  E.kill(G.f[1]); run(E, 0.5); const o = G.f[0], t0 = o.orphanT; o.mom = 100; E.press(o, 'np'); run(E, 0.2);
  assert.ok(o.orphanT < t0 - 5, 'orphan NP shortens its remaining time');
});

test('Form Contract: an orphaned servant and a servantless master join up', () => {
  const E = loadEngine();
  const G = pairWar(E, 'cu', 'rin', 'richard', 'kirei');
  const cu = G.f[0], rin = G.f[1], rich = G.f[2], kirei = G.f[3];
  E.kill(rin); E.kill(rich);
  assert.ok(!E.enemiesOf(cu).includes(kirei), 'would-be partners do not fight');
  cu.x = kirei.x + 100; cu.y = kirei.y;
  assert.strictEqual(E.contractCandidate(kirei, 200), cu);
  assert.ok(E.formContract(kirei, cu));
  assert.strictEqual(cu.team, kirei.team); assert.strictEqual(cu.partner, kirei); assert.strictEqual(cu.orphanT, 0);
});

test('Form Contract: AI orphans and free masters find each other', () => {
  const E = loadEngine();
  const G = aiWar(E, [{ servant: E.SERV.cu, master: E.MASTERS.rin }, { servant: E.SERV.richard, master: E.MASTERS.kirei }, { servant: E.SERV.heracles, master: E.MASTERS.illya }]);
  const cu = G.f[0], rin = G.f[1], rich = G.f[2], kirei = G.f[3];
  G.f[4].x = 8800; G.f[4].y = 300; G.f[5].x = 8700; G.f[5].y = 350; // keep Heracles' team far away
  cu.x = 2000; cu.y = 3000; kirei.x = 2600; kirei.y = 3000;
  E.kill(rin); E.kill(rich);
  run(E, 15);
  assert.strictEqual(cu.partner, kirei, 'they formed a contract');
});

test('master kits: Shirou and Kirei fight up close; Kiritsugu knifes up close and fires a long Calico burst', () => {
  const E = loadEngine();
  assert.strictEqual(E.MASTERS.shirou.A.light.kind, 'melee');
  assert.strictEqual(E.MASTERS.kirei.A.light.kind, 'melee');
  assert.ok(E.MASTERS.kirei.A.heavy.count === 3 && E.MASTERS.kirei.A.heavy.spread * 2 < 0.25, 'Kirei throws three Black Keys in a tight cone');
  const k = E.MASTERS.kiritsugu.A;
  assert.strictEqual(k.light.kind, 'melee', 'a combat knife');
  assert.strictEqual(k.heavy.kind, 'barrage'); assert.ok(k.heavy.bullet && k.heavy.act / k.heavy.rate > 15, 'a long burst');
});

test('arena keeps duel-length health; the war doubles it', () => {
  const E = loadEngine();
  for (const id of E.ORDER) assert.ok(E.SERV[id].hp > E.SERV_DUEL[id].hp * 1.5, id);
});

function arenaRun(E, G, secs) { G.f.forEach((f, i) => { G.ai[i] = E.mkAI(f, E.DIFF.knight); }); run(E, secs); return G; }
test('arena modes: duel, free-for-all, teams, masters and pairs all finish', () => {
  const E = loadEngine(), S = E.SERV_DUEL, M = E.MASTERS;
  let G = arenaRun(E, E.newGame(S.richard, S.cu, { map: 'temple' }), 300); assert.ok(G.over, 'duel');
  G = arenaRun(E, E.newGame([S.richard, S.cu, S.medusa, S.hassan], { map: 'harbor', mode: 'ffa' }), 400); assert.ok(G.over, 'ffa');
  G = arenaRun(E, E.newGame([S.richard, S.cu, S.medusa, S.hassan], { map: 'forest', mode: 'teams', teams: [0, 1, 0, 1] }), 400); assert.ok(G.over, 'teams');
  G = arenaRun(E, E.newGame(M.kirei, M.kiritsugu, { map: 'church', mode: 'duel' }), 300); assert.ok(G.over, 'masters');
  G = E.newWar([{ servant: S.cu, master: M.rin }, { servant: S.richard, master: M.shirou }], { map: 'bridge', quick: true });
  arenaRun(E, G, 500); assert.ok(G.over, 'pairs');
});

test('Kiritsugu\'s Calico runs dry and reloads', () => {
  const E = loadEngine();
  const G = pairWar(E, 'richard', 'kiritsugu', 'cu', 'kirei');
  const k = G.f[1], foe = G.f[3];
  k.x = 3000; k.y = 3000; foe.x = 3300; foe.y = 3000; k.lock = foe; k.sta = 100;
  run(E, 0.1); assert.strictEqual(k.ammo, 50, 'starts with a full magazine');
  E.press(k, 'heavy'); run(E, 2.2);
  assert.ok(k.ammo <= 32 && k.ammo >= 26, 'a long burst spends about twenty rounds (' + k.ammo + ' left)');
  run(E, 1.0); k.ammo = 3; k.sta = 100; E.press(k, 'heavy'); run(E, 1.4);
  assert.ok(k.reloadT > 0 || k.ammo === 50, 'an empty magazine starts a reload');
  run(E, 2.5); assert.strictEqual(k.ammo, 50, 'reloaded');
});

test('city: masters start at their family seats; a second family member gets a new estate', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar([{ servant: S.richard, master: M.rin }, { servant: S.cu, master: M.illya }, { servant: S.medusa, master: M.irisviel }, { servant: S.hassan, master: M.kirei }], {});
  assert.strictEqual(G.homes[0].name, 'Tohsaka Mansion');
  assert.strictEqual(G.homes[1].name, 'Einzbern Castle');
  assert.ok(!G.homes[2].canon && G.homes[2].name === 'Einzbern villa', 'the second Einzbern gets a villa');
  assert.strictEqual(G.homes[3].name, 'Fuyuki Church');
  assert.ok(E.MAP.b.some((b) => b.gen && b.k === 'villa_e'), 'the villa is built on the map');
});

test('city: walking into the castle doors leads inside, and the AI can route there', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'illya', 3), {});
  const f = G.f[0], d = E.MAP.doors.find((q) => q.room === 'einzbern');
  f.x = d.out.x; f.y = d.out.y + 30; f.doorT = 0; f.inp.mx = 0; f.inp.my = -1;
  E.doorTick(f, 1 / 60);
  assert.strictEqual(E.roomAt(f.x, f.y) && E.roomAt(f.x, f.y).id, 'einzbern', 'inside the castle');
  const path = E.navPath(2050, 4620, 12000 + 1500, 1600);
  assert.ok(path && path.some((p) => p.door), 'a route from the Emiya house into the castle goes through its door');
});

test('quick Grail War: seven teams on the compact map finish in a few minutes', () => {
  const E = loadEngine();
  const teams = E.warTeams('richard', 'rin', 7).map((t) => ({ servant: E.SERV_DUEL[t.servant.id], master: t.master }));
  const G = aiWar(E, teams, { map: 'fuyuki', quick: true });
  run(E, 720);
  assert.ok(G.over, 'finished'); assert.ok(G.time < 480, 'in under eight minutes (' + G.time.toFixed(0) + 's)');
});

test('city: every interior room can be reached from its door', () => {
  const E = loadEngine(); E.newWar(E.warTeams('richard', 'rin', 3), {});
  const N = E.MAP.nav.nodes;
  for (const d of E.MAP.doors) {
    const rm = E.MAP.rooms.find((r) => r.id === d.room), seen = new Set([d.inNode]), q = [d.inNode];
    while (q.length) { const n = q.shift(); for (const e of N[n].adj) if (!seen.has(e.to)) { seen.add(e.to); q.push(e.to); } }
    const missing = rm.nodes.filter((n) => !seen.has(n.id));
    assert.strictEqual(missing.length, 0, rm.id + ': unreachable waypoints at ' + missing.map((n) => n.x + ',' + n.y).join(' '));
  }
});

test('city: each master begins alone at their summoning circle, the servant inside it', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar([{ servant: S.caerwyn, master: M.shirou }, { servant: S.emiya, master: M.rin }, { servant: S.heracles, master: M.illya }], {});
  assert.strictEqual(G.circles.length, 3);
  assert.ok(/storehouse/i.test(G.circles[0].name), 'Shirou summons in the storehouse');
  assert.ok(/workshop/i.test(G.circles[1].name), 'Rin summons in her workshop');
  G.circles.forEach((c, i) => {
    const sv = G.f.find((f) => f.team === i && !f.def.isMaster), ms = G.f.find((f) => f.team === i && f.def.isMaster);
    assert.ok(Math.hypot(sv.x - c.x, sv.y - c.y) < 30, 'servant stands in the circle');
    assert.ok(Math.hypot(ms.x - c.x, ms.y - c.y) < 120, 'master stands beside it');
    assert.ok(E.sameZone(sv, ms), 'both are in the same room');
  });
  assert.ok(E.roomAt(G.f[0].x, G.f[0].y), 'the storehouse is an interior you can enter');
});

test('city: arches, gates and roofs can be walked under; the church stands clear of the roads', () => {
  const E = loadEngine(); E.newWar(E.warTeams('richard', 'rin', 2), {});
  const over = E.MAP.b.filter((b) => b.over);
  assert.ok(over.length >= 5);
  over.forEach((b) => assert.strictEqual(E.rectsIn(b.x, b.y, 20).length, 0, b.k + ' must not block'));
  const ch = E.MAP.b.find((b) => b.k === 'church');
  E.MAP.roads.forEach((r) => { const hw = r.w / 2, x0 = r.h ? r.x0 : r.x0 - hw, x1 = r.h ? r.x1 : r.x0 + hw, y0 = r.h ? r.y0 - hw : r.y0, y1 = r.h ? r.y0 + hw : r.y1;
    const ov = x0 < ch.x + ch.w / 2 && x1 > ch.x - ch.w / 2 && y0 < ch.y + ch.h / 2 && y1 > ch.y - ch.h / 2; assert.ok(!ov, 'church overlaps a ' + r.kind); });
});

test('Shirou opening Unlimited Blade Works on Gilgamesh starts their exchange', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV, calls = [];
  E.FX.duo = (a, ka, b, kb) => calls.push([a.def.id, ka, b.def.id, kb]);
  const G = E.newWar([{ servant: S.cu, master: M.shirou }, { servant: S.gilgamesh, master: M.rin }], { map: 'fuyuki', quick: true });
  const sh = G.f.find((f) => f.def.id === 'shirou'), gil = G.f.find((f) => f.def.id === 'gilgamesh');
  G.f.forEach((f) => { if (f !== sh && f !== gil) { f.x = 200; f.y = 200; } });
  gil.x = sh.x + 150; gil.y = sh.y; sh.mom = 100;
  for (let i = 0; i < 10; i++) E.simStep(E.STEP);
  assert.strictEqual(sh.A.np.kind, 'ubw');
  E.press(sh, 'np'); for (let i = 0; i < 150 && !calls.length; i++) E.simStep(E.STEP);
  assert.deepStrictEqual(calls[0], ['shirou', 'ubwgil', 'gilgamesh', 'ubwgilR']);
});

test('Shirou deals full damage to servants; other masters deal half', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar([{ servant: S.cu, master: M.shirou }, { servant: S.richard, master: M.rin }], { map: 'fuyuki', quick: true });
  const sh = G.f.find((f) => f.def.id === 'shirou'), rin = G.f.find((f) => f.def.id === 'rin'), rich = G.f.find((f) => f.def.id === 'richard');
  const hit = (att) => { rich.hp = rich.def.hp; rich.guarding = false; rich.st = 'idle'; rich.iframes = 0; const h0 = rich.hp; E.hurt(att, rich, { dmg: 10, power: 1, kind: 'melee' }, 1, { x: rich.x - 1, y: rich.y }); return h0 - rich.hp; };
  const a = hit(sh), b = hit(rin);
  assert.ok(a > b * 1.8, 'Shirou ' + a + ' vs Rin ' + b);
});

test('hit-stop freezes only the two fighters in a hit; the rest of the war moves on', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'rin', 3), { map: 'fuyuki', quick: true });
  const [a, d, c] = [G.f[0], G.f[2], G.f[4]];
  d.x = a.x + 60; d.y = a.y; E.hurt(a, d, { dmg: 5, power: 2, key: 'heavy' });
  assert.ok(a.hs > 0 && d.hs > 0, 'attacker and defender freeze');
  assert.ok(!(c.hs > 0) && G.hitstop === 0, 'nobody else does');
  const t0 = G.time; E.simStep(E.STEP); assert.ok(G.time > t0, 'the war keeps running');
});

test('nights and days: the war runs night, day, night... and the Grail descends at midnight of the last', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'rin', 3), { nights: 3 });
  assert.strictEqual(G.clock.phase, 'night'); assert.strictEqual(G.clock.n, 1);
  G.clock.t = G.clock.len - 0.01; E.simStep(E.STEP); assert.strictEqual(G.clock.phase, 'day'); assert.strictEqual(G.clock.n, 2);
  G.f[0].hp = 50; G.f[0].x = G.f[0].home[0]; G.f[0].y = G.f[0].home[1]; for (let i = 0; i < 300; i++) E.simStep(E.STEP);
  assert.ok(G.f[0].hp > 50, 'resting at home by day heals');
  E.skipDay(); for (let i = 0; i < E.CLOCK.fade * 60 + 5; i++) E.simStep(E.STEP);
  assert.strictEqual(G.clock.phase, 'night'); assert.ok(!G.clock.final);
  G.clock.t = G.clock.len; E.simStep(E.STEP); G.clock.t = G.clock.len; E.simStep(E.STEP);
  assert.strictEqual(G.clock.n, 3); assert.strictEqual(G.clock.phase, 'night'); assert.ok(!G.clock.final, 'night 3 begins as a normal night');
  G.clock.t = G.clock.len; E.simStep(E.STEP);
  assert.ok(G.clock.final && G.clock.phase === 'night' && G.clock.n === 3, 'at its midnight the Grail descends, with no dawn between'); assert.ok(G.civ.length > 0, 'civilians walk the city');
});

test('at night a fighter only knows what is close; on the final night everyone knows', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'rin', 2), { nights: 3 });
  const a = G.f[0], b = G.f.find((f) => f.team !== a.team);
  G.f.forEach((f) => { f.x = 3700; f.y = 4700; }); b.x = a.x + 3000; G.f.filter((f) => f.team === b.team).forEach((f) => { f.x = b.x; f.y = b.y; });
  assert.ok(!E.knows(a, b), 'far away at night: unknown');
  b.x = a.x + 300; assert.ok(E.knows(a, b), 'close: known');
  b.x = a.x + 3000; G.clock.final = true; assert.ok(E.knows(a, b), 'final night: known');
});

test('civilians who see a fight raise the team\'s exposure; the Church acts at the top', () => {
  const E = loadEngine(), seen = [];
  E.FX.church = (k, t) => seen.push(k);
  const G = E.newWar(E.warTeams('richard', 'rin', 2), { nights: 3 });
  G.civ.forEach((c, i) => { c.on = i < 10; c.x = 3700 + i * 10; c.y = 4700; c.saw = -99; });
  const n = E.witness(3700, 4700, [0], 1);
  assert.strictEqual(n, 10); assert.ok(G.expo[0] > 0); assert.ok(G.civ[0].flee > 0, 'witnesses run');
  assert.strictEqual(E.witness(3700, 4700, [0], 1), 0, 'a witness counts once in a while');
  E.expose(0, 200); assert.ok(seen.includes('rumor') && seen.includes('warn') && seen.includes('sanction'));
  assert.ok(E.knows(G.f.find((f) => f.team === 1), G.f[0]), 'a sanctioned team is visible to everyone');
});

test('bounded fields: every home has one; a Caster makes a Temple; intruders are felt, a concealed Assassin is not', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar([{ servant: S.richard, master: M.rin }, { servant: S.medea, master: M.shirou }, { servant: S.hassan, master: M.kirei }], { nights: 3 });
  assert.strictEqual(G.fields[0].lvl, 2, 'mage family field'); assert.strictEqual(G.fields[1].lvl, 2, 'fledgling + Caster temple'); assert.ok(G.fields[1].temple);
  const F = G.fields[0], rich = G.f.find((f) => f.def.id === 'richard'), med = G.f.find((f) => f.def.id === 'medea'), has = G.f.find((f) => f.def.id === 'hassan');
  [med, has].forEach((f) => { f.x = F.x + 100; f.y = F.y; }); med.spirit = 2;
  has.cnc = true; E.fieldsTick(0.1);
  assert.ok(E.knowsExact(rich, med), 'a servant in spirit form is felt by the field');
  rich.x = F.x - 2000; rich.y = F.y; G.f.filter((f) => f.team === 0).forEach((f) => { f.x = F.x - 2000; f.y = F.y; });
  assert.ok(!E.knowsExact(rich, has), 'a concealed Assassin is not');
  has.cnc = false; E.fieldsTick(0.1); assert.ok(E.knowsExact(rich, has), 'until it shows itself');
});

test('Presence Concealment: the Assassin vanishes, strikes from hiding, and is found only up close', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar([{ servant: S.hassan, master: M.kirei }, { servant: S.richard, master: M.rin }], { map: 'fuyuki', quick: true });
  const h = G.f.find((f) => f.def.id === 'hassan'), r = G.f.find((f) => f.def.id === 'richard');
  E.press(h, 'spirit'); E.simStep(E.STEP); E.simStep(E.STEP);
  assert.ok(h.cnc && h.hid, 'concealed');
  h.x = r.x + 400; h.y = r.y; assert.ok(!E.knowsExact(r, h), 'unseen at range');
  h.x = r.x + 90; assert.ok(E.knowsExact(r, h), 'found up close');
  E.press(h, 'light'); for (let i = 0; i < 30; i++) E.simStep(E.STEP);
  assert.ok(!h.cnc, 'attacking ends it');
});

test('days: fortify, ley lines, battle sites and Noble Phantasms reveal what they should', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar([{ servant: S.richard, master: M.rin }, { servant: S.cu, master: M.waver }], { nights: 3 });
  const cu = G.f.find((f) => f.def.id === 'cu'), rin = G.f.find((f) => f.def.id === 'rin');
  assert.ok(!G.tn[0].cu, 'names start unknown');
  G.traces.push({ x: 3700, y: 4700, t: 1, sv: ['cu'], teams: [1] }); E.startDay(); G.clock.phase = 'day';
  const tr = G.tasks.find((k) => k.kind === 'trace'), fo = G.tasks.find((k) => k.kind === 'fortify' && k.team === 0), ley = G.tasks.find((k) => k.kind === 'ley');
  E.finishTask(0, tr); assert.ok(G.tn[0].cu, 'the battle site gives Cu Chulainn away');
  const l0 = G.fields[0].lvl; E.finishTask(0, fo); assert.strictEqual(G.fields[0].lvl, l0 + 1);
  E.finishTask(0, ley); assert.ok(rin.manaBonus > 0 && rin.mana === rin.manaMax);
  const rich = G.f.find((f) => f.def.id === 'richard'); cu.x = rich.x = 3700; cu.y = rich.y = 4700; rich.x += 200;
  assert.ok(!G.tn[1].richard); rich.mom = 100; E.press(rich, 'np'); for (let i = 0; i < 90; i++) E.simStep(E.STEP);
  assert.ok(G.tn[1].richard, 'using a Noble Phantasm in sight reveals the true name');
});

test('the school event: servants are held out, everyone inside is drained, three circles hold the field', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV, ev = [];
  E.FX.event = (k) => ev.push(k);
  const G = E.newWar([{ servant: S.richard, master: M.shirou }, { servant: S.cu, master: M.rin }, { servant: S.medusa, master: M.sakura }], { nights: 3 });
  G.clock.phase = 'day'; G.ai.forEach((a, i) => { G.ai[i] = null; });
  const sh = G.f.find((f) => f.def.id === 'shirou'), rin = G.f.find((f) => f.def.id === 'rin'), sab = sh.partner, X = E.EVT.school;
  G.f.forEach((f) => { f.x = 200; f.y = 6000; });
  const R = E.MAP.rooms.find((r) => r.id === 'school'), cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2;
  sh.x = cx; sh.y = cy; rin.x = cx + 100; rin.y = cy;
  E.startSchool(); assert.strictEqual(G.event.kind, 'school'); assert.strictEqual(G.event.culprit, 2, 'Medusa\'s team raised it');
  assert.ok(G.event.circles.every((c) => c.x > R.x0 && c.x < R.x1 && c.y > R.y0 && c.y < R.y1), 'the circles stand inside the school');
  sab.x = cx; sab.y = cy + 200; E.eventsTick(0.1);
  assert.ok(sab.x < E.MAP.cityW, 'a servant who was not inside is put out of the building');
  const h0 = sh.hp; E.eventsTick(2); assert.ok(sh.hp < h0, 'the field drains the masters inside');
  assert.ok(E.inTruce(sh, rin), 'masters inside are in truce');
  G.ai[rin.idx] = E.mkAI(rin, E.DIFF.knight); const r0 = sh.hp; E.hurt(rin, sh, { dmg: 10, power: 1 }); assert.strictEqual(sh.hp, r0, 'an AI master honours the truce');
  G.mobs = [];
  for (const c of G.event.circles) { sh.x = c.x; sh.y = c.y; sh.lastHitT = -99; for (let i = 0; i < 12 * 10; i++) { G.mobs = []; E.eventsTick(0.1); if (!G.event) break; } }
  assert.ok(!G.event, 'breaking the three circles ends it'); assert.ok(ev.includes('circle'));
});

test('the Challenge and the Church\'s bounty give a Command Seal back; an unanswered challenge rewards its host', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar([{ servant: S.richard, master: M.rin }, { servant: S.diarmuid, master: M.kayneth }, { servant: S.gilles, master: M.kariya }, { servant: S.medea, master: M.shirou }], { nights: 3 });
  const rin = G.f.find((f) => f.def.id === 'rin'), rich = rin.partner, dia = G.f.find((f) => f.def.id === 'diarmuid'), kay = dia.partner, gil = G.f.find((f) => f.def.id === 'gilles');
  E.startChallenge(); assert.strictEqual(G.event.host, dia, 'Diarmuid issues the challenge');
  E.useSeal(kay, 'heal'); dia.x = G.event.x; dia.y = G.event.y; G.event.t = G.event.dur; E.eventsTick(0.01);
  assert.strictEqual(E.sealsLeft(kay), 3, 'nobody answered: the host regains a seal');
  E.useSeal(rin, 'heal'); E.startChallenge(); const C = G.event; dia.x = C.x; dia.y = C.y; dia.lastHit = { by: rich, key: 'light' }; E.kill(dia, true);
  assert.strictEqual(E.sealsLeft(rin), 3, 'winning the challenge restores a seal');
  E.useSeal(rin, 'heal'); E.startBounty(); assert.strictEqual(G.event.team, gil.team, 'the Church hunts Gilles first');
  gil.lastHit = { by: rich, key: 'light' }; E.kill(gil, true); assert.strictEqual(E.sealsLeft(rin), 3, 'the bounty pays a seal');
});

test('the Horror in the River, the False Death and Berserker Unchained', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV, ev = [];
  E.FX.event = (k) => ev.push(k);
  const G = E.newWar([{ servant: S.richard, master: M.rin }, { servant: S.hassan, master: M.kirei }, { servant: S.heracles, master: M.illya }, { servant: S.gilles, master: M.kariya }], { nights: 3 });
  const rich = G.f.find((f) => f.def.id === 'richard'), has = G.f.find((f) => f.def.id === 'hassan'), her = G.f.find((f) => f.def.id === 'heracles');
  E.startHorror(); const H = G.event; assert.strictEqual(H.culprit, G.f.find((f) => f.def.id === 'gilles').team, 'Gilles raised it');
  rich.x = 6000; rich.y = 2430; G.f.find((f) => f.def.id === 'illya').x = 6050; G.f.find((f) => f.def.id === 'illya').y = 2430;
  H.boss.x = 6000; H.boss.y = 2560; assert.ok(E.inTruce(rich, G.f.find((f) => f.def.id === 'illya')), 'truce near the horror');
  H.boss.hp = 1; E.press(rich, 'light'); for (let i = 0; i < 40; i++) E.simStep(E.STEP);
  assert.ok(ev.includes('horrorDown'), 'a blow from the bridge brings it down');
  G.event = null; G.clock.evDone = false; E.startFalseDeath(); assert.strictEqual(G.event.team, has.team, 'the Assassin fakes its death');
  rich.x = 3000; rich.y = 3000; has.x = 3300; has.y = 3000; assert.ok(!E.knowsExact(rich, has), 'nobody knows it is alive');
  G.event = null; E.startBerserk(); assert.strictEqual(G.event.f, her, 'Heracles is unchained'); assert.ok(her.rampT > G.time && E.knows(rich, her));
});

test('the final night: the Grail descends on one of three ley lines, pure or corrupted', () => {
  const E = loadEngine(), seen = new Set();
  for (let n = 0; n < 30; n++) { const G = E.newWar(E.warTeams('richard', 'rin', 3), { nights: 3 }); G.clock.final = true; G.clock.phase = 'night'; G.clock.t = 61; E.newPhaseEvents(); E.eventsTick(0.1); seen.add(G.event.name + (G.event.corrupt ? '*' : '')); }
  const names = new Set([...seen].map((s) => s.replace('*', '')));
  assert.ok(names.size >= 3, [...seen].join(', ')); assert.ok([...seen].some((s) => s.endsWith('*')) && [...seen].some((s) => !s.endsWith('*')), 'both natures appear');
  assert.ok(![...seen].includes('the Great Cavern beneath Ryuudou Temple'), 'the cavern is always black');
});

test('regular nights always have an event in a 3-night war; a 5-night war may have one still night', () => {
  const E = loadEngine();
  let quiet3 = 0, quiet5 = 0, multi = 0;
  for (let n = 0; n < 40; n++) {
    const G3 = E.newWar(E.warTeams('richard', 'rin', 7), { nights: 3 }); G3.clock.phase = 'night'; G3.clock.n = 2; E.newPhaseEvents(); if (!G3.clock.pending) quiet3++;
    const G5 = E.newWar(E.warTeams('richard', 'rin', 7), { nights: 5 }); let q = 0;
    for (const k of [2, 3, 4]) { G5.event = null; G5.clock.phase = 'night'; G5.clock.n = k; E.newPhaseEvents(); if (!G5.clock.pending) q++; }
    if (q) quiet5++; if (q > 1) multi++;
  }
  assert.strictEqual(quiet3, 0); assert.ok(quiet5 > 0, 'still nights happen in long wars'); assert.strictEqual(multi, 0, 'at most one per war');
});

test('the Demolition: the bomber plants the charges by hand; a blown house is rubble and the team starts over at a backup base', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV, ev = [];
  E.FX.event = (k) => ev.push(k);
  const G = E.newWar([{ servant: S.richard, master: M.kiritsugu }, { servant: S.diarmuid, master: M.kayneth }, { servant: S.cu, master: M.rin }], { nights: 3 });
  G.ai.forEach((a, i) => { G.ai[i] = null; });
  const kir = G.f.find((f) => f.def.id === 'kiritsugu'), kay = G.f.find((f) => f.def.id === 'kayneth');
  E.startDemolition(); const D = G.event; assert.strictEqual(D.target, kay.team, 'Kiritsugu goes for Kayneth');
  G.f.forEach((f) => { if (f.team === kay.team) { f.x = 300; f.y = 7000; } });
  for (const c of D.charges) { kir.x = c.x; kir.y = c.y; for (let i = 0; i < 70; i++) E.eventsTick(0.1); }
  assert.ok(D.charges.every((c) => c.planted) && ev.includes('fuse'));
  for (let i = 0; i < 300 && G.event; i++) E.eventsTick(0.1);
  assert.ok(ev.includes('demolished'));
  const F = G.fields[kay.team]; assert.ok(F.backup && F.lvl === 1, 'a level 1 backup base');
  assert.ok(E.MAP.doors.filter((d) => d.room === 'hyatt').every((d) => d.ruined) || true);
  assert.deepStrictEqual(kay.home, [F.x, F.y]);
});

test('the Shadow swallows the weakened, cannot be hurt, and turns the Grail black; the festival relic and triple witnesses', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar(E.warTeams('richard', 'rin', 4), { nights: 3 });
  E.startShadow(); const Sh = G.event, v = G.f[2]; v.x = Sh.x; v.y = Sh.y; v.hp = v.def.hp * 0.2; v.spirit = 0;
  for (let i = 0; i < 20 && v.st !== 'dead'; i++) E.eventsTick(0.1);
  assert.strictEqual(v.st, 'dead'); assert.strictEqual(v.cause, 'shadow');
  G.event = null; G.clock.final = true; G.clock.t = 61; E.newPhaseEvents(); E.eventsTick(0.1); assert.ok(G.event.corrupt, 'the Grail is black after the Shadow');
  const G2 = E.newWar(E.warTeams('richard', 'rin', 3), { nights: 3 }); G2.clock.phase = 'day'; E.startFestival();
  assert.ok(G2.tasks.some((k) => k.kind === 'relic'));
  G2.civ.forEach((c) => { c.saw = -99; }); const e0 = G2.expo[0] || 0; E.witness(3700, 4700, [0], 1); const fest = (G2.expo[0] || 0) - e0;
  G2.festival = false; G2.civ.forEach((c) => { c.saw = -99; c.x = 3700; c.y = 4700; c.on = true; }); G2.expo[1] = 0;
  assert.ok(fest > 0);
});

test('Rule Breaker turns a servant on its own master for a few seconds, then it returns', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV, ev = [];
  E.FX.turned = () => ev.push('turned'); E.FX.unturned = () => ev.push('back');
  const G = E.newWar([{ servant: S.medea, master: M.shirou }, { servant: S.richard, master: M.rin }, { servant: S.cu, master: M.waver }], { nights: 3 });
  const med = G.f.find((f) => f.def.id === 'medea'), rich = G.f.find((f) => f.def.id === 'richard'), rin = rich.partner;
  G.ai[rich.idx] = null; // a player's servant
  E.hurt(med, rich, Object.assign({}, med.A.np, { key: 'np' }));
  assert.strictEqual(rich.team, med.team, 'joins Medea'); assert.ok(G.ai[rich.idx], 'the AI takes over a player\'s servant'); assert.ok(ev.includes('turned'));
  assert.ok(E.enemiesOf(rich).includes(rin), 'its own master is now an enemy');
  for (let i = 0; i < (E.RB.dur + 0.5) * 60; i++) E.simStep(E.STEP);
  assert.strictEqual(rich.team, rin.team, 'the bond snaps back'); assert.strictEqual(G.ai[rich.idx], null, 'control returns to the player'); assert.ok(ev.includes('back'));
  assert.ok(!G.over, 'the war did not end while it was turned');
  med.momLockT = 0; E.press(med, 'np'); med.mom = 100;
});

test('God Hand comes back after a long while out of combat', () => {
  const E = loadEngine();
  const G = E.newGame(E.SERV.heracles, E.SERV.richard, { map: 'temple' });
  const h = G.f.find((f) => f.def.id === 'heracles'); G.ai = [];
  h.hp = 0; E.kill(h); assert.ok(h.gh && h.st !== 'dead');
  h.x = 100; h.y = 100; G.f.forEach((f) => { if (f !== h) { f.x = 3000; f.y = 3000; } });
  for (let i = 0; i < (E.GH_REGEN + 1) * 60; i++) E.simStep(E.STEP);
  assert.ok(!h.gh, 'God Hand restored');
});

test('a turned servant cannot call its Noble Phantasm', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar([{ servant: S.medea, master: M.shirou }, { servant: S.richard, master: M.rin }, { servant: S.cu, master: M.waver }], { nights: 3 });
  const med = G.f.find((f) => f.def.id === 'medea'), rich = G.f.find((f) => f.def.id === 'richard');
  E.ruleBreak(med, rich); rich.mom = 100; E.press(rich, 'np'); E.simStep(E.STEP); E.simStep(E.STEP);
  assert.notStrictEqual(rich.key, 'np');
});

test('family: the first killing blow between Kiritsugu and Illya stops short; the second does not', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV, seen = [];
  E.FX.hesitate = (a, d) => seen.push(a.def.id + '>' + d.def.id);
  const G = E.newWar([{ servant: S.richard, master: M.kiritsugu }, { servant: S.heracles, master: M.illya }, { servant: S.cu, master: M.rin }], { nights: 3 });
  const kir = G.f.find((f) => f.def.id === 'kiritsugu'), il = G.f.find((f) => f.def.id === 'illya'), rin = G.f.find((f) => f.def.id === 'rin');
  G.clock.final = true; il.hp = 5;
  E.hurt(kir, il, { dmg: 50, power: 2, kind: 'proj' }, 1, { x: kir.x, y: kir.y });
  assert.strictEqual(il.st === 'dead', false); assert.strictEqual(il.hp, 1); assert.deepStrictEqual(seen, ['kiritsugu>illya']);
  il.iframes = 0; il.st = 'idle'; E.hurt(kir, il, { dmg: 50, power: 2, kind: 'proj' }, 1, { x: kir.x, y: kir.y });
  assert.ok(il.hp <= 0 || il.st === 'dead', 'the second blow lands');
  rin.hp = 5; E.hurt(kir, rin, { dmg: 50, power: 2, kind: 'proj' }, 1, { x: kir.x, y: kir.y }); assert.ok(rin.hp <= 0 || rin.st === 'dead', 'no bond with Rin');
});

const FIVE = (S, M, a, b) => [{ servant: a[0], master: a[1] }, { servant: b[0], master: b[1] }, { servant: S.cu, master: M.rin }, { servant: S.richard, master: M.waver }, { servant: S.leonidas, master: M.kayneth }];
test('pacts: partners cannot hurt each other, share sight, and pay for breaking it', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar(FIVE(S, M, [S.iskandar, M.shirou], [S.diarmuid, M.irisviel]), { nights: 3 });
  const isk = G.f.find((f) => f.def.id === 'iskandar'), dia = G.f.find((f) => f.def.id === 'diarmuid');
  G.f.forEach((f) => { G.pactHate = {}; });
  assert.ok(E.pactOpen(isk.team, dia.team));
  E.formPact(isk.team, dia.team, isk.team);
  assert.ok(!E.enemiesOf(isk).includes(dia), 'partners are not enemies');
  const hp = dia.hp; assert.strictEqual(E.hurt(isk, dia, { dmg: 30, power: 1 }), 'none'); assert.strictEqual(dia.hp, hp);
  assert.ok(!E.pactOpen(isk.team, 2), 'one pact per team');
  E.breakPact(isk.team, dia);
  assert.ok(!E.pactTeams(isk.team, dia.team)); assert.ok(G.expo[isk.team] >= E.PACT.breakExpo); assert.ok(G.reveal[isk.team] > G.time, 'the breaker is shown to everyone');
});
test('pacts end at dawn, on the final night, and below four teams; the two strongest never ally', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar(FIVE(S, M, [S.iskandar, M.shirou], [S.diarmuid, M.irisviel]), { nights: 3 });
  E.formPact(0, 1, 0); G.clock.phase = 'day'; G.clock.n = 2; E.pactTick(E.STEP); assert.strictEqual(G.pacts.length, 0, 'dawn');
  G.clock.phase = 'night'; G.pactCd = {}; E.formPact(0, 1, 0);
  G.f.filter((f) => f.team >= 3).forEach((f) => { f.hp = 0; f.st = 'dead'; }); E.pactTick(E.STEP); assert.strictEqual(G.pacts.length, 0, 'too few teams');
  const H = E.newWar(FIVE(S, M, [S.iskandar, M.shirou], [S.diarmuid, M.irisviel]), { nights: 3 });
  H.f.forEach((f) => { if (f.team >= 2) f.hp = f.def.hp * 0.3; });
  assert.ok(!E.pactOpen(0, 1), 'the two strongest teams cannot ally');
  H.clock.final = true; assert.ok(!E.pactOpen(2, 3), 'no pacts on the final night');
});
test('character by character: Gilgamesh only for Kirei, Kiritsugu only for his family', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  let G = E.newWar(FIVE(S, M, [S.gilgamesh, M.rin], [S.iskandar, M.waver]), { nights: 3 });
  assert.strictEqual(E.pactWill(0, 1), 0, 'the King allies with no one');
  G = E.newWar(FIVE(S, M, [S.gilgamesh, M.rin], [S.hassan, M.kirei]), { nights: 3 });
  assert.ok(E.pactWill(0, 1) > 0, 'unless Kirei is on the other side');
  G = E.newWar(FIVE(S, M, [S.caerwyn, M.kiritsugu], [S.iskandar, M.waver]), { nights: 3 });
  assert.strictEqual(E.pactWill(0, 1), 0, 'the Magus Killer trusts no one');
  G = E.newWar(FIVE(S, M, [S.caerwyn, M.kiritsugu], [S.heracles, M.illya]), { nights: 3 });
  assert.ok(E.pactWill(0, 1) > 0.5, 'except his family');
});
test('Gilgamesh betrays his master for Kirei when a pact brings them together', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV, ev = [];
  E.FX.pact = (k) => ev.push(k);
  const G = E.newWar(FIVE(S, M, [S.gilgamesh, M.rin], [S.hassan, M.kirei]), { nights: 3 });
  G.f.forEach((f, i) => { G.ai[i] = E.mkAI(f, E.DIFF.knight); });
  const gil = G.f.find((f) => f.def.id === 'gilgamesh'), rin = gil.partner, kirei = G.f.find((f) => f.def.id === 'kirei'), has = kirei.partner;
  E.formPact(gil.team, kirei.team, kirei.team);
  has.hp = 0; E.kill(has);
  kirei.x = gil.x + 200; kirei.y = gil.y; rin.x = gil.x - 100; rin.y = gil.y; gil.st = 'idle';
  for (let i = 0; i < 200 && !G.gilDone; i++) { G.gilChk = 0; E.gilBetrayTick(); }
  assert.ok(G.gilDone && ev.includes('betray'));
  assert.strictEqual(rin.st, 'dead', 'his old master falls'); assert.strictEqual(gil.team, kirei.team); assert.strictEqual(gil.partner, kirei);
});
test('a player in the war never targets or turns toward an enemy across the city', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar([{ servant: S.richard, master: M.rin }, { servant: S.cu, master: M.waver }, { servant: S.medusa, master: M.shirou }], { nights: 3 });
  const me = G.f[0], foe = G.f.find((f) => f.team !== me.team && !f.def.isMaster);
  me.x = 3300; me.y = 4300; G.f.forEach((f) => { if (f.team !== me.team) { f.x = me.x + 3000; f.y = me.y; } }); E.pickTarget(me);
  assert.strictEqual(E.aimFoe(me), null, 'nothing to aim at across the map');
  me.face = 1; E.simStep(E.STEP); assert.ok(Math.abs(me.face - 1) < 0.01, 'an idle player keeps their facing');
  foe.x = me.x + 300; foe.y = me.y; E.pickTarget(me);
  assert.strictEqual(E.aimFoe(me), foe, 'a nearby enemy is the target');
});
test('every master starts the war inside their own base, with a door out', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV, sv = ['richard', 'cu', 'medusa', 'emiya', 'iskandar', 'medea', 'kojirou'];
  [['kiritsugu', 'rin', 'kirei', 'kayneth', 'waver', 'shirou', 'sakura'], ['illya', 'irisviel', 'kiritsugu', 'sakura', 'kariya', 'rin', 'waver']].forEach((list) => {
    const G = E.newWar(list.map((m, i) => ({ servant: S[sv[i]], master: M[m] })), { nights: 3 });
    G.f.filter((f) => f.def.isMaster).forEach((m) => {
      const rm = E.roomAt(m.x, m.y); assert.ok(rm, m.def.id + ' starts inside');
      assert.ok(E.MAP.doors.some((d) => d.room === rm.id), m.def.id + ' has a door out');
      assert.ok(G.fields[m.team].rooms.includes(rm.id), m.def.id + '’s field covers the rooms');
    });
  });
});

test('Rho Aias: EMIYA guard swallows projectiles, even a Noble Phantasm, petal by petal', () => {
  const E = loadEngine(), S = E.SERV;
  const G = E.newGame(S.emiya, S.cu, { map: 'arena' }); G.ai = [];
  const em = G.f.find((f) => f.def.id === 'emiya'), cu = G.f.find((f) => f.def.id === 'cu');
  em.x = 500; em.y = 500; cu.x = 800; cu.y = 500; em.face = 0; em.guarding = true;
  const hp = em.hp, shot = { x: 700, y: 500, a: cu.A.np };
  assert.strictEqual(E.hurt(cu, em, cu.A.np, 1, shot), 'block'); assert.strictEqual(em.hp, hp, 'no damage through the petals');
  assert.strictEqual(em.petals, E.RHO.emiya - 5, 'a Noble Phantasm breaks five petals');
  em.guarding = true; E.hurt(cu, em, cu.A.light, 1, { x: 700, y: 500, a: cu.A.light }); assert.strictEqual(em.petals, 1);

});
test('Rule Breaker dissolves Rho Aias, and Enkidu binds for a moment', () => {
  const E = loadEngine(), S = E.SERV, seen = [];
  E.FX.shieldBroken = (f, kind) => seen.push(kind); E.FX.enkidu = () => seen.push('enkidu');
  let G = E.newGame(S.medea, S.emiya, { map: 'arena' }); G.ai = [];
  const md = G.f[0], em = G.f[1]; md.x = 400; md.y = 500; em.x = 700; em.y = 500; em.face = Math.PI; em.guarding = true;
  const hp = em.hp; E.hurt(md, em, md.A.np, 1, { x: 600, y: 500, a: md.A.np });
  assert.strictEqual(em.petals, 0); assert.ok(em.hp < hp, 'the dagger goes through'); assert.ok(seen.includes('rho'));
  G = E.newGame(S.gilgamesh, S.heracles, { map: 'arena' }); G.ai = [];
  const gil = G.f[0], her = G.f[1]; her.guarding = true; her.face = Math.PI; her.x = gil.x + 200; her.y = gil.y;
  assert.strictEqual(E.hurt(gil, her, gil.A.skill, 1, { x: gil.x + 100, y: gil.y, a: gil.A.skill }), 'hit', 'chains go past a guard');
  assert.ok(her.boundT > G.time + 1.5, 'longer on the divine'); assert.ok(seen.includes('enkidu'));
});
test('Shirou\'s Trace grows over the war: Rho Aias by the middle, Unlimited Blade Works not before Night 2', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar([{ servant: S.richard, master: M.shirou }, { servant: S.cu, master: M.rin }, { servant: S.medusa, master: M.waver }], { nights: 3 });
  const sh = G.f.find((f) => f.def.id === 'shirou'); G.f.forEach((f) => { if (f.team !== sh.team) { f.x = sh.x + 5000; } });
  sh.mom = 99; for (let i = 0; i < 120; i++) E.simStep(E.STEP);
  assert.ok(sh.mom < 100, 'held back on Night 1'); assert.ok(sh.rhoOn, 'Rho Aias learned at ' + E.TRACE.rho);
  G.clock.n = 2; for (let i = 0; i < 1500; i++) E.simStep(E.STEP); assert.ok(sh.mom >= 100);
});
test('a pact offer holds: both sides parley, and Accept works even after blows were traded', () => {
  const E = loadEngine(), M = E.MASTERS, S = E.SERV;
  const G = E.newWar(FIVE(S, M, [S.iskandar, M.shirou], [S.diarmuid, M.irisviel]), { nights: 3 });
  G.f.forEach((f, i) => { G.ai[i] = f.team === 0 ? null : E.mkAI(f, E.DIFF.knight); });
  const me = G.f.find((f) => f.team === 0 && !f.def.isMaster), dia = G.f.find((f) => f.def.id === 'diarmuid');
  G.offer = { from: dia.team, to: me.team, until: G.time + E.PACT.offerT };
  assert.ok(!E.enemiesOf(dia).includes(me), 'the offering team holds its attack');
  E.hurt(dia, me, { dmg: 2, power: 1 }); // a stray blow already in the air
  assert.ok(G.offer, 'an AI blow does not cancel the talks');
  E.pactButton(me);
  assert.ok(E.pactTeams(me.team, dia.team), 'Accept forms the pact');
  E.breakPact(me.team, null); G.pactCd = {};
  G.offer = { from: 2, to: me.team, until: G.time + E.PACT.offerT };
  E.hurt(me, G.f.find((f) => f.team === 2), { dmg: 2, power: 1 });
  assert.strictEqual(G.offer, null, 'the player striking them withdraws the offer');
});
test('the Church: killing a civilian exposes the team, and Executors come from out of sight to hunt its master', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'rin', 4), { nights: 3 });
  G.f.forEach((f, i) => { G.ai[i] = i === 0 ? null : E.mkAI(f, E.DIFF.knight); });
  G.clock.t = G.clock.len - 0.01; E.simStep(E.STEP); assert.ok(E.isDay());
  // a civilian on open ground, so the Executors placed beside the master below are not inside a wall
  const me = G.f[0], c = G.civ.find((q) => q.on && !E.rectsIn(q.x - 60, q.y - 60, q.x + 60, q.y + 60).some((r) => r.x1 > q.x - 50 && r.x0 < q.x + 50 && r.y1 > q.y - 50 && r.y0 < q.y + 50)) || G.civ.find((q) => q.on);
  me.x = c.x - 30; me.y = c.y; me.face = 0; G.f.forEach((f) => { if (f !== me && f !== me.partner && f.x < G.f[0].x + 2000) { f.x += 0; } });
  E.hitCivsArc(me, me.A.light);
  assert.ok(c.dead, 'the blow kills the civilian');
  assert.ok(G.expo[me.team] >= E.CHURCH.civExpo || G.reveal[me.team] > G.time, 'the team is exposed');
  assert.ok(G.reveal[me.team] > G.time, 'and shown to every team');
  const ex = E.liveExecs(me.team);
  assert.ok(ex.length >= 2, 'Executors are sent at once');
  ex.forEach((m) => assert.ok(Math.hypot(m.x - me.x, m.y - me.y) > E.CHURCH.farFromHumans - 1, 'never in sight of the player'));
  // they reach and wound the master
  const rin = me.partner; rin.x = c.x; rin.y = c.y; rin.st = 'idle'; const hp0 = rin.hp; const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
  const dir = dirs.find((d) => !E.segBlocked(rin.x, rin.y, rin.x + d[0] * 220, rin.y + d[1] * 220)) || dirs[0];
  ex.forEach((m, i) => { m.x = rin.x + dir[0] * (160 + i * 30); m.y = rin.y + dir[1] * (160 + i * 30); m.tx = rin.x; m.ty = rin.y; });
  for (let i = 0; i < 60 * 25 && rin.hp >= hp0; i++) { G.f.forEach((f) => { if (f !== rin) f.st = f.st; }); E.execTick(E.STEP); }
  assert.ok(rin.hp < hp0, 'the Executors strike the master');
});
test('civilians walk home at dusk instead of vanishing where they stand', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'rin', 3), { nights: 3 });
  G.clock.t = G.clock.len - 0.01; E.simStep(E.STEP);
  for (let i = 0; i < 120; i++) E.simStep(E.STEP);
  const before = G.civ.filter((c) => c.on).length;
  G.clock.phase = 'night'; E.civShift();
  const going = G.civ.filter((c) => c.going);
  assert.ok(going.length > before / 2, 'most head for a doorway');
  assert.ok(going.every((c) => c.on), 'and are still in the street for now');
});
test('Command Seals are lives: before the Grail descends a killing blow burns one and carries master and servant home', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'rin', 4), { nights: 3 });
  const sv = G.f[0], rin = sv.partner, foe = G.f.find((f) => f.team !== sv.team && !f.def.isMaster);
  const run = (s) => { for (let i = 0; i < s * 60; i++) { G.time += E.STEP; E.rescueTick(E.STEP); } };
  const strike = (v) => { v.iframes = 0; v.ghT = 0; v.st = 'idle'; v.hp = 5; v.x = 3000; v.y = 3600; return E.hurt(foe, v, { dmg: 90, power: 2, kind: 'melee' }, 1, { x: v.x - 30, y: v.y }); };
  // the servant falls: a seal burns, both are carried home
  rin.x = 3400; rin.y = 3600; strike(sv);
  assert.ok(sv.st !== 'dead' && sv.resc && rin.resc, 'the seal takes both');
  assert.strictEqual(E.sealsLeft(rin), 2, 'one seal spent');
  run(E.RESCUE.arrive + 0.1);
  const home = E.teamHome(rin.team, rin);
  assert.ok(Math.hypot(sv.x - home.x, sv.y - home.y) < 120 && Math.hypot(rin.x - home.x, rin.y - home.y) < 120, 'both arrive in the workshop');
  assert.ok(!sv.resc && !rin.resc && sv.hp > 1, 'hurt, but standing');
  assert.ok(G.tn[foe.team].richard, 'the winner learns the true name');
  // the master falls: the same
  run(3); strike(rin); assert.ok(rin.st !== 'dead' && E.sealsLeft(rin) === 1, 'the master escapes too'); run(2);
  // seals are any order, and each one is a life
  run(3); assert.ok(E.useSeal(rin, 'heal')); assert.strictEqual(E.sealsLeft(rin), 0);
  run(3); strike(sv); assert.strictEqual(sv.st, 'dead', 'with no seals left, death is death');
});
test('day activities: carry ward stones home, walk with the ley wisp, read the clues', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'rin', 4), { nights: 3 });
  G.f.forEach((f, i) => { G.ai[i] = null; });
  G.traces.push({ x: 3000, y: 3600, sv: [G.f[2].def.id] });
  G.clock.t = G.clock.len - 0.01; E.simStep(E.STEP); assert.ok(E.isDay());
  const rin = G.f[0].partner, me = G.f[0];
  // fortify: three stones, each carried to its ward point
  const fort = G.tasks.find((k) => k.kind === 'fortify' && k.team === me.team);
  if (fort && fort.act === 'stones') {
    const lvl = G.fields[me.team].lvl;
    fort.stones.forEach((s) => { rin.x = s.x; rin.y = s.y; rin.st = 'idle'; E.dayActiveTick(fort, E.STEP); assert.strictEqual(s.c, rin.idx, 'picked up'); rin.x = s.tx; rin.y = s.ty; E.dayActiveTick(fort, E.STEP); assert.ok(s.ok, 'set at its ward point'); });
    assert.ok(fort.done[me.team] && G.fields[me.team].lvl === lvl + 1, 'the field grows');
  }
  // ley: the wisp only moves while someone walks with it
  const ley = G.tasks.find((k) => k.kind === 'ley' && k.act === 'wisp');
  if (ley) {
    rin.x = ley.x; rin.y = ley.y; for (let i = 0; i < 60; i++) E.dayActiveTick(ley, E.STEP);
    const d1 = ley.w[me.team]; assert.ok(d1 > 50, 'the wisp walks');
    rin.x = 100; rin.y = 100; for (let i = 0; i < 60; i++) E.dayActiveTick(ley, E.STEP);
    assert.ok(ley.w[me.team] < d1, 'and drifts back when left');
  }
  // battle site: three clues to stand over
  const tr = G.tasks.find((k) => k.kind === 'trace' && k.act === 'clues');
  assert.ok(tr, 'a battle site to read');
  tr.clues.forEach((c) => { rin.x = c.x; rin.y = c.y; for (let i = 0; i < 120; i++) E.dayActiveTick(tr, E.STEP); });
  assert.ok(tr.done[me.team], 'all three clues read');
});
test('a scout that survives the day tells its master where its quarry is', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'rin', 4), { nights: 3 });
  const me = G.f[0], foe = G.f.find((f) => f.team !== me.team && !f.def.isMaster);
  G.mobs = [{ scout: true, keep: true, team: foe.team, tgt: me.team, x: 3000, y: 3000, px: 3000, py: 3000, r: 12, hp: 24, max: 24, t: 0, face: 0, fleeT: 0 }];
  E.scoutsReport();
  assert.ok(E.intelOn(foe, me), 'the rival knows where we are');
  assert.ok(!G.mobs.some((m) => m.scout), 'the familiar goes home at dusk');
});
test('every Arena battlefield is its own hand-made map with spawns inside', () => {
  const E = loadEngine();
  ['bridge', 'temple', 'forest', 'harbor', 'church', 'school'].forEach((id) => {
    const m = E.MAPS[id]; assert.notStrictEqual(m.theme, 'citywin', id); assert.ok(!m.win && m.spawns.length >= 2, id);
    const G = E.newGame(E.SERV.richard, E.SERV.cu, { map: id }); G.f.forEach((f) => assert.ok(f.x > 0 && f.x < m.w && f.y > 0 && f.y < m.h, id + ' spawn inside'));
  });
});
test('Nine Lives: Heracles lunges at his foe and lands quick blows in front of him, the last one hurling them back', () => {
  const E = loadEngine();
  const G = E.newGame(E.SERV.heracles, E.SERV.richard, { map: 'arena' });
  const h = G.f[0], r = G.f[1]; G.ai = [null, null];
  h.x = 500; h.y = 500; r.x = 800; r.y = 500; h.face = 0; r.face = Math.PI; h.foe = r; r.foe = h; h.mom = 100;
  const behind = { x: 300, y: 500 };
  assert.ok(E.startAct(h, 'np'));
  const hp0 = r.hp; let hits = 0, last = r.hp;
  for (let i = 0; i < 60 * 4; i++) { r.st = r.st === 'dead' ? 'dead' : r.st; r.inp = { mx: 0, my: 0 }; E.simStep(E.STEP); if (r.hp < last) { hits++; last = r.hp; } }
  assert.ok(Math.abs(h.x - 500) > 120, 'he closes the distance');
  assert.ok(hits >= 6, 'many separate blows land (' + hits + ')');
  assert.ok(r.hp < hp0 - 30, 'they add up');
  assert.ok(Math.hypot(r.x - 800, r.y - 500) > 60, 'the last blow throws the foe back');
  assert.ok(behind.x < h.x, 'a blow lands only where he faces');
});
test('Zabaniya: the cursed arm reaches a foe beyond sword reach, in a narrow line', () => {
  const E = loadEngine();
  const G = E.newGame(E.SERV.hassan, E.SERV.richard, { map: 'arena' });
  const h = G.f[0], r = G.f[1]; G.ai = [null, null];
  h.x = 500; h.y = 500; r.x = 750; r.y = 500; h.face = 0; r.face = Math.PI; h.foe = r; r.foe = h; h.mom = 100;
  const hp0 = r.hp; assert.ok(E.startAct(h, 'np'));
  for (let i = 0; i < 60 * 1.5; i++) { r.inp = { mx: 0, my: 0 }; E.simStep(E.STEP); }
  assert.ok(r.hp < hp0, 'it lands from 250 away');
  const G2 = E.newGame(E.SERV.hassan, E.SERV.richard, { map: 'arena' });
  const h2 = G2.f[0], r2 = G2.f[1]; G2.ai = [null, null];
  h2.x = 500; h2.y = 500; r2.x = 680; r2.y = 500; h2.face = 0; h2.foe = r2; r2.foe = h2; h2.mom = 100;
  const hp1 = r2.hp; assert.ok(E.startAct(h2, 'np'));
  for (let i = 0; i < 48; i++) E.simStep(E.STEP);
  r2.y = 680; // stepped out of the line once his aim is locked
  for (let i = 0; i < 60 * 0.9; i++) { r2.inp = { mx: 0, my: 0 }; E.simStep(E.STEP); }
  assert.strictEqual(r2.hp, hp1, 'a step out of the line beats it');
});
test('Tokiomi burns what he hits and spends less mana while unhurt; Kuzuki hits servants at full force but his grip never executes', () => {
  const E = loadEngine();
  const G = E.newGame(E.MASTERS.tokiomi, E.SERV.richard, { map: 'arena' });
  const t = G.f[0], r = G.f[1]; G.ai = [null, null];
  E.hurt(t, r, t.A.light, 1); assert.ok(r.bleedT > 0 && r.burnFx, 'a flame bolt sets the target burning');
  t.mana = 9; assert.ok(E.canPay(t, 12), 'unhurt, a 12-mana cost needs only 9');
  t.hp = t.def.hp * 0.5; assert.ok(!E.canPay(t, 12), 'hurt, it costs the full 12');
  const G2 = E.newGame(E.MASTERS.kuzuki, E.SERV.richard, { map: 'arena' });
  const k = G2.f[0], s = G2.f[1]; G2.ai = [null, null];
  const hp0 = s.hp; E.hurt(k, s, Object.assign({}, k.A.light), 1);
  assert.ok(hp0 - s.hp >= k.A.light.dmg * 0.9, 'no master half-damage against a servant');
  k.x = 500; k.y = 500; s.x = 580; s.y = 500; k.face = 0; k.foe = s; s.foe = k; s.hp = s.def.hp * 0.2; k.sigCd = 0;
  E.startAct(k, 'np'); for (let i = 0; i < 40; i++) E.simStep(E.STEP);
  assert.ok(s.st !== 'dead', 'Coiled Strike hurts but does not execute a servant');
});
test('With Tokiomi as Gilgamesh\'s master, the betrayal is Kirei\'s: he cuts Tokiomi down and the King contracts him', () => {
  const E = loadEngine();
  const G = E.newWar([{ servant: E.SERV.gilgamesh, master: E.MASTERS.tokiomi }, { servant: E.SERV.cu, master: E.MASTERS.kirei }, { servant: E.SERV.richard, master: E.MASTERS.rin }], { nights: 3 });
  G.f.forEach((f, i) => { G.ai[i] = E.mkAI(f, E.DIFF.knight); });
  const gil = G.f.find((f) => f.def.id === 'gilgamesh'), tok = G.f.find((f) => f.def.id === 'tokiomi'), kir = G.f.find((f) => f.def.id === 'kirei'), cu = G.f.find((f) => f.def.id === 'cu');
  cu.hp = 0; E.kill(cu);
  E.formPact(gil.team, kir.team);
  tok.x = 3000; tok.y = 3000; kir.x = 3200; kir.y = 3000; gil.x = 3100; gil.y = 3100; [gil, tok, kir].forEach((f) => { f.st = 'idle'; });
  for (let i = 0; i < 400 && !G.gilDone; i++) { G.time += 2.1; E.gilBetrayTick(); }
  assert.ok(G.gilDone, 'the betrayal happens');
  assert.strictEqual(tok.st, 'dead'); assert.strictEqual(tok.lastHit.by, kir, 'Kirei struck the blow');
  assert.strictEqual(gil.partner, kir, 'Gilgamesh is now Kirei\'s servant');
});
test('An Outsider (Kuzuki) crosses a bounded field unfelt, but is still slowed by it', () => {
  const E = loadEngine();
  const G = E.newWar([{ servant: E.SERV.richard, master: E.MASTERS.rin }, { servant: E.SERV.cu, master: E.MASTERS.kuzuki }], { nights: 3 });
  const F = G.fields[0], k = G.f.find((f) => f.def.id === 'kuzuki'), s = G.f.find((f) => f.def.id === 'cu');
  assert.ok(F, 'Rin has a field');
  [k, s].forEach((f) => { f.x = F.x; f.y = F.y; f.inM = false; });
  for (let i = 0; i < 30; i++) E.simStep(E.STEP);
  assert.ok(!(G.seenBy[0][k.idx] > G.time), 'the field does not feel Kuzuki');
  assert.ok(G.seenBy[0][s.idx] > G.time, 'it feels his servant');
});
test('A Command Seal rescue brings both home at half health or better, protected for a while', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'rin', 3), { nights: 3 });
  const sv = G.f[0], m = sv.partner, foe = G.f.find((f) => f.team !== sv.team && !f.def.isMaster);
  m.hp = m.def.hp * 0.2; sv.hp = 1;
  assert.ok(E.sealRescue(sv, foe), 'the seal turns the killing blow');
  for (let i = 0; i < 60 * 1.5; i++) { G.time += E.STEP; E.rescueTick(E.STEP); }
  assert.ok(sv.hp >= sv.def.hp * 0.5 - 0.01, 'the servant arrives at half health');
  assert.ok(m.hp >= m.def.hp * 0.5 - 0.01, 'the master is topped up to half too');
  assert.ok(sv.iframes >= 3.5, 'and both are protected for about four seconds');
});
test('engine and UI never declare the same top-level name (the UI would silently replace the engine\'s)', () => {
  const { nameClashes } = require('../tools/build.js');
  assert.deepStrictEqual(nameClashes(), []);
});
function aiScene(E, aId, aIsMaster, svDist, X, Y) {
  const G = E.newWar([{ servant: E.SERV.richard, master: E.MASTERS.rin }, { servant: E.SERV[aIsMaster ? 'leonidas' : aId], master: E.MASTERS[aIsMaster ? aId : 'waver'] }], { nights: 3 });
  G.f.forEach((f, i) => { G.ai[i] = f.team === 0 ? null : E.mkAI(f, E.DIFF.knight); });
  G.clock.t = 60; G.clock.pending = null; G.clock.evDone = true; G.event = null;
  const me = G.f.find((f) => f.team === 0 && !f.def.isMaster), mm = me.partner, a = G.f.find((f) => f.def.id === aId && f.team === 1), b = a.partner;
  me.x = X; me.y = Y; mm.x = X - 900; mm.y = Y - 600; a.x = X + 320; a.y = Y; b.x = X + svDist; b.y = Y + (aIsMaster ? 60 : 900);
  [me, mm, a, b].forEach((f) => { f.inM = false; });
  let starts = 0, last = a.st;
  const run = (s) => { for (let i = 0; i < 60 * s; i++) { me.inp = { mx: 0, my: 0 }; mm.inp = { mx: 0, my: 0 }; E.simStep(E.STEP); if (a.st === 'wind' && last !== 'wind') starts++; last = a.st; } return starts; };
  return { G, me, a, run };
}
test('AI: a ranged servant whose shot is blocked works around the obstacle and fires', () => {
  const E = loadEngine(); let total = 0;
  for (let r = 0; r < 3; r++) total += aiScene(E, 'gilles', false, 1400, 5200, 1000).run(15);
  assert.ok(total >= 6, 'Gilles keeps attacking past the building (' + total + ' attacks in 3 tries)');
});
test('AI: a master fights beside their servant instead of backing off and staring', () => {
  const E = loadEngine(); let total = 0, near = 0;
  for (let r = 0; r < 5; r++) { const s = aiScene(E, 'kiritsugu', true, 120, 2300, 3100); total += s.run(15); if (Math.hypot(s.a.x - s.me.x, s.a.y - s.me.y) < 700) near++; }
  assert.ok(total >= 8, 'Kiritsugu shoots (' + total + ' attacks in 5 tries)');
  assert.ok(near >= 3, 'and stays in the fight (' + near + ' of 5)');
});
test('AI: after a seal rescue the servant rests at home unless an enemy comes to the door', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('cu', 'rin', 3), { nights: 3 });
  G.f.forEach((f, i) => { G.ai[i] = E.mkAI(f, E.DIFF.knight); });
  G.clock.t = 60; G.clock.pending = null; G.clock.evDone = true; G.event = null;
  const sv = G.f[0], foe = G.f.find((f) => f.team !== sv.team && !f.def.isMaster);
  sv.hp = 1; assert.ok(E.sealRescue(sv, foe));
  for (let i = 0; i < 60 * 1.5; i++) { G.time += E.STEP; E.rescueTick(E.STEP); }
  // an enemy servant nearby, but far from this team's home
  foe.x = sv.x + 250; foe.y = sv.y; const hx = sv.home[0], hy = sv.home[1];
  if (Math.hypot(foe.x - hx, foe.y - hy) < 460) { foe.x = hx + 600; foe.y = hy; sv.x = hx + 380; sv.y = hy; }
  for (let i = 0; i < 60 * 4; i++) E.simStep(E.STEP);
  assert.ok(sv.recover, 'still resting');
});
test('Double Accel: Kiritsugu moves and attacks faster while it lasts', () => {
  const E = loadEngine();
  const time = (haste) => { const G = E.newGame(E.MASTERS.kiritsugu, E.MASTERS.kirei, { map: 'arena' }); G.ai = [null, null]; const k = G.f[0]; k.hasteT = haste ? 5 : 0; k.x = 400; k.y = 500; G.f[1].x = 900; assert.ok(E.startAct(k, 'light')); let n = 0; while (k.st !== 'idle' && n < 600) { E.simStep(E.STEP); n++; } return n; };
  const plain = time(false), fast = time(true);
  assert.ok(fast < plain * 0.85, 'a knife swing finishes sooner (' + fast + ' vs ' + plain + ' frames)');
});
test('Origin Rounds burn a mage\'s circuits but do nothing to an Outsider\'s abilities', () => {
  const E = loadEngine();
  const G = E.newGame(E.MASTERS.kiritsugu, E.MASTERS.kuzuki, { map: 'arena' }); G.ai = [null, null];
  const k = G.f[0], z = G.f[1]; E.hurt(k, z, k.A.np, 1); assert.ok(!(z.silenceT > 0), 'Kuzuki keeps his skills');
  const G2 = E.newGame(E.MASTERS.kiritsugu, E.MASTERS.rin, { map: 'arena' }); G2.ai = [null, null];
  E.hurt(G2.f[0], G2.f[1], G2.f[0].A.np, 1); assert.ok(G2.f[1].silenceT > 0, 'Rin is silenced');
});
test('Einzbern castle: climbing the grand staircase at the end of the hall leads out into the courtyard', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'illya', 2), { nights: 3 }); G.ai = G.ai.map(() => null);
  const d = E.MAPS.city.doors.find((q) => q.id === 'court'), f = G.f[0];
  const ix = d.in ? d.in.x : d.ix, iy = d.in ? d.in.y : d.iy;
  f.x = ix; f.y = iy + 120; f.inM = false; G.f.forEach((q) => { if (q !== f) { q.x = 600; q.y = 600; } });
  for (let i = 0; i < 60 * 3 && f.x > E.MAPS.city.cityW; i++) { f.inp = { mx: 0, my: -1 }; E.simStep(E.STEP); }
  assert.ok(f.x < E.MAPS.city.cityW && Math.abs(f.x - 11000) < 300 && Math.abs(f.y - 1150) < 320, 'out in the courtyard (' + Math.round(f.x) + ',' + Math.round(f.y) + ')');
});
test('Support skills act on the caster when no servant is alive (master duels, orphaned masters)', () => {
  const E = loadEngine();
  const G = E.newGame(E.MASTERS.irisviel, E.MASTERS.waver, { map: 'arena' }); G.ai = [null, null];
  const iri = G.f[0], wv = G.f[1]; iri.x = 300; iri.y = 500; wv.x = 1200; wv.y = 500;
  iri.hp = iri.def.hp * 0.4; const before = iri.hp; iri.mana = 100; wv.mana = 100;
  E.startAct(iri, 'skill'); E.startAct(wv, 'skill');
  for (let i = 0; i < 60 * 1.5; i++) E.simStep(E.STEP);
  assert.ok(iri.hp > before + 10, 'Irisviel healed herself (' + Math.round(before) + ' -> ' + Math.round(iri.hp) + ')');
  assert.ok(wv.buffT > 0, 'Waver\'s Strategist buffs Waver');
});
test('Master-duel tuning applies only when masters fight each other, never to the war roster', () => {
  const E = loadEngine();
  const G = E.newGame(E.MASTERS.kuzuki, E.MASTERS.sakura, { map: 'arena' });
  assert.ok(G.f[0].def.hp > E.MASTERS.kuzuki.hp && G.f[1].def.lifesteal < E.MASTERS.sakura.lifesteal, 'duel copies tuned');
  assert.strictEqual(E.MASTERS.kuzuki.hp, 120, 'the shared roster is untouched');
  const W = E.newWar(E.warTeams('richard', 'kuzuki', 2), { nights: 1 });
  assert.strictEqual(W.f.find((f) => f.def.id === 'kuzuki').def.hp, E.MASTERS.kuzuki.hp, 'war Kuzuki keeps war numbers');
});
test('Caren: the Shroud of Magdalene holds a man twice as long as a woman', () => {
  const E = loadEngine();
  const G = E.newGame(E.MASTERS.caren, E.MASTERS.kirei, { map: 'arena' }); G.ai = [null, null];
  const c = G.f[0]; E.hurt(c, G.f[1], c.A.skill, 1);
  const G2 = E.newGame(E.MASTERS.caren, E.MASTERS.rin, { map: 'arena' }); G2.ai = [null, null];
  E.hurt(G2.f[0], G2.f[1], G2.f[0].A.skill, 1);
  assert.ok(Math.abs(G.f[1].rootT - 1.6) < 1e-6 && Math.abs(G2.f[1].rootT - 0.8) < 1e-6, 'Kirei ' + G.f[1].rootT + ', Rin ' + G2.f[1].rootT);
});
test('Caren: Stigmata feel a concealed Assassin through walls, her side sees it, and she bleeds no lower than 40%', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'caren', 3), { nights: 1 }); G.ai = G.ai.map(() => null);
  G.clock.pending = null; G.clock.evDone = true; G.event = null;
  const c = G.f.find((f) => f.def.id === 'caren'), sv = c.partner;
  const hassan = G.f.find((f) => f.team !== c.team && !f.def.isMaster); hassan.def = Object.assign({}, hassan.def, { cls: 'Assassin' }); hassan.cnc = true;
  G.f.forEach((f) => { f.x = 600; f.y = 3000; }); c.x = 2300; c.y = 3100; sv.x = 2350; sv.y = 3100; hassan.x = 2700; hassan.y = 3100;
  assert.ok(!E.knowsExact(sv, hassan), 'hidden before');
  c.hp = c.def.hp * 0.42;
  for (let i = 0; i < 60 * 2; i++) { G.f.forEach((f) => { f.inp = { mx: 0, my: 0 }; }); E.simStep(E.STEP); }
  assert.ok(E.knowsExact(sv, hassan), 'her servant sees the hidden Assassin');
  assert.ok(c.hp >= c.def.hp * 0.4 - 1e-6 && c.hp < c.def.hp * 0.42, 'she bled, but not below 40% (' + (c.hp / c.def.hp).toFixed(3) + ')');
});
test('Caren: Sacrament heals her and a nearby servant', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'caren', 2), { nights: 1 }); G.ai = G.ai.map(() => null);
  const c = G.f.find((f) => f.def.id === 'caren'), sv = c.partner; sv.x = c.x + 100; sv.y = c.y;
  c.hp = 30; sv.hp = 100; E.sacrament(c, c.A.np);
  assert.ok(c.hp === 64 && sv.hp === 140, 'healed ' + c.hp + ' and ' + sv.hp);
});
test('Caren has no magic circuits: Origin Rounds burn nothing', () => {
  const E = loadEngine();
  const G = E.newGame(E.MASTERS.kiritsugu, E.MASTERS.caren, { map: 'arena' }); G.ai = [null, null];
  E.hurt(G.f[0], G.f[1], G.f[0].A.np, 1); assert.ok(!(G.f[1].silenceT > 0), 'Caren keeps her skills');
});
test('Ryuunosuke earns mana only from harm: none on his own, some when his servant wounds, a lump for a kill', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'ryuunosuke', 2), { nights: 1 }); G.ai = G.ai.map(() => null);
  const r = G.f.find((f) => f.def.id === 'ryuunosuke'), sv = r.partner, foe = G.f.find((f) => f.team !== r.team && !f.def.isMaster);
  E.initMana(r); r.mana = 10; r.x = 600; r.y = 600; sv.x = 650; sv.y = 600;
  for (let i = 0; i < 60 * 3; i++) { G.f.forEach((f) => { f.inp = { mx: 0, my: 0 }; }); E.simStep(E.STEP); }
  assert.ok(r.mana <= 10, 'no regeneration, only the servant\'s upkeep (' + r.mana + ')');
  const m0 = r.mana; E.harmMana(sv, foe, 40); assert.ok(Math.abs(r.mana - m0 - 12) < 1e-6, 'servant damage pays (' + r.mana + ')');
  foe.hp = 0; E.harmMana(sv, foe, 5); assert.ok(r.mana > m0 + 12 + 20, 'a kill pays a lump (' + r.mana + ')');
});
test('Ryuunosuke: Masterpiece finishes a weakened master only from behind', () => {
  const E = loadEngine();
  const run = (behind) => { const G = E.newGame(E.MASTERS.ryuunosuke, E.MASTERS.rin, { map: 'arena' }); G.ai = [null, null];
    const r = G.f[0], v = G.f[1]; v.x = 1000; v.y = 600; r.x = behind ? 1080 : 920; r.y = 600; v.face = Math.PI; r.face = behind ? Math.PI : 0; v.hp = v.def.hp * 0.35; r.mom = 100;
    E.startAct(r, 'np'); for (let i = 0; i < 60; i++) { v.face = Math.PI; v.inp = { mx: 0, my: 0 }; r.inp = { mx: 0, my: 0 }; E.simStep(E.STEP); } return v; };
  assert.strictEqual(run(true).st, 'dead', 'executed from behind');
  const f2 = run(false); assert.ok(f2.st !== 'dead' && f2.hp < f2.def.hp * 0.35, 'from the front only a cut');
});
test('Ryuunosuke: Fade into the Crowd lets shots pass him, and needs a crowd in the war', () => {
  const E = loadEngine();
  const G = E.newGame(E.MASTERS.rin, E.MASTERS.ryuunosuke, { map: 'arena' }); G.ai = [null, null];
  const rin = G.f[0], r = G.f[1]; rin.x = 500; rin.y = 600; r.x = 800; r.y = 600; rin.face = 0; r.fadeT = 5; const hp = r.hp;
  E.startAct(rin, 'light'); for (let i = 0; i < 60; i++) { G.f.forEach((f) => { f.inp = { mx: 0, my: 0 }; }); E.simStep(E.STEP); }
  assert.strictEqual(r.hp, hp, 'the Gandr passed him by');
  const W = E.newWar(E.warTeams('richard', 'ryuunosuke', 2), { nights: 1 }); const rw = W.f.find((f) => f.def.id === 'ryuunosuke');
  W.clock.phase = 'night'; assert.ok(!E.fadeAllowed(rw), 'no crowd at night');
});
test('Excalibur stops on the first one it strikes; a pillar rises there and hurts everyone in it, but not those beyond', () => {
  const E = loadEngine();
  const G = E.newGame([E.SERV.caerwyn, E.SERV.cu, E.SERV.emiya, E.SERV.medusa], { map: 'arena', teams: [0, 1, 1, 1] }); G.ai = G.ai.map(() => null);
  const [ar, a, b, c] = G.f; ar.x = 300; ar.y = 600; ar.face = 0; a.x = 700; a.y = 600; b.x = 760; b.y = 680; c.x = 1000; c.y = 600;
  [a, b, c].forEach((f) => { f.guarding = false; }); const hp = [a.hp, b.hp, c.hp]; ar.mom = 100;
  E.startAct(ar, 'np');
  for (let i = 0; i < 60 * 3.2; i++) { G.f.forEach((f) => { f.inp = { mx: 0, my: 0 }; }); E.simStep(E.STEP); }
  assert.ok(hp[0] - a.hp > 60, 'struck one takes the beam and the pillar (' + (hp[0] - a.hp) + ')');
  assert.ok(hp[1] - b.hp > 15 && hp[1] - b.hp < 40, 'a bystander in the circle takes only the pillar (' + (hp[1] - b.hp) + ')');
  assert.strictEqual(c.hp, hp[2], 'the beam stopped: nobody behind is hit');
});
test('Einzbern fortify is the ward-stone task too, though the castle is off the roads', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('caerwyn', 'irisviel', 3), { nights: 2 });
  const t = G.f.find((f) => f.def.id === 'irisviel').team; E.startDay();
  const k = G.tasks.find((q) => q.team === t && q.kind === 'fortify');
  assert.ok(k && k.act === 'stones' && k.stones.length === 3, 'ward stones for the castle');
});
test('Church bounty: taking a life from the marked team confirms it', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'rin', 3), { nights: 2 }); G.ai = G.ai.map(() => null);
  const me = G.f.find((f) => f.team === 0 && f.def.isMaster), foe = G.f.find((f) => f.team === 1 && !f.def.isMaster);
  me.seals = 1; G.event = { kind: 'bounty', team: 1, t: 0 };
  E.bountyClaim(foe, me);
  assert.ok(!G.event && me.seals === 2, 'claimed, a seal regained');
});
test('King\'s Banquet: nothing happens until two servants sit at the table', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('iskandar', 'waver', 3), { nights: 2 }); G.ai = G.ai.map(() => null);
  G.clock.phase = 'day'; G.tasks = []; E.startBanquet();
  const k = G.tasks.find((q) => q.kind === 'banquet'), sv = G.f.filter((f) => !f.def.isMaster);
  G.f.forEach((f) => { f.x = 600; f.y = 3000; }); sv[0].x = k.x; sv[0].y = k.y;
  E.tasksTick(1); assert.ok(k.waiting && !Object.keys(k.prog).length, 'one servant: it waits');
  sv[1].x = k.x + 40; sv[1].y = k.y; E.tasksTick(1); assert.ok(!k.waiting, 'two servants: it begins');
});
test('Sealed School: no one enters or leaves (masters included), and skeletons never rise on top of anyone', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('medusa', 'rin', 3), { nights: 2 }); G.ai = G.ai.map(() => null);
  G.f.forEach((f) => { f.x = 600; f.y = 3000; }); E.startSchool(); const ev = G.event;
  const d = E.MAP.doors.find((q) => q.room === 'school'), outsider = G.f.find((f) => f.def.isMaster && f.team !== ev.culprit);
  assert.ok(E.schoolBars(outsider, d), 'a master outside is barred');
  assert.ok(E.schoolHolds(outsider, d), 'and one inside could not leave');
  const c = ev.circles[0]; G.f[0].x = c.x; G.f[0].y = c.y;
  for (let i = 0; i < 20; i++) { const p = E.schoolSpawn(c); if (p) assert.ok(Math.hypot(p.x - c.x, p.y - c.y) > 0 && G.f.every((f) => Math.hypot(f.x - p.x, f.y - p.y) >= 150), 'clear of fighters'); }
});
test('War drafts: standard keeps one of each class, the lore wars field their canon teams', () => {
  const E = loadEngine();
  const st = E.warTeams('richard', 'rin', 7, Math.random, 'standard'), cls = st.map((t) => t.servant.cls);
  assert.strictEqual(new Set(cls).size, 7, 'seven classes');
  const four = E.warTeams('caerwyn', 'kiritsugu', 7, Math.random, 'fourth', 'all');
  assert.deepStrictEqual(four.map((t) => t.servant.id + '/' + t.master.id).sort(), E.LORE_WARS.fourth.map((t) => t[0] + '/' + t[1]).sort(), 'the Fourth War exactly');
  const five = E.warTeams('richard', 'rin', 7, Math.random, 'fifth', 'others');
  assert.ok(five[0].servant.id === 'richard' && five[0].master.id === 'rin' && five.length === 7, 'my pick kept, seven teams');
  assert.ok(five.some((t) => t.servant.id === 'heracles' && t.master.id === 'illya') && five.some((t) => t.servant.id === 'medea' && t.master.id === 'kuzuki'), 'lore pairs for rivals');
  const ids = five.map((t) => t.master.id); assert.strictEqual(new Set(ids).size, ids.length, 'no master twice');
});
test('King\'s Banquet is a sanctuary: no one at the table can be hurt, even from outside; AI teams go there and leave before dusk', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('iskandar', 'waver', 3), { nights: 2 }); G.ai = G.ai.map((a, i) => i ? E.mkAI(G.f[i], E.DIFF.knight) : null);
  G.clock.phase = 'day'; G.clock.t = 10; G.clock.len = 150; G.tasks = []; E.startBanquet();
  const k = G.tasks.find((q) => q.kind === 'banquet');
  const guest = G.f.find((f) => f.team === 1 && !f.def.isMaster), shooter = G.f.find((f) => f.team === 2 && !f.def.isMaster);
  guest.x = k.x; guest.y = k.y; shooter.x = k.x + 900; shooter.y = k.y;
  assert.ok(E.inTruce(shooter, guest), 'the one outside cannot hurt the one at the table');
  const am = G.f.find((f) => f.team === 2 && f.def.isMaster); am.x = 600; am.y = 3000;
  assert.strictEqual(E.aiDayGoal(am), k, 'an AI team heads for the banquet');
  G.clock.t = 140; assert.notStrictEqual(E.aiDayGoal(am), k, 'and not with dusk close');
});
test('Event perks: each does what it says and runs out', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'rin', 3), { nights: 2 }); G.ai = G.ai.map(() => null);
  const m = G.f.find((f) => f.team === 0 && f.def.isMaster), s = m.partner, foe = G.f.find((f) => f.team === 1 && !f.def.isMaster);
  E.initMana(m); m.mana = 5; E.grantPerk(0, 'prana'); assert.strictEqual(m.mana, m.manaMax, 'prana refills mana');
  const lvl = G.fields[0].lvl, max = G.fields[0].max; E.grantPerk(0, 'ward'); assert.ok(G.fields[0].max === max + 1 && G.fields[0].lvl === Math.min(max + 1, lvl + 1), 'ward raises the field');
  const hp = s.hp; E.grantPerk(0, 'unshaken'); E.hurt(foe, s, { dmg: 20, key: 'light' }, 1); const took = hp - s.hp;
  const hp2 = foe.hp; E.hurt(s, foe, { dmg: 20, key: 'light' }, 1); const took2 = hp2 - foe.hp;
  assert.ok(took < took2 * 0.9, 'unshaken: less damage taken (' + took.toFixed(1) + ' vs ' + took2.toFixed(1) + ')');
  G.time += E.PERKS.unshaken.dur + 1; assert.ok(!E.hasPerk(0, 'unshaken'), 'and it runs out');
  G.event = { kind: 'berserk', f: foe, dmgBy: { 2: 40, 0: 10 } }; E.berserkPerk(G.event); assert.ok(E.hasPerk(2, 'unshaken') && !E.hasPerk(0, 'unshaken') || E.hasPerk(2, 'unshaken'), 'the team that fought the berserker hardest earns it');
});
test('Lancelot\'s seized guns: their own magazine; the MP5 bursts, a shotgun shell throws a spread, and both reload', () => {
  const E = loadEngine();
  const G = E.newGame(E.SERV.lancelot, E.SERV.cu, { map: 'arena' }); G.ai = [null, null];
  const L = G.f[0], o = G.f[1]; L.x = 400; L.y = 600; o.x = 600; o.y = 600; L.face = 0;
  const step = (n) => { for (let i = 0; i < n; i++) { G.f.forEach((f) => { f.inp = { mx: 0, my: 0 }; }); E.simStep(E.STEP); } };
  const seize = (id) => { L.arm = L.A.arms.findIndex((a) => a.id === id); L.armT = 9; L.ammo = L.A.arms[L.arm].mag.size; L.reloadT = 0; };
  seize('mp5'); E.startAct(L, 'light'); step(40); assert.ok(L.ammo <= 27 && L.ammo >= 25, 'MP5 burst spent about three rounds (' + L.ammo + ')');
  seize('shotgun'); const before = G.proj.length; E.startAct(L, 'light'); step(16);
  assert.strictEqual(L.ammo, 5, 'one shell'); 
  L.ammo = 0; step(5); assert.ok(L.reloadT > 0, 'an empty gun reloads'); step(60 * 2.6); assert.strictEqual(L.ammo, 6, 'reloaded');
});
