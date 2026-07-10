const fs = require('fs');
const local = fs.readFileSync('.env.local', 'utf8');
const env = fs.readFileSync('.env', 'utf8');
const matches = local.match(/POSTGRES_PRISMA_URL=(.+)/g);
let validUrl = '';
for (const m of matches) {
  if (m.includes('postgresql://')) {
    validUrl = m.split('=')[1];
  }
}
if (validUrl) {
  let newEnv = env + '\nPOSTGRES_PRISMA_URL="' + validUrl + '"\nPOSTGRES_URL_NON_POOLING="' + validUrl + '"\n';
  fs.writeFileSync('.env', newEnv);
  console.log('Fixed .env with DB credentials');
} else {
  console.log('Could not find a valid POSTGRES_PRISMA_URL');
}
