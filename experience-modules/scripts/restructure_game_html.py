#!/usr/bin/env python3
"""Restructure all 13 game index.html files to new game-wrapper layout."""
from pathlib import Path

MOD = Path(__file__).resolve().parents[1]

GAMES = [
    ("game1-terminal", "THE TERMINAL · 3D", "terminal", "terminal", True),
    ("game2-breach", "THE BREACH · 3D", "breach", "breach", False),
    ("game3-network", "GHOST NETWORK · 3D", "network", "network", False),
    ("game4-cipher", "THE CIPHER · 3D", "cipher", "cipher", False),
    ("game5-simulation", "THE SIMULATION · 3D", "sim", "sim", False),
    ("game6-intercept", "INTERROGATION · 3D", "intercept", "intercept", False),
    ("game7-forge", "THE FORGE · 3D", "forge", "forge", False),
    ("game8-archive", "DEEP ARCHIVE · 3D", "archive", "archive", False),
    ("game9-heist", "THE HEIST · 3D", "heist", "heist", False),
    ("game10-lab", "THE LAB · 3D", "lab", "lab", False),
    ("game11-cartography", "CARTOGRAPHY · 3D", "cartography", "cartography", False),
    ("game12-memorial", "MEMORIAL · 3D", "memorial", "memorial", False),
    ("game13-resonance", "RESONANCE · 3D", "resonance", "resonance", False),
]


def shell(folder, hud_game, page_id, boot_id, is_terminal):
    score = "" if is_terminal else '\n        <span id="hud-score">SCORE 0</span>'
    if is_terminal:
        output = """    <div id="output-area">
      <div id="term-out"></div>
      <form id="term-form"><span id="term-prompt" class="term-prompt">analyst@meridian-7:~$</span><input id="term-in" type="text" autocomplete="off" spellcheck="false" aria-label="Terminal command" placeholder="enter command..." /></form>
    </div>"""
    else:
        output = """    <div id="output-area">
      <div id="action-log"></div>
      <div id="action-btns"></div>
      <form id="term-form" class="hidden"><span id="term-prompt" class="term-prompt">&gt;</span><input id="term-in" type="text" autocomplete="off" /></form>
    </div>"""

    return f"""<!DOCTYPE html>
<html lang="en" data-deck-page="{page_id}-3d">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{hud_game.replace(' · 3D', '')} — HABIBI-SIEM</title>
  <link rel="stylesheet" href="../../assets/palette.css" />
  <link rel="stylesheet" href="../shared/styles-base.css" />
  <link rel="stylesheet" href="styles.css" />
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <link rel="stylesheet" href="../shared/operator-guide.css" />
</head>
<body>
<div id="game-wrapper">
  <div id="hud-top">
    <div class="hud-segment">
      <span class="hud-tag">Operation Meridian-7</span>
      <span id="hud-game">{hud_game}</span>
      <span id="hud-level">LEVEL 1</span>
    </div>
    <div class="hud-segment">
      <span class="hud-tag">Load</span>
      <div id="hud-load-bar"><div id="hud-load-fill"></div></div>
      <span id="hud-timer"></span>{score}
    </div>
  </div>

  <div id="canvas-host"></div>

  <div id="game-ui">
    <div id="task-bar">
      <div class="task-icon"></div>
      <div id="task-text">Initialising…</div>
    </div>
{output}
    <div id="skill-panel">
      <div class="skill-panel-title">Skill Challenges</div>
      <ul id="skill-list"></ul>
      <div class="lb-title">Leaderboard</div>
      <div id="lb-speed"></div>
    </div>
  </div>

  <div id="level-complete" class="hidden">
    <div class="complete-card">
      <div class="complete-eyebrow">Objective complete</div>
      <div id="complete-title"></div>
      <div id="complete-msg"></div>
      <div class="complete-divider"></div>
      <div id="complete-realworld"></div>
      <button type="button" id="btn-continue">Continue ▶</button>
    </div>
  </div>

  <div id="branch-overlay" class="hidden">
    <div class="branch-card">
      <div class="branch-eyebrow">Decision point</div>
      <div id="branch-title"></div>
      <div id="branch-desc"></div>
      <div id="branch-btns"></div>
    </div>
  </div>
</div>

<div id="deck-nav-root"></div>
<script src="../../assets/siem-core.js"></script>
<script src="../../assets/palette.js"></script>
<script src="../shared/progression-manager.js"></script>
<script src="../shared/learning-system.js"></script>
<script src="../shared/leaderboard-manager.js"></script>
<script src="../shared/physics-bridge.js"></script>
<script src="../shared/game-engine-base.js"></script>
<script src="../shared/game-shell.js"></script>
<script src="game.js"></script>
<script src="../../assets/deck-nav.js"></script>
<script>SiemCore.bootPage('{boot_id}');</script>
<script src="../shared/narrative-engine.js"></script>
<script src="../shared/operator-guide.js"></script>
</body>
</html>
"""


def main():
    for folder, hud, page, boot, term in GAMES:
        path = MOD / folder / "index.html"
        path.write_text(shell(folder, hud, page, boot, term), encoding="utf-8")
        print("Wrote", path)


if __name__ == "__main__":
    main()
