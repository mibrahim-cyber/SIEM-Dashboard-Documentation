---
module: Log Ingestion
sidebar: Ingest & Config → Log Ingestion
section: Ingest & Config
subsection: Enrichment at ingestion time
last_updated: 2026-05-23
---

# Enrichment at ingestion time

**Part of:** Ingest & Config → Log Ingestion
**One-sentence focus:** ECS field construction and geo enrichment applied after server validation.

### What you are looking at

After ingest, enriched events surface across the dashboard, most visibly on Monitor → Live Feed (geo not shown inline but present on objects), Investigate → Geo Map (plotted by latitude/longitude), and alert detail panels showing country/city when available. In the Log Ingestion preview itself, enrichment has not yet run, you see parsed IPs in orange but no country flags or map pins until post-ingest processing completes. The preview does show ECS-aligned columns because parsers emit normalized shapes during Stage 1. **ACTION / EVENT** maps to `eventType` or `event.action`; **STATUS** maps to HTTP status or `event.outcome`; severity badges reflect `inferSeverity()` output.

### Why this matters

ECS normalization lets rules write portable logic (`event.outcome === 'failure'`) instead of vendor-specific paths. Geo enrichment transforms IP addresses into investigative context, impossible travel detection, country-based blocking policies, executive dashboards showing attack origin. Doing enrichment at ingest (not at preview) avoids N API calls while the analyst still types and keeps preview snappy. Batch lookup amortizes network cost across the whole ingest chunk.

### Step-by-step walkthrough

1. Ingest Apache sample containing external IP `203.0.113.45`.
2. Open Investigate → Geo Map; confirm a pin appears (Beijing region for demo static table).
3. Ingest lines with `192.168.1.55`: confirm internal geo label Internal without external API call.
4. Open Monitor → Live Feed, click an event, inspect detail panel for nested ECS structure if exposed.
5. Fire an alert (brute-force sample). open alert detail, verify `geo` object attached on alert.
6. Check browser `localStorage` key `siem_geo_cache_v2` for cached entries after batch lookup.
7. Compare ECS JSON sample ingest: fields `@timestamp` and `event` pass through with `_format: 'ecs_json'`.

### Common questions

#### Why is geo missing on some events?

No extractable IPv4 in the parsed line (parse failure, IPv6-only, or validation stripped invalid IP). Geo attaches only when `sourceIp` or `source.ip` survives to enrichment.

#### Does enrichment modify the original _raw field?

No. `_raw` remains the verbatim line (truncated server-side at 16 KB). Geo adds a sibling `geo` object.

#### What ECS version does this target?

The schema follows Elastic Common Schema conventions loosely, `event.kind`, `event.category`, `source.ip`, `http.response.status_code`; without claiming full ECS compliance certification.

#### Are destination IPs geo-enriched?

Currently enrichment targets source IP only. CEF `dst` populates `destination.ip` and `destIp` flat field but does not trigger a second geo lookup in log processing.

### Using this view during live response

After ingesting VPN and web logs, the analyst pivots to Geo Map to see whether failed logins cluster geographically. Internal IPs appearing as Internal confirms lateral movement vs external breach path. ECS `event.outcome: failure` fields help Threat Hunt queries find all authentication failures without writing Apache-specific regex. If geo pins look wrong, the analyst checks whether MaxMind backend is running (`/api/geo/status`) or whether fallback hash assignment is active.

### Edge cases and gotchas

Private IP geo returns fixed NYC coordinates (40.7, -74.0) for map display: not physical location. Demo static `IP_GEO` overrides MaxMind for known sample IPs. Geo cache persists in localStorage across sessions. Stale data if IP reallocations change (rare in demo). Validation strips client severity before enrichment; preview severity badges may not match post-ingest rule severity. `_simulated` flag stripped at validation, simulated campaign logs marked differently via `generateMaliciousLog()`.

> **Technical note:** `lookupGeoIpBatch` deduplicates IPs before fetching; ingesting 1000 lines from one attacker IP triggers one geo API call. Alert objects inherit `geo: a.geo || geoMap[a.sourceIp]` in the enrichment map inside log processing.

### ECS field construction during parse:

Every parser produces a dual-layer object:

1. ECS canonical fields: `@timestamp`, `event.kind`, `event.category`, `event.type`, `event.outcome`, `event.action`, nested `source`, `destination`, `host`, `http`, `url`, `process`, `user_agent`, `message`.
2. Flat convenience fields. `sourceIp`, `username`, `eventType`, `urlPath`, `method`, `status`, `severity` for rule engine and table rendering compatibility.

```javascript
{
 id: '...',
 '@timestamp': '2026-05-22T09:00:03.000Z',
 timestamp: 1747904403000,
 _raw: '203.0.113.45 - root [22/May/2026:09:00:03 +0000] "POST /wp-login.php HTTP/1.1" 401 512...',
 _format: 'apache',
 event: { kind: 'event', category: ['web'], type: ['access'], outcome: 'failure', action: 'HTTP POST' },
 source: { ip: '203.0.113.45', user: { name: 'root' } },
 http: { request: { method: 'POST' }, response: { status_code: 401, body: { bytes: 512 } } },
 url: { path: '/wp-login.php', original: '/wp-login.php' },
 user_agent: { original: 'python-requests/2.28' },
 sourceIp: '203.0.113.45',
 username: 'root',
 eventType: 'HTTP_POST_401',
 severity: 'high'
}
```
### Geo enrichment duringlog processing:

After validation, `the SIEM context pipeline` collects unique IPs:

```javascript
const ips = working.map((l) => l.sourceIp || l.source?.ip).filter(Boolean);
const geoMap = ips.length ? await lookupGeoIpBatch(ips): {};
const geoEnrichedLogs = working.map((l) => {
 const ip = l.sourceIp || l.source?.ip;
 const geo = ip ? geoMap[ip]: null;
 return geo ? {...l, geo }: l;
});
```
1. Returns static Internal coordinates for RFC1918 addresses (`10.*`, `192.168.*`, `172.16–31.*`).
2. Checks in-memory + `localStorage` cache (`siem_geo_cache_v2`).
3. POSTs uncached IPs to `/api/geo/batch` (MaxMind GeoLite2 backend when running).
4. Falls back to static `IP_GEO` table for known demo IPs (`203.0.113.45` → Beijing, etc.).
5. Final fallback: hash IP into `REGIONS` pool for deterministic pseudo-geo. Alert enrichment adds `ecsCompliant: !!(a['@timestamp'] || a.event?.kind)` flag when alerts fire.
