/**
 * Photorealistic black hole — Three.js + GLSL (vanilla GLSL black-hole shader)
 * Meridian-7 landing hero only. Observation deck unchanged.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const CFG = {
  canvasScale: 0.58,
  eventHorizonRadius: 0.28,
  discInnerRadius: 0.35,
  discOuterRadius: 0.92,
  discTiltDegrees: 20,
  lensingRadius: 0.58,
  dopplerStrength: 0.85,
  dopplerAngle: Math.PI,
  brightSideMultiplier: 3.2,
  dimSideMultiplier: 0.25,
  photonRingPulsePeriod: 3.0,
  ambientGlowPeriod: 20.0,
  diskScrollPeriod: 8.0,
  bloomThreshold: 0.62,
  bloomStrength: 1.15,
  bloomRadius: 0.45,
  parallaxStarSpeed: 1.0,
  parallaxDiskSpeed: 0.3,
  parallaxHorizonSpeed: 0.05,
  starCount: 900,
};

const DISC_VERT = /* glsl */`
  varying vec2 vUv;
  varying float vDoppler;
  uniform float uTime;
  uniform float uDopplerStrength;
  uniform float uDopplerAngle;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float angle = atan(pos.x, pos.z);
    float relAngle = angle - uDopplerAngle;
    float cosA = cos(relAngle);
    float r = length(vec2(pos.x, pos.z));
    float orbitalV = 0.55 / sqrt(max(r, 0.001));
    vDoppler = cosA * orbitalV * uDopplerStrength;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const DISC_FRAG = /* glsl */`
  varying vec2 vUv;
  varying float vDoppler;
  uniform float uTime;
  uniform float uInnerRadius;
  uniform float uOuterRadius;
  uniform float uBrightMult;
  uniform float uDimMult;
  uniform float uScrollPeriod;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  vec3 tempToColor(float t) {
    vec3 a = vec3(1.0, 0.3, 0.05);
    vec3 b = vec3(1.0, 0.65, 0.2);
    vec3 c = vec3(1.0, 0.95, 0.7);
    vec3 d = vec3(0.85, 0.92, 1.0);
    if (t < 0.33) return mix(a, b, t / 0.33);
    if (t < 0.66) return mix(b, c, (t - 0.33) / 0.33);
    return mix(c, d, (t - 0.66) / 0.34);
  }

  void main() {
    float r = vUv.x;
    if (r < 0.001 || r > 0.999) { gl_FragColor = vec4(0.0); return; }

    float scroll = uTime / uScrollPeriod;
    vec2 nCoord = vec2(r * 6.0 - scroll, vUv.y * 3.14159 * 2.0);
    float n = noise(nCoord * 3.0) * 0.5 + noise(nCoord * 7.0) * 0.3 + noise(nCoord * 13.0) * 0.2;

    float temp = 1.0 - pow(r, 0.6);
    vec3 col = tempToColor(temp);

    float dShift = vDoppler;
    col.r += dShift < 0.0 ? -dShift * 0.6 : 0.0;
    col.b += dShift > 0.0 ?  dShift * 0.6 : 0.0;

    float beamMult = dShift > 0.0 ? uBrightMult : uDimMult;
    float baseBright = (0.6 + n * 0.4) * (1.0 - pow(r, 2.0)) * 1.8;
    float bright = baseBright * mix(1.0, beamMult, abs(dShift));

    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float hsAngle = fi * 1.5708 + uTime * (0.4 + fi * 0.07);
      float hsR = 0.18 + fi * 0.12;
      float angDiff = abs(mod(vUv.y * 6.283 - hsAngle + 3.14159, 6.283) - 3.14159);
      float rDiff = abs(r - hsR);
      float spot = exp(-angDiff * 8.0) * exp(-rDiff * 20.0);
      bright += spot * 2.5;
      col = mix(col, vec3(1.0, 0.9, 0.7), spot * 0.6);
    }

    float alpha = clamp(bright * 0.8, 0.0, 1.0) * (1.0 - pow(r, 3.0)) * 0.92;
    gl_FragColor = vec4(col * bright, alpha);
  }
`;

const HORIZON_FRAG = /* glsl */`
  varying vec2 vUv;
  uniform float uTime;
  uniform float uPulsePeriod;

  void main() {
    vec2 c = vUv - 0.5;
    float d = length(c);
    if (d > 0.5) { gl_FragColor = vec4(0.0); return; }

    float ring = smoothstep(0.47, 0.495, d) * (1.0 - smoothstep(0.495, 0.50, d));
    float pulse = 0.7 + 0.3 * sin(uTime * 6.2832 / uPulsePeriod);
    vec3 ringCol = vec3(1.0, 0.94, 0.86) * pulse;

    gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), vec4(ringCol, 0.9), ring);
  }
