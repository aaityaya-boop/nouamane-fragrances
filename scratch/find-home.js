const fs = require('fs');

const logFile = 'C:\\Users\\AYOUB\\.gemini\\antigravity\\brain\\912830ec-da6c-48b3-8196-0b14943e2f63\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

for (const line of lines) {
  if (line.includes('HomePageClient.tsx')) {
    try {
      const entry = JSON.parse(line);
      if (entry.tool_calls) {
        for (const call of entry.tool_calls) {
          if (call.name === 'default_api:write_to_file' && call.arguments.TargetFile && call.arguments.TargetFile.endsWith('HomePageClient.tsx')) {
            console.log('Found write_to_file for HomePageClient.tsx at step', entry.step_index);
            fs.writeFileSync('scratch/home-tool-call-' + entry.step_index + '.json', JSON.stringify(call, null, 2));
          }
        }
      }
    } catch(e) {}
  }
}
