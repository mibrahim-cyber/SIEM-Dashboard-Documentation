/**
 * wormhole-portal.js  v12.1 — GARGANTUA (smoky volumetric dust + pure void)
 * ──────────────────────────────────────────────────────────────────────────────
 * Same drop-in API:
 *   drawGargantua(ctx, cx, cy, r, time, { width, height, heat, spinMul, showLabel, reducedMotion, landingMode, deckMode })
 *
 * v12.1 changes
 *   • FIX: pure-black event horizon (cream bloom no longer bleeds into void)
 *   • ADD: per-frame smoky dust modulation on the disc (breathing wisps)
 *   • ADD: defense-in-depth horizon re-cover after photon ring + front halves
 *
 * Recreates the Interstellar look: near-edge-on accretion disc with real
 * dust texture (FBM filaments + dust lanes + bright clumps baked once),
 * gravitationally-lensed halo over the top + under the bottom, bright
 * photon ring, Doppler-brightened approaching side, blue nebula field.
 *
 * No dependencies. Canvas 2D only. 60fps via pre-baked disc + single blits.
 *
 * ── anime.js hook ──────────────────────────────────────────────────
 * Tween drawGargantua.params live, e.g.:
 *   anime({ targets: drawGargantua.params, tilt: 0.20, spin: 1.6,
 *           bloom: 1.3, exposure: 1.1, duration: 4000, easing:'easeOutCubic' });
 */
