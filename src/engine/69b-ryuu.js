/* ---- Ryuunosuke Uryuu: no magecraft. Mana from harm, Fade into the Crowd, Masterpiece ---- */
// perDmg: mana per point of damage he or his servant deals; kill: lump per kill; civ: a civilian's worth, full for the first civFull each day
var RYU = { perDmg: 0.3, kill: 22, civ: 14, civLate: 3, civFull: 2, fadeR: 360, behind: 1.9 };
function harmEarner(att) {
  if (!att || G.mode !== 'war') return null;
  if (att.def.harmMana) return att;
  var m = att.partner; return m && m.def.harmMana && m.st !== 'dead' ? m : null;
}
function harmGain(m, amt, why) {
  if (m.manaMax === undefined) initMana(m);
  var before = m.mana; m.mana = Math.min(m.manaMax, m.mana + amt);
  if (why && m.mana - before >= 5) { FX.text(m, '+' + Math.round(m.mana - before) + ' MANA'); FX.fx('harm', m.x, m.y, m); }
}
// called from hurt() after damage lands
function harmMana(att, def, taken) {
  var m = harmEarner(att); if (!m || !def || def.team === m.team) return;
  harmGain(m, taken * RYU.perDmg, false);
  if (def.hp <= 0) harmGain(m, RYU.kill, 'kill');
}
// called when a civilian is struck down
function harmCiv(f) {
  var m = harmEarner(f); if (!m) return;
  var day = G.clock ? G.clock.n + ':' + G.clock.phase : 0; m.civDay = m.civDay || {}; var n = m.civDay[day] = (m.civDay[day] || 0) + 1;
  harmGain(m, n <= RYU.civFull ? RYU.civ : RYU.civLate, 'civ');
}
// Fade into the Crowd: by day among civilians (or anywhere off the war's clock, as in the Arena) shots pass him by
function fadeAllowed(f) {
  if (!clockOn()) return true;
  if (!isDay()) return false;
  return !!(G.civ && G.civ.some(function (c) { return c.on && !c.dead && Math.hypot(c.x - f.x, c.y - f.y) < RYU.fadeR; }));
}
function startFade(f, a) {
  if (!fadeAllowed(f)) { FX.text(f, clockOn() && !isDay() ? 'NO CROWD AT NIGHT' : 'NO CROWD HERE'); return; }
  f.fadeT = a.dur; FX.text(f, 'FADED INTO THE CROWD'); FX.fx('fade', f.x, f.y, f);
}
function behindOf(f, o) { return Math.abs(angDiff(o.face, angTo(o, f))) > RYU.behind; }
// AI: with Masterpiece ready, circle round behind a weakened master and strike from there
function stalkReady(f) { return G.mode === 'war' ? f.sigCd <= 0 && canPay(f, MANA.sigCost) && !(f.silenceT > 0) : f.mom >= 100; }
function stalkVictim(f) {
  var best = null, bd = 760, A = f.A.np;
  enemiesOf(f).forEach(function (e) { if (!e.def.isMaster || e.st === 'dead' || e.hp > e.def.hp * (A.execAt + 0.04) || (G.mode === 'war' && !knowsExact(f, e))) return; var d = dist(f, e); if (d < bd) { bd = d; best = e; } });
  return best;
}
function stalkTick(f) {
  if (f.st !== 'idle' || !stalkReady(f)) return false;
  var o = stalkVictim(f); if (!o) return false;
  var A = f.A.np, d = dist(f, o);
  if (d <= A.reach + FR - 6 && behindOf(f, o)) { f.lock = o; f.foe = o; f.face = angTo(f, o); press(f, 'np'); return true; }
  // go round the side, then in behind
  var back = o.face + Math.PI, side = angDiff(angTo(o, f), back) > 0 ? 1 : -1, cur = angTo(o, f), off = angDiff(cur, back);
  var step = Math.abs(off) > 0.6 ? cur + side * 0.9 : back, r = Math.abs(off) > 0.6 ? 120 : 50;
  moveTo(f, o.x + Math.cos(step) * r, o.y + Math.sin(step) * r, 1);
  return true;
}
