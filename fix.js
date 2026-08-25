
const fs = require('fs');
let shopCode = fs.readFileSync('src/app/[locale]/shop/page.tsx', 'utf8');

// Replace metadata
shopCode = shopCode.replace(/export const metadata = \\{[\\s\\S]*?\\};/, "export const metadata = { title: 'Parfums Arabes | NAY Parfums', description: 'Découvrez notre collection exclusive de parfums arabes. L\\'essence de l\\'Orient dans des flacons luxueux.' };");

// Replace component name
shopCode = shopCode.replace(/export default async function ShopPage/g, "export default async function ArabicPerfumesPage");

// Replace prisma query
shopCode = shopCode.replace(/where: \\{ published: true,[\\s\\S]*?subcategory: \\{ notIn: \\['master-copier', 'coffrets'\\] \\}[\\s\\S]*?\\}/g, "where: { published: true, subcategory: 'arabic' }");

// Replace title & description text
shopCode = shopCode.replace(/La Boutique/g, "L'Orient");
shopCode = shopCode.replace(/L'EXCELLENCE/g, "L'EXCELLENCE"); // actually keep it as excellence, user screenshot literally shows excellence!
shopCode = shopCode.replace(/Olfactive/g, "Orientale"); // L'EXCELLENCE Orientale
shopCode = shopCode.replace(/testeurs 100% authentiques/g, "parfums arabes");

// Ensure ShopCatalog is locked to arabic
shopCode = shopCode.replace(/<ShopCatalog products=\\{products\\} brands=\\{dbBrands\\} \\/>/g, "<ShopCatalog products={products} brands={dbBrands} lockedSubcategory='arabic' />");

fs.writeFileSync('src/app/[locale]/parfums-arabes/page.tsx', shopCode, 'utf8');

