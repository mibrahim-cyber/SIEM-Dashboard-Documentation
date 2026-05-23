---
module: Log Ingestion
sidebar: Ingest & Config → Log Ingestion
section: Ingest & Config
subsection: Log integrity and tamper evidence
last_updated: 2026-05-23
---

# Log integrity and tamper evidence

**Part of:** Ingest & Config → Log Ingestion
**One-sentence focus:** Preserving _raw lines, audit entries, and detection of anti-forensics events.

### What you are looking at

Log integrity features are mostly invisible in the Log Ingestion UI, they manifest as preserved **`_raw`** fields in event objects, server-side field stripping, audit log entries, and detection of tampering behaviors (e.g. Windows Event 1102 audit log cleared) rather than cryptographic hash chains. In preview, each parsed row corresponds to a `_raw` property holding the exact source line (or JSON string for structured sources). After ingest, Live Feed detail panels let analysts inspect normalized fields alongside the original line. There is no "integrity score" badge in Log Ingestion; trust comes from pipeline design and complementary rules.

### Why this matters

Court admissibility and IR reporting require demonstrating logs were not altered in transit. `_raw` preservation is the first step, parsed fields can be recomputed from originals. Stripping untrusted severity prevents injection attacks that SIEM vendors documented throughout the 2010s. Audit logs answer "who loaded data during the breach window?", a common compliance auditor question. Teaching analysts that preview ≠ cryptographically sealed teaches healthy skepticism: this demo implements baseline controls, not WORM storage or HMAC-chained blocks. Industry frameworks reinforce these themes. NIST SP 800-92 (*Guide to Computer Security Log Management*) recommends protecting log confidentiality and integrity from collection through analysis. PCI-DSS Requirement 10 expects time-synchronized, tamper-protected audit trails. While HABIBI-SIEM does not implement Merkle-tree chaining or RFC 5848 syslog signing, the combination of `_raw` retention, server-side field stripping, RBAC-gated validate, and **`LOGS_VALIDATED` audit rows** gives trainees a concrete checklist of controls to ask about when evaluating commercial platforms.

### Step-by-step walkthrough

1. Ingest Windows sample containing Event ID 1102; observe critical severity and `audit_log_cleared` action in preview.
2. Open Live Feed, select that event, locate `_raw` in detail JSON view.
3. As admin, fetch audit log: find LOGS_VALIDATED entry matching your session.
4. Attempt to manually edit a pasted JSON line adding `"severity":"low"` to obvious malware text. Ingest and verify server stripped severity before rules evaluate.
5. Compare `_raw` to table columns for Apache line, confirm byte-for-byte match with source paste.
6. Review detection rules for categories referencing log clearing or file tampering.

### Common questions

#### Are _raw fields hashed or signed?

Not in this build. Integrity is logical (preservation + audit), not cryptographic.

#### Can analysts edit _raw after ingest?

Not via UI. In-memory state could be tampered via DevTools; production systems persist append-only indices.

#### Does audit log capture event contents?

No: only action type, user, and summary counts. Full payload logging would recreate retention problems.

#### What about time tampering?

Apache/syslog date parsing trusts embedded timestamps. No NTP skew detection exists. Backdated logs appear at attacker-supplied times in timeline views.

#### How does CSRF protect log integrity?

Cross-site request forgery would let a malicious site POST forged events using an analyst's session cookie. Requiring `X-CSRF-Token` on `/api/ingest/validate` ensures only JavaScript originating from the dashboard origin. Where the token is issued at login, can submit batches. This is transport/session integrity, distinct from log content signing, but it closes a common web-SIEM gap.

### How an analyst uses this during an active incident

When opposing counsel or internal compliance questions data provenance, the analyst exports `_raw` fields from Live Feed detail alongside ingest audit entries showing analyst username and timestamp. If adversary cleared Windows logs (Event 1102), that event becomes a primary finding; ingested via Log Ingestion, preserved in `_raw`, and elevated by WEV_MAP severity. Cross-checking parsed IP against `_raw` line catches parser bugs that could misattribute attribution.

### Edge cases and gotchas

JSON `_raw` is re-stringified: key order may differ from original file (not byte-identical for JSON sources). Validation truncates extremely long `_raw`. truncation is one-way tampering for oversized lines. Read-only users bypass server sanitization when `canWrite` is false, integrity controls weaken under RBAC misconfiguration. Audit log rotates only by SQLite size limits; not shown in UI. CEF and syslog preserve line breaks only within single-line assumptions: multi-line stack traces may split incorrectly.

> **Technical note:** `structuredClone()` in sanitize creates deep copies. Mutations during detection do not retroactively alter validated snapshots already passed to geo enrichment.

### Original line preservation (`_raw`):

Every parser sets `_raw` to the verbatim input:

- Apache/syslog/CEF: full text line.
- JSON/Windows: `JSON.stringify(obj)` of the parsed object.
- Enables diffing parsed vs original if mapping bugs suspected.

### Server sanitization as integrity gate:

- Non-object rejection (prevents prototype pollution arrays).
- **`severity` deletion**, prevents attackers lowering perceived urgency.
- **`simulated` deletion**; prevents disguising malicious uploads as demo data.
- IPv4 validation; strips spoofed malformed IPs rather than accepting garbage.
- `_raw` length cap at 16,384 chars; prevents log bombing.

### Audit trail:

Each validate call writes `LOGS_VALIDATED` to SQLite `audit_log` with username, timestamp, and `{sanitized.length} events, {rejected} rejected` details, non-repudiation of who ingested what volume.

### Authentication and CSRF:

Write permission + CSRF token required for validate; anonymous or cross-site ingestion blocked.

### Detection of tampering behaviors:

While not integrity of the ingestion pipeline itself, parsers map Windows Event **1102** (`audit_log_cleared`) to `action: 'audit_log_cleared'` with critical severity: surfacing adversary anti-forensics in preview and post-ingest rules. File tampering rules in the detection rules catalog (`file-tampering` id) evaluate on mock generator paths; real ingested logs trigger if paths match sensitive patterns.

### ECS compliance flag on alerts:

`ecsCompliant: !!(a['@timestamp'] || a.event?.kind)` marks alerts tied to well-formed events. Weak signal of schema integrity.
