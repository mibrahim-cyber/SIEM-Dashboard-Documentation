"""Split combined 02-deep-dive.md into individual essay files for modules 23-27."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = json.loads((ROOT / "scripts" / "SUBTOPIC-MANIFEST.json").read_text(encoding="utf-8"))

MODULE_META = {
    "reporting/executive-view": {
        "module": "Executive View",
        "sidebar": "Reporting → Executive View",
        "section": "Reporting",
        "screenshot": "https://raw.githubusercontent.com/Number-1-Python-Glazer/SIEM-Dashboard-Documentation/main/screenshots/guides/reporting-executive-view.png",
        "sections": [
            "Why executives need a different view",
            "Every KPI element in plain English",
            "Security posture score",
            "So what",
            "Comparing periods",
            "Benchmark data",
            "Board meeting",
        ],
    },
    "reporting/reports": {
        "module": "Reports",
        "sidebar": "Reporting → Reports",
        "section": "Reporting",
        "screenshot": "https://raw.githubusercontent.com/Number-1-Python-Glazer/SIEM-Dashboard-Documentation/main/screenshots/guides/reporting-reports.png",
        "sections": [
            "Report types",
            "Compliance mapping",
            "Report customisation",
            "Export formats",
            "Scheduled reports",
            "Report integrity",
        ],
    },
    "reporting/scheduler": {
        "module": "Report Scheduler",
        "sidebar": "Reporting → Scheduler",
        "section": "Reporting",
        "screenshot": "https://raw.githubusercontent.com/Number-1-Python-Glazer/SIEM-Dashboard-Documentation/main/screenshots/guides/reporting-scheduler.png",
        "sections": [
            "Operational case for scheduled",
            "Cron syntax",
            "schedule record field",
            "Delivery mechanics",
            "Failure handling",
            "Retention",
        ],
    },
    "ingest-config/log-ingestion": {
        "module": "Log Ingestion",
        "sidebar": "Ingest & Config → Log Ingestion",
        "section": "Ingest & Config",
        "screenshot": "https://raw.githubusercontent.com/Number-1-Python-Glazer/SIEM-Dashboard-Documentation/main/screenshots/guides/ingest-config-log-ingestion.png",
        "sections": [
            "Ingestion pipeline end to end",
            "Log source types",
            "Validate endpoint",
            "Parsing regex",
            "Enrichment at ingestion",
            "Log volume management",
            "Log integrity",
            "Ingestion errors and retries",
        ],
    },
    "ingest-config/settings": {
        "module": "Settings",
        "sidebar": "Ingest & Config → Settings",
        "section": "Ingest & Config",
        "screenshot": "https://raw.githubusercontent.com/Number-1-Python-Glazer/SIEM-Dashboard-Documentation/main/screenshots/guides/ingest-config-settings.png",
        "sections": [
            "Settings architecture",
            "Authentication settings",
            "RBAC roles",
            "Threat feed API",
            "Sound alerts",
            "Alert deduplication",
            "Audit log of settings",
            "Backup and restore",
        ],
    },
}

FOCUS = {
    "reporting/executive-view": [
        "Why the executive brief uses a different information architecture than analyst dashboards—and what that means for board-ready communication.",
        "How to read every KPI tile, delta arrow, and operational metric on the five-column executive summary row.",
        "How the RISK POSTURE dial is computed from unresolved severities and active incidents—and how it differs from Reports risk tiers.",
        "Applying the 'so what' principle to translate dashboard metrics into Fund, Escalate, Accept, or Monitor decisions.",
        "How the ALERTS (24H) delta compares rolling twenty-four-hour windows—and what other metrics lack period comparison.",
        "Which benchmark bars and operational tiles are live heuristics versus hard-coded demo placeholders.",
        "Running a five-minute board cyber segment anchored on this module without over-reading operational noise.",
    ],
    "reporting/reports": [
        "The three audience-specific report views—executive, technical, and compliance—and who should read each.",
        "How NIST CSF, ISO 27001, and SOC 2 checklist cards map live SIEM metrics to framework language.",
        "What can and cannot be customised on the Reports screen versus elsewhere in the SOC workflow.",
        "Export buttons, file formats, audit logging, and the PDF gap between Reports and Scheduler.",
        "How Reports relates to the Scheduler module for recurring delivery—and what automation exists today.",
        "Server-side export audit trails versus tamper evidence on downloaded files.",
    ],
    "reporting/scheduler": [
        "Why recurring report jobs matter operationally even when this demo simulates delivery.",
        "Plain-English frequency dropdowns versus cron expressions engineers deploy in production.",
        "Every field in a schedule record—visible, hidden, and simulated.",
        "What RUN NOW actually does with recipients, formats, and the generation log.",
        "Failure modes, missing retry UX, and what production schedulers must add.",
        "Why all schedule and run-log state disappears on browser refresh.",
    ],
    "ingest-config/log-ingestion": [
        "The five-stage path from client-side parse preview through validation, enrichment, detection, and alerts.",
        "Supported log formats, sample cards, and auto-detect heuristics in logParsers.js.",
        "The POST /api/ingest/validate endpoint, sanitization rules, and fail-closed behaviour.",
        "Apache, CEF, and syslog regex capture groups—and their Grok equivalents.",
        "ECS field construction and geo enrichment applied after server validation.",
        "Preview row caps, MAX_RAW_LOGS buffer, server batch limits, and rate limiting.",
        "Preserving _raw lines, audit entries, and detection of anti-forensics events.",
        "Parse warnings versus silent validation failures—and the UI count mismatch gotcha.",
    ],
    "ingest-config/settings": [
        "Server-global, RBAC-gated, and ephemeral client configuration tiers in Settings.jsx.",
        "Login sessions, CSRF tokens, SIGN OUT, and what Settings exposes about authentication.",
        "The five shipped roles and how Write, Admin, and Export flags gate UI sections.",
        "AbuseIPDB and VirusTotal key storage, masking, test, and save workflows.",
        "soundEnabled, Web Audio beeps, and critical-only audible paging.",
        "dedupeEnabled, the 60-second label versus 30-second engine window, and rule-scoped matching.",
        "Which Settings actions write audit_log rows—and which preferences do not.",
        "Backing up siem.db, environment secrets, and MaxMind files with no restore UI.",
    ],
}


def word_count(text: str) -> int:
    return len(re.findall(r"\b\w+\b", text))


def split_sections(content: str) -> list[tuple[str, str]]:
    """Return list of (heading, body) from ## sections after first --- block."""
    # Strip YAML front matter and module intro up to first essay ##
    m = re.search(r"^## ", content, re.MULTILINE)
    if not m:
        return []
    rest = content[m.start() :]
    parts = re.split(r"\n(?=## )", rest)
    out = []
    for part in parts:
        part = part.strip()
        if not part.startswith("## "):
            continue
        lines = part.split("\n", 1)
        heading = lines[0][3:].strip()
        body = lines[1] if len(lines) > 1 else ""
        out.append((heading, body.strip()))
    return out


