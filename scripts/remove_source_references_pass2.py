#!/usr/bin/env python3
"""Second-pass cleanup: fix broken replacements and remaining code references."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FIXES: list[tuple[str, str]] = [
    (r"`dashboard servicesparsers/[^`]+`", "the log parser layer"),
    (r"dashboard servicesparsers/[^\s)]+", "the log parser layer"),
    (r"\[Server/rbac\.js\]", "[Server RBAC]"),
    (r"\bin codebase\b", "in the dashboard"),
    (r"\bcurrent codebase\b", "the current platform"),
    (r"\bshared dashboard state\b", "the SIEM context pipeline"),
    (r"`useMemo\([^)]*\)`", "derived dashboard state"),
    (r"`useState`", "local screen state"),
    (r"component-local `useState`", "local screen state"),
    (r"React `useMemo` output", "filtered and sorted list"),
    (r"React state", "dashboard state"),
    (r"The component stores", "The Incidents screen stores"),
    (r"does not wire them in the JSX", "does not expose them in the UI"),
    (r"in the JSX", "in the UI"),
    (r"`check\(\)`", "detection logic"),
    (r"translated check\(\)", "translated detection logic"),
    (r"`blockIp\(\)`", "the block-IP action"),
    (r"`unblockIp\(\)`", "the unblock-IP action"),
    (r"`soarCheckIp\(\)`", "automatic IP enrichment"),
    (r"`pushSoar`", "SOAR log append"),
    (r"`exportReport\(\)`", "plain-text export"),
    (r"`correlateAlerts\(alerts\)`", "incident correlation"),
    (r"`processLogs`", "log processing"),
    (r"`api\.saveAlerts`", "POST `/api/alerts/batch`"),
    (r"`api\.addWatchlist`", "watchlist API"),
    (r"`api\.addSoarEntry`", "SOAR log API"),
    (r"`api\.checkThreatIp`", "GET `/api/threat/ip/:ip`"),
    (r"Line ~233 references `isSimulated`", "Simulated-alert handling may reference an undefined flag"),
    (r"logIngestion / settings not routed", "Log Ingestion and Settings routing gap"),
    (r"AppShell doesn't render", "The dashboard shell does not render"),
    (r"## Development environment", "## Operator environment"),
    (r"\*\*VS Code\*\* \| Primary IDE", "**Browser** | Primary interface to the SOC console"),
    (r"Hot reload", "Session refresh"),
    (r"Git pull requesting rule changes", "Change requests for rule updates"),
    (r"mirroring enterprise change control via PR", "mirroring enterprise change control"),
    (r"Peer review translated detection logic like application code", "Peer review translated detection logic like any production rule change"),
    (r"malicious npm dependency", "malicious third-party dependency"),
    (r"Not in current platform; feature request for integrators", "Not available in the current platform; feature request for integrators"),
    (r"requires editing both .+ and .+ plus migration", "requires role configuration on both dashboard and server"),
    (r"Adding a sixth role requires editing both", "Adding a sixth role requires updating both"),
]

PARSER_FILES = [
    "02-apache-parser.md",
    "03-syslog-parser.md",
    "04-cef-parser.md",
    "05-json-parser.md",
    "06-windows-parser.md",
    "07-csv-parser.md",
]

PARSER_REWRITE = """# {title}

Sample input normalised to ECS-style events by the log parser layer.

**Example:** `{sample}`

See [Parsers overview](01-parsers-overview.md) and [System overview](../02-architecture/00-system-overview.md).
"""

PARSER_SAMPLES = {
    "02-apache-parser.md": (
        "Apache parser",
        '203.0.113.1 - - [01/Jan/2025:00:00:00 +0000] "GET /admin HTTP/1.1" 403 512',
    ),
    "03-syslog-parser.md": (
        "Syslog parser",
        "<34>1 2025-01-01T00:00:00Z host app - - [meta] message",
    ),
    "04-cef-parser.md": (
        "CEF parser",
        "CEF:0|Vendor|Product|1.0|100|Attack|5|src=1.2.3.4",
    ),
    "05-json-parser.md": (
        "JSON parser",
        '{"timestamp":"…","sourceIp":"…","message":"…"}',
    ),
    "06-windows-parser.md": (
        "Windows parser",
        "Event ID 4625: An account failed to log on.",
    ),
    "07-csv-parser.md": (
        "CSV parser",
        "timestamp,sourceIp,message,severity header row plus data rows",
    ),
}


def process_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    text = original

    if path.name in PARSER_SAMPLES:
        title, sample = PARSER_SAMPLES[path.name]
        text = PARSER_REWRITE.format(title=title, sample=sample)

    for pattern, repl in FIXES:
        text = re.sub(pattern, repl, text)

    if path.name == "06-known-bugs.md":
        text = """# Known bugs and gaps

Open issues (unfixed or partial):

## 1. Log Ingestion and Settings routing gap

Log Ingestion and Settings screens exist in navigation but may be unreachable from certain shell routes.

## 2. Simulated-alert handling

Simulated-alert flag handling may throw when alerts fire under some conditions.

## 3. Command palette ID mismatch

The command palette uses different module IDs than the sidebar for some entries; some jumps may not work.

## 4. Rule toggles not persisted

Disabling rules in Rules Engine is session-only. Refresh resets enabled state.

## 5. IOC watchlist client-only

Watchlist entries are not saved server-side. Lost on refresh.

## 6. Detection runs client-side

A modified browser could skip rules. The server validates logs but does not re-run detection.

## 7. Memory-backed sessions

Server restart logs everyone out.
"""

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = 0
    for fp in sorted(ROOT.rglob("*.md")):
        if ".git" in fp.parts:
            continue
        if process_file(fp):
            changed += 1
    print(f"second_pass_files_edited={changed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
