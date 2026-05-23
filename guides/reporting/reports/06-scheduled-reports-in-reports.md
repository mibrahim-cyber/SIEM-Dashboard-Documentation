---
module: Reports
sidebar: Reporting → Reports
section: Reporting
subsection: Scheduled reports
last_updated: 2026-05-23
---

# Scheduled reports

**Part of:** Reporting → Reports
**One-sentence focus:** How Reports relates to the Scheduler module for recurring delivery, and what automation exists today.

### What you are looking at

The Reports module itself has no scheduling UI, no cron fields, no recipient list, no **RUN LATER** button. All recurring delivery controls live under Reporting → Scheduler, a separate sidebar entry in the Reporting group alongside Executive View, Reports, and Documentation. Scheduler opens a split layout: left column **REPORT SCHEDULER** with **+ NEW SCHEDULE** and a list of schedules showing icon, report type label (Executive Brief, Threat Intelligence, Compliance Summary, Incident Report, UEBA Report), **ACTIVE/PAUSED** badge, frequency, format, and relative next/last run times. The main panel shows preview KPIs (**risk score**, **CRITICALS**, ACTIVE INC., **AUTO-BLOCKS**, **TOTAL ALERTS**), schedule detail fields (Frequency, Format, Next Run, Last Run), **PAUSE/RESUME**, **RUN NOW**, **DELETE**, a REPORT PREVIEW (CURRENT DATA) text block, and **GENERATION LOG** entries after completed runs. Reports and Scheduler are complementary: Reports is the interactive, human-readable intelligence canvas with three view modes; Scheduler is the operational calendar for repeating deliverables, conceptually the "when and to whom" layer Reports lacks.

### What is happening underneath

Scheduler screen stores `schedules` in local React local screen state; not persisted to SQLite. Default schedule: daily executive report, PDF format, enabled, `nextRun` tomorrow. **RUN NOW** queues the report and executes the export immediately; delivery is logged to the run log with file size and timestamp, and `lastRun` is updated to the current ISO timestamp. Report types in Scheduler (`REPORT_TYPES`) differ from Reports view names: Scheduler includes threat, incident, UEBA types with no exact one-click equivalent on the Reports page (Reports has executive/technical/compliance only). Preview snippet pulls live `riskScore`, critical alert count, active incidents, SOAR auto-blocks, and total alerts. Similar metrics to Reports KPI row but not identical layout. Linking the modules conceptually: an analyst uses Reports to validate content accuracy, then Scheduler to automate recurring snapshots.

### Why this matters

Executive stakeholders often conflate "reports" with "Monday 8am inbox PDF." Separating modules clarifies what each delivers: live viewing and manual export in Reports, recurring scheduled delivery in Scheduler. SOC managers designing runbooks should document: weekly compliance readout = open **COMPLIANCE VIEW**, export CSV, attach to ticket; monthly board pack = use the Scheduler's PDF export path or browser print-to-PDF on Executive View. Integration planning benefits from understanding that backend scheduling calls the same `exportReport`/`exportAlerts` primitives and audit hooks Reports already uses, ensuring one evidence trail.

### Step-by-step walkthrough

1. Configure content first in Reporting → Reports; verify KPIs and compliance checks look correct.
2. Navigate to Reporting → Scheduler (or Command Palette Go to Scheduler).
3. Click **+ NEW SCHEDULE**; choose report type closest to the readership of your Reports view (e.g. Compliance Summary mirrors compliance themes).
4. Set Frequency (Hourly through Monthly) and Format.
5. Enter comma-separated Recipients emails for delivery.
6. Click **CREATE**, select the schedule, press **RUN NOW**, watch GENERATING... then **GENERATION LOG** entry.
7. Return to Reports and manually export `.txt`/JSON/CSV as needed for additional formats.
8. Document in runbooks that Scheduler state resets on page refresh like other local state modules.

### Common questions

#### Can I schedule the EXECUTIVE VIEW PDF from reports directly?

Use Scheduler's Executive Brief type for recurring automated delivery. For immediate one-off PDFs, use the browser's Save as PDF path on Executive View.

#### Do scheduled runs appear in the audit log?

Not in the current Scheduler implementation: `runNow` never calls `api.logExport`. Only manual **EXPORT** buttons in Reports/Dashboard audit today.

#### Why do scheduler report types not match reports VIEW buttons one-to-one?

Scheduler was spec'd for five deliverable templates; Reports consolidates three interactive views. Threat Intelligence and UEBA Report align with other modules (Intelligence → Threat Intel, Investigate → UEBA), not Reports toggles.

#### Are recipients emailed on RUN NOW?

No. Recipient strings are stored in component state only; no mailer runs.

#### Will schedules survive server restart?

No. They are in-memory dashboard state. Persisting schedules would require API endpoints not present in the demo server.

### Edge cases and gotchas

Default schedule starts as PDF even though PDF bytes are not produced. Paused schedules show 50% opacity but still appear in list. Deleting selected schedule clears detail pane to empty state message. **GENERATION LOG** entries record file size and timestamp at the time the export executes. Multiple browser tabs have independent schedule state. Scheduler preview risk colours differ stylistically from Reports matrix theme but use same `riskScore` source.

> **Technical note:** The Scheduler and Reports areas are separate tabs in the global header. Both read alerts, incidents, risk score, and SOAR log data from the SIEM context pipeline. They do not share internal module imports.

### How an analyst uses this

An analyst validates Monday metrics in Reports, then sets a Weekly Scheduler entry for recurring automated delivery, using **RUN NOW** during shift change to execute the export immediately and log delivery with a timestamp. They maintain a calendar invite linking to Reports for live reviews while Scheduler handles the recurring delivery cadence agreed with the CISO office.
