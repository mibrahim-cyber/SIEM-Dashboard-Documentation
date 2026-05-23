---
module: Correlation Builder
sidebar: Configure → Correlation Builder
page: 07-performance-cost.md
title: "Performance cost of complex correlations"
last_updated: 2026-05-23
---

# Performance cost of complex correlations

**Sidebar path:** Configure → Correlation Builder

## Performance cost of correlations

### What you are looking at

The Builder UI shows no performance metrics, query cost estimates, or EPS impact gauges. Performance implications are invisible while authoring, only when testing or running production detection does cost manifest. Rules list subline shows `hits` counter (local, often stale zero for Builder-only rules). **TEST** button scans entire in-memory `alerts` array once per click, acceptable for demo volumes. Correlation performance is toll traffic on a highway, one condition is a single booth; ten conditions across millions of logs is rush-hour gridlock unless optimised (indexing, window pruning). HABIBI demo volumes hide toll costs teaching authors to think about scale before production.

### What is happening underneath

| Layer | Complexity | Demo scale |
|-------|------------|------------|
| Builder testRule | O(alerts × conditions) | <1000 alerts |
| detection engine check | O(logs × rules × window_scan) | window rules scan allLogs |
| correlateAlerts | O(alerts²) worst pairwise filter | ~ hundreds alerts |

`brute-force` and `rapid-requests` scan `allLogs` per incoming log; costly at scale. Builder AND/OR test evaluates all conditions per alert without short-circuit optimisation beyond native `every/some`. No query planner, no Redis window state, no Flink state backend; in-browser JavaScript only. `MAX_RAW_LOGS = 500` caps memory in the SIEM context pipeline mitigating unbounded growth.

> **Technical note:** Regex conditions in Builder run `new RegExp(c.value, 'i')` per alert per test; expensive if value complex and alerts many.

### Why this matters

Authors adding ten OR branches with regex on high-cardinality fields can stall browser during test click at enterprise alert volumes. Windowed rules without entity indexing cause CPU spikes on ingestion workers. Performance section sets expectation: demo teaches logic; production needs stream processors and bounded state.

### Step-by-step walkthrough

1. Baseline: note `alerts.length` before test.
2. Run test with one condition, observe instant completion post-600ms delay.
3. Add five OR regex conditions; retest on same alert count: note any lag.
4. Run Simulate Campaign repeatedly to grow alerts; retest, subjective lag increase.
5. Open browser devtools Performance tab during large test; optional profiling exercise.
6. Read detection rules catalog brute-force allLogs scan: discuss O(n²) ingestion risk at 10k EPS.
7. Compare correlateAlerts clustering cost on Analytics when incidents list long.
8. List production optimisations: entity-keyed windows, pre-filter by index, rule ordering.

### Common questions

#### Will builder rules slow overview?

Local state only; zero ingestion impact until compiled to engine rules.

#### How many rules before slowdown?

Demo handles ~12 engine rules on hundreds of logs. Thousands of rules or millions of logs need backend redesign.

#### Does TEST block UI?

600ms setTimeout on main thread, large alert arrays may block longer synchronously during filter.

#### Are AND conditions faster than OR?

Minimal difference in JS filter; both evaluate all conditions per alert in test use.

### How an analyst uses this during active incident

Not performance-tuning during incident; defer. Post-incident, if alert processing lagged, analyst flags heavy window rules (data-exfil bytes check + allLogs scans) for engineering profiling. They avoid adding regex OR chains in Builder proposals without cardinality review.

### Edge cases and gotchas

Browser tab hang if regex catastrophe on huge alert set. CorrelateAlerts O(n²) noticeable only at scale. Engine and Builder duplicate rule concepts; double maintenance not double runtime unless both active. ClearAlerts resets processedLogs, window rules behave differently after clear. Back-of-envelope math for instructors: ten rules, one thousand logs, brute-force averaging five hundred log lookback equals five million comparisons per batch worst case; acceptable in JS demo, unacceptable at 50k EPS without indexing. Production mitigations: rule ordering cheap checks first, entity-keyed circular buffers, pre-filter by log source type, compile regex once outside loop. Browser test hang mitigation: filter alerts subset before testing broad regex. CorrelateAlerts quadratic nested filter visible if incident list renders hundreds of rows. Analytics panel slice limits to ten incident rows mitigating UI impact only. Educate architects that Correlation Builder prototype belongs in authoring tier, not data plane; compile to efficient engine representation before production load. Capacity planning exercise for students: given EPS target and rule count, estimate CPU, assign each rule nominal microseconds per log, multiply, compare to core budget. Discuss horizontal scaling ingestion workers with partitioned rule sets versus vertical scaling; HABIBI monolith teaches single-node limits. Note browser main thread testRule freeze risk during executive demo; pre-filter alerts or use smaller dataset before clicking TEST in front of attendees. `correlateAlerts` runs on every alerts-array change inside `useMemo`; large alert arrays increase Overview and Analytics render cost correlated with incident panel length. Assign reading: Elasticsearch Watcher versus in-browser filter, orders of magnitude scale difference. Positions HABIBI as pedagogical prototype not performance benchmark. Students with infra background appreciate honesty about O(n²) correlateAlerts and allLogs scans. Scaling story for leadership without jargon: each log asks each enabled rule a question; twelve rules twelve questions; one million logs twelve million questions per batch naive model; compute budget explodes. Mitigations in one slide: disable unused rules, cheap checks first, window state not full rescans, horizontal workers. HABIBI twelve rules intentional small number for laptop demo; not capacity target. Browser TEST performance: advise filtering alerts to last hour manually before test if array huge, filter UI absent; pre-clear stale alerts admin action. CorrelateAlerts on thousand alerts noticeable on low-end laptops. Analytics incident panel slice mitigates render not computation; educate difference. Production SIEM moves correlation to stream processor with checkpointed state, name-drop Kafka Flink without implementing; sets architectural north star. Cost of false correlation rework: analyst hour spent merging wrong NAT incident equals dollars; argue performance tuning includes correlation accuracy not only milliseconds; quality metric complements latency metric in SOC programme office dashboards alongside Rules Engine hit counts and Analytics active incident KPI trends.
