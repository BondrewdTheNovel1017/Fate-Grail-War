/* ---- bounded fields, true names and the day's tasks on screen ---- */
var FNOTE = {};
function knownName(f) { return (!f.def.isMaster && G && G.f[MEI] && !trueName(G.f[MEI].team, f)) ? f.def.cls : shortName(f.def.name); }
function teamColOf(t) { var f = G.f.filter(function (q) { return q.team === t; })[0]; return f ? teamCol(f) : '#c9c3b0'; }
FX.field = function (kind, F, e) {
  if (!G || !G.f[MEI]) return; var me = G.f[MEI], key = kind + F.team + ':' + (e ? e.idx : ''), now = G.time;
  if (kind === 'bolt') { if (!FX.near(e.x, e.y)) return; var col = teamColOf(F.team); vfx(0.4, function (g, p) { g.save(); g.globalAlpha = 1 - p; g.strokeStyle = col; g.lineWidth = 4; g.shadowColor = col; g.shadowBlur = 12; g.beginPath(); var x = e.x, y = e.y - 240; g.moveTo(x, y); for (var i = 1; i <= 6; i++) { g.lineTo(e.x + (i < 6 ? (Math.sin(i * 7.1 + now) * 18) : 0), y + i * 40); } g.stroke(); g.restore(); }); FX.snd('hitL', e); return; }
  if (FNOTE[key] > now) return; FNOTE[key] = now + 20;
  if (kind === 'intrude' && F.team === me.team) note('Intruder: ' + (e.def.isMaster ? shortName(e.def.name) : knownName(e)) + ' crossed your bounded field', '#f0a85a');
  else if (kind === 'enter' && e === me) note('You crossed the bounded field of ' + F.name + '. They know you are here.', '#f0a85a');
};
FX.truename = function (team, s, how) {
  if (!G.f[MEI] || team !== G.f[MEI].team) return;
  note('True name: the ' + s.def.cls + ' is ' + s.def.name + (how === 'np' ? ', revealed by its Noble Phantasm' : ', read from the battle site'), '#ffd36b');
  buildHud();
};
FX.task = function (t, k, msg) { if (!G.f[MEI] || t !== G.f[MEI].team) return; FX.banner(k.name, msg); FX.snd('chant', G.f[MEI]); };
var TASK_ICON = { fortify: 'Fortify', ley: 'Ley line', trace: 'Investigate', school: 'School' }, TASK_COL = { fortify: '#7fc4ee', ley: '#b48cff', trace: '#f0a85a', school: '#7ac08a' };
// bounded fields: a ring of runes in the owner's color; a Caster's Temple gets a second ring
function drawFields(g, vr, t) {
  if (!G || !G.fields) return;
  for (var k in G.fields) {
    var F = G.fields[k]; if (F.lvl <= 0) continue; var r = fieldR(F);
    if (!vis(vr, F.x - r, F.y - r, F.x + r, F.y + r)) continue;
    var col = teamColOf(F.team), al = 0.16 + F.lvl * 0.05;
    g.save(); g.strokeStyle = col; g.globalAlpha = al; g.lineWidth = 4; g.setLineDash([26, 14]); g.lineDashOffset = -t * 12; g.beginPath(); g.arc(F.x, F.y, r, 0, 6.283); g.stroke();
    g.setLineDash([]); g.lineWidth = 2; for (var i = 0; i < 12 + F.lvl * 4; i++) { var a = i / (12 + F.lvl * 4) * 6.283 + t * 0.05; g.beginPath(); g.moveTo(F.x + Math.cos(a) * (r - 10), F.y + Math.sin(a) * (r - 10)); g.lineTo(F.x + Math.cos(a) * (r + 10), F.y + Math.sin(a) * (r + 10)); g.stroke(); }
    if (F.temple) { g.globalAlpha = al * 0.9; g.lineWidth = 3; g.setLineDash([8, 10]); g.lineDashOffset = t * 20; g.beginPath(); g.arc(F.x, F.y, r - 34, 0, 6.283); g.stroke(); g.setLineDash([]); }
    var lg = g.createRadialGradient(F.x, F.y, r * 0.6, F.x, F.y, r); lg.addColorStop(0, rgbaOf(col, 0)); lg.addColorStop(1, rgbaOf(col, 0.05 + F.lvl * 0.015)); g.globalAlpha = 1; g.fillStyle = lg; g.beginPath(); g.arc(F.x, F.y, r, 0, 6.283); g.fill();
    g.restore();
  }
}
function drawTasks(g, vr, t) {
  if (!G || !G.tasks || !G.tasks.length || !isDay()) return; var my = G.f[MEI].team;
  G.tasks.forEach(function (k) {
    if (!taskFor(my, k) && !k.done[my]) return; if (!vis(vr, k.x - k.r - 60, k.y - k.r - 40, k.x + k.r + 60, k.y + k.r + 60)) return;
    var col = TASK_COL[k.kind], done = k.done[my], p = Math.min(1, (k.prog[my] || 0) / k.need);
    g.save(); g.globalAlpha = done ? 0.35 : 0.85; g.strokeStyle = col; g.lineWidth = 3; g.setLineDash([12, 10]); g.lineDashOffset = -t * 18; g.beginPath(); g.arc(k.x, k.y, k.r, 0, 6.283); g.stroke(); g.setLineDash([]);
    g.fillStyle = rgbaOf(col, 0.08); g.fill();
    if (p > 0 && !done) { g.lineWidth = 8; g.beginPath(); g.arc(k.x, k.y, k.r + 10, -1.571, -1.571 + 6.283 * p); g.stroke(); }
    g.textAlign = 'center'; g.font = '700 20px "Barlow Condensed", sans-serif'; var lab = (done ? '✓ ' : '') + TASK_ICON[k.kind] + (k.cont && k.cont[my] ? ' · CONTESTED' : ''), tw = g.measureText(lab).width + 18;
    g.fillStyle = 'rgba(6,10,16,.75)'; g.fillRect(k.x - tw / 2, k.y + k.r + 18, tw, 26); g.fillStyle = col; g.fillText(lab, k.x, k.y + k.r + 37);
    g.restore();
  });
}
// the day's checklist under the clock, and gold diamonds on the minimap
function drawDayHud(x, y, mx0, my0, mw, mh) {
  if (!isDay() || !G.tasks || !G.tasks.length) return; var my = G.f[MEI].team, c = ctx, MW = MAP.cityW || W;
  var list = G.tasks.filter(function (k) { return taskFor(my, k) || k.done[my]; });
  list.forEach(function (k) { var px = mx0 + k.x / MW * mw, py = my0 + k.y / H * mh; c.save(); c.translate(px, py); c.rotate(0.785); c.fillStyle = k.done[my] ? 'rgba(200,200,200,.4)' : TASK_COL[k.kind]; c.fillRect(-3.5, -3.5, 7, 7); c.restore(); });
  c.font = '600 ' + (VW < 560 ? 12 : 14) + 'px "Barlow Condensed", sans-serif'; c.textAlign = 'right';
  list.slice(0, 7).forEach(function (k, i) {
    var done = k.done[my], s = (done ? '✓ ' : '') + k.name + (done ? '' : '  ' + Math.floor(k.prog[my] || 0) + '/' + k.need + 's'), tw = c.measureText(s).width + 16, yy = y + i * 20;
    c.fillStyle = 'rgba(8,14,20,.72)'; c.fillRect(x - tw, yy - 14, tw, 19); c.fillStyle = done ? 'rgba(201,195,176,.55)' : TASK_COL[k.kind]; c.fillText(s, x - 6, yy);
  });
}
