import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * POST /api/orders — Create a new order.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      paymentMethod,
      items,
      subtotal,
      shippingCost,
      total,
      promoCode,
      discount,
    } = body;

    // Basic validation
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !shippingAddress ||
      !shippingCity ||
      !paymentMethod ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate order number: NF-<timestamp base36>-<random>
    const orderNumber = `NF-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      Math.random() * 900 + 100
    )}`;

    // Check for Affiliate Cookie
    const cookieStore = await cookies();
    const affiliateRef = cookieStore.get('affiliate_ref')?.value;
    
    // Calculate Commission (fetch affiliate to get rate)
    let affiliate = null;
    let commission = 0;
    if (affiliateRef) {
      affiliate = await prisma.affiliate.findUnique({ where: { code: affiliateRef } });
      if (affiliate) {
        commission = Number(total) * (affiliate.commissionRate / 100);
      }
    }

    const created = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingPostalCode: shippingPostalCode || '',
        paymentMethod,
        items: JSON.stringify(items),
        subtotal: Number(subtotal),
        shippingCost: Number(shippingCost),
        total: Number(total),
        promoCode: promoCode || null,
        discount: discount ? Number(discount) : null,
        status: 'pending',
        affiliateCode: affiliate ? affiliate.code : null,
      }
    });

    // Update Affiliate Stats
    if (affiliate) {
      await prisma.affiliate.update({
        where: { code: affiliate.code },
        data: {
          sales: { increment: 1 },
          revenueGenerated: { increment: Number(total) },
          commissionEarned: { increment: commission }
        }
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber: created.orderNumber,
      id: created.id,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
