# SIEM industry notes

Short notes on real-world SIEM and SOC tooling. Useful context when reading this documentation.

## The big platforms

**Splunk:** Started in 2003; the name is a play on "spelunking" (exploring caves). Analysts "spelunk" through logs. Splunk's Search Processing Language (SPL) is basically a career skill on its own.

**IBM QRadar:** Grew out of Q1 Labs (New Brunswick, Canada). QRadar is known for tight integration with IBM's broader security stack and for normalizing events into a common record format early in the pipeline.

**Microsoft Sentinel:** Cloud-native SIEM on Azure Log Analytics. No indexer cluster to patch on-prem, but you pay for ingestion volume. KQL (Kusto Query Language) is the query language you'll live in.

**Elastic Security:** Built on Elasticsearch. Many teams already ship app logs to Elastic; adding SIEM features can mean one less vendor if the cluster can handle the load.

**ArcSight / OpenText:** One of the oldest commercial SIEM lines. CEF (Common Event Format) shows up everywhere partly because of this network.

**LogRhythm:** Strong in mid-market deployments; early advocate of combining log management with embedded analytics and workflow.

## SOC culture and metrics

- **MTTD / MTTR:** Mean time to detect / respond. Executives love these; engineers argue about definitions.
- **EPS:** Events per second. Capacity planning for indexers starts here.
- **Alert fatigue:** When everything is critical, nothing is. Good SOCs tune rules constantly.
- **Shift handoff:** Case notes and timeline views exist because the next analyst wasn't awake for your incident.

## Detection and intel

- **MITRE ATT&CK** began as a structured way to describe adversary behaviour; it's now the lingua franca of detection engineering.
- **Sigma rules:** Vendor-neutral detection signatures many teams convert to Splunk, KQL, or Elastic queries.
- **Threat feeds:** IPs and domains age fast; enrichment without context is wallpaper.
- **Correlation:** One failed SSH login is noise; the same IP failing on forty accounts in five minutes is a ticket.

## Why demos matter

Empty SIEM screens teach nothing. Simulated campaigns, sample logs, and replay files exist so you can see correlation fire, maps populate, and executive tiles move without waiting for a real breach.

## How this project compares

The SIEM Dashboard in this repo is a **learning console**: React UI, Express API, SQLite storage, AbuseIPDB and GeoIP hooks, and a handful of STRIDE/MITRE-style rules. It is not a replacement for Splunk or Sentinel at enterprise scale. It is a place to read code, break things safely, and understand how the pieces connect.

## Further reading

- [System overview](../02-architecture/00-system-overview.md)
- [Detection rules overview](../05-detection-engine/01-rules-overview.md)
- [OWASP mapping](../08-security/01-owasp-mapping.md)
