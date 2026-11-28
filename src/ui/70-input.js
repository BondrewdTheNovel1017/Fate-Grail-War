/* ---- input ---- */
var held = { mx: 0, my: 0 }, keys = {};
function me() { return G && G.f[MEI]; }
function cycleTarget(f) { if (NET.mirror) { var me1 = me(); if (!me1) return; var es1 = enemiesOf(me1).filter(function (e) { return dist(me1, e) < 900 && sameZone(me1, e) && knowsExact(me1, e); }).sort(function (a, b) { return dist(me1, a) - dist(me1, b); }); var cur = G.f[NET.lk]; var nx = es1.length ? es1.at((es1.indexOf(cur) + 1) % es1.length) : null; NET.lk = nx ? G.f.indexOf(nx) : -1; return; } f = f || me(); if (!f) return; var es = enemiesOf(f).filter(function (e) { return dist(f, e) < 900 && sameZone(f, e) && knowsExact(f, e); }).sort(function (a, b) { return dist(f, a) - dist(f, b); }); if (!es.length) { f.lock = null; return; } var i = es.indexOf(f.lock); f.lock = es.at((i + 1) % es.length); }
function btnDown(b) {
  if (NET.mirror) { if (!G.over) netButton(b, true); return; }
  var f = me(); if (!f || paused || G.over) return;
  doButton(f, b);
}
function doButton(f, b) {
  if (f.turnT > G.time) return; // Rule Breaker: this servant is not yours right now
  if (b === 'target') { cycleTarget(f); return; }
  if (b === 'pact') { pactButton(f); return; }
  if (b.indexOf('upg_') === 0) { chooseUpgrade(f, b.slice(4)); return; }
  if (b === 'contract') { var cc = contractCandidate(f, CONTRACT_RANGE + 40); if (!cc || !formContract(f, cc)) FX.text(f, 'NOBODY TO CONTRACT WITH'); return; }
  if (b.indexOf('seal_') === 0) { if (f.def.isMaster) { if (!useSeal(f, b.slice(5))) FX.text(f, f.sealUsed[b.slice(5)] ? 'SEAL ALREADY USED' : 'NO SERVANT'); } return; }
  if (b === 'block') f.inp.guard = true;
  else if (b === 'heavy') { f.inp.heavy = true; press(f, 'heavy'); }
  else press(f, b);
}
function btnUp(b) { if (NET.mirror) { netButton(b, false); return; } var f = me(); if (!f) return; if (b === 'block') f.inp.guard = false; if (b === 'heavy') f.inp.heavy = false; }
var ptrBtn = {};
document.querySelectorAll('.b[data-b]').forEach(function (el) {
  el.addEventListener('pointerdown', function (e) { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) {} ptrBtn[e.pointerId] = el.dataset.b; el.classList.add('down'); btnDown(el.dataset.b); });
  var up = function (e) { var b = ptrBtn[e.pointerId]; if (!b) return; delete ptrBtn[e.pointerId]; el.classList.remove('down'); btnUp(b); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
  el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
});
var stick = $('#stick'), knob = $('#knob'), stickId = null;
function stickMove(e) {
  var r = stick.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2 - 10;
  var dx = e.clientX - cx, dy = e.clientY - cy, L = Math.hypot(dx, dy) || 1, m = Math.min(L, R);
  knob.style.transform = 'translate(' + (dx / L * m) + 'px,' + (dy / L * m) + 'px)';
  var v = m / R; if (v < 0.18) { held.mx = 0; held.my = 0; } else { held.mx = dx / L * Math.min(1, v * 1.15); held.my = dy / L * Math.min(1, v * 1.15); }
}
stick.addEventListener('pointerdown', function (e) { e.preventDefault(); stickId = e.pointerId; try { stick.setPointerCapture(e.pointerId); } catch (x) {} stickMove(e); });
stick.addEventListener('pointermove', function (e) { if (e.pointerId === stickId) stickMove(e); });
var stickUp = function (e) { if (e.pointerId !== stickId) return; stickId = null; knob.style.transform = ''; held.mx = 0; held.my = 0; };
stick.addEventListener('pointerup', stickUp); stick.addEventListener('pointercancel', stickUp); stick.addEventListener('lostpointercapture', stickUp);
var KM = { f: 'contract', p: 'pact', '7': 'seal_np', '8': 'seal_heal', '9': 'seal_warp', u: 'spirit', tab: 'target', j: 'light', z: 'light', k: 'heavy', x: 'heavy', l: 'block', c: 'block', shift: 'block', ' ': 'dodge', i: 'skill', v: 'skill', o: 'np', b: 'np' };
window.addEventListener('keydown', function (e) {
  if (!running) return; var k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab'].indexOf(k) >= 0) e.preventDefault();
  if (/^[1-6]$/.test(k) && G.f[MEI].def.isMaster && G.f[MEI].partner && NET.mirror) { NET.so = STANCES.at(+k - 1)[0]; G.f[MEI].partner.stance = NET.so; renderStances(); return; }
  if (/^[1-6]$/.test(k) && G.f[MEI].def.isMaster && G.f[MEI].partner) { G.f[MEI].partner.stance = STANCES.at(+k - 1)[0]; G.f[MEI].partner.anchor = null; FX.text(G.f[MEI].partner, STANCES.at(+k - 1)[1].toUpperCase()); renderStances(); return; }
  if (e.repeat) return; keys[k] = true;
  if (k === 'escape') { if (!netInMatch()) paused = true; $('#pz').classList.add('on'); return; }
  if (KM[k]) { btnDown(KM[k]); var el = document.querySelector('.b[data-b="' + KM[k] + '"]'); if (el) el.classList.add('down'); }
});
window.addEventListener('keyup', function (e) {
  var k = e.key.toLowerCase(); keys[k] = false;
  if (KM[k]) { btnUp(KM[k]); var el = document.querySelector('.b[data-b="' + KM[k] + '"]'); if (el) el.classList.remove('down'); }
});
function readMove() {
  var mx = held.mx, my = held.my;
  if (keys.a || keys.arrowleft) mx -= 1; if (keys.d || keys.arrowright) mx += 1; if (keys.w || keys.arrowup) my -= 1; if (keys.s || keys.arrowdown) my += 1;
  var L = Math.hypot(mx, my); if (L > 1) { mx /= L; my /= L; }
  return [mx, my];
}

