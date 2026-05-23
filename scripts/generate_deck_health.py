#!/usr/bin/env python3
"""Scan markdown docs and build deck-health.json for the observation deck overlay."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRIEFS = ROOT / "assets" / "deck-briefs.json"
OUT = ROOT / "assets" / "deck-health.json"

IMG_RE = re.compile(r"!\[[^\]]*\]\([^)]+\)")
LINK_RE = re.compile(r"\]\([^)]+\)")


def word_count(text: str) -> int:
    return len(re.findall(r"\b[\w'-]+\b", text))


def scan_dir(rel_dir: str) -> dict:
    base = ROOT / rel_dir.replace("/", "\\") if rel_dir else ROOT
    if not base.is_dir():
        return {"words": 0, "pages": 0, "screenshots": 0, "links": 0, "stale": True}

    words = 0
    pages = 0
    screenshots = 0
    links = 0
    mtime = 0.0

    for fp in base.rglob("*.md"):
        if "__pycache__" in str(fp):
            continue
        try:
            text = fp.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        pages += 1
        words += word_count(text)
        screenshots += len(IMG_RE.findall(text))
        links += len(LINK_RE.findall(text))
        mtime = max(mtime, fp.stat().st_mtime)

    days_old = (datetime.now().timestamp() - mtime) / 86400 if mtime else 999
    stale = days_old > 120 or pages == 0

    return {
        "words": words,
        "pages": pages,
        "screenshots": screenshots,
        "links": links,
        "stale": stale,
        "daysSinceEdit": round(days_old, 1),
    }


def health_score(stats: dict) -> float:
    score = 1.0
    if stats["pages"] == 0:
        return 0.1
    avg_words = stats["words"] / max(stats["pages"], 1)
    if avg_words < 400:
        score -= 0.25
    if stats["screenshots"] == 0:
        score -= 0.2
    if stats["stale"]:
        score -= 0.3
    if stats["links"] < stats["pages"]:
        score -= 0.1
    return max(0.05, min(1.0, score))


def build() -> dict:
    briefs = json.loads(BRIEFS.read_text(encoding="utf-8"))
    nodes: dict[str, dict] = {}
    for label, meta in briefs.items():
        rel = (meta.get("dir") or "docs/").strip("/")
        stats = scan_dir(rel)
        nodes[label] = {
            "label": label,
            "dir": meta.get("dir", ""),
            "score": round(health_score(stats), 2),
            **stats,
        }
    return {
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "nodes": nodes,
    }


def main() -> None:
    data = build()
    OUT.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(data['nodes'])} nodes)")


if __name__ == "__main__":
    main()
