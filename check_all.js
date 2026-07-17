const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findMany({ select: { slug: true, price: true, sizes: true } }).then(ps => { 
  console.log(JSON.stringify(ps, null, 2)); 
  prisma.$disconnect(); 
});
