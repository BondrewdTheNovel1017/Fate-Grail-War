/* ===================== AUDIO ===================== */
var AUD = { ac: null, o: null, on: true };
try { AUD.on = localStorage.getItem('duel2.snd') !== '0'; } catch (e) {}
function impulse(ac, secs, decay) { var n = Math.floor(ac.sampleRate * secs), b = ac.createBuffer(2, n, ac.sampleRate); for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }
function buildBus(ac, dest) {
  var o = { ac: ac }; o.master = ac.createGain(); o.master.gain.value = 0.8;
  var comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 6; comp.attack.value = 0.002; comp.release.value = 0.2;
  o.master.connect(comp); comp.connect(dest);
  o.sfx = ac.createGain(); o.sfx.connect(o.master);
  var conv = ac.createConvolver(); conv.buffer = impulse(ac, 1.6, 2.4); var rg = ac.createGain(); rg.gain.value = 0.2; o.sfx.connect(conv); conv.connect(rg); rg.connect(o.master);
  o.music = ac.createGain(); o.music.gain.value = 0.7; o.music.connect(o.master);
  var nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), nd = nb.getChannelData(0); for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; o.noise = nb;
  return o;
}
function mkOut(o, pan) { if (!pan || !o.ac.createStereoPanner) return o.sfx; var p = o.ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); p.connect(o.sfx); return p; }
function tone(o, out, t, type, f0, f1, dur, peak, att) {
  var ac = o.ac, os = ac.createOscillator(), g = ac.createGain(); os.type = type; os.frequency.setValueAtTime(f0, t); os.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + (att || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  os.connect(g); g.connect(out); os.start(t); os.stop(t + dur + 0.05);
}
function toneUp(o, out, t, type, f0, f1, dur, peak) {
  var ac = o.ac, os = ac.createOscillator(), g = ac.createGain(); os.type = type; os.frequency.setValueAtTime(f0, t); os.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.94); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.06);
  os.connect(g); g.connect(out); os.start(t); os.stop(t + dur + 0.1);
}
function noise(o, out, t, kind, f0, f1, dur, peak, att, q, up) {
  var ac = o.ac, s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = o.noise; s.loop = true;
  fl.type = kind; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); fl.Q.value = q || 1;
  g.gain.setValueAtTime(0.0001, t);
  if (up) { g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.94); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.06); }
  else { g.gain.exponentialRampToValueAtTime(peak, t + (att || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  s.connect(fl); fl.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + dur + 0.1);
}
var DRIVE = null;
function bass(o, out, t, f0, f1, dur, peak, drive) {
  var ac = o.ac;
  if (!DRIVE || DRIVE.k !== ac) { var n = 1024, c = new Float32Array(n); for (var i = 0; i < n; i++) { var x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(x * 3.2); } DRIVE = { k: ac, c: c }; }
  var os = ac.createOscillator(), os2 = ac.createOscillator(), ws = ac.createWaveShaper(), g1 = ac.createGain(), g2 = ac.createGain();
  ws.curve = DRIVE.c; ws.oversample = '2x';
  os.type = 'sine'; os2.type = 'sine';
  os.frequency.setValueAtTime(f0, t); os.frequency.exponentialRampToValueAtTime(Math.max(18, f1), t + dur * 0.85);
  os2.frequency.setValueAtTime(f0 * 2, t); os2.frequency.exponentialRampToValueAtTime(Math.max(36, f1 * 2), t + dur * 0.6);
  var d = drive === undefined ? 1 : drive;
  g1.gain.setValueAtTime(0.0001, t); g1.gain.exponentialRampToValueAtTime(peak * d, t + 0.006); g1.gain.exponentialRampToValueAtTime(peak * d * 0.55, t + dur * 0.25); g1.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(peak * 0.42, t + 0.004); g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.5);
  os.connect(ws); ws.connect(g1); g1.connect(out); os2.connect(g2); g2.connect(out);
  os.start(t); os2.start(t); os.stop(t + dur + 0.05); os2.stop(t + dur + 0.05);
}
function pad(o, out, t, dur, freqs, peak, att, rel, type, c0, c1) {
  var ac = o.ac, fl = ac.createBiquadFilter(), g = ac.createGain(), hold = Math.max(att, dur);
  fl.type = 'lowpass'; fl.Q.value = 0.8; fl.frequency.setValueAtTime(c0 || 1200, t); fl.frequency.exponentialRampToValueAtTime(c1 || c0 || 1200, t + Math.max(0.05, hold));
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + Math.max(0.01, att)); g.gain.setValueAtTime(peak, t + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + hold + rel);
  fl.connect(g); g.connect(out);
  var end = t + hold + rel + 0.05, n = freqs.length * 2;
  freqs.forEach(function (fr) { [-7, 7].forEach(function (dt) { var os = ac.createOscillator(), vg = ac.createGain(); os.type = type || 'sawtooth'; os.frequency.value = fr; os.detune.value = dt; vg.gain.value = 1 / n; os.connect(vg); vg.connect(fl); os.start(t); os.stop(end); }); });
}
/* whirling: band-passed noise whose centre wobbles faster and faster */
function whirl(o, out, t, dur, f0, f1, peak, r0, r1, depth, q) {
  var ac = o.ac, s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
  s.buffer = o.noise; s.loop = true; fl.type = 'bandpass'; fl.Q.value = q || 3;
  fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
  lfo.frequency.setValueAtTime(r0, t); lfo.frequency.exponentialRampToValueAtTime(r1, t + dur);
  lg.gain.setValueAtTime(f0 * (depth || 0.5), t); lg.gain.linearRampToValueAtTime(f1 * (depth || 0.5), t + dur);
  lfo.connect(lg); lg.connect(fl.frequency);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.92); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
  s.connect(fl); fl.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + dur + 0.2); lfo.start(t); lfo.stop(t + dur + 0.2);
}
/* electric arcs / fire crackle: many tiny bursts, optionally growing denser and louder */
function crackle(o, out, t, dur, n, peak, f0, f1, grow) {
  for (var i = 0; i < n; i++) { var u = grow ? Math.sqrt(Math.random()) : Math.random(), tt = t + u * dur, k = grow ? (0.25 + 0.75 * u) : (1 - 0.7 * u); noise(o, out, tt, 'bandpass', f0 * (0.7 + Math.random() * 0.6), f1 * (0.7 + Math.random() * 0.6), 0.015 + Math.random() * 0.045, Math.max(0.003, peak * k * (0.5 + Math.random() * 0.5)), 0.001, 2); }
}
function shatter(o, out, t, peak) {
  noise(o, out, t, 'highpass', 2500, 9000, 0.4, peak, 0.002, 0.7);
  for (var i = 0; i < 14; i++) { var fr = 1800 + Math.random() * 7000, tt = t + Math.random() * 0.12; tone(o, out, tt, 'sine', fr, fr * 0.98, 0.25 + Math.random() * 0.5, peak * 0.12, 0.001); }
  crackle(o, out, t, 0.5, 18, peak * 0.6, 3000, 6000, false);
}
function heartbeat(o, out, t, dur, bpm0, bpm1, peak) {
  var tt = 0; while (tt < dur) { var k = tt / dur, per = 60 / (bpm0 + (bpm1 - bpm0) * k); bass(o, out, t + tt, 62, 36, 0.18, peak * (0.6 + 0.4 * k), 1); bass(o, out, t + tt + per * 0.28, 56, 32, 0.15, peak * 0.7 * (0.6 + 0.4 * k), 1); tt += per; }
}
function drums(o, out, t, dur, n, peak, accel) {
  for (var i = 0; i < n; i++) { var k = i / Math.max(1, n - 1), tt = t + dur * (accel ? 1 - Math.pow(1 - k, 1.6) : k); bass(o, out, tt, 90, 44, 0.3, peak * (0.55 + 0.45 * k), 1); noise(o, out, tt, 'lowpass', 900, 200, 0.12, peak * 0.5, 0.002, 1); }
}
function ringS(o, out, t, freqs, decay, peak) { freqs.forEach(function (fr, i) { tone(o, out, t, 'sine', fr, fr * 0.993, decay * (1 - i * 0.1), peak / (1 + i * 0.45), 0.002); }); }
function thumps(o, out, t, n, dur, f0, f1, peak, accel) { var tt = 0; for (var i = 0; i < n; i++) { var k = i / Math.max(1, n - 1), gap = (dur - tt) / Math.max(1, n - i) * (accel ? (1.5 - k) : 1); tone(o, out, t + tt, 'sine', f0, f1, 0.12, peak * (0.5 + 0.5 * k), 0.003); tt += gap; if (tt > dur) break; } }

