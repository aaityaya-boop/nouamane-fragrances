import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ products: [] });
  }

  try {
    // SQLite doesn't support case-insensitive contains in Prisma easily,
    // so for a small catalog, we can fetch all or do a raw query.
    // For now, since the catalog is small, we'll fetch all and filter in memory.
    const allProducts = await prisma.product.findMany();
    const lowerQ = (q || '').toLowerCase();
    
    const products = allProducts.filter(p => 
      !lowerQ || 
      p.name.toLowerCase().includes(lowerQ) ||
      p.brandLabel.toLowerCase().includes(lowerQ) ||
      p.tags.toLowerCase().includes(lowerQ)
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
