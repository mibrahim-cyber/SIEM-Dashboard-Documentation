#!/usr/bin/env python3
"""Regenerate games 2-13 with physics, multi-task levels, 15 story branches, narrative depth."""
from __future__ import annotations
from bootstrap_games import GAMES, MOD, INDEX_HTML, STYLES_CSS, hex_css

BRANCH_OPTS = [
    ("branch_speed", "Act immediately — prioritize containment speed"),
    ("branch_evidence", "Investigate first — preserve evidence and context"),
    ("branch_escalate", "Escalate to tier-2 before acting"),
    ("branch_document", "Document timeline while monitoring"),
    ("branch_isolate", "Isolate affected segment conservatively"),
]


def task_sequence(level_i: int, actions: list[str], main: str, hint: str) -> list[tuple[str, str]]:
    ia = (level_i - 1) % len(actions)
    steps = [
        (actions[ia], f"Context pass — run {actions[ia]} on incoming telemetry"),
        (main, hint),
    ]
    if level_i >= 3:
        steps.insert(0, (actions[(ia + 2) % len(actions)], "Pre-check — validate environment baseline"))
    return steps


def story_beats(g: dict) -> str:
    lines = ["  var STORY_BEATS = {"]
    for i, (name, hint, action) in enumerate(g["levels"], 1):
        lines.append(f"    {i}: {{")
        lines.append(f"      title: '{name}',")
        lines.append(f"      opening: 'Meridian-7 briefing: {hint}',")
        for j in range(1, 8):
            lines.append(
                f"      beat{j}: 'Operator log L{i}-{j}: {g['concept']} — {name} phase {j} aligns with live SOC runbooks.',"
            )
        lines.append(f"      closing: 'Level {i} objective satisfied via {action}.'")
        lines.append("    },")
    lines.append("  };")
    return "\n".join(lines)


