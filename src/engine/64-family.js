/* ---- family and old bonds: when one of these would land a killing blow on the other, the hand
   stops the first time. The AI often lets them go; a player can strike again, or walk away. ---- */
var FAMILY = { 'irisviel|kiritsugu': 1, 'illya|kiritsugu': 1, 'illya|irisviel': 1, 'rin|sakura': 1, 'illya|shirou': 1, 'kariya|sakura': 1, 'sakura|shirou': 1, 'kiritsugu|shirou': 1, 'kariya|rin': 1 };
var SPARE = { chance: 0.6, dur: 90 };
function bondKey(a, b) { return [a.def.id, b.def.id].sort().join('|'); }
function familyHold(att, def) {
  if (!att || !G || G.mode !== 'war' || !FAMILY[bondKey(att, def)]) return false;
  G.hesit = G.hesit || {}; var k = att.idx + '>' + def.idx; if (G.hesit[k]) return false;
  G.hesit[k] = true; att.lock = null;
  if (G.ai[att.idx] && rnd() < SPARE.chance) { G.spare = G.spare || {}; G.spare[att.team + ':' + def.idx] = G.time + SPARE.dur; }
  FX.hesitate(att, def);
  return true;
}
function spared(f, e) { return !!(G.spare && G.spare[f.team + ':' + e.idx] > G.time); }
