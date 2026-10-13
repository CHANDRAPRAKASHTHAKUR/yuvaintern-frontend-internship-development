/* ==========================================================================
   analytics.js — code-split chunk
   --------------------------------------------------------------------------
   This file is NOT referenced by a <script> tag. It is pulled in at runtime:

     requestIdleCallback(() => import('./analytics.js').then(m => m.track(...)))

   Because it is a separate module it is a separate request that never
   competes with the critical rendering path, and a visitor on Save-Data or a
   2G connection never downloads it at all.
   ========================================================================== */

/**
 * Sends one page-view beacon.
 * @param {string} event  Event name.
 * @param {Function} send Transport supplied by the caller so this module
 *                        stays free of any transport logic.
 */
export function track(event, send) {
  if (typeof send !== 'function') return;
  send({ event: event, path: location.pathname, ts: Date.now() });
}

/** Reports a Web Vital. Kept tiny and dependency-free on purpose. */
export function reportVital(name, value, endpoint) {
  if (!endpoint || !('sendBeacon' in navigator)) return;
  try {
    navigator.sendBeacon(endpoint, JSON.stringify({ name: name, value: value }));
  } catch (e) { /* never let telemetry break the page */ }
}

/** Passive Web Vitals observer — the measurement cost is ~0.1 ms per event. */
export function observeVitals(endpoint) {
  if (!endpoint || !('PerformanceObserver' in window)) return;
  const wanted = ['largest-contentful-paint', 'layout-shift', 'first-input', 'paint'];

  wanted.forEach(type => {
    try {
      new PerformanceObserver(list => {
        list.getEntries().forEach(entry => reportVital(type, entry.startTime || 0, endpoint));
      }).observe({ type: type, buffered: true });
    } catch (e) { /* type unsupported in this browser */ }
  });
}

observeVitals();
