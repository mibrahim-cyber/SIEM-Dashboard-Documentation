import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = path.resolve(__dirname, '..');
const GUIDES = path.join(DOCS_ROOT, 'guides', 'monitor');

const MODULES = [
  {
    folder: 'overview',
    module: 'Overview',
    sidebar: 'Monitor → Overview',
    screenshot: 'monitor-overview.png',
    essays: [
      { file: '02-dashboard-at-a-glance-philosophy.md', heading: 'The dashboard-at-a-glance philosophy', title: 'The dashboard-at-a-glance philosophy', focus: 'Overview compresses posture, volume, and urgency into one three-column layout so analysts can decide in seconds whether the organisation is under attack.' },
      { file: '03-metric-cards-explained.md', heading: 'Every metric card and counter', title: 'Every metric card shown', focus: 'Each counter on Overview answers a different operational question — together they decompose security posture in ways a single risk score cannot.' },
      { file: '04-simulate-campaign.md', heading: 'The Simulate Campaign button', title: 'The Simulate Campaign button', focus: 'Simulate Campaign injects staged malicious logs through the real detection pipeline for demos, labs, and rule regression without touching production systems.', keepSections: ['Campaign choreography in detail'] },
      { file: '05-severity-levels.md', heading: 'Severity levels (Critical / High / Medium / Low)', title: 'Severity levels (Critical / High / Medium / Low / Info)', focus: 'Four severity tiers drive colour coding, sound alerts, bulk triage, and escalation discipline across the Overview feed and side panels.', keepSections: ['Operational response matrix'] },
      { file: '06-auto-refresh-real-time.md', heading: 'How the Overview auto-refreshes', title: 'How the overview auto-refreshes', focus: 'Overview updates through React state propagation when logs are processed — no polling button, but also no cross-client WebSocket push.', keepSections: ['Multi-analyst and persistence semantics'] },
      { file: '07-alerts-vs-incidents.md', heading: 'Alerts fired vs incidents created', title: 'Alerts fired vs incidents created', focus: 'Alerts are individual detection firings stored in SQLite; incidents are ephemeral IP-time clusters computed by correlateAlerts() for situational summary.', keepSections: ['Correlation limits and reporting language'] },
    ],
  },
  {
    folder: 'live-feed',
    module: 'Live Feed',
    sidebar: 'Monitor → Live Feed',
    screenshot: 'monitor-live-feed.png',
    essays: [
      { file: '02-live-feed-concept.md', heading: 'What a live feed is in SIEM terms', title: 'What a live feed is in SIEM terms', focus: 'Live Feed shows the last buffered normalized events as they arrive — raw telemetry before and beside alert correlation.' },
      { file: '03-event-table-columns.md', heading: 'Every column in the live event table', title: 'Every column in the live event table', focus: 'Stream and table views map structured log fields to columns so analysts read events without opening JSON on every line.' },
      { file: '04-log-normalisation-walkthrough.md', heading: 'Log normalisation deep-dive', title: 'Log normalisation deep-dive', focus: 'Every row in Live Feed is already validated, ECS-shaped, and geo-enriched before it reaches the display buffer.' },
      { file: '05-filtering-and-search.md', heading: 'Filtering and search', title: 'Filtering and search', focus: 'Client-side IP, event-type, and substring filters narrow the buffer instantly without stopping ingestion.' },
      { file: '06-deduplication.md', heading: 'Deduplication', title: 'Deduplication', focus: 'Alert dedupe on Overview collapses repeat rule/IP pairs within 30 seconds; Live Feed still shows every log line.' },
      { file: '07-pagination-performance.md', heading: 'Pagination vs infinite scroll', title: 'Pagination vs infinite scroll', focus: 'Live Feed renders the full filtered buffer with auto-scroll to the tail — a conveyor-belt model for real-time monitoring.' },
      { file: '08-first-five-minutes.md', heading: 'How analysts use the live feed in the first five minutes', title: 'Live feed during the first 5 minutes of an incident', focus: 'The first five minutes after a critical alert are when analysts filter by IP, pause the stream, and capture evidence before buffer rotation.' },
    ],
  },
  {
    folder: 'timeline',
    module: 'Attack Timeline',
    sidebar: 'Monitor → Timeline',
    screenshot: 'monitor-timeline.png',
    essays: [
      { file: '02-kill-chain-basics.md', heading: 'What a kill chain is', title: 'What a kill chain is', focus: 'Attack Timeline plots alert timestamps on swim lanes so analysts see attack progression even when the UI does not label kill-chain phases explicitly.' },
      { file: '03-mapping-events-to-phases.md', heading: 'How events map onto attack phases', title: 'Mapping raw events onto kill chain phases', focus: 'Rule categories and simulate-campaign ordering let analysts infer kill-chain phases from lane sequence when grouping by RULE.' },
      { file: '04-timeline-visualisation.md', heading: 'The timeline visualisation', title: 'The timeline visualisation', focus: 'The SVG canvas maps time to X-axis pixels, grouping keys to lanes, and severity to dot colour with incident bands behind.' },
      { file: '05-why-timeline-beats-lists.md', heading: 'Why a timeline beats a flat list', title: 'Why visualising attacks as a timeline is more useful than a flat list', focus: 'Spatial layout exploits pattern recognition for burst detection faster than scrolling a sorted alert table.' },
      { file: '06-cross-source-correlation.md', heading: 'Correlating events across source systems', title: 'Correlating events across multiple source systems', focus: 'Timeline groups alerts by IP, rule, or severity — cross-source correlation requires shared keys and rules firing on each source.' },
      { file: '07-lateral-movement-on-timeline.md', heading: 'Lateral movement detection', title: 'Lateral movement detection on the timeline', focus: 'Pivoting appears as new IP lanes or escalating rule categories over time — analysts infer paths without drawn edges between hosts.' },
      { file: '08-for-non-technical-managers.md', heading: 'Helping managers understand what happened', title: 'How the timeline helps a non-technical manager', focus: 'Filtered Timeline screenshots plus plain-language narration give executives plot, peak, and ongoing status without log syntax.' },
      { file: '09-exporting-timeline.md', heading: 'Exporting the timeline for incident reports', title: 'Exporting the timeline for incident reports', focus: 'Timeline has no native export button — analysts combine screenshots with Overview JSON/CSV alert exports for audit packages.' },
    ],
  },
  {
    folder: 'alert-manager',
    module: 'Alert Manager',
    sidebar: 'Monitor → Alert Manager',
    screenshot: 'monitor-alert-manager.png',
    essays: [
      { file: '02-alert-lifecycle.md', heading: 'The alert lifecycle', title: 'The alert lifecycle', focus: 'Alert Manager implements new → acknowledged → resolved transitions with bulk actions, RBAC gates, and SQLite persistence.' },
      { file: '03-alert-record-fields.md', heading: 'Every field in an alert record', title: 'Every field in an alert record', focus: 'The table shows a triage subset; the full alert object in AlertDetailModal and JSON export carries rules, logs, geo, and simulation flags.' },
      { file: '04-mitre-att-and-ck.md', heading: 'MITRE ATT&CK integration', title: 'MITRE ATT&CK integration', focus: 'MITRE technique metadata lives on detection rules and surfaces in the alert detail modal, not in the Manager table columns.' },
      { file: '05-bulk-actions.md', heading: 'Bulk actions', title: 'Bulk actions and alert fatigue', focus: 'Checkbox selection and ACK ALL NEW handle volume during storms — with policy guardrails because bulk ACK hides unreviewed criticals.' },
      { file: '06-suppression-and-tuning.md', heading: 'Alert suppression and tuning', title: 'Alert suppression and tuning', focus: 'Manager shows tuning outcomes; suppression itself happens in Rules Engine, dedupe toggle, and rule pause — not inline on each row.' },
      { file: '07-sla-timers.md', heading: 'SLA timers', title: 'SLA timers and compliance', focus: 'v4 Alert Manager does not render SLA countdowns — compliance teams measure time-to-ack from exported timestamps and audit logs.' },
      { file: '08-alert-vs-case.md', heading: 'Alerts vs cases', title: 'The difference between an alert and a case', focus: 'Alerts are the detection queue; cases in Respond → Case Manager are human-opened investigation binders that may reference alert UUIDs.' },
    ],
  },
  {
    folder: 'pipeline-health',
    module: 'Pipeline Health',
    sidebar: 'Monitor → Pipeline Health',
    screenshot: 'monitor-pipeline-health.png',
    essays: [
      { file: '02-pipeline-end-to-end.md', heading: 'What the pipeline means end to end', title: 'What the pipeline means end to end', focus: 'Pipeline Health labels the logical stages from ingestion through mitigation that processLogs() executes in one monolithic demo path.' },
      { file: '03-pipeline-metrics.md', heading: 'Pipeline health metrics', title: 'Pipeline health metrics', focus: 'EPS gauge, sparkline, processed count, ECS compliance, and noise ratio translate buffer and alert state into operational instruments.' },
      { file: '04-pipeline-as-security-control.md', heading: 'Pipeline health as a security control', title: 'Why pipeline health is a security control', focus: 'A silent pipeline is a blind SOC — attackers disable logging; EPS drops and source degradation are defensive indicators, not only ops metrics.' },
      { file: '05-log-source-status.md', heading: 'Log source status indicators', title: 'Log source status indicators', focus: 'Nine named source cards split aggregate EPS with health badges — illustrative in v4, but teaching how partial outages narrow troubleshooting.' },
      { file: '06-parser-errors.md', heading: 'Parser errors and normalization failures', title: 'Parser error deep-dive', focus: 'Failed validation never reaches the buffer — ECS compliance percentage and ingest UI errors are the analyst-visible parse-failure proxies.' },
      { file: '07-capacity-planning.md', heading: 'Capacity planning', title: 'Capacity planning', focus: 'EPS approaching CRITICAL LOAD and buffer caps signal when synchronous client-side processing may drop or lag events.' },
    ],
  },
];

