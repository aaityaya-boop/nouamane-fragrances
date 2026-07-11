const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const moroccanNames = [
  "Youssef", "Amine", "Mehdi", "Othmane", "Saad", "Ayoub", "Ilyas", "Anass", "Hamza", "Hicham",
  "Salma", "Kawtar", "Imane", "Hiba", "Meryem", "Fatima Zahra", "Zineb", "Soukaina", "Nada", "Asmaa"
];

const cities = ["Casablanca", "Rabat", "Tanger", "Marrakech", "Agadir", "Fès", "Meknès", "Oujda", "Tétouan", "Kénitra"];

const reviewTitles = [
  "Parfum original !",
  "Top du top",
  "Livraison très rapide",
  "Magnifique",
  "Excellente tenue",
  "Je recommande vivement",
  "Très satisfait",
  "Qualité incroyable",
  "Meilleur parfum",
  "Service parfait"
];

const maleComments = [
  "Parfum wa3er bzaf, riha ktab9a nhar kamel. Livraison rapide l Casa merci.",
  "Top ! 100% original, le packaging est nickel et l'odeur est magnifique. Tbarkellah 3likom.",
  "Service très professionnel. J'ai reçu ma commande à Rabat en 24h. Le parfum est authentique.",
  "Rien à dire, la qualité est là. Je recommande ce site à tous mes amis.",
  "Excellente tenue, c'est mon parfum préféré et je suis pas déçu de mon achat ici.",
  "Riha kat7me9, kanchkerkom 3la service. Livraison f wa9t mzyan.",
  "Vraiment satisfait de ma commande, le parfum est très puissant et original.",
  "Meilleur rapport qualité prix ! L'odeur tient très bien sur les vêtements."
];

const femaleComments = [
  "J'adore ce parfum ! Rihto katb9a flhwayj, vraiment top qualité. Livraison l Tanger rapide.",
  "Merci beaucoup pour le service. Le parfum est 100% original, je vais recommander à 100%.",
  "L'odeur est incroyable, très féminine et élégante. Parfait pour tous les jours.",
  "Ghazal bzaf had lparfum, w tahkom choukran 3la l'emballage mzyan.",
  "Très satisfaite de mon achat. Le sillage est magnifique et il tient toute la journée.",
  "Magnifique ! C'est la 2ème fois que je commande chez vous, toujours au top.",
  "Coup de coeur ! Je le cherchais depuis longtemps, merci pour la livraison rapide à Marrakech.",
  "La tenue est parfaite. Un vrai testeur authentique."
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateReview(isFemale) {
  const name = isFemale 
    ? getRandomItem(moroccanNames.slice(10)) 
    : getRandomItem(moroccanNames.slice(0, 10));
  
  const comment = isFemale 
    ? getRandomItem(femaleComments) 
    : getRandomItem(maleComments);

  const rating = Math.random() > 0.8 ? 4 : 5; // Mostly 5 stars, some 4 stars

  return {
    author: name,
    city: getRandomItem(cities),
    rating: rating,
    title: getRandomItem(reviewTitles),
    comment: comment,
    verified: true,
  };
}

async function run() {
  try {
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products. Generating reviews...`);

    let totalReviews = 0;

    for (const product of products) {
      // Check if product already has reviews
      const existingReviews = await prisma.review.findMany({
        where: { productSlug: product.slug }
      });

      if (existingReviews.length > 0) {
        console.log(`Skipping ${product.name}, already has reviews.`);
        continue;
      }

      // Generate 2 or 3 reviews
      const numReviews = Math.floor(Math.random() * 2) + 2; // 2 to 3
      let totalRating = 0;

      for (let i = 0; i < numReviews; i++) {
        const isFemale = product.gender === 'women' ? true : (product.gender === 'men' ? false : Math.random() > 0.5);
        const reviewData = generateReview(isFemale);
        
        await prisma.review.create({
          data: {
            productSlug: product.slug,
            ...reviewData
          }
        });
        
        totalRating += reviewData.rating;
        totalReviews++;
      }

      // Update product rating and review count
      const averageRating = totalRating / numReviews;
      await prisma.product.update({
        where: { id: product.id },
        data: {
          rating: parseFloat(averageRating.toFixed(1)),
          reviewCount: numReviews
        }
      });

      console.log(`Added ${numReviews} reviews to ${product.name}`);
    }

    console.log(`Successfully generated ${totalReviews} Moroccan reviews!`);
  } catch (error) {
    console.error("Error generating reviews:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
