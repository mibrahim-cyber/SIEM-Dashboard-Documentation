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

Delivery intent appears in two places: the Recipients (comma-separated emails) input inside **NEW REPORT SCHEDULE**, and the manual **RUN NOW** button on the detail toolbar. There is no "Send Test Email," attachment viewer, or SMTP status indicator. When generation completes, **GENERATION LOG** lists synthetic success rows, report icon, label, format, green `{size} · {time}`, without recipient addresses or message IDs. The GENERATING... button state blocks double-clicks on the same schedule during the simulated one-and-a-half-second render. **PAUSE** does not appear to affect **RUN NOW**, you can manually generate while **PAUSED**, because pausing is meant to inhibit automatic future runs, not manual overrides. No row in the UI confirms "delivered to soc@company.com" because the demo never reads recipients after save.

### What is happening underneath

The `runNow(schedId)` function implements simulated delivery:

1. Resolve schedule by id; return if missing.
2. `setGenerating(schedId)`; disables **RUN NOW** for that id only.
3. `setTimeout` 1500 ms later:
 - Build `entry`: `{ id: UUID, schedId, reportType, format, ts: Date.now(), status: 'success', size: random 50–250 KB string }`.
 - Prepend `entry` to `runLog` state (newest first).
 - Map-update matching schedule's lastRun to `new Date().toISOString()`.
 - `setGenerating(null)` re-enables the button.

Recipients is captured in `draft` on modal submit and stored on the schedule object but never referenced in `runNow`, email API calls, or detail render: a deliberate demo gap. No blob download, base64 PDF, or JSON file is produced; size is `Math.random()` theatre. Status is always `'success'`. no `'failure'`, `'partial'`, or `'queued'`. Multiple schedules may run sequentially if clicked in quick succession on different ids; same-id runs queue visually via GENERATING... but could race if timeout overlap were shortened. Context data (`alerts`, `incidents`, etc.) is read for preview only, not serialised into the log entry payload.

### Why this matters

Scheduled reporting value chain ends at delivery: generation without distribution is an orphan PDF on disk. Stakeholders measure success by inbox arrival, not by internal job completion. Explicitly documenting that recipients is inert in the demo prevents false demos to the board ("yes, the CISO received it"). Engineers scoping production work see the missing pieces: SMTP or webhook integration, bounce handling, attachment size limits, encryption (TLS, S/MIME), and audit logging of recipient lists for data-minimisation compliance. **RUN NOW** models operational override, legal counsel requests immediate export, or weekly job failed and must be re-fired; distinct from cron. Teaching that **PAUSED** schedules can still **RUN NOW** matches enterprise patterns where "disabled" nightly jobs allow daytime manual pulls without re-enabling automation.

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

Nobody in the demo. Recipients is stored but unused. Production must wire `runNow` to a mailer reading that field.

#### What file format is actually generated?

None physically. Format affects log labelling only; no PDF binary, JSON file, CSV, or HTML is created or downloadable.

#### Why does the log show file size?

Simulated verisimilitude: `(Math.random() * 200 + 50).toFixed(0) + 'KB'`. Real systems would stat output object storage keys.

#### Can I run two reports at once?

Yes, on different schedules: each tracks its own `generating` id. Same schedule is button-disabled until its timeout completes.

#### Does delivery deduplicate recipients?

No parsing occurs. `"a@x.com, a@x.com"` would be stored verbatim; production should normalise.

### Using this view during live response

Minutes before an executive call, the analyst selects Incident Report, confirms Recipients were set at creation to the bridge alias, and hits **RUN NOW**. They verbally tell leadership "report generated at {Last Run time}" using the dashboard as choreographer even without email. Then paste **REPORT PREVIEW** metrics into the bridge chat manually. Post-incident, they request engineering wire recipients to SES or Exchange so **GENERATION LOG** entries correlate with message traces.

### Edge cases and gotchas

Empty recipients still allows **RUN NOW** success, silent failure in production if not validated at **CREATE**. Log entries omit schedId in UI; multiple schedules of same type indistinguishable except by format/size/time. Refresh clears **GENERATION LOG** entirely: no proof of delivery after reload. Random sizes differ on each run despite identical content. Do not use for capacity planning. GENERATING... on one schedule does not block others, parallel manual runs may overwhelm a real backend if ported naively.

> **Technical note:** `runLog` entries use `status: 'success'` exclusively. `setRunLog((prev) => [entry,...prev])` prepends; no pagination or cap; long sessions grow unbounded in memory.
