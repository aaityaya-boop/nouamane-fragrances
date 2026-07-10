const fs = require('fs');

const file = 'src/components/Header.tsx';
let content = fs.readFileSync(file, 'utf8');

// The regex will match the start of the div and all content up until the closing tag before `</>`
// Note: We can just use a regex that matches `\s*<div className="w-\[380px\] shrink-0.*?<\/div>\s*<\/Link>\s*<\/div>`

content = content.replace(
  /\s*<div className="w-\[380px\] shrink-0 border-l border-\[#e0ddd4\] pl-16">[\s\S]*?<\/Link>\s*<\/div>/g,
  ''
);

fs.writeFileSync(file, content);
console.log('Removed picture and title columns');
