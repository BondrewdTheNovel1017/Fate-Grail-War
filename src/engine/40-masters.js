/* ---- masters: fragile humans fighting beside their servants ---- */
function MD(o) { return Object.assign({ cls: 'Master', wpn: 'staff', isMaster: true, ranged: true, dmg: 1, recMul: 1, combo: 2, guard: 0.35, spd: 205 }, o); }
var MASTERS = {
  rin: MD({ id: 'rin', name: 'Rin Tohsaka', type: 'Mage family', col: '#c23b46', hp: 100,
    brief: 'Heir of the Tohsaka. Gandr curses, jewel magecraft and healing for her servant.',
    light: { name: 'Gandr', kind: 'proj', speed: 950, range: 580, dmg: 6, wind: 0.3, rec: 0.3, reach: 0, lunge: 0, cost: 12, shape: 'orb', size: 6, col: '#7a3cc8' },
    heavy: { name: 'Gem shot', kind: 'proj', speed: 1150, range: 700, dmg: 14, wind: 0.5, max: 1.0, rec: 0.7, reach: 0, lunge: 0, cost: 24, shape: 'gem', size: 9, col: '#e04a5a' },
    skill: { name: 'Healing Magecraft', kind: 'heal', amount: 40, range: 340, wind: 0.6, act: 0.05, rec: 0.4, cd: 14, cost: 18 },
    np: { name: 'Jewel Burst', kind: 'proj', speed: 900, range: 650, dmg: 6, wind: 0.5, act: 0.05, rec: 0.5, cost: 0, shape: 'gem', size: 12, col: '#ff5a6a', explode: { r: 140, dmg: 24 }, cd: 22, aiUse: 'ranged' } }),
  kiritsugu: MD({ id: 'kiritsugu', name: 'Kiritsugu Emiya', type: 'Mage killer', col: '#6a7480', hp: 110, spd: 215, guard: 0.3, combo: 4, mag: { size: 50, reload: 2.2 },
    brief: 'The Magus Killer. A combat knife up close, Calico fire at range, Time Alter to outpace anyone, and the Contender’s Origin Bullets that burn a mage’s circuits.',
    light: { name: 'Combat knife', kind: 'melee', dmg: 4.5, reach: 70, arc: 0.9, wind: 0.14, act: 0.06, rec: 0.18, lunge: 40, cost: 6, stag: 0.3, power: 1 },
    heavy: { name: 'Calico long burst', ammo: true, kind: 'barrage', max: 0, gb: false, stag: 0.05, wind: 0.3, act: 1.3, rec: 0.5, dmg: 1.0, speed: 1700, range: 640, rate: 0.065, spread: 0.09, track: 2.2, power: 1, noStag: true, reach: 0, lunge: 0, cost: 26, shape: 'tracer' },
    skill: { name: 'Time Alter: Double Accel', kind: 'haste', dur: 3.5, wind: 0.15, act: 0.05, rec: 0.15, cd: 12, cost: 12 },
    np: { name: 'Origin Bullet', kind: 'proj', speed: 2600, range: 950, dmg: 18, rad: 5, silence: 10, vsServant: 0.9, wind: 0.55, act: 0.05, rec: 0.7, cost: 0, shape: 'tracer', cd: 32, aiUse: 'origin' } }),
  shirou: MD({ id: 'shirou', name: 'Shirou Emiya', type: 'Fledgling mage', col: '#d9783a', hp: 115, spd: 212, guard: 0.5, trace: true, fightsServants: true, ranged: false, combo: 3,
    brief: 'A fledgling who gets up close with a reinforced blade and stands in a servant\u2019s fight: the one master who deals full damage to servants, with the health of a human. His Trace grows through the whole war: Trace On (Kanshou and Bakuya, Overedge), then a four-petal Rho Aias, and at 100 Unlimited Blade Works, which a Grail War holds back until Night 2.',
    light: { name: 'Reinforced blade', kind: 'melee', dmg: 5, reach: 78, arc: 0.95, wind: 0.24, act: 0.08, rec: 0.22, lunge: 30, cost: 8, stag: 0.3, power: 1 },
    heavy: { name: 'Reinforced cleave', kind: 'melee', dmg: 13, reach: 90, arc: 1.0, wind: 0.42, max: 0.9, act: 0.12, rec: 0.6, lunge: 60, cost: 20, stag: 0.6, power: 2, gb: true },
    skill: { name: 'Reinforcement', kind: 'reinforce', dur: 5, wind: 0.3, act: 0.05, rec: 0.2, cd: 14, cost: 12 },
    np: { name: 'Broken Phantasm', kind: 'proj', speed: 1500, range: 850, dmg: 6, wind: 0.8, act: 0.06, rec: 0.6, cost: 0, shape: 'drill', explode: { r: 120, dmg: 22 }, cd: 24, aiUse: 'ranged' } }),
  kayneth: MD({ id: 'kayneth', name: 'Kayneth El-Melloi', type: 'Mage family', col: '#4f7ab8', hp: 100, spd: 195, guard: 0.3,
    brief: 'A Lord of the Clock Tower. Volumen Hydrargyrum, his living mercury, shields him and cuts down anyone close.',
    light: { name: 'Mercury needles', kind: 'volley', count: 3, spread: 0.1, speed: 1100, range: 480, dmg: 3, wind: 0.3, rec: 0.3, reach: 0, lunge: 0, cost: 10, shape: 'needle' },
    heavy: { name: 'Mercury blade', kind: 'proj', speed: 1300, range: 620, dmg: 12, wind: 0.5, max: 1.0, rec: 0.7, reach: 0, lunge: 0, cost: 22, shape: 'blade' },
    skill: { name: 'Volumen Hydrargyrum', kind: 'shield', hits: 3, dur: 8, wind: 0.3, act: 0.05, rec: 0.2, cd: 16, cost: 14 },
    np: { name: 'Mercury Scythe', kind: 'aoe', r: 160, dmg: 14, stag: 0.6, power: 2, wind: 0.45, act: 0.1, rec: 0.5, cost: 0, cd: 18, aiUse: 'near' } }),
  kirei: MD({ id: 'kirei', name: 'Kirei Kotomine', type: 'Church Executor', col: '#7d5aa8', hp: 125, spd: 215, guard: 0.5, ranged: false, combo: 3,
    brief: 'An Executor of the Church. He cuts with Black Keys up close, hurls three in a tight line at range, heals himself quickly, and his bajiquan can stagger even a servant.',
    light: { name: 'Black Key slash', kind: 'melee', dmg: 7, reach: 82, arc: 0.9, wind: 0.22, act: 0.08, rec: 0.2, lunge: 40, cost: 8, stag: 0.32, power: 1 },
    heavy: { name: 'Black Key volley', kind: 'volley', count: 3, spread: 0.08, speed: 1400, range: 600, dmg: 7, stag: 0.3, wind: 0.45, max: 0.9, rec: 0.6, reach: 0, lunge: 0, cost: 22, shape: 'key' },
    skill: { name: 'Healing Sacrament', kind: 'heal', self: true, amount: 30, range: 0, wind: 0.4, act: 0.05, rec: 0.3, cd: 13, cost: 14 },
    np: { name: 'Bajiquan', kind: 'melee', reach: 70, lunge: 140, arc: 0.8, dmg: 20, stag: 1.3, power: 2, vsServant: 0.6, wind: 0.3, act: 0.08, rec: 0.6, cost: 0, cd: 16, aiUse: 'near' } }),
  waver: MD({ id: 'waver', name: 'Waver Velvet', type: 'Fledgling mage', col: '#a88a5a', hp: 85, spd: 200, guard: 0.3,
    brief: 'A young student of the Clock Tower. Weak in a fight, but a sharp strategist who makes his servant stronger.',
    light: { name: 'Gandr', kind: 'proj', speed: 900, range: 520, dmg: 4, wind: 0.3, rec: 0.3, reach: 0, lunge: 0, cost: 10, shape: 'orb', size: 5, col: '#7a3cc8' },
    heavy: { name: 'Charged Gandr', kind: 'proj', speed: 1000, range: 600, dmg: 10, wind: 0.5, max: 1.0, rec: 0.7, reach: 0, lunge: 0, cost: 22, shape: 'orb', size: 8, col: '#9a5ae0' },
    skill: { name: 'Strategist', kind: 'buff', dur: 8, wind: 0.3, act: 0.05, rec: 0.2, cd: 18, cost: 12 },
    np: { name: 'Mana Transfer', kind: 'gift', mom: 25, wind: 0.4, act: 0.05, rec: 0.3, cost: 0, cd: 30, aiUse: 'ally' } }),
  irisviel: MD({ id: 'irisviel', name: 'Irisviel von Einzbern', type: 'Mage family', col: '#d8dde6', hp: 90, spd: 200, guard: 0.35,
    brief: 'An Einzbern homunculus. Silver wire familiars that strike and bind, and strong healing alchemy.',
    light: { name: 'Wire bird', kind: 'proj', speed: 1000, range: 560, dmg: 5, wind: 0.28, rec: 0.3, reach: 0, lunge: 0, cost: 10, shape: 'bird', size: 6, col: '#e6eef3' },
    heavy: { name: 'Wire spear', kind: 'proj', speed: 1300, range: 650, dmg: 12, wind: 0.5, max: 1.0, rec: 0.7, reach: 0, lunge: 0, cost: 22, shape: 'blade' },
    skill: { name: 'Alchemic Healing', kind: 'heal', amount: 45, range: 360, wind: 0.6, act: 0.05, rec: 0.4, cd: 16, cost: 18 },
    np: { name: 'Wire Bind', kind: 'proj', speed: 900, range: 560, dmg: 6, root: 1.8, wind: 0.45, act: 0.05, rec: 0.4, cost: 0, shape: 'orb', size: 9, col: '#cfd8e6', cd: 18, aiUse: 'ranged' } }),
  kariya: MD({ id: 'kariya', name: 'Kariya Matou', type: 'Fledgling mage', col: '#5a4a6a', bloodMana: true, hp: 105, spd: 195, guard: 0.3,
    brief: 'A Matou who took the crest worms. He feeds his own life to his servant, and his worms swarm the ground.',
    light: { name: 'Crest worms', kind: 'proj', speed: 700, range: 520, dmg: 6, wind: 0.3, rec: 0.3, reach: 0, lunge: 0, cost: 10, shape: 'worm', size: 7, col: '#4a3a5a' },
    heavy: { name: 'Worm swarm', kind: 'volley', count: 3, spread: 0.18, speed: 700, range: 520, dmg: 5, wind: 0.5, max: 1.0, rec: 0.7, reach: 0, lunge: 0, cost: 22, shape: 'worm', size: 6, col: '#4a3a5a' },
    skill: { name: 'Feed the Servant', kind: 'drain', selfDmg: 15, mom: 30, wind: 0.4, act: 0.05, rec: 0.3, cd: 15, cost: 10 },
    np: { name: 'Worm Pit', kind: 'rain', count: 3, spread: 80, zr: 70, delay: 0.7, dmg: 10, zshape: 'tentacle', wind: 0.5, act: 0.1, rec: 0.5, cost: 0, cd: 22, aiUse: 'ranged' } })
};
MASTERS.illya = MD({ id: 'illya', name: 'Illyasviel von Einzbern', type: 'Mage family', col: '#c9b8e0', hp: 85, spd: 200, guard: 0.3, grailVessel: true,
    brief: 'The Einzbern masterpiece and a living Grail vessel. Her Storch Ritter familiars hunt on their own, and her vast mana makes her servant\u2019s Noble Phantasm charge 30% faster.',
    light: { name: 'Storch Ritter', kind: 'proj', speed: 820, range: 640, dmg: 5, home: 3, wind: 0.3, rec: 0.3, reach: 0, lunge: 0, cost: 10, shape: 'bird', size: 6, col: '#eef0f6' },
    heavy: { name: 'Shwan Ritter', kind: 'volley', count: 3, spread: 0.4, speed: 820, range: 640, dmg: 5, home: 3, wind: 0.5, max: 1.0, rec: 0.7, reach: 0, lunge: 0, cost: 22, shape: 'bird', size: 7, col: '#eef0f6' },
    skill: { name: 'Einzbern Alchemy', kind: 'heal', amount: 35, range: 380, wind: 0.5, act: 0.05, rec: 0.4, cd: 15, cost: 16 },
    np: { name: 'Storch Ritter Swarm', kind: 'volley', count: 6, spread: 0.9, speed: 760, range: 760, dmg: 6, home: 3.5, wind: 0.6, act: 0.05, rec: 0.5, cost: 0, shape: 'bird', size: 8, col: '#f4f0ff', cd: 20, aiUse: 'ranged' } });
