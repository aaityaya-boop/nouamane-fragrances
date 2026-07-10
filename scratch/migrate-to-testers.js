const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update all products in the database
  const products = await prisma.product.findMany();
  
  for (const product of products) {
    let newPrice = product.price;
    let newOriginalPrice = product.originalPrice;

    // If there is a testerPrice, it becomes the new main price.
    // The old main price (boutique price) becomes the new originalPrice (crossed out).
    if (product.testerPrice && product.testerPrice < product.price) {
      newPrice = product.testerPrice;
      newOriginalPrice = product.price;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        isTester: true,
        price: newPrice,
        originalPrice: newOriginalPrice,
        testerPrice: null, // Clear out tester price as it's no longer a variant
      }
    });
  }

  console.log(`Updated ${products.length} products to be testers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
