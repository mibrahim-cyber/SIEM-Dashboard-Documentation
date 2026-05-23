---
module: Log Ingestion
sidebar: Ingest & Config → Log Ingestion
section: Ingest & Config
subsection: Log source types
last_updated: 2026-05-23
---

# Log source types

**Part of:** Ingest & Config → Log Ingestion
**One-sentence focus:** Supported log formats, sample cards, and auto-detect heuristics in the log parser layer.

### What you are looking at

The **FORMAT** dropdown exposes nine options defined in `FORMAT_LABELS` inside log parsing layer: Auto-detect, Apache / Nginx access log, Syslog RFC 5424, Syslog RFC 3164, CEF (ArcSight / QRadar), JSON (generic), ECS JSON (Elastic), Windows Event Log JSON, and **CSV**. The Sample Logs tab renders five clickable cards. Apache / Nginx access log, Syslog RFC 3164, JSON (generic), Windows Event Log JSON, and CEF (ArcSight / QRadar), each showing the first line truncated to 80 characters and a line count like `7 lines → click to load`. The textarea placeholder adapts to the selected format, showing an example line from `FORMAT_EXAMPLES`. Each sample tells a mini attack story. The Apache sample mixes internal IPs (`192.168.1.55`, `10.0.0.5`), a brute-force source (`203.0.113.45` hitting `/wp-login.php` with `python-requests`), and a scanner (`185.220.101.45` requesting `/etc/passwd` with Nmap). The Syslog sample shows repeated SSH password failures, a sudo command, and a UFW block. JSON lines encode structured auth and port-scan events. Windows Event JSON includes Event IDs 4625 (failed logon), 4698 (scheduled task, persistence), and 1102 (audit log cleared). CEF lines come from Cisco ASA, Snort IDS, and Palo Alto NGFW with varying vendor severity scores.

### What is happening underneath

Format selection controls which parser function `parseLogText()` invokes. Auto-detect calls `detectFormat()` on the first non-empty line, applying heuristics in order: `CEF:` prefix → CEF; `<pri>1 ` pattern → RFC 5424 syslog; `<pri>Mon DD` pattern → RFC 3164 syslog; valid JSON with `EventID`/`TimeCreated`/`LevelDisplayName` → Windows Event; other JSON → generic JSON; Apache combined-log regex match → Apache; comma-separated without leading IP → CSV; else unknown (falls back to Apache parser). Each parser emits a consistent event skeleton:

| Format key | Parser function | `_format` value | Notable ECS fields |
|---|---|---|---|
| `apache` | `parseApacheLine` | `apache` | `http.request.method`, `http.response.status_code`, `url.path`, `user_agent.original` |
| `syslog5424` | `parseSyslog5Line` | `syslog5424` | `host.name`, `process.name`, `message` |
| `syslog3164` | `parseSyslog3Line` | `syslog3164` | `host.name`, `process.name`, auth-failure `event.outcome` |
| `cef` | `parseCefLine` | `cef` | `source`, `destination`, `product`, `event.kind: alert` |
| `json` / `ecs_json` | `parseJsonLine` | `json` or `ecs_json` | Generic field mapping or passthrough ECS |
| `windows_event` | `parseWindowsEventLine` | `windows_event` | `event.code`, WEV_MAP actions for known Event IDs |
| `csv` | `parseCsvLine` → `parseJsonLine` | inherits `json` | Header-driven column mapping |

Windows Event parsing includes a `WEV_MAP` dictionary mapping Event IDs like 4625 → `failed_logon` (high severity), 4698 → `scheduled_task_created` (high), and 1102 → `audit_log_cleared` (critical); giving immediate semantic meaning beyond raw Microsoft codes. Severity is assigned per format: Apache uses HTTP status via `inferSeverity()`; syslog RFC 5424 maps PRI facility/severity numerically; CEF converts vendor severity 0–10 via `cefSeverityToLevel()`; Windows uses level display name or WEV_MAP overrides.

