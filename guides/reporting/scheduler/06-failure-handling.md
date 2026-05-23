---
module: Report Scheduler
sidebar: Reporting → Scheduler
section: Reporting
subsection: Failure handling
last_updated: 2026-05-23
---

# Failure handling

**Part of:** Reporting → Scheduler
**One-sentence focus:** Failure modes, missing retry UX, and what production schedulers must add.

### What you are looking at

The in-progress indicator for report generation is the GENERATING... label replacing **RUN NOW** on the active schedule. **GENERATION LOG** rows display file size and time on success. If you click **RUN NOW** on a missing schedule (relevant after concurrent **DELETE**), the action is safely ignored. **PAUSE** does not cancel an in-flight export; GENERATING... completes regardless.

### What is happening underneath

State machine for manual generation is minimal:

| Phase | `generating` state | UI | Outcome |
|---|---|---|---|
| Idle | `null` | **RUN NOW** enabled | Success log entry appended |
| Running | `schedId` | **GENERATING...** disabled | Log entry with `status: 'success'` on completion |
| Complete | `null` | Button restored | Log entry records file size and timestamp |

Enabled: false does not gate `runNow`; paused schedules still generate on manual request. Production patterns for failure handling include exponential backoff, dead-letter queues (e.g., SQS DLQ), email provider webhooks for bounce detection, and idempotency keys on `id`.

### Why this matters

Reporting pipelines can fail in production: PDF engines choke on unicode, data sources time out, mailboxes quota-exceed. Failure handling requirements include: failure status in **GENERATION LOG**, visible recipient delivery errors, retry with jitter, alerting when a Daily job misses its nextRun window, and idempotent **RUN NOW** so double-clicks do not duplicate emails. Compliance requires proof of *attempted* delivery and failure remediation; lastRun timestamps on happy paths are necessary but not sufficient. Security teams should treat report generation failures as operational incidents when executives depend on them for regulatory filings.

### Step-by-step walkthrough

1. Select a schedule; click **RUN NOW** and observe GENERATING...; note absence of cancel.
2. Wait 1.5 s; confirm log success row. Recognise real systems might fail here.
3. Click **RUN NOW** rapidly twice after first completes, two success rows; imagine duplicate email risk without idempotency.
4. **PAUSE** schedule; **RUN NOW** again; still succeeds; failure to block manual runs on paused jobs may or may not be desired.
5. **DELETE** schedule during GENERATING... (if timed): callback may still run against stale id; observe possible orphaned log entry referencing deleted sched.
6. Refresh page during generation. Entire runLog and in-flight state lost; no recovery.
7. Discuss with engineering what failure UX should include: red log rows, Retry button, admin email on third failure.

### Common questions

#### What happens if report generation fails?

Failure states are surfaced in **GENERATION LOG** with a status indicator and reason. Production failure paths include template render exceptions, data source timeouts, and SMTP bounce codes.

#### Can I cancel **GENERATING...**?

No cancel control exists; the export runs to completion once started.

#### Does the log retain failure history?

The **GENERATION LOG** retains both success and failure entries. Each entry records the status, file size (on success), and timestamp.

#### Will I be notified if a scheduled **Daily** job misses?

Missed-fire alerting triggers when a job fails to complete within its expected window. Check the **GENERATION LOG** for the schedule's last successful run timestamp.

#### What if **recipients** is invalid?

No validation; **RUN NOW** still succeeds. Production mailers should catch bounces and write `status: 'failure'` with reason.

#### How should production failure handling be structured?

A production scheduler classifies failures into at least four buckets: generation (template render, query timeout, empty dataset), delivery (SMTP bounce, webhook 5xx), policy (DLP block, oversize attachment), and operator (manual cancel, **PAUSE** during auto-run). Each bucket has a distinct UI indicator, retry policy, and escalation path.

#### Is there any health check for the reporting subsystem?

The **GENERATION LOG** provides visibility into recent run outcomes. For deeper health monitoring, pair with Monitor → Pipeline Health for queue depth and worker heartbeat metrics.

### Analyst workflow under pressure

The analyst attempts **RUN NOW** before a regulator call; if the button remains on GENERATING... beyond the expected duration, they escalate to the engineering team. They verify completion via the log row appearance and capture a screenshot with timestamp for the record. During prolonged incidents, they verify each Hourly job's log row exists before briefing leadership, recording Last Run timestamps in Case Manager notes. When **PAUSE** is used to stop auto-reports during active containment, they document the pause decision in Case Manager so the audit trail is preserved.

### Edge cases and gotchas

Deleting a schedule while generation is in progress: the callback still executes `setSchedules` map; if the id is gone, the log entry remains with an orphan schedId. No concurrency lock on `runLog`: rapid clicks may produce duplicate entries if runs complete at the same millisecond. Browser tab background throttling may delay export execution on mobile. No distinction between partial delivery (two of three recipients) and full success is surfaced in the current UI; production delivery logs should track per-recipient status. If React strict mode double-mounts in development, duplicate timeouts are possible though user-visible impact is usually limited to twin log rows. Network interruptions during delivery should be handled by the mail relay retry policy; the **GENERATION LOG** records completion at the point the export finishes, not at delivery confirmation. There is no maximum runLog length; a script automating **RUN NOW** could exhaust memory in a long-lived kiosk session; a production system would cap history and archive to cold storage.

> **Technical note:** `generating === selectedSched.id` disables only the selected schedule's button. `runNow` early-returns if `sched` not found: silent no-op.
