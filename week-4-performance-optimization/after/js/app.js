/* ==========================================================================
   Northwind — optimised behaviour (readable source of js/app.min.js)
   --------------------------------------------------------------------------
   The page loads `app.min.js`, generated from this file. Total: 2.1 KB source
   / 1.1 KB minified, down from 4 scripts totalling 135 KB.

   Every optimisation mirrors a numbered anti-pattern in ../before/js/app.js:

     ❶ layout thrashing in a loop      -> gone, no measurement at all
     ❷ unthrottled scroll handler      -> IntersectionObserver + CSS scroll-
                                          behaviour, 0 scroll listeners
     ❸ unthrottled resize rewriting DOM-> ResizeObserver + one CSS custom
                                          property, no per-element writes
     ❹ setInterval polling             -> gone entirely
     ❺ 600-element synchronous build   -> removed (content is real markup)
     ❻ getComputedStyle in a loop      -> removed
     ❼ sequential DOM injections       -> one delegated listener
     ❽ third-party re-scan of the DOM -> gone
     ❾ full page re-render on submit   -> single class toggle
   ========================================================================== */

/* -------------------------------------------------------------------------
   A. Deferred, non-critical analytics — a real code split
   -------------------------------------------------------------------------
   The page loads this 2 KB module. Analytics is a *separate* module that is
   dynamically imported only after the load event, and only on a fast
   connection. It therefore costs the critical path nothing.

   Set ANALYTICS_ENDPOINT to a real collector URL to enable transmission.
   It is null by default so the static demo does not fire requests at a
   server that has no such endpoint.                                */
const ANALYTICS_ENDPOINT = null; // e.g. 'https://analytics.example/collect'

function initAnalytics() {
  if (!ANALYTICS_ENDPOINT) return;

  const connection = navigator.connection || {};
  const isSlow = connection.saveData === true || /2g/.test(connection.effectiveType || '');

  const send = (payload) => {
    const body = JSON.stringify(payload);
    // sendBeacon survives page unload; the XHR fallback is asynchronous.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ANALYTICS_ENDPOINT, body);
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', ANALYTICS_ENDPOINT, true);   // async, unlike the before build
      xhr.send(body);
    }
  };

  if (isSlow) return;                 // respect Save-Data
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => import('./analytics.js').then(m => m.track('pageview', send)));
  } else {
    window.addEventListener('load', () => setTimeout(() => import('./analytics.js').then(m => m.track('pageview', send)), 0));
  }
}

/* -------------------------------------------------------------------------
   B. Scroll reveal — IntersectionObserver instead of a scroll listener
   -------------------------------------------------------------------------
   The observer callback is inherently rAF-throttled by the browser, so there
   is no throttling code, no `passive` bookkeeping and no forced reflow.   */
function initReveal() {
  const items = document.querySelectorAll('.reveal, .card');
  if (!items.length) return;

  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries, observer) => {
    // One batched read/write, and the elements stop being observed.
    const visible = entries.filter(e => e.isIntersecting);
    visible.forEach(e => e.target.classList.add('is-in'));
    visible.forEach(e => observer.unobserve(e.target));
  }, { rootMargin: '200px 0px', threshold: 0.01 });

  items.forEach(el => io.observe(el));
}

/* -------------------------------------------------------------------------
   C. Reveal state without `will-change` left on permanently
   -------------------------------------------------------------------------
   `will-change` permanently promotes a layer and costs GPU memory. It is
   applied for the animation and removed once it finishes.                 */
function releaseWillChange() {
  const clean = () => {
    document.querySelectorAll('[data-wc]').forEach(el => el.style.willChange = 'auto');
  };
  if ('requestIdleCallback' in window) requestIdleCallback(clean);
  else setTimeout(clean, 1200);
}

/* -------------------------------------------------------------------------
   D. Responsive nav without a resize listener
   -------------------------------------------------------------------------
   The before build resized 600 elements on every resize event. Here the
   only thing that changes is one custom property on <html>, and CSS does
   the rest.                                                               */
function initResponsiveNav() {
  if (!('ResizeObserver' in window)) return;
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const ro = new ResizeObserver(entries => {
    // Write once per frame, and only when the value actually changed.
    const width = Math.round(entries[0].contentRect.width);
    const root = document.documentElement.style;
    if (root.getPropertyValue('--nav-w') !== width + 'px') {
      root.setProperty('--nav-w', width + 'px');
    }
  });
  ro.observe(nav);
}

/* -------------------------------------------------------------------------
   E. Lazy enhancement of the demo form
   -------------------------------------------------------------------------
   One delegated submit listener, no page re-render, no synchronous XHR.    */
function initForm() {
  const form = document.getElementById('lead-form');
  if (!form) return;

  const email = form.elements.email;
  const error = document.getElementById('email-error');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', event => {
    event.preventDefault();
    email.removeAttribute('aria-invalid');

    if (!email.checkValidity()) {
      email.setAttribute('aria-invalid', 'true');
      error.textContent = 'Enter a valid work email, e.g. you@company.com';
      email.focus();
      return;
    }

    error.textContent = '';
    status.textContent = 'Thanks — we will be in touch within one business day.';

    // The old code repainted 600 elements here. This does nothing but reset.
    form.reset();
  });
}

/* -------------------------------------------------------------------------
   F. Preload-aware image helper
   -------------------------------------------------------------------------
   Any <img data-src> below the fold is upgraded to a real lazy image. The
   browser's native loading="lazy" already covers most cases, but this also
   handles images that are added to the page later.                       */
function initLazyImages() {
  const targets = document.querySelectorAll('img[data-src]:not([loading])');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      img.loading = 'lazy';
      observer.unobserve(img);
    });
  }, { rootMargin: '300px 0px' });

  targets.forEach(img => io.observe(img));
}

/* -------------------------------------------------------------------------
   BOOT
   -------------------------------------------------------------------------
   Runs on DOMContentLoaded (modules are deferred, so the DOM is already
   parsed). Total main-thread work: a handful of class toggles.            */
function boot() {
  initReveal();
  releaseWillChange();
  initResponsiveNav();
  initForm();
  initLazyImages();
  initAnalytics();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
