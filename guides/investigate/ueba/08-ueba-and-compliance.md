---
module: UEBA
sidebar: Investigate → UEBA
section: Investigate
subsection: UEBA and compliance
last_updated: 2026-05-23
---

# UEBA and compliance

**Sidebar path:** Investigate → UEBA

![UEBA main view](../../../screenshots/guides/investigate-UEBA.png)

### What you are looking at

Compliance officers use **USER** table as access monitoring evidence: who had anomalous activity during audit period, **FAILED AUTH** for authentication control testing, **OFF-HOURS** for segregation of duties review, OBSERVED IPs for data localisation arguments. Export via screenshot or manual copy, no PDF export button.

### What is happening underneath

GDPR Article 30 processing records and Article 32 security measures expect ability to demonstrate monitoring of personal data access. UEBA scores provide qualitative evidence of anomalous access investigation. HIPAA requires minimum necessary access, high IP diversity + off-hours may indicate excess access. PCI DSS 10.6 reviews logs daily; UEBA prioritises which user logs to review first. Mapping is interpretive. The tool provides signals, compliance requires process wrapper.

### Why this matters

Auditors ask "how do you detect unauthorised access to personal data?" UEBA is the answer narrative. Without behavioural analytics, organisations rely on manual log review; doesn't scale and fails audits. Documented UEBA investigations become compliance evidence.

### Step-by-step walkthrough

1. For quarterly audit, open UEBA with date-bounded data (if available in ingest).
2. Screenshot **SUSPICIOUS** users list, redact if sharing externally.
3. For each, document investigation outcome in Case Manager.
4. Map findings to control framework (e.g. ISO A.9.4.2 secure log-on).
5. Note any unresolved SUSPICIOUS users; remediation tracker.
6. Cross-reference Executive View for management reporting summary.
7. Archive screenshots in compliance evidence repository.

### Common questions

#### Does UEBA satisfy GDPR alone?

No, part of a broader programme including access controls, encryption, DPA. UEBA demonstrates monitoring control operation.

#### Can auditors see raw scores?

Yes if exported; explain formula transparency in subtitle. They'll ask how false positives handled, document exception process.

#### Is user monitoring legal?

Depends on jurisdiction, employee notice, and union agreements; legal counsel required before deployment in production.

#### How often should compliance review UEBA?

Align with the access review cycle: quarterly minimum for regulated industries; monthly for high-risk environments.

### How an analyst uses this during an active incident

Regulator asks during breach "when did you detect anomalous access?" Analyst produces UEBA screenshot timestamp, profile detail, linked case ID, timeline of response actions; demonstrates due diligence.

### Edge cases and gotchas

Screenshot evidence without case linkage weak, always tie to investigation record. Monitoring without workforce notice may violate labour law. Service account false positives undermine compliance narrative; segment entities in reporting.

### Control framework cross-reference table

| Framework | Relevant UEBA evidence |
|-----------|------------------------|
| GDPR Art. 32 | Anomaly monitoring of personal data access |
| HIPAA §164.312(b) | Audit controls and access monitoring |
| PCI DSS 10.6 | Daily log review prioritisation via scores |
| ISO 27001 A.12.4.1 | Event logging and user activity monitoring |
| SOC 2 CC6.3 | Logical access security monitoring |

Export evidence as timestamped screenshots plus case IDs; verbal claims without artefacts fail audits. Quarterly review: count **SUSPICIOUS** users investigated vs unresolved; unresolved undermines programme credibility with regulators.

### Communicating UEBA and compliance to leadership and engineering

For board conversations, frame Investigate → UEBA numbers as risk to revenue and reputation. For engineering reviews, reference the component file and `the SIEM context pipeline` fields listed in the walkthrough. Keep artefacts: PNG exports beat memory.

### Operator vs maintainer focus

Analyst readers: stay on-screen labels and the step list above. Maintainer readers: validate the screen against this prose before release. Enterprise deployments add scale; the interaction patterns here still apply.

#### How do you walk a non-technical board through UEBA and compliance quickly?

Open Investigate → UEBA on the live dashboard during the meeting. Point to the primary visual described in the opening section; skip raw log lines. State how many items are flagged, whether the pattern is new or recurring (compare to yesterday's screenshot if you have one), and name one concrete next action (block IP, reset credential, open case). Boards decide on risk and resources, not MITRE techniques, so translate findings into business impact and recommended spend. Close with what remains unknown and when you will update them.

#### Which code paths should engineers check when changing UEBA and compliance?

Diff the component named in this guide against `the SIEM context pipeline` typings. Walkthrough steps must match rendered labels and filter chips. When props or hooks move, update the markdown in the same PR. Regression-test ingest → parse → alert → Investigate → UEBA render with Simulate Campaign before merging.

#### What tripping point catches first-time users?

Assuming empty or quiet means safe. Verify ingestion in Pipeline Health and rule hits on Overview before telling stakeholders the environment is clean.
