require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const brands = await prisma.brand.findMany();
  const logos = fs.readdirSync(path.join(__dirname, '../public/logos'));

  console.log('--- Brands in DB ---');
  brands.forEach(b => console.log(b.slug, b.name));

  console.log('\n--- Logos available ---');
  logos.forEach(l => console.log(l));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
