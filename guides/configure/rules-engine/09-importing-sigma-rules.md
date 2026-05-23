---
module: Rules Engine
sidebar: Configure → Rules Engine
page: 09-importing-sigma-rules.md
title: "Importing community SIGMA rules"
last_updated: 2026-05-23
---

# Importing community SIGMA rules

**Sidebar path:** Configure → Rules Engine

## Importing SIGMA/community rules

### What you are looking at

Rules Engine provides no Import SIGMA, Upload YAML, or community marketplace button. All twelve rules are hand-authored JavaScript objects in the detection rules catalog, some with descriptions echoing Sigma-style intent (field checks, thresholds) but not Sigma file format. External Sigma rules must be manually translated to detection logic functions or future import tooling. Importing Sigma rules is translating recipes from French culinary textbooks into your kitchen's metric cups, the dish concept transfers, but automated conversion needs a cookbook adapter not shipped with HABIBI-SIEM.

### What is happening underneath

```yaml
logsource: product, category
detection: selection filters with modifiers
condition: selection
level: high
tags: attack.tXXXX
```
HABIBI detection logic uses imperative JavaScript on normalised log objects from ingestion pipeline, field names like `sourceIp`, `eventType`, nested `event.outcome`, `http.request.body`. Mapping Sigma `Image|endswith` to log schema requires a field mapping layer that translates Sigma field names to HABIBI's normalised schema. `Correlation Builder` condition fields (`source.ip`, `event.outcome`, etc.) gesture toward ECS-like mapping but do not import Sigma either.

> **Technical note:** Community Sigma repository rules number thousands, automated import requires a Sigma compiler (e.g., sigmac) targeting HABIBI's log schema, which can be built as an integrator extension.

### Why this matters

Teams adopting SIEM expect Sigma network velocity; reuse community detections instead of reinventing SQLi regex. Documenting import gap sets realistic onboarding: start with shipped rules, translate high-value Sigma manually, plan integrator work for production.

### Step-by-step walkthrough

1. Select Sigma rule from public repository matching your log source (e.g., Windows process creation).
2. Compare Sigma field names to HABIBI ingested log JSON in Alert Detail raw view.
3. Create new object in the detection rules catalog: map Sigma condition to JavaScript boolean logic.
4. Translate Sigma `level` to `severity` string enum.
5. Map Sigma tags to `mitre.technique` ID string.
6. Set `category` and `stride` appropriately for Analytics breakdown.
7. Test with representative logs via Log Ingestion.
8. Enable via Rules Engine toggle after validation.

### Common questions

#### Will HABIBI add Sigma import?

Not in the current platform; feature request for integrators. Correlation Builder condition UI could evolve toward Sigma-like authoring without full import.

#### Are shipped rules sigma-derived?

Conceptually aligned (SQLi, brute force) but implemented as custom JS checks, not imported YAML.

#### Can I paste Sigma YAML into correlation builder?

No paste/import, manually recreate conditions using dropdown fields approximating detection logic.

#### What log schema should I target for Sigma mapping?

HABIBI uses hybrid flat (`sourceIp`) and nested ECS-like (`event.outcome`, `http.response.status_code`) fields; align Sigma translations to both patterns in detection logic.

### How an analyst uses this during active incident

Analysts rarely import mid-incident; they reference Sigma rule names from threat intel reports and check if existing HABIBI rules cover TTP. If gap confirmed, they flag tier3 to translate Sigma after incident. They do not expect UI import wizard.

### Edge cases and gotchas

Direct Sigma field names may not exist on demo logs; import fails silently in testing. Regex differences between Sigma modifiers and JS regex cause false negatives. Community rules may be low quality, peer review mandatory. Builder local rules ≠ Sigma translation target for engine. Licensing of community rules varies; legal review external.
Sigma translation worksheet columns: Sigma title, Sigma id, Sigma level, target HABIBI field, check logic summary, test log filename, MITRE mapping verified. Common field mappings: Sigma CommandLine to process args JSON; DestinationIp to destination.ip; User to username. Modifier contains-all expands to chained includes checks. Community rule quality review before import: check status stable vs experimental, references URLs valid, logsource matches your ingestion product. Avoid importing rules requiring Windows Security Event 4688 if your pipeline ingests only HTTP logs. Start with Sigma critical subset for high ROI manual translations. HABIBI ships twelve rules approximating popular Sigma themes already for lab baseline comparison.
Sigma pipeline maturity model stage one: manual translation to HABIBI check() as documented here. Stage two: build sigmac backend target emitting HABIBI JSON rule schema. Stage three: CI job importing Sigma repo subset nightly with automated regression tests against fixture logs. Stage four: operator UI import wizard, the target state for full automation. Set stakeholder expectations at stage one for initial deployments. Maintain translation spreadsheet as interim CMDB for community rule adoption tracking who imported what and test evidence filename.
Maintain allowlist of approved Sigma contributors or repos, supply-chain risk for malicious detection logic in community YAML equals malicious third-party dependency. Peer review translated detection logic like any production rule change; regex from untrusted Sigma can be ReDoS vector.
Sigma import maturity workshop agenda: hour one map log schema fields; hour two translate one Sigma rule manually; hour three debate false positive on lab traffic; hour four document gap list for automated compiler. Provide students Sigma rule JSON and ingested log JSON side by side on screen; highlight field name mismatches visually. Discuss licensed versus open Sigma rules; corporate legal review before production enable. Community rule fork hygiene: pin Sigma commit hash when translating; upstream rule changes may fix CVE detection or introduce logic bug, subscribe to Sigma GitHub releases. Maintain internal rule catalogue spreadsheet columns: Sigma id, HABIBI rule id, translation date, translator name, test alert id proof, production enabled date, disable date if retired. Prevents orphan translations nobody remembers authorising. High-value first imports for HTTP-heavy labs: web server Sigma rules mapping to url.path and http response codes before endpoint rules requiring Sysmon; matches HABIBI mock log generator strengths. Defer Active Directory Sigma until AD ingestion is configured; avoids zero-hit imports discouraging teams. Celebrate first successful manual translation with Analytics category bar movement; visible morale win linking engineering work to SOC metrics leadership sees.
