#!/usr/bin/env python3
"""Human-editing pass for guide markdown: AI-tell cleanup, structure, em-dash reduction."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from humanize_docs import WORD_REPLACEMENTS, clean_front_matter  # noqa: E402

SECTION_HEADERS = [
    "What you are looking at",
    "What is happening underneath",
    "Why this matters",
    "Step-by-step walkthrough",
    "Common questions",
    "How an analyst uses this during an active incident",
    "Edge cases and gotchas",
]

TELEGRAPHIC_EXPANSIONS = [
    (r"No dedicated widget—derive offline\.", "The UI has no dedicated widget; derive the metric offline from audit logs and timestamps."),
    (r"No dedicated widget—derive offline", "The UI has no dedicated widget; derive the metric offline from audit logs and timestamps"),
    (r"Not in UI—consult benchmarks externally\.", "The UI does not include industry benchmarks; consult external sources for comparison."),
    (r"Need historical snapshots—not built-in\.", "You need historical snapshots; that capability is not built into this module."),
    (r"Finance/legal defines—map to score band\.", "Finance and legal teams define materiality; map their threshold to a score band."),
    (r"Screenshot or Reporting module—not native export here\.", "Use a screenshot or the Reporting module; native export is not available here."),
    (r"Manual audit of watchlisted IPs reversed within 24h—not automated\.", "Count false positives by manually auditing watchlisted IPs reversed within 24 hours; the app does not automate that tally."),
    (r"Displayed as \*\*mitigated\*\* label on Risk Scoring card—not subtractive in formula\.", "The Risk Scoring card shows a **mitigated** label, but blocked IPs do not subtract from the composite formula today."),
    (r"Less about live incident than retrospective—analyst flags false block in case notes for MTTR/FP weekly review\.", "This section matters more in retrospective review than during live response: flag false blocks in case notes for weekly MTTR and false-positive review."),
    (r"Not via UI—would require admin backend access\.", "There is no UI path; you would need admin backend access."),
    (r"Depends on server implementation—client display is not cryptographic proof\.", "That depends on server implementation; what the client displays is not cryptographic proof."),
    (r"Yes—they show due diligence even when intel unavailable\.", "Yes. They show due diligence even when threat intel is unavailable."),
    (r"Not in HABIBI-SIEM demo—use Case Manager checklists externally\.", "HABIBI-SIEM does not ship this in the demo; use Case Manager checklists or external tooling."),
    (r"Not in Settings—code change required\.", "Settings does not expose this; a code change is required."),
    (r"Outside app—GRC sign-off\.", "Formal risk acceptance happens outside the app through GRC sign-off."),
    (r"No time-series chart—current snapshot only\.", "There is no time-series chart, only a current snapshot."),
    (r"Use Reporting modules or SOAR log copy\.", "Use Reporting modules or copy entries from the SOAR audit log."),
]

EM_DASH = "\u2014"
ALT_REPLACEMENTS = [", ", "; ", ". ", ": "]


def bold_sections_to_headings(text: str) -> str:
    for header in SECTION_HEADERS:
        text = re.sub(
            rf"^\*\*{re.escape(header)}\*\*\s*$",
            f"### {header}",
            text,
            flags=re.MULTILINE,
        )
    return text


def ensure_heading_spacing(text: str) -> str:
    for header in SECTION_HEADERS + ["Supplemental implementation notes", "Additional analyst guidance"]:
        text = re.sub(
            rf"^(### {re.escape(header)})\n(?!\n)",
            r"\1\n\n",
            text,
            flags=re.MULTILINE,
        )
    return text


def normalize_block(s: str) -> str:
    s = re.sub(r"^#### Extended operational context[^\n]+\n", "", s)
    s = re.sub(r"^### Supplemental implementation notes\n", "", s)
    return re.sub(r"\s+", " ", s.strip())


def dedupe_extended_context(text: str) -> tuple[str, int]:
    marker = re.compile(r"\n#### Extended operational context for [^\n]+\n")
    matches = list(marker.finditer(text))
    if len(matches) < 2:
        return text, 0

    removed = 0
    while True:
        matches = list(marker.finditer(text))
        if len(matches) < 2:
            break
        start1 = matches[0].start()
        start2 = matches[1].start()
        end2 = matches[2].start() if len(matches) > 2 else len(text)
        tech = text.find("\n> **Technical note:**", start2)
        if tech != -1:
            end2 = min(end2, tech)

        block1 = text[start1:start2]
        block2 = text[start2:end2]
        if normalize_block(block1) == normalize_block(block2):
            text = text[:start2].rstrip() + "\n\n" + text[end2:].lstrip()
            removed += 1
        else:
            break

    return text, removed


def rename_extended_headers(text: str) -> str:
    text = re.sub(
        r"^#### Extended operational context for [^\n]+$",
        "### Supplemental implementation notes",
        text,
        flags=re.MULTILINE,
    )
    text = re.sub(
        r"^#### Additional guidance\s*$",
        "### Additional analyst guidance",
        text,
        flags=re.MULTILINE,
    )
    return text


def reduce_em_dashes(text: str, max_keep: int = 2) -> tuple[str, int]:
    count = text.count(EM_DASH)
    if count <= max_keep:
        return text, 0

    keep_positions: set[int] = set()
    if max_keep > 0:
        for m in re.finditer(re.escape(EM_DASH), text):
            keep_positions.add(m.start())
            if len(keep_positions) >= max_keep:
                break

    reduced = 0
    alt_idx = 0
    out: list[str] = []
    for i, ch in enumerate(text):
        if ch != EM_DASH:
            out.append(ch)
            continue
        if i in keep_positions:
            out.append(EM_DASH)
        else:
            out.append(ALT_REPLACEMENTS[alt_idx % len(ALT_REPLACEMENTS)])
            alt_idx += 1
            reduced += 1

    result = "".join(out)
    result = re.sub(r"\s+,", ",", result)
    result = re.sub(r"\s+;", ";", result)
    result = re.sub(r"\s+\.", ".", result)
    result = re.sub(r"\.\s+\.", ".", result)
    result = re.sub(r";\s*([a-z])", lambda m: "; " + m.group(1), result)
    result = re.sub(r",\s*([a-z])", lambda m: ", " + m.group(1), result)
    result = re.sub(r"processLogs\);\s*read-only", "processLogs`); read-only", result)
    result = re.sub(r"processLogs\);\s*read", "processLogs`); read", result)
    return result, reduced


def apply_word_replacements(text: str) -> str:
    for pat, repl in WORD_REPLACEMENTS:
        text = re.sub(pat, repl, text)
    text = re.sub(r"^[ \t]+,", "", text, flags=re.MULTILINE)
    text = re.sub(r"\.\s+\.", ".", text)
    return text


def expand_telegraphic(text: str) -> str:
    for pat, repl in TELEGRAPHIC_EXPANSIONS:
        text = re.sub(pat, repl, text)
    return text


def cleanup_artifacts(text: str) -> str:
    text = re.sub(r"^####\s*❓\s*", "#### ", text, flags=re.MULTILINE)
    text = re.sub(r"^###\s*❓\s*", "### ", text, flags=re.MULTILINE)
    text = re.sub(r"^# ([^—\n]+) — Documentation Index$", r"# \1 documentation index", text, flags=re.MULTILINE)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    return text.rstrip() + "\n"


def humanize_file(text: str) -> tuple[str, dict]:
    stats = {"em_dashes_reduced": 0, "dup_blocks_removed": 0, "emoji_removed": text.count("❓")}
    original_words = len(text.split())

    text = clean_front_matter(text)
    text = cleanup_artifacts(text)
    text = bold_sections_to_headings(text)
    text, dup = dedupe_extended_context(text)
    stats["dup_blocks_removed"] = dup
    text = rename_extended_headers(text)
    text = ensure_heading_spacing(text)
    text = apply_word_replacements(text)
    text = expand_telegraphic(text)
    text, em_reduced = reduce_em_dashes(text, max_keep=2)
    stats["em_dashes_reduced"] = em_reduced
    text = cleanup_artifacts(text)

    stats["word_delta"] = len(text.split()) - original_words
    return text, stats


def process_paths(paths: list[Path]) -> dict:
    report = {
        "files_scanned": 0,
        "files_edited": 0,
        "em_dashes_reduced": 0,
        "dup_blocks_removed": 0,
        "emoji_removed": 0,
        "flags": [],
    }

    for base in paths:
        for fp in sorted(base.rglob("*.md")):
            report["files_scanned"] += 1
            orig = fp.read_text(encoding="utf-8")
            new, stats = humanize_file(orig)
            if new != orig:
                fp.write_text(new, encoding="utf-8")
                report["files_edited"] += 1
            report["em_dashes_reduced"] += stats["em_dashes_reduced"]
            report["dup_blocks_removed"] += stats["dup_blocks_removed"]
            report["emoji_removed"] += stats["emoji_removed"]

            rel = fp.relative_to(ROOT)
            em_remaining = new.count(EM_DASH)
            if em_remaining > 2:
                report["flags"].append(f"{rel}: {em_remaining} em dashes remain")
            if stats["word_delta"] < -80:
                report["flags"].append(f"{rel}: word count dropped {abs(stats['word_delta'])} words")
            if "#### Extended operational context" in new:
                report["flags"].append(f"{rel}: duplicate extended-context header remains")
            if "**What you are looking at**" in new:
                report["flags"].append(f"{rel}: bold section headers remain")

    return report


def main() -> None:
    targets = [ROOT / "guides" / "respond", ROOT / "guides" / "intelligence"]
    if len(sys.argv) > 1:
        targets = [Path(p) for p in sys.argv[1:]]

    report = process_paths(targets)
    print(f"files_scanned={report['files_scanned']}")
    print(f"files_edited={report['files_edited']}")
    print(f"em_dashes_reduced={report['em_dashes_reduced']}")
    print(f"dup_blocks_removed={report['dup_blocks_removed']}")
    print(f"emoji_removed={report['emoji_removed']}")
    if report["flags"]:
        print("flags:")
        for f in report["flags"]:
            print(f"  - {f}")


if __name__ == "__main__":
    main()
