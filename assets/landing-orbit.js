/**
 * landing-orbit.js  v12.2.0-orbit
 * ─────────────────────────────────────────────────────────────
 * Curated SOC-module orbit hero for the landing page.
 *
 * Draws 16 labeled "planets" on tilted elliptical orbits around the
 * Gargantua wormhole, plus a filament web that ties a "Correlation"
 * hub planet to the inner ring and the alert-rule cluster
 * (SQL Injection · XSS Attempt · Brute Force). Travelling packet
 * particles glide along each filament for the alive-network feel.
 *
 * No dependencies. Uses any Canvas 2D context. Renders on top of the
 * existing wormhole + inflow particles, below the smoke / HUD layers.
 *
 *   import { createLandingOrbit } from './landing-orbit.js';
 *   const orbit = createLandingOrbit(fxCtx, { reducedMotion });
 *   orbit.resize(W, H);
 *   // each frame, after inflow has drawn:
 *   orbit.draw(cx, cy, wormholeRadius, performance.now());
 *
 * Hit testing is optional via `orbit.hit(x, y)` -> node | null.
 */
;(function (G) {
  'use strict';

  const TAU = Math.PI * 2;

  // Curated subset of CORE deck modules. ring 0 = Correlation hub,
  // ring 1 = orchestration belt, ring 2 = alert/intel ring,
  // ring 3 = supporting subsystems. Colors taken from the deck palette
  // so the hero reads as the same universe.
  const SECURITY_MODULES = [
    // Ring 0 — hub
    { label: 'Correlation',     ring: 0, hub: true,  color: '#a78bfa' },
    // Ring 1 — orchestration belt
    { label: 'SIEM Dashboard',  ring: 1, root: true, color: '#c4b5fd' },
    { label: 'Detection Engine',ring: 1,             color: '#5eead4' },
    { label: 'Alert Manager',   ring: 1,             color: '#38bdf8' },
    { label: 'SOAR Console',    ring: 1,             color: '#f472b6' },
    // Ring 2 — alert rules + intel
    { label: 'SQL Injection',   ring: 2, alert: true,color: '#fb7185' },
    { label: 'XSS Attempt',     ring: 2, alert: true,color: '#fbbf24' },
    { label: 'Brute Force',     ring: 2, alert: true,color: '#f59e0b' },
    { label: 'Threat Intel',    ring: 2,             color: '#34d399' },
    { label: 'Geo Map',         ring: 2,             color: '#fcd34d' },
    // Ring 3 — supporting subsystems
    { label: 'RBAC',            ring: 3,             color: '#86efac' },
    { label: 'Cryptography',    ring: 3,             color: '#a78bfa' },
    { label: 'Validation',      ring: 3,             color: '#5eead4' },
    { label: 'GeoIP',           ring: 3,             color: '#38bdf8' },
    { label: 'API Client',      ring: 3,             color: '#c4b5fd' },
    { label: 'AuthContext',     ring: 3,             color: '#f472b6' },
  ];

  // Ring radii expressed as multiples of the wormhole radius `r`.
  // b/a ratio keeps the orbits flattened so they read as a disc plane.
  const RING_SPEC = [
    { aMul: 1.55, bMul: 0.62, speed:  0.00045 },
    { aMul: 2.20, bMul: 0.60, speed: -0.00032 },
    { aMul: 2.95, bMul: 0.56, speed:  0.00024 },
    { aMul: 3.70, bMul: 0.52, speed: -0.00018 },
  ];

  function deterministicJitter(i) {
    // Cheap reproducible perturbation per node so consecutive planets on
    // the same ring don't stack and orbits look organic.
    const x = Math.sin((i + 1) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function createLandingOrbit(ctx, opts) {
    opts = opts || {};
    const REDUCED = !!opts.reducedMotion;

    let W = 0, H = 0;
    let nodes = [];
    let web = [];
    let streams = [];
    let lastR = 0;

    function build(cx, cy, r) {
      nodes = SECURITY_MODULES.map((m, i) => {
        const spec = RING_SPEC[m.ring] || RING_SPEC[RING_SPEC.length - 1];
        const j = deterministicJitter(i);
        const sameRing = SECURITY_MODULES.filter((x) => x.ring === m.ring).length;
        const slot = SECURITY_MODULES.slice(0, i).filter((x) => x.ring === m.ring).length;
        const a = r * spec.aMul * (0.92 + j * 0.16);
        const b = a * spec.bMul;
        // Distribute slots around the ring with a small per-ring rotation
        // so adjacent rings don't all start at 0deg.
        const ang = sameRing > 0
          ? (slot / sameRing) * TAU + m.ring * 0.7 + j * 0.4
          : j * TAU;
        const size = m.hub
          ? Math.max(6, r * 0.034)
          : m.root
            ? Math.max(5.2, r * 0.029)
            : m.alert
              ? Math.max(4.4, r * 0.024)
              : Math.max(3.6, r * 0.020);
        return Object.assign({}, m, {
          a, b, ang, speed: spec.speed * (1 + j * 0.25),
          size, ring: m.ring, slot,
          x: cx + Math.cos(ang) * a,
          y: cy + Math.sin(ang) * b,
          lightAng: j * TAU,
          pulsePhase: j * TAU,
        });
      });

      // Web: hub (idx 0) connects to ring 1 + the three alert nodes.
      web = [];
      const hubIdx = 0;
      for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.ring === 1 || n.alert) {
          web.push({
            a: hubIdx, b: i,
            phase: deterministicJitter(i + 31) * TAU,
            amp: 6 + deterministicJitter(i + 71) * 14,
            alert: !!n.alert,
          });
        }
      }
      // Alert triangle — SQL Injection · XSS Attempt · Brute Force
      const alertIds = nodes
        .map((n, i) => (n.alert ? i : -1))
        .filter((i) => i >= 0);
      for (let i = 0; i < alertIds.length; i++) {
        for (let j = i + 1; j < alertIds.length; j++) {
          web.push({
            a: alertIds[i], b: alertIds[j],
            phase: deterministicJitter(alertIds[i] * 7 + alertIds[j]) * TAU,
            amp: 4 + deterministicJitter(alertIds[i] + alertIds[j] + 17) * 6,
            alert: true,
          });
        }
      }

      streams = web.map((_, i) => ({
        wi: i,
        t: deterministicJitter(i + 5),
        spd: 0.0025 + deterministicJitter(i + 99) * 0.0035,
      }));

      lastR = r;
    }

    function resize(w, h) { W = w; H = h; }

    function shouldHide() {
      return W < 520 || H < 360;
    }

    function midpoint(a, b, w, now) {
      const mxp = (a.x + b.x) / 2 + Math.sin(now * 0.0006 + w.phase) * w.amp;
      const myp = (a.y + b.y) / 2 + Math.cos(now * 0.00045 + w.phase) * w.amp * 0.8;
      return { mxp, myp };
    }

    function draw(cx, cy, r, now) {
      if (shouldHide()) return;
      if (!nodes.length || Math.abs(r - lastR) > 0.5) build(cx, cy, r);

      // Re-evaluate positions every frame so resize / re-center stays sticky.
      const speedScale = REDUCED ? 0.05 : 1;
      for (const n of nodes) {
        n.ang += n.speed * speedScale;
        n.x = cx + Math.cos(n.ang) * n.a;
        n.y = cy + Math.sin(n.ang) * n.b;
        n.lightAng += 0.012 * speedScale;
        n.pulsePhase += 0.04 * speedScale;
      }

      ctx.save();

      // ── Faint orbit ellipses ──
      ctx.lineWidth = 0.6;
      for (let i = 0; i < RING_SPEC.length; i++) {
        const sp = RING_SPEC[i];
        const aR = r * sp.aMul;
        const bR = aR * sp.bMul;
        ctx.strokeStyle = i === 0
          ? 'rgba(167, 139, 250, 0.16)'
          : 'rgba(94, 234, 212, 0.08)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, aR, bR, 0, 0, TAU);
        ctx.stroke();
      }

      // ── Web filaments (drawn before planets so nodes sit on top) ──
      for (const w of web) {
        const a = nodes[w.a], b = nodes[w.b];
        if (!a || !b) continue;
        const { mxp, myp } = midpoint(a, b, w, now);
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        const base = w.alert ? '251, 113, 133' : '167, 139, 250';
        const peak = w.alert ? 0.55 : 0.42;
        grad.addColorStop(0, 'rgba(' + base + ', 0)');
        grad.addColorStop(0.5, 'rgba(' + base + ', ' + peak.toFixed(2) + ')');
        grad.addColorStop(1, 'rgba(' + base + ', 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = w.alert ? 1.1 : 0.85;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mxp, myp, b.x, b.y);
        ctx.stroke();
      }

      // ── Travelling packets along filaments ──
      for (const s of streams) {
        const w = web[s.wi];
        if (!w) continue;
        const a = nodes[w.a], b = nodes[w.b];
        if (!a || !b) continue;
        s.t += s.spd * speedScale;
        if (s.t > 1) s.t -= 1;
        const u = s.t, u2 = 1 - u;
        const { mxp, myp } = midpoint(a, b, w, now);
        const px = u2 * u2 * a.x + 2 * u2 * u * mxp + u * u * b.x;
        const py = u2 * u2 * a.y + 2 * u2 * u * myp + u * u * b.y;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = w.alert ? '#fda4af' : '#e9d5ff';
        ctx.beginPath();
        ctx.arc(px, py, w.alert ? 1.8 : 1.5, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── Planets ──
      for (const n of nodes) {
        const size = n.size;

        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, size * 4.2);
        glow.addColorStop(0, hexWithAlpha(n.color, n.hub ? 0.55 : 0.4));
        glow.addColorStop(1, 'transparent');
        ctx.globalAlpha = 1;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size * 4.2, 0, TAU);
        ctx.fill();

        const body = ctx.createRadialGradient(
          n.x + Math.cos(n.lightAng) * size * 0.4,
          n.y + Math.sin(n.lightAng) * size * 0.4,
          0.5,
          n.x, n.y, size
        );
        body.addColorStop(0, '#ffffff');
        body.addColorStop(0.45, n.color);
        body.addColorStop(1, '#0a0a18');
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size, 0, TAU);
        ctx.fill();

        if (n.alert) {
          const pulse = 0.35 + (Math.sin(n.pulsePhase) + 1) * 0.32;
          ctx.strokeStyle = 'rgba(251, 113, 133, ' + pulse.toFixed(2) + ')';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, size + 3.2, 0, TAU);
          ctx.stroke();
        } else if (n.hub) {
          const pulse = 0.2 + (Math.sin(n.pulsePhase * 0.7) + 1) * 0.25;
          ctx.strokeStyle = 'rgba(196, 181, 253, ' + pulse.toFixed(2) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, size + 4, 0, TAU);
          ctx.stroke();
        }
      }

      // ── Labels (drawn after all bodies to avoid being obscured) ──
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (const n of nodes) {
        const text = n.label.toUpperCase();
        const fontPx = n.hub ? 11 : n.root ? 11 : 9.5;
        ctx.font = '600 ' + fontPx + 'px "IBM Plex Mono", Consolas, monospace';
        const labelY = n.y + n.size + 9;
        const metrics = ctx.measureText(text);
        const padX = 5, padY = 2.5;
        const boxW = metrics.width + padX * 2;
        const boxH = fontPx + padY * 2;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.62)';
        roundRect(ctx, n.x - boxW / 2, labelY - padY, boxW, boxH, 2);
        ctx.fill();
        ctx.strokeStyle = n.alert
          ? 'rgba(251, 113, 133, 0.35)'
          : n.hub
            ? 'rgba(196, 181, 253, 0.35)'
            : 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 0.8;
        roundRect(ctx, n.x - boxW / 2, labelY - padY, boxW, boxH, 2);
        ctx.stroke();
        ctx.fillStyle = n.alert ? '#fda4af' : n.hub ? '#e9d5ff' : '#67e8f9';
        ctx.fillText(text, n.x, labelY);
      }

      ctx.restore();
    }

    function hit(px, py) {
      for (const n of nodes) {
        const d = Math.hypot(n.x - px, n.y - py);
        if (d < n.size + 6) return n;
      }
      return null;
    }

    return { resize, draw, hit, get nodes() { return nodes; } };
  }

  function hexWithAlpha(hex, alpha) {
    // #rrggbb -> rgba(r, g, b, a). Falls back to the input on bad data.
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    const r = (n >> 16) & 0xff;
    const g = (n >> 8) & 0xff;
    const b = n & 0xff;
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  G.createLandingOrbit = createLandingOrbit;
  G.LANDING_ORBIT_MODULES = SECURITY_MODULES;
})(typeof window !== 'undefined' ? window : globalThis);
