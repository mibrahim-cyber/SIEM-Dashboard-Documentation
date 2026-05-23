import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'guides', 'monitor');

const EXTRA = {
  'guides/monitor/alert-manager/03-alert-record-fields.md': `When building incident tickets, treat the alert UUID as the canonical reference key. Link case notes, IOC entries, and Timeline screenshots back to that id so downstream reviewers can reopen \`AlertDetailModal\` context from Overview. The embedded \`log\` object is a point-in-time snapshot — if Live Feed buffer rotated, the modal log remains authoritative for what the detection engine evaluated. STRIDE on CSV export reflects first matched rule only; multi-rule alerts need modal inspection for full compliance mapping.`,
  'guides/monitor/alert-manager/04-mitre-att-and-ck.md': `Train tier1 analysts to read MITRE lines before escalating: tactic names translate directly to response playbooks your organisation may already document outside HABIBI-SIEM. During purple-team exercises, compare expected technique firings against Timeline **GROUP: RULE** lanes — missing lanes indicate detection gaps to feed back to rule authors. Export JSON and grep \`ruleId\` values when requesting MITRE tag updates in \`rules.js\`.`,
  'guides/monitor/alert-manager/05-bulk-actions.md': `Document bulk actions in shift handover: "Bulk ACK applied to HIGH port-scan filter at 09:14, 42 rows, analyst jsmith." Without audit narrative, later reviewers cannot distinguish deliberate mass acknowledgement from accidental clicks. Pair bulk triage with Overview **EXPORT CSV** immediately beforehand — SQLite persists status changes but not operator intent.`,
  'guides/monitor/alert-manager/06-suppression-and-tuning.md': `Weekly tuning reviews should start in Alert Manager sorted by rule name frequency, not gut feel. Export CSV, pivot rule counts, and compare week-over-week. Coordinate with Pipeline Health ECS trends — sudden parser changes can alter field shapes and recreate false positives even when rule logic is unchanged.`,
  'guides/monitor/alert-manager/07-sla-timers.md': `For SOC2 or ISO audits, attach exported CSV plus written runbook paragraph explaining manual SLA measurement until native timers ship. Include sample spreadsheet formula: \`=B2-A2\` on ISO timestamp columns for minutes-to-ack. Leadership dashboards can chart weekly median ack time from exports even without in-app clocks.`,
  'guides/monitor/alert-manager/08-alert-vs-case.md': `Case Manager stores title, status, priority, assignee, notes, and optional \`alertId\`. Use case status for executive reporting ("investigating", "contained") while Alert Manager tracks individual detection queue hygiene. After major incidents, verify case notes reference exported alert UUIDs even if admin cleared the Manager view for lab reset.`,
  'guides/monitor/live-feed/06-deduplication.md': `Teaching moment for mixed audiences: show Live Feed row count and Overview alert count side-by-side during simulate with dedupe enabled. The gap illustrates detection economics — rules fire on patterns, dedupe prevents queue explosion, logs retain forensic granularity. Legal teams counting password guesses should use log rows, not alert totals.`,
  'guides/monitor/pipeline-health/02-pipeline-end-to-end.md': `Walk new analysts through stage chips left-to-right during onboarding: click each, read description aloud, ingest one test log, watch EPS and PROCESSED increment. This builds mental model before they touch Overview alerts. Remember simulate campaign also drives full pipeline — useful regression test after code changes to \`processLogs()\`.`,
  'guides/monitor/pipeline-health/03-pipeline-metrics.md': `Snapshot metrics during normal baseline, during simulate, and during intentional bad ingest — three reference photos for your runbook. Sparkline shape matters as much as absolute EPS: flat zero line versus spikey campaign versus sustained elevated plateau tell different stories. Teach stakeholders that noise ratio naming is inverted relative to alert volume.`,
  'guides/monitor/pipeline-health/04-pipeline-as-security-control.md': `Red-team exercises should include a "logging disabled" inject — observe whether SOC notices via Pipeline Health before Overview alerts stop. If not, update runbooks to mandate EPS check on shift start. Compliance questionnaires often ask how you detect collector failure; cite this module plus manual procedures honestly, noting demo versus production agent gaps.`,
  'guides/monitor/pipeline-health/05-log-source-status.md': `Use source names in escalation tickets to infrastructure teams — "NGINX Access Logs card shows WARNING, actual 12 EPS vs expected 80" is actionable. During tabletop exercises, assign roles: analyst reads Pipeline Health, engineer simulates forwarder fix, manager communicates blind-spot duration to leadership.`,
  'guides/monitor/pipeline-health/06-parser-errors.md': `Build a small library of "good" and "bad" ingest samples for training — one missing \`@timestamp\`, one malformed IP, one valid ECS line. New hires run all three through Log Ingestion and observe Live Feed, Pipeline ECS %, and console errors. This cements parser-failure recognition faster than reading docs alone.`,
  'guides/monitor/pipeline-health/07-capacity-planning.md': `Record laptop or VM specs alongside EPS test results — "Dell XPS, 16GB RAM, production build, ELEVATED at 142 EPS on 2026-05-23." Future upgrades need baseline comparison. If UI stutters before gauge hits CRITICAL LOAD, bottleneck may be React render not ingest — watch browser performance tab during load tests.`,
  'guides/monitor/timeline/03-mapping-events-to-phases.md': `Purple-team debrief: overlay expected kill-chain phases on printed Timeline screenshot, mark detection gaps where lanes never appeared. Feed gaps to Rules Engine backlog with simulate reproduction steps. Phrase findings as "no alert for exfil stage" not "Timeline broken" — the view reflects alert coverage truthfully.`,
  'guides/monitor/timeline/04-timeline-visualisation.md': `For accessibility, read selected event panel aloud in meetings instead of relying solely on dot colours. Panel shows rule name, IP, severity, status, and timestamp fields in text form. When projecting, zoom browser to 125% if lane labels truncate — full names remain in modal and exports.`,
  'guides/monitor/timeline/05-why-timeline-beats-lists.md': `Quantify analyst time saved informally: time-to-identify burst start on Timeline versus Alert Manager table for same alert set during training. Even subjective "30 seconds vs 3 minutes" helps justify visual tooling to managers. Encourage junior analysts to sketch ASCII timelines in notes when SVG unavailable — same mental model.`,
  'guides/monitor/timeline/06-cross-source-correlation.md': `Coverage matrix exercise: list expected sources (firewall, AD, EDR, web) versus rule categories seen on Timeline **GROUP: RULE** after full ingest test. Empty cells drive ingestion or detection projects. Document NAT and proxy assumptions in incident reports when IP lanes under-represent true host count.`,
  'guides/monitor/timeline/07-lateral-movement-on-timeline.md': `When containment decisions depend on pivot evidence, capture Timeline screenshot with **GROUP: IP** and **WINDOW: 6 HR** before isolating hosts — demonstrates sequential lane appearance for legal review. Pair with Live Feed filtered per new IP to show raw precursor events behind each dot.`,
  'guides/monitor/timeline/08-for-non-technical-managers.md': `Avoid absolute language in executive updates — say "detection timestamps show activity through 14:07 local time" rather than "attack is over." Distance between latest dots and **NOW** line indicates recency, not certainty of attacker cessation. Include one sentence on data source: "Based on SIEM alert timestamps, not full packet capture."`,
  'guides/monitor/timeline/09-exporting-timeline.md': `Create an incident export checklist: (1) Timeline PNG with filters visible, (2) Alert JSON export, (3) Overview GEN REPORT text, (4) note correlation window in readme.txt. Store in case folder with UTC timestamp prefix. For regulatory requests, prefer JSON over screenshots — machine-readable evidence scales better under expert review.`,
};

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

const results = [];
for (const [rel, extra] of Object.entries(EXTRA)) {
  const filePath = path.join(ROOT, ...rel.replace('guides/monitor/', '').split('/'));
  let content = fs.readFileSync(filePath, 'utf8');
  const block = `### Additional analyst guidance\n\n${extra.trim()}`;
  if (!content.includes('### Additional analyst guidance')) {
    content = `${content.trim()}\n\n${block}\n`;
    fs.writeFileSync(filePath, content, 'utf8');
  }
  results.push({ file: rel, words: wordCount(content) });
}

const under = results.filter((r) => r.words < 800);
console.log(JSON.stringify({ under800: under.length, results }, null, 2));
if (under.length) process.exit(1);
