#!/usr/bin/env python3
"""Verify deck v2 wing navigation, war room, signal room, and feature pack."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "assets/deck-nav.css",
    "assets/deck-nav.js",
    "assets/deck-features-v2.js",
    "assets/siem-core.js",
    "assets/palette.js",
    "assets/palette.css",
    "assets/terminal-shell.js",
    "assets/threat-actors.json",
    "assets/wargame-scenarios.json",
    "assets/deck-timeline.json",
    "left.html",
    "right.html",
    "brain/index.html",
    "index.html",
    "terminal.html",
    "breach.html",
    "network.html",
    "cipher.html",
    "sim.html",
    "intercept.html",
    "forge.html",
    "archive.html",
    "heist.html",
    "cartography.html",
    "lab.html",
    "memorial.html",
    "resonance.html",
    "404.html",
    "500.html",
    "sw.js",
    "trophy.html",
]

FEATURE_CHECKS = [
    ("Nav CSS plasma aura", "assets/deck-nav.css", ["deck-nav-plasma", "deck-nav-aura"]),
    ("Nav JS radial wipe", "assets/deck-nav.js", ["radialWipeNavigate", "initDeckNav", "deck-nav-wipe"]),
    ("Nav wired brain", "brain/index.html", ["deck-nav.css", "deck-nav.js", "data-deck-page=\"brain\"", "deck-nav-root"]),
    ("Nav wired left", "left.html", ["deck-nav.css", "deck-nav.js", "data-deck-page=\"left\"", "deck-nav-root"]),
    ("Nav paths left", "assets/deck-nav.js", ["left: { left: null", "right: 'brain/index.html'", "rightLabel: 'Observation Deck'"]),
    ("Nav wired right", "right.html", ["deck-nav.css", "deck-nav.js", "data-deck-page=\"right\"", "deck-nav-root"]),
    ("Nav paths right", "assets/deck-nav.js", ["right:", "right: null", "brain/index.html"]),
    ("Nav experience chain", "assets/deck-nav.js", ["EXPERIENCE_CHAIN", "terminal.html", "resonance.html", "The Heist"]),
    ("Nav wired terminal", "terminal.html", ["deck-nav.css", "deck-nav.js", "data-deck-page=\"terminal\"", "deck-nav-root"]),
    ("Nav wired breach", "breach.html", ["deck-nav.css", "deck-nav.js", "data-deck-page=\"breach\"", "deck-nav-root"]),
    ("Brain experience hub", "brain/index.html", ["deck-experience-orbit", "deck-experience-hub", "../terminal.html", "../heist.html", "../resonance.html"]),
    ("Landing experience tiles", "index.html", ["terminal.html", "breach.html", "heist.html"]),
    ("Nav labels", "assets/deck-nav.js", ["The War Room", "The Signal Room", "Observation Deck"]),
    ("War room stations", "left.html", ["Signal Feed", "Threat Matrix", "Incident Clock", "Analyst Comms", "Pipeline Gauges"]),
    ("War room map arcs", "left.html", ["war-map-arcs", "war-ioc-panel", "SIMULATION — DEMO DATA ONLY"]),
    ("War room debrief D", "left.html", ["war-debrief", "e.key === 'd'"]),
    ("War room mobile block", "left.html", ["war-mobile-block", "desktop"]),
    ("Signal room canvas", "right.html", ["sr-canvas", "drawSpectrum", "drawFrame"]),
    ("Signal room modes", "right.html", ["SPECTRUM", "OSCILLOSCOPE", "WATERFALL", "RADAR", "NEURAL", "INTERCEPT"]),
    ("Signal room header", "right.html", ["SR-7 // SIGNAL ROOM", "sr-retune-btn", "sr-snd-toggle"]),
    ("Signal room panels", "right.html", ["sr-panels", "1.2fr 1fr 1fr", "sr-panel-a"]),
    ("Signal room lock-on", "right.html", ["sr-lockon", "showLockOn"]),
    ("Signal room boot", "right.html", ["SIGNAL ROOM — SR-7", "sr-boot-bar", "beginMonitoring"]),
    ("Signal room drift", "right.html", ["SIGNAL LOST — REACQUIRING", "triggerDrift"]),
    ("Signal room transitions", "right.html", ["runTransition", "380"]),
    ("Signal room deck-nav", "right.html", ["deck-nav.js", "data-deck-page=\"right\""]),
    ("Signal room param link", "right.html", ["get('signal')", "get('gene')"]),
    ("Signal room preview link", "assets/deck-features-v2.js", ["right.html?signal="]),
    ("Features init", "assets/deck-features-v2.js", ["siemDeckFeatures", "siem-deck-ready"]),
    ("Evidence board E", "assets/deck-features-v2.js", ["deck-evidence-board", "EVIDENCE_KEY", "localStorage"]),
    ("Threat dossiers", "assets/deck-features-v2.js", ["deck-dossier-sidebar", "threat-actors.json", "_goldPulse"]),
    ("Architect zoom", "assets/deck-features-v2.js", ["hookArchitectZoom", "architectScale", "dblclick"]),
    ("War game", "assets/deck-features-v2.js", ["wargame-scenarios.json", "runWargame", "deck-wargame"]),
    ("Presence ghosts", "assets/deck-features-v2.js", ["BroadcastChannel", "deck-presence-ghost"]),
    ("Mission brief", "assets/deck-features-v2.js", ["generateMission", "deck-mission"]),
    ("Temporal replay", "assets/deck-features-v2.js", ["deck-timeline.json", "deck-temporal-replay", "deck-timeline-scrub"]),
    ("Sonification", "assets/deck-features-v2.js", ["PENTATONIC", "toggleSonification", "deck-sonify"]),
    ("Signal preview", "assets/deck-features-v2.js", ["deck-dna-preview", "right.html?signal="]),
    ("Constellation", "assets/deck-features-v2.js", ["deck-constellation-view", "toggleConstellation"]),
    ("Brain v2 toolbar", "brain/index.html", ["deck-v2-bar", "Evidence Board", "deck-evidence-toggle", "Known Actors", "War Game", "Generate Mission", "Constellation", "Sonify"]),
    ("Evidence board tab", "assets/deck-features-v2.js", ["deck-evidence-toggle", "setEvidenceOpen", "deck-evidence-board[hidden]"]),
    ("Brain hooks", "brain/index.html", ["getCanvas", "wormholeHit", "focusWorldAtScreen", "deck-features-v2.js"]),
    ("Brain getNodes export", "brain/index.html", ["getNodes", "openDeckBrief"]),
    ("Landing nav optional", "index.html", ["deck-nav.css", "data-deck-page=\"landing\"", "siem-core.js"]),
    ("Nav transitions T key", "assets/deck-nav.js", ["WIPE", "GLITCH", "DISSOLVE", "cycleTransitionStyle"]),
    ("Terminal page", "terminal.html", ["xterm", "terminal-shell.js", "term-boot"]),
    ("Siem core wired brain", "brain/index.html", ["siem-core.js", "palette.js"]),
    ("Experience pages palette", "assets/siem-core.js", ["terminal.html", "breach.html", "network.html"]),
]


def check_json_assets() -> list[str]:
    issues: list[str] = []
    ta = ROOT / "assets" / "threat-actors.json"
    if ta.is_file():
        data = json.loads(ta.read_text(encoding="utf-8"))
        if not isinstance(data, dict) or len(data) < 1:
            issues.append("threat-actors.json must be a non-empty object")
    wg = ROOT / "assets" / "wargame-scenarios.json"
    if wg.is_file():
        data = json.loads(wg.read_text(encoding="utf-8"))
        if not isinstance(data, list) or len(data) < 1:
            issues.append("wargame-scenarios.json must be a non-empty array")
    tl = ROOT / "assets" / "deck-timeline.json"
    if tl.is_file():
        data = json.loads(tl.read_text(encoding="utf-8"))
        if not data.get("events"):
            issues.append("deck-timeline.json must include events array")
    return issues


def run_pass(pass_num: int) -> tuple[int, list[str]]:
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
    failures.extend(check_json_assets())
    return len(failures), failures


def main() -> int:
    total_fail = 0
    all_issues: list[str] = []
    for i in range(1, 4):
        n, issues = run_pass(i)
        total_fail += n
        if issues:
            print(f"--- Pass {i}: {n} issue(s) ---", file=sys.stderr)
            for item in issues:
                print(item, file=sys.stderr)
            all_issues.extend(issues)
        else:
            print(f"Pass {i}: OK (0 issues)")
    print(f"\nSummary: 3 passes, {total_fail} total issue(s) across passes")
    if all_issues:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
