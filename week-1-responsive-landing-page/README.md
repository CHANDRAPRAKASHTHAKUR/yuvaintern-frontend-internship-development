# Week 1 — Responsive Landing Page

**Author: Chandra Prakash Thakur**

A single, production-style marketing landing page for **NovaDesk** (a fictional team
workspace SaaS), built with semantic HTML5, modern CSS (Grid + Flexbox) and vanilla
JavaScript. No frameworks, no build step, no external assets.

## How to run

```bash
# Option A — just open the file
start index.html

# Option B — serve it (recommended, needed for anything using fetch later)
cd week-1-responsive-landing-page
python -m http.server 8080
# then visit http://localhost:8080
```

## File structure

```
week-1-responsive-landing-page/
├── index.html      # Semantic HTML5 document
├── css/
│   └── styles.css  # Design tokens → components → responsive → a11y/print
└── js/
    └── main.js     # 8 self-contained interactivity modules
```

## Page sections (all landmark + heading correct)

| Element | Markup used |
| --- | --- |
| Skip link | `<a class="skip-link">` as the first focusable node |
| Header / nav | `<header>` + `<nav aria-label="Primary">` + `<ul>` |
| Hero | `<section aria-labelledby>` + `<h1>` + `<dl>` for the stats |
| Features | `<ul>` of 6 cards, CSS Grid `auto-fit` |
| Workflow | `<ol>` of 3 steps |
| Testimonials | scroll-snap carousel, `<blockquote>` + `<cite>`-style author |
| Pricing | `<article>` cards with `<h3>` headings |
| FAQ | native `<details>` / `<summary>` (works with JS disabled) |
| Sign-up form | `<form novalidate>` with real `<label>`s and inline `role="alert"` errors |
| Footer | `<footer>` with three labelled `<nav>` regions |

## Responsiveness strategy

- **Mobile-first** — base styles target small screens, media queries at
  `1024px`, `880px`, `640px` and `380px` progressively enhance.
- **Fluid typography** with `clamp()` so headings scale smoothly instead of
  jumping between breakpoints.
- **Intrinsic grids** — `repeat(auto-fit, minmax(280px, 1fr))` means the feature,
  pricing and step grids reflow to 2 or 1 columns with zero extra CSS.
- **One breakpoint switches layout mode**: below `880px` the inline nav becomes a
  hamburger panel that slides in from the top.
- **Touch-friendly**: `@media (hover: none)` removes hover lifts and bumps tap
  targets to 46px minimum.
- `hover`, `focus-visible` and `active` states are all styled — never
  `outline: none` without a replacement.

## JavaScript modules (vanilla, ~330 lines)

| Module | Responsibility |
| --- | --- |
| `MobileNavigation` | Toggles `aria-expanded` + `.is-open`, closes on link tap, Escape, and resize past the breakpoint; locks body scroll |
| `StickyHeader` | Adds `.is-stuck` shadow past 8px (passive scroll listener) |
| `ActiveNavLink` | Scroll-spy that highlights the section in view, throttled with `requestAnimationFrame` |
| `CountUpStats` | Animates hero numbers with `requestAnimationFrame` + `easeOutCubic`, honours reduced motion |
| `ScrollReveal` | `IntersectionObserver` entrance animations with a 70ms stagger |
| `TestimonialSlider` | Scroll-snap carousel: dots, prev/next, auto-advance paused on hover/focus/hidden tab |
| `SignupForm` | Field-level validation, custom messages, focus moved to the first error |
| `Toast` | `role="status"` transient confirmation messages |

Performance-minded details: `defer` on the script, inline SVG icons (no icon-font
request), a CSS-gradient hero illustration instead of a screenshot, a data-URI
favicon, and `passive: true` on every scroll listener.

## Accessibility & quality

- One `<h1>`, ordered heading levels, landmark regions for every section.
- `aria-expanded` / `aria-controls` on the menu button, `aria-current="page"` on
  the active nav link, `aria-live="polite"` on the form status and toast.
- `prefers-reduced-motion` disables the count-up, auto-play and reveal animations.
- Visible 3px focus ring using `:focus-visible` only, so mouse users are not
  affected.
- Contrast: body text `#2c3145` on `#ffffff` (12.6:1), muted text `#565d75`
  (7.1:1), primary button white on `#4f46e5` (6.3:1) — all pass WCAG 2.1 AA.

## Browser support

Chrome / Edge / Firefox / Safari (current two versions) and iOS Safari. The
navigation degrades gracefully: with JS disabled the desktop menu still renders
and anchors work, because the mobile panel is only hidden by the `max-width:
880px` media query plus a class that JS removes.
