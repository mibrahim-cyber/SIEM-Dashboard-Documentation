/**
 * Deck v2 features — evidence board, dossiers, architect zoom, war game, presence,
 * mission brief, temporal replay, sonification, DNA preview, constellation.
 */
(function () {
  'use strict';

  const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0];
  const EVIDENCE_KEY = 'siem-deck-evidence-v2';
  const PRESENCE_CH = 'siem-deck-presence-v2';

  let deck = null;
  let threatActors = {};
  let wargameScenarios = [];
  let timelineData = { events: [] };
  let evidenceOn = false;
  let constellationOn = false;
  let sonificationOn = false;
  let audioCtx = null;
  let ghostLayer = null;
  let evidenceLayer = null;
  let dossierAside = null;
  let timelineBar = null;
  let dnaPreview = null;
  let architectScale = 1;
  const ghosts = new Map();
  let presenceBc = null;
  let ghostId = 'ghost-' + Math.random().toString(36).slice(2, 8);

  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playNote(idx) {
    if (!sonificationOn) return;
    try {
      const ctx = ensureAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = PENTATONIC[idx % PENTATONIC.length];
      osc.type = 'sine';
      gain.gain.value = 0.04;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  }

  function alertChirp() {
    if (!sonificationOn) return;
    playNote(4);
    setTimeout(function () { playNote(2); }, 120);
  }

  /* ── 1 Evidence Board ── */
  function buildEvidenceBoard() {
    evidenceLayer = document.createElement('div');
    evidenceLayer.id = 'deck-evidence-board';
    evidenceLayer.hidden = true;
    evidenceLayer.innerHTML =
      '<div id="deck-evidence-cork">' +
      '<div class="deck-evidence-nebula" aria-hidden="true"></div>' +
      '<div class="deck-evidence-stars" aria-hidden="true"></div>' +
      '<header class="deck-evidence-head">' +
      '<strong>INCIDENT EVIDENCE GRID</strong>' +
      '<span>Toolbar tab or E to close · drag beacons · link modules</span>' +
      '</header>' +
      '<canvas id="deck-evidence-strings" aria-hidden="true"></canvas>' +
      '<div id="deck-evidence-pins"></div>' +
      '<label class="deck-evidence-notes-wrap">CASE NOTES<textarea id="deck-evidence-notes" rows="3" placeholder="Orbital comms log — tie beacons to your theory…"></textarea></label>' +
      '<footer class="deck-evidence-actions">' +
      '<button type="button" id="deck-evidence-add" class="deck-space-btn">◆ Drop beacon from hover</button>' +
      '</footer>' +
      '</div>';
    document.body.appendChild(evidenceLayer);
    document.getElementById('deck-evidence-add').addEventListener('click', addEvidencePin);
    const notes = document.getElementById('deck-evidence-notes');
    if (notes) {
      try { notes.value = localStorage.getItem('siem-deck-evidence-notes') || ''; } catch (_) {}
      notes.addEventListener('input', function () {
        try { localStorage.setItem('siem-deck-evidence-notes', notes.value); } catch (_) {}
      });
    }
    loadEvidencePins();
  }

  function loadEvidencePins() {
    try {
      const raw = localStorage.getItem(EVIDENCE_KEY);
      if (!raw) return;
      const pins = JSON.parse(raw);
      const container = document.getElementById('deck-evidence-pins');
      if (!container) return;
      pins.forEach(function (p) { placePin(p.x, p.y, p.label, false); });
      redrawEvidenceStrings();
    } catch (_) {}
  }

  function saveEvidencePins() {
    const pins = [];
    document.querySelectorAll('.deck-evidence-pin').forEach(function (el) {
      pins.push({
        x: parseFloat(el.style.left),
        y: parseFloat(el.style.top),
        label: el.dataset.label || '',
      });
    });
    try { localStorage.setItem(EVIDENCE_KEY, JSON.stringify(pins)); } catch (_) {}
  }

  function placePin(x, y, label, persist) {
    const container = document.getElementById('deck-evidence-pins');
    if (!container) return;
    const pin = document.createElement('div');
    pin.className = 'deck-evidence-pin';
    pin.style.left = x + '%';
    pin.style.top = y + '%';
    pin.dataset.label = label;
    pin.innerHTML = '<span class="deck-pin-core" aria-hidden="true"></span><span class="deck-pin-ring" aria-hidden="true"></span><span class="deck-pin-label">' + label.slice(0, 14) + '</span>';
    pin.title = label;
    makePinDraggable(pin);
    container.appendChild(pin);
    if (persist !== false) {
      saveEvidencePins();
      redrawEvidenceStrings();
    }
  }

  function makePinDraggable(pin) {
    let drag = false;
    pin.addEventListener('pointerdown', function (e) {
      drag = true;
      pin.setPointerCapture(e.pointerId);
    });
    pin.addEventListener('pointermove', function (e) {
      if (!drag) return;
      const cork = document.getElementById('deck-evidence-cork');
      const r = cork.getBoundingClientRect();
      pin.style.left = ((e.clientX - r.left) / r.width) * 100 + '%';
      pin.style.top = ((e.clientY - r.top) / r.height) * 100 + '%';
      redrawEvidenceStrings();
    });
    pin.addEventListener('pointerup', function () {
      drag = false;
      saveEvidencePins();
    });
  }

  function addEvidencePin() {
    const h = deck && deck.getHover ? deck.getHover() : null;
    const label = h ? h.label : 'Beacon';
    placePin(20 + Math.random() * 60, 20 + Math.random() * 50, label, true);
  }

  function redrawEvidenceStrings() {
    const c = document.getElementById('deck-evidence-strings');
    const cork = document.getElementById('deck-evidence-cork');
    if (!c || !cork) return;
    const r = cork.getBoundingClientRect();
    c.width = r.width;
    c.height = r.height;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    const pins = Array.from(document.querySelectorAll('.deck-evidence-pin'));
    for (let i = 0; i < pins.length - 1; i++) {
      const a = pins[i].getBoundingClientRect();
      const b = pins[i + 1].getBoundingClientRect();
      const x1 = a.left + a.width / 2 - r.left;
      const y1 = a.top + a.height / 2 - r.top;
      const x2 = b.left + b.width / 2 - r.left;
      const y2 = b.top + b.height / 2 - r.top;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, 'rgba(56,189,248,0.75)');
      grad.addColorStop(0.5, 'rgba(167,139,250,0.9)');
      grad.addColorStop(1, 'rgba(244,114,182,0.75)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(167,139,250,0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  function setEvidenceOpen(on) {
    evidenceOn = !!on;
    if (evidenceLayer) {
      evidenceLayer.hidden = !evidenceOn;
      evidenceLayer.setAttribute('aria-hidden', evidenceOn ? 'false' : 'true');
    }
    const btn = document.getElementById('deck-evidence-toggle');
    if (btn) btn.classList.toggle('on', evidenceOn);
    if (evidenceOn) redrawEvidenceStrings();
  }

  function toggleEvidence() {
    setEvidenceOpen(!evidenceOn);
  }

  /* ── 2 Threat Actor Dossiers ── */
  function buildDossierSidebar() {
    dossierAside = document.createElement('aside');
    dossierAside.id = 'deck-dossier-sidebar';
    dossierAside.innerHTML = '<header><strong>Known actors</strong></header><ul id="deck-dossier-list"></ul>';
    dossierAside.hidden = true;
    document.body.appendChild(dossierAside);
    const list = document.getElementById('deck-dossier-list');
    Object.keys(threatActors).forEach(function (name) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = name;
      btn.addEventListener('click', function () { highlightActorModules(threatActors[name].modules || []); });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function highlightActorModules(mods) {
    if (!deck || !deck.getNodes) return;
    const set = new Set(mods);
    deck.getNodes().forEach(function (n) {
      n._goldPulse = set.has(n.label);
    });
  }

  function toggleDossiers() {
    if (dossierAside) dossierAside.hidden = !dossierAside.hidden;
  }

  function dossierNodeAlpha(n, alpha) {
    if (n._goldPulse) return Math.min(1, alpha + 0.25);
    return alpha;
  }

  function dossierNodeScale(n) {
    return n._goldPulse ? 1.15 : 1;
  }

  /* ── 3 Architect Zoom ── */
  function hookArchitectZoom() {
    const canvas = deck.getCanvas && deck.getCanvas();
    if (!canvas) return;
    canvas.addEventListener('dblclick', function (e) {
      const h = deck.getHover && deck.getHover();
      if (h) return;
      const wh = deck.wormholeHit && deck.wormholeHit(e.clientX, e.clientY);
      if (wh) return;
      e.preventDefault();
      e.stopPropagation();
      architectScale = Math.min(2.4, architectScale * 1.18);
      if (deck.focusWorldAtScreen) deck.focusWorldAtScreen(e.clientX, e.clientY, architectScale);
    }, true);
  }

  /* ── 4 War Game Mode ── */
  function runWargame(id) {
    const sc = wargameScenarios.find(function (s) { return s.id === id; }) || wargameScenarios[0];
    if (!sc || !deck) return;
    let i = 0;
    function step() {
      if (i >= sc.path.length) return;
      const label = sc.path[i++];
      const n = deck.nodeByLabel && deck.nodeByLabel(label);
      if (n && deck.frameNode) deck.frameNode(n);
      else if (deck.navigateToModule) deck.navigateToModule(label);
      setTimeout(step, 1400);
    }
    if (deck.openDeckBrief && sc.path[0]) {
      const n = deck.nodeByLabel(sc.path[0]);
      if (n) deck.openDeckBrief(n.label);
    }
    step();
  }

  function populateWargameSelect() {
    const sel = document.getElementById('deck-wargame-select');
    if (!sel) return;
    wargameScenarios.forEach(function (s) {
      const o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.title;
      sel.appendChild(o);
    });
  }

  /* ── 5 Live Presence Ghosts ── */
  function initPresence() {
    try {
      presenceBc = new BroadcastChannel(PRESENCE_CH);
      presenceBc.onmessage = function (ev) {
        if (!ev.data || ev.data.id === ghostId) return;
        ghosts.set(ev.data.id, { x: ev.data.x, y: ev.data.y, label: ev.data.label || 'peer' });
      };
    } catch (_) {
      presenceBc = null;
    }
    if (!ghostLayer) {
      ghostLayer = document.createElement('div');
      ghostLayer.id = 'deck-presence-ghosts';
      document.body.appendChild(ghostLayer);
    }
    setInterval(broadcastPresence, 2000);
    setInterval(drawGhosts, 500);
  }

  function broadcastPresence() {
    if (!presenceBc || !deck) return;
    const h = deck.getHover && deck.getHover();
    presenceBc.postMessage({
      id: ghostId,
      x: h ? h.x : 0,
      y: h ? h.y : 0,
      label: h ? h.label : '',
    });
  }

  function drawGhosts() {
    if (!ghostLayer || !deck || !deck.worldToScreen) return;
    ghostLayer.innerHTML = '';
    ghosts.forEach(function (g) {
      const p = deck.worldToScreen(g, { parallax: false, shake: false });
      const el = document.createElement('div');
      el.className = 'deck-presence-ghost';
      el.style.left = p.sx + 'px';
      el.style.top = p.sy + 'px';
      el.title = g.label;
      ghostLayer.appendChild(el);
    });
  }

  let missionTimer = null;
  let missionActive = false;

  function stopMission() {
    missionActive = false;
    if (missionTimer) {
      clearTimeout(missionTimer);
      missionTimer = null;
    }
    const panel = document.getElementById('deck-mission-output');
    if (panel) panel.hidden = true;
    const missionBtn = document.getElementById('deck-mission-generate');
    if (missionBtn) {
      missionBtn.classList.remove('on');
      missionBtn.textContent = 'Generate Mission';
    }
  }

  /* ── 6 Mission Briefing Generator ── */
  function generateMission() {
    if (missionActive) {
      stopMission();
      return;
    }
    if (!deck || !deck.getCore) return;
    const core = deck.getCore();
    const order = core.slice(1, 8).map(function (c) { return c[0]; });
    order.sort(function () { return Math.random() - 0.5; });
    const panel = document.getElementById('deck-mission-output');
    if (panel) {
      panel.innerHTML = '<strong>Custom reading order</strong><ol>' +
        order.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ol>' +
        '<button type="button" id="deck-mission-stop" class="deck-space-btn-secondary">Stop tour</button>';
      panel.hidden = false;
      const stopBtn = document.getElementById('deck-mission-stop');
      if (stopBtn) stopBtn.addEventListener('click', stopMission);
    }
    const missionBtn = document.getElementById('deck-mission-generate');
    if (missionBtn) {
      missionBtn.classList.add('on');
      missionBtn.textContent = 'Stop Mission';
    }
    missionActive = true;
    let i = 0;
    function visit() {
      if (!missionActive) return;
      if (i >= order.length) {
        stopMission();
        return;
      }
      const n = deck.nodeByLabel(order[i++]);
      if (n && deck.frameNode) deck.frameNode(n);
      missionTimer = setTimeout(visit, 1200);
    }
    visit();
  }

  /* ── 7 Temporal Replay ── */
  function buildTimelineBar() {
    timelineBar = document.createElement('div');
    timelineBar.id = 'deck-temporal-replay';
    timelineBar.innerHTML =
      '<span>Temporal replay</span>' +
      '<input type="range" id="deck-timeline-scrub" min="0" max="100" value="0" aria-label="Timeline scrubber" />' +
      '<span id="deck-timeline-label"></span>';
    document.body.appendChild(timelineBar);
    const scrub = document.getElementById('deck-timeline-scrub');
    const label = document.getElementById('deck-timeline-label');
    scrub.addEventListener('input', function () {
      const idx = Math.floor((scrub.value / 100) * (timelineData.events.length - 1));
      const ev = timelineData.events[idx];
      if (!ev) return;
      label.textContent = ev.label + ' · ' + ev.module;
      const n = deck.nodeByLabel && deck.nodeByLabel(ev.module);
      if (n && deck.frameNode) deck.frameNode(n);
    });
  }

  /* ── 8 Sound of SIEM ── */
  function toggleSonification() {
    sonificationOn = !sonificationOn;
    const btn = document.getElementById('deck-sonify-toggle');
    if (btn) {
      btn.classList.toggle('on', sonificationOn);
      btn.textContent = sonificationOn ? 'Sonify on' : 'Sonify';
    }
    if (sonificationOn) ensureAudio();
  }

  function hookHoverNotes() {
    let lastLabel = '';
    setInterval(function () {
      if (!deck || !deck.getHover) return;
      const h = deck.getHover();
      if (h && h.label !== lastLabel) {
        lastLabel = h.label;
        playNote((h.label.length + (h.r | 0)) % 5);
      }
      if (!h) lastLabel = '';
    }, 400);
  }

  /* ── 9 DNA preview on hover card ── */
  function buildDnaPreview() {
    dnaPreview = document.createElement('div');
    dnaPreview.id = 'deck-dna-preview';
    dnaPreview.hidden = true;
    document.body.appendChild(dnaPreview);
    setInterval(function () {
      if (!deck || !deck.getHover) return;
      const h = deck.getHover();
      if (!h) {
        dnaPreview.hidden = true;
        return;
      }
      const card = document.getElementById('card');
      if (!card || !card.classList.contains('on')) {
        dnaPreview.hidden = true;
        return;
      }
      const codons = ['ATG', 'TAC', 'GCT', 'CGA'];
      let strip = '';
      for (let i = 0; i < 6; i++) strip += codons[(h.label.charCodeAt(i % h.label.length) || 0) % 4] + ' ';
      dnaPreview.hidden = false;
      dnaPreview.innerHTML =
        '<span class="deck-dna-codon-strip">' + strip + '</span>' +
        '<a href="../right.html?signal=' + encodeURIComponent(h.label) + '">Open signal room</a>';
      const r = card.getBoundingClientRect();
      dnaPreview.style.left = r.left + 'px';
      dnaPreview.style.top = r.top - 36 + 'px';
    }, 200);
  }

  /* ── 10 Incident Constellation ── */
  function toggleConstellation() {
    constellationOn = !constellationOn;
    const btn = document.getElementById('deck-constellation-toggle');
    if (btn) btn.classList.toggle('on', constellationOn);
    document.body.classList.toggle('deck-constellation-view', constellationOn);
  }

  function constellationDraw(ctx, fxCtx, t) {
    if (!constellationOn || !deck || !deck.getNodes) return;
    const nodes = deck.getNodes().filter(function (n) { return n.core && !n.isRoot; });
    ctx.save();
    ctx.strokeStyle = 'rgba(167,139,250,0.22)';
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < 220) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function injectStyles() {
    if (document.getElementById('deck-features-v2-style')) return;
    const s = document.createElement('style');
    s.id = 'deck-features-v2-style';
    s.textContent =
      '#deck-evidence-board[hidden]{display:none!important}' +
      '#deck-evidence-board:not([hidden]){position:fixed;inset:0;z-index:85;background:radial-gradient(ellipse at center,rgba(15,8,32,0.55) 0%,rgba(0,0,0,0.92) 70%);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)}' +
      '#deck-evidence-cork{position:relative;width:min(760px,94vw);height:min(520px,74vh);padding:20px 22px 18px;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;' +
      'background:linear-gradient(145deg,rgba(12,8,28,0.97) 0%,rgba(6,14,32,0.98) 45%,rgba(18,6,28,0.97) 100%);' +
      'border:1px solid rgba(167,139,250,0.45);box-shadow:0 0 60px rgba(109,40,217,0.35),0 0 120px rgba(56,189,248,0.08),inset 0 0 80px rgba(167,139,250,0.06);' +
      'font-family:Consolas,"IBM Plex Mono",monospace;color:#e2e8f0}' +
      '.deck-evidence-nebula{position:absolute;inset:-20%;pointer-events:none;background:radial-gradient(circle at 30% 40%,rgba(109,40,217,0.22),transparent 55%),radial-gradient(circle at 70% 60%,rgba(14,116,144,0.18),transparent 50%);animation:deck-evidence-drift 12s ease-in-out infinite alternate}' +
      '.deck-evidence-stars{position:absolute;inset:0;pointer-events:none;opacity:0.35;background-image:radial-gradient(1px 1px at 20% 30%,#fff,transparent),radial-gradient(1px 1px at 60% 70%,#c4b5fd,transparent),radial-gradient(1px 1px at 80% 20%,#38bdf8,transparent),radial-gradient(1px 1px at 40% 80%,#fff,transparent);background-size:100% 100%}' +
      '@keyframes deck-evidence-drift{from{transform:scale(1) rotate(0deg)}to{transform:scale(1.06) rotate(2deg)}}' +
      '.deck-evidence-head{position:relative;z-index:2;display:flex;flex-direction:column;gap:4px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(167,139,250,0.25)}' +
      '.deck-evidence-head strong{font-size:13px;letter-spacing:3px;color:#e9d5ff;text-shadow:0 0 18px rgba(167,139,250,0.55)}' +
      '.deck-evidence-head span{font-size:9px;color:#94a3b8;letter-spacing:0.5px}' +
      '#deck-evidence-strings{position:absolute;inset:0;pointer-events:none;z-index:1}' +
      '#deck-evidence-pins{position:absolute;inset:72px 16px 140px 16px;z-index:3}' +
      '.deck-evidence-pin{position:absolute;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:grab;transform:translate(-50%,-50%);user-select:none}' +
      '.deck-pin-core{width:10px;height:10px;border-radius:50%;background:#fef9c3;box-shadow:0 0 12px #fef9c3,0 0 24px rgba(56,189,248,0.8)}' +
      '.deck-pin-ring{position:absolute;top:50%;left:50%;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;border:1px solid rgba(167,139,250,0.55);animation:deck-pin-pulse 2.4s ease-out infinite;pointer-events:none}' +
      '@keyframes deck-pin-pulse{0%{transform:scale(0.6);opacity:0.9}100%{transform:scale(1.4);opacity:0}}' +
      '.deck-pin-label{font-size:8px;letter-spacing:0.5px;color:#c4b5fd;background:rgba(8,4,18,0.85);border:1px solid rgba(167,139,250,0.35);padding:2px 6px;border-radius:3px;max-width:88px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.deck-evidence-notes-wrap{position:relative;z-index:2;display:block;margin-top:auto;font-size:8px;letter-spacing:1px;color:#6b7280}' +
      '#deck-evidence-notes{display:block;width:100%;margin-top:6px;padding:10px 12px;resize:vertical;min-height:52px;background:rgba(4,8,20,0.85);border:1px solid rgba(56,189,248,0.35);border-radius:4px;color:#cbd5e1;font:11px/1.5 Consolas,monospace;outline:none;box-shadow:inset 0 0 20px rgba(56,189,248,0.06)}' +
      '#deck-evidence-notes:focus{border-color:#a78bfa;box-shadow:0 0 16px rgba(167,139,250,0.25),inset 0 0 20px rgba(56,189,248,0.08)}' +
      '.deck-evidence-actions{position:relative;z-index:2;display:flex;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(167,139,250,0.2)}' +
      '.deck-space-btn,.deck-space-btn-secondary{pointer-events:auto;cursor:pointer;font:600 10px Consolas,monospace;letter-spacing:1px;text-transform:uppercase;padding:10px 16px;border-radius:4px;transition:box-shadow 0.2s,border-color 0.2s,transform 0.15s}' +
      '.deck-space-btn{color:#fef9c3;background:linear-gradient(180deg,rgba(109,40,217,0.55),rgba(76,29,149,0.65));border:1px solid rgba(167,139,250,0.65);box-shadow:0 0 20px rgba(109,40,217,0.35)}' +
      '.deck-space-btn:hover{border-color:#fef9c3;box-shadow:0 0 28px rgba(254,249,195,0.35);transform:translateY(-1px)}' +
      '#deck-v2-bar button,#deck-v2-bar select{background:linear-gradient(180deg,rgba(12,8,28,0.95),rgba(8,4,18,0.98));border:1px solid rgba(167,139,250,0.4);box-shadow:0 0 12px rgba(109,40,217,0.15)}' +
      '#deck-v2-bar button:hover{border-color:#c4b5fd;box-shadow:0 0 18px rgba(167,139,250,0.35)}' +
      '#deck-v2-bar button.on{border-color:#fef9c3;color:#fef9c3;box-shadow:0 0 22px rgba(254,249,195,0.3)}' +
      '#deck-dossier-sidebar{position:fixed;top:120px;right:16px;z-index:45;width:200px;background:rgba(8,4,18,0.95);border:1px solid rgba(251,191,36,0.4);padding:12px;font:10px Consolas,monospace;color:#fde68a}' +
      '#deck-dossier-list{list-style:none;margin-top:8px}' +
      '#deck-dossier-list button{background:none;border:none;color:#fbbf24;cursor:pointer;font:inherit}' +
      '#deck-temporal-replay{position:fixed;bottom:52px;left:50%;transform:translateX(-50%);z-index:14;display:flex;gap:10px;align-items:center;padding:8px 14px;background:rgba(8,4,18,0.92);border:1px solid rgba(167,139,250,0.35);font:9px Consolas,monospace;color:#9ca3af}' +
      '#deck-timeline-scrub{width:180px;accent-color:#a78bfa}' +
      '#deck-presence-ghosts{position:fixed;inset:0;pointer-events:none;z-index:8}' +
      '.deck-presence-ghost{position:absolute;width:14px;height:14px;border-radius:50%;border:2px solid rgba(52,211,153,0.6);transform:translate(-50%,-50%);box-shadow:0 0 12px rgba(52,211,153,0.4)}' +
      '#deck-dna-preview{position:fixed;z-index:11;font:9px Consolas,monospace;background:rgba(6,20,16,0.92);border:1px solid #059669;padding:6px 10px;color:#6ee7b7}' +
      '#deck-dna-preview a{color:#a7f3d0;margin-left:8px}' +
      '.deck-dna-codon-strip{letter-spacing:1px}' +
      '#deck-mission-output{position:fixed;top:100px;left:20px;z-index:45;max-width:220px;background:rgba(8,4,18,0.95);border:1px solid rgba(167,139,250,0.4);padding:12px;font:10px Consolas,monospace;color:#ddd6fe}' +
      'body.deck-constellation-view #matrix{opacity:0.15}' +
      'body.deck-constellation-view #c{filter:contrast(1.1)}';
    document.head.appendChild(s);
  }

  function wireToolbar() {
    const evidenceBtn = document.getElementById('deck-evidence-toggle');
    const actorsBtn = document.getElementById('deck-actors-toggle');
    const warBtn = document.getElementById('deck-wargame-run');
    const missionBtn = document.getElementById('deck-mission-generate');
    const constBtn = document.getElementById('deck-constellation-toggle');
    const sonBtn = document.getElementById('deck-sonify-toggle');
    if (evidenceBtn) evidenceBtn.addEventListener('click', toggleEvidence);
    if (actorsBtn) actorsBtn.addEventListener('click', toggleDossiers);
    if (warBtn) warBtn.addEventListener('click', function () {
      const sel = document.getElementById('deck-wargame-select');
      runWargame(sel && sel.value ? sel.value : (wargameScenarios[0] && wargameScenarios[0].id));
    });
    if (missionBtn) missionBtn.addEventListener('click', generateMission);
    if (constBtn) constBtn.addEventListener('click', toggleConstellation);
    if (sonBtn) sonBtn.addEventListener('click', toggleSonification);
    addEventListener('keydown', function (e) {
      if (e.key !== 'e' && e.key !== 'E') return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      toggleEvidence();
    });
    const prev = window.siemDeckExt || {};
    window.siemDeckExt = Object.assign({}, prev, {
      nodeAlphaModifier: function (n, a) {
        a = dossierNodeAlpha(n, a);
        return prev.nodeAlphaModifier ? prev.nodeAlphaModifier(n, a) : a;
      },
      nodeScaleModifier: function (n) {
        const s = dossierNodeScale(n);
        const ps = prev.nodeScaleModifier ? prev.nodeScaleModifier(n) : 1;
        return s * ps;
      },
      onDraw: function (ctx, fxCtx, t) {
        if (prev.onDraw) prev.onDraw(ctx, fxCtx, t);
        constellationDraw(ctx, fxCtx, t);
      },
    });
  }

  function init(deckApi) {
    deck = deckApi;
    injectStyles();
    Promise.all([
      fetch('../assets/threat-actors.json').then(function (r) { return r.json(); }),
      fetch('../assets/wargame-scenarios.json').then(function (r) { return r.json(); }),
      fetch('../assets/deck-timeline.json').then(function (r) { return r.json(); }),
    ]).then(function (res) {
      threatActors = res[0] || {};
      wargameScenarios = res[1] || [];
      timelineData = res[2] || { events: [] };
      buildDossierSidebar();
      populateWargameSelect();
    }).catch(function () {});

    buildEvidenceBoard();
    setEvidenceOpen(false);
    buildTimelineBar();
    buildDnaPreview();
    hookArchitectZoom();
    initPresence();
    hookHoverNotes();
    wireToolbar();

    const missionOut = document.createElement('div');
    missionOut.id = 'deck-mission-output';
    missionOut.hidden = true;
    document.body.appendChild(missionOut);
  }

  window.siemDeckFeatures = {
    init: init,
    toggleEvidence: toggleEvidence,
    toggleConstellation: toggleConstellation,
    stopMission: stopMission,
  };

  function boot() {
    if (window.siemDeck && window.siemDeck.ready) init(window.siemDeck);
    else addEventListener('siem-deck-ready', function () { init(window.siemDeck); }, { once: true });
  }
  boot();
})();
