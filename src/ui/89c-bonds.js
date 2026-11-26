/* ---- bonds: family and history between characters. Exchanges when they meet as enemies, lines when a
   truce puts them side by side, a hesitation when one would kill the other, and last words for those kills.
   All lines are original. ---- */
var MORE_PAIRS = {
  // Tokiomi: his student, his rival in love, his enemies and his daughter
  // Caren: the father who left her, the boy who bleeds for strangers, the King who is amused by her
  'caren>kirei': ['Father. I came to watch you fail.', 'Then watch closely. I have never disappointed you in that.'],
  'kirei>caren': ['Caren. Did the Church send you?', 'No one sent me. I wanted to see your face when you lose.'],
  'caren>shirou': ['You again. Do you enjoy bleeding for strangers?', 'Someone has to.'],
  'caren>gilles': ['There you are. My wounds have been screaming about you all night.', 'A saint! Come, let me show you heaven!'],
  'caren>kariya': ['You are rotting from the inside. I can feel every worm.', 'Then get out of my way.'],
  'tokiomi>kirei': ['Kirei. You\u2019ve done well. Remember your place in the plan.', 'Of course, Master. I remember everything.'],
  'kirei>tokiomi': ['Teacher. I had wondered when we\u2019d meet.', 'Kirei? This was not part of our arrangement.'],
  'tokiomi>kariya': ['Kariya. You threw away your magecraft, and now you return like this?', 'You gave her away, Tokiomi. I\u2019ll make you answer for it.'],
  'kariya>tokiomi': ['TOKIOMI!', 'How unsightly. You were always a failure, Kariya.'],
  'tokiomi>kiritsugu': ['The Magus Killer. A mercenary with no place in this ritual.', 'You\u2019ll die believing in rituals.'],
  'tokiomi>kayneth': ['Lord El-Melloi. Let us conduct this properly.', 'At last, an opponent with breeding.'],
  'tokiomi>rin': ['Rin. You should not be here.', '...Father. I\u2019m a Tohsaka too.'],
  // Kuzuki: the temple, the knight, his students, the priest
  'kuzuki>kojirou': ['The gatekeeper.', 'The teacher who climbs the stairs. Shall we test each other?'],
  'kuzuki>caerwyn': ['A knight. Bare hands will do.', 'You would face my blade with nothing?'],
  'kuzuki>shirou': ['Emiya. Go home.', 'Kuzuki-sensei?!'],
  'kuzuki>rin': ['Tohsaka. You\u2019re late for class.', 'This isn\u2019t class, sensei!'],
  'kuzuki>kirei': ['A priest who kills.', 'A teacher who kills. We are not so different.'],
  // the Einzbern family
  'kiritsugu>irisviel': ['Iri. Step aside. Please.', 'You would really raise a gun to me, Kiritsugu?'],
  'irisviel>kiritsugu': ['So the Grail made us enemies after all.', 'It was always going to ask for something.'],
  'kiritsugu>illya': ['...Illya.', 'You left. You promised you’d come back, and you left!'],
  'illya>kiritsugu': ['Kiritsugu. Did you come all this way just to lose?', 'I came to end it. I’m sorry, Illya.'],
  'illya>irisviel': ['Mother? Why are you against me?', 'I’m not against you, Illya. Never you.'],
  'irisviel>illya': ['Illya... you’ve grown so much.', 'Don’t. Don’t talk like you were there.'],
  // the Emiya house
  'shirou>kiritsugu': ['Dad...?', 'Shirou. You shouldn’t be here.'],
  'kiritsugu>shirou': ['Go home, Shirou.', 'Not until I know what you’re fighting for!'],
  'shirou>sakura': ['Sakura? Why... why you?', 'I’m sorry, Senpai. I can’t stop anymore.'],
  'sakura>shirou': ['Senpai... please don’t look at me.', 'Sakura, I’m not leaving you.'],
  'irisviel>shirou': ['You have his eyes. Kiritsugu’s.', 'You knew my father?'],
  // the Matou house
  'kariya>sakura': ['Sakura-chan... I’m sorry. I have to.', 'Uncle Kariya... why?'],
  'sakura>kariya': ['Uncle... please stop. You’ll die.', 'Then let me die for you.'],
  // old students, old servants, old masters
  'iskandar>waver': ['My boy! On the other side, are we?', 'Rider... I don’t want this either.'],
  'waver>iskandar': ['Rider... it’s really you.', 'Ha! Look at you, standing against a king!'],
  'kayneth>diarmuid': ['You serve another now, Lancer?', 'My lord... forgive me.'],
  'diarmuid>kayneth': ['My lord. I would rather this were not so.', 'Spare me your loyalty, traitor.'],
  'rin>emiya': ['Archer... why are you against me?', 'Sorry, Rin. This is the road I chose.'],
  'emiya>rin': ['Rin. Go home.', 'Not a chance, Archer!'],
  'illya>heracles': ['Berserker... you’re on their side?', '...■■■...'],
  'gilgamesh>kirei': ['Kirei. Entertain me.', 'As you wish, King of Heroes.'],
  'kirei>gilgamesh': ['Have you grown tired of me, Archer?', 'Not tired. Bored. There’s a difference.'],
  'medea>kojirou': ['Gatekeeper. Step aside.', 'The gate stands, witch. As do I.'],
  'caerwyn>shirou': ['Shirou. Do not make me do this.', 'I won’t let you fight alone, Saber. Even like this.'],
  'shirou>caerwyn': ['Saber...?', 'Shirou. I am sorry. The contract decides.'],
  'heracles>illya': ['...■■■...', 'Berserker? You remember me... don’t you?'],
  'sakura>medusa': ['Rider... not you too.', 'Sakura. I will never raise my hand to you.']
};
Object.keys(MORE_PAIRS).forEach(function (k) { PAIRS[k] = MORE_PAIRS[k]; });
// side by side under a truce: the school, the horror, the banquet, the Church
var TRUCE_PAIRS = {
  'rin|tokiomi': ['tokiomi', 'Stay behind me, Rin.', 'I can manage on my own, Father.'],
  'sakura|tokiomi': ['tokiomi', '...Sakura. You\u2019ve grown.', '...You don\u2019t get to say that.'],
  'caren|kirei': ['caren', 'Stand on that side of the room, Father.', 'As you wish, daughter.'],
  'kirei|tokiomi': ['kirei', 'Your plan holds, Teacher?', 'Perfectly. Trust in it.'],
  'irisviel|kiritsugu': ['kiritsugu', 'Stay close, Iri. Just for now.', 'Just for now. I know.'],
  'illya|kiritsugu': ['kiritsugu', 'Illya... are you hurt?', 'Don’t act like a father now. ...But thanks.'],
  'illya|irisviel': ['irisviel', 'Hold my hand, Illya.', '...Only until this is over, Mother.'],
  'rin|sakura': ['rin', 'Stay behind me, Sakura.', '...Like when we were little, Nee-san?'],
  'rin|shirou': ['shirou', 'Tohsaka, cover me!', 'Who said you get to give orders, Emiya?'],
  'sakura|shirou': ['shirou', 'Sakura, are you okay?', 'I’m fine, Senpai... as long as you’re here.'],
  'illya|shirou': ['shirou', 'Stay with me, Illya.', 'Hehe. Onii-chan’s protecting me?'],
  'kariya|sakura': ['kariya', 'Sakura-chan... I’ll get you out of here.', 'Uncle Kariya... you’re hurting.'],
  'kirei|kiritsugu': ['kirei', 'A truce, Emiya? How fascinating.', 'Don’t mistake this for anything else.'],
  'kayneth|waver': ['kayneth', 'Stay out of my way, Velvet.', 'Y-yes, Professor! ...Wait, why am I saying yes?'],
  'kirei|rin': ['rin', 'Don’t think this means I trust you, Kirei.', 'I would never expect such foolishness from you.'],
  'kiritsugu|shirou': ['kiritsugu', 'Keep your head down, Shirou.', 'I’m not a kid anymore, Dad.'],
  'caerwyn|gilgamesh': ['caerwyn', 'Do not stand so close, Archer.', 'I’ll stand wherever I please, Saber.'],
  'cu|emiya': ['emiya', 'Stay out of my line of fire, Lancer.', 'Then aim better!'],
  'caerwyn|iskandar': ['caerwyn', 'For now, we fight the same foe.', 'Ha! Then show me that sword, little king!'],
  'caerwyn|lancelot': ['caerwyn', 'Lancelot. Fight beside me, one last time.', '...Arrr...'],
  'diarmuid|caerwyn': ['diarmuid', 'An honor to stand beside you, King of Knights.', 'Then let us earn it together.'],
  'gilgamesh|iskandar': ['iskandar', 'Shoulder to shoulder with the King of Heroes!', 'Don’t get used to it.']
};
var TRUCESEEN = {}, truceChk = 0;
function trucePairs() {
  if (!G || G.mode !== 'war' || INTRO || G.time < truceChk) return; truceChk = G.time + 0.5;
  for (var i = 0; i < G.f.length; i++) for (var j = i + 1; j < G.f.length; j++) {
    var a = G.f[i], b = G.f[j]; if (a.st === 'dead' || b.st === 'dead' || a.team === b.team) continue;
    var k = bondKey(a, b), P = TRUCE_PAIRS[k]; if (!P || TRUCESEEN[k] || dist(a, b) > 450 || !inTruce(a, b) || !FX.near(a.x, a.y)) continue;
    TRUCESEEN[k] = true; var first = a.def.id === P[0] ? a : b, second = first === a ? b : a;
    showBubble(first, P[1], 3.2, true); DUO.push({ at: performance.now() + 2800, f: second, text: P[2] }); return;
  }
}
// the hand that will not fall
var HESIT = {
  'kirei>caren': ['...No. Not this one. Not tonight.', 'How sentimental. It doesn\u2019t suit you.'],
  'caren>kirei': ['...Get up, Father. I am not finished despising you.', '...'],
  'tokiomi>rin': ['Rin... no. Not by my hand.', 'Why did you stop?'],
  'tokiomi>sakura': ['I gave you away so you would live. Not for this.', '...You never asked what I wanted.'],
  'kiritsugu>illya': ['...My hands won’t move.', '...Why did you stop?'],
  'kiritsugu>irisviel': ['Iri... I can’t. Not like this.', 'Then go. Before you change your mind.'],
  'irisviel>kiritsugu': ['No... I won’t be the one.', 'Iri...'],
  'illya>kiritsugu': ['...Hmph. Not yet. I want you to see me win.', '...Illya.'],
  'irisviel>illya': ['I can’t hurt you, Illya. I won’t.', '...Mother?'],
  'illya>irisviel': ['...You’re lucky I’m merciful, Mother.', 'Thank you, Illya.'],
  'rin>sakura': ['...Sakura. I can’t do it.', 'Nee-san... why are you crying?'],
  'sakura>rin': ['No... not Nee-san. Not her.', 'Sakura...'],
  'shirou>illya': ['No. I won’t.', 'Onii-chan... you’re too soft.'],
  'illya>shirou': ['...I’ll let you go this time, Onii-chan.', 'Illya...'],
  'shirou>sakura': ['Sakura... I promised I’d protect you.', 'Senpai...'],
  'sakura>shirou': ['Senpai... run. Please run.', 'I’m not running from you, Sakura.'],
  'kariya>sakura': ['I can’t... not her...', 'Uncle...'],
  'shirou>kiritsugu': ['Dad... I can’t.', 'Then you’re a better man than I was.'],
  'kiritsugu>shirou': ['...Not my son. Not again.', 'Dad...?']
};
FX.hesitate = function (a, d) {
  if (!G.f[MEI] || !FX.near(a.x, a.y)) return; var k = a.def.id + '>' + d.def.id, H = HESIT[k] || ['...I can’t.', '...Why?'];
  SAYT[a.idx] = performance.now() / 1000; showBubble(a, H[0], 3.2, true); DUO.push({ at: performance.now() + 2400, f: d, text: H[1] });
  if (a === G.f[MEI]) FX.banner('Your hand stops', 'You cannot bring yourself to finish it. Strike again to end it, or let them go.');
  else if (d === G.f[MEI]) FX.banner('Spared', shortName(a.def.name) + ' could not finish you.');
};
// last words over the fallen, for the kills that mean something
var KILLQ = {
  'caren>kirei': 'Rest. Someone will pray for you. Not me.',
  'kirei>caren': 'So that is what it feels like. I expected more.',
  'kirei>tokiomi': 'I wondered if I would feel something. Nothing. How disappointing.',
  'kariya>tokiomi': 'That was for Sakura.',
  'kuzuki>shirou': 'Class dismissed.',
  'kiritsugu>irisviel': 'I’m sorry, Iri. Every life I save costs one I love.',
  'kiritsugu>illya': 'Forgive me, Illya. I chose the world over you. Again.',
  'irisviel>kiritsugu': 'Wait for me... somewhere the Grail can’t reach.',
  'illya>kiritsugu': '...You should have come back for me.',
  'illya>irisviel': 'Goodbye, Mother. ...I wish you had stayed.',
  'irisviel>illya': 'Sleep, Illya. I’ll hold you this time.',
  'rin>sakura': 'I’m sorry, Sakura. I should have come for you years ago.',
  'sakura>rin': 'Nee-san... now you know how it feels.',
  'shirou>illya': 'Illya... I couldn’t protect you.',
  'illya>shirou': 'Bye-bye, Onii-chan. ...I really did like you.',
  'shirou>sakura': 'Sakura... I’m so sorry. I was too late.',
  'sakura>shirou': 'Senpai... now you’re mine forever.',
  'kariya>sakura': 'Sakura-chan... I’m sorry. You’re free now.',
  'sakura>kariya': 'Uncle... rest. You did enough.',
  'shirou>kiritsugu': 'Dad... I’ll carry your dream. My own way.',
  'kiritsugu>shirou': 'I wanted you to have an ordinary life, Shirou.',
  'emiya>shirou': 'That’s the end of your borrowed ideal.',
  'shirou>emiya': 'I won’t regret it. Not the way you did.',
  'kirei>kiritsugu': 'So you had no answer after all.',
  'kiritsugu>kirei': 'There was never anything to understand.',
  'caerwyn>lancelot': 'Rest, my friend. The fault was mine.',
  'lancelot>caerwyn': '...Ar... thur...',
  'gilgamesh>caerwyn': 'Struggle all you like. You were always mine.',
  'caerwyn>gilgamesh': 'Your treasury could not buy this victory.',
  'emiya>cu': 'You were a good opponent, Lancer. Annoying, but good.',
  'cu>emiya': 'Heh. Told you I’d take round two.',
  'kayneth>waver': 'Know your place, boy.',
  'waver>kayneth': '...I’m sorry, Professor.',
  'iskandar>gilgamesh': 'Your treasure could not stop my army!',
  'gilgamesh>iskandar': 'A worthy conqueror. I’ll remember you, for a while.',
  'rin>kirei': 'That was for my father.',
  'kirei>rin': 'Your father would have wept. How delightful.',
  'diarmuid>kayneth': 'My lord. I am sorry it ended like this.',
  'heracles>gilgamesh': '■■■■■■—!!!'
};
(function () {
  var say0 = FX.say;
  FX.say = function (f, key, other) {
    if (key === 'kill' && f && other && G && G.mode === 'war' && FX.near(f.x, f.y)) { var q = KILLQ[f.def.id + '>' + other.def.id]; if (q) { SAYT[f.idx] = performance.now() / 1000; showBubble(f, q, 3.6, true); return; } }
    say0(f, key, other);
  };
  var db0 = drawBubbles; drawBubbles = function (cx, cy, zoom) { trucePairs(); db0(cx, cy, zoom); };
})();
