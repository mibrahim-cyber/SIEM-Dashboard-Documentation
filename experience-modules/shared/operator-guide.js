(function (global) {
'use strict';




/* ─── Dialogue scripts ───────────────────────────────────────────────── */
var OPERATOR_STORYLINE = {
  'index': {
    enter: [
      "You have arrived at HABIBI-SIEM. I'm OPERATOR, your operations guide.",
      "Operation MERIDIAN-7 — thirteen trials, one breach, one story.",
      "Click the button below when you're ready to begin your investigation."
    ],
    tips: [
      "Each module unlocks the next in sequence.",
      "Complete all 13 to unlock your Analyst Debrief Report."
    ],
    nextAction: { label: "Begin Operation MERIDIAN-7", url: "experience-modules/game1-terminal/index.html" }
  },
  'game1-terminal': {
    enter: [
      "The Terminal. Where all analysts begin.",
      "Type commands. The system responds. Learn to read what it tells you.",
      "This is reconnaissance — the first phase of every investigation.",
      "Complete all 5 levels to continue."
    ],
    level1: ["Level 1. Basic commands. Type: ls, then pwd, whoami, date, echo hello."],
    level2: ["Chain commands. find . -name '*.log' -mmin -60"],
    level3: ["grep 192.168.1.100 auth.log — watch the load bar."],
    level4: ["grep ACCESS, CMD, MODIFY, NET — rebuild the timeline."],
    level5: ["Epilogue. Your choices carry forward to The Breach."],
    complete: ["The Breach is next. An incident is already in progress."],
    nextAction: { label: "Enter The Breach", url: "experience-modules/game2-breach/index.html" }
  },
  'game2-breach': {
    enter: [
      "The Breach. Alerts incoming. SQL injection. Brute force. Lateral movement.",
      "Triage correctly. Alert the right team.",
      "Your Terminal report already told me your approach."
    ],
    level1: ["SQL injection from 185.193.88.14. BLOCK IP first, then ALERT DEV."],
    level2: ["Five alerts. Five minutes. Match each alert to the correct playbook action."],
    level3: ["INVESTIGATE LOGS before BLOCK IP. Sequence matters."],
    level4: ["LOCKBIT-3 ransomware. Patient zero first, then contain, then escalate."],
    complete: ["Contained. The Ghost Network holds the lateral movement evidence."],
    nextAction: { label: "Enter The Ghost Network", url: "experience-modules/game3-network/index.html" }
  },
  'game3-network': {
    enter: ["The Ghost Network. Click nodes. Trace lateral movement."],
    level1: ["Find DC-01. The Domain Controller."],
    level2: ["Flag anomalous RDP from WS-003 to DC-01."],
    level3: ["Attacker enumerates. Next target: DB-01."],
    level4: ["C2 beats every 10 seconds. Find the pulse."],
    complete: ["The network told you everything. The Cipher is next."],
    nextAction: { label: "Enter The Cipher", url: "experience-modules/game4-cipher/index.html" }
  },
  'game4-cipher': {
    enter: ["The Cipher. Caesar. Substitution. Enigma. RSA."],
    level1: ["URYYB JBEYQ. Shift 13."],
    level2: ["Frequency analysis. E dominates English."],
    level3: ["Enigma rotors. Find the combination."],
    level4: ["RSA N=3233. Factor it."],
    complete: ["You can read their traffic. The Simulation shows the full kill chain."],
    nextAction: { label: "Enter The Simulation", url: "experience-modules/game5-simulation/index.html" }
  },
  'game5-simulation': {
    enter: ["The Simulation. Full MITRE kill chain."],
    level1: ["Reconnaissance detected. Block or segment."],
    level2: ["Phishing delivery. Choose your control."],
    level3: ["CVE-2024-1234 exploitation window."],
    level4: ["C2 and lateral movement. Stop both if you can."],
    complete: ["The Interrogation Room holds the decoded commands."],
    nextAction: { label: "Enter The Interrogation Room", url: "experience-modules/game6-intercept/index.html" }
  },
  'game6-intercept': {
    enter: ["The Interrogation Room. Decode C2. Extract IOCs."],
    complete: ["Playbook exposed. The Forge awaits."],
    nextAction: { label: "Enter The Forge", url: "experience-modules/game7-forge/index.html" }
  },
  'game7-forge': {
    enter: ["The Forge. Write detection rules. Catch malicious. Ignore benign."],
    complete: ["Rules written. Test them in The Deep Archive."],
    nextAction: { label: "Enter The Deep Archive", url: "experience-modules/game8-archive/index.html" }
  },
  'game8-archive': {
    enter: ["The Deep Archive. Sort logs. Reconstruct the timeline."],
    complete: ["Timeline complete. See the attack from the other side — The Heist."],
    nextAction: { label: "Enter The Heist", url: "experience-modules/game9-heist/index.html" }
  },
  'game9-heist': {
    enter: ["The Heist. Plan the attack path. Fewest hops. Least monitored."],
    complete: ["Both sides seen. Analyse the malware in The Lab."],
    nextAction: { label: "Enter The Lab", url: "experience-modules/game10-lab/index.html" }
  },
  'game10-lab': {
    enter: ["The Lab. Static analysis. Dynamic behaviour. Extract IOCs."],
    complete: ["Sample profiled. Cartography shows attribution."],
    nextAction: { label: "Enter The Cartography", url: "experience-modules/game11-cartography/index.html" }
  },
  'game11-cartography': {
    enter: ["The Cartography. Attribute the actor. Click the origin region."],
    complete: ["Attribution filed. The Memorial documents the lesson."],
    nextAction: { label: "Enter The Memorial", url: "experience-modules/game12-memorial/index.html" }
  },
  'game12-memorial': {
    enter: ["The Memorial. Root cause. Remediation. Document it."],
    complete: ["One trial remains. The Resonance."],
    nextAction: { label: "Enter The Resonance", url: "experience-modules/game13-resonance/index.html" }
  },
  'game13-resonance': {
    enter: ["The Resonance. Tune thresholds. Maximise signal."],
    complete: [
      "All 13 trials complete.",
      "You traced MERIDIAN-7 from first alert to attribution.",
      "Your Debrief Report is ready."
    ],
    nextAction: { label: "View Debrief Report", url: "debrief.html" }
  },
  'terminal':    { enter: ["Classic terminal experience."], nextAction: { label: "3D Terminal", url: "experience-modules/game1-terminal/index.html" } },
  'breach':      { enter: ["Classic breach sim."], nextAction: { label: "3D Breach", url: "experience-modules/game2-breach/index.html" } },
  'network':     { enter: ["Ghost Network classic view."], nextAction: { label: "3D Network", url: "experience-modules/game3-network/index.html" } },
  'cipher':      { enter: ["Cipher vault classic."], nextAction: { label: "3D Cipher", url: "experience-modules/game4-cipher/index.html" } },
  'sim':         { enter: ["Kill chain classic sim."], nextAction: { label: "3D Simulation", url: "experience-modules/game5-simulation/index.html" } },
  'intercept':   { enter: ["Intercept room classic."], nextAction: { label: "3D Interrogation", url: "experience-modules/game6-intercept/index.html" } },
  'forge':       { enter: ["Rule forge classic."], nextAction: { label: "3D Forge", url: "experience-modules/game7-forge/index.html" } },
  'archive':     { enter: ["Deep archive classic."], nextAction: { label: "3D Archive", url: "experience-modules/game8-archive/index.html" } },
  'heist':       { enter: ["Heist classic."], nextAction: { label: "3D Heist", url: "experience-modules/game9-heist/index.html" } },
  'lab':         { enter: ["Detection lab classic."], nextAction: { label: "3D Lab", url: "experience-modules/game10-lab/index.html" } },
  'cartography': { enter: ["Threat globe classic."], nextAction: { label: "3D Cartography", url: "experience-modules/game11-cartography/index.html" } },
  'memorial':    { enter: ["Memorial classic."], nextAction: { label: "3D Memorial", url: "experience-modules/game12-memorial/index.html" } },
  'resonance':   { enter: ["Resonance classic."], nextAction: { label: "3D Resonance", url: "experience-modules/game13-resonance/index.html" } },
  'debrief':     { enter: ["Operation MERIDIAN-7 debrief. Your analyst report."], nextAction: { label: "Return to Hub", url: "index.html" } }
};

var RECRUITER_SCRIPT = [
  "I'm OPERATOR. 90-second overview.",
  "HABIBI-SIEM is a Security Operations Centre simulator built entirely in-browser.",
  "13 games. Each teaches one phase of real SOC work — from log analysis to malware sandboxing.",
  "Built with Three.js, Cannon-es physics, and a shared progression engine.",
  "Game 1: The Terminal. CLI threat reconnaissance. MITRE T1059.",
  "Game 2: The Breach. Incident response triage. NIST RS.RP-1.",
  "Game 6: The Interrogation Room. C2 communication decoding. MITRE T1071.",
  "Game 7: The Forge. Detection rule engineering. SIGMA and YARA.",
  "Game 11: The Cartography. Threat actor attribution. MITRE Groups.",
  "The 13 games span all 5 NIST CSF functions: Identify, Protect, Detect, Respond, Recover.",
  "The detection engine in the companion dashboard maps to STRIDE and MITRE ATT&CK.",
  "28 modules. 245 guides. One connected investigation across 13 playable experiences.",
  "That's HABIBI-SIEM."
];

/* ─── OperatorSprite (SVG + CSS animations) ──────────────────────────────── */
function OperatorSprite(container) {
  this.container = container;
  this.currentAnimation = 'idle';
  this.guide = null;
  this._animTimer = null;
  this._ensureStyles();
  this._buildSVG();
}

OperatorSprite.prototype._ensureStyles = function () {
  if (document.getElementById('operator-svg-styles')) return;
  var s = document.createElement('style');
  s.id = 'operator-svg-styles';
  s.textContent =
    '@keyframes dioBreath{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.014)}}' +
    '@keyframes dioMouthPulse{0%,49%{opacity:1}50%,100%{opacity:0}}' +
    '@keyframes dioArmRaise{0%{transform:rotate(0deg)}35%{transform:rotate(-100deg)}70%{transform:rotate(-100deg)}100%{transform:rotate(0deg)}}' +
    '@keyframes dioDodge{0%{transform:rotate(0deg) scaleX(1)}25%{transform:rotate(14deg) scaleX(0.86)}55%{transform:rotate(-7deg) scaleX(1.09)}82%{transform:rotate(2deg) scaleX(0.99)}100%{transform:rotate(0deg) scaleX(1)}}' +
    '@keyframes dioZaWarudo{0%{filter:none}15%{filter:drop-shadow(0 0 10px #CC66FF) drop-shadow(0 0 22px #8800FF) brightness(1.6)}32%{filter:none}55%{filter:drop-shadow(0 0 6px #CC66FF) brightness(1.2)}70%{filter:drop-shadow(0 0 15px #FF88FF) drop-shadow(0 0 30px #AA00FF) brightness(1.9)}86%{filter:none}100%{filter:drop-shadow(0 0 4px #CC66FF)}}' +
    '#operator-svg-char.operator-idle{animation:dioBreath 3s ease-in-out infinite;transform-origin:50px 85px}' +
    '#operator-svg-char.operator-talk #operator-mouth-open{opacity:1;animation:dioMouthPulse 0.4s steps(1) infinite}' +
    '#operator-svg-char.operator-talk #operator-mouth-c{opacity:0}' +
    '#operator-svg-char.operator-point #operator-right-arm{transform-origin:78px 99px;animation:dioArmRaise 1.2s ease-in-out forwards}' +
    '#operator-svg-char.operator-dodge{animation:dioDodge 0.4s ease-out forwards;transform-origin:50px 86px}' +
    '#operator-svg-char.operator-zawarudo{animation:dioZaWarudo 1.6s ease-out forwards}';
  document.head.appendChild(s);
};

OperatorSprite.prototype._buildSVG = function () {
  var ns = 'http://www.w3.org/2000/svg';
  this.svg = document.createElementNS(ns, 'svg');
  this.svg.setAttribute('viewBox', '0 0 100 170');
  this.svg.setAttribute('width', '100');
  this.svg.setAttribute('height', '170');
  this.svg.id = 'operator-svg-char';
  this.svg.innerHTML =
    '<defs><linearGradient id="op-grad" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#38bdf8"/>' +
    '</linearGradient></defs>' +
    '<circle cx="50" cy="86" r="46" fill="#38bdf8" opacity="0.06"/>' +
    '<circle cx="50" cy="86" r="36" fill="#38bdf8" opacity="0.05"/>' +
    '<path d="M50 42 L84 60 V98 C84 119 69 131 50 137 C31 131 16 119 16 98 V60 Z" fill="rgba(8,16,30,0.88)" stroke="url(#op-grad)" stroke-width="2.5"/>' +
    '<path d="M37 88 l9 9 l17 -21" fill="none" stroke="url(#op-grad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="50" cy="62" r="2.6" fill="#7dd3fc"/>';
  this.container.appendChild(this.svg);
  this.playAnimation('idle');
};

OperatorSprite.prototype.playAnimation = function (name) {
  if (this.currentAnimation === name && (name === 'idle' || name === 'hover')) return;
  this.currentAnimation = name;
  if (this._animTimer) { clearTimeout(this._animTimer); this._animTimer = null; }
  this.svg.classList.remove('operator-idle', 'operator-talk', 'operator-point', 'operator-dodge', 'operator-zawarudo');
  var MAP = {
    idle: 'operator-idle', hover: 'operator-idle', walk: 'operator-idle',
    talk: 'operator-talk', point: 'operator-point', dodge: 'operator-dodge', za_warudo: 'operator-zawarudo'
  };
  this.svg.classList.add(MAP[name] || 'operator-idle');
  var DURATIONS = { point: 1250, dodge: 430, za_warudo: 1700 };
  if (DURATIONS[name]) {
    var self = this;
    this._animTimer = setTimeout(function () {
      self._animTimer = null;
      if (self.currentAnimation === name) self.onAnimationComplete(name);
    }, DURATIONS[name]);
  }
};

OperatorSprite.prototype.update = function () { /* CSS drives animation */ };
OperatorSprite.prototype.drawFrame = function () { /* no-op */ };

OperatorSprite.prototype.onAnimationComplete = function (animName) {
  if (animName === 'point' || animName === 'talk') this.playAnimation('idle');
  if (animName === 'za_warudo') this.playAnimation('idle');
  if (animName === 'dodge' && this.guide) this.guide.onDodgeComplete();
};

/* ─── OperatorGuide ───────────────────────────────────────────────────────── */
function OperatorGuide() {
  this.container = null;
  this.canvas = null;
  this.speechBubble = null;
  this.speechText = null;
  this.sprite = null;
  this.x = window.innerWidth * 0.85;
  this.y = window.innerHeight * 0.6;
  this.isDodging = false;
  this.isVisible = true;
  this.dialogueQueue = [];
  this.lastMouseX = 0;
  this.lastMouseY = 0;
  this.floatOffset = 0;
  this.floatDir = 1;
  this.storylinePosition = null;
  this.animFrame = null;
  this.autoAdvanceTimer = null;
  this.recruiterMode = false;
  this.recruiterIndex = 0;
  this.recruiterStart = 0;
  this.levelTrackInterval = null;
  this.lastLevel = null;
  this.gameCompleteShown = false;
  this.pendingAction = null;
  this.isLanding = false;
  this.landingFloat = 0;
  this.panelClickActive = false;
}

OperatorGuide.prototype.init = function () {
  var params = new URLSearchParams(window.location.search);
  this.recruiterMode = params.get('recruiter') === 'true';
  this.buildDOM();
  this.bindEvents();
  this.detectCurrentPage();
  this.initLevelTracking();
  if (this.recruiterMode) this.startRecruiterTour();
  this.startLoop();
  var self = this;
  window.addEventListener('habibi-game-complete', function (e) {
    if (e.detail && e.detail.gameId) self.onGameComplete(e.detail.gameId);
  });
  window.addEventListener('resize', function () { if (!self.isDodging) self.applyLayout(); });
};

OperatorGuide.prototype.buildDOM = function () {
  this.container = document.createElement('div');
  this.container.id = 'operator-guide';
  this.panel = document.createElement('div');
  this.panel.className = 'operator-panel';
  this.speechBubble = document.createElement('div');
  this.speechBubble.id = 'operator-speech';
  this.speechText = document.createElement('div');
  this.speechText.id = 'operator-speech-text';
  this.actionSlot = document.createElement('div');
  this.actionSlot.id = 'operator-actions';
  this.actionSlot.className = 'operator-actions';
  var name = document.createElement('div');
  name.className = 'operator-speaker-name';
  name.textContent = 'OPERATOR';
  var subtitle = document.createElement('div');
  subtitle.className = 'operator-speaker-sub';
  subtitle.textContent = 'Operations Guide · MERIDIAN-7';
  var tail = document.createElement('div');
  tail.className = 'operator-speech-tail';
  this.avatarWrap = document.createElement('div');
  this.avatarWrap.className = 'operator-avatar';
  this.speechBubble.appendChild(name);
  this.speechBubble.appendChild(subtitle);
  this.speechBubble.appendChild(this.speechText);
  this.speechBubble.appendChild(this.actionSlot);
  this.speechBubble.appendChild(tail);
  this.panel.appendChild(this.speechBubble);
  this.panel.appendChild(this.avatarWrap);
  this.container.appendChild(this.panel);
  document.body.appendChild(this.container);
  this.sprite = new OperatorSprite(this.avatarWrap);
  this.sprite.guide = this;
  this.applyLayout();
};

OperatorGuide.prototype.bindEvents = function () {
  var self = this;
  this.panel.addEventListener('mousedown', function () { self.panelClickActive = true; });
  document.addEventListener('mouseup', function () { self.panelClickActive = false; });
  this.panel.addEventListener('click', function (e) {
    if (e.target.closest('#operator-next-btn')) return;
    if (!self.isDodging && !self.recruiterMode) self.advanceDialogue();
  });
  document.addEventListener('mousemove', function (e) {
    self.lastMouseX = e.clientX;
    self.lastMouseY = e.clientY;
    if (!self.panelClickActive) self.checkHoverDistance();
  });
};

OperatorGuide.prototype.applyLayout = function () {
  if (this.isLanding) {
    this.container.classList.add('operator-landing');
    this.container.style.left = '50%';
    this.container.style.right = 'auto';
    this.container.style.top = 'auto';
    this.container.style.bottom = '48px';
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight - 200;
    return;
  }
  this.container.classList.remove('operator-landing');
  this.x = Math.min(window.innerWidth - 420, Math.max(16, window.innerWidth * 0.62));
  this.y = Math.max(80, window.innerHeight - 220);
  this.container.style.left = this.x + 'px';
  this.container.style.top = this.y + 'px';
  this.container.style.bottom = 'auto';
  this.container.style.right = 'auto';
};

OperatorGuide.prototype.checkHoverDistance = function () {
  if (this.isDodging || this.recruiterMode || this.isLanding) return;
  var rect = this.avatarWrap.getBoundingClientRect();
  var cx = rect.left + rect.width / 2;
  var cy = rect.top + rect.height / 2;
  var dist = Math.hypot(this.lastMouseX - cx, this.lastMouseY - cy);
  if (dist < 60) this.dodge();
};

OperatorGuide.prototype.dodge = function () {
  var self = this;
  this.isDodging = true;
  this.sprite.playAnimation('dodge');
  var corners = [
    { x: 40, y: 40 },
    { x: window.innerWidth - 160, y: 40 },
    { x: 40, y: window.innerHeight - 240 },
    { x: window.innerWidth - 160, y: window.innerHeight - 240 }
  ];
  var best = corners[0];
  var bestDist = -1;
  corners.forEach(function (c) {
    var d = Math.hypot(c.x - self.lastMouseX, c.y - self.lastMouseY);
    if (d > bestDist) { bestDist = d; best = c; }
  });
  var startX = this.x, startY = this.y, startTime = performance.now();
  var moveInterval = setInterval(function () {
    var t = Math.min((performance.now() - startTime) / 400, 1);
    var eased = 1 - Math.pow(1 - t, 3);
    self.x = startX + (best.x - startX) * eased;
    self.y = startY + (best.y - startY) * eased;
    self.updatePosition();
    if (t >= 1) { clearInterval(moveInterval); self.onDodgeComplete(); }
  }, 16);
};

OperatorGuide.prototype.onDodgeComplete = function () {
  var self = this;
  this.sprite.playAnimation('idle');
  setTimeout(function () { self.isDodging = false; }, 500);
};

OperatorGuide.prototype.startLoop = function () {
  var self = this;
  var lastTime = performance.now();
  function loop(now) {
    var dt = now - lastTime;
    lastTime = now;
    self.floatOffset += self.floatDir * dt * 0.04;
    if (Math.abs(self.floatOffset) > 6) self.floatDir *= -1;
    var floatY = self.floatOffset;
    if (self.isLanding) {
      self.container.style.transform = 'translateX(-50%) translateY(' + floatY + 'px)';
    } else {
      self.container.style.transform = 'translateY(' + floatY + 'px)';
    }
    self.sprite.update(dt);
    self.animFrame = requestAnimationFrame(loop);
  }
  self.animFrame = requestAnimationFrame(loop);
};

OperatorGuide.prototype.updatePosition = function () {
  if (!this.isLanding) {
    this.container.style.left = this.x + 'px';
    this.container.style.top = this.y + 'px';
  }
};

OperatorGuide.prototype.resolvePageKey = function () {
  if (document.body.classList.contains('landing-operator-mode')) return 'index';
  var path = window.location.pathname;
  var parts = path.split('/').filter(Boolean);
  var filename = (parts[parts.length - 1] || 'index').replace('.html', '');
  var pageMap = {
    index: 'index', terminal: 'terminal', breach: 'breach', network: 'network',
    cipher: 'cipher', sim: 'sim', intercept: 'intercept', forge: 'forge',
    archive: 'archive', heist: 'heist', lab: 'lab', cartography: 'cartography',
    memorial: 'memorial', resonance: 'resonance', debrief: 'debrief', read: 'read'
  };
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].indexOf('game') === 0 && parts[i].indexOf('-') > 0) return parts[i];
  }
  if (pageMap[filename]) return pageMap[filename];
  if (filename === 'index' || filename === '') return 'index';
  if (/\/index\.html$/i.test(path) || path === '/' || /\/$/.test(path)) return 'index';
  if (!/\.html$/i.test(path) && !pageMap[filename]) return 'index';
  return filename || 'index';
};

