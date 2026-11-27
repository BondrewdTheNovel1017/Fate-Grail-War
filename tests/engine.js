// Loads the game engine (src/engine) into a fresh, isolated scope for tests and tools.
'use strict';
const { engineSource } = require('../tools/build.js');

const EXPORTS = ['SERV', 'ORDER', 'CLASSES', 'MASTERS', 'MASTER_ORDER', 'DIFF', 'MAPS', 'STEP', 'FR',
  'FX', 'SERV_DUEL', 'assignHomes', 'navPath', 'cityNav', 'zoneOf', 'navAttach', 'doorTick', 'roomAt', 'sameZone', 'knows', 'knowsExact', 'concealed', 'learnName', 'startDay', 'finishTask', 'fieldsTick', 'eventsTick', 'startSchool', 'startChallenge', 'startHorror', 'startFalseDeath', 'startBerserk', 'startBanquet', 'startSummons', 'buildDecks', 'newPhaseEvents', 'ruleBreak', 'familyHold', 'RB', 'GH_REGEN', 'startDemolition', 'startShadow', 'startFestival', 'cavernSite', 'grailSite', 'regainSeal', 'useSeal', 'startBounty', 'startGrail', 'inTruce', 'EVT', 'skipDay', 'isDay', 'CLOCK', 'EXPO', 'expose', 'witness', 'rectsIn', 'newGame', 'MAP_ORDER', 'newWar', 'warTeams', 'formContract', 'contractCandidate', 'canNP', 'npManaCost', 'MANA', 'initMana', 'mkAI', 'simStep', 'press', 'hurt', 'kill', 'useSeal', 'sealsLeft', 'setMarble', 'breakMarble', 'enemiesOf', 'gainMom', 'dist', 'PACT', 'pactWill', 'pactOpen', 'formPact', 'breakPact', 'pactTeams', 'pactTick', 'pactButton', 'pactParley', 'NP_MOM', 'CHURCH', 'civStruck', 'hitCivsArc', 'sendExecutors', 'execTick', 'churchHeat', 'churchSt', 'liveExecs', 'civShift', 'isDay', 'sealRescue', 'HOME_WARD', 'sealsLeft', 'rescueTick', 'RESCUE', 'teamHome', 'SEALS', 'dayActiveTick', 'daySpot', 'scoutsTick', 'scoutsReport', 'intelOn', 'DAYP', 'gilBetrayTick', 'aimFoe', 'AIM_R', 'pickTarget', 'summonSpot', 'roomAt', 'demolish', 'RHO', 'TRACE', 'segBlocked', 'MDUEL', 'aiDayGoal', 'inTruce', 'banquetLeft', 'LORE_WARS', 'bountyClaim', 'startSchool', 'schoolSpawn', 'schoolHolds', 'schoolBars', 'banquetSeated', 'startBanquet', 'tasksTick', 'aimMob', 'RYU', 'initMana', 'behindOf', 'harmMana', 'fadeAllowed', 'sacrament', 'knowsExact', 'mduelDef', 'startAct', 'canPay', 'losClear'];

function loadEngine() {
  const body = engineSource() + '\nreturn { ' + EXPORTS.map((n) => n + ': ' + n).join(', ') +
    ', get G() { return G; }, get MAP() { return MAP; }, get PILLARS() { return PILLARS; } };';
  return new Function(body)();
}

/** Run the simulation for `secs` seconds of game time. */
function run(E, secs) { for (let i = 0, n = Math.round(secs * 60); i < n && !E.G.over; i++) E.simStep(E.STEP); }

/** A war where every fighter is AI-controlled. */
function aiWar(E, teams, opts) {
  const G = E.newWar(teams, opts || {});
  G.f.forEach((f, i) => { G.ai[i] = E.mkAI(f, E.DIFF.knight); });
  return G;
}

module.exports = { loadEngine, run, aiWar };
