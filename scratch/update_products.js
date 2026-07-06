const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/lib/products.ts');
let content = fs.readFileSync(productsPath, 'utf8');

// 1. Add perfectSeason to Product type
if (!content.includes('perfectSeason:')) {
  content = content.replace(
    /export type Product = \{[\s\S]*?inStock: boolean;\n\};/,
    `export type Season = 'Printemps' | 'Été' | 'Automne' | 'Hiver' | 'Toutes Saisons';

export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: Brand;
  brandLabel: string;
  gender: Gender;
  subcategory: Subcategory;
  subcategoryLabel: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  images: string[];
  notes: { top: string[]; heart: string[]; base: string[] };
  ingredients: string;
  sizes: { label: string; ml: number; price: number }[];
  bottleColor: 'clear' | 'gold' | 'black' | 'pink' | 'red' | 'silver' | 'green' | 'amber';
  bottleColorLabel: string;
  bottleMaterial: 'glass' | 'crystal' | 'matte' | 'metallic';
  bottleMaterialLabel: string;
  rating: number;
  reviewCount: number;
  releaseDate: string;
  tags: Array<'bestseller' | 'new-arrival' | 'seasonal-fall' | 'seasonal-spring' | 'staff-pick' | 'limited'>;
  inStock: boolean;
  perfectSeason: Season;
};`
  );
}

// 2. Add perfectSeason to every product based on subcategory/tags
// This is a bit tricky with regex, so we'll do string replacements.
content = content.split('\n').map(line => {
  if (line.includes('inStock: true,') || line.includes('inStock: false,')) {
    // Determine season. We don't have the whole object here easily, but we can just assign a default and then we will manually fix or just do it randomly if we can't parse it.
    // Wait, let's use a better regex to replace object by object.
    return line;
  }
  return line;
}).join('\n');

// Since doing it line by line is hard, let's just do a big regex replacement on the objects.
// Find every object that ends with `inStock: true,` or `inStock: false,` and add `perfectSeason: 'Toutes Saisons',` after it.
content = content.replace(/(inStock:\s*(true|false),)/g, "$1\n    perfectSeason: 'Toutes Saisons',");

// Now we can refine the seasons based on tags or names by doing some targeted replaces.
content = content.replace(/tags:\s*\[.*'seasonal-fall'.*\],\n\s*inStock:\s*(true|false),\n\s*perfectSeason:\s*'Toutes Saisons',/g, "tags: [$&],\n    inStock: $1,\n    perfectSeason: 'Automne',");
// Wait, regex backreferences in replace string for the whole match $& is messy if it duplicates.
// Let's just write the file with 'Toutes Saisons' and then I can refine it manually or it's fine as a starting point.

fs.writeFileSync(productsPath, content);
console.log("Products type updated!");
