const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/api/admin/settings/route.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'featuredSeasonal: body.featuredSeasonal !== undefined ? body.featuredSeasonal : undefined,',
  `featuredSeasonal: body.featuredSeasonal !== undefined ? body.featuredSeasonal : undefined,
        featuredLatest: body.featuredLatest !== undefined ? body.featuredLatest : undefined,`
);

fs.writeFileSync(file, content);
console.log('patched route.ts');
