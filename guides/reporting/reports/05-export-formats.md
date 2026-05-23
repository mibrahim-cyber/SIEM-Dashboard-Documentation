---
module: Reports
sidebar: Reporting → Reports
section: Reporting
subsection: Export formats and use cases
last_updated: 2026-05-23
---

# Export formats and use cases

**Part of:** Reporting → Reports
**One-sentence focus:** Export buttons, file formats, audit logging, and the PDF gap between Reports and Scheduler.

### What you are looking at

The right sidebar panel labelled // EXPORT contains three full-width buttons stacked vertically:

1. EXPORT REPORT.TXT. Primary green border (`border-matrix`), brightest hover (fills green, black text).
2. EXPORT ALERTS.JSON. Dimmer border, hover brightens.
3. EXPORT ALERTS.CSV, same styling as JSON. There is no **EXPORT PDF** button on this screen. There is no HTML download, no XLSX, and no email-send dialog. Clicking a button triggers an immediate browser download; no modal confirms success beyond the file appearing in your downloads folder. The Dashboard overview also exposes [ GEN REPORT ], [ JSON EXPORT ], and [ CSV EXPORT ] shortcuts that call the same `exportReport` and `exportAlerts` functions; behaviour matches Reports sidebar exports.

### What is happening underneath

Both export paths guard on `canExport` from auth context, if false, clicks no-op silently.

1. Calls `api.logExport('report')` POST to `/api/audit/export` with body `{ format: 'report' }` (CSRF-protected, requires `export` permission).
2. Builds plain text:

```
HABIBI-SIEM SECURITY REPORT
Generated: {ISO timestamp}
risk score: {riskScore}/100
Watchlisted IPs: {blockedIps.size}
Enforcement: {enforcement}

Alerts: {total} total, {critical} critical, {high} high
SOAR Actions: {soarLog.length}
```
3. Creates a `Blob` `text/plain`, triggers download as `habibi-siem-report-{Date.now()}.txt`.

1. Calls `api.logExport(format)` where format is `'json'` or `'csv'`.
2. **JSON**: `JSON.stringify(alerts, null, 2)` → `habibi-siem-alerts-{timestamp}.json`.
3. **CSV**: headers `id,timestamp,sourceIp,severity,status,eventType,rules,stride`; rules column joins matched rule names with ` | `; downloads `habibi-siem-alerts-{timestamp}.csv`. Server route logs `audit(req, 'EXPORT', format)` into SQLite `audit_log` via `writeAudit`: the download itself is entirely client-side blob generation; the server never attaches a file. PDF gap: Scheduler's **NEW REPORT SCHEDULE** modal lists **PDF** in its format dropdown and **RUN NOW** simulates generation with a fake KB size, but no code path renders PDF bytes. Neither Reports nor `exportReport` produces PDF. Executive printable layouts would require a library (jsPDF, print-to-PDF) or server-side rendering not present in the shipped build.

### Why this matters

Export format choices define who can consume data downstream. Plain `.txt` opens everywhere for executives and ticket systems but loses charts and compliance tables visible on screen. JSON preserves full alert objects (including `matchedRules` arrays) for SOAR pipelines and re-ingestion tests. CSV lands in Excel/Splunk lookups with flat columns but drops nested structures. Compliance officers expecting immutable PDF board packs must know the product delivers text and structured alert dumps today, not signed PDFs, and plan wrapper processes or Scheduler automation only as a scheduling UI mock unless extended. Audit logging on every export creates accountability: security teams can prove who pulled data: a requirement under SOC 2 and many GDPR accountability narratives. Even when the file itself is not tamper-evident (see next section).

### Step-by-step walkthrough

1. Open Reporting → Reports with alerts present; confirm export buttons are visible in // EXPORT.
2. Click EXPORT REPORT.TXT; open the downloaded file and verify risk score, enforcement string, and alert totals match Overview metrics.
3. Click EXPORT ALERTS.JSON; validate pretty-printed array length equals **TOTAL ALERTS** in header.
4. Click EXPORT ALERTS.CSV; open in a spreadsheet and confirm headers and rule name concatenation.
5. If you have admin access, open audit log API (`GET /api/audit`) and locate recent **EXPORT** entries with targets `report`, `json`, `csv`.
6. Compare on-screen **COMPLIANCE VIEW** tables with `.txt` export, note the export omits framework scores (document gap for auditors).
7. Visit Reporting → Scheduler and observe PDF in format list; run **RUN NOW** and read **GENERATION LOG**; understand this does not create a real PDF file in Downloads.
8. For board-ready PDFs today, use browser Print → Save as PDF on **EXECUTIVE VIEW** as a manual workaround, knowing it is not audit-logged as PDF export.

### Common questions

#### Why is there no PDF export button?

PDF generation is not implemented in `exportReport` or `exportAlerts`. Scheduler UI references PDF as a planned/placeholder format only. The Reports module prioritises lightweight client-side blobs.

#### Does EXPORT REPORT.TXT include everything on screen?

No. It exports a short summary (~8 lines), not executive narrative, compliance tables, or MITRE grid. For full structured data use JSON; for spreadsheet analysis use CSV.

#### What is in the CSV "rules" column?

Pipe-separated `ruleName` values from each alert's `matchedRules` array, or empty if none.

#### Why did my export click do nothing?

Check role permissions (`canExport`), CSRF token presence (session expired), or zero-byte browser blockers. Failed audit POST is swallowed with `.catch(() => {})` but download should still proceed if `canExport` is true.

#### Are exports filtered to the current view?

No. JSON and CSV always export the entire `alerts` array. View selection affects only on-screen layout.

### Edge cases and gotchas

Very large alert arrays may choke older browsers when stringifying JSON: demo datasets are small. CSV special characters in rule names are escaped via `csvEscape` in context. Filenames use millisecond timestamps. Downloads never overwrite prior files. `logExport` failure is silent; download still occurs, creating potential audit gap if network blocked mid-request. Alert Manager duplicate export buttons produce identical files. Unicode in `eventType` fields should survive UTF-8 JSON; Excel may mangle CSV encoding unless imported as UTF-8.

> **Technical note:** `api.logExport` → `POST /api/audit/export` with `{ format }`. Server: `audit(req, 'EXPORT', req.body?.format || 'unknown')`. Downloads use ephemeral `URL.createObjectURL` revoked after click. MIME types: `application/json`, `text/csv`, `text/plain`.

### How an analyst uses this

After weekly triage, an analyst exports CSV for metrics they chart offline. Before handing off to a SOAR engineer they export JSON for playbook testing. They send the `.txt` report to a manager who refuses attachments over 1 MB, it's tiny by design. They document for compliance that PDF is not native and attach CSV plus screenshots of **COMPLIANCE VIEW** for audit evidence. They verify each export appears in audit logs during access reviews.
