const fs = require('fs');
const content = fs.readFileSync('src/app/[locale]/HomePageClient.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('===============================')) {
    console.log(lines[i]);
    console.log(lines[i+1]);
  }
}
