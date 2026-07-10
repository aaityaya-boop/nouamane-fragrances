const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const ysl = await prisma.brand.findUnique({ where: { slug: 'yves-saint-laurent' } });
  const oldYsl = await prisma.brand.findUnique({ where: { slug: 'ysl' } });
  
  if (oldYsl && ysl) {
    try {
      await prisma.product.updateMany({
        where: { brandId: oldYsl.id },
        data: { brandId: ysl.id, brandLabel: ysl.label }
      });
      await prisma.brand.delete({ where: { id: oldYsl.id } });
      console.log('Migrated and deleted ysl');
    } catch (e) { console.error(e) }
  }

  const otherBrand = await prisma.brand.findUnique({ where: { slug: 'other' } });
  if (otherBrand) {
    try {
      await prisma.product.updateMany({
        where: { brandId: otherBrand.id },
        data: { brandId: ysl.id, brandLabel: ysl.label }
      });
      await prisma.brand.delete({ where: { id: otherBrand.id } });
      console.log('Migrated and deleted other');
    } catch (e) { console.error(e) }
  }
}
main();
