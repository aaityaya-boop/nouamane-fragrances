import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Parse productIds for each promo if present
    const formatted = promos.map(p => {
      let parsedProductIds: number[] = [];
      if (p.productIds) {
        try {
          parsedProductIds = JSON.parse(p.productIds);
        } catch {
          parsedProductIds = [];
        }
      }
      return {
        ...p,
        productIds: parsedProductIds,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching promos:', error);
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      code,
      type,
      value,
      applicableScope = 'ALL',
      productIds = [],
      minOrderAmount,
      maxUses,
      expiresAt,
      description,
      isActive = true,
    } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: 'Le code, le type et la valeur sont obligatoires' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) {
      return NextResponse.json({ error: 'Code invalide' }, { status: 400 });
    }

    const normalizedScope = applicableScope === 'SPECIFIC_PRODUCTS' ? 'SPECIFIC_PRODUCTS' : 'ALL';
    const cleanProductIds = Array.isArray(productIds) ? productIds.map(Number).filter(id => !isNaN(id)) : [];

    if (normalizedScope === 'SPECIFIC_PRODUCTS' && cleanProductIds.length === 0) {
      return NextResponse.json({ error: 'Veuillez sélectionner au moins un produit pour ce code promo ciblé' }, { status: 400 });
    }

    const newPromo = await prisma.promoCode.create({
      data: {
        code: cleanCode,
        type,
        value: parseFloat(value),
        applicableScope: normalizedScope,
        productIds: normalizedScope === 'SPECIFIC_PRODUCTS' ? JSON.stringify(cleanProductIds) : null,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        description: description ? description.trim() : null,
        isActive: Boolean(isActive),
      }
    });

    return NextResponse.json({
      ...newPromo,
      productIds: cleanProductIds,
    });
  } catch (error: any) {
    console.error('Error creating promo:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce code promo existe déjà' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur lors de la création du code promo' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isActive, applicableScope, productIds, value, type, minOrderAmount } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (applicableScope) updateData.applicableScope = applicableScope;
    if (Array.isArray(productIds)) updateData.productIds = JSON.stringify(productIds.map(Number));
    if (value !== undefined) updateData.value = parseFloat(value);
    if (type) updateData.type = type;
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount ? parseFloat(minOrderAmount) : null;

    const updated = await prisma.promoCode.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating promo:', error);
    return NextResponse.json({ error: 'Failed to update promo' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.promoCode.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promo:', error);
    return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 });
  }
}
