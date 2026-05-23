---
module: Event Graph
sidebar: Investigate → Event Graph
section: Investigate
subsection: Using the graph to trace a compromise
last_updated: 2026-05-23
---

# Using the graph to trace a compromise

**Sidebar path:** Investigate → Event Graph

![Event Graph main view](../../../screenshots/guides/investigate-event-graph.png)

### What you are looking at

A mature compromise graph typically shows a hub IP node with multiple alert spokes, a rule node connected via **CAUSED BY**, an incident **EVENT** node via **ESCALATES TO**, and note nodes capturing timeline observations. The radial **AUTO LAYOUT** places nodes in a circle around (400, 300) with radius 220, useful for seeing hub-and-spoke patterns. Selection rings (cyan solid or green dashed) highlight the node under investigation.

### What is happening underneath

Tracing is a manual breadth-first expansion: start from the triggering alert node, identify its `sourceIp` in **NODE DETAIL**, drag that IP from the **IPS** tab, connect with **TRIGGERS**, check **CONNECTED EDGES** for paths to other entities, repeat. `removeNode` cascades edge cleanup. The graph does not compute blast radius automatically, reachability is visual, not algorithmic. Patient zero identification relies on analyst judgment informed by timestamps in **NODE DETAIL** (earliest alert) and edge direction.

### Why this matters

Kill chain analysis requires seeing progression: reconnaissance alerts → initial access alerts → lateral movement alerts. A graph makes progression spatial, left-to-right or hub-to-spoke layouts mirror narrative flow. Tables sort by time but hide topology. When containment decisions must happen in minutes, topology beats chronology.

### Step-by-step walkthrough

1. Drag the earliest critical alert onto the canvas; candidate patient zero.
2. Read `sourceIp` and `timestamp` in **NODE DETAIL**.
3. Drag that IP from **IPS** tab; connect alert ← IP with **TRIGGERS**.
4. Drag the firing rule; connect rule → alert with **CAUSED BY**.
5. Check **INCIDENTS** tab for an existing case; connect with **ESCALATES TO**.
6. Drag additional alerts sharing the same IP; fan out from the IP hub.
7. Click **AUTO LAYOUT** to reveal the hub pattern.
8. Add **NOTE** nodes marking containment actions and open questions.

### Common questions

#### How do I find patient zero?

Look for the earliest timestamp among connected alert nodes in **NODE DETAIL**. The graph does not auto-highlight it; you must compare timestamps manually. Sort alerts chronologically in Threat Hunt first if unsure.

#### What is "blast radius"?

Every node reachable from patient zero through any path of edges; the set of systems, IPs, and detections potentially affected. Visually, it is the cluster connected to your starting node. This lab graph does not calculate numeric blast radius; enterprise tools do.

#### Can I start from an IP instead of an alert?

Yes. Drag from the **IPS** tab first, then find related alerts in the **ALERTS** tab by matching `sourceIp`. Many investigations start from threat intel ("this IP is malicious") rather than an internal alert.

#### How do I know I'm done expanding?

Stop when new nodes add no new information, duplicate event types, same rule, already-documented IP. Add a **NOTE** node: "graph complete pending firewall logs."

### Using this view during live response

The incident lead assigns one analyst to maintain the canonical graph on a shared screen. Each new detection gets added within minutes. Edge labels document validated vs suspected links. **NOTE** nodes track containment status. The graph becomes the briefing artefact for executives who will not read log lines; they see a picture with a clear centre and spokes.

### Edge cases and gotchas

Shared IPs (NAT gateways, VPN egress) create false hubs; one IP node may represent many hosts behind it. **AUTO LAYOUT** ignores time ordering; arrange manually if chronology matters. Deleting a hub node orphaning spokes does not delete spokes, clean up dangling nodes. Canvas state lost on refresh; capture screenshots for incident records.

### Containment decision support from graph topology

Hub-and-spoke patterns centred on one IP node with many **TRIGGERS** edges suggest single-source campaign; candidate for immediate block. Star patterns connecting one rule node to many alert nodes suggest detection tuning opportunity; rule may be too broad or correctly catching distributed attack. Disconnected subgraphs on the same canvas represent separate investigation threads, do not merge without evidence. Before recommending containment, expand from patient zero through two hops of **RELATES TO** edges; any node within two hops is provisional blast radius for communication to IT ("may affect these systems"). The graph cannot compute hops algorithmically; you trace visually, but the exercise forces explicit scope declaration before Intelligence → IOC Watchlist block actions.

### Timeline integration during trace exercises

While building the graph, keep Monitor → Attack Timeline open in another browser tab. For each alert node placed, compare `timestamp` in **NODE DETAIL** against timeline phase placement; inconsistencies between graph order and chronological order expose mistaken **FOLLOWS** edges. Patient zero candidacy should be the earliest alert by timestamp among connected nodes, not merely the loudest severity. If two alerts share identical timestamps, use `eventType` progression (recon before exploitation) or external intel to break ties. Document tie-break reasoning in **NOTE** nodes for successors.

### Communicating tracing compromise to leadership and engineering

When executives ask what the screen means for the organisation, translate visible counters into outcomes: data exposure, service disruption, notification timelines, and customer trust. Skip tool jargon; cite specific counts, timestamps, and named fields on Investigate → Event Graph. When engineers ask about data lineage, answer: SQLite-backed ingest through `the SIEM context pipeline`, normalised in the parser layer, rendered in React client state refreshed on ingest and Simulate Campaign. Capture the view with stat counters visible for audit evidence; verbal summaries alone rarely satisfy compliance reviews.

### Who should read which sections

Use the walkthrough if you run the SOC; use the source tree if you ship the code. Both paths describe the same Investigate → Event Graph behaviour at different altitudes.
