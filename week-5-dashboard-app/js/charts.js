/**
 * ==========================================================================
 *  charts.js — hand-written SVG charts (no chart library)
 * --------------------------------------------------------------------------
 *  Every chart follows the same contract:
 *    - it is drawn as inline SVG with a `viewBox`, so it scales with CSS and
 *      costs one paint,
 *    - it exposes a text summary through `aria-label` on the host element,
 *    - every data point is keyboard focusable (`tabindex="0"`) and shows the
 *      same tooltip on focus as it does on hover,
 *    - a collapsible <table> with the identical numbers is rendered
 *      alongside by the app, so the data is never locked inside a picture.
 *
 *  This file is NOT referenced by a <script> tag. It is injected on demand by
 *  app.js after the first paint, which keeps charting off the critical path.
 *  It is a classic script (not an ES module) purely so that it still loads
 *  when index.html is opened straight from disk, where module requests are
 *  blocked by the browser's CORS rules.
 *
 *  Note: the SVG namespace URI is `SVG_NS`; `NS` is the app namespace.
 *
 *  Exposes: window.NovaDash.charts
 * ==========================================================================
 */
(function (global) {
  'use strict';

  var NS = (global.NovaDash = global.NovaDash || {});
  var document = global.document;
const SVG_NS = 'http://www.w3.org/2000/svg';

/** Small helper: create an SVG element with attributes and optional children. */
function el(name, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue;
    node.setAttribute(key, String(value));
  }
  children.forEach((child) => node.appendChild(child));
  return node;
}

/** Formats a number for axis labels and tooltips. */
function compact(n) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1) + 'M';
  if (abs >= 1_000) return (n / 1_000).toFixed(abs >= 10_000 ? 0 : 1) + 'k';
  return String(Math.round(n * 100) / 100);
}

const money = (n) => '$' + compact(n);
const moneyFull = (n) =>
  '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

/* ==========================================================================
 * TOOLTIP LAYER
 * One shared, fixed-position element â€” cheap, and it never triggers layout
 * inside the chart's own subtree.
 * ========================================================================== */
const tip = {
  node: null,
  show(html, x, y) {
    if (!this.node) this.node = document.getElementById('chart-tip');
    if (!this.node) return;
    this.node.innerHTML = html;               // template built from our own data
    this.node.hidden = false;
    this.move(x, y);
  },
  move(x, y) {
    if (!this.node) return;
    const rect = this.node.getBoundingClientRect();
    const left = Math.min(Math.max(8, x + 14), window.innerWidth - rect.width - 8);
    const top = Math.min(Math.max(8, y - rect.height - 12), window.innerHeight - rect.height - 8);
    this.node.style.left = left + 'px';
    this.node.style.top = top + 'px';
  },
  hide() {
    if (this.node) this.node.hidden = true;
  }
};

/** Builds the tooltip body. `rows` = [{ colour, label, value }] */
function tipHTML(title, rows) {
  const items = rows
    .map(
      (r) =>
        `<dt>${r.colour ? `<span class="swatch" style="background:${r.colour}"></span>` : ''}${escapeHtml(r.label)}</dt><dd>${escapeHtml(r.value)}</dd>`
    )
    .join('');
  return `<strong>${escapeHtml(title)}</strong><dl>${items}</dl>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

/* ==========================================================================
 * SPARKLINE â€” used inside the KPI cards
 * ========================================================================== */
function sparkline(values, { width = 88, height = 30, pad = 3 } = {}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = (width - pad * 2) / (values.length - 1);
  const scaleY = (v) => height - pad - ((v - min) / span) * (height - pad * 2);

  const points = values.map((v, i) => [pad + i * stepX, scaleY(v)]);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${points[points.length - 1][0].toFixed(1)} ${height} L${points[0][0].toFixed(1)} ${height} Z`;

  return el('svg', {
    class: 'kpi__spark',
    viewBox: `0 0 ${width} ${height}`,
    width, height,
    'aria-hidden': 'true',
    focusable: 'false'
  }, [
    el('path', { class: 'spark-area', d: area }),
    el('path', { d: line })
  ]);
}

