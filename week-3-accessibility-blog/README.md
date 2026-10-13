# Week 3 — Accessibility: audit and remediation

**Author: Chandra Prakash Thakur**

An information-portal / blog article page (**Fieldnotes**) that was audited against
**WCAG 2.1 Level AA** and then rebuilt so that every automated check passes and every
fix is verified manually with a keyboard and a screen reader.

## How to run

```bash
cd week-3-accessibility-blog
python -m http.server 8080
```

## Files

```
week-3-accessibility-blog/
├── index.html            # long-form article page (blog / info portal)
├── css/
│   └── styles.css        # colour system, 3 themes, reflow, print
├── js/
│   └── main.js           # progressive enhancement only (6 small modules)
├── assets/
│   ├── hero.svg          # hero diagram
│   └── heading-tree.svg  # heading-outline comparison figure
├── AUDIT-REPORT.md       # ← the required audit deliverable
└── README.md
```

## What the audit found and fixed

Full detail is in **[`AUDIT-REPORT.md`](./AUDIT-REPORT.md)**. Summary:

| | Before | After |
| --- | --- | --- |
| Lighthouse Accessibility | 68 | **100** |
| axe violations (critical/serious) | 11 / 6 | **0 / 0** |
| WAVE errors / alerts | 11 / 6 | **0 / 0** |

24 issues were identified and fixed, grouped as:

- **Structure (6)** — skip links, sequential heading outline, unique labels on every
  landmark, `caption` + `scope` on the table, `fieldset`/`legend` grouping, source
  order matching visual order.
- **Colour (4)** — body text raised from 2.9:1 to 9.9:1, links from 4.0:1 to 6.9:1,
  explicit placeholder colour, status badges given icon + word + border so colour is
  never the only signal.
- **Forms (4)** — real `<label>`s, errors as text in `role="alert"` tied to the field
  with `aria-describedby`, `aria-invalid`, focus moved to the first error, required
  fields labelled in words.
- **Keyboard (4)** — `:focus-visible` rings everywhere, focus trap in the dialog,
  focus restored to the trigger, `Esc`/backdrop dismissal, `aria-hidden` on the page
  behind the dialog, labelled scroll container for the wide table.
- **Media & motion (3)** — descriptive `alt` for meaningful images, `alt=""` for
  decorative ones, full `prefers-reduced-motion` support, decorative progress bar
  hidden from AT.
- **Reflow / zoom (3)** — `scroll-padding-top` so anchored headings clear the sticky
  header, no page-level horizontal scroll at 320 px, `rem`-based type that survives
  200 % zoom and the built-in text-size control.

## Built-in accessibility features

- **Accessibility toolbar** (top of page): text size 100 → 140 %, high-contrast mode,
  dark theme. All persisted in `localStorage`, all changes announced through a
  polite live region.
- **Keyboard shortcuts** — `/` focus the comment field, `t` toggle theme,
  `?` open the shortcuts dialog, `Esc` close. Suppressed while typing in a field.
- **Native `<details>` FAQ** — works with zero JavaScript.
- **Progressive enhancement** — with JS off the article is still fully readable and
  every form still has visible labels.

## How to test the accessibility yourself

1. Unplug the mouse. Press `Tab` once → the skip link appears. `Tab` through the whole
   page; focus must always be visible.
2. Press `?` → dialog opens. `Tab` twelve times: focus never leaves the dialog.
   `Esc` closes it and focus is back on the button.
3. Submit the subscribe form empty → each error is announced, focus lands on the first
   invalid field, and the message text is readable without relying on colour.
4. Set the OS to “reduce motion”, or DevTools → Rendering → emulate
   `prefers-reduced-motion` → all animation stops.
5. Zoom to 200 %, then to 400 % → layout holds, no horizontal scroll.
6. Resize to 320 px → only the data table scrolls, inside its own labelled region.
7. Run Lighthouse *Accessibility* and axe → expect 100 / 0 violations.
8. Turn on **High contrast** in the toolbar → content is pure black on white with 2 px
   borders; the button reports `aria-pressed="true"`.
