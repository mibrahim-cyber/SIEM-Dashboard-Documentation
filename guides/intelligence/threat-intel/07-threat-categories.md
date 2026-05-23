---
module: Threat Intelligence
sidebar: Intelligence → Threat Intel
section: Intelligence
subsection: Threat categories
last_updated: 2026-05-23
---

# Threat categories

**Part of:** Intelligence → Threat Intel
**One-sentence focus:** IP reputation and composite risk scores derived from alerts and static threat data.

![Threat Intelligence main view](../../../screenshots/guides/intelligence-threat-intel.png)

### What you are looking at

**CLASSIFICATION** uppercase label on each card (**KNOWN ATTACKER**, **TOR EXIT NODE**, **FLAGGED RANGE**, **SUSPICIOUS**, **INTERNAL HOST**, **UNKNOWN**). Derived from `THREAT_DB.label` or defaults. Alert-driven categories appear in Incidents, not duplicated here.

### What is happening underneath

Categories imply different response: Tor exit may be legitimate user privacy tool vs attacker; context matters. Known Attacker warrants immediate block. VPS/Hosting may be bulletproof hosting; investigate before block to avoid collateral. Intelligence → Threat Intel (Threat Intel screen) transforms raw alert IPs into prioritised ThreatCard rows using `buildThreatScores()` from threat intelligence module. The page is passive: no lookup button, no API calls to AbuseIPDB, those belong to SOAR Console → Manual Lookup. Cards split **EXTERNAL THREATS** vs **INTERNAL HOSTS** via `isInternal()` prefix checks (`192.168.`, `10.0.`, `172.16.`). Scores combine static `THREAT_DB` base values with dynamic alert weight `min(count*3, 40)`, capped at 100. Footer **SCORING METHODOLOGY** documents bands: 0–39 low, 40–59 medium, 60–79 high, 80–100 critical; note SOAR auto-block uses 75, not 80, a deliberate or accidental mismatch worth harmonising in runbooks.

### Why this matters

One-size-fits-all blocking harms business partnerships. Classification prompts proportionate response.

### Step-by-step walkthrough

1. Read **CLASSIFICATION** before block.
2. Tor: check corporate policy on Tor access.
3. Scanner: rate-limit vs full block.
4. Known Attacker: aggressive containment.
5. Unknown: enrich in SOAR then decide.

### Common questions

#### Are categories from MITRE?

No: custom labels in static DB.

#### Malware vs phishing distinction here?

Not detailed. Use alert rule names. Would appear via alert rules; card won't say DDoS explicitly. Low priority unless paired with auth abuse alerts.

### How an analyst uses this during an active incident

Brief commander: "Three critical scores, two Known Attacker, one Tor exit, policy says block attackers only."

### Edge cases and gotchas

**UNKNOWN** ISP/country with high dynamic score from alert volume alone; intel gap, prioritize lookup. KPI tiles (IPs TRACKED, **CRITICAL RISK**, **HIGH RISK**, **KNOWN BAD**) give executives at-a-glance posture without reading every card. [KNOWN BAD] blink tags appear when IP exists in static DB; border glow activates at scores ≥80. **TOP SEV** surfaces highest alert severity per IP using bracketed labels like [CRITICAL]. Empty state **NO DATA // GENERATE ALERTS FIRST** triggers when `alerts.length === 0`: Threat Intel is downstream of detection, reinforcing that intelligence here is processed alert data plus curated DB entries, not a standalone feed download. Use Threat Intel to rank which IPs deserve expensive AbuseIPDB queries first during alert floods; use SOAR to execute lookups and watchlist adds; use IOC Watchlist for organisational indicators (domains, hashes, campaign-specific C2) that static DB will miss. VirusTotal is referenced in IOC defaults but not wired into Threat Intel scoring. CISA-known-bad client stub returns false in browser. Server-side lookup paths may set flags during SOAR enrichment instead. Scores recompute from current alerts only, no historical IP memory after alerts clear. Dynamic portion lacks TTL decay; an IP quiet for weeks but still in alert store keeps elevated weight. Clearing all alerts empties Threat Intel entirely, which can surprise executives expecting a persistent bad-guy list. Weekly process: reconcile top cards with SOAR watchlist, remove stale blocks, refresh classifications via Manual Lookup before major incidents. Threat Intel ranks observed attacker IPs; it does not replace SOAR enrichment. When scores disagree with AbuseIPDB confidence in Manual Lookup, explain the difference: static `THREAT_DB` base plus capped dynamic alert weight versus crowd-sourced abuse reports. Harmonise executive thresholds with SOAR auto-block at 75 or document why critical cards start at 80 while automation fires earlier.