/* ==========================================================================
 * LINE / AREA CHART
 * ========================================================================== */
function lineChart(host, config) {
  const state = { ...config };
  const W = 720, H = 300;
  const M = { top: 16, right: 18, bottom: 30, left: 52 };
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;

  function draw() {
    host.textContent = '';

    const series = state.series.filter((s) => s.visible !== false);
    const labels = state.labels || [];

    if (!series.length || !labels.length) {
      host.appendChild(el('p', { class: 'chart__empty' }, [
        document.createTextNode('No series selected.'),
      ]));
      return;
    }

    const all = series.flatMap((s) => s.values);
    const max = niceMax(Math.max(...all));
    const x = (i) => M.left + (labels.length === 1 ? iw / 2 : (i / (labels.length - 1)) * iw);
    const y = (v) => M.top + ih - (v / max) * ih;

    const svg = el('svg', {
      viewBox: `0 0 ${W} ${H}`,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'presentation',
      focusable: 'false'
    });

    // --- horizontal grid + y axis labels -------------------------------
    const ticks = 4;
    for (let t = 0; t <= ticks; t++) {
      const value = (max / ticks) * t;
      const yy = y(value);
      svg.appendChild(
        el('line', { class: 'chart-grid', x1: M.left, x2: M.left + iw, y1: yy, y2: yy })
      );
      const label = el('text', {
        class: 'chart-axis-text', x: M.left - 8, y: yy + 3.5, 'text-anchor': 'end'
      });
      label.textContent = compact(value);
      svg.appendChild(label);
    }

    // --- x axis labels (skip some when crowded) -------------------------
    const every = labels.length > 8 ? 2 : 1;
    labels.forEach((label, i) => {
      if (i % every !== 0 && i !== labels.length - 1) return;
      const text = el('text', {
        class: 'chart-axis-text', x: x(i), y: M.top + ih + 18, 'text-anchor': 'middle'
      });
      text.textContent = label;
      svg.appendChild(text);
    });

    // --- series --------------------------------------------------------
    const crosshair = el('line', {
      class: 'chart-crosshair', y1: M.top, y2: M.top + ih, x1: 0, x2: 0, opacity: 0
    });
    svg.appendChild(crosshair);

    series.forEach((s) => {
      const pts = s.values.map((v, i) => [x(i), y(v)]);
      const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
      const areaD = `${d} L${pts[pts.length - 1][0].toFixed(1)} ${(M.top + ih).toFixed(1)} L${pts[0][0].toFixed(1)} ${(M.top + ih).toFixed(1)} Z`;

      if (state.area !== false) {
        svg.appendChild(el('path', { class: 'chart-area', d: areaD, fill: s.colour }));
      }
      svg.appendChild(el('path', { class: 'chart-line', d, stroke: s.colour }));
    });

    // --- interactive points -------------------------------------------
    // One focusable hit target per column: it shows every series at once in
    // the tooltip, which is how a grouped column should be read.
    labels.forEach((label, i) => {
      const rows = series.map((s) => ({
        colour: s.colour,
        label: s.name,
        value: state.format ? state.format(s.values[i]) : compact(s.values[i])
      }));
      const html = tipHTML(label, rows);

      const hit = el('circle', {
        class: 'chart-point--hit',
        cx: x(i), cy: M.top + ih / 2, r: Math.max(14, iw / labels.length / 2),
        tabindex: '0',
        role: 'button',
        'aria-label': `${label}. ${rows.map((r) => `${r.label} ${r.value}`).join(', ')}`
      });

      const show = (evt) => {
        crosshair.setAttribute('x1', x(i));
        crosshair.setAttribute('x2', x(i));
        crosshair.setAttribute('opacity', '1');
        const box = evt.target.getBoundingClientRect();
        tip.show(html, box.left + box.width / 2, box.top + box.height / 2);
      };
      const hide = () => {
        crosshair.setAttribute('opacity', '0');
        tip.hide();
      };

      hit.addEventListener('mouseenter', show);
      hit.addEventListener('mouseleave', hide);
      hit.addEventListener('focus', show);
      hit.addEventListener('blur', hide);
      hit.addEventListener('keydown', (e) => {
        // Left/right arrows walk the series; Escape dismisses the tooltip.
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const step = e.key === 'ArrowRight' ? 1 : -1;
          const next = labels[((i + step) + labels.length) % labels.length];
          const target = svg.querySelectorAll('.chart-point--hit');
          const idx = labels.indexOf(next);
          if (target[idx]) target[idx].focus();
        } else if (e.key === 'Escape') {
          hide();
          hit.blur();
        }
      });

      svg.appendChild(hit);

      // Visible markers on top of the lines (decorative; the hit area is above)
      series.forEach((s) => {
        svg.appendChild(
          el('circle', {
            class: 'chart-point', cx: x(i), cy: y(s.values[i]), r: 3.4, fill: s.colour
          })
        );
      });
    });

    host.appendChild(svg);
  }

  draw();

  return {
    update(next) { Object.assign(state, next); draw(); },
    destroy() { host.textContent = ''; }
  };
}

