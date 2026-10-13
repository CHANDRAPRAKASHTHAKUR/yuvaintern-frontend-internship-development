# Week 4 — Performance optimization: submission description

**Author: Chandra Prakash Thakur**

*(364 words — paste into the "Write description for the report" box)*

I took a product page for a fictional analytics product and documented a full
performance audit and optimisation cycle, with both builds shipped so the
improvement can be verified rather than taken on trust.

**The baseline** reproduces a realistic legacy build: three render-blocking
stylesheets totalling 239 KB of unminified CSS with over a thousand `!important`
declarations, four render-blocking scripts in the `<head>` totalling 126 KB, web
fonts declared without `font-display` so text stayed invisible, a base64 image
inlined into the CSS, and eleven megabytes of oversized JPEGs — including a
5.3 MB 3200×2400 hero served to every viewport, and the same 2.4 MB photograph
downloaded three times. The JavaScript deliberately reproduced nine named
anti-patterns: a read/write loop that forced roughly 1 800 synchronous reflows, an
unthrottled scroll handler reading layout on every event, a resize handler rewriting
every element, 250 ms polling, a 600-element build appended to the live document, a
`getComputedStyle` call for every node on the page, and a synchronous
`XMLHttpRequest`.

**The optimised build** measures 11 487.9 KB down to 117.9 KB, a 99.0 % reduction;
render-blocking resources drop from seven to zero; the DOM shrinks from 3 862 nodes
to 113; and the forced reflows go to zero. The changes were: right-sized responsive
images with `srcset`, `sizes`, intrinsic dimensions and lazy loading, duplicates
replaced with CSS gradients, inline critical CSS with the rest of the sheet
preloaded but non-blocking, all JavaScript converted to a deferred module, and every
thrash, scroll, resize and polling pattern replaced with `IntersectionObserver` and
`ResizeObserver`.

**Code splitting** is demonstrated properly: analytics is a separate module pulled
in with a dynamic `import()` during idle time, and skipped entirely when the visitor
has Save-Data enabled. Fonts gained `font-display: swap`, a preload and a
`preconnect`, and I shipped both Netlify and nginx configurations implementing
immutable one-year caching for hashed assets, `must-revalidate` for HTML, and
Brotli and gzip compression.

The report separates measurements that are exact and reproducible — byte counts,
request counts, DOM node counts, blocking-resource counts — from the projected Core
Web Vitals, and it includes the exact commands to reproduce every number.

— **Chandra Prakash Thakur**, Junior Frontend Developer Internship
