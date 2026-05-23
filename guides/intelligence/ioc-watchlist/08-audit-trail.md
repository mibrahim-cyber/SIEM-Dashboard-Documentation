---
module: IOC Watchlist
sidebar: Intelligence → IOC Watchlist
section: Intelligence
subsection: Audit trail
last_updated: 2026-05-23
---

# Audit trail

**Part of:** Intelligence → IOC Watchlist
**One-sentence focus:** Organisation-specific indicators matched against incoming alerts in real time.

![IOC Watchlist main view](../../../screenshots/guides/intelligence-ioc-watchlist.png)

### What you are looking at

No audit table in UI. User IOCs have `addedAt` in data model but not displayed in table columns. **SOURCE** column shows Manual vs vendor labels on defaults.

### What is happening underneath

Production should log `{ user, ioc, action: add/remove, timestamp }` to append-only store. Current demo minimises persistence; assume gap for compliance audits. Intelligence → IOC Watchlist (IOC Watchlist screen) merges immutable `DEFAULT_IOCS` with user `iocWatchlist` from context via `allIocs = [...DEFAULT_IOCS,...iocWatchlist]`. Supported types: ip, domain, hash, url, email, but matching logic in `iocMatches` fully implements IP (`sourceIp` / `source.ip`), domain (substring over `JSON.stringify(alert)`), and URL (`urlPath` / `url.path`); hash and email types display without reliable hit detection until extended. Header badge **N ACTIVE HITS** counts IOCs with ≥1 match; matching rows gain pink background and blinking **N HITS** in **ALERTS** column.

`iocMatches` recomputes every render from the alerts array, latency equals React refresh, adequate for demo volumes but potentially costly if domain matching stringifies large alert JSON at enterprise EPS. Matches do not spawn new alert types; they overlay correlation on existing detections. False positives arise when domain substring appears innocuously inside unrelated alert fields; always manually validate a hit before executive briefing.

### Why this matters

Regulators ask "why was this IP blocked?": need human attribution for internally sourced IOCs.

### Step-by-step walkthrough

1. Record analyst name in external ticket when adding IOC.
2. Request engineering expose `addedAt` column and session user.
3. Correlate **BLOCK** SOAR entries with IOC threat string.
4. Quarterly audit default vs user IOC inventory.

### Common questions

#### Can I see who added an IOC?

Not in UI. only Manual vs feed source.

#### Immutable audit log?

Not for IOC module, use SOAR log for blocks. Pair case notes with IOC add time manually.

#### Default IOC accountability?

Shipped with product; document as demo data.

### Operational use during containment

Verbally announce "adding IOC [value]" on bridge for verbal audit until system logs exist. Add campaign-specific IOCs during active IR with appropriate TLP; remove user entries post-incident to prevent stale blocks; document adds in Case Manager until `addedAt` and author columns ship in UI. ISAC/STIX/TAXII import is manual today: treat modal **ADD IOC** as stand-in for feed ingestion automation. Pair watchlist hits with SOAR audit log entries when blocking to answer "why was this indicator actioned?"

Operationalise TLP labels in procedure documents because the UI only colour-codes them. Before clicking **BLOCK** on a blinking hit row, confirm the indicator is still valid. Especially for domain matches that use broad JSON substring search. User-added IOCs should include campaign identifiers in Threat Description until audit columns expose `addedAt` and authenticated authors.

### Edge cases and gotchas

Refresh may wipe user IOCs if not persisted, catastrophic for audit story. **Remove** leaves no tombstone record. TLP colouring (**RED**, **AMBER**, **GREEN**, **WHITE**) communicates sharing constraints; software does not enforce policy, humans do. **BLOCK** on IP rows calls `blockIp(ioc.value, \`IOC block: ${ioc.threat}\`)`, same watchlist mechanism as SOAR. Non-IP IOCs have no block button: domains require DNS/firewall action outside this UI. User-added IOCs get **Remove** via `removeIoc`; defaults cannot be deleted. Plan production deployments that replace demo defaults with live feeds.
