import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { extname, basename } from 'node:path';
import './validate-build.mjs';
// Keep source files stable. Only generated output receives immutable asset names.
await rm('dist', { recursive: true, force: true });
await cp('public', 'dist', { recursive: true });
await rm('dist/assets', { recursive: true, force: true });
await mkdir('dist/assets');
const names = await readdir('public/assets');
const order = (name) => name === 'site.js' ? 3 : ['.css', '.js'].includes(extname(name)) ? 2 : 1;
names.sort((a,b) => order(a)-order(b) || a.localeCompare(b));
const mapping = new Map();
const rewrite = (text) => { for (const [from,to] of mapping) text = text.replaceAll(from, to); return text; };
for (const name of names) {
  let bytes = await readFile('public/assets/' + name);
  if (['.css','.js'].includes(extname(name))) bytes = Buffer.from(rewrite(bytes.toString()));
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0,12);
  const output = basename(name, extname(name)) + '.' + hash + extname(name);
  await writeFile('dist/assets/' + output, bytes);
  mapping.set('/assets/' + name, '/assets/' + output);
}
for (const name of await readdir('dist')) {
  if (!name.endsWith('.html')) continue;
  await writeFile('dist/' + name, rewrite(await readFile('dist/' + name, 'utf8')));
}
await writeFile('dist/asset-manifest.json', JSON.stringify(Object.fromEntries(mapping), null, 2));
console.log(`Built static site with ${mapping.size} content-addressed assets.`);
