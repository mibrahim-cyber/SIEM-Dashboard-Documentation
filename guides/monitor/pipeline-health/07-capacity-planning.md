---
module: Pipeline Health
sidebar: Monitor → Pipeline Health
section: Monitor
subsection: Capacity planning
last_updated: 2026-05-23
---

# Capacity planning

**Part of:** Monitor → Pipeline Health
**One-sentence focus:** EPS approaching CRITICAL LOAD and buffer caps signal when synchronous client-side processing may drop or lag events.

### What you are looking at

EPS gauge approaching CRITICAL LOAD, sparkline trending upward, source cards OVERLOAD, detection stage showing alerts raised vs logs processed ratio, inputs for rough headroom planning. Capacity planning is checking whether a highway bridge traffic count nears design limit before collapse, ahead-of-time widening beats emergency repair.

### What is happening underneath

Demo caps: `MAX_RAW_LOGS` 500 buffer, SQLite alert slice 1000, client-side detection engine single-thread. EPS history 60 points × ~10s buckets ≈ 10 minutes visual memory. No queue depth metric, implicit synchronous processing assumes instant validate+detect. `maxEps=200` on gauge arbitrary UI scale.

### Why this matters

Exceeding throughput drops logs (tail slice), delays detection, misses SLA. College demo hides queue buildup; production SIEM needs Kafka/redis depth metrics.

### Step-by-step walkthrough

1. Run sustained ingest load test: watch gauge colour transitions.
2. Record EPS at NOMINAL → ELEVATED boundary for your hardware.
3. Note sparkline peak duration; burst vs sustained.
4. Identify first source hitting OVERLOAD badge.
5. Estimate headroom: if critical at 170 EPS on laptop, plan hardware or sampling before production traffic exceeds 120 EPS average.
6. Review detection stage alert ratio, alert storms add UI load separate from ingest EPS.
7. Document findings in ops runbook with date and hardware spec.

### Common questions

#### What is max supported EPS?

Not formally benchmarked in repo; measure empirically on deployment target.

#### Will EPS trend predict disk full?

No. SQLite growth is tied to alert count, not EPS display alone.

#### How to reduce load?

Sampling ingest, disable noisy rules, increase dedupe, shorten retention.

#### Does vite dev mode affect EPS?

Yes; production build faster; capacity test on prod build path.

### What analysts do when the pager fires

During DDoS, monitors OVERLOAD to justify emergency tuning (pause nonessential rules) per manager approval, trade visibility for stability.

### Edge cases and gotchas

Simulate campaign short burst may not reflect sustained capacity. Random source jitter irrelevant to planning; focus aggregate EPS gauge.

> **Technical note:** See `docs/09-operations/10-eps-monitoring.md` for extended ops guidance aligned with this module. Demo architecture caps: `MAX_RAW_LOGS = 500` buffer, SQLite persists last 1000 alerts, detection engine runs synchronously after API validation. Sustained load test: record EPS at NOMINAL → ELEVATED boundary on target hardware. Use the published production deployment for capacity tests. During DDoS, OVERLOAD badges justify emergency tuning (pause nonessential rules) with manager approval; trading detection breadth for UI stability. Alert storms add UI refresh load separate from ingest EPS; monitor both gauge and Overview feed responsiveness.
