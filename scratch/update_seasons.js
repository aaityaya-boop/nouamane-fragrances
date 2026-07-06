const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/lib/products.ts');
let content = fs.readFileSync(productsPath, 'utf8');

// The naive replace added `perfectSeason: 'Toutes Saisons',` after every `inStock` line.
// But some lines might be messed up if my regex caught other things. Let's make sure.

// To properly assign seasons, let's parse the file logic or use regex.
// Find blocks of products.
const blocks = content.split('},');
const newBlocks = blocks.map(block => {
  if (block.includes('subcategory:')) {
    let season = 'Toutes Saisons';
    if (block.includes("subcategory: 'fresh'")) season = 'Été';
    if (block.includes("subcategory: 'floral'")) season = 'Printemps';
    if (block.includes("subcategory: 'woody'")) season = 'Automne';
    if (block.includes("subcategory: 'oriental'")) season = 'Hiver';
    if (block.includes("subcategory: 'aromatic'")) season = 'Printemps';
    
    return block.replace(/perfectSeason:\s*'Toutes Saisons'/g, `perfectSeason: '${season}'`);
  }
  return block;
});

content = newBlocks.join('},');
fs.writeFileSync(productsPath, content);
console.log('Seasons updated intelligently!');
