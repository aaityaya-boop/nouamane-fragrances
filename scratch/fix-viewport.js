const fs = require('fs');
const file = 'src/app/[locale]/HomePageClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/viewport=\{\{ once: true, margin: \"-100px\" \}\}/g, 'viewport={{ once: true, amount: 0 }}');

fs.writeFileSync(file, content);
console.log('Fixed viewport');
