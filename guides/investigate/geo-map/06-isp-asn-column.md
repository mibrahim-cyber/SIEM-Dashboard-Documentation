---
module: Geo Map
sidebar: Investigate → Geo Map
section: Investigate
subsection: The ISP/ASN column
last_updated: 2026-05-23
---

# The ISP/ASN column

**Sidebar path:** Investigate → Geo Map

![Geo Map main view](../../../screenshots/guides/investigate-geo-map.png)

### What you are looking at

Geo Map **IP DETAIL** panel shows Country, City, Severity, Alerts, Blocked. ISP is not displayed in the UI table despite being available in geo objects (`geo.isp` from backend). **TOP ATTACKERS** list shows IP, count, blocked status only. For ISP visibility, use Intelligence → Threat Intel or Network Map threat labels (THREAT_DB includes isp like "AS60729 Zwiebelfreunde").

### What is happening underneath

`normalizeGeo()` preserves `isp: data.isp || null` from `/api/geo` MaxMind response. `THREAT_DB` in the threat intelligence module maps demo IPs to ISP strings ("Tor Exit Node", "AS4134 Chinanet"). GeoMap component simply omits ISP from detail rows array, data exists but UI gap. ASN (Autonomous System Number) identifies network owner, Tor exits, bulletproof hosts, cloud providers share AS patterns useful for blocking at network level.

### Why this matters

IP addresses rotate; ASNs change slowly. Blocking AS13335 (Cloudflare) would be catastrophic; blocking known malicious hosting ASN may be appropriate. ISP context explains *infrastructure type*; residential broadband vs datacenter VPS informs attack attribution (script kiddie VPS vs botnet residential).

### Step-by-step walkthrough

1. Select suspicious IP on Geo Map: note country/city.
2. Navigate to Investigate → Network Map; click same IP.
3. Read threat label if in THREAT_DB (e.g. "Tor Exit Node").
4. Open Intelligence → Threat Intel, lookup IP for feed metadata.
5. Cross-reference ISP/ASN if displayed in Threat Intel results.
6. Decide block scope: single IP vs ASN (external firewall change).
7. Document ISP context in case notes even if Geo Map omits it.

### Common questions

#### Why isn't ISP shown on geo map detail?

UI simplification in lab build; geo object includes ISP when backend provides it. Future enhancement or use Threat Intel module.

#### What is an ASN?

Autonomous System Number; identifies a network operator's routing domain on the internet. Like a company ID for ISPs and hosting providers.

#### Why care about tor exit nodes?

Traffic from Tor exits may be legitimate privacy-seeking users or attackers hiding origin. THREAT_DB flags demo Tor IP 185.220.101.45 with base score 90.

#### Should I block all traffic from cloud provider ASNs?

No; most web infrastructure lives on AWS/Azure/GCP. Block specific abusive IPs, not entire provider ASNs without extreme cause.

### What analysts do when the pager fires

Phishing campaign hosted on bulletproof hosting: Threat Intel ISP label confirms datacenter origin, supports aggressive block. Legitimate user on residential ISP flagged for impossible travel: ISP context supports "likely compromised home router" vs "VPN" hypothesis.

### Edge cases and gotchas

Missing ISP in geo response shows null, not "Unknown ISP" in Geo Map because field omitted entirely. CDN IPs show provider ASN not attacker origin. IPv6 geo less accurate in some databases.

### Closing the ISP visibility gap

Although Geo Map **IP DETAIL** omits ISP, `geo.isp` exists on resolved objects when backend returns it; request full geo via API or check Network Map THREAT_DB labels for demo IPs (e.g. "AS60729 Zwiebelfreunde"). Document ISP in case notes when blocking: "Blocked 185.220.101.45, Tor exit AS60729" carries more audit weight than IP alone. ASN-level blocks are firewall-team decisions; map and intel modules provide evidence, not execution.

### Communicating ISP/ASN column to leadership and engineering

When executives ask what the screen means for the organisation, translate visible counters into outcomes: data exposure, service disruption, notification timelines, and customer trust. Skip tool jargon; cite specific counts, timestamps, and named fields on Investigate → Geo Map. When engineers ask about data lineage, answer: SQLite-backed ingest through `the SIEM context pipeline`, normalised in the parser layer, rendered in React client state refreshed on ingest and Simulate Campaign. Capture the view with stat counters visible for audit evidence; verbal summaries alone rarely satisfy compliance reviews.

### Who should read which sections

Analyst readers: stay on-screen labels and the step list above. Maintainer readers: validate the screen against this prose before release. Enterprise deployments add scale; the interaction patterns here still apply.

#### What talking points cover ISP/ASN column for senior leadership?

Lead with the stat strip or dominant visual on Investigate → Geo Map. Compare today's numbers to your last briefing slide if possible. Name the business process at risk, not the detection rule ID. Offer one mitigation already underway and one that needs approval. Reserve technical detail for the appendix.

#### What integration tests guard ISP/ASN column behaviour?

Treat this page as a contract test: every **LABEL** in prose should appear on screen or in derived state. Confirm API routes feeding Investigate → Geo Map match appendix endpoint docs. If geo, graph, or hunt pivots break, inspect shared normalisation first.

#### What should newcomers avoid on this view?

Over-trusting a single panel on Investigate → Geo Map. Severity colour ranks items against each other in memory, not against ground truth. Confirm with another view, then document in a case. Also save or screenshot before refresh; many Investigate tools keep state only in the browser session.
