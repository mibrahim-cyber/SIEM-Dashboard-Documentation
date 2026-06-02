﻿# Mock log generator

`mockLogGenerator.js`: synthetic ECS events for simulate-campaign demos, including malicious variants.

Log ingestion in HABIBI-SIEM accepts many vendor formats. The **mock** path handles Built-in sample bursts for classrooms without external log files.

## Why this format matters

Security teams still receive huge volumes of mock text from legacy systems. Supporting paste-and-parse in the dashboard lets analysts prove detection logic before investing in heavy collectors.

## Normalized output shape

Each parsed line becomes an event with timestamp, source address, action or message, optional HTTP or auth fields, and a format tag. Severity may be inferred from status codes, syslog priority, vendor severity, or Windows level names depending on format.

## Detection interaction

Produces realistic multi-stage campaigns across formats for Overview and detection demos.

Rules such as brute force, SQL injection, and sensitive path access consume these normalized fields. Wrong format selection mislabels fields and rules stay silent even when raw text obviously looks malicious.

## Validation and preview

The Log Ingestion screen shows detected format, row counts, and preview table before commit. Operators should fix detection format before bulk paste when stats show unknown or zero rows.

## Operational notes

Auto-detect examines the first non-empty line; mixed files should be split. Re-ingest after installing geo data to backfill country columns on external IPs. Large pastes may stress browser memory; batch by thousand lines in weak VMs.

## Edge cases

Local RFC1918 addresses skip geo. Malformed JSON lines are skipped with error tallies in pipeline health. CEF without extension keys still parses header severity but may lack IP until extensions include src.

## Related guides

- [Log ingestion index](../../guides/monitor/overview/04-simulate-campaign.md)
- [Ingestion pipeline end to end](../../guides/ingest-config/log-ingestion/02-ingestion-pipeline-end-to-end.md)
- [Parsers overview](01-parsers-overview.md)
- [Troubleshooting empty dashboards](../09-operations/08-troubleshooting.md)
