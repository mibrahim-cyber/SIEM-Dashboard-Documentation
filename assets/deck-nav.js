/**
 * Shared deck wing navigation — plasma chevrons, hover labels, radial wipe transition.
 */
(function () {
  'use strict';

  /** Experience ring order — wing chevrons chain through these, hub at Observation Deck. */
  const EXPERIENCE_CHAIN = [
    { id: 'terminal', file: 'terminal.html', label: 'The Terminal' },
    { id: 'breach', file: 'breach.html', label: 'The Breach' },
    { id: 'network', file: 'network.html', label: 'The Ghost Network' },
    { id: 'cipher', file: 'cipher.html', label: 'The Cipher' },
    { id: 'sim', file: 'sim.html', label: 'The Simulation' },
    { id: 'intercept', file: 'intercept.html', label: 'The Interrogation Room' },
    { id: 'forge', file: 'forge.html', label: 'The Forge' },
    { id: 'archive', file: 'archive.html', label: 'The Deep Archive' },
    { id: 'heist', file: 'heist.html', label: 'The Heist' },
    { id: 'cartography', file: 'cartography.html', label: 'The Cartography' },
    { id: 'lab', file: 'lab.html', label: 'The Lab' },
    { id: 'memorial', file: 'memorial.html', label: 'The Memorial' },
    { id: 'resonance', file: 'resonance.html', label: 'The Resonance' },
  ];

  const HUB_ROUTE = { file: 'brain/index.html', label: 'Observation Deck' };

  const GAME3D_CHAIN = [
    { id: 'terminal-3d', file: 'experience-modules/game1-terminal/index.html', label: 'The Terminal' },
    { id: 'breach-3d', file: 'experience-modules/game2-breach/index.html', label: 'The Breach' },
    { id: 'network-3d', file: 'experience-modules/game3-network/index.html', label: 'The Ghost Network' },
    { id: 'cipher-3d', file: 'experience-modules/game4-cipher/index.html', label: 'The Cipher' },
    { id: 'sim-3d', file: 'experience-modules/game5-simulation/index.html', label: 'The Simulation' },
    { id: 'intercept-3d', file: 'experience-modules/game6-intercept/index.html', label: 'The Interrogation Room' },
    { id: 'forge-3d', file: 'experience-modules/game7-forge/index.html', label: 'The Forge' },
    { id: 'archive-3d', file: 'experience-modules/game8-archive/index.html', label: 'The Deep Archive' },
    { id: 'heist-3d', file: 'experience-modules/game9-heist/index.html', label: 'The Heist' },
    { id: 'lab-3d', file: 'experience-modules/game10-lab/index.html', label: 'The Lab' },
    { id: 'cartography-3d', file: 'experience-modules/game11-cartography/index.html', label: 'The Cartography' },
    { id: 'memorial-3d', file: 'experience-modules/game12-memorial/index.html', label: 'The Memorial' },
    { id: 'resonance-3d', file: 'experience-modules/game13-resonance/index.html', label: 'The Resonance' },
  ];

  /** Logical routes (site-root relative). Resolved per page via resolveDeckHref(). */
  const PAGE_ROUTES = {
    brain: { left: 'left.html', right: 'right.html', leftLabel: 'The War Room', rightLabel: 'The Signal Room' },
    left: { left: null, right: 'brain/index.html', rightLabel: 'Observation Deck' },
    right: { left: 'brain/index.html', right: null, leftLabel: 'Observation Deck' },
    landing: { left: 'left.html', right: 'brain/index.html', leftLabel: 'The War Room', rightLabel: 'Observation Deck' },
  };

  EXPERIENCE_CHAIN.forEach(function (exp, i) {
    const prev = i > 0 ? EXPERIENCE_CHAIN[i - 1] : HUB_ROUTE;
    const next = i < EXPERIENCE_CHAIN.length - 1 ? EXPERIENCE_CHAIN[i + 1] : HUB_ROUTE;
    PAGE_ROUTES[exp.id] = {
      left: prev.file,
      right: next.file,
      leftLabel: prev.label,
      rightLabel: next.label,
    };
  });

  GAME3D_CHAIN.forEach(function (exp, i) {
    const prev = i > 0 ? GAME3D_CHAIN[i - 1] : HUB_ROUTE;
    const next = i < GAME3D_CHAIN.length - 1 ? GAME3D_CHAIN[i + 1] : HUB_ROUTE;
    PAGE_ROUTES[exp.id] = {
      left: prev.file,
      right: next.file,
      leftLabel: prev.label,
      rightLabel: next.label,
    };
  });

  PAGE_ROUTES['experience-hub'] = {
    left: 'index.html',
    right: 'brain/index.html',
    leftLabel: 'Approach',
    rightLabel: 'Observation Deck',
  };

  const CHEVRON_LEFT =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  const CHEVRON_RIGHT =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

  let wipeCanvas;
  let wipeCtx;
  let wiping = false;
  let navigating = false;
  let navClickAt = 0;
  let navButtons = [];
  let wipeFailSafe = 0;
  let wipeTargetHref = null;
  const TRANSITION_KEY = 'deck-nav-transition-style';
  const TRANSITION_STYLES = ['WIPE', 'GLITCH', 'DISSOLVE'];
  let transitionStyle = 'WIPE';
  const REDUCED_MOTION = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function loadTransitionStyle() {
    try {
      const saved = sessionStorage.getItem(TRANSITION_KEY);
      if (TRANSITION_STYLES.indexOf(saved) !== -1) transitionStyle = saved;
    } catch (_) { /* private mode */ }
  }

  function cycleTransitionStyle() {
    const idx = (TRANSITION_STYLES.indexOf(transitionStyle) + 1) % TRANSITION_STYLES.length;
    transitionStyle = TRANSITION_STYLES[idx];
    try { sessionStorage.setItem(TRANSITION_KEY, transitionStyle); } catch (_) { /* */ }
    if (window.SiemCore && window.SiemCore.AchievementSystem) {
      window.SiemCore.AchievementSystem.check('deck_transition');
    }
    showTransitionToast(transitionStyle);
  }

  function showTransitionToast(label) {
    let el = document.getElementById('deck-nav-transition-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'deck-nav-transition-toast';
      el.setAttribute('aria-live', 'polite');
      el.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:99998;padding:8px 14px;font:600 10px/1 Consolas,monospace;letter-spacing:2px;color:#38bdf8;background:rgba(10,4,8,.92);border:1px solid rgba(56,189,248,.35);opacity:0;transition:opacity .25s;pointer-events:none';
      document.body.appendChild(el);
    }
    el.textContent = 'TRANSITION · ' + label;
    el.style.opacity = '1';
    clearTimeout(showTransitionToast._t);
    showTransitionToast._t = setTimeout(function () { el.style.opacity = '0'; }, 1400);
  }

  loadTransitionStyle();

  function dispatchNavEvent(name, detail) {
    try {
      document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
    } catch (_) { /* IE11 edge */ }
  }

  function resetWipeLayer() {
    wiping = false;
    // navigating is intentionally NOT reset here — finishNavigate and pageshow manage it
    wipeTargetHref = null;
    if (wipeFailSafe) {
      clearTimeout(wipeFailSafe);
      wipeFailSafe = 0;
    }
    const layer = document.getElementById('deck-nav-wipe');
    if (layer) {
      layer.classList.remove('active');
      layer.style.opacity = '';
      layer.style.transition = '';
    }
    if (!navigating) setNavDisabled(false);
    dispatchNavEvent('deck-nav-wipe-end');
  }

  function finishNavigate(href) {
    if (navigating) return;
    if (!href) {
      resetWipeLayer();
      return;
    }
    if (window.SiemCore && window.SiemCore.AchievementSystem) {
      var navMap = {
        'terminal.html': 'nav-terminal', 'breach.html': 'nav-breach', 'network.html': 'nav-network',
        'cipher.html': 'nav-cipher', 'sim.html': 'nav-sim', 'intercept.html': 'nav-intercept',
        'forge.html': 'nav-forge', 'archive.html': 'nav-archive', 'heist.html': 'nav-heist',
        'cartography.html': 'nav-cartography', 'lab.html': 'nav-lab', 'memorial.html': 'nav-memorial',
        'resonance.html': 'nav-resonance', 'left.html': 'nav-left', 'right.html': 'nav-right',
        'index.html': 'nav-landing', 'read.html': 'nav-read', 'trophy.html': 'nav-trophy', 'motd.html': 'nav-motd',
        'brain/index.html': 'nav-brain',
      };
      var key = String(href).replace(/^(\.\.\/)+/, '').split('?')[0];
      if (navMap[key]) window.SiemCore.AchievementSystem.check(navMap[key]);
    }
    navigating = true;        // lock before resetWipeLayer so buttons stay disabled
    resetWipeLayer();
    setTimeout(function () {  // safety valve — clears the lock if navigation stalls
      navigating = false;
      setNavDisabled(false);
    }, 2000);
    location.assign(href);
  }

  /** Resolve a site-root path from the current deck page (no ../ stacking). */
  function resolveDeckHref(target) {
    if (!target) return null;
    if (/^(https?:|mailto:|#)/.test(target)) return target;
    const clean = String(target).replace(/^\/+/, '');
    if (window.SiemCore && window.SiemCore.resolveSiteHref) {
      return window.SiemCore.resolveSiteHref(clean);
    }
    const page = document.documentElement.getAttribute('data-deck-page') || 'landing';
    if (page === 'brain') return '../' + clean;
    return clean;
  }

  function ensureWipeLayer() {
    let el = document.getElementById('deck-nav-wipe');
    if (!el) {
      el = document.createElement('div');
      el.id = 'deck-nav-wipe';
      el.setAttribute('aria-hidden', 'true');
      const c = document.createElement('canvas');
      el.appendChild(c);
      document.body.appendChild(el);
    }
    wipeCanvas = el.querySelector('canvas');
    wipeCtx = wipeCanvas.getContext('2d');
    return el;
  }

  function resizeWipe() {
    if (!wipeCanvas) return;
    wipeCanvas.width = innerWidth;
    wipeCanvas.height = innerHeight;
  }

  function setNavDisabled(disabled) {
    navButtons.forEach(function (btn) {
      btn.disabled = disabled;
      btn.classList.toggle('deck-nav-btn--disabled', disabled);
      btn.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    });
  }

  function radialWipeNavigate(href, originX, originY) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (wiping || navigating || !href || now - navClickAt < 800) return;
    navClickAt = now;
    wiping = true;
    wipeTargetHref = href;
    setNavDisabled(true);
    dispatchNavEvent('deck-nav-wipe-start', { href: href, style: transitionStyle });

    if (REDUCED_MOTION) {
      finishNavigate(href);
      return;
    }

    if (transitionStyle === 'GLITCH') {
      runGlitchTransition(href);
      return;
    }
    if (transitionStyle === 'DISSOLVE') {
      runDissolveTransition(href);
      return;
    }

    const layer = ensureWipeLayer();
    resizeWipe();
    layer.classList.add('active');
    const start = performance.now();
    const dur = 480;
    const maxR = Math.hypot(innerWidth, innerHeight) * 1.2;

    if (wipeFailSafe) clearTimeout(wipeFailSafe);
    wipeFailSafe = setTimeout(function () {
      if (wiping && wipeTargetHref) finishNavigate(wipeTargetHref);
    }, dur + 450);

    function frame(now) {
      if (!wiping || !wipeTargetHref) return;
      try {
        const t = Math.min(1, (now - start) / dur);
        const r = maxR * (t * t * (3 - 2 * t));
        wipeCtx.clearRect(0, 0, wipeCanvas.width, wipeCanvas.height);
        wipeCtx.fillStyle = '#0a0408';
        wipeCtx.fillRect(0, 0, wipeCanvas.width, wipeCanvas.height);
        wipeCtx.globalCompositeOperation = 'destination-out';
        wipeCtx.beginPath();
        wipeCtx.arc(originX, originY, r, 0, Math.PI * 2);
        wipeCtx.fill();
        wipeCtx.globalCompositeOperation = 'source-over';
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          finishNavigate(wipeTargetHref);
        }
      } catch (err) {
        console.warn('deck-nav wipe failed, navigating directly', err);
        finishNavigate(wipeTargetHref);
      }
    }
    requestAnimationFrame(frame);
  }

  function runGlitchTransition(href) {
    const layer = ensureWipeLayer();
    resizeWipe();
    layer.classList.add('active');
    const start = performance.now();
    const dur = 420;
    if (wipeFailSafe) clearTimeout(wipeFailSafe);
    wipeFailSafe = setTimeout(function () {
      if (wiping && wipeTargetHref) finishNavigate(wipeTargetHref);
    }, dur + 450);

    function frame(now) {
      if (!wiping || !wipeTargetHref) return;
      try {
        const t = Math.min(1, (now - start) / dur);
        const w = wipeCanvas.width;
        const h = wipeCanvas.height;
        wipeCtx.clearRect(0, 0, w, h);
        wipeCtx.fillStyle = '#0a0408';
        wipeCtx.fillRect(0, 0, w, h);
        const slices = 12 + Math.floor(t * 8);
        for (let i = 0; i < slices; i++) {
          const sy = (h / slices) * i;
          const sh = h / slices + 2;
          const dx = (Math.random() - 0.5) * 40 * (1 - t);
          wipeCtx.drawImage(wipeCanvas, 0, sy, w, sh, dx, sy, w, sh);
        }
        wipeCtx.globalCompositeOperation = 'source-over';
        wipeCtx.fillStyle = 'rgba(56,189,248,' + (0.08 + Math.random() * 0.12) + ')';
        wipeCtx.fillRect(0, 0, w, h);
        if (t < 1) requestAnimationFrame(frame);
        else finishNavigate(wipeTargetHref);
      } catch (err) {
        console.warn('deck-nav glitch failed, navigating directly', err);
        finishNavigate(wipeTargetHref);
      }
    }
    wipeCtx.fillStyle = '#0a0408';
    wipeCtx.fillRect(0, 0, wipeCanvas.width, wipeCanvas.height);
    requestAnimationFrame(frame);
  }

  function runDissolveTransition(href) {
    const layer = ensureWipeLayer();
    resizeWipe();
    layer.classList.add('active');
    layer.style.opacity = '0';
    layer.style.transition = 'opacity 480ms ease';
    if (wipeFailSafe) clearTimeout(wipeFailSafe);
    wipeFailSafe = setTimeout(function () {
      if (wiping && wipeTargetHref) finishNavigate(wipeTargetHref);
    }, 560);
    function onEnd() {
      layer.removeEventListener('transitionend', onEnd);
      if (wiping && wipeTargetHref) finishNavigate(wipeTargetHref);
    }
    layer.addEventListener('transitionend', onEnd);
    requestAnimationFrame(function () { layer.style.opacity = '1'; });
  }

  function makeBtn(side, label, href) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'deck-nav-btn deck-nav-btn--' + side;
    btn.setAttribute('aria-label', label);
    btn.innerHTML =
      '<span class="deck-nav-aura"></span>' +
      (side === 'left' ? CHEVRON_LEFT : CHEVRON_RIGHT) +
      '<span class="deck-nav-label">' +
      label +
      '</span>';
    btn.addEventListener('click', function (e) {
      if (btn.disabled || wiping) return;
      e.preventDefault();
      const rect = btn.getBoundingClientRect();
      const ox = side === 'left' ? rect.right : rect.left;
      const oy = rect.top + rect.height / 2;
      radialWipeNavigate(href, ox, oy);
    });
    navButtons.push(btn);
    return btn;
  }

  function initDeckNav(page) {
    const routes = PAGE_ROUTES[page] || PAGE_ROUTES.brain;
    let root = document.getElementById('deck-nav-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'deck-nav-root';
      document.body.appendChild(root);
    }
    root.innerHTML = '';
    navButtons = [];
    wiping = false;
    if (routes.left) {
      const href = resolveDeckHref(routes.left);
      if (href) root.appendChild(makeBtn('left', routes.leftLabel, href));
    }
    if (routes.right) {
      const href = resolveDeckHref(routes.right);
      if (href) root.appendChild(makeBtn('right', routes.rightLabel, href));
    }
    ensureWipeLayer();
    resizeWipe();
    setNavDisabled(false);
  }

  window.initDeckNav = initDeckNav;
  window.deckNavResetWipe = resetWipeLayer;
  window.deckNavCycleTransition = cycleTransitionStyle;
  addEventListener('keydown', function (e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
    if (e.key === 't' || e.key === 'T') {
      if (!e.ctrlKey && !e.metaKey && !e.altKey) cycleTransitionStyle();
    }
  });
  addEventListener('resize', resizeWipe);
  addEventListener('pagehide', resetWipeLayer);
  addEventListener('pageshow', function () {
    navigating = false; // bfcache restore: ensure lock is cleared on page re-show
    resetWipeLayer();
  });
  addEventListener('DOMContentLoaded', function () {
    var layer = document.getElementById('deck-nav-wipe');
    if (layer && layer.classList.contains('active')) resetWipeLayer();
  });
  setTimeout(function () {
    var layer = document.getElementById('deck-nav-wipe');
    if (layer && layer.classList.contains('active') && !wiping && !navigating) resetWipeLayer();
  }, 1200);
  const page = document.documentElement.getAttribute('data-deck-page');
  if (page) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { initDeckNav(page); });
    } else {
      initDeckNav(page);
    }
  }
})();
