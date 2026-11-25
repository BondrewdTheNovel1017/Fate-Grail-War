/* ---- master detail panels: stats and what every attack does, in the same format as the servants ---- */
var MASTER_INFO = {
  rin: { style: 'A ranged gem magus. She keeps her distance, curses with Gandr and patches her servant up between fights.', passive: ['Tohsaka Jewels', 'A deep, steady mana pool: she can afford both her own spells and her servant’s Noble Phantasm.'],
    light: 'A Gandr curse orb. Quick to cast, light damage.', heavy: 'Hold to charge, release: a jewel shot that hits hard at long range.',
    skill: 'Heals her servant for 40 if it is within 340 of her.', np: 'Throws a stored jewel that bursts in a wide blast (140) for heavy damage.' },
  kiritsugu: { style: 'The Magus Killer. Fast, fragile and deadly at range: he hunts enemy masters while his servant holds the line.', passive: ['Mage Killer', 'His Origin Bullet shatters Kayneth’s mercury shield for double damage, and every master it hits loses their magecraft.'],
    light: 'Draws the Calico and fires a quick double tap.', heavy: 'Holds the trigger: a long Calico burst of about twenty rounds that tracks the target. He can barely move while firing.',
    skill: 'Time Alter: Double Accel. Moves almost twice as fast for 3 seconds: escape or close in.', np: 'The Contender’s Origin Bullet. Hits a master for heavy damage and burns their circuits: no skill or signature spell for 10 seconds.' },
  shirou: { style: 'A fledgling who fights up close with reinforced swords and grows as he fights. Weak at first, frightening by the end.', passive: ['Trace', 'Fighting fills his Trace gauge. At 40: Trace On, swapping his blade for Kanshou and Bakuya and his heavy for Overedge. At 100: Unlimited Blade Works, once per match.'],
    light: 'A reinforced blade: a quick three-hit chain. After Trace On, the faster twin blades Kanshou and Bakuya.', heavy: 'Hold to charge, release: a guard-breaking cleave. After Trace On, Overedge: a wide, lunging slash.',
    skill: 'Reinforcement. Takes 40% less damage for 5 seconds.', np: 'Broken Phantasm: a traced arrow that explodes (120). With a full Trace, Unlimited Blade Works instead: a reality marble with homing swords for 11 seconds.' },
  kayneth: { style: 'A Clock Tower lord who trusts his living mercury to protect him. Strong up close, slow on his feet.', passive: ['Volumen Hydrargyrum', 'His shield absorbs whole hits; only an Origin Bullet breaks it outright.'],
    light: 'Three mercury needles in a narrow fan.', heavy: 'Hold to charge, release: a mercury blade at range.',
    skill: 'Volumen Hydrargyrum. A mercury shield absorbs the next 3 hits within 8 seconds.', np: 'Mercury Scythe: the mercury whips around him (160) and staggers everyone close.' },
  kirei: { style: 'An Executor and a martial artist. He walks into close range and stays there.', passive: ['Executor', 'The toughest master: more health and a strong guard. His bajiquan can stagger a servant.'],
    light: 'Slashes with Black Keys held between his fingers: a fast three-hit chain.', heavy: 'Hold to charge, release: hurls a wide fan of six Black Keys.',
    skill: 'Healing Sacrament. Heals himself for 30.', np: 'Bajiquan: a lunging strike that staggers whatever it hits, servants included.' },
  waver: { style: 'A student with little power of his own, but a sharp tactician. He wins by making his servant better.', passive: ['Strategist', 'Weak alone. Everything he has goes into his servant.'],
    light: 'A small Gandr curse.', heavy: 'Hold to charge, release: a stronger Gandr.',
    skill: 'Strategist. His servant deals 15% more damage and moves 10% faster for 8 seconds.', np: 'Mana Transfer: refills his servant’s stamina and adds 25 Noble Phantasm charge.' },
  irisviel: { style: 'An Einzbern homunculus who heals and binds from behind her servant.', passive: ['Alchemy', 'The strongest heal of any master.'],
    light: 'A silver wire bird.', heavy: 'Hold to charge, release: a wire spear at range.',
    skill: 'Alchemic Healing. Heals her servant for 45 within 360.', np: 'Wire Bind: a wire snare that roots its target in place for 1.8 seconds.' },
  kariya: { style: 'A Matou who burns his own body to power his servant.', passive: ['Crest Worms', 'When his mana runs short he pays the rest with his own health, so his servant never goes without, at a cost.'],
    light: 'Spits crest worms at an enemy.', heavy: 'Hold to charge, release: a swarm of three worms.',
    skill: 'Feed the Servant. Costs him 15 health for 30 Noble Phantasm charge on his servant.', np: 'Worm Pit: three patches of worms erupt under the enemy after a short delay.' },
  illya: { style: 'The Einzbern masterpiece. Her familiars hunt on their own and her mana is nearly endless.', passive: ['Grail Vessel', 'Her servant’s Noble Phantasm charges 30% faster, and her mana pool is the deepest in the war.'],
    light: 'A Storch Ritter bird that homes in on its target.', heavy: 'Hold to charge, release: three homing birds.',
    skill: 'Einzbern Alchemy. Heals her servant for 35 within 380.', np: 'Storch Ritter Swarm: six homing birds at once.' },
  sakura: { style: 'The Matou heir. Her shadow drinks what it touches and binds servants in place.', passive: ['Imaginary Numbers', 'Half of the damage she deals heals her.'],
    light: 'A lash of shadow.', heavy: 'Hold to charge, release: two shadow tendrils rise under the enemy.',
    skill: 'Imaginary Drain. Damages everyone within 260 and heals her for each one hit.', np: 'Shadow of the Grail: a wide pool of shadow erupts under the enemy and roots whoever it catches.' }
};
function masterDetailHTML(m) {
  var I = MASTER_INFO[m.id] || {}, A = m.A, c = m.col, pool = MANA_POOL[m.id] || [80, 1.6];
  var h = '<div class="det"><div class="stats5" style="--c:' + c + '">' + [['Health', m.hp / 125 * 4.5], ['Mana', pool[0] / 160 * 5], ['Regen', pool[1] / 3.2 * 5], ['Speed', m.spd / 230 * 5], ['Guard', m.guard * 7]].map(function (r) { return '<div class="pp"><span>' + r[0] + '</span>' + pips(Math.min(5, r[1])) + '</div>'; }).join('') + '</div>';
  h += '<div class="dgrid"><div class="dbox" style="--bc:var(--unb)"><h4>' + esc(m.type) + '<span>' + m.hp + ' health &middot; ' + pool[0] + ' mana, +' + pool[1] + '/s</span></h4><p>' + esc(I.style || m.brief) + '</p></div>' +
    '<div class="dbox" style="--bc:var(--ok)"><h4>Passive: ' + esc((I.passive || ['', ''])[0]) + '</h4><p>' + esc((I.passive || ['', ''])[1]) + '</p></div></div>';
  h += '<div class="dbox" style="--bc:' + c + '"><h4>Attacks</h4><ul><li><b>Light, ' + esc(A.light.name) + '</b>: ' + esc(I.light || '') + '</li><li><b>Heavy, ' + esc(A.heavy.name) + '</b>: ' + esc(I.heavy || '') + '</li></ul></div>';
  h += '<div class="dgrid"><div class="dbox" style="--bc:var(--unb)"><h4>Skill: ' + esc(A.skill.name) + '<span>' + A.skill.cd + 's cooldown &middot; ' + MANA.skillCost + ' mana</span></h4><p>' + esc(I.skill || '') + '</p></div>' +
    '<div class="dbox" style="--bc:var(--gold)"><h4>Signature: ' + esc(A.np.name) + '<span>' + A.np.cd + 's cooldown &middot; ' + MANA.sigCost + ' mana</span></h4><p>' + esc(I.np || '') + '</p></div></div>';
  h += '<p class="note" style="margin:0">In the war, a master’s mana also pays for their servant’s Noble Phantasm. Masters deal half damage to servants.</p></div>';
  return h;
}
function entityRosterHTML(kind, cur, attr, withRandom) {
  var ids = kind === 'm' ? MASTER_ORDER : ORDER, T = kind === 'm' ? MASTERS : SERV;
  return (withRandom ? '<button type="button" class="rt rnd" ' + attr + '="random" aria-pressed="' + (cur === 'random') + '"><b>Random</b><small>Any ' + (kind === 'm' ? 'master' : 'servant') + '</small></button>' : '') +
    ids.map(function (id) { var d = T[id]; return '<button type="button" class="rt" ' + attr + '="' + id + '" aria-pressed="' + (cur === id) + '" style="--c:' + d.col + '"><span class="th">' + thumb(id, 110) + '</span><b>' + esc(shortName(d.name)) + '</b><small>' + (kind === 'm' ? esc(d.type) : d.cls) + '</small></button>'; }).join('');
}
function entityDetailHTML(kind, id, role) {
  var d = kind === 'm' ? MASTERS[id] : SERV[id];
  if (!d) return '<p class="sub">A random ' + (kind === 'm' ? 'master' : 'servant') + ' will be drawn when the battle starts.</p>';
  return '<div class="dhead"><b>' + esc(d.name) + '</b><span>' + (kind === 'm' ? esc(d.type) : d.cls) + (role ? ' &middot; ' + role : '') + '</span></div><p class="sub" style="margin:0 0 8px">' + esc(d.brief) + '</p>' + (kind === 'm' ? masterDetailHTML(d) : detailHTML(d));
}
