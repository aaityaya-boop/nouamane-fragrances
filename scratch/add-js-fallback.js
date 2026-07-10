const fs = require('fs');
const file = 'src/app/[locale]/HomePageClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all instances of 'opacity-0' in motion.div with 'js-fallback-opacity'
content = content.replace(/className=\"opacity-0/g, 'className="js-fallback-opacity opacity-0');
content = content.replace(/className=\"relative opacity-0/g, 'className="relative js-fallback-opacity opacity-0');

fs.writeFileSync(file, content);
console.log('Added js-fallback-opacity');
