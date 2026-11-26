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
  note('True name: the ' + s.def.cls + ' is ' + s.def.name + (how === 'np' ? ', revealed by its Noble Phantasm' : how === 'banquet' ? ', named at the King\u2019s table' : how === 'church' ? ', told to you by the overseer' : how === 'rescue' ? ', glimpsed as a Command Seal carried it away' : ', read from the battle site'), '#ffd36b');
  buildHud();
};
FX.task = function (t, k, msg, step) { if (!G.f[MEI] || t !== G.f[MEI].team) return; if (step) { note(msg, TASK_COL[k.kind]); return; } FX.banner(k.name, msg); FX.snd('chant', G.f[MEI]); };
var TASK_ICON = { fortify: 'Fortify', ley: 'Ley line', trace: 'Investigate', school: 'School', banquet: 'The King\u2019s Banquet', summons: 'The Church' }, TASK_COL = { summons: '#e9e4d3', fortify: '#7fc4ee', ley: '#b48cff', trace: '#f0a85a', school: '#7ac08a', banquet: '#e8bf4a' };
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
    if (!taskFor(my, k) && !k.done[my]) return; if (k.act && !k.done[my]) { drawActiveTask(g, k, my, vr, t); return; } if (!vis(vr, k.x - k.r - 60, k.y - k.r - 40, k.x + k.r + 60, k.y + k.r + 60)) return;
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
    var done = k.done[my], s = (done ? '✓ ' : '') + k.name + (done ? '' : '  ' + taskProgText(k, my)), tw = c.measureText(s).width + 16, yy = y + i * 20;
    c.fillStyle = 'rgba(8,14,20,.72)'; c.fillRect(x - tw, yy - 14, tw, 19); c.fillStyle = done ? 'rgba(201,195,176,.55)' : TASK_COL[k.kind]; c.fillText(s, x - 6, yy);
  });
}

