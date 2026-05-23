---
module: Pipeline Health
sidebar: Monitor → Pipeline Health
section: Monitor
subsection: Pipeline health metrics
last_updated: 2026-05-23
---

# Pipeline health metrics

**Part of:** Monitor → Pipeline Health
**One-sentence focus:** EPS gauge, sparkline, processed count, ECS compliance, and noise ratio translate buffer and alert state into operational instruments.

### What you are looking at

EPS gauge arc fill with centre integer; labels LOW VOLUME (<25% of 200 max visual), NOMINAL, ELEVATED (>45%), CRITICAL LOAD (>85%). Sparkline area chart under EPS TREND (last 60s). Counters: **PROCESSED** (locale formatted), **ECS COMPLIANT** (neon green %), **NOISE RATIO** (orange %). Per-source: EPS: actual/expected, LAT: Nms, horizontal health bar. Metrics are car dashboard instruments, speedometer (EPS), fuel processed odometer (PROCESSED), inspection sticker compliance (ECS), signal-to-noise radio dial (NOISE RATIO).

### What is happening underneath

`eps` computed in log processing: count timestamps in sliding 5s window / seconds. `epsHistory` appends `{t, v}` each batch, keeps last 59+. `ecsCompliant` = percent rawLogs with `@timestamp` or `event.kind`. `noiseRatio` = `round((1 - alerts.length / max(logsProcessed,1)) * 100)`, high means few alerts per log (quiet or strict rules). Gauge colour thresholds at 45% and 75% of maxEps 200. Source `actualEps = round(eps * share * (0.7 + random*0.6))`.

### Why this matters

Healthy ranges contextualise numbers, 150 EPS critical on laptop demo, normal on enterprise cluster. Parse errors and queue depth (not shown numerically) would complement EPS in production.

### Step-by-step walkthrough

1. Baseline EPS idle; note LOW VOLUME label.
2. Run simulate: watch gauge spike and sparkline rise.
3. Observe **PROCESSED** climb with **NOISE RATIO** drop if alerts fire.
4. Inspect ECS % with mixed malformed ingest test.
5. Compare firewall vs web source EPS shares in matrix.
6. Click Detection stage; read alerts raised ratio line.
7. Document metrics snapshot in shift log export screenshot.

### Common questions

#### What EPS is dangerous?

Context-dependent, gauge uses 200 max reference for colour, not hard limit.

#### What is good ECS compliance?

Target near 100% on structured ingest; lower indicates parser gaps.

#### Does high noise ratio mean bad?

Inverted naming; higher % means fewer alerts per log (could be good clean traffic or broken rules).

#### What is parse error rate?

Not displayed as a metric in v4; infer from validation failures (logs not appearing).

### How an analyst uses this during an active incident

Monitors sparkline for ingestion cliff, if EPS zero while attack continues elsewhere, evidence gap risk; note in incident timeline.

### Edge cases and gotchas

`noiseRatio` 0 when no alerts misleading if logsProcessed zero. Random source latency meaningless for SLO, educational UI only.

> **Technical note:** Sparkline uses SVG polyline normalized to `sparkMax` in history array. EPS computation in `processLogs()`: count timestamps in sliding `EPS_WINDOW_MS = 5000` window, divide by seconds. `epsHistory` appends `{t, v}` each batch, keeping roughly 60 points for the sparkline. Gauge `maxEps = 200` is a visual scale; colour thresholds at 45% (ELEVATED) and 75% (CRITICAL LOAD) of that reference.

`noiseRatio = round((1 - alerts.length / max(logsProcessed,1)) * 100)`; higher percentage means fewer alerts per log. Interpret alongside rule enablement: high noise with zero alerts may mean paused rules; low noise with many alerts may mean aggressive detections or active attack.
