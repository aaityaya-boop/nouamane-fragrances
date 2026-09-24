import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nay-fragrances-ambassador-super-secret-key-2026'
);

const COOKIE_NAME = 'ambassador_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAmbassadorToken(payload: { id: string; email: string; code: string; name: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyAmbassadorToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: string; email: string; code: string; name: string };
  } catch {
    return null;
  }
}

export async function getCurrentAmbassador() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyAmbassadorToken(token);
    if (!payload?.id) return null;

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: payload.id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        leadsList: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        clicks: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        payouts: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    return affiliate;
  } catch (err) {
    console.error('Error fetching current ambassador:', err);
    return null;
  }
}
