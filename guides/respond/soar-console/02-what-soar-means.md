---
module: SOAR Console
sidebar: Respond → SOAR
section: Respond
subsection: What SOAR means and why it was invented
last_updated: 2026-05-23
---

# What SOAR means and why it was invented

**Part of:** Respond → SOAR
**One-sentence focus:** Review automated orchestration, enrichment lookups, playbooks, and the SOAR audit log.

![SOAR Console main view](../../../screenshots/guides/respond-soar-console.png)

### What you are looking at

The SOAR Console occupies the full height of the main content area with a fixed 220px left rail labelled **SOAR CONSOLE** and subtitle Security Orchestration & Response. Four navigation tabs stack vertically: Playbook Library (badge count 5), Active Threats (dynamic count of unique high/critical source IPs), Manual Lookup (no count), and SOAR Audit Log (entry count). The bottom of the rail shows **WATCHLIST** with a large orange number equalling `blockedIps.size` and disclaimer text: watchlist only, not firewall enforced. The main pane swaps content by tab: a two-column playbook grid with optional detail drawer, threat cards with **BLOCK IP** / **LOOKUP** buttons, a manual IP form, or a monospace audit table. Imagine an air-traffic control tower: the left rail is your instrument panel; the main view is the runway where actions land.

### What is happening underneath

SOAR here is a lightweight orchestration layer inside SOAR Console screen backed by `the SIEM context pipeline` functions `blockIp`, `unblockIp`, `soarCheckIp`, and SOAR log append. It is not a full enterprise SOAR (Swimlane, Palo Alto XSOAR) but encodes the same ideas: playbooks as structured procedures, automated enrichment on alert ingest, threshold-based containment, and immutable-ish action logs. On each high/critical external alert, log processing calls `soarCheckIp(sourceIp)` which proxies AbuseIPDB through GET `/api/threat/ip/:ip`; keys never hit the browser (AbuseIPDB integration comment). Successful lookups log IP_SCORED; failures log IP_LOOKUP_ERROR. Scores above **75** (`SOAR_BLOCK_THRESHOLD`) trigger `blockIp` and may set related alerts to watchlisted. Respond → SOAR Console (SOAR Console screen) implements the shape of enterprise SOAR, playbooks, enrichment, containment, audit; without claiming hundreds of vendor integrations. The 220px left rail is fixed width so playbook counts, active threat counts, and watchlist totals remain visible while analysts scroll long audit tables. Every containment action funnels through the block-IP action in the SIEM context pipeline, which calls watchlist API, updates the `blockedIps` Set, and writes a SOAR log row with `enforcement: 'watchlist_only'`. That string is not cosmetic; it is the honest contract that demo blocking is correlation and visibility, not automatic firewall drop. Brief executives using airport security analogies: lookup is passport check; watchlist is the no-fly list; true network block requires a separate enforcement plane you integrate in production. The five shipped playbooks (brute force, SQL injection, data exfiltration, privilege escalation, XSS) are static `PLAYBOOKS` array entries, reference documents, not executable workflows. Each includes MITRE tactic/technique codes, STRIDE-flavoured descriptions, six SOP steps, and a displayed `automatedCountermeasure: 'blockIp'`. During bridge calls, read SOP steps aloud while a scribe tracks completion in Case Manager; do not assume clicking the playbook executes step 3 on a firewall. When adding a sixth playbook in code, mirror checklist steps in Incidents screen's `PLAYBOOK` constant to avoid trainee confusion between modules.

### Why this matters

Global analyst shortage and sub-minute ransomware dwell times make manual copy-paste enrichment untenable. SOAR standardises "every suspicious IP gets looked up and maybe watchlisted" so tired humans do not skip steps. The watchlist-only enforcement model is honest about demo scope while teaching where real firewall API integration would attach.

### Step-by-step walkthrough

1. Run Simulate Campaign so Active Threats populates.
2. Open Respond → SOAR Console; note **WATCHLIST** count at bottom-left.
3. Click Active Threats; review unique IPs derived from critical/high alerts with status new.
4. Click **LOOKUP** on one IP; switch to SOAR Audit Log to see IP_LOOKUP then IP_SCORED.
5. If score exceeds **75**, observe auto WATCHLIST_ADD or click **BLOCK IP** manually.
6. Open Playbook Library; select Brute Force Response to read SOP steps and MITRE IDs.
7. Use Manual Lookup for ad-hoc investigation of an IP not yet in alerts.

### Common questions

#### Is this a real SOAR product?

It is a teaching/demo orchestration layer in HABIBI-SIEM. It implements playbook browsing, IP enrichment, watchlist blocking, and audit logging. The shape of SOAR without hundreds of integrations.

#### Why automate if analysts still click buttons?

Ingest-time automation handles scale (every high alert gets intel); buttons handle exceptions (manual block before lookup, playbook review). Both coexist.

#### Does SOAR replace incident response?

No. Incidents group alerts; SOAR executes containment/enrichment. Analysts pivot between modules.

#### Why say "watchlist only"?

`blockIp` sets `enforcement: 'watchlist_only'` in SOAR log entries. Production would call firewall APIs; the demo tracks intent without network changes.

### How an analyst uses this during an active incident

First five minutes: Active Threats tab, **LOOKUP** on top IP, **BLOCK IP** if warranted, confirm log entry, return to Incidents to mark containment. During sustained campaigns, keep SOAR Audit Log visible on a secondary monitor for chain-of-custody. Automatic enrichment on ingest executes inside log processing when severity is critical or high, the IP is public (non-RFC1918), and `canWrite` is true. The path calls `soarCheckIp` → GET `/api/threat/ip/:ip` → AbuseIPDB proxy, logging IP_LOOKUP, IP_SCORED, or IP_LOOKUP_ERROR. When `abuseConfidenceScore` exceeds `SOAR_BLOCK_THRESHOLD` (75) or CISA-known-bad flags apply server-side, `blockIp` may run with operator **SYSTEM**. Manual paths on Active Threats and Manual Lookup attribute `usernameRef.current` as operator. Train analysts to read the audit log after every campaign: automation silently failing (API key missing, rate limit) looks like "nothing happened" unless IP_LOOKUP_ERROR rows are monitored.

### Edge cases and gotchas

Internal IPs never auto-trigger `soarCheckIp` on ingest. Active Threats only shows new high/critical alerts, acknowledged ones disappear from the list even if still dangerous. Playbooks are read-only templates, not executable workflows. SOAR Console does not ship MTTR widgets, yet MTTR is derivable: timestamp first critical alert (`firstSeen` in Incidents), timestamp first WATCHLIST_ADD in audit log, timestamp alert resolution in Alert Manager. Track false positives by auditing manual unblocks (`unblockIp`) within twenty-four hours of auto blocks, not instrumented today, but necessary before raising `SOAR_BLOCK_THRESHOLD`. Read-only sessions disable automation during ingest: verify role assignments before blaming "SOAR broken" during demos.
