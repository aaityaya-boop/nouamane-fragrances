import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, items, subtotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code promo requis' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode }
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: 'Code promo invalide ou inactif' }, { status: 400 });
    }

    // Check expiration
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Ce code promo a expiré' }, { status: 400 });
    }

    // Check max uses
    if (promo.maxUses && promo.usageCount >= promo.maxUses) {
      return NextResponse.json({ error: 'Ce code promo a atteint sa limite d\'utilisation' }, { status: 400 });
    }

    // Parse product IDs
    let parsedProductIds: number[] = [];
    if (promo.productIds) {
      try {
        parsedProductIds = JSON.parse(promo.productIds);
      } catch {
        parsedProductIds = [];
      }
    }

    // Check minimum order amount if subtotal provided
    if (promo.minOrderAmount && typeof subtotal === 'number' && subtotal < promo.minOrderAmount) {
      return NextResponse.json({
        error: `Ce code nécessite un panier minimum de ${promo.minOrderAmount} MAD (actuel: ${subtotal.toFixed(0)} MAD)`
      }, { status: 400 });
    }

    // Check specific products eligibility if items are provided
    if (promo.applicableScope === 'SPECIFIC_PRODUCTS' && parsedProductIds.length > 0 && Array.isArray(items) && items.length > 0) {
      const targetIds = new Set(parsedProductIds.map(Number));
      const hasEligibleProduct = items.some((item: any) => targetIds.has(Number(item.id)));
      
      if (!hasEligibleProduct) {
        return NextResponse.json({
          error: 'Ce code promo est uniquement valable sur une sélection de parfums qui ne sont pas dans votre panier.'
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      applicableScope: promo.applicableScope,
      productIds: parsedProductIds,
      minOrderAmount: promo.minOrderAmount,
      description: promo.description,
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ error: 'Erreur lors de la validation du code promo' }, { status: 500 });
  }
}
