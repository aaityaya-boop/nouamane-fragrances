const requireEnv = require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const RAW_DIR = 'C:/Users/AYOUB/Documents/Nouamane store/product pic/product design';

function cleanString(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  const files = fs.readdirSync(RAW_DIR).filter(f => !fs.statSync(path.join(RAW_DIR, f)).isDirectory());
  console.log(`Found ${files.length} raw images.`);
  
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products in DB.`);

  let updatedCount = 0;
  const token = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_l3qgCdAjFT9wDKXz_xmbnlKdFScoUNvmLxeDQ7FELLtjtDo";

  for (const product of products) {
    const pNameClean = cleanString(product.name.replace('Eau De Parfum', '').replace('Eau De Toilette', ''));
    const pSlugClean = cleanString(product.slug.replace('-tester', ''));
    
    // Find matching files
    const matches = files.filter(f => {
      const fNameClean = cleanString(f.replace('.jpg', '').replace('.png', '').replace('(p)', ''));
      return fNameClean.includes(pNameClean) || pNameClean.includes(fNameClean) ||
             fNameClean.includes(pSlugClean) || pSlugClean.includes(fNameClean);
    });

    if (matches.length > 0) {
      console.log(`\nProduct: ${product.name}`);
      console.log(`Matched Files:`, matches);
      
      const uploadedUrls = [];
      
      for (const match of matches) {
        try {
          const buffer = fs.readFileSync(path.join(RAW_DIR, match));
          const safeName = `raw-${Date.now()}-${match.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          
          console.log(`  ⬆️ Uploading ${match}...`);
          const blob = await put(safeName, buffer, {
            access: 'public',
            contentType: match.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
            token: token
          });
          uploadedUrls.push(blob.url);
        } catch (e) {
          console.error(`  ⚠️ Failed to upload ${match}:`, e.message);
        }
      }
      
      if (uploadedUrls.length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: JSON.stringify(uploadedUrls) }
        });
        updatedCount++;
        console.log(`  ✅ Updated DB with ${uploadedUrls.length} images.`);
      }
    }
  }
  
  console.log(`\n🎉 Finished. Updated ${updatedCount} products.`);
}

main().catch(e => {
  console.error(e);
}).finally(() => {
  prisma.$disconnect();
});