### Why this matters

Real SOC environments ingest dozens of source types simultaneously. A SIEM that only accepts JSON forces expensive conversion upstream. HABIBI-SIEM's multi-format parser lets analysts paste exports directly from Apache, Linux syslog, ArcSight CEF feeds, or Windows Event Forwarding JSON without standing up a Logstash pipeline first. Knowing which sample maps to which `FORMAT_LABELS` entry prevents the most common onboarding mistake: selecting JSON (generic) when the file is ECS-shaped (works but skips passthrough) or forcing Apache on syslog lines (produces "no match" errors).

### Step-by-step walkthrough

1. Open Log Ingestion and click Sample Logs.
2. Click the CEF (ArcSight / QRadar) card: note the header switches to paste tab with CEF lines loaded.
3. Verify **DETECTED FORMAT** reads CEF (ArcSight / QRadar) in the preview stats.
4. Clear text, load Windows Event Log JSON sample. Confirm Event IDs appear as actions like `failed_logon`, `scheduled_task_created`, `audit_log_cleared`.
5. Load Syslog RFC 3164 sample, confirm `SYSLOG_sshd` event types and extracted IPs from "Failed password for root from X" messages.
6. Change **FORMAT** manually to JSON (generic) while Apache text is loaded; watch preview re-parse with wrong field mapping (demonstrating why format matters).
7. Reset to Auto-detect and reload Apache sample: confirm correct HTTP method/status columns return.
8. Upload a `.csv` file with headers `timestamp,src_ip,action,user` to exercise the CSV path.

### Common questions

#### Why are apache and nginx the same format?

Both use the Apache Combined Log Format. `NGINX_RE` is aliased to `APACHE_RE` in the log parsing layer because the field order and quoting conventions are identical for access logs.

#### What is the difference between JSON (generic) and ECS JSON (Elastic)?

**ECS JSON** activates when a parsed object already contains `@timestamp` or an `event` object. Fields pass through with minimal remapping. JSON (generic) applies heuristic column mapping (`src_ip`, `username`, `action`, etc.) for ad-hoc application logs.

#### Can I mix formats in one paste?

No. `parseLogText()` detects format from the first line and applies one parser to all lines. Mixed files require splitting or manual format selection per batch.

#### What file extensions does upload accept?

The hidden file input accepts `.log`, `.txt`, `.json`, `.csv`, and `.evtx_json`, covering common export conventions including Windows events converted to JSON.

### Using this view during live response

After containing a web server compromise, the analyst exports `/var/log/apache2/access.log` and `/var/log/auth.log` separately. They ingest the Apache file with Auto-detect (or explicit Apache format), review brute-force IPs in preview, then ingest syslog auth lines as a second batch with Syslog RFC 3164. If the domain controller forwarded events, they upload the `.evtx_json` export with Windows Event Log JSON to catch log-clearing (Event 1102) or new scheduled tasks (Event 4698). Each batch's preview severity tiles give a quick triage signal before polluting the shared alert queue.

### Edge cases and gotchas

Auto-detect returns `unknown` for unrecognized lines and falls back to the Apache parser, which may produce many "no match" parse errors rather than a hard failure. JSON arrays (Windows sample is a `[...]` array) are handled by attempting `JSON.parse(text)` on the full body before line-by-line NDJSON parsing. Syslog RFC 3164 timestamps omit the year; `parseSyslog3Date()` assumes the current calendar year. CSV requires a header row on; data rows follow. The sample tab shows five formats but the dropdown includes CSV and both syslog variants not represented as samples: use paste with `FORMAT_EXAMPLES.csv` for testing.

> **Technical note:** `SAMPLE_LOGS` in Log Ingestion screen keys (`apache`, `syslog`, `json`, `windows`, `cef`) map to `FORMAT_LABELS` display names via the same keys where they align; the syslog sample uses RFC 3164-shaped lines detected as `syslog3164`.
