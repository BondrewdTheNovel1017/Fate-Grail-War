/* ---- action tables ---- */
var BASE = {
  light: { kind: 'melee', wind: 0.26, act: 0.08, rec: 0.2, dmg: 8, reach: 100, arc: 0.9, cost: 7, stag: 0.32, power: 1, lunge: 34 },
  heavy: { kind: 'melee', wind: 0.45, max: 1.0, act: 0.14, rec: 0.62, dmg: 22, reach: 115, arc: 1.0, cost: 20, stag: 0.6, power: 2, gb: true, lunge: 70 }
};
function build(def) {
  var A = {};
  A.light = Object.assign({}, BASE.light, def.light || {}, { key: 'light' });
  if (def.lightSeq) { A.lightSeq = def.lightSeq.map(function (sp) { return Object.assign({}, BASE.light, sp, { key: 'light' }); }); A.light = A.lightSeq[0]; }
  A.heavy = Object.assign({}, BASE.heavy, def.heavy || {}, { key: 'heavy' });
  A.skill = Object.assign({ wind: 0.3, act: 0.1, rec: 0.4, dmg: 0, cost: 12, stag: 0.5, power: 1, arc: 1, reach: 100 }, def.skill, { key: 'skill' });
  A.np = Object.assign({ wind: 1.2, act: 0.2, rec: 0.9, dmg: 40, cost: 0, stag: 0.9, power: 3, unblock: true, arc: 1 }, def.np, { key: 'np' });
  if (A.np.kind === 'ubw') A.np.sword = Object.assign({ kind: 'proj', key: 'np', power: 1, stag: 0.15, cost: 0, arc: 0 }, def.np.sword);
  ['light', 'heavy', 'np'].forEach(function (k) { if (A[k].kind === 'barrage') A[k].bullet = Object.assign({}, A[k], { kind: 'proj', unblock: false, power: 1, key: k }); });
  if (def.arms) A.arms = def.arms.map(function (m) { return { id: m.id, name: m.name, wpn: m.wpn, mag: m.mag, aiWant: m.aiWant, light: Object.assign({}, BASE.light, m.light, { key: 'light' }), heavy: Object.assign({}, BASE.heavy, m.heavy, { key: 'heavy' }) }; });
  // seized guns fire bursts: each burst needs its bullet, built as for any barrage
  if (A.arms) A.arms.forEach(function (m) { ['light', 'heavy'].forEach(function (k) { if (m[k].kind === 'barrage') m[k].bullet = Object.assign({}, m[k], { kind: 'proj', unblock: false, power: 1, key: k }); }); });
  return A;
}
var SERV = {
  richard: { id: 'richard', name: 'Richard the Lionheart', cls: 'Saber', col: '#d9563a', wpn: 'sword', lionheart: true, hp: 205, spd: 228, dmg: 1.05, guard: 0.7, combo: 3, recMul: 1,
    brief: 'The Lionheart. Anything he holds becomes Excalibur for an instant, and his Noble Phantasm sets the field ablaze.',
    light: { reach: 114 }, heavy: { reach: 130 },
    skill: { name: 'Excalibur', kind: 'proj', wave: true, beam: true, bw: 0.45, speed: 2200, range: 700, dmg: 26, power: 2, gb: true, wind: 0.7, act: 0.08, rec: 1.1, cd: 9, cost: 16, stag: 0.7, breakT: 2.5, aiRange: [200, 640], desc: 'Whatever he holds becomes Excalibur for an instant: a short beam of light, then the blade shatters under the strain. He cannot attack or block until it reforms.' },
    np: { name: 'Utopie Purgatoire', kind: 'melee', wind: 1.3, act: 0.2, rec: 1.0, dmg: 44, reach: 300, arc: 0.9, lunge: 60, stag: 1.0, burn: { dps: 5, t: 5 }, aiMin: 0, aiMax: 300, desc: 'A sweeping wave of holy flame in a wide cone. Cannot be blocked, and leaves you burning.' } },
  leonidas: { id: 'leonidas', name: 'Leonidas', cls: 'Lancer', col: '#e0b25a', wpn: 'spear', guardEcon: 0.75, hp: 215, spd: 200, dmg: 1.3, guard: 0.88, combo: 2, recMul: 1.1,
    brief: 'Immovable defender. Long reach, huge guard, and a wall of shields.',
    light: { reach: 135, wind: 0.3, rec: 0.26, dmg: 9 }, heavy: { reach: 150, wind: 0.5, dmg: 24 },
    skill: { name: 'Shield Bash', kind: 'melee', wind: 0.3, act: 0.1, rec: 0.42, dmg: 7, reach: 100, cd: 5, cost: 12, stag: 0.8, gb: true, desc: 'A short shield strike that breaks a guard and staggers.' },
    np: { name: 'Thermopylae Enomotia', sub: 'The Hot Gates', kind: 'wall', wind: 0.9, act: 0.1, rec: 0.4, dmg: 0, dur: 5, aiMin: 0, aiMax: 420, desc: 'Deals no damage. For 5 seconds a shield wall takes most of the damage, resists staggering, stops arrows and slows the enemy near him.' } },
  atalanta: { id: 'atalanta', name: 'Atalanta', cls: 'Archer', col: '#7ad39a', wpn: 'bow', dodgeRate: 1.35, hp: 140, spd: 204, dmg: 0.96, guard: 0.5, combo: 2, recMul: 0.9, ranged: true,
    brief: 'Fast skirmisher. Shoots from range, hops away when pressed.',
    light: { kind: 'proj', speed: 760, range: 560, dmg: 6, wind: 0.34, rec: 0.3, reach: 0, lunge: 0, cost: 11 },
    heavy: { kind: 'proj', speed: 1100, range: 760, dmg: 18, wind: 0.5, max: 1.0, rec: 0.7, lunge: 0, cost: 22 },
    skill: { name: 'Backstep Shot', kind: 'proj', hop: 170, speed: 1000, range: 600, wind: 0.26, act: 0.06, rec: 0.25, dmg: 11, cd: 3.5, cost: 12, stag: 0.4, desc: 'Leap back and loose an arrow. Her escape and her opener.' },
    np: { name: 'Phoebus Catastrophe', sub: 'Complaint Message on the Arrow', kind: 'rain', wind: 1.0, act: 0.2, rec: 0.8, dmg: 13, count: 6, spread: 170, zr: 80, delay: 0.85, gb: true, unblock: false, aiMin: 160, aiMax: 620, desc: 'Arrow circles mark the ground, then land. Read them and move.' } },
  heracles: { id: 'heracles', name: 'Heracles', cls: 'Berserker', col: '#e2515c', wpn: 'club', godHand: true, ghRegen: true, hp: 158, spd: 205, dmg: 0.84, guard: 0.73, combo: 2, recMul: 1.1, armor: true,
    brief: 'Hyper armor on every swing. Light hits will not stop him. Slow to turn.',
    light: { wind: 0.34, rec: 0.3, dmg: 9, reach: 125, armor: true, arc: 1.0 }, heavy: { wind: 0.6, max: 1.15, dmg: 22, reach: 135, rec: 0.78, armor: true },
    skill: { name: 'Stone Slam', kind: 'aoe', wind: 0.55, act: 0.1, rec: 0.6, dmg: 12, r: 150, cd: 7, cost: 14, stag: 0.55, gb: true, armor: true, desc: 'A ground slam all around him. Armored. Breaks guards.' },
    np: { name: 'Nine Lives', sub: 'Shooting the Nine Heads', kind: 'pulses', swings: true, reach: 150, arc: 1.25, chase: 560, wind: 1.3, act: 1.26, rec: 1.0, dmg: 5, pulses: 9, interval: 0.14, r: 160, leap: 190, armor: true, unblock: false, aiMin: 0, aiMax: 230, desc: 'He leaps and nine blows land in a storm around him. Armored throughout.' } },
  caerwyn: { id: 'caerwyn', name: 'King Arthur', cls: 'Saber', col: '#dfeaf4', wpn: 'sword', momMul: 1.2, hiddenReach: 1.1, hp: 205, spd: 218, dmg: 1.1, guard: 0.78, combo: 3, recMul: 1,
    brief: 'A sovereign swordswoman. Her blade hides in wind, which she can release as a cutting gust, and ends it with Excalibur\'s golden light.',
    light: { reach: 108 }, heavy: { reach: 122 },
    skill: { name: 'Strike Air', kind: 'proj', shape: 'wind', wind: 0.3, act: 0.14, rec: 0.35, lunge: 120, speed: 1700, range: 470, dmg: 22, rad: 26, stag: 0.6, power: 2, cd: 9, cost: 12, reach: 0, desc: 'She dashes in and releases the wind that hides her sword: a thin cone of compressed air that hits hard at range. For a moment the golden blade shows, then the wind wraps around it again.' },
    np: { name: 'Excalibur', sub: 'Sword of Promised Victory', kind: 'proj', wave: true, beam: true, wind: 1.8, act: 0.1, rec: 1.3, dmg: 45, pillar: { r: 130, delay: 0.35, dmg: 30, zshape: 'excal', key: 'np' }, speed: 2400, range: 1100, stag: 1.0, aiMin: 240, aiMax: 800, desc: 'A beam of golden light that stops on the first one it strikes; a moment later a pillar of light rises there, hurting everyone in it. Cannot be blocked. Dodge at the moment it fires, step out of the circle, or hide behind cover.' } },
  diarmuid: { id: 'diarmuid', name: 'Diarmuid Ua Duibhne', cls: 'Lancer', col: '#4fa860', wpn: 'spear', hp: 190, spd: 236, dmg: 1.0, guard: 0.6, combo: 3, recMul: 0.95, guardPierce: 0.4,
    brief: 'Twin-spear duelist. Cursed wounds that keep bleeding and strikes that gnaw through a guard.',
    light: { reach: 140, wind: 0.25 }, heavy: { reach: 156 },
    skill: { name: 'Gae Buidhe', kind: 'melee', wind: 0.28, act: 0.1, rec: 0.45, dmg: 8, reach: 132, arc: 0.5, cd: 5, cost: 10, stag: 0.35, lunge: 40, bleed: { dps: 4, t: 6 }, desc: 'A thrust with the yellow spear. The wound it leaves will not close, and bleeds for 6 seconds.' },
    np: { name: 'Gae Dearg and Gae Buidhe', sub: 'Crimson Rose of Exorcism, Yellow Rose of Mortality', kind: 'charge', wind: 0.95, act: 0.35, rec: 0.9, dmg: 30, dist: 560, reach: 52, aiMin: 180, aiMax: 520, bleed: { dps: 5, t: 8 }, desc: 'Both spears at once in a rush down the lane. Cannot be blocked, and leaves a wound that bleeds for 8 seconds.' } },
  cu: { id: 'cu', name: 'Cú Chulainn', cls: 'Lancer', col: '#3f86d9', wpn: 'spear', hp: 195, spd: 240, dmg: 1.04, guard: 0.6, combo: 3, recMul: 1, arrowRes: 0.4, bc: true,
    brief: 'Hound of Ulster. Rune fire, a spear that cannot miss, and the will to keep fighting.',
    light: { reach: 128 }, heavy: { reach: 142 },
    skill: { name: 'Rune of Fire', kind: 'rain', wind: 0.4, act: 0.1, rec: 0.4, dmg: 10, count: 3, spread: 110, zr: 86, delay: 0.7, zshape: 'flame', cd: 7, cost: 12, gb: false, aiRange: [140, 520], desc: 'Three runes flare under the enemy and burst into flame a moment later.' },
    np: { name: 'Gáe Bulg', sub: 'Soaring Spear that Strikes with Death', kind: 'proj', shape: 'spear', wind: 1.3, act: 0.1, rec: 1.1, dmg: 14, speed: 1500, range: 1000, rad: 10, hop: 130, pierce: true, noParry: true, explode: { r: 170, dmg: 34, big: true, unblock: true }, aiMin: 220, aiMax: 900, desc: 'He leaps back and hurls the spear. It explodes where it lands, and nothing blocks the blast.' } },
  gilgamesh: { id: 'gilgamesh', name: 'Gilgamesh of Uruk', cls: 'Archer', col: '#e8bf4a', wpn: 'gate', ranged: true, hp: 200, spd: 220, dmg: 0.95, guard: 0.45, combo: 3, recMul: 1, momMul: 1.25, dmgTaken: 0.9,
    brief: 'A king with no weapon in his hands. Golden gates open around him and rain blades, then a wave of destruction ends the fight.',
    light: { kind: 'proj', gate: true, shape: 'blade', speed: 1050, range: 640, dmg: 6, wind: 0.3, rec: 0.28, reach: 0, lunge: 0, cost: 11 },
    heavy: { name: 'Triple Gate', kind: 'volley', gate: true, shape: 'blade', count: 3, spread: 0.1, speed: 1200, range: 760, dmg: 7, wind: 0.5, max: 1.0, rec: 0.7, reach: 0, lunge: 0, cost: 22, stag: 0.4 },
    skill: { name: 'Enkidu', sub: 'Chains of Heaven', kind: 'proj', shape: 'chain', gate: true, speed: 1600, range: 520, rad: 10, dmg: 5, wind: 0.28, act: 0.06, rec: 0.4, cd: 9, cost: 12, power: 1, stag: 0, unblock: true, noParry: true, bind: 1.1, aiRange: [0, 460], desc: 'Golden chains shoot from a gate and bind whoever they catch for about a second (half again as long on a divine servant). They cannot be blocked, only dodged. His way of getting a melee fighter off him.' },
    np: { breaksMarble: true, name: 'Enuma Elish', sub: 'The Star of Creation that Split Heaven and Earth', kind: 'aoe', wind: 2.3, act: 0.25, rec: 1.3, dmg: 100, r: 340, stag: 1.2, aiMin: 0, aiMax: 320, desc: 'A ring of destruction around him, with a long cast. Cannot be blocked. Leave the circle or dodge as it lands.' } },
  iskandar: { id: 'iskandar', name: 'Iskandar of Macedon', cls: 'Rider', col: '#c43d3d', wpn: 'sword', hp: 222, spd: 196, dmg: 1.08, guard: 0.7, combo: 2, recMul: 1.05, staRegen: 1.25,
    brief: 'A conqueror who leads from the front. Armored chariot rush and a charge of his whole army.',
    light: { reach: 104 }, heavy: { reach: 118 },
    skill: { name: 'Gordius Wheel', kind: 'charge', wind: 0.45, act: 0.25, rec: 0.7, dmg: 16, dist: 340, reach: 62, cd: 7, cost: 16, stag: 0.7, gb: true, armor: true, aiRange: [180, 420], desc: 'The chariot thunders forward in an armored rush. It breaks guards and cannot be stopped by light hits.' },
    np: { name: 'Ionioi Hetairoi', sub: 'Army of the King', kind: 'charge', marble: 'ionioi', wind: 1.5, act: 0.8, rec: 1.0, dmg: 46, dist: 900, reach: 130, aiMin: 250, aiMax: 800, desc: 'He calls his reality marble, a sunlit desert, and his whole army charges with him down a wide lane. The desert stays for the rest of the match, and inside it his next charge comes much faster.' } },
  gilles: { id: 'gilles', name: 'Gilles de Rais', cls: 'Caster', col: '#6fb3a0', wpn: 'tome', ranged: true, hp: 172, spd: 212, dmg: 0.88, guard: 0.48, combo: 3, recMul: 1, stagMul: 0.75,
    brief: 'A summoner of horrors. Calls tentacles up from the ground to cover the arena.',
    lightSeq: [
      { name: 'Abyssal Bolt', tag: 'Bolt', kind: 'proj', speed: 780, range: 540, dmg: 6, wind: 0.3, rec: 0.28, reach: 0, lunge: 0, cost: 9, shape: 'orb', size: 8, col: '#4fb7a0' },
      { name: 'Twin Horrors', tag: 'Twin', kind: 'volley', count: 2, spread: 0.34, speed: 640, range: 480, dmg: 5, wind: 0.34, rec: 0.32, reach: 0, lunge: 0, cost: 11, shape: 'orb', size: 9, col: '#3f9d86', stag: 0.2 },
      { name: 'Writhing Mass', tag: 'Mass', kind: 'proj', speed: 400, range: 540, dmg: 12, rad: 20, wind: 0.5, rec: 0.5, reach: 0, lunge: 0, cost: 15, shape: 'orb', size: 18, col: '#2c7c6a', stag: 0.45 }
    ],
    heavy: { name: 'Grasp of the Deep', tag: 'Grasp', kind: 'rain', count: 2, spread: 60, zr: 66, delay: 0.55, zshape: 'tentacle', dmg: 13, wind: 0.5, max: 1.0, rec: 0.7, cost: 22, reach: 0, lunge: 0 },
    skill: { name: 'Sea Horrors', kind: 'rain', wind: 0.5, act: 0.1, rec: 0.45, dmg: 15, count: 3, spread: 120, zr: 84, delay: 0.7, zshape: 'tentacle', cd: 5, cost: 12, aiRange: [140, 520], desc: 'Three horrors rise from the ground under the enemy after a short delay.' },
    np: { name: "Prelati's Spellbook", kind: 'rain', wind: 1.4, act: 0.2, rec: 1.0, dmg: 16, count: 8, spread: 230, zr: 90, delay: 0.95, zshape: 'tentacle', gb: true, aiMin: 120, aiMax: 560, desc: 'Eight horrors burst from the ground across a wide area. Watch the circles and keep moving.' } },
  lancelot: { id: 'lancelot', name: 'Lancelot du Lac', cls: 'Berserker', col: '#7d7fb5', wpn: 'fist', hp: 200, spd: 236, dmg: 1.03, guard: 0.43, combo: 4, recMul: 0.9, momMul: 1.3,
    brief: 'The black knight, lost to madness. Bare fists until he seizes a weapon (blades, a hammer, even an MP5 or a shotgun), and a stolen minigun for a Noble Phantasm.',
    light: { reach: 80, wind: 0.2, rec: 0.18, dmg: 7, lunge: 30, cost: 6 }, heavy: { reach: 98, dmg: 19, wind: 0.42, rec: 0.58, lunge: 60 },
    arms: [
      { id: 'sword', name: 'Longsword', wpn: 'sword', light: { reach: 122, dmg: 9, wind: 0.24, cost: 7 }, heavy: { reach: 138, dmg: 25, wind: 0.46 } },
      { id: 'spear', name: 'Spear', wpn: 'spear', light: { reach: 152, dmg: 8, wind: 0.26, arc: 0.5, lunge: 40, cost: 7 }, heavy: { reach: 170, dmg: 22, wind: 0.46, arc: 0.55 } },
      { id: 'hammer', name: 'Warhammer', wpn: 'club', light: { reach: 108, dmg: 12, wind: 0.34, rec: 0.3, cost: 9 }, heavy: { reach: 124, dmg: 34, wind: 0.64 } },
      // seized guns: each comes with its own magazine and reloads like Kiritsugu's
      { id: 'mp5', name: 'MP5', wpn: 'gun', mag: { size: 30, reload: 2.0 }, aiWant: 300,
        light: { name: 'MP5 burst', kind: 'barrage', ammo: true, act: 0.24, rate: 0.08, dmg: 2.2, speed: 1700, range: 560, spread: 0.06, wind: 0.12, rec: 0.2, max: 0, reach: 0, lunge: 0, cost: 4, shape: 'tracer', stag: 0.05, gb: false },
        heavy: { name: 'MP5 long burst', kind: 'barrage', ammo: true, act: 1.0, rate: 0.07, dmg: 2.0, speed: 1700, range: 600, spread: 0.1, wind: 0.3, rec: 0.5, max: 0, reach: 0, lunge: 0, cost: 14, shape: 'tracer', stag: 0.05, gb: false } },
      { id: 'shotgun', name: 'Shotgun', wpn: 'gun', mag: { size: 6, reload: 2.4 }, aiWant: 170,
        light: { name: 'Shotgun blast', kind: 'volley', ammo: true, shells: 1, count: 6, spread: 0.11, dmg: 3, speed: 1500, range: 300, wind: 0.22, rec: 0.42, max: 0, reach: 0, lunge: 0, cost: 8, shape: 'tracer', stag: 0.3 },
        heavy: { name: 'Both barrels', kind: 'volley', ammo: true, shells: 2, count: 10, spread: 0.1, dmg: 3.2, speed: 1500, range: 280, wind: 0.42, rec: 0.7, max: 0, reach: 0, lunge: 0, cost: 16, shape: 'tracer', stag: 0.6, power: 2 } }
    ],
    skill: { name: 'Seize Arms', kind: 'arm', wind: 0.35, act: 0.1, rec: 0.4, dmg: 0, cost: 12, cd: 11, dur: 9, desc: 'He snatches a weapon from the nearest thing: a sword, a spear, a warhammer, an MP5 or a shotgun, each turned black and veined with red. For 9 seconds it replaces his fists as his light and heavy attacks. The guns come loaded and reload when empty.' },
    np: { name: 'Knight of Owner', sub: 'A Knight Does Not Die Empty-Handed', kind: 'barrage', wind: 1.1, act: 1.4, rec: 0.9, dmg: 2.7, speed: 1500, range: 760, rate: 0.055, spread: 0.07, track: 1.5, power: 1, noStag: true, kb: 14, hs: 0.012, stag: 0.1, unblock: false, shape: 'tracer', aiMin: 140, aiMax: 600, desc: 'He turns a machine gun into a Noble Phantasm and sprays a stream of bullets, tracking you slowly.' } },
  medusa: { id: 'medusa', name: 'Medusa', cls: 'Rider', col: '#d96bb8', wpn: 'chain', hp: 188, spd: 262, dmg: 1.12, guard: 0.5, combo: 4, recMul: 0.9, gazeSlow: 0.82,
    brief: 'A fast gorgon who fights with a spiked rondel on a chain. Her gaze slows you, and her chain hooks you in.',
    light: { reach: 126, wind: 0.22, arc: 0.85 }, heavy: { reach: 142 },
    skill: { name: 'Chain Hook', kind: 'proj', pull: true, shape: 'rondel', speed: 1500, range: 480, dmg: 9, power: 1, wind: 0.3, act: 0.05, rec: 0.6, cd: 6.5, cost: 12, stag: 0.55, aiRange: [200, 470], desc: 'She throws the rondel on its chain. If it hits, the chain drags her straight to you, and her next light strike lands 50% harder.' },
    np: { name: 'Bellerophon', sub: 'Bridle of Chivalry', kind: 'charge', wind: 1.2, act: 0.55, rec: 1.0, dmg: 42, dist: 950, reach: 70, diveI: 0.3, aiMin: 300, aiMax: 850, desc: 'She rises and dives down the lane, untouchable at the moment of the dive. Cannot be blocked.' } },
  emiya: { id: 'emiya', name: 'EMIYA', cls: 'Archer', col: '#c4423a', wpn: 'dagger', hp: 200, spd: 228, dmg: 1.06, guard: 0.72, combo: 4, recMul: 0.92, guardEcon: 0.75, blockMom: 9,
    brief: 'A heroic spirit of the future. Twin married swords up close, an exploding arrow from range, and a world of swords to finish.',
    light: { reach: 104, wind: 0.22, arc: 1.0 }, heavy: { reach: 116 },
    skill: { name: 'Caladbolg II', kind: 'proj', shape: 'drill', speed: 1700, range: 950, dmg: 8, rad: 8, power: 2, wind: 0.9, act: 0.06, rec: 0.6, cd: 9, cost: 16, stag: 0.6, explode: { r: 140, dmg: 24 }, aiRange: [260, 900], desc: 'He draws a black bow, charges a twisted sword-arrow and fires. It explodes on impact.' },
    np: { name: 'Unlimited Blade Works', sub: 'Infinite Creation of Swords', kind: 'ubw', wind: 1.5, act: 0.2, rec: 0.6, dmg: 0, dur: 8, ubwRate: 0.55, rain: 3, rainDmg: 9, sword: { speed: 1250, dmg: 5, shape: 'blade', rad: 4 }, aiMin: 0, aiMax: 900, desc: 'His reality marble: a burning field of swords. Swords rain on his enemies, then for 8 seconds blades float around him and fire at the nearest enemy.' } },
  medea: { id: 'medea', name: 'Medea of Colchis', cls: 'Caster', col: '#7fc4ee', wpn: 'staff', hp: 150, spd: 216, dmg: 0.72, guard: 0.4, combo: 3, recMul: 0.95, cdRate: 1.35, ranged: true,
    brief: 'A sorceress who casts from range. Rapid spells, and a dagger that strips every enchantment.',
    lightSeq: [
      { name: 'Arcane Bolt', tag: 'Bolt', kind: 'proj', speed: 900, range: 580, dmg: 5, wind: 0.28, rec: 0.26, reach: 0, lunge: 0, cost: 9, shape: 'orb', size: 7, col: '#8fd0f5' },
      { name: 'Fan of Sparks', tag: 'Fan', kind: 'volley', count: 3, spread: 0.2, speed: 840, range: 520, dmg: 3.4, wind: 0.34, rec: 0.34, reach: 0, lunge: 0, cost: 12, shape: 'orb', size: 6, col: '#d4ecff', stag: 0.15 },
      { name: "Hecate's Orb", tag: 'Orb', kind: 'proj', speed: 470, range: 620, dmg: 10, rad: 16, wind: 0.5, rec: 0.5, reach: 0, lunge: 0, cost: 15, shape: 'orb', size: 15, col: '#4f9ad6', stag: 0.4 }
    ],
    heavy: { name: "Hecate's Lance", tag: 'Lance', kind: 'proj', speed: 1000, range: 720, dmg: 16, wind: 0.5, max: 1.0, rec: 0.7, lunge: 0, cost: 22, shape: 'orb', size: 11, col: '#e8f6ff' },
    skill: { name: 'High-Speed Divine Words', kind: 'volley', count: 3, spread: 0.12, speed: 1200, range: 680, dmg: 6, wind: 0.35, act: 0.05, rec: 0.35, cd: 4, cost: 10, stag: 0.25, shape: 'orb', desc: 'Three spells fired almost at once, with no incantation to read.' },
    np: { name: 'Rule Breaker', sub: 'All Spells Must Be Broken', kind: 'proj', speed: 1500, range: 780, dmg: 24, wind: 1.6, act: 0.1, rec: 0.8, strip: true, stag: 0.9, shape: 'blade', momLock: 25, aiMin: 150, aiMax: 720, desc: 'A long incantation, then a hurled dagger. It cannot be blocked, and if it lands it breaks every enchantment on the target and drains their momentum. In the Grail War it cuts a servant\'s contract: for 5 seconds the servant fights for Medea and turns on its own master. Afterwards her momentum cannot build for 25 seconds.' } },
  kojirou: { id: 'kojirou', name: 'Sasaki Kojirou', cls: 'Assassin', col: '#e9b8cc', wpn: 'sword', hp: 180, spd: 236, dmg: 1.1, guard: 0.55, combo: 3, recMul: 1, parryWin: 0.27,
    brief: 'A swordsman without a master. The longest blade in the roster, and three cuts at once.',
    light: { reach: 150, wind: 0.26 }, heavy: { reach: 166 },
    skill: { name: 'Iaido Draw', kind: 'melee', wind: 0.16, act: 0.06, rec: 0.5, dmg: 15, reach: 196, arc: 0.35, cd: 4.5, cost: 10, stag: 0.5, desc: 'A lightning draw with a very narrow arc. It reaches far and is very fast.' },
    np: { name: 'Tsubame Gaeshi', sub: 'Secret Sword: Swallow Reversal', kind: 'pulses', wind: 0.7, act: 0.3, rec: 1.0, dmg: 15, pulses: 3, interval: 0.07, r: 150, unblock: true, aiMin: 0, aiMax: 160, desc: 'Three cuts from three directions at once. Cannot be blocked or parried. Your only answers are distance or a dodge.' } },
  hassan: { id: 'hassan', name: 'Hassan of the Cursed Arm', cls: 'Assassin', col: '#9aa7b3', wpn: 'dagger', single: true, hp: 175, spd: 290, dmg: 1.15, guard: 0.5, combo: 5, recMul: 0.9, dodgeMax: 3, dodgeRate: 1.2, backstab: 1.2,
    brief: 'Five-hit chains, fast footwork, and an execution grab.',
    light: { wind: 0.2, rec: 0.14, dmg: 8, reach: 88, arc: 1.0, lunge: 46 }, heavy: { reach: 100, dmg: 19, wind: 0.42, max: 0.85 },
    skill: { name: 'Shadow Step', kind: 'shadow', wind: 0.2, act: 0.05, rec: 0.2, cd: 6, cost: 12, desc: 'Vanish and appear behind the enemy. His next light hit deals extra damage.' },
    np: { name: 'Zabaniya', sub: 'Delusional Heartbeat', kind: 'grab', wind: 0.85, act: 0.1, rec: 0.9, dmg: 26, reach: 280, arc: 0.42, trackTo: 0.92, unblock: true, noParry: true, aiMin: 150, aiMax: 270, aiKeep: 215, desc: 'The cursed arm shoots out in a narrow line and grips the heart. Cannot be blocked or parried. Kills outright below 30% health.' } }
};
/* ---- class passives: every class has one themed trait ---- */
var CLS = {
  Saber: { pname: 'Magic Resistance', desc: 'Takes 15% less damage from projectiles, beams and ground spells. Casters and Archers have a harder time against a Saber.' },
  Lancer: { pname: 'Swift Footwork', desc: 'Dodge rolls cost 30% less stamina, so a Lancer can keep dodging long after others run dry.' },
  Archer: { pname: 'Independent Action', desc: 'Needs no master to hold their power: if the Noble Phantasm cast is interrupted, they keep 40% of their momentum instead of losing it all.' },
  Rider: { pname: 'Riding', desc: 'Moves 8% faster, and charge attacks hit 12% harder.' },
  Caster: { pname: 'Territory Creation', desc: 'Stand still for 1 second to raise a bounded field, 230 units wide. Inside it the caster\'s spells hit 12% harder, the skill cooldown recovers 50% faster, stamina returns 30% faster, and enemies move 12% slower. The field collapses if the caster leaves it, is staggered, or is stripped of enchantments. In the Grail War a Caster also makes the team\'s home a Temple: its bounded field starts a level higher, can grow a level further, and strikes intruders sooner.' },
  Assassin: { pname: 'Presence Concealment', desc: 'The Spirit button becomes Conceal: the assassin vanishes almost completely, heals while out of combat, and can strike straight from hiding. The first blow shows no warning and hits 20% harder. Enemies only find a concealed assassin up close, and bounded fields never notice one. Attacking or being hit ends it; 3 seconds before the next.' },
  Berserker: { pname: 'Mad Enhancement', desc: 'Deals 10% more damage, but their guard is 8 points weaker. Reason is traded for raw force.' }
};
Object.keys(SERV).forEach(function (k) {
  var d = SERV[k];
  if (d.cls === 'Saber') d.mr = 0.15;
  else if (d.cls === 'Lancer') d.dodgeCost = 0.7;
  else if (d.cls === 'Archer') d.npKeep = 0.4;
  else if (d.cls === 'Rider') { d.spd = Math.round(d.spd * 1.08); d.chargeMul = 1.12; }
  else if (d.cls === 'Caster') d.field = { r: 230, still: 1.0 };
  else if (d.cls === 'Assassin') d.conceal = 1.5;
  else if (d.cls === 'Berserker') { d.dmg = Math.round(d.dmg * 110) / 100; d.guard = Math.max(0.15, Math.round((d.guard - 0.08) * 100) / 100); }
});
Object.keys(SERV).forEach(function (k) { SERV[k].A = build(SERV[k]); });
