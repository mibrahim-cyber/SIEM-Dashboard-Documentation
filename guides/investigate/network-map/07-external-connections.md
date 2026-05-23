---
module: Network Map
sidebar: Investigate → Network Map
section: Investigate
subsection: External connections and egress
last_updated: 2026-05-23
---

# External connections and egress

**Sidebar path:** Investigate → Network Map

![Network Map main view](../../../screenshots/guides/investigate-network-map.png)

### What you are looking at

**EXTERNAL** filter isolates non-internal IPs. External nodes use severity colouring; connection lines to central **SERVER** represent inbound attack traffic in this model. // MAP STATS → External IPs quantifies foreign sources. **TOP ATTACKERS** ranks by alert count regardless of internal/external, cross-check classification in detail panel.

### What is happening underneath

Egress (inside-out data exfil) is not visually distinct from ingress unless exfil alerts carry external `sourceIp` as the exfil destination encoded into source field, schema dependent. `buildThreatScores` enriches external IPs with THREAT_DB labels like "Tor Exit Node" or "Known Attacker." Drop-shadow on nodes intensifies with score > 60, visual exfil/risk hint.

### Why this matters

External attack surface monitoring is perimeter defence 101. Egress monitoring catches data leaving; equally critical, often overlooked. This map emphasises inbound sources; analysts must also hunt outbound indicators via Threat Hunt queries on url/port fields and Geo Map for foreign destinations.

### Step-by-step walkthrough

1. Click **EXTERNAL** filter: survey foreign IP spread.
2. Click top **TOP ATTACKERS** external entry.
3. Read threat score and THREAT_DB label if known bad.
4. Check event types for exfil hints (large transfer, dns-tunnel).
5. Open Investigate → Geo Map for same IP's country.
6. Add IP to Intelligence → IOC Watchlist if confirmed malicious.
7. Document block recommendation with score and country evidence.

### Common questions

#### Does this map show data exfiltration?

Only if exfil attempts generate alerts with distinguishable event types. No byte-volume flow visualisation. Use Threat Hunt `port`/`url` conditions for exfil hunting.

#### Why watch egress if this is an inbound map?

Because compromise completes with outbound data transfer. After seeing external inbound nodes, hunt outbound via other modules; map is one lens, not exhaustive monitoring.

#### What's a critical external connection pattern?

Many external nodes, several critical severity, high active incident count, known-bad THREAT_DB labels, suggests active campaign. Single persistent external node with slowly rising count suggests beaconing.

#### How do I block an external IP?

Use Intelligence → IOC Watchlist or SOAR playbooks in Respond → SOAR Console; Network Map is visualisation, not enforcement.

### Using this view during live response

External DDoS: map fills with many small external nodes; // MAP STATS external count spikes. Targeted attack: one **TOP ATTACKERS** dominant node. Analyst prepares block list from **EXTERNAL** filter sorted by count and severity, enriched with Geo Map country data for change board approval.

### Edge cases and gotchas

CDN and DNS resolver IPs appear as high-volume externals; not attackers. THREAT_DB covers only demo IPs, most externals show "Unknown" label with default score 20+. Blocking without verification causes false positives.

### Pairing inbound map with egress hunts

After surveying **EXTERNAL** filter output, run Threat Hunt: `port gt 1024` on same IPs identified in **TOP ATTACKERS** to detect outbound C2 channels not visible as inbound spoke intensity. Geo Map enriches external nodes with country for block approval packages. IOC Watchlist entries grey blocked nodes on Geo Map and affect blocked styling elsewhere; keep map, geo, and watchlist synchronised during containment waves.

### Communicating external connections to leadership and engineering

When executives ask what the screen means for the organisation, translate visible counters into outcomes: data exposure, service disruption, notification timelines, and customer trust. Skip tool jargon; cite specific counts, timestamps, and named fields on Investigate → Network Map. When engineers ask about data lineage, answer: SQLite-backed ingest through `the SIEM context pipeline`, normalised in the parser layer, rendered in React client state refreshed on ingest and Simulate Campaign. Capture the view with stat counters visible for audit evidence; verbal summaries alone rarely satisfy compliance reviews.

### Operator vs maintainer focus

This page keeps UI strings explicit so operators can follow the walkthrough without guessing field names.

#### What should executives hear first about external connections?

Use Investigate → Network Map as a prop, not a tutorial. Highlight the top three labelled fields that changed since yesterday. Explain customer or revenue exposure in plain language. Request only the decision you need today. Document the screen with timestamp for the minutes.

#### What integration tests guard external connections behaviour?

Treat this page as a contract test: every **LABEL** in prose should appear on screen or in derived state. Confirm API routes feeding Investigate → Network Map match appendix endpoint docs. If geo, graph, or hunt pivots break, inspect shared normalisation first.

#### Which mistake do new analysts make most often here?

Assuming empty or quiet means safe. Verify ingestion in Pipeline Health and rule hits on Overview before telling stakeholders the environment is clean.
