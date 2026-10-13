/**
 * audit-classes.js — find CSS classes used in markup but never defined.
 *
 * Scans index.html, the JS modules (for className = '...' / class="..." /
 * classList.add('...') / pill--${...} patterns) and compares them against the
 * selectors in css/styles.css. Reports anything with no matching rule.
 */
const fs = require('fs');
const path = require('path');

const root = process.argv[2];
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');

// --- classes referenced in HTML ---
const used = new Set();
const attrRe = /class\s*=\s*"([^"]*)"/g;
let m;
while ((m = attrRe.exec(html)) !== null) {
  m[1].split(/\s+/).filter(Boolean).forEach(c => used.add(c));
}

// --- classes referenced in JS (className, classList, class="..." inside templates) ---
const jsDir = path.join(root, 'js');
for (const f of fs.readdirSync(jsDir).filter(f => f.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(jsDir, f), 'utf8');

  // className = 'foo'  /  className = `foo`
  for (const r of src.matchAll(/className\s*=\s*['"`]([^'"`$]*)['"`]/g)) {
    r[1].split(/\s+/).filter(Boolean).forEach(c => used.add(c));
  }
  // class="foo" inside template literals
  for (const r of src.matchAll(/class="([^"$<]*)"/g)) {
    r[1].split(/\s+/).filter(Boolean).forEach(c => used.add(c));
  }
  // classList.add('foo') / .toggle('foo')
  for (const r of src.matchAll(/classList\.(?:add|toggle|remove)\(\s*'([^'$]*)'/g)) {
    r[1].split(/\s+/).filter(Boolean).forEach(c => used.add(c));
  }
}

// --- classes defined in CSS ---
const defined = new Set();
// strip comments so commented-out rules do not count
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
for (const r of cssNoComments.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
  defined.add(r[1]);
}

// --- diff ---
const missing = [...used].filter(c => !defined.has(c)).sort();

console.log('classes used    :', used.size);
console.log('classes defined :', defined.size);
console.log('');
if (missing.length === 0) {
  console.log('OK — every class used in markup has a rule in styles.css');
} else {
  console.log('MISSING RULES (' + missing.length + '):');
  missing.forEach(c => console.log('  .' + c));
}
