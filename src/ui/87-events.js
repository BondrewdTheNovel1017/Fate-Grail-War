/* ---- events on screen: headlines, the harbor beacon, the sealed school, skeleton familiars, the Grail's light ---- */
// event perks: read out in full when earned; shown as chips under the HUD with the time left (tap one to read it again)
var PERKT = 0;
function perkHud() {
  if (!G || G.mode !== 'war' || performance.now() < PERKT) return; PERKT = performance.now() + 500;
  var el = $('#perks'); if (!el) return; var me = G.f[MEI], P = (G.perks && G.perks[me.team]) || {}, live = Object.keys(P).filter(function (id) { return PERKS[id] && P[id] > G.time; });
  el.hidden = !live.length; if (!live.length) { el.innerHTML = ''; return; }
  var hb = $('#hud').getBoundingClientRect(), db = $('#duel').getBoundingClientRect(); el.style.top = Math.round(hb.bottom - db.top + 6) + 'px';
  el.innerHTML = live.map(function (id) { var k = PERKS[id], left = Math.ceil(P[id] - G.time); return '<button type="button" class="pk" data-perk="' + id + '" style="--pk:' + k.col + '" title="' + esc(k.desc) + '"><b>' + k.icon + '</b>' + esc(k.name) + ' <i>' + (left >= 60 ? Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2) : left + 's') + '</i></button>'; }).join('');
}
document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-perk]'); if (b && PERKS[b.dataset.perk]) FX.banner(PERKS[b.dataset.perk].icon + ' ' + PERKS[b.dataset.perk].name, PERKS[b.dataset.perk].desc); });
FX.event = function (kind, d, msg) {
  if (!G || !G.f[MEI]) return; var my = G.f[MEI].team, mine = d && d.team === my;
  if (kind === 'perk') { var pk = PERKS[d.id]; if (pk && mine) { FX.banner(pk.icon + ' ' + pk.name, pk.desc); FX.snd('chant', G.f[MEI]); } else if (pk) note(teamName(d.team) + ' earned ' + pk.name + '.', pk.col); PERKT = 0; return; }
  if (kind === 'challenge') { var hn = knownName(d.host); if (mine) FX.banner('You issue a challenge', 'Your servant’s battle cry rings across Fuyuki. Hold the docks: if no one dares answer, a Command Seal is yours.'); else FX.banner('A Challenge at the Harbor', hn + ' of ' + teamName(d.team) + ' calls every servant to the docks. Answer it, or let it win by default.'); }
  else if (kind === 'accepted') note('The challenge is answered at the docks!', '#7fc4ee');
  else if (kind === 'unanswered') { if (mine) FX.banner('No one dared', 'The challenge stands unanswered. A Command Seal returns to you.'); else note(teamName(d.team) + '’s challenge went unanswered: they regain a Command Seal.'); }
  else if (kind === 'challengeWon') { if (mine) FX.banner('The challenge is won', 'A Command Seal returns to your hand.'); else note(teamName(d.team) + ' won the challenge at the docks.'); }
  else if (kind === 'bounty') { var s0 = G.f.filter(function (f) { return f.team === d.team && !f.def.isMaster; })[0]; if (mine) FX.banner('The Church hunts you', 'Every master can see your team until dawn. Survive.'); else FX.banner('The Church Posts a Bounty', 'On ' + (s0 ? knownName(s0) : 'a servant') + ' of ' + teamName(d.team) + ': revealed until dawn. Defeat it for a Command Seal.'); }
  else if (kind === 'bountyWon') { if (mine) FX.banner('Bounty claimed', 'The Church grants you a Command Seal.'); else note(teamName(d.team) + ' claimed the Church’s bounty.'); }
  else if (kind === 'horror') { if (d.culprit === my) FX.banner('Your Caster’s horror rises', 'It feeds your master and will not touch your team. Keep the others busy until dawn.'); else FX.banner('A Horror Rises from the River', 'A giant familiar climbs the Mion toward the Fuyuki Bridge. Every team near it is in truce. Bring it down before dawn, or the whole city sees it.'); FX.snd('npcast', { x: 6000, y: 3000, idx: -1, def: SERV.gilles }, SERV.gilles.A.np); }
  else if (kind === 'horrorDown') { if (d.team === my) FX.banner('The horror falls', 'Your blows did the most. A Command Seal, and the city’s gratitude.'); else FX.banner('The horror falls', (d.team >= 0 ? teamName(d.team) + ' dealt the final share.' : 'The river is quiet again.')); }
  else if (kind === 'horrorDawn') FX.banner('Dawn finds the horror still standing', 'The whole city saw it. Every team is under suspicion.');
  else if (kind === 'falsedeath') { if (mine) FX.banner('The world believes you dead', 'Your servant fell before witnesses, or seemed to. Until dawn, no one knows you are alive.'); else FX.banner(d.f.def.cls + ' has fallen', 'Struck down before witnesses at ' + teamName(d.team).replace('’s team', '’s door') + '. Or so it seems.'); }
  else if (kind === 'berserk') { if (mine) FX.banner('Your servant breaks loose', 'It hits harder and burns itself out, and it will not heed your orders. Everyone can see it.'); else FX.banner('Berserker Unchained', knownName(d.f) + ' of ' + teamName(d.team) + ' has broken its master’s control. Everyone can see it.'); }
  else if (kind === 'school') { if (d.culprit === my) FX.banner('Your Rider seals the school', 'The bounded field drains everyone inside and feeds your master. Keep the circles standing.'); else FX.banner('Homurahara Academy Is Sealed', 'A blood-red bounded field drains everyone inside. No one can enter or leave until the three circles are broken.'); FX.snd('marble:ubw', { x: d.x, y: d.y, idx: -1 }); }
  else if (kind === 'circle') note('A circle shatters' + (d.left ? ' · ' + d.left + ' left' : '') + (d.team === my ? ' · mana restored' : ''), d.team === my ? '#ffd36b' : '#e9e4d3');
  else if (kind === 'oath') { if (mine) FX.banner('You broke the truce', 'Every master knows where you are. The city will remember.'); else note(teamName(d.team) + ' broke the truce!', '#f0a85a'); }
  else if (kind === 'banquet') FX.banner('The King’s Banquet', knownName(d.f) + ' sets a table at the Einzbern castle. No fighting there. Sit, and learn every guest’s true name, as they learn yours.');
  else if (kind === 'summons') FX.banner('The Overseer’s Summons', 'Every master is called to Fuyuki Church under truce. Those who come leave with a clean name and a secret.');
  else if (kind === 'grail') { var gk = G.grailKnown && G.grailKnown[my]; FX.banner(d.corrupt ? 'The Grail Descends, Black' : 'The Grail Descends', 'On ' + d.name + '. ' + (d.corrupt ? 'Mud wells up inside its ring, and the servants near its heart go mad.' : 'Its light closes in; at its heart, wounds close.') + ' Outside it, you wither.'); FX.snd('bell'); }
  else if (kind === 'quiet') note('A still night. No word from the Church, no cry from the docks.', '#b8c8f0');
  else if (kind === 'end' && msg) note(msg);
};
var EV_COL = { challenge: '#7fc4ee', school: '#e04a5a', bounty: '#f0a85a', grail: '#fff2c4', horror: '#b06ad0', falsedeath: '#9aa7b3', berserk: '#ff4a4a' };
// ground layer: rings, circles, fallen students
function drawEventsGround(g, vr, t) {
  var E = G && G.event; if (!E) return;
  if (E.kind === 'challenge') {
    g.save(); g.strokeStyle = EV_COL.challenge; g.globalAlpha = 0.5; g.lineWidth = 5; g.setLineDash([30, 18]); g.lineDashOffset = -t * 30; g.beginPath(); g.arc(E.x, E.y, E.r, 0, 6.283); g.stroke(); g.setLineDash([]);
    var lg = g.createRadialGradient(E.x, E.y, 10, E.x, E.y, 220); lg.addColorStop(0, 'rgba(127,196,238,.35)'); lg.addColorStop(1, 'rgba(127,196,238,0)'); g.globalAlpha = 0.6 + 0.3 * Math.sin(t * 3); g.fillStyle = lg; g.fillRect(E.x - 220, E.y - 220, 440, 440); g.restore();
  }
  if (E.kind === 'school') {
    g.save(); var p = 0.5 + 0.5 * Math.sin(t * 2);
    g.fillStyle = 'rgba(160,20,30,' + (0.10 + 0.04 * p) + ')'; g.beginPath(); g.arc(E.x, E.y, E.r, 0, 6.283); g.fill();
    g.strokeStyle = '#c0202e'; g.lineWidth = 7; g.globalAlpha = 0.8; g.beginPath(); g.arc(E.x, E.y, E.r, 0, 6.283); g.stroke();
    g.globalAlpha = 1;
    E.students.forEach(function (s) { g.save(); g.translate(s.x, s.y); g.rotate(s.down * 1.4 + s.id); g.globalAlpha = 0.85; g.fillStyle = s.id % 2 ? '#3a4a6a' : '#d8d4c8'; g.beginPath(); g.ellipse(0, 0, 6 + s.down * 4, 10 - s.down * 2, 0, 0, 6.283); g.fill(); g.fillStyle = '#2a2018'; g.beginPath(); g.arc(s.down * 9, 0, 4.5, 0, 6.283); g.fill(); g.restore(); });
    var my = G.f[MEI].team;
    E.circles.forEach(function (c) {
      if (!c.up) { g.globalAlpha = 0.25; runeCircle(g, c.x, c.y, c.r, '#7a5a5a', 0, 0.3); g.globalAlpha = 1; return; }
      runeCircle(g, c.x, c.y, c.r, '#ff3a4a', t * 0.8, 0.9);
      var pr = Math.min(1, (c.prog[my] || 0) / EVT.school.need); if (pr > 0) { g.strokeStyle = '#ffd36b'; g.lineWidth = 8; g.beginPath(); g.arc(c.x, c.y, c.r + 14, -1.571, -1.571 + 6.283 * pr); g.stroke(); }
    });
    g.restore();
  }
  if (E.kind === 'horror') drawHorror(g, E, t);
  if (E.kind === 'grail') drawGrailHeart(g, E, t);
  if (E.kind === 'grail' && E.corrupt) {
    g.save(); g.strokeStyle = '#3a0a2a'; g.globalAlpha = 0.85; g.lineWidth = 16; g.beginPath(); g.arc(E.x, E.y, E.r, 0, 6.283); g.stroke(); g.strokeStyle = '#c0203a'; g.lineWidth = 4; g.stroke();
    var cl = g.createRadialGradient(E.x, E.y, 20, E.x, E.y, 450); cl.addColorStop(0, 'rgba(20,0,10,.6)'); cl.addColorStop(1, 'rgba(60,0,20,0)'); g.globalAlpha = 0.8; g.fillStyle = cl; g.fillRect(E.x - 450, E.y - 450, 900, 900);
    E.pools.forEach(function (p) { var on = p.t >= 1.2, fade = Math.min(1, (7.2 - p.t) / 0.8); g.globalAlpha = (on ? 0.85 : 0.3 + 0.3 * Math.sin(p.t * 20)) * fade; g.fillStyle = on ? '#12050c' : 'rgba(192,32,58,.5)'; g.beginPath(); g.arc(p.x, p.y, p.r * (on ? 1 : p.t / 1.2), 0, 6.283); g.fill(); if (on) { g.strokeStyle = '#c0203a'; g.lineWidth = 3; g.stroke(); for (var b = 0; b < 4; b++) { var ba = b * 1.57 + p.t; g.beginPath(); g.arc(p.x + Math.cos(ba) * p.r * 0.5, p.y + Math.sin(ba) * p.r * 0.5, 8 + 4 * Math.sin(p.t * 6 + b), 0, 6.283); g.stroke(); } } });
    g.restore();
  }
  if (E.kind === 'grail' && !E.corrupt) {
    g.save(); g.strokeStyle = '#fff2c4'; g.globalAlpha = 0.65; g.lineWidth = 10; g.shadowColor = '#ffd36b'; g.shadowBlur = 20; g.beginPath(); g.arc(E.x, E.y, E.r, 0, 6.283); g.stroke(); g.shadowBlur = 0;
    var gl = g.createRadialGradient(E.x, E.y, 20, E.x, E.y, 420); gl.addColorStop(0, 'rgba(255,242,196,.45)'); gl.addColorStop(1, 'rgba(255,242,196,0)'); g.globalAlpha = 0.7 + 0.2 * Math.sin(t * 2); g.fillStyle = gl; g.fillRect(E.x - 420, E.y - 420, 840, 840); g.restore();
  }
}
// skeleton familiars, drawn with the fighters
function drawMobs(g) {
  if (!G.mobs || !G.mobs.length) return;
  G.mobs.forEach(function (m) {
    if (m.exec) { if (!m.dead) drawExec(g, m); return; }
    var sw = G.time - (m.swing || -9) < 0.25, a = m.face || 0, bob = Math.sin(m.t * 10) * 1.5;
    g.save(); g.translate(m.x, m.y); g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(3, 5, 13, 9, 0, 0, 6.283); g.fill(); g.rotate(a);
    g.strokeStyle = '#d8d2bc'; g.lineWidth = 3; g.beginPath(); for (var r = -8; r <= 8; r += 5) { g.moveTo(-4, r); g.lineTo(4, r); } g.stroke();
    g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, -9); g.lineTo(sw ? 20 : 10, -12 + bob); g.moveTo(0, 9); g.lineTo(sw ? 14 : 10, 12 - bob); g.stroke();
    g.fillStyle = '#e8e2cc'; g.strokeStyle = '#2a2620'; g.lineWidth = 1.5; g.beginPath(); g.arc(3, 0, 7, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#ff3a4a'; g.beginPath(); g.arc(7, -2.5, 1.6, 0, 6.283); g.arc(7, 2.5, 1.6, 0, 6.283); g.fill();
    g.restore();
  });
}
// the barrier's dome, above everything
// on the city map: a blood-red dome over Homurahara Academy and its yard while the seal holds
function drawSchoolDome(g, t) {
  var cx = 4050, cy = 2760, rx = 840, ry = 330, pl = 0.5 + 0.5 * Math.sin(t * 1.8);
  g.save();
  var rg = g.createRadialGradient(cx, cy, 40, cx, cy, rx); rg.addColorStop(0, 'rgba(150,10,24,' + (0.10 + 0.04 * pl) + ')'); rg.addColorStop(0.8, 'rgba(170,16,30,' + (0.20 + 0.05 * pl) + ')'); rg.addColorStop(1, 'rgba(200,24,40,' + (0.34 + 0.08 * pl) + ')');
  g.fillStyle = rg; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 6.283); g.fill();
  // the field's lattice: curved meridians and rings, slowly turning
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 6.283); g.clip();
  g.strokeStyle = 'rgba(255,70,80,' + (0.22 + 0.08 * pl) + ')'; g.lineWidth = 2;
  for (var i = -5; i <= 5; i++) { var k = i / 5.5 + Math.sin(t * 0.3) * 0.04; g.beginPath(); g.ellipse(cx, cy, Math.abs(k) * rx + 1, ry, 0, 0, 6.283); g.stroke(); }
  for (var j = 1; j <= 3; j++) { g.beginPath(); g.ellipse(cx, cy, rx * j / 4, ry * j / 4, 0, 0, 6.283); g.stroke(); }
  g.restore();
  g.save(); g.strokeStyle = 'rgba(255,60,72,' + (0.75 + 0.2 * pl) + ')'; g.lineWidth = 6; g.shadowColor = '#ff2030'; g.shadowBlur = 18; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 6.283); g.stroke(); g.restore();
}
function drawEventsOver(g) {
  var E = G && G.event; if (!E || E.kind !== 'school') return;
  var t = G.time; g.save(); g.globalAlpha = 0.18 + 0.06 * Math.sin(t * 1.5); g.strokeStyle = '#ff5060'; g.lineWidth = 3;
  for (var i = 0; i < 4; i++) { g.beginPath(); g.ellipse(E.x, E.y, E.r * (1 - i * 0.18), E.r * (1 - i * 0.18) * 0.55, 0, Math.PI, 2 * Math.PI); g.stroke(); }
  g.restore();
  drawSchoolDome(g, t);
}
fxExtra = function (name, x, y) { if (name === 'bossDie') { for (var j = 0; j < 40; j++) { var a2 = j * 0.157; parts.push({ x: x + Math.cos(a2) * 60, y: y + Math.sin(a2) * 60, vx: Math.cos(a2) * 260, vy: Math.sin(a2) * 260, t: 0, life: 1.0, col: j % 2 ? '#6a2a7a' : '#2a0a2a' }); } shake = Math.max(shake, 16); return true; }
  if (name === 'mobDie') { for (var i = 0; i < 8; i++) { var a = i * 0.785; parts.push({ x: x, y: y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, t: 0, life: 0.5, col: '#e8e2cc' }); } return true; } return false; };
