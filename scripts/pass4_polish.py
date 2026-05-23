#!/usr/bin/env python3
"""Pass-4 final polish: fixes broken sentences from paired em-dash conversions, residual artifacts."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Targeted fixes for broken paired em-dash sentences and residual artifacts
FIXES: list[tuple[str, str]] = [
    # Broken paired em-dash → semicolon sentences (parenthetical aside)
    (
        r"Cross-check with a second module; Threat Hunt counts, Event Graph relationships, or Live Feed raw lines; before containment\.",
        "Cross-check with a second module (Threat Hunt counts, Event Graph relationships, or Live Feed raw lines) before containment.",
    ),
    (
        r"this lab dashboard prioritises teaching the \*investigation workflow\* : you decide",
        "this lab dashboard prioritises teaching the *investigation workflow* (you decide",
    ),
    # Specific "It is internal only.Unlike" → add space
    (r"internal only\.Unlike", "internal only. Unlike"),
    # Fix double-space after newly capitalised words
    (r"\.\s{2,}([A-Z])", r". \1"),
    # Convert remaining trailing ", " sequences with extra space
    (r" , ", ", "),
    # Common known-broken patterns
    (
        r"interchangeable : Timeline for story",
        "interchangeable; Timeline tells the story",
    ),
    (
        r"in what order did events occur\?\" : Graph answers",
        "in what order did events occur?\"; Graph answers",
    ),
    (
        r"east-west paths, when \*\*INTERNAL\*\*",
        "east-west paths; when **INTERNAL**",
    ),
    (
        r"map fills with many small external nodes : // MAP STATS",
        "map fills with many small external nodes; // MAP STATS",
    ),
    (
        r"deviation prevents panic : Monday morning",
        "deviation prevents panic; Monday morning",
    ),
    (
        r"same external IP : here, a consistently",
        "same external IP; here, a consistently",
    ),
    (
        r"with reason such as Threat intel unavailable : no auto-watchlist",
        "with reason such as Threat intel unavailable, meaning no auto-watchlist entry",
    ),
    (
        r"footer disclaimer watchlist only : not firewall enforced",
        "footer disclaimer (watchlist only, not firewall-enforced)",
    ),
    (
        r"Timeline SVG is ephemeral DOM : not serialized",
        "Timeline SVG is ephemeral DOM and is not serialized",
    ),
    (
        r"Yes with spreadsheet pivot or external SIEM : include",
        "Yes with a spreadsheet pivot or external SIEM; include",
    ),
    (
        r"State the timezone used in tick labels : `fmtTime\(\)`",
        "State the timezone used in tick labels: `fmtTime()`",
    ),
    (
        r"category waves across IPs : Timeline bands primarily IP-incident driven",
        "category waves across IPs; Timeline bands are primarily IP-incident driven",
    ),
    (
        r"complementary, not interchangeable : Timeline",
        "complementary, not interchangeable. Timeline",
    ),
    (
        r"No : SQLite growth tied to alert count",
        "No. SQLite growth is tied to alert count",
    ),
    (
        r"`dropPct` variable computed but not displayed in UI : potential",
        "`dropPct` variable computed but not displayed in UI; potential",
    ),
    (
        r"Not displayed as metric in v4 : infer",
        "Not displayed as a metric in v4; infer",
    ),
    (
        r"not downgrade severity in Overview UI : tuning",
        "not downgrade severity in the Overview UI; tuning",
    ),
    (
        r"arbitrary user-supplied JSON/CSV lines through the ingest UI and API : useful",
        "arbitrary user-supplied JSON/CSV lines through the ingest UI and API, useful",
    ),
    (
        r"Simulation does not reset `logsProcessed` : \*\*LOGS\*\*",
        "Simulation does not reset `logsProcessed`; **LOGS**",
    ),
    (
        r"No page numbers, no offset API : pure",
        "No page numbers, no offset API; pure",
    ),
    (
        r"local browser timezone, not UTC : compare",
        "local browser timezone, not UTC; compare",
    ),
    (
        r"`formatLogSummary\(\)` must handle ECS objects : `url`",
        "`formatLogSummary()` must handle ECS objects (`url`",
    ),
    (
        r"Edit rule source in `rules\.js` / Rules Engine UI : not",
        "Edit rule source in `rules.js` or the Rules Engine UI; not",
    ),
    (
        r"Yes : \[ RESOLVE \]",
        "Yes. [ RESOLVE ]",
    ),
    (
        r"Industry speaks MITRE : bridging",
        "Industry speaks MITRE; bridging",
    ),
    (
        r"analyst B arrives : B loads it",
        "analyst B arrives; B loads it",
    ),
    (
        r"\(`VPN-auth-Q2-external-IPs`\)",
        "(`VPN-auth-Q2-external-IPs`)",
    ),
    (
        r"\"Blocked 185\.220\.101\.45 : Tor exit AS60729\"",
        "\"Blocked 185.220.101.45, Tor exit AS60729\"",
    ),
    # Field-definition list items: normalise " : " "; " ", " ". " to ": " after lowercase field name preceded by "- "
    # Use callable: must come after general fixes
    # (handled below per-line)
]

# Headings/proper-case fixes
HEADING_FIXES: list[tuple[str, str]] = [
    (r"^# insider threat detection$", "# Insider threat detection"),  # already handled
]

# Specific README/badge fixes
README_FIXES: list[tuple[str, str]] = [
    (r"per-topic detailed essays", "per-topic detailed pages"),
    (r"topic_essays", "topic_pages"),
    (r"essays-190", "pages-190"),
    (r"\bEssays\]\(https://img\.shields\.io", "Pages](https://img.shields.io"),
    (r"Topic_pages", "Topic_pages"),  # no-op safe
]


def normalize_field_def_lines(text: str) -> str:
    """For markdown list items like `- field; description`, normalise the separator.

    Match list items beginning with `- ` followed by a code/bold/plain field token then
    one of [;,.:] + space + capitalised description; normalise to `: `.
    """
    out_lines = []
    for line in text.splitlines():
        # Pattern: `- ` then field token then [;,.] + space + uppercase letter
        # Limit to first 60 chars to avoid catching long sentence-like list items
        m = re.match(r"^(- (?:\*\*[\w \-]+\*\*|`[\w\-_]+`|[\w\-_]+))\s*[;,.]\s+([A-Z][\w])", line)
        if m and len(m.group(0)) < 60:
            field_part = m.group(1)
            rest_start = m.end(1)
            # find end of separator
            sep_match = re.match(r"\s*[;,.:]\s+", line[rest_start:])
            if sep_match:
                after = line[rest_start + sep_match.end():]
                line = f"{field_part}. {after}"  # use period for definition list look
        # Also handle " : " in `- field : Description`
        m2 = re.match(r"^(- (?:\*\*[\w \-]+\*\*|`[\w\-_]+`|[\w\-_]+))\s+:\s+([A-Z])", line)
        if m2 and len(m2.group(0)) < 80:
            field_part = m2.group(1)
            rest_start = m2.end(1)
            sep_match = re.match(r"\s+:\s+", line[rest_start:])
            if sep_match:
                after = line[rest_start + sep_match.end():]
                line = f"{field_part}. {after}"
        out_lines.append(line)
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def broaden_space_colon(text: str) -> str:
    """Replace " : " between any letters/digits with semicolons or periods, in prose lines only."""
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
        # Skip list-item lines (already normalised separately)
        # Convert " : " between alnum/letter/closing-quote and any letter to "; "; if right side uppercase, ". "
        def repl(m: re.Match) -> str:
            left = m.group(1)
            right = m.group(2)
            if right.isupper():
                return f"{left}. {right}"
            return f"{left}; {right}"

        new = re.sub(r"([A-Za-z0-9\)`'\"])\s:\s([A-Za-z])", repl, line)
        out_lines.append(new)
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def convert_remaining_em_dashes(text: str) -> str:
    """For files with non-UI-label em-dashes, convert them.

    Single em-dashes between a code/word and a description in list items become ': '.
    Single em-dashes between sentence clauses become '; '.
    Pairs of em-dashes become parentheses.
    """
    EM = "\u2014"
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
        # List item: "- TOKEN — description" → "- TOKEN: description"
        new = re.sub(
            r"^(\s*-\s+(?:`[^`]+`|\*\*[^*]+\*\*|[\w][\w\-_./]*))\s*" + EM + r"\s+",
            r"\1: ",
            line,
        )
        # Inline single em-dash NOT between UI labels → "; "
        # We protect UI labels of form **CAPS** — **CAPS** or `CAPS` — `CAPS` or CAPS — CAPS
        def replace_inline(line: str) -> str:
            out: list[str] = []
            i = 0
            L = len(line)
            while i < L:
                if line[i] != EM:
                    out.append(line[i])
                    i += 1
                    continue
                # Look at neighbours
                left = "".join(out)
                right = line[i + 1:]
                # Capture left token (last token, skipping trailing space)
                left_stripped = left.rstrip()
                left_tok = re.search(r"(\*\*[A-Z0-9 /\-_]+\*\*|`[A-Z0-9 /\-_]+`|[A-Z0-9][A-Z0-9 /\-]{1,})$", left_stripped)
                # Capture right token (first token, skipping leading space)
                right_stripped = right.lstrip()
                right_tok = re.match(r"(\*\*[A-Z0-9 /\-_]+\*\*|`[A-Z0-9 /\-_]+`|[A-Z0-9][A-Z0-9 /\-]{1,})", right_stripped)
                if left_tok and right_tok:
                    # protected UI-label boundary; keep em-dash
                    out.append(EM)
                    i += 1
                    continue
                # Convert to '; '
                # Strip trailing space if any
                while out and out[-1] == " ":
                    out.pop()
                out.append(";")
                out.append(" ")
                i += 1
                # Skip leading spaces
                while i < L and line[i] == " ":
                    i += 1
            return "".join(out)

        new = replace_inline(new)
        out_lines.append(new)
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def cap_after_period(text: str) -> str:
    """Capitalize lowercase letter after sentence-ending period (avoiding abbreviations)."""
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
        new = re.sub(
            r"([A-Za-z]{3,}\.) ([a-z])",
            lambda m: m.group(1) + " " + m.group(2).upper(),
            line,
        )
        out_lines.append(new)
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def apply_simple_fixes(text: str) -> str:
    for pat, repl in FIXES:
        if callable(repl):
            text = re.sub(pat, repl, text)
        else:
            text = re.sub(pat, repl, text)
    return text


def fix_readme(text: str, fp: Path) -> str:
    if fp.name == "README.md":
        for pat, repl in README_FIXES:
            text = re.sub(pat, repl, text)
    return text


def process_file(fp: Path) -> bool:
    orig = fp.read_text(encoding="utf-8")
    text = orig
    text = apply_simple_fixes(text)
    text = normalize_field_def_lines(text)
    text = broaden_space_colon(text)
    text = cap_after_period(text)
    text = fix_readme(text, fp)
    # Final whitespace cleanup (only in prose lines, avoid stripping in code blocks)
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
        # Collapse runs of spaces in prose
        line = re.sub(r"  +", " ", line)
        # Remove space before common punctuation
        line = re.sub(r" ([,.;])(?=\s|$)", r"\1", line)
        out_lines.append(line)
    text = "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")
    text = text.rstrip() + "\n"
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
    print(f"pass4_polish changed={changed}")


if __name__ == "__main__":
    main()
