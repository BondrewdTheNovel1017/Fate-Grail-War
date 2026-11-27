# Queue (owner's requests, organized)

Order: fix what every game feels first (bugs and the AI), then small direct requests, then larger features. New masters have their own list in `docs/future-masters.md`. Tick items off here as they land.

## 1. Every game: bugs and feel
- [ ] **Events not showing in real wars.** In a playtest no event appeared, and any that did weren't shown on the map or in text, although the sims draw an event every phase. Find why (human wars versus the sim), then make every event announce itself clearly (banner, log line, minimap marker, objective arrow) and happen a little more often.
- [ ] **AI pass: feel alive and intelligent.**
  - A Hassan circled the player without attacking: check Assassin AI, concealment, and Zabaniya's `aiKeep` step-back (it may hold range too long and never commit).
  - A Kiritsugu stood and stared from afar: check ranged-master AI when the target is known but outside its preferred band, and the `knows`/`aimFoe` gating.
  - The AI rushes straight back out after a seal rescue: it should recover at home and regroup with its partner first.
  - Goal: varied, readable behaviour (flanking, baiting, retreating to heal, cover and doors, pressing an advantage, protecting the master) instead of hovering. Measure in the sims (time attacking versus idling near a known enemy).
- [ ] **Cleaner UI.** Text and UI cover the play area. Audit what's on screen in a war (banners, notices, bubbles, task text, HUD) and move, shrink or fade it so the centre stays clear.