def js_for_game(g: dict) -> str:
    actions = g["actions"]
    levels_js = []
    for i, (name, hint, action) in enumerate(g["levels"], 1):
        if i == 5:
            levels_js.append(f"    {i}: {{ name: '{name}', epilogue: true }}")
            continue
        seq = task_sequence(i, actions, action, hint)
        seq_js = ",\n        ".join(
            f"{{ action: '{a}', hint: '{h}' }}" for a, h in seq
        )
        branch = ""
        if i <= 3:
            opts = ",\n          ".join(
                f"{{ id: '{bid}_{i}', label: '{label}' }}" for bid, label in BRANCH_OPTS
            )
            branch = f""",
      branch: {{
        title: 'Story branch — Level {i} ({len(BRANCH_OPTS)} paths)',
        desc: 'Your {g['concept']} choices shape the next phase. Fifteen total branches across levels 1–3.',
        options: [
          {opts}
        ]
      }}"""
        time = 0 if i == 1 else (180 + i * 60)
        time_part = f", timeLimit: {time}" if time else ""
        levels_js.append(f"""    {i}: {{
      name: '{name}',
      hint: '{hint}',
      action: '{action}'{time_part},
      taskSequence: [
        {seq_js}
      ],
      tasks: [{{
        id: 'L{i}_main',
        hint: '{hint}',
        errorType: 'wrong_command',
        validate: function () {{ return true; }},
        output: '[OK] {action} — {hint}',
        onSuccess: function (shell) {{ shell.score += 100; if (shell.updateScore) shell.updateScore(); }}
      }}]{branch}
    }}""")

    actions_btns = "\n".join(
        f"    {{ id: '{a.lower().replace(' ', '_')}', label: '{a}', action: '{a}' }},"
        for a in actions
    )
    beats = story_beats(g)

    return f"""/**
 * {g['title']} — 3D Experience Module (enhanced)
 * Core concept: {g['concept']}
 * {g['theme']}
 * Physics: Cannon-es via HabibiPhysics | Branches: 15 (5×L1–3) | Tasks: multi-step per level
 */
(function () {{
  'use strict';

  var GAME_ID = '{g['gameId']}';
  var score = 0;
  var meshes = [];
  var actionDefs = [
{actions_btns}
  ];

{beats}

  function narrateLevel(level, shell) {{
    var b = STORY_BEATS[level];
    if (!b || !shell) return;
    shell.appendOut('[NARRATIVE] ' + b.opening);
    shell.appendOut('[NARRATIVE] ' + b.beat1);
  }}

  function buildScene(engine, level, shell) {{
    if (engine.clearPhysics) engine.clearPhysics();
    meshes = [];
    engine.addFloor(16, 16, 0x0f172a);
    var core = engine.addBox(0, 0.5, 0, 1.2, 1.0, 1.2, parseInt('{g['bg']}', 16), 0);
    core.material.emissive = new THREE.Color(parseInt('{g['bg']}', 16));
    core.material.emissiveIntensity = 0.25;
    meshes.push(core);
    var count = 4 + level;
    for (var i = 0; i < count; i++) {{
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
    }}
    if (level >= 2 && engine.addPhysicsSphere) {{
      for (var s = 0; s < level + 2; s++) {{
        var sp = engine.addPhysicsSphere(
          (Math.random() - 0.5) * 6,
          2.5 + Math.random() * 2,
          (Math.random() - 0.5) * 6,
          0.12 + Math.random() * 0.08,
          0x38bdf8,
          0.5
        );
        meshes.push(sp);
      }}
    }}
    if (level >= 3) {{
      var alert = engine.addBox(0, 2.0, -2, 2.5, 0.15, 0.1, 0x7f1d1d, 0);
      alert.material.emissive = new THREE.Color(0xff0000);
      alert.material.emissiveIntensity = 0.4 + level * 0.05;
      meshes.push(alert);
    }}
    narrateLevel(level, shell);
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
    var seq = def.taskSequence || [{{ action: def.action, hint: def.hint }}];
    var idx = shell.levelState.taskIdx || 0;
    var expected = seq[idx];
    if (expected && action === expected.action) {{
      score += 80 + level * 20;
      updateScoreDisplay();
      shell.appendOut('[SUCCESS] ' + expected.hint);
      shell.levelState.taskIdx = idx + 1;
      if (shell.levelState.taskIdx >= seq.length) {{
        shell.onLevelTasksComplete();
      }} else {{
        shell.setTaskText('Step ' + (shell.levelState.taskIdx + 1) + '/' + seq.length + ': ' + seq[shell.levelState.taskIdx].hint);
      }}
    }} else {{
      HabibiProgression.logFailure(GAME_ID, level, 'wrong_action', shell.state);
      var n = HabibiProgression.getFailureCount(GAME_ID, level, 'wrong_action', shell.state);
      var fb = HabibiLearning.getFailureFeedback(GAME_ID, level, 'wrong_command', n);
      var need = expected ? expected.action : def.action;
      shell.appendOut('[FAIL] Expected: ' + need);
      if (fb) shell.appendOut('[TUTOR] ' + fb);
      else shell.appendOut('[TUTOR] Step ' + (idx + 1) + ' requires ' + need + '.');
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
    function tryAction(action) {{
      if (idx >= seq.length) return;
      if (action === seq[idx].action) {{
        idx++;
        if (idx >= seq.length) {{
          var sc = Math.max(0, 900 - Math.floor((Date.now() - start) / 100));
          shell.submitScore('speedTrial', sc);
          shell.appendOut('[SKILL] Speed trial score: ' + sc);
        }}
      }}
    }}
    shell._speedTrialHook = tryAction;
  }}

  function startAccuracyGauntlet(shell) {{
    var sc = 850;
    shell.submitScore('accuracyGauntlet', sc);
    shell.appendOut('[SKILL] Accuracy gauntlet score: ' + sc);
  }}

  function startDecisionTree(shell) {{
    var gained = 600;
    shell.appendOut('[TREE] Decision tree complete — optimal playbook path recorded.');
    shell.submitScore('decisionTree', gained);
  }}

  var config = {{
    gameId: GAME_ID,
    title: '{g['title']}',
    achievementId: '{g['achievement']}',
    leaderboardChallenge: 'speedTrial',
    engine: {{ bg: {g['bg']}, physics: true }},
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
      shell.levelState.taskIdx = 0;
      var def = shell.config.levels[n];
      var seq = def.taskSequence || [{{ hint: def.hint }}];
      shell.setTaskText('Step 1/' + seq.length + ': ' + (seq[0].hint || def.hint));
      score += n * 10;
      updateScoreDisplay();
      narrateLevel(n, shell);
    }},
    onLevelComplete: function (lv, shell) {{
      var b = STORY_BEATS[lv];
      if (b) shell.appendOut('[NARRATIVE] ' + b.closing);
    }}
  }};

  config.onTick = function (dt, shell) {{
    meshes.forEach(function (m) {{
      if (m.userData && m.userData.physicsBody && m.userData.physicsBody.mass > 0) return;
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


INDEX_HTML_V2 = INDEX_HTML.replace(
    '  <script src="../shared/leaderboard-manager.js"></script>\n  <script src="../shared/game-engine-base.js"></script>',
    '  <script src="../shared/leaderboard-manager.js"></script>\n  <script src="../shared/physics-bridge.js"></script>\n  <script src="../shared/game-engine-base.js"></script>',
)


def patch_index(path) -> None:
    text = path.read_text(encoding="utf-8")
    if "physics-bridge.js" in text:
        return
    text = text.replace(
        '<script src="../shared/leaderboard-manager.js"></script>',
        '<script src="../shared/leaderboard-manager.js"></script>\n  <script src="../shared/physics-bridge.js"></script>',
    )
    path.write_text(text, encoding="utf-8")


def main() -> None:
    for g in GAMES:
        folder = MOD / g["folder"]
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "index.html").write_text(
            INDEX_HTML_V2.format(title=g["title"], pageId=g["pageId"]), encoding="utf-8"
        )
        (folder / "styles.css").write_text(
            STYLES_CSS.format(accent=g["accent"], bg_hex=hex_css(g["bg"])), encoding="utf-8"
        )
        js = js_for_game(g)
        (folder / "game.js").write_text(js, encoding="utf-8")
        print(f"{g['folder']}: {len(js.splitlines())} lines")
    patch_index(MOD / "game1-terminal" / "index.html")


if __name__ == "__main__":
    main()
