# tools/ — static QA scripts

Two small Node scripts that catch the class of bug that is easy to miss by eye:
**a CSS class used in the markup but never defined in the stylesheet.**

An undefined class is silent. The page still loads, the console stays clean, and
every automated functional test passes — but the element renders with browser
defaults. That is exactly how the oversized "Refresh" and "Export CSV" icons in
Week 5 shipped: the markup had `class="btn__icon"` and no rule existed, so each
inline `<svg viewBox="0 0 24 24">` fell back to the replaced-element default of
**300 × 150 px**.

## Usage

```bash
# 1. Find classes used in HTML/JS that have no rule in css/styles.css
node tools/audit-classes.js week-5-dashboard-app

# 2. Structural CSS checks: brace balance, duplicate selectors, undefined var()
node tools/check-css.js week-5-dashboard-app
```

Pass a folder path that contains `index.html`, `css/styles.css` and `js/`.
No dependencies — plain Node, works with any recent version.

## Current status

```
week-1-responsive-landing-page       OK — every class used has a rule
week-2-interactive-ui-components     OK
week-3-accessibility-blog            OK
week-5-dashboard-app                 OK
```

`check-css.js` additionally reports balanced braces, no duplicated selectors and no
`var()` referencing an undeclared custom property (an undeclared var inside a
`border` shorthand silently invalidates the whole declaration).

## Why these exist

A browser pass caught a family of related mistakes that no functional test would
flag:

| Bug | Symptom | Test that would pass anyway |
| --- | --- | --- |
| `.btn__icon` undefined | 300 × 150 px icons | click handler, ARIA, DOM queries |
| `.icon-btn` undefined | 15 × 5 px buttons | nothing |
| `.callout--note` undefined | lost its blue accent | markup still present |
| `.steps-list` undefined | lost its `<ol>` numbering | `<ol>` element still there |
| `--line-2` undeclared in a `border-color` | border silently dropped | computed style not asserted |

Run both scripts after any markup or stylesheet edit.
