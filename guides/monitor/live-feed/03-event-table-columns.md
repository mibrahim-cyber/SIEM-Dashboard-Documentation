---
module: Live Feed
sidebar: Monitor → Live Feed
section: Monitor
subsection: Every column in the live event table
last_updated: 2026-05-23
---

# Every column in the live event table

**Part of:** Monitor → Live Feed
**One-sentence focus:** Stream and table views map structured log fields to columns so analysts read events without opening JSON on every line.

### What you are looking at

Stream view columns left-to-right: timestamp (`HH:MM:SS.mmm`), **EVENT TYPE** (uppercase, colour-coded), **METHOD** (HTTP verb colours), **SOURCE** IP, **STATUS** HTTP code (red if ≥400), URL/username summary (truncated), optional:port. Table view headers: **TIME**, **EVENT**, **METHOD**, **SOURCE**, **STATUS**, **URL/USER**, **PORT**, **SIZE** (`responseSize`). Selected row highlights with left green border in stream mode or background fill in table mode. Imagine a customs declaration form at an airport, each field captures one fact about a traveller (who, from where, carrying what). Log columns are those fields for network events: when, what kind, from whom, success or failure, to which resource.

### What is happening underneath

Fields map from normalized log objects post-`api.validateLogs()` and parser enrichment. Typical keys: `timestamp`, `eventType`, `method`, `sourceIp`, `statusCode`, `urlPath` or `url` or `username`, `port`, `responseSize`. Colours from `EVT_COLOR` and `METHOD_COL` constants in Live Feed screen. ECS-style nested fields may exist in detail panel (`event.kind`, `@timestamp`) but stream view uses flattened convenience properties. Geo enrichment adds `geo` object visible only in detail panel, not stream columns.

### Why this matters

Column semantics train junior analysts to read logs without opening JSON. Misreading `sourceIp` as destination causes wrong blocks. Status code colouring draws eyes to failed attacks (401/403/500). Method column distinguishes read vs write abuse (GET vs POST DELETE).

### Step-by-step walkthrough

1. Switch to **TABLE VIEW** for full column set including **SIZE**.
2. Click a `login-attempt` row. Verify **SOURCE** matches Overview alert IP.
3. Note orange **EVENT** labels for `port-scan` / `auth-failure` per `EVT_COLOR`.
4. Compare **STATUS** empty vs numeric, non-HTTP events may omit status.
5. Watch **PORT** highlight non-standard ports (not 80/443/22) in amber.
6. Open **LOG DETAIL** for same row; see all keys including nested `geo`.
7. Toggle stream view for dense chronological scanning.

### Common questions

#### Where is destination IP?

HABIBI-SIEM demo logs emphasise `sourceIp` as attacker/client. Destination may appear inside `url`, `host`, or nested ECS fields in **LOG DETAIL** depending on generator/parser; not a dedicated stream column in v4.

#### Why is URL/USER sometimes a username?

`formatLogSummary()` prefers `urlPath`, string `url`, object url paths, file paths, then falls back to `username` for auth events; one column serves multiple event families.

#### What does SIZE mean?

HTTP response body size in bytes when present on web logs, large **SIZE** on `data-transfer` events may indicate exfiltration candidates.

#### Why METHOD dash for some rows?

Non-HTTP event types (`dns-query`, `port-scan`) lack HTTP verbs; display `: `.

### Operational use during containment

Analyst sorts mentally by **TIME** within a paused window, chains **EVENT** sequence (scan → login → command-exec), and copies **SOURCE** for watchlist. Table **STATUS** column quickly counts failed auth ratio. Non-standard **PORT** highlights lateral tools.

### Edge cases and gotchas

Filtering `l.url?.toLowerCase()` fails if `url` is object; filter still catches via `JSON.stringify`. Millisecond timestamps wrap at midnight, cross-midnight investigations need date context from detail ISO view. Very long URLs truncate in stream with ellipsis; use detail panel for full path.

> **Technical note:** `fmtTime()` uses local browser timezone, not UTC; compare with alert modal ISO timestamps when writing formal timelines. The `formatLogSummary()` helper in Live Feed screen exists because ECS logs store `url` and `file` as nested objects. Rendering those objects directly in the UI would crash the view; the column therefore shows a flattened path string. The `formatLogFieldValue()` companion stringifies nested objects in **LOG DETAIL** so analysts still see full structure when investigating. HTTP method colours (`METHOD_COL`) give instant read/write context: DELETE and PATCH in red/orange draw the eye during destructive activity reviews. Status codes at or above 400 render red in the stream view, aligning visually with failed authentication and exploitation attempts even before an alert fires.
