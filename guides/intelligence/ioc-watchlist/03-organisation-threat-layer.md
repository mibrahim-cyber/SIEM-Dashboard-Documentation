---
module: IOC Watchlist
sidebar: Intelligence → IOC Watchlist
section: Intelligence
subsection: The watchlist as organisation threat intelligence
last_updated: 2026-05-23
---

# The watchlist as organisation threat intelligence

**Part of:** Intelligence → IOC Watchlist
**One-sentence focus:** Organisation-specific indicators matched against incoming alerts in real time.

![IOC Watchlist main view](../../../screenshots/guides/intelligence-ioc-watchlist.png)

### What you are looking at

Default IOCs cite sources AbuseIPDB, TorProject, **CISA**, VirusTotal, Mandiant, URLScan, PhishTank, Shodan; illustrative vendor names. User additions default source: Manual in modal. TLP colours: **RED** `#ff2d55`, **AMBER** `#ff9500`, **GREEN** `#30d158`, **WHITE** `#c9d8e8`.

### What is happening underneath

Organisation layer = `iocWatchlist` state + `addIoc`/`removeIoc`. Not persisted to API in snippet; may reset on refresh unless backend added. Builds on global feeds conceptually by letting analysts insert campaign-specific indicators during active IR. Intelligence → IOC Watchlist (IOC Watchlist screen) merges immutable `DEFAULT_IOCS` with user `iocWatchlist` from context via `allIocs = [...DEFAULT_IOCS,...iocWatchlist]`. Supported types: ip, domain, hash, url, email, but matching logic in `iocMatches` fully implements IP (`sourceIp` / `source.ip`), domain (substring over `JSON.stringify(alert)`), and URL (`urlPath` / `url.path`); hash and email types display without reliable hit detection until extended. Header badge **N ACTIVE HITS** counts IOCs with ≥1 match; matching rows gain pink background and blinking **N HITS** in **ALERTS** column.

`iocMatches` recomputes every render from the alerts array; latency equals React refresh, adequate for demo volumes but potentially costly if domain matching stringifies large alert JSON at enterprise EPS. Matches do not spawn new alert types; they overlay correlation on existing detections. False positives arise when domain substring appears innocuously inside unrelated alert fields: always manually validate a hit before executive briefing.

### Why this matters

ISAC shares often arrive as CSV of IOCs. This UI is the ingestion point for that knowledge into detection/response workflow.

### Step-by-step walkthrough

1. Receive ISAC STIX/CSV, manually add critical IPs via modal.
2. Set **TLP:RED** if sharing restricted.
3. Set confidence per source reliability.
4. Monitor **ALERTS** column for hits after ingestion.
5. Remove via **Remove** when campaign ends (user IOCs only).

### Common questions

Not automated; manual entry or future feature.

#### Difference from SOAR watchlist?

SOAR `blockedIps` is enforcement-oriented; IOC list is intelligence-oriented with richer metadata: can block from IOC row for IPs.

#### Mandiant entry meaning?

Demo label for APT28 IP. teaches nation-state intel integration concept.

#### Manual source trust?

Analyst judgment, document in **THREAT** field.

### Analyst workflow under pressure

Threat intel team pushes new C2 IP; analyst adds with **TLP:RED**; SOC watches **HITS** column spike. Add campaign-specific IOCs during active IR with appropriate TLP; remove user entries post-incident to prevent stale blocks; document adds in Case Manager until `addedAt` and author columns ship in UI. ISAC/STIX/TAXII import is manual today; treat modal **ADD IOC** as stand-in for feed ingestion automation. Pair watchlist hits with SOAR audit log entries when blocking to answer "why was this indicator actioned?"

Operationalise TLP labels in procedure documents because the UI only colour-codes them. Before clicking **BLOCK** on a blinking hit row, confirm the indicator is still valid: especially for domain matches that use broad JSON substring search. User-added IOCs should include campaign identifiers in Threat Description until audit columns expose `addedAt` and authenticated authors.

### Edge cases and gotchas

Cannot delete default IOCs. Only user-added show **Remove**. TLP misuse (RED treated as shareable) is policy violation, not software-enforced. TLP colouring (**RED**, **AMBER**, **GREEN**, **WHITE**) communicates sharing constraints; software does not enforce policy, humans do. **BLOCK** on IP rows calls `blockIp(ioc.value, \`IOC block: ${ioc.threat}\`)`, same watchlist mechanism as SOAR. Non-IP IOCs have no block button: domains require DNS/firewall action outside this UI. User-added IOCs get **Remove** via `removeIoc`; defaults cannot be deleted. Plan production deployments that replace demo defaults with live feeds.
