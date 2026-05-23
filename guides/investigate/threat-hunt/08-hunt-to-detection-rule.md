---
module: Threat Hunt
sidebar: Investigate → Threat Hunt
section: Investigate
subsection: Converting hunt findings into detection rules
last_updated: 2026-05-23
---

# Converting hunt findings into detection rules

**Sidebar path:** Investigate → Threat Hunt

![Threat Hunt main view](../../../screenshots/guides/investigate-threat-hunt.png)

### What you are looking at

When **ALERT DETAIL** shows empty **MATCHED RULES** for a suspicious hunt result, that alert either came from a rule not surfaced in the detail view or represents a gap in detection coverage. The path to formalise findings is Configure → Rules Engine (Rules Engine screen), not within Threat Hunt itself.

### What is happening underneath

Threat Hunt reads alerts already created by the rules engine, it does not create alerts. Conversion workflow: hunt finds pattern → analyst extracts distinguishing fields (`eventType`, `port`, `url` patterns) → rules engineer creates rule in Rules Manager with matching conditions, severity, MITRE tag → future matches auto-alert. The Simulate Campaign function tests end-to-end by injecting events that trigger rules. Correlation sequences belong in Configure → Correlation Builder.

> **Technical note:** Alert objects include `matchedRules: [{ ruleId, ruleName }]` when the detection engine recorded the match. Hunt queries operate on output alerts, not raw logs, new rules need parser field alignment.

### Why this matters

One-time hunts do not scale. Every successful hunt should ask: "Should this become permanent detection?" Without conversion, the same manual hunt repeats weekly. Mature SOCs track hunt-to-rule conversion rate as a programme maturity metric.

### Step-by-step walkthrough

1. Run hunt; identify suspicious alert with no **MATCHED RULES** or weak severity.
2. Note distinguishing fields from **ALERT DETAIL**: eventType, port, url, sourceIp pattern.
3. Navigate to Configure → Rules Engine.
4. Create rule: name, condition matching hunt query logic, appropriate severity, MITRE technique.
5. Return to Monitor → Overview; run Simulate Campaign or ingest test logs.
6. Verify new alerts appear in Threat Hunt when querying for the pattern.
7. Document rule ID in case notes linking back to originating hunt.

### Common questions

#### Can I create a rule directly from threat hunt?

No button exists. Manual conversion via Rules Engine is required, intentional separation of hunting (explore) vs detection engineering (productionise).

#### What if my hunt finds something already detected?

**MATCHED RULES** shows existing coverage. Tune severity or escalation in Rules Engine rather than duplicating rules.

#### Should every hunt become a rule?

No. Noisy patterns cause alert fatigue. Rules need sustainable true-positive rates. Hunt first, rule only after validation and tuning.

#### What's the difference between rules engine and correlation builder?

Rules Engine: single-event conditions. Correlation Builder: multi-event sequences over time windows. Hunt finding "port scan then auth failure" needs correlation, not a simple rule.

### Operational use during containment

Post-incident, the analyst replays successful hunt queries in Rules Engine to prevent recurrence. During incident, they note gaps: "hunt found C2 pattern but no rule fired"; immediate escalation to detection engineering with field values from **ALERT DETAIL**.

### Edge cases and gotchas

Simulated data may not cover all field combinations; test rules carefully. Duplicating hunt logic as a rule with same thresholds may recreate false positives that made the hunt noisy. Rules changes require admin role in production deployments.

### From hunt row to rules engine field mapping

When **ALERT DETAIL** shows suspicious rows without **MATCHED RULES**, extract distinguishing fields: if `eventType` and `port` combination is unique in hunt results, propose rule conditions mirroring your hunt query exactly. Set severity at or above highest hunt result severity. Add MITRE technique tag matching your hunt hypothesis. Test with Simulate Campaign or targeted log ingest; return to Threat Hunt with same query; new alerts should appear with **MATCHED RULES** populated showing your new rule name. If hunt finds suspicious rows that already have matched rules but low severity, tune existing rule severity rather than creating duplicates. Correlation sequences (auth-failure followed by admin login within 10 minutes) require Configure → Correlation Builder, not a single Threat Hunt query, hunts discover the pattern; correlation automates cross-event detection. Document the handoff from hunt findings to correlation design in detection engineering tickets.

### Communicating hunt to detection rule to leadership and engineering

For board conversations, frame Investigate → Threat Hunt numbers as risk to revenue and reputation. For engineering reviews, reference the component file and `the SIEM context pipeline` fields listed in the walkthrough. Keep artefacts: PNG exports beat memory.

### Who should read which sections

Use the walkthrough if you run the SOC; use the source tree if you ship the code. Both paths describe the same Investigate → Threat Hunt behaviour at different altitudes.

### Programme metrics for detection engineering

Track hunt-to-rule conversion as a quarterly KPI: hunts that repeatedly return concrete rows without matching rules deserve engineering tickets. Conversely, hunts that only duplicate `MATCHED RULES` output signal tuning opportunities in Configure → Rules Engine rather than new rule sprawl, severity and escalation paths often matter more than additional signatures.
