const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/[locale]/HomePageClient.tsx');
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        <SectionHeader
          icon={<Sparkles size={16} className="text-[#0ea5e9]" />}
          eyebrow="Nouveautés"
          title="Les dernières sorties"`;

const replaceStr = `        <SectionHeader
          icon={<Sparkles size={16} className="text-[#0ea5e9]" />}
          title="Les dernières sorties"`;

const newContent = content.replace(targetStr.replace(/\r\n/g, '\n'), replaceStr.replace(/\r\n/g, '\n'));
if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    console.log("Patched Nouveautés eyebrow.");
} else {
    console.log("Failed to patch.");
}
