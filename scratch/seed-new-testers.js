const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addProducts() {
  const products = [
    {
      slug: 'amouage-interlude-man-tester',
      name: 'Amouage Interlude Man',
      brandId: 'amouage',
      brandLabel: 'Amouage',
      gender: 'men',
      subcategory: 'oriental',
      subcategoryLabel: 'Oriental',
      tagline: 'Un parfum boisé et épicé qui révèle une harmonie dans le chaos.',
      price: 1590,
      originalPrice: 2190,
      testerPrice: null,
      description: "Amouage Interlude Man est un parfum riche, puissant et complexe, combinant des notes de bergamote, d'origan, d'ambre et de cuir.",
      longDescription: "Amouage Interlude Man est un parfum riche, puissant et complexe, combinant des notes de bergamote, d'origan, d'ambre et de cuir. Parfait pour laisser une empreinte inoubliable.",
      images: JSON.stringify(['/images/amouage-interlude-tester.jpg']),
      notes: JSON.stringify({
        top: ['Bergamot', 'Oregano', 'Pimento Berry'],
        heart: ['Amber', 'Frankincense', 'Cistus', 'Opoponax'],
        base: ['Leather', 'Agarwood Smoke', 'Patchouli', 'Sandalwood']
      }),
      ingredients: 'Alcohol Denat, Parfum (Fragrance)...',
      sizes: JSON.stringify([
        { label: '100ml', price: 1590 }
      ]),
      bottleColor: 'blue',
      bottleColorLabel: 'Bleu nuit',
      bottleMaterial: 'glass',
      bottleMaterialLabel: 'Verre',
      rating: 4.9,
      reviewCount: 18,
      releaseDate: '2012',
      tags: JSON.stringify(['niche', 'tester']),
      isTester: true,
      inStock: true,
      stock: 5,
      perfectSeason: 'Winter'
    },
    {
      slug: 'armani-prive-magenta-tanzanite-tester',
      name: 'Armani Privé Magenta Tanzanite',
      brandId: 'armani',
      brandLabel: 'Giorgio Armani',
      gender: 'women', // Using women category as unisex is hidden
      subcategory: 'oriental',
      subcategoryLabel: 'Oriental Épicé',
      tagline: 'Une fragrance mystique inspirée de la pierre précieuse de Tanzanie.',
      price: 1590,
      originalPrice: 2190,
      testerPrice: null,
      description: "Armani Privé Magenta Tanzanite est un parfum ambré épicé, capturant l'aura vibrante d'un lever de soleil africain.",
      longDescription: "Armani Privé Magenta Tanzanite est un parfum ambré épicé, capturant l'aura vibrante d'un lever de soleil africain avec des notes de cardamome, cannelle et myrrhe.",
      images: JSON.stringify(['/images/armani-magenta-tanzanite-tester.jpg']),
      notes: JSON.stringify({
        top: ['Cardamom', 'Ginger', 'Bergamot'],
        heart: ['Cinnamon', 'Coffee', 'Myrrh'],
        base: ['Tobacco', 'Vanilla', 'Tonka Bean']
      }),
      ingredients: 'Alcohol Denat, Parfum (Fragrance)...',
      sizes: JSON.stringify([
        { label: '100ml', price: 1590 }
      ]),
      bottleColor: 'magenta',
      bottleColorLabel: 'Magenta',
      bottleMaterial: 'glass',
      bottleMaterialLabel: 'Verre',
      rating: 4.8,
      reviewCount: 9,
      releaseDate: '2022',
      tags: JSON.stringify(['niche', 'tester']),
      isTester: true,
      inStock: true,
      stock: 5,
      perfectSeason: 'Winter'
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    console.log(`Added: ${product.name}`);
  }
}

addProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
