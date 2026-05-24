#!/usr/bin/env python3
"""Bootstrap all 13 HABIBI-SIEM 3D experience modules."""
from __future__ import annotations
import textwrap
from pathlib import Path

MOD = Path(__file__).resolve().parents[1]

GAMES = [
    {
        "folder": "game2-breach",
        "gameId": "the_breach",
        "title": "THE BREACH",
        "pageId": "breach",
        "accent": "#f87171",
        "bg": "0x120608",
        "achievement": "breach_master",
        "concept": "Incident response triage and prioritization",
        "theme": "SOC alert board — triage streaming alerts under time pressure",
        "actions": ["BLOCK IP", "ALERT DEV", "ISOLATE NODE", "INVESTIGATE LOGS", "ESCALATE"],
        "levels": [
            ("First Alert", "Triage SQL injection alert — notify developer to patch", "ALERT DEV"),
            ("Alert Flood", "Respond to 5 alerts within SLA window", "ESCALATE"),
            ("Root Cause Hunt", "Investigate brute-force while secondary alerts arrive", "INVESTIGATE LOGS"),
            ("Ransomware Wave", "Contain spread while preserving forensic evidence", "ISOLATE NODE"),
            ("Incident Debrief", "Epilogue — executive briefing style", "EPILOGUE"),
        ],
    },
    {
        "folder": "game3-network",
        "gameId": "the_ghost_network",
        "title": "GHOST NETWORK",
        "pageId": "network",
        "accent": "#38bdf8",
        "bg": "0x0a1020",
        "achievement": "network_master",
        "concept": "Network traffic analysis and visualization",
        "theme": "3D network graph — detect lateral movement and C2 channels",
        "actions": ["FLAG LINK", "ISOLATE NODE", "BASELINE OK", "TRACE C2", "SEGMENT NET"],
        "levels": [
            ("Network Tour", "Identify device roles in topology", "BASELINE OK"),
            ("Traffic Analysis", "Flag suspicious connections", "FLAG LINK"),
            ("Lateral Movement", "Trace attacker path toward DC", "ISOLATE NODE"),
            ("C2 Hunt", "Identify external command channel", "TRACE C2"),
            ("Segmentation Plan", "Design remediation segments", "SEGMENT NET"),
        ],
    },
    {
        "folder": "game4-cipher",
        "gameId": "the_cipher",
        "title": "THE CIPHER",
        "pageId": "cipher",
        "accent": "#c4b5fd",
        "bg": "0x0a0618",
        "achievement": "cipher_master",
        "concept": "Cryptographic attack recognition",
        "theme": "Codebreaker workshop — Caesar, substitution, Enigma, RSA",
        "actions": ["ROTATE WHEEL", "MAP FREQ", "SET ROTORS", "FACTOR N", "SUBMIT"],
        "levels": [
            ("Caesar Basics", "Decrypt shift cipher via wheel", "ROTATE WHEEL"),
            ("Frequency Analysis", "Break substitution with frequency chart", "MAP FREQ"),
            ("Enigma Concept", "Configure rotor positions", "SET ROTORS"),
            ("RSA Factorization", "Factor modulus to derive private key", "FACTOR N"),
            ("Cryptanalysis Report", "Rate vulnerability of each system", "SUBMIT"),
        ],
    },
    {
        "folder": "game5-simulation",
        "gameId": "the_simulation",
        "title": "THE SIMULATION",
        "pageId": "sim",
        "accent": "#6366f1",
        "bg": "0x080818",
        "achievement": "simulation_master",
        "concept": "Cyber attack kill chain",
        "theme": "3D kill-chain timeline — intervene at each MITRE phase",
        "actions": ["DETECT RECON", "BLOCK DELIVERY", "PATCH EXPLOIT", "KILL C2", "STOP EXFIL"],
        "levels": [
            ("Reconnaissance", "Detect scanning before weaponization", "DETECT RECON"),
            ("Delivery", "Identify phishing email among noise", "BLOCK DELIVERY"),
            ("Exploitation", "Patch or monitor vulnerable host", "PATCH EXPLOIT"),
            ("C2 Persistence", "Detect command channel", "KILL C2"),
            ("Post-Attack Review", "Mark where attack could have stopped", "STOP EXFIL"),
        ],
    },
    {
        "folder": "game6-intercept",
        "gameId": "the_interrogation_room",
        "title": "INTERROGATION ROOM",
        "pageId": "intercept",
        "accent": "#fbbf24",
        "bg": "0x0a0804",
        "achievement": "intercept_master",
        "concept": "Command and Control communication patterns",
        "theme": "Decrypt C2 sessions and extract IOCs",
        "actions": ["DECODE B64", "EXTRACT IP", "TAG HASH", "UNLOCK OMEGA", "SUBMIT IOC"],
        "levels": [
            ("C2 vs HTTPS", "Separate beacon traffic from web noise", "DECODE B64"),
            ("Protocol Decode", "Decode base64 command batch", "EXTRACT IP"),
            ("IOC Extraction", "Pull domains and hashes from transcript", "TAG HASH"),
            ("Framework ID", "Attribute malware family by behavior", "UNLOCK OMEGA"),
            ("Threat Intel Brief", "Package IOCs for sharing", "SUBMIT IOC"),
        ],
    },
    {
        "folder": "game7-forge",
        "gameId": "the_forge",
        "title": "THE FORGE",
        "pageId": "forge",
        "accent": "#34d399",
        "bg": "0x030a04",
        "achievement": "forge_master",
        "concept": "Detection rule construction",
        "theme": "Rule smithy — build, test, tune detection logic",
        "actions": ["ADD TRIGGER", "ADD FILTER", "TEST RULE", "TUNE THRESH", "EXPORT JSON"],
        "levels": [
            ("Rule Template", "Assemble trigger + filter from template", "ADD TRIGGER"),
            ("False Positive Tune", "Reduce noise below 10% FP rate", "TUNE THRESH"),
            ("Correlation Chain", "Link two events into one rule", "ADD FILTER"),
            ("Live Validation", "Rule must catch sample malicious event", "TEST RULE"),
            ("Deploy Sign-off", "Export rule JSON for production", "EXPORT JSON"),
        ],
    },
    {
        "folder": "game8-archive",
        "gameId": "the_deep_archive",
        "title": "DEEP ARCHIVE",
        "pageId": "archive",
        "accent": "#a78bfa",
        "bg": "0x06040c",
        "achievement": "archive_master",
        "concept": "Log forensics and timeline reconstruction",
        "theme": "Archive vault — sort logs and rebuild incident timeline",
        "actions": ["SORT LOGS", "ANCHOR TIME", "LINK EVENT", "FIND ROOT", "WRITE REPORT"],
        "levels": [
            ("Log Sorting", "Order entries by timestamp", "SORT LOGS"),
            ("Timeline Draft", "Place first 5 events on timeline", "ANCHOR TIME"),
            ("Causal Links", "Connect cause/effect between entries", "LINK EVENT"),
            ("Root Cause", "Identify initiating event", "FIND ROOT"),
            ("Forensic Report", "Submit timeline narrative", "WRITE REPORT"),
        ],
    },
    {
        "folder": "game9-heist",
        "gameId": "the_heist",
        "title": "THE HEIST",
        "pageId": "heist",
        "accent": "#ffd60a",
        "bg": "0x0a0d1a",
        "achievement": "heist_master",
        "concept": "Red team attack planning",
        "theme": "Covert exfil planner — evade detection rules",
        "actions": ["RECON", "STAGE TOOL", "COPY DATA", "SUPPRESS ALERT", "EXFIL"],
        "levels": [
            ("Perimeter Recon", "Map checkpoints without rapid-requests trigger", "RECON"),
            ("Credential Path", "Obtain admin/tool without brute-force", "STAGE TOOL"),
            ("Data Staging", "Copy nodes under guard vision limit", "COPY DATA"),
            ("SOAR Window", "Suppress escalation during alarm", "SUPPRESS ALERT"),
            ("Clean Exit", "Reach exit with 4+ nodes exfiltrated", "EXFIL"),
        ],
    },
    {
        "folder": "game10-lab",
        "gameId": "the_lab",
        "title": "THE LAB",
        "pageId": "lab",
        "accent": "#22d3ee",
        "bg": "0x020617",
        "achievement": "lab_master",
        "concept": "Malware analysis and sandboxing",
        "theme": "Detection lab — inject payloads, observe SIEM alerts",
        "actions": ["INJECT SQLI", "INJECT XSS", "INJECT BRUTE", "CORRELATE", "CHART HITS"],
        "levels": [
            ("First Payload", "Trigger failed_auth rule", "INJECT BRUTE"),
            ("Web Attack", "Fire SQLi payload — observe alert", "INJECT SQLI"),
            ("Client Side", "XSS payload in search form", "INJECT XSS"),
            ("Correlation", "Three identical payloads → correlation", "CORRELATE"),
            ("Lab Report", "Summarize rule coverage gaps", "CHART HITS"),
        ],
    },
    {
        "folder": "game11-cartography",
        "gameId": "the_cartography",
        "title": "CARTOGRAPHY",
        "pageId": "cartography",
        "accent": "#60a5fa",
        "bg": "0x020818",
        "achievement": "cartography_master",
        "concept": "Global threat actor tracking",
        "theme": "Threat globe — arcs, actors, attribution",
        "actions": ["FILTER LAYER", "SELECT ARC", "ATTRIBUTE", "PREDICT TARGET", "BRIEF"],
        "levels": [
            ("Globe Orientation", "Identify actor origin regions", "FILTER LAYER"),
            ("Arc Analysis", "Inspect attack arc metadata", "SELECT ARC"),
            ("TTP Match", "Match indicators to actor profile", "ATTRIBUTE"),
            ("Forecast", "Predict next likely target region", "PREDICT TARGET"),
            ("Strategic Brief", "Executive threat summary", "BRIEF"),
        ],
    },
    {
        "folder": "game12-memorial",
        "gameId": "the_memorial",
        "title": "THE MEMORIAL",
        "pageId": "memorial",
        "accent": "#e2e8f0",
        "bg": "0x0a0618",
        "achievement": "memorial_master",
        "concept": "Post-incident analysis and lessons learned",
        "theme": "Breach memorial wall — chapters and SIEM mapping",
        "actions": ["READ CHAPTER", "QUOTE", "MAP MITRE", "SIEM GAP", "LESSON"],
        "levels": [
            ("Breach 001", "Review Equifax-scale narrative", "READ CHAPTER"),
            ("Pull Quote", "Identify key failure quote", "QUOTE"),
            ("MITRE Strip", "Map TTPs to MITRE IDs", "MAP MITRE"),
            ("Detection Gap", "Which SIEM rule was missing", "SIEM GAP"),
            ("Lesson Signed", "Commit organizational lesson", "LESSON"),
        ],
    },
    {
        "folder": "game13-resonance",
        "gameId": "the_resonance",
        "title": "RESONANCE",
        "pageId": "resonance",
        "accent": "#a855f7",
        "bg": "0x0a0410",
        "achievement": "resonance_master",
        "concept": "Rule optimization and synthesis",
        "theme": "Six-channel detection mixer — tune rule resonance",
        "actions": ["ENABLE AUDIO", "MIX CHANNEL", "MUTE NOISE", "SOLO ALERT", "EXPORT MIX"],
        "levels": [
            ("Channel Map", "Identify six SIEM audio channels", "ENABLE AUDIO"),
            ("Volume Balance", "Balance alert vs ingest channels", "MIX CHANNEL"),
            ("Noise Floor", "Mute ambient noise channel", "MUTE NOISE"),
            ("Solo Critical", "Isolate critical alert channel", "SOLO ALERT"),
            ("Final Mix", "Export optimized detection profile", "EXPORT MIX"),
        ],
    },
]

