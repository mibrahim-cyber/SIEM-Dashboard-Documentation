#!/usr/bin/env python3
"""Quick content audit for AI tells and banned patterns."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = [
    ("audience:", r"audience:"),
    (".jsx", r"\.jsx\b"),
    ("npm install", r"npm install"),
    ("git clone", r"git clone"),
    ("emoji", r"[\U0001F300-\U0001FAFF]"),
]
BANNED = [
    "leverage", "robust", "delve", "seamlessly", "comprehensive",
    "furthermore", "crucial", "landscape", "tapestry",
]

counts = {k: 0 for k, _ in PATTERNS}
counts["banned"] = 0
hits: list[tuple[str, str, int]] = []


def scan_text(path: Path, text: str) -> None:
    for key, pat in PATTERNS:
        m = re.findall(pat, text, re.I if key != "emoji" else 0)
        if m:
            counts[key] += len(m)
            hits.append((str(path), key, len(m)))
    low = text.lower()
    for w in BANNED:
        c = len(re.findall(r"\b" + re.escape(w) + r"\b", low))
        if c:
            counts["banned"] += c
            hits.append((str(path), w, c))
    if "it's worth noting" in low or "it is worth noting" in low:
        counts["banned"] += 1
        hits.append((str(path), "worth noting", 1))


def main() -> None:
    for fp in ROOT.rglob("*.md"):
        if "__pycache__" in str(fp):
            continue
        scan_text(fp, fp.read_text(encoding="utf-8", errors="replace"))
    for fp in ROOT.glob("assets/deck-*.json"):
        scan_text(fp, fp.read_text(encoding="utf-8"))
    print("AUDIT_COUNTS", counts)
    print("TOTAL_HITS", len(hits))
    for h in hits:
        print(h)


if __name__ == "__main__":
    main()
