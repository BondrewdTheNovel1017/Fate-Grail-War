/* ---- base upgrades: the chip (in #perks, from perkHud) opens this panel; choosing goes through the 'upg_<id>' button so it works online ---- */
function upgPanel(open) {
  var el = $('#upgPanel');
  if (!el) { el = document.createElement('div'); el.id = 'upgPanel'; el.hidden = true; document.body.appendChild(el);
    el.addEventListener('click', function (e) { var t = e.target.closest('button'); if (!t) return; e.stopPropagation(); if (t.dataset.uclose) { upgPanel(false); return; } if (t.dataset.upick && !t.disabled) { btnDown('upg_' + t.dataset.upick); setTimeout(upgRender, 120); } });
    ['keydown', 'pointerdown', 'touchstart'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.stopPropagation(); }); }); }
  el.hidden = !open; if (open) upgRender();
}
function upgRender() {
  var el = $('#upgPanel'); if (!el || el.hidden || !G) return; var me = G.f[MEI], U = G.upg && G.upg[me.team]; if (!U) { el.hidden = true; return; }
  var home = atHome(me);
  el.innerHTML = '<div class="uph"><b>Base upgrades</b><span>' + U.picks + ' to choose</span><button data-uclose="1" aria-label="Close">✕</button></div>' +
    '<p class="upn">' + (home ? 'Each upgrade has two ranks. Fortifying your home earns another pick.' : 'Return to your home to choose. Fortifying it earns more picks.') + '</p>' +
    UPG_ORDER.map(function (id) { var u = UPGRADES[id], r = U.have[id] || 0, can = home && U.picks > 0 && r < 2;
      return '<div class="upr"><div class="upi">' + u.icon + '</div><div class="upt"><b>' + esc(u.name) + ' <i>' + (r ? 'rank ' + r : '') + '</i></b>' +
        u.r.map(function (tx, k) { return '<span class="' + (k < r ? 'got' : k === r ? 'next' : '') + '">' + (k + 1) + '. ' + esc(tx) + '</span>'; }).join('') + '</div>' +
        '<button data-upick="' + id + '"' + (can ? '' : ' disabled') + '>' + (r >= 2 ? 'Full' : 'Choose') + '</button></div>'; }).join('');
}
var upgEv0 = FX.event;
FX.event = function (kind, d, msg) {
  if (kind === 'upgrade' && G && G.f[MEI]) { var mine = d.team === G.f[MEI].team, u = UPGRADES[d.id]; if (mine) { FX.banner(u.icon + ' ' + u.name + (d.rank > 1 ? ' II' : ''), u.r[d.rank - 1]); PERKT = 0; upgRender(); } return; }
  if (kind === 'upgradePick' && G && G.f[MEI]) { if (d.team === G.f[MEI].team) { note('A base upgrade to choose: tap ✦ under your health bars.', '#ffd36b'); PERKT = 0; } return; }
  upgEv0(kind, d, msg);
};
document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-upg]')) upgPanel(true); });
