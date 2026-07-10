const fs = require('fs');

const logFile = 'C:\\Users\\AYOUB\\.gemini\\antigravity\\brain\\912830ec-da6c-48b3-8196-0b14943e2f63\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

let bestHeader = '';
let bestHome = '';
let bestHero = '';
let bestBrands = '';

for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    
    // Check write_to_file
    if (entry.tool_calls) {
      for (const call of entry.tool_calls) {
        if (call.name === 'default_api:write_to_file' && call.arguments && call.arguments.TargetFile) {
          if (call.arguments.TargetFile.endsWith('Header.tsx')) {
            bestHeader = call.arguments.CodeContent;
          }
          if (call.arguments.TargetFile.endsWith('HomePageClient.tsx')) {
            bestHome = call.arguments.CodeContent;
          }
          if (call.arguments.TargetFile.endsWith('SplitTypographyHero.tsx')) {
            bestHero = call.arguments.CodeContent;
          }
          if (call.arguments.TargetFile.endsWith('StickyBrandsShowcase.tsx')) {
            bestBrands = call.arguments.CodeContent;
          }
        }
      }
    }
    
    // Check view_file responses
    if (entry.type === 'TOOL_RESPONSE' && entry.content) {
      const parsedContent = JSON.parse(entry.content);
      for (const res of parsedContent) {
        if (res.name === 'default_api:view_file' && res.content && res.content.includes('Header.tsx') && res.content.includes('YSL Libre')) {
          // It's a view file response, it has lines numbered like '1: code'
          const contentLines = res.content.split('\n');
          let codeStr = '';
          for (const cl of contentLines) {
            const match = cl.match(/^\\d+:\\s(.*)$/);
            if (match) codeStr += match[1] + '\n';
          }
          if (codeStr.length > bestHeader.length) {
            bestHeader = codeStr;
          }
        }
      }
    }
  } catch(e) {}
}

if (bestHeader) fs.writeFileSync('scratch/Header_recovered.tsx', bestHeader);
if (bestHome) fs.writeFileSync('scratch/Home_recovered.tsx', bestHome);
if (bestHero) fs.writeFileSync('scratch/Hero_recovered.tsx', bestHero);
if (bestBrands) fs.writeFileSync('scratch/Brands_recovered.tsx', bestBrands);

console.log('Recovery attempted. Check scratch folder.');
