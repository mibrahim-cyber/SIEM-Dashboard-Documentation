#!/usr/bin/env python3
"""Pass-5 critical fix: restore missing space after period that pass3 dropped during sentence-case fix."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fix_period_space(text: str) -> str:
    """Insert a space between `word.NextWord` boundaries that lost their space.

    Skips lines inside fenced code blocks and inline code spans.
    """
    out_lines = []
    in_code = False
    for line in text.splitlines():
        if line.strip().startswith("```"):
            in_code = not in_code
            out_lines.append(line)
            continue
        if in_code:
            out_lines.append(line)
            continue
        # Walk the line keeping track of inline code spans (backticks)
        # Build segments [text, code, text, code, ...]
        parts = re.split(r"(`[^`]*`)", line)
        new_parts = []
        for i, part in enumerate(parts):
            if i % 2 == 1:
                # Code span; preserve verbatim
                new_parts.append(part)
                continue
            fixed = re.sub(
                r"([a-z]{3,}\.)([A-Z][a-z])",
                r"\1 \2",
                part,
            )
            # Also handle plural acronym endings like "IPs.Verify", "IOCs.Only", "CVEs.See"
            fixed = re.sub(
                r"([A-Z]{2,}s\.)([A-Z][a-z])",
                r"\1 \2",
                fixed,
            )
            new_parts.append(fixed)
        out_lines.append("".join(new_parts))
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def process_file(fp: Path) -> bool:
    orig = fp.read_text(encoding="utf-8")
    text = fix_period_space(orig)
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
    print(f"pass5_fix_period_space changed={changed}")


if __name__ == "__main__":
    main()
