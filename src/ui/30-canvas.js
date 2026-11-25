var MEI = 0;
var cv = $('#cv'), ctx = cv.getContext('2d'), VW = 1120, VH = 700, VIEW = { cx: 0, cy: 0, zoom: 1 };
cv.addEventListener('pointerdown', function (e) { if (!running || !G) return; var r = cv.getBoundingClientRect(), sx = (e.clientX - r.left) / r.width * VW, sy = (e.clientY - r.top) / r.height * VH, wx = (sx - VW / 2) / VIEW.zoom + VIEW.cx, wy = (sy - VH / 2) / VIEW.zoom + VIEW.cy, f = G.f[MEI], best = null, bd = 80; enemiesOf(f).forEach(function (en) { var d = Math.hypot(en.x - wx, en.y - wy); if (d < bd) { bd = d; best = en; } }); if (NET.mirror) NET.lk = best ? G.f.indexOf(best) : -1; else f.lock = best; });
var parts = [], texts = [], shake = 0, banner = { text: '', t: 0 }, cam = { x: 800, y: 550 };
var running = false, paused = false, speedMul = 1, acc = 0, last = 0, endShown = false, hits = {};
/* what the viewer can see and hear: the camera's surroundings, in the same space (city or the same interior) */
var fxPos = null;
function viewZone() { var me = G && G.f[MEI]; return me ? zoneOfXY(me.x, me.y) : 'city'; }
function zoneOfXY(x, y) { if (!MAP.cityW || x < MAP.cityW) return 'city'; var r = roomAt(x, y); return r ? r.id : 'void'; }
function viewDist(x, y) { return Math.hypot(x - cam.x, y - cam.y); }
FX.near = function (x, y) { if (!G || G.mode !== 'war') return true; if (MAP.cityW && zoneOfXY(x, y) !== viewZone()) return false; return viewDist(x, y) < Math.max(900, VW / (VIEW.zoom || 1) * 0.7); };
FX.shake = function (v) { if (fxPos && !FX.near(fxPos.x, fxPos.y)) return; shake = Math.max(shake, v); };
FX.text = function (f, s) { var big = isNaN(+s); texts.push({ x: f.x + (Math.random() - 0.5) * 16, y: f.y - 30, t: 0, s: s, col: big ? '#ffd36b' : (f.idx === 0 ? '#ff9aa2' : '#e9e4d3'), big: big }); };