OperatorGuide.prototype.detectCurrentPage = function () {
  this.storylinePosition = this.resolvePageKey();
  this.isLanding = this.storylinePosition === 'index' && !this.recruiterMode;
  this.applyLayout();
  if (OPERATOR_STORYLINE[this.storylinePosition]) {
    var script = OPERATOR_STORYLINE[this.storylinePosition];
    if (script.nextAction) this.pendingAction = script.nextAction;
    if (this.isLanding && script.nextAction) this.showNextActionButton(script.nextAction);
    if (script.enter && !this.recruiterMode) {
      var lines = script.enter.slice();
      if (window.HabibiNarrative) {
        var ctxMap = {
          'game2-breach': 'the_breach', 'game3-network': 'the_ghost_network',
          'game4-cipher': 'the_cipher', 'game5-simulation': 'the_simulation',
          'game6-intercept': 'the_interrogation_room', 'game7-forge': 'the_forge',
          'game8-archive': 'the_deep_archive', 'game9-heist': 'the_heist',
          'game10-lab': 'the_lab', 'game11-cartography': 'the_cartography',
          'game12-memorial': 'the_memorial', 'game13-resonance': 'the_resonance'
        };
        var ctxId = ctxMap[this.storylinePosition];
        if (ctxId) {
          var ctxLine = HabibiNarrative.getContextForGame(ctxId);
          if (ctxLine) lines.unshift(ctxLine);
        }
      }
      this.queueDialogue(lines);
    } else if (script.nextAction && !this.recruiterMode) {
      this.showNextActionButton(script.nextAction);
    }
  }
};

