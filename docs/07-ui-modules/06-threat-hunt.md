﻿# Threat hunt

HABIBI-SIEM exposes this capability under **Investigate → Threat Hunt**. Threat hunt supports ahead-of-time queries across stored alerts and templates for common attack stories (credential abuse, scanning, exfil patterns).

## What you see on screen

Template cards pre-fill filters; manual filters adjust IP, severity, time, and keyword fields. Results mirror Alert Manager rows with hunt-specific layout.

## How data moves through the dashboard

Hunt does not run a separate indexer; it filters in-memory alert state and any loaded log context. Templates encode institutional knowledge from prior incidents.

## Day-to-day operator workflow

Run a template after Simulate Campaign to teach new analysts how brute-force and scan patterns appear. Save interesting filters by note-taking outside the app if you need long-term reuse.

## Edge cases and false trails

Empty hunt results with visible Overview alerts mean your filter window is narrower than global state. Templates are starting points; stale IPs from old labs need manual clearing.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Threat Hunt](../../guides/investigate/threat-hunt/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
