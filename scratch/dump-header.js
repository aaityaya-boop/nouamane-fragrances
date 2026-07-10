const fs = require('fs');

const logFile = 'C:\\Users\\AYOUB\\.gemini\\antigravity\\brain\\912830ec-da6c-48b3-8196-0b14943e2f63\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

let output = '';
for (const line of lines) {
  if (line.includes('Header.tsx')) {
    output += line + '\n\n';
  }
}
fs.writeFileSync('scratch/header_lines.txt', output);
console.log('Dumped to scratch/header_lines.txt');
