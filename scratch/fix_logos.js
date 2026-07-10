const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inDir = 'C:\\Users\\AYOUB\\Documents\\Nouamane store\\product pic\\logos';
const outDir = 'public/images/brands';

const mapping = {
  'hugo boss.png': 'boss',
  'NARCISO_RODRIGUEZ.jpg': 'narciso-rodriguez',
  'images.png': 'prada',
  'o.56.jpg': 'dolce-gabbana'
};

async function processLogos() {
  for (const [file, slug] of Object.entries(mapping)) {
    const inputPath = path.join(inDir, file);
    const outputPath = path.join(outDir, `${slug}-logo.jpg`);
    
    try {
      if (fs.existsSync(inputPath)) {
        await sharp(inputPath)
          .trim()
          .resize(300, 120, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .flatten({ background: '#ffffff' })
          .grayscale()
          .normalize()
          .jpeg({ quality: 95 })
          .toFile(outputPath);
        console.log(`Processed ${slug}`);
      } else {
        console.log(`File not found: ${inputPath}`);
      }
    } catch (e) {
      console.error(`Failed ${slug}`, e.message);
    }
  }
}
processLogos();
