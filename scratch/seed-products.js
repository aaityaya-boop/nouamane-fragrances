const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Upsert Brands
  await prisma.brand.upsert({
    where: { slug: 'amouage' },
    update: {},
    create: {
      slug: 'amouage',
      name: 'Amouage',
      label: 'Amouage',
      description: 'The Gift of Kings. Niche luxury fragrances from Oman.',
    }
  });

  await prisma.brand.upsert({
    where: { slug: 'armani' },
    update: {},
    create: {
      slug: 'armani',
      name: 'Giorgio Armani',
      label: 'Giorgio Armani',
      description: 'Elegance and refinement.',
    }
  });

  const products = [
    {
      slug: 'amouage-honour-woman-tester',
      name: 'Amouage Honour Woman',
      brandId: 'amouage',
      brandLabel: 'Amouage',
      gender: 'women',
      subcategory: 'floral',
      subcategoryLabel: 'Floral',
      tagline: 'Un bouquet de fleurs blanches éclatant et dramatique',
      price: 2190,
      originalPrice: 2890,
      testerPrice: 1590,
      description: 'Amouage Honour Woman est une fragrance élégante aux notes de fleurs blanches inspirée de Madame Butterfly.',
      longDescription: 'Amouage Honour Woman est une fragrance élégante aux notes de fleurs blanches inspirée de Madame Butterfly.',
      images: JSON.stringify(['/images/amouage-honour-woman.jpg']),
      notes: JSON.stringify({
        top: ['Coriander', 'Pepper', 'Rhubarb'],
        heart: ['Carnation', 'Jasmine', 'Gardenia', 'Tuberose', 'Lily of the Valley'],
        base: ['Vetiver', 'Opoponax', 'Amber', 'Incense', 'Leather']
      }),
      ingredients: 'Alcohol Denat, Parfum...',
      sizes: JSON.stringify(['100ml']),
      bottleColor: 'white',
      bottleColorLabel: 'Blanc',
      bottleMaterial: 'glass',
      bottleMaterialLabel: 'Verre',
      rating: 4.8,
      reviewCount: 12,
      releaseDate: '2011',
      tags: JSON.stringify(['niche', 'tester']),
      isTester: true,
      inStock: true,
      stock: 5,
      perfectSeason: 'Spring'
    },
    {
      slug: 'amouage-epic-woman-tester',
      name: 'Amouage Epic Woman',
      brandId: 'amouage',
      brandLabel: 'Amouage',
      gender: 'women',
      subcategory: 'oriental',
      subcategoryLabel: 'Oriental',
      tagline: 'L\'opulence épicée de la route de la Soie',
      price: 2390,
      originalPrice: 2990,
      testerPrice: 1690,
      description: 'Amouage Epic Woman est une fragrance orientale épicée luxueuse inspirée par la mythique Route de la Soie.',
      longDescription: 'Amouage Epic Woman est une fragrance orientale épicée luxueuse inspirée par la mythique Route de la Soie.',
      images: JSON.stringify(['/images/amouage-epic-woman.jpg']),
      notes: JSON.stringify({
        top: ['Cumin', 'Pink Bay', 'Cinnamon'],
        heart: ['Damascene Rose', 'Geranium', 'Jasmine', 'Tea'],
        base: ['Amber', 'Musk', 'Oud', 'Frankincense', 'Guaiac Wood', 'Orris', 'Sandalwood', 'Patchouli', 'Vanilla']
      }),
      ingredients: 'Alcohol Denat, Parfum...',
      sizes: JSON.stringify(['100ml']),
      bottleColor: 'green',
      bottleColorLabel: 'Vert',
      bottleMaterial: 'glass',
      bottleMaterialLabel: 'Verre',
      rating: 4.9,
      reviewCount: 18,
      releaseDate: '2009',
      tags: JSON.stringify(['niche', 'tester']),
      isTester: true,
      inStock: true,
      stock: 3,
      perfectSeason: 'Winter'
    },
    {
      slug: 'armani-acqua-di-gio-pour-homme-tester',
      name: 'Acqua Di Giò Pour Homme',
      brandId: 'armani',
      brandLabel: 'Giorgio Armani',
      gender: 'men',
      subcategory: 'fresh',
      subcategoryLabel: 'Frais',
      tagline: 'La fraîcheur iconique de la mer',
      price: 1190,
      originalPrice: 1490,
      testerPrice: 890,
      description: 'Acqua Di Giò est le parfum marin iconique de Giorgio Armani, capturant l\'essence de la Méditerranée.',
      longDescription: 'Acqua Di Giò est le parfum marin iconique de Giorgio Armani, capturant l\'essence de la Méditerranée.',
      images: JSON.stringify(['/images/adg-pour-homme.jpg']),
      notes: JSON.stringify({
        top: ['Orange', 'Lime', 'Mandarin Orange', 'Jasmine', 'Bergamot', 'Lemon', 'Neroli'],
        heart: ['Cyclamen', 'Nutmeg', 'Mignonette', 'Coriander', 'Violet', 'Freesia', 'Sea Notes', 'Peach', 'Hyacinth', 'Rose', 'Jasmine', 'Rosemary', 'Calone'],
        base: ['Amber', 'Patchouli', 'Oakmoss', 'Cedar', 'White Musk']
      }),
      ingredients: 'Alcohol, Aqua, Parfum...',
      sizes: JSON.stringify(['100ml']),
      bottleColor: 'white',
      bottleColorLabel: 'Givré',
      bottleMaterial: 'glass',
      bottleMaterialLabel: 'Verre',
      rating: 4.7,
      reviewCount: 156,
      releaseDate: '1996',
      tags: JSON.stringify(['bestseller', 'tester']),
      isTester: true,
      inStock: true,
      stock: 12,
      perfectSeason: 'Summer'
    },
    {
      slug: 'armani-acqua-di-gio-profumo-tester',
      name: 'Acqua Di Giò Profumo',
      brandId: 'armani',
      brandLabel: 'Giorgio Armani',
      gender: 'men',
      subcategory: 'woody',
      subcategoryLabel: 'Boisé',
      tagline: 'La force de la roche et de la mer',
      price: 1390,
      originalPrice: 1790,
      testerPrice: 1090,
      description: 'Acqua Di Giò Profumo est une fragrance profondément sophistiquée et intensément masculine.',
      longDescription: 'Acqua Di Giò Profumo est une fragrance profondément sophistiquée et intensément masculine, mariant l\'encens volcanique et la fraîcheur océanique.',
      images: JSON.stringify(['/images/adg-profumo.jpg']),
      notes: JSON.stringify({
        top: ['Bergamot', 'Sea Notes'],
        heart: ['Geranium', 'Rosemary', 'Sage'],
        base: ['Patchouli', 'Incense']
      }),
      ingredients: 'Alcohol, Aqua, Parfum...',
      sizes: JSON.stringify(['75ml']),
      bottleColor: 'black',
      bottleColorLabel: 'Noir',
      bottleMaterial: 'glass',
      bottleMaterialLabel: 'Verre',
      rating: 4.9,
      reviewCount: 84,
      releaseDate: '2015',
      tags: JSON.stringify(['discontinued', 'rare', 'tester']),
      isTester: true,
      inStock: true,
      stock: 2,
      perfectSeason: 'All'
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p
    });
    console.log('Inserted: ' + p.name);
  }
}

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
