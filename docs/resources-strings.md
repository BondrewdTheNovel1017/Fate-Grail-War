# Resources (mana, stamina, momentum) and combat strings (planned Nov 26)

Mirrors the Claude Doc "Fate Grail War Roadmap". Mana is the night, stamina is the second, momentum is the fight.

## Clearer bars (Phase 1, cheap)
- Stamina in segments (one segment = one dodge; attacks take slivers); dims while regen is paused (`stDelay`); flashes and sounds one step before exhaustion (`exh`).
- One rule: a chain continues only while you have stamina (last segment flashes); stamina never changes combo damage.
- Phones: segmented stamina arc around the attack buttons, smaller mana arc around skill and NP. Everywhere: thin stamina arc under your own fighter, only when not full. Top HUD keeps health and seals.

## Mana rework (Phase 2a, with hidden homes)
Today (`MANA`, `MANA_POOL` in 55-mana): Rin refills 100 at 2/s anywhere; skills 6, upkeep 0.25/s; almost never a choice.
- Slow regen in the city, fast at home or in your field; refilling from empty at home well under a minute (no dead time).
- One pool: servant skills, NPs, spirit-form healing, familiars and master spells all draw from it.
- Below 25%: servant a little weaker, bar pulses; at 0: no skills or NP until refilled. No sudden deaths.
- AI retreats home to refill when low (feeds hunting and invasion plays).
- Identities stay: Illya and Sakura huge pools, Shirou and Kariya tiny, Ryuunosuke's harm mana, Caren none.
- Checks: `npm run sim` (teams running dry, time at home, night dead time).

## Combat strings (Phase 1b)
- A heavy after lights changes by the count: light+heavy = opener (fast, guard-break or reposition); two lights+heavy = mid (space: knockback, launch, pull); full chain+heavy = signature finisher. Two-hit chains get an opener and a finisher.
- Servants and masters; ranged masters chain spells the same way.
- Options, not damage: DPS within a few percent of today (`tools/npcheck.js`, duel sims); war and Arena values.
- Counterplay explicit: light interrupts a heavy's wind-up; heavy breaks guard; guard and parry beat lights; dodge beats heavy. Guard-breaking strings are slower. Each finisher has a visible wind-up.
- Stamina: steps cost as now; a finisher costs a full segment.
- Taught by the Codex, a first-time name pop-up, and the guided first night. The AI uses strings by range and character.
- No rhythm timing: order of buttons only.
- Engine hook: `f.combo` already counts the chain in `startAct` (60-combat); a heavy reads it to pick the string's attack (`A.strings`).

### The starting set (approved Nov 26)
Opener = L,H; mid = L,L,H; finisher = full chain,H. Two-hit chains: opener and finisher.

| Servant (chain) | Opener | Mid | Finisher |
|---|---|---|---|
| King Arthur (3) | Wind Edge (guard-break gust) | Air Step (dash through) | Strike Air Burst (wind cone, blade flashes gold) |
| Richard (3) | Lion's Shoulder | Crusader's Cut | Lionheart Roar (overhead, staggering roar) |
| Leonidas (2) | Shield Ram (guard-break) | - | Phalanx Thrust (cannot be staggered) |
| Atalanta (2) | Leaping Shot | - | Huntress's Fan (three arrows) |
| Heracles (2) | Rampage Shove | - | Earthshaker (slam, shockwave ring) |
| Diarmuid (3) | Crimson Feint (pierces guard) | Twin Rose Spin | Gae Dearg Thrust (strips buffs and shields) |
| Cu Chulainn (3) | Hound's Leap | Rune Spark | Piercing Lunge |
| Gilgamesh (3) | Gate Burst | - | Kingly Arsenal (five gates in turn; slow, tuned low) |
| Iskandar (2) | Conqueror's Shove | - | Charge of the King |
| Gilles (3) | Tentacle Snare | - | Spawn of the Deep (own cooldown) |
| Lancelot (4) | by weapon | - | Sword: Lake Knight's Flurry; Spear: Seized Javelin; Guns: Point Blank |
| Medusa (4) | Chain Whip | Nail Pin | Serpent Dive |
| EMIYA (4) | Kanshou Throw | Crossing Throw | Triple-Linked Crane Wing |
| Medea (3) | Bolt Lattice | - | Aerial Barrage |
| Kojirou (3) | Draw Feint | Wind Cut | Swallow's Shadow (two angles; NP stays three) |
| Hassan (5) | Dirk Toss | - | Shadow Pounce (from behind) |

| Master (chain) | Opener | Mid | Finisher |
|---|---|---|---|
| Kiritsugu (4) | Contender Snap | - | Kick back, Calico burst |
| Kirei (3) | Bajiquan Elbow (guard-break) | Iron Mountain | Leap back, fan of Black Keys |
| Shirou (3) | Traced Throw | - | Overedge (grows with Trace) |
| Kuzuki (4) | Snake Bite (pierces guard) | - | Coiling Serpent |
| Caren (3) | Binding Turn | - | Magdalene Sweep (pull; own cooldown) |
| Ryuunosuke (3) | Low Slash (bleed) | - | Slip Behind |
| Rin (2) | Gem Detonation (bigger on a Gandr-cursed foe) | - | Jewel Barrage |
| Tokiomi (2) | Rising Inferno (burning ground) | - | Crimson Lance |
| Kayneth (2) | Mercury Whip | - | Mercury spike ring |
| Waver (2) | Overcharge | - | Tactical Retreat (smoke) |
| Irisviel (2) | Swan Lance (pierces two) | - | Wire Nest |
| Illya (2) | Valkyrie Dive | - | Flock |
| Kariya (2) | Feeding Swarm (drain) | - | Crest Worm Burst (costs HP) |
| Sakura (2) | Shadow Grasp (own cooldown) | - | Imaginary Tide |

Balance: openers faster and weaker than a plain heavy; finishers stronger but need the full chain and show a wind-up; summons, holds and pulls short and on their own cooldowns. Build finishers first, then openers, then mids. Animate in batches of four or five (`fighterXform`, `89f-abilities`, `fxLab` screenshots).
