var HUD = [];
function hudCard(f, label) { return '<div class="hc' + (label === 'You' ? ' me' : '') + '" style="--tc:' + teamCol(f) + '"><div class="nm"><span class="nmL"><span class="hth">' + thumb(f.def.id, 84) + '</span><span>' + label + ': ' + esc(knownName(f)) + '</span></span><span data-h="hp"></span></div><div class="bar hp"><i data-h="bhp"></i></div><div class="bar sta"><i data-h="bst"></i></div><div class="bar mom" data-h="bm"><i data-h="bmo"></i></div>' + (f.def.isMaster && G && G.mode === 'war' ? '<div class="bar mana"><i data-h="bma"></i></div>' : '') + '</div>'; }
var hudTarget = null, hudPartner = null, HUDKEY = '';
function hudKey() { var a = G.f[MEI]; if (G.mode !== 'war') return ''; var pm = G.pacts ? pactMate(a.team) : null; return (a.partner ? a.partner.idx : '-') + '|' + (pm === null ? '-' : teamFighters(pm).map(function (o) { return o.idx; }).join(',')); }
function buildHud() {
  var me0 = G.f[MEI], tg = aimFoe(me0), list;
  if (G.mode === 'war') {
    // the war shows only your side: you, your partner, and a pact ally's pair
    list = [[me0, 'You']]; if (me0.partner) list.push([me0.partner, me0.def.isMaster ? 'Servant' : 'Master']);
    var pm = G.pacts ? pactMate(me0.team) : null; if (pm !== null) teamFighters(pm).forEach(function (o) { list.push([o, 'Ally']); });
  }
  else list = G.f.map(function (f, i) { return [f, i === MEI ? 'You' : (f.team === me0.team ? 'Ally' : 'CPU ' + i)]; });
  hudTarget = G.mode === 'war' ? null : tg; hudPartner = me0.partner; HUDKEY = hudKey(); var el = $('#hud'); el.classList.toggle('war', G.mode === 'war'); el.style.setProperty('--n', list.length); HUD = [];
  el.innerHTML = list.map(function (q) { return hudCard(q[0], q[1]); }).join('');
  el.querySelectorAll('.hc').forEach(function (c, i) { HUD.push({ f: list[i][0], c: c, hp: c.querySelector('[data-h=hp]'), bhp: c.querySelector('[data-h=bhp]'), bst: c.querySelector('[data-h=bst]'), bm: c.querySelector('[data-h=bm]'), bmo: c.querySelector('[data-h=bmo]'), bma: c.querySelector('[data-h=bma]') }); });
}
function startMatch() {
  MEI = 0; NET.mirror = false; NET.hosting = false; NET.game = null;
  var teams = warTeams(CFG.servant, CFG.master, CFG.teams, null, CFG.draft, CFG.draftScope), spawn = [0].concat(shuffled([1, 2, 3, 4, 5, 6]));
  newWar(teams, { playAs: CFG.playAs, spawnOrder: spawn, nights: CFG.nights || 3, events: CFG.events || 'random' });
  for (var k2 = 1; k2 < G.f.length; k2++) G.ai[k2] = mkAI(G.f[k2], DIFF[CFG.diff]);
  enterGame(teams.length);
}
function enterGame(nTeams, title, sub) {
  var me0 = G.f[MEI];
  parts = []; texts = []; V = []; puffs = []; ghosts = []; flashes = []; cracks = []; band.t = 0; slowT = 0; audInit(); shake = 0; endShown = false; speedMul = CFG.speed; acc = 0;
  buildHud(); renderStances(); $('#skl').textContent = me0.A.skill.name.split(': ').pop().split(' ').slice(0, 2).join(' ');
  var spb = document.querySelector('.b[data-b="spirit"]'); spb.hidden = !!me0.def.isMaster || (G.mode !== 'war' && me0.def.cls !== 'Assassin'); spb.firstChild.textContent = me0.def.cls === 'Assassin' ? 'Conceal' : 'Spirit';
  document.querySelectorAll('.b.seal').forEach(function (el) { el.classList.remove('used'); });
  $('#ordBtn').hidden = $('#sealBtn').hidden = !me0.def.isMaster || !me0.partner; closePops();
  $('#setup').style.display = 'none'; $('#duel').style.display = 'block'; document.body.classList.add('ingame'); $('#end').classList.remove('on'); $('#pz').classList.remove('on');
  held.mx = 0; held.my = 0; keys = {}; running = true; paused = false; last = performance.now();
  cam.x = me0.x; cam.y = me0.y;
  if (title && !(nTeams && G.mode === 'war' && !G.quick)) { FX.banner(title, sub); return; }
  NOTES = []; BUB = []; DUO = []; PAIRSEEN = {}; TRUCESEEN = {}; truceChk = 0; BSCRIPT = null; BANQ_SCRIPTS.forEach(function (s) { s.done = false; }); SAYT = {}; LASTFOE = {}; ENGT = {}; INTRO = null; document.body.classList.remove('intro');
  if (startIntro(nTeams)) return;
  FX.banner('The Holy Grail War', 'Fuyuki City · ' + nTeams + ' teams' + (NET.game ? ' · ' + (Object.keys(NET.game.slots).length + 1) + ' players' : ''));
}
function endMatch(toSetup) { running = false; INTRO = null; document.body.classList.remove('intro'); var wasNet = netInMatch(); if (NET.hosting) { NET.hosting = false; NET.game = null; netMyPresence({ game: null }); } if (NET.mirror) { NET.mirror = false; netMyPresence({ ing: null, inp: null }); } document.body.classList.remove('ingame'); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {} $('#duel').style.display = 'none'; $('#setup').style.display = 'block'; $('#end').classList.remove('on'); $('#pz').classList.remove('on'); paused = false; if (wasNet || NET.R) { showScr('net', true); renderNet(); } }
function startCurrent() { if (CFG.game === 'arena') startArena(); else startMatch(); }
$('#go').addEventListener('click', function () { beginFlourish(startCurrent); });
$('#again').addEventListener('click', function () { if (NET.R && NET.role === 'client') { endMatch(); netSay('Waiting for the host to start again.'); return; } if (NET.R && NET.role === 'host') { endMatch(); netStartHost(); return; } startCurrent(); });
$('#menu').addEventListener('click', endMatch); $('#menu2').addEventListener('click', endMatch); $('#quit').addEventListener('click', endMatch);
$('#restBtn').addEventListener('click', function () { if (G && isDay() && !netInMatch()) { skipDay(); note('You rest until nightfall.'); } });
$('#pause').addEventListener('click', function () { if (!netInMatch()) paused = true; $('#pz').classList.add('on'); });
$('#resume').addEventListener('click', function () { paused = false; last = performance.now(); $('#pz').classList.remove('on'); });
document.addEventListener('visibilitychange', function () { if (document.hidden && running && !G.over && !netInMatch()) { paused = true; $('#pz').classList.add('on'); } });

