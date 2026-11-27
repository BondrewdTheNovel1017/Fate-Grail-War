# Third event batch, the False Death rework, the War Board, after-death play, Rho Aias's look (planned Nov 26)

Mirrors the Claude Doc "Fate Grail War Roadmap". Not built yet.

## New events: story moments for every war

Each event is a lore moment from the story beats (`docs/roadmap.md` F and G), built once and used twice: in story mode it plays as that night's scripted beat with its canon cast; in a normal war it is dealt from the deck like today's events (lore host via `loreHost`, else a stand-in by rule; reward, place and timing tuned for random play). Size: S about a quarter session, M about half, L a full session.

| Event | Story moment | When (war) | Lore host, else stand-in | Where | What happens | Reward | Set | Size |
|---|---|---|---|---|---|---|---|---|
| A Witness at Homurahara | Shirou sees Lancer and Archer (F/SN Night 1) | Night 1 | The first two teams to clash | Where that fight happens (schoolyard in story) | A late student sees it and runs for the Church. The two teams can catch him and wipe his memory (hold 3 s); a third team can escort him. If he reaches the Church, both teams are revealed. Killing him counts as any civilian. | Escort: intel on both teams | fifth | M |
| The Greeting in Winter | Illya and Heracles on the hill (F/SN Night 1) | Night 1-2 | Illya's team, else the strongest servant (Berserker first) | A crossroad between the two nearest teams | The host attacks both teams at once; those two are in truce until it is driven off (set damage) or one falls. | Most damage: a seal and the host's true name; host: a seal per servant downed | fifth | M |
| The Gate of Ryuudou | Kojirou at the gate (Fate Night 3, UBW final) | Night | Kojirou, else an Assassin or Saber | Temple stairs, else the host's door | Host bound to the gate: stronger, armored, cannot leave. A shrine beyond: reach it for a seal. Gate holds till dawn: the host takes it. | Command Seal | fifth | S |
| The Sleeping City | Caster drains Shinto (UBW Day 2, Fate Day 6) | Night | Medea, else a Caster, else the highest field | Host's home; clues in Shinto | Host's field +1 and faster mana for the night; comas reported at dawn. Three prana wisps lead to the host; next day Trace the Drain (ley-line task) reveals and cuts it. | Severed Line: mana refilled, host's field -1 | fifth | M |
| The Hostage | Taiga at the temple (UBW Day 6); Sakura taken (Fate Day 6) | Day | Medea and Kuzuki, else a Caster, else the highest field (not the same day as The Sleeping City) | Host's home | The host holds someone a rival knows (a teacher for a student master, else a neighbour) and demands a seal by dusk. Pay, or break in and walk them out. Harm to the hostage brings the Church down on the host. | Rescue: a seal from the host's pool; paid: the host takes it | fifth | M |
| The King Returns | Gilgamesh left from the Fourth War (F/SN) | Night 3+ | Gilgamesh when not drafted (answers to Kirei if alive), else a servant not in this war | Appears at the Church, then hunts | A servant outside this war hunts the strongest servant. | Downing it: a seal and its true name | fifth | L |
| A Contract Offered | Lancer offers Rin his spear (UBW Day 7); Saber to Rin (UBW Night 7); Gilgamesh to Kirei (Zero) | Any phase, when a master dies before the final night | none | Where the master fell | The servant lingers 90 s, masterless and fading. A master whose servant is dead can contract it (hold 3 s, costs a seal). Unclaimed, it fades. | A team back in the war | both | M |
| The Hundred Faces | Assassin swarm at the Banquet (Zero); True Assassin's hunt (HF Nights 2-3) | Night | Hassan, else an Assassin, else masked shades | The city | Masks hunt masters far from their servant and strike gatherings of servants. Masters beside their servant are safe; the host's team is never hunted. | Most masks downed: Night Eyes (concealed Assassins felt within 400 until dawn) | both | S |
| Bluebeard's Siege | Caster's horde at the Einzbern forest; Lancer beside Saber (Zero) | Night | Gilles, else a Caster, else a stand-in horde | The Einzbern home, else the strongest home | Familiar waves storm the home's field until midnight. Any servant fighting the horde there is in truce with the defenders while it lasts. | Defenders: The Workshop Holds; helpers: momentum | fourth | S |
| The Overseer Falls | Kirei kills Risei (Zero) | Night 3+ | Kirei's team (never revealed), else none | The Church | No sanctions, bounties or Executors this phase; no sanctuary. Spare seals on the altar: first team to hold it 8 s uncontested takes one. | Command Seal | fourth | S |
| The Last Charge | Iskandar's charge on the bridge; Waver spared (Zero) | Night 3+, three teams or fewer | Iskandar with Waver alive, else the most wounded servant whose master lives | Fuyuki Bridge | The host charges the strongest servant: hyper armor, harder blows. Its master cannot be harmed meanwhile and lives on if the servant falls. | Finishing blow: a seal | fourth | M |
| The Vessel Taken | Irisviel abducted (Zero); Illya takes Shirou (Fate Day 5); Illya taken (HF Night 5) | Night 2+ | The Einzbern vessel (Irisviel or Illya), else a homunculus vessel at the castle | The castle, then the taker's home | A team carries the vessel home (slowly); rivals can take it back. Whoever holds it when the Grail descends picks the Grail site nearest their home. | The Grail at your door | both | L |
| A Day in Shinto | Shirou and Saber's date (Fate Day 6) | Day | Shirou and King Arthur, else any team that takes it | The bridge, the arcade, the river park | A master and servant walk three places together, out of any fight. | Kindred Hearts: servant heals slowly beside its master until dusk; momentum +10% until dawn | fifth | S |

