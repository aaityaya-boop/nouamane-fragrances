import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slugs = searchParams.get('slugs');

  if (!slugs) {
    return NextResponse.json({ products: [] });
  }

  const slugArray = slugs.split(',').filter(Boolean);

  if (slugArray.length === 0) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        slug: { in: slugArray }
      }
    });

    // Sort products based on the order of slugArray
    const sortedProducts = slugArray.map(slug => products.find(p => p.slug === slug)).filter(Boolean);

    return NextResponse.json({ products: sortedProducts });
  } catch (error) {
    console.error('Wishlist products error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
