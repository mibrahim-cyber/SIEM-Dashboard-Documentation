﻿# UEBA

HABIBI-SIEM exposes this capability under **Investigate → UEBA**. User and entity behavior analytics highlights outliers in login volume, odd hours activity, and new source IPs per user label.

## What you see on screen

Cards rank users or entities with z-score style emphasis and sparkline hints. Baseline language explains what normal looked like for the session dataset.

## How data moves through the dashboard

UEBA recomputes from alert and auth-flavored log fields already in memory. It is a teaching overlay, not a separate machine-learning cluster.

## Day-to-day operator workflow

After brute-force simulations, confirm the attacking IP surfaces as an entity outlier. Use with Rules Engine brute-force rule hits for a coherent story.

## Edge cases and false trails

Short sessions lack baseline depth; first-run spikes are exaggerated. Service accounts with bursty cron jobs look malicious without context labels.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Ueba](../../guides/investigate/ueba/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
