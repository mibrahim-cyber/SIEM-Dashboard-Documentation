#!/usr/bin/env python3
"""Pass-2 human editor: punctuation artifacts, boilerplate variation, tone polish."""
from __future__ import annotations

import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# --- mechanical fixes from pass-1 em-dash → punctuation swaps ---

FIXES: list[tuple[str, str]] = [
    (r"branches \. if", "branches; if"),
    (r"render branches \. if", "render branches; if"),
    (r"Click a node \. right", "Click a node; the right panel"),
    (r"Hover map nodes : IP", "Hover map nodes: an IP label"),
    (r"Yes \. VPN", "Yes. VPN"),
    (r"Yes \. Tor", "Yes. Tor"),
    (r"requestAnimationFrame` \. may", "requestAnimationFrame`; may"),
    (r"HTTP 200 \. ", "HTTP 200; "),
    (r"403 \. ", "403; "),
    (r"403;  RBAC", "403; RBAC"),
    (r"403,  insufficient", "403, insufficient"),
    (r"403,  blocked", "403, blocked"),
    (r"Step 2 :  ", "Step 2 — "),
    (r"Step 3;  ", "Step 3 — "),
    (r"correlateAlerts\(alerts\)\. the same", "correlateAlerts(alerts); the same"),
    (r"component\. it is not", "component; it is not"),
    (r"component\. it is", "component. It is"),
    (r"first\. note the", "first. Note the"),
    (r"brief\. note the", "brief. Note the"),
    (r"not stored separately, they are", "not stored separately; they are"),
    (r"filtered out, they would", "filtered out; they would"),
    (r"clue, not proof", "clue, not proof"),  # keep
    (r"debates, and fraud", "debates, and fraud"),  # keep
    (r"host \. a process", "host; a process"),
    (r"today they verify", "Today they verify"),
    (r"tool jargon : cite", "tool jargon. Cite"),
    (r"audit evidence \. verbal", "audit evidence; verbal"),
    (r"navigating away \. screenshot", "navigating away. Screenshot"),
    (r"techniques : translate", "techniques. Translate"),
    (r"phone book mapping numbers to addresses : approximate", "phone book mapping numbers to addresses: approximate"),
    (r"country count spike : possible", "country count spike: possible"),
    (r"can't one risk score be enough\?", "can't one risk score be enough?"),
    (r"Why does the Overview show so many numbers : can't", "Why does the Overview show so many numbers? Can't"),
    (r"THREAT CLASSIFICATION : LAST 7 DAYS", "THREAT CLASSIFICATION — LAST 7 DAYS"),
    (r"THREAT CLASSIFICATION\. LAST 7 DAYS", "THREAT CLASSIFICATION — LAST 7 DAYS"),
    (r"\[INDEX : ", "[INDEX — "),
    (r"\[INDEX \. ", "[INDEX — "),
    (r"Essays\]", "Pages]"),
    (r"topic_essays", "topic_pages"),
    (r"per-topic detailed essays", "per-topic detailed pages"),
    (r"Essay index", "Page index"),
    (r"all essays in", "all pages in"),
    (r"lists all 7 essays", "lists all 7 pages"),
    (r"6 essays\]", "6 pages]"),
    (r"7 essays\]", "7 pages]"),
    (r"8 essays\]", "8 pages]"),
    (r"essay index", "page index"),
    (r"Deep-dive essays", "Detailed pages"),
    (r"deep dive", "detailed look"),
    (r"Deep dive", "Detailed look"),
]

# Lowercase after sentence-ending period (common pass-1 artifact)
LC_AFTER_PERIOD = re.compile(
    r"(?<=[.!?]\s)([a-z])(\w*)",
)

BOARD_HEADING_VARIANTS = [
    "How would you summarise {topic} for leadership in under two minutes?",
    "What is the elevator pitch for {topic} when briefing the board?",
    "How do you walk a non-technical board through {topic} quickly?",
    "What should executives hear first about {topic}?",
    "How can you frame {topic} for a steering committee in two minutes?",
    "What talking points cover {topic} for senior leadership?",
]

