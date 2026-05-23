---
module: Threat Intelligence
sidebar: Intelligence → Threat Intel
section: Intelligence
subsection: The confidence score
last_updated: 2026-05-23
---

# The confidence score

**Part of:** Intelligence → Threat Intel
**One-sentence focus:** IP reputation and composite risk scores derived from alerts and static threat data.

![Threat Intelligence main view](../../../screenshots/guides/intelligence-threat-intel.png)

### What you are looking at

Large score 0–100 with colour: ≥80 red `#ff0040`, ≥60 orange `#ff6600`, ≥40 amber `#ffaa00`, else blue `#00aaff`. Label **CRITICAL RISK**, **HIGH RISK**, etc. From `scoreToRisk()`. **TOP SEV** shows bracketed severity [CRITICAL]. KPI **CRITICAL RISK** counts scores ≥80; **HIGH RISK** counts 60–79.

### What is happening underneath

Formula: `score = min(base + dynamic, 100)` where base from DB or defaults (20 external, 5 internal). AbuseIPDB uses different scale but same 0–100 metaphor in SOAR. Threshold alignment: SOAR blocks at **75**; Threat Intel labels critical at **80**; slight inconsistency. Intelligence → Threat Intel (Threat Intel screen) transforms raw alert IPs into prioritised ThreatCard rows using `buildThreatScores()` from threat intelligence module. The page is passive: no lookup button, no API calls to AbuseIPDB; those belong to SOAR Console → Manual Lookup. Cards split **EXTERNAL THREATS** vs **INTERNAL HOSTS** via `isInternal()` prefix checks (`192.168.`, `10.0.`, `172.16.`). Scores combine static `THREAT_DB` base values with dynamic alert weight `min(count*3, 40)`, capped at 100. Footer **SCORING METHODOLOGY** documents bands: 0–39 low, 40–59 medium, 60–79 high, 80–100 critical, note SOAR auto-block uses 75, not 80, a deliberate or accidental mismatch worth harmonising in runbooks.

### Why this matters

Colour drives muscle memory. Misaligned thresholds between modules cause "why critical here but not auto-blocked?" questions; teams should harmonise policy.

### Step-by-step walkthrough

1. Identify red-glowing cards (≥80).
2. Cross-check **ALERTS** count driving dynamic portion.
3. For score 60–79, plan manual SOAR block evaluation.
4. Explain to executives: 80+ = drop everything; 40–59 = monitor.

### Common questions

#### What does score 0 mean?

Unlikely displayed: minimum bases are 5 or 20. Theoretically no alerts and unknown IP → 20.

#### Is 50% confidence "maybe bad"?

Medium band. Treat as investigate, not auto-block by Threat Intel rules.

#### How is abuse confidence different?

Crowd reports vs this app's base+dynamic blend.

#### Do colours match alert manager?

Similar palette philosophy; hex values may differ slightly.

### What analysts do when the pager fires

Red cards first; use **TOP SEV** to break ties on equal scores.

### Edge cases and gotchas

Single critical alert adds up to +3 dynamic, not +40. Known bad DB entry with few alerts still high base. KPI tiles (IPs TRACKED, **CRITICAL RISK**, **HIGH RISK**, **KNOWN BAD**) give executives at-a-glance posture without reading every card. [KNOWN BAD] blink tags appear when IP exists in static DB; border glow activates at scores ≥80. **TOP SEV** surfaces highest alert severity per IP using bracketed labels like [CRITICAL]. Empty state **NO DATA // GENERATE ALERTS FIRST** triggers when `alerts.length === 0`; Threat Intel is downstream of detection, reinforcing that intelligence here is processed alert data plus curated DB entries, not a standalone feed download. Use Threat Intel to rank which IPs deserve expensive AbuseIPDB queries first during alert floods; use SOAR to execute lookups and watchlist adds; use IOC Watchlist for organisational indicators (domains, hashes, campaign-specific C2) that static DB will miss. VirusTotal is referenced in IOC defaults but not wired into Threat Intel scoring. CISA-known-bad client stub returns false in browser: server-side lookup paths may set flags during SOAR enrichment instead. Scores recompute from current alerts only. No historical IP memory after alerts clear. Dynamic portion lacks TTL decay; an IP quiet for weeks but still in alert store keeps elevated weight. Clearing all alerts empties Threat Intel entirely, which can surprise executives expecting a persistent bad-guy list. Weekly process: reconcile top cards with SOAR watchlist, remove stale blocks, refresh classifications via Manual Lookup before major incidents. Threat Intel ranks observed attacker IPs; it does not replace SOAR enrichment. When scores disagree with AbuseIPDB confidence in Manual Lookup, explain the difference: static `THREAT_DB` base plus capped dynamic alert weight versus crowd-sourced abuse reports. Harmonise executive thresholds with SOAR auto-block at 75 or document why critical cards start at 80 while automation fires earlier.
