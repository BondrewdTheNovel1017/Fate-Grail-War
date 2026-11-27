# Roadmap: everything planned, in the recommended order (Nov 26)

Detailed plans: `docs/saturday.md` (next session), `docs/map-overhaul.md` (map, vehicles, props, residences, master passives), `docs/story-modes.md` (events and story modes), `docs/future-masters.md` (new masters), `docs/todo.md` (the full queue). Session counts are rough.

The order follows three rules:
1. **Cheap fixes that every war feels go first.**
2. **Foundations before what is built on them:** balance plumbing before tuning, the map before the AI that uses alleys, destructible props before the Fuyuki Fire, the beat director and cutscenes before any story.
3. **Characters before the stories that need them.**

## Phase 0: quick wins (under one session)
1. **Grail circle (owner):**
   - **Today:** the Grail appears 60 s after midnight with a 4,200-unit circle that takes 330 s to shrink to 750.
   - **Change:** it appears **at midnight** and begins closing about 15 s later. Start at about **2,000** across and close to about **550** over about **180 s**. Check that the war still ends in a sensible time (`npm run sim`).
2. **Berserker Unchained for Berserkers only; The Grail's Taint otherwise.** A servant turns Alter for a while and confirms a black Grail; this builds the Alter look reused later.
3. **The Events setting:** Random, Fourth War events, Fifth War events (the story option comes in phase 4).

## Phase 1: balance and combat (Saturday, about two sessions)
1. **Plumbing:** give every tunable number a war value and an Arena value (NP charge and damage, NP momentum, perks, guns).
2. **Tune, war first, then the Arena:** each servant's NP (Gilgamesh first), King Arthur, Caren's Sacrament, Ryuunosuke, the five perks, Lancelot's guns, war pacing with the Banquet. Tools and baselines are listed in `docs/saturday.md`.
3. **Reality marbles:** no NP charging inside your own marble; a buff for its duration instead.
4. **Master type passives:** Fledgling Growth and Mage killer now. The Church sanctuary waits for phase 2, since it needs the Church as a shared home.
5. **Sealed School content:** reasons to go there, waves, breaking the seal from inside, a payoff.

## Phase 2: the new Fuyuki and the AI (about four to five sessions)
1. **Map step 1:** build the approved outline, districts, roads and base sites (draft 2): every point of interest, three estates, five safehouses, the Uryuu storehouse, Kuzuki at the temple, the Church shared by Kirei and Caren as a sanctuary, Mount Enzou with the hidden cave trail.
2. **AI overhaul with map step 2:**
   - Dark alleys and line-of-sight witnesses.
   - The daylight rules: hide, fight only if attacked, use alleys and interiors.
   - Always fight back; no staring.
   - Protecting servants hold a spot near their master.
   - The two orders, **Stay with me** and **Act freely**.
3. **Map step 3:** non-square buildings, lots, fences, gardens, poles and wires, props; the docks with container yards and room to duel.
4. **Destructible props:** containers, crates, fences, lamp posts, vending machines (whole, dented, torn, wrecked).

## Phase 3: story foundations (about three sessions)
1. **Cutscene system** (section A below).
2. **Beat director** (section B, and `docs/story-modes.md` section 4).
3. **Special arenas for duels and scenes** (section C).
4. **Ending scenes** (section D).
5. **The Fuyuki Fire** (uses the destructible props).

## Phase 4: Fate/Zero story (about two sessions)
The whole cast is in the roster. Fourteen beats, about half of them existing events (section E).

## Phase 5: Fifth War characters, then Fate/stay night (about six to eight sessions)
1. **Characters first:** Shinji, Bazett, Zouken, True Assassin (a Hassan variant), Saber Alter (Alter look), Dark Sakura. Ayaka comes in the same batch of new masters.
2. **The routes, in this order:** Fate (fewest new characters), then Unlimited Blade Works, then Heaven's Feel (section F).

## Phase 6: vehicles (about three sessions)
Parked cars you can wreck, then traffic and sidewalks, then driving, with Rider class driving best.

## Phase 7: longer-term
Progression with alternate skills; lore Arena maps (several are built in phase 3 as scene arenas and can be reused); new large war maps (Snowfield, Trifas).

---

## A. Cutscenes (owner, Nov 26)
- **When one plays:** when a story beat happens **correctly** (its cast is there and the canon moment occurs), and **only if a human is there to see it**: a player within range, or one of the cast. With no one there, the beat resolves off-screen with a headline instead.
- **Also in Random mode:** canon moments trigger cutscenes whenever the right cast meets. For example, King Arthur first meets Lancelot, Kirei kills Tokiomi, Iskandar meets King Arthur, or Rider's last charge when Iskandar and Gilgamesh face each other on the bridge.
- **Multiplayer:**
  - A scene plays only when **every player it needs is on the board**: alive, in the war, and near the place.
  - While it plays, **the war clock pauses for everyone**, but the war keeps going: players not in the scene keep moving and fighting.
  - The fighters in the scene are frozen and can't be targeted until it ends.
  - Scenes are short (about 10–25 s) and skippable once every involved player presses skip.
- **How it's built:** scenes are data, not code. A list of shots, each with:
  - Camera moves.
  - Actor moves (walk to, face, attack pose).
  - Dialogue lines, original wording.
  - Effects (FX calls), title cards and letterbox bars.

  The scene runner plays them on top of the live game. Guests get the scene as one FX event and play it themselves.

