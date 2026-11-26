/* ---- Rule Breaker turns a servant, and God Hand comes back ----
   Medea's dagger, landing on an enemy servant in the Grail War, cuts the contract for a few seconds:
   the servant joins her side and turns on its own master, then the bond snaps back. A player's servant is
   taken over by the AI while it lasts. Heracles' God Hand returns after a long while out of combat. */
var RB = { dur: 5, vsMaster: 0.6, momLock: 25 }, GH_REGEN = 40;
function ruleBreak(att, s) {
  if (s.turnT > G.time || s.def.isMaster || !s.partner || s.partner.st === 'dead' || s.team === att.team) return false;
  s.trueTeam = s.team; s.team = att.team; s.turnT = G.time + RB.dur; s.turnBy = att;
  s.spirit = 0; s.cnc = false; s.hid = false; s.guarding = false; s.lock = s.partner; s.foe = s.partner;
  if (!G.ai[s.idx]) { G.ai[s.idx] = mkAI(s, DIFF.knight); G.ai[s.idx].turned = true; s.wasHuman = true; }
  G.f.forEach(function (o) { if (o.lock === s) o.lock = null; });
  FX.turned(s, att);
  return true;
}
function unturn(s) {
  if (s.trueTeam === undefined) return;
  s.team = s.trueTeam; s.trueTeam = undefined; s.turnT = 0; s.lock = null;
  if (G.ai[s.idx] && G.ai[s.idx].turned) { G.ai[s.idx] = null; }
  s.wasHuman = false; G.f.forEach(function (o) { if (o.lock === s) o.lock = null; pickTarget(o); });
  FX.unturned(s);
}
function turnTick() { for (var i = 0; i < G.f.length; i++) { var f = G.f[i]; if (f.trueTeam !== undefined && (G.time >= f.turnT || f.st === 'dead')) unturn(f); } }
function trueTeamOf(f) { return f.trueTeam !== undefined ? f.trueTeam : f.team; }
// a turned servant's AI: go for its own master
function aiTurned(ai, dt) {
  var f = ai.f, tg = f.partner && f.partner.st !== 'dead' ? f.partner : nearestEnemyTo(f, f, 1e9);
  if (!tg) return;
  f.lock = tg; f.foe = tg;
  if (dist(f, tg) > 280) { moveTo(f, tg.x, tg.y, 1); return; }
  aiTick(ai, dt);
}
function godHandTick(f) {
  if (!f.gh || !f.def.godHand || f.st === 'dead') return;
  if (G.time - Math.max(f.lastHitT || 0, f.lastAtkT || 0, f.ghAt || 0) > GH_REGEN) { f.gh = false; FX.text(f, 'GOD HAND RESTORED'); FX.fx('godhand', f.x, f.y, f); }
}
