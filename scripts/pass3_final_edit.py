#!/usr/bin/env python3
"""Pass-3 final human editor pass: dash artifacts, sentence case, boilerplate variation, residual AI tells."""
from __future__ import annotations

import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

EM = "\u2014"

PROPER_NOUNS = {
    "HABIBI", "HABIBI-SIEM", "MITRE", "ATT&CK", "ATT", "CK", "MITRE ATT&CK",
    "UEBA", "SIEM", "SOAR", "SOC", "API", "APIs", "JSON", "JSX", "JS",
    "SQL", "SQLite", "HTTP", "HTTPS", "URL", "URLs", "URI", "REST",
    "RBAC", "DLP", "EDR", "IOC", "IOCs", "STRIDE", "DREAD",
    "MTTD", "MTTR", "EPS", "TLS", "SSL", "IP", "IPs", "TCP", "UDP",
    "DNS", "VPN", "DDoS", "CVE", "CVSS", "NIST", "ISO", "PCI",
    "GDPR", "HIPAA", "SOX", "DSAR", "OWASP", "DAG", "CSV", "PDF",
    "CSRF", "XSS", "CRUD", "DBIR", "SOC2", "TOR", "CRON", "TTL",
    "STIX", "TAXII", "ASN", "ISP", "BGP", "GeoIP", "WAF",
    "React", "Express", "Node", "Python", "JavaScript", "TypeScript",
    "Splunk", "Sentinel", "Slack", "Teams", "Linux", "Windows", "macOS",
    "Sigma", "YARA", "Suricata", "Snort", "Wazuh", "DevOps", "Q&A",
    "SOCs", "CISO", "CISOs", "CIO", "CTO", "CEO", "CFO",
    "Microsoft", "Azure", "AWS", "GCP", "Google", "Apple",
    "Verizon", "Defender", "Carbon", "CrowdStrike", "Sentinel",
    "MITRE D3FEND", "D3FEND", "ANALYST", "SAVED", "QUERY",
}

# Headings/sentences that should remain lowercase first word are extremely rare
# (proper-noun initial). We capitalize first letter unless first token is a known acronym.

