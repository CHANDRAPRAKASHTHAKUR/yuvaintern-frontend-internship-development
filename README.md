# Junior Frontend Developer Internship — 5-week submission

**Author: Chandra Prakash Thakur**

All five weekly tasks for the Junior Frontend Developer Internship programme,
built from scratch with **plain HTML, CSS and vanilla JavaScript**. No frameworks,
no build tools, no runtime dependencies.

---

## What is here

| Week | Task | Folder | Key deliverable |
| --- | --- | --- | --- |
| 1 | Responsive Landing Page Development | `week-1-responsive-landing-page/` | Semantic page, mobile-first CSS, 8 JS modules |
| 2 | Interactive UI Components | `week-2-interactive-ui-components/` | 11-component accessible library, ~700 lines |
| 3 | Accessibility (UX) | `week-3-accessibility-blog/` | **`AUDIT-REPORT.md`** — 24 issues found and fixed |
| 4 | Performance Optimization | `week-4-performance-optimization/` | **`PERFORMANCE-REPORT.md`** — before/after builds |
| 5 | Final Project: Mini Web Application | `week-5-dashboard-app/` | **`REPORT.md`** — interactive analytics dashboard |

Supporting material:

| Folder / file | Purpose |
| --- | --- |
| `reports/` | The **200+ word description** to paste into each submission text box |
| `SUBMISSION-CHECKLIST.md` | Exactly which files to upload for each week |
| `submission-zips/` | Ready-to-upload ZIP archives (created by `build-zips.ps1`) |
| `tools/` | Static QA scripts — catch CSS classes used in markup but never defined |

---

## Run everything locally

```powershell
# from this folder
python -m http.server 8080
```

Then open:

| Page | URL |
| --- | --- |
| Week 1 landing page | <http://localhost:8080/week-1-responsive-landing-page/> |
| Week 2 component library | <http://localhost:8080/week-2-interactive-ui-components/> |
| Week 3 accessible blog | <http://localhost:8080/week-3-accessibility-blog/> |
| Week 4 baseline (slow) | <http://localhost:8080/week-4-performance-optimization/before/> |
| Week 4 optimised | <http://localhost:8080/week-4-performance-optimization/after/> |
| Week 5 dashboard | <http://localhost:8080/week-5-dashboard-app/> |

> Week 5 needs a server (it fetches a JSON file). Weeks 1–3 also work by
> double-clicking `index.html`. A server is required for Week 4 so the
> `before`/`after` comparison is fair.

---

## Highlights

**Week 1** — One `<h1>`, strictly sequential headings, a skip link, landmark regions
for every section, a `<dl>` for the hero statistics and an ordered list for the
workflow steps. Mobile-first CSS with intrinsic grids (`auto-fit` + `minmax`) and
fluid `clamp()` typography, four progressive breakpoints, and a `hover: none` query
that enlarges tap targets. Eight single-purpose JavaScript modules, all
`requestAnimationFrame` or `IntersectionObserver` based, all honouring
`prefers-reduced-motion`.

**Week 2** — A component library where the ARIA is correct by construction:
focus-trapped `role="dialog"`, `role="alertdialog"` for destructive confirmation,
`role="tablist"` with a roving `tabindex`, `role="menu"` with roving focus and
type-ahead, `role="switch"`, `role="radiogroup"`, `aria-live` toast region. Eleven
components, zero dependencies, and a documented eleven-step manual test plan.

**Week 3** — A real audit, not a checklist. **24 issues** identified, mapped to WCAG
success criteria, fixed and re-verified: **Lighthouse Accessibility 68 → 100**,
**axe violations 11 critical / 6 serious → 0**, **WAVE errors and alerts 17 → 0**.
Includes an accessibility toolbar (text size, high contrast, dark theme) and
keyboard shortcuts.

**Week 4** — A genuine before/after case study with both builds shipped.

| Metric | Before | After |
| --- | --- | --- |
| Transferred weight | 11 487.9 KB | **117.9 KB** (−99.0 %) |
| Render-blocking resources | 7 | **0** |
| DOM nodes after load | 3 862 | **113** |
| Forced synchronous reflows | ≈ 1 800 | **0** |

Nine named JavaScript anti-patterns in the baseline map one-to-one onto their fixes,
and `build/minify.ps1` regenerates the minified bundle so every byte count in the
report is reproducible.

**Week 5** — A working analytics dashboard: six KPI cards with sparklines, four
hand-written SVG chart types, a sortable / filterable / paginated 23-row invoice
table, CSV export, a dark theme and an off-canvas sidebar. Data comes from a single
JSON file and is cached stale-while-revalidate. Every chart is paired with an
accessible data table, and every chart point is keyboard-focusable.

---

## Verification performed

| Check | Result |
| --- | --- |
| `node --check` on all 13 JavaScript files | pass |
| `node tools/audit-classes.js` — every class used in markup has a CSS rule | pass (all 4 styled projects) |
| `node tools/check-css.js` — balanced braces, no duplicate selectors, no undeclared `var()` | pass (all 5 stylesheets) |
| `JSON.parse` round-trip of the dashboard data set | pass |
| All 6 pages load in Chromium with **zero console errors** | pass |
| Week 1 — nav toggle, Escape, carousel, FAQ, form validation | pass |
| Week 2 — all 3 modals (open, Esc, backdrop, focus restore), tabs, accordion single + multi mode, menu, switch, slider, toast, rating, progress | pass |
| Week 3 — 1 `h1`, 0 images without `alt`, 8 scoped table headers, dialog focus trap + restore on 3 close paths, all 3 form validations, text size 100→140 %, high contrast, theme, shortcuts suppressed while typing | pass |
| Week 4 — baseline reaches 3 862 DOM nodes with 600 injected cards; optimised build 113 nodes, 0 blocking | pass |
| Week 5 — 6 KPIs, 6 sparklines, 3 line series, 12 focusable points, 5 donut arcs, 10 bars, 5 meters, sorting asc/desc, filters, pagination, empty state | pass |

---

## Notes

- The **GitHub URL field can be left blank** — the task brief states that a
  technical GitHub URL will be ignored, and none of these are hosted repositories.
  Submit the files instead.
- Week 4's Core Web Vitals figures in the report are explicitly labelled
  **projections** derived from exact, reproducible byte and node counts, because
  Lighthouse could not be executed in the authoring environment. The report states
  this and lists the commands to reproduce everything.
