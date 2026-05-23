---
module: Rules Engine
sidebar: Configure → Rules Engine
page: 04-sliding-window.md
title: "The sliding window"
last_updated: 2026-05-23
---

# The sliding window

**Sidebar path:** Configure → Rules Engine

## Sliding window temporal logic

### What you are looking at

Rules Engine cards display static descriptions referencing temporal logic for threshold rules, especially Brute Force Attack (`≥5 failed auth events within 60s`) and Rapid Request Rate (`≥10 HTTP requests within 10s`). The UI does not expose τ, Δt, or window sliders; parameters live inside `check(log, allLogs)` implementations. Non-temporal rules (regex single-log checks like SQL injection) show descriptions without window language but still run per log event. Sliding windows are like a speed camera averaging your velocity over the last 100 metres rather than at a single instant, one slow reading does not ticket you, but sustained speeding does. Brute-force detection counts failures in a trailing time strip behind each new log.

### What is happening underneath

```
isFailedAuth(log) → filter allLogs for same sourceIp + failed auth
within |timestamp difference| < 60_000 ms → count >= 5 → match
```
`rapid-requests` uses `window = 10_000` ms and count `>= 10` HTTP events. `detection engine.processLog(log, allLogs)` passes `[...processedLogs,...currentBatch]` as context so windows span historical session logs. Window boundaries use `Math.abs` on timestamp differences, symmetric around each candidate log. Single-log rules evaluate only current log fields without scanning history.

> **Technical note:** Timestamps come from log `timestamp` or `@timestamp`; missing timestamps collapse window logic unpredictably; ensure ingestion supplies numeric epoch ms.

### Why this matters

Threshold rules reduce false positives from isolated failures while catching automation. Misconfigured windows cause either alert fatigue (window too long, threshold too low) or missed attacks (window too short). Understanding sliding windows explains why the fifth failed login fires but the second does not.

### Step-by-step walkthrough

1. Read Brute Force Attack description: note τ=5, Δt=60s parameters in prose.
2. Enable rule if disabled.
3. Run Simulate Campaign; includes brute-force batches at 0ms and 4500ms.
4. Observe hit increment, campaign sends ≥5 failures per batch from shared attacker templates.
5. Disable brute-force rule; rerun: confirm hits frozen.
6. Read Rapid Request Rate. 10 requests / 10 seconds window for DoS probing.
7. Inspect detection rules catalog source for exact millisecond constants if tuning lab exercises.
8. Correlate fired alerts on Overview with time clustering, multiple alerts same IP within minute.

### Common questions

#### Can I change the 60-second window in the UI?

No; edit detection rules catalog `Δt = 60_000` constant and restart the dashboard. Correlation Builder exposes `windowSec` for its local rules but those do not feed detection engine.

#### Why did brute-force not fire on my custom single failed login?

Threshold requires five failures within window for same `sourceIp`. Single event insufficient by design.

#### Do windows slide globally or per IP?

Per source IP (and per rule evaluation anchored on each incoming log). Different IPs maintain independent counts.

#### Does processedLogs truncation affect windows?

`MAX_RAW_LOGS = 500` in the SIEM context pipeline may drop ancient logs from memory; very long windows could under-count in extreme sessions. Demo windows (10–60s) unaffected.

### How an analyst uses this during active incident

Seeing clustered authentication alerts, the analyst confirms brute-force rule description matches observed timing; argues for IP block after fifth failure rather than first. They check whether rapid-request rule explains HTTP flood side of DDoS. They avoid disabling threshold rules mid-attack unless false positive proven.

### Edge cases and gotchas

Symmetric `Math.abs` includes "future" logs in batch relative ordering quirks during bulk ingest. Simulated campaign timing scripted, not realistic human typing cadence. Window rules O(n) scan allLogs per log; performance degrades with huge buffers. Off-hours rule uses clock hour window, not sliding event window; different temporal class. Mathematical notation in brute-force description mirrors detection engineering literature: tau threshold count, delta-t window width. The check evaluates on every failed auth log arrival, when the fifth failure lands within sixty seconds of siblings from same sourceIp, that fifth log triggers the match. Rapid-requests uses ten HTTP events in ten seconds, overlapping windows can re-fire on eleventh request if prior ten still within window. Tuning guidance without UI: increase tau to 10 for high-security environments; decrease delta-t to 30000 ms for faster credential spray detection. Edit milliseconds constants directly in the built-in the detection rules catalog. Correlation Builder windowSec field educates the same concept but does not affect these engine constants; maintain documentation parity manually when teaching classes. Window boundary inclusivity uses absolute timestamp difference; logs exactly sixty seconds apart may fall outside brute-force window depending on millisecond precision on ingested JSON. Bulk ingestion reordering timestamps can artificially cluster or disperse failures. Pipeline Health EPS spikes during batch upload may produce different brute-force outcomes than live streaming ingestion. Test sliding windows using Log Ingestion with crafted timestamps rather than Simulate Campaign alone when teaching window semantics, campaign uses tight scripted timing not representative of human attacker cadence or distributed botnets with jitter. When teaching tau and delta-t, draw timeline on whiteboard: five failure dots within sixty-second span triggers on fifth dot; not on first. Contrast with point-detection rules like sql-injection that fire immediately on first malicious payload; different operator mental models for urgency and ACK priority.
