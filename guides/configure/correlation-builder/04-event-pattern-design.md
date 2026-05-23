---
module: Correlation Builder
sidebar: Configure → Correlation Builder
page: 04-event-pattern-design.md
title: "Event pattern design"
last_updated: 2026-05-23
---

# Event pattern design

**Sidebar path:** Configure → Correlation Builder

## Event pattern design

### What you are looking at

Event patterns in Correlation Builder express as condition rows: each row selects a field (dropdown of fourteen options including `source.ip`, `event.outcome`, `event.category`, `http.response.status_code`, `url.path`, `process.name`, `threat.tactic.name`, `severity`, `username`, `sourceIp`, `eventType`), an operator (`equals`, `contains`, `regex`, `gt`, `lt`, `gte`, `lte`), and a value string. Multiple rows combine under Logic selector **AND** (all must match) or **OR** (any matches). Threshold (number, min 1) and TIME WINDOW (seconds) (min 5) fields suggest aggregate pattern design, count matches within window, with the engine evaluating these parameters when the rule is deployed to the detection rules catalog. Pattern design is composing a wanted poster: height (field), eyes colour (operator comparison), name (value), AND means every detail must match; OR means any identifying trait suffices.

### What is happening underneath

`testRule()` evaluation per alert object:

```javascript
const val = c.field.split('.').reduce((o,k) => o?.[k], log) ?? log[c.field];
// operator switch: equals, contains, regex, numeric compares
return logic === 'AND' ? conds.every(Boolean): conds.some(Boolean);
```
Nested field access supports ECS-like paths (`event.outcome`) and flat aliases (`sourceIp`). Regex try/catch returns false on invalid pattern. Threshold/windowSec not applied in testRule; only condition boolean on each alert individually; gap between UI fields and test implementation important for accuracy.

> **Technical note:** Default new condition: `event.outcome equals failure`; suitable for authentication failure correlation patterns.

### Why this matters

Poor patterns cause missed attacks (too strict AND chain) or noise (overbroad OR with `contains`). Field selection must align to ingested log normalisation; mismatch yields zero test matches despite visible alerts on Overview.

### Step-by-step walkthrough

1. Create new rule with **AND** logic.
2. Condition 1: `event.category` `equals` `authentication`.
3. Condition 2: `event.outcome` `equals` `failure`.
4. Run test, count alerts matching both fields simultaneously.
5. Switch to **OR** logic; retest: match count should increase.
6. Add `sourceIp` `contains` `203.0` to narrow to lab attacker range if applicable.
7. Experiment `regex` operator with `(?i)admin` on `url.path`.
8. Document intended pattern in **DESCRIPTION** textarea for handoff to developers.

### Common questions

#### Are threshold and window used during TEST?

Not during the Builder test pass. `testRule()` evaluates conditions per alert object to validate field matching logic. Threshold and window parameters apply when the rule is deployed to the detection rules catalog for production execution.

#### Which fields exist on alert objects?

Alerts inherit log fields plus alert metadata; `sourceIp`, `eventType`, `severity`, nested `event`, `http`, etc. Test uses same shape as stored in alert from detection.

#### Can I match on rule name?

Not in field dropdown; would need `contains` on description or extend `CONDITION_FIELDS`.

#### How many conditions are practical?

UI unlimited; performance degrades on test with many rows scanning all alerts O(rules × alerts × conditions).

### How an analyst uses this during active incident

Post-incident, analyst reconstructs attack pattern as condition set matching alert detail raw JSON fields observed. They test against live alert population from incident timeframe. They export description + conditions to ticket for engineering implementing executable detection logic with real threshold/window semantics.

### Edge cases and gotchas

Field path typos silently fail, null values return false. Case-insensitive equals/lowercase conversion may surprise with case-sensitive URLs. Regex errors fail closed (no match). AND with contradictory conditions always zero matches. `gt/lt` coerce Number; non-numeric strings yield NaN comparisons. Pattern anti-patterns to teach: OR chaining ten broad contains values on url.path matches nearly everything. AND chaining mutually exclusive fields yields zero always; good classroom exercise. Numeric comparisons on string ports require ingestion normalising types. HABIBI test uses Number(val) coercion. ECS alignment reference: source.ip nested vs sourceIp flat both listed because alerts may contain either depending on normalisation stage in processLogs geo enrichment pipeline. Prefer dotted ECS fields for new patterns unless ingesting legacy flat JSON. Document chosen field in DESCRIPTION textarea for engineering handoff, reduces translation errors when promoting Builder draft to detection rules catalog imperative check. Field operator matrix guidance: equals on numeric status codes; contains on substrings in paths; regex on structured tokens; gt/lt on byte counts if mapped to numeric fields. Mixing operators across AND chain requires all succeed; test each condition independently before combining. Export condition list as markdown table in change tickets for readability. When handoff to detection rules catalog, translate AND chain to short-circuit boolean && in check() for performance. Builder test uses array every() similar cost profile. Capstone: students must achieve test match count between one and ten on campaign-generated alerts; too broad or too narrow fails grading rubric. Teaches precision tuning mindset transferable to Sigma authorship and enterprise SIEM consoles with similar field-operator builders. Classroom exercise extension: given alert JSON on screen, students write three condition rows achieving match in under five minutes, builds field literacy faster than lecture. Review common mistakes: wrong case on equals despite case-insensitive ops on some fields; regex missing escape on dot in url.path; using sourceIp when alert only has nested source.ip populated after normalisation. Pattern documentation standard: one paragraph plain English, one table of conditions, one test result screenshot, one known limitation bullet; attach to every Builder rule before promotion discussion. Aligns with Sigma description and falsepositives fields culture in community rules. For OR logic rules, document each OR branch threat scenario separately so future editors do not remove branch thinking it duplicate. Field dropdown fourteen options not exhaustive; custom fields from novel log sources require detection rules catalog check() directly until dropdown extended in Correlation Builder screen CONDITION_FIELDS constant. Process improvement ticket: ingest sample log, enumerate keys recursively, propose dropdown additions each sprint. Prevents authors using incorrect field names when extending beyond the current schema.
