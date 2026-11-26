/* ---- pacts: two teams agree not to fight until dawn ----
   A pact joins two teams for one night: they cannot hurt each other, they share what they see, and they
   pass through each other's bounded fields. Nothing else is shared. One pact per team at a time.
   Pacts end at dawn, on the final night, and once three or fewer teams remain.
   The two strongest teams never ally; a team the pact leaves alone takes a little less damage while
   pact partners gang up on it; AI pacts never turn on the player.
   Breaking a pact raises exposure and shows the breaker to everyone for a while.
   Every character weighs a pact their own way (PACT_M, PACT_S, pactWill). Gilgamesh allies with nobody,
   unless Kirei stands on another team; and when a truce puts them together, he may betray his own master to take Kirei. */
var PACT = { range: 1100, tick: 6, base: 0.22, offerT: 14, askCd: 60, cd: 240, outnum: 0.85, outR: 700, breakExpo: 25, revealT: 40, minTeams: 4, hate: 20, treachT: 5 };
// willingness to make a pact at all (0 never, 1 eager)
var PACT_M = { kiritsugu: 0, irisviel: 0.6, illya: 0.3, shirou: 0.85, rin: 0.55, sakura: 0.4, kariya: 0.35, kayneth: 0.25, kirei: 0.3, waver: 0.7 };
var PACT_S = { gilgamesh: 0, iskandar: 0.95, caerwyn: 0.6, diarmuid: 0.75, cu: 0.6, emiya: 0.45, heracles: 0.6, lancelot: 0.35, medea: 0.55, medusa: 0.5, kojirou: 0.6, hassan: 0.4, gilles: 0.15, richard: 0.7, leonidas: 0.75, atalanta: 0.4 };
// who turns on a partner when the chance comes
var TREACH = { medea: 0.3, kiritsugu: 0.35, kirei: 0.25, gilles: 0.3, hassan: 0.2, kayneth: 0.15 };
// pairs that will not share a night, or barely
var PACT_FEUD = { 'caerwyn|lancelot': 0, 'kiritsugu|kirei': 0, 'kayneth|waver': 0.3, 'kirei|rin': 0.5, 'emiya|shirou': 0.4, 'cu|emiya': 0.7, 'diarmuid|kayneth': 0.4 };

