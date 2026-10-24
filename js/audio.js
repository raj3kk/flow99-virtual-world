// Procedural Web Audio only — no copyrighted files.
// Sliders: voice, music, sfx are separate (see UI).
window.VW.Audio = {
  ctx: null, vols: { voice: 0.8, music: 0.4, sfx: 0.8 },
  ensure: function () {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone: function (freq, dur, type, vol, when) {
    if (!this.ctx) return;
    var t = this.ctx.currentTime + (when || 0);
    var o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol * this.vols.sfx, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + dur);
  },
  footstep: function (surface) {
    var f = surface === 'water' ? 220 : (surface === 'wood' ? 180 : 120);
    this.tone(f, 0.08, 'triangle', 0.3);
  },
  splash: function () { this.tone(400, 0.3, 'sine', 0.5); this.tone(300, 0.4, 'sine', 0.4, 0.05); },
  jet: function () { this.tone(160, 0.5, 'sawtooth', 0.15); },
  door: function () { this.tone(500, 0.15, 'square', 0.2); },
  teleport: function () { this.tone(800, 0.2, 'sine', 0.4); this.tone(1200, 0.3, 'sine', 0.4, 0.1); },
  success: function () { this.tone(660, 0.15, 'sine', 0.4); this.tone(880, 0.25, 'sine', 0.4, 0.12); },
  gate: function () { this.tone(523, 0.2, 'sine', 0.4); this.tone(659, 0.2, 'sine', 0.4, 0.15); this.tone(784, 0.3, 'sine', 0.4, 0.3); }
};
window.VW.speak = function (text, agent) {
  if (!window.VW.state) return;
  var box = document.getElementById('chatBox');
  if (box && window.VW.state.subtitles) box.textContent = (agent ? agent.name + ': ' : '') + text;
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.pitch = agent ? agent.pitch : 1.0;
    u.rate = agent ? agent.rate : 1.0;
    // Robotic voice for robots: lower pitch, steady rate, no human-like variation.
    if (agent && agent.id !== 'visitor') { u.pitch = Math.min(agent.pitch, 0.9); }
    u.volume = window.VW.Audio.vols.voice;
    var lang = (window.VW.state && window.VW.state.language) || 'hinglish';
    u.lang = lang === 'english' ? 'en-IN' : 'hi-IN';
    window.speechSynthesis.speak(u);
  } catch (e) { /* text fallback already shown */ }
};
