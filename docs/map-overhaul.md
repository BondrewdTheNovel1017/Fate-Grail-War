# Fuyuki map overhaul (planned Nov 26, not started)

The owner's goals: bases evenly spaced; more distinct districts; Ryuudou Temple far from the manors in its own forest, with the cave on a hidden path; a map that need not be a rectangle; buildings that are not plain squares; a real neighbourhood (fences, gardens, props); dark alleys where a fight can happen by day; AI that knows not to fight in daylight.

## Where things stand
- `MAPS.city` is a 12000 x 8000 rectangle; the Mion River (x 5700–6300) splits Miyama (west) from Shinto (east); the sea is below y 7300.
- Closest rival bases: average 1584, worst 1423 (`tools/basecheck.js`). Tohsaka and Matou sit side by side on the hill; the temple woods end about 550 units from the Tohsaka garden.
- Buildings are axis-aligned rectangles (`B()`, collision `RECTS`), roads are straight strips, fills place boxes on a grid.
- Civilians witness anything within a radius (`witness` in 58-clock.js): walls do not block their view, so there is nowhere hidden to fight by day.

## 1. Shape: a coastline, not a box
- Replace the rectangle with an outline polygon (`MAP.shape`). Outside it: sea, cliffs or dense forest, drawn as terrain and walled by a chain of thin colliders (the engine stays rectangle-based).
- Lobes give districts room: Mount Enzou pushed out as a north-west lobe; the Einzbern forest as an east lobe; the Church on a headland by the sea; the harbour as a southern spur.
- The city may grow (about 14000 x 9500 overall) but most of the new area is forest and coast, so walking distance between rivals grows without empty streets. Watch night dead time (now about 37–40%) and add hunt points if it climbs.

## 2. Districts, each with its own base sites
| District | Character | Bases |
|---|---|---|
| Mount Enzou (NW lobe) | Forest and a long stair; temple at the top, a lake behind; the cave on the far slope reached by an unmarked trail through the trees | Ryuudou Temple |
| Western hill (Miyama north) | Western manors on large walled lots, split by a wooded ravine and a park | Tohsaka (west end), Matou (east end, across the ravine) |
| Miyama old town | Japanese houses, narrow lanes, shrine, shops, alleys | Emiya, one estate plot |
| Miyama south | Suburban streets, school | Mackenzie, one estate plot |
| Church headland | Cemetery, cliff path, sea view | Kotomine Church |
| Shinto business core | Towers, station, mall, dark service alleys | Hyatt |
| Shinto south and harbour | Apartments, warehouses, docks | Two estate plots |
| Einzbern forest (E lobe) | Deep forest and the castle | Einzbern Castle |
- Rule: at most one rival base per district, and every base at least about 2400 apart (target for `basecheck`: worst ≥ 2200, average ≥ 2800). Estates and safehouses keep using `farPlot`, but plots are spread one or two per district.
- Canon homes stay in their districts; only exact positions move. The Einzbern castle and the courtyard stay as they are.

## 3. Buildings that are not boxes
- Footprints become shapes: L, T and U plans, wings, porches, verandas, inner courtyards (the Emiya house, Japanese homes with engawa), set at angles along curved roads.
- Collision splits each footprint into a few rectangles (so `RECTS`, `segRect` and the nav code keep working); drawing uses the real outline with a roof per wing (hip, gable or flat), eaves, chimneys, rooftop units.
- Fills stop being grids: a block is cut into lots of varied width; each lot gets a house set back from the street, a yard, a fence or wall with a gate, sometimes a parking space or garden.

## 4. A neighbourhood that feels lived in
- Fences, hedges, stone walls and gates as thin colliders (yards become places you fight around).
- Props: utility poles with wires overhead (drawn in the overhead layer), vending machines, bicycles, parked cars, mailboxes, bins, laundry, potted plants, shrine gates, bus stops, crossings, kerbs and sidewalks.
- Curved residential lanes and dead ends; the main avenues stay straight.

## 5. Dark alleys and daylight rules
- Alleys: narrow passages (60–90 wide) between building backs, marked as `alley` zones. No streetlights; a darkness overlay even by day; civilians never path through them.
- Witnesses need line of sight: `witness` checks `segRect` against buildings and walls, so a fight inside an alley or a walled yard goes unseen (noise can still carry). That makes alleys the one place a daylight fight is safe.
- AI by day (`70-ai.js`): never starts a fight in the open; only engages if attacked, or when both it and its target stand in a hidden place (alley, interior, forest, walled yard). If a fight breaks out in public by day, it breaks off, or pulls back into the nearest alley. By night the rules stay as they are.

## 6. Order of work (each step ends with tests, `mapcheck`, `basecheck` and the pacing sim)
1. Outline and district blockout: the new shape, roads, base sites, plots; move every coordinate-based table with it (spawns, doors, `GRAIL_SITES`, `LEY`, `LEYP`, `BUSY`, event spots, civilian doorways, executor spawns). Measure spacing and pacing.
2. Alleys, line-of-sight witnesses and the daylight AI rules (plus tests for each rule).
3. Building shapes, lots, fences and props (drawing and collision), district by district; cache the static drawing so frame time stays flat.
4. Final sims: pacing targets, night dead time, base spacing, master and servant win rates; screenshots of every district.

This is the largest change since the city map itself: expect two or three sessions. Step 1 alone already fixes spacing and the temple.

## Open questions for the owner
- Is a bigger map fine (longer walks between rivals), or should it keep today's area with the space redistributed?
- Tohsaka and Matou: same hill on opposite sides of a ravine (proposed), or separate districts entirely?
- Keep the single river with two bridges, or add a second crossing?

## Owner's answers and additions (Nov 26)
- A bigger map is fine.
- Vehicles (after the map overhaul): ambient traffic on the road graph, civilians on sidewalks, cars that AI can drive, that can be destroyed (smoke, fire, a cinematic explosion, a burning wreck left as cover) and that hurt servants and masters they hit. Proposed order: parked cars that can be wrecked → ambient traffic → AI and player driving. Rider-class servants drive best (Riding). A crash or explosion by day is a big witness event. Keep the number of moving cars near players small (online room budget).
- Unique residences: home sites with their own interiors, e.g. the Uryuu storehouse for Ryuunosuke; Kuzuki at Ryuudou Temple (his lore home).
- Master types get one passive each (proposed, to balance with the sims):
  - Mage family: today their bounded field starts at level 2 (max 4). Keep that; their larger mana pools already come from each character's numbers, so no extra mana on top.
  - Fledgling (Shirou, Waver, Kariya): Growth. Mana pool and regen rise by 10% for each night survived (up to +30%). Shirou keeps Trace on top.
  - Mage killer (Kiritsugu): bounded fields do not slow him and their bolts deal half (they still sense him), and +10% damage to masters in the war only. Different from Outsiders, who are not sensed at all but are slowed.
  - Church (Kirei, Caren): the Church is their home and they can share it; its interior is a sanctuary (no one can deal damage inside, like a truce zone). Limits: no bounded field there, sanctuary does not protect anyone who dealt damage in the last 20 s, and it ends when the Grail descends. Church heat is not reduced.
  - Outsider: not felt by bounded fields (as now).

## Draft 1 (Nov 26)
`docs/map-draft-1.png` (drawn by `tools/mapdraft.py`, which also prints base spacing): closest rival bases 2,300 (today 1,423), average nearest 2,656. Mount Enzou is a north-west lobe with the lake behind the temple and the cave on its far west slope on a hidden trail; the Uryuu storehouse sits at the edge of Miyama south.
