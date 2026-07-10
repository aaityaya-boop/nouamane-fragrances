const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const dirPath = 'C:\\Users\\AYOUB\\Documents\\Nouamane store\\fiches_produits';

function normalize(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
  const products = await prisma.product.findMany();

  console.log(`Found ${files.length} markdown files and ${products.length} products in DB.`);

  let matchedCount = 0;
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const fileNorm = normalize(file.replace('.md', ''));
    let matchedProduct = products.find(p => {
      const slugNorm = normalize(p.slug);
      return fileNorm === slugNorm || fileNorm.includes(slugNorm) || slugNorm.includes(fileNorm);
    });

    if (matchedProduct) {
      matchedCount++;
      // Parse Markdown
      const extractNotes = (label) => {
        const regex = new RegExp(`- \\*\\*${label}\\*\\*\\s*:\\s*(.*)`, 'i');
        const match = content.match(regex);
        if (match && match[1]) {
          return match[1].split(',').map(n => n.trim()).filter(Boolean);
        }
        return [];
      };

      const top = extractNotes('Notes de tête');
      const heart = extractNotes('Notes de cœur');
      const base = extractNotes('Notes de fond');

      // Extract perfect season
      const seasonRegex = /- \*\*Saison Idéale\*\*\s*:\s*(.*)/i;
      const seasonMatch = content.match(seasonRegex);
      const perfectSeason = seasonMatch ? seasonMatch[1].trim() : matchedProduct.perfectSeason;

      // Extract long description (everything after "---")
      const parts = content.split('---');
      const longDescription = parts.length > 1 ? parts.slice(1).join('---').trim() : content.trim();

      await prisma.product.update({
        where: { id: matchedProduct.id },
        data: {
          notes: JSON.stringify({ top, heart, base }),
          perfectSeason,
          longDescription,
        }
      });
      console.log(`Updated ${matchedProduct.slug}`);
    } else {
      console.log(`Could not find match for file: ${file}`);
    }
  }
  console.log(`Matched and updated ${matchedCount} / ${files.length} products.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
