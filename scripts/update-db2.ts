import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.product.count({ where: { subcategoryLabel: { contains: 'Copier' } } });
  console.log('Found:', count);
  
  const products = await prisma.product.findMany({ where: { subcategoryLabel: { contains: 'Copier' } } });
  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: { subcategoryLabel: p.subcategoryLabel.replace('Copier', 'Copy') }
    });
  }
  
  console.log('Updated');
}
main().finally(() => prisma.$disconnect());
