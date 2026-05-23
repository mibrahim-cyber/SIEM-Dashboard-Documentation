---
module: Threat Hunt
sidebar: Investigate → Threat Hunt
section: Investigate
subsection: How to document a hunt
last_updated: 2026-05-23
---

# How to document a hunt

**Sidebar path:** Investigate → Threat Hunt

![Threat Hunt main view](../../../screenshots/guides/investigate-threat-hunt.png)

### What you are looking at

Documentation artefacts are indirect: the query builder shows current conditions visibly; **ALERT DETAIL** captures individual finding context; stats strip quantifies scope (hits, severity mix, top IP). No dedicated "hunt report" export exists in this module.

### What is happening underneath

A complete hunt record in enterprise SOC practice includes: hypothesis, methodology (query), scope (hit count), findings (selected alerts), conclusion. Here, methodology maps to `queryRules` + `logic`; scope to `results.length` and `stats`; findings to selected row's **ALERT DETAIL** fields. Audit trail for compliance would copy these into Respond → Case Manager manually. The `matchedRules` array in alert detail shows which detection rules fired, linking hunt findings back to detection engineering.

### Why this matters

Undocumented hunts are lost knowledge. When a hunter finds nothing, the organisation still learns "we checked X and found Y." Compliance frameworks (ISO 27001 A.12.6.1, NIST CSF DE.CM-1) expect evidence of ahead-of-time monitoring. Documentation transforms hunting from a hobby into an auditable control.

### Step-by-step walkthrough

1. Before hunting, write hypothesis in external notes: "Testing for SQLi on web servers."
2. Load or build matching query; record exact conditions from query builder.
3. Screenshot stats strip showing hit count and severity breakdown.
4. Click top 3 results; screenshot **ALERT DETAIL** for each.
5. Record conclusion: true positive, false positive, or inconclusive.
6. Paste documentation into Respond → Case Manager case notes.
7. If true positive, note recommended detection rule change for Configure → Rules Engine.

### Common questions

#### Does the dashboard auto-log my hunt activity?

No. Manual documentation required. Production SIEMs log search activity for audit; this lab does not.

#### What should a hunt report include?

Hypothesis, date/analyst, query conditions, result count, exemplar alerts (IDs/IPs/timestamps), assessment, and recommended actions. Minimum viable: screenshot of query builder + stats + one alert detail.

#### Why document negative results?

Proves due diligence. "We hunted for X during the breach window and found nothing" narrows investigation scope and satisfies auditors asking about ahead-of-time detection.

#### How do matched rules in ALERT DETAIL help?

They show which existing detections already cover your finding, if matchedRules is empty for a suspicious row, you may need a new rule (see next section).

### Analyst workflow under pressure

Every 30 minutes during major incidents, the lead assigns hunt tasks with mandatory documentation: condition set, hit count, disposition. Findings feed the incident timeline. Negative hunts prevent duplicate work, "already checked port scan pattern, zero hits."

### Edge cases and gotchas

Session-only state means hunt queries disappear on refresh; document before navigating away. **ALERT DETAIL** excludes `matchedRules` and `id` from the generic field list but shows matched rules separately). ISO timestamps in detail (`toISOString()`) differ from table display (`toLocaleTimeString()`).

### Minimum viable hunt record template

A hunt record sufficient for ISO 27001 evidence includes: (1) Hypothesis; one sentence plain English; (2) Query; field/operator/value list matching query builder rows plus AND/OR; (3) Scope, `results.length` and `HITS / TOTAL` from stats strip at hunt time; (4) Sample findings; three **ALERT DETAIL** field exports (sourceIp, timestamp, eventType minimum); (5) Disposition; true positive / false positive / inconclusive; (6) Actions; rule change ticket, case ID, or "no action"; (7) Analyst and timestamp. Screenshot the stats strip and one **ALERT DETAIL** panel for visual audit appendix. Negative hunts deserve equal documentation, "hunted SQLi pattern during breach window, zero hits" proves coverage and prevents duplicate effort when second analyst arrives. Store records in Respond → Case Manager linked to incident ID for chain of custody.

### Communicating documenting a hunt to leadership and engineering

Leadership briefings on Investigate → Threat Hunt should tie each KPI to a business owner. Technical stakeholders need the ingest → context → component path spelled out. Screenshot the stat strip with timestamps when evidence may be challenged later.

### Operator vs maintainer focus

This page keeps UI strings explicit so operators can follow the walkthrough without guessing field names.

#### How do you walk a non-technical board through documenting a hunt quickly?

Open Investigate → Threat Hunt on the live dashboard during the meeting. Point to the primary visual described in the opening section; skip raw log lines. State how many items are flagged, whether the pattern is new or recurring (compare to yesterday's screenshot if you have one), and name one concrete next action (block IP, reset credential, open case). Boards decide on risk and resources, not MITRE techniques, so translate findings into business impact and recommended spend. Close with what remains unknown and when you will update them.

#### What integration tests guard documenting a hunt behaviour?

Before shipping UI changes to Investigate → Threat Hunt, run the dashboard locally, follow the numbered walkthrough, and screenshot discrepancies. Update this guide when column names, filters, or keyboard shortcuts shift. Shared alert shape is the integration surface for all Investigate modules.

#### What is the most common beginner mistake on this screen?

Jumping to containment from Investigate → Threat Hunt without corroboration. Use the walkthrough fields as leads, not verdicts. Export or note your filter set before leaving the page.
