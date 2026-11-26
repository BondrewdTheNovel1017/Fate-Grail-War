/* ---- mana link: a master's mana feeds their servant ----
   Masters regenerate mana; a materialized servant drains a little upkeep (more when far from its master).
   Noble Phantasms cost the master mana, as do the master's own skill and signature spell.
   A servant whose master runs dry fights weaker. A masterless servant pays for its NP with its own remaining time. */
var MANA = { upkeep: 0.25, farDist: 1800, farDrain: 0.8, npCost: 40, marbleCost: 55, sigCost: 12, skillCost: 6, starved: 5, starveDmg: 0.85, orphanNp: 6 };
// [pool, regen per second]
var MANA_POOL = { caren: [100, 2.0], rin: [100, 2.0], kiritsugu: [70, 1.4], shirou: [45, 0.8], kayneth: [110, 2.2], kirei: [90, 1.8], waver: [75, 1.5], irisviel: [100, 2.0], kariya: [50, 0.8], illya: [140, 2.8], sakura: [130, 2.6], tokiomi: [105, 2.1], kuzuki: [40, 0.7] };
function initMana(m) { var p = MANA_POOL[m.def.id] || [80, 1.6]; m.manaMax = p[0]; m.manaRegen = p[1]; m.mana = p[0] * 0.75; }
function livingMaster(s) { var m = s.partner; return m && m.def.isMaster && m.st !== 'dead' ? m : null; }
function npManaCost(s) { var a = s.A.np; return a.manaCost || ((a.marble || a.kind === 'ubw') ? MANA.marbleCost : MANA.npCost); }
// can master m pay `cost`? Kariya pays any shortfall in blood
function elegant(m, cost) { return m && m.def && m.def.elegance && m.hp > m.def.hp * 0.7 ? cost * 0.75 : cost; } // Tokiomi: composure makes magecraft cheaper
function canPay(m, cost) { cost = elegant(m, cost); return m.mana + (m.manaBonus || 0) >= cost || !!(m.def.bloodMana && m.hp > cost - m.mana + 30); }
function payMana(m, cost) { cost = elegant(m, cost);
  if (m.manaBonus > 0) { var fromB = Math.min(m.manaBonus, cost); m.manaBonus -= fromB; cost -= fromB; if (cost <= 0) return true; }
  if (m.mana >= cost) { m.mana -= cost; return true; }
  if (m.def.bloodMana) { var need = cost - m.mana; if (m.hp > need + 30) { m.mana = 0; m.hp -= need; m.stat.taken += need; FX.text(m, 'CREST WORMS -' + Math.round(need)); return true; } }
  return false;
}
function npAffordable(s) { return canNP(s); } // for code where a local name shadows canNP
function canNP(s) { if (G.mode !== 'war' || s.sealFree) return true; var m = livingMaster(s); return !m || canPay(m, npManaCost(s)); }
function spendNP(s) {
  if (G.mode !== 'war') return;
  if (s.sealFree) { s.sealFree = false; s.sealArm = true; return; }
  var m = livingMaster(s);
  if (m) payMana(m, npManaCost(s));
  else if (s.orphanT > 0) { s.orphanT = Math.max(2, s.orphanT - MANA.orphanNp); FX.text(s, 'BURNING ITS OWN EXISTENCE'); }
}
function masterCost(key) { return key === 'np' ? MANA.sigCost : key === 'skill' ? MANA.skillCost : 0; }
function starved(s) { var m = livingMaster(s); return !!(G.mode === 'war' && !s.def.isMaster && m && m.mana < MANA.starved); }
function manaTick(m, dt) {
  if (m.manaMax === undefined) initMana(m);
  m.mana = Math.min(m.manaMax, m.mana + m.manaRegen * dt);
  var s = m.partner; if (!s || s.st === 'dead' || s.def.isMaster) return;
  var drain = s.spirit === 2 ? 0 : MANA.upkeep; if (dist(m, s) > MANA.farDist) drain += MANA.farDrain;
  m.mana = Math.max(0, m.mana - drain * dt);
}
