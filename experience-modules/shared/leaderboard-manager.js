/**
 * HABIBI-SIEM — leaderboard: local + GitHub JSON sync
 */
(function (global) {
  'use strict';

  var KEY = 'habibi-leaderboards-v1';
  var PENDING_KEY = 'habibi-leaderboards-pending-v1';
  var MAX = 10;
  var BASE = '/experience-modules/leaderboards/';

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (_) { /* */ }
  }

  function loadPending() {
    try {
      var raw = localStorage.getItem(PENDING_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function savePending(list) {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify(list));
    } catch (_) { /* */ }
  }

  function boardKey(gameId, challengeId, storyPath) {
    return gameId + '::' + challengeId + '::' + (storyPath || 'any');
  }

  function fileName(gameId, challengeId, storyPath) {
    return gameId + '-' + challengeId + '-' + (storyPath || 'any') + '.json';
  }

  function mergeEntries(a, b) {
    var combined = (a || []).concat(b || []);
    combined.sort(function (x, y) { return y.score - x.score; });
    var seen = {};
    var out = [];
    combined.forEach(function (e) {
      var k = e.playerName + '::' + e.score + '::' + e.date;
      if (seen[k]) return;
      seen[k] = true;
      out.push(e);
    });
    return out.slice(0, MAX);
  }

  function submit(gameId, challengeId, entry, storyPath) {
    var data = load();
    var k = boardKey(gameId, challengeId, storyPath);
    if (!data[k]) data[k] = [];
    var row = {
      score: entry.score,
      playerName: entry.playerName || 'Operator',
      date: new Date().toISOString().slice(0, 10),
      storyPath: storyPath || 'any',
      skillChallenge: challengeId,
      meta: entry.meta || {}
    };
    data[k].push(row);
    data[k].sort(function (a, b) { return b.score - a.score; });
    data[k] = data[k].slice(0, MAX);
    save(data);
    queueForGitHub(gameId, challengeId, storyPath, row);
    return data[k];
  }

  function queueForGitHub(gameId, challengeId, storyPath, row) {
    var pending = loadPending();
    pending.push({
      gameId: gameId,
      challengeId: challengeId,
      storyPath: storyPath || 'any',
      entry: row,
      at: Date.now()
    });
    savePending(pending.slice(-50));
  }

  function syncFromGitHub(gameId, challengeId, storyPath) {
    var k = boardKey(gameId, challengeId, storyPath);
    var url = BASE + fileName(gameId, challengeId, storyPath);
    return fetch(url).then(function (res) {
      if (!res.ok) return getTop(gameId, challengeId, storyPath);
      return res.json().then(function (remote) {
        var data = load();
        var local = data[k] || [];
        var merged = mergeEntries(local, remote.entries || []);
        data[k] = merged;
        save(data);
        return merged;
      });
    }).catch(function () {
      return getTop(gameId, challengeId, storyPath);
    });
  }

  function syncAllFromManifest() {
    return fetch(BASE + 'manifest.json').then(function (res) {
      if (!res.ok) return [];
      return res.json();
    }).then(function (manifest) {
      if (!manifest || !manifest.boards) return [];
      return Promise.all(manifest.boards.map(function (b) {
        if (typeof b === 'string') {
          return syncFromGitHub(b.split('-')[0], 'speedTrial', 'any');
        }
        return syncFromGitHub(b.gameId, b.challengeId, b.storyPath);
      }));
    }).catch(function () { return []; });
  }

  function exportPendingJson() {
    var pending = loadPending();
    var blob = new Blob([JSON.stringify({ pending: pending, exported: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'habibi-leaderboard-export-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function getTop(gameId, challengeId, storyPath) {
    var data = load();
    return data[boardKey(gameId, challengeId, storyPath)] || [];
  }

  function renderList(container, gameId, challengeId, storyPath) {
    syncFromGitHub(gameId, challengeId, storyPath).then(function (rows) {
      if (!rows.length) {
        container.innerHTML = '<p class="lb-empty">No scores yet — be first.</p>';
        return;
      }
      container.innerHTML = rows.map(function (r, i) {
        return '<div class="lb-row"><span>#' + (i + 1) + '</span><span>' + escapeHtml(r.playerName) + '</span><span>' + r.score + '</span><span>' + r.date + '</span></div>';
      }).join('');
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  global.HabibiLeaderboard = {
    submit: submit,
    getTop: getTop,
    renderList: renderList,
    syncFromGitHub: syncFromGitHub,
    syncAllFromManifest: syncAllFromManifest,
    exportPendingJson: exportPendingJson,
    MAX: MAX,
    BASE: BASE
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      HabibiLeaderboard.syncAllFromManifest();
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
