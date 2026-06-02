﻿# Risk scoring

HABIBI-SIEM exposes this capability under **Intelligence → Risk Scoring**. Risk scoring rolls up host and user risk numbers from alert severity mix, open incidents, and watchlist hits.

## What you see on screen

Ranked lists show top entities with numeric score and contributing factors in plain language.

## How data moves through the dashboard

Scoring recomputes when alerts or incidents change. Weights favor critical open alerts and repeated offenders.

## Day-to-day operator workflow

Use executive summaries by exporting top three entities with scores. Recalculate after major resolve actions to show risk reduction.

## Edge cases and false trails

Scores are relative within the session dataset, not industry benchmarks. New simulate bursts can spike scores temporarily.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Risk Scoring](../../guides/intelligence/risk-scoring/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
