/* =========================================================
   Ambient night soundtrack, generated live with Web Audio
   (no audio files): a slow minor pad, soft bells in a reverb
   and quiet hover ticks. Only starts after the visitor opts in.
   ========================================================= */
window.Sound = (function () {
  var ctx = null, master = null, reverb = null, on = false, bellTimer = 0, built = false;
  var AC = window.AudioContext || window.webkitAudioContext;

  function impulse(seconds, decay) {
    var rate = ctx.sampleRate, len = rate * seconds, buf = ctx.createBuffer(2, len, rate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function build() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    var comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);

    reverb = ctx.createConvolver(); reverb.buffer = impulse(4.5, 2.6);
    var wet = ctx.createGain(); wet.gain.value = 0.55;
    reverb.connect(wet); wet.connect(master);

    // pad: A minor 9 voicing, slowly breathing through a low-pass filter
    var filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 620; filter.Q.value = 0.7;
    var padGain = ctx.createGain(); padGain.gain.value = 0.16;
    filter.connect(padGain); padGain.connect(master); padGain.connect(reverb);
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.045;
    var lfoAmt = ctx.createGain(); lfoAmt.gain.value = 260;
    lfo.connect(lfoAmt); lfoAmt.connect(filter.frequency); lfo.start();

    [55, 110, 164.81, 246.94, 261.63, 329.63].forEach(function (f, i) {
      var o = ctx.createOscillator();
      o.type = i < 2 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = (i % 2 ? 1 : -1) * (3 + i);
      var g = ctx.createGain(); g.gain.value = i < 2 ? 0.5 : 0.13;
      var vib = ctx.createOscillator(); vib.frequency.value = 0.07 + i * 0.013;
      var vibAmt = ctx.createGain(); vibAmt.gain.value = 4;
      vib.connect(vibAmt); vibAmt.connect(o.detune); vib.start();
      o.connect(g); g.connect(filter); o.start();
    });

    // night air: very quiet filtered noise
    var nb = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    var noise = ctx.createBufferSource(); noise.buffer = nb; noise.loop = true;
    var nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 900; nf.Q.value = 0.4;
    var ng = ctx.createGain(); ng.gain.value = 0.012;
    noise.connect(nf); nf.connect(ng); ng.connect(master); noise.start();
    built = true;
  }

  var BELLS = [440, 523.25, 587.33, 659.25, 783.99, 880];
  function bell(freq, vol) {
    if (!ctx) return;
    var t = ctx.currentTime;
    var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
    var o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.01;
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    var g2 = ctx.createGain(); g2.gain.value = 0.25;
    o.connect(g); o2.connect(g2); g2.connect(g);
    g.connect(reverb); g.connect(master);
    o.start(t); o2.start(t); o.stop(t + 3.4); o2.stop(t + 3.4);
  }
  function scheduleBells() {
    clearTimeout(bellTimer);
    if (!on) return;
    bell(BELLS[Math.floor(Math.random() * BELLS.length)], 0.05);
    bellTimer = setTimeout(scheduleBells, 2600 + Math.random() * 4200);
  }

  function start() {
    if (!AC) return false;
    if (!built) build();
    if (ctx.state === 'suspended') ctx.resume();
    on = true;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0.9, t + 2.5);
    scheduleBells();
    document.documentElement.classList.add('sound-on');
    return true;
  }
  function stop() {
    if (!ctx) return;
    on = false;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 1.2);
    clearTimeout(bellTimer);
    document.documentElement.classList.remove('sound-on');
  }

  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (on) ctx.resume();
  });

  return {
    start: start,
    stop: stop,
    toggle: function () { on ? stop() : start(); return on; },
    isOn: function () { return on; },
    tick: function () { if (on) bell(1318.5, 0.012); }
  };
})();
