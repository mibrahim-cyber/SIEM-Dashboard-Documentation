/**
 * wormhole-portal.js  v9.0.0 — HABIBI-SIEM COSMOS ENGINE
 * ─────────────────────────────────────────────────────────────
 * Drop-in upgrade. Same public API:
 *
 *   drawGargantua(ctx, cx, cy, r, time, {
 *     reducedMotion, quality, heat, spinMul,
 *     bootT, showLabel, width, height,
 *     threatLevel,          // NEW  0-1, drives aurora + state
 *     alertCount,           // NEW  int, drives disc intensity
 *   })
 *
 * Extra methods:
 *   drawGargantua.criticalAlert(cx, cy)   — supernova burst
 *   drawGargantua.watchlistIp(cx, cy)     — consume burst
 *   drawGargantua.setMouse(x, y)          — parallax tracking
 *   drawGargantua.setNodes(nodeArray)     — feed live SIEM nodes
 *
 * No external dependencies. Canvas 2D only. ~60fps on M2.
 */

;(function (global) {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 1 — CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════
  const CFG = {
    // Black hole geometry (all as factor of r param)
    horizonR:         0.28,
    discInner:        0.35,
    discOuter:        0.95,
    discTilt:         20,          // degrees
    lensingR:         0.56,

    // Accretion disc
    discRings:        64,
    discSegments:     120,
    dopplerStrength:  0.88,
    brightMult:       3.4,
    dimMult:          0.22,
    diskScrollPeriod: 8.0,         // seconds for one full scroll
    hotSpotCount:     5,

    // Photon ring
    photonPulsePeriod:3.0,

    // Polar jets
    jetLength:        0.85,        // factor of r

    // Stars
    starCount:        1400,

    // Nodes
    parallaxStar:     0.018,
    parallaxNode:     0.006,

    // Particles
    maxParticles:     4000,

    // Rivers
    riverControlPull: 0.28,        // bezier perpendicular pull

    // Performance tuning
    nebulaDiv:        4,           // render nebula at 1/4 res
    nebulaRegen:      600,         // frames between nebula regens
    bgUpdateDiv:      3,           // tier-2 every N frames
  };

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 2 — MATH & COLOR UTILITIES
  // ═══════════════════════════════════════════════════════════════════
  const TAU = Math.PI * 2;

  // Fast lookup tables
  const SIN_LUT = new Float32Array(1024);
  const COS_LUT = new Float32Array(1024);
  for (let i = 0; i < 1024; i++) {
    SIN_LUT[i] = Math.sin((i / 1024) * TAU);
    COS_LUT[i] = Math.cos((i / 1024) * TAU);
  }
  function fsin(a) { return SIN_LUT[((((a / TAU) * 1024) | 0) % 1024 + 1024) % 1024]; }
  function fcos(a) { return COS_LUT[((((a / TAU) * 1024) | 0) % 1024 + 1024) % 1024]; }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function lerp(a, b, t)    { return a + (b - a) * t; }
  function rand(lo, hi)     { return lo + Math.random() * (hi - lo); }
  function randInt(lo, hi)  { return (lo + Math.random() * (hi - lo + 1)) | 0; }
  function dist2(ax,ay,bx,by){ const dx=ax-bx,dy=ay-by; return Math.sqrt(dx*dx+dy*dy); }

  // Hash noise
  function hash21(x, y) {
    let h = ((x * 374761393) ^ (y * 668265263)) | 0;
    h ^= (h >> 13); h = Math.imul(h, 1274126177);
    return ((h ^ (h >> 16)) >>> 0) / 4294967296;
  }
  function noise2(x, y) {
    const xi = x | 0, yi = y | 0;
    const fx = x - xi, fy = y - yi;
    const ux = fx*fx*(3-2*fx), uy = fy*fy*(3-2*fy);
    return lerp(
      lerp(hash21(xi,yi),   hash21(xi+1,yi),   ux),
      lerp(hash21(xi,yi+1), hash21(xi+1,yi+1), ux), uy);
  }
  function fbm(x, y, octs) {
    let v=0, a=0.5, f=1;
    for (let i=0; i<octs; i++) { v+=noise2(x*f,y*f)*a; a*=0.5; f*=2.1; }
    return v;
  }

  // Plasma temperature → RGB  (0=cool/red .. 1=hot/blue-white)
  function tempToRgb(t) {
    if (t < 0.33) return [255, lerp(30,120,t/0.33)|0,   lerp(0,15,t/0.33)|0];
    if (t < 0.66) { const u=(t-0.33)/0.33; return [255, lerp(120,235,u)|0, lerp(15,160,u)|0]; }
    const u=(t-0.66)/0.34; return [lerp(255,200,u)|0, lerp(235,240,u)|0, lerp(160,255,u)|0];
  }

  // hex '#rrggbb' → 'rgba(r,g,b,a)'
  function hexRgba(hex, a) {
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
  }

  function spectralColor() {
    const v = Math.random();
    if (v < 0.60) return '#b8d0ff';
    if (v < 0.82) return '#ffeedd';
    if (v < 0.94) return '#ffaa55';
    return '#ff6535';
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 3 — MODULE STATE
  // ═══════════════════════════════════════════════════════════════════
  const S = {
    init:      false,
    W: 0, H: 0,
    frame:     0,
    lastT:     -1,

    // Stars
    stars:     [],

    // Orbital nodes (SIEM components + threats)
    nodes:     [],

    // Particle pool
    pool:      [],

    // Hot spots on disc
    spots:     [],

    // Data rivers
    rivers:    [],

    // Celestial bodies
    celestials:[],

    // Cosmic web
    cosmicWeb: [],

    // Offscreen nebula canvas
    nebCtx:    null,
    nebCanvas: null,

    // Mouse
    mx: 0, my: 0,

    // Threat level (0-1, smoothed)
    threat:    0,

    // Boot animation progress
    bootProgress: 0,
  };

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 4 — NODE DEFINITIONS
  // ═══════════════════════════════════════════════════════════════════
  const INFRA_COLOR  = '#00d4ff';
  const THREAT_CRIT  = '#ff2d55';
  const THREAT_HIGH  = '#ff6f00';
  const THREAT_MED   = '#ffaa00';
  const SOAR_COLOR   = '#30d158';

  // orbitR = fraction of r  |  period = orbit period in seconds
  const DEFAULT_NODES = [
    { label:'SiemContext',     type:'infra',  r:20, orbitR:0.18, period:14,  phase:0.0,  ecc:0.04, color:INFRA_COLOR  },
    { label:'DetectionEngine', type:'infra',  r:18, orbitR:0.22, period:18,  phase:1.4,  ecc:0.05, color:'#00c4ef'   },
    { label:'AlertManager',    type:'infra',  r:16, orbitR:0.26, period:22,  phase:2.5,  ecc:0.06, color:'#009fde'   },
    { label:'AuthContext',     type:'infra',  r:14, orbitR:0.20, period:16,  phase:3.8,  ecc:0.03, color:'#0088cc'   },
    { label:'SoarConsole',     type:'infra',  r:15, orbitR:0.30, period:25,  phase:4.9,  ecc:0.04, color:SOAR_COLOR  },
    { label:'GeoMap',          type:'infra',  r:13, orbitR:0.24, period:20,  phase:0.7,  ecc:0.05, color:'#00beaa'   },
    { label:'Dashboard',       type:'infra',  r:16, orbitR:0.28, period:23,  phase:5.5,  ecc:0.03, color:'#0099dd'   },
    { label:'Correlation',     type:'infra',  r:13, orbitR:0.35, period:29,  phase:2.2,  ecc:0.06, color:'#00c7be'   },
    { label:'RBAC',            type:'infra',  r:12, orbitR:0.32, period:27,  phase:1.0,  ecc:0.05, color:SOAR_COLOR  },
    { label:'SQL Injection',   type:'threat', r:14, orbitR:0.38, period:11,  phase:1.7,  ecc:0.30, color:THREAT_CRIT, sev:'critical' },
    { label:'Brute Force',     type:'threat', r:12, orbitR:0.43, period:13,  phase:5.1,  ecc:0.26, color:THREAT_HIGH, sev:'high'     },
    { label:'CSRF',            type:'threat', r:10, orbitR:0.41, period:15,  phase:2.9,  ecc:0.20, color:THREAT_MED,  sev:'medium'   },
    { label:'XSS Attempt',     type:'threat', r:11, orbitR:0.47, period:17,  phase:4.0,  ecc:0.35, color:THREAT_CRIT, sev:'high'     },
    { label:'Pentest RBAC',    type:'threat', r: 9, orbitR:0.45, period:19,  phase:0.5,  ecc:0.15, color:THREAT_MED,  sev:'medium'   },
    { label:'Pentest CSRF',    type:'threat', r:10, orbitR:0.52, period:16,  phase:3.3,  ecc:0.28, color:THREAT_HIGH, sev:'high'     },
    { label:'Alert Map',       type:'infra',  r:11, orbitR:0.48, period:33,  phase:4.3,  ecc:0.07, color:INFRA_COLOR  },
  ];

  // River definitions: [fromIdx, toIdx, color, rate(trains/sec)]
  const RIVER_DEFS = [
    [0, 1, 'rgba(0,212,255,0.75)',   1.8],
    [1, 2, 'rgba(255,149,0,0.82)',   2.2],
    [2, 4, 'rgba(48,209,88,0.78)',   1.1],
    [3, 0, 'rgba(0,180,255,0.60)',   0.9],
    [5, 0, 'rgba(50,200,80,0.62)',   0.7],
    [8, 0, 'rgba(0,212,255,0.45)',   0.5],
    [7, 1, 'rgba(0,199,190,0.55)',   0.6],
  ];

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 5 — INITIALISATION
  // ═══════════════════════════════════════════════════════════════════
  function initialize(ctx, cx, cy, r, W, H, deck) {
    S.W = W; S.H = H;
    S.init = true;
    S.deck = !!deck;
    S.bootProgress = deck ? 1 : 0;

    // Particle pool
    S.pool = Array.from({ length: CFG.maxParticles }, () => ({
      alive:false, x:0, y:0, vx:0, vy:0,
      life:0, maxLife:1, rad:1, col:'#fff',
      drag:0.97, gravity:0,
    }));

    // Hot spots
    S.spots = Array.from({ length: CFG.hotSpotCount }, () => ({
      angle:    rand(0, TAU),
      radial:   rand(0.15, 0.72),
      intensity:rand(0.7, 1.3),
      life:     rand(0, 6),
      maxLife:  rand(5, 14),
    }));

    if (deck) {
      S.stars = [];
      S.nodes = [];
      S.rivers = [];
      S.celestials = [];
      S.cosmicWeb = [];
      S.nebCanvas = null;
      S.nebCtx = null;
      return;
    }

    // Stars
    S.stars = [];
    for (let i = 0; i < CFG.starCount; i++) {
      const a   = rand(0, TAU);
      const d   = rand(r * 0.9, Math.max(W, H) * 0.72);
      S.stars.push({
        bx: cx + Math.cos(a) * d,  // base (un-lensed) position
        by: cy + Math.sin(a) * d,
        x: 0, y: 0,                // rendered position (updated each frame)
        rad:   rand(0.3, 1.5),
        bri:   rand(0.25, 1.0),
        freq:  rand(0.4, 3.2),
        phase: rand(0, TAU),
        col:   spectralColor(),
      });
    }

    // Orbital nodes
    S.nodes = DEFAULT_NODES.map(d => ({
      ...d,
      x: cx, y: cy,
      displayR: d.r,
      breathPhase: rand(0, TAU),
      breathFreq:  rand(0.25, 0.65),
      glowPhase:   rand(0, TAU),
      activeFade:  0,
    }));

    // Rivers
    S.rivers = RIVER_DEFS.map(([from, to, col, rate]) => ({
      from, to, col, rate,
      trains: [],
      timer: rand(0, 1 / rate),
    }));

    // Nebula offscreen
    S.nebCanvas = document.createElement('canvas');
    S.nebCanvas.width  = Math.ceil(W / CFG.nebulaDiv);
    S.nebCanvas.height = Math.ceil(H / CFG.nebulaDiv);
    S.nebCtx = S.nebCanvas.getContext('2d');
    regenNebula(W, H);

    // Celestial bodies
    initCelestials(cx, cy, r, W, H);

    // Cosmic web
    initCosmicWeb(W, H);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 6 — NEBULA
  // ═══════════════════════════════════════════════════════════════════
  function regenNebula(W, H) {
    const ctx = S.nebCtx;
    const nw = S.nebCanvas.width, nh = S.nebCanvas.height;
    ctx.clearRect(0, 0, nw, nh);

    const NEBULAE = [
      { x:.10, y:.14, rx:.38, ry:.28, col:[18,8,55] },
      { x:.80, y:.12, rx:.28, ry:.22, col:[40,14,0] },
      { x:.82, y:.80, rx:.26, ry:.32, col:[0,28,18] },
      { x:.12, y:.80, rx:.30, ry:.26, col:[48,0,18] },
      { x:.50, y:.50, rx:.20, ry:.15, col:[5,10,30] },
    ];
    NEBULAE.forEach(({ x, y, rx, ry, col }) => {
      const gx = x * nw, gy = y * nh;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(rx*nw, ry*nh));
      g.addColorStop(0,   `rgba(${col[0]},${col[1]},${col[2]},0.14)`);
      g.addColorStop(0.5, `rgba(${col[0]},${col[1]},${col[2]},0.05)`);
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(gx, gy, rx * nw, ry * nh, 0, 0, TAU);
      ctx.fill();
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 7 — CELESTIAL BODIES
  // ═══════════════════════════════════════════════════════════════════
  function initCelestials(cx, cy, r, W, H) {
    S.celestials = [];
    const margin = r * 1.25;
    const maxD   = Math.min(W, H) * 0.48;

    // Asteroids
    for (let i = 0; i < 14; i++) {
      const a = rand(0, TAU), d = rand(margin, maxD);
      S.celestials.push({
        kind:'asteroid',
        ox:cx+Math.cos(a)*d, oy:cy+Math.sin(a)*d,
        orbitA:a, orbitD:d,
        orbitSpd: rand(0.008, 0.035) * (Math.random()<0.5?1:-1),
        sz:  rand(5, 16),
        rotSpd: rand(0.05, 0.2),
        rotOff: rand(0, TAU),
        bri:  rand(0.2, 0.45),
        verts: makeAsteroid(),
      });
    }

    // Planets
    for (let i = 0; i < 3; i++) {
      const a = rand(0, TAU), d = rand(margin * 1.1, maxD);
      S.celestials.push({
        kind:'planet',
        orbitA:a, orbitD:d,
        orbitSpd: rand(0.002, 0.007) * (Math.random()<0.5?1:-1),
        sz:   rand(22, 46),
        hue:  rand(0, 360),
        bandOff: rand(0, TAU),
        phase: rand(0, TAU),
        x:0, y:0,
      });
    }

    // Outer constellation anchor points
    for (let i = 0; i < 10; i++) {
      const a = rand(0, TAU), d = rand(margin * 1.3, maxD);
      S.celestials.push({
        kind:'constPt',
        x: cx+Math.cos(a)*d, y: cy+Math.sin(a)*d,
        phase: rand(0, TAU),
      });
    }
  }

  function makeAsteroid() {
    const n = randInt(7, 12), v = [];
    for (let i = 0; i < n; i++) {
      const a = (i/n)*TAU, rr = 0.6 + Math.random() * 0.7;
      v.push([Math.cos(a)*rr, Math.sin(a)*rr]);
    }
    return v;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 8 — COSMIC WEB
  // ═══════════════════════════════════════════════════════════════════
  function initCosmicWeb(W, H) {
    S.cosmicWeb = [];
    const N = 22, maxEdge = Math.max(W,H) * 0.34;
    for (let i = 0; i < N; i++) {
      S.cosmicWeb.push({ x: rand(0,W), y: rand(0,H), nb:[] });
    }
    for (let i = 0; i < N; i++) {
      for (let j = i+1; j < N; j++) {
        const d = dist2(S.cosmicWeb[i].x, S.cosmicWeb[i].y, S.cosmicWeb[j].x, S.cosmicWeb[j].y);
        if (d < maxEdge) { S.cosmicWeb[i].nb.push(j); }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 9 — PARTICLE SYSTEM
  // ═══════════════════════════════════════════════════════════════════
  function spawnParticle({ x, y, vx=0, vy=0, life=1, rad=2, col='#fff', drag=0.96, gravity=0 }) {
    for (let i = 0; i < S.pool.length; i++) {
      if (!S.pool[i].alive) {
        Object.assign(S.pool[i], { alive:true, x, y, vx, vy,
          life:1, maxLife:life, rad, col, drag, gravity });
        return;
      }
    }
  }

  function burst(x, y, count, col, speed, life, drag=0.96, rad=2.5, gravity=0) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU), s = rand(speed*0.4, speed);
      spawnParticle({ x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life, rad, col, drag, gravity });
    }
  }

  function updateParticles(dt, cx, cy) {
    for (let i = 0; i < S.pool.length; i++) {
      const p = S.pool[i];
      if (!p.alive) continue;
      p.vx *= p.drag; p.vy *= p.drag;
      if (p.gravity) {
        const dx=cx-p.x, dy=cy-p.y, d=Math.sqrt(dx*dx+dy*dy)||1;
        p.vx += dx/d * p.gravity * dt;
        p.vy += dy/d * p.gravity * dt;
      }
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= dt / p.maxLife;
      if (p.life <= 0) p.alive = false;
    }
  }

  function drawParticles(ctx) {
    for (let i = 0; i < S.pool.length; i++) {
      const p = S.pool[i];
      if (!p.alive) continue;
      const a = p.life * p.life;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.3, p.rad * (0.4 + 0.6*p.life)), 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 10 — HOT SPOTS UPDATE
  // ═══════════════════════════════════════════════════════════════════
  function updateSpots(dt) {
    S.spots.forEach(s => {
      s.life += dt;
      if (s.life >= s.maxLife) {
        s.angle    = rand(0, TAU);
        s.radial   = rand(0.12, 0.75);
        s.intensity= rand(0.6, 1.4);
        s.life     = 0;
        s.maxLife  = rand(5, 15);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 11 — DRAWING: VOID + NEBULA + COSMIC WEB + STARS
  // ═══════════════════════════════════════════════════════════════════
  function drawVoid(ctx, W, H) {
    ctx.fillStyle = '#000308';
    ctx.fillRect(0, 0, W, H);
  }

  function drawNebula(ctx, W, H) {
    if (!S.nebCanvas) return;
    ctx.globalAlpha = 0.98;
    ctx.drawImage(S.nebCanvas, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  function drawCosmicWeb(ctx, t) {
    ctx.save();
    ctx.globalAlpha = 0.035;
    ctx.strokeStyle = '#7080b0';
    ctx.lineWidth   = 0.5;
    S.cosmicWeb.forEach((n, i) => {
      n.nb.forEach(j => {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(S.cosmicWeb[j].x, S.cosmicWeb[j].y);
        ctx.stroke();
      });
    });
    ctx.restore();
  }

  function drawStars(ctx, cx, cy, r, t) {
    const horizR = r * CFG.horizonR;
    const lensR  = r * CFG.lensingR;
    ctx.save();
    S.stars.forEach(s => {
      // Gravitational lensing
      const dx = s.bx - cx, dy = s.by - cy;
      const d  = Math.sqrt(dx*dx + dy*dy) || 1;
      let disp = 0;
      if (d < lensR * 2.2) {
        disp = (horizR * horizR) / Math.max(d, horizR * 1.05);
        disp *= Math.max(0, 1 - d / (lensR * 2.2));
      }
      s.x = s.bx + (dx/d) * disp + (S.mx - S.W*0.5) * CFG.parallaxStar;
      s.y = s.by + (dy/d) * disp + (S.my - S.H*0.5) * CFG.parallaxStar;

      const tw = 0.65 + 0.35 * fsin(t * s.freq + s.phase);
      ctx.globalAlpha = s.bri * tw * 0.9;
      ctx.fillStyle   = s.col;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.rad, 0, TAU);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 12 — DRAWING: CELESTIAL BODIES
  // ═══════════════════════════════════════════════════════════════════
  function updateCelestials(cx, cy, dt) {
    S.celestials.forEach(c => {
      if (c.orbitSpd !== undefined) {
        c.orbitA += c.orbitSpd * dt;
        c.x = cx + Math.cos(c.orbitA) * c.orbitD;
        c.y = cy + Math.sin(c.orbitA) * c.orbitD;
      }
    });
  }

  function drawCelestials(ctx, cx, cy, r, t) {
    ctx.save();
    const constPts = S.celestials.filter(c => c.kind === 'constPt');

    // Outer constellation lines first
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth   = 0.5;
    ctx.setLineDash([4, 9]);
    for (let i = 0; i < constPts.length - 1; i++) {
      const a = constPts[i], b = constPts[i+1];
      const d = dist2(a.x, a.y, b.x, b.y);
      if (d < r * 0.9) {
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    S.celestials.forEach(c => {
      if (c.kind === 'constPt') {
        ctx.globalAlpha = 0.2 + 0.1 * fsin(t * 0.5 + c.phase);
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath(); ctx.arc(c.x, c.y, 3, 0, TAU); ctx.fill();
      }

      if (c.kind === 'asteroid') {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(t * c.rotSpd + c.rotOff);
        ctx.globalAlpha = c.bri;
        ctx.fillStyle   = '#22180e';
        ctx.strokeStyle = 'rgba(110,95,70,0.55)';
        ctx.lineWidth   = 0.8;
        ctx.beginPath();
        c.verts.forEach(([vx,vy], i) => {
          i === 0 ? ctx.moveTo(vx*c.sz, vy*c.sz) : ctx.lineTo(vx*c.sz, vy*c.sz);
        });
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      }

      if (c.kind === 'planet') {
        ctx.save();
        ctx.globalAlpha = 0.52;
        // Body
        const g = ctx.createRadialGradient(
          c.x-c.sz*0.28, c.y-c.sz*0.28, 0, c.x, c.y, c.sz);
        g.addColorStop(0, `hsl(${c.hue},42%,34%)`);
        g.addColorStop(0.6, `hsl(${c.hue},30%,16%)`);
        g.addColorStop(1, `hsl(${c.hue},18%,6%)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(c.x, c.y, c.sz, 0, TAU); ctx.fill();
        // Bands
        ctx.globalAlpha = 0.12;
        ctx.save();
        ctx.beginPath(); ctx.arc(c.x, c.y, c.sz, 0, TAU); ctx.clip();
        for (let b = 0; b < 5; b++) {
          const by = c.y - c.sz + (b/4)*c.sz*2;
          ctx.fillStyle = `hsl(${c.hue+b*18},55%,${28+b*4}%)`;
          ctx.fillRect(c.x-c.sz, by, c.sz*2, c.sz*0.18);
        }
        ctx.restore();
        // Highlight
        ctx.globalAlpha = 0.18;
        const hl = ctx.createRadialGradient(c.x-c.sz*0.3,c.y-c.sz*0.3,0,c.x,c.y,c.sz);
        hl.addColorStop(0, 'rgba(255,255,255,0.4)');
        hl.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hl;
        ctx.beginPath(); ctx.arc(c.x, c.y, c.sz, 0, TAU); ctx.fill();
        ctx.restore();
      }
    });

    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 13 — DRAWING: ACCRETION DISC
  // ═══════════════════════════════════════════════════════════════════
  function drawDisc(ctx, cx, cy, r, t, heat, spinMul, threat) {
    const inner = r * CFG.discInner;
    const outer = r * CFG.discOuter;
    const tilt  = CFG.discTilt * Math.PI / 180;
    const scaleY = Math.cos(tilt);
    const scroll  = t * spinMul / CFG.diskScrollPeriod;
    const RINGS   = CFG.discRings;
    const SEGS    = CFG.discSegments;
    const segA    = TAU / SEGS;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, scaleY);

    // Back half first (π → 2π, i.e. lower half in tilted view)
    for (let pass = 0; pass < 2; pass++) {
      const aStart = pass === 0 ? Math.PI : 0;
      const aEnd   = pass === 0 ? TAU     : Math.PI;

      for (let ri = RINGS; ri >= 0; ri--) {
        const tRing  = ri / RINGS;           // 0=inner, 1=outer
        const rInner = inner + (outer - inner) * tRing;
        const rOuter = rInner + (outer - inner) / RINGS;
        const temp   = clamp(1 - Math.pow(tRing, 0.55) + heat * 0.25, 0, 1);
        const [tr, tg, tb] = tempToRgb(temp);

        // Noise along ring
        const nSample = fbm(tRing * 5.5 + scroll, ri * 0.4, 3);
        const baseBri = (0.45 + nSample * 0.55) * (1 - tRing * tRing) * 1.9;

        for (let si = 0; si < SEGS; si++) {
          const a  = aStart + (si / SEGS) * (aEnd - aStart);
          const a2 = a + segA;
          if (a < aStart || a2 > aEnd + 0.01) continue;
          const aMid = a + segA * 0.5;

          // Doppler: cos(π) = approaching left = bright
          const dcos = -Math.cos(aMid);
          const dMul = dcos > 0
            ? lerp(1, CFG.brightMult * (1 + threat * 0.5), dcos * CFG.dopplerStrength)
            : lerp(1, CFG.dimMult,  -dcos * CFG.dopplerStrength);

          const bright = clamp(baseBri * dMul, 0, 5);
          const alpha  = clamp(bright * 0.65, 0, 1);

          let rr = clamp(tr + (dcos > 0.3 ? 25 : 0), 0, 255);
          let bb = clamp(tb + (dcos > 0.3 ? 20 : -15), 0, 255);

          ctx.fillStyle = `rgba(${rr|0},${tg|0},${bb|0},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(0, 0, rOuter, a, a2);
          ctx.arc(0, 0, rInner, a2, a, true);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Hot spots
    S.spots.forEach((hs, idx) => {
      const hsA = hs.angle + t * (0.38 + idx * 0.065) * spinMul;
      const hsR = inner + (outer - inner) * hs.radial;
      const hx  = Math.cos(hsA) * hsR, hy = Math.sin(hsA) * hsR;
      const lifeT = Math.min(1, hs.life/0.6) * Math.min(1, (1-hs.life/hs.maxLife)*5);
      const ints  = hs.intensity * lifeT;
      const gR    = hsR * 0.19;

      const hg = ctx.createRadialGradient(hx,hy,0, hx,hy,gR);
      hg.addColorStop(0, `rgba(255,248,220,${ints * 0.92})`);
      hg.addColorStop(0.4, `rgba(255,140,40,${ints * 0.4})`);
      hg.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(hx, hy, gR, 0, TAU); ctx.fill();
    });

    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 14 — DRAWING: EVENT HORIZON
  // ═══════════════════════════════════════════════════════════════════
  function drawHorizon(ctx, cx, cy, r, t, threat) {
    const hR = r * CFG.horizonR;
    const pulse = 0.68 + 0.32 * fsin(t * TAU / CFG.photonPulsePeriod);

    // Deep ambient glow
    const agR = hR * 2.6;
    const ag = ctx.createRadialGradient(cx, cy, hR * 0.7, cx, cy, agR);
    ag.addColorStop(0,   `rgba(255,70,0,${0.05 + threat*0.04})`);
    ag.addColorStop(0.5, `rgba(255,40,0,0.02)`);
    ag.addColorStop(1,   'rgba(255,0,0,0)');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy, agR, 0, TAU); ctx.fill();

    // Photon ring outer glow
    const pgR = hR * 1.12;
    const pg  = ctx.createRadialGradient(cx, cy, hR*0.88, cx, cy, pgR);
    pg.addColorStop(0,   'rgba(255,245,215,0)');
    pg.addColorStop(0.35, `rgba(255,245,215,${0.82*pulse})`);
    pg.addColorStop(0.65, `rgba(255,255,255,${0.55*pulse})`);
    pg.addColorStop(1,   'rgba(255,200,140,0)');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(cx, cy, pgR, 0, TAU);
    ctx.arc(cx, cy, hR*0.88, 0, TAU, true);
    ctx.fill();

    // Absolute black disc
    ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.arc(cx, cy, hR * 0.97, 0, TAU); ctx.fill();

    // Photon ring inner crisp band
    const pg2 = ctx.createRadialGradient(cx, cy, hR*0.90, cx, cy, hR*0.97);
    pg2.addColorStop(0,   'rgba(255,240,200,0)');
    pg2.addColorStop(0.5, `rgba(255,240,200,${0.7*pulse})`);
    pg2.addColorStop(1,   'rgba(255,240,200,0)');
    ctx.fillStyle = pg2;
    ctx.beginPath();
    ctx.arc(cx, cy, hR*0.97, 0, TAU);
    ctx.arc(cx, cy, hR*0.90, 0, TAU, true);
    ctx.fill();

    // Final black core
    ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.arc(cx, cy, hR*0.89, 0, TAU); ctx.fill();
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 15 — DRAWING: LENSING ARCS
  // ═══════════════════════════════════════════════════════════════════
  function drawLensing(ctx, cx, cy, r, t) {
    const hR   = r * CFG.horizonR;
    const lR   = r * CFG.lensingR;
    ctx.save();
    ctx.translate(cx, cy);

    for (let arc = 0; arc < 4; arc++) {
      const arcRad  = lR * (1.0 + arc * 0.035);
      const arcOffY = hR * (0.14 + arc * 0.07);
      const alpha   = (0.28 - arc * 0.06) * (0.75 + 0.25 * fsin(t*0.28 + arc*0.9));

      const lg = ctx.createLinearGradient(-arcRad*0.85, 0, arcRad*0.85, 0);
      lg.addColorStop(0,   'rgba(255,240,200,0)');
      lg.addColorStop(0.18, `rgba(255,240,200,${alpha})`);
      lg.addColorStop(0.5,  `rgba(255,255,255,${alpha*1.25})`);
      lg.addColorStop(0.82, `rgba(255,240,200,${alpha})`);
      lg.addColorStop(1,   'rgba(255,240,200,0)');

      ctx.strokeStyle = lg;
      ctx.lineWidth   = 2.2 - arc * 0.4;
      ctx.globalAlpha = 1;

      // Upper arc
      ctx.beginPath();
      ctx.ellipse(0, -arcOffY, arcRad*0.88, hR*0.28, 0, Math.PI, TAU);
      ctx.stroke();
      // Lower arc
      ctx.beginPath();
      ctx.ellipse(0,  arcOffY, arcRad*0.88, hR*0.28, 0, 0, Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 16 — DRAWING: POLAR JETS
  // ═══════════════════════════════════════════════════════════════════
  function drawJets(ctx, cx, cy, r, t) {
    const hR  = r * CFG.horizonR;
    const jL  = r * CFG.jetLength;
    ctx.save();

    [-1, 1].forEach(dir => {
      const flicker = 0.09 + 0.05 * fsin(t * 2.2 + dir * Math.PI * 0.5);

      // Jet body gradient
      const jg = ctx.createLinearGradient(cx, cy, cx, cy - dir*jL);
      jg.addColorStop(0,    `rgba(100,165,255,${flicker})`);
      jg.addColorStop(0.3,  `rgba(80,130,255,${flicker*0.65})`);
      jg.addColorStop(0.7,  `rgba(60,100,200,${flicker*0.28})`);
      jg.addColorStop(1,    'rgba(40,80,180,0)');

      ctx.fillStyle = jg;
      ctx.beginPath();
      ctx.ellipse(cx, cy - dir*jL*0.5, hR*0.055, jL*0.5, 0, 0, TAU);
      ctx.fill();

      // Knots travelling outward
      for (let k = 0; k < 4; k++) {
        const kp  = ((t * 0.28 + k * 0.25) % 1.0);
        const ky  = cy - dir * kp * jL;
        const ka  = flicker * (1 - kp) * 1.6;
        const kr  = hR * 0.042 * (1 - kp * 0.5);
        ctx.fillStyle = `rgba(160,210,255,${ka})`;
        ctx.beginPath();
        ctx.arc(cx, ky, kr, 0, TAU);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 17 — DRAWING: CONSTELLATION NETWORK
  // ═══════════════════════════════════════════════════════════════════
  function drawConstellations(ctx, cx, cy, r, t) {
    ctx.save();
    const dashOff = (t * 38) % 24;
    ctx.setLineDash([8, 4]);

    // Architecture links (infra ↔ infra)
    const ARCH = [[0,1],[1,2],[2,4],[3,0],[5,0],[6,1],[7,1],[8,0]];
    ARCH.forEach(([a, b]) => {
      if (!S.nodes[a] || !S.nodes[b]) return;
      const na = S.nodes[a], nb = S.nodes[b];
      const brightA = Math.max(na.activeFade, nb.activeFade);
      ctx.strokeStyle = `rgba(0,212,255,${0.13 + brightA*0.18})`;
      ctx.lineWidth   = 0.9 + brightA * 0.5;
      ctx.lineDashOffset = -dashOff;
      ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke();
    });

    // Threat proximity arcs
    ctx.setLineDash([5, 4]);
    S.nodes.forEach((tn, ti) => {
      if (S.nodes[ti].type !== 'threat') return;
      S.nodes.forEach((inf, ii) => {
        if (S.nodes[ii].type !== 'infra') return;
        const d = dist2(tn.x, tn.y, inf.x, inf.y);
        const threshold = r * 0.28;
        if (d < threshold) {
          const a = (1 - d / threshold) * 0.7;
          ctx.strokeStyle = `rgba(255,80,20,${a})`;
          ctx.lineWidth   = 1.4 + a * 1.2;
          ctx.lineDashOffset = -dashOff * 1.6;
          ctx.beginPath(); ctx.moveTo(tn.x, tn.y); ctx.lineTo(inf.x, inf.y); ctx.stroke();
        }
      });
    });

    ctx.setLineDash([]);
    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 18 — NODES: UPDATE + DRAW
  // ═══════════════════════════════════════════════════════════════════
  function updateNodes(cx, cy, r, t, dt) {
    S.nodes.forEach((node, i) => {
      const def  = DEFAULT_NODES[i];
      const oR   = r * def.orbitR;
      const angle = (t / def.period) * TAU + def.phase;
      const ecc  = def.ecc || 0;

      node.x = cx + Math.cos(angle) * oR * (1 + ecc);
      node.y = cy + Math.sin(angle) * oR * (1 - ecc);

      // Parallax nudge from mouse
      const pf = CFG.parallaxNode;
      node.x += (S.mx - S.W*0.5) * pf;
      node.y += (S.my - S.H*0.5) * pf;

      // Breathing
      const breath = 1 + 0.016 * fsin(t * node.breathFreq + node.breathPhase);
      node.displayR = def.r * breath;

      // Active fade
      node.activeFade = Math.max(0, node.activeFade - dt * 0.8);

      // Micro particle bursts on active nodes
      if (node.activeFade > 0.5 && Math.random() < 0.06) {
        spawnParticle({
          x: node.x + rand(-node.displayR, node.displayR),
          y: node.y + rand(-node.displayR, node.displayR),
          vx: rand(-0.4, 0.4), vy: rand(-0.8, -0.1),
          life: 0.8, rad: 1.2, col: def.color,
          drag: 0.94, gravity: 0,
        });
      }
    });
  }

  function drawNodes(ctx, cx, cy, r, t) {
    DEFAULT_NODES.forEach((def, i) => {
      const node = S.nodes[i];
      if (!node) return;
      const nx = node.x, ny = node.y;
      const nr = node.displayR || def.r;
      const col = def.color || '#00d4ff';
      const af  = node.activeFade || 0;

      // ── Outer glow ──────────────────────────────
      const glowR = nr * (2.8 + af * 1.2);
      const glowAlpha = (0.25 + 0.12 * fsin(t * 1.4 + node.glowPhase) + af * 0.25);
      const gg = ctx.createRadialGradient(nx, ny, nr * 0.5, nx, ny, glowR);
      gg.addColorStop(0, hexRgba(col, glowAlpha));
      gg.addColorStop(1, hexRgba(col, 0));
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(nx, ny, glowR, 0, TAU); ctx.fill();

      // ── Body sphere ─────────────────────────────
      const bg = ctx.createRadialGradient(nx - nr*0.3, ny - nr*0.3, 0, nx, ny, nr);
      if (def.type === 'infra') {
        bg.addColorStop(0,   hexRgba(col, 0.95));
        bg.addColorStop(0.55, hexRgba(col, 0.6));
        bg.addColorStop(1,   hexRgba(col, 0.15));
      } else {
        bg.addColorStop(0,   hexRgba(col, 1.0));
        bg.addColorStop(0.45, hexRgba(col, 0.72));
        bg.addColorStop(1,   'rgba(0,0,0,0.55)');
      }
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(nx, ny, nr, 0, TAU); ctx.fill();

      // ── Rim light ───────────────────────────────
      ctx.strokeStyle = hexRgba(col, 0.65 + af * 0.35);
      ctx.lineWidth   = 0.9 + af * 0.8;
      ctx.beginPath(); ctx.arc(nx, ny, nr, 0, TAU); ctx.stroke();

      // ── Specular ────────────────────────────────
      const hl = ctx.createRadialGradient(nx - nr*0.32, ny - nr*0.32, 0,
                                           nx - nr*0.32, ny - nr*0.32, nr*0.52);
      hl.addColorStop(0, 'rgba(255,255,255,0.28)');
      hl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hl;
      ctx.beginPath(); ctx.arc(nx, ny, nr, 0, TAU); ctx.fill();

      // ── Threat severity ring ─────────────────────
      if (def.type === 'threat') {
        const pulse = 0.5 + 0.5 * fsin(t * 2.5 + i);
        ctx.strokeStyle = hexRgba(col, 0.25 + pulse * 0.35);
        ctx.lineWidth   = 1.2;
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.arc(nx, ny, nr * 1.55, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── Label ───────────────────────────────────
      const labelAlpha = 0.65 + af * 0.35;
      ctx.globalAlpha  = labelAlpha;
      ctx.fillStyle    = col;
      ctx.font         = `${8 + af*2}px "Courier New", monospace`;
      ctx.textAlign    = 'center';
      ctx.shadowColor  = col;
      ctx.shadowBlur   = 5 + af * 6;
      ctx.fillText(def.label, nx, ny + nr + 13);
      ctx.shadowBlur   = 0;
      ctx.globalAlpha  = 1;
    });
  }
  // ═══════════════════════════════════════════════════════════════════
  // SECTION 19 — DATA RIVERS
  // ═══════════════════════════════════════════════════════════════════
  function updateRivers(dt) {
    S.rivers.forEach(rv => {
      rv.timer += dt;
      const interval = 1 / rv.rate;
      if (rv.timer >= interval) {
        rv.timer = 0;
        rv.trains.push({ progress: 0, speed: rand(0.14, 0.26), count: randInt(5, 11) });
      }
      rv.trains = rv.trains.filter(tr => tr.progress < 1.25);
      rv.trains.forEach(tr => { tr.progress += dt * tr.speed; });
    });
  }

  function drawRivers(ctx) {
    S.rivers.forEach(rv => {
      const na = S.nodes[rv.from], nb = S.nodes[rv.to];
      if (!na || !nb) return;

      const mx  = (na.x + nb.x) * 0.5;
      const my  = (na.y + nb.y) * 0.5;
      const dx  = nb.x - na.x, dy = nb.y - na.y;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      const pull = len * CFG.riverControlPull;
      const cpx = mx - (dy/len) * pull;
      const cpy = my + (dx/len) * pull;

      rv.trains.forEach(tr => {
        for (let p = 0; p < tr.count; p++) {
          const tVal = clamp(tr.progress - p * 0.045, 0, 1);
          if (tVal <= 0 || tVal >= 1) continue;

          // Quadratic bezier
          const bx = (1-tVal)*(1-tVal)*na.x + 2*(1-tVal)*tVal*cpx + tVal*tVal*nb.x;
          const by = (1-tVal)*(1-tVal)*na.y + 2*(1-tVal)*tVal*cpy + tVal*tVal*nb.y;

          const fade = 1 - p / tr.count;
          const edgeFade = tr.progress < 0.12 ? tr.progress/0.12 :
                           tr.progress > 0.88 ? (1-tr.progress)/0.12 : 1;

          ctx.globalAlpha = fade * edgeFade * 0.88;
          ctx.fillStyle   = rv.col;
          ctx.beginPath(); ctx.arc(bx, by, 1.8 * fade, 0, TAU); ctx.fill();
        }
      });
    });
    ctx.globalAlpha = 1;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 20 — AURORA
  // ═══════════════════════════════════════════════════════════════════
  function drawAurora(ctx, W, H, t, threat) {
    if (threat < 0.28) return;
    const strength = (threat - 0.28) / 0.72;
    let rr, gg, bb;
    if (threat < 0.58) { rr=0;   gg=255; bb=136; }
    else if (threat < 0.78) { rr=255; gg=190; bb=0; }
    else { rr=210; gg=35;  bb=0; }

    const CURTAINS = 6;
    for (let c = 0; c < CURTAINS; c++) {
      const xBase = (c / CURTAINS) * W;
      const freq  = 0.0028 + c * 0.0008;
      const ph    = c * 1.27;
      for (let y = 0; y < H * 0.38; y += 3) {
        const xw  = xBase + Math.sin(y * freq + t * 0.85 + ph) * 45;
        const a   = strength * (0.038 + 0.018 * fsin(y*0.04 + t + ph)) * (1 - y/(H*0.38));
        ctx.fillStyle = `rgba(${rr},${gg},${bb},${a.toFixed(3)})`;
        ctx.fillRect(xw, y, 2.5 + c * 0.3, 3);
      }
    }

    // Horizontal streaks (event-driven illusion via periodic trigger)
    if (fsin(t * 7.8) > 0.96 && strength > 0.4) {
      const sy = rand(H * 0.04, H * 0.3);
      const sg = ctx.createLinearGradient(0, sy, W, sy);
      const sa = strength * 0.48;
      sg.addColorStop(0,   `rgba(${rr},${gg},${bb},0)`);
      sg.addColorStop(0.25, `rgba(${rr},${gg},${bb},${sa})`);
      sg.addColorStop(0.75, `rgba(${rr},${gg},${bb},${sa})`);
      sg.addColorStop(1,   `rgba(${rr},${gg},${bb},0)`);
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 1, W, 2);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 21 — ATMOSPHERE + VIGNETTE + HUD
  // ═══════════════════════════════════════════════════════════════════
  function drawAtmosphere(ctx, cx, cy, r, t, threat) {
    const col = threat > 0.65 ? '220,35,0' : '255,95,0';
    const hazeR = r * 2.4;
    const hg = ctx.createRadialGradient(cx, cy, r * CFG.horizonR * 1.05, cx, cy, hazeR);
    hg.addColorStop(0,   `rgba(${col},${0.06 + threat*0.04})`);
    hg.addColorStop(0.45, `rgba(${col},0.022)`);
    hg.addColorStop(1,   `rgba(${col},0)`);
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(cx, cy, hazeR, 0, TAU); ctx.fill();
  }

  function drawVignette(ctx, W, H) {
    const vg = ctx.createRadialGradient(W*0.5, H*0.5, H*0.22, W*0.5, H*0.5, H*0.82);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,3,8,0.74)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawHud(ctx, cx, cy, r, t, showLabel) {
    if (!showLabel) return;
    ctx.save();
    const ly = cy + r * 0.65;
    ctx.font        = 'bold 21px "Courier New", monospace';
    ctx.textAlign   = 'center';
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur  = 18;
    ctx.fillStyle   = 'rgba(190,225,255,0.92)';
    ctx.fillText('SIEM Dashboard', cx, ly);
    ctx.shadowBlur  = 0;
    ctx.restore();
  }
  // ═══════════════════════════════════════════════════════════════════
  // SECTION 22 — BOOT ANIMATION
  // ═══════════════════════════════════════════════════════════════════
  function applyBootReveal(ctx, W, H, progress) {
    if (progress >= 1) return;
    // Mask everything except an expanding circle
    const radius = Math.max(W, H) * progress * 0.72;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    const mg = ctx.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, radius);
    mg.addColorStop(0.7, 'rgba(0,0,0,1)');
    mg.addColorStop(1.0, 'rgba(0,0,0,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 23 — PUBLIC API: drawGargantua
  // ═══════════════════════════════════════════════════════════════════
  function drawGargantua(ctx, cx, cy, r, time, opts) {
    opts = opts || {};
    const W          = opts.width        || ctx.canvas.width;
    const H          = opts.height       || ctx.canvas.height;
    const quality    = opts.quality      !== undefined ? opts.quality    : 1;
    const heat       = opts.heat         !== undefined ? opts.heat       : 0;
    const spinMul    = opts.spinMul      !== undefined ? opts.spinMul    : 1;
    const bootT      = opts.bootT        !== undefined ? opts.bootT      : time;
    const showLabel  = opts.showLabel    !== undefined ? opts.showLabel  : true;
    const reduced    = opts.reducedMotion|| false;
    const threatLvl  = opts.threatLevel  || 0;
    const alertCount = opts.alertCount   || 0;
    const deck       = !!opts.deckMode;

    // Delta time — handle both seconds and ms input gracefully
    const rawDt = S.lastT >= 0 ? time - S.lastT : 0.016;
    const dt    = clamp(rawDt > 10 ? rawDt / 1000 : rawDt, 0, 0.1);
    S.lastT = time;
    S.frame++;

    // Init / re-init on resize
    if (!S.init || S.W !== W || S.H !== H || S.deck !== deck) {
      initialize(ctx, cx, cy, r, W, H, deck);
    }

    // Smooth threat level
    S.threat += (threatLvl - S.threat) * Math.min(1, dt * 1.8);

    // Boot progress
    if (!deck && S.bootProgress < 1) {
      S.bootProgress = Math.min(1, S.bootProgress + dt * 0.28);
    }

    // ── UPDATES ────────────────────────────────────────────────────
    updateSpots(dt);
    if (!deck) {
      updateNodes(cx, cy, r, time, dt);
      updateCelestials(cx, cy, dt);
      updateRivers(dt);
    }
    if (!reduced) updateParticles(dt, cx, cy);

    // Regenerate nebula periodically (cheap — offscreen)
    if (!deck && S.frame % CFG.nebulaRegen === 0) regenNebula(W, H);

    // Ambient live bursts (low frequency, always on)
    if (!deck && !reduced && S.nodes.length && Math.random() < 0.004) {
      const ni  = randInt(0, S.nodes.length - 1);
      const nd  = DEFAULT_NODES[ni];
      const nn  = S.nodes[ni];
      burst(nn.x, nn.y, 10, nd.color, 1.2, 1.0, 0.96, 1.3, 0);
    }

    // Alert-count-driven disc hot shot spawn
    if (alertCount > 3 && Math.random() < dt * 0.4) {
      const hx = cx + rand(-r * CFG.discOuter, r * CFG.discOuter);
      const hy = cy + rand(-r * 0.1, r * 0.1);
      burst(hx, hy, 8, '#ff6600', 0.8, 0.6, 0.94, 1.2, 0);
    }

    // ── DRAW LAYERS ────────────────────────────────────────────────
    if (!deck) {
      ctx.clearRect(0, 0, W, H);

      // L0 — void
      drawVoid(ctx, W, H);

      // L1 — cosmic web (only every bgUpdateDiv frames)
      if (S.frame % CFG.bgUpdateDiv === 0 || S.frame < 4) {
        drawCosmicWeb(ctx, time);
      }

      // L2 — nebula
      drawNebula(ctx, W, H);

      // L3 — stars
      if (!reduced) drawStars(ctx, cx, cy, r, time);

      // L4 — outer celestials
      drawCelestials(ctx, cx, cy, r, time);
    }

    // L5 — accretion disc (additive blend = plasma glow)
    ctx.globalCompositeOperation = 'screen';
    drawDisc(ctx, cx, cy, r, time, heat, spinMul, S.threat);
    ctx.globalCompositeOperation = 'source-over';

    // L6 — gravitational lensing arcs
    drawLensing(ctx, cx, cy, r, time);

    // L7 — event horizon (must come after disc so it occludes it)
    drawHorizon(ctx, cx, cy, r, time, S.threat);

    // L8 — polar jets (additive)
    ctx.globalCompositeOperation = 'screen';
    drawJets(ctx, cx, cy, r, time);
    ctx.globalCompositeOperation = 'source-over';

    if (!deck) {
      // L9 — constellation network
      drawConstellations(ctx, cx, cy, r, time);

      // L10 — data rivers (additive)
      ctx.globalCompositeOperation = 'screen';
      drawRivers(ctx);
      ctx.globalCompositeOperation = 'source-over';

      // L11 — orbital nodes
      drawNodes(ctx, cx, cy, r, time);
    }

    // L12 — particles (additive)
    if (!reduced) {
      ctx.globalCompositeOperation = 'screen';
      drawParticles(ctx);
      ctx.globalCompositeOperation = 'source-over';
    }

    // L13 — atmosphere haze (localized around hole)
    drawAtmosphere(ctx, cx, cy, r, time, S.threat);

    if (!deck) {
      // L14 — aurora (threat-driven)
      drawAurora(ctx, W, H, time, S.threat);

      // L15 — HUD label
      drawHud(ctx, cx, cy, r, time, showLabel);

      // L16 — vignette
      drawVignette(ctx, W, H);

      // Boot reveal mask
      if (S.bootProgress < 1) applyBootReveal(ctx, W, H, S.bootProgress);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 24 — PUBLIC EXTENSION METHODS
  // ═══════════════════════════════════════════════════════════════════

  // Fire when a critical alert fires — supernova burst from a threat node
  drawGargantua.criticalAlert = function (cx, cy) {
    if (!S.init) return;
    const threats = S.nodes.filter((_, i) => DEFAULT_NODES[i].type === 'threat');
    const n = threats[randInt(0, threats.length - 1)] || { x: cx, y: cy };
    // Primary red radial burst
    burst(n.x, n.y, 320, '#ff2d55', 5.0, 2.2, 0.955, 4.5, 0);
    // Secondary white shockwave ring
    burst(n.x, n.y, 80, '#ffffff', 9.0, 0.9, 0.91,  2.0, 0);
    // Orange secondary
    burst(n.x, n.y, 60, '#ff6600', 3.0, 1.6, 0.965, 2.5, 0);
    // Mark the originating node active
    if (threats.length) {
      const idx = S.nodes.indexOf(threats[randInt(0, threats.length-1)]);
      if (idx >= 0) S.nodes[idx].activeFade = 1.0;
    }
  };

  // Fire when an IP is watchlisted — inward accretion burst
  drawGargantua.watchlistIp = function (cx, cy) {
    if (!S.init) return;
    burst(cx, cy, 90, '#00ff88', 3.2, 1.8, 0.965, 3.0, 0.06);
    burst(cx, cy, 30, '#ffffff', 1.5, 0.8, 0.97,  1.5, 0);
  };

  // High-severity (non-critical) alert
  drawGargantua.highAlert = function (cx, cy) {
    if (!S.init) return;
    burst(cx, cy, 140, '#ff9500', 3.5, 1.4, 0.96, 3.0, 0);
    burst(cx, cy, 40, '#ffcc00', 1.8, 0.9, 0.97, 1.5, 0);
  };

  // Pass live mouse position for parallax
  drawGargantua.setMouse = function (x, y) {
    S.mx = x; S.my = y;
  };

  // Override node array with live SIEM data
  // nodeArray: [{ label, type, color, severity }]
  drawGargantua.setNodes = function (nodeArray) {
    if (!nodeArray || !nodeArray.length) return;
    nodeArray.forEach((nd, i) => {
      if (i < S.nodes.length) {
        S.nodes[i].activeFade = Math.min(1, S.nodes[i].activeFade + 0.4);
      }
    });
  };

  // Mark a specific node active (by label)
  drawGargantua.activateNode = function (label) {
    const idx = DEFAULT_NODES.findIndex(d => d.label === label);
    if (idx >= 0 && S.nodes[idx]) S.nodes[idx].activeFade = 1.0;
  };

  // Expose internal state for debugging
  drawGargantua._state = S;
  drawGargantua._cfg   = CFG;

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 25 — EXPORT
  // ═══════════════════════════════════════════════════════════════════
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { drawGargantua };
  } else {
    global.drawGargantua = drawGargantua;
  }

})(typeof globalThis !== 'undefined' ? globalThis
   : typeof window   !== 'undefined' ? window : this);
