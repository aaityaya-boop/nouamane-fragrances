const fs = require('fs');

const file = 'src/components/Header.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the flat background with a premium glassmorphism effect
content = content.replace(
  /isSolid \? 'bg-white shadow-sm border-b border-\[#e0ddd4\]' : 'bg-transparent'/g,
  "isSolid ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-[#e0ddd4]/60' : 'bg-transparent'"
);

fs.writeFileSync(file, content);
console.log('Updated Header background to glassmorphism');
