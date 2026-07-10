const fs = require('fs');
let file = fs.readFileSync('src/app/[locale]/HomePageClient.tsx', 'utf8');

// 1. Fix the product selection logic
file = file.replace(/const bestsellers = products\.filter.*?\.slice\(0, 4\);/, 'const bestsellers = products.slice(0, 8);');
file = file.replace(/const seasonalTrends = products\.filter.*?\.slice\(0, 4\);/, 'const seasonalTrends = products.slice(8, 16);');

// Fix Bestsellers slice in the JSX
file = file.replace(/bestsellers\.slice\(0, 4\)/g, 'bestsellers.slice(0, 8)');

// 2. Rearrange the sections
const parts = file.split('{/* ===============================');
let newParts = [];

for(let i=0; i<parts.length; i++) {
  if (i === 2) continue; // Skip BRAND SHOWCASE
  if (i === 6) continue; // Skip CATEGORY SHORTCUTS
  
  if (i === 3) {
    // Before Bestsellers, insert CATEGORY SHORTCUTS
    newParts.push(parts[6]); // Category shortcuts
    newParts.push(parts[i]); // Bestsellers
  } else if (i === 5) {
    newParts.push(parts[i]); // Seasonal
    newParts.push(parts[2]); // Brand showcase (under seasonal)
  } else {
    newParts.push(parts[i]);
  }
}

// 3. Make Categories more professional
// We need to modify parts[6] content which is now in newParts[1]
let catSection = newParts[1];
catSection = catSection.replace('className="grid grid-cols-1 md:grid-cols-3 gap-5"', 'className="grid grid-cols-1 md:grid-cols-3 gap-10"');
catSection = catSection.replace('rounded-2xl overflow-hidden border border-[#e0ddd4]', 'rounded-none overflow-hidden group-hover:shadow-2xl transition-all duration-700');
catSection = catSection.replace('bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/30', 'bg-transparent text-white/90 px-0 py-0 text-[11px] font-semibold tracking-[0.2em] uppercase hover:text-[#0ea5e9] transition-colors border-none relative after:content-[\'\'] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-white/30 hover:after:bg-[#0ea5e9]');
catSection = catSection.replace('<div className="mt-6 flex flex-wrap justify-center gap-2">', '<div className="mt-8 flex flex-col items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">');
newParts[1] = catSection;

const result = newParts.join('{/* ===============================');
fs.writeFileSync('src/app/[locale]/HomePageClient.tsx', result);
console.log('Successfully rearranged sections and updated logic');
