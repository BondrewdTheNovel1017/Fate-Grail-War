/* ---- Event perks: rewards for taking part in events that give no Command Seal. Each is shown as an icon by the
   team's health bars with its name and time left, and read out in full when earned (FX.event('perk')). ---- */
var PERKS = {
  prana: { name: 'Reclaimed Prana', icon: '◈', col: '#e0505e', dur: 240, desc: 'The life the Blood Fort stole flows back to you: your master’s mana refills, and regenerates half again as fast until dawn.' },
  unshaken: { name: 'Unshaken', icon: '⛨', col: '#b39ddb', dur: 240, desc: 'You faced a servant in full madness and did not break. Your servant takes 15% less damage until dawn.' },
  unmask: { name: 'Unmasked', icon: '◉', col: '#7fc4ee', dur: 240, desc: 'You saw through the false death. You know where that team is until dawn.' },
  ward: { name: 'The Workshop Holds', icon: '▣', col: '#e0b84a', dur: 45, desc: 'You saved your home from the bomber. Your bounded field rises one level, and can now rise one level higher.' },
  wine: { name: 'Wine of Kings', icon: '♛', col: '#e8c36a', dur: 300, desc: 'You drank at the King’s table as an equal. Your servant’s Noble Phantasm charges 20% faster until dawn.' }
};
function hasPerk(team, id) { var P = G.perks && G.perks[team]; return !!(P && P[id] > G.time); }
function grantPerk(team, id, extra) {
  if (team === undefined || team < 0 || !PERKS[id]) return;
  G.perks = G.perks || {}; var P = G.perks[team] = G.perks[team] || {};
  P[id] = G.time + PERKS[id].dur;
  var m = G.f.filter(function (f) { return f.team === team && f.def.isMaster && f.st !== 'dead'; })[0];
  if (id === 'prana' && m) { if (m.manaMax === undefined) initMana(m); m.mana = m.manaMax; }
  if (id === 'ward' && G.fields && G.fields[team]) { var F = G.fields[team]; F.max += 1; F.lvl = Math.min(F.max, F.lvl + 1); }
  if (id === 'unmask' && extra !== undefined) { G.intel = G.intel || {}; G.intel[team] = { team: extra, until: P[id] }; }
  FX.event('perk', { team: team, id: id });
}
// hooks used by the fighting code
function perkDamageTaken(def) { return !def.def.isMaster && hasPerk(def.team, 'unshaken') ? 0.85 : 1; }
function perkMom(f) { return !f.def.isMaster && hasPerk(f.team, 'wine') ? 1.2 : 1; }
function perkRegen(m) { return hasPerk(m.team, 'prana') ? 1.5 : 1; }
// event bookkeeping: who hurt the rampaging Berserker, who struck through a false death
function perkHit(att, def, taken) {
  var E = G.event; if (!att || !E || att.team === def.team) return;
  if (E.kind === 'berserk' && def === E.f) { E.dmgBy = E.dmgBy || {}; E.dmgBy[att.team] = (E.dmgBy[att.team] || 0) + taken; }
  if (G.ghost && G.ghost[def.team] > G.time) { G.unmasked = G.unmasked || {}; var key = att.team + ':' + def.team; if (!G.unmasked[key]) { G.unmasked[key] = 1; grantPerk(att.team, 'unmask', def.team); } }
}
function berserkPerk(E) {
  var best = -1, bd = 20; for (var t in (E.dmgBy || {})) if (E.dmgBy[t] > bd) { bd = E.dmgBy[t]; best = +t; }
  if (best >= 0) grantPerk(best, 'unshaken');
}
