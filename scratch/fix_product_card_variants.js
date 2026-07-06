const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/ProductCard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The ProductCard should have variants for staggered animation if we use it inside ShopCatalog and page grids.
// Right now it only has whileHover. Let's add variants for fade in up.
content = content.replace(/<motion.div\n[\s]*whileHover/g, `<motion.div\n        variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}\n        whileHover`);

fs.writeFileSync(filePath, content);
console.log("ProductCard variants updated.");
