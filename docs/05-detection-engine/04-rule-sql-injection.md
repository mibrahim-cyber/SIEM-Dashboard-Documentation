﻿# Rule: SQL injection

Critical severity injection rule. Fires when web-bound fields contain classic SQL metacharacters or union-select style tokens in query parameters, bodies, or URL paths.

## Intent

Web attacks often probe forms and APIs with injected fragments. This rule scans normalized HTTP-related fields after Apache, JSON, or CEF parsing. Multiple pattern hits in one event still produce a single alert with this rule listed under matched rules.

## Analyst view

Alert severity may rise to critical when this rule wins the highest-severity tie among matches. Alert detail should show which field matched without echoing full malicious payload in tickets (copy from Live Feed if needed).

## False positives

Internal apps with legitimate query strings containing apostrophes can spike hits. Disable during parser debugging, tune with deduplication, or narrow lab samples. Not a substitute for parameterized queries at the application layer.

## MITRE

Technique T1190 Initial Access through exploitable public-facing application. Pair with MITRE Matrix view and STRIDE tampering category in correlation labs.

## Verification

Load Apache sample containing `/etc/passwd` or `UNION SELECT` style paths from Log Ingestion cards. Confirm rule hit bar moves and Overview critical count increments.

## Related

- [Rules overview](01-rules-overview.md)
- [Rules Engine guide](../../guides/configure/rules-engine/INDEX.md)
- [Sensitive path rule](09-rule-sensitive-path.md)
- [Sanitize pipeline](../06-log-ingestion/09-sanitize-pipeline.md)
