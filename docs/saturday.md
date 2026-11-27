# Saturday plan (prepared Nov 26)

The overall order of everything is in `docs/roadmap.md`; this page is phases 0 and 1 in detail.

Everything open, in the order I'd take it. Each step ends with `npm test`, a rebuild, a publish and a push. The full queue stays in `docs/todo.md`; the map and vehicle plans are in `docs/map-overhaul.md`.

## 0. The truce fix (first; `docs/truce-bases.md`)
AI never targets or swings at truce partners; self-defence never breaks an oath; a warning before a human's blow breaks it; truce rings and a TRUCE chip; tests and sim counters. Then base upgrades in place of the ley-line task.

## 1. Balance pass, split by mode (owner, Nov 26)
The owner will balance the Arena and the Grail War separately: "the only way to be balanced". NPs in particular are mainly for the war's longer fights.
- **First, the plumbing:** give every tunable number a war value and an Arena value. Arena duels already build from `SERV_DUEL` (duel-length stats) and master duels from `MDUEL`; extend that so `NP_RW` (NP charge and damage), NP momentum, perk strengths and gun numbers can differ per mode, and the war keeps its own.
- **Then tune, one number at a time, from the reports:**

| Item | Tool | Baseline (Nov 26) |
|---|---|---|
| Each servant's NP: charge time, damage, how often it is reached (war first, then Arena) | `node tools/npcheck.js 4` (Arena duels); `npm run sim` (war) | `docs/balance/np-2026-11-26-after.txt`: 25% cancelled, 39 damage per fired NP; Gilgamesh 70% duel wins; most servants reach their NP under once per ten duels |
| King Arthur's duel rate (already high before Excalibur's pillar) | `tools/npcheck.js` win column | about 69% |
| Master duels | `node tools/mduel.js 30` | all 13 within 40–60% (Caren and Ryuunosuke have `MDUEL` entries) |
| Caren's Sacrament (cooldown raised 22 → 40 s, not sim-checked) | `mduel.js`, `tools/masterwar.js caren 20` | n/a |
| Ryuunosuke in the war | `node tools/masterwar.js ryuunosuke 40` vs `rin`, `kirei` | 3/20 wins vs Rin 6, Kirei 5 (noise likely) |
| Event perks (Reclaimed Prana, Unshaken, Unmasked, The Workshop Holds, Wine of Kings) | `npm run sim` | unmeasured |
| Lancelot's MP5 and shotgun | `tools/npcheck.js` (his win%) | unmeasured |
| War pacing after the Banquet change (AI teams now go to it) | `npm run sim` | targets in CLAUDE.md: 4+ teams at Day 2, 3+ at Night 3, 8/10 reach the Grail, events nearly every phase; night dead time about 37–40% |

## 2. Reality marbles
Iskandar's Ionioi Hetairoi, EMIYA's and Shirou's Unlimited Blade Works: no NP charging inside one's own marble (it is chained today), and a buff for its duration instead (proposed: Iskandar's army fights beside him and his blows hit harder; EMIYA and Shirou get faster swords and recharging skills while blades rain on enemies near them). Balance in the war and the Arena separately.

## 3. Sealed School, the rest
Already done: no one enters or leaves while sealed, targetable skeletons that never spawn on anyone, the blood-red dome, the Reclaimed Prana perk. Still to do: reasons to go there (so teams get trapped), and more content (waves, breaking the seal from inside, a payoff for surviving).

## 3b. Quick looks and fixes (`docs/events-3.md`)
- The War Board drop-down (key I) and the False Death rework (no global death banners; Church notices and rumors; the False Death rides on fights, not the deck).

## 4. AI overhaul (best done with the map overhaul)
Always fight back when attacked; keep things hidden by day (no fights unless someone else starts one; alleys and line-of-sight witnesses come with the map); no masters standing and staring; "protect me" servants hold a spot near their master instead of pushing into them. Orders cut to two: **Stay with me** and **Act freely**; the AI decides the rest.

## 5. Map overhaul, step 1
Draft 2 is approved (`docs/map-draft-2.png`, drawn by `tools/mapdraft.py`): the coastline outline, eight districts with one rival base each (closest rival bases 2,300 apart, today 1,423), all points of interest, three estate plots and five backup safehouses, the Uryuu storehouse for Ryuunosuke, Mount Enzou as its own lobe with the cave on a hidden trail. Step 1 builds the outline, districts, roads and base sites and moves every coordinate table with them.

## Also ready to build (planned Nov 26, `docs/story-modes.md`)
- Grail circle: appear at midnight, close soon after, much smaller.
- Quick fix: Berserker Unchained for Berserkers only, The Grail's Taint otherwise.
- The Events setting (Random, Fourth War, Fifth War), then the Fuyuki Fire, then the story modes.

## Later (owner picks the order)
- Map overhaul steps 2–4: alleys, line-of-sight witnesses, daylight AI rules; non-square buildings, lots, fences and props; docks with container yards; destructible props (containers, crates, fences, lamp posts, vending machines).
- Vehicles: wreckable parked cars, then traffic and sidewalks, then driving (Rider class drives best).
- Master type passives: Mage family (field starts higher, as now), Fledgling Growth, Mage killer (fields do not slow him, bolts half), Church (shared Church base and sanctuary), Outsider (as now).
- New masters: Bazett, Shinji, Ayaka (`docs/future-masters.md`).
- Progression with alternate skills; lore Arena maps; new large war maps.