const EXPANSIONS = {
  'guides/monitor/overview/05-severity-levels.md': `Organisations often map severities to response tiers even when the UI lacks formal SLA timers. A practical HABIBI-SIEM lab mapping treats **CRITICAL** as page-on-call within minutes and consider SOAR watchlist paths for external IPs scoring above threshold 75; **HIGH** as tier2 review within the same shift with mandatory case consideration when clustered; **MEDIUM** as tier1 resolve-after-review when the source is a known scanner; **LOW** as weekly batch review unless part of an incident cluster. The Overview **ACK CRITICAL** button exists because critical queue depth is the leading indicator of SOC overload — not total alert count.

Colour psychology matters for mixed audiences. Red critical badges align with universal danger signalling; green low severity does not mean ignore forever — reconnaissance low alerts sometimes precede later critical exploitation from the same IP. **SEV BREAKDOWN** bars give managers a histogram without reading rows. Training exercise: run simulate with **SOUND: ON** so trainees associate audio with critical only.`,
  'guides/monitor/overview/06-auto-refresh-real-time.md': `Overview refresh semantics tie directly to HABIBI-SIEM's SQLite session model. When tier2 acknowledges an alert on Overview, \`api.updateAlert\` persists status — tier1 reloading the page sees updated status after \`getState()\` hydration. Without reload, both analysts share updates only if the action originated on their client. Shift handover procedure: outgoing analyst exports CSV, incoming analyst refreshes the browser before trusting **UNREAD** counts.

The critical toast pipeline registers through \`onCritical()\` callback ref — Dashboard owns it on the Overview route. Toast content includes rule name and IP from the first matched rule. **LOGS** counter increments even when alerts are deduped — proving ingestion is alive when the alert feed is quiet. Pair with Pipeline Health EPS gauge for corroboration.`,
  'guides/monitor/overview/07-alerts-vs-incidents.md': `When briefing non-technical leadership, vocabulary discipline prevents panic. Say "we have twelve alerts grouped into two active incident clusters" rather than "twelve incidents." HABIBI-SIEM incident objects include a \`categories\` array from matched rule categories — useful noun phrases for executives without reading logs.

Correlation window of 60 seconds (\`IP_WINDOW_MS\`) means slow-burn attacks spacing events more than one minute apart appear as separate incidents. Analysts investigating distributed scans should use **Alert Manager** sorted by source IP and **Timeline GROUP: RULE** rather than the incident banner alone. Export alerts JSON and recompute clusters externally for legal hold packages, documenting correlation parameters in a methodology footnote.`,
  'guides/monitor/live-feed/03-event-table-columns.md': `The \`formatLogSummary()\` helper in \`RawLogs.jsx\` exists because ECS logs store \`url\` and \`file\` as nested objects. Rendering those objects directly in JSX would crash React — the column therefore shows a flattened path string. The \`formatLogFieldValue()\` companion stringifies nested objects in **LOG DETAIL** so analysts still see full structure when investigating.

HTTP method colours (\`METHOD_COL\`) give instant read/write context: DELETE and PATCH in red/orange draw the eye during destructive activity reviews. Status codes at or above 400 render red in the stream view, aligning visually with failed authentication and exploitation attempts even before an alert fires.

The right sidebar **// LOG DETAIL** panel iterates \`Object.entries(selectedLog)\` when a row is clicked, rendering every key including nested \`geo\`, \`event.kind\`, and \`@timestamp\` in ISO format. Stream view uses \`fmtTime()\` for HH:MM:SS.mmm in local browser timezone — when writing formal timelines, copy ISO from detail rather than stream time alone. Event-type colours (\`EVT_COLOR\`) group visually: \`auth-failure\` and \`command-exec\` in red tones, \`http-request\` in green, \`port-scan\` in orange. Non-standard **PORT** values highlight amber when not 80, 443, or 22 — a quick lateral-tool indicator during incident review.`,
  'guides/monitor/live-feed/04-log-normalisation-walkthrough.md': `The validation endpoint (\`POST /api/logs/validate\`) is the gatekeeper. Events rejected here never increment \`logsProcessed\`, never appear in Live Feed, and never reach \`DetectionEngine.processLogs()\`. Analysts troubleshooting "missing" attacks should always ask whether validation failed before asking whether rules misfired.

Geo enrichment via \`lookupGeoIpBatch()\` adds country and coordinates to external IPs after validation. These fields appear only in **LOG DETAIL**, not stream columns — pivot to the detail panel when building geographic narratives for incident reports. Simulated logs from \`generateMaliciousLog()\` carry \`_simulated: true\`, which propagates to alert objects and must be disclosed in compliance counts.

Consider a failed SSH password line normalised to \`{ eventType: 'auth-failure', sourceIp: '203.0.113.45', username: 'root', port: 22 }\`. Detection rules match on \`eventType\` and field patterns — not raw syslog text. Pipeline Health **ECS COMPLIANT** percentage checks \`@timestamp\` or \`event.kind\` presence in buffered logs, the same predicate used when alerts receive \`ecsCompliant\` flags in \`processLogs()\`. Ingestion paths include Log Ingestion paste, file upload, API validate, and Simulate Campaign — all converge on the same normalisation pipeline before Live Feed display.`,
  'guides/monitor/live-feed/05-filtering-and-search.md': `The \`filtered\` useMemo in \`RawLogs.jsx\` chains three transformations: start from \`displayLogs\` (frozen snapshot when paused, else live \`rawLogs\`), apply event-type pill filter, then apply text search across \`sourceIp\`, \`eventType\`, \`method\`, string \`url\`, \`username\`, or full JSON via \`JSON.stringify\`. This design keeps filtering entirely client-side for sub-millisecond response on demo-scale buffers.

During screen sharing, pause before filtering so row counts stabilise for the audience. The \`{shown}/{total}\` counter beside the filter box gives immediate feedback on filter breadth — a sudden drop from 400 to 3 rows confirms the IP fragment matched.

Event pills derive dynamically from \`new Set(rawLogs.map(l => l.eventType))\` — the pill set grows as new event types first appear in the buffer. There is no time-range picker in Live Feed; temporal narrowing requires reading timestamps manually or pivoting to **Monitor → Attack Timeline**. Filters never stop server-side ingestion: pause freezes display via \`frozen\` state copy while \`rawLogs\` continues updating in SiemContext. Clear filters by emptying the input and selecting the **ALL** pill. Empty filter with a rare event pill may show **NO MATCHING LOGS** despite a full buffer.`,
  'guides/monitor/live-feed/06-deduplication.md': `The dedupe window is hardcoded at 30 seconds in \`SiemContext.jsx\` — it compares new alert candidates against existing alerts sharing the same \`sourceIp\` and first matched \`ruleId\`. Suppressed alerts never reach \`setAlerts\` or SQLite persistence, which is why Live Feed row counts can exceed Overview alert counts during brute-force storms.

Forensic investigations often disable dedupe temporarily so every rule firing creates a durable alert record for timeline accuracy. Document dedupe state in incident notes: "Dedupe ON during triage; disabled 14:32 UTC for legal hold export." Re-enable after export to restore operational focus.

Live Feed itself has no dedupe toggle — every validated log appends to \`rawLogs\` with tail slice at \`MAX_RAW_LOGS\`. The Overview **[ DEDUPE: ON/OFF ]** button controls alert creation only. When teaching the distinction, run simulate with dedupe on: many similar \`auth-failure\` lines appear in Live Feed while Overview shows fewer alert rows. Dedupe compares against \`engineRef.current.alerts\` historical store; admin **CLEAR ALL** resets that store. Simulated and real alerts dedupe together if same IP and rule within the window.`,
  'guides/monitor/live-feed/07-pagination-performance.md': `Live Feed deliberately avoids pagination because SOC tail-following requires continuous visibility of the newest events. The \`bottomRef\` sentinel triggers \`scrollIntoView({ behavior: 'smooth' })\` when \`autoScroll\` is true and new logs arrive — analysts scrolled up in history will not be jumped unless they re-enable auto-scroll or manually return to the bottom.

Table view adds a sticky header (\`sticky top-0\`) so column labels remain visible during long scroll sessions. Performance is bounded by \`MAX_RAW_LOGS = 500\` in SiemContext — the UI stats panel references 300 as a visual denominator, but the actual slice cap follows the context constant.

There is no virtualisation library — \`filtered.map\` renders every row in the DOM. Demo-scale volumes stay laptop-safe; production-scale SIEMs would adopt windowed rendering. No "new events above" indicator exists when scrolled up — watch the processed counter in the toolbar for silent arrivals. Selected row highlight uses array index as React \`key\`, so re-filtering may shift indices and jump selection. Smooth scroll during high EPS can fight manual scrolling — pause before historical review. Head truncation drops oldest events silently when buffer fills; save critical lines to case notes early.`,
  'guides/monitor/live-feed/08-first-five-minutes.md': `Experienced analysts pre-position Live Feed on a secondary monitor before shifts start, with auto-scroll enabled and pause muscle memory ready. When Overview fires a critical toast, the workflow is: copy \`sourceIp\` from toast text, switch to Live Feed, paste into filter, confirm event-type sequence (scan before auth before exfil), pause, screenshot, copy unique fields from **LOG DETAIL**, then escalate with alert UUID and ISO timestamp from the detail panel.

If the buffer has rotated past the birth event, \`AlertDetailModal\` on Overview still embeds the original \`log\` object — do not assume Live Feed always retains the first line of an attack. Cross-reference modal log JSON with filtered feed rows when both exist.

Minute-by-minute discipline: minute 0–1 confirm **LIVE** status and filter alert IP; minute 1–2 identify first attacker timestamp in detail ISO time; minute 2–3 apply event-type pill matching hypothesis; minute 3–4 pause and capture screenshots; minute 4–5 decide escalate, block, or hunt. Avoid immediate IP blocks from a single log line — confirm pattern density first, then **Intelligence → IOC Watchlist** or **Respond → SOAR**. Concurrent analysts filtering different IPs see different subsets from the same buffer — coordinate verbally. Mixed simulated and real traffic requires checking \`_simulated\` in detail before external escalation.`,
  'guides/monitor/timeline/02-kill-chain-basics.md': `Attack Timeline reads \`alerts\` and \`incidents\` from \`useSiem()\` — it never plots raw logs. Default window is **1 HR** (\`TIME_WINDOWS[2]\` in \`AttackTimeline.jsx\`). Toolbar shows \`{N} events · {M} lanes\` after filters apply. The green dashed **NOW** line anchors recency at the right edge of the SVG canvas.

Educators can narrate simulate-campaign output on Timeline while students watch lanes populate: brute-force dots appear first, web exploitation categories follow, exfiltration and privilege-escalation lanes appear last — mirroring kill-chain ordering without explicit phase labels on the Y-axis.

Lockheed Martin Cyber Kill Chain stages (reconnaissance through actions on objectives) provide conceptual vocabulary; HABIBI-SIEM maps phases interpretively via \`matchedRules[].category\` in \`rules.js\`. **GROUP: RULE** reveals technique spread; **GROUP: IP** reveals actor-centric tempo. Empty state reads \`NO EVENTS IN THIS TIME WINDOW — START INGESTION\`. MITRE ATT&CK metadata appears in alert detail modal, not as ATT&CK navigator lanes on the chart. No playback animation — static snapshot refreshes when the \`alerts\` array changes in React state.`,
  'guides/monitor/timeline/03-mapping-events-to-phases.md': `Lane assignment uses \`matchedRules[0]?.ruleName\` when **GROUP: RULE** is selected — secondary rule matches on the same alert do not create additional lanes. This is a display simplification: the full rule list remains in \`AlertDetailModal\`. When teaching phase mapping, open the modal on a selected dot to read MITRE technique lines alongside the lane label.

Simulate campaign timing (0ms brute-force, 1500ms SQLi, 3000ms XSS, 4500ms brute-force repeat, 5500ms exfil, 6500ms privilege-escalation) produces a left-to-right narrative on **GROUP: RULE** that instructors can point to while explaining detection coverage across the kill chain.

Each rule in \`detectionRules\` declares \`category\`, \`stride\`, and optional \`mitre\` metadata. Phase mapping quality equals rule taxonomy quality — vague categories produce vague stories. Multi-IP attacks split across parallel lanes under **GROUP: IP** unless correlation bands link the time span. Unknown rule fallback string \`'unknown'\` appears if \`matchedRules\` is empty — rare but breaks narrative flow. Document phase sequences in incident tickets using rule category nouns executives understand: "credential access followed by web exploitation and exfiltration."`,
  'guides/monitor/timeline/04-timeline-visualisation.md': `The SVG uses \`viewBox="0 0 900 {dynamicHeight}"\` with \`LANE_H=28\`, \`LANE_GAP=4\`, and \`LABEL_W=130\` for right-aligned lane labels truncated at 16 characters plus ellipsis. Dots use radius 5px, expanding to 7px on hover/select with an SVG glow filter. \`toX(ts)\` linearly maps timestamps: \`LABEL_W + ((ts - minTime) / range) * INNER_W\`.

Incident bands render as translucent rectangles spanning \`firstSeen\` to \`lastSeen\` for correlated incidents whose \`firstSeen >= minTime\`. They sit behind event dots, giving background context for sustained activity versus isolated spikes. Severity breakdown bars in the right panel compute independently from lane layout — useful when too many lanes make the canvas unreadable.

X-axis tick labels use HH:MM:SS for windows ≤1 HR, otherwise month/day HH:MM. **SEV:** filter chips intersect with time window before lane grouping. Hover sets \`hovered\` alert id; click toggles \`selected\` for the detail panel — selected takes precedence over hovered in the right sidebar. Vertical grid lines aid time estimation. \`svgRef\` is captured but no pan/zoom handlers attach — preset windows only, no drag-zoom in v4. SVG scales width 100% with minWidth 600 for narrow screens.`,
  'guides/monitor/timeline/05-why-timeline-beats-lists.md': `Alert Manager sorts by \`timestamp\` descending in text — excellent for triage actions but poor for burst detection. Timeline adds a Y dimension: same timestamp on different IPs appears as parallel dots on separate lanes, instantly revealing coordinated activity versus a single noisy host.

War-room practice: project Timeline with **GROUP: IP** during standups, then switch to Alert Manager for ACK/RES work. The two views are complementary, not interchangeable — Timeline for story, Manager for queue hygiene. Colour-blind team members should pair dot colours with the numeric **SEVERITY BREAKDOWN** panel on the right.

Gestalt proximity and similarity principles explain faster burst detection when dots cluster visually versus scanning ISO timestamps in a table. Timeline answers "burst vs slow-burn" instantly; flat lists require mental plotting. Too many lanes collapse readability — apply **SEV** filter before executive screenshots. Identical timestamps across lanes may stack dots vertically — hover carefully to select the intended alert id. No alternate list view exists inside Timeline — navigate via sidebar to Alert Manager for queue work.`,
  'guides/monitor/timeline/06-cross-source-correlation.md': `HABIBI-SIEM v4 correlates at the alert layer via \`correlateAlerts()\`, not by joining raw multi-index logs. Firewall deny alerts and AD auth alerts appear on the same IP lane only when both produced alert objects with shared \`sourceIp\` within the time window. Missing ingest from one source means missing dots — Timeline cannot invent cross-source fusion.

For deeper graph-style correlation, pivot to **Investigate → Event Graph** or **Network Map** after Timeline identifies temporal colocation. Pipeline Health source cards help explain coverage gaps: if EDR shows DEGRADED while web logs flow, endpoint-stage dots may be absent from Timeline despite network-stage activity.

There is no **GROUP: source** toggle — only ip, rule, severity. \`CATEGORY_WINDOW_MS = 120_000\` in correlationEngine supports category waves across IPs but Overview incident cards emphasise IP clusters. NAT collapses many hosts behind one lane; Tor rotation splits one actor across lanes. Incident bands signal IP-time clustering of alerts — often cross-rule, not guaranteed cross-source. Validate coverage by comparing expected log sources on Pipeline Health against absent rule lanes on Timeline.`,
  'guides/monitor/timeline/07-lateral-movement-on-timeline.md': `Lateral movement on Timeline appears as sequential activity across **GROUP: IP** lanes (new host lanes appearing after initial compromise) or as escalating rule categories on a single IP lane (auth failures followed by privilege-escalation dots). There are no drawn edges between hosts — analysts infer pivot paths by comparing lane timestamps manually.

Expand **WINDOW** to **6 HR** for slow pivot campaigns; the default **1 HR** may hide gaps longer than sixty minutes between stages. Combine Timeline IP lanes with Overview **TOP ATTACKERS** to prioritise containment on the host showing the latest activity.

Simulate campaign includes \`privilege-escalation\` and \`data-exfil\` steps for demo narrative. Rules for privilege escalation, command execution, and internal port scans fire like any other detection. **Investigate → Network Map** and **Event Graph** provide graph edges Timeline lacks. Single IP proxy masks lateral hosts behind one lane. Internal IPs plot normally but receive lower base threat scores on Overview — do not ignore internal movement based on score alone. Contain the host tied to the latest lane activity after documenting sequence for the incident report.`,
  'guides/monitor/timeline/08-for-non-technical-managers.md': `Executive briefings should use three sentences anchored to Timeline visuals: when activity started (leftmost dot cluster), when it peaked (densest cluster), and whether it is ongoing (latest dots near the green **NOW** line). Filter **SEV: CRITICAL** and **HIGH** before screenshots to reduce noise. State the timezone used in tick labels — \`fmtTime()\` renders local browser time, not UTC.

Pair Timeline PNG with Overview **GEN REPORT** plain-text summary for a one-page briefing pack. Label simulated exercises explicitly — **SIM** badges appear on Overview alert rows if executives drill into detail.

Provide a legend in email captions: colour equals severity, horizontal axis equals time, each lane equals attacker IP or technique name. **INCIDENT BANDS** panel lists up to six incidents with clock times in plain \`toLocaleTimeString()\` format. Pause external comms until incident commander approves Timeline screenshot — reduces contradictory messaging. Dense lanes overwhelm executives — simplify filters aggressively before board presentations. No built-in PDF timeline export in v4 — OS screenshot or browser capture tools suffice for slide decks.`,
  'guides/monitor/timeline/09-exporting-timeline.md': `Rebuild Timeline externally from exported alert JSON using \`timestamp\`, \`sourceIp\`, \`severity\`, and \`matchedRules[0].ruleName\` columns. Spreadsheet pivot tables or GRC tools can approximate lane layout. Incidents are computed client-side only — export alerts and document \`IP_WINDOW_MS = 60000\` in the report methodology section.

Mid-incident workflow: JSON export from Overview or Alert Manager before any admin **CLEAR ALL** action preserves point-in-time evidence even if UI state is wiped. Screenshot Timeline with window and group controls visible in frame for human-readable exhibits.

Legal hold requires immutable, timestamped artifacts — chain of custody matters more than pretty charts. \`exportReport()\` on Overview summarises counts but not dot coordinates. Copy selected event fields from Timeline right panel into incident documents. CSV export uses \`csvEscape\` for formula-injection safety when opened in Excel. Large JSON exports include full alert history — post-filter by time window in external tools. Future \`exportTimelinePNG()\` would require SVG-to-canvas serialization — a documented feature gap versus enterprise SIEMs.`,
  'guides/monitor/alert-manager/02-alert-lifecycle.md': `Alert Manager header reads \`>> ALERT MANAGER // FULL ALERT LIFECYCLE MANAGEMENT\` with a live \`{filtered}/{total} RECORDS\` counter. Status transitions call \`updateStatus(id, status)\` in SiemContext, which requires \`canWrite\` (tier2+). \`clearAlerts\` requires \`canAdmin\` (tier3/manager). Tier1 and auditor roles can view and export but cannot mutate alert state — restricted actions no-op silently in the UI while the SQLite backend also enforces permissions on API routes.

Resolved rows render at 40% opacity (\`opacity-40\` in AlertManager.jsx) — they remain in exports and counts until cleared. Watchlisted status from SOAR auto-block may appear as nonstandard status strings; treat these as enriched lifecycle states requiring SOAR console review.

Three UI statuses exist: \`new\`, \`acknowledged\`, \`resolved\`. There is no \`investigating\` or \`false positive\` enum — false positive is operational meaning applied in external case notes. ACK signals ownership; RES signals closed investigation. Bulk bar appears when checkboxes selected: \`{N} SELECTED\`, **[ ACK ]**, **[ RESOLVE ]**, **[ CANCEL ]**. No UI reopen for resolved alerts in v4. Status stored lowercase internally, displayed \`.toUpperCase()\` in the table. Auditors trace response maturity through status histograms exported from CSV.`,
  'guides/monitor/alert-manager/03-alert-record-fields.md': `CSV export columns from \`exportAlerts()\`: id, timestamp ISO, sourceIp, severity, status, eventType, rules joined by pipe, stride from first matched rule. JSON export includes the full alert object with embedded \`log\`, \`geo\`, \`simulated\`, and \`ecsCompliant\` flags. The table truncates rule names for width — always open \`AlertDetailModal\` via Overview row click for MITRE lines and complete \`matchedRules[]\` arrays.

Time column shows HH:MM:SS UTC slice from ISO timestamp — overnight shifts crossing midnight should reference full ISO in modal or export for unambiguous chronology.

Alert objects carry UUID \`id\`, \`timestamp\`, \`sourceIp\`, \`severity\`, \`status\`, \`eventType\`, \`matchedRules[]\`, embedded \`log\`, optional \`geo\`, \`simulated\`, \`ecsCompliant\`, \`soarWatchlisted\`. Assigned analyst and inline notes are not implemented — use **Respond → Case Manager** for assignee and notes arrays. Server audit logs API mutations; UI lacks per-alert history timeline. Investigations fail when rule context and raw evidence scatter — centralise via modal and JSON export for ticket attachment.`,
  'guides/monitor/alert-manager/04-mitre-att-and-ck.md': `\`services/rules.js\` stores optional \`mitre: { technique, tactic, name }\` on each detection rule. \`AlertDetailModal\` resolves the full rule by \`ruleId\` and renders green technique codes with tactic/name lines. Alert Manager search matches rule name text only — searching \`T1110\` will not find brute-force alerts unless the ID appears in the rule name string.

Industry playbooks map techniques to actions: credential access techniques trigger password resets and auth audits; exfiltration techniques trigger DLP and egress blocks. Document technique IDs in case notes for weekly trending ("T1110 spike this week").

MITRE ATT&CK is shared adversary-behaviour vocabulary across vendors — not a replacement for reading matched log fields. Severity comes from rule config, independent of ATT&CK tactic. Most demo rules include MITRE metadata; custom rules may omit. **Investigate** modules may expose matrix views when enabled — Manager remains the triage table, modal the detail layer. Multiple matched rules mean multiple techniques — address highest severity first. Static rule files may drift from current MITRE releases — verify technique IDs externally during audits.`,
  'guides/monitor/alert-manager/05-bulk-actions.md': `\`toggleAll\` selects all **filtered** rows, not the entire alert database — hidden new alerts outside current filters remain unselected. Header **[ ACK ALL NEW ]** ignores filters and acknowledges every \`status === 'new'\` alert globally — use only at shift start with manager approval. Bulk **[ RESOLVE ]** works on any non-resolved selection without requiring prior ACK.

Export buttons dump the entire alert array regardless of checkbox selection — there is no "export selected only" in v4. Mid-storm workflow: filter HIGH severity noise, bulk ACK after spot-check, keep NEW tab open for fresh criticals.

Bulk ACK iterates selected IDs sequentially — concurrent editors may race. There is no undo — revert would need manual API changes unavailable in UI. Tier1 cannot bulk mutate. **[ CLEAR ALL ]** is admin-only and wipes SQLite alert store after export. Alert fatigue during DDoS or scan storms makes bulk essential — policy must forbid bulk ACK on criticals without review. Checkbox uses native input styled \`accent-matrix\` — no indeterminate partial-page state across pagination because Manager has no pagination.`,
  'guides/monitor/alert-manager/06-suppression-and-tuning.md': `Feedback loop: identify noisy rule in **RULE(S)** column → **Configure → Rules Engine** disable or threshold adjust (admin) → resolve false-positive batch in Manager with external documentation → monitor NEW tab rate decrease. Overview **[ RULES: PAUSE ALL ]** stops new detections but existing Manager rows remain until cleared — do not interpret an empty NEW tab during pause as "environment clean."

Resolving an alert does not suppress future firings — identical log patterns re-create alerts if the rule remains enabled. True suppression requires rule tuning, dedupe, or ingest exclusion at the source.

Alert Manager lacks explicit per-alert snooze — tuning happens upstream. Overview **[ DEDUPE: ON/OFF ]** collapses repeat IP+rule pairs within 30 seconds. IOC watchlist enforcement escalates or blocks rather than suppressing silently. Schedule retro review of paused rules so detections return after maintenance. False positives erode trust → ignored Manager queue → missed real threats. Export example alert IDs as JSON when requesting engineering rule changes — gives reproducible evidence for threshold discussions.`,
  'guides/monitor/alert-manager/07-sla-timers.md': `Implementing SLA timers in a future version would require persisting \`firstAckAt\` on status transition inside \`updateStatus\`. Today, audit API mutation logs may timestamp server-side changes — check backend audit documentation for retro SLA proof. ISO 27001 A.16.1.5 incident response timing evidence is process-dependent, not tool-dependent.

Operational workaround: sort Alert Manager by **TIME** ascending on NEW + CRITICAL filter, verbally escalate any row older than ten minutes untouched. Post-incident, compute (ack_time − created_time) in spreadsheet from CSV export.

HABIBI-SIEM Alert Manager does not display SLA timers, time-to-acknowledge countdowns, or breach indicators in v4. Proxy metrics: compare alert \`timestamp\` to wall clock manually; track \`status === 'new'\` duration externally. Overview **UNREAD** count serves as queue-depth SLA proxy. SOAR log timestamps actions but does not drive alert-row clocks. Define org SLAs externally (e.g. critical 15-minute ack) and flag breaches in case management. Do not claim tool-enforced SLA in audits without verifying features exist. Clock skew affects manual math — use UTC ISO fields from CSV export.`,
  'guides/monitor/alert-manager/08-alert-vs-case.md': `\`createCase(alertId, title)\` in SiemContext writes to SQLite via \`api.saveCase\` with a single optional \`alertId\` reference. Escalation criteria: multi-technique campaign, critical severity cluster, or business asset impact. Hierarchy: many logs → fewer alerts → fewer computed incidents → optional human case. Closing all alerts without a case record loses longitudinal narrative for legal review.

Admin **CLEAR ALL** wipes alerts but may orphan case \`alertId\` references — export before cleanup and update case notes with preserved UUIDs.

Alert Manager has no **Create Case** button — escalation is deliberate navigation to **Respond → Case Manager**. One case links one \`alertId\` in current schema; additional alerts referenced via notes manually. Resolving alerts does not close cases — independent statuses. Not every alert warrants a case — noise resolves without binder; P1 campaigns need case within ~15 minutes of confirmed breach. Incidents on Overview are computed ephemeral summaries; cases are persisted investigations with assignee, priority, and notes. Tier1 may lack case write — verify \`canWrite\` before escalation workflows.`,
  'guides/monitor/pipeline-health/02-pipeline-end-to-end.md': `Clicking pipeline stage chips in \`PipelineHealth.jsx\` reveals \`desc\` text from the \`PIPELINE_STAGES\` constant. Normalization stage shows ECS compliance % when selected; Detection stage shows alerts-raised ratio. All stages execute inside \`processLogs()\` on a single client-server round trip — they are logical labels, not separate microservices.

Mitigation stage triggers \`soarCheckIp()\` on critical/high external alerts when AbuseIPDB keys are configured, and may auto-watchlist IPs scoring above \`SOAR_THRESHOLD = 75\`. Failure of SOAR APIs does not stop ingestion but affects downstream response visibility in **Respond → SOAR Console**.

Stages in order: Ingestion (raw receipt), Normalization (ECS mapping), Enrichment (GeoIP/threat intel), Detection (STRIDE rules), Alert Dispatch (UI + SOAR trigger), Mitigation (AbuseIPDB + auto-block). Log source matrix below simulates nine enterprise source types with proportional EPS shares. Real metrics from SiemContext include \`eps\`, \`epsHistory\`, \`logsProcessed\`, \`rawLogs\`, \`alerts\`. If EPS stays zero while hunting threats, check **Ingest → Log Ingestion** before interpreting empty Overview as safe.`,
  'guides/monitor/pipeline-health/03-pipeline-metrics.md': `EPS computation in \`processLogs()\`: count timestamps in sliding \`EPS_WINDOW_MS = 5000\` window, divide by seconds. \`epsHistory\` appends \`{t, v}\` each batch, keeping roughly 60 points for the sparkline. Gauge \`maxEps = 200\` is a visual scale — colour thresholds at 45% (ELEVATED) and 75% (CRITICAL LOAD) of that reference.

\`noiseRatio = round((1 - alerts.length / max(logsProcessed,1)) * 100)\` — higher percentage means fewer alerts per log. Interpret alongside rule enablement: high noise with zero alerts may mean paused rules; low noise with many alerts may mean aggressive detections or active attack.

**PROCESSED** uses \`logsProcessed.toLocaleString()\`. **ECS COMPLIANT** counts buffer logs with \`@timestamp\` or \`event.kind\`. Sparkline SVG polyline normalizes to \`sparkMax\` in history. Per-source EPS splits total with random jitter — educational, not SNMP-backed. Parse error rate is not displayed numerically — infer from validation failures. Target ECS near 100% on structured ingest; sub-90% triggers parser review with engineering.`,
  'guides/monitor/pipeline-health/04-pipeline-as-security-control.md': `Shift checklist: open Pipeline Health before declaring green status on Overview. Dual signal — EPS trend drop plus Overview alert drought — increases confidence of a blind spot versus a genuinely quiet environment. Document pipeline outages as security incidents when prolonged; attackers disabling logging is a control failure, not merely an IT ticket.

Real-world precedents: ransomware groups clearing Windows Event Logs; cloud attackers removing CloudTrail trails. HABIBI-SIEM does not auto-fire pipeline-stall alerts in v4 — human observation required. Production deployments should add collector heartbeat monitoring beyond this demo UI.

ISO 27001 logging controls, PCI DSS 10.x, and NIST AU family require log continuity assurance. Pipeline view answers "are we blind?" before "are we hacked?" If alerts stop during a known attack, check EPS trend for ingestion cliff — may indicate pipeline failure not attacker pause. Simulated campaigns spike EPS without reflecting real source health — distinguish demo from production monitoring. Platform/engineering split ownership: analyst detects anomaly, engineer restores forwarders.`,
  'guides/monitor/pipeline-health/05-log-source-status.md': `Health rules in \`sourceStats\` useMemo: \`degraded\` when \`actualEps === 0 && rawLogs.length === 0\`; \`warning\` when actual falls below 30% of expected; \`overload\` when actual exceeds 150% of expected; else \`healthy\`. Expected EPS weights (NGINX 80, Suricata 30, EDR 15, etc.) define proportional share of total EPS with random jitter — re-renders change latency ms slightly; do not treat as stable SLO.

Adding sources requires editing \`LOG_SOURCES\` in \`PipelineHealth.jsx\` — not available in Settings UI. Global zero logs marks all nine cards degraded simultaneously, indicating total outage rather than single-source failure.

Nine named cards mimic enterprise diversity: Perimeter Firewall, Suricata IDS, NGINX/Apache web, SSH Auth, Active Directory, PostgreSQL Audit, CrowdStrike EDR, Exchange Mail. Partial outage pattern: firewall EPS zero but web logs flowing narrows troubleshooting to one collector path. OVERLOAD on mail logs may appear during phishing wave simulations. Escalate to log source owner with source name, badge state, and timestamp screenshot. \`dropPct\` computed on overload but not displayed — potential future packet-loss metric.`,
  'guides/monitor/pipeline-health/06-parser-errors.md': `When \`api.validateLogs()\` rejects a batch, \`processLogs\` logs \`[siem] log validation failed\` to console and returns empty — no buffer append, EPS unchanged. ECS compliance counts logs in \`rawLogs\` possessing \`@timestamp\` or \`event.kind\`. Empty buffer shows 100% ECS vacuously — always ingest a known-good sample before trusting compliance green.

Analyst escalation path: capture failing line from Log Ingestion UI error message, attach to engineering ticket, reference validation whitelist in backend documentation. Re-ingest fixed schema and watch ECS recover on Pipeline Health Normalization stage click-through.

Parser failure is silent in Pipeline Health numerically — proxy via ECS drop and missing Live Feed rows. \`logParsers.js\` and server validate module define acceptable shapes. Low ECS often means missed detections because rules match structured fields. Simulated logs are usually ECS-compliant by generator design — production plain syslog may fail without parser config. Keep original files externally; pre-normalisation text is not retained in Live Feed after validation replaces events.`,
  'guides/monitor/pipeline-health/07-capacity-planning.md': `Demo architecture caps: \`MAX_RAW_LOGS = 500\` buffer, SQLite persists last 1000 alerts, detection engine runs synchronously in-browser after API validation. Sustained load test: record EPS at NOMINAL → ELEVATED boundary on target hardware. Production build (\`npm run build\`) performs faster than Vite dev mode — capacity tests should use production artifacts.

During DDoS, OVERLOAD badges justify emergency tuning (pause nonessential rules) with manager approval — trading detection breadth for UI stability. Alert storms add React re-render load separate from ingest EPS; monitor both gauge and Overview feed responsiveness.

Exceeding throughput drops oldest buffer events via tail slice and may lag UI repaint linearly with row count — no queue depth metric exposes backlog explicitly. \`maxEps=200\` gauge reference is arbitrary UI scale, not hard platform limit. Measure empirically on deployment target; repo lacks formal EPS benchmark. Disk growth ties to alert count in SQLite, not EPS display alone. Sampling ingest, disabling noisy rules, and dedupe reduce load. Document hardware spec and date with each capacity test for ops runbook continuity.`,
};

