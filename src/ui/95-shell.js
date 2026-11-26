/* ---- the menu shell: title screen, main menu, setup screens and their transitions, the animated night
   behind them, menu sounds and keyboard navigation. renderSetup (20-menu) fills the pages; this file moves
   between them. ---- */
var SHELL = { scr: 'title', page: { war: 0, arena: 0 }, cur: 0, flare: 0, mx: 0, my: 0, calm: false, hoverT: 0 };
try { SHELL.calm = localStorage.getItem('fgw.calm') === '1'; SHELL.noTitle = localStorage.getItem('fgw.notitle') === '1'; } catch (e) {}
document.body.classList.toggle('calm', SHELL.calm);
var WAR_STEPS = ['Servant', 'Master', 'The war'], ARENA_STEPS = ['Match', 'Fighters', 'Battlefield'];

/* ---- menu sounds: soft, short, and only when sound is on ---- */
SND.uiMove = function (o, out, t) { tone(o, out, t, 'sine', 1320, 1180, 0.06, 0.035, 0.002); noise(o, out, t, 'highpass', 5000, 7000, 0.03, 0.02, 0.001); };
SND.uiSelect = function (o, out, t) { ringS(o, out, t, [784, 1176], 0.5, 0.07); tone(o, out, t, 'triangle', 392, 390, 0.12, 0.05, 0.003); };
SND.uiBack = function (o, out, t) { tone(o, out, t, 'sine', 660, 440, 0.12, 0.05, 0.003); };
SND.uiTitle = function (o, out, t) { pad(o, out, t, 3.2, [110, 165, 220, 330], 0.09, 0.4, 2.2, 'sawtooth', 500, 1800); ringS(o, out, t + 0.05, [523, 784, 1046], 2.6, 0.06); };
SND.uiStart = function (o, out, t) { bass(o, out, t, 82, 30, 1.2, 0.6, 1.1); ringS(o, out, t, [392, 588, 784, 1176], 2.4, 0.09); noise(o, out, t, 'bandpass', 300, 3200, 0.8, 0.14, 0.05, 1.4, true); };
function uiSnd(n) { if (n === 'uiMove') { var now = performance.now(); if (now - SHELL.hoverT < 60) return; SHELL.hoverT = now; } audInit(); playSnd(n); }

