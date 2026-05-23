---
module: Settings
sidebar: Ingest & Config → Settings
section: Ingest & Config
subsection: Authentication settings
last_updated: 2026-05-23
---

# Authentication settings

**Part of:** Ingest & Config → Settings
**One-sentence focus:** Login sessions, CSRF tokens, SIGN OUT, and what Settings exposes about authentication.

### What you are looking at

Authentication in HABIBI-SIEM begins outside Settings on the full-screen Login form (Login screen): **HABIBI-SIEM** title, username and password fields, and a **SIGN IN** button that shows SIGNING IN… while submitting. Failed attempts surface a red-bordered error banner with the message from `the authentication layer.error`. Once authenticated, the main dashboard loads and Settings exposes session information only in the **ACCOUNT** card: your human-readable role label (e.g. Tier 2 Analyst), the permission matrix, and a **SIGN OUT** ghost button. There is no password change form, MFA toggle, or session timeout display on this page, the Settings module assumes you already passed login gating. The SIGN OUT control is deliberately understated (ghost button, 11px font) because it is a session terminator, not a configuration change. No "remember me" checkbox exists; session duration is entirely server-controlled.

### What is happening underneath

`AuthProvider` in authentication context wraps the application tree. On mount it calls `api.me()` (`GET /api/auth/me`) with cookie credentials. A valid session returns `{ user, csrfToken }`; invalid returns 401 and `user` stays null, routing you to Login. Login posts to `/api/auth/login` with `{ username, password }`; the server (server entry point) looks up the user via `findUser()`, verifies bcrypt hash, regenerates the session, stores `userId`, `username`, `role`, attaches a CSRF token, writes audit `LOGIN`, and returns `userPayload()` merging DB fields with `roleMeta()` permissions (`canWrite`, `canAdmin`, `canExport`). Sessions use `express-session` with cookie name `siem.sid`, `httpOnly: true`, `sameSite: 'lax'`, `maxAge: 8 hours`. Production requires `secure: true` cookies. `SESSION_SECRET` signs the cookie; default `dev-insecure-change-me` aborts startup in production. Logout (`Settings` → **SIGN OUT** → `logout()`) POSTs `/api/auth/logout` with CSRF header, audits `LOGOUT`, destroys the session, and clears client `user` state. Subsequent API calls return 401 until re-login. RBAC permissions on the session are fixed at login from the user's `role` column, they are not re-fetched on every request from a live permission service, though `/api/auth/me` re-reads the user row if the session is valid. CSRF tokens rotate on login and are required for all mutating routes (`requireCsrf` middleware compares `X-CSRF-Token` header to `req.session.csrfToken`). Failed login attempts audit as `LOGIN_FAILED` with the attempted username.

### Why this matters

Settings is where analysts confirm *who they are* in the system before performing admin actions elsewhere. Session hygiene underpins every other module: without valid auth, the shared dashboard provider refuses to load (`Loading SOC data…`) and `api.getState()` never runs. Auditors mapping access control to NIST AC family controls need to trace login → session cookie → permission middleware → UI gating as one chain. SIGN OUT is the only self-service session revocation exposed in the UI; there is no "active sessions" list for forcing logout of other devices. Understanding the eight-hour session window explains why overnight shifts may need re-authentication. Understanding CSRF explains why API scripts must capture tokens from login responses, not just cookies.

### Step-by-step walkthrough

1. Navigate to the dashboard URL, if unauthenticated, the Login form appears automatically.
2. Enter username and password (demo defaults: `manager` / `ManagerSIEM2026`, `analyst1` / `Analyst1Secure2026`, etc., rotate in production).
3. Click **SIGN IN**; wait for SIGNING IN… to complete and the dashboard shell to load.
4. Open Ingest & Config → Settings and verify Your Role matches expectations for your test account.
5. Perform work in other modules; the session cookie is sent automatically on same-origin requests (`credentials: 'include'` in API client layer).
6. When handing off a shared analyst workstation, return to Settings and click **SIGN OUT**.
7. Confirm you are returned to Login and protected routes no longer load data.
8. Optional: inspect server audit log for `LOGIN` / `LOGOUT` entries tied to your username.

### Common questions

#### Does settings let me change my password?

No. Password hashes live in the `users` table; there is no UI for rotation. Operators update passwords via direct DB maintenance or future admin tooling.

#### What happens if my session expires while I am on settings?

The next API call fails with 401; `the authentication layer.refresh()` on reload clears `user`. Unsaved threat keys typed but not saved are lost; checkbox preferences were already ephemeral.

#### Is multi-factor authentication supported?

Not in the shipped login form. Authentication is single-factor username/password plus session cookie.

#### Why do I need CSRF tokens if I already have a session cookie?

CSRF tokens prevent cross-site form posts from tricking a logged-in browser into mutating SIEM state. API client layer attaches `X-CSRF-Token` on POST/PUT/PATCH/DELETE after the first response supplies `csrfToken`.

#### Can I be logged in as two roles simultaneously?

No. One session, one role. Multiple browser profiles or incognito windows can hold different sessions for testing RBAC.

### How an analyst uses this during an active incident

Before escalating a destructive action, the analyst opens Settings to confirm they are signed in as the intended account; shared SOC stations often stay logged in as the previous shift's user. If they are Tier 1 and need alert clearance, they SIGN OUT and ask a Tier 3/manager to authenticate rather than sharing passwords. After incident closure on a shared machine, SIGN OUT is mandatory to prevent the next analyst inheriting export or admin rights visually but not contextually. During API integration testing, engineers capture CSRF + cookie from login once, then automate threat tests separately from the Settings UI.

### Edge cases and gotchas

Login rate limiting (`authLimiter`: 20 attempts per 15 minutes) can lock out brute-force tests: wait or restart server in dev. `LOGIN_FAILED` audits even for nonexistent usernames. Do not use real employee names in pentest scripts on production. Session regeneration on login invalidates old session IDs, good for fixation defense but confusing if you had two tabs mid-request. The Login form trims username/password on submit; trailing spaces in passwords fail silently. Settings does not display CSRF or session expiry countdown; operators learn expiry only when actions fail.

> **Technical note:** `userPayload()` spreads `roleMeta(user.role)` onto the client user object; `the SIEM context pipeline` reads `user?.role` as `currentRole` while permissions come from the authentication layer destructuring.
