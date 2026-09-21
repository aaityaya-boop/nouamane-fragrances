const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning all synthetic / test notifications...');

  const deleted = await prisma.adminNotification.deleteMany({});
  console.log(`Deleted ${deleted.count} notifications from database.`);

  const remaining = await prisma.adminNotification.count();
  console.log(`Remaining notifications: ${remaining}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
