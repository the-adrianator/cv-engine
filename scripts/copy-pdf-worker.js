/**
 * Script to copy PDF.js worker file to public folder
 * This ensures the worker version matches the installed pdfjs-dist version
 * 
 * Run this after npm install or when pdfjs-dist is updated
 */

const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const dest = path.join(__dirname, '../public/pdf.worker.min.mjs');

if (!fs.existsSync(source)) {
  console.error('Error: PDF.js worker file not found at:', source);
  console.error('Make sure pdfjs-dist is installed: npm install pdfjs-dist');
  process.exit(1);
}

try {
  fs.copyFileSync(source, dest);
  console.log('✅ Successfully copied PDF.js worker to public folder');
  console.log('   Source:', source);
  console.log('   Destination:', dest);
} catch (error) {
  console.error('Error copying PDF.js worker:', error);
  process.exit(1);
}

