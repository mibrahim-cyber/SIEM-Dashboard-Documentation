/**
 * HABIBI-SIEM — shared game shell UI + level flow controller
 */
(function (global) {
  'use strict';

  function GameShell(config) {
    this.config = config;
    this.gameId = config.gameId;
    this.title = config.title;
    this.state = HabibiProgression.load(this.gameId);
    this.levelState = null;
    this.engine = null;
    this.sessionStart = Date.now();
    this.levelTimer = null;
    this.levelSecondsLeft = 0;
    this.onTick = config.onTick || null;
    this.onCommand = config.onCommand || null;
  }

  GameShell.prototype.$ = function (id) { return document.getElementById(id); };

  GameShell.prototype.init = function () {
    var self = this;
    if (typeof THREE === 'undefined') {
      this.$('task-text').textContent = 'Three.js failed to load.';
      return;
    }
    this.engine = new HabibiGameEngine(this.$('canvas-host'), Object.assign({ physics: true }, this.config.engine || { bg: 0x0a0618 }));
    if (this.config.buildScene) this.config.buildScene(this.engine, this.state.currentLevel, this);
    this.levelState = this.initLevelState(this.state.currentLevel);
    this.bindTerminal();
    this.bindUI();
    this.renderSkillList();
    this.renderLeaderboard();
    this.showLevelIntro(this.state.currentLevel);
    this.engine.start(function (dt) {
      if (self.config.onTick) self.config.onTick(dt, self);
      self.engine.updateCameraWASD(dt, self.config.moveSpeed || 2.2);
    });
    this.startLevelTimerIfNeeded(this.state.currentLevel);
    var inp = this.$('term-in');
    if (inp) inp.focus();
  };

  GameShell.prototype.initLevelState = function (levelNum) {
    var def = this.config.levels[levelNum];
    return {
      level: levelNum,
      taskIdx: 0,
      tasks: def && def.tasks ? def.tasks.slice() : [],
      completed: false,
      extras: {}
    };
  };

  GameShell.prototype.bindTerminal = function () {
    var self = this;
    var form = this.$('term-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var cmd = self.$('term-in').value.trim();
      if (!cmd) return;
      self.appendOut('> ' + cmd);
      self.$('term-in').value = '';
      if (self.onCommand) {
        self.onCommand(cmd, self);
        return;
      }
      self.processCommand(cmd);
    });
  };

  GameShell.prototype.processCommand = function (cmd) {
    if (this.state.currentLevel === 5 && this.config.levels[5].epilogue) {
      this.runEpilogue();
      return;
    }
    if (!this.levelState || this.levelState.completed) return;
    var task = this.levelState.tasks[this.levelState.taskIdx];
    if (!task) return;
    var ok = task.validate ? task.validate(cmd, this) : cmd.toLowerCase() === task.cmd.toLowerCase();
    if (ok) {
      if (task.output) this.appendOut(task.output);
      if (task.onSuccess) task.onSuccess(this);
      this.levelState.taskIdx++;
      if (this.levelState.taskIdx >= this.levelState.tasks.length) {
        this.onLevelTasksComplete();
      } else {
        this.setTaskText(this.levelState.tasks[this.levelState.taskIdx]);
      }
    } else {
      HabibiProgression.logFailure(this.gameId, this.state.currentLevel, task.id || 'wrong', this.state);
      var n = HabibiProgression.getFailureCount(this.gameId, this.state.currentLevel, task.id || 'wrong', this.state);
      var fb = HabibiLearning.getFailureFeedback(this.gameId, this.state.currentLevel, task.errorType || 'wrong_command', n);
      this.appendOut('Objective not satisfied.');
      if (fb) this.appendOut('[TUTOR] ' + fb);
    }
  };

  GameShell.prototype.onLevelTasksComplete = function () {
    var self = this;
    this.levelState.completed = true;
    clearInterval(this.levelTimer);
    HabibiProgression.markLevelComplete(this.gameId, this.state.currentLevel, this.state);
    this.state = HabibiProgression.load(this.gameId);
    var lv = this.state.currentLevel;
    this.$('complete-title').textContent = 'Level ' + lv + ' complete';
    this.$('complete-msg').textContent = (this.config.levels[lv] && this.config.levels[lv].name) || 'Objectives satisfied.';
    this.$('complete-realworld').textContent = HabibiLearning.getRealWorldConnection(this.gameId, lv) || '';
    this.$('level-complete').classList.remove('hidden');
    this.unlockSkillsForLevel(lv);
    if (this.config.onLevelComplete) this.config.onLevelComplete(lv, this);
  };

  GameShell.prototype.bindUI = function () {
    var self = this;
    this.$('btn-continue').addEventListener('click', function () {
      self.$('level-complete').classList.add('hidden');
      var def = self.config.levels[self.state.currentLevel];
      if (def && def.branch) {
        self.showBranch(def.branch, 'level' + self.state.currentLevel);
      } else {
        self.advanceLevel();
      }
    });
  };

  GameShell.prototype.showBranch = function (branch, levelKey) {
    var self = this;
    this.$('branch-title').textContent = branch.title;
    this.$('branch-desc').textContent = branch.desc;
    var btns = this.$('branch-btns');
    btns.innerHTML = '';
    branch.options.forEach(function (opt) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = opt.label;
      b.addEventListener('click', function () {
        HabibiProgression.recordStoryChoice(self.gameId, levelKey, opt.id, self.state);
        self.state = HabibiProgression.load(self.gameId);
        self.$('branch-overlay').classList.add('hidden');
        self.advanceLevel();
      });
      btns.appendChild(b);
    });
    this.$('branch-overlay').classList.remove('hidden');
  };

  GameShell.prototype.advanceLevel = function () {
    if (this.state.currentLevel >= 5) {
      this.runEpilogue();
      return;
    }
    this.state.currentLevel = Math.min(5, this.state.currentLevel + 1);
    HabibiProgression.save(this.gameId, this.state);
    this.rebuildScene();
    this.levelState = this.initLevelState(this.state.currentLevel);
    this.showLevelIntro(this.state.currentLevel);
    this.startLevelTimerIfNeeded(this.state.currentLevel);
  };

  GameShell.prototype.rebuildScene = function () {
    if (this.engine.clearPhysics) this.engine.clearPhysics();
    while (this.engine.scene.children.length > 3) {
      this.engine.scene.remove(this.engine.scene.children[this.engine.scene.children.length - 1]);
    }
    if (this.config.buildScene) this.config.buildScene(this.engine, this.state.currentLevel, this);
  };

  GameShell.prototype.showLevelIntro = function (n) {
    var def = this.config.levels[n];
    this.$('hud-level').textContent = 'LEVEL ' + n + (def ? ' · ' + def.name : '');
    if (n === 5 && def && def.epilogue) {
      this.setTaskText('Epilogue — complete debrief to unlock next module.');
      return;
    }
    if (def && def.tasks && def.tasks.length) {
      this.setTaskText('Task 1/' + def.tasks.length + ': ' + (def.tasks[0].hint || def.tasks[0].cmd));
      this.appendOut('\n--- ' + def.name.toUpperCase() + ' ---\n');
    }
    if (this.config.onLevelStart) this.config.onLevelStart(n, this);
  };

  GameShell.prototype.runEpilogue = function () {
    var self = this;
    HabibiLearning.showReflectionModal(this.gameId, this.state.storyChoices, {}).then(function () {
      HabibiProgression.markLevelComplete(self.gameId, 5, self.state);
      self.state = HabibiProgression.load(self.gameId);
      HabibiProgression.addAchievement(self.gameId, self.config.achievementId || (self.gameId + '_master'), self.state);
      HabibiProgression.unlockNextGame(self.gameId);
      HabibiProgression.addPlayTime(self.gameId, Math.floor((Date.now() - self.sessionStart) / 1000), self.state);
      self.setTaskText('Epilogue complete. Next module unlocked in progression chain.');
      self.appendOut('\n=== EPILOGUE COMPLETE ===\nNext game unlocked.');
      try {
        global.dispatchEvent(new CustomEvent('habibi-game-complete', {
          detail: { gameId: self.gameId, choices: self.state.storyChoices || {} }
        }));
      } catch (_) { /* */ }
    });
  };

  GameShell.prototype.startLevelTimerIfNeeded = function (n) {
    var def = this.config.levels[n];
    if (!def || !def.timeLimit) {
      this.$('hud-timer').textContent = '';
      return;
    }
    var self = this;
    this.levelSecondsLeft = def.timeLimit;
    clearInterval(this.levelTimer);
    this.levelTimer = setInterval(function () {
      self.levelSecondsLeft--;
      self.$('hud-timer').textContent = self.formatTime(self.levelSecondsLeft);
      if (self.levelSecondsLeft <= 0) {
        clearInterval(self.levelTimer);
        self.appendOut('[TIME] Level window expired — retry objectives.');
        self.levelState.taskIdx = 0;
      }
    }, 1000);
  };

  GameShell.prototype.formatTime = function (s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  };

  GameShell.prototype.setTaskText = function (t) { this.$('task-text').textContent = t; };
  GameShell.prototype.appendOut = function (t) {
    var el = this.$('term-out');
    if (!el) return;
    el.textContent += t + '\n';
    el.scrollTop = el.scrollHeight;
  };

  GameShell.prototype.unlockSkillsForLevel = function (lv) {
    var self = this;
    (this.config.skills || []).forEach(function (sk) {
      if (lv >= sk.unlockAfter) HabibiProgression.unlockSkillChallenge(self.gameId, sk.id, self.state);
    });
    this.state = HabibiProgression.load(this.gameId);
    this.renderSkillList();
  };

  GameShell.prototype.renderSkillList = function () {
    var ul = this.$('skill-list');
    if (!ul) return;
    ul.innerHTML = '';
    var self = this;
    (this.config.skills || []).forEach(function (sk) {
      var ch = self.state.skillChallenges[sk.id];
      var li = document.createElement('li');
      li.textContent = sk.name + (ch && ch.unlocked ? ' ✓' : ' (locked)');
      if (!ch || !ch.unlocked) li.className = 'locked';
      li.title = sk.desc;
      if (ch && ch.unlocked && sk.start) li.addEventListener('click', function () { sk.start(self); });
      ul.appendChild(li);
    });
  };

  GameShell.prototype.renderLeaderboard = function () {
    var el = this.$('lb-speed');
    if (!el || !this.config.leaderboardChallenge) return;
    HabibiLeaderboard.renderList(el, this.gameId, this.config.leaderboardChallenge, this.getStoryPath());
  };

  GameShell.prototype.getStoryPath = function () {
    return (this.state.storyChoices && this.state.storyChoices.level1) || 'any';
  };

  GameShell.prototype.submitScore = function (challengeId, score) {
    HabibiProgression.recordSkillScore(this.gameId, challengeId, score, 'medium', this.state);
    HabibiLeaderboard.submit(this.gameId, challengeId, { score: score, playerName: 'Operator' }, this.getStoryPath());
    this.renderLeaderboard();
  };

  GameShell.prototype.clickObjective = function (objectiveId) {
    if (!this.levelState || this.levelState.completed) return;
    var task = this.levelState.tasks[this.levelState.taskIdx];
    if (!task || task.id !== objectiveId) return;
    if (task.output) this.appendOut(task.output);
    if (task.onSuccess) task.onSuccess(this);
    this.levelState.taskIdx++;
    if (this.levelState.taskIdx >= this.levelState.tasks.length) this.onLevelTasksComplete();
    else this.setTaskText(this.levelState.tasks[this.levelState.taskIdx]);
  };

  global.HabibiGameShell = GameShell;
})(typeof window !== 'undefined' ? window : globalThis);
