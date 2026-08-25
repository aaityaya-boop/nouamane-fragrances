const fs = require('fs'); const file = 'src/app/admin/parfums-arabes/page.tsx'; let c = fs.readFileSync(file, 'utf8'); c = Buffer.from(c, 'binary').toString('utf8'); fs.writeFileSync(file, c);
