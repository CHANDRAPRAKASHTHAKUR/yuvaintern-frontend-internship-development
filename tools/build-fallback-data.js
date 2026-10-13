/**
 * ==========================================================================
 *  build-fallback-data.js — regenerate js/fallback-data.js from the JSON
 * --------------------------------------------------------------------------
 *  data/dashboard-data.json is the primary data source (the task requires a
 *  JSON file). browsers block fetch() on the file:// protocol, so
 *  js/fallback-data.js exists purely as the fallback for someone who opens
 *  index.html by double-clicking it.
 *
 *  Generating it instead of maintaining it by hand means the two files can
 *  never drift apart.
 *
 *  Usage:  node tools/build-fallback-data.js
 * ==========================================================================
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'week-5-dashboard-app');
const jsonPath = path.join(root, 'data', 'dashboard-data.json');
const outPath = path.join(root, 'js', 'fallback-data.js');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const banner = [
  '/**',
  ' * ==========================================================================',
  ' *  fallback-data.js — offline / file:// fallback',
  ' * --------------------------------------------------------------------------',
  ' *  GENERATED FILE — do not edit by hand.',
  ' *  Regenerate with:  node tools/build-fallback-data.js',
  ' *',
  ' *  The dashboard normally fetches data/dashboard-data.json. Browsers block',
  ' *  fetch() on the file:// protocol, so when that request fails this file is',
  ' *  injected as a classic <script> tag. The dashboard then works when',
  ' *  index.html is opened straight from disk, with no server.',
  ' *',
  ' *  Over http:// this file is never downloaded: the injection only runs',
  ' *  inside the rejection branch of DataService.load().',
  ' * ==========================================================================',
  ' */',
  '',
  '(function (global) {',
  "  'use strict';",
  '',
  '  var NS = (global.NovaDash = global.NovaDash || {});',
  '',
  '  NS.FALLBACK_DATA = '
].join('\n');

const footer = [
  ';',
  '',
  '  // Marker so the app can tell a fallback load apart from a live fetch.',
  '  NS.FALLBACK = true;',
  '})(window);',
  ''
].join('\n');

fs.writeFileSync(outPath, banner + JSON.stringify(data, null, 2) + footer);

const size = fs.statSync(outPath).size;
console.log(
  'Wrote js/fallback-data.js  (' +
  size.toLocaleString('en-US') + ' bytes) from data/dashboard-data.json'
);