/* ---- screens ---- */
function scrEl(id) { return document.querySelector('[data-scr="' + id + '"]'); }
function showScr(id, quiet) {
  var from = scrEl(SHELL.scr), to = scrEl(id); if (!to) return;
  if (from && from !== to) { from.classList.remove('on'); from.classList.remove('show'); }
  SHELL.scr = id; to.classList.add('show'); void to.offsetWidth; to.classList.add('on');
  if (id === 'war' || id === 'arena') { CFG.game = id; saveCfg(); renderSetup(); }
  $('#cmdbar').hidden = !(id === 'war' || id === 'arena');
  applySteps();
  if (id === 'main') { setCur(SHELL.cur, true); var it = document.querySelectorAll('.mmi')[SHELL.cur]; if (it && !quiet) it.focus({ preventScroll: true }); }
  if (id === 'settings') renderSettings();
  if (id === 'net') { LOBBY.parts = {}; renderNet(); }
  window.scrollTo(0, 0);
}
function back() {
  if (SHELL.scr === 'title') return;
  if ((SHELL.scr === 'war' || SHELL.scr === 'arena') && SHELL.page[SHELL.scr] > 0) { SHELL.page[SHELL.scr]--; applySteps(); uiSnd('uiBack'); return; }
  uiSnd('uiBack'); showScr('main');
}
/* ---- the stepped setup pages ---- */
function applySteps() {
  ['war', 'arena'].forEach(function (k) {
    var el = scrEl(k), P = SHELL.page[k], names = k === 'war' ? WAR_STEPS : ARENA_STEPS;
    el.querySelectorAll('.page').forEach(function (pg) { var on = +pg.dataset.page === P; if (pg.hidden === on) { pg.hidden = !on; if (on) { pg.style.animation = 'none'; void pg.offsetWidth; pg.style.animation = ''; } } });
    $('#' + k + 'Steps').innerHTML = names.map(function (n, i) { return '<li><button type="button" data-step="' + i + '"' + (i === P ? ' aria-current="step"' : '') + (i < P ? ' class="done"' : '') + '>' + n + '</button></li>'; }).join('');
  });
  if (SHELL.scr !== 'war' && SHELL.scr !== 'arena') return;
  var P2 = SHELL.page[SHELL.scr], last = P2 >= 2;
  $('#nextBtn').hidden = last; $('#go').hidden = !last; $('#prevBtn').textContent = P2 > 0 ? 'Back' : 'Main menu';
  var nxt = SHELL.scr === 'war' ? WAR_STEPS : ARENA_STEPS; $('#nextBtn').textContent = last ? '' : nxt[P2 + 1] + ' →';
}
/* ---- main menu ---- */
var MAIN_DESC = {
  war: function () { var s = SERV[CFG.servant], m = MASTERS[CFG.master]; return { k: 'Seven teams · three or five nights', h: 'Holy Grail War', p: ['Summon a servant and fight for the Grail across Fuyuki City. Nights are for battle and days for preparation: fortify your home, learn true names, strike pacts, and live to see the final night.', 'Your last pairing: ' + shortName(s.name) + ' with ' + m.name + '.'], tags: ['Nights and days', 'Pacts', 'Events', 'Command Seals'], art: [CFG.servant, CFG.master] }; },
  arena: function () { return { k: 'Quick battles', h: 'Arena', p: ['Duels, free-for-all, team fights, master duels and master-and-servant pairs on themed battlefields: the bridge, the temple, the forest, the harbor and more.'], tags: ['Duel', 'Free-for-all', 'Teams', 'Quick Grail War'], art: ['caerwyn', 'gilgamesh', 'iskandar', 'heracles'] }; },
  net: function () { return { k: 'Online \u00B7 up to seven players', h: 'Multiplayer', p: ['Host a room or join a friend’s with a code. Every servant and every master is a seat: fight each other in the Grail War or the Arena, or share a team, one as the servant and one as the master.'], tags: ['Grail War', 'Arena', 'Shared teams'], art: ['shirou', 'caerwyn', 'rin', 'emiya'] }; },
  codex: function () { return { k: 'Rules of the war', h: 'Codex', p: ['How fighting works, what masters and servants can do, how the nights and days run, and every control.'], tags: ['Combat', 'Masters', 'Controls'], art: ['medea', 'emiya', 'rin'] }; },
  settings: function () { return { k: 'Options', h: 'Settings', p: ['Sound, the animated menu background, and whether the title screen greets you.'], tags: [], art: [] }; }
};
function setCur(i, force) {
  var items = document.querySelectorAll('.mmi'); if (!items.length) return; i = (i + items.length) % items.length;
  if (i === SHELL.cur && !force) return; SHELL.cur = i;
  items.forEach(function (el, j) { el.classList.toggle('cur', j === i); });
  var D = MAIN_DESC[items[i].dataset.desc](), el = $('#mainDesc');
  el.innerHTML = (D.art.length ? '<div class="montage">' + D.art.map(function (id) { return thumb(id, 120); }).join('') + '</div>' : '') + '<div class="dk">' + esc(D.k) + '</div><h3>' + esc(D.h) + '</h3>' + D.p.map(function (q) { return '<p>' + esc(q) + '</p>'; }).join('') + (D.tags.length ? '<div class="ln">' + D.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '');
  el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap');
}
/* ---- the featured figure on the character-select pages ---- */
var CIRC_SVG = '<svg viewBox="-100 -100 200 200" fill="none" stroke="currentColor" aria-hidden="true"><circle r="96" stroke-width="1.6"/><circle r="88" stroke-width=".8" stroke-dasharray="2 5"/><circle r="62" stroke-width="1.2"/><path d="M0 -86 L74.5 43 L-74.5 43Z M0 86 L-74.5 -43 L74.5 -43Z" stroke-width="1.2"/>' + (function () { var s = ''; for (var i = 0; i < 24; i++) { var a = i * Math.PI / 12, x0 = Math.cos(a) * 89, y0 = Math.sin(a) * 89, x1 = Math.cos(a) * 95, y1 = Math.sin(a) * 95; s += '<path d="M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' L' + x1.toFixed(1) + ' ' + y1.toFixed(1) + '" stroke-width="2"/>'; } return s; })() + '</svg>';
function featHTML(kind, id) {
  var d = kind === 'm' ? MASTERS[id] : SERV[id], bars, np, col;
  if (!d) return '<div class="aura" style="--c:#8fa3b5"></div><div class="stage2" style="--c:#8fa3b5"><div class="circ">' + CIRC_SVG + '</div><div class="fig" style="font:600 92px var(--f-title);color:#8fa3b5;text-align:center">?</div></div><div class="fcls" style="--c:#8fa3b5">Unknown</div><div class="fname">Random ' + (kind === 'm' ? 'master' : 'servant') + '</div><p class="fbrief">Drawn by fate when the battle starts.</p>';
  col = d.col;
  if (kind === 'm') { var pool = MANA_POOL[d.id] || [80, 1.6]; bars = [['Health', d.hp / 125 * 0.9], ['Mana', pool[0] / 160], ['Regen', pool[1] / 3.2], ['Speed', d.spd / 230], ['Guard', d.guard * 1.4]]; np = ['Signature spell', d.A.np.name, d.A.skill.name]; }
  else { bars = [['Health', (SERV_DUEL[d.id] || d).hp / 215 * 0.88], ['Speed', d.spd / 290], ['Guard', d.guard * 1.04], [d.ranged ? 'Range' : 'Reach', d.ranged ? 1 : d.A.light.reach / 150], ['Chain', d.combo / 5]]; np = ['Noble Phantasm', d.A.np.name, d.A.np.sub || '']; }
  return '<div class="aura" style="--c:' + col + '"></div><div class="stage2" style="--c:' + col + '"><div class="circ">' + CIRC_SVG + '</div><div class="circ r2">' + CIRC_SVG + '</div><div class="fig">' + thumb(d.id, 300) + '</div></div>' +
    '<div class="fcls" style="--c:' + col + '">' + esc(kind === 'm' ? d.type : d.cls) + '</div><div class="fname">' + esc(d.name) + '</div><p class="fbrief">' + esc(d.brief) + '</p>' +
    '<div class="bars" style="--c:' + col + '">' + bars.map(function (b) { return '<div><span>' + b[0] + '</span><i><b style="--v:' + Math.round(clamp(b[1], 0.06, 1) * 100) + '%"></b></i></div>'; }).join('') + '</div>' +
    '<div class="fnp"><small>' + np[0] + '</small><b>' + esc(np[1]) + '</b>' + (np[2] ? '<span>' + esc(np[2]) + '</span>' : '') + '</div>';
}
function setFeat(el, kind, id) { if (!el) return; var k = kind + ':' + id; if (el.dataset.cur === k) return; el.dataset.cur = k; el.innerHTML = featHTML(kind, id); }
function warCardHTML() {
  var s = SERV[CFG.servant], m = MASTERS[CFG.master], home = MASTER_HOME[CFG.master] ? MAPS.city.homes[MASTER_HOME[CFG.master]].name : (CFG.master === 'kiritsugu' ? 'Einzbern Castle or a safehouse' : 'a safehouse');
  return '<div class="pc-k">The contract</div><div class="pc-pair"><div>' + thumb(s.id, 150) + '<b>' + esc(shortName(s.name)) + '</b><small>' + s.cls + '</small></div><div class="pc-x">' + '<svg viewBox="0 0 120 60" aria-hidden="true"><path d="M60 8 C48 20 48 34 60 44 C72 34 72 20 60 8Z M60 44 C44 46 28 40 16 28 C30 34 44 36 54 32 M60 44 C76 46 92 40 104 28 C90 34 76 36 66 32 M60 44 L60 56" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>' + '</div><div>' + thumb(m.id, 150) + '<b>' + esc(m.name) + '</b><small>' + esc(m.type) + '</small></div></div>' +
    '<p>You play the <b>' + CFG.playAs + '</b>. The war begins at ' + esc(home) + ', where ' + esc(m.name.split(' ')[0]) + ' completes the summoning.</p>' +
    '<ul><li>' + CFG.teams + ' teams fight for the Grail</li><li>' + (CFG.nights || 3) + ' nights; at midnight of the last the Grail descends</li><li>Opponents: ' + DIFF[CFG.diff].name + '</li></ul>';
}
/* ---- settings ---- */
function renderSettings() {
  function setv(id, on) { var em = $('#' + id + ' em'); em.textContent = on ? 'On' : 'Off'; em.className = on ? '' : 'off'; }
  setv('setSound', AUD.on); setv('setMotion', !SHELL.calm); setv('setTitle', !SHELL.noTitle);
}
$('#setSound').addEventListener('click', function () { AUD.on = !AUD.on; try { localStorage.setItem('duel2.snd', AUD.on ? '1' : '0'); } catch (e) {} syncSnd(); renderSettings(); uiSnd('uiSelect'); });
$('#setMotion').addEventListener('click', function () { SHELL.calm = !SHELL.calm; document.body.classList.toggle('calm', SHELL.calm); try { localStorage.setItem('fgw.calm', SHELL.calm ? '1' : '0'); } catch (e) {} renderSettings(); uiSnd('uiSelect'); });
$('#setTitle').addEventListener('click', function () { SHELL.noTitle = !SHELL.noTitle; try { localStorage.setItem('fgw.notitle', SHELL.noTitle ? '1' : '0'); } catch (e) {} renderSettings(); uiSnd('uiSelect'); });
/* ---- input ---- */
function leaveTitle() { if (SHELL.scr !== 'title') return; uiSnd('uiTitle'); SHELL.flare = 0.6; showScr(SHELL.after || 'main'); }
$('#scrTitle').addEventListener('click', leaveTitle);
document.addEventListener('click', function (e) {
  var t = e.target, el; if (!t.closest || running) return;
  if ((el = t.closest('.mmi'))) { var items = [].slice.call(document.querySelectorAll('.mmi')); setCur(items.indexOf(el)); uiSnd('uiSelect'); showScr(el.dataset.go); return; }
  if (t.closest('[data-back]')) { back(); return; }
  if ((el = t.closest('[data-step]'))) { var k = SHELL.scr; if (k === 'war' || k === 'arena') { SHELL.page[k] = +el.dataset.step; applySteps(); uiSnd('uiMove'); } return; }
  if ((el = t.closest('[data-tab]'))) { document.querySelectorAll('[data-tab]').forEach(function (b) { var on = b === el; b.setAttribute('aria-selected', on); $('#' + b.dataset.tab).hidden = !on; }); uiSnd('uiMove'); return; }
  if (t.closest('.rt, .mode, .chip, .mapc, .slot')) uiSnd('uiSelect');
});
document.addEventListener('pointerover', function (e) { if (running || !e.target.closest) return; var el = e.target.closest('.mmi'); if (el && SHELL.scr === 'main') { var items = [].slice.call(document.querySelectorAll('.mmi')), i = items.indexOf(el); if (i !== SHELL.cur) { setCur(i); uiSnd('uiMove'); } } });
document.addEventListener('pointermove', function (e) { SHELL.tx = e.clientX / window.innerWidth - 0.5; SHELL.ty = e.clientY / window.innerHeight - 0.5; }, { passive: true });
$('#prevBtn').addEventListener('click', back);
$('#nextBtn').addEventListener('click', function () { var k = SHELL.scr; if (SHELL.page[k] < 2) { SHELL.page[k]++; applySteps(); uiSnd('uiSelect'); window.scrollTo(0, 0); } });
window.addEventListener('keydown', function (e) {
  if (running || $('#setup').style.display === 'none') return;
  var tag = (e.target && e.target.tagName) || ''; if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (SHELL.scr === 'title') { if (!e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); leaveTitle(); } return; }
  if (e.key === 'Escape') { e.preventDefault(); back(); return; }
  if (SHELL.scr === 'main') {
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { e.preventDefault(); setCur(SHELL.cur + 1); uiSnd('uiMove'); document.querySelectorAll('.mmi')[SHELL.cur].focus({ preventScroll: true }); }
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); setCur(SHELL.cur - 1); uiSnd('uiMove'); document.querySelectorAll('.mmi')[SHELL.cur].focus({ preventScroll: true }); }
    else if (e.key === 'Enter' && !(e.target && e.target.closest && e.target.closest('.mmi'))) { e.preventDefault(); document.querySelectorAll('.mmi')[SHELL.cur].click(); }
  }
});
/* ---- beginning a battle: the circle flares, then the war starts ---- */
function beginFlourish(fn) {
  if (SHELL.busy) return; SHELL.busy = true; uiSnd('uiStart'); SHELL.flare = 1.2;
  var f = $('#flare'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  setTimeout(function () { SHELL.busy = false; f.classList.remove('go'); fn(); }, SHELL.calm ? 60 : 520);
}

/* ---- the night behind the menus: sky, moon, Fuyuki's skyline, a turning summoning circle and rising motes ---- */
var BG = { P: 1.6, c: $('#menuBg'), w: 0, h: 0, dpr: 1, stars: [], far: [], near: [], motes: [], cx: 0.5, cy: 0.42, R: 0.36, A: 0.5, t0: performance.now() };
function bgSeed() {
  var r = 12345, R = function () { r = (r * 16807) % 2147483647; return r / 2147483647; };
  BG.stars = []; for (var i = 0; i < 170; i++) BG.stars.push([R(), R() * 0.62, R() * 1.4 + 0.3, R() * 6.28]);
  function sky(arr, n, hmin, hmax, wmin, wmax) { var x = 0; while (x < BG.P - wmax) { var w = wmin + R() * (wmax - wmin), h = hmin + R() * (hmax - hmin); var win = []; for (var k = 0; k < 6; k++) if (R() < 0.5) win.push([R(), R()]); arr.push([x, w, h, R() < 0.18 ? 1 : 0, win]); x += w + R() * 0.006; } arr.end = x; }
  BG.far = []; BG.near = []; sky(BG.far, 0, 0.06, 0.2, 0.02, 0.05); sky(BG.near, 0, 0.03, 0.13, 0.025, 0.07);
  BG.motes = []; for (var j = 0; j < 70; j++) BG.motes.push({ x: R(), y: R(), s: 0.004 + R() * 0.012, r: 0.6 + R() * 1.8, ph: R() * 6.28, red: R() < 0.3 });
}
function bgSize() { var d = Math.min(2, window.devicePixelRatio || 1), w = window.innerWidth, h = window.innerHeight; if (w === BG.w && h === BG.h && d === BG.dpr) return; BG.w = w; BG.h = h; BG.dpr = d; BG.c.width = Math.round(w * d); BG.c.height = Math.round(h * d); }
function bgTarget() { var s = SHELL.scr; return s === 'title' ? [0.5, 0.42, 0.34, 0.55] : s === 'main' ? [0.72, 0.5, 0.4, 0.26] : [0.86, 0.78, 0.5, 0.1]; }
function drawCircleBg(g, x, y, R, t, a) {
  g.save(); g.translate(x, y); g.globalAlpha = a; g.lineCap = 'round';
  var gold = 'rgba(243,213,138,', red = 'rgba(255,84,104,';
  g.shadowColor = 'rgba(255,90,110,.8)'; g.shadowBlur = 18 * a;
  g.strokeStyle = red + '0.9)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.stroke();
  g.strokeStyle = gold + '0.7)'; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, R * 0.9, 0, 6.283); g.stroke(); g.beginPath(); g.arc(0, 0, R * 0.58, 0, 6.283); g.stroke();
  g.save(); g.rotate(t * 0.05); g.strokeStyle = red + '0.8)'; g.lineWidth = 1.4;
  for (var k = 0; k < 2; k++) { g.beginPath(); for (var i = 0; i < 3; i++) { var an = -Math.PI / 2 + i * 2.094 + k * Math.PI; g[i ? 'lineTo' : 'moveTo'](Math.cos(an) * R * 0.88, Math.sin(an) * R * 0.88); } g.closePath(); g.stroke(); }
  g.restore();
  g.save(); g.rotate(-t * 0.03); g.strokeStyle = gold + '0.8)'; g.lineWidth = 2;
  for (var j = 0; j < 36; j++) { var b = j * 6.283 / 36, l = j % 3 ? 0.035 : 0.07; g.beginPath(); g.moveTo(Math.cos(b) * R * 0.91, Math.sin(b) * R * 0.91); g.lineTo(Math.cos(b) * R * (0.91 + l), Math.sin(b) * R * (0.91 + l)); g.stroke(); }
  g.restore();
  g.save(); g.rotate(t * 0.08); g.strokeStyle = gold + '0.6)'; g.lineWidth = 1; g.setLineDash([4, 10]); g.beginPath(); g.arc(0, 0, R * 0.72, 0, 6.283); g.stroke(); g.restore();
  g.restore();
}
function bgFrame(now) {
  requestAnimationFrame(bgFrame);
  if (running || $('#setup').style.display === 'none') return;
  if (SHELL.calm && BG.drawn && !SHELL.flare && BG.drawnScr === SHELL.scr && BG.w === window.innerWidth && BG.h === window.innerHeight) return;
  // the parallax follows the pointer gently, framerate-independent
  var dtb = Math.min(0.1, ((now - (BG.last || now)) / 1000)); BG.last = now; var ease = SHELL.calm ? 1 : 1 - Math.exp(-dtb * 3);
  SHELL.mx += ((SHELL.tx || 0) - SHELL.mx) * ease; SHELL.my += ((SHELL.ty || 0) - SHELL.my) * ease;
  bgSize(); var g = BG.c.getContext('2d'), W = BG.w, H = BG.h, t = SHELL.calm ? 40 : (now - BG.t0) / 1000;
  g.setTransform(BG.dpr, 0, 0, BG.dpr, 0, 0);
  var T = bgTarget(), k = SHELL.calm ? 1 : 0.05; BG.cx += (T[0] - BG.cx) * k; BG.cy += (T[1] - BG.cy) * k; BG.R += (T[2] - BG.R) * k; BG.A += (T[3] - BG.A) * k;
  if (SHELL.flare > 0) SHELL.flare = Math.max(0, SHELL.flare - 0.02);
  var sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#03060d'); sk.addColorStop(0.55, '#0a1428'); sk.addColorStop(0.82, '#1a1430'); sk.addColorStop(1, '#2a1424'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
  BG.stars.forEach(function (s) { g.globalAlpha = 0.35 + 0.45 * Math.abs(Math.sin(t * 0.6 + s[3])); g.fillStyle = '#e8eefc'; g.fillRect(s[0] * W, s[1] * H, s[2], s[2]); }); g.globalAlpha = 1;
  var mx = W * 0.8 + SHELL.mx * -10, my = H * 0.2 + SHELL.my * -6, mr = Math.min(W, H) * 0.075;
  var mg = g.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 4.5); mg.addColorStop(0, 'rgba(240,232,210,.28)'); mg.addColorStop(1, 'rgba(240,232,210,0)'); g.fillStyle = mg; g.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10);
  g.fillStyle = '#f2ecd8'; g.beginPath(); g.arc(mx, my, mr, 0, 6.283); g.fill(); g.fillStyle = 'rgba(180,170,150,.25)'; g.beginPath(); g.arc(mx - mr * 0.3, my - mr * 0.2, mr * 0.22, 0, 6.283); g.arc(mx + mr * 0.25, my + mr * 0.3, mr * 0.14, 0, 6.283); g.fill();
  drawCircleBg(g, BG.cx * W + SHELL.mx * 14, BG.cy * H + SHELL.my * 10, Math.min(W, H) * BG.R * (1 + SHELL.flare * 0.25), t, Math.min(1, BG.A + SHELL.flare * 0.6));
  // the skyline drifts slowly and loops without a seam: each building is drawn at its place in a band BG.P screens wide
  function layer(arr, base, col, par, speed, lit) {
    var P = BG.P, sc = P / arr.end, drift = SHELL.calm ? 0 : t * speed, sh = SHELL.mx * par * 0.01;
    var at = function (b) { var x = ((b[0] * sc - drift) % P + P) % P - 0.1 + sh; return x; };
    g.fillStyle = col;
    arr.forEach(function (b) { var x0 = at(b), w = b[1] * sc * W, h = b[2] * H, y = H * base - h; [x0, x0 - P].forEach(function (xx) { var x = xx * W; if (x > W || x + w < 0) return; g.fillRect(x, y, w + 1, H - y); if (b[3]) g.fillRect(x + w * 0.45, y - h * 0.25, w * 0.1, h * 0.25); }); });
    if (lit) arr.forEach(function (b) { var x0 = at(b), w = b[1] * sc * W, h = b[2] * H, y = H * base - h; [x0, x0 - P].forEach(function (xx) { var x = xx * W; if (x > W || x + w < 0) return; b[4].forEach(function (q, i) { g.fillStyle = i % 3 ? 'rgba(255,196,110,.55)' : 'rgba(255,150,90,.4)'; g.fillRect(x + 4 + q[0] * (w - 10), y + 6 + q[1] * (h - 12), 3, 4); }); }); });
  }
  layer(BG.far, 0.86, '#0d1830', 6, 0.0035, false);
  var mist = g.createLinearGradient(0, H * 0.7, 0, H * 0.9); mist.addColorStop(0, 'rgba(120,80,120,0)'); mist.addColorStop(1, 'rgba(70,40,70,.35)'); g.fillStyle = mist; g.fillRect(0, H * 0.7, W, H * 0.2);
  layer(BG.near, 0.95, '#05080f', 14, 0.008, true);
  g.fillStyle = '#05080f'; g.fillRect(0, H * 0.95, W, H * 0.05 + 2);
  BG.motes.forEach(function (m) {
    var y = ((m.y - t * m.s) % 1 + 1) % 1, x = m.x + Math.sin(t * 0.5 + m.ph) * 0.01, a = Math.sin(y * Math.PI) * 0.8;
    var px = x * W, py = (0.2 + y * 0.8) * H; g.fillStyle = m.red ? '#ff6a7a' : '#f6d690';
    g.globalAlpha = a * 0.18; g.beginPath(); g.arc(px, py, m.r * 3.2, 0, 6.283); g.fill();
    g.globalAlpha = a; g.beginPath(); g.arc(px, py, m.r, 0, 6.283); g.fill();
  });
  g.globalAlpha = 1; g.shadowBlur = 0;
  BG.drawn = true; BG.drawnScr = SHELL.scr;
}
bgSeed(); requestAnimationFrame(bgFrame);
window.addEventListener('resize', function () { BG.drawn = false; });
function shellBoot() {
  var start = (typeof ARENA_ENTRY !== 'undefined') ? 'arena' : 'main';
  if (start === 'arena') SHELL.cur = 1;
  if (SHELL.noTitle) { scrEl('title').classList.remove('show', 'on'); SHELL.scr = 'main'; showScr(start, true); }
  else { scrEl('title').classList.add('show'); requestAnimationFrame(function () { scrEl('title').classList.add('on'); }); SHELL.after = start; }
}
