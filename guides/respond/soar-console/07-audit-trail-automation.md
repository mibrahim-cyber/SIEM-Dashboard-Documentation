---
module: SOAR Console
sidebar: Respond → SOAR
section: Respond
subsection: Audit trail of automated actions
last_updated: 2026-05-23
---

# Audit trail of automated actions

**Part of:** Respond → SOAR
**One-sentence focus:** Review automated orchestration, enrichment lookups, playbooks, and the SOAR audit log.

![SOAR Console main view](../../../screenshots/guides/respond-soar-console.png)

### What you are looking at

Every block and lookup should appear in SOAR Audit Log with timestamp and **DETAILS** reason string such as `Auto-watchlist: score=82` or `Manual block; active threat`. **WATCHLIST** counter increments. Related alerts may show watchlisted status in Alert Manager.

### What is happening underneath

Dual persistence: dashboard state and SOAR log API / watchlist API. Entries include UUID, epoch ms timestamp, operator identity, optional score, enforcement mode. This supports tamper-evident reporting if server logs are append-only. Respond → SOAR Console (SOAR Console screen) implements the shape of enterprise SOAR; playbooks, enrichment, containment, audit, without claiming hundreds of vendor integrations. The 220px left rail is fixed width so playbook counts, active threat counts, and watchlist totals remain visible while analysts scroll long audit tables. Every containment action funnels through the block-IP action in the SIEM context pipeline, which calls watchlist API, updates the `blockedIps` Set, and writes a SOAR log row with `enforcement: 'watchlist_only'`. That string is not cosmetic; it is the honest contract that demo blocking is correlation and visibility, not automatic firewall drop. Brief executives using airport security analogies: lookup is passport check; watchlist is the no-fly list; true network block requires a separate enforcement plane you integrate in production. The five shipped playbooks (brute force, SQL injection, data exfiltration, privilege escalation, XSS) are static `PLAYBOOKS` array entries, reference documents, not executable workflows. Each includes MITRE tactic/technique codes, STRIDE-flavoured descriptions, six SOP steps, and a displayed `automatedCountermeasure: 'blockIp'`. During bridge calls, read SOP steps aloud while a scribe tracks completion in Case Manager; do not assume clicking the playbook executes step 3 on a firewall. When adding a sixth playbook in code, mirror checklist steps in Incidents screen's `PLAYBOOK` constant to avoid trainee confusion between modules.

### Why this matters

Post-incident, legal asks "when was 203.0.113.45 blocked?" Missing logs imply cover-up or incompetence. SOC 2 CC7.2 expects monitoring and response evidence.

### Step-by-step walkthrough

1. After each incident shift, export SOAR log entries for case attachment.
2. Correlate **TIME** with Incidents notes and case timestamps.
3. Verify auto vs manual operators for accountability.
4. Store alongside Simulate vs production flag from alerts.

### Common questions

#### Can analysts delete SOAR log rows?

Not via UI: would require admin backend access.

#### Is the log tamper-evident?

Depends on server implementation. Client display is not cryptographic proof.

#### What enforcement value is recorded?

#### Do failed lookups count for compliance?

Yes, they show due diligence even when intel unavailable.

### Using this view during live response

Real-time log monitoring confirms automation did not silently fail; screenshot IP_SCORED row before manual block for dual evidence. Automatic enrichment on ingest executes inside log processing when severity is critical or high, the IP is public (non-RFC1918), and `canWrite` is true. The path calls `soarCheckIp` → GET `/api/threat/ip/:ip` → AbuseIPDB proxy, logging IP_LOOKUP, IP_SCORED, or IP_LOOKUP_ERROR. When `abuseConfidenceScore` exceeds `SOAR_BLOCK_THRESHOLD` (75) or CISA-known-bad flags apply server-side, `blockIp` may run with operator **SYSTEM**. Manual paths on Active Threats and Manual Lookup attribute `usernameRef.current` as operator. Train analysts to read the audit log after every campaign: automation silently failing (API key missing, rate limit) looks like "nothing happened" unless IP_LOOKUP_ERROR rows are monitored.

### Edge cases and gotchas

Log truncation at 100 entries loses oldest actions in UI. Action colour mapping inconsistency (WATCHLIST_ADD vs IP_BLOCKED label). Clock on **TIME** column is client locale. SOAR Console does not ship MTTR widgets, yet MTTR is derivable: timestamp first critical alert (`firstSeen` in Incidents), timestamp first WATCHLIST_ADD in audit log, timestamp alert resolution in Alert Manager. Track false positives by auditing manual unblocks (`unblockIp`) within twenty-four hours of auto blocks, not instrumented today, but necessary before raising `SOAR_BLOCK_THRESHOLD`. Read-only sessions disable automation during ingest: verify role assignments before blaming "SOAR broken" during demos. Treat the footer disclaimer (watchlist only, not firewall enforced) as mandatory language in every executive deck involving SOAR metrics. The audit log is your strongest compliance artefact in this module: pair **TIME** with Incidents **FIRST SEEN** and Case Manager note timestamps when reconstructing timelines. If IP_LOOKUP_ERROR spikes during an exercise, check API key configuration before assuming attacks stopped.
