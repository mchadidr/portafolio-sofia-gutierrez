// scripts/copy404.js (ESM)
// Copies dist/index.html to dist/404.html for SPA fallback (cross-platform, ESM)
import { copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, '../dist/index.html');
const dest = join(__dirname, '../dist/404.html');

copyFileSync(src, dest);
console.log('Copied dist/index.html to dist/404.html');
