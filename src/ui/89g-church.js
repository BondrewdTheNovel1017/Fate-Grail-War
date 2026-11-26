/* ---- the Church's reach, drawn: the fallen in the street, Executors and their Black Keys, and the notices ---- */
function drawBodies(g) {
  if (!G.bodies || !G.bodies.length) return;
  G.bodies.forEach(function (b) {
    var age = G.time - b.t; if (!b.keep && age > CHURCH.bodyT + 6) return;
    var al = b.keep ? 1 : clamp((CHURCH.bodyT + 6 - age) / 6, 0, 1), sh = CIV_SHIRT[b.id % CIV_SHIRT.length], a = b.a > 0 ? 0.4 : 2.6;
    g.save(); g.globalAlpha = al * 0.95; g.translate(b.x, b.y); g.rotate(a);
    g.fillStyle = 'rgba(60,10,14,.45)'; g.beginPath(); g.ellipse(-4, 3, 16, 11, 0.3, 0, 6.283); g.fill();
    g.strokeStyle = '#0b121a'; g.lineWidth = 1.5; g.fillStyle = sh;
    g.beginPath(); g.ellipse(0, 0, 9, 15, 0, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-2, -11); g.lineTo(-14, -16); g.moveTo(2, 11); g.lineTo(12, 18); g.lineWidth = 4; g.strokeStyle = sh; g.stroke();
    g.fillStyle = CIV_HAIR[(b.id * 7) % CIV_HAIR.length]; g.strokeStyle = '#0b121a'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, -19, 6.5, 0, 6.283); g.fill(); g.stroke();
    g.restore();
  });
}
// an Executor: black cassock, a violet stole, Black Keys between the fingers
function drawExec(g, m) {
  var sw = G.time - (m.swing || -9) < 0.25, a = m.face || 0, walk = Math.sin((m.t || 0) * 11) * 3;
  g.save(); g.translate(m.x, m.y);
  g.fillStyle = 'rgba(0,0,0,.32)'; g.beginPath(); g.ellipse(3, 5, 17, 12, 0, 0, 6.283); g.fill();
  g.rotate(a); g.strokeStyle = '#0b121a'; g.lineWidth = 1.8;
  g.fillStyle = '#16171c'; g.beginPath(); g.moveTo(-6, -20); g.quadraticCurveTo(-26, -12, -28, 0); g.quadraticCurveTo(-26, 12, -6, 20); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#1d1f25'; g.beginPath(); g.moveTo(3, -16); g.lineTo(22 + (sw ? 8 : walk), -10); g.lineTo(22 + (sw ? 8 : walk), -5); g.lineTo(1, -8); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(3, 16); g.lineTo(22 - walk, 10); g.lineTo(22 - walk, 5); g.lineTo(1, 8); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#e6ecf2'; g.lineWidth = 2.2; g.beginPath(); for (var k = -1; k <= 1; k++) { var hx = 24 + (sw ? 8 : walk), hy = -7.5; g.moveTo(hx, hy); g.lineTo(hx + 22, hy + k * 4); } g.stroke();
  g.strokeStyle = '#0b121a'; g.lineWidth = 1.8;
  g.fillStyle = '#202228'; g.beginPath(); g.ellipse(0, 0, 13, 21, 0, 0, 6.283); g.fill(); g.stroke();
  g.strokeStyle = '#6a3a9a'; g.lineWidth = 3; g.beginPath(); g.moveTo(-3, -15); g.lineTo(-3, 15); g.moveTo(3, -15); g.lineTo(3, 15); g.stroke();
  g.strokeStyle = '#d8c070'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(9, -3); g.lineTo(9, 3); g.moveTo(6, 0); g.lineTo(12, 0); g.stroke();
  g.strokeStyle = '#0b121a'; g.lineWidth = 1.6; g.fillStyle = '#d9b496'; g.beginPath(); g.ellipse(8, 0, 4.6, 6, 0, 0, 6.283); g.fill();
  g.fillStyle = '#2a2420'; g.beginPath(); g.arc(-0.5, 0, 9, 0, 6.283); g.fill(); g.stroke();
  g.restore();
  if (m.hp < m.max) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(m.x - 18, m.y - 34, 36, 4); g.fillStyle = '#c9b8e0'; g.fillRect(m.x - 18, m.y - 34, 36 * clamp(m.hp / m.max, 0, 1), 4); }
}
// the Black Keys in flight, retraced from the last throw so guests see them too
function drawExecKeys(g) {
  (G.mobs || []).forEach(function (m) {
    if (!m.exec || m.thT === undefined) return; var age = G.time - m.thT, L = CHURCH.throwR / CHURCH.keySpd; if (age < 0 || age > L) return;
    for (var i = 0; i < CHURCH.keyN; i++) {
      var b = m.thA + (i - (CHURCH.keyN - 1) / 2) * CHURCH.keySpread, x = m.thX + Math.cos(b) * CHURCH.keySpd * age, y = m.thY + Math.sin(b) * CHURCH.keySpd * age;
      g.save(); g.translate(x, y); g.rotate(b); g.strokeStyle = '#e6ecf2'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-16, 0); g.lineTo(8, 0); g.stroke(); g.fillStyle = '#2a2c30'; g.fillRect(-20, -3, 5, 6); g.restore();
    }
  });
}
(function () { var dm0 = drawMobs; drawMobs = function (g) { dm0(g); drawExecKeys(g); }; })();
// the notices
(function () {
  var ch0 = FX.church;
  FX.church = function (kind, team, d) {
    if (kind !== 'civKill' && kind !== 'dispatch' && kind !== 'execDown' && kind !== 'rescue' && kind !== 'sealNP') return ch0(kind, team, d);
    if (!G || !G.f[MEI]) return;
    var me = G.f[MEI], mine = team === me.team, who = mine ? 'Your team' : teamName(team);
    if (kind === 'civKill') {
      if (mine) { FX.banner('An innocent is dead', (d && d.n > 1 ? 'Again. ' : '') + 'Every team can see you' + (d && d.sent ? ', and the Church has sent Executors after you.' : '. The Church will not forgive another.')); FX.shake(6); SFX('bell'); }
      else note('A civilian was killed by ' + teamName(team) + '. They are marked on the map' + (d && d.sent ? ', and Executors are hunting them.' : '.'), '#f0a85a');
    } else if (kind === 'dispatch') {
      var whence = d && d.from === 'church' ? 'from Kotomine Church' : 'into the city from the ' + (d ? d.from : 'edge');
      if (mine) { FX.banner('The Church sends Executors', (d ? d.n : 2) + ' Executors are coming ' + whence + '. They hunt your master first.'); SFX('bell'); }
      else note('Executors set out ' + whence + ' to hunt ' + who + '.', '#c9b8e0');
    } else if (kind === 'rescue') {
      var sv = d.s >= 0 ? G.f[d.s] : null, ms = G.f[d.m], fell = G.f[d.fell]; if (!ms) return;
      RESC_FX.push({ t0: G.time, x: d.x, y: d.y, hx: d.hx, hy: d.hy, s: d.s, m: d.m, fell: d.fell });
      if (FX.near(d.x, d.y) || mine) { FX.snd('godhand', fell || ms); FX.shake(5); }
      var left = d.left === 1 ? 'one seal left' : d.left === 0 ? 'no seals left: the next death is final' : d.left + ' seals left';
      if (mine) FX.banner('A Command Seal burns', (fell === ms ? 'Your master was' : (sv ? shortName(sv.def.name) : 'Your servant') + ' was') + ' carried home from the brink of death: ' + left + '.');
      else if (d.by === me.team) FX.banner('They escaped by a Command Seal', 'A seal burned to save ' + (fell ? knownName(fell) : 'them') + '. They are marked on your map for a while.');
      else if (FX.near(d.x, d.y)) note((fell ? knownName(fell) : 'Someone') + ' vanished in red light: a Command Seal.', '#ff7a7a');
    } else if (kind === 'sealNP') {
      var s2 = G.f[d.s]; if (!s2) return;
      if (s2.idx === MEI) FX.banner('Command Seal: ' + s2.def.np, 'Your Noble Phantasm is charged and cannot be stopped. Release it when you are ready.');
      else if (mine) note('Your Command Seal charges ' + shortName(s2.def.name) + '\u2019s Noble Phantasm.', '#ff7a7a');
    } else if (kind === 'execDown') {
      if (d && d.by === me.team) note('An Executor falls. The Church will remember it.', '#c9b8e0');
    }
  };
})();
function SFX(n) { try { if (SND[n] && FX.near(G.f[MEI].x, G.f[MEI].y)) FX.snd(n, G.f[MEI]); } catch (e) {} }
// Executors hunting you show on your minimap; the Church tells you where they are
function execMinimap(c, mx0, my0, mw, mh) {
  if (!G || !G.mobs || !MAP.cityW) return; var me = G.f[MEI], MW = MAP.cityW;
  G.mobs.forEach(function (m) { if (!m.exec || m.dead || m.tgt !== me.team || m.x > MW) return; var x = mx0 + m.x / MW * mw, y = my0 + m.y / H * mh; c.fillStyle = '#c9b8e0'; c.strokeStyle = '#1a1020'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x + 4, y); c.lineTo(x, y + 5); c.lineTo(x - 4, y); c.closePath(); c.fill(); c.stroke(); });
}

