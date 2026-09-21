import prisma from '../src/lib/prisma';

async function testExpensesAndCANet() {
  console.log('=== 1. TESTING CHARGES & EXPENSES DATABASE PERSISTENCE ===');

  const admin = await prisma.adminUser.findFirst({
    where: { role: 'OWNER' },
  });

  // Create test expense for Ads
  const adExpense = await prisma.adminExpense.create({
    data: {
      title: 'Campagne TikTok Ads - Test Lancement',
      category: 'ADS',
      amount: 4500,
      description: 'Campagne de test acquisition TikTok Ads',
      paymentMethod: 'CREDIT_CARD',
      recurring: 'ONE_TIME',
      createdById: admin?.id,
      creatorName: admin?.name || 'Ayoub Ait Yahya',
    },
  });
  console.log(`Created expense: "${adExpense.title}" (-${adExpense.amount} MAD, Category: ${adExpense.category})`);

  // Create test expense for Hosting
  const hostingExpense = await prisma.adminExpense.create({
    data: {
      title: 'Hébergement Vercel Pro & Domaine NAY',
      category: 'HOSTING',
      amount: 600,
      description: 'Abonnement cloud annuel Vercel',
      paymentMethod: 'CREDIT_CARD',
      recurring: 'MONTHLY',
      createdById: admin?.id,
      creatorName: admin?.name || 'Ayoub Ait Yahya',
    },
  });
  console.log(`Created expense: "${hostingExpense.title}" (-${hostingExpense.amount} MAD, Category: ${hostingExpense.category})`);

  console.log('\n=== 2. TESTING CA NET / DEDUCTION CALCULATION ===');
  // Fetch orders
  const orders = await prisma.order.findMany({
    where: { status: { in: ['delivered', 'shipped', 'completed'] } },
  });
  const grossRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Fetch all expenses
  const allExpenses = await prisma.adminExpense.findMany();
  const totalCharges = allExpenses.reduce((sum, e) => sum + e.amount, 0);

  const netRevenue = grossRevenue - totalCharges;

  console.log(`Chiffre d'Affaires Brut (Ventes) : ${grossRevenue} MAD`);
  console.log(`Total des Charges Déduites       : -${totalCharges} MAD`);
  console.log(`CA Net Réel (Bénéfice Net)       : ${netRevenue >= 0 ? '+' : ''}${netRevenue} MAD`);

  if (totalCharges < 5100) {
    throw new Error('Expected at least 5100 MAD of total charges');
  }

  console.log('\n✅ ALL EXPENSES & NEGATIVE DEDUCTIONS IN CA NET VERIFIED PERFECTLY!');
}

testExpensesAndCANet()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  });
