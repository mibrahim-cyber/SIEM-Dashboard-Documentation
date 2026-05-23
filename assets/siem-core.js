/**
 * SIEM Deck — shared core (SessionState, Achievements, Palette hook, Broadcast, Canvas)
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'siem-session-v1';
  var ACH_KEY = 'siem-achievements-v1';
  var BC_NAME = 'siem-deck-channel';
  var VERSION = '15.2.0';

  var REDUCED_MOTION =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── SessionState ── */
  var SessionState = {
    _data: null,

    _load: function () {
      if (this._data) return this._data;
      try {
        var raw = sessionStorage.getItem(STORAGE_KEY);
        this._data = raw ? JSON.parse(raw) : {};
      } catch (_) {
        this._data = {};
      }
      if (!this._data.startedAt) this._data.startedAt = Date.now();
      if (!this._data.visited) this._data.visited = [];
      if (!this._data.prefs) this._data.prefs = {};
      if (typeof this._data.eggCount !== 'number') this._data.eggCount = 0;
      return this._data;
    },

    _save: function () {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
      } catch (_) { /* quota */ }
    },

    get: function (key, fallback) {
      var d = this._load();
      return key in d ? d[key] : fallback;
    },

    set: function (key, val) {
      this._load()[key] = val;
      this._save();
    },

    visit: function (page) {
      var d = this._load();
      if (d.visited.indexOf(page) === -1) d.visited.push(page);
      d.lastPage = page;
      d.lastVisit = Date.now();
      this._save();
      AchievementSystem.check('visit_' + page.replace(/[^a-z0-9]/gi, '_'));
    },

    sessionMinutes: function () {
      return Math.floor((Date.now() - this._load().startedAt) / 60000);
    },

    incrementEggs: function () {
      var n = (this.get('eggCount', 0) || 0) + 1;
      this.set('eggCount', n);
      return n;
    },
  };

  /* ── AchievementSystem (44) ── */
  var ACH_DEFINITIONS = [
    { id: 'first_boot', title: 'Cold Start', desc: 'Boot the terminal for the first time.', icon: '⬡', category: 'milestones', rarity: 'common' },
    { id: 'visit_terminal', title: 'Shell Access', desc: 'Enter The Terminal.', icon: '▸', category: 'experiences', rarity: 'common' },
    { id: 'visit_breach', title: 'Red Team', desc: 'Enter The Breach simulation.', icon: '◈', category: 'experiences', rarity: 'common' },
    { id: 'visit_network', title: 'Ghost Walker', desc: 'Enter The Ghost Network.', icon: '◎', category: 'experiences', rarity: 'common' },
    { id: 'visit_cipher', title: 'Cryptographer', desc: 'Enter The Cipher vault.', icon: '⬢', category: 'experiences', rarity: 'common' },
    { id: 'visit_sim', title: 'War Games', desc: 'Enter The Simulation.', icon: '◉', category: 'experiences', rarity: 'common' },
    { id: 'visit_intercept', title: 'Interrogator', desc: 'Enter The Interrogation Room.', icon: '◫', category: 'experiences', rarity: 'common' },
    { id: 'visit_forge', title: 'Rule Smith', desc: 'Enter The Forge.', icon: '⬛', category: 'experiences', rarity: 'common' },
    { id: 'visit_archive', title: 'Archivist', desc: 'Enter The Deep Archive.', icon: '▣', category: 'experiences', rarity: 'common' },
    { id: 'visit_heist', title: 'Inside Job', desc: 'Enter The Heist.', icon: '◆', category: 'experiences', rarity: 'common' },
    { id: 'visit_cartography', title: 'Cartographer', desc: 'Enter The Cartography globe.', icon: '◐', category: 'experiences', rarity: 'common' },
    { id: 'visit_lab', title: 'Lab Rat', desc: 'Enter The Lab.', icon: '⬤', category: 'experiences', rarity: 'common' },
    { id: 'visit_memorial', title: 'Remembrance', desc: 'Enter The Memorial.', icon: '◌', category: 'experiences', rarity: 'common' },
    { id: 'visit_resonance', title: 'Resonance', desc: 'Enter The Resonance board.', icon: '♫', category: 'experiences', rarity: 'common' },
    { id: 'visit_brain', title: 'Observation Deck', desc: 'Visit the brain deck.', icon: '◑', category: 'experiences', rarity: 'common' },
    { id: 'visit_warroom', title: 'War Room', desc: 'Enter The War Room.', icon: '◒', category: 'experiences', rarity: 'common' },
    { id: 'visit_signal', title: 'Signal Lock', desc: 'Enter The Signal Room.', icon: '◓', category: 'experiences', rarity: 'common' },
    { id: 'visit_motd', title: 'Daily Briefing', desc: 'Read the Meridian-7 system broadcast.', icon: '📡', category: 'experiences', rarity: 'common' },
    { id: 'visit_trophy', title: 'Trophy Case', desc: 'Open the Achievement Room.', icon: '🏆', category: 'experiences', rarity: 'common' },
    { id: 'palette_open', title: 'Command Line', desc: 'Open the global command palette.', icon: '⌘', category: 'milestones', rarity: 'common' },
    { id: 'egg_secret', title: 'SIEM_SECRET', desc: 'Discover the SIEM_SECRET easter egg.', icon: '★', category: 'secrets', rarity: 'secret' },
    { id: 'egg_habibi', title: 'man habibi', desc: 'Read the habibi manual page.', icon: '☆', category: 'secrets', rarity: 'secret' },
    { id: 'breach_win', title: 'Containment', desc: 'Complete all breach scenarios.', icon: '✓', category: 'milestones', rarity: 'rare' },
    { id: 'cipher_alpha', title: 'Alpha Chamber', desc: 'Solve the ALPHA cipher puzzle.', icon: 'Α', category: 'milestones', rarity: 'rare' },
    { id: 'cipher_vault', title: 'Vault Breach', desc: 'Solve all six cipher chambers.', icon: 'Ω', category: 'secrets', rarity: 'secret' },
    { id: 'heist_win', title: 'Clean Exfil', desc: 'Complete a heist without detection.', icon: '◈', category: 'milestones', rarity: 'rare' },
    { id: 'deck_transition', title: 'Phase Shift', desc: 'Cycle deck transition styles.', icon: '↻', category: 'milestones', rarity: 'common' },
    { id: 'explorer', title: 'Full Tour', desc: 'Visit 10 distinct deck pages.', icon: '✦', category: 'milestones', rarity: 'rare' },
    { id: 'nav-terminal', title: 'Nav · Terminal', desc: 'Navigate to The Terminal via palette or nav.', icon: '▸', category: 'navigation', rarity: 'common' },
    { id: 'nav-breach', title: 'Nav · Breach', desc: 'Navigate to The Breach.', icon: '◈', category: 'navigation', rarity: 'common' },
    { id: 'nav-network', title: 'Nav · Network', desc: 'Navigate to The Ghost Network.', icon: '◎', category: 'navigation', rarity: 'common' },
    { id: 'nav-cipher', title: 'Nav · Cipher', desc: 'Navigate to The Cipher.', icon: '⬢', category: 'navigation', rarity: 'common' },
    { id: 'nav-sim', title: 'Nav · Simulation', desc: 'Navigate to The Simulation.', icon: '◉', category: 'navigation', rarity: 'common' },
    { id: 'nav-intercept', title: 'Nav · Interrogation', desc: 'Navigate to The Interrogation Room.', icon: '◫', category: 'navigation', rarity: 'common' },
    { id: 'nav-forge', title: 'Nav · Forge', desc: 'Navigate to The Forge.', icon: '⬛', category: 'navigation', rarity: 'common' },
    { id: 'nav-archive', title: 'Nav · Archive', desc: 'Navigate to The Deep Archive.', icon: '▣', category: 'navigation', rarity: 'common' },
    { id: 'nav-heist', title: 'Nav · Heist', desc: 'Navigate to The Heist.', icon: '◆', category: 'navigation', rarity: 'common' },
    { id: 'nav-cartography', title: 'Nav · Cartography', desc: 'Navigate to The Cartography.', icon: '◐', category: 'navigation', rarity: 'common' },
    { id: 'nav-lab', title: 'Nav · Lab', desc: 'Navigate to The Lab.', icon: '⬤', category: 'navigation', rarity: 'common' },
    { id: 'nav-memorial', title: 'Nav · Memorial', desc: 'Navigate to The Memorial.', icon: '◌', category: 'navigation', rarity: 'common' },
    { id: 'nav-resonance', title: 'Nav · Resonance', desc: 'Navigate to The Resonance.', icon: '♫', category: 'navigation', rarity: 'common' },
    { id: 'nav-right', title: 'Nav · Signal Room', desc: 'Navigate to The Signal Room.', icon: '◓', category: 'navigation', rarity: 'common' },
    { id: 'nav-left', title: 'Nav · War Room', desc: 'Navigate to The War Room.', icon: '◒', category: 'navigation', rarity: 'common' },
    { id: 'nav-brain', title: 'Nav · Observation Deck', desc: 'Navigate to the Observation Deck.', icon: '◑', category: 'navigation', rarity: 'common' },
    { id: 'nav-landing', title: 'Nav · Approach', desc: 'Navigate to the landing page.', icon: '⬡', category: 'navigation', rarity: 'common' },
    { id: 'nav-read', title: 'Nav · Documentation', desc: 'Open the documentation reader.', icon: '📖', category: 'navigation', rarity: 'common' },
    { id: 'nav-trophy', title: 'Nav · Achievements', desc: 'Open the Achievement Room.', icon: '🏆', category: 'navigation', rarity: 'common' },
    { id: 'nav-motd', title: 'Nav · Daily Briefing', desc: 'Open the daily briefing.', icon: '📡', category: 'navigation', rarity: 'common' },
  ];

  var AchievementSystem = {
    _unlocked: null,

    _load: function () {
      if (this._unlocked) return this._unlocked;
      try {
        var raw = localStorage.getItem(ACH_KEY);
        this._unlocked = raw ? JSON.parse(raw) : {};
      } catch (_) {
        this._unlocked = {};
      }
      return this._unlocked;
    },

    _save: function () {
      try {
        localStorage.setItem(ACH_KEY, JSON.stringify(this._unlocked));
      } catch (_) { /* quota */ }
    },

    list: function () {
      var u = this._load();
      return ACH_DEFINITIONS.map(function (a) {
        return {
          id: a.id, title: a.title, desc: a.desc, icon: a.icon,
          category: a.category || 'milestones', rarity: a.rarity || 'common',
          unlocked: !!u[a.id], at: u[a.id + '_at'] || null,
        };
      });
    },

    check: function (id) {
      var def = ACH_DEFINITIONS.filter(function (a) { return a.id === id; })[0];
      if (!def) return false;
      var u = this._load();
      if (u[id]) return false;
      u[id] = true;
      u[id + '_at'] = Date.now();
      this._save();
      Broadcast.notify({ type: 'achievement', id: id, title: def.title, icon: def.icon });
      if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('siem-achievement', { detail: { id: id, title: def.title } }));
      }
      if (SessionState._load().visited.length >= 10) this.check('explorer');
      return true;
    },

    count: function () {
      var u = this._load();
      return ACH_DEFINITIONS.filter(function (a) { return u[a.id]; }).length;
    },
  };

  /* ── BroadcastChannel notifications ── */
  var Broadcast = {
    _ch: null,

    _channel: function () {
      if (this._ch) return this._ch;
      if (typeof BroadcastChannel === 'undefined') return null;
      try {
        this._ch = new BroadcastChannel(BC_NAME);
        this._ch.onmessage = function (ev) {
          document.dispatchEvent(new CustomEvent('siem-broadcast', { detail: ev.data }));
        };
      } catch (_) {
        this._ch = null;
      }
      return this._ch;
    },

    notify: function (payload) {
      var ch = this._channel();
      if (ch) {
        try { ch.postMessage(Object.assign({ ts: Date.now(), page: location.pathname }, payload)); } catch (_) { /* */ }
      }
      this._toast(payload);
    },

    _toast: function (payload) {
      if (typeof document === 'undefined' || REDUCED_MOTION) return;
      if (payload.type !== 'achievement') return;
      var el = document.createElement('div');
      el.className = 'siem-toast siem-toast--achievement';
      el.setAttribute('role', 'status');
      el.innerHTML = '<span class="siem-toast-icon">' + (payload.icon || '★') + '</span><span class="siem-toast-text">Achievement: ' + payload.title + '</span>';
      document.body.appendChild(el);
      requestAnimationFrame(function () { el.classList.add('siem-toast--visible'); });
      setTimeout(function () {
        el.classList.remove('siem-toast--visible');
        setTimeout(function () { el.remove(); }, 400);
      }, 3200);
    },
  };

  /* ── AmbientAudio singleton stub ── */
  var AmbientAudio = {
    _ctx: null,
    _gain: null,
    _playing: false,
    _mode: 'off',

    init: function () {
      if (this._ctx) return this;
      if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') return this;
      try {
        var AC = global.AudioContext || global.webkitAudioContext;
        this._ctx = new AC();
        this._gain = this._ctx.createGain();
        this._gain.gain.value = 0;
        this._gain.connect(this._ctx.destination);
      } catch (_) { /* autoplay */ }
      return this;
    },

    setMode: function (mode) {
      this._mode = mode || 'off';
      SessionState.set('audioMode', this._mode);
      if (this._mode === 'off') this.stop();
    },

    toggle: function () {
      this.init();
      if (this._playing) { this.stop(); return false; }
      this.start();
      return true;
    },

    start: function () {
      this.init();
      if (!this._ctx || !this._gain) return;
      if (this._ctx.state === 'suspended') this._ctx.resume();
      this._gain.gain.setTargetAtTime(0.04, this._ctx.currentTime, 0.5);
      this._playing = true;
    },

    stop: function () {
      if (!this._gain || !this._ctx) return;
      this._gain.gain.setTargetAtTime(0, this._ctx.currentTime, 0.3);
      this._playing = false;
    },

    isPlaying: function () { return this._playing; },
  };

  /* ── EventEngine (shared tick bus) ── */
  var EventEngine = {
    _subs: [],
    _running: false,
    _last: 0,
    _interval: 1000,

    subscribe: function (fn) {
      if (typeof fn === 'function') this._subs.push(fn);
      return function () {
        EventEngine._subs = EventEngine._subs.filter(function (f) { return f !== fn; });
      };
    },

    start: function (intervalMs) {
      if (intervalMs) this._interval = intervalMs;
      if (this._running) return;
      this._running = true;
      this._last = performance.now();
      this._tick();
    },

    stop: function () { this._running = false; },

    _tick: function () {
      if (!this._running) return;
      var now = performance.now();
      var dt = now - this._last;
      this._last = now;
      var interval = this._interval;
      this._subs.forEach(function (fn) {
        try { fn(dt, now); } catch (e) { console.warn('EventEngine subscriber error', e); }
      });
      setTimeout(function () { EventEngine._tick(); }, interval);
    },

    emit: function (type, data) {
      document.dispatchEvent(new CustomEvent('siem-event', { detail: { type: type, data: data || {} } }));
    },
  };

  /* ── Canvas helpers: DPR cap, visibility pause, adaptive FPS ── */
  var CanvasLoop = {
    _loops: [],

    create: function (canvas, drawFn, opts) {
      opts = opts || {};
      var maxDpr = opts.maxDpr || 2;
      var targetFps = opts.targetFps || 60;
      var minFps = opts.minFps || 24;
      var state = {
        canvas: canvas,
        draw: drawFn,
        running: false,
        raf: 0,
        last: 0,
        frameMs: 1000 / targetFps,
        fps: targetFps,
        visible: !document.hidden,
      };

      function resize() {
        var dpr = Math.min(maxDpr, global.devicePixelRatio || 1);
        var w = canvas.clientWidth || innerWidth;
        var h = canvas.clientHeight || innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        var ctx = canvas.getContext('2d');
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function loop(now) {
        if (!state.running) return;
        state.raf = requestAnimationFrame(loop);
        if (!state.visible) return;
        if (now - state.last < state.frameMs) return;
        var dt = now - state.last;
        state.last = now;
        if (dt > state.frameMs * 2.5) state.fps = Math.max(minFps, state.fps - 4);
        else if (state.fps < targetFps) state.fps = Math.min(targetFps, state.fps + 1);
        state.frameMs = 1000 / state.fps;
        try { drawFn(now, dt); } catch (e) { console.warn('CanvasLoop draw error', e); }
      }

      state.start = function () {
        if (state.running) return;
        state.running = true;
        resize();
        state.last = performance.now();
        state.raf = requestAnimationFrame(loop);
      };
      state.stop = function () {
        state.running = false;
        if (state.raf) cancelAnimationFrame(state.raf);
      };
      state.resize = resize;

      if (!CanvasLoop._visBound) {
        CanvasLoop._visBound = true;
        document.addEventListener('visibilitychange', function () {
          var vis = !document.hidden;
          CanvasLoop._loops.forEach(function (s) { s.visible = vis; });
        });
        addEventListener('resize', function () {
          CanvasLoop._loops.forEach(function (s) { s.resize(); });
        });
      }
      CanvasLoop._loops.push(state);
      return state;
    },
  };

  /* ── GlobalPalette registry (Ctrl+K wired by palette.js) ── */
  var GlobalPalette = {
    _entries: [],
    _inited: false,

    register: function (entry) {
      if (!entry || !entry.id) return;
      this._entries = this._entries.filter(function (e) { return e.id !== entry.id; });
      this._entries.push(entry);
      this._entries.sort(function (a, b) { return (a.group || '').localeCompare(b.group || '') || (a.label || '').localeCompare(b.label || ''); });
    },

    registerDefaults: function () {
      var pages = [
        { id: 'nav-landing', label: 'Approach Vector', href: 'index.html', group: 'Deck', kbd: 'H' },
        { id: 'nav-brain', label: 'Observation Deck', href: 'brain/index.html', group: 'Deck' },
        { id: 'nav-left', label: 'The War Room', href: 'left.html', group: 'Deck' },
        { id: 'nav-right', label: 'The Signal Room', href: 'right.html', group: 'Deck' },
        { id: 'nav-terminal', label: 'The Terminal', href: 'terminal.html', group: 'Experiences' },
        { id: 'nav-breach', label: 'The Breach', href: 'breach.html', group: 'Experiences' },
        { id: 'nav-network', label: 'The Ghost Network', href: 'network.html', group: 'Experiences' },
        { id: 'nav-cipher', label: 'The Cipher', href: 'cipher.html', group: 'Experiences' },
        { id: 'nav-sim', label: 'The Simulation', href: 'sim.html', group: 'Experiences' },
        { id: 'nav-intercept', label: 'The Interrogation Room', href: 'intercept.html', group: 'Experiences' },
        { id: 'nav-forge', label: 'The Forge', href: 'forge.html', group: 'Experiences' },
        { id: 'nav-archive', label: 'The Deep Archive', href: 'archive.html', group: 'Experiences' },
        { id: 'nav-heist', label: 'The Heist', href: 'heist.html', group: 'Experiences' },
        { id: 'nav-cartography', label: 'The Cartography', href: 'cartography.html', group: 'Experiences' },
        { id: 'nav-lab', label: 'The Lab', href: 'lab.html', group: 'Experiences' },
        { id: 'nav-memorial', label: 'The Memorial', href: 'memorial.html', group: 'Experiences' },
        { id: 'nav-resonance', label: 'The Resonance', href: 'resonance.html', group: 'Experiences' },
        { id: 'nav-read', label: 'Documentation Reader', href: 'read.html', group: 'Docs' },
        { id: 'nav-trophy', label: 'Achievements', href: 'trophy.html', group: 'System', action: 'achievements' },
        { id: 'nav-motd', label: 'Daily Briefing', href: 'motd.html', group: 'System' },
      ];
      var base = document.documentElement.getAttribute('data-deck-page') === 'brain' ? '../' : '';
      if (location.pathname.indexOf('/brain/') !== -1) base = '../';
      pages.forEach(function (p) {
        GlobalPalette.register({
          id: p.id,
          label: p.label,
          group: p.group,
          kbd: p.kbd,
          href: /^https?:/.test(p.href) ? p.href : base + p.href,
          action: p.action,
        });
      });
    },

    entries: function () { return this._entries.slice(); },

    open: function () {
      document.dispatchEvent(new CustomEvent('siem-palette-open'));
      AchievementSystem.check('palette_open');
    },

    close: function () {
      document.dispatchEvent(new CustomEvent('siem-palette-close'));
    },

    init: function () {
      if (this._inited) return;
      this._inited = true;
      this.registerDefaults();
      document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          GlobalPalette.open();
        }
      });
    },
  };

  function resolveAssetPath(rel) {
    if (location.pathname.indexOf('/brain/') !== -1) return '../' + rel;
    return rel;
  }

  function loadQoL() {
    if (document.getElementById('siem-qol-script')) {
      if (global.SiemQoL && !global.SiemQoL._inited) global.SiemQoL.init();
      return;
    }
    if (global.SiemQoL && global.SiemQoL._inited) return;
    var s = document.createElement('script');
    s.id = 'siem-qol-script';
    s.src = resolveAssetPath('assets/siem-qol.js');
    s.onload = function () {
      if (global.SiemQoL) global.SiemQoL.init();
    };
    document.body.appendChild(s);
  }

  /* ── Page bootstrap ── */
  function bootPage(pageId) {
    GlobalPalette.init();
    if (pageId) SessionState.visit(pageId);
    injectCoreStyles();
    injectSessionBadge();
    loadQoL();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register(resolveSwPath()).catch(function () { /* offline optional */ });
    }
  }

  function resolveSwPath() {
    if (location.pathname.indexOf('/brain/') !== -1) return '../sw.js';
    return 'sw.js';
  }

  function injectCoreStyles() {
    if (document.getElementById('siem-core-styles')) return;
    var s = document.createElement('style');
    s.id = 'siem-core-styles';
    s.textContent =
      '.siem-toast{position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;align-items:center;gap:10px;' +
      'padding:10px 16px;background:rgba(10,4,8,.94);border:1px solid rgba(56,189,248,.35);color:#e2e8f0;' +
      'font:500 12px/1.4 "IBM Plex Mono",Consolas,monospace;opacity:0;transform:translateY(8px);transition:.35s ease}' +
      '.siem-toast--visible{opacity:1;transform:none}.siem-toast-icon{color:#fbbf24;font-size:16px}' +
      '.siem-session-badge{position:fixed;bottom:8px;left:8px;z-index:9000;font:9px/1 "IBM Plex Mono",monospace;' +
      'color:rgba(148,163,184,.55);letter-spacing:1px;pointer-events:none}.siem-egg-badge{margin-left:8px;color:#fbbf24}' +
      '@media(prefers-reduced-motion:reduce){.siem-toast{transition:none}}@media(max-width:900px){.siem-session-badge{display:none}}';
    document.head.appendChild(s);
  }

  function injectSessionBadge() {
    if (document.getElementById('siem-session-badge')) return;
    var el = document.createElement('div');
    el.id = 'siem-session-badge';
    el.className = 'siem-session-badge';
    el.setAttribute('aria-hidden', 'true');
    function tick() {
      var mins = SessionState.sessionMinutes();
      var eggs = SessionState.get('eggCount', 0);
      el.textContent = 'M7 · v' + VERSION + ' · ' + mins + 'm';
      if (eggs) el.innerHTML = el.textContent + '<span class="siem-egg-badge">★' + eggs + '</span>';
    }
    tick();
    setInterval(tick, 30000);
    document.body.appendChild(el);
  }

  global.SiemCore = {
    VERSION: VERSION,
    SessionState: SessionState,
    AchievementSystem: AchievementSystem,
    GlobalPalette: GlobalPalette,
    AmbientAudio: AmbientAudio,
    Broadcast: Broadcast,
    EventEngine: EventEngine,
    CanvasLoop: CanvasLoop,
    bootPage: bootPage,
    REDUCED_MOTION: REDUCED_MOTION,
  };
})(typeof window !== 'undefined' ? window : this);
