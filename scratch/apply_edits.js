const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, search, replacement) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.split(search).join(replacement);
  fs.writeFileSync(filePath, content);
}

const dir = path.join(__dirname, '../src');

// 1. ShopCatalog - Remove Couleur
const shopCatPath = path.join(dir, 'components/ShopCatalog.tsx');
let shopCatContent = fs.readFileSync(shopCatPath, 'utf8');
const colorFilterRegex = /\{\/\* Color \*\/\}[\s\S]*?\{\/\* Material \*\/\}/;
shopCatContent = shopCatContent.replace(colorFilterRegex, '{/* Material */}');
fs.writeFileSync(shopCatPath, shopCatContent);
console.log("Removed Color filter from ShopCatalog");

// 2. ProductCard - Replace Emojis with Lucide SVGs
const pCardPath = path.join(dir, 'components/ProductCard.tsx');
let pCardContent = fs.readFileSync(pCardPath, 'utf8');
pCardContent = pCardContent.replace(/import \{ ShoppingBag, Star \} from 'lucide-react';/, "import { ShoppingBag, Star, Flower, Sun, Leaf, Snowflake, Sparkles } from 'lucide-react';");
pCardContent = pCardContent.replace(/\{product\.perfectSeason === 'Printemps' && '🌸 '\}/, "{product.perfectSeason === 'Printemps' && <Flower size={10} />}");
pCardContent = pCardContent.replace(/\{product\.perfectSeason === 'Été' && '☀️ '\}/, "{product.perfectSeason === 'Été' && <Sun size={10} />}");
pCardContent = pCardContent.replace(/\{product\.perfectSeason === 'Automne' && '🍂 '\}/, "{product.perfectSeason === 'Automne' && <Leaf size={10} />}");
pCardContent = pCardContent.replace(/\{product\.perfectSeason === 'Hiver' && '❄️ '\}/, "{product.perfectSeason === 'Hiver' && <Snowflake size={10} />}");
pCardContent = pCardContent.replace(/\{product\.perfectSeason === 'Toutes Saisons' && '✨ '\}/, "{product.perfectSeason === 'Toutes Saisons' && <Sparkles size={10} />}");
fs.writeFileSync(pCardPath, pCardContent);
console.log("Replaced emojis in ProductCard");

// 3. String Replacements
const files = [
  'app/brands/[brand]/page.tsx',
  'app/cart/page.tsx',
  'app/checkout/page.tsx',
  'app/layout.tsx',
  'app/order-confirmation/page.tsx',
  'app/page.tsx',
  'app/product/[slug]/page.tsx',
  'app/shop/page.tsx',
  'components/CartDrawer.tsx',
  'lib/products.ts',
  'lib/reviews.ts'
];

for (const relPath of files) {
  const fullPath = path.join(dir, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Livraisons
    content = content.replace(/Livraison offerte au Maroc/g, 'Livraison partout au Maroc avec 35Dh');
    content = content.replace(/Livraison offerte partout au Maroc/g, 'Livraison partout au Maroc avec 35Dh');
    content = content.replace(/Livraison gratuite partout au Maroc/g, 'Livraison partout au Maroc avec 35Dh');
    content = content.replace(/Livraison gratuite/g, 'Livraison avec 35Dh');
    content = content.replace(/Livraison offerte/g, 'Livraison 35Dh');
    
    // Echantillons
    content = content.replace(/3 échantillons offerts avec votre commande/g, "Authenticité garantie à 100%");
    content = content.replace(/3 échantillons offerts/g, "Authenticité garantie");
    content = content.replace(/échantillons offerts/g, "produits authentiques");
    content = content.replace(/Recevez 3 échantillons de parfums à choisir avec chaque commande passée./g, "Tous nos parfums sont 100% originaux et certifiés authentiques.");
    
    // Icons if needed
    content = content.replace(/<Gift size=\{22\} strokeWidth=\{1\.5\} \/>/, "<Star size={22} strokeWidth={1.5} />");

    fs.writeFileSync(fullPath, content);
  }
}
console.log("String replacements complete");
