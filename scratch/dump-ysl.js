const fs = require('fs');

const logFile = 'C:\\Users\\AYOUB\\.gemini\\antigravity\\brain\\912830ec-da6c-48b3-8196-0b14943e2f63\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

for (const line of lines) {
  if (line.includes('YSL Libre')) {
    const entry = JSON.parse(line);
    console.log('\\n--- STEP', entry.step_index, '---');
    if (entry.type === 'PLANNER_RESPONSE' && entry.tool_calls) {
      for (const call of entry.tool_calls) {
        if (JSON.stringify(call).includes('YSL Libre')) {
          console.log('Tool:', call.name);
          fs.writeFileSync('scratch/ysl-tool-call-' + entry.step_index + '.json', JSON.stringify(call, null, 2));
        }
      }
    } else if (entry.type === 'TOOL_RESPONSE') {
      console.log('TOOL RESPONSE');
      const parsed = JSON.parse(entry.content);
      for (const res of parsed) {
        if (res.content && res.content.includes('YSL Libre')) {
          console.log('Tool name:', res.name);
          fs.writeFileSync('scratch/ysl-tool-res-' + entry.step_index + '.txt', res.content);
        }
      }
    } else {
      console.log('Other type:', entry.type);
    }
  }
}
