---
module: Correlation Builder
sidebar: Configure → Correlation Builder
page: 02-what-correlation-means.md
title: "What correlation means in SIEM"
last_updated: 2026-05-23
---

# What correlation means in SIEM

**Sidebar path:** Configure → Correlation Builder

## What correlation means in SIEM

### What you are looking at

In HABIBI-SIEM, correlation occurs at two levels visible across the product. Alert-level correlation clusters related alerts into incidents on Monitor → Overview, Infrastructure → Analytics, and via `correlateAlerts()`, grouping alerts sharing a `sourceIp` within 60 seconds. Rule-level correlation in Configure → Correlation Builder means combining multiple field conditions with **AND/OR** logic, optional threshold counts, and TIME WINDOW (seconds) to define when a pattern constitutes a detection. The Builder header reads **CORRELATION RULES** with **BUILDER** and **MATRIX** tabs; selecting a rule shows condition rows, metadata dropdowns, and **TEST AGAINST LIVE LOGS**. Correlation in SIEM is like a detective connecting clues, a single fingerprint (one log) rarely convicts, but matching fingerprints, witness testimony, and motive timeline (multiple events within hours) builds a case. HABIBI connects clues both when firing multi-condition rules (Builder intent) and when bundling alerts into incidents (engine implementation).

### What is happening underneath

correlation engine implements post-detection clustering, input is alerts array, output incident objects with `alertIds`, `ruleNames`, `categories`, `severity`, `status` (`active` if last seen within 60s else `contained`). Correlation Builder maintains independent `rules` state cloned from `detectionRules` on mount, augmented with `conditions[]`, `logic`, `threshold`, `windowSec`, `stride`, but without compiling to `detection engine.check()`. Builder `testRule()` evaluates conditions against **`alerts`** array (alert objects), not raw ingested logs; semantic difference from production engine testing against logs pre-alert.

> **Technical note:** Production detection still flows: logs → `processLogs()` on the detection engine → alerts → optional `correlateAlerts()`. Builder edits do not mutate `the SIEM context pipeline.rules` used by engine. For engineers, it means explicit algorithms at log, rule, and alert layers; each with different inputs, time constants, and persistence models in Correlation Builder screen versus correlation engine.

### Why this matters

Analysts conflate "correlation" with "any multi-field rule" or "incident object." Precision prevents false expectations, toggling Builder Enabled checkbox does not enable live detection. Understanding both layers teaches modern SOC architecture: detection rules create atomic alerts; correlation reduces cardinality for human analysts.

### Step-by-step walkthrough

1. Open Correlation Builder; note left rule list initialised from shipped detection rules plus any user-created rules.
2. Run Simulate Campaign on Overview to populate alerts.
3. Open Analytics → CORRELATED INCIDENTS: observe alert-level correlation output.
4. Return to Builder; select `Brute Force Attack` rule if present in list.
5. Read conditions and window fields, rule-level correlation design.
6. Click **TEST AGAINST LIVE LOGS**; see matches against alert objects.
7. Compare incident IP clusters on Analytics with Builder rule `sourceIp` conditions.
8. Document mentally: incidents = engine; Builder = design lab.

### Common questions

#### Does Correlation Builder replace the correlation engine?

No. They serve different layers. Builder for authoring patterns; alert correlation for incident objects from existing alerts.

#### If I edit a rule in builder, do overview detections change?

Not for engine-backed behaviour. Local state only unless future integration serialises to detection rules catalog.

#### What is the 60-second incident window?

`IP_WINDOW_MS` in the correlation engine; separate from Builder's per-rule `windowSec` field (default 60), which is not executed by engine in demo.

#### Is STRIDE correlation?

STRIDE classifies threat type on rules, orthogonal to temporal correlation but organised in **MATRIX** tab for coverage review.

### How an analyst uses this during active incident

During incidents, analysts consume correlated incidents on Overview/Analytics; not Builder. Post-incident, they open Builder to prototype a rule capturing the TTP observed, test against saved alert patterns, then hand specification to engineering for detection rules catalog implementation. They avoid assuming Builder enabled rules are blocking attacks live. Plain-language recap: correlation simply means connecting related security signals so analysts review one incident instead of fifty duplicate alerts.

### Edge cases and gotchas

Builder state resets on full page reload; unsaved work lost. Test matches alerts not logs; false confidence if alert fields differ from raw log fields. Incident correlation ignores Builder threshold settings. Two correlation concepts use similar "60" defaults, do not assume linkage. False correlation risks: same IP NAT gateway aggregates unrelated users; incident cluster misattributes activity. Short sixty-second window splits slow attacks across multiple incident rows. Builder test against alerts cannot detect cross-log sequences; only co-occurring fields on single alert objects; fundamental limitation when demoing advanced correlation to experienced hires. Vocabulary precision: event correlation joins raw logs; alert correlation joins alerts via `correlateAlerts`; case correlation merges incidents into cases in Case Manager. Correlation Builder teaches rule condition correlation, students should articulate which layer answers their question (logs related, alerts same incident, or event matches detection pattern). For onboarding, use a single simulated campaign to walk through all three layers before anyone opens Builder expecting live detection changes. `correlateAlerts` is O(n²) at demo scale; enterprise volume may need incremental clustering.