BOARD_ANSWER_VARIANTS = [
    (
        "Open {module} on the live dashboard during the meeting. Point to the primary visual "
        "described in the opening section; skip raw log lines. State how many items are flagged, "
        "whether the pattern is new or recurring (compare to yesterday's screenshot if you have one), "
        "and name one concrete next action (block IP, reset credential, open case). Boards decide "
        "on risk and resources, not MITRE techniques, so translate findings into business impact "
        "and recommended spend. Close with what remains unknown and when you will update them."
    ),
    (
        "Share your screen on {module} and anchor the conversation on the headline counters "
        "visible without scrolling. Give counts, severity mix, and whether the activity is isolated "
        "or spreading. Recommend a single decision: budget, block, or escalate. Avoid acronyms "
        "unless the room already uses them. End with a time-bound follow-up."
    ),
    (
        "Lead with the stat strip or dominant visual on {module}. Compare today's numbers to "
        "your last briefing slide if possible. Name the business process at risk, not the "
        "detection rule ID. Offer one mitigation already underway and one that needs approval. "
        "Reserve technical detail for the appendix."
    ),
    (
        "Use {module} as a prop, not a tutorial. Highlight the top three labelled fields that "
        "changed since yesterday. Explain customer or revenue exposure in plain language. "
        "Request only the decision you need today. Document the screen with timestamp for "
        "the minutes."
    ),
    (
        "Brief the board on {topic} by showing {module} live. Focus on trend direction, "
        "worst-case impact, and cost to respond. If data is sparse, say so and explain "
        "what you are doing to populate the view before the next meeting."
    ),
    (
        "When leadership asks about {topic}, open {module} and read the visible KPIs aloud. "
        "Tie each number to an owner and a deadline. Separate confirmed incidents from "
        "suspected noise. Ask for one resource decision rather than open-ended concern."
    ),
]

DEV_HEADING_VARIANTS = [
    "What should developers verify in the React source for {topic}?",
    "Which code paths should engineers check when changing {topic}?",
    "How do maintainers validate {topic} against the live UI?",
    "What React and API checks apply to {topic}?",
    "Where in the codebase should {topic} documentation be cross-checked?",
    "What integration tests guard {topic} behaviour?",
]

DEV_ANSWER_VARIANTS = [
    (
        "Locate the matching component under `siem-dashboard/src/components/` and confirm field "
        "names in the UI match the `SiemContext` alert and log schema. Breakpoints and filters "
        "described here should align with `useState`, `useMemo`, and render branches; if the "
        "code changed, update this document. Trace data from the ingest API through the parser "
        "to the context provider so hunt queries, graph drag payloads, and map aggregations stay "
        "consistent. Add integration tests when altering normalisation because every Investigate "
        "module consumes the same alert objects."
    ),
    (
        "Diff the component named in this guide against `SiemContext` typings. Walkthrough steps "
        "must match rendered labels and filter chips. When props or hooks move, update the "
        "markdown in the same PR. Regression-test ingest → parse → alert → {module} render "
        "with Simulate Campaign before merging."
    ),
    (
        "Engineers should grep for the sidebar label `{module}` in `App.jsx`, open the routed "
        "component, and verify each bold UI string in this page still exists. Parser changes "
        "require a spot-check in Monitor → Live Feed because Investigate views inherit the "
        "same normalised objects."
    ),
    (
        "Treat this page as a contract test: every **LABEL** in prose should appear in JSX or "
        "in derived state. Confirm API routes feeding {module} match appendix endpoint docs. "
        "If geo, graph, or hunt pivots break, inspect shared normalisation first."
    ),
    (
        "Before shipping UI changes to {module}, run the dashboard locally, follow the numbered "
        "walkthrough, and screenshot discrepancies. Update this guide when column names, "
        "filters, or keyboard shortcuts shift. Shared alert shape is the integration surface "
        "for all Investigate modules."
    ),
    (
        "Maintainers: open DevTools, compare network payloads to the field names cited here, "
        "and ensure RBAC gates still match Settings → RBAC. Document any intentional drift "
        "between demo data and production schemas in the technical note block."
    ),
]

STAKEHOLDER_VARIANTS = [
    (
        "When executives ask what the screen means for the organisation, translate visible "
        "counters into outcomes: data exposure, service disruption, notification timelines, "
        "and customer trust. Skip tool jargon; cite specific counts, timestamps, and named "
        "fields on {module}. When engineers ask about data lineage, answer: SQLite-backed "
        "ingest through `SiemContext`, normalised in the parser layer, rendered in React "
        "client state refreshed on ingest and Simulate Campaign. Capture the view with stat "
        "counters visible for audit evidence; verbal summaries alone rarely satisfy "
        "compliance reviews."
    ),
    (
        "Leadership briefings on {module} should tie each KPI to a business owner. "
        "Technical stakeholders need the ingest → context → component path spelled out. "
        "Screenshot the stat strip with timestamps when evidence may be challenged later."
    ),
    (
        "For board conversations, frame {module} numbers as risk to revenue and reputation. "
        "For engineering reviews, reference the component file and `SiemContext` fields "
        "listed in the walkthrough. Keep artefacts: PNG exports beat memory."
    ),
    (
        "Executives want impact and cost; developers want schema and file paths. This section "
        "serves both without mixing audiences in the same sentence. On {module}, read labels "
        "aloud from the UI and record them in case notes when legal may review the incident."
    ),
]

