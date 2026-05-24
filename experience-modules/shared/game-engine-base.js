/**
 * HABIBI-SIEM — Three.js base engine: scene, camera, resize, clock, input
 */
(function (global) {
  'use strict';

  function GameEngineBase(container, opts) {
    opts = opts || {};
    this.container = container;
    this.gameId = opts.gameId || 'unknown';
    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;
    this.clock = new THREE.Clock();
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(opts.bg || 0x030a04);
    this.scene.fog = new THREE.FogExp2(opts.bg || 0x030a04, opts.fogDensity || 0.035);

    this.camera = new THREE.PerspectiveCamera(opts.fov || 60, this.width / this.height, 0.1, 200);
    this.camera.position.set(opts.camX || 0, opts.camY || 1.6, opts.camZ || 4.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr || 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.ambient = new THREE.AmbientLight(0x223344, 0.35);
    this.scene.add(this.ambient);
    this.keyLight = new THREE.DirectionalLight(0x39ff14, 0.45);
    this.keyLight.position.set(2, 4, 3);
    this.scene.add(this.keyLight);
    this.screenLight = new THREE.PointLight(0x38bdf8, 0.8, 8);
    this.screenLight.position.set(0, 1.4, 0.5);
    this.scene.add(this.screenLight);

    this._bindInput();
    this._running = false;
    this._onResize = this.resize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  GameEngineBase.prototype.resize = function () {
    if (!this.container) return;
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  GameEngineBase.prototype._bindInput = function () {
    var self = this;
    window.addEventListener('keydown', function (e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      self.keys[e.code] = true;
    });
    window.addEventListener('keyup', function (e) { self.keys[e.code] = false; });
    this.renderer.domElement.addEventListener('mousemove', function (e) {
      self.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      self.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    this.renderer.domElement.addEventListener('mousedown', function () { self.mouse.down = true; });
    window.addEventListener('mouseup', function () { self.mouse.down = false; });
  };

  GameEngineBase.prototype.updateCameraWASD = function (dt, speed) {
    speed = speed || 2.2;
    var fwd = new THREE.Vector3();
    this.camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    var right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    if (this.keys['KeyW'] || this.keys['ArrowUp']) this.camera.position.addScaledVector(fwd, speed * dt);
    if (this.keys['KeyS'] || this.keys['ArrowDown']) this.camera.position.addScaledVector(fwd, -speed * dt);
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.camera.position.addScaledVector(right, -speed * dt);
    if (this.keys['KeyD'] || this.keys['ArrowRight']) this.camera.position.addScaledVector(right, speed * dt);
    if (this.mouse.down && !this.reducedMotion) {
      this.camera.rotation.y -= this.mouse.x * 0.002;
      this.camera.rotation.x = Math.max(-0.6, Math.min(0.4, this.camera.rotation.x - this.mouse.y * 0.002));
    }
  };

  GameEngineBase.prototype.start = function (updateFn) {
    var self = this;
    this._running = true;
    function loop() {
      if (!self._running) return;
      requestAnimationFrame(loop);
      var dt = Math.min(self.clock.getDelta(), 0.05);
      if (updateFn) updateFn(dt);
      self.renderer.render(self.scene, self.camera);
    }
    loop();
  };

  GameEngineBase.prototype.stop = function () {
    this._running = false;
    window.removeEventListener('resize', this._onResize);
  };

  GameEngineBase.prototype.addFloor = function (w, h, color) {
    var geo = new THREE.PlaneGeometry(w, h);
    var mat = new THREE.MeshStandardMaterial({ color: color || 0x0a1208, roughness: 0.9 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    return mesh;
  };

  GameEngineBase.prototype.addBox = function (x, y, z, sx, sy, sz, color) {
    var mesh = new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, sz),
      new THREE.MeshStandardMaterial({ color: color || 0x1a2a1a, metalness: 0.2, roughness: 0.7 })
    );
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    return mesh;
  };

  global.HabibiGameEngine = GameEngineBase;
})(typeof window !== 'undefined' ? window : globalThis);
