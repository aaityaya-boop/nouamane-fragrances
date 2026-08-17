const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = 'difference-testeur-original';
  
  const post = await prisma.blogPost.update({
    where: { slug },
    data: {
      title: 'الفرق بين Testeur Original والعطر الأصلي:  دليلك الشامل قبل الشراء'
    }
  });

  console.log('Blog post title updated successfully to:', post.title);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
