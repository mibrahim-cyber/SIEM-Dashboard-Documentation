/**
 * HABIBI-SIEM sound system — Howler.js sprite sheet
 * Loaded on first user interaction (click/keydown)
 */
(function (global) {
  'use strict';

  var SOUNDS = null;
  var MUTED = false;
  var VOLUME = 0.15;
  var LOADED = false;
  var INITIALIZED = false;

  try {
    var m = localStorage.getItem('habibi-muted');
    if (m === 'true') MUTED = true;
  } catch (_) {}

  function init() {
    if (INITIALIZED) return;
    INITIALIZED = true;

    if (typeof Howler === 'undefined' || typeof Howl === 'undefined') return;

    // Generate sprite sounds using Web Audio API since we can't host audio files
    // This creates synthetic UI sounds
    SOUNDS = new Howl({
      src: [''],
      volume: VOLUME,
      sprite: {
        tick: [0, 80],
        confirm: [0, 160],
        whoosh: [0, 300],
        chime: [0, 700],
        buzz: [0, 250]
      },
      onload: function () {
        LOADED = true;
      }
    });

    // Since we can't have real audio files, we create synthetic sounds
    // using the Web Audio API as a fallback
    if (!SOUNDS || !SOUNDS._src || !SOUNDS._src.length) {
      createSyntheticSounds();
    }
  }

  function createSyntheticSounds() {
    try {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return;
      var ctx = new AC();

      global.__siemSounds = {
        _ctx: ctx,
        play: function (name) {
          if (MUTED || !ctx) return;
          try {
            if (ctx.state === 'suspended') ctx.resume();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            switch (name) {
              case 'tick':
                osc.frequency.value = 800;
                osc.type = 'sine';
                gain.gain.setValueAtTime(VOLUME * 0.5, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.08);
                break;
              case 'confirm':
                osc.frequency.value = 600;
                osc.type = 'sine';
                gain.gain.setValueAtTime(VOLUME, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.15);
                // Second tone
                var osc2 = ctx.createOscillator();
                var gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.value = 900;
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(VOLUME * 0.7, ctx.currentTime + 0.08);
                gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                osc2.start(ctx.currentTime + 0.08);
                osc2.stop(ctx.currentTime + 0.2);
                break;
              case 'whoosh':
                osc.frequency.value = 200;
                osc.type = 'sawtooth';
                gain.gain.setValueAtTime(VOLUME * 0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.25);
                break;
              case 'chime':
                osc.frequency.value = 523;
                osc.type = 'sine';
                gain.gain.setValueAtTime(VOLUME, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.6);
                // Harmonic
                var osc3 = ctx.createOscillator();
                var gain3 = ctx.createGain();
                osc3.connect(gain3);
                gain3.connect(ctx.destination);
                osc3.frequency.value = 659;
                osc3.type = 'sine';
                gain3.gain.setValueAtTime(VOLUME * 0.6, ctx.currentTime + 0.1);
                gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
                osc3.start(ctx.currentTime + 0.1);
                osc3.stop(ctx.currentTime + 0.7);
                break;
              case 'buzz':
                osc.frequency.value = 100;
                osc.type = 'square';
                gain.gain.setValueAtTime(VOLUME * 0.4, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.2);
                break;
            }
          } catch (_) {}
        }
      };
    } catch (_) {}
  }

  function play(name) {
    if (MUTED) return;
    if (!INITIALIZED) init();
    if (global.__siemSounds && global.__siemSounds.play) {
      global.__siemSounds.play(name);
    }
  }

  function toggleMute() {
    MUTED = !MUTED;
    try {
      localStorage.setItem('habibi-muted', MUTED);
    } catch (_) {}
    return MUTED;
  }

  function isMuted() { return MUTED; }

  // Auto-init on first interaction
  function onFirstInteraction(e) {
    if (INITIALIZED) return;
    if (e.type === 'keydown' && e.key === 'F12') return; // ignore devtools
    init();
    document.removeEventListener('click', onFirstInteraction);
    document.removeEventListener('keydown', onFirstInteraction);
  }
  document.addEventListener('click', onFirstInteraction);
  document.addEventListener('keydown', onFirstInteraction);

  global.SiemSounds = {
    init: init,
    play: play,
    toggleMute: toggleMute,
    isMuted: isMuted,
    getVolume: function () { return VOLUME; },
    setVolume: function (v) { VOLUME = Math.max(0, Math.min(1, v)); }
  };
})(typeof window !== 'undefined' ? window : this);
