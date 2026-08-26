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

    // Moroccan Phone Validation
    const rawPhone = customerPhone.replace(/\s+/g, '');
    const phoneRegex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;
    if (!phoneRegex.test(rawPhone)) {
      return NextResponse.json(
        { error: 'Numéro de téléphone invalide. Veuillez entrer un numéro marocain valide (ex: 06XXXXXXXX ou +2126XXXXXXXX).' },
        { status: 400 }
      );
    }
    // Normalize to 06XXXXXXXX format for consistency if it starts with +212 or 00212
    let normalizedPhone = rawPhone;
    if (normalizedPhone.startsWith('+212')) {
      normalizedPhone = '0' + normalizedPhone.slice(4);
    } else if (normalizedPhone.startsWith('00212')) {
      normalizedPhone = '0' + normalizedPhone.slice(5);
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

    // Fetch SKUs for items
    const itemsWithSKU = await Promise.all(
      items.map(async (item: any) => {
        try {
          if (!item.id) return item;
          const product = await prisma.product.findUnique({
            where: { id: item.id },
            select: { sku: true },
          });
          return {
            ...item,
            sku: product?.sku || null,
          };
        } catch (err) {
          return item;
        }
      })
    );

    const created = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone: normalizedPhone,
        shippingAddress,
        shippingCity,
        shippingPostalCode: shippingPostalCode || '',
        paymentMethod,
        items: JSON.stringify(itemsWithSKU),
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
