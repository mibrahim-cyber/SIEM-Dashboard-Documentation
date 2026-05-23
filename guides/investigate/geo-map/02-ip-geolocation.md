---
module: Geo Map
sidebar: Investigate → Geo Map
section: Investigate
subsection: How IP geolocation works
last_updated: 2026-05-23
---

# How IP geolocation works

**Sidebar path:** Investigate → Geo Map

![Geo Map main view](../../../screenshots/guides/investigate-geo-map.png)

### What you are looking at

Geo Map fills the main area with a dark SVG world map (`#060f1a` ocean, `#0e2035` continent paths from `CONTINENTS` in geo data module). Toolbar reads **GEO-THREAT MAP** with filter buttons **ALL**, **CRITICAL**, **BLOCKED**, and checkbox **impossible travel**. A stat strip shows **EXTERNAL SOURCES**, **COUNTRIES**, **BLOCKED IPS**, **impossible travel** counts. Attack sources render as sized circles on mapped coordinates; dashed Bézier arcs animate particles toward the **HQ** node (New York area, lat 40.7 lon -74.0). Right panel toggles between **TOP ATTACKERS** list and **IP DETAIL** on selection.

### What is happening underneath

Geolocation resolves via `getCachedGeo(ip)`, synchronous cache lookup with fallback chain: runtime Map → localStorage (`siem_geo_cache_v2`) → `/api/geo/{ip}` MaxMind GeoLite2 backend → static hash fallback in `getGeo()`. Private IPs (`10.x`, `192.168.x`, `172.16-31.x`) return `{ country: 'Internal' }` and are filtered out of map points. Normalised geo objects contain `lat`, `lon`, `city`, `country`, `cc`, optional `isp`. Alerts may embed pre-enriched `a.geo`; otherwise lookup runs at render via `useMemo`.

> **Technical note:** Accuracy varies. GeoLite2 city-level is ~80% accurate for broadband; VPNs and mobile carriers distort location. ISP field populated when backend returns it; not shown in GeoMap UI detail table but available in geo object.

### Why this matters

IP addresses are meaningless to most stakeholders. "203.0.113.45" tells an executive nothing; "connection from Shenzhen, China" triggers immediate business context. Geolocation is heuristic intelligence, wrong sometimes, indispensable often. SOC teams use geo for prioritisation, firewall geo-blocking debates, and fraud detection.

### Step-by-step walkthrough

1. Open Investigate → Geo Map with alert data present.
2. Read stat strip; note **EXTERNAL SOURCES** and **COUNTRIES**.
3. Hover map nodes: an IP label label appears beside circle.
4. Click a node; the right panel panel switches to **IP DETAIL** with Country, City, Severity, Alerts, Blocked.
5. Click ← BACK to return to **TOP ATTACKERS** list.
6. Toggle **CRITICAL** filter, map shows only critical-max-severity sources.
7. Enable **impossible travel** checkbox; red dashed inter-city lines appear if detected.

### Common questions

#### How does the dashboard know where an IP is located?

It queries a local MaxMind GeoLite2 database through the backend `/api/geo` endpoint, caching results in browser memory and localStorage. Think of it like a phone book mapping numbers to addresses: approximate but fast.

#### Can attackers hide their true location?

Yes. VPNs, Tor, and compromised regional servers make geo data represent the exit node, not the attacker keyboard. Treat geo as a clue, not proof of physical presence.

#### Why don't I see internal IPs on the map?

Internal RFC1918 addresses resolve to country Internal and are explicitly filtered out; they would all stack on HQ otherwise, cluttering the view.

#### What if geo lookup fails?

Fallback hash-based pseudo-geo assigns deterministic coordinates; better than nothing for demo, not authoritative for production decisions.

### Analyst workflow under pressure

Analyst scans stat strip for country count spike: possible distributed attack. Clicks **TOP ATTACKERS** entries to identify dominant countries. Critical filter focuses executive briefing on highest-severity origins. Geo informs block list geography section of incident report.

### Edge cases and gotchas

Empty map with zero external sources means no geo-resolvable alerts or all internal. Blocked IPs render grey with strikethrough line overlay. Animation runs continuous `requestAnimationFrame`; may impact performance on low-end machines with many arcs.

### Cache layers and offline operation

Geo resolution order: (1) alert-embedded `a.geo` if ingest enriched, (2) `runtimeCache` Map, (3) `localStorage` key `siem_geo_cache_v2`, (4) `GET /api/geo/{ip}` MaxMind GeoLite2 backend, (5) deterministic hash fallback. Private IPs short-circuit to Internal and are excluded from map points, preventing RFC1918 clutter at HQ coordinates. Backend status checkable via `getGeoBackendStatus()`, if backend offline, fallback geo may misplace IPs by hundreds of kilometres; note data quality in incident reports when operating on fallback.

### Communicating IP geolocation to leadership and engineering

For board conversations, frame Investigate → Geo Map numbers as risk to revenue and reputation. For engineering reviews, reference the component file and `the SIEM context pipeline` fields listed in the walkthrough. Keep artefacts: PNG exports beat memory.

### Who should read which sections

Use the walkthrough if you run the SOC; use the source tree if you ship the code. Both paths describe the same Investigate → Geo Map behaviour at different altitudes.

#### What should executives hear first about IP geolocation?

Lead with the stat strip or dominant visual on Investigate → Geo Map. Compare today's numbers to your last briefing slide if possible. Name the business process at risk, not the detection rule ID. Offer one mitigation already underway and one that needs approval. Reserve technical detail for the appendix.

#### How do maintainers validate IP geolocation against the live UI?

Before shipping UI changes to Investigate → Geo Map, run the dashboard locally, follow the numbered walkthrough, and screenshot discrepancies. Update this guide when column names, filters, or keyboard shortcuts shift. Shared alert shape is the integration surface for all Investigate modules.

#### What is the most common beginner mistake on this screen?

Treating visual intensity (colour, size, score) as absolute proof rather than relative prioritisation within the current dataset. Cross-check with a second module (Threat Hunt counts, Event Graph relationships, or Live Feed raw lines) before containment. A second frequent error is acting on session-only state (unsaved graphs, unsaved hunts, uncaptured heatmap focus) and losing context on refresh; screenshot or case-note artefacts before navigating away.
