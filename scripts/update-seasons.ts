import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Updating ${products.length} products...`);

  for (const product of products) {
    let season = 'Toutes Saisons';
    const sub = product.subcategory.toLowerCase();
    const name = product.name.toLowerCase();
    const notesStr = product.notes.toLowerCase();

    // Heuristics for Seasons
    if (
      sub === 'fresh' || 
      name.includes('light') || 
      name.includes('acqua') || 
      name.includes('eau fraiche') || 
      notesStr.includes('citrus') || 
      notesStr.includes('lemon') || 
      notesStr.includes('marine') ||
      notesStr.includes('bergamot')
    ) {
      season = 'Été';
    } else if (
      sub === 'floral' || 
      name.includes('bloom') || 
      name.includes('flora') || 
      notesStr.includes('rose') || 
      notesStr.includes('peony')
    ) {
      season = 'Printemps';
    } else if (
      sub === 'oriental' || 
      name.includes('oud') || 
      name.includes('noir') || 
      name.includes('intense') || 
      notesStr.includes('vanilla') || 
      notesStr.includes('amber') || 
      notesStr.includes('spicy') ||
      notesStr.includes('leather')
    ) {
      season = 'Hiver';
    } else if (
      sub === 'woody' || 
      notesStr.includes('cedar') || 
      notesStr.includes('sandalwood') || 
      notesStr.includes('vetiver') ||
      notesStr.includes('patchouli')
    ) {
      season = 'Automne';
    }

    // Special cases
    if (name.includes('libre')) season = 'Toutes Saisons';
    if (name.includes('sauvage')) season = 'Toutes Saisons';
    if (name.includes('bleu de')) season = 'Toutes Saisons';
    if (name.includes('baccarat')) season = 'Hiver';
    if (name.includes('aventus')) season = 'Printemps';
    if (name.includes('black opium')) season = 'Hiver';
    if (name.includes('alien')) season = 'Hiver';
    if (name.includes('scandal')) season = 'Hiver';
    if (name.includes('light blue')) season = 'Été';
    if (name.includes('acqua di gio')) season = 'Été';

    await prisma.product.update({
      where: { id: product.id },
      data: { perfectSeason: season }
    });
  }

  console.log('Finished updating seasons.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
