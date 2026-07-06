const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Colors
  newContent = newContent.replace(/#5e4b52/gi, '#8b5cf6'); 
  newContent = newContent.replace(/#403238/gi, '#6b21a8'); 
  newContent = newContent.replace(/#1a1a1a/gi, '#1e1b4b'); // deep indigo for text instead of pure black for better glow effect
  newContent = newContent.replace(/#1A1A1A/gi, '#1e1b4b'); // deep indigo for text

  // Fix button glow in page.tsx hero
  newContent = newContent.replace(/shadow-lg hover:shadow-xl/g, 'shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_25px_rgba(139,92,246,0.8)]');

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

console.log('Second pass replace finished!');
