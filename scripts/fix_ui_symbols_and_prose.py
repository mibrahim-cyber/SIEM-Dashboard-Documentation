#!/usr/bin/env python3
"""Remove UI symbol characters from all markdown and polish stiff prose in respond/executive-view guides."""
from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PLAY = "\u25b6"
WARN = "\u26a0"
CHECK = "\u2713"
CROSS = "\u2717"
PAUSE = "\u23f8"
X_MARK = "\u2715"
BULLET_F = "\u25cf"
BULLET_O = "\u25cb"
UP = "\u25b2"
DOWN = "\u25bc"
UI_SYMBOLS = PLAY + WARN + CHECK + CROSS + PAUSE + X_MARK + BULLET_F + BULLET_O + UP + DOWN
DELTA_ZERO = re.compile(r"(?<![0-9.])→\s*0(?!\d)")

PROSE_TARGETS = [
    ROOT / "guides" / "respond",
    ROOT / "guides" / "reporting" / "executive-view",
]

PROSE_FIXES: list[tuple[str, str]] = [
    (
        r"An incident is computed; not manually filed, by",
        "An incident is computed automatically, not manually filed, by",
    ),
    (
        r"appears as separate incidents: analysts must know",
        "appears as separate incidents. Analysts must know",
    ),
    (
        r"optimise for speed, density, and action; hundreds of rows",
        "optimise for speed, density, and action: hundreds of rows",
    ),
    (
        r"During the meeting they stay on this screen for the first five minutes; posture, trend, framework gap, operational metrics: then drop",
        "During the meeting they stay on this screen for the first five minutes to cover posture, trend, framework gaps, and operational metrics, then drop",
    ),
    (
        r"Several benchmark numbers: \*\*MTTR\*\* fixed at `12` minutes and FALSE POS % at `8`, are",
        "Several benchmark numbers are fixed placeholders: **MTTR** at `12` minutes and **FALSE POS %** at `8` are",
    ),
    (
        r"Several benchmark numbers: \*\*MTTR\*\* fixed at `12` minutes and FALSE POS % at `8`, are",
        "Several benchmark numbers are fixed placeholders: **MTTR** at `12` minutes and **FALSE POS %** at `8` are",
    ),
    (
        r"(?<![a-z])lack of data is not stability",
        "a lack of data is not stability",
    ),
    (
        r"`stats\.mttr`/`stats\.falsePositive` \(explicitly simulated\. \"so what\"",
        "`stats.mttr`/`stats.falsePositive` (explicitly simulated; \"so what\"",
    ),
    (
        r"prevents crying wolf, when hidden, your",
        "prevents crying wolf. When hidden, your",
    ),
    (
        r"\"volume flat, severity backlog worse\"\. teaches executives",
        "\"volume flat, severity backlog worse\" — this teaches executives",
    ),
    (
        r"Export notes manually or use Reporting → Executive View KPIs; not incident-specific briefings",
        "Export notes manually or use Reporting → Executive View KPIs, not incident-specific briefings",
    ),
    (
        r"MTTR estimates from Analytics; not wired from Incidents",
        "MTTR estimates from Analytics, not wired from Incidents",
    ),
    (
        r"disclaimer text watchlist only; not firewall enforced",
        "disclaimer text: watchlist only, not firewall enforced",
    ),
    (
        r"clarifies watchlist only; not firewall enforced",
        "clarifies watchlist only, not firewall enforced",
    ),
    (
        r"Treat the footer disclaimer watchlist only\. Not firewall enforced",
        "Treat the footer disclaimer (watchlist only, not firewall enforced)",
    ),
    (
        r"auto blocks; not instrumented today",
        "auto blocks, not instrumented today",
    ),
    (
        r"manual unblocks; not instrumented",
        "manual unblocks, not instrumented",
    ),
    (
        r"reversed within 24h; not automated",
        "reversed within 24h, not automated",
    ),
    (
        r"via API/`unblockIp`; not exposed prominently",
        "via API/`unblockIp`, not exposed prominently",
    ),
    (
        r"for audits\. Not Incidents notes alone",
        "for audits, not Incidents notes alone",
    ),
    (
        r"Data model only, no tag editor shipped\. Not implemented",
        "Data model only, no tag editor shipped. Not implemented",
    ),
    (
        r"ruleNames only\. Not categories or incident ID",
        "ruleNames only, not categories or incident ID",
    ),
    (
        r"emoji icon",
        "icon",
    ),
    (
        r"emoji icons",
        "icons",
    ),
    (
        r"\*\*RUN NOW\*\* enabled \|:\s*\|",
        "**RUN NOW** enabled | Success log entry appended |",
    ),
    (
        r"\*\*GENERATING\.\.\.\*\* disabled \|:\s*\|",
        "**GENERATING...** disabled | Log entry always `status: 'success'` |",
    ),
    (
        r"click \*\*RUN NOW\*\*; observe GENERATING\.\.\.: note",
        "click **RUN NOW** and observe GENERATING...; note",
    ),
    (
        r"exposure\?\"\. not \"how many logs",
        "exposure?\", not \"how many logs",
    ),
    (
        r"No\. it means the composite",
        "No. It means the composite",
    ),
    (
        r"minor copy inconsistency when comparing",
        "Minor copy inconsistency when comparing",
    ),
    (
        r"filter does not apply time: see gotchas",
        "filter does not apply a time window (see gotchas)",
    ),
    (
        r"`mttr: 12` \(minutes\), `falsePositive: 8` \(percent\)\. hard-coded",
        "`mttr: 12` (minutes), `falsePositive: 8` (percent), hard-coded",
    ),
    (
        r"confirm Write no Admin no Export yes",
        "confirm Write **no**, Admin **no**, Export **yes**",
    ),
    (
        r"confirm Write yes Admin no Export yes",
        "confirm Write **yes**, Admin **no**, Export **yes**",
    ),
    (
        r"confirm Write yes Admin yes Export yes",
        "confirm Write **yes**, Admin **yes**, Export **yes**",
    ),
    (
        r"confirm Admin yes and verbally",
        "confirm Admin **yes** and verbally",
    ),
    (
        r"Settings shows Export yes so they know CSV export is allowed, Write no so they will not",
        "Settings shows Export **yes** so they know CSV export is allowed, Write **no** so they will not",
    ),
    (
        r"wait for yes AbuseIPDB connection successful or error",
        "wait for a successful AbuseIPDB connection message or an error",
    ),
    (
        r"confirm yes SAVED TO SERVER flash",
        "confirm the **SAVED TO SERVER** flash",
    ),
    (
        r"still shows CONFIGURED on reload",
        "still shows **CONFIGURED** on reload",
    ),
    (
        r"Select a SUSPICIOUS user",
        "Select a **SUSPICIOUS** user",
    ),
    (
        r"shows yes NORMAL \(green\)",
        "shows **NORMAL** (green)",
    ),
    (
        r"20–39 ! ANOMALOUS",
        "20–39 **ANOMALOUS**",
    ),
    (
        r"70\+ SUSPICIOUS \(red\)",
        "70+ **SUSPICIOUS** (red)",
    ),
]


