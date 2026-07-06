import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: 'Code promo invalide ou expiré' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type: promo.type,
      value: promo.value,
      code: promo.code
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 });
  }
}
