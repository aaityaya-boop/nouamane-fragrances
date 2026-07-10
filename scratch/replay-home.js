const fs = require('fs');

const logFile = 'C:\\Users\\AYOUB\\.gemini\\antigravity\\brain\\912830ec-da6c-48b3-8196-0b14943e2f63\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

let homeContent = fs.readFileSync('src/app/[locale]/HomePageClient.tsx', 'utf8');

for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    if (entry.tool_calls) {
      for (const call of entry.tool_calls) {
        if (call.name === 'default_api:replace_file_content' || call.name === 'default_api:multi_replace_file_content') {
          const args = call.arguments;
          const target = args.TargetFile;
          if (target && target.endsWith('HomePageClient.tsx')) {
            console.log('Applying edit to HomePageClient.tsx at step', entry.step_index);
            if (args.TargetContent && args.ReplacementContent) {
              const parts = homeContent.split(args.TargetContent);
              if (parts.length > 1) {
                homeContent = parts.join(args.ReplacementContent);
                console.log('  -> Success single replace');
              } else {
                console.log('  -> Failed single replace');
              }
            }
            if (args.ReplacementChunks) {
              let chunks = args.ReplacementChunks;
              if (typeof chunks === 'string') chunks = JSON.parse(chunks);
              for (const chunk of chunks) {
                const parts = homeContent.split(chunk.TargetContent);
                if (parts.length > 1) {
                  homeContent = parts.join(chunk.ReplacementContent);
                  console.log('  -> Success chunk replace');
                } else {
                  console.log('  -> Failed chunk replace');
                }
              }
            }
          }
        }
      }
    }
  } catch(e) {}
}

fs.writeFileSync('scratch/Home_replayed2.tsx', homeContent);
console.log('Replay finished. Check scratch folder.');