@dataclass
class Stats:
    files_changed: int = 0
    symbols_removed: int = 0
    prose_files_changed: int = 0


def normalize_malformed_fences(text: str) -> str:
    """Collapse automated-pass artifacts like ```````````` back to standard ``` fences."""
    prev = None
    while prev != text:
        prev = text
        text = re.sub(r"^(`{4,})([A-Za-z0-9_-]+)\s*$", r"```\2", text, flags=re.MULTILINE)
        text = re.sub(r"^(`{4,})\s*$", "```", text, flags=re.MULTILINE)
    return text


def split_fenced(text: str) -> list[tuple[bool, str]]:
    """Split markdown into prose and fenced-code segments."""
    parts: list[tuple[bool, str]] = []
    buf: list[str] = []
    in_fence = False

    for line in text.splitlines(keepends=True):
        stripped = line.lstrip()
        is_fence_line = stripped.startswith("```") and stripped.rstrip("\r\n") == stripped.strip()

        if is_fence_line:
            if in_fence:
                buf.append(line)
                parts.append((True, "".join(buf)))
                buf = []
                in_fence = False
            else:
                if buf:
                    parts.append((False, "".join(buf)))
                    buf = []
                buf.append(line)
                in_fence = True
        else:
            buf.append(line)

    if buf:
        parts.append((in_fence, "".join(buf)))
    return parts or [(False, text)]


