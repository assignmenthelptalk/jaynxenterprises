import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC   = join(__dirname, '..', 'public');
const OUT_DIR  = join(PUBLIC, 'categories');

await mkdir(OUT_DIR, { recursive: true });

// Map filename substrings → category slug + Kenya SEO alt text
const MAP = [
  {
    match: 'Conveyor Belts',
    slug:  'conveyor-belts',
    alt:   'Conveyor belts and systems for industrial use in Kenya — Jaynx Enterprises Nairobi',
  },
  {
    match: 'Bearings',
    slug:  'bearings',
    alt:   'SKF, FAG and NSK bearings for machinery in Kenya — Jaynx Enterprises Nairobi',
  },
  {
    match: 'V-Belts',
    slug:  'v-belts',
    alt:   'V-belts, timing belts and drive components supplier in Kenya — Jaynx Enterprises',
  },
  {
    match: 'Air & Pneumatic',
    slug:  'air-pneumatic',
    alt:   'Air and pneumatic components, fittings and tubing in Kenya — Jaynx Enterprises',
  },
  {
    match: 'Compressor',
    slug:  'compressor-parts',
    alt:   'Compressor parts and filters for industrial machinery in Kenya — Jaynx Enterprises',
  },
  {
    match: 'Electrical',
    slug:  'electrical-motors',
    alt:   'Electrical motors and motor components supplier Kenya — Jaynx Enterprises Nairobi',
  },
  {
    match: 'Seals',
    slug:  'seals-gaskets',
    alt:   'Seals, O-rings and gaskets for industrial machinery Kenya — Jaynx Enterprises',
  },
  {
    match: 'Boiler',
    slug:  'boiler-steam',
    alt:   'Boiler and steam system parts supplier in Kenya — Jaynx Enterprises Nairobi',
  },
  {
    match: 'Crusher',
    slug:  'crusher-processing',
    alt:   'Crusher and processing machine parts in Kenya — Jaynx Enterprises Nairobi',
  },
  {
    match: 'Water Filtration',
    slug:  'water-filtration',
    alt:   'Water filtration systems and filter cartridges Kenya — Jaynx Enterprises',
  },
  {
    match: 'Separator & Decanter Parts (2)',
    slug:  'separator-decanter',
    alt:   'Separator and decanter spare parts supplier Kenya — Jaynx Enterprises Nairobi',
  },
  {
    match: 'Lubricants',
    slug:  'lubricants',
    alt:   'Industrial lubricants and food-grade greases Kenya — Jaynx Enterprises Nairobi',
  },
  {
    match: 'Sensors',
    slug:  'sensors-controls',
    alt:   'Sensors, controls and instrumentation for industry Kenya — Jaynx Enterprises',
  },
  {
    match: 'Diesel',
    slug:  'diesel-filters',
    alt:   'Diesel engine filters and Fleetguard filters Kenya — Jaynx Enterprises Nairobi',
  },
  {
    match: 'Fasteners',
    slug:  'fasteners-hardware',
    alt:   'Fasteners, bolts and hardware supplies in Kenya — Jaynx Enterprises Nairobi',
  },
  {
    match: 'Piping',
    slug:  'piping-valves',
    alt:   'Pipes, valves and piping solutions supplier Kenya — Jaynx Enterprises Nairobi',
  },
];

// Branding SVG overlay (bottom strip + text)
function brandingOverlay(w, h) {
  const stripH = Math.round(h * 0.11);
  const fontSize = Math.round(stripH * 0.42);
  const subSize  = Math.round(stripH * 0.30);
  return Buffer.from(`
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <!-- dark gradient strip at bottom -->
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.72"/>
    </linearGradient>
  </defs>
  <rect x="0" y="${h - stripH * 2}" width="${w}" height="${stripH * 2}" fill="url(#g)"/>

  <!-- logo mark -->
  <rect x="${Math.round(w * 0.04)}" y="${h - stripH + Math.round(stripH * 0.18)}"
    width="${Math.round(stripH * 0.58)}" height="${Math.round(stripH * 0.58)}"
    rx="${Math.round(stripH * 0.12)}" fill="#2563eb"/>
  <text
    x="${Math.round(w * 0.04 + stripH * 0.29)}"
    y="${h - stripH + Math.round(stripH * 0.62)}"
    font-family="Arial Black, Arial, sans-serif"
    font-size="${Math.round(stripH * 0.4)}"
    font-weight="900"
    fill="white"
    text-anchor="middle">J</text>

  <!-- company name -->
  <text
    x="${Math.round(w * 0.04 + stripH * 0.72)}"
    y="${h - stripH + Math.round(stripH * 0.52)}"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    fill="white">Jaynx Enterprises</text>

  <!-- URL -->
  <text
    x="${Math.round(w * 0.04 + stripH * 0.72)}"
    y="${h - stripH + Math.round(stripH * 0.80)}"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${subSize}"
    font-weight="400"
    fill="rgba(255,255,255,0.72)">jaynxenterprises.co.ke</text>
</svg>`);
}

const files = await readdir(PUBLIC);
const pngs  = files.filter(f => f.toLowerCase().endsWith('.png'));

for (const file of pngs) {
  const entry = MAP.find(m => file.includes(m.match));
  if (!entry) { console.log(`⚠ skipped: ${file}`); continue; }

  const src  = join(PUBLIC, file);
  const dest = join(OUT_DIR, `${entry.slug}.webp`);

  const img  = sharp(src);
  const meta = await img.metadata();
  const w    = meta.width;
  // Crop 3% off the bottom-right to remove the sparkle watermark
  const h    = Math.round(meta.height * 0.97);

  const overlay = brandingOverlay(w, h);

  await img
    .extract({ left: 0, top: 0, width: w, height: h })
    .composite([{ input: overlay, top: 0, left: 0 }])
    .webp({ quality: 82, effort: 4 })
    .toFile(dest);

  console.log(`✓ ${entry.slug}.webp  (${w}×${h})`);
}

console.log('\nDone — images in public/categories/');