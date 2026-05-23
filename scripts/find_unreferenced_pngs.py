#!/usr/bin/env python3
"""Find PNG files never referenced in repo text sources."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEXT_EXTS = {".md", ".html", ".json", ".css", ".js", ".py", ".txt"}


def corpus() -> str:
    chunks: list[str] = []
    for fp in ROOT.rglob("*"):
        if not fp.is_file() or fp.suffix.lower() not in TEXT_EXTS:
            continue
        if "__pycache__" in fp.parts:
            continue
        try:
            chunks.append(fp.read_text(encoding="utf-8", errors="ignore"))
        except OSError:
            pass
    return "\n".join(chunks)


def main() -> None:
    text = corpus()
    pngs = sorted(ROOT.rglob("*.png"))
    unref: list[tuple[str, int]] = []
    for p in pngs:
        rel = p.relative_to(ROOT).as_posix()
        base = p.name
        patterns = [rel, rel.replace("/", "\\"), base, rel.split("screenshots/")[-1] if "screenshots/" in rel else ""]
        if not any(pat and pat in text for pat in patterns):
            unref.append((rel, p.stat().st_size))

    print(f"total_pngs={len(pngs)}")
    print(f"unreferenced={len(unref)}")
    for rel, size in sorted(unref, key=lambda x: -x[1]):
        print(f"{size/1024:7.1f} KB  {rel}")


if __name__ == "__main__":
    main()
