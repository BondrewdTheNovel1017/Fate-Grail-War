/* ---- reality marbles: replace the battlefield until another marble overwrites it or Enuma Elish breaks it ---- */
var MARBLE_PULL = 900, MARBLE_R = 1150, MARBLE_LIFE = 25;
function setMarble(kind, f) {
  if (G.marble && G.marble.kind === kind && G.marble.owner === f) return false;
  if (G.mode === 'war') {
    if (G.marble) endMarble(null, true);
    var cx = f.x, cy = f.y, n = 0;
    G.marble = { kind: kind, owner: f, t: 0, prev: null, cx: cx, cy: cy, R: MARBLE_R, life: MARBLE_LIFE };
    G.f.forEach(function (o) { if (o.st === 'dead') return; if (o === f || (o.spirit !== 2 && Math.hypot(o.x - cx, o.y - cy) <= MARBLE_PULL)) { o.inM = true; n++; if (o !== f) FX.text(o, 'DRAWN INTO THE MARBLE'); } });
    FX.fx('marbleOn', f.x, f.y, f); FX.snd('marble:' + kind, f); FX.shake(10);
    return true;
  }
  G.marble = { kind: kind, owner: f, t: 0, prev: G.marble ? G.marble.kind : null };
  PILLARS = []; buildGrid(); FX.fx('marbleOn', f.x, f.y, f); FX.snd('marble:' + kind, f); FX.shake(10);
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
