import React from 'react';
import prisma from '@/lib/prisma';
import BlogForm from './BlogForm';

export const dynamic = 'force-dynamic';

export default async function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialData = null;

  if (id !== 'new') {
    initialData = await prisma.blogPost.findUnique({
      where: { id }
    });
  }

  // Fetch ALL products from DB for the "Parfums mentionnés" selector
  const products = await prisma.product.findMany({
    select: { slug: true, name: true, brandId: true },
    orderBy: { name: 'asc' }
  });

  return <BlogForm initialData={initialData} dbProducts={products} />;
}
