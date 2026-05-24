/**
 * HABIBI-SIEM — local leaderboard (top 10 per challenge, split by story path)
 */
(function (global) {
  'use strict';

  var KEY = 'habibi-leaderboards-v1';
  var MAX = 10;

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

  function boardKey(gameId, challengeId, storyPath) {
    return gameId + '::' + challengeId + '::' + (storyPath || 'any');
  }

  function submit(gameId, challengeId, entry, storyPath) {
    var data = load();
    var k = boardKey(gameId, challengeId, storyPath);
    if (!data[k]) data[k] = [];
    data[k].push({
      score: entry.score,
      playerName: entry.playerName || 'Operator',
      date: new Date().toISOString().slice(0, 10),
      storyPath: storyPath || 'any',
      skillChallenge: challengeId,
      meta: entry.meta || {}
    });
    data[k].sort(function (a, b) { return b.score - a.score; });
    data[k] = data[k].slice(0, MAX);
    save(data);
    return data[k];
  }

  function getTop(gameId, challengeId, storyPath) {
    var data = load();
    return data[boardKey(gameId, challengeId, storyPath)] || [];
  }

  function renderList(container, gameId, challengeId, storyPath) {
    var rows = getTop(gameId, challengeId, storyPath);
    if (!rows.length) {
      container.innerHTML = '<p class="lb-empty">No scores yet — be first.</p>';
      return;
    }
    container.innerHTML = rows.map(function (r, i) {
      return '<div class="lb-row"><span>#' + (i + 1) + '</span><span>' + escapeHtml(r.playerName) + '</span><span>' + r.score + '</span><span>' + r.date + '</span></div>';
    }).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  global.HabibiLeaderboard = {
    submit: submit,
    getTop: getTop,
    renderList: renderList,
    MAX: MAX
  };
})(typeof window !== 'undefined' ? window : globalThis);
