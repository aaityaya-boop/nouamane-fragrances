const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseText(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split('\n').map(l => l.trim());
  
  const items = [];
  let currentItem = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    // Skip random text from chatgpt
    if (line.startsWith('Voici la Partie') || line.startsWith('La structure reste') || line.startsWith('---') || line.startsWith('Et voici la Partie')) {
      continue;
    }

    if (line.startsWith('Marque :')) {
      if (currentItem) currentItem.brand = line.replace('Marque :', '').trim();
    } else if (line.startsWith('Famille :')) {
      if (currentItem) currentItem.family = line.replace('Famille :', '').trim();
    } else if (line.startsWith('Cible :')) {
      if (currentItem) currentItem.target = line.replace('Cible :', '').trim();
    } else if (line.startsWith("L'Accroche :")) {
      if (currentItem) currentItem.tagline = line.replace("L'Accroche :", '').trim();
    } else if (line.startsWith("L'Essence :")) {
      if (currentItem) {
        currentItem.essence = line.replace("L'Essence :", '').trim();
        items.push(currentItem);
        currentItem = null; // Ready for next
      }
    } else {
      // If none of the above, it's either a continuation or a new product name
      if (!currentItem) {
        // Remove chatgpt commentary if it somehow slipped in
        let name = line;
        if (name.includes(')')) name = name.split(')').pop().trim();
        currentItem = { name };
      } else if (currentItem && !currentItem.brand) {
         currentItem.name += ' ' + line;
      }
    }
  }
  return items;
}

function normalize(str) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9 ]/g, ' ') // remove punctuation but keep spaces for token matching
    .trim();
}

function tokenize(str) {
  return normalize(str).split(/\s+/).filter(w => w.length > 2 && w !== 'edp' && w !== 'edt' && w !== 'eau' && w !== 'parfum' && w !== 'de' && w !== 'tester');
}

function calculateScore(tokens1, tokens2) {
  // Count how many tokens in tokens1 exist in tokens2
  let matches = 0;
  for (const t1 of tokens1) {
    if (tokens2.includes(t1)) matches++;
  }
  return matches / Math.max(tokens1.length, 1);
}

function mapGender(cible) {
  const c = cible.toLowerCase();
  if (c.includes('femme') || c.includes('féminin')) return 'women';
  if (c.includes('homme') || c.includes('masculin')) return 'men';
  return 'unisex'; // Unisexe, or fallback
}

function mapSubcategory(famille) {
  const f = famille.toLowerCase();
  if (f.includes('floral') || f.includes('fleur')) return 'floral';
  if (f.includes('oriental') || f.includes('ambré') || f.includes('ambre')) return 'oriental';
  if (f.includes('boisé')) return 'woody';
  if (f.includes('aromatique') || f.includes('fougère')) return 'aromatic';
  if (f.includes('aquatique') || f.includes('frais') || f.includes('fruité')) return 'fresh';
  return 'floral'; // fallback
}

async function main() {
  const parsedData = parseText('C:\\Users\\AYOUB\\Documents\\Nouamane store\\product descriptions.txt');
  console.log(`Parsed ${parsedData.length} products from text file.`);

  const dbProducts = await prisma.product.findMany();
  console.log(`Found ${dbProducts.length} products in DB.`);

  let matchedCount = 0;
  
  for (const item of parsedData) {
    const itemTokens = tokenize(item.name);
    if (itemTokens.length === 0) continue; // too short

    let bestMatch = null;
    let maxScore = 0;

    for (const p of dbProducts) {
      const pTokens = tokenize(p.name);
      
      const brandNormFile = normalize(item.brand).replace(/\s/g, '');
      const brandNormDB = normalize(p.brandLabel).replace(/\s/g, '');
      const isBrandMatch = brandNormDB.includes(brandNormFile) || brandNormFile.includes(brandNormDB);
      
      // If brands don't match, heavily penalize
      if (!isBrandMatch && brandNormFile !== 'armani' && brandNormDB !== 'giorgioarmani') {
         continue; // skip if brands don't match at all
      }

      const score = calculateScore(itemTokens, pTokens);
      // For short names like "Y", exact token match is required
      if (item.name === 'Y' && !pTokens.includes('y')) continue;
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = p;
      }
    }

    // Require at least 50% of the words to match, or 100% if it's a short name
    if (bestMatch && maxScore >= 0.5) {
      matchedCount++;
      console.log(`[MATCH] "${item.name}" -> DB: "${bestMatch.name}" (Score: ${maxScore.toFixed(2)})`);
      
      await prisma.product.update({
        where: { id: bestMatch.id },
        data: {
          tagline: item.tagline,
          description: item.essence,
          longDescription: item.essence,
          gender: mapGender(item.target),
          subcategoryLabel: item.family,
          subcategory: mapSubcategory(item.family)
        }
      });
    } else {
      console.log(`[NOT FOUND] "${item.name}" (Brand: ${item.brand}) - Max Score: ${maxScore.toFixed(2)}`);
    }
  }

  console.log(`\nMigration complete. Matched and updated ${matchedCount} out of ${parsedData.length} products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
