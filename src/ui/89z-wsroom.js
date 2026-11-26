/* ---- online play on the hosted site: rooms over the game's own WebSocket relay (server/hub.js) ----
   The same calls as the claude.ai room (join, presence, peers, onPeers, onConnection, leave), so the lobby and
   netsync work unchanged. One socket per game code carries all of its rooms; presence patches are coalesced and
   sent at most every 45 ms, and the socket reconnects (rejoining every room with full presence) if it drops. */
function wsRoomNs(base) {
  var socks = {};
  function sock(code) {
    if (socks[code]) return socks[code];
    var S = socks[code] = { code: code, ws: null, open: false, me: null, rooms: {}, q: [], timer: null, conn: [], retry: 0, closed: false };
    function fireConn(v) { S.conn.forEach(function (h) { try { h(v); } catch (e) {} }); }
    S.send = function (op) {
      if (op[0] === 'p') { for (var i = S.q.length - 1; i >= 0; i--) { var o = S.q[i]; if (o[0] === 'p' && o[1] === op[1]) { Object.assign(o[2], op[2]); return S.kick(); } if (o[1] === op[1]) break; } op = ['p', op[1], Object.assign({}, op[2])]; }
      S.q.push(op); S.kick();
    };
    S.kick = function () { if (!S.timer) S.timer = setTimeout(S.flush, S.last && Date.now() - S.last < 45 ? 45 - (Date.now() - S.last) : 0); };
    S.flush = function () { S.timer = null; if (!S.open || !S.q.length) return; var b = S.q; S.q = []; S.last = Date.now(); try { S.ws.send(JSON.stringify({ b: b })); } catch (e) {} };
    S.connect = function () {
      var ws; try { ws = S.ws = new WebSocket(base + code); } catch (e) { Object.keys(S.rooms).forEach(function (n) { S.rooms[n].fail('Could not open a connection to the game server.'); }); return; }
      ws.onopen = function () {
        S.open = true; S.retry = 0;
        // after a reconnect every room is joined again and gets this page's whole presence
        var re = []; Object.keys(S.rooms).forEach(function (n) { re.push(['j', n]); if (Object.keys(S.rooms[n].mine).length) re.push(['p', n, S.rooms[n].mine]); });
        S.q = re.concat(S.q.filter(function (o) { return o[0] !== 'j'; })); S.flush(); fireConn(true);
      };
      ws.onmessage = function (ev) {
        var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
        var dirty = {};
        (m.b || []).forEach(function (o) {
          var k = o[0], R = S.rooms[o[1]];
          if (k === 'you') { S.me = o[1]; return; }
          if (k === 'e') { R = S.rooms[o[2]]; if (R) R.fail(o[1] === 'room_full' ? 'That room is full (eight players at most).' : 'The game server refused: ' + o[1] + '.'); return; }
          if (!R) return;
          if (k === 's') { R.others = {}; o[2].forEach(function (q) { R.others[q[0]] = { peer: q[0], presence: Object.freeze(q[1] || {}), updatedAt: Date.now() }; }); R.ready(); dirty[o[1]] = R; }
          else if (k === 'u') { var cur = R.others[o[2]], pr = Object.assign({}, cur ? cur.presence : {}); Object.keys(o[3] || {}).forEach(function (f) { if (o[3][f] === null) delete pr[f]; else pr[f] = o[3][f]; }); R.others[o[2]] = { peer: o[2], presence: Object.freeze(pr), updatedAt: Date.now() }; dirty[o[1]] = R; }
          else if (k === 'g') { delete R.others[o[2]]; dirty[o[1]] = R; }
        });
        Object.keys(dirty).forEach(function (n) { dirty[n].fire(); });
      };
      ws.onclose = function () {
        S.open = false; S.ws = null; fireConn(false);
        if (!S.closed && Object.keys(S.rooms).length) { S.retry++; setTimeout(S.connect, Math.min(4000, 400 * S.retry)); }
        if (S.retry > 6) Object.keys(S.rooms).forEach(function (n) { S.rooms[n].fail('Lost the connection to the game server.'); });
      };
    };
    S.connect();
    return S;
  }
  function mkRoom(name) {
    var code = name.split('-')[1], S = sock(code), waiters = [];
    var R = { name: name, mine: {}, others: {}, subs: [], joined: false };
    R.snapshot = function () { var arr = [{ peer: S.me || 'me', by: null, isMe: true, sameTab: true, kind: 'viewer', guest: false, presence: R.mine, updatedAt: Date.now() }]; Object.keys(R.others).forEach(function (p) { var o = R.others[p]; arr.push({ peer: p, by: null, isMe: false, sameTab: false, kind: 'viewer', guest: false, presence: o.presence, updatedAt: o.updatedAt }); }); return arr; };
    R.fire = function () { var s = R.snapshot(); R.subs.forEach(function (h) { try { h({ peers: s, joined: [], left: [], updated: [] }); } catch (e) {} }); };
    R.ready = function () { if (R.joined) return; R.joined = true; waiters.splice(0).forEach(function (w) { w[0](R.api); }); };
    R.fail = function (msg) { if (R.joined) { NET.err = msg; if (typeof renderNet === 'function') renderNet(); return; } waiters.splice(0).forEach(function (w) { w[1]({ code: 'unavailable', message: msg }); }); };
    R.api = {
      name: name,
      presence: function (patch) {
        var m = Object.assign({}, R.mine); Object.keys(patch).forEach(function (k) { if (patch[k] === null) delete m[k]; else m[k] = patch[k]; });
        if (JSON.stringify(m).length > 4096) return Promise.reject({ code: 'invalid_argument', message: 'presence over 4 KiB' });
        R.mine = m; S.send(['p', name, patch]);
        if (!R.fq) { R.fq = true; setTimeout(function () { R.fq = false; R.fire(); }, 16); }
        return Promise.resolve();
      },
      peers: R.snapshot,
      onPeers: function (h) { R.subs.push(h); setTimeout(R.fire, 0); return function () { R.subs = R.subs.filter(function (x) { return x !== h; }); }; },
      connected: function () { return S.open; },
      onConnection: function (h) { S.conn.push(h); setTimeout(function () { h(S.open); }, 0); return function () { S.conn = S.conn.filter(function (x) { return x !== h; }); }; },
      leave: function () {
        S.send(['l', name]); delete S.rooms[name];
        if (!Object.keys(S.rooms).length) setTimeout(function () { if (!Object.keys(S.rooms).length && S.ws) { S.closed = true; S.flush(); try { S.ws.close(); } catch (e) {} delete socks[code]; } }, 300);
        return Promise.resolve();
      },
      emit: function () { return Promise.resolve(); }, on: function () { return function () {}; }
    };
    R.wait = function () { return new Promise(function (res, rej) { if (R.joined) res(R.api); else waiters.push([res, rej]); }); };
    S.rooms[name] = R; S.send(['j', name]);
    return R;
  }
  window.addEventListener('beforeunload', function () { Object.keys(socks).forEach(function (c) { var S = socks[c]; S.closed = true; try { S.ws && S.ws.close(); } catch (e) {} }); });
  return {
    hosted: true,
    join: function (name) {
      var code = String(name).split('-')[1]; var S = socks[code];
      var R = S && S.rooms[name]; if (!R) R = mkRoom(name);
      return R.wait();
    }
  };
}
