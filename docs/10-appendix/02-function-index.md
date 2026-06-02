﻿# Capability index

What the platform does, organised by capability rather than by internal identifiers. See [System overview](../02-architecture/00-system-overview.md).

## Authentication and access

| Capability | Behaviour |
|------------|-----------|
| Login | Session cookie + CSRF token issued on successful password verification |
| RBAC enforcement | Every mutating API call checks role permissions server-side |
| Role tiers | tier1 (read/export), tier2 (+write), tier3/manager (+admin), auditor (read/export) |

## Log ingestion

| Capability | Behaviour |
|------------|-----------|
| Format detection | Auto-detect Apache, syslog, CEF, JSON, CSV, Windows event formats |
| Validate batch | POST `/api/ingest/validate` strips poisoned fields, caps batch size |
| Geo enrich | Batch IP lookup attaches city/country/coordinates |
| Parse preview | Up to 200-row preview; full count in **EVENTS PARSED** stat |
| Ingest | Validated events enter detection pipeline and Live Feed buffer |

## Detection and correlation

| Capability | Behaviour |
|------------|-----------|
| Rule evaluation | Ten built-in rules with sliding windows and sequence logic |
| Alert creation | New alerts persisted via POST `/api/alerts/batch` |
| Deduplication | 30-second window suppresses duplicate IP+rule alerts |
| Incident clustering | Correlation engine groups alerts by source IP within time window |
| Severity scoring | Composite risk posture from open critical/high alerts and active incidents |

## Threat intelligence

| Capability | Behaviour |
|------------|-----------|
| AbuseIPDB lookup | Server-side proxy; GET `/api/threat/ip/:ip` |
| VirusTotal lookup | Server-side test and runtime queries |
| Auto-watchlist | Scores above threshold trigger watchlist add via SOAR pipeline |
| IOC matching | Watchlist entries matched against incoming log source IPs |

## Response and automation

| Capability | Behaviour |
|------------|-----------|
| SOAR enrichment | Automatic IP lookup on high/critical external alerts |
| Watchlist containment | Block-IP action adds to organisation watchlist (demo: not firewall enforced) |
| Playbooks | Structured SOP steps linked to detection categories |
| Audit trail | SOAR actions logged with operator, timestamp, enforcement mode |
| Case management | Formal cases with evidence chain and status workflow |

## Reporting and analytics

| Capability | Behaviour |
|------------|-----------|
| Compliance mapping | NIST, ISO, SOC2, MITRE framework scores from live alert state |
| Executive KPIs | 24h alert delta, risk posture, NIST pillar scores |
| Scheduled reports | Cadence, format, recipient contract (demo: simulated delivery) |
| Analytics charts | Alert volume, top lists, MTTD/MTTR estimates |
| Export | CSV alerts, plain-text report, timeline JSON |

## Administration

| Capability | Behaviour |
|------------|-----------|
| Threat API keys | Admin-only masked fields with test connection |
| Audit log | Admin-only view and export of security-relevant actions |
| Clear alerts | Admin-only bulk reset |
| Backup/restore | SQLite database file copy for configuration and alert persistence |

For API paths and request shapes, see [API endpoint reference](03-api-endpoint-reference.md). For screen-by-screen walkthroughs, see [Module map](01-file-tree-complete.md).
