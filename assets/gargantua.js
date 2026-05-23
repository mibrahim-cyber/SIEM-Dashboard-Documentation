/**
 * Gargantua-class black hole — Canvas2D (Interstellar-style).
 * Shared: index.html landing · brain/index.html observation deck.
 */
(function (global) {
  'use strict';

  var TAU = Math.PI * 2;
  var TILT = 0.38;
  var SCALE_Y = 0.36;
  var bloomCanvas = null;
  var bloomCtx = null;

  function withDiskTilt(ctx, cx, cy, fn) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(TILT);
    ctx.scale(1, SCALE_Y);
    fn(ctx);
    ctx.restore();
  }

  function ensureBloom(w, h) {
    if (!bloomCanvas || bloomCanvas.width !== w || bloomCanvas.height !== h) {
      bloomCanvas = document.createElement('canvas');
      bloomCanvas.width = w;
      bloomCanvas.height = h;
      bloomCtx = bloomCanvas.getContext('2d');
    }
  }

  function diskGradient(ctx, span, heat, kind) {
    var h = Math.min(1, Math.max(0, heat || 0));
    var boost = 1 + h * 0.22;
    var g = ctx.createLinearGradient(-span, 0, span, 0);

    if (kind === 'front') {
      g.addColorStop(0, 'rgba(0, 0, 0, 0)');
      g.addColorStop(0.12, 'rgba(154, 52, 18, ' + (0.35 * boost).toFixed(3) + ')');
      g.addColorStop(0.28, 'rgba(234, 88, 12, ' + (0.72 * boost).toFixed(3) + ')');
      g.addColorStop(0.38, 'rgba(251, 146, 60, ' + (0.92 * boost).toFixed(3) + ')');
      g.addColorStop(0.44, '#fff7ed');
      g.addColorStop(0.48, '#ffffff');
      g.addColorStop(0.5, '#ffffff');
      g.addColorStop(0.52, '#ffffff');
      g.addColorStop(0.56, '#fff7ed');
      g.addColorStop(0.62, 'rgba(251, 146, 60, ' + (0.92 * boost).toFixed(3) + ')');
      g.addColorStop(0.72, 'rgba(234, 88, 12, ' + (0.72 * boost).toFixed(3) + ')');
      g.addColorStop(0.88, 'rgba(154, 52, 18, ' + (0.35 * boost).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      return g;
    }

    if (kind === 'back') {
      g.addColorStop(0, 'rgba(0, 0, 0, 0)');
      g.addColorStop(0.15, 'rgba(120, 53, 15, ' + (0.45 * boost).toFixed(3) + ')');
      g.addColorStop(0.32, 'rgba(234, 88, 12, ' + (0.65 * boost).toFixed(3) + ')');
      g.addColorStop(0.4, 'rgba(251, 191, 36, ' + (0.85 * boost).toFixed(3) + ')');
      g.addColorStop(0.46, '#fef9c3');
      g.addColorStop(0.5, '#fffbeb');
      g.addColorStop(0.54, '#fef9c3');
      g.addColorStop(0.6, 'rgba(251, 191, 36, ' + (0.85 * boost).toFixed(3) + ')');
      g.addColorStop(0.68, 'rgba(251, 146, 60, ' + (0.75 * boost).toFixed(3) + ')');
      g.addColorStop(0.82, 'rgba(234, 88, 12, ' + (0.55 * boost).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      return g;
    }

      g.addColorStop(0, 'rgba(0, 0, 0, 0)');
    g.addColorStop(0.2, 'rgba(251, 146, 60, 0.55)');
    g.addColorStop(0.5, '#ffedd5');
    g.addColorStop(0.8, 'rgba(251, 146, 60, 0.55)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    return g;
  }

  function drawCosmicBackdrop(ctx, cx, cy, r, W, H, deck) {
    var teal = ctx.createRadialGradient(cx + r * 3.2, cy - r * 2.8, 0, cx + r * 3.2, cy - r * 2.8, r * 14);
    teal.addColorStop(0, deck ? 'rgba(14, 116, 144, 0.06)' : 'rgba(14, 116, 144, 0.14)');
    teal.addColorStop(0.35, deck ? 'rgba(19, 78, 74, 0.03)' : 'rgba(19, 78, 74, 0.06)');
    teal.addColorStop(1, 'transparent');
    ctx.fillStyle = teal;
    ctx.fillRect(0, 0, W || cx * 2, H || cy * 2);

    if (!deck) {
      var orangeLow = ctx.createRadialGradient(cx - r * 2, cy + r * 4, 0, cx - r * 2, cy + r * 4, r * 10);
      orangeLow.addColorStop(0, 'rgba(154, 52, 18, 0.08)');
      orangeLow.addColorStop(1, 'transparent');
      ctx.fillStyle = orangeLow;
      ctx.fillRect(0, 0, W || cx * 2, H || cy * 2);

      var corona = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 10);
      corona.addColorStop(0, 'rgba(251, 191, 36, 0.12)');
      corona.addColorStop(0.25, 'rgba(251, 146, 60, 0.06)');
      corona.addColorStop(0.55, 'rgba(234, 88, 12, 0.02)');
      corona.addColorStop(1, 'transparent');
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 10, 0, TAU);
      ctx.fill();
    } else {
      var violet = ctx.createRadialGradient(cx, cy, r * 2, cx, cy, r * 12);
      violet.addColorStop(0, 'rgba(109, 40, 217, 0.04)');
      violet.addColorStop(0.45, 'rgba(124, 58, 237, 0.02)');
      violet.addColorStop(1, 'transparent');
      ctx.fillStyle = violet;
      ctx.fillRect(0, 0, W || cx * 2, H || cy * 2);
    }
  }

  function drawLensArc(ctx, cx, cy, r, sign, upper, spin) {
    withDiskTilt(ctx, cx, cy, function (c) {
      c.rotate(spin * 0.15);
      var rx = upper ? r * 4.8 : r * 4.4;
      var ry = upper ? r * 1.35 : r * 1.18;
      var yOff = sign * r * (upper ? 1.08 : 0.98);

      var g = c.createLinearGradient(-r * 5.5, 0, r * 5.5, 0);
      g.addColorStop(0, 'rgba(0, 0, 0, 0)');
      g.addColorStop(0.1, 'rgba(154, 52, 18, 0.35)');
      g.addColorStop(0.28, 'rgba(251, 146, 60, 0.65)');
      g.addColorStop(0.42, upper ? 'rgba(255, 251, 235, 0.95)' : 'rgba(255, 237, 213, 0.78)');
      g.addColorStop(0.58, upper ? 'rgba(255, 251, 235, 0.95)' : 'rgba(255, 237, 213, 0.78)');
      g.addColorStop(0.72, 'rgba(251, 146, 60, 0.65)');
      g.addColorStop(0.9, 'rgba(154, 52, 18, 0.35)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');

      c.fillStyle = g;
      c.globalAlpha = upper ? 0.92 : 0.68;
      c.beginPath();
      c.ellipse(0, yOff, rx, ry, 0, sign < 0 ? Math.PI : 0, sign < 0 ? TAU : Math.PI);
      c.fill();

      c.globalAlpha = (upper ? 0.35 : 0.22) * (upper ? 1 : 0.85);
      c.shadowColor = '#ffedd5';
      c.shadowBlur = r * (upper ? 0.45 : 0.28);
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(0, yOff, rx * 1.04, ry * 1.06, 0, sign < 0 ? Math.PI : 0, sign < 0 ? TAU : Math.PI);
      c.fill();
      c.shadowBlur = 0;
    });
  }

  function drawAccretionDisk(ctx, cx, cy, r, spin, heat, layer) {
    var front = layer === 'front';
    var rx = front ? r * 4.1 : r * 4.7;
    var ry = front ? r * 0.92 : r * 1.15;

    withDiskTilt(ctx, cx, cy, function (c) {
      c.rotate(spin);

      if (!front) {
        c.globalAlpha = 0.35;
        c.fillStyle = diskGradient(c, r * 5.5, heat, 'back');
        c.beginPath();
        c.ellipse(0, 0, rx * 1.08, ry * 1.1, 0, 0, TAU);
        c.fill();
      }

      c.globalAlpha = front ? 0.98 : 0.72;
      c.fillStyle = diskGradient(c, r * 5.2, heat, front ? 'front' : 'back');
      c.beginPath();
      c.ellipse(0, 0, rx, ry, 0, 0, TAU);
      c.fill();

      if (front) {
        c.globalAlpha = 0.45;
        c.shadowColor = '#ffffff';
        c.shadowBlur = r * 0.35;
        c.fillStyle = diskGradient(c, r * 4.8, heat, 'front');
        c.beginPath();
        c.ellipse(0, 0, rx * 0.92, ry * 0.88, 0, 0, TAU);
        c.fill();
        c.shadowBlur = 0;
      }
    });
  }

  function drawWispExtensions(ctx, cx, cy, r, t, reduced) {
    if (reduced) return;
    withDiskTilt(ctx, cx, cy, function (c) {
      var blobs = [
        { x: -r * 3.6, y: r * 0.1, rad: r * 2.2, inner: 'rgba(251,146,60,0.18)', outer: 'rgba(154,52,18,0.04)' },
        { x: r * 3.4, y: -r * 0.05, rad: r * 2.0, inner: 'rgba(251,191,36,0.14)', outer: 'rgba(234,88,12,0.03)' },
        { x: -r * 2.2, y: r * 0.35, rad: r * 1.4, inner: 'rgba(154,52,18,0.12)', outer: 'transparent' },
        { x: r * 2.5, y: r * 0.28, rad: r * 1.3, inner: 'rgba(251,146,60,0.1)', outer: 'transparent' },
      ];
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        var wob = Math.sin(t * 0.0015 + i * 1.7) * r * 0.08;
        var g = c.createRadialGradient(b.x + wob, b.y, 0, b.x + wob, b.y, b.rad);
        g.addColorStop(0, b.inner);
        g.addColorStop(0.55, b.outer);
        g.addColorStop(1, 'transparent');
        c.fillStyle = g;
        c.globalAlpha = 1;
        c.beginPath();
        c.arc(b.x + wob, b.y, b.rad, 0, TAU);
        c.fill();
      }
    });
  }

  function drawTurbulence(ctx, cx, cy, r, t, spin, quality, reduced) {
    if (reduced || quality < 0.42) return;
    var segs = quality > 0.65 ? 24 : 12;
    withDiskTilt(ctx, cx, cy, function (c) {
      c.rotate(spin);
      c.beginPath();
      for (var i = 0; i <= segs; i++) {
        var ang = (i / segs) * TAU;
        var wob = 1 + 0.08 * Math.sin(5 * ang + t * 0.004) + 0.04 * Math.sin(11 * ang - t * 0.007);
        var rr = r * 3.75 * wob;
        var px = Math.cos(ang) * rr;
        var py = Math.sin(ang) * rr * 0.26;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.closePath();
      c.fillStyle = diskGradient(c, r * 4.8, 0, 'front');
      c.globalAlpha = 0.28;
      c.fill();
    });
  }

  function drawShadow(ctx, cx, cy, r, bootScale) {
    var sr = r * 0.96 * bootScale;
    var eh = ctx.createRadialGradient(cx, cy, 0, cx, cy, sr * 1.02);
    eh.addColorStop(0, '#000000');
    eh.addColorStop(0.7, '#010409');
    eh.addColorStop(0.92, '#020617');
    eh.addColorStop(1, '#0a0618');
    ctx.globalAlpha = 1;
    ctx.fillStyle = eh;
    ctx.beginPath();
    ctx.arc(cx, cy, sr, 0, TAU);
    ctx.fill();
  }

  function drawPhotonRing(ctx, cx, cy, r, t, reduced, recenterFlash) {
    var pulse = reduced ? 1 : 1 + 0.05 * Math.sin(t * 0.0018);
    var blur = (recenterFlash > 0 ? 32 : 22) * pulse;

    withDiskTilt(ctx, cx, cy, function (c) {
      c.shadowColor = '#fffef5';
      c.shadowBlur = blur * 1.4;
      c.strokeStyle = 'rgba(255, 254, 245, 0.35)';
      c.lineWidth = 5;
      c.globalAlpha = 0.5 * pulse;
      c.beginPath();
      c.ellipse(0, 0, r * 1.58, r * 0.44, 0, 0, TAU);
      c.stroke();

      c.shadowBlur = blur;
      c.strokeStyle = '#fffef5';
      c.lineWidth = 2.8;
      c.globalAlpha = pulse;
      c.beginPath();
      c.ellipse(0, 0, r * 1.52, r * 0.4, 0, 0, TAU);
      c.stroke();

      c.shadowBlur = 0;
      c.strokeStyle = '#fef9c3';
      c.lineWidth = 1.2;
      c.globalAlpha = 0.85 * pulse;
      c.beginPath();
      c.ellipse(0, 0, r * 1.48, r * 0.38, 0, 0, TAU);
      c.stroke();

      c.strokeStyle = 'rgba(253, 230, 138, 0.5)';
      c.lineWidth = 0.8;
      c.globalAlpha = 0.55 * pulse;
      c.beginPath();
      c.ellipse(0, 0, r * 1.64, r * 0.43, 0, 0, TAU);
      c.stroke();
    });
    ctx.globalAlpha = 1;
  }

  function drawPhotonSpeckles(ctx, cx, cy, r, t, reduced, spinMul) {
    if (reduced) return;
    for (var i = 0; i < 18; i++) {
      var a = t * 0.0022 * spinMul + i * (TAU / 18);
      var dist = r * (1.02 + 0.14 * Math.sin(t * 0.003 + i * 0.7));
      ctx.globalAlpha = 0.2 + 0.6 * Math.sin(t * 0.009 + i * 1.1);
      ctx.fillStyle = i % 3 === 0 ? '#ffffff' : '#fde68a';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist * SCALE_Y, 0.8 + (i % 2) * 0.4, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawBokeh(ctx, cx, cy, r, t, quality, reduced) {
    if (reduced || quality < 0.5) return;
    var spots = [
      { x: -r * 4.2, y: r * 2.8, rad: r * 1.1, c: 'rgba(186, 230, 253, 0.14)' },
      { x: -r * 3.1, y: r * 3.4, rad: r * 0.7, c: 'rgba(14, 116, 144, 0.1)' },
      { x: r * 3.8, y: -r * 2.2, rad: r * 0.55, c: 'rgba(255, 237, 213, 0.09)' },
    ];
    for (var i = 0; i < spots.length; i++) {
      var s = spots[i];
      var wob = Math.sin(t * 0.0007 + i) * r * 0.06;
      var g = ctx.createRadialGradient(cx + s.x, cy + s.y + wob, 0, cx + s.x, cy + s.y + wob, s.rad);
      g.addColorStop(0, s.c);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx + s.x, cy + s.y + wob, s.rad, 0, TAU);
      ctx.fill();
    }
  }

  function drawBloomPass(ctx, cx, cy, r, t, quality, reduced, heat, W, H) {
    if (reduced || quality < 0.52 || !W || !H) return;
    ensureBloom(W, H);
    bloomCtx.clearRect(0, 0, W, H);
    bloomCtx.globalCompositeOperation = 'source-over';

    var phase = t * 0.0008;
    var bloom = 0.14 + 0.07 * Math.sin(phase) + (heat || 0) * 0.05;

    bloomCtx.fillStyle = 'rgba(255,255,255,' + bloom + ')';
    bloomCtx.fillRect(cx - r * 0.5, cy - 2, r, 4);
    bloomCtx.fillRect(cx - r * 3.2, cy - 1, r * 6.4, 2);

    withDiskTilt(bloomCtx, cx, cy, function (c) {
      c.fillStyle = 'rgba(255, 251, 235, ' + (bloom * 0.8) + ')';
      c.beginPath();
      c.ellipse(0, 0, r * 1.55, r * 0.42, 0, 0, TAU);
      c.fill();
    });

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = quality > 0.7 ? 0.55 : 0.38;
    ctx.filter = 'blur(' + Math.max(2, r * 0.12) + 'px)';
    ctx.drawImage(bloomCanvas, 0, 0, W, H);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawHorizontalFlare(ctx, cx, cy, r, t, quality, reduced, heat) {
    if (reduced || quality < 0.45) return;
    var bloom = 0.08 + 0.04 * Math.sin(t * 0.0008) + (heat || 0) * 0.03;
    var flare = ctx.createLinearGradient(cx - r * 8, cy, cx + r * 8, cy);
    flare.addColorStop(0, 'transparent');
    flare.addColorStop(0.42, 'transparent');
    flare.addColorStop(0.48, 'rgba(255, 251, 235, ' + (bloom * 0.6) + ')');
    flare.addColorStop(0.5, 'rgba(255, 255, 255, ' + bloom + ')');
    flare.addColorStop(0.52, 'rgba(255, 251, 235, ' + (bloom * 0.6) + ')');
    flare.addColorStop(0.58, 'transparent');
    flare.addColorStop(1, 'transparent');
    ctx.fillStyle = flare;
    ctx.fillRect(cx - r * 8, cy - 2.5, r * 16, 5);
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cx
   * @param {number} cy
   * @param {number} r
   * @param {number} t
   * @param {object} state
   */
  function drawDeckCore(ctx, cx, cy, r, heat, bootScale) {
    var h = heat || 0;
    var glow = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.8);
    glow.addColorStop(0, 'rgba(251, 146, 60, ' + (0.18 + h * 0.12) + ')');
    glow.addColorStop(0.5, 'rgba(234, 88, 12, 0.06)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.8, 0, TAU);
    ctx.fill();
    drawShadow(ctx, cx, cy, r, bootScale);
  }

  function drawGargantua(ctx, cx, cy, r, t, state) {
    state = state || {};
    var heat = state.heat || 0;
    var spinMul = state.spinMul != null ? state.spinMul : 1;
    var reduced = !!state.reducedMotion;
    var quality = state.quality != null ? state.quality : 1;
    var bootT = state.bootT != null ? state.bootT : t;
    var recenterFlash = state.recenterFlash || 0;
    var W = state.width;
    var H = state.height;

    var bootScale = reduced ? 1 : Math.min(1, Math.max(0.85, bootT / 600));
    var diskFade = reduced ? 1 : Math.min(1, Math.max(0, (bootT - 200) / 700));

    if (state.deckMode) {
      drawCosmicBackdrop(ctx, cx, cy, r, W, H, true);
      drawDeckCore(ctx, cx, cy, r, heat, bootScale);
      return;
    }

    var spinBack = reduced ? 0 : t * 0.0009 * spinMul;
    var spinFront = reduced ? 0 : -t * 0.00055 * spinMul;

    drawCosmicBackdrop(ctx, cx, cy, r, W, H);

    ctx.save();
    ctx.globalAlpha = diskFade;

    drawLensArc(ctx, cx, cy, r, -1, false, spinBack);
    drawLensArc(ctx, cx, cy, r, 1, true, spinBack);
    drawAccretionDisk(ctx, cx, cy, r, spinBack, heat, 'back');
    drawWispExtensions(ctx, cx, cy, r, t, reduced);
    drawAccretionDisk(ctx, cx, cy, r, spinFront, heat, 'front');
    drawTurbulence(ctx, cx, cy, r, t, spinFront, quality, reduced);

    ctx.restore();

    drawShadow(ctx, cx, cy, r, bootScale);
    drawPhotonRing(ctx, cx, cy, r, t, reduced, recenterFlash);
    drawPhotonSpeckles(ctx, cx, cy, r, t, reduced, spinMul);
    drawBokeh(ctx, cx, cy, r, t, quality, reduced);
    drawHorizontalFlare(ctx, cx, cy, r, t, quality, reduced, heat);
    drawBloomPass(ctx, cx, cy, r, t, quality, reduced, heat, W, H);

    if (state.showLabel) {
      ctx.font = '600 ' + Math.max(9, r * 0.24) + 'px "IBM Plex Mono", Consolas, monospace';
      ctx.fillStyle = 'rgba(251, 191, 36, 0.55)';
      ctx.textAlign = 'center';
      ctx.globalAlpha = diskFade;
      ctx.shadowColor = 'rgba(251, 146, 60, 0.4)';
      ctx.shadowBlur = 8;
      ctx.fillText('SIEM DASHBOARD', cx, cy + r * 2.35);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  global.drawGargantua = drawGargantua;
})(typeof window !== 'undefined' ? window : globalThis);
