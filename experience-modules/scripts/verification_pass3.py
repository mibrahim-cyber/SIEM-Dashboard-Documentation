#!/usr/bin/env python3
"""Verification Pass 3 — triple bug test (paths, HTML integrity, classic links)."""
from __future__ import annotations
import re
import sys
from pathlib import Path

MOD = Path(__file__).resolve().parents[1]
REPO = MOD.parent

GAMES = [
    ("game1-terminal", "terminal.html"),
    ("game2-breach", "breach.html"),
    ("game3-network", "network.html"),
    ("game4-cipher", "cipher.html"),
    ("game5-simulation", "sim.html"),
    ("game6-intercept", "intercept.html"),
    ("game7-forge", "forge.html"),
    ("game8-archive", "archive.html"),
    ("game9-heist", "heist.html"),
    ("game10-lab", "lab.html"),
    ("game11-cartography", "cartography.html"),
    ("game12-memorial", "memorial.html"),
    ("game13-resonance", "resonance.html"),
]

issues: list[str] = []
ok: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    if cond:
        ok.append(name + (f" — {detail}" if detail else ""))
    else:
        issues.append(name + (f" — {detail}" if detail else ""))


def main() -> int:
    for folder, classic in GAMES:
        base = MOD / folder
        check(f"{folder}/index.html exists", (base / "index.html").is_file())
        check(f"{folder}/game.js exists", (base / "game.js").is_file())
        check(f"{folder}/styles.css exists", (base / "styles.css").is_file())

        html = (base / "index.html").read_text(encoding="utf-8") if (base / "index.html").is_file() else ""
        for script in ["progression-manager.js", "game-shell.js", "game.js"]:
            check(f"{folder} loads {script}", script in html)

        for rel in ["../../assets/siem-core.js", "../shared/game-engine-base.js"]:
            check(f"{folder} ref {rel}", rel in html)

        classic_path = REPO / classic
        if classic_path.is_file():
            ct = classic_path.read_text(encoding="utf-8")
            check(f"{classic} links {folder}", f"experience-modules/{folder}/index.html" in ct)
        else:
            issues.append(f"{classic} missing for link test")

    sw = REPO / "sw.js"
    if sw.is_file():
        sw_text = sw.read_text(encoding="utf-8")
        check("sw.js precaches game1", "experience-modules/game1-terminal" in sw_text)
        check("sw.js precaches shared shell", "experience-modules/shared/game-shell.js" in sw_text)
        check("sw.js precaches physics-bridge", "physics-bridge.js" in sw_text)
        check("sw.js precaches leaderboards", "leaderboards/manifest.json" in sw_text)

    lb_manifest = MOD / "leaderboards" / "manifest.json"
    check("leaderboards/manifest.json exists", lb_manifest.is_file())
    if lb_manifest.is_file():
        check("leaderboards has 13 boards", lb_manifest.read_text(encoding="utf-8").count("gameId") >= 13)

    hub = MOD / "index.html"
    check("experience-modules hub exists", hub.is_file())

    out = MOD / "VERIFICATION_PHASE3_BUG_TEST.md"
    body = [
        "# Verification Pass 3 — Bug Test\n",
        f"**Passed:** {len(ok)}\n",
        f"**Issues:** {len(issues)}\n\n",
        "## OK\n",
    ]
    for x in ok:
        body.append(f"- {x}\n")
    body.append("\n## Issues\n")
    for x in issues:
        body.append(f"- {x}\n")
    out.write_text("".join(body), encoding="utf-8")
    print(f"Pass 3: {len(ok)} ok, {len(issues)} issues -> {out}")
    return 0 if not issues else 1


if __name__ == "__main__":
    sys.exit(main())
