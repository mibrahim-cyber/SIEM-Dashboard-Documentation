---
module: Reports
sidebar: Reporting → Reports
section: Reporting
subsection: Report integrity
last_updated: 2026-05-23
---

# Report integrity

**Part of:** Reporting → Reports
**One-sentence focus:** Server-side export audit trails versus tamper evidence on downloaded files.

### What you are looking at

The Reports UI does not display hash chains, digital signatures, or "verified" badges on exports. Integrity controls are backend audit events recorded when someone clicks an export button, not cryptographic sealing of the downloaded file. Admins with permission can review entries via **`GET /api/audit`** (requires `admin` permission), which returns rows from the `audit_log` SQLite table including username, action, target, and timestamp. From the analyst perspective on Reports, the only visible integrity cue is that exports require an authenticated session with export permission, buttons respect RBAC like other sensitive actions. Each successful export attempt fires a audit POST before the browser download starts.

### What is happening underneath

Flow when clicking EXPORT REPORT.TXT:

1. `exportReport` checks `canExport`.
2. `await api.logExport('report')` → `POST /api/audit/export` with JSON `{ format: 'report' }`.
3. Middleware stack: rate limit → `requireAuth` → `requireCsrf` (validates `X-CSRF-Token` header) → `requirePermission('export')`.
4. Handler calls `audit(req, 'EXPORT', req.body?.format || 'unknown')` which invokes `writeAudit({ userId, username, action: 'EXPORT', target: format,... })`.
5. Client builds `.txt` blob locally and triggers download, file contents never pass through server.

`exportAlerts('json'|'csv')` logs target `'json'` or `'csv'` similarly. The audit row records who exported what format and when, not file hash, row count, or alert snapshot ID. Tampering with the file after download is undetectable by this system unless you add checksums externally.

`writeAudit` inserts into `audit_log` columns: `user_id`, `username`, `action`, `target`, `details`, `created_at`. Export events use action **`EXPORT`** and target equal to format string. Failed CSRF or auth returns 403/401; export function catches audit errors silently but should not reach download if `canExport` false. This is audit trail evidence, not tamper-evident report packaging (no HMAC, no WORM storage, no Merkle tree). Compliance mapping: SOC 2 CC7.2/CC8.1 style monitoring of sensitive actions; ISO 27001 A.8.15 logging; PCI Req. 10.2 traceability of log export: provided reviewers understand exports themselves are mutable offline.

### Why this matters

Regulators and insurers increasingly ask "prove who extracted security data and when." Server-side export logging answers that question even when files are generated client-side. It also deters casual data exfiltration by interns who know exports leave fingerprints. Important in tiered SOC environments. Conversely, teams must not overclaim: an audit entry does not prove the CSV wasn't edited in Excel afterward; chain-of-custody requires supplemental controls (signed archives, DLP, storage immutability). Silent `.catch(() => {})` on audit failure is a product gap: downloads may proceed without log if API fails, operations should monitor audit table completeness.

### Step-by-step walkthrough

1. Sign in as a non-admin analyst and export JSON from // EXPORT.
2. Sign in as admin (or use API client) and `GET /api/audit`; locate latest `action: "EXPORT"` with `target: "json"` and your username.
3. Repeat with EXPORT REPORT.TXT; confirm target `report`.
4. Attempt export with expired session; expect failure to download and no new audit row.
5. Compare audit timestamp with file filesystem created time: they should be seconds apart.
6. Edit exported CSV locally; note audit log unchanged. Demonstrates post-export tampering is not detected.
7. For evidence packages, record audit entry ID/timestamp in cover memo alongside file SHA-256 you compute manually.
8. Include screenshot of **COMPLIANCE VIEW** showing "Audit trail maintained" check context.

### Common questions

#### Does the exported file include a signature or hash?

No. Files are plain blob downloads. Integrity proof is the separate audit log entry.

#### Who can view export audit logs?

Users with `admin` permission via `GET /api/audit`. Regular analysts can create export entries but may not read the full log in UI unless an admin screen exposes it.

#### What if api.logExport fails but download succeeds?

The code catches audit errors without blocking download, potential compliance gap. Retry exports or monitor server health if audit completeness is mandatory.

#### Are scheduler RUN NOW events audited?

No. Only manual exports through `exportReport`/`exportAlerts` call `api.logExport` today.

#### Does viewing reports without exporting create audit entries?

No. Only POST `/api/audit/export` on button click. Page views are not logged in `audit_log`.

### Edge cases and gotchas

Audit omits alert count and IP ranges; only format in `target`. Concurrent exports create multiple rows: good for forensics, noisy for dashboards. `LOGIN_FAILED` and other actions share the same table. Filter by `action = 'EXPORT'`. Client-side export after audit POST means race: audit precedes download, not completes it. Tier1 role has `canExport: true` despite `canWrite: false`, auditors can export but not ack alerts, possibly skewing compliance checks while still exfiltrating data. CSRF token missing in custom scripts blocks audit+log export pair.

### How an analyst uses this

During data-handling training, analysts are told every **EXPORT** click is logged with their username; discouraging personal copies of full alert dumps. Before external audits they request admin pull of EXPORT entries to demonstrate monitoring. They store SHA-256 hashes of submitted CSV files in the ticket system since the SIEM does not. They escalate if audit API shows exports they did not perform: possible credential compromise.