## 2. Small direct requests
- [x] **Kiritsugu:** light attacks become a combat knife (melee); guns stay on heavy, skill and signature. Double Accel (Time Alter) also speeds his attacks for its duration, balanced with the sims.
- [x] **Origin Rounds vs Outsiders:** no ability disable on Outsiders (no magic circuits); show "no effect".
- [x] **Einzbern castle stair:** move the stair to the courtyard somewhere natural (off the grand staircase or the great hall's back wall); keep the door and nav working.
- [x] **Lancelot’s seized weapons:** tint the weapon itself black and red while `armT > 0`, and draw the veins along the weapon (using `drawWeapon`'s grip and rotation, `GRIP`/`putW`) so they follow each swing, instead of a fixed spot in front of him.

- [x] **Master-duel balance** (done Nov 26: support skills work solo, duel-only `MDUEL` table; all 12 now 43–60% in `tools/mduel.js 30`). Was: (Arena master duels): win rates are lopsided (3 duels against each other master, Nov 26): Sakura 91%, Kayneth 76%, Kiritsugu 74% (after his knife rework), Kirei 73%, Tokiomi 58%, Shirou 45%, Kariya 45%, Rin 42%, Kuzuki 42%, Waver 24%, Illya 18%, Irisviel 15%. Bring everyone toward 50% (±10) with `mduel`-style sims; adjust one number at a time.

## 3. Map structure
- [x] **Base spacing (light fix done Nov 26):** estates take the farthest free plot, three plots moved off the hill to the east, the Mackenzie House moved south (`tools/basecheck.js`: closest rival bases now average 1584, worst 1423, was 1041 and 762). Remaining close pairs are canon neighbours: Tohsaka–Matou 1450 and Emiya–Church 1423; ask the owner before moving either.
- [ ] **(original note) Base spacing.** Homes aren't evenly spread; some neighbour each other (for example Tohsaka and Matou). Steps: (1) measure every home/plot distance and how often wars start two teams close together; (2) light fix: `assignHomes` gives estates and safehouses the plot farthest from every other base; (3) only if needed, a rework with spread plots and homes placed randomly each war at a minimum distance. The Einzbern castle stays fixed (courtyard and Banquet), probably the Church too (Executors, events); decide about Tohsaka, Matou and Emiya before reworking. Moving a home moves its doors, summoning spot and nav links.

- [x] **Ryuudou Temple as its own northern area** (done Nov 26: houses and the hill street west of the avenue removed, woods out to x 3000, lake behind the temple, cave mouth on the west hillside with its own path; stairs unchanged). The temple stands alone on a hill or mountain to the north, with woods around it and nothing built to its left or right. Keep the stairs up the hill as they are. Add a lake behind the temple. Move the cavern entrance out of the temple grounds to the side of the hill in the surrounding area (a tree currently blocks it). Run `tools/mapcheck.js`, the reachability tests and the Great Cavern event checks after.

## 4. Larger features (one at a time, owner picks the order)
- [ ] **New masters:** ~~Caren~~ and ~~Ryuunosuke~~ (added Nov 26), Bazett, Shinji, then Ayaka (designs in `docs/future-masters.md`).
- [ ] **Progression:** things to work toward and unlock, starting with an alternate skill for every character. Settle first: how unlocks are earned; where progress is saved (browser storage is per device; following the player needs a claude.ai capability or a store on the Cloudflare site); alternate skills as sidegrades, never upgrades, sim-checked; draft one alternate skill per character for review before building.
- [ ] **Map overhaul (planned, see `docs/map-overhaul.md`):** outline shape, districts with spaced bases, the temple in its own forest lobe with a hidden cave trail, non-square buildings, fences and props, dark alleys with line-of-sight witnesses, daylight AI rules. Replaces the Fuyuki detail pass and the old base-spacing note.
- [ ] **Fuyuki detail pass:** more props and character per district, more interiors where they matter (`tools/mapcheck.js` and reachability tests after).
- [ ] **Lore Arena maps** (hand-made in `MAPS` with a `drawFloor` theme): Ryuudou Temple stairs and gate, Einzbern forest clearing, Hyatt rooftop, Matou cellar, Kotomine Church interior, riverside warehouses, Iskandar's desert, the Grail's crater, the Greater Grail cavern. Each with spawns, fair cover and a duel sim.
- [ ] **New large war maps**, chosen before a war: Snowfield (Fate/strange Fake), Trifas (Apocrypha), Fourth-War Fuyuki (Fate/Zero). Each needs homes with interiors, roads and nav, event and Grail sites, civilian routes and the full sim pass. Start with one.

- [ ] Ryuunosuke war check (Nov 26, 20 seeded wars each, `tools/masterwar.js`): Ryuunosuke 3 wins, Rin 6, Kirei 5; raising his harm income to 0.45/30 did not help (1 win), so income is not the gap. Within noise for now; re-check with more wars after the map overhaul.

## 5. Playtest notes (Nov 26, evening) — logged, not started
**Quick fixes**
- [x] Einzbern "enhance barrier" day task: make it the same ward-stone carrying activity as everyone else's fortify (rune gathering), not a plain circle.
- [x] Kiritsugu's Calico shows "0" damage: any hit that deals more than 0 shows at least 1.
- [x] Church Bounty (hunt a master, earn a Command Seal): taking one of the target's lives (a seal rescue) also counts as confirmed, not only a kill.
- [x] Caren's Sacrament heals too much: cooldown 22 → 40 s (owner chose the longer cooldown; full sim check on Saturday).

**Events**
- [ ] King's Banquet (done Nov 26: waits for two servants, no repeated lines; scripted conversations added (31); still to do: safe zone, AI going there and leaving before dusk): starts only once at least two servants are at the table; no line repeated in one banquet; prefer cohesive scripted conversations for the servants present, generic lines only when none fit; the courtyard is a temporary safe zone; servants go to it often and leave before dusk.
- [ ] Sealed School (done Nov 26: no one enters or leaves while sealed, skeletons targetable and never spawn on anyone, blood-red dome on the city map; still to do: reasons to go there, more content): polish; fix walking in from outside while sealed; give teams a reason to go there so they can be trapped; dragon-tooth warriors must be targetable and never spawn on top of anyone; flesh the event out.
- [ ] Event rewards: every event needs a reason to take part. Command Seals only where it fits; otherwise a perk with an icon (a timed buff, intel, a field level, a true name...).

**War setup options**
- [x] (Nov 26) Draft modes: Standard (one servant of each class), True random, and lore pairings: Fourth War teams, Fifth War teams, applied to the remaining pairings or to all of them (including the player's).

**Dialogue**
- [x] (Nov 26) Downtime talk between master and servant while walking or doing day tasks out of combat: rare, never spammed; pair-specific lines and multi-line conversations; Kiritsugu stays silent.

**AI overhaul**
- [ ] A robust AI rebuild: always fight back when attacked; keep things hidden by day (no fights unless someone else starts one; ties in with the map plan's alleys and line-of-sight witnesses); no masters standing and staring at each other; "protect me" servants must not walk into and push their master. Cut orders down (maybe two simple ones) and let the AI decide the rest.

**Combat**
- [ ] Reality marbles (Iskandar's Ionioi Hetairoi, EMIYA's and Shirou's Unlimited Blade Works): no NP charging inside one's own marble (stops chaining); a buff for its duration instead.
- [ ] Noble Phantasms should feel stronger and land: slower charge allowed if they gain hyper armor and more damage; keep balance (measure how often NPs are cancelled and how much they deal today).
- [ ] Lancelot: keep his seized melee weapons and add two seized guns, an MP5 and a second real gun (not the Vulcan, which reads as an NP; offer choices), each with a reload like Kiritsugu's.
