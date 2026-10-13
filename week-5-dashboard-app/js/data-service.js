/**
 * ==========================================================================
 *  data-service.js — data loading with a stale-while-revalidate cache
 * --------------------------------------------------------------------------
 *  The whole dashboard reads from a single static JSON file. This module:
 *
 *    1. returns cached data immediately (localStorage, 5-minute TTL) so the
 *       UI can paint in ~0 ms on a repeat visit,
 *    2. revalidates in the background and swaps in the fresh copy when it
 *       arrives, telling the caller whether the data is stale,
 *    3. falls back gracefully instead of throwing, including on `file://`,
 *       where the browser blocks fetch() of a local file,
 *    4. never lets a hung request block the UI (8 second timeout).
 *
 *  Written as a classic script rather than an ES module so that it also runs
 *  when index.html is opened directly from disk.
 *
 *  Exposes: window.NovaDash.DataService
 * ==========================================================================
 */
(function (global) {
  'use strict';

  var NS = (global.NovaDash = global.NovaDash || {});

  /** Milliseconds a cached copy is considered fresh. */
  var TTL = 5 * 60 * 1000; // 5 minutes

  /** Namespaced so it never clashes with the theme key. */
  var KEY = 'novadash:data:v1';

  /**
   * Injects a classic <script> on demand and resolves when it has run.
   * Needed because ES `import()` is blocked on file://, while a classic
   * script tag is not. Repeated calls for the same src share one promise.
   */
  var scriptCache = {};
  function loadScript(src) {
    if (scriptCache[src]) return scriptCache[src];

    scriptCache[src] = new Promise(function (resolve, reject) {
      var tag = document.createElement('script');
      tag.src = src;
      tag.async = false;          // preserve execution order for injectors
      tag.onload = resolve;
      tag.onerror = function () { reject(new Error('Could not load ' + src)); };
      document.head.appendChild(tag);
    });

    return scriptCache[src];
  }

  var DataService = {
    TTL: TTL,

    /**
     * @param {string} url  Path to the JSON file.
     * @returns {Promise<{data: object|null, fromCache: boolean, error: Error|null}>}
     */
    load: function (url) {
      var cached = this.readCache();

      // Stale-while-revalidate: paint immediately, update when the fetch lands.
      if (cached) {
        this.revalidate(url);
        return Promise.resolve({ data: cached, fromCache: true, error: null });
      }

      return this.fetchJson(url).then(
        function (data) {
          DataService.writeCache(data);
          return { data: data, fromCache: false, error: null };
        },
        function (networkError) {
          // Reached when fetch() is blocked (file://) or the server is down.
          return loadScript('js/fallback-data.js')
            .then(function () {
              if (NS.FALLBACK_DATA) {
                return { data: NS.FALLBACK_DATA, fromCache: false, error: null };
              }
              return { data: null, fromCache: false, error: networkError };
            })
            .catch(function () {
              return { data: null, fromCache: false, error: networkError };
            });
        }
      );
    },

    /** Fetch + parse, with a timeout so a hung request cannot block the UI. */
    fetchJson: function (url, timeoutMs) {
      var limit = timeoutMs || 8000;
      var controller = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = setTimeout(function () { if (controller) controller.abort(); }, limit);

      var options = {
        cache: 'no-cache',
        headers: { Accept: 'application/json' }
      };
      if (controller) options.signal = controller.signal;

      return fetch(url, options).then(
        function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status + ' while loading ' + url);
          return response.json();
        },
        function (err) {
          // Re-throw so the caller's rejection handler runs.
          throw err;
        }
      ).then(
        function (data) { clearTimeout(timer); return data; },
        function (err) { clearTimeout(timer); throw err; }
      );
    },

    /** Background refresh. Silently upgrades the cache; never rejects. */
    revalidate: function (url) {
      this.fetchJson(url).then(
        function (data) { DataService.writeCache(data); },
        function () { /* offline: the cached copy stays valid */ }
      );
    },

    readCache: function () {
      try {
        var raw = global.localStorage.getItem(KEY);
        if (!raw) return null;
        var entry = JSON.parse(raw);
        if (!entry || typeof entry.savedAt !== 'number') return null;

        var age = Date.now() - entry.savedAt;
        // Spread the payload and attach cache metadata.
        var payload = {};
        Object.keys(entry.payload).forEach(function (k) { payload[k] = entry.payload[k]; });
        payload.__cacheAgeMs = age;
        payload.__stale = age > TTL;
        return payload;
      } catch (e) {
        return null; // corrupt entry, or storage disabled
      }
    },

    writeCache: function (data) {
      try {
        global.localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), payload: data }));
      } catch (e) {
        // Quota exceeded or private mode: the dashboard still works, it just
        // re-fetches every time.
      }
    },

    clearCache: function () {
      try { global.localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    },

    /** Human-readable age of the cached copy, for the freshness label. */
    describeAge: function (ms) {
      if (ms == null) return 'Live data';
      var s = Math.round(ms / 1000);
      if (s < 60) return 'Cached ' + s + 's ago';
      var m = Math.round(s / 60);
      if (m < 60) return 'Cached ' + m + ' min ago';
      return 'Cached ' + Math.round(m / 60) + ' h ago';
    },

    /** Shared with app.js for the on-demand charts chunk. */
    loadScript: loadScript
  };

  NS.DataService = DataService;
})(window);