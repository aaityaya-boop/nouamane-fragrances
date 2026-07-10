const fs = require('fs');
const file = 'src/components/Header.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all href="/..." with href={`/${locale}/...`}
content = content.replace(/href="\/([^"]*)"/g, (match, p1) => {
  // Ignore specific paths that shouldn't be localized if there are any
  if (p1.startsWith('api') || p1.startsWith('_next') || p1.startsWith('images')) {
    return match;
  }
  return 'href={`/${locale}/' + p1 + '`}';
});

fs.writeFileSync(file, content);
console.log('Fixed Header.tsx!');
