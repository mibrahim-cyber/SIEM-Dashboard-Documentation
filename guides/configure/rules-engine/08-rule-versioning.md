---
module: Rules Engine
sidebar: Configure → Rules Engine
page: 08-rule-versioning.md
title: "Rule versioning and change management"
last_updated: 2026-05-23
---

# Rule versioning and change management

**Sidebar path:** Configure → Rules Engine

## Rule versioning and change management

### What you are looking at

Rules Engine displays current rule definitions with no version number, changelog panel, effective date, or author metadata on cards. Only the static `id` slug (`sql-injection`) persists as identifier across sessions. Toggle state may hydrate from server state, but rule logic versioning is git-history of detection rules catalog, not application UI feature. Change management for rules mirrors pharmaceutical formula control: the pill bottle (UI card) shows active ingredient name and strength (severity/description) but not batch number or lab revision history, that lives in manufacturing records (source control).

### What is happening underneath

Rule objects mutate in memory: `enabled` flips, `hits` increments. Source changes require deploy. No `version`, `updatedAt`, or `previousCheck` fields in schema. SQLite backend stores alerts referencing `ruleId`/`ruleName` snapshots at alert creation, renaming rule does not retroactively change old alert names. `clearAlerts()` zeroes hits; loss of tuning telemetry if not exported first. RBAC: tier3/manager admin functions on Overview; rule file edits developer-side.

> **Technical note:** Enterprise SIEMs export Sigma YAML with `id`, `modified`, `status`; HABIBI demo omits versioning to reduce scope.

### Why this matters

Incident replay five months later requires knowing which rule version fired. SOC2 change control asks who disabled production rules when. Absence of UI versioning means teams must impose external process; git tags, tickets, peer review; before editing detection rules catalog.

### Step-by-step walkthrough

1. Export current alerts JSON before rule changes, preserve hit context.
2. Record baseline hit counts screenshot from Rules Engine.
3. Create git branch for rule edit; commit message documents why (FP reduction, new TTP).
4. Modify detection logic: bump nothing in UI automatically.
5. Deploy/reload; verify card description matches edit manually.
6. Run regression test logs ensuring prior true positives still fire.
7. Store pull request link as version artifact.
8. Post-change compare hit counts, document delta in ticket.

### Common questions

#### Is toggling a version change?

Operationally yes; detection behaviour changes. Demo lacks audit log of toggles; production should log via API middleware.

#### Do alerts store rule version?

They store `ruleName`, `ruleId`, `severity`, `category` at match time; not version integer.

#### How to rollback a bad rule deploy?

Revert git commit and reload; existing bad alerts remain for manual clear.

#### Can two rule versions run simultaneously?

Not in demo, single `detectionRules` array. Blue/green deployment would need infrastructure outside app.

### How an analyst uses this during active incident

Mid-incident rule changes are discouraged; analyst requests tier3 apply pre-approved toggle only. Post-incident, version discussion enters lessons learned: "brute-force threshold was 5; recommend 8." They export alerts before admins test rule hotfixes.

### Edge cases and gotchas

Hit counter reset feels like version break but is data loss not schema version. Correlation Builder UUIDs regenerate on refresh; not versioned engine rules. MITRE technique updates external to rule version field. Renaming rule id breaks historical alert linkage analytics. Recommended external versioning table columns: rule id, semver, author, ticket, deploy date, rollback id, FP rate note. Map HABIBI id slug as stable key across semver renames of display name. When SQLite alert exports include matchedRules ruleId, historical reporting survives name changes if id stable; changing id breaks trend continuity. Pair git tags with simulation regression for audit evidence. Toggle audit gap: demo lacks who-disabled-rule-when log, production SIEMs emit audit events. Manager role should review weekly enabled/disabled ratio anomalies; sudden drop to 3/12 active signals misconfiguration or incident panic. Post-incident retrospectives ask whether temporary disables were reverted; permanent disable drift is common after night-shift firefighting. Semantic versioning convention suggestion: MAJOR for check() logic breaking false positive profile, MINOR for metadata or threshold tweak, PATCH for description typos. Store version in git commit message until schema supports version field. Rollback drill quarterly: revert detection rules catalog commit, reload, rerun Simulate Campaign, confirm expected hit profile; validates disaster recovery for detection layer. Change advisory should list dependent playbooks referencing rule names, brute-force runbook stale if rule renamed without updating Confluence links. Align rule id naming with Sigma id where translated; simplifies cross-reference in audit. Avoid renaming id after alerts exist in SQLite unless migration script updates matchedRules snapshots; not provided in demo. Version field request belongs on product backlog for enterprise fork. Configuration management database entry per rule recommended fields: rule id, display name, current version semver, last modified date, last modified author, enabled boolean, hit count seven-day rolling average, linked Sigma id if translated, linked MITRE techniques array, exception ticket ids for temporary disables, rollback commit hash, test log fixture filenames. HABIBI stores only subset in the detection rules catalog and runtime hits; export CSV manually until backend schema extended. Change advisory template email subject line format: [SIEM-RULE][MAJOR|MINOR] rule-id summary. Body lists detection change, expected alert delta, monitoring plan, rollback owner phone. Even demo teams benefit from habit before production cutover. Quarterly disaster recovery test includes restore detection rules catalog from tag and verify Simulate Campaign hit profile matches baseline screenshot archive, detection layer DR often neglected versus database restore drills. Audit questions to rehearse: Who approved disabling critical rule on date X? Answer requires external ticket; not in app. Which version fired on alert Y? Answer requires git blame on detection rules catalog at alert timestamp; not in alert JSON. Prepare integrators to add version integer on matchedRules at fire time in future releases; one-line engine enhancement with high compliance value.
