const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inDir = 'C:\\Users\\AYOUB\\Documents\\Nouamane store\\product pic\\logos';
const outDir = 'public/images/brands';

const mapping = {
  '61034-logo-brand-fashion-chanel-perfume-download-free-image.png': 'chanel',
  'amouage-logo-png_seeklogo-255392.png': 'amouage',
  'Burberry_Logo.png': 'burberry',
  'Carolina-Herrera-Logo.png': 'carolina-herrera',
  'Creed_Fragrances_logo.svg.jpg': 'creed',
  'Dior_Logo.jpeg': 'dior',
  'elie saab.jpg': 'elie-saab',
  'giorgio-armani-logo-png_seeklogo-168420.png': 'armani',
  'Givenchy-Logo.jpg': 'givenchy',
  'gucci logo.png': 'gucci',
  'hermes-logo.png': 'hermes',
  'hugo boss.png': 'hugo-boss',
  'Jean-Paul-Gaultier-logo.png': 'jean-paul-gaultier',
  'kayali_2023.png': 'kayali',
  'kurkdjian logo.png': 'mfk',
  'Lancome-logo.jpg': 'lancome',
  'logo-guerlain_9ce88303527f34ce3cb6ab0b6323cc9b68b9219e_0.jpg': 'guerlain',
  'montale.png': 'montale',
  'NARCISO_RODRIGUEZ.jpg': 'narciso',
  'paco-rabanne-parfums-logo-png-transparent.png': 'paco-rabanne',
  'parfums de marly logo.jpg': 'parfums-de-marly',
  'Tiziana_Terenzi.jpg': 'tiziana-terenzi',
  'tom-ford-logo-png_seeklogo-383930.png': 'tom-ford',
  'Valentino.jpg': 'valentino',
  'versace5666.jpg': 'versace',
  'victoria\'s secret logo.png': 'victoria-secret',
  'Xerjoff_logo.jpg': 'xerjoff',
  'yves-saint-laurent-original-seeklogo.png': 'ysl'
};

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function processLogos() {
  for (const [file, slug] of Object.entries(mapping)) {
    const inputPath = path.join(inDir, file);
    const outputPath = path.join(outDir, `${slug}-logo.jpg`);
    
    try {
      if (fs.existsSync(inputPath)) {
        await sharp(inputPath)
          .trim() // removes transparent or solid borders
          .resize(300, 120, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .flatten({ background: '#ffffff' })
          .grayscale()
          .normalize() // maximizes contrast
          .jpeg({ quality: 95 })
          .toFile(outputPath);
        console.log(`Processed ${slug}`);
      } else {
        console.log(`File not found: ${file}`);
      }
    } catch (e) {
      console.error(`Failed ${slug}`, e.message);
    }
  }
}
processLogos();
