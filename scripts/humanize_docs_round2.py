#!/usr/bin/env python3
"""Second pass: rewrite remaining generic stub lines in docs/."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REWRITES: dict[str, tuple[str, str]] = {
    # appendix
    "docs/10-appendix/02-function-index.md": (
        "Reference appendix: function index.",
        "Alphabetical index of exported functions in `src/` and `server/` with file paths.",
    ),
    "docs/10-appendix/04-data-models-json.md": (
        "Reference appendix: data models json.",
        "JSON shapes for alerts, cases, watchlist entries, and API payloads.",
    ),
    "docs/10-appendix/05-keyboard-shortcuts.md": (
        "Reference appendix: keyboard shortcuts.",
        "Keyboard shortcuts for the command palette and common triage actions.",
    ),
    "docs/10-appendix/07-future-work.md": (
        "Reference appendix: future work.",
        "Planned improvements: PostgreSQL option, server-side incidents table, external log forwarder.",
    ),
    "docs/10-appendix/08-references.md": (
        "Reference appendix: references.",
        "External links: OWASP, MITRE ATT&CK, MaxMind, AbuseIPDB, and coursework sources.",
    ),
    "docs/10-appendix/09-lab-exercises.md": (
        "Reference appendix: lab exercises.",
        "Hands-on exercises for install, simulate-campaign, RBAC testing, and parser uploads.",
    ),
    # operations
    "docs/09-operations/02-dev-workflow.md": (
        "Operational procedure: dev workflow.",
        "Day-to-day dev loop: `npm start` (Vite + Express), edit, refresh, run pentest scripts against localhost.",
    ),
    "docs/09-operations/03-building-for-prod.md": (
        "Operational procedure: building for prod.",
        "Build the SPA with `npm run build`, set production env vars, run Express with `NODE_ENV=production`.",
    ),
    "docs/09-operations/04-backup-siem-db.md": (
        "Operational procedure: backup siem db.",
        "Copy `data/siem.db` while the server is stopped; WAL files (`-wal`, `-shm`) should be copied together.",
    ),
    "docs/09-operations/05-rotating-secrets.md": (
        "Operational procedure: rotating secrets.",
        "Rotate `SESSION_SECRET` (invalidates sessions) and re-encrypt stored threat API keys via admin UI.",
    ),
    "docs/09-operations/06-geo-db-setup.md": (
        "Operational procedure: geo db setup.",
        "Download GeoLite2-City.mmdb from MaxMind into `data/`; set `GEO_DB_PATH` if non-default.",
    ),
    "docs/09-operations/07-threat-api-keys.md": (
        "Operational procedure: threat api keys.",
        "Store AbuseIPDB keys via admin settings or `ABUSEIPDB_KEY` env var; keys are AES-encrypted in SQLite.",
    ),
    "docs/09-operations/08-troubleshooting.md": (
        "Operational procedure: troubleshooting.",
        "Common fixes: better-sqlite3 build errors, CORS mismatch, missing Geo DB, 403 CSRF failures.",
    ),
    "docs/09-operations/09-performance-notes.md": (
        "Operational procedure: performance notes.",
        "SQLite limits, client-side detection cost, and when mock log volume slows the UI.",
    ),
    "docs/09-operations/10-eps-monitoring.md": (
        "Operational procedure: eps monitoring.",
        "Events-per-second estimates during simulate-campaign and ingest stress tests.",
    ),
    # security stubs
    "docs/08-security/04-session-fixation-fix.md": (
        "Security control documentation: session fixation fix.",
        "`req.session.regenerate()` on successful login so the session ID changes after authentication.",
    ),
    "docs/08-security/05-input-validation.md": (
        "Security control documentation: input validation.",
        "Server-side whitelists in `server/validate.js` for alert, watchlist, and SOAR payloads.",
    ),
    "docs/08-security/06-key-encryption.md": (
        "Security control documentation: key encryption.",
        "Threat API keys encrypted at rest with AES-256-GCM using `SESSION_SECRET`-derived material.",
    ),
    "docs/08-security/07-csp-production.md": (
        "Security control documentation: csp production.",
        "Helmet CSP headers enabled in production; relaxed in dev so Vite HMR works.",
    ),
    "docs/08-security/08-rate-limiting.md": (
        "Security control documentation: rate limiting.",
        "express-rate-limit on auth, API, geo, and ingest routes to slow brute force and abuse.",
    ),
    "docs/08-security/09-watchlist-only-enforcement.md": (
        "Security control documentation: watchlist only enforcement.",
        "Tier1 can read watchlist but not add entries; writes require tier2+ on the server.",
    ),
    "docs/08-security/10-residual-risks.md": (
        "Security control documentation: residual risks.",
        "Known gaps: MemoryStore sessions, client-only incidents, no external SIEM forwarder.",
    ),
    "docs/08-security/11-hardening-checklist.md": (
        "Security control documentation: hardening checklist.",
        "Pre-deploy checklist: secrets, RBAC audit, CSP, rate limits, disable default users.",
    ),
    # component internals
    "docs/07-ui-modules/component-internals/01-props-and-state.md": (
        "Implementation notes for props and state across UI modules.",
        "How major components receive `SiemContext` data and local UI state (filters, selection, modals).",
    ),
    "docs/07-ui-modules/component-internals/02-hooks-used.md": (
        "Implementation notes for hooks used across UI modules.",
        "Shared hooks: `useAuth`, context consumers, and interval refresh patterns.",
    ),
    "docs/07-ui-modules/component-internals/03-api-calls-per-view.md": (
        "Implementation notes for api calls per view across UI modules.",
        "Which views call `/api/state`, `/api/alerts`, threat lookup, and write endpoints.",
    ),
    "docs/07-ui-modules/component-internals/04-keyboard-bindings.md": (
        "Implementation notes for keyboard bindings across UI modules.",
        "Command palette bindings and module-specific hotkeys.",
    ),
    # detection rules
    "docs/05-detection-engine/05-rule-xss.md": (
        "Detection rule: Rule Xss. Implemented in `src/services/rules.js` with configurable thresholds.",
        "Flags `<script>`, `javascript:`, and common DOM XSS strings in URL and body fields.",
    ),
    "docs/05-detection-engine/06-rule-brute-force.md": (
        "Detection rule: Rule Brute Force. Implemented in `src/services/rules.js` with configurable thresholds.",
        "Stateful: ≥5 failed authentication events from one source IP within 60 seconds.",
    ),
    "docs/05-detection-engine/07-rule-rapid-requests.md": (
        "Detection rule: Rule Rapid Requests. Implemented in `src/services/rules.js` with configurable thresholds.",
        "Stateful: ≥10 requests from one IP within 10 seconds (DoS-style noise).",
    ),
    "docs/05-detection-engine/08-rule-unusual-port.md": (
        "Detection rule: Rule Unusual Port. Implemented in `src/services/rules.js` with configurable thresholds.",
        "Alerts when destination port is outside common web/mail/SSH ranges.",
    ),
    "docs/05-detection-engine/09-rule-sensitive-path.md": (
        "Detection rule: Rule Sensitive Path. Implemented in `src/services/rules.js` with configurable thresholds.",
        "Matches requests to `/admin`, `.env`, `.git`, backup paths, and similar.",
    ),
    "docs/05-detection-engine/10-rule-file-tampering.md": (
        "Detection rule: Rule File Tampering. Implemented in `src/services/rules.js` with configurable thresholds.",
        "Detects delete/rename/chmod patterns in file audit log messages.",
    ),
    "docs/05-detection-engine/11-rule-data-exfil.md": (
        "Detection rule: Rule Data Exfil. Implemented in `src/services/rules.js` with configurable thresholds.",
        "Large outbound transfer or suspicious upload size in HTTP/proxy logs.",
    ),
    "docs/05-detection-engine/12-rule-priv-esc.md": (
        "Detection rule: Rule Priv Esc. Implemented in `src/services/rules.js` with configurable thresholds.",
        "sudo/su/runas or group membership change events in auth logs.",
    ),
    "docs/05-detection-engine/13-rule-off-hours.md": (
        "Detection rule: Rule Off Hours. Implemented in `src/services/rules.js` with configurable thresholds.",
        "Successful auth outside configured business hours (low severity, tuning-heavy).",
    ),
    "docs/05-detection-engine/02-stride-mapping.md": (
        None,
        "Table mapping each of the ten bundled rules to STRIDE categories. See [rules overview](01-rules-overview.md).",
    ),
}

HEADING_FIXES: dict[str, str] = {
    "docs/07-ui-modules/12-soar-console.md": "# SOAR console",
    "docs/07-ui-modules/component-internals/01-props-and-state.md": "# Props and state",
}


def main() -> None:
    changed = 0
    for rel, pair in REWRITES.items():
        fp = ROOT / rel.replace("/", "\\")
        if not fp.exists():
            continue
        text = fp.read_text(encoding="utf-8")
        old, new = pair
        if old and old in text:
            text = text.replace(old, new, 1)
        elif old is None:
            # replace first non-heading body line
            lines = text.splitlines()
            for i, line in enumerate(lines):
                if line.strip() and not line.startswith("#") and not line.startswith("**"):
                    lines[i] = new
                    break
            text = "\n".join(lines) + "\n"
        if rel in HEADING_FIXES:
            text = text.replace(text.splitlines()[0], HEADING_FIXES[rel], 1)
        orig = fp.read_text(encoding="utf-8")
        if text != orig:
            fp.write_text(text if text.endswith("\n") else text + "\n", encoding="utf-8")
            changed += 1
    for rel, heading in HEADING_FIXES.items():
        fp = ROOT / rel.replace("/", "\\")
        if not fp.exists():
            continue
        lines = fp.read_text(encoding="utf-8").splitlines()
        if lines and lines[0] != heading:
            lines[0] = heading
            fp.write_text("\n".join(lines) + "\n", encoding="utf-8")
            if rel not in REWRITES:
                changed += 1
    print(f"round2 changed {changed}")


if __name__ == "__main__":
    main()