`;

const HORIZON_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * @param {HTMLElement} container
 * @param {{ width?: number, height?: number, reducedMotion?: boolean }} opts
 */
export function mountBlackHole(container, opts) {
  opts = opts || {};
  const reduced = !!opts.reducedMotion;
  let width = opts.width || container.clientWidth || innerWidth;
  let height = opts.height || container.clientHeight || innerHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const root = new THREE.Group();
  scene.add(root);

  const scale = (Math.min(width, height) / 500) * CFG.canvasScale;
  root.scale.setScalar(scale);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0.6, 2.8);
  camera.lookAt(0, 0, 0);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    CFG.bloomStrength,
    CFG.bloomRadius,
    CFG.bloomThreshold
  );
  composer.addPass(bloom);

  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(CFG.starCount * 3);
  for (let i = 0; i < CFG.starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 3.5 + Math.random() * 1.5;
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i * 3 + 2] = r * Math.cos(phi);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.012, sizeAttenuation: true })
  );
  root.add(stars);

  const lensGeo = new THREE.RingGeometry(CFG.lensingRadius, CFG.lensingRadius + 0.07, 128);
  const lensMat = new THREE.MeshBasicMaterial({
    color: 0xfff0e0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.18,
  });
  root.add(new THREE.Mesh(lensGeo, lensMat));

  const lensLow = new THREE.Mesh(lensGeo, lensMat.clone());
  lensLow.rotation.x = Math.PI * 0.08;
  lensLow.position.y = -CFG.lensingRadius * 0.14;
  root.add(lensLow);

  const discGeo = new THREE.RingGeometry(CFG.discInnerRadius, CFG.discOuterRadius, 256, 64);
  const uvAttr = discGeo.attributes.uv;
  const posAttr = discGeo.attributes.position;
  for (let i = 0; i < uvAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const r = Math.sqrt(x * x + z * z);
    const normalized = (r - CFG.discInnerRadius) / (CFG.discOuterRadius - CFG.discInnerRadius);
    uvAttr.setX(i, normalized);
    uvAttr.setY(i, Math.atan2(x, z) / (Math.PI * 2) + 0.5);
  }
  uvAttr.needsUpdate = true;

  const discMat = new THREE.ShaderMaterial({
    vertexShader: DISC_VERT,
    fragmentShader: DISC_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uInnerRadius: { value: CFG.discInnerRadius },
      uOuterRadius: { value: CFG.discOuterRadius },
      uDopplerStrength: { value: CFG.dopplerStrength },
      uDopplerAngle: { value: CFG.dopplerAngle },
      uBrightMult: { value: CFG.brightSideMultiplier },
      uDimMult: { value: CFG.dimSideMultiplier },
      uScrollPeriod: { value: CFG.diskScrollPeriod },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const disc = new THREE.Mesh(discGeo, discMat);
  disc.rotation.x = THREE.MathUtils.degToRad(CFG.discTiltDegrees);
  root.add(disc);

  const horizonGeo = new THREE.PlaneGeometry(
    CFG.eventHorizonRadius * 2.1,
    CFG.eventHorizonRadius * 2.1
  );
  const horizonMat = new THREE.ShaderMaterial({
    vertexShader: HORIZON_VERT,
    fragmentShader: HORIZON_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uPulsePeriod: { value: CFG.photonRingPulsePeriod },
    },
    transparent: true,
    depthWrite: false,
  });
  const horizon = new THREE.Mesh(horizonGeo, horizonMat);
  horizon.renderOrder = 10;
  root.add(horizon);

  function makeJet(yDir) {
    const jetGeo = new THREE.CylinderGeometry(0.01, 0.06, 1.4, 12, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({
      color: 0x88bbff,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const jet = new THREE.Mesh(jetGeo, jetMat);
    jet.position.y = yDir * 0.75;
    root.add(jet);
    return jet;
  }
  const jetUp = makeJet(+1);
  const jetDown = makeJet(-1);

  const glowGeo = new THREE.SphereGeometry(CFG.eventHorizonRadius * 1.35, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.04,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  root.add(glow);

  let mouseX = 0;
  let mouseY = 0;
  function onMouse(e) {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }
  window.addEventListener('mousemove', onMouse);

  const clock = new THREE.Clock();
  let animId = 0;
  let running = true;

  function animate() {
    if (!running) return;
    animId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    discMat.uniforms.uTime.value = t;
    horizonMat.uniforms.uTime.value = t;

    if (!reduced) {
      stars.rotation.y = mouseX * CFG.parallaxStarSpeed * 0.04;
      stars.rotation.x = mouseY * CFG.parallaxStarSpeed * 0.02;
      disc.rotation.z = mouseX * CFG.parallaxDiskSpeed * 0.03;
      horizon.rotation.z = mouseX * CFG.parallaxHorizonSpeed * 0.015;
      glowMat.opacity = 0.03 + 0.015 * Math.sin(t * Math.PI * 2 / CFG.ambientGlowPeriod);
      jetUp.material.opacity = 0.08 + 0.04 * Math.sin(t * 2.3);
      jetDown.material.opacity = 0.08 + 0.04 * Math.sin(t * 2.3 + Math.PI);
    }

    composer.render();
  }
  animate();

  function resize(w, h) {
    width = w;
    height = h;
    renderer.setSize(w, h);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    bloom.resolution.set(w, h);
    const s = (Math.min(w, h) / 500) * CFG.canvasScale;
    root.scale.setScalar(s);
  }

  function dispose() {
    running = false;
    cancelAnimationFrame(animId);
    window.removeEventListener('mousemove', onMouse);
    renderer.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  }

  return { resize, dispose };
}
