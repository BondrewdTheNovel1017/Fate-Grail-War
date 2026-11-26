/* ---- Caren Hortensia: Stigmata (senses the hidden and the mad through walls), Shroud of Magdalene (binds men longer), Sacrament ---- */
var STIG = { r: 700, drain: 0.6, floor: 0.4, seen: 1.2 };
// who the Shroud holds for less time
var FEMALE = { caerwyn: 1, atalanta: 1, medusa: 1, medea: 1, rin: 1, irisviel: 1, illya: 1, sakura: 1, caren: 1, bazett: 1, ayaka: 1 };
function isFemale(f) { return !!(f && f.def && FEMALE[f.def.id]); }
// what her wounds answer to: an Assassin hidden in Presence Concealment, a Berserker, a servant gone into rampage
function stigFelt(e) { return e.st !== 'dead' && !e.def.isMaster && (concealed(e) || e.def.cls === 'Berserker' || e.rampT > G.time); }
function stigmataTick(f, dt) {
  if (G.mode !== 'war' || f.inM) return;
  G.stig = G.stig || {}; var mark = G.stig[f.team] = G.stig[f.team] || {}, felt = 0;
  G.f.forEach(function (e) {
    if (e.team === f.team || pactTeams(e.team, f.team) || !stigFelt(e) || dist(f, e) > STIG.r) return;
    if (!(mark[e.idx] > G.time)) { FX.text(f, 'STIGMATA'); FX.fx('stigmata', f.x, f.y, f); }
    mark[e.idx] = G.time + STIG.seen; felt++;
  });
  // her wounds open while something is near, never below the floor
  if (felt && f.hp > f.def.hp * STIG.floor) f.hp = Math.max(f.def.hp * STIG.floor, f.hp - STIG.drain * dt);
}
function stigSees(f, e) { return !!(G.stig && G.stig[f.team] && G.stig[f.team][e.idx] > G.time); }
// Sacrament: heals Caren, and her servant if it is close
function sacrament(f, a) {
  f.hp = Math.min(f.def.hp, f.hp + a.self); FX.text(f, '+' + a.self); FX.fx('heal', f.x, f.y, f);
  var s = livePartner(f) ? f.partner : null;
  if (s && dist(f, s) <= a.range) { s.hp = Math.min(s.def.hp, s.hp + a.amount); FX.text(s, '+' + a.amount); FX.fx('heal', s.x, s.y, s); }
  FX.snd('field', f);
}
