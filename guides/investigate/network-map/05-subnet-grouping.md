---
module: Network Map
sidebar: Investigate → Network Map
section: Investigate
subsection: Subnet grouping and asset classification
last_updated: 2026-05-23
---

# Subnet grouping and asset classification

**Sidebar path:** Investigate → Network Map

![Network Map main view](../../../screenshots/guides/investigate-network-map.png)

### What you are looking at

Classification appears in // NODE DETAIL → CLASSIFICATION as **INTERNAL** (dim green text) or **EXTERNAL THREAT** (orange `text-hack-high`). Filters **EXTERNAL** and **INTERNAL** partition the view. There is no subnet bubble grouping, nodes remain in one ring sorted by array index, not VLAN clusters.

### What is happening underneath

`isInternal(ip)` from threat intelligence module checks prefixes `192.168.`, `10.0.`, `172.16.`. No CIDR subnet aggregation, each IP is its own node. Asset criticality tiers (Crown Jewels, etc.) are not modelled here, see Infrastructure → Asset Inventory. Threat score bar uses `riskColor()` thresholds: 80+ red, 60+ orange, 40+ yellow, else green.

### Why this matters

Internal vs external distinction drives response: external IPs → firewall block candidates; internal IPs → endpoint isolation candidates. Without classification, you might block an internal NAT address and break legitimate traffic. Subnet grouping in enterprise tools speeds reasoning ("all of VLAN 40 is red"); this lab provides binary internal/external as a starting concept.

### Step-by-step walkthrough

1. Click **ALL NODES**; note mix of internal and external labels in detail panels.
2. Filter **EXTERNAL**: map shows only non-RFC1918 sources.
3. Filter **INTERNAL**; investigate insider or lateral movement indicators.
4. Click internal node, confirm **INTERNAL** classification and lower base threat score.
5. Click external node; confirm **EXTERNAL THREAT** label.
6. Compare // MAP STATS → External IPs count with filtered view.
7. Cross-reference internal high-count node with Investigate → UEBA user activity.

### Common questions

#### Why aren't nodes grouped by subnet?

This lab visualisation prioritises attack-source radial layout over geographic/subnet clustering. Enterprise NetFlow tools (Darktrace, ExtraHop) group by segment; out of scope for this React SVG demo.

#### What IP ranges count as internal?

10.0.x.x (partial), 192.168.x.x, 172.16.x.x in the static check. 172.17–172.31 are not covered; may show as external incorrectly.

#### Can I change asset criticality on the map?

No. Criticality is inferred from alert severity, not business context. Tag crown-jewel servers in Asset Inventory for reporting context.

#### How does classification affect threat score?

Internal IPs start base score 5; external unknown start 20; known bad IPs use THREAT_DB base up to 90. Classification feeds score calculation, not just labelling.

### How an analyst uses this during an active incident

External campaign: filter **EXTERNAL**, sort by **TOP ATTACKERS**, prepare block list. Suspected insider: filter **INTERNAL**, look for high-count nodes with mixed event types. Classification label goes into incident ticket verbatim.

### Edge cases and gotchas

Cloud egress IPs classify as external even when they are your infrastructure. VPN concentrator IPs may appear as single high-volume internal or external depending on addressing. Misclassification breaks response playbooks, verify IP ownership in Asset Inventory.

### RFC1918 limits and cloud nuance

The `isInternal` check covers `192.168.*`, `10.0.*`, and `172.16.*` only; not full `172.16.0.0/12`. IPs like `172.17.1.1` misclassify as **EXTERNAL THREAT** in this lab. Cloud provider internal IPs (RFC6598 carrier-grade NAT, cloud VPC ranges) may similarly misclassify. Analysts must verify against Infrastructure → Asset Inventory before containment. **EXTERNAL** filter is still valuable for block-list generation even with misclassification edge cases; manual review of filter output before firewall push is mandatory in production workflows.

### Communicating subnet grouping to leadership and engineering

Executives want impact and cost; developers want schema and file paths. Treat these one-line phrases as starting points and adapt to the meeting in the room. On Investigate → Network Map, read labels aloud from the UI and record them in case notes when legal may review the incident.

### Operator vs maintainer focus

Analyst readers: stay on-screen labels and the step list above. Maintainer readers: validate the screen against this prose before release. Enterprise deployments add scale; the interaction patterns here still apply.

#### How would you summarise subnet grouping for leadership in under two minutes?

Lead with the stat strip or dominant visual on Investigate → Network Map. Compare today's numbers to your last briefing slide if possible. Name the business process at risk, not the detection rule ID. Offer one mitigation already underway and one that needs approval. Reserve technical detail for the appendix.

#### How do maintainers validate subnet grouping against the live UI?

Diff the component named in this guide against `the SIEM context pipeline` typings. Walkthrough steps must match rendered labels and filter chips. When props or hooks move, update the markdown in the same PR. Regression-test ingest → parse → alert → Investigate → Network Map render with Simulate Campaign before merging.

#### What tripping point catches first-time users?

Over-trusting a single panel on Investigate → Network Map. Severity colour ranks items against each other in memory, not against ground truth. Confirm with another view, then document in a case. Also save or screenshot before refresh; many Investigate tools keep state only in the browser session.