/* ---- the active day tasks, drawn: stones and ward points, the ley wisp, clue glints; scout familiars ---- */
function taskProgText(k, my) {
  if (k.act === 'stones') return k.stones.filter(function (q) { return q.ok; }).length + '/3 stones';
  if (k.act === 'wisp') return Math.floor(100 * (k.w && k.w[my] || 0) / k.len) + '% walked';
  if (k.act === 'clues') return ((k.found && k.found[my]) || []).filter(Boolean).length + '/3 clues';
  return Math.floor(k.prog[my] || 0) + '/' + k.need + 's';
}
function drawActiveTask(g, k, my, vr, t) {
  var col = TASK_COL[k.kind]; g.save();
  if (k.act === 'stones') {
    k.stones.forEach(function (s, i) {
      // the ward point: a ring of chalk, filled once its stone is set
      if (vis(vr, s.tx - 80, s.ty - 80, s.tx + 80, s.ty + 80)) { g.strokeStyle = col; g.globalAlpha = s.ok ? 0.9 : 0.6; g.lineWidth = 3; g.setLineDash([8, 7]); g.lineDashOffset = -t * 14; g.beginPath(); g.arc(s.tx, s.ty, 46, 0, 6.283); g.stroke(); g.setLineDash([]); if (!s.ok) { g.globalAlpha = 0.85; g.fillStyle = col; g.font = '700 15px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillText('WARD ' + (i + 1), s.tx, s.ty + 66); } }
      var cf = s.c >= 0 ? G.f[s.c] : null, sx0 = s.x, sy0 = s.y; if (cf) { s = { x: cf.x, y: cf.y - 40, c: s.c, ok: 0 }; }
      if (!vis(vr, s.x - 40, s.y - 40, s.x + 40, s.y + 40)) return;
      // the stone: grey rock with a glowing rune (held over the head while carried)
      g.globalAlpha = 1; g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(s.x + 3, s.y + 5, 15, 10, 0, 0, 6.283); g.fill();
      g.fillStyle = '#8a8d93'; g.strokeStyle = '#0b121a'; g.lineWidth = 2; g.beginPath(); g.moveTo(s.x - 13, s.y + 6); g.lineTo(s.x - 9, s.y - 10); g.lineTo(s.x + 6, s.y - 13); g.lineTo(s.x + 14, s.y + 2); g.lineTo(s.x + 5, s.y + 11); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = col; g.globalAlpha = 0.6 + 0.4 * Math.sin(t * 4 + i); g.lineWidth = 2; g.beginPath(); g.moveTo(s.x - 4, s.y - 5); g.lineTo(s.x + 3, s.y - 5); g.lineTo(s.x - 2, s.y + 4); g.stroke();
      if (s.c < 0 && !s.ok) { g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 3 + i); g.beginPath(); g.arc(s.x, s.y, 28 + 4 * Math.sin(t * 3), 0, 6.283); g.stroke(); }
    });
  } else if (k.act === 'wisp') {
    var wp = k.wp && k.wp[my], x = wp ? wp[0] : k.x, y = wp ? wp[1] : k.y;
    if (vis(vr, x - 260, y - 260, x + 260, y + 260)) {
      var pul = 0.5 + 0.5 * Math.sin(t * 5), gr = g.createRadialGradient(x, y, 2, x, y, 70); gr.addColorStop(0, 'rgba(230,220,255,.95)'); gr.addColorStop(0.3, rgbaOf(col, 0.6)); gr.addColorStop(1, rgbaOf(col, 0));
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, 70, 0, 6.283); g.fill();
      g.globalAlpha = 0.4; g.strokeStyle = col; g.lineWidth = 2; g.setLineDash([6, 8]); g.beginPath(); g.arc(x, y, DAYP.wispNear, 0, 6.283); g.stroke(); g.setLineDash([]);
      for (var j = 0; j < 4; j++) { var a = t * 2 + j * 1.57; g.globalAlpha = 0.6; g.fillStyle = '#efe8ff'; g.beginPath(); g.arc(x + Math.cos(a) * (18 + 6 * pul), y + Math.sin(a) * (18 + 6 * pul), 3, 0, 6.283); g.fill(); }
      if (!wp) { g.globalAlpha = 0.9; g.fillStyle = col; g.font = '700 16px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillText('WALK WITH THE LEY WISP', x, y + 92); }
    }
    if (k.ex !== undefined && vis(vr, k.ex - 80, k.ey - 80, k.ex + 80, k.ey + 80)) { g.globalAlpha = 0.55; g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.arc(k.ex, k.ey, 50, 0, 6.283); g.stroke(); }
  } else if (k.act === 'clues') {
    var me = G.f[MEI], fd = (k.found && k.found[my]) || [], ex = (k.exT && k.exT[my]) || [];
    if (vis(vr, k.x - 420, k.y - 420, k.x + 420, k.y + 420)) { g.globalAlpha = 0.35; g.strokeStyle = col; g.lineWidth = 2; g.setLineDash([10, 12]); g.beginPath(); g.arc(k.x, k.y, 400, 0, 6.283); g.stroke(); g.setLineDash([]); }
    k.clues.forEach(function (c, i) {
      if (fd[i]) return; var d = Math.hypot(me.x - c.x, me.y - c.y); if (d > DAYP.clueSee && !G.f.some(function (f) { return f.team === my && f.st !== 'dead' && Math.hypot(f.x - c.x, f.y - c.y) < DAYP.clueSee; })) return;
      var a = clamp(1 - d / DAYP.clueSee, 0.25, 1) * (0.6 + 0.4 * Math.sin(t * 6 + i));
      g.globalAlpha = a; g.fillStyle = '#fff6d0'; g.beginPath(); g.moveTo(c.x, c.y - 10); g.lineTo(c.x + 3, c.y - 3); g.lineTo(c.x + 10, c.y); g.lineTo(c.x + 3, c.y + 3); g.lineTo(c.x, c.y + 10); g.lineTo(c.x - 3, c.y + 3); g.lineTo(c.x - 10, c.y); g.lineTo(c.x - 3, c.y - 3); g.closePath(); g.fill();
      if (ex[i] > 0) { g.globalAlpha = 0.9; g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.arc(c.x, c.y, 26, -1.571, -1.571 + 6.283 * Math.min(1, ex[i] / DAYP.clueT)); g.stroke(); }
    });
  }
  g.restore();
}
function drawScout(g, m) {
  var a = m.face || 0, fl = Math.sin((m.t || 0) * 16) * 0.5 + 0.5, col = G.f.filter(function (f) { return f.team === m.team; }).map(function (f) { return teamCol(f); })[0] || '#c9c3b0';
  g.save(); g.translate(m.x, m.y + 26); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 0, 10, 5, 0, 0, 6.283); g.fill(); g.restore();
  g.save(); g.translate(m.x, m.y); g.rotate(a);
  g.fillStyle = '#1d1c22'; g.strokeStyle = '#0b121a'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(10, 0); g.lineTo(-2, -4 - 12 * fl); g.lineTo(-6, -2); g.lineTo(-12, 0); g.lineTo(-6, 2); g.lineTo(-2, 4 + 12 * fl); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = col; g.beginPath(); g.arc(4, 0, 2.2, 0, 6.283); g.fill();
  g.restore();
}
(function () {
  var dm0 = drawMobs; drawMobs = function (g) { if (G && G.mobs) { var keep = G.mobs; G.mobs = keep.filter(function (m) { return !m.scout; }); try { dm0(g); } finally { G.mobs = keep; } keep.forEach(function (m) { if (m.scout && !m.dead) drawScout(g, m); }); } else dm0(g); };
  var ev0 = FX.event;
  FX.event = function (kind, d) {
    if (kind !== 'scoutDown' && kind !== 'scoutReport') return ev0.apply(this, arguments);
    if (!G || !G.f[MEI]) return; var my = G.f[MEI].team;
    if (kind === 'scoutDown') { if (d.team === my) note('You downed a familiar sent by ' + teamName(d.owner) + '. You know where they are until the night is young.', '#c9b8e0'); else if (d.owner === my) note('Your familiar watching ' + teamName(d.tgt) + ' was shot down.', '#f0a85a'); }
    else if (kind === 'scoutReport') { if (d.tgt === my) note('A familiar watched you all day: ' + teamName(d.owner) + ' knows where you are.', '#f0a85a'); else if (d.owner === my) note('Your familiar reports where ' + teamName(d.tgt) + ' is.', '#c9b8e0'); }
  };
})();
