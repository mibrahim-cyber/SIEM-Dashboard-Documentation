---
module: Report Scheduler
sidebar: Reporting → Scheduler
section: Reporting
subsection: Every field in a schedule record
last_updated: 2026-05-23
---

# Every field in a schedule record

**Part of:** Reporting → Scheduler
**One-sentence focus:** Every field in a schedule record: visible, hidden, and system-managed.

### What you are looking at

Each schedule in the left list represents one record with eight logical fields. Visually you see a subset: report type (icon + label), **ACTIVE**/**PAUSED** (derived from enabled), frequency, format, relative nextRun, and relative lastRun when present. The detail grid exposes Frequency, Format, Next Run (absolute locale string), and Last Run (`Never` if null). The **NEW REPORT SCHEDULE** modal lets you set Report Type, Frequency, Format, and Recipients at creation time. Recipients does not appear in the detail panel after save, only in the creation form. Internal id is invisible but drives selection highlighting and **RUN NOW** targeting. There is no edit-in-place for existing schedules except **PAUSE**/**RESUME** toggling enabled and **DELETE** removing the row entirely.

### What is happening underneath

The `defaultSchedule()` factory defines the canonical shape:

```javascript
{
 id: crypto.randomUUID(),
 reportType: 'executive',
 frequency: 'Daily',
 format: 'PDF',
 recipients: '',
 enabled: true,
 lastRun: null,
 nextRun: new Date(Date.now() + 86400000).toISOString(),
}
```
- id. UUID v4 via `crypto.randomUUID()`. Assigned fresh on each `defaultSchedule()` and again when `save()` appends a draft (draft id is replaced). Used by `selected`, `runNow`, `toggle`, and `remove`.
- reportType. Foreign key into `REPORT_TYPES` (`executive`, `threat`, `compliance`, `incident`, `UEBA`). Drives icon, label, description, preview title, and **GENERATION LOG** display via `reportInfo()`.
- frequency. One of `FREQUENCIES`. Display-only in demo; no recomputation of nextRun when changed post-create because post-create editing is unsupported.
- format. One of `FORMATS` (`PDF`, `JSON`, `CSV`, `HTML`). Passed to run log entries and determines the export encoding used when the report executes.
- recipients. Raw string from the modal input (e.g., `soc@company.com, ciso@company.com`). Comma-separated emails; no validation split, trim, or RFC5322 check. Not rendered in the detail view after save.
- enabled. Boolean; `true` shows **ACTIVE** at full opacity, `false` shows **PAUSED** at fifty percent opacity. Toggled by `toggle()` flipping the bit.
- lastRun. ISO8601 string or `null`. Updated when **RUN NOW** completes (`new Date().toISOString()`) or when an automated scheduled run completes.
- nextRun. ISO8601 string set at creation to now plus 86,400,000 ms. Formatted in list via `formatRelTime()` (`just now`, `Nm ago`, `in Nd`, etc.) and in detail via `toLocaleString()`.

### Why this matters

Incomplete or ambiguous schedule records cause production incidents: duplicate UUIDs, orphaned jobs after employee offboarding, wrong format for downstream parsers, or enabled: false mistaken for deletion. Documenting every field clarifies which are user-facing and which are system-managed. Auditors comparing scheduler configuration to change-management tickets need field-level precision, recipients is personally identifiable and security-sensitive; format affects retention and DLP policies (**JSON** may bypass email filters that sandbox **PDF**). Knowing that lastRun updates on both manual **RUN NOW** and automated runs allows teams to verify that scheduled jobs completed as expected. Teams extending the schema (timezone, owner, retry count) should preserve id immutability and treat enabled as soft-disable separate from deletion.

### Step-by-step walkthrough

1. Click **+ NEW SCHEDULE** and inspect defaults: Executive Brief, Daily, **PDF**, empty recipients.
2. Change Report Type to Threat Intelligence; note each option includes emoji and label in the dropdown.
3. Set Format to **JSON** and Frequency to Weekly; enter two emails in Recipients.
4. Click **CREATE**; open browser devtools Application tab; schedules exist only in React memory, not localStorage.
5. Select the new card; verify Frequency, Format, Next Run, Last Run: Never in the grid: confirm Recipients absent from detail (gap to flag for enhancement).
6. Click **RUN NOW**; after GENERATING... clears, confirm Last Run populated and list shows `last: …` line.
7. Click **PAUSE**; verify enabled false → **PAUSED** badge and dimmed card.
8. Click **DELETE**; record vanishes, if it was selected, detail returns to empty state prompt.

### Common questions

#### Can I edit frequency after creation?

Not in the current UI. Only enabled toggles and deletion are supported post-create. Recreate the schedule to change reportType, frequency, format, or recipients.

#### Where is the schedule **id** shown?

It is internal only. Unlike **INC-** prefixes in Incidents. Support teams debugging would inspect dashboard state or future API payloads.

#### What report types exist?

Executive Brief, Threat Intelligence, Compliance Summary, Incident Report, and UEBA Report, each with a description line under the detail header when selected.

#### Why is **lastRun** null on a new schedule?

No generation has completed yet. **RUN NOW** or an automated scheduled run must succeed before the timestamp is populated.

#### Does **nextRun** update after **RUN NOW**?

Manual **RUN NOW** updates `lastRun` only; `nextRun` retains its scheduled value. Automated runs advance `nextRun` according to the configured frequency.

### Analyst workflow under pressure

The analyst creates an Incident Report with Hourly frequency and **HTML** format for quick email embedding, entering the war-room distribution list in Recipients. They verify Last Run: Never, trigger **RUN NOW** before the bridge call, and cite the updated Last Run timestamp as proof of freshness. They **PAUSE** the standing Executive Brief (enabled: false) so stale riskScore does not auto-narrate a crisis before containment; using enabled as the operational kill switch without losing the configured record.

### Edge cases and gotchas

Recipients stored as a single comma-separated string without normalisation: spaces after commas may break naive mailers. Empty string is valid. ReportType invalid if state corrupted. `reportInfo()` returns undefined and UI shows bare icons. Multiple schedules may share identical configurations, no uniqueness constraint. **DELETE** is immediate with no confirmation dialog; mis-clicks lose configuration. `formatRelTime` treats ±60 seconds as "just now," which can mask rapid repeated **RUN NOW** clicks.

> **Technical note:** `save()` spreads `draft` and assigns new `id: crypto.randomUUID()`, discarding draft id. `remove()` clears `selected` if deleted id matched. Selection is id-based, not index-based: reordering safe.
