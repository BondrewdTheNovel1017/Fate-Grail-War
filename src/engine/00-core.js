var STEP = 1 / 60, W = 1600, H = 1100, FR = 20, PARRY = 0.17;
var FX = { shake: function () {}, spark: function () {}, text: function () {}, banner: function () {}, snd: function () {}, fx: function () {}, slow: function () {}, say: function () {}, duo: function () {}, phase: function () {}, church: function () {}, field: function () {}, truename: function () {}, task: function () {}, event: function () {}, turned: function () {}, unturned: function () {}, hesitate: function () {}, pact: function () {}, near: function () { return true; } };
// hit-freeze only when the viewer can see the hit (the UI decides what "near" means)
// Hit-stop is per fighter: only the attacker and the one hit freeze, the rest of the war keeps moving.
function hitPause(att, def, v) { if (att) att.hs = Math.max(att.hs || 0, v); if (def) def.hs = Math.max(def.hs || 0, v); }
// The whole screen freezes only for big moments near the viewer: kills, God Hand, a Noble Phantasm connecting, a parry a human is part of.
function hitstopAt(o, v) { if (o && FX.near(o.x, o.y)) G.hitstop = Math.max(G.hitstop, v); }
function humanIn(a, b) { return !!((a && a.idx !== undefined && !G.ai[a.idx]) || (b && b.idx !== undefined && !G.ai[b.idx])); }
var G = null;
var PILLARS = [];
