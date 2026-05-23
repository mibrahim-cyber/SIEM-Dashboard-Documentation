#!/usr/bin/env python3
"""Recompute screenshot relative paths from each markdown file depth."""
from __future__ import annotations

import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMG = re.compile(r"!\[([^\]]*)\]\(([^)]+screenshots/[^)]+)\)")


def fix_path(fp: Path, url: str) -> str:
    name = url.replace("\\", "/").split("screenshots/", 1)[-1]
    asset = f"screenshots/{name.split('?')[0]}"
    target = ROOT / asset
    if not target.exists():
        return url
    return Path(os.path.relpath(target, fp.parent)).as_posix()


def main() -> None:
    changed = 0
    for fp in ROOT.rglob("*.md"):
        if "__pycache__" in str(fp):
            continue
        text = fp.read_text(encoding="utf-8")
        orig = text

        def repl(m: re.Match) -> str:
            alt, path = m.group(1), m.group(2)
            if path.startswith("http"):
                return m.group(0)
            fixed = fix_path(fp, path)
            return f"![{alt}]({fixed})"

        text = IMG.sub(repl, text)
        if text != orig:
            fp.write_text(text, encoding="utf-8")
            changed += 1
    print(f"recomputed_image_paths={changed}")


if __name__ == "__main__":
    main()
