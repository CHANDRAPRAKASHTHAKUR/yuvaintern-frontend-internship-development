/* ==========================================================================
   NovaDesk — Landing Page Interactivity
   --------------------------------------------------------------------------
   Vanilla JavaScript, no dependencies. Organised as small, single-purpose
   modules that are each initialised on DOMContentLoaded:

     1. MobileNavigation  – hamburger toggle + focus handling + scroll lock
     2. StickyHeader      – adds a shadow once the page is scrolled
     3. ActiveNavLink     – highlights the section currently in view
     4. CountUpStats      – animates the hero numbers when scrolled into view
     5. ScrollReveal      – IntersectionObserver based entrance animations
     6. TestimonialSlider – scroll-snap carousel with dots + auto-advance
     7. SignupForm        – client-side validation with inline error messages
     8. Toast             – transient status messages (aria-live)
   ========================================================================== */
(function () {
  'use strict';

  /* Small helper: prefers-reduced-motion as a reusable function. */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------
     1. MOBILE NAVIGATION
     ------------------------------------------------------------------ */
  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    /** Opens or closes the mobile menu. */
    function setOpen(isOpen) {
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close main menu' : 'Open main menu');
      nav.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    // Close the menu after tapping any link (anchor jumps should not leave it open)
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    // Close on Escape and return focus to the toggle button
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // If the viewport grows past the mobile breakpoint while open, reset state
    const desktop = window.matchMedia('(min-width: 881px)');
    desktop.addEventListener('change', (event) => {
      if (event.matches && isOpen()) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------
     2. STICKY HEADER SHADOW
     ------------------------------------------------------------------ */
  function initStickyHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    // `passive: true` tells the browser we never call preventDefault(),
    // so scrolling stays on the compositor thread.
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------
     3. ACTIVE NAV LINK (scroll spy)
     ------------------------------------------------------------------ */
  function initScrollSpy() {
    const links = Array.from(document.querySelectorAll('.primary-nav__link[href^="#"]'));
    if (!links.length) return;

    const sections = links
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    // Update the "active" styling on whichever section occupies the middle
    // of the viewport.
    const update = () => {
      const line = window.scrollY + window.innerHeight * 0.35;
      let currentId = '';

      for (const section of sections) {
        if (section.offsetTop <= line) currentId = section.id;
      }

      links.forEach((link) => {
        const isCurrent = link.getAttribute('href') === '#' + currentId;
        link.classList.toggle('is-active', isCurrent);
        if (isCurrent) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };

    // Throttle with requestAnimationFrame so we never do layout work per event.
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      },
      { passive: true }
    );

    update();
  }

  /* ------------------------------------------------------------------
     4. COUNT-UP STAT ANIMATION
     Driven by data attributes so the markup stays declarative:
       data-count-to="4200"          final value
       data-count-dur="1400"        duration in ms (default 1500)
       data-count-decimals="1"      decimal places (default 0)
       data-count-suffix="k"        text appended after the number
     ------------------------------------------------------------------ */
  function initCountUp() {
    const counters = Array.from(document.querySelectorAll('[data-count-to]'));
    if (!counters.length) return;

    const format = (value, decimals, suffix) =>
      value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) + (suffix || '');

    const run = (el) => {
      const target = parseFloat(el.dataset.countTo);
      const duration = parseInt(el.dataset.countDur || '1500', 10);
      const decimals = parseInt(el.dataset.countDecimals || '0', 10);
      const suffix = el.dataset.countSuffix || '';

      if (prefersReducedMotion.matches) {
        el.textContent = format(target, decimals, suffix);
        return;
      }

      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutCubic gives a fast start and a soft landing.
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = format(target * eased, decimals, suffix);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run(entry.target);
            observer.unobserve(entry.target); // animate only once
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     5. SCROLL REVEAL
     ------------------------------------------------------------------ */
  function initScrollReveal() {
    const items = Array.from(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    // Respect the OS setting: show everything immediately, skip the observer.
    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // Stagger the delay based on position so groups cascade in.
          const siblings = Array.from(entry.target.parentElement.children).filter((c) =>
            c.classList.contains('reveal')
          );
          const index = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = Math.min(index, 6) * 70 + 'ms';
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     6. TESTIMONIAL SLIDER
     A CSS scroll-snap track. JS only handles dots, prev/next and the
     optional auto-advance timer (disabled while hovering or focused).
     ------------------------------------------------------------------ */
  function initTestimonials() {
    const track = document.getElementById('testimonial-track');
    const list = document.getElementById('testimonial-list');
    const dotsWrap = document.getElementById('testimonial-dots');
    if (!track || !list || !dotsWrap) return;

    const slides = Array.from(list.children);
    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1) + ' of ' + slides.length);
      dot.addEventListener('click', () => goTo(i, true));
      dotsWrap.appendChild(dot);
      return dot;
    });

    let index = 0;
    let timer = null;
    const AUTO_PLAY_MS = 6000;

    function goTo(next, userInitiated) {
      index = (next + slides.length) % slides.length;
      // Scroll the track so the target slide snaps into view.
      list.scrollTo({ left: slides[index].offsetLeft - list.offsetLeft, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
      dots.forEach((dot, i) => dot.setAttribute('aria-selected', String(i === index)));
      if (userInitiated) restartAutoPlay();
    }

    const nextBtn = track.querySelector('[data-track-next]');
    const prevBtn = track.querySelector('[data-track-prev]');
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1, true));
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1, true));

    // Keep the dots in sync when the user swipes / scrolls the track manually.
    let scrollTicking = false;
    list.addEventListener(
      'scroll',
      () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
          const nearest = slides.reduce(
            (best, slide, i) =>
              Math.abs(slide.offsetLeft - list.scrollLeft) < Math.abs(slides[best].offsetLeft - list.scrollLeft) ? i : best,
            0
          );
          if (nearest !== index) {
            index = nearest;
            dots.forEach((dot, i) => dot.setAttribute('aria-selected', String(i === index)));
          }
          scrollTicking = false;
        });
      },
      { passive: true }
    );

    // Auto-advance, paused on hover / focus / when the tab is hidden.
    function restartAutoPlay() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (!document.hidden) goTo(index + 1, false);
      }, AUTO_PLAY_MS);
    }
    if (!prefersReducedMotion.matches) {
      restartAutoPlay();
      track.addEventListener('mouseenter', () => clearInterval(timer));
      track.addEventListener('mouseleave', restartAutoPlay);
      track.addEventListener('focusin', () => clearInterval(timer));
      track.addEventListener('focusout', restartAutoPlay);
      document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : restartAutoPlay()));
    }
  }

  /* ------------------------------------------------------------------
     7. SIGN-UP FORM VALIDATION
     Native constraint validation is used as the source of truth, then we
     render friendly inline messages and move focus to the first error.
     ------------------------------------------------------------------ */
  function initSignupForm() {
    const form = document.getElementById('signup-form');
    if (!form) return;

    /** Custom messages — clearer than the browser's default wording. */
    const messages = {
      name: 'Please enter your full name (at least 2 characters).',
      email: 'Please enter a valid work email, e.g. you@company.com',
      'team-size': 'Please choose your team size.',
      terms: 'You need to accept the terms to continue.',
    };

    const fieldConfig = {
      name: { input: form.elements.name, error: document.getElementById('name-error') },
      email: { input: form.elements.email, error: document.getElementById('email-error') },
      'team-size': { input: form.elements['team-size'], error: document.getElementById('team-error') },
      terms: { input: form.elements.terms, error: document.getElementById('terms-error') },
    };

    /** Validates one field and paints its error state. Returns true when valid. */
    function validateField(key) {
      const { input, error } = fieldConfig[key];
      if (!input) return true;

      let valid = input.checkValidity();
      // Extra rule: reject obviously disposable/personal domains for a "work email".
      if (valid && key === 'email') {
        const value = input.value.trim().toLowerCase();
        const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
        const domain = value.split('@')[1] || '';
        if (personalDomains.includes(domain)) {
          valid = false;
          error.textContent = 'Please use your work email address.';
        }
      }
      if (valid) {
        error.textContent = '';
        input.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
      } else {
        error.textContent = error.textContent || messages[key];
        input.classList.add('has-error');
        input.setAttribute('aria-invalid', 'true');
      }
      return valid;
    }

    // Validate on blur, then "live-correct" once a field has been marked invalid.
    Object.entries(fieldConfig).forEach(([key, { input }]) => {
      if (!input) return;
      input.addEventListener('blur', () => validateField(key));
      input.addEventListener('input', () => {
        if (input.classList.contains('has-error')) validateField(key);
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const keys = Object.keys(fieldConfig);
      const results = keys.map(validateField);
      const firstInvalid = keys[results.indexOf(false)];

      if (firstInvalid) {
        fieldConfig[firstInvalid].input.focus();
        showToast('Please fix the highlighted fields.');
        return;
      }

      // No backend in this task — simulate the network round trip.
      const status = document.getElementById('form-status');
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = 'Creating workspace…';
      status.textContent = '';

      window.setTimeout(() => {
        form.reset();
        button.disabled = false;
        button.textContent = 'Create workspace';
        status.textContent = 'Welcome aboard! Check your inbox to verify your email.';
        showToast('Workspace created 🎉');
      }, 1200);
    });
  }

  /* ------------------------------------------------------------------
     8. TOAST
     ------------------------------------------------------------------ */
  let toastTimer;
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    // Force a reflow so the transition runs when the element goes from hidden.
    void toast.offsetWidth;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => (toast.hidden = true), 400);
    }, 3600);
  }

  /* ------------------------------------------------------------------
     BOOTSTRAP
     ------------------------------------------------------------------ */
  function init() {
    initMobileNav();
    initStickyHeader();
    initScrollSpy();
    initCountUp();
    initScrollReveal();
    initTestimonials();
    initSignupForm();

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
