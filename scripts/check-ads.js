const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const integrations = await prisma.adAccountIntegration.findMany();
  console.log('--- INTEGRATIONS IN DB ---');
  console.log(JSON.stringify(integrations, null, 2));

  const campaigns = await prisma.adCampaign.findMany();
  console.log('--- CAMPAIGNS IN DB ---');
  console.log(JSON.stringify(campaigns, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
