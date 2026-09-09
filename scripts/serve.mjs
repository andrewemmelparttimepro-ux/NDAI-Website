import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('dist');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.png':'image/png', '.webp':'image/webp', '.jpg':'image/jpeg', '.woff2':'font/woff2', '.svg':'image/svg+xml', '.xml':'application/xml', '.txt':'text/plain' };
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  for (const header of config.headers[0].headers) res.setHeader(header.key, header.value);
  if (path === '/contact') { res.writeHead(308, { Location: '/#contact' }); return res.end(); }
  let name = path === '/' ? '/index.html' : ['/privacy','/consulting'].includes(path) ? path + '.html' : path;
  const filename = resolve(root, '.' + name);
  if (!filename.startsWith(root + '/')) { res.writeHead(403); return res.end(); }
  try { const content = await readFile(filename); res.setHeader('Content-Type', types[extname(filename)] || 'application/octet-stream'); res.end(content); }
  catch { res.writeHead(404, { 'Content-Type':'text/html' }); res.end(await readFile(root + '/404.html')); }
}).listen(Number(process.env.PORT || 8934), '127.0.0.1', () => console.log('NDAI preview: http://127.0.0.1:8934'));
