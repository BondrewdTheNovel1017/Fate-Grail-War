/* ---- reality marble buffs (2.0 update 8): inside one's own marble the NP does not charge; a buff stands in for it.
   The owner wears a ring that empties as the marble's life runs out, and the player is told the trade when theirs opens. ---- */
var MARBLE_TXT = {
  ionioi: ['Ionioi Hetairoi', 'Your army stands with you: javelins fall on your enemies, your blows land harder and you take less damage. Your Noble Phantasm does not charge while the desert stands.'],
  ubw: ['Unlimited Blade Works', 'Swords fall on your enemies and your skill recharges twice as fast. Your Noble Phantasm does not charge while the marble stands.']
};
var marbleFx0 = FX.fx;
FX.fx = function (name, x, y, f) {
  marbleFx0.apply(this, arguments);
  if (name === 'marbleOn' && f && G && G.f[MEI] === f && G.marble && MARBLE_TXT[G.marble.kind]) { var t = MARBLE_TXT[G.marble.kind]; setTimeout(function () { if (G && G.marble && G.marble.owner === f) FX.banner(t[0], t[1]); }, 2600); }
};
var marbleFfx0 = drawFighterFx;
drawFighterFx = function (g, f) {
  marbleFfx0(g, f);
  var mb = G && G.marble; if (!mb || mb.owner !== f || f.st === 'dead' || !mb.life) return;
  if (G.mode === 'war' && G.f[MEI] && !!G.f[MEI].inM !== !!f.inM) return;
  var left = Math.max(0, 1 - mb.t / mb.life), ion = mb.kind === 'ionioi', col = ion ? '255,214,140' : '255,140,70', r = 46, tt = G.time;
  g.save(); g.lineCap = 'round';
  g.beginPath(); g.arc(f.x, f.y, r, 0, 6.283); g.strokeStyle = 'rgba(' + col + ',.18)'; g.lineWidth = 3; g.stroke();
  g.beginPath(); g.arc(f.x, f.y, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * left); g.strokeStyle = 'rgba(' + col + ',.75)'; g.lineWidth = 3; g.stroke();
  // marks circling the owner: spear tips of the army, or small blades of the sword field
  for (var i = 0; i < 6; i++) {
    var a = tt * (ion ? 0.8 : -1.1) + i * 1.047, x = f.x + Math.cos(a) * (r + 7), y = f.y + Math.sin(a) * (r + 7);
    g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2); g.fillStyle = 'rgba(' + col + ',.85)';
    if (ion) { g.beginPath(); g.moveTo(0, -6); g.lineTo(3, 1); g.lineTo(-3, 1); g.closePath(); g.fill(); }
    else { g.fillRect(-1, -6, 2, 9); g.fillRect(-3, 2, 6, 1.6); }
    g.restore();
  }
  g.restore();
};
