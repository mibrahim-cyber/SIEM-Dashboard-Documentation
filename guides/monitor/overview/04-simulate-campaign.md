---
module: Overview
sidebar: Monitor → Overview
section: Monitor
subsection: The Simulate Campaign button
last_updated: 2026-05-23
---

# The simulate campaign button

**Part of:** Monitor → Overview
**One-sentence focus:** Simulate Campaign injects staged malicious logs through the real detection pipeline for demos, labs, and rule regression without touching production systems.

### What you are looking at

In the left column under **SIMULATION**, a full-width red danger button reads [ SIMULATE CAMPAIGN ] while idle, or [ RUNNING... ] when disabled during playback. Helper text below states: "Injects demo attack logs for rule testing only. Real alerts come from Log Ingestion." While running, the header **ENGINE** field switches from green **READY** to orange **SIMULATING**. Alerts generated from simulation carry an orange **SIM** badge on each feed row. Keyboard shortcut S triggers the same function. Imagine a fire department running a controlled burn in a training field, real flames, real hoses, but no civilians at risk. Simulate Campaign is that controlled burn for your SOC: realistic attack traffic without requiring external attackers or production log taps.

### What is happening underneath

`simulateCampaign()` in the SIEM context pipeline guards on `campaignRunning || !canWrite`. It sets `campaignRunning true`, then schedules timed batches via `setTimeout`:

| Delay | Payload |
|-------|---------|
| 0ms | 5× `brute-force` malicious logs |
| 1500ms | 3× `sql-injection` |
| 3000ms | 3× `xss` |
| 4500ms | 5× `brute-force` |
| 5500ms | 2× `data-exfil` |
| 6500ms | 2× `privilege-escalation` |

Each log comes from `generateMaliciousLog(type)` in mock log generator with a campaign data lineage flag set to mark it as campaign-generated. Batches call `processLogs()`, which validates via `api.validateLogs()` (write role), enriches GeoIP, runs `processLogs()` on the detection engine, dedupes if enabled, persists alerts to SQLite, and may trigger automatic IP enrichment on critical/high external IPs. After 8000ms, `campaignRunning` resets false. Alerts inherit the campaign data lineage flag when any source log carried it.

### Why this matters

Demonstrating a SIEM to professors, executives, or interview panels with an empty feed undermines the product. Simulation provides a repeatable narrative: brute force → web attacks → exfil → privilege escalation, mirroring common kill-chain ordering. Developers use it to verify rules fire without crafting manual JSON in Log Ingestion. It also trains new analysts on triage UX before production access.

### Step-by-step walkthrough

1. Log in as a write-capable user (`analyst2` tier2 or above).
2. Navigate to Monitor → Overview.
3. Confirm feed is empty or clear resolved clutter for a clean demo.
4. Click [ SIMULATE CAMPAIGN ] (or press S).
5. Watch **ENGINE: SIMULATING** and button [ RUNNING... ], do not double-click.
6. Observe alerts appearing in waves over ~6.5 seconds; note **SIM** badges.
7. Open an alert row; `AlertDetailModal` shows matched rules (e.g. brute-force, SQLi).
8. Check **ACTIVE INCIDENTS** and **TOP ATTACKERS** populate as clusters form.
9. After ~8 seconds, **ENGINE** returns to **READY**; triage alerts or [ CLEAR ALL ] (admin) to reset.

### Common questions

#### Will simulate campaign affect production systems?

No. It injects synthetic logs into the client-side processing pipeline and SQLite alert store only. No packets leave the browser to external targets. SOAR may call AbuseIPDB for external IPs in campaign alerts if keys are configured; be aware of API quota during exercises.

#### Why do some campaign logs not generate alerts?

Rules must be enabled (**RULES** not paused). Dedup may collapse rapid repeats from the same IP/rule within 30 seconds. Validation may strip malformed events if server rejects fields. Check Configure → Rules Engine for rule enablement.

#### Can tier1 analysts run simulations?

No. `canWrite` is required. Tier1 sees the button disabled or no-ops. This prevents junior read-only users from polluting shared alert state during concurrent sessions.

#### How is this different from log ingestion?

Log Ingestion accepts arbitrary user-supplied JSON/CSV lines through the ingest UI and API, useful for custom formats. Simulate Campaign uses curated malicious templates with correct field shapes guaranteed to trigger specific STRIDE rules. Use simulation for demos; use ingestion for parser testing.

### Using this view during live response

They do not; simulation is for lab, demo, and rule validation only. During real incidents, analysts disable simulation and rely on ingested logs. If **SIM** badges appear during a real event, someone ran a demo mid-shift, filter mentally or ask admin to **CLEAR ALL** to avoid mixing synthetic and real evidence.

### Edge cases and gotchas

Double-triggering is blocked by `campaignRunning` guard. Campaign logs may still trigger real AbuseIPDB lookups and watchlist adds for high scores; disable keys or use internal IP ranges in custom tests if undesired. Eight-second window means impatient clickers may think it failed if first batch is slow. The campaign run does not reset `logsProcessed`; **LOGS** still climbs, which is correct behaviour.

> **Technical note:** Campaign timing uses `setTimeout`, not `async/await` queue; browser tab throttling in background tabs may stretch delays. Keep tab focused during demos.

### Campaign choreography in detail

The simulate path is the only intentional source of exercise-generated alerts on Overview. Real production alerts always originate from Ingest → Log Ingestion or API validation, the helper text under the button states this explicitly so demo operators do not misrepresent synthetic traffic in audits. Each wave uses `generateMaliciousLog(type)` templates pre-shaped for STRIDE rule gates: brute-force logs carry repeated auth-failure semantics; sql-injection logs embed suspicious URL/body fragments; xss logs include script patterns; data-exfil logs show large transfer markers; privilege-escalation logs mimic sudo/su abuse. Because the campaign data lineage flag propagates to alert objects, downstream exports and modal inspection remain honest about data provenance; a compliance officer can filter JSON exports by that flag and exclude exercise data from regulatory counts. The eight-second `campaignRunning` window prevents queue stampede if students double-click during lab. Header **ENGINE: SIMULATING** gives instructors a visible state when projecting in lecture halls. Keyboard shortcut S mirrors the button for power users documenting shortcuts in `docs/10-appendix/05-keyboard-shortcuts.md`. After campaign completes, **RULE ACTIVITY** bars jump; useful for proving detection engine reactivity without touching production forwarders. Stakeholder demos should narrate the staged timeline aloud while watching the feed: "Wave one is credential guessing, wave two is web exploitation, wave three repeats brute force to show persistence, wave four is exfiltration, wave five is privilege abuse." That story aligns with Overview **TOP ATTACKERS** concentration and later Attack Timeline visualization when the class pivots modules. If **DEDUPE: ON**, point out that alert count may be lower than log volume; pair with Live Feed to show raw repetition. For developers maintaining HABIBI-SIEM, campaign steps are the fastest regression test after editing detection rules catalog. Run simulate, expect critical/high mix, verify `AlertDetailModal` MITRE lines render, confirm SQLite persistence after reload. If campaign produces zero alerts, check admin paused rules (**RULES: PAUSE ALL** state) before debugging parser code.
