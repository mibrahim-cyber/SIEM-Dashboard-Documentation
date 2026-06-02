﻿# Login

HABIBI-SIEM exposes this capability under **Auth gate**. Login establishes session cookie and CSRF token required for all mutating API calls afterward.

## What you see on screen

Username and password form; error banner on failure; redirect into Overview on success.

## How data moves through the dashboard

Server validates credentials, sets HTTP-only session, returns CSRF token JSON for client storage. Subsequent writes send header token.

## Day-to-day operator workflow

Use tier-appropriate accounts in RBAC labs. Log out between role tests to avoid cookie confusion.

## Edge cases and false trails

Default teaching passwords must be rotated for any internet-exposed host. Missing CSRF after login causes mysterious 403 on first save.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Settings](../../guides/ingest-config/settings/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
