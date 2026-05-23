---
module: Event Graph
sidebar: Investigate → Event Graph
section: Investigate
subsection: What each node type represents
last_updated: 2026-05-23
---

# What each node type represents

**Sidebar path:** Investigate → Event Graph

![Event Graph main view](../../../screenshots/guides/investigate-event-graph.png)

### What you are looking at

Five distinct node types appear on the canvas, each with a coloured top accent bar and uppercase type tag. **ALERT** nodes display source IP in severity colour, event type, and a severity badge pill. **IP** nodes show the address in purple and an alert count ("47 alerts"). **RULE** nodes truncate long rule names at 22 characters, showing MITRE technique and hit count. **EVENT** nodes (incidents from the sidebar) show source IP and "INC · N alerts". **NOTE** nodes contain an editable yellow textarea for free-form analyst commentary. Hovering or selecting any node reveals a red × delete button in the top-right corner.

### What is happening underneath

Each node type maps to a different slice of `the SIEM context pipeline` data. Alert nodes embed the full alert object: `sourceIp`, `eventType`, `severity`, `timestamp`, `status`, `url`, `port`, etc. IP nodes store `{ ip, count }` aggregated from `topIPs`, the twenty source IPs with highest alert frequency. Rule nodes carry `{ id, name, mitre, hits,... }` from the rules array. Event nodes actually represent incidents (the sidebar tab says INCIDENTS but the node type is `event`), storing incident fields like `sourceIp`, `alertCount`, `status`, `severity`. Note nodes are synthetic. `{ text: 'New note' }` by default, with edits held in separate `noteText` state keyed by node ID.

> **Technical note:** `SEV_COLOR` maps critical→`#ff2d55`, high→`#ff9500`, medium→`#ffd60a`, low→`#30d158`. Enterprise graphs also model users, hostnames, processes, file hashes, and domains; this lab scope covers the entities available in the demo dataset. When briefing non-technical stakeholders, point to colour before acronym: purple means address, cyan means single detection, green means policy that fired, orange means escalated case file. The five types in Event Graph screen mirror how mature SOCs partition evidence boards, even without user or hostname nodes in this lab, the discipline of typed entities prevents mixing symptoms (alerts) with causes (rules) with outcomes (incidents).

### Why this matters

Grouping entities by type lets the analyst apply different mental models. An IP node answers "who is attacking?" A rule node answers "what detection caught it?" An incident node answers "has this been escalated?" Without typed nodes, every card would look identical and the graph would devolve into noise. Type-specific colouring means you can spot a purple IP cluster surrounded by cyan alert cards in peripheral vision; a pattern tables cannot provide.

### Step-by-step walkthrough

1. Open the **IPS** tab and observe IP cards sorted by alert volume.
2. Drag the top IP onto the canvas: note the purple **IP** tag.
3. Switch to **ALERTS** and drag an alert from that same IP.
4. Open **RULES** and drag the rule whose MITRE technique matches the alert's detection.
5. Open **INCIDENTS** and drag any incident involving the same source IP.
6. Click **+ NOTE** in the toolbar to add a yellow annotation node.
7. Select each node in turn and compare the **NODE DETAIL** fields on the right.

### Common questions

#### Why aren't there user or hostname nodes?

This dashboard's demo dataset centres on network-centric alerts (source IP, event type, severity). User and hostname nodes appear in production UEBA and EDR integrations. Here, the four SIEM-native types plus notes cover the lab's correlation scope. Check Investigate → UEBA for user-centric analysis.

#### What's the difference between an ALERT node and an EVENT node?

An alert node is a single detection event; one row from the alert engine. An EVENT node (incident) is an aggregated container grouping multiple related alerts under one investigation record with its own status (`active`, `resolved`, etc.). Think of alerts as individual fires and incidents as the fire department's case file.

#### Why do IP nodes show a count but alert nodes don't?

The IP sidebar pre-aggregates: `topIPs` counts alerts per source IP before you drag. Alert nodes represent one specific detection, so the count is implicit (one). If you need volume context for an IP, drag it from the **IPS** tab rather than inferring from individual alerts.

#### Can I edit what's inside a node after placing it?

Note nodes are fully editable via the embedded textarea. Other node types reflect live `the SIEM context pipeline` data at drag time, they do not auto-refresh if the underlying alert changes. Delete and re-drag to update.

### What analysts do when the pager fires

The analyst places one **ALERT** node for the initial detection, then immediately adds the **IP** node and the **RULE** node that fired. If an incident was auto-created, they add the **EVENT** node and connect it with **ESCALATES TO**. They annotate gaps with **NOTE** nodes ("waiting for firewall logs"). The type colour coding lets the incident commander scan the shared screen and understand entity classes without reading every label.

### Edge cases and gotchas

Rule names longer than 22 characters truncate with an ellipsis on the canvas but show fully in **NODE DETAIL**. Incidents and alerts share severity colour coding but different accent colours (orange vs cyan). Dragging the same alert twice creates duplicate nodes with different IDs; there is no deduplication. Internal IPs (192.168.x.x) appear identically to external IPs in the graph; classification happens in Network Map, not here.