MASTERS.sakura = MD({ id: 'sakura', name: 'Sakura Matou', type: 'Mage family', col: '#7a4a8a', hp: 95, spd: 200, guard: 0.35, lifesteal: 0.5,
    brief: 'The Matou heir. Her Imaginary Numbers shadow drinks what it touches: half the damage she deals heals her, and her shadow pools bind servants in place.',
    light: { name: 'Shadow lash', kind: 'proj', speed: 950, range: 560, dmg: 6, wind: 0.3, rec: 0.3, reach: 0, lunge: 0, cost: 10, shape: 'shadow', size: 7, col: '#2a1838' },
    heavy: { name: 'Shadow tendrils', kind: 'rain', count: 2, spread: 60, zr: 62, delay: 0.55, dmg: 9, zshape: 'tentacle', wind: 0.5, max: 1.0, rec: 0.7, reach: 0, lunge: 0, cost: 22 },
    skill: { name: 'Imaginary Drain', kind: 'siphon', r: 260, dmg: 8, wind: 0.4, act: 0.05, rec: 0.3, cd: 12, cost: 12 },
    np: { name: 'Shadow of the Grail', kind: 'rain', count: 1, spread: 0, zr: 150, delay: 0.8, dmg: 16, root: 1.5, zshape: 'tentacle', range: 620, wind: 0.6, act: 0.1, rec: 0.5, cost: 0, cd: 22, aiUse: 'ranged' } });
