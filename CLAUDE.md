# Fate Grail War: notes for Claude

- The game ships as ONE self-contained HTML page (published as a claude.ai artifact). `node tools/build.js` joins `src/engine/*.js` then `src/ui/*.js` (name order) into one IIFE inside `src/page/template.html`, with `src/page/style.css` inlined. Write plain ES5-style browser JS: no modules, no imports, no npm dependencies.
- `src/engine/` must stay DOM-free: tests and tools load it with `new Function` (see `tests/engine.js`). Effects reach the UI only through the `FX` hook object, which the UI fills in.
- Fixed timestep `STEP = 1/60`; `simStep(dt)` advances the war. `G` is the live game state; `G.f` the fighters (servants and masters), `G.ai[i]` their AI or null for a human.
- Run `npm test` before every commit. Add a test in `tests/rules.test.js` for each new rule.
- Balance: use `npm run sim` (many AI wars) and change numbers from its report, not by feel alone. The owner cares most that the game is fun.
- Canon servants and masters are drawn as original top-down sprites. King Arthur's effects stay white/pale, never a gold beam.
- After changing the game, rebuild and commit `dist/fuyuki-war.html` too, so the repo always holds a playable build.
- `arena/servant-duel.html` is the frozen duel arena (future Arena mode); leave it alone unless asked.
