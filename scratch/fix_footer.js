const fs = require('fs');
const path = require('path');

const footerPath = path.join(__dirname, '../src/components/Footer.tsx');
let content = fs.readFileSync(footerPath, 'utf8');

// Replace text colors
content = content.replace(/<footer className="bg-\[\#f8fafc\] text-white">/, '<footer className="bg-[#fafaf7] border-t border-[#e0ddd4] text-[#1A1A1A]">');
content = content.replace(/text-white\/60/g, 'text-[#1A1A1A]/70');
content = content.replace(/text-white\/50/g, 'text-[#1A1A1A]/60');
content = content.replace(/text-white\/40/g, 'text-[#1A1A1A]/50');
content = content.replace(/text-white\/30/g, 'text-[#1A1A1A]/50');
content = content.replace(/text-white\/20/g, 'text-[#1A1A1A]/40');
content = content.replace(/text-white/g, 'text-[#1A1A1A]');
content = content.replace(/border-white\/20/g, 'border-[#1A1A1A]/20');

// Fix hover states
content = content.replace(/hover:text-white\/60/g, 'hover:text-[#1A1A1A]/80');

fs.writeFileSync(footerPath, content);
console.log("Footer text colors updated to dark mode!");
