const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.adminUser.findMany();
  console.log('DB Users:', users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status
  })));

  const siteConfig = await prisma.siteConfig.findFirst();
  console.log('Site Config adminPassword:', siteConfig?.adminPassword);

  for (const u of users) {
    const isNay2026 = await bcrypt.compare('NayParfum2026!', u.passwordHash);
    const isNouamane2024 = await bcrypt.compare('nouamane2024', u.passwordHash);
    console.log(`User ${u.email}: matches 'NayParfum2026!'? ${isNay2026} | matches 'nouamane2024'? ${isNouamane2024}`);
  }
}

main().finally(() => prisma.$disconnect());
