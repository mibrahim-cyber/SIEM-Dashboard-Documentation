---
module: Event Graph
sidebar: Investigate → Event Graph
section: Investigate
subsection: Graph theory basics for non-technical readers
last_updated: 2026-05-23
---

# Graph theory basics for non-technical readers

**Sidebar path:** Investigate → Event Graph

![Event Graph main view](../../../screenshots/guides/investigate-event-graph.png)

### What you are looking at

The Event Graph screen is divided into three horizontal zones. On the left sits a 240-pixel sidebar with four uppercase tabs: **ALERTS**, **IPS**, **RULES**, and **INCIDENTS**, and a scrollable list beneath the label **DRAG ONTO CANVAS →**. Each list item is a draggable card: alert cards show severity colour on the left border, source IP, event type, and time; IP cards show the address and alert count; rule cards show rule name, MITRE technique, and hit count; incident cards show source IP, alert count, and status. The centre is the canvas: an SVG grid background with rounded rectangular nodes (180×72 pixels) connected by curved dashed arrows. The toolbar above the canvas offers SELECT [S], CONNECT [C], and PAN [P] mode buttons, plus **+ NOTE**, **AUTO LAYOUT**, zoom controls, a live counter (`N NODES · N EDGES · N%`), and **CLEAR ALL**. When nothing is on the canvas, a ghost title reads **Event Graph** with instructions to drag items from the left. Selecting a node opens a 220-pixel **NODE DETAIL** panel on the right listing every field from the underlying record and a **CONNECTED EDGES** section.

### What is happening underneath

In graph theory terms, each placed card becomes a node with a unique ID (`n1`, `n2`, …), a `type` field (`alert`, `ip`, `rule`, `event`, or `note`), positional coordinates, and a `data` payload copied from the SIEM context pipeline (alerts, rules, incidents). Edges are stored as `{ from, to, label }` tuples in dashboard state, they are not inferred automatically from log correlation. When you drag from the sidebar, HTML5 drag-and-drop serialises JSON into `dataTransfer`; `handleDrop` parses it and calls `addNode`. In CONNECT mode, clicking two nodes opens an **EDGE TYPE** picker offering **TRIGGERS**, **RELATES TO**, **CAUSED BY**, **ESCALATES TO**, **BLOCKS**, and **FOLLOWS**. Pan and zoom transform the SVG `<g>` via `translate(pan.x, pan.y) scale(zoom)`. The graph lives entirely in browser memory for the session; it is an analyst workspace, not a persisted database graph.

> **Technical note:** Event Graph screen reads `alerts`, `incidents`, and `rules` from the SIEM context pipeline. The sidebar shows the last 30 alerts (reversed), top 20 source IPs by frequency, all rules, and all incidents. Node colours come from `nodeColor(type)`; alerts use cyan accent `#00d4ff`, IPs purple `#a78bfa`, rules green `#00ff88`, incidents orange `#ff9500`, notes yellow `#ffd60a`.

### Why this matters

A flat alert table tells you *what* fired. A graph tells you *how things relate*. During a brute-force campaign, you might see twenty critical alerts that look identical until you graph them: one IP node connected to multiple alert nodes, all **TRIGGERED BY** the same rule node, **ESCALATES TO** a single incident node. That cluster is visually unmistakable; the cognitive load drops from scanning hundreds of rows to recognising a shape. Enterprise SIEMs (Splunk ES, Elastic Security, Microsoft Sentinel) invest heavily in entity graphs for exactly this reason: human pattern recognition beats keyword search for multi-step attacks.

### Step-by-step walkthrough

1. Open Investigate → Event Graph from the sidebar after signing in.
2. If the canvas is empty, go to Monitor → Overview and click Simulate Campaign, or ingest logs via Ingest → Log Ingestion.
3. Click the **ALERTS** tab in the left panel and drag a critical alert card onto the canvas.
4. Switch to **IPS**, drag the same source IP onto the canvas near the alert.
5. Click CONNECT [C], click the IP node, then click the alert node. Choose **TRIGGERS** from the edge picker.
6. Switch to **RULES**, drag the detection rule that fired, connect it to the alert with **CAUSED BY**.
7. Click SELECT [S], drag nodes to tidy the layout, or click **AUTO LAYOUT** for a radial arrangement.
8. Click any node to read full fields in **NODE DETAIL** on the right.

### Common questions

#### What is a "node" and why should I care?

Think of a node as a person in a detective's evidence board, a suspect, a location, a weapon. Each pin represents one concrete thing in your investigation. In this dashboard, a node is a visual card representing one alert, IP address, detection rule, incident, or analyst note. Connecting them with labelled arrows shows relationships that a spreadsheet hides.

#### Is this like a social network graph?

The analogy holds well. On Facebook, nodes are people and edges are "friends with." Here, nodes are security entities and edges are "triggered," "caused," or "relates to." Just as social graphs reveal cliques and influencers, security graphs reveal attack clusters and pivot points; the IP that touches everything is your suspect.

#### Does the graph build itself from my logs?

Not in this implementation. You build it manually by dragging items from the left sidebar. Production SIEM entity graphs often auto-populate from correlation engines, but this lab dashboard prioritises teaching the *investigation workflow* (you decide what belongs on the board and how pieces connect.

#### Why use curves and arrows instead of a simple list?

Curves show directionality: an arrow from IP → Alert means "this IP triggered this alert," not the reverse. Lists cannot encode direction or many-to-many relationships without becoming unreadable. The dashed Bézier paths (`edgePath` in code) keep overlapping connections legible.

#### What happens if I close the browser?

The graph is session-local dashboard state. Refreshing the page clears it. For a real investigation, screenshot the graph or export findings to a case record before navigating away.

### Using this view during live response

At minute ten of a suspected compromise, the analyst opens Event Graph with the triggering alert already on canvas. They drag the source IP, the rule that fired, and any related incidents. Using **CONNECT**, they label edges to document their working hypothesis: **CAUSED BY** the brute-force rule, **ESCALATES TO** an open incident, **RELATES TO** a second IP seen in Threat Hunt. They add **+ NOTE** nodes for observations ("password spray across 40 accounts"). The **NODE DETAIL** panel confirms timestamps and severity without switching modules. When the incident lead asks "what's the blast radius?", the analyst pans out; every node reachable from patient zero is visible in one frame.

### Edge cases and gotchas

Pressing Delete or Backspace removes the selected node but only when focus is not inside a note textarea. Middle-mouse or PAN [P] mode pans the canvas; scroll wheel zooms between 20% and 300%. Connecting a node to itself is prevented, the second click must be a different node. If you delete a node, all its edges disappear silently. **AUTO LAYOUT** rearranges all nodes radially around centre (400, 300); useful after messy manual placement, but it ignores semantic grouping. The sidebar shows only the 30 most recent alerts, not the full corpus; older alerts must be found elsewhere first.

### Communicating graph theory basics to leadership and engineering

Executives want impact and cost; developers want schema and file paths. Treat these one-line phrases as starting points and adapt to the meeting in the room. On Investigate → Event Graph, read labels aloud from the UI and record them in case notes when legal may review the incident.

### Operator vs maintainer focus

Use the walkthrough if you run the SOC; use the source tree if you ship the code. Both paths describe the same Investigate → Event Graph behaviour at different altitudes.