MASTERS.tokiomi = MD({ id: 'tokiomi', name: 'Tokiomi Tohsaka', type: 'Mage family', col: '#b8333c', hp: 100, spd: 200, guard: 0.35, elegance: true,
    brief: 'Head of the Tohsaka, a mage of fire who never loses his composure. Flame bolts from his ruby cane, a ring of fire around him and a pillar of flame from the ground: every flame leaves a burn. While he is unhurt, his magecraft costs a quarter less mana.',
    light: { name: 'Flame bolt', kind: 'proj', speed: 980, range: 580, dmg: 4, burn: { dps: 2, t: 2.5 }, wind: 0.3, rec: 0.3, reach: 0, lunge: 0, cost: 10, shape: 'flame', size: 7, col: '#ff7a2a' },
    heavy: { name: 'Fireball', kind: 'proj', speed: 820, range: 640, dmg: 8, rad: 12, burn: { dps: 3, t: 3 }, explode: { r: 90, dmg: 8 }, wind: 0.5, max: 1.0, rec: 0.7, reach: 0, lunge: 0, cost: 22, shape: 'flame', size: 12, col: '#ff5a1a' },
    skill: { name: 'Flame Ward', kind: 'aoe', r: 135, dmg: 5, burn: { dps: 3, t: 4 }, stag: 0.4, power: 1, wind: 0.35, act: 0.1, rec: 0.35, cd: 11, cost: 14 },
    np: { name: 'Crimson Pillar', kind: 'rain', count: 1, spread: 0, zr: 105, delay: 0.75, dmg: 15, burn: { dps: 4, t: 4 }, zshape: 'pillar', range: 640, wind: 0.55, act: 0.1, rec: 0.5, cost: 0, cd: 20, aiUse: 'ranged' } });
