---
module: Pipeline Health
sidebar: Monitor → Pipeline Health
section: Monitor
subsection: Parser error detailed
last_updated: 2026-05-23
---

# Parser error detailed

**Part of:** Monitor → Pipeline Health
**One-sentence focus:** Failed validation never reaches the buffer. ECS compliance percentage and ingest UI errors are the analyst-visible parse-failure proxies.

### What you are looking at

No dedicated "parse error counter" panel, proxy signals: **ECS COMPLIANT** percentage drop, missing rows in Live Feed after ingest attempt, server validation error toasts/messages in Log Ingestion UI (not Pipeline Health directly). Click Normalization stage shows ECS compliance line when selected. Parser failure is a mail sorting machine jamming on oversized parcels, items bounce back or never reach the delivery tray (detection engine).

### What is happening underneath

`api.validateLogs()` rejects malformed batches; log processing catches error, logs console `[siem] log validation failed`, returns empty array; no buffer append, EPS unchanged. ECS check counts logs with `@timestamp` or `event.kind` in buffer; logs missing both lower compliance score. log parsing layer and server validate module define acceptable shapes.

### Why this matters

Silent parse loss creates false negative security posture, rules never see events. Diagnosis without developer skills requires readable indicators (compliance %, ingest error messages).

### Step-by-step walkthrough

1. Note baseline ECS % with clean ingest.
2. Submit intentionally bad JSON via Log Ingestion; missing timestamp.
3. Observe validation failure message in ingest UI.
4. Return Pipeline Health: ECS may drop if partial bad events entered buffer earlier.
5. Click Normalization; read ECS Compliance line.
6. Fix schema, re-ingest; watch ECS recover.
7. Verify detection fires on fixed events.

### Common questions

#### Where do parse errors log?

Browser console server error; server logs on Node; not aggregated in Pipeline UI.

#### Can I see rejected line text?

Ingest UI typically shows validation response; keep copy for ticket.

#### Does low ECS always mean attacks missed?

Often yes for missing timestamps; rules may skip or mis-window events.

#### Who fixes parsers?

Developer edits parsers/validate rules, analyst provides sample failing line.

### Analyst workflow under pressure

If expected attack logs absent, check ECS and ingest errors before assuming clean traffic.

### Edge cases and gotchas

Empty buffer shows 100% ECS; misleading green field. Simulated logs usually ECS-compliant by generator design.

> **Technical note:** Read `docs/06-log-ingestion/09-sanitize-pipeline.md` for validation field whitelist details. When `api.validateLogs()` rejects a batch, log processing logs `[siem] log validation failed` to console and returns empty; no buffer append, EPS unchanged. ECS compliance counts logs in `rawLogs` possessing `@timestamp` or `event.kind`. Empty buffer shows 100% ECS vacuously; always ingest a known-good sample before trusting compliance green. Analyst escalation path: capture failing line from Log Ingestion UI error message, attach to engineering ticket, reference validation whitelist in backend documentation. Re-ingest fixed schema and watch ECS recover on Pipeline Health Normalization stage click-through.
