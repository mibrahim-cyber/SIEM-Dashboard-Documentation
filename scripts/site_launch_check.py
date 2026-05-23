#!/usr/bin/env python3
"""Launch QA checks — navigation wiring, shared head, service worker, siem-core."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

EXPERIENCE_PAGES = [
    "terminal.html", "breach.html", "network.html", "cipher.html", "sim.html",
    "intercept.html", "forge.html", "archive.html", "heist.html", "cartography.html",
    "lab.html", "memorial.html", "resonance.html",
]

ALL_HTML = [
    "index.html", "brain/index.html", "left.html", "right.html",
    *EXPERIENCE_PAGES, "motd.html", "trophy.html", "404.html", "500.html",
]

CHECKS: list[tuple[str, callable]] = []


def fail(msg: str) -> None:
    CHECKS.append((msg, False))


def ok(msg: str) -> None:
    CHECKS.append((msg, True))


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def main() -> int:
    nav = read("assets/deck-nav.js")
    sw = read("sw.js")
    qol = read("assets/siem-qol.js")

    for exp in EXPERIENCE_PAGES:
        page_id = exp.replace(".html", "")
        if page_id not in nav:
            fail(f"deck-nav missing route id: {page_id}")
        else:
            ok(f"deck-nav route: {page_id}")
        text = read(exp)
        for needle in ("deck-nav.css", "deck-nav.js", "deck-nav-root", f'data-deck-page="{page_id}"'):
            if needle not in text:
                fail(f"{exp} missing {needle}")
        if "siem-core.js" not in text or "palette.js" not in text:
            fail(f"{exp} missing siem-core/palette")
        if "SiemCore.bootPage" not in text:
            fail(f"{exp} missing bootPage()")

    if "data-deck-page') === 'landing') Motd.showIfNeeded()" not in qol:
        fail("motd not wired for landing first-load")
    else:
        ok("motd wired on landing")

    for exp in EXPERIENCE_PAGES:
        if exp not in sw:
            fail(f"sw.js precache missing {exp}")

    for rel in ALL_HTML:
        text = read(rel)
        prefix = "../" if rel.startswith("brain/") else ""
        for tag in ("charset", "description", "og:title", "favicon.ico", "apple-touch-icon"):
            if tag not in text:
                fail(f"{rel} missing head tag: {tag}")
        if "lang=" not in text[:300]:
            fail(f"{rel} missing lang on html")

    brain = read("brain/index.html")
    if "serviceWorker.getRegistrations" in brain:
        fail("brain unregisters service workers")
    if "deck-experience-hub" not in brain:
        fail("brain missing experience hub panel")

    failures = [m for m, passed in CHECKS if not passed]
    passes = [m for m, passed in CHECKS if passed]
    print(f"Passed: {len(passes)}")
    for m in failures:
        print("FAIL:", m)
    print(f"\nSummary: {len(failures)} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
