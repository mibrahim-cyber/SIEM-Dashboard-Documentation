---
module: Threat Intelligence
sidebar: Intelligence → Threat Intel
section: Intelligence
subsection: What threat intelligence is and is not
last_updated: 2026-05-23
---

# What threat intelligence is and is not

**Part of:** Intelligence → Threat Intel
**One-sentence focus:** IP reputation and composite risk scores derived from alerts and static threat data.

![Threat Intelligence main view](../../../screenshots/guides/intelligence-threat-intel.png)

### What you are looking at

When alerts exist, Threat Intel renders a terminal-themed page: header >> THREAT INTELLIGENCE // IP REPUTATION & RISK SCORING, four KPI tiles (IPs TRACKED, **CRITICAL RISK**, **HIGH RISK**, **KNOWN BAD**), section > EXTERNAL THREATS (N), optional > INTERNAL HOSTS (N), and footer > SCORING METHODOLOGY. Each ThreatCard shows flag emoji, IP, optional [KNOWN BAD] blink tag, [INTERNAL] tag, ISP line, giant VT323 score number, risk label (**CRITICAL RISK**, etc.), progress bar, and grid fields **COUNTRY**, **ALERTS**, **TOP SEV**, **CLASSIFICATION**. Empty state: **NO DATA // GENERATE ALERTS FIRST**. Raw AbuseIPDB JSON is not dumped here; that enrichment appears in SOAR Manual Lookup. This module uses `buildThreatScores()` from threat intelligence module.

### What is happening underneath

Data = individual alert IPs and counts. Information = aggregated scores with country/ISP labels from `THREAT_DB`. Intelligence = analyst decision to block/escalate using score bands (0–39 low, 40–59 medium, 60–79 high, 80–100 critical per footer). Pipeline: alerts → `buildThreatScores` → split external vs internal via `isInternal()` prefixes → render cards sorted by score descending. Intelligence → Threat Intel (Threat Intel screen) transforms raw alert IPs into prioritised ThreatCard rows using `buildThreatScores()` from threat intelligence module. The page is passive: no lookup button, no API calls to AbuseIPDB; those belong to SOAR Console → Manual Lookup. Cards split **EXTERNAL THREATS** vs **INTERNAL HOSTS** via `isInternal()` prefix checks (`192.168.`, `10.0.`, `172.16.`). Scores combine static `THREAT_DB` base values with dynamic alert weight `min(count*3, 40)`, capped at 100. Footer **SCORING METHODOLOGY** documents bands: 0–39 low, 40–59 medium, 60–79 high, 80–100 critical, note SOAR auto-block uses 75, not 80, a deliberate or accidental mismatch worth harmonising in runbooks.

### Why this matters

Executives confuse "we downloaded a threat feed" with "we act on intelligence." This screen makes the processing chain visible: you need alerts first, then scores, then human action in SOAR.

### Step-by-step walkthrough

1. Generate alerts via Simulate Campaign.
2. Open Intelligence → Threat Intel.
3. Read KPI tiles; **KNOWN BAD** counts IPs in static `THREAT_DB`.
4. Scan **EXTERNAL THREATS** cards sorted by score.
5. Note [KNOWN BAD] and border glow on scores ≥80.
6. Compare internal hosts section: usually lower scores.
7. Read **SCORING METHODOLOGY** footer before briefing leadership.

### Common questions

#### Why is the page empty?

`alerts.length === 0` triggers empty state. Ingest or simulate first.

#### Is this the same as AbuseIPDB?

Partially. Static DB mimics feeds; dynamic component adds alert volume. Live AbuseIPDB is SOAR's job.

#### What's the difference between data and intelligence here?

Data is "IP X appeared." Intelligence is "IP X is critical risk with 12 alerts, block now."

#### Does VirusTotal appear on this screen?

Not directly; IOC Watchlist demo hash cites VirusTotal as source label only.

### Operational use during containment

Sort mentally by score and **TOP SEV**; pivot highest card IP to SOAR block and Incidents playbook.

### Edge cases and gotchas

Unknown external IPs get base score **20** without DB entry. Internal IPs base 5: still listed if they generated alerts. How-to guide mentions "Normal / Brute-force tint" layout modes not present in current Threat Intel screen. ignore unless added later. Use Threat Intel to rank which IPs deserve expensive AbuseIPDB queries first during alert floods; use SOAR to execute lookups and watchlist adds; use **IOC Watchlist** for organisational indicators (domains, hashes, campaign-specific C2) that static DB will miss. VirusTotal is referenced in IOC defaults but not wired into Threat Intel scoring. CISA-known-bad client stub returns false in browser, server-side lookup paths may set flags during SOAR enrichment instead. Scores recompute from current alerts only; no historical IP memory after alerts clear. Dynamic portion lacks TTL decay; an IP quiet for weeks but still in alert store keeps elevated weight. Clearing all alerts empties Threat Intel entirely, which can surprise executives expecting a persistent bad-guy list. Weekly process: reconcile top cards with SOAR watchlist, remove stale blocks, refresh classifications via Manual Lookup before major incidents. Threat Intel ranks observed attacker IPs; it does not replace SOAR enrichment. When scores disagree with AbuseIPDB confidence in Manual Lookup, explain the difference: static `THREAT_DB` base plus capped dynamic alert weight versus crowd-sourced abuse reports. Harmonise executive thresholds with SOAR auto-block at 75 or document why critical cards start at 80 while automation fires earlier.
