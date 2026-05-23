---
module: IOC Watchlist
sidebar: Intelligence → IOC Watchlist
section: Intelligence
subsection: How watchlist matching works in real time
last_updated: 2026-05-23
---

# How watchlist matching works in real time

**Part of:** Intelligence → IOC Watchlist
**One-sentence focus:** Organisation-specific indicators matched against incoming alerts in real time.

![IOC Watchlist main view](../../../screenshots/guides/intelligence-ioc-watchlist.png)

### What you are looking at

**ALERTS** column shows em dash or blinking **N HITS**. Matching rows get pink background `rgba(255,45,85,0.04)`. Header badge **N ACTIVE HITS** counts IOCs with ≥1 match.

### What is happening underneath

On each render, `iocMatches` recomputes from current `alerts` array; no separate streaming engine. When new alerts arrive via ingest, matches update automatically on next React cycle. No new alert type IOC Match created; hits are overlay on existing alerts. Intelligence → IOC Watchlist (IOC Watchlist screen) merges immutable `DEFAULT_IOCS` with user `iocWatchlist` from context via `allIocs = [...DEFAULT_IOCS,...iocWatchlist]`. Supported types: ip, domain, hash, url, email. Matching logic in `iocMatches` implements IP (`sourceIp` / `source.ip`), domain (substring over `JSON.stringify(alert)`), and URL (`urlPath` / `url.path`); extend `iocMatches` with hash and email field comparisons to activate hit detection for those types. Header badge **N ACTIVE HITS** counts IOCs with ≥1 match; matching rows gain pink background and blinking **N HITS** in **ALERTS** column.

`iocMatches` recomputes every render from the alerts array; latency equals React refresh, adequate for demo volumes but potentially costly if domain matching stringifies large alert JSON at enterprise EPS. Matches do not spawn new alert types; they overlay correlation on existing detections. False positives arise when domain substring appears innocuously inside unrelated alert fields: always manually validate a hit before executive briefing.

### Why this matters

Real-time matching is the payoff. Without it, watchlist is spreadsheet archive. Latency equals React refresh rate (~instant after ingest).

### Step-by-step walkthrough

1. Note baseline **ACTIVE HITS** zero.
2. Run Simulate Campaign including known default IOC IP 203.0.113.45 if in traffic.
3. Watch **ALERTS** column blink with hit counts.
4. Click **BLOCK** on high-severity IP hit.
5. Verify SOAR log WATCHLIST_ADD reason includes IOC threat text.

### Common questions

#### Does match create a new alert?

No, matching highlights correlation to existing alerts without creating new alert objects. Domain search lowercases both sides for case-insensitive comparison.

#### Partial domain match?

Substring JSON search may false positive on benign strings containing domain text.

### Using this view during live response

Keep watchlist visible on SOC wall: blinking hits trigger verbal "IOC match" callout. Add campaign-specific IOCs during active IR with appropriate TLP; remove user entries post-incident to prevent stale blocks; document adds in Case Manager until `addedAt` and author columns ship in UI. ISAC/STIX/TAXII import is manual today. Treat modal **ADD IOC** as stand-in for feed ingestion automation. Pair watchlist hits with SOAR audit log entries when blocking to answer "why was this indicator actioned?"

Operationalise TLP labels in procedure documents because the UI only colour-codes them. Before clicking **BLOCK** on a blinking hit row, confirm the indicator is still valid, especially for domain matches that use broad JSON substring search. User-added IOCs should include campaign identifiers in Threat Description until audit columns expose `addedAt` and authenticated authors.

### Edge cases and gotchas

Large alert JSON stringify domain match is CPU-heavy at scale; demo sizes fine. Zero hits does not mean clean: IOCs may not be present in the current alert traffic. TLP colouring (**RED**, **AMBER**, **GREEN**, **WHITE**) communicates sharing constraints. Software does not enforce policy, humans do. **BLOCK** on IP rows calls `blockIp(ioc.value, \`IOC block: ${ioc.threat}\`)`, same watchlist mechanism as SOAR. Non-IP IOCs have no block button, domains require DNS/firewall action outside this UI. User-added IOCs get **Remove** via `removeIoc`; defaults cannot be deleted; plan production deployments that replace demo defaults with live feeds.
