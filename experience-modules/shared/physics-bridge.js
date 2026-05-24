/**
 * HABIBI-SIEM — Cannon-es physics bridge for Three.js scenes
 */
(function (global) {
  'use strict';

  var cannonPromise = null;

  function loadCannon() {
    if (global.CANNON) return Promise.resolve(global.CANNON);
    if (cannonPromise) return cannonPromise;
    cannonPromise = import('https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm').then(function (mod) {
      global.CANNON = mod;
      return mod;
    }).catch(function () {
      return null;
    });
    return cannonPromise;
  }

  function PhysicsWorld(opts) {
    this.ready = false;
    this.world = null;
    this.bodies = [];
    this.meshes = [];
    this.opts = opts || {};
    this._initPromise = this._init();
  }

  PhysicsWorld.prototype._init = function () {
    var self = this;
    return loadCannon().then(function (CANNON) {
      if (!CANNON) return false;
      self.world = new CANNON.World();
      self.world.gravity.set(0, -9.82, 0);
      self.world.broadphase = new CANNON.NaiveBroadphase();
      self.world.solver.iterations = 8;
      var ground = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
      ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
      self.world.addBody(ground);
      self.ready = true;
      return true;
    });
  };

  PhysicsWorld.prototype.addBox = function (mesh, mass, size) {
    if (!this.ready || !global.CANNON) return null;
    var CANNON = global.CANNON;
    var sx = size && size.x ? size.x : (mesh.geometry.parameters.width || 1);
    var sy = size && size.y ? size.y : (mesh.geometry.parameters.height || 1);
    var sz = size && size.z ? size.z : (mesh.geometry.parameters.depth || 1);
    var shape = new CANNON.Box(new CANNON.Vec3(sx / 2, sy / 2, sz / 2));
    var body = new CANNON.Body({ mass: mass == null ? 1 : mass });
    body.addShape(shape);
    body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
    this.world.addBody(body);
    mesh.userData.physicsBody = body;
    this.bodies.push(body);
    this.meshes.push(mesh);
    return body;
  };

  PhysicsWorld.prototype.addSphere = function (mesh, mass, radius) {
    if (!this.ready || !global.CANNON) return null;
    var CANNON = global.CANNON;
    var r = radius || (mesh.geometry.parameters.radius || 0.5);
    var shape = new CANNON.Sphere(r);
    var body = new CANNON.Body({ mass: mass == null ? 0.5 : mass });
    body.addShape(shape);
    body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
    this.world.addBody(body);
    mesh.userData.physicsBody = body;
    this.bodies.push(body);
    this.meshes.push(mesh);
    return body;
  };

  PhysicsWorld.prototype.step = function (dt) {
    if (!this.ready || !this.world) return;
    this.world.step(1 / 60, dt, 3);
    for (var i = 0; i < this.meshes.length; i++) {
      var mesh = this.meshes[i];
      var body = mesh.userData.physicsBody;
      if (!body) continue;
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    }
  };

  PhysicsWorld.prototype.clearDynamic = function () {
    if (!this.world || !global.CANNON) return;
    var CANNON = global.CANNON;
    var self = this;
    this.bodies.slice().forEach(function (body) {
      if (body.mass > 0) self.world.removeBody(body);
    });
    this.bodies = this.bodies.filter(function (b) { return b.mass === 0; });
    this.meshes = this.meshes.filter(function (m) {
      if (m.userData.physicsBody && m.userData.physicsBody.mass > 0) {
        delete m.userData.physicsBody;
        return false;
      }
      return true;
    });
  };

  PhysicsWorld.prototype.applyImpulse = function (mesh, fx, fy, fz) {
    var body = mesh && mesh.userData.physicsBody;
    if (body) body.applyImpulse(new global.CANNON.Vec3(fx, fy, fz));
  };

  global.HabibiPhysics = {
    loadCannon: loadCannon,
    PhysicsWorld: PhysicsWorld
  };
})(typeof window !== 'undefined' ? window : globalThis);
