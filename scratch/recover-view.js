const fs = require('fs');

const logFile = 'C:\\Users\\AYOUB\\.gemini\\antigravity\\brain\\912830ec-da6c-48b3-8196-0b14943e2f63\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

for (let i = lines.length - 1; i >= 0; i--) {
  const line = lines[i];
  try {
    const entry = JSON.parse(line);
    if (entry.type === 'TOOL_RESPONSE') {
      const parsedContent = JSON.parse(entry.content);
      for (const res of parsedContent) {
        if (res.name === 'default_api:view_file' && res.content && res.content.includes('Header.tsx')) {
          console.log(`Found view_file for Header.tsx at step ${entry.step_index}`);
          fs.appendFileSync('scratch/found_views.txt', `\n\n--- STEP ${entry.step_index} ---\n${res.content}`);
        }
      }
    }
  } catch (e) {}
}
console.log('Done scanning view_file');
