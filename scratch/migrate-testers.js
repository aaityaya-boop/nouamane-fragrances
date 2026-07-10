const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateTesters() {
  console.log('Starting tester migration...');
  
  // Find all products that have a tester price
  const productsWithTester = await prisma.product.findMany({
    where: {
      testerPrice: {
        not: null
      }
    }
  });

  console.log(`Found ${productsWithTester.length} products with a tester format.`);

  for (const p of productsWithTester) {
    const testerSlug = `${p.slug}-tester`;
    
    // Check if it already exists to avoid duplicates
    const existing = await prisma.product.findUnique({
      where: { slug: testerSlug }
    });

    if (!existing) {
      console.log(`Cloning ${p.name} as a Tester...`);
      
      const newTester = await prisma.product.create({
        data: {
          slug: testerSlug,
          name: `${p.name} (Testeur)`,
          brandId: p.brandId,
          brandLabel: p.brandLabel,
          gender: p.gender,
          subcategory: p.subcategory,
          subcategoryLabel: p.subcategoryLabel,
          tagline: p.tagline,
          price: p.testerPrice, // Set the tester price as the main price
          originalPrice: p.price, // Keep original price as crossed-out price for reference, or null
          testerPrice: null,
          description: p.description,
          longDescription: p.longDescription,
          images: p.images,
          notes: p.notes,
          ingredients: p.ingredients,
          sizes: JSON.stringify([{ label: "100ml", ml: 100, price: p.testerPrice }]), // Assuming testers are 100ml. Modify as needed
          bottleColor: p.bottleColor,
          bottleColorLabel: p.bottleColorLabel,
          bottleMaterial: p.bottleMaterial,
          bottleMaterialLabel: p.bottleMaterialLabel,
          rating: p.rating,
          reviewCount: p.reviewCount,
          releaseDate: p.releaseDate,
          tags: p.tags,
          isTester: true,
          inStock: p.inStock,
          stock: p.stock,
          perfectSeason: p.perfectSeason,
        }
      });
      console.log(`Created tester product ID: ${newTester.id}`);
    } else {
      console.log(`Tester ${testerSlug} already exists, skipping.`);
    }

    // Optional: We can nullify testerPrice on the original product, but let's just leave it for now
    // in case we need to rollback, or we can just ignore it in the frontend.
  }

  console.log('Migration complete!');
}

migrateTesters()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
