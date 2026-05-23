---
module: SOAR Console
sidebar: Respond → SOAR
section: Respond
subsection: Example playbook walkthrough
last_updated: 2026-05-23
---

# Example playbook walkthrough

**Part of:** Respond → SOAR
**One-sentence focus:** Review automated orchestration, enrichment lookups, playbooks, and the SOAR audit log.

![SOAR Console main view](../../../screenshots/guides/respond-soar-console.png)

### What you are looking at

While the spec cites "Suspicious login from new country," the shipped Brute Force Response playbook is the closest live example. Its SOP steps reference authentication failure volume (τ=5 in Δt=60s), AbuseIPDB query, auto-block if score > 75, session revocation, MFA re-enrollment, and Tier 2 notification. The Manual Lookup tab demonstrates the decision branch: confidence bar, threshold message EXCEEDS BLOCK THRESHOLD (75); AUTO-BLOCK TRIGGERED, and EXECUTE CONTainment button when applicable.

### What is happening underneath

Detection side: brute-force rule fires alerts → ingest calls `soarCheckIp` → AbuseIPDB returns `abuseConfidenceScore` → if > 75 and public, `blockIp` runs and alerts may become watchlisted. Manual path: analyst enters IP, `checkAbuseIPDB` via API proxy, `AbuseScore` component colours bar green/yellow/orange/red at thresholds **15**, **40**, **75**. Respond → SOAR Console (SOAR Console screen) implements the shape of enterprise SOAR; playbooks, enrichment, containment, audit, without claiming hundreds of vendor integrations. The 220px left rail is fixed width so playbook counts, active threat counts, and watchlist totals remain visible while analysts scroll long audit tables. Every containment action funnels through the block-IP action in the SIEM context pipeline, which calls watchlist API, updates the `blockedIps` Set, and writes a SOAR log row with `enforcement: 'watchlist_only'`. That string is not cosmetic; it is the honest contract that demo blocking is correlation and visibility, not automatic firewall drop. Brief executives using airport security analogies: lookup is passport check; watchlist is the no-fly list; true network block requires a separate enforcement plane you integrate in production. The five shipped playbooks (brute force, SQL injection, data exfiltration, privilege escalation, XSS) are static `PLAYBOOKS` array entries, reference documents, not executable workflows. Each includes MITRE tactic/technique codes, STRIDE-flavoured descriptions, six SOP steps, and a displayed `automatedCountermeasure: 'blockIp'`. During bridge calls, read SOP steps aloud while a scribe tracks completion in Case Manager; do not assume clicking the playbook executes step 3 on a firewall. When adding a sixth playbook in code, mirror checklist steps in Incidents screen's `PLAYBOOK` constant to avoid trainee confusion between modules.

### Why this matters

Walkthroughs turn abstract automation into inspectable steps trainees can replay. Understanding score bands prevents both over-blocking (lockout) and under-blocking.

### Step-by-step walkthrough

1. Simulate or wait for brute-force alerts from one IP.
2. Confirm auto IP_LOOKUP / IP_SCORED in audit log.
3. If score > 75, verify WATCHLIST_ADD without clicking anything.
4. Open Manual Lookup; enter the same IP; compare response fields (Country, **ISP**, Total Reports, Whitelisted).
5. Read AbuseScore bar and threshold banner.
6. Cross-open Brute Force Response playbook step 3 If score > 75: auto-block at network perimeter.
7. Document in Case Manager whether MFA step was organisational follow-up.

### Common questions

#### What if score is 40–80?

Demo auto-blocks only above **75**. Mid-range requires analyst judgment: no automatic MFA challenge button exists.

#### What if the IP is whitelisted?

Lookup shows Whitelisted: Yes; analyst should not block despite high historical score.

#### Does simulate campaign use real AbuseIPDB?

It uses server proxy; mock data may apply without API keys.

#### Where is login history pulled?

Not implemented in UI. step 1 is aspirational SOP text, not live query.

### Using this view during live response

Analyst validates auto-block decision against lookup card fields, escalates if whitelisted corporate VPN, manually unblocks via API if false positive. Automatic enrichment on ingest executes inside log processing when severity is critical or high, the IP is public (non-RFC1918), and `canWrite` is true. The path calls `soarCheckIp` → GET `/api/threat/ip/:ip` → AbuseIPDB proxy, logging IP_LOOKUP, IP_SCORED, or IP_LOOKUP_ERROR. When `abuseConfidenceScore` exceeds `SOAR_BLOCK_THRESHOLD` (75) or CISA-known-bad flags apply server-side, `blockIp` may run with operator **SYSTEM**. Manual paths on Active Threats and Manual Lookup attribute `usernameRef.current` as operator. Train analysts to read the audit log after every campaign: automation silently failing (API key missing, rate limit) looks like "nothing happened" unless IP_LOOKUP_ERROR rows are monitored.

### Edge cases and gotchas

**EXECUTE CONTAINMENT** only appears when score > 75 and IP not already blocked. Enter key in manual IP field triggers lookup. Loading state shows QUERYING.... SOAR Console does not ship MTTR widgets, yet MTTR is derivable: timestamp first critical alert (`firstSeen` in Incidents), timestamp first WATCHLIST_ADD in audit log, timestamp alert resolution in Alert Manager. Track false positives by auditing manual unblocks (`unblockIp`) within twenty-four hours of auto blocks, not instrumented today, but necessary before raising `SOAR_BLOCK_THRESHOLD`. Read-only sessions disable automation during ingest; verify role assignments before blaming "SOAR broken" during demos. Treat the footer disclaimer (watchlist only, not firewall-enforced) as mandatory language in every executive deck involving SOAR metrics. The audit log is your strongest compliance artefact in this module: pair **TIME** with Incidents **FIRST SEEN** and Case Manager note timestamps when reconstructing timelines. If IP_LOOKUP_ERROR spikes during an exercise, check API key configuration before assuming attacks stopped.
