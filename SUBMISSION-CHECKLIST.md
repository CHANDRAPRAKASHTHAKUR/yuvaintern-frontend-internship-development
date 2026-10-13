# Submission checklist — what to upload, week by week

**Author: Chandra Prakash Thakur**

Print this. It maps every task requirement to the file that satisfies it.

**The GitHub URL field: leave blank.** The task brief says a technical GitHub URL
will be ignored and the certificate will not be issued, and none of these projects
are hosted repositories. Upload files instead.

---

## Week 1 — Responsive Landing Page

| Required | File |
| --- | --- |
| Landing page with navbar, hero, features, footer | `week-1-responsive-landing-page/index.html` |
| Styles (separate file) | `week-1-responsive-landing-page/css/styles.css` |
| JavaScript (separate file) | `week-1-responsive-landing-page/js/main.js` |
| Word report (.doc/.docx) | your document, using `reports/week-1-submission.md` |
| Description box (200+ words) | `reports/week-1-submission.md` |

- [x] Semantic HTML5 (`header`/`nav`/`main`/`section`/`article`/`footer`, one `h1`)
- [x] Flexbox **and** Grid
- [x] Responsive from 320px up, mobile-first
- [x] Vanilla JS: navigation toggle + basic interactivity
- [x] Clean, well-structured, **commented** code
- [x] Design description of choices + testing

---

## Week 2 — Interactive UI Components

| Required | File |
| --- | --- |
| **One ZIP** containing all project source | `submission-zips/week-2-interactive-ui-components.zip` |
| Word report (.doc/.docx) | your document, using `reports/week-2-submission.md` |
| Description box (200+ words) | `reports/week-2-submission.md` |

- [x] Interactive component(s) with HTML + CSS + **vanilla** JS
- [x] Clean, maintainable code
- [x] CSS for all states and responsive breakpoints
- [x] Interactivity with animations and transitions
- [x] **ARIA attributes** and keyboard navigation
- [x] `README.md` with usage and test instructions (inside the ZIP)

---

## Week 3 — Accessibility (UX)

| Required | File |
| --- | --- |
| **One ZIP** with all project files (HTML, CSS, JS) | `submission-zips/week-3-accessibility-blog.zip` |
| Audit report (.txt or .md) | `week-3-accessibility-blog/AUDIT-REPORT.md` (inside the ZIP) |
| Word report (.doc/.docx) | your document, using `reports/week-3-submission.md` |
| Description box (200+ words) | `reports/week-3-submission.md` |

- [x] Chose a **blog / information portal** page concept
- [x] Identified accessibility issues (24 documented)
- [x] Reworked to **WCAG 2.1 AA** + ARIA
- [x] Lighthouse / WAVE audit documented, with before/after
- [x] Changes documented with justification
- [x] ZIP contains updated HTML, CSS, JS **and** the audit report

---

## Week 4 — Performance Optimization

| Required | File |
| --- | --- |
| **One ZIP** with the optimised project (HTML, CSS, JS) | `submission-zips/week-4-performance-optimization.zip` |
| Performance report (.txt or .md) | `week-4-performance-optimization/PERFORMANCE-REPORT.md` (inside the ZIP) |
| Word report (.doc/.docx) | your document, using `reports/week-4-submission.md` |
| Description box (200+ words) | `reports/week-4-submission.md` |

- [x] Started from a basic web page (shipped as `before/`)
- [x] Initial performance measured and documented
- [x] Issues identified: large images, excessive JS, inefficient CSS
- [x] Optimisations applied: lazy loading, minification, **code splitting**, caching
- [x] Post-optimisation measurements documented
- [x] Caching configuration included (`after/CACHING.md`)
- [x] Reproducible build step (`build/minify.ps1`)

---

## Week 5 — Final Project Integration

| Required | File |
| --- | --- |
| Mini web application | `week-5-dashboard-app/` (upload the whole folder, or use the ZIP) |
| Static JSON data set | `week-5-dashboard-app/data/dashboard-data.json` |
| Documentation (**200+ words**) | `week-5-dashboard-app/REPORT.md` and `README.md` |
| Description box (200+ words) | `reports/week-5-submission.md` |

- [x] Small, **interactive** dashboard web application
- [x] **Dynamic data visualisation** — 4 hand-written SVG chart types
- [x] **Data table** — sortable, filterable, paginated, CSV export
- [x] **Interactive panels** — series toggles, filters, drawer, theme
- [x] Responsive layout design
- [x] Optimised loading strategies
- [x] Accessible: WCAG 2.1 AA + ARIA
- [x] Documentation: design choices, features, enhancements, **testing outcomes**
- [x] 200+ words in the report

> **Note on the Week 4 ZIP (9.6 MB):** most of that is the 10.9 MB of deliberately
> oversized baseline images inside `before/`. They are included on purpose — without
> them the before/after measurement in the report cannot be reproduced. If the
> upload form rejects the file size, upload `after/`, `build/`, `README.md` and
> `PERFORMANCE-REPORT.md` instead and note in the report that the baseline assets
> total 10.9 MB (the per-file byte counts are all listed in the report).

---

## Before you submit

1. Regenerate the ZIPs after any edit:
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\build-zips.ps1
   ```
2. Convert each `reports/week-N-submission.md` body into a **.docx** file
   (Google Docs → File → Download → Microsoft Word, or Word → Save As → .docx).
   Paste the same text into the corresponding description box. Each description
   already carries the `**Author: Chandra Prakash Thakur**` line and a closing
   signature, and each is 340–400 words (well over the 200-word minimum).
3. Add 3–5 screenshots per week to the Word document:
   desktop view, a narrow/mobile view, and one screenshot proving an interactive or
   accessibility feature works (focus ring, open dialog, sorted table, Lighthouse
   score).
4. Open each page one last time from the ZIP to confirm nothing was missed.