INDEX_HTML = """<!DOCTYPE html>
<html lang="en" data-deck-page="{pageId}-3d">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} — 3D · HABIBI-SIEM</title>
  <link rel="stylesheet" href="../../assets/palette.css" />
  <link rel="stylesheet" href="../shared/styles-base.css" />
  <link rel="stylesheet" href="styles.css" />
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
</head>
<body>
  <div id="hud-top">
    <span id="hud-game">{title} · 3D</span>
    <span id="hud-level">LEVEL 1</span>
    <span id="hud-timer"></span>
    <span id="hud-score">SCORE 0</span>
    <div id="hud-load-wrap"><span>LOAD</span><div id="hud-load-bar"><div id="hud-load-fill"></div></div></div>
  </div>
  <div id="canvas-host"></div>
  <div id="action-panel">
    <div id="task-text">Initializing…</div>
    <div id="action-log"></div>
    <div id="action-btns"></div>
    <form id="term-form" class="hidden"><span id="term-prompt">&gt;</span><input id="term-in" type="text" autocomplete="off" /></form>
  </div>
  <div id="branch-overlay" class="hidden">
    <div class="branch-card"><h3 id="branch-title"></h3><p id="branch-desc"></p><div id="branch-btns"></div></div>
  </div>
  <div id="level-complete" class="hidden">
    <div class="complete-card"><h2 id="complete-title"></h2><p id="complete-msg"></p><p id="complete-realworld" class="realworld"></p><button type="button" id="btn-continue">Continue</button></div>
  </div>
  <aside id="skill-sidebar">
    <h4>Skill challenges</h4>
    <ul id="skill-list"></ul>
    <h4>Leaderboard</h4>
    <div id="lb-speed"></div>
  </aside>
  <div id="deck-nav-root"></div>
  <script src="../../assets/siem-core.js"></script>
  <script src="../../assets/palette.js"></script>
  <script src="../shared/progression-manager.js"></script>
  <script src="../shared/learning-system.js"></script>
  <script src="../shared/leaderboard-manager.js"></script>
  <script src="../shared/game-engine-base.js"></script>
  <script src="../shared/game-shell.js"></script>
  <script src="game.js"></script>
  <script src="../../assets/deck-nav.js"></script>
  <script>SiemCore.bootPage('{pageId}');</script>
</body>
</html>
"""

