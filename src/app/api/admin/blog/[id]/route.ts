import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.has('admin_token')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        author: data.author,
        status: data.status,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        relatedProductSlugs: data.relatedProductSlugs || '[]',
      }
    });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.has('admin_token')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.blogPost.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
