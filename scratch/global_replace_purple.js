const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Colors
  newContent = newContent.replace(/#b8860b/gi, '#8b5cf6'); // Primary gold -> Primary Purple
  newContent = newContent.replace(/#dbc078/gi, '#d8b4fe'); // Light gold -> Light Purple glow
  newContent = newContent.replace(/#966f09/gi, '#7e22ce'); // Dark gold -> Dark Purple
  newContent = newContent.replace(/#c5a059/gi, '#9333ea'); // Another gold -> Purple

  // Classes
  newContent = newContent.replace(/btn-gold/g, 'btn-purple');
  newContent = newContent.replace(/btn-outline-gold/g, 'btn-outline-purple');
  newContent = newContent.replace(/gold-line/g, 'purple-line');

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
walkDir(path.join(__dirname, '../src/lib'));

console.log('Global replace finished!');
