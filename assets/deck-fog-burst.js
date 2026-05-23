/**
 * deck-fog-burst.js — optimised FBM fog click bursts (pooled textures, paint budget).
 */
import { createNoise2D } from 'simplex-noise';

const TAU = Math.PI * 2;
const PATCH = 88;
const SAT_PATCH = 64;
const MAX_WISPS = 3;
const PAINT_BUDGET = 1;
const BURST_COOLDOWN_MS = 550;
let lastBurstAt = 0;
const PIXEL_STEP = 2;

function parseHex(hex) {
  const h = (hex || '#7c3aed').replace('#', '');
  const e = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0');
  const n = parseInt(e, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fbm2d(noise2D, x, y, oct) {
  let v = 0;
  let amp = 0.55;
  let f = 1;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    v += amp * noise2D(x * f, y * f);
    norm += amp;
    amp *= 0.52;
    f *= 2.03;
  }
  return (v / norm + 1) * 0.5;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createFogBurstLayer(canvas) {
  const reduced = typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  const bursts = [];
  const texPool = [];
  let W = 0;
  let H = 0;
  let frame = 0;
  let paintQueue = 0;

  function acquireTex(size) {
    for (let i = 0; i < texPool.length; i++) {
      const t = texPool[i];
      if (t.size === size && !t.busy) { t.busy = true; return t; }
    }
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const tex = { c, ctx: c.getContext('2d', { willReadFrequently: true }), size, busy: true };
    texPool.push(tex);
    return tex;
  }

  function releaseTex(tex) {
    if (tex) tex.busy = false;
  }

  function resize(w, h) {
    W = w;
    H = h;
    const dpr = Math.min(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, 1.25);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function paintWisp(b, alphaMul) {
    const patchSize = b.patch;
    const texCtx = b.tex.ctx;
    const img = texCtx.createImageData(patchSize, patchSize);
    const data = img.data;
    const cx = patchSize * 0.5;
    const cy = patchSize * 0.5;
    const cr = b.cr; const cg = b.cg; const cb = b.cb;
    const tr = b.tr; const tg = b.tg; const tb = b.tb;
    const t = b.age * 0.038 + b.phase;
    const inv = 1 / (patchSize * b.spread);
    const step = PIXEL_STEP;

    for (let py = 0; py < patchSize; py += step) {
      for (let px = 0; px < patchSize; px += step) {
        const dx = (px - cx) * inv;
        const dy = (py - cy) * inv;
        const dist = Math.hypot(dx, dy);
        if (dist > 1.12) continue;

        const wx = fbm2d(b.noise, dx * 2.1 + t, dy * 2.1 + t * 0.65, 2);
        const wy = fbm2d(b.noise, dx * 2.1 + t * 0.55 + 4.2, dy * 2.1, 2);
        const n = fbm2d(b.noise, dx * 3.4 + wx * 0.72, dy * 3.4 + wy * 0.72, 3);
        const fil = fbm2d(b.noise, dx * 5.5 + t * 1.2, dy * 5.5 - t * 0.8, 2);

        const rim = Math.max(0, 1 - Math.pow(dist / 1.08, b.falloff));
        const core = Math.exp(-dist * dist * 2.8);
        let alpha = (n * 0.72 + fil * 0.28) * rim * rim;
        alpha = Math.pow(alpha, 1.15) * alphaMul;
        alpha += core * 0.22 * alphaMul;
        if (alpha < 0.015) continue;

        const hot = n > 0.58 ? (n - 0.58) * 2.2 : 0;
        const r = Math.min(255, cr * (1 - hot * 0.2) + tr * hot * 0.35 + 255 * hot * 0.45);
        const g = Math.min(255, cg * (1 - hot * 0.2) + tg * hot * 0.35 + 245 * hot * 0.42);
        const bl = Math.min(255, cb * (1 - hot * 0.15) + tb * hot * 0.35 + 255 * hot * 0.5);
        const a = Math.min(255, alpha * 255) | 0;

        for (let sy = 0; sy < step && py + sy < patchSize; sy++) {
          for (let sx = 0; sx < step && px + sx < patchSize; sx++) {
            const i = ((py + sy) * patchSize + (px + sx)) * 4;
            data[i] = r | 0;
            data[i + 1] = g | 0;
            data[i + 2] = bl | 0;
            data[i + 3] = a;
          }
        }
      }
    }
    texCtx.putImageData(img, 0, 0);
    b.lastPaintAge = b.age;
  }

  /** @param {number} x @param {number} y @param {{color?:string,intensity?:number}} opts */
  function burst(x, y, opts) {
    if (reduced || W === 0) return;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - lastBurstAt < BURST_COOLDOWN_MS) return;
    if (typeof window !== 'undefined' && window.siemDeckFxPaused && window.siemDeckFxPaused()) return;
    lastBurstAt = now;
    opts = opts || {};
    const q = window.siemDeck && window.siemDeck.getQuality ? window.siemDeck.getQuality() : 1;
    if (q < 0.62) return;
    const seed = ((x * 48271 + y * 65521) ^ (bursts.length * 1337 + frame)) | 0;
    const rng = mulberry32(seed);
    const base = opts.color || '#7c3aed';
    const palette = [base, '#0e7490', '#f472b6', '#38bdf8', '#c4b5fd', '#e9d5ff'];
    const intensity = opts.intensity == null ? 1 : opts.intensity;

    function addWisp(offX, offY, scaleMul, isSat) {
      const patch = isSat ? SAT_PATCH : PATCH;
      const col = palette[(rng() * palette.length) | 0];
      const tint = palette[(rng() * palette.length) | 0];
      const [cr, cg, cb] = parseHex(col);
      const [tr, tg, tb] = parseHex(tint);
      bursts.push({
        x: x + offX,
        y: y + offY,
        life: 1,
        age: 0,
        scale: 0.12 * scaleMul,
        maxScale: (0.78 + rng() * 0.42) * scaleMul * intensity,
        rot: rng() * TAU,
        rotSpd: (rng() - 0.5) * 0.022,
        cr, cg, cb, tr, tg, tb,
        phase: rng() * TAU,
        spread: 0.34 + rng() * 0.12,
        falloff: 1.8 + rng() * 0.8,
        noise: createNoise2D(() => (seed + bursts.length * 991) | 0),
        sat: isSat,
        patch,
        tex: acquireTex(patch),
        lastPaintAge: -1,
        repaintEvery: isSat ? (q < 0.6 ? 8 : 5) : (q < 0.6 ? 4 : 3),
      });
    }

    addWisp(0, 0, 1, false);
    const satN = 0;
    for (let i = 0; i < satN; i++) {
      const a = rng() * TAU;
      const d = 12 + rng() * 28;
      addWisp(Math.cos(a) * d, Math.sin(a) * d, 0.5 + rng() * 0.4, true);
    }

    while (bursts.length > MAX_WISPS) {
      const old = bursts.shift();
      releaseTex(old.tex);
    }
  }

  function reset() {
    for (let i = 0; i < bursts.length; i++) releaseTex(bursts[i].tex);
    bursts.length = 0;
  }

  function draw(quality) {
    if (W === 0) return;
    frame++;
    if (!bursts.length) return;

    quality = quality == null ? 1 : quality;

    ctx.clearRect(0, 0, W, H);
    if (!bursts.length) return;

    let paintsLeft = quality < 0.6 ? 1 : PAINT_BUDGET;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < bursts.length; i++) {
      const b = bursts[i];
      b.age += 1;
      b.life -= b.sat ? 0.013 : 0.01;
      b.scale += (b.maxScale - b.scale) * (b.sat ? 0.08 : 0.06);
      b.rot += b.rotSpd;

      if (b.life <= 0) {
        releaseTex(b.tex);
        bursts.splice(i, 1);
        i--;
        continue;
      }

      const ageDelta = b.age - b.lastPaintAge;
      if (paintsLeft > 0 && ageDelta >= b.repaintEvery) {
        paintWisp(b, b.life * (b.sat ? 0.72 : 0.88));
        paintsLeft--;
      } else if (b.lastPaintAge < 0) {
        paintWisp(b, b.sat ? 0.72 : 0.88);
        b.lastPaintAge = b.age;
      }

      const drawSize = b.patch * (b.sat ? 3.0 : 3.55) * b.scale;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.drawImage(b.tex.c, -drawSize * 0.5, -drawSize * 0.5, drawSize, drawSize);
      ctx.restore();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  return { resize, burst, reset, draw };
}

export default { createFogBurstLayer };
