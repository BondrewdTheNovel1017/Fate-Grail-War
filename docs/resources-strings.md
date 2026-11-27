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
- Proposed per-character strings: see the list discussed Nov 26 (to be added once approved).
