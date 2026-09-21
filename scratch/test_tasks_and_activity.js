const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing Tasks and Activity Log DB models...');

  // 1. Check users
  const users = await prisma.adminUser.findMany();
  console.log(`Found ${users.length} admin users:`, users.map(u => ({ name: u.name, email: u.email })));

  const ayoub = users.find(u => u.name.toLowerCase().includes('ayoub')) || users[0];
  const nouamane = users.find(u => u.name.toLowerCase().includes('nouamane')) || users[1] || users[0];

  // 2. Create sample task
  const sampleTask = await prisma.adminTask.create({
    data: {
      title: 'Vérifier l\'approvisionnement des flacons Bestsellers',
      description: 'Faire le point sur le stock de flacons 50ml et 100ml pour la nouvelle collection.',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdById: ayoub ? ayoub.id : null,
      creatorName: ayoub ? ayoub.name : 'AYOUB AIT YAHYA',
      assignedToId: nouamane ? nouamane.id : null,
      assigneeName: nouamane ? nouamane.name : 'NOUAMANE AIT YAHYA',
      tags: 'Stock, Fournisseurs, Urgent',
    }
  });
  console.log('Created test task successfully:', sampleTask.id, sampleTask.title);

  // 3. Add a comment
  const comment = await prisma.adminTaskComment.create({
    data: {
      taskId: sampleTask.id,
      userId: nouamane ? nouamane.id : null,
      userName: nouamane ? nouamane.name : 'NOUAMANE AIT YAHYA',
      content: 'Bien reçu ! Je contacte le fournisseur demain matin.',
    }
  });
  console.log('Created test comment successfully:', comment.id, comment.content);

  // 4. Log activity
  const activity = await prisma.adminActivityLog.create({
    data: {
      userId: ayoub ? ayoub.id : null,
      userName: ayoub ? ayoub.name : 'AYOUB AIT YAHYA',
      userEmail: ayoub ? ayoub.email : 'ayoub@nayparfum.ma',
      action: 'CREATE_TASK',
      entityType: 'TASK',
      entityId: sampleTask.id,
      description: `A créé la mission : "${sampleTask.title}" (Assignée à ${sampleTask.assigneeName})`,
    }
  });
  console.log('Created test activity log successfully:', activity.id, activity.description);

  // 5. Query tasks with comments and relations
  const tasksWithDetails = await prisma.adminTask.findMany({
    include: {
      creator: true,
      assignee: true,
      comments: true,
    }
  });
  console.log(`Total tasks in DB: ${tasksWithDetails.length}`);

  // 6. Query recent activity logs
  const recentActivities = await prisma.adminActivityLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
  console.log(`Total recent activity logs: ${recentActivities.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
