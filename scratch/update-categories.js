const fs = require('fs');
const file = 'src/lib/products.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `export const MAIN_CATEGORIES = [
  {
    key: 'women',
    label: 'Parfums Femme',
    labelShort: 'Femme',
    slug: 'women',
    subcategories: [
      { key: 'floral', label: 'Floral', slug: 'floral' },
      { key: 'oriental', label: 'Oriental', slug: 'oriental' },
      { key: 'fresh', label: 'Fresh', slug: 'fresh' },
      { key: 'woody', label: 'Boisé', slug: 'woody' },
    ],
    description:
      'Notre sélection complète des parfums féminins iconiques signés Valentino, Yves Saint Laurent et Armani. Des florals lumineux comme YSL Libre aux orientaux addictifs comme Black Opium, trouvez le parfum qui définira votre signature. Chaque flacon est authentique, importé directement des maisons officielles, et livré offert partout au Maroc.',
    heroImage: '/images/femme-thumb.jpg',
  },
  {
    key: 'men',
    label: 'Parfums Homme',
    labelShort: 'Homme',
    slug: 'men',
    subcategories: [
      { key: 'woody', label: 'Boisé', slug: 'woody' },
      { key: 'aromatic', label: 'Aromatique', slug: 'aromatic' },
      { key: 'oriental', label: 'Oriental', slug: 'oriental' },
      { key: 'fresh', label: 'Fresh', slug: 'fresh' },
    ],
    description:
      'La sélection définitive des parfums masculins de créateurs. De la sensualité gourmande d\\'Armani Stronger With You à la fraîcheur méditerranéenne d\\'Acqua di Giò Profumo, en passant par la nouvelle icône YSL MYSLF — ce sont les fragrances que portent les hommes de goût au Maroc. Authenticité garantie, produits authentiques.',
    heroImage: '/images/homme-thumb.jpg',
  },
] as const;`;

content = content.replace(/export const MAIN_CATEGORIES = \[[\s\S]*?\] as const;/, replacement);

fs.writeFileSync(file, content);
console.log('Updated MAIN_CATEGORIES in products.ts');
