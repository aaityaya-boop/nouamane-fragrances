const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const defaultPassword = 'NayParfum2026!';
  const defaultHash = await bcrypt.hash(defaultPassword, 10);

  const owners = [
    {
      name: 'AYOUB AIT YAHYA',
      email: 'ayoub@nayparfum.ma',
      passwordHash: defaultHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      role: 'OWNER',
      status: 'ACTIVE',
    },
    {
      name: 'NOUAMANE AIT YAHYA',
      email: 'nouamane@nayparfum.ma',
      passwordHash: defaultHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      role: 'OWNER',
      status: 'ACTIVE',
    },
  ];

  for (const o of owners) {
    const user = await prisma.adminUser.upsert({
      where: { email: o.email },
      update: {
        name: o.name,
        role: o.role,
        status: o.status,
      },
      create: {
        name: o.name,
        email: o.email,
        passwordHash: o.passwordHash,
        avatar: o.avatar,
        role: o.role,
        status: o.status,
      },
    });
    console.log('Seeded Owner Account:', user.name, '(', user.email, ') ID:', user.id);
  }

  await prisma.adminActivityLog.create({
    data: {
      userName: 'Système NAY',
      action: 'INIT_MULTI_OWNER',
      entityType: 'USER',
      description: 'Initialisation du système multi-propriétaires pour Ayoub Ait Yahya et Nouamane Ait Yahya.',
    }
  });

  const count = await prisma.adminUser.count();
  console.log('Total admin users in DB now:', count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
