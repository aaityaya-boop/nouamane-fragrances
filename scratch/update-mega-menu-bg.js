const fs = require('fs');

const file = 'src/components/Header.tsx';
let content = fs.readFileSync(file, 'utf8');

// Mega menu background
content = content.replace(
  /bg-white shadow-2xl border-t border-\[#e0ddd4\]/g,
  'bg-white/95 backdrop-blur-xl shadow-2xl border-t border-[#e0ddd4]/60'
);

fs.writeFileSync(file, content);
console.log('Updated Mega menu background to glassmorphism');
