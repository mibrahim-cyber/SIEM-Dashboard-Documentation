# Performance Budget — Meridian-7 Site

Lighthouse targets: Performance ≥90, Accessibility ≥95, Best Practices 100, SEO ≥90.

| Metric | Target | Strategy |
|--------|--------|------------|
| Initial JS (per page) | < 80kb gzipped | Inline MVP scripts; defer heavy CDN |
| Three.js pages | < 180kb gzipped | Dynamic import where possible |
| Total CSS | < 12kb gzipped | Inline critical; palette.css shared |
| First Contentful Paint (FCP) | < 0.8s | preconnect fonts + CDN |
| Time to Interactive | < 2.0s | Loading screen min 800ms |
| Canvas frame rate | 60fps target | CanvasLoop visibility pause; DPR cap 2 |
