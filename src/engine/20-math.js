function rnd() { G.seed = (G.seed * 1664525 + 1013904223) >>> 0; return G.seed / 4294967296; }
function gauss() { return (rnd() + rnd() + rnd() - 1.5) / 0.5; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function angTo(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }
function angDiff(a, b) { var d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