def count_symbols(text: str) -> int:
    return sum(text.count(ch) for ch in UI_SYMBOLS) + len(DELTA_ZERO.findall(text))


def replace_ui_symbols(text: str, executive_view: bool) -> str:
    chunks: list[str] = []
    for in_fence, chunk in split_fenced(text):
        if in_fence:
            chunks.append(chunk)
            continue

        # Bold-wrapped UI labels first to avoid **** artifacts.
        chunk = re.sub(
            rf"\*\*{PLAY}\s+([^*]+)\*\*",
            r"**\1**",
            chunk,
        )
        chunk = re.sub(
            rf"\*\*{PAUSE}\s+([^*]+)\*\*",
            r"**\1**",
            chunk,
        )

        chunk = chunk.replace(f"{PLAY} INGEST N EVENTS INTO SIEM", "**INGEST N EVENTS INTO SIEM**")
        chunk = chunk.replace(f"{PLAY} TEST AGAINST LIVE LOGS", "**TEST AGAINST LIVE LOGS**")
        chunk = chunk.replace(f"{PLAY} RUN NOW", "**RUN NOW**")
        chunk = chunk.replace(f"{PLAY} RESUME", "**RESUME**")
        chunk = chunk.replace(f"{PLAY} INGEST", "**INGEST**")
        chunk = chunk.replace(f"{PAUSE} PAUSE", "**PAUSE**")
        chunk = chunk.replace(f"{PAUSE} PAUSE / **RESUME**", "**PAUSE** / **RESUME**")
        chunk = chunk.replace(
            f"{WARN} ACTIVE INCIDENTS REQUIRING EXECUTIVE ATTENTION",
            "**ACTIVE INCIDENTS REQUIRING EXECUTIVE ATTENTION**",
        )
        chunk = chunk.replace(f"{WARN} SUSPICIOUS", "**SUSPICIOUS**")
        chunk = chunk.replace(f"{CHECK} NORMAL", "**NORMAL**")
        chunk = chunk.replace(f"{CHECK} SAVED TO SERVER", "**SAVED TO SERVER**")
        chunk = chunk.replace("! ANOMALOUS", "**ANOMALOUS**")
        chunk = chunk.replace(f"{BULLET_F} CONFIGURED", "**CONFIGURED**")
        chunk = chunk.replace(f"{BULLET_O} not set", "not set")
        chunk = chunk.replace(f"**{X_MARK}** remove", "**Remove**")
        chunk = chunk.replace(f"**{X_MARK}**", "**Remove**")
        chunk = chunk.replace(f"{X_MARK} remove", "**Remove**")
        chunk = chunk.replace(f"{CROSS} marks", "failed marks")
        chunk = chunk.replace(f"green {CHECK} with success", "green success text")
        chunk = chunk.replace(f"orange {CROSS} with failure", "orange failure text")
        chunk = chunk.replace(f"{PLAY}_", "ENTER_")
        chunk = chunk.replace(f"{PLAY} ENTER LIVE SITE", "ENTER LIVE SITE")
        chunk = chunk.replace(f"{PLAY} ", "")

        chunk = re.sub(rf"\|\s*{CROSS}\s*\|", "| no |", chunk)
        chunk = re.sub(rf"\|\s*{CHECK}\s*\|", "| yes |", chunk)
        chunk = re.sub(rf"{CROSS}", "no", chunk)
        chunk = re.sub(rf"{CHECK}", "yes", chunk)
        chunk = re.sub(rf"{WARN}\s*", "", chunk)
        chunk = re.sub(rf"{X_MARK}", "Remove", chunk)
        chunk = re.sub(rf"[{BULLET_F}{BULLET_O}]", "", chunk)

        if executive_view:
            chunk = re.sub(rf"{UP} \+(\d+)", r"up \1", chunk)
            chunk = re.sub(rf"{UP} \+\$\{{k\.delta\}}", "up N", chunk)
            chunk = re.sub(rf"{UP} \+(\$\{{[^}}]+\}})", r"up \1", chunk)
            chunk = re.sub(rf"{DOWN} -(\d+)", r"down \1", chunk)
            chunk = re.sub(rf"{DOWN} (\d+)", r"down \1", chunk)
            chunk = re.sub(rf"{DOWN} \$\{{k\.delta\}}", "down N", chunk)
            chunk = re.sub(rf"{DOWN} delta", "downward delta", chunk)
            chunk = re.sub(rf"{UP} delta", "upward delta", chunk)
            chunk = re.sub(rf"\*\*{UP}\*\*", "upward", chunk)
            chunk = re.sub(rf"(?<![A-Za-z]){UP}(?![A-Za-z])", "upward", chunk)
            chunk = re.sub(rf"(?<![A-Za-z]){DOWN}(?![A-Za-z])", "downward", chunk)
            chunk = DELTA_ZERO.sub("unchanged (0)", chunk)

        chunks.append(chunk)

    text = "".join(chunks)
    text = re.sub(r"\*\*\*\*([^*]+)\*\*\*\*", r"**\1**", text)
    text = re.sub(r"\*\*\*\*", "**", text)
    return text


