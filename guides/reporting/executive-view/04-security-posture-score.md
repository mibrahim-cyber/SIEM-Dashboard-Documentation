---
module: Executive View
sidebar: Reporting → Executive View
section: Reporting
subsection: Security posture score
last_updated: 2026-05-23
---

# Security posture score

**Part of:** Reporting → Executive View
**One-sentence focus:** How the RISK POSTURE dial is computed from unresolved severities and active incidents, and how it differs from Reports risk tiers.

### What you are looking at

The **RISK POSTURE** card is the only numeric gauge on Executive View that summarises *open* operational risk rather than *historical* volume. It shows an integer from 0 to **100**, colour-banded green (**LOW**, under 20), yellow (**GUARDED**, 20–39), orange (**ELEVATED**, 40–69), or red (**CRITICAL**, 70+), with a matching translucent border. Unlike the KPI row, which counts everything that fired in twenty-four hours, this dial answers "how much severe work is still unfinished right now?" A board member can watch the number move after the SOC resolves alerts without waiting for daily rollups to catch up. The same value appears in the global header and on Intelligence → Risk Scoring, which renders a circular dial and contributor breakdown. Reporting → Reports uses a *different* construct (**OVERALL RISK** as a word label from critical/high counts). When briefing executives, always say "posture score" for this dial and "report risk tier" for Reports to avoid comparing incompatible scales.

### What is happening underneath

`riskScore` is computed once in the SIEM context pipeline and consumed read-only by the Executive View screen:

```javascript
const critW = alerts.filter((a) => a.severity === 'critical' && a.status !== 'resolved').length * 8;
const highW = alerts.filter((a) => a.severity === 'high' && a.status !== 'resolved').length * 4;
const incW = incidents.filter((i) => i.status === 'active').length * 12;
return Math.min(100, critW + highW + incW);
```
Weighting rationale: incidents cost twelve points because `correlateAlerts()` already merged multiple alerts; executives should not need mental math to prefer incident closure over alert whack-a-mole. Criticals cost eight and highs four so two highs equal one critical in urgency currency. Medium and low severities contribute zero to posture even if thousands exist: programme managers tuning noise should watch **THREAT CLASSIFICATION**, not this dial.

### Why this matters

Posture is the executive contract metric: one number, one formula, reproducible in spreadsheets. Legal and risk committees increasingly ask "what is your *current* cyber exposure?", not "how many logs arrived Tuesday." A score tied to *unresolved* severities aligns incentives: closing alerts lowers the dial faster than hiding behind ingestion volume. Separating this metric from Reports's **OVERALL RISK** word tier prevents the common failure mode where leadership hears **CRITICAL** in two modules and assumes contradiction.

### Step-by-step walkthrough

1. Open Intelligence → Risk Scoring and note contributor counts (critical, high, active incidents).
2. Manually compute `8×crit + 4×high + 12×active`; confirm ≤100.
3. Switch to Reporting → Executive View, **RISK POSTURE** must match within one refresh cycle.
4. Resolve one critical in Monitor → Alert Manager; watch score drop by up to eight points.
5. If an incident ages to contained without human status change, confirm twelve points removed when `lastSeen` exceeds correlation window.
6. Document starting and ending scores in Case Manager for regulatory timelines.
7. If score stays **CRITICAL** after apparent cleanup, search for forgotten new/acknowledged criticals filtered out of your personal queue.

### Common questions

#### Why do incidents count more than critical alerts?

Each active incident represents a correlated cluster; multiple alerts, one attacker narrative: so the formula assigns twelve points versus eight for a single critical alert. That weighting makes **RISK POSTURE** rise quickly when Respond → Incidents shows ongoing campaigns, nudging executives toward response resources rather than detection-only investments.

#### Can the score be high if **ALERTS (24H)** delta is down?

Yes. The dial uses unresolved severities and active incidents, not twenty-four-hour volume. Yesterday's spike fully resolved could show falling ALERTS (24H) delta while leftover open criticals keep posture **ELEVATED**. Always pair the dial with open alert counts, not only daily delta.

#### Does blocking IPs lower **RISK POSTURE** directly?

Not in the formula. Blocks affect BLOCKED IPs, **AUTO-BLOCKS**, and the **PROTECT** NIST bar (`blockedIps.size * 3`), but `riskScore` ignores `blockedIps`. Mitigation lowers posture indirectly when analysts resolve alerts and incidents after blocking.

#### Is **LOW** label the same as "zero risk"?

No. It means the composite sits below twenty. Demo environments with no alerts often show **LOW** with score zero, which means "no open weighted items," not "certified secure." Executives should treat **LOW** as "nothing on fire right now," subject to visibility gaps in logging and detection coverage.

### Edge cases and gotchas

Scores hit **`Math.min(100, …)`** quickly in Simulate Campaign scenarios with many criticals, expect **CRITICAL** label often during demos. Medium and low severities do not enter the formula at all; posture can ignore a flood of medium noise unless it correlates into incidents via IP windowing. Two incidents from two IPs double the incident term even if one attacker: correlation is IP-time based, not campaign based. **RISK POSTURE** label in executive view omits " RISK" suffix used on Risk Scoring page (**LOW RISK** there vs **LOW** here). Minor copy inconsistency when comparing screenshots.

> **Technical note:** Threshold colours and labels duplicate logic in global header, Risk Scoring screen, and Executive View screen; changing bands requires updating all three places or centralising the mapping in one shared helper.

### Worked examples (verify in risk scoring):

| Open criticals | Open highs | Active incidents | Raw sum | Label |
|---:|---:|---:|---:|---|
| 0 | 0 | 0 | 0 | **LOW** |
| 2 | 1 | 1 | 16+4+12 = 32 | **GUARDED** |
| 4 | 0 | 2 | 32+24 = 56 | **ELEVATED** |
| 8 | 2 | 1 | 64+8+12 = 84 | **CRITICAL** (capped 100 if more) |

Status sensitivity: `acknowledged` criticals still count, only `resolved` drops weight. Watchlisted or blocked alerts keep severity until resolved. Contained incidents (engine quiet >60s) remove the twelve-point term even if analysts never clicked **CONTAINED** in Respond → Incidents. Downstream coupling: `nistScores` sets `baseScore = Math.max(20, 100 - riskScore)` so framework bars move inversely; presenters explaining a dropping dial should anticipate **IDENTIFY**/**RESPOND** bars rising in the same refresh.

### How an analyst uses**RISK POSTURE**During an active incident

When paging leadership during a major attack, the analyst states the current **RISK POSTURE** number and label from Executive View, then decomposes it: "Score sixty-two **ELEVATED**: four unresolved criticals (thirty-two points), two highs (eight points), two active incidents (twenty-four points)." As they contain hosts and resolve alerts, they refresh and report delta: "down to forty-four **ELEVATED** after resolving two criticals." They avoid quoting **MTTR** or FALSE POS % in the same breath because those are simulated here. They screenshot the dial with timestamp for the incident record or Case Manager notes. Run monthly calibration workshops: given a scripted alert set, analysts hand-calculate posture and compare to the dial. Builds trust in automation. When negotiating MSSP contracts, cite posture formula explicitly so SLAs reference resolvable severities, not ticket volume. After major false-positive purges, expect posture drops without implying attack cessation, communicate "backlog hygiene" to executives. Integrate posture into OKRs cautiously: gamification can incentivise premature resolved clicks; pair with quality sampling in Alert Manager.
