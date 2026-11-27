# Third event batch, the False Death rework, the War Board, after-death play, Rho Aias's look (planned Nov 26)

Mirrors the Claude Doc "Fate Grail War Roadmap". Not built yet.

## New events for the war's pool

Each comes from a story beat but needs no particular character: a lore host runs it when alive (`loreHost`), otherwise a stand-in by rule. Story mode plays the same events as scripted beats (The Witness is F/SN's Night 1; The Stray Servant is Lancer going to Kirei; The Eighth Servant is the King left over from the Fourth War). Size: S about a quarter session, M about half, L a full session.

| Event | When | Host (lore, else) | What happens | Reward | Story source | Set | Size |
|---|---|---|---|---|---|---|---|
| The Grail Stirs | Night 2+ | none | One of three ley points (the temple, the Church hill, the Tohsaka hill) pulses for 90 s. Standing in it charges NP momentum twice as fast, but shows you on every map. | Momentum | Fuyuki's ley lines | both | S |
| The Church Goes Dark | Night 3+ | Kirei's team, else none | The overseer is found dead. No sanctions, bounties or Executors this phase; the Church is no sanctuary. His spare seals lie on the altar: the first team to hold it 8 s uncontested takes one. | Command Seal | Risei's death (Zero) | fourth | S |
| Common Enemy | Day | the Church | The overseer names the strongest team a threat. The two weakest get a standing pact offer and a bounty on it until dusk. | Seal on a kill | Rin and Shirou's truce; Zero's bounty on Caster | fifth | S |
| The Gatekeeper | Night | Kojirou, else a Saber or Assassin, else any servant | The host servant is bound to a gate (its own door or the temple stairs): stronger and armored there, but cannot leave the circle. Past it lies a shrine. Reach the shrine: a seal. Gate holds till dawn: the host gets a seal. | Command Seal | Kojirou at Ryuudou | fifth | S |
| Knives in the Dark | Night | Hassan, else a stand-in phantom | Masked shades (mobs) hunt masters standing far from their servant. Masters beside their servant are safe; the host's team is never hunted. | Most masks downed: Night Eyes (a concealed Assassin is felt within 400 until dawn) | The Hassan swarm (Zero); True Assassin (HF) | both | S |
| Night of the Siege | Night | Gilles, else most familiars, else a stand-in horde | Waves of familiars storm one home's field until midnight. Rivals may strike the defenders while they are busy. | Defenders who hold: The Workshop Holds | Caster's siege of the Einzbern forest | fourth | S |
| The Stray Servant | Any phase, when a master dies before the final night | none | The servant lingers 90 s, masterless and fading. A master whose servant is dead can reach it and contract it (hold 3 s, costs a seal). Unclaimed, it fades. | A team back in the war | Lancer to Kirei; Saber to Rin; Gilgamesh to Kirei | both | M |
| The Drained City | Night | Medea, else a Caster, else the highest field | The host's field drinks from the town: field +1 and faster mana regen for the night; comas are reported at dawn. Three wisps of stolen prana lead home along the roads; next day, Trace the Drain (a ley-line task) reveals the host and cuts it. | Severed Line: mana refilled, the host's field -1 | Caster's soul draining (UBW, Fate) | fifth | M |
| The Witness | Night 1-2 | none | A late walker sees the first fight of the night and runs for the Church. Seen teams can catch him and wipe his memory (hold 3 s). A rival can escort him; if he reaches the Church, the seen teams are revealed to all. Killing him counts as any civilian. | Escort: intel on the seen teams | Shirou sees Lancer and Archer | fifth | M (after map Phase 2) |
| A Crowded Day | Day | none | A town holiday: civilians everywhere, every fight witnessed twice over, every day task pays double. | Double task rewards | Daily life in both wars | both | S |
| The Abduction | Night 2+ | Iskandar or Illya, else an AI team near its home | Sometimes an AI downs a master and carries them off instead of killing. The captive is bound at the captor's home; their servant has until dawn to rescue them. At dawn the captor takes a seal and lets them go. | Rescue: the captor revealed and its true name | Irisviel taken; Illya takes Shirou; Sakura taken to the temple | both | L |
| The Eighth Servant | Night 3+ | Kirei's team (it answers to him), else none | A servant not in this war walks Fuyuki without a master, hunting the strongest servant. With Kirei alive, it joins his team for the night. | Downing it: a seal and its true name | Gilgamesh left from the Fourth War | fifth | L |

**Build order:** The Grail Stirs, The Church Goes Dark, Common Enemy, The Gatekeeper, Knives in the Dark, Night of the Siege, A Crowded Day (all S); then The Stray Servant and The Drained City; then The Witness (after Phase 2); then The Abduction and The Eighth Servant. Later, with vehicles: Pursuit on the Bridge (a chase).

**Event sets:** the Set column says which of `EVSETS.fourth` / `EVSETS.fifth` each joins; Random deals all.

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

## Rho Aias, the new look

Purple-pink layered shields: the front layer a five-lobed flower, the layers behind it round. EMIYA 7 layers (flower + 6), Shirou 4 (flower + 3), matching today's petal counts.

- Upright shield seen from above: each layer is an ellipse squashed along the facing (depth about a quarter of its width), about 110 wide, across the line of fire.
- Not jutting far: front layer about 26 out, each layer behind about 3 closer, about 20 deep in all.
- Flower: a scalloped five-lobed edge on the front ellipse; rounds behind are plain rims, each fainter.
- Colours: violet core (about #b45ce0) to pink rim (about #ff9ad8), additive glow, white edge on the front layer.
- Opens front to back in 0.15 s. Struck: the front layer cracks white, shatters into violet shards (`SND.rhoCrack`), the next slides forward. The flower breaks first.
- Health-bar counter: one flower pip and round pips, same colours.
- Only `src/ui/89e-rho.js` changes (`drawRho`); the petal rules stay.
