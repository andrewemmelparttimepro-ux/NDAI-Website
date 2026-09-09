import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
for (const page of ['index.html', 'privacy.html', '404.html', 'consulting.html']) {
  const html = await readFile('public/' + page, 'utf8');
  assert.equal((html.match(/<main\b/g) || []).length, 1, `${page}: one main landmark`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page}: one main heading`);
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) await access('public' + match[1]);
}
const home = await readFile('public/index.html', 'utf8');
assert(!home.includes('fonts.googleapis.com'), 'No external font stylesheet');
assert(!home.includes('location.search).get(\'sent\')'), 'No URL-based submission confirmation');
assert.equal((home.match(/class="faq-item"/g) || []).length, 6);
assert.equal((home.match(/class="mq-card"/g) || []).length, 5);
console.log('Static release validation passed. Validated source in public/.');
