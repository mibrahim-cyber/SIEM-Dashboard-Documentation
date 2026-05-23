---
module: Analytics
sidebar: Infrastructure → Analytics
page: 07-trend-analysis.md
title: "Trend analysis"
last_updated: 2026-05-23
---

# Trend analysis

**Sidebar path:** Infrastructure → Analytics

## Trend analysis week/month

### What you are looking at

Analytics trend visualisation covers approximately five minutes of session history via thirty 10-second buckets, suitable for micro-trends during active monitoring, not week-over-month strategic analysis. The **ALERT VOLUME // TIME SERIES** and **CRITICAL THREAT TREND** area charts are the primary trend widgets. No date-range picker, no weekly rollups, no month-over-month percentage delta appears in Analytics. Longer horizons require Reporting → Reports (hour buckets), Investigate → Heatmap Calendar, or external export. Weekly/monthly trend analysis is comparing weather seasons using yesterday's window thermometer reading, useful for "is it getting hotter right now?" but insufficient for climate planning. HABIBI Analytics is the thermometer; reporting modules and exports are the climate archive.

### What is happening underneath

Trend data source is exclusively in-memory `alertHistory` array, lost on page refresh or logout. No SQLite persistence for analytics buckets on the Express backend. Reports screen computes `hourBuckets` from alert timestamps for shift-level patterns. Heatmap Calendar screen visualises day/hour density for hunt workflows. Risk score trend and computed metrics (MTTR, false positive rate) are surfaced in Executive View. Extending Analytics to weekly/monthly would require backend aggregation tables querying alert `@timestamp`.

> **Technical note:** `alertHistory` buckets snapshot total alert counts, not deltas; week-over-week comparison would need historical database storage not present in client-only history.

### Why this matters

Strategic decisions; hiring, tool purchases, rule programme funding; require month-scale evidence. Operators misusing five-minute charts for board presentations understate or overstate problems. Knowing where long trends live prevents exporting screenshots that expire when the browser session ends.

### Step-by-step walkthrough

1. Acknowledge Analytics' ~5-minute chart horizon explicitly in your notes.
2. Run sustained ingestion over 2+ minutes, observe bucket accumulation toward thirty max.
3. Note oldest bucket drops off when thirty-first sample arrives; sliding window effect.
4. Navigate Reporting → Reports: compare hour-bucket visualisations for same alert set.
5. Open Investigate → Heatmap Calendar; identify day/hour hot spots for monthly narrative.
6. Export JSON alerts from Overview, compute weekly counts offline in spreadsheet for budget exercises.
7. For month-over-month, describe methodology even if demo lacks data: `(month2 - month1) / month1` on alert counts per category.
8. Set stakeholder expectation: Analytics = tactical; Reports/exports = strategic.

### Common questions

#### Can I extend history by leaving the tab open for hours?

Buckets cap at thirty samples; leaving open continues rolling window, not unlimited retention. Total horizon remains ~5 minutes always.

#### Does SQLite store alert history for trends?

Alerts persist server-side via API, but Analytics charts do not query historical DB ranges; they use client `alertHistory` only. Reopening Analytics after reload rebuilds history from scratch empty until new interval ticks.

#### What chart best supports weekly review?

Heatmap Calendar for temporal patterns; Reports hour buckets for volume; not Analytics area charts.

#### How do I show month/month critical alert reduction?

Export persisted alerts, filter by severity and timestamp ranges, compute counts; outside Analytics UI. Use Executive View narrative charts for demo storytelling only.

### How an analyst uses this during active incident

During incidents, the analyst uses Analytics micro-trends only, is critical trend rising in last minute? For post-incident review spanning days, they abandon Analytics and query Reports or case exports. They do not wait for thirty buckets during fast attacks; Overview feed is faster.

### Edge cases and gotchas

Session refresh erases trend memory. Stock-based buckets mis resemble rate trends across weeks. Comparing Analytics screenshots from different sessions is invalid. Heatmap and Analytics may disagree if one uses all DB alerts and other uses client state before hydration completes. Building month-over-month narrative without native Analytics support: export alerts JSON from Overview, bucket by month keys from alert timestamps, pivot severity counts in spreadsheet, compute percentage deltas. Week-over-week analogous with ISO week strings. Investigate → Heatmap Calendar colours day/hour cells by alert density; screenshot four consecutive weeks for trend PowerPoint slides. Session persistence gap: `alertHistory` lives in dashboard state only; closing laptop loses five-minute trend memory. SQLite backend persists alerts across sessions but Analytics does not reload historical buckets on mount, reopening Analytics starts empty history until next ten-second tick after alerts exist. Educate stakeholders that short-window charts are tactical oscilloscopes, not strategic archives; budget requests need exported CSV trends attached as appendices. Analysts preparing quarterly business reviews should standardise on Monday-morning export ritual: pull alerts JSON, compute weekly severity stacks, annotate known change windows (patch Tuesday, marketing campaign launches) that explain spikes before executives misinterpret randomness as breach. Compare Heatmap Calendar colour intensity week one versus week four visually even when Analytics area chart cannot span that duration. Document in slide footnotes: HABIBI Analytics horizon equals thirty buckets times ten seconds; five minutes, so any slide claiming thirty-day trend from Analytics screenshot alone is inaccurate without exported data appendix. Board members need month-scale trend language even when Analytics screen only renders minute-scale charts; ask the SOC for exported severity pivots rather than live dashboard screenshots. Detection engineers extending the platform should persist bucket aggregates server-side keyed by day and week so the same AreaChart component can eventually plot strategic horizons without replacing the tactical five-minute view operators rely on during incidents.
