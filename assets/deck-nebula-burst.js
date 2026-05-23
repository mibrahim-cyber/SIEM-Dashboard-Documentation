/**
 * deck-nebula-burst.js — lightweight screen-space nebula click bursts.
 * Fixed pool (no array growth), GPU-friendly radial gradients, screen blend.
 */
export function createNebulaBurst(canvas) {
  const reduced = typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  const MAX_PUFFS = 8;
  const MAX_STARS = 64;
  const puffs = [];
  const stars = [];
  let W = 0;
  let H = 0;

  function rgba(hex, a) {
    const h = (hex || '#7c3aed').replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function resize(w, h) {
    W = w;
    H = h;
    const dpr = Math.min(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, 1.5);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** @param {number} x screen x @param {number} y screen y @param {{color?:string,label?:string,intensity?:number}} opts */
  function burst(x, y, opts) {
    if (reduced || W === 0) return;
    opts = opts || {};
    const col = opts.color || '#7c3aed';
    const intensity = opts.intensity == null ? 1 : opts.intensity;
    const palette = [col, '#0e7490', '#f472b6', '#38bdf8', '#c4b5fd', '#fbbf24'];
    const base = Math.min(W, H);
    const count = 4;

    while (puffs.length + count > MAX_PUFFS) puffs.shift();

    for (let i = 0; i < count; i++) {
      puffs.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        r: 24 + i * 12,
        maxR: base * (0.22 + i * 0.09) * intensity,
        life: 1,
        delay: i * 0.06,
        col: palette[i % palette.length],
        label: i === 0 ? (opts.label || '') : '',
        labelT: 1,
      });
    }

    const starN = Math.min(28, MAX_STARS - stars.length);
    for (let i = 0; i < starN; i++) {
      if (stars.length >= MAX_STARS) stars.shift();
      const a = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 5;
      stars.push({
        x: x,
        y: y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 0.6 + Math.random() * 0.35,
        rad: 0.8 + Math.random() * 2,
        col: Math.random() < 0.5 ? '#ffffff' : col,
      });
    }
  }

  function draw() {
    if (W === 0) return;
    ctx.clearRect(0, 0, W, H);
    if (!puffs.length && !stars.length) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      p.delay -= 0.016;
      if (p.delay > 0) continue;
      p.life -= 0.013;
      p.r += (p.maxR - p.r) * 0.07;
      if (p.life <= 0) {
        puffs.splice(i, 1);
        i--;
        continue;
      }
      const a = p.life;
      const g = ctx.createRadialGradient(p.x, p.y, p.r * 0.04, p.x, p.y, p.r);
      g.addColorStop(0, rgba(p.col, a * 0.42));
      g.addColorStop(0.35, rgba(p.col, a * 0.18));
      g.addColorStop(0.65, rgba(p.col, a * 0.05));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      if (p.label && p.labelT > 0) {
        p.labelT -= 0.016;
        ctx.globalAlpha = Math.min(1, p.labelT);
        ctx.fillStyle = '#e9d5ff';
        ctx.font = '600 10px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(p.label).toUpperCase(), p.x, p.y - 8);
        ctx.globalAlpha = 1;
      }
    }

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.life -= 0.022;
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.94;
      s.vy *= 0.94;
      if (s.life <= 0) {
        stars.splice(i, 1);
        i--;
        continue;
      }
      ctx.globalAlpha = s.life * 0.85;
      ctx.fillStyle = s.col;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.rad, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  return { resize, burst, draw };
}

export default { createNebulaBurst };
