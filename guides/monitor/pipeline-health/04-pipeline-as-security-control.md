---
module: Pipeline Health
sidebar: Monitor → Pipeline Health
section: Monitor
subsection: Why pipeline health is a security control
last_updated: 2026-05-23
---

# Why pipeline health is a security control

**Part of:** Monitor → Pipeline Health
**One-sentence focus:** A silent pipeline is a blind SOC, attackers disable logging; EPS drops and source degradation are defensive indicators, not only ops metrics.

### What you are looking at

Same Pipeline Health dashboard interpreted defensively. EPS at zero, sources DEGRADED, ECS dropping, or OVERLOAD states as red flags comparable to firewall down indicators. If CCTV cameras freeze, the store is not safer, it is blind. Attackers disabling logging is the same manoeuvre at digital scale; pipeline monitoring is the guard checking cameras still record.

### What is happening underneath

No automatic incident fires on pipeline stall in v4; human must notice. Attack pattern: delete/disable syslog forwarder → EPS drops → undetected lateral movement. HABIBI-SIEM simulates degradation when `actualEps === 0 && rawLogs.length === 0` marks source degraded. Production would integrate heartbeat alerts from collectors; gap here.

### Why this matters

ISO 27001 logging controls, PCI DSS 10.x, NIST AU family require assurance of log continuity. Pipeline health operationalizes that assurance visually.

### Step-by-step walkthrough

1. Include Pipeline Health in shift checklist before declaring green status.
2. Compare EPS trend to historical sparkline shape (same time yesterday if recorded).
3. Investigate any source flip to DEGRADED during business hours.
4. Correlate with Overview alert drought; dual signal increases confidence of blind spot.
5. Verify ingest API reachable (`/api/logs/validate`).
6. Document pipeline outage as security incident if prolonged.
7. Post-mortem: attacker gained because logging failed first?

### Common questions

#### Will SIEM alert if pipeline stops?

Not automatically in demo, operational gap. Ransomware groups deleting Windows Event Logs; cloud attacker removing CloudTrail trail.

#### Is the proportional source health distribution enough for audit?

No; replace with real agent heartbeat integrations for compliance evidence.

#### Who owns pipeline issues?

Platform/engineering secops split; analyst detects, engineer fixes forwarder.

### Operational use during containment

Rules out "no alerts because attack stopped" vs "no logs arriving"; critical fork before closing incident.

### Edge cases and gotchas

Simulate campaign spikes EPS without real sources, do not confuse with production source health. Browser refresh clears raw buffer; EPS may dip briefly.

> **Technical note:** SOAR mitigation stage depends on AbuseIPDB key; failure does not stop ingestion but affects downstream response. Shift checklist: open Pipeline Health before declaring green status on Overview. Dual signal. EPS trend drop plus Overview alert drought, increases confidence of a blind spot versus a genuinely quiet environment. Document pipeline outages as security incidents when prolonged; attackers disabling logging is a control failure, not merely an IT ticket. Real-world precedents: ransomware groups clearing Windows Event Logs; cloud attackers removing CloudTrail trails. HABIBI-SIEM does not auto-fire pipeline-stall alerts in v4; human observation required. Production deployments should add collector heartbeat monitoring beyond this demo UI.
