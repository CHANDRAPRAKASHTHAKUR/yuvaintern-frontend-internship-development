# Week 5 — Final Project: NovaDesk Analytics dashboard

**Author: Chandra Prakash Thakur**

A small but complete **interactive analytics web application**: dynamic data
visualisation, a sortable data table, interactive filter panels and a CSV export,
built with plain HTML, CSS and vanilla JavaScript — **zero runtime dependencies**.

## Run it

**Option A — recommended, a real server:**

```bash
cd week-5-dashboard-app
python -m http.server 8080
# open http://localhost:8080
```

**Option B — just double-click `index.html`.** Fully supported. On `file://` the
browser blocks `fetch()` of a local JSON file, so `data-service.js` injects
`js/fallback-data.js` — a generated copy of the same data set — and the dashboard
renders everything normally. The sidebar label switches to *"Local copy · opened from
disk"* so the source is never misrepresented.

## Files

```
week-5-dashboard-app/
├── index.html                    # semantic shell: sidebar, top bar, panels, noscript
├── css/styles.css                # design tokens, dark theme, 12 numbered sections
├── js/                           # classic deferred scripts, window.NovaDash namespace
│   ├── data-service.js           # loaded first — fetch + SWR cache + on-demand script loader
│   ├── data-table.js             # loaded second — sorting, filtering, pagination, CSV export
│   ├── app.js                    # loaded third — bootstrap + all rendering
│   ├── charts.js                 # lazy chunk: hand-written SVG line / bar / donut / sparkline
│   └── fallback-data.js          # generated file:// fallback, injected only if fetch fails
├── data/dashboard-data.json      # ← the static data set (the brief's requirement)
├── REPORT.md                     # ← 200+ word project report
└── README.md
```

## Features

| Area | What it does |
| --- | --- |
| **KPI cards** | 6 headline metrics with a 12-point sparkline, a delta chip (arrow glyph + hidden word + colour) and a formatted value. Six skeleton placeholders are shown while the JSON is in flight. |
| **Revenue chart** | Stacked-free multi-series line/area chart in SVG, with grid lines, axis labels, crosshair and a tooltip. **Each data column is a focusable `role="button"`** — arrow keys walk the series, `Esc` dismisses the tooltip. |
| **Series filter panel** | A chip group (`fieldset` + `legend`) that toggles individual revenue series live. |
| **Acquisition donut** | Pure-SVG donut with an accessible arc per source; the centre shows the channel count. |
| **Channel bar chart** | Grouped bars (this year vs last year) with wrapped x-axis labels. |
| **Region panel** | Revenue share bars with year-on-year change, animated with `transform: scaleX()` so it is compositor-only. |
| **Team capacity** | `role="meter"` bars with `aria-valuenow`; the threshold is stated in text, not only by colour. |
| **Invoice table** | 23 rows, 8 sortable columns (`aria-sort` on the `<th>`, real `<button>` in the header), live text search (debounced 180 ms), status and region filters, 8-per-page pagination and an empty state outside the table. |
| **CSV export** | Exports the **filtered** result set as a real `.csv` via `Blob` + `URL.createObjectURL`. |
| **Activity timeline** | Deploys, alerts, signups, reviews and goals with typed icons. |
| **Period summary** | Plain-language reading of the data (settled value, seats, regions, invoices needing attention). |
| **Chrome** | Off-canvas sidebar drawer, scroll-spy, dark/light theme persisted in `localStorage`, refresh button, `<noscript>` note. |

## Optimised loading strategy

