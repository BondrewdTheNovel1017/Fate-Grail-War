/* ---- pacts on screen: offers, answers, broken promises and the King's choice. All lines are original. ---- */
var PACT_LINES = {
  iskandar: { offer: 'Ha! Fight beside me tonight, and we settle things tomorrow!', yes: 'A fine alliance! Drink with me when it’s over!', no: 'Pity. I’d have liked you in my army.', brk: 'Forgive me, friend. A conqueror takes what is in reach.' },
  caerwyn: { offer: 'Until dawn, our swords need not cross.', yes: 'Then I give you my word as a knight.', no: 'So be it. We meet as enemies.', brk: '...' },
  diarmuid: { offer: 'Stand with me tonight. I swear it on my lances.', yes: 'An honor. I will guard your back.', no: 'Then I shall face you honorably.', brk: '...' },
  cu: { offer: 'Truce for tonight? I’d rather fight the other guys anyway.', yes: 'Heh. Don’t slow me down.', no: 'Suits me. More fun this way.', brk: 'Sorry. Got bored.' },
  emiya: { offer: 'A practical arrangement. One night only.', yes: 'Fine. Don’t get in my line of fire.', no: 'Expected as much.', brk: 'Nothing personal. It was always going to end like this.' },
  heracles: { offer: '...■■■...', yes: '...■■...', no: '■■■■—!!', brk: '■■■■■—!!' },
  lancelot: { offer: '...rrr...', yes: '...rrr...', no: '■■■■!!', brk: '■■■■■!!' },
  medea: { offer: 'Shall we be friends tonight? I can be very helpful.', yes: 'How lovely. I’ll remember this kindness.', no: 'Your loss, dear.', brk: 'Did you really trust a witch? How sweet.' },
  medusa: { offer: 'A truce. For tonight.', yes: 'Understood.', no: 'Then stay out of my way.', brk: '...Sorry.' },
  kojirou: { offer: 'The moon is too fine for a pointless duel. Walk with me tonight.', yes: 'Splendid. Let us enjoy the night.', no: 'Then let our blades speak instead.', brk: 'A swordsman cannot resist a fine opening.' },
  hassan: { offer: 'The shadows can share their work tonight.', yes: 'Agreed.', no: 'As you wish.', brk: 'An assassin keeps no promise past its use.' },
  gilles: { offer: 'Let us be companions in this splendid darkness!', yes: 'Oh, how delightful!', no: 'You disappoint me terribly!', brk: 'Cool! Cool! Did you truly believe me?' },
  richard: { offer: 'Ride with me tonight, and tomorrow we fight fair.', yes: 'Then we are brothers in arms until dawn.', no: 'Then we settle it now.', brk: '...' },
  leonidas: { offer: 'Hold the line with me tonight.', yes: 'Good. Shields together.', no: 'Then come and take it.', brk: '...' },
  atalanta: { offer: 'One night. Then I hunt you again.', yes: 'Keep up, then.', no: 'Better. I prefer the hunt.', brk: 'The hunt resumes.' },
  gilgamesh: { offer: 'You may stand near me tonight. Consider it an honor.', yes: 'Hmph. Amuse me.', no: 'You presume too much, mongrel.', brk: '...' },
  shirou: { offer: 'We don’t have to fight tonight. Let’s work together.', yes: 'Thanks. I mean it.', no: 'I understand. But I won’t give up on talking.', brk: '...' },
  rin: { offer: 'A temporary alliance. Strictly business.', yes: 'Good. Don’t make me regret it.', no: 'Fine. Your funeral.', brk: 'Sorry. It’s nothing personal. Mostly.' },
  caren: { offer: 'Until dawn, then. Do not mistake this for kindness.', yes: 'Fine. Try not to embarrass me.', no: 'Wise. I would have broken it anyway.', brk: 'You trusted a nun. That was your sin, not mine.' },
  tokiomi: { offer: 'An arrangement between gentlemen, until dawn. You will find me a reliable partner.', yes: 'Splendid. Let us proceed.', no: 'A pity. We shall meet as enemies, then.', brk: 'Forgive me. Victory was always the arrangement.' },
  kuzuki: { offer: 'We have no reason to fight tonight.', yes: 'Understood.', no: 'Then I will not hold back.', brk: '...' },
  sakura: { offer: 'Um... could we not fight tonight?', yes: 'Thank you...', no: 'I see...', brk: 'I’m sorry. I couldn’t stop it.' },
  waver: { offer: 'H-hey! How about a truce? Just for tonight!', yes: 'Really? Great! I mean, good. Acceptable.', no: 'Why does nobody ever listen to me?!', brk: 'I— I didn’t want to do that!' },
  irisviel: { offer: 'There’s no need for us to fight tonight.', yes: 'Thank you. Let’s both see the morning.', no: 'I’m sorry to hear that.', brk: 'Forgive me...' },
  illya: { offer: 'You can play with me tonight. Just don’t bore me.', yes: 'Hehe. Don’t disappoint me.', no: 'Fine. Berserker can play with you instead.', brk: 'Playtime’s over.' },
  kiritsugu: { offer: 'Tonight we cover each other. Nothing more.', yes: 'Fine.', no: 'No deals.', brk: 'It was always the plan.' },
  kirei: { offer: 'Perhaps we can be of use to one another tonight.', yes: 'How interesting. I accept.', no: 'A shame. I’d hoped to watch you a while longer.', brk: 'Did you think a priest would keep his word?' },
  kayneth: { offer: 'I will permit you to stand beside me tonight.', yes: 'Know that this is a favor.', no: 'How dare you refuse me!', brk: 'An agreement with a lesser magus means nothing.' },
  kariya: { offer: 'I’m not after you. Just... let me through tonight.', yes: 'Thanks...', no: 'Then get out of my way.', brk: '...I have no choice.' }
};
var PACT_DEF = { offer: 'A truce, until dawn?', yes: 'Agreed. Until dawn.', no: 'No deal.', brk: 'Our pact is over.' };
function pactSpeaker(t) { return teamServant(t) || teamMaster(t); }
function pactLine(t, k) { var f = pactSpeaker(t); if (!f || !FX.near(f.x, f.y)) return; var L = PACT_LINES[f.def.id] || PACT_DEF; SAYT[f.idx] = performance.now() / 1000; showBubble(f, L[k] || PACT_DEF[k], 3, true); }
FX.pact = function (kind, t1, t2, x) {
  if (!G || !G.f[MEI]) return; var me1 = G.f[MEI], mt = me1.team, mine = t1 === mt || t2 === mt, other = t1 === mt ? t2 : t1;
  if (kind === 'nobody') { FX.text(me1, 'NO ONE TO MAKE A PACT WITH'); return; }
  if (kind === 'askedRecently') { FX.text(me1, 'THEY ALREADY ANSWERED'); return; }
  if (kind === 'confirmBreak') { FX.text(me1, 'PRESS PACT AGAIN TO BREAK IT'); return; }
  if (kind === 'asked') { pactLine(t1, 'offer'); note('You offer ' + teamName(t2) + ' a pact until dawn...', '#9fe6b0'); return; }
  if (kind === 'offer') {
    pactLine(t1, 'offer');
    if (t2 === mt) { FX.banner(teamName(t1) + ' offers a pact', 'No fighting until dawn, shared sight. Press Pact (P) to accept.'); FX.snd('bell', me1, {}); }
    else if (t1 === mt) note('Waiting for ' + teamName(t2) + ' to answer...', '#9fe6b0');
    return;
  }
  if (kind === 'declined') { pactLine(t2, 'no'); if (t1 === mt) note(teamName(t2) + ' refuses the pact.', '#f0a85a'); return; }
  if (kind === 'withdrawn') { if (t1 === mt || t2 === mt) note('Blood is drawn: the pact talks with ' + teamName(t1 === mt ? t2 : t1) + ' are over.', '#f0a85a'); return; }
  if (kind === 'void') { if (me1) FX.text(me1, 'THE PACT CAN NO LONGER BE MADE'); return; }
  if (kind === 'expired') { if (mine) note('The pact offer lapses.', '#c9c3b0'); return; }
  if (kind === 'formed') {
    pactLine(t2, 'yes');
    if (mine) FX.banner('Pact with ' + teamName(other), 'Until dawn you cannot hurt each other and you share what you see. Breaking it has a price.');
    else note(teamName(t1) + ' and ' + teamName(t2) + ' have made a pact.', '#e9e4d3');
    return;
  }
  if (kind === 'broken') {
    pactLine(t1, 'brk');
    if (t1 === mt) FX.banner('You broke the pact', 'The Church hears of it, and every team can see you for ' + PACT.revealT + ' seconds.');
    else if (t2 === mt) { FX.banner('Betrayed!', teamName(t1) + ' broke your pact.'); FX.shake(8); }
    else note(teamName(t1) + ' betrayed ' + teamName(t2) + '!', '#f0a85a');
    return;
  }
  if (kind === 'dawn' || kind === 'final' || kind === 'few') { if (mine) note(kind === 'dawn' ? 'Dawn: your pact with ' + teamName(other) + ' ends.' : kind === 'final' ? 'The final night: every pact is void.' : 'Too few teams remain: the pact is void.', '#c9c3b0'); return; }
  if (kind === 'betrayT') {
    var gl = G.f.filter(function (f) { return f.def.id === 'gilgamesh' && f.st !== 'dead'; })[0], kr = G.f.filter(function (f) { return f.def.id === 'kirei'; })[0];
    FX.banner('The student\u2019s answer', 'Kirei cuts down Tokiomi, and the King takes him as his master.');
    if (kr && FX.near(kr.x, kr.y)) { SAYT[kr.idx] = performance.now() / 1000; showBubble(kr, 'Forgive me, Teacher. I have found something I want more than your Root.', 3.6, true); if (gl) DUO.push({ at: performance.now() + 2800, f: gl, text: 'Kirei. Now you have become interesting.' }); }
    return;
  }
  if (kind === 'betray') {
    var gil = G.f.filter(function (f) { return f.def.id === 'gilgamesh' && f.st !== 'dead'; })[0], k = G.f.filter(function (f) { return f.def.id === 'kirei'; })[0], gm = x;
    FX.banner('The King chooses', 'Gilgamesh cuts down ' + shortName(gm.def.name) + ' and takes Kirei as his master.');
    if (gil && FX.near(gil.x, gil.y)) {
      SAYT[gil.idx] = performance.now() / 1000; showBubble(gil, 'You were never worthy of me, ' + shortName(gm.def.name) + '. Kirei — you will be my master now.', 3.6, true);
      if (gm && gm.st !== 'dead') DUO.push({ at: performance.now() + 1800, f: gm, text: 'Archer...? Why...' });
      if (k) DUO.push({ at: performance.now() + 3600, f: k, text: 'Then I accept, King of Heroes. Let us see what you show me.' });
      FX.shake(12);
    }
  }
};
// the HUD button: Pact (ask), Accept (an offer is waiting), Break (in a pact)
function pactHud(a) {
  var b = document.querySelector('.b[data-b="pact"]'); if (!b) return;
  if (!G.pacts || G.mode !== 'war' || a.st === 'dead') { b.hidden = true; return; }
  var sm = b.lastChild, off = G.offer && G.offer.to === a.team && G.offer.until > G.time, p = pactOf(a.team), c = !off && !p && pactCandidate(a);
  b.hidden = !(off || p || c); b.classList.toggle('rdy', !!off);
  if (off) { b.firstChild.textContent = 'Accept'; sm.textContent = teamName(G.offer.from).replace('’s team', ''); }
  else if (p) { b.firstChild.textContent = a.breakAsk > G.time ? 'Break?' : 'Pact'; sm.textContent = 'ally: ' + teamName(pactMate(a.team)).replace('’s team', ''); }
  else if (c) { b.firstChild.textContent = 'Pact'; sm.textContent = teamName(c.team).replace('’s team', ''); }
}
// a green ring under pact partners
(function () {
  var dff0 = drawFighterFx;
  drawFighterFx = function (g, f) {
    dff0(g, f);
    if (!G || !G.pacts || !G.pacts.length || !G.f[MEI] || f.st === 'dead' || f.team === G.f[MEI].team || !pactTeams(f.team, G.f[MEI].team) || !visL(f)) return;
    g.save(); g.setLineDash([8, 7]); g.lineDashOffset = -G.time * 20; g.strokeStyle = 'rgba(159,230,176,.75)'; g.lineWidth = 2.5;
    g.beginPath(); g.arc(f.x, f.y, (f.def.isMaster ? 30 : 40), 0, Math.PI * 2); g.stroke(); g.restore();
  };
})();