def apply_prose_fixes(text: str) -> str:
    for pattern, replacement in PROSE_FIXES:
        text = re.sub(pattern, replacement, text)
    return text


def is_prose_target(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix()
    if rel.startswith("guides/respond/") and path.name != "INDEX.md":
        return True
    if rel.startswith("guides/reporting/executive-view/") and path.name != "INDEX.md":
        return True
    return False


def collect_markdown_files() -> list[Path]:
    files = sorted(
        fp
        for fp in ROOT.rglob("*.md")
        if "__pycache__" not in fp.parts and ".git" not in fp.parts
    )
    return files


def process_file(path: Path, stats: Stats) -> bool:
    original = path.read_text(encoding="utf-8")
    text = original
    rel = path.relative_to(ROOT).as_posix()
    executive_view = rel.startswith("guides/reporting/executive-view/")

    text = normalize_malformed_fences(text)
    text = replace_ui_symbols(text, executive_view=executive_view)
    sym_before = count_symbols(original)
    sym_after = count_symbols(text)
    stats.symbols_removed += max(0, sym_before - sym_after)

    if is_prose_target(path):
        polished = apply_prose_fixes(text)
        if polished != text:
            stats.prose_files_changed += 1
        text = polished
    else:
        # Symbol aftermath cleanup (RBAC yes/no phrasing, etc.) for non-scope-B files.
        text = apply_prose_fixes(text)

    if text != original:
        path.write_text(text, encoding="utf-8")
        stats.files_changed += 1
        return True
    return False


def main() -> int:
    stats = Stats()
    for fp in collect_markdown_files():
        process_file(fp, stats)

    print(f"files_changed={stats.files_changed}")
    print(f"symbols_removed={stats.symbols_removed}")
    print(f"prose_files_changed={stats.prose_files_changed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
