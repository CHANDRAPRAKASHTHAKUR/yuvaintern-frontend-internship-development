# Week 2 — Interactive UI Components

**Author: Chandra Prakash Thakur**

**NovaUI** — a dependency-free component library built with plain HTML, CSS and
vanilla JavaScript. Every component ships with complete keyboard support and the
correct ARIA attributes, following the WAI-ARIA Authoring Practices.

## How to run

```bash
cd week-2-interactive-ui-components
python -m http.server 8080     # then open http://localhost:8080
# or simply double-click index.html — there are no network dependencies
```

## File structure

```
week-2-interactive-ui-components/
├── index.html          # component demo page
├── css/
│   └── styles.css      # 16 sections: tokens → components → responsive → motion
└── js/
    └── components.js   # the whole library (~700 lines, 11 components)
```

## Components

| # | Component | ARIA pattern | Keyboard support |
| --- | --- | --- | --- |
| 1 | **Modal dialog** | `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`; confirm uses `role="alertdialog"` | Focus trap (Tab / Shift+Tab loop), `Esc` closes, focus restored to the trigger, body scroll locked and restored |
| 2 | **Accordion** | `aria-expanded`, `aria-controls`, panels are labelled `region`s inside `<h3>` | `Enter`/`Space` toggle, `↑`/`↓` move between headers |
| 3 | **Tabs** | `role="tablist"` / `tab` / `tabpanel`, `aria-selected`, `aria-controls` | Roving `tabindex`, `←`/`→`/`↑`/`↓`, `Home`/`End`, automatic activation |
| 4 | **Dropdown menu** | `aria-haspopup="true"`, `aria-expanded`, `role="menu"`, `role="menuitem"`, `role="separator"` | `↓`/`↑` open, arrows wrap around, `Home`/`End`, `Esc`, type-ahead, `Tab` closes |
| 5 | **Switch** | `role="switch"` + `aria-checked` | `Space`/`Enter` (native button) |
| 6 | **Range slider** | `aria-valuetext` + `<output for>` live region | `←`/`→`, `↑`/`↓`, `Page Up`/`Page Down`, `Home`/`End` (native input) |
| 7 | **Tooltip** | `aria-describedby` pointing at the generated bubble | Appears on focus **and** hover, `Esc` dismisses |
| 8 | **Toast notifications** | `aria-live="polite"`, `aria-relevant="additions"` | Timer pauses on hover, explicit dismiss button |
| 9 | **Progress bar** | `role="progressbar"` with `aria-valuenow` kept in sync | Announced by AT as the value changes |
| 10 | **Rating** | `role="radiogroup"` + `role="radio"` + `aria-checked` | `←`/`→`/`↑`/`↓`, `Home`/`End` |
| 11 | **Side navigation** | labelled `<nav>` + `aria-expanded` on the drawer button | Standard link navigation, closes on selection |

## Extra behaviour

- **Scroll spy** highlights the component currently in view.
- **Focus-visible outlines** everywhere; the mobile drawer traps nothing but closes on
  outside click.
- **Dark theme** toggle with `Alt + T` and `localStorage` persistence.
- **Reduce motion** switch at the top sets `data-motion="reduced"` on `<body>`, which
  collapses every transition via CSS; `prefers-reduced-motion` is respected as well.
- **XSS safety**: every toast message is written with `textContent`, never `innerHTML`.

## How to test it (manual test plan)

1. **Modal** — press *Open basic modal*. Focus jumps inside. Press `Tab` ~10 times:
   focus loops and never reaches the page behind. Press `Esc`: the dialog closes and
   focus is back on the button that opened it. Repeat with the *form modal* and submit
   an invalid email — the error appears in the `role="alert"` paragraph and focus moves
   to the field.
2. **Accordion** — activate a header with `Enter` and with `Space`; only one panel is
   open at a time. Tick *Allow multiple open panels* and confirm siblings stay open.
   `↑`/`↓` moves between headers.
3. **Tabs** — focus *Preview* and press `→` three times: selection follows, and wrapping
   from *Changelog* returns to *Preview*. `Home`/`End` jump to the ends. Only the active
   tab is in the tab order.
4. **Menu** — open with `↓` from the trigger, arrow through the items, type `ex` to
   jump to *Export as CSV*, then `Esc` — focus returns to the trigger.
5. **Switch** — toggle with `Space`; the status line under the group updates and the
   state is announced via `aria-checked`.
6. **Slider** — drag or use arrow keys; the output text and the filled portion of the
   track update on every `input` event.
7. **Tooltip** — hover **and** tab to the button; `Esc` dismisses.
8. **Toast** — click *Stack 5 toasts*; timers pause while the pointer rests on a toast,
   the dismiss button removes it, and the stack never exceeds five.
9. **Progress** — press *Run upload* and watch `aria-valuenow` climb to 100.
10. **Rating** — focus a star and use the arrow keys; `aria-checked` follows.
11. **Responsive** — shrink below 960px: the sidebar becomes a drawer behind the
    floating button. Below 460px the modal becomes a bottom sheet.

## Browser support

Evergreen Chrome, Edge, Firefox and Safari (last two versions). Uses only
`IntersectionObserver`, `classList`, `CustomEvent`, `:focus-visible` and CSS custom
properties. Without JavaScript the page is still readable — native `<details>`-style
behaviour degrades to fully visible panels, and the menu simply stays closed.
