const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Add import
if (!content.includes('SplitTypographyHero')) {
  content = content.replace(
    "import BestsellersDirectory from '@/components/BestsellersDirectory';",
    "import BestsellersDirectory from '@/components/BestsellersDirectory';\nimport SplitTypographyHero from '@/components/SplitTypographyHero';"
  );
}

// Replace Hero section
const heroMatch = /\{\/\* ===============================\s*HERO\s*=============================== \*\/\}[\s\S]*?<\/section>/;

const newHero = `{/* ===============================
          HERO (SPLIT TYPOGRAPHY)
          =============================== */}
      <SplitTypographyHero />`;

if (heroMatch.test(content)) {
  content = content.replace(heroMatch, newHero);
  fs.writeFileSync(pagePath, content);
  console.log("Hero applied!");
} else {
  console.log("Hero not found. Check regex.");
}
