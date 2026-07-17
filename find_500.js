const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findMany().then(ps => { 
  const found = ps.filter(p => p.price === 500 || p.sizes.includes('500'));
  console.log(JSON.stringify(found, null, 2));
  prisma.$disconnect(); 
});