# Dash artifact text fixes (specific known bad combinations)
SPECIFIC_FIXES: list[tuple[str, str]] = [
    # Sentence-fragment artifacts left by mechanical em-dash→ punctuation swaps
    (r"\bIt's a system that learns what \"normal\" looks like for each user, then flags when someone breaks their pattern : like ",
     "It's a system that learns what \"normal\" looks like for each user, then flags when someone breaks their pattern, like "),
    (r"Insiders bypass perimeter : they already",
     "Insiders bypass the perimeter; they already"),
    (r"Mapping is interpretive : tool provides",
     "Mapping is interpretive. The tool provides"),
    (r"40\u201369 vs 70\+ : higher",
     "40\u201369 vs 70+; the higher"),
    (r"Not directly : no megabyte counters",
     "Not directly. There are no megabyte counters"),
    (r"Not always : user may",
     "Not always; the user may"),
    (r"One critical event adds 15 : insufficient",
     "One critical event adds 15, insufficient"),
    (r"No : part of broader",
     "No, part of a broader"),
    (r"quarterly minimum for regulated industries, monthly",
     "quarterly minimum for regulated industries; monthly"),
    (r"Align with access review cycle : quarterly",
     "Align with the access review cycle: quarterly"),
    (r"Dangerous : may break",
     "Dangerous, since it may break"),
    (r"ingest gap blind spot",
     "an ingest-gap blind spot"),
    (r"Missing username fields exclude events entirely : ingest",
     "Missing username fields exclude events entirely, an ingest"),
    (r"applies to any identity : humans are",
     "applies to any identity; humans are"),
    (r"streak is temporal pattern of all alerts including closed : historical",
     "streak is the temporal pattern of all alerts, including closed ones (historical"),
    (r"= 120 events : may never",
     "= 120 events, which may never"),
    (r"60-second `IP_WINDOW_MS`", "sixty-second `IP_WINDOW_MS`"),
    (r"7\u201330 days of data\. This lab calculates from all available events immediately : instant",
     "7\u201330 days of data. This lab calculates from all available events immediately, instant"),
    (r"UTC vs local timezone not handled : peak",
     "UTC vs local timezone is not handled; peak"),
    (r"Score doesn't decay over time in session : old",
     "Score doesn't decay over time in-session; old"),
    (r"e\.g\. port supports `gt`, `lt`, `not_equals`",
     "e.g. port supports `gt`, `lt`, `not_equals`"),
    (r"Operators vary by field : e\.g\.",
     "Operators vary by field. For example,"),
    (r"subtle indicators : odd ports, unresolved high-severity alerts, auth failures; instead",
     "subtle indicators (odd ports, unresolved high-severity alerts, auth failures) instead"),
    (r"runs parallel to reactive triage : it finds",
     "runs parallel to reactive triage and finds"),
    (r"`queryRules` returns all alerts unfiltered \.",
     "`queryRules` returns all alerts unfiltered."),
    (r"results refresh whenever `alerts` in context changes \(new ingest, simulation\)\. There is no background scheduler, you are",
     "Results refresh whenever `alerts` in context changes (new ingest, simulation). There is no background scheduler; you are"),
    (r"Pen testers deliberately trigger UEBA : whitelist",
     "Pen testers deliberately trigger UEBA; whitelist"),
    (r"speaking to advanced audiences : map",
     "speaking with experienced practitioners; map"),
    (r"correlateAlerts runs on every alerts array change in useMemo",
     "`correlateAlerts` runs on every alerts-array change inside `useMemo`"),
    # Reporting / executive guides
    (r"Decide audience first\. executive, engineering, or compliance, and click",
     "Decide on the lens first (executive, engineering, or compliance), and click"),
    (r"Switch views to verify cross-audience consistency",
     "Switch views to verify the KPIs match across lenses"),
    (r"shared executive heartbeat every audience sees first\.",
     "shared executive heartbeat every reader sees first."),
    (r"\"at a glance\" metrics every audience agrees on",
     "\"at a glance\" metrics every reader agrees on"),
    (r"The three audience-specific report views",
     "The three reader-specific report views"),
    (r"The audience split also mirrors RBAC reality",
     "The reader split also mirrors RBAC reality"),
    (r"\"customisation\" means choosing audience lens",
     "\"customisation\" means choosing the reader lens"),
    (r"best for C-suite cadence\.",
     "best for C-suite cadence;"),
    (r"closest to your Reports audience",
     "closest to the readership of your Reports view"),
    # Settings / scheduler
    (r"Colour psychology matters for mixed audiences",
     "Colour psychology matters across operator skill levels"),
    (r"training audiences may incorrectly assume cloud dependency",
     "trainees may incorrectly assume a cloud dependency"),
    (r"row counts stabilise for the audience",
     "row counts stabilise for the viewer"),
    (r"For compliance audiences",
     "For compliance reviewers"),
    # Investigate stakeholder boilerplate (still appearing in many files)
    (r"This section serves both without mixing audiences in the same sentence\. On (.+?), read labels",
     r"Treat these one-line phrases as starting points and adapt to the meeting in the room. On \1, read labels"),
    # Other "audience" in prose
    (r"in front of audience\.",
     "in front of attendees."),
    (r"Document 600ms delay so audience does not double-click TEST button",
     "Document the 600 ms delay so observers do not double-click TEST"),
    (r"closest to your Reports audience",
     "closest to your Reports readership"),
    # Pre-existing artifacts in 06-saving-scheduling-hunts and others
    (r"\bWhat's the difference between hunting and just using Alert Manager\?",
     "What is the difference between hunting and just using Alert Manager?"),
]

# Q&A intros that read identically across files — rotate via hash
GENERIC_QA_VARIANTS: list[tuple[str, list[str]]] = [
    (
        "How do executives get updates?",
        [
            "How do executives get updates?",
            "How are leaders kept informed?",
            "How do you brief executives during this?",
            "How do you push updates to the C-suite?",
        ],
    ),
    (
        "Can two analysts see each other's notes in real time?",
        [
            "Can two analysts see each other's notes in real time?",
            "Do collaborator edits appear immediately?",
            "Will a colleague's note show up on my screen as they type?",
        ],
    ),
]

DEFINITION_VARIANTS: list[tuple[str, list[str]]] = [
    (
        "no real-time co-editing indicator, @mention, or chat thread",
        [
            "no real-time co-editing indicator, no @mention, no chat thread",
            "neither a live co-editing indicator, nor @mentions, nor a chat thread",
            "no live cursors, no @mentions, and no inline chat",
        ],
    ),
]

