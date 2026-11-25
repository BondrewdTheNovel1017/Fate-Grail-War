/* ---- Form Contract: a masterless servant and a servantless master may bind themselves anew ----
   While a contract is possible the two ignore each other in combat. The new pair fights for the master's team
   and keeps whatever Command Seals the master has left. */
var CONTRACT_RANGE = 170;
function isOrphan(s) { return !s.def.isMaster && s.st !== 'dead' && s.orphanT > 0; }
function isFreeMaster(m) { return !!m.def.isMaster && m.st !== 'dead' && (!m.partner || m.partner.st === 'dead'); }
function contractable(a, b) { return a !== b && ((isOrphan(a) && isFreeMaster(b)) || (isFreeMaster(a) && isOrphan(b))); }
function contractCandidate(f, range) {
  if (G.mode !== 'war' || !(isOrphan(f) || isFreeMaster(f))) return null;
  var best = null, bd = range || 1e9;
  for (var i = 0; i < G.f.length; i++) { var o = G.f[i]; if (contractable(f, o) && !!o.inM === !!f.inM && o.spirit !== 2) { var d = dist(f, o); if (d <= bd) { bd = d; best = o; } } }
  return best;
}
function formContract(a, b) {
  if (!contractable(a, b) || dist(a, b) > CONTRACT_RANGE + 40) return false;
  var m = a.def.isMaster ? a : b, s = a.def.isMaster ? b : a;
  s.team = m.team; s.partner = m; m.partner = s; s.orphanT = 0; s.recover = false; s.lock = null; m.lock = null; s.anchor = null;
  s.isPlayerMate = !!m.isPlayerMate || m === G.f[0]; s.home = m.home;
  if (m.manaMax === undefined) initMana(m);
  FX.text(s, 'CONTRACT FORMED'); FX.say(s, 'contract'); FX.fx('seal', m.x, m.y, m); FX.fx('seal', s.x, s.y, s); FX.snd('godhand', m);
  G.contracts = (G.contracts || 0) + 1;
  G.f.forEach(pickTarget);
  return true;
}
// AI on both sides closes the deal by itself; a human decides with the Contract button
function aiWantsContract(f) { var c = contractCandidate(f); return c; }
function autoContract(f, c) { if (G.ai[f.idx] && G.ai[c.idx] && dist(f, c) <= CONTRACT_RANGE) formContract(f, c); }
