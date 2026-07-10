const fs = require('fs');

const logFile = 'C:\\Users\\AYOUB\\.gemini\\antigravity\\brain\\912830ec-da6c-48b3-8196-0b14943e2f63\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

let latestHeaderContent = null;
let latestHomeContent = null;

for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    if (entry.tool_calls) {
      for (const call of entry.tool_calls) {
        if (call.name === 'default_api:write_to_file' || call.name === 'default_api:multi_replace_file_content' || call.name === 'default_api:replace_file_content') {
          const args = call.arguments;
          if (args.TargetFile && args.TargetFile.endsWith('Header.tsx')) {
            console.log('Found Header modification in step:', entry.step_index);
            if (args.CodeContent) {
              latestHeaderContent = args.CodeContent;
            }
            // For replace tools, it's harder to get the full file, but we might have viewed it or something.
            // If we did a full write_to_file, we have it.
          }
          if (args.TargetFile && args.TargetFile.endsWith('HomePageClient.tsx')) {
            console.log('Found HomePageClient modification in step:', entry.step_index);
            if (args.CodeContent) {
              latestHomeContent = args.CodeContent;
            }
          }
        }
      }
    }
    
    // Check tool responses for view_file
    if (entry.type === 'TOOL_RESPONSE') {
      const parsedContent = JSON.parse(entry.content);
      for (const res of parsedContent) {
        if (res.name === 'default_api:view_file' && res.content) {
          const contentStr = res.content;
          if (contentStr.includes('Header.tsx') && contentStr.includes('Total Lines:')) {
            console.log('Found Header view_file at step', entry.step_index);
            // We can parse the viewed lines if needed, but if it showed lines 1 to 300, we might have the full file.
          }
        }
      }
    }
  } catch (e) {}
}

if (latestHeaderContent) fs.writeFileSync('scratch/Header_recovered.tsx', latestHeaderContent);
if (latestHomeContent) fs.writeFileSync('scratch/Home_recovered.tsx', latestHomeContent);
console.log('Done scanning transcript');
