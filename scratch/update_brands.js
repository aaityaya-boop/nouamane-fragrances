const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Add import
if (!content.includes('StickyBrandsShowcase')) {
  content = content.replace(
    "import BestsellersDirectory from '@/components/BestsellersDirectory';",
    "import BestsellersDirectory from '@/components/BestsellersDirectory';\nimport StickyBrandsShowcase from '@/components/StickyBrandsShowcase';"
  );
}

// Replace Brands section
const brandsMatch = /\{\/\* ===============================\s*BRAND SHOWCASE\s*=============================== \*\/\}[\s\S]*?<\/section>/;

const newBrands = `{/* ===============================
          BRAND SHOWCASE (STICKY STACKING)
          =============================== */}
      <StickyBrandsShowcase />`;

if (brandsMatch.test(content)) {
  content = content.replace(brandsMatch, newBrands);
  fs.writeFileSync(pagePath, content);
  console.log("Brands applied!");
} else {
  console.log("Brands section not found. Check regex.");
}