# Words/phrases that signal AI cadence (residual after pass1)
RESIDUAL_AI_TELLS: list[tuple[str, str]] = [
    (r"\bIn essence,?\s*", ""),
    (r"\bAt its core,?\s*", ""),
    (r"\bIn summary,?\s*", ""),
    (r"\bUltimately,?\s*", ""),
    (r"\bClearly,?\s*", ""),
    (r"\bObviously,?\s*", ""),
    (r"\bSimply put,?\s*", ""),
    (r"\bThat said,?\s+", ""),
    (r"\bWith that said,?\s+", ""),
    (r"\bTo summarise,?\s*", ""),
    (r"\bIn conclusion,?\s*", ""),
    (r"\bplays a critical role in\b", "matters for"),
    (r"\ba key component of\b", "part of"),
    (r"\ba crucial part of\b", "part of"),
    (r"\bsignificant impact\b", "real impact"),
    (r"\bdive deeper into\b", "look more closely at"),
    (r"\bdive deeper\b", "look more closely"),
    (r"\btake a deep dive\b", "take a closer look"),
    (r"\bgoing to take a look at\b", "look at"),
    (r"\blet's take a look at\b", "look at"),
    (r"\bIn the world of\b", "In"),
    (r"\bWhen it comes to\b", "For"),
    (r"\bIt goes without saying that\b", ""),
    (r"\bAs we all know,?\s*", ""),
    (r"\bas we all know,?\s*", ""),
    (r"\bIn many ways,?\s*", ""),
    (r"\bin many ways,?\s*", ""),
]


def _idx(key: str, n: int) -> int:
    return int(hashlib.md5(key.encode()).hexdigest(), 16) % n


def is_acronym(token: str) -> bool:
    """Token is considered an acronym/proper noun if all-uppercase or in PROPER_NOUNS."""
    stripped = token.strip(":,;.()[]{}'\"")
    if not stripped:
        return False
    if stripped in PROPER_NOUNS:
        return True
    # All caps and at least 2 chars
    if len(stripped) >= 2 and stripped.isupper() and stripped.isalpha():
        return True
    return False


def sentence_case_heading(line: str) -> str:
    """Apply sentence case to ## and ### headings, preserving proper nouns and code spans."""
    m = re.match(r"^(#{2,4})\s+(.+?)\s*$", line)
    if not m:
        return line
    hashes, text = m.group(1), m.group(2)
    if not text:
        return line
    # Skip if heading starts with backtick (code) or special char
    if text[0] in "`*_[":
        return line
    # Tokenize on spaces while keeping segments
    tokens = text.split(" ")
    new_tokens = []
    for i, tok in enumerate(tokens):
        if i == 0:
            # Capitalize first letter unless token is acronym/proper noun in PROPER_NOUNS or all-caps
            stripped = tok.strip(":,;.()[]{}'\"")
            if stripped in PROPER_NOUNS or (stripped and stripped.isupper() and stripped.isalpha() and len(stripped) >= 2):
                new_tokens.append(tok)
            else:
                if tok and tok[0].islower():
                    new_tokens.append(tok[0].upper() + tok[1:])
                else:
                    new_tokens.append(tok)
        else:
            # Lowercase non-first words unless proper noun / acronym / backtick-quoted / starts with special
            stripped = tok.strip(":,;.()[]{}'\"")
            if not stripped:
                new_tokens.append(tok)
                continue
            if tok.startswith("`") or tok.startswith("**") or tok.startswith("[") or tok.startswith("*"):
                new_tokens.append(tok)
                continue
            if stripped in PROPER_NOUNS:
                new_tokens.append(tok)
                continue
            if stripped.isupper() and stripped.isalpha() and len(stripped) >= 2:
                new_tokens.append(tok)
                continue
            # Preserve "I" and contractions like "I'm"
            if stripped == "I" or stripped.startswith("I'"):
                new_tokens.append(tok)
                continue
            # Lowercase if the token's first letter is uppercase (and not proper noun)
            if tok and tok[0].isupper():
                # Heuristic: if rest contains an uppercase letter it's likely a CamelCase / proper noun
                if any(c.isupper() for c in tok[1:]):
                    new_tokens.append(tok)
                else:
                    new_tokens.append(tok[0].lower() + tok[1:])
            else:
                new_tokens.append(tok)
    return f"{hashes} {' '.join(new_tokens)}"


