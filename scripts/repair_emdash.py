#!/usr/bin/env python3
"""Repair over-aggressive em-dash → colon substitutions."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = list((ROOT / "docs").rglob("*.md")) + list((ROOT / "pentests").rglob("*.md"))


def repair(text: str) -> str:
    text = re.sub(r"\|\s*:\s*\|", "| — |", text)
    text = re.sub(r"^(#{1,4} (?:Test|Step) \d+) : ", r"\1 — ", text, flags=re.M)

    subs = [
        ("roles : including", "roles, including"),
        ("HTTP 403 : insufficient permissions", "HTTP 403 — insufficient permissions"),
        ("HTTP 200 : any authenticated user could write", "HTTP 200 — any authenticated user could write"),
        ("HTTP 403 : blocked", "HTTP 403 — blocked"),
        ("did not regenerate : vulnerable", "did not regenerate — vulnerable"),
        ("on login : new ID each time", "on login — new ID each time"),
        ("HTTP 403 : invalid CSRF token", "HTTP 403 — invalid CSRF token"),
        ("prevent CSRF : a synchroniser", "prevent CSRF; a synchroniser"),
        ("insufficient : all enforcement", "insufficient. All enforcement"),
        ("simulate campaign : includes", "simulate campaign, including"),
        ("That's intentional : a request", "That's intentional: a request"),
        ("and logged : other rules", "and logged; other rules"),
        ("prints a warning : you create", "prints a warning — you create"),
        ("incidents table : only alerts", "incidents table; only alerts"),
        ("6. CORS : only origins", "6. CORS — only origins from"),
        ("`check(log, allLogs)` : boolean", "`check(log, allLogs)` — boolean"),
        ("401 : parameterized", "401 — parameterized"),
        ("- **contained** : older", "- **contained:** older"),
        ("- **active** — last alert", "- **active:** last alert"),
        ("**Result:** 403 : RBAC enforced", "**Result:** 403 — RBAC enforced"),
        ("request forgery** : confirm", "request forgery** — confirm"),
    ]
    for old, new in subs:
        text = text.replace(old, new)

    text = re.sub(r"- `([^`]+)` : ", r"- `\1`: ", text)
    text = re.sub(r"- `([^`]+)` / `([^`]+)` : ", r"- `\1` / `\2`: ", text)
    return text


def main() -> None:
    changed = 0
    for fp in FILES:
        orig = fp.read_text(encoding="utf-8")
        new = repair(orig)
        if new != orig:
            fp.write_text(new, encoding="utf-8")
            changed += 1
    print(f"repaired {changed} files")


if __name__ == "__main__":
    main()
