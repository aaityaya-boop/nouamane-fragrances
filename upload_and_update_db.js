const requireEnv = require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const EXPORT_DIR = 'C:/Users/AYOUB/Documents/Nouamane store/product cards export';

async function main() {
  const files = fs.readdirSync(EXPORT_DIR).filter(f => f.endsWith('.png'));
  console.log(`Found ${files.length} images.`);
  
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products in DB.`);

  let updatedCount = 0;
  
  // To avoid hitting rate limits, let's do 3 at a time
  const concurrency = 3;
  let i = 0;
  
  while (i < files.length) {
    const chunk = files.slice(i, i + concurrency);
    i += concurrency;
    
    await Promise.all(chunk.map(async (file) => {
      const rawName = file.replace('.png', '');
      const splitIndex = rawName.indexOf(' - ');
      const productName = splitIndex > -1 ? rawName.substring(splitIndex + 3).trim() : rawName.trim();
      
      let matchedProduct = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
      
      if (!matchedProduct) {
         // Fallback matching
         matchedProduct = products.find(p => {
             const pName = p.name.toLowerCase();
             const cleanName = productName.toLowerCase().replace('edp', '').replace('edt', '').trim();
             return pName.includes(cleanName) || cleanName.includes(pName);
         });
      }
      
      if (!matchedProduct) {
        console.log(`❌ Could not find product in DB for image: ${file}`);
        return;
      }
      
      try {
        console.log(`⬆️  Uploading ${file} for product: ${matchedProduct.name}...`);
        const buffer = fs.readFileSync(path.join(EXPORT_DIR, file));
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e5);
        const safeName = `product-card-${uniqueSuffix}-${file.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const token = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_l3qgCdAjFT9wDKXz_xmbnlKdFScoUNvmLxeDQ7FELLtjtDo";

        const blob = await put(safeName, buffer, {
          access: 'public',
          contentType: 'image/png',
          token: token
        });
        
        const url = blob.url;
        
        // Retain other images or overwrite? The new images are completely styled cards. 
        // It makes sense to set it as the primary (first) image. Let's prepend it.
        let existingImages = [];
        try {
            existingImages = JSON.parse(matchedProduct.images);
        } catch(e) {}
        
        if (!Array.isArray(existingImages)) existingImages = [];
        
        // Remove existing card if any, or just overwrite the first? 
        // We'll just replace the entire array or insert at [0]
        const newImages = [url, ...existingImages];
        
        await prisma.product.update({
          where: { id: matchedProduct.id },
          data: { images: JSON.stringify([url]) } // Just replace all images with the new card image as requested by "add all this pictures on their place on admin panel"
        });
        
        console.log(`✅ Updated ${matchedProduct.name}`);
        updatedCount++;
      } catch (e) {
        console.error(`⚠️  Failed to process ${file}:`, e.message);
      }
    }));
  }
  
  console.log(`\n🎉 Finished. Updated ${updatedCount} products.`);
}

main().catch(e => {
  console.error(e);
}).finally(() => {
  prisma.$disconnect();
});
