import { PrismaClient } from '@prisma/client';
import { PRODUCTS } from './src/lib/products';

const prisma = new PrismaClient();

async function run() {
  let count = 0;
  for (const p of PRODUCTS) {
    await prisma.product.updateMany({
      where: { slug: p.slug },
      data: { images: JSON.stringify(p.images) }
    });
    count++;
  }
  console.log('Restored: ' + count);
}

run().finally(() => prisma.$disconnect());
