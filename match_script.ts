import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ select: { slug: true, name: true } });
  const dir = 'C:\\Users\\AYOUB\\Documents\\Nouamane store\\fiches_produits';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

  let matches = 0;
  let missing = 0;

  for (const file of files) {
    const filenameWithoutExt = file.replace('.md', '');
    // e.g. amouage_epic_man -> amouage-epic-man
    const potentialSlug1 = filenameWithoutExt.replace(/_/g, '-');
    const potentialSlug2 = filenameWithoutExt.split('_').slice(1).join('-'); // e.g. epic-man

    const match = products.find(p => p.slug === potentialSlug1 || p.slug === potentialSlug2 || p.slug.includes(potentialSlug2) || potentialSlug1.includes(p.slug));

    if (match) {
      matches++;
      console.log(`[MATCH] ${file} -> ${match.slug}`);
    } else {
      missing++;
      console.log(`[MISSING] ${file}`);
    }
  }

  console.log(`\nMatched: ${matches}, Missing: ${missing}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
