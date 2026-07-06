const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/lib/products.ts');
let content = fs.readFileSync(productsPath, 'utf8');

// The bad replacement looks like:
// tags: [tags: ['bestseller', 'seasonal-fall'],
// inStock: true,
// perfectSeason: 'Toutes Saisons',],
// inStock: true,
// perfectSeason: 'Automne',

// We can just replace this mess.
const regex = /tags:\s*\[tags:\s*(\[.*?\]),\s*inStock:\s*(true|false),\s*perfectSeason:\s*'Toutes Saisons',],\s*inStock:\s*(true|false),\s*perfectSeason:\s*'Automne',/g;

content = content.replace(regex, "tags: $1,\n    inStock: $2,\n    perfectSeason: 'Automne',");

// Wait, let's make it more resilient in case the whitespace varies
content = content.replace(/tags:\s*\[tags:\s*(.*?\n.*?\n.*?),],\n\s*inStock:\s*(true|false),\n\s*perfectSeason:\s*'(.*?)',/g, "tags: $1,\n    inStock: $2,\n    perfectSeason: '$3',");

// Even simpler: just use a simpler replace
// Look for tags: [tags: [
// Let's just find and replace exactly what was created:
// "tags: [$" where $& was the matched text. So the matched text was "tags: ['bestseller', 'seasonal-fall'],\n    inStock: true,\n    perfectSeason: 'Toutes Saisons',"
// Which means the string literally became:
// tags: [tags: ['bestseller', 'seasonal-fall'],
//     inStock: true,
//     perfectSeason: 'Toutes Saisons',],
//     inStock: true,
//     perfectSeason: 'Automne',

const literalRegex = /tags:\s*\[tags:\s*(\[.*?\]),\s*inStock:\s*(true|false),\s*perfectSeason:\s*'Toutes Saisons',\],\s*inStock:\s*(true|false),\s*perfectSeason:\s*'Automne',/g;
content = content.replace(literalRegex, "tags: $1,\n    inStock: $2,\n    perfectSeason: 'Automne',");

fs.writeFileSync(productsPath, content);
console.log("Fixed!");
