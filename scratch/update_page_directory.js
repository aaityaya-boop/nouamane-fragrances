const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Add import
if (!content.includes('BestsellersDirectory')) {
  content = content.replace(
    "import ProductCard from '@/components/ProductCard';",
    "import ProductCard from '@/components/ProductCard';\nimport BestsellersDirectory from '@/components/BestsellersDirectory';"
  );
}

const carouselMatch = /\{\/\* Drag Carousel Container \*\/\}[\s\S]*?<\/motion\.div>\s*<\/div>/;

const newDirectory = `{/* Brutalist Directory */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <BestsellersDirectory products={bestsellers.slice(0, 4)} />
        </div>`;

if (carouselMatch.test(content)) {
  content = content.replace(carouselMatch, newDirectory);
  fs.writeFileSync(pagePath, content);
  console.log("Directory applied!");
} else {
  console.log("Carousel not found. Check regex.");
}
