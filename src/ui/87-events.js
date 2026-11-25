/* ---- events on screen: headlines, the harbor beacon, the sealed school, skeleton familiars, the Grail's light ---- */
FX.event = function (kind, d, msg) {
  if (!G || !G.f[MEI]) return; var my = G.f[MEI].team;
  if (kind === 'harbor') FX.banner('A Challenge at the Harbor', 'A battle cry rings across Fuyuki. Defeat a servant at the docks to win back a Command Seal.');
  else if (kind === 'harborWon') { if (d.team === my) FX.banner('The challenge is won', 'A Command Seal returns to your hand.'); else note(teamName(d.team) + ' won the harbor challenge.'); }
  else if (kind === 'bounty') { var s = G.f.filter(function (f) { return f.team === d.team && !f.def.isMaster; })[0]; if (d.team === my) FX.banner('The Church hunts you', 'Every master can see your team until dawn. Survive.'); else FX.banner('The Church Posts a Bounty', 'On ' + (s ? knownName(s) : 'a servant') + ' of ' + teamName(d.team) + ': revealed until dawn. Defeat it for a Command Seal.'); }
  else if (kind === 'bountyWon') { if (d.team === my) FX.banner('Bounty claimed', 'The Church grants you a Command Seal.'); else note(teamName(d.team) + ' claimed the Church’s bounty.'); }
  else if (kind === 'school') { if (d.culprit === my) FX.banner('Your Rider seals the school', 'The bounded field drains everyone inside and feeds your master. Keep the circles standing.'); else FX.banner('Homurahara Academy Is Sealed', 'A bounded field drains everyone inside, and servants outside cannot enter. Break the three circles.'); FX.snd('marble:ubw', { x: d.x, y: d.y, idx: -1 }); }
  else if (kind === 'circle') note('A circle shatters' + (d.left ? ' · ' + d.left + ' left' : '') + (d.team === my ? ' · mana restored' : ''), d.team === my ? '#ffd36b' : '#e9e4d3');
  else if (kind === 'oath') { if (d.team === my) FX.banner('You broke the truce', 'Every master knows where you are. The city will remember.'); else note(teamName(d.team) + ' broke the truce!', '#f0a85a'); }
  else if (kind === 'banquet') FX.banner('The King’s Banquet', 'Iskandar sets a table at the Einzbern castle. No fighting there. Sit, and learn every guest’s true name, as they learn yours.');
  else if (kind === 'grail') { FX.banner('The Grail Descends', 'On Ryuudou Temple. Its light closes in on the mountain: outside it, you wither.'); FX.snd('bell'); }
  else if (kind === 'end' && msg) note(msg);
};
var EV_COL = { harbor: '#7fc4ee', school: '#e04a5a', bounty: '#f0a85a', grail: '#fff2c4' };
// ground layer: rings, circles, fallen students
function drawEventsGround(g, vr, t) {
  var E = G && G.event; if (!E) return;
  if (E.kind === 'harbor') {
    g.save(); g.strokeStyle = EV_COL.harbor; g.globalAlpha = 0.5; g.lineWidth = 5; g.setLineDash([30, 18]); g.lineDashOffset = -t * 30; g.beginPath(); g.arc(E.x, E.y, E.r, 0, 6.283); g.stroke(); g.setLineDash([]);
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
  if (E.kind === 'grail') {
    g.save(); g.strokeStyle = '#fff2c4'; g.globalAlpha = 0.65; g.lineWidth = 10; g.shadowColor = '#ffd36b'; g.shadowBlur = 20; g.beginPath(); g.arc(E.x, E.y, E.r, 0, 6.283); g.stroke(); g.shadowBlur = 0;
    var gl = g.createRadialGradient(E.x, E.y, 20, E.x, E.y, 420); gl.addColorStop(0, 'rgba(255,242,196,.45)'); gl.addColorStop(1, 'rgba(255,242,196,0)'); g.globalAlpha = 0.7 + 0.2 * Math.sin(t * 2); g.fillStyle = gl; g.fillRect(E.x - 420, E.y - 420, 840, 840); g.restore();
  }
}
// skeleton familiars, drawn with the fighters
function drawMobs(g) {
  if (!G.mobs || !G.mobs.length) return;
  G.mobs.forEach(function (m) {
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
function drawEventsOver(g) {
  var E = G && G.event; if (!E || E.kind !== 'school') return;
  var t = G.time; g.save(); g.globalAlpha = 0.18 + 0.06 * Math.sin(t * 1.5); g.strokeStyle = '#ff5060'; g.lineWidth = 3;
  for (var i = 0; i < 4; i++) { g.beginPath(); g.ellipse(E.x, E.y, E.r * (1 - i * 0.18), E.r * (1 - i * 0.18) * 0.55, 0, Math.PI, 2 * Math.PI); g.stroke(); }
  g.restore();
}
fxExtra = function (name, x, y) { if (name === 'mobDie') { for (var i = 0; i < 8; i++) { var a = i * 0.785; parts.push({ x: x, y: y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, t: 0, life: 0.5, col: '#e8e2cc' }); } return true; } return false; };
// the headline under the clock, and the event on the minimap
function drawEventHud(x, y, mx0, my0, mw, mh) {
  var E = G.event; if (!E) return 0; var c = ctx, MW = MAP.cityW || W, s;
  if (E.kind === 'harbor') s = 'HARBOR CHALLENGE · ' + fmtT(E.dur - E.t);
  else if (E.kind === 'bounty') s = 'CHURCH BOUNTY · ' + teamName(E.team);
  else if (E.kind === 'school') s = 'SCHOOL SEALED · ' + E.circles.filter(function (q) { return q.up; }).length + ' circles · ' + fmtT(E.dur - E.t);
  else if (E.kind === 'grail') s = 'THE GRAIL · RYUUDOU TEMPLE';
  var col = E.kind === 'bounty' ? EV_COL.bounty : EV_COL[E.kind];
  c.font = '700 ' + (VW < 560 ? 13 : 15) + 'px "Barlow Condensed", sans-serif'; c.textAlign = 'right'; var tw = c.measureText(s).width + 16;
  c.fillStyle = 'rgba(8,14,20,.8)'; c.fillRect(x - tw, y - 15, tw, 21); c.fillStyle = col; c.fillText(s, x - 6, y);
  var ex = E.kind === 'bounty' ? (G.f.filter(function (f) { return f.team === E.team && f.st !== 'dead' && !f.def.isMaster; })[0] || E) : E;
  var px = mx0 + ex.x / MW * mw, py = my0 + ex.y / H * mh, p = 0.5 + 0.5 * Math.sin(G.time * 5);
  c.strokeStyle = col; c.lineWidth = 2; c.globalAlpha = 0.6 + 0.4 * p; c.beginPath(); c.arc(px, py, 5 + 3 * p, 0, 6.283); c.stroke();
  if (E.kind === 'grail') { c.save(); c.beginPath(); c.rect(mx0, my0, mw, mh); c.clip(); c.beginPath(); c.arc(px, py, E.r / MW * mw, 0, 6.283); c.stroke(); c.restore(); }
  c.globalAlpha = 1; return 24;
}
function fmtT(s) { s = Math.max(0, s); return Math.floor(s / 60) + ':' + ('0' + Math.floor(s % 60)).slice(-2); }
