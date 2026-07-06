import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(affiliates);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const newAffiliate = await prisma.affiliate.create({
      data: {
        name: data.name,
        code: data.code,
        commissionRate: data.commissionRate || 10,
      }
    });

    return NextResponse.json(newAffiliate);
  } catch (error) {
    console.error('Error creating affiliate:', error);
    return NextResponse.json({ error: 'Failed to create affiliate' }, { status: 500 });
  }
}
