#!/usr/bin/env python3
"""Pass-6: Capitalize first letter of paragraphs that start with a lowercase letter."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fix_paragraph_caps(text: str) -> str:
    out_lines = []
    in_code = False
    in_fm = False
    for i, line in enumerate(text.splitlines()):
        # Track front matter
        if i == 0 and line == "---":
            in_fm = True
            out_lines.append(line)
            continue
        if in_fm and line == "---":
            in_fm = False
            out_lines.append(line)
            continue
        if in_fm:
            out_lines.append(line)
            continue
        # Track fenced code blocks
        if line.strip().startswith("```"):
            in_code = not in_code
            out_lines.append(line)
            continue
        if in_code:
            out_lines.append(line)
            continue
        # Skip headings, list items, table rows, blockquotes, image refs
        if not line:
            out_lines.append(line)
            continue
        stripped = line.lstrip()
        if (
            stripped.startswith("#")
            or stripped.startswith("- ")
            or stripped.startswith("* ")
            or stripped.startswith("|")
            or stripped.startswith(">")
            or stripped.startswith("!")
            or stripped.startswith("[")
            or stripped.startswith("`")
            or stripped.startswith("<")
            or re.match(r"^\d+\. ", stripped)
        ):
            out_lines.append(line)
            continue
        # Capitalize first letter if lowercase letter
        if stripped and stripped[0].islower():
            leading = line[:len(line) - len(stripped)]
            line = leading + stripped[0].upper() + stripped[1:]
        out_lines.append(line)
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def process_file(fp: Path) -> bool:
    orig = fp.read_text(encoding="utf-8")
    text = fix_paragraph_caps(orig)
    if text != orig:
        fp.write_text(text, encoding="utf-8")
        return True
    return False


def collect_files() -> list[Path]:
    files: list[Path] = []
    for sub in ("guides", "docs", "pentests"):
        d = ROOT / sub
        if d.exists():
            files.extend(sorted(d.rglob("*.md")))
    for name in ("README.md",):
        p = ROOT / name
        if p.exists():
            files.append(p)
    return files


def main() -> None:
    changed = 0
    for fp in collect_files():
        if process_file(fp):
            changed += 1
    print(f"pass6_paragraph_caps changed={changed}")


if __name__ == "__main__":
    main()
