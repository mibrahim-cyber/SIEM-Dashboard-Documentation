#!/usr/bin/env python3
"""Remove unlinked duplicate/detail PNGs (safe deletes only)."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

KEEP_DETAIL = {
    "screenshots/guides/reporting-executive-view-detail.png",
}


def main() -> None:
    removed: list[tuple[str, int]] = []

    capture = ROOT / "assets" / "readme-wormhole-hero-capture.png"
    if capture.exists():
        size = capture.stat().st_size
        capture.unlink()
        removed.append((capture.relative_to(ROOT).as_posix(), size))

    for path in sorted((ROOT / "screenshots" / "guides").glob("*-detail.png")):
        rel = path.relative_to(ROOT).as_posix()
        if rel in KEEP_DETAIL:
            continue
        size = path.stat().st_size
        path.unlink()
        removed.append((rel, size))

    total = sum(s for _, s in removed)
    print(f"removed={len(removed)} bytes={total}")
    for rel, size in removed:
        print(f"  {size/1024:.1f} KB  {rel}")


if __name__ == "__main__":
    main()
