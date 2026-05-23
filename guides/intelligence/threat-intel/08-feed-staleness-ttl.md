---
module: Threat Intelligence
sidebar: Intelligence → Threat Intel
section: Intelligence
subsection: Feed staleness and TTL
last_updated: 2026-05-23
---

# Feed staleness and TTL

**Part of:** Intelligence → Threat Intel
**One-sentence focus:** IP reputation and composite risk scores derived from alerts and static threat data.

![Threat Intelligence main view](../../../screenshots/guides/intelligence-threat-intel.png)

### What you are looking at

No TTL countdown on cards. Scores live until alerts cleared or IPs stop appearing. SOAR lookup may show Total Reports timestamp implicitly via API; not rendered here.

### What is happening underneath

Attackers rotate IPs hourly; static `THREAT_DB` never expires in demo. Production would decay scores over time; not implemented. Clearing alerts reduces dynamic portion but base remains for known bad entries. Intelligence → Threat Intel (Threat Intel screen) transforms raw alert IPs into prioritised ThreatCard rows using `buildThreatScores()` from threat intelligence module. The page is passive: no lookup button, no API calls to AbuseIPDB, those belong to SOAR Console → Manual Lookup. Cards split **EXTERNAL THREATS** vs **INTERNAL HOSTS** via `isInternal()` prefix checks (`192.168.`, `10.0.`, `172.16.`). Scores combine static `THREAT_DB` base values with dynamic alert weight `min(count*3, 40)`, capped at 100. Footer **SCORING METHODOLOGY** documents bands: 0–39 low, 40–59 medium, 60–79 high, 80–100 critical; note SOAR auto-block uses 75, not 80, a deliberate or accidental mismatch worth harmonising in runbooks.

### Why this matters

Stale intel causes false blocks (old Tor exit reassigned) or missed threats (new IP same actor). Teams schedule feed refreshes and watchlist reviews.

### Step-by-step walkthrough

1. Weekly: compare Threat Intel list with SOAR watchlist.
2. Remove blocks for IPs quiet 30+ days (manual unblock).
3. Re-run Simulate to test fresh IPs.
4. Document rotation assumption in case notes.

### Common questions

#### When does an IP leave the list?

When no alerts reference it: drops from `buildThreatScores` output entirely.

#### Attacker new IP same campaign?

New card with lower base until reports accumulate. Watch dynamic climb.

#### TTL for abuse reports?

Vendor-specific, typically months; not shown in Threat Intel UI.

#### Stale static DB entry?

Requires developer update to `THREAT_DB`.

### What analysts do when the pager fires

Do not trust year-old classification without fresh SOAR lookup during P1.

### Edge cases and gotchas

Clearing all alerts empties Threat Intel entirely; confusing if executives expect persistent bad-guy list. KPI tiles (IPs TRACKED, **CRITICAL RISK**, **HIGH RISK**, **KNOWN BAD**) give executives at-a-glance posture without reading every card. [KNOWN BAD] blink tags appear when IP exists in static DB; border glow activates at scores ≥80. **TOP SEV** surfaces highest alert severity per IP using bracketed labels like [CRITICAL]. Empty state **NO DATA // GENERATE ALERTS FIRST** triggers when `alerts.length === 0`: Threat Intel is downstream of detection, reinforcing that intelligence here is processed alert data plus curated DB entries, not a standalone feed download. Use Threat Intel to rank which IPs deserve expensive AbuseIPDB queries first during alert floods; use SOAR to execute lookups and watchlist adds; use IOC Watchlist for organisational indicators (domains, hashes, campaign-specific C2) that static DB will miss. VirusTotal is referenced in IOC defaults but not wired into Threat Intel scoring. CISA-known-bad client stub returns false in browser. Server-side lookup paths may set flags during SOAR enrichment instead. Scores recompute from current alerts only, no historical IP memory after alerts clear. Dynamic portion lacks TTL decay; an IP quiet for weeks but still in alert store keeps elevated weight. Clearing all alerts empties Threat Intel entirely, which can surprise executives expecting a persistent bad-guy list. Weekly process: reconcile top cards with SOAR watchlist, remove stale blocks, refresh classifications via Manual Lookup before major incidents. Threat Intel ranks observed attacker IPs; it does not replace SOAR enrichment. When scores disagree with AbuseIPDB confidence in Manual Lookup, explain the difference: static `THREAT_DB` base plus capped dynamic alert weight versus crowd-sourced abuse reports. Harmonise executive thresholds with SOAR auto-block at 75 or document why critical cards start at 80 while automation fires earlier.
