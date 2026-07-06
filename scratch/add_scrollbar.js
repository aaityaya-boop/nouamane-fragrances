const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/app/globals.css');
let content = fs.readFileSync(cssPath, 'utf8');

const scrollbarCSS = `
/* =============================================
   CUSTOM LUXURY SCROLLBAR
   ============================================= */
.lux-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.lux-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.lux-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e0ddd4;
  border-radius: 10px;
}

.lux-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: #9A9A9A;
}
`;

if (!content.includes('.lux-scrollbar')) {
  fs.appendFileSync(cssPath, scrollbarCSS);
  console.log("Scrollbar styles added!");
} else {
  console.log("Scrollbar styles already exist.");
}