OperatorGuide.prototype.queueDialogue = function (lines) {
  this.dialogueQueue = lines.slice();
  this.advanceDialogue();
};

OperatorGuide.prototype.advanceDialogue = function () {
  var self = this;
  if (this.dialogueQueue.length === 0) {
    this.sprite.playAnimation('idle');
    if (this.pendingAction) this.showNextActionButton(this.pendingAction);
    return;
  }
  var line = this.dialogueQueue.shift();
  this.showSpeechBubble(line);
  this.sprite.playAnimation('talk');
  var readTime = Math.min(Math.max(line.length * 60, 2000), 6000);
  clearTimeout(this.autoAdvanceTimer);
  this.autoAdvanceTimer = setTimeout(function () {
    if (self.dialogueQueue.length > 0) self.advanceDialogue();
    else {
      self.sprite.playAnimation('idle');
      if (self.pendingAction) self.showNextActionButton(self.pendingAction);
    }
  }, readTime);
};

OperatorGuide.prototype.showSpeechBubble = function (text) {
  this.speechText.textContent = text;
  this.speechBubble.style.opacity = '1';
};

OperatorGuide.prototype.hideSpeechBubble = function () {
  this.speechBubble.style.opacity = '0';
};

OperatorGuide.prototype.showNextActionButton = function (action) {
  if (!this.actionSlot) return;
  this.actionSlot.innerHTML = '';
  var btn = document.createElement('a');
  btn.href = (window.SiemCore && window.SiemCore.resolveSiteHref)
    ? window.SiemCore.resolveSiteHref(action.url)
    : action.url;
  btn.id = 'operator-next-btn';
  btn.className = 'operator-next-btn';
  btn.textContent = action.label;
  this.actionSlot.appendChild(btn);
  this.speechBubble.style.opacity = '1';
};

