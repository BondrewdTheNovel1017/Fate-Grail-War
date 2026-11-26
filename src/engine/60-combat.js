/* source: attacker fighter (for facing checks) or projectile. returns outcome string */
function hurt(att, def, a, mult, src) {
  if (att && G.mode === 'war' && !!att.inM !== !!def.inM) return 'none';
  if (def.st === 'dead' || G.over) return 'none';
  if (truceStops(att, def)) return 'none';
  if (def.spirit === 2) return 'none';
  if (def.spirit === 1 || def.spirit === 3) { def.spirit = 0; FX.text(def, 'MATERIALIZED'); }
  var s = src || att, melee = !src;
  if (def.iframes > 0 && !a.pierce) { def.stat.dodge++; gainMom(def, 5); FX.text(def, 'DODGE'); FX.snd('whiff', def); FX.fx('dodgeHit', def.x, def.y, def); return 'dodge'; }
  if (def.wallT > 0 && a.key === 'np' && !a.strip) { FX.text(def, 'NP BLOCKED'); FX.fx('wallBlock', def.x, def.y, def); FX.snd('block', def, a); def.stat.blocks++; return 'block'; }
  var dmg = a.dmg * (att ? att.def.dmg : 1) * (mult || 1);
  if (att && att.def.lionheart && att.hp < att.def.hp * 0.5) dmg *= 1.12;
  if (G.mode === 'war' && !G.quick && a.key === 'np' && att && !att.def.isMaster) dmg *= 1.35;
  if (att && att.def.isMaster && !def.def.isMaster && !att.def.fightsServants) dmg *= (a.vsServant || 0.5);
  if (att && att.buffT > 0) dmg *= 1.15;
  if (att && G.tn && att.team !== def.team && !def.def.isMaster && G.clock && G.tn[att.team] && G.tn[att.team][def.def.id]) dmg *= 1.1; // true name known
  if (att && G.fields) { var hf = ownField(att); if (hf) dmg *= FIELD.home[hf.lvl]; }
  if (att && att.hidAct && melee) dmg *= 1.2; // struck from concealment
  if (att && att.rampT > G.time) dmg *= EVT.berserk.dmg; // Berserker unchained
  if (att && att.relic) dmg *= EVT2.festival.relicDmg; // the festival relic
  if (att && att.trueTeam !== undefined && def === att.partner) dmg *= RB.vsMaster; // a turned servant still holds back against its own master
  if (att) att.lastAtkT = G.time;
  if (att && G.event && grailMad(att)) dmg *= 1.2; // maddened by the corrupted Grail
  if (att && starved(att)) dmg *= MANA.starveDmg;
  if (G.mode === 'war' && !melee && !def.def.ranged && !def.def.isMaster) dmg *= WAR_MELEE_RANGED_TAKEN;
  if (att) { def.lastHit = { by: att, key: a.key }; def.lastHitT = G.time; }
  if (def.reinfT > 0) dmg *= 0.6;
  if (def.def.isMaster && G.clock && !G.clock.final) { dmg *= MASTER_GUARD; if (att && att.def.isMaster) dmg *= 0.5; } // before the final night masters fight from cover, and rarely duel each other
  if (a.silence && def.shieldT > 0) { def.shieldT = 0; def.shieldN = 0; dmg *= 2; FX.text(def, 'MERCURY SHATTERED'); }
  else if (def.shieldT > 0 && def.shieldN > 0 && !a.unblock) { def.shieldN--; if (def.shieldN <= 0) def.shieldT = 0; FX.text(def, 'MERCURY WALL'); FX.spark(def.x, def.y, '#d8dde2', 10); FX.snd('block', def, a); if (src) src.dead = true; return 'block'; }
  if (a.kind === 'proj' && !a.wave) dmg *= 1 - (def.def.arrowRes || (def.def.armor ? 0.4 : 0));
  if (def.def.dmgTaken) dmg *= def.def.dmgTaken;
  if (def.def.mr && (a.kind === 'proj' || a.spell)) dmg *= 1 - def.def.mr;
  if (att && att.field && a.spell !== 'noField') dmg *= 1.12;
  if (att && melee && att.def.backstab && Math.abs(angDiff(def.face, angTo(def, att))) > 2.2) { dmg *= att.def.backstab; FX.text(def, 'FROM BEHIND'); }
  if (def.st === 'counter' && !a.unblock) {
    def.stat.parry++; FX.text(def, 'COUNTER'); FX.spark(def.x, def.y, '#ffd36b', 12); FX.shake(5); FX.snd('counter', def); FX.fx('counter', def.x, def.y, def);
    if (att && melee) { var rd = 12 * def.def.dmg; att.hp -= rd; def.stat.dealt += rd; setStag(att, 0.9); if (att.hp <= 0) kill(att); }
    else if (!melee) { src.dead = true; }
    def.st = 'rec'; def.t = 0; def.recDur = 0.25; def.key = 'counter'; def.act = def.A.skill; def.ripo = 1.4; gainMom(def, 12); hitPause(melee ? att : null, def, 0.1); if (humanIn(att, def)) hitstopAt(def, 0.1);
    return 'counter';
  }
  var front = Math.abs(angDiff(def.face, angTo(def, s))) < 1.75;
  if (def.guarding && front && !a.unblock) {
    if (def.parryOk && def.guardT <= (def.def.parryWin || PARRY) && !a.noParry) {
      def.stat.parry++; gainMom(def, 12); def.ripo = 1.2; FX.text(def, 'PARRY'); FX.spark(def.x, def.y, '#ffffff', 14); FX.shake(6); FX.snd('parry', def); FX.fx('parry', def.x, def.y, def);
      hitPause(melee ? att : null, def, 0.12); if (humanIn(att, def)) hitstopAt(def, 0.12);
      if (att && melee) setStag(att, 0.9); else if (src) src.dead = true;
      return 'parry';
    }
    var cost = dmg * 1.15 * (a.gb ? 2.4 : 1) * (def.def.guardEcon || 1);
    def.sta -= cost; def.stDelay = 0.9;
    if (a.gb || def.sta <= 0) {
      def.stat.gbreak++; def.sta = Math.max(def.sta, 0); def.guarding = false;
      var gd = dmg * 0.6; def.hp -= gd; def.stat.taken += gd; if (att) { att.stat.dealt += gd; att.stat.hits++; gainMom(att, gd * 0.5); }
      setStag(def, 0.9); FX.text(def, 'GUARD BREAK'); FX.spark(def.x, def.y, '#f08a3b', 12); FX.shake(8); FX.snd('gbreak', def); FX.fx('gbreak', def.x, def.y, def); hitPause(melee ? att : null, def, 0.1);
      if (def.hp <= 0) kill(def);
      return 'gbreak';
    }
    var cd = dmg * (1 - def.def.guard * (1 - ((att && att.def.guardPierce) || 0))); def.hp -= cd; def.stat.taken += cd; def.stat.blocks++;
    if (att) { att.stat.dealt += cd; gainMom(att, cd * 0.4); }
    gainMom(def, 3 + (def.def.blockMom || 0)); FX.spark(def.x, def.y, '#9ec4d8', 5); FX.snd('block', def, a); hitPause(melee ? att : null, def, 0.035);
    if (def.hp <= 0) kill(def);
    return 'block';
  }
  var ar = armored(def), taken = dmg * (ar ? (def.wallT > 0 ? 0.4 : 0.9) : 1);
  if (def.st === 'rec' && def.key === 'counter') taken = dmg;
  if (def.def.bc && def.hp < def.def.hp * 0.3) taken *= 0.85;
  if (att && def.hp - taken <= 0 && def.hp > 1 && familyHold(att, def)) taken = def.hp - 1; // a bond stops the hand, once
  def.hp -= taken; def.stat.taken += taken; def.hit = 0.15; witnessHit(att, def, a); if (!def.saidLow && def.hp > 0 && def.hp < def.def.hp * 0.3 && G.mode === 'war') { def.saidLow = true; FX.say(def, 'low'); } if (att && att.def.lifesteal && att.st !== 'dead') att.hp = Math.min(att.def.hp, att.hp + taken * att.def.lifesteal);
  if (att) { att.stat.dealt += taken; att.stat.hits++; gainMom(att, taken * 0.6); }
  gainMom(def, taken * 0.35);
  if (a.bleed && att) { def.bleedT = a.bleed.t; def.bleedDps = a.bleed.dps; def.bleedBy = att; def.burnFx = false; FX.text(def, 'BLEED'); }
  if (a.root) { def.rootT = a.root; FX.text(def, 'BOUND'); }
  if (a.silence && def.def.isMaster) { def.silenceT = a.silence; FX.text(def, 'MAGIC CIRCUITS BURNED'); }
  if (a.burn && att) { def.bleedT = a.burn.t; def.bleedDps = a.burn.dps; def.bleedBy = att; def.burnFx = true; FX.text(def, 'BURNING'); }
  if (att && att.def.lionheart) att.sta = Math.min(100, att.sta + 4);
  def.quietT = 0; def.hid = false; if (def.cnc) { def.cnc = false; def.cncCd = G.time + 3; }
  if (a.strip && a.key === 'np' && att && G.mode === 'war') ruleBreak(att, def);
  if (a.strip) { breakField(def, 'FIELD BROKEN'); def.wallT = 0; def.veilT = 0; def.bleedT = 0; def.mom = 0; FX.text(def, 'STRIPPED'); FX.spark(def.x, def.y, '#d6b4ff', 14); }
  FX.spark(def.x, def.y, '#e2515c', a.power >= 2 ? 12 : 6); FX.text(def, String(Math.round(taken)));
  FX.snd(a.power >= 3 ? 'hitNP' : a.power >= 2 ? 'hitH' : 'hitL', def, { armor: ar });
  if (a.power >= 3) { FX.slow(0.5); FX.fx('npHit', def.x, def.y, def); }
  var hsv = a.hs !== undefined ? a.hs : (a.power >= 3 ? 0.16 : a.power >= 2 ? 0.09 : 0.045);
  if (a.power >= 3 && a.key === 'np' && att && !att.def.isMaster) hitstopAt(def, hsv); else hitPause(melee ? att : null, def, hsv);
  FX.shake(a.power >= 3 ? 12 : a.power >= 2 ? 6 : 2.5);
  if (def.hp <= 0) { kill(def); return 'kill'; }
  var arrowFlinch = a.kind === 'proj' && a.power < 2 && (def.st === 'wind' || def.st === 'act');
  if (arrowFlinch) { /* light arrows do not break a wind-up */ }
  else if (a.noStag) { /* bullets chip without stunning */ }
  else if (!ar || a.power >= 2) { if (!(ar && a.power === 2 && def.wallT > 0)) setStag(def, ar ? Math.min(a.stag, 0.4) : a.stag); }
  var dx = def.x - (s ? s.x : def.x), dy = def.y - (s ? s.y : def.y), L = Math.hypot(dx, dy) || 1, kb = a.kb !== undefined ? a.kb : (a.power >= 2 ? 210 : 90);
  def.kx = dx / L * kb; def.ky = dy / L * kb;
  return 'hit';
}

