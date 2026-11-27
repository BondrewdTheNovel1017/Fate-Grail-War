# Events and story modes: plan (Nov 26, owner's ideas, not started)

## 1. Fix: Berserker Unchained without a Berserker
**Today:** `startBerserk` takes Heracles or Lancelot; if neither is in the war it falls back to the servant whose master is weakest (that is how Diarmuid "went berserk").

**Plan:** keep Berserker Unchained for Berserkers only. With no Berserker alive, play a different event instead:

**The Grail's Taint** (night). The Grail's mud reaches out early and swallows one servant, who comes back as an **Alter** for about 90 seconds:
- **Look:** the sprite darkens, with red lines and a black-red aura (a colour filter on the existing sprite, like Lancelot's dark weapons).
- **Strength:** more damage and no pain flinch, like a rampaging Berserker.
- **Who it attacks:** the nearest servant, its own master excepted. Its master can spend a seal to pull it back.
- **Who it picks:** whichever servant took the most damage this war; the mud finds the wounded.
- **Lore consequence:** it **confirms a black Grail** for this war (the same flag the Shadow sets), and the banner says so: "The Grail is corrupted. Whoever wins will inherit it."
- **Reward:** the team that deals the most damage to the Alter earns **Unshaken**, like Berserker Unchained.

The Alter look is built once and reused by the Heaven's Feel route (Saber Alter).

## 2. New event: The Fuyuki Fire (final night, after the Fourth War's ending)
A rare final-night variant whenever the Grail descends at the **Civic Hall**. In a Fourth War story it always happens.
- **The building falls:** the Civic Hall breaks apart in stages (cracks, then broken walls, then rubble), using the destructible-prop system from the map plan.
- **The mud spreads:** black mud pours from the Grail and flows outward through the streets, around buildings and walls.
  - **How it moves:** a coarse grid (about 40-unit cells) over the district. The mud grows from its edge into neighbouring open cells, never into buildings, so it naturally pours around blocks and down streets. Only the edge is updated each tick, so it's cheap.
  - **Online:** the host sends only a seed and the growth count, and guests grow the same mud.
  - **Fire:** flames follow behind the mud's edge. Cells the mud has held for a while catch fire, so the area behind it burns.
- **Effects:** mud drains and maddens (like today's corrupted pools); fire burns. Both cut the map down toward the Grail, forcing a final fight. Civilians flee; the Church raises its heat for everyone.
- **Look:** tar-black mud with a red sheen and slow ripples, embers drifting off the fire, smoke over the district, the Civic Hall collapsing in stages.
- **Endings:** if a pure-hearted team wins at a black Grail, a closing line tells the Fourth War's tragedy. If the mud covers the Grail's heart before anyone claims it, the war ends in the fire with no winner.

## 3. War setting: event sets (separate from the team drafts)
A new setup row, **Events**:
- **Random** (today): the night and day decks, shuffled.
- **Fourth War events:** only events from Fate/Zero, in random order (Challenge at the docks, False Death, Bounty on Caster, Horror in the River, Demolition of the Hyatt, King's Banquet, Kirei's betrayal, the Fuyuki Fire).
- **Fifth War events:** only events from Fate/stay night (Sealed School, Overseer's Summons, the Shadow, the Great Cavern, the Grail's Taint...).
- **Story:** Fate/Zero, or Fate/stay night (Fate, Unlimited Blade Works or Heaven's Feel), as in section 4.

Combined with the drafts: "Fourth War teams + Fourth War events" plays as a loose Fate/Zero sandbox; "Story: Fate/Zero" adds the ordered beats.

## 4. Story modes: what is practical
### The problem
A story wants things to happen in order (the docks fight on night one, Lancer dies by the Self Geas Scroll...). Players want to win, and in multiplayer any of them can break the schedule. Forcing outcomes (invincible characters, teleporting AI) would feel bad and break the game.

### The approach: a beat director, canon off-screen, free on-screen
- **Beats:** each story is a list of beats, each with:
  - **When:** a phase and a time window.
  - **Cast:** the characters it needs.
  - **Place:** where it happens.
  - **Setup:** AI goals, like "go to the docks" or "engage Saber".
  - **Outcome:** what canon says happens, such as a true name revealed, a death or a contract.
  - **Fallbacks:** what to do if the cast is dead or a player intervenes.
- **The rule that makes it work:** **off-screen, canon happens; on-screen, the fight is real.**
  - If no human is near a beat (and none of its cast is a human), it plays out by script: the AI goes there and a short headline reports the canon outcome. For example, "Elsewhere in Fuyuki: Lancer falls to his own spear."
  - If a human is near, or is part of the cast, the beat plays live. The AI pursues its story goal, but nothing is rigged, and if the human changes the outcome the story **diverges**.
- **Soft plot armor, never invulnerability:** before their beat, AI avoids killing scheduled cast (the same targeting penalty used for sparing family) and saves seals to rescue them. A player can still kill anyone.
- **Divergence:** every beat has fallbacks: a substitute host (as events do now), a skipped beat, or an alternate beat. For example, if Lancer dies early, Kayneth's arc ends and the Hyatt beat moves to another master. A **Canon meter** shows how far the war has strayed, and the ending card names the result ("A Fourth War Unlike Any Other", "As It Was Written").
- **Players:** the human's team gets its canon beats as **optional objectives** (objective arrow and banner), with a reward for taking part (a perk or seal, like events). Declining doesn't break anything: the beat resolves off-screen or falls back.
- **AI:** story goals sit on top of the normal AI (the overhaul's "always fight back" still applies). After a beat ends, the AI returns to normal war behaviour until its next one.
- **Multiplayer:** the director runs on the host as engine state (`G.story`), and beats reach guests as FX events with banners, like events today. Each human seat may be a canon character, so every player has their own beats.
- **Length:** each story sets its own nights, days and phase lengths. Fate/Zero is about seven nights, roughly 50 minutes, with a short four-night version that merges beats.

### Effort
- **Beat director plus Fate/Zero:** about two to three sessions. The whole Fate/Zero cast is already in the roster, and half its beats are events that already exist.
- **Each Fate/stay night route:** two to three sessions, plus the characters it needs first (below).

## 5. Fate/Zero (the Fourth War)
**Teams (all in the roster):**

| Class | Servant | Master |
|---|---|---|
| Saber | King Arthur | Kiritsugu, with Irisviel as a second master |
| Lancer | Diarmuid | Kayneth |
| Rider | Iskandar | Waver |
| Archer | Gilgamesh | Tokiomi |
| Assassin | Hassan | Kirei |
| Berserker | Lancelot | Kariya |
| Caster | Gilles | Ryuunosuke |

**Beats** (the canon order, compressed; **existing** means the event is already in the game):
1. **Prologue, Night 1: Assassin "dies" at the Tohsaka Mansion.** Gilgamesh destroys an Assassin in plain sight; the Assassin team is unknown until dawn. *Existing: False Death.*
2. **Night 1: Battle at the Docks.** Diarmuid challenges King Arthur at the warehouses. Her left hand is wounded by Gáe Buidhe (a lasting debuff until Lancer falls). Iskandar crashes in and announces his name and wish. Gilgamesh appears on a lamp post, and Lancelot attacks Gilgamesh, then Saber. *Existing Challenge at the docks, plus scripted entrances.*
3. **Day 2: The Hyatt.** Kiritsugu demolishes Kayneth's hotel floor. *Existing: Demolition (it already targets Kayneth first).*
4. **Night 2: The Einzbern Forest.** Caster's horrors attack the forest, and Kayneth invades the castle to duel Kiritsugu (Volumen Hydrargyrum against Origin Rounds, a master duel beat). Iskandar and Waver may cross paths with Saber's team.
5. **Night 2: Bounty on Caster.** The Church offers a Command Seal for Caster. *Existing: Church Bounty.*
6. **Day 3: The King's Banquet.** Iskandar, Gilgamesh and King Arthur, with Assassin's swarm interrupting and Ionioi Hetairoi answering. *Existing: Banquet, with the three-king script.*
7. **Night 3: The Horror in the River.** Gilles' leviathan; every servant joins a truce to kill it; Lancer can break Gáe Buidhe to free Saber's hand; Lancelot harasses from the air. *Existing: Horror, with these additions.*
8. **Day 4: Irisviel is taken.** If Irisviel is AI, she is captured and held (a rescue objective for Saber's team).
9. **Night 4: The Self Geas Scroll.** Kiritsugu offers Kayneth a truce under a binding contract, then has Maiya's rifle settle it; Kayneth forces Lancer's suicide with a seal. *Uses the pact system, with a scripted betrayal.*
10. **Night 5: Kirei's betrayal.** Kirei kills Tokiomi, and Gilgamesh contracts with Kirei. *Existing: `gilBetrayTick`.*
11. **Night 5: Rider's last charge.** Iskandar and Waver ride against Gilgamesh on Fuyuki Bridge. Ionioi Hetairoi against Enuma Elish; Waver is spared.
12. **Night 6: The Knight of the Lake.** Lancelot reveals himself to King Arthur in the parking garage beneath the Civic Hall.
13. **Final: Kiritsugu and Kirei.** The two meet inside the Civic Hall; Origin against the black keys.
14. **Final: The Fuyuki Fire.** The Grail is black. If Kiritsugu holds it, he orders it destroyed; the mud spills and the city burns (section 2).

## 6. Fate/stay night (the Fifth War)
**Shared opening:**
1. **Night 1: The witness.** Shirou sees Lancer and Archer fight at the school; Lancer chases him down. Rin saves him with her pendant, Lancer comes again, and Shirou summons Saber in the shed.
2. **Night 1: The Church.** Kirei explains the war (the Overseer's Summons).
3. **Night 1: Berserker on the hill.** Illya and Heracles ambush the new team on the way home.

**Teams:**

| Class | Servant | Master |
|---|---|---|
| Saber | King Arthur | Shirou |
| Archer | EMIYA | Rin |
| Lancer | Cú Chulainn | Kirei (Bazett before him) |
| Rider | Medusa | Shinji (Sakura's command) |
| Caster | Medea | Kuzuki |
| Assassin | Kojirou | Medea |
| Berserker | Heracles | Illya |
| Hidden | Gilgamesh | Kirei |

**Missing from the roster:** Shinji (planned), Bazett (prologue only, planned), Zouken (new), True Assassin (a Hassan variant), Saber Alter and Dark Sakura (built on the Alter look).

### Fate route
1. **Rider's Blood Fort at the school.** *Existing: Sealed School.*
2. **The temple gate:** King Arthur against Kojirou on Ryuudou's steps.
3. **Caster's ambush:** Shirou captured at the temple; Saber's rescue.
4. **The Einzbern Forest:** Berserker dies seven times to Saber and Archer's stand.
5. **A day in Shinto:** Shirou and Saber's day out (a day objective, downtime talk).
6. **Gilgamesh reveals himself:** he kills Caster's team.
7. **Final: Ryuudou Temple.** Excalibur against Enuma Elish over a black Grail; Avalon's protection.

### Unlimited Blade Works route
1. **Archer's betrayal:** EMIYA leaves Rin for Caster (a forced pact switch).
2. **Caster takes Saber:** Rule Breaker steals the contract. *Existing: Rule Breaker.*
3. **Gilgamesh and Illya at the Einzbern Castle:** the King kills Heracles with Enkidu's chains and claims the lesser Grail.
4. **Shirou against Archer:** a duel at the Einzbern Castle, inside Unlimited Blade Works.
5. **Lancer's last order:** Kirei forces him to fight; he turns, saves Rin, and burns the church.
6. **Final:** Shirou against Gilgamesh in Unlimited Blade Works on the temple grounds, while Rin pulls Shinji from the Grail's flesh.

### Heaven's Feel route
1. **The Shadow rises.** *Existing: the Shadow event (night 2 and later).*
2. **True Assassin (Zouken's)** kills Kojirou and Caster.
3. **Saber falls to the Shadow** and returns as **Saber Alter** (the Alter look).
4. **Berserker against Saber Alter**, then Heracles is consumed.
5. **Shirou takes Archer's arm** (a temporary Projection boost with a cost).
6. **Rider allies with Shirou** (a story pact).
7. **Final: the Great Cavern.** Saber Alter against Shirou and Rider; Rin against Sakura; Kirei against Zouken. *Existing: the Great Cavern (always corrupted).*

## 7. Suggested order
1. **Quick fix:** Berserker Unchained for Berserkers only, plus The Grail's Taint (Alter look, black Grail) — one session or less.
2. **The Events setting:** Random, Fourth War events, Fifth War events — small.
3. **The Fuyuki Fire** — needs destructible props from the map plan; a session on its own.
4. **Beat director plus Fate/Zero story.**
5. **Fate/stay night, one route at a time:** Fate first (it needs the fewest new characters), then Unlimited Blade Works (needs Bazett and Shinji), then Heaven's Feel (needs Zouken, True Assassin, Saber Alter, Dark Sakura).
