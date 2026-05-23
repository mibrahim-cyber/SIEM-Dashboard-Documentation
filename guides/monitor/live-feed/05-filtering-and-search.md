---
module: Live Feed
sidebar: Monitor → Live Feed
section: Monitor
subsection: Filtering and search
last_updated: 2026-05-23
---

# Filtering and search

**Part of:** Monitor → Live Feed
**One-sentence focus:** Client-side IP, event-type, and substring filters narrow the buffer instantly without stopping ingestion.

### What you are looking at

Filter input spans toolbar width with green border focus state. Event pills below toolbar show `ALL` plus dynamic types from `new Set(rawLogs.map(l => l.eventType))`. Counter `{shown}/{total}` right of filter box. Combined filters intersect: pause freeze → event type pill → text filter. Search here is like using a shop floor intercom to call out one name in a noisy factory, you still hear the factory, but only matching voices get highlighted in your attention. It does not stop other events from arriving.

### What is happening underneath

1. Start from `displayLogs` (frozen if paused, else `rawLogs`).
2. If `evtFilter !== 'all'`, keep matching `eventType`.
3. If text `filter` non-empty, lowercase match against: `sourceIp`, `eventType`, `method`, `url` (string), `username`, or full JSON string. No time-range picker in Live Feed, temporal narrowing requires manual timestamp reading or external tooling. Severity filter absent, severity lives on alerts, not raw logs in this view.

### Why this matters

At 50,000 events/hour, unfiltered scroll is unusable. IP filter during incident reduces rows from thousands to dozens. Event type filter separates DNS noise from auth failures. JSON substring search finds rare user agents or file hashes embedded in nested fields.

### Step-by-step walkthrough

1. Enter partial IP `203.0`; watch counter drop.
2. Clear filter: click `auth-failure` pill.
3. Combine IP filter with pill for precise slice.
4. Search username `root` for credential attacks.
5. Search `sql` to find injection patterns in URLs/bodies via JSON fallback.
6. Pause feed before filtering if you need stable counts while presenting.
7. Clear filters by emptying input and selecting **ALL** pill.

### Common questions

#### Can I filter by time range?

Not in v4 Live Feed UI. Use Monitor → Attack Timeline for temporal views or export logs for SIEM query language elsewhere.

#### Is search case-sensitive?

Text filter lowercases query; fields lowercased where applicable. IP octets unaffected.

#### Why did JSON search match unexpected rows?

Whole-object stringify matches any nested key/value substring, but may over-match. Narrow with event type pill first.

#### Do filters affect ingestion?

No, only client display. Paused + filtered view still accumulates full buffer server-side in memory.

### Analyst workflow under pressure

First action: filter attacker IP from Overview alert. Second: pill to `login-attempt` or `command-exec` per hypothesis. Third: pause and screenshot filtered set for case record. Clear filters periodically to notice secondary attackers.

### Edge cases and gotchas

Empty filter with rare event type pill may show zero rows while buffer has data; message `NO MATCHING LOGS`. Event pills regenerate when new event types appear; pill set changes during long sessions. Object URL filter bug: object urls skip string includes; rely on JSON stringify path.

> **Technical note:** `selected` index refers to position in `filtered` array, not global buffer index, re-filtering clears semantic selection if index out of range. The `filtered` useMemo in Live Feed screen chains three transformations: start from `displayLogs` (frozen snapshot when paused, else live `rawLogs`), apply event-type pill filter, then apply text search across `sourceIp`, `eventType`, `method`, string `url`, `username`, or full JSON via `JSON.stringify`. This design keeps filtering entirely client-side for sub-millisecond response on demo-scale buffers. During screen sharing, pause before filtering so row counts stabilise for the viewer. The `{shown}/{total}` counter beside the filter box gives immediate feedback on filter breadth; a sudden drop from 400 to 3 rows confirms the IP fragment matched.
