/**
 * particles-init.js  v1.0  (ES module)
 * ────────────────────────────────────────────────────────────────────
 * Stardust + radial inflow particle layers.
 *
 *   import { initLandingParticles, initDeckParticles } from './particles-init.js';
 *   await initLandingParticles('landing-particles');
 *   await initDeckParticles('deck-particles', { quality: 1 });
 *
 * Tries to use `tsParticles` (slim bundle, loaded via CDN as a UMD
 * defer-script) for a richer stardust starfield. If tsParticles never
 * appears within a polling window, we fall back to a hand-rolled
 * canvas implementation that ships alongside this file.
 *
 * Landing variant: bright stardust + radial inflow toward the wormhole.
 * Deck variant:    faint floating motes only — never tints the centre,
 *                  density and emit rate adapt to a quality hint.
 *
 * Respects (prefers-reduced-motion: reduce): emits a calm, low-density
 * static field and stops the animation loop.
 */

const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);
const FRAME_MS = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1000 / 15 : 1000 / 30;

function bindVisibilityPause(getRunning, setRunning, onPause, onResume) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (getRunning()) onPause();
    } else if (!getRunning()) {
      onResume();
    }
  });
}

function awaitTsParticles(timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const t0 = performance.now();
    (function poll() {
      if (globalThis.tsParticles && typeof globalThis.tsParticles.load === 'function') {
        return resolve(globalThis.tsParticles);
      }
      if (performance.now() - t0 > timeoutMs) return reject(new Error('tsParticles timeout'));
      setTimeout(poll, 80);
    })();
  });
}

function ensureChildCanvas(host, className) {
  let c = host.querySelector(`canvas.${className}`);
  if (!c) {
    c = document.createElement('canvas');
    c.className = className;
    host.appendChild(c);
  }
  return c;
}

// ════════════════════════════════════════════════════════════════════
// LANDING — bright stardust + radial inflow
// ════════════════════════════════════════════════════════════════════
async function mountStardustTs(hostId, palette, density) {
  const ts = await awaitTsParticles(4000);
  const host = document.getElementById(hostId);
  if (!host) throw new Error(`No #${hostId}`);

  await ts.load({
    id: hostId,
    options: {
      fpsLimit: 30,
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      detectRetina: true,
      particles: {
        number: { value: density, density: { enable: true, area: 1100 } },
        color:  { value: palette },
        opacity: {
          value: { min: 0.15, max: 0.95 },
          animation: { enable: true, speed: 0.65, sync: false },
        },
        size: { value: { min: 0.4, max: 1.6 } },
        move: {
          enable: true,
          speed: 0.14,
          direction: 'none',
          random: true,
          straight: false,
          outModes: 'out',
        },
        twinkle: {
          particles: {
            enable: true,
            color: '#ffffff',
            frequency: 0.012,
            opacity: 0.5,
          },
        },
      },
    },
  });

  return host;
}

function mountStardustFallback(hostId, palette, density) {
  const host = document.getElementById(hostId);
  if (!host) throw new Error(`No #${hostId}`);
  const canvas = ensureChildCanvas(host, 'stardust-fallback');
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, rafId = 0, running = false, lastFrame = 0;
  const stars = [];

  function resize() {
    W = host.clientWidth || window.innerWidth;
    H = host.clientHeight || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }
  function seed() {
    stars.length = 0;
    const N = reduced ? Math.round(density * 0.4) : density;
    for (let i = 0; i < N; i++) {
      stars.push({
        x: rnd(0, W), y: rnd(0, H),
        rad: rnd(0.3, 1.6),
        twAmp: rnd(0.25, 0.9),
        twFreq: rnd(0.6, 2.6),
        twPh: rnd(0, TAU),
        drift: rnd(-0.04, 0.04),
        col: palette[(Math.random() * palette.length) | 0],
      });
    }
  }
  function frame(now) {
    if (!running) return;
    if (document.hidden) {
      rafId = requestAnimationFrame(frame);
      return;
    }
    if (now - lastFrame < FRAME_MS) {
      rafId = requestAnimationFrame(frame);
      return;
    }
    lastFrame = now;
    const t = now * 0.001;
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const tw = 0.5 + 0.5 * Math.sin(t * s.twFreq + s.twPh);
      ctx.globalAlpha = s.twAmp * tw;
      ctx.fillStyle = s.col;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.rad, 0, TAU);
      ctx.fill();
      if (!reduced) {
        s.x += s.drift;
        if (s.x < -2) s.x = W + 2;
        if (s.x > W + 2) s.x = -2;
      }
    }
    ctx.globalAlpha = 1;
    if (reduced) { running = false; return; }
    rafId = requestAnimationFrame(frame);
  }
  window.addEventListener('resize', resize);
  resize();
  running = true;
  bindVisibilityPause(
    () => running,
    (v) => { running = v; },
    () => { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; },
    () => { if (!running) { running = true; rafId = requestAnimationFrame(frame); } },
  );
  rafId = requestAnimationFrame(frame);
  return host;
}