OperatorGuide.prototype.initLevelTracking = function () {
  var self = this;
  var gameMap = {
    'game1-terminal': 'the_terminal', 'game2-breach': 'the_breach',
    'game3-network': 'the_ghost_network', 'game4-cipher': 'the_cipher',
    'game5-simulation': 'the_simulation', 'game6-intercept': 'the_interrogation_room',
    'game7-forge': 'the_forge', 'game8-archive': 'the_deep_archive',
    'game9-heist': 'the_heist', 'game10-lab': 'the_lab',
    'game11-cartography': 'the_cartography', 'game12-memorial': 'the_memorial',
    'game13-resonance': 'the_resonance'
  };
  this.levelTrackInterval = setInterval(function () {
    try {
      var pageKey = self.storylinePosition;
      var gameId = gameMap[pageKey];
      if (!gameId) return;
      var raw = localStorage.getItem('habibi-xp-' + gameId);
      if (!raw) return;
      var data = JSON.parse(raw);
      var level = data.currentLevel || 1;
      if (level !== self.lastLevel) {
        self.lastLevel = level;
        var script = OPERATOR_STORYLINE[pageKey];
        var levelKey = 'level' + level;
        if (script && script[levelKey]) {
          self.queueDialogue(script[levelKey]);
          self.sprite.playAnimation('point');
        }
      }
      if (data.completedLevels && data.completedLevels.indexOf(5) >= 0 && !self.gameCompleteShown) {
        self.gameCompleteShown = true;
        self.onGameComplete(gameId);
      }
    } catch (err) { /* ignore */ }
  }, 2000);
};

