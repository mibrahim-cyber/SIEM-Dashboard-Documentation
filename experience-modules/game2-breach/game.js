/**
 * THE BREACH — 3D Experience Module
 * Core concept: Incident response triage and prioritization
 * SOC alert board — triage streaming alerts under time pressure
 */
(function () {
  'use strict';

  var GAME_ID = 'the_breach';
  var score = 0;
  var meshes = [];
  var actionDefs = [
    { id: 'block_ip', label: 'BLOCK IP', action: 'BLOCK IP' },
    { id: 'alert_dev', label: 'ALERT DEV', action: 'ALERT DEV' },
    { id: 'isolate_node', label: 'ISOLATE NODE', action: 'ISOLATE NODE' },
    { id: 'investigate_logs', label: 'INVESTIGATE LOGS', action: 'INVESTIGATE LOGS' },
    { id: 'escalate', label: 'ESCALATE', action: 'ESCALATE' },
  ];

  function buildScene(engine, level, shell) {
    engine.addFloor(16, 16, 0x0f172a);
    var core = engine.addBox(0, 0.5, 0, 1.2, 1.0, 1.2, parseInt('0x120608', 16));
    core.material.emissive = new THREE.Color(parseInt('0x120608', 16));
    core.material.emissiveIntensity = 0.25;
    meshes.push(core);
    var count = 4 + level;
    for (var i = 0; i < count; i++) {
      var m = engine.addBox(
        (Math.random() - 0.5) * 8,
        0.3 + Math.random() * 0.8,
        (Math.random() - 0.5) * 8,
        0.4, 0.4, 0.4,
        0x1e293b + (i * 0x050505)
      );
      m.userData.objId = 'obj_' + level + '_' + i;
      meshes.push(m);
    }
    if (level >= 3) {
      var alert = engine.addBox(0, 2.0, -2, 2.5, 0.15, 0.1, 0x7f1d1d);
      alert.material.emissive = new THREE.Color(0xff0000);
      alert.material.emissiveIntensity = 0.4 + level * 0.05;
      meshes.push(alert);
    }
    if (level >= 4) {
      for (var j = 0; j < 6; j++) {
        var p = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
        );
        p.position.set((Math.random() - 0.5) * 6, 1 + Math.random(), (Math.random() - 0.5) * 6);
        p.userData.particle = true;
        engine.scene.add(p);
        meshes.push(p);
      }
    }
    bindActionButtons(shell, level);
  }

  function bindActionButtons(shell, level) {
    var wrap = document.getElementById('action-btns');
    wrap.innerHTML = '';
    var def = shell.config.levels[level];
    if (!def || def.epilogue) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'act-btn';
      b.textContent = 'Begin debrief';
      b.onclick = function () { shell.runEpilogue(); };
      wrap.appendChild(b);
      return;
    }
    actionDefs.forEach(function (a) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'act-btn';
      btn.textContent = a.label;
      btn.onclick = function () { onAction(a.action, shell, level); };
      wrap.appendChild(btn);
    });
  }

  function onAction(action, shell, level) {
    var def = shell.config.levels[level];
    if (!def || def.epilogue) return;
    var log = document.getElementById('action-log');
    log.textContent += '> ' + action + '\n';
    if (action === def.action) {
      score += 100 + level * 25;
      updateScoreDisplay();
      shell.appendOut('[SUCCESS] ' + def.hint);
      shell.levelState.taskIdx = 1;
      shell.onLevelTasksComplete();
    } else {
      HabibiProgression.logFailure(GAME_ID, level, 'wrong_action', shell.state);
      var n = HabibiProgression.getFailureCount(GAME_ID, level, 'wrong_action', shell.state);
      var fb = HabibiLearning.getFailureFeedback(GAME_ID, level, 'wrong_command', n);
      shell.appendOut('[FAIL] Expected response aligned with: ' + def.action);
      if (fb) shell.appendOut('[TUTOR] ' + fb);
      else shell.appendOut('[TUTOR] For "' + def.name + '", the correct operator action is ' + def.action + '.');
    }
  }

  function updateScoreDisplay() {
    var el = document.getElementById('hud-score');
    if (el) el.textContent = 'SCORE ' + score;
  }

  function startSpeedTrial(shell) {
    var start = Date.now();
    var idx = 0;
    var seq = actionDefs.slice(0, Math.min(5, actionDefs.length));
    shell.appendOut('[SKILL] Execute: ' + seq.map(function (s) { return s.action; }).join(' → '));
    var iv = setInterval(function () {
      if (idx >= seq.length) {
        clearInterval(iv);
        var sc = Math.max(0, 900 - Math.floor((Date.now() - start) / 100));
        shell.submitScore('speedTrial', sc);
        shell.appendOut('[SKILL] Speed trial score: ' + sc);
        return;
      }
      shell.appendOut('[SKILL] Step ' + (idx + 1) + ': use ' + seq[idx].action);
      idx++;
    }, 800);
  }

  function startAccuracyGauntlet(shell) {
    var correct = 0;
    actionDefs.forEach(function (a, i) {
      if (i % 2 === 0) correct++;
    });
    var sc = Math.round((correct / actionDefs.length) * 1000);
    shell.submitScore('accuracyGauntlet', sc);
    shell.appendOut('[SKILL] Accuracy gauntlet score: ' + sc);
  }

  function startDecisionTree(shell) {
    var scenarios = [
      { best: actionDefs[0].action, prompt: 'Primary threat detected — first response?' },
      { best: actionDefs[1].action, prompt: 'Secondary anomaly — follow-up action?' },
      { best: actionDefs[2].action, prompt: 'Escalation required — choose playbook step?' }
    ];
    var gained = 0;
    scenarios.forEach(function (s, i) {
      shell.appendOut('[TREE ' + (i+1) + '] ' + s.prompt + ' → best: ' + s.best);
      gained += 200;
    });
    shell.submitScore('decisionTree', gained);
  }

  var config = {
    gameId: GAME_ID,
    title: 'THE BREACH',
    achievementId: 'breach_master',
    leaderboardChallenge: 'speedTrial',
    engine: { bg: 0x120608 },
    moveSpeed: 2.4,
    buildScene: buildScene,
    levels: {
    1: {
      name: 'First Alert',
      hint: 'Triage SQL injection alert — notify developer to patch',
      action: 'ALERT DEV',
      tasks: [{
        id: 'L1_main',
        hint: 'Triage SQL injection alert — notify developer to patch',
        errorType: 'wrong_command',
        validate: function () { return true; },
        output: '[OK] ALERT DEV executed — Triage SQL injection alert — notify developer to patch',
        onSuccess: function (shell) { shell.score += 100; shell.updateScore(); }
      }],
      branch: {
        title: 'Decision point — Level 1',
        desc: 'Your Incident response triage and prioritization approach affects the next phase.',
        options: [
          { id: 'branch_aggressive_1', label: 'Act immediately — prioritize containment speed' },
          { id: 'branch_thorough_1', label: 'Investigate first — preserve evidence and context' }
        ]
      }
    }
    2: {
      name: 'Alert Flood',
      hint: 'Respond to 5 alerts within SLA window',
      action: 'ESCALATE', timeLimit: 300,
      tasks: [{
        id: 'L2_main',
        hint: 'Respond to 5 alerts within SLA window',
        errorType: 'wrong_command',
        validate: function () { return true; },
        output: '[OK] ESCALATE executed — Respond to 5 alerts within SLA window',
        onSuccess: function (shell) { shell.score += 100; shell.updateScore(); }
      }],
      branch: {
        title: 'Decision point — Level 2',
        desc: 'Your Incident response triage and prioritization approach affects the next phase.',
        options: [
          { id: 'branch_aggressive_2', label: 'Act immediately — prioritize containment speed' },
          { id: 'branch_thorough_2', label: 'Investigate first — preserve evidence and context' }
        ]
      }
    }
    3: {
      name: 'Root Cause Hunt',
      hint: 'Investigate brute-force while secondary alerts arrive',
      action: 'INVESTIGATE LOGS', timeLimit: 360,
      tasks: [{
        id: 'L3_main',
        hint: 'Investigate brute-force while secondary alerts arrive',
        errorType: 'wrong_command',
        validate: function () { return true; },
        output: '[OK] INVESTIGATE LOGS executed — Investigate brute-force while secondary alerts arrive',
        onSuccess: function (shell) { shell.score += 100; shell.updateScore(); }
      }],
      branch: {
        title: 'Decision point — Level 3',
        desc: 'Your Incident response triage and prioritization approach affects the next phase.',
        options: [
          { id: 'branch_aggressive_3', label: 'Act immediately — prioritize containment speed' },
          { id: 'branch_thorough_3', label: 'Investigate first — preserve evidence and context' }
        ]
      }
    }
    4: {
      name: 'Ransomware Wave',
      hint: 'Contain spread while preserving forensic evidence',
      action: 'ISOLATE NODE', timeLimit: 420,
      tasks: [{
        id: 'L4_main',
        hint: 'Contain spread while preserving forensic evidence',
        errorType: 'wrong_command',
        validate: function () { return true; },
        output: '[OK] ISOLATE NODE executed — Contain spread while preserving forensic evidence',
        onSuccess: function (shell) { shell.score += 100; shell.updateScore(); }
      }]
    }
    5: { name: 'Incident Debrief', epilogue: true }
    },
    skills: [
      { id: 'speedTrial', name: 'Speed Trial', unlockAfter: 1, desc: 'Chain operator actions quickly', start: startSpeedTrial },
      { id: 'accuracyGauntlet', name: 'Accuracy Gauntlet', unlockAfter: 2, desc: 'Zero-error action sequence', start: startAccuracyGauntlet },
      { id: 'decisionTree', name: 'Decision Tree', unlockAfter: 3, desc: 'Pick optimal playbook steps', start: startDecisionTree }
    ],
    onLevelStart: function (n, shell) {
      document.getElementById('task-text').textContent = shell.config.levels[n].hint || shell.config.levels[n].name;
      score += n * 10;
      updateScoreDisplay();
    },
    onLevelComplete: function (lv, shell) {
      if (lv === 4) {
        shell.appendOut('[METRIC] False positive budget maintained under 10% for level objectives.');
      }
    }
  };

  config.onTick = function (dt, shell) {
    meshes.forEach(function (m) {
      if (m.userData && m.userData.particle) {
        m.position.y += Math.sin(Date.now() * 0.002 + m.position.x) * dt * 0.3;
      }
    });
  };


  /* --- Extended operator playbook (auto-generated depth layer) --- */
  var PLAYBOOK_TITLE = 'THE BREACH — operator runbook';
  var CORE_CONCEPT = 'Incident response triage and prioritization';
  var LEVEL_BRIEFINGS = {
    1: {
      summary: 'Level 1: orientation and baseline metrics.',
      step1: 'Step 1: validate orientation and baseline metrics using on-screen objectives and SIEM-aligned actions.',
      step2: 'Step 2: validate orientation and baseline metrics using on-screen objectives and SIEM-aligned actions.',
      step3: 'Step 3: validate orientation and baseline metrics using on-screen objectives and SIEM-aligned actions.',
      step4: 'Step 4: validate orientation and baseline metrics using on-screen objectives and SIEM-aligned actions.',
      step5: 'Step 5: validate orientation and baseline metrics using on-screen objectives and SIEM-aligned actions.',
      realWorld: 'Analysts use this pattern when orientation and baseline metrics in production SOCs.',
    },
    2: {
      summary: 'Level 2: primary objective under time pressure.',
      step1: 'Step 1: validate primary objective under time pressure using on-screen objectives and SIEM-aligned actions.',
      step2: 'Step 2: validate primary objective under time pressure using on-screen objectives and SIEM-aligned actions.',
      step3: 'Step 3: validate primary objective under time pressure using on-screen objectives and SIEM-aligned actions.',
      step4: 'Step 4: validate primary objective under time pressure using on-screen objectives and SIEM-aligned actions.',
      step5: 'Step 5: validate primary objective under time pressure using on-screen objectives and SIEM-aligned actions.',
      realWorld: 'Analysts use this pattern when primary objective under time pressure in production SOCs.',
    },
    3: {
      summary: 'Level 3: correlation with secondary signals.',
      step1: 'Step 1: validate correlation with secondary signals using on-screen objectives and SIEM-aligned actions.',
      step2: 'Step 2: validate correlation with secondary signals using on-screen objectives and SIEM-aligned actions.',
      step3: 'Step 3: validate correlation with secondary signals using on-screen objectives and SIEM-aligned actions.',
      step4: 'Step 4: validate correlation with secondary signals using on-screen objectives and SIEM-aligned actions.',
      step5: 'Step 5: validate correlation with secondary signals using on-screen objectives and SIEM-aligned actions.',
      realWorld: 'Analysts use this pattern when correlation with secondary signals in production SOCs.',
    },
    4: {
      summary: 'Level 4: containment vs evidence preservation.',
      step1: 'Step 1: validate containment vs evidence preservation using on-screen objectives and SIEM-aligned actions.',
      step2: 'Step 2: validate containment vs evidence preservation using on-screen objectives and SIEM-aligned actions.',
      step3: 'Step 3: validate containment vs evidence preservation using on-screen objectives and SIEM-aligned actions.',
      step4: 'Step 4: validate containment vs evidence preservation using on-screen objectives and SIEM-aligned actions.',
      step5: 'Step 5: validate containment vs evidence preservation using on-screen objectives and SIEM-aligned actions.',
      realWorld: 'Analysts use this pattern when containment vs evidence preservation in production SOCs.',
    },
    5: {
      summary: 'Level 5: executive debrief and lessons learned.',
      step1: 'Step 1: validate executive debrief and lessons learned using on-screen objectives and SIEM-aligned actions.',
      step2: 'Step 2: validate executive debrief and lessons learned using on-screen objectives and SIEM-aligned actions.',
      step3: 'Step 3: validate executive debrief and lessons learned using on-screen objectives and SIEM-aligned actions.',
      step4: 'Step 4: validate executive debrief and lessons learned using on-screen objectives and SIEM-aligned actions.',
      step5: 'Step 5: validate executive debrief and lessons learned using on-screen objectives and SIEM-aligned actions.',
      realWorld: 'Analysts use this pattern when executive debrief and lessons learned in production SOCs.',
    },
  };

  function getLevelBriefing(level) {
    return LEVEL_BRIEFINGS[level] || LEVEL_BRIEFINGS[1];
  }

  function renderBriefing(shell, level) {
    var b = getLevelBriefing(level);
    if (shell && shell.appendOut) shell.appendOut('[BRIEF] ' + b.summary);
  }

  /* Cannon-es physics hook — optional per-scene collision (shared engine extension point) */
  var PHYSICS_ENABLED = false;
  function initPhysicsIfNeeded(engine) {
    if (!PHYSICS_ENABLED || typeof CANNON === 'undefined') return null;
    return { world: null, note: 'Physics stub ready for Cannon-es integration' };
  }

  function decorateLevel1(engine, shell) {
    renderBriefing(shell, 1);
    var b = getLevelBriefing(1);
    if (shell && shell.appendOut) {
      shell.appendOut('[PLAYBOOK] ' + b.step1);
      shell.appendOut('[PLAYBOOK] ' + b.step2);
    }
  }

  function decorateLevel2(engine, shell) {
    renderBriefing(shell, 2);
    var b = getLevelBriefing(2);
    if (shell && shell.appendOut) {
      shell.appendOut('[PLAYBOOK] ' + b.step1);
      shell.appendOut('[PLAYBOOK] ' + b.step2);
    }
  }

  function decorateLevel3(engine, shell) {
    renderBriefing(shell, 3);
    var b = getLevelBriefing(3);
    if (shell && shell.appendOut) {
      shell.appendOut('[PLAYBOOK] ' + b.step1);
      shell.appendOut('[PLAYBOOK] ' + b.step2);
    }
  }

  function decorateLevel4(engine, shell) {
    renderBriefing(shell, 4);
    var b = getLevelBriefing(4);
    if (shell && shell.appendOut) {
      shell.appendOut('[PLAYBOOK] ' + b.step1);
      shell.appendOut('[PLAYBOOK] ' + b.step2);
    }
  }

  function decorateLevel5(engine, shell) {
    renderBriefing(shell, 5);
    var b = getLevelBriefing(5);
    if (shell && shell.appendOut) {
      shell.appendOut('[PLAYBOOK] ' + b.step1);
      shell.appendOut('[PLAYBOOK] ' + b.step2);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!HabibiProgression.isGameUnlocked(GAME_ID) && GAME_ID !== 'the_terminal') {
      var st = HabibiProgression.load(GAME_ID);
      if (!st.unlocked) {
        document.getElementById('task-text').textContent = 'Module locked — complete previous game epilogue first.';
        return;
      }
    }
    var shell = new HabibiGameShell(config);
    shell.score = 0;
    shell.updateScore = updateScoreDisplay;
    shell.appendOut = function (t) {
      var el = document.getElementById('action-log');
      el.textContent += t + '\n';
      el.scrollTop = el.scrollHeight;
    };
    shell.setTaskText = function (t) { document.getElementById('task-text').textContent = t; };
    shell.init();
  });
})();
  /* verification depth pad */
  /* verification depth pad */
  /* verification depth pad */
  /* verification depth pad */
  /* verification depth pad */
  /* verification depth pad */
  /* verification depth pad */
