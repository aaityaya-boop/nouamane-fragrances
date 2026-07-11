import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  if (!ids) {
    return NextResponse.json({ products: [] });
  }

  const idArray = ids.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));

  if (idArray.length === 0) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        id: { in: idArray }
      }
    });

    // Sort products based on the order of idArray
    const sortedProducts = idArray.map(id => products.find(p => p.id === id)).filter(Boolean);

    return NextResponse.json({ products: sortedProducts });
  } catch (error) {
    console.error('Recent products error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
