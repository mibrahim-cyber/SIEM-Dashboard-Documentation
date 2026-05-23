---
module: Threat Hunt
sidebar: Investigate → Threat Hunt
section: Investigate
subsection: Built-in hunt templates
last_updated: 2026-05-23
---

# Built-in hunt templates

**Sidebar path:** Investigate → Threat Hunt

![Threat Hunt main view](../../../screenshots/guides/investigate-threat-hunt.png)

### What you are looking at

Four preset buttons under **SAVED HUNTS**: Active Bruteforce (2 rules), SQL Injection Attempts (2 rules), Non-standard Ports (2 rules), Unresolved Alerts (2 rules). Each button shows `{name}` on the left and `{n} rules` on the right in muted text. Hover highlights border cyan.

### What is happening underneath

```javascript
const SAVED_HUNTS = [
 { name: 'Active Bruteforce', rules: [{ field: 'eventType', op: 'equals', value: 'auth-failure' }, { field: 'severity', op: 'in', value: 'high,critical' }] },
 { name: 'SQL Injection Attempts', rules: [{ field: 'eventType', op: 'equals', value: 'db-query' }, { field: 'severity', op: 'equals', value: 'critical' }] },
 { name: 'Non-standard Ports', rules: [{ field: 'port', op: 'gt', value: '1024' }, { field: 'port', op: 'lt', value: '32768' }] },
 { name: 'Unresolved Alerts', rules: [{ field: 'status', op: 'equals', value: 'new' }, { field: 'severity', op: 'in', value: 'high,critical' }] },
];
```
Each preset encodes a high-value hunt pattern recognised industry-wide. Loading executes `setQueryRules(hunt.rules.map(r => ({...r, id: ruleId() })))`.

### Why this matters

Templates encode institutional knowledge, junior analysts need not reinvent queries. Bruteforce, SQLi, non-standard ports, and unresolved criticals cover OWASP Top 10 and common SOC backlog patterns. Templates also teach query composition by example: two focused conditions with **AND** logic beat one vague condition.

### Step-by-step walkthrough

1. Run Simulate Campaign to populate varied event types.
2. Click Active Bruteforce. Observe query builder populate with two rules.
3. Note hit count and severity breakdown in stats strip.
4. Click SQL Injection Attempts, compare result set size.
5. Try Non-standard Ports; watch **PORT** column for yellow highlights.
6. Run Unresolved Alerts: identify triage backlog.
7. Extend any preset with **+ ADD CONDITION** (e.g. add specific sourceIp).

### Common questions

#### Why these four patterns specifically?

They map to frequent attack classes: credential abuse (bruteforce), web app attacks (SQLi), C2/exfil channels (non-standard ports), and operational hygiene (unresolved criticals). Each is independently useful in tabletop exercises and real SOC shifts.

#### Can I delete or edit presets?

Presets are hardcoded; you cannot edit them. Save your modified version as a user hunt via **SAVE**. User hunts append below presets in the same list.

#### What if a preset returns zero results?

Either no matching data exists (a genuine confirmation of absence) or ingested logs lack that event type. Run Simulate Campaign or ingest representative logs, then check Monitor → Overview severity distribution to confirm coverage.

#### Do presets run on a schedule?

No. Click to load; results evaluate immediately. Scheduling requires Reporting → Scheduler for reports, not hunt queries in this lab.

### Analyst workflow under pressure

Monday morning shift starts with Unresolved Alerts, backlog triage. When VPN alerts spike, switch to Active Bruteforce. When web server alerts appear, SQL Injection Attempts. Templates provide consistent starting points so analysts spend time interpreting results, not building syntax.

### Edge cases and gotchas

Presets assume **AND** logic but do not set the logic toggle, if you left **OR** active from a prior hunt, preset results may surprise you. Verify **AND** is selected after loading. Event type strings must match parser output exactly (`auth-failure`, not `Auth Failure`).

### Preset-to-MITRE mapping and tuning paths

Active Bruteforce aligns with MITRE T1110 (Brute Force); credential access tactic. SQL Injection Attempts maps to T1190 (Exploit Public-Facing Application) when `db-query` events represent SQLi probes. Non-standard Ports supports C2 hunting (T1071 Application Layer Protocol) when malware uses non-standard ports for beaconing. Unresolved Alerts is operational hygiene, not MITRE-specific; reduces alert debt that hides real attacks in noise. After running each preset, click results and read **MATCHED RULES**, if empty, the alert may have been created by simulation without rule attribution, signalling a detection gap to raise with rules engineers. Extend presets rather than replacing them: Active Bruteforce plus `sourceIp starts_with 185.` adds intel context without losing the core auth-failure pattern. Save extended variants under names like "Active Bruteforce; Tor prefix" for repeatable weekly hunts.

### Communicating built in templates to leadership and engineering

When executives ask what the screen means for the organisation, translate visible counters into outcomes: data exposure, service disruption, notification timelines, and customer trust. Skip tool jargon; cite specific counts, timestamps, and named fields on Investigate → Threat Hunt. When engineers ask about data lineage, answer: SQLite-backed ingest through `the SIEM context pipeline`, normalised in the parser layer, rendered in React client state refreshed on ingest and Simulate Campaign. Capture the view with stat counters visible for audit evidence; verbal summaries alone rarely satisfy compliance reviews.

### Operator vs maintainer focus

Operators should rely on visible labels, colour cues, and the numbered walkthrough. Confirm field names in the UI match hunt and graph queries, and treat this lab build as a subset of enterprise SIEM capability.

### Template hygiene for shift leads

Shift leads should verify the **AND/OR** toggle after every preset load; Threat Hunt screen does not reset logic when applying `SAVED_HUNTS`. Document which preset each analyst ran in case notes when findings escalate; preset names (`Active Bruteforce`, `SQL Injection Attempts`) communicate intent faster than exporting raw query JSON during bridge calls.
