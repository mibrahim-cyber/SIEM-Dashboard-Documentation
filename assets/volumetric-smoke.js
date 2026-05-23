/**
 * volumetric-smoke.js  v1.1  (ES module)
 * ────────────────────────────────────────────────────────────────────
 * Animated volumetric nebula smoke. Uses *additive radial blobs*
 * driven by domain-warped FBM noise — gives soft, wispy clouds that
 * read as smoke rather than the uniform fog you get from per-pixel
 * imageData. Cheap, smooth, never burns the void.
 *
 *   import { mountSmoke } from './volumetric-smoke.js';
 *   const smoke = mountSmoke(canvas, {
 *     mode:       'landing' | 'peripheral',
 *     opacity:    0.24,
 *     count:      18,                       // # of blobs per frame
 *     driftSpeed: 0.00022,                  // blob drift speed (per ms)
 *     palette:    ['#7c3aed', '#0e7490', '#c4b5fd', '#312e81', '#f59e0b'],
 *     qualityRef: () => 1,                  // 0..1 adaptive performance hint
 *   });
 *   smoke.setExclude({ cx, cy, r });        // viewport-pixel mask centre+radius
 *   smoke.start(); smoke.stop(); smoke.dispose();
 *
 *  Modes:
 *    landing    — wisps drift slowly across the full screen, fading to
 *                 transparent away from the four "spawn anchors" so the
 *                 frame feels alive without obscuring the wormhole.
 *    peripheral — wisps live ONLY outside an exclusion disc set by
 *                 setExclude({cx, cy, r}); the central void is never
 *                 tinted so the deck wormhole stays crisp.
 *
 *  Respects (prefers-reduced-motion: reduce): paints one calm static
 *  frame, then halts the loop.
 *
 *  Perf caps: ≤ count*2 radial-gradient fills per frame. qualityRef()
 *  lower than 0.6 cuts that count further and slows drift.
 */

const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp  = (a, b, t) => a + (b - a) * t;