function pactOf(team) { if (!G.pacts) return null; for (var i = 0; i < G.pacts.length; i++) { var p = G.pacts[i]; if (p.a === team || p.b === team) return p; } return null; }
function pactMate(team) { var p = pactOf(team); return p ? (p.a === team ? p.b : p.a) : null; }
function pactTeams(t1, t2) { if (t1 === t2 || !G.pacts || !G.pacts.length) return false; var p = pactOf(t1); return !!p && (p.a === t2 || p.b === t2); }
function teamFighters(t) { return G.f.filter(function (f) { return f.team === t && f.st !== 'dead'; }); }
function teamMaster(t) { return G.f.filter(function (f) { return f.team === t && f.def.isMaster && f.st !== 'dead'; })[0] || null; }
function teamServant(t) { return G.f.filter(function (f) { return f.team === t && !f.def.isMaster && f.st !== 'dead'; })[0] || null; }
function humanTeam(t) { return G.f.some(function (f) { return f.team === t && f.st !== 'dead' && !G.ai[f.idx]; }); }
function liveTeams() { var s = {}; G.f.forEach(function (f) { if (f.st !== 'dead' && !f.def.isMaster) s[trueTeamOf(f)] = 1; }); return Object.keys(s).map(Number); }
function teamPower(t) { var v = 0; G.f.forEach(function (f) { if (f.team === t && f.st !== 'dead') v += (f.def.isMaster ? 0.35 : 1) * f.hp / f.def.hp; }); return v; }
function teamHas(t, ids) { return G.f.some(function (f) { return f.team === t && f.st !== 'dead' && ids.indexOf(f.def.id) >= 0; }); }
// how willing team t is to share a night with team o
function pactWill(t, o) {
  var m = teamMaster(t), s = teamServant(t); if (!m && !s) return 0;
  var wm = m ? (PACT_M[m.def.id] === undefined ? 0.5 : PACT_M[m.def.id]) : null, ws = s ? (PACT_S[s.def.id] === undefined ? 0.5 : PACT_S[s.def.id]) : null;
  if (m && m.def.id === 'kiritsugu') wm = teamHas(o, ['illya', 'irisviel', 'shirou']) ? 0.9 : 0; // the Magus Killer trusts only his family
  if (m && m.def.id === 'illya' && teamHas(o, ['shirou'])) wm = 0.8;
  if (m && (m.def.id === 'sakura' || m.def.id === 'rin') && teamHas(o, ['shirou', 'rin', 'sakura'])) wm = Math.max(wm, 0.8);
  if (s && s.def.id === 'gilgamesh') ws = (!m || m.def.id !== 'kirei') && teamHas(o, ['kirei']) ? 0.85 : 0; // the King allies with no one, unless it brings him Kirei
  var w = wm === null ? ws : ws === null ? wm : Math.sqrt(wm * ws);
  teamFighters(t).forEach(function (a) { teamFighters(o).forEach(function (b) { var k = bondKey(a, b); if (PACT_FEUD[k] !== undefined) w *= PACT_FEUD[k]; if (FAMILY[k]) w *= 1.5; if (G.hesit && (G.hesit[a.idx + '>' + b.idx] || G.hesit[b.idx + '>' + a.idx])) w *= 1.6; }); });
  return clamp(w, 0, 1);
}
// can these two teams make a pact right now (the rules, not the will)
function pactOpen(t1, t2) {
  if (!G.clock || G.clock.final || G.quick || G.over || t1 === t2) return false;
  if (pactOf(t1) || pactOf(t2) || (G.pactCd[t1] || 0) > G.time || (G.pactCd[t2] || 0) > G.time) return false;
  var lt = liveTeams(); if (lt.length < PACT.minTeams || lt.indexOf(t1) < 0 || lt.indexOf(t2) < 0) return false;
  var rank = lt.slice().sort(function (a, b) { return teamPower(b) - teamPower(a); }); if (((rank[0] === t1 && rank[1] === t2) || (rank[0] === t2 && rank[1] === t1)) && teamPower(rank[1]) - teamPower(rank[2]) > 0.15) return false; // the two strongest never ally
  if (G.pactMax !== undefined && G.pacts.length >= (lt.length >= 6 ? 2 : 1)) return false;
  if ((G.pactHate[Math.min(t1, t2) + '|' + Math.max(t1, t2)] || -99) > G.time - PACT.hate) return false; // they just fought
  return true;
}
function teamsMeet(t1, t2) {
  var A = teamFighters(t1), B = teamFighters(t2);
  for (var i = 0; i < A.length; i++) for (var j = 0; j < B.length; j++) if (sameZone(A[i], B[j]) && dist(A[i], B[j]) < PACT.range && knowsExact(A[i], B[j])) return [A[i], B[j]];
  return null;
}
function initPacts() { G.pacts = []; G.pactCd = {}; G.pactHate = {}; G.pactAsk = {}; G.pactT = 0; G.pactMax = 1; G.pactLog = { formed: 0, broken: 0, betray: 0, offers: 0 }; G.offer = null; }
function formPact(t1, t2, by) {
  var c = G.clock; var p = { a: t1, b: t2, night: c.n, t0: G.time, by: by };
  G.pacts.push(p); G.pactLog.formed++; G.offer = null;
  G.f.forEach(function (f) { if ((f.team === t1 || f.team === t2) && f.lock && (f.lock.team === t1 || f.lock.team === t2)) f.lock = null; });
  G.f.forEach(pickTarget); FX.pact('formed', t1, t2); return p;
}
function endPact(p, why) { var i = G.pacts.indexOf(p); if (i < 0) return; G.pacts.splice(i, 1); G.pactCd[p.a] = G.pactCd[p.b] = G.time + PACT.cd; G.f.forEach(pickTarget); FX.pact(why || 'ended', p.a, p.b); }
// the breaker pays for it: the Church hears, and every team sees them for a while
function breakPact(team, victim) {
  var p = pactOf(team); if (!p) return false; var other = p.a === team ? p.b : p.a;
  G.pacts.splice(G.pacts.indexOf(p), 1); G.pactCd[team] = G.pactCd[other] = G.time + PACT.cd; G.pactLog.broken++;
  G.expo[team] = (G.expo[team] || 0) + PACT.breakExpo; G.reveal[team] = Math.max(G.reveal[team] || 0, G.time + PACT.revealT);
  G.f.forEach(pickTarget); FX.pact('broken', team, other, victim); return true;
}
function noteFight(att, def) { if (!G.pactHate || !att || att.team === def.team) return; G.pactHate[Math.min(att.team, def.team) + '|' + Math.max(att.team, def.team)] = G.time; }
// a lone team that a pact gangs up on takes a little less from each blow
function outnumbered(att, def) {
  if (!G.pacts || !G.pacts.length || !att || pactOf(def.team)) return false; var m = pactMate(att.team); if (m === null) return false;
  return G.f.some(function (o) { return o.team === m && o.st !== 'dead' && dist(o, def) < PACT.outR; });
}
// sight is shared between pact partners
function pactSees(f, e, r) {
  var m = pactMate(f.team); if (m === null || e.team === m) return false;
  if (G.seenBy && G.seenBy[m] && G.seenBy[m][e.idx] > G.time) return true;
  return G.f.some(function (o) { return o.team === m && o.st !== 'dead' && sameZone(o, e) && dist(o, e) < r; });
}
// the player asks: a nearby team that could share the night
function pactCandidate(f) {
  if (!G.pacts || G.mode !== 'war') return null; var best = null, bd = PACT.range * 0.7;
  G.f.forEach(function (o) { if (o.team !== f.team && o.st !== 'dead' && o.spirit !== 2 && sameZone(o, f) && dist(o, f) < bd && knowsExact(f, o) && pactOpen(f.team, o.team)) { bd = dist(o, f); best = o; } });
  return best;
}
function pactButton(f) {
  if (!G.pacts) return;
  if (G.offer && G.offer.to === f.team && G.offer.until > G.time) { var fr = G.offer.from; if (pactOpen(fr, f.team)) formPact(fr, f.team, f.team); else G.offer = null; return; }
  var p = pactOf(f.team);
  if (p) { if (f.breakAsk > G.time) { f.breakAsk = 0; breakPact(f.team, null); } else { f.breakAsk = G.time + 3; FX.pact('confirmBreak', f.team, pactMate(f.team)); } return; }
  var c = pactCandidate(f); if (!c) { FX.pact('nobody', f.team, -1); return; }
  var t = c.team, k = f.team + '>' + t; if ((G.pactAsk[k] || 0) > G.time) { FX.pact('askedRecently', f.team, t); return; }
  G.pactAsk[k] = G.time + PACT.askCd; G.pactLog.offers++;
  if (humanTeam(t)) { G.offer = { from: f.team, to: t, until: G.time + PACT.offerT }; FX.pact('offer', f.team, t); return; }
  // an AI team weighs it; being outmatched makes any team listen
  var w = pactWill(t, f.team), lt = liveTeams(), weak = teamPower(t) < teamPower(f.team) ? 1.25 : 1;
  G.pactPending = { from: f.team, to: t, at: G.time + 1.2, yes: Math.random() < Math.min(0.95, w * 1.1 * weak) && lt.length >= PACT.minTeams };
  FX.pact('asked', f.team, t);
}
function pactTick(dt) {
  if (!G.pacts || !G.clock) return;
  var c = G.clock, lt = liveTeams();
  // dawn, the final night or too few teams end every pact
  for (var i = G.pacts.length - 1; i >= 0; i--) { var p = G.pacts[i]; if (c.final || lt.length < PACT.minTeams || lt.indexOf(p.a) < 0 || lt.indexOf(p.b) < 0 || (c.phase === 'day' && c.n > p.night)) endPact(p, c.final ? 'final' : lt.length < PACT.minTeams ? 'few' : 'dawn'); }
  if (G.pactPending && G.time >= G.pactPending.at) { var q = G.pactPending; G.pactPending = null; if (q.yes && pactOpen(q.from, q.to)) formPact(q.from, q.to, q.from); else FX.pact('declined', q.from, q.to); }
  if (G.offer && G.offer.until <= G.time) { FX.pact('expired', G.offer.from, G.offer.to); G.offer = null; }
  gilBetrayTick();
  G.pactT -= dt; if (G.pactT > 0) return; G.pactT = PACT.tick;
  if (c.final) return;
  treacheryTick();
  // two teams meet and weigh a pact; by day only inside a truce
  for (var a = 0; a < lt.length; a++) for (var b = a + 1; b < lt.length; b++) {
    var t1 = lt[a], t2 = lt[b]; if (!pactOpen(t1, t2)) continue;
    var meet = teamsMeet(t1, t2); if (!meet) continue;
    var tr = inTruce(meet[0], meet[1]); if (c.phase === 'day' && !tr) continue;
    var h1 = humanTeam(t1), h2 = humanTeam(t2); if (h1 && h2) continue;
    var third = G.f.some(function (o) { return o.st !== 'dead' && o.team !== t1 && o.team !== t2 && !o.def.isMaster && dist(o, meet[0]) < 1400; });
    var P = PACT.base * (tr ? 1.6 : 1) * (third ? 1.6 : 1);
    if (h1 || h2) {
      var ai = h1 ? t2 : t1, hu = h1 ? t1 : t2; if (G.offer || (G.pactAsk[ai + '>' + hu] || 0) > G.time) continue;
      if (Math.random() < P * pactWill(ai, hu)) { G.pactAsk[ai + '>' + hu] = G.time + PACT.askCd * 2; G.offer = { from: ai, to: hu, until: G.time + PACT.offerT }; G.pactLog.offers++; FX.pact('offer', ai, hu); return; }
      continue;
    }
    if (Math.random() < P * pactWill(t1, t2) * pactWill(t2, t1)) { formPact(t1, t2, t1); return; }
  }
}
// a partner left weak and alone is a temptation for some
function treacheryTick() {
  G.pacts.slice().forEach(function (p) {
    [p.a, p.b].forEach(function (t) {
      if (!pactOf(t) || humanTeam(t)) return; var o = t === p.a ? p.b : p.a, tv = 0;
      teamFighters(t).forEach(function (f) { tv = Math.max(tv, TREACH[f.def.id] || 0.01); });
      var prey = teamFighters(o).filter(function (e) { return e.hp < e.def.hp * 0.35 && teamFighters(t).some(function (f) { return !f.def.isMaster && dist(f, e) < 500; }); })[0];
      if (prey && !humanTeam(o) && Math.random() < tv * 0.5) { breakPact(t, prey); teamFighters(t).forEach(function (f) { if (!f.def.isMaster) f.lock = prey; }); }
    });
  });
}
// the King of Heroes and his chosen master. Only when a truce or a pact puts them together, once a war.
function gilBetrayTick() {
  if (G.gilDone || (G.gilChk || 0) > G.time) return; G.gilChk = G.time + 2;
  var gil = G.f.filter(function (f) { return f.def.id === 'gilgamesh' && f.st !== 'dead' && f.trueTeam === undefined; })[0]; if (!gil || !G.ai[gil.idx]) return;
  var gm = gil.partner, k = G.f.filter(function (f) { return f.def.id === 'kirei' && f.st !== 'dead'; })[0];
  if (!gm || gm.st === 'dead' || gm.team !== gil.team || !k || k === gm || k.team === gil.team || !isFreeMaster(k)) return;
  if (!(pactTeams(gil.team, k.team) || inTruce(gil, k)) || dist(gil, k) > 900 || dist(gil, gm) > 1400) return;
  if (gil.st !== 'idle' && gil.st !== 'move' && gil.st !== 'rec') return;
  if (Math.random() > 0.35) return;
  G.gilDone = true; G.pactLog.betray++;
  var p = pactOf(gil.team); if (p) { G.pacts.splice(G.pacts.indexOf(p), 1); G.f.forEach(pickTarget); }
  FX.pact('betray', gil.team, k.team, gm);
  gm.lastHit = { by: gil, key: 'betray' }; gm.lastHitT = G.time; gm.cause = 'betrayed'; gm.hp = 0; kill(gm);
  formContract(gil, k, true);
}
// targeting: help a partner with their fight, and an AI pact never closes in on the player together
function pactAim(f, e) {
  if (!G.pacts || !G.pacts.length) return 0; var m = pactMate(f.team); if (m === null) return 0; var v = 0;
  if (G.f.some(function (o) { return o.team === m && o.st !== 'dead' && o.foe === e && dist(o, e) < PACT.outR; })) v -= 300;
  if (G.ai[f.idx] && !humanTeam(f.team) && !humanTeam(m) && humanTeam(e.team)) v += 1500;
  return v;
}
