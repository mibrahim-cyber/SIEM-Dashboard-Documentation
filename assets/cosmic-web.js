/**
 * Cosmic Web — peripheral filament network for the Meridian-7 observation deck.
 *
 * VISUAL DESIGN (encoded here; not a separate doc)
 * ------------------------------------------------
 * The deck’s focal plane is the wormhole, labeled CORE modules, and atmosphere
 * entities. This layer fills the *negative space* around that focal cluster:
 * left/right thirds and top/bottom margins, never the central ~40% viewport
 * where sysRadius-driven orbits live.
 *
 * Metaphor: a purple cosmic web — filaments of dark-matter scaffolding seen in
 * large-scale structure simulations. Nodes are faint junctions (halos); edges
 * are ionised threads (#7c3aed → #fff) with varying thickness and opacity.
 * Slow pulse waves travel along filaments (phase offsets per edge) suggesting
 * data/information flow without competing with the black hole.
 *
 * Palette: #6d28d9 (deep), #7c3aed, #a78bfa, #c4b5fd (mid), #e9d5ff / #fff
 * (highlights). No orange/gold bokeh here — that clutter is reduced in
 * gargantua deckMode backdrop instead.
 *
 * Performance: ≤300 nodes, 2–4 edges each via grid hash; batched strokes;
 * frame skip when quality < 0.6; reduced motion disables pulse only.
 *
 * Layer stack (brain/index.html): bgC stars/nebula → webC (#matrix) this mesh
 * → faint purple aurora waves when quality ≥ 0.72 → accC atmosphere → c main
 * nodes/wormhole → fxC. Rebuild on resize via rebuildCosmicWeb(); exclusion
 * radius tracks sysRadius() * 0.42 so filaments never occlude the CORE cluster.
 *
 * Quality tiers: full mesh + pulse (≥0.62), edge stride 2 (0.55–0.7),
 * fewer target nodes on build (<0.65), skip draw frames (<0.55), clear only (<0.42).
 */
