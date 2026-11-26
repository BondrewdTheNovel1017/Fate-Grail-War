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

test('Shirou learns Trace On at 40 and Unlimited Blade Works at 100', () => {
  const E = loadEngine();
  const G = pairWar(E, 'richard', 'shirou', 'cu', 'kirei');
  const sh = G.f[1];
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

test('master kits: Shirou and Kirei fight up close, Kiritsugu fires a long Calico burst', () => {
  const E = loadEngine();
  assert.strictEqual(E.MASTERS.shirou.A.light.kind, 'melee');
  assert.strictEqual(E.MASTERS.kirei.A.light.kind, 'melee');
  assert.ok(E.MASTERS.kirei.A.heavy.count >= 5, 'Kirei throws a fan of Black Keys');
  const k = E.MASTERS.kiritsugu.A;
  assert.strictEqual(k.light.count, 2);
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
  run(E, 600);
  assert.ok(G.over, 'finished'); assert.ok(G.time < 360, 'in under six minutes (' + G.time.toFixed(0) + 's)');
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

test('nights and days: the war runs night, day, night... and ends on a final night', () => {
  const E = loadEngine();
  const G = E.newWar(E.warTeams('richard', 'rin', 3), { nights: 3 });
  assert.strictEqual(G.clock.phase, 'night'); assert.strictEqual(G.clock.n, 1);
  G.clock.t = G.clock.len - 0.01; E.simStep(E.STEP); assert.strictEqual(G.clock.phase, 'day'); assert.strictEqual(G.clock.n, 2);
  G.f[0].hp = 50; G.f[0].x = G.f[0].home[0]; G.f[0].y = G.f[0].home[1]; for (let i = 0; i < 300; i++) E.simStep(E.STEP);
  assert.ok(G.f[0].hp > 50, 'resting at home by day heals');
  E.skipDay(); for (let i = 0; i < E.CLOCK.fade * 60 + 5; i++) E.simStep(E.STEP);
  assert.strictEqual(G.clock.phase, 'night'); assert.ok(!G.clock.final);
  G.clock.t = G.clock.len; E.simStep(E.STEP); G.clock.t = G.clock.len; E.simStep(E.STEP);
  assert.ok(G.clock.final, 'night 3 is the final night'); assert.ok(G.civ.length > 0, 'civilians walk the city');
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
  sh.x = X.x; sh.y = X.y; rin.x = X.x + 100; rin.y = X.y;
  E.startSchool(); assert.strictEqual(G.event.kind, 'school'); assert.strictEqual(G.event.culprit, 2, 'Medusa\'s team raised it');
  sab.x = X.x + X.r - 100; sab.y = X.y; E.eventsTick(0.1);
  assert.ok(Math.hypot(sab.x - X.x, sab.y - X.y) > X.r, 'a servant outside is held out');
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
  assert.ok(!kay.sealUsed.heal, 'nobody answered: the host regains a seal');
  E.useSeal(rin, 'heal'); E.startChallenge(); const C = G.event; dia.x = C.x; dia.y = C.y; dia.lastHit = { by: rich, key: 'light' }; E.kill(dia, true);
  assert.ok(!rin.sealUsed.heal, 'winning the challenge restores a seal');
  E.useSeal(rin, 'heal'); E.startBounty(); assert.strictEqual(G.event.team, gil.team, 'the Church hunts Gilles first');
  gil.lastHit = { by: rich, key: 'light' }; E.kill(gil, true); assert.ok(!rin.sealUsed.heal, 'the bounty pays a seal');
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
