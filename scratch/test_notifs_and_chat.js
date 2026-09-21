const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing Notifications & Chat in database...');

  const users = await prisma.adminUser.findMany();
  const ayoub = users.find(u => u.name.toLowerCase().includes('ayoub')) || users[0];
  const nouamane = users.find(u => u.name.toLowerCase().includes('nouamane')) || users[1] || users[0];

  // 1. Create test notifications
  const notif1 = await prisma.adminNotification.create({
    data: {
      type: 'STOCK',
      title: 'Alerte Stock : Baccarat Rouge 540 (2 restants)',
      message: 'Le stock de testeurs Baccarat Rouge 540 est critique. Pensez à réapprovisionner.',
      link: '/admin/products',
      metadata: JSON.stringify({ stock: 2, brand: 'Maison Francis Kurkdjian' }),
    }
  });
  console.log('Created test stock notification:', notif1.id, notif1.title);

  const notif2 = await prisma.adminNotification.create({
    data: {
      type: 'ORDER',
      title: 'Nouvelle Commande #NAY-2026-98 (1,450 DH)',
      message: 'Commande de Sarah B. (Casablanca) payée en attente de livraison.',
      link: '/admin/orders',
      metadata: JSON.stringify({ orderNumber: 'NAY-2026-98', total: 1450 }),
    }
  });
  console.log('Created test order notification:', notif2.id, notif2.title);

  // 2. Create test WhatsApp-style message
  const chatMsg = await prisma.adminChatMessage.create({
    data: {
      senderId: ayoub ? ayoub.id : 'ayoub',
      senderName: ayoub ? ayoub.name : 'AYOUB AIT YAHYA',
      senderAvatar: ayoub ? ayoub.avatar : null,
      recipientId: nouamane ? nouamane.id : null,
      channel: 'DIRECT',
      content: 'Salam Nouamane ! J\'ai vérifié les commandes du jour et mis à jour le stock des coffrets.',
      isRead: false,
    }
  });
  console.log('Created test chat message:', chatMsg.id, chatMsg.content);

  const totalNotifs = await prisma.adminNotification.count();
  const totalMsgs = await prisma.adminChatMessage.count();
  console.log(`Total notifications in DB: ${totalNotifs}, Total chat messages in DB: ${totalMsgs}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
