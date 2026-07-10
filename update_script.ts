import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  const products = await prisma.product.findMany();
  const dir = 'C:\\Users\\AYOUB\\Documents\\Nouamane store\\fiches_produits';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

  let updated = 0;
  let missing = 0;

  for (const file of files) {
    const filenameBase = file.replace('.md', '');
    const normFile = normalize(filenameBase);
    
    // Find matching product
    const match = products.find(p => {
      const normName = normalize(p.name);
      const normSlug = normalize(p.slug);
      return normFile.includes(normName) || normFile === normSlug || normSlug.includes(normFile) || normName.includes(normFile);
    });

    if (match) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      
      // Parse Notes
      const topMatch = content.match(/\*\*(?:Notes de )?tête\*\*\s*:\s*(.*)/i);
      const heartMatch = content.match(/\*\*(?:Notes de )?c[œo]ur\*\*\s*:\s*(.*)/i);
      const baseMatch = content.match(/\*\*(?:Notes de )?fond\*\*\s*:\s*(.*)/i);
      const seasonMatch = content.match(/\*\*(?:Saison Idéale|Saison)\*\*\s*:\s*(.*)/i);

      const top = topMatch ? topMatch[1].split(',').map(s => s.trim()) : [];
      const heart = heartMatch ? heartMatch[1].split(',').map(s => s.trim()) : [];
      const base = baseMatch ? baseMatch[1].split(',').map(s => s.trim()) : [];
      const perfectSeason = seasonMatch ? seasonMatch[1].trim() : match.perfectSeason;

      // Tagline & Long Description
      // Tagline is usually the line that looks like: # Product de Brand : Tagline
      const taglineMatch = content.match(/#\s+[^:]+:\s+(.*)/);
      const tagline = taglineMatch ? taglineMatch[1].trim() : match.tagline;

      // Long description is everything after the tagline header until "### Notes de Tête"
      const lines = content.split('\n');
      let longDesc = '';
      let isCapturingDesc = false;

      for (const line of lines) {
        if (line.match(/^#\s+[^:]+:/)) {
          isCapturingDesc = true;
          continue;
        }
        if (isCapturingDesc && line.match(/^###\s+Notes/)) {
          break;
        }
        if (isCapturingDesc && line.trim() !== '') {
          // remove bold tags
          longDesc += line.replace(/\*\*/g, '') + '\n\n';
        }
      }

      longDesc = longDesc.trim() || match.longDescription;

      const notesObj = { top, heart, base };

      await prisma.product.update({
        where: { id: match.id },
        data: {
          notes: JSON.stringify(notesObj),
          perfectSeason,
          tagline,
          longDescription: longDesc,
        }
      });

      updated++;
      console.log(`[UPDATED] ${file} -> ${match.slug}`);
    } else {
      missing++;
      console.log(`[NO MATCH] ${file}`);
    }
  }

  console.log(`\nUpdated: ${updated}, Unmatched Files: ${missing}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
