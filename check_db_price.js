const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findUnique({ where: { slug: 'pack-decouverte-luxe' }}).then(p => { 
  console.log('PRICE:', p.price); 
  console.log('SIZES:', p.sizes); 
  prisma.$disconnect(); 
});
