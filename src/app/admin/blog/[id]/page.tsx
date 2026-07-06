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

  return <BlogForm initialData={initialData} />;
}
