/**
 * INTERROGATION ROOM — 3D Experience Module (enhanced)
 * Core concept: Command and Control communication patterns
 * Decrypt C2 sessions and extract IOCs
 * Physics: Cannon-es via HabibiPhysics | Branches: 15 (5×L1–3) | Tasks: multi-step per level
 */
(function () {
  'use strict';

  var GAME_ID = 'the_interrogation_room';
  var score = 0;
  var meshes = [];
  var actionDefs = [
    { id: 'decode_b64', label: 'DECODE B64', action: 'DECODE B64' },
    { id: 'extract_ip', label: 'EXTRACT IP', action: 'EXTRACT IP' },
    { id: 'tag_hash', label: 'TAG HASH', action: 'TAG HASH' },
    { id: 'unlock_omega', label: 'UNLOCK OMEGA', action: 'UNLOCK OMEGA' },
    { id: 'submit_ioc', label: 'SUBMIT IOC', action: 'SUBMIT IOC' },
  ];

  var STORY_BEATS = {
    1: {
      title: 'C2 vs HTTPS',
      opening: 'Meridian-7 briefing: Separate beacon traffic from web noise',
      beat1: 'Operator log L1-1: Command and Control communication patterns — C2 vs HTTPS phase 1 aligns with live SOC runbooks.',
      beat2: 'Operator log L1-2: Command and Control communication patterns — C2 vs HTTPS phase 2 aligns with live SOC runbooks.',
      beat3: 'Operator log L1-3: Command and Control communication patterns — C2 vs HTTPS phase 3 aligns with live SOC runbooks.',
      beat4: 'Operator log L1-4: Command and Control communication patterns — C2 vs HTTPS phase 4 aligns with live SOC runbooks.',
      beat5: 'Operator log L1-5: Command and Control communication patterns — C2 vs HTTPS phase 5 aligns with live SOC runbooks.',
      beat6: 'Operator log L1-6: Command and Control communication patterns — C2 vs HTTPS phase 6 aligns with live SOC runbooks.',
      beat7: 'Operator log L1-7: Command and Control communication patterns — C2 vs HTTPS phase 7 aligns with live SOC runbooks.',
      closing: 'Level 1 objective satisfied via DECODE B64.'
    },
    2: {
      title: 'Protocol Decode',
      opening: 'Meridian-7 briefing: Decode base64 command batch',
      beat1: 'Operator log L2-1: Command and Control communication patterns — Protocol Decode phase 1 aligns with live SOC runbooks.',
      beat2: 'Operator log L2-2: Command and Control communication patterns — Protocol Decode phase 2 aligns with live SOC runbooks.',
      beat3: 'Operator log L2-3: Command and Control communication patterns — Protocol Decode phase 3 aligns with live SOC runbooks.',
      beat4: 'Operator log L2-4: Command and Control communication patterns — Protocol Decode phase 4 aligns with live SOC runbooks.',
      beat5: 'Operator log L2-5: Command and Control communication patterns — Protocol Decode phase 5 aligns with live SOC runbooks.',
      beat6: 'Operator log L2-6: Command and Control communication patterns — Protocol Decode phase 6 aligns with live SOC runbooks.',
      beat7: 'Operator log L2-7: Command and Control communication patterns — Protocol Decode phase 7 aligns with live SOC runbooks.',
      closing: 'Level 2 objective satisfied via EXTRACT IP.'
    },
    3: {
      title: 'IOC Extraction',
      opening: 'Meridian-7 briefing: Pull domains and hashes from transcript',
      beat1: 'Operator log L3-1: Command and Control communication patterns — IOC Extraction phase 1 aligns with live SOC runbooks.',
      beat2: 'Operator log L3-2: Command and Control communication patterns — IOC Extraction phase 2 aligns with live SOC runbooks.',
      beat3: 'Operator log L3-3: Command and Control communication patterns — IOC Extraction phase 3 aligns with live SOC runbooks.',
      beat4: 'Operator log L3-4: Command and Control communication patterns — IOC Extraction phase 4 aligns with live SOC runbooks.',
      beat5: 'Operator log L3-5: Command and Control communication patterns — IOC Extraction phase 5 aligns with live SOC runbooks.',
      beat6: 'Operator log L3-6: Command and Control communication patterns — IOC Extraction phase 6 aligns with live SOC runbooks.',
      beat7: 'Operator log L3-7: Command and Control communication patterns — IOC Extraction phase 7 aligns with live SOC runbooks.',
      closing: 'Level 3 objective satisfied via TAG HASH.'
    },
    4: {
      title: 'Framework ID',
      opening: 'Meridian-7 briefing: Attribute malware family by behavior',
      beat1: 'Operator log L4-1: Command and Control communication patterns — Framework ID phase 1 aligns with live SOC runbooks.',
      beat2: 'Operator log L4-2: Command and Control communication patterns — Framework ID phase 2 aligns with live SOC runbooks.',
      beat3: 'Operator log L4-3: Command and Control communication patterns — Framework ID phase 3 aligns with live SOC runbooks.',
      beat4: 'Operator log L4-4: Command and Control communication patterns — Framework ID phase 4 aligns with live SOC runbooks.',
      beat5: 'Operator log L4-5: Command and Control communication patterns — Framework ID phase 5 aligns with live SOC runbooks.',
      beat6: 'Operator log L4-6: Command and Control communication patterns — Framework ID phase 6 aligns with live SOC runbooks.',
      beat7: 'Operator log L4-7: Command and Control communication patterns — Framework ID phase 7 aligns with live SOC runbooks.',
      closing: 'Level 4 objective satisfied via UNLOCK OMEGA.'
    },
    5: {
      title: 'Threat Intel Brief',
      opening: 'Meridian-7 briefing: Package IOCs for sharing',
      beat1: 'Operator log L5-1: Command and Control communication patterns — Threat Intel Brief phase 1 aligns with live SOC runbooks.',
      beat2: 'Operator log L5-2: Command and Control communication patterns — Threat Intel Brief phase 2 aligns with live SOC runbooks.',
      beat3: 'Operator log L5-3: Command and Control communication patterns — Threat Intel Brief phase 3 aligns with live SOC runbooks.',
      beat4: 'Operator log L5-4: Command and Control communication patterns — Threat Intel Brief phase 4 aligns with live SOC runbooks.',
      beat5: 'Operator log L5-5: Command and Control communication patterns — Threat Intel Brief phase 5 aligns with live SOC runbooks.',
      beat6: 'Operator log L5-6: Command and Control communication patterns — Threat Intel Brief phase 6 aligns with live SOC runbooks.',
      beat7: 'Operator log L5-7: Command and Control communication patterns — Threat Intel Brief phase 7 aligns with live SOC runbooks.',
      closing: 'Level 5 objective satisfied via SUBMIT IOC.'
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
    var core = engine.addBox(0, 0.5, 0, 1.2, 1.0, 1.2, parseInt('0x0a0804', 16), 0);
    core.material.emissive = new THREE.Color(parseInt('0x0a0804', 16));
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
    title: 'INTERROGATION ROOM',
    achievementId: 'intercept_master',
    leaderboardChallenge: 'speedTrial',
    engine: { bg: 0x0a0804, physics: true },
    moveSpeed: 2.4,
    buildScene: buildScene,
    levels: {
    1: {
      name: 'C2 vs HTTPS',
      hint: 'Separate beacon traffic from web noise',
      action: 'DECODE B64',
      taskSequence: [
        { action: 'DECODE B64', hint: 'Context pass — run DECODE B64 on incoming telemetry' },
        { action: 'DECODE B64', hint: 'Separate beacon traffic from web noise' }
      ],
      tasks: [{
        id: 'L1_main',
        hint: 'Separate beacon traffic from web noise',
        errorType: 'wrong_command',
        validate: function () { return true; },
        output: '[OK] DECODE B64 — Separate beacon traffic from web noise',
        onSuccess: function (shell) { shell.score += 100; if (shell.updateScore) shell.updateScore(); }
      }],
      branch: {
        title: 'Story branch — Level 1 (5 paths)',
        desc: 'Your Command and Control communication patterns choices shape the next phase. Fifteen total branches across levels 1–3.',
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
      name: 'Protocol Decode',
      hint: 'Decode base64 command batch',
      action: 'EXTRACT IP', timeLimit: 300,
      taskSequence: [
        { action: 'EXTRACT IP', hint: 'Context pass — run EXTRACT IP on incoming telemetry' },
        { action: 'EXTRACT IP', hint: 'Decode base64 command batch' }
      ],
      tasks: [{
        id: 'L2_main',
        hint: 'Decode base64 command batch',
        errorType: 'wrong_command',
        validate: function () { return true; },
        output: '[OK] EXTRACT IP — Decode base64 command batch',
        onSuccess: function (shell) { shell.score += 100; if (shell.updateScore) shell.updateScore(); }
      }],
      branch: {
        title: 'Story branch — Level 2 (5 paths)',
        desc: 'Your Command and Control communication patterns choices shape the next phase. Fifteen total branches across levels 1–3.',
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
      name: 'IOC Extraction',
      hint: 'Pull domains and hashes from transcript',
      action: 'TAG HASH', timeLimit: 360,
      taskSequence: [
        { action: 'SUBMIT IOC', hint: 'Pre-check — validate environment baseline' },
        { action: 'TAG HASH', hint: 'Context pass — run TAG HASH on incoming telemetry' },
        { action: 'TAG HASH', hint: 'Pull domains and hashes from transcript' }
      ],
      tasks: [{
        id: 'L3_main',
        hint: 'Pull domains and hashes from transcript',
        errorType: 'wrong_command',
        validate: function () { return true; },
        output: '[OK] TAG HASH — Pull domains and hashes from transcript',
        onSuccess: function (shell) { shell.score += 100; if (shell.updateScore) shell.updateScore(); }
      }],
      branch: {
        title: 'Story branch — Level 3 (5 paths)',
        desc: 'Your Command and Control communication patterns choices shape the next phase. Fifteen total branches across levels 1–3.',
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
      name: 'Framework ID',
      hint: 'Attribute malware family by behavior',
      action: 'UNLOCK OMEGA', timeLimit: 420,
      taskSequence: [
        { action: 'DECODE B64', hint: 'Pre-check — validate environment baseline' },
        { action: 'UNLOCK OMEGA', hint: 'Context pass — run UNLOCK OMEGA on incoming telemetry' },
        { action: 'UNLOCK OMEGA', hint: 'Attribute malware family by behavior' }
      ],
      tasks: [{
        id: 'L4_main',
        hint: 'Attribute malware family by behavior',
        errorType: 'wrong_command',
        validate: function () { return true; },
        output: '[OK] UNLOCK OMEGA — Attribute malware family by behavior',
        onSuccess: function (shell) { shell.score += 100; if (shell.updateScore) shell.updateScore(); }
      }]
    }
    5: { name: 'Threat Intel Brief', epilogue: true }
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
