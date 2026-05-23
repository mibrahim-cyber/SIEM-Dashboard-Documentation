---
module: Threat Intelligence
sidebar: Intelligence → Threat Intel
section: Intelligence
subsection: IOC types explained
last_updated: 2026-05-23
---

# IOC types explained

**Part of:** Intelligence → Threat Intel
**One-sentence focus:** IP reputation and composite risk scores derived from alerts and static threat data.

![Threat Intelligence main view](../../../screenshots/guides/intelligence-threat-intel.png)

### What you are looking at

Threat Intel focuses on IP addresses only; not domains/hashes on this screen. IOC Watchlist handles broader types. Cards show IP monospace, country, classification string.

### What is happening underneath

IPs weaponised as scan sources, C2 endpoints, credential stuffing origins. `label` field humanises: Tor Exit Node, VPS/Hosting. Attack mechanism: alerts tie IP to matched rules (brute force, SQLi). Intelligence → Threat Intel (Threat Intel screen) transforms raw alert IPs into prioritised ThreatCard rows using `buildThreatScores()` from threat intelligence module. The page is passive: no lookup button, no API calls to AbuseIPDB; those belong to SOAR Console → Manual Lookup. Cards split **EXTERNAL THREATS** vs **INTERNAL HOSTS** via `isInternal()` prefix checks (`192.168.`, `10.0.`, `172.16.`). Scores combine static `THREAT_DB` base values with dynamic alert weight `min(count*3, 40)`, capped at 100. Footer **SCORING METHODOLOGY** documents bands: 0–39 low, 40–59 medium, 60–79 high, 80–100 critical, note SOAR auto-block uses 75, not 80, a deliberate or accidental mismatch worth harmonising in runbooks.

### Why this matters

Junior analysts conflate "bad IP" with "bad email attachment." Separating type-specific modules sets correct response (block IP vs quarantine email).

### Step-by-step walkthrough

1. Treat Threat Intel as IP-specific IOC view.
2. For domain/hash IOCs, open IOC Watchlist.
3. Map classification label to expected attack pattern.
4. Block/contain at network for IPs; different playbooks for files/URLs.

### Common questions

#### Where are domains shown?

IOC Watchlist and alert JSON string search; not Threat Intel cards.

#### Can an IP be innocent?

Yes: CGNAT, VPN egress; verify with SOAR whitelisted flag. Not in Threat Intel. Add via IOC modal type email. VirusTotal cited in IOC table defaults only.

### How an analyst uses this during an active incident

IP-centric attacks (brute force, scanning) stay in Threat Intel; phishing domains pivot to IOC Watchlist hits column.

### Edge cases and gotchas

**INTERNAL** hosts can still have alerts (lateral movement), do not ignore green-ish scores on [INTERNAL] tags. KPI tiles (IPs TRACKED, **CRITICAL RISK**, **HIGH RISK**, **KNOWN BAD**) give executives at-a-glance posture without reading every card. [KNOWN BAD] blink tags appear when IP exists in static DB; border glow activates at scores ≥80. **TOP SEV** surfaces highest alert severity per IP using bracketed labels like [CRITICAL]. Empty state **NO DATA // GENERATE ALERTS FIRST** triggers when `alerts.length === 0`; Threat Intel is downstream of detection, reinforcing that intelligence here is processed alert data plus curated DB entries, not a standalone feed download. Use Threat Intel to rank which IPs deserve expensive AbuseIPDB queries first during alert floods; use SOAR to execute lookups and watchlist adds; use IOC Watchlist for organisational indicators (domains, hashes, campaign-specific C2) that static DB will miss. VirusTotal is referenced in IOC defaults but not wired into Threat Intel scoring. CISA-known-bad client stub returns false in browser: server-side lookup paths may set flags during SOAR enrichment instead. Scores recompute from current alerts only. No historical IP memory after alerts clear. Dynamic portion lacks TTL decay; an IP quiet for weeks but still in alert store keeps elevated weight. Clearing all alerts empties Threat Intel entirely, which can surprise executives expecting a persistent bad-guy list. Weekly process: reconcile top cards with SOAR watchlist, remove stale blocks, refresh classifications via Manual Lookup before major incidents. Threat Intel ranks observed attacker IPs; it does not replace SOAR enrichment. When scores disagree with AbuseIPDB confidence in Manual Lookup, explain the difference: static `THREAT_DB` base plus capped dynamic alert weight versus crowd-sourced abuse reports. Harmonise executive thresholds with SOAR auto-block at 75 or document why critical cards start at 80 while automation fires earlier.
