# Fate Grail War: notes for Claude

- The game ships as ONE self-contained HTML page (published as a claude.ai artifact). `node tools/build.js` joins `src/engine/*.js` then `src/ui/*.js` (name order) into one IIFE inside `src/page/template.html`, with `src/page/style.css` inlined. Write plain ES5-style browser JS: no modules, no imports, no npm dependencies.
- `src/engine/` must stay DOM-free: tests and tools load it with `new Function` (see `tests/engine.js`). Effects reach the UI only through the `FX` hook object, which the UI fills in.
- Fixed timestep `STEP = 1/60`; `simStep(dt)` advances the war. `G` is the live game state; `G.f` the fighters (servants and masters), `G.ai[i]` their AI or null for a human.
- Run `npm test` before every commit. Add a test in `tests/rules.test.js` for each new rule.
- Balance: use `npm run sim` (many AI wars) and change numbers from its report, not by feel alone. The owner cares most that the game is fun.
- Canon servants and masters are drawn as original top-down sprites. King Arthur's effects stay white/pale, never a gold beam.
- After changing the game, rebuild and commit `dist/fuyuki-war.html` too, so the repo always holds a playable build.
- Arena mode lives in the main game (`src/ui/25-arena.js`): duel/ffa/teams/master duels use `newGame()` with `SERV_DUEL` (duel-length stats); master-and-servant pairs use `newWar({ map, quick: true })`. `arena/servant-duel.html` is the old standalone arena, kept for reference only.
- The war map is `MAPS.city` (`src/engine/12-city.js`, drawn by `src/ui/81-city-draw.js`): roads, zones and buildings as data; buildings collide as rectangles (`RECTS`, `rectsIn`, `segRect`), trees as circles. Interiors sit east of `cityW` and are reached through `MAP.doors`; AI routes on a road graph (`src/engine/13-citynav.js`, `navPath`). `assignHomes` puts each master at their lore home and builds extra estates on `MAP.plots`. The old compact map (`MAPS.fuyuki`) is used by Arena's Quick Grail War.
- Blocks with `over: true` (gates, arches, the arcade roof, the bridge arch) are also `walk: true`: they never collide and are drawn after the fighters by `drawOverhead` (`src/ui/82-city-over.js`), fading while someone is under them. Doors, yards and summoning circles are drawn there too.
- A city war opens with the summoning (`src/ui/83-intro.js`): the sim waits while the player's master chants at `MAP.spots[home]` (`summonSpot`), then the servant appears. Speech bubbles come from `FX.say(f, key)` and the `LINES` table there; write original lines.
- Hit-stop, shake, slow-motion, banners and sounds are local: use `hitstopAt` and `FX.near` in the engine, `hearVol` ranges in the UI. The AI adds a cross-zone penalty (`zoneGap`) so it walks through doors instead of chasing enemies through walls.