1. **Classic deferred scripts, not ES modules.** All three scripts carry `defer`,
   so nothing in the document blocks the parser. This is a deliberate decision with
   a hard constraint behind it — see [Why not ES modules](#why-not-es-modules).
2. **Skeleton first paint.** The six KPI slots are skeletons in the HTML, so the
   layout never shifts when data arrives.
3. **Stale-while-revalidate data.** `DataService` returns the `localStorage` copy
   immediately (5-minute TTL) and revalidates in the background. A repeat visit
   paints in milliseconds and shows a "showing a cached copy" banner.
4. **Code splitting by injecting a `<script>`.** `charts.js` is **not** referenced
   by any `<script>` tag in the HTML. It is fetched and executed on demand after the
   KPI numbers and the table have rendered, so charting never delays the first
   meaningful paint. The KPI sparklines are drawn in a second post-paint pass.
5. **`fallback-data.js` is never downloaded over HTTP.** It is only injected inside
   the rejection branch of `DataService.load()`, and it is generated from the JSON by
   `tools/build-fallback-data.js` so the two can never drift apart.
6. **CSS containment** on repeated components (`contain: layout paint style`) so
   re-rendering one card cannot invalidate the grid.
7. **Compositor-only animation** — every transition is `transform` / `opacity`, and
   `prefers-reduced-motion` disables all of it.
8. **Paint containment on the tooltip** — a single fixed-position element reused for
   every chart, so no chart triggers layout inside its own subtree.

### Why not ES modules

The dashboard is built from three files that would naturally be ES modules, but it
ships as classic scripts in a `window.NovaDash` namespace instead.

The reason is `file://`. **Browsers always CORS-check module requests**, and a page
opened by double-clicking `index.html` has an opaque origin, so Chrome blocks every
one of them with:

> Access to script at 'file:///…/js/app.js' from origin 'null' has been blocked by
> CORS policy: Cross origin requests are only supported for protocol schemes: http,
> https, chrome, chrome-extension…

The page then renders — but no JavaScript ever executes, so the visitor is left
staring at the loading skeletons with no explanation. That failure is invisible to a
functional test and to a console check, because nothing is logged; it only shows up
when a human double-clicks the file.

Classic `<script defer>` tags are not CORS-checked, so the same code now runs
identically from a web server **and** from a double-clicked file. `fetch()` of a
local JSON file is also blocked on `file://`, so `DataService` falls back to
injecting `js/fallback-data.js` — a copy of the same data set — and the sidebar
label changes to *"Local copy · opened from disk"* to say so honestly.

Both paths are verified: the JSON-present path and the fallback path.

## Running it

**Option A — recommended, a real server:**

```bash
cd week-5-dashboard-app
python -m http.server 8080
# open http://localhost:8080
```

**Option B — just double-click `index.html`.** The dashboard detects that `fetch()`
is unavailable, injects the local copy of the data and renders everything normally.

## Accessibility (WCAG 2.1 AA)

- **Landmarks**: `aside` (labelled), two named `nav` regions, labelled `header`,
  `main`, and a `nav` pagination landmark. Skip link is the first focusable node.
- **Charts are never the only route to the data.** Every chart has a matching
  `<details>View as table</details>` block with a `<caption>`, `scope="col"` and
  `scope="row"`, and the SVG host carries a text `aria-label`.
- **Keyboard**: every chart point/bar/arc is focusable with a tooltip on focus;
  arrow keys move between points; the drawer traps nothing but closes on `Esc` and
  restores focus to the toggle; pagination is real buttons with `aria-current="page"`.
- **Status messages**: filter changes, sort changes, page changes, theme changes,
  refresh and export all push to a single polite `role="status"` region without
  moving focus.
- **Colour is never the only signal**: delta chips carry an arrow glyph *and* a
  visually hidden word; status pills carry a coloured dot *and* a text label;
  capacity thresholds are stated in the accessible name.
- **Tables**: `aria-sort` on the header, `scope` on every header cell, the scroll
  container is focusable and labelled, the empty state is a sibling of the table.
- **Motion**: `prefers-reduced-motion` removes every transition and animation.
- **Zoom / reflow**: layout is fluid down to 320 px; the invoice table scrolls inside
  its own labelled region rather than forcing the page to scroll.

## Data set

`data/dashboard-data.json` is the single source of truth: metadata, 6 KPIs with
sparkline history, 12 months × 3 revenue streams, 5 channels × 2 years, 5 acquisition
sources, 5 regions, 5 team-capacity rows, 23 invoices and 5 activity entries.
Nothing in the HTML hard-codes a number — change the JSON and the whole dashboard
re-renders.

`js/fallback-data.js` is a **generated** copy of that JSON for the `file://` case.
Regenerate it after editing the JSON so the two can never diverge:

```bash
node tools/build-fallback-data.js
```

## Browser support

Evergreen Chrome, Edge, Firefox and Safari, over `http://` **and** over `file://`.
Uses only classic deferred scripts, `IntersectionObserver`, `ResizeObserver`,
dynamic `<script>` injection, `Blob` downloads and CSS custom properties — no ES
module syntax anywhere, because module requests are CORS-blocked on `file://`.
The data table and all text content degrade to readable HTML without JavaScript,
and a `<noscript>` block points at the raw JSON.

## Verification performed

| Area | Check | Result |
| --- | --- | --- |
| Syntax | `node --check` on every JS file | pass |
| JSON | `JSON.parse` round-trip of `dashboard-data.json` | pass |
| Sorting | All 8 columns, asc + desc, numeric vs text | pass |
| Filtering | Search + status + region combined; empty state | pass |
| Pagination | 23 rows / 8 per page = 3 pages; prev/next disabled at bounds | pass |
| CSV | Export produces a header row + 23 data rows, filtered subset honoured | pass |
| Theme | Reload persists light/dark | pass |
| Cache | Second load serves from `localStorage` and shows the cache banner | pass |
| Charts | All 4 chart types render, tooltips work on hover **and** focus | pass |
| A11y | Keyboard-only pass, `aria-sort` / `aria-valuenow` / `role="meter"` present, 320 px reflow | pass |
