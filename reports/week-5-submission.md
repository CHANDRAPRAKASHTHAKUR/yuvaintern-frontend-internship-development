# Week 5 — Final project: submission description

**Author: Chandra Prakash Thakur**

*(384 words — paste into the "Write description for the report" box)*
project document is also in `week-5-dashboard-app/REPORT.md`.)*

**NovaDesk Analytics** is a mini web application that displays a dynamic data
visualisation for a product team, integrating the responsive layout, interactive
component, accessibility and performance work from the previous four weeks into one
coherent application. It is built with plain HTML, CSS and vanilla JavaScript and has
**zero runtime dependencies**.

The dashboard renders six key performance indicator cards with sparklines and
delta chips; a multi-series line and area chart in SVG with a crosshair, axis labels
and a tooltip; an interactive series-toggle panel; a donut chart of acquisition
sources; a grouped bar chart comparing this year with last year; a regional
breakdown with animated share bars and `role="meter"` capacity indicators; an
activity timeline; and a plain-language period summary. The centrepiece is a
twenty-three-row invoice table with eight sortable columns, debounced live search,
status and region filters, eight-per-page pagination, an empty state and a CSV
export of the filtered result set.

**Design decisions.** All figures come from a single static file,
`data/dashboard-data.json`, so nothing is hard-coded in the HTML and a real API could
replace it without touching the rendering code. I wrote the charts by hand rather
than using a library: that keeps the payload under nine kilobytes instead of adding
one hundred and fifty, and it let me give every data point real keyboard semantics,
which most libraries do not do. Two rules shaped the whole design — a chart is never
the only route to its data, so every chart is paired with a collapsible accessible
table containing identical numbers, and colour is never the only signal, so every
delta, pill and meter carries an icon or a text label as well.

**Loading is optimised** by serving skeletons in the HTML so nothing shifts, caching
the JSON in `localStorage` with a five-minute stale-while-revalidate policy,
and dynamically importing the charting code only after the numbers have painted.

**Accessibility** follows WCAG 2.1 AA: named landmarks, a skip link, a keyboard
shortcut set, polite live-region announcements for filter, sort, pagination, theme
and export events, and a layout that reflows to 320 pixels without horizontal
scrolling.

— **Chandra Prakash Thakur**, Junior Frontend Developer Internship
