import prisma from '../src/lib/prisma';

async function testSalary() {
  console.log('=== TESTING SALARY SUPPORT IN DATABASE ===');
  
  // Find an admin user
  const admin = await prisma.adminUser.findFirst({
    where: { role: 'OWNER' }
  });

  if (!admin) {
    console.log('No admin found, creating a test user');
    return;
  }

  console.log(`Testing with user: ${admin.name} (${admin.email})`);

  // Update salary
  const updated = await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      salary: 15000,
      salaryType: 'MONTHLY',
    },
    select: {
      id: true,
      name: true,
      salary: true,
      salaryType: true,
    }
  });

  console.log(`Updated salary: ${updated.salary} MAD (${updated.salaryType})`);
  if (updated.salary !== 15000) {
    throw new Error('Salary update failed in DB!');
  }

  console.log('✅ SALARY DATABASE SUPPORT VERIFIED SUCCESSFULLY!');
}

testSalary()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Error testing salary:', e);
    process.exit(1);
  });
