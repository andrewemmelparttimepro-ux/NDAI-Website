import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
const jobs = [
  ['hitzero-logo.png', 'hitzero', 160, 160],
  ['spas360-logo.png', 'spas360', 280, 201],
  ['sandpro-omp-logo.png', 'sandpro', 340, 95],
  ['logo-flat.png', 'logo-flat', 76, 58],
  ['founder-headshot.jpg', 'founder', 256, 256],
];
for (const [file, name, width, height] of jobs) {
  await sharp('public/' + file).rotate().resize(width, height, { fit: name === 'founder' ? 'cover' : 'contain', background: '#00000000' }).webp({ quality: 88, effort: 6 }).toFile(`public/assets/${name}.webp`);
}
const logo = (await readFile('public/logo-flat.png')).toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#070707"/><rect x="60" y="59" width="1080" height="1" fill="#414141"/><image href="data:image/png;base64,${logo}" x="65" y="91" width="60" height="46"/><text x="147" y="122" fill="#f2f2f0" font-family="Arial,sans-serif" font-weight="700" font-size="30" letter-spacing="7">NDAI</text><text x="65" y="260" fill="#f2f2f0" font-family="Arial,sans-serif" font-weight="900" font-size="76">SOFTWARE THAT</text><text x="65" y="350" fill="#9b8d72" font-family="Arial,sans-serif" font-weight="900" font-size="76">FITS YOUR BUSINESS.</text><text x="68" y="420" fill="#b8b8b4" font-family="Arial,sans-serif" font-size="29">AI consulting &amp; custom software</text><text x="68" y="540" fill="#a0a09d" font-family="Arial,sans-serif" font-size="21" letter-spacing="2">MINOT, NORTH DAKOTA</text><text x="981" y="540" fill="#6ea8dc" font-family="Arial,sans-serif" font-size="25">ndai.pro</text></svg>`;
await writeFile('public/assets/ndai-share.svg', svg);
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/assets/ndai-share.png');
console.log('Optimized existing production imagery and generated branded share card.');
