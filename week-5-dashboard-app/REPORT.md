# NovaDesk Analytics — Project Report

**Author: Chandra Prakash Thakur**
**Week 5 task:** *Final Project Integration — Mini Web Application*
**Type:** Interactive analytics dashboard · vanilla HTML, CSS and JavaScript
**Runtime dependencies:** none

---

## 1. What was built

NovaDesk Analytics is a single-page analytics dashboard for a fictional SaaS company.
It presents a fixed set of static data, loaded from `data/dashboard-data.json`, through
four hand-drawn SVG visualisations, six KPI cards and a fully interactive invoice
table. The goal was to prove that the four skills from the previous weeks —
responsive layout, interactive component engineering, accessibility and performance
discipline — combine into one coherent application rather than four separate
exercise folders.

## 2. Design decisions

**One JSON file, zero hard-coded numbers.** Every figure on screen comes from
`data/dashboard-data.json`. Nothing is written into the HTML, so the dataset can be
replaced with a real API response without touching the rendering code. The file holds
metadata, six KPIs with twelve-point sparkline history, three revenue streams across
twelve months, five channels compared over two years, five acquisition sources, five
regions, five team-capacity rows, twenty-three invoices and five activity entries.

**Charts written by hand.** The obvious shortcut was a charting library, but that
would have added 120–200 KB of JavaScript and taken control of the accessibility
layer away. Instead `charts.js` builds plain SVG: a multi-series line/area chart with
grid lines and a crosshair, a grouped bar chart, a donut, and a sparkline for the KPI
cards. The total cost is under 9 KB, every mark is an SVG node the browser paints
directly, and each data point can be given real keyboard semantics — which a library
usually will not do for you.

**Accessibility as a design constraint, not a pass at the end.** Two rules shaped the
whole layout. First, a chart is never the only way to reach its data: each one is
paired with a collapsible `<details>` table containing the identical numbers with a
`<caption>` and `scope` attributes, and the SVG host carries a text `aria-label`
summary. Second, colour is never the only signal: delta chips combine a coloured
background with an arrow glyph and a visually hidden word ("increase"/"decrease"),
status pills combine a dot with a text label, and the team-capacity meters state their
threshold in the accessible name instead of only turning red. Sorting announces itself
through `aria-sort` on the `<th>` rather than on the button, so assistive technology
says "sorted descending" as the user moves through the header.

**Progressive enhancement throughout.** With JavaScript disabled the document is
still a valid, readable page: the skip link, landmarks, headings, navigation and the
`<noscript>` note pointing at the raw JSON all work. The interactive layer is added on
top rather than being load-bearing.

**No framework, and deliberately no ES modules.** The application is organised as
three small files — `data-service.js` (loading and caching), `charts.js`
(visualisation) and `data-table.js` (sorting, filtering, pagination, export) — with
`app.js` as the composition layer, all sharing a single `window.NovaDash` namespace.
This kept the file count low while still giving each concern one, testable place to
live.

The one architectural decision worth calling out is that these are **classic
`<script defer>` files rather than modules**, even though modules would have been the
natural choice. Browsers always CORS-check module requests, and a page opened by
double-clicking `index.html` has an opaque origin, so Chrome blocks every module
request and the page loads without ever executing a line of JavaScript — leaving the
visitor looking at the loading skeletons with no error message to explain why. That
failure is invisible to a functional test and to a console check, because nothing is
ever logged; it only appears when a human double-clicks the file. Classic scripts are
not CORS-checked, so the same code now runs identically from a server and from disk.
For the same reason, the lazy charts chunk is injected as a `<script>` tag rather
than with `import()`, and `fetch()` of the JSON is paired with a generated
`fallback-data.js` that is only ever loaded when the fetch is blocked.

## 3. Features

Six KPI cards with sparklines, a delta chip and a formatted value. A multi-series
revenue line/area chart with an interactive series-toggle chip group. An acquisition
donut with a per-source accessible arc. A grouped channel bar chart comparing this
year with last year. A regional breakdown with animated share bars and `role="meter"`
capacity indicators. An activity timeline. A plain-language period summary. A
twenty-three-row invoice table with eight sortable columns, debounced live search,
status and region filters, eight-per-page pagination, an empty state and CSV export of
the filtered result set. An off-canvas sidebar drawer, a scroll-spy, a persisted
dark/light theme and a refresh action.

## 4. Optimised loading

Nothing blocks the parser: all three scripts carry `defer`. The six KPI slots
are skeleton placeholders in the HTML, so the layout does not shift when the data
arrives. `DataService` implements stale-while-revalidate — a `localStorage` copy with a
five-minute TTL is returned immediately and refreshed in the background, with a
banner explaining why the data might be a minute old. `charts.js` is referenced by
no script tag at all and is injected on demand once the KPI numbers and the table
have rendered, so charting never delays first meaningful paint, and the sparklines
are drawn in a second post-paint pass. `fallback-data.js` is injected only inside the
rejection branch of the loader, which is what makes the dashboard work when
`index.html` is opened straight from disk. All animation is restricted to
`transform` and `opacity`, `prefers-reduced-motion` removes all of it, and repeated
components use `contain: layout paint style` so one re-render cannot invalidate the
grid.

## 5. Accessibility and testing

The dashboard targets WCAG 2.1 AA. Every chart data point, bar and arc is focusable
and shows the same tooltip on focus as on hover; arrow keys walk a series and `Escape`
dismisses the tooltip. The sidebar drawer closes on `Escape` and returns focus to its
toggle. Filter, sort, pagination, theme, refresh and export events are announced
through a single polite `role="status"` region without moving focus. The wide invoice
table sits inside a focusable, labelled scroll region so the layout still reflows to
320 CSS pixels without horizontal page scrolling.

Testing covered the sorting of all eight columns in both directions with correct
numeric and string handling, combined filtering and its empty state, pagination bounds
across three pages, CSV output honouring the active filters, theme persistence across
reloads, the cache path on a second visit, rendering and tooltip behaviour for all four
chart types, a keyboard-only walkthrough of the whole page, and a reflow check at 320
pixels. Every JavaScript file passes `node --check` and the JSON round-trips cleanly.

## 6. Reflection

The most valuable lesson is that the interesting work was not in any single feature.
It was in the connective tissue: a chart that cannot be read with a keyboard is a
chart that does not count as finished, and a data table that has to be rebuilt to add
a column is a data table that will be rebuilt wrongly. Building the accessibility and
the data contract first meant the visual layer stayed simple enough to reason about,
and the performance work reduced to ordinary good habits rather than a rescue mission.