// the headline under the clock, and the event on the minimap
function drawEventHud(x, y, mx0, my0, mw, mh) {
  banquetChatter(); grailHint(mx0, my0, mw, mh);
  var E = G.event; if (!E) return 0; var c = ctx, MW = MAP.cityW || W, s;
  if (E.kind === 'challenge') s = (E.accepted ? 'CHALLENGE ANSWERED' : 'CHALLENGE AT THE DOCKS') + ' · ' + fmtT(E.dur - E.t);
  else if (E.kind === 'bounty') s = 'CHURCH BOUNTY · ' + teamName(E.team);
  else if (E.kind === 'school') s = 'SCHOOL SEALED · ' + E.circles.filter(function (q) { return q.up; }).length + ' circles · ' + fmtT(E.dur - E.t);
  else if (E.kind === 'horror') s = 'HORROR IN THE RIVER · ' + Math.ceil(100 * Math.max(0, E.boss.hp) / E.boss.max) + '%';
  else if (E.kind === 'falsedeath') s = E.team === G.f[MEI].team ? 'BELIEVED DEAD · UNTIL DAWN' : E.f.def.cls.toUpperCase() + ' HAS FALLEN';
  else if (E.kind === 'berserk') s = 'BERSERKER UNCHAINED · ' + fmtT(E.dur - E.t);
  else if (event2Hud(E)) s = event2Hud(E);
  else if (E.kind === 'grail') s = 'THE GRAIL' + (E.corrupt ? ', BLACK' : '') + ' · ' + E.name.replace(/^the /, '').toUpperCase();
  var col = EV_COL[E.kind] || '#e9e4d3';
  c.font = '700 ' + (VW < 560 ? 13 : 15) + 'px "Barlow Condensed", sans-serif'; c.textAlign = 'right'; var tw = c.measureText(s).width + 16;
  c.fillStyle = 'rgba(8,14,20,.8)'; c.fillRect(x - tw, y - 15, tw, 21); c.fillStyle = col; c.fillText(s, x - 6, y);
  var ex = E.kind === 'bounty' ? (G.f.filter(function (f) { return f.team === E.team && f.st !== 'dead' && !f.def.isMaster; })[0] || E) : E.kind === 'horror' ? E.boss : E.kind === 'berserk' ? E.f : E; if (E.kind === 'grail' && E.cavern) ex = { x: 640, y: 1885 }; if (ex.x === undefined || E.kind === 'falsedeath') return 24;
  var px = mx0 + ex.x / MW * mw, py = my0 + ex.y / H * mh, p = 0.5 + 0.5 * Math.sin(G.time * 5);
  c.strokeStyle = col; c.lineWidth = 2; c.globalAlpha = 0.6 + 0.4 * p; c.beginPath(); c.arc(px, py, 5 + 3 * p, 0, 6.283); c.stroke();
  if (E.kind === 'grail') { c.save(); c.beginPath(); c.rect(mx0, my0, mw, mh); c.clip(); c.beginPath(); c.arc(px, py, E.r / MW * mw, 0, 6.283); c.stroke(); c.restore(); }
  c.globalAlpha = 1; return 24;
}
function fmtT(s) { s = Math.max(0, s); return Math.floor(s / 60) + ':' + ('0' + Math.floor(s % 60)).slice(-2); }

