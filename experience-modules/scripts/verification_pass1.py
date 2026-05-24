#!/usr/bin/env python3
"""Verification Pass 1 — feature presence scan for experience-modules."""
from __future__ import annotations
import re
import sys
from pathlib import Path

MOD = Path(__file__).resolve().parents[1]

GAMES = [
    ("the_terminal", "game1-terminal"),
    ("the_breach", "game2-breach"),
    ("the_ghost_network", "game3-network"),
    ("the_cipher", "game4-cipher"),
    ("the_simulation", "game5-simulation"),
    ("the_interrogation_room", "game6-intercept"),
    ("the_forge", "game7-forge"),
    ("the_deep_archive", "game8-archive"),
    ("the_heist", "game9-heist"),
    ("the_lab", "game10-lab"),
    ("the_cartography", "game11-cartography"),
    ("the_memorial", "game12-memorial"),
    ("the_resonance", "game13-resonance"),
]

REQUIRED_PER_GAME = [
    "HabibiGameShell",
    "levels:",
    "buildScene",
    "branch:",
    "skills:",
    "epilogue: true",
    "achievementId",
]

REQUIRED_SHARED = [
    "progression-manager.js",
    "learning-system.js",
    "leaderboard-manager.js",
    "game-engine-base.js",
    "game-shell.js",
]

issues: list[str] = []
ok: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    if cond:
        ok.append(name + (f" — {detail}" if detail else ""))
    else:
        issues.append(name + (f" — {detail}" if detail else ""))


def main() -> int:
    for f in REQUIRED_SHARED:
        check(f"shared/{f}", (MOD / "shared" / f).is_file())

    for gid, folder in GAMES:
        base = MOD / folder
        js = base / "game.js"
        html = base / "index.html"
        check(f"{folder}/index.html", html.is_file())
        check(f"{folder}/game.js", js.is_file())
        if not js.is_file():
            continue
        text = js.read_text(encoding="utf-8", errors="replace")
        lines = len(text.splitlines())
        check(f"{folder} line count >= 400", lines >= 400, f"{lines} lines")
        for needle in REQUIRED_PER_GAME:
            check(f"{folder} contains `{needle}`", needle in text)
        if "console.log(" in text:
            issues.append(f"{folder} has console.log")
        if re.search(r"\bTODO\b(?!\s*:\s*\w)", text):
            issues.append(f"{folder} has bare TODO")

    out = MOD / "VERIFICATION_PHASE1_FEATURE_AUDIT.md"
    body = ["# Verification Pass 1 — Feature Audit\n", f"**Passed:** {len(ok)}\n", f"**Issues:** {len(issues)}\n\n"]
    body.append("## OK\n")
    for x in ok:
        body.append(f"- {x}\n")
    body.append("\n## Issues\n")
    for x in issues:
        body.append(f"- {x}\n")
    out.write_text("".join(body), encoding="utf-8")
    print(f"Pass 1: {len(ok)} ok, {len(issues)} issues -> {out}")
    return 0 if not issues else 1


if __name__ == "__main__":
    sys.exit(main())
