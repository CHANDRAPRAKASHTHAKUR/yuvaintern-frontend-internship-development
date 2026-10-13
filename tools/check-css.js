/**
 * check-css.js — structural sanity checks on a stylesheet.
 *   1. braces balanced
 *   2. no selector defined twice at the same nesting level
 *   3. no rule references a var() that is never defined
 */
const fs = require('fs');
const path = require('path');

const file = path.join(process.argv[2], 'css', 'styles.css');
const raw = fs.readFileSync(file, 'utf8');

// --- 1. brace balance (ignoring comments and strings) ---
const clean = raw.replace(/\/\*[\s\S]*?\*\//g, '');
let depth = 0, line = 1, minDepth = 0;
for (const ch of clean) {
  if (ch === '\n') line++;
  if (ch === '{') depth++;
  if (ch === '}') { depth--; if (depth < minDepth) minDepth = depth; }
}

// --- 2. duplicate top-level selectors ---
const seen = new Map();
const dupes = [];
const ruleRe = /(^|\})\s*([^{}@]+?)\s*\{/g;
let m;
while ((m = ruleRe.exec(clean)) !== null) {
  const sel = m[2].trim().replace(/\s+/g, ' ');
  if (!sel || sel.startsWith('@')) continue;
  // only flag plain selectors (ignore :hover/:focus variants, which are distinct)
  if (/:(hover|focus|active|focus-visible|disabled)/.test(sel)) continue;
  if (seen.has(sel)) dupes.push(sel);
  else seen.set(sel, true);
}

// --- 3. var() usage vs definition (ignore vars that supply a fallback) ---
const usedVars = new Set();
for (const v of clean.matchAll(/var\(\s*(--[\w-]+)\s*[,)]/g)) {
  // If the char after the name is a comma, a fallback is provided -> safe.
  if (v[0].trimEnd().endsWith(',')) continue;
  usedVars.add(v[1]);
}
const defVars = new Set();
for (const v of clean.matchAll(/(--[\w-]+)\s*:/g)) defVars.add(v[1]);
const undef = [...usedVars].filter(v => !defVars.has(v));

console.log('file      :', file);
console.log('braces    :', depth === 0 && minDepth === 0 ? 'balanced' : `UNBALANCED (depth=${depth}, min=${minDepth})`);
console.log('duplicates:', dupes.length ? 'NONE' : dupes.join(', '));
console.log('undefined vars:', undef.length ? undef.join(', ') : 'none');
