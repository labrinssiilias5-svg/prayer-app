// adhan.js - توليد صوت أذان اصطناعي محلياً بـ Web Audio API (بلا ملفات خارجية، بلا حقوق)
// النغمات تقريبية تشبه نداء الصلاة، لتنبيه محلي فقط.
(function (global) {
  'use strict';
  var ctx = null;
  function audio() {
    if (!ctx) ctx = new (global.AudioContext || global.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // ترددات مقام الصبا تقريباً (لحن الأذان المعروف)
  var NOTES = [
    { f: 392.00, d: 0.55 }, // G4 - الله أكبر
    { f: 329.63, d: 0.55 }, // E4
    { f: 392.00, d: 0.55 }, // G4
    { f: 293.66, d: 0.70 }, // D4 - أكبر
    { f: 392.00, d: 0.55 }, // G4
    { f: 329.63, d: 0.55 }, // E4
    { f: 293.66, d: 0.80 }, // D4 - الله أكبر
    { f: 261.63, d: 0.60 }, // C4 - أشهد
    { f: 293.66, d: 0.60 }, // D4
    { f: 329.63, d: 0.90 }, // E4 - محمد رسول الله
    { f: 392.00, d: 0.55 }, // G4 - حيّ على الصلاة
    { f: 440.00, d: 0.80 }, // A4
    { f: 392.00, d: 0.55 }, // G4 - حيّ على الفلاح
    { f: 329.63, d: 0.70 }, // E4
    { f: 293.66, d: 1.10 }, // D4 - الله أكبر
    { f: 392.00, d: 1.20 }  // G4 - لا إله إلا الله
  ];

  function beep(c, freq, dur, type, gain) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(gain || 0.18, c.currentTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur + 0.05);
  }

  // نداء الأذان كامل (متسلسل)
  function playAdhan() {
    var c = audio();
    var t = 0;
    NOTES.forEach(function (n) {
      setTimeout(function () { beep(c, n.f, n.d, 'sine', 0.2); }, t * 1000);
      t += n.d + 0.12;
    });
  }

  // تنبيه قصير (للتذكير قبل الصلاة)
  function playChime() {
    var c = audio();
    beep(c, 659.25, 0.4, 'sine', 0.15); // E5
    setTimeout(function () { beep(c, 523.25, 0.6, 'sine', 0.15); }, 350); // C5
  }

  global.Adhan = { play: playAdhan, chime: playChime };
})(typeof window !== 'undefined' ? window : this);