**Build order:** S first (The Overseer Falls, The Hundred Faces, Bluebeard's Siege, The Gate of Ryuudou, A Day in Shinto), then M (A Witness at Homurahara, The Greeting in Winter, The Sleeping City, The Hostage, A Contract Offered, The Last Charge), then L (The King Returns, The Vessel Taken). With vehicles later: The Sky over Fuyuki (Vimana against Lancelot's jet) and the motorbike chase.

**Event sets:** the Set column says which of `EVSETS.fourth` / `EVSETS.fifth` each joins; Random deals all. A story night is these events in canon order.

## The False Death rework and the War Board

**Why it fails today** (`startFalseDeath` in 61-events, banner in 87-events): it is its own event card, so it takes `G.event` and the HUD names it; the banner ends "Or so it seems"; it ends at dawn, so players wait it out.

**The fix:**
1. **No global death banners.** A death you see is known at once; every other death reaches you as a Church notice after 20-60 s, or as a rumor. Real and false deaths use the same notice, word for word.
2. **The False Death leaves the deck.** It rides on another event or a fight: when the host's servant takes a heavy blow in front of another team, it "dies" there (the real dissolve), and the notice goes out. It never takes `G.event` or the HUD line. Only its own team sees "Believed dead".
3. **Longer, and played straight.** It holds until the servant is seen striking someone (that team knows at once; a rumor reaches the rest a minute later), or until the next dusk at most. The servant is concealed and unfelt; the master may take Church sanctuary, as Kirei did. AI teams read the board, so they are fooled too.
4. **Lore ways to see through it:** read the death site (a battle-site task: no Saint Graph returned, only a mask); Caren's stigmata nearby; the Einzbern vessel (Irisviel's or Illya's team) knows how many servants the Grail still waits for; or see it alive.

Story mode keeps the scripted Night 1 version (Assassin at the Tohsaka mansion).

**The War Board (drop-down):**
- One button beside the menu button, and key I; closed by default; opens on the minimap side, closes on input elsewhere.
- A row per team: master and servant (class until the true name is known), each **Alive** or **Fallen** with the source: seen (how long ago), Church, rumor, ally (pact partner), felt (field, stigmata), unknown. Seen is solid; Church and rumor faded, because they can be wrong.
- Also per row: last known district and time, exposure, pact.
- Einzbern teams only: "The Grail waits for N more." Always true.
- Data: `G.board[team]` per viewing team, written by sightings, deaths seen, Church notices, rumors and pacts; the AI reads its own team's board. Online, each guest gets only its team's board (check `NET.dropped`). The end screen shows the truth.

## After death: spectating and Alter invasions

**Spectator mode (small):** when your team falls, choose watch, invade (when open) or leave. Follow any living fighter (Tab or tap) or a free camera; the minimap shows everyone; the War Board shows the truth. Online, the host picks in the lobby what spectators see: everything, or only what the team they follow sees (default, so a dead friend on voice chat cannot scout). Mostly UI; guests already receive the whole war.

**Alter invasions (larger):** the Grail's mud raises a fallen servant as an Alter (the Taint's `alterT` look), played by a dead player for a while.

| Rule | Proposal | Why |
|---|---|---|
| When it opens | From Night 2, once a servant has died; never in a phase's first minute | The mud needs the fallen |
| Who returns | Your own fallen servant, else any fallen servant | The Grail holds the defeated |
| How many | One invader at a time; 3-minute gap; each player at most twice a war | The war stays about the living |
| Strength | About 65% health, no master, seals or rescue; mud-fed mana, NP charges at half speed; scales down when two teams stand | Matters without deciding the war |
| Length | Up to 3 minutes or until it falls; dissolves at dawn | An invasion, not a second life |
| Target | Invader picks a team; the leading team is marked and pays more | Pulls the war together |
| Who sees it | Felt by everyone (a black stain on the map) | Fair warning |
| What it can win | Nothing: never takes the Grail, ignored by win checks (like `trueTeam`); score for damage and kills on the end screen | The result stays with the living |
| Rewards for the living | Downing it: momentum and the perk Purified (mud damage halved until dawn) | Worth fighting |
| Final night | Only with a corrupted Grail, from the mud pools, before the circle closes | Matches the black Grail |
| Offline | The player can invade after dying; the AI can too, as the Taint does now | Same feature solo |

**Balance:** `npm run sim` with forced invasions (an invader should decide the winner in at most about 1 war in 10), then online tests. War values only.

**Online:** new fighters mid-war need replication (guests build `G.f` once in `netBuild`); the dead guest's seat takes the invader; check `-s` room space.

## Rho Aias, the new look (built Nov 26: the flower is the back layer, opening back to front, breaking front first)

Purple-pink layered shields: the front layer a five-lobed flower, the layers behind it round. EMIYA 7 layers (flower + 6), Shirou 4 (flower + 3), matching today's petal counts.

- Upright shield seen from above: each layer is an ellipse squashed along the facing (depth about a quarter of its width), about 110 wide, across the line of fire.
- Not jutting far: front layer about 26 out, each layer behind about 3 closer, about 20 deep in all.
- Flower: a scalloped five-lobed edge on the front ellipse; rounds behind are plain rims, each fainter.
- Colours: violet core (about #b45ce0) to pink rim (about #ff9ad8), additive glow, white edge on the front layer.
- Opens front to back in 0.15 s. Struck: the front layer cracks white, shatters into violet shards (`SND.rhoCrack`), the next slides forward. The flower breaks first.
- Health-bar counter: one flower pip and round pips, same colours.
- Only `src/ui/89e-rho.js` changes (`drawRho`); the petal rules stay.
