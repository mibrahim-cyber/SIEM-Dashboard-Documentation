---
module: Overview
sidebar: Monitor → Overview
section: Monitor
subsection: Every metric card shown
last_updated: 2026-05-23
---

# Every metric card shown

**Part of:** Monitor → Overview
**One-sentence focus:** Each counter on Overview answers a different operational question, together they decompose security posture in ways a single risk score cannot.

### What you are looking at

The Overview exposes metrics in three zones. Left **ALERT SUMMARY** rows: **TOTAL**, **CRITICAL**, **HIGH**, **MEDIUM**, **UNREAD**, **RESOLVED**, each a label/value pair with colour-coded numbers (critical red `#ff2d55`, unread orange when non-zero). Header counters: **LOGS** (`logsProcessed.toLocaleString()`), **RULES** (`enabled/total`), **INCIDENTS** (`N ACTIVE`), **UPTIME** (HH:MM:SS tabular). Right panel: **TOP ATTACKERS** lists up to five IPs with horizontal bar widths proportional to alert count; **RULE ACTIVITY** shows each rule's first word and hit count with progress bars; **THREAT SCORES** lists top five IPs with numeric scores colour-coded at thresholds 80/60; **SEV BREAKDOWN** repeats severity counts with coloured bars. Feed footer reads `{visible}/{alerts.length} RECORDS`. Status tabs append live counts: ALL (N), NEW (N), etc. Picture a hospital ward board where each column tracks a different necessary sign; heart rate, blood pressure, temperature; rather than one "patient okay" light. No single metric tells the whole story; together they reveal whether the patient is stable, declining, or crashing.

### What is happening underneath

`getAlertStats()` computes: `total = alerts.length`; per-severity filters on `alert.severity`; `unread` counts `status === 'new'`; `resolved` counts `status === 'resolved'`. **LOGS** increments in `processLogs()` for every geo-enriched event passed to the detection engine, regardless of alert firing. **RULES** reads `rules.filter(r => r.enabled).length` from cloned `detectionRules` objects whose `.hits` property mutates inside `detection engine`. **INCIDENTS** active count filters `incidents.filter(i => i.status === 'active')` where active means last alert in cluster within 60 seconds (correlation engine). **TOP ATTACKERS** aggregates `alerts.forEach(a => counts[a.sourceIp]++)` client-side, not from SQLite. Threat scores combine `THREAT_DB` static base scores with `min(count * 3, 40)` dynamic weight per IP. EPS is not shown on Overview (see Pipeline Health) but drives background ingestion health.

### Why this matters

Misreading a metric causes wrong escalations. A rising **LOGS** with flat alert counts might mean noisy but benign traffic, or disabled rules. High **UNREAD** with low **CRITICAL** might mean staffing shortage, not catastrophe. **RULE ACTIVITY** showing zero hits across all rules while alerts exist indicates a display sync issue or rules reset. Executives often ask "how many attacks?", **TOTAL** alerts ≠ attacks; one attacker may generate dozens of alerts. Teaching stakeholders which counter answers which question prevents dashboard mistrust.

### Step-by-step walkthrough

1. Compare **CRITICAL + HIGH** to **UNREAD**: large unread critical backlog means SLA risk.
2. Check **RULES** ratio: if `3/12`, most detection is offline; ask admin before interpreting low alert volume.
3. Hover mentally over **TOP ATTACKERS**: one IP at 80% bar width suggests focused campaign.
4. Read **THREAT SCORES**: scores ≥80 glow red (`#ff2d55`); cross-reference with **TOP ATTACKERS**.
5. Match **SEV BREAKDOWN** bars to **ALERT SUMMARY**: they should align; mismatch indicates filter active in feed only.
6. Watch **LOGS** over 30 seconds during ingestion demo; stagnant count means pipeline stall.
7. Note **INCIDENTS** vs raw alert count: three incidents from forty alerts means correlation is working.

### Common questions

#### What is a "bad" number for CRITICAL?

There is no universal threshold; context matters. In a lab after Simulate Campaign, seeing 2–5 critical is expected. In production, any sustained non-zero critical count warrants investigation. Zero critical with high **MEDIUM** may still indicate scanning or policy violations worth triage.

#### Why does UNREAD differ from the NEW tab count?

They should match when no filters are applied. If **TIME** filter is **1M**, the feed hides older new alerts but **UNREAD** in **ALERT SUMMARY** still counts all `status === 'new'` alerts globally. Always check whether a time or severity filter is active before comparing tab counts to summary stats.

#### Where does LOGS processed come from: is it today's total?

`logsProcessed` is a session cumulative counter from the dashboard state, incremented per validated log through `processLogs()`. It persists in memory for the session and reflects all processed events since page load/context init, not calendar-day billing metrics. Server-side totals may differ if multiple analysts connect.

#### What are THREAT SCORES, is that VirusTotal?

Not directly on Overview. HABIBI-SIEM's `buildThreatScores()` uses a built-in `THREAT_DB` map (sample known-bad IPs) plus dynamic alert-count weighting. High/critical alerts on an IP add up to 40 points. AbuseIPDB enrichment happens asynchronously via automatic IP enrichment on critical/high external alerts, but Overview scores are computed locally from alert history.

### Operational use during containment

The analyst treats **CRITICAL** and **UNREAD** as a queue depth gauge. If **UNREAD** exceeds team capacity, they escalate to tier2 and enable **DEDUPE: ON** to suppress repeat rule/IP pairs within 30 seconds. They watch **RULE ACTIVITY** to see which detections fire most; a sudden spike in `brute-force` hits confirms credential attack hypothesis. **TOP ATTACKERS** prioritises block list candidates. If **INCIDENTS** shows `203.0.113.45 [12]`, they focus on that IP cluster first. They screenshot or export metrics before **CLEAR RESOLVED** for shift log.

### Edge cases and gotchas

Simulated campaign alerts inflate **TOP ATTACKERS** and **THREAT SCORES** temporarily. Internal IPs (`10.x`, `192.168.x`) get low base threat scores (5); do not ignore internal lateral movement based on score alone. Rule bars normalise against `totalRuleHits`; one dominant rule makes others look tiny even if significant. **RESOLVED** count includes alerts still visible at reduced opacity until cleared. Watchlisted alert status exists in stats (`blocked` key) but is not shown in Overview summary rows.

> **Technical note:** `getAlertStats()` is memoised via `useCallback` with `[alerts]` dependency. Header **UPTIME** uses `setInterval` every 1000ms local to `Dashboard` mount; refreshing the page resets it.
