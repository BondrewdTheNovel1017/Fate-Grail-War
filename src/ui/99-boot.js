$('#fs').addEventListener('click', function () { var d = $('#duel'); try { if (document.fullscreenElement) document.exitFullscreen(); else if (d.requestFullscreen) d.requestFullscreen().catch(function () {}); } catch (e) {} });
document.addEventListener('fullscreenchange', function () { $('#fs').textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen'; });
function closePops() { ['ordPop', 'sealPop'].forEach(function (id) { $('#' + id).hidden = true; }); $('#ordBtn').setAttribute('aria-expanded', 'false'); $('#sealBtn').setAttribute('aria-expanded', 'false'); }
function togglePop(id, btn) { var open = $('#' + id).hidden; closePops(); if (open) { $('#' + id).hidden = false; btn.setAttribute('aria-expanded', 'true'); if (id === 'ordPop') renderStances(); } }
$('#ordBtn').addEventListener('click', function (e) { e.stopPropagation(); togglePop('ordPop', this); });
$('#sealBtn').addEventListener('click', function (e) { e.stopPropagation(); togglePop('sealPop', this); });
document.addEventListener('pointerup', function (e) { var t = e.target; if (!t.closest) return; if (t.closest('#sealPop .b') || t.closest('[data-stance]')) { setTimeout(closePops, 120); return; } if (!t.closest('.pop') && !t.closest('#ordBtn') && !t.closest('#sealBtn')) closePops(); });
function syncSnd() { $('#snd').textContent = AUD.on ? 'Sound on' : 'Sound off'; }
$('#snd').addEventListener('click', function () { AUD.on = !AUD.on; try { localStorage.setItem('duel2.snd', AUD.on ? '1' : '0'); } catch (e) {} syncSnd(); audInit(); });
syncSnd();
renderSetup(); renderNet(); shellBoot();
requestAnimationFrame(frame);
window.__duel = { thumb: thumb, ids: ORDER, net: { resolve: function () { netHostResolve(); }, self: function () { return netSelfPeer(); }, guests: function () { return netGuests().map(function (p) { return [p.peer, JSON.stringify(p.presence.req)]; }); } }, get G() { return G; }, get NET() { return NET; }, get MEI() { return MEI; }, get INTRO() { return INTRO; }, skipIntro: skipIntro, CFG: CFG, cam: cam, FX: FX, ev: { civStruck: civStruck, sendExecutors: sendExecutors, formPact: formPact, gilBetrayTick: gilBetrayTick, startHorror: startHorror, startBerserk: startBerserk, startFalseDeath: startFalseDeath, startBanquet: startBanquet, startGrail: startGrail, startChallenge: startChallenge, startDemolition: startDemolition, startShadow: startShadow, startFestival: startFestival, cavernSite: cavernSite, ruleBreak: ruleBreak }, netApplyInputs: netApplyInputs, simStep: simStep, STEP: STEP, startMatch: startMatch, audioTest: audioTest, sounds: Object.keys(SND) };