/* ---- actions ---- */
function startAct(f, key) {
  var a = f.A[key];
  if (key === 'light' && f.A.lightSeq) a = f.A.lightSeq[Math.min(f.combo, f.A.lightSeq.length - 1)];
  if ((key === 'light' || key === 'heavy') && f.armT > 0 && f.arm >= 0 && f.A.arms) a = f.A.arms[f.arm][key];
  if ((key === 'light' || key === 'heavy') && f.brokenT > 0) { FX.text(f, 'NO BLADE'); return false; }
  if ((key === 'light' || key === 'heavy') && !canFire(f, a)) return false;
  if (f.sta <= 0 || f.exh > 0) return false;
  f.hidAct = !!(f.hid && key !== 'np'); if (key === 'np') { f.hid = false; f.hidAct = false; }
  f.quietT = 0; f.hid = false; if (f.cnc) { f.cnc = false; f.cncCd = G.time + 3; }
  f.act = a; f.key = key; f.st = 'wind'; f.t = 0; f.hitDone = false; f.atkId++;
  f.sta -= a.cost; f.stDelay = 0.7;
  if (f.sta <= 0) { f.sta = 0; f.exh = 1.0; f.stDelay = 0.9; FX.snd('exhaust', f); }
  f.curWind = a.wind * (key === 'light' && f.combo > 0 ? 0.8 : 1);
  f.goal = 0; f.windTotal = f.curWind;
  if (a.max && f.ai) { /* AI sets goal */ }
  if (key === 'skill') { f.cd = a.cd || 5; if (a.momGain) gainMom(f, a.momGain); if (a.beam) FX.snd('beamCharge', f, a); if (a.shape === 'drill') FX.snd('drawBow', f, a); }
  if (key === 'np' && a.marble === 'ionioi') { if (G.marble && G.marble.kind === 'ionioi' && G.marble.owner === f) { f.curWind = a.wind * 0.55; f.windTotal = f.curWind; } else setMarble('ionioi', f); }
  if (f.def.isMaster && G.mode === 'war' && masterCost(key)) payMana(f, masterCost(key));
  if (key === 'np' && f.def.isMaster) { f.sigCd = a.cd || 20; }
  else if (key === 'np') { spendNP(f); f.mom = 0; f.stat.nps++; if (a.momLock) f.momLockT = G.time + a.momLock; G.dimT = a.wind + 0.35; FX.banner(a.name, a.sub, f); FX.say(f, 'np'); if (!f.inM) { witness(f.x, f.y, [f.team], 4); fightNoise(f.x, f.y, 4500); } if (!f.def.isMaster) { npSeen(f); npHitsBoss(f, a); npRepelsShadow(f); } FX.snd('npcast', f, a); FX.fx('npcast', f.x, f.y, f); }
  if (a.hop) { FX.snd('hop', f, a); FX.fx('hop', f.x, f.y, f); }
  if (a.kind === 'counter') { f.st = 'counter'; f.t = 0; f.dur = a.dur; FX.snd('counter0', f, a); FX.fx('stance', f.x, f.y, f); }
  return true;
}
function startDodge(f) {
  if (f.dodges <= 0) { FX.snd('nodge', f); return; }
  if (f.sta <= 0 || f.exh > 0) return;
  var mx = f.inp.mx, my = f.inp.my, L = Math.hypot(mx, my);
  if (L < 0.2) { var back = angTo(f, f.foe) + Math.PI; mx = Math.cos(back); my = Math.sin(back); L = 1; }
  f.dodgeX = mx / L; f.dodgeY = my / L;
  f.sta -= 12 * (f.def.dodgeCost || 1); f.stDelay = 0.6; if (f.sta <= 0) { f.sta = 0; f.exh = 0.8; }
  f.dodges--; FX.snd('dodge', f); FX.fx('dodge', f.x, f.y, f);
  f.st = 'dodge'; f.t = 0; f.act = null; f.combo = 0;
}
function toRec(f, last) {
  f.st = 'rec'; f.t = 0;
  var a = f.act, n = f.def.combo;
  var lastLight = f.key === 'light' && f.combo >= n - 1;
  f.recDur = a.rec * f.def.recMul * (lastLight ? (f.A.lightSeq ? 1.25 : 2.4) : 1);
  if (f.key === 'light' && !lastLight) f.recDur *= 0.9;
}
function turnToward(f, ang, rate, dt) {
  var d = angDiff(f.face, ang), m = rate * dt;
  f.face += clamp(d, -m, m);
}
function meleeCheck(f, a, mult) {
  hitMobsArc(f, a, mult);
  var o = f.foe;
  var rmul = f.def.hiddenReach ? (f.veilT > 0 ? f.A.skill.reachMul : f.def.hiddenReach) : 1;
  var res = 'miss', es = enemiesOf(f);
  for (var i = 0; i < es.length; i++) { var e = es[i]; if (dist(f, e) <= a.reach * rmul + FR && Math.abs(angDiff(f.face, angTo(f, e))) <= a.arc) { var r0 = hurt(f, e, a, mult); if (e === o || res === 'miss') res = r0; } }
  return res;
}
var GATE_POS = [[-6, -54], [-6, 54], [-34, 0], [-20, -28], [-20, 28]];
function gatePos(f, i) { var gp = GATE_POS[i % 5], c = Math.cos(f.face), sn = Math.sin(f.face); return { x: f.x + c * gp[0] - sn * gp[1], y: f.y + sn * gp[0] + c * gp[1] }; }
function spawnProj(f, a, mult, ang, idx) {
  var sx0 = f.x + Math.cos(ang) * 26, sy0 = f.y + Math.sin(ang) * 26;
  if (a.gate) { var gq = gatePos(f, a.kind === 'volley' ? idx || 0 : f.combo); sx0 = gq.x; sy0 = gq.y; ang = angTo(gq, f.foe) + (ang - f.face); FX.fx('gate', sx0, sy0, f); }
  G.proj.push({ x: sx0, y: sy0, vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, owner: f, a: a, mult: mult, range: a.range, trav: 0, dead: false });
}
function strikeInit(f) {
  var a = f.act, o = f.foe, mult = 1;
  if (f.key === 'light') {
    var n = f.def.combo; mult = (f.combo >= n - 1 && !f.A.lightSeq) ? 1.35 : 1;
    if (f.ripo > 0) { mult *= 1.5; f.ripo = 0; }
    if (f.crit > 0) { mult *= 1.6; f.crit = 0; }
  }
  if (f.key === 'heavy') mult = 1 + 0.3 * f.chg;
  if (f.veilT > 0 && f.A.skill.reachMul) mult *= 1.2;
  var k = a.kind;
  if (f.key === 'light' || f.key === 'heavy') { FX.snd((k === 'proj' || k === 'volley') ? 'shoot' : k === 'rain' ? 'skill:' + f.def.id : (f.key === 'heavy' ? 'swingH' : 'swingL'), f, a); if (f.key === 'heavy' && k === 'melee') FX.fx('heavySwing', f.x, f.y, f); }
  if (f.key === 'skill' && f.def.hiddenReach) { f.revealT = G.time + 0.55; FX.fx('airRelease', f.x, f.y, f); }
  if (f.key === 'skill') { if (a.beam) FX.fx('miniBeam', f.x, f.y, f); FX.snd('skill:' + f.def.id, f, a); if (k === 'melee') FX.fx('bash', f.x, f.y, f); if (k === 'shadow') FX.fx('shadowOut', f.x, f.y, f); }
  if (f.key === 'np' && !f.def.isMaster) { if (a.breaksMarble) breakMarble(f); FX.snd('npfire:' + f.def.id, f, a); FX.fx('npfire', f.x, f.y, f); }
  if (k === 'melee') { if (a.arc) meleeCheck(f, a.lunge > 100 ? Object.assign({}, a, { reach: a.reach + a.lunge * 0.85 }) : a, mult); }
  else if (k === 'proj') { spawnProj(f, a, mult, f.face, 0); if (a.breakT) { f.brokenT = a.breakT + a.rec; FX.text(f, 'BLADE SHATTERED'); FX.fx('swordBreak', f.x + Math.cos(f.face) * 40, f.y + Math.sin(f.face) * 40, f); } }
  else if (k === 'volley') { var vn = a.ammo && hasMag(f) ? Math.min(a.count, f.ammo) : a.count; for (var vi = 0; vi < vn; vi++) { if (a.ammo && hasMag(f)) takeRound(f); spawnProj(f, a, mult, f.face + (vi - (vn - 1) / 2) * a.spread, vi); } FX.shake(3); }
  else if (k === 'aoe') {
    enemiesOf(f).forEach(function (e) { if (dist(f, e) <= a.r + FR) { var r = hurt(f, e, a, 1); if (r === 'hit' || r === 'gbreak') { var an = angTo(f, e); e.kx = Math.cos(an) * 260; e.ky = Math.sin(an) * 260; } } });
    if (f.key !== 'np') { FX.spark(f.x, f.y, '#f0a93b', 16); FX.shake(7); FX.fx('slam', f.x, f.y, f); } else { FX.shake(14); }
  }
  else if (k === 'shadow') {
    var bx = o.x - Math.cos(o.face) * 62, by = o.y - Math.sin(o.face) * 62;
    f.x = clamp(bx, 30, W - 30); f.y = clamp(by, 30, H - 30); f.face = angTo(f, o); f.crit = 2.2; FX.spark(f.x, f.y, '#9aa7b3', 12); FX.fx('shadowIn', f.x, f.y, f);
  }
  else if (k === 'arm') { f.arm = Math.floor(rnd() * f.A.arms.length); f.armT = a.dur; FX.text(f, f.A.arms[f.arm].name.toUpperCase()); FX.fx('arm', f.x, f.y, f); FX.shake(3); }
  else if (k === 'barrage') { f.barN = 0; f.barT = 0; }
  else if (k === 'heal') { var ht = a.self ? f : f.partner; if (ht && ht.st !== 'dead' && (a.self || dist(f, ht) <= a.range)) { ht.hp = Math.min(ht.def.hp, ht.hp + a.amount); FX.text(ht, '+' + a.amount); FX.fx('heal', ht.x, ht.y, ht); FX.snd('field', ht); } else FX.text(f, 'TOO FAR'); }
  else if (k === 'haste') { f.hasteT = a.dur; FX.text(f, 'DOUBLE ACCEL'); FX.fx('heal', f.x, f.y, f); }
  else if (k === 'siphon') { var got = 0; enemiesOf(f).forEach(function (o) { if (dist(f, o) <= a.r + FR) { if (hurt(f, o, { dmg: a.dmg, stag: 0.2, power: 1, unblock: true, spell: true, hs: 0.04, arc: 0, key: 'skill', vsServant: 1 }, 1, f) === 'hit') got += a.dmg; } }); if (got) { f.hp = Math.min(f.def.hp, f.hp + got); FX.text(f, '+' + got); } FX.fx('heal', f.x, f.y, f); FX.text(f, 'IMAGINARY DRAIN'); }
  else if (k === 'shield') { f.shieldN = a.hits; f.shieldT = a.dur; FX.text(f, 'VOLUMEN HYDRARGYRUM'); FX.fx('heal', f.x, f.y, f); }
  else if (k === 'reinforce') { f.reinfT = a.dur; FX.text(f, 'REINFORCEMENT'); FX.fx('heal', f.x, f.y, f); }
  else if (k === 'buff') { if (f.partner && f.partner.st !== 'dead') { f.partner.buffT = a.dur; FX.text(f.partner, 'STRATEGY: ADVANCE'); FX.fx('heal', f.partner.x, f.partner.y, f.partner); } }
  else if (k === 'drain') { var pd2 = f.partner; if (pd2 && pd2.st !== 'dead' && f.hp > a.selfDmg + 5) { f.hp -= a.selfDmg; pd2.mom = Math.min(100, pd2.mom + a.mom); FX.text(f, '-' + a.selfDmg); FX.text(pd2, 'MANA SURGE'); FX.fx('seal', pd2.x, pd2.y, pd2); } }
  else if (k === 'gift') { var pg = f.partner; if (pg && pg.st !== 'dead') { pg.sta = 100; pg.mom = Math.min(100, pg.mom + a.mom); FX.text(pg, 'MANA TRANSFER'); FX.fx('heal', pg.x, pg.y, pg); } }
  else if (k === 'ubw') { f.ubwA = a; setMarble('ubw', f); f.ubwT = a.dur; if (f.def.trace) { f.ubwUsed = true; FX.banner('Unlimited Blade Works', 'Trace on', f); var gil = G.f.filter(function (o) { return o.def.id === 'gilgamesh' && o.st !== 'dead' && o.inM && o.team !== f.team; })[0]; if (gil) FX.duo(f, 'ubwgil', gil, 'ubwgilR'); } f.ubwCd = 0.6; FX.text(f, 'UNLIMITED BLADE WORKS'); enemiesOf(f).forEach(function (o) { for (var zi = 0; zi < a.rain; zi++) { var za = zi * 2.1, zr = zi === 0 ? 0 : 70; G.zones.push({ x: clamp(o.x + Math.cos(za) * zr, 40, W - 40), y: clamp(o.y + Math.sin(za) * zr, 40, H - 40), r: 70, delay: 0.7 + zi * 0.12, t: 0, owner: f, a: { dmg: a.rainDmg, zshape: 'sword', key: 'np' }, done: false }); } }); }
  else if (k === 'wall') { f.wallT = a.dur; FX.shake(5); }
  else if (k === 'veil') { f.veilT = a.dur; FX.shake(2); FX.fx('veil', f.x, f.y, f); }
  else if (k === 'rain') {
    for (var i = 0; i < a.count; i++) {
      var ang = rnd() * Math.PI * 2, rr = i === 0 ? 0 : 60 + rnd() * a.spread;
      G.zones.push({ x: clamp(o.x + Math.cos(ang) * rr, 40, W - 40), y: clamp(o.y + Math.sin(ang) * rr, 40, H - 40), r: a.zr, delay: a.delay + i * 0.11, t: 0, owner: f, a: a, done: false });
    }
  }
  else if (k === 'grab') {
    if (dist(f, o) <= a.reach + FR && Math.abs(angDiff(f.face, angTo(f, o))) <= a.arc) {
      if (o.iframes > 0) { hurt(f, o, a, 1); }
      else if (o.hp <= o.def.hp * 0.3) { FX.text(o, 'EXECUTED'); FX.fx('execute', o.x, o.y, o); FX.snd('execute', o); o.hp = 0; f.stat.dealt += 30; f.stat.hits++; FX.shake(14); kill(o, true); }
      else hurt(f, o, a, 1);
    }
  }
  else if (k === 'charge') { f.cx = Math.cos(f.face); f.cy = Math.sin(f.face); f.chargeHit = false; }
  else if (k === 'pulses') { f.pulseN = 0; f.pulseT = 0; f.cx = Math.cos(f.face); f.cy = Math.sin(f.face); }
  if (a.kind !== 'pulses' && a.kind !== 'charge') f.hitDone = true;
}
function stepF(f, dt) {
  if (f.hs > 0) { f.hs -= dt; return; }
  var o = f.foe, a = f.act, vx = 0, vy = 0;
  f.iframes = (f.ghT > 0 || (f.st === 'act' && f.act && f.act.diveI && f.t < f.act.diveI) || (f.st === 'dodge' && f.t > 0.03 && f.t < 0.27) || (f.st === 'wind' && f.act && f.act.hop && f.t > 0.03 && f.t < 0.2)) ? 1 : 0;
  f.t += dt;
  if (f.cd > 0) f.cd -= dt * (f.def.cdRate || 1) * (f.field ? 1.5 : 1);
  if (f.st !== 'dead' && !G.over) {
    if (f.def.field) {
      var still = Math.hypot(f.inp.mx, f.inp.my) < 0.15 && f.st !== 'dodge' && f.st !== 'stag' && f.exh <= 0;
      if (f.field) { if (Math.hypot(f.x - f.field.x, f.y - f.field.y) > f.field.r) breakField(f, 'FIELD LOST'); }
      else if (still) { f.stillT += dt; if (f.stillT >= f.def.field.still) { f.field = { x: f.x, y: f.y, r: f.def.field.r, t: 0 }; f.stillT = 0; FX.text(f, 'TERRITORY'); FX.snd('field', f); FX.fx('fieldOn', f.x, f.y, f); } }
      else f.stillT = Math.max(0, f.stillT - dt * 2);
      if (f.field) f.field.t += dt;
    }
    // Presence Concealment: an Assassin's own spirit form. Unseen, it heals out of combat and can strike straight from it
    if (f.cnc) { f.hid = true; if (G.time - (f.lastHitT || -99) > 4) f.hp = Math.min(f.def.hp, f.hp + (G.mode === 'war' ? 5 : 2) * dt); }
  }
  if (f.bleedT > 0 && f.st !== 'dead' && !G.over) { f.bleedT -= dt; var bd = f.bleedDps * dt; f.hp -= bd; f.stat.taken += bd; if (f.bleedBy) f.bleedBy.stat.dealt += bd; if (Math.floor(G.time * 14) % 3 === 0) FX.spark(f.x, f.y, f.burnFx ? '#ff8a3a' : '#b3202a', f.burnFx ? 2 : 1); if (f.hp <= 0) kill(f); } if (f.buf.t > 0) f.buf.t -= dt; else f.buf.name = null;
  godHandTick(f);
  if (f.ripo > 0) f.ripo -= dt; if (f.crit > 0) f.crit -= dt; if (f.wallT > 0) f.wallT -= dt; if (f.veilT > 0) f.veilT -= dt; if (f.ghT > 0) f.ghT -= dt; if (f.exh > 0) f.exh -= dt; if (f.hit > 0) f.hit -= dt;
  if (f.ubwT > 0 && f.st !== 'dead' && !G.over) {
    f.ubwT -= dt; f.ubwCd -= dt;
    if (!(G.marble && G.marble.kind === 'ubw' && G.marble.owner === f)) f.ubwT = 0;
    if (G.mode === 'war' && tg0Fix(f)) {}
    if (f.ubwCd <= 0) { var tg = f.foe; if (tg && tg.st !== 'dead' && dist(f, tg) < 900) { f.ubwCd = (f.ubwA || f.A.np).ubwRate; var n0 = f.ubwN = (f.ubwN || 0) + 1, sa = n0 * 2.4, sx = f.x + Math.cos(sa) * 46, sy = f.y + Math.sin(sa) * 46; G.proj.push({ x: sx, y: sy, vx: 0, vy: 0, owner: f, a: (f.ubwA || f.A.np).sword, mult: 1, range: 900, trav: 0, dead: false }); var lp = G.proj.at(-1), an = Math.atan2(tg.y - sy, tg.x - sx); lp.vx = Math.cos(an) * lp.a.speed; lp.vy = Math.sin(an) * lp.a.speed; FX.snd('shoot', f, lp.a); } }
  }
  if (f.st !== 'dead' && !G.over) {
    if (f.spirit === 1) { f.spT -= dt; if (f.spT <= 0) f.spirit = 2; }
    else if (f.spirit === 3) { f.spT -= dt; if (f.spT <= 0) { f.spirit = 0; FX.text(f, 'MATERIALIZED'); } }
    else if (f.spirit === 2) { f.hp = Math.min(f.def.hp, f.hp + (G.mode === 'war' ? 5 : 2) * dt); }
    if (f.orphanT > 0) { f.orphanT -= dt; if (f.orphanT <= 0) { FX.text(f, 'FADED'); f.hp = 0; f.cause = 'fade'; kill(f, true); } }
    if (f.hasteT > 0) f.hasteT -= dt;
    if (f.sealOrder > 0) f.sealOrder -= dt;
    if (f.def.trace) traceTick(f, dt);
    if (f.def.mag) ammoTick(f, dt);
    if (MAP.doors) doorTick(f, dt);
    if (f.def.isMaster && G.mode === 'war') manaTick(f, dt);
    if (f.sigCd > 0) f.sigCd -= dt; if (f.silenceT > 0) f.silenceT -= dt; if (f.shieldT > 0) f.shieldT -= dt; if (f.rootT > 0) f.rootT -= dt; if (f.buffT > 0) f.buffT -= dt; if (f.reinfT > 0) f.reinfT -= dt;
  }
  if (f.brokenT > 0) { f.brokenT -= dt; if (f.brokenT <= 0) { FX.text(f, 'REFORGED'); FX.snd('charge', f); } }
  if (f.armT > 0) { f.armT -= dt; if (f.armT <= 0) { f.arm = -1; FX.text(f, 'EMPTY HANDS'); } }
  if (f.st === 'dead') return;
  if (f.dodges < f.dodgeMax) { f.dodgeRe += dt * (f.def.dodgeRate || 1); if (f.dodgeRe >= 3.6) { f.dodgeRe = 0; f.dodges++; FX.snd('charge', f); } } else f.dodgeRe = 0;
  var was = f.guarding;
  f.guarding = f.st === 'idle' && f.inp.guard && f.sta > 0 && f.exh <= 0 && f.brokenT <= 0 && !f.spirit;
  if (f.guarding && !was) { f.parryOk = (G.time - f.lastG) > 0.55; f.lastG = G.time; }
  f.guardT = f.guarding ? f.guardT + dt : 0;
  if (f.stDelay > 0) f.stDelay -= dt; else if (f.sta < 100) f.sta = Math.min(100, f.sta + (f.guarding ? 9 : 34 * (f.def.staRegen || 1) * (f.field ? 1.3 : 1)) * dt);
  var slow = (G.f.some(function (c) { return c.team !== f.team && inField(c, f); }) ? 0.88 : 1) * (f.wallT > 0 ? 0.6 : 1) * ((o.wallT > 0 && dist(f, o) < 270) ? 0.6 : 1) * ((o.def.gazeSlow && dist(f, o) < 270 && Math.abs(angDiff(o.face, angTo(o, f))) < 0.9) ? o.def.gazeSlow : 1);
  var toO = angTo(f, o);
  if (f.st === 'idle') {
    var sp = f.def.spd * (f.guarding ? 0.55 : 1) * (f.exh > 0 ? 0.5 : 1) * slow * (f.spirit === 2 ? 1.3 : f.spirit ? 0.5 : 1) * (f.hasteT > 0 ? 1.8 : 1) * (f.rootT > 0 ? 0 : 1) * (f.fslowT > G.time ? f.fslowK : 1) * (f.buffT > 0 ? 1.1 : 1);
    var L = Math.hypot(f.inp.mx, f.inp.my); if (L > 1) L = 1;
    var dl = Math.hypot(f.inp.mx, f.inp.my) || 1;
    vx = f.inp.mx / dl * L * sp; vy = f.inp.my / dl * L * sp;
    turnToward(f, toO, 14, dt);
    var n = f.buf.name;
    if (n && f.spirit && n !== 'spirit') { f.buf.name = null; n = null; }
    if (n === 'np' && f.trueTeam !== undefined) { f.buf.name = null; n = null; } // a turned servant cannot call its Noble Phantasm
    if (n && f.exh <= 0) {
      var ok = false;
      if (n === 'dodge') { startDodge(f); ok = true; }
      else if (n === 'skill') { if (f.def.isMaster && G.mode === 'war' && f.cd <= 0 && !(f.silenceT > 0) && !canPay(f, MANA.skillCost)) FX.text(f, 'NO MANA'); else if (f.cd <= 0 && !(f.def.isMaster && f.silenceT > 0)) ok = startAct(f, 'skill'); else if (f.def.isMaster && f.silenceT > 0) FX.text(f, 'CIRCUITS BURNED'); }
      else if (n === 'np') { if (f.def.isMaster ? (f.sigCd <= 0 && !(f.silenceT > 0) && (G.mode !== 'war' || canPay(f, MANA.sigCost))) : (f.mom >= 100 && canNP(f))) ok = startAct(f, 'np'); else if (f.def.isMaster && f.silenceT > 0) FX.text(f, 'CIRCUITS BURNED'); else if (f.def.isMaster ? f.sigCd <= 0 : f.mom >= 100) FX.text(f.def.isMaster ? f : (livingMaster(f) || f), 'NO MANA'); }
      else if (n === 'spirit' && f.def.cls === 'Assassin') { if (f.cnc) { f.cnc = false; f.hid = false; f.cncCd = G.time + 1; FX.fx('spiritOut', f.x, f.y, f); } else if (G.time >= (f.cncCd || 0) && f.st === 'idle') { f.cnc = true; f.hid = true; FX.fx('hide', f.x, f.y, f); } ok = true; }
      else if (n === 'spirit') { if (!f.def.isMaster) { if (f.spirit === 0) { f.spirit = 1; f.spT = 1.5; FX.text(f, 'SPIRIT FORM'); FX.fx('spiritIn', f.x, f.y, f); } else if (f.spirit === 2) { f.spirit = 3; f.spT = 1.0; FX.fx('spiritOut', f.x, f.y, f); } } ok = true; }
      else if (n === 'heavy') { f.combo = 0; ok = startAct(f, 'heavy'); }
      else if (n === 'light') { f.combo = 0; ok = startAct(f, 'light'); }
      f.buf.name = null;
    }
  }
  else if (f.st === 'wind') {
    var heavy = a.max;
    var spw = f.def.spd * (a.hop || a.kind === 'pulses' ? 0 : (f.key === 'np' ? 0 : 0.22)) * slow;
    vx = f.inp.mx * spw; vy = f.inp.my * spw;
    if (a.hop) { var bk = f.face + Math.PI; vx = Math.cos(bk) * a.hop / a.wind; vy = Math.sin(bk) * a.hop / a.wind; }
    var track = heavy ? f.t < a.wind * 0.75 : f.t < f.curWind * 0.6;
    if (f.key === 'np' && a.kind !== 'rain') track = f.t < f.curWind * 0.7;
    if (track) turnToward(f, toO, heavy ? 5 : (f.key === 'np' ? 4 : 8), dt);
    var go = false;
    if (heavy) { if (f.t >= a.wind && (!f.inp.heavy || f.t >= a.max)) { f.chg = clamp((f.t - a.wind) / (a.max - a.wind), 0, 1); go = true; } }
    else if (f.t >= f.curWind) go = true;
    if (go) { f.st = 'act'; f.t = 0; strikeInit(f); }
  }
  else if (f.st === 'act') {
    if (a.lunge && f.t < a.act) { var lsp = a.lunge / a.act; if (a.lunge > 100) lsp = Math.max(0, Math.min(lsp, (dist(f, o) - 62) / 0.05)); vx = Math.cos(f.face) * lsp; vy = Math.sin(f.face) * lsp; }
    if (a.kind === 'charge') {
      var spd = a.dist / a.act; vx = f.cx * spd; vy = f.cy * spd;
      if (!f.chargeHit) enemiesOf(f).forEach(function (e) { if (!f.chargeHit && dist(f, e) < FR + a.reach) { f.chargeHit = true; var r = hurt(f, e, a, f.def.chargeMul || 1); if (r === 'hit') { e.kx = f.cx * 320; e.ky = f.cy * 320; } } });
    }
    if (a.kind === 'barrage') {
      turnToward(f, toO, a.track || 1.2, dt);
      f.barT += dt;
      while (f.barN * a.rate <= f.barT && f.barN * a.rate < a.act) {
        if (a.ammo && hasMag(f)) { if (f.ammo <= 0) { f.t = Math.max(f.t, a.act); FX.text(f, 'CLICK'); break; } takeRound(f); }
        f.barN++; spawnProj(f, a.bullet, 1, f.face + (rnd() - 0.5) * 2 * a.spread);
        FX.snd('gun', f); FX.spark(f.x + Math.cos(f.face) * 44, f.y + Math.sin(f.face) * 44, '#ffd36b', 1);
      }
      vx = f.inp.mx * f.def.spd * 0.15; vy = f.inp.my * f.def.spd * 0.15;
    }
    if (a.kind === 'pulses') {
      if (f.t < 0.25 && a.leap) { var lp = a.leap / 0.25, dd = Math.max(0, dist(f, o) - 70); lp = Math.min(lp, dd / 0.25); vx = Math.cos(toO) * lp; vy = Math.sin(toO) * lp; }
      f.pulseT += dt;
      while (f.pulseN < a.pulses && f.pulseT >= (f.pulseN + 1) * a.interval) {
        f.pulseN++;
        enemiesOf(f).forEach(function (e) { if (dist(f, e) <= a.r + FR) hurt(f, e, { dmg: a.dmg, stag: 0.25, power: 1, hs: 0.02, arc: 0, unblock: a.unblock, noParry: a.unblock, key: a.key }, 1); });
        FX.shake(3); FX.spark(f.x, f.y, '#e2515c', 6); FX.snd('pulse', f, f.pulseN); FX.fx('pulse', f.x, f.y, f);
      }
    }
    if (f.t >= a.act) toRec(f);
  }
  else if (f.st === 'rec') {
    var n2 = f.def.combo;
    if (f.key === 'light' && f.combo < n2 - 1 && f.buf.name === 'light' && f.t >= f.recDur * 0.5 && f.exh <= 0) {
      f.combo++; f.buf.name = null; var c = f.combo; startAct(f, 'light'); f.combo = c; f.curWind = f.act.wind * 0.8; f.windTotal = f.curWind;
    }
    else if (f.buf.name === 'dodge' && f.t >= f.recDur * 0.35 && f.sta > 0 && f.exh <= 0 && f.dodges > 0) { f.buf.name = null; startDodge(f); }
    else if (f.t >= f.recDur) { f.st = 'idle'; f.combo = 0; f.t = 0; }
    else { var sr = f.def.spd * 0.12; vx = f.inp.mx * sr; vy = f.inp.my * sr; }
  }
  else if (f.st === 'stag') {
    if (f.t >= f.dur) { f.st = 'idle'; f.t = 0; }
  }
  else if (f.st === 'dodge') {
    var T = 0.28;
    if (f.t < T) { var dv = 2 * 195 / T * (1 - f.t / T); vx = f.dodgeX * dv; vy = f.dodgeY * dv; }
    if (f.t >= 0.4) { f.st = 'idle'; f.t = 0; }
  }
  else if (f.st === 'counter') {
    if (f.t >= f.dur) { f.st = 'rec'; f.t = 0; f.recDur = 0.55; f.key = 'counter'; f.act = f.A.skill; }
    turnToward(f, toO, 6, dt);
  }
  if (f.pull > 0) { f.pull -= dt; var pdd = dist(f, o) - 72; if (pdd > 0) { var psp = Math.min(pdd / dt, 2400); vx += Math.cos(toO) * psp; vy += Math.sin(toO) * psp; } }
  f.x += (vx + f.kx) * dt; f.y += (vy + f.ky) * dt;
  var dec = Math.exp(-9 * dt); f.kx *= dec; f.ky *= dec;
}
function explode(p) {
  var e = p.a.explode; p.exploded = true; hitMobsAt(p.x, p.y, e.r, e.dmg, p.owner.team);
  FX.fx('explode', p.x, p.y, { def: p.owner.def, r: e.r, big: e.big }); FX.snd(e.big ? 'boomBig' : 'boom', { x: p.x, y: p.y, idx: -1 }); FX.shake(e.big ? 16 : 9);
  enemiesOf(p.owner).forEach(function (o) { if (Math.hypot(o.x - p.x, o.y - p.y) <= e.r + FR) { var r = hurt(p.owner, o, { dmg: e.dmg, stag: e.stag || 0.7, power: e.big ? 3 : 2, gb: true, unblock: !!e.unblock, noParry: true, arc: 0, key: p.a.key, kind: 'blast', spell: true, hs: 0.08 }, p.mult, { x: p.x, y: p.y }); if (r === 'hit') { var an = Math.atan2(o.y - p.y, o.x - p.x); o.kx = Math.cos(an) * 300; o.ky = Math.sin(an) * 300; } } });
}
function stepProj(dt) {
  for (var i = G.proj.length - 1; i >= 0; i--) {
    var p = G.proj[i]; if (p.owner && p.owner.hs > 0) continue;
    var sx = p.x, sy = p.y, ox = p.vx * dt, oy = p.vy * dt;
    if (p.a.home) { var ht = p.homeT; if (!ht || ht.st === 'dead' || !sameLayer(ht, p.owner)) { ht = p.homeT = (p.owner.foe && p.owner.foe.st !== 'dead' && sameLayer(p.owner.foe, p.owner) && p.owner.foe.team !== p.owner.team) ? p.owner.foe : nearestEnemyTo(p.owner, p, 900); } if (ht) { var va = Math.atan2(p.vy, p.vx), want = Math.atan2(ht.y - p.y, ht.x - p.x), dA = angDiff(va, want), turn = clamp(dA, -p.a.home * dt, p.a.home * dt), sp2 = Math.hypot(p.vx, p.vy); va += turn; p.vx = Math.cos(va) * sp2; p.vy = Math.sin(va) * sp2; ox = p.vx * dt; oy = p.vy * dt; } }
    p.x += ox; p.y += oy; p.trav += Math.hypot(ox, oy);
    var es = enemiesOf(p.owner), tgt = p.owner.foe;
    if (p.trav > p.range || p.x < 0 || p.y < 0 || p.x > W || p.y > H) p.dead = true;
    if (RECTS.length && !p.owner.inM) { var RQ = rectsIn(sx, sy, p.x, p.y); for (var rq = 0; rq < RQ.length; rq++) if (!RQ[rq].nb && segRect(sx, sy, p.x, p.y, RQ[rq], 0)) { p.dead = true; FX.spark(p.x, p.y, '#8aa0b2', 4); break; } }
    var PL = p.owner.inM ? [] : pillarsIn(sx, sy, p.x, p.y); for (var k = 0; k < PL.length && !p.dead; k++) { var pl = PL[k]; if (!pl.nb && Math.hypot(p.x - pl.x, p.y - pl.y) < pl.r) { p.dead = true; FX.spark(p.x, p.y, '#8aa0b2', 4); } }
    for (var wi = 0; wi < es.length && !p.dead; wi++) { var we = es[wi]; if ((!p.a.wave || p.a.beam || p.a.key === 'np') && !p.a.strip && we.wallT > 0 && dist(p, we) < 190) { p.dead = true; FX.spark(p.x, p.y, '#ffd36b', 8); if (p.a.key === 'np') { FX.text(we, 'NP BLOCKED'); FX.fx('wallBlock', p.x, p.y, we); } } }
    if (!p.dead && G.mobs && G.mobs.length && hitMobsAt(p.x, p.y, p.a.rad || 6, p.a.dmg * (p.mult || 1) * p.owner.def.dmg, p.owner.team)) p.dead = !p.a.beam && !p.a.wave;
    for (var ti = 0; ti < es.length && !p.dead; ti++) {
      tgt = es[ti];
      var dx = tgt.x - sx, dy = tgt.y - sy, seg = Math.hypot(ox, oy) || 1, tt = clamp((dx * ox + dy * oy) / (seg * seg), 0, 1);
      var cx = sx + ox * tt, cy = sy + oy * tt;
      if (Math.hypot(tgt.x - cx, tgt.y - cy) < FR + (p.a.beam ? 34 * (p.a.bw || 1) : p.a.wave ? 26 : (p.a.rad || 4))) { var hr = hurt(p.owner, tgt, p.a, p.mult, p); p.dead = true; if (p.a.pull && hr === 'hit' && p.owner.st !== 'dead') { var ow = p.owner; ow.pull = 0.22; ow.ripo = 1.4; FX.text(ow, 'CHAIN PULL'); FX.snd('chain', ow); if (ow.st === 'rec') ow.recDur = Math.min(ow.recDur, ow.t + 0.28); } }
    }
    if (p.dead && p.a.beam) p.owner.beamEnd = { x: p.x, y: p.y, t: G.time };
    if (p.dead && p.a.explode && !p.exploded) explode(p);
    if (p.dead) G.proj.splice(i, 1);
  }
}
function stepZones(dt) {
  for (var i = G.zones.length - 1; i >= 0; i--) {
    var z = G.zones[i]; z.t += dt;
    if (!z.done && z.t >= z.delay) {
      z.done = true;
      enemiesOf(z.owner).forEach(function (o) { if (Math.hypot(o.x - z.x, o.y - z.y) <= z.r + FR) hurt(z.owner, o, { dmg: z.a.dmg, stag: 0.5, power: 2, gb: true, hs: 0.06, arc: 0, spell: true, key: z.a.key, root: z.a.root }, 1, { x: z.x, y: z.y }); });
      FX.spark(z.x, z.y, z.owner.def.col, 10); FX.shake(3); FX.snd('arrowLand', { x: z.x, y: z.y, idx: -1 }); FX.fx('arrowLand', z.x, z.y, z);
    }
    if (z.t > z.delay + 0.25) G.zones.splice(i, 1);
  }
}
function separate() {
  for (var i = 0; i < G.f.length; i++) for (var j = i + 1; j < G.f.length; j++) {
    var a = G.f[i], b = G.f[j], d = dist(a, b), min = FR * 2 - 2;
    if (a.st === 'dead' || b.st === 'dead' || !!a.inM !== !!b.inM) continue;
    if (d < min && d > 0.001) { var push = (min - d) / 2, nx = (b.x - a.x) / d, ny = (b.y - a.y) / d; a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push; }
  }
  G.f.forEach(function (f) {
    if (f.inM && G.marble) { var mdx = f.x - G.marble.cx, mdy = f.y - G.marble.cy, md = Math.hypot(mdx, mdy), mr = G.marble.R - FR; if (md > mr) { f.x = G.marble.cx + mdx / md * mr; f.y = G.marble.cy + mdy / md * mr; } f.x = clamp(f.x, FR, W - FR); f.y = clamp(f.y, FR, H - FR); return; }
    if (RECTS.length) rectsIn(f.x - 60, f.y - 60, f.x + 60, f.y + 60).forEach(function (r) { pushOutRect(f, r, FR); });
    pillarsIn(f.x - 60, f.y - 60, f.x + 60, f.y + 60).forEach(function (p) { var dx = f.x - p.x, dy = f.y - p.y, dd = Math.hypot(dx, dy), m = p.r + FR; if (dd < m) { if (dd < 0.001) { dx = 1; dy = 0; dd = 1; } f.x = p.x + dx / dd * m; f.y = p.y + dy / dd * m; } });
    f.x = clamp(f.x, FR, W - FR); f.y = clamp(f.y, FR, H - FR);
  });
}