## B. Beat director (summary)
- **Beats:** each has a time window, cast, place, AI setup, outcome and fallbacks.
- **Off-screen, canon happens; on-screen, the fight is real.**
- **Soft plot armor:** AI avoids killing scheduled cast early and saves seals for them; a player can kill anyone.
- **Fallbacks:** substitute host, skip or alternate beat. A Canon meter tracks the drift, and the ending card names it.
- **Players:** canon scenes are optional objectives with rewards; declining breaks nothing.
- **Multiplayer:** the host runs the director (`G.story`); beats and scenes reach guests as FX events.
- **Lengths:** each story sets its own nights, days and phase lengths. Fate/Zero runs about seven nights, with a four-night short version.

## C. Special arenas (rooms in the interior strip, entered through the beat)
- **Kiritsugu and Kirei:** the Civic Hall's inner theatre, burning, with the Grail above.
- **Kiritsugu and Kayneth:** the Einzbern Castle hall (Volumen Hydrargyrum against Origin Rounds).
- **King Arthur and Lancelot:** the parking garage under the Civic Hall.
- **Rider's last charge:** Fuyuki Bridge, a long straight stage.
- **King Arthur and Kojirou:** the Ryuudou Temple gate and steps.
- **Shirou and Archer:** the Einzbern Castle (and Unlimited Blade Works).
- **Heracles in the Einzbern forest clearing:** his seven deaths.
- **The Great Cavern:** already in the game.

## D. Ending scenes
- **Every war:** the winning pair's wish, as a short scene with their own lines.
- **A black Grail:** the corrupted wish, or, if the Fuyuki Fire covered the Grail, the burning city.
- **Story endings:**
  - **Fate/Zero:** Kiritsugu destroys the Grail; the fire; Waver at the shore.
  - **Fate:** King Arthur at Camlann's hill at dawn.
  - **Unlimited Blade Works:** Archer's farewell at sunrise.
  - **Heaven's Feel:** spring, the cherry trees.
- **Divergent endings:** titled by the Canon meter, written for the most common outcomes (for example "The King of Conquerors Claims the Grail").

## E. Fate/Zero beats (detail in `docs/story-modes.md` section 5)

| # | Beat | When | Built from | Cutscene |
|---|---|---|---|---|
| 1 | Assassin "dies" at the Tohsaka Mansion | Prologue | False Death | Gilgamesh's rain of treasures, from the garden |
| 2 | Battle at the Docks | Night 1 | Challenge, plus entrances | Iskandar's entrance and announcement; Gilgamesh on the lamp post |
| 3 | The Hyatt | Day 2 | Demolition | The tower floor falls |
| 4 | The Einzbern Forest | Night 2 | Kayneth against Kiritsugu, in the castle hall arena | Origin Rounds against Volumen Hydrargyrum |
| 5 | Bounty on Caster | Night 2 | Church Bounty | The overseer's announcement |
| 6 | The King's Banquet | Day 3 | Banquet, three-king script | Ionioi Hetairoi answers the Assassins |
| 7 | The Horror in the River | Night 3 | Horror, plus breaking Gáe Buidhe | Lancer breaks his spear; Excalibur ends it |
| 8 | Irisviel is taken | Day 4 | Rescue objective | The abduction |
| 9 | The Self Geas Scroll | Night 4 | Pact betrayal | Lancer's curse |
| 10 | Kirei's betrayal | Night 5 | `gilBetrayTick` | The King's offer to Kirei |
| 11 | Rider's last charge | Night 5 | Bridge arena duel | Ionioi Hetairoi against Enuma Elish; Waver spared |
| 12 | The Knight of the Lake | Night 6 | Garage arena duel | Lancelot's helm falls |
| 13 | Kiritsugu and Kirei | Final | Civic Hall theatre arena | Their last exchange |
| 14 | The Fuyuki Fire | Final | New event | Kiritsugu's order to destroy the Grail; the mud spills |

## F. Fate/stay night beats (detail in `docs/story-modes.md` section 6)
**Shared opening:** the witness at the school (Lancer against Archer; Shirou chased and saved; Saber summoned in the shed), the Church, Berserker on the hill.

| Route | Beats | Cutscenes | Needs |
|---|---|---|---|
| Fate | Blood Fort at school; temple gate (Kojirou); Caster's ambush; Einzbern forest (Heracles' seven deaths); a day in Shinto; Gilgamesh kills Caster's team; final at Ryuudou Temple | Excalibur against Enuma Elish; Avalon | Shinji |
| Unlimited Blade Works | Archer's betrayal; Rule Breaker takes Saber; Gilgamesh at the castle; Shirou against Archer; Lancer's last order; final in Unlimited Blade Works | Unlimited Blade Works chant; Archer's farewell | Shinji, Bazett |
| Heaven's Feel | The Shadow rises; True Assassin kills Kojirou and Caster; Saber falls (Saber Alter); Heracles against Saber Alter; Shirou takes Archer's arm; Rider allies; final in the Great Cavern | Saber Alter's return; Rider's mask comes off | Shinji, Zouken, True Assassin, Saber Alter, Dark Sakura |
