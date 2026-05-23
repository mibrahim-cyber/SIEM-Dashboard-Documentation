---
module: Threat Intelligence
sidebar: Intelligence → Threat Intel
section: Intelligence
subsection: AbuseIPDB and VirusTotal feeds
last_updated: 2026-05-23
---

# AbuseIPDB and VirusTotal feeds

**Part of:** Intelligence → Threat Intel
**One-sentence focus:** IP reputation and composite risk scores derived from alerts and static threat data.

![Threat Intelligence main view](../../../screenshots/guides/intelligence-threat-intel.png)

### What you are looking at

Threat Intel UI does not call AbuseIPDB directly. SOAR Manual Lookup shows AbuseIPDB Response with Confidence Score, Country, **ISP**, Usage Type, Total Reports, Whitelisted, Public IP. Threat Intel cards instead show **CLASSIFICATION** labels like Known Attacker, Tor Exit Node from local `THREAT_DB`.

### What is happening underneath

`checkAbuseIPDB` routes through the authenticated GET `/api/threat/ip/:ip` proxy so API keys stay server-side. `THREAT_DB` hardcodes demo IPs (203.0.113.45, 185.220.101.45, etc.) with `baseScore` 40–90. `buildThreatScores` merges base + dynamic alert weight (`min(count*3, 40)`). VirusTotal not wired in code paths; mentioned in IOC defaults only. Intelligence → Threat Intel (Threat Intel screen) transforms raw alert IPs into prioritised ThreatCard rows using `buildThreatScores()` from threat intelligence module. The page is passive: no lookup button, no API calls to AbuseIPDB, those belong to SOAR Console → Manual Lookup. Cards split **EXTERNAL THREATS** vs **INTERNAL HOSTS** via `isInternal()` prefix checks (`192.168.`, `10.0.`, `172.16.`). Scores combine static `THREAT_DB` base values with dynamic alert weight `min(count*3, 40)`, capped at 100. Footer **SCORING METHODOLOGY** documents bands: 0–39 low, 40–59 medium, 60–79 high, 80–100 critical; note SOAR auto-block uses 75, not 80, a deliberate or accidental mismatch worth harmonising in runbooks.

### Why this matters

Stakeholders hear vendor names and assume unified integration. Documenting split responsibilities prevents "why doesn't Threat Intel show Abuse confidence?" confusion.

### Step-by-step walkthrough

1. Find IP on Threat Intel card note score **85**.
2. Open SOAR Manual Lookup; query same IP.
3. Compare Abuse confidence with card score: they may differ (different algorithms).
4. Use SOAR for block threshold; use Threat Intel for prioritisation queue.
5. Configure API keys in Settings/admin if live lookups required.

### Common questions

#### Which feed is more accurate?

AbuseIPDB live for recent abuse reports; static DB for offline demo reliability.

#### Why integrate both?

Defence in depth: static known-bad plus crowd dynamic reports plus your own alert history.

#### Free tier limits?

Operational concern for production. Rate limits handled server-side; demo mocks may bypass.

#### VirusTotal for hashes?

Use IOC Watchlist hash entries; no VT API in Threat Intel view.

### Analyst workflow under pressure

Threat Intel narrows which IPs to lookup in SOAR first, don't lookup every IP alphabetically.

### Edge cases and gotchas

`isCisaKnownBad` client stub returns false; CISA determined server-side during lookup. Mock data without API key still demo-friendly. KPI tiles (IPs TRACKED, **CRITICAL RISK**, **HIGH RISK**, **KNOWN BAD**) give executives at-a-glance posture without reading every card. [KNOWN BAD] blink tags appear when IP exists in static DB; border glow activates at scores ≥80. **TOP SEV** surfaces highest alert severity per IP using bracketed labels like [CRITICAL]. Empty state **NO DATA // GENERATE ALERTS FIRST** triggers when `alerts.length === 0`: Threat Intel is downstream of detection, reinforcing that intelligence here is processed alert data plus curated DB entries, not a standalone feed download. Use Threat Intel to rank which IPs deserve expensive AbuseIPDB queries first during alert floods; use SOAR to execute lookups and watchlist adds; use IOC Watchlist for organisational indicators (domains, hashes, campaign-specific C2) that static DB will miss. VirusTotal is referenced in IOC defaults but not wired into Threat Intel scoring. CISA-known-bad client stub returns false in browser. Server-side lookup paths may set flags during SOAR enrichment instead. Scores recompute from current alerts only, no historical IP memory after alerts clear. Dynamic portion lacks TTL decay; an IP quiet for weeks but still in alert store keeps elevated weight. Clearing all alerts empties Threat Intel entirely, which can surprise executives expecting a persistent bad-guy list. Weekly process: reconcile top cards with SOAR watchlist, remove stale blocks, refresh classifications via Manual Lookup before major incidents. Threat Intel ranks observed attacker IPs; it does not replace SOAR enrichment. When scores disagree with AbuseIPDB confidence in Manual Lookup, explain the difference: static `THREAT_DB` base plus capped dynamic alert weight versus crowd-sourced abuse reports. Harmonise executive thresholds with SOAR auto-block at 75 or document why critical cards start at 80 while automation fires earlier.
