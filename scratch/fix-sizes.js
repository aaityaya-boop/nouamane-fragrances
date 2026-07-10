const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSizes() {
  const products = await prisma.product.findMany();
  let fixed = 0;

  for (const p of products) {
    let sizesArr;
    try {
      sizesArr = JSON.parse(p.sizes);
    } catch (e) {
      continue;
    }

    if (Array.isArray(sizesArr) && sizesArr.length > 0) {
      // Check if the first element is a string instead of an object
      if (typeof sizesArr[0] === 'string') {
        // Map string to { label, price } object
        const newSizesArr = sizesArr.map(sizeStr => ({
          label: sizeStr,
          price: p.price
        }));

        await prisma.product.update({
          where: { id: p.id },
          data: { sizes: JSON.stringify(newSizesArr) }
        });
        fixed++;
      }
    }
  }
  console.log(`Fixed ${fixed} products with invalid sizes format.`);
}

fixSizes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
