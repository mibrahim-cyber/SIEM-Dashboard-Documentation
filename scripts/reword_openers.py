#!/usr/bin/env python3
"""Vary rigid 'When you open X, the screen splits...' openers in Respond/Reporting guides."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

OPENERS: list[tuple[str, str]] = [
    (
        r"When you open Respond → Incidents, the screen splits into two panes\.",
        "Respond → Incidents uses a two-pane layout.",
    ),
    (
        r"When you open Reporting → Executive View, the screen opens with a C-suite header:",
        "Reporting → Executive View leads with a C-suite header:",
    ),
    (
        r"When you open Reporting → Reports, the screen divides into a wide main report canvas on the left and a fixed 208px sidebar on the right \(`w-52`\)\.",
        "Reporting → Reports puts the main report canvas on the left and a fixed 208px sidebar on the right (`w-52`).",
    ),
    (
        r"When you open Reporting → Scheduler, the screen divides into a fixed left rail and a flexible main panel\.",
        "Reporting → Scheduler uses a fixed left rail and a flexible main panel.",
    ),
]

UI_FIXES = [
    (r"THREAT CLASSIFICATION\. LAST 7 DAYS", "**THREAT CLASSIFICATION — LAST 7 DAYS**"),
    (r"THREAT CLASSIFICATION\. LAST 7 DAYS on the right", "**THREAT CLASSIFICATION — LAST 7 DAYS** on the right"),
]


def reword_file(text: str) -> str:
    for pat, repl in OPENERS:
        text = re.sub(pat, repl, text, count=1)
    for pat, repl in UI_FIXES:
        text = re.sub(pat, repl, text)
    return text


def main() -> None:
    targets = [
        ROOT / "guides" / "respond",
        ROOT / "guides" / "reporting",
    ]
    changed = 0
    for base in targets:
        for fp in sorted(base.rglob("*.md")):
            orig = fp.read_text(encoding="utf-8")
            new = reword_file(orig)
            if new != orig:
                fp.write_text(new, encoding="utf-8")
                changed += 1
    print(f"reworded_openers={changed}")
