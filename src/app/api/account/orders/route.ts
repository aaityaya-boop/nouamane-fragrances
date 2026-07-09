import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nouamane_super_secret_key_2024'
);

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Find all orders linked to this customer's email OR their customer ID
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: payload.id as string },
          { customerEmail: payload.email as string }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