// the horror: a mass of dark flesh and tentacles in the river, slamming whoever stands in reach
function drawHorror(g, E, t) {
  var m = E.boss; if (m.dead) return;
  g.save();
  m.slams.forEach(function (s) { var p = Math.min(1, s.t / 0.9); g.globalAlpha = s.hit ? Math.max(0, 1 - (s.t - 0.9) / 0.5) : 0.25 + 0.5 * p; g.strokeStyle = '#ff4a6a'; g.lineWidth = 4; g.beginPath(); g.arc(s.x, s.y, EVT.horror.slamR, 0, 6.283); g.stroke(); g.fillStyle = 'rgba(176,106,208,' + (s.hit ? 0.5 : 0.15 * p) + ')'; g.fill(); if (!s.hit) { g.strokeStyle = '#4a1a5a'; g.lineWidth = 18; g.beginPath(); g.moveTo(m.x, m.y); g.quadraticCurveTo((m.x + s.x) / 2 + 60 * Math.sin(t * 4), (m.y + s.y) / 2, m.x + (s.x - m.x) * p, m.y + (s.y - m.y) * p); g.stroke(); } });
  g.globalAlpha = 1;
  for (var i = 0; i < 9; i++) { var a = i * 0.698 + Math.sin(t * 1.3 + i) * 0.3, L = m.r + 70 + 30 * Math.sin(t * 2 + i * 1.7); g.strokeStyle = i % 2 ? '#3a1248' : '#5a2268'; g.lineWidth = 16 - (i % 3) * 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(m.x, m.y); g.quadraticCurveTo(m.x + Math.cos(a + 0.4) * L * 0.6, m.y + Math.sin(a + 0.4) * L * 0.6, m.x + Math.cos(a) * L, m.y + Math.sin(a) * L); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(m.x + 14, m.y + 20, m.r, m.r * 0.8, 0, 0, 6.283); g.fill();
  var bg = g.createRadialGradient(m.x - 20, m.y - 20, 10, m.x, m.y, m.r); bg.addColorStop(0, '#7a3a8a'); bg.addColorStop(1, '#2a0a30'); g.fillStyle = bg; g.beginPath(); g.ellipse(m.x, m.y, m.r, m.r * 0.85, 0, 0, 6.283); g.fill(); g.strokeStyle = '#0b0610'; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#ffd36b'; for (var e = 0; e < 5; e++) { var ea = e * 1.25 + 0.3; g.beginPath(); g.arc(m.x + Math.cos(ea) * m.r * 0.5, m.y + Math.sin(ea) * m.r * 0.4, 6 + (e % 2) * 3, 0, 6.283); g.fill(); }
  var w = 220, hp = Math.max(0, m.hp / m.max); g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(m.x - w / 2, m.y - m.r - 40, w, 12); g.fillStyle = '#b06ad0'; g.fillRect(m.x - w / 2, m.y - m.r - 40, w * hp, 12); g.strokeStyle = '#0b0610'; g.lineWidth = 2; g.strokeRect(m.x - w / 2, m.y - m.r - 40, w, 12);
  g.restore();
}
// a servant unchained burns red
function drawRampAura(g, f) { if (!(f.rampT > G.time) || f.st === 'dead') return; var p = 0.5 + 0.5 * Math.sin(G.time * 10); g.save(); g.globalAlpha = 0.35 + 0.3 * p; var rg = g.createRadialGradient(f.x, f.y, 10, f.x, f.y, 70); rg.addColorStop(0, 'rgba(255,40,40,.6)'); rg.addColorStop(1, 'rgba(255,40,40,0)'); g.fillStyle = rg; g.fillRect(f.x - 70, f.y - 70, 140, 140); g.restore(); }
/* ---- talk at the King's table: kings boast and needle each other while the wine goes round ---- */
var BANQ = {
  iskandar: ['Drink! A king who cannot drink is no king at all.', 'Tell me, what would you wish upon the Grail?', 'Join my army, and we will conquer the world together!'],
  gilgamesh: ['You drink from my treasury and call it hospitality.', 'Every treasure in this world was mine first.', 'A king who seeks to save others is no king.'],
  caerwyn: ['A king lives for the people, not for themself.', 'I would undo the ruin of my country.', 'I did not come here to drink.'],
  richard: ['A fine vintage! Though I prefer a crusade.', 'A king rides at the head of the charge!'],
  leonidas: ['Three hundred stood at the pass. Wine is for after.', 'A king holds the line so the people may live.'],
  heracles: ['...'], lancelot: ['...'],
  medea: ['How tiresome. Men and their wine.'], kojirou: ['A fine moon for wine. I shall have another.'], hassan: ['...'], cu: ['Not bad! Pour me another.'], emiya: ['I’ll pass. Someone has to stay sober.'], atalanta: ['I am not one for kings or their wine.'], diarmuid: ['To the honor of the table.'], medusa: ['...I will watch the door.'], gilles: ['Oh, the glory of it all!']
};
var BANQ_M = ['Is this... really a good idea?', 'Don’t let your guard down.', 'They’re all servants. Every one of them.', 'Just... don’t start a fight here.'];
var banqT = 0, BANQ_SAID = null, BANQ_KEY = null;
function banqUsed(k) { var key = k.x + ':' + k.y + ':' + (G.clock ? G.clock.n : 0); if (BANQ_KEY !== key) { BANQ_KEY = key; BANQ_SAID = {}; } return BANQ_SAID; }
function banquetChatter() {
  perkHud();
  if (!G.tasks || !isDay() || G.time < banqT) return; var k = G.tasks.filter(function (q) { return q.kind === 'banquet'; })[0]; if (!k) return;
  var here = G.f.filter(function (f) { return f.st !== 'dead' && Math.hypot(f.x - k.x, f.y - k.y) < k.r + 120 && FX.near(f.x, f.y); });
  if (here.filter(function (f) { return !f.def.isMaster; }).length < 2) return; // talk starts once two servants are at the table
  banqT = G.time + 3.5 + Math.random() * 2.5;
  // nobody says the same line twice at one banquet: pick a speaker who still has something new to say
  var said = banqUsed(k), opts = [];
  here.forEach(function (f) { var pool = f.def.isMaster ? BANQ_M : (BANQ[f.def.id] || ['To the Grail.']); pool.forEach(function (l) { if (!said[f.idx + '|' + l]) opts.push([f, l]); }); });
  if (!opts.length) return;
  var host = opts.filter(function (o) { return o[0] === k.hostF; }), pick = host.length && Math.random() < 0.35 ? host[Math.floor(Math.random() * host.length)] : opts[Math.floor(Math.random() * opts.length)];
  said[pick[0].idx + '|' + pick[1]] = 1; showBubble(pick[0], pick[1], 3.2);
}
function grailHint(mx0, my0, mw, mh) { var my = G.f[MEI].team; if (!G.grailKnown || !G.grailKnown[my] || !G.grailSite || (G.event && G.event.kind === 'grail')) return; var MW = MAP.cityW || W, px = mx0 + G.grailSite.x / MW * mw, py = my0 + G.grailSite.y / H * mh, c = ctx; c.save(); c.strokeStyle = '#fff2c4'; c.lineWidth = 1.5; c.globalAlpha = 0.6 + 0.3 * Math.sin(G.time * 2); c.beginPath(); c.moveTo(px, py - 6); c.lineTo(px + 5, py); c.lineTo(px, py + 6); c.lineTo(px - 5, py); c.closePath(); c.stroke(); c.restore(); }
// the Grail itself at the center: a white sun, or a black one ringed in red
function drawGrailHeart(g, E, t) {
  g.save(); var R = 70 + 6 * Math.sin(t * 2);
  var hg = g.createRadialGradient(E.x, E.y, 10, E.x, E.y, R * 4); hg.addColorStop(0, E.corrupt ? 'rgba(160,10,40,.55)' : 'rgba(255,246,210,.6)'); hg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = hg; g.fillRect(E.x - R * 4, E.y - R * 4, R * 8, R * 8);
  if (E.corrupt) { g.strokeStyle = '#2a0614'; g.lineCap = 'round'; for (var i = 0; i < 10; i++) { var a = i * 0.628 + Math.sin(t + i) * 0.4, L = R * (2 + 0.8 * Math.sin(t * 1.7 + i)); g.lineWidth = 10; g.beginPath(); g.moveTo(E.x, E.y); g.quadraticCurveTo(E.x + Math.cos(a + 0.5) * L * 0.6, E.y + Math.sin(a + 0.5) * L * 0.6, E.x + Math.cos(a) * L, E.y + Math.sin(a) * L); g.stroke(); } }
  g.fillStyle = E.corrupt ? '#0a0206' : '#fffaf0'; g.beginPath(); g.arc(E.x, E.y, R, 0, 6.283); g.fill();
  g.strokeStyle = E.corrupt ? '#e0203a' : '#ffd36b'; g.lineWidth = 6; g.stroke();
  g.restore();
}
