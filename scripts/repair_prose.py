#!/usr/bin/env python3
"""Repair Q&A headings and UI label prose."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIRS = [
    ROOT / "guides" / "infrastructure",
    ROOT / "guides" / "configure",
    ROOT / "guides" / "reporting",
    ROOT / "guides" / "ingest-config",
]
EXTRA = [ROOT / "guides" / "README.md"]

GLUE_WORDS = {
    "Is", "Are", "On", "In", "To", "And", "Or", "Not", "Mean", "High", "Include",
    "Differ", "Update", "Represent", "Affect", "Directly", "Label", "Null", "Shown",
    "Data", "Job", "Misses", "The", "A", "An", "My", "Use", "Do", "Can", "Will",
}


def fix_qa_heading(line: str) -> str:
    if not line.startswith("#### "):
        return line
    body = line[5:].strip()
    body = re.sub(r"\*\* +", "**", body)
    body = re.sub(r" +(\*\*)", r"\1", body)
    body = re.sub(r"([a-zA-Z0-9\?\"])(\*\*[^*]+\*\*)", r"\1 \2", body)
    body = re.sub(r"(\*\*[^*]+\*\*)([a-z])", r"\1 \2", body)
    body = re.sub(
        rf"(\*\*[^*]+\*\*)({'|'.join(GLUE_WORDS)})\b",
        lambda m: f"{m.group(1)} {m.group(2).lower()}",
        body,
    )
    body = re.sub(r"(\*\*[^*]+\*\*) ([A-Z][a-z]+)\b", _lower_glue_after_bold, body)
    body = re.sub(r"  +", " ", body)
    return "#### " + body


def _lower_glue_after_bold(match: re.Match) -> str:
    word = match.group(2)
    if word in GLUE_WORDS:
        return f"{match.group(1)} {word.lower()}"
    return match.group(0)


def repair(text: str) -> str:
    lines = [fix_qa_heading(ln) if ln.startswith("#### ") else ln for ln in text.splitlines()]
    text = "\n".join(lines)
    subs = [
        (r"\*\*THREAT CLASSIFICATION\. LAST 7 DAYS\*\*", "**THREAT CLASSIFICATION — LAST 7 DAYS**"),
        (r"\*\*THREAT CLASSIFICATION: LAST 7 DAYS\*\*", "**THREAT CLASSIFICATION — LAST 7 DAYS**"),
        (r"Several benchmark numbers\. \*\*MTTR\*\* fixed at `12` minutes and \*\*FALSE POS %\*\* at `8`, are",
         "Several benchmark numbers are fixed placeholders: **MTTR** at `12` minutes and **FALSE POS %** at `8` are"),
        (r"optimise for speed, density, and action, hundreds of rows",
         "optimise for speed, density, and action: hundreds of rows"),
        (r"underlying React state changes \(new alerts, resolved alerts, SOAR blocks, and EPS ticks all re-render",
         "underlying React state changes (new alerts, resolved alerts, SOAR blocks, and EPS ticks) all re-render"),
        (r"formal assessments, they are deterministic",
         "formal assessments; they are deterministic"),
        (r"zeroed KPIs, do not present",
         "zeroed KPIs. Do not present"),
        (r"real metrics, call them out",
         "real metrics; call them out"),
        (r"deep--dive_essays", "topic_essays"),
        (r"Infrastructure · Configure · Reporting · ingest",
         "Infrastructure · Configure · Reporting · Ingest"),
        (r"Example: \*\*Configure", "Example — **Configure"),
        (r"\[INDEX\.md\]\(configure/correlation-builder/INDEX\.md\), lists",
         "[INDEX.md](configure/correlation-builder/INDEX.md) lists"),
    ]
    for pat, repl in subs:
        text = re.sub(pat, repl, text)
    return text


def main() -> None:
    files = []
    for d in DIRS:
        files.extend(sorted(d.rglob("*.md")))
    files.extend(EXTRA)
    edited = 0
    for fp in files:
        orig = fp.read_text(encoding="utf-8")
        new = repair(orig)
        if new != orig:
            fp.write_text(new, encoding="utf-8")
            edited += 1
    print(f"repaired {edited} files")


if __name__ == "__main__":
    main()
