/* ---- Downtime talk: now and then, out of combat, a master and their servant speak while walking or working.
   Rare by design: one exchange per pair every couple of minutes at most, never near a fight. Lore pairs have their own
   conversations; others fall back to short generic exchanges. Kiritsugu says nothing: his servant may speak to him. ---- */
var DOWN = { first: [30, 90], gap: [90, 160], quiet: 15, near: 320, enemy: 900, step: 3.6 };
// conversations by master|servant; each line is ['m' or 's', text]
var DOWN_PAIRS = {
  'kiritsugu|caerwyn': [[['s', 'Master. We should speak about tonight’s plan.']], [['s', 'You could at least look at me when I report.']], [['s', 'Irisviel is worried about you. So am I, though you will not believe it.']]],
  'irisviel|caerwyn': [[['m', 'Saber, look! Even the streets here are lovely.'], ['s', 'Stay close, Irisviel. Lovely streets hide enemies too.'], ['m', 'Then you will just have to protect me.']], [['m', 'Do you think Kiritsugu is all right?'], ['s', 'He is stronger than he lets anyone see.'], ['m', 'That is what worries me.']]],
  'shirou|caerwyn': [[['m', 'You hungry, Saber? I can cook something when we get back.'], ['s', '...I would not refuse.'], ['m', 'Ha. I will make extra.']], [['s', 'Shirou, you must not throw yourself in front of me again.'], ['m', 'I can’t just watch you get hurt.'], ['s', 'That is exactly what a master must do.']]],
  'rin|emiya': [[['m', 'Archer, stop smirking. What?'], ['s', 'Nothing. You remind me of someone, that is all.'], ['m', 'Well, stop it.']], [['m', 'You still haven’t told me your name.'], ['s', 'It would not help you.'], ['m', 'Let me decide that.']]],
  'tokiomi|gilgamesh': [[['m', 'My king, the city is at your disposal.'], ['s', 'It always was, Tokiomi. Do not pretend you are giving me anything.']], [['s', 'You are dull, Tokiomi. Elegant, and dull.'], ['m', '...I live to serve, my king.']]],
  'kirei|hassan': [[['s', 'Master. The others suspect nothing.'], ['m', 'Good. Keep watching. Report everything.']], [['m', 'Tell me, Assassin. What do your other selves want?'], ['s', '...Each of us wants a face of our own.'], ['m', 'How very human.']]],
  'kirei|cu': [[['s', 'Another night of scouting and running away? I’m bored, priest.'], ['m', 'Endure it. The order stands.'], ['s', 'Tch.']]],
  'waver|iskandar': [[['m', 'Rider! Put your armour away, people are staring!'], ['s', 'Let them stare! A king should be seen.'], ['m', 'You are not a king here, you’re a giant in a T-shirt!']], [['s', 'Boy, you have grown a little since we met.'], ['m', '...You think so?'], ['s', 'A little. Don’t let it go to your head.']]],
  'kayneth|diarmuid': [[['m', 'Lancer. Your only task is to obey.'], ['s', 'I understand, my lord. I wish only to serve you faithfully.'], ['m', 'Your wishes do not concern me.']], [['s', 'My lord, Lady Sola-Ui asked after you.'], ['m', 'Did she. And why did she ask you?'], ['s', '...I could not say, my lord.']]],
  'kariya|lancelot': [[['m', 'Just... a little longer. For Sakura.'], ['s', 'Rrrrh...']], [['s', 'Arrrthur...'], ['m', 'I know. You want your king. I want mine dead too.']]],
  'ryuunosuke|gilles': [[['m', 'Hey, big eyes, the art last night was amazing. What next?'], ['s', 'Patience, Ryuunosuke. A masterpiece must ripen.'], ['m', 'Ooh. I love it when you talk like that.']], [['s', 'God watches us, my friend. He does nothing.'], ['m', 'Then let’s give him something to watch!']]],
  'sakura|medusa': [[['m', 'Rider... thank you for staying with me.'], ['s', 'It is my wish to protect you, Sakura.']], [['s', 'You should rest. You are pale.'], ['m', 'I’m always pale. It’s fine.'], ['s', 'It is not.']]],
  'illya|heracles': [[['m', 'Berserker, carry me! My feet hurt.'], ['s', 'Rrh.'], ['m', 'Hehe. You’re the strongest, you know.']], [['m', 'You won’t ever leave me, right?'], ['s', '...Rrrh.'], ['m', 'Good.']]],
  'kuzuki|medea': [[['s', 'Souichirou-sama, have you eaten?'], ['m', 'I have.'], ['s', '...Then I am glad.']], [['m', 'Is the temple safe?'], ['s', 'As long as I stand, nothing will reach you.'], ['m', 'Then I will not worry.']]],
  'caren|gilgamesh': [[['s', 'Nun. Do you ever smile?'], ['m', 'Only when someone falls on their face. Please try.']]],
  'caren|lancelot': [[['m', 'My wounds ache near you. You carry a great deal of guilt.'], ['s', 'Rrrh...'], ['m', 'Yes. I thought so.']]]
};
// generic exchanges, by who speaks first
var DOWN_GEN = [
  [['m', 'Anything nearby?'], ['s', 'Nothing yet. Stay alert.']],
  [['s', 'This town is quiet. Too quiet.'], ['m', 'Let’s keep it that way a while longer.']],
  [['m', 'How are you holding up?'], ['s', 'Well enough. Worry about yourself.']],
  [['s', 'Where to next, Master?'], ['m', 'Somewhere we can see them first.']],
  [['m', 'Do you ever miss your own time?'], ['s', 'Every hour. Then I remember why I came.']],
  [['s', 'You should rest when you can.'], ['m', 'I will rest when this is over.']],
  [['m', 'What will you wish for, if we win?'], ['s', 'Win first. Then ask me again.']]
];
var MAD = { heracles: 1, lancelot: 1 };
var DOWNT = {}, DOWNRUN = null, DOWNSAID = {}, DOWNG = null;
function calmFor(f) { return G.time - (f.lastHitT === undefined ? -999 : f.lastHitT); }
function downtimeTalk() {
  if (!G || G.mode !== 'war' || G.over || (G.clock && G.clock.final)) return;
  if (DOWNG !== G) { DOWNG = G; DOWNT = {}; DOWNRUN = null; DOWNSAID = {}; }
  if (DOWNRUN) { if (G.time < DOWNRUN.t) return; var L = DOWNRUN.lines[DOWNRUN.i]; var who = L ? (L[0] === 'm' ? DOWNRUN.m : DOWNRUN.s) : null;
    if (!L || who.st === 'dead' || calmFor(DOWNRUN.m) < 3 || calmFor(DOWNRUN.s) < 3) { DOWNRUN = null; return; }
    showBubble(who, L[1], 3.4); DOWNRUN.i++; DOWNRUN.t = G.time + DOWN.step; return; }
  G.f.forEach(function (m) {
    if (DOWNRUN || !m.def.isMaster) return;
    var s = m.partner; if (!s || m.st === 'dead' || s.st === 'dead' || m.resc || s.resc) return;
    if (!FX.near(m.x, m.y) || Math.hypot(m.x - s.x, m.y - s.y) > DOWN.near) return;
    if (DOWNT[m.idx] === undefined) DOWNT[m.idx] = G.time + DOWN.first[0] + Math.random() * (DOWN.first[1] - DOWN.first[0]);
    if (G.time < DOWNT[m.idx]) return;
    // out of combat: neither has fought for a while and no known enemy is close
    if (calmFor(m) < DOWN.quiet || calmFor(s) < DOWN.quiet || m.st !== 'idle' || s.st !== 'idle') return;
    if (G.f.some(function (e) { return e.st !== 'dead' && e.team !== m.team && !pactTeams(e.team, m.team) && Math.hypot(e.x - m.x, e.y - m.y) < DOWN.enemy; })) return;
    DOWNT[m.idx] = G.time + DOWN.gap[0] + Math.random() * (DOWN.gap[1] - DOWN.gap[0]);
    var key = m.def.id + '|' + s.def.id, pool = DOWN_PAIRS[key], said = DOWNSAID[key] = DOWNSAID[key] || {};
    var lines = null;
    if (pool) { var fresh = pool.filter(function (c, i) { return !said[i]; }); if (fresh.length) { lines = fresh[Math.floor(Math.random() * fresh.length)]; said[pool.indexOf(lines)] = 1; } }
    if (!lines) {
      if (m.def.id === 'kiritsugu') return; // Kiritsugu does not make small talk
      var g = DOWN_GEN.filter(function (c, i) { return !said['g' + i]; }); if (!g.length) return;
      lines = g[Math.floor(Math.random() * g.length)]; said['g' + DOWN_GEN.indexOf(lines)] = 1;
      if (MAD[s.def.id]) lines = lines.map(function (l) { return l[0] === 's' ? ['s', 'Rrrh...'] : l; });
    }
    DOWNRUN = { m: m, s: s, lines: lines, i: 0, t: G.time };
  });
}
(function () { var b0 = banquetChatter; banquetChatter = function () { b0(); downtimeTalk(); }; })();
