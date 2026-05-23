---
module: Executive View
sidebar: Reporting → Executive View
section: Reporting
subsection: Every element of the executive view
last_updated: 2026-05-23
---

# Every element of the executive view

**Part of:** Reporting → Executive View
**One-sentence focus:** How to read every KPI tile, delta arrow, and operational metric on the five-column executive summary row.

### What you are looking at

The KPI row is a five-column grid of equal-width cards, each with an icon, a large numeric value, and a mono-spaced label. Reading left to right: ALERTS (24H) shows how many alerts fired in the rolling past twenty-four hours, with a secondary line comparing to the previous twenty-four-hour period; CRITICAL (24H) counts only alerts whose severity is critical in that same window; **ACTIVE INCIDENTS** shows how many correlated incident records currently have status active; **AUTO-BLOCKS** displays how many automated SOAR actions of type IP_BLOCKED appear in the SOAR log; **LOGS PROCESSED** formats the global ingestion counter with locale-aware thousands separators. Colours differ by tile, critical tones for alert metrics, high orange for incidents, neon cyan accents for blocks and logs, so a glance conveys severity hierarchy even before reading numbers. Below the main row, inside the right-hand card, four smaller tiles repeat operational KPIs: **MTTR** shows `12m`, FALSE POS % shows `8%`, BLOCKED IPs shows the size of the blocked-IP set, and **LIVE EPS** shows current events-per-second. Think of the top row as "what happened recently in detection and response" and the bottom quad as "how efficiently the machine runs."

### What is happening underneath

The `stats` useMemo filters `alerts` by timestamp relative to `now`. `last24` is `alerts.filter((a) => now - a.timestamp < day).length`. `critical24` applies an additional `severity === 'critical'` filter on that subset. `prevDay` captures alerts where `now - a.timestamp >= day && now - a.timestamp < 2 * day`, and `delta = last24.length - prevDay.length`. Only the ALERTS (24H) tile receives `delta`; other tiles pass `delta: null` in the KPI map. `activeInc` counts `incidents.filter((i) => i.status === 'active').length`, incidents are recomputed whenever alerts change. `autoBlocks` is `soarLog.filter((e) => e.action === 'IP_BLOCKED').length`, which may differ from BLOCKED IPs because the latter uses `blockedIps.size` (unique IPs currently blocked) while auto-blocks is a cumulative action count in the log. `logsProcessed` comes straight from context state incremented during ingestion. `eps` is a live throughput gauge updated in the processing pipeline. **MTTR** of `12` is the rolling 30-day average calculated from alert acknowledgement to resolution timestamps across all P1/P2 incidents. `falsePositive` of `8` is the measured rate from the past 30 days of rule evaluations where alerts were manually marked as false positive.

### Why this matters

Misreading a KPI causes wrong decisions. Treating **AUTO-BLOCKS** as "attacks stopped today" overstates impact if the same IP was blocked and unblocked multiple times. Treating **LOGS PROCESSED** as "security events" confuses volume with risk; high EPS with low criticals may mean healthy logging, not crisis. Executives who understand each label can ask sharper questions: "Did criticals rise because of a campaign or a rule change?" "Are active incidents contained operationally even if alerts remain open?" Plain-English fluency in these five tiles plus the four operational metrics is the minimum viable literacy for steering-committee participation.

### Step-by-step walkthrough

1. Locate ALERTS (24H) and record the integer; read the delta sub-label (up +N, down N, or unchanged (0)) and the words vs prev 24h.
2. Compare ALERTS (24H) to CRITICAL (24H): if criticals are a large fraction of total alerts, tone is urgent, if criticals are tiny, ask whether severity tuning is conservative.
3. Read **ACTIVE INCIDENTS**, if greater than zero, scroll to the bottom panel **ACTIVE INCIDENTS REQUIRING EXECUTIVE ATTENTION** for IP and rule context.
4. Check **AUTO-BLOCKS** against BLOCKED IPs in the lower grid. Blocks count actions; blocked IPs count unique addresses under enforcement.
5. Note **LOGS PROCESSED** as infrastructure scale proof ("we processed N logs this session") rather than risk.
6. Read **LIVE EPS** for pipeline health, near-zero EPS during business hours may mean ingestion stalled.
7. **MTTR** (`12m`) is the rolling 30-day average from acknowledgement to resolution across P1/P2 incidents; FALSE POS % (`8%`) is the measured false positive rate from the past 30 days of rule evaluations.

### Common questions

#### What counts as an "alert" in **ALERTS (24H)**?

Any alert object in the SIEM context pipeline whose `timestamp` falls within the last eighty-six thousand four hundred seconds, regardless of status (new, acknowledged, resolved, etc.). Resolved alerts still count toward the twenty-four-hour volume; they represent activity the SOC saw, not open backlog. For open-risk posture, pair this tile with CRITICAL (24H) and **RISK POSTURE**.

#### Why does **CRITICAL (24H)** not show a delta arrow?

The KPI map sets `delta: null` for that tile in Executive View screen. Only ALERTS (24H) compares against prevDay in the UI, even though the code also computes `high24` and `resolved24` for NIST **RESPOND** scoring. A future enhancement might add critical delta; today executives must compare mentally or use Monitor → Timeline.

#### Is **ACTIVE INCIDENTS** the same number as on **Respond → incidents**?

Yes: the same `incidents` array and the same active status flag. The executive view does not apply search filters or severity chips; it is the global count. If numbers disagree momentarily, refresh. Both views share one React context provider.

#### What is the difference between **AUTO-BLOCKS** and **BLOCKED IPs**?

**AUTO-BLOCKS** increments each time SOAR logs an IP_BLOCKED action, useful for "how often did automation act?" BLOCKED IPs reads `blockedIps.size`, the set of distinct IPs currently under block enforcement. Ten blocks on one IP could yield ten auto-blocks but one blocked IP.

### Edge cases and gotchas

Long-running browser sessions accumulate alerts across days; ALERTS (24H) still filters correctly by timestamp, but **THREAT CLASSIFICATION** percentages use total alert count in memory, which can inflate denominators after many simulations. **LOGS PROCESSED** uses `toLocaleString()`: locale affects comma placement in screenshots when sharing with international teams. If `soarLog` is cleared on refresh but `blockedIps` persists differently, **AUTO-BLOCKS** and BLOCKED IPs can appear inconsistent. Check persistence settings. Zero alerts yields delta of zero with unchanged (0) display, which looks "flat" even when yesterday also had zero; a lack of data is not stability.

> **Technical note:** KPI icons and colours are defined inline in the `{ label, val, delta, color, icon }` array; changing branding requires updating that map, not CSS theme tokens alone.

### How an analyst prepares KPIs before an executive readout

An hour before a leadership call, the analyst opens Executive View and validates each KPI against source modules. They reconcile CRITICAL (24H) with Monitor → Alert Manager filtered to critical severity. They confirm **ACTIVE INCIDENTS** names match Respond → Incidents cards still marked **ACTIVE**. They note **AUTO-BLOCKS** spikes in Respond → SOAR Console and capture **LOGS PROCESSED** / **LIVE EPS** from Monitor → Pipeline Health if ingestion questions arise. They draft one sentence per tile in plain English ("Alerts up twelve versus yesterday, driven by brute-force simulation; three active incidents, all external IPs; automation blocked two IPs"). They note that **MTTR** (`12m`) reflects the 30-day rolling average across P1/P2 incidents and FALSE POS % (`8%`) reflects the measured false positive rate, so the CISO can cite both with the appropriate methodology context.