/* ---- the Command Seal rescue, drawn: a red pillar over the fallen, the partner's swoop as a red streak, both dissolving
   upward, then a red burst in the workshop. Driven by RESC_FX (from the FX call, so guests see it too) and the
   fighters' own rescue state. ---- */
var RESC_FX = [];
function drawRescues(g) {
  if (!RESC_FX.length || !G) return; var now = G.time;
  RESC_FX = RESC_FX.filter(function (R) { return now - R.t0 < 2.4; });
  RESC_FX.forEach(function (R) {
    var age = now - R.t0, fell = G.f[R.fell], other = G.f[R.fell === R.m ? R.s : R.m];
    g.save(); g.globalCompositeOperation = 'lighter';
    // the seal flares at the scene: a column of red light and the mark on the ground
    if (age < RESCUE.gone + 0.35) {
      var a1 = age < 0.15 ? age / 0.15 : age > RESCUE.gone ? Math.max(0, 1 - (age - RESCUE.gone) / 0.35) : 1;
      var gr = g.createLinearGradient(R.x, R.y - 260, R.x, R.y + 30); gr.addColorStop(0, 'rgba(255,40,60,0)'); gr.addColorStop(0.7, 'rgba(255,50,70,' + 0.45 * a1 + ')'); gr.addColorStop(1, 'rgba(255,90,90,' + 0.7 * a1 + ')');
      g.fillStyle = gr; g.fillRect(R.x - 34, R.y - 260, 68, 290);
      g.strokeStyle = 'rgba(255,70,90,' + 0.8 * a1 + ')'; g.lineWidth = 3; g.beginPath(); g.arc(R.x, R.y, 46 + 30 * Math.min(1, age * 2), 0, 6.283); g.stroke();
      sealGlyph(g, R.x, R.y, 30, now * 2, 'rgba(255,90,110,' + 0.9 * a1 + ')');
      for (var i = 0; i < 10; i++) { var u = (age * 1.4 + i / 10) % 1; g.fillStyle = 'rgba(255,120,130,' + (1 - u) * a1 + ')'; g.beginPath(); g.arc(R.x + Math.sin(i * 7.1 + now * 3) * 26, R.y - u * 220, 3, 0, 6.283); g.fill(); }
    }
    // the swoop: a red streak trailing the partner while it flies in
    if (other && other.resc && age < RESCUE.swoop + 0.1 && other.resc.fromX !== undefined) {
      g.strokeStyle = 'rgba(255,60,80,.75)'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(other.resc.fromX, other.resc.fromY); g.lineTo(other.x, other.y); g.stroke();
      g.strokeStyle = 'rgba(255,200,200,.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(other.x - (other.x - other.resc.fromX) * 0.4, other.y - (other.y - other.resc.fromY) * 0.4); g.lineTo(other.x, other.y); g.stroke();
    }
    // the arrival: a red burst in the workshop
    if (age >= RESCUE.gone - 0.05 && age < RESCUE.gone + 1) {
      var u2 = (age - RESCUE.gone + 0.05) / 1.05;
      g.strokeStyle = 'rgba(255,70,90,' + (1 - u2) + ')'; g.lineWidth = 6 * (1 - u2) + 1; g.beginPath(); g.arc(R.hx, R.hy, 30 + 160 * u2, 0, 6.283); g.stroke();
      sealGlyph(g, R.hx, R.hy, 40, -now * 2, 'rgba(255,90,110,' + (1 - u2) + ')');
    }
    g.restore();
  });
}
function sealGlyph(g, x, y, r, rot, col) {
  g.save(); g.translate(x, y); g.rotate(rot); g.strokeStyle = col; g.lineWidth = 3; g.beginPath();
  g.moveTo(0, -r); g.quadraticCurveTo(r * 0.5, -r * 0.2, 0, r * 0.35); g.quadraticCurveTo(-r * 0.5, -r * 0.2, 0, -r);
  g.moveTo(-r, r * 0.2); g.quadraticCurveTo(0, r * 0.9, r, r * 0.2); g.moveTo(-r * 0.6, -r * 0.5); g.lineTo(-r * 0.95, -r * 0.8); g.moveTo(r * 0.6, -r * 0.5); g.lineTo(r * 0.95, -r * 0.8);
  g.stroke(); g.restore();
}
// fighters inside a rescue glow red and dissolve upward
function rescueAlpha(f) {
  if (!f.resc) return 1; var age = G.time - f.resc.t0;
  if (age < RESCUE.swoop) return 1; if (age < RESCUE.gone) return 1 - (age - RESCUE.swoop) / (RESCUE.gone - RESCUE.swoop); return Math.min(1, (age - RESCUE.gone) / (RESCUE.arrive - RESCUE.gone));
}
