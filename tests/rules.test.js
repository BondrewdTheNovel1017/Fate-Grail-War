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
  E.kill(G.f[1]); assert.ok(G.f[0].orphanT > 20, 'Archers outlast other servants');
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
