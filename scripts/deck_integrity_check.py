#!/usr/bin/env python3
"""Verify observation deck + landing features from user prompts are present in repo."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "read.html",
    "assets/marked.min.js",
    "assets/deck-briefs.json",
    "assets/deck-modes.js",
    "assets/deck-scenarios.json",
    "assets/deck-concepts.json",
    "assets/deck-skill-tree.json",
    "assets/deck-changelog.json",
    "assets/deck-health.json",
    "brain/index.html",
    "index.html",
]

FEATURE_CHECKS = [
    ("Brief modal + related", "brain/index.html", ["renderRelated", "openDeckBrief", "deck-brief-related"]),
    ("Doc viewer links", "brain/index.html", ["docReadUrl", "read.html"]),
    ("Print brief", "brain/index.html", ["printBrief", "deck-brief-print"]),
    ("Deep links focus=", "brain/index.html", ["slugToLabel", "focus"]),
    ("Role lens", "brain/index.html", ["deck-role", "ROLE_ACCESS"]),
    ("Incident trail", "brain/index.html", ["deck-trail-toggle", "TRAIL_PATH"]),
    ("Keyboard tour", "brain/index.html", ["keyboardFocusIdx", "Tab"]),
    ("Last visited", "brain/index.html", ["deck-last-visited", "deck-recent"]),
    ("Compare mode", "brain/index.html", ["comparePick", "Shift"]),
    ("Guided tour", "brain/index.html", ["deck-tour", "TOUR_STEPS"]),
    ("Glossary", "brain/index.html", ["GLOSSARY", "glossary-term"]),
    ("Alert sim", "brain/index.html", ["deck-alert-sim"]),
    ("Threat theater", "assets/deck-modes.js", ["playThreatScenario", "deck-threat-select"]),
    ("Persona switcher", "assets/deck-modes.js", ["PERSONAS", "deck-persona-select", "deck-reading-order-toggle"]),
    ("Skill tree", "assets/deck-modes.js", ["skillMode", "deck-skill-tree.json"]),
    ("Attack path chain", "assets/deck-modes.js", ["chainMode", "deck-chain-toggle"]),
    ("Concept map", "assets/deck-modes.js", ["conceptMode", "drawConceptMap"]),
    ("Changelog orbit", "assets/deck-modes.js", ["drawChangelogOrbit", "changelogOn"]),
    ("Tabletop cards", "assets/deck-modes.js", ["startTabletop", "tabletop"]),
    ("Session replay", "assets/deck-modes.js", ["deck-replay-bar", "replayToIndex"]),
    ("Focus tunnel", "assets/deck-modes.js", ["enterTunnel", "deck-tunnel"]),
    ("Challenge mode", "assets/deck-modes.js", ["challengeActive", "scoreChallenge"]),
    ("Cross-ref pulse", "assets/deck-modes.js", ["enhanceBriefCrossRef", "deck-xref-term"]),
    ("Doc health overlay", "assets/deck-modes.js", ["healthOverlay", "drawHealthHalos"]),
    ("Ambient audio", "assets/deck-modes.js", ["initAmbientAudio", "toggleAudio"]),
    ("PDF portfolio", "assets/deck-modes.js", ["exportPortfolio", "portfolioMode"]),
    ("Annotations", "assets/deck-modes.js", ["annotateMode", "deck-annotate-layer"]),
    ("Landing ENTER portal", "index.html", ["enter-portal", "ENTER"]),
    ("Markdown renderer", "read.html", ["marked.min.js", "renderMarkdown"]),
    ("Related in briefs JSON", "assets/deck-briefs.json", ['"related"']),
]

BRIEF_COUNT = 27


def check_briefs() -> list[str]:
    issues: list[str] = []
    fp = ROOT / "assets" / "deck-briefs.json"
    data = json.loads(fp.read_text(encoding="utf-8"))
    if len(data) < BRIEF_COUNT:
        issues.append(f"deck-briefs.json has {len(data)} entries, expected {BRIEF_COUNT}")
    for label, meta in data.items():
        if not meta.get("body"):
            issues.append(f"brief missing body: {label}")
        if not meta.get("href"):
            issues.append(f"brief missing href: {label}")
        if not meta.get("related"):
            issues.append(f"brief missing related: {label}")
    return issues


def run_pass() -> tuple[int, list[str]]:
    failures: list[str] = []
    for path in REQUIRED_FILES:
        if not (ROOT / path).is_file():
            failures.append(f"MISSING FILE: {path}")
    for name, rel, needles in FEATURE_CHECKS:
        fp = ROOT / rel
        if not fp.is_file():
            failures.append(f"{name}: file missing {rel}")
            continue
        text = fp.read_text(encoding="utf-8", errors="replace")
        for needle in needles:
            if needle not in text:
                failures.append(f"{name}: missing `{needle}` in {rel}")
    failures.extend(check_briefs())
    if (ROOT / "index.html").is_file():
        idx = (ROOT / "index.html").read_text(encoding="utf-8")
        if "Shuttle on final approach vector" in idx:
            failures.append("Landing: obstructing mission copy still in index.html")
        if "mission-copy" in idx and "display:none" not in idx and "<div class=\"mission-copy\">" in idx:
            failures.append("Landing: mission-copy div still visible")
    brain = (ROOT / "brain/index.html").read_text(encoding="utf-8", errors="replace")
    if "beforeNavigate" not in brain:
        failures.append("Related nav: beforeNavigate hook not wired in brain/index.html")
    return len(failures), failures


def main() -> None:
    total = 0
    for run in (1, 2):
        n, fails = run_pass()
        total = n
        print(f"=== Integrity pass {run}: {n} issue(s) ===")
        for f in fails:
            print(f"  - {f}")
        if n:
            print()
    if total:
        sys.exit(1)
    print("All integrity checks passed (2 passes).")


if __name__ == "__main__":
    main()
