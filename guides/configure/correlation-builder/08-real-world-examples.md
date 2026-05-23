---
module: Correlation Builder
sidebar: Configure → Correlation Builder
page: 08-real-world-examples.md
title: "Real-world correlation examples"
last_updated: 2026-05-23
---

# Real-world correlation examples

**Sidebar path:** Configure → Correlation Builder

## Real-world correlation examples

### What you are looking at

HABIBI-SIEM ships real-world-inspired correlation patterns in two demonstrable forms: production engine rules in the detection rules catalog (functional) and Builder representations (editable clones). Examples include Brute Force Attack (5 failures / 60s / IP), SQL Injection Attempt (multi-field regex tampering), Rapid Request Rate (10 HTTP / 10s), Data Exfiltration (internal source + external dest + bytes > 50MB), Privilege Escalation (process name sudo/su patterns), and Off-Hours Authentication (success login hour 22:00–06:00 UTC). Analytics **CORRELATED INCIDENTS** shows real-world post-detection grouping, e.g., attacker IP `203.0.113.x` with multiple rule names after Simulate Campaign. Real-world correlation examples are case studies in a textbook, each chapter connects means, motive, opportunity (fields, operators, windows) into a narrative prosecutors (SOC analysts) can present.

### What is happening underneath

Simulate Campaign timeline (from the SIEM context pipeline):

| Delay | Rule theme |
|-------|------------|
| 0ms | brute-force ×5 |
| 1500ms | sql-injection ×3 |
| 3000ms | xss ×3 |
| 4500ms | brute-force ×5 |
| 5500ms | data-exfil ×2 |
| 6500ms | privilege-escalation ×2 |

Same attacker IP templates cause `correlateAlerts` to merge alerts into incidents with multiple `ruleNames`. Builder can recreate subsets, e.g., conditions `eventType contains login` AND `event.outcome equals failure` approximates brute-force narrative without window enforcement. MITRE mappings on engine rules tie examples to ATT&CK reporting vocabulary.

> **Technical note:** Log4Shell CVE on assets correlates to injection rules when logs contain JNDI patterns; asset + rule correlation cross-link for prioritisation.

### Why this matters

Abstract UI fields become concrete when mapped to campaigns analysts recognise. APT credential spray, web app injection chains, exfil over HTTPS. Training on HABIBI examples transfers to Sigma rule selection and incident runbooks in enterprise tools.

### Step-by-step walkthrough

1. Reset alerts; run Simulate Campaign once.
2. Open Analytics → CORRELATED INCIDENTS, capture example incident row (IP, rule names list, categories).
3. Open Builder; select Brute Force Attack: read conditions if populated or add auth failure conditions.
4. Test rule; confirm matches >0 aligning with simulation auth alerts.
5. Select SQL Injection Attempt, test; matches injection alerts.
6. Review Data Exfiltration rule description: large outbound bytes pattern.
7. Map incident categories to **ATTACK CATEGORY BREAKDOWN** bars on Analytics.
8. Draft new Builder rule combining `url.path contains admin` OR `url.path contains.env` mirroring sensitive-path detection.
9. Test; compare match count to Sensitive Path Access engine hits on Rules Engine.

### Common questions

#### Do simulation examples use real attacker IPs?

Demo uses documentation range IPs (e.g., 203.0.113.x TEST-NET-3), safe for labs.

#### Can I replicate multi-stage APT kill chain?

Partially; simulation fires staged rule types sequentially; incident correlation groups by IP not ordered kill chain validation.

#### Which example best teaches window correlation?

Brute-force; description explicitly states τ and Δt; compare to Builder threshold/window fields conceptually.

#### Are XSS and SQLi separate incidents?

If same IP within 60s, single incident row lists both rule names; realistic combined web attack surface narrative.

### How an analyst uses this during active incident

Analyst compares live incident `ruleNames` to known examples, "looks like simulation stage 3–4" as metaphor for injection plus credential attack. They prioritize exfil and privilege escalation names in incident string as late-stage actions. They pull Builder example conditions into ad-hoc hunt queries on Threat Hunt if available.

### Edge cases and gotchas

Simulation timing scripted; real attacks more chaotic. Builder tests alerts not replay logs; counts may not match engine hits exactly. XSS rule id `xss-attempt` vs display name Cross-Site Scripting Attempt; naming in incident strings uses ruleName. Examples use simplified byte threshold for exfil, production baselines vary by org. Correlation Builder local edits do not affect which examples fire until engine code updated.
Mapping simulation to ATT&CK narrative: stage 0-1500ms credential access T1110, 1500-3000ms initial access T1190 SQLi, 3000-4500ms execution T1059.007 XSS, 5500ms exfiltration T1048, 6500ms privilege escalation T1068; useful classroom storyboard when debriefing Simulate Campaign. Real campaigns differ in timing but similar multi-TTP clustering appears in Analytics incident ruleNames join string. Purple team exercise: disable random rule in Rules Engine, rerun simulation, observe which incident categories disappear; teaches dependency mapping. Re-enable and add Builder draft for missed TTP, test match count, discuss promotion gap. Asset tie-in: exfil alerts referencing internal 10.0.0.x sources highlight PROD-APP-01 or PROD-DB-01 in Asset Inventory; correlate business impact story for executives alongside technical incident rows.
Extend simulation debrief with defensive mapping: which rules would firewall block prevent from firing, unusual-port on outbound deny, which require application fix; Log4Shell on PROD-WEB-01 asset row. Link Examples to compliance: ProxyLogon CVE on PROD-MAIL-01 plus exchange-related rule hits triggers breach notification discussion in tabletop exercise. Encourage students to author one original Builder rule mimicking local organisation TTP observed in news breach report; test against alerts, present match count, explain promotion path to detection rules catalog for capstone credit. Managers reviewing these examples should focus on which business assets appear in correlated incident rows and whether response playbooks exist for each rule category shown. Engineers should trace each example from detection rules catalog check function through `processLogs()` on the detection engine to the Analytics **CORRELATED INCIDENTS** panel to verify end-to-end behaviour matches the narrative presented to leadership during tabletop exercises.
