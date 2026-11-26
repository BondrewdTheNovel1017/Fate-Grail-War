/* ---- Rho Aias and Enkidu ----
   EMIYA's guard (and Shirou's, once his Trace reaches RHO.shirouAt) opens into Rho Aias against anything thrown or
   fired from the front: petals soak whole projectiles, even Noble Phantasms, each breaking a number of petals by
   how hard it hits. Melee still meets the normal guard. Petals grow back while he is not guarding. Rule Breaker
   dissolves the whole shield (and Leonidas's Hot Gates) at once.
   Gilgamesh's skill is Enkidu: chains fly from a gate and bind whoever they catch for a moment, longer for the divine. */
var RHO = { emiya: 7, shirou: 4, regen: 7, shirouAt: 60, break: 0.6 };
var DIVINE = { heracles: 1, medusa: 1, cu: 1, gilgamesh: 1, iskandar: 1 };
function rhoMax(f) { return f.def.id === 'emiya' ? RHO.emiya : (f.def.trace && f.rhoOn) ? RHO.shirou : 0; }
function rhoPetals(f) { var m = rhoMax(f); if (!m) return 0; if (f.petals === undefined) f.petals = m; return f.petals; }
// how many petals a shot breaks
function rhoCost(a) {
  if (a.noStag) return 0.34;                                     // a bullet
  if (a.key === 'np') return (a.power >= 3 || (a.explode && a.explode.big) || a.beam) ? 5 : 4;
  if (a.gb || a.power >= 2 || a.explode) return 2;
  return 1;
}
// called from hurt() for a projectile hitting a guarding fighter from the front; returns a result or null to fall through
function rhoBlock(att, def, a, src) {
  if (!src || src === att || !def.guarding || !rhoMax(def) || rhoPetals(def) <= 0) return null;
  if (a.kind === 'blast' || a.kind === 'aoe' || a.kind === 'rain') return null;
  if (a.strip) { def.petals = 0; FX.text(def, 'RHO AIAS DISSOLVED'); FX.fx('rhoBreak', def.x, def.y, def); FX.shieldBroken(def, 'rho', att); return null; }
  var c = rhoCost(a), before = def.petals; def.petals = Math.max(0, def.petals - c);
  if (src.a) src.exploded = true; // the blast is swallowed with the shot
  if (!def.rhoSaid) { def.rhoSaid = true; FX.say(def, 'rho'); }
  var lost = Math.floor(before) - Math.floor(def.petals);
  FX.fx('rho', def.x, def.y, { f: def, a: a, lost: lost, left: def.petals, src: src });
  FX.snd(lost > 0 ? 'rhoCrack' : 'block', def, a); gainMom(def, 3 + (def.def.blockMom || 0));
  hitPause(null, def, a.key === 'np' ? 0.12 : 0.035);
  if (a.key === 'np' && a.power >= 3) { FX.shake(10); if (humanIn(att, def)) hitstopAt(def, 0.12); FX.text(def, 'RHO AIAS'); }
  if (def.petals <= 0) { FX.text(def, 'RHO AIAS SHATTERED'); FX.fx('rhoBreak', def.x, def.y, def); setStag(def, RHO.break); def.guarding = false; }
  def.stat.blocks++;
  return 'block';
}
function rhoTick(f, dt) {
  var m = rhoMax(f); if (!m) return; if (f.petals === undefined) f.petals = m;
  if (!f.guarding && f.petals < m) f.petals = Math.min(m, f.petals + dt / RHO.regen);
}
// Enkidu: the chains of heaven
function enkiduBind(att, def, a) {
  var t = a.bind * (DIVINE[def.def.id] ? 1.5 : 1);
  setStag(def, t); def.rootT = Math.max(def.rootT || 0, t); def.boundT = G.time + t; def.boundBy = att;
  FX.text(def, DIVINE[def.def.id] ? 'BOUND BY HEAVEN' : 'BOUND');
  FX.enkidu(att, def);
}
