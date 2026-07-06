import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const { id, stock } = await request.json();

    if (!id || stock === undefined) {
      return NextResponse.json({ error: 'Missing id or stock' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { 
        stock: Number(stock),
        inStock: Number(stock) > 0 
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
