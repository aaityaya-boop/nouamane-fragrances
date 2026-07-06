const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.blogPost.upsert({
      where: { slug: 'top-5-parfums-ete-maroc' },
      update: {},
      create: {
        slug: 'top-5-parfums-ete-maroc',
        title: 'Top 5 des Parfums pour Homme cet Été au Maroc',
        excerpt: 'Découvrez notre sélection exclusive des fragrances les plus fraîches et élégantes pour affronter la chaleur estivale avec style.',
        content: `<h2>1. Acqua Di Giò Profondo</h2><p>Un classique revisité, parfait pour les soirées à la corniche. Ses notes marines profondes apportent une fraîcheur inégalée.</p><br/><h2>2. Bleu de Chanel Parfum</h2><p>L'élégance absolue. Un sillage qui ne laisse personne indifférent, idéal pour les rendez-vous professionnels ou les soirées chics.</p><br/><p><i>Visitez notre boutique pour découvrir ces chefs-d'œuvre olfactifs !</i></p>`,
        coverImage: 'https://images.pexels.com/photos/965993/pexels-photo-965993.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
        author: 'Équipe Nouamane',
        status: 'published'
      }
    });
    console.log('Article seeded successfully');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
