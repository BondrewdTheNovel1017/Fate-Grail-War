/* ---- magazines: guns that run dry and must reload (Kiritsugu's Calico) ----
   def.mag = { size, reload }. Light and heavy actions marked `ammo: true` spend one round per bullet.
   Empty means a reload; the gun also tops itself up after a quiet moment. Skills and the signature
   (the Contender) are separate and never need the Calico's rounds. */
var AMMO = { topUpAfter: 2.5, topUpBelow: 0.6 };
// the magazine in hand: a seized gun's own (Lancelot), else the fighter's (Kiritsugu)
function magOf(f) { var am = f.armT > 0 && f.arm >= 0 && f.A && f.A.arms ? f.A.arms[f.arm] : null; return (am && am.mag) || f.def.mag; }
function hasMag(f) { return !!magOf(f); }
function initAmmo(f) { if (hasMag(f) && f.ammo === undefined) { f.ammo = magOf(f).size; f.reloadT = 0; f.lastShot = -99; } }
function startReload(f) { if (!hasMag(f) || f.reloadT > 0 || f.ammo >= magOf(f).size) return; f.reloadT = magOf(f).reload; FX.text(f, 'RELOADING'); FX.snd('drawBow', f, { wind: 0.5 }); }
function canFire(f, a) { initAmmo(f); if (!a.ammo || !hasMag(f)) return true; if (f.reloadT > 0) return false; if (f.ammo <= 0) { startReload(f); return false; } return true; }
function takeRound(f) { f.ammo = Math.max(0, f.ammo - 1); f.lastShot = G.time; return true; }
function ammoTick(f, dt) {
  initAmmo(f);
  if (f.reloadT > 0) { f.reloadT -= dt; if (f.reloadT <= 0) { f.reloadT = 0; f.ammo = magOf(f).size; FX.text(f, 'RELOADED'); } return; }
  if (f.ammo <= 0 && f.st !== 'act') startReload(f);
  else if (f.ammo < magOf(f).size * AMMO.topUpBelow && G.time - f.lastShot > AMMO.topUpAfter && (f.st === 'idle' || f.st === 'rec')) startReload(f);
}
