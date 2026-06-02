﻿# Event graph

HABIBI-SIEM exposes this capability under **Investigate → Event Graph**. Graph view links entities (IPs, users, hosts) that co-occur in alerts so you can see lateral movement patterns at a glance.

## What you see on screen

Nodes represent entities; edges represent shared alerts or log relationships. Clicking a node highlights neighbours and recent severity.

## How data moves through the dashboard

The graph builder runs client-side over the current alert corpus. It does not query a separate graph database; refreshing alerts rebuilds the layout.

## Day-to-day operator workflow

Start from the noisiest IP in Overview top attackers, open the graph, and walk one hop at a time. Document unusual cliques before blocking a whole subnet.

## Edge cases and false trails

Dense graphs in demo data look impressive but overstate real relationships when deduplication is off. Single-alert nodes are normal in quiet labs.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Event Graph](../../guides/investigate/event-graph/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
