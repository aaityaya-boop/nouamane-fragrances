const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BRANDS = [
  { id: 'amouage', name: 'Amouage', description: "Haute parfumerie originaire du sultanat d'Oman." },
  { id: 'armani', name: 'Giorgio Armani', description: "L'élégance italienne intemporelle." },
  { id: 'chanel', name: 'Chanel', description: "L'essence du luxe parisien." },
  { id: 'creed', name: 'Creed', description: "Maison de parfum historique depuis 1760." },
  { id: 'dior', name: 'Dior', description: "Le raffinement et l'audace." },
  { id: 'tom-ford', name: 'Tom Ford', description: "Parfums audacieux et luxueux." },
  { id: 'ysl', name: 'Yves Saint Laurent', description: "L'esprit rebelle et chic." },
  { id: 'gucci', name: 'Gucci', description: "Maison italienne de renommée mondiale." },
  { id: 'guerlain', name: 'Guerlain', description: "Une des plus anciennes maisons de parfum." },
  { id: 'givenchy', name: 'Givenchy', description: "L'élégance aristocratique française." },
  { id: 'dolce-gabbana', name: 'Dolce & Gabbana', description: "La sensualité méditerranéenne." },
  { id: 'versace', name: 'Versace', description: "Le glamour italien à l'état pur." },
  { id: 'paco-rabanne', name: 'Paco Rabanne', description: "Parfums provocateurs et innovants." },
  { id: 'jean-paul-gaultier', name: 'Jean Paul Gaultier', description: "L'enfant terrible de la mode." },
  { id: 'carolina-herrera', name: 'Carolina Herrera', description: "L'élégance new-yorkaise." },
  { id: 'valentino', name: 'Valentino', description: "La beauté romaine contemporaine." },
  { id: 'prada', name: 'Prada', description: "L'avant-garde du luxe italien." },
  { id: 'narciso-rodriguez', name: 'Narciso Rodriguez', description: "L'art du musc sublimé." },
  { id: 'parfums-de-marly', name: 'Parfums de Marly', description: "La splendeur du XVIIIe siècle." },
  { id: 'xerjoff', name: 'Xerjoff', description: "Luxe absolu et artisanat d'exception." },
  { id: 'kayali', name: 'Kayali', description: "Parfums modernes du Moyen-Orient." },
  { id: 'montale', name: 'Montale', description: "La magie de l'Orient et de l'Aoud." },
  { id: 'tiziana-terenzi', name: 'Tiziana Terenzi', description: "Parfumerie artistique italienne." },
  { id: 'hermes', name: 'Hermès', description: "L'artisanat du luxe français." },
  { id: 'boss', name: 'Hugo Boss', description: "L'assurance et le succès." },
  { id: 'burberry', name: 'Burberry', description: "L'héritage britannique." },
  { id: 'lancome', name: 'Lancôme', description: "La beauté française classique." },
  { id: 'elie-saab', name: 'Elie Saab', description: "La haute couture olfactive." },
  { id: 'victoria-secret', name: "Victoria's Secret", description: "Glamour et séduction." },
  { id: 'mfk', name: 'Maison Francis Kurkdjian', description: "Haute parfumerie contemporaine." },
  { id: 'other', name: 'Maison de Parfum', description: "Parfumerie de prestige." }
];

async function seedBrands() {
  let count = 0;
  for (const brand of BRANDS) {
    try {
      await prisma.brand.upsert({
        where: { id: brand.id },
        update: {
          name: brand.name,
          label: brand.name,
          slug: brand.id,
          description: brand.description
        },
        create: {
          id: brand.id,
          name: brand.name,
          label: brand.name,
          slug: brand.id,
          description: brand.description,
          image: `/images/brands/${brand.id}.svg`
        }
      });
      count++;
    } catch (e) {
      console.error(`Error with brand ${brand.id}:`, e);
    }
  }
  console.log(`Successfully added/updated ${count} brands!`);
}

seedBrands()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