MASTERS.kuzuki = MD({ id: 'kuzuki', name: 'Souichirou Kuzuki', type: 'Outsider', col: '#5b6b7c', wpn: 'fist', hp: 120, spd: 228, guard: 0.55, ranged: false, fightsServants: true, guardPierce: 0.35, combo: 4,
    brief: 'A quiet teacher who was trained as an assassin. His Snake Fist strikes curl around a guard, and like Shirou he stands in a servant\u2019s fight at full damage. Reinforcement hardens his fists; Coiled Strike is a grip no guard can stop.',
    light: { name: 'Snake Fist', kind: 'melee', dmg: 4.5, reach: 74, arc: 0.85, wind: 0.16, act: 0.06, rec: 0.16, lunge: 38, cost: 7, stag: 0.28, power: 1 },
    heavy: { name: 'Coiled elbow', kind: 'melee', dmg: 12, reach: 82, arc: 0.9, wind: 0.4, max: 0.85, act: 0.1, rec: 0.55, lunge: 70, cost: 20, stag: 0.7, power: 2, gb: true },
    skill: { name: 'Reinforcement', kind: 'reinforce', dur: 5, wind: 0.25, act: 0.05, rec: 0.2, cd: 13, cost: 12 },
    np: { name: 'Coiled Strike', kind: 'grab', reach: 96, arc: 0.7, dmg: 22, stag: 1.0, unblock: true, noParry: true, noExec: true, wind: 0.35, act: 0.08, rec: 0.6, cost: 0, cd: 18, aiUse: 'near' } });