RECAP_VARIANTS = [
    (
        "Operators should rely on visible labels, colour cues, and the numbered walkthrough. "
        "Engineers should cross-check `siem-dashboard/src/components/`, confirm field names "
        "match hunt and graph queries, and treat this lab build as a subset of enterprise "
        "SIEM capability; workflows transfer even when scale and automation differ."
    ),
    (
        "Analyst readers: stay on-screen labels and the step list above. Maintainer readers: "
        "validate JSX against this prose before release. Enterprise deployments add scale; "
        "the interaction patterns here still apply."
    ),
    (
        "Use the walkthrough if you run the SOC; use the source tree if you ship the code. "
        "Both paths describe the same {module} behaviour at different altitudes."
    ),
    (
        "Non-operators should not need source code; operators should not need to guess field "
        "names. This page bridges both by keeping UI strings explicit and linking them to "
        "React components for developers."
    ),
]

BEGINNER_HEADING_VARIANTS = [
    "What is the most common beginner mistake on this screen?",
    "Which mistake do new analysts make most often here?",
    "What should newcomers avoid on this view?",
    "What tripping point catches first-time users?",
]

BEGINNER_ANSWER_VARIANTS = [
    (
        "Treating visual intensity (colour, size, score) as absolute proof rather than relative "
        "prioritisation within the current dataset. Cross-check with a second module—Threat Hunt "
        "counts, Event Graph relationships, or Live Feed raw lines—before containment. A second "
        "frequent error is acting on session-only state (unsaved graphs, unsaved hunts, uncaptured "
        "heatmap focus) and losing context on refresh; screenshot or case-note artefacts before "
        "navigating away."
    ),
    (
        "Over-trusting a single panel on {module}. Severity colour ranks items against each other "
        "in memory, not against ground truth. Confirm with another view, then document in a case. "
        "Also save or screenshot before refresh; many Investigate tools keep state only in the "
        "browser session."
    ),
    (
        "Jumping to containment from {module} without corroboration. Use the walkthrough fields "
        "as leads, not verdicts. Export or note your filter set before leaving the page."
    ),
    (
        "Assuming empty or quiet means safe. Verify ingestion in Pipeline Health and rule hits "
        "on Overview before telling stakeholders the environment is clean."
    ),
]


def _idx(key: str, n: int) -> int:
    return int(hashlib.md5(key.encode()).hexdigest(), 16) % n


def _topic_from_file(fp: Path) -> str:
    name = fp.stem
    if name[0:2].isdigit():
        name = name[3:]
    return name.replace("-", " ")


def _module_from_path(fp: Path) -> str:
    parts = fp.parts
    if "investigate" in parts:
        i = parts.index("investigate")
        return parts[i + 1].replace("-", " ").title()
    return fp.parent.name.replace("-", " ").title()


def fix_dash_artifacts(text: str) -> str:
    for pat, repl in FIXES:
        text = re.sub(pat, repl, text)
    # Generic " . " mid-clause → semicolon when between lowercase fragments
    text = re.sub(
        r"([a-z]) \. ([a-z])",
        lambda m: f"{m.group(1)}; {m.group(2)}",
        text,
    )
    # Question headings: " #### Foo : bar" → " #### Foo? Bar" when #### line
    def fix_q_heading(m: re.Match) -> str:
        line = m.group(0)
        if "?" in line:
            return line
        if " : " in line:
            head, tail = line.split(" : ", 1)
            tail = tail[0].upper() + tail[1:] if tail else tail
            return f"{head}? {tail}"
        return line

    text = re.sub(r"^#### .+$", fix_q_heading, text, flags=re.MULTILINE)
    # Step labels " : " → ": "
    text = re.sub(r"(\d+\. .+?) : ", r"\1: ", text)
    # Fix INDEX table punctuation
    text = re.sub(r"\[INDEX[;,]\s*", "[INDEX — ", text)
    return text


