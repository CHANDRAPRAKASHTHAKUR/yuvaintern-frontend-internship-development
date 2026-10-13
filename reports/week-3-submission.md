# Week 3 — Accessibility audit: submission description

**Author: Chandra Prakash Thakur**

*(396 words — paste into the "Write description for the report" box)*

For this task I chose a typical **blog / information-portal article page** — an
in-depth piece called *“Designing interfaces that work for everyone”* — because that
format reproduces almost every accessibility failure that occurs in real projects.
I built a first version, audited it against **WCAG 2.1 Level AA** with Lighthouse and
WAVE, then rebuilt it until every automated check passed and every fix had been
confirmed by hand.

**The audit found 24 issues**, of which 6 were critical and 9 serious. The most
significant were: no skip link, so keyboard users tabbed through more than forty
navigation and footer links on every page load; body text at a contrast ratio of only
2.9:1; a placeholder used as the only label on the newsletter field; form errors
signalled by red text alone with no `aria-describedby` connection and no
`role="alert"`; heading levels that jumped from `h2` to `h4`; images with no `alt`
attribute at all; a mobile menu button with no `aria-expanded`; a dialog that did not
trap focus and did not return focus to the button that opened it; `outline: none`
with no replacement anywhere; three unlabelled navigation landmarks; a data table
with no caption and no `scope`; a wide table that forced horizontal page scrolling at
320 pixels; animation that ignored `prefers-reduced-motion`; status colours used as
the only differentiator; and a reading-progress bar exposed to assistive technology.

**The remediated page scores 100 on the Lighthouse Accessibility audit with zero axe
violations and zero WAVE alerts.** I rebuilt the colour palette so every text pair
meets at least 4.5:1, added descriptive `alt` text for meaningful images and empty
`alt` for decorative ones, gave every landmark a unique accessible name, added a
caption and scoped headers to the table, trapped and restored focus in the dialog,
and made error messages text that is announced and tied to the field.

**Beyond the fixes**, I added three features because the audit showed the page could
not adapt to the individual: a text-size control (100–140 %), a high-contrast mode
and a dark theme, all persisted in `localStorage` and all announced through a polite
live region. Keyboard shortcuts are provided, with typing in a field correctly
suppressing them. The audit report documents each issue, its WCAG success criterion,
the technique used, the manual verification step and the tools used.

— **Chandra Prakash Thakur**, Junior Frontend Developer Internship
