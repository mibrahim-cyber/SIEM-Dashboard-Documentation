/**
 * Operation MERIDIAN-7 — connected narrative engine
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'habibi_narrative';
  var GAME_SEQUENCE = [
    'the_terminal', 'the_breach', 'the_ghost_network', 'the_cipher', 'the_simulation',
    'the_interrogation_room', 'the_forge', 'the_deep_archive', 'the_heist', 'the_lab',
    'the_cartography', 'the_memorial', 'the_resonance'
  ];

  var NEXT_GAME = {
    the_terminal: { name: 'The Breach', url: 'experience-modules/game2-breach/index.html' },
    the_breach: { name: 'The Ghost Network', url: 'experience-modules/game3-network/index.html' },
    the_ghost_network: { name: 'The Cipher', url: 'experience-modules/game4-cipher/index.html' },
    the_cipher: { name: 'The Simulation', url: 'experience-modules/game5-simulation/index.html' },
    the_simulation: { name: 'The Interrogation Room', url: 'experience-modules/game6-intercept/index.html' },
    the_interrogation_room: { name: 'The Forge', url: 'experience-modules/game7-forge/index.html' },
    the_forge: { name: 'The Deep Archive', url: 'experience-modules/game8-archive/index.html' },
    the_deep_archive: { name: 'The Heist', url: 'experience-modules/game9-heist/index.html' },
    the_heist: { name: 'The Lab', url: 'experience-modules/game10-lab/index.html' },
    the_lab: { name: 'The Cartography', url: 'experience-modules/game11-cartography/index.html' },
    the_cartography: { name: 'The Memorial', url: 'experience-modules/game12-memorial/index.html' },
    the_memorial: { name: 'The Resonance', url: 'experience-modules/game13-resonance/index.html' },
    the_resonance: { name: 'Debrief Report', url: 'debrief.html' }
  };

  function NarrativeEngine() {
    this.storyState = this.loadStoryState();
  }

  NarrativeEngine.prototype.loadStoryState = function () {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  };

  NarrativeEngine.prototype.saveStoryState = function () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.storyState));
    } catch (e) { /* quota */ }
  };

  NarrativeEngine.prototype.loadGameProgress = function (gameId) {
    try {
      var raw = localStorage.getItem('habibi-xp-' + gameId);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  NarrativeEngine.prototype.recordGameComplete = function (gameId, choices) {
    this.storyState[gameId] = {
      complete: true,
      choices: choices || {},
      timestamp: Date.now()
    };
    this.saveStoryState();
    var next = NEXT_GAME[gameId];
    if (next) this.showUnlockBanner(next.name, next.url);
    try {
      global.dispatchEvent(new CustomEvent('habibi-game-complete', { detail: { gameId: gameId, choices: choices } }));
    } catch (e) { /* */ }
  };

  NarrativeEngine.prototype.getContextForGame = function (gameId) {
    var t = this.loadGameProgress('the_terminal');
    var b = this.loadGameProgress('the_breach');
    var contexts = {
      the_breach: t ? (
        t.storyChoices && /thorough|evidence|investigate/i.test(JSON.stringify(t.storyChoices)) ?
          'Your thorough Terminal recon surfaced full auth context for the Breach briefing.' :
          'Your fast Terminal run left gaps — triage carefully during the Breach.'
      ) : '',
      the_ghost_network: b ?
        'Breach investigation flagged compromised account svc.report — watch for its connections in the network graph.' : '',
      the_cipher: this.storyState.the_ghost_network ?
        'Lateral path WS-003 → DC-01 → DB-01 suggests encrypted C2 followed the pivot.' : '',
      the_simulation: this.storyState.the_cipher ?
        'Decoded C2 referenced CVE-2024-36401 delivery — map it on the kill chain timeline.' : '',
      the_interrogation_room: this.storyState.the_simulation ?
        'Kill-chain review isolated HTTPS beaconing to 172.67.34.221 — decode those sessions.' : '',
      the_forge: this.storyState.the_interrogation_room ?
        'Extracted IOCs include sqlmap/1.8.2 and PsExec lateral T1021.002 — codify detections.' : '',
      the_deep_archive: this.storyState.the_forge ?
        'New Sigma rules must align with auth.log and VPN timelines from MERIDIAN-7.' : '',
      the_heist: this.storyState.the_deep_archive ?
        'Forensic timeline shows exfil at 20:25:18Z — plan the attacker path in reverse.' : '',
      the_lab: this.storyState.the_heist ?
        'Heist path reused staging host 10.22.44.19 — analyse the dropped sample.' : '',
      the_cartography: this.storyState.the_lab ?
        'Malware family markers match Eastern Europe cluster Sable Kestrel.' : '',
      the_memorial: this.storyState.the_cartography ?
        'Attribution: Sable Kestrel, MITRE G0119. Document root cause and remediation.' : '',
      the_resonance: this.storyState.the_memorial ?
        'Post-mortem complete — tune production rules for >90% detection, <5% FP.' : ''
    };
    return contexts[gameId] || '';
  };

  NarrativeEngine.prototype.showUnlockBanner = function (nextGameName, nextGameUrl) {
    /* Resolve site-root relative URL against current page depth */
    var resolvedUrl = (window.SiemCore && window.SiemCore.resolveSiteHref)
      ? window.SiemCore.resolveSiteHref(nextGameUrl)
      : nextGameUrl;
    nextGameUrl = resolvedUrl;
    var existing = document.getElementById('habibi-unlock-banner');
    if (existing) existing.remove();
    var banner = document.createElement('div');
    banner.id = 'habibi-unlock-banner';
    banner.style.cssText = [
      'position:fixed;top:0;left:0;right:0;',
      'background:linear-gradient(90deg,#0a0020,#1a0040,#0a0020);',
      'border-bottom:2px solid #CC66FF;color:#CC66FF;',
      'font-family:"Courier New",monospace;text-align:center;padding:16px;',
      'z-index:10000;font-size:14px;'
    ].join('');
    banner.innerHTML = '\u25B6 OPERATION MERIDIAN-7 — PHASE COMPLETE &nbsp;|&nbsp; ' +
      '<a href="' + nextGameUrl + '" style="color:#FF4466;text-decoration:underline;">Proceed to ' + nextGameName + '</a>' +
      '<span style="float:right;cursor:pointer;padding:0 16px;" id="habibi-unlock-close">\u2715</span>';
    document.body.prepend(banner);
    document.getElementById('habibi-unlock-close').onclick = function () { banner.remove(); };
  };

  NarrativeEngine.prototype.getCompletedCount = function () {
    var n = 0;
    GAME_SEQUENCE.forEach(function (gid) {
      if (this.storyState[gid] && this.storyState[gid].complete) n++;
    }, this);
    return n;
  };

  global.HabibiNarrative = new NarrativeEngine();
})(typeof window !== 'undefined' ? window : globalThis);
