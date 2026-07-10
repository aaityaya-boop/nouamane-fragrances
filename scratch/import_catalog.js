const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SOURCE_DIR = 'C:\\Users\\AYOUB\\.gemini\\antigravity\\scratch\\product_images\\processed_images';
const DEST_DIR = path.join(__dirname, '../public/images/catalog');

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Known brands to match against
const BRANDS = [
  { id: 'amouage', label: 'Amouage', keywords: ['amouage'] },
  { id: 'armani', label: 'Giorgio Armani', keywords: ['armani', 'acqua-di-gio', 'si-passione', 'si-fiori', 'si-eau', 'my-way'] },
  { id: 'chanel', label: 'Chanel', keywords: ['chanel', 'coco-mademoiselle', 'chance-'] },
  { id: 'creed', label: 'Creed', keywords: ['creed'] },
  { id: 'dior', label: 'Dior', keywords: ['dior', 'joy-dior', 'poison'] },
  { id: 'tom-ford', label: 'Tom Ford', keywords: ['tom-ford', 'black-orchid', 'bitter-peach', 'lost-cherry'] },
  { id: 'ysl', label: 'Yves Saint Laurent', keywords: ['yves-saint-laurent', 'ysl', 'libre', 'black-opium', 'cinema'] },
  { id: 'gucci', label: 'Gucci', keywords: ['gucci'] },
  { id: 'guerlain', label: 'Guerlain', keywords: ['guerlain', 'la-petite-robe-noire'] },
  { id: 'givenchy', label: 'Givenchy', keywords: ['givenchy', 'l-interdit', 'irresistible'] },
  { id: 'dolce-gabbana', label: 'Dolce & Gabbana', keywords: ['dolce-gabbana', 'l-imperatrice'] },
  { id: 'versace', label: 'Versace', keywords: ['versace'] },
  { id: 'paco-rabanne', label: 'Paco Rabanne', keywords: ['paco-rabanne', '1-million', 'one-million'] },
  { id: 'jean-paul-gaultier', label: 'Jean Paul Gaultier', keywords: ['jean-paul-gaultier', 'jpg', 'scandal', 'le-male'] },
  { id: 'carolina-herrera', label: 'Carolina Herrera', keywords: ['carolina-herrera', 'good-girl'] },
  { id: 'valentino', label: 'Valentino', keywords: ['valentino'] },
  { id: 'prada', label: 'Prada', keywords: ['prada'] },
  { id: 'narciso-rodriguez', label: 'Narciso Rodriguez', keywords: ['narciso-rodriguez', 'narciso-'] },
  { id: 'parfums-de-marly', label: 'Parfums de Marly', keywords: ['parfums-de-marly', 'delina', 'oriana', 'palatine'] },
  { id: 'xerjoff', label: 'Xerjoff', keywords: ['xerjoff'] },
  { id: 'kayali', label: 'Kayali', keywords: ['kayali'] },
  { id: 'montale', label: 'Montale', keywords: ['montale'] },
  { id: 'tiziana-terenzi', label: 'Tiziana Terenzi', keywords: ['tiziana-terenzi'] },
  { id: 'hermes', label: 'Hermès', keywords: ['hermes'] },
  { id: 'boss', label: 'Hugo Boss', keywords: ['boss-'] },
  { id: 'burberry', label: 'Burberry', keywords: ['burberry'] },
  { id: 'lancome', label: 'Lancôme', keywords: ['la-vie-est-belle', 'tresor'] },
  { id: 'elie-saab', label: 'Elie Saab', keywords: ['elie-saab'] },
  { id: 'victoria-secret', label: "Victoria's Secret", keywords: ['victoria-s-secret', 'bombshell'] },
  { id: 'mfk', label: 'Maison Francis Kurkdjian', keywords: ['baccarat-rouge'] },
];

function formatName(filename) {
  let name = filename.replace('_0.jpg', '').replace('.jpg', '');
  name = name.replace(/-/g, ' ');
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function detectBrand(filename) {
  const lower = filename.toLowerCase();
  for (const brand of BRANDS) {
    if (brand.keywords.some(k => lower.includes(k))) {
      return brand;
    }
  }
  return { id: 'other', label: 'Maison de Parfum' };
}

async function run() {
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  console.log(`Found ${files.length} images to process.`);

  let count = 0;
  for (const file of files) {
    const sourcePath = path.join(SOURCE_DIR, file);
    
    // Create safe filename
    const safeFilename = file.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const destPath = path.join(DEST_DIR, safeFilename);
    
    // Copy image
    fs.copyFileSync(sourcePath, destPath);

    // Extract info
    let rawSlug = safeFilename.replace('_0.jpg', '').replace('.jpg', '');
    const slug = rawSlug + '-tester';
    let name = formatName(file);
    name = name.replace(' Eau De Parfum', '').replace(' Eau De Toilette', '').replace(' Le Parfum', '');
    
    const brandInfo = detectBrand(file);

    // Determine gender roughly (very basic)
    let gender = 'unisex';
    const lowerName = name.toLowerCase();
    if (lowerName.includes('pour homme') || lowerName.includes('homme') || lowerName.includes('man') || lowerName.includes('boy')) gender = 'men';
    if (lowerName.includes('pour femme') || lowerName.includes('femme') || lowerName.includes('woman') || lowerName.includes('girl')) gender = 'women';

    // Construct Product
    const product = {
      slug,
      name,
      brandId: brandInfo.id,
      brandLabel: brandInfo.label,
      gender,
      subcategory: 'signature',
      subcategoryLabel: 'Signature',
      tagline: `Découvrez l'essence de ${name}`,
      price: 1190, // Standard tester price
      originalPrice: 1690,
      testerPrice: null,
      description: `Testeur authentique de ${name} par ${brandInfo.label}. Profitez de la même fragrance exceptionnelle à un prix imbattable.`,
      longDescription: `Ce produit est un parfum de démonstration (testeur) 100% authentique et original. ${name} de ${brandInfo.label} est une fragrance captivante qui laisse un sillage inoubliable. Les testeurs sont neufs, n'ont jamais été utilisés, et proviennent directement du fabricant.`,
      images: JSON.stringify([`/images/catalog/${safeFilename}`]),
      notes: JSON.stringify({
        top: ['Notes de tête'],
        heart: ['Notes de cœur'],
        base: ['Notes de fond']
      }),
      ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water)',
      sizes: JSON.stringify([{ label: '100ml', price: 1190 }]),
      bottleColor: 'transparent',
      bottleColorLabel: 'Classique',
      bottleMaterial: 'glass',
      bottleMaterialLabel: 'Verre',
      rating: 4.8 + (Math.random() * 0.2), // Random between 4.8 and 5.0
      reviewCount: Math.floor(Math.random() * 50) + 10,
      releaseDate: '2023',
      tags: JSON.stringify(['tester', 'nouveau']),
      isTester: true,
      inStock: true,
      stock: 10,
      perfectSeason: 'Toutes saisons'
    };

    try {
      await prisma.product.upsert({
        where: { slug },
        update: product,
        create: product,
      });
      count++;
    } catch (e) {
      console.error(`Error inserting ${slug}:`, e);
    }
  }
  
  console.log(`Successfully added/updated ${count} products!`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
