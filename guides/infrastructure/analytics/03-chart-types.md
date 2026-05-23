---
module: Analytics
sidebar: Infrastructure → Analytics
page: 03-chart-types.md
title: "Every chart type in the analytics view"
last_updated: 2026-05-23
---

# Every chart type in the analytics view

**Sidebar path:** Infrastructure → Analytics

## Every chart type in analytics view

### What you are looking at

Analytics renders four visual primitives across six panel regions. KPI tiles (four-up grid): large VT323-font numbers for **TOTAL ALERTS**, **ACTIVE INCIDENTS**, **CONTAINED**, **UNRESOLVED** with colour coding (green `#00ff41`, red `#ff0040`, orange `#ffaa00`). AreaChart (area chart widget) appears twice: **ALERT VOLUME // TIME SERIES** (green `#00ff41`, labels from bucket timestamps) and **CRITICAL THREAT TREND** (red `#ff0040`, height 90px). DonutChart (donut chart widget) in **SEVERITY DISTRIBUTION** with centre label **ALERTS** and four segments (Critical, High, Medium, Low). BarRow horizontal bars (custom inline component) rank TOP ATTACKING IPs (green bars, up to eight IPs) and **ATTACK CATEGORY BREAKDOWN** (blue `#00aaff` bars from matched rule categories). **CORRELATED INCIDENTS** panel (conditional, when `incidents.length > 0`) renders text rows with status badges, not a chart, listing IP, rule names, alert count, categories, last seen, severity. A music studio mixing desk has VU meters (KPIs), waveform displays (area charts), pie-balanced equalisers (donut), and channel sliders (bar rows). Analytics mixes instrument types so different data shapes remain readable.

### What is happening underneath

`timelineData` maps `alertHistory` buckets: `{ label: locale time string, value: b.total }`. `criticalTimeline` maps bucket index to `b.critical` count. `topAttackers` aggregates `alerts` by `sourceIp`, sorts descending, slices top eight. `categoryBreakdown` iterates each alert's `matchedRules` array, counting `r.category` occurrences. `donutSegments` pulls severities from `getAlertStats()`. `BarRow` computes width as `(value/max)*100%`. Area and donut charts are SVG/canvas React components receiving precomputed arrays, no external charting library like Chart module in the import path. Incidents panel maps `incidents.slice(0, 10)` with blinking `[ACTIVE]` styling when `inc.status === 'active'`.

> **Technical note:** Severity legend under the time-series panel lists four `SEV_COLORS`: critical `#ff0040`, high `#ff6600`, medium `#ffaa00`, low `#00aaff`, legend is decorative for the area chart which plots total volume only; critical-specific view is the separate **CRITICAL THREAT TREND** panel.

### Why this matters

Choosing the wrong chart type hides signals; pie charts of time series obscure ordering; line charts of categorical IPs mis imply continuity. HABIBI-SIEM's selection encodes best practice: temporal data as area charts, composition as donut plus bar backup, rankings as horizontal bars. Analysts who recognise each type know where to look first during briefings.

### Step-by-step walkthrough

1. Populate data via Simulate Campaign or ingestion.
2. Read KPI row left-to-right: establish totals before charts.
3. Study **ALERT VOLUME // TIME SERIES** area chart; note x-axis labels are bucket capture times (10-second intervals).
4. Inspect **SEVERITY DISTRIBUTION** donut centre total, compare to **TOTAL ALERTS** KPI.
5. Read donut companion BarRow list; numeric severity counts below the ring.
6. Scroll to **CRITICAL THREAT TREND**: narrower red area chart isolates critical severity bucket counts over time.
7. Review TOP ATTACKING IPs bars; longest bar is normalised to 100% width.
8. Review **ATTACK CATEGORY BREAKDOWN**, categories like `injection`, `authentication`, `network` from rule metadata.
9. If present, read **CORRELATED INCIDENTS** rows; textual incident cards, not graphical.

### Common questions

#### Why does the time series show only ~5 minutes of history?

`alertHistory` retains `MAX_HISTORY_BUCKETS = 30` buckets at `HISTORY_BUCKET_MS = 10_000` (10 seconds); roughly five minutes of session history. Longer trends require Reporting modules or external SIEM storage.

#### Does the severity donut update when I resolve alerts?

Yes. `getAlertStats()` recounts all alerts regardless of status unless stats logic excludes resolved (HABIBI counts all severities in total). **UNRESOLVED** KPI tracks `unread + acknowledged` specifically.

#### Why are category bars uppercase?

Display transforms `cat.toUpperCase()` in the label, underlying categories remain lowercase (`injection`). Cosmetic for terminal aesthetic.

#### Can I click a chart segment to filter alerts?

No drill-down interaction is implemented. Note the IP or category manually and pivot to Alert Manager or Threat Hunt with that filter.

### How an analyst uses this during active incident

The analyst checks **CRITICAL THREAT TREND** slope first; upward red area confirms worsening critical volume. TOP ATTACKING IPs identifies block-list candidates. **ATTACK CATEGORY BREAKDOWN** distinguishes credential attacks from injection; drives runbook selection. **CORRELATED INCIDENTS** consolidates duplicate IP noise into campaign rows for executive updates. KPI **ACTIVE INCIDENTS** vs **CONTAINED** communicates containment progress without reading every alert row.

### Edge cases and gotchas

Time-series labels use `toLocaleTimeString`; bucket spacing is uniform but labels may duplicate if rendered quickly. Critical trend x-axis shows index strings (`"0"`, `"1"`) not clock times; less readable than main timeline. Empty `topAttackers` renders empty panel silently. Category breakdown ignores alerts without `matchedRules`. Donut with zero total alerts cannot appear; empty state triggers first. The AreaChart component receives `data` arrays of `{label, value}` pairs and renders SVG paths with gradient fill; green glow for totals. DonutChart receives `segments` with `{label, value, color}` plus `total` for centre numeric label and `centerLabel="ALERTS"`. When `stats.total` is zero the empty state prevents donut render entirely. BarRow normalises against `max` prop, if all values zero, bars render zero width without division error thanks to `max > 0` guard. Panel wrapper `Panel` adds consistent `terminal-panel border border-border-green p-5` chrome and `> {title}` header prefix mimicking CLI prompts. **CORRELATED INCIDENTS** rows use conditional blinking CSS class `blink` on `[ACTIVE]` status, contained incidents use dimmer `text-matrix-dim`. Severity suffix on incident rows pulls from incident object's aggregated highest alert severity, not re-computed from live feed at click time.