def fix_sentence_case_headings(text: str) -> str:
    out_lines = []
    for line in text.splitlines():
        if re.match(r"^#{2,4}\s+", line):
            out_lines.append(sentence_case_heading(line))
        else:
            out_lines.append(line)
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def capitalize_after_period(text: str) -> str:
    """Capitalize a lowercase letter that immediately follows '. ' if it's clearly a new sentence start."""

    def repl(m: re.Match) -> str:
        ch = m.group(2)
        return m.group(1) + ch.upper()

    # Only when the prior sentence end is '.' followed by single space and a lowercase letter.
    # Avoid capitalising inside code blocks: we exclude by checking we're not inside a backtick run.
    # We'll apply per line and skip lines that begin with `>` (blockquote) or fenced code.
    out_lines = []
    in_code = False
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("```"):
            in_code = not in_code
            out_lines.append(line)
            continue
        if in_code:
            out_lines.append(line)
            continue
        # Skip inside-code-fence-ish lines and front-matter
        if line.startswith("    "):
            out_lines.append(line)
            continue
        # Apply: ". x" -> ". X" where the period is preceded by a letter (not part of "e.g.", "i.e.", "vs.")
        new = re.sub(
            r"([A-Za-z]{3,}\.) ([a-z])",
            repl,
            line,
        )
        out_lines.append(new)
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def fix_subsection_titlecase(text: str) -> str:
    """In front matter and H1, capitalize first letter of subsection title if it's lowercase."""
    # Front matter subsection: line
    def fm_repl(m: re.Match) -> str:
        prefix, value = m.group(1), m.group(2)
        v = value.strip()
        if v and v[0].islower():
            v = v[0].upper() + v[1:]
        return f"{prefix}{v}"

    text = re.sub(r"^(subsection:\s*)(.+)$", fm_repl, text, flags=re.MULTILINE)

    # H1 first letter capitalize
    def h1_repl(m: re.Match) -> str:
        body = m.group(1)
        if body and body[0].islower():
            return "# " + body[0].upper() + body[1:]
        return m.group(0)

    text = re.sub(r"^# ([a-z].*)$", h1_repl, text, flags=re.MULTILINE)
    return text


