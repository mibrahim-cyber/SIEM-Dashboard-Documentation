# Module map

What each area of the dashboard does and where to read more. This is a behavioural map — not a directory listing.

## Monitor

| Area | Purpose | Guide |
|------|---------|-------|
| **Overview** | SOC landing view: KPIs, severity distribution, pipeline health, simulate campaign | [Overview guide](../../guides/monitor/overview/01-how-to-use.md) |
| **Alert Manager** | Triage, acknowledge, resolve, and export alerts | [Alert Manager guide](../../guides/monitor/alert-manager/01-how-to-use.md) |
| **Live Feed** | Rolling raw log buffer with stream stats and deduplication | [Live Feed guide](../../guides/monitor/live-feed/01-how-to-use.md) |
| **Timeline** | Attack timeline with window, grouping, and incident bands | [Timeline guide](../../guides/monitor/timeline/01-how-to-use.md) |
| **Pipeline Health** | EPS gauge, log source status, capacity signals | [Pipeline Health guide](../../guides/monitor/pipeline-health/01-how-to-use.md) |

## Investigate

| Area | Purpose | Guide |
|------|---------|-------|
| **Threat Hunt** | Saved hunts, query builder, preset templates | [Threat Hunt guide](../../guides/investigate/threat-hunt/01-how-to-use.md) |
| **Event Graph** | Entity-relationship graph for pivoting | [Event Graph guide](../../guides/investigate/event-graph/01-how-to-use.md) |
| **Network Map** | Host-to-host connection visualisation | [Network Map guide](../../guides/investigate/network-map/01-how-to-use.md) |
| **Geo Map** | Geographic plot of source IPs | [Geo Map guide](../../guides/investigate/geo-map/01-how-to-use.md) |
| **Heatmap Calendar** | Time-based activity density | [Heatmap guide](../../guides/investigate/heatmap-calendar/01-how-to-use.md) |
| **UEBA** | User behaviour baselines and anomaly scores | [UEBA guide](../../guides/investigate/ueba/01-how-to-use.md) |

## Configure

| Area | Purpose | Guide |
|------|---------|-------|
| **Rules Engine** | Built-in detection rules: toggle, anatomy, tuning | [Rules Engine guide](../../guides/configure/rules-engine/01-how-to-use.md) |
| **Correlation Builder** | Multi-event correlation rules and STRIDE matrix | [Correlation Builder guide](../../guides/configure/correlation-builder/01-how-to-use.md) |

## Respond

| Area | Purpose | Guide |
|------|---------|-------|
| **Incidents** | Correlated incident queue and IR playbooks | [Incidents guide](../../guides/respond/incidents/01-how-to-use.md) |
| **Case Manager** | Formal cases, evidence, collaboration | [Case Manager guide](../../guides/respond/case-manager/01-how-to-use.md) |
| **SOAR Console** | Playbooks, IP enrichment, watchlist containment, audit log | [SOAR Console guide](../../guides/respond/soar-console/01-how-to-use.md) |

## Intelligence

| Area | Purpose | Guide |
|------|---------|-------|
| **Threat Intel** | External feed queries and confidence scoring | [Threat Intel guide](../../guides/intelligence/threat-intel/01-how-to-use.md) |
| **IOC Watchlist** | Organisation threat layer and real-time matching | [IOC Watchlist guide](../../guides/intelligence/ioc-watchlist/01-how-to-use.md) |
| **Risk Scoring** | Composite risk posture dial and contributors | [Risk Scoring guide](../../guides/intelligence/risk-scoring/01-how-to-use.md) |
| **Vuln Intel** | CVE records matched to assets | [Vuln Intel guide](../../guides/intelligence/vuln-intel/01-how-to-use.md) |

## Infrastructure

| Area | Purpose | Guide |
|------|---------|-------|
| **Asset Inventory** | Asset registry, lifecycle, compliance posture | [Asset Inventory guide](../../guides/infrastructure/asset-inventory/01-how-to-use.md) |
| **Analytics** | Operational charts, MTTD/MTTR, trend analysis | [Analytics guide](../../guides/infrastructure/analytics/01-how-to-use.md) |

## Reporting

| Area | Purpose | Guide |
|------|---------|-------|
| **Executive View** | Board-ready KPIs, NIST scores, risk posture | [Executive View guide](../../guides/reporting/executive-view/01-how-to-use.md) |
| **Reports** | Compliance mapping, export formats | [Reports guide](../../guides/reporting/reports/01-how-to-use.md) |
| **Scheduler** | Scheduled report cadence and delivery contract | [Scheduler guide](../../guides/reporting/scheduler/01-how-to-use.md) |

## Ingest and config

| Area | Purpose | Guide |
|------|---------|-------|
| **Log Ingestion** | Paste/upload, format detection, preview, ingest | [Log Ingestion guide](../../guides/ingest-config/log-ingestion/01-how-to-use.md) |
| **Settings** | RBAC display, threat API keys, deduplication, backup | [Settings guide](../../guides/ingest-config/settings/01-how-to-use.md) |

## Platform layers

| Layer | Role |
|-------|------|
| **Dashboard shell** | Navigation, global header, risk posture badge, command palette |
| **Authentication layer** | Login, session cookie, CSRF token, role flags |
| **SIEM context pipeline** | Alert state, log processing, deduplication, EPS counters |
| **API server** | Session auth, RBAC enforcement, SQLite persistence, threat/geo proxy |
| **Detection engine** | Rule evaluation on enriched logs |
| **Correlation engine** | Multi-event pattern matching and incident clustering |
| **Log parser layer** | Apache, syslog, CEF, JSON, CSV, Windows normalisation |

See [System overview](../02-architecture/00-system-overview.md) for data flows between layers.
