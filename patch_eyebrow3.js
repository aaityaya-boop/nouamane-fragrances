const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/[locale]/HomePageClient.tsx');
let content = fs.readFileSync(file, 'utf8');

const normalizedContent = content.replace(/\r\n/g, '\n');

const targetStr = `        <SectionHeader
          icon={<Sparkles size={16} className="text-[#0ea5e9]" />}
          title="Les dernières sorties"`;

const replaceStr = `        <SectionHeader
          icon={<Sparkles size={16} className="text-[#0ea5e9]" />}
          eyebrow=""
          title="Les dernières sorties"`;

const newContent = normalizedContent.replace(targetStr, replaceStr);
if (newContent !== normalizedContent) {
    fs.writeFileSync(file, newContent);
    console.log("Patched Nouveautés eyebrow back with empty string.");
} else {
    console.log("Failed to patch.");
}
