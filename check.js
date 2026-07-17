const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const products = await prisma.product.findMany({ select: { slug: true, name: true } });
  console.log(products.slice(0, 10));
}

check().finally(() => prisma.$disconnect());
