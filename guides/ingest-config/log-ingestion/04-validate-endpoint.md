---
module: Log Ingestion
sidebar: Ingest & Config → Log Ingestion
section: Ingest & Config
subsection: The validate endpoint
last_updated: 2026-05-23
---

# The validate endpoint

**Part of:** Ingest & Config → Log Ingestion
**One-sentence focus:** The POST /api/ingest/validate endpoint, sanitization rules, and fail-closed behaviour.

### What you are looking at

You never see the validate endpoint directly in the UI, it runs silently when you click **INGEST**. Success means events flow into Live Feed and alerts may appear. Failure means the green ingest badge never shows alert counts, the browser console logs `[siem] log validation failed`, and **log processing returns an empty array**, as if nothing was ingested. Administrators can inspect the audit trail under Settings or via `GET /api/audit` (admin role) for entries tagged LOGS_VALIDATED with details like `142 events, 3 rejected`. From an operator's perspective, validation is the bouncer at the club door: your preview looked fine in the parking lot (client parse), but the server decides what actually enters the detection floor.

### What is happening underneath

```javascript
// API client layer
validateLogs: (events) =>
 request('/api/ingest/validate', { method: 'POST', body: JSON.stringify({ events }) }),
```
The server handler in server entry point:

```javascript
app.post('/api/ingest/validate', ingestLimiter, requireAuth, requireCsrf, requirePermission('write'), (req, res) => {
 const { events } = req.body || {};
 if (!Array.isArray(events)) return res.status(400).json({ error: 'events array required' });
 const { events: sanitized, rejected } = sanitizeLogBatch(events);
 audit(req, 'LOGS_VALIDATED', null, `${sanitized.length} events, ${rejected} rejected`);
 res.json({ events: sanitized, rejected, maxEvents: 5000 });
});
```
Security middleware stacked on this route:

- **`ingestLimiter`**, rate limit of 30 requests per 60 seconds per client, returning `{ error: 'Ingestion rate limit exceeded' }` when exceeded.
- **`requireAuth`**; session cookie must be valid.
- **`requireCsrf`**: `X-CSRF-Token` header required on POST (populated automatically by API client layer after login).
- **`requirePermission('write')`**; read-only roles (e.g. auditor) cannot validate; log processing skips the API call entirely when `canWrite` is false.

`sanitizeLogBatch()` in validation middleware processes up to 5000 events per request (`maxEvents` default). Each event passes through `sanitizeLogEvent()`:

1. Rejects non-object inputs (counts toward `rejected`).
2. Deep-clones via `structuredClone`.
3. **Deletes `severity`**, uploaded severity is never trusted; client-side inference is stripped so rules evaluate on behavioral fields, not attacker-controlled labels.
4. **Deletes `simulated`**; prevents marking real uploads as demo data.
5. Validates `sourceIp` / `source.ip` against `IPV4_RE`; invalid IPs are removed, not rejected entirely.
6. Truncates `_raw` strings longer than 16,384 characters to prevent memory exhaustion. The response replaces the client's event array. `the SIEM context pipeline` assigns `working = events` from the response before geo enrichment and detection.

### Why this matters

Production SIEMs sit on the security boundary: log ingestion is a common attack vector for log injection, severity inflation ("mark my scan as low"), and denial-of-service via megabyte `_raw` fields. Server-side validation enforces schema hygiene, rate limits abuse, and audit logging creates accountability. The **`return []` on failure** behavior is a fail-closed design: a validation outage does not silently ingest unsanitized data. Analysts and engineers must know this contract to distinguish "parser returned zero events" (preview issue) from "validation rejected the batch" (the server network issue).

### Step-by-step walkthrough

1. Sign in as an analyst with write permission and open browser DevTools → Network tab.
2. Load a sample and click **INGEST**. observe a `POST /api/ingest/validate` request.
3. Inspect the request payload: JSON body `{ events: [ {...},... ] }`.
4. Inspect the response: `{ events: [...], rejected: N, maxEvents: 5000 }`.
5. Sign in as a read-only auditor, ingest sample logs, note no validate call fires (check Network tab); events still parse locally but persistence differs.
6. As admin, query audit log for LOGS_VALIDATED entries confirming batch sizes.
7. (Advanced) Send 31 ingest requests within one minute to trigger rate limiting; observe validation failure and empty ingest result.

### Common questions

#### Why does the server strip severity if preview already showed it?

Attackers with write access could otherwise upload events tagged `severity: 'low'` for obvious malware indicators, hoping to evade dashboard sorting. Stripping forces the detection engine and UI to derive urgency from rule matches and field content, not user-supplied labels.

#### What does `rejected` count mean?

Events beyond the 5000 cap plus any null results from `sanitizeLogEvent()` (malformed non-objects). Invalid IPv4 on an otherwise valid event does not reject the whole event: only the IP field is removed.

#### Does validation store events in the database?

No. Validation sanitizes in-memory and returns the array. Persistence happens in dashboard state (`rawLogs`) and optional alert batch saves. Not a long-term log warehouse in this demo build.

#### What HTTP status codes indicate failure?

**400** if `events` is not an array; **401/403** for auth/permission failures; **429** for rate limiting; 5xx for server errors, all caught by log processing and resulting in `return []`.

### Operational use during containment

When bulk-ingesting a large IR export, the analyst watches the Network tab (or coordinates with platform admin) if events disappear after ingest. A **429** response means they must batch files into smaller chunks under the 5000-event cap and 30-requests-per-minute limit. If specific events lose IP addresses post-validation, the analyst checks for malformed IPs in source logs; validation strips bad values rather than failing the entire line, which can cause IOC correlation gaps downstream.

### Edge cases and gotchas

Validation runs only when `canWrite` is true; tier-1 read-only users bypass sanitization entirely: a RBAC nuance for multi-tenant demos. CSRF token expiry mid-session causes validate failures until re-login. The client does not surface `rejected` count in the UI. you only see total ingested minus alerts. Events with IPv6 addresses lose `sourceIp` silently today because `isValidIpv4` is the only validator. Double ingest of the same batch re-validates and re-processes, there is no server-side deduplication at validate time.

> **Technical note:** Audit entries write to SQLite `audit_log` via `audit(req, action, target, details)` in the database layer. The validate route never re-applies client-side `inferSeverity()`; severity visible in Live Feed after ingest comes from parser output re-computed on the client post-response or from rule match severity on alerts.
