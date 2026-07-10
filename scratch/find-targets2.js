const fs = require('fs');

const logFile = 'C:\\Users\\AYOUB\\.gemini\\antigravity\\brain\\912830ec-da6c-48b3-8196-0b14943e2f63\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

const targets = new Set();
for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    if (entry.tool_calls) {
      for (const call of entry.tool_calls) {
        if (call.name === 'default_api:replace_file_content' || call.name === 'default_api:multi_replace_file_content' || call.name === 'default_api:write_to_file') {
          let args = call.arguments;
          if (typeof args === 'string') {
            try { args = JSON.parse(args); } catch(e) {}
          }
          if (args && args.TargetFile) targets.add(args.TargetFile);
        }
      }
    }
  } catch(e) {}
}

console.log('Targets:', Array.from(targets).join('\\n'));
