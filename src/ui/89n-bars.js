/* ---- clearer bars (2.0 update 3): stamina you can count, where your eyes already are ----
   One stamina segment is one dodge. The bar dims while regeneration is paused after an action, flashes (with a soft cue)
   when one segment is left, and turns red while exhausted. A thin segmented arc under your own fighter shows the same,
   only when stamina is not full; on the controls, a ring around Light (stamina) and around Skill (mana). */
var BARS = { arcR: 46, arcSpan: 2.2, fade: 0.25 };
function staSeg(f) { return 12 * (f.def.dodgeCost || 1); }
function staState(f) { return f.exh > 0 ? 'exh' : f.sta < staSeg(f) ? 'low' : f.stDelay > 0 ? 'paused' : ''; }
SND.staLow = function (o, out, t) { tone(o, out, t, 'sine', 700, 660, 0.07, 0.05, 0.004); tone(o, out, t + 0.09, 'sine', 540, 520, 0.08, 0.045, 0.004); };
var BARST = { low: false, arcA: 0, lastT: 0 };
var barsHud0 = hud;
hud = function () {
  barsHud0();
  var me = G.f[MEI]; if (!me) return;
  HUD.forEach(function (h) {
    var f = h.f; if (!f || !h.bst) return; var b = h.bst.parentNode, seg = staSeg(f), st = staState(f);
    b.style.setProperty('--seg', (seg).toFixed(2) + '%');
    if (b.dataset.st !== st) { b.dataset.st = st; b.classList.toggle('paused', st === 'paused'); b.classList.toggle('low', st === 'low'); b.classList.toggle('exh', st === 'exh'); }
  });
  // the soft cue, once each time your stamina drops to its last segment
  var low = me.st !== 'dead' && me.sta < staSeg(me) && me.exh <= 0;
  if (low && !BARST.low) FX.snd('staLow', me);
  BARST.low = low;
  // rings on the controls: stamina around Light, mana around Skill (a servant reads its master's)
  var pad = document.querySelector('.pad'); if (pad) {
    pad.style.setProperty('--sta', clamp(me.sta / 100, 0, 1).toFixed(3)); pad.style.setProperty('--seg', (staSeg(me) / 100 * 360).toFixed(1) + 'deg');
    pad.dataset.st = staState(me);
    var mm = me.def.isMaster ? me : me.partner, hasM = G.mode === 'war' && mm && mm.manaMax;
    pad.style.setProperty('--mana', hasM ? clamp(mm.mana / mm.manaMax, 0, 1).toFixed(3) : '0'); pad.classList.toggle('hasmana', !!hasM);
    pad.classList.toggle('manalow', !!(hasM && mm.mana < mm.manaMax * 0.25));
  }
};
// the arc under your own fighter: a thin segmented crescent below the feet, drawn over the fighter so the cape never hides it
var barsFfx0 = drawFighterFx;
drawFighterFx = function (g, f) {
  barsFfx0(g, f);
  var me = G && G.f && G.f[MEI]; if (!me || f !== me || me.st === 'dead' || !running) return;
  var now = performance.now() / 1000, dt = Math.min(0.1, now - (BARST.lastT || now)); BARST.lastT = now;
  var want = me.sta < 99.5 || me.exh > 0 ? 1 : 0; BARST.arcA += (want - BARST.arcA) * Math.min(1, dt / BARS.fade * 3);
  if (BARST.arcA < 0.02) return;
  var st = staState(me), seg = staSeg(me), n = Math.ceil(100 / seg), r = BARS.arcR, span = BARS.arcSpan, a0 = Math.PI / 2 - span / 2, step = span / n, gap = 0.035;
  var col = st === 'exh' ? '#e2525c' : st === 'low' ? (Math.sin(now * 14) > 0 ? '#ffd36b' : '#ff9a3c') : '#7ed69a';
  g.save(); g.globalAlpha = BARST.arcA * (st === 'paused' ? 0.55 : 0.9); g.lineCap = 'butt';
  for (var i = 0; i < n; i++) {
    var lo = i * seg, fill = clamp((me.sta - lo) / seg, 0, 1), s0 = a0 + (n - 1 - i) * step + gap, s1 = s0 + step - gap * 2;
    g.lineWidth = 6.5; g.strokeStyle = 'rgba(8,12,18,.7)'; g.beginPath(); g.arc(me.x, me.y, r, s0, s1); g.stroke();
    if (fill > 0) { g.lineWidth = 4.2; g.strokeStyle = col; g.beginPath(); g.arc(me.x, me.y, r, s1 - (s1 - s0) * fill, s1); g.stroke(); }
  }
  g.restore();
};