;(function (G) {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = (v,a,b)=>v<a?a:v>b?b:v;
  const lerp  = (a,b,t)=>a+(b-a)*t;
  const rnd   = (a,b)=>a+Math.random()*(b-a);
  const rint  = (a,b)=>(a+Math.random()*(b-a+1))|0;

  // ── noise ──────────────────────────────────────────────────────────
  function h21(x,y){let h=((x*374761393)^(y*668265263))|0;h^=h>>13;h=Math.imul(h,1274126177);return((h^h>>16)>>>0)/4294967296;}
  function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);
    return lerp(lerp(h21(xi,yi),h21(xi+1,yi),ux),lerp(h21(xi,yi+1),h21(xi+1,yi+1),ux),uy);}
  function fbm(x,y,oct){let v=0,a=.5,f=1,s=0;for(let i=0;i<oct;i++){v+=vnoise(x*f,y*f)*a;s+=a;a*=.5;f*=2.03;}return v/s;}

  // ── plasma temperature → rgb (0 cool/deep-orange → 1 hot/white-blue) ─
  function tempRgb(t){
    t=clamp(t,0,1);
    if(t<.25){const u=t/.25;return[lerp(120,255,u),lerp(30,110,u),lerp(8,30,u)];}
    if(t<.55){const u=(t-.25)/.30;return[255,lerp(110,200,u),lerp(30,110,u)];}
    if(t<.80){const u=(t-.55)/.25;return[255,lerp(200,245,u),lerp(110,205,u)];}
    const u=(t-.80)/.20;return[lerp(255,225,u),lerp(245,245,u),lerp(205,255,u)];
  }

  // ── state ───────────────────────────────────────────────────────────
  const S={
    init:false,W:0,H:0,frame:0,lastT:-1,bootP:0,mx:0,my:0,
    discTex:null, discRo:360,        // pre-baked top-down dusty annulus
    neb:null, nebCtx:null,
    stars:[], motes:[], pool:[],
    spinOuter:0, spinInner:0,
  };

  // tunables anime.js can tween
  const P={ tilt:0.15, spin:1.0, bloom:1.0, exposure:1.0, heat:0 };

  // ── geometry (fractions of r) ───────────────────────────────────────
  const GEO={
    horizon:   0.40,   // black sphere radius
    photon:    0.435,  // photon ring radius
    discInner: 0.46,
    discOuter: 1.55,
    haloScaleY:0.52,   // vertical squash of the lensed over/under arcs
    midScaleY: 0.14,   // vertical squash of the flat disc plane
    dopplerDir:-1,     // -1 = left side approaches (brighter)
  };

  // ════════════════════════════════════════════════════════════════════
  // BUILD: dusty top-down accretion-disc texture (ONE TIME)
  // ════════════════════════════════════════════════════════════════════
  function buildDiscTexture(){
    const ro = S.discRo;                 // outer radius in tex px
    const ri = ro * (GEO.discInner/GEO.discOuter);
    const D  = ro*2 + 4;
    const cv = document.createElement('canvas');
    cv.width = cv.height = D;
    const c  = cv.getContext('2d');
    const img = c.createImageData(D, D);
    const px  = img.data;
    const cx = D/2, cy = D/2;

    // angular dust-lane offsets so lanes aren't perfect circles
    for (let y=0; y<D; y++){
      for (let x=0; x<D; x++){
        const dx = x-cx, dy = y-cy;
        const rad = Math.sqrt(dx*dx+dy*dy);
        const idx = (y*D+x)*4;
        if (rad < ri || rad > ro){ px[idx+3]=0; continue; }

        const ang = Math.atan2(dy,dx);
        const rf  = (rad-ri)/(ro-ri);          // 0 inner .. 1 outer

        // ── temperature: hot inner edge → cool outer ──
        const temp = Math.pow(1-rf, 0.62) + 0.05;
        let [tr,tg,tb] = tempRgb(temp);

        // ── tangential filaments: stretch noise along the orbit ──
        // sample noise in a sheared space so streaks wrap around the disc
        const swirl = ang*3.0 + rf*9.0;        // winding
        const nx = Math.cos(swirl)*(2.0+rf*5.0) + rf*7.0;
        const ny = Math.sin(swirl)*(2.0+rf*5.0);
        const fil = fbm(nx*1.6, ny*1.6, 5);            // filament cloud
        const fine= fbm(nx*5.5+13.0, ny*5.5-7.0, 4);   // fine grain

        // ── dust lanes: dark concentric-ish gaps modulated by noise ──
        const laneN = fbm(rf*3.0+8.0, ang*2.2, 3);
        const lane  = 0.55 + 0.45*Math.sin(rf*34.0 + laneN*6.0 + Math.sin(ang*2.0)*1.4);
        const laneF = clamp(lane, 0.12, 1.0);

        // ── composite brightness ──
        let b = (0.22 + 0.78*fil) * (0.55 + 0.45*fine) * laneF;
        b *= 2.05 * (1.0 - rf*rf*0.55);        // brighter toward inner

        // ── bright clumps / hot knots ──
        if (fil > 0.74){
          const k = (fil-0.74)/0.26;
          b += k*k*1.8;
          tr=lerp(tr,255,k*0.6); tg=lerp(tg,250,k*0.6); tb=lerp(tb,235,k*0.6);
        }

        // ── soft edge fades (inner glow ramp + outer dissolve) ──
        const innerFade = clamp(rf/0.06, 0, 1);
        const outerFade = clamp((1-rf)/0.22, 0, 1);
        const edge = innerFade * Math.pow(outerFade, 1.4);

        const a = clamp(b, 0, 1) * edge;
        px[idx]   = clamp(tr*b, 0, 255);
        px[idx+1] = clamp(tg*b, 0, 255);
        px[idx+2] = clamp(tb*b, 0, 255);
        px[idx+3] = clamp(a*255, 0, 255);
      }
    }
    c.putImageData(img, 0, 0);

    // overlay a few dozen extra-bright orbiting "embers" baked into texture
    c.globalCompositeOperation='lighter';
    for (let i=0;i<140;i++){
      const a=rnd(0,TAU), rf=Math.pow(rnd(0,1),0.6);
      const rad=lerp(ri,ro,rf);
      const ex=cx+Math.cos(a)*rad, ey=cy+Math.sin(a)*rad;
      const s=rnd(0.6,2.4)*(1-rf*0.5);
      const g=c.createRadialGradient(ex,ey,0,ex,ey,s*4);
      const temp=Math.pow(1-rf,0.6);
      const [r2,g2,b2]=tempRgb(temp+0.15);
      g.addColorStop(0,`rgba(${r2|0},${g2|0},${b2|0},0.9)`);
      g.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=g; c.beginPath(); c.arc(ex,ey,s*4,0,TAU); c.fill();
    }
    c.globalCompositeOperation='source-over';

    S.discTex = cv;
  }

  // ════════════════════════════════════════════════════════════════════
  // BUILD: blue nebula background (ONE TIME, low-res)
  // ════════════════════════════════════════════════════════════════════
  function buildNebula(W,H){
    const nw=Math.ceil(W/3), nh=Math.ceil(H/3);
    if(!S.neb){ S.neb=document.createElement('canvas'); S.nebCtx=S.neb.getContext('2d'); }
    S.neb.width=nw; S.neb.height=nh;
    const c=S.nebCtx;
    c.fillStyle='#01040c'; c.fillRect(0,0,nw,nh);

    // blue/teal volumetric blobs
    [
      {x:.22,y:.30,rx:.55,ry:.42,col:[20,55,120]},
      {x:.78,y:.34,rx:.48,ry:.40,col:[12,70,110]},
      {x:.50,y:.62,rx:.62,ry:.46,col:[16,40,95]},
      {x:.30,y:.72,rx:.40,ry:.38,col:[10,80,120]},
      {x:.70,y:.74,rx:.42,ry:.36,col:[24,48,110]},
    ].forEach(({x,y,rx,ry,col})=>{
      const gx=x*nw,gy=y*nh;
      const g=c.createRadialGradient(gx,gy,0,gx,gy,Math.max(rx*nw,ry*nh));
      g.addColorStop(0,`rgba(${col[0]},${col[1]},${col[2]},0.30)`);
      g.addColorStop(.5,`rgba(${col[0]},${col[1]},${col[2]},0.10)`);
      g.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=g; c.beginPath(); c.ellipse(gx,gy,rx*nw,ry*nh,0,0,TAU); c.fill();
    });

    // dust filaments via noise scan (cheap, low-res)
    const id=c.getImageData(0,0,nw,nh), d=id.data;
    for(let y=0;y<nh;y++) for(let x=0;x<nw;x++){
      const f=fbm(x/nw*5, y/nh*4, 4);
      if(f>0.58){
        const v=(f-0.58)/0.42;
        const i=(y*nw+x)*4;
        d[i]  =clamp(d[i]  +v*18,0,255);
        d[i+1]=clamp(d[i+1]+v*40,0,255);
        d[i+2]=clamp(d[i+2]+v*70,0,255);
      }
    }
    c.putImageData(id,0,0);
  }

  // ════════════════════════════════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════════════════════════════════
  function init(W,H,cx,cy,r){
    S.W=W; S.H=H; S.init=true; S.bootP=0;
    buildDiscTexture();
    buildNebula(W,H);

    // background stars
    S.stars=[];
    for(let i=0;i<1300;i++){
      const x=rnd(0,W), y=rnd(0,H);
      const w=Math.random();
      const col = w<.7?'#cfe0ff' : w<.85?'#ffffff' : w<.94?'#ffe8c8':'#ffb88a';
      S.stars.push({x,y,rad:rnd(.3,1.5),bri:rnd(.25,1),freq:rnd(.4,3),ph:rnd(0,TAU),col});
    }

    // orbiting bright motes (foreground sparkle on the disc)
    S.motes=[];
    for(let i=0;i<14;i++){
      S.motes.push({ang:rnd(0,TAU),rf:Math.pow(rnd(0,1),0.7),
        spd:rnd(0.10,0.30),size:rnd(1.5,3.5),ph:rnd(0,TAU)});
    }

    // particle pool (for alert bursts)
    S.pool=Array.from({length:1600},()=>({alive:false,x:0,y:0,vx:0,vy:0,life:0,ml:1,rad:1,col:'#fff',drag:.96}));
  }

  // ── particles ───────────────────────────────────────────────────────
  function spawn(o){for(let i=0;i<S.pool.length;i++){const p=S.pool[i];if(!p.alive){Object.assign(p,{alive:true,x:o.x,y:o.y,vx:o.vx||0,vy:o.vy||0,life:1,ml:o.life||1,rad:o.rad||2,col:o.col||'#fff',drag:o.drag||.96});return;}}}
  function burst(x,y,n,col,spd,life){for(let i=0;i<n;i++){const a=rnd(0,TAU),s=rnd(spd*.4,spd);spawn({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,rad:rnd(1.5,3.5),col});}}
  function tickParts(dt){S.pool.forEach(p=>{if(!p.alive)return;p.vx*=p.drag;p.vy*=p.drag;p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.life-=dt/p.ml;if(p.life<=0)p.alive=false;});}
  function drawParts(ctx){S.pool.forEach(p=>{if(!p.alive)return;ctx.globalAlpha=p.life*p.life;ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(p.x,p.y,p.rad*(.4+.6*p.life),0,TAU);ctx.fill();});ctx.globalAlpha=1;}

  // ── deckMode: minimal void (no orange accretion disc) ───────────────
  function drawDeckHole(ctx,cx,cy,r,t,heat){
    const hR=r*.34, pulse=.72+.28*Math.sin(t*TAU/3.2);
    const alert=heat>.5;

    const rim=ctx.createRadialGradient(cx,cy,hR*.92,cx,cy,r*1.05);
    rim.addColorStop(0,'rgba(0,0,0,0)');
    rim.addColorStop(.55,`rgba(${alert?'255,90,40':'124,58,237'},${(0.10+heat*.08)*pulse})`);
    rim.addColorStop(.82,`rgba(${alert?'255,60,20':'99,102,241'},${(0.05+heat*.04)*pulse})`);
    rim.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=rim;ctx.beginPath();ctx.arc(cx,cy,r*1.05,0,TAU);ctx.fill();

    const pg=ctx.createRadialGradient(cx,cy,hR*.88,cx,cy,hR*1.06);
    pg.addColorStop(0,'rgba(255,245,220,0)');
    pg.addColorStop(.42,`rgba(255,248,230,${(0.55+heat*.2)*pulse})`);
    pg.addColorStop(.55,`rgba(255,255,255,${(0.75+heat*.15)*pulse})`);
    pg.addColorStop(1,'rgba(255,200,140,0)');
    ctx.fillStyle=pg;ctx.beginPath();ctx.arc(cx,cy,hR*1.06,0,TAU);ctx.arc(cx,cy,hR*.88,0,TAU,true);ctx.fill();

    ctx.fillStyle='#000000';ctx.beginPath();ctx.arc(cx,cy,hR*.96,0,TAU);ctx.fill();

    ctx.strokeStyle=`rgba(196,181,253,${(0.35+heat*.25)*pulse})`;
    ctx.lineWidth=Math.max(.8,r*.018);
    ctx.beginPath();ctx.arc(cx,cy,hR*.94,0,TAU);ctx.stroke();
  }

  // ════════════════════════════════════════════════════════════════════
  // DRAW HELPERS
  // ════════════════════════════════════════════════════════════════════

  // blit the dusty disc texture as a rotated, vertically-squashed ellipse
  // half: 'full' | 'top' | 'bottom'  (for the lensed halo arcs)
  function blitDisc(ctx, cx, cy, r, vScale, spin, half, alpha){
    const tex = S.discTex; if(!tex) return;
    const ro  = S.discRo;
    const scale = (r*GEO.discOuter)/ro;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);

    if(half!=='full'){
      // clip to upper or lower half so the halo only shows its arc
      ctx.beginPath();
      if(half==='top') ctx.rect(-r*GEO.discOuter, -r*GEO.discOuter, r*GEO.discOuter*2, r*GEO.discOuter);
      else             ctx.rect(-r*GEO.discOuter,  0,                r*GEO.discOuter*2, r*GEO.discOuter);
      ctx.clip();
    }

    ctx.scale(scale, scale*vScale);
    ctx.rotate(spin);
    ctx.drawImage(tex, -ro, -ro, ro*2, ro*2);
    ctx.restore();
  }

  // smooth temperature underglow beneath the dust (fills the gaps so the
  // disc reads as continuous light, not just specks)
  function discUnderglow(ctx, cx, cy, r, vScale, half){
    const inner=r*GEO.discInner, outer=r*GEO.discOuter;
    ctx.save();
    ctx.translate(cx,cy);
    if(half==='top'){ctx.beginPath();ctx.rect(-outer,-outer,outer*2,outer);ctx.clip();}
    else if(half==='bottom'){ctx.beginPath();ctx.rect(-outer,0,outer*2,outer);ctx.clip();}
    ctx.scale(1,vScale);
    const g=ctx.createRadialGradient(0,0,inner,0,0,outer);
    g.addColorStop(0,   'rgba(255,150,60,0.0)');
    g.addColorStop(0.06,'rgba(255,180,90,0.55)');
    g.addColorStop(0.25,'rgba(255,120,40,0.30)');
    g.addColorStop(0.60,'rgba(180,70,25,0.12)');
    g.addColorStop(1,   'rgba(80,30,10,0)');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(0,0,outer,0,TAU); ctx.fill();
    ctx.restore();
  }

  function drawSphere(ctx,cx,cy,r){
    const hR=r*GEO.horizon;
    // pure black event horizon
    ctx.fillStyle='#000000';
    ctx.beginPath(); ctx.arc(cx,cy,hR,0,TAU); ctx.fill();
  }

  // Defence-in-depth: after additive passes have run, guarantee the horizon
  // is pure #000 by clipping a black disc on top with source-over.
  function recoverHorizon(ctx,cx,cy,r){
    const hR=r*GEO.horizon;
    ctx.save();
    ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='#000000';
    ctx.beginPath(); ctx.arc(cx,cy,hR,0,TAU); ctx.fill();
    ctx.restore();
  }

  // Re-paint only the UPPER half of the horizon so the void stays pure
  // black where no disc material is supposed to cross in front of it.
  // The lower half remains untouched so the front-half disc keeps its
  // natural Interstellar wrap.
  function recoverHorizonTop(ctx,cx,cy,r){
    const hR=r*GEO.horizon;
    ctx.save();
    ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='#000000';
    ctx.beginPath();
    ctx.arc(cx,cy,hR,Math.PI,TAU,false);
    ctx.lineTo(cx-hR,cy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── Smoky volumetric dust (per-frame) ───────────────────────────────
  // Adds breathing noise wisps over the disc plane. Cheap: paints a few
  // soft, semi-transparent radial blobs whose positions drift along orbit
  // angles each frame, so the disc reads as living smoke, not a static png.
  // half: 'top' | 'bottom' — clips to back or front half so the horizon
  // can occlude the back wisps naturally and the void stays pure black.
  function drawSmokyDust(ctx,cx,cy,r,t,vScale,half){
    const inner=r*GEO.discInner, outer=r*GEO.discOuter;
    const layers=6;
    ctx.save();
    ctx.translate(cx,cy);
    if(half==='top'){ ctx.beginPath(); ctx.rect(-outer,-outer,outer*2,outer); ctx.clip(); }
    else if(half==='bottom'){ ctx.beginPath(); ctx.rect(-outer,0,outer*2,outer); ctx.clip(); }
    ctx.scale(1,vScale);
    ctx.globalCompositeOperation='screen';
    const phaseOffset = half==='top' ? 0 : Math.PI; // stagger the two halves
    for(let i=0;i<layers;i++){
      const phase = t*(0.18 + i*0.04) + i*1.7 + phaseOffset;
      const ang = phase + Math.sin(t*0.3+i)*0.6;
      const rf  = 0.20 + 0.55*((Math.sin(t*0.11+i*0.9)+1)*0.5);
      const rad = lerp(inner,outer,rf);
      const x = Math.cos(ang)*rad;
      const y = Math.sin(ang)*rad;
      const size = lerp(outer*0.55, outer*0.95, (i%3)/2);
      const wisp = 0.10 + 0.06*Math.sin(t*0.7+i*1.3);
      const g = ctx.createRadialGradient(x,y,0,x,y,size);
      const hot = i<2;
      if(hot){
        g.addColorStop(0,    `rgba(255,210,150,${wisp*1.4})`);
        g.addColorStop(0.4,  `rgba(255,150,80,${wisp*0.55})`);
        g.addColorStop(1,    'rgba(120,40,10,0)');
      } else {
        g.addColorStop(0,    `rgba(255,180,120,${wisp})`);
        g.addColorStop(0.5,  `rgba(180,90,50,${wisp*0.35})`);
        g.addColorStop(1,    'rgba(60,20,8,0)');
      }
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(x,y,size,0,TAU); ctx.fill();
    }
    ctx.restore();
  }

  function drawPhotonRing(ctx,cx,cy,r,t){
    const pR=r*GEO.photon, hR=r*GEO.horizon;
    const pulse=0.85+0.15*Math.sin(t*TAU/3.0);
    const dop = GEO.dopplerDir; // brighten approaching side
    const bloomR = pR*2.6*P.bloom;

    // broad Einstein-ring bloom — gradient starts transparent AT the horizon
    // and the path is annular (carves out the horizon) so the void stays
    // pure black no matter the composite mode used by the caller.
    const bloom=ctx.createRadialGradient(cx,cy,hR,cx,cy,bloomR);
    bloom.addColorStop(0,    'rgba(255,240,210,0)');
    bloom.addColorStop(.04,  `rgba(255,240,210,${0.55*pulse})`);
    bloom.addColorStop(.18,  `rgba(255,225,180,${0.30*pulse})`);
    bloom.addColorStop(.5,   `rgba(255,170,90,${0.10*pulse})`);
    bloom.addColorStop(1,    'rgba(120,60,20,0)');
    ctx.fillStyle=bloom;
    ctx.beginPath();
    ctx.arc(cx,cy,bloomR,0,TAU);
    ctx.arc(cx,cy,hR,0,TAU,true);   // carve out horizon
    ctx.fill('evenodd');

    // crisp photon ring (already annular)
    const ring=ctx.createRadialGradient(cx,cy,hR*0.97,cx,cy,pR*1.18);
    ring.addColorStop(0,   'rgba(255,255,255,0)');
    ring.addColorStop(.55, `rgba(255,250,235,${0.9*pulse})`);
    ring.addColorStop(.72, `rgba(255,255,255,${pulse})`);
    ring.addColorStop(.85, `rgba(255,235,200,${0.7*pulse})`);
    ring.addColorStop(1,   'rgba(255,200,140,0)');
    ctx.fillStyle=ring;
    ctx.beginPath();
    ctx.arc(cx,cy,pR*1.18,0,TAU);
    ctx.arc(cx,cy,hR*0.97,0,TAU,true);
    ctx.fill('evenodd');

    // Doppler hot-spot on the approaching side of the ring (clipped outside horizon)
    const hx=cx+dop*pR, hy=cy;
    ctx.save();
    // clip-region: everything OUTSIDE the horizon
    ctx.beginPath();
    ctx.rect(cx-bloomR, cy-bloomR, bloomR*2, bloomR*2);
    ctx.arc(cx,cy,hR,0,TAU,true);
    ctx.clip('evenodd');
    const hs=ctx.createRadialGradient(hx,hy,0,hx,hy,pR*0.9);
    hs.addColorStop(0,`rgba(255,255,255,${0.85*pulse})`);
    hs.addColorStop(.4,`rgba(220,235,255,${0.35*pulse})`);
    hs.addColorStop(1,'rgba(180,210,255,0)');
    ctx.fillStyle=hs;
    ctx.beginPath(); ctx.arc(hx,hy,pR*0.9,0,TAU); ctx.fill();
    ctx.restore();
  }

  // faint lensing light-streaks (the thin curved arcs around the disc)
  function drawLensStreaks(ctx,cx,cy,r,t){
    ctx.save();
    ctx.translate(cx,cy);
    for(let i=0;i<3;i++){
      const rr=r*(0.62+i*0.16);
      const a=0.05+0.03*Math.sin(t*0.4+i);
      ctx.strokeStyle=`rgba(220,235,255,${a})`;
      ctx.lineWidth=1.1;
      ctx.beginPath();
      ctx.ellipse(0,0,rr,rr*GEO.midScaleY*2.4,0,Math.PI*0.05,Math.PI*0.95);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0,0,rr,rr*GEO.midScaleY*2.4,0,Math.PI*1.05,Math.PI*1.95);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMotes(ctx,cx,cy,r,t){
    const inner=r*GEO.discInner, outer=r*GEO.discOuter;
    ctx.save();
    S.motes.forEach(m=>{
      const ang=m.ang+t*m.spd;
      const rad=lerp(inner,outer,m.rf);
      const x=cx+Math.cos(ang)*rad;
      const y=cy+Math.sin(ang)*rad*GEO.midScaleY;
      const tw=0.5+0.5*Math.sin(t*2.0+m.ph);
      const temp=Math.pow(1-m.rf,0.6);
      const [r2,g2,b2]=tempRgb(temp+0.2);
      const g=ctx.createRadialGradient(x,y,0,x,y,m.size*4);
      g.addColorStop(0,`rgba(${r2|0},${g2|0},${b2|0},${0.9*tw})`);
      g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,m.size*4,0,TAU); ctx.fill();
    });
    ctx.restore();
  }

  function drawStars(ctx,t){
    ctx.save();
    S.stars.forEach(s=>{
      const tw=0.6+0.4*Math.sin(t*s.freq+s.ph);
      ctx.globalAlpha=s.bri*tw*0.9;
      ctx.fillStyle=s.col;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.rad,0,TAU); ctx.fill();
    });
    ctx.globalAlpha=1; ctx.restore();
  }

  function drawDopplerWash(ctx,cx,cy,r){
    // fixed screen-space brightness gradient: approaching side glows
    const outer=r*GEO.discOuter, dop=GEO.dopplerDir;
    const g=ctx.createLinearGradient(cx-outer,cy,cx+outer,cy);
    if(dop<0){
      g.addColorStop(0,  'rgba(255,230,200,0.16)');
      g.addColorStop(.35,'rgba(255,210,170,0.05)');
      g.addColorStop(.6, 'rgba(0,0,0,0)');
      g.addColorStop(1,  'rgba(0,0,0,0)');
    } else {
      g.addColorStop(0,  'rgba(0,0,0,0)');
      g.addColorStop(.4, 'rgba(0,0,0,0)');
      g.addColorStop(.65,'rgba(255,210,170,0.05)');
      g.addColorStop(1,  'rgba(255,230,200,0.16)');
    }
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.ellipse(cx,cy,outer,outer*GEO.midScaleY*1.4,0,0,TAU); ctx.fill();
  }

  function drawVignette(ctx,W,H,cx,cy){
    const g=ctx.createRadialGradient(cx,cy,H*0.18,cx,cy,H*0.9);
    g.addColorStop(0,'rgba(0,0,0,0)');
    g.addColorStop(1,'rgba(0,2,8,0.78)');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  }

  // Subtle film grain — sparse dots only. Full-screen random putImageData with
  // 'overlay' composite reads as harsh black/white TV static at 60fps.
  function drawGrain(ctx,W,H,frame){
    if(frame%4!==0) return;
    ctx.save();
    ctx.globalAlpha=0.04;
    ctx.fillStyle='#c8d0e0';
    const n=Math.max(120, Math.round(W*H*0.00006));
    for(let i=0;i<n;i++){
      const x=(Math.random()*W)|0, y=(Math.random()*H)|0;
      ctx.fillRect(x,y,1,1);
    }
    ctx.restore();
  }

  function drawHud(ctx,cx,cy,r,t,show){
    if(!show) return;
    ctx.save(); ctx.textAlign='center';
    ctx.font='bold 19px "Courier New",monospace';
    ctx.shadowColor='#c0d8ff'; ctx.shadowBlur=14;
    ctx.fillStyle='rgba(185,215,255,0.9)';
    ctx.fillText('MERIDIAN-7', cx, cy+r*GEO.discOuter*0.62);
    ctx.shadowBlur=0;
    ctx.font='9px "Courier New",monospace';
    const stab=0.8+0.08*Math.sin(t*0.6);
    ctx.fillStyle=`rgba(0,${(200*stab)|0},${(110*stab)|0},0.72)`;
    ctx.fillText('PORTAL STABLE · ARCHITECTURE MANIFEST ONLINE', cx, cy+r*GEO.discOuter*0.62+18);
    ctx.restore();
  }

  // ════════════════════════════════════════════════════════════════════
  // MAIN
  // ════════════════════════════════════════════════════════════════════
  function drawGargantua(ctx,cx,cy,r,time,opts){
    opts=opts||{};
    const W=opts.width||ctx.canvas.width;
    const H=opts.height||ctx.canvas.height;
    const reduced=!!opts.reducedMotion;
    const show=opts.showLabel!==false;
    const deck=!!opts.deckMode;
    const landing=!!opts.landingMode&&!deck;
    const heat=(opts.heat||0)+((opts.threatLevel||0)*.35);
    P.heat=heat;
    const spinMul = opts.spinMul!==undefined ? opts.spinMul : 1;

    const rawDt=S.lastT>=0?time-S.lastT:0.016;
    const dt=clamp(rawDt>10?rawDt/1000:rawDt,0,0.1);
    S.lastT=time; S.frame++;

    if(!S.init||S.W!==W||S.H!==H) init(W,H,cx,cy,r);
    if(S.bootP<1) S.bootP=Math.min(1,S.bootP+dt*0.22);

    // differential rotation: inner spins faster than outer
    S.spinOuter += dt*0.10*spinMul*P.spin;
    S.spinInner += dt*0.22*spinMul*P.spin;

    if(!reduced && !deck) tickParts(dt);

    // ── deckMode: minimal void over existing deck layers ──────────
    if(deck){
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx,cy,r*1.2,0,TAU);
      ctx.clip();
      drawDeckHole(ctx,cx,cy,r,time,heat);
      ctx.restore();
      return;
    }

    const vMid  = GEO.midScaleY + P.tilt*0.06;
    const vHalo = GEO.haloScaleY;

    // ── CLEAR + BACKGROUND ──────────────────────────────────────
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#01040c'; ctx.fillRect(0,0,W,H);
    if(S.neb){ ctx.globalAlpha=1; ctx.drawImage(S.neb,0,0,W,H); }
    if(!reduced) drawStars(ctx,time);

    // ── LENSED HALO — TOP ARC (behind sphere) ───────────────────
    ctx.globalCompositeOperation='screen';
    discUnderglow(ctx,cx,cy,r,vHalo,'top');
    blitDisc(ctx,cx,cy,r,vHalo,S.spinOuter,'top',0.85);
    blitDisc(ctx,cx,cy,r*0.78,vHalo*1.02,S.spinInner,'top',0.6); // inner band, faster
    ctx.globalCompositeOperation='source-over';

    // ── FLAT DISC PLANE — BACK HALF (behind sphere) ─────────────
    ctx.globalCompositeOperation='screen';
    discUnderglow(ctx,cx,cy,r,vMid,'top');
    blitDisc(ctx,cx,cy,r,vMid,S.spinOuter,'full',0.95);
    blitDisc(ctx,cx,cy,r*0.78,vMid,S.spinInner,'full',0.7);
    if(!reduced) drawSmokyDust(ctx,cx,cy,r,time,vMid,'top'); // back-half wisps
    ctx.globalCompositeOperation='source-over';

    // ── EVENT HORIZON (occludes everything behind) ──────────────
    drawSphere(ctx,cx,cy,r);

    // ── PHOTON RING + EINSTEIN-RING BLOOM ───────────────────────
    ctx.globalCompositeOperation='screen';
    drawPhotonRing(ctx,cx,cy,r,time);
    ctx.globalCompositeOperation='source-over';

    // Defence-in-depth: ensure the photon ring's bloom never tints the void.
    recoverHorizon(ctx,cx,cy,r);

    // ── FLAT DISC PLANE — FRONT HALF (crosses in front of sphere) 
    ctx.globalCompositeOperation='screen';
    blitDisc(ctx,cx,cy,r,vMid,S.spinOuter,'bottom',0.95);
    blitDisc(ctx,cx,cy,r*0.78,vMid,S.spinInner,'bottom',0.7);
    discUnderglow(ctx,cx,cy,r,vMid,'bottom');
    if(!reduced) drawSmokyDust(ctx,cx,cy,r,time,vMid,'bottom'); // front-half wisps
    ctx.globalCompositeOperation='source-over';

    // ── LENSED HALO — BOTTOM ARC (in front, under sphere) ───────
    ctx.globalCompositeOperation='screen';
    discUnderglow(ctx,cx,cy,r,vHalo,'bottom');
    blitDisc(ctx,cx,cy,r,vHalo,S.spinOuter,'bottom',0.85);
    blitDisc(ctx,cx,cy,r*0.78,vHalo*1.02,S.spinInner,'bottom',0.6);
    ctx.globalCompositeOperation='source-over';

    // ── DETAIL PASSES ───────────────────────────────────────────
    ctx.globalCompositeOperation='screen';
    drawDopplerWash(ctx,cx,cy,r);
    if(!reduced) drawMotes(ctx,cx,cy,r,time);
    drawLensStreaks(ctx,cx,cy,r,time);
    if(!reduced) drawParts(ctx);
    ctx.globalCompositeOperation='source-over';

    // Final defence-in-depth on the UPPER hemisphere only — keeps the
    // canonical Interstellar look (front-half disc still wraps the lower
    // hemisphere) while guaranteeing the upper void stays pure black even
    // if a stray screen pass (Doppler wash, motes, etc.) tints across.
    recoverHorizonTop(ctx,cx,cy,r);

    // ── POST ────────────────────────────────────────────────────
    if(!landing) drawHud(ctx,cx,cy,r,time,show);
    drawVignette(ctx,W,H,cx,cy);
    if(!reduced && !landing) drawGrain(ctx,W,H,S.frame);

    // boot reveal
    if(S.bootP<1){
      ctx.save(); ctx.globalCompositeOperation='destination-in';
      const m=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*S.bootP*0.8);
      m.addColorStop(.7,'rgba(0,0,0,1)'); m.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=m; ctx.fillRect(0,0,W,H); ctx.restore();
    }
  }

  // ── public API ──────────────────────────────────────────────────────
  drawGargantua.params = P;                        // anime.js tweens this
  drawGargantua.setMouse = (x,y)=>{ S.mx=x; S.my=y; };
  drawGargantua.criticalAlert = (cx,cy)=>{ if(S.init){ burst(cx,cy,260,'#ff2d55',5,2.2); burst(cx,cy,70,'#ffffff',9,1); } };
  drawGargantua.watchlistIp   = (cx,cy)=>{ if(S.init) burst(cx,cy,70,'#00ff88',3.5,1.8); };
  drawGargantua.highAlert       = (cx,cy)=>{ if(S.init) burst(cx,cy,120,'#ff9500',3.8,1.5); };
  drawGargantua.activateNode   = ()=>{};
  drawGargantua.rebuildDisc   = ()=>{ if(S.init) buildDiscTexture(); };  // re-roll the dust
  drawGargantua._state = S;

  if(typeof module!=='undefined'&&module.exports) module.exports={drawGargantua};
  else G.drawGargantua=drawGargantua;

})(typeof globalThis!=='undefined'?globalThis:typeof window!=='undefined'?window:this);
