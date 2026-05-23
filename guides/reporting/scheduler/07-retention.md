---
module: Report Scheduler
sidebar: Reporting → Scheduler
section: Reporting
subsection: Retention policy
last_updated: 2026-05-23
---

# Retention policy

**Part of:** Reporting → Scheduler
**One-sentence focus:** Why all schedule and run-log state disappears on browser refresh.

### What you are looking at

Everything you configure in **REPORT SCHEDULER** lives for the browser session only. Create schedules, pause them, accumulate **GENERATION LOG** rows, and **RUN NOW** timestamps, then refresh the page or close the tab. On return, you see a single default Executive Brief (Daily, **PDF**, **ACTIVE**) as if you never visited. **GENERATION LOG** is empty; Last Run reset to Never. No export, import, backup, or "restore defaults" control appears in the UI. Multiple analysts opening the same dashboard instance on different workstations see unrelated schedule lists, there is no shared server-side schedule registry. Contrast with Respond → Case Manager or persisted alerts in SQLite via API: Scheduler is ephemeral presentation-layer state.

### What is happening underneath

React local screen state hooks hold all durable-for-session data:

- `schedules`, array of schedule records; initial `[defaultSchedule()]`.
- `selected`; selected schedule id or `null`.
- `showNew`; modal visibility boolean.
- `draft`; form state for **NEW REPORT SCHEDULE**; reset via `defaultSchedule()` on save/cancel.
- `runLog`, array of generation entries; never written to `localStorage`, `sessionStorage`, IndexedDB, or backend API.
- `generating`; transient id during simulated run.

`save()` appends to `schedules` in memory. `toggle()` and `remove()` mutate the array. `runNow()` updates lastRun in memory and prepends runLog. `the SIEM context pipeline` provides SIEM telemetry (alerts, incidents, riskScore, soarLog) which *does* persist server-side for alerts: but Scheduler does not attach schedule metadata to those persistence paths. Component unmount remount loses state unless lifted to context or external store. Hard refresh, navigation away, or browser crash equals total schedule configuration loss.

### Why this matters

Operational schedules encode compliance commitments. "monthly SOC 2 evidence pack to auditors." Ephemeral storage makes Scheduler a teaching sandbox, not a system of record. Organisations must not treat demo configuration as authoritative until backed by database tables (`schedules`, `report_runs`, `delivery_attempts`) with retention policies matching legal hold and GDPR erasure requests. Incident response after browser refresh: analysts cannot prove they paused executive reports during breach, reconstruction from memory fails audits. Capacity planning for report storage (S3 lifecycle, seven-year FINRA retention) starts with knowing output objects persist separately from schedule definitions. Understanding retention boundaries guides integration design: persist id, recipients, cron mapping, and enabled in Postgres; store PDF artefacts in object storage with WORM locks; log **GENERATION LOG** equivalents immutably.

### Step-by-step walkthrough

1. Create three schedules with varied types; run **RUN NOW** on each; confirm **GENERATION LOG** has three rows.
2. Hard refresh the browser (Ctrl+F5).
3. Re-open Reporting → Scheduler; only one default Executive Brief remains; log empty.
4. Compare with Monitor → Alert Manager: alerts persist across refresh (server-backed). highlighting Scheduler gap.
5. Document for stakeholders: "Schedule definitions must be re-entered or exported before session end in demo build."
6. For production planning, sketch schema: `schedules` table mirroring eight fields plus `created_by`, `updated_at`.
7. Define retention: configuration indefinite until deleted; artefacts 90 days; audit log 7 years, policy not enforced here.

### Common questions

#### Do schedules save automatically?

No. No autosave, debounce, or API persistence exists in Scheduler screen.

#### Can I export my **GENERATION LOG**?

No export button. Screenshot or copy-paste before refresh is the only option.

#### Will schedules sync across team members?

No. Each browser session is isolated. Shared persistence requires backend implementation.

#### Is **recipients** data retained anywhere after refresh?

Lost with the schedule object unless copied externally; PII handling benefit in demo, operational gap in production.

#### Does **DELETE** differ from refresh for retention?

**DELETE** removes one schedule immediately from memory. Refresh wipes all schedules and logs.

#### Where should production schedules live?

Best practice: a relational table or configuration service owned by the reporting microservice, with version history (who changed recipients, when enabled flipped). Artefacts (PDF blobs) belong in object storage with lifecycle rules separate from schedule metadata. The demo intentionally colocates both concepts in dashboard state to keep Module 25 self-contained for training.

#### How does retention interact with compliance frameworks?

SOC 2 and ISO 27001 expect evidence that monitoring and reporting controls operated continuously. Ephemeral schedules cannot prove control operation across audit periods. Auditors will ask for ticket exports, SMTP logs, or S3 keys: not screenshots of **GENERATION LOG**. Treat this module's retention model as explicitly non-compliant until persistence ships.

### Using this view during live response

Before shift handover, the outgoing analyst copies active schedule configurations (types, frequencies, recipients) into the case ticket or runbook. Knowing refresh destroys them. Incoming analyst rebuilds critical On Demand Incident Report entries rather than trusting empty UI. Leadership is briefed that demo **GENERATION LOG** is not auditable history; SOAR Audit Log and Case Manager notes hold durable timestamps instead. If the war room runs multiple days, the analyst re-enters standing schedules each morning, a friction that reinforces why production persistence is mandatory. They avoid storing recipients lists in chat tools without redaction; copy only what the ticket needs.

### Edge cases and gotchas

Opening Scheduler in two tabs yields independent state; edits diverge without warning. `defaultSchedule()` on initial load always seeds one schedule: you never see truly empty state. Navigating sidebar away unmounts component; returning remounts fresh defaults. Same data loss as refresh. Private browsing amplifies ephemerality. Future persistence must migrate UUID ids carefully to avoid duplicate cron jobs on deploy day. RunLog unbounded growth only matters within long-lived SPA sessions without refresh, memory leak class issue for always-on NOC wallboards. Browser back-forward cache may resurrect an older in-memory React tree briefly on some browsers; do not rely on it for recovery. Clearing site data in browser settings wipes any future localStorage extension unless schedules are server-authoritative. Upgrading the SPA bundle during an open session may hot-reload and reset state depending on dev-server versus production deploy mechanics.

> **Technical note:** No `useEffect` hydration from API on mount. Extending persistence: call `api.saveSchedule` in `save`, `toggle`, `remove`, and `runNow`; load in `useEffect(() => fetchSchedules(), [])`; mirror **GENERATION LOG** to `report_runs` table with foreign key **schedId**.
