---
module: Analytics
sidebar: Infrastructure → Analytics
page: 04-alert-volume-over-time.md
title: "Alert volume over time"
last_updated: 2026-05-23
---

# Alert volume over time

**Sidebar path:** Infrastructure → Analytics

## Alert volume over time / seasonality

### What you are looking at

The **ALERT VOLUME // TIME SERIES** panel plots total alert count per history bucket as a green glowing area chart. Below it, a four-colour severity legend (critical, high, medium, low) provides visual reference though the plotted series is aggregate total only. The companion **CRITICAL THREAT TREND** panel plots critical-severity counts per bucket as a red area chart at reduced height. Buckets appear every ten seconds while the Analytics page is mounted and alerts exist, producing a short-window operational trend, not multi-week seasonality visualization. Seasonality in security is like retail foot traffic: Monday mornings and holiday weekends predictably differ, and ignoring season causes false panic when volume spikes match historical norms. HABIBI-SIEM's chart shows the last few minutes, a heartbeat monitor, not a yearly sales graph, but teaches the concept of time-bucketed volume before you export to long-range reporting tools.

### What is happening underneath

`the SIEM context pipeline` runs `setInterval` every `HISTORY_BUCKET_MS` (10s):

```javascript
setAlertHistory((prev) => [...prev.slice(-29), {
 time: Date.now(),
 critical, high, medium, low,
 total: alerts.length,
}]);
```
Each bucket snapshots current alert array severities; not alerts created in that window. Therefore the chart reflects stock (current open alert population), not flow (new alerts per interval). This differs from enterprise SIEMs that histogram `@timestamp` of incoming events. Session reset on logout clears history (`setAlertHistory([])` on login transition). Seasonality analysis (day-of-week, hour-of-day) is available elsewhere via Reports screen hour buckets, not this Analytics chart.

> **Technical note:** Interpreting the area chart as "alert rate" is incorrect in HABIBI; it tracks cumulative alert count snapshots unless alerts are cleared, in which case totals drop sharply.

### Why this matters

Misreading volume trends causes alert fatigue or complacency. If analysts expect Elasticsearch-style event histograms but see stock snapshots, they mis-estimate attack acceleration. Teaching bucket semantics prevents false escalation when totals rise because nobody resolved alerts, versus when new attacks genuinely flood in. Long-term seasonality still matters for staffing; weekend skeleton crews, patch Tuesday noise, even when this UI only shows minutes.

### Step-by-step walkthrough

1. Clear existing alerts (admin **CLEAR ALL** on Overview) to flatten the time series baseline.
2. Run Simulate Campaign; watch **ALERT VOLUME** area rise over subsequent 10-second buckets as alert count increases.
3. Observe **CRITICAL THREAT TREND**: should rise when critical rules fire (sql-injection, data-exfil, etc.).
4. Wait 30–60 seconds without new ingestion; buckets continue; totals stay flat if no new alerts and no clears.
5. Resolve half the alerts on Overview, next buckets should show lower totals (stock semantics).
6. Compare with Monitor → Timeline for event-level chronology if available.
7. For seasonality concepts, open Reporting → Reports and review hour-bucket visualisations for day-scale patterns.
8. Document for leadership: Analytics window ≈ five minutes; quarterly seasonality requires exported SIEM data.

### Common questions

#### Why did volume jump without new attacks?

Because buckets record total alert count. Stopping resolution while simulation adds alerts produces monotonic rise. Alternatively, re-enabling disabled rules on old logs replayed could add alerts; uncommon in demo.

#### Can I change the bucket interval to detect hourly seasonality?

Not in UI. Constants `HISTORY_BUCKET_MS` and `MAX_HISTORY_BUCKETS` are hardcoded in the SIEM context pipeline. Hourly seasonality belongs in reporting backends or BI exports.

#### Does the chart show seasonality for off-hours auth rules?

Only indirectly if off-hours alerts exist in current alert array during the five-minute window. The `off-hours-auth` rule fires based on log timestamp hour (22:00–06:00 UTC); demo logs may not trigger it during business-hour labs.

#### How is this different from overview TIME filters?

Overview **1M/5M/15M/1H** filters which alert rows display by alert timestamp. Analytics charts bucket wall-clock sampling of aggregate counts; orthogonal mechanisms.

### How an analyst uses this during active incident

The analyst watches slope direction during prolonged attacks. Flat red critical trend with rising total suggests non-critical noise accumulating, prioritise dedupe and rule tuning. Rising critical trend demands immediate tier-3. They correlate bucket timestamps with their own actions ("we ACKed at:42, total dropped at:50"). They do not infer yearly seasonality here; they note time-of-day for shift handover context.

### Edge cases and gotchas

Refreshing browser resets `alertHistory`. Multiple analysts share server alerts but not browser bucket history. Stock semantics diverge from industry-standard event histograms; document in SOC runbooks. Critical trend uses index labels, not clock labels; harder to correlate with wall clock. Clearing alerts creates cliff-drop artefact mistaken for containment success. Interpreting bucket timestamps requires knowing samples occur every ten seconds regardless of alert activity, quiet periods produce flat lines that still advance x-axis labels from `toLocaleTimeString`. After thirty buckets, oldest samples drop, creating a sliding window illusion similar to network monitor graphs on firewall consoles. If alerts are cleared administratively, total counts cliff-dive on the next bucket; distinguish from organic attack cessation by checking Overview feed simultaneously. For seasonality education despite short windows: brute-force simulation at t=0 and t=4500ms produces two spikes in critical/high counts separated by 4.5 seconds; micro-seasonality within one campaign. Real Monday-morning login spikes would require ingesting logs with timestamps spanning weeks; Reporting → Reports hour buckets aggregate by alert `timestamp` field and better support seasonality vocabulary in stakeholder slides even when Analytics cannot.
