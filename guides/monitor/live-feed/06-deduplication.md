---
module: Live Feed
sidebar: Monitor → Live Feed
section: Monitor
subsection: Deduplication
last_updated: 2026-05-23
---

# Deduplication

**Part of:** Monitor → Live Feed
**One-sentence focus:** Alert dedupe on Overview collapses repeat rule/IP pairs within 30 seconds; Live Feed still shows every log line.

### What you are looking at

Live Feed itself has no dedupe toggle, every normalized log appears as a row. Deduplication controls live on Overview → [ DEDUPE: ON/OFF ] and affect alert creation, not log display. Analysts may see repeated similar log lines in Live Feed while Overview collapses duplicate alerts. Picture raindrops on a windshield versus the wiper counting "one storm." Each drop is a log line; dedupe is the wiper treating the downpour as one weather alert if drops hit within the same swipe window.

### What is happening underneath

When `dedupeEnabled` true in the SIEM context pipeline, after detection fires, filter removes alerts where same `sourceIp` + first matched `ruleId` exists within 30 seconds (`30_000` ms) on an existing alert. Logs still append全部 to `rawLogs`, no log-level dedupe. Brute force generating 200 lines creates 200 feed rows but potentially one alert if only aggregate threshold rule fires once, or fewer alerts if dedupe collapses repeated rule hits.

### Why this matters

Without alert dedupe, SOC drowns in identical criticals. Without understanding log vs alert dedupe separation, analysts think "SIEM duplicated" or "SIEM missed logs" incorrectly.

### Step-by-step walkthrough

1. Enable [ DEDUPE: ON ] on Overview.
2. Run simulate campaign with repeated brute-force batches.
3. Watch Live Feed, many similar auth lines.
4. Switch Overview; fewer alert rows than log lines.
5. Disable dedupe: repeat; alert count rises.
6. Forensic mode: dedupe off, alerts ACK individually.
7. Re-enable dedupe for normal ops.

### Common questions

#### Should I turn dedupe off during investigations?

Often yes when you need every alert firing recorded separately for timeline accuracy. Logs remain complete either way.

#### Does dedupe hide attack escalation?

If attacker changes technique (new ruleId) within 30s, new alert fires. Same technique repeats, suppressed.

#### Is 30 seconds configurable in UI?

Not in v4; hardcoded in the SIEM context pipeline dedupe filter.

#### Do logs dedupe at buffer?

Only cap slice `-500` or `-300`; old logs drop silently when buffer full, unrelated to dedupe logic.

### Using this view during live response

Keep dedupe on for triage focus; pivot to Live Feed for per-attempt detail. When counting exact password guesses for legal, use log rows not alert count. Document dedupe state in incident notes.

### Edge cases and gotchas

Dedupe compares to `engineRef.current.alerts` historical store; timing edge cases on first load. Simulated + real alerts dedupe together if same IP/rule window. Clearing alerts resets engine store on admin clear.

> **Technical note:** Dedupe runs post-detection pre-`setAlerts`, suppressed alerts never hit SQLite persistence. The dedupe window is hardcoded at 30 seconds in the SIEM context pipeline; it compares new alert candidates against existing alerts sharing the same `sourceIp` and first matched `ruleId`. Suppressed alerts never reach `setAlerts` or SQLite persistence, which is why Live Feed row counts can exceed Overview alert counts during brute-force storms. Forensic investigations often disable dedupe temporarily so every rule firing creates a durable alert record for timeline accuracy. Document dedupe state in incident notes: "Dedupe ON during triage; disabled 14:32 UTC for legal hold export." Re-enable after export to restore operational focus.
