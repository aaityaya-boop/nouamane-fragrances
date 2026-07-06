const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const existing = await prisma.affiliate.findUnique({ where: { code: 'simo2024' } });
    if (!existing) {
      await prisma.affiliate.create({
        data: {
          name: 'Simo Life (Exemple)',
          code: 'simo2024',
          commissionRate: 15,
          visits: 142,
          sales: 5,
          revenueGenerated: 4500,
          commissionEarned: 675,
        }
      });
      console.log('Test affiliate created');
    } else {
      console.log('Already exists');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