(function (global) {
  'use strict';

  var TAU = Math.PI * 2;
  var PURPLE = ['#6d28d9', '#7c3aed', '#a78bfa', '#c4b5fd'];
  var WHITE = ['#e9d5ff', '#fff', '#f5f3ff'];

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** True if point lies in peripheral bands and outside central exclusion disc. */
  function inPeriphery(x, y, W, H, cx, cy, exR) {
    var dx = x - cx;
    var dy = y - cy;
    if (dx * dx + dy * dy < exR * exR) return false;
    return x < W * 0.32 || x > W * 0.68 || y < H * 0.14 || y > H * 0.86;
  }

  function minDistSq(nodes, x, y, minD) {
    var m = minD * minD;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var dx = n.x - x;
      var dy = n.y - y;
      var d = dx * dx + dy * dy;
      if (d < m) return false;
    }
    return true;
  }

  /**
   * Build static mesh: nodes + edges. Synchronous, modest count.
   * @param {object} opts W, H, cx, cy, excludeRadius, quality, seed
   * @returns {{ nodes: array, edges: array, stats: object }}
   */
  function build(opts) {
    var W = opts.W;
    var H = opts.H;
    var cx = opts.cx != null ? opts.cx : W * 0.5;
    var cy = opts.cy != null ? opts.cy : H * 0.5;
    var exR = opts.excludeRadius != null ? opts.excludeRadius : Math.min(W, H) * 0.38;
    var quality = opts.quality != null ? opts.quality : 1;
    var seed = opts.seed != null ? opts.seed : 7742;
    var rng = mulberry32(seed + 5500);

    var areaFactor = Math.sqrt((W * H) / (1280 * 720));
    var target = Math.min(280, Math.max(140, (180 * areaFactor) | 0));
    if (quality < 0.5) target = (target * 0.5) | 0;
    else if (quality < 0.65) target = (target * 0.72) | 0;
    else if (quality < 0.8) target = (target * 0.88) | 0;

    var minSpacing = Math.max(14, Math.min(W, H) * 0.022);
    var connectDist = Math.min(W, H) * 0.09;
    var cellSize = connectDist * 0.92;
    var nodes = [];
    var attempts = 0;
    var maxAttempts = target * 14;

    while (nodes.length < target && attempts < maxAttempts) {
      attempts++;
      var x = rng() * W;
      var y = rng() * H;
      if (!inPeriphery(x, y, W, H, cx, cy, exR)) continue;
      if (!minDistSq(nodes, x, y, minSpacing)) continue;
      var glow = rng() < 0.22;
      nodes.push({
        x: x,
        y: y,
        r: 0.6 + rng() * (glow ? 2.2 : 1.4),
        hue: PURPLE[(rng() * PURPLE.length) | 0],
        glow: glow,
        pulse: rng() * TAU,
        alpha: 0.25 + rng() * 0.45,
      });
    }

    var grid = new Map();
    function cellKey(gx, gy) { return gx + ',' + gy; }
    function addToGrid(idx, n) {
      var gx = (n.x / cellSize) | 0;
      var gy = (n.y / cellSize) | 0;
      var k = cellKey(gx, gy);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(idx);
    }

    for (var i = 0; i < nodes.length; i++) addToGrid(i, nodes[i]);

    var edges = [];
    var edgeSet = new Set();
    var maxEdges = quality < 0.55 ? 2 : quality < 0.75 ? 3 : 4;
    var maxD2 = connectDist * connectDist;

    for (var ni = 0; ni < nodes.length; ni++) {
      var a = nodes[ni];
      var gx0 = (a.x / cellSize) | 0;
      var gy0 = (a.y / cellSize) | 0;
      var candidates = [];
      for (var ox = -1; ox <= 1; ox++) {
        for (var oy = -1; oy <= 1; oy++) {
          var bucket = grid.get(cellKey(gx0 + ox, gy0 + oy));
          if (!bucket) continue;
          for (var bi = 0; bi < bucket.length; bi++) {
            var j = bucket[bi];
            if (j <= ni) continue;
            var b = nodes[j];
            var dx = b.x - a.x;
            var dy = b.y - a.y;
            var d2 = dx * dx + dy * dy;
            if (d2 > 0 && d2 <= maxD2) candidates.push({ j: j, d2: d2 });
          }
        }
      }
      candidates.sort(function (u, v) { return u.d2 - v.d2; });
      var linked = 0;
      for (var ci = 0; ci < candidates.length && linked < maxEdges; ci++) {
        var c = candidates[ci];
        var lo = ni < c.j ? ni : c.j;
        var hi = ni < c.j ? c.j : ni;
        var key = lo + '-' + hi;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        linked++;
        edges.push({
          a: lo,
          b: hi,
          width: 0.35 + rng() * 1.4,
          alpha: 0.12 + rng() * 0.38,
          white: rng() < 0.38,
          flow: rng() * TAU,
          flowSpd: 0.4 + rng() * 0.9,
        });
      }
    }

    return {
      nodes: nodes,
      edges: edges,
      W: W,
      H: H,
      cx: cx,
      cy: cy,
      excludeRadius: exR,
      stats: { nodes: nodes.length, edges: edges.length },
    };
  }

  /**
   * Draw mesh on webC canvas. Call after clear; may run under faint aurora.
   */
  function draw(ctx, mesh, t, opts) {
    if (!mesh || !mesh.nodes.length) return;
    opts = opts || {};
    var quality = opts.quality != null ? opts.quality : 1;
    var reduced = !!opts.reducedMotion;
    var alert = !!opts.alert;
    var spin = opts.spin != null ? opts.spin : 0.25;

    var nodes = mesh.nodes;
    var edges = mesh.edges;
    var edgeStep = quality < 0.55 ? 2 : 1;
    var pulseOn = !reduced && quality >= 0.48;

    ctx.save();
    ctx.lineCap = 'round';

    for (var ei = 0; ei < edges.length; ei += edgeStep) {
      var e = edges[ei];
      var na = nodes[e.a];
      var nb = nodes[e.b];
      if (!na || !nb) continue;

      var flowPhase = pulseOn ? Math.sin(t * 0.012 * spin * e.flowSpd + e.flow) : 0;
      var alpha = e.alpha * (0.75 + flowPhase * 0.25);
      if (alert) alpha *= 1.08;

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = e.white
        ? (alert ? 'rgba(244,114,182,0.55)' : WHITE[(ei % WHITE.length)])
        : (alert ? '#c084fc' : PURPLE[(ei % PURPLE.length)]);
      ctx.lineWidth = e.width * (quality > 0.7 ? 1 : 0.85);

      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();

      if (pulseOn && quality > 0.62 && (ei % 5) === 0) {
        var mx = na.x + (nb.x - na.x) * (0.5 + 0.35 * Math.sin(t * 0.018 * spin + e.flow));
        var my = na.y + (nb.y - na.y) * (0.5 + 0.35 * Math.cos(t * 0.016 * spin + e.flow * 1.3));
        ctx.globalAlpha = alpha * 0.65;
        ctx.fillStyle = e.white ? '#fff' : '#e9d5ff';
        ctx.beginPath();
        ctx.arc(mx, my, 1.2, 0, TAU);
        ctx.fill();
      }
    }

    var nodeStep = quality < 0.55 ? 2 : 1;
    for (var ni = 0; ni < nodes.length; ni += nodeStep) {
      var n = nodes[ni];
      var np = pulseOn ? 0.5 + 0.5 * Math.sin(t * 0.02 * spin + n.pulse) : 0.7;
      ctx.globalAlpha = n.alpha * np;
      ctx.fillStyle = n.hue;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, TAU);
      ctx.fill();
      if (n.glow && quality > 0.58) {
        ctx.globalAlpha = n.alpha * 0.28 * np;
        ctx.fillStyle = n.hue;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 1.6, 0, TAU);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  global.CosmicWeb = { build: build, draw: draw };
})(typeof window !== 'undefined' ? window : globalThis);