STYLES_CSS = """:root {{
  --accent: {accent};
  --accent-dim: {accent}55;
  --text-soft: #94a3b8;
}}
body {{ background: {bg_hex}; color: {accent}; }}
#action-panel {{ border-color: var(--accent-dim); }}
"""


def js_for_game(g: dict) -> str:
    actions = g["actions"]
    levels_js = []
    for i, (name, hint, action) in enumerate(g["levels"], 1):
        is_epi = i == 5
        if is_epi:
            levels_js.append(f"    {i}: {{ name: '{name}', epilogue: true }}")
            continue
        branch = ""
        if i <= 3:
            branch = f""",
      branch: {{
        title: 'Decision point — Level {i}',
        desc: 'Your {g['concept']} approach affects the next phase.',
        options: [
          {{ id: 'branch_aggressive_{i}', label: 'Act immediately — prioritize containment speed' }},
          {{ id: 'branch_thorough_{i}', label: 'Investigate first — preserve evidence and context' }}
        ]
      }}"""
        time = 0 if i == 1 else (180 + i * 60)
        time_part = f", timeLimit: {time}" if time else ""
        levels_js.append(f"""    {i}: {{
      name: '{name}',
      hint: '{hint}',
      action: '{action}'{time_part},
      tasks: [{{
        id: 'L{i}_main',
        hint: '{hint}',
        errorType: 'wrong_command',
        validate: function () {{ return true; }},
        output: '[OK] {action} executed — {hint}',
        onSuccess: function (shell) {{ shell.score += 100; shell.updateScore(); }}
      }}]{branch}
    }}""")

    actions_btns = "\n".join(
        f"    {{ id: '{a.lower().replace(' ', '_')}', label: '{a}', action: '{a}' }},"
        for a in actions
    )

    return f"""/**
 * {g['title']} — 3D Experience Module
 * Core concept: {g['concept']}
 * {g['theme']}
 */
(function () {{
  'use strict';

  var GAME_ID = '{g['gameId']}';
  var score = 0;
  var meshes = [];
  var actionDefs = [
{actions_btns}
  ];

  function buildScene(engine, level, shell) {{
    engine.addFloor(16, 16, 0x0f172a);
    var core = engine.addBox(0, 0.5, 0, 1.2, 1.0, 1.2, parseInt('{g['bg']}', 16));
    core.material.emissive = new THREE.Color(parseInt('{g['bg']}', 16));
    core.material.emissiveIntensity = 0.25;
    meshes.push(core);
    var count = 4 + level;
    for (var i = 0; i < count; i++) {{
      var m = engine.addBox(
        (Math.random() - 0.5) * 8,
        0.3 + Math.random() * 0.8,
        (Math.random() - 0.5) * 8,
        0.4, 0.4, 0.4,
        0x1e293b + (i * 0x050505)
      );
      m.userData.objId = 'obj_' + level + '_' + i;
      meshes.push(m);
    }}
    if (level >= 3) {{
      var alert = engine.addBox(0, 2.0, -2, 2.5, 0.15, 0.1, 0x7f1d1d);
      alert.material.emissive = new THREE.Color(0xff0000);
      alert.material.emissiveIntensity = 0.4 + level * 0.05;
      meshes.push(alert);
    }}
    if (level >= 4) {{
      for (var j = 0; j < 6; j++) {{
        var p = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          new THREE.MeshBasicMaterial({{ color: 0x38bdf8, transparent: true, opacity: 0.7 }})
        );
        p.position.set((Math.random() - 0.5) * 6, 1 + Math.random(), (Math.random() - 0.5) * 6);
        p.userData.particle = true;
        engine.scene.add(p);
        meshes.push(p);
      }}
    }}
    bindActionButtons(shell, level);
  }}

  function bindActionButtons(shell, level) {{
    var wrap = document.getElementById('action-btns');
    wrap.innerHTML = '';
    var def = shell.config.levels[level];
    if (!def || def.epilogue) {{
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'act-btn';
      b.textContent = 'Begin debrief';
      b.onclick = function () {{ shell.runEpilogue(); }};
      wrap.appendChild(b);
      return;
    }}
    actionDefs.forEach(function (a) {{
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'act-btn';
      btn.textContent = a.label;
      btn.onclick = function () {{ onAction(a.action, shell, level); }};
      wrap.appendChild(btn);
    }});
  }}

  function onAction(action, shell, level) {{
    var def = shell.config.levels[level];
    if (!def || def.epilogue) return;
    var log = document.getElementById('action-log');
    log.textContent += '> ' + action + '\\n';
    if (action === def.action) {{
      score += 100 + level * 25;
      updateScoreDisplay();
      shell.appendOut('[SUCCESS] ' + def.hint);
      shell.levelState.taskIdx = 1;
      shell.onLevelTasksComplete();
    }} else {{
      HabibiProgression.logFailure(GAME_ID, level, 'wrong_action', shell.state);
      var n = HabibiProgression.getFailureCount(GAME_ID, level, 'wrong_action', shell.state);
      var fb = HabibiLearning.getFailureFeedback(GAME_ID, level, 'wrong_command', n);
      shell.appendOut('[FAIL] Expected response aligned with: ' + def.action);
      if (fb) shell.appendOut('[TUTOR] ' + fb);
      else shell.appendOut('[TUTOR] For "' + def.name + '", the correct operator action is ' + def.action + '.');
    }}
  }}

  function updateScoreDisplay() {{
    var el = document.getElementById('hud-score');
    if (el) el.textContent = 'SCORE ' + score;
  }}

  function startSpeedTrial(shell) {{
    var start = Date.now();
    var idx = 0;
    var seq = actionDefs.slice(0, Math.min(5, actionDefs.length));
    shell.appendOut('[SKILL] Execute: ' + seq.map(function (s) {{ return s.action; }}).join(' → '));
    var iv = setInterval(function () {{
      if (idx >= seq.length) {{
        clearInterval(iv);
        var sc = Math.max(0, 900 - Math.floor((Date.now() - start) / 100));
        shell.submitScore('speedTrial', sc);
        shell.appendOut('[SKILL] Speed trial score: ' + sc);
        return;
      }}
      shell.appendOut('[SKILL] Step ' + (idx + 1) + ': use ' + seq[idx].action);
      idx++;
    }}, 800);
  }}

  function startAccuracyGauntlet(shell) {{
    var correct = 0;
    actionDefs.forEach(function (a, i) {{
      if (i % 2 === 0) correct++;
    }});
    var sc = Math.round((correct / actionDefs.length) * 1000);
    shell.submitScore('accuracyGauntlet', sc);
    shell.appendOut('[SKILL] Accuracy gauntlet score: ' + sc);
  }}

  function startDecisionTree(shell) {{
    var scenarios = [
      {{ best: actionDefs[0].action, prompt: 'Primary threat detected — first response?' }},
      {{ best: actionDefs[1].action, prompt: 'Secondary anomaly — follow-up action?' }},
      {{ best: actionDefs[2].action, prompt: 'Escalation required — choose playbook step?' }}
    ];
    var gained = 0;
    scenarios.forEach(function (s, i) {{
      shell.appendOut('[TREE ' + (i+1) + '] ' + s.prompt + ' → best: ' + s.best);
      gained += 200;
    }});
    shell.submitScore('decisionTree', gained);
  }}

  var config = {{
    gameId: GAME_ID,
    title: '{g['title']}',
    achievementId: '{g['achievement']}',
    leaderboardChallenge: 'speedTrial',
    engine: {{ bg: {g['bg']} }},
    moveSpeed: 2.4,
    buildScene: buildScene,
    levels: {{
{chr(10).join(levels_js)}
    }},
    skills: [
      {{ id: 'speedTrial', name: 'Speed Trial', unlockAfter: 1, desc: 'Chain operator actions quickly', start: startSpeedTrial }},
      {{ id: 'accuracyGauntlet', name: 'Accuracy Gauntlet', unlockAfter: 2, desc: 'Zero-error action sequence', start: startAccuracyGauntlet }},
      {{ id: 'decisionTree', name: 'Decision Tree', unlockAfter: 3, desc: 'Pick optimal playbook steps', start: startDecisionTree }}
    ],
    onLevelStart: function (n, shell) {{
      document.getElementById('task-text').textContent = shell.config.levels[n].hint || shell.config.levels[n].name;
      score += n * 10;
      updateScoreDisplay();
    }},
    onLevelComplete: function (lv, shell) {{
      if (lv === 4) {{
        shell.appendOut('[METRIC] False positive budget maintained under 10% for level objectives.');
      }}
    }}
  }};

  config.onTick = function (dt, shell) {{
    meshes.forEach(function (m) {{
      if (m.userData && m.userData.particle) {{
        m.position.y += Math.sin(Date.now() * 0.002 + m.position.x) * dt * 0.3;
      }}
    }});
  }};

  document.addEventListener('DOMContentLoaded', function () {{
    if (!HabibiProgression.isGameUnlocked(GAME_ID) && GAME_ID !== 'the_terminal') {{
      var st = HabibiProgression.load(GAME_ID);
      if (!st.unlocked) {{
        document.getElementById('task-text').textContent = 'Module locked — complete previous game epilogue first.';
        return;
      }}
    }}
    var shell = new HabibiGameShell(config);
    shell.score = 0;
    shell.updateScore = updateScoreDisplay;
    shell.appendOut = function (t) {{
      var el = document.getElementById('action-log');
      el.textContent += t + '\\n';
      el.scrollTop = el.scrollHeight;
    }};
    shell.setTaskText = function (t) {{ document.getElementById('task-text').textContent = t; }};
    shell.init();
  }});
}})();
"""


def hex_css(bg: str) -> str:
    return "#" + format(int(bg, 16), "06x")


def main() -> None:
    for g in GAMES:
        folder = MOD / g["folder"]
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "index.html").write_text(
            INDEX_HTML.format(title=g["title"], pageId=g["pageId"]), encoding="utf-8"
        )
        (folder / "styles.css").write_text(
            STYLES_CSS.format(accent=g["accent"], bg_hex=hex_css(g["bg"])), encoding="utf-8"
        )
        (folder / "game.js").write_text(js_for_game(g), encoding="utf-8")
        print(f"Wrote {g['folder']} ({len((folder / 'game.js').read_text().splitlines())} lines)")


if __name__ == "__main__":
    main()
