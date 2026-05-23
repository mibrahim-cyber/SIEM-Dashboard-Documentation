---
module: Settings
sidebar: Ingest & Config → Settings
section: Ingest & Config
subsection: Deduplication toggle
last_updated: 2026-05-23
---

# Deduplication toggle

**Part of:** Ingest & Config → Settings
**One-sentence focus:** dedupeEnabled, the 60-second label versus 30-second engine window, and rule-scoped matching.

### What you are looking at

The Alert Deduplication row under **DETECTION PREFERENCES** shows a checkbox bound to `dedupeEnabled` with helper text: Suppress duplicate alerts from same IP within 60s. The label implies a sixty-second suppression window keyed on source IP (and implicitly the same detection rule, though the UI does not mention rule ID). When checked, analysts expect fewer repeat cards in Alert Manager and fewer redundant critical beeps during sustained brute-force bursts. When unchecked, every rule match that survives detection engine logic becomes a distinct alert row even if identical to a recent one. This is the only user-facing control for deduplication, no advanced panel for window tuning, hash algorithms, or per-rule exceptions.

### What is happening underneath

`dedupeEnabled` defaults `false` in the SIEM context pipeline state, synced to `dedupeRef` for ingest callbacks. In log processing, after `detection engine.processLogs` returns fired alerts, enrichment adds status, geo, and campaign data lineage flags, then:

```javascript
const deduped = dedupeRef.current
 ? enriched.filter((a) => !engineRef.current.alerts.some((ex) => ex.sourceIp === a.sourceIp &&
 ex.matchedRules[0]?.ruleId === a.matchedRules[0]?.ruleId &&
 Math.abs(ex.timestamp - a.timestamp) < 30_000 && ex.id !== a.id))
: enriched;
```
Critical details for operators and engineers:

1. UI says 60s (Settings screen); code uses 30_000 ms (30 seconds). Documentation and runbooks must cite both until aligned. Analysts mentally budgeting one minute of suppression will see duplicates arrive after thirty seconds.

2. Dedupe compares against `engineRef.current.alerts`, the detection engine's in-memory alert history; not merely the React `alerts` state or SQLite DB rows. Engine memory behaviour matters after **CLEAR ALL ALERTS**, which calls `engineRef.current.clearAlerts()` resetting the dedupe baseline.

3. Matching requires same `sourceIp`, same first matched rule's `ruleId`, and timestamp within the window. Different rules from same IP within the window both appear: dedupe is not IP-only despite UI copy.

4. Dedupe applies before critical sound and SOAR auto-lookup branches. Suppressed alerts skip beeps and downstream threat checks for that ingest batch.

5. No server-side deduplication, pure client pipeline preference; two browsers with different checkbox states diverge until reload defaults both to off.

### Why this matters

Duplicate alert storms cause analyst fatigue, inflated incident counts in correlation, and SOAR quota burn from repeated AbuseIPDB lookups on the same IP. Dedupe is a pressure-relief valve during credential stuffing simulations. The UI/code mismatch is a documentation and trust issue: SOC leads scheduling SLAs on "one alert per IP per minute" will miscalculate if engineers read only the checkbox label. Transparency about rule-scoped dedupe prevents false assumptions that all activity from an IP collapses to one alert; multi-vector attacks still produce multiple rows.

### Step-by-step walkthrough

1. Open Settings; ensure Alert Deduplication is unchecked.
2. Run Simulate Campaign or replay brute-force logs twice within twenty seconds.
3. Count alert rows in Alert Manager for same IP/rule: expect multiples.
4. Enable deduplication checkbox; repeat ingest within thirty seconds.
5. Observe suppressed duplicates when same IP + ruleId repeat.
6. Wait thirty-five seconds (between UI-stated 60s and actual 30s code) and ingest again. Duplicates may reappear despite UI promising 60s.
7. Wait full sixty seconds and ingest, duplicates definitely reappear if rule fires again.
8. Toggle off dedupe mid-session; confirm subsequent ingest does not dedupe.

### Common questions

#### Why does the UI say 60 seconds if code uses 30?

Likely copy drift during development; treat as known discrepancy; fix either string or constant in a future patch.

#### Does dedupe affect alerts already in the database?

No. It filters only newly fired alerts during log processing against engine memory snapshot at ingest time.

#### Same IP, different rules: deduped?

No. `ruleId` must match on `matchedRules[0]`.

#### Does CLEAR ALL ALERTS reset dedupe memory?

Yes. `engineRef.current.clearAlerts()` wipes engine history. Next burst behaves like first seen.

#### Is dedupe shared across analysts?

No. Each browser session has independent `dedupeEnabled` state, two analysts may see different counts.

### What analysts do when the pager fires

During SSH brute-force storms, Tier 2 enables dedupe to keep Alert Manager readable while Tier 1 watches Live Feed for raw events. Lead documents in ticket that dedupe is active so shift handoff re-enables if disabled. When investigating multi-rule attacks, analyst notices dedupe does not collapse distinct rules; they disable dedupe temporarily for full fidelity before root-cause slides. After exercise, manager clears alerts (admin) and resets engine memory for clean next run.

### Edge cases and gotchas

Clock skew between log timestamps and `Date.now()` rarely affects short windows but synthetic backdated logs could bypass dedupe. Alerts without `matchedRules[0]` may dedupe oddly: undefined ruleId comparisons. Dedupe disabled by default. New deployments are noisy until operators discover the toggle. The deduplication preference is session-scoped and resets on logout or page reload; the `user_prefs` table is available in the schema to persist this setting across sessions. Correlation engine uses separate 60s `IP_WINDOW_MS` for incidents; dedupe window is unrelated; incidents may still multiply.

> **Technical note:** Align UI copy with `30_000` or change constant to `60_000` in the SIEM context pipeline: single source of truth recommended.