def match_section(heading: str, keywords: list[str]) -> bool:
    h = heading.lower()
    return any(k.lower() in h for k in keywords)


def main():
    keys = [
        "reporting/executive-view",
        "reporting/reports",
        "reporting/scheduler",
        "ingest-config/log-ingestion",
        "ingest-config/settings",
    ]
    results = []

    for key in keys:
        group, slug = key.split("/")
        meta = MODULE_META[key]
        essays = MANIFEST[key]
        deep_path = ROOT / "guides" / group / slug / "02-deep-dive.md"
        raw = deep_path.read_text(encoding="utf-8")
        sections = split_sections(raw)
        keywords_list = meta["sections"]
        focus_list = FOCUS[key]

        if len(sections) != len(essays):
            print(f"WARN {key}: {len(sections)} sections vs {len(essays)} manifest entries")
            for i, (h, _) in enumerate(sections):
                print(f"  [{i}] {h}")

        used = set()
        for idx, essay in enumerate(essays):
            kw = keywords_list[idx] if idx < len(keywords_list) else essay["title"]
            focus = focus_list[idx] if idx < len(focus_list) else essay["title"]
            matched = None
            for si, (heading, body) in enumerate(sections):
                if si in used:
                    continue
                if match_section(heading, [kw, essay["title"]]):
                    matched = (heading, body)
                    used.add(si)
                    break
            if matched is None and idx < len(sections):
                si = idx
                while si in used and si < len(sections):
                    si += 1
                if si < len(sections):
                    heading, body = sections[si]
                    used.add(si)
                    matched = (heading, body)

            if matched is None:
                print(f"ERROR no match for {key} / {essay['file']}")
                continue

            heading, body = matched
            title = essay["title"]
            out_dir = ROOT / "guides" / group / slug
            out_path = out_dir / essay["file"]
            is_first = essay["file"].startswith("02-")

            yaml = f"""---
module: {meta["module"]}
sidebar: {meta["sidebar"]}
section: {meta["section"]}
subsection: {title}
audience: All — technical and non-technical
last_updated: 2026-05-23
---

# {title}

**Part of:** {meta["sidebar"]}
**One-sentence focus:** {focus}
---
"""
            screenshot = ""
            if is_first:
                screenshot = f'\n![{meta["module"]} main view]({meta["screenshot"]})\n'

            # Body uses ### sections from split content; ensure starts with ###
            essay_body = body.strip()
            if not essay_body.startswith("###"):
                essay_body = f"### What you are looking at\n\n{essay_body}"

            full = yaml + screenshot + "\n" + essay_body + "\n"
            out_path.write_text(full, encoding="utf-8")
            wc = word_count(full)
            results.append((str(out_path.relative_to(ROOT)).replace("\\", "/"), wc))
            print(f"OK {out_path.name} ({wc} words)")

    print("\n--- SUMMARY ---")
    for path, wc in results:
        print(f"{path}\t{wc}")
    print(f"TOTAL FILES: {len(results)}")
    print(f"TOTAL WORDS: {sum(w for _, w in results)}")
    below = [p for p, w in results if w < 800]
    if below:
        print(f"BELOW 800: {below}")


if __name__ == "__main__":
    main()
