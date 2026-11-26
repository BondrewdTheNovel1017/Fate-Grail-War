/* ---- nights and days on screen: darkness with pools of light, civilians, the clock, exposure, Church notices ---- */
var NIGHT = { c: null }, NOTES = [];
var CIV_SKIN = ['#e8c4a6', '#d9a98a', '#c58d62', '#f0d6c2', '#a8714c', '#eed6c2'];
var CIV_SHIRT = ['#c9563a', '#3a6ab8', '#e0c060', '#5a9a5a', '#d8d4c8', '#7a4ab0', '#2f3138', '#e08a9a', '#4a8a9a', '#a87a4a'], CIV_HAIR = ['#1a1614', '#2a2018', '#4a3020', '#6a4a2a', '#1c1c22', '#8a7a6a'];
function note(s, col) { NOTES.push({ s: s, col: col || '#e9e4d3', t0: performance.now() }); if (NOTES.length > 3) NOTES.shift(); }
function teamName(t) { var m = G.f.filter(function (f) { return f.team === t && f.def.isMaster; })[0] || G.f.filter(function (f) { return f.team === t; })[0]; return m ? shortName(m.def.name) + '’s team' : 'a team'; }
FX.phase = function (kind, n, fin) {
  if (kind === 'day') FX.banner('Day ' + n, 'Morning in Fuyuki. Crowds fill the streets: rest at home, or fight where nobody sees.');
  else if (fin) FX.banner('The Final Night', 'The Grail is close. Every master can feel where the others are.');
  else FX.banner('Night ' + n, 'The streets empty. Hunt, or hide.');
  FX.snd('bell');
};
FX.church = function (kind, team) {
  var mine = team === G.f[MEI].team, who = mine ? 'your team' : teamName(team);
  if (kind === 'rumor') note(mine ? 'Rumors spread about strange events near you. Rivals can guess where you are.' : 'Rumors of strange sightings point to ' + who + '. Marked on the map.', mine ? '#f0a85a' : '#e9e4d3');
  else if (kind === 'warn') { note('The Church warns ' + who + ': keep the Mystery hidden.', '#f0a85a'); if (mine) FX.banner('The Church warns you', 'Too many people have seen your fights.'); }
  else if (kind === 'sanction') FX.banner('The Church exposes ' + (mine ? 'you' : who), 'Every team can see ' + (mine ? 'you' : 'them') + ' for ' + EXPO.sanction + ' seconds.');
};
SND.bell = function (o, out, t) { ringS(o, out, t, [392, 588, 784, 1176], 2.6, 0.12); tone(o, out, t, 'sine', 196, 194, 2.4, 0.12, 0.01); };
/* ---- civilians ---- */
function drawCivs(g) {
  if (!G.civ || !G.civ.length) return; var me = G.f[MEI]; if (MAP.cityW && me.x > MAP.cityW) return;
  drawBodies(g);
  var vz = VIEW.zoom || 1, x0 = VIEW.cx - VW / 2 / vz - 40, x1 = VIEW.cx + VW / 2 / vz + 40, y0 = VIEW.cy - VH / 2 / vz - 40, y1 = VIEW.cy + VH / 2 / vz + 40, now = G.time;
  G.civ.forEach(function (c) {
    if (c.x < x0 || c.x > x1 || c.y < y0 || c.y > y1) return;
    var al = c.on ? clamp((now - c.onT) / 1.5, 0, 1) : clamp(1 - (now - (c.offT === undefined ? -99 : c.offT)) / 1.5, 0, 1); if (al <= 0) return;
    var run = c.flee > 0, a = Math.atan2(c.vy || 0.01, c.vx || 0), bob = Math.sin(now * (run ? 18 : 9) + c.id) * (run ? 2.2 : 1.2);
    g.save(); g.globalAlpha = al; g.translate(c.x, c.y);
    // townsfolk, a little smaller than a master: arms swinging, a shirt, hair
    var sh = CIV_SHIRT[c.id % CIV_SHIRT.length], sk = CIV_SKIN[c.id % CIV_SKIN.length], sw = Math.sin(now * (run ? 16 : 8) + c.id) * (run ? 7 : 4);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(3, 5, 13, 10, 0, 0, 6.283); g.fill();
    g.rotate(a);
    g.strokeStyle = '#0b121a'; g.lineWidth = 1.6;
    g.fillStyle = sh; g.beginPath(); g.moveTo(2, -10); g.lineTo(14 + sw * 0.6, -9 - (run ? 3 : 0)); g.lineTo(14 + sw * 0.6, -5); g.lineTo(2, -6); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(2, 10); g.lineTo(14 - sw * 0.6, 9 + (run ? 3 : 0)); g.lineTo(14 - sw * 0.6, 5); g.lineTo(2, 6); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = sk; g.beginPath(); g.arc(15 + sw * 0.6, -7 - (run ? 1.5 : 0), 2.6, 0, 6.283); g.arc(15 - sw * 0.6, 7 + (run ? 1.5 : 0), 2.6, 0, 6.283); g.fill();
    g.fillStyle = sh; g.beginPath(); g.ellipse(bob * 0.3, 0, 10, 16, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.ellipse(bob * 0.3 + 2, 0, 6, 11, 0, 0, 6.283); g.fill();
    g.fillStyle = sk; g.beginPath(); g.ellipse(7, 0, 4, 5.4, 0, 0, 6.283); g.fill();
    g.fillStyle = CIV_HAIR[(c.id * 7) % CIV_HAIR.length]; g.beginPath(); g.arc(0.5, 0, 7.6, 0, 6.283); g.fill(); g.stroke();
    g.restore();
    if (run && c.flee > 3.2) { g.save(); g.globalAlpha = al; g.fillStyle = '#ffe08a'; g.font = '700 18px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillText('!', c.x, c.y - 24); g.restore(); }
  });
}
/* ---- darkness: a dim layer with holes cut for the viewer's sight, street lamps, doors and lit fighters ---- */
function drawNight(cx, cy, zoom) {
  var dk = darkness(); if (!MAP.cityW || dk <= 0.01) return;
  var me = G.f[MEI], inRoom = !!roomAt(me.x, me.y), w = Math.max(1, Math.ceil(VW / 2)), h = Math.max(1, Math.ceil(VH / 2));
  var c = NIGHT.c || (NIGHT.c = document.createElement('canvas')); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  var g = c.getContext('2d'); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w, h);
  g.fillStyle = 'rgba(4,8,26,' + ((inRoom ? 0.34 : 0.68) * dk) + ')'; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-out';
  function hole(x, y, r, a) { var sx = ((x - cx) * zoom + VW / 2) / 2, sy = ((y - cy) * zoom + VH / 2) / 2, sr = r * zoom / 2; if (sx < -sr || sy < -sr || sx > w + sr || sy > h + sr) return; var gr = g.createRadialGradient(sx, sy, sr * 0.12, sx, sy, sr); gr.addColorStop(0, 'rgba(0,0,0,' + a + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(sx - sr, sy - sr, sr * 2, sr * 2); }
  if (inRoom) hole(me.x, me.y, 760, 0.85);
  else {
    hole(me.x, me.y, 560, 0.92);
    cityCache(MAP).lamps.forEach(function (l) { hole(l[0], l[1], 190, 0.7); });
    (MAP.doors || []).forEach(function (d) { hole(d.out.x + d.out.nx * 20, d.out.y + d.out.ny * 20, 170, 0.7); });
  }
  G.f.forEach(function (f) { if (f.st === 'dead' || !visL(f) || f === me) return; var ally = f.team === me.team; if (ally) hole(f.x, f.y, 300, 0.6); else if (f.key === 'np' && (f.st === 'wind' || f.st === 'act')) hole(f.x, f.y, 380, 0.85); else if (f.hit > 0 || f.st === 'act') hole(f.x, f.y, 140, 0.5); });
  G.proj.forEach(function (p) { if (visL(p.owner)) hole(p.x, p.y, p.a.beam ? 260 : p.a.key === 'np' ? 200 : 110, p.a.beam || p.a.key === 'np' ? 0.85 : 0.5); });
  if (G.marble) hole(G.marble.cx, G.marble.cy, G.marble.R || 900, 0.9);
  ctx.drawImage(c, 0, 0, VW, VH);
}
/* ---- the clock, exposure and notices, under the minimap ---- */
function drawClockHud(mx0, my0, mw, mh) {
  drawTurnedScreen();
  var c = ctx, now = performance.now();
  NOTES = NOTES.filter(function (n) { return now - n.t0 < 6500; });
  NOTES.forEach(function (n, i) { var age = (now - n.t0) / 1000, al = Math.min(1, age / 0.3, (6.5 - age) / 0.6); c.globalAlpha = clamp(al, 0, 1); c.font = '600 ' + (VW < 560 ? 14 : 16) + 'px "Barlow Condensed", sans-serif'; c.textAlign = 'center'; var y = SAFE.top + 26 + i * 24, tw = c.measureText(n.s).width + 24; c.fillStyle = 'rgba(6,10,16,.72)'; c.fillRect(VW / 2 - tw / 2, y - 17, tw, 23); c.fillStyle = n.col; c.fillText(n.s, VW / 2, y); });
  c.globalAlpha = 1;
  if (!G.clock) return;
  var k = G.clock, me = G.f[MEI], left = Math.max(0, k.len - k.t), y = my0 + mh + 20, x = mx0 + mw;
  var label = k.final ? 'FINAL NIGHT' : (k.phase === 'day' ? 'DAY ' : 'NIGHT ') + k.n, tm = k.final ? '' : ' · ' + Math.floor(left / 60) + ':' + ('0' + Math.floor(left % 60)).slice(-2);
  c.textAlign = 'right'; c.font = '700 ' + (VW < 560 ? 14 : 16) + 'px "Barlow Condensed", sans-serif';
  var tw = c.measureText(label + tm).width; c.fillStyle = 'rgba(8,14,20,.72)'; c.fillRect(x - tw - 34, y - 16, tw + 34, 22);
  c.fillStyle = k.phase === 'day' && !k.final ? '#f0c060' : '#b8c8f0'; c.beginPath(); if (k.phase === 'day' && !k.final) c.arc(x - tw - 18, y - 5, 6, 0, 6.283); else { c.arc(x - tw - 18, y - 5, 6, 0, 6.283); } c.fill();
  if (!(k.phase === 'day' && !k.final)) { c.fillStyle = 'rgba(8,14,20,1)'; c.beginPath(); c.arc(x - tw - 15, y - 7, 5, 0, 6.283); c.fill(); }
  c.fillStyle = '#e9e4d3'; c.fillText(label + tm, x - 4, y);
  // exposure: how much the city has seen of your team
  var ex = G.expo[me.team] || 0, rv = G.reveal[me.team] > G.time, by = y + 12, bw = Math.min(mw, 150);
  c.fillStyle = 'rgba(8,14,20,.72)'; c.fillRect(x - bw, by, bw, 20);
  c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x - bw + 50, by + 7, bw - 56, 6);
  c.fillStyle = rv ? '#ff5a5a' : ex >= EXPO.warn ? '#e8583a' : ex >= EXPO.rumor ? '#f0a85a' : '#7ac08a'; c.fillRect(x - bw + 50, by + 7, (bw - 56) * Math.min(1, ex / EXPO.max), 6);
  c.fillStyle = 'rgba(255,255,255,.5)'; [EXPO.rumor, EXPO.warn].forEach(function (v) { c.fillRect(x - bw + 50 + (bw - 56) * v / EXPO.max, by + 5, 1.5, 10); });
  c.textAlign = 'left'; c.font = '600 12px "Barlow Condensed", sans-serif'; c.fillStyle = rv ? '#ff8a8a' : '#c9c3b0'; c.fillText(rv ? 'EXPOSED ' + Math.ceil(G.reveal[me.team] - G.time) : 'SEEN', x - bw + 6, by + 14);
  execMinimap(ctx, mx0, my0, mw, mh); var eh = drawEventHud(x, by + 36, mx0, my0, mw, mh); drawDayHud(x, by + 36 + eh, mx0, my0, mw, mh);
}
// rumors on the minimap: a pulsing area, not a position
function drawRumors(mx0, my0, mw, mh, MW) {
  if (!G.clock) return; var me = G.f[MEI], seen = {};
  G.f.forEach(function (f) {
    if (f.st === 'dead' || f.team === me.team || seen[f.team] || !rumored(f.team) || f.x > MAP.cityW) return; seen[f.team] = 1;
    var gx = Math.round(f.x / 900) * 900 + ((f.team * 337) % 400) - 200, gy = Math.round(f.y / 900) * 900 + ((f.team * 211) % 400) - 200, p = 0.5 + 0.5 * Math.sin(G.time * 3 + f.team);
    ctx.beginPath(); ctx.arc(mx0 + gx / MW * mw, my0 + gy / H * mh, 800 / MW * mw * (0.9 + 0.1 * p), 0, 6.283); ctx.strokeStyle = teamCol(f); ctx.globalAlpha = 0.5 + 0.4 * p; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
  });
}
