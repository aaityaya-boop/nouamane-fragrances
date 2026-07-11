import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const latestOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ order: latestOrder });
  } catch (error) {
    console.error('Error fetching latest order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
