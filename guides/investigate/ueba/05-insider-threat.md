---
module: UEBA
sidebar: Investigate → UEBA
section: Investigate
subsection: Insider threat detection
last_updated: 2026-05-23
---

# Insider threat detection

**Sidebar path:** Investigate → UEBA

![UEBA main view](../../../screenshots/guides/investigate-UEBA.png)

### What you are looking at

Insider indicators in table: high **EVENTS** with elevated score, high UNIQUE IPs (data copied from multiple locations), off-hours activity on dormant accounts, **SUSPICIOUS** status on non-IT users. Profile **RECENT EVENTS** shows event types/actions for last five events.

### What is happening underneath

Insider scenarios map to heuristic patterns: disgruntled employee, off-hours file access + critical events; contractor overreach, high IP diversity + unusual paths (paths tracked in Set but not displayed in table); credential sharing, multiple IPs same user simultaneous. No DLP byte counts; proxy via event volume and severity.

### Why this matters

Insiders bypass the perimeter; they already have credentials. Verizon DBIR consistently shows insider and partner involvement. UEBA is primary detection for " authorised user doing unauthorised things."

### Step-by-step walkthrough

1. Sort mentally by score; focus **SUSPICIOUS** non-admin users.
2. Compare **PEAK HOUR**, activity at 3am suspicious for desk workers.
3. Check **FAILED AUTH**; may indicate insider probing others' accounts.
4. Review OBSERVED IPs: corporate vs personal vs unknown.
5. Read **RECENT EVENTS** for sensitive actions (db-query, file-access if present).
6. Cross-reference Case Manager for HR flags (manual process).
7. Escalate to insider threat playbook if score ≥70 with exfil indicators.

### Common questions

#### Can UEBA prove malicious intent?

No; flags investigation, not conviction. HR and legal must be involved before accusatory action.

#### What about departing employees?

Look for rising off-hours activity + critical events weeks before resignation, classic exfil pattern. No automated "departure list" in lab; analyst must know HR calendar.

#### Does this detect data exfil volume?

Not directly. There are no megabyte counters. High event counts and critical severity may proxy exfil alerts if rules exist.

#### How is this different from DLP?

DLP blocks/leaks at content layer. UEBA detects behavioural anomaly regardless of content visibility; complementary controls.

### What analysts do when the pager fires

HR notifies departing employee, analyst searches UEBA for that username, reviews 30-day pattern via available events, checks off-hours spike, opens case if score elevated. Coordinates with legal before monitoring escalation.

### Edge cases and gotchas

IT admin accounts always look anomalous; establish role-based expectations manually. Pen testers deliberately trigger UEBA; whitelist engagement accounts. Privacy regulations may restrict user monitoring; know jurisdiction.

### HR and legal coordination boundaries

UEBA flags warrant investigation, not automatic discipline. Before engaging HR, gather: anomaly score breakdown, OBSERVED IPs, **RECENT EVENTS**, Geo Map impossible travel if applicable, and manager confirmation of legitimate activity. Insider scenarios in this lab lack HR system integration, process is manual. Document "UEBA score 78, off-hours + failed auth" in Case Manager before any account action for defensible audit trail.

### Communicating insider threat to leadership and engineering

Executives want impact and cost; developers want schema and file paths. Treat these one-line phrases as starting points and adapt to the meeting in the room. On Investigate → UEBA, read labels aloud from the UI and record them in case notes when legal may review the incident.

### Reading paths for analysts and engineers

Use the walkthrough if you run the SOC; use the source tree if you ship the code. Both paths describe the same Investigate → UEBA behaviour at different altitudes.

#### What talking points cover insider threat for senior leadership?

Use Investigate → UEBA as a prop, not a tutorial. Highlight the top three labelled fields that changed since yesterday. Explain customer or revenue exposure in plain language. Request only the decision you need today. Document the screen with timestamp for the minutes.

#### What React and API checks apply to insider threat?

Maintainers: open DevTools, compare network payloads to the field names cited here, and ensure RBAC gates still match Settings → RBAC. Document any intentional drift between demo data and production schemas in the technical note block.

#### What is the most common beginner mistake on this screen?

Treating visual intensity (colour, size, score) as absolute proof rather than relative prioritisation within the current dataset. Cross-check with a second module (Threat Hunt counts, Event Graph relationships, or Live Feed raw lines) before containment. A second frequent error is acting on session-only state (unsaved graphs, unsaved hunts, uncaptured heatmap focus) and losing context on refresh; screenshot or case-note artefacts before navigating away.