def rewrite_investigate_boilerplate(fp: Path, text: str) -> str:
    if "investigate" not in fp.as_posix():
        return text

    topic = _topic_from_file(fp)
    module = _module_from_path(fp)
    key = fp.as_posix()
    sidebar = f"Investigate → {module}"

    # Board Q&A block
    board_pat = re.compile(
        r"#### How do I explain .+?\n\n"
        r"Open .+?\n\n"
        r"#### What should developers verify in the React source for this topic\?\n\n"
        r"Open the matching component under.+?\n\n"
        r"#### What is the most common beginner mistake on this screen\?\n\n"
        r"Treating visual intensity.+?navigating away\.",
        re.DOTALL,
    )
    if board_pat.search(text):
        bh = BOARD_HEADING_VARIANTS[_idx(key + "bh", len(BOARD_HEADING_VARIANTS))].format(
            topic=topic
        )
        ba = BOARD_ANSWER_VARIANTS[_idx(key + "ba", len(BOARD_ANSWER_VARIANTS))].format(
            topic=topic, module=sidebar
        )
        dh = DEV_HEADING_VARIANTS[_idx(key + "dh", len(DEV_HEADING_VARIANTS))].format(
            topic=topic
        )
        da = DEV_ANSWER_VARIANTS[_idx(key + "da", len(DEV_ANSWER_VARIANTS))].format(
            topic=topic, module=sidebar
        )
        mh = BEGINNER_HEADING_VARIANTS[_idx(key + "mh", len(BEGINNER_HEADING_VARIANTS))]
        ma = BEGINNER_ANSWER_VARIANTS[_idx(key + "ma", len(BEGINNER_ANSWER_VARIANTS))].format(
            module=sidebar
        )
        replacement = f"#### {bh}\n\n{ba}\n\n#### {dh}\n\n{da}\n\n#### {mh}\n\n{ma}"
        text = board_pat.sub(replacement, text)

    # Stakeholder communication paragraph
    stake_pat = re.compile(
        r"### Stakeholder communication using .+\n\n"
        r"When executives ask .+?compliance reviews\.",
        re.DOTALL,
    )
    if stake_pat.search(text):
        sv = STAKEHOLDER_VARIANTS[_idx(key + "st", len(STAKEHOLDER_VARIANTS))].format(
            module=sidebar
        )
        heading = f"### Communicating {topic} to leadership and engineering"
        text = stake_pat.sub(f"{heading}\n\n{sv}", text)

    # Dual-audience recap
    recap_pat = re.compile(
        r"### Dual-audience recap for this sub-topic\n\n"
        r"Non-technical readers should focus .+?automation differ\.",
        re.DOTALL,
    )
    if recap_pat.search(text):
        rv = RECAP_VARIANTS[_idx(key + "rc", len(RECAP_VARIANTS))].format(module=sidebar)
        headings = [
            "### Who should read which sections",
            "### Operator vs maintainer focus",
            "### Two readers, one screen",
            "### Reading paths for analysts and engineers",
        ]
        rh = headings[_idx(key + "rh", len(headings))]
        text = recap_pat.sub(f"{rh}\n\n{rv}", text)

    return text


def fix_analyst_section_headings(text: str, fp: Path) -> str:
    """Vary identical 'How an analyst uses this during an active incident' headings."""
    variants = [
        "### How an analyst uses this during an active incident",
        "### Analyst workflow under pressure",
        "### Using this view during live response",
        "### What analysts do when the pager fires",
        "### Operational use during containment",
    ]
    count = text.count("### How an analyst uses this during an active incident")
    if count == 0:
        return text
    idx = _idx(fp.as_posix(), len(variants))
    # Replace only first occurrence per file with rotated variant
    chosen = variants[idx]
    text = text.replace(
        "### How an analyst uses this during an active incident",
        chosen,
        1,
    )
    return text


def fix_guides_readme(text: str) -> str:
    text = text.replace("Essays](https://img.shields.io/badge/topic_essays-190", "Pages](https://img.shields.io/badge/topic_pages-190")
    return text


def process_file(fp: Path) -> bool:
    orig = fp.read_text(encoding="utf-8")
    text = orig
    text = fix_dash_artifacts(text)
    text = rewrite_investigate_boilerplate(fp, text)
    text = fix_analyst_section_headings(text, fp)
    if fp.name == "README.md" and "guides" in fp.parts:
        text = fix_guides_readme(text)
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
    guides_readme = ROOT / "guides" / "README.md"
    if guides_readme.exists() and guides_readme not in files:
        files.append(guides_readme)
    return files


def main() -> None:
    changed = 0
    for fp in collect_files():
        if process_file(fp):
            changed += 1
    print(f"pass2_human_editor changed={changed}")


if __name__ == "__main__":
    main()
