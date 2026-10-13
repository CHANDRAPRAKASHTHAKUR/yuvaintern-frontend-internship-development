/**
 * ==========================================================================
 *  data-table.js — sortable, filterable, paginated, CSV-exportable table
 * --------------------------------------------------------------------------
 *  Accessibility decisions baked in here:
 *    • every sortable header is a real <button> inside a <th>, and the <th>
 *      carries `aria-sort` — screen readers announce "sorted ascending" on
 *      the column, not on the button,
 *    • the table lives inside a focusable, labelled scroll container so the
 *      region is reachable by keyboard at 320 px,
 *    • result-count changes and page changes are pushed to a polite live
 *      region, never by moving focus,
 *    • the empty state is a sibling of the table, not a row, so a screen
 *      reader does not read an empty grid.
 *
 *  Written as a classic script with a namespace so that it also runs when
 *  index.html is opened directly from disk (file://), where ES modules are
 *  blocked by the browser's CORS rules.
 *
 *  Exposes: window.NovaDash.DataTable
 * ==========================================================================
 */
(function (global) {
  'use strict';

  var NS = (global.NovaDash = global.NovaDash || {});
  var doc = global.document;

  /* ---------------------------------------------------------------------
     Construction
     --------------------------------------------------------------------- */

  /**
   * @param {object} config
   * @param {HTMLTableSectionElement} config.tbody   Row container
   * @param {HTMLElement}  config.pager            Pagination nav container
   * @param {HTMLElement}  config.empty            Empty-state element
   * @param {HTMLElement}  config.live             Polite live region
   * @param {HTMLElement}  config.status           "Showing x–y of z" label
   * @param {Array}        config.rows             Data array
   * @param {Array}        config.columns          [{ key, label, className, render }]
   * @param {number}       [config.pageSize]
   * @param {string}       [config.defaultSort]
   * @param {string}       [config.defaultDir]
   */
  function DataTable(config) {
    this.config = config;
    this.tbody = config.tbody;
    this.pager = config.pager;
    this.empty = config.empty;
    this.live = config.live;
    this.status = config.status;
    this.columns = config.columns;
    this.pageSize = config.pageSize || 8;

    this.allRows = config.rows.slice();
    this.filtered = this.allRows.slice();
    this.sortKey = config.defaultSort || 'date';
    this.sortDir = config.defaultDir || 'desc';
    this.page = 1;
    this.filters = {};

    this.render();
    this.bindSorting();
  }

  /* ---------------------------------------------------------------------
     Sorting
     --------------------------------------------------------------------- */
  DataTable.prototype.bindSorting = function () {
    var self = this;
    var headers = this.tbody.closest('table').querySelectorAll('th[data-sort], th:has(.th-sort)');

    Array.prototype.forEach.call(headers, function (th) {
      var button = th.querySelector('.th-sort');
      if (!button) return;
      button.addEventListener('click', function () { self.sort(button.dataset.sort); });
    });
  };

  DataTable.prototype.sort = function (key) {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      // Numbers sort descending first; text sorts A -> Z.
      this.sortDir = this.columnType(key) === 'number' ? 'desc' : 'asc';
    }
    this.page = 1;
    this.render();
    this.announce('Sorted by ' + this.labelFor(key) + ', ' +
      (this.sortDir === 'asc' ? 'ascending' : 'descending') + '.');
  };

  DataTable.prototype.columnType = function (key) {
    var sample = this.allRows[0];
    return sample && typeof sample[key] === 'number' ? 'number' : 'text';
  };

  DataTable.prototype.labelFor = function (key) {
    for (var i = 0; i < this.columns.length; i++) {
      if (this.columns[i].key === key) return this.columns[i].label;
    }
    return key;
  };

  /* ---------------------------------------------------------------------
     Filtering
     --------------------------------------------------------------------- */

  /**
   * @param {string} name  Filter name
   * @param {string|Function} value  A value to match, or a predicate
   */
  DataTable.prototype.setFilter = function (name, value) {
    this.filters[name] = value;
    this.page = 1;
    this.render();
  };

  DataTable.prototype.applyFilters = function () {
    var self = this;

    this.filtered = this.allRows.filter(function (row) {
      return Object.keys(self.filters).every(function (name) {
        var value = self.filters[name];
        if (value == null || value === '') return true;
        if (typeof value === 'function') return !!value(row);
        return String(row[name]).toLowerCase() === String(value).toLowerCase();
      });
    });
  };

  DataTable.prototype.clearFilters = function () {
    this.filters = {};
    this.page = 1;
    this.render();
  };

  /* ---------------------------------------------------------------------
     Rendering
     --------------------------------------------------------------------- */
  DataTable.prototype.render = function () {
    this.applyFilters();

    // Sort a copy so the original array is never mutated.
    var dir = this.sortDir === 'asc' ? 1 : -1;
    var type = this.columnType(this.sortKey);
    var key = this.sortKey;

    this.filtered = this.filtered.slice().sort(function (a, b) {
      if (type === 'number') return (a[key] - b[key]) * dir;
      return String(a[key]).localeCompare(String(b[key]), 'en', { numeric: true }) * dir;
    });

    // Reflect the sort state in the header ARIA.
    var table = this.tbody.closest('table');
    Array.prototype.forEach.call(table.querySelectorAll('th[aria-sort]'), function (th) {
      var button = th.querySelector('.th-sort');
      th.setAttribute('aria-sort',
        button && button.dataset.sort === key
          ? (dir === 1 ? 'ascending' : 'descending')
          : 'none');
    });

    var totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    if (this.page > totalPages) this.page = totalPages;

    var start = (this.page - 1) * this.pageSize;
    var pageRows = this.filtered.slice(start, start + this.pageSize);

    this.tbody.textContent = '';
    var self = this;
    pageRows.forEach(function (row) { self.tbody.appendChild(self.buildRow(row)); });

    // Empty state lives outside the table so AT never reads an empty grid.
    var isEmpty = this.filtered.length === 0;
    table.hidden = isEmpty;
    if (this.empty) this.empty.hidden = !isEmpty;

    if (this.status) {
      this.status.textContent = isEmpty
        ? 'No invoices match the current filters'
        : 'Showing ' + (start + 1) + '–' +
          Math.min(start + this.pageSize, this.filtered.length) +
          ' of ' + this.filtered.length + ' invoices';
    }

    this.renderPager(totalPages);
  };

  DataTable.prototype.buildRow = function (row) {
    var tr = doc.createElement('tr');

    this.columns.forEach(function (col) {
      // The first two columns are the row header and a numeric cell.
      var cell = doc.createElement((col.key === 'amount' || col.key === 'seats') ? 'td' : 'th');
      if (col.key !== 'amount' && col.key !== 'seats') cell.setAttribute('scope', 'row');
      if (col.className) cell.className = col.className;

      if (col.render) {
        var result = col.render(row);
        if (result instanceof global.Node) cell.appendChild(result);
        else cell.textContent = result;
      } else {
        cell.textContent = row[col.key];
      }
      tr.appendChild(cell);
    });

    return tr;
  };

  DataTable.prototype.renderPager = function (totalPages) {
    if (!this.pager) return;
    var self = this;
    this.pager.textContent = '';

    if (totalPages <= 1) return;

    var prev = this.pagerButton('‹', this.page - 1, this.page === 1, 'Previous page');
    var list = doc.createElement('ul');
    list.className = 'pager__list';

    for (var p = 1; p <= totalPages; p++) {
      (function (pageNumber) {
        var li = doc.createElement('li');
        var btn = self.pagerButton(String(pageNumber), pageNumber, false, 'Page ' + pageNumber);
        if (pageNumber === self.page) {
          btn.setAttribute('aria-current', 'page');
          btn.classList.add('pager__btn--current');
        }
        btn.addEventListener('click', function () { self.goTo(pageNumber); });
        li.appendChild(btn);
        list.appendChild(li);
      })(p);
    }

    var next = this.pagerButton('›', this.page + 1, this.page === totalPages, 'Next page');
    next.addEventListener('click', function () { self.goTo(self.page + 1); });
    prev.addEventListener('click', function () { self.goTo(self.page - 1); });

    this.pager.appendChild(prev);
    this.pager.appendChild(list);
    this.pager.appendChild(next);
  };

  DataTable.prototype.pagerButton = function (label, target, disabled, ariaLabel) {
    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'pager__btn';
    btn.textContent = label;
    btn.disabled = disabled;
    btn.setAttribute('aria-label', ariaLabel);
    return btn;
  };

  DataTable.prototype.goTo = function (page) {
    this.page = page;
    this.render();
    this.announce('Page ' + page + ' of ' +
      Math.max(1, Math.ceil(this.filtered.length / this.pageSize)) + '.');
  };

  /* ---------------------------------------------------------------------
     Export
     --------------------------------------------------------------------- */

  /** Returns a CSV string of the *filtered* rows, not just the visible page. */
  DataTable.prototype.toCsv = function () {
    var keys = this.columns.map(function (c) { return c.key; });

    function escape(v) {
      var s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }

    var lines = [keys.join(',')];
    this.filtered.forEach(function (row) {
      lines.push(keys.map(function (k) { return escape(row[k]); }).join(','));
    });
    return lines.join('\n');
  };

  DataTable.prototype.announce = function (message) {
    if (this.live) this.live.textContent = message;
  };

  NS.DataTable = DataTable;
})(window);