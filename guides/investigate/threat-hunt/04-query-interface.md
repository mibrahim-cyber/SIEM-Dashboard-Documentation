---
module: Threat Hunt
sidebar: Investigate → Threat Hunt
section: Investigate
subsection: The query interface
last_updated: 2026-05-23
---

# The query interface

**Sidebar path:** Investigate → Threat Hunt

![Threat Hunt main view](../../../screenshots/guides/investigate-threat-hunt.png)

### What you are looking at

Each condition row contains three controls: a field dropdown (130px), operator dropdown (110px), value text input (flexible width), and a red **Remove** button. Field labels match alert object keys exactly: `sourceIp`, `eventType`, `severity`, `status`, `method`, `url`, `port`, `username`, `statusCode`. Operator labels are human-readable: `contains`, `=`, `starts with`, `ends with`, `in (comma sep)`, `>`, `<`, `≠`, `>=`, `<=`.

### What is happening underneath

`OP_OPTIONS` maps each field to allowed operators, changing the field resets the operator to the first valid option for that field. `evaluateRule` lowercases both alert value and target for string ops; numeric ops use `parseFloat`. The `in` operator splits `rule.value` on commas. Unknown fields fall back to `contains` and `equals`. Query evaluation runs client-side over the full alerts array on every keystroke (via dashboard state updates triggering `useMemo`).

> **Technical note:** This is not SQL or KQL, it is a lightweight JSON rule evaluator. Production SIEMs expose Lucene, SPL, or Sigma translations. The field names here match normalised alert schema from the ingest pipeline.

### Why this matters

Hunt queries must map to normalised fields, not raw log text. A syslog line contains "Failed password for root" but you query `eventType equals auth-failure` because the parser extracted and renamed the field. Understanding searchable fields is the bridge between "what I want to find" and "what the system can evaluate."

### Step-by-step walkthrough

1. Click **+ ADD CONDITION**.
2. Select `sourceIp`, note operators: contains, equals, starts_with, ends_with.
3. Enter `203.0.113` with contains.
4. Add second condition: `severity` with operator in (comma sep), value `high,critical`.
5. Set logic **AND**; verify both must match.
6. Change field to `port`; note numeric operators appear.
7. Click column header **SOURCE IP** to sort; click again to reverse.

### Common questions

#### Why can't I search raw log message text?

Raw messages live in Monitor → Live Feed. Threat Hunt searches structured alert fields post-parser. If you need raw text search, use Live Feed filters or extend ingest parsing to populate a searchable field.

#### What does "in (comma sep)" mean?

The value `high,critical` matches alerts where severity equals high OR critical within that single condition. It is not the same as the global **OR** toggle; it is one condition matching multiple values for one field.

#### How do I hunt for unusual ports?

Use `port gt 1024` **AND** `port lt 32768`; exactly what the Non-standard Ports preset does. Ports 80 and 443 render grey in results; other ports highlight yellow.

#### Can I search by username?

Yes; field `username` with contains or equals. Useful for credential-focused hunts alongside UEBA.

### Operational use during containment

The analyst builds queries iteratively: start with known bad IP (`sourceIp equals 203.0.113.45`), add `eventType equals auth-failure`, check hit count, add `status equals new` if triage backlog matters. Column sorting on **TIME** reveals attack timeline within results. Each condition documents the hunting hypothesis for the incident record.

### Edge cases and gotchas

Changing field mid-condition resets operator, re-check operator after field changes. Empty value strings match everything for `contains` (empty string is in every string). `port` displayed as `; ` when null; numeric filters exclude nulls. URL column shows `alert.url ?? alert.username ?? '. '`, not all alerts have URLs.

### Operator reference with alert-field examples

| Field | Example hunt | Interpreting results |
|-------|-------------|---------------------|
| sourceIp | contains 203.0.113 | Subnet-wide hunt without knowing full IP |
| eventType | equals auth-failure | Authentication attacks only |
| severity | in high,critical | Multi-value without OR toggle |
| status | equals new | Untriaged backlog |
| port | gt 1024 AND lt 32768 | Non-standard service ports |
| statusCode | gte 500 | Server errors on web paths |
| username | contains admin | Privileged account targeting |

Sorting by **TIME** with descending arrow (default after first click on timestamp column) surfaces newest evidence first; standard for ongoing incidents. Sorting by **PORT** groups non-standard port outliers visually via yellow highlighting. Empty queryRules returns all alerts; useful for baseline exploration but dangerous on large datasets; always watch `HITS / TOTAL` ratio.

> **Technical note:** `evaluateRule` lowercases string comparisons; hunting `Admin` matches `admin`. Numeric comparisons on null ports return false, port hunts exclude rows without port fields.

### Communicating query interface to leadership and engineering

Executives want impact and cost; developers want schema and file paths. Treat these one-line phrases as starting points and adapt to the meeting in the room. On Investigate → Threat Hunt, read labels aloud from the UI and record them in case notes when legal may review the incident.

### Operator vs maintainer focus

Analyst readers: stay on-screen labels and the step list above. Maintainer readers: validate the screen against this prose before release. Enterprise deployments add scale; the interaction patterns here still apply.
