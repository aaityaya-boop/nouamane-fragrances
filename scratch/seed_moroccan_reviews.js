const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const moroccanNames = [
  // Men
  "Youssef", "Amine", "Mehdi", "Othmane", "Saad", "Ayoub", "Ilyas", "Anass", "Hamza", "Hicham", "Tarik", "Walid", "Kamal", "Badr", "Nizar", "Reda", "Yassine", "Mouad", "Karim", "Omar", "Khalid", "Soufiane", "Achraf", "Zakaria", "Nabil", "Adil", "Younes", "Brahim", "Rachid", "Hassan", "Said", "Ali", "Bilal", "Jalal", "Marouane", "Aymane", "Rayane", "Ibrahim", "Taha", "Ismail",
  // Women
  "Salma", "Kawtar", "Imane", "Hiba", "Meryem", "Fatima Zahra", "Zineb", "Soukaina", "Nada", "Asmaa", "Khadija", "Najat", "Hanane", "Wissal", "Sanaa", "Ghita", "Houda", "Chaimae", "Oumaima", "Safae", "Marwa", "Youssra", "Hajar", "Kenza", "Rim", "Boutaina", "Loubna", "Ibtissam", "Lamia", "Noura", "Amina", "Nadia", "Khaoula", "Majdouline", "Siham", "Ahlam", "Amal", "Leila", "Mounia", "Nisrine"
];

// Weighted cities: Major cities appear 10 times, medium 4 times, small 1 time.
const cities = [
  ...Array(10).fill(["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"]).flat(),
  ...Array(4).fill(["Meknès", "Oujda", "Kénitra", "Tétouan", "Safi", "Mohammedia", "El Jadida", "Nador", "Beni Mellal", "Khouribga"]).flat(),
  ...["Taza", "Settat", "Larache", "Ksar El Kebir", "Khemisset", "Guelmim", "Berrechid", "Taourirt", "Berkane", "Sidi Slimane", "Sidi Kacem", "Khenifra", "Taroudant", "Essaouira", "Tiznit", "Ouarzazate", "Al Hoceima", "Chefchaouen", "Ifrane", "Azrou"]
];

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
  "Service parfait",
  "Wa3er bzaf",
  "Rien à dire",
  "Service client au top",
  "Produit et service 5 étoiles",
  "عطر واعر",
  "جودة ممتازة",
  "توصيل سريع",
  "طوب"
];

const maleComments = [
  "Parfum wa3er bzaf, riha ktab9a nhar kamel. Livraison rapide merci.",
  "Top ! 100% original, le packaging est nickel et l'odeur est magnifique. Tbarkellah 3likom.",
  "Service très professionnel. J'ai reçu ma commande en 24h. Le parfum est authentique.",
  "Rien à dire, la qualité est là. Je recommande ce site à tous mes amis.",
  "Excellente tenue, c'est mon parfum préféré et je suis pas déçu de mon achat ici.",
  "Riha kat7me9, kanchkerkom 3la service. Livraison f wa9t mzyan.",
  "Vraiment satisfait de ma commande, le parfum est très puissant et original.",
  "Meilleur rapport qualité prix ! L'odeur tient très bien sur les vêtements.",
  "Service client naadi! J'ai eu un problème avec mon adresse w t3amlo m3aya bzaaf, tbarkellah 3likom.",
  "Livreur dreyef w ja f lwaqt. L'emballage était parfait et le parfum wa3er. Merci!",
  "Khoya lah y3tikom seha, lparfum 100% original w rihto kador fl bit kamel.",
  "Je tiens à remercier le service client pour leur réactivité sur Whatsapp. Commande reçue en 48h.",
  "J'avais des doutes au début mais vraiment c'est top. Le service après vente est très réactif.",
  "Wa3er wa3er bzaf! Katdir racha wehda katbqa nhar kamel. Kanchkorkom 3la l'honnêteté dyalkom.",
  "Service client chaleureux et très poli. La livraison a pris juste un jour.",
  "عطر واعر بزاف، ريحتو كتبقى نهار كامل. التوصيل كان سريع شكرا.",
  "طوب! 100% أصلي، التغليف ناضي وريحتو كتحمق. تبارك الله عليكم.",
  "خدمة نقية، توصلت بالكوموند ديالي ف 24 ساعة. العطر أصلي.",
  "جودة واعرة، أحسن عطر خديت من عندكم.",
  "ريحتو كتحمق، كنشكركم على الخدمة. التوصيل ف الوقت.",
  "تغليف زوين بزاف والعطر أصلي، تبارك الله على الخدمة ديالكم.",
  "كنت خايف نشري من الانترنيت ولكن الصراحة صدق داكشي واعر. شكرا.",
  "الريحة كتبقى في الحوايج حتى لغد ليه، أنصح به بشدة.",
  "خدمة العملاء في الواتساب جاوبوني بالزربة، شكرا على التعامل الزوين."
];

