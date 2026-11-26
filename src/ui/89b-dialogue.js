/* ---- the dialogue pass: fuller lines for every character, rivals who answer each other when they meet,
   conversations at the King's table, and Rule Breaker's broken contract. All lines are original. ---- */
var MORE_LINES = {
  caren: { low: ['It only hurts. Go on.', 'My wounds are open anyway.'] },
  tokiomi: { low: ['A setback. Nothing more.', 'Composure... composure.'] },
  kuzuki: { low: ['Still standing.', 'Pain is information.'], servantdown: ['I see. I will continue.'] },
  caerwyn: { engage: ['I will not fall here.', 'Your blade against mine, then.', 'Stand aside, or be cut down.'], kill: ['It is finished.', 'Go in peace.'], np: ['Ex... calibur!', 'Light, answer me!'], low: ['This is nothing.', 'A knight does not kneel.'], masterdown: ['Forgive me. I was too late.'], contract: ['Then I will be your sword.'] },
  richard: { engage: ['Have at you!', 'For England, and for glory!'], kill: ['A worthy foe, now silent.'], low: ['Ha! Only a scratch!'], masterdown: ['My master... I will ride on alone.'] },
  leonidas: { engage: ['Hold the line!', 'This is the pass. You will not cross it.'], kill: ['Next.'], np: ['Stand, Three Hundred!'], masterdown: ['A Spartan fights on.'] },
  atalanta: { engage: ['My arrows find their mark.', 'Run, if you can.'], kill: ['Swift and clean.'], np: ['Hear me, Apollo and Artemis!'], low: ['I am not caught yet!'] },
  emiya: { engage: ['Trace, on.', 'Let’s see how long you last.'], kill: ['Don’t get up.', 'That was a waste of both our time.'], low: ['Not bad... for an amateur.'], masterdown: ['Tch. Independent action, then.'], contract: ['Fine. But I give the orders on the field.'] },
  heracles: { engage: ['■■■■—!!', 'RRRAAAGH!'], kill: ['■■■■■!!'], np: ['■■■■■■■—!!!'] },
  lancelot: { engage: ['Grrrr...', '...Arrrr...'], kill: ['■■■!'] },
  hassan: { engage: ['Your shadow is long tonight.', 'You never saw me.'], kill: ['Your heart was mine.'], np: ['Zabaniya.'], low: ['I will fade... and return.'] },
  diarmuid: { engage: ['Two spears, one honor.', 'Face me, if you are a knight!'], kill: ['Rest. You fought well.'], np: ['The crimson rose cuts deep!'], low: ['My oath is not broken yet.'], masterdown: ['My lord... I failed my oath again.'] },
  cu: { engage: ['Now we’re talking!', 'Let’s see what you’ve got!'], kill: ['That’s the job.', 'Shame. I was having fun.'], low: ['Heh. I’m good at surviving.'], masterdown: ['Figures. Guess I’m on my own.'] },
  gilgamesh: { engage: ['You dare raise your head to me?', 'Amuse me, mongrel.'], kill: ['Trash returns to dust.', 'Know your place.'], low: ['You... you dared?!'], masterdown: ['I have no need of a master.'], contract: ['You may serve me. Be grateful.'] },
  iskandar: { engage: ['Ho! A worthy foe!', 'Ride with me, or fall before me!'], kill: ['A fine end. Remember it!'], low: ['Ha! Still standing!'], masterdown: ['My boy... I will carry on.'], contract: ['Then we ride together!'] },
  gilles: { engage: ['Oh, how splendid!', 'Despair for me, won’t you?'], kill: ['Cool! COOL!'], np: ['Behold, the spellbook of madness!'] },
  medusa: { engage: ['You cannot run.', 'Look at me.'], kill: ['It is done.'], np: ['Bellerophon.'], masterdown: ['...Sakura?'] },
  medea: { engage: ['How tedious.', 'You walked into my web.'], kill: ['Did you think magic was a game?'], np: ['Every contract breaks before this blade.', 'Rule Breaker!'], low: ['How dare you!'] },
  kojirou: { engage: ['Let us see which blade is truer.', 'The moon watches. Draw.'], kill: ['A pity. A fine swordsman.'], np: ['Three arcs, one moment.'], low: ['Ha. You cut well.'] },
  shirou: { engage: ['I won’t back down!', 'Trace, on!'], kill: ['...I had to.'], low: ['Not... done yet...!'], contract: ['I’ll fight beside you. That’s a promise.'] },
  rin: { engage: ['Don’t underestimate a Tohsaka!', 'Gandr, take this!'], kill: ['Elegantly, as always.'], low: ['Ugh... that was careless.'], contract: ['Fine. But I set the rules.'] },
  kiritsugu: { engage: ['Moving in.', 'Clear the line.'], kill: ['Confirmed.'], low: ['Time Alter... double accel.'], contract: ['Do your job. I’ll do mine.'] },
  kirei: { engage: ['Let us see your despair.', 'Pray, if it helps.'], kill: ['Rest. Your suffering is over.'], low: ['Interesting...'] },
  kayneth: { engage: ['Know the gap between us!', 'Volumen Hydrargyrum!'], kill: ['As expected of a lord of the Clock Tower.'], low: ['Impossible!'] },
  waver: { engage: ['I-I’m not scared!', 'I’ll show you I’m a real magus!'], kill: ['I... did it?'], low: ['This is bad, this is bad!'] },
  irisviel: { engage: ['I won’t lose here.', 'Stay behind me!'], kill: ['I’m sorry it had to be this way.'], low: ['Kiritsugu...'] },
  illya: { engage: ['Let’s play!', 'Berserker, crush them~'], kill: ['That was boring.'], low: ['Ow! That hurt!'] },
  kariya: { engage: ['For Sakura...!', 'The worms hunger.'], kill: ['One less...'], low: ['Not yet... not until she’s free...'] },
  sakura: { engage: ['Please... don’t make me.', 'The shadow is hungry.'], kill: ['I’m sorry... I’m so sorry.'], low: ['It hurts... Senpai...'] }
};
Object.keys(MORE_LINES).forEach(function (id) { var L = LINES[id] = LINES[id] || {}; Object.keys(MORE_LINES[id]).forEach(function (k) { L[k] = (L[k] || []).concat(MORE_LINES[id][k]); }); });
// rivals: the first time A turns on B, A speaks and B answers
var PAIRS = {
  'caerwyn>gilgamesh': ['Archer. The golden king walks again.', 'Still clinging to that sword, Saber? Kneel, and I may keep you.'],
  'gilgamesh>caerwyn': ['Ah, Saber. Have you come to be claimed?', 'I belong to no one. Least of all to you.'],
  'caerwyn>lancelot': ['That armor... Sir Lancelot?', 'Ar... thurrr...!'],
  'lancelot>caerwyn': ['AR... THURRR!', 'Lancelot. What has become of you?'],
  'caerwyn>iskandar': ['Rider. You speak of kingship too freely.', 'And you carry it far too heavily, little king!'],
  'iskandar>caerwyn': ['Saber! Still brooding over your lost kingdom?', 'I do not brood. I mourn.'],
  'caerwyn>diarmuid': ['Lancer of the Fianna. Your spears are honest.', 'Then let us cross them honestly, Saber!'],
  'caerwyn>kojirou': ['A swordsman at the gate.', 'Only a farmer with a long blade. Shall we?'],
  'emiya>cu': ['You again. Don’t you ever get tired?', 'Not when the fight’s this good, Archer!'],
  'cu>emiya': ['Archer! Ready for round two?', 'I never finished round one with you.'],
  'emiya>gilgamesh': ['Your treasury against my blades. Let’s see who runs out first.', 'A forger who copies my treasures. How amusing.'],
  'emiya>caerwyn': ['...Saber.', 'Archer? Why do you look at me like that?'],
  'emiya>shirou': ['You should have stayed out of this, kid.', 'Who are you? Why do you hate me?'],
  'shirou>emiya': ['That stance... why does it look so familiar?', 'Because you’ll never be anything but a fake.'],
  'heracles>gilgamesh': ['■■■■■—!!', 'A mad dog with many lives. I have a weapon for each.'],
  'iskandar>gilgamesh': ['The King of Heroes! Join my army!', 'You would recruit me? Know your place, conqueror.'],
  'leonidas>iskandar': ['Persians, horses, kings. I have stood against all of them.', 'A Spartan! Now this is a fight worth telling!'],
  'medusa>caerwyn': ['Saber. Stay away from my master.', 'Then stand aside, Rider.'],
  'diarmuid>kojirou': ['A blade as patient as moonlight.', 'And a spear as honest as dawn. Come.'],
  'illya>shirou': ['Found you, Onii-chan~', 'Illya? You’re a master too?'],
  'shirou>illya': ['Illya, we don’t have to fight.', 'Mm. But it’s more fun if we do.'],
  'sakura>rin': ['Nee-san... you always got everything.', 'Sakura... I’m sorry. I won’t hold back.'],
  'rin>sakura': ['Sakura. Go home. Please.', 'This is the only home I have, Nee-san.'],
  'kiritsugu>kirei': ['Kotomine Kirei.', 'Emiya Kiritsugu. At last, someone who might answer me.'],
  'kirei>kiritsugu': ['Emiya. Tell me what you hoped to find.', 'Nothing you’d understand.'],
  'kiritsugu>kayneth': ['Lord El-Melloi. Your mystic code won’t save you.', 'A mercenary with toys! You dare approach me?'],
  'kayneth>waver': ['Waver Velvet. You stole my relic, boy.', 'I-I’ll prove I’m a real magus!'],
  'waver>kayneth': ['Professor! I’m not your student anymore!', 'You were never worth teaching.'],
  'rin>kirei': ['Kirei. You knew. You always knew.', 'Rin. Your father would be proud. Or perhaps not.'],
  'kariya>rin': ['Rin... tell your mother I’m sorry.', 'Uncle Kariya? What happened to you?'],
  'kariya>kirei': ['You... you’re the one who...', 'Hm. Still breathing, Matou? How diligent.'],
  'irisviel>kirei': ['Stay away from us, priest.', 'The vessel speaks. How curious.']
};
var PAIRSEEN = {};
function tryPair(f, e) {
  var k = f.def.id + '>' + e.def.id, P = PAIRS[k]; if (!P || PAIRSEEN[k] || e.st === 'dead') return false;
  if (!FX.near(f.x, f.y)) return false;
  PAIRSEEN[k] = PAIRSEEN[e.def.id + '>' + f.def.id] = true;
  SAYT[f.idx] = performance.now() / 1000; showBubble(f, P[0], 3.2, true);
  DUO.push({ at: performance.now() + 2600, f: e, text: P[1] });
  return true;
}
// conversations at the King's table, played once per banquet when the right guests are seated
var BANQ_SCRIPTS = [
  { need: ['iskandar', 'caerwyn', 'gilgamesh'], lines: [['iskandar', 'Tonight we settle this with wine, not swords! What would each of you ask of the Grail?'], ['caerwyn', 'I would save my country. I would undo its fall.'], ['gilgamesh', 'A king who regrets her own reign. How pitiful.'], ['iskandar', 'A king does not apologize for the road they rode, Saber.'], ['caerwyn', 'A king exists to serve the people. Nothing more.'], ['iskandar', 'Then you were never a king. Only a sacrifice.'], ['gilgamesh', 'Pour me another. This is the best entertainment of the war.']] },
  { need: ['iskandar', 'caerwyn'], lines: [['iskandar', 'Drink, Saber! What is it you want from the Grail?'], ['caerwyn', 'To save the kingdom I failed.'], ['iskandar', 'Ha! Then you never understood what a king is for.'], ['caerwyn', 'And you never understood what a king owes.']] },
  { need: ['iskandar', 'gilgamesh'], lines: [['iskandar', 'Archer! You’ve brought your own wine?'], ['gilgamesh', 'Everything at this table is mine already, Rider.'], ['iskandar', 'Then share it like a king!'], ['gilgamesh', '...Very well. Drink, and be honored.']] },
  { need: ['iskandar', 'leonidas'], lines: [['iskandar', 'The king of Sparta! Your three hundred would have made a fine vanguard.'], ['leonidas', 'They would have made a fine wall. Your horses would have broken on it.'], ['iskandar', 'Ha! Drink, then, wall-builder!']] },
  { need: ['gilgamesh', 'caerwyn'], lines: [['gilgamesh', 'Sit, Saber. You will drink my wine and listen.'], ['caerwyn', 'I did not come here to be lectured.'], ['gilgamesh', 'No. You came to be admired. I permit it.']] },
  { need: ['caerwyn', 'richard'], lines: [['richard', 'My king! To share a table with you is a dream!'], ['caerwyn', 'Richard. You were a far braver king than I.'], ['richard', 'Braver, perhaps. But never truer.']] },
  { need: ['gilgamesh', 'caren'], lines: [['caren', 'A king who drinks at another king\u2019s table. How humble of you.'], ['gilgamesh', 'Your tongue is sharper than your faith, nun. Pour, and I will permit it.']] },
  { need: ['gilgamesh', 'tokiomi'], lines: [['tokiomi', 'Your Majesty honours this table.'], ['gilgamesh', 'Silence, Tokiomi. Kings are speaking.']] }
];
var BSCRIPT = null;
function banquetScript() {
  var k = G.tasks && G.tasks.filter(function (q) { return q.kind === 'banquet'; })[0]; if (!k || !isDay()) { BSCRIPT = null; return false; }
  var here = G.f.filter(function (f) { return f.st !== 'dead' && Math.hypot(f.x - k.x, f.y - k.y) < k.r + 120 && FX.near(f.x, f.y); }), ids = here.map(function (f) { return f.def.id; });
  if (!BSCRIPT) { var sc = BANQ_SCRIPTS.filter(function (s) { return !s.done && s.need.every(function (n) { return ids.indexOf(n) >= 0; }); })[0]; if (!sc) return false; sc.done = true; BSCRIPT = { sc: sc, i: 0, t: 0 }; }
  if (G.time < BSCRIPT.t) return true;
  var L = BSCRIPT.sc.lines[BSCRIPT.i]; if (!L) { BSCRIPT = null; banqT = G.time + 6; return false; }
  var who = here.filter(function (f) { return f.def.id === L[0]; })[0]; if (who) showBubble(who, L[1], 3.6, true);
  BSCRIPT.i++; BSCRIPT.t = G.time + 3.8; return true;
}
(function () {
  var chat0 = banquetChatter; banquetChatter = function () { if (banquetScript()) return; chat0(); };
  // DUO entries may carry their own text
  var tick0 = drawBubbles; drawBubbles = function (cx, cy, zoom) { var now = performance.now(); DUO = DUO.filter(function (d) { if (d.text === undefined || now < d.at) return true; if (d.f.st !== 'dead') { SAYT[d.f.idx] = now / 1000; showBubble(d.f, d.text, 3.0, true); } return false; }); tick0(cx, cy, zoom); };
  // rivals speak first; ordinary call-outs otherwise
  var say0 = FX.say; FX.say = function (f, key) { if (key === 'engage' && f && f.foe && G && G.mode === 'war' && !INTRO && tryPair(f, f.foe)) return; say0(f, key); };
})();
/* ---- Rule Breaker: a broken contract, for a few seconds ---- */
FX.turned = function (s, by) {
  if (!G.f[MEI]) return; var me = G.f[MEI], m = s.partner, mn = m ? shortName(m.def.name) : 'your master';
  if (s === me) FX.banner('Rules Are Broken', 'You are no longer bound to ' + mn + '. For a moment, you serve the witch of Colchis.');
  else if (m === me) FX.banner('Your contract is cut', 'Rule Breaker has turned ' + knownName(s) + ' against you. Survive a few seconds!');
  else if (FX.near(s.x, s.y)) note('Rule Breaker cuts ' + teamName(s.trueTeam) + '’s contract!', '#b48cff');
  if (FX.near(s.x, s.y)) { showBubble(by, 'Your contract is mine now.', 2.6, true); flashFx('#7a3cc8', 0.25, 0.4); }
};
FX.unturned = function (s) {
  if (!G.f[MEI]) return; var me = G.f[MEI], m = s.partner;
  if (s === me) FX.banner('The bond returns', 'You are bound to ' + (m ? shortName(m.def.name) : 'your master') + ' once more.');
  else if (m === me) note(knownName(s) + ' is yours again.', '#9fe6b0');
};
// the turned servant wears broken purple chains; a turned player sees the world through them
function drawTurned(g, f) {
  if (f.trueTeam === undefined || f.st === 'dead') return; var t = G.time, left = Math.max(0, f.turnT - t);
  g.save(); g.strokeStyle = '#b48cff'; g.lineWidth = 3; g.setLineDash([10, 6]); g.lineDashOffset = -t * 30; g.beginPath(); g.arc(f.x, f.y, FR + 14, 0, 6.283); g.stroke(); g.setLineDash([]);
  for (var i = 0; i < 4; i++) { var a = i * 1.57 + t; g.beginPath(); g.arc(f.x + Math.cos(a) * (FR + 14), f.y + Math.sin(a) * (FR + 14), 4, 0, 6.283); g.fillStyle = '#7a3cc8'; g.fill(); }
  g.fillStyle = '#d6b4ff'; g.font = '700 13px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillText('CONTRACT BROKEN ' + Math.ceil(left), f.x, f.y - FR - 30);
  g.restore();
}
function drawTurnedScreen() {
  var me = G.f[MEI]; if (!me || !(me.turnT > G.time)) return; var c = ctx, p = 0.5 + 0.5 * Math.sin(G.time * 4);
  c.fillStyle = 'rgba(90,30,140,' + (0.12 + 0.05 * p) + ')'; c.fillRect(0, 0, VW, VH);
  c.textAlign = 'center'; c.font = '400 ' + (VW < 560 ? 22 : 30) + 'px "Marcellus SC", "Times New Roman", serif'; c.fillStyle = '#d6b4ff'; c.fillText('RULES ARE BROKEN · ' + Math.ceil(me.turnT - G.time), VW / 2, VH * 0.36);
}
(function () { var ff0 = drawFighterFx; drawFighterFx = function (g, f) { ff0(g, f); drawTurned(g, f); }; })();
