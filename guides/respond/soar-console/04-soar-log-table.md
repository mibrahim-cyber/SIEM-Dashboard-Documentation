---
module: SOAR Console
sidebar: Respond → SOAR
section: Respond
subsection: Every element of the SOAR log table
last_updated: 2026-05-23
---

# Every element of the SOAR log table

**Part of:** Respond → SOAR
**One-sentence focus:** Review automated orchestration, enrichment lookups, playbooks, and the SOAR audit log.

![SOAR Console main view](../../../screenshots/guides/respond-soar-console.png)

### What you are looking at

SOAR Audit Log tab renders a full-width table with headers **TIME**, **ACTION**, **TARGET**, **SCORE**, **DETAILS**. Rows use monospace 10px font; **TIME** shows locale time string; **ACTION** is colour-coded; **TARGET** is usually an IP; **SCORE** shows number or em dash; **DETAILS** truncates with ellipsis at 280px. Empty state: No SOAR actions yet; start ingestion to trigger auto-checks. Row hover applies cyan tint.

### What is happening underneath

`soarLog` is dashboard state initialised from server `state.soarLog`, prepending up to **100** entries via SOAR log append. Each entry: `{ id, timestamp, action, target, reason, score, operator, enforcement? }`. Actions include IP_LOOKUP, IP_SCORED, IP_LOOKUP_ERROR, WATCHLIST_ADD (mapped colour as IP_BLOCKED in `actionColor`; label mismatch worth noting). Persisted through SOAR log API. Respond → SOAR Console (SOAR Console screen) implements the shape of enterprise SOAR, playbooks, enrichment, containment, audit; without claiming hundreds of vendor integrations. The 220px left rail is fixed width so playbook counts, active threat counts, and watchlist totals remain visible while analysts scroll long audit tables. Every containment action funnels through the block-IP action in the SIEM context pipeline, which calls watchlist API, updates the `blockedIps` Set, and writes a SOAR log row with `enforcement: 'watchlist_only'`. That string is not cosmetic; it is the honest contract that demo blocking is correlation and visibility, not automatic firewall drop. Brief executives using airport security analogies: lookup is passport check; watchlist is the no-fly list; true network block requires a separate enforcement plane you integrate in production. The five shipped playbooks (brute force, SQL injection, data exfiltration, privilege escalation, XSS) are static `PLAYBOOKS` array entries, reference documents, not executable workflows. Each includes MITRE tactic/technique codes, STRIDE-flavoured descriptions, six SOP steps, and a displayed `automatedCountermeasure: 'blockIp'`. During bridge calls, read SOP steps aloud while a scribe tracks completion in Case Manager; do not assume clicking the playbook executes step 3 on a firewall. When adding a sixth playbook in code, mirror checklist steps in Incidents screen's `PLAYBOOK` constant to avoid trainee confusion between modules.

### Why this matters

Forensics and compliance ask "who blocked this IP and why?" six months later. The log is stronger evidence than analyst memory. Insurers and regulators treat automated actions like human actions. They must be attributable.

### Step-by-step walkthrough

1. Trigger activity via Simulate Campaign or Manual Lookup.
2. Open SOAR Audit Log.
3. Identify chronological sequence: IP_LOOKUP → IP_SCORED → possible WATCHLIST_ADD.
4. Read **DETAILS** for score, country, ISP, CISA flag text.
5. Note operator column is not displayed in UI but exists in data (**SYSTEM** vs username).
6. Export by copy/paste or future report feature for tickets.

### Common questions

#### Why does ACTION say WATCHLIST_ADD but colour like IP_BLOCKED?

UI maps `actionColor.IP_BLOCKED` for red styling; actual action string is WATCHLIST_ADD from `blockIp`.

#### How long are logs kept?

Last 100 in client state plus server persistence, check backend retention settings.

#### Can I filter the log?

Not in current UI; scroll only.

#### What if lookup fails?

IP_LOOKUP_ERROR row with reason such as Threat intel unavailable, meaning no auto-watchlist entry.

### Analyst workflow under pressure

Lead requests log screenshot after each containment to attach to case. Investigators correlate **TIME** with firewall logs and Incidents notes. Automatic enrichment on ingest executes inside log processing when severity is critical or high, the IP is public (non-RFC1918), and `canWrite` is true. The path calls `soarCheckIp` → GET `/api/threat/ip/:ip` → AbuseIPDB proxy, logging IP_LOOKUP, IP_SCORED, or IP_LOOKUP_ERROR. When `abuseConfidenceScore` exceeds `SOAR_BLOCK_THRESHOLD` (75) or CISA-known-bad flags apply server-side, `blockIp` may run with operator **SYSTEM**. Manual paths on Active Threats and Manual Lookup attribute `usernameRef.current` as operator. Train analysts to read the audit log after every campaign: automation silently failing (API key missing, rate limit) looks like "nothing happened" unless IP_LOOKUP_ERROR rows are monitored.

### Edge cases and gotchas

High-volume campaigns flood the log. Important entries scroll quickly. **SCORE** null on lookups until IP_SCORED. Mouse enter/leave handlers on rows mutate DOM style directly, accessibility limited. SOAR Console does not ship MTTR widgets, yet MTTR is derivable: timestamp first critical alert (`firstSeen` in Incidents), timestamp first WATCHLIST_ADD in audit log, timestamp alert resolution in Alert Manager. Track false positives by auditing manual unblocks (`unblockIp`) within twenty-four hours of auto blocks, not instrumented today, but necessary before raising `SOAR_BLOCK_THRESHOLD`. Read-only sessions disable automation during ingest: verify role assignments before blaming "SOAR broken" during demos. Treat the footer disclaimer (watchlist only, not firewall enforced) as mandatory language in every executive deck involving SOAR metrics. The audit log is your strongest compliance artefact in this module: pair **TIME** with Incidents **FIRST SEEN** and Case Manager note timestamps when reconstructing timelines. If IP_LOOKUP_ERROR spikes during an exercise, check API key configuration before assuming attacks stopped.
