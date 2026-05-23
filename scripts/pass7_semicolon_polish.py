#!/usr/bin/env python3
"""Pass-7 semicolon polish: fix incorrect semicolon-before-conjunction artifacts."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Common conjunctions/relative pronouns that should not be preceded by a semicolon
WRONG_AFTER_SEMI = {
    "which", "who", "whom", "whose",
    "unlike", "like",
    "but", "and", "or", "yet", "nor", "so",
    "as", "because", "since", "if", "when", "while", "though", "although",
    "except", "however",
}


def fix_semicolon_conjunction(text: str) -> str:
    """Convert ' ; conjunction ' or '; conjunction' to ', conjunction'."""
    pattern = re.compile(
        r";\s+(" + "|".join(WRONG_AFTER_SEMI) + r")\s",
    )

    def repl(m: re.Match) -> str:
        return f", {m.group(1)} "

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
        # Skip inside code spans
        parts = re.split(r"(`[^`]*`)", line)
        new_parts = []
        for i, part in enumerate(parts):
            if i % 2 == 1:
                new_parts.append(part)
            else:
                new_parts.append(pattern.sub(repl, part))
        out_lines.append("".join(new_parts))
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def process_file(fp: Path) -> bool:
    orig = fp.read_text(encoding="utf-8")
    text = fix_semicolon_conjunction(orig)
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
    print(f"pass7_semicolon_polish changed={changed}")


if __name__ == "__main__":
    main()