const GENERIC_FILLER = /^### Operational interpretation|^### Accuracy guardrails|^### Throughput, resilience|^### Section-specific analyst checklist/m;

function stripFiller(body, keepSections = []) {
  const lines = body.split('\n');
  const out = [];
  let skip = false;
  for (const line of lines) {
    if (line.startsWith('### ')) {
      const title = line.slice(4).trim();
      if (GENERIC_FILLER.test(line)) {
        skip = true;
        continue;
      }
      if (keepSections.some((k) => title.startsWith(k))) {
        skip = false;
        out.push('', line);
        continue;
      }
      skip = false;
      out.push('', line);
      continue;
    }
    if (!skip) out.push(line);
  }
  return out.join('\n').replace(/\n---\s*$/, '').trim();
}

function normalizeHeadings(body) {
  const sections = [
    'What you are looking at',
    'What is happening underneath',
    'Why this matters',
    'Step-by-step walkthrough',
    'Common questions',
    'How an analyst uses this during an active incident',
    'Edge cases and gotchas',
  ];
  let result = body;
  for (const s of sections) {
    result = result.replace(new RegExp(`\\*\\*${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*`, 'g'), `### ${s}`);
  }
  return result;
}

function extractSection(deepDive, heading, keepSections) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`## ${escaped}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`);
  const m = deepDive.match(re);
  if (!m) throw new Error(`Heading not found: ${heading}`);
  return normalizeHeadings(stripFiller(m[1].trim(), keepSections));
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function buildEssay({ module, sidebar, essay, body, includeScreenshot, screenshot, relPath }) {
  const expansion = EXPANSIONS[relPath];
  let fullBody = body;
  if (expansion) {
    fullBody = `${body}\n\n${expansion}`;
  }

  const shot = includeScreenshot
    ? `\n![${module} main view](https://raw.githubusercontent.com/mibrahim-cyber/SIEM-Dashboard-Documentation/main/screenshots/guides/${screenshot})\n`
    : '';

  return `---
module: ${module}
sidebar: ${sidebar}
section: Monitor
subsection: ${essay.title}
audience: All — technical and non-technical
last_updated: 2026-05-23
---

# ${essay.title}

**Part of:** Monitor → ${module}
**One-sentence focus:** ${essay.focus}
---
${shot}
${fullBody}
`;
}

const results = [];

for (const mod of MODULES) {
  const deepPath = path.join(GUIDES, mod.folder, '02-deep-dive.md');
  const deepDive = fs.readFileSync(deepPath, 'utf8');

  for (let i = 0; i < mod.essays.length; i++) {
    const essay = mod.essays[i];
    const relPath = `guides/monitor/${mod.folder}/${essay.file}`;
    const body = extractSection(deepDive, essay.heading, essay.keepSections || []);
    const content = buildEssay({
      module: mod.module,
      sidebar: mod.sidebar,
      essay,
      body,
      includeScreenshot: i === 0,
      screenshot: mod.screenshot,
      relPath,
    });
    const outPath = path.join(GUIDES, mod.folder, essay.file);
    fs.writeFileSync(outPath, content, 'utf8');
    results.push({ file: relPath, words: wordCount(content) });
  }
}

const under = results.filter((r) => r.words < 800);
if (under.length) {
  console.error('UNDER 800 WORDS:', under);
  process.exit(1);
}
console.log(JSON.stringify(results, null, 2));
