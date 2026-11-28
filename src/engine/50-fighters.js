/* ---- fighters ---- */
function mkF(def, x, y, face, idx) {
  return { idx: idx, def: def, A: def.A, x: x, y: y, face: face, kx: 0, ky: 0, hp: def.hp, sta: 100, stDelay: 0, exh: 0, mom: 0,
    st: 'idle', t: 0, key: null, act: null, combo: 0, curWind: 0, windTotal: 0, recDur: 0, goal: 0, chg: 0, atkId: 0,
    cd: 0, ripo: 0, crit: 0, wallT: 0, veilT: 0, gh: false, ghT: 0, bleedT: 0, bleedDps: 0, bleedBy: null, iframes: 0, dodges: def.dodgeMax || 2, dodgeMax: def.dodgeMax || 2, dodgeRe: 0, guarding: false, guardT: 0, parryOk: true, lastG: -9, dodgeX: 0, dodgeY: 0, dur: 0,
    pulseN: 0, pulseT: 0, cx: 0, cy: 0, chargeHit: false, hitDone: false, field: null, stillT: 0, quietT: 0, hid: false, hidAct: false, arm: -1, armT: 0, pull: 0, barN: 0, barT: 0, brokenT: 0, ubwT: 0, ubwCd: 0, spirit: 0, spT: 0, partner: null, orphanT: 0, seals: 3, sealUsed: { np: 0, heal: 0, warp: 0 }, seals: SEALS, sigCd: 0, silenceT: 0, shieldN: 0, shieldT: 0, rootT: 0, buffT: 0, reinfT: 0, hasteT: 0, lock: null, stance: 'charge', anchor: null,
    inp: { mx: 0, my: 0, guard: false, heavy: false }, buf: { name: null, t: 0 }, foe: null, hit: 0,
    stat: { dealt: 0, taken: 0, parry: 0, dodge: 0, gbreak: 0, blocks: 0, intr: 0, hits: 0, nps: 0 } };
}
/* Arena master duels only: the war keeps MASTERS as tuned by tools/sim.js; these even out masters fighting each other (from master-duel sims) */
var MDUEL = { ryuunosuke: { hp: 1.1, dmg: 1.1 }, caren: { hp: 1.38, dmg: 1.42 }, sakura: { ls: 0.2, hp: 0.92 }, waver: { hp: 1.2, dmg: 1.2 }, kuzuki: { hp: 1.4, dmg: 1.4 }, illya: { dmg: 1.3 }, irisviel: { hp: 1.1, dmg: 1.22 }, kariya: { dmg: 1.18 }, shirou: { hp: 1.15, dmg: 1.08 }, rin: { dmg: 0.88 }, kayneth: { dmg: 0.88 }, kirei: { hp: 0.9, dmg: 0.88 }, tokiomi: { dmg: 0.96 }, kiritsugu: { dmg: 0.95 } };
function mduelDef(d) { var t = MDUEL[d.id]; if (!t) return d; var c = Object.assign({}, d); if (t.hp) c.hp = Math.round(d.hp * t.hp); if (t.dmg) c.dmg = (d.dmg || 1) * t.dmg; if (t.ls !== undefined) c.lifesteal = t.ls; return c; }
function newGame(dA, dB, opts) {
  var defs = Array.isArray(dA) ? dA : [dA, dB]; opts = (Array.isArray(dA) ? dB : opts) || {};
  if (defs.every(function (d) { return d && d.isMaster; })) defs = defs.map(mduelDef);
  setMap(opts.map || 'arena');
  G = { f: [], proj: [], zones: [], time: 0, hitstop: 0, over: false, winner: null, seed: opts.seed || ((Date.now() ^ 0x9e3779b9) >>> 0), dimT: 0, ai: [], mode: opts.mode || 'duel', marble: null };
  var teams = opts.teams || defs.map(function (_, i) { return i; }), used = {};
  var order = [0, 1, 2, 3];
  if (opts.teams && G.mode === 'teams') { var tA = 0, tB = 0; order = teams.map(function (t) { return t === teams[0] ? [0, 2].at(tA++) : [1, 3].at(tB++); }); }
  defs.forEach(function (d, i) {
    var sp = MAP.spawns.at(order.at(i) % MAP.spawns.length), f = mkF(d, sp[0], sp[1], 0, i);
    f.team = teams.at(i); f.face = Math.atan2(MAP.h / 2 - sp[1], MAP.w / 2 - sp[0]); G.f.push(f); G.ai.push(null);
  });
  G.f.forEach(pickTarget);
  return G;
}
/* ---- targeting: every fighter has a team; f.foe is the current target (nearest living enemy).
   Hits are checked against every enemy, so more fighters can be added with addFighter(). ---- */