const femaleComments = [
  "J'adore ce parfum ! Rihto katb9a flhwayj, vraiment top qualité. Livraison rapide.",
  "Merci beaucoup pour le service. Le parfum est 100% original, je vais recommander à 100%.",
  "L'odeur est incroyable, très féminine et élégante. Parfait pour tous les jours.",
  "Ghazal bzaf had lparfum, w tahkom choukran 3la l'emballage mzyan.",
  "Très satisfaite de mon achat. Le sillage est magnifique et il tient toute la journée.",
  "Magnifique ! C'est la 2ème fois que je commande chez vous, toujours au top.",
  "Coup de coeur ! Je le cherchais depuis longtemps, merci pour la livraison rapide.",
  "La tenue est parfaite. Un vrai testeur authentique.",
  "L'équipe est super sympa! J'ai posé plein de questions sur Whatsapp et ils ont été adorables.",
  "Tbarkellah 3likom, service ghzal w livraison mzyana. Le livreur kan zrban mais mabihch hhh.",
  "Parfum original 100%, l'odeur wa3ra. Et un grand merci au service client pour le suivi.",
  "Raw3a! L'odeur d lparfum kathamq, et le service est vraiment de qualité. Bravo l'équipe.",
  "Merci pour le petit cadeau avec la commande! Vous êtes les meilleurs, dima nakhd mn 3andkom.",
  "Je recommande les yeux fermés. Le support client a répondu à ma question en 2 minutes.",
  "Livraison rapide w emballage tayhamaq. Y3tikom saha.",
  "حمقني هاد العطر ! ريحتو كتبقى فالحوايج، جودة واعرة. التوصيل سريع.",
  "شكرا بزاف على الخدمة. العطر أصلي 100%، غنصح بيه صحاباتي.",
  "الريحة غزالة بزاف وأنثوية. كيحمق.",
  "غزال بزاف هاد البارڤان، وشكرا على لوبالاج الزوين.",
  "عجبني بزاف، ريحتو كتبقى نهار كامل ومجهدة.",
  "تبارك الله عليكم، خدمة غزالة وتوصيل مزيان. السيد لي وصل ليا دريف.",
  "التعامل ديالكم زوين بزاف، جاوبوني في الواتساب دغيا. شكرا.",
  "أحسن ريحة خديت من عندكم، الريحة كتبقى ثابتة وكتفاجئني.",
  "توصيل سريع والتغليف كان زوين بزاف كيحسسك أنك شريتي شي حاجة فخمة."
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateReview(isFemale) {
  const numNames = moroccanNames.length;
  // first half are men, second half are women
  const name = isFemale 
    ? getRandomItem(moroccanNames.slice(Math.floor(numNames/2))) 
    : getRandomItem(moroccanNames.slice(0, Math.floor(numNames/2)));
  
  const comment = isFemale 
    ? getRandomItem(femaleComments) 
    : getRandomItem(maleComments);

  const rating = Math.random() > 0.8 ? 4 : 5; // Mostly 5 stars, some 4 stars

  // Random date within the last 6 months
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  const randomDate = getRandomDate(startDate, endDate);

  return {
    author: name,
    city: getRandomItem(cities),
    rating: rating,
    title: getRandomItem(reviewTitles),
    comment: comment,
    verified: true,
    createdAt: randomDate
  };
}

async function run() {
  try {
    // Delete all existing reviews to start fresh
    console.log('Deleting existing reviews to apply new Arabic / Darija reviews...');
    await prisma.review.deleteMany();

    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products. Generating random reviews (0 to 25 per product)...`);

    let totalReviews = 0;

    for (const product of products) {
      // Random number of reviews from 0 to 25
      const numReviews = Math.floor(Math.random() * 26);
      let totalRating = 0;

      if (numReviews === 0) {
        console.log(`Skipping ${product.name} (0 reviews generated)`);
        await prisma.product.update({
          where: { id: product.id },
          data: { rating: 0, reviewCount: 0 }
        });
        continue;
      }

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

    console.log(`Successfully generated ${totalReviews} Moroccan reviews with Arabic script and Darija!`);
  } catch (error) {
    console.error("Error generating reviews:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
