import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');

const svgBuf = readFileSync(join(PUBLIC, 'favicon.svg'));

// 32x32 PNG
await sharp(svgBuf, { density: 192 })
  .resize(32, 32)
  .png()
  .toFile(join(PUBLIC, 'favicon-32.png'));

// 180x180 Apple touch icon
await sharp(svgBuf, { density: 600 })
  .resize(180, 180)
  .png()
  .toFile(join(PUBLIC, 'apple-touch-icon.png'));

console.log('favicon-32.png and apple-touch-icon.png written');