MASTERS.caren = MD({ id: 'caren', name: 'Caren Hortensia', type: 'Church', col: '#e8e4ec', hp: 90, spd: 200, guard: 0.3, stigmata: true, noCircuits: true, ranged: false, combo: 3,
    brief: 'A sister of the Church with no magic circuits at all, so Origin Rounds have nothing to burn. She fights with the Shroud of Magdalene, a red ribbon that lashes and whirls around her and binds a man longer than a woman. Her Stigmata feel hidden Assassins and raging Berserkers through walls, at a slow cost in blood; Sacrament mends her and her servant.',
    light: { name: 'Shroud lash', kind: 'melee', dmg: 4, reach: 125, aiWant: 95, arc: 0.6, wind: 0.2, act: 0.07, rec: 0.22, lunge: 10, cost: 7, stag: 0.25, power: 1 },
    heavy: { name: 'Shroud whirl', kind: 'melee', dmg: 9, reach: 115, arc: 3.14, wind: 0.45, max: 1.0, act: 0.14, rec: 0.6, lunge: 0, cost: 20, stag: 0.5, power: 2 },
    skill: { name: 'Shroud of Magdalene', kind: 'proj', speed: 1000, range: 560, dmg: 2, root: 1.6, rootF: 0.8, wind: 0.35, act: 0.05, rec: 0.35, cd: 15, cost: 16, shape: 'shroud', size: 9, col: '#c8283a', aiRange: [140, 520] },
    np: { name: 'Sacrament', kind: 'sacrament', self: 34, amount: 40, range: 380, wind: 0.6, act: 0.05, rec: 0.4, cost: 0, cd: 22, aiUse: 'mend' } });
MASTERS.ryuunosuke = MD({ id: 'ryuunosuke', name: 'Ryuunosuke Uryuu', type: 'Outsider', col: '#e07a3a', wpn: 'dagger', hp: 95, spd: 212, guard: 0.3, ranged: false, combo: 3, harmMana: true,
    brief: 'A cheerful killer with no magecraft at all. He earns mana only by doing harm: every wound he or his servant deals pays a little, every kill pays more, and nothing comes back on its own. By day he can vanish into a crowd; his Masterpiece, from behind, finishes a weakened master.',
    light: { name: 'Knife', kind: 'melee', dmg: 5, reach: 70, arc: 0.9, wind: 0.15, act: 0.06, rec: 0.18, lunge: 40, cost: 6, stag: 0.3, power: 1 },
    heavy: { name: 'Lunging stab', kind: 'melee', dmg: 12, reach: 80, arc: 0.7, wind: 0.4, max: 0.9, act: 0.1, rec: 0.55, lunge: 110, cost: 20, stag: 0.6, power: 2, bleed: { dps: 2, t: 3 } },
    skill: { name: 'Fade into the Crowd', kind: 'fade', dur: 5, wind: 0.2, act: 0.05, rec: 0.2, cd: 16, cost: 10 },
    np: { name: 'Masterpiece', kind: 'grab', reach: 100, arc: 0.8, dmg: 14, vsServant: 0.4, execAt: 0.4, execMasters: true, behind: true, stag: 0.8, unblock: true, noParry: true, wind: 0.3, act: 0.08, rec: 0.6, cost: 0, cd: 22, aiUse: 'stalk' } });
