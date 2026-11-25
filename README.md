# Fate Grail War

A top-down Holy Grail War in the style of *Fate/Zero* and *Fate/stay night*: seven master and servant teams fight across Fuyuki City with souls-like combat, Command Seals, spirit form, reality marbles and AI opponents.

The design is in the game design document (a Claude doc). This repository holds the code, built in milestones:

1. Big-map sandbox — done
2. Masters and contracts — done
3. Fuyuki and the living city — 3a, the city rebuild, is in; 3b (day/night, civilians, Exposure) next
4. Bases, fog of war and intel
5. Master creation and social play
6. Online multiplayer
7. AI game master and events

## Playing

Two ways to play from the start screen:

- **Holy Grail War**: up to seven master and servant teams across all of Fuyuki City (12,000 × 8,000, with walk-in interiors), with mana, Command Seals, spirit form and contracts. Masters start at their lore homes.
- **Arena**: quick fights on seven themed maps: servant duels, free-for-all (3–4), 2v2 teams, master duels, master-and-servant pairs, and a Quick Grail War (seven teams on the compact Fuyuki map in about three minutes).

The game is a single web page. Open `dist/fuyuki-war.html` in a browser, or play the published build on claude.ai.

Keyboard: WASD move, J light, K heavy (hold to charge), L block, Space dodge, I skill, O Noble Phantasm (masters: signature spell), U spirit form, Tab target, 1–6 orders, 7–9 Command Seals. On touch screens, use the stick and buttons.

## Working on it

Needs Node 20 or newer; there are no dependencies to install.

```
npm run build   # src/ -> dist/fuyuki-war.html
npm test        # rules tests and full AI wars
npm run sim     # balance report from simulated wars
```

| Folder | What is in it |
| --- | --- |
| `src/engine/` | Rules, combat, servants, masters, maps and AI. No browser code, so tests and tools run it in Node. |
| `src/ui/` | Sprites, sound, effects, drawing, input, menus and the game loop. |
| `src/page/` | The HTML template and stylesheet. |
| `tools/` | Build script and the balance simulator. |
| `tests/` | Automated tests (`node --test`). |
| `arena/` | The original standalone duel arena page, kept for reference. Arena mode now lives in the main game. |
| `dist/` | The built page. |

Files in each source folder are joined in name order into one script, so a file can use anything defined in a file before it.
