#!/usr/bin/env python3
"""Scan repo markdown, HTML, and JSON for AI-ish prose, em-dash spam, and emojis."""
from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS))

from humanize_lib import WORD_REPLACEMENTS, humanize  # noqa: E402

SCAN_EXT = {".md", ".html", ".json"}
SKIP_PARTS = {"__pycache__", ".git", "node_modules"}

EMOJI_RE = re.compile(
    "["
    "\U0001F300-\U0001FAFF"
    "\U00002600-\U000027BF"
    "\U0001F600-\U0001F64F"
    "\U00002700-\U000027BF"
    "]+",
    flags=re.UNICODE,
)

EMDASH_SPAM_RE = re.compile(r"(?:\u2014|—).*(?:\u2014|—).*(?:\u2014|—)")


def iter_files(root: Path) -> list[Path]:
    out: list[Path] = []
    for fp in root.rglob("*"):
        if not fp.is_file():
            continue
        if fp.suffix.lower() not in SCAN_EXT:
            continue
        if any(part in SKIP_PARTS for part in fp.parts):
            continue
        out.append(fp)
    return sorted(out)


def scan_text(text: str) -> list[tuple[str, str, int]]:
    hits: list[tuple[str, str, int]] = []
    lines = text.splitlines()
    for pat, _repl in WORD_REPLACEMENTS:
        try:
            for m in re.finditer(pat, text):
                line = text[: m.start()].count("\n") + 1
                hits.append(("banned_phrase", m.group(0), line))
        except re.error:
            continue
    for i, line in enumerate(lines, 1):
        if EMDASH_SPAM_RE.search(line):
            hits.append(("emdash_spam", line.strip()[:100], i))
        for m in EMOJI_RE.finditer(line):
            hits.append(("emoji", m.group(0), i))
    return hits


def rel(fp: Path) -> str:
    try:
        return str(fp.relative_to(ROOT))
    except ValueError:
        return str(fp)


def run_audit(root: Path, fix_md: bool) -> dict:
    by_file: dict[str, list[tuple[str, str, int]]] = defaultdict(list)
    pattern_counts: dict[str, int] = defaultdict(int)
    fixed: list[str] = []

    for fp in iter_files(root):
        text = fp.read_text(encoding="utf-8")
        hits = scan_text(text)
        if hits:
            by_file[rel(fp)] = hits
            for kind, word, _line in hits:
                pattern_counts[kind] += 1
                if kind == "banned_phrase":
                    pattern_counts[f"word:{word.lower()}"] += 1

        if fix_md and fp.suffix.lower() == ".md":
            new = humanize(text)
            if new != text:
                fp.write_text(new, encoding="utf-8")
                fixed.append(rel(fp))

    return {
        "files_flagged": len(by_file),
        "pattern_counts": dict(pattern_counts),
        "by_file": dict(by_file),
        "fixes_applied": fixed,
    }


def safe_print(s: str) -> None:
    try:
        print(s)
    except UnicodeEncodeError:
        print(s.encode("ascii", "replace").decode("ascii"))


def print_summary(result: dict) -> None:
    safe_print("=== AI audit summary ===")
    safe_print(f"Files flagged: {result['files_flagged']}")
    safe_print("Pattern counts:")
    for k, v in sorted(result["pattern_counts"].items(), key=lambda x: (-x[1], x[0])):
        safe_print(f"  {k}: {v}")
    safe_print(f"Markdown auto-fixes applied: {len(result['fixes_applied'])}")
    if result["fixes_applied"]:
        for f in result["fixes_applied"][:20]:
            safe_print(f"  fixed: {f}")
        if len(result["fixes_applied"]) > 20:
            safe_print(f"  ... and {len(result['fixes_applied']) - 20} more")
    safe_print("\nTop flagged files:")
    for fp, hits in sorted(result["by_file"].items(), key=lambda x: -len(x[1]))[:15]:
        sample = hits[0]
        safe_print(f"  {fp} ({len(hits)} hits) e.g. {sample[0]} '{sample[1]}' line {sample[2]}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit docs for AI-ish patterns")
    parser.add_argument(
        "--fix-md",
        action="store_true",
        help="Auto-fix markdown via humanize_lib.humanize",
    )
    parser.add_argument("--root", type=Path, default=ROOT, help="Repo root")
    args = parser.parse_args()
    result = run_audit(args.root, fix_md=args.fix_md)
    print_summary(result)


if __name__ == "__main__":
    main()
