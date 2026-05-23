#!/usr/bin/env python3
"""Convert raw.githubusercontent.com screenshot URLs to relative paths."""
from __future__ import annotations

import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = re.compile(
    r"https://raw\.githubusercontent\.com/Number-1-Python-Glazer/SIEM-Dashboard-Documentation/main/"
)


def rel_path(from_file: Path, asset: str) -> str:
    target = ROOT / asset.replace("\\", "/")
    return Path(os.path.relpath(target, from_file.parent)).as_posix()


def fix_file(fp: Path) -> bool:
    text = fp.read_text(encoding="utf-8")
    orig = text

    def sub_url(m: re.Match) -> str:
        asset = m.group(1).split("?")[0]
        return rel_path(fp, asset)

    text = RAW.sub(sub_url, text)

    if text != orig:
        fp.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = 0
    for fp in [ROOT / "README.md", ROOT / "guides" / "README.md"]:
        if fp.exists() and fix_file(fp):
            changed += 1
    for fp in sorted((ROOT / "guides").rglob("*.md")):
        if fix_file(fp):
            changed += 1
    print(f"files_updated={changed}")


if __name__ == "__main__":
    main()
