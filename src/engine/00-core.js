var STEP = 1 / 60, W = 1600, H = 1100, FR = 20, PARRY = 0.17;
var FX = { shake: function () {}, spark: function () {}, text: function () {}, banner: function () {}, snd: function () {}, fx: function () {}, slow: function () {}, say: function () {}, near: function () { return true; } };
// hit-freeze only when the viewer can see the hit (the UI decides what "near" means)
function hitstopAt(o, v) { if (o && FX.near(o.x, o.y)) G.hitstop = Math.max(G.hitstop, v); }
var G = null;
var PILLARS = [];
