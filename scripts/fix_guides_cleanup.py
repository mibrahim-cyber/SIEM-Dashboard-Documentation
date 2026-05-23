#!/usr/bin/env python3
"""Second-pass cleanup: dedupe supplemental sections, fix em-dash artifacts, prose glitches."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EM = "\u2014"

PUNCT_FIXES = [
    (
        r"implements the shape of enterprise SOAR[.;:]\s*playbooks, enrichment, containment, audit[.:;]\s*without claiming",
        "implements the shape of enterprise SOAR (playbooks, enrichment, containment, audit) without claiming",
    ),
    (r"`PLAYBOOKS` array entries[.;:]\s*reference documents", "`PLAYBOOKS` array entries, reference documents"),
    (r"during ingest[.;]\s*verify role assignments", "during ingest; verify role assignments"),
    (r"auto blocks[.;]\s+not instrumented", "auto blocks; not instrumented"),
    (r"Not by default[.;]\s*only \*\*", "Not by default, only **"),
    (r"Not in current UI[.;]\s*scroll only", "Not in current UI; scroll only"),
    (r"until selection[.;]\s*empty right pane", "until selection; empty right pane"),
    (r"verification[.;]\s*pair dial", "verification; pair dial"),
    (r"evidence[.:]\s*not as score reduction", "evidence, not as score reduction"),
    (r"evidence[.;]\s+not as score reduction", "evidence, not as score reduction"),
    (r"\*12\)`\.unresolved", "*12`), unresolved"),
    (r"\*12\)`\. unresolved", "*12`), unresolved"),
    (r"entries\.array from", "entries; array from"),
    (r"entries\. array from", "entries; array from"),
    (r":if array passed", "; if array passed"),
    (r"×8\.compare", "×8; compare"),
    (r"Multiply by 8\.compare", "Multiply by 8; compare"),
    (r"`\]` : blocked", "`]; blocked"),
    (r"`\]`:\s*blocked", "`]; blocked"),
    (r"Return to Threat Intel — KPI", "Return to Threat Intel. KPI"),
    (r"cap:should", "cap; should"),
    (r":hardcoded", "; hardcoded"),
    (r"\)`\.unresolved", "`), unresolved"),
    (r"indirectly \(criticality visible", "indirectly; criticality visible"),
    (r"composite —may", "composite; may"),
    (r"composite; may", "composite; may"),
    (r"separately\.", "separately)."),
    (r"dependencies `\[`alerts, incidents`\]` : blocked", "dependencies `[alerts, incidents]`; blocked"),
    (r"dependencies `\[`alerts, incidents`\]`:\s*blocked", "dependencies `[alerts, incidents]`; blocked"),
    (r"All — technical", "All, technical"),
    (r"audience: All — technical", "audience: All, technical"),
]

EM_REMAINING = [
    (r"timestamps—partially", "timestamps, partially"),
    (r"unblocks—not instrumented", "unblocks; not instrumented"),
    (r"incidents—not SOAR", "incidents, not SOAR"),
    (r"from composite —may", "from composite; may"),
    (r"until corrected\. #### Extended operational context for Risk Scoring", "until corrected."),
    (r"real IPs—verify", "real IPs; verify"),
    (r"composite —may", "composite; may"),
]


def remove_duplicate_supplemental(text: str) -> tuple[str, int]:
    pattern = re.compile(r"\n### Supplemental implementation notes\n")
    removed = 0
    while True:
        matches = list(pattern.finditer(text))
        if len(matches) < 2:
            break
        start2 = matches[1].start()
        end2 = len(text)
        tech = text.find("\n> **Technical note:**", start2)
        if tech != -1:
            end2 = tech
        text = text[:start2].rstrip() + "\n\n" + text[end2:].lstrip()
        removed += 1
    return text, removed


def fix_inline_extended_heading(text: str) -> str:
    text = re.sub(
        r"(\. )#### Extended operational context for [^\n]+\n\n",
        ".\n\n### Supplemental implementation notes\n\n",
        text,
    )
    text = re.sub(r"#### Extended operational context for [^\n]+\n", "### Supplemental implementation notes\n", text)
    return text


def apply_fixes(text: str) -> str:
    for pat, repl in PUNCT_FIXES + EM_REMAINING:
        text = re.sub(pat, repl, text)
    # remaining em dashes -> varied punctuation; keep at most two per file
    alts = [", ", "; ", ": ", ". "]
    idx = 0
    kept = 0
    out: list[str] = []
    for ch in text:
        if ch != EM:
            out.append(ch)
            continue
        if kept < 2:
            out.append(" — ")
            kept += 1
        else:
            out.append(alts[idx % len(alts)])
            idx += 1
    text = "".join(out)
    text = re.sub(r";\s+;", "; ", text)
    text = re.sub(r",\s+,", ", ", text)
    text = re.sub(r"\.\s+\.", ".", text)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    return text.rstrip() + "\n"


def process_dir(base: Path) -> dict:
    stats = {"edited": 0, "dup_removed": 0}
    for fp in sorted(base.rglob("*.md")):
        orig = fp.read_text(encoding="utf-8")
        text = fix_inline_extended_heading(orig)
        text, dup = remove_duplicate_supplemental(text)
        text = apply_fixes(text)
        if text != orig:
            fp.write_text(text, encoding="utf-8")
            stats["edited"] += 1
        stats["dup_removed"] += dup
    return stats


def main() -> None:
    targets = [ROOT / "guides" / "respond", ROOT / "guides" / "intelligence"]
    if len(sys.argv) > 1:
        targets = [Path(p) for p in sys.argv[1:]]
    total_edited = 0
    total_dup = 0
    for t in targets:
        s = process_dir(t)
        total_edited += s["edited"]
        total_dup += s["dup_removed"]
    print(f"cleanup_edited={total_edited}")
    print(f"dup_supplemental_removed={total_dup}")


if __name__ == "__main__":
    main()
