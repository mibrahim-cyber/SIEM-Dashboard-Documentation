---
module: Live Feed
sidebar: Monitor → Live Feed
section: Monitor
subsection: Log normalisation detailed
last_updated: 2026-05-23
---

# Log normalisation detailed

**Part of:** Monitor → Live Feed
**One-sentence focus:** Every row in Live Feed is already validated, ECS-shaped, and geo-enriched before it reaches the display buffer.

### What you are looking at

You never see raw syslog text in Live Feed rows, you see structured fields. Empty state message: `NO LOGS. USE LOG INGESTION OR SIMULATE CAMPAIGN`. When populated, each row is already normalized. **LOG DETAIL** shows key-value pairs with `@timestamp` rendered ISO. Raw syslog is like a cashier's handwritten receipt, legible to the cashier but messy for accounting software. Normalisation is the OCR and ledger entry step that turns scribbles into columns: date, vendor, amount, category.

### What is happening underneath

Walkthrough from example syslog line:

`Jun 15 14:32:11 webserver sshd[1234]: Failed password for root from 203.0.113.45 port 22 ssh2`

1. Ingestion: Log arrives via Log Ingestion paste, file upload, or `generateMaliciousLog()` simulation; often already JSON in HABIBI-SIEM demos rather than literal syslog text.
2. Server validation: `POST /api/logs/validate` checks schema, required fields, IP format, timestamp coercion: returns `{ events }` array.
3. Parsing: log parsing layer / validation layer maps raw fields to ECS-like shape: `@timestamp`, `event.type` → `eventType`, `source.ip` → `sourceIp`, `user.name` → `username`, HTTP fields for web logs.
4. Geo enrichment: `lookupGeoIpBatch()` adds `geo.country`, coordinates if IP known.
5. Storage in buffer: Appended to `rawLogs` with slice cap.
6. UI rendering: `RawLogs` maps `eventType`, `sourceIp`, etc. To columns; detail panel iterates `Object.entries(selectedLog)`. Failed password example would become approximately: `{ timestamp: 1718459531000, eventType: 'auth-failure', sourceIp: '203.0.113.45', username: 'root', port: 22, method: null, statusCode: null }`.

### Why this matters

Detection rules match structured fields, not raw strings. If parser mislabels `sourceIp`, rules fire on wrong actor or miss attacks. Compliance searches depend on consistent field names (`@timestamp` for ECS compatibility).

### Step-by-step walkthrough

1. Ingest one manual JSON log via Log Ingestion with known fields.
2. Open Live Feed; locate the row.
3. Click row, open **LOG DETAIL** and compare keys to ingested JSON.
4. Note added `geo` if external IP.
5. Trigger matching rule; confirm alert `sourceIp` equals log `sourceIp`.
6. Ingest malformed line: observe rejection at validation (no row appears).
7. Compare simulated log in detail; look for `_simulated: true` flag.

### Common questions

#### Does HABIBI-SIEM accept literal syslog text?

Primarily JSON/ECS-shaped events through validation API. Plain syslog requires parser configuration in ingest pipeline, demo path uses pre-structured mock logs.

#### What is ECS?

Elastic Common Schema; field naming convention (`@timestamp`, `event.category`, `source.ip`) so different log sources query uniformly. Pipeline Health shows **ECS COMPLIANT** percentage checking `@timestamp` or `event.kind` presence.

#### Why rename fields at all?

Rules engine and UI expect consistent property names. `sourceIp` everywhere beats guessing whether vendor called it `src`, `client_ip`, or `ip_src`.

#### Can I see pre-normalisation text?

Not in Live Feed after validation replaces events. Keep original files externally or log validation errors server-side.

### Operational use during containment

Analyst verifies parser output when alert seems wrong; opens detail, confirms `eventType` and `urlPath` actually match rule intent. If fields missing, escalates to engineer checking validation rejects in server logs.

### Edge cases and gotchas

Object-valued fields stringify in detail view; edit carefully when copying. Simulated logs bypass some production-only validation paths historically, verify hardened server in prod. Timestamp as number ms vs ISO string; UI normalizes display.

> **Technical note:** `ecsCompliant` flag on alerts in `processLogs()` mirrors same `@timestamp` / `event.kind` check used in Pipeline Health metrics. The validation endpoint (`POST /api/logs/validate`) is the gatekeeper. Events rejected here never increment `logsProcessed`, never appear in Live Feed, and never reach `processLogs()` on the detection engine. Analysts troubleshooting "missing" attacks should always ask whether validation failed before asking whether rules misfired. Geo enrichment via `lookupGeoIpBatch()` adds country and coordinates to external IPs after validation. These fields appear only in **LOG DETAIL**, not stream columns; pivot to the detail panel when building geographic narratives for incident reports. Simulated logs from `generateMaliciousLog()` carry `_simulated: true`, which propagates to alert objects and must be disclosed in compliance counts.
