# Queued changes (from the owner)

- Lancelot's seized weapons: the weapons themselves should take on the black-and-red vein colouring (tint the sword, spear and warhammer sprites while `armT > 0`). Right now the red veins (`drawSeizedVeins` in `src/ui/89f-abilities.js`) are drawn at a fixed spot in front of him and don't follow the weapon as it swings. They should be drawn along the weapon itself, using the same grip and rotation as `drawWeapon` (`GRIP`, `putW`), so they move with every swing.

- Base spacing: homes are not evenly spread across the map, and some sit right next to each other (for example the Tohsaka Mansion at 3550,1180 and the Matou Residence at 5000,1180, the canon homes in `homes` in `src/engine/12-city.js`, plus estates on `MAP.plots`). Neighbouring bases cause early collisions and unfair fights. Goals:
  - First, measure: a tool (or a `tools/mapcheck.js` report) giving the distance between every pair of homes and plots, and how often wars place two teams close together.
  - Light fix: when `assignHomes` hands out estates and backup safehouses, pick plots that maximise the distance to every other team's base, not just the next free plot.
  - Larger rework, if the light fix isn't enough: a spread-out set of plots across the whole city, with homes placed on them randomly each war (a minimum distance between any two bases), so the map plays differently every game. Some homes stay fixed no matter what: the Einzbern castle (its interior, the courtyard and the Banquet depend on it), and probably the Church (Executors and the Church events start there). Decide which others are fixed (Tohsaka, Matou, Emiya are lore homes with interiors) before reworking. Moving homes means moving their interiors' doors, summoning spots and the nav links too.

- Progression: give players things to work toward, unlock and obtain across games. First unlockable: an alternate skill for every character (servants and masters), chosen before a match. Start by looking at how it should work, then the owner will decide whether to expand progression further. Open questions for that look:
  - How unlocks are earned (wins, war milestones, per-character play, challenges) and how fast.
  - Where progress is saved: browser storage is per device and can be wiped; an account-backed store would follow the player (on claude.ai a runtime capability, on the Cloudflare site a small server store).
  - Fairness online: unlocked skills must be balanced sidegrades, not upgrades, so a new player isn't outclassed. Every alternate skill needs the same balance checks (duel and war sims).
  - Design a candidate alternate skill per character before building any of it.

- More Arena maps themed on lore locations (hand-made like the current ones in `MAPS`, `src/engine/10-maps.js`, with a `drawFloor` theme each). Candidates to pick from: the Ryuudou Temple stairs and gate (Kojirou's post), the Einzbern forest clearing, the Fuyuki Hyatt rooftop (Kayneth's hotel), the Matou cellar (the worm pit), the Kotomine Church interior, the riverside warehouse district (where Lancer and Saber first met), Iskandar's desert reality marble, the Grail's crater under the Fuyuki Citizens' Hall, and the Ryuudou cavern (the Greater Grail). Each needs spawns, cover laid out for fair fights, and a duel sim to check fights end in a normal time.

- The Grail War's large map (`MAPS.city`, Fuyuki): a detail pass, with more props, set dressing and character in each district, and more interiors where they'd matter. Run `tools/mapcheck.js` and the reachability tests after.
- Completely new large Grail War maps, themed and fitting the setting, chosen before a war like the Arena maps. Candidates: Snowfield (the American desert town of Fate/strange Fake, which also suits Ayaka and Richard), Trifas (the Romanian city and Yggdmillennia castle of Apocrypha, which suits Atalanta), and Fuyuki in the Fourth War era (Fate/Zero's version of the city, with the Hyatt standing and the Citizens' Hall). Each needs its own homes with interiors, roads and a nav graph, event and Grail sites, civilian routes, and the full sim pass (pacing targets). This is a big job per map, so start with one.

## From the owner's playtest (Nov 26)

- AI needs a large pass to feel alive and intelligent. Seen in play:
  - A Hassan circled the player without ever attacking. Check Assassin AI: concealment, the new Zabaniya `aiKeep` stepping back (it may hold range too long and never commit), and the strafe/approach logic.
  - A Kiritsugu stood and stared from afar without acting. Check ranged-master AI when the target is known but out of its preferred band, plus the `knows`/`aimFoe` gating.
  - AI rushes straight back out after losing a life (seal rescue). It should recover at home first and regroup with its partner.
  - The wider goal: varied, readable behaviour (flanking, baiting, retreating to heal, using cover and doors, pressing an advantage, protecting the master) instead of hovering. Measure with the sims (time spent attacking vs idling near a known enemy), not by feel only.
- Kiritsugu: light attacks become a combat knife (melee) instead of gunfire; keep the guns on heavy, skill and signature. Double Accel (his Time Alter skill) should also boost his attacks in a balanced way (for example faster attack speed for its duration), tuned with the sims.
- Origin Rounds must not disable abilities on Outsiders (Kuzuki, later Ryuunosuke): they have no magic circuits to destroy. Show a "no effect" note instead.
- Events: in the playtest no event appeared at all, and any that did weren't shown on the map or in text. Check that `EVT.dayChance` 1 and the night deck actually fire in real (human) wars and not only in the sim; make every event announce itself clearly (banner, log line, minimap marker, an objective arrow) and push them to happen a little more.
- Cleaner UI: some text and UI cover the play area. Audit what's on screen during a war (banners, notices, bubbles, task text, HUD) and move, shrink or fade it so the centre of the screen stays clear.
- Einzbern castle: the stair up to the courtyard sits in an unnatural spot (a separate staircase part near the entrance). Move it somewhere that reads naturally, such as off the grand staircase or the great hall's back wall toward the courtyard, and keep the door and nav links working.