MASTERS.illya.A = build(MASTERS.illya); MASTERS.sakura.A = build(MASTERS.sakura); MASTERS.tokiomi.A = build(MASTERS.tokiomi); MASTERS.kuzuki.A = build(MASTERS.kuzuki); MASTERS.caren.A = build(MASTERS.caren); MASTERS.ryuunosuke.A = build(MASTERS.ryuunosuke);
var MASTER_ORDER = ['rin', 'kiritsugu', 'shirou', 'kayneth', 'kirei', 'waver', 'irisviel', 'kariya', 'illya', 'sakura', 'tokiomi', 'kuzuki', 'caren', 'ryuunosuke'];
/* Arena mode keeps the duel-length numbers: copies taken before the war scaling below */
var SERV_DUEL = {}; Object.keys(SERV).forEach(function (k) { SERV_DUEL[k] = Object.assign({}, SERV[k]); });
Object.keys(SERV).forEach(function (k) { SERV[k].hp = Math.round(SERV[k].hp * 2.0); });
/* war balance from tools/sim.js reports: multipliers on top of the duel values */
var WAR_TUNE = { gilgamesh: { hp: 0.82 }, richard: { dmg: 1.12, hp: 1.05 }, heracles: { hp: 1.5 }, leonidas: { spd: 1.08, hp: 1.03 }, lancelot: { hp: 1.3 }, hassan: { dmg: 1.2, hp: 1.15 }, diarmuid: { hp: 1.05 }, kojirou: { dmg: 0.95 }, emiya: { hp: 1.08 }, medea: { hp: 1.2, dmg: 1.3 }, iskandar: { dmg: 1.04 }, atalanta: { hp: 1.1 }, medusa: { hp: 1.05 }, cu: { dmg: 0.95 } };
// masters, from the same reports
var MASTER_TUNE = { rin: { hp: 1.1 }, kariya: { hp: 1.2 }, waver: { hp: 1.35 }, shirou: { hp: 1.15 }, irisviel: { hp: 0.9 }, illya: { hp: 0.92 } };
Object.keys(MASTER_TUNE).forEach(function (k) { MASTERS[k].hp = Math.round(MASTERS[k].hp * MASTER_TUNE[k].hp); });
var WAR_MELEE_RANGED_TAKEN = 0.8, ARCHER_INDEPENDENT = 75, ORPHAN_TIME = 30;
Object.keys(WAR_TUNE).forEach(function (k) { var t = WAR_TUNE[k], d = SERV[k]; if (t.hp) d.hp = Math.round(d.hp * t.hp); if (t.dmg) d.dmg = Math.round(d.dmg * t.dmg * 100) / 100; if (t.spd) d.spd = Math.round(d.spd * t.spd); });
Object.keys(MASTERS).forEach(function (k) { MASTERS[k].A = build(MASTERS[k]); });
(function () { var sh = MASTERS.shirou, t1 = Object.assign({}, sh, {
  light: { name: 'Kanshou & Bakuya', kind: 'melee', dmg: 6, reach: 84, arc: 1.0, wind: 0.2, act: 0.08, rec: 0.18, lunge: 36, cost: 7, stag: 0.32, power: 1 },
  heavy: { name: 'Overedge', kind: 'melee', dmg: 17, reach: 108, arc: 1.15, wind: 0.45, max: 1.0, act: 0.14, rec: 0.6, lunge: 80, cost: 22, stag: 0.7, power: 2, gb: true, vsServant: 0.7 } });
  sh.A1 = build(t1);
  sh.A2 = build(Object.assign({}, t1, { np: { name: 'Unlimited Blade Works', short: 'UBW', kind: 'ubw', wind: 1.4, act: 0.2, rec: 0.6, dmg: 0, cost: 0, dur: 11, ubwRate: 0.6, rain: 2, rainDmg: 8, cd: 30, aiUse: 'ubw', sword: { speed: 1000, dmg: 6, shape: 'blade', rad: 6, home: 3.5, vsServant: 0.8 } } }));
})();
var CLASSES = ['Saber', 'Archer', 'Lancer', 'Rider', 'Caster', 'Assassin', 'Berserker'];
function shuffled(a, rnd) { a = a.slice(); rnd = rnd || Math.random; for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
// one team per class: the player's team first, then one random servant of every other class, each with a different master
function warTeams(myServ, myMaster, nTeams, rnd) {
  rnd = rnd || Math.random; var mine = SERV[myServ] || SERV[ORDER[0]], teams = [{ servant: mine, master: MASTERS[myMaster] || MASTERS[MASTER_ORDER[0]] }];
  var cls = shuffled(CLASSES.filter(function (c) { return c !== mine.cls; }), rnd).slice(0, Math.max(1, Math.min(6, nTeams - 1)));
  var ms = shuffled(MASTER_ORDER.filter(function (m) { return m !== teams[0].master.id; }), rnd);
  cls.forEach(function (c, i) { var pool = ORDER.filter(function (id) { return SERV[id].cls === c; }); teams.push({ servant: SERV[pool[Math.floor(rnd() * pool.length)]], master: MASTERS[ms[i % ms.length]] }); });
  return teams;
}
var ORDER = ['caerwyn', 'richard', 'leonidas', 'atalanta', 'emiya', 'heracles', 'hassan', 'diarmuid', 'cu', 'gilgamesh', 'iskandar', 'gilles', 'lancelot', 'medusa', 'medea', 'kojirou'];

