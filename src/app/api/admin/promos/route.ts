import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(promos);
  } catch (error) {
    console.error('Error fetching promos:', error);
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, type, value } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: 'Code, type and value are required' }, { status: 400 });
    }

    const newPromo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value)
      }
    });

    return NextResponse.json(newPromo);
  } catch (error: any) {
    console.error('Error creating promo:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This promo code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
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
