const fs = require('fs');

const headerJson = JSON.parse(fs.readFileSync('scratch/ysl-tool-call-4814.json', 'utf8'));
let headerContent = headerJson.args.CodeContent;

// 1. Remove "Livraison offerte" bar
headerContent = headerContent.replace(
  /{[/\\*] TOP BAR [*\\/]}\n\s*<div className="hidden lg:block bg-\[#1A1A1A\] text-white py-1\.5 px-6 text-center text-\[10px\] font-bold tracking-\[0\.2em\] uppercase\">\n\s*Livraison offerte partout au Maroc dès 1000 Dh d'achats\n\s*<\/div>/g,
  ''
);

// 2. Remove "Nouveau" badge
headerContent = headerContent.replace(
  /<span className="bg-\[#ecfdf5\] text-\[#10b981\] px-1\.5 py-0\.5 rounded text-\[9px\] font-bold uppercase tracking-wider">Nouveau<\/span>/g,
  ''
);

fs.writeFileSync('src/components/Header.tsx', headerContent);
console.log('Restored and fixed Header.tsx');
