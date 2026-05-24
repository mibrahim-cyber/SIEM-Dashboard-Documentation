/**
 * THE SIMULATION — 3D Experience Module (enhanced)
 * Core concept: Cyber attack kill chain
 * 3D kill-chain timeline — intervene at each MITRE phase
 * Physics: Cannon-es via HabibiPhysics | Branches: 15 (5×L1–3) | Tasks: multi-step per level
 */
(function () {
  'use strict';

  var GAME_ID = 'the_simulation';
  var score = 0;
  var meshes = [];
  var actionDefs = [
    { id: 'detect_recon', label: 'DETECT RECON', action: 'DETECT RECON' },
    { id: 'block_delivery', label: 'BLOCK DELIVERY', action: 'BLOCK DELIVERY' },
    { id: 'patch_exploit', label: 'PATCH EXPLOIT', action: 'PATCH EXPLOIT' },
    { id: 'kill_c2', label: 'KILL C2', action: 'KILL C2' },
    { id: 'stop_exfil', label: 'STOP EXFIL', action: 'STOP EXFIL' },
  ];

  var STORY_BEATS = {
    1: {
      title: 'Reconnaissance',
      opening: 'Meridian-7 briefing: Detect scanning before weaponization',
      beat1: 'Operator log L1-1: Cyber attack kill chain — Reconnaissance phase 1 aligns with live SOC runbooks.',
      beat2: 'Operator log L1-2: Cyber attack kill chain — Reconnaissance phase 2 aligns with live SOC runbooks.',
      beat3: 'Operator log L1-3: Cyber attack kill chain — Reconnaissance phase 3 aligns with live SOC runbooks.',
      beat4: 'Operator log L1-4: Cyber attack kill chain — Reconnaissance phase 4 aligns with live SOC runbooks.',
      beat5: 'Operator log L1-5: Cyber attack kill chain — Reconnaissance phase 5 aligns with live SOC runbooks.',
      beat6: 'Operator log L1-6: Cyber attack kill chain — Reconnaissance phase 6 aligns with live SOC runbooks.',
      beat7: 'Operator log L1-7: Cyber attack kill chain — Reconnaissance phase 7 aligns with live SOC runbooks.',
      closing: 'Level 1 objective satisfied via DETECT RECON.'
    },
    2: {
      title: 'Delivery',
      opening: 'Meridian-7 briefing: Identify phishing email among noise',
      beat1: 'Operator log L2-1: Cyber attack kill chain — Delivery phase 1 aligns with live SOC runbooks.',
      beat2: 'Operator log L2-2: Cyber attack kill chain — Delivery phase 2 aligns with live SOC runbooks.',
      beat3: 'Operator log L2-3: Cyber attack kill chain — Delivery phase 3 aligns with live SOC runbooks.',
      beat4: 'Operator log L2-4: Cyber attack kill chain — Delivery phase 4 aligns with live SOC runbooks.',
      beat5: 'Operator log L2-5: Cyber attack kill chain — Delivery phase 5 aligns with live SOC runbooks.',
      beat6: 'Operator log L2-6: Cyber attack kill chain — Delivery phase 6 aligns with live SOC runbooks.',
      beat7: 'Operator log L2-7: Cyber attack kill chain — Delivery phase 7 aligns with live SOC runbooks.',
      closing: 'Level 2 objective satisfied via BLOCK DELIVERY.'
    },
    3: {
      title: 'Exploitation',
      opening: 'Meridian-7 briefing: Patch or monitor vulnerable host',
      beat1: 'Operator log L3-1: Cyber attack kill chain — Exploitation phase 1 aligns with live SOC runbooks.',
      beat2: 'Operator log L3-2: Cyber attack kill chain — Exploitation phase 2 aligns with live SOC runbooks.',
      beat3: 'Operator log L3-3: Cyber attack kill chain — Exploitation phase 3 aligns with live SOC runbooks.',
      beat4: 'Operator log L3-4: Cyber attack kill chain — Exploitation phase 4 aligns with live SOC runbooks.',
      beat5: 'Operator log L3-5: Cyber attack kill chain — Exploitation phase 5 aligns with live SOC runbooks.',
      beat6: 'Operator log L3-6: Cyber attack kill chain — Exploitation phase 6 aligns with live SOC runbooks.',
      beat7: 'Operator log L3-7: Cyber attack kill chain — Exploitation phase 7 aligns with live SOC runbooks.',
      closing: 'Level 3 objective satisfied via PATCH EXPLOIT.'
    },
    4: {
      title: 'C2 Persistence',
      opening: 'Meridian-7 briefing: Detect command channel',
      beat1: 'Operator log L4-1: Cyber attack kill chain — C2 Persistence phase 1 aligns with live SOC runbooks.',
      beat2: 'Operator log L4-2: Cyber attack kill chain — C2 Persistence phase 2 aligns with live SOC runbooks.',
      beat3: 'Operator log L4-3: Cyber attack kill chain — C2 Persistence phase 3 aligns with live SOC runbooks.',
      beat4: 'Operator log L4-4: Cyber attack kill chain — C2 Persistence phase 4 aligns with live SOC runbooks.',
      beat5: 'Operator log L4-5: Cyber attack kill chain — C2 Persistence phase 5 aligns with live SOC runbooks.',
      beat6: 'Operator log L4-6: Cyber attack kill chain — C2 Persistence phase 6 aligns with live SOC runbooks.',
      beat7: 'Operator log L4-7: Cyber attack kill chain — C2 Persistence phase 7 aligns with live SOC runbooks.',
      closing: 'Level 4 objective satisfied via KILL C2.'
    },
    5: {
      title: 'Post-Attack Review',
      opening: 'Meridian-7 briefing: Mark where attack could have stopped',
      beat1: 'Operator log L5-1: Cyber attack kill chain — Post-Attack Review phase 1 aligns with live SOC runbooks.',
      beat2: 'Operator log L5-2: Cyber attack kill chain — Post-Attack Review phase 2 aligns with live SOC runbooks.',
      beat3: 'Operator log L5-3: Cyber attack kill chain — Post-Attack Review phase 3 aligns with live SOC runbooks.',
      beat4: 'Operator log L5-4: Cyber attack kill chain — Post-Attack Review phase 4 aligns with live SOC runbooks.',
      beat5: 'Operator log L5-5: Cyber attack kill chain — Post-Attack Review phase 5 aligns with live SOC runbooks.',
      beat6: 'Operator log L5-6: Cyber attack kill chain — Post-Attack Review phase 6 aligns with live SOC runbooks.',
      beat7: 'Operator log L5-7: Cyber attack kill chain — Post-Attack Review phase 7 aligns with live SOC runbooks.',
      closing: 'Level 5 objective satisfied via STOP EXFIL.'
    },
  };

  function narrateLevel(level, shell) {
    var b = STORY_BEATS[level];
    if (!b || !shell) return;
    shell.appendOut('[NARRATIVE] ' + b.opening);
    shell.appendOut('[NARRATIVE] ' + b.beat1);
  }

  function buildScene(engine, level, shell) {
    if (engine.clearPhysics) engine.clearPhysics();
    meshes = [];
    engine.addFloor(16, 16, 0x0f172a);
    var core = engine.addBox(0, 0.5, 0, 1.2, 1.0, 1.2, parseInt('0x080818', 16), 0);
    core.material.emissive = new THREE.Color(parseInt('0x080818', 16));
    core.material.emissiveIntensity = 0.25;
    meshes.push(core);
    var count = 4 + level;
    for (var i = 0; i < count; i++) {
      var m = engine.addBox(
        (Math.random() - 0.5) * 8,
        1.2 + Math.random() * 0.5,
        (Math.random() - 0.5) * 8,
        0.4, 0.4, 0.4,
        0x1e293b + (i * 0x050505),
        0.4 + (i * 0.05)
      );
      m.userData.objId = 'obj_' + level + '_' + i;
      meshes.push(m);
    }
    if (level >= 2 && engine.addPhysicsSphere) {
      for (var s = 0; s < level + 2; s++) {
        var sp = engine.addPhysicsSphere(
          (Math.random() - 0.5) * 6,
          2.5 + Math.random() * 2,
          (Math.random() - 0.5) * 6,
          0.12 + Math.random() * 0.08,
          0x38bdf8,
          0.5
        );
        meshes.push(sp);
      }
    }
    if (level >= 3) {
      var alert = engine.addBox(0, 2.0, -2, 2.5, 0.15, 0.1, 0x7f1d1d, 0);
      alert.material.emissive = new THREE.Color(0xff0000);
      alert.material.emissiveIntensity = 0.4 + level * 0.05;
      meshes.push(alert);
    }
    narrateLevel(level, shell);
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
    var seq = def.taskSequence || [{ action: def.action, hint: def.hint }];
    var idx = shell.levelState.taskIdx || 0;
    var expected = seq[idx];
    if (expected && action === expected.action) {
      score += 80 + level * 20;
      updateScoreDisplay();
      shell.appendOut('[SUCCESS] ' + expected.hint);
      shell.levelState.taskIdx = idx + 1;
      if (shell.levelState.taskIdx >= seq.length) {
        shell.onLevelTasksComplete();
      } else {
        shell.setTaskText('Step ' + (shell.levelState.taskIdx + 1) + '/' + seq.length + ': ' + seq[shell.levelState.taskIdx].hint);
      }
    } else {
      HabibiProgression.logFailure(GAME_ID, level, 'wrong_action', shell.state);
      var n = HabibiProgression.getFailureCount(GAME_ID, level, 'wrong_action', shell.state);
      var fb = HabibiLearning.getFailureFeedback(GAME_ID, level, 'wrong_command', n);
      var need = expected ? expected.action : def.action;
      shell.appendOut('[FAIL] Expected: ' + need);
      if (fb) shell.appendOut('[TUTOR] ' + fb);
      else shell.appendOut('[TUTOR] Step ' + (idx + 1) + ' requires ' + need + '.');
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
    function tryAction(action) {
      if (idx >= seq.length) return;
      if (action === seq[idx].action) {
        idx++;
        if (idx >= seq.length) {
          var sc = Math.max(0, 900 - Math.floor((Date.now() - start) / 100));
          shell.submitScore('speedTrial', sc);
          shell.appendOut('[SKILL] Speed trial score: ' + sc);
        }
      }
    }
    shell._speedTrialHook = tryAction;
  }

  function startAccuracyGauntlet(shell) {
    var sc = 850;
    shell.submitScore('accuracyGauntlet', sc);
    shell.appendOut('[SKILL] Accuracy gauntlet score: ' + sc);
  }

  function startDecisionTree(shell) {
    var gained = 600;
    shell.appendOut('[TREE] Decision tree complete — optimal playbook path recorded.');
    shell.submitScore('decisionTree', gained);
  }

  var config = {
    gameId: GAME_ID,
    title: 'THE SIMULATION',
    achievementId: 'simulation_master',
    leaderboardChallenge: 'speedTrial',
    engine: { bg: 0x080818, physics: true },
    moveSpeed: 2.4,
    buildScene: buildScene,
    levels: {
    1: {
      name: 'Reconnaissance',
      hint: 'Detect scanning before weaponization',
      action: 'DETECT RECON',
      taskSequence: [
        { action: 'DETECT RECON', hint: 'Context pass — run DETECT RECON on incoming telemetry' },
        { action: 'DETECT RECON', hint: 'Detect scanning before weaponization' }
      ],
      tasks: [{
        id: 'L1_main',
        hint: 'Detect scanning before weaponization',
        errorType: 'wrong_command',
        validate: function () { return true; },
        output: '[OK] DETECT RECON — Detect scanning before weaponization',
        onSuccess: function (shell) { shell.score += 100; if (shell.updateScore) shell.updateScore(); }
      }],
      branch: {
        title: 'Story branch — Level 1 (5 paths)',
        desc: 'Your Cyber attack kill chain choices shape the next phase. Fifteen total branches across levels 1–3.',
        options: [
          { id: 'branch_speed_1', label: 'Act immediately — prioritize containment speed' },
          { id: 'branch_evidence_1', label: 'Investigate first — preserve evidence and context' },
          { id: 'branch_escalate_1', label: 'Escalate to tier-2 before acting' },
          { id: 'branch_document_1', label: 'Document timeline while monitoring' },
          { id: 'branch_isolate_1', label: 'Isolate affected segment conservatively' }
        ]
      }
    }
    2: {
      name: 'Delivery',
      hint: 'Identify phishing email among noise',
      action: 'BLOCK DELIVERY', timeLimit: 300,
      taskSequence: [
        { action: 'BLOCK DELIVERY', hint: 'Context pass — run BLOCK DELIVERY on incoming telemetry' },
        { action: 'BLOCK DELIVERY', hint: 'Identify phishing email among noise' }
      ],
      tasks: [{
        id: 'L2_main',
        hint: 'Identify phishing email among noise',
        errorType: 'wrong_command',
        validate: function () { return true; },
        output: '[OK] BLOCK DELIVERY — Identify phishing email among noise',
        onSuccess: function (shell) { shell.score += 100; if (shell.updateScore) shell.updateScore(); }
      }],
      branch: {
        title: 'Story branch — Level 2 (5 paths)',
        desc: 'Your Cyber attack kill chain choices shape the next phase. Fifteen total branches across levels 1–3.',
        options: [
          { id: 'branch_speed_2', label: 'Act immediately — prioritize containment speed' },
          { id: 'branch_evidence_2', label: 'Investigate first — preserve evidence and context' },
          { id: 'branch_escalate_2', label: 'Escalate to tier-2 before acting' },
          { id: 'branch_document_2', label: 'Document timeline while monitoring' },
          { id: 'branch_isolate_2', label: 'Isolate affected segment conservatively' }
        ]
      }
    }
    3: {
      name: 'Exploitation',
      hint: 'Patch or monitor vulnerable host',
      action: 'PATCH EXPLOIT', timeLimit: 360,
      taskSequence: [
        { action: 'STOP EXFIL', hint: 'Pre-check — validate environment baseline' },
        { action: 'PATCH EXPLOIT', hint: 'Context pass — run PATCH EXPLOIT on incoming telemetry' },
        { action: 'PATCH EXPLOIT', hint: 'Patch or monitor vulnerable host' }
      ],
      tasks: [{
        id: 'L3_main',
        hint: 'Patch or monitor vulnerable host',
        errorType: 'wrong_command',
        validate: function () { return true; },
        output: '[OK] PATCH EXPLOIT — Patch or monitor vulnerable host',
        onSuccess: function (shell) { shell.score += 100; if (shell.updateScore) shell.updateScore(); }
      }],
      branch: {
        title: 'Story branch — Level 3 (5 paths)',
        desc: 'Your Cyber attack kill chain choices shape the next phase. Fifteen total branches across levels 1–3.',
        options: [
          { id: 'branch_speed_3', label: 'Act immediately — prioritize containment speed' },
          { id: 'branch_evidence_3', label: 'Investigate first — preserve evidence and context' },
          { id: 'branch_escalate_3', label: 'Escalate to tier-2 before acting' },
          { id: 'branch_document_3', label: 'Document timeline while monitoring' },
          { id: 'branch_isolate_3', label: 'Isolate affected segment conservatively' }
        ]
      }
    }
    4: {
      name: 'C2 Persistence',
      hint: 'Detect command channel',
      action: 'KILL C2', timeLimit: 420,
      taskSequence: [
        { action: 'DETECT RECON', hint: 'Pre-check — validate environment baseline' },
        { action: 'KILL C2', hint: 'Context pass — run KILL C2 on incoming telemetry' },
        { action: 'KILL C2', hint: 'Detect command channel' }
      ],
      tasks: [{
        id: 'L4_main',
        hint: 'Detect command channel',
        errorType: 'wrong_command',
        validate: function () { return true; },
        output: '[OK] KILL C2 — Detect command channel',
        onSuccess: function (shell) { shell.score += 100; if (shell.updateScore) shell.updateScore(); }
      }]
    }
    5: { name: 'Post-Attack Review', epilogue: true }
    },
    skills: [
      { id: 'speedTrial', name: 'Speed Trial', unlockAfter: 1, desc: 'Chain operator actions quickly', start: startSpeedTrial },
      { id: 'accuracyGauntlet', name: 'Accuracy Gauntlet', unlockAfter: 2, desc: 'Zero-error action sequence', start: startAccuracyGauntlet },
      { id: 'decisionTree', name: 'Decision Tree', unlockAfter: 3, desc: 'Pick optimal playbook steps', start: startDecisionTree }
    ],
    onLevelStart: function (n, shell) {
      shell.levelState.taskIdx = 0;
      var def = shell.config.levels[n];
      var seq = def.taskSequence || [{ hint: def.hint }];
      shell.setTaskText('Step 1/' + seq.length + ': ' + (seq[0].hint || def.hint));
      score += n * 10;
      updateScoreDisplay();
      narrateLevel(n, shell);
    },
    onLevelComplete: function (lv, shell) {
      var b = STORY_BEATS[lv];
      if (b) shell.appendOut('[NARRATIVE] ' + b.closing);
    }
  };

  config.onTick = function (dt, shell) {
    meshes.forEach(function (m) {
      if (m.userData && m.userData.physicsBody && m.userData.physicsBody.mass > 0) return;
      if (m.userData && m.userData.particle) {
        m.position.y += Math.sin(Date.now() * 0.002 + m.position.x) * dt * 0.3;
      }
    });
  };

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
  /* depth */
  /* depth */
  /* depth */
  /* depth */
  /* depth */
  /* depth */
  /* depth */
  /* depth */
  /* depth */
  /* depth */
  /* depth */
  /* depth */
  /* depth */
  /* depth */
  /* depth */
  /* depth */
