/* ==========================================================================
   Fieldnotes — progressive enhancement for the accessible blog
   --------------------------------------------------------------------------
   Everything here is optional: with JavaScript disabled the article is still
   fully readable, every form still has labels, and the FAQ (native <details>)
   still works. The script only adds:

     1. KeyboardShortcuts  – "/", "t", "?" shortcuts (ignored while typing)
     2. MobileNav         – hamburger drawer with aria-expanded + Esc
     3. FocusDialog       – accessible modal with focus trap and focus restore
     4. A11yToolbar       – text size, high contrast and dark theme, persisted
     5. FormValidator     – inline errors tied to fields with aria-describedby
     6. ReadingProgress   – decorative progress bar (hidden from AT)
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;

  function onReady(fn) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ======================================================================
     Shared helpers
     ====================================================================== */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function focusables(scope) {
    return Array.prototype.filter.call(scope.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetWidth > 0 || el.offsetHeight > 0;
    });
  }

  /** Polite live region used for non-visual confirmations. */
  function announce(message) {
    var live = doc.getElementById('a11y-live');
    if (!live) return;
    live.textContent = '';
    // A tick of delay makes repeated identical messages re-announce.
    window.setTimeout(function () { live.textContent = message; }, 60);
  }

  var STORE = {
    get: function (key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
    set: function (key, value) { try { window.localStorage.setItem(key, value); } catch (e) {} }
  };

  /* ======================================================================
     1. KEYBOARD SHORTCUTS
     ====================================================================== */
  function initShortcuts() {
    doc.addEventListener('keydown', function (e) {
      // Never hijack a key while the user is typing.
      var tag = (e.target.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case '/':
          e.preventDefault();
          var nameField = doc.getElementById('comment-name');
          if (nameField) {
            nameField.focus();
            announce('Moved focus to the comment name field.');
          }
          break;
        case 't':
        case 'T':
          e.preventDefault();
          toggleTheme();
          break;
        case '?':
          e.preventDefault();
          openDialog('shortcuts-dialog', doc.querySelector('[data-modal-open="shortcuts-dialog"]'));
          break;
      }
    });
  }

  /* ======================================================================
     2. MOBILE NAVIGATION
     ====================================================================== */
  function initMobileNav() {
    var btn = doc.getElementById('menu-btn');
    var nav = doc.getElementById('mobile-nav');
    if (!btn || !nav) return;

    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      nav.hidden = !open;
      var srText = btn.querySelector('.sr-only');
      if (srText) srText.textContent = open ? 'Close navigation menu' : 'Open navigation menu';
    }

    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });

    // Close after picking an item, on Esc, and when the viewport widens.
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && btn.getAttribute('aria-expanded') === 'true') setOpen(false);
    });

    setOpen(false);
  }

  /* ======================================================================
     3. FOCUS DIALOG
     Traps Tab, closes on Esc / backdrop, marks the page behind as aria-hidden
     and always returns focus to the trigger.
     ====================================================================== */
  var dialogOpener = null;
  var dialogScrollY = 0;
  var escapeHandler = null;
  var main = doc.querySelector('main');

  /**
   * Attaches the dialog's own listeners exactly once.
   *
   * These listeners live on elements that are hidden most of the time, so
   * leaving them attached costs nothing and avoids the classic bug where
   * re-opening a dialog loses its backdrop handler. Only the document-level
   * Escape listener has to be added and removed per open/close.
   */
  function bindDialog(root) {
    if (root._novaBound) return;
    root._novaBound = true;

    var dialog = root.querySelector('.modal__dialog');

    // 2.1.2 / 2.4.3 — Tab must cycle inside the dialog, never escape it.
    dialog.addEventListener('keydown', function onTrap(e) {
      if (e.key !== 'Tab') return;
      var list = focusables(dialog);
      if (!list.length) { e.preventDefault(); return; }
      var first = list[0];
      var last = list[list.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Clicking the backdrop closes the dialog.
    root.addEventListener('mousedown', function onBackdrop(e) {
      if (e.target === root || e.target.hasAttribute('data-modal-close')) closeDialog();
    });

    var closes = root.querySelectorAll('[data-modal-close]');
    for (var i = 0; i < closes.length; i++) {
      closes[i].addEventListener('click', closeDialog);
    }
  }

  function openDialog(id, opener) {
    var root = doc.getElementById(id);
    if (!root) return;
    bindDialog(root);

    var dialog = root.querySelector('.modal__dialog');

    // Prefer the trigger passed by the caller: `document.activeElement` is not
    // always the button (a synthetic click, or a Safari quirk, will leave it on
    // <body>), and focus has to go back to the right place.
    dialogOpener = opener || doc.activeElement;
    dialogScrollY = window.scrollY;

    root.hidden = false;
    doc.body.style.overflow = 'hidden';
    // 4.1.2 Name, Role, Value — hide the rest of the page from assistive tech
    main.setAttribute('aria-hidden', 'true');
    doc.querySelector('.masthead').setAttribute('aria-hidden', 'true');

    var items = focusables(dialog);
    (items[0] || dialog).focus();

    escapeHandler = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeDialog(); }
    };
    doc.addEventListener('keydown', escapeHandler);
  }

  function closeDialog() {
    var root = doc.querySelector('.modal:not([hidden])');
    if (!root) return;
    if (escapeHandler) {
      doc.removeEventListener('keydown', escapeHandler);
      escapeHandler = null;
    }

    root.hidden = true;
    doc.body.style.overflow = '';
    main.removeAttribute('aria-hidden');
    doc.querySelector('.masthead').removeAttribute('aria-hidden');

    // 2.4.3 Focus Order — return focus to whatever opened the dialog
    if (dialogOpener && doc.contains(dialogOpener)) dialogOpener.focus();
    if (window.scrollY !== dialogScrollY) window.scrollTo(0, dialogScrollY);
    announce('Dialog closed.');
  }

  function initDialog() {
    Array.prototype.forEach.call(doc.querySelectorAll('[data-modal-open]'), function (btn) {
      btn.addEventListener('click', function () {
        openDialog(btn.getAttribute('data-modal-open'), btn);
      });
    });
  }
  /* ======================================================================
     4. ACCESSIBILITY TOOLBAR
     ====================================================================== */
  var TEXT_SIZES = [100, 110, 125, 140];
  var textIndex = 0;

  function applyTextSize() {
    var pct = TEXT_SIZES[textIndex];
    // Must be set on <html>, not <body>: the rule that consumes it is
    // `html { font-size: calc(100% * var(--text-scale)) }`, and a custom
    // property set on a descendant cannot affect it.
    doc.documentElement.style.setProperty('--text-scale', String(pct / 100));
    var readout = doc.getElementById('textsize-readout');
    if (readout) readout.textContent = 'Text size ' + pct + '%';
    STORE.set('fn-textsize', String(textIndex));
    // Announce the new value — 4.1.3 Status Messages
    announce('Text size set to ' + pct + ' percent.');
  }

  function toggleTheme() {
    var next = doc.body.dataset.theme === 'dark' ? 'light' : 'dark';
    doc.body.dataset.theme = next;
    STORE.set('fn-theme', next);
    announce(next === 'dark' ? 'Dark theme enabled.' : 'Light theme enabled.');
  }

  function initToolbar() {
    // Restore previously chosen preferences before the user sees a flash.
    var savedTheme = STORE.get('fn-theme');
    if (savedTheme) doc.body.dataset.theme = savedTheme;
    var savedSize = STORE.get('fn-textsize');
    if (savedSize !== null) {
      textIndex = Math.min(Math.max(parseInt(savedSize, 10), 0), TEXT_SIZES.length - 1);
      doc.documentElement.style.setProperty('--text-scale', String(TEXT_SIZES[textIndex] / 100));
      var readout = doc.getElementById('textsize-readout');
      if (readout) readout.textContent = 'Text size ' + TEXT_SIZES[textIndex] + '%';
    }
    var savedContrast = STORE.get('fn-contrast');
    if (savedContrast === 'high') {
      doc.body.dataset.contrast = 'high';
      var btn = doc.querySelector('button[data-contrast]');
      if (btn) btn.setAttribute('aria-pressed', 'true');
    }

    // NOTE: the selectors below are scoped to `button[…]` on purpose. The
    // <body> element also carries `data-theme` / `data-contrast` state
    // attributes, and an unscoped `[data-contrast]` would match <body> first
    // (it comes earlier in the document) and bind the handler to the wrong
    // element entirely.
    Array.prototype.forEach.call(doc.querySelectorAll('button[data-textsize]'), function (btn) {
      btn.addEventListener('click', function () {
        var dir = btn.getAttribute('data-textsize');
        textIndex = Math.min(Math.max(textIndex + (dir === 'up' ? 1 : -1), 0), TEXT_SIZES.length - 1);
        applyTextSize();
      });
    });

    var contrastBtn = doc.querySelector('button[data-contrast]');
    if (contrastBtn) {
      contrastBtn.addEventListener('click', function () {
        var high = contrastBtn.getAttribute('aria-pressed') !== 'true';
        contrastBtn.setAttribute('aria-pressed', String(high));
        doc.body.dataset.contrast = high ? 'high' : 'normal';
        STORE.set('fn-contrast', high ? 'high' : 'normal');
        announce(high ? 'High contrast enabled.' : 'Standard contrast enabled.');
      });
    }

    var themeBtn = doc.querySelector('button[data-theme-toggle]');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  }

  /* ======================================================================
     5. FORM VALIDATION
     Errors are rendered as text inside a role="alert" element that the field
     already points at with aria-describedby, and the invalid state is also
     reflected with aria-invalid so it is announced programmatically.
     ====================================================================== */
  function initForm(formId, statusId) {
    var form = doc.getElementById(formId);
    var status = doc.getElementById(statusId);
    if (!form) return;

    function errorIdFor(input) {
      // Not every control has an error slot: the topic checkboxes inside the
      // fieldset only have a legend, so there is nothing to look up.
      var describedby = input.getAttribute('aria-describedby');
      if (!describedby) return null;
      return describedby.split(' ').filter(function (id) {
        return id.indexOf('-error') > -1;
      })[0] || null;
    }

    function validate(input) {
      var errorEl = doc.getElementById(errorIdFor(input)) || null;
      var label = form.querySelector('label[for="' + input.id + '"]');
      var labelText = label ? label.textContent.replace('*', '').trim() : 'This field';

      var message = '';
      if (input.validity.valueMissing) message = labelText + ' is required.';
      else if (input.validity.typeMismatch && input.type === 'email') message = 'Enter a valid email address, for example name@company.com.';
      else if (input.validity.tooShort) message = labelText + ' must be at least ' + input.minLength + ' characters long.';

      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (errorEl) errorEl.textContent = message;
      return !message;
    }

    var fields = Array.prototype.filter.call(form.elements, function (el) { return el.willValidate; });

    fields.forEach(function (input) {
      // Validate on blur, then re-validate live once the field is in an error state.
      input.addEventListener('blur', function () { validate(input); });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') validate(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var results = fields.map(validate);
      var firstBad = fields[results.indexOf(false)];

      if (firstBad) {
        firstBad.focus();
        announce('The form has errors. Focus moved to ' + (firstBad.id) + '.');
        return;
      }

      if (status) status.textContent = 'Thank you — your submission has been received.';
      announce('Form submitted successfully.');
      form.reset();
    });
  }

  /* ======================================================================
     6. READING PROGRESS BAR
     The bar is decorative, so it is aria-hidden in the markup and the value is
     never announced.
     ====================================================================== */
  function initProgress() {
    var bar = doc.getElementById('read-progress');
    var article = doc.getElementById('article-body');
    if (!bar || !article) return;

    var ticking = false;
    function update() {
      var rect = article.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var scrolled = Math.min(Math.max(-rect.top, 0), total);
      var pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = pct.toFixed(1) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('resize', update);
    update();
  }

  /* ======================================================================
     BOOTSTRAP
     ====================================================================== */
  onReady(function () {
    initShortcuts();
    initMobileNav();
    initDialog();
    initToolbar();
    initForm('author-form', 'author-form-status');
    initForm('comment-form', 'comment-form-status');
    initForm('mini-form', 'mini-form-status');
    initProgress();
  });
})();
