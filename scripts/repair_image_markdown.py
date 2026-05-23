#!/usr/bin/env python3
"""Repair markdown image lines missing closing parenthesis after .png."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAT = re.compile(r"^(!\[[^\]]*\]\([^)\n]+\.png)\s*$", re.M)


def main() -> None:
    fixed = 0
    for fp in ROOT.rglob("*.md"):
        text = fp.read_text(encoding="utf-8")
        new, n = PAT.subn(r"\1)", text)
        if n:
            fp.write_text(new, encoding="utf-8")
            fixed += 1
    print(f"files_fixed={fixed}")


if __name__ == "__main__":
    main()
