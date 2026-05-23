#!/usr/bin/env python3
"""Generate INDEX.md for each module folder from SUBTOPIC-MANIFEST.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'scripts' / 'SUBTOPIC-MANIFEST.json').read_text(encoding='utf-8'))

MODULE_META = {
    'monitor/overview': ('Overview', 'Monitor → Overview', 'Your security posture at a glance — alerts, incidents, and controls on one screen.'),
    'monitor/live-feed': ('Live Feed', 'Monitor → Live Feed', 'A continuously updating stream of normalised security events as they arrive.'),
    'monitor/timeline': ('Attack Timeline', 'Monitor → Attack Timeline', 'Visualise attack progression across kill-chain stages over time.'),
    'monitor/alert-manager': ('Alert Manager', 'Monitor → Alert Manager', 'Triage, acknowledge, and resolve alerts with full context.'),
    'monitor/pipeline-health': ('Pipeline Health', 'Monitor → Pipeline Health', 'Monitor whether logs are flowing, parsing, and reaching the detection engine.'),
    'investigate/event-graph': ('Event Graph', 'Investigate → Event Graph', 'Explore relationships between alerts, IPs, rules, and notes on a canvas.'),
    'investigate/threat-hunt': ('Threat Hunt', 'Investigate → Threat Hunt', 'Proactively search logs with queries and saved hunt templates.'),
    'investigate/network-map': ('Network Map', 'Investigate → Network Map', 'See which hosts talk to which others and spot abnormal fan-out.'),
    'investigate/geo-map': ('Geo Map', 'Investigate → Geo Map', 'Plot alert source IPs on a world map with impossible-travel hints.'),
    'investigate/ueba': ('UEBA', 'Investigate → UEBA', 'Score user behaviour anomalies against observed activity patterns.'),
    'investigate/heatmap-calendar': ('Heatmap Calendar', 'Investigate → Heatmap', 'Spot time-based attack patterns on a calendar heatmap.'),
    'respond/incidents': ('Incident Response', 'Respond → Incidents', 'Manage correlated incidents with playbooks and status tracking.'),
    'respond/soar-console': ('SOAR Console', 'Respond → SOAR', 'Review automated orchestration actions and enrichment runs.'),
    'respond/case-manager': ('Case Manager', 'Respond → Cases', 'Long-running investigation containers with evidence and ownership.'),
    'intelligence/threat-intel': ('Threat Intelligence', 'Intelligence → Threat Intel', 'IP reputation and risk scoring from external and internal signals.'),
    'intelligence/ioc-watchlist': ('IOC Watchlist', 'Intelligence → IOC Watchlist', 'Organisation-specific indicators to match against incoming events.'),
    'intelligence/vuln-intel': ('Vulnerability Intel', 'Intelligence → Vuln Intel', 'CVE data mapped to your asset inventory for prioritisation.'),
    'intelligence/risk-scoring': ('Risk Scoring', 'Intelligence → Risk Scoring', 'Composite risk numbers for assets and the overall environment.'),
    'infrastructure/asset-inventory': ('Asset Inventory', 'Infrastructure → Assets', 'Authoritative list of systems, owners, criticality, and exposure.'),
    'infrastructure/analytics': ('Analytics', 'Infrastructure → Analytics', 'Trend and aggregate views for programme maturity and tuning.'),
    'configure/rules-engine': ('Rules Engine', 'Configure → Rules Engine', 'Enable, tune, and inspect detection rules that fire alerts.'),
    'configure/correlation-builder': ('Correlation Builder', 'Configure → Correlation Builder', 'Design multi-condition correlation rules and test against live alerts.'),
    'reporting/executive-view': ('Executive View', 'Reporting → Executive View', 'Board-ready KPIs and posture summaries.'),
    'reporting/reports': ('Reports', 'Reporting → Reports', 'Generate exportable security and compliance reports.'),
    'reporting/scheduler': ('Scheduler', 'Reporting → Scheduler', 'Automate report generation and delivery on a schedule.'),
    'ingest-config/log-ingestion': ('Log Ingestion', 'Ingest → Log Ingestion', 'Submit, validate, and inspect ingested log batches.'),
    'ingest-config/settings': ('Settings', 'Ingest → Settings', 'Authentication, roles, notifications, and platform configuration.'),
}

for key, essays in manifest.items():
    name, sidebar, purpose = MODULE_META[key]
    group, slug = key.split('/', 1)
    folder = ROOT / 'guides' / group / slug
    folder.mkdir(parents=True, exist_ok=True)
    lines = [
        f'# {name} — Documentation Index',
        '',
        f'**Sidebar path:** {sidebar}',
        '',
        f'**One-sentence purpose:** {purpose}',
        '',
        '---',
        '',
        '## Quick start',
        '',
        f'- [How to use this module](01-how-to-use.md)',
        '',
        '## Deep-dive essays',
        '',
        'Each essay below is a standalone deep dive (800+ words) for one concept within this module.',
        '',
    ]
    for e in essays:
        lines.append(f'- [{e["title"]}]({e["file"]})')
    lines.append('')
    (folder / 'INDEX.md').write_text('\n'.join(lines), encoding='utf-8')
    print('INDEX', key, len(essays))

print('done', sum(len(v) for v in manifest.values()), 'essays indexed')
