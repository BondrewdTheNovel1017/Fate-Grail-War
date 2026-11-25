var HUD = [];
function hudCard(f, label) { return '<div class="hc' + (label === 'You' ? ' me' : '') + '" style="--tc:' + teamCol(f) + '"><div class="nm"><span class="nmL"><span class="hth">' + thumb(f.def.id, 84) + '</span><span>' + label + ': ' + esc(shortName(f.def.name)) + '</span></span><span data-h="hp"></span></div><div class="bar hp"><i data-h="bhp"></i></div><div class="bar sta"><i data-h="bst"></i></div><div class="bar mom" data-h="bm"><i data-h="bmo"></i></div>' + (f.def.isMaster && G && G.mode === 'war' ? '<div class="bar mana"><i data-h="bma"></i></div>' : '') + '</div>'; }
var hudTarget = null, hudPartner = null;
function buildHud() {
  var me0 = G.f[MEI], tg = me0.foe, list;
  if (G.mode === 'war') { list = [[me0, 'You']]; if (me0.partner) list.push([me0.partner, me0.def.isMaster ? 'Servant' : 'Master']); if (tg) list.push([tg, me0.lock ? 'Locked' : 'Target']); }
  else list = G.f.map(function (f, i) { return [f, i === MEI ? 'You' : (f.team === me0.team ? 'Ally' : 'CPU ' + i)]; });
  hudTarget = tg; hudPartner = me0.partner; var el = $('#hud'); el.style.setProperty('--n', list.length); HUD = [];
  el.innerHTML = list.map(function (q) { return hudCard(q[0], q[1]); }).join('');
  el.querySelectorAll('.hc').forEach(function (c, i) { HUD.push({ f: list[i][0], c: c, hp: c.querySelector('[data-h=hp]'), bhp: c.querySelector('[data-h=bhp]'), bst: c.querySelector('[data-h=bst]'), bm: c.querySelector('[data-h=bm]'), bmo: c.querySelector('[data-h=bmo]'), bma: c.querySelector('[data-h=bma]') }); });
}
function startMatch() {
  if (NET.role === 'client') return;
  MEI = 0; NET.mirror = false;
  var nt = NET.role === 'host' ? netTeams() : { teams: warTeams(CFG.servant, CFG.master, CFG.teams), slots: {} }, teams = nt.teams, spawn = [0].concat(shuffled([1, 2, 3, 4, 5, 6]));
  newWar(teams, { playAs: CFG.playAs, spawnOrder: spawn });
  for (var k2 = 1; k2 < G.f.length; k2++) G.ai[k2] = mkAI(G.f[k2], DIFF[CFG.diff]);
  if (NET.role === 'host') {
    NET.game = { id: Math.random().toString(36).slice(2, 8), teams: teams.map(function (t) { return [t.servant.id, t.master.id]; }), spawn: spawn, playAs: CFG.playAs, slots: nt.slots };
    NET.ev = []; NET.prev = {}; netMarkHumans(nt.slots);
    NET.R.presence({ game: NET.game, s: null }).catch(function () {});
  }
  enterGame(teams.length);
}
function enterGame(nTeams, title, sub) {
  var me0 = G.f[MEI];
  parts = []; texts = []; V = []; puffs = []; ghosts = []; flashes = []; cracks = []; band.t = 0; slowT = 0; audInit(); shake = 0; endShown = false; speedMul = CFG.speed; acc = 0;
  buildHud(); renderStances(); $('#skl').textContent = me0.A.skill.name.split(': ').pop().split(' ').slice(0, 2).join(' ');
  document.querySelector('.b[data-b="spirit"]').hidden = !!me0.def.isMaster || G.mode !== 'war';
  document.querySelectorAll('.b.seal').forEach(function (el) { el.classList.remove('used'); });
  $('#ordBtn').hidden = $('#sealBtn').hidden = !me0.def.isMaster || !me0.partner; closePops();
  $('#setup').style.display = 'none'; $('#duel').style.display = 'block'; document.body.classList.add('ingame'); $('#end').classList.remove('on'); $('#pz').classList.remove('on');
  held.mx = 0; held.my = 0; keys = {}; running = true; paused = false; last = performance.now();
  cam.x = me0.x; cam.y = me0.y;
  if (title) { FX.banner(title, sub); return; }
  BUB = []; SAYT = {}; LASTFOE = {}; ENGT = {}; INTRO = null; document.body.classList.remove('intro');
  if (startIntro(nTeams)) return;
  FX.banner('The Holy Grail War', 'Fuyuki City · ' + nTeams + ' teams' + (NET.game ? ' · ' + (Object.keys(NET.game.slots).length + 1) + ' players' : ''));
}
function endMatch(toSetup) { running = false; INTRO = null; document.body.classList.remove('intro'); if (NET.role === 'host' && NET.game) { NET.game = null; NET.R.presence({ game: null, s: null }).catch(function () {}); } if (NET.mirror) { NET.mirror = false; MEI = 0; if (NET.R) NET.R.presence({ ing: null, inp: null }).catch(function () {}); } renderNet(); document.body.classList.remove('ingame'); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {} $('#duel').style.display = 'none'; $('#setup').style.display = 'block'; $('#end').classList.remove('on'); $('#pz').classList.remove('on'); }
function startCurrent() { if (CFG.game === 'arena') startArena(); else startMatch(); }
$('#go').addEventListener('click', startCurrent);
$('#again').addEventListener('click', function () { if (NET.role === 'client') { netSay('Waiting for the host to start again.'); endMatch(); return; } startCurrent(); });
$('#menu').addEventListener('click', endMatch); $('#menu2').addEventListener('click', endMatch); $('#quit').addEventListener('click', endMatch);
$('#pause').addEventListener('click', function () { paused = true; $('#pz').classList.add('on'); });
$('#resume').addEventListener('click', function () { paused = false; last = performance.now(); $('#pz').classList.remove('on'); });
document.addEventListener('visibilitychange', function () { if (document.hidden && running && !G.over) { paused = true; $('#pz').classList.add('on'); } });

