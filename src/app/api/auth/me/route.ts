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
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Fetch full user details from DB
    const customer = await prisma.customer.findUnique({
      where: { id: payload.id as string }
    });

    if (!customer) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let wishlist = [];
    try {
      wishlist = JSON.parse(customer.wishlist);
    } catch(e) {}

    return NextResponse.json({
      authenticated: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        postalCode: customer.postalCode,
        wishlist: wishlist,
        role: payload.role
      }
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
