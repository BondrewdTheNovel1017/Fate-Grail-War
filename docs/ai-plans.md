# AI team plans, home invasions, spirit form balance (planned Nov 26)

Mirrors the Claude Doc "Fate Grail War Roadmap".

## Team plans (Phase 2, the AI overhaul)
- One plan per AI team at a time, with roles for master and servant: hunt, invade a home, ambush, lure, defend, rest, attend an event, scout.
- Stages: scout, approach, act, withdraw; abort on servant below half health, an alarm, a third team arriving.
- Scored from the team's own War Board (no cheating), its strength and its master's character (Kiritsugu invades while the defender's servant is away; Iskandar charges openly; Kayneth holds his workshop; Kirei ambushes).
- First plays: the lure (servant draws the defender out, master or Assassin slips in), the feigned retreat (toward a partner in spirit form), watching the door (strike the master left alone), the bait (master in the open, servant unseen nearby).
- Visible intent: a short line when a plan starts; a slow crouched walk while sneaking; the servant posted at a door; a familiar circling a house before an invasion (shooting it down is the warning).
- Reasons to invade: saw a wounded team go home; knows the master is alone; canon rival; sabotage before the final night; many seals inside. Weighed against field, upgrades, traps and daylight risk. Assassins in concealment, Outsiders and Kiritsugu's mundane tools get in without the alarm.
- Fair sabotage: your field always warns you; sabotage leaves signs; every kind is limited and repairable (ward stones: field -1; fouled Healing Spring until you fortify again; traps per the trap rules; charges are the Demolition); the summoning circle can never be trapped; `HOME_WARD` stays.
- Checks: sim reports plans started and finished, invasions, lures that worked; `tools/aicheck.js` scenarios for invading an empty home and defending against a lure.

## Spirit form (Phase 1)
Today (60-combat): enter in 1.5 s (`spT`, a hit materializes), then untouchable, 1.3x speed, no upkeep, heals 5/s in war (`spirit === 2`). Changes:
1. No entering within 6 s of dealing or taking damage.
2. Healing starts after 5 quiet seconds, drains the master's mana, stops at 60%; full healing at home.
3. A servant in spirit form within about 300 of an enemy servant shows as a faint shimmer (Assassin concealment excepted).
4. Materializing 1 s with a shimmer; no re-entering for 15 s.
5. The master stays unguarded meanwhile.
War values, checked with `npm run sim`.