/* ==========================================================================
 * DONUT CHART
 * ========================================================================== */
function donutChart(host, config) {
  const state = { ...config };
  const SIZE = 260;
  const R = 96, THICK = 34;
  const C = 2 * Math.PI * R;

  function polar(cx, cy, r, angle) {
    const a = ((angle - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  function draw() {
    host.textContent = '';
    const items = state.items.filter((it) => it.value > 0);
    const total = items.reduce((sum, it) => sum + it.value, 0) || 1;

    const svg = el('svg', {
      viewBox: `0 0 ${SIZE} ${SIZE}`,
      width: SIZE, height: SIZE,
      role: 'presentation',
      focusable: 'false'
    });

    let angle = 0;
    items.forEach((item) => {
      const sweep = (item.value / total) * 360;
      const [x1, y1] = polar(SIZE / 2, SIZE / 2, R, angle);
      const [x2, y2] = polar(SIZE / 2, SIZE / 2, R, angle + sweep);
      const large = sweep > 180 ? 1 : 0;
      const d = [
        `M${x1} ${y1}`,
        `A${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
        `A${R - THICK} ${R - THICK} 0 ${large} 0 ${x1} ${y1}`,
        'Z'
      ].join(' ');

      const share = ((item.value / total) * 100).toFixed(1);
      const html = tipHTML(item.name, [
        { colour: item.colour, label: 'Share', value: share + '%' },
        { label: 'Workspaces', value: item.value.toLocaleString('en-US') }
      ]);

      const arc = el('path', {
        class: 'donut-arc',
        d,
        fill: item.colour,
        tabindex: '0',
        role: 'button',
        'aria-label': `${item.name}: ${share} percent, ${item.value} workspaces`
      });

      const show = (evt) => {
        const box = evt.target.getBoundingClientRect();
        tip.show(html, box.left + box.width / 2, box.top + box.height / 2);
      };
      arc.addEventListener('mouseenter', show);
      arc.addEventListener('mouseleave', tip.hide.bind(tip));
      arc.addEventListener('focus', show);
      arc.addEventListener('blur', tip.hide.bind(tip));

      svg.appendChild(arc);
      angle += sweep;
    });

    // Centre label
    const value = el('text', { class: 'chart-donut-center-value', x: SIZE / 2, y: SIZE / 2 - 2 });
    value.textContent = state.centreValue ?? '100%';
    const label = el('text', { class: 'chart-donut-center-label', x: SIZE / 2, y: SIZE / 2 + 18 });
    label.textContent = state.centreLabel ?? 'total';
    svg.appendChild(value);
    svg.appendChild(label);

    host.appendChild(svg);
  }

  draw();

  return {
    update(next) { Object.assign(state, next); draw(); },
    destroy() { host.textContent = ''; }
  };
}

/* ==========================================================================
 * GROUPED BAR CHART
 * ========================================================================== */
function barChart(host, config) {
  const state = { ...config };
  const W = 720, H = 300;
  const M = { top: 16, right: 12, bottom: 42, left: 52 };
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;

  function draw() {
    host.textContent = '';
    const groups = state.groups || [];
    const series = state.series || [];
    if (!groups.length) return;

    const all = series.flatMap((s) => s.values);
    const max = niceMax(Math.max(...all));
    const y = (v) => M.top + ih - (v / max) * ih;
    const groupW = iw / groups.length;
    const barW = Math.min(38, (groupW * 0.72) / series.length);

    const svg = el('svg', {
      viewBox: `0 0 ${W} ${H}`,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'presentation',
      focusable: 'false'
    });

    for (let t = 0; t <= 4; t++) {
      const value = (max / 4) * t;
      const yy = y(value);
      svg.appendChild(el('line', { class: 'chart-grid', x1: M.left, x2: M.left + iw, y1: yy, y2: yy }));
      const text = el('text', { class: 'chart-axis-text', x: M.left - 8, y: yy + 3.5, 'text-anchor': 'end' });
      text.textContent = compact(value);
      svg.appendChild(text);
    }

    groups.forEach((group, gi) => {
      const centre = M.left + groupW * gi + groupW / 2;
      const totalWidth = barW * series.length;
      const startX = centre - totalWidth / 2;

      series.forEach((s, si) => {
        const value = s.values[gi];
        const bx = startX + si * barW;
        const by = y(value);
        const height = M.top + ih - by;

        const html = tipHTML(group, series.map((ss) => ({
          colour: ss.colour,
          label: ss.name,
          value: state.format ? state.format(ss.values[gi]) : compact(ss.values[gi])
        })));

        const bar = el('rect', {
          class: 'chart-bar',
          x: bx + 2, y: by, width: barW - 5, height: Math.max(1, height),
          rx: 4,
          fill: s.colour,
          tabindex: '0',
          role: 'button',
          'aria-label': `${group}, ${s.name}: ${state.format ? state.format(value) : compact(value)}`
        });

        const show = (evt) => {
          const box = evt.target.getBoundingClientRect();
          tip.show(html, box.left + box.width / 2, box.top);
        };
        bar.addEventListener('mouseenter', show);
        bar.addEventListener('mouseleave', tip.hide.bind(tip));
        bar.addEventListener('focus', show);
        bar.addEventListener('blur', tip.hide.bind(tip));

        svg.appendChild(bar);
      });

      // group label, wrapped onto two lines when it is long
      const words = group.split(' ');
      const lines = words.length > 1 ? [words[0], words.slice(1).join(' ')] : [group];
      lines.forEach((line, li) => {
        const text = el('text', {
          class: 'chart-axis-text', x: centre, y: M.top + ih + 18 + li * 12, 'text-anchor': 'middle'
        });
        text.textContent = line;
        svg.appendChild(text);
      });
    });

    host.appendChild(svg);
  }

  draw();

  return {
    update(next) { Object.assign(state, next); draw(); },
    destroy() { host.textContent = ''; }
  };
}

/** Rounds a maximum up to a friendly axis value (1, 2, 2.5, 5 x 10^n). */
function niceMax(value) {
  if (value <= 0) return 10;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const norm = value / base;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return step * base;
}

  /* ------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------ */
  NS.charts = {
    sparkline: sparkline,
    lineChart: lineChart,
    donutChart: donutChart,
    barChart: barChart,
    compact: compact,
    money: money,
    moneyFull: moneyFull
  };
})(window);