OperatorGuide.prototype.onGameComplete = function (gameId) {
  if (!this._completedGames) this._completedGames = {};
  if (this._completedGames[gameId]) return;
  this._completedGames[gameId] = true;
  var map = {
    the_terminal: 'game1-terminal', the_breach: 'game2-breach', the_ghost_network: 'game3-network',
    the_cipher: 'game4-cipher', the_simulation: 'game5-simulation',
    the_interrogation_room: 'game6-intercept', the_forge: 'game7-forge',
    the_deep_archive: 'game8-archive', the_heist: 'game9-heist', the_lab: 'game10-lab',
    the_cartography: 'game11-cartography', the_memorial: 'game12-memorial',
    the_resonance: 'game13-resonance'
  };
  var key = map[gameId];
  if (!key || !OPERATOR_STORYLINE[key]) return;
  var script = OPERATOR_STORYLINE[key];
  if (script.complete) {
    this.queueDialogue(script.complete);
    this.sprite.playAnimation('za_warudo');
  }
  if (script.nextAction) this.showNextActionButton(script.nextAction);
  if (window.HabibiNarrative) HabibiNarrative.recordGameComplete(gameId, {});
};

OperatorGuide.prototype.startRecruiterTour = function () {
  var self = this;
  this.recruiterStart = Date.now();
  this.recruiterIndex = 0;
  var bar = document.createElement('div');
  bar.id = 'operator-recruiter-bar';
  bar.innerHTML = 'Recruiter Preview — 90 seconds <div id="operator-recruiter-fill"></div>';
  document.body.prepend(bar);
  function nextLine() {
    if (self.recruiterIndex >= RECRUITER_SCRIPT.length) {
      self.queueDialogue(['Full experience available here. Debrief report auto-generated on completion.']);
      return;
    }
    self.showSpeechBubble(RECRUITER_SCRIPT[self.recruiterIndex]);
    self.sprite.playAnimation('talk');
    self.recruiterIndex++;
    var elapsed = Date.now() - self.recruiterStart;
    var pct = Math.min(100, (elapsed / 90000) * 100);
    var fill = document.getElementById('operator-recruiter-fill');
    if (fill) fill.style.width = pct + '%';
    setTimeout(nextLine, 6000);
  }
  nextLine();
};

window.OperatorGuide = OperatorGuide;
document.addEventListener('DOMContentLoaded', function () {
  window.OPERATOR = new OperatorGuide();
  window.OPERATOR.init();
});

// Clean up timers/rAF on page unload to prevent cross-page leaks
window.addEventListener('pagehide', function () {
  if (window.OPERATOR) {
    if (window.OPERATOR.animFrame)          { cancelAnimationFrame(window.OPERATOR.animFrame); window.OPERATOR.animFrame = null; }
    if (window.OPERATOR.levelTrackInterval) { clearInterval(window.OPERATOR.levelTrackInterval); window.OPERATOR.levelTrackInterval = null; }
    if (window.OPERATOR.autoAdvanceTimer)   { clearTimeout(window.OPERATOR.autoAdvanceTimer);   window.OPERATOR.autoAdvanceTimer = null; }
  }
});

})(typeof window !== 'undefined' ? window : globalThis);
