const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/[locale]/HomePageClient.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace newArrivals logic
content = content.replace(
  `const newArrivals = [...products].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()).slice(0, 4);`,
  `const newArrivals = (() => {
    try {
      const slugs = JSON.parse(homepageConfig?.featuredLatest || '[]');
      if (slugs.length >= 1) return slugs.map((s: string) => products.find((p: any) => p.slug === s)).filter(Boolean) as typeof products;
    } catch {}
    return [...products].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()).slice(0, 4);
  })();`
);

fs.writeFileSync(file, content);
console.log('patched HomePageClient.tsx');
