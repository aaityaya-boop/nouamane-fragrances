const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const CATALOG_DIR = path.join(__dirname, 'public/images/catalog');

async function restore() {
  const products = await prisma.product.findMany();
  const files = fs.readdirSync(CATALOG_DIR);
  
  let restoredCount = 0;
  
  for (const product of products) {
    if (product.slug.endsWith('-tester')) {
      const rawSlug = product.slug.replace('-tester', '');
      
      // Look for a file that matches rawSlug + '_0.jpg' or rawSlug + '.jpg' or rawSlug + '.png'
      let match = files.find(f => f === rawSlug + '_0.jpg' || f === rawSlug + '.jpg');
      
      // Fuzzy fallback
      if (!match) {
         match = files.find(f => f.startsWith(rawSlug));
      }
      
      if (match) {
        const originalImageUrl = `/images/catalog/${match}`;
        await prisma.product.update({
          where: { id: product.id },
          data: { images: JSON.stringify([originalImageUrl]) }
        });
        restoredCount++;
      } else {
        console.log(`No local image found for slug: ${product.slug}`);
      }
    }
  }
  
  console.log(`Restored ${restoredCount} products from catalog folder.`);
}

restore().catch(console.error).finally(() => prisma.$disconnect());
