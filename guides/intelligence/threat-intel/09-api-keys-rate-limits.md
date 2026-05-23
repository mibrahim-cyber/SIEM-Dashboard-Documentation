---
module: Threat Intelligence
sidebar: Intelligence → Threat Intel
section: Intelligence
subsection: API key management and rate limiting
last_updated: 2026-05-23
---

# API key management and rate limiting

**Part of:** Intelligence → Threat Intel
**One-sentence focus:** IP reputation and composite risk scores derived from alerts and static threat data.

![Threat Intelligence main view](../../../screenshots/guides/intelligence-threat-intel.png)

### What you are looking at

No API key UI on Threat Intel page; Settings/admin handles keys. SOAR shows errors Threat intel unavailable when proxy fails. Demo runs without keys using mock responses.

### What is happening underneath

GET `/api/threat/ip/:ip` server-side holds secrets. Free tiers throttle queries/day; high alert volume could exhaust quota if every alert triggers lookup. Batch helpers exist (`batchCheckAbuseIPDB`) but not used in Threat Intel view. Intelligence → Threat Intel (Threat Intel screen) transforms raw alert IPs into prioritised ThreatCard rows using `buildThreatScores()` from threat intelligence module. The page is passive: no lookup button, no API calls to AbuseIPDB, those belong to SOAR Console → Manual Lookup. Cards split **EXTERNAL THREATS** vs **INTERNAL HOSTS** via `isInternal()` prefix checks (`192.168.`, `10.0.`, `172.16.`). Scores combine static `THREAT_DB` base values with dynamic alert weight `min(count*3, 40)`, capped at 100. Footer **SCORING METHODOLOGY** documents bands: 0–39 low, 40–59 medium, 60–79 high, 80–100 critical; note SOAR auto-block uses 75, not 80, a deliberate or accidental mismatch worth harmonising in runbooks.

### Why this matters

SOCs underestimate API costs until invoice arrives. Separating passive scoring (cheap) from active lookup (API spend) informs architecture.

### Step-by-step walkthrough

1. Admin configures AbuseIPDB key in Settings.
2. Verify `hasRealApiKey()` true before go-live.
3. Monitor SOAR IP_LOOKUP_ERROR rate for quota issues.
4. Tune auto-lookup to critical-only if needed (configuration change).
5. Budget paid tier for production EPS.

### Common questions

#### Are keys in the browser?

#### Rate limit symptoms?

Lookup errors in SOAR log, null scores.

#### Free vs paid accuracy?

Paid often adds history and categories: not differentiated in demo UI. Not required for current Threat Intel implementation.

### What analysts do when the pager fires

If lookups fail mid-incident, fall back to Threat Intel static/dynamic scores and internal watchlists.

### Edge cases and gotchas

Simulate Campaign may spike lookups. Hitting demo limits. Keys in URL params forbidden by design comment in AbuseIPDB integration. KPI tiles (IPs TRACKED, **CRITICAL RISK**, **HIGH RISK**, **KNOWN BAD**) give executives at-a-glance posture without reading every card. [KNOWN BAD] blink tags appear when IP exists in static DB; border glow activates at scores ≥80. **TOP SEV** surfaces highest alert severity per IP using bracketed labels like [CRITICAL]. Empty state **NO DATA // GENERATE ALERTS FIRST** triggers when `alerts.length === 0`, Threat Intel is downstream of detection, reinforcing that intelligence here is processed alert data plus curated DB entries, not a standalone feed download. Use Threat Intel to rank which IPs deserve expensive AbuseIPDB queries first during alert floods; use SOAR to execute lookups and watchlist adds; use IOC Watchlist for organisational indicators (domains, hashes, campaign-specific C2) that static DB will miss. VirusTotal is referenced in IOC defaults but not wired into Threat Intel scoring. CISA-known-bad client stub returns false in browser; server-side lookup paths may set flags during SOAR enrichment instead. Scores recompute from current alerts only: no historical IP memory after alerts clear. Dynamic portion lacks TTL decay; an IP quiet for weeks but still in alert store keeps elevated weight. Clearing all alerts empties Threat Intel entirely, which can surprise executives expecting a persistent bad-guy list. Weekly process: reconcile top cards with SOAR watchlist, remove stale blocks, refresh classifications via Manual Lookup before major incidents. Threat Intel ranks observed attacker IPs; it does not replace SOAR enrichment. When scores disagree with AbuseIPDB confidence in Manual Lookup, explain the difference: static `THREAT_DB` base plus capped dynamic alert weight versus crowd-sourced abuse reports. Harmonise executive thresholds with SOAR auto-block at 75 or document why critical cards start at 80 while automation fires earlier.