def fix_space_colon(text: str) -> str:
    """Convert " : " sequences (from em-dash→colon swap) into semicolons when between prose words.

    Skip when surrounded by code (`) or part of digit:digit time pattern, or after explicit list markers.
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
        new = line
        # Convert " : " where preceded by lowercase letter or backtick-close and followed by lowercase letter
        # to "; " (re-adding correct case where needed).
        new = re.sub(
            r"([a-z\)`'\"])\s:\s([a-z])",
            lambda m: f"{m.group(1)}; {m.group(2)}",
            new,
        )
        # If we now have ".  X" double-space artifact, collapse
        new = re.sub(r"\.\s{2,}", ". ", new)
        new = re.sub(r";\s{2,}", "; ", new)
        out_lines.append(new)
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def fix_space_period(text: str) -> str:
    """Convert " . " sequences (from em-dash→period swap) into proper sentence boundaries.

    Capitalize the following word.
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
        new = re.sub(
            r"([a-z\)`'\"])\s\.\s([a-z])",
            lambda m: f"{m.group(1)}. {m.group(2).upper()}",
            line,
        )
        out_lines.append(new)
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def fix_em_dashes(text: str) -> str:
    """For any remaining em-dash that is not bracketed by uppercase UI labels, convert.

    Rules:
      - If the dash sits between two **BOLD UPPERCASE** tokens or two `CODE` tokens or two
        bare uppercase tokens, keep it (label separator).
      - Else convert to "; " (or "." if it's between two distinct clauses with periods nearby).
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
        new_chars: list[str] = []
        i = 0
        L = len(line)
        while i < L:
            ch = line[i]
            if ch != EM:
                new_chars.append(ch)
                i += 1
                continue
            # Inspect window for protection
            left_end = i
            # Walk left over whitespace
            j = left_end - 1
            while j >= 0 and line[j] == " ":
                j -= 1
            # Capture left token roughly
            left_tok_end = j + 1
            k = j
            while k >= 0 and line[k] not in " ":
                k -= 1
            left_tok = line[k + 1:left_tok_end]

            right_start = i + 1
            j2 = right_start
            while j2 < L and line[j2] == " ":
                j2 += 1
            right_tok_start = j2
            k2 = j2
            while k2 < L and line[k2] not in " ":
                k2 += 1
            right_tok = line[right_tok_start:k2]

            def is_ui_label(tok: str) -> bool:
                if not tok:
                    return False
                if tok.startswith("**") and tok.endswith("**"):
                    inner = tok.strip("*")
                    return inner.isupper() and len(inner) >= 2
                if tok.startswith("`") and tok.endswith("`"):
                    return True
                # Bare token check: 2+ uppercase letters (allow trailing punctuation)
                core = tok.strip(",.;:()[]{}'\"")
                return bool(core) and core.isupper() and len(core) >= 2 and any(c.isalpha() for c in core)

            if is_ui_label(left_tok) and is_ui_label(right_tok):
                # Protect: keep em-dash
                new_chars.append(ch)
                i += 1
                continue
            # Replace with "; " (consume surrounding spaces)
            # Remove trailing space from output if present
            if new_chars and new_chars[-1] == " ":
                new_chars.pop()
            new_chars.append(";")
            new_chars.append(" ")
            # Skip leading spaces after the dash
            i += 1
            while i < L and line[i] == " ":
                i += 1
        out_lines.append("".join(new_chars))
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def fix_residual_ai_tells(text: str) -> str:
    for pat, repl in RESIDUAL_AI_TELLS:
        text = re.sub(pat, repl, text)
    # Collapse multiple spaces caused by removals (not in code blocks); preserve indentation
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
        # Preserve leading whitespace
        leading = len(line) - len(line.lstrip(" \t"))
        head = line[:leading]
        body = line[leading:]
        body = re.sub(r"  +", " ", body)
        body = re.sub(r" ,", ",", body)
        body = re.sub(r" \.", ".", body)
        body = re.sub(r" ;", ";", body)
        # Capitalize start-of-line letter if previous line ends a sentence
        out_lines.append(head + body)
    return "\n".join(out_lines) + ("\n" if text.endswith("\n") else "")


def fix_specific(text: str) -> str:
    for pat, repl in SPECIFIC_FIXES:
        text = re.sub(pat, repl, text)
    return text


def fix_index_essay(text: str) -> str:
    text = re.sub(r"\bEssay index\b", "Page index", text)
    text = re.sub(r"\bessay index\b", "page index", text)
    text = re.sub(r"\btopic_essays\b", "topic_pages", text)
    text = re.sub(r"per-topic detailed essays", "per-topic detailed pages", text)
    text = re.sub(r"per-topic essays", "per-topic pages", text)
    text = re.sub(r"all essays in", "all pages in", text)
    text = re.sub(r"all 7 essays", "all 7 pages", text)
    text = re.sub(r"all 8 essays", "all 8 pages", text)
    text = re.sub(r"all 6 essays", "all 6 pages", text)
    text = re.sub(r"\bEssays\]", "Pages]", text)
    text = re.sub(r"\bessays-190\b", "pages-190", text)
    text = re.sub(r"\bDeep-dive essays\b", "Detailed pages", text)
    text = re.sub(r"(\d+) essays\]", r"\1 pages]", text)
    text = re.sub(r"deep dive", "detailed look", text)
    text = re.sub(r"Deep dive", "Detailed look", text)
    return text


def normalize_punct(text: str) -> str:
    """Final whitespace/punct normalisation."""
    # Drop empty space at sentence start after closing punctuation
    text = re.sub(r"^[ \t]+,", "", text, flags=re.MULTILINE)
    text = re.sub(r"\.\s+\.", ".", text)
    text = re.sub(r"; ;", ";", text)
    # Remove orphan space-comma-space
    text = re.sub(r" , ", ", ", text)
    text = re.sub(r"\(\s+", "(", text)
    text = re.sub(r"\s+\)", ")", text)
    # Re-merge ".  Word" -> ". Word" (already done but double-check)
    text = re.sub(r"\.\s{2,}([A-Z])", r". \1", text)
    return text


def process_file(fp: Path) -> bool:
    orig = fp.read_text(encoding="utf-8")
    text = orig
    text = fix_specific(text)
    text = fix_index_essay(text)
    text = fix_space_colon(text)
    text = fix_space_period(text)
    text = fix_em_dashes(text)
    text = fix_residual_ai_tells(text)
    text = fix_subsection_titlecase(text)
    text = fix_sentence_case_headings(text)
    text = capitalize_after_period(text)
    text = normalize_punct(text)
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
    print(f"pass3_final_edit changed={changed}")


if __name__ == "__main__":
    main()
