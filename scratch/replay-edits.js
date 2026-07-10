const fs = require('fs');

const logFile = 'C:\\Users\\AYOUB\\.gemini\\antigravity\\brain\\912830ec-da6c-48b3-8196-0b14943e2f63\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

let headerContent = fs.readFileSync('src/components/Header.tsx', 'utf8');
let homeContent = fs.readFileSync('src/app/[locale]/HomePageClient.tsx', 'utf8');

for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    if (entry.tool_calls) {
      for (const call of entry.tool_calls) {
        if (call.name === 'default_api:replace_file_content' || call.name === 'default_api:multi_replace_file_content') {
          const args = call.arguments;
          const target = args.TargetFile;
          if (target && target.endsWith('Header.tsx')) {
            console.log('Applying edit to Header.tsx at step', entry.step_index);
            if (args.TargetContent && args.ReplacementContent) {
              headerContent = headerContent.split(args.TargetContent).join(args.ReplacementContent);
            }
            if (args.ReplacementChunks) {
              let chunks = args.ReplacementChunks;
              if (typeof chunks === 'string') chunks = JSON.parse(chunks);
              for (const chunk of chunks) {
                headerContent = headerContent.split(chunk.TargetContent).join(chunk.ReplacementContent);
              }
            }
          }
          if (target && target.endsWith('HomePageClient.tsx')) {
            console.log('Applying edit to HomePageClient.tsx at step', entry.step_index);
            if (args.TargetContent && args.ReplacementContent) {
              homeContent = homeContent.split(args.TargetContent).join(args.ReplacementContent);
            }
            if (args.ReplacementChunks) {
              let chunks = args.ReplacementChunks;
              if (typeof chunks === 'string') chunks = JSON.parse(chunks);
              for (const chunk of chunks) {
                homeContent = homeContent.split(chunk.TargetContent).join(chunk.ReplacementContent);
              }
            }
          }
        }
      }
    }
  } catch(e) {}
}

fs.writeFileSync('scratch/Header_replayed.tsx', headerContent);
fs.writeFileSync('scratch/Home_replayed.tsx', homeContent);
console.log('Replay finished. Check scratch folder.');
