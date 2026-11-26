/* ---- the summoning: each master starts alone at their circle, speaks the chant, and the servant answers ----
   Then speech bubbles: short lines above servants and masters when something happens near you. */
var INTRO = null;
var CHANT = [
  'Silver for the circle, iron for its edge, and blood to wake the lines.',
  'Fill and empty, five times over. Let the gate between us open.',
  'I call upon the Throne of Heroes: lend me a hero, and I will lend you my fate.'
], CHANT_MAD = ['Let madness cloud your sight and chain your reason.', 'Be bound by fury, and fight only at my command.'],
  CHANT_END = 'If you would win the Grail, cross over and come to me!';
var LINE_T = 2.1;
function startIntro(nTeams) {
  if (!G || G.mode !== 'war' || G.quick || !G.circles || !G.circles.length) return false;
  var me = G.f[MEI], m = me.def.isMaster ? me : me.partner; if (!m || !m.partner) return false;
  var c = G.circles.filter(function (q) { return q.team === m.team; })[0]; if (!c) return false;
  var s = m.partner, lines = CHANT.concat(s.def.cls === 'Berserker' ? CHANT_MAD : [], [CHANT_END]);
  var t0 = 1.7, reveal = t0 + lines.length * LINE_T + 0.2;
  INTRO = { t: 0, m: m, s: s, c: c, lines: lines, t0: t0, reveal: reveal, sl: reveal + 1.0, rp: reveal + 4.0, end: reveal + 6.6, shown: false, said: 0, glow: 0, n: nTeams };
  cam.x = c.x; cam.y = c.y + 20; document.body.classList.add('intro');
  return true;
}
function introReveal() {
  var I = INTRO; if (I.shown) return; I.shown = true; var s = I.s, mad = s.def.cls === 'Berserker';
  flashFx(mad ? '#5a0a14' : '#ffffff', 0.85, 0.8); shake = Math.max(shake, 12); FX.snd('summon', I.m);
  vfx(1.4, function (g, p) { var a = (1 - p), r = 60 + p * 140; g.globalAlpha = a; var lg = g.createRadialGradient(I.c.x, I.c.y, 4, I.c.x, I.c.y, r); lg.addColorStop(0, mad ? 'rgba(255,90,90,.9)' : 'rgba(255,255,255,.95)'); lg.addColorStop(1, rgbaOf(I.c.col, 0)); g.fillStyle = lg; g.beginPath(); g.arc(I.c.x, I.c.y, r, 0, 6.283); g.fill(); g.globalAlpha = 1; });
  for (var i = 0; i < 40; i++) { var a = Math.random() * 6.283, v = 80 + Math.random() * 220; parts.push({ x: I.c.x, y: I.c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.9, col: i % 3 ? I.c.col : '#ffffff' }); }
  G.f.forEach(function (f) { if (!f.def.isMaster) { f.face = f.partner ? Math.atan2(f.partner.y - f.y, f.partner.x - f.x) : f.face; } });
}
function introTick(dt) {
  var I = INTRO; I.t += dt;
  var k = Math.floor((I.t - I.t0) / LINE_T); if (I.t >= I.t0 && k < I.lines.length && k >= I.said) { I.said = k + 1; FX.snd('chant', I.m); }
  I.glow = I.shown ? Math.max(0, 1 - (I.t - I.reveal) / 3) : clamp((I.t - I.t0) / (I.reveal - I.t0), 0, 1);
  if (!I.shown && I.t >= I.reveal) introReveal();
  if (I.t >= I.sl && !I.sDone) { I.sDone = true; showBubble(I.s, pickLine(I.s, 'summon') || '...', 3.0, true); }
  if (I.t >= I.rp && !I.rDone) { I.rDone = true; showBubble(I.m, pickLine(I.m, 'summon') || 'I am.', 2.6, true); }
  if (I.t >= I.end) endIntro();
}
function endIntro() {
  if (!INTRO) return; var n = INTRO.n; introReveal(); INTRO = null; document.body.classList.remove('intro'); last = performance.now();
  FX.banner('The Holy Grail War', 'Fuyuki City · ' + n + ' teams');
}
function skipIntro() { if (!INTRO) return; if (!INTRO.shown) { INTRO.t = INTRO.reveal; introReveal(); BUB = []; } endIntro(); }
window.addEventListener('keydown', function (e) { if (!INTRO || !running) return; var k = e.key.toLowerCase(); if (k === ' ' || k === 'enter' || k === 'escape') { e.preventDefault(); e.stopImmediatePropagation(); skipIntro(); } }, true);
cv.addEventListener('pointerdown', function (e) { if (INTRO && INTRO.t > 0.4) { e.preventDefault(); e.stopImmediatePropagation(); skipIntro(); } }, true);
SND.summon = function (o, out, t) { bass(o, out, t, 56, 22, 2.2, 0.9, 1.15); ringS(o, out, t, [523, 784, 1046, 1568], 2.2, 0.14); pad(o, out, t, 1.6, [261.6, 329.6, 392], 0.1, 0.02, 1.4, 'triangle', 2400, 900); noise(o, out, t, 'bandpass', 800, 5000, 1.2, 0.4, 0.02, 1.0); };
SND.chant = function (o, out, t) { ringS(o, out, t, [880, 1320, 1760], 1.1, 0.05); tone(o, out, t, 'sine', 220, 200, 1.0, 0.06, 0.2); };
function drawIntro() {
  var I = INTRO, c = ctx, bar = VH * 0.11 * Math.min(1, I.t / 0.6);
  if (I.t < 1.3) { c.fillStyle = 'rgba(0,0,0,' + (1 - I.t / 1.3) + ')'; c.fillRect(0, 0, VW, VH); }
  c.fillStyle = '#000'; c.fillRect(0, 0, VW, bar); c.fillRect(0, VH - bar, VW, bar);
  c.textAlign = 'left'; var ca = clamp((I.t - 0.4) / 0.8, 0, 1) * clamp((I.reveal + 0.5 - I.t) / 0.8, 0.35, 1);
  c.globalAlpha = ca; c.fillStyle = '#e9e4d3'; c.font = '400 ' + (VW < 560 ? 20 : 26) + 'px "Marcellus SC", "Times New Roman", serif'; c.fillText(I.m.def.name, 20, bar + 38);
  c.font = 'italic 400 ' + (VW < 560 ? 14 : 17) + 'px "Times New Roman", serif'; c.fillStyle = I.c.col; c.fillText(I.c.name, 20, bar + 62); c.globalAlpha = 1;
  var k = Math.floor((I.t - I.t0) / LINE_T);
  if (I.t >= I.t0 && k < I.lines.length + 1 && !I.shown) {
    c.textAlign = 'center';
    for (var j = Math.max(0, k - 1); j <= Math.min(k, I.lines.length - 1); j++) {
      var lt = I.t - I.t0 - j * LINE_T, al = j === k ? clamp(lt / 0.35, 0, 1) : 0.35, fs = VW < 560 ? 16 : 22, y = VH - bar - 34 - (k - j) * (fs + 14);
      c.globalAlpha = al; c.font = 'italic 400 ' + fs + 'px "Times New Roman", serif'; var ln = I.lines[j]; while (c.measureText(ln).width > VW - 40 && fs > 11) { fs--; c.font = 'italic 400 ' + fs + 'px "Times New Roman", serif'; }
      c.shadowColor = I.c.col; c.shadowBlur = j === k ? 12 : 0; c.fillStyle = j === I.lines.length - 1 ? '#fff6dc' : '#e9e4d3'; c.fillText(ln, VW / 2, y); c.shadowBlur = 0;
    }
    c.globalAlpha = 1;
  }
  c.textAlign = 'right'; c.font = '600 13px "Barlow Condensed", sans-serif'; c.fillStyle = 'rgba(233,228,211,.55)'; c.fillText(('ontouchstart' in window ? 'Tap' : 'Space') + ' to skip', VW - 16, VH - bar / 2 + 4);
}
/* ---- speech bubbles ---- */
var BUB = [], SAYT = {}, LASTFOE = {}, ENGT = {};
var LINES = {
  caerwyn: { summon: ['I ask of you, are you my Master?'], engage: ['Stand and face me.', 'I will not yield this ground.'], kill: ['Rest. You fought with honor.'], np: ['Let the light of this blade answer!'], low: ['Not yet... I am not finished.'], masterdown: ['Master...! I failed to protect you.'] },
  richard: { summon: ['Saber, Richard of England, answers your call. Shall we ride?'], engage: ['Ha! A worthy foe at last!'], kill: ['Glory to the crown!'], np: ['Every blade I hold is a holy sword!'] },
  leonidas: { summon: ['Lancer, King of Sparta. Point me at the enemy, and I will hold the line.'], engage: ['Come. Break yourself on my shield.'], kill: ['Sparta stands.'], low: ['A Spartan does not fall so easily!'] },
  atalanta: { summon: ['Archer has come. Keep pace with me, Master, or be left behind.'], engage: ['Too slow.'], kill: ['The hunt is over.'] },
  emiya: { summon: ['Archer. Try not to make me regret answering that call.'], engage: ['You picked the wrong night.'], kill: ['Stay down.'], np: ['I am the bone of my sword.'], low: ['Heh... still standing.'] },
  heracles: { summon: ['■■■■■■■■—!!'] },
  lancelot: { summon: ['Grrrr... ...rrrRRR!'] },
  hassan: { summon: ['Assassin answers from the shadows. Name the one who must die.'], engage: ['Your heart is already mine.'], kill: ['Gone, like smoke.'] },
  diarmuid: { summon: ['Lancer of the Fianna. My spears are yours, and my loyalty with them.'], engage: ['Face me with honor!'], kill: ['A fine duel.'], masterdown: ['My lord...! Forgive me.'] },
  cu: { summon: ["Lancer's here. So you're my Master? Let's make this a good fight."], engage: ["Now this'll be fun!"], kill: ['Not bad. Not good enough.'], np: ['Your heart is mine!'] },
  gilgamesh: { ubwgilR: ['Mongrel...'], summon: ['You summoned a king, mongrel. Try to be worth my time.'], engage: ['Know your place.'], kill: ['Fitting, for trash.'], np: ['Behold my treasury!'], low: ['You dare wound me?!'] },
  iskandar: { summon: ['I am Rider, King of Conquerors! Now, where can I find a map of this land?'], engage: ['Join my army, and I may spare you!'], kill: ['A splendid foe. To the next!'], np: ['Behold, my eternal army!'] },
  gilles: { summon: ['Caster has arrived. Oh, what splendid horrors we shall make together!'], engage: ['Oh, how delightful!'], kill: ['Cool! Cool!'] },
  medusa: { summon: ['Rider. I will be your shield, Master. Give your orders.'], engage: ['Stay still.'], kill: ['...'] },
  medea: { summon: ["Caster. A circle this crude... you'll need me more than you know."], engage: ['How tiresome.'], kill: ['Fools never learn.'] },
  kojirou: { summon: ['Assassin. A mere swordsman, but a fine night for a duel.'], engage: ['Show me your blade.'], kill: ['A pity. It was a good moon.'], np: ['Swallow Reversal.'] },
  shirou: { ubwgil: ["Let's go, King of Heroes. I hope you stored up enough weapons."], summon: ['M-Master? Wait, where did you even come from?!'], engage: ["I won't let anyone get hurt!"], kill: ['...Sorry.'], servantdown: ["No... I couldn't protect you."], low: ['I can still move...!'] },
  rin: { summon: ["Yes, I'm your Master. And you had better be the strongest one."], engage: ['Gandr, coming right up!'], kill: ['Hmph. Elegantly done.'], servantdown: ["Don't you dare disappear on me!"] },
  kiritsugu: { summon: ['I am. Follow the plan, and this ends quickly.'], engage: ['Target acquired.'], kill: ['Clean.'], servantdown: ['...Change of plans.'] },
  kirei: { summon: ['I am. Let us see what this war will show me.'], engage: ['How interesting.'], kill: ['May you find peace.'] },
  kayneth: { summon: ['Naturally. Serve with distinction, as befits my house.'], engage: ['Know the difference in our standing!'], servantdown: ['Useless...!'] },
  waver: { summon: ["Y-yes! I'm your Master! This is going to work. It IS!"], engage: ['Rider, do something!'], servantdown: ['Rider...!'] },
  irisviel: { summon: ["I am. Let's win this together, for the ones waiting at home."], engage: ['Stay close to me.'], servantdown: ['No... not yet...'] },
  illya: { summon: ["Mm-hm! You're mine now. Let's go crush everyone."], engage: ['Found you~'], kill: ['Bye-bye!'], servantdown: ['...Liar. You said you were the strongest.'] },
  kariya: { summon: ['I am... For her sake, we will not lose.'], engage: ['Tokiomi... is that you?'], servantdown: ['Not like this...'] },
  sakura: { summon: ["I... I am. Please, don't leave me alone."], engage: ['Please... just go away.'], servantdown: ["Don't leave me...!"] },
  caren: { summon: ['Come, then. Let us see what kind of sinner answers me.'], engage: ['How sad. You think you can win.', 'Shall I pray for you now, or after?'], kill: ['Amen. That was quick.', 'There. You can rest from yourself.'], servantdown: ['...So even you could not stay. Typical.'] },
  tokiomi: { summon: ['I am. A Tohsaka does not lose his composure, and does not lose.'], engage: ['Let us settle this with dignity.'], kill: ['Elegance, to the very end.'], servantdown: ['This was not... how it was meant to go.'] },
  kuzuki: { summon: ['I am. I have no wish of my own. Tell me what you need.'], engage: ['...'], kill: ['It is finished.'], servantdown: ['I see. Then I will go on alone.'] }
};
var LINE_S = { engage: ['Face me!', 'Another challenger.', 'Here we go.'], kill: ['One less.', 'It is done.', 'Next.'], np: ['Witness my Noble Phantasm!', 'This ends now!'], low: ['Not yet...!', 'I can still fight.'], masterdown: ['Master...!', 'My Master has fallen...'], contract: ['A new pact, then. Lead well.', 'Very well. I am yours.'] };
var LINE_M = { engage: ['Careful!', 'Enemy Master!', 'There they are!'], kill: ['Did we... win?', 'One less team.'], low: ['I need help!', 'This is bad...'], servantdown: ['No... my Servant...', 'It is over for us...'], contract: ['Then fight for me now.'] };
var LINE_B = { engage: ['■■■■■—!!', 'RRRAAAAGH!'], kill: ['■■■■■■!!'], np: ['■■■■■■■■—!!!'], low: ['Grrrrr...'], masterdown: ['...rrr...'], contract: ['Grrr.'] };
function pickLine(f, key) {
  var own = LINES[f.def.id] && LINES[f.def.id][key], pool = own || (f.def.cls === 'Berserker' ? LINE_B[key] : f.def.isMaster ? LINE_M[key] : LINE_S[key]);
  return pool && pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
function showBubble(f, s, life, big) { BUB = BUB.filter(function (b) { return b.f !== f; }); BUB.push({ f: f, s: s, t0: performance.now(), life: life || 2.4, big: !!big }); }
FX.say = function (f, key) {
  if (!f || !G || G.mode !== 'war' || INTRO || f.st === 'dead' || !FX.near(f.x, f.y)) return;
  var ch = { np: 0.4, engage: 0.45, kill: 0.75 }[key]; if (ch !== undefined && Math.random() > ch) return;
  var now = performance.now() / 1000; if (SAYT[f.idx] && now - SAYT[f.idx] < 5) return;
  var s = pickLine(f, key); if (!s) return; SAYT[f.idx] = now; showBubble(f, s, 2.0 + s.length * 0.035);
};
// a scripted exchange: the first line now, the answer a moment later; both ignore the chance and cooldown
var DUO = [];
FX.duo = function (a, ka, b, kb) {
  if (!G || G.mode !== 'war' || !FX.near(a.x, a.y)) return;
  var s = pickLine(a, ka); if (!s) return; SAYT[a.idx] = performance.now() / 1000; showBubble(a, s, 3.2, true);
  DUO.push({ at: performance.now() + 2600, f: b, k: kb });
};
function wrapText(c, s, maxW) { var w = s.split(' '), out = [], cur = ''; w.forEach(function (x) { var t = cur ? cur + ' ' + x : x; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = x; } else cur = t; }); if (cur) out.push(cur); return out; }
function drawBubbles(cx, cy, zoom) {
  if (!G || G.mode !== 'war') { BUB = []; return; }
  // a fighter that turns on a new foe close by may call out
  if (!INTRO && G.time > 4) G.f.forEach(function (f) { if (f.foe !== LASTFOE[f.idx]) { LASTFOE[f.idx] = f.foe; if (f.foe && f.st !== 'dead' && dist(f, f.foe) < 600 && !(ENGT[f.idx] > G.time)) { ENGT[f.idx] = G.time + 20; FX.say(f, 'engage'); } } });
  var now = performance.now(), c = ctx;
  DUO = DUO.filter(function (d) { if (d.text !== undefined || now < d.at) return true; if (d.f.st !== 'dead') { var s2 = pickLine(d.f, d.k); if (s2) { SAYT[d.f.idx] = now / 1000; showBubble(d.f, s2, 2.6, true); } } return false; });
  BUB = BUB.filter(function (b) { return (now - b.t0) / 1000 < b.life && (b.f.st !== 'dead' || INTRO); });
  BUB.forEach(function (b) {
    var f = b.f; if (!visL(f)) return;
    var age = (now - b.t0) / 1000, al = Math.min(1, age / 0.15, (b.life - age) / 0.3), px = (f.x - cx) * zoom + VW / 2, py = (f.y - cy) * zoom + VH / 2 - 40 * zoom - 16;
    var fs = b.big ? (VW < 560 ? 16 : 19) : 14; c.font = (b.big ? '600 ' : '600 ') + fs + 'px "Barlow Condensed", sans-serif';
    var lines = wrapText(c, b.s, b.big ? 300 : 210), w = Math.max.apply(null, lines.map(function (l) { return c.measureText(l).width; })) + 20, h = lines.length * (fs + 3) + 12;
    var bx = clamp(px - w / 2, 8, VW - w - 8), by = clamp(py - h - 8 + (1 - Math.min(1, age / 0.15)) * 8, 8, VH - h - 8);
    c.globalAlpha = clamp(al, 0, 1); c.fillStyle = 'rgba(246,242,230,.96)'; rrect(c, bx, by, w, h, 8); c.fill(); c.strokeStyle = teamCol(f); c.lineWidth = 2; c.stroke();
    c.beginPath(); c.moveTo(clamp(px, bx + 12, bx + w - 12) - 7, by + h - 1); c.lineTo(clamp(px, bx + 12, bx + w - 12), by + h + 9); c.lineTo(clamp(px, bx + 12, bx + w - 12) + 7, by + h - 1); c.closePath(); c.fillStyle = 'rgba(246,242,230,.96)'; c.fill();
    c.fillStyle = '#16181c'; c.textAlign = 'center'; lines.forEach(function (l, i) { c.fillText(l, bx + w / 2, by + 6 + (i + 1) * (fs + 3) - 4); });
    c.globalAlpha = 1;
  });
}
