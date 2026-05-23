---
module: Overview
sidebar: Monitor → Overview
section: Monitor
subsection: The dashboard-at-a-glance philosophy
last_updated: 2026-05-23
---

# The dashboard-at-a-glance philosophy

**Part of:** Monitor → Overview
**One-sentence focus:** Overview compresses posture, volume, and urgency into one three-column layout so analysts can decide in seconds whether the organisation is under attack.

![Overview main view](../../../screenshots/guides/monitor-overview.png)

### What you are looking at

Monitor → Overview renders Overview dashboard as a full-height three-column console. Across the top, a system header bar reads `>> SOC OVERVIEW //` followed by today's date, then live counters: **UPTIME**, **LOGS**, **RULES** (enabled count over total), **INCIDENTS** (active count, blinking red when non-zero), and **ENGINE** (showing `READY` or `SIMULATING`). The left column (208px) stacks five labelled sections: **ALERT SUMMARY**, **SIMULATION**, **ALERT ACTIONS**, **SYSTEM**, and **EXPORT**. The centre column is the alert feed with status tabs **ALL**, **NEW**, **ACKNOWLEDGED**, **RESOLVED**, severity filters, a **TIME:** row with **1M / 5M / 15M / 1H / ALL**, and an **EXPAND / COLLAPSE** toggle. The right column (224px) shows **ACTIVE INCIDENTS**, **TOP ATTACKERS**, **RULE ACTIVITY**, **THREAT SCORES**, and **SEV BREAKDOWN**. When alerts exist, each row displays a severity badge, rule category tags, optional **SIM** badge, **ACK** and **RES** buttons, source IP, event type, and a truncated timestamp. Think of this screen like the instrument panel in an air-traffic control tower: you are not reading every flight plan in detail yet, but you can instantly see whether planes are stacking up, whether any are in distress, and which runways are active. The Overview applies that same "single glance, whole picture" idea to security operations, posture, volume, and urgency compressed into one layout.

### What is happening underneath

All visible numbers derive from the SIEM context pipeline in the SIEM context pipeline. On login, the provider calls `api.getState()` against the SQLite-backed Express server and hydrates `alerts`, `cases`, `soarLog`, and the IOC watchlist. Alert statistics come from `getAlertStats()`, which recomputes whenever the `alerts` array changes. The centre feed applies client-side filters: status tab, severity chip, and time window (`TIME_FILTERS` maps labels to millisecond cutoffs). Visible alerts are reversed so newest appear at top, when `alerts.length` increases, `feedRef` scrolls to zero. Incidents shown in the banner and right panel are not stored separately; they are computed on every render via incident correlation in the correlation engine, clustering alerts from the same `sourceIp` within a 60-second window. Threat scores come from `buildThreatScores(alerts)` in the threat intelligence module, blending static reputation data with dynamic alert counts. Rule hit bars reflect in-memory `detectionRules` hit counters updated by `processLogs()` on the detection engine. Uptime is a local component timer from mount time, not server uptime.

### Why this matters

Security incidents compress decision time. A CISO walking past a SOC screen, or a tier-1 analyst starting a shift, needs an answer to one question before anything else: "Are we okay right now?" A scattered interface, alerts in one tab, logs in another, rules somewhere else; forces cognitive assembly under stress. Overview exists because missed context in the first thirty seconds of an incident often determines whether containment happens before exfiltration. If the header shows `3 ACTIVE` incidents while **UNREAD** climbs and **ENGINE: SIMULATING** is orange, that tells a story immediately. If everything reads zero and **NO THREATS DETECTED** fills the feed, the analyst can deprioritise panic and focus on tuning or hunting.

### Step-by-step walkthrough

