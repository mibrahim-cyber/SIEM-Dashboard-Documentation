---
module: Reports
sidebar: Reporting → Reports
section: Reporting
subsection: Report customisation
last_updated: 2026-05-23
---

# Report customisation

**Part of:** Reporting → Reports
**One-sentence focus:** What can and cannot be customised on the Reports screen versus elsewhere in the SOC workflow.

### What you are looking at

Unlike a dedicated report-builder wizard, Reports customises output primarily through view selection and through operational choices you make elsewhere in the SIEM that this screen reflects. The only explicit control on this page is the trio EXECUTIVE VIEW | TECHNICAL VIEW | COMPLIANCE VIEW. There is no date-range picker, no checkbox to hide sections, no logo upload, no recipient field, and no "save template" button on this component. Indirect customisation surfaces include: the right sidebar // SEVERITY SPLIT and // ALERT STATUS panels (always visible, mirroring how you triaged alerts), // THREAT INTEL (top eight IPs from `buildThreatScores`), and the header **OVERALL RISK** tier that reacts to live severity mixes. Simulate Campaign, log ingestion volume, rule enable/disable toggles, and alert acknowledge/resolve actions all reshape the report without touching Reports itself. For comparison, Reporting → Scheduler offers richer scheduling customisation (frequency, format dropdown including PDF, recipients), but that is a separate module. On this page, "customisation" means choosing the reader lens plus curating the underlying dataset through SOC workflows.

### What is happening underneath

Reports screen recomputes `stats` inside derived dashboard state on every alert mutation. Acknowledging an alert changes `stats.acked`, `stats.newCount`, and possibly compliance pass flags. Toggling a rule in context updates `enabledRulesCount`, ISO checklist lines, and MITRE **ACTIVE/DISABLED** labels. Incident correlation runs in the SIEM context pipeline whenever alerts change, updating **INCIDENTS** KPI and **ACTIVE INCIDENTS** section rows. Threat scores rebuild from the same alert list, reordering // THREAT INTEL entries. The exported `.txt` report (sidebar EXPORT REPORT.TXT) uses a different template in plain-text export inside `the SIEM context pipeline`, a short plain-text summary with `riskScore`, watchlist size, enforcement mode, alert totals, and SOAR log length, not the rich HTML-like panels visible on screen. Customising what appears on screen does not automatically customises the download body beyond those context fields.

`reportType` state is ephemeral. No `localStorage`, no server preference. Refresh resets to executive.

### Why this matters

Teams often expect a BI-style report designer; setting expectations prevents frustration. The design choice ties report fidelity to SOC hygiene: your report is only as accurate as alert triage, rule coverage, and incident status. That coupling incentivises keeping queues current; an executive summary claiming high resolution rate means nothing if analysts mass-resolve without investigation. Understanding indirect customisation also clarifies division of labour: detection engineers customise technical content via rules; tier-1 analysts customise status splits via acks; managers choose executive versus compliance framing via view buttons. When planning integrations, know the gap: if you need branded PDFs with selectable date windows, you must extend the app or use Scheduler's format dropdown (which simulates PDF delivery but does not generate binary PDFs in-browser: see Export section).

### Step-by-step walkthrough

1. Decide on the lens first (executive, engineering, or compliance), and click the matching **VIEW** button.
2. If KPIs look stale, run Simulate Campaign or ingest logs, then return to Reports without reloading.
3. In Monitor → Alert Manager, acknowledge or resolve alerts to improve **UNREVIEWED** and **RESOLVED** tiles and compliance triage checks.
4. In Configure → Detection Rules, enable/disable rules to change ISO checklist and MITRE cards before a compliance readout.
5. In Respond → Incidents, contain or resolve incidents to drop **INCIDENTS** KPI and NIST uncontained-critical check.
6. Switch views to verify the KPIs match across lenses; KPI row should match across all three.
7. Use // THREAT INTEL sidebar to confirm scoring reflects recent attacker IPs from your simulation.
8. When satisfied, export via sidebar buttons; remember on-screen sections are not fully mirrored in `.txt` export.

### Common questions

#### Can I change the report title or add our company logo?

Not in the current Reports component. The title **HABIBI-SIEM // SECURITY INTELLIGENCE REPORT** and matrix styling are defined in the Reports component.

#### Is there a date filter for last week or last month?

No. The only time window on this page is the ALERT DISTRIBUTION (LAST 24H) histogram in executive view. All other counts include the full in-memory alert array.

#### How do I customise which sections appear?

You cannot hide individual sections. View toggles swap entire section sets. Executive always shows summary, histogram, and top actors; technical always shows rules, events, incidents; compliance always shows posture and MITRE grid.

#### If I pause all rules, what changes here?

**TECHNICAL VIEW** shows dim dots and **DISABLED** on MITRE cards. ISO All detection rules enabled fails. Framework scores drop. KPI alert counts stop growing until logs arrive without matching rules.

#### Does scheduler customisation affect this page?

No. Scheduler schedules are separate dashboard state in Scheduler screen. Reports and Scheduler read the same `the SIEM context pipeline` data but do not share schedule or template configuration.

### Edge cases and gotchas

Clearing all alerts via admin actions zeroes most panels instantly: exports still work but produce empty or trivial summaries. Threat intel sidebar shows **NO DATA YET** when `threatScores` is empty. Executive histogram buckets do not label individual hours. Only three axis labels, so precise spike timing requires Timeline or Alert Manager. Custom rules added in UI merge into `rules` and appear automatically in technical/compliance sections without code changes. Browser zoom does not alter data; printing relies on browser print CSS which may clip the sidebar.

> **Technical note:** Customisation hooks are data-driven: the SIEM context pipeline destructures `{ alerts, incidents, threatScores, rules }`. No props or query params configure Reports. `Section` wrapper is a presentational `terminal-panel border-glow` div with `// {title}` header pattern shared across views.

### How an analyst uses this

Monday morning, an analyst treats Reports as a dashboard they "configure" through workflow: they resolve weekend backlog first, then open **EXECUTIVE VIEW** for stand-up. Before a compliance checkpoint they enable any maintenance-disabled rules, refresh mentally by clicking **COMPLIANCE VIEW**, and verify all yes. During tuning they use **TECHNICAL VIEW** as feedback loop; disable a noisy rule, watch its bar shrink on next alert cycle. They learn the `.txt` export is minimal and prepare supplemental CSV exports for custom spreadsheet charts when leadership wants bespoke layouts.
