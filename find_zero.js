const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findMany().then(ps => { 
  const zeroes = ps.filter(p => p.price === 0 || p.price === "0" || p.sizes.includes('"price":0') || p.sizes.includes('"price": 0'));
  console.log("Products with 0 price:");
  zeroes.forEach(z => {
    console.log(z.slug, z.price, z.sizes);
  });
  prisma.$disconnect(); 
});
