/**
 * ==========================================================================
 *  app.js — dashboard bootstrap
 * --------------------------------------------------------------------------
 *  Responsibilities
 *    1. Load the JSON data set (stale-while-revalidate) and show skeletons,
 *       then content, then an error banner if it truly cannot be loaded.
 *    2. Render the six KPI cards with sparklines.
 *    3. Wire the three SVG charts and their "view as table" equivalents.
 *    4. Build the sortable / filterable / paginated invoice table.
 *    5. Sidebar drawer, scroll-spy, theme persistence, CSV export, refresh.
 *
 *  Charts are pulled in on demand with an injected <script> tag so the shell,
 *  the KPI numbers and the table all paint first — see the "Optimised loading"
 *  section of the README.
 *
 *  This is a classic script rather than an ES module. Modules are always
 *  CORS-checked and a page opened from disk has an opaque origin, so Chrome
 *  would block every module request and the page would sit on its loading
 *  skeletons forever. Classic scripts run over http:// and file:// alike.
 *
 *  Exposes: window.NovaDash (app namespace, see data-service.js)
 * ========================================================================== */
(function (global) {
'use strict';

var NS = (global.NovaDash = global.NovaDash || {});
var document = global.document;

/** Dependencies are loaded as classic deferred scripts before this one. */
var DataService = NS.DataService;
var DataTable = NS.DataTable;

const DATA_URL = 'data/dashboard-data.json';
const CHARTS_SRC = 'js/charts.js';

const $  = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

/* ==========================================================================
   LAZY CHUNK LOADER
   Injects charts.js on first use. Equivalent to a dynamic import() in terms
   of "separate request, off the critical path", but a classic <script> is
   allowed on file:// where `import()` is not. Repeated calls share one promise.
   ========================================================================== */
let chartsPromise = null;
function loadCharts() {
  if (chartsPromise) return chartsPromise;
  chartsPromise = DataService.loadScript(CHARTS_SRC).then(() => NS.charts);
  return chartsPromise;
}

/**
 * Runs `fn` after the browser has had a chance to paint.
 *
 * `requestAnimationFrame` on its own is not enough: it is suspended entirely in
 * a hidden or background tab, so a callback queued there would never run and
 * the KPI sparklines would simply never appear. Racing it against a timer
 * makes the deferral reliable in both cases.
 */
function afterNextPaint(fn) {
  let done = false;
  const run = () => { if (done) return; done = true; fn(); };
  requestAnimationFrame(run);
  setTimeout(run, 120);
}

/** Announces a message in the polite live region. */
const live = (message) => { $('#live-region').textContent = message; };

/* ==========================================================================
 * NUMBER FORMATTING
 * ========================================================================== */
const nf = new Intl.NumberFormat('en-US');
const money = (n) => '$' + nf.format(Math.round(n));
const moneyCompact = (n) =>
  n >= 1_000_000 ? '$' + (n / 1_000_000).toFixed(2) + 'M'
  : n >= 1_000   ? '$' + Math.round(n / 1_000) + 'k'
  : '$' + n;

const FORMATTERS = {
  currency:        (v) => money(v),
  'currency-compact': (v) => moneyCompact(v),
  number:          (v) => nf.format(v),
  percent:         (v) => v.toFixed(1) + '%',
  score:           (v) => String(Math.round(v)),
  days:            (v) => v.toFixed(1) + ' days'
};

/* ==========================================================================
 * APP STATE
 * ========================================================================== */
const state = {
  data: null,
  charts: {},
  table: null,
  periodMonths: 12
};

/* ==========================================================================
 * 1. DATA LOADING
 * ========================================================================== */
async function loadData({ force = false } = {}) {
  if (force) DataService.clearCache();

  const { data, fromCache, error } = await DataService.load(DATA_URL);

  if (error || !data) {
    showError('Could not load the dashboard data. Open this page through a local server (for example: python -m http.server 8080) and reload.');
    return;
  }

  state.data = data;
  $('#cache-banner').hidden = !fromCache;
  $('#kpi-grid').setAttribute('aria-busy', 'false');

  $('#period-label').textContent = `${data.meta.periodLabel} · compared with ${data.meta.comparedTo}`;

  // Three possible sources, and the sidebar label says which one is in use.
  if (fromCache) {
    $('#data-freshness').textContent = DataService.describeAge(data.__cacheAgeMs);
  } else if (NS.FALLBACK) {
    $('#data-freshness').textContent = 'Local copy · opened from disk';
  } else {
    $('#data-freshness').textContent = 'Live data · just fetched';
  }

  renderAll();
}

/* ==========================================================================
 * 2. KPI CARDS
 * ========================================================================== */
function renderKpis() {
  const grid = $('#kpi-grid');
  grid.textContent = '';

  const kpis = trimSeries(state.data.kpis).map((kpi) => {
    const li = document.createElement('li');
    li.className = 'kpi';

    const label = document.createElement('p');
    label.className = 'kpi__label';
    label.textContent = kpi.label;

    const value = document.createElement('p');
    value.className = 'kpi__value';
    const format = FORMATTERS[kpi.format] || FORMATTERS.number;
    value.textContent = format(kpi.value);

    const foot = document.createElement('div');
    foot.className = 'kpi__foot';

    // The delta carries an arrow glyph AND a visually hidden word, so the
    // meaning does not depend on colour.
    const improved = kpi.goodDirection === 'up' ? kpi.delta > 0 : kpi.delta < 0;
    const tone = kpi.delta === 0 ? 'flat' : improved ? 'good' : 'bad';

    const delta = document.createElement('span');
    delta.className = `delta delta--${tone}`;
    const arrow = kpi.delta > 0 ? '▲' : kpi.delta < 0 ? '▼' : '■';
    delta.innerHTML =
      `<span aria-hidden="true">${arrow}</span>` +
      `${Math.abs(kpi.delta).toFixed(1)}%` +
      `<span class="sr-only"> ${kpi.delta > 0 ? 'increase' : kpi.delta < 0 ? 'decrease' : 'no change'}</span>`;
    delta.setAttribute(
      'aria-label',
      `${Math.abs(kpi.delta).toFixed(1)} percent ${kpi.delta > 0 ? 'increase' : 'decrease'} versus last year, ${improved ? 'an improvement' : 'a decline'}`
    );

    // "YoY" keeps the card on one line; the full phrase is still announced
    // because the delta chip carries a full aria-label.
    const note = document.createElement('span');
    note.className = 'kpi__label';
    note.innerHTML = 'YoY<span class="sr-only"> versus last year</span>';

    foot.append(delta, note);
    li.append(label, value, foot);

    // The sparkline is decorative; the numbers above already carry the value.
    if (kpi.spark && kpi.spark.length > 1) {
      li.dataset.spark = JSON.stringify(kpi.spark);
    }

    return li;
  });

  kpis.forEach((li) => grid.appendChild(li));

  // Sparklines are drawn after the first paint so they never delay the
  // meaningful render of the numbers.
  afterNextPaint(() => {
    loadCharts().then(charts => {
      $$('#kpi-grid .kpi').forEach((li) => {
        if (!li.dataset.spark) return;
        const values = JSON.parse(li.dataset.spark);
        li.querySelector('.kpi__foot').appendChild(charts.sparkline(values));
      });
    });
  });

  live(`${kpis.length} key performance indicators loaded.`);
}

/* Keeps only the last N points of a series, for the shorter periods. */
function trimSeries(items) {
  return state.periodMonths >= 12 ? items : items.slice(-state.periodMonths);
}

/* ==========================================================================
 * 3. CHARTS
 * ========================================================================== */
async function renderCharts() {
  // Lazy chunk: charts.js is fetched and executed only now.
  const { lineChart, donutChart, barChart, money: m } = await loadCharts();
  const data = state.data;

  /* ---- Revenue line/area chart ---- */
  const cut = state.periodMonths;
  const labels = data.revenue.labels.slice(-cut);

  const series = data.revenue.series.map((s) => ({
    id: s.id,
    name: s.name,
    colour: s.colour,
    values: s.values.slice(-cut),
    visible: state.hiddenSeries ? !state.hiddenSeries.has(s.id) : true
  }));

  buildSeriesToggles(series);

  if (state.charts.revenue) state.charts.revenue.destroy();
  state.charts.revenue = lineChart($('#revenue-chart'), {
    labels,
    series,
    area: true,
    format: (v) => m(v)
  });

  buildTable('#revenue-table',
    ['Month', ...series.map((s) => s.name)],
    labels.map((label, i) => [label, ...series.map((s) => m(s.values[i]))])
  );

  /* ---- Sources donut ---- */
  const sources = data.sources.map((s, i) => ({
    ...s,
    colour: ['#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b', '#f43f5e'][i % 5]
  }));

  if (state.charts.sources) state.charts.sources.destroy();
  state.charts.sources = donutChart($('#sources-chart'), {
    items: sources,
    centreValue: '5',
    centreLabel: 'channels'
  });

  const total = sources.reduce((sum, s) => sum + s.value, 0);
  buildTable('#sources-table',
    ['Source', 'Share', 'Workspaces'],
    sources.map((s) => [s.name, s.value + '%', Math.round((s.value / 100) * total)])
  );

  /* ---- Channels grouped bar chart ---- */
  const channelSeries = data.channels.series.map((s) => ({
    id: s.id, name: s.name, colour: s.colour, values: s.values
  }));

  if (state.charts.channels) state.charts.channels.destroy();
  state.charts.channels = barChart($('#channels-chart'), {
    groups: data.channels.labels,
    series: channelSeries,
    format: (v) => m(v)
  });

  buildTable('#channels-table',
    ['Channel', 'This year', 'Last year', 'Change'],
    data.channels.labels.map((label, i) => {
      const now = channelSeries[0].values[i];
      const before = channelSeries[1].values[i];
      const change = ((now - before) / before) * 100;
      return [label, m(now), m(before), '+' + change.toFixed(1) + '%'];
    })
  );
}

/** Renders the chips that toggle individual revenue series. */
function buildSeriesToggles(series) {
  const fieldset = $('#series-toggle');
  fieldset.textContent = '';

  series.forEach((s) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.setAttribute('aria-pressed', String(s.visible));
    chip.dataset.series = s.id;
    chip.innerHTML = `<span class="chip__swatch" style="background:${s.colour}"></span>${s.name}`;
    chip.addEventListener('click', () => {
      const on = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', String(!on));
      if (on) state.hiddenSeries.add(s.id);
      else state.hiddenSeries.delete(s.id);
      renderCharts();
      live(`${s.name} series ${on ? 'hidden' : 'shown'}.`);
    });
    fieldset.appendChild(chip);
  });
}

/**
 * Renders the accessible text equivalent of a chart.
 * @param {string} selector  Table selector
 * @param {Array<string>} headers
 * @param {Array<Array<string>>} rows
 */
function buildTable(selector, headers, rows) {
  const table = $(selector);
  const caption = table.querySelector('caption');
  table.textContent = '';
  table.appendChild(caption);

  const thead = document.createElement('thead');
  const hrow = document.createElement('tr');
  headers.forEach((h, i) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = h;
    if (i > 0) th.className = 'num';
    hrow.appendChild(th);
  });
  thead.appendChild(hrow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((cells) => {
    const tr = document.createElement('tr');
    cells.forEach((value, i) => {
      const cell = document.createElement(i === 0 ? 'th' : 'td');
      if (i === 0) cell.scope = 'row';
      else cell.className = 'num';
      cell.textContent = value;
      tr.appendChild(cell);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

/* ==========================================================================
 * 4. REGIONS, CAPACITY, ACTIVITY, SUMMARY
 * ========================================================================== */
function renderRegions() {
  const list = $('#region-list');
  list.textContent = '';
  const regions = state.data.regions;
  const max = Math.max(...regions.map((r) => r.revenue));

  regions.forEach((region) => {
    const li = document.createElement('li');
    li.className = 'region';

    const top = document.createElement('div');
    top.className = 'region__top';

    const name = document.createElement('span');
    name.className = 'region__name';
    name.textContent = region.name;

    const meta = document.createElement('span');
    meta.className = 'region__meta';
    const dir = region.delta >= 0 ? '▲' : '▼';
    meta.textContent = `${dir} ${Math.abs(region.delta).toFixed(1)}% · ${nf.format(region.customers)} customers`;

    const value = document.createElement('span');
    value.className = 'region__value';
    value.textContent = moneyCompact(region.revenue);

    top.append(name, meta, value);

    // The bar is decorative; the numbers above it carry the information.
    const bar = document.createElement('div');
    bar.className = 'region__bar';
    bar.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('div');
    fill.className = 'region__fill';
    fill.style.width = (region.revenue / max) * 100 + '%';
    bar.appendChild(fill);

    li.append(top, bar);
    list.appendChild(li);
  });
}

function renderCapacity() {
  const list = $('#capacity-list');
  list.textContent = '';

  state.data.teamLoad.forEach((team) => {
    const li = document.createElement('li');
    // The threshold is exposed in the accessible text, not only as colour.
    li.className = 'meter' + (team.capacity >= 90 ? ' meter--high' : team.capacity >= 75 ? ' meter--mid' : '');

    const name = document.createElement('span');
    name.className = 'meter__name';
    name.textContent = team.name;

    const track = document.createElement('div');
    track.className = 'meter__track';
    track.setAttribute('role', 'meter');
    track.setAttribute('aria-valuenow', String(team.capacity));
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    track.setAttribute('aria-label', `${team.name} capacity utilisation`);
    const fill = document.createElement('div');
    fill.className = 'meter__fill';
    fill.style.width = team.capacity + '%';
    track.appendChild(fill);

    const val = document.createElement('span');
    val.className = 'meter__val';
    val.textContent = team.capacity + '%';
    val.setAttribute('aria-hidden', 'true');

    li.append(name, track, val);
    list.appendChild(li);
  });
}

function renderActivity() {
  const list = $('#timeline');
  list.textContent = '';

  const ICONS = {
    deploy:  '<path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.5 3.6L12 11.5 5.5 7.9 12 4.3Z" fill="currentColor"/>',
    alert:   '<path d="M12 3 2 20h20L12 3Zm0 6v5m0 3v.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    signup:  '<path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-7 2-7 4.5V21h14v-2.5C16 16 13 14 9 14Z" fill="currentColor"/>',
    review:  '<path d="M4 5h16v4H4zm0 6h12v4H4zm0 6h8v4H4z" fill="currentColor"/>',
    goal:    '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 11h6v-2h-5V6h-2v7h1Z" fill="currentColor"/>'
  };

  state.data.activity.forEach((item) => {
    const li = document.createElement('li');

    const dot = document.createElement('span');
    dot.className = `timeline__dot timeline__dot--${item.type}`;
    dot.setAttribute('aria-hidden', 'true');
    dot.innerHTML = `<svg viewBox="0 0 24 24" focusable="false">${ICONS[item.type] || ''}</svg>`;

    const text = document.createElement('p');
    text.className = 'timeline__text';
    text.textContent = item.text;

    const time = document.createElement('time');
    time.className = 'timeline__time';
    time.dateTime = item.time;
    time.textContent = item.meta;

    li.append(dot, text, time);
    list.appendChild(li);
  });
}

function renderSummary() {
  const body = $('#summary-body');
  body.textContent = '';

  const rows = state.data.transactions;
  const paid = rows.filter((r) => r.status === 'paid');
  const totalValue = paid.reduce((sum, r) => sum + r.amount, 0);
  const seats = rows.reduce((sum, r) => sum + r.seats, 0);
  const regions = new Set(rows.map((r) => r.region)).size;
  const atRisk = rows.filter((r) => r.status === 'failed' || r.status === 'review');

  const add = (key, value) => {
    const row = document.createElement('div');
    row.className = 'summary__row';
    const k = document.createElement('span');
    k.className = 'summary__key';
    k.textContent = key;
    const v = document.createElement('span');
    v.className = 'summary__val';
    v.textContent = value;
    row.append(k, v);
    body.appendChild(row);
  };

  add('Invoices in view', String(rows.length));
  add('Settled value', money(totalValue));
  add('Total seats', nf.format(seats));
  add('Regions covered', String(regions));
  add('Need attention', String(atRisk.length));

  const note = document.createElement('p');
  note.className = 'summary__note';
  note.textContent =
    `${atRisk.length} invoice${atRisk.length === 1 ? '' : 's'} sit in review or failed status. ` +
    `The largest single settlement this period is ${money(Math.max(...paid.map((r) => r.amount)))}.`;
  body.appendChild(note);
}

/* ==========================================================================
 * 5. INVOICE TABLE
 * ========================================================================== */
function renderTable() {
  const regionNames = Object.fromEntries(state.data.regions.map((r) => [r.id, r.name]));

  // Populate the region filter from the data, so it can never drift from it.
  const regionFilter = $('#region-filter');
  regionFilter.textContent = '';
  const all = document.createElement('option');
  all.value = '';
  all.textContent = 'All regions';
  regionFilter.appendChild(all);
  state.data.regions.forEach((region) => {
    const opt = document.createElement('option');
    opt.value = region.id;
    opt.textContent = region.name;
    regionFilter.appendChild(opt);
  });

  const statusPill = (row) => {
    const span = document.createElement('span');
    span.className = `pill pill--${row.status}`;
    const labels = { paid: 'Paid', review: 'In review', failed: 'Failed', free: 'Free tier' };
    span.textContent = labels[row.status] || row.status;
    return span;
  };

  state.table = new DataTable({
    table: $('#transactions-table'),
    tbody: $('#transactions-body'),
    pager: $('#pager'),
    empty: $('#table-empty'),
    live: $('#live-region'),
    status: $('#transactions-sub'),
    pageSize: 8,
    defaultSort: 'date',
    defaultDir: 'desc',
    rows: state.data.transactions,
    columns: [
      { key: 'id', label: 'Invoice', render: (r) => r.id },
      { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
      { key: 'customer', label: 'Customer', render: (r) => r.customer },
      { key: 'plan', label: 'Plan', render: (r) => r.plan },
      { key: 'seats', label: 'Seats', className: 'num', render: (r) => nf.format(r.seats) },
      { key: 'amount', label: 'Amount', className: 'num', render: (r) => (r.amount ? money(r.amount) : '—') },
      { key: 'status', label: 'Status', render: statusPill },
      { key: 'region', label: 'Region', render: (r) => regionNames[r.region] || r.region }
    ]
  });
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ==========================================================================
 * 6. CHROME: drawer, scroll spy, theme, export, filters
 * ========================================================================== */
function initChrome() {
  /* ---- Sidebar drawer ---- */
  const sidebar = $('#sidebar');
  const scrim = $('#scrim');
  const menuBtn = $('#menu-btn');

  const setDrawer = (open) => {
    sidebar.classList.toggle('is-open', open);
    scrim.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      sidebar.querySelector('.sidenav__link').focus();
      live('Navigation opened.');
    }
  };

  menuBtn.addEventListener('click', () =>
    setDrawer(!sidebar.classList.contains('is-open'))
  );
  scrim.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
      setDrawer(false);
      menuBtn.focus();
    }
  });
  $$('.sidenav__link').forEach((link) =>
    link.addEventListener('click', () => setDrawer(false))
  );

  /* ---- Scroll spy on the sidebar ---- */
  const links = $$('.sidenav__link[href^="#"]');
  const byId = {};
  links.forEach((link) => { byId[link.getAttribute('href').slice(1)] = link; });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
        const active = byId[entry.target.id];
        if (active) {
          active.classList.add('is-active');
          active.setAttribute('aria-current', 'true');
        }
      });
    },
    { rootMargin: '-25% 0px -65% 0px' }
  );
  Object.keys(byId).forEach((id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  /* ---- Theme toggle, persisted ---- */
  const themeBtn = $('#theme-btn');
  const stored = safeGet('novadash:theme');
  if (stored === 'dark') applyTheme('dark');

  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    safeSet('novadash:theme', next);
    live(next === 'dark' ? 'Dark theme enabled.' : 'Light theme enabled.');
  });

  /* ---- Period filter ---- */
  $('#period-select').addEventListener('change', (e) => {
    state.periodMonths = Number(e.target.value);
    renderKpis();
    renderCharts();
    live(`Showing the last ${state.periodMonths} months.`);
  });

  /* ---- Refresh ---- */
  $('#refresh-btn').addEventListener('click', async () => {
    const btn = $('#refresh-btn');
    btn.disabled = true;
    $('#kpi-grid').setAttribute('aria-busy', 'true');
    showSkeletons();
    await loadData({ force: true });
    btn.disabled = false;
    live('Dashboard data refreshed.');
  });

  $('#error-retry').addEventListener('click', () => loadData({ force: true }));

  /* ---- CSV export ---- */
  $('#export-btn').addEventListener('click', () => {
    if (!state.table) return;
    const csv = state.table.toCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'novadash-invoices.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    live(`Exported ${state.table.filtered.length} invoices as CSV.`);
  });

  /* ---- Table filters ---- */
  const search = $('#search-input');
  let debounce;
  search.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const term = search.value.trim().toLowerCase();
      state.table.setFilter('search', (row) =>
        !term ||
        row.customer.toLowerCase().includes(term) ||
        row.id.toLowerCase().includes(term) ||
        row.owner.toLowerCase().includes(term) ||
        row.plan.toLowerCase().includes(term)
      );
    }, 180);
  });

  $('#status-filter').addEventListener('change', (e) =>
    state.table.setFilter('status', e.target.value)
  );
  $('#region-filter').addEventListener('change', (e) =>
    state.table.setFilter('region', e.target.value)
  );

  $('#clear-filters').addEventListener('click', () => {
    search.value = '';
    $('#status-filter').value = '';
    $('#region-filter').value = '';
    state.table.clearFilters();
    live('All filters cleared.');
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  $('#theme-btn').setAttribute('aria-pressed', String(dark));
  $('#theme-btn').setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  $('#theme-icon').innerHTML = dark
    ? '<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    : '<path d="M12 3a9 9 0 1 0 9 9h-9V3Z" fill="currentColor"/>';
}

function safeGet(key) {
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}

/* ==========================================================================
 * 7. BANNERS + SKELETONS
 * ========================================================================== */
function showError(message) {
  $('#error-text').textContent = message;
  $('#error-banner').hidden = false;
  $('#kpi-grid').setAttribute('aria-busy', 'false');
  live('Error: the dashboard data could not be loaded.');
}

function showSkeletons() {
  const grid = $('#kpi-grid');
  grid.textContent = '';
  for (let i = 0; i < 6; i++) {
    const li = document.createElement('li');
    li.className = 'kpi skeleton';
    li.setAttribute('aria-hidden', 'true');
    grid.appendChild(li);
  }
}

/* ==========================================================================
 * 8. RENDER ORCHESTRATION
 * ========================================================================== */
function renderAll() {
  $('#error-banner').hidden = true;
  renderKpis();
  renderCharts();
  renderRegions();
  renderCapacity();
  renderTable();
  renderActivity();
  renderSummary();
}

/* ==========================================================================
 * BOOT
 * `defer` guarantees the DOM is parsed and that data-service.js and
 * data-table.js have already run by the time this file executes.
 * ========================================================================== */
function boot() {
  state.hiddenSeries = new Set();
  initChrome();
  showSkeletons();
  loadData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

})(window);
