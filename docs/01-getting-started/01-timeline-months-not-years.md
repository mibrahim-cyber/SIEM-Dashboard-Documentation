﻿# Development timeline

Phased build schedule for SIEM Dashboard.

---

## Phase 1; prototype (Month 1)

- Initial React SPA with client-side state
- Dashboard layout and navigation structure
- Vite development environment and API proxy configuration

**Archive:** `screenshots/00-project-start/`

---

## Phase 2; backend integration (Month 2)

- Express API server with SQLite persistence
- Session authentication (bcrypt, express-session)
- `/api/state` bootstrap endpoint

**Archive:** `screenshots/02-backend-build/`

---

## Phase 3, detection engine (Month 3)

- Ten STRIDE-aligned rules with MITRE ATT&CK mapping
- `DetectionEngine` class and correlation logic
- Mock log generator and simulate-campaign workflow

**Archive:** `screenshots/04-detection-engine/`

---

## Phase 4; UI expansion (Month 4)

- GeoMap. EventGraph, SOAR console, UEBA module
- Tailwind-based SOC theme
- Component library completion

**Archive:** `screenshots/03-frontend-build/`, `screenshots/06-ui-walkthrough/`

---

## Phase 5; security hardening (Month 5)

- RBAC enforcement audit across all endpoints
- CSRF protection and session regeneration
- Input validation whitelisting
- Penetration test documentation
- Publication of this documentation repository

**Archive:** `screenshots/05-security-hardening/`, `screenshots/07-pentest-sessions/`

---

## Resource constraints

Single-developer phased delivery. SQLite + Node monorepo for portable local iteration. See [development toolchain](02-tools-i-used.md) for tooling details and [SIEM industry notes](03-siem-industry-notes.md) for background on commercial platforms.
