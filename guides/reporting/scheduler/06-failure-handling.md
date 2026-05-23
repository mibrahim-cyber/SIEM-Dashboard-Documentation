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

Failure is almost invisible in **REPORT SCHEDULER** by design of the demo. The only in-progress indicator is the GENERATING... label replacing **RUN NOW** on the active schedule, no spinner on the list row, no global banner, no progress percentage. **GENERATION LOG** rows always show green size and time text implying success; there is no red failed badge, retry button, or error message panel. If you click **RUN NOW** on a missing schedule (impossible in normal UI but relevant after concurrent **DELETE**), nothing appears; no toast. **PAUSE** does not cancel an in-flight timeout; GENERATING... completes regardless. Operators accustomed to SOAR IP_LOOKUP_ERROR orange entries or Alert Manager failure states will notice the optimism gap immediately.

### What is happening underneath

State machine for manual generation is minimal:

| Phase | `generating` state | UI | Outcome |
|---|---|---|---|
| Idle | `null` | **RUN NOW** enabled | Success log entry appended |
| Running | `schedId` | **GENERATING...** disabled | Log entry always `status: 'success'` |
| Complete | `null` | Button restored | Log entry always `status: 'success'` |

No `try/catch`, no `catch` branch setting `status: 'failure'`, no exponential backoff, no dead-letter queue. The `setTimeout` callback unconditionally succeeds after 1500 ms: it never simulates timeout, disk full, template render exception, or SMTP 550 bounce. Enabled: false does not gate `runNow`. paused schedules still generate. Automatic scheduled runs do not exist, so there are no missed-fire alerts when the browser tab sleeps. React error boundaries are not schedule-specific; a component throw would blank the whole module, not log per-job failure. Compare to production patterns: Celery retries, SQS DLQ, email provider webhooks, and idempotency keys on id.

### Why this matters

Reporting pipelines fail silently in real life, PDF engines choke on unicode, data sources time out, mailboxes quota-exceed. A demo that only shows success trains false confidence. Documenting the gap sets correct expectations for pilots and defines acceptance criteria for v2: failure status in **GENERATION LOG**, visible recipients delivery errors, retry with jitter, alerting when Daily job misses nextRun window, and idempotent **RUN NOW** so double-clicks do not duplicate emails. Compliance requires proof of *attempted* delivery and failure remediation; not merely lastRun timestamps on happy paths. Security teams should treat report generation failures as operational incidents when executives depend on them for regulatory filings.

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

In the demo, it cannot fail, the timeout always writes success. Production must implement error paths and surface them in **GENERATION LOG**.

#### Can I cancel **GENERATING...**?

No cancel control exists; the 1500 ms timeout always completes.

#### Does the log retain failure history?

Only success entries exist. Failed runs are not modelled.

#### Will I be notified if a scheduled **Daily** job misses?

No background scheduler and no alerting exist. NextRun is display-only.

#### What if **recipients** is invalid?

No validation; **RUN NOW** still succeeds. Production mailers should catch bounces and write `status: 'failure'` with reason.

#### How should production failure handling differ from this demo?

A production scheduler should classify failures into at least four buckets: generation (template render, query timeout, empty dataset), delivery (SMTP bounce, webhook 5xx), policy (DLP block, oversize attachment), and operator (manual cancel, **PAUSE** during auto-run). Each bucket needs distinct UI colour, retry policy, and escalation path. The demo collapses all of that into a single green success row: useful for layout prototyping, dangerous if mistaken for finished software.

#### Is there any health check for the reporting subsystem?

No. Unlike Monitor → Pipeline Health, **REPORT SCHEDULER** exposes no queue depth, worker heartbeat, or last-error banner. Operators infer health only by clicking **RUN NOW** and hoping a log line appears.

### Analyst workflow under pressure

The analyst attempts **RUN NOW** before a regulator call, if the button stuck on GENERATING... beyond expected duration (here 1.5 s; production longer), they would escalate. Today they verify completion via log row appearance. They do not rely on **GENERATION LOG** as legal proof because refresh clears it, they capture screenshot with timestamp. They report to engineering that failure visibility is a blocker before go-live, citing missing red states and recipients delivery confirmation. During prolonged incidents, they maintain a manual checklist parallel to the scheduler: if automated Hourly jobs were real, they would verify each hour's log row exists before briefing leadership; in the demo they simulate that discipline by recording Last Run timestamps in Case Manager notes. When **PAUSE** is used to stop misleading auto-reports, they document the pause decision externally because the UI offers no audit trail that survives refresh.

### Edge cases and gotchas

Deleting schedule while timeout pending: callback still executes `setSchedules` map; harmless if id gone, but log entry remains with orphan schedId. No concurrency lock on `runLog`: theoretically rapid clicks after 1500 ms duplicate entries. Browser tab background throttling may delay `setTimeout` on mobile. GENERATING... hangs longer without indicating why. No distinction between partial delivery (two of three recipients) and full success. Extending demo with random failure would require UI colour change currently hard-coded green `#30d158`. If React strict mode double-mounts in development, duplicate timeouts are possible though user-visible impact is usually limited to twin log rows. Network loss does not affect generation because no network call occurs, trainees may incorrectly assume a cloud dependency. There is no maximum runLog length; a script automating **RUN NOW** could exhaust memory in a long-lived kiosk session; a production system would cap history and archive to cold storage.

> **Technical note:** `generating === selectedSched.id` disables only the selected schedule's button. `runNow` early-returns if `sched` not found: silent no-op.
