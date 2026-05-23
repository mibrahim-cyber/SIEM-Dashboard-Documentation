/**
 * Observation-deck atmosphere — unique orbiting entities (planets, giants, sats, micro motes).
 */
(function (global) {
  'use strict';

  var TAU = Math.PI * 2;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var PAL = {
    supergiant: ['#fff7ed', '#fdba74', '#fb923c'],
    blue_giant: ['#e0f2fe', '#38bdf8', '#0ea5e9'],
    gas_giant: ['#fde68a', '#d97706', '#92400e'],
    ringed: ['#cbd5e1', '#94a3b8', '#64748b'],
    ice: ['#f0f9ff', '#bae6fd', '#7dd3fc'],
    rock: ['#78716c', '#57534e', '#44403c'],
    metal: ['#94a3b8', '#64748b', '#475569'],
    plasma: ['#fef08a', '#f97316', '#ef4444'],
  };

  function build(opts) {
    var W = opts.W, H = opts.H, S = opts.S || 1, R = opts.R, spin = opts.spin || 0.25, seed = opts.seed || 1;
    var rng = mulberry32(seed);
    var list = [];
    var plan = [
      ['supergiant', 6], ['blue_giant', 5], ['gas_giant', 16], ['ringed_world', 10],
      ['ice_moon', 20], ['red_dwarf', 18], ['comm_sat', 24], ['research_probe', 20],
      ['cargo_pod', 18], ['solar_kite', 14], ['relay_mirror', 14], ['tug_ship', 10],
      ['asteroid_rock', 28], ['ice_shard', 22], ['plasma_wisp', 12],
      ['micro_mote', 100], ['dust_speck', 80], ['spark_flea', 35],
    ];
    for (var p = 0; p < plan.length; p++) {
      var type = plan[p][0], count = plan[p][1];
      for (var i = 0; i < count; i++) {
        var tier = type.indexOf('micro') >= 0 || type.indexOf('dust') >= 0 || type.indexOf('spark') >= 0 || type.indexOf('flea') >= 0 ? 'micro'
          : type.indexOf('super') >= 0 || type.indexOf('giant') >= 0 || type === 'gas_giant' || type === 'ringed_world' ? 'giant'
          : type.indexOf('moon') >= 0 || type.indexOf('dwarf') >= 0 || type.indexOf('rock') >= 0 || type.indexOf('shard') >= 0 ? 'small'
          : 'craft';
        var dist = R * (0.28 + rng() * 1.72);
        list.push({
          type: type,
          tier: tier,
          orbitA: dist,
          orbitB: dist * (0.78 + rng() * 0.22),
          orbitAng: rng() * TAU,
          orbitSpd: (rng() < 0.5 ? 1 : -1) * (0.00006 + rng() * 0.0011) * spin * (tier === 'micro' ? 1.8 : tier === 'giant' ? 0.45 : 1),
          phase: rng() * TAU,
          scale: tier === 'giant' ? 1.4 + rng() * 2.2 : tier === 'craft' ? 0.65 + rng() * 0.9 : tier === 'small' ? 0.35 + rng() * 0.55 : 0.15 + rng() * 0.35,
          alpha: tier === 'micro' ? 0.15 + rng() * 0.45 : 0.35 + rng() * 0.55,
          hue: pickHue(type, rng),
          hue2: pickHue(type, rng),
          wobble: rng() * 5,
          pulse: rng() * 7,
          spin: (rng() - 0.5) * 0.03,
          linkId: (rng() * 1000) | 0,
        });
      }
    }
    return list;
  }

  function pickHue(type, rng) {
    if (type.indexOf('super') >= 0) return PAL.supergiant[(rng() * 3) | 0];
    if (type.indexOf('blue') >= 0) return PAL.blue_giant[(rng() * 3) | 0];
    if (type === 'gas_giant') return PAL.gas_giant[(rng() * 3) | 0];
    if (type === 'ringed_world') return PAL.ringed[(rng() * 3) | 0];
    if (type.indexOf('ice') >= 0) return PAL.ice[(rng() * 3) | 0];
    if (type.indexOf('plasma') >= 0) return PAL.plasma[(rng() * 3) | 0];
    if (type.indexOf('rock') >= 0 || type.indexOf('shard') >= 0) return PAL.rock[(rng() * 3) | 0];
    return PAL.metal[(rng() * 3) | 0];
  }

  function update(list, cx, cy, t, spinMul, reduced) {
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (!reduced) {
        a.orbitAng += a.orbitSpd * spinMul;
        a.phase += a.spin * spinMul;
      }
      var wob = Math.sin(t * 0.007 + a.wobble) * 3;
      a.x = cx + Math.cos(a.orbitAng) * a.orbitA + wob;
      a.y = cy + Math.sin(a.orbitAng) * a.orbitB + wob * 0.65;
    }
  }

  function drawEntity(ctx, a, sc, t, alert) {
    var s = a.scale * sc;
    ctx.save();
    ctx.rotate(a.phase);
    switch (a.type) {
      case 'supergiant': {
        var g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 14);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.2, a.hue);
        g.addColorStop(0.55, a.hue2);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, s * 12, 0, TAU); ctx.fill();
        break;
      }
      case 'blue_giant': {
        var bg = ctx.createRadialGradient(-s * 2, -s * 2, 0, 0, 0, s * 10);
        bg.addColorStop(0, '#ffffff');
        bg.addColorStop(0.35, a.hue);
        bg.addColorStop(1, 'transparent');
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.arc(0, 0, s * 9, 0, TAU); ctx.fill();
        break;
      }
      case 'gas_giant':
        ctx.fillStyle = a.hue;
        ctx.beginPath(); ctx.arc(0, 0, s * 5, 0, TAU); ctx.fill();
        ctx.globalAlpha *= 0.7;
        for (var b = -3; b <= 3; b++) {
          ctx.fillStyle = b % 2 ? a.hue2 : a.hue;
          ctx.fillRect(-s * 5, b * s * 1.1, s * 10, s * 0.55);
        }
        break;
      case 'ringed_world':
        ctx.fillStyle = a.hue;
        ctx.beginPath(); ctx.arc(0, 0, s * 3.5, 0, TAU); ctx.fill();
        ctx.strokeStyle = a.hue2;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(0, 0, s * 6, s * 1.6, 0.4, 0, TAU); ctx.stroke();
        break;
      case 'ice_moon':
        ctx.fillStyle = a.hue;
        ctx.beginPath(); ctx.arc(0, 0, s * 2, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath(); ctx.arc(-s * 0.6, -s * 0.6, s * 0.7, 0, TAU); ctx.fill();
        break;
      case 'red_dwarf':
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(0, 0, s * 1.4, 0, TAU); ctx.fill();
        break;
      case 'comm_sat':
        ctx.fillStyle = '#334155';
        ctx.fillRect(-s * 3, -s, s * 6, s * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-s * 5, -s * 0.4, s * 2.5, s * 0.8);
        ctx.fillRect(s * 2.5, -s * 0.4, s * 2.5, s * 0.8);
        ctx.fillStyle = alert ? '#f59e0b' : '#22d3ee';
        ctx.beginPath(); ctx.arc(0, -s * 1.8, s * 0.7, 0, TAU); ctx.fill();
        break;
      case 'research_probe':
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.moveTo(0, -s * 3); ctx.lineTo(s * 2, s * 2); ctx.lineTo(-s * 2, s * 2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, s * 2); ctx.lineTo(0, s * 4.5); ctx.stroke();
        break;
      case 'cargo_pod':
        ctx.fillStyle = '#475569';
        ctx.fillRect(-s * 2.2, -s * 1.8, s * 4.4, s * 3.6);
        ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(-s * 2.2, -s * 1.8, s * 4.4, s * 3.6);
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(-s * 0.8, -s * 0.4, s * 1.6, s * 0.8);
        break;
      case 'solar_kite':
        ctx.fillStyle = 'rgba(224,242,254,0.35)';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * 8, -s * 2); ctx.lineTo(s * 7, s * 3); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#64748b'; ctx.stroke();
        break;
      case 'relay_mirror':
        ctx.fillStyle = 'rgba(186,230,253,0.45)';
        ctx.fillRect(-s * 3, -s * 0.3, s * 6, s * 0.6);
        ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(-s * 3, -s * 0.3, s * 6, s * 0.6);
        break;
      case 'tug_ship':
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-s * 2, -s, s * 4, s * 2);
        ctx.fillStyle = Math.sin(t * 0.05 + a.pulse) > 0 ? '#fb923c' : '#7c2d12';
        ctx.beginPath(); ctx.arc(-s * 2.5, 0, s * 0.9, 0, TAU); ctx.fill();
        break;
      case 'asteroid_rock':
        ctx.fillStyle = a.hue;
        ctx.beginPath();
        ctx.moveTo(-s * 2, s); ctx.lineTo(-s, -s * 1.5); ctx.lineTo(s * 1.8, -s * 0.5);
        ctx.lineTo(s * 2, s * 1.2); ctx.lineTo(0, s * 1.8); ctx.closePath(); ctx.fill();
        break;
      case 'ice_shard':
        ctx.strokeStyle = a.hue;
        ctx.lineWidth = 1;
        for (var c = 0; c < 3; c++) {
          var ca = c * TAU / 3;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ca) * s * 3, Math.sin(ca) * s * 3); ctx.stroke();
        }
        break;
      case 'plasma_wisp':
        ctx.strokeStyle = a.hue;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-s * 4, Math.sin(t * 0.02 + a.pulse) * s);
        ctx.quadraticCurveTo(0, -s * 3, s * 4, Math.sin(t * 0.025 + a.pulse) * s * 1.5);
        ctx.stroke();
        break;
      case 'micro_mote':
        ctx.fillStyle = a.hue;
        ctx.fillRect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8);
        break;
      case 'dust_speck':
        ctx.fillStyle = a.hue;
        ctx.beginPath(); ctx.arc(0, 0, s * 0.5, 0, TAU); ctx.fill();
        break;
      case 'spark_flea':
        ctx.strokeStyle = a.hue;
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
        break;
      default:
        ctx.fillStyle = a.hue;
        ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  function draw(ctx, list, opts) {
    var camX = opts.camX, camY = opts.camY, camScale = opts.camScale;
    var W = opts.W, H = opts.H, S = opts.S, t = opts.t, quality = opts.quality;
    var bootFade = opts.bootFade != null ? opts.bootFade : 1;
    var alert = opts.alert;
    var step = quality < 0.5 ? 3 : quality < 0.7 ? 2 : 1;
    var microStep = quality < 0.55 ? 4 : quality < 0.75 ? 2 : 1;

    ctx.save();
    ctx.translate(-camX, -camY);
    ctx.scale(camScale, camScale);

    for (var li = 0; li < list.length; li += step) {
      var a = list[li];
      if (a.tier === 'micro') continue;
      var sx = a.x - camX, sy = a.y - camY;
      if (sx < -160 || sx > W + 160 || sy < -160 || sy > H + 160) continue;
      var tw = 0.55 + Math.sin(t * 0.014 + a.pulse) * 0.3;
      ctx.globalAlpha = a.alpha * tw * bootFade;
      ctx.translate(a.x, a.y);
      drawEntity(ctx, a, S, t, alert);
      ctx.translate(-a.x, -a.y);
    }

    if (quality > 0.55) {
      for (var j = 0; j < list.length; j += microStep) {
        var m = list[j];
        if (m.tier !== 'micro' && m.tier !== 'small') continue;
        var mx = m.x - camX, my = m.y - camY;
        if (mx < -40 || mx > W + 40 || my < -40 || my > H + 40) continue;
        var mtw = 0.35 + Math.sin(t * 0.02 + m.pulse) * 0.35;
        ctx.globalAlpha = m.alpha * mtw * bootFade;
        ctx.translate(m.x, m.y);
        drawEntity(ctx, m, S, t, alert);
        ctx.translate(-m.x, -m.y);
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  global.Atmosphere = { build: build, update: update, draw: draw };
})(typeof window !== 'undefined' ? window : globalThis);
