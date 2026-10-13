# Week 1 — Responsive Landing Page: submission description

**Author: Chandra Prakash Thakur**

*(355 words — paste into the "Write description for the report" box)*

I built a complete, production-style marketing landing page for a fictional team
workspace product called **NovaDesk**, using only semantic HTML5, modern CSS and
vanilla JavaScript, with no framework and no build step.

**Structure.** The page is divided into eight clearly labelled sections: a sticky
header with navigation, a hero with a headline and animated statistics, a customer
logo strip, a six-card feature grid, a three-step workflow, a testimonial carousel,
a three-tier pricing table, an accessible FAQ built on native `<details>` elements,
a validated sign-up form and a structured footer. Every region is wrapped in the
correct landmark element, there is exactly one `<h1>`, heading levels are strictly
sequential, the hero statistics use a `<dl>` list, and the workflow uses an ordered
list. A skip link is the first focusable element so keyboard users can bypass the
navigation.

**Responsive strategy.** The CSS is mobile-first. I used intrinsic CSS Grid
(`repeat(auto-fit, minmax(280px, 1fr))`) so the feature, pricing and step grids
reflow to two and one columns with no extra rules, and `clamp()` for fluid
typography so headings scale smoothly instead of jumping at breakpoints. Four
media queries (1024px, 880px, 640px, 380px) progressively enhance the layout; below
880px the inline navigation collapses into an accessible hamburger panel. A
`hover: none` media query removes hover lifts and raises every tap target to a
minimum of 46 pixels.

**JavaScript.** Eight small, single-purpose modules: mobile navigation with
`aria-expanded` management and Escape-to-close, a sticky header shadow, a
scroll-spy throttled with `requestAnimationFrame`, count-up statistics, scroll-reveal
animations driven by `IntersectionObserver`, a testimonial carousel with auto-advance
that pauses on hover, focus and hidden tabs, a sign-up form with inline validation,
and a toast component.

**Performance and accessibility.** The script is loaded with `defer`, icons are
inline SVG so no icon font is downloaded, and the hero illustration is pure CSS.
Focus rings use `:focus-visible`, the colour palette passes WCAG AA contrast at
4.5:1 or better, and `prefers-reduced-motion` disables the count-up, the carousel
auto-play and the reveal animations.

— **Chandra Prakash Thakur**, Junior Frontend Developer Internship
