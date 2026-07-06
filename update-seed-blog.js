const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.blogPost.update({
      where: { slug: 'top-5-parfums-ete-maroc' },
      data: {
        metaTitle: 'Les 5 Meilleurs Parfums d\'Été au Maroc (2024)',
        metaDescription: 'Découvrez les fragrances idéales pour l\'été. Des notes fraîches et élégantes sélectionnées par des experts pour résister à la chaleur marocaine.',
        relatedProductSlugs: JSON.stringify(['bleu-de-chanel-parfum', 'creed-aventus', 'prada-lhomme']),
      }
    });
    console.log('Test post updated with SEO and Products');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
