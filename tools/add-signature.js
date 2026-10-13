/**
 * add-signature.js — append an author signature to each submission description
 * and recompute the stated word count so the "(N words)" note stays honest.
 *
 * Usage: node tools/add-signature.js
 */
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..', 'reports');
const SIGNATURE = '— **Chandra Prakash Thakur**, Junior Frontend Developer Internship';

function countWords(text) {
  // Strip the markdown fences, the heading, the author line and the
  // "(N words — ...)" note, then count the prose that gets submitted.
  return text
    .replace(/^#.*$/gm, '')
    .replace(/^\*\*Author:.*$/gm, '')
    .replace(/^\*\(.*\)\*$/gm, '')
    .replace(/\*\*/g, '')
    .replace(/[`*_#>|-]/g, ' ')
    .split(/\s+/)
    .filter(w => /[A-Za-z0-9]/.test(w))
    .length;
}

for (const name of fs.readdirSync(dir).filter(f => /^week-\d+-submission\.md$/.test(f)).sort()) {
  const full = path.join(dir, name);
  let text = fs.readFileSync(full, 'utf8');

  // Drop any previous signature before re-adding, so this is idempotent.
  text = text.replace(/\n*—\s*\*\*Chandra Prakash Thakur\*\*.*\n?/g, '\n');
  text = text.trimEnd() + '\n\n' + SIGNATURE + '\n';

  const words = countWords(text);
  text = text.replace(
    /^\*\(\d+ words.*$/m,
    '*(' + words + ' words — paste into the "Write description for the report" box)*'
  );

  fs.writeFileSync(full, text, 'utf8');
  console.log(name.padEnd(28), words + ' words');
}