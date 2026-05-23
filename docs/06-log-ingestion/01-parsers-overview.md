# Parsers overview

Ingest is the front door of HABIBI-SIEM. Parsers turn vendor-specific lines into a single normalized event shape the detection engine can evaluate.

## Supported families

Apache and nginx combined access logs, syslog RFC 3164 and 5424, CEF security events, generic and ECS-flavored JSON, Windows Event JSON, and header-driven CSV. Auto-detect picks a parser from the first line when operators leave format on automatic.

## Pipeline order

Paste or upload → format detection → per-line parse → sanitize → validate API → optional geo enrich → detection → alerts persisted → UI refresh across Monitor and Investigate modules.

## Why normalization matters

Rules target fields like source IP, url path, and auth outcome. If syslog is forced through the web parser, IPs land in wrong slots and brute-force rules never increment hits.

## Operator checklist

Use sample cards in Log Ingestion to teach each format. Watch detected format label before submit. Pair with Pipeline Health for error rates. After changing geo setup, re-run external IP samples.

## Related guides

- [Log ingestion index](../../guides/ingest-config/log-ingestion/INDEX.md)
- [Log source types](../../guides/ingest-config/log-ingestion/03-log-source-types.md)
- [Parsing and grok patterns](../../guides/ingest-config/log-ingestion/05-parsing-grok.md)
- [Apache parser](02-apache-parser.md)
- [Troubleshooting](../09-operations/08-troubleshooting.md)

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.
