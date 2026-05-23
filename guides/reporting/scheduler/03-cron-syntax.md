---
module: Report Scheduler
sidebar: Reporting → Scheduler
section: Reporting
subsection: Cron syntax explained
last_updated: 2026-05-23
---

# Cron syntax explained

**Part of:** Reporting → Scheduler
**One-sentence focus:** Plain-English frequency dropdowns versus cron expressions engineers deploy in production.

### What you are looking at

The **NEW REPORT SCHEDULE** modal exposes Frequency as a dropdown with five plain-English options: On Demand, Hourly, Daily, Weekly, and Monthly, not a text box for cron strings like `0 8 * * 1`. The schedule list echoes the chosen word beside format and next-run hint (`Daily · PDF · next: in 23h`). Detail metadata repeats Frequency as readable text. There is no advanced mode, no timezone picker, and no "custom cron" field anywhere in **REPORT SCHEDULER**. For stakeholders who have seen Linux crontabs or AWS EventBridge rules, this UI deliberately hides that complexity. For everyone else, the dropdown is the entire scheduling vocabulary. Behind the scenes, enterprise schedulers often *do* use cron, a compact five- or six-field formula meaning "run at these minutes, hours, days…" Understanding both layers matters: the dropdown is what analysts click; cron is what engineers often deploy in production to honour those clicks.

### What is happening underneath

In Scheduler screen, frequency is stored as a string literal matching one of `FREQUENCIES`; no parser converts it to cron, and no `setInterval` fires hourly jobs. The value is persisted only in dashboard state and rendered in list/detail views. If this dashboard were wired to a real job runner, each dropdown choice would map to a cron expression and timezone:

| UI Frequency | Typical cron equivalent | Plain meaning |
|---|---|---|
| **On Demand** | *(none; manual trigger only)* | Run only when an operator clicks **RUN NOW** |
| **Hourly** | `0 * * * *` | At minute zero of every hour |
| **Daily** | `0 8 * * *` | Every day at 08:00 (hour chosen by policy) |
| **Weekly** | `0 8 * * 1` | Every Monday at 08:00 |
| **Monthly** | `0 8 1 * *` | First day of each month at 08:00 |

Cron fields read left to right: minute (0–59), hour (0–23), day-of-month (1–31), month (1–12), day-of-week (0–7, Sunday = 0 or 7). An asterisk means "every." The demo hard-codes `nextRun` once at schedule creation and never recomputes it from frequency. So the UI teaches *intent* without executing the calendar math.

### Why this matters

Miscommunication between SOC analysts and platform engineers causes missed board packs and duplicate jobs. When a CISO says "send me a weekly report," engineers need unambiguous translation: which day, which hour, which timezone, daylight-saving behaviour, and what happens if the server was down at fire time. Plain dropdowns prevent syntax errors (`* * * * *` runs every minute, a classic foot-gun) but hide edge cases (monthly on the 31st skips shorter months). Teaching both representations lets non-technical readers trust the dropdown while technical readers implement reliable backends. Regulators asking "how often does the compliance report run?" receive answerable language from the UI; SREs retain cron for infrastructure-as-code. On Demand explicitly encodes that some reports must never auto-send; legal hold exports, breach post-mortems, or pre-audit snapshots triggered only by human approval.

### Step-by-step walkthrough

1. Open **+ NEW SCHEDULE** and read each Frequency option without selecting: note there is no cron text field.
2. Select Hourly and **CREATE**; observe list text `Hourly · …`. recognise this would mean `0 * * * *` in production.
3. Create another schedule with Weekly; discuss with your team which weekday and hour your real cron would use (the UI does not ask).
4. Select On Demand for sensitive Compliance Summary reports that should only run after GRC approval via **RUN NOW**.
5. Compare Next Run in detail view with wall-clock time, remember the demo does not advance `nextRun` from frequency.
6. Document your organisation's mapping table (dropdown → cron → timezone) in runbooks external to this UI.
7. For Monthly, confirm whether "first business day" or "calendar first" is required; the dropdown alone does not distinguish them; cron would need custom logic beyond `0 8 1 * *`.

### Common questions

#### What is cron in one sentence?

Cron is a standard timetable notation: five or six fields separated by spaces. That tells a computer when to start a recurring task, like "every weekday at 6 AM."

#### Why does the dashboard not show cron if production uses it?

The **REPORT SCHEDULER** targets operators who should not need to memorise field order. Engineers map dropdown values to cron in the deployment layer.

#### Does **Hourly** mean exactly on the hour?

In a real cron job, `0 * * * *` fires at:00 each hour. The demo does not auto-fire; the label describes intended production behaviour.

#### How is **On demand** different from pausing a schedule?

On Demand frequency means the job is designed for manual **RUN NOW** only. **PAUSE** temporarily disables any frequency, including Daily; without deleting the schedule. A Daily schedule that is **PAUSED** will not run until **RESUME**.

#### What timezone applies?

The demo uses the browser's locale for `toLocaleString()` on Next Run and Last Run. Production must pin a timezone (e.g., `America/New_York`) in the scheduler service, not the analyst's laptop.

### Operational use during containment

When crisis communications require hourly situational updates, the lead creates an Incident Report schedule set to Hourly: knowing production would translate that to `0 * * * *`. but uses **RUN NOW** for each manual briefing because the demo lacks auto-fire. They avoid Daily schedules that would snapshot stale metrics mid-incident. After stabilisation, they switch to Weekly for standing executive briefs and document the agreed Monday 08:00 cron mapping for the platform team implementing real delivery.

### Edge cases and gotchas

Weekly in cron defaults to one weekday unless engineers parameterise, analysts may assume "weekly" means "every seven days from creation," which differs from "every Monday." Monthly on the 1st skips months when the job must run "last business day." Daylight saving shifts can double-fire or skip an hour if timezone rules are ignored. The demo's `nextRun` is always creation-time plus twenty-four hours regardless of Hourly or Weekly selection; a visible mismatch useful when training staff that UI labels are aspirational until backend wiring exists. There is no "every 15 minutes" option; sub-hourly cadence requires custom cron (`*/15 * * * *`) outside this UI.

> **Technical note:** Cron uses five fields in Unix (`minute hour dom month dow`); some platforms add seconds. The demo's `FREQUENCIES` array is order-sensitive for dropdown rendering only: no enum validation on load from external storage because persistence is absent.
