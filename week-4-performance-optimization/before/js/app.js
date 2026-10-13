/*!
 * legacy-app.js — the "before" behaviour bundle.
 *
 * This file is the concrete source of the long tasks, layout thrashing and
 * forced synchronous reflows reported by Lighthouse in the baseline audit.
 * Every anti-pattern is annotated so the "after" version can be compared
 * line by line.
 */
(function () {
  'use strict';

  /* =====================================================================
   * ❌ ANTI-PATTERN 1 — Layout thrashing inside a loop
   *
   * Each iteration writes to the DOM and then immediately reads
   * offsetHeight, which forces the browser to re-run layout synchronously.
   * 600 elements x 3 reads = ~1 800 forced reflows on first paint.
   * =================================================================== */
  function paintBadges() {
    var cards = document.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];

      // write
      card.style.padding = '18px';

      // read -> forced synchronous layout
      var h = card.offsetHeight;

      // write
      card.style.minHeight = h + 'px';

      // read again -> forced synchronous layout again
      var w = card.offsetWidth;

      // write
      card.style.minWidth = (w > 0 ? w : 0) + 'px';

      // third read
      var top = card.getBoundingClientRect().top;

      if (top > 0) {
        card.style.marginTop = '4px';
      }
    }
  }

  /* =====================================================================
   * ❌ ANTI-PATTERN 2 — Unthrottled scroll handler doing layout reads
   *
   * Fires on every scroll frame, reads offsetTop on every element and
   * writes to the DOM before the next read. This is the single biggest
   * cause of jank on scroll in the baseline report.
   * =================================================================== */
  window.addEventListener('scroll', function () {
    var links = document.querySelectorAll('.nav-link');
    var sections = document.querySelectorAll('section');

    for (var i = 0; i < links.length; i++) {
      // read
      var top = sections[i].offsetTop;
      var height = sections[i].offsetHeight;

      // write
      links[i].style.borderBottom = '0';

      if (top < window.pageYOffset) {
        links[i].style.borderBottom = '2px solid #06c';
      }
      if (top + height < window.pageYOffset) {
        links[i].style.opacity = '0.6';
      } else {
        links[i].style.opacity = '1';
      }
    }
  });

  /* =====================================================================
   * ❌ ANTI-PATTERN 3 — Unthrottled resize handler that rewrites the DOM
   * =================================================================== */
  window.addEventListener('resize', function () {
    var cards = document.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.width = Math.floor(window.innerWidth / 3) - 30 + 'px';
    }
  });

  /* =====================================================================
   * ❌ ANTI-PATTERN 4 — setInterval polling instead of IntersectionObserver
   *
   * Wakes up 4x a second for the whole session even when the user is idle.
   * =================================================================== */
  setInterval(function () {
    var images = document.images;
    for (var i = 0; i < images.length; i++) {
      // read layout, then write
      if (images[i].offsetParent === null) {
        images[i].className += ' offscreen';
      }
    }
  }, 250);

  /* =====================================================================
   * ❌ ANTI-PATTERN 5 — Massive synchronous DOM build on load
   *
   * 600 elements appended one by one to the live document. Each append can
   * invalidate style/layout, so this is one very long main-thread task.
   * =================================================================== */
  function buildGallery() {
    var host = document.querySelector('.features .row');
    if (!host) return;

    var fragment;

    for (var i = 0; i < 600; i++) {
      if (i % 40 === 0) {
        fragment = document.createDocumentFragment();
      }

      var node = document.createElement('div');
      node.className = 'col col-md-4';

      var inner = document.createElement('div');
      inner.className = 'card';

      var title = document.createElement('h3');
      title.className = 'card-title';
      title.textContent = 'Metric ' + i;

      var body = document.createElement('p');
      body.className = 'card-text';
      body.textContent = 'Generated sample content number ' + i + ' used to inflate the DOM size.';

      var actions = document.createElement('div');
      actions.className = 'card-actions';

      var btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.textContent = 'Open';
      actions.appendChild(btn);

      inner.appendChild(title);
      inner.appendChild(body);
      inner.appendChild(actions);
      node.appendChild(inner);

      fragment.appendChild(node);

      if (i % 40 === 39) {
        host.appendChild(fragment);
      }
    }
  }

  /* =====================================================================
   * ❌ ANTI-PATTERN 6 — Recomputing styles via getComputedStyle in a loop
   * =================================================================== */
  function measureEverything() {
    var nodes = document.querySelectorAll('*');
    var total = 0;
    for (var i = 0; i < nodes.length; i++) {
      var cs = window.getComputedStyle(nodes[i]);
      total += parseFloat(cs.fontSize) + parseFloat(cs.lineHeight || 0);
    }
    document.documentElement.setAttribute('data-total', String(total));
  }

  /* =====================================================================
   * ❌ ANTI-PATTERN 7 — Multiple sequential document.write-style injections
   * =================================================================== */
  function injectWidgets() {
    var i;
    for (i = 0; i < 40; i++) {
      var d = document.createElement('div');
      d.className = 'widget sidebar-widget';
      d.innerHTML = '<h4 class="widget-title">Insight ' + i + '</h4><p class="card-text">Pre-rendered block.</p>';
      document.body.appendChild(d);
    }
    for (i = 0; i < 40; i++) {
      var s = document.createElement('script');
      s.type = 'text/plain';
      s.textContent = '/* analytics beacon ' + i + ' */';
      document.body.appendChild(s);
    }
  }

  /* =====================================================================
   * ❌ ANTI-PATTERN 8 — Third-party "widget" object re-scanning the document
   * =================================================================== */
  if (window.Widget) {
    window.Widget.scan = function () {
      var all = document.getElementsByTagName('*');
      var out = [];
      for (var i = 0; i < all.length; i++) {
        out.push(all[i].className);
      }
      return out;
    };
    window.Widget.scan();
  }

  if (window.Analytics) {
    window.Analytics.track = function (name) {
      // The old pattern: a SYNCHRONOUS request that blocks the main thread and
      // the parser until the server replies. Pointing it at a static file
      // server produces a 404 in the Network tab — that response is expected
      // and is itself part of what makes this baseline slow.
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/collect?e=' + name, false); // false = synchronous
      try { xhr.send(); } catch (e) { /* offline */ }
    };
    window.Analytics.track('pageview');
  }

  /* =====================================================================
   * ❌ ANTI-PATTERN 9 — Naive form handling that re-renders the whole page
   * =================================================================== */
  var form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var body = document.body;
      body.style.opacity = '0.4';
      // full re-render of the layout after submit
      paintBadges();
      measureEverything();
      body.style.opacity = '1';
    });
  }

  /* =====================================================================
   * BOOT — everything runs synchronously once the DOM is parsed
   * -----------------------------------------------------------------
   * The <script> tags are render-blocking in <head>, so the parser is
   * already stalled by the time this file runs. That is the point of the
   * baseline: the main thread is unavailable until all four bundles have
   * downloaded and executed. Waiting for DOMContentLoaded (as a legacy
   * library's ready() helper would) lets the anti-patterns above actually
   * run, so the page is a fair baseline to measure against.
   * =================================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      paintBadges();
      buildGallery();
      measureEverything();
      injectWidgets();
    });
  } else {
    paintBadges();
    buildGallery();
    measureEverything();
    injectWidgets();
  }
})();
