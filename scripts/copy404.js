// scripts/copy404.js
// Copies dist/index.html to dist/404.html for SPA fallback (cross-platform)
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../dist/index.html');
const dest = path.join(__dirname, '../dist/404.html');

fs.copyFileSync(src, dest);
console.log('Copied dist/index.html to dist/404.html');
