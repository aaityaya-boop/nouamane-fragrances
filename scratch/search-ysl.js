const fs = require('fs');

const logFile = 'C:\\Users\\AYOUB\\.gemini\\antigravity\\brain\\912830ec-da6c-48b3-8196-0b14943e2f63\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

let found = false;
for (const line of lines) {
  if (line.includes('YSL Libre')) {
    console.log('Found YSL Libre in transcript!');
    found = true;
  }
}
if (!found) {
  console.log('YSL Libre NOT FOUND in transcript!');
}
