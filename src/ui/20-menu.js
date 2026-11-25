function pips(v, col) { var h = ''; for (var i = 1; i <= 5; i++) h += '<b class="' + (i <= Math.round(v) ? 'on' : '') + '"></b>'; return '<i>' + h + '</i>'; }
function INFO(d) {
  var np = d.A.np, sk = d.A.skill, m = d.dmg, R = Math.round;
  var T = {
    cid: {
      pname: "Campeador's Poise", pdesc: 'A successful parry or counter powers up his next light strike by 50%. His third light strike in a chain always hits 35% harder, so finishing the string pays.',
      style: 'A balanced swordsman with no weak spot. His three-hit chain ends in a strike 35% stronger than the first two, so he rewards finishing the string.',
      passives: ['Solid guard: blocks 75% of damage.'],
      skill: 'He braces for about half a second. Any blockable melee strike that hits him is cancelled: the attacker is staggered for nearly a second and takes about ' + R(12 * m) + ' damage. Arrows that hit him are destroyed. If nothing hits him, he stands exposed for another half second.',
      skillBeat: 'Do not swing blindly into it. Pause, let the half second run out, then punish. Unblockable attacks such as an NP go straight through.',
      np: 'A lane lights up in front of him and he locks his direction partway through the cast. Then he charges the length of it. Anything in the lane takes about ' + R(np.dmg * m) + ' damage and is knocked back. It cannot be blocked or parried. He cannot guard during the second of recovery that follows.',
      npBeat: 'Dodge sideways as the charge starts, then punish his recovery. Any hit that staggers him during the cast cancels it and drains his momentum.' },
    richard: {
      pname: 'Lionheart', pdesc: 'Every hit he lands gives back 4 stamina, and below half health he deals 12% more damage. The lower he falls, the harder he fights.',
      style: 'A bold, all-round knight. A three-hit chain with a strong finisher, a short Excalibur beam that leaves him without a blade for a few seconds, and a wide wall of flame to finish. He never runs out of stamina while he is landing hits.',
      passives: ['Three-hit chain, the third strike 35% stronger.', 'Good guard: blocks ' + Math.round(d.guard * 100) + '%.', 'Medium-long sword reach (' + d.A.light.reach + ').'],
      skill: 'Excalibur: after a ' + SERV.richard.skill.wind + ' second charge, a short beam of light about half as wide as King Arthur\'s, ' + SERV.richard.skill.range + ' units long. About ' + R(SERV.richard.skill.dmg * m) + ' damage, guard-breaking. Then his blade shatters: for about ' + (SERV.richard.skill.breakT + SERV.richard.skill.rec).toFixed(1) + ' seconds he cannot attack or block. Cooldown ' + SERV.richard.skill.cd + ' seconds.',
      skillBeat: 'Dodge as it fires or stand behind a pillar. Then rush him: his blade is gone and he cannot block.',
      np: 'Utopie Purgatoire: after a ' + np.wind + ' second cast a wave of holy flame sweeps a wide cone ' + np.reach + ' units long. About ' + R(np.dmg * m) + ' damage, cannot be blocked, and it sets you burning for ' + SERV.richard.np.burn.t + ' more seconds (about ' + R(SERV.richard.np.burn.dps * SERV.richard.np.burn.t) + ' extra).',
      npBeat: 'Get behind him or out of the cone. Hit him during the cast to cancel it, or stand in Leonidas\'s shield wall.' },
    leonidas: {
      pname: 'Phalanx Discipline', pdesc: 'Guarding costs him 25% less stamina, on top of the best block in the roster (88%). He can stand behind the shield longer than anyone.',
      style: 'A wall with a spear. The longest melee reach in the roster and the best guard. He wins by making you spend your stamina on his shield. Two-hit chain, and he recovers a little slower than the rest.',
      passives: ['Long spear reach (135).', 'Heavier recovery: 10% longer.'],
      skill: 'A quick, short strike that breaks a guard outright and staggers for 0.8 seconds. It deals only about ' + R(7 * m) + ' damage; its job is to crack open a turtle.',
      skillBeat: 'Respect the 0.3 second wind-up: dodge it, or tap Block to parry. Do not sit behind a guard when he is close.',
      np: 'Deals no damage. After a 0.9 second cast a shield wall rings him for ' + np.dur + ' seconds. While it holds he takes 60% less damage and ordinary hits cannot stagger him. Arrows are stopped inside the ring, and enemies inside it move 40% slower. He moves 40% slower himself. It also blocks enemy Noble Phantasms completely: beams, blades and blasts break against the shields.',
      npBeat: 'Do not trade into the wall, and never fire your Noble Phantasm into it. Step outside the ring and wait; it only lasts ' + np.dur + ' seconds. Only Rule Breaker gets through.' },
    atalanta: {
      pname: "Huntress's Pace", pdesc: 'Her dodge charges refill 35% faster, so she gets her escape back sooner than anyone except Hassan.',
      style: 'A fast ranged skirmisher with low health. Light arrows reach 560 units and chip, but they do not interrupt an attack you are winding up, so you can advance behind a swing. Hold Heavy to charge a stronger arrow that breaks guards.',
      passives: ['Charged shot: up to 1 second of charge, 760 range, breaks guards.', 'Pillars and the Hot Gates stop her arrows.', 'Weak guard: blocks 50%.'],
      skill: 'She leaps 170 units backward over about a quarter of a second, then looses an arrow. It is her gap-maker and her opener. The first part of the leap makes her untouchable, so it doubles as a dodge. She cannot guard during it.',
      skillBeat: 'Do not swing into the first half of the leap, since she cannot be hit. Close the gap with a dodge or break line of sight behind a pillar, and expect the arrow right after.',
      np: 'Six circles are marked around you and land one after another, starting about 0.85 seconds later. Each deals about ' + R(np.dmg * m) + ' damage and breaks guards. The first circle lands exactly where you were standing when the cast finished.',
      npBeat: 'Move out of the circles as soon as they appear. They are fixed to the ground and do not follow you. Dodging through one also works.' },
    heracles: {
      pname: 'God Hand', pdesc: 'The first time a blow would kill him he survives, rising with 20% health and a second of invulnerability. It only happens once, and an execution still kills outright. He also takes 40% less damage from arrows.',
      style: 'A slow, enormous brawler. Every attack he makes has hyper armor: light hits and arrows will not stop his swing, and he takes 10% less damage while swinging. Heavy blows and NPs still stagger him, but for less time. His recoveries are long, so he is open after every swing.',
      passives: ['Hyper armor on every attack.', 'Slow to turn and slow to recover: 10% longer.', 'Health pool 158 plus God Hand, and the slowest Servant to move.'],
      skill: 'After a 0.55 second armored wind-up he smashes the ground in a circle of 150 units around him. About ' + R(12 * m) + ' damage, breaks guards, knocks you back and staggers.',
      skillBeat: 'Dodge out or step outside the circle. Never block it; it breaks guards.',
      np: 'He leaps toward you after a 1.3 second cast, then nine blows land 0.14 seconds apart in a circle of 160 units around him. About ' + R(np.dmg * np.pulses * m) + ' damage in total if every blow hits. He is armored the entire time. Blockable, but each block drains stamina until your guard breaks.',
      npBeat: 'Get outside the ring, since you have the leap to do it. A dodge covers the first couple of blows. A heavy hit during the cast cancels it.' },
    diarmuid: {
      pname: 'Gae Dearg', pdesc: 'The crimson spear gnaws through defenses: while you block his strikes, your guard absorbs 40% less than it normally would. Blocking him costs you.',
      style: 'A fast, precise spearman with a short chain and wounds that do not close. He wins by making you bleed and by breaking down your block. Three-hit chain; faster than most.',
      passives: ['Quick wind-ups on light strikes (0.24 seconds).', 'Medium guard: blocks 60%.', 'Reach 120, a little shorter than Leonidas.'],
      skill: 'A thrust with the yellow spear for about ' + R(8 * m) + ' damage and a short lunge. Wherever it lands it leaves a wound that bleeds for 6 seconds, about ' + R(24 * m) + ' damage in total. Bleeding cannot be blocked.',
      skillBeat: 'Parry or dodge the thrust itself. Once you are bleeding, finish the fight quickly or the damage adds up.',
      np: 'He lowers both spears and rushes down a lane. About ' + R(np.dmg * m) + ' damage on impact, cannot be blocked, and leaves a bleeding wound for 8 seconds (about ' + R(40 * m) + ' more).',
      npBeat: 'Dodge sideways as the rush starts, then punish his recovery. Hitting him during the cast cancels it.' },
    cu: {
      pname: 'Protection from Arrows, Battle Continuation', pdesc: 'He takes 40% less damage from arrows. Below 30% health he takes 15% less from everything, so finishing him takes a clean hit.',
      style: 'A tireless spear fighter with a rune skill that controls the ground. Even close to death he keeps coming. Three-hit chain with a long spear.',
      passives: ['Reach ' + d.A.light.reach + ' with a long, fast spear.', 'Medium guard: blocks 60%.'],
      skill: 'Three rune circles mark the ground under you and burst into flame about 0.7 seconds later. Each circle deals about ' + R(10 * m) + ' damage. Cooldown ' + sk.cd + ' seconds.',
      skillBeat: 'Walk out of the circles as soon as they appear; they do not move.',
      np: 'He leaps back and hurls Gáe Bulg up to ' + np.range + ' units. It explodes where it lands: about ' + R(SERV.cu.np.explode.dmg * m) + ' damage to everyone within ' + SERV.cu.np.explode.r + ' units, plus about ' + R(np.dmg * m) + ' more if the spear itself hits you. The blast cannot be blocked.',
      npBeat: 'Get well clear of where the spear will land: a dodge saves you from the spear, not always from the blast. A pillar stops the throw. Hit him during the cast to cancel it.' },
    gilgamesh: {
      pname: 'Golden Rule', pdesc: 'His momentum fills 25% faster, so his Noble Phantasm comes around sooner. He also takes 10% less damage from everything.',
      style: 'A king with no weapon in his hands. Golden gates open beside him and fire blades like an archer, then a huge Noble Phantasm ends the exchange. Keep moving, and close in when he is recovering.',
      passives: ['Light shots reach about 640 units and come from different gates each time.', 'Heavy: Triple Gate, a charged fan of three blades that breaks guards.', 'Weak guard: blocks 45%. He relies on distance.'],
      skill: 'Five gates open and fire a fan of blades. Each blade deals about ' + R(7 * m) + ' damage. All five hit if you stand still in front of him, and only one or two if you are off to the side.',
      skillBeat: 'Sidestep the fan, or dodge through it. Standing still at medium range is the worst place to be.',
      np: 'After a long ' + np.wind + ' second cast he unleashes a ring of destruction ' + np.r + ' units wide around himself. About ' + R(np.dmg * m) + ' damage, cannot be blocked. The ring is shown on the ground while he casts.',
      npBeat: 'You have almost two seconds. Run outside the ring, or dodge at the moment it fires. Hit him during the cast to cancel it.' },
    iskandar: {
      pname: 'King of Conquerors', pdesc: 'His stamina recovers 25% faster, so he can keep attacking and guarding long after others tire. He is the sturdiest servant in the roster.',
      style: 'The biggest health pool and a heavy swing. He walks you down with a strong guard and a rush that breaks it. Two-hit chain, slow recovery.',
      passives: ['Health pool 230, the largest of anyone.', 'Strong guard: blocks 70%.', 'Heavier recovery: 5% longer.'],
      skill: 'Gordius Wheel: his chariot rushes forward ' + sk.dist + ' units after a short wind-up. About ' + R(16 * m) + ' damage, breaks guards, and he is armored during the rush so light hits will not stop him.',
      skillBeat: 'Dodge sideways. Never try to block it; it breaks guards.',
      np: 'He calls his reality marble: the arena becomes a sunlit desert for the rest of the match, with no pillars to hide behind, and his army charges with him down a very wide lane, ' + np.dist + ' units long. About ' + R(np.dmg * m) + ' damage and cannot be blocked. Inside his desert his next charge needs only about half the cast. Enuma Elish breaks the desert, and Unlimited Blade Works replaces it.',
      npBeat: 'Dodge early, and sideways. You need to clear the whole width of the lane, which is a long way.' },
    gilles: {
      pname: 'Mental Pollution', pdesc: 'Staggers last 25% shorter on him: he recovers from hits faster than other servants.',
      style: 'A summoner of horrors who fights from range. He casts a three-spell chain, then covers the ground in circles. He wants you to dodge into them.',
      passives: ['Moderate health (' + d.hp + ') and a weak guard (' + Math.round(d.guard * 100) + '%).', 'Spells reach about 540 units; the third spell is slow and large.'],
      skill: 'Three horrors rise from the ground under you after about 0.75 seconds, each dealing about ' + R(11 * m) + ' damage and staggering. Cooldown ' + sk.cd + ' seconds.',
      skillBeat: 'Read the three circles and step out. Close the distance after: he is fragile.',
      np: 'His tome rises and opens, and eight horrors burst from the ground across a wide area around you after a 1 second delay. About ' + R(np.dmg * m) + ' damage each, and each breaks guards.',
      npBeat: 'Watch the circles and keep moving; do not block. Hit him during the 1.4 second cast to cancel it.' },
    lancelot: {
      pname: 'Eternal Arms Mastership', pdesc: 'His momentum fills 30% faster. Any weapon he seizes is used with perfect skill. His guard is the weakest in the roster: he is hard to stop and easy to hurt.',
      style: 'A black knight who starts every fight with bare fists: a fast four-hit chain with very short reach. Use Seize Arms and he gains a weapon with real reach and power for nine seconds. He builds his Noble Phantasm quickly.',
      passives: ['Fists: four quick hits with 0.2 second wind-ups, but only 80 units of reach.', 'Seize Arms picks a random weapon: longsword, spear (longest reach) or warhammer (heaviest hits).', 'Weakest guard in the roster: blocks ' + Math.round(d.guard * 100) + '%.'],
      skill: 'Seize Arms: a 0.35 second grab. For ' + sk.dur + ' seconds a random weapon replaces his fists for both light and heavy attacks. The weapon name shows on his Light button. It does no damage by itself. Cooldown ' + sk.cd + ' seconds.',
      skillBeat: 'Punish the grab: it is a 0.35 second wind-up with nothing to hit you. Then keep away from the weapon\'s new reach, or stay close if he picked the spear.',
      np: 'Knight of Owner: Minigun. After a 1.1 second spin-up he sprays about 25 bullets in 1.4 seconds, turning slowly toward you. Each deals about ' + R(np.dmg * m) + ' damage, so about ' + R(np.dmg * m * 25) + ' if every one lands. Bullets do not stagger, but they can be blocked and stopped by pillars.',
      npBeat: 'Hit him during the spin-up to cancel it. Once it fires, break line of sight behind a pillar, or keep circling; he turns slowly. Blocking works but drains stamina.' },
    emiya: {
      pname: "Mind's Eye (True)", pdesc: 'Blocking costs him 25% less stamina, and every hit he blocks builds extra momentum. He reads a fight and wins by outlasting it.',
      style: 'A patient swordsman with the twin falchions Kanshou and Bakuya, black and white. A four-hit chain and a strong guard up close; an exploding arrow from range; and a world of swords to finish.',
      passives: ['Four-hit chain with 0.22 second wind-ups, reach ' + d.A.light.reach + '.', 'Strong guard: blocks ' + Math.round(d.guard * 100) + '%.'],
      skill: 'Caladbolg II: he draws a black bow, charges for ' + SERV.emiya.skill.wind + ' seconds and fires a twisted sword-arrow ' + SERV.emiya.skill.range + ' units. It explodes on impact for about ' + R(SERV.emiya.skill.explode.dmg * m) + ' damage within ' + SERV.emiya.skill.explode.r + ' units, breaking guards. Cooldown ' + SERV.emiya.skill.cd + ' seconds.',
      skillBeat: 'The charge is long and easy to see: step out of the line, or close in and hit him while he holds the bow.',
      np: 'Unlimited Blade Works: his reality marble replaces the arena with a burning field of swords for the rest of the match. Swords rain on every enemy, then for ' + SERV.emiya.np.dur + ' seconds blades float around him and fire at the nearest enemy, about ' + R(SERV.emiya.np.sword.dmg * m) + ' damage each.',
      npBeat: 'Hit him during the long chant to cancel it. Once the blades are out, keep moving sideways or block; they stop after ' + SERV.emiya.np.dur + ' seconds. Enuma Elish breaks the marble.' },
    medusa: {
      pname: 'Mystic Eyes of Petrification', pdesc: 'Anyone within 270 units who is in front of her moves 18% slower. Running straight at her costs you speed; flanking her does not.',
      style: 'A fast gorgon with a four-hit chain and a spiked rondel on a chain. Her swings reach in a wide loop, her gaze slows you in her sight, and her chain hooks you in when you try to keep distance.',
      passives: ['Four-hit chain with 0.22 second wind-ups and a chain-whip reach of ' + d.A.light.reach + ' units.', 'Fast movement, with a weak guard (' + Math.round(d.guard * 100) + '%).'],
      skill: 'Chain Hook: she throws the rondel on its chain up to ' + sk.range + ' units. If it hits (about ' + R(sk.dmg * m) + ' damage) the chain drags her to you and staggers you, and her next light strike deals 50% more. If it misses she is open for over half a second. Cooldown ' + sk.cd + ' seconds.',
      skillBeat: 'Sidestep or dodge the dagger, or block it: a block cancels the pull. A pillar between you stops it.',
      np: 'She mounts Pegasus, rises and dives down a lane ' + np.dist + ' units long. About ' + R(np.dmg * m) + ' damage, cannot be blocked, and she is untouchable for the first moment of the dive.',
      npBeat: 'Dodge sideways as the dive starts, since her moment of invulnerability means you cannot hit her then. Punish the long recovery.' },
    medea: {
      pname: "Hecate's Craft", pdesc: 'Her skill cooldown recovers 35% faster, so she casts more often than anyone. Her health and guard are low: she lives on distance.',
      style: 'A ranged caster with low health. A three-spell chain (a quick bolt, a fan of sparks, then a heavy orb), a guard-breaking lance, and a skill that fires three at once. Keep range and she wins; close in and she is fragile.',
      passives: ['Light spells reach about 580 units; the charged lance reaches 720 and breaks guards.', 'Weak guard: blocks 40%.'],
      skill: 'High-Speed Divine Words: three spells fired almost together in a narrow fan, each about ' + R(6 * m) + ' damage. Cooldown ' + sk.cd + ' seconds.',
      skillBeat: 'Sidestep, or dodge into her. She cannot guard well when you reach her.',
      np: 'Rule Breaker: a hurled dagger. About ' + R(np.dmg * m) + ' damage, cannot be blocked. If it lands it strips every enchantment on you (shield wall, hidden blades, bleeding) and drains your momentum to zero.',
      npBeat: 'Dodge it or hide behind a pillar. It is fast, so dodge as she throws. Hit her during the cast to cancel it.' },
    kojirou: {
      pname: "Mind's Eye", pdesc: 'His parry window is 60% longer than anyone else (0.27 seconds instead of 0.17). He parries on instinct, so poking at him with single light attacks is risky.',
      style: 'The longest reach in the roster, a thin and fast blade. He fights from the outer edge of your range and punishes anything predictable. Three-hit chain.',
      passives: ['Reach 150, the longest of any melee fighter.', 'Medium guard: blocks 55%.'],
      skill: 'Iaido Draw: a lightning-fast draw with a very narrow arc and a reach of ' + sk.reach + ' units. About ' + R(15 * m) + ' damage and a short stagger. Cooldown ' + sk.cd + ' seconds.',
      skillBeat: 'It is narrow: sidestep it, or dodge in. It is hard to see coming at 0.16 seconds, so stay outside his reach.',
      np: 'Three cuts from three directions at once in a small circle around him. About ' + R(np.dmg * np.pulses * m) + ' damage if all three land. Cannot be blocked or parried.',
      npBeat: 'Stay more than 150 units from him, or dodge as the first cut lands. A dodge covers the whole flurry.' },
    caerwyn: {
      pname: 'Wind-Wreathed Blade', pdesc: 'Her sword is always hidden in wind, so every melee strike reaches 10% farther than the warning shows. Her momentum also fills 20% faster.',
      style: 'A sovereign swordswoman built around hidden reach and one huge payoff. Three-hit chain with a stronger finisher, a firm guard, and a Noble Phantasm you can read from across the arena.',
      passives: ['Finisher: the third light strike deals +35%.', 'Solid guard: blocks 78% of damage.', 'The beam is a projectile, so a pillar between you and her stops it.'],
      skill: 'A 0.25 second self-cast. She releases the wind: for ' + sk.dur + ' seconds her blade is unveiled in a blaze of light, every strike hits 20% harder, and her melee reaches 25% farther than the warning shows (up from 10%). It deals no damage by itself.',
      skillBeat: 'Treat every red warning as too short while her blade glows: stand back a little more, or dodge in rather than away. It only lasts ' + sk.dur + ' seconds and has a 10 second cooldown.',
      np: 'After a ' + np.wind + ' second cast she fires a beam of light 1,100 units long. It deals about ' + R(np.dmg * m) + ' damage to whoever it hits, cannot be blocked, and is wider than an arrow. The beam arrives almost instantly after the cast, and she is open for 1.2 seconds afterward.',
      npBeat: 'Dodge in the instant it fires, not before. A pillar between you and her stops it. Hit her during the cast to cancel it and drain her momentum.' },
    hassan: {
      pname: "Assassin's Edge", pdesc: 'Melee strikes against an enemy who is facing away deal 20% more damage. Shadow Step puts him behind you, so the two work together. His dodge charges also refill 20% faster.',
      style: 'The fastest Servant, with the longest chain: five quick light hits, the last 35% stronger. Low health and a weak guard. He wants to stay on you, so make him pay for it.',
      passives: ['Five-hit light chain with 0.2 second wind-ups.', 'Three dodge charges instead of two.', 'Fastest movement in the roster.', 'Weak guard: blocks 50%.'],
      skill: 'He vanishes for 0.2 seconds and reappears 62 units behind you, facing you. His next light strike within about two seconds deals 60% more.',
      skillBeat: 'The vanish is your cue: turn, then tap Block to parry the first strike, or dodge sideways.',
      np: 'A cursed grip with a short reach (110) and a narrow arc. It cannot be blocked or parried. It deals about ' + R(np.dmg * m) + ' damage, and kills outright if you are below 30% health. He must be very close for it to land.',
      npBeat: 'A dodge makes you invulnerable for the moment it lands, which beats it completely. Watch for the purple warning and keep your health above 30% if you can.' }
  }[d.id];
  return T;
}
var SPELLTXT = {
  'Abyssal Bolt': 'A fast sea-green bolt. Light damage, quick to cast.',
  'Twin Horrors': 'Two slower horrors in a wide split. Hard to dodge both at close range.',
  'Writhing Mass': 'A huge, slow mass that hits hard and staggers. Easy to see, easy to sidestep.',
  'Grasp of the Deep': 'Hold to charge, release: two tentacles burst under you after a half second. Breaks guards.',
  'Arcane Bolt': 'A very fast, narrow bolt. Light damage, low stamina cost.',
  'Fan of Sparks': 'Three small sparks in a narrow fan. Each is weak but they add up if you stand still.',
  "Hecate's Orb": 'A large, slow orb that hits hard. Easy to see coming.',
  "Hecate's Lance": 'Hold to charge, release: a fast, long-range lance that breaks guards.'
};
function detailHTML(d) {
  var t = INFO(d), sk = d.A.skill, np = d.A.np, c = d.col;
  var reach = d.ranged ? 5 : d.A.light.reach / 150 * 5;
  var h = '<div class="det"><div class="stats5" style="--c:' + c + '">' + [['Health', d.hp / 215 * 4.4], ['Speed', d.spd / 290 * 5], ['Guard', d.guard * 5.2], [d.ranged ? 'Range' : 'Reach', reach], ['Chain', d.combo]].map(function (r) { return '<div class="pp"><span>' + r[0] + '</span>' + pips(r[1]) + '</div>'; }).join('') + '</div>';
  var cl = CLS[d.cls];
  h += '<div class="dgrid"><div class="dbox" style="--bc:var(--unb)"><h4>Class passive: ' + esc(cl.pname) + '<span>' + d.cls + '</span></h4><p>' + esc(cl.desc) + '</p></div><div class="dbox" style="--bc:var(--ok)"><h4>Servant passive: ' + esc(t.pname) + '</h4><p>' + esc(t.pdesc) + '</p></div></div>';
  if (d.A.lightSeq) h += '<div class="dbox" style="--bc:' + c + '"><h4>Spell chain<span>tap Light to cast in order</span></h4><ul>' + d.A.lightSeq.map(function (q, i) { return '<li><b>' + (i + 1) + '. ' + esc(q.name) + '</b>: ' + esc(SPELLTXT[q.name]) + '</li>'; }).join('') + '<li><b>Heavy, ' + esc(d.A.heavy.name) + '</b>: ' + esc(SPELLTXT[d.A.heavy.name]) + '</li></ul></div>';
  h += '<div class="dbox" style="--bc:' + c + '"><h4>Fighting style</h4><p>' + esc(t.style) + '</p><ul>' + t.passives.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>';
  h += '<div class="dgrid"><div class="dbox" style="--bc:var(--unb)"><h4>Skill: ' + esc(sk.name) + '<span>' + sk.cd + 's cooldown &middot; ' + sk.cost + ' stamina</span></h4><p>' + esc(t.skill) + '</p><p class="beat"><b>How to beat it</b> ' + esc(t.skillBeat) + '</p></div>';
  h += '<div class="dbox" style="--bc:var(--gold)"><h4>Noble Phantasm: ' + esc(np.name) + (np.sub ? ', ' + esc(np.sub) : '') + '<span>' + np.wind + 's cast &middot; needs full momentum</span></h4><p>' + esc(t.np) + '</p><p class="beat"><b>How to beat it</b> ' + esc(t.npBeat) + '</p></div></div></div>';
  return h;
}
function cardHTML(d, kind) {
  var sel = kind === 'P' ? CFG.me === d.id : CFG.foe === d.id;
  return '<div class="sc' + (sel ? ' on wide' : '') + '" style="--c:' + d.col + '"><button type="button" class="chead" data-k="' + kind + '" data-id="' + d.id + '" aria-pressed="' + sel + '"><span class="th">' + thumb(d.id, 132) + '</span><span class="cls">' + d.cls + '</span><b>' + esc(d.name) + '</b><small>' + esc(d.brief) + '</small></button>' + (sel ? detailHTML(d) : '') + '</div>';
}
function shortName(n) { return n.split(/ of |, /)[0]; }
function renderSetup() {
  $('#playas').innerHTML = [['servant', 'Servant', 'Fight directly. Your master follows and supports you with magecraft.'], ['master', 'Master', 'Fight as the human. Give your servant orders and spend Command Seals.']].map(function (m) { return '<button type="button" class="mode" data-playas="' + m[0] + '" aria-pressed="' + (CFG.playAs === m[0]) + '"><b>' + m[1] + '</b><small>' + m[2] + '</small></button>'; }).join('');
  $('#roster').innerHTML = ORDER.map(function (id) { var d = SERV[id]; return '<button type="button" class="rt" data-pick="' + id + '" aria-pressed="' + (CFG.servant === id) + '" style="--c:' + d.col + '"><span class="th">' + thumb(id, 110) + '</span><b>' + esc(shortName(d.name)) + '</b><small>' + d.cls + '</small></button>'; }).join('');
  $('#masters').innerHTML = MASTER_ORDER.map(function (id) { var m = MASTERS[id]; return '<button type="button" class="mode" data-master="' + id + '" aria-pressed="' + (CFG.master === id) + '"><b>' + m.name + '</b><span class="mtag">' + m.type + '</span><small>' + esc(m.brief) + ' Health ' + m.hp + '. Skill: ' + esc(m.A.skill.name) + '. Signature: ' + esc(m.A.np.name) + '.</small></button>'; }).join('');
  $('#rivals').innerHTML = [[7, 'Full war: 7 teams, every class'], [4, '4 teams'], [3, '3 teams']].map(function (n) { return '<button type="button" class="chip" data-teams="' + n[0] + '" aria-pressed="' + (CFG.teams === n[0]) + '">' + n[1] + '</button>'; }).join('');
  $('#diff').innerHTML = Object.keys(DIFF).map(function (k) { return '<button type="button" class="chip" data-d="' + k + '" aria-pressed="' + (CFG.diff === k) + '">' + DIFF[k].name + ' &middot; ' + DIFF[k].desc + '</button>'; }).join('');
  $('#spd').innerHTML = [[1, 'Normal'], [0.8, 'Relaxed (80%)'], [0.65, 'Slow (65%)']].map(function (q) { return '<button type="button" class="chip" data-s="' + q[0] + '" aria-pressed="' + (CFG.speed === q[0]) + '">' + q[1] + '</button>'; }).join('');
  $('#summary').innerHTML = '<b>' + esc(shortName(SERV[CFG.servant].name)) + '</b> with <b>' + MASTERS[CFG.master].name + '</b> &middot; playing the ' + CFG.playAs + ' &middot; ' + CFG.teams + ' teams';
}
document.addEventListener('click', function (e) {
  var t = e.target, el;
  if ((el = t.closest('[data-playas]'))) { CFG.playAs = el.dataset.playas; saveCfg(); renderSetup(); return; }
  if ((el = t.closest('[data-pick]'))) { CFG.servant = el.dataset.pick; saveCfg(); renderSetup(); return; }
  if ((el = t.closest('[data-master]'))) { CFG.master = el.dataset.master; saveCfg(); renderSetup(); return; }
  if ((el = t.closest('[data-teams]'))) { CFG.teams = +el.dataset.teams; saveCfg(); renderSetup(); return; }
  if ((el = t.closest('[data-stance]'))) { var my = G && G.f[MEI]; if (NET.mirror && my && my.def.isMaster) { NET.so = el.dataset.stance; my.partner.stance = NET.so; renderStances(); return; } if (my && my.partner && my.def.isMaster) { my.partner.stance = el.dataset.stance; my.partner.anchor = null; FX.text(my.partner, ({ protect: 'PROTECTING', charge: 'CHARGE!', hold: 'HOLDING', passive: 'STANDING DOWN', retreat: 'RETREATING', spirit: 'SPIRIT FORM' })[el.dataset.stance]); renderStances(); } return; }
  var ch = t.closest('.chip');
  if (ch && ch.dataset.d) { CFG.diff = ch.dataset.d; saveCfg(); renderSetup(); }
  if (ch && ch.dataset.s) { CFG.speed = parseFloat(ch.dataset.s); saveCfg(); renderSetup(); }
});
var STANCES = [['protect', 'Protect me'], ['charge', 'Charge!'], ['hold', 'Hold here'], ['passive', "Don't attack"], ['retreat', 'Retreat'], ['spirit', 'Spirit form']];
function renderStances() {
  var my = G && G.f[MEI], el = $('#stances');
  if (!my || !my.def.isMaster || !my.partner) { el.innerHTML = ''; return; }
  var cur = STANCES.find(function (q) { return q[0] === my.partner.stance; }); if ($('#ordL')) $('#ordL').textContent = cur ? cur[1] : '';
  el.innerHTML = STANCES.map(function (q, i) { return '<button type="button" class="chip" data-stance="' + q[0] + '" aria-pressed="' + (my.partner.stance === q[0]) + '">' + (i + 1) + ' ' + q[1] + '</button>'; }).join('');
}

