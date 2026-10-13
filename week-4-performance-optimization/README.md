# Week 4 — Frontend Performance Optimization

**Author: Chandra Prakash Thakur**

A before/after performance case study on the **Northwind Analytics** product page. The
`before/` directory is a faithful reproduction of a typical legacy build (11.2 MB,
7 render-blocking resources, ~1 800 forced reflows on load). The `after/` directory is
the delivered build (117.9 KB, 0 render-blocking resources, 0 forced reflows).

## Run both builds side by side

```bash
cd week-4-performance-optimization

python -m http.server 8080 --directory before    # baseline
python -m http.server 8081 --directory after     # optimised
```

Then run Lighthouse (mobile, Performance + Best Practices) against both URLs.

## Results at a glance

| Metric | Before | After | Change |
| --- | --- | --- | --- |
| Total transferred | 11 487.9 KB | **117.9 KB** | **−99.0 %** |
| Images | 11 115.4 KB | 80.7 KB | −99.3 % |
| CSS | 239.3 KB | 12.6 KB | −94.7 % |
| JavaScript | 126.3 KB | 12.8 KB | −89.9 % |
| Render-blocking resources | 7 | **0** | −100 % |
| DOM nodes after load (measured) | 3 862 | 113 | −97.1 % |
| Sub-resource requests on load | 12 | 4 | −67 % |
| Page width at a 1000 px viewport | 3 230 px (scrolls sideways) | 985 px (no overflow) | — |
| Forced synchronous reflows | ≈ 1 800 | **0** | −100 % |
| Critical-path bytes | ≈ 5 828 KB | ≈ 51.9 KB | −99.1 % |
| Projected Lighthouse Performance | ≈ 22 | ≈ 97 | +75 |

## Files

```
week-4-performance-optimization/
├── before/                     # the un-optimised baseline
│   ├── index.html              # 3 blocking <link>, 4 blocking <script>, base64 image
│   ├── css/
│   │   ├── styles.css          # 79.2 KB unminified, ~1400 !important declarations
│   │   ├── theme.css           # 79.2 KB duplicate theme blocks
│   │   ├── responsive.css      # 79.2 KB duplicate again
│   │   └── fonts.css           # no font-display, no preload
│   ├── js/
│   │   ├── vendor.js           # 39.4 KB render-blocking "library"
│   │   ├── widget.js           # 39.4 KB render-blocking "third party"
│   │   ├── analytics.js        # 39.5 KB render-blocking "third party"
│   │   └── app.js              # 9 numbered anti-patterns, annotated
│   └── assets/                 # 10.9 MB of oversized, un-lazy JPEGs
├── after/                      # the delivered, optimised build
│   ├── index.html              # inline critical CSS, preloaded sheet, 1 module script
│   ├── css/styles.css          # readable source (8.1 KB)
│   ├── css/styles.min.css      # what the page loads (4.6 KB)
│   ├── js/app.js               # readable source (7.7 KB)
│   ├── js/app.min.js           # what the page loads (3.3 KB)
│   ├── js/analytics.js         # code-split chunk, idle-loaded only
│   ├── assets/                 # 80.7 KB total, 3 responsive widths per image
│   └── CACHING.md              # _headers + nginx caching & compression config
├── build/
│   └── minify.ps1              # reproducible build step for the .min files
├── PERFORMANCE-REPORT.md       # ← the required report: findings, fixes, measurements
└── README.md
```

## Optimisations applied

1. **Images** — right-sized files, `srcset`/`sizes`, `loading="lazy"`, intrinsic
   `width`/`height` (CLS 0), `fetchpriority="high"` on the LCP image, duplicates
   replaced by gradients.
2. **Critical rendering path** — critical CSS inlined, full sheet preloaded but
   non-blocking, all JS as a deferred `type="module"`, `preconnect`/`dns-prefetch`.
3. **CSS** — 3 sheets → 1, custom properties instead of `!important`, duplicated theme
   blocks removed, minified, `content-visibility` on off-screen sections,
   `contain` on cards, transform/opacity-only animation.
4. **JavaScript** — every scroll/resize/polling/thrashing pattern replaced with
   `IntersectionObserver` + `ResizeObserver`; the 600-element DOM build deleted;
   synchronous XHR replaced with `sendBeacon`; 118 KB of vendor bundles replaced with
   2.1 KB of first-party code.
5. **Code splitting** — analytics is a separate module pulled in with
   `requestIdleCallback(() => import('./analytics.js'))`, and skipped entirely on
   Save-Data or 2G.
6. **Fonts** — `font-display: swap`, preload of the one critical face,
   `preconnect` to the font host, system-font fallback stack.
7. **Caching** — immutable one-year caching for hashed assets, `must-revalidate` for
   HTML, Brotli + gzip, security headers (`CACHING.md`).

## Notes on honesty

The byte counts, request counts, DOM node counts and blocking-resource counts in
`PERFORMANCE-REPORT.md` are **exact and reproducible** (`find … | awk`, `curl -w`,
`build/minify.ps1`). The Core Web Vitals figures are explicitly labelled
**projections** derived from those measurements plus a documented transfer-rate model,
because Lighthouse could not be run in the authoring environment. Section 7 of the
report lists the exact steps to reproduce everything.
