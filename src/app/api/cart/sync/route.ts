import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, items, totalValue, customerId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    if (items.length === 0) {
      // If cart is cleared, we update it to empty
      await prisma.liveCartSession.upsert({
        where: { sessionId },
        update: {
          items: '[]',
          totalValue: 0,
          lastActivity: new Date(),
          ...(customerId ? { customerId } : {})
        },
        create: {
          sessionId,
          items: '[]',
          totalValue: 0,
          ...(customerId ? { customerId } : {})
        }
      });
      return NextResponse.json({ success: true });
    }

    const itemsJson = JSON.stringify(items);

    await prisma.liveCartSession.upsert({
      where: { sessionId },
      update: {
        items: itemsJson,
        totalValue: totalValue || 0,
        lastActivity: new Date(),
        ...(customerId ? { customerId } : {})
      },
      create: {
        sessionId,
        items: itemsJson,
        totalValue: totalValue || 0,
        ...(customerId ? { customerId } : {})
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
