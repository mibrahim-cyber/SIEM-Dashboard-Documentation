---
module: Pipeline Health
sidebar: Monitor → Pipeline Health
section: Monitor
subsection: Log source status indicators
last_updated: 2026-05-23
---

# Log source status indicators

**Part of:** Monitor → Pipeline Health
**One-sentence focus:** Nine named source cards split aggregate EPS with health badges, illustrative in v4, but teaching how partial outages narrow troubleshooting.

### What you are looking at

Nine cards: Perimeter Firewall, Suricata IDS, NGINX Access Logs, Apache Access Logs, SSH Auth (syslog), Active Directory, PostgreSQL Audit, CrowdStrike EDR, Exchange Mail Logs, each with icon, **HEALTHY / WARNING / DEGRADED / OVERLOAD** badge (colour coded green/yellow/orange/red), EPS actual vs expected, latency in milliseconds, and a health progress bar. Stale source means a witness stopped talking mid-testimony, either innocent technical fault or deliberate silencing.

### What is happening underneath

Health rules in `sourceStats` useMemo:

- `degraded` if `actualEps === 0 && rawLogs.length === 0`
- `warning` if `actualEps < expectedEps * 0.3`
- `overload` if `actualEps > expectedEps * 1.5`
- else `healthy`

Expected EPS per source defined statically (e.g. NGINX 80, EDR 15). Share of total EPS by expected weight. Stale/offline concept approximated by zero actual with zero buffer; not true last-seen timestamp per source.

### Why this matters

Pinpoints which collector broken vs global outage; firewall EPS zero but web logs flowing narrows troubleshooting.

### Step-by-step walkthrough

1. Scan grid for non-green badges.
2. Read actual/expected ratio on suspicious card.
3. Compare sibling web servers NGINX vs Apache; partial outage pattern.
4. Note OVERLOAD on mail logs during phishing wave simulation.
5. Click ingestion stage, confirm receipt description.
6. Escalate to log source owner team with source name + timestamp.
7. Re-check after fix; badge should return HEALTHY.

### Common questions

#### Are these connected real agents?

No; proportional simulation from aggregate EPS for UI demo.

#### What is stale vs degraded here?

Degraded badge covers zero flow; no separate STALE label in code.

#### Can I add sources?

Requires editing `LOG_SOURCES` in Pipeline Health screen and redeploy; not Settings UI.

#### Why random latency?

`10 + floor(random*40)` ms, representing the computed per-source latency estimate.

### Analyst workflow under pressure

If EDR source degraded while network alerts fire, endpoint visibility gap, adjust hunt strategy to network-only evidence.

### Edge cases and gotchas

Global zero logs marks all sources degraded simultaneously; obvious total outage. OVERLOAD dropPct is computed only when a source is in overload health state.

> **Technical note:** `dropPct` variable computed but not displayed in UI; potential future packet loss metric. Adding sources requires editing `LOG_SOURCES` in Pipeline Health screen; not available in Settings UI. Global zero logs marks all nine cards degraded simultaneously, indicating total outage rather than single-source failure.
