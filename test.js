const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.product.count().then(c => console.log('DB count:', c)).finally(() => prisma.$disconnect());
