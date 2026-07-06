import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, customerName, city, total } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Logic for Stock update
    if (status) {
      const oldStatus = currentOrder.status;
      const newStatus = status;

      if (oldStatus !== 'delivered' && newStatus === 'delivered') {
        // Withdraw stock
        const items = JSON.parse(currentOrder.items || '[]');
        for (const item of items) {
          const productSlug = item.product?.slug || item.slug;
          const qty = item.quantity || 1;
          if (productSlug) {
            const p = await prisma.product.findUnique({ where: { slug: productSlug } });
            if (p) {
              const newStock = Math.max(0, p.stock - qty);
              await prisma.product.update({
                where: { id: p.id },
                data: { stock: newStock, inStock: newStock > 0 },
              });
            }
          }
        }
      } else if (oldStatus === 'delivered' && (newStatus === 'returned' || newStatus === 'refused')) {
        // Restore stock
        const items = JSON.parse(currentOrder.items || '[]');
        for (const item of items) {
          const productSlug = item.product?.slug || item.slug;
          const qty = item.quantity || 1;
          if (productSlug) {
            const p = await prisma.product.findUnique({ where: { slug: productSlug } });
            if (p) {
              const newStock = p.stock + qty;
              await prisma.product.update({
                where: { id: p.id },
                data: { stock: newStock, inStock: newStock > 0 },
              });
            }
          }
        }
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(customerName && { customerName }),
        ...(city && { shippingCity: city }),
        ...(total !== undefined && { total: Number(total) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating admin order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
