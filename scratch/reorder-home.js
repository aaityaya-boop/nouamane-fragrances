const fs = require('fs');

const path = 'src/app/[locale]/HomePageClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const sBrand = '{/* ===============================\n          BRAND SHOWCASE (5 Marques Mythiques)\n          =============================== */}';
const eBrand = '{/* ===============================\n          FEATURED — BESTSELLERS\n          =============================== */}';

const sCat = '{/* ===============================\n          CATEGORY SHORTCUTS (Redesigned)\n          =============================== */}';
const eCat = '{/* ===============================\n          VALUE PROPOSITIONS\n          =============================== */}';

const idxSBrand = content.indexOf(sBrand);
const idxEBrand = content.indexOf(eBrand);

const idxSCat = content.indexOf(sCat);
const idxECat = content.indexOf(eCat);

if (idxSBrand !== -1 && idxEBrand !== -1 && idxSCat !== -1 && idxECat !== -1) {
  // Extract both blocks
  const brandBlock = content.substring(idxSBrand, idxEBrand);
  const catBlock = content.substring(idxSCat, idxECat);

  // We are currently in this state:
  // [before Brand] -> BRAND -> [between Brand and Cat] -> CAT -> [after Cat]
  
  // So:
  const beforeBrand = content.substring(0, idxSBrand);
  const betweenBrandAndCat = content.substring(idxEBrand, idxSCat);
  const afterCat = content.substring(idxECat);

  // New state:
  // [before Brand] -> CAT -> [between Brand and Cat] -> BRAND -> [after Cat]
  
  const newContent = beforeBrand + catBlock + betweenBrandAndCat + brandBlock + afterCat;
  
  fs.writeFileSync(path, newContent, 'utf8');
  console.log("Successfully reordered.");
} else {
  console.log("Could not find blocks.");
}
