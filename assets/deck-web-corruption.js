/**
 * deck-web-corruption.js — click web corruption (stable per-edge draw, no ambient dup).
 */
export function createWebCorruption(canvas) {
  const reduced = typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  const TAU = Math.PI * 2;
  const PURPLE = ['#6d28d9', '#7c3aed', '#a78bfa', '#c4b5fd'];
  const WHITE = ['#e9d5ff', '#fff', '#f5f3ff'];
  const MAX_NODES = 100;
  const MAX_EDGES = 160;
  const MAX_CLUSTERS = 5;
  const CLICK_COOLDOWN_MS = 520;
  let lastCorruptAt = 0;

  let W = 0;
  let H = 0;
  let corruption = 0;
  let clickCount = 0;
  let frameT = 0;
  const nodes = [];
  const edges = [];
  const clusters = [];

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
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

  function removeCluster(cluster) {
    for (let i = edges.length - 1; i >= 0; i--) {
      const e = edges[i];
      if (cluster.edgeSet.has(e) || cluster.nodeSet.has(e.na) || cluster.nodeSet.has(e.nb)) {
        edges.splice(i, 1);
      }
    }
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (cluster.nodeSet.has(nodes[i])) nodes.splice(i, 1);
    }
  }

  function trimPool() {
    while (clusters.length > MAX_CLUSTERS) removeCluster(clusters.shift());
    while (nodes.length > MAX_NODES && clusters.length > 0) removeCluster(clusters.shift());
    while (edges.length > MAX_EDGES && clusters.length > 0) removeCluster(clusters.shift());
  }

  function addNode(x, y, rng, opts) {
    opts = opts || {};
    const n = {
      x, y,
      r: 0.5 + rng() * (opts.glow ? 1.6 : 1),
      hue: opts.hue || PURPLE[(rng() * PURPLE.length) | 0],
      alpha: 0.35 + rng() * 0.35,
      glow: !!opts.glow,
      pulse: rng() * TAU,
    };
    nodes.push(n);
    return n;
  }

  function addEdge(na, nb, rng, opts) {
    if (!na || !nb || na === nb) return null;
    const e = {
      na, nb,
      width: (opts && opts.width) || (0.4 + rng() * 1),
      alpha: (opts && opts.alpha) || (0.18 + rng() * 0.28),
      white: (opts && opts.white != null) ? opts.white : rng() < 0.34,
      flow: rng() * TAU,
      flowSpd: 0.35 + rng() * 0.6,
    };
    edges.push(e);
    return e;
  }

  function spawnCluster(x, y, opts) {
    opts = opts || {};
    const seed = ((x * 7919 + y * 2654435761) ^ (clickCount * 9973)) | 0;
    const rng = mulberry32(seed);
    const baseHue = opts.color || PURPLE[(rng() * PURPLE.length) | 0];
    const branchN = 3 + ((rng() * 2) | 0);
    const reach = Math.min(W, H) * (0.045 + corruption * 0.1 + rng() * 0.05);
    const cluster = { nodeSet: new Set(), edgeSet: new Set() };

    const root = addNode(x, y, rng, { glow: true, hue: baseHue });
    cluster.nodeSet.add(root);
    const tips = [root];

    for (let b = 0; b < branchN; b++) {
      const ang = rng() * TAU + b * (TAU / branchN) * 0.85;
      const segs = 2 + ((rng() * 2) | 0);
      let prev = root;
      let px = x;
      let py = y;
      for (let s = 0; s < segs; s++) {
        const segLen = reach * (0.32 + rng() * 0.3) / segs;
        const wobble = (rng() - 0.5) * 0.45;
        px += Math.cos(ang + wobble * (s + 1)) * segLen;
        py += Math.sin(ang + wobble * (s + 1)) * segLen;
        px = Math.max(4, Math.min(W - 4, px));
        py = Math.max(4, Math.min(H - 4, py));
        const nd = addNode(px, py, rng, {
          hue: rng() < 0.38 ? WHITE[(rng() * WHITE.length) | 0] : baseHue,
        });
        cluster.nodeSet.add(nd);
        const ed = addEdge(prev, nd, rng);
        if (ed) cluster.edgeSet.add(ed);
        prev = nd;
        if (s === segs - 1) tips.push(nd);
      }
    }

    for (let i = 1; i < tips.length; i++) {
      if (rng() < 0.38 + corruption * 0.15) {
        const ed = addEdge(tips[0], tips[i], rng);
        if (ed) cluster.edgeSet.add(ed);
      }
    }

    clusters.push(cluster);
    trimPool();
  }

  function corrupt(x, y, opts) {
    if (reduced || W === 0) return;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - lastCorruptAt < CLICK_COOLDOWN_MS) return;
    lastCorruptAt = now;
    opts = opts || {};
    clickCount++;
    corruption = Math.min(1, corruption + 0.022 + (opts.intensity == null ? 0.018 : opts.intensity * 0.022));
    spawnCluster(x, y, opts);
  }

  function reset() {
    corruption = 0;
    clickCount = 0;
    nodes.length = 0;
    edges.length = 0;
    clusters.length = 0;
  }

  function drawEdge(e, pulseOn, mul) {
    const na = e.na;
    const nb = e.nb;
    if (!na || !nb) return;
    const flowPhase = pulseOn ? Math.sin(frameT * 0.012 * e.flowSpd + e.flow) : 0;
    const alpha = e.alpha * (0.72 + flowPhase * 0.28) * mul;
    if (alpha < 0.03) return;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = e.white ? '#e9d5ff' : '#7c3aed';
    ctx.lineWidth = e.width * (0.85 + corruption * 0.25);
    ctx.beginPath();
    ctx.moveTo(na.x, na.y);
    ctx.lineTo(nb.x, nb.y);
    ctx.stroke();
  }

  function draw(quality) {
    if (W === 0) return;
    frameT++;
    if (frameT % 24 === 0 && corruption > 0.02) {
      corruption = Math.max(0, corruption - 0.012);
      if (corruption < 0.04 && clusters.length > 2) removeCluster(clusters.shift());
    }
    ctx.clearRect(0, 0, W, H);
    if (!nodes.length && corruption < 0.02) return;

    quality = quality == null ? 1 : quality;
    if (quality < 0.48) return;
    const pulseOn = !reduced;
    const mul = 0.5 + corruption * 0.5;
    const edgeStep = edges.length > 400 ? 2 : 1;
    const nodeStep = nodes.length > 320 ? 2 : 1;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.lineCap = 'round';

    if (corruption > 0.7) {
      ctx.globalAlpha = ((corruption - 0.7) / 0.3) * 0.08;
      ctx.fillStyle = 'rgba(124,58,237,0.4)';
      ctx.fillRect(0, 0, W, H);
    }

    for (let i = 0; i < edges.length; i += edgeStep) drawEdge(edges[i], pulseOn, mul);

    for (let i = 0; i < nodes.length; i += nodeStep) {
      const n = nodes[i];
      const np = pulseOn ? 0.6 + 0.4 * Math.sin(frameT * 0.018 + n.pulse) : 0.75;
      ctx.globalAlpha = n.alpha * np * mul;
      ctx.fillStyle = n.hue;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (1 + corruption * 0.1), 0, TAU);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function getCorruption() { return corruption; }
  function getClickCount() { return clickCount; }

  return { resize, corrupt, reset, draw, getCorruption, getClickCount };
}

export default { createWebCorruption };
