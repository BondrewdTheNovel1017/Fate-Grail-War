var MINI = { id: null, c: null };
function miniMap(mw, mh) {
  var key = MAP.id + ':' + mw; if (MINI.id === key) return MINI.c;
  var c = document.createElement('canvas'), sc = 2; c.width = Math.round(mw * sc); c.height = Math.round(mh * sc); var g = c.getContext('2d'), k = c.width / (MAP.cityW || W);
  if (MAP.theme === 'city') {
    g.scale(k, k); g.fillStyle = CITY_PAL.miyama; g.fillRect(0, 0, MAP.cityW, H); g.fillStyle = CITY_PAL.shinto; g.fillRect(6300, 0, MAP.cityW - 6300, H);
    MAP.zones.forEach(function (z) { if (z.kind === 'railbridge') return; g.fillStyle = z.kind === 'water' || z.kind === 'pond' ? '#25507a' : (CITY_PAL[z.kind] || '#333'); g.fillRect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0); });
    MAP.roads.forEach(function (r) { g.fillStyle = r.kind === 'avenue' ? '#8a8e94' : r.kind === 'rail' ? '#6a5a4a' : r.kind === 'path' || r.kind === 'stairs' ? '#6e6a5a' : '#6a6e74'; var hw = Math.max(r.w, 90) / 2; if (r.h) g.fillRect(r.x0, r.y0 - hw, r.x1 - r.x0, hw * 2); else g.fillRect(r.x0 - hw, r.y0, hw * 2, r.y1 - r.y0); });
    g.fillStyle = '#c0392b'; g.fillRect(5620, 2270, 760, 260);
    MAP.b.forEach(function (bk) { if (bk.hide || bk.x > MAP.cityW || bk.k === 'fence') return; g.fillStyle = bk.name ? '#c9c3b0' : '#4a5058'; g.fillRect(bk.x - bk.w / 2, bk.y - bk.h / 2, bk.w, bk.h); });
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(233,228,211,.6)'; g.font = '600 ' + Math.round(9 * sc) + 'px "Barlow Condensed", sans-serif'; g.textAlign = 'center';
    [['TEMPLE', 1500, 200], ['TOHSAKA', 3550, 250], ['MATOU', 5000, 250], ['CHURCH', 1100, 2600], ['ACADEMY', 4050, 2560], ['EMIYA', 2060, 4800], ['BRIDGE', 6000, 2200], ['STATION', 7700, 3400], ['CENTER', 8525, 1450], ['PARK', 10400, 4780], ['HARBOR', 9300, 6830], ['CASTLE', 11000, 540]].forEach(function (lb) { g.fillText(lb[0], lb[1] * k, lb[2] * k); });
    MINI.id = key; MINI.c = c; return c;
  }
  g.scale(k, k); if (MAP.theme === 'fuyuki') { g.fillStyle = '#2d3830'; g.fillRect(0, 0, 4300, H); g.fillStyle = '#30363e'; g.fillRect(4700, 0, W - 4700, H); g.fillStyle = '#25507a'; g.fillRect(4300, 0, 400, 5760); g.fillRect(0, 5760, W, H - 5760); g.fillStyle = '#3c424b'; g.fillRect(4270, 1590, 460, 220); g.fillRect(4270, 4190, 460, 220); }
  MAP.b.forEach(function (bk) { if (bk.k === 'water') return; g.fillStyle = bk.k === 'pond' ? '#25507a' : '#6a7a8a'; g.fillRect(bk.x - bk.w / 2, bk.y - bk.h / 2, bk.w, bk.h); });
  g.fillStyle = '#2f5a33'; MAP.o.forEach(function (p) { g.beginPath(); g.arc(p.x, p.y, Math.max(p.r, 30), 0, 6.283); g.fill(); });
  if (MAP.labels) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(233,228,211,.55)'; g.font = '600 ' + Math.round(9 * sc) + 'px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; MAP.labels.forEach(function (lb) { if (/ACADEMY|CHURCH|STATION|CASTLE|TEMPLE|HARBOR|EMIYA|TOHSAKA|CENTER/.test(lb[0])) g.fillText(lb[0].replace(/^(FUYUKI|EINZBERN|HOMURAHARA|RYUUDOU) /, '').split(' ')[0], lb[1] * k, lb[2] * k); }); }
  MINI.id = key; MINI.c = c; return c;
}
function hud() {
  var a = G.f[MEI]; var rb = $('#restBtn'), rbOn = !!(G.clock && isDay() && !netInMatch() && G.clock.t < G.clock.len - CLOCK.fade); if (rb.hidden === rbOn) rb.hidden = !rbOn;
  if (aimFoe(a) !== hudTarget || a.partner !== hudPartner) buildHud();
  HUD.forEach(function (h) { var f = h.f; if (!f) return;
    h.bhp.style.transform = 'scaleX(' + clamp(f.hp / f.def.hp, 0, 1) + ')'; h.bst.style.transform = 'scaleX(' + clamp(f.sta / 100, 0, 1) + ')'; h.bmo.style.transform = 'scaleX(' + f.mom / 100 + ')';
    h.bm.classList.toggle('full', f.mom >= 100); h.hp.textContent = Math.max(0, Math.ceil(f.hp)); h.c.classList.toggle('dead', f.st === 'dead'); if (h.bma && f.manaMax) { h.bma.style.transform = 'scaleX(' + clamp(f.mana / f.manaMax, 0, 1) + ')'; h.bma.parentNode.classList.toggle('low', f.mana < MANA.npCost); } if (!f.def.isMaster) h.bm.classList.toggle('nomana', f.mom >= 100 && !canNP(f)); });
  var dh = ''; for (var di = 0; di < a.dodgeMax; di++) dh += di < a.dodges ? '\u25CF ' : (di === a.dodges ? (a.dodgeRe > 1.8 ? '\u25D1 ' : '\u25CB ') : '\u25CB '); $('#dpips').textContent = dh;
  document.querySelector('.b[data-b="dodge"]').classList.toggle('off', a.dodges === 0);
  var np = document.querySelector('.b[data-b="np"]'), npReady = a.def.isMaster ? (a.sigCd <= 0 && !(a.silenceT > 0) && canPay(a, MANA.sigCost)) : (a.mom >= 100 && canNP(a)); np.classList.toggle('rdy', npReady); np.classList.toggle('off', !npReady); np.firstChild.textContent = a.def.isMaster ? (a.silenceT > 0 ? 'Burned ' + Math.ceil(a.silenceT) : a.sigCd > 0 ? (a.A.np.short || a.A.np.name.split(' ')[0]) + ' ' + Math.ceil(a.sigCd) : (a.A.np.short || a.A.np.name.split(' ')[0])) : (a.mom >= 100 && !canNP(a) ? 'No mana' : 'NP');
  if (a.def.isMaster) { document.querySelectorAll('.b.seal[data-b]').forEach(function (el) { el.classList.toggle('used', !!a.sealUsed[el.dataset.b.slice(5)] || !a.partner || a.partner.st === 'dead'); }); var sl = sealsLeft(a); $('#sealL').textContent = sl; $('#sealBtn').classList.toggle('used', sl === 0); }
  var ctb = document.querySelector('.b[data-b="contract"]'), cand = contractCandidate(a, CONTRACT_RANGE + 40); ctb.hidden = !cand; pactHud(a); if (cand) ctb.lastChild.textContent = cand.def.isMaster ? shortName(cand.def.name) : shortName(cand.def.name);
  $('#spl').textContent = a.cnc ? 'hidden' : a.def.cls === 'Assassin' && a.cncCd > G.time ? Math.ceil(a.cncCd - G.time) + 's' : a.spirit === 2 ? 'unseen' : a.spirit ? '...' : ''; $('#tgl').textContent = a.lock ? 'locked' : 'auto'; document.querySelector('.b[data-b="target"]').classList.toggle('locked', !!a.lock);
  var sk = document.querySelector('.b[data-b="skill"]'); sk.classList.toggle('off', a.cd > 0 || (a.def.isMaster && a.silenceT > 0));
  var ls = a.A.lightSeq, lt = $('#lightSp'), ht = $('#heavySp');
  document.querySelector('.b[data-b="light"]').classList.toggle('off', a.reloadT > 0); document.querySelector('.b[data-b="heavy"]').classList.toggle('off', a.reloadT > 0);
  if (a.def.mag) { lt.textContent = a.reloadT > 0 ? 'Reloading' : (a.ammo === undefined ? a.def.mag.size : a.ammo) + '/' + a.def.mag.size; ht.textContent = a.reloadT > 0 ? 'Reloading' : 'burst'; } else
  if (a.A.arms) { lt.textContent = a.armT > 0 ? a.A.arms[a.arm].name + ' ' + Math.ceil(a.armT) : 'Fists'; ht.textContent = 'hold'; } else
  if (ls) { var ni = (a.st === 'rec' && a.key === 'light') ? Math.min(a.combo + 1, ls.length - 1) : 0; lt.textContent = ls[ni].tag; ht.textContent = a.A.heavy.tag + ' \u00B7 hold'; } else { lt.textContent = ''; ht.textContent = 'hold'; }
}
function showEnd() {
  endShown = true; var a = G.f[MEI], w = G.winner || a, win = w.team === a.team;
  if (G.mode === 'war' && !G.quick) { $('#endT').textContent = win ? 'The Grail is yours' : 'Defeated'; $('#endT').className = win ? 'win' : 'lose'; $('#endS').textContent = win ? 'Every rival team has fallen in Fuyuki.' : shortName(w.def.name) + '\'s team survives the war.'; var s0 = a.stat; $('#endStats').innerHTML = [['Time', G.time.toFixed(0) + 's'], ['Damage dealt', Math.round(s0.dealt)], ['Damage taken', Math.round(s0.taken)], ['Command Seals left', a.def.isMaster ? sealsLeft(a) : (a.partner ? sealsLeft(a.partner) : 0)]].map(function (r) { return '<span>' + r[0] + '</span><b>' + r[1] + '</b>'; }).join(''); $('#end').classList.add('on'); return; }
  $('#endT').textContent = win ? 'Victory' : 'Defeated'; $('#endT').className = win ? 'win' : 'lose';
  $('#endS').textContent = win ? (G.mode === 'teams' || G.quick ? 'Your team holds ' + MAP.name + '.' : a.def.name + ' is the last one standing on ' + MAP.name + '.') : w.def.name + (G.mode === 'teams' || G.quick ? '\'s team prevails.' : ' prevails.');
  var s = a.stat;
  $('#endStats').innerHTML = [['Time', G.time.toFixed(1) + 's'], ['Damage dealt', Math.round(s.dealt)], ['Damage taken', Math.round(s.taken)], ['Parries', s.parry], ['Dodges', s.dodge], ['Guard breaks suffered', s.gbreak], ['NP interrupted', s.intr]].map(function (r) { return '<span>' + r[0] + '</span><b>' + r[1] + '</b>'; }).join('');
  $('#end').classList.add('on');
}
function frame(now) {
  requestAnimationFrame(frame);
  if (!running) return;
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!paused) {
    acc += dt * speedMul * (slowT > 0 ? 0.4 : 1); if (slowT > 0) slowT -= dt;
    if (INTRO) { acc = 0; introTick(dt); }
    else if (NET.mirror) { acc = 0; netClientFrame(dt); }
    else {
    var f = G.f[MEI], mv = readMove(); if (!(f.turnT > G.time)) { f.inp.mx = mv[0]; f.inp.my = mv[1]; }
    var guard = 0; while (acc >= STEP && guard++ < 6) { netApplyInputs(); simStep(STEP); acc -= STEP; }
    netHostSend(now);
    }
    V.forEach(function (v) { v.t += dt; }); V = V.filter(function (v) { return v.t < v.life; });
    puffs.forEach(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92; }); puffs = puffs.filter(function (p) { return p.t < p.life; });
    ghosts.forEach(function (gh) { gh.t += dt; }); ghosts = ghosts.filter(function (gh) { return gh.t < gh.life; });
    flashes.forEach(function (fl) { fl.t += dt; }); flashes = flashes.filter(function (fl) { return fl.t < fl.life; });
    cracks.forEach(function (ck) { ck.t += dt; }); cracks = cracks.filter(function (ck) { return ck.t < ck.life; });
    if (band.t > 0) band.t -= dt;
    ghostT -= dt; if (ghostT <= 0) { ghostT = 0.035; G.f.forEach(function (ff) { var a2 = ff.act; if (ff.st === 'dodge' || (ff.st === 'act' && a2 && (a2.kind === 'charge' || (ff.key === 'np' && a2.kind === 'pulses' && ff.t < 0.25))) || (ff.st === 'wind' && a2 && a2.hop) || (ff.st === 'act' && ff.key === 'skill' && a2 && a2.lunge > 100)) ghosts.push({ x: ff.x, y: ff.y, face: ff.face, id: ff.def.id, t: 0, life: 0.28 }); }); }
    G.f.forEach(function (ff) { if (ff.st === 'wind' && ff.key === 'np' && Math.random() < 0.7) parts.push({ x: ff.x + (Math.random() - 0.5) * 44, y: ff.y + (Math.random() - 0.5) * 44, vx: (Math.random() - 0.5) * 20, vy: -50 - Math.random() * 60, t: 0, life: 0.55, col: ff.def.col }); });
    parts.forEach(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; }); parts = parts.filter(function (p) { return p.t < p.life; });
    texts.forEach(function (t) { t.t += dt; }); texts = texts.filter(function (t) { return t.t < 0.9; });
    shake *= Math.pow(0.002, dt);
    if (G.over && !endShown && G.time > 0) { if (!G._endAt) G._endAt = now + 1100; if (now >= G._endAt) showEnd(); }
  }
  draw(); hud();
}
