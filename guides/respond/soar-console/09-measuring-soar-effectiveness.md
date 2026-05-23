---
module: SOAR Console
sidebar: Respond → SOAR
section: Respond
subsection: Measuring SOAR effectiveness
last_updated: 2026-05-23
---

# Measuring SOAR effectiveness

**Part of:** Respond → SOAR
**One-sentence focus:** Review automated orchestration, enrichment lookups, playbooks, and the SOAR audit log.

![SOAR Console main view](../../../screenshots/guides/respond-soar-console.png)

### What you are looking at

No dedicated MTTR dashboard inside SOAR Console. Proxies: SOAR Audit Log entry density (actions per incident), **WATCHLIST** size, Active Threats count trending down after automation, and Intelligence → Risk Scoring composite score formula referencing blocked IPs as mitigated. Infrastructure → Analytics may show broader MTTR if implemented.

### What is happening underneath

MTTR mathematically needs incident start/end timestamps, partially available across Incidents (**FIRST SEEN**), alert resolved times, and SOAR WATCHLIST_ADD time. False positive rate needs tracked manual unblocks, not instrumented. `riskScore` weights active critical/high alerts and active incidents, not SOAR directly. Respond → SOAR Console (SOAR Console screen) implements the shape of enterprise SOAR (playbooks, enrichment, containment, audit) without claiming hundreds of vendor integrations. The 220px left rail is fixed width so playbook counts, active threat counts, and watchlist totals remain visible while analysts scroll long audit tables. Every containment action funnels through the block-IP action in the SIEM context pipeline, which calls watchlist API, updates the `blockedIps` Set, and writes a SOAR log row with `enforcement: 'watchlist_only'`. That string is not cosmetic; it is the honest contract that demo blocking is correlation and visibility, not automatic firewall drop. Brief executives using airport security analogies: lookup is passport check; watchlist is the no-fly list; true network block requires a separate enforcement plane you integrate in production. The five shipped playbooks (brute force, SQL injection, data exfiltration, privilege escalation, XSS) are static `PLAYBOOKS` array entries, reference documents, not executable workflows. Each includes MITRE tactic/technique codes, STRIDE-flavoured descriptions, six SOP steps, and a displayed `automatedCountermeasure: 'blockIp'`. During bridge calls, read SOP steps aloud while a scribe tracks completion in Case Manager; do not assume clicking the playbook executes step 3 on a firewall. When adding a sixth playbook in code, mirror checklist steps in Incidents screen's `PLAYBOOK` constant to avoid trainee confusion between modules.

### Why this matters

Budget holders ask "did SOAR pay for itself?" Metrics justify licensing and headcount. Without measurement, automation accrues silent false positives eroding trust.

### Step-by-step walkthrough

1. Baseline: run campaign without auto-block (`canWrite` off or no ingest), record time to first block manually.
2. Enable automation; rerun campaign; compare time from first alert to first WATCHLIST_ADD log entry.
3. Track manual unblocks or IP_LOOKUP_ERROR rate weekly.
4. Present **WATCHLIST** growth vs Active Threats shrinkage to leadership.
5. Tune SOAR_BLOCK_THRESHOLD if false positive rate unacceptable (requires code/config change).

### Common questions

#### Does the UI show MTTR before/after?

#### How to count false positive blocks?

Manual audit of watchlisted IPs reversed within 24h, not automated.

#### Does blocked IP count reduce risk score?

Displayed as mitigated label on Risk Scoring card: not subtractive in formula.

#### Can I export metrics?

Use Reporting modules or copy entries from the SOAR audit log.

### What analysts do when the pager fires

Less about live incident than retrospective. Analyst flags false block in case notes for MTTR/FP weekly review. Automatic enrichment on ingest executes inside log processing when severity is critical or high, the IP is public (non-RFC1918), and `canWrite` is true. The path calls `soarCheckIp` → GET `/api/threat/ip/:ip` → AbuseIPDB proxy, logging IP_LOOKUP, IP_SCORED, or IP_LOOKUP_ERROR. When `abuseConfidenceScore` exceeds `SOAR_BLOCK_THRESHOLD` (75) or CISA-known-bad flags apply server-side, `blockIp` may run with operator **SYSTEM**. Manual paths on Active Threats and Manual Lookup attribute `usernameRef.current` as operator. Train analysts to read the audit log after every campaign: automation silently failing (API key missing, rate limit) looks like "nothing happened" unless IP_LOOKUP_ERROR rows are monitored.

### Edge cases and gotchas

Simulated traffic skews metrics. Watchlist-only blocks do not measure true traffic stop. Log truncation hides early actions needed for MTTR calculation. SOAR Console does not ship MTTR widgets, yet MTTR is derivable: timestamp first critical alert (`firstSeen` in Incidents), timestamp first WATCHLIST_ADD in audit log, timestamp alert resolution in Alert Manager. Track false positives by auditing manual unblocks (`unblockIp`) within twenty-four hours of auto blocks, not instrumented today, but necessary before raising `SOAR_BLOCK_THRESHOLD`. Read-only sessions disable automation during ingest; verify role assignments before blaming "SOAR broken" during demos. Treat the footer disclaimer (watchlist only, not firewall-enforced) as mandatory language in every executive deck involving SOAR metrics. The audit log is your strongest compliance artefact in this module: pair **TIME** with Incidents **FIRST SEEN** and Case Manager note timestamps when reconstructing timelines. If IP_LOOKUP_ERROR spikes during an exercise, check API key configuration before assuming attacks stopped.
