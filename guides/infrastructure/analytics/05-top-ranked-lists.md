---
module: Analytics
sidebar: Infrastructure → Analytics
page: 05-top-ranked-lists.md
title: "Top attackers, assets, and rules"
last_updated: 2026-05-23
---

# Top attackers, assets, and rules

**Sidebar path:** Infrastructure → Analytics

## Top attackers, assets, rules ranked lists

### What you are looking at

Analytics provides two ranked BarRow lists. TOP ATTACKING IPs shows up to eight source IPs ordered by alert count, green bars normalised to the top IP's count, numeric count right-aligned. **ATTACK CATEGORY BREAKDOWN** lists detection rule categories (e.g., `INJECTION`, `AUTHENTICATION`, `NETWORK`) by frequency of matched rule hits across alerts. Analytics does not include a "top assets" or "top rules by name" panel, those appear partially on Monitor → Overview (**TOP ATTACKERS** up to five IPs, **RULE ACTIVITY** hit bars) and Infrastructure → Asset Inventory (sort by **ALERTS**). Analytics focuses on attacker IP and category dimensions. Ranked lists are like a most-wanted bulletin board: faces (IPs) and crime types (categories) ordered by frequency so patrol units know where to focus tonight. Asset and rule rankings live on adjacent walls in HABIBI, same police station, different pin boards.

### What is happening underneath

```javascript
alerts.forEach((a) => { counts[a.sourceIp] = (counts[a.sourceIp] ?? 0) + 1; });
Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 8);
```
Categories aggregate via nested loop on `alert.matchedRules[].category`. Overview's `topAttackers` extends to ten IPs and includes `blocked` flag. Overview **RULE ACTIVITY** reads `detectionRules[].hits` maintained by `detection engine`. Asset Inventory sorts assets by `alertCount` with IP/hostname correlation including destIp. No single Analytics panel merges all four ranking types, intentional separation of concerns.

> **Technical note:** Internal asset IPs appearing as `sourceIp` in lateral movement alerts would rank in **TOP ATTACKING IPs**; context requires Asset Inventory cross-check, not IP label alone.

### Why this matters

Concentration metrics drive response economics. One IP generating 80% of alerts warrants a block rule; diffuse scanning warrants WAF tuning. Category dominance tells you attack class without reading every signature. Separating attacker rankings from asset rankings prevents conflating "who attacked" with "what was hurt"; both questions matter for different stakeholders.

### Step-by-step walkthrough

1. Populate alerts via simulation; note external attacker IPs in malicious log templates.
2. Open Analytics TOP ATTACKING IPs, record the leader IP and count.
3. Compare count bar widths; second-place should be visually proportionate.
4. Open **ATTACK CATEGORY BREAKDOWN**: identify leading category after simulation (often `authentication` from brute-force batches).
5. Pivot to Overview **TOP ATTACKERS** to confirm overlap, note up to five vs eight limit.
6. Open Overview **RULE ACTIVITY**, map category leader to specific rule names (`brute-force`, `sql-injection`).
7. Open Asset Inventory, sort **ALERTS**; identify top victim assets by correlated alert count (different from attacker IP list).
8. Block top attacker IP in SOAR Console if warranted; recheck rankings after new alerts.

### Common questions

#### Why doesn't analytics show top rules?

Rule hit ranking is operational tuning data on Overview **RULE ACTIVITY** and Configure → Rules Engine hit percentages. Analytics emphasises threat actor and tactic categories for management reporting.

#### Why eight IPs here but five on overview?

Component design choice. Analytics allows slightly deeper attacker list within wider layout. Counts for shared IPs should match between views when both include the IP in their slice limits.

#### Can destIp appear in top attackers?

No; aggregation uses `sourceIp` only. Victim IPs appear in Asset Inventory enrichment, not attacker ranking.

#### How are categories counted when one alert matches multiple rules?

Each matched rule increments its category, one alert can increment multiple categories if rules span categories (uncommon but possible with multi-match alerts).

### How an analyst uses this during active incident

The analyst uses TOP ATTACKING IPs for immediate SOAR block decisions and **ATTACK CATEGORY BREAKDOWN** for runbook selection (injection vs auth). They cross-check Asset Inventory **ALERTS** sort to see victim impact asymmetry; many alerts on one web server, one attacker IP. They cite category breakdown in incident tickets ("campaign classified as injection + authentication"). They monitor whether block actions shrink the top IP bar on subsequent renders.

### Edge cases and gotchas

Ties in counts sort arbitrarily by object insertion order. Missing `sourceIp` groups as `undefined`; rare in demo data. Simulated campaign inflates specific IPs predictably; note **SIM** on Overview. Category list empty if alerts lack `matchedRules` metadata. Blocked status not shown in Analytics bars, check Overview or SOAR. Cross-panel drill workflow: copy top IP from Analytics TOP ATTACKING IPs, paste into Asset Inventory search, if no row, classify as external/unregistered. Copy leading category from **ATTACK CATEGORY BREAKDOWN**, open Configure → Rules Engine, locate rules sharing that category string, compare hit bars. Copy top asset from Inventory sorted by **ALERTS**, verify whether its IP appears as `sourceIp` or `destIp` in alert detail; asymmetry indicates victimisation vs compromise origin. Ranking limitations: Analytics caps attackers at eight; Overview at five; the SIEM context pipeline memo extends to ten for other consumers; always note slice limits when citing top attacker. Category ranking double-counts multi-rule alerts. No built-in top rules in Analytics, Overview **RULE ACTIVITY** truncates rule names to first word only, which can collide when briefing; use full names from Rules Engine instead.
