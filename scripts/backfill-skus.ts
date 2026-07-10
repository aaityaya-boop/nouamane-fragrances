import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting SKU backfill for old orders...');
  
  const orders = await prisma.order.findMany();
  let updatedCount = 0;
  
  for (const order of orders) {
    let items;
    try {
      items = JSON.parse(order.items);
    } catch (e) {
      console.log(`Order ${order.orderNumber} has invalid items JSON, skipping.`);
      continue;
    }
    
    let modified = false;
    
    const itemsWithSKU = await Promise.all(
      items.map(async (item: any) => {
        if (!item.id || item.sku) return item; // Already has SKU or lacks product ID
        
        try {
          // Find product by slug since id might have changed
          const product = await prisma.product.findUnique({
            where: { slug: item.slug },
            select: { sku: true },
          });
          
          if (product && product.sku) {
            modified = true;
            return {
              ...item,
              sku: product.sku,
            };
          } else {
            // Fallback for deleted products
            modified = true;
            return {
              ...item,
              sku: `REF-OLD-${item.id}`,
            };
          }
        } catch (err) {
          console.error(`Error finding product for item ${item.id} in order ${order.orderNumber}`);
        }
        
        return item;
      })
    );
    
    if (modified) {
      await prisma.order.update({
        where: { id: order.id },
        data: { items: JSON.stringify(itemsWithSKU) },
      });
      console.log(`Updated order ${order.orderNumber} with SKUs.`);
      updatedCount++;
    }
  }
  
  console.log(`Finished! Updated ${updatedCount} orders.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
