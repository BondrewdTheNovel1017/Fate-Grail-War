# Truces and event zones, the event visual pass, base upgrades (planned Nov 26, from playtests)

Mirrors the Claude Doc "Fate Grail War Roadmap".

## What went wrong in playtests
- **Horror in the River:** an AI attacked during the truce; the player fought back and the Church punished the player. Cause: `truceStops` (61-events) quietly stops an AI's blow (`G.ai[att.idx]` returns true) but the AI still targets and swings; a human's blow breaks the oath at once (`G.oath`, exposure 60, Church heat, reveal). Defending yourself is what gets punished.
- **King's Banquet:** the table is a sanctuary (`inTruce` banquet rule) but the road, castle grounds and hall are not; fights broke out outside and inside the castle and no one reached the table.

## Quick fix (Phase 1, small, first thing next session)
1. The AI never targets or swings at anyone it is in truce with: truce partners leave `enemiesOf` while both stand in the zone (like `pactParley`).
2. Self-defence never breaks an oath: a blow at someone who struck or swung at you or your partner in the last 5 s is free; the starter is the oath-breaker.
3. A warning first: a human's first blow in a truce is stopped with "You stand under a truce. Strike again to break it."; only a second blow within 4 s breaks the oath.
4. Truce zones drawn on the ground (pale ring) and a TRUCE chip on the HUD while inside.
5. Tests for each rule; sim counters for truce blows stopped and oaths broken by AI (target 0).

## Event zones, with the AI overhaul (Phase 2)
- Each truce event zone has a heart (the table, the river's edge), an approach (the road in) and an edge. The approach protects anyone heading in who has not struck anyone in the last 30 s.
- Banquet approach: castle grounds, hall and grand stair; the Einzbern field does not bolt banquet guests while it runs.
- One goal per AI team at a time from a priority table (survive, attended event, defend home, day task, hunt); on the way to a truce event an AI only defends itself; teams not attending stay away.
- One set of rules of engagement (truce, pact, parley, sanctuary, Church) read by both the AI and the oath checks.
- Sim reports truce blows stopped, oaths broken, fights started inside event zones; a scripted test for each team-up event (Horror, School, Banquet, Summons, The Greeting in Winter, Bluebeard's Siege).

## Event visual pass (start of Phase 2b, before new events)
| Event | Today | The pass |
|---|---|---|
| Horror in the River | A blob circle | A dark ridged mass in the water, many writhing tentacles with suckers reaching out, ripples, mist, eyes along the body. Slam: a tentacle rises over the marked spot (growing shadow), crashes with a splash and cracks. Hurt: flinch, tentacle recoils. Death: sinks, bleeding black ichor. |
| Challenge | Marker at the docks | Lanterns and a ring of light; the challenger's crest on the ground |
| Church Bounty | Notice | A sealed parchment over the target's last known place |
| False Death | Banner | (Reworked) a real death's dissolve; a cracked mask left behind |
| Berserker Unchained / Taint | Aura | Check against the Alter look; red rage trails |
| Sealed School | Dome done | Check the inside: red mist, circles |
| King's Banquet | Courtyard done | Seats; the approach marked by torches |
| Overseer's Summons | Circle | Candles and the lectern |
| Demolition | Charges | Blinking charges, countdown ring, blast and smoke |
| The Shadow, Festival, Grail, Great Cavern | Check | Screenshot audit; bring each up to the fighters' level |

## Base upgrades (replace the ley-line task, Phase 1)
- Carrying the three ward stones out (as now) completes a fortification: the field rises one level (to its max) and gives one upgrade pick, chosen at your summoning circle. Two ranks each.
- Mage family starts with one pick; a Caster's temple gets one extra pick and +1 max level. A blown-up home loses its upgrades.

| Upgrade | Rank 1 | Rank 2 | Lore |
|---|---|---|---|
| Thunder Wards | Bolts from field level 2 (today 3) | Twice as often and harder | Kayneth's field |
| Healing Spring | Home healing x1.5 | x2, servant wounds close faster at home | A spring on the ley line |
| Alarm Wards | Intruders named (class) and marked on your map on entry | Reaches your whole district | Every magus's first ward |
| Binding Mire | Intruders slowed more | No dodging inside the field | Caster's temple |
| Mana Well | Master's mana refills faster at home | Seal-forced NP charges 20% faster at home | Tohsaka gems |
| Veil | Scouts and familiars cannot see your home | Hidden on rivals' maps until they enter | Einzbern illusions |
| Bulwark | Demolition charges take 50% longer; doors hold a moment more | Executors and sieges take longer to break in | Fortified workshop |

- AI picks by character (Kayneth Thunder, Kiritsugu Alarm, Caster's team Mire, Irisviel Veil...). Balance with `npm run sim`; ranks are war values.
- Day tasks become fortify, battle sites and school; `LEYP` and the ley-line walk go. The Sleeping City keeps its wisps inside that event.
