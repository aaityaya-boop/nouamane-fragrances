const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/[locale]/product/[slug]/ProductClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import RecentlyViewed')) {
  content = content.replace(
    'import Footer from \'@/components/Footer\';',
    'import Footer from \'@/components/Footer\';\nimport RecentlyViewed from \'@/components/RecentlyViewed\';'
  );
}

if (!content.includes('<RecentlyViewed')) {
  content = content.replace(
    '      <Footer />',
    '      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 pb-16">\n        <RecentlyViewed currentProductId={product.id} />\n      </div>\n      <Footer />'
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('RecentlyViewed added to ProductClient!');
