const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findMany().then(ps => { 
  const found = ps.filter(p => isNaN(p.price) || p.price === null);
  console.log(JSON.stringify(found, null, 2));
  prisma.$disconnect(); 
});