function enemiesOf(f) { var r = []; for (var i = 0; i < G.f.length; i++) { var e = G.f[i]; if (e !== f && e.team !== f.team && !e.resc && !pactTeams(e.team, f.team) && !(G.ai[f.idx] && pactParley(e.team, f.team)) && e.st !== 'dead' && e.spirit !== 2 && !!e.inM === !!f.inM && !(G.mode === 'war' && G.ai[f.idx] && inTruce(f, e)) && !(G.mode === 'war' && contractable(f, e))) r.push(e); } return r; }
// What a human player perceives as their target in the war: known, in the same place and within sight.
// Their auto-facing, the HUD target card, the camera lean and the off-screen arrow all follow this, so they never point across the city.
var AIM_R = 1300;
function aimFoe(f) {
  var o = f && f.foe; if (!o || o.st === 'dead') return null;
  if (G.mode !== 'war' || G.ai[f.idx]) return o;
  if (!sameZone(f, o) || dist(f, o) > AIM_R || !knowsExact(f, o)) return null;
  return o;
}
// a player with no enemy in reach turns to face the nearest hostile familiar (school skeletons, the river horror's spawn, Executors)
function aimMob(f) {
  if (G.mode !== 'war' || G.ai[f.idx] || !G.mobs || !G.mobs.length) return null;
  var best = null, bd = 300;
  G.mobs.forEach(function (m) { if (m.dead || m.scout || (m.team !== undefined && m.team === f.team)) return; var d = Math.hypot(m.x - f.x, m.y - f.y); if (d < bd && (f.x >= MAP.cityW) === (m.x >= MAP.cityW)) { bd = d; best = m; } });
  return best;
}
function pickTarget(f) {
  if (f.lock && (f.lock.st === 'dead' || f.lock.spirit === 2 || (concealed(f.lock) && !knowsExact(f, f.lock)))) f.lock = null;
  if (f.lock) { f.foe = f.lock; return; }
  var best = null, bd = 1e9, es = enemiesOf(f);
  for (var i = 0; i < es.length; i++) { var e = es[i], d = dist(f, e) + (MAP.cityW && !sameZone(f, e) ? 2500 : 0) + (knows(f, e) ? 0 : 5000) + (inTruce(f, e) ? 5000 : 0) + (spared(f, e) ? 5000 : 0) - (f.def.id === 'kariya' && e.def.id === 'tokiomi' ? 600 : 0) + pactAim(f, e) + (G.ai[f.idx] && clockOn() && G.clock.n >= 2 && e.team === leadTeam() ? -600 : 0) + (e.def.isMaster && clockOn() && !finalNight() ? (f.def.isMaster ? 800 : 400) : 0) - (e === f.foe ? 60 : 0); if (G.mode === 'war' && !(clockOn() && !finalNight()) && !f.def.isMaster && e.def.isMaster && e.partner && e.partner.st !== 'dead' && dist(e, e.partner) > 220) d -= 140; if (d < bd) { bd = d; best = e; } }
  if (best) f.foe = best;
}
function addFighter(def, x, y, team, face) { var f = mkF(def, x, y, face || 0, G.f.length); f.team = team; G.f.push(f); G.ai.push(null); G.f.forEach(pickTarget); return f; }
function newWar(teamsIn, opts) {
  var spawnOrder = opts && opts.spawnOrder;
  opts = opts || {}; setMap(opts.map || 'city');
  var homes = MAP.homes ? assignHomes(teamsIn, null, opts.plots) : null;
  G = { f: [], proj: [], zones: [], time: 0, hitstop: 0, over: false, winner: null, seed: opts.seed || ((Date.now() ^ 0x9e3779b9) >>> 0), dimT: 0, ai: [], mode: 'war', marble: null, quick: !!opts.quick, circles: [] };
  G.evSet = opts.events || 'random'; // which events this war can draw (EVSETS)
  teamsIn.forEach(function (t, ti) {
    // in the city each master starts at their summoning circle; the servant appears on it
    var spot = homes ? summonSpot(homes[ti]) : null;
    var sp = spot ? [spot.x, spot.y] : MAP.spawns.at(spawnOrder ? spawnOrder.at(ti) : ti), sv = mkF(t.servant, sp[0] + (spot ? 0 : 0), sp[1] - (spot ? 10 : 0), 0, 0), ms = mkF(t.master, sp[0] - (spot ? 0 : 70), sp[1] + (spot ? 75 : 40), 0, 0);
    sv.home = ms.home = homes ? [homes[ti].x, homes[ti].y] : sp; initMana(ms);
    if (spot) G.circles.push({ x: sp[0], y: sp[1], team: ti, col: t.master.col, name: spot.name });
    sv.team = ti; ms.team = ti; sv.partner = ms; ms.partner = sv; sv.face = ms.face = spot ? -Math.PI / 2 : Math.atan2(MAP.h / 2 - sp[1], MAP.w / 2 - sp[0]);
    if (spot) ms.face = -Math.PI / 2;
    var order = (ti === 0 && opts.playAs === 'master') ? [ms, sv] : [sv, ms];
    order.forEach(function (f) { f.idx = G.f.length; G.f.push(f); G.ai.push(null); });
  });
  G.homes = homes; G.plotOrder = homes ? PLOT_ORDER : null; initClock(opts); if (G.clock) initPacts(); if (MAP.cityW && !G.quick) initFields();
  G.f.forEach(pickTarget);
  return G;
}
// Shirou's Trace grows over a whole city war: a little all the time, more while he fights. Milestones: Trace On,
// then Rho Aias, then Unlimited Blade Works, which a city war holds back until Night 2 (TRACE.ubwNight).
var TRACE = { on: 30, rho: 60, ubw: 100, base: 0.055, fight: 0.16, hitMul: 0.22, ubwNight: 2, arenaOn: 40, arenaFight: 0.6 };
function traceWar() { return !!(G && G.clock); }
function traceTick(f, dt) {
  var war = traceWar();
  if (!f.ubwUsed) {
    var foeNear = enemiesOf(f).some(function (e) { return !e.def.isMaster && dist(f, e) < 520; });
    if (war) f.mom = Math.min(100, f.mom + (TRACE.base + (foeNear ? TRACE.fight : 0)) * dt);
    else if (foeNear) f.mom = Math.min(100, f.mom + TRACE.arenaFight * dt);
    if (war && f.mom >= TRACE.ubw - 0.01 && G.clock.n < TRACE.ubwNight) f.mom = TRACE.ubw - 0.5;
  }
  if (!f.rhoOn && (f.mom >= (war ? TRACE.rho : 70) || f.ubwUsed)) { f.rhoOn = true; f.petals = RHO.shirou; FX.text(f, 'RHO AIAS LEARNED'); FX.fx('heal', f.x, f.y, f); }
  var tier = f.ubwUsed ? 1 : f.mom >= 100 ? 2 : f.mom >= (war ? TRACE.on : TRACE.arenaOn) ? 1 : 0;
  if (tier > (f.traceTier || 0) || (f.ubwUsed && f.traceTier === 2 && f.st !== 'act' && f.st !== 'wind' && !(f.ubwT > 0))) {
    if (tier === 1 && !f.ubwUsed) { FX.text(f, 'TRACE ON'); FX.fx('heal', f.x, f.y, f); FX.snd('drawBow', f, {}); }
    if (tier === 2) { FX.text(f, 'I AM THE BONE OF MY SWORD'); FX.fx('seal', f.x, f.y, f); f.sigCd = 0; }
    f.traceTier = tier; f.A = tier === 2 ? f.def.A2 : tier === 1 ? f.def.A1 : f.def.A;
    if (f.ubwUsed && tier === 1) { f.mom = 0; f.sigCd = Math.max(f.sigCd, 20); }
  }
}
// Command Seals: one pool of three, spent on any order (NP, heal, recall) and, before the Grail descends, on a rescue from death
var SEALS = 3;
function sealsLeft(f) { return f.def && f.def.isMaster ? Math.max(0, f.seals === undefined ? SEALS : f.seals) : 0; }
function useSeal(f, kind) {
  var sv = f.partner; if (!f.def.isMaster || f.st === 'dead' || f.resc || !sv || sv.st === 'dead' || sv.resc || sealsLeft(f) <= 0) return false;
  if (kind === 'np' && sv.sealFree) return false;
  f.seals = sealsLeft(f) - 1; f.sealUsed[kind] = (f.sealUsed[kind] || 0) + 1;
  if (kind === 'np') { sv.mom = 100; sv.sealOrder = 6; sv.sealFree = true; FX.text(sv, 'BY MY COMMAND SEAL: RELEASE IT'); FX.church('sealNP', f.team, { s: sv.idx }); }
  else if (kind === 'heal') { sv.hp = Math.min(sv.def.hp, sv.hp + sv.def.hp * 0.5); sv.bleedT = 0; FX.text(sv, 'BY MY COMMAND SEAL: ENDURE'); }
  else if (kind === 'warp') { var a0 = Math.random() * 6.283; sv.x = clamp(f.x + Math.cos(a0) * 60, FR, W - FR); sv.y = clamp(f.y + Math.sin(a0) * 60, FR, H - FR); sv.kx = sv.ky = 0; sv.spirit = 0; sv.inM = f.inM; if (G.event && G.event.kind === 'school') G.event.allowed[sv.idx] = true; if (sv.st !== 'stag') { sv.st = 'idle'; sv.act = null; } FX.text(sv, 'BY MY COMMAND SEAL: COME TO ME'); }
  FX.text(f, 'COMMAND SEAL'); FX.fx('seal', f.x, f.y, f); FX.fx('seal', sv.x, sv.y, sv); FX.snd('godhand', f);
  return true;
}
function press(f, name) { f.buf.name = name; f.buf.t = 0.18; }
function npCharging(f) { return !!(f.act && f.act.npArmor && f.key === 'np' && f.st === 'wind'); }
function armored(f) {
  if (f.wallT > 0) return true;
  if (f.sealArm && f.key === 'np' && (f.st === 'wind' || f.st === 'act' || f.st === 'rec')) return true; // a seal-forced NP cannot be stopped
  if (npCharging(f)) return true; // a servant charging a Noble Phantasm holds through ordinary blows
  return !!(f.act && f.act.armor && (f.st === 'wind' || f.st === 'act' || f.st === 'rec'));
}
function setStag(f, dur) {
  if (f.st === 'dead') return;
  if (f.st === 'wind' && f.key === 'np') { f.mom = (f.def.npKeep || 0) * 100; f.stat.intr++; FX.text(f, f.def.npKeep ? 'NP LOST \u00B7 40% KEPT' : 'NP LOST'); FX.snd('npLost', f); }
  if (f.field) breakField(f, 'FIELD BROKEN');
  f.quietT = 0; f.hid = false; f.pull = 0;
  f.st = 'stag'; f.t = 0; f.dur = dur * (f.def.stagMul || 1); f.act = null; f.combo = 0; f.chargeHit = false;
}
function breakField(f, msg) { if (!f.field) return; FX.fx('fieldOff', f.field.x, f.field.y, f); if (msg) FX.text(f, msg); f.field = null; f.stillT = 0; }
function inField(f, t) { return !!(f.field && Math.hypot(t.x - f.field.x, t.y - f.field.y) <= f.field.r); }
// Noble Phantasms are rare: every mode builds momentum at NP_MOM of the base rate (Shirou's Trace keeps its own pace)
var NP_MOM = 0.6; // (2.0: replaced by TUNE.npMom per mode; kept for the tools that read it)
function gainMom(f, v) { if (v > 0 && f.momLockT > G.time) return; if (v > 0 && !f.def.isMaster && ownMarble(f)) return; if (v > 0 && !f.def.trace) v *= tune('npMom') * tuneNp(f, 'mom'); if (v > 0 && G.perks) v *= perkMom(f); if (v > 0 && G.upg) v *= upgMom(f); if (v > 0 && f.def.momMul) v *= f.def.momMul; if (v > 0 && f.partner && f.partner.def.grailVessel && !f.def.isMaster) v *= 1.3;  if (f.def.trace && f.ubwUsed) return; if (f.def.trace && v > 0 && traceWar()) v *= TRACE.hitMul; f.mom = clamp(f.mom + v, 0, 100); }
function kill(f, noRevive) {
  if (f.trueTeam !== undefined) unturn(f);
  if (!noRevive && f.def.godHand && !f.gh) {
    f.gh = true; f.ghAt = G.time; f.hp = f.def.hp * 0.2; f.ghT = 1.2; f.st = 'stag'; f.t = 0; f.dur = 0.5; f.act = null; f.combo = 0; f.guarding = false; f.sta = Math.max(f.sta, 60); f.exh = 0;
    FX.text(f, 'GOD HAND'); FX.fx('godhand', f.x, f.y, f); FX.snd('godhand', f); if (FX.near(f.x, f.y)) { FX.shake(10); G.hitstop = Math.max(G.hitstop, 0.3); FX.slow(0.6); }
    return;
  }
  f.st = 'dead'; f.t = 0; f.act = null; f.spirit = 0; f.cnc = false;
  f.cause = f.cause || (f.lastHit ? (f.lastHit.key === 'np' && !f.lastHit.by.def.isMaster ? 'np' : f.lastHit.by.def.isMaster ? 'master' : 'combat') : 'other'); f.killer = f.lastHit ? f.lastHit.by : null;
  if (f.def.isMaster && f.partner && f.partner.st !== 'dead') { var pt = f.partner; pt.orphanT = pt.def.cls === 'Archer' ? ARCHER_INDEPENDENT : ORPHAN_TIME; FX.text(pt, pt.def.cls === 'Archer' ? 'MASTER LOST \u00B7 INDEPENDENT ACTION' : 'MASTER LOST'); }
  var alive = G.f.filter(function (x) { return x.st !== 'dead' && !(G.mode === 'war' && x.def.isMaster); }), teams = {}; alive.forEach(function (x) { teams[trueTeamOf(x)] = 1; });
  if (Object.keys(teams).length <= 1) { G.over = true; G.winner = alive[0] || f.foe; }
  else { G.f.forEach(pickTarget); }
  if (G.tn) traceKill(f);
  if (G.event) { challengeKill(f); bountyKill(f); }
  if (G.mode === 'war') { if (f.killer && f.killer.st !== 'dead' && f.killer !== f) FX.say(f.killer, 'kill', f); if (f.partner && f.partner.st !== 'dead' && f.partner.team === f.team) FX.say(f.partner, f.def.isMaster ? 'masterdown' : 'servantdown'); }
  FX.snd('kill', f); FX.fx('kill', f.x, f.y, f); if (FX.near(f.x, f.y)) { G.hitstop = 0.35; FX.shake(14); FX.banner(''); FX.slow(1.1); }
}
