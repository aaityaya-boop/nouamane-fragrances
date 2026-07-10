const fs = require('fs');

const path = 'src/app/[locale]/HomePageClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const sBrand = content.lastIndexOf('{/* ===============================', content.indexOf('BRAND SHOWCASE (5 Marques Mythiques)'));
const eBrand = content.lastIndexOf('{/* ===============================', content.indexOf('FEATURED — BESTSELLERS'));

const sCat = content.lastIndexOf('{/* ===============================', content.indexOf('CATEGORY SHORTCUTS (Redesigned)'));
const eCat = content.lastIndexOf('{/* ===============================', content.indexOf('VALUE PROPOSITIONS'));

if (sBrand !== -1 && eBrand !== -1 && sCat !== -1 && eCat !== -1) {
  const brandBlock = content.substring(sBrand, eBrand);
  const catBlock = content.substring(sCat, eCat);

  const beforeBrand = content.substring(0, sBrand);
  const betweenBrandAndCat = content.substring(eBrand, sCat);
  const afterCat = content.substring(eCat);

  const newContent = beforeBrand + catBlock + betweenBrandAndCat + brandBlock + afterCat;
  
  fs.writeFileSync(path, newContent, 'utf8');
  console.log("Successfully reordered.");
} else {
  console.log("Could not find blocks.");
}
