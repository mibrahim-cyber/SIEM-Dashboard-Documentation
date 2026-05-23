---
module: Alert Manager
sidebar: Monitor → Alert Manager
section: Monitor
subsection: Every field in an alert record
last_updated: 2026-05-23
---

# Every field in an alert record

**Part of:** Monitor → Alert Manager
**One-sentence focus:** The table shows a triage subset; the full alert object in AlertDetailModal and JSON export carries rules, logs, geo, and simulation flags.

### What you are looking at

Table shows subset: time (HH:MM:SS UTC slice from ISO), severity bracketed, source IP monospace, truncated rule names, status, actions. Full record available by cross-navigation to Overview row click opening `AlertDetailModal`, fields include `id`, `timestamp`, `sourceIp`, `severity`, `status`, `eventType`, `matchedRules[]`, embedded `log`, optional `geo`, `simulated`, `ecsCompliant`, `soarWatchlisted`. An alert record is a police incident report form, summary line on the dispatch screen, full detail in the filing cabinet drawer when you click through.

### What is happening underneath

Alert object created in `processLogs()` merge of detection engine output plus enrichments. SQLite stores serialised JSON via `saveAlerts`. Modal pulls MITRE from `detectionRules.find(d => d.id === r.ruleId)`. Assigned analyst and notes fields are not implemented in Alert Manager table, case management adds notes in Respond → Case Manager. Audit trail partial: server audit logs API mutations; UI lacks per-alert history timeline.

### Why this matters

Investigations fail when key context (which rule, which log line, which MITRE technique) is scattered. Central record must answer: who, what, when, why fired, raw evidence.

### Step-by-step walkthrough

1. Pick row in Alert Manager; note visible columns.
2. Switch Overview: click same alert (match time + IP) open modal.
3. Read **MATCHED RULES**; record ruleName, category, MITRE line.
4. Scroll modal **LOG DATA**, original event fields.
5. Check `id` UUID for ticket reference.
6. Compare `simulated` flag if demo data.
7. Export JSON; inspect full schema offline.

### Common questions

#### Where is assigned analyst?

Not on alert; use Case Manager `assignee` field when escalated.

#### Where are notes?

Case notes array; not inline alert editing in v4.

#### What is stride in export CSV?

First matched rule's STRIDE category (spoofing, tampering, etc.) for compliance mapping.

#### Does table show MITRE?

Truncated rules column only, full MITRE in modal.

### Analyst workflow under pressure

Copies alert `id` and rule names into case ticket, attaches modal log JSON export snippet, links source IP to IOC watchlist entry reason field.

### Edge cases and gotchas

Truncated rules hide secondary matches; open modal. Time column shows time-only; date rollover ambiguous on overnight shifts.

> **Technical note:** CSV export columns: id, timestamp ISO, sourceIp, severity, status, eventType, rules joined `|`, stride. CSV export columns from `exportAlerts()`: id, timestamp ISO, sourceIp, severity, status, eventType, rules joined by pipe, stride from first matched rule. JSON export includes the full alert object with embedded `log`, `geo`, `simulated`, and `ecsCompliant` flags. The table truncates rule names for width; always open `AlertDetailModal` via Overview row click for MITRE lines and complete `matchedRules[]` arrays. Time column shows HH:MM:SS UTC slice from ISO timestamp, overnight shifts crossing midnight should reference full ISO in modal or export for unambiguous chronology.
