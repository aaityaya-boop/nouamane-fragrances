const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Colors (Purple -> Blue)
  newContent = newContent.replace(/#8b5cf6/gi, '#0ea5e9'); 
  newContent = newContent.replace(/#d8b4fe/gi, '#38bdf8'); 
  newContent = newContent.replace(/#6b21a8/gi, '#0369a1'); 
  newContent = newContent.replace(/#9333ea/gi, '#0284c7'); 

  // Text Color for Dark Mode
  newContent = newContent.replace(/#1e1b4b/gi, '#f8fafc'); 
  newContent = newContent.replace(/text-\[\#1A1A1A\]/gi, 'text-[#f8fafc]'); 
  newContent = newContent.replace(/text-gray-600/gi, 'text-gray-300'); 
  newContent = newContent.replace(/text-\[\#6B6B6B\]/gi, 'text-[#cbd5e1]');
  newContent = newContent.replace(/text-\[\#9A9A9A\]/gi, 'text-[#94a3b8]');
  
  // Specific backgrounds for dark theme
  newContent = newContent.replace(/bg-\[\#fafaf7\]/gi, 'bg-[#0f172a]');
  newContent = newContent.replace(/bg-gradient-to-r from-\[\#f8f8f8\] to-\[\#ffffff\]/gi, 'bg-transparent');
  newContent = newContent.replace(/bg-white/g, 'bg-[#1e293b]/60 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]');
  newContent = newContent.replace(/bg-\[\#f5f2eb\]/g, 'bg-transparent'); // Image backgrounds in product cards
  
  // Borders
  newContent = newContent.replace(/border-\[\#e0ddd4\]/gi, 'border-white/10');
  
  // Classes
  newContent = newContent.replace(/btn-purple/g, 'btn-blue');
  newContent = newContent.replace(/btn-outline-purple/g, 'btn-outline-blue');
  newContent = newContent.replace(/purple-line/g, 'blue-line');

  // Fix button glow in page.tsx hero
  newContent = newContent.replace(/rgba\(139,92,246,0\.5\)/g, 'rgba(14,165,233,0.5)');
  newContent = newContent.replace(/rgba\(139,92,246,0\.8\)/g, 'rgba(14,165,233,0.8)');

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
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, '../src/app'));
walkDir(path.join(__dirname, '../src/components'));

console.log('Oceanic replace finished!');
