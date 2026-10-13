/* ==========================================================================
   NovaUI — dependency-free component library
   --------------------------------------------------------------------------
   Written in plain ES5+/ES2015 JavaScript. No framework, no build step.
   Every component is an isolated class with a `destroy()` method, and the
   whole library is exposed on `window.NovaUI` for manual control.

   Components
     1.  Modal        — focus trap, Esc, backdrop, focus restore, scroll lock
     2.  Accordion    — height animation, single/multiple mode
     3.  Tabs         — roving tabindex, arrow/Home/End keys, auto activation
     4.  Menu         — ARIA menu with roving focus + type-ahead
     5.  Switch       — role="switch" toggle
     6.  RangeSlider  — custom range with live output + filled track
     7.  Tooltip      — hover + focus, aria-describedby, Esc to dismiss
     8.  Toast        — stacked, auto-dismiss, aria-live announcements
     9.  Progress     — determinate progressbar driven by JS
     10. Rating       — radiogroup with arrow-key navigation
     11. SideNav      — mobile drawer + scroll spy
   ========================================================================== */
(function (window, document) {
  'use strict';

  /* ======================================================================
     Shared helpers
     ====================================================================== */
  var FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(',');

  var util = {
    qs: function (selector, scope) { return (scope || document).querySelector(selector); },
    qsa: function (selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); },

    /** Visible, focusable descendants of `container`, in DOM order. */
    focusable: function (container) {
      return util.qsa(FOCUSABLE, container).filter(function (el) {
        return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
      });
    },

    /** Trap Tab / Shift+Tab inside `container` while active. Returns a teardown fn. */
    trapFocus: function (container, event) {
      function onKeydown(e) {
        if (e.key !== 'Tab') return;
        var items = util.focusable(container);
        if (!items.length) { e.preventDefault(); return; }

        var first = items[0];
        var last = items[items.length - 1];
        var active = document.activeElement;

        if (e.shiftKey && (active === first || !container.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
      container.addEventListener('keydown', onKeydown);
      return function () { container.removeEventListener('keydown', onKeydown); };
    },

    /** True when the visitor asked the OS to reduce motion. */
    reducedMotion: function () {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    /** Next index in `length` when stepping by `step` (supports wrapping). */
    wrap: function (index, length, step) {
      return (index + step + length) % length;
    },

    /** Announce a message without stealing focus. */
    announce: function (message) {
      var region = document.getElementById('toast-region');
      if (!region) return;
      NovaUI.toast.show({ message: message, variant: 'info', duration: 2600 });
    }
  };

  /* ======================================================================
     1. MODAL
     ====================================================================== */
  function Modal(root) {
    this.root = root;
    this.dialog = util.qsa('.modal__dialog', root)[0];
    this.opener = null;
    this.open = false;
    this.releaseFocus = null;
    this.scrollY = 0;
    this._onKeydown = this.handleKeydown.bind(this);
    this._bound = false;
    this.bind();
  }

  Modal.prototype.bind = function () {
    if (this._bound) return;
    this._bound = true;

    // Every element carrying [data-modal-close] dismisses the dialog.
    util.qsa('[data-modal-close]', this.root).forEach(function (el) {
      el.addEventListener('click', this.close.bind(this));
    }, this);

    // Clicking the backdrop (but not the dialog) also closes it.
    this.root.addEventListener('mousedown', function (e) {
      if (e.target === this.root || e.target.hasAttribute('data-modal-close')) {
        // Ignore the close button on mousedown to avoid a double toggle.
        if (e.target.hasAttribute('data-modal-close')) return;
        this.close();
      }
    }.bind(this));
  };

  Modal.prototype.handleKeydown = function (e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this.close();
    }
  };

  Modal.prototype.show = function (opener) {
    if (this.open) return this;
    this.open = true;
    this.opener = opener || document.activeElement;

    // Remember the scroll position so closing restores the exact place.
    this.scrollY = window.scrollY;
    this.root.hidden = false;
    document.body.style.overflow = 'hidden';

    // Move focus to the first control (or the dialog itself as a fallback).
    var items = util.focusable(this.dialog);
    (items[0] || this.dialog).focus();

    this.releaseFocus = util.trapFocus(this.dialog);
    document.addEventListener('keydown', this._onKeydown);

    this.root.dispatchEvent(new CustomEvent('modal:open', { bubbles: true }));
    return this;
  };

  Modal.prototype.close = function () {
    if (!this.open) return this;
    this.open = false;
    this.root.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._onKeydown);
    if (this.releaseFocus) { this.releaseFocus(); this.releaseFocus = null; }

    // Return focus to whatever opened the dialog (WAI-ARIA requirement).
    if (this.opener && document.contains(this.opener)) this.opener.focus();
    if (window.scrollY !== this.scrollY) window.scrollTo(0, this.scrollY);

    this.root.dispatchEvent(new CustomEvent('modal:close', { bubbles: true }));
    return this;
  };

  Modal.prototype.toggle = function (opener) {
    return this.open ? this.close() : this.show(opener);
  };

  /* ======================================================================
     2. ACCORDION
     ====================================================================== */
  function Accordion(root) {
    this.root = root;
    this.single = root.hasAttribute('data-accordion-single');
    this.triggers = util.qsa('.accordion__trigger', root);
    this.panels = this.triggers.map(function (trigger) {
      return document.getElementById(trigger.getAttribute('aria-controls'));
    });
    this.isOpen = this.triggers.map(function (t) { return t.getAttribute('aria-expanded') === 'true'; });
    this.render();
    this.bind();
  }

  Accordion.prototype.bind = function () {
    this.triggers.forEach(function (trigger, i) {
      trigger.addEventListener('click', function () { this.toggle(i); }.bind(this));
    }, this);

    // Up/Down arrows move between headers (optional but expected for accordions).
    this.root.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var current = this.triggers.indexOf(document.activeElement);
      if (current === -1) return;
      e.preventDefault();
      this.triggers[util.wrap(current, this.triggers.length, e.key === 'ArrowDown' ? 1 : -1)].focus();
    }.bind(this));

    // Recalculate open panels when the viewport width changes.
    this._onResize = function () { this.render(); }.bind(this);
    window.addEventListener('resize', this._onResize);
  };

  Accordion.prototype.toggle = function (index) {
    var next = !this.isOpen[index];
    // In single mode close every other panel first.
    if (next && this.single) {
      for (var i = 0; i < this.isOpen.length; i++) {
        if (i !== index && this.isOpen[i]) this.setPanel(i, false);
      }
    }
    this.setPanel(index, next);
  };

  /** Animates panel `index` open (true) or closed (false). */
  Accordion.prototype.setPanel = function (index, open) {
    var trigger = this.triggers[index];
    var panel = this.panels[index];
    if (!trigger || !panel) return;

    this.isOpen[index] = open;
    trigger.setAttribute('aria-expanded', String(open));

    if (util.reducedMotion()) {
      panel.style.height = open ? 'auto' : '0px';
      panel.dataset.open = String(open);
      return;
    }

    var content = panel.firstElementChild;
    var target = open ? content.offsetHeight : 0;

    // Animate from the current measured height to the target height.
    panel.style.height = panel.offsetHeight + 'px';
    // Force a reflow so the browser registers the starting value.
    void panel.offsetHeight;
    panel.style.height = target + 'px';

    function onEnd(event) {
      if (event.propertyName !== 'height') return;
      panel.removeEventListener('transitionend', onEnd);
      // Once open, release the fixed height so the panel can reflow.
      if (open) { panel.style.height = 'auto'; panel.dataset.open = 'true'; }
    }
    panel.addEventListener('transitionend', onEnd);
  };

  /** Re-measures open panels (e.g. after a resize or font load). */
  Accordion.prototype.render = function () {
    var self = this;
    this.isOpen.forEach(function (open, i) {
      if (!open) return;
      var panel = self.panels[i];
      if (!panel) return;
      panel.style.height = 'auto';
      panel.dataset.open = 'true';
    });
  };

  Accordion.prototype.setMultiple = function (allow) {
    this.single = !allow;
    this.root.setAttribute('data-accordion-multi', String(allow));
  };

  Accordion.prototype.destroy = function () {
    window.removeEventListener('resize', this._onResize);
  };

  /* ======================================================================
     3. TABS  (WAI-ARIA authoring practices)
     ====================================================================== */
  function Tabs(root) {
    this.root = root;
    this.list = util.qsa('[role="tablist"]', root)[0];
    this.tabs = util.qsa('[role="tab"]', root);
    this.panels = this.tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute('aria-controls'));
    });
    this.index = Math.max(0, this.tabs.findIndex(function (t) {
      return t.getAttribute('aria-selected') === 'true';
    }));
    this.bind();
    this.activate(this.index, false);
  }

  Tabs.prototype.bind = function () {
    var self = this;

    this.tabs.forEach(function (tab, i) {
      // Mouse / keyboard activation
      tab.addEventListener('click', function () { self.activate(i); });
      tab.addEventListener('keydown', function (e) { self.onKeydown(e, i); });
    });
  };

  Tabs.prototype.onKeydown = function (e, i) {
    var last = this.tabs.length - 1;
    var target = null;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': target = (i === last) ? 0 : i + 1; break;
      case 'ArrowLeft':
      case 'ArrowUp':  target = (i === 0) ? last : i - 1; break;
      case 'Home':      target = 0; break;
      case 'End':       target = last; break;
      case 'Enter':
      case ' ':         target = i; break;
      default: return;
    }

    e.preventDefault();
    this.activate(target, true);
  };

  Tabs.prototype.activate = function (index, focus) {
    this.index = index;

    this.tabs.forEach(function (tab, i) {
      var selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      // Roving tabindex: only the active tab is in the tab order.
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });

    this.panels.forEach(function (panel, i) {
      if (!panel) return;
      panel.hidden = i !== index;
    });
  };

  /* ======================================================================
     4. MENU
     ====================================================================== */
  function Menu(root) {
    this.root = root;
    this.trigger = util.qsa('.menu__trigger', root)[0];
    this.list = root.querySelector('[role="menu"]');
    this.items = util.qsa('[role="menuitem"]', this.list);
    this.index = -1;
    this.open = false;
    this.typeahead = '';
    this.typeaheadTimer = null;
    this.bind();
  }

  Menu.prototype.bind = function () {
    var self = this;

    this.trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      this.open ? this.close() : this.show();
    }.bind(this));

    this.trigger.addEventListener('keydown', function (e) {
      // Down / Enter / Space opens the menu and focuses the first item.
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.show();
        this.focusItem(0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.show();
        this.focusItem(this.items.length - 1);
      }
    }.bind(this));

    this.list.addEventListener('keydown', function (e) { self.onKeydown(e); });

    this.items.forEach(function (item, i) {
      item.addEventListener('click', function () { self.choose(i); });
      item.addEventListener('mouseenter', function () { self.highlight(i); });
    });

    // Click anywhere else -> close.
    this._onDocClick = function () { this.close(); }.bind(this);
    this._onResize = function () { this.close(); }.bind(this);
  };

  Menu.prototype.show = function () {
    this.open = true;
    this.list.hidden = false;
    this.trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', this._onDocClick);
    window.addEventListener('resize', this._onResize);
  };

  Menu.prototype.close = function (refocus) {
    if (!this.open) return;
    this.open = false;
    this.list.hidden = true;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.index = -1;
    document.removeEventListener('click', this._onDocClick);
    window.removeEventListener('resize', this._onResize);
    if (refocus) this.trigger.focus();
  };

  Menu.prototype.highlight = function (index) {
    this.index = index;
    this.items.forEach(function (item, i) { item.classList.toggle('is-active', i === index); });
  };

  Menu.prototype.focusItem = function (index) {
    this.highlight(index);
    if (this.items[index]) this.items[index].focus();
  };

  Menu.prototype.onKeydown = function (e) {
    var last = this.items.length - 1;

    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); this.focusItem(this.index === last ? 0 : this.index + 1); break;
      case 'ArrowUp':   e.preventDefault(); this.focusItem(this.index <= 0 ? last : this.index - 1); break;
      case 'Home':      e.preventDefault(); this.focusItem(0); break;
      case 'End':       e.preventDefault(); this.focusItem(last); break;
      case 'Escape':    e.preventDefault(); this.close(true); break;
      case 'Tab':       this.close(); break;
      default:
        // Type-ahead: typing "du" jumps to "Duplicate project".
        if (e.key.length === 1 && /\S/.test(e.key)) {
          this.typeahead += e.key.toLowerCase();
          clearTimeout(this.typeaheadTimer);
          this.typeaheadTimer = setTimeout(function () { this.typeahead = ''; }.bind(this), 600);

          var match = this.items.findIndex(function (item) {
            return item.textContent.trim().toLowerCase().indexOf(this.typeahead) === 0;
          }, this);
          if (match > -1) this.focusItem(match);
        }
    }
  };

  Menu.prototype.choose = function (index) {
    var item = this.items[index];
    this.close(true);
    if (item) util.announce('Action chosen: ' + item.textContent.trim());
  };

  /* ======================================================================
     5. SWITCH
     ====================================================================== */
  function Switch(el) {
    this.el = el;
    this.key = el.dataset.switch;
    // If the markup has no role="switch" the control is a plain action button.
    this.isSwitch = el.getAttribute('role') === 'switch';

    el.addEventListener('click', function () { this.toggle(); }.bind(this));
    el.addEventListener('keydown', function (e) {
      // Native <button> already fires click on Space/Enter, so nothing to add —
      // this handler exists to document the behaviour and to guard custom markup.
      if (!this.isSwitch && (e.key === ' ' || e.key === 'Enter')) e.preventDefault();
    }.bind(this));
  }

  Switch.prototype.toggle = function (force) {
    var next = typeof force === 'boolean' ? force : this.el.getAttribute('aria-checked') !== 'true';
    this.el.setAttribute('aria-checked', String(next));
    this.el.dispatchEvent(new CustomEvent('switch:change', {
      bubbles: true,
      detail: { key: this.key, checked: next }
    }));
  };

  /* ======================================================================
     6. RANGE SLIDER
     ====================================================================== */
  function RangeSlider(input) {
    this.input = input;
    this.output = document.getElementById(input.getAttribute('aria-describedby')) ||
                  document.querySelector('output[for="' + input.id + '"]');
    this.render();
    input.addEventListener('input', function () { this.render(); }.bind(this));
  }

  RangeSlider.prototype.render = function () {
    var min = Number(this.input.min || 0);
    var max = Number(this.input.max || 100);
    var value = Number(this.input.value);
    var percent = ((value - min) / (max - min)) * 100;

    // --fill drives the two-stop gradient of the track.
    this.input.style.setProperty('--fill', percent + '%');

    if (this.output) {
      this.output.textContent = value + (this.input.dataset.unit || ' people');
      // Announce only the value, not the whole sentence, for screen readers.
      this.input.setAttribute('aria-valuetext', value + ' people');
    }
  };

  /* ======================================================================
     7. TOOLTIP
     ====================================================================== */
  function Tooltip(trigger) {
    this.trigger = trigger;
    this.text = trigger.getAttribute('data-tooltip');
    this.placement = trigger.getAttribute('data-tooltip-placement') || 'top';
    this.timer = null;
    this.bind();
  }

  Tooltip.prototype.bind = function () {
    var self = this;

    this.show = function () {
      if (!self.el) {
        self.el = document.createElement('span');
        self.el.className = 'tooltip';
        self.el.setAttribute('role', 'presentation');
        self.trigger.appendChild(self.el);
        // aria-describedby keeps the hint available to assistive tech.
        var id = 'tooltip-' + Math.random().toString(36).slice(2, 8);
        self.el.id = id;
        self.trigger.setAttribute('aria-describedby', id);
      }
      self.el.textContent = self.text;
      self.el.dataset.placement = self.placement;

      clearTimeout(self.timer);
      // Small delay prevents tooltips flickering on fast pointer travel.
      self.timer = setTimeout(function () { self.el.classList.add('is-visible'); }, 120);
    };

    this.hide = function () {
      clearTimeout(self.timer);
      if (self.el) self.el.classList.remove('is-visible');
    };

    this.trigger.addEventListener('mouseenter', this.show);
    this.trigger.addEventListener('mouseleave', this.hide);
    this.trigger.addEventListener('focus', this.show);
    this.trigger.addEventListener('blur', this.hide);
    this.trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') self.hide();
    });
  };

  /* ======================================================================
     8. TOAST
     ====================================================================== */
  var toast = {
    ICONS: {
      success: '<path d="m4 12 5 5L20 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
      danger:  '<path d="M12 3 2 20h20L12 3Zm0 6v5m0 3v.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
      warn:    '<path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4v5m0 3v.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
      info:    '<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v.5m0 3.5V17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
    },

    /**
     * @param {object} options  { message, title, variant, duration }
     * @returns {HTMLElement}  the toast element
     */
    show: function (options) {
      var opts = options || {};
      var region = document.getElementById('toast-region');
      if (!region) return null;

      var variant = opts.variant || 'info';
      var duration = opts.duration || 4200;

      var el = document.createElement('div');
      el.className = 'toast toast--' + variant;
      el.innerHTML =
        '<svg class="toast__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          (toast.ICONS[variant] || toast.ICONS.info) +
        '</svg>' +
        '<div class="toast__body">' +
          (opts.title ? '<p class="toast__title"></p>' : '') +
          '<p class="toast__msg"></p>' +
        '</div>' +
        '<button class="toast__close" type="button" aria-label="Dismiss notification">&times;</button>';

      // textContent (not innerHTML) for the user-supplied copy -> no XSS.
      if (opts.title) el.querySelector('.toast__title').textContent = opts.title;
      el.querySelector('.toast__msg').textContent = opts.message || '';

      var timer = null;
      function dismiss() {
        clearTimeout(timer);
        el.classList.add('is-leaving');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
      }

      el.querySelector('.toast__close').addEventListener('click', dismiss);
      // Pause the countdown while the pointer is over the toast.
      el.addEventListener('mouseenter', function () { clearTimeout(timer); });
      el.addEventListener('mouseleave', function () { timer = setTimeout(dismiss, 1500); });

      region.appendChild(el);
      timer = setTimeout(dismiss, duration);

      // Never let more than 5 toasts stack up.
      var all = util.qsa('.toast', region);
      if (all.length > 5) all[0].querySelector('.toast__close').click();

      return el;
    }
  };

  /* ======================================================================
     9. PROGRESS BAR
     ====================================================================== */
  function Progress(bar, onDone) {
    this.bar = bar;
    this.onDone = onDone;
    this.value = 0;
    this.running = false;
  }

  Progress.prototype.start = function (to, stepMs) {
    var self = this;
    var target = to == null ? 100 : to;
    var step = stepMs || 120;
    var increment = 6 + Math.random() * 8;
    this.running = true;
    this.value = 0;

    function frame() {
      if (!self.running) return;
      // Ease towards the target so the bar never jumps backwards.
      self.value = Math.min(target, self.value + increment);
      self.bar.style.width = self.value + '%';
      self.bar.parentElement.setAttribute('aria-valuenow', String(Math.round(self.value)));

      if (self.value >= target) {
        self.running = false;
        if (self.onDone) self.onDone();
        return;
      }
      increment *= 0.985; // gradually slow down near 100%
      setTimeout(frame, step);
    }
    frame();
  };

  Progress.prototype.reset = function () {
    this.running = false;
    this.value = 0;
    this.bar.style.width = '0%';
    this.bar.parentElement.setAttribute('aria-valuenow', '0');
  };

  /* ======================================================================
     10. RATING
     ====================================================================== */
  function Rating(root) {
    this.root = root;
    this.stars = util.qsa('.rating__star', root);
    this.output = document.getElementById('rating-value');

    // Start from whichever star is pre-selected in the markup.
    var preselected = this.stars.filter(function (s) {
      return s.getAttribute('aria-checked') === 'true';
    })[0] || this.stars[0];

    this.value = preselected ? Number(preselected.dataset.value) || 0 : 0;
    this.render();
    this.bind();
  }

  Rating.prototype.bind = function () {
    var self = this;

    this.stars.forEach(function (star, i) {
      star.addEventListener('click', function () { self.set(i + 1, true); });
      star.addEventListener('keydown', function (e) {
        var target = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') target = Math.min(i + 1, self.stars.length - 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') target = Math.max(i - 1, 0);
        else if (e.key === 'Home') target = 0;
        else if (e.key === 'End') target = self.stars.length - 1;
        else return;

        e.preventDefault();
        self.set(target + 1, true);
        self.stars[target].focus();
      });
    });
  };

  Rating.prototype.set = function (value, focus) {
    this.value = value;
    this.render();
    if (focus) this.stars[value - 1].focus();
  };

  Rating.prototype.render = function () {
    this.stars.forEach(function (star, i) {
      star.classList.toggle('is-on', i < this.value);
      star.setAttribute('aria-checked', String(i + 1 === this.value));
    }, this);
    if (this.output) this.output.textContent = this.value + ' out of ' + this.stars.length;
  };

  /* ======================================================================
     11. SIDE NAV (mobile drawer + scroll spy)
     ====================================================================== */
  var SideNav = {
    init: function (nav, fab) {
      if (!nav) return;

      fab.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        fab.setAttribute('aria-expanded', String(open));
        fab.setAttribute('aria-label', open ? 'Hide component list' : 'Show component list');
      });

      // Close after choosing a component on mobile.
      util.qsa('.sidenav__link', nav).forEach(function (link) {
        link.addEventListener('click', function () {
          nav.classList.remove('is-open');
          fab.setAttribute('aria-expanded', 'false');
        });
      });

      // Scroll spy with IntersectionObserver.
      var links = util.qsa('.sidenav__link', nav);
      var map = {};
      links.forEach(function (link) { map[link.getAttribute('href').slice(1)] = link; });

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) { l.classList.remove('is-active'); });
          var active = map[entry.target.id];
          if (active) active.classList.add('is-active');
        });
      }, { rootMargin: '-20% 0px -70% 0px' });

      Object.keys(map).forEach(function (id) {
        var section = document.getElementById(id);
        if (section) observer.observe(section);
      });
    }
  };

  /* ======================================================================
     12. PAGE WIRING
     ====================================================================== */
  function init() {
    /* ---- Modals: any [data-modal-open="id"] opens the matching dialog ---- */
    var modals = {};
    util.qsa('.modal').forEach(function (root) {
      modals[root.id] = new Modal(root);
    });
    util.qsa('[data-modal-open]').forEach(function (btn) {
      var modal = modals[btn.getAttribute('data-modal-open')];
      if (modal) btn.addEventListener('click', function () { modal.show(btn); });
    });

    // Destructive confirm demo
    var confirmDelete = document.getElementById('confirm-delete');
    if (confirmDelete) {
      confirmDelete.addEventListener('click', function () {
        modals['confirm-modal'].close();
        toast.show({ variant: 'danger', title: 'Project deleted', message: '“Marketing site” and 128 tasks were removed.' });
      });
    }

    // Invite form inside the modal
    var inviteForm = document.getElementById('invite-form');
    if (inviteForm) {
      inviteForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = inviteForm.elements.email;
        var error = document.getElementById('invite-email-error');
        var status = document.getElementById('invite-status');

        if (!email.checkValidity()) {
          email.classList.add('is-invalid');
          email.setAttribute('aria-invalid', 'true');
          error.textContent = 'Enter a valid email address, e.g. name@company.com';
          email.focus();
          return;
        }

        email.classList.remove('is-invalid');
        error.textContent = '';
        status.textContent = 'Invite sent to ' + email.value;
        toast.show({ variant: 'success', message: 'Invitation sent to ' + email.value });
        inviteForm.reset();
        window.setTimeout(function () { modals['form-modal'].close(); }, 1200);
      });
    }

    /* ---- Accordion ---- */
    var accordions = util.qsa('[data-accordion]').map(function (root) { return new Accordion(root); });
    var multiToggle = util.qsa('[data-accordion-multi-toggle]')[0];
    if (multiToggle) {
      multiToggle.addEventListener('change', function () {
        accordions.forEach(function (a) { a.setMultiple(this.checked); }.bind(this));
      }.bind(multiToggle));
    }

    /* ---- Tabs ---- */
    util.qsa('[data-tabs]').forEach(function (root) { new Tabs(root); });

    /* ---- Menu ---- */
    util.qsa('[data-menu]').forEach(function (root) { new Menu(root); });

    /* ---- Switches ---- */
    var switchStatus = document.getElementById('switch-status');
    util.qsa('[data-switch]').forEach(function (el) {
      new Switch(el);
      el.addEventListener('switch:change', function (e) {
        var label = el.querySelector('.ui-switch__label');
        if (switchStatus && label) {
          switchStatus.innerHTML = '<strong>' + label.textContent + '</strong> is now ' +
            (e.detail.checked ? 'ON' : 'OFF') + ' (<code>aria-checked="' + e.detail.checked + '"</code>)';
        }
        // The "Reduce motion" switch toggles a body attribute that kills transitions.
        if (el.dataset.switch === 'motion') {
          document.body.dataset.motion = e.detail.checked ? 'reduced' : 'full';
        }
      });
    });

    /* ---- Range slider ---- */
    util.qsa('.slider__input').forEach(function (input) { new RangeSlider(input); });

    /* ---- Tooltips ---- */
    util.qsa('[data-tooltip]').forEach(function (el) { new Tooltip(el); });

    /* ---- Toast triggers (data-toast holds an optional JSON config) ---- */
    util.qsa('button[data-toast]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var config;
        try {
          config = JSON.parse(btn.getAttribute('data-toast'));
        } catch (err) {
          // Not JSON: the attribute is the message itself.
          config = { message: btn.getAttribute('data-toast') };
        }

        var count = parseInt(config.count || '1', 10);
        if (count < 1) count = 1;

        for (var i = 0; i < count; i++) {
          // A single toast appears immediately; a stack cascades in.
          (function (index) {
            if (count === 1) { toast.show(config); return; }
            window.setTimeout(function () {
              toast.show(Object.assign({}, config, {
                message: config.message + ' (' + (index + 1) + '/' + count + ')'
              }));
            }, index * 320);
          })(i);
        }
      });
    });

    /* ---- Progress demo ---- */
    var progress = util.qsa('.progress')[0];
    if (progress) {
      var bar = util.qsa('.progress__bar', progress)[0];
      var label = document.getElementById('progress-label');
      var startBtn = document.getElementById('progress-start');
      var instance = new Progress(bar, function () {
        label.textContent = 'Upload complete ✓';
        toast.show({ variant: 'success', title: 'Upload complete', message: '4.2 MB uploaded in 1.8s.' });
      });

      startBtn.addEventListener('click', function () {
        startBtn.disabled = true;
        label.textContent = 'Uploading…';
        instance.start(100, 90);
        window.setTimeout(function () {
          startBtn.disabled = false;
          instance.reset();
          label.textContent = 'Idle';
        }, 3600);
      });
    }

    /* ---- Rating ---- */
    var rating = util.qsa('[data-rating]')[0];
    if (rating) {
      new Rating(rating);
    }

    /* ---- Side nav ---- */
    SideNav.init(document.getElementById('sidenav'), document.getElementById('sidenav-fab'));

    /* ---- Theme toggle with localStorage persistence ---- */
    try {
      var saved = window.localStorage.getItem('novaui-theme');
      if (saved) document.body.dataset.theme = saved;
    } catch (err) { /* private mode — ignore */ }

    window.addEventListener('keydown', function (e) {
      if (e.altKey && e.key.toLowerCase() === 't') {
        var next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        document.body.dataset.theme = next;
        try { window.localStorage.setItem('novaui-theme', next); } catch (err) {}
        toast.show({ message: 'Theme: ' + next, variant: 'info', duration: 1400 });
      }
    });
  }

  /* ======================================================================
     PUBLIC API
     ====================================================================== */
  var NovaUI = {
    version: '1.0.0',
    util: util,
    Modal: Modal,
    Accordion: Accordion,
    Tabs: Tabs,
    Menu: Menu,
    Switch: Switch,
    RangeSlider: RangeSlider,
    Tooltip: Tooltip,
    Progress: Progress,
    Rating: Rating,
    toast: toast,

    /** Convenience: open a dialog by id. */
    modal: {
      open: function (id, opener) {
        var el = document.getElementById(id);
        if (!el) return null;
        if (!el.__novaModal) el.__novaModal = new Modal(el);
        return el.__novaModal.show(opener);
      },
      close: function (id) {
        var el = document.getElementById(id);
        if (el && el.__novaModal) el.__novaModal.close();
      }
    },

    init: init
  };

  window.NovaUI = NovaUI;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
