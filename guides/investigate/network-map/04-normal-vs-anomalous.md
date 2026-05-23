---
module: Network Map
sidebar: Investigate → Network Map
section: Investigate
subsection: Normal vs anomalous traffic traffic patterns
last_updated: 2026-05-23
---

# Normal vs anomalous traffic traffic patterns

**Sidebar path:** Investigate → Network Map

![Network Map main view](../../../screenshots/guides/investigate-network-map.png)

### What you are looking at

A healthy lab map with simulated campaign data shows uneven spoke distribution, a few large nodes, many small ones, mostly external IPs. Under active incident, animated ping rings pulse on nodes with `incidents.status === 'active'`, connection lines brighten to severity colour with dashed `4 2` pattern, opacity 0.7. Quiet map: all dim lines, no ping animation, mostly low-severity cyan nodes.

### What is happening underneath

Anomaly signalling uses two mechanisms: (1) visual. `severityColor(topSev)` on nodes, glow filter when score > 60; (2) behavioural, active incident linkage brightens edges and enables CSS `animate-ping` on outer ring. No ML baseline; "anomaly" means high severity, high volume, high threat score, or active incident flag. Expected patterns (internal IPs with low counts) filter via **INTERNAL** view.

### Why this matters

Baseline understanding prevents panic. Monday morning may always show auth-failure clusters. Anomaly is deviation from *your* normal, not abstract goodness. The map makes deviation spatial: unexpected critical node appearing where only low nodes existed yesterday is visually obvious.

### Step-by-step walkthrough

1. With minimal data, note sparse small nodes; baseline "quiet."
2. Run Simulate Campaign, observe new large red/orange nodes and ping animations.
3. Compare **ALL NODES** vs **CRITICAL** filter; identify severity concentration.
4. Check if top attacker is **EXTERNAL** or **INTERNAL**: insider vs outsider pattern.
5. Read event type tags on suspicious node; single type (bruteforce) vs mixed (multi-stage).
6. Note Active Incidents stat, nonzero confirms correlated escalation.
7. Screenshot map for shift handover comparison.

### Common questions

#### What does a healthy map look like?

Few nodes, mostly low/clean colour, no ping animations, low active incident count, external nodes small and scattered. Exact baseline depends on your organisation; document yours after a week of normal ops.

#### What's a beaconing pattern?

Regular low-volume contact to same external IP; here, a consistently medium node with steady count growth. Production NetFlow detects beaconing via timing analysis; this map shows volume/severity proxy only.

#### What is high fan-out?

One internal node connected to many targets; in this hub map, an internal IP with unusually high alert count may indicate compromised host scanning outward (check **INTERNAL** filter + high count).

#### Can I see historical baseline comparison?

Not in this module, snapshot only. Use Investigate → Heatmap Calendar for temporal patterns or screenshot maps per shift.

### Using this view during live response

Analyst compares current map mental model to quiet-day baseline. Ping animations drive immediate attention; click pulsing nodes first. Mixed event types on one IP suggest multi-stage attack. Single event type suggests single-vector campaign (e.g. password spray).

### Edge cases and gotchas

First ingest after empty state looks "anomalous" everything; establish baseline before judging. Simulate Campaign creates dramatic anomaly intentionally. Ping animation requires active *incident* record, not just critical alerts; alerts without incident linkage won't pulse.

### Establishing organisational baseline before judging anomaly

Before first use, run 24 hours of normal ingest and screenshot the map as baseline reference. During Simulate Campaign, compare delta: new nodes appearing, existing nodes growing, ping animations activating. Anomaly without baseline comparison leads to alert fatigue on the map itself, "everything looks red" on first day because first day *is* your baseline. Document expected internal nodes (patch servers, backup systems) that always show moderate counts so they are not mistaken for compromise during future incidents. Seasonal patterns (month-end batch jobs) may temporarily enlarge internal nodes; correlate with Heatmap Calendar day×month view before escalating.

### Communicating normal vs anomalous traffic to leadership and engineering

Leadership briefings on Investigate → Network Map should tie each KPI to a business owner. Technical stakeholders need the ingest → context → component path spelled out. Screenshot the stat strip with timestamps when evidence may be challenged later.

### Reading paths for analysts and engineers

Use the walkthrough if you run the SOC; use the source tree if you ship the code. Both paths describe the same Investigate → Network Map behaviour at different altitudes.

#### How do you walk a non-technical board through normal vs anomalous traffic quickly?

Open Investigate → Network Map on the live dashboard during the meeting. Point to the primary visual described in the opening section; skip raw log lines. State how many items are flagged, whether the pattern is new or recurring (compare to yesterday's screenshot if you have one), and name one concrete next action (block IP, reset credential, open case). Boards decide on risk and resources, not MITRE techniques, so translate findings into business impact and recommended spend. Close with what remains unknown and when you will update them.

#### How do maintainers validate normal vs anomalous traffic against the live UI?

Before shipping UI changes to Investigate → Network Map, run the dashboard locally, follow the numbered walkthrough, and screenshot discrepancies. Update this guide when column names, filters, or keyboard shortcuts shift. Shared alert shape is the integration surface for all Investigate modules.

#### What is the most common beginner mistake on this screen?

Treating visual intensity (colour, size, score) as absolute proof rather than relative prioritisation within the current dataset. Cross-check with a second module (Threat Hunt counts, Event Graph relationships, or Live Feed raw lines) before containment. A second frequent error is acting on session-only state (unsaved graphs, unsaved hunts, uncaptured heatmap focus) and losing context on refresh; screenshot or case-note artefacts before navigating away.
