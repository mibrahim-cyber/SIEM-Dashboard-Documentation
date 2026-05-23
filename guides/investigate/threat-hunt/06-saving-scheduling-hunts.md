---
module: Threat Hunt
sidebar: Investigate → Threat Hunt
section: Investigate
subsection: Saving and scheduling hunts
last_updated: 2026-05-23
---

# Saving and scheduling hunts

**Sidebar path:** Investigate → Threat Hunt

![Threat Hunt main view](../../../screenshots/guides/investigate-threat-hunt.png)

### What you are looking at

Below the preset list, an input labelled Save as... and a green **SAVE** button sit in a horizontal row. Saved user hunts appear in the same **SAVED HUNTS** list as presets, indistinguishable by styling except they were added after your session started.

### What is happening underneath

`saveHunt()` checks `savedName.trim()`, empty names silently abort. On success, `{ name, rules: queryRules }` appends to `userSaved` state and clears the input. Saved hunts store rule definitions without IDs; reloading regenerates IDs. There is no localStorage or backend persistence, browser refresh loses user hunts. Rules snapshot at save time, later edits to the builder do not auto-update saved entries.

### Why this matters

Reusable hunts prevent reinventing queries during recurring investigations. Monthly "check for dormant admin accounts" hunts should be one click, not fifteen minutes of query building. Even session-only persistence teaches the save/load workflow production tools provide (Saved Searches in Splunk, Hunt packages in Microsoft Sentinel).

### Step-by-step walkthrough

1. Build a query with 2–3 conditions.
2. Type a descriptive name: `VPN auth failures Q2`.
3. Click **SAVE**; verify it appears in **SAVED HUNTS**.
4. Modify the query builder conditions.
5. Click your saved hunt: builder resets to saved rules.
6. Refresh the browser; user hunt disappears (expected).
7. Re-save after refresh if needed for the session.

### Common questions

#### Where are saved hunts stored?

In React component state only, not SQLite, not localStorage. Refresh clears them. Presets are hardcoded in source and always available.

#### Can I share hunts with teammates?

Not in this lab. Export would require a feature to copy rule JSON; manually share condition descriptions instead.

#### What gets saved; results or queries?

Queries only (field, operator, value tuples). Results recompute from current alerts when loaded.

#### Can I overwrite a saved hunt?

Saving with the same name creates a duplicate entry; no deduplication. Use distinct names.

### Analyst workflow under pressure

During a multi-day investigation, the analyst saves hunts at each phase: `Phase1-bruteforce-IPs`, `Phase2-lateral-ports`, `Phase3-exfil-urls`. Clicking each restores the exact query for comparison as new alerts arrive. Even session persistence helps across coffee breaks without retyping.

### Edge cases and gotchas

**SAVE** with empty name does nothing, no error message. Saved hunts do not capture **AND**/**OR** logic mode separately if you change logic after saving; verify logic when reloading. Very long hunt names may overflow the button layout visually.

### Hunt library hygiene for shift teams

Even session-only persistence benefits shift handover when analyst A saves `Handover-bruteforce-2026-05-23` before analyst B arrives; B loads it from **SAVED HUNTS** without reconstructing conditions verbally. Naming conventions matter: include date, hypothesis, and scope (`VPN-auth-Q2-external-IPs`). Avoid generic names like "test" that force teammates to open and inspect each saved entry. Because saved hunts store rule tuples without logic mode, document whether the hunt used **AND** or **OR** in the saved name if logic matters; e.g. suffix `-AND`. When promoting a hunt to production detection, archive the saved hunt definition in the case record before refresh clears it, copy the visible condition rows from query builder into incident documentation verbatim.

### Communicating saving and scheduling hunts to leadership and engineering

Leadership briefings on Investigate → Threat Hunt should tie each KPI to a business owner. Technical stakeholders need the ingest → context → component path spelled out. Screenshot the stat strip with timestamps when evidence may be challenged later.

### Reading paths for analysts and engineers

Analyst readers: stay on-screen labels and the step list above. Maintainer readers: validate the screen against this prose before release. Enterprise deployments add scale; the interaction patterns here still apply.

#### How do you walk a non-technical board through saving and scheduling hunts quickly?

Brief the board on saving and scheduling hunts by showing Investigate → Threat Hunt live. Focus on trend direction, worst-case impact, and cost to respond. If data is sparse, say so and explain what you are doing to populate the view before the next meeting.

#### How do maintainers validate saving and scheduling hunts against the live UI?

Maintainers: open DevTools, compare network payloads to the field names cited here, and ensure RBAC gates still match Settings → RBAC. Document any intentional drift between demo data and production schemas in the technical note block.

#### What tripping point catches first-time users?

Treating visual intensity (colour, size, score) as absolute proof rather than relative prioritisation within the current dataset. Cross-check with a second module (Threat Hunt counts, Event Graph relationships, or Live Feed raw lines) before containment. A second frequent error is acting on session-only state (unsaved graphs, unsaved hunts, uncaptured heatmap focus) and losing context on refresh; screenshot or case-note artefacts before navigating away.
