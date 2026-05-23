#!/usr/bin/env python3
"""Repair image paths where a slash was dropped before screenshots/."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BROKEN = re.compile(r"\(\.\./\.\./\.\./screenshots/")


def main() -> None:
    changed = 0
    for fp in ROOT.rglob("*.md"):
        if "__pycache__" in str(fp):
            continue
        text = fp.read_text(encoding="utf-8")
        new = text.replace("../../..screenshots/", "../../../screenshots/")
        new = new.replace("../..screenshots/", "../../screenshots/")
        new = new.replace("..screenshots/", "../screenshots/")
        if new != text:
            fp.write_text(new, encoding="utf-8")
            changed += 1
    print(f"fixed_image_paths={changed}")
