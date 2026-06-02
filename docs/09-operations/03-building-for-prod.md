﻿# Production operations

Guidance for operators running the published HABIBI-SIEM dashboard in production or long-running evaluation environments. This is not a developer build guide; it focuses on how to keep the service safe and observable for analysts.

## Deployment expectations

The dashboard ships as a hosted single-page application backed by an API service and SQLite database. Production or semi-production deployments should use strong unique session secrets rotated on schedule, network access limited to trusted analyst workstations and log forwarders, regular SQLite backups, threat feed API keys stored server-side only, and the optional MaxMind GeoLite2 database for geo enrichment.

Document who may reach the API port directly versus through the reverse proxy. Students should never expose default teaching credentials to the public internet.

## Environment configuration

| Concern | Operator action |
|---------|-----------------|
| Session security | Set a production-grade session secret; never use demo defaults |
| CORS | Restrict allowed origins to your deployment hostname exactly |
| Threat quotas | Set daily lookup limits appropriate for your AbuseIPDB tier |
| Geo enrichment | Install GeoLite2-City and verify Pipeline Health shows geo available |

See [Environment variables](../03-backend/11-env-vars.md) for the configuration reference. After changing variables, restart the API process once and confirm login still works with a test account.

## Capacity and performance

Monitor events per second on **Monitor → Pipeline Health**. Sustained overload may lag the Live Feed buffer or make graphs stutter on low-RAM VMs. Schedule large Simulate Campaign demos outside peak hours if multiple classes share one host.

Read [EPS monitoring](10-eps-monitoring.md) and [Performance notes](09-performance-notes.md) before blaming detection when the browser tab is simply out of memory.

## Hardening alignment

Walk through [Hardening checklist](../08-security/11-hardening-checklist.md) and pentest prep docs before go-live. Confirm tier1 cannot write watchlist or SOAR entries. Confirm mutating API calls without CSRF token return 403 while session cookie is present.

## Backup and restore drills

Quarterly restore a backup copy to a scratch VM and verify alerts and audit tables open. Operators who never practiced restore discover permission problems during real incidents.

## Troubleshooting in production

Login failures, empty feeds, missing geo, and API key errors are covered in [Troubleshooting](08-troubleshooting.md). Keep a runbook snippet for CORS mismatches when analysts bookmark the wrong hostname.

## Related material

- [Rotating secrets](05-rotating-secrets.md)
- [Backup SIEM DB](04-backup-siem-db.md)
- [Threat API keys](07-threat-api-keys.md)
- [Geo DB setup](06-geo-db-setup.md)
- [System overview](../02-architecture/00-system-overview.md)
