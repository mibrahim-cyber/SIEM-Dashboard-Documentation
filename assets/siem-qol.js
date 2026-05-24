/**
 * SIEM site — quality-of-life layer (palette companion)
 */
(function (global) {
  'use strict';

  var Core = global.SiemCore || {};
  var REDUCED = Core.REDUCED_MOTION || (matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function assetPath(rel) {
    if (Core.resolveSiteHref) return Core.resolveSiteHref(rel);
    if (location.pathname.indexOf('/brain/') !== -1) return '../' + rel;
    if (location.pathname.indexOf('/experience-modules/') !== -1) {
      var rest = location.pathname.split('/experience-modules/')[1] || '';
      var parts = rest.split('/').filter(Boolean);
      if (parts.length && /\.[a-z0-9]+$/i.test(parts[parts.length - 1])) parts.pop();
      return '../'.repeat(parts.length + 1) + rel;
    }
    return rel;
  }

  function injectStyles() {
    if (document.getElementById('siem-qol-styles')) return;
    var s = document.createElement('style');
    s.id = 'siem-qol-styles';
    s.textContent =
      '#siem-load-screen{position:fixed;inset:0;z-index:99998;background:#020617;display:flex;flex-direction:column;align-items:center;justify-content:center;font:500 11px/1.6 "IBM Plex Mono",Consolas,monospace;color:#94a3b8;transition:opacity .35s}' +
      '#siem-load-screen.hide{opacity:0;pointer-events:none}' +
      '#siem-load-bar{width:min(320px,80vw);height:3px;background:rgba(148,163,184,.15);margin-top:16px;border-radius:2px;overflow:hidden}' +
      '#siem-load-fill{height:100%;width:0;background:linear-gradient(90deg,#6366f1,#38bdf8);transition:width .2s}' +
      '#siem-scroll-progress{position:fixed;top:0;left:0;height:2px;width:0;z-index:99990;background:linear-gradient(90deg,#a78bfa,#38bdf8);pointer-events:none}' +
      '#siem-keymap{position:fixed;inset:0;z-index:99997;background:rgba(0,0,0,.88);display:none;align-items:center;justify-content:center;padding:24px}' +
      '#siem-keymap.on{display:flex}' +
      '#siem-keymap-panel{max-width:520px;width:100%;background:rgba(8,4,18,.98);border:1px solid rgba(167,139,250,.4);border-radius:6px;padding:20px;font:11px/1.6 "IBM Plex Mono",Consolas,monospace;color:#cbd5e1}' +
      '#siem-keymap-panel h2{font-size:12px;letter-spacing:3px;color:#c4b5fd;margin-bottom:12px}' +
      '#siem-keymap-panel kbd{background:rgba(15,23,42,.9);border:1px solid rgba(148,163,184,.3);padding:2px 6px;border-radius:3px;color:#e2e8f0}' +
      '#siem-motd{position:fixed;inset:0;z-index:99996;background:rgba(0,0,0,.82);display:none;align-items:center;justify-content:center;padding:24px}' +
      '#siem-motd.on{display:flex}' +
      '#siem-motd-card{max-width:480px;background:rgba(8,4,18,.98);border:1px solid rgba(56,189,248,.35);padding:24px;border-radius:6px;font:12px/1.65 "IBM Plex Mono",Consolas,monospace;color:#cbd5e1}' +
      '#siem-motd-card h2{font-size:13px;letter-spacing:3px;color:#38bdf8;margin-bottom:12px}' +
      '#siem-version-badge{position:fixed;bottom:8px;right:8px;z-index:9001;font:9px "IBM Plex Mono",monospace;color:rgba(148,163,184,.45);cursor:pointer;letter-spacing:1px;padding:4px 8px;border:1px solid transparent;border-radius:3px}' +
      '#siem-version-badge:hover{color:#c4b5fd;border-color:rgba(167,139,250,.25)}' +
      '#siem-changelog{position:fixed;inset:0;z-index:99995;background:rgba(0,0,0,.88);display:none;align-items:center;justify-content:center;padding:24px}' +
      '#siem-changelog.on{display:flex}' +
      '#siem-changelog pre{max-width:640px;max-height:70vh;overflow:auto;background:#0a0618;border:1px solid rgba(167,139,250,.35);padding:16px;font:10px/1.5 "IBM Plex Mono",monospace;color:#34d399;white-space:pre-wrap}' +
      '#siem-cursor-trail{position:fixed;inset:0;pointer-events:none;z-index:99989}' +
      '.siem-trail-dot{position:fixed;width:6px;height:6px;border-radius:50%;background:rgba(56,189,248,.55);pointer-events:none;transform:translate(-50%,-50%);transition:opacity .35s}' +
      '#siem-mobile-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:9002;height:52px;background:rgba(8,4,18,.96);border-top:1px solid rgba(167,139,250,.25);grid-template-columns:repeat(4,1fr);gap:2px;padding:4px}' +
      '#siem-mobile-nav a{font:8px/1.2 "IBM Plex Mono",monospace;color:#94a3b8;text-align:center;text-decoration:none;padding:6px 2px;display:flex;flex-direction:column;align-items:center;justify-content:center}' +
      '#siem-mobile-nav a:hover{color:#c4b5fd}' +
      '#siem-offline{position:fixed;top:4px;left:50%;transform:translateX(-50%);z-index:99999;font:9px "IBM Plex Mono",monospace;letter-spacing:2px;color:#fbbf24;background:rgba(0,0,0,.85);padding:4px 10px;border:1px solid rgba(251,191,36,.35);display:none}' +
      '#siem-offline.on{display:block}' +
      '@media(max-width:900px){#siem-mobile-nav{display:grid}body{padding-bottom:52px}}' +
      '@media print{body{background:#fff!important;color:#000!important}#siem-load-screen,#siem-keymap,#siem-motd,#siem-changelog,#siem-cursor-trail,#siem-mobile-nav,#siem-version-badge,.siem-session-badge{display:none!important}.chapter,.doc-panel{color:#000!important}}' +
      ':focus-visible{outline:2px solid #38bdf8;outline-offset:2px}' +
      '@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}';
    document.head.appendChild(s);
  }

  var LoadingScreen = {
    _el: null,
    show: function (title) {
      if (REDUCED || document.getElementById('siem-load-screen')) return;
      var el = document.createElement('div');
      el.id = 'siem-load-screen';
      el.innerHTML = '<div>' + (title || 'INITIALIZING') + '</div><div id="siem-load-bar"><div id="siem-load-fill"></div></div>';
      document.body.appendChild(el);
      this._el = el;
      var fill = el.querySelector('#siem-load-fill');
      var start = performance.now();
      function tick(now) {
        var t = Math.min(1, (now - start) / 800);
        if (fill) fill.style.width = (t * 100) + '%';
        if (t < 1) requestAnimationFrame(tick);
        else setTimeout(function () { LoadingScreen.hide(); }, 120);
      }
      requestAnimationFrame(tick);
    },
    hide: function () {
      var el = document.getElementById('siem-load-screen');
      if (!el) return;
      el.classList.add('hide');
      setTimeout(function () { el.remove(); }, 400);
    },
  };

  var DeepLink = {
    apply: function () {
      var h = location.hash.replace(/^#/, '');
      if (!h) return;
      var params = new URLSearchParams(h.replace(/^\?/, ''));
      document.dispatchEvent(new CustomEvent('siem-deeplink', { detail: Object.fromEntries(params.entries()) }));
      if (params.get('cmd') && global.TerminalShell && global.TerminalShell.runCommand) {
        setTimeout(function () { global.TerminalShell.runCommand(params.get('cmd')); }, 1200);
      }
    },
    set: function (obj) {
      try {
        var p = new URLSearchParams(obj);
        history.replaceState(null, '', location.pathname + location.search + '#' + p.toString());
      } catch (_) { /* */ }
    },
  };

  var KeyboardMap = {
    _el: null,
    open: function () {
      if (!this._el) {
        this._el = document.createElement('div');
        this._el.id = 'siem-keymap';
        this._el.innerHTML =
          '<div id="siem-keymap-panel" role="dialog" aria-label="Keyboard shortcuts">' +
          '<h2>KEYBOARD MAP</h2>' +
          '<p><kbd>Ctrl</kbd>+<kbd>K</kbd> Command palette</p>' +
          '<p><kbd>?</kbd> This overlay</p>' +
          '<p><kbd>T</kbd> Cycle nav transition (deck pages)</p>' +
          '<p><kbd>Esc</kbd> Close panels</p>' +
          '<p style="margin-top:12px;color:#64748b">Page-specific shortcuts vary by experience.</p>' +
          '</div>';
        this._el.addEventListener('click', function (e) { if (e.target === KeyboardMap._el) KeyboardMap.close(); });
        document.body.appendChild(this._el);
      }
      this._el.classList.add('on');
    },
    close: function () { if (this._el) this._el.classList.remove('on'); },
  };

  var Motd = {
    showIfNeeded: function () {
      if (location.pathname.indexOf('index.html') === -1 && !document.documentElement.getAttribute('data-deck-page')) return;
      var key = 'siem-motd-date';
      var today = new Date().toISOString().slice(0, 10);
      try {
        if (localStorage.getItem(key) === today) return;
        localStorage.setItem(key, today);
      } catch (_) { return; }
      var el = document.createElement('div');
      el.id = 'siem-motd';
      el.className = 'on';
      el.innerHTML =
        '<div id="siem-motd-card" role="dialog">' +
        '<h2>DAILY BRIEFING · ' + today + '</h2>' +
        '<p>Threat level: <strong style="color:#fbbf24">ELEVATED</strong> — simulated credential stuffing against edge API.</p>' +
        '<p>Tip: Open <strong>The Terminal</strong> and run <code>grep CRITICAL /var/log/siem/alerts.log</code>.</p>' +
        '<p style="margin-top:10px"><a href="' + assetPath('motd.html') + '" style="color:#38bdf8">Full daily briefing →</a></p>' +
        '<p style="color:#64748b;margin-top:8px">— Meridian-7 SOC</p>' +
        '<button type="button" id="siem-motd-close" style="margin-top:16px;padding:8px 16px;cursor:pointer;font:inherit;background:rgba(56,189,248,.15);border:1px solid #38bdf8;color:#e2e8f0">Acknowledge</button>' +
        '</div>';
      document.body.appendChild(el);
      el.querySelector('#siem-motd-close').onclick = function () { el.remove(); };
      el.addEventListener('click', function (e) { if (e.target === el) el.remove(); });
    },
  };

  var VersionBadge = {
    mount: function () {
      if (document.getElementById('siem-version-badge')) return;
      var v = Core.VERSION || '15.1.0';
      var el = document.createElement('button');
      el.type = 'button';
      el.id = 'siem-version-badge';
      el.textContent = 'v' + v;
      el.title = 'View changelog';
      el.onclick = VersionBadge.openChangelog;
      document.body.appendChild(el);
    },
    openChangelog: function () {
      var el = document.getElementById('siem-changelog');
      if (!el) {
        el = document.createElement('div');
        el.id = 'siem-changelog';
        el.innerHTML = '<pre id="siem-changelog-body"></pre>';
        el.addEventListener('click', function (e) { if (e.target === el) el.classList.remove('on'); });
        document.body.appendChild(el);
      }
      var body = document.getElementById('siem-changelog-body');
      body.textContent =
        'commit ' + (Core.VERSION || '15.1.0') + ' — site spec completion\n' +
        '* add siem-qol layer (motd, keymap, loading, deep links)\n' +
        '* wire CDN fallbacks + mobile nav + print styles\n' +
        '* complete experience pages + Signal Room transition fix\n' +
        '* QA audit + integrity scripts pass 3/3\n';
      el.classList.add('on');
    },
  };

  var CursorTrail = {
    _dots: [],
    init: function () {
      if (REDUCED || matchMedia('(pointer: coarse)').matches) return;
      var layer = document.createElement('div');
      layer.id = 'siem-cursor-trail';
      document.body.appendChild(layer);
      for (var i = 0; i < 8; i++) {
        var d = document.createElement('div');
        d.className = 'siem-trail-dot';
        d.style.opacity = String(1 - i * 0.11);
        layer.appendChild(d);
        this._dots.push({ el: d, x: -100, y: -100 });
      }
      addEventListener('mousemove', function (e) {
        CursorTrail._dots.forEach(function (dot, i) {
          var prev = CursorTrail._dots[i - 1] || { x: e.clientX, y: e.clientY };
          dot.x += (prev.x - dot.x) * 0.35;
          dot.y += (prev.y - dot.y) * 0.35;
          if (i === 0) { dot.x = e.clientX; dot.y = e.clientY; }
          dot.el.style.left = dot.x + 'px';
          dot.el.style.top = dot.y + 'px';
        });
      });
    },
  };

  var PageProgress = {
    init: function () {
      if (document.body.scrollHeight <= innerHeight * 1.2) return;
      var bar = document.createElement('div');
      bar.id = 'siem-scroll-progress';
      document.body.appendChild(bar);
      addEventListener('scroll', function () {
        var p = scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
        bar.style.width = (p * 100) + '%';
      }, { passive: true });
    },
  };

  var ShareCard = {
    capture: function (opts) {
      opts = opts || {};
      var c = document.createElement('canvas');
      c.width = 1200;
      c.height = 630;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#0a0618';
      ctx.fillRect(0, 0, 1200, 630);
      ctx.fillStyle = '#c4b5fd';
      ctx.font = '600 48px Consolas, monospace';
      ctx.fillText(opts.title || 'Meridian-7', 60, 120);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '28px Consolas, monospace';
      ctx.fillText(opts.subtitle || 'SIEM Documentation Deck', 60, 180);
      if (opts.score != null) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 96px Consolas, monospace';
        ctx.fillText(String(opts.score), 60, 320);
      }
      var a = document.createElement('a');
      a.download = opts.filename || 'meridian7-share.png';
      a.href = c.toDataURL('image/png');
      a.click();
    },
  };

  var MobileNav = {
    mount: function () {
      if (document.getElementById('siem-mobile-nav')) return;
      var base = assetPath('');
      var nav = document.createElement('nav');
      nav.id = 'siem-mobile-nav';
      nav.setAttribute('aria-label', 'Mobile deck navigation');
      [['Deck', base + 'brain/index.html'], ['Terminal', base + 'terminal.html'], ['Breach', base + 'breach.html'], ['Palette', '#']].forEach(function (pair) {
        var a = document.createElement('a');
        a.href = pair[1];
        a.textContent = pair[0];
        if (pair[0] === 'Palette') {
          a.href = '#';
          a.onclick = function (e) { e.preventDefault(); Core.GlobalPalette.open(); };
        }
        nav.appendChild(a);
      });
      document.body.appendChild(nav);
    },
  };

  var OfflineIndicator = {
    init: function () {
      var el = document.createElement('div');
      el.id = 'siem-offline';
      el.textContent = 'OFFLINE MODE';
      document.body.appendChild(el);
      function sync() { el.classList.toggle('on', !navigator.onLine); }
      addEventListener('online', sync);
      addEventListener('offline', sync);
      sync();
    },
  };

  function loadCdnFallback() {
    if (document.getElementById('siem-cdn-fallback-script')) return;
    var s = document.createElement('script');
    s.id = 'siem-cdn-fallback-script';
    s.src = assetPath('assets/vendor/cdn-fallback.js');
    s.async = true;
    document.head.appendChild(s);
  }

  function isDeckPage() {
    var p = document.documentElement.getAttribute('data-deck-page');
    return p === 'landing' || p === 'brain' || p === 'left' || p === 'right';
  }

  var _qolInited = false;

  function init() {
    if (_qolInited) return;
    _qolInited = true;
    injectStyles();
    if (!isDeckPage() && !document.getElementById('term-boot')) LoadingScreen.show(document.title.split('—')[0].trim() || 'MERIDIAN-7');
    DeepLink.apply();
    KeyboardMap.mount = KeyboardMap.open;
    document.addEventListener('keydown', function (e) {
      if (e.key === '?' && !e.target.matches('input, textarea, [contenteditable]')) {
        e.preventDefault();
        KeyboardMap.open();
      }
      if (e.key === 'Escape') {
        KeyboardMap.close();
        var cl = document.getElementById('siem-changelog');
        if (cl) cl.classList.remove('on');
      }
    });
    if (document.documentElement.getAttribute('data-deck-page') === 'landing') Motd.showIfNeeded();
    VersionBadge.mount();
    if (!REDUCED && !isDeckPage() && !document.getElementById('siem-cursor-trail')) CursorTrail.init();
    if (!document.getElementById('siem-scroll-progress')) PageProgress.init();
    if (!isDeckPage() && !document.getElementById('siem-mobile-nav')) MobileNav.mount();
    if (!document.getElementById('siem-offline')) OfflineIndicator.init();
    loadCdnFallback();
    global.SiemShareCard = ShareCard;
    global.SiemQoL._inited = true;
  }

  global.SiemQoL = {
    init: init,
    _inited: false,
    LoadingScreen: LoadingScreen,
    DeepLink: DeepLink,
    KeyboardMap: KeyboardMap,
    Motd: Motd,
    ShareCard: ShareCard,
  };
})(typeof window !== 'undefined' ? window : this);
