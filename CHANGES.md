# Meridian-7 UI Refresh — Change Log

## Overview
Complete design system overhaul introducing a unified component library, custom cursor, sound effects, and consistent visual language across all pages.

## New Files

| File | Purpose |
|------|---------|
| `assets/cursor.js` | Custom cursor with glow trail, magnetic snap, and click burst effects |
| `assets/sounds/sounds.js` | Howler.js-based sound system with 6 ambient tracks and 8 UI sound effects |
| `assets/components.css` | 60+ reusable CSS components (buttons, cards, badges, toasts, modals, etc.) |
| `assets/components.js` | JavaScript handlers for interactive components (toasts, modals, tabs, etc.) |

## Rewritten Files

| File | Changes |
|------|---------|
| `assets/palette.css` | Full design token set: 50+ CSS custom properties for colors, spacing, typography, shadows, animations |
| `assets/siem-core.js` | GSAP master timeline, scramble text, ripple effect, magnetic hover, session state, achievement system |
| `experience-modules/shared/styles-base.css` | Unified game shell with consistent header, sidebar, and layout tokens |
| `index.html` | Landing page with animated hero, feature cards, and navigation |
| `experience-modules/index.html` | Hub page with 13 module cards in responsive grid |
| `brain/index.html` | Operations dashboard with live metrics, status bar, activity feed |
| `debrief.html` | Session summary with stats (time, pages, achievements, secrets) |
| `404.html` | Error page with "Signal Lost" theme |
| `500.html` | Error page with "System Error" theme |

## Updated Files

| File | Changes |
|------|---------|
| `sw.js` | Cache bumped to v23; added `components.css`, `components.js`, `cursor.js`, `sounds/sounds.js` to precache |

## Design System Highlights

### Colors
- **Primary**: Cyan (`#38bdf8`) — interactive elements, links, accents
- **Gold** (`#fbbf24`) — achievements, highlights
- **Red** (`#f87171`) — errors, critical alerts
- **Green** (`#4ade80`) — success, online status
- **Purple** (`#a78bfa`) — special/rare elements
- **Void** (`#020617`–`#0f172a`) — background layers

### Typography
- **Display**: Orbitron (headings, titles, brand text)
- **Mono**: IBM Plex Mono (body, labels, code)

### Spacing
- 8-step scale: `--space-1` (4px) through `--space-8` (64px)

### Components (60+)
- Buttons: `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-danger`, `btn-icon`
- Cards: `card`, `card--interactive`, `card--highlight`
- Badges: `badge`, `badge--success`, `badge--warning`, `badge--error`, `badge--info`
- Toasts: `toast`, `toast--success`, `toast--error`, `toast--warning`, `toast--info`
- Modals: `modal-overlay`, `modal`, `modal-header`, `modal-body`, `modal-footer`
- Tabs: `tabs`, `tab`, `tab-panel`
- Progress: `progress-bar`, `progress-fill`
- Forms: `input`, `textarea`, `select`, `checkbox`, `radio`, `toggle`
- Navigation: `nav-bar`, `nav-item`, `breadcrumb`
- Layout: `container`, `section`, `grid`, `flex-row`, `flex-col`
- Effects: `glow`, `scan-line-overlay`, `scroll-progress`, `back-to-top`
- Animations: `fade-up`, `fade-in`, `slide-up`, `scale-in`, `pulse`, `shimmer`

### JavaScript Features
- **GSAP Master Timeline**: Coordinated entrance animations on page load
- **Scramble Text**: Cyberpunk-style text reveal effect
- **Ripple Effect**: Click ripple on interactive elements
- **Magnetic Hover**: Buttons/link attraction toward cursor
- **Session State**: Tracks visited pages, session time, achievements
- **Achievement System**: Unlock tracking with localStorage persistence
- **Toast Notifications**: Stackable, auto-dismissing notifications
- **Modal System**: Accessible modal dialogs with focus trapping
- **Custom Cursor**: Glow trail, magnetic snap, click burst particles
- **Sound System**: Ambient tracks + UI sound effects via Howler.js

## Usage

All pages should:
1. Include `palette.css` and `components.css` in `<head>`
2. Include `siem-core.js` and `components.js` before `</body>`
3. Call `SiemCore.bootPage('page-name')` to initialize animations
4. Include `scan-line-overlay`, `scroll-progress`, and `back-to-top` elements
5. Use component classes (e.g., `btn-primary`, `card`, `badge`) for consistent styling
