/* ---- reality marbles: replace the battlefield until another marble overwrites it or Enuma Elish breaks it ---- */
var MARBLE_PULL = 900, MARBLE_R = 1150; // how long a marble stands: tune('marbleLife') (war 25 s, Arena 18 s)
function setMarble(kind, f) {
  if (G.marble && G.marble.kind === kind && G.marble.owner === f) return false;
  if (G.mode === 'war') {
    if (G.marble) endMarble(null, true);
    var cx = f.x, cy = f.y, n = 0;
    G.marble = { kind: kind, owner: f, t: 0, prev: null, cx: cx, cy: cy, R: MARBLE_R, life: tune('marbleLife'), buffT: 0 };
    G.f.forEach(function (o) { if (o.st === 'dead') return; if (o === f || (o.spirit !== 2 && Math.hypot(o.x - cx, o.y - cy) <= MARBLE_PULL)) { o.inM = true; n++; if (o !== f) FX.text(o, 'DRAWN INTO THE MARBLE'); } });
    FX.fx('marbleOn', f.x, f.y, f); FX.snd('marble:' + kind, f); FX.shake(10);
    return true;
  }
  G.marble = { kind: kind, owner: f, t: 0, prev: G.marble ? G.marble.kind : null, life: tune('marbleLife'), buffT: 0 };
  PILLARS = []; RECTS = []; buildGrid(); FX.fx('marbleOn', f.x, f.y, f); FX.snd('marble:' + kind, f); FX.shake(10);
  return true;
}
function endMarble(by, quiet) {
  var mb = G.marble; if (!mb) return false;
  G.f.forEach(function (o) { o.inM = false; }); G.marble = null; G.proj = []; G.zones = [];
  if (!quiet) { FX.fx('marbleOff', mb.cx, mb.cy, by); FX.text(by || mb.owner, by ? 'REALITY BROKEN' : 'THE MARBLE FADES'); }
  return true;
}
function sameLayer(a, b) { return !!a.inM === !!b.inM; }
function breakMarble(by) {
  if (!G.marble) return false;
  if (G.mode === 'war') return endMarble(by || G.marble.owner, false);
  G.marble = null; setMap(MAP.id); FX.fx('marbleOff', by ? by.x : W / 2, by ? by.y : H / 2, by); FX.text(by || G.f[0], 'REALITY BROKEN');
  return true;
}
function tg0Fix(f) { if (f.foe && !sameLayer(f.foe, f)) pickTarget(f); return false; }
/* ---- 2.0 update 8: one's own marble stops one's NP charging (gainMom) and grants a buff for its life instead ---- */
function ownMarble(f, kind) { var mb = G.marble; return !!(mb && f && mb.owner === f && f.st !== 'dead' && (!kind || mb.kind === kind) && (G.mode !== 'war' || f.inM)); }
function marbleFoes(f) { return enemiesOf(f).filter(function (o) { return G.mode !== 'war' || o.inM; }); }
// the army or the sword field strikes everyone inside on a beat: a few marked circles that land a moment later
function marbleVolley(f, n, dmg, zshape, r) {
  marbleFoes(f).forEach(function (o) { for (var i = 0; i < n; i++) { var an = Math.random() * 6.283, rr = i === 0 ? 0 : 60 + Math.random() * 50; G.zones.push({ x: clamp(o.x + Math.cos(an) * rr, 40, W - 40), y: clamp(o.y + Math.sin(an) * rr, 40, H - 40), r: r, delay: 0.75 + i * 0.12, t: 0, owner: f, a: { dmg: dmg, zshape: zshape, key: 'marble', power: 1, stag: 0.25 }, done: false }); } });
}
function marbleTick(dt) {
  var mb = G.marble, f = mb.owner; mb.t += dt;
  if (mb.t > mb.life || f.st === 'dead') { if (G.mode === 'war') endMarble(null, false); else fadeMarble(); return; }
  mb.buffT = (mb.buffT || 0) + dt;
  if (mb.kind === 'ionioi') { var T = tune('ionioi'); if (mb.buffT >= T.armyEvery) { mb.buffT = 0; marbleVolley(f, T.armyN, T.armyDmg, 'arrow', 64); FX.text(f, 'THE ARMY ADVANCES'); } }
  else if (mb.kind === 'ubw') { var U = tune('ubw'); if (mb.buffT >= U.rainEvery && !(f.ubwT > 0)) { mb.buffT = 0; marbleVolley(f, U.rainN, U.rainDmg, 'sword', 60); } }
}
// an Arena marble that runs out: the arena returns, like a broken one but quietly
function fadeMarble() { var mb = G.marble; if (!mb) return; G.marble = null; setMap(MAP.id); FX.fx('marbleOff', mb.owner.x, mb.owner.y, mb.owner); FX.text(mb.owner, 'THE MARBLE FADES'); }
