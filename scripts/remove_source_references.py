#!/usr/bin/env python3
"""Remove install-guide references and source-code mentions from documentation."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INSTALL_GUIDE = ROOT / "docs" / "09-operations" / "01-install-guide.md"

COMPONENT_MAP: dict[str, str] = {
    "ExecutiveView.jsx": "Reporting → Executive View",
    "ExecutiveView": "Reporting → Executive View",
    "App.jsx": "the dashboard shell",
    "SiemContext.jsx": "the SIEM context pipeline",
    "SiemContext": "the SIEM context pipeline",
    "AuthContext.jsx": "the authentication layer",
    "AuthContext": "the authentication layer",
    "Settings.jsx": "Settings screen",
    "LogIngestion.jsx": "Log Ingestion screen",
    "Dashboard.jsx": "Monitor → Overview",
    "RulesManager.jsx": "Configure → Rules Engine",
    "CorrelationBuilder.jsx": "Configure → Correlation Builder",
    "Analytics.jsx": "Infrastructure → Analytics",
    "AssetInventory.jsx": "Infrastructure → Asset Inventory",
    "ThreatHunt.jsx": "Investigate → Threat Hunt",
    "Reports.jsx": "Reporting → Reports",
    "AttackTimeline.jsx": "Monitor → Timeline",
    "RiskScoring.jsx": "Intelligence → Risk Scoring",
    "PipelineHealth.jsx": "Monitor → Pipeline Health",
    "AlertManager.jsx": "Monitor → Alert Manager",
    "RawLogs.jsx": "Monitor → Live Feed",
    "LiveFeed.jsx": "Monitor → Live Feed",
    "Scheduler.jsx": "Reporting → Scheduler",
    "SoarConsole.jsx": "Respond → SOAR Console",
    "CaseManager.jsx": "Respond → Case Manager",
    "IncidentResponse.jsx": "Respond → Incidents",
    "ThreatIntel.jsx": "Intelligence → Threat Intel",
    "IocWatchlist.jsx": "Intelligence → IOC Watchlist",
    "VulnIntel.jsx": "Intelligence → Vuln Intel",
    "MitreMatrix.jsx": "Intelligence → MITRE Matrix",
    "Ueba.jsx": "Investigate → UEBA",
    "GeoMap.jsx": "Investigate → Geo Map",
    "NetworkMap.jsx": "Investigate → Network Map",
    "EventGraph.jsx": "Investigate → Event Graph",
    "Heatmap.jsx": "Investigate → Heatmap Calendar",
    "CommandPalette.jsx": "the command palette",
    "Login.jsx": "the login screen",
    "main.jsx": "the dashboard application",
}

JS_MAP: dict[str, str] = {
    "server/index.js": "the API server",
    "server/rbac.js": "the RBAC layer",
    "server/db.js": "the database layer",
    "server/validate.js": "the validation layer",
    "server/threat.js": "the threat intelligence service",
    "server/geo.js": "the geo enrichment service",
    "server/crypto.js": "the encryption layer",
    "api.js": "the API client layer",
    "rules.js": "the built-in detection rules catalog",
    "detectionEngine.js": "the detection engine",
    "correlationEngine.js": "the correlation engine",
    "logParsers.js": "the log parser layer",
    "mockLogGenerator.js": "the mock log generator",
    "threatIntel.js": "the threat intelligence module",
    "geoData.js": "the geo data module",
    "assetData.js": "the asset registry",
    "db.js": "the database layer",
    "index.js": "the API server entry",
    "vite.config.js": "the build configuration",
    "tailwind.config.js": "the styling configuration",
    "package.json": "the application manifest",
}

BOILERPLATE_REPLACEMENTS: list[tuple[str, str]] = [
    (
        r"Operators should rely on visible labels, colour cues, and the numbered walkthrough\. "
        r"Engineers should cross-check `siem-dashboard/src/components/`, confirm field names match hunt and graph queries, "
        r"and treat this lab build as a subset of enterprise SIEM capability; workflows transfer even when scale and automation differ\.",
        "Operators should rely on visible labels, colour cues, and the numbered walkthrough. "
        "Confirm field names in the UI match hunt and graph queries, and treat this lab build as a subset of enterprise SIEM capability.",
    ),
    (
        r"Non-operators should not need source code; operators should not need to guess field names\. "
        r"This page bridges both by keeping UI strings explicit and linking them to React components for developers\.",
        "This page keeps UI strings explicit so operators can follow the walkthrough without guessing field names.",
    ),
    (
        r"Locate the matching component under `siem-dashboard/src/components/` and confirm field names in the UI match the `SiemContext` alert and log schema\. "
        r"Breakpoints and filters described here should align with `useState`, `useMemo`, and render branches, if the code changed, update this document\. "
        r"Trace data from the ingest API through the parser to the context provider so hunt queries, graph drag payloads, and map aggregations stay consistent\. "
        r"Add integration tests when altering normalisation because every Investigate module consumes the same alert objects\.",
        "Confirm field names shown in the UI match alert and log shapes used by hunt, graph, and map modules. "
        "Trace data from ingest through parsing to the dashboard state layer so all Investigate modules stay consistent.",
    ),
    (
        r"#### Where in the codebase should time-based attack patterns documentation be cross-checked\?",
        "#### Where should time-based attack pattern behaviour be cross-checked?",
    ),
]

PHRASE_REPLACEMENTS: list[tuple[str, str]] = [
    (r"\bin the codebase\b", "in the dashboard"),
    (r"\bsource code\b", "platform configuration"),
    (r"\bedit the component\b", "change the screen behaviour"),
    (r"\brequires code change\b", "requires platform configuration"),
    (r"\bNo code change\b", "No configuration change"),
    (r"\bcode change\b", "configuration change"),
    (r"\bthen rebuild\b", "then restart the dashboard"),
    (r"\band rebuild\b", "and restart the dashboard"),
    (r"\brebuild\.\b", "platform update."),
    (r"Run the dashboard locally \(`npm start`\) and sign in\.", "Open the published dashboard and sign in."),
    (r"Live demo requires running `npm start`, signing in", "Live demo requires opening the published dashboard and signing in"),
    (r"Day-to-day dev loop: `npm start` \(Vite \+ Express\), edit, refresh, run pentest scripts against localhost\.", ""),
    (r"Build the SPA with `npm run build`, set production env vars, run Express with `NODE_ENV=production`\.", ""),
    (r"`npm run build` writes to `dist/`; Express serves static assets and SPA fallback in production\.", ""),
    (r"Production build \(`npm run build`\) performs faster than Vite dev mode[^.]*\.", "Use the published production deployment for capacity tests."),
    (r"Production build \(`npm run build`\) performs faster than Vite dev mode — capacity tests should use production artifacts\.", "Use the published production deployment for capacity tests."),
    (r"Developers edit `PLAYBOOK` or SOAR `PLAYBOOKS` arrays in source code; there is no in-UI playbook editor\.", "Playbooks are configured outside the SOAR Console UI; there is no in-UI playbook editor."),
    (r"removed from source code", "removed from the asset registry"),
    (r"Demo passwords in seed data are public in source, never use seeds in production without rotation\.", "Demo passwords in seed data are public; never use default accounts in production without rotation."),
    (r"document for developers reading `Dashboard\.jsx` line 142", "document for operators tracking layout state"),
    (r"in `ExecutiveView\.jsx` line ~33", "in the Executive View demo constants"),
    (r"in `SiemContext\.jsx` line 240", "in the deduplication settings"),
    (r"\(`Settings\.jsx` line 168\)", "(Settings screen label)"),
    (r"at lines 73–78 of `ExecutiveView\.jsx`", "in the Executive View KPI configuration"),
    (r"in `ExecutiveView\.jsx`", "on the Executive View screen"),
    (r"in `App\.jsx`", "in the global header"),
    (r"in `RiskScoring\.jsx`, and `ExecutiveView\.jsx`", "on Risk Scoring and Executive View screens"),
    (r"Global header in `App\.jsx` also shows `riskScore`", "The global header also shows the risk posture score"),
    (r"The component is read-only", "The Executive View screen is read-only"),
    (r"Not implemented in the current component:", "Not implemented on the Executive View screen:"),
    (r"extend the component to compute", "extend the dashboard to compute"),
    (r"React does not compute recommendations", "The dashboard does not compute recommendations"),
    (r"React setState render", "UI refresh"),
    (r"React re-render load", "UI refresh load"),
    (r"React render cost", "UI render cost"),
    (r"in-browser after API validation", "after API validation"),
    (r"synchronously in-browser", "synchronously in the dashboard"),
    (r"Vite dev mode", "development mode"),
    (r"Default seeded users \(`db\.js`\):", "Default seeded users:"),
    (r"siem-dashboard/data/siem\.db", "the SQLite database file"),
    (r"siem-dashboard/", ""),
    (r"See \[install guide\]\([^)]+\) for setup steps\.", "Access the published dashboard via the documentation site landing page."),
    (r"\[install guide\]\([^)]+\)", "the published dashboard"),
    (r"Install and log in as tier1/tier2\.", "Open the published dashboard and log in as tier1/tier2."),
    (r"1\. Install and log in", "1. Open the published dashboard and log in"),
    (r"Node\.js 18 or later\s*\n- Windows, macOS, or Linux\s*\n- Optional: MaxMind GeoLite2-City database for geo enrichment\s*\n\nAccess the published dashboard", "Access the published dashboard"),
    (r"\| \*\*Node\.js 20 \+ npm\*\* \| Runtime for frontend and backend \|", "| **Published dashboard** | Browser access to the SOC console |"),
    (r"# Development toolchain\n\nDev toolchain for building and testing the dashboard\.", "# Operator toolchain\n\nTools for using and validating the published dashboard."),
    (r"Module → React component → source path\. Source: `src/App\.jsx`", "Module → primary screen mapping for the dashboard shell."),
    (r"`main\.jsx` mounts the tree; `App\.jsx` wraps providers and the router\. Source: `src/App\.jsx`", "The dashboard application loads the shell, authentication providers, and navigation router."),
    (r"Source: `src/components/[^`]+`", ""),
    (r"Source: `src/[^`]+`", ""),
    (r"Component: `LogIngestion\.jsx`[^.]*\.", "Use the Log Ingestion screen to paste or upload files for preview and ingest."),
]

SKIP_FILES = {
    INSTALL_GUIDE.relative_to(ROOT).as_posix(),
}


def pascal_to_label(name: str) -> str:
    return re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", name)


def replace_file_refs(text: str) -> str:
    for old, new in sorted(COMPONENT_MAP.items(), key=lambda x: -len(x[0])):
        text = text.replace(f"`{old}`", new)
        text = re.sub(rf"\b{re.escape(old)}\b", new, text)

    for old, new in sorted(JS_MAP.items(), key=lambda x: -len(x[0])):
        text = text.replace(f"`{old}`", new)
        text = text.replace(old, new)

    text = re.sub(
        r"`src/components/([A-Za-z0-9_-]+)\.jsx`",
        lambda m: COMPONENT_MAP.get(f"{m.group(1)}.jsx", f"the {pascal_to_label(m.group(1))} screen"),
        text,
    )
    text = re.sub(
        r"`src/services/([A-Za-z0-9_-]+)\.js`",
        lambda m: JS_MAP.get(f"{m.group(1)}.js", f"the {pascal_to_label(m.group(1))} service"),
        text,
    )
    text = re.sub(
        r"`src/context/([A-Za-z0-9_-]+)\.jsx`",
        lambda m: COMPONENT_MAP.get(f"{m.group(1)}.jsx", f"the {pascal_to_label(m.group(1))} layer"),
        text,
    )
    text = re.sub(r"`server/([A-Za-z0-9_-]+)\.js`", lambda m: JS_MAP.get(f"server/{m.group(1)}.js", "the server layer"), text)
    text = re.sub(
        r"`([A-Za-z0-9_-]+)\.jsx`",
        lambda m: COMPONENT_MAP.get(f"{m.group(1)}.jsx", f"the {pascal_to_label(m.group(1))} screen"),
        text,
    )
    text = re.sub(
        r"`([A-Za-z0-9_-]+)\.js`",
        lambda m: JS_MAP.get(f"{m.group(1)}.js", f"the {pascal_to_label(m.group(1))} module"),
        text,
    )
    text = re.sub(r"siem-dashboard/src/components/", "the dashboard screens", text)
    text = re.sub(r"src/components/", "dashboard screens", text)
    text = re.sub(r"src/context/", "dashboard state layer", text)
    text = re.sub(r"src/services/", "dashboard services", text)
    text = re.sub(r"server/", "the server ", text)
    return text


def clean_front_matter(text: str) -> str:
    if not text.startswith("---"):
        return text
    end = text.find("\n---", 3)
    if end == -1:
        return text
    fm = text[3:end]
    fm = re.sub(r"^component:.*\n", "", fm, flags=re.MULTILINE)
    return f"---{fm}---{text[end + 4:]}"


def remove_install_sections(text: str) -> str:
    text = re.sub(r"^##\s+\d+\.\s+install[^\n]*\n(?:.*?\n)*?(?=^##|\Z)", "", text, flags=re.MULTILINE | re.IGNORECASE)
    text = re.sub(r"^##\s+Prerequisites[^\n]*\n(?:.*?\n)*?(?=^##|\Z)", "", text, flags=re.MULTILINE | re.IGNORECASE)
    text = re.sub(r"^.*\bnpm install\b.*\n", "", text, flags=re.MULTILINE | re.IGNORECASE)
    text = re.sub(r"^.*\bgit clone\b.*\n", "", text, flags=re.MULTILINE | re.IGNORECASE)
    text = re.sub(r"^.*\bcd siem-dashboard\b.*\n", "", text, flags=re.MULTILINE | re.IGNORECASE)
    return text


def clean_technical_notes(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        body = match.group(0)
        if re.search(r"\.jsx|\.js|line \d|rebuild|source code|codebase", body, re.I):
            return ""
        return body

    text = re.sub(r">\s*\*\*Technical note:\*\*[^\n]*(?:\n(?!>|#|\Z)[^\n]*)*", repl, text)
    return text


def fix_titles(text: str, path: Path) -> str:
    text = re.sub(
        r"^# Server/([a-z0-9_-]+)\.js;\s*",
        lambda m: f"# Server {m.group(1).upper()} — ",
        text,
        count=1,
        flags=re.MULTILINE,
    )
    if path.name == "08-07-production-build-path.md":
        text = "# Production deployment\n\nThe published dashboard is served as a single-page application backed by the API server. See [System overview](00-system-overview.md).\n"
    if path.name == "08-component-index.md":
        text = (
            "# UI module index\n\n"
            "Primary screens exposed through the dashboard navigation shell. "
            "See [System overview](../02-architecture/00-system-overview.md).\n\n"
            "| Navigation area | Screen | Guide |\n"
            "|-----------------|--------|-------|\n"
            "| Monitor | Overview | [Guide](../../guides/monitor/overview/01-how-to-use.md) |\n"
            "| Monitor | Alert Manager | [Guide](../../guides/monitor/alert-manager/01-how-to-use.md) |\n"
            "| Monitor | Live Feed | [Guide](../../guides/monitor/live-feed/01-how-to-use.md) |\n"
            "| Configure | Rules Engine | [Guide](../../guides/configure/rules-engine/01-how-to-use.md) |\n"
            "| Configure | Correlation Builder | [Guide](../../guides/configure/correlation-builder/01-how-to-use.md) |\n"
            "| Reporting | Executive View | [Guide](../../guides/reporting/executive-view/01-how-to-use.md) |\n"
        )
    return text


def process_markdown(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix()
    if rel in SKIP_FILES:
        return False

    original = path.read_text(encoding="utf-8")
    text = original

    text = clean_front_matter(text)
    text = remove_install_sections(text)

    for pattern, repl in BOILERPLATE_REPLACEMENTS:
        text = re.sub(pattern, repl, text)
    for pattern, repl in PHRASE_REPLACEMENTS:
        text = re.sub(pattern, repl, text)

    text = replace_file_refs(text)
    text = clean_technical_notes(text)

    text = re.sub(r" \(at lines? ~?\d+(?:–\d+)?[^)]*\)", "", text)
    text = re.sub(r" at lines? ~?\d+(?:–\d+)? of [^.;]+", "", text)
    text = re.sub(r" line ~?\d+", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = fix_titles(text, path)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = 0
    if INSTALL_GUIDE.exists():
        INSTALL_GUIDE.unlink()
        print("deleted_install_guide=1")
    else:
        print("deleted_install_guide=0")

    for fp in sorted(ROOT.rglob("*.md")):
        if ".git" in fp.parts:
            continue
        if process_markdown(fp):
            changed += 1

    print(f"files_edited={changed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