/* Each NP has a cast process (lasts the whole wind-up and is cut if the cast is interrupted)
   and a fire process (the release, with its own sustain and tail). */
var NPC = {
  gen: function (o, out, t, w) { whirl(o, out, t, w, 200, 1800, 0.28, 1.5, 8); toneUp(o, out, t, 'sawtooth', 70, 300, w, 0.1); toneUp(o, out, t, 'sine', 42, 95, w, 0.28); },
  caerwyn: function (o, out, t, w) {
    pad(o, out, t, w, [220, 277.2, 329.6, 440], 0.2, w * 0.85, 0.25, 'triangle', 700, 4200);
    pad(o, out, t + w * 0.3, w * 0.7, [880, 1108.7, 1318.5], 0.07, w * 0.6, 0.2, 'sine', 3000, 6000);
    whirl(o, out, t, w, 380, 2600, 0.24, 1.2, 9, 0.55, 2.5);
    for (var i = 0; i < 10; i++) { var tt = t + w * (0.15 + 0.8 * i / 10), fr = 1760 * Math.pow(1.122, i % 6); tone(o, out, tt, 'sine', fr, fr, 0.5, 0.05 + 0.03 * i / 10, 0.003); }
    toneUp(o, out, t, 'sine', 38, 74, w, 0.32);
  },
  richard: function (o, out, t, w) {
    noise(o, out, t, 'lowpass', 260, 1500, w, 0.34, 0, 0.8, true);
    crackle(o, out, t, w, 46, 0.2, 1400, 3800, true);
    pad(o, out, t, w, [98, 146.8, 196, 293.7], 0.2, w * 0.75, 0.15, 'sawtooth', 300, 2600);
    toneUp(o, out, t, 'sine', 46, 92, w, 0.3);
  },
  leonidas: function (o, out, t, w) {
    drums(o, out, t, w, 6, 0.55, false);
    pad(o, out, t + 0.1, w, [110, 164.8], 0.2, w * 0.6, 0.2, 'sawtooth', 380, 1400);
    noise(o, out, t, 'bandpass', 380, 900, w, 0.2, 0, 1.4, true);
  },
  atalanta: function (o, out, t, w) {
    noise(o, out, t, 'bandpass', 240, 420, w, 0.16, 0, 9, true);
    toneUp(o, out, t, 'triangle', 600, 2100, w, 0.07);
    whirl(o, out, t, w, 900, 3200, 0.14, 2, 7, 0.4, 2);
  },
  heracles: function (o, out, t, w) {
    heartbeat(o, out, t, w, 70, 190, 0.6);
    toneUp(o, out, t, 'sawtooth', 50, 82, w, 0.16); noise(o, out, t, 'lowpass', 300, 800, w, 0.3, 0, 1, true);
  },
  hassan: function (o, out, t, w) {
    heartbeat(o, out, t, w, 60, 170, 0.55);
    whirl(o, out, t, w, 2600, 4200, 0.09, 3, 9, 0.3, 6);
  },
  diarmuid: function (o, out, t, w) {
    whirl(o, out, t, w, 420, 900, 0.2, 1.5, 10, 0.5, 3); whirl(o, out, t, w, 1500, 3000, 0.14, 2.2, 13, 0.5, 3);
    toneUp(o, out, t, 'triangle', 220, 660, w, 0.06); toneUp(o, out, t, 'sine', 40, 80, w, 0.26);
  },
  cu: function (o, out, t, w) {
    pad(o, out, t, w, [73.4, 87.3, 110], 0.18, w * 0.7, 0.1, 'sawtooth', 300, 1600);
    toneUp(o, out, t, 'sawtooth', 280, 2400, w, 0.06);
    whirl(o, out, t, w, 300, 2200, 0.22, 1, 11, 0.6, 2.5);
  },
  gilgamesh: function (o, out, t, w) {
    whirl(o, out, t, w, 90, 640, 0.42, 0.7, 13, 0.6, 2);
    pad(o, out, t, w, [55, 58.3, 77.8, 110, 116.5], 0.24, w * 0.9, 0.08, 'sawtooth', 180, 1900);
    toneUp(o, out, t, 'sawtooth', 28, 120, w, 0.2);
    crackle(o, out, t, w, 70, 0.28, 2000, 6500, true);
    noise(o, out, t, 'lowpass', 70, 160, w, 0.38, 0, 0.7, true);
    toneUp(o, out, t + w * 0.4, 'sine', 180, 1500, w * 0.6, 0.05);
    toneUp(o, out, t, 'sine', 28, 58, w, 0.4); heartbeat(o, out, t + w * 0.5, w * 0.5, 90, 220, 0.3);
  },
  iskandar: function (o, out, t, w) {
    pad(o, out, t, w, [98, 146.8, 196], 0.2, w * 0.5, 0.2, 'sawtooth', 600, 2200);
    drums(o, out, t, w, 10, 0.5, true);
    noise(o, out, t, 'bandpass', 300, 1200, w, 0.24, 0, 1, true);
  },
  gilles: function (o, out, t, w) {
    for (var i = 0; i < 8; i++) noise(o, out, t + w * i / 8, 'bandpass', 2400, 1200, 0.07, 0.16, 0.004, 1.5);
    noise(o, out, t, 'lowpass', 120, 420, w, 0.34, 0, 1.2, true);
    pad(o, out, t, w, [65.4, 69.3, 98], 0.16, w * 0.8, 0.2, 'triangle', 400, 900);
  },
  lancelot: function (o, out, t, w) {
    toneUp(o, out, t, 'sawtooth', 40, 220, w, 0.16); toneUp(o, out, t, 'square', 80, 440, w, 0.04);
    whirl(o, out, t, w, 500, 1800, 0.2, 5, 60, 0.35, 4);
  },
  medusa: function (o, out, t, w) {
    for (var i = 0; i < 5; i++) { noise(o, out, t + w * i / 5, 'bandpass', 500, 180, 0.25, 0.34, 0.05, 1); bass(o, out, t + w * i / 5, 70, 40, 0.25, 0.3, 0.9); }
    whirl(o, out, t, w, 600, 2800, 0.2, 1.5, 6, 0.5, 2);
    toneUp(o, out, t + w * 0.5, 'triangle', 500, 1400, w * 0.5, 0.06);
  },
  medea: function (o, out, t, w) {
    whirl(o, out, t, w, 2000, 4200, 0.12, 3, 7, 0.4, 5);
    for (var i = 0; i < 8; i++) { var fr = 1320 * Math.pow(1.19, i % 5); tone(o, out, t + w * i / 8, 'sine', fr, fr, 0.4, 0.06, 0.003); }
    toneUp(o, out, t, 'sine', 50, 90, w, 0.22);
  },
  kojirou: function (o, out, t, w) {
    pad(o, out, t, w, [2960], 0.035, w * 0.8, 0.05, 'sine', 4000, 4000);
    whirl(o, out, t, w, 300, 900, 0.1, 0.5, 2, 0.4, 2);
  }
};
var NPF = {
  gen: function (o, out, t, a) { bass(o, out, t, 60, 22, 1.8, 0.88, 1.15); noise(o, out, t, 'bandpass', 400, 4200, 0.7, 0.5, 0.03, 1.0); tone(o, out, t, 'sine', 100, 38, 0.5, 0.6, 0.003); ringS(o, out, t + 0.03, [220, 330, 440], 1.2, 0.12); },
  caerwyn: function (o, out, t) {
    bass(o, out, t, 52, 20, 2.6, 0.95, 1.2); bass(o, out, t + 0.012, 104, 40, 0.7, 0.5, 1);
    noise(o, out, t, 'bandpass', 6000, 1200, 0.18, 0.55, 0.002, 1);
    pad(o, out, t, 1.0, [110, 220, 330], 0.2, 0.03, 0.5, 'sawtooth', 2600, 900);
    pad(o, out, t, 1.1, [440, 554.4, 659.3, 880, 1108.7], 0.2, 0.04, 1.3, 'triangle', 5000, 2400);
    noise(o, out, t, 'highpass', 4200, 7000, 1.2, 0.13, 0.03, 0.7);
    ringS(o, out, t + 0.9, [880, 1320, 1760, 2640], 2.6, 0.12);
  },
  richard: function (o, out, t) {
    noise(o, out, t, 'bandpass', 300, 3200, 0.5, 0.6, 0.01, 1.1);
    bass(o, out, t, 58, 22, 2.0, 0.9, 1.15);
    noise(o, out, t + 0.05, 'lowpass', 1800, 380, 1.7, 0.45, 0.04, 0.8);
    crackle(o, out, t, 1.9, 50, 0.24, 1200, 3600, false);
    pad(o, out, t, 0.6, [196, 293.7, 392], 0.14, 0.02, 1.0, 'triangle', 2400, 900);
  },
  leonidas: function (o, out, t) {
    bass(o, out, t, 56, 22, 2.0, 0.9, 1.15);
    for (var i = 0; i < 8; i++) { ringS(o, out, t + i * 0.05, [700 + i * 40, 1100 + i * 30, 1650], 0.45, 0.1); noise(o, out, t + i * 0.05, 'highpass', 2000, 5000, 0.05, 0.2, 0.002, 1); }
    noise(o, out, t + 0.1, 'bandpass', 300, 1100, 0.9, 0.4, 0.03, 1.2);
  },
  atalanta: function (o, out, t) {
    tone(o, out, t, 'triangle', 220, 90, 0.22, 0.42, 0.002); bass(o, out, t, 70, 32, 0.6, 0.5, 1);
    for (var i = 0; i < 8; i++) tone(o, out, t + 0.06 + i * 0.07, 'sine', 3200 - i * 120, 900, 0.6, 0.06, 0.01);
  },
  heracles: function (o, out, t) { bass(o, out, t, 54, 20, 1.8, 0.9, 1.2); noise(o, out, t, 'bandpass', 180, 700, 0.9, 0.5, 0.02, 1.2); tone(o, out, t, 'sawtooth', 72, 40, 0.8, 0.35, 0.02); },
  hassan: function (o, out, t) { bass(o, out, t, 60, 24, 1.2, 0.8, 1.1); noise(o, out, t, 'lowpass', 700, 120, 0.4, 0.5, 0.01, 2); tone(o, out, t + 0.05, 'sine', 62, 30, 0.6, 0.6, 0.003); },
  diarmuid: function (o, out, t) { noise(o, out, t, 'bandpass', 400, 3200, 0.5, 0.55, 0.01, 1.2); bass(o, out, t, 62, 24, 1.4, 0.85, 1.1); ringS(o, out, t + 0.05, [740, 1110, 1480], 0.8, 0.12); },
  cu: function (o, out, t) { bass(o, out, t, 60, 22, 1.6, 0.9, 1.15); noise(o, out, t, 'bandpass', 5000, 600, 0.55, 0.55, 0.005, 1.3); tone(o, out, t, 'sawtooth', 300, 60, 0.5, 0.15, 0.01); ringS(o, out, t + 0.04, [1100, 1700, 2300], 0.7, 0.1); },
  gilgamesh: function (o, out, t) {
    shatter(o, out, t, 0.6);
    bass(o, out, t, 40, 16, 3.4, 1, 1.3); bass(o, out, t + 0.03, 80, 30, 1.2, 0.6, 1);
    noise(o, out, t, 'lowpass', 6000, 90, 2.2, 0.9, 0.004, 0.8);
    tone(o, out, t, 'sawtooth', 62, 28, 1.8, 0.3, 0.01);
    pad(o, out, t, 1.4, [61.7, 65.4, 92.5, 130.8], 0.3, 0.02, 1.6, 'sawtooth', 3200, 260);
    crackle(o, out, t, 2.0, 50, 0.32, 1800, 6000, false);
    ringS(o, out, t + 0.1, [233, 247, 349, 494, 698], 3.0, 0.14);
  },
  iskandar: function (o, out, t) { bass(o, out, t, 58, 22, 2.0, 0.9, 1.15); drums(o, out, t, 1.4, 18, 0.5, false); noise(o, out, t, 'bandpass', 250, 1800, 1.4, 0.5, 0.05, 0.9); pad(o, out, t, 0.8, [130.8, 196, 261.6], 0.14, 0.05, 0.8, 'sawtooth', 1600, 700); },
  gilles: function (o, out, t) { bass(o, out, t, 52, 20, 2.0, 0.9, 1.2); for (var i = 0; i < 6; i++) noise(o, out, t + i * 0.12, 'lowpass', 900, 120, 0.3, 0.4, 0.01, 3); tone(o, out, t, 'sawtooth', 62, 40, 1.2, 0.18, 0.02); },
  lancelot: function (o, out, t, a) { var d = (a && a.act) || 1.4; pad(o, out, t, d, [220, 440], 0.08, 0.02, 0.1, 'sawtooth', 1800, 1800); tone(o, out, t + d, 'sawtooth', 220, 50, 0.7, 0.12, 0.01); bass(o, out, t, 62, 30, 0.6, 0.6, 1); },
  medusa: function (o, out, t) { noise(o, out, t, 'bandpass', 4200, 500, 0.7, 0.5, 0.03, 1.2); tone(o, out, t, 'sine', 1800, 300, 0.6, 0.1, 0.01); bass(o, out, t + 0.25, 62, 24, 1.5, 0.85, 1.1); },
  medea: function (o, out, t) { shatter(o, out, t, 0.32); noise(o, out, t, 'highpass', 2000, 6500, 0.25, 0.35, 0.004, 0.9); bass(o, out, t, 70, 30, 0.9, 0.6, 1); },
  kojirou: function (o, out, t) { for (var i = 0; i < 3; i++) { noise(o, out, t + i * 0.07, 'highpass', 2500, 7000, 0.14, 0.45, 0.003, 0.8); ringS(o, out, t + i * 0.07, [2100, 3200, 4300], 0.35, 0.1); bass(o, out, t + i * 0.07, 90, 44, 0.3, 0.45, 0.9); } }
};
var SND = {
  swingL: function (o, out, t, P) { var w = P.f && P.f.def.wpn, lo = w === 'club' ? 260 : w === 'dagger' ? 2000 : w === 'spear' ? 1400 : 900; noise(o, out, t, 'bandpass', lo, lo * 2.8, 0.16, w === 'club' ? 0.34 : 0.3, 0.03, 1.1); },
  swingH: function (o, out, t, P) { var w = P.f && P.f.def.wpn, lo = w === 'club' ? 140 : 220; noise(o, out, t, 'bandpass', lo, lo * 6, 0.3, 0.42, 0.06, 1.0); tone(o, out, t, 'sine', 110, 55, 0.25, 0.22, 0.02); },
  shoot: function (o, out, t, P) { var h = P.a && P.a.key === 'heavy'; tone(o, out, t, 'triangle', h ? 150 : 210, h ? 80 : 120, 0.14, h ? 0.3 : 0.22, 0.002); noise(o, out, t, 'highpass', 2500, 5000, 0.04, 0.2, 0.002); noise(o, out, t + 0.02, 'bandpass', 3200, 1200, h ? 0.3 : 0.2, 0.14, 0.02, 1.4); },
  hitL: function (o, out, t, P) { bass(o, out, t, 86, 46, 0.2, 0.34, 0.9); tone(o, out, t, 'sine', 170, 62, 0.13, 0.5, 0.002); noise(o, out, t, 'lowpass', 3600, 700, 0.07, 0.5, 0.002); ringS(o, out, t, P.a && P.a.armor ? [900, 1500, 2200] : [1100, 1750], 0.14, 0.07); },
  hitH: function (o, out, t) { bass(o, out, t, 74, 34, 0.7, 0.62, 1); tone(o, out, t, 'sine', 125, 40, 0.32, 0.95, 0.002); tone(o, out, t, 'sine', 58, 30, 0.5, 0.55, 0.004); noise(o, out, t, 'lowpass', 2800, 350, 0.2, 0.65, 0.002); ringS(o, out, t, [700, 1150, 1800], 0.4, 0.1); },
  hitNP: function (o, out, t) { bass(o, out, t, 58, 22, 2.2, 0.8, 1.15); bass(o, out, t + 0.012, 110, 40, 0.5, 0.45, 1); tone(o, out, t + 0.15, 'sine', 36, 30, 1.5, 0.35, 0.3); tone(o, out, t, 'sine', 62, 24, 1.5, 1.0, 0.004); tone(o, out, t, 'sine', 100, 32, 0.6, 0.95, 0.002); noise(o, out, t, 'lowpass', 6000, 160, 1.0, 0.85, 0.002); tone(o, out, t, 'sawtooth', 110, 90, 1.2, 0.1, 0.01); tone(o, out, t, 'sawtooth', 117, 95, 1.2, 0.1, 0.01); tone(o, out, t, 'sawtooth', 165, 120, 1.0, 0.08, 0.01); ringS(o, out, t, [400, 640, 1030, 1600], 1.0, 0.14); },
  block: function (o, out, t) { ringS(o, out, t, [820, 1390, 2230, 3100], 0.24, 0.14); noise(o, out, t, 'bandpass', 2600, 2600, 0.04, 0.3, 0.002, 2); tone(o, out, t, 'sine', 150, 90, 0.09, 0.35, 0.002); },
  parry: function (o, out, t) { ringS(o, out, t, [2100, 3150, 4200], 0.55, 0.16); noise(o, out, t, 'highpass', 2000, 7500, 0.2, 0.25, 0.004, 0.8); tone(o, out, t, 'sine', 1200, 2600, 0.12, 0.12, 0.002); tone(o, out, t, 'sine', 130, 80, 0.12, 0.35, 0.002); },
  gbreak: function (o, out, t) { bass(o, out, t, 80, 30, 0.8, 0.6, 1); noise(o, out, t, 'lowpass', 3200, 260, 0.4, 0.75, 0.002); tone(o, out, t, 'sine', 95, 34, 0.4, 0.85, 0.002); ringS(o, out, t, [500, 830, 1290], 0.45, 0.12); tone(o, out, t + 0.03, 'triangle', 1900, 380, 0.3, 0.1, 0.002); },
  dodge: function (o, out, t) { noise(o, out, t, 'bandpass', 2300, 480, 0.2, 0.17, 0.02, 1.2); },
  whiff: function (o, out, t) { noise(o, out, t, 'bandpass', 1700, 900, 0.07, 0.1, 0.01, 1.5); },
  nodge: function (o, out, t) { tone(o, out, t, 'square', 150, 120, 0.06, 0.06, 0.002); },
  charge: function (o, out, t) { tone(o, out, t, 'sine', 1400, 1900, 0.07, 0.07, 0.003); },
  exhaust: function (o, out, t) { tone(o, out, t, 'sine', 220, 90, 0.4, 0.14, 0.02); noise(o, out, t, 'lowpass', 900, 200, 0.4, 0.12, 0.02); },
  counter0: function (o, out, t) { ringS(o, out, t, [1500, 2250], 0.3, 0.08); tone(o, out, t, 'sine', 440, 880, 0.25, 0.08, 0.02); },
  counter: function (o, out, t) { bass(o, out, t, 78, 34, 0.65, 0.5, 1); ringS(o, out, t, [900, 1500, 2400, 3400], 0.65, 0.22); tone(o, out, t, 'sine', 120, 45, 0.3, 0.7, 0.002); noise(o, out, t, 'bandpass', 800, 4000, 0.16, 0.3, 0.004); },
  hop: function (o, out, t) { noise(o, out, t, 'bandpass', 3200, 700, 0.22, 0.2, 0.02, 1.2); },
  'skill:leonidas': function (o, out, t) { bass(o, out, t, 80, 36, 0.7, 0.5, 1); tone(o, out, t, 'sine', 115, 48, 0.22, 0.85, 0.002); ringS(o, out, t, [600, 1000, 1700], 0.34, 0.14); noise(o, out, t, 'lowpass', 2200, 400, 0.08, 0.4, 0.002); },
  'skill:heracles': function (o, out, t) { bass(o, out, t, 62, 24, 1.4, 0.75, 1.1); tone(o, out, t, 'sine', 72, 26, 0.9, 0.95, 0.003); noise(o, out, t, 'lowpass', 2600, 220, 0.45, 0.7, 0.003); ringS(o, out, t, [180, 260, 410], 0.55, 0.12); },
  'skill:hassan': function (o, out, t) { noise(o, out, t, 'bandpass', 3400, 700, 0.16, 0.24, 0.01, 1.3); tone(o, out, t + 0.1, 'sine', 320, 110, 0.1, 0.25, 0.002); },
  'skill:atalanta': function (o, out, t) { tone(o, out, t, 'triangle', 200, 110, 0.15, 0.28, 0.002); noise(o, out, t, 'bandpass', 3000, 1200, 0.22, 0.16, 0.01, 1.4); },
  pulse: function (o, out, t, P) { bass(o, out, t, 70, 32, 0.28, 0.55, 1); var k = (+P.a || 0) / 9; if (!isFinite(k)) k = 0; tone(o, out, t, 'sine', 95 + 25 * k, 40, 0.16, 0.65, 0.002); noise(o, out, t, 'lowpass', 1800, 300, 0.1, 0.35, 0.002); },
  arrowLand: function (o, out, t) { bass(o, out, t, 82, 40, 0.22, 0.34, 0.9); tone(o, out, t, 'sine', 140, 58, 0.1, 0.5, 0.002); noise(o, out, t, 'lowpass', 2400, 500, 0.07, 0.3, 0.002); ringS(o, out, t, [1300], 0.12, 0.05); },
  execute: function (o, out, t) { bass(o, out, t, 56, 20, 2.0, 0.85, 1.15); tone(o, out, t, 'sine', 70, 28, 0.8, 0.95, 0.002); noise(o, out, t, 'lowpass', 1800, 200, 0.12, 0.9, 0.002); tone(o, out, t + 0.02, 'sawtooth', 220, 60, 0.4, 0.12, 0.004); },
  field: function (o, out, t) { toneUp(o, out, t, 'sine', 90, 340, 0.5, 0.2); ringS(o, out, t + 0.05, [330, 495, 660], 0.9, 0.16); bass(o, out, t, 70, 40, 0.4, 0.3, 0.8); },
  npLost: function (o, out, t) { tone(o, out, t, 'sawtooth', 300, 55, 0.5, 0.14, 0.01); noise(o, out, t, 'lowpass', 1200, 150, 0.35, 0.2, 0.01); },
  kill: function (o, out, t) { bass(o, out, t, 54, 20, 2.4, 0.9, 1.2); SND.hitNP(o, out, t, {}); ringS(o, out, t + 0.05, [110, 165, 232, 311], 1.8, 0.16); },
  npcast: function (o, out, t, P) { var a = P.a || { wind: 1.1 }, id = P.f && P.f.def && P.f.def.id; (NPC[id] || NPC.gen)(o, out, t, a.wind, a); toneUp(o, out, t, 'sine', 36, 72, a.wind, 0.2); },
  npfireG: function (o, out, t, P) { (NPF.gen)(o, out, t, P.a); },
  skillG: function (o, out, t) { noise(o, out, t, 'bandpass', 900, 3200, 0.2, 0.3, 0.02, 1.2); bass(o, out, t + 0.05, 84, 40, 0.4, 0.45, 0.9); ringS(o, out, t + 0.05, [820, 1300], 0.3, 0.08); },
  'skill:gilgamesh': function (o, out, t) { for (var i = 0; i < 5; i++) { noise(o, out, t + i * 0.035, 'bandpass', 4200, 1400, 0.16, 0.2, 0.01, 1.6); tone(o, out, t + i * 0.035, 'triangle', 600, 300, 0.1, 0.07, 0.003); } bass(o, out, t, 80, 38, 0.4, 0.4, 0.9); },
  'skill:kojirou': function (o, out, t) { noise(o, out, t, 'highpass', 3000, 8000, 0.1, 0.42, 0.002, 0.8); ringS(o, out, t, [2400, 3600], 0.3, 0.1); bass(o, out, t, 90, 42, 0.3, 0.35, 0.9); },
  'gun': function (o, out, t) { noise(o, out, t, 'bandpass', 1800, 3600, 0.05, 0.28, 0.001, 1.2); tone(o, out, t, 'square', 180, 70, 0.05, 0.12, 0.001); bass(o, out, t, 70, 40, 0.07, 0.25, 0.8); },
  chain: function (o, out, t) { ringS(o, out, t, [1800, 2700, 3600], 0.18, 0.12); noise(o, out, t, 'bandpass', 2400, 800, 0.15, 0.3, 0.003, 1.4); bass(o, out, t + 0.05, 74, 40, 0.2, 0.5, 0.9); },
  'skill:medusa': function (o, out, t) { noise(o, out, t, 'bandpass', 1500, 5200, 0.22, 0.34, 0.01, 1.2); ringS(o, out, t + 0.04, [1900, 2800], 0.2, 0.1); toneUp(o, out, t, 'triangle', 400, 1500, 0.2, 0.06); },
  'skill:lancelot': function (o, out, t) { noise(o, out, t, 'highpass', 1200, 4000, 0.12, 0.3, 0.002, 1); ringS(o, out, t, [820, 1250, 1900], 0.4, 0.14); bass(o, out, t, 80, 40, 0.3, 0.5, 0.9); },
  'skill:medea': function (o, out, t) { for (var i = 0; i < 3; i++) { toneUp(o, out, t + i * 0.04, 'sine', 500, 1600, 0.1, 0.12); noise(o, out, t + i * 0.04, 'bandpass', 3000, 1500, 0.12, 0.12, 0.01, 1.4); } bass(o, out, t, 90, 44, 0.25, 0.3, 0.8); },
  'skill:gilles': function (o, out, t) { noise(o, out, t, 'lowpass', 900, 200, 0.6, 0.4, 0.05, 1); bass(o, out, t + 0.3, 56, 26, 0.9, 0.7, 1.1); tone(o, out, t, 'sawtooth', 70, 50, 0.7, 0.1, 0.03); },
  godhand: function (o, out, t) { bass(o, out, t, 70, 28, 1.4, 0.85, 1.1); noise(o, out, t, 'lowpass', 3000, 300, 0.5, 0.5, 0.003); ringS(o, out, t, [220, 330, 440, 660, 880], 1.6, 0.18); toneUp(o, out, t + 0.05, 'sine', 120, 480, 0.5, 0.12); },
  'skill:caerwyn': function (o, out, t) { noise(o, out, t, 'bandpass', 300, 2600, 0.5, 0.34, 0, 1.2, true); noise(o, out, t + 0.25, 'bandpass', 2600, 500, 0.5, 0.22, 0.02, 1.0); toneUp(o, out, t, 'sine', 200, 900, 0.5, 0.1); bass(o, out, t + 0.3, 70, 38, 0.5, 0.3, 0.8); ringS(o, out, t + 0.3, [660, 990, 1480], 0.8, 0.07); },
};
Object.keys(NPF).forEach(function (id) { if (id !== 'gen') SND['npfire:' + id] = function (o, out, t, P) { NPF[id](o, out, t, P.a); }; });
function subOut(o, out, v) { var gg = o.ac.createGain(); gg.gain.value = v; gg.connect(out); return gg; }
SND.boom = function (o, out, t) { bass(o, out, t, 70, 26, 1.0, 0.85, 1.15); noise(o, out, t, 'lowpass', 3000, 200, 0.7, 0.7, 0.003, 0.8); tone(o, out, t, 'sine', 120, 40, 0.4, 0.6, 0.003); crackle(o, out, t + 0.05, 0.6, 16, 0.2, 1500, 4000, false); };
SND.boomBig = function (o, out, t) { bass(o, out, t, 52, 18, 2.0, 1, 1.25); bass(o, out, t + 0.02, 104, 36, 0.7, 0.55, 1); noise(o, out, t, 'lowpass', 5000, 120, 1.4, 0.85, 0.003, 0.8); tone(o, out, t, 'sawtooth', 90, 30, 0.9, 0.2, 0.01); crackle(o, out, t + 0.05, 1.2, 30, 0.26, 1200, 4500, false); ringS(o, out, t + 0.1, [180, 270, 405], 1.6, 0.1); };
SND.drawBow = function (o, out, t, P) { var w = (P.a && P.a.wind) || 0.9; noise(o, out, t, 'bandpass', 220, 460, w, 0.22, 0, 9, true); toneUp(o, out, t, 'sine', 300, 2400, w, 0.08); whirl(o, out, t, w, 1200, 4200, 0.16, 3, 30, 0.4, 4); };
SND['skill:emiya'] = function (o, out, t) { tone(o, out, t, 'triangle', 240, 90, 0.25, 0.45, 0.002); noise(o, out, t, 'bandpass', 6000, 1800, 0.5, 0.35, 0.002, 2); tone(o, out, t, 'sine', 3000, 900, 0.5, 0.08, 0.005); bass(o, out, t, 80, 36, 0.4, 0.5, 0.9); };
SND['marble:ionioi'] = function (o, out, t) { noise(o, out, t, 'bandpass', 200, 2400, 1.4, 0.5, 0.05, 0.8); pad(o, out, t + 0.2, 1.2, [98, 146.8, 196, 293.7], 0.22, 0.2, 1.2, 'sawtooth', 600, 2400); drums(o, out, t + 0.3, 1.4, 12, 0.5, true); noise(o, out, t + 0.4, 'bandpass', 300, 900, 1.6, 0.3, 0.3, 1.2); };
SND['marble:ubw'] = function (o, out, t) { noise(o, out, t, 'bandpass', 300, 3200, 1.0, 0.55, 0.02, 0.8); bass(o, out, t, 56, 22, 1.8, 0.85, 1.15); for (var i = 0; i < 12; i++) ringS(o, out, t + 0.1 + i * 0.07, [900 + (i * 137) % 900, 1500 + (i * 211) % 1200], 0.6, 0.06); pad(o, out, t + 0.3, 1.4, [146.8, 220, 293.7], 0.12, 0.3, 1.2, 'triangle', 1200, 3000); };
NPC.emiya = function (o, out, t, w) { for (var i = 0; i < 9; i++) { var tt = t + w * i / 9; ringS(o, out, tt, [740 + i * 40, 1110 + i * 50, 1660], 0.35, 0.07 + 0.01 * i); noise(o, out, tt, 'highpass', 3000, 6000, 0.04, 0.12, 0.002, 1); } pad(o, out, t, w, [110, 164.8, 220], 0.16, w * 0.8, 0.2, 'sawtooth', 400, 1800); noise(o, out, t + w * 0.5, 'bandpass', 300, 2000, w * 0.5, 0.25, 0, 1, true); };
NPF.emiya = function (o, out, t) { noise(o, out, t, 'bandpass', 400, 3000, 0.8, 0.5, 0.02, 0.9); bass(o, out, t, 58, 22, 1.6, 0.85, 1.15); ringS(o, out, t + 0.05, [880, 1320, 1760], 1.2, 0.1); };
SND['npfire:emiya'] = function (o, out, t, P) { NPF.emiya(o, out, t, P.a); };
NPC.iskandar = function (o, out, t, w) { pad(o, out, t, w, [98, 146.8, 196], 0.2, w * 0.4, 0.2, 'sawtooth', 600, 2400); drums(o, out, t, w, 14, 0.55, true); noise(o, out, t, 'bandpass', 300, 1400, w, 0.3, 0, 1, true); noise(o, out, t, 'bandpass', 200, 600, w, 0.2, 0, 2, true); };
NPF.cu = function (o, out, t) { noise(o, out, t, 'bandpass', 600, 5000, 0.5, 0.5, 0.005, 1.1); tone(o, out, t, 'sawtooth', 200, 900, 0.35, 0.1, 0.01); bass(o, out, t, 80, 40, 0.4, 0.5, 0.9); ringS(o, out, t, [1100, 1700], 0.5, 0.08); };
SND['npfire:cu'] = function (o, out, t, P) { NPF.cu(o, out, t, P.a); };
SND.beamCharge = function (o, out, t, P) { NPC.caerwyn(o, subOut(o, out, 0.5), t, (P.a && P.a.wind) || 0.7); };
SND['skill:richard'] = function (o, out, t) { NPF.caerwyn(o, subOut(o, out, 0.55), t); ringS(o, out, t + 0.12, [1900, 2850, 3800, 5200], 0.6, 0.12); noise(o, out, t + 0.1, 'highpass', 3000, 8000, 0.25, 0.3, 0.002, 0.8); };
function audInit() {
  if (AUD.ac) { if (AUD.ac.state === 'suspended') AUD.ac.resume(); return; }
  try { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; var ac = new AC(); AUD.ac = ac; AUD.o = buildBus(ac, ac.destination); if (ac.state === 'suspended') ac.resume(); } catch (e) {}
}
['pointerdown', 'keydown'].forEach(function (ev) { window.addEventListener(ev, audInit, { passive: true }); });
var lastSnd = {};
function playSnd(name, f, extra) {
  if (!AUD.on || !AUD.ac || !AUD.o) return;
  var fn = SND[name] || (name.indexOf('npfire:') === 0 ? SND.npfireG : name.indexOf('skill:') === 0 ? SND.skillG : null); if (!fn) return;
  var nowt = AUD.ac.currentTime, key = name + (f && f.idx !== undefined ? f.idx : '');
  if (lastSnd[key] && nowt - lastSnd[key] < 0.03) return; lastSnd[key] = nowt;
  var pan = f && f.x !== undefined ? clamp((f.x - cam.x) / 420, -0.7, 0.7) : 0;
  var outN = mkOut(AUD.o, pan);
  if (name === 'npcast' && f) { var sub = AUD.ac.createGain(); sub.connect(outN); AUD.npBus = AUD.npBus || {}; AUD.npBus[f.idx] = sub; outN = sub; }
  if (name === 'npLost' && f && AUD.npBus && AUD.npBus[f.idx]) { try { var sg = AUD.npBus[f.idx].gain; sg.cancelScheduledValues(nowt); sg.setValueAtTime(sg.value, nowt); sg.linearRampToValueAtTime(0, nowt + 0.12); } catch (e) {} }
  try { fn(AUD.o, outN, nowt + 0.002, { f: f, a: extra }); } catch (e) {}
  if (name === 'hitNP' || name === 'kill' || name === 'execute' || name.indexOf('npfire') === 0) { try { var mg = AUD.o.music.gain; mg.cancelScheduledValues(nowt); mg.setValueAtTime(mg.value, nowt); mg.linearRampToValueAtTime(0.18, nowt + 0.03); mg.linearRampToValueAtTime(0.7, nowt + 1.4); } catch (e) {} }
  if (navigator.vibrate && (name === 'hitNP' || name === 'kill' || name === 'hitH' || name === 'gbreak')) { try { navigator.vibrate(name === 'hitH' || name === 'gbreak' ? 18 : 40); } catch (e) {} }
}
function audioTest(name) {
  var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; var ac = new OAC(2, 44100 * 5, 44100), o = buildBus(ac, ac.destination);
  var f = { def: SERV.richard, x: 0, idx: 0 }, a = SERV.richard.A.np;
  var base = name.split(':')[0];
  if (name === 'npcast') f = { def: SERV.heracles, x: 0, idx: 0 }, a = SERV.heracles.A.np;
  if (base === 'npcast' && name !== 'npcast') { var cid2 = name.split(':')[1]; f = { def: SERV[cid2], x: 0, idx: 0 }; a = SERV[cid2].A.np; name = 'npcast'; }
  if (base === 'npfire' && SERV[name.split(':')[1]]) { f = { def: SERV[name.split(':')[1]], x: 0, idx: 0 }; a = f.def.A.np; }
  SND[name](o, mkOut(o, 0), 0.01, { f: f, a: a });
  return ac.startRendering().then(function (buf) {
    var pk = 0, sum = 0, n = 0, d0 = buf.getChannelData(0), d1 = buf.getChannelData(1), last = 0, lp = 0, ls = 0, al = 1 - Math.exp(-6.283 * 120 / 44100);
    for (var i = 0; i < d0.length; i++) { var v = Math.max(Math.abs(d0[i]), Math.abs(d1[i])); if (v > pk) pk = v; sum += d0[i] * d0[i]; lp += al * (d0[i] - lp); ls += lp * lp; n++; if (v > 0.01) last = i; }
    return { name: name, peak: +pk.toFixed(3), rms: +Math.sqrt(sum / n).toFixed(4), bassPct: +(100 * ls / Math.max(1e-12, sum)).toFixed(0), tailSec: +(last / 44100).toFixed(2) };
  });
}

