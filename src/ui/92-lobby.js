/* ---- the online lobby: host or join, seats for every servant and master, a status panel ---- */
var LOBBY = { pickFor: -1 };
var NET_MODES = [['war', 'Holy Grail War', 'Up to seven teams across Fuyuki. Two players can share a team: one servant, one master.'], ['duel', 'Duel', 'Servant against servant.'], ['ffa', 'Free-for-all', 'Three or four servants.'], ['teams', 'Teams', 'Two against two.'], ['masters', 'Master duel', 'Master against master.'], ['pairs', 'Master and servant', 'Two teams of a master and a servant.'], ['quickwar', 'Quick Grail War', 'Seven teams on the compact map.']];
function lobbyMode(L) { return L.kind === 'war' ? 'war' : L.amode; }
function netStatusHTML() {
  var rows = [], ok = '<b class="ok">●</b>', bad = '<b class="bad">●</b>', wait = '<b class="wait">●</b>';
  rows.push([NET.ns ? ok : (NET.err ? bad : wait), 'Room service', NET.ns ? (NET.ns.local ? 'local test room (this browser only)' : 'claude.ai room') : (NET.err ? 'unavailable' : 'looking…')]);
  if (NET.R) {
    var peers = netPeers().filter(function (p) { return p.presence && p.presence.v === NET_V; });
    rows.push([NET.conn === false ? bad : ok, 'Connected', NET.conn === false ? 'reconnecting…' : 'yes']);
    rows.push([peers.length > 1 ? ok : wait, 'Players here', String(peers.length)]);
    var ch = ['f', 'm', 's0', 's1', 's2', 'c', 'e'].filter(function (k) { return NET.X[k]; }).length; rows.push([ch === 7 ? ok : wait, 'Game channels', ch + ' of 7']);
    if (NET.role === 'client') { var h = netHostPeer(); rows.push([h ? ok : wait, 'Host', h ? esc(h.presence.nick || 'Host') : 'not seen yet']); rows.push([NET.ping ? (NET.ping < 200 ? ok : wait) : wait, 'Ping', NET.ping ? Math.round(NET.ping) + ' ms' : 'measured in game']); }
    var other = netPeers().filter(function (p) { return !p.isMe && p.presence && p.presence.v && p.presence.v !== NET_V; }).length; if (other) rows.push([bad, 'Version', other + ' player(s) on another version: reload the page']);
  }
  if (NET.err) rows.push([bad, 'Last error', esc(NET.err)]);
  return '<div class="nstat"><div class="lbl">Connection</div>' + rows.map(function (r) { return '<div class="nrow">' + r[0] + '<span>' + r[1] + '</span><em>' + r[2] + '</em></div>'; }).join('') + '</div>';
}
function renderNet() {
  var el = $('#netPanel'); if (!el) return; if (running && netInMatch()) return;
  $('#netCodeTag').innerHTML = NET.R ? 'Room <b>' + esc(NET.code.toUpperCase()) + '</b>' : '';
  if (!NET.R) {
    el.innerHTML = '<div class="netgrid"><div class="ncard"><div class="lbl">Your name</div><input class="netin wide" id="netNick" maxlength="20" placeholder="Player" value="' + esc(NET.nick) + '" autocomplete="off">' +
      '<div class="lbl" style="margin-top:16px">Host a room</div><p class="note">Your page runs the war; friends join with the code. The strongest computer should host.</p><button type="button" class="btn seal" id="netHostBtn">Host a room</button>' +
      '<div class="lbl" style="margin-top:18px">Join a room</div><div class="joinrow"><input class="netin" id="netCodeIn" maxlength="8" placeholder="Room code" autocomplete="off"><button type="button" class="btn" id="netJoinBtn">Join</button></div>' +
      (NET.msg ? '<p class="note">' + esc(NET.msg) + '</p>' : '') + '</div>' +
      '<div class="ncard">' + netStatusHTML() + '<p class="note" style="margin-top:12px">Everyone opens this same page on claude.ai, signed in. Public-link visitors cannot join rooms. Up to seven players: every servant and every master is a seat, so two friends can share a team as servant and master.</p></div></div>';
    return;
  }
  var L = NET.lob, host = NET.role === 'host', me = netSelfPeer() || 'host';
  if (!L) { el.innerHTML = '<div class="netgrid"><div class="ncard"><p class="note">Waiting for the host…</p><button type="button" class="btn ghost" id="netLeaveBtn">Leave room</button></div><div class="ncard">' + netStatusHTML() + '</div></div>'; return; }
  var mySlot = L.slots.findIndex(function (s) { return s.p === me; }), players = netPeers().filter(function (p) { return p.presence && p.presence.v === NET_V; });
  var h = '', P = {};
  // the match: host chooses, guests see
  h += '<div class="ncard"><div class="lbl">Match</div>';
  if (host) {
    h += '<div class="modes nmodes">' + NET_MODES.map(function (m) { return '<button type="button" class="mode" data-nmode="' + m[0] + '" aria-pressed="' + (lobbyMode(L) === m[0]) + '"><b>' + m[1] + '</b><small>' + m[2] + '</small></button>'; }).join('') + '</div><div class="chips" style="margin-top:10px">';
    if (L.kind === 'war') { h += [3, 4, 7].map(function (n) { return '<button type="button" class="chip" data-nteams="' + n + '" aria-pressed="' + (L.teams === n) + '">' + n + ' teams</button>'; }).join('') + [3, 5].map(function (n) { return '<button type="button" class="chip" data-nnights="' + n + '" aria-pressed="' + (L.nights === n) + '">' + n + ' nights</button>'; }).join(''); }
    if (L.kind === 'arena' && L.amode === 'ffa') h += [3, 4].map(function (n) { return '<button type="button" class="chip" data-ncount="' + n + '" aria-pressed="' + (L.count === n) + '">' + n + ' fighters</button>'; }).join('');
    if (L.kind === 'arena' && L.amode !== 'quickwar') h += '<select class="netin" id="netMap">' + MAP_ORDER.concat(['random']).map(function (id) { return '<option value="' + id + '"' + (L.map === id ? ' selected' : '') + '>' + (id === 'random' ? 'Random battlefield' : esc(MAPS[id].name)) + '</option>'; }).join('') + '</select>';
    h += Object.keys(DIFF).map(function (k) { return '<button type="button" class="chip" data-ndiff="' + k + '" aria-pressed="' + (L.diff === k) + '">AI: ' + DIFF[k].name + '</button>'; }).join('') + '</div>';
  } else {
    var md = NET_MODES.find(function (m) { return m[0] === lobbyMode(L); }) || NET_MODES[0];
    h += '<h3 class="nmode">' + md[1] + '</h3><p class="note">' + md[2] + (L.kind === 'war' ? ' ' + L.teams + ' teams, ' + L.nights + ' nights.' : L.amode !== 'quickwar' ? ' ' + (L.map === 'random' ? 'Random battlefield' : esc(MAPS[L.map].name)) + '.' : '') + ' AI: ' + DIFF[L.diff].name + '.</p>';
  }
  h += '</div>'; P.match = h; h = '';
  // the seats, team by team
  var teams = {}; L.slots.forEach(function (s, i) { (teams[s.t] = teams[s.t] || []).push(i); });
  h += '<div class="ncard"><div class="lbl">Seats</div><p class="note">Take a seat, then pick who you play. Empty seats are played by the AI.</p><div class="nteams">';
  Object.keys(teams).forEach(function (t) {
    h += '<div class="nteam"><div class="ntt">' + (L.kind === 'arena' && (L.amode === 'duel' || L.amode === 'ffa' || L.amode === 'masters') ? 'Fighter ' + (+t + 1) : 'Team ' + (+t + 1)) + '</div>';
    teams[t].forEach(function (i) {
      var s = L.slots[i], T = s.k === 'm' ? MASTERS : SERV, d = T[s.id], occ = s.p ? players.find(function (p) { return p.peer === s.p; }) : null, mine = s.p === me;
      h += '<div class="nseat' + (mine ? ' mine' : '') + (s.p ? ' taken' : '') + '" style="--c:' + (d ? d.col : '#56657a') + '"><span class="th">' + (d ? thumb(d.id, 96) : '<svg viewBox="0 0 96 48" width="96" height="48"><text x="48" y="31" text-anchor="middle" font-size="22" fill="#8fa3b5" font-family="serif">?</text></svg>') + '</span>' +
        '<span class="ns1"><small>' + (s.k === 'm' ? 'Master' : 'Servant') + '</small><b>' + (d ? esc(shortName(d.name)) : 'Random') + '</b><em>' + (occ ? esc(occ.presence.nick || 'Player') + (mine ? ' (you)' : '') : 'AI') + '</em></span>' +
        (mine ? '<button type="button" class="chip" data-nleave="1">Leave seat</button>' : !s.p ? '<button type="button" class="chip" data-ntake="' + i + '">Take seat</button>' : '') + '</div>';
    });
    if (host && L.kind === 'arena' && L.amode === 'teams') h += '';
    h += '</div>';
  });
  h += '</div></div>'; P.seats = h; h = '';
  if (mySlot >= 0) {
    var sl = L.slots[mySlot]; h += '<div class="ncard"><div class="lbl">Your ' + (sl.k === 'm' ? 'master' : 'servant') + '</div><div class="roster">' + entityRosterHTML(sl.k, sl.id, 'data-npick', true) + '</div></div>';
  }
  P.pick = h; h = '';

  // players and status
  h += '<div class="ncard"><div class="lbl">Players</div><ul class="nplayers">' + players.map(function (p) { var pr = p.presence, seat = L.slots.findIndex(function (s) { return s.p === (p.isMe && p.sameTab ? me : p.peer); }); return '<li><b>' + esc(pr.nick || 'Player') + '</b>' + (pr.role === 'host' ? ' <span class="tag">host</span>' : '') + (p.isMe && p.sameTab ? ' <span class="tag">you</span>' : '') + (p.guest ? ' <span class="tag">guest</span>' : '') + '<em>' + (seat >= 0 ? 'seated' : 'no seat') + (pr.role === 'client' ? (pr.ready ? ' · ready' : '') : '') + '</em></li>'; }).join('') + '</ul></div>'; P.players = h; h = '';
  P.status = '<div class="ncard">' + netStatusHTML() + '</div>';
  P.act = '<div class="ncard nact">' + (NET.msg ? '<p class="note">' + esc(NET.msg) + '</p>' : '') + (host ? '<button type="button" class="btn seal" id="netStartBtn"' + (mySlot < 0 ? ' disabled' : '') + '>' + (mySlot < 0 ? 'Take a seat first' : 'Begin') + '</button>' : '<button type="button" class="btn' + (NET.ready ? ' seal' : '') + '" id="netReadyBtn">' + (NET.ready ? 'Ready ✓' : 'Ready') + '</button>') + '<button type="button" class="btn ghost" id="netLeaveBtn">Leave room</button></div>';

  // only the parts that changed are replaced, so a button under the pointer stays put
  if (!el.querySelector('[data-np="match"]')) { el.innerHTML = '<div class="netgrid wide"><div><div data-np="match"></div><div data-np="seats"></div><div data-np="pick"></div></div><div><div data-np="players"></div><div data-np="status"></div><div data-np="act"></div></div></div>'; LOBBY.parts = {}; }
  Object.keys(P).forEach(function (k) { var key = P[k].replace(/_t\d+/g, ''); if (LOBBY.parts[k] !== key) { LOBBY.parts[k] = key; el.querySelector('[data-np="' + k + '"]').innerHTML = P[k]; } });
}
function lobbyReq(slot, id) { NET.req = { slot: slot, id: id || 'random' }; if (NET.role === 'host') netHostResolve(); else { netMyPresence({ req: NET.req }); } renderNet(); }
document.addEventListener('click', function (e) {
  var t = e.target, el; if (!t.closest || running) return;
  if (t.closest('#netHostBtn')) { var c = ''; for (var i = 0; i < 4; i++) c += 'abcdefghjkmnpqrstuvwxyz'.charAt(Math.floor(Math.random() * 23)); netJoin(c, true); return; }
  if (t.closest('#netJoinBtn')) { netJoin(($('#netCodeIn') || {}).value, false); return; }
  if (t.closest('#netLeaveBtn')) { netLeave(); return; }
  if (t.closest('#netStartBtn')) { beginFlourish(netStartHost); return; }
  if (t.closest('#netReadyBtn')) { NET.ready = !NET.ready; netMyPresence({ ready: NET.ready }); renderNet(); return; }
  var L = NET.lob; if (!L) return;
  if ((el = t.closest('[data-ntake]'))) { var s = L.slots[+el.dataset.ntake]; lobbyReq(+el.dataset.ntake, s && s.id); return; }
  if (t.closest('[data-nleave]')) { lobbyReq(-1); return; }
  if ((el = t.closest('[data-npick]'))) { lobbyReq(NET.req.slot, el.dataset.npick); return; }
  if (NET.role !== 'host') return;
  if ((el = t.closest('[data-nmode]'))) { var m = el.dataset.nmode; if (m === 'war') L.kind = 'war'; else { L.kind = 'arena'; L.amode = m; } NET.req.slot = -1; netHostResolve(); return; }
  if ((el = t.closest('[data-nteams]'))) { L.teams = +el.dataset.nteams; netHostResolve(); return; }
  if ((el = t.closest('[data-nnights]'))) { L.nights = +el.dataset.nnights; netHostResolve(); return; }
  if ((el = t.closest('[data-ncount]'))) { L.count = +el.dataset.ncount; netHostResolve(); return; }
  if ((el = t.closest('[data-ndiff]'))) { L.diff = el.dataset.ndiff; netHostResolve(); return; }
});
document.addEventListener('change', function (e) { if (e.target && e.target.id === 'netMap' && NET.lob && NET.role === 'host') { NET.lob.map = e.target.value; netHostResolve(); } });
document.addEventListener('input', function (e) { if (e.target && e.target.id === 'netNick') { NET.nick = e.target.value.slice(0, 20); try { localStorage.setItem('fgw.nick', NET.nick); } catch (x) {} } });
document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target && e.target.id === 'netCodeIn') netJoin(e.target.value, false); });
setInterval(function () { if (!running && NET.R && SHELL.scr === 'net') renderNet(); }, 1500);
