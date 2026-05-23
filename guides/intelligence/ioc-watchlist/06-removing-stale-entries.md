---
module: IOC Watchlist
sidebar: Intelligence → IOC Watchlist
section: Intelligence
subsection: Removing stale entries
last_updated: 2026-05-23
---

# Removing stale entries

**Part of:** Intelligence → IOC Watchlist
**One-sentence focus:** Organisation-specific indicators matched against incoming alerts in real time.

![IOC Watchlist main view](../../../screenshots/guides/intelligence-ioc-watchlist.png)

### What you are looking at

User-added rows show **Remove** ghost button in **ACTIONS** calling `removeIoc(id)`. Defaults lack remove button. No bulk delete or expiry date column.

### What is happening underneath

`removeIoc` filters context array, if not persisted server-side, refresh may restore unless API wired. Stale IOC causing false hits erodes analyst trust faster than empty list. Intelligence → IOC Watchlist (IOC Watchlist screen) merges immutable `DEFAULT_IOCS` with user `iocWatchlist` from context via `allIocs = [...DEFAULT_IOCS,...iocWatchlist]`. Supported types: ip, domain, hash, url, email, but matching logic in `iocMatches` fully implements IP (`sourceIp` / `source.ip`), domain (substring over `JSON.stringify(alert)`), and URL (`urlPath` / `url.path`); hash and email types display without reliable hit detection until extended. Header badge **N ACTIVE HITS** counts IOCs with ≥1 match; matching rows gain pink background and blinking **N HITS** in **ALERTS** column.

`iocMatches` recomputes every render from the alerts array, latency equals React refresh, adequate for demo volumes but potentially costly if domain matching stringifies large alert JSON at enterprise EPS. Matches do not spawn new alert types; they overlay correlation on existing detections. False positives arise when domain substring appears innocuously inside unrelated alert fields; always manually validate a hit before executive briefing.

### Why this matters

Outdated phishing domains reassigned to legitimate sites block customers: operational harm. TTL discipline is governance, not optional.

### Step-by-step walkthrough

1. Weekly review IOCs with zero hits older than 90 days. Remove if user-added.
2. After false positive block, remove erroneous IOC and unblock IP in SOAR.
3. Document removal in change log externally.
4. Keep defaults for training unless production policy forbids demo IOCs.

### Common questions

#### Who can remove?

Any user who can access UI, no RBAC on removeIoc.

#### Restore deleted IOC?

#### Stale vs malicious?

Analyst decision; check WHOIS/domain age for domains.

### Using this view during live response

Post-incident, remove campaign-specific IOCs added in haste; retain long-lived APT indicators. Add campaign-specific IOCs during active IR with appropriate TLP; remove user entries post-incident to prevent stale blocks; document adds in Case Manager until `addedAt` and author columns ship in UI. ISAC/STIX/TAXII import is manual today: treat modal **ADD IOC** as stand-in for feed ingestion automation. Pair watchlist hits with SOAR audit log entries when blocking to answer "why was this indicator actioned?"

Operationalise TLP labels in procedure documents because the UI only colour-codes them. Before clicking **BLOCK** on a blinking hit row, confirm the indicator is still valid. Especially for domain matches that use broad JSON substring search. User-added IOCs should include campaign identifiers in Threat Description until audit columns expose `addedAt` and authenticated authors.

### Edge cases and gotchas

Removing IOC does not unblock IP, separate SOAR action. Default IOCs always match demo traffic; confusing in production-like demos. TLP colouring (**RED**, **AMBER**, **GREEN**, **WHITE**) communicates sharing constraints: software does not enforce policy, humans do. **BLOCK** on IP rows calls `blockIp(ioc.value, \`IOC block: ${ioc.threat}\`)`, same watchlist mechanism as SOAR. Non-IP IOCs have no block button. Domains require DNS/firewall action outside this UI. User-added IOCs get **Remove** via `removeIoc`; defaults cannot be deleted, plan production deployments that replace demo defaults with live feeds.
