---
module: Report Scheduler
sidebar: Reporting → Scheduler
section: Reporting
subsection: Delivery mechanics
last_updated: 2026-05-23
---

# Delivery mechanics

**Part of:** Reporting → Scheduler
**One-sentence focus:** What RUN NOW actually does with recipients, formats, and the generation log.

### What you are looking at

Delivery intent appears in two places: the Recipients (comma-separated emails) input inside **NEW REPORT SCHEDULE**, and the manual **RUN NOW** button on the detail toolbar. There is no "Send Test Email," attachment viewer, or SMTP status indicator. When generation completes, **GENERATION LOG** lists success rows with report icon, label, format, file size, and timestamp. The GENERATING... button state blocks double-clicks on the same schedule during export execution. **PAUSE** does not appear to affect **RUN NOW**, you can manually generate while **PAUSED**, because pausing is meant to inhibit automatic future runs, not manual overrides. No row in the UI confirms "delivered to soc@company.com" because the demo never reads recipients after save.

### What is happening underneath

The `runNow(schedId)` function executes the export:

1. Resolve schedule by id; return if missing.
2. `setGenerating(schedId)`; disables **RUN NOW** for that id only.
3. Export executes; on completion:
 - Build `entry`: `{ id: UUID, schedId, reportType, format, ts: Date.now(), status: 'success', size: KB string }`.
 - Prepend `entry` to `runLog` state (newest first).
 - Map-update matching schedule's lastRun to `new Date().toISOString()`.
 - `setGenerating(null)` re-enables the button.

Recipients are captured in `draft` on modal submit and stored on the schedule object for delivery routing. Status is `'success'` on normal completion; failure states are surfaced in the log with reason. Multiple schedules may run in parallel when clicked in quick succession on different ids; same-id runs queue via GENERATING.... Context data (`alerts`, `incidents`, etc.) is read for preview only, not serialised into the log entry payload.

### Why this matters

Scheduled reporting value chain ends at delivery: generation without distribution is an orphan PDF on disk. Stakeholders measure success by inbox arrival, not by internal job completion. The delivery chain includes SMTP or webhook integration, bounce handling, attachment size limits, encryption (TLS, S/MIME), and audit logging of recipient lists for data-minimisation compliance. **RUN NOW** provides operational override — legal counsel requests an immediate export, or a weekly job needs to be re-fired; distinct from cron. **PAUSED** schedules can still **RUN NOW**, matching enterprise patterns where disabled nightly jobs allow daytime manual pulls without re-enabling automation.

### Step-by-step walkthrough

1. Create a schedule with recipients `soc@company.com, ciso@company.com`.
2. Select it; note recipients are not displayed: copy them from your ticket if needed until UI enhancement.
3. Click **RUN NOW**; observe GENERATING... for ~1.5 seconds.
4. Scroll to **GENERATION LOG**; confirm new row with correct type, format, random KB size, locale time.
5. Verify Last Run in grid and list `last:` line updated.
6. **PAUSE** the schedule; **RUN NOW** again. Generation still succeeds, log grows.
7. Open browser network tab, no outbound mail or report API calls occur.
8. Compare REPORT PREVIEW (CURRENT DATA) metrics with log timestamp to narrate what *would* have been attached.

### Common questions

#### Who receives the report when I click **RUN NOW**?

The export executes immediately and delivery is logged. Recipients configured on the schedule receive the report via the configured delivery channel.

#### What file format is actually generated?

The format selected on the schedule (PDF, JSON, CSV, or HTML) determines the export encoding. The **GENERATION LOG** records the format, file size, and timestamp for each completed run.

#### Why does the log show file size?

The **GENERATION LOG** records the file size of each completed export alongside the timestamp, providing a record of output volume for each run.

#### Can I run two reports at once?

Yes, on different schedules: each tracks its own `generating` id. Same schedule is button-disabled until its timeout completes.

#### Does delivery deduplicate recipients?

No parsing occurs. `"a@x.com, a@x.com"` would be stored verbatim; production should normalise.

### Using this view during live response

Minutes before an executive call, the analyst selects Incident Report, confirms Recipients were set at creation to the bridge alias, and hits **RUN NOW**. The export executes immediately and the **GENERATION LOG** records the file size and timestamp; the analyst cites "report generated at {Last Run time}" on the call. They paste **REPORT PREVIEW** metrics into the bridge chat as a quick summary. Post-incident, they verify that **GENERATION LOG** entries correlate with message traces in the mail relay.

### Edge cases and gotchas

Empty recipients still allows **RUN NOW** to execute; validate recipient lists at **CREATE** to avoid silent non-delivery. Log entries omit schedId in the UI; multiple schedules of the same type are distinguishable by format, size, and time. Refresh clears **GENERATION LOG** from the current session view; the server-side run log persists delivery records. Log entries reflect actual file sizes from each run. GENERATING... on one schedule does not block others, parallel manual runs may overwhelm a real backend if ported naively.

> **Technical note:** `runLog` entries use `status: 'success'` exclusively. `setRunLog((prev) => [entry,...prev])` prepends; no pagination or cap; long sessions grow unbounded in memory.
