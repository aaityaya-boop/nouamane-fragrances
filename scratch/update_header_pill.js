const fs = require('fs');
const path = require('path');

const headerPath = path.join(__dirname, '../src/components/Header.tsx');
let content = fs.readFileSync(headerPath, 'utf8');

// 1. Remove isScrolled logic because it's always a glass pill
// We'll keep isHome/alwaysLight variables but we'll force the text to always be dark mode.

// Change the header container classes:
// from: className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isLight ? 'glass shadow-[0_1px_20px_rgba(0,0,0,0.06)]' : 'bg-transparent'}`}
// to: className="fixed top-6 left-6 right-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-[1200px] lg:max-w-[calc(100vw-3rem)] z-50 transition-all duration-500 bg-white/70 backdrop-blur-xl shadow-lg border border-white/50 rounded-full"

content = content.replace(/className=\{`fixed top-0 left-0 right-0 z-50 transition-all duration-500 \$\{\n\s*isLight \? 'glass shadow-\[0_1px_20px_rgba\(0,0,0,0\.06\)\]' : 'bg-transparent'\n\s*\}`\}/, 'className="fixed top-6 left-6 right-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-[1200px] lg:max-w-[calc(100vw-3rem)] z-50 transition-all duration-500 bg-white/70 backdrop-blur-xl shadow-lg border border-white/50 rounded-full"');

// 2. Adjust padding and heights
// from: <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
// to: <div className="px-6 lg:px-10">
content = content.replace(/<div className="max-w-\[1400px\] mx-auto px-6 lg:px-10">/, '<div className="px-6 lg:px-10">');

// from: <div className="flex items-center justify-between h-[72px] lg:h-[84px]">
// to: <div className="flex items-center justify-between h-[60px] lg:h-[70px]">
content = content.replace(/<div className="flex items-center justify-between h-\[72px\] lg:h-\[84px\]">/, '<div className="flex items-center justify-between h-[60px] lg:h-[70px]">');

// 3. Remove conditional isLight logic for text colors since it's always a light frosted glass pill.
// We'll replace all `${isLight ? 'X' : 'Y'}` with just `'X'`.
content = content.replace(/\$\{\n\s*isLight \? 'text-\[\#1A1A1A\]\/70' : 'text-white\/80'\n\s*\}/g, 'text-[#1A1A1A]/70');
content = content.replace(/\$\{\n\s*isLight \? 'text-\[\#1A1A1A\]' : 'text-white'\n\s*\}/g, 'text-[#1A1A1A]');
content = content.replace(/\$\{\n\s*isLight \? 'text-\[\#0ea5e9\]' : 'text-\[\#38bdf8\]'\n\s*\}/g, 'text-[#0ea5e9]');
content = content.replace(/\$\{\n\s*isLight \? 'text-\[\#1A1A1A\]\/60' : 'text-white\/80'\n\s*\}/g, 'text-[#1A1A1A]/60');

// Also for mobile menu
content = content.replace(/\$\{\n\s*isLight \? 'text-\[\#1A1A1A\]' : 'text-white\/80'\n\s*\}/g, 'text-[#1A1A1A]');

fs.writeFileSync(headerPath, content);
console.log("Header updated to Floating Glass Pill!");