// ── colour helpers ──────────────────────────────────────────────────
function parseHex(hex) {
  const h = hex.replace('#', '');
  const expanded = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h.padEnd(6, '0');
  const num = parseInt(expanded, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// ── built-in 2D value-noise (deterministic) ─────────────────────────
function makeNoise(seed) {
  const s = (seed | 0) || 1337;
  function h2(x, y) {
    let h = ((x * 374761393) ^ (y * 668265263) ^ s) | 0;
    h ^= h >> 13;
    h = Math.imul(h, 1274126177);
    return ((h ^ (h >> 16)) >>> 0) / 4294967296;
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  return function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = x - xi, fy = y - yi;
    const ux = smooth(fx), uy = smooth(fy);
    const a = h2(xi, yi),     b = h2(xi + 1, yi);
    const c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1);
    return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
  };
}

// ── public factory ──────────────────────────────────────────────────
export function mountSmoke(canvas, opts = {}) {
  const mode       = opts.mode       || 'landing';
  const peripheral = mode === 'peripheral' || mode === 'deck';
  const opacity    = clamp(opts.opacity != null ? opts.opacity : (peripheral ? 0.20 : 0.24), 0, 1);
  const driftSpeed = opts.driftSpeed != null ? opts.driftSpeed : 0.00022;
  const palette    = (opts.palette || ['#7c3aed', '#0e7490', '#c4b5fd', '#312e81', '#f59e0b']).map(parseHex);
  const seed       = opts.seed     || 9173;
  const baseCount  = opts.count    != null ? opts.count : (peripheral ? 14 : 18);
  const qualityRef = typeof opts.qualityRef === 'function' ? opts.qualityRef : () => 1;
  const reduced    = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const noise = makeNoise(seed);

  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, dpr = 1;
  let exCx = -1, exCy = -1, exR = 0, hasExclude = false;
  let running = false, rafId = 0;
  let t0 = 0, frame = 0;

  // pre-compute deterministic per-blob phase so the field doesn't all pulse together
  const blobs = [];
  function seedBlobs() {
    blobs.length = 0;
    for (let i = 0; i < baseCount * 2; i++) {
      blobs.push({
        u: noise(i * 0.91, 13.7),         // 0..1 — relative x anchor
        v: noise(i * 0.83, 7.31),         // 0..1 — relative y anchor
        ph: noise(i * 1.17, 23.4) * TAU,  // phase offset
        rad: 0.18 + noise(i * 0.42, 4.2) * 0.30,    // size as % of min(W,H)
        spd: 0.6 + noise(i * 0.51, 11.2) * 0.9,     // drift multiplier
        col: palette[i % palette.length],
        hot: i % 4 === 0,                 // every 4th blob is brighter
      });
    }
  }

  function resize() {
    W   = canvas.clientWidth  || canvas.width  || window.innerWidth;
    H   = canvas.clientHeight || canvas.height || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedBlobs();
  }

  function draw(time, q) {
    ctx.clearRect(0, 0, W, H);
    if (W === 0 || H === 0) return;

    // base haze: very faint vignette that hints at depth (skip on peripheral)
    if (!peripheral) {
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.95);
      g.addColorStop(0, 'rgba(20,15,55,0)');
      g.addColorStop(1, `rgba(60,40,120,${0.10 * opacity * 4})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // per-blob drift: circular excursion + slow domain-warp drift
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const t = time * 0.001;
    const minD = Math.min(W, H);
    const exFeather = exR * 1.6;
    const activeCount = Math.round(baseCount * clamp(0.4 + q * 0.6, 0.4, 1));

    for (let i = 0; i < activeCount; i++) {
      const b = blobs[i];
      // domain-warp using two noise samples for smooth, wandering motion
      const phase = t * driftSpeed * 1000 * b.spd + b.ph;
      const wx = noise(phase * 0.18, b.u * 4.2) - 0.5;
      const wy = noise(phase * 0.22 + 7, b.v * 4.2) - 0.5;
      const cx = (b.u + wx * 0.4) * W;
      const cy = (b.v + wy * 0.4) * H;
      const size = b.rad * minD;

      // peripheral exclusion: skip blobs inside the central disc
      if (peripheral && hasExclude) {
        const dx = cx - exCx, dy = cy - exCy;
        const dist = Math.hypot(dx, dy);
        if (dist < exR) continue;
        // soft fade inside feather ring
        var fade = dist < exFeather
          ? Math.pow((dist - exR) / Math.max(1, exFeather - exR), 2)
          : 1;
      } else {
        var fade = 1;
      }

      // wispy alpha: low base + per-blob breath + hot-blob boost
      const breath = 0.55 + 0.45 * Math.sin(phase * 1.3 + b.ph);
      const alpha = opacity * breath * fade * (b.hot ? 1.25 : 0.85);

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
      grad.addColorStop(0,   `rgba(${b.col[0]},${b.col[1]},${b.col[2]},${alpha * 0.55})`);
      grad.addColorStop(0.5, `rgba(${b.col[0]},${b.col[1]},${b.col[2]},${alpha * 0.20})`);
      grad.addColorStop(1,   `rgba(${b.col[0]},${b.col[1]},${b.col[2]},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, size, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function loop(now) {
    if (!running) return;
    if (!t0) t0 = now;
    const t = now - t0;
    const q = clamp(qualityRef(), 0, 1);
    // run draw every other frame at quality < 0.7 for cheaper deck mode
    if (!peripheral || q >= 0.7 || (frame & 1) === 0 || reduced) draw(t, q);
    frame++;
    if (reduced) { running = false; return; }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    resize();
    running = true; t0 = 0; frame = 0;
    rafId = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }
  function setCenter(x, y) {
    if (typeof x === 'number' && typeof y === 'number') {
      exCx = x; exCy = y;
    }
  }
  function setExclude(ex) {
    if (!ex) return;
    if (typeof ex.cx === 'number') exCx = ex.cx;
    if (typeof ex.cy === 'number') exCy = ex.cy;
    if (typeof ex.r  === 'number') exR  = Math.max(0, ex.r);
    hasExclude = exR > 0;
  }
  function dispose() {
    stop();
    window.removeEventListener('resize', resize);
  }

  window.addEventListener('resize', resize);
  resize();
  start();

  globalThis.VolumetricSmoke = globalThis.VolumetricSmoke || { mountSmoke };

  return { start, stop, setCenter, setExclude, resize, dispose };
}

export default { mountSmoke };
