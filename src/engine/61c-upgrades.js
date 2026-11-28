/* ---- base upgrades (2.0 update 6): fortifying the home earns a pick; each upgrade has two ranks ----
   G.upg[team] = { picks, have: { id: rank } }. A Mage family starts with one pick and a Caster's temple with one more.
   A human chooses inside their own home (the panel in the UI, button 'upg_<id>'); an AI team picks by its master's taste.
   A demolished home loses its upgrades; unspent picks are kept. */
var UPGRADES = {
  thunder: { name: 'Thunder Wards', icon: '⚡', r: ['Bolts strike intruders from field level 2', 'Bolts strike twice as often and half again as hard'] },
  spring: { name: 'Healing Spring', icon: '❁', r: ['Healing at home x1.5', 'Healing at home x2'] },
  alarm: { name: 'Alarm Wards', icon: '☎', r: ['Intruders stay marked for 30 s after they are felt', 'The alarm reaches 300 beyond the field'] },
  mire: { name: 'Binding Mire', icon: '≈', r: ['Intruders are slowed more', 'No dodging inside the field'] },
  well: { name: 'Mana Well', icon: '✦', r: ['The master’s mana refills twice as fast at home', 'Three times as fast, and the servant’s NP charges 20% faster at home'] },
  veil: { name: 'Veil', icon: '◐', r: ['Rival scouts cannot find your home', 'Your field cannot be seen by rivals'] },
  bulwark: { name: 'Bulwark', icon: '▣', r: ['Demolition charges take half again as long to plant', 'Masters inside take 25% less damage'] }
};
var UPG_ORDER = ['thunder', 'spring', 'alarm', 'mire', 'well', 'veil', 'bulwark'];
// what each master reaches for first (others: the default order)
var UPG_TASTE = {
  kayneth: ['thunder', 'bulwark', 'mire'], tokiomi: ['thunder', 'well', 'spring'], rin: ['well', 'thunder', 'spring'], kiritsugu: ['alarm', 'veil', 'mire'],
  irisviel: ['veil', 'spring', 'alarm'], illya: ['well', 'thunder', 'veil'], sakura: ['mire', 'well', 'veil'], kariya: ['mire', 'spring', 'alarm'],
  waver: ['alarm', 'bulwark', 'spring'], kirei: ['alarm', 'spring', 'bulwark'], shirou: ['spring', 'bulwark', 'alarm'], caren: ['spring', 'alarm', 'veil'],
  kuzuki: ['spring', 'well', 'bulwark'], ryuunosuke: ['veil', 'spring', 'alarm']
};
function initUpgrades() {
  G.upg = {};
  for (var t in G.fields) {
    var F = G.fields[t], m = teamMaster(+t), picks = (m && m.def.type === 'Mage family' ? 1 : 0) + (F.temple ? 1 : 0);
    G.upg[t] = { picks: picks, have: {} };
  }
}
// at home: inside one's own rooms, or on the grounds close to the house
function atHome(f) { var F = G.fields && G.fields[f.team]; return inOwnHome(f) || !!(F && f.x < MAP.cityW && Math.hypot(f.x - F.x, f.y - F.y) < 300); }
function upg(team, id) { var U = G.upg && G.upg[team]; return U ? U.have[id] || 0 : 0; }
function upgCan(team, id) { var U = G.upg && G.upg[team]; return !!(U && U.picks > 0 && UPGRADES[id] && (U.have[id] || 0) < 2); }
function chooseUpgrade(f, id) {
  var t = f.team; if (!upgCan(t, id)) return false;
  if (!G.ai[f.idx] && !atHome(f)) { FX.text(f, 'CHOOSE AT YOUR HOME'); return false; }
  var U = G.upg[t]; U.have[id] = (U.have[id] || 0) + 1; U.picks--;
  FX.event('upgrade', { team: t, id: id, rank: U.have[id] });
  return true;
}
function grantPick(team) { var U = G.upg && G.upg[team]; if (U) { U.picks++; FX.event('upgradePick', { team: team }); } }
function aiUpgrades() {
  if (!G.upg) return;
  for (var t in G.upg) {
    var U = G.upg[t]; if (U.picks <= 0) continue; var m = teamMaster(+t); if (!m) continue;
    // a team with a human in it (master or servant) chooses for itself
    if (G.f.some(function (f) { return f.team === +t && !G.ai[f.idx]; })) continue;
    var taste = (UPG_TASTE[m.def.id] || []).concat(UPG_ORDER), pick = null;
    for (var i = 0; i < taste.length && !pick; i++) if ((U.have[taste[i]] || 0) === 0) pick = taste[i];
    for (var j = 0; j < taste.length && !pick; j++) if ((U.have[taste[j]] || 0) < 2) pick = taste[j];
    if (pick) chooseUpgrade(m, pick); else U.picks = 0;
  }
}
// effects read elsewhere
function upgHealMul(team) { return 1 + 0.5 * upg(team, 'spring'); }
function upgManaMul(m) { var r = upg(m.team, 'well'); return r && inOwnHome(m) ? 1 + r : 1; }
function upgMom(f) { return !f.def.isMaster && upg(f.team, 'well') >= 2 && inOwnHome(f) ? 1.2 : 1; }
function upgDamageTaken(def) { return def.def.isMaster && upg(def.team, 'bulwark') >= 2 && inOwnHome(def) ? 0.75 : 1; }
