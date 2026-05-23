---
module: IOC Watchlist
sidebar: Intelligence → IOC Watchlist
section: Intelligence
subsection: Sharing watchlists
last_updated: 2026-05-23
---

# Sharing watchlists

**Part of:** Intelligence → IOC Watchlist
**One-sentence focus:** Organisation-specific indicators matched against incoming alerts in real time.

![IOC Watchlist main view](../../../screenshots/guides/intelligence-ioc-watchlist.png)

### What you are looking at

No import/export buttons. TLP labels hint sharing constraints (**RED** = named recipients only). Manual entry simulates what ISAC portal download would require.

### What is happening underneath

STIX/TAXII would push indicators into this list via API; architecture hook is `addIoc`. Local watchlist complements global feeds in Threat Intel/SOAR; not replaces. Intelligence → IOC Watchlist (IOC Watchlist screen) merges immutable `DEFAULT_IOCS` with user `iocWatchlist` from context via `allIocs = [...DEFAULT_IOCS,...iocWatchlist]`. Supported types: ip, domain, hash, url, email, but matching logic in `iocMatches` fully implements IP (`sourceIp` / `source.ip`), domain (substring over `JSON.stringify(alert)`), and URL (`urlPath` / `url.path`); hash and email types display without reliable hit detection until extended. Header badge **N ACTIVE HITS** counts IOCs with ≥1 match; matching rows gain pink background and blinking **N HITS** in **ALERTS** column.

`iocMatches` recomputes every render from the alerts array; latency equals React refresh, adequate for demo volumes but potentially costly if domain matching stringifies large alert JSON at enterprise EPS. Matches do not spawn new alert types; they overlay correlation on existing detections. False positives arise when domain substring appears innocuously inside unrelated alert fields: always manually validate a hit before executive briefing.

### Why this matters

Sector ISACs (finance, healthcare) distribute IOCs daily. SOC must operationalise feeds within minutes.

### Step-by-step walkthrough

1. Receive ISAC email with TLP:AMBER IOCs.
2. Add each with matching TLP and source note in threat field ("ISAC-2026-041").
3. Respect sharing, do not export RED indicators externally.
4. Compare hits with ISAC narrative.

### Common questions

Not in demo; enterprise integration path.

#### Export our IOCs to partners?

Manual copy from table: no STIX export.

#### Difference from commercial feed?

Local = yours; commercial = vendor global list.

### What analysts do when the pager fires

ISAC flash IOC added within 5 minutes of email. Before vendor feed updates. Add campaign-specific IOCs during active IR with appropriate TLP; remove user entries post-incident to prevent stale blocks; document adds in Case Manager until `addedAt` and author columns ship in UI. ISAC/STIX/TAXII import is manual today, treat modal **ADD IOC** as stand-in for feed ingestion automation. Pair watchlist hits with SOAR audit log entries when blocking to answer "why was this indicator actioned?"

Operationalise TLP labels in procedure documents because the UI only colour-codes them. Before clicking **BLOCK** on a blinking hit row, confirm the indicator is still valid; especially for domain matches that use broad JSON substring search. User-added IOCs should include campaign identifiers in Threat Description until audit columns expose `addedAt` and authenticated authors.

### Edge cases and gotchas

Mis-set TLP WHITE on secret indicator causes data leak: training issue. JSON domain matching may match unrelated alert fields. Verify hit manually. TLP colouring (**RED**, **AMBER**, **GREEN**, **WHITE**) communicates sharing constraints, software does not enforce policy, humans do. **BLOCK** on IP rows calls `blockIp(ioc.value, \`IOC block: ${ioc.threat}\`)`, same watchlist mechanism as SOAR. Non-IP IOCs have no block button; domains require DNS/firewall action outside this UI. User-added IOCs get **Remove** via `removeIoc`; defaults cannot be deleted: plan production deployments that replace demo defaults with live feeds.
