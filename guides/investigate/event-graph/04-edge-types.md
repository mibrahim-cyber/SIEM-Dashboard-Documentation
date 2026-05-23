---
module: Event Graph
sidebar: Investigate → Event Graph
section: Investigate
subsection: Edge types and attack relationships
last_updated: 2026-05-23
---

# Edge types and attack relationships

**Sidebar path:** Investigate → Event Graph

![Event Graph main view](../../../screenshots/guides/investigate-event-graph.png)

### What you are looking at

When you complete a connection in **CONNECT** mode, a floating **EDGE TYPE** menu appears at your cursor with six labelled buttons: **TRIGGERS**, **RELATES TO**, **CAUSED BY**, **ESCALATES TO**, **BLOCKS**, and **FOLLOWS**, plus No label and Cancel. After selection, a dashed curved arrow draws from source to target with the chosen label centred on the path. Hovering an edge highlights it cyan, shows an arrowhead, and reveals a red × circle at the midpoint to delete the edge. Selected nodes list connected edges in the right panel as `→ otherNode (LABEL)` or `← otherNode (LABEL)`.

### What is happening underneath

Edges are stored as `{ from: nodeId, to: nodeId, label: string }` in the `edges` array. Rendering uses cubic Bézier paths from centre-to-centre of the 180×72 node rectangles. The `EDGE_LABELS` constant defines the six preset relationship types, these are analyst-chosen semantics, not auto-inferred from log fields. An empty label still creates a directed edge but renders without text. Edge deletion filters by index on click of the hover × control.

> **Technical note:** Production knowledge graphs often use ontologies (STIX relationships, MITRE causality). This lab uses a fixed vocabulary of six edge types plus unlabelled connections, matching common incident-documentation language rather than a formal ontology.

### Why this matters

Undirected lines say "these things are connected." Labelled directed edges say "this specific thing did this specific thing to that thing." That distinction matters in post-incident reviews and legal proceedings. **CAUSED BY** documents causality for the detection rule → alert chain. **ESCALATES TO** documents workflow decisions. **BLOCKS** might document a firewall action taken against an IP. Without labels, future analysts viewing your graph cannot reconstruct your reasoning.

### Step-by-step walkthrough

1. Place at least two nodes on the canvas.
2. Click CONNECT [C] or press C.
3. Click the source node. A green dashed selection ring appears with the hint CLICK TARGET NODE [ESC to cancel].
4. Click the target node, the **EDGE TYPE** picker opens.
5. Choose **CAUSED BY** (rule → alert) or **TRIGGERS** (IP → alert).
6. Hover the new edge to verify the label renders at the midpoint.
7. To remove, hover the edge and click the red ×.

### Common questions

#### What's the difference between TRIGGERS and CAUSED BY?

**TRIGGERS** implies the source entity initiated or provoked the target; typically IP → Alert ("this IP triggered this alert"). **CAUSED BY** implies the source explains why the target exists; typically Rule → Alert ("this detection rule caused this alert to fire"). The distinction is documentary; choose the label that best matches your investigation narrative.

#### Can I draw bidirectional relationships?

Each edge is one-directional (arrowhead at the target). To show mutual relationship, draw two edges in opposite directions or use **RELATES TO** for a softer association.

#### What does RELATES TO mean?

Use it when entities are associated but causality is unclear or unimportant; two IPs seen in the same campaign, or an alert that mentions the same URL as another. It is the graph equivalent of "see also."

#### Can I create custom edge labels?

Not in the current UI, only the six presets, blank, or cancel. Use **NOTE** nodes to capture relationship nuance the presets miss.

### Using this view during live response

The analyst methodically labels every connection as they validate hypotheses: confirmed causal links get **CAUSED BY** or **TRIGGERS**; tentative links get **RELATES TO**; escalation to the IR team gets **ESCALATES TO** on the path to the incident node. When containment blocks an IP at the firewall, they add **BLOCKS** from a note or action node to the IP. The edge list in **NODE DETAIL** becomes a structured summary for the incident timeline.

### Edge cases and gotchas

Press Escape to cancel mid-connection; the blinking hint disappears. Duplicate edges between the same pair are allowed (no deduplication), which can clutter the canvas. Deleting a node removes all its edges automatically. Edge labels do not wrap; long custom text is not supported anyway. Hover-to-delete requires precise mouse placement on the small midpoint circle.

### Mapping relationships to real attack narratives

When you label an edge **FOLLOWS** from one alert node to another, you are asserting temporal sequencing; the first alert's timestamp should precede the second in **NODE DETAIL**. The graph does not validate timestamps automatically; disciplined analysts verify before labelling. **BLOCKS** edges document containment actions: connect a note node ("Firewall rule added 14:32") to an IP node to show response state. **ESCALATES TO** edges should originate from alert or IP nodes and terminate on incident **EVENT** nodes, mirroring the workflow path in Respond → Incidents. In post-incident review, edge labels become audit evidence, "we believed X CAUSED Y because…", so choose labels that match your evidence grade: confirmed causal links get **CAUSED BY**; correlations still being tested get **RELATES TO** until logs prove otherwise.

> **Technical note:** Enterprise graph databases (Neo4j in Splunk ES, Amazon Neptune integrations) persist edges with timestamps and analyst identity. This dashboard state graph is ephemeral; screenshot or copy edge lists from **NODE DETAIL** before closing the session if the investigation spans days.
