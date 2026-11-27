# Roadmap: everything planned, in order (revised Nov 26, evening)

Detailed plans: `docs/saturday.md` (next session), `docs/map-overhaul.md` (map, vehicles, props, residences, master passives), `docs/story-modes.md` (first story plan), `docs/future-masters.md` (new masters), `docs/ideas-approved.md` (chronicle, true names, hidden homes, familiars, traps, tutorial), `docs/truce-bases.md` (truces, event zones, the event visual pass, base upgrades), `docs/events-3.md` (the third event batch, the False Death rework and the War Board, Rho Aias's look), `docs/todo.md` (the full queue). Session counts are rough.

**Rules for the order:**
- Cheap fixes every war feels go first.
- Foundations before what is built on them.
- Characters before the stories that need them.

## Phase 0: quick wins (done Nov 26)
- The Grail appears at midnight, holds 15 s, then closes from 2,000 to 550 over 1 min 20 s.
- Berserker Unchained takes only a Berserker; otherwise **The Grail's Taint** (an Alter servant, confirming a black Grail).
- The **Events** setting: Random, Fourth War events, Fifth War events.

## Phase 1: balance, combat and the truce fix (Saturday, about three to four sessions)
0. The truce fix first: AI never strikes under a truce, self-defence never breaks an oath, a warning before it does (`docs/truce-bases.md`).
1. War and Arena values for every tunable number.
2. Per-NP tuning, war first (Gilgamesh first).
3. Reality marbles: no NP charging inside your own marble, and a buff instead.
4. Fledgling Growth and Mage killer passives.
5. The rest of the Sealed School.
6. Base upgrades replace the ley-line task (`docs/truce-bases.md`).
8. True names matter more, and the war's chronicle (`docs/ideas-approved.md`).
9. Spirit form stops being a combat escape (`docs/ai-plans.md`).
10. Clearer bars and segmented stamina (`docs/resources-strings.md`).

## Phase 1b: combat strings (about two to three sessions)
Lights into a heavy change the move by count; a full chain into a heavy is each character's signature finisher, servants and masters (`docs/resources-strings.md`). Rerun the duel and NP checks after.
   (Rho Aias's new look: done Nov 26.)
7. The War Board and the False Death rework (`docs/events-3.md`).

Details and baselines: `docs/saturday.md`.

## Phase 2: the new Fuyuki and the AI (about four to five sessions)
1. Map step 1: the approved layout with residences and the Church sanctuary.
2. The AI overhaul with alleys, line-of-sight witnesses and the daylight rules, the two orders, Stay with me and Act freely, and team plans with roles and stages (lures, feigned retreats, watching the door, home invasions with reasons, fair sabotage; `docs/ai-plans.md`); event zones rebuilt with it (the Banquet's approach and castle, visible truce areas; `docs/truce-bases.md`).
3. Building shapes, lots, fences, props, and the docks with room to duel.
4. Destructible props.

## Phase 2a: the hunt (about three sessions)
Hidden homes and invisible fields, the mana rework (refill at home; `docs/resources-strings.md`), familiars you steer from home, traps for certain masters, a clearer day and night rhythm (`docs/ideas-approved.md`).

## Phase 2b: the event visual pass, then the third event batch (about four sessions)
First a visual pass over every existing event, the Horror in the River first (`docs/truce-bases.md`).
Thirteen story moments built as events (`docs/events-3.md`): scripted beats in story mode, dealt from the deck in normal wars with lore hosts and stand-ins, like today's events. Small ones first (The Overseer Falls, The Hundred Faces, Bluebeard's Siege, The Gate of Ryuudou, A Day in Shinto; these can come earlier when a session has room), then the middle ones, then The King Returns and The Vessel Taken.

## Phase 2c: after death (about two sessions)
Spectator mode (small), then Alter invasions: a dead player returns for a while as an Alter of a fallen servant (`docs/events-3.md`).

## Phase 3: story foundations (about three sessions)
(Also the guided first night, a tutorial on the scene system; `docs/ideas-approved.md`.)
1. **Scene system** (section A): portable in-world scenes, staged scenes and transitions, multiplayer pausing, settings.
2. **Beat director** (section B).
3. **Scene arenas** (section C).
4. **Ending scenes** (section D).
5. **The Fuyuki Fire**: the Civic Hall collapses, mud flows around buildings, fire follows.
6. **Canon moments in Random mode:** the portable scenes from section E that need no story (first meetings, betrayals, unmaskings).

## Phase 4: Fate/Zero story (about two sessions; section F)

## Phase 5: Fifth War characters, then the routes (about six to eight sessions; section G)
- **Characters first:** Shinji, Bazett, Zouken, True Assassin, Saber Alter, Dark Sakura; Ayaka in the same batch.
- **Then the routes:** Fate, then Unlimited Blade Works, then Heaven's Feel.

## Phase 6: vehicles (about three sessions)
Wreckable parked cars, then traffic and sidewalks, then driving.

## Phase 7: longer-term
Progression with alternate skills, lore Arena maps (phase 3's scene arenas double as these), new large maps.

---

## A. How scenes flow (story mode and Random mode)
**The question:** what if King Arthur and Lancelot meet somewhere other than the canon parking garage? Should the game cut away to a cutscene?

**The answer: mostly no.** Most scenes play **in the world, where the characters already are**. The camera eases in rather than cutting, and the scene hands play back exactly where it started. Only a few scenes need a particular place, and those reach it through the story itself or through a transition the lore already provides.

### Three kinds of scene
1. **Portable scenes (most of them).** They happen wherever the trigger happens:
   - **Lead-in (about 0.6 s):** time slows, letterbox bars slide in, the camera eases to frame the actors at their current spots.
   - **Marks:** the actors take positions *relative to where they stand* (for example, 120 apart facing each other), moved along the ground to the nearest open spot, never teleported through walls.
   - **Body:** dialogue bubbles in original wording, poses and effects drawn with the real abilities (Lancelot's helm cracking uses his own sprite and the hit effects).
   - **Hand-back:** the camera returns, the bars slide out, and everyone keeps their position. The actors get 1 s of protection, then the fight resumes.
   - **Generic wording:** lines never name a place unless the scene knows it is there, so "the garage" is never said on a rooftop.
   - **Variants:** a scene can have variants by setting (street, indoors, forest, bridge, rooftop) and time (day, night) for its opening line, the lighting and small props (rain, sparks).
2. **Staged scenes (a few).** These need their place: Rider's last charge on Fuyuki Bridge, Kiritsugu against Kirei in the burning Civic Hall, the Great Cavern, the temple gate. Two ways to reach them:
   - **In story mode,** the beat director gathers the cast there first. The AI travels, players get an objective arrow and a banner, and the scene starts when the cast arrives.
   - **In Random mode,** a staged scene plays only if the cast meets at or near its place. Otherwise its portable variant plays where they are.
3. **Transitions (when the story must move people).** No hard cuts. The game uses what the lore already gives:
   - **Reality marbles move everyone by nature:** Ionioi Hetairoi and Unlimited Blade Works already take fighters into their own world, so those scenes play inside the marble wherever it opens.
   - **The Grail's mud:** on the final night, the black mud can swallow two rivals and bring them up inside the burning Civic Hall theatre (Kiritsugu and Kirei), shown as a black wave crossing the screen.
   - **A challenge or invitation:** "Kirei waits for you at the Civic Hall." The player chooses to go, so it never feels forced.

### Triggers, interruptions, multiplayer
- **When a scene plays:**
  - Its conditions are met: the cast is present and the moment happens (a health threshold, a first meeting, an NP landing).
  - **A human is there to see it:** a player within view, or a player in the cast.
  - **No other hostile is close** (about 600). If one is, the scene waits a few seconds; if the chance passes, it is skipped and the moment simply happens in play.
- **During a scene:** the actors are frozen and can't be targeted, and others can't hurt them. Anyone else nearby sees the bubbles over their heads.
- **Multiplayer:**
  - A scene plays only when **every player it needs is on the board**.
  - **The war clock pauses for everyone,** while the war goes on for players not in the scene. Their screens show a small "scene in progress" mark at the actors' place.
  - Skip needs every involved player to press skip. Guests receive the scene as one FX event and play it locally.
- **Settings:** Scenes: All / Story only / Off. Each scene plays once per war. Typical length 8–20 s; endings may be longer.
- **Built as data:** each scene is a list of shots: camera moves, actor marks and poses, lines, effects, title cards. Adding a scene never means new code.

## B. Beat director (summary)
- **Beats:** each has a time window, cast, place, AI setup, outcome and fallbacks.
- **Off-screen, canon happens** (a headline reports it). **On-screen, the fight is real.**
- **Soft plot armor:** AI avoids killing scheduled cast early and saves seals for them; players can kill anyone.
- **Fallbacks:** substitute, skip or alternate beat. A **Canon meter** tracks the drift and names the ending.
- **Players:** canon scenes are optional objectives with rewards; declining breaks nothing.
- **Multiplayer:** the host runs it (`G.story`); beats reach guests as FX events.
- **Lengths:** each story sets its own nights, days and phase lengths.

## C. Scene arenas (rooms entered through a story beat or a transition)
- **Civic Hall theatre, burning:** Kiritsugu and Kirei; the Grail overhead.
- **Einzbern Castle hall:** Kiritsugu and Kayneth; later Shirou and Archer (Unlimited Blade Works route).
- **Parking garage under the Civic Hall:** King Arthur and Lancelot.
- **Fuyuki Bridge:** Rider's last charge.
- **Ryuudou Temple gate and steps:** Kojirou.
- **Einzbern forest clearing:** Heracles.
- **The Great Cavern:** already built.

## D. Ending scenes
- **Every war:** the winner's wish, with the pair's own lines.
- **Black Grail:** the corrupted wish, or the burning city after the Fuyuki Fire.
- **Story endings:**
  - **Fate/Zero:** Kiritsugu orders the Grail destroyed; the fire; Waver at the shore.
  - **Fate:** dawn on the hill; King Arthur's farewell.
  - **Unlimited Blade Works:** Archer's farewell at sunrise.
  - **Heaven's Feel:** spring, the cherry trees.
- **Divergent endings,** named by the Canon meter, for common outcomes (for example "The King of Conquerors Claims the Grail", "No One Was Left").

## E. Canon moments in any war (portable scenes, also in Random mode)

| Moment | Trigger | Scene |
|---|---|---|
| King Arthur meets Lancelot | First time they fight | Lancelot's roar of her name; she doesn't yet know him |
| The Knight of the Lake | Lancelot below 30% health fighting King Arthur | His helm cracks and falls; her recognition |
| Iskandar's introduction | First time Iskandar meets another servant | He announces his name and offers to recruit them |
| Kings meet | Iskandar, Gilgamesh and King Arthur in one place | A short exchange of their wishes (the Banquet's full scene is in its event) |
| The Eighth Contract | Kirei kills Tokiomi (`gilBetrayTick`) | The King's offer to Kirei |
| Lancer's honour | Diarmuid's master dies by betrayal, or the Self Geas Scroll | Lancer's curse on those who betrayed him |
| Archer and the boy | EMIYA meets Shirou | Archer's cold stare, a few words neither understands yet |
| Rule Breaker takes a servant | Medea's NP lands on a servant | The contract tears; the servant's new mark |
| Alter returns | The Grail's Taint | The mud closes, then opens on the changed servant |
| Gate of Babylon unveiled | Gilgamesh first uses his NP | The golden ripples open behind him |
| Unlimited Blade Works | EMIYA or Shirou opens the marble | The chant's first and last lines, the field of swords |
| Ionioi Hetairoi | Iskandar opens the marble | The army behind him, the desert wind |
| The black sun | A corrupted Grail descends | The black sun opens over the site |

## F. Fate/Zero story (six nights)
**Teams:** King Arthur and Kiritsugu (with Irisviel), Diarmuid and Kayneth, Iskandar and Waver, Gilgamesh and Tokiomi, Hassan and Kirei, Lancelot and Kariya, Gilles and Ryuunosuke.

**Phases:** night about 5 min, day about 2 min; the full story runs about 45 min (a short version merges nights 4 and 5).

**Night 1: The War Begins**
1. **Summonings** (intro): each master's summoning. *Scene:* Kiritsugu and Irisviel find King Arthur is a woman.
2. **Assassin falls at the Tohsaka Mansion** (False Death). *Scene, staged at the mansion garden:* Gilgamesh on the roof; a rain of treasures. The Assassin team is "dead" until dawn.
3. **The Harbour Duel** (Challenge, at the docks). Diarmuid calls King Arthur out.
   - *Scene 1:* the challenge. Her left hand is wounded by Gáe Buidhe, a lasting debuff until Lancer's spear breaks.
   - *Scene 2:* Iskandar's chariot crashes between them; he announces his name and wish.
   - *Scene 3:* Gilgamesh on a lamp post; Lancelot's attack.
   - *Off-screen fallback:* a headline reports the duel's outcome.
4. **Kayneth orders Lancer to finish Saber;** Iskandar drives him off. *Live fight.*

**Day 2: Moves in the Dark**
5. **The Church watches:** Kirei "withdraws" and shelters at the Church (the Assassin team's base is the Church).
6. **Scouting** (existing scouts): AI masters send familiars.

**Night 2: Fire and Forest**
7. **The Hyatt** (Demolition, Kayneth's floor). *Scene, staged outside the tower:* the floors fold down. Kayneth survives in his bounded field.
8. **Bounty on Caster** (Church Bounty, host Gilles). *Scene:* the overseer's announcement.
9. **The Einzbern Forest:** Caster's horrors attack the castle. King Arthur and Diarmuid fight them together (a temporary truce); Diarmuid's spear breaks Caster's grimoire. *Scene:* the grimoire's pages burn.
10. **Kiritsugu against Kayneth** in the castle hall (arena). *Scene:* Volumen Hydrargyrum against the Origin Round. Kayneth's circuits burn (his kit is silenced for the rest of the war; Lancer's mana comes from Sola-Ui).
11. **Kirei against Irisviel and Maiya** in the forest. *Live fight;* Avalon saves Irisviel.

**Day 3: The King's Banquet**
12. **The Banquet** (existing; three kings). *Scenes:*
    - The three wishes.
    - The Assassin swarm.
    - **Ionioi Hetairoi** destroys them (the Assassin team is truly out).
13. **Rider and Waver burn Caster's lair** (a day task near the river for Iskandar's team: removes Caster's familiars).

**Night 3: The Horror in the River**
14. **Caster's leviathan** (Horror) rises in the Mion River; truce for all.
    - *Scene:* the alliance.
    - *Live:* the fight.
    - **Kiritsugu snipes Ryuunosuke** (a Kiritsugu objective; scene from the rooftop).
    - **Diarmuid breaks Gáe Buidhe** to free Saber's hand (Lancer's choice if both live; scene).
    - **Excalibur ends it** (scene).
15. **Tokiomi dismisses Kariya;** Kirei rescues him (off-screen).

**Day 4: The Self Geas Scroll**
16. **Kiritsugu's offer:** a truce with Kayneth under a binding scroll (the pact system). *Scene:* the signing.
17. **Kayneth kills Risei at the Church** (off-screen headline): the overseer is gone, so the Church sends no more bounties.

**Night 4: Betrayals**
18. **The scroll's trap:** Maiya's rifle; Kayneth's seal forces Lancer's suicide. *Scene:* Lancer's curse.
19. **The Eighth Contract:** Kirei kills Tokiomi and contracts Gilgamesh (`gilBetrayTick`). *Scene:* "Forgive me, Teacher."
20. **Irisviel collapses;** her role as the vessel is revealed (Kiritsugu's team: she leaves the field and rests at the castle).

**Day 5: The Abduction**
21. **Irisviel is taken;** Maiya falls defending her. *Scene:* the empty car on the road.
22. **The chase:** King Arthur on a motorcycle against Iskandar's chariot (a vehicle beat once vehicles exist; until then a run along the river road). *Live,* ending with the chariot destroyed.

**Night 5: The Last Night**
23. **Rider's last charge** on Fuyuki Bridge (staged).
    - *Scene:* Waver offers his last seals; Iskandar refuses.
    - **Ionioi Hetairoi against Enuma Elish.**
    - *Scene:* Waver spared by the King.
24. **The Knight of the Lake** in the parking garage (staged; or portable anywhere). *Scene:* the helm falls; Lancelot's last words.
25. **Midnight: the Grail descends at the Civic Hall,** black.
26. **Kiritsugu against Kirei** in the burning theatre (staged; mud transition). *Scene:* the Origin Round; their last words.
27. **The Final Command:** if Kiritsugu holds the Grail, two seals order King Arthur to destroy it. *Scene.*
28. **The Fuyuki Fire** (new event). *Ending scene:* the burning city; Kiritsugu finds a boy in the ashes.

**Missing for this story:** nothing in the roster. New systems: the scene system, the beat director, the Fuyuki Fire. New arenas: castle hall, bridge, garage, theatre.

## G. Fate/stay night stories (the shared opening, then one route)
**Teams:** King Arthur and Shirou, EMIYA and Rin, Cú Chulainn and Kirei (Bazett in the prologue), Medusa and Shinji (Sakura's command), Medea and Kuzuki, Kojirou (Medea is his master), Heracles and Illya. Hidden: Gilgamesh with Kirei.

**Phases:** Fate about seven nights, Unlimited Blade Works nine, Heaven's Feel seven; night about 4 min, day about 2 min.

### The shared opening (Nights 1–2)
1. **The witness:** Archer and Lancer fight in the schoolyard; Shirou sees them. *Scene.*
2. **Shirou dies and lives:** Lancer kills the witness; Rin saves him with her pendant. *Scene* (a fade, no gore).
3. **The summoning in the shed:** Lancer comes again and Saber appears in the moonlight. *Scene* (the war's opening summoning for Shirou's team).
4. **Rin and Archer:** Saber nearly kills Archer; Shirou stops her with a seal. *Scene.*
5. **The Church:** Kirei explains the war (Overseer's Summons). *Scene.*
6. **Berserker on the hill:** Illya's greeting; Heracles. *Live;* Shirou shields Saber from a blow (scene).

### Fate route
- **Day 3:** Shirou brings Saber into daily life (downtime talk; a Shinto day task).
- **Night 3: Rider's barrier at the school:** Shinji reveals himself as Rider's master (scene) and offers an alliance; refusing starts his grudge.
- **Night 3: The temple gate:** Saber goes alone to Ryuudou and duels Kojirou (staged). *Scene:* Tsubame Gaeshi.
- **Day 4: Sword lessons;** Illya in the park (a peaceful meeting; truce).
- **Night 4: Blood Fort Andromeda** (Sealed School). *Scenes:* Shirou calls Saber with a seal; Excalibur against Bellerophon over the city.
- **Day 5: The winter castle:** Illya captures Shirou (rescue objective at the Einzbern castle).
- **Night 5: The castle stand:** Archer holds Berserker off alone, Unlimited Blade Works (scene); Shirou traces Caliburn, and with Saber they kill Heracles' last lives (scene).
- **Day 6: The comas:** Caster drains the city; Sakura is taken to the temple (rescue objective).
- **Night 6: The temple:** the rescue; Gilgamesh appears and kills Caster and Kuzuki. *Scene:* "So you are the Saber of ten years ago."
- **Day 7: The date:** Shirou and Saber in Shinto (day task with downtime talk); it ends in an argument (scene).
- **Night 7: Gilgamesh attacks:** Shirou traces Avalon. *Scene.* Lancer holds Gilgamesh and dies (scene). Kirei takes Illya.
- **Final, Ryuudou Temple:**
  - Kirei against Shirou (live).
  - **Excalibur against Enuma Elish, Avalon** (scene).
- **Ending:** dawn on the hill; King Arthur's farewell.

### Unlimited Blade Works route (nine nights)
The route's heart is Shirou against Archer on Night 8. Needs Shinji and Bazett first.
- **Night 1 variation:** on the hill, Archer fires Caladbolg into Saber and Berserker; Shirou is hurt shielding Saber (scene).
- **Day 2: The drained city:** Saber at school as Kiritsugu's acquaintance (downtime talk); Rin and Archer find Caster draining people in Shinto (battle-site task whose clues lead to the temple).
- **Night 2: A truce at school:** Rin attacks Shirou for his seals (live, ends when one side yields); Rider attacks a student, Shirou is hurt shielding Rin, Rin drives Rider off (scene); Rin and Shirou truce (story pact).
- **Day 3: Shinji's offer:** he reveals he is Rider's master and set the school's field; Shirou refuses (scene).
- **Night 3: Caster's pull:** Shirou's movement is pulled toward the temple until Archer arrives; Caladbolg spares Caster, who reveals she is Assassin's master (scene); Archer turns on Shirou, Kojirou holds him off (scene).
- **Day 4: Blood Fort Andromeda** (Sealed School): Rider is already dead inside; Shinji flees (scene).
- **Night 4:** Shinji receives Gilgamesh from Kirei (off-screen headline); Rin and Shirou plan a strike on Caster's master.
- **Night 5: Kuzuki** defeats Saber bare-handed (live); Shirou's overloaded Projection numbs his left side (scene; reduced strength until dawn).
- **Day 6: Rule Breaker:** Caster holds Taiga hostage and breaks Shirou's contract (scene; `ruleBreak` made permanent for the story). Shirou is out of the war as a master.
- **Night 6: Archer's betrayal:** Caster holds Saber at the Church; Archer joins Caster (forced pact switch, scene); Shirou saves Rin (scene: the matching pendants).
- **Day 7: The winter castle falls:** Gilgamesh kills Heracles and Illya (headline, or live if a player is there); Lancer offers his help (story pact).
- **Night 7: UBW revealed:** Lancer against Archer, Rho Aias breaks (live); Rin defeats Caster hand to hand (scene); Archer kills Caster and Kuzuki, opens Unlimited Blade Works, takes Rin; Rin contracts Saber (scene).
- **Night 8: The castle:** Lancer rescues Rin, kills Kirei and falls (scene); Shirou against Archer in Unlimited Blade Works (staged, scene); Archer shields Shirou from Gilgamesh; the castle burns, Shinji is fused with the Grail.
- **Night 9, final, Ryuudou Temple:** Saber against Kojirou at the gate (live); Shirou against Gilgamesh by the lake in UBW (scene); Rin pulls Shinji out; Excalibur destroys the Grail; Archer's last arrow ends Gilgamesh (scene).
- **Ending:** Archer's farewell at sunrise.

### Heaven's Feel route (seven nights)
Leans on systems we have: the Shadow event, the Alter look (`alterT`), the black Grail, the Great Cavern. Needs Shinji, Zouken, True Assassin, Saber Alter and Dark Sakura first.
- **Night 1 variation:** Sakura stays at the Emiya house after dinner.
- **Day 2: Sakura falls ill:** Shirou keeps her at his house (downtime talk; the house is her sanctuary); Rin warns him she is a Matou (scene).
- **Night 2: The Shadow rises** (Shadow event moved to Night 2); True Assassin is summoned through Kojirou and kills him at the gate (scene); Caster and Kuzuki fall (headline).
- **Night 3: Saber swallowed** by the Shadow (scene; Shirou plays on as a master alone); True Assassin takes Lancer's heart (headline).
- **Day 4: An alliance:** Rider revealed as Sakura's servant, lent to Shinji (scene); Shirou, Rin and Archer agree to protect Sakura (story pact).
- **Night 4: The black knight:** the Shadow devours Gilgamesh (headline); Saber Alter destroys Heracles in the Einzbern forest; Archer loses an arm covering Shirou and Illya (scene).
- **Day 5: Shinji's end** (off-screen headline, worded carefully, never shown); Sakura accepts the Shadow.
- **Night 5: The arm:** Dark Sakura takes Illya to the Great Cavern; Kirei and Shirou go after her (temporary pact); Archer gives Shirou his arm (scene; strong projections with a visible cost timer).
- **Night 6: The black servants:** Shirou with the arm against corrupted Berserker (live); Shirou and Rider against Saber Alter: Rho Aias holds Excalibur, Bellerophon breaks her guard (scene).
- **Night 7, final, the Great Cavern:** Rider against True Assassin (live); Rin against Dark Sakura with the Jeweled Sword, and holds her instead of striking (scene); Kirei against Shirou bare-handed (live); Rule Breaker frees Sakura; Shirou means to destroy the Grail with his last Projection, but Illya takes his place, closes it and carries his soul out (scene).
- **Ending, the true ending (the only one we use):** Rin keeps the soul Illya saved and finds Shirou a new body; the next spring Sakura, with Rider beside her, meets him under the cherry trees by the river.
- **Tone:** the source's abuse stays off-screen and unspoken; Sakura's pain shows through the Shadow and her lines only.

**Missing for Fate/stay night:**
- **Shinji** (all routes).
- **Bazett** (prologue in every route).
- **Zouken and True Assassin** (Heaven's Feel).
- **Saber Alter and Dark Sakura** (Heaven's Feel; the Alter look exists now).
- **Shirou's Avalon, Caliburn and Archer's-arm moments** (as scenes and timed boosts).
- **Arenas, in build order:** Fuyuki Bridge, castle hall, temple gate, forest clearing, Great Cavern, Civic Hall theatre, parking garage (the full plan with endings is in the Claude Doc "Fate Grail War Roadmap").

## Sources consulted
- Fate/Zero episode list (Wikipedia).
- Unlimited Blade Works route day by day (TYPE-MOON Wiki).
- Fate/stay night (2006) episode list (Wikipedia).
- Heaven's Feel films (Wikipedia).
