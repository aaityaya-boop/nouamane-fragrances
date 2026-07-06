const fs = require('fs');
const path = require('path');

function searchInDir(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      searchInDir(fullPath, query);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          console.log(`${fullPath}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

console.log("--- Searching for 'livraison' ---");
searchInDir(path.join(__dirname, '../src'), 'livraison');
console.log("\n--- Searching for 'échantillons' ---");
searchInDir(path.join(__dirname, '../src'), 'échantillons');
