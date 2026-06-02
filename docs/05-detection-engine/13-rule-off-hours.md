﻿# Rule: Off-hours activity

Bundled detection in HABIBI-SIEM. Severity **medium**, category **host**, MITRE **T1078** (Valid accounts).

## Intent

Successful auth or sensitive actions outside configured business hours window.

## What analysts see

Alerts name this rule in matched rules list with severity badge coloured to medium. Rules Engine card shows hit count and MITRE block for briefing slides.

## Stateful vs stateless behavior

Some rules inspect only the current event; others keep short in-memory windows (for example counting failures per IP). Windowed rules need ordered timestamps in ingested logs.

## Tuning and false positives

Lab traffic intentionally triggers this rule. In shared environments, disable during parser experiments, then re-enable. Pair with deduplication toggle in settings to avoid queue floods from repeated paste.

## Testing procedure

Load format-appropriate sample lines from Log Ingestion, confirm Live Feed shows parsed actions, enable rule toggle, ingest, and verify hit bar increments. Cross-check Alert Manager and Overview rule activity strip.

## Related modules

- [Rules overview](01-rules-overview.md)
- [Rules Engine guide](../../guides/configure/rules-engine/INDEX.md)
- [Logic gates overview](logic-gates/01-gate-overview.md)
- [Alert manager UI](../07-ui-modules/02-alert-manager.md)
