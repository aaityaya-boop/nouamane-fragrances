require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logoMapping = {
  'valentino': 'valentino.jpg',
  'yves-saint-laurent': 'yves-saint-laurent-original-seeklogo.png',
  'armani': 'giorgio-armani-logo-png_seeklogo-168420.png',
  'dolce-gabbana': 'o.56.jpg', // Guessing based on remaining files
  'burberry': 'Burberry_Logo.png',
  'prada': 'images.png', // Guessing based on remaining files
  'amouage': 'amouage-logo-png_seeklogo-255392.png',
  'chanel': '61034-logo-brand-fashion-chanel-perfume-download-free-image.png',
  'creed': 'Creed_Fragrances_logo.svg.jpg',
  'dior': 'Dior_Logo.jpeg',
  'tom-ford': 'tom-ford-logo-png_seeklogo-383930.png',
  'gucci': 'gucci logo.png',
  'guerlain': 'logo-guerlain_9ce88303527f34ce3cb6ab0b6323cc9b68b9219e_0.jpg',
  'givenchy': 'Givenchy-Logo.jpg',
  'versace': 'versace5666.jpg',
  'paco-rabanne': 'paco-rabanne-parfums-logo-png-transparent.png',
  'jean-paul-gaultier': 'Jean-Paul-Gaultier-logo.png',
  'carolina-herrera': 'Carolina-Herrera-Logo.png',
  'narciso-rodriguez': 'NARCISO_RODRIGUEZ.jpg',
  'parfums-de-marly': 'parfums de marly logo.jpg',
  'xerjoff': 'Xerjoff_logo.jpg',
  'kayali': 'kayali_2023.png',
  'montale': 'montale.png',
  'tiziana-terenzi': 'Tiziana_Terenzi.jpg',
  'hermes': 'hermes-logo.png',
  'boss': 'hugo boss.png',
  'lancome': 'Lancome-logo.jpg',
  'elie-saab': 'elie saab.jpg',
  'victoria-secret': 'victoria\'s secret logo.png',
  'mfk': 'kurkdjian logo.png'
};

async function main() {
  for (const [slug, filename] of Object.entries(logoMapping)) {
    // Check if brand exists
    const brand = await prisma.brand.findUnique({ where: { slug } });
    if (brand) {
      // encode URI in case of spaces
      const encodedFilename = encodeURIComponent(filename);
      const imageUrl = `/logos/${encodedFilename}`;
      await prisma.brand.update({
        where: { slug },
        data: { image: imageUrl }
      });
      console.log(`Updated ${slug} with logo: ${imageUrl}`);
    } else {
      console.log(`Brand ${slug} not found in DB!`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
