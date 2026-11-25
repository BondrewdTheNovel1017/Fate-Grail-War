
/* ================= UI / RENDER ================= */
var $ = function (s) { return document.querySelector(s); };
var CFG = { servant: 'richard', master: 'rin', playAs: 'servant', teams: 7, diff: 'knight', speed: 1 };
try { var sv = JSON.parse(localStorage.getItem('war2.cfg') || 'null'); if (sv) Object.keys(CFG).forEach(function (k) { if (sv[k] !== undefined) CFG[k] = sv[k]; }); } catch (e) {}
if (!SERV[CFG.servant]) CFG.servant = 'richard'; if (!MASTERS[CFG.master]) CFG.master = 'rin'; if ([3, 4, 7].indexOf(CFG.teams) < 0) CFG.teams = 7;
var FFA_COL = ['#3fb3c4', '#cf4a52', '#e0b04a', '#a77be0'];
function slotCol(i) { return CFG.mode === 'teams' ? (CFG.slots[i].team === CFG.slots[0].team ? '#3fb3c4' : '#cf4a52') : CFG.mode === 'duel' ? (i ? '#cf4a52' : '#3fb3c4') : FFA_COL.at(i); }
var WAR_COL = ['#e2515c', '#f0a93b', '#a77ae6', '#5bc47a', '#e07ab8', '#d8c9a0'];
function teamCol(f) { if (!G) return '#3fb3c4'; if (G.mode === 'war') { var mt = G.f[MEI] ? G.f[MEI].team : 0; if (f.team === mt) return '#3fb3c4'; return WAR_COL.at((f.team > mt ? f.team - 1 : f.team) % 6); } if (G.mode === 'ffa') return FFA_COL.at(f.idx % 4); return f.team === G.f[MEI].team ? '#3fb3c4' : '#cf4a52'; }
function saveCfg() { try { localStorage.setItem('war2.cfg', JSON.stringify(CFG)); } catch (e) {} if (typeof NET !== 'undefined' && NET.R) NET.R.presence({ pick: netPick() }).catch(function () {}); }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
