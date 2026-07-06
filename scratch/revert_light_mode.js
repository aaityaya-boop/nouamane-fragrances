const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Text Color Reversion
  newContent = newContent.replace(/text-\[\#f8fafc\]/g, 'text-[#1A1A1A]');
  newContent = newContent.replace(/text-gray-300/g, 'text-gray-600');
  newContent = newContent.replace(/text-\[\#cbd5e1\]/g, 'text-[#6B6B6B]');
  newContent = newContent.replace(/text-\[\#94a3b8\]/g, 'text-[#9A9A9A]');

  // Background Reversion
  newContent = newContent.replace(/bg-\[\#0f172a\]/g, 'bg-[#fafaf7]');
  newContent = newContent.replace(/bg-\[\#1e293b\]\/60 backdrop-blur-md border border-white\/10 shadow-\[0_8px_32px_rgba\(0,0,0,0\.3\)\]/g, 'bg-white border border-[#e0ddd4]');
  
  // Borders
  newContent = newContent.replace(/border-white\/10/g, 'border-[#e0ddd4]');

  // We had set bg-transparent for product images and gradients
  // bg-transparent inside ProductCard was originally bg-[#f5f2eb]
  // We can't safely reverse all bg-transparent, so let's target ProductCard directly later.

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, '../src/app'));
walkDir(path.join(__dirname, '../src/components'));

console.log('Reversion to Light Mode finished!');
