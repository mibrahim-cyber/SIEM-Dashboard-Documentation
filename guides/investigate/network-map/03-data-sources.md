---
module: Network Map
sidebar: Investigate → Network Map
section: Investigate
subsection: How the map is built from flow and firewall data
last_updated: 2026-05-23
---

# How the map is built from flow and firewall data

**Sidebar path:** Investigate → Network Map

![Network Map main view](../../../screenshots/guides/investigate-network-map.png)

### What you are looking at

Every dot is a computed aggregate, not a live ping. Labels under nodes show IP and `{count} alerts`. Drop-shadow intensity increases when `score > 60`. Connection line colour matches severity when an active incident exists for that IP; otherwise dim green `#1a3a1a`.

### What is happening underneath

Data sources are exclusively normalised alerts from the SIEM context pipeline, not NetFlow, DNS logs, or firewall flow records separately). Each alert increments its `sourceIp` bucket. Top severity per IP uses ordinal ranking (critical > high > medium > low). Threat scores merge static `THREAT_DB` reputation (e.g. Tor exit nodes at base 85–90) with dynamic alert volume (`min(count * 3, 40)` added to base). Internal IPs get base score 5; unknown external IPs default base 20.

> **Technical note:** `buildThreatScores(alerts)` runs in context provider, not inside NetworkMap. Geo enrichment happens in Geo Map module, not here: Network Map shows IP and score only.

### Why this matters

Merging reputation with observed volume prevents both false calm (known-bad IP with few alerts) and false panic (unknown IP with many alerts). The map reflects SIEM alert reality, if ingest stops, nodes freeze even if network traffic continues.

### Step-by-step walkthrough

1. Note baseline node count in // MAP STATS → Total Nodes.
2. Run Simulate Campaign on Overview.
3. Refresh Network Map; new nodes appear with updated counts.
4. Click a node with high threat score: verify **THREAT SCORE** bar in detail.
5. Compare **TOP ATTACKERS** ordering (by count) vs threat score (reputation + volume).
6. Cross-check an IP in Intelligence → Threat Intel for feed metadata.
7. Filter **HIGH+** to see critical and high top-severity sources together.

### Common questions

#### Where does threat score come from?

Static database for known bad IPs (Tor, bulletproof hosting) plus dynamic boost from alert frequency in your environment. See threat intelligence module THREAT_DB entries like `185.220.101.45` (Tor Exit Node, base 90).

#### Why doesn't the map show destination IPs?

Alerts in this schema emphasise `sourceIp` (attacker/origin). Destination would require parser fields not visualised here. Check alert detail in Alert Manager for full tuple if captured.

#### Does the map update in real time?

Yes, as `alerts` in React context updates; same refresh cadence as other modules. No separate polling interval.

#### What's the difference between top severity and threat score?

Top severity = worst alert severity from that IP. Threat score = composite reputation + volume (0–100). A low-severity IP from a Tor exit can score 90+ despite no critical alerts yet.

### Analyst workflow under pressure

Analyst watches node growth during campaign simulation, new spokes appear as new sources emerge. Threat score bar informs block priority: score 80+ gets emergency firewall ticket. Event type tags in detail reveal attack class (auth-failure vs port-scan) for playbook selection.

### Edge cases and gotchas

IPs not in THREAT_DB still appear with default scoring; do not assume low score means safe. `isInternal` checks only `192.168.`, `10.0.`, `172.16.` prefixes; other RFC1918 ranges may misclassify. Zero alerts after filter change shows empty map message, not an error.

> **Lab reminder:** All Investigate modules share the same `the SIEM context pipeline` alert objects. Refresh behaviour, session-only state, and **Simulate Campaign** data apply consistently; capture screenshots before navigating away when findings may feed incident or compliance records.

### Threat score decomposition worked example

For IP `185.220.101.45` in THREAT_DB: base score 90 (Tor Exit Node) plus dynamic component `min(alertCount * 3, 40)`. Ten alerts from that IP yields dynamic 30, total capped at 100 → score 100. Internal IP `192.168.1.50` with five alerts: base 5 + dynamic 15 = 20, green/low risk colour on bar despite being under active investigation if misclassified. Always read **CLASSIFICATION** alongside score; external Tor exit at score 90 differs materially from internal misconfiguration at score 20. Event types listed under **EVENT TYPES** are deduplicated strings from all alerts for that IP: a tag list of `auth-failure`, `port-scan`, `db-query` on one IP suggests multi-stage behaviour worth Event Graph documentation.

### Communicating data sources to leadership and engineering

Executives want impact and cost; developers want schema and file paths. Treat these one-line phrases as starting points and adapt to the meeting in the room. On Investigate → Network Map, read labels aloud from the UI and record them in case notes when legal may review the incident.

### Reading paths for analysts and engineers

Analyst readers: stay on-screen labels and the step list above. Maintainer readers: validate the screen against this prose before release. Enterprise deployments add scale; the interaction patterns here still apply.
