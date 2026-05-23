---
module: Executive View
sidebar: Reporting → Executive View
section: Reporting
subsection: Using the executive view in a board meeting
last_updated: 2026-05-23
---

# Using the executive view in a board meeting

**Part of:** Reporting → Executive View
**One-sentence focus:** Running a five-minute board cyber segment anchored on this module without over-reading operational noise.

### What you are looking at

Board cyber segments should follow a fixed five-minute storyboard tied to this module, no improvisational module hopping. Recommended timing: (0:00–0:30) purpose + Confidential framing; (0:30–1:30) **RISK POSTURE** + one-sentence SCQA Answer; (1:30–2:30) KPI row emphasising ALERTS (24H) delta and **ACTIVE INCIDENTS**; (2:30–3:30) weakest NIST bar + dominant severity colour; (3:30–4:30) incident panel or explicit "no board action"; (4:30–5:00) decision vote (Fund/Escalate/Accept/Monitor). Static appendix screenshots (`reporting-executive-view.png`, `reporting-executive-view-detail.png`) go to directors who lack VPN access; live demo is optional for closed session only. RACI for a typical segment: **CISO** presents; SOC manager stands by for Q&A; Legal reviews incident panel wording before meeting; Corp secretary records decision outcome in minutes, not raw alert counts.

### What is happening underneath

The Executive View screen is read-only, board presentation does not mutate SOC state. Live demo requires opening the published dashboard and signing in, and optionally Simulate Campaign beforehand so KPIs are non-zero; otherwise explain empty state honestly. Export paths in HABIBI-SIEM include scheduler preview references to `riskScore`, but Executive View itself has no PDF button, capture via screenshot or browser print. Global header in global header also shows `riskScore`, so presenters may duplicate the number; keep one source on screen to avoid drift during live refresh. Active incident rows expose `sourceIp`, joined `ruleNames`, `alertCount`, and status **ACTIVE**; no PII beyond IPs demo-generated. **`slice(0, 5)`** limits board exposure to five concurrent stories; additional incidents stay in operational modules.

### Why this matters

Boards have finite attention and fiduciary duty: they need accurate, concise risk posture, not SOC theatre. A standard brief reduces prep time for CISOs, aligns legal/comms on what was shown historically, and prevents ad hoc metrics invented in the meeting. Using the same module weekly builds comparability: directors learn that **RISK POSTURE** **ELEVATED** plus rising CRITICAL (24H) means escalation, while **LOW** means monitored calm. The **MTTR** and FALSE POS % metrics reflect computed 30-day rolling values; preserving those figures alongside board presentation timestamps supports defensibility if regulators later ask what the board was told.

### Step-by-step walkthrough

1. T−7 days: agree decision thresholds with chair (when posture forces escalation vote).
2. T−1 day: purge demo alerts; confirm production-like data or label exercise clearly.
3. T−1 hour: rehearsal at projector resolution; verify red #ff2d55 readable; capture timestamped screenshot.
4. Open: "Cyber brief as of [header date], classified internal."
5. Posture: number + label + SCQA Answer sentence.
6. Momentum: ALERTS (24H) absolute + delta direction only.
7. Exceptions: incident panel or explicit zero; name owners.
8. Programme: weakest NIST bar + funded initiative ID.
9. Close: motion (Fund/Escalate/Accept/Monitor) + recorded vote.
10. Post: archive screenshot + minutes + Case Manager links within 48h.

### Common questions

#### Should we live-demo or use static slides?

Live demo shows trust and real operations but risks empty data or simulation noise. Static screenshots dated in **EXECUTIVE SECURITY BRIEF** header are safer for formal board minutes. Hybrid: slide screenshot plus live **RISK POSTURE** only.

#### What if a director asks for data not on this screen?

Acknowledge gap and route to operational modules. Threat Hunt, Case Manager, Compliance reports. Do not extrapolate **NIST** bars into compliance pass/fail. Offer follow-up within forty-eight hours with scoped export.

#### How do we handle **Confidential** in public company settings?

Treat as internal SEC-sensitive summary, align with counsel on whether exact **RISK POSTURE** counts are material non-public information; often ranges (**ELEVATED** band) suffice in public remarks while precise numbers stay in closed session.

#### Can we show **Simulate campaign** data to the board?

Only if clearly labelled exercise; directors may otherwise believe production was attacked. Prefer sanitized weekly production briefs; relegate simulation to training or tabletop exercises documented separately.

### Edge cases and gotchas

Simulate Campaign before board without disclosure is a governance incident. Sixth **ACTIVE** incident invisible due to `slice(0,5)`: state overflow. Public companies: counsel may prefer band (**ELEVATED**) over precise score in minutes. Stale packs mislead. Date stamp everything. FALSE POS % should be cited with its methodology (measured rate from past 30 days of rule evaluations); misquoting it triggers correction filing risk in regulated firms. Minutes template bullet: "Board noted cyber posture [label], decision [Fund/Escalate/Accept/Monitor], action owner [name], due [date]." Do not embed full KPI tables in public filings. Align with Reporting → Reports export for audit trail when directors request evidence. Tabletop exercises may use this view with watermarked "EXERCISE" slides, separate deck template from production brief. Annual refresh: train new directors on difference between posture score and Reports **OVERALL RISK** to prevent year-one confusion.

### How a CISO runs the board segment using this view

Pre-brief each incident row with SOC: business impact one-liner per IP, not rule names. During Q&A, pivot to Respond → Incidents only if asked for evidence; never navigate live without rehearsed path. Scribe captures decisions, not metrics. If demo fails, fall back to morning screenshot with readout of frozen posture: do not invent numbers.
