---
module: IOC Watchlist
sidebar: Intelligence → IOC Watchlist
section: Intelligence
subsection: Adding an entry
last_updated: 2026-05-23
---

# Adding an entry

**Part of:** Intelligence → IOC Watchlist
**One-sentence focus:** Organisation-specific indicators matched against incoming alerts in real time.

![IOC Watchlist main view](../../../screenshots/guides/intelligence-ioc-watchlist.png)

### What you are looking at

Modal **ADD IOC TO WATCHLIST** fields: Type, TLP Level, Severity, Confidence (0–100 number), Indicator Value, Threat Description. Buttons Cancel / **ADD IOC**. Defaults: type ip, TLP **AMBER**, severity high, confidence **70**, source Manual.

### What is happening underneath

`addIoc(newIoc)` pushes to context array. Confidence renders as progress bar in table; does not auto-raise alert severity in engine when hit detected; visual only unless rules extended. Severity badge uses CSS `badge-${severity}`. Intelligence → IOC Watchlist (IOC Watchlist screen) merges immutable `DEFAULT_IOCS` with user `iocWatchlist` from context via `allIocs = [...DEFAULT_IOCS,...iocWatchlist]`. Supported types: ip, domain, hash, url, email, but matching logic in `iocMatches` fully implements IP (`sourceIp` / `source.ip`), domain (substring over `JSON.stringify(alert)`), and URL (`urlPath` / `url.path`); hash and email types display without reliable hit detection until extended. Header badge **N ACTIVE HITS** counts IOCs with ≥1 match; matching rows gain pink background and blinking **N HITS** in **ALERTS** column.

`iocMatches` recomputes every render from the alerts array, latency equals React refresh, adequate for demo volumes but potentially costly if domain matching stringifies large alert JSON at enterprise EPS. Matches do not spawn new alert types; they overlay correlation on existing detections. False positives arise when domain substring appears innocuously inside unrelated alert fields; always manually validate a hit before executive briefing.

### Why this matters

Without confidence and TLP, watchlists become flat lists: analysts cannot prioritise 200 entries.

### Step-by-step walkthrough

1. Click **+ ADD IOC**.
2. Select Type (e.g., domain).
3. Paste indicator in Indicator Value.
4. Describe Threat Description ("Credential phishing clone of O365 login").
5. Set **TLP** per sharing rules.
6. Set Confidence 85 if multi-source confirmed.
7. **ADD IOC**. row appears at bottom (after defaults in merge order).

### Common questions

#### Does confidence change detection?

Not automatically, display and analyst judgment only in current build.

#### Reason field vs threat description?

Single Threat Description field works as reason.

#### IP score propagation?

Use **BLOCK** to add SOAR watchlist with reason `IOC block: ${threat}`. Value must be non-empty trim.

### Operational use during containment

Add attacker IOCs discovered during forensics immediately; even before official feed updates. Add campaign-specific IOCs during active IR with appropriate TLP; remove user entries post-incident to prevent stale blocks; document adds in Case Manager until `addedAt` and author columns ship in UI. ISAC/STIX/TAXII import is manual today: treat modal **ADD IOC** as stand-in for feed ingestion automation. Pair watchlist hits with SOAR audit log entries when blocking to answer "why was this indicator actioned?"

Operationalise TLP labels in procedure documents because the UI only colour-codes them. Before clicking **BLOCK** on a blinking hit row, confirm the indicator is still valid. Especially for domain matches that use broad JSON substring search. User-added IOCs should include campaign identifiers in Threat Description until audit columns expose `addedAt` and authenticated authors.

### Edge cases and gotchas

Modal does not validate IP/domain format. Duplicate values allowed, confusing table. Source always Manual for user adds; cannot pick Mandiant in modal. TLP colouring (**RED**, **AMBER**, **GREEN**, **WHITE**) communicates sharing constraints: software does not enforce policy, humans do. **BLOCK** on IP rows calls `blockIp(ioc.value, \`IOC block: ${ioc.threat}\`)`, same watchlist mechanism as SOAR. Non-IP IOCs have no block button. Domains require DNS/firewall action outside this UI. User-added IOCs get **Remove** via `removeIoc`; defaults cannot be deleted, plan production deployments that replace demo defaults with live feeds.
