/* ---- fighters ---- */
function mkF(def, x, y, face, idx) {
  return { idx: idx, def: def, A: def.A, x: x, y: y, face: face, kx: 0, ky: 0, hp: def.hp, sta: 100, stDelay: 0, exh: 0, mom: 0,
    st: 'idle', t: 0, key: null, act: null, combo: 0, curWind: 0, windTotal: 0, recDur: 0, goal: 0, chg: 0, atkId: 0,
    cd: 0, ripo: 0, crit: 0, wallT: 0, veilT: 0, gh: false, ghT: 0, bleedT: 0, bleedDps: 0, bleedBy: null, iframes: 0, dodges: def.dodgeMax || 2, dodgeMax: def.dodgeMax || 2, dodgeRe: 0, guarding: false, guardT: 0, parryOk: true, lastG: -9, dodgeX: 0, dodgeY: 0, dur: 0,
    pulseN: 0, pulseT: 0, cx: 0, cy: 0, chargeHit: false, hitDone: false, field: null, stillT: 0, quietT: 0, hid: false, hidAct: false, arm: -1, armT: 0, pull: 0, barN: 0, barT: 0, brokenT: 0, ubwT: 0, ubwCd: 0, spirit: 0, spT: 0, partner: null, orphanT: 0, seals: 3, sealUsed: { np: false, heal: false, warp: false }, sigCd: 0, silenceT: 0, shieldN: 0, shieldT: 0, rootT: 0, buffT: 0, reinfT: 0, hasteT: 0, lock: null, stance: 'charge', anchor: null,
    inp: { mx: 0, my: 0, guard: false, heavy: false }, buf: { name: null, t: 0 }, foe: null, hit: 0,
    stat: { dealt: 0, taken: 0, parry: 0, dodge: 0, gbreak: 0, blocks: 0, intr: 0, hits: 0, nps: 0 } };
}
function newGame(dA, dB, opts) {
  var defs = Array.isArray(dA) ? dA : [dA, dB]; opts = (Array.isArray(dA) ? dB : opts) || {};
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
function enemiesOf(f) { var r = []; for (var i = 0; i < G.f.length; i++) { var e = G.f[i]; if (e !== f && e.team !== f.team && e.st !== 'dead' && e.spirit !== 2 && !!e.inM === !!f.inM && !(G.mode === 'war' && contractable(f, e))) r.push(e); } return r; }
function pickTarget(f) {
  if (f.lock && (f.lock.st === 'dead' || f.lock.spirit === 2)) f.lock = null;
  if (f.lock) { f.foe = f.lock; return; }
  var best = null, bd = 1e9, es = enemiesOf(f);
  for (var i = 0; i < es.length; i++) { var e = es[i], d = dist(f, e) - (e === f.foe ? 60 : 0); if (G.mode === 'war' && !f.def.isMaster && e.def.isMaster && e.partner && e.partner.st !== 'dead' && dist(e, e.partner) > 220) d -= 140; if (d < bd) { bd = d; best = e; } }
  if (best) f.foe = best;
}
function addFighter(def, x, y, team, face) { var f = mkF(def, x, y, face || 0, G.f.length); f.team = team; G.f.push(f); G.ai.push(null); G.f.forEach(pickTarget); return f; }
function newWar(teamsIn, opts) {
  var spawnOrder = opts && opts.spawnOrder;
  opts = opts || {}; setMap('fuyuki');
  G = { f: [], proj: [], zones: [], time: 0, hitstop: 0, over: false, winner: null, seed: opts.seed || ((Date.now() ^ 0x9e3779b9) >>> 0), dimT: 0, ai: [], mode: 'war', marble: null };
  teamsIn.forEach(function (t, ti) {
    var sp = MAP.spawns.at(spawnOrder ? spawnOrder.at(ti) : ti), sv = mkF(t.servant, sp[0], sp[1], 0, 0), ms = mkF(t.master, sp[0] - 70, sp[1] + 40, 0, 0); sv.home = ms.home = sp; initMana(ms);
    sv.team = ti; ms.team = ti; sv.partner = ms; ms.partner = sv; sv.face = ms.face = Math.atan2(MAP.h / 2 - sp[1], MAP.w / 2 - sp[0]);
    var order = (ti === 0 && opts.playAs === 'master') ? [ms, sv] : [sv, ms];
    order.forEach(function (f) { f.idx = G.f.length; G.f.push(f); G.ai.push(null); });
  });
  G.f.forEach(pickTarget);
  return G;
}
function traceTick(f, dt) {
  if (!f.ubwUsed) { var foeNear = enemiesOf(f).some(function (e) { return !e.def.isMaster && dist(f, e) < 520; }); if (foeNear) f.mom = Math.min(100, f.mom + 0.6 * dt); }
  var tier = f.ubwUsed ? 1 : f.mom >= 100 ? 2 : f.mom >= 40 ? 1 : 0;
  if (tier > (f.traceTier || 0) || (f.ubwUsed && f.traceTier === 2 && f.st !== 'act' && f.st !== 'wind' && !(f.ubwT > 0))) {
    if (tier === 1 && !f.ubwUsed) { FX.text(f, 'TRACE ON'); FX.fx('heal', f.x, f.y, f); FX.snd('drawBow', f, {}); }
    if (tier === 2) { FX.text(f, 'I AM THE BONE OF MY SWORD'); FX.fx('seal', f.x, f.y, f); f.sigCd = 0; }
    f.traceTier = tier; f.A = tier === 2 ? f.def.A2 : tier === 1 ? f.def.A1 : f.def.A;
    if (f.ubwUsed && tier === 1) { f.mom = 0; f.sigCd = Math.max(f.sigCd, 20); }
  }
}
function sealsLeft(f) { return f.sealUsed ? ['np', 'heal', 'warp'].filter(function (k) { return !f.sealUsed[k]; }).length : 0; }
function useSeal(f, kind) {
  var sv = f.partner; if (!f.def.isMaster || f.st === 'dead' || !sv || sv.st === 'dead' || f.sealUsed[kind]) return false;
  f.sealUsed[kind] = true; f.seals = sealsLeft(f);
  if (kind === 'np') { sv.mom = 100; sv.sealOrder = 6; sv.sealFree = true; FX.text(sv, 'BY MY COMMAND SEAL: RELEASE IT'); }
  else if (kind === 'heal') { sv.hp = Math.min(sv.def.hp, sv.hp + sv.def.hp * 0.5); sv.bleedT = 0; FX.text(sv, 'BY MY COMMAND SEAL: ENDURE'); }
  else if (kind === 'warp') { var a0 = Math.random() * 6.283; sv.x = clamp(f.x + Math.cos(a0) * 60, FR, W - FR); sv.y = clamp(f.y + Math.sin(a0) * 60, FR, H - FR); sv.kx = sv.ky = 0; sv.spirit = 0; sv.inM = f.inM; if (sv.st !== 'stag') { sv.st = 'idle'; sv.act = null; } FX.text(sv, 'BY MY COMMAND SEAL: COME TO ME'); }
  FX.text(f, 'COMMAND SEAL'); FX.fx('seal', f.x, f.y, f); FX.fx('seal', sv.x, sv.y, sv); FX.snd('godhand', f);
  return true;
}
function press(f, name) { f.buf.name = name; f.buf.t = 0.18; }
function armored(f) {
  if (f.wallT > 0) return true;
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
function gainMom(f, v) { if (v > 0 && f.def.momMul) v *= f.def.momMul; if (v > 0 && f.partner && f.partner.def.grailVessel && !f.def.isMaster) v *= 1.3; if (v > 0 && G && G.mode === 'war' && !f.def.trace) v *= 0.45; if (f.def.trace && f.ubwUsed) return; f.mom = clamp(f.mom + v, 0, 100); }
function kill(f, noRevive) {
  if (!noRevive && f.def.godHand && !f.gh) {
    f.gh = true; f.hp = f.def.hp * 0.2; f.ghT = 1.2; f.st = 'stag'; f.t = 0; f.dur = 0.5; f.act = null; f.combo = 0; f.guarding = false; f.sta = Math.max(f.sta, 60); f.exh = 0;
    FX.text(f, 'GOD HAND'); FX.fx('godhand', f.x, f.y, f); FX.snd('godhand', f); FX.shake(10); G.hitstop = Math.max(G.hitstop, 0.3); FX.slow(0.6);
    return;
  }
  f.st = 'dead'; f.t = 0; f.act = null; f.spirit = 0;
  f.cause = f.cause || (f.lastHit ? (f.lastHit.key === 'np' && !f.lastHit.by.def.isMaster ? 'np' : f.lastHit.by.def.isMaster ? 'master' : 'combat') : 'other'); f.killer = f.lastHit ? f.lastHit.by : null;
  if (f.def.isMaster && f.partner && f.partner.st !== 'dead') { var pt = f.partner; pt.orphanT = pt.def.cls === 'Archer' ? ARCHER_INDEPENDENT : ORPHAN_TIME; FX.text(pt, pt.def.cls === 'Archer' ? 'MASTER LOST \u00B7 INDEPENDENT ACTION' : 'MASTER LOST'); }
  var alive = G.f.filter(function (x) { return x.st !== 'dead' && !(G.mode === 'war' && x.def.isMaster); }), teams = {}; alive.forEach(function (x) { teams[x.team] = 1; });
  if (Object.keys(teams).length <= 1) { G.over = true; G.winner = alive[0] || f.foe; }
  else { G.f.forEach(pickTarget); } G.hitstop = 0.35; FX.shake(14); FX.banner(''); FX.snd('kill', f); FX.fx('kill', f.x, f.y, f); FX.slow(1.1);
}
