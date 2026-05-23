---
module: Incident Response
sidebar: Respond → Incidents
section: Respond
subsection: Incident vs alert vs event
last_updated: 2026-05-23
---

# Incident vs alert vs event

**Part of:** Respond → Incidents
**One-sentence focus:** Group related alerts into concrete incidents with playbooks, status tracking, and analyst notes.

![Incident Response main view](../../../screenshots/guides/respond-incidents.png)

### What you are looking at

Respond → Incidents uses a two-pane layout. On the left, a narrow column holds a four-tile stats bar labelled **TOTAL**, **ACTIVE**, **CONTAINED**, and **RESOLVED**; beneath it a search box reading SEARCH INCIDENTS..., severity filter chips (**ALL**, **CRITICAL**, **HIGH**, **MEDIUM**, **LOW**), and sort toggles (**TIME**, **ALERTS**, **IP**). Below those controls sits a scrollable list of incident cards. Each card shows a source IP in bold, a status badge (**ACTIVE**, **CONTAINED**, **RESOLVED**, or **DISMISSED** after you override it), severity colour, alert count, last-seen time, and a truncated list of triggered rule names. Some cards display a thin green progress bar indicating playbook completion percentage. The right pane either shows a centred **SELECT INCIDENT** prompt or, once you click a card, the full response workspace: header // INCIDENT RESPONSE with an identifier like **INC-A1B2C3D4**, status buttons, a five-column metadata grid (**SOURCE IP**, **SEVERITY**, **ALERT COUNT**, **FIRST SEEN**, **LAST SEEN**), an interactive playbook panel, attack category tags, triggered rules list, and an **ANALYST NOTES** textarea with **TIMESTAMP** and **CLEAR** buttons. Think of the left list as a triage queue and the right pane as the patient's chart. Nothing on this screen is a raw log line; every row is already a bundle of correlated alerts.

### What is happening underneath

In HABIBI-SIEM terminology, an event is a single normalised log record after ingestion; one failed SSH attempt, one HTTP request, one firewall deny. An alert fires when a detection rule matches one or more events; it carries severity, matched rule names, MITRE tags, and a sourceIp. An incident is computed automatically, not manually filed, by `correlateAlerts()` in the correlation engine. The engine sorts alerts by timestamp, then clusters any alerts sharing the same sourceIp whose timestamps fall within a 60-second window (`IP_WINDOW_MS`). Each cluster becomes one incident with fields `id` (prefixed `inc-`), `alertIds`, `alertCount`, `severity` (highest among cluster members), `categories`, `ruleNames`, `firstSeen`, `lastSeen`, and `status`. Status defaults to active if the last alert in the cluster was seen within the last 60 seconds; otherwise contained. The Incidents view reads `incidents` from the SIEM context pipeline; it does not write back to the correlation engine. Local dashboard state tracks `statusOverride` (your manual **ACTIVE** / **CONTAINED** / **RESOLVED** / **DISMISSED** clicks), per-incident playbook step checkmarks (`steps`), and free-text `notes`; these live in browser memory only unless you extend persistence.

### Why this matters

Without the event → alert → incident hierarchy, a brute-force campaign generating two hundred alerts looks like two hundred unrelated problems. Executives cannot prioritise; analysts burn out acknowledging duplicates. Elevating correlated noise into incidents is how a SOC answers "how many attacks are we facing right now?" instead of "how many log lines fired?" The 60-second IP window is a deliberate trade-off: tight enough to group a burst, loose enough that a patient attacker spacing attempts two minutes apart appears as separate incidents. Analysts must know that limitation.

### Step-by-step walkthrough

1. Sign in with a role that has write access (analyst or above) and run Simulate Campaign from Monitor → Overview if the incident list is empty.
2. Open Respond → Incidents and read the stats bar: **ACTIVE** in red is your immediate queue.
3. Click a severity chip such as **CRITICAL** to filter the list; type part of an IP or rule name in SEARCH INCIDENTS....
4. Click an incident card; note the generated ID **INC-** plus the first eight characters of the internal incident key.
5. Review metadata and click a status button (**CONTAINED** when you have isolated the source, **RESOLVED** when remediation is complete).
6. Work through the playbook checklist on the left of the detail pane. Click each step to toggle a checkmark; watch the progress bar advance.
7. Enter investigation notes in **ANALYST NOTES**; use **TIMESTAMP** to prepend a time marker before adding narrative.
8. Select the next incident from the list and repeat until **ACTIVE** count reaches zero or escalates to Case Manager.

### Common questions

#### What is the difference between an event, an alert, and an incident in plain language?

An event is one heartbeat on a security camera, one login attempt, one web request. An alert is the camera software saying "this pattern looks like a break-in attempt." An incident is the security guard's incident report that groups every related alert from the same suspect within about a minute into one folder so you do not write fifty reports for one attacker.

#### Who decides when something becomes an incident?

In this dashboard, the correlation engine decides automatically when alerts share a source IP within sixty seconds. Analysts do not manually promote alerts to incidents here; they triage incidents the engine already created. Human judgment appears when you change status, complete playbook steps, or open a case elsewhere.

#### Why do I still see many incidents from one simulate campaign?

Each unique external IP in the demo generates its own alert clusters. A campaign simulating multiple attackers produces multiple incidents by design; that mirrors real life where one simulation run can represent several concurrent threat sources.

#### Does changing status here affect alerts in alert manager?

Not directly in the current build. `statusOverride` in Incidents screen is local UI state. Underlying alerts retain their own lifecycle (new, acknowledged, resolved) in Alert Manager. For audit consistency, analysts should align alert resolution with incident **RESOLVED** status manually until bidirectional sync is added.

### What analysts do when the pager fires

During the first fifteen minutes of a suspected breach, the analyst filters **CRITICAL** and **HIGH**, sorts by **TIME**, and opens the newest **ACTIVE** incident. They read **TRIGGERED RULES** and **ATTACK CATEGORIES** to infer attack type, then execute the suggested playbook (brute-force, SQL injection, XSS, or default). Notes capture containment actions ("blocked 203.0.113.45 in SOAR at 14:32") with **TIMESTAMP** for a defensible timeline. Status moves to **CONTAINED** once perimeter controls are applied, then **RESOLVED** after verification. If multiple IPs appear, each incident is handled separately or escalated to Case Manager for a multi-host investigation.

### Edge cases and gotchas

Internal IPs (`192.168.*`, `10.*`, `172.16.*`) can appear as incidents but SOAR auto-lookup skips them on ingest: do not assume external threat intel ran. Playbook progress in the list view uses the default playbook length for percentage, not the category-specific length, which can skew the bar until you open the incident. Notes and step checkmarks reset on page refresh. Incidents older than sixty seconds since last alert auto-show contained in backend data even if you never clicked **CONTAINED**. Searching filters on sourceIp and ruleNames only, not categories or incident ID.

> **Technical note:** `correlateAlerts` assigns `id: inc-${alert.id}` using the seed alert's ID; sorting uses `lastSeen` descending. Category-based cross-IP clustering (`CATEGORY_WINDOW_MS = 120_000`) is defined in the correlation engine for future extension; the active loop performs IP-based clustering.
