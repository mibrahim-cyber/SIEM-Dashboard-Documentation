---
module: Overview
sidebar: Monitor → Overview
section: Monitor
subsection: Severity levels (Critical / High / Medium / Low / Info)
last_updated: 2026-05-23
---

# Severity levels (Critical / high / medium / low / info)

**Part of:** Monitor → Overview
**One-sentence focus:** Four severity tiers drive colour coding, sound alerts, bulk triage, and escalation discipline across the Overview feed and side panels.

### What you are looking at

Severity appears everywhere on Overview: coloured left borders on alert rows (red critical `#ff2d55`, orange high `#ff9500`, yellow medium `#ffd60a`, green low `#30d158`), badge labels **CRITICAL / HIGH / MEDIUM / LOW**, **SEV BREAKDOWN** bars, and filter chips **ALL / CRITICAL / HIGH / MEDIUM / LOW** above the feed. Critical new alerts show a blinking dot beside the row. Resolved alerts fade regardless of severity. Think of severity like weather warning levels, advisory, watch, warning, emergency, issued by meteorologists based on measured conditions, not arbitrary colour choices. Each level triggers different public responses; SIEM severities trigger different SOC responses.

### What is happening underneath

Severity is assigned at alert creation inside `processLogs()` on the detection engine based on matched rule definitions in the detection rules catalog. Each rule declares a default severity and STRIDE category. When multiple rules match one log, alert severity typically reflects the highest-severity match (engine merges `matchedRules[]`). There is no separate "Info" level in HABIBI-SIEM UI, only four tiers. Critical alerts invoke `onCritical()` callback (toast) and optional `beep()` if sound enabled. `acknowledgeCritical()` bulk-acknowledges only `new + critical`. Export CSV includes severity column; report text summarises critical/high counts.

### Why this matters

Uniform severity discipline prevents alert fatigue and under-response. If everything is CRITICAL, nothing is. If brute-force attempts are LOW, they may be ignored until cumulative threshold rules fire. Non-technical stakeholders should understand: CRITICAL often means active exploitation or imminent data loss; HIGH means likely malicious activity requiring prompt human review; MEDIUM means suspicious behaviour or policy violation; LOW means informational or reconnaissance worth logging.

### Step-by-step walkthrough

1. Click severity filter **CRITICAL**; feed shows only critical rows; tab counts unchanged.
2. Compare **SEV BREAKDOWN** bar lengths to visual feed density.
3. Open a critical alert modal: read **MATCHED RULES** section for rule-level severity tags.
4. Practice **ACK CRITICAL** to bulk-acknowledge without touching medium/low noise.
5. Toggle **SOUND: ON** and run simulate; hear beep on critical only.
6. Export CSV and verify severity column matches UI badges.
7. Review resolved criticals at 35% opacity, confirm they are not silently deleted.

### Common questions

#### Who decides severity; the analyst or the system?

Initially the system, via rule configuration. Analysts can change status (ack/resolve) but not downgrade severity in the Overview UI; tuning severity requires editing rules in Configure → Rules Engine (admin). Operational severity override would be a case note, not an alert field edit.

#### Can one event be both MEDIUM and HIGH?

One alert row can list multiple matchedRules with different severities; the row badge shows the alert's composite severity (typically highest wins). Modal shows per-rule severity in **MATCHED RULES** blocks.

#### What real attacks map to each level in HABIBI-SIEM?

Simulated examples: repeated brute-force → often high/critical depending on threshold; SQL injection/XSS probes → medium/high; port scan patterns → medium; benign HTTP noise may not alert. Exact mapping depends on enabled rules and thresholds in the detection rules catalog.

#### Is there an INFO severity?

Not in current UI enums. Some enterprise SIEMs add INFO; HABIBI-SIEM collapses informational events into LOW or suppresses them if no rule matches.

### Operational use during containment

Severity filters become temporary blinkers. During ransomware scares, filter **CRITICAL** and **HIGH** first. During DDoS, medium port-scan noise may flood; temporarily filter **CRITICAL** only. Sound and toast on critical ensure eyes-on-glass even when multitasking. Escalation to tier3 includes exporting critical rows with rule names for MITRE mapping in modal.

### Edge cases and gotchas

Deduped alerts still retain original severity. Simulated campaign may spike all severity tiers within seconds, not representative of diurnal production patterns. Severity filters combine with status filters; **NEW + CRITICAL** is the usual war-room view. Resolved criticals still count in **SEV BREAKDOWN** until cleared.

> **Technical note:** `SEV` constant in Overview dashboard maps severity keys to Tailwind border classes and hex colours; keep in sync with global CSS badge classes (`badge-critical`, etc.).

### Operational response matrix

Organisations often map severities to response tiers even when the UI lacks formal SLA timers. A practical HABIBI-SIEM lab mapping: **CRITICAL**: page on-call within minutes, consider SOAR watchlist path for external IPs scoring above threshold 75; **HIGH**, tier2 review within same shift, mandatory case consideration if clustered; **MEDIUM**; tier1 may resolve after documented review if known scanner; **LOW**: batch review weekly unless part of incident cluster. The Overview **ACK CRITICAL** button exists because critical queue depth is the leading indicator of SOC overload; not total alert count. Colour psychology matters across operator skill levels. Red (`#ff2d55`) critical badges align with universal danger signalling; green low severity does not mean "ignore forever", reconnaissance low alerts sometimes precede later critical exploitation from same IP. **SEV BREAKDOWN** bars give managers a histogram without reading rows, if medium bar dominates during demo, explain that tuning may be loose, if critical dominates after simulate, detection is working as designed. Training exercise: run simulate with **SOUND: ON** so trainees associate audio with critical only; prevents alert sound fatigue if medium alerts ever gain audio in future versions. Severity filters combine multiplicatively with status filters; war-room configuration is typically **NEW + CRITICAL** first pass, then widen. Resolved critical rows remain in **SEV BREAKDOWN** totals until cleared; teach analysts to [ CLEAR RESOLVED ] after export for clean shift metrics. Rule authors assign severity in `detectionRules`, changing severity requires admin access to Rules Engine, not inline edit on Overview. Document severity rationale in rule description fields so tier1 analysts trust the badge colours during 3 a.m. incidents. Colour psychology matters across operator skill levels. Red critical badges align with universal danger signalling; green low severity does not mean ignore forever; reconnaissance low alerts sometimes precede later critical exploitation from the same IP. **SEV BREAKDOWN** bars give managers a histogram without reading rows. Training exercise: run simulate with **SOUND: ON** so trainees associate audio with critical only.
