---
module: Settings
sidebar: Ingest & Config → Settings
section: Ingest & Config
subsection: Audit log of settings changes
last_updated: 2026-05-23
---

# Audit log of settings changes

**Part of:** Ingest & Config → Settings
**One-sentence focus:** Which Settings actions write audit_log rows, and which preferences do not.

### What you are looking at

Settings itself does not render an audit log viewer, there is no scrollable table of `LOGIN`, `THREAT_KEYS_UPDATED`, or `ALERTS_CLEARED` events on this page. Instead, Settings *triggers* auditable actions and displays a footnote in **DATA MANAGEMENT**: **Alerts, watchlist, and audit logs stored in server database (`data/siem.db`)**. Operators infer that clearing alerts leaves forensic traces in `audit_log` even when alert rows disappear. Export operations elsewhere (Alert Manager CSV/JSON, executive report download) call `api.logExport` which POSTs `/api/audit/export`, also audited. The **CLEAR ALL ALERTS** confirmation dialog warns about permanent deletion of alert rows but does not mention audit retention; a subtle UX gap that documentation must fill so managers understand evidence removal versus audit trail preservation. Admin users reviewing compliance must use API or SQL tools today: `GET /api/audit` via `api.getAuditLog()` returns `{ entries: [...] }` last 200 rows: requires admin session, not exposed in Settings UI. Each entry includes `username`, ISO-friendly `created_at` epoch, `action`, optional `target`, and `details` JSON or text. Enough to reconstruct a timeline when correlated with external ticketing systems. Forward-thinking deployments pipe this endpoint to a central log platform nightly because the UI offers no retention policy controls.

### What is happening underneath

`writeAudit()` in the database layer inserts into `audit_log (user_id, username, action, target, details, created_at)`. Helper `audit(req, action, target, details)` in server entry point passes session identity. Settings-adjacent actions include:

| User action | Audit action | Notes |
|-------------|--------------|-------|
| SAVE API KEYS | `THREAT_KEYS_UPDATED` | No key material in details |
| TEST CONNECTION | `THREAT_TEST` | target: provider; details: message |
| CLEAR ALL ALERTS confirm | `ALERTS_CLEARED` | via DELETE `/api/alerts` |
| SIGN OUT (Account) | `LOGOUT` | Auth flow |
| Export alerts/report | `EXPORT` | format in details via `logExport` |

`clearAlerts` in the SIEM context pipeline calls `api.clearAlerts()` → server `deleteAllAlerts()` + audit `ALERTS_CLEARED`. Settings UI uses two-step confirm: **CLEAR ALL ALERTS** then **CONFIRM** / **CANCEL**. Same function powers Dashboard C shortcut and Alert Manager [ CLEAR ALL ], all admin-gated.

`api.logExport(format)` records export events for compliance ("who downloaded CSV") but does not itself stream file bytes; the client builds Blob downloads after audit POST succeeds. `getAuditLog()` is defined in API client layer but no React component in Settings consumes it yet. Login failures audit as `LOGIN_FAILED` with attempted username: relevant when reviewing Settings access patterns. CSRF failures do not audit separately. They return 403.

### Why this matters

Regulators ask whether configuration tampering is traceable. Threat key rotation without audit would fail SOC 2 CC7. Clearing all alerts during an active investigation is destructive, audit row preserves *who* clicked confirm even when alert evidence is gone. Separating export audit from file generation proves due diligence for data exfiltration reviews. Watchlist additions from SOAR (`WATCHLIST_ADD`) and alert status patches (`ALERT_UPDATE`) also audit through the same table even though those actions are not initiated from Settings, when reviewing Settings change management, include these related actions in scope because operators often conflate "clear alerts" with "reset SOC environment."

Settings documentation must clarify the gap: preferences (sound, dedupe) are not audited: only server mutations and exports. Compliance officers building control matrices should list Settings as partial coverage: strong for secrets and destructive admin, weak for operator comfort toggles. A mature SOC compensates with external change tickets when threat keys rotate.

### Step-by-step walkthrough

1. Log in as manager; open Settings → **DATA MANAGEMENT**.
2. Note footnote referencing `data/siem.db` and audit storage.
3. Perform **SAVE API KEYS** or **TEST CONNECTION** in threat section.
4. Use curl or browser devtools (admin cookie + CSRF) to `GET /api/audit`. locate `THREAT_KEYS_UPDATED` / `THREAT_TEST`.
5. Export alerts from Alert Manager as JSON, confirm `EXPORT` entry with format detail.
6. Execute **CLEAR ALL ALERTS** → **CONFIRM** during test environment only.
7. Re-query audit log for `ALERTS_CLEARED` with your username.
8. Verify tier1 cannot call `/api/audit` (403) or clear alerts.

### Common questions

#### Why is there no audit viewer in settings?

Not implemented in v4 UI; use API, future module, or direct SQL: `SELECT * FROM audit_log ORDER BY created_at DESC`.

#### Does CLEAR ALL ALERTS delete audit entries?

No. `deleteAllAlerts()` only clears `alerts` table. Audit history remains.

#### Are threat keys logged in audit details?

No. Action is `THREAT_KEYS_UPDATED` without secret values: safe for log aggregation.

#### Does toggling sound or dedupe audit?

No. Client-only state change with no server POST.

#### How long are audit entries retained?

No rotation job. Grows until manual purge or DB restore. `getAuditLog()` returns latest 200 by default.

### How an analyst uses this during an active incident

Compliance auditor exports alerts via permitted export path, `EXPORT` row proves timing and user for evidence chain-of-custody. After red-team exercise, manager clears alerts but first notifies GRC that `ALERTS_CLEARED` will appear; correlates with ticket number in external systems. Forensics lead pulls audit via API when insider threat suspected on threat key changes (`THREAT_KEYS_UPDATED` without change ticket). Settings footnote reminds analysts that watchlist count survives alert clear: only alert rows deleted, not watchlist or audit. During dual-control procedures, one manager executes **CLEAR ALL ALERTS** while another watches audit API responses in real time.A workaround until a built-in audit viewer ships. Shift handoff should note any pending threat tests (`THREAT_TEST` spam may indicate misconfigured keys or automation loop).

### Edge cases and gotchas

`clearAlerts` also wipes client `rawLogs`, `alertHistory`, and engine memory, not audited separately beyond `ALERTS_CLEARED`. Failed `clearAlerts` API call leaves UI state unchanged; no audit row. `logExport` failure still attempts download in some components: check call order in `exportAlerts`. Audit entries without `user_id` occur for pre-auth `LOGIN_FAILED`. Clock on host affects `created_at` ordering. Use UTC in external SIEM forwarding. No UI for **CLEAR ALL** on watchlist or audit tables, DBA manual only.

> **Technical note:** Pentest docs in repository (`pentest-02-session-and-csrf.md`) cover export and admin endpoints; cross-reference for security assessments.
