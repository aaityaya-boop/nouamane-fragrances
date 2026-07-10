const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.brand.updateMany({ where: { slug: 'valentino' }, data: { image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1600&h=900' } });
  await prisma.brand.updateMany({ where: { slug: 'yves-saint-laurent' }, data: { image: 'https://images.unsplash.com/photo-1587405273391-7661642c676d?auto=format&fit=crop&q=80&w=1600&h=900' } });
  await prisma.brand.updateMany({ where: { slug: 'armani' }, data: { image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1600&h=900' } });
  await prisma.brand.updateMany({ where: { slug: 'dolce-gabbana' }, data: { image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=1600&h=900' } });
  await prisma.brand.updateMany({ where: { slug: 'burberry' }, data: { image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=1600&h=900' } });
  await prisma.brand.updateMany({ where: { slug: 'prada' }, data: { image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1600&h=900' } });
  
  // also fix products that have pexels in their images
  const products = await prisma.product.findMany();
  for (const p of products) {
    if (p.images.includes('pexels.com')) {
      const newImages = p.images.replace(/https:\/\/images\.pexels\.com\/[^\"]+/g, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200&h=800');
      await prisma.product.update({ where: { id: p.id }, data: { images: newImages } });
    }
  }
  console.log('Images fixed in DB');
}
main().catch(console.error);
