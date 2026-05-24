/**
 * Operation MERIDIAN-7 — Analyst Debrief Report generator
 */
(function (global) {
  'use strict';

  var GAMES = [
    { id: 'the_terminal', name: 'THE TERMINAL', concept: 'CLI Threat Reconnaissance', framework: 'MITRE T1059', approachKey: 'branch_thorough' },
    { id: 'the_breach', name: 'THE BREACH', concept: 'Incident Response Triage', framework: 'NIST RS.RP-1', approachKey: 'branch_evidence' },
    { id: 'the_ghost_network', name: 'THE GHOST NETWORK', concept: 'Network Traffic Analysis', framework: 'MITRE T1021', approachKey: 'branch_thorough' },
    { id: 'the_cipher', name: 'THE CIPHER', concept: 'Cryptographic Attack Recognition', framework: 'MITRE T1573', approachKey: 'branch_thorough' },
    { id: 'the_simulation', name: 'THE SIMULATION', concept: 'Cyber Kill Chain Analysis', framework: 'PTES Exploitation', approachKey: 'branch_speed' },
    { id: 'the_interrogation_room', name: 'THE INTERROGATION', concept: 'C2 Communication Analysis', framework: 'MITRE T1071', approachKey: 'branch_thorough' },
    { id: 'the_forge', name: 'THE FORGE', concept: 'Detection Rule Engineering', framework: 'SIGMA/YARA', approachKey: 'branch_evidence' },
    { id: 'the_deep_archive', name: 'THE DEEP ARCHIVE', concept: 'Log Forensics + Timeline', framework: 'NIST DE.AE-3', approachKey: 'branch_thorough' },
    { id: 'the_heist', name: 'THE HEIST', concept: 'Red Team Attack Planning', framework: 'PTES Pre-engagement', approachKey: 'branch_speed' },
    { id: 'the_lab', name: 'THE LAB', concept: 'Malware Static/Dynamic Analysis', framework: 'MITRE TA0002', approachKey: 'branch_thorough' },
    { id: 'the_cartography', name: 'THE CARTOGRAPHY', concept: 'Threat Actor Attribution', framework: 'MITRE Groups', approachKey: 'branch_evidence' },
    { id: 'the_memorial', name: 'THE MEMORIAL', concept: 'Post-Incident Analysis', framework: 'NIST RC.IM-1', approachKey: 'branch_evidence' },
    { id: 'the_resonance', name: 'THE RESONANCE', concept: 'Detection Rule Optimisation', framework: 'SIGMA tuning', approachKey: 'branch_thorough' }
  ];

  function loadProgress(gameId) {
    try {
      var raw = localStorage.getItem('habibi-xp-' + gameId);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function loadLeaderboards() {
    try {
      return JSON.parse(localStorage.getItem('habibi-leaderboards-v1') || '{}');
    } catch (e) {
      return {};
    }
  }

  function inferApproach(prog) {
    if (!prog || !prog.storyChoices) return 'Balanced';
    var s = JSON.stringify(prog.storyChoices);
    if (/thorough|evidence|investigate|document/i.test(s)) return 'Thorough';
    if (/speed|aggressive|immediate|block/i.test(s)) return 'Aggressive';
    return 'Balanced';
  }

  function countApproaches() {
    var thorough = 0;
    var aggressive = 0;
    GAMES.forEach(function (g) {
      var p = loadProgress(g.id);
      var a = inferApproach(p);
      if (a === 'Thorough') thorough++;
      if (a === 'Aggressive') aggressive++;
    });
    return { thorough: thorough, aggressive: aggressive };
  }

  function formatDate(ts) {
    if (!ts) return '—';
    return new Date(ts).toISOString().slice(0, 10);
  }

  function renderDebrief(container) {
    if (!container) return;
    var narrative = {};
    try {
      narrative = JSON.parse(localStorage.getItem('habibi_narrative') || '{}');
    } catch (e) { /* */ }

    var firstTs = null;
    var lastTs = null;
    var totalPlay = 0;
    var completed = 0;

    GAMES.forEach(function (g) {
      var p = loadProgress(g.id);
      var n = narrative[g.id];
      if (p && p.completedLevels && p.completedLevels.indexOf(5) >= 0) completed++;
      if (p && p.totalPlayTime) totalPlay += p.totalPlayTime;
      if (n && n.timestamp) {
        if (!firstTs || n.timestamp < firstTs) firstTs = n.timestamp;
        if (!lastTs || n.timestamp > lastTs) lastTs = n.timestamp;
      }
    });

    var approaches = countApproaches();
    var lb = loadLeaderboards();
    var html = '';

    html += '<header class="debrief-header"><h1>OPERATION MERIDIAN-7 — ANALYST DEBRIEF REPORT</h1></header>';

    html += '<section class="debrief-section"><h2>Engagement Summary</h2><ul>';
    html += '<li>Date range: ' + formatDate(firstTs) + ' → ' + formatDate(lastTs) + '</li>';
    html += '<li>Total play time: ' + Math.floor(totalPlay / 60) + ' minutes</li>';
    html += '<li>Games completed: ' + completed + '/13</li>';
    html += '<li>Story path: evidence-first ' + approaches.thorough + '/13 · aggressive containment ' + approaches.aggressive + '/13</li>';
    html += '</ul></section>';

    html += '<section class="debrief-section"><h2>Skills Demonstrated</h2><table class="debrief-table"><thead><tr><th>Game</th><th>Concept</th><th>Framework</th><th>Approach</th></tr></thead><tbody>';
    GAMES.forEach(function (g) {
      var p = loadProgress(g.id);
      var done = p && p.completedLevels && p.completedLevels.length >= 4;
      html += '<tr class="' + (done ? 'done' : 'pending') + '"><td>' + g.name + '</td><td>' + g.concept + '</td><td>' + g.framework + '</td><td>' + inferApproach(p) + '</td></tr>';
    });
    html += '</tbody></table></section>';

    html += '<section class="debrief-section"><h2>Skill Challenge Scores</h2><ul class="debrief-scores">';
    Object.keys(lb).forEach(function (key) {
      var rows = lb[key];
      if (!rows || !rows.length) return;
      var top = rows[0];
      html += '<li>' + key.replace(/::/g, ' · ') + ' — ' + top.score + ' (' + top.playerName + ')</li>';
    });
    if (!Object.keys(lb).length) html += '<li>No skill scores recorded yet.</li>';
    html += '</ul></section>';

    html += '<section class="debrief-section"><h2>Decision Analysis</h2><p>';
    if (approaches.thorough >= 9) {
      html += 'You consistently chose investigation before action (' + approaches.thorough + '/13 games) — evidence-driven Tier 2/3 SOC methodology.';
    } else if (approaches.aggressive >= 4) {
      html += 'You chose aggressive containment in ' + approaches.aggressive + '/13 games — appropriate for high-severity MERIDIAN-7 incidents.';
    } else {
      html += 'Mixed posture across ' + completed + ' completed modules — balanced speed and evidence preservation.';
    }
    html += '</p></section>';

    html += '<section class="debrief-section"><h2>Framework Coverage (NIST CSF)</h2><div class="nist-grid">';
    html += '<div><strong>Identify</strong><br>The Cartography, The Memorial</div>';
    html += '<div><strong>Protect</strong><br>The Forge, The Resonance</div>';
    html += '<div><strong>Detect</strong><br>The Terminal, The Breach, Ghost Network</div>';
    html += '<div><strong>Respond</strong><br>The Breach, The Simulation</div>';
    html += '<div><strong>Recover</strong><br>The Memorial</div>';
    html += '</div></section>';

    container.innerHTML = html;
  }

  global.HabibiDebrief = { render: renderDebrief, GAMES: GAMES };

  document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('debrief-content');
    if (el) renderDebrief(el);
  });
})(typeof window !== 'undefined' ? window : globalThis);
