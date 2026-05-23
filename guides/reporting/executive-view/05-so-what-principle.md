---
module: Executive View
sidebar: Reporting → Executive View
section: Reporting
subsection: The so what principle
last_updated: 2026-05-23
---

# The so what principle

**Part of:** Reporting → Executive View
**One-sentence focus:** Applying the 'so what' principle to translate dashboard metrics into Fund, Escalate, Accept, or Monitor decisions.

### What you are looking at

Executive View is structured as a decision brief, not a telemetry dump. Practitioners use the Situation–Complication–Question–Answer (SCQA) pattern on this screen: Situation = header date + **RISK POSTURE**; Complication = rising ALERTS (24H) delta or non-zero **ACTIVE INCIDENTS**; Question = implied ("Do we fund, escalate, accept, or monitor?"); Answer = your spoken recommendation. The UI never prints the Answer, you deliver it. Four decision outcomes map to regions of the page:

| Decision | Typical trigger on screen | Example "so what" sentence |
|---|---|---|
| **Fund** | Lowest NIST bar, weak **DETECT** vs high alert volume | "We detect faster than we respond, invest in tier-2 headcount." |
| **Escalate** | **CRITICAL** posture + active incident panel | "Two live campaigns need legal/comms awareness today." |
| **Accept** | **GUARDED** posture, flat delta, zero incidents | "Residual risk within appetite, no board action." |
| **Monitor** | upward delta but low criticals | "Reconnaissance up; SOC watching, no customer impact yet." |

The Confidential header line is a governance cue: classify your spoken "so what" to the same tier as the slide.

### What is happening underneath

Layout order in Executive View screen is intentional narrative compression: posture before volume, volume before framework, framework before exceptions. The dashboard does not compute recommendations; humans supply causality. Useful bindings for defensible "so what" statements: `stats.delta` (momentum), `riskScore` (open exposure), `incidents.filter(active)` (executive exceptions), `nistScores` min key (programme gap), `stats.mttr`/`stats.falsePositive` (explicitly simulated; "so what" = future measurement intent, not performance truth). Conditional rendering of the incident panel (`active.length > 0`) prevents crying wolf. When hidden, your "so what" must still address open criticals if any exist in Alert Manager. Steering committees should pre-register decision thresholds: e.g., posture ≥ ELEVATED for two consecutive weekly briefs triggers mandatory Fund review; upward delta >25% week-over-week triggers detection engineering stand-up. Document thresholds in the security charter so presenters are not inventing criteria live. Pair Executive View "so what" with Reporting → Reports exports when the Answer is Escalate; attach **EXECUTIVE VIEW** narrative and **TOP THREAT ACTORS** as appendix. For regulated sectors, map each Answer type to notification playbooks (GDPR 72-hour clock, SEC cyber disclosure) even though this UI does not start timers: your spoken Answer triggers those clocks outside the dashboard.

### Why this matters

McKinsey-style "so what" discipline exists because directors stop listening after the third unexplained integer. Regulators and plaintiffs' counsel later ask what decision the board made with the data shown. Vague narration ("alerts were up") fails duty-of-care tests. Training presenters to end every screen region with a decision verb (approve, escalate, defer, accept) converts HABIBI-SIEM from demo software into governance infrastructure.

### Step-by-step walkthrough

1. Draft one sentence SCQA Answer before opening the module.
2. Read **RISK POSTURE**, state Situation ("We are **ELEVATED** at 52").
3. If ALERTS (24H) shows an upward delta, state Complication ("Volume up eighteen versus prior rolling day").
4. Scan **ACTIVE INCIDENTS**, if >0, Question becomes "Do we need executive air cover?"
5. Identify weakest NIST bar: tie to Fund or Monitor Answer.
6. If incident panel visible, assign RACI: who owns comms, legal, SOC (names, not roles only).
7. Label **MTTR**/FALSE POS % as roadmap metrics if mentioned.
8. Close with explicit decision request and date for follow-up.

### Common questions

#### What if leadership asks "so what" and I only have green metrics?

Use the brief to discuss assurance: **LOW** posture with strong **DETECT** and **PROTECT** bars supports "maintain investment," while weak **RECOVER** still justifies disaster-recovery testing spend. Absence of incidents is not absence of risk. Cite external assessments or pen test findings not shown on this screen.

#### Should I read every KPI aloud in board meetings?

No, pick three tied to the agenda. Over-reading **LOGS PROCESSED** invites digressions into IT plumbing unless the question is capacity. Lead with **RISK POSTURE**, **ACTIVE INCIDENTS**, and one framework bar.

#### How do simulated **MTTR** and **FALSE POS %** affect "so what"?

They illustrate where real metrics will live and set conversational placeholders; "when wired, MTTR will tell us if we meet regulatory notification windows." Presenters must label them simulated to preserve trust; citing `8%` false positives as fact would mislead auditors.

#### Can "so what" be negative: leave things alone?

Yes. downward delta on ALERTS (24H) with **GUARDED** posture and zero active incidents supports "no new spend this quarter." The principle requires a conclusion, not necessarily action.

### Edge cases and gotchas

Fund answers based solely on high **DETECT** mislead. DETECT is rule-count-driven. Accept answers when criticals remain open are negligent, check Alert Manager. Simulated **MTTR** must never justify regulatory timing claims. Empty incident panel + high posture = hidden backlog story; always state open critical count aloud.

### How an analyst bridges SOC detail to executive "so what"

On bridge calls, use a two-column verbal template: Impact (customer, regulatory, financial) then Evidence (module + field). Example: "Impact: Possible credential stuffing against VPN: customer lockout risk if unchecked. Evidence: **ACTIVE INCIDENTS** = 1, rules show brute-force, posture **ELEVATED** at 48." Forbidden pattern: reading five KPIs without a decision. After the call, log which Answer you gave (Fund/Escalate/Accept/Monitor) in Case Manager so post-incident review can grade accuracy.
