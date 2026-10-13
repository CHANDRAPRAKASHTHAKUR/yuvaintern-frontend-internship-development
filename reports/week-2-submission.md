# Week 2 — Interactive UI Components: submission description

**Author: Chandra Prakash Thakur**

*(341 words — paste into the "Write description for the report" box)*

I built **NovaUI**, a dependency-free interactive component library demonstrated
through a single showcase page. It is written in plain HTML, CSS and vanilla
JavaScript — no React, no jQuery, no utility classes, no build step. The whole
library is roughly 700 lines across eleven components, each implemented as an
isolated class following the WAI-ARIA Authoring Practices.

**The components are:** an accessible **modal dialog** with a focus trap,
`aria-modal`, backdrop dismissal, body-scroll locking and focus restoration to the
trigger; a **confirmation dialog** using `role="alertdialog"`; a **modal form** with
inline validation; an **accordion** that animates panel height, supports a
single-expandable and a multi-expandable mode, and lets users move between headers
with the arrow keys; a **tab set** with a roving `tabindex`, arrow-key navigation,
Home/End support and automatic activation; an ARIA **dropdown menu** with roving
focus, wrapping arrow keys, Escape-to-dismiss and type-ahead; a **`role="switch"`
toggle**; a custom **range slider** with a live output; a **tooltip** that appears on
both hover and focus and is wired up with `aria-describedby`; a stacked, auto-dismissing
**toast notification** system; an animated **progress bar**; and a **star rating**
widget built as a `radiogroup`.

**Accessibility is built in rather than added later.** Every interactive element has
a visible focus indicator, every state change is reflected in an ARIA attribute, and
nothing relies on colour alone. Status messages such as sort order, page changes and
export results are announced through a single polite live region without moving
focus. The whole page is usable with the keyboard alone — I documented an eleven-step
manual test plan in the README covering focus trapping, roving tabindex, type-ahead,
Escape handling and the target-size targets.

**State and theming.** A dark theme is toggled with `Alt+T` and persisted in
`localStorage`, and a “reduce motion” switch sets an attribute that collapses every
transition, complementing the `prefers-reduced-motion` media query. The component
API is exposed on `window.NovaUI` so individual components can be opened,
destroyed or reconfigured from the console.

— **Chandra Prakash Thakur**, Junior Frontend Developer Internship
