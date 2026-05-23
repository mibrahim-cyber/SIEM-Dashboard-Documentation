#!/usr/bin/env python3
"""Remove duplicate TLP/supplemental paragraphs repeated across ioc-watchlist pages."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "guides" / "intelligence" / "ioc-watchlist"

BLOCK_A = (
    "Add campaign-specific IOCs during active IR with appropriate TLP; remove user entries post-incident "
    "to prevent stale blocks; document adds in Case Manager until `addedAt` and author columns ship in UI. "
    "ISAC/STIX/TAXII import is manual today"
)
BLOCK_B = "Operationalise TLP labels in procedure documents because the UI only colour-codes them."
BLOCK_C = "TLP colouring (**RED**, **AMBER**, **GREEN**, **WHITE**) communicates sharing constraints"


def dedupe_paragraphs(text: str) -> str:
    paragraphs = re.split(r"\n\n+", text)
    seen: set[str] = set()
    kept: list[str] = []
    for para in paragraphs:
        norm = re.sub(r"\s+", " ", para.strip())
        if not norm:
            continue
        key = norm.lower()
        if any(marker in norm for marker in (BLOCK_A, BLOCK_B, BLOCK_C)):
            if key in seen:
                continue
            seen.add(key)
        kept.append(para.strip())
    return "\n\n".join(kept) + "\n"


def main() -> None:
    changed = 0
    for fp in sorted(DIR.glob("*.md")):
        if fp.name == "INDEX.md":
            continue
        orig = fp.read_text(encoding="utf-8")
        new = dedupe_paragraphs(orig)
        if new != orig:
            fp.write_text(new, encoding="utf-8")
            changed += 1
    print(f"deduped_ioc_watchlist={changed}")
