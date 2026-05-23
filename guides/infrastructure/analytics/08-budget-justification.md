---
module: Analytics
sidebar: Infrastructure → Analytics
page: 08-budget-justification.md
title: "Using analytics to justify budget"
last_updated: 2026-05-23
---

# Using analytics to justify budget

**Sidebar path:** Infrastructure → Analytics

## Using analytics to justify budget

### What you are looking at

Analytics supplies quantitative visuals for security investment conversations: rising **TOTAL ALERTS** and **CRITICAL THREAT TREND**, concentrated TOP ATTACKING IPs, category mix in **ATTACK CATEGORY BREAKDOWN**, and **ACTIVE INCIDENTS** vs **CONTAINED** demonstrating operational load. The matrix terminal aesthetic (`terminal-panel`, VT323 KPI numbers, green glow) presents credibly in slide screenshots. Pair with Reporting → Executive View risk score and simulated MTTR for a leadership package. Analytics alone lacks cost metrics, FTE hours, or tool licensing data. Budget justification is building a court case: exhibits (charts), witness testimony (analyst narrative), and damages claimed (incident impact). Analytics provides exhibits B and C, volume and attacker concentration, not the full damages calculation.

### What is happening underneath

All Analytics numbers derive from live or simulated detections; budget narratives must contextualise whether spikes are Simulate Campaign artefacts. `getAlertStats()` feeds KPIs; `incidents` from `correlateAlerts` demonstrates automation value (correlation reduces analyst manual clustering). Category breakdown supports "we need WAF investment" (injection leading) or "IAM programme" (authentication leading). No dollar ROI calculator exists; analysts translate counts to hours saved × hourly rate externally. Export path: screenshot Analytics panels, export Overview JSON for raw evidence, generate Reports PDF/text summaries.

> **Technical note:** Tag simulated data in presentations. Overview **SIM** badges do not propagate to Analytics visuals; disclose when demos use **Simulate Campaign**.

### Why this matters

Security budgets compete with revenue projects lacking visible metrics. Without charts, SOCs lose headcount fights to teams showing sales funnels. Analytics democratises SOC visibility, managers see the same green/red trends operators do, grounding "we need two more tier-2 analysts" in **UNRESOLVED** backlog and incident counts rather than anecdotes.

### Step-by-step walkthrough

1. Run realistic ingestion representing a week of traffic (or aggregate exports if available).
2. Capture Analytics KPI row; document **TOTAL ALERTS**, **ACTIVE INCIDENTS**, **UNRESOLVED**.
3. Screenshot **CRITICAL THREAT TREND**: argue detection programme necessity if critical volume non-zero.
4. Screenshot TOP ATTACKING IPs; argue for SOAR automation blocking repeat offenders.
5. Screenshot **ATTACK CATEGORY BREAKDOWN**, tie spend to dominant weakness (e.g., injection → appsec tooling).
6. Count **CORRELATED INCIDENTS** rows; argue correlation engine saves N× manual review minutes per incident.
7. Cross-reference Asset Inventory **AT RISK** crown jewels: argue monitoring investment on criticality-10 assets.
8. Append Executive View MTTR/risk for executive summary; translate analyst hours using internal rate cards.

### Common questions

#### Can I export analytics as PDF?

No native PDF export on Analytics. Use browser print-to-PDF on panels or Reporting → Reports / **GEN REPORT** on Overview for text summaries.

#### Won't high alert counts hurt our budget case by suggesting failure?

Frame as visibility success: "We now detect what was invisible." Pair volume with **CONTAINED** and resolution metrics from Reports. Propose tuning investments to reduce false positives separately from detection investments.

#### How do simulated demos affect budget presentations?

Disclose lab data. Stakeholders fund real programmes; use production exports when available. Simulation proves platform capability, not organisational risk level.

#### Which KPI convinces CFOs fastest?

**ACTIVE INCIDENTS** and **UNRESOLVED** translate to labour demand. TOP ATTACKING IPs translate to breach probability narratives. CFOs rarely parse area charts without analyst narration.

### How an analyst uses this during active incident

During major incidents, the analyst captures Analytics snapshots early and late for after-action reports supporting emergency spend (IR retainer, temporary staff). Live **CRITICAL THREAT TREND** slope justifies war-room activation costs. Post-incident, trend screenshots supplement budget asks for improved detection rules or log source coverage exposed as gaps.

### Edge cases and gotchas

Five-minute charts weak for annual budget cycles, supplement with exported historical data. No FTE utilisation metric in Analytics. Category dominance may reflect rule tuning bias, not true attack mix. **CONTAINED** auto-status ≠ financial containment savings. Executive View simulated MTTR must be replaced before CFO-facing decks.
Quantify analyst labour from Analytics KPIs: if **UNRESOLVED** equals forty and each alert averages six minutes triage, approximate four analyst-hours backlog; multiply by loaded hourly rate for FTE ask. **ACTIVE INCIDENTS** count supports SOAR automation ROI: if three incidents contain twelve alerts each, correlation saved redundant ticket updates; argue incident module reduces manual clustering time. Category breakdown drives control investments with specificity: dominant **INJECTION** bar supports WAF/RASP line item; **AUTHENTICATION** supports MFA pilot; **NETWORK** supports DDoS scrubbing service. Pair screenshots with Asset Inventory CRITICAL CVEs count to argue vulnerability management staffing. Disclose Simulate Campaign origin when charts derive from demo data; credibility requires labelling; production budgets need the same chart templates populated from quarterly exports, not session screenshots alone.
Finance reviewers respond to replacement cost framing: if **ACTIVE INCIDENTS** averages five nightly and each requires thirty minutes senior analyst time, annualise hours and compare to cost of one additional tier-2 FTE plus benefits. Tooling investments use counterfactual: without SOAR blocking shown in TOP ATTACKING IPs concentration, repeat offenders inflate the same bar weekly, argue automation breaks the loop. Always pair cost narrative with risk narrative: **CRITICAL THREAT TREND** red area elevation justifies spend even when total dollars are constrained; defer non-critical projects, not detection.