1. Sign in to HABIBI-SIEM and select Monitor → Overview from the sidebar (global header routes to the `Dashboard` component).
2. Read the header bar left-to-right: confirm **LOGS** is increasing if ingestion is running, check **RULES** shows enabled rules (not `0/12`), note **INCIDENTS** active count.
3. Scan **ALERT SUMMARY** in the left column: **CRITICAL** and **UNREAD** are your urgency signals; **RESOLVED** shows triage progress.
4. If the feed is empty, click [ SIMULATE CAMPAIGN ] (requires write role) or ingest logs via Ingest → Log Ingestion.
5. Use status tabs to isolate **NEW** alerts; click a row to open `AlertDetailModal` with matched rules and raw log fields.
6. Acknowledge individual alerts with **ACK** or bulk-triage with [ ACK ALL NEW ] / [ ACK CRITICAL ].
7. Cross-check the right column: **TOP ATTACKERS** for concentration, **THREAT SCORES** for reputation-weighted IPs, **ACTIVE INCIDENTS** for correlated clusters.
8. Export evidence with [ JSON EXPORT ], [ CSV EXPORT ], or [ GEN REPORT ] if your role has `canExport`.

### Common questions

#### Why does the overview show so many numbers? can't one risk score be enough?

A single risk score (HABIBI-SIEM computes one internally for reports) hides composition. You might have a moderate score driven by three critical alerts on one IP, or the same score spread across fifty low-severity noise events. The Overview deliberately surfaces **TOTAL**, per-severity counts, **UNREAD**, rule hits, and incident clusters separately so an analyst can distinguish "one serious attacker" from "many minor events." Executives may want one number; operators need the decomposition.

#### What should I look at first when I sit down for a shift?

Follow the header bar, then **UNREAD** and **CRITICAL** in **ALERT SUMMARY**, then the red **ACTIVE INCIDENT** banner if present. Only after those three checks should you read individual alert rows. This mirrors standard SOC shift-handover: posture first, detail second.

#### Is an empty overview good news or broken ingestion?

Both are possible. If **LOGS** stays at zero and the feed shows **NO THREATS DETECTED**, ingestion may not be running; check Monitor → Pipeline Health and Ingest → Log Ingestion. If **LOGS** climbs but alerts stay zero, rules may be paused ([ RULES: PAUSE ALL ] state) or detections may not match your traffic. Empty with rising log counts often means healthy traffic with no rule hits, which is plausible but should be verified against expected test traffic.

#### Who is allowed to click the red buttons like **[ CLEAR ALL ]**?

RBAC gates destructive actions. `clearAlerts` requires `canAdmin` (tier3/manager). Acknowledge and resolve require `canWrite` (tier2+). Tier1/auditor roles can view Overview and export but cannot mutate alert state. Attempting restricted actions silently no-ops in the UI, the SQLite backend also enforces permissions on API routes.

### Analyst workflow under pressure

During an active incident, Overview becomes the triage cockpit. The analyst sets the time filter to **15M** or **1H**, switches the status tab to **NEW**, and sorts mentally by severity badges. Critical rows trigger the toast registered via `onCritical()`; a popup titled **CRITICAL THREAT** with rule name and IP. They hit **ACK** on rows they are investigating to signal ownership, use **ACK CRITICAL** for bulk acknowledgement of the obvious fires, and watch **ACTIVE INCIDENTS** for IP clusters that may represent a single campaign. **TOP ATTACKERS** identifies whether one source IP dominates, if so, they pivot to Intelligence → IOC Watchlist or Respond → SOAR for blocking. Keyboard shortcuts accelerate work: N filters new, A shows all, S runs simulate (lab only), C clears all (admin). Sound alerts ([ SOUND: ON ]) audibly ping on critical severity when enabled.

### Edge cases and gotchas

Resolved alerts render at 35% opacity with strikethrough rule names; they still count in **TOTAL** unless cleared. The **SIM** badge marks alerts from `simulateCampaign()`; do not confuse these with production ingestion during stakeholder demos. Time filters apply to alert `timestamp`, not ingestion order; an old alert acknowledged today still disappears under **1M** if its timestamp is older than one minute. **EXPAND** toggles `feedExpanded` state but the current component stores the flag without layout change; the control is wired for future layout modes. Uptime in the header is browser-session uptime, not server process uptime. `[ GEN REPORT ]` downloads a plain-text summary, not a PDF, suitable for quick notes, not board packs.

> **Technical note:** Overview does not poll the server on an interval. React re-renders when `the SIEM context pipeline` state changes; new alerts from `processLogs()`, manual status updates persisted via `api.saveAlerts()`, or hydration on login. Real-time feel depends on log ingestion frequency, not WebSocket push.
