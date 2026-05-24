#!/usr/bin/env python3
"""Verification Pass 2 — anti-pattern / quality scan."""
from __future__ import annotations
import re
import sys
from pathlib import Path

MOD = Path(__file__).resolve().parents[1]

GAMES = [
    "game1-terminal", "game2-breach", "game3-network", "game4-cipher",
    "game5-simulation", "game6-intercept", "game7-forge", "game8-archive",
    "game9-heist", "game10-lab", "game11-cartography", "game12-memorial", "game13-resonance",
]

issues: list[str] = []
ok: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    if cond:
        ok.append(name + (f" — {detail}" if detail else ""))
    else:
        issues.append(name + (f" — {detail}" if detail else ""))


def main() -> int:
    for folder in GAMES:
        js = MOD / folder / "game.js"
        html = MOD / folder / "index.html"
        text = js.read_text(encoding="utf-8") if js.is_file() else ""
        html_text = html.read_text(encoding="utf-8") if html.is_file() else ""

        check(f"{folder} shared script refs", "../shared/game-shell.js" in html_text)
        check(f"{folder} Three.js CDN", "three.min.js" in html_text or "three@" in html_text)
        check(f"{folder} no bare TODO", not re.search(r"\bTODO\b(?!\s*:\s*\w)", text))
        check(f"{folder} no console.log", "console.log(" not in text)
        check(f"{folder} progression gameId", "gameId:" in text or "GAME_ID" in text)
        check(f"{folder} epilogue path", "epilogue: true" in text or "runEpilogue" in text)
        check(f"{folder} branch decisions", "branch:" in text)
        check(f"{folder} skill challenges", "skills:" in text or "SKILL_DEFS" in text)

        dup = re.findall(r"shell\.appendOut\('\[PLAYBOOK\]", text)
        check(f"{folder} playbook depth", len(dup) >= 5 or folder == "game1-terminal", f"{len(dup)} blocks")

    for shared in ["progression-manager.js", "learning-system.js", "leaderboard-manager.js"]:
        st = (MOD / "shared" / shared).read_text(encoding="utf-8")
        check(f"shared/{shared} no console.log", "console.log(" not in st)

    out = MOD / "VERIFICATION_PHASE2_QUALITY_AUDIT.md"
    body = [
        "# Verification Pass 2 — Quality Audit\n",
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
    print(f"Pass 2: {len(ok)} ok, {len(issues)} issues -> {out}")
    return 0 if not issues else 1


if __name__ == "__main__":
    sys.exit(main())