function mountInflowCanvas(host, opts = {}) {
  const canvas = ensureChildCanvas(host, 'inflow');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '2';

  const ctx = canvas.getContext('2d');
  const reduced = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const provideCenter = opts.center || (() => ({
    x: host.clientWidth / 2,
    y: host.clientHeight / 2,
    r: Math.min(host.clientWidth, host.clientHeight) * 0.26,
  }));

  let W = 0, H = 0, dpr = 1, rafId = 0, running = false, lastFrame = 0;
  const inflow = [];

  function resize() {
    W = host.clientWidth || window.innerWidth;
    H = host.clientHeight || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }
  function seed() {
    inflow.length = 0;
    const N = reduced ? 0 : 55;
    for (let i = 0; i < N; i++) {
      inflow.push({
        ang: rnd(0, TAU),
        rad: rnd(80, 320),
        spd: rnd(0.012, 0.022),
        size: rnd(0.6, 1.8),
      });
    }
  }
  function frame(now) {
    if (!running) return;
    if (document.hidden) {
      rafId = requestAnimationFrame(frame);
      return;
    }
    if (now - lastFrame < FRAME_MS) {
      rafId = requestAnimationFrame(frame);
      return;
    }
    lastFrame = now;
    ctx.clearRect(0, 0, W, H);
    if (!reduced) {
      const c = provideCenter();
      for (const p of inflow) {
        p.ang += p.spd;
        p.rad -= 0.32 + Math.random() * 0.05;
        if (p.rad < c.r * 1.05) {
          p.rad = c.r * (5 + Math.random() * 3);
          p.ang = rnd(0, TAU);
        }
        const x = c.x + Math.cos(p.ang) * p.rad;
        const y = c.y + Math.sin(p.ang) * p.rad * 0.85;
        const k = 1 - p.rad / (c.r * 8);
        ctx.fillStyle = k > 0.65
          ? `rgba(255,255,255,${0.25 + k * 0.4})`
          : `rgba(167,139,250,${0.12 + k * 0.28})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, TAU);
        ctx.fill();
      }
    }
    if (reduced) { running = false; return; }
    rafId = requestAnimationFrame(frame);
  }
  window.addEventListener('resize', resize);
  resize();
  running = true;
  bindVisibilityPause(
    () => running,
    (v) => { running = v; },
    () => { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; },
    () => { if (!running) { running = true; rafId = requestAnimationFrame(frame); } },
  );
  rafId = requestAnimationFrame(frame);
  return {
    dispose() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    },
  };
}

export async function initLandingParticles(hostId) {
  const palette = ['#cfe0ff', '#ffffff', '#ffe8c8', '#a5b4fc'];
  const density = 90;
  let host;
  try {
    host = await mountStardustTs(hostId, palette, density);
  } catch {
    host = mountStardustFallback(hostId, palette, density);
  }
  mountInflowCanvas(host);
  return host;
}

// ════════════════════════════════════════════════════════════════════
// DECK — faint floating motes only (no inflow over the void)
// ════════════════════════════════════════════════════════════════════
function mountDeckMotes(hostId, quality) {
  const host = document.getElementById(hostId);
  if (!host) throw new Error(`No #${hostId}`);
  const canvas = ensureChildCanvas(host, 'deck-motes-fallback');
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const palette = ['#c4b5fd', '#a5b4fc', '#86efac', '#5eead4', '#fbbf24'];

  let W = 0, H = 0, dpr = 1, rafId = 0, running = false, lastFrame = 0;
  const motes = [];

  function resize() {
    W = host.clientWidth || window.innerWidth;
    H = host.clientHeight || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }
  function seed() {
    motes.length = 0;
    const base = reduced ? 40 : 90;
    const q = Math.max(0.3, Math.min(1, typeof quality === 'function' ? quality() : quality || 1));
    const N = Math.round(base * q);
    for (let i = 0; i < N; i++) {
      motes.push({
        x: rnd(0, W), y: rnd(0, H),
        vx: rnd(-0.06, 0.06),
        vy: rnd(-0.04, 0.04),
        rad: rnd(0.3, 1.4),
        twAmp: rnd(0.18, 0.7),
        twFreq: rnd(0.4, 1.6),
        twPh: rnd(0, TAU),
        col: palette[(Math.random() * palette.length) | 0],
      });
    }
  }
  function frame(now) {
    if (!running) return;
    if (document.hidden) {
      rafId = requestAnimationFrame(frame);
      return;
    }
    if (now - lastFrame < FRAME_MS) {
      rafId = requestAnimationFrame(frame);
      return;
    }
    lastFrame = now;
    const t = now * 0.001;
    ctx.clearRect(0, 0, W, H);
    for (const m of motes) {
      const tw = 0.5 + 0.5 * Math.sin(t * m.twFreq + m.twPh);
      ctx.globalAlpha = m.twAmp * tw;
      ctx.fillStyle = m.col;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.rad, 0, TAU);
      ctx.fill();
      if (!reduced) {
        m.x += m.vx; m.y += m.vy;
        if (m.x < -3) m.x = W + 3;
        if (m.x > W + 3) m.x = -3;
        if (m.y < -3) m.y = H + 3;
        if (m.y > H + 3) m.y = -3;
      }
    }
    ctx.globalAlpha = 1;
    if (reduced) { running = false; return; }
    rafId = requestAnimationFrame(frame);
  }
  window.addEventListener('resize', resize);
  resize();
  running = true;
  bindVisibilityPause(
    () => running,
    (v) => { running = v; },
    () => { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; },
    () => { if (!running) { running = true; rafId = requestAnimationFrame(frame); } },
  );
  rafId = requestAnimationFrame(frame);
  return {
    dispose() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    },
  };
}

export async function initDeckParticles(hostId, opts = {}) {
  // For the deck we always use the lightweight fallback — tsParticles
  // adds a non-trivial paint cost and the deck already runs heavy
  // canvas work. The fallback respects the deck's adaptive quality.
  return mountDeckMotes(hostId, opts.quality);
}

globalThis.LandingParticles = globalThis.LandingParticles || { initLandingParticles, initDeckParticles };

export default { initLandingParticles, initDeckParticles };
